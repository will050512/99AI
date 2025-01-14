export default {
  description: '創建全局狀態',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '請輸入模塊名稱',
      validate: (v) => {
        if (!v || v.trim === '') {
          return '模塊名稱不能為空'
        }
        else {
          return true
        }
      },
    },
  ],
  actions: () => {
    const actions = [
      {
        type: 'add',
        path: 'src/store/modules/{{camelCase name}}.ts',
        templateFile: 'plop-templates/store/index.hbs',
      },
    ]
    return actions
  },
}
