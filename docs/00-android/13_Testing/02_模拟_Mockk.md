# 模拟技术 - MockK & Mockito

> **字数统计：约 10000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [模拟技术基础](#1-模拟技术基础)
2. [MockK 核心用法](#2-mockk-核心用法)
3. [Mockito 对比](#3-mockito-对比)
4. [Android 测试实战](#4-android-测试实战)
5. [高级模拟技巧](#5-高级模拟技巧)
6. [面试考点](#6-面试考点)

---

## 1. 模拟技术基础

### 1.1 为什么需要模拟

**问题场景：**

```kotlin
// 真实依赖的问题
class UserService(
    private val api: ApiService,      // 网络请求 - 慢，不稳定
    private val db: UserDao,          // 数据库 - 需要 Android 环境
    private val prefs: Preferences    //  SharedPreferences - 需要 Context
) {
    suspend fun login(username: String, password: String): Result<User> {
        // 测试困难：需要网络、数据库、Context
    }
}
```

**模拟的优势：**

```kotlin
// 使用 Mock
class UserServiceTest {
    
    private val api = mockk<ApiService>()     // 快速，可控
    private val db = mockk<UserDao>()         // 无需数据库
    private val prefs = mockk<Preferences>()  // 无需 Context
    
    @Test
    fun `login should succeed with valid credentials`() = runTest {
        // 定义 Mock 行为
        every { api.login(any(), any()) } returns Result.success(User(1, "admin"))
        
        // 测试快速、稳定、可重复
    }
}
```

### 1.2 测试替身类型

```
Test Doubles 分类：

1. Dummy - 占位对象，不使用
   val dummyUser = User(0, "")  // 只是占位

2. Fake - 简化实现，用于测试
   class FakeUserDao : UserDao {
       private val users = mutableMapOf<Int, User>()
       override suspend fun getUserById(id: Int) = users[id]
   }

3. Stub - 提供预设响应
   every { api.getUser(1) } returns User(1, "test")

4. Mock - 验证交互
   val mock = mockk<ApiService>()
   every { mock.getData() } returns "data"
   verify { mock.getData() }

5. Spy - 部分模拟，部分真实
   val spy = spyk(RealClass())
   every { spy.methodToMock() } returns "mocked"
```

### 1.3 依赖配置

```gradle
dependencies {
    // ===== MockK (推荐 for Kotlin) =====
    testImplementation 'io.mockk:mockk:1.13.8'
    androidTestImplementation 'io.mockk:mockk-android:1.13.8'
    
    // ===== Mockito (传统选择) =====
    testImplementation 'org.mockito:mockito-core:5.7.0'
    testImplementation 'org.mockito.kotlin:mockito-kotlin:5.2.1'
    androidTestImplementation 'org.mockito:mockito-android:5.7.0'
    
    // ===== Inline Mocking (MockK) =====
    // 模拟 final 类、Kotlin 协程等
    testImplementation 'io.mockk:mockk-agent:1.13.8'
}
```

---

## 2. MockK 核心用法

### 2.1 基础模拟

```kotlin
import io.mockk.*

class MockKBasics {
    
    @Test
    fun `basic mocking`() {
        // 创建 Mock
        val mockList = mockk<List<String>>()
        
        // 定义行为
        every { mockList.size } returns 3
        every { mockList.get(0) } returns "first"
        every { mockList.get(1) } returns "second"
        every { mockList.get(2) } returns "third"
        
        // 使用 Mock
        assertEquals(3, mockList.size)
        assertEquals("first", mockList.get(0))
        
        // 验证调用
        verify { mockList.get(0) }
        verify(exactly = 1) { mockList.get(0) }
        
        // 验证未调用
        verify(exactly = 0) { mockList.get(3) }
    }
    
    @Test
    fun `mock with any matcher`() {
        val mockCalculator = mockk<Calculator>()
        
        // 匹配任意参数
        every { mockCalculator.add(any(), any()) } returns 10
        
        assertEquals(10, mockCalculator.add(1, 2))
        assertEquals(10, mockCalculator.add(100, 200))
        
        // 验证任意参数调用
        verify { mockCalculator.add(any(), any()) }
    }
    
    @Test
    fun `mock with specific matcher`() {
        val mockValidator = mockk<Validator>()
        
        // 匹配特定值
        every { mockValidator.validate("admin") } returns true
        every { mockValidator.validate(any()) } returns false
        
        assertTrue(mockValidator.validate("admin"))
        assertFalse(mockValidator.validate("user"))
    }
}
```

### 2.2 匹配器

```kotlin
class MockKMatchers {
    
    @Test
    fun `all matchers`() {
        val mock = mockk<Repository>()
        
        // any() - 任意值
        every { mock.findById(any()) } returns User(1, "test")
        
        // eq() - 等于特定值
        every { mock.findByName(eq("admin")) } returns User(1, "admin")
        
        // match() - 自定义匹配
        every { 
            mock.save(match { it.id > 0 && it.name.isNotEmpty() }) 
        } returns true
        
        // slot() - 捕获参数
        val slot = slot<User>()
        every { mock.save(capture(slot)) } answers { true }
        
        mock.save(User(1, "test"))
        assertEquals(1, slot.captured.id)
        
        // allAny() - 所有参数任意
        every { mock.update(any(), any(), any()) } returns true
        
        // isNull() / isNotNull()
        every { mock.findByName(isNull()) } returns null
        every { mock.findByName(isNotNull()) } returns User(1, "test")
        
        // and() / or()
        every { 
            mock.findByAge(and(greater(18), less(65))) 
        } returns listOf(User(1, "adult"))
    }
    
    @Test
    fun `string matchers`() {
        val mock = mockk<StringService>()
        
        // startsWith()
        every { mock.process(startsWith("http")) } returns "URL"
        
        // endsWith()
        every { mock.process(endsWith(".txt")) } returns "Text File"
        
        // contains()
        every { mock.process(contains("test")) } returns "Contains Test"
        
        // regex()
        every { mock.process(regex("\\d+")) } returns "Number"
    }
    
    @Test
    fun `numeric matchers`() {
        val mock = mockk<MathService>()
        
        // greater() / greaterEquals()
        every { mock.check(greater(10)) } returns "Big"
        
        // less() / lessEquals()
        every { mock.check(less(10)) } returns "Small"
        
        // inRange()
        every { mock.check(inRange(1, 100)) } returns "In Range"
        
        // outOfRange()
        every { mock.check(outOfRange(1, 100)) } returns "Out of Range"
    }
}
```

### 2.3 验证

```kotlin
class MockKVerification {
    
    private val mockRepository = mockk<Repository>()
    
    @Test
    fun `basic verification`() {
        mockRepository.save(User(1, "test"))
        
        // 验证调用
        verify { mockRepository.save(any()) }
        
        // 验证特定调用
        verify { mockRepository.save(User(1, "test")) }
        
        // 验证调用次数
        verify(exactly = 1) { mockRepository.save(any()) }
        verify(atLeast = 1) { mockRepository.save(any()) }
        verify(atMost = 5) { mockRepository.save(any()) }
        
        // 验证未调用
        verify(exactly = 0) { mockRepository.delete(any()) }
        verify { mockRepository.delete(any()) wasNot Called }
    }
    
    @Test
    fun `verification with order`() {
        mockRepository.save(User(1, "test"))
        mockRepository.update(User(1, "updated"))
        mockRepository.delete(1)
        
        // 验证顺序
        verifyOrder {
            mockRepository.save(any())
            mockRepository.update(any())
            mockRepository.delete(any())
        }
        
        // 验证严格顺序（必须是连续调用）
        verifySequence {
            mockRepository.save(User(1, "test"))
            mockRepository.update(User(1, "updated"))
            mockRepository.delete(1)
        }
    }
    
    @Test
    fun `verification with timeout`() {
        // 异步场景
        mockRepository.saveAsync(User(1, "test"))
        
        // 等待最多 5 秒
        verify(timeout = 5000) { mockRepository.save(any()) }
    }
    
    @Test
    fun `verification with slot`() {
        val userSlot = slot<User>()
        every { mockRepository.save(capture(userSlot)) } returns true
        
        mockRepository.save(User(1, "test"))
        mockRepository.save(User(2, "test2"))
        
        // 捕获所有调用
        assertEquals(2, userSlot.allCaptured.size)
        assertEquals(1, userSlot.captured.id) // 最后一次
    }
}
```

### 2.4 答案块

```kotlin
class MockKAnswers {
    
    @Test
    fun `using answers`() {
        val mock = mockk<Calculator>()
        
        // answers 可以访问调用参数
        every { mock.add(any(), any()) } answers {
            val a = firstArg<Int>()
            val b = secondArg<Int>()
            a + b
        }
        
        assertEquals(5, mock.add(2, 3))
        assertEquals(10, mock.add(4, 6))
    }
    
    @Test
    fun `using answer with invocation`() {
        val mock = mockk<Repository>()
        
        every { mock.findById(any()) } answers { invocation ->
            val id = invocation.args[0] as Int
            User(id, "user_$id")
        }
        
        assertEquals(User(1, "user_1"), mock.findById(1))
        assertEquals(User(2, "user_2"), mock.findById(2))
    }
    
    @Test
    fun `multiple answers`() {
        val mock = mockk<Iterator<String>>()
        
        // 连续返回不同值
        every { mock.next() } returnsMany listOf("first", "second", "third")
        
        assertEquals("first", mock.next())
        assertEquals("second", mock.next())
        assertEquals("third", mock.next())
    }
    
    @Test
    fun `answer with throws`() {
        val mock = mockk<ApiService>()
        
        // 第一次成功，第二次失败
        every { mock.getData() } returnsMany listOf(
            "data1",
            throws(NetworkException("No connection"))
        )
        
        assertEquals("data1", mock.getData())
        
        assertThrows<NetworkException> {
            mock.getData()
        }
    }
    
    @Test
    fun `answer with delay`() {
        val mock = mockk<AsyncService>()
        
        // 模拟延迟
        every { mock.fetchData() } answers {
            Thread.sleep(100)
            "data"
        }
    }
}
```

### 2.5 Spy 部分模拟

```kotlin
class MockKSpy {
    
    @Test
    fun `basic spy`() {
        // 真实对象
        val realList = ArrayList<String>()
        
        // 创建 Spy（部分模拟）
        val spyList = spyk(realList)
        
        // 默认使用真实实现
        spyList.add("item")
        assertEquals(1, spyList.size)
        
        // 模拟特定方法
        every { spyList.size } returns 100
        
        assertEquals(100, spyList.size) // 返回 Mock 值
        assertEquals("item", spyList[0]) // 真实实现
    }
    
    @Test
    fun `spy with constructor`() {
        // Spy 具体类
        val spyCalculator = spyk(Calculator())
        
        // 模拟部分方法
        every { spyCalculator.multiply(any(), any()) } returns 100
        
        assertEquals(5, spyCalculator.add(2, 3)) // 真实
        assertEquals(100, spyCalculator.multiply(2, 3)) // Mock
    }
    
    @Test
    fun `spy private method`() {
        class Service {
            fun public(): String = private()
            private fun private(): String = "real"
        }
        
        val spy = spyk<Service>(recordPrivateCalls = true)
        
        every { spy["private"]() } returns "mocked"
        
        assertEquals("mocked", spy.public())
    }
}
```

### 2.6 Mock 对象类

```kotlin
class MockKObjectClass {
    
    // 模拟单例对象
    object Config {
        val apiUrl: String = "https://api.example.com"
        fun getTimeout(): Int = 5000
    }
    
    @Test
    fun `mock object`() {
        mockkObject(Config)
        
        every { Config.apiUrl } returns "https://mock.api.com"
        every { Config.getTimeout() } returns 10000
        
        assertEquals("https://mock.api.com", Config.apiUrl)
        assertEquals(10000, Config.getTimeout())
        
        // 清除 Mock
        unmockkObject(Config)
    }
    
    // 模拟伴生对象
    class UserService {
        companion object {
            fun createDefault(): UserService = UserService()
            val VERSION = "1.0.0"
        }
    }
    
    @Test
    fun `mock companion object`() {
        mockkObject(UserService.Companion)
        
        every { UserService.createDefault() } returns mockk()
        every { UserService.VERSION } returns "2.0.0"
        
        unmockkObject(UserService.Companion)
    }
    
    // 模拟静态类
    @Test
    fun `mock static class`() {
        mockkStatic("io.mockk.StaticClass")
        
        every { StaticClass.staticMethod() } returns "mocked"
        
        unmockkStatic("io.mockk.StaticClass")
    }
}
```

### 2.7 协程模拟

```kotlin
class MockKCoroutines {
    
    @Test
    fun `mock suspend function`() = runTest {
        val mockApi = mockk<ApiService>()
        
        // 模拟挂起函数
        every { mockApi.fetchData() } returns "data"
        
        val result = mockApi.fetchData()
        assertEquals("data", result)
        
        verify { mockApi.fetchData() }
    }
    
    @Test
    fun `mock flow`() = runTest {
        val mockApi = mockk<ApiService>()
        
        // 模拟 Flow
        every { mockApi.getDataStream() } returns flowOf(1, 2, 3)
        
        val results = mockApi.getDataStream().toList()
        assertEquals(listOf(1, 2, 3), results)
    }
    
    @Test
    fun `mock StateFlow`() = runTest {
        val mockRepo = mockk<Repository>()
        
        val stateFlow = MutableStateFlow(0)
        every { mockRepo.state } returns stateFlow
        
        stateFlow.value = 1
        assertEquals(1, mockRepo.state.value)
    }
    
    @Test
    fun `mock with delay`() = runTest {
        val mockApi = mockk<ApiService>()
        
        // 模拟延迟
        every { mockApi.fetchWithDelay() } coAnswers {
            delay(1000)
            "data"
        }
        
        advanceTimeBy(1000)
        val result = mockApi.fetchWithDelay()
        assertEquals("data", result)
    }
    
    @Test
    fun `mock with exception in coroutine`() = runTest {
        val mockApi = mockk<ApiService>()
        
        every { mockApi.fetchData() } coThrows NetworkException("Error")
        
        assertThrows<NetworkException> {
            mockApi.fetchData()
        }
    }
}
```

### 2.8 清理与重置

```kotlin
class MockKCleanup {
    
    private val mock = mockk<Repository>()
    
    @BeforeEach
    fun setup() {
        // 每个测试前清理
        clearAllMocks()
    }
    
    @AfterEach
    fun teardown() {
        // 每个测试后清理
        confirmVerified(mock)
        clearAllMocks()
    }
    
    @Test
    fun `test 1`() {
        every { mock.save(any()) } returns true
        mock.save(User(1, "test"))
        verify { mock.save(any()) }
    }
    
    @Test
    fun `test 2`() {
        // 不受 test 1 影响
        every { mock.findById(any()) } returns User(1, "test")
        val result = mock.findById(1)
        assertNotNull(result)
    }
    
    @Test
    fun `manual cleanup`() {
        // 手动清除特定 Mock
        clearMocks(mock)
        
        // 重置行为
        resetMocks(mock)
        
        // 完全解除 Mock
        unmockk(mock)
    }
}
```

---

## 3. Mockito 对比

### 3.1 Mockito 基础

```kotlin
import org.mockito.kotlin.*
import org.mockito.*

class MockitoBasics {
    
    @Test
    fun `basic mocking`() {
        // 创建 Mock
        val mockList = mock<List<String>>()
        
        // 定义行为
        `when`(mockList.size).thenReturn(3)
        `when`(mockList.get(0)).thenReturn("first")
        
        assertEquals(3, mockList.size)
        assertEquals("first", mockList.get(0))
        
        // 验证调用
        verify(mockList).get(0)
        verify(mockList, times(1)).get(0)
        verify(mockList, never()).get(1)
    }
    
    @Test
    fun `argument matchers`() {
        val mockCalculator = mock<Calculator>()
        
        // any()
        `when`(mockCalculator.add(any(), any())).thenReturn(10)
        
        // eq()
        `when`(mockCalculator.add(eq(2), eq(3))).thenReturn(5)
        
        // argThat()
        `when`(mockCalculator.add(argThat { it > 0 }, any())).thenReturn(100)
    }
    
    @Test
    fun `argument captor`() {
        val mockRepo = mock<Repository>()
        val captor = argumentCaptor<User>()
        
        `when`(mockRepo.save(captor.capture())).thenReturn(true)
        
        mockRepo.save(User(1, "test"))
        
        assertEquals(1, captor.firstValue.id)
    }
}
```

### 3.2 MockK vs Mockito

```kotlin
// ===== MockK (Kotlin 友好) =====

// 1. 更简洁的语法
val mock = mockk<Repository>()
every { mock.findById(1) } returns User(1, "test")
verify { mock.findById(1) }

// ===== Mockito (需要 Kotlin 扩展) =====

// 1. 需要反引号
val mock = mock<Repository>()
`when`(mock.findById(1)).thenReturn(User(1, "test"))
verify(mock).findById(1)

// ===== MockK 优势 =====

// 2. 协程支持更好
every { mock.suspendFunc() } returns "data"
every { mock.suspendFunc() } coAnswers { delay(100); "data" }

// Mockito 协程需要额外处理
`when`(mock.suspendFunc()).thenReturn("data") // 可能有问题

// 3. 对象/伴生对象模拟
mockkObject(Config)
every { Config.apiUrl } returns "mock"

// Mockito 需要额外的 inline mocking

// 4. 匹配器更丰富
every { mock.func(match { it > 0 }) } returns true
every { mock.func(and(greater(0), less(100))) } returns true

// 5. slot 捕获更优雅
val slot = slot<User>()
every { mock.save(capture(slot)) } returns true
```

### 3.3 迁移指南

```kotlin
// Mockito → MockK 迁移

// 1. 创建 Mock
// Mockito: val mock = mock<Repository>()
// MockK:   val mock = mockk<Repository>()

// 2. 定义行为
// Mockito: `when`(mock.func()).thenReturn(value)
// MockK:   every { mock.func() } returns value

// 3. 验证
// Mockito: verify(mock).func()
// MockK:   verify { mock.func() }

// 4. 参数捕获
// Mockito: val captor = argumentCaptor<User>()
// MockK:   val slot = slot<User>()

// 5. 清除
// Mockito: reset(mock)
// MockK:   clearAllMocks()
```

---

## 4. Android 测试实战

### 4.1 测试 ViewModel

```kotlin
class LoginViewModelTest {
    
    private lateinit var viewModel: LoginViewModel
    private lateinit var authRepo: AuthRepository
    private lateinit var prefs: Preferences
    
    @Before
    fun setup() {
        authRepo = mockk()
        prefs = mockk()
        viewModel = LoginViewModel(authRepo, prefs)
    }
    
    @Test
    fun `login success should update state`() = runTest {
        // Given
        val user = User(id = 1, username = "admin", token = "token123")
        every { authRepo.login(any(), any()) } returns Result.success(user)
        every { prefs.saveToken(any()) } returns Unit
        
        // When
        viewModel.login("admin", "password123")
        
        // Then
        val state = viewModel.uiState.value
        assertTrue(state is UiState.Success)
        assertEquals(user, (state as UiState.Success).user)
        
        verify { prefs.saveToken("token123") }
    }
    
    @Test
    fun `login failure should update state with error`() = runTest {
        // Given
        every { authRepo.login(any(), any()) } 
            returns Result.failure(LoginException("Invalid credentials"))
        
        // When
        viewModel.login("admin", "wrong")
        
        // Then
        val state = viewModel.uiState.value
        assertTrue(state is UiState.Error)
        assertEquals("Invalid credentials", (state as UiState.Error).message)
    }
    
    @Test
    fun `loading state should be shown during login`() = runTest {
        // Given
        val slot = slot<UiState>()
        every { authRepo.login(any(), any()) } answers {
            delay(100)
            Result.success(User(1, "admin"))
        }
        
        // When
        viewModel.login("admin", "password")
        
        // Then
        // 验证 Loading 状态出现
        verify(atLeast = 1) { /* state observer */ }
    }
}
```

### 4.2 测试 Repository

```kotlin
class UserRepositoryTest {
    
    private lateinit var repository: UserRepository
    private lateinit var apiService: ApiService
    private lateinit var userDao: UserDao
    private lateinit var prefs: Preferences
    
    @Before
    fun setup() {
        apiService = mockk()
        userDao = mockk()
        prefs = mockk()
        repository = UserRepository(apiService, userDao, prefs)
    }
    
    @Test
    fun `getUsers should fetch from network and cache`() = runTest {
        // Given
        val users = listOf(User(1, "user1"), User(2, "user2"))
        every { apiService.getUsers() } returns users
        coEvery { userDao.insertAll(any()) } returns Unit
        
        // When
        val result = repository.getUsers()
        
        // Then
        assertEquals(users, result)
        coVerify { userDao.insertAll(users) }
    }
    
    @Test
    fun `getUsers should return cached data when network fails`() = runTest {
        // Given
        val cachedUsers = listOf(User(1, "cached"))
        every { apiService.getUsers() } throws NetworkException("No connection")
        coEvery { userDao.getAllUsers() } returns cachedUsers
        
        // When
        val result = repository.getUsers()
        
        // Then
        assertEquals(cachedUsers, result)
    }
    
    @Test
    fun `getUserById should check cache first`() = runTest {
        // Given
        val cachedUser = User(1, "cached")
        coEvery { userDao.getUserById(1) } returns cachedUser
        
        // When
        val result = repository.getUserById(1)
        
        // Then
        assertEquals(cachedUser, result)
        // 验证没有调用网络
        verify(exactly = 0) { apiService.getUser(any()) }
    }
}
```

### 4.3 测试 Use Case

```kotlin
class LoginUseCaseTest {
    
    private lateinit var useCase: LoginUseCase
    private lateinit var userRepository: UserRepository
    private lateinit var tokenManager: TokenManager
    private lateinit var validator: LoginValidator
    
    @Before
    fun setup() {
        userRepository = mockk()
        tokenManager = mockk()
        validator = mockk()
        useCase = LoginUseCase(userRepository, tokenManager, validator)
    }
    
    @Test
    fun `invoke with invalid username should fail`() = runTest {
        // Given
        every { validator.validateUsername(any()) } returns false
        
        // When
        val result = useCase("", "password123")
        
        // Then
        assertTrue(result.isFailure)
        assertInstanceOf<ValidationException>(result.exceptionOrNull())
        
        // 验证没有调用 Repository
        verify(exactly = 0) { userRepository.login(any(), any()) }
    }
    
    @Test
    fun `invoke with invalid password should fail`() = runTest {
        // Given
        every { validator.validateUsername(any()) } returns true
        every { validator.validatePassword(any()) } returns false
        
        // When
        val result = useCase("admin", "123")
        
        // Then
        assertTrue(result.isFailure)
    }
    
    @Test
    fun `invoke with valid credentials should save token`() = runTest {
        // Given
        val user = User(id = 1, username = "admin", token = "token123")
        every { validator.validateUsername(any()) } returns true
        every { validator.validatePassword(any()) } returns true
        coEvery { userRepository.login(any(), any()) } returns Result.success(user)
        coEvery { tokenManager.saveToken(any()) } returns Unit
        
        // When
        val result = useCase("admin", "password123")
        
        // Then
        assertTrue(result.isSuccess)
        coVerify { tokenManager.saveToken("token123") }
    }
}
```

### 4.4 测试网络层

```kotlin
class ApiServiceTest {
    
    private lateinit var apiService: ApiService
    private lateinit var retrofit: Retrofit
    private lateinit var mockWebServer: MockWebServer
    
    @Before
    fun setup() {
        mockWebServer = MockWebServer().apply { start() }
        retrofit = Retrofit.Builder()
            .baseUrl(mockWebServer.url("/"))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(ApiService::class.java)
    }
    
    @After
    fun teardown() {
        mockWebServer.shutdown()
    }
    
    @Test
    fun `getUsers should parse response correctly`() = runTest {
        // Given
        val jsonResponse = """
            [
                {"id": 1, "name": "user1"},
                {"id": 2, "name": "user2"}
            ]
        """.trimIndent()
        
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(200)
                .setBody(jsonResponse)
        )
        
        // When
        val result = apiService.getUsers()
        
        // Then
        assertEquals(2, result.size)
        assertEquals("user1", result[0].name)
    }
    
    @Test
    fun `getUsers should handle error response`() = runTest {
        // Given
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(401)
                .setBody("""{"error": "Unauthorized"}""")
        )
        
        // When & Then
        assertThrows<HttpException> {
            apiService.getUsers()
        }
    }
    
    @Test
    fun `getUsers should handle network error`() = runTest {
        // Given
        mockWebServer.shutdown()
        
        // When & Then
        assertThrows<IOException> {
            apiService.getUsers()
        }
    }
}
```

### 4.5 测试数据库

```kotlin
class UserDaoTest {
    
    private lateinit var userDao: UserDao
    private lateinit var db: AppDatabase
    
    @Before
    fun setup() {
        db = Room.inMemoryDatabaseBuilder(
            InstrumentationRegistry.getInstrumentation().targetContext,
            AppDatabase::class.java
        ).build()
        userDao = db.userDao()
    }
    
    @After
    fun teardown() {
        db.close()
    }
    
    @Test
    fun `insert and getUserById`() = runTest {
        // Given
        val user = User(id = 1, username = "test")
        
        // When
        userDao.insert(user)
        val result = userDao.getUserById(1)
        
        // Then
        assertEquals(user, result)
    }
    
    @Test
    fun `getAllUsers should return all inserted users`() = runTest {
        // Given
        val users = listOf(
            User(1, "user1"),
            User(2, "user2"),
            User(3, "user3")
        )
        
        // When
        users.forEach { userDao.insert(it) }
        val result = userDao.getAllUsers()
        
        // Then
        assertEquals(users.size, result.size)
    }
    
    @Test
    fun `delete user should remove from database`() = runTest {
        // Given
        val user = User(id = 1, username = "test")
        userDao.insert(user)
        
        // When
        userDao.delete(user)
        val result = userDao.getUserById(1)
        
        // Then
        assertNull(result)
    }
}
```

---

## 5. 高级模拟技巧

### 5.1 链式调用模拟

```kotlin
class ChainedMocking {
    
    @Test
    fun `mock chain of calls`() {
        val mockBuilder = mockk<Builder>()
        val mockRequest = mockk<Request>()
        val mockResponse = mockk<Response>()
        
        // 链式调用
        every { mockBuilder.baseUrl(any()) } returns mockBuilder
        every { mockBuilder.addInterceptor(any()) } returns mockBuilder
        every { mockBuilder.build() } returns mockRequest
        every { mockRequest.execute() } returns mockResponse
        every { mockResponse.isSuccessful } returns true
        every { mockResponse.body() } returns "data"
        
        // 使用
        val result = mockBuilder
            .baseUrl("https://api.com")
            .addInterceptor(LoggingInterceptor())
            .build()
            .execute()
        
        assertTrue(result.isSuccessful)
    }
    
    @Test
    fun `mock builder pattern`() {
        val mockDialog = mockk<AlertDialog>()
        val mockBuilder = mockk<AlertDialog.Builder>()
        
        every { mockBuilder.setTitle(any()) } returns mockBuilder
        every { mockBuilder.setMessage(any()) } returns mockBuilder
        every { mockBuilder.setPositiveButton(any(), any()) } returns mockBuilder
        every { mockBuilder.create() } returns mockDialog
        every { mockDialog.show() } returns Unit
        
        mockBuilder
            .setTitle("Title")
            .setMessage("Message")
            .setPositiveButton("OK") { _, _ -> }
            .create()
            .show()
        
        verify { mockDialog.show() }
    }
}
```

### 5.2 部分参数模拟

```kotlin
class PartialArgumentMocking {
    
    @Test
    fun `mock with partial matchers`() {
        val mock = mockk<Repository>()
        
        // 第一个参数固定，第二个任意
        every { mock.update(eq(1), any()) } returns true
        
        assertTrue(mock.update(1, User(1, "test")))
        assertFalse(mock.update(2, User(2, "test")))
    }
    
    @Test
    fun `mock with multiple conditions`() {
        val mock = mockk<Calculator>()
        
        every { mock.calculate(1, 2) } returns 3
        every { mock.calculate(2, 3) } returns 5
        every { mock.calculate(any(), 0) } returns 0
        
        assertEquals(3, mock.calculate(1, 2))
        assertEquals(5, mock.calculate(2, 3))
        assertEquals(0, mock.calculate(100, 0))
    }
}
```

### 5.3 自动 Mock

```kotlin
class AutoMocking {
    
    @Test
    fun `relaxed mock`() {
        // 宽松 Mock - 未定义的方法返回默认值
        val relaxedMock = mockk<Repository>(relaxed = true)
        
        // 不需要定义行为
        val result = relaxedMock.findById(1)
        
        // 返回默认值
        assertNotNull(result) // User 的默认实例
    }
    
    @Test
    fun `partial relaxed mock`() {
        val mock = mockk<Repository>(relaxed = true)
        
        // 只定义需要验证的方法
        every { mock.save(any()) } returns true
        
        // 其他方法自动返回默认值
        val user = mock.findById(1)
        val list = mock.findAll()
        
        verify { mock.save(any()) }
    }
}
```

### 5.4 验证内部状态

```kotlin
class StateVerification {
    
    @Test
    fun `verify internal state changes`() {
        val mock = mockk<Repository>(recordPrivateCalls = true)
        
        every { mock.save(any()) } answers {
            // 验证内部状态变化
            val user = firstArg<User>()
            user.id = 1
            true
        }
        
        val user = User(id = 0, username = "test")
        mock.save(user)
        
        assertEquals(1, user.id)
    }
    
    @Test
    fun `verify callback execution`() {
        val mock = mockk<AsyncService>()
        var callbackExecuted = false
        
        every { mock.execute(any()) } answers {
            val callback = firstArg<() -> Unit>()
            callback()
            callbackExecuted = true
        }
        
        mock.execute { /* callback */ }
        
        assertTrue(callbackExecuted)
    }
}
```

### 5.5 组合 Mock

```kotlin
class ComposedMocking {
    
    @Test
    fun `mock multiple objects together`() {
        val mock1 = mockk<Service1>()
        val mock2 = mockk<Service2>()
        val mock3 = mockk<Service3>()
        
        // 批量定义行为
        every { 
            mock1.method1() 
            mock2.method2()
            mock3.method3()
        } returnsMany listOf("result1", "result2", "result3")
        
        // 批量验证
        verify {
            mock1.method1()
            mock2.method2()
            mock3.method3()
        }
    }
    
    @Test
    fun `mock with composition`() {
        val innerMock = mockk<InnerService>()
        val outerMock = mockk<OuterService>()
        
        every { outerMock.inner } returns innerMock
        every { innerMock.getData() } returns "data"
        
        assertEquals("data", outerMock.inner.getData())
    }
}
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: 什么是 Mock？为什么需要 Mock？**

```
答案要点：
- Mock 是测试替身的一种，用于模拟依赖对象的行为
- 好处：
  - 隔离被测代码
  - 加快测试速度（无需真实网络/数据库）
  - 可控的测试场景（模拟错误、边界条件）
  - 验证交互（确认调用了哪些方法）
```

**Q2: MockK 和 Mockito 的区别？**

```
答案要点：
- MockK 是 Kotlin 原生设计，语法更简洁
- MockK 协程支持更好（coAnswers, coEvery）
- MockK 支持对象/伴生对象模拟
- MockK 匹配器更丰富（slot, match, and, or）
- Mockito 是 Java 老牌框架，生态更成熟
- Kotlin 项目推荐使用 MockK
```

**Q3: Mock 和 Spy 的区别？**

```
答案要点：
- Mock：完全模拟，所有方法默认返回空/默认值
- Spy：部分模拟，默认调用真实实现
- 使用场景：
  - Mock：隔离依赖，测试交互
  - Spy：测试部分逻辑，保留真实行为
```

### 6.2 实战问题

**Q4: 如何测试协程代码？**

```kotlin
// 使用 coEvery 和 coAnswers
every { mock.suspendFunc() } coAnswers {
    delay(100)
    "result"
}

// 使用 runTest
@Test
fun testCoroutine() = runTest {
    val result = mock.suspendFunc()
    assertEquals("result", result)
}
```

**Q5: 如何验证方法调用顺序？**

```kotlin
verifyOrder {
    mock.method1()
    mock.method2()
    mock.method3()
}

// 严格顺序（必须连续）
verifySequence {
    mock.method1()
    mock.method2()
    mock.method3()
}
```

**Q6: 如何捕获方法参数？**

```kotlin
// MockK slot
val slot = slot<User>()
every { mock.save(capture(slot)) } returns true

mock.save(User(1, "test"))
assertEquals(1, slot.captured.id)

// Mockito argumentCaptor
val captor = argumentCaptor<User>()
`when`(mock.save(captor.capture())).thenReturn(true)
```

### 6.3 高级问题

**Q7: 如何测试私有方法？**

```
答案要点：
- 不应该直接测试私有方法
- 私有方法是实现细节
- 通过测试公共方法间接测试
- 如果私有方法复杂，考虑提取为独立类
- MockK 可以用 recordPrivateCalls = true 模拟
```

**Q8: 如何处理测试中的依赖注入？**

```kotlin
// 手动注入
val mock = mockk<Repository>()
val viewModel = ViewModel(mock)

// 使用 Hilt/Koin 测试模块
@TestInstallIn(components = [UnitTestComponent::class])
@Module
class TestModule {
    @Provides
    fun provideRepository(): Repository = mockk()
}
```

**Q9: 什么是测试反模式？**

```
常见反模式：
1. 测试过于复杂（超过 10-15 行）
2. 测试之间有依赖
3. 测试生产代码（getter/setter）
4. 忽略异常
5. Mock 过多（超过 3-4 个）
6. 验证内部实现而非行为
```

---

## 参考资料

- [MockK 官方文档](https://mockk.io/)
- [Mockito 官方文档](https://site.mockito.org/)
- [Kotlin 测试最佳实践](https://kotlinlang.org/docs/testing.html)

---

*本文完，感谢阅读！*
