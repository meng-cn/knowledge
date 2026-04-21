# http 模块

> @kit.NetworkKit/http 是鸿蒙发起 HTTP 请求的核心模块。

---

## 1. http 模块基本用法

### 1.1 创建 HTTP 客户端

```typescript
import { http } from '@kit.NetworkKit'

// 创建 HTTP 客户端实例
let httpClient = http.createHttp()

// 发起 GET 请求
httpClient.request('https://api.example.com/users', {
    method: http.HttpRequestMethod.GET,  // GET/POST/PUT/DELETE
    header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
    },
    extraData: {
        timeout: 5000  // 超时时间（毫秒）
    }
}).then((data: http.HttpResponse) => {
    console.log('状态码:', data.statusCode)
    console.log('响应体:', data.result)
    
    // 解析 JSON
    let users = JSON.parse(data.result as string)
    this.users = users
}).catch((err: http.HttpError) => {
    console.error('请求失败:', err.message)
})

// ⚠️ 重要：任务结束后必须销毁客户端，防止内存泄漏
httpClient.destroy()
```

---

## 2. HTTP 请求方式

### 2.1 GET 请求

```typescript
let httpClient = http.createHttp()

httpClient.request('https://api.example.com/users', {
    method: http.HttpRequestMethod.GET,
    header: { 'Content-Type': 'application/json' },
    // GET 参数在 URL 中
}).then((response: http.HttpResponse) => {
    console.log('数据:', response.result)
}).finally(() => {
    httpClient.destroy()  // 必须销毁
})
```

### 2.2 POST 请求

```typescript
let httpClient = http.createHttp()

httpClient.request('https://api.example.com/users', {
    method: http.HttpRequestMethod.POST,
    header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
    },
    // POST 数据放在 extraData
    extraData: JSON.stringify({
        name: '小明',
        age: 25
    }),
    connectTimeout: 5000,  // 连接超时
    readTimeout: 10000     // 读取超时
}).then((response: http.HttpResponse) => {
    console.log('提交成功:', response.result)
}).finally(() => {
    httpClient.destroy()
})
```

### 2.3 PUT/DELETE 请求

```typescript
// PUT 更新
httpClient.request('https://api.example.com/users/123', {
    method: http.HttpRequestMethod.PUT,
    extraData: JSON.stringify({ name: '小红' })
}).then((response) => {
    console.log('更新成功')
}).finally(() => httpClient.destroy())

// DELETE 删除
httpClient.request('https://api.example.com/users/123', {
    method: http.HttpRequestMethod.DELETE
}).then((response) => {
    console.log('删除成功')
}).finally(() => httpClient.destroy())
```

---

## 3. 响应处理

### 3.1 响应数据结构

```typescript
interface HttpResponse {
    statusCode: number       // HTTP 状态码
    header: Map<string, string>  // 响应头
    requestId: number        // 请求 ID
    data: ArrayBuffer        // 原始数据
    result: string | ArrayBuffer  // 解析后的数据
    isFromCache: boolean     // 是否来自缓存
    progress: number         // 下载进度
    extra: Record<string, any>  // 额外数据
}
```

### 3.2 错误处理

```typescript
httpClient.request(url, { method: http.HttpRequestMethod.GET })
    .then((response: http.HttpResponse) => {
        if (response.statusCode === 200) {
            // 成功
            let data = JSON.parse(response.result as string)
            this.handleSuccess(data)
        } else if (response.statusCode === 401) {
            // 未授权
            this.handleUnauthorized()
        } else if (response.statusCode === 500) {
            // 服务器错误
            this.handleServerError()
        }
    })
    .catch((err: http.HttpError) => {
        // 网络错误处理
        switch (err.code) {
            case 201:  // 网络不可用
                this.showNetworkError()
                break
            case 202:  // 连接超时
                this.showTimeout()
                break
            case 203:  // 读取超时
                this.showReadTimeout()
                break
            default:
                this.showError()
        }
    })
    .finally(() => {
        httpClient.destroy()
    })
```

---

## 4. 拦截器封装

### 4.1 统一拦截器

```typescript
class HttpInterceptor {
    private baseUrl: string = 'https://api.example.com'
    
    async request<T>(url: string, options: http.HttpRequestOptions): Promise<T> {
        // 请求前拦截
        this.addAuthHeader(options)
        this.addRequestInfo(options)
        
        // 发起请求
        let httpClient = http.createHttp()
        
        return new Promise<T>((resolve, reject) => {
            httpClient.request(this.baseUrl + url, options)
                .then((response: http.HttpResponse) => {
                    if (response.statusCode === 200) {
                        // 响应后拦截
                        let data = JSON.parse(response.result as string)
                        this.handleResponse(data)
                        resolve(data as T)
                    } else {
                        this.handleErrorResponse(response.statusCode)
                        reject(new Error(`HTTP ${response.statusCode}`))
                    }
                })
                .catch((err: http.HttpError) => {
                    this.handleError(err)
                    reject(err)
                })
                .finally(() => {
                    httpClient.destroy()  // 必须销毁
                })
        })
    }
    
    private addAuthHeader(options: http.HttpRequestOptions): void {
        if (!options.header) options.header = {}
        options.header['Authorization'] = `Bearer ${getToken()}`
    }
    
    private handleResponse(data: any): void {
        if (data.code !== 0) {
            throw new Error(data.message || '请求失败')
        }
    }
    
    private handleError(err: http.HttpError): void {
        if (err.code === 202) {
            console.log('连接超时，尝试重试...')
            // 重试逻辑
        }
    }
}
```

---

## 5. 面试高频考点

### Q1: http 模块的基本使用步骤？

**回答**：1. 创建 httpClient = http.createHttp(); 2. request(url, options); 3. 处理 then/catch/finally; 4. 必须销毁 httpClient.destroy()。

### Q2: 为什么必须调用 destroy？

**回答**：防止内存泄漏。http 客户端持有网络连接和资源，不销毁会持续占用内存。

### Q3: 如何统一处理请求头？

**回答**：封装拦截器，在请求前自动添加 Authorization Token、Content-Type、请求 ID 等。

---

> 🐱 **小猫提示**：http 模块记住 **"createHttp → request → then/catch → destroy（必须！）"**。
