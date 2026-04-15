# 单元测试 - JUnit4 & JUnit5

> **字数统计：约 9000 字**  
> **难度等级：⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [单元测试基础](#1-单元测试基础)
2. [JUnit4 核心用法](#2-junit4-核心用法)
3. [JUnit5 新特性](#3-junit5-新特性)
4. [Android 单元测试实践](#4-android-单元测试实践)
5. [测试最佳实践](#5-测试最佳实践)
6. [面试考点](#6-面试考点)

---

## 1. 单元测试基础

### 1.1 什么是单元测试

**单元测试（Unit Testing）** 是对软件中最小可测试单元进行检查和验证的过程。

```
测试金字塔：
        /\
       /  \
      / E2E \      ← 端到端测试（少量）
     /--------\
    /Integration\   ← 集成测试（适量）
   /--------------\
  /    Unit Tests   \ ← 单元测试（大量）
 /____________________\
```

### 1.2 单元测试的价值

```kotlin
// 1. 快速反馈 - 几秒内知道代码是否工作
@Test
fun `addition should work`() {
    val result = 2 + 2
    assertEquals(4, result) // 立即知道结果
}

// 2. 文档作用 - 测试即文档
@Test
fun `user login with valid credentials should succeed`() {
    // 测试代码清晰表达了业务逻辑
    val user = createUser("test", "password")
    val result = loginRepository.login(user)
    assertTrue(result.isSuccess)
}

// 3. 重构保障 - 修改代码后测试确保功能正常
@Test
fun `calculate discount should apply 10 percent off`() {
    // 重构后运行测试，确保逻辑未变
    val originalPrice = 100
    val discountedPrice = discountCalculator.calculate(originalPrice, 0.1)
    assertEquals(90, discountedPrice)
}

// 4. 设计指导 - TDD 驱动更好的设计
```

### 1.3 测试分类

```kotlin
// 1. 本地单元测试 (Local Unit Tests)
// 运行在 JVM 上，不依赖 Android 框架
// 速度快，适合业务逻辑测试
@Test
fun `pure function test`() {
    val result = MathUtils.add(2, 3)
    assertEquals(5, result)
}

// 2. 仪器单元测试 (Instrumented Unit Tests)
// 运行在 Android 设备/模拟器上
// 可以访问 Android 框架 API
@RunWith(AndroidJUnit4::class)
class ContextTest {
    @Test
    fun useAppContext() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("com.example.app", context.packageName)
    }
}

// 3. 集成测试 (Integration Tests)
// 测试多个组件协作
@Test
fun `repository should fetch data from network and cache it`() {
    // 测试 Repository + Network + Database 协作
}

// 4. UI 测试 (UI Tests)
// 测试用户界面交互
@Test
fun `login button should navigate to home screen`() {
    // 使用 Espresso 测试 UI
}
```

### 1.4 测试依赖配置

```gradle
// 模块级 build.gradle
dependencies {
    // ===== 本地单元测试 (JVM) =====
    testImplementation 'junit:junit:4.13.2'           // JUnit4
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0' // JUnit5
    
    // Mocking
    testImplementation 'io.mockk:mockk:1.13.8'        // MockK (Kotlin 友好)
    testImplementation 'org.mockito:mockito-core:5.7.0' // Mockito
    
    // 协程测试
    testImplementation 'org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3'
    
    // Truth 断言库
    testImplementation 'com.google.truth:truth:1.1.5'
    
    // ===== 仪器单元测试 (Android) =====
    androidTestImplementation 'androidx.test:runner:1.5.2'
    androidTestImplementation 'androidx.test:rules:1.5.0'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    
    // Espresso UI 测试
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    
    // MockK for Android
    androidTestImplementation 'io.mockk:mockk-android:1.13.8'
}
```

---

## 2. JUnit4 核心用法

### 2.1 基础注解

```kotlin
import org.junit.*
import org.junit.Assert.*

class JUnit4Basics {
    
    // 在所有测试之前执行一次（类级别）
    @BeforeClass
    @JvmStatic
    fun setupClass() {
        println("Before Class - 初始化昂贵资源")
    }
    
    // 在每个测试之前执行（实例级别）
    @Before
    fun setup() {
        println("Before Each - 初始化测试数据")
    }
    
    // 测试方法
    @Test
    fun `test example`() {
        val result = 2 + 2
        assertEquals("2 + 2 should equal 4", 4, result)
    }
    
    // 测试方法 - 简单形式
    @Test
    fun testSimple() {
        assertTrue(true)
        assertFalse(false)
        assertNull(null)
        assertNotNull("string")
    }
    
    // 测试方法 - 期望异常
    @Test(expected = IllegalArgumentException::class)
    fun testExpectedException() {
        throw IllegalArgumentException("Expected")
    }
    
    // 测试方法 - 超时
    @Test(timeout = 1000)
    fun testTimeout() {
        // 必须在 1 秒内完成
        Thread.sleep(500)
    }
    
    // 忽略测试
    @Test
    @Ignore("TODO: 需要实现")
    fun ignoredTest() {
        // 不会执行
    }
    
    // 在每个测试之后执行
    @After
    fun teardown() {
        println("After Each - 清理资源")
    }
    
    // 在所有测试之后执行一次
    @AfterClass
    @JvmStatic
    fun teardownClass() {
        println("After Class - 释放昂贵资源")
    }
}
```

### 2.2 断言方法

```kotlin
import org.junit.Assert.*

class JUnit4Assertions {
    
    @Test
    fun `all assertions`() {
        // 相等断言
        assertEquals(4, 2 + 2)
        assertEquals("message", 4, 2 + 2)
        assertNotEquals(5, 2 + 2)
        
        // 对象相等
        assertEquals("hello", "hello")
        assertNotEquals("hello", "world")
        
        // 布尔断言
        assertTrue(true)
        assertTrue("message", true)
        assertFalse(false)
        
        // 空值断言
        assertNull(null)
        assertNotNull("string")
        
        // 数组断言
        assertArrayEquals(intArrayOf(1, 2, 3), intArrayOf(1, 2, 3))
        
        // 浮点数断言（需要容差）
        assertEquals(0.1, 0.1 + 0.2 - 0.3, 0.001)
    }
    
    @Test
    fun `string assertions`() {
        assertThat("Hello World", containsString("World"))
        assertThat("Hello World", startsWith("Hello"))
        assertThat("Hello World", endsWith("World"))
        assertThat("Hello World", equalToIgnoringCase("hello world"))
    }
}
```

### 2.3 参数化测试

```kotlin
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized
import org.junit.runners.Parameterized.Parameters

@RunWith(Parameterized::class)
class ParameterizedTest(
    private val a: Int,
    private val b: Int,
    private val expected: Int
) {
    
    companion object {
        @JvmStatic
        @Parameters
        fun data(): Collection<Array<Any>> {
            return listOf(
                arrayOf(1, 2, 3),
                arrayOf(5, 5, 10),
                arrayOf(-1, 1, 0),
                arrayOf(100, 200, 300)
            )
        }
    }
    
    @Test
    fun testAddition() {
        assertEquals(expected, a + b)
    }
}

// JUnit4 参数化测试 - 使用 ParameterizedParameterized 注解
@RunWith(Parameterized::class)
class LoginTest(
    private val username: String,
    private val password: String,
    private val expectedResult: Boolean
) {
    
    companion object {
        @JvmStatic
        @Parameters(name = "{index}: login({0}, {1}) = {2}")
        fun testData(): Collection<Array<Any>> {
            return listOf(
                arrayOf("admin", "123456", true),
                arrayOf("user", "wrong", false),
                arrayOf("", "password", false),
                arrayOf("admin", "", false)
            )
        }
    }
    
    @Test
    fun testLogin() {
        val result = LoginValidator.validate(username, password)
        assertEquals(expectedResult, result)
    }
}
```

### 2.4 测试套件

```kotlin
import org.junit.runner.RunWith
import org.junit.runners.Suite

// 将多个测试类组合成套件
@RunWith(Suite::class)
@Suite.SuiteClasses(
    CalculatorTest::class,
    UserServiceTest::class,
    RepositoryTest::class
)
class AllTestsSuite
```

### 2.5 Rule 规则

```kotlin
import org.junit.*
import org.junit.rules.*

class JUnit4Rules {
    
    // TemporaryFolder - 临时文件
    @get:Rule
    val tempFolder = TemporaryFolder()
    
    @Test
    fun testWithTempFile() {
        val file = tempFolder.newFile("test.txt")
        file.writeText("Hello")
        assertTrue(file.exists())
    }
    
    // ExpectedException - 期望异常
    @get:Rule
    val expectedException = ExpectedException.none()
    
    @Test
    fun testExceptionRule() {
        expectedException.expect(IllegalArgumentException::class.java)
        expectedException.expectMessage("Invalid argument")
        
        throw IllegalArgumentException("Invalid argument")
    }
    
    // Timeout - 全局超时
    @get:Rule
    val timeout = Timeout.seconds(5)
    
    @Test
    fun testWithGlobalTimeout() {
        // 所有测试都有 5 秒超时
        Thread.sleep(1000)
    }
    
    // TestName - 获取测试名称
    @get:Rule
    val testName = TestName()
    
    @Test
    fun testWithRule() {
        println("Running test: ${testName.methodName}")
    }
}
```

---

## 3. JUnit5 新特性

### 3.1 JUnit5 架构

```
JUnit5 = JUnit Platform + JUnit Jupiter + JUnit Vintage

- JUnit Platform: 测试执行引擎
- JUnit Jupiter: JUnit5 新特性（主要使用）
- JUnit Vintage: 兼容 JUnit3/4
```

### 3.2 JUnit5 注解

```kotlin
import org.junit.jupiter.api.*

class JUnit5Annotations {
    
    // 在所有测试之前执行一次
    @BeforeAll
    fun setupAll() {
        println("Before All")
    }
    
    // 在每个测试之前执行
    @BeforeEach
    fun setupEach() {
        println("Before Each")
    }
    
    // 测试方法
    @Test
    fun testExample() {
        println("Test running")
    }
    
    // 禁用测试
    @Test
    @Disabled("Not implemented yet")
    fun disabledTest() {
        // 不会执行
    }
    
    // 条件执行
    @Test
    @EnabledOnOs(OS.LINUX)
    fun testOnLinuxOnly() {}
    
    @Test
    @DisabledOnJre(JRE.JAVA_8)
    fun testNotOnJava8() {}
    
    // 重复测试
    @Test
    @RepeatedTest(5)
    fun repeatedTest() {
        println("Repeated")
    }
    
    // 嵌套测试
    @Nested
    inner class NestedTests {
        @Test
        fun nestedTest() {
            println("Nested test")
        }
    }
    
    // 在每个测试之后执行
    @AfterEach
    fun teardownEach() {
        println("After Each")
    }
    
    // 在所有测试之后执行一次
    @AfterAll
    fun teardownAll() {
        println("After All")
    }
}
```

### 3.3 断言 API

```kotlin
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.DynamicTest.dynamicTest
import org.junit.jupiter.api.TestFactory

class JUnit5Assertions {
    
    @Test
    fun `all assertions`() {
        // 基础断言
        assertEquals(4, 2 + 2)
        assertNotEquals(5, 2 + 2)
        assertTrue(2 > 1)
        assertFalse(2 < 1)
        assertNull(null)
        assertNotNull("string")
        
        // 带消息的断言
        assertEquals(4, 2 + 2) { "2 + 2 should be 4" }
        
        // 浮点数断言
        assertEquals(0.1, 0.1 + 0.2 - 0.3, 0.001)
        
        // 数组断言
        assertArrayEquals(intArrayOf(1, 2, 3), intArrayOf(1, 2, 3))
        
        // 迭代断言
        assertAll("properties",
            { assertEquals(1, 1) },
            { assertEquals(2, 2) },
            { assertEquals(3, 3) }
        )
        
        // 异常断言（JUnit5 新方式）
        val exception = assertThrows<IllegalArgumentException> {
            throw IllegalArgumentException("test")
        }
        assertEquals("test", exception.message)
        
        // 不抛出异常
        assertDoesNotThrow {
            // 不应该抛出异常
        }
        
        // 超时断言
        assertTimeout(Duration.ofSeconds(1)) {
            Thread.sleep(500)
        }
        
        // 超时并返回结果
        val result = assertTimeout(Duration.ofSeconds(1)) {
            "result"
        }
        assertEquals("result", result)
    }
    
    // 动态测试
    @TestFactory
    fun dynamicTests() = listOf(
        dynamicTest("test 1") { assertEquals(1, 1) },
        dynamicTest("test 2") { assertEquals(2, 2) },
        dynamicTest("test 3") { assertEquals(3, 3) }
    )
}
```

### 3.4 参数化测试（JUnit5）

```kotlin
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.*

class JUnit5ParameterizedTest {
    
    // ValueSource - 简单值
    @ParameterizedTest
    @ValueSource(ints = [1, 2, 3, 4, 5])
    fun testWithValueSource(value: Int) {
        assertTrue(value > 0)
    }
    
    // EnumSource - 枚举值
    @ParameterizedTest
    @EnumSource(Status::class)
    fun testWithEnumSource(status: Status) {
        assertNotNull(status)
    }
    
    enum class Status { ACTIVE, INACTIVE, PENDING }
    
    // CsvSource - CSV 数据
    @ParameterizedTest
    @CsvSource(
        "1, 2, 3",
        "5, 5, 10",
        "-1, 1, 0",
        "100, 200, 300"
    )
    fun testWithCsvSource(a: Int, b: Int, expected: Int) {
        assertEquals(expected, a + b)
    }
    
    // CsvFileSource - 从文件读取
    @ParameterizedTest
    @CsvFileSource(resources = ["/test-data.csv"], numLinesToSkip = 1)
    fun testWithCsvFile(a: Int, b: Int, expected: Int) {
        assertEquals(expected, a + b)
    }
    
    // MethodSource - 从方法获取数据
    @ParameterizedTest
    @MethodSource("provideNumbers")
    fun testWithMethodSource(a: Int, b: Int, expected: Int) {
        assertEquals(expected, a + b)
    }
    
    companion object {
        @JvmStatic
        fun provideNumbers() = listOf(
            Arguments.of(1, 2, 3),
            Arguments.of(5, 5, 10),
            Arguments.of(-1, 1, 0)
        )
    }
    
    // ArgumentsSource - 自定义参数提供器
    @ParameterizedTest
    @ArgumentsSource(CustomArgumentsProvider::class)
    fun testWithArgumentsSource(args: Arguments) {
        // 使用自定义参数
    }
    
    class CustomArgumentsProvider : ArgumentsProvider {
        override fun provideArguments(context: ExtensionContext): Stream<out Arguments> {
            return Stream.of(
                Arguments.of(1, 2, 3),
                Arguments.of(5, 5, 10)
            )
        }
    }
}
```

### 3.5 嵌套测试

```kotlin
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class NestedTests {
    
    @Nested
    inner class `When user is logged in` {
        
        @Test
        fun `should show profile page`() {
            // 测试逻辑
        }
        
        @Test
        fun `should allow logout`() {
            // 测试逻辑
        }
        
        @Nested
        inner class `When user has premium subscription` {
            
            @Test
            fun `should show premium features`() {
                // 测试逻辑
            }
        }
    }
    
    @Nested
    inner class `When user is not logged in` {
        
        @Test
        fun `should redirect to login page`() {
            // 测试逻辑
        }
    }
}
```

### 3.6 扩展模型

```kotlin
import org.junit.jupiter.api.extension.*

// 自定义扩展
class TimingExtension : BeforeTestExecutionCallback, AfterTestExecutionCallback {
    
    private var startTime: Long = 0
    
    override fun beforeTestExecution(context: ExtensionContext) {
        startTime = System.currentTimeMillis()
    }
    
    override fun afterTestExecution(context: ExtensionContext) {
        val duration = System.currentTimeMillis() - startTime
        println("Test ${context.displayName} took ${duration}ms")
    }
}

// 使用扩展
@ExtendWith(TimingExtension::class)
class TestWithExtension {
    
    @Test
    fun testWithTiming() {
        Thread.sleep(100)
    }
}

// 组合扩展
@ExtendWith(
    TimingExtension::class,
    LoggingExtension::class,
    MockExtension::class
)
class TestWithMultipleExtensions
```

---

## 4. Android 单元测试实践

### 4.1 测试业务逻辑

```kotlin
// 被测试的类
class UserService(
    private val userRepository: UserRepository,
    private val preferences: Preferences
) {
    suspend fun login(username: String, password: String): Result<User> {
        if (username.isBlank()) {
            return Result.failure(IllegalArgumentException("Username required"))
        }
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("Password too short"))
        }
        
        return userRepository.findByUsername(username)
            .filter { passwordEncoder.matches(password, it.password) }
            .map { user ->
                preferences.saveToken(user.token)
                user
            }
    }
}

// 测试类
class UserServiceTest {
    
    private lateinit var userRepository: UserRepository
    private lateinit var preferences: Preferences
    private lateinit var userService: UserService
    
    @BeforeEach
    fun setup() {
        userRepository = mockk()
        preferences = mockk()
        userService = UserService(userRepository, preferences)
    }
    
    @Test
    fun `login with empty username should fail`() = runTest {
        // Given
        val username = ""
        val password = "password123"
        
        // When
        val result = userService.login(username, password)
        
        // Then
        assertTrue(result.isFailure)
        assertInstanceOf<IllegalArgumentException>(result.exceptionOrNull())
    }
    
    @Test
    fun `login with short password should fail`() = runTest {
        // Given
        val username = "admin"
        val password = "123"
        
        // When
        val result = userService.login(username, password)
        
        // Then
        assertTrue(result.isFailure)
    }
    
    @Test
    fun `login with valid credentials should succeed`() = runTest {
        // Given
        val username = "admin"
        val password = "password123"
        val user = User(id = 1, username = username, token = "token123")
        
        every { userRepository.findByUsername(username) } 
            returns flowOf(user)
        every { preferences.saveToken(any()) } returns Unit
        
        // When
        val result = userService.login(username, password)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(user, result.getOrNull())
        verify { preferences.saveToken("token123") }
    }
}
```

### 4.2 测试协程

```kotlin
import kotlinx.coroutines.test.*

class CoroutineTest {
    
    @Test
    fun `test with runTest`() = runTest {
        // runTest 自动提供 TestScope
        val deferred = async { fetchData() }
        val result = deferred.await()
        
        assertEquals("expected", result)
    }
    
    @Test
    fun `test with virtual time`() = runTest {
        // 使用虚拟时间，skip 延迟
        advanceTimeBy(1000) // 快进 1 秒
        
        val result = withContext(Dispatchers.Default) {
            delay(1000)
            "result"
        }
        
        assertEquals("result", result)
    }
    
    @Test
    fun `test flow`() = runTest {
        val flow = flow {
            emit(1)
            emit(2)
            emit(3)
        }
        
        val results = flow.toList()
        assertEquals(listOf(1, 2, 3), results)
    }
    
    @Test
    fun `test StateFlow`() = runTest {
        val stateFlow = MutableStateFlow(0)
        
        stateFlow.value = 1
        assertEquals(1, stateFlow.value)
        
        stateFlow.value = 2
        assertEquals(2, stateFlow.value)
    }
}
```

### 4.3 测试 ViewModel

```kotlin
class LoginViewModelTest {
    
    private lateinit var viewModel: LoginViewModel
    private lateinit var authRepository: AuthRepository
    
    @Before
    fun setup() {
        authRepository = mockk()
        viewModel = LoginViewModel(authRepository)
    }
    
    @Test
    fun `login success should update uiState`() = runTest {
        // Given
        val user = User(id = 1, username = "admin")
        every { authRepository.login(any(), any()) } 
            returns Result.success(user)
        
        // When
        viewModel.login("admin", "password123")
        
        // Then
        val uiState = viewModel.uiState.value
        assertTrue(uiState is UiState.Success)
        assertEquals(user, (uiState as UiState.Success).user)
    }
    
    @Test
    fun `login failure should update uiState with error`() = runTest {
        // Given
        every { authRepository.login(any(), any()) } 
            returns Result.failure(Exception("Login failed"))
        
        // When
        viewModel.login("admin", "wrong")
        
        // Then
        val uiState = viewModel.uiState.value
        assertTrue(uiState is UiState.Error)
    }
}
```

### 4.4 测试 Repository

```kotlin
class UserRepositoryTest {
    
    private lateinit var repository: UserRepository
    private lateinit var apiService: ApiService
    private lateinit var userDao: UserDao
    private lateinit var preferences: Preferences
    
    @Before
    fun setup() {
        apiService = mockk()
        userDao = mockk()
        preferences = mockk()
        repository = UserRepository(apiService, userDao, preferences)
    }
    
    @Test
    fun `getUsers should fetch from network and cache to database`() = runTest {
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
    fun `getUserById should return cached user`() = runTest {
        // Given
        val user = User(1, "user1")
        coEvery { userDao.getUserById(1) } returns user
        
        // When
        val result = repository.getUserById(1)
        
        // Then
        assertEquals(user, result)
    }
}
```

### 4.5 测试 Use Case

```kotlin
// Use Case
class LoginUseCase(
    private val userRepository: UserRepository,
    private val tokenManager: TokenManager
) {
    suspend operator fun invoke(username: String, password: String): Result<Unit> {
        return userRepository.login(username, password)
            .onSuccess { user ->
                tokenManager.saveToken(user.token)
            }
    }
}

// Test
class LoginUseCaseTest {
    
    private lateinit var useCase: LoginUseCase
    private lateinit var userRepository: UserRepository
    private lateinit var tokenManager: TokenManager
    
    @Before
    fun setup() {
        userRepository = mockk()
        tokenManager = mockk()
        useCase = LoginUseCase(userRepository, tokenManager)
    }
    
    @Test
    fun `invoke with valid credentials should save token`() = runTest {
        // Given
        val user = User(id = 1, username = "admin", token = "token123")
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

---

## 5. 测试最佳实践

### 5.1 AAA 模式

```kotlin
@Test
fun `test with AAA pattern`() {
    // Arrange - 准备测试数据
    val user = User(id = 1, username = "test")
    every { userRepository.findById(1) } returns user
    
    // Act - 执行被测操作
    val result = userService.getUser(1)
    
    // Assert - 验证结果
    assertEquals(user, result)
    verify { userRepository.findById(1) }
}
```

### 5.2 测试命名规范

```kotlin
// ✅ 好的命名 - 清晰表达意图
@Test
fun `login with valid credentials should return success`() {}

@Test
fun `login with empty password should return error`() {}

@Test
fun `getUsers when network fails should return cached data`() {}

// ❌ 不好的命名 - 过于简单
@Test
fun testLogin() {}

@Test
fun test1() {}

@Test
fun testGetUsers() {}
```

### 5.3 测试独立性

```kotlin
// ✅ 每个测试独立
class IndependentTests {
    
    @BeforeEach
    fun setup() {
        // 每个测试都有独立的初始化
        repository = InMemoryRepository()
    }
    
    @Test
    fun test1() {
        // 不依赖其他测试的状态
    }
    
    @Test
    fun test2() {
        // 不依赖其他测试的状态
    }
}

// ❌ 测试之间有依赖
class DependentTests {
    
    private var counter = 0
    
    @Test
    fun test1() {
        counter++ // 影响 test2
    }
    
    @Test
    fun test2() {
        assertEquals(2, counter) // 依赖 test1 执行
    }
}
```

### 5.4 测试覆盖率

```gradle
// 配置 JaCoCo 覆盖率
apply plugin: 'jacoco'

jacoco {
    toolVersion = "0.8.11"
}

tasks.create(name: "jacocoTestReport", type: JacocoReport, dependsOn: ['testDebugUnitTest']) {
    reports {
        xml.required = true
        html.required = true
    }
    
    def fileFilter = [
        '**/R.class',
        '**/R$*.class',
        '**/BuildConfig.*',
        '**/Manifest*.*',
        '**/*Test*.*',
        'android/**/*.*'
    ]
    
    def debugTree = fileTree(dir: "$buildDir/tmp/kotlin-classes/debug", excludes: fileFilter)
    def mainSrc = "$project.projectDir/src/main/java"
    
    sourceDirectories.setFrom(files([mainSrc]))
    classDirectories.setFrom(files([debugTree]))
    executionData.setFrom(fileTree(dir: "$buildDir", includes: [
        'jacoco/testDebugUnitTest.exec',
        'outputs/code-coverage/debugAndroidTest/connected/*.ec'
    ]))
}
```

### 5.5 测试反模式

```kotlin
// ❌ 反模式 1：测试逻辑过于复杂
@Test
fun testComplex() {
    // 100 行测试代码...
    // 难以理解和维护
}

// ✅ 应该拆分为多个小测试
@Test
fun `test scenario 1`() {}

@Test
fun `test scenario 2`() {}

@Test
fun `test scenario 3`() {}

// ❌ 反模式 2：测试依赖顺序
@Test
fun test1() { /* 必须先执行 */ }

@Test
fun test2() { /* 依赖 test1 */ }

// ✅ 每个测试应该独立
@Test
fun testIndependent1() { /* 独立 */ }

@Test
fun testIndependent2() { /* 独立 */ }

// ❌ 反模式 3：测试生产代码
@Test
fun testGetter() {
    assertEquals("value", object.value) // 测试 trivial 代码
}

// ✅ 测试行为而非实现
@Test
fun `object should return formatted value`() {
    // 测试有意义的业务逻辑
}

// ❌ 反模式 4：忽略异常
@Test
fun testIgnored() {
    try {
        // 可能抛出异常的代码
    } catch (e: Exception) {
        // 忽略异常
    }
}

// ✅ 使用 assertThrows
@Test
fun `should throw exception`() {
    assertThrows<IllegalArgumentException> {
        // 应该抛出异常的代码
    }
}
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: 单元测试的好处是什么？**

```
答案要点：
- 快速反馈（几秒内知道代码是否工作）
- 文档作用（测试即文档）
- 重构保障（修改代码后确保功能正常）
- 设计指导（TDD 驱动更好的设计）
- 减少 bug（早期发现问题）
```

**Q2: JUnit4 和 JUnit5 的区别？**

```
答案要点：
- JUnit5 采用模块化设计（Platform + Jupiter + Vintage）
- JUnit5 支持更多注解（@BeforeAll, @AfterAll, @Nested 等）
- JUnit5 断言 API 更丰富（assertThrows, assertAll 等）
- JUnit5 参数化测试更灵活（@ValueSource, @CsvSource 等）
- JUnit5 支持扩展模型（@ExtendWith）
- JUnit5 支持动态测试（@TestFactory）
```

**Q3: 如何测试协程代码？**

```kotlin
// 使用 runTest
@Test
fun testCoroutine() = runTest {
    val result = async { fetchData() }.await()
    assertEquals("expected", result)
}

// 使用虚拟时间
@Test
fun testWithVirtualTime() = runTest {
    advanceTimeBy(1000) // 快进时间
    val result = withContext(Dispatchers.Default) {
        delay(1000)
        "result"
    }
    assertEquals("result", result)
}
```

### 6.2 实战问题

**Q4: 如何 Mock 依赖？**

```kotlin
// 使用 MockK
val repository = mockk<UserRepository>()
every { repository.findById(1) } returns User(1, "test")

// 验证调用
verify { repository.findById(1) }

// 验证调用次数
verify(exactly = 1) { repository.findById(1) }

// 验证未调用
verify(exactly = 0) { repository.delete(any()) }
```

**Q5: 如何测试 ViewModel？**

```kotlin
@Test
fun `login should update uiState`() = runTest {
    // Given
    every { authRepository.login(any(), any()) } 
        returns Result.success(user)
    
    // When
    viewModel.login("admin", "password")
    
    // Then
    val uiState = viewModel.uiState.value
    assertTrue(uiState is UiState.Success)
}
```

**Q6: 什么是测试金字塔？**

```
        /\
       /  \
      / E2E \     ← 端到端测试（少量，慢，脆弱）
     /--------\
    /Integration\  ← 集成测试（适量）
   /--------------\
  /    Unit Tests   \ ← 单元测试（大量，快，稳定）
 /____________________\

原则：
- 底层（单元测试）最多
- 中层（集成测试）适量
- 顶层（E2E 测试）最少
```

### 6.3 高级问题

**Q7: 如何测试私有方法？**

```
答案要点：
- 不应该直接测试私有方法
- 私有方法是实现细节
- 通过测试公共方法间接测试
- 如果私有方法复杂，考虑提取为独立类
```

**Q8: 什么是 TDD？**

```
TDD (Test-Driven Development) 流程：
1. Red - 写一个失败的测试
2. Green - 写最少的代码让测试通过
3. Refactor - 重构代码，保持测试通过

好处：
- 确保测试覆盖率
- 驱动更好的设计
- 减少 bug
- 提供文档
```

**Q9: 如何处理测试中的异步代码？**

```kotlin
// 使用 CountDownLatch
@Test
fun testAsync() {
    val latch = CountDownLatch(1)
    var result: String? = null
    
    asyncOperation { data ->
        result = data
        latch.countDown()
    }
    
    latch.await(5, TimeUnit.SECONDS)
    assertEquals("expected", result)
}

// 使用协程测试
@Test
fun testAsyncWithCoroutine() = runTest {
    val result = asyncOperation()
    assertEquals("expected", result)
}
```

---

## 参考资料

- [JUnit5 官方文档](https://junit.org/junit5/docs/current/user-guide/)
- [MockK 文档](https://mockk.io/)
- [Kotlin 协程测试](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)
- [Android 测试指南](https://developer.android.com/training/testing)

---

*本文完，感谢阅读！*
