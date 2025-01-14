import path from 'node:path'
import fs from 'node:fs'

function getFolder(path) {
  const components = []
  const files = fs.readdirSync(path)
  files.forEach((item) => {
    const stat = fs.lstatSync(`${path}/${item}`)
    if (stat.isDirectory() === true && item !== 'components') {
      components.push(`${path}/${item}`)
      components.push(...getFolder(`${path}/${item}`))
    }
  })
  return components
}

export default {
  description: '創建頁面',
  prompts: [
    {
      type: 'list',
      name: 'path',
      message: '請選擇頁面創建目錄',
      choices: getFolder('src/views'),
    },
    {
      type: 'input',
      name: 'name',
      message: '請輸入文件名',
      validate: (v) => {
        if (!v || v.trim === '') {
          return '文件名不能為空'
        }
        else {
          return true
        }
      },
    },
    {
      type: 'confirm',
      name: 'isFilesystem',
      message: '是否為基於文件系統的路由頁面',
      default: false,
    },
  ],
  actions: (data) => {
    const relativePath = path.relative('src/views', data.path)
    const actions = [
      {
        type: 'add',
        path: `${data.path}/{{dotCase name}}.vue`,
        templateFile: 'plop-templates/page/index.hbs',
        data: {
          componentName: `${relativePath} ${data.name}`,
        },
      },
    ]
    return actions
  },
}
