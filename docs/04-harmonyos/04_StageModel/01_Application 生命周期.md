# Application 生命周期

> HarmonyOS 应用从启动到销毁的完整生命周期。

---

## 1. 应用层级结构

```
Application（应用）
    ↓
AbilityStage（Ability 阶段）
    ↓
UIAbility（UI 应用组件）
    ↓
ExtensionAbility（扩展组件）
```

---

## 2. Application 生命周期

### 2.1 Application 的职责

Application 是应用的全局入口，管理应用级的全局数据和状态。

```typescript
// entry/src/main/ets/application/Application.ets
import { UIAbility, Want } from '@kit.AbilityKit'

class MyApplication extends UIAbility {
    // 应用创建时调用
    onCreate(want: Want): void {
        console.log('Application onCreate')
        // 初始化全局资源
    }

    // 应用销毁时调用
    onDestroy(): void {
        console.log('Application onDestroy')
        // 清理全局资源
    }

    // 应用进入前台
    onWindowStageCreate(windowStage: window.WindowStage): void {
        console.log('Application onWindowStageCreate')
    }

    // 应用进入后台
    onWindowStageDestroy(): void {
        console.log('Application onWindowStageDestroy')
    }
}

export default new MyApplication()
```

### 2.2 Application 生命周期方法

| 方法 | 触发时机 |
|---|-|
| `onCreate(want)` | 应用创建时 |
| `onDestroy()` | 应用销毁时 |
| `onWindowStageCreate(windowStage)` | 第一个窗口阶段创建时 |
| `onWindowStageDestroy()` | 最后一个窗口阶段销毁时 |

---

## 3. AbilityStage 生命周期

### 3.1 AbilityStage 的职责

AbilityStage 管理同一 HAP 包中所有 Ability 的共享数据。

```typescript
// entry/src/main/ets/application/AbilityStage.ets
import { UIAbility } from '@kit.AbilityKit'

class MyAbilityStage extends UIAbility {
    // 模块首次加载时调用
    onCreate(): void {
        console.log('AbilityStage onCreate')
        // 初始化模块级共享数据
    }

    onDestroy(): void {
        console.log('AbilityStage onDestroy')
    }
}

export default new MyAbilityStage()
```

### 3.2 AbilityStage vs Application

| 特性 | AbilityStage | Application |
|---|-|-|
| **作用域** | HAP 包内所有 Ability | 整个应用 |
| **创建时机** | 模块首次加载 | 应用启动 |
| **共享范围** | 同一 HAP 包 | 全局 |

---

## 4. 生命周期时序

```
用户点击应用图标
    ↓
Application.onCreate()
    ↓
AbilityStage.onCreate()
    ↓
UIAbility.onCreate()
    ↓
UIAbility.onWindowStageCreate()
    ↓
UIAbility.onForeground()  ← 应用进入前台
    ↓
UIAbility.onBackground()  ← 应用进入后台
    ↓
UIAbility.onWindowStageDestroy()
    ↓
UIAbility.onDestroy()
    ↓
AbilityStage.onDestroy()
    ↓
Application.onDestroy()
```

---

## 5. 面试高频考点

### Q1: Application 的生命周期方法？

**回答**：onCreate（创建）、onDestroy（销毁）、onWindowStageCreate（窗口创建）、onWindowStageDestroy（窗口销毁）。

### Q2: AbilityStage vs Application 的区别？

**回答**：AbilityStage 管理同一 HAP 包内所有 Ability 的共享数据（模块级），Application 管理整个应用的全局数据（应用级）。

---

> 🐱 **小猫提示**：Application 生命周期记住 **"onCreate → onWindowStageCreate → onForeground → onBackground → onWindowStageDestroy → onDestroy"**。
