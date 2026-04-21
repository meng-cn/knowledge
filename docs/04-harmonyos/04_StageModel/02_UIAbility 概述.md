# UIAbility 概述

> UIAbility 是鸿蒙 Stage 模型中最重要的应用组件，相当于 Android 的 Activity。

---

## 1. UIAbility 概念

### 1.1 什么是 UIAbility

UIAbility 是**包含 UI 的应用组件**，是系统调度的基本单元，对应手机上的一个任务窗口。

### 1.2 核心特征

| 特征 | 说明 |
|---|-|
| **UI 组件** | 包含界面，可交互 |
| **调度单元** | 系统调度的基本单位 |
| **多实例** | 一个应用可以有多个 UIAbility |
| **生命周期** | 独立的生命周期管理 |
| **启动模式** | Singleton/Standard/Specified |

---

## 2. UIAbility vs Android Activity

| 维度 | Android Activity | HarmonyOS UIAbility |
|---|---|-|
| **作用** | 界面组件 | 界面组件 |
| **应用模型** | Manifest（声明式） | Stage 模型（声明式） |
| **进程** | 可同进程/多进程 | 每个 UIAbility 独立进程 |
| **启动模式** | SingleTop/SingleTask 等 | Singleton/Standard/Specified |
| **通信** | Intent/Bundle | Want/Parameter |
| **生命周期** | onCreate/onStart/onResume 等 | onCreate/onWindowStageCreate/onForeground 等 |
| **多实例** | 支持 | 支持（Standard） |

---

## 3. UIAbility 的核心方法

### 3.1 onCreate — 创建

```typescript
onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    console.log('UIAbility onCreate, want:', JSON.stringify(want))
    // 1. 初始化 UIAbility 需要的资源
    // 2. 读取 want 中的参数
    // 3. 设置初始化数据
}
```

### 3.2 onWindowStageCreate — 窗口创建

```typescript
onWindowStageCreate(windowStage: window.WindowStage): void {
    // 1. 加载页面
    windowStage.loadContent('pages/Index', (err) => {
        if (err.code) {
            console.error('loadContent failed, code: ' + err.code + ', msg: ' + err.message)
            return
        }
        console.log('loadContent success')
    })
}
```

### 3.3 onForeground — 进入前台

```typescript
onForeground(): void {
    console.log('UIAbility onForeground')
    // 应用进入前台时的逻辑
    // 1. 刷新 UI
    // 2. 重新获取数据
    // 3. 恢复任务
}
```

### 3.4 onBackground — 进入后台

```typescript
onBackground(): void {
    console.log('UIAbility onBackground')
    // 应用进入后台时的逻辑
    // 1. 保存状态
    // 2. 暂停任务
    // 3. 释放资源
}
```

### 3.5 onWindowStageDestroy — 窗口销毁

```typescript
onWindowStageDestroy(): void {
    console.log('UIAbility onWindowStageDestroy')
    // 清理窗口相关资源
}
```

### 3.6 onDestroy — 销毁

```typescript
onDestroy(): void {
    console.log('UIAbility onDestroy')
    // 清理所有资源
}
```

---

## 4. UIAbility 的配置

### 4.1 module.json5 配置

```json5
{
  "module": {
    "name": "entry",
    "type": "entry",
    "description": "$string:module_desc",
    "mainElement": "EntryAbility",
    "deviceTypes": ["phone", "tablet"],
    "deliveryWithInstall": true,
    "installationFree": false,
    "pages": "$profile:main_pages",
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entry/EntryAbility.ets",
        "description": "主页面",
        "icon": "$media:icon",
        "label": "$string:EntryAbility_label",
        "startWindowIcon": "$media:icon",
        "startWindowBackground": "$color:start_window_background",
        "exported": true,
        "skills": [
          {
            "entities": ["entity.system.home"],
            "actions": ["action.system.home"]
          }
        ],
        "orientation": "unspecified",
        "launchType": "standard"  // 启动模式：singleton/standard/specified
      }
    ]
  }
}
```

---

## 5. UIAbility 的启动流程

```
用户点击应用图标 / 收到 Deep Link
    ↓
系统检查是否有运行中的 UIAbility
    ↓
├─ 有 → 根据 launchType 决定
│   ├─ Singleton → 复用现有实例
│   ├─ Standard → 创建新实例
│   └─ Specified → 使用指定的实例
└─ 无 → 创建新实例
    ↓
UIAbility.onCreate()
    ↓
UIAbility.onWindowStageCreate()
    ↓
UIAbility.onForeground()
```

---

## 6. 多 UIAbility 的应用

### 6.1 场景

- **多窗口支持**：每个 UIAbility 对应一个窗口
- **功能拆分**：不同功能用不同 UIAbility
- **后台服务**：非 UI 的 Ability 处理后台任务

### 6.2 示例

```json5
"abilities": [
  {
    "name": "EntryAbility",
    "srcEntry": "./ets/entry/EntryAbility.ets",
    "launchType": "standard"
  },
  {
    "name": "FeatureAbility",
    "srcEntry": "./ets/feature/FeatureAbility.ets",
    "launchType": "standard",
    "description": "功能模块"
  }
]
```

---

## 7. 面试高频考点

### Q1: UIAbility 是什么？相当于 Android 的什么？

**回答**：UIAbility 是包含 UI 的应用组件，是系统调度的基本单元。相当于 Android 的 Activity。

### Q2: UIAbility 的生命周期方法？

**回答**：onCreate（创建）→ onWindowStageCreate（窗口创建）→ onForeground（前台）→ onBackground（后台）→ onWindowStageDestroy（窗口销毁）→ onDestroy（销毁）。

### Q3: 一个应用可以有多个 UIAbility 吗？

**回答**：可以。一个 Entry Ability 作为主入口，其他 Feature Ability 作为独立功能模块。

---

> 🐱 **小猫提示**：UIAbility 记住 **"包含 UI、系统调度单元、类似 Activity、多实例支持"**。生命周期是面试必考。
