# rcp 网络库

> rcp（Remote Communication Kit）是新版高性能网络库，支持拦截器、连接池、HTTP/2。

---

## 1. rcp 概述

### 1.1 rcp vs http 对比

| 特性 | http 模块 | rcp 模块 |
|---|-|- |
| **定位** | 基础网络库 | 高性能网络库 |
| **HTTP/2** | ❌ 不支持 | ✅ 支持 |
| **连接池** | ❌ 无 | ✅ 内置 |
| **拦截器** | ❌ 需手动封装 | ✅ 原生支持 |
| **性能** | 一般 | 更好 |
| **推荐** | 简单场景 | 复杂/高性能场景 |

### 1.2 核心特性

```
rcp 网络库
├── 连接池管理（复用连接，减少握手）
├── HTTP/2 支持（多路复用）
├── 原生拦截器（请求/响应拦截）
├── 自动重试（网络抖动自动恢复）
├── 超时控制（连接/读取/写入）
└── 高性能（底层优化）
```

---

## 2. 基本用法

### 2.1 创建客户端

```typescript
import { rcp } from '@kit.NetworkKit'

// 创建 rcp 客户端
let client = rcp.createClient({
    baseUri: 'https://api.example.com',
    connectionPoolSize: 10,  // 连接池大小
    connectTimeout: 5000,    // 连接超时
    readTimeout: 10000,      // 读取超时
    writeTimeout: 10000      // 写入超时
})

// 发起请求
client.request({
    path: '/users',
    method: rcp.RequestMethod.GET,
    header: {
        'Authorization': 'Bearer xxx'
    }
}).then((response: rcp.Response) => {
    console.log('状态码:', response.statusCode)
    console.log('响应:', response.body)
}).finally(() => {
    client.close()  // 关闭客户端
})
```

---

## 3. 拦截器

### 3.1 请求拦截器

```typescript
// 请求前拦截器
client.addInterceptor({
    intercept: (chain: rcp.Chain) => {
        let request = chain.request()
        
        // 添加通用请求头
        request.header['Content-Type'] = 'application/json'
        request.header['Authorization'] = `Bearer ${getToken()}`
        request.header['X-Request-Id'] = generateRequestId()
        
        // 打印请求日志
        console.log('请求:', request.method, request.uri)
        
        // 继续执行
        return chain.proceed(request)
    }
})
```

### 3.2 响应拦截器

```typescript
// 响应后拦截器
client.addInterceptor({
    intercept: (chain: rcp.Chain) => {
        let response = chain.proceed(chain.request())
        
        // 响应日志
        console.log('响应:', response.statusCode, response.uri)
        
        // 统一错误处理
        if (response.statusCode >= 400) {
            throw new Error(`HTTP ${response.statusCode}: ${response.statusText}`)
        }
        
        // Token 刷新
        if (response.statusCode === 401) {
            refreshToken()
            return chain.proceed(chain.request())  // 重试
        }
        
        return response
    }
})
```

### 3.3 多拦截器链

```
请求 → [认证拦截器] → [日志拦截器] → [超时拦截器] → 服务器
     ↓
响应 ← [错误处理拦截器] ← [日志拦截器] ← [缓存拦截器] ← 服务器
```

---

## 4. 高级用法

### 4.1 连接池管理

```typescript
// 连接池配置
let client = rcp.createClient({
    baseUri: 'https://api.example.com',
    connectionPool: {
        maxSize: 50,           // 最大连接数
        idleTimeout: 300000,   // 空闲超时（5分钟）
        keepAliveTimeout: 60000,  // 保活超时（1分钟）
        maxConnectionsPerHost: 10  // 每主机最大连接数
    }
})
```

### 4.2 HTTP/2 多路复用

```typescript
// HTTP/2 自动启用
let client = rcp.createClient({
    baseUri: 'https://api.example.com',
    http2: true  // 启用 HTTP/2
})

// 多路复用：多个请求复用同一个 TCP 连接
Promise.all([
    client.request({ path: '/users' }),
    client.request({ path: '/posts' }),
    client.request({ path: '/comments' })
]).then((responses: rcp.Response[]) => {
    console.log('多路复用完成')
})
```

### 4.3 自动重试

```typescript
// 自动重试配置
let client = rcp.createClient({
    baseUri: 'https://api.example.com',
    retry: {
        maxRetries: 3,           // 最大重试次数
        retryDelay: 1000,        // 重试间隔（毫秒）
        retryOn: [500, 502, 503, 504]  // 可重试的状态码
    }
})
```

---

## 5. 面试高频考点

### Q1: rcp 相比 http 的优势？

**回答**：rcp 支持连接池复用、HTTP/2 多路复用、原生拦截器、自动重试，性能更好。适合复杂/高性能场景。

### Q2: rcp 的拦截器原理？

**回答**：拦截器链式执行，请求拦截器在请求前执行（添加 Header/日志），响应拦截器在响应后执行（错误处理/缓存）。

---

> 🐱 **小猫提示**：rcp 记住 **"连接池、HTTP/2、拦截器链、自动重试"**。高性能场景首选。
