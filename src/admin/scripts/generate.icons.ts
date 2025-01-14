import path from 'node:path'
import process from 'node:process'
import { exec } from 'node:child_process'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { lookupCollection, lookupCollections } from '@iconify/json'

async function generateIcons() {
  // 拿到全部圖標集的原始數據
  const raw = await lookupCollections()

  let lastChoose = fs.readFileSync(path.resolve(process.cwd(), 'src/iconify/index.json'), 'utf-8')
  lastChoose = JSON.parse(lastChoose)

  // 取出可使用的圖標集數據用於 inquirer 選擇，並按名稱排序
  const collections = Object.entries(raw).map(([id, item]) => ({
    ...item,
    id,
  })).sort((a, b) => a.name.localeCompare(b.name))

  /**
   * 分別會在對應目錄下生成以下文件，其中(1)(3)用於離線下載並安裝圖標，(2)用於圖標選擇器使用
   * (1) src/iconify/index.json    記錄用戶 inquirer 的交互資訊
   * (2) src/iconify/data.json     包含多個圖標集數據，僅記錄圖標名
   * (3) public/icons/*-raw.json   多個圖標集的原始數據，獨立存放，用於離線使用
   */
  inquirer.prompt([
    {
      type: 'checkbox',
      message: '請選擇需要生成的圖標集',
      name: 'collections',
      choices: collections.map(item => ({
        name: `${item.name} (${item.total} icons)`,
        value: item.id,
      })),
      default: lastChoose.collections,
    },
    {
      type: 'confirm',
      name: 'isOfflineUse',
      message: '是否需要離線使用',
      default: false,
    },
  ]).then(async (answers) => {
    await fs.writeJSON(
      path.resolve(process.cwd(), 'src/iconify/index.json'),
      {
        collections: answers.collections,
        isOfflineUse: answers.isOfflineUse,
      },
    )

    const outputDir = path.resolve(process.cwd(), 'public/icons')
    await fs.ensureDir(outputDir)
    await fs.emptyDir(outputDir)

    const collectionsMeta: object[] = []
    for (const info of answers.collections) {
      const setData = await lookupCollection(info)

      collectionsMeta.push({
        prefix: setData.prefix,
        info: setData.info,
        icons: Object.keys(setData.icons),
      })

      const offlineFilePath = path.join(outputDir, `${info}-raw.json`)

      if (answers.isOfflineUse) {
        await fs.writeJSON(offlineFilePath, setData)
      }
    }

    await fs.writeJSON(
      path.resolve(process.cwd(), 'src/iconify/data.json'),
      collectionsMeta,
    )

    exec('eslint src/iconify/data.json src/iconify/index.json --cache --fix')
  })
}

generateIcons()
