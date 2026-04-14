# Retrofit 与 OkHttp 详解 🌐

> Android 网络编程核心，面试必考框架

---

## 一、Retrofit 基础

### 1.1 快速开始

```kotlin
// 1. 添加依赖
// build.gradle.kts
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
}

// 2. 定义数据类
data class User(
    val id: Int,
    val name: String,
    val email: String
)

// 3. 定义 API 接口
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: Int): User
    
    @POST("users")
    suspend fun createUser(@Body user: User): User
    
    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int,
        @Query("size") size: Int = 20
    ): List<User>
    
    @Multipart
    @POST("upload")
    suspend fun uploadFile(
        @Part file: MultipartBody.Part
    ): Response<UploadResult>
}

// 4. 创建 Retrofit 实例
object ApiClient {
    private const val BASE_URL = "https://api.example.com/"
    
    val api: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(okHttpClient)
            .build()
        
        retrofit.create(ApiService::class.java)
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
}

// 5. 使用
lifecycleScope.launch {
    try {
        val user = ApiClient.api.getUser(1)
        updateUI(user)
    } catch (e: Exception) {
        showError(e)
    }
}
```

### 1.2 常用注解

```kotlin
interface ApiService {
    // 请求方法
    @GET("users")
    @POST("users")
    @PUT("users/{id}")
    @DELETE("users/{id}")
    @PATCH("users/{id}")
    
    // 请求头
    @Headers("Content-Type: application/json")
    @Header("Authorization")
    @HeaderMap
    
    // 请求参数
    @Path("id")          // URL 路径
    @Query("page")       // 查询参数
    @QueryMap            // 多个查询参数
    @Body                // 请求体
    @Field("name")       // Form 表单
    @FieldMap
    
    // 文件上传
    @Multipart
    @Part                // 单个文件
    @PartMap             // 多个文件
    
    // 其他
    @Url                 // 完整 URL
    @Streaming           // 大文件下载
}
```

---

## 二、OkHttp 核心

### 2.1 OkHttpClient 配置

```kotlin
val client = OkHttpClient.Builder()
    // 超时设置
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    
    // 拦截器
    .addInterceptor(LoggingInterceptor())      // 应用拦截器
    .addNetworkInterceptor(NetworkInterceptor()) // 网络拦截器
    
    // 缓存
    .cache(Cache(File(cacheDir, "http_cache"), 10 * 1024 * 1024))
    
    // 重试
    .retryOnConnectionFailure(true)
    
    // 连接池
    .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
    
    // SSL
    .sslSocketFactory(sslSocketFactory, trustManager)
    .hostnameVerifier(hostnameVerifier)
    
    // 代理
    .proxy(Proxy(Proxy.Type.HTTP, InetSocketAddress("proxy", 8080)))
    
    .build()
```

### 2.2 拦截器详解

```kotlin
// 1. 应用拦截器（addInterceptor）
class LoggingInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val startTime = System.currentTimeMillis()
        
        println("→ ${request.method} ${request.url}")
        println("Headers: ${request.headers}")
        
        val response = chain.proceed(request)
        val endTime = System.currentTimeMillis()
        
        println("← ${response.code} (${endTime - startTime}ms)")
        
        return response
    }
}

// 2. 网络拦截器（addNetworkInterceptor）
class NetworkInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val response = chain.proceed(chain.request())
        
        // 可以修改响应头（网络拦截器特有）
        return response.newBuilder()
            .header("X-Custom-Header", "Value")
            .build()
    }
}

// 3. 认证拦截器
class AuthInterceptor(private val tokenProvider: TokenProvider) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // 添加认证头
        val token = tokenProvider.getToken()
        val newRequest = originalRequest.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
        
        return chain.proceed(newRequest)
    }
}

// 4. 缓存拦截器
class CacheInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        // 无网络时使用缓存
        if (!isNetworkAvailable()) {
            val cacheRequest = request.newBuilder()
                .header("Cache-Control", "only-if-cached, max-stale=3600")
                .build()
            return chain.proceed(cacheRequest)
        }
        
        val response = chain.proceed(request)
        
        // 设置缓存策略
        return response.newBuilder()
            .header("Cache-Control", "public, max-age=300")
            .build()
    }
}

// 5. 重试拦截器
class RetryInterceptor(private val maxRetry: Int = 3) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        var response = chain.proceed(request)
        var tryCount = 0
        
        while (!response.isSuccessful && tryCount < maxRetry) {
            response.close()
            tryCount++
            response = chain.proceed(request)
        }
        
        return response
    }
}
```

### 2.3 缓存配置

```kotlin
// 1. 缓存配置
val cacheDir = File(context.cacheDir, "http_cache")
val cache = Cache(cacheDir, 10 * 1024 * 1024) // 10MB

val client = OkHttpClient.Builder()
    .cache(cache)
    .build()

// 2. 缓存控制
val request = Request.Builder()
    .url("https://api.example.com/data")
    .cacheControl(CacheControl.Builder()
        .maxAge(5, TimeUnit.MINUTES)      // 最大缓存 5 分钟
        .maxStale(1, TimeUnit.HOURS)      // 可接受 1 小时过期缓存
        .build())
    .build()

// 3. 强制网络
val networkRequest = Request.Builder()
    .url("https://api.example.com/data")
    .cacheControl(CacheControl.FORCE_NETWORK)
    .build()

// 4. 强制缓存
val cacheRequest = Request.Builder()
    .url("https://api.example.com/data")
    .cacheControl(CacheControl.FORCE_CACHE)
    .build()

// 5. 缓存响应
val response = client.newCall(request).execute()
val cacheResponse = response.cacheResponse
val networkResponse = response.networkResponse

if (cacheResponse != null) {
    println("从缓存获取")
} else {
    println("从网络获取")
}
```

---

## 三、进阶用法

### 3.1 文件上传

```kotlin
interface UploadApi {
    @Multipart
    @POST("upload")
    suspend fun uploadFile(
        @Part file: MultipartBody.Part
    ): Response<UploadResult>
    
    @Multipart
    @POST("upload/multiple")
    suspend fun uploadFiles(
        @Part files: List<MultipartBody.Part>
    ): Response<UploadResult>
}

// 使用
suspend fun uploadImage(imageFile: File) {
    val requestBody = imageFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
    val filePart = MultipartBody.Part.createFormData(
        "file",
        imageFile.name,
        requestBody
    )
    
    val response = api.uploadFile(filePart)
    if (response.isSuccessful) {
        println("上传成功：${response.body()?.url}")
    }
}

// 带进度上传
class ProgressRequestBody(
    private val requestBody: RequestBody,
    private val listener: ProgressListener
) : RequestBody() {
    
    override fun contentType() = requestBody.contentType()
    
    override fun contentLength() = requestBody.contentLength()
    
    override fun writeTo(sink: BufferedSink) {
        requestBody.writeTo(sink)
    }
    
    interface ProgressListener {
        fun onProgress(current: Long, total: Long, done: Boolean)
    }
}
```

### 3.2 文件下载

```kotlin
interface DownloadApi {
    @Streaming
    @GET("files/{fileId}")
    suspend fun downloadFile(
        @Path("fileId") fileId: String
    ): Response<ResponseBody>
}

// 下载带进度
suspend fun downloadFile(fileId: String, savePath: String) {
    val response = api.downloadFile(fileId)
    
    if (!response.isSuccessful) {
        throw Exception("下载失败：${response.code()}")
    }
    
    response.body()?.use { body ->
        val file = File(savePath)
        file.outputStream().use { output ->
            val source = body.source()
            val total = body.contentLength()
            var read: Long
            var downloaded = 0L
            
            while (source.read(buffer).also { read = it } != -1L) {
                output.write(buffer, 0, read.toInt())
                downloaded += read
                // 更新进度
                onProgress(downloaded, total)
            }
        }
    }
}
```

### 3.3 统一响应处理

```kotlin
// 1. 封装响应结果
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val code: Int, val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// 2. 统一处理
suspend fun <T> apiCall(block: suspend () -> Response<T>): Result<T> {
    return try {
        val response = block()
        if (response.isSuccessful) {
            response.body()?.let {
                Result.Success(it)
            } ?: Result.Error(-1, "响应体为空")
        } else {
            Result.Error(response.code(), response.message())
        }
    } catch (e: Exception) {
        Result.Error(-1, e.message ?: "未知错误")
    }
}

// 3. 使用
lifecycleScope.launch {
    when (val result = apiCall { api.getUser(1) }) {
        is Result.Success -> updateUI(result.data)
        is Result.Error -> showError(result.message)
        is Result.Loading -> showLoading()
    }
}
```

### 3.4 Token 刷新

```kotlin
class TokenAuthenticator(
    private val tokenRepository: TokenRepository
) : Authenticator {
    
    @Synchronized
    override fun authenticate(route: Route?, response: Response): Request? {
        // 检查是否是 401 错误
        if (response.code != 401) return null
        
        // 刷新 Token
        val newToken = tokenRepository.refreshToken()
        
        // 如果刷新失败，返回 null
        if (newToken == null) return null
        
        // 使用新 Token 重试
        return response.request.newBuilder()
            .header("Authorization", "Bearer $newToken")
            .build()
    }
}

// 配置
val client = OkHttpClient.Builder()
    .authenticator(TokenAuthenticator(tokenRepository))
    .build()
```

---

## 四、性能优化

### 4.1 连接池优化

```kotlin
val client = OkHttpClient.Builder()
    .connectionPool(
        ConnectionPool(
            maxIdleConnections = 5,      // 最大空闲连接数
            keepAliveDuration = 5,       // 连接保活时间
            TimeUnit.MINUTES
        )
    )
    .build()
```

### 4.2 DNS 优化

```kotlin
// 使用公共 DNS
val client = OkHttpClient.Builder()
    .dns(DnsOverHttps.Builder()
        .client(OkHttpClient())
        .url("https://dns.google/dns-query".toHttpUrl())
        .build())
    .build()
```

### 4.3 请求合并

```kotlin
// 使用 zip 合并多个请求
suspend fun loadUserData() = coroutineScope {
    val userDeferred = async { api.getUser() }
    val postsDeferred = async { api.getPosts() }
    val commentsDeferred = async { api.getComments() }
    
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    val comments = commentsDeferred.await()
    
    updateUI(user, posts, comments)
}
```

### 4.4 响应缓存

```kotlin
// 1. 服务器端缓存头
// Cache-Control: public, max-age=300
// ETag: "abc123"
// Last-Modified: Mon, 13 Apr 2026 09:00:00 GMT

// 2. 客户端缓存拦截器
class CacheInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val response = chain.proceed(request)
        
        // 设置缓存策略
        return response.newBuilder()
            .header("Cache-Control", "public, max-age=300")
            .removeHeader("Pragma")
            .build()
    }
}
```

---

## 五、面试核心考点

### 5.1 基础问题

**Q1: Retrofit 和 OkHttp 的关系？**

**A:**
- **OkHttp**: 底层 HTTP 客户端，负责网络连接、请求执行
- **Retrofit**: 网络请求框架，基于 OkHttp，提供注解式 API
- **关系**: Retrofit 内部使用 OkHttp 执行实际请求

**Q2: 拦截器的执行顺序？**

**A:**
```
应用拦截器 1 → 应用拦截器 2 → 网络拦截器 → 服务器
                                    ↓
应用拦截器 1 ← 应用拦截器 2 ← 网络拦截器 ← 服务器
```

**Q3: 同步请求和异步请求的区别？**

**A:**
```kotlin
// 同步（阻塞）
val response = call.execute()

// 异步（非阻塞）
call.enqueue(object : Callback<User> {
    override fun onResponse(call: Call<User>, response: Response<User>) {
        // 处理响应
    }
    
    override fun onFailure(call: Call<User>, t: Throwable) {
        // 处理失败
    }
})
```

### 5.2 进阶问题

**Q4: 如何实现 Token 无感知刷新？**

**A:**
```kotlin
// 使用 Authenticator
class TokenAuthenticator : Authenticator {
    @Synchronized
    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.code != 401) return null
        
        val newToken = refreshToken() ?: return null
        
        return response.request.newBuilder()
            .header("Authorization", "Bearer $newToken")
            .build()
    }
}
```

**Q5: 如何处理大文件上传下载？**

**A:**
- **上传**: MultipartBody + ProgressRequestBody
- **下载**: @Streaming + 流式写入
- **注意**: 避免内存溢出，使用流式处理

**Q6: 缓存策略有哪些？**

**A:**
- **FORCE_NETWORK**: 强制网络
- **FORCE_CACHE**: 强制缓存
- **CACHE_ELSE_NETWORK**: 缓存优先
- **NO_CACHE**: 不使用缓存
- **NO_STORE**: 不存储缓存

### 5.3 实战问题

**Q7: 如何处理网络异常？**

**A:**
```kotlin
sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(val code: Int, val message: String) : NetworkResult<Nothing>()
    object Timeout : NetworkResult<Nothing>()
    object NoNetwork : NetworkResult<Nothing>()
}

suspend fun safeApiCall(block: suspend () -> Response<*>): NetworkResult<*> {
    return try {
        if (!isNetworkAvailable()) {
            return NetworkResult.NoNetwork
        }
        
        val response = block()
        when {
            response.isSuccessful -> NetworkResult.Success(response.body())
            response.code() == 401 -> NetworkResult.Error(401, "未授权")
            response.code() == 404 -> NetworkResult.Error(404, "未找到")
            response.code() >= 500 -> NetworkResult.Error(response.code(), "服务器错误")
            else -> NetworkResult.Error(response.code(), response.message())
        }
    } catch (e: SocketTimeoutException) {
        NetworkResult.Timeout
    } catch (e: UnknownHostException) {
        NetworkResult.NoNetwork
    } catch (e: Exception) {
        NetworkResult.Error(-1, e.message ?: "未知错误")
    }
}
```

**Q8: 如何优化网络请求性能？**

**A:**
1. **连接池**: 复用连接
2. **缓存**: 减少重复请求
3. **请求合并**: 并行执行
4. **Gzip 压缩**: 减少数据传输
5. **DNS 预解析**: 加快连接
6. **HTTPS 优化**: Session 复用

---

## 六、实战代码模板

### 6.1 完整网络层架构

```kotlin
// 1. 数据模型
data class User(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String
)

// 2. API 接口
interface UserApi {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: Int): Response<User>
    
    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int,
        @Query("limit") limit: Int = 20
    ): Response<List<User>>
    
    @POST("users")
    suspend fun createUser(@Body user: User): Response<User>
}

// 3. 网络客户端
object NetworkClient {
    private const val BASE_URL = "https://api.example.com/"
    
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(LoggingInterceptor())
        .addInterceptor(AuthInterceptor(tokenProvider))
        .addInterceptor(CacheInterceptor())
        .cache(Cache(File(cacheDir, "http_cache"), 10 * 1024 * 1024))
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .addCallAdapterFactory(CoroutinesCallAdapterFactory())
        .build()
    
    val userApi: UserApi = retrofit.create(UserApi::class.java)
}

// 4. Repository 层
class UserRepository(
    private val api: UserApi
) {
    suspend fun getUser(userId: Int): Result<User> {
        return try {
            val response = api.getUser(userId)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getUserFlow(userId: Int): Flow<User> = flow {
        val user = getUser(userId).getOrThrow()
        emit(user)
    }.flowOn(Dispatchers.IO)
}

// 5. ViewModel 层
class UserViewModel(
    private val repository: UserRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val uiState: StateFlow<UiState<User>> = _uiState.asStateFlow()
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            repository.getUser(userId)
                .fold(
                    onSuccess = { user ->
                        _uiState.value = UiState.Success(user)
                    },
                    onFailure = { error ->
                        _uiState.value = UiState.Error(error.message ?: "Error")
                    }
                )
        }
    }
}
```

---

## 七、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| Retrofit vs OkHttp | ⭐⭐ | 框架 vs 底层 |
| 拦截器顺序 | ⭐⭐⭐ | 应用→网络→服务器 |
| 同步 vs 异步 | ⭐⭐ | execute vs enqueue |
| Token 刷新 | ⭐⭐⭐⭐ | Authenticator |
| 缓存策略 | ⭐⭐⭐ | CacheControl |
| 文件上传下载 | ⭐⭐⭐ | Multipart/Streaming |
| 连接池优化 | ⭐⭐⭐ | ConnectionPool |
| 异常处理 | ⭐⭐⭐ | try-catch/Result |

---

**📚 参考资料**
- [Retrofit 官方文档](https://square.github.io/retrofit/)
- [OkHttp 官方文档](https://square.github.io/okhttp/)
- [网络优化最佳实践](https://developer.android.com/training/basics/network-ops)

