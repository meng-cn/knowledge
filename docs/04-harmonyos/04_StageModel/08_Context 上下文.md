# Context 上下文

> Context 是访问系统资源和能力的入口，分为 Application/Window/UIAbilityContext。

---

## 1. Context 分类

| Context 类型 | 作用域 | 创建时机 | 典型用途 |
|---|-|---|-|
| **ApplicationContext** | 应用全局 | Application 创建时 | 订阅公共事件、获取应用资源 |
| **UIAbilityContext** | 当前 UIAbility | UIAbility 创建时 | 页面跳转、开启弹窗、启动 Ability |
| **WindowContext** | 窗口 | 窗口创建时 | 窗口管理、布局控制 |

---

## 2. UIAbilityContext 详解

### 2.1 获取 Context

```typescript
// 在 UIAbility 中获取
import { UIAbility, context } from '@kit.AbilityKit'

class EntryAbility extends UIAbility {
    onCreate(): void {
        let uiAbilityContext = context.getUIAbilityContext(this)
        console.log('Context:', JSON.stringify(uiAbilityContext))
    }
}
```

### 2.2 主要方法

```typescript
class EntryAbility extends UIAbility {
    onCreate(): void {
        let context = this.context
        
        // 启动 Ability
        context.startAbility({
            bundleName: 'com.example.app',
            abilityName: 'TargetAbility'
        })
        
        // 订阅公共事件
        context.commonEventManager.subscribe({
            actionList: ['com.example.action']
        })
        
        // 获取应用信息
        let appInfo = context.getAppInfo()
        
        // 获取设备信息
        let deviceInfo = context.getDeviceCapability()
    }
}
```

---

## 3. ApplicationContext

### 3.1 获取与使用

```typescript
import { context } from '@kit.AbilityKit'

// 全局 ApplicationContext
let appContext = context.getApplicationContext()

// 获取应用资源
let resourceManager = appContext.resourceManager

// 订阅系统事件
appContext.commonEventManager.subscribe({
    actionList: ['system.time.change']
})

// 获取包名
let packageName = appContext.packageName
```

### 3.2 ApplicationContext 适用场景

```typescript
// 1. 订阅系统广播
appContext.commonEventManager.subscribe({
    actionList: ['system.power.battery.low']
}, (err, data) => {
    console.log('电量低:', data)
})

// 2. 获取应用元数据
let meta = appContext.getMetadata('app_meta')

// 3. 访问共享资源
let resource = appContext.resourceManager.getString('app_name')
```

---

## 4. WindowContext

### 4.1 获取与使用

```typescript
import { window } from '@kit.ArkUI'

// 获取当前窗口
let windowStage = this.windowStage
let window = windowStage.getMainWindow()
let windowContext = window.getUIContext()

// 窗口控制
windowContext.setPadding({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
})

// 设置窗口方向
windowContext.setOrientation(window.WindowOrientation.PORTRAIT)
```

---

## 5. Context 使用决策树

```
需要访问什么？
├─ 启动 Ability → UIAbilityContext
├─ 订阅事件 → ApplicationContext
├─ 窗口控制 → WindowContext
├─ 应用资源 → ApplicationContext
├─ 包信息 → ApplicationContext
└─ 页面跳转 → UIAbilityContext
```

---

## 6. 面试高频考点

### Q1: Context 有几种类型？

**回答**：三种——ApplicationContext（全局）、UIAbilityContext（当前 UIAbility）、WindowContext（窗口）。

### Q2: 启动 Ability 用哪个 Context？

**回答**：UIAbilityContext。通过 `context.startAbility(want)` 实现。

---

> 🐱 **小猫提示**：Context 记住 **"UIAbilityContext 启动/跳转、ApplicationContext 全局/事件、WindowContext 窗口控制"**。
