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
  description: '創建組件',
  prompts: [
    {
      type: 'confirm',
      name: 'isGlobal',
      message: '是否為全局組件',
      default: false,
    },
    {
      type: 'list',
      name: 'path',
      message: '請選擇組件創建目錄',
      choices: getFolder('src/views'),
      when: (answers) => {
        return !answers.isGlobal
      },
    },
    {
      type: 'input',
      name: 'name',
      message: '請輸入組件名稱',
      validate: (v) => {
        if (!v || v.trim === '') {
          return '組件名稱不能為空'
        }
        else {
          return true
        }
      },
    },
  ],
  actions: (data) => {
    let path = ''
    if (data.isGlobal) {
      path = 'src/components/{{properCase name}}/index.vue'
    }
    else {
      path = `${data.path}/components/{{properCase name}}/index.vue`
    }
    const actions = [
      {
        type: 'add',
        path,
        templateFile: 'plop-templates/component/index.hbs',
      },
    ]
    return actions
  },
}
