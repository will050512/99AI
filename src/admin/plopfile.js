import { promises as fs } from 'node:fs'

export default async function (plop) {
  plop.setWelcomeMessage('請選擇需要創建的模式：')
  const items = await fs.readdir('./plop-templates')
  for (const item of items) {
    const stat = await fs.lstat(`./plop-templates/${item}`)
    if (stat.isDirectory()) {
      const prompt = await import(`./plop-templates/${item}/prompt.js`)
      plop.setGenerator(item, prompt.default)
    }
  }
}
