# PersistentStorage 持久化

> PersistentStorage 是持久化 UI 状态的机制，将数据写入磁盘。

---

## 1. PersistentStorage 概述

PersistentStorage 不是数据库，它是**持久化 UI 状态**的机制，将数据写入磁盘的 XML/Preferences 文件。

### 核心特点

| 特点 | 说明 |
|---|-|
| **不是数据库** | 不能存大量数据 |
| **异步写入** | 写入是异步的 |
| **UI 状态** | 存储用户偏好设置 |
| **影响性能** | 大量数据会影响 UI 启动 |
| **适用场景** | 简单用户偏好（主题、字体大小等） |

---

## 2. 基本用法

### 2.1 创建 PersistentStorage 实例

```typescript
// 创建持久化存储实例
let persistentStorage = new PersistentStorage('myPrefs')

// 设置值（异步写入）
await persistentStorage.set('theme', 'dark')
await persistentStorage.set('fontSize', 16)
await persistentStorage.set('isDarkMode', true)

// 获取值
let theme = await persistentStorage.get('theme', 'light')
let fontSize = await persistentStorage.get<number>('fontSize', 14)

// 删除
await persistentStorage.delete('fontSize')
```

---

## 3. @PersistentStorageProp / @PersistentStorageLink

### 3.1 @PersistentStorageProp

```typescript
@Component
struct ThemeSettings {
    // 自动从 PersistentStorage 读取并监听变化
    @PersistentStorageProp('appTheme') theme: string = 'light'

    build() {
        Text(`主题: ${this.theme}`)
    }
}
```

### 3.2 @PersistentStorageLink

```typescript
@Component
struct FontSettings {
    // 双向绑定持久化存储
    @PersistentStorageLink('fontSize') fontSize: number = 16

    build() {
        Slider({
            min: 10,
            max: 32,
            value: this.fontSize,
            step: 1
        })
        .onChange((value: number) => {
            this.fontSize = value  // 自动持久化
        })
    }
}
```

---

## 4. PersistentStorage vs Preferences

| 特性 | PersistentStorage | Preferences |
|---|-|--|
| **用途** | UI 状态持久化 | Key-Value 配置存储 |
| **数据量** | 少量（用户偏好） | 少量到中等 |
| **写入方式** | 异步 | 异步 |
| **装饰器** | @PersistentStorageProp/Link | 无（直接 API） |
| **适用场景** | UI 偏好设置 | 应用配置 |

### Preferences 对比

```typescript
// Preferences（更通用）
import { preferences } from '@kit.ArkUtils'

let store = await preferences.getPreferences(context, { name: 'myPrefs' })
await store.put('username', '小明')
let username = await store.get<string>('username', '')

// PersistentStorage（专门用于 UI 状态）
let ps = new PersistentStorage('myUIPrefs')
await ps.set('theme', 'dark')
```

---

## 5. 注意事项

### 5.1 不要存大量数据

```
❌ 错误：存大量数据
├─ 影响 UI 启动速度
├─ 阻塞主线程
└─ 可能卡死应用

✅ 正确：只存简单的用户偏好
├─ 主题（light/dark）
├─ 字体大小
├─ 是否开启通知
└─ 语言设置
```

### 5.2 初始化时机

```typescript
// ✅ 在 aboutToAppear 中初始化
@Entry
@Component
struct Index {
    @PersistentStorageLink('theme') theme: string = 'light'
    @PersistentStorageLink('fontSize') fontSize: number = 16

    aboutToAppear() {
        // PersistentStorage 在 aboutToAppear 时自动从磁盘加载
    }

    build() {
        // ...
    }
}
```

---

## 6. 面试高频考点

### Q1: PersistentStorage 是数据库吗？

**回答**：不是。是持久化 UI 状态（写入磁盘的 XML/Preferences），不能存大量数据，会卡死 UI 主线程。只能存简单的用户偏好设置。

### Q2: PersistentStorage 的写入方式？

**回答**：异步写入，但不建议在 build 中修改。适合简单的用户偏好设置（主题、字体大小等）。

---

> 🐱 **小猫提示**：PersistentStorage 记住 **"不是数据库、异步写入、只存简单用户偏好"**。
