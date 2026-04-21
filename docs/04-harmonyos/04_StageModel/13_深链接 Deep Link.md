# 深链接 Deep Link

> Deep Link 允许外部直接跳转到应用指定页面。

---

## 1. Deep Link 概述

### 1.1 概念

Deep Link 通过 URI 直接启动应用并跳转到指定页面，类似于 Android 的 Deep Link。

### 1.2 使用场景

- 分享链接直接打开商品详情页
- 消息推送点击跳转到对应页面
- 外部应用跳转到指定功能

---

## 2. 配置 Deep Link

### 2.1 module.json5 配置

```json5
"abilities": [
  {
    "name": "EntryAbility",
    "srcEntry": "./ets/entry/EntryAbility.ets",
    "launchType": "standard",
    "skills": [
      {
        "entities": ["entity.system.default"],
        "actions": [
          "action.system.home"
        ],
        "uris": [
          {
            "scheme": "myapp",
            "host": "detail",
            "pathPrefix": "/product"
          },
          {
            "scheme": "https",
            "host": "example.com",
            "pathPrefix": "/product"
          }
        ]
      }
    ]
  }
]
```

### 2.2 URI 匹配规则

```
完整 URI: myapp://detail/product/12345

- scheme: myapp  →  协议
- host:   detail → 主机
- pathPrefix: /product  → 路径前缀
- 额外部分: 12345  → 参数
```

---

## 3. 接收 Deep Link 参数

### 3.1 在 UIAbility 中接收

```typescript
class EntryAbility extends UIAbility {
    onWindowStageCreate(windowStage: window.WindowStage): void {
        windowStage.loadContent('pages/EntryPage', (err) => {
            // 获取 Want 中的参数
            let want = this.context.getWant()
            let uri = want.uri
            
            if (uri) {
                // 解析 URI
                let url = new URL(uri)
                let productId = url.pathname.split('/')[2]
                
                console.log('Deep Link:', productId)
            }
        })
    }
}
```

### 3.2 页面中接收

```typescript
@Entry
@Component
struct EntryPage {
    @State productId: string = ''

    aboutToAppear() {
        // 获取上下文中的 Want
        let want = context.getWant()
        let uri = want.uri
        
        if (uri) {
            let url = new URL(uri)
            this.productId = url.pathname.split('/')[2]
        }
    }

    build() {
        Column() {
            Text(`商品ID: ${this.productId}`)
                .fontSize(24fp)
            
            Button('查看商品详情')
                .onClick(() => {
                    // 查看商品详情
                })
        }
    }
}
```

---

## 4. 触发 Deep Link

### 4.1 代码触发

```typescript
// 通过 Want 触发
let want = {
    bundleName: 'com.example.app',
    abilityName: 'EntryAbility',
    uri: 'myapp://detail/product/12345'
}

context.startAbility(want)
```

### 4.2 HTML 链接

```html
<!-- 点击直接打开鸿蒙应用 -->
<a href="myapp://detail/product/12345">打开商品详情</a>
```

### 4.3 系统推送

```json5
// 推送消息中携带 Deep Link
{
  "title": "新商品推荐",
  "content": "点击查看商品",
  "deepLink": "myapp://detail/product/67890"
}
```

---

## 5. 面试高频考点

### Q1: Deep Link 的配置方式？

**回答**：在 module.json5 的 skills.uris 中配置 scheme/host/pathPrefix，外部通过 URI 启动应用。

### Q2: 如何获取 Deep Link 参数？

**回答**：在 UIAbility 或页面中通过 `context.getWant().uri` 获取 URI，然后解析获取参数。

---

> 🐱 **小猫提示**：Deep Link 记住 **"URI 跳转、skills.uris 配置、context.getWant().uri 获取参数"**。
