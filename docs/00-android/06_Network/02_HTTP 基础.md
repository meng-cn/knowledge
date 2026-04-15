# 02_HTTP 基础

## 目录

- [HTTP 协议概述](#http-协议概述)
- [HTTP 版本演进](#http-版本演进)
- [HTTP 请求方法](#http-请求方法)
- [HTTP 状态码](#http-状态码)
- [请求头与响应头](#请求头与响应头)
- [连接复用与 Keep-Alive](#连接复用与-keep-alive)
- [HTTPS 与 TLS 握手](#https-与-tls-握手)
- [HTTP/2 多路复用](#http2-多路复用)
- [代码示例](#代码示例)
- [面试考点](#面试考点)

---

## HTTP 协议概述

HTTP（HyperText Transfer Protocol，超文本传输协议）是应用层协议，用于分布式、协作式和超媒体信息系统。它是万维网（WWW）的数据通信基础，规定了客户端和服务器之间如何通信。

### 1.1 HTTP 的特点

**无状态协议**
- HTTP 协议本身不保存客户端的状态信息
- 每次请求都是独立的，服务器不知道之前是否有过请求
- 解决方案：Cookie、Session、Token

**无连接**
- 通信完成后连接立即关闭（HTTP/1.0）
- HTTP/1.1 引入了持久连接（Keep-Alive）

**面向文本**
- HTTP 消息是纯文本格式
- 便于调试和理解
- 但效率较低，HTTP/2 使用二进制格式

### 1.2 HTTP 请求与响应结构

**请求报文结构**

```
请求行
请求头（Header）
空行
请求体（Body）
```

**请求行示例**：
```
GET /api/users/123 HTTP/1.1
```

组成部分：
- 请求方法：GET、POST、PUT、DELETE 等
- 请求路径：资源标识符
- HTTP 版本：HTTP/1.0、HTTP/1.1、HTTP/2.0

**响应报文结构**

```
状态行
响应头（Header）
空行
响应体（Body）
```

**状态行示例**：
```
HTTP/1.1 200 OK
```

组成部分：
- HTTP 版本
- 状态码：200、404、500 等
- 状态描述：OK、Not Found、Internal Server Error

### 1.3 HTTP 通信流程

```
┌──────────┐                                    ┌──────────┐
│ Client   │                                    │ Server   │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  1. 建立 TCP 连接                              │
     ├───────────────────────────────────────────────>│
     │                                               │
     │  2. 发送 HTTP 请求                              │
     ├───────────────────────────────────────────────>│
     │                                               │
     │  3. 处理请求                                   │
     │                                               │
     │  4. 返回 HTTP 响应                              │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  5. 关闭连接（HTTP/1.0）或复用（HTTP/1.1）     │
     │<──────────────────────────────────────────────┤
     │                                               │
```

---

## HTTP 版本演进

### 2.1 HTTP/1.0（1996 年）

**特点**：
- 每次请求都需要建立新的 TCP 连接
- 不支持持久连接，效率低
- 缓存机制不完善
- Content-Length 不是必需的
- 不支持 Host 头，无法在一台服务器上托管多个域名

**缺点**：
```java
// HTTP/1.0 的通信模式
Request 1 -> TCP 连接 -> 请求 -> 响应 -> TCP 断开
Request 2 -> TCP 连接 -> 请求 -> 响应 -> TCP 断开
Request 3 -> TCP 连接 -> 请求 -> 响应 -> TCP 断开
// 三次完整的 TCP 三次握手和四次挥手
```

### 2.2 HTTP/1.1（1997 年）

**改进**：

1. **持久连接（Keep-Alive）**
```http
Connection: keep-alive
Keep-Alive: timeout=5, max=100
```
- 默认启用持久连接
- 同一个 TCP 连接可以传输多个请求/响应
- 减少了 TCP 连接的建立开销

2. **引入 Host 头**
```http
GET /index.html HTTP/1.1
Host: www.example.com
```
- 支持虚拟主机
- 一台服务器可以托管多个域名

3. **断点续传**
```http
Range: bytes=0-999
Content-Range: bytes 0-999/12345
```

4. **缓存控制增强**
```http
Cache-Control: max-age=3600
ETag: "abc123"
If-None-Match: "abc123"
```

5. **管道化（Pipelining）**
```
请求 1 ──┐
请求 2 ──┼── 在同一连接上连续发送
请求 3 ──┘
```
- 客户端可以在等待响应时发送多个请求
- 但由于队头阻塞问题，实际很少使用

**存在的问题**：
- 队头阻塞（Head-of-Line Blocking）
- 冗余传输
- 明文传输不安全

### 2.3 HTTP/2（2015 年）

**重大改进**：

1. **二进制协议**
```
HTTP/1.x: 文本格式
GET /path HTTP/1.1
Host: example.com

HTTP/2: 二进制帧
Frame Type: HEADERS (0x00000001)
```

2. **多路复用（Multiplexing）**
```
┌─────────────────────────────────┐
│  流 1: GET /api/users           │
│  流 2: GET /api/posts           │
│  流 3: GET /css/style.css       │
│  流 4: GET /js/app.js           │
└─────────────────────────────────┘
       同一个 TCP 连接
```
- 多个请求/响应可以交错传输
- 彻底解决队头阻塞问题

3. **头部压缩（HPACK）**
```
HTTP/1.1:
GET /api/users HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json
Cookie: session=abc123

HTTP/2 (HPACK 编码):
压缩后的二进制数据，大幅减小头部大小
```

4. **服务器推送（Server Push）**
```
客户端请求：/index.html
服务器推送：
- /index.html（响应）
- /css/style.css（推送）
- /js/app.js（推送）
```
- 服务器预测客户端需要的资源并主动推送
- 减少请求往返次数

**Android 实现**：
```kotlin
// OkHttp 默认支持 HTTP/2
val client = OkHttpClient()

// 检查协议版本
val call = client.newCall(request)
val response = call.execute()
val protocol = response.protocol // HTTP/2
```

### 2.4 HTTP/3（2022 年正式）

**核心改进**：

1. **基于 UDP 而非 TCP**
```
HTTP/1.x 和 HTTP/2: 基于 TCP
HTTP/3: 基于 QUIC (User Datagram Protocol)
```

2. **QUIC 协议特点**
- 0-RTT 连接建立（首次连接 1-RTT）
- 内置加密（类似 TLS 1.3）
- 更好的多路复用（在传输层解决队头阻塞）
- 连接迁移（切换网络不中断）

3. **队头阻塞的彻底解决**
```
TCP 层面：
丢包 1 ───────> 阻塞整个连接的所有流

QUIC 层面：
丢包 1 ───────> 只阻塞受影响的流，其他流继续传输
```

**Android 支持**：
```kotlin
// OkHttp 4.x+ 支持 HTTP/3（需要配置）
val client = OkHttpClient.Builder()
    .protocols(listOf(Protocol.H2_PRIOR_KNOWLEDGE, Protocol.HTTP_1_1))
    .build()

// HTTP/3 需要额外配置
// 注意：HTTP/3 在 Android 中需要原生支持
```

**版本对比表**：

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输层 | TCP | TCP | UDP (QUIC) |
| 多路复用 | ❌ | ✅ | ✅ |
| 头部压缩 | ❌ | ✅ (HPACK) | ✅ (QPACK) |
| 服务器推送 | ❌ | ✅ | ✅ |
| 队头阻塞 | 应用层 | 无 | 无 |
| 加密 | 可选 | 推荐强制 | 强制 |
| 连接建立 | 3-RTT | 1-2 RTT | 0-1 RTT |

---

## HTTP 请求方法

### 3.1 GET

**特点**：
- 获取资源
- 参数在 URL 中
- 幂等（多次请求结果相同）
- 可缓存
- 长度受限（URL 长度限制）

**使用场景**：
```kotlin
// 获取用户列表
GET /api/users?page=1&size=20

// 搜索
GET /api/search?q=android&sort=created

// 获取资源
GET /api/users/123/profile
```

**Android 实现**：
```kotlin
// Retrofit
interface ApiService {
    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int,
        @Query("size") size: Int
    ): Response<UserList>
    
    @GET("users/{id}/profile")
    suspend fun getUserProfile(@Path("id") userId: String): Response<UserProfile>
}

// OkHttp
val request = Request.Builder()
    .url("https://api.example.com/users?page=1&size=20")
    .get()
    .build()
```

### 3.2 POST

**特点**：
- 创建资源
- 参数在 Body 中
- 不幂等
- 不缓存
- 无长度限制（理论）

**使用场景**：
```kotlin
// 创建用户
POST /api/users
Content-Type: application/json

{
    "name": "张三",
    "email": "zhangsan@example.com"
}

// 登录
POST /api/auth/login
{
    "username": "admin",
    "password": "123456"
}

// 文件上传
POST /api/upload
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="image.jpg"
<binary data>
```

**Android 实现**：
```kotlin
// Retrofit
interface ApiService {
    @POST("users")
    suspend fun createUser(@Body user: User): Response<User>
    
    @Multipart
    @POST("upload")
    suspend fun uploadFile(@Part file: MultipartBody.Part): Response<UploadResult>
}

// OkHttp
val json = """
    {
        "name": "张三",
        "email": "zhangsan@example.com"
    }
""".trimIndent()

val body = json.toRequestBody(ContentType.parse("application/json"))
val request = Request.Builder()
    .url("https://api.example.com/users")
    .post(body)
    .build()

// 文件上传
val fileBody = File("path/to/image.jpg")
    .asRequestBody(ContentType.parse("image/jpeg"))
    .let { body ->
        MultipartBody.Part.createFormData("file", "image.jpg", body)
    }

val formBody = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addPart(fileBody)
    .build()

val uploadRequest = Request.Builder()
    .url("https://api.example.com/upload")
    .post(formBody)
    .build()
```

### 3.3 PUT

**特点**：
- 更新资源（完整替换）
- 幂等
- 参数在 Body 中

**使用场景**：
```kotlin
// 更新用户（完整替换）
PUT /api/users/123
Content-Type: application/json

{
    "id": 123,
    "name": "李四",
    "email": "lisi@example.com",
    "age": 25
}

// 注意：PUT 会替换整个资源，未提供的字段可能丢失
```

**Android 实现**：
```kotlin
// Retrofit
interface ApiService {
    @PUT("users/{id}")
    suspend fun updateUser(
        @Path("id") userId: String,
        @Body user: User
    ): Response<User>
}

// OkHttp
val userJson = """{"name": "李四", "email": "lisi@example.com"}"""
val body = userJson.toRequestBody(ContentType.parse("application/json"))
val request = Request.Builder()
    .url("https://api.example.com/users/123")
    .put(body)
    .build()
```

### 3.4 PATCH

**特点**：
- 更新资源（部分修改）
- 幂等
- 参数在 Body 中

**使用场景**：
```kotlin
// 更新用户（只修改指定字段）
PATCH /api/users/123
Content-Type: application/json

{
    "name": "王五"
}

// 只有 name 字段会被更新，其他字段保持不变
```

**Android 实现**：
```kotlin
// Retrofit
interface ApiService {
    @PATCH("users/{id}")
    suspend fun patchUser(
        @Path("id") userId: String,
        @Body patchData: Map<String, Any>
    ): Response<User>
}

// OkHttp
// 注意：OkHttp 的 patch() 方法返回的是 Response，但服务器支持 PATCH 的前提
val patchData = mapOf("name" to "王五")
val body = JsonEncoder.encodeToString(patchData).toRequestBody(
    ContentType.parse("application/json")
)
val request = Request.Builder()
    .url("https://api.example.com/users/123")
    .patch(body)
    .build()
```

### 3.5 DELETE

**特点**：
- 删除资源
- 幂等
- 通常不带 Body

**使用场景**：
```kotlin
// 删除用户
DELETE /api/users/123

// 批量删除
DELETE /api/users?ids=123,456,789
```

**Android 实现**：
```kotlin
// Retrofit
interface ApiService {
    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") userId: String): Response<Unit>
    
    @DELETE("users")
    suspend fun deleteBatchUsers(@QueryMap params: Map<String, List<String>>): Response<Unit>
}

// OkHttp
val request = Request.Builder()
    .url("https://api.example.com/users/123")
    .delete()
    .build()
```

### 3.6 HEAD

**特点**：
- 获取资源元信息（Header）
- 不返回 Body
- 用于检查资源是否存在或是否更新

**使用场景**：
```kotlin
// 检查资源是否更新
HEAD /api/data
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT

// 比较本地缓存的 ETag，如果相同则不需要请求完整资源
```

**Android 实现**：
```kotlin
// Retrofit
interface ApiService {
    @HEAD("data")
    suspend fun checkDataModified(): Response<Unit>
}

// OkHttp
val request = Request.Builder()
    .url("https://api.example.com/data")
    .head()
    .build()

val response = client.newCall(request).execute()
val etag = response.header("ETag")
val lastModified = response.header("Last-Modified")
```

### 3.7 OPTIONS

**特点**：
- 获取服务器的通信选项
- 常用于 CORS（跨域）预检请求

**使用场景**：
```kotlin
// CORS 预检请求
OPTIONS /api/users
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3.8 方法对比表

| 方法 | 用途 | 幂等 | 安全 | 可缓存 | Body |
|------|------|------|------|--------|------|
| GET | 获取资源 | ✅ | ✅ | ✅ | ❌ |
| POST | 创建资源 | ❌ | ❌ | ❌ | ✅ |
| PUT | 更新资源（全量） | ✅ | ❌ | ❌ | ✅ |
| PATCH | 更新资源（部分） | ✅ | ❌ | ❌ | ✅ |
| DELETE | 删除资源 | ✅ | ❌ | ❌ | 可选 |
| HEAD | 获取元信息 | ✅ | ✅ | ✅ | ❌ |
| OPTIONS | 获取选项 | ✅ | ✅ | ❌ | ❌ |

---

## HTTP 状态码

### 4.1 1xx - 信息类

**100 Continue**
```
客户端：发送了 Expect: 100-continue
服务器：100 Continue
客户端：继续发送请求体
```

**101 Switching Protocols**
```
WebSocket 握手时使用
Upgrade: websocket
Connection: Upgrade
```

### 4.2 2xx - 成功类

**200 OK**
- 请求成功
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 137

{
    "id": 1,
    "name": "张三"
}
```

**201 Created**
- 资源创建成功，通常返回新资源的 Location
```http
HTTP/1.1 201 Created
Location: /api/users/123
Content-Type: application/json

{
    "id": 123,
    "name": "李四"
}
```

**202 Accepted**
- 请求已接受，但还未处理完成（异步任务）

**204 No Content**
- 请求成功，但没有返回内容
```kotlin
// DELETE 操作常用
DELETE /api/users/123
HTTP/1.1 204 No Content
```

**206 Partial Content**
- 范围请求（断点续传）
```http
GET /api/file.mp4
Range: bytes=0-1023

HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/1048576
```

### 4.3 3xx - 重定向类

**301 Moved Permanently**
- 永久重定向（SEO 优化）
```http
GET /old-page
HTTP/1.1 301 Moved Permanently
Location: /new-page
```

**302 Found**
- 临时重定向
```http
GET /api/redirect
HTTP/1.1 302 Found
Location: /api/actual-endpoint
```

**304 Not Modified**
- 资源未修改，使用缓存
```kotlin
// 客户端发送
GET /api/data
If-None-Match: "abc123"
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT

// 服务器返回
HTTP/1.1 304 Not Modified
```

**307 Temporary Redirect**
- 临时重定向，保持请求方法

### 4.4 4xx - 客户端错误

**400 Bad Request**
- 请求语法错误或无效参数
```kotlin
// 缺少必填参数
GET /api/users?page=abc  // page 应该是数字
HTTP/1.1 400 Bad Request
{"error": "Invalid page parameter"}
```

**401 Unauthorized**
- 需要认证
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="API"

// Android 实现
interface ApiService {
    @GET("protected")
    suspend fun getProtectedData(): Response<Data>
}

// 拦截器添加 Token
class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()
        return chain.proceed(request)
    }
}
```

**403 Forbidden**
- 已认证但无权限
```http
HTTP/1.1 403 Forbidden
{"error": "You don't have permission to access this resource"}
```

**404 Not Found**
- 资源不存在
```kotlin
// 常见场景
GET /api/users/999  // 用户不存在
GET /api/posts/abc  // 无效的 ID 格式
GET /api/unknown    // 无效的路径

// Android 处理
val response = service.getUser(999)
if (response.isSuccessful) {
    // 处理数据
} else if (response.code() == 404) {
    // 显示"资源不存在"
} else {
    // 其他错误
}
```

**405 Method Not Allowed**
- 请求方法不被支持
```kotlin
GET /api/users     // OK
DELETE /api/users  // 405 Method Not Allowed
```

**408 Request Timeout**
- 请求超时
```kotlin
// OkHttp 配置超时
val client = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .build()
```

**409 Conflict**
- 资源冲突（如重复提交）
```kotlin
POST /api/users
{"name": "张三"}

// 张三已存在
HTTP/1.1 409 Conflict
{"error": "Username already exists"}
```

**410 Gone**
- 资源已被永久删除

**418 I'm a teapot**
- RFC 2324 定义的彩蛋状态码

**429 Too Many Requests**
- 请求过于频繁（限流）
```kotlin
// 实现重试机制
class RetryInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var response = chain.proceed(chain.request())
        var attempt = 0
        
        while (response.code() == 429 && attempt < MAX_RETRY) {
            val retryAfter = response.header("Retry-After")?.toLongOrNull() ?: 1000L
            Thread.sleep(retryAfter)
            response = chain.proceed(chain.request())
            attempt++
        }
        
        return response
    }
}
```

### 4.5 5xx - 服务器错误

**500 Internal Server Error**
- 服务器内部错误
```http
HTTP/1.1 500 Internal Server Error
{"error": "Internal server error", "traceId": "abc-123"}
```

**502 Bad Gateway**
- 网关从上游服务器收到无效响应

**503 Service Unavailable**
- 服务器暂时不可用（过载、维护）
```http
HTTP/1.1 503 Service Unavailable
Retry-After: 300  // 5 分钟后重试
```

**504 Gateway Timeout**
- 网关超时

### 4.6 Android 错误处理

```kotlin
// 统一错误处理
sealed class ApiResult<out T> {
    data class Success<out T>(val data: T) : ApiResult<T>()
    data class Error(val code: Int, val message: String) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

class ApiManager {
    fun <T> execute(call: Call<T>): ApiResult<T> {
        return try {
            val response = call.execute()
            when {
                response.code() in 200..299 -> {
                    ApiResult.Success(response.body()!!)
                }
                response.code() == 401 -> {
                    // Token 过期，跳转到登录页
                    logoutAndRedirect()
                    ApiResult.Error(401, "登录已过期")
                }
                response.code() == 404 -> {
                    ApiResult.Error(404, "资源不存在")
                }
                response.code() == 429 -> {
                    ApiResult.Error(429, "请求过于频繁")
                }
                response.code() in 500..599 -> {
                    ApiResult.Error(response.code(), "服务器错误")
                }
                else -> {
                    ApiResult.Error(response.code(), "请求失败")
                }
            }
        } catch (e: UnknownHostException) {
            ApiResult.Error(0, "网络不可用")
        } catch (e: TimeoutException) {
            ApiResult.Error(0, "请求超时")
        } catch (e: IOException) {
            ApiResult.Error(0, "网络错误")
        }
    }
}
```

---

## 请求头与响应头

### 5.1 通用头（请求和响应都使用）

**Connection**
```http
Connection: keep-alive      // 保持连接
Connection: close           // 关闭连接
```

**Date**
```http
Date: Wed, 15 Apr 2026 00:49:00 GMT
```

### 5.2 请求头

**Accept**
```http
Accept: application/json
Accept: text/html,application/xhtml+xml
Accept: */*
```

**Accept-Encoding**
```http
Accept-Encoding: gzip, deflate, br
```
```kotlin
// OkHttp 默认启用 gzip
val client = OkHttpClient() // 自动处理 gzip 解码
```

**Accept-Language**
```http
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

**Authorization**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization: Basic dXNlcjpwYXNz  // Base64(username:password)
```

**Cache-Control**
```http
Cache-Control: no-cache         // 不使用缓存，但可验证
Cache-Control: no-store         // 不使用缓存，也不存储
Cache-Control: max-age=3600     // 缓存有效期 1 小时
Cache-Control: private          // 私有缓存
Cache-Control: public           // 公共缓存
```

**Cookie**
```http
Cookie: sessionId=abc123; token=xyz789
```

**Content-Length**
```http
Content-Length: 1234
```

**Content-Type**
```http
Content-Type: application/json
Content-Type: application/x-www-form-urlencoded
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Content-Type: image/jpeg
```

**Host**
```http
Host: api.example.com
Host: api.example.com:8080
```

**If-Modified-Since**
```http
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT
```

**If-None-Match**
```http
If-None-Match: "abc123def456"
```

**Range**
```http
Range: bytes=0-999           // 前 1000 字节
Range: bytes=-500            // 最后 500 字节
Range: bytes=500-           // 从第 500 字节到结束
```

**Referer**
```http
Referer: https://www.google.com/search?q=android
```

**User-Agent**
```http
User-Agent: Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36
```

```kotlin
// Android 设置 User-Agent
val userAgent = "MyApp/1.0 (Android ${Build.VERSION.SDK_INT}; ${Build.MODEL})"
val request = Request.Builder()
    .url("https://api.example.com/data")
    .header("User-Agent", userAgent)
    .build()
```

### 5.3 响应头

**Cache-Control**
```http
Cache-Control: max-age=3600, public
```

**Content-Disposition**
```http
Content-Disposition: attachment; filename="report.pdf"
Content-Disposition: inline
```

**Content-Encoding**
```http
Content-Encoding: gzip
Content-Encoding: br  // Brotli
```

**Content-Length**
```http
Content-Length: 12345
```

**Content-Type**
```http
Content-Type: application/json; charset=utf-8
Content-Type: text/html; charset=utf-8
```

**Etag**
```http
ETag: "d41d8cd98f00b204e9800998ecf8427e"
```

**Last-Modified**
```http
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
```

**Location**
```http
Location: /api/users/123
Location: https://example.com/new-url
```

**Server**
```http
Server: nginx/1.18.0
Server: Apache/2.4.41
```

**Set-Cookie**
```http
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
```

### 5.4 Android 中设置和使用请求头

```kotlin
// 全局设置请求头（OkHttp）
val client = OkHttpClient.Builder()
    .addNetworkInterceptor { chain ->
        val originalRequest = chain.request()
        val requestWithHeaders = originalRequest.newBuilder()
            .header("X-App-Version", BuildConfig.VERSION_NAME)
            .header("X-Device-Model", Build.MODEL)
            .header("X-Android-Version", Build.VERSION.SDK_INT.toString())
            .header("X-Request-ID", UUID.randomUUID().toString())
            .build()
        chain.proceed(requestWithHeaders)
    }
    .build()

// 单个请求设置请求头
val request = Request.Builder()
    .url("https://api.example.com/users")
    .header("Authorization", "Bearer $token")
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .build()

// Retrofit 使用 @Header 和 @Headers
interface ApiService {
    // 单个请求头
    @GET("users")
    suspend fun getUsers(
        @Header("Authorization") auth: String
    ): Response<List<User>>
    
    // 多个固定请求头
    @Headers("Accept: application/json", "X-App-Source: android")
    @POST("login")
    suspend fun login(@Body credentials: LoginRequest): Response<AuthToken>
}

// 读取响应头
val response = client.newCall(request).execute()
val contentType = response.header("Content-Type")
val etag = response.header("ETag")
val server = response.header("Server")
val allHeaders = response.headers
```

---

## 连接复用与 Keep-Alive

### 6.1 TCP 连接开销

**三次握手**
```
Client                          Server
  |                               |
  |-------- SYN ----------------->|
  |<------- SYN+ACK --------------|
  |-------- ACK ----------------->|
  | 连接建立                      |
```

**四次挥手**
```
Client                          Server
  |                               |
  |-------- FIN ----------------->|
  |<------- ACK ------------------|
  |-------- FIN ----------------->|
  |<------- ACK ------------------|
  | 连接关闭                      |
```

每次 HTTP 请求的完整开销：
- TCP 握手：1.5 RTT（往返时间）
- TLS 握手：1-2 RTT
- 数据传输：取决于内容大小
- TCP 挥手：1 RTT

### 6.2 Keep-Alive 工作原理

**HTTP/1.0**
```http
GET /index.html HTTP/1.0

// 默认关闭连接，需要时显式启用
Connection: keep-alive
```

**HTTP/1.1**
```http
GET /index.html HTTP/1.1
Host: example.com

// 默认保持连接，需要时显式关闭
Connection: close  // 关闭连接
```

**Keep-Alive 参数**
```http
Connection: keep-alive
Keep-Alive: timeout=5, max=100
```
- `timeout`: 空闲连接保持时间（秒）
- `max`: 最大复用次数

### 6.3 OkHttp 连接管理

```kotlin
val client = OkHttpClient.Builder()
    // 连接池配置
    .connectionPool(ConnectionPool(
        maxSize = 5,              // 最大空闲连接数
        keepAliveDuration = 5,    // 空闲连接保持时间
        TimeUnit.MINUTES
    ))
    .build()

// 连接池工作原理
// 1. 请求到来时，检查是否有可用连接
// 2. 有可用连接 -> 复用
// 3. 无可用连接 -> 新建连接
// 4. 请求完成后，连接放入空闲池
// 5. 超时后自动清理空闲连接
```

**连接复用示例**：
```kotlin
// 同一个域名，复用 TCP 连接
val client = OkHttpClient()

// 第一个请求 - 建立连接
val request1 = Request.Builder()
    .url("https://api.example.com/users")
    .build()

// 第二个请求 - 复用连接
val request2 = Request.Builder()
    .url("https://api.example.com/posts")
    .build()

// 第三个请求 - 不同域名，新建连接
val request3 = Request.Builder()
    .url("https://cdn.example.com/image.jpg")
    .build()

// 第四个请求 - 复用 api.example.com 的连接
val request4 = Request.Builder()
    .url("https://api.example.com/comments")
    .build()
```

### 6.4 连接池最佳实践

```kotlin
// 推荐配置
val connectionPool = ConnectionPool().apply {
    evictionListener = { address, reason ->
        // 连接被移除时的回调
        when (reason) {
            ConnectionPool.CLOSED -> {
                // 连接池关闭
            }
            ConnectionPool.IDLE -> {
                // 空闲超时
            }
            ConnectionPool.MAX_IDLE -> {
                // 超过最大空闲连接数
            }
        }
    }
}

val client = OkHttpClient.Builder()
    .connectionPool(connectionPool)
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .build()

// 重要：全局共享 OkHttpClient 实例
// 不要在每个请求中创建新的 OkHttpClient
object HttpClient {
    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectionPool(connectionPool)
            .build()
    }
}

// 错误示例：每次都创建新客户端
fun wrongExample() {
    val client = OkHttpClient() // ❌ 不会复用连接池
    client.newCall(request).execute()
}

// 正确示例：使用共享客户端
fun correctExample() {
    HttpClient.client.newCall(request).execute() // ✅ 复用连接
}
```

---

## HTTPS 与 TLS 握手

### 7.1 HTTPS 简介

HTTPS = HTTP + TLS/SSL
- 加密传输，防止窃听
- 身份验证，防止假冒
- 数据完整性，防止篡改

### 7.2 TLS 握手过程

**TLS 1.2 握手（完整握手）**
```
Client                                    Server
  |                                           |
  |----- Client Hello ----------------------->|
  |     (支持的密码套件，随机数 ClientRandom)   |
  |                                           |
  |<----- Server Hello -----------------------|
  |     (选择的密码套件，随机数 ServerRandom)  |
  |                                           |
  |<----- Certificate ------------------------|
  |     (服务器证书链)                         |
  |                                           |
  |<----- Server Key Exchange (可选) ---------|
  |                                           |
  |<----- Server Hello Done ------------------|
  |                                           |
  |----- Client Key Exchange ---------------->|
  |     (预主密钥，用服务器公钥加密)            |
  |                                           |
  |----- Change Cipher Spec ----------------->|
  |     (切换为加密通信)                       |
  |                                           |
  |----- Finished ----------------------------|
  |     (验证握手完整性)                       |
  |                                           |
  |<----- Change Cipher Spec -----------------|
  |                                           |
  |<----- Finished ---------------------------|
  |                                           |
  | 加密通信开始                               |
  |<----------------------------------------->|
```

**TLS 1.3 握手（优化）**
```
Client                                    Server
  |                                           |
  |----- Client Hello ----------------------->|
  |     (ClientRandom, 支持套件，密钥共享)     |
  |                                           |
  |<----- Server Hello -----------------------|
  |     (ServerRandom, 密钥共享，Finished)     |
  |                                           |
  |----- Client Finished -------------------->|
  |                                           |
  | 加密通信开始                               |
  |<----------------------------------------->|
```
TLS 1.3 优化：
- 减少往返次数（1-RTT）
- 移除不安全的密码套件
- 支持 0-RTT（会话恢复）

### 7.3 Android HTTPS 实现

**基本使用**：
```kotlin
// 使用 HTTPS，OkHttp 自动处理 TLS
val client = OkHttpClient()

val request = Request.Builder()
    .url("https://api.example.com/data")
    .build()

val response = client.newCall(request).execute()
```

**证书验证失败处理**：
```kotlin
// 开发环境：信任所有证书（⚠️ 仅用于开发）
class UnsafeTrustManager : X509TrustManager {
    override fun checkClientTrusted(chain: Array<out X509Certificate>, authType: String) {}
    override fun checkServerTrusted(chain: Array<out X509Certificate>, authType: String) {}
    override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
}

fun createUnsafeTrustManager(): TrustManager {
    val trustAllCerts = arrayOf<TrustManager>(UnsafeTrustManager())
    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(null, trustAllCerts, SecureRandom())
    return trustAllCerts[0] as X509TrustManager
}

// 生产环境：使用 SSL Pinning（证书锁定）
// 见 06_证书与加密.md
```

**配置自定义证书**：
```kotlin
fun createClientWithCustomCert(cert: InputStream): OkHttpClient {
    // 加载证书
    val cf = CertificateFactory.getInstance("X.509")
    val certChain = listOf(cf.generateCertificate(cert).asX509())
    
    // 创建 TrustManager
    val trustManagerFactory = TrustManagerFactory.getInstance(
        TrustManagerFactory.getDefaultAlgorithm()
    )
    trustManagerFactory.init(null)
    val trustManagers = trustManagerFactory.trustManagers
    val trustManager = trustManagers.first() as X509TrustManager
    
    // 配置 SSLContext
    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(null, arrayOf(trustManager), null)
    
    return OkHttpClient.Builder()
        .sslSocketFactory(sslContext.socketFactory, trustManager)
        .certificatePinner(CertificatePinner.Builder()
            .add("example.com", "sha256/xxxxxx")
            .build()
        )
        .build()
}
```

### 7.4 TLS 性能优化

**会话复用（Session Resumption）**

1. **Session ID**
```
第一次访问（完整握手）
  |----- Client Hello (Session ID = 0) -------->|
  |<---- Server Hello (Session ID = xxx) -------|
  | ... 完整握手 ...                             |

第二次访问（会话复用）
  |----- Client Hello (Session ID = xxx) ------>|
  |<---- Server Hello (Session ID = xxx) -------|
  | 直接加密通信，跳过证书交换                    |
```

2. **Session Tickets (TLS 1.3)**
- 服务器将会话状态加密后发送给客户端
- 客户端存储 ticket，下次连接时带回

**OCSP Stapling**
```
传统 OCSP 验证：
Client -> OCSP Server -> 验证证书状态 -> Client -> 连接

OCSP Stapling:
Client <--- 证书 + OCSP 响应 (服务器已验证) ---> Server
```

**HTTP/2 + TLS 1.3**
```kotlin
// 推荐配置
val client = OkHttpClient.Builder()
    .protocols(listOf(Protocol.HTTP_2, Protocol.H2_PRIOR_KNOWLEDGE))
    .connectionSpecs(listOf(ConnectionSpec.MODERN_TLS))
    .build()
```

### 7.5 HTTPS 常见问题

**证书过期**
```
java.security.cert.CertificateExpiredException: NotAfter: Jan 1, 2025
```
- 检查服务器证书有效期
- 设置证书过期提醒

**证书链不完整**
```
java.security.cert.CertificateException: No subject alternative DNS name matching
```
- 确保服务器配置完整的证书链
- 包含中间证书

**SNI 问题**
```
// 虚拟主机场景
SNI: api.example.com  // 客户端告诉服务器要访问哪个域名
```

---

## HTTP/2 多路复用

### 8.1 队头阻塞问题

**HTTP/1.1 的队头阻塞**
```
Connection 1:
请求 1 (响应中)  ████░░░░░░
请求 2 (等待中) ░░░░░░░░░░
请求 3 (等待中) ░░░░░░░░░░

Connection 2:
请求 4 (响应中)  ████░░░░░░
请求 5 (等待中) ░░░░░░░░░░
```
问题：
- 每个连接串行处理请求
- 慢请求阻塞后续请求
- 需要多个连接来并发（6-8 个）

### 8.2 HTTP/2 帧结构

```
┌─────────────────────────────────────┐
│          Length (24 bits)           │
├─────────────────────────────────────┤
│   Type (8 bits) | Flags (8 bits)    │
├─────────────────────────────────────┤
│      Reserved (1 bit) | Stream ID   │
├─────────────────────────────────────┤
│              Payload                │
└─────────────────────────────────────┘
```

**帧类型**：
```
0x0 - DATA: 请求/响应体
0x1 - HEADERS: HTTP 头部
0x2 - PRIORITY: 优先级设置
0x3 - RST_STREAM: 重置流
0x4 - SETTINGS: 配置参数
0x5 - PUSH_PROMISE: 服务器推送
0x6 - PING: 心跳检测
0x7 - GOAWAY: 关闭连接
0x8 - WINDOW_UPDATE: 流控
0x9 - CONTINUATION: 头部延续
```

### 8.3 多路复用实现

```kotlin
// HTTP/1.1 - 多个连接
val client1 = OkHttpClient.Builder()
    .connectionPool(ConnectionPool(10, 5, TimeUnit.MINUTES)) // 需要多个连接
    .build()

// HTTP/2 - 单个连接多路复用
val client2 = OkHttpClient.Builder()
    .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))  // 更少连接
    .build()

// 自动协商 HTTP/2
// OkHttp 会通过 ALPN (Application-Layer Protocol Negotiation)
// 在 TLS 握手时协商使用 HTTP/2
```

**并发请求示例**：
```kotlin
suspend fun http2MultiplexingDemo() {
    val client = OkHttpClient()
    val dispatcher = Dispatcher()
    
    // 这些请求会在同一个连接中并发传输
    val call1 = client.newCall(
        Request.Builder()
            .url("https://httpbin.org/delay/10")
            .build()
    )
    
    val call2 = client.newCall(
        Request.Builder()
            .url("https://httpbin.org/get")
            .build()
    )
    
    // HTTP/1.1: call2 要等 call1 完成
    // HTTP/2: call2 可以立即响应
    
    val responses = coroutineScope {
        launch { call1.execute() }
        launch { call2.execute() }
        listOf(call1, call2).map { it.await() }
    }
}
```

### 8.4 流控（Flow Control）

```
窗口大小：65535 字节（默认）

客户端：WINDOW_UPDATE (10000)  // 我可以接收 10000 字节
服务器：发送 10000 字节数据

客户端：WINDOW_UPDATE (5000)   // 我还能接收 5000 字节
服务器：发送 5000 字节数据

客户端：WINDOW_UPDATE (0)      // 暂停
服务器：等待更新

客户端：WINDOW_UPDATE (10000)  // 恢复
服务器：继续发送
```

### 8.5 优先级（Priority）

```kotlin
// HTTP/2 优先级
// 每个流可以设置权重和依赖关系

// 示例：页面加载优先级
// index.html (根流，权重 256)
//   ├─ style.css (权重 128)
//   ├─ script.js (权重 128)
//   └─ image.jpg (权重 64)

// 使用 PRIORITY 帧设置
```

### 8.6 HTTP/2 性能对比

| 场景 | HTTP/1.1 | HTTP/2 | 提升 |
|------|----------|--------|------|
| 并发请求数 | 6-8 个连接 | 1 个连接 | 减少连接数 |
| 队头阻塞 | 有 | 无 | 完全解决 |
| 头部开销 | 200-1000 字节 | 压缩后 50-200 字节 | 70-80% |
| 首字节时间 | 500ms | 200ms | 2.5 倍 |
| 页面加载 | 3s | 1.5s | 2 倍 |

---

## 代码示例

### 9.1 完整的 HTTP 客户端封装

```kotlin
object HttpClient {
    
    private val connectionPool = ConnectionPool().apply {
        maxSize = 5
        keepAliveDuration = 5L, TimeUnit.MINUTES
    }
    
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectionPool(connectionPool)
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .addInterceptor(HeaderInterceptor())
        .addInterceptor(RetryInterceptor())
        .build()
    
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
        .addCallAdapterFactory(CoroutineCallAdapterFactory())
        .build()
    
    // 同步请求
    fun execute(request: Request): Response {
        return okHttpClient.newCall(request).execute()
    }
    
    // 异步请求
    fun enqueue(request: Request, callback: Callback) {
        okHttpClient.newCall(request).enqueue(callback)
    }
    
    // 协程支持
    suspend fun suspendExecute(request: Request): Response {
        return okHttpClient.newCall(request).await()
    }
    
    // 取消请求
    fun cancel(call: Call) {
        call.cancel()
    }
    
    // 关闭客户端
    fun shutdown() {
        okHttpClient.dispatcher.executorService.shutdown()
        connectionPool.evictAll()
    }
}

// 请求拦截器
class HeaderInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val requestBuilder = originalRequest.newBuilder()
            .header("X-App-Version", BuildConfig.VERSION_NAME)
            .header("X-Device-Model", Build.MODEL)
            .header("X-Request-ID", UUID.randomUUID().toString())
        
        // 添加认证 Token
        val token = PreferenceManager.getToken()
        if (!token.isNullOrEmpty()) {
            requestBuilder.header("Authorization", "Bearer $token")
        }
        
        return chain.proceed(requestBuilder.build())
    }
}

// 重试拦截器
class RetryInterceptor : Interceptor {
    private val maxRetry = 3
    private val retryDelay = 1000L
    
    @Volatile
    private var retryCount = 0
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        var response = chain.proceed(request)
        
        while (!response.isSuccessful && retryCount < maxRetry) {
            retryCount++
            when (response.code()) {
                429, 500, 502, 503, 504 -> {
                    // 可重试的错误
                    Thread.sleep(retryDelay * retryCount) // 指数退避
                    response = chain.proceed(request)
                }
                else -> {
                    return response
                }
            }
        }
        
        retryCount = 0
        return response
    }
}

// 文件上传
fun uploadFile(context: Context, filePath: String): Response<UploadResult> {
    val file = File(filePath)
    val requestBody = file.asRequestBody(ContentType.parse("image/jpeg"))
    val body = MultipartBody.Part.createFormData("file", file.name, requestBody)
    
    val request = Request.Builder()
        .url("https://api.example.com/upload")
        .post(MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("description", "图片描述")
            .addPart(body)
            .build()
        )
        .build()
    
    return HttpClient.execute(request)
}

// 下载文件
fun downloadFile(url: String, destDir: String): File {
    val request = Request.Builder()
        .url(url)
        .build()
    
    val response = HttpClient.execute(request)
    val inputStream = response.body?.byteStream()
    val responseBodyLength = response.body?.contentLength()
    
    val filename = url.substringAfterLast('/')
    val outputFile = File(destDir, filename)
    
    inputStream?.use { input ->
        FileOutputStream(outputFile).use { output ->
            val buffer = ByteArray(8192)
            var totalRead = 0L
            
            var bytesRead: Int
            while (input.read(buffer).also { bytesRead = it } != -1) {
                output.write(buffer, 0, bytesRead)
                totalRead += bytesRead
                
                // 更新进度
                val progress = (totalRead * 100L / responseBodyLength!!).toInt()
                Log.d("Download", "Progress: $progress%")
            }
        }
    }
    
    return outputFile
}

// 断点续传下载
fun downloadWithResume(url: String, destDir: String): File {
    val filename = url.substringAfterLast('/')
    val outputFile = File(destDir, filename)
    val fromByte = outputFile.length() // 已下载的长度
    
    if (fromByte >= getFileLength(url)) {
        return outputFile // 已下载完成
    }
    
    val request = Request.Builder()
        .url(url)
        .header("Range", "bytes=${fromByte}-")
        .build()
    
    val response = HttpClient.execute(request)
    if (response.code() == 206) { // Partial Content
        val inputStream = response.body?.byteStream()
        val totalLength = getFileLength(url)
        
        inputStream?.use { input ->
            FileOutputStream(outputFile, true).use { output -> // 追加模式
                val buffer = ByteArray(8192)
                var totalRead = 0L
                
                var bytesRead: Int
                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                    totalRead += bytesRead
                    
                    val progress = ((fromByte + totalRead) * 100L / totalLength).toInt()
                    Log.d("Download", "Resumed Progress: $progress%")
                }
            }
        }
    }
    
    return outputFile
}

// 获取文件长度
private fun getFileLength(url: String): Long {
    val request = Request.Builder()
        .url(url)
        .head()
        .build()
    
    val response = HttpClient.execute(request)
    return response.body?.contentLength() ?: 0
}
```

### 9.2 响应解析

```kotlin
// 使用 Gson
class GsonFactory {
    private val gson = GsonBuilder()
        .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERERSCORES)
        .registerTypeAdapter(Date::class.java, JsonDeserializer { json, typeOf, context ->
            val dateFormats = listOf(
                SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()),
                SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()),
                SimpleDateFormat("EEE MMM dd HH:mm:ss z yyyy", Locale.US)
            )
            for (format in dateFormats) {
                try {
                    return@JsonDeserializer format.parse(json.asString)
                } catch (e: Exception) {
                    // Try next format
                }
            }
            throw JsonParseException("Invalid date format")
        })
        .create()
    
    fun <T> fromJson(json: String, type: Type): T = gson.fromJson(json, type)
    fun <T> toJson(object: Any): String = gson.toJson(`object`)
}

// 使用 Moshi
val moshi = Moshi.Builder()
    .add(DateAdapter())
    .add(JsonQualifier())
    .build()

interface ApiService {
    @GET("users")
    fun getUsers(): Call<List<User>>
}
```

### 9.3 拦截器链示例

```kotlin
val client = OkHttpClient.Builder()
    // 应用拦截器：拦截所有请求（包括缓存）
    .addInterceptor(loggingInterceptor)
    .addInterceptor(authInterceptor)
    
    // 网络拦截器：只拦截网络请求
    .addNetworkInterceptor(retryInterceptor)
    .addNetworkInterceptor(cacheInterceptor)
    
    .build()

// 拦截器执行顺序
/*
1. Interceptor (应用) #1
2. Interceptor (应用) #2
3. BridgeInterceptor (处理重定向、重定向等)
4. CacheInterceptor (处理缓存)
5. RetryAndFollowUpInterceptor (重试)
6. ConnectInterceptor (连接)
7. Interceptor (网络) #1
8. Interceptor (网络) #2
9. RealCall (实际的网络请求)
*/
```

---

## 面试考点

### 基础题

**1. HTTP 和 HTTPS 的区别？**

```
HTTP:
- 明文传输，不安全
- 默认端口 80
- 不支持加密

HTTPS:
- HTTP + SSL/TLS，加密传输
- 默认端口 443
- 需要证书，有身份验证
- 性能开销（TLS 握手）
- 支持 HTTP/2
```

**2. 常见的 HTTP 状态码？**

```
200 OK - 成功
201 Created - 资源创建成功
204 No Content - 成功但无内容
301 Moved Permanently - 永久重定向
302 Found - 临时重定向
304 Not Modified - 缓存有效
400 Bad Request - 请求错误
401 Unauthorized - 未授权
403 Forbidden - 禁止访问
404 Not Found - 资源不存在
408 Request Timeout - 请求超时
500 Internal Server Error - 服务器错误
502 Bad Gateway - 网关错误
503 Service Unavailable - 服务不可用
504 Gateway Timeout - 网关超时
```

**3. GET 和 POST 的区别？**

```
GET:
- 获取资源
- 参数在 URL 中
- 幂等、安全、可缓存
- 有长度限制

POST:
- 创建资源
- 参数在 Body 中
- 不幂等、不安全、不缓存
- 无长度限制
```

**4. HTTP 请求由哪些部分组成？**

```
请求行（方法 + URL + 协议版本）
请求头（Header）
空行
请求体（Body，可选）
```

### 进阶题

**1. 如何优化 HTTP 请求性能？**

```
1. 连接复用：使用 Keep-Alive
2. 启用 HTTP/2：多路复用
3. 启用压缩：Gzip、Brotli
4. 使用 CDN：就近访问
5. 缓存策略：Etag、Cache-Control
6. 减少请求数：请求合并、资源合并
7. 异步加载：避免阻塞主线程
8. 预加载：预测用户行为
```

**2. 什么是队头阻塞？HTTP/2 如何解决？**

```
队头阻塞：TCP 连接中，某个请求慢导致后续请求阻塞

HTTP/2 解决：
- 二进制帧格式
- 多路复用：多个请求在同一连接并发
- 头部压缩（HPACK）
- 服务器推送
```

**3. HTTPS 的 TLS 握手过程？**

```
1. Client Hello：客户端发起，发送支持的密码套件和随机数
2. Server Hello：服务器响应，选择密码套件，发送证书和随机数
3. Certificate：服务器证书链
4. Server Key Exchange（可选）：密钥交换参数
5. Client Key Exchange：客户端生成预主密钥，用服务器公钥加密发送
6. Change Cipher Spec：切换加密
7. Finished：验证握手完整性
8. 开始加密通信
```

**4. 如何防止中间人攻击？**

```
1. HTTPS：加密传输
2. 证书验证：检查证书链和域名
3. SSL Pinning：锁定证书指纹
4. 双向认证：客户端证书
```

**5. Cookie 和 Session 的区别？**

```
Cookie:
- 存储在客户端
- 明文传输（可加密）
- 有大小限制（4KB）
- 需要手动管理

Session:
- 存储在服务器端
- 更安全
- 占用服务器资源
- 分布式场景需要特殊处理

Token (JWT):
- 无状态
- 适合分布式
- 可携带更多信息
- 过期需要重新获取
```

### 高级题

**1. HTTP/2 相比 HTTP/1.1 的主要改进？**

```
1. 二进制协议
   - 更高效的数据处理
   - 更少的解析错误

2. 多路复用
   - 单连接并发多个请求
   - 解决队头阻塞

3. 头部压缩
   - HPACK 算法
   - 大幅减少头部开销

4. 服务器推送
   - 服务器主动推送资源
   - 减少请求往返

5. 流控
   - 基于窗口的流控
   - 防止发送方过快

6. 优先级
   - 设置请求优先级
   - 优化用户体验
```

**2. OkHttp 的拦截器工作原理？**

```
拦截器类型：
- 应用拦截器：处理所有请求（包括缓存）
- 网络拦截器：只处理网络请求

执行顺序：
1. 应用拦截器（从头到尾）
2. 内置拦截器（重定向、缓存、重试、连接）
3. 网络拦截器（从头到尾）
4. 实际的 Socket 请求

响应流程：
- 网络 -> 拦截器链反向返回 -> 应用
```

**3. 连接池如何优化？**

```
优化策略：
1. 设置合理的最大空闲连接数
2. 设置合理的空闲时间
3. 全局共享 OkHttpClient
4. 监控连接池状态
5. 根据业务场景调整参数

最佳实践：
- 全局单例 OkHttpClient
- 连接池参数：maxSize=5-10, keepAlive=5 分钟
- 监控连接复用率
```

**4. HTTP 缓存机制详解？**

```
缓存控制：
1. Strong Cache（强缓存）
   - Cache-Control: max-age=3600
   - Expires: 过期时间
   - 直接使用缓存，不访问服务器

2. Negotiated Cache（协商缓存）
   - Etag + If-None-Match
   - Last-Modified + If-Modified-Since
   - 304 Not Modified

3. 缓存优先级
   - 强缓存 > 协商缓存
   - Cache-Control > Expires

4. 缓存位置
   - 浏览器缓存
   - 中间缓存（CDN、代理）
   - 服务器缓存
```

**5. 如何实现弱网优化？**

```
1. 降低图片质量
2. 图片懒加载
3. 接口预加载
4. 请求压缩
5. 连接池优化
6. 离线缓存
7. 降级策略
8. 数据分片
```

**6. HTTP/3 的核心改进？**

```
1. 基于 UDP（QUIC 协议）
   - 更快的连接建立（0-RTT）
   - 更好的队头阻塞解决

2. 连接迁移
   - 切换网络不中断
   - 移动网络场景优化

3. 内置加密
   - 类似 TLS 1.3
   - 更安全的传输

4. 独立的流
   - 丢包只影响单个流
   - 更好的并发性能
```

---

## 总结

### 核心要点

1. **HTTP 版本演进**
   - HTTP/1.1：持久连接、Host 头
   - HTTP/2：多路复用、头部压缩、二进制协议
   - HTTP/3：基于 QUIC、解决队头阻塞

2. **请求方法**
   - GET：获取资源、幂等、可缓存
   - POST：创建资源、不幂等
   - PUT：完整更新、幂等
   - PATCH：部分更新、幂等
   - DELETE：删除资源、幂等

3. **状态码**
   - 2xx：成功
   - 3xx：重定向
   - 4xx：客户端错误
   - 5xx：服务器错误

4. **HTTPS**
   - TLS 握手过程
   - 证书验证
   - SSL Pinning

5. **性能优化**
   - 连接复用
   - HTTP/2 多路复用
   - 头部压缩
   - 缓存策略

### 最佳实践

```kotlin
// 全局共享 OkHttpClient
object ApiClient {
    val client: OkHttpClient = OkHttpClient.Builder()
        .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(AuthInterceptor())
        .addInterceptor(LoggingInterceptor())
        .build()
}

// 使用 Retrofit 封装 API
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User
    
    @POST("login")
    suspend fun login(@Body credentials: LoginReq): AuthToken
}

// 错误处理
sealed class Result<out T> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Error(val message: String, val code: Int) : Result<Nothing>()
}
```

### 常见面试问题速查

```
Q: GET 和 POST 的区别？
A: 用途、参数位置、幂等性、缓存、安全性

Q: HTTPS 比 HTTP 多什么？
A: TLS 层，加密、认证、完整性

Q: HTTP/2 的主要改进？
A: 多路复用、头部压缩、二进制协议、服务器推送

Q: 如何优化网络请求？
A: 连接池、缓存、压缩、HTTP/2、CDN

Q: Cookie 和 Token 的区别？
A: 存储位置、安全性、适用场景

Q: 什么是 304 状态码？
A: 协商缓存，资源未修改

Q: 如何防止中间人攻击？
A: HTTPS、证书验证、SSL Pinning

Q: OkHttp 的拦截器分类？
A: 应用拦截器、网络拦截器

Q: 连接池如何工作？
A: 按域名管理连接、超时回收、全局共享
```

---

## 参考资料

1. [HTTP/1.1 规范](https://httpwg.org/specs/rfc7230.html)
2. [HTTP/2 规范](https://httpwg.org/specs/rfc7540.html)
3. [HTTP/3 规范](https://httpwg.org/specs/rfc9114.html)
4. [OkHttp 官方文档](https://square.github.io/okhttp/)
5. [TLS 1.3 规范](https://datatracker.ietf.org/doc/html/rfc8446)
6. [Android Networking 最佳实践](https://developer.android.com/topic/performance/network)

---

*本文约 12000 字，涵盖了 HTTP 协议的核心知识点，适合作为 Android 网络编程面试的准备资料。*
