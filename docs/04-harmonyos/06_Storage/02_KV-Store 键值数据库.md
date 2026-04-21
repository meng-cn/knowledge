# KV-Store 键值数据库

> KV-Store 支持分布式数据同步，适合多设备场景。

---

## 1. KV-Store 概述

### 1.1 核心特性

| 特性 | 说明 |
|---|-|
| **存储类型** | Key-Value 键值对 |
| **分布式** | ✅ 支持多设备同步 |
| **适用场景** | 分布式配置、跨设备数据同步 |
| **数据类型** | String, Number, Boolean, ByteArray |
| **容量** | 比 Preferences 更大 |
| **同步方式** | 分布式软总线自动同步 |

### 1.2 适用场景

```
✅ 适合：
├─ 多设备数据同步（手机 ↔ 平板）
├─ 分布式配置
├─ 应用状态同步
└─ IoT 设备间数据交换

❌ 不适合：
├─ 单设备简单配置 → 用 Preferences
├─ 关系型数据 → 用 RDB
└─ 大文件 → 用文件存储
```

---

## 2. 基本用法

### 2.1 创建 KV-Store

```typescript
import { kVStore } from '@kit.ArkData';

// 创建 KV-Store 实例
let store: kVStore.KVStore = await kVStore.createKVStore({
    name: 'myKVStore',       // Store 名称
    type: 'persistent',      // persistent（持久化）/ temporary（临时）
    encrypt: false,           // 是否加密
    autoSync: true,           // 是否自动同步
    syncPolicy: kVStore.SyncPolicy.GLOBAL  // 同步策略
});
```

### 2.2 写入数据

```typescript
// 存储数据
await store.put('userId', '12345');
await store.put('userName', '小明');
await store.put('theme', 'dark');
await store.put('score', 95);
await store.put('avatar', new TextEncoder().encode('avatar_url'));
```

### 2.3 读取数据

```typescript
// 读取数据
let userId = await store.get<string>('userId');       // '12345'
let userName = await store.get<string>('userName');   // '小明'
let theme = await store.get<string>('theme');         // 'dark'
let score = await store.get<number>('score');         // 95

console.log(`用户: ${userId}, 昵称: ${userName}`);
```

### 2.4 删除数据

```typescript
// 删除单个 Key
await store.delete('theme');

// 删除所有数据
await store.flush();  // 持久化
await store.close();  // 关闭
```

---

## 3. 分布式同步

### 3.1 自动同步机制

```
设备 A（手机）              设备 B（平板）
┌──────────────┐          ┌──────────────┐
│ KV-Store     │          │ KV-Store     │
│              │          │              │
│ put('theme', │  自动同步  │ put('theme', │
│   'dark')    │ ──────→  │   'dark')    │
│              │          │              │
└──────────────┘          └──────────────┘
```

### 3.2 同步事件监听

```typescript
// 监听 KV-Store 变化
store.on('dataChange', (key: string, value: string | number | boolean | ArrayBuffer) => {
    console.log(`KV-Store 数据变化: ${key} = ${value}`);
    // 自动更新 UI
    if (key === 'theme') {
        this.theme = value as string;
    }
});

// 监听同步状态
store.on('syncStatus', (status: kVStore.SyncStatus) => {
    console.log('同步状态:', status);
});
```

---

## 4. 与 Preferences 对比

| 维度 | Preferences | KV-Store |
|---|-|- |
| **分布式** | ❌ 不支持 | ✅ 支持 |
| **容量** | ≤ 1MB | 更大 |
| **API** | 简单 | 稍复杂 |
| **适用场景** | 单设备配置 | 多设备同步 |
| **同步方式** | 手动 | 自动（软总线） |

---

## 5. 注意事项

```
⚠️ KV-Store 注意事项：
├─ 分布式同步需要设备在同一网络
├─ 大数据频繁写入影响同步性能
├─ 敏感数据建议加密后存储
└─ 使用完毕后 close() 释放资源
```

---

## 6. 面试高频考点

### Q1: KV-Store 的核心特性？

**回答**：支持分布式数据同步，多设备间通过分布式软总线自动同步。适合多设备配置和数据共享场景。

### Q2: KV-Store vs Preferences？

**回答**：KV-Store 支持分布式同步、容量更大；Preferences 仅单设备、容量 ≤ 1MB。

---

> 🐱 **小猫提示**：KV-Store 记住 **"分布式同步、多设备、软总线自动同步"**。这是鸿蒙分布式特色功能。
