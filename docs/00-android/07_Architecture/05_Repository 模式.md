# 05 Repository 模式

## 目录

1. [Repository 模式概述](#1-repository-模式概述)
2. [Repository 模式的核心概念](#2-repository-模式的核心概念)
3. [数据源抽象：Local 与 Remote](#3-数据源抽象 local 与 remote)
4. [单一数据源原则](#4-单一数据源原则)
5. [缓存策略详解](#5-缓存策略详解)
6. [与 ViewModel 集成](#6-与-viewmodel 集成)
7. [完整代码示例](#7-完整代码示例)
8. [高级主题](#8-高级主题)
9. [常见陷阱与最佳实践](#9-常见陷阱与最佳实践)
10. [面试考点](#10-面试考点)

---

## 1. Repository 模式概述

### 1.1 什么是 Repository 模式？

Repository 模式（仓储模式）是一种设计模式，它在数据源和业务逻辑之间提供一个抽象层，使得数据访问逻辑与应用程序的其他部分解耦。在 Android 开发中，Repository 扮演着"数据管家"的角色，它协调多个数据源（本地数据库、远程 API、缓存等），为上层（如 ViewModel）提供统一、简洁的数据访问接口。

#### 核心思想

Repository 模式的核心思想可以概括为：

1. **抽象数据源**：屏蔽底层数据访问细节
2. **统一接口**：为上层提供一致的数据访问 API
3. **数据协调**：协调多个数据源，处理数据同步
4. **离线优先**：优先使用本地数据，保证离线可用性

### 1.2 为什么需要 Repository？

在现代 Android 应用中，数据来源通常不止一个：

- **远程数据源**：REST API、GraphQL、WebSocket
- **本地数据源**：Room 数据库、DataStore、SharedPreferences
- **缓存数据源**：Memory Cache、Disk Cache

如果没有 Repository 模式，你的 ViewModel 或 Activity 需要直接处理所有数据源，导致：

```kotlin
// ❌ 反模式：ViewModel 直接处理多个数据源
class UserViewModel {
    private val apiService: ApiService
    private val userDao: UserDao
    private val cacheManager: CacheManager
    
    fun getUser(userId: String) {
        // 复杂的缓存逻辑
        val cached = cacheManager.get(userId)
        if (cached != null) {
            _user.value = cached
            return
        }
        
        // 数据库查询
        val dbUser = userDao.getUser(userId)
        if (dbUser != null) {
            _user.value = dbUser
            cacheManager.put(userId, dbUser)
            return
        }
        
        // 网络请求
        apiService.getUser(userId).enqueue { response ->
            if (response.isSuccessful) {
                val user = response.body()
                userDao.insert(user)
                cacheManager.put(userId, user)
                _user.value = user
            }
        }
    }
}
```

使用 Repository 后：

```kotlin
// ✅ 好模式：ViewModel 只关注业务逻辑
class UserViewModel(private val repository: UserRepository) {
    val user: StateFlow<User> = repository.getUser(userId)
    
    fun refreshUser() {
        repository.refreshUser(userId)
    }
}
```

### 1.3 Repository 在 Android Architecture 中的位置

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Activity  │  │   Fragment  │  │   Compose   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Presentation Layer                       │
│  ┌─────────────────────────────────────────────┐       │
│  │              ViewModel                       │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Repository                             │
│  ┌─────────────────────────────────────────────┐       │
│  │           UserRepository                    │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
            ↓                      ↓
┌────────────────────────┐  ┌────────────────────────┐
│    Local Data Source   │  │   Remote Data Source   │
│  ┌────────────────┐    │  │  ┌────────────────┐    │
│  │   Room DAO     │    │  │  │  Retrofit API  │    │
│  └────────────────┘    │  │  └────────────────┘    │
└────────────────────────┘  └────────────────────────┘
```

---

## 2. Repository 模式的核心概念

### 2.1 Repository 的职责

Repository 应该负责：

1. **数据获取**：从各种数据源获取数据
2. **数据转换**：将不同数据源的数据转换为统一的 Domain 对象
3. **数据协调**：决定从哪个数据源获取数据
4. **错误处理**：统一处理数据获取过程中的错误
5. **并发控制**：避免重复请求、竞态条件

### 2.2 Repository 不应该做什么

1. ❌ 不应该包含 UI 逻辑
2. ❌ 不应该处理 UI 状态
3. ❌ 不应该直接依赖 Android 框架类
4. ❌ 不应该处理数据展示逻辑

### 2.3 Repository 的设计原则

#### 单一职责原则 (SRP)

每个 Repository 只负责一个领域对象的数据访问：

```kotlin
// ✅ 好的设计
interface UserRepository
interface PostRepository
interface CommentRepository

// ❌ 坏的设计 - 上帝对象
interface AllInOneRepository {
    // 用户相关
    fun getUser()
    fun updateUser()
    
    // 帖子相关
    fun getPosts()
    fun createPost()
    
    // 评论相关
    fun getComments()
    fun addComment()
    
    // 设置相关
    fun getSettings()
    fun updateSettings()
}
```

#### 依赖倒置原则 (DIP)

Repository 应该定义接口，具体实现可以替换：

```kotlin
// 定义接口
interface UserRepository {
    fun getUser(userId: String): Flow<User>
    fun searchUsers(query: String): Flow<List<User>>
}

// 具体实现
class UserRepositoryImpl(
    private val userDao: UserDao,
    private val apiService: ApiService
) : UserRepository {
    // 实现细节
}

// 测试可以用 Mock
class UserRepositoryTest {
    @Test
    fun testGetUser() {
        val mockRepo = MockUserRepository()
        // 测试逻辑
    }
}
```

---

## 3. 数据源抽象：Local 与 Remote

### 3.1 LocalDataSource

本地数据源负责处理离线数据，通常基于 Room 数据库：

```kotlin
// User 实体
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val bio: String?,
    val createdAt: Long,
    val updatedAt: Long
)

// Local DataSource 接口
interface LocalDataSource {
    fun getUser(userId: String): Flow<UserEntity?>
    fun getAllUsers(): Flow<List<UserEntity>>
    fun insertUser(user: UserEntity): Flow<Long>
    fun updateUser(user: UserEntity): Flow<Int>
    fun deleteUser(userId: String): Flow<Int>
    fun searchUsers(query: String): Flow<List<UserEntity>>
    fun clearAllUsers(): Flow<Int>
}

// Local DataSource 实现
class LocalDataSourceImpl(
    private val userDao: UserDao
) : LocalDataSource {
    
    override fun getUser(userId: String): Flow<UserEntity?> = 
        userDao.getUser(userId)
    
    override fun getAllUsers(): Flow<List<UserEntity>> = 
        userDao.getAllUsers()
    
    override fun insertUser(user: UserEntity): Flow<Long> = 
        userDao.insert(user).map { it.insertedId }
    
    override fun updateUser(user: UserEntity): Flow<Int> = 
        userDao.update(user)
    
    override fun deleteUser(userId: String): Flow<Int> = 
        userDao.delete(userId)
    
    override fun searchUsers(query: String): Flow<List<UserEntity>> = 
        userDao.searchUsers("%$query%")
    
    override fun clearAllUsers(): Flow<Int> = 
        userDao.clearAll()
}
```

### 3.2 RemoteDataSource

远程数据源负责处理网络请求，通常基于 Retrofit：

```kotlin
// API 响应模型
data class UserResponse(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("avatar_url") val avatarUrl: String?,
    @SerializedName("bio") val bio: String?,
    @SerializedName("created_at") val createdAt: Long,
    @SerializedName("updated_at") val updatedAt: Long
)

data class UserListResponse(
    @SerializedName("data") val users: List<UserResponse>,
    @SerializedName("pagination") val pagination: Pagination
)

data class Pagination(
    val page: Int,
    val perPage: Int,
    val total: Int,
    val totalPages: Int
)

// API Service 接口
interface ApiService {
    @GET("users/{userId}")
    suspend fun getUser(@Path("userId") userId: String): Response<UserResponse>
    
    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<UserListResponse>
    
    @POST("users")
    suspend fun createUser(@Body user: CreateUserRequest): Response<UserResponse>
    
    @PUT("users/{userId}")
    suspend fun updateUser(
        @Path("userId") userId: String,
        @Body user: UpdateUserRequest
    ): Response<UserResponse>
    
    @DELETE("users/{userId}")
    suspend fun deleteUser(@Path("userId") userId: String): Response<Unit>
    
    @GET("users/search")
    suspend fun searchUsers(
        @Query("q") query: String,
        @Query("page") page: Int = 1
    ): Response<UserListResponse>
}

// Remote DataSource 接口
interface RemoteDataSource {
    suspend fun getUser(userId: String): Result<UserResponse>
    suspend fun getUsers(page: Int, perPage: Int): Result<UserListResponse>
    suspend fun createUser(user: CreateUserRequest): Result<UserResponse>
    suspend fun updateUser(userId: String, user: UpdateUserRequest): Result<UserResponse>
    suspend fun deleteUser(userId: String): Result<Unit>
    suspend fun searchUsers(query: String, page: Int): Result<UserListResponse>
}

// Remote DataSource 实现
class RemoteDataSourceImpl(
    private val apiService: ApiService,
    private val tokenProvider: TokenProvider
) : RemoteDataSource {
    
    override suspend fun getUser(userId: String): Result<UserResponse> {
        return try {
            val response = apiService.getUser(userId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(ApiException(response.code(), response.message()))
            }
        } catch (e: IOException) {
            Result.failure(NetworkException("Network error: ${e.message}"))
        } catch (e: HttpException) {
            Result.failure(ApiException(e.code(), e.message()))
        } catch (e: Exception) {
            Result.failure(GenericException("Error: ${e.message}"))
        }
    }
    
    override suspend fun getUsers(page: Int, perPage: Int): Result<UserListResponse> {
        return try {
            val response = apiService.getUsers(page, perPage)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(ApiException(response.code(), response.message()))
            }
        } catch (e: Exception) {
            Result.failure(GenericException("Error fetching users: ${e.message}"))
        }
    }
    
    override suspend fun createUser(user: CreateUserRequest): Result<UserResponse> {
        return try {
            val response = apiService.createUser(user)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(ApiException(response.code(), response.message()))
            }
        } catch (e: Exception) {
            Result.failure(GenericException("Error creating user: ${e.message}"))
        }
    }
    
    override suspend fun updateUser(userId: String, user: UpdateUserRequest): Result<UserResponse> {
        return try {
            val response = apiService.updateUser(userId, user)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(ApiException(response.code(), response.message()))
            }
        } catch (e: Exception) {
            Result.failure(GenericException("Error updating user: ${e.message}"))
        }
    }
    
    override suspend fun deleteUser(userId: String): Result<Unit> {
        return try {
            val response = apiService.deleteUser(userId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(ApiException(response.code(), response.message()))
            }
        } catch (e: Exception) {
            Result.failure(GenericException("Error deleting user: ${e.message}"))
        }
    }
    
    override suspend fun searchUsers(query: String, page: Int): Result<UserListResponse> {
        return try {
            val response = apiService.searchUsers(query, page)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(ApiException(response.code(), response.message()))
            }
        } catch (e: Exception) {
            Result.failure(GenericException("Error searching users: ${e.message}"))
        }
    }
}
```

### 3.3 自定义异常类

```kotlin
// 基础异常
sealed class RepositoryException(message: String) : Exception(message) {
    
    // 网络相关异常
    class NetworkException(message: String) : RepositoryException(message)
    class NoConnectionException : RepositoryException("No network connection")
    
    // API 相关异常
    class ApiException(val code: Int, message: String) : RepositoryException(message)
    class UnauthorizedException : RepositoryException("Unauthorized access")
    class ForbiddenException : RepositoryException("Access forbidden")
    class NotFoundException(val resource: String) : 
        RepositoryException("Resource not found: $resource")
    
    // 数据相关异常
    class DataParseException(val data: String) : RepositoryException("Failed to parse data")
    class InvalidDataException(val field: String) : 
        RepositoryException("Invalid data for field: $field")
    
    // 缓存相关异常
    class CacheException(message: String) : RepositoryException(message)
    
    // 通用异常
    class GenericException(message: String) : RepositoryException(message)
    
    // 判断是否需要重试
    val shouldRetry: Boolean
        get() = when (this) {
            is NetworkException -> true
            is NoConnectionException -> true
            is ApiException -> code == 500 || code == 503 || code == 504
            else -> false
        }
    
    // 判断是否是认证错误
    val isAuthenticationError: Boolean
        get() = when (this) {
            is ApiException -> code == 401
            is UnauthorizedException -> true
            else -> false
        }
    
    // 判断是否是权限错误
    val isAuthorizationError: Boolean
        get() = when (this) {
            is ApiException -> code == 403
            is ForbiddenException -> true
            else -> false
        }
}
```

---

## 4. 单一数据源原则

### 4.1 什么是单一数据源原则？

单一数据源原则（Single Source of Truth）是指：在任意时刻，应该只有一个数据源被认为是"权威"的。这避免了数据不一致的问题。

### 4.2 常见的数据源策略

#### 策略 1：Network First（网络优先）

```kotlin
// 直接从网络获取，不检查缓存
class UserRepositoryNetworkFirst(
    private val remoteDataSource: RemoteDataSource,
    private val localDataSource: LocalDataSource
) : UserRepository {
    
    override fun getUser(userId: String): Flow<User> = flow {
        emit(User.Loading)
        
        when (val result = remoteDataSource.getUser(userId)) {
            is Result.Success -> {
                // 保存到本地
                localDataSource.insertUser(result.data.toEntity())
                // 返回数据
                emit(User.Success(result.data.toDomain()))
            }
            is Result.Failure -> {
                emit(User.Error(result.exception))
            }
        }
    }.asFlow()
}
```

**适用场景**：
- 数据实时性要求高（如股票价格）
- 数据不需要离线访问
- 每次都需要最新数据

#### 策略 2：Cache First（缓存优先）

```kotlin
// 优先从本地获取，如果本地没有再去网络
class UserRepositoryCacheFirst(
    private val remoteDataSource: RemoteDataSource,
    private val localDataSource: LocalDataSource
) : UserRepository {
    
    override fun getUser(userId: String): Flow<User> = flow {
        // 先尝试从本地获取
        val localUser = localDataSource.getUser(userId).firstOrNull()
        
        if (localUser != null) {
            emit(User.Success(localUser.toDomain()))
            // 后台刷新数据
            refreshUserFromNetwork(userId)
        } else {
            emit(User.Loading)
            fetchFromNetwork(userId)
        }
    }.asFlow()
    
    private suspend fun refreshUserFromNetwork(userId: String) {
        when (val result = remoteDataSource.getUser(userId)) {
            is Result.Success -> {
                localDataSource.insertUser(result.data.toEntity())
            }
            is Result.Failure -> {
                // 静默失败，使用缓存数据
            }
        }
    }
    
    private suspend fun fetchFromNetwork(userId: String) {
        when (val result = remoteDataSource.getUser(userId)) {
            is Result.Success -> {
                localDataSource.insertUser(result.data.toEntity())
                emit(User.Success(result.data.toDomain()))
            }
            is Result.Failure -> {
                emit(User.Error(result.exception))
            }
        }
    }
}
```

**适用场景**：
- 需要快速显示数据
- 支持离线访问
- 数据实时性要求不高

#### 策略 3：Cache with Refresh（缓存 + 刷新）

```kotlin
// 立即返回缓存数据，同时在后台刷新
class UserRepositoryCacheWithRefresh(
    private val remoteDataSource: RemoteDataSource,
    private val localDataSource: LocalDataSource
) : UserRepository {
    
    override fun getUser(userId: String): Flow<User> = flow {
        // 立即返回缓存
        val cachedUser = localDataSource.getUser(userId).firstOrNull()
        
        if (cachedUser != null) {
            emit(User.Success(cachedUser.toDomain(), isStale = true))
        } else {
            emit(User.Loading)
        }
        
        // 后台刷新
        when (val result = remoteDataSource.getUser(userId)) {
            is Result.Success -> {
                localDataSource.insertUser(result.data.toEntity())
                emit(User.Success(result.data.toDomain(), isStale = false))
            }
            is Result.Failure -> {
                if (cachedUser == null) {
                    emit(User.Error(result.exception))
                }
                // 如果有缓存，保持缓存数据，不报错误
            }
        }
    }.asFlow()
}
```

**适用场景**：
- 需要快速响应用户
- 数据需要定期更新
- 离线可用但需要后台同步

#### 策略 4：Cache or Network（缓存或网络）

```kotlin
// 有缓存用缓存，没缓存去网络
class UserRepositoryCacheOrNetwork(
    private val remoteDataSource: RemoteDataSource,
    private val localDataSource: LocalDataSource
) : UserRepository {
    
    override fun getUser(userId: String): Flow<User> = flow {
        val cachedUser = localDataSource.getUser(userId).firstOrNull()
        
        if (cachedUser != null) {
            emit(User.Success(cachedUser.toDomain()))
        } else {
            emit(User.Loading)
            when (val result = remoteDataSource.getUser(userId)) {
                is Result.Success -> {
                    localDataSource.insertUser(result.data.toEntity())
                    emit(User.Success(result.data.toDomain()))
                }
                is Result.Failure -> {
                    emit(User.Error(result.exception))
                }
            }
        }
    }.asFlow()
}
```

**适用场景**：
- 离线优先应用
- 网络不稳定环境
- 节省流量

### 4.3 数据源选择矩阵

| 策略 | 有缓存 | 无缓存 | 网络成功 | 网络失败 |
|------|--------|--------|----------|----------|
| Network First | 忽略缓存 | 网络请求 | 返回网络数据 + 更新缓存 | 返回错误 |
| Cache First | 返回缓存 | 网络请求 | 返回缓存 + 后台更新 | 返回缓存 |
| Cache with Refresh | 返回缓存 (标记过期) | 网络请求 | 更新缓存 + 返回新数据 | 保持缓存 |
| Cache or Network | 返回缓存 | 网络请求 | 更新缓存 + 返回新数据 | 返回错误 |

---

## 5. 缓存策略详解

### 5.1 缓存层级

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│           (ViewModel)                   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Repository Layer               │
│      (Cache Coordination)               │
└─────────────────────────────────────────┘
         ↓                ↓
┌──────────────┐  ┌──────────────┐
│  Memory Cache│  │  Disk Cache  │
│   (L1)       │  │   (L2)       │
│  Fast, Volatile│  Persistent   │
└──────────────┘  └──────────────┘
         ↓                ↓
┌──────────────┐  ┌──────────────┐
│    Room DB   │  │   Network    │
│  (Primary)   │  │  (Remote)    │
└──────────────┘  └──────────────┘
```

### 5.2 Memory Cache 实现

```kotlin
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import kotlin.time.Duration

// 简单的内存缓存
class SimpleMemoryCache<K, V> {
    private val cache = ConcurrentHashMap<K, CacheEntry<V>>()
    
    fun get(key: K): V? {
        val entry = cache[key]
        return if (entry != null && !entry.isExpired) {
            entry.value
        } else {
            cache.remove(key)
            null
        }
    }
    
    fun put(key: K, value: V, ttl: Duration = Duration.INFINITE) {
        cache[key] = CacheEntry(value, System.currentTimeMillis() + ttl.inWholeMilliseconds)
    }
    
    fun remove(key: K): V? {
        return cache.remove(key)?.value
    }
    
    fun clear() {
        cache.clear()
    }
    
    private data class CacheEntry<V>(
        val value: V,
        val expirationTime: Long
    ) {
        val isExpired: Boolean
            get() = System.currentTimeMillis() > expirationTime
    }
}

// 带容量限制的 LRU 缓存
class LruMemoryCache<K, V>(private val maxSize: Int) {
    private val cache = LinkedHashMap<K, V>(initialCapacity = maxSize, loadFactor = 0.75f, accessOrder = true)
    
    @Synchronized
    fun get(key: K): V? {
        return cache[key]
    }
    
    @Synchronized
    fun put(key: K, value: V) {
        // 如果已存在，先移除（会更新访问顺序）
        if (cache.containsKey(key)) {
            cache.remove(key)
        }
        
        cache[key] = value
        
        // 如果超出容量，移除最旧的条目
        while (cache.size > maxSize) {
            cache.remove(cache.keys.first())
        }
    }
    
    @Synchronized
    fun remove(key: K): V? {
        return cache.remove(key)
    }
    
    @Synchronized
    fun clear() {
        cache.clear()
    }
}

// 使用 Guava Cache（推荐）
import com.google.common.cache.CacheBuilder
import com.google.common.cache.CacheLoader

class GuavaMemoryCache<K, V> {
    private val cache: com.google.common.cache.Cache<K, V> = CacheBuilder.newBuilder()
        .maximumSize(100)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .build(CacheLoader.from { key ->
            // 缓存未命中时的加载逻辑
            throw CacheControlException("Key not found: $key")
        })
    
    fun get(key: K): V? {
        return try {
            cache.getIfPresent(key)
        } catch (e: CacheControlException) {
            null
        }
    }
    
    fun put(key: K, value: V) {
        cache.put(key, value)
    }
    
    fun invalidate(key: K) {
        cache.invalidate(key)
    }
    
    fun invalidateAll() {
        cache.invalidateAll()
    }
}
```

### 5.3 缓存失效策略

```kotlin
// 缓存失效策略接口
interface CacheInvalidationStrategy {
    fun shouldInvalidate(key: String): Boolean
    fun invalidate(key: String)
    fun invalidateAll()
}

// 基于时间的失效策略
class TimeBasedInvalidationStrategy(
    private val ttl: Duration = Duration.MINUTES(5)
) : CacheInvalidationStrategy {
    private val timestamps = ConcurrentHashMap<String, Long>()
    
    override fun shouldInvalidate(key: String): Boolean {
        val timestamp = timestamps[key] ?: return true
        return (System.currentTimeMillis() - timestamp) > ttl.inWholeMilliseconds
    }
    
    override fun invalidate(key: String) {
        timestamps.remove(key)
    }
    
    override fun invalidateAll() {
        timestamps.clear()
    }
    
    fun updateTimestamp(key: String) {
        timestamps[key] = System.currentTimeMillis()
    }
}

// 基于版本的失效策略
class VersionBasedInvalidationStrategy : CacheInvalidationStrategy {
    private val versions = ConcurrentHashMap<String, Long>()
    private var globalVersion: Long = 0
    
    override fun shouldInvalidate(key: String): Boolean {
        val cachedVersion = versions[key] ?: return true
        return cachedVersion != globalVersion
    }
    
    override fun invalidate(key: String) {
        versions.remove(key)
    }
    
    override fun invalidateAll() {
        versions.clear()
        globalVersion++
    }
    
    fun recordVersion(key: String) {
        versions[key] = globalVersion
    }
    
    fun bumpGlobalVersion() {
        globalVersion++
    }
}
```

### 5.4 完整的缓存实现

```kotlin
// 缓存配置
data class CacheConfig(
    val memoryCacheEnabled: Boolean = true,
    val diskCacheEnabled: Boolean = true,
    val memoryCacheSize: Int = 100,
    val diskCacheSize: Long = 10 * 1024 * 1024, // 10MB
    val timeToLive: Duration = Duration.MINUTES(30),
    val maxIdle: Duration = Duration.HOURS(1)
)

// 缓存管理器
class CacheManager(
    private val config: CacheConfig = CacheConfig()
) {
    private val memoryCache = LruMemoryCache<String, Any>(config.memoryCacheSize)
    private val diskCache = DiskLruCache(config.diskCacheSize)
    private val timestampCache = ConcurrentHashMap<String, Long>()
    
    @Suppress("UNCHECKED_CAST")
    fun <T> get(key: String): T? {
        // 检查内存缓存
        if (config.memoryCacheEnabled) {
            val cached = memoryCache.get(key) as? T
            if (cached != null && !isExpired(key)) {
                return cached
            }
        }
        
        // 检查磁盘缓存
        if (config.diskCacheEnabled) {
            val cached = readFromDisk(key) as? T
            if (cached != null && !isExpired(key)) {
                // 预热内存缓存
                if (config.memoryCacheEnabled) {
                    memoryCache.put(key, cached)
                }
                return cached
            }
        }
        
        return null
    }
    
    fun <T> put(key: String, value: T) {
        val serialized = serialize(value)
        
        // 写入内存缓存
        if (config.memoryCacheEnabled) {
            memoryCache.put(key, value)
        }
        
        // 写入磁盘缓存
        if (config.diskCacheEnabled) {
            writeToDisk(key, serialized)
        }
        
        // 记录时间戳
        timestampCache[key] = System.currentTimeMillis()
    }
    
    fun remove(key: String) {
        if (config.memoryCacheEnabled) {
            memoryCache.remove(key)
        }
        if (config.diskCacheEnabled) {
            removeFromDisk(key)
        }
        timestampCache.remove(key)
    }
    
    fun clear() {
        if (config.memoryCacheEnabled) {
            memoryCache.clear()
        }
        if (config.diskCacheEnabled) {
            clearDiskCache()
        }
        timestampCache.clear()
    }
    
    private fun isExpired(key: String): Boolean {
        val timestamp = timestampCache[key] ?: return true
        val age = System.currentTimeMillis() - timestamp
        return age > config.timeToLive.inWholeMilliseconds
    }
    
    private fun serialize(value: Any): String {
        return when (value) {
            is String -> value
            else -> Json.toJson(value)
        }
    }
    
    private fun <T> deserialize(data: String, type: String): T? {
        return try {
            when {
                data.startsWith('"') -> data as? T
                else -> Json.fromJson(data, type) as? T
            }
        } catch (e: Exception) {
            null
        }
    }
    
    private fun readFromDisk(key: String): String? {
        // 实现从磁盘读取
        return null
    }
    
    private fun writeToDisk(key: String, value: String) {
        // 实现写入磁盘
    }
    
    private fun removeFromDisk(key: String) {
        // 实现从磁盘删除
    }
    
    private fun clearDiskCache() {
        // 实现清空磁盘缓存
    }
}
```

---

## 6. 与 ViewModel 集成

### 6.1 基础集成模式

```kotlin
// UserRepository 接口
interface UserRepository {
    val currentUser: StateFlow<UserState>
    val users: StateFlow<ListState<User>>
    
    fun getUser(userId: String): Flow<UserState>
    fun getAllUsers(): Flow<ListState<User>>
    fun searchUsers(query: String): Flow<ListState<User>>
    fun refreshUser(userId: String): Result<Unit>
    fun updateUser(user: UserUpdate): Result<Unit>
    fun deleteUser(userId: String): Result<Unit>
    fun logout(): Result<Unit>
}

// UserState 密封类
sealed class UserState {
    object Loading : UserState()
    data class Success(val user: User, val isStale: Boolean = false) : UserState()
    data class Error(val exception: Exception, val retry: Boolean = true) : UserState()
    object Empty : UserState()
}

sealed class ListState<T> {
    object Loading : ListState<Nothing>()
    data class Success<T>(val items: List<T>, val isLoadingMore: Boolean = false) : ListState<T>()
    data class Error<T>(val exception: Exception, val items: List<T> = emptyList()) : ListState<T>()
    object Empty : ListState<Nothing>()
}

// UserRepository 实现
@Singleton
class UserRepositoryImpl @Inject constructor(
    private val localDataSource: LocalDataSource,
    private val remoteDataSource: RemoteDataSource,
    private val cacheManager: CacheManager,
    private val dispatcherProvider: DispatcherProvider
) : UserRepository {
    
    private val _currentUser = MutableStateFlow<UserState>(UserState.Empty)
    override val currentUser: StateFlow<UserState> = _currentUser.asStateFlow()
    
    private val _users = MutableStateFlow<ListState<User>>(ListState.Empty)
    override val users: StateFlow<ListState<User>> = _users.asStateFlow()
    
    private val userCache = ConcurrentHashMap<String, User>()
    private val paginationState = PaginationState()
    
    override fun getUser(userId: String): Flow<UserState> = flow {
        // 检查内存缓存
        val cachedUser = userCache[userId]
        if (cachedUser != null) {
            emit(UserState.Success(cachedUser, isStale = true))
        } else {
            emit(UserState.Loading)
        }
        
        // 从本地数据库获取
        val dbUser = withContext(dispatcherProvider.io) {
            localDataSource.getUser(userId).firstOrNull()
        }
        
        if (dbUser != null) {
            val domainUser = dbUser.toDomain()
            userCache[userId] = domainUser
            emit(UserState.Success(domainUser, isStale = true))
            
            // 后台刷新
            refreshFromNetwork(userId, dbUser.toDomain())
        } else {
            // 从网络获取
            when (val result = fetchFromNetwork(userId)) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    saveToLocal(domainUser)
                    userCache[userId] = domainUser
                    emit(UserState.Success(domainUser, isStale = false))
                }
                is Result.Failure -> {
                    emit(UserState.Error(result.exception, retry = result.exception.shouldRetry))
                }
            }
        }
    }.flowOn(dispatcherProvider.io)
    
    override fun getAllUsers(): Flow<ListState<User>> = flow {
        emit(ListState.Loading)
        
        // 获取本地数据
        val localUsers = withContext(dispatcherProvider.io) {
            localDataSource.getAllUsers().firstOrNull().orEmpty()
        }
        
        if (localUsers.isNotEmpty()) {
            val domainUsers = localUsers.map { it.toDomain() }
            emit(ListState.Success(domainUsers, isLoadingMore = false))
            
            // 后台刷新
            refreshUsersFromNetwork()
        } else {
            // 从网络获取
            fetchUsersFromNetwork(1)
        }
    }.flowOn(dispatcherProvider.io)
    
    override fun searchUsers(query: String): Flow<ListState<User>> = flow {
        emit(ListState.Loading)
        
        // 搜索本地
        val localResults = withContext(dispatcherProvider.io) {
            localDataSource.searchUsers(query).firstOrNull().orEmpty()
        }
        
        emit(ListState.Success(localResults.map { it.toDomain() }))
        
        // 搜索网络
        when (val result = remoteDataSource.searchUsers(query, 1)) {
            is Result.Success -> {
                result.data.users.forEach { user ->
                    localDataSource.insertUser(user.toEntity())
                }
                emit(ListState.Success(result.data.users.map { it.toDomain() }))
            }
            is Result.Failure -> {
                emit(ListState.Error(result.exception, localResults.map { it.toDomain() }))
            }
        }
    }.flowOn(dispatcherProvider.io)
    
    override suspend fun refreshUser(userId: String): Result<Unit> = try {
        when (val result = remoteDataSource.getUser(userId)) {
            is Result.Success -> {
                val entity = result.data.toEntity()
                localDataSource.insertUser(entity)
                userCache[userId] = entity.toDomain()
                Result.success(Unit)
            }
            is Result.Failure -> Result.failure(result.exception)
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
    
    override suspend fun updateUser(user: UserUpdate): Result<Unit> = try {
        val userId = user.id
        
        when (val result = remoteDataSource.updateUser(userId, user.toRequest())) {
            is Result.Success -> {
                val entity = result.data.toEntity()
                localDataSource.updateUser(entity)
                userCache[userId] = entity.toDomain()
                Result.success(Unit)
            }
            is Result.Failure -> Result.failure(result.exception)
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
    
    override suspend fun deleteUser(userId: String): Result<Unit> = try {
        when (val result = remoteDataSource.deleteUser(userId)) {
            is Result.Success -> {
                localDataSource.deleteUser(userId)
                userCache.remove(userId)
                Result.success(Unit)
            }
            is Result.Failure -> Result.failure(result.exception)
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
    
    override suspend fun logout(): Result<Unit> = try {
        localDataSource.clearAllUsers()
        userCache.clear()
        _currentUser.value = UserState.Empty
        _users.value = ListState.Empty
        Result.success(Unit)
    } catch (e: Exception) {
        Result.failure(e)
    }
    
    // 私有辅助方法
    private suspend fun fetchFromNetwork(userId: String): Result<UserResponse> {
        return remoteDataSource.getUser(userId)
    }
    
    private suspend fun refreshFromNetwork(userId: String, cachedUser: User) {
        try {
            when (val result = remoteDataSource.getUser(userId)) {
                is Result.Success -> {
                    val entity = result.data.toEntity()
                    localDataSource.insertUser(entity)
                    userCache[userId] = entity.toDomain()
                }
                is Result.Failure -> {
                    // 静默失败，保持缓存
                }
            }
        } catch (e: Exception) {
            // 静默失败
        }
    }
    
    private suspend fun fetchUsersFromNetwork(page: Int) {
        when (val result = remoteDataSource.getUsers(page, 20)) {
            is Result.Success -> {
                result.data.users.forEach { user ->
                    localDataSource.insertUser(user.toEntity())
                }
                emit(ListState.Success(
                    result.data.users.map { it.toDomain() },
                    isLoadingMore = result.data.pagination.page < result.data.pagination.totalPages
                ))
            }
            is Result.Failure -> {
                emit(ListState.Error(result.exception))
            }
        }
    }
    
    private suspend fun refreshUsersFromNetwork() {
        try {
            fetchUsersFromNetwork(1)
        } catch (e: Exception) {
            // 静默失败
        }
    }
    
    private suspend fun saveToLocal(user: User) {
        val entity = user.toEntity()
        localDataSource.insertUser(entity)
    }
}

// ViewModel 集成
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val dispatcherProvider: DispatcherProvider
) : ViewModel() {
    
    val currentUser: StateFlow<UserState> = repository.currentUser
    val users: StateFlow<ListState<User>> = repository.users
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    private val _snackbarMessage = MutableSharedFlow<String>()
    val snackbarMessage: SharedFlow<String> = _snackbarMessage.asSharedFlow()
    
    private var userIdJob: Job? = null
    
    init {
        observeCurrentUser()
    }
    
    fun loadUser(userId: String) {
        userIdJob?.cancel()
        userIdJob = viewModelScope.launch(dispatcherProvider.main) {
            repository.getUser(userId).collect { state ->
                when (state) {
                    is UserState.Loading -> {
                        _uiState.value = UiState.Loading
                    }
                    is UserState.Success -> {
                        _uiState.value = UiState.Idle
                    }
                    is UserState.Error -> {
                        _uiState.value = UiState.Error(state.exception.message)
                        _snackbarMessage.emit(formatErrorMessage(state.exception))
                    }
                    is UserState.Empty -> {
                        _uiState.value = UiState.Empty
                    }
                }
            }
        }
    }
    
    fun refreshUser(userId: String) {
        viewModelScope.launch(dispatcherProvider.main) {
            when (val result = repository.refreshUser(userId)) {
                is Result.Success -> {
                    _snackbarMessage.emit("User refreshed successfully")
                }
                is Result.Failure -> {
                    _snackbarMessage.emit(formatErrorMessage(result.exception))
                }
            }
        }
    }
    
    fun updateUser(user: UserUpdate) {
        viewModelScope.launch(dispatcherProvider.main) {
            _uiState.value = UiState.Loading
            
            when (val result = repository.updateUser(user)) {
                is Result.Success -> {
                    _uiState.value = UiState.Idle
                    _snackbarMessage.emit("User updated successfully")
                }
                is Result.Failure -> {
                    _uiState.value = UiState.Error(result.exception.message)
                    _snackbarMessage.emit(formatErrorMessage(result.exception))
                }
            }
        }
    }
    
    fun deleteUser(userId: String) {
        viewModelScope.launch(dispatcherProvider.main) {
            _uiState.value = UiState.Loading
            
            when (val result = repository.deleteUser(userId)) {
                is Result.Success -> {
                    _uiState.value = UiState.Idle
                    _snackbarMessage.emit("User deleted successfully")
                }
                is Result.Failure -> {
                    _uiState.value = UiState.Error(result.exception.message)
                    _snackbarMessage.emit(formatErrorMessage(result.exception))
                }
            }
        }
    }
    
    private fun observeCurrentUser() {
        viewModelScope.launch(dispatcherProvider.main) {
            repository.currentUser.collect { state ->
                // 处理当前用户状态变化
            }
        }
    }
    
    private fun formatErrorMessage(exception: Exception): String {
        return when (exception) {
            is RepositoryException -> exception.message ?: "An error occurred"
            is NetworkException -> "Network error. Please check your connection"
            is NoConnectionException -> "No internet connection"
            is ApiException -> when (exception.code) {
                401 -> "Session expired. Please log in again"
                403 -> "You don't have permission to access this resource"
                404 -> "Resource not found"
                500 -> "Server error. Please try again later"
                else -> "Error ${exception.code}: ${exception.message}"
            }
            else -> "An unexpected error occurred"
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        userIdJob?.cancel()
    }
}
```

### 6.2 ViewModel 中使用 Repository 的最佳实践

```kotlin
// ✅ 好模式：ViewModel 只处理业务逻辑，不处理数据源细节
class SearchViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() {
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    val searchResults: StateFlow<ListState<User>> = repository.searchUsers(_searchQuery)
        .stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            ListState.Empty
        )
    
    fun updateQuery(query: String) {
        _searchQuery.value = query
    }
    
    fun clearSearch() {
        _searchQuery.value = ""
    }
}

// ❌ 坏模式：ViewModel 直接处理数据源
class BadSearchViewModel @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao
) : ViewModel() {
    // 不应该直接依赖数据源
    // 不应该处理缓存逻辑
    // 不应该处理错误转换
}
```

---

## 7. 完整代码示例

### 7.1 项目结构

```
app/
├── data/
│   ├── local/
│   │   ├── dao/
│   │   │   └── UserDAO.kt
│   │   ├── entity/
│   │   │   └── UserEntity.kt
│   │   └── LocalDataSource.kt
│   ├── remote/
│   │   ├── api/
│   │   │   └── ApiService.kt
│   │   ├── model/
│   │   │   └── UserResponse.kt
│   │   └── RemoteDataSource.kt
│   ├── repository/
│   │   └── UserRepository.kt
│   └── mapper/
│       └── UserMapper.kt
├── domain/
│   ├── model/
│   │   └── User.kt
│   └── repository/
│       └── UserRepository.kt (interface)
└── presentation/
    ├── viewmodel/
    │   └── UserViewModel.kt
    └── ui/
        └── UserScreen.kt
```

### 7.2 Domain 层

```kotlin
// domain/model/User.kt
package com.example.domain.model

data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val bio: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val isVerified: Boolean = false,
    val followersCount: Int = 0,
    val followingCount: Int = 0
) {
    val displayName: String
        get() = if (name.isNotEmpty()) name else email
    
    val displayBio: String
        get() = bio ?: "No bio available"
    
    fun isPremium(): Boolean = isVerified && followersCount > 1000
}

data class UserUpdate(
    val id: String,
    val name: String?,
    val email: String?,
    val avatarUrl: String?,
    val bio: String?
)

data class CreateUserRequest(
    val name: String,
    val email: String,
    val password: String
)

data class Pagination(
    val page: Int,
    val pageSize: Int,
    val totalItems: Int,
    val totalPages: Int,
    val hasMore: Boolean
        get() = page < totalPages
)
```

### 7.3 Data 层 - Entity 和 Mapper

```kotlin
// data/local/entity/UserEntity.kt
package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val bio: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val isVerified: Boolean = false,
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
```

```kotlin
// data/mapper/UserMapper.kt
package com.example.data.mapper

import com.example.domain.model.User
import com.example.data.local.entity.UserEntity
import com.example.data.remote.model.UserResponse

object UserMapper {
    
    fun UserEntity.toDomain(): User {
        return User(
            id = id,
            name = name,
            email = email,
            avatarUrl = avatarUrl,
            bio = bio,
            createdAt = createdAt,
            updatedAt = updatedAt,
            isVerified = isVerified,
            followersCount = followersCount,
            followingCount = followingCount
        )
    }
    
    fun User.toEntity(): UserEntity {
        return UserEntity(
            id = id,
            name = name,
            email = email,
            avatarUrl = avatarUrl,
            bio = bio,
            createdAt = createdAt,
            updatedAt = updatedAt,
            isVerified = isVerified,
            followersCount = followersCount,
            followingCount = followingCount
        )
    }
    
    fun UserResponse.toDomain(): User {
        return User(
            id = id,
            name = name,
            email = email,
            avatarUrl = avatarUrl,
            bio = bio,
            createdAt = createdAt,
            updatedAt = updatedAt,
            isVerified = isVerified,
            followersCount = followersCount,
            followingCount = followingCount
        )
    }
    
    fun User.toResponse(): UserResponse {
        return UserResponse(
            id = id,
            name = name,
            email = email,
            avatarUrl = avatarUrl,
            bio = bio,
            createdAt = createdAt,
            updatedAt = updatedAt,
            isVerified = isVerified,
            followersCount = followersCount,
            followingCount = followingCount
        )
    }
    
    fun List<UserEntity>.toDomainList(): List<User> {
        return map { it.toDomain() }
    }
    
    fun List<UserResponse>.toDomainList(): List<User> {
        return map { it.toDomain() }
    }
}
```

### 7.4 Data 层 - Local DataSource

```kotlin
// data/local/dao/UserDAO.kt
package com.example.data.local.dao

import androidx.room.*
import com.example.data.local.entity.UserEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDAO {
    
    @Query("SELECT * FROM users WHERE id = :userId")
    fun getUser(userId: String): Flow<UserEntity?>
    
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<UserEntity>>
    
    @Query("SELECT * FROM users WHERE name LIKE :query OR email LIKE :query")
    fun searchUsers(query: String): Flow<List<UserEntity>>
    
    @Query("SELECT * FROM users ORDER BY createdAt DESC LIMIT :limit OFFSET :offset")
    fun getPaginatedUsers(limit: Int, offset: Int): Flow<List<UserEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: UserEntity): Long
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<UserEntity>)
    
    @Update
    suspend fun update(user: UserEntity)
    
    @Delete
    suspend fun delete(user: UserEntity)
    
    @Query("DELETE FROM users WHERE id = :userId")
    suspend fun delete(userId: String): Int
    
    @Query("DELETE FROM users")
    suspend fun clearAll(): Int
    
    @Query("SELECT COUNT(*) FROM users")
    suspend fun getCount(): Int
    
    @Transaction
    suspend fun upsertAll(users: List<UserEntity>) {
        users.forEach { insert(it) }
    }
}
```

```kotlin
// data/local/LocalDataSource.kt
package com.example.data.local

import com.example.data.local.dao.UserDAO
import com.example.data.local.entity.UserEntity
import kotlinx.coroutines.flow.Flow

interface LocalDataSource {
    fun getUser(userId: String): Flow<UserEntity?>
    fun getAllUsers(): Flow<List<UserEntity>>
    fun searchUsers(query: String): Flow<List<UserEntity>>
    fun getPaginatedUsers(limit: Int, offset: Int): Flow<List<UserEntity>>
    suspend fun insertUser(user: UserEntity): Long
    suspend fun insertUsers(users: List<UserEntity>)
    suspend fun updateUser(user: UserEntity)
    suspend fun deleteUser(userId: String): Int
    suspend fun clearAllUsers(): Int
    suspend fun getUserCount(): Int
}

class LocalDataSourceImpl @Inject constructor(
    private val userDAO: UserDAO
) : LocalDataSource {
    
    override fun getUser(userId: String): Flow<UserEntity?> = userDAO.getUser(userId)
    
    override fun getAllUsers(): Flow<List<UserEntity>> = userDAO.getAllUsers()
    
    override fun searchUsers(query: String): Flow<List<UserEntity>> = 
        userDAO.searchUsers("%$query%")
    
    override fun getPaginatedUsers(limit: Int, offset: Int): Flow<List<UserEntity>> = 
        userDAO.getPaginatedUsers(limit, offset)
    
    override suspend fun insertUser(user: UserEntity): Long = userDAO.insert(user)
    
    override suspend fun insertUsers(users: List<UserEntity>) {
        userDAO.insertAll(users)
    }
    
    override suspend fun updateUser(user: UserEntity) {
        userDAO.update(user)
    }
    
    override suspend fun deleteUser(userId: String): Int = userDAO.delete(userId)
    
    override suspend fun clearAllUsers(): Int = userDAO.clearAll()
    
    override suspend fun getUserCount(): Int = userDAO.getCount()
}
```

### 7.5 Data 层 - Remote DataSource

```kotlin
// data/remote/model/UserResponse.kt
package com.example.data.remote.model

import com.google.gson.annotations.SerializedName

data class UserResponse(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("avatar_url") val avatarUrl: String?,
    @SerializedName("bio") val bio: String?,
    @SerializedName("created_at") val createdAt: Long,
    @SerializedName("updated_at") val updatedAt: Long,
    @SerializedName("is_verified") val isVerified: Boolean = false,
    @SerializedName("followers_count") val followersCount: Int = 0,
    @SerializedName("following_count") val followingCount: Int = 0
)

data class UserListResponse(
    @SerializedName("data") val users: List<UserResponse>,
    @SerializedName("pagination") val pagination: PaginationResponse
)

data class PaginationResponse(
    @SerializedName("page") val page: Int,
    @SerializedName("per_page") val perPage: Int,
    @SerializedName("total") val total: Int,
    @SerializedName("total_pages") val totalPages: Int
)

data class CreateUserRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class UpdateUserRequest(
    @SerializedName("name") val name: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("avatar_url") val avatarUrl: String?,
    @SerializedName("bio") val bio: String?
)

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: ApiError?
)

data class ApiError(
    @SerializedName("code") val code: String,
    @SerializedName("message") val message: String
)
```

```kotlin
// data/remote/api/ApiService.kt
package com.example.data.remote.api

import com.example.data.remote.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    @GET("users/{userId}")
    suspend fun getUser(
        @Path("userId") userId: String,
        @Header("Authorization") token: String
    ): Response<UserResponse>
    
    @GET("users")
    suspend fun getUsers(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<UserListResponse>
    
    @POST("users")
    suspend fun createUser(
        @Header("Authorization") token: String,
        @Body request: CreateUserRequest
    ): Response<UserResponse>
    
    @PUT("users/{userId}")
    suspend fun updateUser(
        @Path("userId") userId: String,
        @Header("Authorization") token: String,
        @Body request: UpdateUserRequest
    ): Response<UserResponse>
    
    @DELETE("users/{userId}")
    suspend fun deleteUser(
        @Path("userId") userId: String,
        @Header("Authorization") token: String
    ): Response<Unit>
    
    @GET("users/search")
    suspend fun searchUsers(
        @Header("Authorization") token: String,
        @Query("q") query: String,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<UserListResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(
        @Header("Authorization") token: String
    ): Response<UserResponse>
}
```

```kotlin
// data/remote/RemoteDataSource.kt
package com.example.data.remote

import com.example.data.remote.api.ApiService
import com.example.data.remote.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.create
import java.io.IOException
import java.util.concurrent.TimeUnit

interface RemoteDataSource {
    suspend fun getUser(userId: String): Result<UserResponse>
    suspend fun getUsers(page: Int, perPage: Int): Result<UserListResponse>
    suspend fun createUser(request: CreateUserRequest): Result<UserResponse>
    suspend fun updateUser(userId: String, request: UpdateUserRequest): Result<UserResponse>
    suspend fun deleteUser(userId: String): Result<Unit>
    suspend fun searchUsers(query: String, page: Int, perPage: Int): Result<UserListResponse>
    suspend fun getCurrentUser(): Result<UserResponse>
}

class RemoteDataSourceImpl @Inject constructor(
    private val apiService: ApiService,
    private val tokenProvider: TokenProvider
) : RemoteDataSource {
    
    private suspend fun getAuthToken(): String {
        return "Bearer ${tokenProvider.getToken()}"
    }
    
    override suspend fun getUser(userId: String): Result<UserResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getUser(userId, getAuthToken())
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    override suspend fun getUsers(page: Int, perPage: Int): Result<UserListResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getUsers(getAuthToken(), page, perPage)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    override suspend fun createUser(request: CreateUserRequest): Result<UserResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.createUser(getAuthToken(), request)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    override suspend fun updateUser(userId: String, request: UpdateUserRequest): Result<UserResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.updateUser(userId, getAuthToken(), request)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    override suspend fun deleteUser(userId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.deleteUser(userId, getAuthToken())
            handleUnitResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    override suspend fun searchUsers(query: String, page: Int, perPage: Int): Result<UserListResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.searchUsers(getAuthToken(), query, page, perPage)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    override suspend fun getCurrentUser(): Result<UserResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getCurrentUser(getAuthToken())
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    private inline fun <reified T> handleResponse(response: Response<T>): Result<T> {
        return if (response.isSuccessful && response.body() != null) {
            Result.success(response.body()!!)
        } else {
            val errorMessage = response.errorBody()?.string() ?: response.message()
            val errorCode = response.code()
            Result.failure(ApiException(errorCode, errorMessage))
        }
    }
    
    private fun handleUnitResponse(response: Response<Unit>): Result<Unit> {
        return if (response.isSuccessful) {
            Result.success(Unit)
        } else {
            val errorMessage = response.errorBody()?.string() ?: response.message()
            val errorCode = response.code()
            Result.failure(ApiException(errorCode, errorMessage))
        }
    }
    
    private fun handleException(e: Exception): Result<Nothing> {
        return when (e) {
            is IOException -> Result.failure(NetworkException("Network error: ${e.message}"))
            is retrofit2.HttpException -> Result.failure(ApiException(e.code(), e.message()))
            else -> Result.failure(GenericException("Error: ${e.message}"))
        }
    }
}
```

### 7.6 Repository 完整实现

```kotlin
// data/repository/UserRepository.kt
package com.example.data.repository

import com.example.domain.model.User
import com.example.domain.model.UserUpdate
import com.example.domain.model.CreateUserRequest
import com.example.domain.repository.UserRepository
import com.example.data.local.LocalDataSource
import com.example.data.local.entity.UserEntity
import com.example.data.remote.RemoteDataSource
import com.example.data.mapper.UserMapper
import com.example.data.repository.exception.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

@OptIn(FlowPreview::class)
@Singleton
class UserRepositoryImpl @Inject constructor(
    private val localDataSource: LocalDataSource,
    private val remoteDataSource: RemoteDataSource,
    private val dispatcherProvider: DispatcherProvider
) : UserRepository {
    
    // 内存缓存
    private val userCache = MutableStateFlow<Map<String, User>>(emptyMap())
    
    // 控制并发
    private val refreshMutex = Mutex()
    private val userRefreshJobs = ConcurrentHashMap<String, Job>()
    
    // 当前用户
    private val _currentUser = MutableStateFlow<UserState>(UserState.Empty)
    override val currentUser: StateFlow<UserState> = _currentUser.asStateFlow()
    
    // 用户列表
    private val _users = MutableStateFlow<ListState<User>>(ListState.Empty)
    override val users: StateFlow<ListState<User>> = _users.asStateFlow()
    
    override fun getUser(userId: String): Flow<UserState> = flow {
        emit(UserState.Loading)
        
        // 1. 检查内存缓存
        val cachedUser = userCache.value[userId]
        if (cachedUser != null) {
            emit(UserState.Success(cachedUser, isStale = true))
        }
        
        // 2. 检查本地数据库
        val dbUser = withContext(dispatcherProvider.io) {
            localDataSource.getUser(userId).firstOrNull()
        }
        
        if (dbUser != null) {
            val domainUser = dbUser.toDomain()
            updateCache(domainUser)
            emit(UserState.Success(domainUser, isStale = true))
            
            // 后台刷新
            refreshFromNetwork(userId)
        } else {
            // 3. 从网络获取
            when (val result = remoteDataSource.getUser(userId)) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    saveToLocal(domainUser)
                    updateCache(domainUser)
                    emit(UserState.Success(domainUser, isStale = false))
                }
                is Result.Failure -> {
                    emit(UserState.Error(result.exception, retry = result.exception.shouldRetry))
                }
            }
        }
    }.flowOn(dispatcherProvider.io)
        .catch { e ->
            emit(UserState.Error(e, retry = (e as? RepositoryException)?.shouldRetry ?: false))
        }
    
    override fun getAllUsers(page: Int = 1, pageSize: Int = 20): Flow<ListState<User>> = flow {
        emit(ListState.Loading)
        
        // 先返回本地数据
        val localUsers = withContext(dispatcherProvider.io) {
            localDataSource.getPaginatedUsers(pageSize, (page - 1) * pageSize).firstOrNull().orEmpty()
        }
        
        if (localUsers.isNotEmpty()) {
            val domainUsers = localUsers.map { it.toDomain() }
            domainUsers.forEach { updateCache(it) }
            emit(ListState.Success(domainUsers, isLoadingMore = true))
            
            // 后台刷新
            refreshUsersFromNetwork(page, pageSize)
        } else {
            // 从网络获取
            when (val result = remoteDataSource.getUsers(page, pageSize)) {
                is Result.Success -> {
                    val domainUsers = result.data.users.map { it.toDomain() }
                    saveToLocal(domainUsers)
                    domainUsers.forEach { updateCache(it) }
                    emit(ListState.Success(domainUsers, isLoadingMore = result.data.pagination.hasMore))
                }
                is Result.Failure -> {
                    emit(ListState.Error(result.exception))
                }
            }
        }
    }.flowOn(dispatcherProvider.io)
        .catch { e ->
            emit(ListState.Error(e, items = emptyList()))
        }
    
    override fun searchUsers(query: String): Flow<ListState<User>> = flow {
        emit(ListState.Loading)
        
        // 搜索本地
        val localResults = withContext(dispatcherProvider.io) {
            localDataSource.searchUsers(query).firstOrNull().orEmpty()
        }
        
        emit(ListState.Success(localResults.map { it.toDomain() }))
        
        // 搜索网络
        when (val result = remoteDataSource.searchUsers(query, 1, 20)) {
            is Result.Success -> {
                val domainUsers = result.data.users.map { it.toDomain() }
                saveToLocal(domainUsers)
                emit(ListState.Success(domainUsers, isLoadingMore = result.data.pagination.hasMore))
            }
            is Result.Failure -> {
                emit(ListState.Error(result.exception, items = localResults.map { it.toDomain() }))
            }
        }
    }.flowOn(dispatcherProvider.io)
        .catch { e ->
            emit(ListState.Error(e, items = emptyList()))
        }
    
    override suspend fun refreshUser(userId: String): Result<Unit> = withContext(dispatcherProvider.io) {
        refreshMutex.withLock {
            try {
                when (val result = remoteDataSource.getUser(userId)) {
                    is Result.Success -> {
                        val domainUser = result.data.toDomain()
                        saveToLocal(domainUser)
                        updateCache(domainUser)
                        Result.success(Unit)
                    }
                    is Result.Failure -> Result.failure(result.exception)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun updateUser(user: UserUpdate): Result<Unit> = withContext(dispatcherProvider.io) {
        try {
            when (val result = remoteDataSource.updateUser(user.id, user.toRequest())) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    saveToLocal(domainUser)
                    updateCache(domainUser)
                    Result.success(Unit)
                }
                is Result.Failure -> Result.failure(result.exception)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun deleteUser(userId: String): Result<Unit> = withContext(dispatcherProvider.io) {
        try {
            when (val result = remoteDataSource.deleteUser(userId)) {
                is Result.Success -> {
                    localDataSource.deleteUser(userId)
                    removeFromCache(userId)
                    Result.success(Unit)
                }
                is Result.Failure -> Result.failure(result.exception)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun createUser(request: CreateUserRequest): Result<User> = withContext(dispatcherProvider.io) {
        try {
            when (val result = remoteDataSource.createUser(request.toRequest())) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    saveToLocal(domainUser)
                    updateCache(domainUser)
                    Result.success(domainUser)
                }
                is Result.Failure -> Result.failure(result.exception)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun logout(): Result<Unit> = withContext(dispatcherProvider.io) {
        try {
            localDataSource.clearAllUsers()
            userCache.value = emptyMap()
            _currentUser.value = UserState.Empty
            _users.value = ListState.Empty
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // 私有辅助方法
    private fun updateCache(user: User) {
        userCache.value = userCache.value + (user.id to user)
    }
    
    private fun removeFromCache(userId: String) {
        userCache.value = userCache.value - userId
    }
    
    private suspend fun saveToLocal(user: User) {
        val entity = user.toEntity()
        localDataSource.insertUser(entity)
    }
    
    private suspend fun saveToLocal(users: List<User>) {
        val entities = users.map { it.toEntity() }
        localDataSource.insertUsers(entities)
    }
    
    private suspend fun refreshFromNetwork(userId: String) {
        try {
            when (val result = remoteDataSource.getUser(userId)) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    saveToLocal(domainUser)
                    updateCache(domainUser)
                }
                is Result.Failure -> {
                    // 静默失败，保持缓存
                }
            }
        } catch (e: Exception) {
            // 静默失败
        }
    }
    
    private suspend fun refreshUsersFromNetwork(page: Int, pageSize: Int) {
        try {
            when (val result = remoteDataSource.getUsers(page, pageSize)) {
                is Result.Success -> {
                    val domainUsers = result.data.users.map { it.toDomain() }
                    saveToLocal(domainUsers)
                    domainUsers.forEach { updateCache(it) }
                    _users.value = ListState.Success(domainUsers, isLoadingMore = result.data.pagination.hasMore)
                }
                is Result.Failure -> {
                    // 静默失败，保持缓存
                }
            }
        } catch (e: Exception) {
            // 静默失败
        }
    }
}
```

### 7.7 扩展：分页支持

```kotlin
// 分页 Repository
class PaginatedUserRepository @Inject constructor(
    private val repository: UserRepositoryImpl
) {
    
    fun getUsers(): Flow<PaginatedUserState> = flow {
        var page = 1
        var hasMore = true
        val allUsers = mutableListOf<User>()
        
        while (hasMore) {
            emit(PaginatedUserState.Loading(page = page, items = allUsers))
            
            when (val result = repository.getAllUsers(page, 20)) {
                is Flow.Success -> {
                    val users = result.data
                    allUsers.addAll(users)
                    hasMore = result.hasMore
                    page++
                    emit(PaginatedUserState.Success(items = allUsers, hasMore = hasMore, currentPage = page - 1))
                }
                is Flow.Failure -> {
                    emit(PaginatedUserState.Error(exception = result.exception, items = allUsers))
                    break
                }
            }
        }
    }.asFlow()
}

// 分页状态
sealed class PaginatedUserState {
    data class Loading(val page: Int, val items: List<User> = emptyList()) : PaginatedUserState()
    data class Success(
        val items: List<User>,
        val hasMore: Boolean,
        val currentPage: Int
    ) : PaginatedUserState()
    data class Error(
        val exception: Exception,
        val items: List<User> = emptyList()
    ) : PaginatedUserState()
}
```

---

## 8. 高级主题

### 8.1 离线优先策略

```kotlin
// 离线优先 Repository
class OfflineFirstRepository @Inject constructor(
    private val localDataSource: LocalDataSource,
    private val remoteDataSource: RemoteDataSource,
    private val syncManager: SyncManager
) {
    
    interface SyncManager {
        suspend fun syncAll(): Result<Unit>
        suspend fun syncUser(userId: String): Result<Unit>
        val isSyncing: StateFlow<Boolean>
    }
    
    fun getUserWithOffline(userId: String): Flow<UserState> = flow {
        // 立即返回离线数据
        val offlineUser = localDataSource.getUser(userId).firstOrNull()
        
        if (offlineUser != null) {
            emit(UserState.Success(offlineUser.toDomain(), isOffline = false))
        } else {
            emit(UserState.Loading)
        }
        
        // 检查是否需要同步
        if (shouldSync(offlineUser?.lastSyncedAt)) {
            when (val result = syncManager.syncUser(userId)) {
                is Result.Success -> {
                    val updatedUser = localDataSource.getUser(userId).firstOrNull()
                    if (updatedUser != null) {
                        emit(UserState.Success(updatedUser.toDomain(), isOffline = false))
                    }
                }
                is Result.Failure -> {
                    // 保持离线数据
                }
            }
        }
    }.flowOn(Dispatchers.IO)
    
    private fun shouldSync(lastSyncedAt: Long?): Boolean {
        if (lastSyncedAt == null) return true
        val lastSyncDuration = System.currentTimeMillis() - lastSyncedAt
        return lastSyncDuration > SYNC_INTERVAL_MS
    }
    
    companion object {
        private const val SYNC_INTERVAL_MS = 5 * 60 * 1000L // 5 分钟
    }
}
```

### 8.2 批量操作

```kotlin
// 批量操作支持
class BatchUserRepository @Inject constructor(
    private val repository: UserRepositoryImpl
) {
    
    suspend fun batchGetUsers(userIds: List<String>): Result<Map<String, User>> {
        if (userIds.isEmpty()) {
            return Result.success(emptyMap())
        }
        
        return try {
            val usersMap = ConcurrentHashMap<String, User>()
            
            // 并发获取所有用户
            val jobs = userIds.map { userId ->
                kotlinx.coroutines.async(Dispatchers.IO) {
                    repository.getUser(userId)
                        .firstOrNull()
                        ?.let { state ->
                            if (state is UserState.Success) {
 userId to state.user
                            } else {
                                null
                            }
                        }
                }
            }
            
            jobs.forEach { job ->
                job.await()?.let { (userId, user) ->
                    usersMap[userId] = user
                }
            }
            
            Result.success(usersMap)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun batchDeleteUsers(userIds: List<String>): Result<Int> {
        if (userIds.isEmpty()) {
            return Result.success(0)
        }
        
        return try {
            var deletedCount = 0
            
            for (userId in userIds) {
                when (repository.deleteUser(userId)) {
                    is Result.Success -> deletedCount++
                    is Result.Failure -> {
                        // 继续删除其他用户
                    }
                }
            }
            
            Result.success(deletedCount)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 8.3 缓存预热

```kotlin
// 缓存预热
class CacheWarmer @Inject constructor(
    private val repository: UserRepositoryImpl
) {
    
    fun warmUpCache(userIds: List<String>) {
        viewModelScope.launch(Dispatchers.IO) {
            userIds.forEach { userId ->
                repository.getUser(userId)
                    .take(1)
                    .collect {}
            }
        }
    }
    
    fun warmUpFrequentlyUsedUsers() {
        viewModelScope.launch(Dispatchers.IO) {
            // 预热常用用户（如最近互动的用户）
            val frequentUserIds = getUserPreferenceManager().getFrequentUserIds()
            warmUpCache(frequentUserIds)
        }
    }
}
```

---

## 9. 常见陷阱与最佳实践

### 9.1 常见陷阱

#### 陷阱 1：忘记取消 Flow

```kotlin
// ❌ 坏示例：忘记取消 Flow
fun getUser(userId: String): Flow<User> = flow {
    emit(repository.getUser(userId))
}

// ✅ 好示例：使用 withContext 和 catch
fun getUser(userId: String): Flow<User> = flow {
    withContext(Dispatchers.IO) {
        emit(repository.getUser(userId))
    }
}.catch { e ->
    throw e
}
```

#### 陷阱 2：内存泄漏

```kotlin
// ❌ 坏示例：缓存没有清除机制
class BadRepository {
    private val cache = mutableMapOf<String, User>()
    
    fun getUser(userId: String): User {
        cache[userId] = fetchFromNetwork(userId)
        return cache[userId]!!
    }
}

// ✅ 好示例：使用 LRU 缓存
class GoodRepository {
    private val cache = LruCache<String, User>(maxSize = 100)
    
    fun getUser(userId: String): Flow<User> = flow {
        val cached = cache.get(userId)
        if (cached != null) {
            emit(cached)
        } else {
            val user = fetchFromNetwork(userId)
            cache.put(userId, user)
            emit(user)
        }
    }
}
```

#### 陷阱 3：并发问题

```kotlin
// ❌ 坏示例：没有并发控制
fun refreshUser(userId: String) {
    // 多次调用会导致重复请求
    remoteDataSource.getUser(userId)
    localDataSource.insertUser(...)
}

// ✅ 好示例：使用 Mutex
private val refreshMutex = Mutex()

suspend fun refreshUser(userId: String) {
    refreshMutex.withLock {
        remoteDataSource.getUser(userId)
        localDataSource.insertUser(...)
    }
}
```

### 9.2 最佳实践

#### 实践 1：统一错误处理

```kotlin
// 统一错误处理策略
sealed class ErrorHandler {
    object Retry : ErrorHandler()
    object ShowError : ErrorHandler()
    object Silent : ErrorHandler()
    
    companion object {
        fun forException(exception: Exception): ErrorHandler {
            return when (exception) {
                is NetworkException -> Retry
                is NoConnectionException -> ShowError
                is ApiException -> when (exception.code) {
                    401, 403 -> ShowError
                    500, 502, 503, 504 -> Retry
                    else -> ShowError
                }
                else -> Silent
            }
        }
    }
}
```

#### 实践 2：日志记录

```kotlin
// Repository 日志
class UserRepositoryImpl @Inject constructor(
    // ...
    private val logger: Logger
) : UserRepository {
    
    fun getUser(userId: String): Flow<UserState> = flow {
        logger.d("Fetching user: $userId")
        
        try {
            // ...
            logger.d("User fetched successfully: $userId")
        } catch (e: Exception) {
            logger.e("Error fetching user: $userId", e)
            throw e
        }
    }
}
```

#### 实践 3：单元测试

```kotlin
// Repository 单元测试
class UserRepositoryTest {
    
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()
    
    @Mock
    private lateinit var localDataSource: LocalDataSource
    
    @Mock
    private lateinit var remoteDataSource: RemoteDataSource
    
    @InjectMocks
    private lateinit var repository: UserRepositoryImpl
    
    @Test
    fun getUser_returnsCachedUserWhenAvailable() = runTest {
        // Arrange
        val userId = "user123"
        val cachedUser = UserEntity(userId, "John", "john@example.com", ...)
        
        coEvery { localDataSource.getUser(userId) } returns flowOf(cachedUser)
        
        // Act
        val result = repository.getUser(userId).first()
        
        // Assert
        assertIs<UserState.Success>(result)
        assertEquals(userId, result.user.id)
        coVerify { localDataSource.getUser(userId) }
        coVerify(exactly = 0) { remoteDataSource.getUser(userId) }
    }
    
    @Test
    fun getUser_fetchesFromNetworkWhenNotCached() = runTest {
        // Arrange
        val userId = "user123"
        val networkUser = UserResponse(userId, "John", "john@example.com", ...)
        
        coEvery { localDataSource.getUser(userId) } returns flowOf(null)
        coEvery { remoteDataSource.getUser(userId) } returns Result.success(networkUser)
        
        // Act
        val result = repository.getUser(userId).first()
        
        // Assert
        assertIs<UserState.Success>(result)
        assertEquals(userId, result.user.id)
        coVerify { localDataSource.getUser(userId) }
        coVerify { remoteDataSource.getUser(userId) }
        coVerify { localDataSource.insertUser(any()) }
    }
}
```

---

## 10. 面试考点

### 10.1 基础概念

#### Q1: 什么是 Repository 模式？为什么需要它？

**参考答案：**

Repository 模式是一种数据访问抽象层，它在数据源（数据库、网络 API 等）和业务逻辑之间提供统一的接口。

**需要 Repository 的原因：**

1. **解耦**：将数据访问逻辑与业务逻辑分离
2. **单一职责**：ViewModel 只关注业务逻辑，Repository 关注数据获取
3. **可测试性**：可以轻松地 Mock Repository 进行测试
4. **灵活性**：可以轻松切换数据源实现
5. **统一接口**：为上层提供一致的数据访问 API

```kotlin
// 没有 Repository
class ViewModel {
    private val api: ApiService
    private val db: Database
    
    fun getData() {
        // 复杂的缓存逻辑、错误处理等
    }
}

// 有 Repository
class ViewModel {
    private val repository: Repository
    
    fun getData() = repository.getData()
}
```

#### Q2: Repository 应该放在哪一层？

**参考答案：**

在 Clean Architecture 中，Repository 接口定义在 Domain 层，实现在 Data 层。

```
┌─────────────────────────┐
│   Presentation Layer    │
│   (ViewModel, UI)       │
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│      Domain Layer       │
│   Repository Interface  │
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│       Data Layer        │
│  Repository Implementation│
│  (Local + Remote)       │
└─────────────────────────┘
```

### 10.2 数据源策略

#### Q3: 什么是 Cache First 策略？什么时候使用？

**参考答案：**

Cache First 策略优先从本地缓存获取数据，只有在本地没有时才去网络请求。

**使用场景：**
- 需要快速响应用户
- 支持离线访问
- 数据实时性要求不高
- 网络环境不稳定

```kotlin
override fun getUser(userId: String): Flow<User> = flow {
    // 先检查本地
    val localUser = localDataSource.getUser(userId).firstOrNull()
    
    if (localUser != null) {
        emit(localUser.toDomain())
        // 后台刷新
        refreshFromNetwork(userId)
    } else {
        emit(Loading)
        fetchFromNetwork(userId)
    }
}
```

#### Q4: 如何处理数据同步冲突？

**参考答案：**

常见的冲突解决策略：

1. **Last Write Wins**：最后写入的获胜
2. **Manual Resolution**：手动解决
3. **Merge Strategy**：合并策略
4. **Optimistic Locking**：乐观锁

```kotlin
// Last Write Wins
data class UserEntity(
    val updatedAt: Long,
    // ...
)

suspend fun syncUser(user: User): Boolean {
    val localUser = localDataSource.getUser(user.id)
    return if (user.updatedAt >= localUser?.updatedAt ?: 0L) {
        localDataSource.insertUser(user.toEntity())
        true
    } else {
        false // 本地数据更新，不覆盖
    }
}
```

### 10.3 性能优化

#### Q5: 如何优化 Repository 性能？

**参考答案：**

1. **多级缓存**：Memory Cache + Disk Cache
2. **并发控制**：避免重复请求
3. **分页加载**：分批获取数据
4. **延迟加载**：按需加载
5. **后台刷新**：不阻塞主流程

```kotlin
// 多级缓存
private val memoryCache = LruCache<String, User>(100)
private val diskCache = localDataSource

suspend fun getUser(userId: String): User {
    // L1: Memory Cache
    memoryCache.get(userId)?.let { return it }
    
    // L2: Disk Cache
    localDataSource.getUser(userId)?.let { 
        memoryCache.put(userId, it)
        return it 
    }
    
    // L3: Network
    val user = remoteDataSource.getUser(userId)
    localDataSource.insertUser(user)
    memoryCache.put(userId, user)
    return user
}
```

#### Q6: 如何处理大数据集？

**参考答案：**

1. **分页加载**
2. **虚拟列表**
3. **数据库索引**
4. **异步加载**
5. **数据采样**

```kotlin
// 分页加载
override fun getAllUsers(page: Int, pageSize: Int): Flow<List<User>> = flow {
    val users = localDataSource.getPaginatedUsers(pageSize, (page - 1) * pageSize)
    emit(users.map { it.toDomain() })
}
```

### 10.4 错误处理

#### Q7: Repository 应该如何处理错误？

**参考答案：**

1. **统一错误类型**：定义统一的异常体系
2. **错误转换**：将底层错误转换为业务错误
3. **重试机制**：对可重试的错误进行重试
4. **降级策略**：网络失败时使用缓存

```kotlin
sealed class RepositoryException(message: String) : Exception(message) {
    class NetworkException(message: String) : RepositoryException(message)
    class ApiException(code: Int, message: String) : RepositoryException(message)
    
    val shouldRetry: Boolean
        get() = this is NetworkException || 
               (this is ApiException && code >= 500)
}
```

### 10.5 实战问题

#### Q8: 设计一个支持离线功能的消息列表 Repository

**参考答案：**

```kotlin
interface MessageRepository {
    val messages: StateFlow<ListState<Message>>
    fun loadMessages(): Flow<ListState<Message>>
    fun sendMessage(message: Message): Result<Unit>
    fun markAsRead(messageId: String): Result<Unit>
}

class MessageRepositoryImpl @Inject constructor(
    private val localDataSource: LocalDataSource,
    private val remoteDataSource: RemoteDataSource
) : MessageRepository {
    
    override val messages = MutableStateFlow<ListState<Message>>(ListState.Empty)
    
    override fun loadMessages(): Flow<ListState<Message>> = flow {
        // 离线优先
        val localMessages = localDataSource.getMessages().firstOrNull()
        emit(ListState.Success(localMessages.map { it.toDomain() }))
        
        // 后台同步
        syncMessages()
    }
    
    override suspend fun sendMessage(message: Message): Result<Unit> {
        // 先保存到本地
        localDataSource.insertMessage(message.toEntity())
        
        // 尝试发送到服务器
        return when (remoteDataSource.sendMessage(message)) {
            is Result.Success -> Result.success(Unit)
            is Result.Failure -> {
                // 标记为待发送
                localDataSource.markAsPending(message.id)
                Result.failure(it.exception)
            }
        }
    }
}
```

---

## 总结

Repository 模式是现代 Android 应用中不可或缺的一部分，它提供了：

1. **清晰的架构**：分离数据访问和业务逻辑
2. **灵活性**：易于切换数据源实现
3. **可测试性**：可以独立测试各层
4. **可维护性**：代码结构清晰，易于维护

掌握 Repository 模式是成为高级 Android 开发者的必备技能。