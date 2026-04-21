# Router 页面路由

> Router 是旧版页面路由方案，通过 API 管理页面栈。

---

## 1. Router 基本用法

### 1.1 页面跳转

```typescript
import { router } from '@kit.ArkUI'

// 跳转到指定页面
router.pushUrl({
    url: 'pages/DetailPage',
    params: {
        id: '12345',
        title: '详情页'
    }
}).then(() => {
    console.log('跳转成功')
}).catch((err) => {
    console.error('跳转失败:', err.message)
})

// 替换当前页面
router.replaceUrl({
    url: 'pages/NewPage'
})

// 返回上一页
router.back()

// 返回指定层级
router.back({
    url: 'pages/OriginPage',
    count: 2
})

// 清空页面栈并跳转
router.clear({
    url: 'pages/HomePage'
})
```

### 1.2 页面传参

```typescript
// 发送方
router.pushUrl({
    url: 'pages/DetailPage',
    params: {
        userId: '12345',
        userName: '小明',
        avatar: $r('app.media.avatar')
    }
})

// 接收方（DetailPage.ets）
@Entry
@Component
struct DetailPage {
    @Prop userId: string = ''
    @Prop userName: string = ''
    @Prop avatar: Resource = $r('app.media.default')

    build() {
        Column() {
            Image(this.avatar).width(60).height(60).borderRadius(30)
            Text(`用户: ${this.userName}`)
                .fontSize(20fp)
            Text(`ID: ${this.userId}`)
                .fontSize(16fp)
        }
    }
}
```

---

## 2. Router 的限制

| 限制 | 说明 |
|---|-|
| 不支持分栏 | 折叠屏/平板适配困难 |
| 动效有限 | 只有淡入淡出 |
| 页面管理弱 | 无 NavPathStack |
| 官方推荐度低 | Navigation 替代方案 |

---

## 3. Router 使用建议

```
新项目 → Navigation（推荐）
旧项目  → Router（逐步迁移到 Navigation）
折叠屏 → Navigation（必须）
简单页面 → Router（可以接受）
```

---

## 4. 面试高频考点

### Q1: Router 和 Navigation 的区别？

**回答**：Router 是旧方案，通过 API 管理页面栈；Navigation 是组件级路由，支持分栏、自定义动效、NavPathStack 管理。官方推荐 Navigation。

### Q2: Router 如何返回指定页面？

**回答**：`router.back({ url: 'pages/OriginPage', count: 2 })` 或 `router.replaceUrl()` 替换当前页面。

---

> 🐱 **小猫提示**：Router 记住 **"旧方案、API 管理页面栈、简单够用"**。新项目用 Navigation。
