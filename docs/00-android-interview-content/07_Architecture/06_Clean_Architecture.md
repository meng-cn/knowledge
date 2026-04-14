# 06 Clean Architecture (整洁架构)

## 目录

1. [Clean Architecture 概述](#1-clean-architecture-概述)
2. [架构原则与设计理念](#2-架构原则与设计理念)
3. [分层设计详解](#3-分层设计详解)
4. [依赖倒置原则](#4-依赖倒置原则)
5. [Domain 层深入](#5-domain-层深入)
6. [Data 层深入](#6-data-层深入)
7. [Presentation 层深入](#7-presentation-层深入)
8. [依赖注入集成](#8-依赖注入集成)
9. [完整项目示例](#9-完整项目示例)
10. [高级主题](#10-高级主题)
11. [常见陷阱与最佳实践](#11-常见陷阱与最佳实践)
12. [面试考点](#12-面试考点)

---

## 1. Clean Architecture 概述

### 1.1 什么是 Clean Architecture？

Clean Architecture（整洁架构）由 Robert C. Martin（Uncle Bob）提出，是一种以业务逻辑为中心、强调分离关注点的软件架构设计方法。它的核心目标是：

1. **独立性**：框架独立、数据库独立、UI 独立、独立于任何外部代理
2. **可测试性**：业务规则可以在没有 UI、数据库或外部系统的情况下进行测试
3. **可修改性**：更改一个层不会影响其他层
4. **可扩展性**：可以轻松地添加新功能

### 1.2 Clean Architecture 的诞生背景

传统的 Android 应用架构存在以下问题：

```
传统架构的问题:
├── UI 与数据源强耦合 ❌
├── 业务逻辑分散在各个层 ❌
├── 难以测试 ❌
├── 难以维护 ❌
└── 难以扩展 ❌
```

Clean Architecture 通过分层和依赖规则解决了这些问题。

### 1.3 Clean Architecture 的核心理念

```
核心思想:
1. 业务逻辑是核心，应该位于架构的中心
2. 框架、UI、数据库等都是"细节"，应该位于外围
3. 依赖方向：外部依赖内部，不是内部依赖外部
4. 每一层都有明确的职责边界
```

### 1.4 为什么在 Android 中使用 Clean Architecture？

1. **长期维护**：项目生命周期长，需要良好的架构支持
2. **团队协作**：清晰的边界便于多人协作
3. **测试覆盖**：每层都可以独立测试
4. **技术替换**：可以替换 UI 框架、数据库等而不影响业务逻辑
5. **代码复用**：Domain 层可以在多个项目中复用

---

## 2. 架构原则与设计理念

### 2.1 核心原则

#### 依赖规则 (The Dependency Rule)

> 源代码依赖只能指向内部。也就是说，外部模块不能被子模块依赖。

```
        ← 依赖方向
┌─────────────────────────────────────────────────┐
│  Frameworks & Drivers                           │
│  (Retrofit, Room, Activity, Fragment)          │
├─────────────────────────────────────────────────┤
│  Interface Layer / Presentation                 │
│  (Use Cases, Presenters, ViewModels)           │
├─────────────────────────────────────────────────┤
│  Enterprise Business Rules / Domain             │
│  (Entities, Use Cases, Repository Interfaces)  │
├─────────────────────────────────────────────────┤
│  Enterprise Data Model / Domain                 │
│  (Entities)                                     │
└─────────────────────────────────────────────────┘
```

#### 分离关注点 (Separation of Concerns)

每一层只负责一个方面的职责：

| 层 | 职责 |
|---|------|
| Presentation | 处理 UI 状态、用户交互 |
| Domain | 处理业务逻辑、业务规则 |
| Data | 处理数据获取、存储 |

#### 单一职责原则 (Single Responsibility Principle)

每个类、每个模块只负责一个职责：

```kotlin
// ❌ 违反 SRP
class UserManager {
    fun fetchUser() {}
    fun saveUser() {}
    fun renderUser() {}
    fun validateUser() {}
}

// ✅ 符合 SRP
class GetUserUseCase
class SaveUserUseCase
class UserRepository
class UserViewModel
```

### 2.2 架构分层

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Activity   │  │   Fragment   │  │ Compose  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│  ┌──────────────┐                                 │ │
│  │  ViewModel   │                                 │ │
│  └──────────────┘                                 │ │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                 Domain Layer                        │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Entity     │  │  Use Case    │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────────────────────┐                  │
│  │    Repository Interface      │                  │
│  └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  Data Layer                         │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Repository  │  │   Mapper     │                │
│  │   Impl       │  │              │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Local       │  │  Remote      │                │
│  │  DataSource  │  │  DataSource  │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Frameworks & Drivers                   │
│  ┌──────────────┐  ┌──────────────┐                │
│  │    Room      │  │  Retrofit    │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Hilt        │  │  Coroutines  │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

### 2.3 实体流向

```
使用请求流程:
User → Activity → ViewModel → UseCase → Repository → DataSource → API/DB

数据返回流程:
API/DB → DataSource → Repository → UseCase → ViewModel → Activity → UI
```

---

## 3. 分层设计详解

### 3.1 Presentation 层 (展示层)

#### 职责

1. 处理 UI 相关的逻辑
2. 管理 UI 状态
3. 响应用户交互
4. 调用 Domain 层的 Use Case

#### 组成组件

```
Presentation Layer:
├── Activity / Fragment (UI Controllers)
├── ViewModel (UI State Management)
├── UI Components (Compose Views)
└── Event Handlers
```

#### 特征

- 依赖 Domain 层
- 不包含业务逻辑
- 只处理 UI 状态转换
- 可以轻易替换（如从 View 切换到 Compose）

### 3.2 Domain 层 (领域层)

#### 职责

1. 包含核心业务逻辑
2. 定义业务规则
3. 定义数据实体
4. 定义 Repository 接口

#### 组成组件

```
Domain Layer:
├── Entity (领域实体)
├── Use Case (用例/业务逻辑)
├── Repository Interface (仓储接口)
└── Domain Model (领域模型)
```

#### 特征

- 不依赖任何其他层
- 不包含 Android 框架代码
- 纯 Kotlin 代码
- 可以独立测试
- 可以在多个项目中复用

### 3.3 Data 层 (数据层)

#### 职责

1. 实现 Repository 接口
2. 管理数据获取和存储
3. 处理数据转换 (Mapper)
4. 协调多个数据源

#### 组成组件

```
Data Layer:
├── Repository Implementation
├── Local DataSource (Room, DataStore)
├── Remote DataSource (Retrofit)
├── Data Models
└── Mappers
```

#### 特征

- 依赖 Domain 层
- 包含框架代码 (Room, Retrofit 等)
- 处理具体的数据操作
- 实现缓存策略

### 3.4 层间关系

```
依赖方向:
Presentation → Domain → Data

信息流向:
Data → Domain → Presentation
```

---

## 4. 依赖倒置原则

### 4.1 什么是依赖倒置原则？

依赖倒置原则 (Dependency Inversion Principle, DIP) 是 Clean Architecture 的核心：

> 高层模块不应该依赖低层模块，两者都应该依赖其抽象。
> 抽象不应该依赖细节，细节应该依赖抽象。

### 4.2 传统架构 vs Clean Architecture

```kotlin
// ❌ 传统架构：直接依赖具体实现
class UserViewModel {
    private val apiService: ApiService  // 直接依赖 Retrofit
    private val userDao: UserDao        // 直接依赖 Room
    
    fun getUser() {
        // 直接调用具体实现
    }
}

// ✅ Clean Architecture：依赖抽象
class UserViewModel {
    private val useCase: GetUserUseCase  // 依赖 UseCase 抽象
    
    fun getUser() {
        useCase.execute()  // 不关心具体实现
    }
}

class GetUserUseCase {
    private val repository: UserRepository  // 依赖 Repository 接口
    
    fun execute() {
        repository.getUser()  // 不关心是本地还是远程
    }
}
```

### 4.3 依赖倒置的好处

1. **解耦**：高层模块不依赖具体实现
2. **可测试**：可以 Mock 依赖
3. **灵活**：可以替换实现而不影响上层
4. **可维护**：修改局部不影响全局

### 4.4 依赖倒置的可视化

```
传统架构:
ViewModel ────> ApiService (Retrofit)
       └──────> UserDao (Room)

Clean Architecture:
ViewModel ────> UseCase ────> Repository Interface
                                 └───> Repository Impl
                                             ├─> RemoteDataSource
                                             └─> LocalDataSource
```

---

## 5. Domain 层深入

### 5.1 Entity (实体)

#### 什么是 Entity？

Entity 是 Domain 层的核心数据模型，代表业务领域的核心概念。

**特征：**
- 包含业务标识（identity）
- 包含业务行为（behavior）
- 不包含框架代码
- 不包含 UI 逻辑

```kotlin
// domain/model/User.kt
package com.example.domain.model

/**
 * User 实体 - 代表业务领域的用户概念
 */
data class User(
    val id: UserId,
    val name: UserName,
    val email: Email,
    val avatarUrl: Uri?,
    val bio: Bio?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val isVerified: Boolean = false,
    val followersCount: Count = Count.ZERO,
    val followingCount: Count = Count.ZERO
) {
    // 业务行为
    fun hasPremiumAccount(): Boolean {
        return isVerified && followersCount.value > 1000
    }
    
    fun canFollowOtherUser(): Boolean {
        return followingCount.value < MAX_FOLLOWING_LIMIT
    }
    
    fun isFollowingUser(target: User): Boolean {
        // 业务逻辑
        return false
    }
    
    fun follow(target: User): Result<User> {
        if (!canFollowOtherUser()) {
            return Result.failure(FollowLimitException())
        }
        // 业务逻辑
        return Result.success(this.copy(followingCount = followingCount + 1))
    }
    
    companion object {
        private const val MAX_FOLLOWING_LIMIT = 5000
    }
}

// 值对象
data class UserId(val value: String) {
    init {
        require(value.isNotEmpty()) { "User ID cannot be empty" }
    }
}

data class UserName(val value: String) {
    init {
        require(value.length in 2..50) { "Name must be between 2 and 50 characters" }
    }
    
    fun displayName(): String {
        return value.trim()
    }
}

data class Email(val value: String) {
    init {
        require(isValid(value)) { "Invalid email address" }
    }
    
    private fun isValid(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    fun mask(): String {
        val atIndex = value.indexOf('@')
        if (atIndex <= 2) return value
        return "${value.take(2)}***@${value.substring(atIndex + 1)}"
    }
}

data class Bio(val value: String) {
    init {
        require(value.length <= 500) { "Bio must be less than 500 characters" }
    }
}

data class Count(val value: Int) {
    init {
        require(value >= 0) { "Count cannot be negative" }
    }
    
    operator fun plus(other: Count): Count = Count(value + other.value)
    operator fun minus(other: Count): Count = Count(value - other.value)
    
    companion object {
        val ZERO = Count(0)
    }
}

// 自定义异常
class UserException(message: String) : Exception(message)
class FollowLimitException : UserException("Following limit reached")
class InvalidUserStateException : UserException("Invalid user state")
```

### 5.2 Use Case (用例)

#### 什么是 Use Case？

Use Case（用例）封装了单个业务操作，代表一个具体的业务场景。

**特征：**
- 单一职责：每个 Use Case 只做一件事
- 可复用：可以在多个地方调用
- 可测试：可以独立测试业务逻辑
- 无 UI 依赖：不包含任何 UI 代码

#### Use Case 分类

```
Use Case 类型:
├── Query Use Case (查询)
│   └── 只读操作，返回数据
├── Command Use Case (命令)
│   └── 写操作，改变状态
└── Interaction Use Case (交互)
    └── 复杂的交互逻辑
```

#### Use Case 实现示例

```kotlin
// domain/usecase/GetUserUseCase.kt
package com.example.domain.usecase

import com.example.domain.model.User
import com.example.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow

/**
 * 获取用户详情的 Use Case
 */
class GetUserUseCase(
    private val repository: UserRepository
) {
    operator fun invoke(userId: String): Flow<UiState<User>> = flow {
        emit(UiState.Loading)
        
        try {
            val user = repository.getUser(userId)
            emit(UiState.Success(user))
        } catch (e: Exception) {
            emit(UiState.Error(e))
        }
    }
}

// domain/usecase/SearchUsersUseCase.kt
/**
 * 搜索用户的 Use Case
 */
class SearchUsersUseCase(
    private val repository: UserRepository
) {
    operator fun invoke(query: String): Flow<UiState<List<User>>> = flow {
        emit(UiState.Loading)
        
        try {
            val users = repository.searchUsers(query)
            emit(UiState.Success(users))
        } catch (e: Exception) {
            emit(UiState.Error(e))
        }
    }
}

// domain/usecase/CreateUserUseCase.kt
/**
 * 创建用户的 Use Case (Command)
 */
class CreateUserUseCase(
    private val repository: UserRepository
) {
    suspend operator fun invoke(
        name: String,
        email: String,
        password: String
    ): Result<User> {
        try {
            // 业务验证
            validateInput(name, email, password)
            
            // 执行业务逻辑
            val user = repository.createUser(name, email, password)
            return Result.success(user)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    private fun validateInput(name: String, email: String, password: String) {
        require(name.length in 2..50) { "Invalid name" }
        require(android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) { "Invalid email" }
        require(password.length >= 8) { "Password must be at least 8 characters" }
    }
}

// domain/usecase/UpdateUserUseCase.kt
/**
 * 更新用户的 Use Case (Command)
 */
class UpdateUserUseCase(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    suspend operator fun invoke(user: User, updates: UserUpdates): Result<User> {
        try {
            // 业务验证
            validator.validateUpdates(updates)
            
            // 执行业务逻辑
            val updatedUser = repository.updateUser(user, updates)
            return Result.success(updatedUser)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
}

// domain/usecase/DeleteUserUseCase.kt
/**
 * 删除用户的 Use Case (Command)
 */
class DeleteUserUseCase(
    private val repository: UserRepository
) {
    suspend operator fun invoke(userId: String): Result<Unit> {
        try {
            repository.deleteUser(userId)
            return Result.success(Unit)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
}

// domain/usecase/FollowUserUseCase.kt
/**
 * 关注用户的 Use Case (Interaction)
 */
class FollowUserUseCase(
    private val repository: UserRepository,
    private val notificationManager: NotificationManager
) {
    suspend operator fun invoke(currentUser: User, targetUser: User): Result<Unit> {
        try {
            // 业务验证
            if (currentUser.id == targetUser.id) {
                return Result.failure(CannotFollowSelfException())
            }
            
            if (repository.isFollowing(currentUser.id, targetUser.id)) {
                return Result.failure(AlreadyFollowingException())
            }
            
            // 执行业务逻辑
            repository.followUser(currentUser.id, targetUser.id)
            
            // 发送通知
            notificationManager.notifyFollowed(targetUser.id, currentUser.id)
            
            return Result.success(Unit)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
}

// 统一的状态密封类
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val exception: Exception) : UiState<Nothing>()
    object Empty : UiState<Nothing>()
}

// 自定义异常
class CannotFollowSelfException : Exception("Cannot follow yourself")
class AlreadyFollowingException : Exception("Already following this user")
class NotFoundException : Exception("Resource not found")
class ValidationException(message: String) : Exception(message)
```

### 5.3 Repository Interface (仓储接口)

```kotlin
// domain/repository/UserRepository.kt
package com.example.domain.repository

import com.example.domain.model.User
import com.example.domain.model.UserUpdate
import kotlinx.coroutines.flow.Flow

/**
 * UserRepository 接口 - 定义在 Domain 层
 * 只定义方法签名，不关心具体实现
 */
interface UserRepository {
    // Query
    fun getUser(userId: String): Flow<User>
    fun getAllUsers(): Flow<List<User>>
    fun searchUsers(query: String): Flow<List<User>>
    
    // Command
    suspend fun createUser(name: String, email: String, password: String): User
    suspend fun updateUser(user: User, updates: UserUpdate): User
    suspend fun deleteUser(userId: String): Unit
    suspend fun followUser(currentUserId: String, targetUserId: String): Unit
    suspend fun unfollowUser(currentUserId: String, targetUserId: String): Unit
    
    // Query
    fun isFollowing(currentUserId: String, targetUserId: String): Boolean
    fun getCurrentUser(): Flow<User?>
}

// domain/repository/PostRepository.kt
interface PostRepository {
    fun getPost(postId: String): Flow<Post>
    fun getAllPosts(): Flow<List<Post>>
    fun getPostsByUser(userId: String): Flow<List<Post>>
    suspend fun createPost(post: PostCreate): Post
    suspend fun updatePost(post: Post, updates: PostUpdate): Post
    suspend fun deletePost(postId: String): Unit
    suspend fun likePost(userId: String, postId: String): Unit
    suspend fun unlikePost(userId: String, postId: String): Unit
    fun isLiked(userId: String, postId: String): Boolean
}
```

### 5.4 Domain 层完整示例

```
domain/
├── model/
│   ├── User.kt
│   ├── Post.kt
│   ├── Comment.kt
│   └── Exception/*.kt
├── repository/
│   ├── UserRepository.kt
│   ├── PostRepository.kt
│   └── CommentRepository.kt
└── usecase/
    ├── user/
    │   ├── GetUserUseCase.kt
    │   ├── CreateUserUseCase.kt
    │   ├── UpdateUserUseCase.kt
    │   ├── DeleteUserUseCase.kt
    │   ├── FollowUserUseCase.kt
    │   └── SearchUsersUseCase.kt
    ├── post/
    │   ├── GetPostUseCase.kt
    │   ├── CreatePostUseCase.kt
    │   └── DeletePostUseCase.kt
    └── UiState.kt
```

---

## 6. Data 层深入

### 6.1 Data Model (数据模型)

```kotlin
// data/local/entity/UserEntity.kt
package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * User 实体 - 用于 Room 数据库
 */
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

### 6.2 Remote Data Model (远程数据模型)

```kotlin
// data/remote/model/UserResponse.kt
package com.example.data.remote.model

import com.google.gson.annotations.SerializedName

/**
 * User 响应模型 - 用于 API 响应
 */
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
```

### 6.3 Mapper (转换器)

```kotlin
// data/mapper/UserMapper.kt
package com.example.data.mapper

import com.example.domain.model.User
import com.example.domain.model.UserId
import com.example.domain.model.UserName
import com.example.domain.model.Email
import com.example.domain.model.Bio
import com.example.domain.model.Count
import com.example.data.local.entity.UserEntity
import com.example.data.remote.model.UserResponse

/**
 * User 转换器 - 在不同模型之间转换
 */
object UserMapper {
    
    fun UserEntity.toDomain(): User {
        return User(
            id = UserId(id),
            name = UserName(name),
            email = Email(email),
            avatarUrl = avatarUrl?.let { android.net.Uri.parse(it) },
            bio = bio?.let { Bio(it) },
            createdAt = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(createdAt),
                TimeZone.getDefault().toZoneId()
            ),
            updatedAt = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(updatedAt),
                TimeZone.getDefault().toZoneId()
            ),
            isVerified = isVerified,
            followersCount = Count(followersCount),
            followingCount = Count(followingCount)
        )
    }
    
    fun User.toEntity(): UserEntity {
        return UserEntity(
            id = id.value,
            name = name.value,
            email = email.value,
            avatarUrl = avatarUrl?.toString(),
            bio = bio?.value,
            createdAt = createdAt.toInstant(
                ZoneId.systemDefault()
            ).toEpochMilli(),
            updatedAt = updatedAt.toInstant(
                ZoneId.systemDefault()
            ).toEpochMilli(),
            isVerified = isVerified,
            followersCount = followersCount.value,
            followingCount = followingCount.value
        )
    }
    
    fun UserResponse.toDomain(): User {
        return User(
            id = UserId(id),
            name = UserName(name),
            email = Email(email),
            avatarUrl = avatarUrl?.let { android.net.Uri.parse(it) },
            bio = bio?.let { Bio(it) },
            createdAt = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(createdAt),
                TimeZone.getDefault().toZoneId()
            ),
            updatedAt = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(updatedAt),
                TimeZone.getDefault().toZoneId()
            ),
            isVerified = isVerified,
            followersCount = Count(followersCount),
            followingCount = Count(followingCount)
        )
    }
    
    fun User.toResponse(): UserResponse {
        return UserResponse(
            id = id.value,
            name = name.value,
            email = email.value,
            avatarUrl = avatarUrl?.toString(),
            bio = bio?.value,
            createdAt = createdAt.toInstant(
                ZoneId.systemDefault()
            ).toEpochMilli(),
            updatedAt = updatedAt.toInstant(
                ZoneId.systemDefault()
            ).toEpochMilli(),
            isVerified = isVerified,
            followersCount = followersCount.value,
            followingCount = followingCount.value
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

### 6.4 Local DataSource (本地数据源)

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
    
    @Query("SELECT * FROM users ORDER BY createdAt DESC")
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
    
    @Transaction
    suspend fun upsertAll(users: List<UserEntity>) {
        users.forEach { insert(it) }
    }
}

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
}

@Singleton
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
}
```

### 6.5 Remote DataSource (远程数据源)

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
        @Query("page") page: Int = 1
    ): Response<UserListResponse>
}

// data/remote/RemoteDataSource.kt
package com.example.data.remote

import com.example.data.remote.api.ApiService
import com.example.data.remote.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

interface RemoteDataSource {
    suspend fun getUser(userId: String): Result<UserResponse>
    suspend fun getUsers(page: Int, perPage: Int): Result<UserListResponse>
    suspend fun createUser(request: CreateUserRequest): Result<UserResponse>
    suspend fun updateUser(userId: String, request: UpdateUserRequest): Result<UserResponse>
    suspend fun deleteUser(userId: String): Result<Unit>
    suspend fun searchUsers(query: String, page: Int): Result<UserListResponse>
}

@Singleton
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
    
    override suspend fun searchUsers(query: String, page: Int): Result<UserListResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.searchUsers(getAuthToken(), query, page)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }
    
    private inline fun <reified T> handleResponse(response: retrofit2.Response<T>): Result<T> {
        return if (response.isSuccessful && response.body() != null) {
            Result.success(response.body()!!)
        } else {
            Result.failure(ApiException(response.code(), response.message()))
        }
    }
    
    private fun handleUnitResponse(response: retrofit2.Response<Unit>): Result<Unit> {
        return if (response.isSuccessful) {
            Result.success(Unit)
        } else {
            Result.failure(ApiException(response.code(), response.message()))
        }
    }
    
    private fun handleException(e: Exception): Result<Nothing> {
        return when (e) {
            is java.io.IOException -> Result.failure(NetworkException(e.message ?: "Network error"))
            is retrofit2.HttpException -> Result.failure(ApiException(e.code(), e.message()))
            else -> Result.failure(GenericException(e.message ?: "Unknown error"))
        }
    }
}
```

### 6.6 Repository Implementation (仓储实现)

```kotlin
// data/repository/UserRepositoryImpl.kt
package com.example.data.repository

import com.example.domain.model.User
import com.example.domain.model.UserUpdate
import com.example.domain.repository.UserRepository
import com.example.data.local.LocalDataSource
import com.example.data.remote.RemoteDataSource
import com.example.data.mapper.UserMapper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext

@Singleton
class UserRepositoryImpl @Inject constructor(
    private val localDataSource: LocalDataSource,
    private val remoteDataSource: RemoteDataSource
) : UserRepository {
    
    override fun getUser(userId: String): Flow<User> = flow {
        // 先尝试从本地获取
        val localUser = localDataSource.getUser(userId).firstOrNull()
        
        if (localUser != null) {
            emit(localUser.toDomain())
            // 后台刷新
            refreshFromNetwork(userId)
        } else {
            // 从网络获取
            when (val result = remoteDataSource.getUser(userId)) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    localDataSource.insertUser(domainUser.toEntity())
                    emit(domainUser)
                }
                is Result.Failure -> {
                    throw result.exception
                }
            }
        }
    }.flowOn(Dispatchers.IO)
        .catch { e ->
            throw e
        }
    
    override fun getAllUsers(): Flow<List<User>> = flow {
        // 从本地获取
        val localUsers = localDataSource.getAllUsers().firstOrNull().orEmpty()
        emit(localUsers.map { it.toDomain() })
        
        // 后台刷新
        refreshAllFromNetwork()
    }.flowOn(Dispatchers.IO)
    
    override fun searchUsers(query: String): Flow<List<User>> = flow {
        // 搜索本地
        val localResults = localDataSource.searchUsers(query).firstOrNull().orEmpty()
        emit(localResults.map { it.toDomain() })
        
        // 搜索网络
        when (val result = remoteDataSource.searchUsers(query, 1)) {
            is Result.Success -> {
                val domainUsers = result.data.users.map { it.toDomain() }
                localDataSource.insertUsers(domainUsers.map { it.toEntity() })
                emit(domainUsers)
            }
            is Result.Failure -> {
                // 保持本地结果
            }
        }
    }.flowOn(Dispatchers.IO)
    
    override suspend fun createUser(
        name: String,
        email: String,
        password: String
    ): User = withContext(Dispatchers.IO) {
        when (val result = remoteDataSource.createUser(
            CreateUserRequest(name, email, password)
        )) {
            is Result.Success -> {
                val domainUser = result.data.toDomain()
                localDataSource.insertUser(domainUser.toEntity())
                domainUser
            }
            is Result.Failure -> {
                throw result.exception
            }
        }
    }
    
    override suspend fun updateUser(user: User, updates: UserUpdate): User = withContext(Dispatchers.IO) {
        when (val result = remoteDataSource.updateUser(
            user.id.value,
            updates.toRequest()
        )) {
            is Result.Success -> {
                val domainUser = result.data.toDomain()
                localDataSource.updateUser(domainUser.toEntity())
                domainUser
            }
            is Result.Failure -> {
                throw result.exception
            }
        }
    }
    
    override suspend fun deleteUser(userId: String): Unit = withContext(Dispatchers.IO) {
        remoteDataSource.deleteUser(userId)
        localDataSource.deleteUser(userId)
    }
    
    override suspend fun followUser(currentUserId: String, targetUserId: String): Unit = withContext(Dispatchers.IO) {
        // 实现关注逻辑
    }
    
    override suspend fun unfollowUser(currentUserId: String, targetUserId: String): Unit = withContext(Dispatchers.IO) {
        // 实现取消关注逻辑
    }
    
    override fun isFollowing(currentUserId: String, targetUserId: String): Boolean {
        // 实现检查逻辑
        return false
    }
    
    override fun getCurrentUser(): Flow<User?> {
        return localDataSource.getCurrentUser()
            .map { it?.toDomain() }
    }
    
    // 私有辅助方法
    private suspend fun refreshFromNetwork(userId: String) {
        try {
            when (val result = remoteDataSource.getUser(userId)) {
                is Result.Success -> {
                    val domainUser = result.data.toDomain()
                    localDataSource.updateUser(domainUser.toEntity())
                }
                is Result.Failure -> {
                    // 静默失败
                }
            }
        } catch (e: Exception) {
            // 静默失败
        }
    }
    
    private suspend fun refreshAllFromNetwork() {
        try {
            when (val result = remoteDataSource.getUsers(1, 20)) {
                is Result.Success -> {
                    val domainUsers = result.data.users.map { it.toDomain() }
                    localDataSource.insertUsers(domainUsers.map { it.toEntity() })
                }
                is Result.Failure -> {
                    // 静默失败
                }
            }
        } catch (e: Exception) {
            // 静默失败
        }
    }
}
```

---

## 7. Presentation 层深入

### 7.1 ViewModel

```kotlin
// presentation/viewmodel/UserViewModel.kt
package com.example.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.domain.model.User
import com.example.domain.usecase.GetUserUseCase
import com.example.domain.usecase.CreateUserUseCase
import com.example.domain.usecase.UpdateUserUseCase
import com.example.domain.usecase.DeleteUserUseCase
import com.example.domain.usecase.SearchUsersUseCase
import com.example.domain.usecase.FollowUserUseCase
import com.example.domain.UiState
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class UserViewModel @Inject constructor(
    private val getUserUseCase: GetUserUseCase,
    private val createUserUseCase: CreateUserUseCase,
    private val updateUserUseCase: UpdateUserUseCase,
    private val deleteUserUseCase: DeleteUserUseCase,
    private val searchUsersUseCase: SearchUsersUseCase,
    private val followUserUseCase: FollowUserUseCase
) : ViewModel() {
    
    // 用户详情状态
    private val _userState = MutableStateFlow<UiState<User>>(UiState.Empty)
    val userState: StateFlow<UiState<User>> = _userState.asStateFlow()
    
    // 用户列表状态
    private val _usersState = MutableStateFlow<UiState<List<User>>>(UiState.Empty)
    val usersState: StateFlow<UiState<List<User>>> = _usersState.asStateFlow()
    
    // UI 事件
    private val _uiEvent = MutableSharedFlow<UiEvent>()
    val uiEvent: SharedFlow<UiEvent> = _uiEvent.asSharedFlow()
    
    // 搜索查询
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    // 当前用户
    private var currentUser: User? = null
    
    // 加载用户详情
    fun loadUser(userId: String) {
        viewModelScope.launch {
            getUserUseCase(userId)
                .catch { e ->
                    emit(UiState.Error(e))
                }
                .collect { state ->
                    _userState.value = state
                }
        }
    }
    
    // 刷新用户
    fun refreshUser(userId: String) {
        viewModelScope.launch {
            loadUser(userId)
        }
    }
    
    // 创建用户
    fun createUser(name: String, email: String, password: String) {
        viewModelScope.launch {
            _userState.value = UiState.Loading
            
            when (val result = createUserUseCase(name, email, password)) {
                is Result.Success -> {
                    _userState.value = UiState.Success(result.getOrNull()!!)
                    _uiEvent.emit(UiEvent.ShowSuccessMessage("User created successfully"))
                }
                is Result.Failure -> {
                    _userState.value = UiState.Error(result.exception)
                    _uiEvent.emit(UiEvent.ShowErrorMessage(formatErrorMessage(result.exception)))
                }
            }
        }
    }
    
    // 更新用户
    fun updateUser(updates: UserUpdates) {
        viewModelScope.launch {
            currentUser ?: return@launch
            
            _userState.value = UiState.Loading
            
            when (val result = updateUserUseCase(currentUser!!, updates)) {
                is Result.Success -> {
                    _userState.value = UiState.Success(result.getOrNull()!!)
                    currentUser = result.getOrNull()
                    _uiEvent.emit(UiEvent.ShowSuccessMessage("User updated successfully"))
                }
                is Result.Failure -> {
                    _userState.value = UiState.Error(result.exception)
                    _uiEvent.emit(UiEvent.ShowErrorMessage(formatErrorMessage(result.exception)))
                }
            }
        }
    }
    
    // 删除用户
    fun deleteUser(userId: String) {
        viewModelScope.launch {
            _userState.value = UiState.Loading
            
            when (val result = deleteUserUseCase(userId)) {
                is Result.Success -> {
                    _userState.value = UiState.Empty
                    _uiEvent.emit(UiEvent.ShowSuccessMessage("User deleted successfully"))
                    _uiEvent.emit(UiEvent.NavigateBack)
                }
                is Result.Failure -> {
                    _userState.value = UiState.Error(result.exception)
                    _uiEvent.emit(UiEvent.ShowErrorMessage(formatErrorMessage(result.exception)))
                }
            }
        }
    }
    
    // 搜索用户
    fun searchUsers(query: String) {
        _searchQuery.value = query
        
        if (query.isEmpty()) {
            _usersState.value = UiState.Empty
            return
        }
        
        viewModelScope.launch {
            searchUsersUseCase(query)
                .catch { e ->
                    emit(UiState.Error(e))
                }
                .collect { state ->
                    _usersState.value = state
                }
        }
    }
    
    // 关注用户
    fun followUser(targetUser: User) {
        viewModelScope.launch {
            currentUser ?: return@launch
            
            when (val result = followUserUseCase(currentUser!!, targetUser)) {
                is Result.Success -> {
                    _uiEvent.emit(UiEvent.ShowSuccessMessage("Following user successfully"))
                    refreshUser(currentUser!!.id)
                }
                is Result.Failure -> {
                    _uiEvent.emit(UiEvent.ShowErrorMessage(formatErrorMessage(result.exception)))
                }
            }
        }
    }
    
    // 处理 UI 事件
    fun handleUiEvent(event: UiEvent) {
        when (event) {
            is UiEvent.DismissMessage -> {
                // 处理
            }
            is UiEvent.NavigateBack -> {
                // 处理
            }
            else -> {
                // 其他事件
            }
        }
    }
    
    // 格式化错误信息
    private fun formatErrorMessage(exception: Exception): String {
        return when (exception) {
            is com.example.domain.UserException -> exception.message ?: "An error occurred"
            is com.example.domain.NetworkException -> "Network error. Please check your connection"
            is com.example.domain.NotFoundException -> "User not found"
            is com.example.domain.ValidationException -> exception.message ?: "Validation failed"
            else -> "An unexpected error occurred"
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        // 清理资源
    }
}

// UI 事件
sealed class UiEvent {
    object NavigateBack : UiEvent()
    object NavigateToDetail : UiEvent()
    data class ShowSuccessMessage(val message: String) : UiEvent()
    data class ShowErrorMessage(val message: String) : UiEvent()
    object DismissMessage : UiEvent()
    object ShowLoading : UiEvent()
    object HideLoading : UiEvent()
}
```

### 7.2 Compose UI

```kotlin
// presentation/ui/UserDetailScreen.kt
package com.example.presentation.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.domain.model.User
import com.example.domain.UiState
import com.example.presentation.viewmodel.UserViewModel

@Composable
fun UserDetailScreen(
    userId: String,
    onNavigateBack: () -> Unit,
    viewModel: UserViewModel = viewModel()
) {
    val userState by viewModel.userState.collectAsState()
    val uiEvent = remember { mutableStateOf<UiEvent?>(null) }
    
    LaunchedEffect(Unit) {
        viewModel.loadUser(userId)
    }
    
    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { event ->
            uiEvent.value = event
            when (event) {
                is UiEvent.NavigateBack -> onNavigateBack()
                else -> {}
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("User Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = userState) {
            is UiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is UiState.Success -> {
                UserDetailContent(
                    user = state.data,
                    onRefresh = { viewModel.refreshUser(userId) },
                    onFollow = { viewModel.followUser(state.data) },
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is UiState.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Error: ${state.exception.message}")
                        Button(onClick = { viewModel.loadUser(userId) }) {
                            Text("Retry")
                        }
                    }
                }
            }
            is UiState.Empty -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No user data")
                }
            }
        }
    }
}

@Composable
fun UserDetailContent(
    user: User,
    onRefresh: () -> Unit,
    onFollow: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Avatar
        AsyncImage(
            model = user.avatarUrl,
            contentDescription = "User avatar",
            modifier = Modifier.size(100.dp)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Name
        Text(
            text = user.name.displayName(),
            style = MaterialTheme.typography.headlineSmall
        )
        
        // Email
        Text(
            text = user.email.value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Bio
        user.bio?.let { bio ->
            Text(
                text = bio.value,
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Stats
        Row(
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatsCard(
                label = "Followers",
                value = user.followersCount.value.toString()
            )
            StatsCard(
                label = "Following",
                value = user.followingCount.value.toString()
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Follow Button
        Button(onClick = onFollow) {
            Text("Follow")
        }
        
        // Refresh Button
        OutlinedButton(onClick = onRefresh) {
            Text("Refresh")
        }
    }
}

@Composable
fun StatsCard(label: String, value: String) {
    Card(
        modifier = Modifier.fillMaxWidth(0.4f),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
```

---

## 8. 依赖注入集成

### 8.1 Hilt 模块定义

```kotlin
// di/DomainModule.kt
package com.example.di

import com.example.domain.repository.UserRepository
import com.example.domain.usecase.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DomainModule {
    
    @Provides
    @Singleton
    fun provideGetUserUseCase(
        repository: UserRepository
    ): GetUserUseCase {
        return GetUserUseCase(repository)
    }
    
    @Provides
    @Singleton
    fun provideCreateUserUseCase(
        repository: UserRepository
    ): CreateUserUseCase {
        return CreateUserUseCase(repository)
    }
    
    @Provides
    @Singleton
    fun provideUpdateUserUseCase(
        repository: UserRepository
    ): UpdateUserUseCase {
        return UpdateUserUseCase(repository)
    }
    
    @Provides
    @Singleton
    fun provideDeleteUserUseCase(
        repository: UserRepository
    ): DeleteUserUseCase {
        return DeleteUserUseCase(repository)
    }
    
    @Provides
    @Singleton
    fun provideSearchUsersUseCase(
        repository: UserRepository
    ): SearchUsersUseCase {
        return SearchUsersUseCase(repository)
    }
    
    @Provides
    @Singleton
    fun provideFollowUserUseCase(
        repository: UserRepository
    ): FollowUserUseCase {
        return FollowUserUseCase(repository)
    }
}

// di/DataModule.kt
package com.example.di

import com.example.data.local.LocalDataSource
import com.example.data.local.LocalDataSourceImpl
import com.example.data.local.dao.UserDAO
import com.example.data.remote.RemoteDataSource
import com.example.data.remote.RemoteDataSourceImpl
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.repository.UserRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
interface DataModule {
    
    @Binds
    @Singleton
    fun bindUserRepository(
        repository: UserRepositoryImpl
    ): UserRepository
    
    @Binds
    @Singleton
    fun bindLocalDataSource(
        dataSource: LocalDataSourceImpl
    ): LocalDataSource
    
    @Binds
    @Singleton
    fun bindRemoteDataSource(
        dataSource: RemoteDataSourceImpl
    ): RemoteDataSource
}

// di/NetworkModule.kt
package com.example.di

import com.example.data.remote.api.ApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApiService(
        retrofit: Retrofit
    ): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

// di/DatabaseModule.kt
package com.example.di

import android.content.Context
import androidx.room.Room
import com.example.data.local.dao.UserDAO
import com.example.data.local.database.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "app_database"
        )
            .fallbackToDestructiveMigration()
            .build()
    }
    
    @Provides
    @Singleton
    fun provideUserDAO(
        database: AppDatabase
    ): UserDAO {
        return database.userDAO()
    }
}
```

---

## 9. 完整项目示例

### 9.1 项目结构

```
app/
├── domain/
│   ├── model/
│   │   ├── User.kt
│   │   ├── Post.kt
│   │   └── Exception/*.kt
│   ├── repository/
│   │   ├── UserRepository.kt
│   │   └── PostRepository.kt
│   └── usecase/
│       ├── GetUserUseCase.kt
│       ├── CreateUserUseCase.kt
│       └── UiState.kt
├── data/
│   ├── local/
│   │   ├── database/
│   │   │   └── AppDatabase.kt
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
│   │   └── UserRepositoryImpl.kt
│   └── mapper/
│       └── UserMapper.kt
├── presentation/
│   ├── viewmodel/
│   │   └── UserViewModel.kt
│   └── ui/
│       └── UserDetailScreen.kt
├── di/
│   ├── DomainModule.kt
│   ├── DataModule.kt
│   ├── NetworkModule.kt
│   └── DatabaseModule.kt
└── util/
    └── ExtensionFunctions.kt
```

### 9.2 应用入口

```kotlin
// MyApplication.kt
@HiltAndroidApp
class MyApplication : Application() {
    // 初始化逻辑
}
```

---

## 10. 高级主题

### 10.1 模块化

### 10.2 特性 Flag

### 10.3 性能优化

### 10.4 测试策略

---

## 11. 常见陷阱与最佳实践

### 11.1 常见陷阱

1. **过度设计**：小项目不需要完整的 Clean Architecture
2. **忽略值对象**：直接使用 String/Int 而不是值对象
3. **UseCase 过于复杂**：一个 UseCase 只做一件事
4. **Repository 泄露框架**：Domain 层不应该知道 Room/Retrofit

### 11.2 最佳实践

1. **从小开始**：根据项目规模选择合适的架构
2. **保持一致性**：所有模块使用相同的架构模式
3. **编写测试**：每层都应该有对应的测试
4. **文档化**：记录架构决策和原理

---

## 12. 面试考点

### 12.1 基础概念

#### Q1: 什么是 Clean Architecture？它的核心思想是什么？

**参考答案：**

Clean Architecture 是一种以业务逻辑为中心的软件架构，核心思想：

1. **依赖规则**：依赖指向内部，外部依赖内部
2. **独立性**：业务逻辑独立于框架、UI、数据库
3. **可测试性**：每层可以独立测试
4. **可维护性**：清晰的边界便于维护

```
核心层：Domain (业务逻辑)
中间层：Data (数据实现)
外层：Presentation (UI 展示)
```

#### Q2: Domain 层应该包含什么？不应该包含什么？

**参考答案：**

**应该包含：**
- Entity（实体）
- Use Case（用例）
- Repository Interface（仓储接口）
- 业务规则

**不应该包含：**
- Android 框架代码
- UI 相关代码
- 具体的数据实现
- 框架依赖（Room、Retrofit 等）

### 12.2 架构设计

#### Q3: 如何设计一个符合 Clean Architecture 的用户登录功能？

**参考答案：**

```
Domain 层:
- LoginUseCase (验证登录逻辑)
- UserRepository (定义登录接口)
- User Entity

Data 层:
- UserRepositoryImpl (实现登录)
- RemoteDataSource (API 调用)
- LocalDataSource (Token 存储)
- Mappers (数据转换)

Presentation 层:
- LoginViewModel (管理 UI 状态)
- LoginScreen (UI 展示)
```

#### Q4: Use Case 应该承担什么职责？

**参考答案：**

1. 单个业务操作
2. 业务验证
3. 协调 Repository
4. 返回统一的状态

### 12.3 实战问题

#### Q5: Clean Architecture 的优缺点是什么？

**参考答案：**

**优点：**
- 清晰的架构
- 易于测试
- 易于维护
- 技术替换方便

**缺点：**
- 代码量增加
- 学习曲线陡峭
- 小项目可能过度设计

---

## 总结

Clean Architecture 是现代 Android 应用的重要架构模式，它通过：

1. **分层设计**：清晰的分层和职责边界
2. **依赖倒置**：高层不依赖低层
3. **业务核心**：Domain 层包含核心业务逻辑
4. **可测试性**：每层独立测试

掌握 Clean Architecture 是成为高级 Android 开发者的必备技能。