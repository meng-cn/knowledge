import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

/**
 * Recursively generates sidebar items from a directory
 * @param {string} dir - The directory path relative to the docs root
 * @param {string} baseLink - The base link prefix for the sidebar items
 */
function getSidebarItems(dir, baseLink) {
  const items = []
  // Use path.join for file system operations
  const fullPath = path.join(process.cwd(), 'docs', dir)

  if (!fs.existsSync(fullPath)) {
    return items
  }

  const files = fs.readdirSync(fullPath)

  files.forEach((file) => {
    const filePath = path.join(fullPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip hidden directories or node_modules
      if (file.startsWith('.') || file === 'node_modules') return

      // Ensure path separators are forward slashes for URL consistency
      const nextDir = path.posix.join(dir, file)
      const nextBaseLink = `${baseLink}${file}/`
      
      const subItems = getSidebarItems(nextDir, nextBaseLink)
      if (subItems.length > 0) {
        items.push({
          text: file.charAt(0).toUpperCase() + file.slice(1), // Capitalize folder name
          collapsed: false, // Set to true if you want folders collapsed by default
          items: subItems
        })
      }
    } else if (file.endsWith('.md')) {
      // Skip index.md as it's usually the folder's main page, handled separately or implicitly
      if (file === 'index.md') return

      const fileName = file.replace('.md', '')
      // Ensure link uses forward slashes
      const link = `${baseLink}${fileName}`.replace(/\\/g, '/')
      
      items.push({
        text: fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/-/g, ' '), // Format file name
        link: link
      })
    }
  })

  // Sort items: folders first, then files, alphabetically
  items.sort((a, b) => {
    if (a.items && !b.items) return -1
    if (!a.items && b.items) return 1
    return a.text.localeCompare(b.text)
  })

  return items
}

export default defineConfig({
  title: "我的知识库",
  description: "VitePress 文档站",

  // 👇 这一行是重点！自动适配本地 / 线上
  base: process.env.GITHUB_ACTION ? '/' : '/',

  markdown: {
    html: false,  // 禁用 HTML 解析
  },

  themeConfig: {
    // Generate sidebar dynamically
    sidebar: [
      {
        text: 'Documents',
        items: getSidebarItems('', '/')
      }
    ],
    nav: [
      { text: '首页', link: '/' }
    ],
    outline: 'deep',
    darkMode: true
  }
})