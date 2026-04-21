# TokenID 与访问控制

> TokenID 是鸿蒙安全模型的核心，每个应用/进程有唯一身份标识。

---

## 1. TokenID 概述

### 1.1 核心概念

| 概念 | 说明 |
|---|-|-|
| **TokenID** | 应用/进程的唯一身份标识 |
| **ATM** | 访问控制管理器 (Access Token Manager) |
| **权限标签** | 权限的唯一标识符 |
| **权限策略** | 允许/拒绝访问的规则 |

### 1.2 TokenID 生成

```
应用安装时
    ↓
系统生成唯一 TokenID
    ↓
TokenID 与签名/包名绑定
    ↓
存储到安全区域
```

```typescript
import { securityAccessToken } from '@kit.SecurityKit'

// 获取当前应用 TokenID
let tokenId = securityAccessToken.getTokenId()
console.log('当前 TokenID:', tokenId)

// 获取应用权限列表
let permissions = await securityAccessToken.getPermissions(tokenId)
for (let perm of permissions) {
    console.log('权限:', perm.name, perm.grantStatus)
}
```

---

## 2. ATM 访问控制

### 2.1 权限检查

```typescript
import { securityAccessToken } from '@kit.SecurityKit'

// 检查权限
let status = securityAccessToken.verifyAccessToken({
    permissionName: 'ohos.permission.INTERNET',
    tokenId: tokenId
})

if (status === securityAccessToken.GrantStatus.PERMISSION_GRANTED) {
    console.log('权限已授予')
    // 执行需要权限的操作
} else if (status === securityAccessToken.GrantStatus.PERMISSION_DENIED) {
    console.log('权限被拒绝')
    // 提示用户或降级处理
}
```

### 2.2 权限分级

```
权限等级：
├─ normal（普通权限）
│   └─ 安装时自动授予
├─ user_granted（用户授权）
│   └─ 运行时请求用户授权
├─ system_basic（系统基础权限）
│   └─ 系统应用自动授予
└─ signature（签名权限）
    └─ 同签名应用自动授予
```

---

## 3. 运行时权限请求

### 3.1 请求用户授权

```typescript
import { bundleManager } from '@kit.ArkTS'
import { securityAccessToken } from '@kit.SecurityKit'

// 请求权限
async function requestPermission(permission: string): Promise<boolean> {
    // 检查是否已授予
    let status = securityAccessToken.verifyAccessToken({
        permissionName: permission
    })
    
    if (status === securityAccessToken.GrantStatus.PERMISSION_GRANTED) {
        return true
    }
    
    // 请求用户授权（需配合 UI）
    try {
        let result = await bundleManager.requestPermission({
            permission: permission
        })
        
        if (result) {
            console.log('用户已授权')
            return true
        } else {
            console.log('用户拒绝授权')
            return false
        }
    } catch (err) {
        console.error('权限请求失败:', err.message)
        return false
    }
}

// 使用
let hasPermission = await requestPermission('ohos.permission.CAMERA')
if (hasPermission) {
    // 使用相机
} else {
    // 提示用户去设置页授权
}
```

---

## 4. 权限最佳实践

```
✅ 推荐做法：
├─ 最小权限原则（只申请必要权限）
├─ 运行时检查权限
├─ 权限被拒后优雅降级
├─ 向用户解释为什么需要权限
└─ 敏感权限二次确认

❌ 避免：
├─ 一次性申请所有权限
├─ 不检查权限直接使用
├─ 权限被拒后崩溃
└─ 滥用敏感权限
```

---

## 5. 面试高频考点

### Q1: TokenID 的作用？

**回答**：应用/进程的唯一身份标识，用于访问控制。系统通过 TokenID 识别应用身份并检查权限。

### Q2: 权限检查流程？

**回答**：获取 TokenID → verifyAccessToken 检查权限 → 根据 GrantStatus 决定是否执行操作。

---

> 🐱 **小猫提示**：TokenID 记住 **"唯一身份标识、ATM 访问控制、verifyAccessToken 检查、权限分级"**。
