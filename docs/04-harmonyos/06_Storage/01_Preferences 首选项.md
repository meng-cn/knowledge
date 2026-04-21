# Preferences 首选项

> Preferences 是 Key-Value 键值存储方案，适合小配置数据。

---

## 1. Preferences 概述

### 1.1 核心特性

| 特性 | 说明 |
|---|-|
| **存储类型** | Key-Value 键值对 |
| **适用场景** | 用户配置、Token、偏好设置 |
| **存储方式** | 持久化到磁盘（Preferences 文件） |
| **异步操作** | 所有操作异步执行 |
| **最大数据量** | 建议 ≤ 1MB（大量数据影响性能） |
| **数据类型** | String, Number, Boolean, ByteArray |

### 1.2 适用与不适用场景

```
✅ 适合：
├─ 用户偏好（主题、字体大小、语言）
├─ Token（登录凭证）
├─ 开关状态（通知开关、暗黑模式）
└─ 简单配置数据

❌ 不适合：
├─ 列表数据（太多条目）
├─ 大文件（用文件存储）
├─ 关系型数据（用 RDB）
└─ 缓存（用 KV-Store）
```

---

## 2. 基本用法

### 2.1 写入数据

```typescript
import { preferences } from '@kit.ArkUtils';

// 获取 Preferences 实例
let context = context.getApplicationContext();
let store = await preferences.getPreferences(context, { name: 'userPrefs' });

// 存储数据（异步）
await store.put('theme', 'dark');
await store.put('fontSize', 16);
await store.put('isLogin', true);
await store.put('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
await store.put('avatar', new TextEncoder().encode('avatar_url'));

// 提交（保存）
await store.commit();
```

### 2.2 读取数据

```typescript
// 获取数据
let theme = await store.get<string>('theme', 'light');  // 默认值
let fontSize = await store.get<number>('fontSize', 14);
let isLogin = await store.get<boolean>('isLogin', false);
let avatar = await store.get<Uint8Array>('avatar');

console.log('主题:', theme);       // 'dark'
console.log('字体大小:', fontSize); // 16
```

### 2.3 更新与删除

```typescript
// 更新值
await store.put('theme', 'light');
await store.commit();

// 删除指定 Key
await store.delete('theme');
await store.commit();

// 删除所有数据
await store.clear();
await store.commit();
```

### 2.4 查询

```typescript
// 获取所有 Keys
let keys = await store.getKeys();
for (let key of keys) {
    console.log('Key:', key);
}

// 查找包含某 Key 的键值对
let results = await store.getMatchingEntries('theme%');  // 模糊匹配
for (let entry of results) {
    console.log(entry.key, ':', entry.value);
}

// 检查是否包含 Key
let hasTheme = await store.has('theme');
```

---

## 3. 实际应用场景

### 3.1 用户偏好设置

```typescript
class UserPreferences {
    private store: preferences.Preferences | null = null;

    async init() {
        let ctx = context.getApplicationContext();
        this.store = await preferences.getPreferences(ctx, { name: 'userPreferences' });
    }

    async getTheme(): Promise<string> {
        return await this.store!.get<string>('theme', 'light');
    }

    async setTheme(theme: string): Promise<void> {
        await this.store!.put('theme', theme);
        await this.store!.commit();
    }

    async getFontSize(): Promise<number> {
        return await this.store!.get<number>('fontSize', 16);
    }

    async setFontSize(size: number): Promise<void> {
        await this.store!.put('fontSize', size);
        await this.store!.commit();
    }

    async getToken(): Promise<string> {
        return await this.store!.get<string>('token', '');
    }

    async setToken(token: string): Promise<void> {
        await this.store!.put('token', token);
        await this.store!.commit();
    }
}

// 使用
let prefs = new UserPreferences();
await prefs.init();
await prefs.setTheme('dark');
let theme = await prefs.getTheme();  // 'dark'
```

### 3.2 登录状态管理

```typescript
class AuthManager {
    private store: preferences.Preferences | null = null;

    async init() {
        let ctx = context.getApplicationContext();
        this.store = await preferences.getPreferences(ctx, { name: 'auth' });
    }

    // 登录
    async login(userId: string, token: string): Promise<void> {
        await this.store!.put('userId', userId);
        await this.store!.put('token', token);
        await this.store!.put('loginTime', Date.now().toString());
        await this.store!.commit();
    }

    // 登出
    async logout(): Promise<void> {
        await this.store!.delete('userId');
        await this.store!.delete('token');
        await this.store!.delete('loginTime');
        await this.store!.commit();
    }

    // 检查登录状态
    async isLoggedIn(): Promise<boolean> {
        let token = await this.store!.get<string>('token', '');
        return token.length > 0;
    }

    // 获取用户 ID
    async getUserId(): Promise<string> {
        return await this.store!.get<string>('userId', '');
    }
}
```

---

## 4. 注意事项

### 4.1 性能问题

```
❌ 避免：
├─ 频繁 commit（大量小写入）
├─ 存储大量数据（>1MB）
├─ 在 UI 线程同步读取
└─ 存列表/数组（应存 JSON 字符串）

✅ 推荐：
├─ 批量写入后统一 commit
├─ 只存简单的键值对
├─ 用 async/await 异步操作
└─ 复杂数据结构存 JSON 字符串
```

### 4.2 数据安全

```typescript
// 敏感数据（Token、密码）需要加密存储
import { crypto } from '@kit.CryptoArchitectureKit';

async function storeSecureData(key: string, value: string): Promise<void> {
    // 加密后存储
    let encrypted = await crypto.encrypt(value);
    await store.put(`_${key}`, encrypted);
    await store.commit();
}

async function getSecureData(key: string): Promise<string> {
    let encrypted = await store.get<Uint8Array>(`_${key}`);
    if (encrypted) {
        return await crypto.decrypt(encrypted);
    }
    return '';
}
```

---

## 5. 面试高频考点

### Q1: Preferences 适合存什么？

**回答**：用户设置、Token、字体大小等小型 Key-Value 数据。不要存列表数据。

### Q2: Preferences 和 KV-Store 的区别？

**回答**：Preferences 是应用级配置存储，KV-Store 支持分布式同步。Preferences 不适合存大量数据。

---

> 🐱 **小猫提示**：Preferences 记住 **"小配置/K-V、异步操作、不超过 1MB、敏感数据需加密"**。
