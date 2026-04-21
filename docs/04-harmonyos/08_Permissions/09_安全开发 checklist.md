# 安全开发 Checklist

> 鸿蒙应用安全开发清单，覆盖数据存储、通信、权限、隐私等。

---

## 1. 数据安全

### 1.1 存储安全

- [ ] 敏感数据（Token、密码）是否加密存储？
- [ ] 是否使用 AssetStore 存储登录凭证？
- [ ] Preferences 是否避免存储明文敏感信息？
- [ ] 数据库是否加密（敏感字段）？
- [ ] 是否避免在日志中打印敏感数据？

```typescript
// ✅ 正确：加密存储
await assetStore.put('token', encrypt(token))

// ❌ 错误：明文存储
await preferences.put('token', token)  // 危险！
```

---

## 2. 通信安全

### 2.1 网络安全

- [ ] 所有 API 是否使用 HTTPS？
- [ ] 是否启用 SSL Pinning（防止 MITM）？
- [ ] 是否使用 TLS 1.2+？
- [ ] 敏感数据是否应用层加密？
- [ ] 是否避免 HTTP 明文传输？

```typescript
// ✅ 正确：HTTPS + SSL Pinning
let sslContext = ssl.createSSLContext({
    caCertificates: [cert],
    serverCertPin: true,
    minVersion: ssl.TLSVersion.TLS1_2
})

// ❌ 错误：HTTP 明文
httpClient.request('http://api.example.com/data')  // 危险！
```

---

## 3. 权限安全

### 3.1 权限管理

- [ ] 是否遵循最小权限原则？
- [ ] 是否渐进式申请权限（用时再申请）？
- [ ] 权限被拒后是否有降级方案？
- [ ] 是否向用户解释为什么需要权限？
- [ ] 是否避免申请与功能无关的权限？

```typescript
// ✅ 正确：用时申请
button.onClick(() => {
    requestPermission('ohos.permission.CAMERA')
        .then(() => this.openCamera())
})

// ❌ 错误：启动时申请所有
aboutToAppear() {
    requestAllPermissions()  // 危险！
}
```

---

## 4. 隐私保护

### 4.1 隐私合规

- [ ] 是否有隐私政策？
- [ ] 是否首次启动时弹窗征得同意？
- [ ] 是否明确告知收集哪些数据？
- [ ] 是否提供撤回同意的方式？
- [ ] 是否避免收集与功能无关的个人信息？

---

## 5. 代码安全

### 5.1 代码实践

- [ ] 是否避免硬编码密钥/密码？
- [ ] 是否使用 ProGuard 混淆代码？
- [ ] 是否避免在代码中写死服务器地址？
- [ ] 是否对输入数据进行校验？
- [ ] 是否处理所有异常情况？

```typescript
// ✅ 正确：从配置文件读取
let apiUrl = config.getApiUrl()

// ❌ 错误：硬编码
let apiUrl = 'https://api.example.com'  // 不好！
```

---

## 6. 应用加固

### 6.1 加固措施

- [ ] 是否使用发布签名（非调试签名）？
- [ ] 是否启用代码混淆？
- [ ] 是否移除调试代码？
- [ ] 是否关闭日志输出（Release 版本）？
- [ ] 是否定期更新依赖库（修复安全漏洞）？

---

## 7. 面试高频考点

### Q: 安全开发需要注意什么？

**回答**：数据加密存储、HTTPS+SSL Pinning、最小权限原则、隐私政策、代码混淆、发布签名、不硬编码密钥。

---

> 🐱 **小猫提示**：安全 Checklist 记住 **"加密存储、HTTPS、最小权限、隐私政策、代码混淆、发布签名"**。
