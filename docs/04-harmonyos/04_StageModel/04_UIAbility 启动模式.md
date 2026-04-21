# UIAbility 启动模式

> UIAbility 的三种启动模式：Singleton、Standard、Specified，控制实例创建策略。

---

## 1. 启动模式概览

| 模式 | 说明 | 行为 | Android 对标 |
|---|-|-|-|
| **Singleton** (默认) | 单实例 | 始终复用唯一实例 | SingleTask |
| **Standard** | 多实例 | 每次创建新实例 | Standard |
| **Specified** | 指定实例 | 启动指定实例 | 无 |

---

## 2. Singleton — 单实例（默认）

### 2.1 行为

```
第一次启动 → 创建新实例
后续启动 → 复用已有实例（调用 onForeground）
```

### 2.2 配置

```json5
"abilities": [
  {
    "name": "EntryAbility",
    "srcEntry": "./ets/entry/EntryAbility.ets",
    "launchType": "singleton",  // 默认值，可省略
    ...
  }
]
```

### 2.3 使用场景

- 首页入口
- 主界面
- 只有一个实例的场景

---

## 3. Standard — 多实例

### 3.1 行为

```
每次启动 → 创建新实例
可以存在多个同时运行的实例
```

### 3.2 配置

```json5
"abilities": [
  {
    "name": "FeatureAbility",
    "srcEntry": "./ets/feature/FeatureAbility.ets",
    "launchType": "standard",  // 多实例
    ...
  }
]
```

### 3.3 使用场景

- 聊天会话（每个会话独立窗口）
- 浏览器标签页
- 需要多实例并行的场景

---

## 4. Specified — 指定实例

### 4.1 行为

```
启动时通过 Want 指定目标实例
找到 → 启动目标实例的 onForeground
未找到 → 创建新实例
```

### 4.2 配置

```json5
"abilities": [
  {
    "name": "FeatureAbility",
    "srcEntry": "./ets/feature/FeatureAbility.ets",
    "launchType": "specified",
    ...
  }
]
```

### 4.3 使用场景

- 需要精确控制启动哪个实例
- 特定功能的独立入口

---

## 5. 启动模式对比

### 5.1 实例管理

```
Singleton:
├─ 全局只有 1 个实例
├─ 多次启动只调用 onForeground
└─ 最省内存

Standard:
├─ 可存在多个实例
├─ 每次启动创建新实例
└─ 每个实例独立生命周期

Specified:
├─ 精确指定目标实例
├─ 未找到则创建新实例
└─ 灵活的实例管理
```

### 5.2 内存占用

```
Singleton < Specified < Standard

Singleton：始终只有 1 个实例，内存占用最小
Standard：每次启动新增实例，内存占用最大
```

---

## 6. 启动模式实战

### 6.1 不同模式下的行为对比

```typescript
// 用户启动 App 3 次

// Singleton 模式：
// 第1次：onCreate → onWindowStageCreate → onForeground
// 第2次：只触发 onForeground（复用第1次的实例）
// 第3次：只触发 onForeground

// Standard 模式：
// 第1次：onCreate → onWindowStageCreate → onForeground
// 第2次：onCreate → onWindowStageCreate → onForeground（新实例）
// 第3次：onCreate → onWindowStageCreate → onForeground（新实例）

// Specified 模式：
// 第1次：onCreate → onWindowStageCreate → onForeground
// 第2次：onCreate → onWindowStageCreate → onForeground（新实例）
// 第3次：通过 Want 指定目标，可能复用或创建
```

---

## 7. 面试高频考点

### Q1: UIAbility 的启动模式有哪些？

**回答**：三种——Singleton（单实例，默认）、Standard（多实例）、Specified（指定实例）。

### Q2: Singleton 模式下多次启动会怎样？

**回答**：只会触发 onForeground，复用已有实例，不会再次 onCreate。

### Q3: Standard 和 Singleton 的区别？

**回答**：Standard 每次启动创建新实例，可存在多个；Singleton 始终复用唯一实例，最省内存。

---

> 🐱 **小猫提示**：启动模式记住 **"Singleton 单实例（默认）、Standard 多实例、Specified 指定实例"**。面试必考。
