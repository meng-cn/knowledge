# 04 Koin 依赖注入框架 📦

> Kotlin 原生的轻量级依赖注入框架，无需代码生成

---

## 一、Koin 基础概述

### 1.1 什么是 Koin？

Koin 是一个纯 Kotlin 开发的轻量级依赖注入框架，专为 Kotlin 和 Android 设计。

```
Koin 核心特点：
- 纯 Kotlin 编写，Kotlin 友好
- 无需代码生成（无注解处理）
- 运行时依赖解析
- DSL 语法，简洁易读
- 学习曲线平缓
- 支持 Android 和 Kotlin Multiplatform
```

### 1.2 Koin vs Hilt vs Dagger

| 特性 | Koin | Hilt | Dagger 2 |
|------|------|------|----------|
| **类型** | 运行时 DI | 编译时 DI | 编译时 DI |
| **代码生成** | 无 | 有 | 有 |
| **注解** | 少量 | 大量 | 大量 |
| **学习曲线** | 低 | 中 | 高 |
| **性能** | 中 | 高 | 高 |
| **类型安全** | 运行时 | 编译时 | 编译时 |
| **多平台** | ✅ | ❌ | 部分 |
| **Android 集成** | 手动 | 自动 | 手动 |
| **包大小** | 小 | 中 | 大 |

```kotlin
// ==== Koin 方式（简洁）====

// 定义模块
val appModule = module {
    single { ApiService() }
    single { UserRepository(get()) }
    viewModel { MainViewModel(get()) }
}

// 启动 Koin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}

// 使用
class MainActivity : AppCompatActivity() {
    val viewModel: MainViewModel by viewModel()
    val repository: UserRepository by inject()
}

// ==== Hilt 方式（标准化）====

@HiltAndroidApp
class MyApplication : Application()

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var viewModel: MainViewModel
}

// ==== Dagger 2 方式（复杂）====

@Component(modules = [AppModule::class])
interface AppComponent {
    fun inject(application: MyApplication)
}

class MyApplication : Application() {
    lateinit var component: AppComponent
    
    override fun onCreate() {
        super.onCreate()
        component = DaggerAppComponent.create()
        component.inject(this)
    }
}
```

### 1.3 Koin 的设计哲学

```
1. 简洁优先（Simplicity First）
   - 无需注解处理
   - DSL 语法直观
   - 快速上手

2. Kotlin 优先（Kotlin First）
   - 纯 Kotlin 编写
   - 利用 Kotlin 特性
   - Kotlin Multiplatform 支持

3. 实用主义（Pragmatism）
   - 不追求完美架构
   - 解决实际问题
   - 灵活可扩展

4. 轻量级（Lightweight）
   - 最小依赖
   - 小包大小
   - 低学习成本
```

---

## 二、Koin DSL 语法详解

### 2.1 module 定义

`module` 是 Koin 定义依赖的基本单元。

```kotlin
// ==== 基础 module ====

val appModule = module {
    // 定义依赖
}

// ==== 多个 module ====

val networkModule = module {
    // 网络相关依赖
}

val databaseModule = module {
    // 数据库相关依赖
}

val repositoryModule = module {
    // 仓库相关依赖
}

// 组合使用
val appModules = listOf(
    networkModule,
    databaseModule,
    repositoryModule
)

// ==== 命名 module（Koin 3.1+）====

val networkModule = module("network") {
    single { ApiService() }
}

// 可以通过名称引用
```

### 2.2 single - 单例定义

`single` 定义单例依赖，整个应用生命周期内只有一个实例。

```kotlin
val appModule = module {
    
    // ✅ 基础单例
    single { ApiService() }
    
    // ✅ 带依赖的单例
    single { UserRepository(get()) }
    
    // ✅ 多依赖
    single { 
        DataRepository(
            api = get(),
            database = get(),
            preferences = get()
        )
    }
    
    // ✅ 使用命名参数
    single { 
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    // ✅ 带标签的单例
    single("base_url") { "https://api.example.com" }
    single("cdn_url") { "https://cdn.example.com" }
    
    // ✅ 带作用域的单例（后面详述）
    single { Logger() }
}

// ==== 使用 ====

class MainActivity : AppCompatActivity() {
    // 获取单例
    val api: ApiService by inject()
    val repository: UserRepository by inject()
}
```

### 2.3 factory - 工厂模式

`factory` 每次获取都创建新实例。

```kotlin
val appModule = module {
    
    // ✅ 基础工厂
    factory { Logger() }  // 每次 inject 都创建新 Logger
    
    // ✅ 带参数的工厂
    factory { (name: String) -> 
        Logger(name)
    }
    
    // ✅ 混用 single 和 factory
    single { ApiService() }  // 单例
    factory { RequestHandler(get()) }  // 每次新实例
}

// ==== 使用 ====

class Example @Inject constructor() {
    // 每次都是新实例
    val logger1: Logger by inject()
    val logger2: Logger by inject()
    // logger1 != logger2
}

// ==== 带参数的工厂使用 ====

// 定义
val module = module {
    factory { (name: String) -> Logger(name) }
}

// 使用
class Example {
    val logger: Logger by inject { parametersOf("MyLogger") }
}
```

### 2.4 viewModel - ViewModel 定义

`viewModel` 专为 Android ViewModel 设计。

```kotlin
// ==== 基础 ViewModel ====

val viewModelModule = module {
    viewModel { MainViewModel(get()) }
    viewModel { DetailViewModel(get(), get()) }
}

// ==== 带 SavedStateHandle 的 ViewModel ====

val viewModelModule = module {
    viewModel { (handle: SavedStateHandle) ->
        MainViewModel(handle, get())
    }
}

// ==== 使用 ====

@AndroidEntryPoint  // 如果用 Hilt
class MainActivity : AppCompatActivity() {
    // Koin 方式
    val viewModel: MainViewModel by viewModel()
    
    // 带 SavedStateHandle
    val viewModel: MainViewModel by viewModel {
        parametersOf(SavedStateHandle())
    }
}

// ==== Fragment 中使用 ====

@AndroidEntryPoint
class MainFragment : Fragment() {
    // 与 Activity 共享 ViewModel
    val viewModel: MainViewModel by sharedViewModel()
    
    // Fragment 独立 ViewModel
    val fragmentViewModel: DetailViewModel by viewModel()
}
```

### 2.5 scoped - 作用域定义

`scope` 定义特定作用域内的依赖。

```kotlin
// ==== 基础作用域 ====

val appModule = module {
    scope(named("session")) {
        scoped { UserManager() }
        scoped { SessionManager() }
    }
}

// ==== 创建和使用作用域 ====

class SessionManager {
    fun startSession() {
        // 创建作用域
        val sessionScope = KoinApplication.init().koin.createScope(
            scopeId = "session_123",
            scopeName = named("session")
        )
        
        // 获取作用域内的依赖
        val userManager = sessionScope.get<UserManager>()
        val sessionManager = sessionScope.get<SessionManager>()
        
        // 使用...
        
        // 关闭作用域
        sessionScope.close()
    }
}

// ==== Android 中的作用域 ====

class MainActivity : AppCompatActivity() {
    private var activityScope: Scope? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 创建 Activity 作用域
        activityScope = KoinApplication.init().koin.createScope(
            scopeId = "activity_${this}",
            scopeName = named("activity")
        )
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // 关闭作用域，释放依赖
        activityScope?.close()
    }
}
```

---

## 三、作用域（Scope）管理

### 3.1 作用域类型

```kotlin
// ==== 内置作用域 ====

// 1. 无作用域（默认）
// - single: 应用生命周期
// - factory: 每次创建

// 2. 自定义作用域
val appModule = module {
    scope(named("user_session")) {
        scoped { UserProfile() }
        scoped { UserPreferences() }
    }
    
    scope(named("activity")) {
        scoped { ActivityNavigator() }
    }
}

// ==== 作用域层次 ====

/*
┌─────────────────────────────────────┐
│         Application Scope           │  @Singleton / single
│         (应用生命周期)               │
├─────────────────────────────────────┤
│         User Session Scope          │  自定义作用域
│         (用户登录期间)               │
├─────────────────────────────────────┤
│         Activity Scope              │  自定义作用域
│         (Activity 生命周期)          │
├─────────────────────────────────────┤
│         ViewModel Scope             │  viewModel
│         (ViewModel 生命周期)         │
└─────────────────────────────────────┘
*/
```

### 3.2 作用域创建和管理

```kotlin
// ==== 定义作用域模块 ====

val scopeModule = module {
    // 用户会话作用域
    scope(named("user_session")) {
        scoped { UserProfile(get()) }
        scoped { UserSettings(get()) }
        viewModel { UserViewModel(get(), get()) }
    }
    
    // 购物车作用域
    scope(named("cart")) {
        scoped { CartManager() }
        scoped { CartRepository(get()) }
    }
}

// ==== 管理作用域生命周期 ====

class SessionManager @Inject constructor() {
    private var sessionScope: Scope? = null
    
    fun login(username: String, password: String) {
        // 登录成功，创建会话作用域
        sessionScope = KoinApplication.init().koin.createScope(
            scopeId = "session_${username}",
            scopeName = named("user_session"),
            scopeDefinition = {
                // 可以传入参数
                it.parameters {
                    add("username" to username)
                }
            }
        )
    }
    
    fun logout() {
        // 登出，销毁会话作用域
        sessionScope?.close()
        sessionScope = null
    }
    
    fun getUserProfile(): UserProfile {
        return sessionScope?.get() 
            ?: throw IllegalStateException("No active session")
    }
}

// ==== Android Activity 作用域 ====

abstract class ScopedActivity : AppCompatActivity() {
    protected var activityScope: Scope? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 创建 Activity 作用域
        activityScope = koin.createScope(
            scopeId = "activity_${this.javaClass.simpleName}",
            scopeName = named("activity")
        )
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // 销毁作用域
        activityScope?.close()
        activityScope = null
    }
}

class MainActivity : ScopedActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 获取作用域内的依赖
        val navigator = activityScope?.get<ActivityNavigator>()
    }
}
```

### 3.3 作用域嵌套

```kotlin
// ==== 作用域可以嵌套 ====

val appModule = module {
    // 外层作用域
    scope(named("parent")) {
        scoped { ParentService() }
        
        // 内层作用域
        scope(named("child")) {
            scoped { ChildService(get()) }  // 可以访问父作用域依赖
        }
    }
}

// ==== 使用嵌套作用域 ====

val koin = startKoin {
    modules(appModule)
}.koin

// 创建父作用域
val parentScope = koin.createScope("parent", named("parent"))

// 创建子作用域
val childScope = parentScope.createScope("child", named("child"))

// 子作用域可以获取父作用域的依赖
val parentService = childScope.get<ParentService>()  // ✅ 可以
val childService = childScope.get<ChildService>()    // ✅ 可以

// 清理
childScope.close()
parentScope.close()
```

---

## 四、ViewModel 集成

### 4.1 基础 ViewModel 集成

```kotlin
// ==== 定义 ViewModel 模块 ====

val viewModelModule = module {
    // 基础 ViewModel
    viewModel { MainViewModel(get()) }
    
    // 带多个依赖
    viewModel { 
        DetailViewModel(
            repository = get(),
            navigator = get(),
            analytics = get()
        )
    }
}

// ==== Activity 中使用 ====

class MainActivity : AppCompatActivity() {
    
    // 方式 1：by viewModel()
    private val mainViewModel: MainViewModel by viewModel()
    
    // 方式 2：get()
    private val detailViewModel: DetailViewModel = get()
    
    // 方式 3：inject()
    private val anotherViewModel: AnotherViewModel by inject()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 观察数据
        mainViewModel.data.observe(this) { data ->
            // 更新 UI
        }
    }
}

// ==== Fragment 中使用 ====

class MainFragment : Fragment() {
    
    // Fragment 独立 ViewModel
    private val fragmentViewModel: FragmentViewModel by viewModel()
    
    // 与 Activity 共享 ViewModel
    private val sharedViewModel: MainViewModel by sharedViewModel()
    
    // 父 Fragment 的 ViewModel
    private val parentViewModel: ParentViewModel by parentViewModel()
}
```

### 4.2 带参数的 ViewModel

```kotlin
// ==== 定义带参数的 ViewModel ====

val viewModelModule = module {
    viewModel { (productId: String) ->
        ProductViewModel(productId, get())
    }
    
    viewModel { (handle: SavedStateHandle) ->
        SavedStateViewModel(handle, get())
    }
}

// ==== 使用带参数的 ViewModel ====

class ProductActivity : AppCompatActivity() {
    
    private val viewModel: ProductViewModel by viewModel {
        parametersOf("product_123")
    }
}

// ==== 使用 SavedStateHandle ====

val viewModelModule = module {
    viewModel { (handle: SavedStateHandle) ->
        MainViewModel(handle, get())
    }
}

class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModel()
    // SavedStateHandle 自动注入
}

// ==== 多个参数 ====

val viewModelModule = module {
    viewModel { (productId: String, categoryId: String) ->
        ProductDetailViewModel(productId, categoryId, get())
    }
}

class ProductDetailActivity : AppCompatActivity() {
    private val viewModel: ProductDetailViewModel by viewModel {
        parametersOf("product_123", "category_456")
    }
}
```

### 4.3 ViewModel 与 Hilt 对比

```kotlin
// ==== Koin ViewModel ====

// 定义
val viewModelModule = module {
    viewModel { MainViewModel(get()) }
    viewModel { (handle: SavedStateHandle) -> 
        SavedStateViewModel(handle, get())
    }
}

// 使用
class MainActivity : AppCompatActivity() {
    val vm: MainViewModel by viewModel()
    val savedVm: SavedStateViewModel by viewModel()
}

// ==== Hilt ViewModel ====

// 定义
@HiltViewModel
class MainViewModel @Inject constructor(
    repository: Repository
) : ViewModel()

// 使用
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var vm: MainViewModel
    // 或
    val vm: MainViewModel by viewModels()
}

// ==== 对比 ====

/*
Koin 优势：
- 更简洁的定义
- 无需注解
- 参数传递更灵活

Hilt 优势：
- 编译时检查
- 与 Android 深度集成
- 官方支持
*/
```

---

## 五、Android 模块配置

### 5.1 androidApplication

`androidApplication` 配置 Application 级别的设置。

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        startKoin {
            // 配置 Android Application
            androidApplication(this@MyApplication)
            
            // 配置模块
            modules(listOf(
                appModule,
                networkModule,
                databaseModule,
                viewModelModule
            ))
            
            // 其他配置
            androidLogger(Level.DEBUG)
            allowOverride(true)
        }
    }
}
```

### 5.2 androidLogger

`androidLogger` 配置 Koin 的日志输出。

```kotlin
import org.koin.android.ext.koin.androidLogger
import org.koin.core.logger.Level

startKoin {
    // ✅ 显示所有日志
    androidLogger(Level.DEBUG)
    
    // ✅ 只显示错误
    androidLogger(Level.ERROR)
    
    // ✅ 不显示日志（生产环境）
    // androidLogger()  // 默认不输出
    
    // ✅ 自定义日志
    androidLogger(object : AndroidLogger(Level.DEBUG) {
        override fun log(level: Level, msg: String) {
            // 自定义日志处理
            Log.d("Koin", msg)
        }
    })
}
```

### 5.3 androidContext

`androidContext` 提供 Android Context。

```kotlin
startKoin {
    // ✅ 使用 Application Context（推荐）
    androidContext(this@MyApplication)
    
    // ✅ 也可以单独使用
    // androidContext(applicationContext)
    
    modules(appModule)
}

// ==== 在 Module 中使用 Context ====

val appModule = module {
    
    // 获取 Context
    single { 
        SharedPreferencesManager(get())  // get() 返回 Context
    }
    
    // 使用 Application Context
    single { 
        Database.getInstance(get())  // 推荐用于单例
    }
    
    // 注意：不要在单例中使用 Activity Context
    // single { SomeClass(get<Activity>()) }  // ❌ 内存泄漏
}
```

### 5.4 完整的 Android 配置

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        startKoin {
            // Android 配置
            androidApplication(this@MyApplication)
            androidLogger(if (BuildConfig.DEBUG) Level.DEBUG else Level.ERROR)
            
            // 模块
            modules(listOf(
                // 网络模块
                module {
                    single { 
                        Retrofit.Builder()
                            .baseUrl(BuildConfig.BASE_URL)
                            .addConverterFactory(GsonConverterFactory.create())
                            .build()
                    }
                    single { get<Retrofit>().create(ApiService::class.java) }
                },
                
                // 数据库模块
                module {
                    single { 
                        Room.databaseBuilder(
                            androidContext(),
                            AppDatabase::class.java,
                            "app.db"
                        ).build()
                    }
                    single { get<AppDatabase>().userDao() }
                },
                
                // 仓库模块
                module {
                    single { UserRepository(get(), get()) }
                    single { OrderRepository(get(), get()) }
                },
                
                // ViewModel 模块
                module {
                    viewModel { MainViewModel(get()) }
                    viewModel { DetailViewModel(get()) }
                }
            ))
            
            // 属性覆盖（用于测试）
            allowOverride(true)
        }
    }
}
```

---

## 六、属性注入 vs 构造函数注入

### 6.1 属性注入（Field Injection）

Koin 支持属性注入，这是 Koin 的特色之一。

```kotlin
// ==== 基础属性注入 ====

class MainActivity : AppCompatActivity() {
    
    // ✅ 延迟注入
    val repository: UserRepository by inject()
    val viewModel: MainViewModel by viewModel()
    
    // ✅ 带限定符的注入
    val baseUrl: String by inject("base_url")
    val cdnUrl: String by inject("cdn_url")
    
    // ✅ 带默认值
    val logger: Logger by injectOrNull()  // 可以为 null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 现在可以使用注入的依赖
        repository.loadData()
    }
}

// ==== Fragment 中的属性注入 ====

class MainFragment : Fragment() {
    
    // Activity 的 ViewModel
    val sharedViewModel: MainViewModel by sharedViewModel()
    
    // Fragment 的 ViewModel
    val fragmentViewModel: DetailViewModel by viewModel()
    
    // 普通依赖
    val repository: UserRepository by inject()
}

// ==== 自定义 View 中的属性注入 ====

class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {
    
    val tracker: ViewTracker by inject()
    
    init {
        tracker.trackView(this)
    }
}
```

### 6.2 构造函数注入

Koin 也支持构造函数注入，需要配合 `inject()` 使用。

```kotlin
// ==== 基础构造函数注入 ====

class UserRepository @Inject constructor(
    private val api: ApiService,
    private val dao: UserDao
) {
    // 依赖通过构造函数注入
}

// ==== Koin 中注册 ====

val appModule = module {
    single { ApiService() }
    single { UserDao() }
    single { UserRepository(get(), get()) }  // 手动传入
}

// ==== 使用 inject() 函数 ====

// 对于非 Android 类，可以使用 inject()
class ServiceClass {
    constructor() {
        // 手动获取依赖
        val repository = KoinApplication.init().koin.get<UserRepository>()
    }
}

// ==== 推荐：在 Module 中定义 ====

val appModule = module {
    // 构造函数注入的类在 Module 中定义
    single { 
        ComplexClass(
            dep1 = get(),
            dep2 = get(),
            dep3 = get()
        )
    }
}
```

### 6.3 两种注入方式对比

```kotlin
// ==== 属性注入 ====

// 优点：
// - 简洁，代码少
// - 适合 Android 类（Activity、Fragment）
// - Koin 特色功能

// 缺点：
// - 依赖不明显
// - 难以测试
// - 可能为 null（如果忘记初始化）

class MainActivity : AppCompatActivity() {
    val repository: UserRepository by inject()  // 简洁
    
    // 风险：如果在 onCreate 之前访问会崩溃
}

// ==== 构造函数注入 ====

// 优点：
// - 依赖明确
// - 不可变（val）
// - 易于测试

// 缺点：
// - 代码较多
// - Android 类需要额外配置

class UserRepository @Inject constructor(
    private val api: ApiService  // 明确
)

// ==== 推荐实践 ====

/*
Android 类（Activity、Fragment、Service）:
- 使用属性注入
- 利用 Koin 的扩展函数

普通 Kotlin 类:
- 使用构造函数注入
- 在 Module 中定义依赖

ViewModel:
- 使用构造函数注入
- 通过 viewModel {} 定义
*/
```

---

## 七、Koin 测试

### 7.1 单元测试配置

```kotlin
// ==== 测试依赖 ====

// build.gradle.kts
testImplementation("io.insert-koin:koin-test:3.3.0")
testImplementation("io.insert-koin:koin-test-junit4:3.3.0")
testImplementation("io.mockk:mockk:1.13.0")

// ==== 基础测试设置 ====

class MyUnitTest {
    
    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }
    
    @Test
    fun testDependencyInjection() {
        // 获取依赖
        val repository = get<UserRepository>()
        
        // 测试
        assertNotNull(repository)
    }
}

// ==== 使用 Mock ====

class RepositoryTest {
    
    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            // 使用 Mock 替换真实依赖
            single { mockk<ApiService>() }
            single { UserRepository(get()) }
        })
    }
    
    @Test
    fun testRepository() {
        val repository = get<UserRepository>()
        val mockApi = get<ApiService>()
        
        // 设置 Mock 行为
        every { mockApi.getUser(any()) } returns User("test")
        
        // 测试
        val user = repository.getUser(1)
        assertEquals("test", user.name)
    }
}
```

### 7.2 组件测试

```kotlin
// ==== Android 组件测试 ====

@RunWith(AndroidJUnit4::class)
class MainActivityTest {
    
    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(testModule)
    }
    
    @Test
    fun testActivityInjection() {
        val activityIntent = Intent(ApplicationProvider.getApplicationContext(), MainActivity::class.java)
        val scenario = ActivityScenario.launch(activityIntent)
        
        scenario.onActivity { activity ->
            // 测试注入的依赖
            assertNotNull(activity.repository)
        }
    }
}

// ==== ViewModel 测试 ====

class MainViewModelTest {
    
    private lateinit var viewModel: MainViewModel
    private lateinit var mockRepository: UserRepository
    
    @Before
    fun setup() {
        // 创建 Mock
        mockRepository = mockk()
        
        // 启动 Koin 测试
        startKoin {
            modules(module {
                single { mockRepository }
                viewModel { MainViewModel(get()) }
            })
        }
        
        // 获取 ViewModel
        viewModel = get()
    }
    
    @Test
    fun testLoadData() {
        // 设置 Mock
        every { mockRepository.getUsers() } returns listOf(User("test"))
        
        // 执行
        viewModel.loadData()
        
        // 验证
        verify { mockRepository.getUsers() }
    }
    
    @After
    fun tearDown() {
        stopKoin()
    }
}
```

### 7.3 依赖替换策略

```kotlin
// ==== 方式 1：使用 override ====

val testModule = module(override = true) {
    single { MockApiService() }  // 替换真实的 ApiService
    single { MockDatabase() }     // 替换真实的 Database
}

startKoin {
    modules(listOf(appModule, testModule))  // testModule 会覆盖 appModule
}

// ==== 方式 2：使用 allowOverride ====

startKoin {
    allowOverride(true)  // 允许覆盖
    
    modules(appModule)
    
    // 后续可以覆盖
    modules(module(override = true) {
        single { MockApiService() }
    })
}

// ==== 方式 3：使用 KoinTestRule ====

class MyTest {
    
    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            // 测试专用模块
            single { MockApiService() }
            single { UserRepository(get()) }
        })
    }
    
    @Test
    fun testWithMock() {
        val repository = get<UserRepository>()
        // 使用 Mock 的 repository 测试
    }
}
```

---

## 八、运行时 vs 编译时 DI 对比

### 8.1 核心差异

```
==== 编译时 DI（Dagger/Hilt）====

优点：
- 编译时检查依赖图
- 类型安全
- 高性能（无反射）
- IDE 实时错误提示

缺点：
- 学习曲线陡峭
- 需要注解处理
- 编译时间长
- 代码生成增加复杂度

==== 运行时 DI（Koin）====

优点：
- 学习曲线平缓
- 无需注解处理
- 编译时间短
- 代码简洁直观

缺点：
- 运行时才能发现错误
- 性能略低（反射/委托）
- 类型安全较弱
```

### 8.2 性能对比

```kotlin
// ==== 启动时间测试 ====

测试场景：初始化 DI 容器并获取 100 个依赖

Dagger 2:  ~5ms   (编译时生成代码)
Hilt:      ~5ms   (基于 Dagger 2)
Koin:      ~15ms  (运行时解析)

// ==== 内存占用 ====

Dagger 2:  基准
Koin:      +20%   (运行时元数据)

// ==== 包大小 ====

Dagger 2:  +500KB (生成的代码)
Koin:      +100KB (框架本身)
```

### 8.3 错误检测对比

```kotlin
// ==== 编译时 DI（Dagger）====

// ❌ 编译错误：依赖无法提供
@Component
interface AppComponent {
    fun getRepository(): UserRepository  // 编译错误！
}

// ✅ 编译时发现，无法通过编译

// ==== 运行时 DI（Koin）====

// ❌ 运行时错误：依赖未定义
val module = module {
    // 忘记定义 UserRepository
}

class MainActivity {
    val repository: UserRepository by inject()  // 运行时崩溃！
}

// ✅ 运行时发现，需要测试覆盖
```

### 8.4 选择建议

```
选择 Koin 的场景：
- 小型到中型项目
- 快速原型开发
- Kotlin Multiplatform 项目
- 团队对 DI 经验较少
- 追求开发效率

选择 Hilt/Dagger 的场景：
- 大型项目
- 对性能要求高
- 需要编译时保证
- Android 专属项目
- 团队有 DI 经验

混合使用：
- 不推荐（增加复杂度）
- 如果必须，明确边界
```

---

## 九、面试考点

### 9.1 基础问题

**Q1: Koin 和 Hilt 的主要区别？**

**A:**
```
类型：
- Koin: 运行时 DI
- Hilt: 编译时 DI

代码生成：
- Koin: 无
- Hilt: 有（基于 Dagger 2）

学习曲线：
- Koin: 低
- Hilt: 中

性能：
- Koin: 中等（运行时解析）
- Hilt: 高（编译时生成）

类型安全：
- Koin: 运行时检查
- Hilt: 编译时检查
```

**Q2: Koin 的核心 DSL 有哪些？**

**A:**
```kotlin
module {
    single { }      // 单例
    factory { }     // 工厂（每次新实例）
    viewModel { }   // ViewModel
    scope(named("")) { 
        scoped { }  // 作用域内单例
    }
}
```

**Q3: 如何在 Koin 中注入 ViewModel？**

**A:**
```kotlin
// 定义
val viewModelModule = module {
    viewModel { MainViewModel(get()) }
}

// 使用
class MainActivity : AppCompatActivity() {
    val viewModel: MainViewModel by viewModel()
}
```

### 9.2 进阶问题

**Q4: Koin 的作用域如何管理？**

**A:**
```kotlin
// 定义作用域
val module = module {
    scope(named("session")) {
        scoped { UserManager() }
    }
}

// 创建作用域
val scope = koin.createScope("id", named("session"))

// 获取依赖
val userManager = scope.get<UserManager>()

// 关闭作用域
scope.close()
```

**Q5: Koin 如何处理带参数的依赖？**

**A:**
```kotlin
// 定义
val module = module {
    viewModel { (productId: String) ->
        ProductViewModel(productId, get())
    }
}

// 使用
val viewModel: ProductViewModel by viewModel {
    parametersOf("product_123")
}
```

**Q6: Koin 测试如何配置？**

**A:**
```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    modules(testModule)
}

@Test
fun test() {
    val repository = get<UserRepository>()
    // 测试...
}
```

### 9.3 高级问题

**Q7: Koin 的运行时解析原理？**

**A:**
```
1. startKoin() 初始化 Koin 容器
2. 解析所有 module 定义
3. 构建依赖图（运行时）
4. 使用 Kotlin 委托（by inject()）获取依赖
5. 通过反射/委托创建实例

关键：
- 无代码生成
- 使用 Kotlin 语言特性
- 依赖图在内存中构建
```

**Q8: Koin 如何实现多平台支持？**

**A:**
```
Koin 核心是纯 Kotlin：
- koin-core: 核心功能（多平台）
- koin-android: Android 扩展
- koin-jvm: JVM 扩展
- koin-js: JavaScript 支持

Kotlin Multiplatform 项目：
commonMain {
    implementation("io.insert-koin:koin-core")
}

androidMain {
    implementation("io.insert-koin:koin-android")
}
```

**Q9: Koin 的内存泄漏风险？**

**A:**
```kotlin
// ❌ 风险：在单例中持有 Context
single { SomeClass(get<Activity>()) }  // 内存泄漏

// ✅ 正确：使用 Application Context
single { SomeClass(get()) }  // get() 返回 Application Context

// ✅ 正确：使用作用域
scope(named("activity")) {
    scoped { SomeClass(get()) }  // 随作用域销毁
}
```

**Q10: Koin 适合什么类型的项目？**

**A:**
```
适合 Koin：
- 小型到中型项目
- 快速开发
- Kotlin Multiplatform
- 团队 DI 经验少
- 追求开发效率

不适合 Koin：
- 超大型项目
- 对编译时检查要求高
- 性能敏感场景
- 需要严格架构规范
```

---

## 十、最佳实践和常见错误

### 10.1 最佳实践 ✅

```kotlin
// 1. 模块化定义
val networkModule = module { /* ... */ }
val databaseModule = module { /* ... */ }
val viewModelModule = module { /* ... */ }

// 2. 使用 Application Context
single { Repository(get()) }  // get() 返回 Application Context

// 3. ViewModel 使用 viewModel{}
viewModel { MainViewModel(get()) }

// 4. 作用域管理
scope(named("session")) {
    scoped { UserManager() }
}

// 5. 测试使用 KoinTestRule
@get:Rule
val koinTestRule = KoinTestRule.create { modules(testModule) }

// 6. 生产环境关闭日志
androidLogger(Level.ERROR)  // 或完全不配置
```

### 10.2 常见错误 ❌

```kotlin
// 1. 忘记启动 Koin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // 忘记 startKoin { }  // ❌
    }
}

// 2. 在单例中使用 Activity Context
single { SomeClass(get<Activity>()) }  // ❌ 内存泄漏

// 3. 忘记关闭作用域
val scope = koin.createScope("id", named("session"))
// 忘记 scope.close()  // ❌ 内存泄漏

// 4. 参数类型不匹配
viewModel { (id: Int) -> ViewModel(id, get()) }
val vm: ViewModel by viewModel { parametersOf("string") }  // ❌ 运行时错误

// 5. 循环依赖
single { A(get()) }
single { B(get()) }  // ❌ 如果 A 需要 B，B 需要 A
```

---

## 十一、参考资料

### 官方文档
- [Koin 官方文档](https://insert-koin.io/)
- [Koin GitHub](https://github.com/InsertKoinIO/koin)
- [Koin 快速开始](https://insert-koin.io/docs/quickstart)

### 进阶阅读
- [Koin vs Dagger](https://medium.com/@ntbnyng/koin-vs-dagger-which-one-to-choose)
- [Koin 最佳实践](https://proandroiddev.com/koin-best-practices)
- [Koin 多平台支持](https://insert-koin.io/docs/reference/koin-core/mp)

### 视频资源
- [Koin 官方教程](https://www.youtube.com/results?search_query=koin+dependency+injection)
- [KotlinConf Koin 演讲](https://www.youtube.com/results?search_query=kotlinconf+koin)

---

**🔗 上一篇**: [Dagger 2 详解](03_Dagger 2.md)
**🔗 下一篇**: [作用域管理](05_作用域管理.md)
