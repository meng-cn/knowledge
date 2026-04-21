# 网络安全与 HTTPS

> 鸿蒙 HTTPS/TLS 安全机制、SSL Pinning、证书校验。

---

## 1. HTTPS 基础

### 1.1 HTTPS vs HTTP

```
HTTP（明文）：
├─ 数据明文传输
├─ 可被窃听
└─ 可被篡改

HTTPS（加密）：
├─ TLS/SSL 加密传输
├─ 防窃听
├─ 防篡改
└─ 身份验证（证书）
```

### 1.2 证书类型

| 类型 | 用途 | 适用场景 |
|---|-|-|
| **DV** | 域名验证 | 个人网站 |
| **OV** | 组织验证 | 企业官网 |
| **EV** | 增强验证 | 金融/支付 |
| **自签** | 内部测试 | 开发/测试环境 |

---

## 2. SSL Pinning（证书绑定）

### 2.1 为什么需要 SSL Pinning？

```
普通 HTTPS：
├─ 信任系统证书库（CA 机构）
├─ 攻击者可以伪造证书（MITM）
└─ 数据可能泄露

SSL Pinning：
├─ 只信任指定的证书/公钥
├─ 伪造证书被拒绝
└─ 有效防止 MITM 攻击
```

### 2.2 实现 SSL Pinning

```typescript
import { http, ssl } from '@kit.NetworkKit'

// 加载 PEM 格式的证书
let certificate = fs.readSync('rawfile://server.pem')

// 创建 SSL 上下文
let sslContext = ssl.createSSLContext({
    caCertificates: [certificate],  // 信任的证书
    serverCertPin: true,            // 启用证书绑定
    verifyHostname: true,           // 验证主机名
    minVersion: ssl.TLSVersion.TLS1_2  // 最低 TLS 版本
})

// 使用 SSL Pinning 的 HTTP 客户端
let httpClient = http.createHttp({
    sslContext: sslContext
})

// 请求会自动验证证书
httpClient.request('https://api.example.com/data', {
    method: http.HttpRequestMethod.GET
}).then((response: http.HttpResponse) => {
    if (response.statusCode === 200) {
        console.log('安全请求成功')
    }
}).catch((err: http.HttpError) => {
    if (err.code === 4001) {
        console.error('证书验证失败！可能是 MITM 攻击')
    }
})
```

---

## 3. TLS/SSL 配置

### 3.1 TLS 版本选择

```typescript
// TLS 版本优先级（高到低）
TLS 1.3 > TLS 1.2 > TLS 1.1 > TLS 1.0

// 推荐配置
let sslContext = ssl.createSSLContext({
    minVersion: ssl.TLSVersion.TLS1_2,  // 最低 TLS 1.2
    maxVersion: ssl.TLSVersion.TLS1_3,  // 最高 TLS 1.3
    cipherSuites: [                     // 加密套件
        ssl.CipherSuite.TLS_AES_256_GCM_SHA384,
        ssl.CipherSuite.TLS_CHACHA20_POLY1305_SHA256
    ]
})
```

### 3.2 证书链验证

```typescript
// 证书链验证
let sslContext = ssl.createSSLContext({
    caCertificates: [
        // 根证书
        fs.readSync('rawfile://root.pem'),
        // 中间证书
        fs.readSync('rawfile://intermediate.pem')
    ],
    verifyServerCert: true,  // 验证服务器证书
    verifyHostname: true,    // 验证主机名
    enableCertChainVerify: true  // 启用证书链验证
})
```

---

## 4. 常见安全问题与防御

### 4.1 MITM 攻击防御

```
MITM 攻击方式：
├─ 伪造证书
├─ 劫持网络
└─ 中间人监听

防御措施：
├─ ✅ SSL Pinning
├─ ✅ 证书链验证
├─ ✅ 最低 TLS 版本（TLS 1.2+）
├─ ✅ Certificate Transparency
└─ ❌ 禁用 SSL 验证（绝对不要！）
```

### 4.2 数据加密

```typescript
// 敏感数据加密
import { crypto } from '@kit.CryptoArchitectureKit'

// AES 加密
let key = crypto.generateKey({
    algorithm: crypto.Algorithm.AES_256,
    keySize: 256
})

let encrypted = crypto.encrypt({
    key: key,
    data: sensitiveData,
    algorithm: crypto.Algorithm.AES_256_GCM
})

// 解密
let decrypted = crypto.decrypt({
    key: key,
    data: encrypted,
    algorithm: crypto.Algorithm.AES_256_GCM
})
```

---

## 5. 面试高频考点

### Q1: SSL Pinning 的作用？

**回答**：只信任指定的证书，防止 MITM（中间人）攻击。即使攻击者伪造了 CA 证书也无法通过验证。

### Q2: TLS 1.3 相比 TLS 1.2 的优势？

**回答**：TLS 1.3 握手更快（1-RTT）、加密套件更强、去除了不安全算法、前向保密。

### Q3: 敏感数据如何存储？

**回答**：使用 CryptoArchitectureKit 加密存储，或 AssetStore 安全存储（用户卸载后数据保留）。

---

> 🐱 **小猫提示**：网络安全记住 **"SSL Pinning 防 MITM、TLS 1.2+、敏感数据加密"**。
