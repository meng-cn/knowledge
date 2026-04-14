# 03_Volley

## 目录

- [Volley 概述](#volley-概述)
- [Volley 架构原理](#volley-架构原理)
- [RequestQueue 详解](#requestqueue-详解)
- [常用请求类型](#常用请求类型)
- [自定义 Request](#自定义-request)
- [缓存机制](#缓存机制)
- [与 Retrofit 对比](#与-retrofit-对比)
- [使用场景](#使用场景)
- [代码示例](#代码示例)
- [面试考点](#面试考点)

---

## Volley 概述

Volley 是 Google 于 2013 年开源的 Android HTTP 客户端库，专为 Android 平台设计。它提供了简单高效的网络请求 API，支持请求队列管理、缓存、图片加载等功能。

### 1.1 Volley 的特点

**优势**：
1. **自动请求调度**：智能管理并发连接
2. **异步加载**：所有请求默认异步执行
3. **缓存支持**：内置内存和磁盘缓存
4. **图片加载**：ImageRequest 简化图片处理
5. **取消请求**：支持单个或批量取消
6. **轻量级**：代码库较小，依赖少

**劣势**：
1. **大文件支持差**：不适合大文件上传下载
2. **不支持 WebSocket**：实时通信需要其他方案
3. **性能问题**：大量并发请求时性能下降
4. **已过时**：Google 不再积极维护

### 1.2 历史背景

```
2013 年：Volley 开源，作为 Android 官方推荐网络库
2015 年：Retrofit 2.0 发布，开始流行
2017 年：OkHttp 3.0 成为事实标准
2020 年：Volley 不再作为官方推荐
2024 年：新项目建议使用 OkHttp/Retrofit
```

**为什么了解 Volley**：
- 大量旧项目仍在使用
- 面试常见考点
- 理解其设计思想有助于理解网络库原理

---

## Volley 架构原理

### 2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                    应用层                        │
│              (Activity/Fragment)                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                   RequestQueue                   │
│  ┌───────────────┐  ┌──────────────┐            │
│  │   NetworkDispatcher (x4)        │            │
│  │                   │            │            │
│  └─────────┬─────────┘            │            │
│            │                      │            │
│  ┌─────────▼───────────────────────────────┐    │
│  │         Network (HttpStack)              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────┐  ┌──────────────┐            │
│  │   CacheDispatcher                 │            │
│  └───────────────┘  ┌──────────────┐            │
│                     │    Cache     │            │
│                     └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### 2.2 核心组件

**Request<T>**
```kotlin
abstract class Request<T>(
    priority: Priority,
    method: Int,
    url: String,
    cache: Cache
) {
    // 请求优先级
    enum class Priority {
        LOWEST, LOW, NORMAL, HIGH, HIGHEST
    }
    
    // 请求方法
    companion object {
        const val GET = Method.GET
        const val POST = Method.POST
        const val PUT = Method.PUT
        const val DELETE = Method.DELETE
    }
    
    // 核心方法
    abstract fun getCacheKey(): String
    abstract fun parseNetworkResponse(response: NetworkResponse): Response<T>
    abstract fun deliverResponse(response: T)
    open fun deliverError(error: VolleyError)
}
```

**Response<T>**
```kotlin
data class Response<T>(
    val result: T?,
    val cacheResponse: CachedHttpResponse?,
    val networkResponse: NetworkResponse?,
    val priority: Priority,
    val errorCode: Int,
    val errorBody: Array<out Byte>?,
    val exception: AWSError?
) {
    companion object {
        const val SUCCESS = 0
        const val NETWORK_ERROR = 1
        const val CACHE_ERROR = 2
        const val PARSE_ERROR = 3
        const val TIMEOUT_ERROR = 4
    }
}
```

**RequestQueue**
```kotlin
class RequestQueue(
    cache: Cache,
    delivery: Delivery
) {
    // 缓存队列
    private val cacheQueue: BlockingQueue<Request<*>>
    
    // 网络队列
    private val networkQueue: BlockingQueue<Request<*>>
    
    // 缓存分发器
    private val cacheDispatcher: CacheDispatcher
    
    // 网络分发器池
    private val dispatchers: List<NetworkDispatcher>
    
    // 启动
    fun start() {
        cacheDispatcher.start()
        for (dispatcher in dispatchers) {
            dispatcher.start()
        }
    }
    
    // 添加请求
    fun <T> add(request: Request<T>): Request<T> {
        request.setRequestQueue(this)
        request.addedToQueue()
        cacheQueue.add(request)
        return request
    }
}
```

### 2.3 请求处理流程

```kotlin
// 1. 用户创建请求
val request = StringRequest(
    Request.Method.GET,
    url,
    responseListener,
    errorListener
)

// 2. 添加到队列
requestQueue.add(request)

// 3. CacheDispatcher 检查缓存
//    - 有缓存 && 缓存有效 -> 直接返回
//    - 无缓存或缓存失效 -> 加入网络队列

// 4. NetworkDispatcher 处理网络请求
//    - 执行 HTTP 请求
//    - 解析响应
//    - 更新缓存
//    - 返回结果

// 5. Delivery 在主线程回调
//    - onResponse()
//    - onErrorResponse()
```

**流程图**：
```
用户创建请求
    │
    ▼
添加到 RequestQueue (cacheQueue)
    │
    ▼
CacheDispatcher 检查缓存
    │
    ├─ 缓存有效 ──> 返回缓存 ──> 主线程回调
    │
    └─ 缓存失效/无缓存 ──> 加入网络队列 (networkQueue)
        │
        ▼
    NetworkDispatcher 获取请求
        │
        ▼
    HttpStack 执行 HTTP 请求
        │
        ▼
    parseNetworkResponse() 解析
        │
        ▼
    更新缓存
        │
        ▼
    Delivery 交付结果到主线程
        │
        ▼
    onResponse() / onErrorResponse()
```

### 2.4 线程模型

```kotlin
// 主线程
├─ 创建 Request
├─ 添加到 RequestQueue
└─ 接收回调 (Delivery 使用 Handler)

// CacheDispatcher 线程（单线程）
├─ 从 cacheQueue 获取请求
├─ 检查缓存
├─ 缓存有效 -> 标记为缓存响应，加入 finishedJobs
└─ 缓存无效 -> 加入 networkQueue

// NetworkDispatcher 线程池（4 个线程）
├─ 从 networkQueue 获取请求
├─ 执行网络请求
├─ 解析响应
├─ 更新缓存
└─ 加入 finishedJobs

// Handler 线程（主线程）
└─ 从 finishedJobs 获取结果，回调监听器
```

---

## RequestQueue 详解

### 3.1 创建 RequestQueue

**基本用法**：
```kotlin
// 方式 1：使用默认缓存
val queue = Volley.newRequestQueue(context)

// 方式 2：自定义缓存
val cache = MemoryCache(10 * 1024 * 1024) // 10MB 内存缓存
val queue = RequestQueue(cache, Delivery())

// 方式 3：组合缓存
val diskBasedCache = DiskBasedCache(
    context.cacheDir, 
    100 * 1024 * 1024 // 100MB 磁盘缓存
)
val memoryCache = MemoryCache(10 * 1024 * 1024)
val combinedCache = CombinedCache(memoryCache, diskBasedCache)
val queue = RequestQueue(combinedCache, Delivery())
```

### 3.2 线程配置

```kotlin
class RequestQueue(
    cache: Cache,
    delivery: Delivery
) {
    // 默认配置
    private val DEFAULT_NETWORK_THREAD_POOL_SIZE = 4
    private val DEFAULT_NETWORK_DISPATCHER_COUNT = 4
    
    // 构造函数
    init {
        // 创建网络分发器线程池
        for (i in 0 until DEFAULT_NETWORK_DISPATCHER_COUNT) {
            dispatchers.add(NetworkDispatcher(networkQueue, network))
        }
    }
}

// 注意：Volley 的线程池大小是固定的
// 无法动态调整线程数
```

### 3.3 请求优先级

```kotlin
enum class Priority(val value: Int) {
    LOWEST(1),
    LOW(2),
    NORMAL(3),
    HIGH(4),
    HIGHEST(5);
}

// 设置请求优先级
val request = StringRequest(
    Request.Method.GET,
    url,
    responseListener,
    errorListener
).apply {
    priority = Priority.HIGH
}

// 优先级影响：
// 1. 缓存队列中的处理顺序
// 2. 网络队列中的处理顺序
// 3. 同优先级按 FIFO 处理
```

### 3.4 请求取消

```kotlin
// 取消单个请求
val request = StringRequest(...)
requestQueue.add(request)
request.cancel() // 取消请求

// 批量取消（按标签）
val request = StringRequest(...).apply {
    tag = "user_list"
}
requestQueue.add(request)
requestQueue.get("user_list").cancel() // 取消所有同标签请求

// 取消所有请求
requestQueue.cancelAll("user_list")

// 在活动销毁时取消所有请求
class MyActivity : AppCompatActivity() {
    private val requestQueue = Volley.newRequestQueue(this)
    
    override fun onDestroy() {
        super.onDestroy()
        requestQueue.cancelAll(this) // 使用 Activity 作为标签
    }
}
```

### 3.5 请求队列监控

```kotlin
// 获取队列统计信息
fun getRequestQueueStats(queue: RequestQueue): RequestQueueStats {
    // 反射获取私有字段
    val cacheQueueField = queue::class.java.getDeclaredField("cacheQueue")
    cacheQueueField.isAccessible = true
    val cacheQueue = cacheQueueField.get(queue) as Queue<*>
    
    val networkQueueField = queue::class.java.getDeclaredField("networkQueue")
    networkQueueField.isAccessible = true
    val networkQueue = networkQueueField.get(queue) as Queue<*>
    
    return RequestQueueStats(
        cacheQueueSize = cacheQueue.size,
        networkQueueSize = networkQueue.size
    )
}

// 监控请求
class MonitoringInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val start = System.currentTimeMillis()
        val response = chain.proceed(chain.request())
        val end = System.currentTimeMillis()
        
        Log.d("Volley", "${chain.request().url} took ${end - start}ms")
        return response
    }
}
```

---

## 常用请求类型

### 4.1 StringRequest

**基本用法**：
```kotlin
val stringRequest = StringRequest(
    Request.Method.GET,
    "https://api.example.com/data",
    Response.Listener { response ->
        // 成功的回调
        textView.text = response
    },
    Response.ErrorListener { error ->
        // 失败的回调
        Toast.makeText(context, "请求失败：${error.message}", Toast.LENGTH_SHORT).show()
    }
).apply {
    // 设置请求头
    setHeader("Content-Type", "application/json")
    setHeader("Authorization", "Bearer $token")
    
    // 设置超时
    setRetryPolicy(
        DefaultRetryPolicy(
            30000, // 超时时间
            1,     // 重试次数
            1f     // 退避系数
        )
    )
}

requestQueue.add(stringRequest)
```

**POST 请求**：
```kotlin
val jsonString = """
    {
        "name": "张三",
        "age": 25
    }
"""

val stringRequest = StringRequest(
    Request.Method.POST,
    "https://api.example.com/users",
    Response.Listener { response ->
        // 处理响应
    },
    Response.ErrorListener { error ->
        // 处理错误
    }
) {
    // 提供请求体
    jsonString.toByteArray(charset("UTF-8"))
}

// 或者使用 createBodyParameter
val params = HashMap<String, String>().apply {
    put("name", "张三")
    put("age", "25")
}
stringRequest.params = params
```

### 4.2 JsonRequest

**泛型支持**：
```kotlin
// 请求单个对象
val jsonRequest = JsonObjectRequest(
    Request.Method.GET,
    "https://api.example.com/user/123",
    null,
    Response.Listener { jsonObject ->
        val name = jsonObject.getString("name")
        val age = jsonObject.getInt("age")
    },
    Response.ErrorListener { error ->
        // 处理错误
    }
)

// 请求数组
val jsonArrayRequest = JsonArrayRequest(
    Request.Method.GET,
    "https://api.example.com/users",
    null,
    Response.Listener { jsonArray ->
        for (i in 0 until jsonArray.length()) {
            val user = jsonArray.getJSONObject(i)
            // 处理每个用户
        }
    },
    Response.ErrorListener { error ->
        // 处理错误
    }
)
```

**使用 Gson 解析**：
```kotlin
class GsonRequest<T>(
    method: Int,
    url: String,
    requestBody: ByteArray?,
    listener: Response.Listener<T>,
    errorListener: Response.ErrorListener,
    private val clazz: Class<T>,
    private val gson: Gson = Gson()
) : JsonRequest<T>(method, url, requestBody, listener, errorListener) {
    
    override fun parseNetworkResponse(response: NetworkResponse): Response<T> {
        try {
            val string = String(response.data, charset("UTF-8"))
            val body = gson.fromJson(string, clazz)
            return Response.success(body, parseHeaders(response.headers))
        } catch (e: Exception) {
            return Response.error(ParseError(e))
        }
    }
}

// 使用
val gson = Gson()
val request = GsonRequest(
    Request.Method.GET,
    "https://api.example.com/users",
    null,
    Response.Listener { users ->
        // users 是 List<User> 类型
    },
    Response.ErrorListener { error -> },
    List::class.java
)
requestQueue.add(request)
```

### 4.3 ImageRequest

**基本用法**：
```kotlin
val imageRequest = ImageRequest(
    "https://api.example.com/image.jpg",
    Response.Listener<Bitmap> { bitmap ->
        imageView.setImageBitmap(bitmap)
    },
    0, // maxWidth
    0, // maxHeight
    ImageView.ScaleType.CENTER_CROP,
    Bitmap.Config.ARGB_8888,
    Response.ErrorListener { error ->
        // 加载失败
        imageView.setImageResource(R.drawable.placeholder)
    }
)

requestQueue.add(imageRequest)
```

**指定尺寸**：
```kotlin
val imageRequest = ImageRequest(
    "https://api.example.com/image.jpg",
    Response.Listener<Bitmap> { bitmap ->
        imageView.setImageBitmap(bitmap)
    },
    100, // maxWidth
    100, // maxHeight
    ImageView.ScaleType.CENTER_INSIDE,
    Bitmap.Config.ARGB_8888,
    Response.ErrorListener { error -> }
)
```

### 4.4 自定义 JsonRequest 支持泛型

```kotlin
class GenericJsonRequest<T>(
    method: Int,
    url: String,
    body: ByteArray?,
    listener: Response.Listener<T>,
    errorListener: Response.ErrorListener,
    private val adapter: TypeAdapter<T>
) : JsonRequest<T>(method, url, body, listener, errorListener) {
    
    private val moshi = Moshi.Builder().build()
    
    override fun parseNetworkResponse(response: NetworkResponse): Response<T> {
        try {
            val json = String(response.data, Charset.forName("UTF-8"))
            val body = adapter.fromJson(json) ?: throw RuntimeException("Null body")
            return Response.success(body, Header.parse(response.headers))
        } catch (e: Exception) {
            return Response.error(ParseError(e))
        }
    }
}

// 使用
val adapter = moshi.adapter(UserList::class.java)
val request = GenericJsonRequest(
    Request.Method.GET,
    "https://api.example.com/users",
    null,
    Response.Listener { users ->
        // 处理用户列表
    },
    Response.ErrorListener { error -> },
    adapter
)
requestQueue.add(request)
```

---

## 自定义 Request

### 5.1 创建自定义 Request

```kotlin
class CustomRequest<T>(
    method: Int,
    url: String,
    body: ByteArray?,
    listener: Response.Listener<T>,
    errorListener: Response.ErrorListener,
    private val responseType: Type
) : Request<T>(method, url, errorListener) {
    
    private val listener: Response.Listener<T> = listener
    private val gson = Gson()
    private val responseType: Type = responseType
    
    override fun getParams(): Map<String, String> {
        // 返回请求参数（用于 URL 编码）
        return HashMap()
    }
    
    override fun getBodyContentType(): String {
        return "application/json; charset=UTF-8"
    }
    
    override fun getBody(): ByteArray {
        return body ?: ByteArray(0)
    }
    
    override fun getCacheKey(): String {
        return url.hashCode().toString()
    }
    
    override fun shouldCache(): Boolean {
        return false // 不缓存 POST 请求
    }
    
    override fun parseNetworkResponse(response: NetworkResponse): Response<T> {
        try {
            val json = String(response.data, Charset.forName("UTF-8"))
            val body = gson.fromJson(json, responseType)
            return Response.success(body, Header.parse(response.headers))
        } catch (e: Exception) {
            return Response.error(ParseError(e))
        }
    }
    
    override fun deliverResponse(response: T) {
        listener.onResponse(response)
    }
}
```

### 5.2 实现文件上传

```kotlin
class FileUploadRequest(
    url: String,
    filePath: String,
    filename: String,
    params: Map<String, String>,
    listener: Response.Listener<UploadResponse>,
    errorListener: Response.ErrorListener
) : Request<UploadResponse>(Method.POST, url, errorListener) {
    
    private val listener: Response.Listener<UploadResponse> = listener
    private val boundary = UUID.randomUUID().toString()
    
    override fun getBodyContentType(): String {
        return "multipart/form-data; boundary=$boundary"
    }
    
    override fun getBody(): ByteArray {
        val outputStream = ByteArrayOutputStream()
        val file = File(filePath)
        
        // 添加表单字段
        for ((key, value) in params) {
            outputStream.write("--$boundary\r\n".toByteArray())
            outputStream.write(
                "Content-Disposition: form-data; name=\"$key\"\r\n\r\n"
                    .toByteArray()
            )
            outputStream.write("$value\r\n".toByteArray())
        }
        
        // 添加文件
        outputStream.write("--$boundary\r\n".toByteArray())
        outputStream.write(
            "Content-Disposition: form-data; name=\"file\"; filename=\"$filename\"\r\n" +
            "Content-Type: application/octet-stream\r\n\r\n"
                .toByteArray()
        )
        
        file.inputStream().use { inputStream ->
            val buffer = ByteArray(8192)
            var bytesRead: Int
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
            }
        }
        
        // 结束边界
        outputStream.write("--$boundary--\r\n".toByteArray())
        
        return outputStream.toByteArray()
    }
    
    override fun getCacheKey(): String {
        return url.hashCode().toString()
    }
    
    override fun shouldCache(): Boolean = false
    
    override fun parseNetworkResponse(response: NetworkResponse): Response<UploadResponse> {
        try {
            val json = String(response.data, Charset.forName("UTF-8"))
            val gson = Gson()
            val body = gson.fromJson(json, UploadResponse::class.java)
            return Response.success(body, Header.parse(response.headers))
        } catch (e: Exception) {
            return Response.error(ParseError(e))
        }
    }
    
    override fun deliverResponse(response: UploadResponse) {
        listener.onResponse(response)
    }
}

// 使用
val request = FileUploadRequest(
    url = "https://api.example.com/upload",
    filePath = "/sdcard/Pictures/photo.jpg",
    filename = "photo.jpg",
    params = mapOf("description" to "我的照片"),
    listener = Response.Listener { response ->
        Log.d("Upload", "Upload successful: ${response.url}")
    },
    errorListener = Response.ErrorListener { error ->
        Log.e("Upload", "Upload failed: ${error.message}")
    }
)
requestQueue.add(request)
```

### 5.3 实现文件下载

```kotlin
class DownloadRequest(
    url: String,
    downloadDir: String,
    listener: Response.Listener<DownloadProgress>,
    errorListener: Response.ErrorListener
) : Request<String>(Method.GET, url, errorListener) {
    
    private val listener: Response.Listener<DownloadProgress> = listener
    private val downloadDir: String = downloadDir
    private var totalLength: Long = 0
    private var downloaded: Long = 0
    
    override fun makeRequest(url: String, additionalHeaders: Map<String, String>): NetworkResponse {
        val url = java.net.URL(url)
        val connection = url.openConnection() as HttpURLConnection
        
        try {
            totalLength = contentLength
            
            val inputStream = connection.inputStream
            val outputFile = File(downloadDir, url.path.substringAfterLast('/'))
            val outputStream = FileOutputStream(outputFile, append = true)
            
            val buffer = ByteArray(8192)
            var bytesRead: Int
            
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                downloaded += bytesRead
                
                // 更新进度（在主线程）
                val progress = (downloaded * 100 / totalLength)
                Handler(Looper.getMainLooper()).post {
                    listener.onResponse(DownloadProgress(progress, downloaded, totalLength))
                }
            }
            
            outputStream.close()
            
            return NetworkResponse(
                HttpURLConnection.HTTP_OK,
                outputFile.readBytes(),
                Header.of(mapOf()),
                false
            )
        } finally {
            connection.disconnect()
        }
    }
    
    override fun parseNetworkResponse(response: NetworkResponse): Response<String> {
        return Response.success(url, Header.parse(response.headers))
    }
    
    override fun deliverResponse(response: String) {
        // 下载完成
    }
}
```

---

## 缓存机制

### 6.1 缓存实现接口

```kotlin
interface Cache {
    fun get(key: String): Cache.Entry?
    fun put(key: String, entry: Cache.Entry)
    fun invalidate(key: String)
    fun remove(key: String)
    fun clear()
}

data class Entry(
    val data: ByteArray,
    val ttl: Long,        // 过期时间（绝对时间）
    val softTtl: Long,    // 软过期时间
    val etag: String?,    // ETag
    val serverDate: Long, // 服务器日期
    val lastModified: Long,
    val variantHit: Boolean,
    val responseHeaders: Map<String, String>,
    val priority: Request.Priority
)
```

### 6.2 内存缓存

```kotlin
class MemoryCache(private val maxSize: Long) : Cache {
    private val cache = LruCache<String, Entry>(maxSize)
    private var size: Long = 0
    private val lock = Any()
    
    override fun get(key: String): Entry? {
        synchronized(lock) {
            return cache.get(key)
        }
    }
    
    override fun put(key: String, entry: Entry) {
        synchronized(lock) {
            // 移除超时的缓存
            while (size + entry.data.size > maxSize && cache.size() > 0) {
                val evictedKey = cache.lruEntries().first().key
                val evicted = cache.remove(evictedKey)
                if (evicted != null) {
                    size -= evicted.data.size
                }
            }
            
            cache.put(key, entry)
            size += entry.data.size
        }
    }
    
    override fun invalidate(key: String) {
        synchronized(lock) {
            cache.remove(key)
        }
    }
    
    override fun remove(key: String) {
        invalidate(key)
    }
    
    override fun clear() {
        synchronized(lock) {
            cache.evictAll()
            size = 0
        }
    }
}

// 使用
val memoryCache = MemoryCache(10 * 1024 * 1024) // 10MB
```

### 6.3 磁盘缓存

```kotlin
class DiskBasedCache(cacheDir: File) : Cache {
    private val cacheDir: File = cacheDir
    private val LOCK = Any()
    private val HARDCAP = 100 * 1024 * 1024 // 100MB
    private var softCap: Long = HARDCAP / 2
    private var size: Long = 0
    private val entries = HashMap<String, Entry>()
    
    init {
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
    }
    
    override fun get(key: String): Entry? {
        val file = File(cacheDir, key)
        if (!file.exists()) return null
        
        return try {
            synchronized(LOCK) {
                val is = DataInputStream(FileInputStream(file))
                val entry = Entry()
                entry.data = ByteArray(is.readInt())
                is.readFully(entry.data)
                if (entry.data.size > 0) {
                    return entry
                } else {
                    null
                }
            }
        } catch (e: IOException) {
            null
        }
    }
    
    override fun put(key: String, entry: Entry) {
        val file = File(cacheDir, key)
        try {
            synchronized(LOCK) {
                // 如果缓存已满，清理一半
                if (size > HARDCAP) {
                    clean()
                }
                
                val fos = FileOutputStream(file)
                val dos = DataOutputStream(fos)
                dos.writeInt(entry.data.size)
                dos.write(entry.data)
                dos.flush()
                dos.close()
                
                entries[key] = entry
                size += entry.data.size
            }
        } catch (e: IOException) {
            remove(key)
        }
    }
    
    private fun clean() {
        // 清理缓存逻辑
        val files = cacheDir.listFiles()
        if (files != null) {
            files.sortedByDescending { it.lastModified() }
                .takeWhile { size > softCap }
                .forEach { it.delete() }
        }
    }
    
    override fun invalidate(key: String) {
        synchronized(LOCK) {
            entries.remove(key)
            File(cacheDir, key).delete()
        }
    }
    
    override fun remove(key: String) {
        invalidate(key)
    }
    
    override fun clear() {
        synchronized(LOCK) {
            cacheDir.listFiles()?.forEach { it.delete() }
            entries.clear()
            size = 0
        }
    }
}

// 使用
val diskCache = DiskBasedCache(context.cacheDir.resolve("volley"))
```

### 6.4 组合缓存

```kotlin
class CombinedCache(
    private val primaryCache: Cache,
    private val secondaryCache: Cache
) : Cache {
    
    override fun get(key: String): Entry? {
        // 先查一级缓存（内存）
        val entry = primaryCache.get(key)
        if (entry != null) {
            return entry
        }
        
        // 再查二级缓存（磁盘）
        val secondaryEntry = secondaryCache.get(key)
        if (secondaryEntry != null) {
            // 回填到一级缓存
            primaryCache.put(key, secondaryEntry)
            return secondaryEntry
        }
        
        return null
    }
    
    override fun put(key: String, entry: Entry) {
        // 同时写入两个缓存
        primaryCache.put(key, entry)
        secondaryCache.put(key, entry)
    }
    
    override fun invalidate(key: String) {
        primaryCache.invalidate(key)
        secondaryCache.invalidate(key)
    }
    
    override fun remove(key: String) {
        primaryCache.remove(key)
        secondaryCache.remove(key)
    }
    
    override fun clear() {
        primaryCache.clear()
        secondaryCache.clear()
    }
}

// 使用
val combinedCache = CombinedCache(
    primaryCache = MemoryCache(10 * 1024 * 1024),
    secondaryCache = DiskBasedCache(context.cacheDir.resolve("volley"))
)

val requestQueue = RequestQueue(combinedCache, Delivery())
```

### 6.5 缓存策略

```kotlin
// 1. 强制使用缓存（即使过期）
val request = StringRequest(...).apply {
    setCachePolicy(CachePolicy.ONLY_CACHE)
}

// 2. 不使用缓存
val request = StringRequest(...).apply {
    setCachePolicy(CachePolicy.NONE)
}

// 3. 网络失败时使用缓存
val request = StringRequest(...).apply {
    setCachePolicy(CachePolicy.DEFAULT) // 默认
    setShouldCache(true)
}

// 4. 缓存失效后重新获取
val request = StringRequest(...).apply {
    setCachePolicy(CachePolicy.NETWORK_FIRST) // 不存在的策略，需自定义
}

// 自定义缓存策略
class CustomCachePolicy : CachePolicy {
    override fun isExpired(entry: Entry, now: Long): Boolean {
        return entry.ttl < now
    }
}
```

---

## 与 Retrofit 对比

### 7.1 对比表

| 特性 | Volley | Retrofit |
|------|--------|----------|
| 维护状态 | 不再维护 | 活跃维护 |
| 请求方式 | 回调 | 协程/RxJava |
| 序列化 | 手动解析 | 自动（Gson/Moshi） |
| 文件上传 | 需自定义 | 内置支持 |
| 文件下载 | 需自定义 | 配合 OkHttp |
| 缓存 | 内置 | 配合 OkHttp |
| 图片加载 | ImageRequest | 不推荐（用 Glide） |
| 连接池 | 内置 | OkHttp 连接池 |
| 拦截器 | 不支持 | 内置支持 |
| WebSocket | 不支持 | 内置支持 |
| 大文件 | 不推荐 | 推荐 |
| 并发请求 | 队列管理 | 并发连接 |
| 学习曲线 | 简单 | 中等 |

### 7.2 代码对比

**Volley**：
```kotlin
// 创建 RequestQueue
val requestQueue = Volley.newRequestQueue(context)

// GET 请求
val stringRequest = StringRequest(
    Request.Method.GET,
    "https://api.example.com/users/123",
    Response.Listener { response ->
        val user = parseUser(response)
        textView.text = user.name
    },
    Response.ErrorListener { error ->
        Toast.makeText(context, "Error", Toast.LENGTH_SHORT).show()
    }
)
requestQueue.add(stringRequest)

// POST 请求
val jsonRequest = JsonObjectRequest(
    Request.Method.POST,
    "https://api.example.com/login",
    params,
    Response.Listener { response ->
        val token = response.getString("token")
    },
    Response.ErrorListener { error -> }
)
requestQueue.add(jsonRequest)
```

**Retrofit**：
```kotlin
// 创建 Retrofit 实例
val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

// 创建 API 接口
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User
    
    @POST("login")
    suspend fun login(@Body credentials: LoginRequest): AuthResponse
}

val apiService = retrofit.create(ApiService::class.java)

// GET 请求（协程）
lifecycleScope.launch {
    try {
        val user = apiService.getUser(123)
        textView.text = user.name
    } catch (e: Exception) {
        Toast.makeText(context, "Error", Toast.LENGTH_SHORT).show()
    }
}

// POST 请求（协程）
lifecycleScope.launch {
    try {
        val response = apiService.login(credentials)
        saveToken(response.token)
    } catch (e: Exception) {
        // 处理错误
    }
}
```

### 7.3 性能对比

```kotlin
// Volley 性能特点
// - 请求队列：串行处理，控制并发
// - 缓存：内置，高效
// - 内存占用：较小
// - 大文件：不支持

// Retrofit + OkHttp 性能特点
// - 并发连接：多连接，性能更高
// - 缓存：需配置，灵活
// - 内存占用：较大
// - 大文件：支持好

// 基准测试
class NetworkPerformanceTest {
    fun compareVolleyAndRetrofit() {
        // 小数据请求（< 10KB）
        // Volley: 约 100-200ms
        // Retrofit: 约 100-150ms
        
        // 中等数据请求（10KB - 1MB）
        // Volley: 约 200-500ms
        // Retrofit: 约 150-400ms
        
        // 大数据请求（> 1MB）
        // Volley: 不推荐
        // Retrofit: 约 500-2000ms
        
        // 并发请求（10 个）
        // Volley: 队列处理，总时间较长
        // Retrofit: 并发处理，总时间较短
    }
}
```

---

## 使用场景

### 8.1 适合使用 Volley 的场景

**1. 简单网络请求**
```kotlin
// 配置获取
val configRequest = StringRequest(
    Request.Method.GET,
    "https://api.example.com/config",
    Response.Listener { json ->
        // 解析配置
    },
    Response.ErrorListener { }
)
requestQueue.add(configRequest)
```

**2. 图片加载（小规模）**
```kotlin
// 列表图片加载
val imageRequest = ImageRequest(
    imageUrl,
    Response.Listener<Bitmap> { bitmap ->
        imageView.setImageBitmap(bitmap)
    },
    width,
    height,
    ImageView.ScaleType.CENTER_CROP,
    Bitmap.Config.ARGB_8888,
    Response.ErrorListener { }
)
requestQueue.add(imageRequest)
```

**3. 需要缓存的场景**
```kotlin
// 离线数据获取
val cachedRequest = StringRequest(
    Request.Method.GET,
    "https://api.example.com/offline-data",
    Response.Listener { },
    Response.ErrorListener { }
).apply {
    setCachePolicy(CachePolicy.ONLY_CACHE) // 优先使用缓存
}
requestQueue.add(cachedRequest)
```

**4. 旧项目维护**
```kotlin
// 现有项目迁移成本高
// 继续使用 Volley 保持代码一致性
```

### 8.2 不适合使用 Volley 的场景

**1. 大文件上传下载**
```kotlin
// ❌ Volley 不推荐
// ✅ 使用 OkHttp 或 文件管理器
```

**2. WebSocket 实时通信**
```kotlin
// ❌ Volley 不支持
// ✅ 使用 OkHttp WebSocket
```

**3. 大量并发请求**
```kotlin
// ❌ Volley 队列处理较慢
// ✅ 使用 Retrofit + 协程
```

**4. 需要复杂拦截器**
```kotlin
// ❌ Volley 不支持拦截器
// ✅ 使用 OkHttp 拦截器
```

---

## 代码示例

### 9.1 完整示例：用户列表

```kotlin
class UserListViewModel : ViewModel() {
    private val requestQueue: RequestQueue = Volley.newRequestQueue(application)
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
    
    private val gson = Gson()
    
    fun fetchUsers(page: Int = 1) {
        val url = "https://api.example.com/users?page=$page"
        
        val request = GsonRequest(
            method = Request.Method.GET,
            url = url,
            requestBody = null,
            listener = Response.Listener { response ->
                _users.value = response
            },
            errorListener = Response.ErrorListener { error ->
                _users.value = emptyList()
            },
            clazz = UserList::class.java,
            gson = gson
        ).apply {
            // 设置请求头
            setHeader("Content-Type", "application/json")
            setHeader("Authorization", "Bearer $token")
            
            // 设置优先级
            priority = Priority.HIGH
            
            // 设置标签
            tag = "user_list"
        }
        
        requestQueue.add(request)
    }
    
    fun cancelRequests() {
        requestQueue.cancelAll("user_list")
    }
    
    override fun onCleared() {
        super.onCleared()
        requestQueue.cancelAll(this)
    }
}

// GsonRequest 实现
class GsonRequest<T>(
    method: Int,
    url: String,
    requestBody: ByteArray?,
    listener: Response.Listener<T>,
    errorListener: Response.ErrorListener,
    private val clazz: Class<T>,
    private val gson: Gson = Gson()
) : JsonRequest<T>(method, url, requestBody, listener, errorListener) {
    
    override fun parseNetworkResponse(response: NetworkResponse): Response<T> {
        try {
            val string = String(response.data, Charsets.UTF_8)
            val body = gson.fromJson(string, clazz)
            return Response.success(body, parseHeaders(response.headers))
        } catch (e: Exception) {
            return Response.error(ParseError(e))
        }
    }
}
```

### 9.2 完整示例：图片列表

```kotlin
class ImageListAdapter(
    context: Context,
    private val requestQueue: RequestQueue
) : RecyclerView.Adapter<ImageListAdapter.ViewHolder>() {
    
    private val images = mutableListOf<Image>()
    private val imageCache = LruCache<String, Bitmap>(10)
    
    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val imageView: ImageView = itemView.findViewById(R.id.image_view)
        
        fun bind(image: Image, position: Int) {
            // 先显示缓存
            imageCache[image.url]?.let { bitmap ->
                imageView.setImageBitmap(bitmap)
                return
            }
            
            // 显示占位图
            imageView.setImageResource(R.drawable.placeholder)
            
            // 异步加载
            val imageRequest = ImageRequest(
                image.url,
                Response.Listener<Bitmap> { bitmap ->
                    // 缓存图片
                    imageCache.put(image.url, bitmap)
                    
                    // 更新 UI（注意检查位置）
                    if (position == images.indexOf(image)) {
                        imageView.setImageBitmap(bitmap)
                    }
                },
                200, // width
                200, // height
                ImageView.ScaleType.CENTER_CROP,
                Bitmap.Config.ARGB_8888,
                Response.ErrorListener { error ->
                    imageView.setImageResource(R.drawable.error)
                }
            )
            
            // 使用请求 ID 取消旧请求
            imageRequest.tag = "image_$position"
            requestQueue.cancelAll("image_$position")
            requestQueue.add(imageRequest)
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_image, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(images[position], position)
    }
    
    override fun getItemCount() = images.size
    
    fun updateImages(newImages: List<Image>) {
        images.clear()
        images.addAll(newImages)
        notifyDataSetChanged()
    }
}
```

### 9.3 完整示例：文件上传

```kotlin
class FileUploadManager(private val requestQueue: RequestQueue) {
    
    fun uploadFile(
        context: Context,
        filePath: String,
        onSuccess: (UploadResponse) -> Unit,
        onError: (VolleyError) -> Unit
    ) {
        val file = File(filePath)
        val filename = file.name
        
        val request = FileUploadRequest(
            url = "https://api.example.com/upload",
            filePath = filePath,
            filename = filename,
            params = mapOf(
                "description" to "文件描述",
                "category" to "document"
            ),
            listener = Response.Listener { response ->
                onSuccess(response)
            },
            errorListener = Response.ErrorListener { error ->
                onError(error)
            }
        ).apply {
            setHeader("Authorization", "Bearer ${getToken()}")
            priority = Priority.HIGH
        }
        
        requestQueue.add(request)
    }
    
    fun cancelUpload(tag: String) {
        requestQueue.cancelAll(tag)
    }
}

// FileUploadRequest 实现（见前文）
```

### 9.4 完整示例：批量请求

```kotlin
class BatchRequestManager(private val requestQueue: RequestQueue) {
    
    fun executeBatch(
        requests: List<StringRequest>,
        onComplete: (List<String>, List<VolleyError>) -> Unit
    ) {
        val responses = mutableListOf<String>()
        val errors = mutableListOf<VolleyError>()
        var completed = 0
        
        val callback = object : Response.Listener<String> {
            override fun onResponse(response: String) {
                synchronized(this) {
                    responses.add(response)
                    completed++
                    if (completed == requests.size) {
                        onComplete(responses, errors)
                    }
                }
            }
        }
        
        val errorCallback = object : Response.ErrorListener {
            override fun onErrorResponse(error: VolleyError) {
                synchronized(this) {
                    errors.add(error)
                    completed++
                    if (completed == requests.size) {
                        onComplete(responses, errors)
                    }
                }
            }
        }
        
        // 添加所有请求
        requests.forEach { request ->
            request.setResponseListener(callback)
            request.setErrorListener(errorCallback)
            requestQueue.add(request)
        }
    }
}

// 使用
val requests = listOf(
    StringRequest(Request.Method.GET, "url1", callback, error),
    StringRequest(Request.Method.GET, "url2", callback, error),
    StringRequest(Request.Method.GET, "url3", callback, error)
)

batchRequestManager.executeBatch(requests) { responses, errors ->
    Log.d("Batch", "Completed: ${responses.size} success, ${errors.size} failed")
}
```

---

## 面试考点

### 基础题

**1. Volley 是什么？有什么特点？**

```
Volley 是 Google 开发的 Android HTTP 客户端库。

特点：
1. 自动请求调度
2. 异步加载
3. 内置缓存
4. 支持图片加载
5. 可取消请求
6. 轻量级

适用场景：
- 简单网络请求
- 需要缓存的场景
- 小规模图片加载
```

**2. Volley 的核心组件有哪些？**

```
1. RequestQueue：请求队列管理器
2. Request：请求基类
3. StringRequest：字符串请求
4. JsonRequest：JSON 请求
5. ImageRequest：图片请求
6. Cache：缓存接口
7. Delivery：结果交付器
```

**3. RequestQueue 的工作原理？**

```
1. 添加请求到缓存队列
2. CacheDispatcher 检查缓存
3. 缓存有效 -> 直接返回
4. 缓存无效 -> 加入网络队列
5. NetworkDispatcher 执行网络请求
6. Delivery 在主线程回调
```

**4. 如何取消 Volley 请求？**

```kotlin
// 取消单个请求
request.cancel()

// 取消同标签请求
requestQueue.cancelAll(tag)

// 批量取消
val tag = "my_tag"
request.tag = tag
requestQueue.add(request)
requestQueue.cancelAll(tag)
```

### 进阶题

**1. Volley 的线程模型？**

```
主线程：
- 创建 Request
- 添加到 RequestQueue
- 接收回调

CacheDispatcher（单线程）：
- 检查缓存
- 缓存有效 -> 返回
- 缓存无效 -> 加入网络队列

NetworkDispatcher（4 个线程）：
- 执行网络请求
- 解析响应
- 更新缓存

Delivery（Handler）：
- 在主线程回调监听器
```

**2. Volley 的缓存机制？**

```
缓存结构：
- 内存缓存：MemoryCache
- 磁盘缓存：DiskBasedCache
- 组合缓存：CombinedCache

缓存策略：
- CachePolicy.ONLY_CACHE：只用缓存
- CachePolicy.NONE：不用缓存
- CachePolicy.DEFAULT：默认策略

缓存失效：
- 过期时间（TTL）
- 软过期时间（softTTL）
- ETag
```

**3. 如何实现自定义 Request？**

```kotlin
class CustomRequest : Request<T> {
    override fun getCacheKey(): String
    override fun parseNetworkResponse(): Response<T>
    override fun deliverResponse(response: T)
    override fun deliverError(error: VolleyError)
}
```

**4. Volley 和 Retrofit 的区别？**

```
Volley:
- 回调方式
- 内置缓存
- 图片加载
- 队列管理
- 不再维护

Retrofit:
- 协程/RxJava
- 自动序列化
- 拦截器
- 并发性能好
- 活跃维护
```

### 高级题

**1. Volley 的优化方案？**

```
1. 调整线程池大小
   - 默认 4 个网络线程
   - 根据业务调整

2. 优化缓存
   - 使用组合缓存
   - 设置合理的缓存大小
   - 定期清理缓存

3. 请求优先级
   - 设置合适的优先级
   - 重要请求优先处理

4. 取消无用请求
   - Activity 销毁时取消
   - 页面跳转时取消

5. 避免内存泄漏
   - 使用 WeakReference
   - 及时取消请求
```

**2. 如何处理 Volley 的大文件上传？**

```
问题：
- Volley 不适合大文件
- 内存溢出风险

解决方案：
1. 使用 OkHttp
2. 分片上传
3. 流式处理
```

**3. Volley 的并发控制？**

```
并发控制：
- 默认 4 个网络线程
- 队列管理请求顺序
- 优先级影响处理顺序

优化：
- 批量请求
- 合并请求
- 分页加载
```

**4. 如何解决 Volley 的内存问题？**

```
1. 限制缓存大小
2. 及时取消请求
3. 使用合适的 Bitmap 配置
4. 避免在请求中保存引用
5. 使用 WeakReference
```

**5. Volley 源码分析？**

```
核心流程：
1. Request.add() 添加到队列
2. CacheDispatcher 检查缓存
3. NetworkDispatcher 执行请求
4. Delivery 交付结果

关键类：
- RequestQueue
- BaseRequest
- NetworkDispatcher
- CacheDispatcher
- HttpStack
```

---

## 总结

### 核心要点

1. **Volley 架构**
   - RequestQueue 管理
   - 缓存 + 网络双队列
   - 线程池处理

2. **请求类型**
   - StringRequest
   - JsonObjectRequest
   - ImageRequest
   - 自定义 Request

3. **缓存机制**
   - 内存缓存
   - 磁盘缓存
   - 组合缓存

4. **与 Retrofit 对比**
   - Volley：简单、内置缓存、不再维护
   - Retrofit：强大、灵活、活跃维护

### 最佳实践

```kotlin
// 1. 全局 RequestQueue
object VolleyManager {
    private val requestQueue = RequestQueue(
        CombinedCache(
            MemoryCache(10 * 1024 * 1024),
            DiskBasedCache(File(context.cacheDir, "volley"))
        ),
        Delivery()
    )
    
    init {
        requestQueue.start()
    }
}

// 2. 取消请求
override fun onDestroy() {
    super.onDestroy()
    VolleyManager.requestQueue.cancelAll(this)
}

// 3. 使用标签管理
val request = StringRequest(...).apply {
    tag = "user_list"
}
VolleyManager.requestQueue.add(request)
```

### 学习建议

1. 理解 Volley 的架构设计
2. 掌握常用请求类型
3. 了解缓存机制
4. 学习自定义 Request
5. 对比 Retrofit 的特点
6. 了解其历史背景和现状

---

*本文约 10000 字，涵盖了 Volley 的核心知识点。*
