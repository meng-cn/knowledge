# 跨 Ability 通信

> 通过 startAbility/stopAbility/ Want 在 Ability 间跳转和通信。

---

## 1. Ability 间通信方式

| 方式 | 说明 | 适用场景 |
|---|-|-|
| **startAbility** | 启动目标 Ability | 页面跳转 |
| **startAbilityForResult** | 启动并获取返回结果 | 获取回调数据 |
| **stopAbility** | 停止目标 Ability | 关闭 Ability |
| **commonEvent** | 发布订阅事件 | 跨 Ability 通知 |
| **Want** | 意图载体 | 传递参数 |

---

## 2. startAbility — 启动

```typescript
// 启动同应用 Ability
let want = {
    bundleName: context.packageName,
    abilityName: 'TargetAbility',
    parameters: {
        action: 'getData',
        userId: '12345'
    }
}

context.startAbility(want).then(() => {
    console.log('启动成功')
}).catch((err: BusinessError) => {
    console.error('启动失败:', err.message)
})
```

### 2.1 跨应用启动

```typescript
// 启动其他应用 Ability（需配置权限）
let want = {
    bundleName: 'com.other.app',
    abilityName: 'OtherAbility',
    parameters: {
        sharedData: 'Hello from another app'
    }
}

context.startAbility(want)
```

### 2.2 跳转到系统页面

```typescript
// 跳转到设置页
let want = {
    bundleName: 'com.huawei.system',
    abilityName: 'SettingsAbility'
}
context.startAbility(want)

// 跳转到相机
let want = {
    bundleName: 'com.huawei.camera',
    abilityName: 'CameraAbility'
}
context.startAbility(want)
```

---

## 3. startAbilityForResult — 获取返回

```typescript
// 发送方
let want = {
    bundleName: context.packageName,
    abilityName: 'TargetAbility',
    parameters: {
        action: 'getSelectedData'
    }
}

// 启动并等待返回
context.startAbilityForResult(want).then((result: Want) => {
    let selectedData = result.want?.parameters['selectedData']
    console.log('收到返回:', selectedData)
}).catch((err: BusinessError) => {
    console.error('启动失败:', err.message)
})

// 接收方（TargetAbility）
onWindowStageCreate(windowStage: window.WindowStage): void {
    windowStage.loadContent('pages/TargetPage', (err) => {
        // 页面中返回结果
        let resultWant = {
            bundleName: context.packageName,
            abilityName: 'SourceAbility',
            parameters: {
                selectedData: '返回的数据'
            }
        }
        context.returnAbilityResult(resultWant)
    })
}
```

---

## 4. stopAbility — 停止

```typescript
// 停止目标 Ability
let want = {
    bundleName: context.packageName,
    abilityName: 'TargetAbility'
}

context.stopAbility(want).then(() => {
    console.log('Ability 已停止')
}).catch((err: BusinessError) => {
    console.error('停止失败:', err.message)
})
```

### 4.1 停止自身

```typescript
// 停止当前 Ability
context.terminateSelf().then(() => {
    console.log('当前 Ability 已停止')
}).catch((err: BusinessError) => {
    console.error('停止失败:', err.message)
})
```

---

## 5. Ability 间通信流程

```
Ability A                          Ability B
    │                                  │
    │── startAbility(want) ──────────→│
    │   bundleName: A                  │ 接收 Want
    │   abilityName: B                 │→ onCreate(want)
    │   parameters: {...}              │→ 处理参数
    │                                  │→ 执行逻辑
    │←─ returnAbilityResult ───────────│
    │   selectedData: xxx              │
    │                                  │
    │←── stopAbility(want) ───────────│
    │                                  │→ onDestroy()
```

---

## 6. 面试高频考点

### Q1: Ability 间如何传递数据？

**回答**：通过 Want 的 parameters 属性传递参数。可以使用 startAbilityForResult 获取返回结果。

### Q2: 如何跨应用跳转？

**回答**：在 Want 中指定目标应用的 bundleName 和 abilityName，并在 module.json5 中配置 permissions 权限。

---

> 🐱 **小猫提示**：跨 Ability 通信记住 **"startAbility 启动、parameters 传参、startAbilityForResult 获取返回"**。
