# AssetStore 安全存储

> AssetStore 提供应用卸载后数据仍保留的安全存储方案。

---

## 1. AssetStore 概述

### 1.1 核心特性

| 特性 | 说明 |
|---|-|
| **数据持久性** | 应用卸载后数据保留 |
| **安全存储** | 加密存储，保护敏感数据 |
| **适用场景** | 用户账号、密钥、敏感配置 |
| **生命周期** | 与用户账户绑定（非应用） |

### 1.2 与普通存储对比

```
普通存储（files/preferences）：
├─ 应用安装 → 数据写入
├─ 应用卸载 → 数据删除
└─ 数据随应用走

AssetStore：
├─ 应用安装 → 数据写入
├─ 应用卸载 → 数据保留 ⭐
├─ 重新安装 → 数据恢复
└─ 数据随用户走
```

---

## 2. 基本用法

### 2.1 写入安全数据

```typescript
import { assetManager } from '@kit.ArkTS'

// 创建 AssetStore
let assetStore = await assetManager.createAssetStore({
    name: 'secureData',
    encrypt: true  // 加密存储
})

// 写入敏感数据
let result = await assetStore.put('accessToken', 'eyJhbGci...')
let result2 = await assetStore.put('userId', 'user_12345')
let result3 = await assetStore.put('apiKey', 'secret_key_xxx')

console.log('写入结果:', result)
```

### 2.2 读取安全数据

```typescript
// 读取数据
let accessToken = await assetStore.get('accessToken')
let userId = await assetStore.get('userId')
let apiKey = await assetStore.get('apiKey')

console.log('用户 ID:', userId)
console.log('Token:', accessToken)
```

### 2.3 更新与删除

```typescript
// 更新数据
await assetStore.put('accessToken', 'new_token_xxx')

// 删除数据
await assetStore.delete('apiKey')

// 删除所有数据
await assetStore.clear()
```

---

## 3. 实际应用场景

### 3.1 登录凭证持久化

```typescript
class SecureAuthManager {
    private assetStore: assetManager.AssetStore | null = null

    async init() {
        this.assetStore = await assetManager.createAssetStore({
            name: 'auth',
            encrypt: true
        })
    }

    // 登录 - 安全存储凭证
    async saveAuth(token: string, userId: string): Promise<void> {
        if (!this.assetStore) return
        await this.assetStore.put('token', token)
        await this.assetStore.put('userId', userId)
    }

    // 获取凭证
    async getAuth(): Promise<{ token: string, userId: string }> {
        if (!this.assetStore) return { token: '', userId: '' }
        let token = await this.assetStore.get('token') as string
        let userId = await this.assetStore.get('userId') as string
        return { token, userId }
    }

    // 登出
    async clearAuth(): Promise<void> {
        if (!this.assetStore) return
        await this.assetStore.delete('token')
        await this.assetStore.delete('userId')
    }
}
```

---

## 4. 注意事项

```
⚠️ 使用限制：
├─ 数据量有限（不适合大量数据）
├─ 读取较慢（加密解密开销）
├─ 敏感数据推荐用此方案
└─ 应用卸载后数据保留
```

---

## 5. 面试高频考点

### Q1: AssetStore 的作用？

**回答**：应用卸载后数据仍保留的安全存储，与用户账户绑定。适合存储登录凭证、密钥等敏感数据。

### Q2: AssetStore vs Preferences？

**回答**：Preferences 应用卸载数据丢失；AssetStore 应用卸载数据保留。Assetsotre 更安全但容量有限。

---

> 🐱 **小猫提示**：AssetStore 记住 **"卸载保留、加密存储、敏感数据、用户绑定"**。
