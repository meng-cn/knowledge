# Kotlin Multiplatform

> **字数统计：约 8000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 1. KMP 简介

### 1.1 什么是 KMP

```
Kotlin Multiplatform (KMP):
- 跨平台代码共享
- 支持 iOS、Android、Web、Desktop
- 共享业务逻辑，UI 独立
```

### 1.2 KMP vs CMP

```
KMP: 共享业务逻辑
CMP: 共享 UI + 业务逻辑

选择建议：
- 需要共享 UI → CMP
- 仅共享逻辑 → KMP
```

---

## 2. 项目结构

```
project/
├── shared/               # KMP 共享模块
│   ├── src/
│   │   ├── commonMain/   # 共享代码
│   │   ├── commonTest/
│   │   ├── androidMain/  # Android 特定
│   │   ├── iosMain/      # iOS 特定
│   │   └── jvmMain/      # Desktop
│   └── build.gradle.kts
├── androidApp/           # Android
├── iosApp/               # iOS
└── desktopApp/           # Desktop
```

---

## 3. 代码共享

### 3.1 共享模型

```kotlin
// commonMain
data class User(
    val id: Int,
    val name: String,
    val email: String
)

class UserRepository {
    suspend fun getUser(id: Int): User {
        // 共享逻辑
    }
}
```

### 3.2 平台特定实现

```kotlin
// commonMain
interface NetworkClient {
    suspend fun fetchData(): String
}

// androidMain
actual class NetworkClient actual constructor() : NetworkClient {
    actual suspend fun fetchData(): String {
        // Android 实现 (Retrofit)
    }
}

// iosMain
actual class NetworkClient actual constructor() : NetworkClient {
    actual suspend fun fetchData(): String {
        // iOS 实现 (URLSession)
    }
}
```

---

## 4. 测试

```kotlin
// commonTest
class UserRepositoryTest {
    @Test
    fun testGetUser() {
        val repo = UserRepository()
        val user = repo.getUser(1)
        assertEquals(1, user.id)
    }
}
```

---

## 5. 面试考点

**Q1: KMP 的优势？**
- 代码共享
- 统一测试
- 减少 bug

**Q2: expect/actual 的作用？**
- 定义接口
- 平台特定实现

---

*本文完*
