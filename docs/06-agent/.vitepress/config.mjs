import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import { withMermaid } from 'vitepress-plugin-mermaid'

function getSidebarItems(dir, baseLink) {
  const items = []
  const fullPath = path.join(process.cwd(), 'docs', dir)
  if (!fs.existsSync(fullPath)) return items
  const files = fs.readdirSync(fullPath)
  files.forEach((file) => {
    const filePath = path.join(fullPath, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      if (file.startsWith('.') || file === 'node_modules') return
      const nextDir = path.posix.join(dir, file)
      const nextBaseLink = `${baseLink}${file}/`
      const subItems = getSidebarItems(nextDir, nextBaseLink)
      if (subItems.length > 0) {
        items.push({ text: file, collapsed: true, items: subItems })
      }
    } else if (file.endsWith('.md') && file !== 'index.md' && file !== 'README.md') {
      const fileName = file.replace('.md', '')
      const link = `${baseLink}${fileName}`.replace(/\\/g, '/')
      items.push({ text: fileName, link })
    }
  })
  items.sort((a, b) => {
    if (a.items && !b.items) return -1
    if (!a.items && b.items) return 1
    return a.text.localeCompare(b.text)
  })
  return items
}

export default withMermaid(
  defineConfig({
    title: "AI Agent 知识图谱",
    description: "AI Agent 全景知识文档 — 从入门到前沿",
    lang: "zh-CN",
    markdown: { mermaid: true },
    themeConfig: {
      sidebar: [
        {
          text: '知识体系',
          items: getSidebarItems('', '/')
        }
      ],
      nav: [
        { text: '首页', link: '/' },
        { text: '知识图谱', link: '/INDEX' },
        { text: '全景图', link: '/ch00-overview' }
      ],
      outline: 'deep',
      darkMode: true,
      search: { provider: 'local' },
      lastUpdated: true
    }
  })
)
