# 02 Hilt 依赖注入框架详解 🔧

> Google 官方推荐的 Android 依赖注入框架，基于 Dagger 2 构建

---

## 一、Hilt 框架基础

### 1.1 什么是 Hilt？

Hilt 是 Google 专为 Android 开发的依赖注入框架，基于 Dagger 2 构建。它简化了 Dagger 的使用，提供了标准化的 DI 实现方式。

```
Hilt = Dagger 2 + Android 标准化 + 简化配置

核心优势：
- 减少样板代码
- 标准化的组件层次
- 与 Android 生命周期深度集成
- 编译时依赖检查
- 官方支持和维护
```

### 1.2 Hilt vs Dagger 2

| 特性 | Dagger 2 | Hilt |
|------|----------|------|
| **配置复杂度** | 高（手动创建 Component） | 低（自动生成） |
| **Android 集成** | 手动 | 自动 |
| **组件层次** | 自定义 | 标准化 |
| **学习曲线** | 陡峭 | 平缓 |
| **代码量** | 多 | 少 |
| **灵活性** | 高 | 中等 |

```kotlin
// ==== Dagger 2 方式（复杂）====

@Component(modules = [AppModule::class])
interface AppComponent {
    fun inject(application: MyApplication)
    fun inject(activity: MainActivity)
    
    @Component.Factory
    interface Factory {
        fun create(@BindsInstance app: Application): AppComponent
    }
}

class MyApplication : Application() {
    lateinit var appComponent: AppComponent
        private set
    
    override fun onCreate() {
        super.onCreate()
        appComponent = DaggerAppComponent.factory().create(this)
        appComponent.inject(this)
    }
}

// ==== Hilt 方式（简洁）====

@HiltAndroidApp
class MyApplication : Application()

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var repository: UserRepository
}
```

### 1.3 Hilt 的核心设计思想

```
1. 标准化（Standardization）
   - 定义标准的组件层次
   - 减少决策成本

2. 自动化（Automation）
   - 自动生成 Component
   - 自动绑定 Android 类

3. 集成化（Integration）
   - 与 Android 生命周期深度集成
   - 与 Jetpack 组件无缝配合

4. 编译时安全（Compile-time Safety）
   - 编译时检查依赖图
   - 减少运行时错误
```

---

## 二、Hilt 基础注解

### 2.1 @HiltAndroidApp

`@HiltAndroidApp` 是 Hilt 的入口注解，用于 Application 类。

```kotlin
// ✅ 标准用法
@HiltAndroidApp
class MyApplication : Application() {
    // Hilt 会生成 Hilt_MyApplication
    // 自动创建 ApplicationComponent
}
```

**@HiltAndroidApp 做了什么？**

1. 触发 Hilt 代码生成
2. 创建 `ApplicationComponent`（单例作用域）
3. 生成 `Hilt_<ApplicationName>` 基类
4. 提供依赖注入的入口点

```kotlin
// 生成的代码（简化版）
@Generated("dagger.hilt.processor")
public abstract class Hilt_MyApplication extends MyApplication implements GeneratedComponentManagerHolder {
    private boolean injected = false;
    
    @Override
    public Object onUninject() {
        if (!this.injected) {
            this.injected = true;
        }
        return null;
    }
    
    // ... 自动生成的组件代码
}
```

**注意事项：**

```kotlin
// ❌ 错误：Application 必须继承 android.app.Application
@HiltAndroidApp
class MyApplication : AppCompatActivity()  // 编译错误！

// ❌ 错误：不能忘记 @HiltAndroidApp
class MyApplication : Application()  // Hilt 不会工作

// ✅ 正确
@HiltAndroidApp
class MyApplication : Application()
```

### 2.2 @AndroidEntryPoint

`@AndroidEntryPoint` 标记可以被注入的 Android 类。

```kotlin
// ✅ Activity
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var viewModel: MainViewModel
}

// ✅ Fragment
@AndroidEntryPoint
class MainFragment : Fragment() {
    @Inject lateinit var repository: UserRepository
}

// ✅ Service
@AndroidEntryPoint
class MyService : Service() {
    @Inject lateinit var worker: BackgroundWorker
}

// ✅ BroadcastReceiver
@AndroidEntryPoint
class MyReceiver : BroadcastReceiver() {
    @Inject lateinit var analytics: AnalyticsTracker
}

// ✅ View (Custom View)
@AndroidEntryPoint
class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {
    @Inject lateinit var tracker: ViewTracker
}
```

**@AndroidEntryPoint 的限制：**

```kotlin
// ❌ 不能用于抽象类
@AndroidEntryPoint
abstract class BaseActivity : AppCompatActivity()  // 编译错误

// ✅ 正确做法：抽象类不加注解，子类加
abstract class BaseActivity : AppCompatActivity()

@AndroidEntryPoint
class MainActivity : BaseActivity()

// ❌ 不能用于接口
@AndroidEntryPoint
interface MyInterface  // 编译错误

// ❌ 不能用于普通 Kotlin 类
@AndroidEntryPoint
class MyClass  // 编译错误（不是 Android 类）
```

**Fragment 的特殊处理：**

```kotlin
// Fragment 注入的时机
@AndroidEntryPoint
class MainFragment : Fragment() {
    
    @Inject lateinit var repository: UserRepository
    
    // ✅ 在 onAttach 之后使用注入的依赖
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // repository 已经可用
        repository.loadData()
    }
    
    // ❌ 不要在构造函数中使用
    init {
        // repository 还未注入！
    }
}

// Fragment 之间的依赖共享
@AndroidEntryPoint
class ParentFragment : Fragment() {
    @Inject lateinit var sharedData: SharedData
}

@AndroidEntryPoint
class ChildFragment : Fragment() {
    @Inject lateinit var sharedData: SharedData  // 同一个实例
}
```

### 2.3 @Inject

`@Inject` 用于标记需要注入的依赖。

```kotlin
// ==== 构造函数注入（推荐）====

class UserRepository @Inject constructor(
    private val api: ApiService,
    private val dao: UserDao,
    private val preferences: SharedPreferences
) {
    // 所有依赖自动注入
}

// ==== 字段注入 ====

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    
    @Inject lateinit var viewModel: MainViewModel
    @Inject lateinit var repository: UserRepository
    @Inject lateinit var navigator: Navigator
    
    // 可以配合使用
    private val logger = Logger("MainActivity")
}

// ==== 方法注入 ====

class ConfigManager {
    
    private lateinit var config: AppConfig
    
    @Inject
    fun setConfig(config: AppConfig) {
        this.config = config
        // 可以在这里做额外处理
        config.validate()
    }
}
```

**@Inject 的最佳实践：**

```kotlin
// ✅ 1. 优先使用构造函数注入
class ViewModel @Inject constructor(
    private val repository: Repository  // val 不可变
)

// ✅ 2. 字段注入使用 lateinit var
@AndroidEntryPoint
class Activity : AppCompatActivity() {
    @Inject lateinit var dependency: Dependency
}

// ✅ 3. 避免在 init 块中使用注入的依赖
@AndroidEntryPoint
class Fragment : Fragment() {
    @Inject lateinit var data: Data
    
    init {
        // ❌ data 还未注入
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // ✅ data 已注入
        data.load()
    }
}

// ✅ 4. 私有字段也可以注入
@AndroidEntryPoint
class Activity : AppCompatActivity() {
    @Inject internal lateinit var internalDep: InternalDep
    @Inject lateinit var publicDep: PublicDep
}
```

---

## 三、Module 和 Provides

### 3.1 @Module 注解

`@Module` 标记提供依赖的类或对象。

```kotlin
// ✅ 使用 object（推荐，单例）
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    fun provideApiService(): ApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

// ✅ 使用 class（需要实例）
@Module
@InstallIn(ActivityComponent::class)
abstract class ActivityModule {
    
    @Provides
    fun provideAdapter(context: Context): RecyclerView.Adapter<*> {
        return MyAdapter(context)
    }
}
```

**Module 的规则：**

```kotlin
// ❌ Module 不能是 open 类
@Module
open class MyModule  // 编译错误

// ❌ Module 不能是抽象类（除非使用 abstract 方法）
@Module
abstract class MyModule  // 只能有 abstract @Provides 方法

// ✅ 正确用法
@Module
object MyModule  // 推荐

@Module
class MyModule  // 也可以

@Module
abstract class MyModule {
    // 只能有 abstract @Provides 方法
    @Provides
    abstract fun provideInterface(): MyInterface
}
```

### 3.2 @Provides 注解

`@Provides` 标记提供依赖实例的方法。

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    // ✅ 简单提供
    @Provides
    fun provideBaseUrl(): String {
        return "https://api.example.com"
    }
    
    // ✅ 依赖其他提供
    @Provides
    fun provideRetrofit(@BaseUrl baseUrl: String): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    // ✅ 创建 API 服务
    @Provides
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
    
    // ✅ 带参数的提供
    @Provides
    fun provideHttpClient(
        @Named("timeout") timeout: Long,
        logger: HttpLogger
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(timeout, TimeUnit.SECONDS)
            .addInterceptor(logger)
            .build()
    }
}
```

**@Provides 方法的规则：**

```kotlin
@Module
object MyModule {
    
    // ✅ 返回类型明确
    @Provides
    fun provideString(): String = "value"
    
    // ✅ 可以有参数（从依赖图获取）
    @Provides
    fun provideViewModel(repository: Repository): ViewModel {
        return ViewModel(repository)
    }
    
    // ✅ 可以是 suspend 函数（Hilt 2.33+）
    @Provides
    suspend fun provideData(): Data {
        return fetchDataFromNetwork()
    }
    
    // ❌ 不能是 private
    @Provides
    private fun providePrivate(): String = "value"  // 编译错误
    
    // ❌ 不能是 open
    @Provides
    open fun provideOpen(): String = "value"  // 编译错误
    
    // ❌ 不能有泛型返回类型（需要 TypeToken）
    @Provides
    fun provideList(): List<String> = listOf()  // 需要 @JvmSuppressWildcards
}
```

### 3.3 @InstallIn 注解

`@InstallIn` 指定 Module 安装到哪个 Component。

```kotlin
// ==== 标准组件层次 ====

// 应用级别（单例）
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides fun provideApi(): ApiService = ...
}

// Activity 级别
@Module
@InstallIn(ActivityComponent::class)
abstract class ActivityModule {
    @Provides fun provideAdapter(): Adapter = ...
}

// Fragment 级别
@Module
@InstallIn(FragmentComponent::class)
object FragmentModule {
    @Provides fun provideFragmentData(): FragmentData = ...
}

// ViewModel 级别
@Module
@InstallIn(ViewModelComponent::class)
object ViewModelModule {
    @Provides fun provideRepo(): Repository = ...
}
```

**Component 层次图：**

```
┌─────────────────────────────────────────┐
│         SingletonComponent              │ 应用生命周期
│         (Application)                   │
├─────────────────────────────────────────┤
│    ActivityRetainedComponent            │ 配置变更保留
│    (ViewModel 作用域)                    │
├─────────────────────────────────────────┤
│         ActivityComponent               │  Activity 生命周期
├─────────────────────────────────────────┤
│         FragmentComponent               │   Fragment 生命周期
├─────────────────────────────────────────┤
│          ViewComponent                  │    View 生命周期
└─────────────────────────────────────────┘
```

---

## 四、Hilt 组件层次详解

### 4.1 SingletonComponent（应用级别）

最高级别的组件，与应用生命周期相同。

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object SingletonModule {
    
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "app.db"
        ).build()
    }
    
    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .build()
            .create(ApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideRepository(
        api: ApiService,
        database: AppDatabase
    ): UserRepository {
        return UserRepository(api, database.userDao())
    }
}

// 使用
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var repository: UserRepository  // 单例
}
```

**适用场景：**
- API 客户端（Retrofit、OkHttp）
- 数据库实例（Room）
- 共享偏好设置（SharedPreferences）
- 全局配置
- 缓存管理器

### 4.2 ActivityRetainedComponent

在配置变更（如屏幕旋转）时保留的组件。

```kotlin
@Module
@InstallIn(ActivityRetainedComponent::class)
object ActivityRetainedModule {
    
    @Provides
    @ActivityRetainedScoped
    fun provideExpensiveData(): ExpensiveData {
        return ExpensiveData()  // 配置变更时保留
    }
}

// ViewModel 自动使用此作用域
@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: Repository
) : ViewModel() {
    // ViewModel 自动在 ActivityRetainedComponent 中
}
```

**生命周期：**
- 创建：Activity 首次创建
- 销毁：Activity 真正销毁（不是配置变更）
- 保留：屏幕旋转、语言切换等配置变更

### 4.3 ViewModelComponent

专为 ViewModel 设计的组件。

```kotlin
@Module
@InstallIn(ViewModelComponent::class)
object ViewModelModule {
    
    @Provides
    @ViewModelScoped
    fun provideRepository(): Repository {
        return Repository()
    }
    
    @Provides
    @ViewModelScoped
    fun provideAnalytics(): Analytics {
        return Analytics()
    }
}

// ViewModel 注入
@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: Repository,
    private val analytics: Analytics
) : ViewModel() {
    // 所有依赖都是 ViewModel 作用域
}
```

**@HiltViewModel 的作用：**
- 自动将 ViewModel 注册到 Hilt
- 自动使用 ViewModelComponent
- 与 `by viewModels()` 集成

```kotlin
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    // ✅ 自动从 Hilt 获取 ViewModel
    private val viewModel: MainViewModel by viewModels()
    
    // ✅ 也可以使用 assisted 注入
    private val viewModel: AssistedViewModel by assistedViewModels()
}
```

### 4.4 ActivityComponent

与 Activity 生命周期相同的组件。

```kotlin
@Module
@InstallIn(ActivityComponent::class)
abstract class ActivityModule {
    
    @Provides
    @ActivityScoped
    fun provideAdapter(context: Context): RecyclerView.Adapter<*> {
        return MyAdapter(context)
    }
    
    @Provides
    @ActivityScoped
    fun provideNavigator(activity: Activity): Navigator {
        return Navigator(activity)
    }
}

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var adapter: RecyclerView.Adapter<*>
    @Inject lateinit var navigator: Navigator
}
```

**适用场景：**
- RecyclerView Adapter
- Activity 级别的导航器
- UI 相关的依赖
- 需要在 Activity 内共享的依赖

### 4.5 FragmentComponent

与 Fragment 生命周期相同的组件。

```kotlin
@Module
@InstallIn(FragmentComponent::class)
object FragmentModule {
    
    @Provides
    @FragmentScoped
    fun provideFragmentData(): FragmentData {
        return FragmentData()
    }
    
    @Provides
    @FragmentScoped
    fun provideAdapter(): FragmentAdapter {
        return FragmentAdapter()
    }
}

@AndroidEntryPoint
class MainFragment : Fragment() {
    @Inject lateinit var data: FragmentData
    @Inject lateinit var adapter: FragmentAdapter
}
```

**Fragment 作用域特点：**
- Fragment 附加时创建
- Fragment 分离时销毁
- 多个 Fragment 可以共享父级依赖

### 4.6 ViewComponent

与自定义 View 生命周期相同的组件。

```kotlin
@Module
@InstallIn(ViewComponent::class)
object ViewModule {
    
    @Provides
    @ViewScoped
    fun provideViewTracker(): ViewTracker {
        return ViewTracker()
    }
}

@AndroidEntryPoint
class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {
    
    @Inject lateinit var tracker: ViewTracker
    
    init {
        tracker.trackView(this)
    }
}
```

### 4.7 ServiceComponent

与 Service 生命周期相同的组件。

```kotlin
@Module
@InstallIn(ServiceComponent::class)
object ServiceModule {
    
    @Provides
    @ServiceScoped
    fun provideWorker(): BackgroundWorker {
        return BackgroundWorker()
    }
}

@AndroidEntryPoint
class MyService : Service() {
    @Inject lateinit var worker: BackgroundWorker
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        worker.doWork()
        return START_STICKY
    }
}
```

### 4.8 BroadcastReceiverComponent

与 BroadcastReceiver 生命周期相同的组件。

```kotlin
@Module
@InstallIn(BroadcastReceiverComponent::class)
object ReceiverModule {
    
    @Provides
    @BroadcastReceiverScoped
    fun provideHandler(): BroadcastHandler {
        return BroadcastHandler()
    }
}

@AndroidEntryPoint
class MyReceiver : BroadcastReceiver() {
    @Inject lateinit var handler: BroadcastHandler
    
    override fun onReceive(context: Context, intent: Intent) {
        handler.handle(intent)
    }
}
```

### 4.9 组件层次完整图

```
┌─────────────────────────────────────────────────────┐
│              SingletonComponent                     │
│              (@Singleton)                           │
│  ┌───────────────────────────────────────────────┐  │
│  │         ActivityRetainedComponent             │  │
│  │         (@ActivityRetainedScoped)             │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │        ViewModelComponent               │  │  │
│  │  │        (@ViewModelScoped)               │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│              ActivityComponent                      │
│              (@ActivityScoped)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │            FragmentComponent                  │  │
│  │            (@FragmentScoped)                  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │          ViewComponent                  │  │  │
│  │  │          (@ViewScoped)                  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│              ServiceComponent                       │
│              (@ServiceScoped)                       │
├─────────────────────────────────────────────────────┤
│         BroadcastReceiverComponent                  │
│         (@BroadcastReceiverScoped)                  │
└─────────────────────────────────────────────────────┘

依赖流向：子组件可以访问父组件的依赖，反之不行
```

---

## 五、作用域（Scope）管理

### 5.1 内置作用域注解

```kotlin
// ==== 标准作用域 ====

@Singleton                    // 应用生命周期
@ActivityRetainedScoped       // 配置变更保留
@ViewModelScoped              // ViewModel 生命周期
@ActivityScoped               // Activity 生命周期
@FragmentScoped               // Fragment 生命周期
@ViewScoped                   // View 生命周期
@ServiceScoped                // Service 生命周期
@BroadcastReceiverScoped      // BroadcastReceiver 生命周期
```

### 5.2 作用域使用示例

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object ScopeModule {
    
    // ✅ 单例 - 整个应用只有一个实例
    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return ApiService()
    }
    
    // ✅ 没有作用域 - 每次请求创建新实例
    @Provides
    fun provideLogger(): Logger {
        return Logger()  // 每次注入都创建新的
    }
}

@Module
@InstallIn(ActivityComponent::class)
object ActivityScopeModule {
    
    // ✅ Activity 作用域 - 每个 Activity 一个实例
    @Provides
    @ActivityScoped
    fun provideAdapter(): Adapter {
        return Adapter()
    }
}

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelScopeModule {
    
    // ✅ ViewModel 作用域 - 每个 ViewModel 一个实例
    @Provides
    @ViewModelScoped
    fun provideRepository(): Repository {
        return Repository()
    }
}
```

### 5.3 作用域匹配规则

```kotlin
// ✅ 正确：作用域与 Component 匹配
@Module
@InstallIn(SingletonComponent::class)
object CorrectModule {
    @Provides
    @Singleton  // ✅ 匹配
    fun provideApi(): ApiService = ApiService()
}

// ❌ 错误：作用域与 Component 不匹配
@Module
@InstallIn(SingletonComponent::class)
object WrongModule {
    @Provides
    @ActivityScoped  // ❌ 编译错误！
    fun provideApi(): ApiService = ApiService()
}

// ✅ 正确：无作用域可以在任何 Component
@Module
@InstallIn(SingletonComponent::class)
object NoScopeModule {
    @Provides
    fun provideLogger(): Logger = Logger()  // ✅ 无作用域，总是可以的
}
```

### 5.4 作用域与内存管理

```kotlin
// 内存泄漏风险示例
@Module
@InstallIn(SingletonComponent::class)
object DangerousModule {
    
    // ❌ 危险：持有 Context 引用
    @Provides
    @Singleton
    fun provideDangerous(@ApplicationContext context: Context): DangerousClass {
        return DangerousClass(context)  // ✅ 使用 ApplicationContext
    }
    
    // ❌ 绝对禁止：持有 Activity 引用
    @Provides
    @Singleton
    fun provideVeryDangerous(activity: Activity): VeryDangerousClass {
        return VeryDangerousClass(activity)  // ❌ 内存泄漏！
    }
}

// ✅ 安全做法
@Module
@InstallIn(ActivityComponent::class)
object SafeModule {
    
    @Provides
    @ActivityScoped
    fun provideActivityDependent(activity: Activity): ActivityDependent {
        return ActivityDependent(activity)  // ✅ Activity 作用域匹配
    }
}
```

---

## 六、与 ViewModel 集成

### 6.1 @HiltViewModel

```kotlin
// ✅ 标准 ViewModel 定义
@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: UserRepository,
    private val analytics: AnalyticsTracker,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val userId: String = savedStateHandle["userId"] ?: ""
    
    val users: LiveData<List<User>> = repository.getUsers(userId)
    
    fun loadUsers() {
        viewModelScope.launch {
            analytics.trackEvent("load_users")
            repository.refreshUsers()
        }
    }
}

// ✅ Activity 中使用
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    
    // 方式 1：by viewModels()
    private val viewModel: MainViewModel by viewModels()
    
    // 方式 2：ViewModelProvider
    private val viewModel: MainViewModel by lazy {
        ViewModelProvider(this)[MainViewModel::class.java]
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadUsers()
    }
}
```

### 6.2 Assisted 注入（带参数的 ViewModel）

```kotlin
// ==== 定义 Assisted 参数 ====

@HiltViewModel
class ProductViewModel @AssistedInject constructor(
    @Assisted private val productId: String,
    @Assisted private val categoryId: String,
    private val repository: ProductRepository
) : ViewModel() {
    
    val product: LiveData<Product> = repository.getProduct(productId)
}

// ==== 创建 Factory ====

@AssistedInject.Factory
interface Factory {
    fun create(productId: String, categoryId: String): ProductViewModel
}

// ==== ViewModel 中实现 Factory ====

@HiltViewModel
class ProductViewModel @AssistedInject constructor(
    @Assisted private val productId: String,
    @Assisted private val categoryId: String,
    private val repository: ProductRepository
) : ViewModel(), AssistedInject.Factory {
    
    override fun create(productId: String, categoryId: String): ProductViewModel {
        return ProductViewModel(productId, categoryId, repository)
    }
}

// ==== Activity 中使用 ====

@AndroidEntryPoint
class ProductActivity : AppCompatActivity() {
    
    private val viewModel: ProductViewModel by assistedViewModels<Factory>(
        key = "product_vm",
        extrasProducer = {
            defaultCreationExtras().apply {
                set(PRODUCT_ID_KEY, "123")
                set(CATEGORY_ID_KEY, "456")
            }
        }
    )
}
```

**简化版 Assisted 注入（Hilt 2.33+）：**

```kotlin
// ✅ 使用 @ViewModelInject（简化）
@HiltViewModel
class ProductViewModel @Inject constructor(
    @SavedStateHandle private val savedState: SavedStateHandle,
    private val repository: ProductRepository
) : ViewModel() {
    
    private val productId: String = savedState.get<String>("productId") ?: ""
}

@AndroidEntryPoint
class ProductActivity : AppCompatActivity() {
    private val viewModel: ProductViewModel by viewModels()
}
```

### 6.3 ViewModel 作用域详解

```kotlin
@Module
@InstallIn(ViewModelComponent::class)
object ViewModelModule {
    
    // ViewModel 作用域的依赖
    @Provides
    @ViewModelScoped
    fun provideRepository(): Repository {
        return Repository()  // 与 ViewModel 同生命周期
    }
    
    // 也可以在 ViewModel 中使用其他作用域
    @Provides
    fun provideLogger(): Logger {
        return Logger()  // 无作用域，每次创建新的
    }
}

@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: Repository,      // ViewModelScoped
    private val logger: Logger               // 无作用域
) : ViewModel() {
    // repository 与 ViewModel 同生命周期
    // logger 每次注入都是新实例
}
```

---

## 七、Qualifiers 和 Named 注入

### 7.1 @Named 注解

当有多个相同类型的依赖时，使用 `@Named` 区分。

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Named("base_url")
    fun provideBaseUrl(): String {
        return "https://api.example.com"
    }
    
    @Provides
    @Named("cdn_url")
    fun provideCdnUrl(): String {
        return "https://cdn.example.com"
    }
    
    @Provides
    fun provideRetrofit(
        @Named("base_url") baseUrl: String
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .build()
    }
}

// 使用
class Repository @Inject constructor(
    @Named("base_url") private val baseUrl: String,
    @Named("cdn_url") private val cdnUrl: String
)
```

### 7.2 自定义 Qualifier

```kotlin
// ==== 创建自定义 Qualifier ====

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class BaseUrl

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class CdnUrl

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class TimeoutSeconds

// ==== 使用自定义 Qualifier ====

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @BaseUrl
    fun provideBaseUrl(): String {
        return "https://api.example.com"
    }
    
    @Provides
    @CdnUrl
    fun provideCdnUrl(): String {
        return "https://cdn.example.com"
    }
    
    @Provides
    @TimeoutSeconds
    fun provideTimeout(): Long {
        return 30L
    }
}

// 注入
class ApiClient @Inject constructor(
    @BaseUrl private val baseUrl: String,
    @CdnUrl private val cdnUrl: String,
    @TimeoutSeconds private val timeout: Long
)
```

### 7.3 @JvmSuppressWildcards

处理泛型类型时的必要注解。

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object MultibindingModule {
    
    // ❌ 错误：泛型类型需要处理
    @Provides
    fun provideInterceptors(): List<Interceptor> {
        return listOf(LoggingInterceptor(), AuthInterceptor())
    }
    
    // ✅ 正确：使用 @JvmSuppressWildcards
    @Provides
    fun provideInterceptors(): @JvmSuppressWildcards List<Interceptor> {
        return listOf(LoggingInterceptor(), AuthInterceptor())
    }
}

// 或者在注入点使用
class ApiClient @Inject constructor(
    @JvmSuppressWildcards private val interceptors: List<Interceptor>
)
```

---

## 八、常见问题和解决方案

### 8.1 循环依赖

**问题：**

```kotlin
// ❌ 循环依赖
class A @Inject constructor(private val b: B)
class B @Inject constructor(private val a: A)
// 编译错误：循环依赖 detected
```

**解决方案 1：使用 Lazy**

```kotlin
// ✅ 使用 Lazy 延迟初始化
class A @Inject constructor(
    private val bProvider: Lazy<B>
) {
    fun doSomething() {
        val b = bProvider.get()  // 需要时再获取
        b.doWork()
    }
}

class B @Inject constructor(
    private val a: A  // 直接注入
)
```

**解决方案 2：使用 Provider**

```kotlin
// ✅ 使用 Provider 每次获取新实例
class A @Inject constructor(
    private val bProvider: Provider<B>
) {
    fun doSomething() {
        val b = bProvider.get()
        b.doWork()
    }
}
```

**解决方案 3：重构设计**

```kotlin
// ✅ 引入第三方协调者
interface Coordinator {
    fun coordinate()
}

class CoordinatorImpl @Inject constructor(
    private val a: A,
    private val b: B
) : Coordinator {
    override fun coordinate() {
        a.doWith(b)
        b.doWith(a)
    }
}

class A @Inject constructor() {
    fun doWith(b: B) { /* ... */ }
}

class B @Inject constructor() {
    fun doWith(a: A) { /* ... */ }
}
```

### 8.2 Application 未注入

**问题：**

```kotlin
// ❌ 忘记 @HiltAndroidApp
class MyApplication : Application() {
    @Inject lateinit var dependency: Dependency  // 不会工作
}

// ✅ 正确
@HiltAndroidApp
class MyApplication : Application() {
    @Inject lateinit var dependency: Dependency
}
```

### 8.3 Fragment 注入时机

**问题：**

```kotlin
@AndroidEntryPoint
class MyFragment : Fragment() {
    @Inject lateinit var data: Data
    
    init {
        // ❌ 这里 data 还未注入
        data.load()  // UninitializedPropertyAccessException
    }
    
    // ✅ 正确时机
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        data.load()  // 已注入
    }
}
```

### 8.4 作用域不匹配

**问题：**

```kotlin
// ❌ 作用域与 Component 不匹配
@Module
@InstallIn(SingletonComponent::class)
object WrongModule {
    @Provides
    @ActivityScoped  // 编译错误！
    fun provideData(): Data = Data()
}

// ✅ 正确
@Module
@InstallIn(ActivityComponent::class)
object CorrectModule {
    @Provides
    @ActivityScoped
    fun provideData(): Data = Data()
}
```

### 8.5 Context 注入问题

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object ContextModule {
    
    // ❌ 错误：不能直接注入 Context
    @Provides
    fun provideContext(): Context {
        // 无法获取 Context
    }
    
    // ✅ 正确：使用 @ApplicationContext 或 @ActivityContext
    @Provides
    fun provideApplicationContext(
        @ApplicationContext context: Context
    ): Context = context
    
    @Provides
    fun provideActivityContext(
        @ActivityContext context: Context
    ): Context = context
}

// 使用
class Repository @Inject constructor(
    @ApplicationContext private val appContext: Context
) {
    fun getCacheDir(): File = appContext.cacheDir
}
```

---

## 九、性能优化建议

### 9.1 减少 Module 数量

```kotlin
// ❌ 不推荐：过多小 Module
@Module @InstallIn(SingletonComponent::class) object NetworkModule { ... }
@Module @InstallIn(SingletonComponent::class) object DatabaseModule { ... }
@Module @InstallIn(SingletonComponent::class) object RepositoryModule { ... }
@Module @InstallIn(SingletonComponent::class) object UtilsModule { ... }

// ✅ 推荐：合理合并
@Module @InstallIn(SingletonComponent::class) object AppModule {
    // Network
    @Provides fun provideApi(): ApiService = ...
    
    // Database
    @Provides fun provideDatabase(): AppDatabase = ...
    
    // Repository
    @Provides fun provideRepository(): Repository = ...
    
    // Utils
    @Provides fun provideLogger(): Logger = ...
}
```

### 9.2 避免过度作用域

```kotlin
// ❌ 不推荐：所有依赖都加 @Singleton
@Module
@InstallIn(SingletonComponent::class)
object OverScopedModule {
    @Provides @Singleton fun provideA(): A = A()
    @Provides @Singleton fun provideB(): B = B()
    @Provides @Singleton fun provideC(): C = C()
    @Provides @Singleton fun provideD(): D = D()
}

// ✅ 推荐：只对需要的依赖使用作用域
@Module
@InstallIn(SingletonComponent::class)
object ProperScopedModule {
    @Provides @Singleton fun provideApi(): ApiService = ApiService()  // 需要单例
    @Provides fun provideLogger(): Logger = Logger()  // 轻量级，无需单例
    @Provides fun provideMapper(): Mapper = Mapper()  // 无状态，无需单例
}
```

### 9.3 使用 @Binds 代替 @Provides

```kotlin
// ❌ @Provides 创建实例
@Module
@InstallIn(SingletonComponent::class)
abstract class WrongModule {
    @Provides
    @Singleton
    fun provideRepository(impl: UserRepositoryImpl): UserRepository {
        return impl  // 多余
    }
}

// ✅ @Binds 直接绑定
@Module
@InstallIn(SingletonComponent::class)
abstract class CorrectModule {
    @Binds
    @Singleton
    abstract fun bindRepository(impl: UserRepositoryImpl): UserRepository
}
```

### 9.4 延迟初始化大型依赖

```kotlin
// ✅ 使用 Lazy 延迟初始化
class HeavyRepository @Inject constructor(
    private val apiProvider: Lazy<ApiService>,
    private val dbProvider: Lazy<AppDatabase>
) {
    private val api: ApiService by lazy { apiProvider.get() }
    private val db: AppDatabase by lazy { dbProvider.get() }
    
    // 只有在真正使用时才初始化
    fun loadData() {
        val data = api.fetch()  // 此时才初始化
        db.save(data)
    }
}
```

---

## 十、面试考点

### 10.1 基础问题

**Q1: Hilt 和 Dagger 的关系？**

**A:**
- Hilt 基于 Dagger 2 构建
- Hilt 简化了 Dagger 的复杂配置
- Hilt 为 Android 提供了标准化的组件层次
- Hilt 自动生成大部分样板代码

**Q2: @HiltAndroidApp 的作用？**

**A:**
- 标记 Application 类
- 触发 Hilt 代码生成
- 创建 ApplicationComponent
- 生成 Hilt_<ApplicationName> 基类

**Q3: @AndroidEntryPoint 可以用在哪些类上？**

**A:**
- Activity
- Fragment
- Service
- BroadcastReceiver
- View（自定义 View）
- 不能用于抽象类、接口、普通 Kotlin 类

**Q4: Hilt 的组件层次有哪些？**

**A:**
```
SingletonComponent（应用级别）
  └─ ActivityRetainedComponent（配置变更保留）
      └─ ViewModelComponent（ViewModel 级别）
ActivityComponent（Activity 级别）
  └─ FragmentComponent（Fragment 级别）
      └─ ViewComponent（View 级别）
ServiceComponent（Service 级别）
BroadcastReceiverComponent（BroadcastReceiver 级别）
```

### 10.2 进阶问题

**Q5: @Provides 和 @Binds 的区别？**

**A:**
```kotlin
// @Provides - 用于创建实例
@Provides
fun provideRepository(): UserRepository {
    return UserRepositoryImpl()  // 创建新实例
}

// @Binds - 用于绑定接口到实现
@Binds
abstract fun bindRepository(impl: UserRepositoryImpl): UserRepository
// 不创建实例，只是告诉 Dagger 用 impl 实现接口

// 性能：@Binds 更好（不生成额外代码）
// 使用：@Provides 用于 Module object，@Binds 用于 abstract class
```

**Q6: 如何解决循环依赖？**

**A:**
```kotlin
// 方法 1：使用 Lazy
class A @Inject constructor(private val bProvider: Lazy<B>)

// 方法 2：使用 Provider
class A @Inject constructor(private val bProvider: Provider<B>)

// 方法 3：重构设计，引入协调者
class Coordinator @Inject constructor(private val a: A, private val b: B)
```

**Q7: @ApplicationContext 和 @ActivityContext 的区别？**

**A:**
```kotlin
// @ApplicationContext - 应用级别的 Context
@Provides
fun provideApp(@ApplicationContext context: Context): Context = context
// 生命周期：应用整个生命周期
// 用途：数据库、SharedPreferences、全局配置

// @ActivityContext - Activity 级别的 Context
@Provides
fun provideActivity(@ActivityContext context: Context): Context = context
// 生命周期：Activity 生命周期
// 用途：UI 相关、Dialog、Toast
```

**Q8: Hilt 如何与 ViewModel 集成？**

**A:**
```kotlin
// 1. 使用 @HiltViewModel 标记 ViewModel
@HiltViewModel
class MyViewModel @Inject constructor(...) : ViewModel()

// 2. Activity 中通过 viewModels() 获取
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
}

// 3. Hilt 自动管理 ViewModel 的生命周期和依赖注入
```

### 10.3 高级问题

**Q9: Hilt 的代码生成原理？**

**A:**
```
1. 编译时注解处理（APT）
2. Hilt 处理器扫描 @HiltAndroidApp、@AndroidEntryPoint 等注解
3. 生成 Hilt_<ClassName> 基类
4. 生成 Component 实现类
5. 生成依赖工厂类
6. 编译后的代码直接实例化依赖，无反射

优势：
- 编译时检查依赖图
- 运行时性能高（无反射）
- IDE 可以提示错误
```

**Q10: Hilt 测试如何配置？**

**A:**
```kotlin
// 1. 添加测试依赖
testImplementation 'com.google.dagger:hilt-android-testing:2.44'

// 2. 使用 @HiltAndroidRule
@HiltAndroidRule
val hiltRule = HiltAndroidRule(this)

// 3. 替换 Module
@UninstallModules(AppModule::class)
@InstallIn(SingletonComponent::class)
@Module
object TestModule {
    @Provides
    fun provideApi(): ApiService = MockApiService()
}

// 4. 注入测试依赖
@BindValue
val mockApi: ApiService = MockApiService()
```

---

## 十一、最佳实践总结

### 11.1 推荐实践 ✅

```kotlin
// 1. 使用构造函数注入
class Repository @Inject constructor(
    private val api: ApiService
)

// 2. 依赖抽象接口
interface UserRepository
class UserRepositoryImpl @Inject constructor(...) : UserRepository

// 3. 合理的作用域
@Singleton fun provideApi(): ApiService
@ViewModelScoped fun provideRepo(): Repository

// 4. 使用 @Binds 代替 @Provides（绑定接口时）
@Binds abstract fun bindRepo(impl: RepoImpl): Repository

// 5. 使用 @ApplicationContext 而非 Activity Context（单例中）
@Provides fun provideDb(@ApplicationContext ctx: Context): Database

// 6. ViewModel 使用 @HiltViewModel
@HiltViewModel class VM @Inject constructor(...) : ViewModel()
```

### 11.2 避免的陷阱 ❌

```kotlin
// 1. 不要在非 Android 类上使用 @AndroidEntryPoint
@AndroidEntryPoint class MyClass  // ❌

// 2. 不要在单例中持有 Activity Context
@Singleton fun provideX(activity: Activity)  // ❌ 内存泄漏

// 3. 不要过度使用作用域
@Singleton fun provideLogger()  // ❌ 轻量级无需单例

// 4. 不要在 init 块中使用注入的依赖
@AndroidEntryPoint class Fragment {
    @Inject lateinit var data: Data
    init { data.load() }  // ❌ 还未注入
}

// 5. 不要循环依赖
class A @Inject constructor(b: B)
class B @Inject constructor(a: A)  // ❌
```

---

## 十二、参考资料

### 官方文档
- [Hilt 官方文档](https://dagger.dev/hilt/)
- [Hilt 使用指南](https://developer.android.com/training/dependency-injection/hilt-android)
- [Hilt 与 ViewModel](https://developer.android.com/training/dependency-injection/hilt-jetpack)

### 进阶阅读
- [Dagger 2 官方文档](https://dagger.dev/)
- [Hilt 迁移指南](https://developer.android.com/training/dependency-injection/hilt-migration)
- [Hilt 测试指南](https://developer.android.com/training/dependency-injection/hilt-testing)

### 源码学习
- [Hilt GitHub](https://github.com/google/dagger/tree/master/java/dagger/hilt)
- [Hilt 示例项目](https://github.com/android/architecture-samples)

---

**🔗 上一篇**: [DI 基础概念](01_DI 基础概念.md)
**🔗 下一篇**: [Dagger 2 详解](03_Dagger 2.md)
