import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "我的知识库",
  description: "VitePress 文档站",

  // 👇 这一行是重点！自动适配本地 / 线上
  base: process.env.GITHUB_ACTION ? '/knowledge/' : '/',

  themeConfig: {
    sidebar: [
      { text: '首页', link: '/' }
    ],
    nav: [
      { text: '首页', link: '/' }
    ],
    outline: 'deep',
    darkMode: true
  }
})