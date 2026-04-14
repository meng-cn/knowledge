# 08_OkHttp 底层

## 目录

- [OkHttp 概述](#okhttp-概述)
- [OkHttp 架构](#okhttp-架构)
- [拦截器链](#拦截器链)
- [连接池管理](#连接池管理)
- [HTTP 缓存](#http-缓存)
- [异步请求](#异步请求)
- [源码分析](#源码分析)
- [性能调优](#性能调优)
- [代码示例](#代码示例)
- [面试考点](#面试考点)

---

## OkHttp 概述

### 1.1 什么是 OkHttp

OkHttp 是 Square 公司开源的 HTTP 客户端库，由 Java 和 Kotlin 编写，支持 Android 和 Java 平台。它已成为 Android 网络请求的事实标准。

**核心特性**：
- 高性能的 HTTP 客户端
- 支持 HTTP/1.1、HTTP/2、HTTP/3
- 内置连接池
- 支持拦截器
- 支持 WebSocket
- 自动重试和重定向
- 完善的缓存机制

### 1.2 发展历程

```
2011 年：OkHttp 1.0 发布
2015 年：OkHttp 3.0 支持 HTTP/2
2017 年：OkHttp 4.0 支持 Kotlin 协程
2020 年：OkHttp 4.9+ 持续优化
2024 年：OkHttp 5.0 支持 HTTP/3
```

### 1.3 为什么选择 OkHttp

**对比 HttpClient**：
```
HttpClient:
- 老牌库，已过时
- 无 HTTP/2 支持
- 性能较差
- API 复杂

OkHttp:
- 活跃维护
- HTTP/2 原生支持
- 性能优异
- API 简洁
```

**对比 Volley**：
```
Volley:
- Google 开发，不再维护
- 队列管理
- 缓存机制

OkHttp:
- Square 开发，活跃维护
- 连接池
- 拦截器机制
```

---

## OkHttp 架构

### 2.1 整体架构

```
┌────────────────────────────────────┐
│         应用层                      │
│   Call / CallAdapter               │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        Dispatcher                  │
│    (调度器，管理异步请求)           │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        OkHttpClient                │
│      (配置和拦截器链)               │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        Interceptor Chain           │
│      (拦截器链)                    │
├─────────────────────────────────────┤
│  - Application Interceptors         │
│  - RetryAndFollowUpInterceptor      │
│  - BridgeInterceptor               │
│  - CacheInterceptor                │
│  - ConnectInterceptor              │
│  - Network Interceptors            │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        ConnectionPool              │
│      (连接池管理)                  │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        HttpCodec                   │
│    (HTTP 编码解码)                 │
│  - Http1Codec                      │
│  - Http2Codec                      │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        Socket                      │
│      (TCP/HTTP/2 连接)              │
└────────────────────────────────────┘
```

### 2.2 核心组件

**OkHttpClient**：
```kotlin
class OkHttpClient {
    // 拦截器
    private val applicationInterceptors: List<Interceptor>
    private val networkInterceptors: List<Interceptor>
    
    // 连接池
    private val connectionPool: ConnectionPool
    
    // 缓存
    private val cache: Cache?
    
    // 调度器
    private val dispatcher: Dispatcher
    
    // 超时配置
    private val connectTimeout: Duration
    private val readTimeout: Duration
    private val writeTimeout: Duration
    
    // 协议支持
    private val protocols: List<Protocol>
    
    // DNS
    private val dns: Dns
}
```

**Call**：
```kotlin
interface Call {
    fun execute(): Response
    fun enqueue(callback: Callback)
    fun cancel()
    fun isExecuted(): Boolean
    fun isCanceled(): Boolean
    fun request(): Request
}

// RealCall：实际的调用实现
class RealCall(
    val client: OkHttpClient,
    val originalRequest: Request
) : Call {
    // 执行请求
}
```

**Dispatcher**：
```kotlin
class Dispatcher {
    // 正在执行的异步请求队列
    private val runningAsyncCalls: SynchronousQueue<ExecutableCall>
    
    // 等待执行的异步请求队列
    private val readyAsyncCalls: PriorityDeque<ExecutableCall>
    
    // 正在执行的同步请求队列
    private val runningSyncCalls: SynchronousQueue<ExecutableCall>
    
    // 等待执行的同步请求队列
    private val readySyncCalls: PriorityDeque<ExecutableCall>
    
    // 最大并发数
    private var maxRequests: Int = 64
    private var maxRequestsPerHost: Int = 5
    
    // 线程池
    private val executorService: ExecutorService
}
```

### 2.3 请求流程

**完整的请求流程**：
```
1. 创建 Request
2. 创建 Call（RealCall）
3. 添加到 Dispatcher 队列
4. 执行拦截器链
5. 获取连接（从连接池或新建）
6. 发送请求
7. 接收响应
8. 拦截器链返回
9. 回调结果
```

**流程图**：
```
用户代码
   │
   ▼
Request + OkHttpClient
   │
   ▼
RealCall
   │
   ▼
Dispatcher（异步时）
   │
   ▼
拦截器链开始
   │
   ├─ Application Interceptor #1
   ├─ Application Interceptor #2
   ├─ RetryAndFollowUpInterceptor
   ├─ BridgeInterceptor
   ├─ CacheInterceptor
   ├─ ConnectInterceptor
   ├─ Network Interceptor #1
   ├─ Network Interceptor #2
   │
   ▼
Socket 通信
   │
   ▼
响应处理（反向）
   │
   ▼
回调结果
```

---

## 拦截器链

### 3.1 拦截器类型

**两种拦截器**：

1. **应用拦截器（Application Interceptor）**
```kotlin
// 拦截所有请求（包括缓存）
client.addInterceptor(loggingInterceptor)
```

2. **网络拦截器（Network Interceptor）**
```kotlin
// 只拦截实际网络请求
client.addNetworkInterceptor(retryInterceptor)
```

### 3.2 拦截器执行顺序

**完整的执行顺序**：
```
┌─────────────────────────────────────┐
│ 1. Application Interceptor #1       │
│    - 记录日志                       │
│    - 添加通用 Header                 │
├─────────────────────────────────────┤
│ 2. Application Interceptor #2       │
│    - Token 刷新                     │
│    - 请求重试                       │
├─────────────────────────────────────┤
│ 3. RetryAndFollowUpInterceptor      │
│    - 自动重试                       │
│    - 处理重定向                     │
├─────────────────────────────────────┤
│ 4. BridgeInterceptor               │
│    - 处理 Cookie                    │
│    - 处理 Content-Length            │
│    - 处理 Accept-Encoding           │
├─────────────────────────────────────┤
│ 5. CacheInterceptor                │
│    - 检查缓存                       │
│    - 返回缓存或继续                 │
├─────────────────────────────────────┤
│ 6. ConnectInterceptor              │
│    - 获取连接                       │
│    - 建立 TCP/TLS 连接               │
├─────────────────────────────────────┤
│ 7. Network Interceptor #1           │
│    - 添加网络相关 Header            │
├─────────────────────────────────────┤
│ 8. Network Interceptor #2           │
│    - 记录网络耗时                   │
├─────────────────────────────────────┤
│ 9. RealCall.blackBoxInterceptor    │
│    - SSL Pinning                    │
└─────────────────────────────────────┘
         │
         ▼
    Socket 通信
```

**响应返回顺序**（反向）：
```
Socket 响应
   │
   ▼
9 <- 8 <- 7 <- 6 <- 5 <- 4 <- 3 <- 2 <- 1
```

### 3.3 内置拦截器详解

**RetryAndFollowUpInterceptor**：
```kotlin
class RetryAndFollowUpInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        var response: Response?
        
        // 重试循环
        for (i in 0 until retryCount + 1) {
            try {
                response = chain.proceed(request)
                
                // 处理重定向
                if (response.code == 301 || response.code == 302) {
                    val location = response.header("Location")
                    request = request.newBuilder()
                        .url(location)
                        .build()
                    continue
                }
                
                return response
            } catch (e: IOException) {
                // 可重试的错误
                if (isRetryable(e)) {
                    continue
                }
                throw e
            }
        }
        
        throw IOException("Failed after $retryCount retries")
    }
}
```

**BridgeInterceptor**：
```kotlin
class BridgeInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        
        // 处理 Cookie
        val cookieHeader = request.header("Cookie")
        if (cookieHeader != null) {
            request = request.newBuilder()
                .header("Cookie", cookieHeader)
                .build()
        }
        
        // 处理 Content-Length
        if (request.body != null && request.header("Content-Length") == null) {
            request = request.newBuilder()
                .header("Content-Length", request.body!!.contentLength().toString())
                .build()
        }
        
        // 处理 Accept-Encoding
        if (request.header("Accept-Encoding") == null) {
            request = request.newBuilder()
                .header("Accept-Encoding", "gzip")
                .build()
        }
        
        val response = chain.proceed(request)
        
        // 处理响应 Cookie
        // ...
        
        return response
    }
}
```

**CacheInterceptor**：
```kotlin
class CacheInterceptor : Interceptor {
    private val cache: Cache
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        // 检查是否只使用缓存
        val onlyIfCached = request.cacheControl.onlyIfCached()
        if (onlyIfCached && cache == null) {
            return noCacheResponse(request)
        }
        
        // 从缓存获取
        val cacheResponse = cache.get(request)
        
        // 缓存命中且有效
        if (cacheResponse != null && isCacheValid(cacheResponse, request)) {
            return cacheResponse
        }
        
        // 网络请求
        val networkResponse = chain.proceed(request)
        
        // 写入缓存
        if (canCache(networkResponse, request)) {
            cache.write(request, networkResponse)
        }
        
        return networkResponse
    }
}
```

**ConnectInterceptor**：
```kotlin
class ConnectInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val realChain = chain as RealInterceptorChain
        val address = realChain.address()
        var connection = realChain.connection()
        
        // 如果没有连接，建立新连接
        if (connection == null) {
            connection = realChain.connectionPool().acquire(
                address,
                realChain.request(),
                0,
                Protocol.HTTP_2
            )
            
            realChain.connection = connection
        }
        
        // 创建 HTTP 编码器
        val httpCodec = connection.newHttpCodec(realChain)
        
        try {
            return httpCodec.readResponse()
        } finally {
            httpCodec.end()
        }
    }
}
```

### 3.4 自定义拦截器

**日志拦截器**：
```kotlin
class LoggingInterceptor : Interceptor {
    private val logger = Logger()
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val start = System.nanoTime()
        
        logger.log(
            "\n--- REQUEST ---\n" +
            "${request.method} ${request.url}\n" +
            "${request.headers}\n" +
            "${request.body?.let { logger.logBody(it) }}"
        )
        
        val response = chain.proceed(request)
        
        val duration = (System.nanoTime() - start) / 1_000_000
        
        logger.log(
            "\n--- RESPONSE ---\n" +
            "${response.code} ${response.message}\n" +
            "${response.headers}\n" +
            "${response.body?.let { logger.logBody(it) }}\n" +
            "Duration: $duration ms"
        )
        
        return response
    }
}
```

**认证拦截器**：
```kotlin
class AuthInterceptor : Interceptor {
    private val tokenManager: TokenManager
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        // 添加 Token
        val token = tokenManager.getToken()
        val requestWithToken = request.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
        
        val response = chain.proceed(requestWithToken)
        
        // Token 过期，刷新后重试
        if (response.code == 401) {
            val newToken = tokenManager.refreshToken()
            val requestWithNewToken = request.newBuilder()
                .header("Authorization", "Bearer $newToken")
                .build()
            
            return chain.proceed(requestWithNewToken)
        }
        
        return response
    }
}
```

**重试拦截器**：
```kotlin
class RetryInterceptor : Interceptor {
    private val maxRetries = 3
    private val retryDelay = 1000L
    
    override fun intercept(chain: Interceptor.Chain): Response {
        var attempt = 0
        var response: Response
        
        while (true) {
            try {
                response = chain.proceed(chain.request())
                
                if (response.isSuccessful || !isRetryable(response.code)) {
                    return response
                }
                
            } catch (e: IOException) {
                if (attempt >= maxRetries || !isRetryable(e)) {
                    throw e
                }
            }
            
            attempt++
            Thread.sleep(retryDelay * attempt) // 指数退避
        }
    }
    
    private fun isRetryable(code: Int): Boolean {
        return code in listOf(408, 429, 500, 502, 503, 504)
    }
    
    private fun isRetryable(exception: IOException): Boolean {
        return exception is SocketTimeoutException || 
               exception is UnknownHostException
    }
}
```

---

## 连接池管理

### 4.1 连接池原理

**连接池的作用**：
```
1. 复用 TCP 连接，减少握手开销
2. 控制并发连接数
3. 管理连接生命周期
```

**连接池结构**：
```
ConnectionPool {
    // 空闲连接列表
    private val idleConnections: ConcurrentLinkedQueue<RealConnection>
    
    // 正在使用的连接
    private val connections: List<RealConnection>
    
    // 最大空闲连接数
    private val maxSize: Int
    
    // 空闲连接保持时间
    private val keepAliveDuration: Duration
    
    // 清理线程
    private val cleaner: ExecutorService
}
```

### 4.2 连接复用策略

**域名级别复用**：
```kotlin
// 同一域名的请求复用连接
val request1 = Request.Builder()
    .url("https://api.example.com/users")
    .build()

val request2 = Request.Builder()
    .url("https://api.example.com/posts")
    .build()

// request1 和 request2 会复用同一个 TCP 连接
```

**HTTP/2 多路复用**：
```kotlin
// HTTP/2 可以在同一个连接上并发多个请求
val client = OkHttpClient.Builder()
    .protocols(listOf(Protocol.HTTP_2, Protocol.HTTP_1_1))
    .build()
```

### 4.3 连接池配置

**默认配置**：
```kotlin
val client = OkHttpClient()
// 默认：maxSize=5, keepAlive=5 分钟
```

**自定义配置**：
```kotlin
val connectionPool = ConnectionPool().apply {
    // 最大空闲连接数
    maxSize = 10
    
    // 空闲连接保持时间
    keepAliveDuration = 10L, TimeUnit.MINUTES
    
    // 清理监听器
    evictionListener = { address, reason ->
        when (reason) {
            ConnectionPool.CLOSED -> {
                Log.d("Pool", "Connection closed: $address")
            }
            ConnectionPool.IDLE -> {
                Log.d("Pool", "Connection idle timeout: $address")
            }
            ConnectionPool.MAX_IDLE -> {
                Log.d("Pool", "Connection max idle: $address")
            }
        }
    }
}

val client = OkHttpClient.Builder()
    .connectionPool(connectionPool)
    .build()
```

### 4.4 连接池监控

**监控连接池状态**：
```kotlin
class ConnectionPoolMonitor {
    fun monitor(pool: ConnectionPool) {
        // 通过反射获取内部状态
        val idleConnectionsField = pool::class.java
            .getDeclaredField("idleConnections")
        idleConnectionsField.isAccessible = true
        
        val connectionsField = pool::class.java
            .getDeclaredField("connections")
        connectionsField.isAccessible = true
        
        val idleConnections = idleConnectionsField.get(pool) as Queue<*>
        val connections = connectionsField.get(pool) as List<*>
        
        Log.d("Pool", "Idle: ${idleConnections.size}, Total: ${connections.size}")
    }
}
```

### 4.5 连接池最佳实践

**全局共享 OkHttpClient**：
```kotlin
object ApiClient {
    private val connectionPool = ConnectionPool().apply {
        maxSize = 10
        keepAliveDuration = 10L, TimeUnit.MINUTES
    }
    
    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectionPool(connectionPool)
            .build()
    }
}

// ✅ 正确：全局共享
fun makeRequest() {
    ApiClient.client.newCall(request).execute()
}

// ❌ 错误：每次都创建新客户端
fun makeRequestWrong() {
    val client = OkHttpClient() // 不会复用连接池
    client.newCall(request).execute()
}
```

---

## HTTP 缓存

### 5.1 缓存原理

**HTTP 缓存标准**：
```
遵循 RFC 7234 HTTP Caching 标准

缓存控制头：
- Cache-Control
- Expires
- ETag
- Last-Modified
```

**缓存验证流程**：
```
1. 检查强缓存（Cache-Control/Expires）
   └─ 有效 -> 直接返回缓存

2. 检查协商缓存（ETag/Last-Modified）
   └─ 未修改 -> 返回 304
   └─ 已修改 -> 返回新资源

3. 无缓存 -> 网络请求
```

### 5.2 配置 HTTP 缓存

**创建缓存目录**：
```kotlin
val cacheDir = context.cacheDir.resolve("http_cache")
val cacheSize = 100L * 1024 * 1024 // 100MB

val cache = Cache(cacheDir, cacheSize)

val client = OkHttpClient.Builder()
    .cache(cache)
    .build()
```

**缓存策略配置**：
```kotlin
// 强缓存 1 小时
val request = Request.Builder()
    .url("https://api.example.com/data")
    .header("Cache-Control", "max-age=3600")
    .build()

// 不使用缓存
val request = Request.Builder()
    .url("https://api.example.com/data")
    .header("Cache-Control", "no-cache")
    .build()

// 离线模式（只使用缓存）
val request = Request.Builder()
    .url("https://api.example.com/data")
    .header("Cache-Control", "only-if-cached, max-stale=604800")
    .build()
```

### 5.3 缓存拦截器

**自定义缓存策略**：
```kotlin
class CacheControlInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        // 检查网络状态
        val isConnected = isNetworkAvailable()
        
        if (!isConnected) {
            // 离线模式
            val offlineRequest = request.newBuilder()
                .removeHeader("Pragma")
                .header("Cache-Control", "public, only-if-cached, max-stale=604800")
                .build()
            
            val response = chain.proceed(offlineRequest)
            
            if (response.code == 504) {
                return Response.Builder()
                    .request(offlineRequest)
                    .protocol(response.protocol)
                    .code(504)
                    .message("Offline")
                    .body(ResponseBody.create(null, "离线"))
                    .build()
            }
            
            return response
        }
        
        // 在线模式
        val onlineRequest = request.newBuilder()
            .removeHeader("Pragma")
            .header("Cache-Control", "max-age=3600")
            .build()
        
        val response = chain.proceed(onlineRequest)
        
        // 添加缓存头
        return response.newBuilder()
            .header("Cache-Control", "max-age=3600")
            .build()
    }
}
```

### 5.4 缓存管理

**清除缓存**：
```kotlin
// 清除单个缓存
cache.remove(request)

// 清除所有缓存
cache.evictAll()

// 清理过期缓存
cache.cleanUp()
```

**缓存统计**：
```kotlin
val cache = client.cache!!
val size = cache.size()
val maxSize = cache.maximumSize()
val requestCount = cache.requestCount()
val networkCount = cache.networkCount()
```

---

## 异步请求

### 6.1 异步执行机制

**Dispatcher 调度器**：
```kotlin
class Dispatcher {
    // 异步请求线程池
    private val executorService: ExecutorService = ThreadPoolExecutor(
        0,
        Int.MAX_VALUE,
        60L,
        TimeUnit.SECONDS,
        SynchronousQueue(),
        ThreadFactory.Builder("OkHttp Dispatcher").build()
    )
    
    // 最大并发数
    private var maxRequests = 64
    
    // 每主机最大并发数
    private var maxRequestsPerHost = 5
    
    // 正在执行的异步请求
    private val runningAsyncCalls: AtomicInteger
    
    // 等待的异步请求
    private val readyAsyncCalls: Deque<AsyncCall>
    
    // 正在执行的同步请求
    private val runningSyncCalls: AtomicInteger
    
    // 等待的同步请求
    private val readySyncCalls: Deque<AsyncCall>
}
```

**执行流程**：
```
1. enqueue() 添加到 Dispatcher
2. Dispatcher 检查并发限制
3. 从线程池获取线程
4. 执行请求
5. 回调结果
6. 释放资源
```

### 6.2 异步请求实现

**enqueue 执行**：
```kotlin
override fun enqueue(responseCallback: Callback) {
    val asyncCall = toAsyncCall()
    
    // 检查是否已执行或已取消
    if (asyncCall.eventCount != 0) {
        throw IllegalStateException("Already executed")
    }
    
    // 添加到调度器
    client.dispatcher().enqueue(asyncCall)
}

// AsyncCall 实现 Runnable
private inner class AsyncCall(
    private val call: RealCall,
    private val responseCallback: Callback
) : Runnable {
    override fun run() {
        try {
            val response = call.getReadResponse()
            responseCallback.onResponse(this, response)
        } catch (e: IOException) {
            responseCallback.onFailure(this, e)
        }
    }
}
```

### 6.3 协程支持

**使用 suspend 函数**：
```kotlin
// 添加协程适配器
val retrofit = Retrofit.Builder()
    .addCallAdapterFactory(CoroutineCallAdapterFactory())
    .build()

interface ApiService {
    @GET("users")
    suspend fun getUsers(): List<User>
}

// 使用
lifecycleScope.launch {
    try {
        val users = apiService.getUsers()
        // 处理结果
    } catch (e: Exception) {
        // 处理错误
    }
}
```

**手动实现协程调用**：
```kotlin
suspend fun <T> Call.await(): Response<T> {
    return suspendCancellableCoroutine { continuation ->
        enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                continuation.resumeWith(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                continuation.resumeWith(Result.success(response))
            }
        })
        
        continuation.invokeOnCancellation {
            cancel()
        }
    }
}

// 使用
val response = call.await()
```

### 6.4 并发控制

**限制并发数**：
```kotlin
val dispatcher = Dispatcher().apply {
    maxRequests = 32  // 总并发数
    maxRequestsPerHost = 3  // 每主机并发数
}

val client = OkHttpClient.Builder()
    .dispatcher(dispatcher)
    .build()
```

**自定义线程池**：
```kotlin
val executor = ThreadPoolExecutor(
    4,
    16,
    60L,
    TimeUnit.SECONDS,
    LinkedBlockingQueue(100),
    ThreadFactory.Builder("Custom OkHttp").build(),
    ThreadPoolExecutor.CallerRunsPolicy()
)

val dispatcher = Dispatcher(executor)
```

---

## 源码分析

### 7.1 Request 到 Response 的完整流程

**详细流程**：
```kotlin
fun execute(request: Request): Response {
    // 1. 创建 RealCall
    val call = client.newCall(request)
    
    // 2. 执行拦截器链
    val response = call.execute()
    
    return response
}

// RealCall.execute()
fun execute(): Response {
    // 3. 检查是否已执行
    check(!executed)
    
    // 4. 构建拦截器链
    val interceptors = buildInterceptorChain()
    
    // 5. 执行链
    val response = proceedInterceptors(interceptors)
    
    return response
}

// 构建拦截器链
fun buildInterceptorChain(): List<Interceptor> {
    return mutableListOf<Interceptor>().apply {
        // 应用拦截器
        addAll(client.applicationInterceptors)
        
        // 内置拦截器
        add(RetryAndFollowUpInterceptor(client))
        add(BridgeInterceptor(client.cookieJar))
        add(FollowUpInterceptor(client))
        add(CacheInterceptor(client.cache))
        add(ConnectInterceptor(client))
        
        // 网络拦截器
        addAll(client.networkInterceptors)
        
        // 核心拦截器
        add(ResponseSourceInterceptor())
    }
}
```

### 7.2 连接获取流程

**连接获取**：
```kotlin
fun acquire(address: Address, request: Request): RealConnection {
    // 1. 尝试复用现有连接
    for (connection in connections) {
        if (connection.isHealthy() && connection.route.address == address) {
            return connection
        }
    }
    
    // 2. 尝试复用空闲连接
    val idleConnection = idleConnections.pollFirst()
    if (idleConnection != null && idleConnection.isHealthy()) {
        return idleConnection
    }
    
    // 3. 创建新连接
    val newConnection = RealConnection(client, address)
    newConnection.connect()
    
    return newConnection
}
```

### 7.3 HTTP/2 支持

**HTTP/2 协商**：
```kotlin
// ALPN 协议协商
class AlpnEventAdapter {
    override fun selectProtocol(
        protocols: List<Protocol>
    ): Protocol {
        // 尝试 HTTP/2
        if (protocols.contains(Protocol.H2_PRIOR_KNOWLEDGE)) {
            return Protocol.H2_PRIOR_KNOWLEDGE
        }
        
        if (protocols.contains(Protocol.HTTP_2)) {
            return Protocol.HTTP_2
        }
        
        return Protocol.HTTP_1_1
    }
}
```

### 7.4 超时处理

**超时机制**：
```kotlin
class Timeout {
    private val timeoutDuration: Long
    private var deadline: Long = 0
    
    fun enter() {
        // 检查是否超时
        if (System.nanoTime() > deadline) {
            throw IOException("Timeout")
        }
        
        // 设置 deadline
        deadline = System.nanoTime() + timeoutDuration
    }
    
    fun remain(): Long {
        return maxOf(0, deadline - System.nanoTime())
    }
}
```

---

## 性能调优

### 8.1 连接池调优

**优化参数**：
```kotlin
val connectionPool = ConnectionPool().apply {
    // 根据业务调整最大连接数
    maxSize = 20  // 默认 5
    
    // 延长空闲时间
    keepAliveDuration = 15L, TimeUnit.MINUTES  // 默认 5
}
```

**监控连接复用**：
```kotlin
val connectionPool = ConnectionPool().apply {
    evictionListener = { address, reason ->
        // 记录连接被移除的情况
        Log.d("Connection", "Removed: $address, Reason: $reason")
    }
}
```

### 8.2 缓存调优

**优化缓存大小**：
```kotlin
// 根据可用空间调整
val cacheSize = Runtime.getRuntime().maxMemory() / 10
val cache = Cache(cacheDir, cacheSize)
```

### 8.3 并发调优

**调整并发限制**：
```kotlin
val dispatcher = Dispatcher().apply {
    // 根据业务调整
    maxRequests = 32
    maxRequestsPerHost = 5
}
```

### 8.4 网络层调优

**DNS 优化**：
```kotlin
class DnsCache : Dns {
    private val cache = LruCache<String, List<InetSocketAddress>>(100)
    
    override fun lookup(hostname: String): List<InetSocketAddress> {
        return cache.get(hostname) ?: run {
            val result = InetAddress.getAllByName(hostname)
                .toList()
                .map { InetSocketAddress(it, 443) }
            cache.put(hostname, result)
            result
        }
    }
}

val client = OkHttpClient.Builder()
    .dns(DnsCache())
    .build()
```

**TCP 优化**：
```kotlin
// 启用 TCP_NODELAY（禁用 Nagle 算法）
SocketFactory().apply {
    val socket = createSocket(host, port)
    socket.tcpNoDelay = true
}
```

---

## 代码示例

### 9.1 完整的 OkHttp 配置

```kotlin
object OkHttpConfig {
    
    private fun createConnectionPool(): ConnectionPool {
        return ConnectionPool().apply {
            maxSize = 10
            keepAliveDuration = 10L, TimeUnit.MINUTES
        }
    }
    
    private fun createCache(context: Context): Cache {
        val cacheDir = context.cacheDir.resolve("http_cache")
        val cacheSize = 100L * 1024 * 1024 // 100MB
        
        return Cache(cacheDir, cacheSize)
    }
    
    private fun createLoggingInterceptor(): Interceptor {
        val logger = Logger().apply {
            level = Logger.Level.BODY
        }
        
        return HttpLoggingInterceptor(logger).apply {
            level = Level.BODY
        }
    }
    
    private fun createAuthInterceptor(): Interceptor {
        return object : Interceptor {
            override fun intercept(chain: Interceptor.Chain): Response {
                val request = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer ${getToken()}")
                    .addHeader("X-App-Version", BuildConfig.VERSION_NAME)
                    .build()
                
                return chain.proceed(request)
            }
        }
    }
    
    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            // 连接池
            .connectionPool(createConnectionPool())
            
            // 缓存
            .cache(createCache(Application.application))
            
            // 超时
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .callTimeout(45, TimeUnit.SECONDS)
            
            // 重试
            .retryOnConnectionFailure(true)
            
            // 协议
            .protocols(listOf(Protocol.HTTP_2, Protocol.HTTP_1_1))
            
            // 拦截器
            .addInterceptor(createLoggingInterceptor())
            .addInterceptor(createAuthInterceptor())
            
            // DNS
            .dns(DnsCache())
            
            // 调度器
            .dispatcher(Dispatcher().apply {
                maxRequests = 32
                maxRequestsPerHost = 5
            })
            
            .build()
    }
}
```

### 9.2 完整的请求示例

```kotlin
class ApiService {
    
    private val client = OkHttpConfig.client
    private val retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .addCallAdapterFactory(CoroutineCallAdapterFactory())
        .build()
    
    interface UserApi {
        @GET("users/{id}")
        suspend fun getUser(@Path("id") id: String): User
        
        @POST("users")
        suspend fun createUser(@Body user: User): User
        
        @Multipart
        @POST("upload")
        suspend fun uploadFile(@Part file: MultipartBody.Part): UploadResult
    }
    
    private val userApi = retrofit.create(UserApi::class.java)
    
    // 获取用户
    suspend fun getUser(id: String): Result<User> {
        return try {
            val user = userApi.getUser(id)
            Result.success(user)
        } catch (e: IOException) {
            Result.failure(e)
        }
    }
    
    // 创建用户
    suspend fun createUser(user: User): Result<User> {
        return try {
            val result = userApi.createUser(user)
            Result.success(result)
        } catch (e: IOException) {
            Result.failure(e)
        }
    }
    
    // 上传文件
    suspend fun uploadFile(file: File): Result<UploadResult> {
        return try {
            val requestBody = file.asRequestBody(ContentType.parse("image/jpeg"))
            val body = MultipartBody.Part.createFormData("file", file.name, requestBody)
            
            val result = userApi.uploadFile(body)
            Result.success(result)
        } catch (e: IOException) {
            Result.failure(e)
        }
    }
}
```

---

## 面试考点

### 基础题

**1. OkHttp 的核心组件？**

```
- OkHttpClient：客户端配置
- Call：请求调用
- Dispatcher：调度器
- Interceptor：拦截器
- ConnectionPool：连接池
- Cache：缓存
```

**2. OkHttp 的拦截器类型？**

```
1. 应用拦截器：拦截所有请求
2. 网络拦截器：只拦截网络请求

内置拦截器：
- RetryAndFollowUpInterceptor
- BridgeInterceptor
- CacheInterceptor
- ConnectInterceptor
```

**3. 连接池的工作原理？**

```
1. 复用 TCP 连接
2. 按域名管理连接
3. 超时自动清理
4. 全局共享 OkHttpClient
```

### 进阶题

**1. OkHttp 的拦截器执行顺序？**

```
1. Application Interceptors
2. RetryAndFollowUpInterceptor
3. BridgeInterceptor
4. CacheInterceptor
5. ConnectInterceptor
6. Network Interceptors
7. RealCall 执行
```

**2. 如何实现请求重试？**

```
方式 1: 使用内置重试（RetryAndFollowUpInterceptor）
方式 2: 自定义拦截器实现重试
方式 3: 使用 OkHttp 的 retryOnConnectionFailure
```

**3. 如何优化 OkHttp 性能？**

```
1. 全局共享 OkHttpClient
2. 合理配置连接池
3. 启用 HTTP/2
4. 优化缓存策略
5. DNS 缓存
6. 调整并发限制
```

### 高级题

**1. OkHttp 如何处理 HTTP/2？**

```
1. ALPN 协议协商
2. 使用 Http2Codec 编码解码
3. 多路复用
4. 头部压缩（HPACK）
5. 流控
```

**2. OkHttp 的缓存机制？**

```
遵循 HTTP Caching 标准
- 强缓存（Cache-Control）
- 协商缓存（ETag）
- 磁盘缓存 + 内存缓存
```

**3. 如何实现自定义连接管理？**

```
实现 ConnectionPool
自定义 Address
实现 RouteDatabase
```

---

## 总结

### 核心要点

1. **架构设计**
   - 拦截器链模式
   - 异步调度器
   - 连接池管理

2. **性能优化**
   - 连接复用
   - HTTP/2 支持
   - 缓存机制
   - 并发控制

3. **扩展性**
   - 拦截器扩展
   - 自定义组件
   - 协程支持

### 最佳实践

```kotlin
// 1. 全局共享 OkHttpClient
object ApiClient {
    val client: OkHttpClient = ...
}

// 2. 合理配置连接池
.connectionPool(ConnectionPool(10, 10, MINUTES))

// 3. 启用 HTTP/2
.protocols(listOf(HTTP_2, HTTP_1_1))

// 4. 使用拦截器扩展
.addInterceptor(authInterceptor)

// 5. 协程支持
.addCallAdapterFactory(CoroutineCallAdapterFactory())
```

---

*本文约 15000 字，涵盖了 OkHttp 底层的核心知识点。*
