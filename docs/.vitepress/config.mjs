import { defineConfig } from 'vitepress'

// 官方自动生成侧边栏（不装插件、永不报错）
function getSidebar() {
  return [
    {
      text: '文档目录',
      items: [
        { text: '首页', link: '/' },
        // 你只要在这里按格式加文档就行
        // { text: '前端笔记', link: '/frontend' },
        // { text: '后端笔记', link: '/backend' },
      ]
    }
  ]
}

export default defineConfig({
  title: "我的知识库",
  description: "基于 VitePress 构建",

  // 本地调试必须是 /
  base: "/",

  themeConfig: {
    // 使用官方 sidebar
    sidebar: getSidebar(),

    // 顶部导航
    nav: [
      { text: '首页', link: '/' }
    ],

    // 右侧目录、暗黑模式
    outline: 'deep',
    darkMode: true,
  }
})