# 03 Dagger 2 依赖注入框架 🔪

> Java/Kotlin 最流行的编译时依赖注入框架，Hilt 的基础

---

## 一、Dagger 2 基础概述

### 1.1 什么是 Dagger 2？

Dagger 2 是由 Google 开发的完全编译时的依赖注入框架，是 Square 公司原始 Dagger 项目的重写版本。

```
Dagger 2 核心特点：
- 100% 编译时代码生成（无反射）
- 静态类型安全
- 高性能（与手动依赖注入相当）
- 可追溯的依赖图
- 支持任意作用域
```

### 1.2 Dagger 2 发展历史

```
2013 年 - Square 发布原始 Dagger（使用反射）
  ↓
2015 年 - Google 重写为 Dagger 2（编译时代码生成）
  ↓
2016 年 - Dagger 2.1 发布（支持子组件、作用域）
  ↓
2017 年 - Dagger 2.11+（Android 支持增强）
  ↓
2020 年 - Hilt 发布（基于 Dagger 2 的 Android 封装）
  ↓
现在 - Dagger 2.44+（持续维护）
```

### 1.3 Dagger 2 vs Hilt

| 特性 | Dagger 2 | Hilt |
|------|----------|------|
| **配置方式** | 手动创建 Component | 自动生成 |
| **Android 集成** | 手动绑定 | 自动绑定 |
| **组件层次** | 自定义 | 标准化 |
| **学习曲线** | 陡峭 | 平缓 |
| **灵活性** | 高 | 中等 |
| **代码量** | 多 | 少 |
| **适用场景** | 纯 Java/Kotlin、多平台 | Android 专属 |

```kotlin
// ==== Dagger 2 方式（手动）====

@Component(modules = [AppModule::class])
interface AppComponent {
    fun inject(application: MyApplication)
    
    @Component.Factory
    interface Factory {
        fun create(@BindsInstance app: Application): AppComponent
    }
}

class MyApplication : Application() {
    lateinit var component: AppComponent
    
    override fun onCreate() {
        super.onCreate()
        component = DaggerAppComponent.factory().create(this)
        component.inject(this)
    }
}

// ==== Hilt 方式（自动）====

@HiltAndroidApp
class MyApplication : Application()
// 一切自动完成
```

---

## 二、核心注解详解

### 2.1 @Component

`@Component` 是 Dagger 2 的核心注解，定义依赖注入的入口。

```kotlin
// ==== 基础 Component 定义 ====

@Component(modules = [AppModule::class])
interface AppComponent {
    
    // 注入方法
    fun inject(application: MyApplication)
    fun inject(activity: MainActivity)
    fun inject(fragment: MainFragment)
    
    // 提供依赖的方法（可选）
    fun getUserRepository(): UserRepository
    fun getApiService(): ApiService
}

// ==== 使用 Component ====

class MyApplication : Application() {
    lateinit var appComponent: AppComponent
    
    override fun onCreate() {
        super.onCreate()
        // 创建 Component 实例
        appComponent = DaggerAppComponent.create()
        appComponent.inject(this)
    }
}
```

**Component 的规则：**

```kotlin
// ✅ Component 必须是 interface 或 abstract class
@Component interface AppComponent  // ✅ 推荐
@Component abstract class AppComponent  // ✅ 也可以

// ❌ Component 不能是 open class
@Component open class AppComponent  // ❌ 编译错误

// ✅ Component 可以指定 modules
@Component(modules = [AppModule::class, NetworkModule::class])
interface AppComponent

// ✅ Component 可以指定 dependencies
@Component(
    modules = [AppModule::class],
    dependencies = [OtherComponent::class]
)
interface AppComponent
```

### 2.2 @Module 和 @Provides

`@Module` 标记提供依赖的类，`@Provides` 标记提供实例的方法。

```kotlin
// ==== 基础 Module ====

@Module
class AppModule {
    
    @Provides
    fun provideApiService(): ApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
    
    @Provides
    fun provideRepository(api: ApiService): UserRepository {
        return UserRepository(api)
    }
}

// ==== 使用 object（Kotlin 推荐）====

@Module
object AppModule {
    
    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return ApiService()
    }
}

// ==== Module 包含其他 Module ====

@Module(includes = [NetworkModule::class, DatabaseModule::class])
class AppModule
```

**@Provides 方法的高级用法：**

```kotlin
@Module
class AdvancedModule {
    
    // ✅ 带参数的 Provides
    @Provides
    fun provideRetrofit(
        @Named("base_url") baseUrl: String,
        client: OkHttpClient
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .build()
    }
    
    // ✅ 带泛型返回类型
    @Provides
    fun provideStringMap(): Map<String, String> {
        return mapOf("key" to "value")
    }
    
    // ✅ 带 @JvmSuppressWildcards
    @Provides
    fun provideInterceptorList(): @JvmSuppressWildcards List<Interceptor> {
        return listOf(LoggingInterceptor(), AuthInterceptor())
    }
    
    // ✅ 静态方法（Java）
    @Provides
    @Singleton
    static Gson provideGson() {
        return new GsonBuilder().create();
    }
}
```

### 2.3 @Binds

`@Binds` 用于将接口绑定到实现类，比 `@Provides` 更高效。

```kotlin
// ==== @Provides 方式（创建实例）====

@Module
abstract class ProvidesModule {
    
    @Provides
    @Singleton
    fun provideRepository(): UserRepository {
        return UserRepositoryImpl()  // 手动创建
    }
}

// ==== @Binds 方式（绑定接口）====

@Module
abstract class BindsModule {
    
    @Binds
    @Singleton
    abstract fun bindRepository(impl: UserRepositoryImpl): UserRepository
    // 不创建实例，只是建立绑定关系
}

// ==== 对比 ====

/*
@Provides:
- 用于 Module object 或 class
- 方法体创建实例
- 生成额外代码
- 更灵活（可以自定义创建逻辑）

@Binds:
- 只能用于 abstract Module
- 方法必须是 abstract
- 不生成额外代码
- 性能更好
- 只能绑定已有实例
*/
```

**@Binds 的实际应用：**

```kotlin
// ==== 接口和实现 ====

interface UserRepository {
    fun getUser(id: Int): User
}

class UserRepositoryImpl @Inject constructor(
    private val api: ApiService
) : UserRepository {
    override fun getUser(id: Int): User {
        return api.getUser(id)
    }
}

// ==== 使用 @Binds 绑定 ====

@Module
abstract class RepositoryModule {
    
    @Binds
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
    
    @Binds
    abstract fun bindOrderRepository(impl: OrderRepositoryImpl): OrderRepository
}

// ==== 多个实现的情况 ====

@Module
abstract class MultipleImplModule {
    
    // 默认实现
    @Binds
    @Default
    abstract fun bindDefaultRepo(impl: DefaultRepository): Repository
    
    // 缓存实现
    @Binds
    @Cached
    abstract fun bindCachedRepo(impl: CachedRepository): Repository
    
    // 网络实现
    @Binds
    @Network
    abstract fun bindNetworkRepo(impl: NetworkRepository): Repository
}
```

### 2.4 @Inject

`@Inject` 有三种用途：构造函数注入、字段注入、方法注入。

```kotlin
// ==== 构造函数注入（推荐）====

class UserRepository @Inject constructor(
    private val api: ApiService,
    private val dao: UserDao
) {
    // 依赖自动注入
}

// ==== 字段注入 ====

class MainActivity : AppCompatActivity() {
    
    @Inject
    lateinit var viewModel: MainViewModel
    
    @Inject
    lateinit var repository: UserRepository
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        (application as MyApplication).appComponent.inject(this)
        // 现在 viewModel 和 repository 已注入
    }
}

// ==== 方法注入 ====

class ConfigManager {
    
    private lateinit var config: AppConfig
    
    @Inject
    fun setConfig(config: AppConfig) {
        this.config = config
        config.validate()  // 可以执行额外逻辑
    }
}
```

**@Inject 构造函数的最佳实践：**

```kotlin
// ✅ 1. 依赖使用 val（不可变）
class ViewModel @Inject constructor(
    private val repository: Repository
)

// ✅ 2. 依赖数量控制在合理范围（建议 <= 4）
class ComplexClass @Inject constructor(
    private val dep1: Dep1,
    private val dep2: Dep2,
    private val dep3: Dep3,
    private val dep4: Dep4
    // 如果超过 4 个，考虑重构
)

// ✅ 3. 使用默认参数（谨慎）
class Service @Inject constructor(
    private val api: ApiService,
    private val logger: Logger = DefaultLogger()
)

// ❌ 4. 避免在构造函数中做复杂工作
class BadService @Inject constructor(
    private val api: ApiService
) {
    init {
        api.initialize()  // ❌ 不应该在构造函数中做
    }
}
```

---

## 三、依赖图构建原理

### 3.1 依赖图基础

Dagger 2 在编译时构建依赖图，分析所有依赖关系。

```
依赖图示例：

AppComponent
    ├── ApiService (from NetworkModule)
    │     └── OkHttpClient (from NetworkModule)
    │           └── HttpLoggingInterceptor (from NetworkModule)
    ├── UserRepository (from RepositoryModule)
    │     ├── ApiService (已存在，复用)
    │     └── UserDao (from DatabaseModule)
    │           └── AppDatabase (from DatabaseModule)
    └── ViewModel (from ViewModelModule)
          └── UserRepository (已存在，复用)
```

### 3.2 依赖图构建过程

```kotlin
// ==== 步骤 1：定义依赖 ====

class ApiService @Inject constructor(
    private val client: OkHttpClient
)

class UserRepository @Inject constructor(
    private val api: ApiService,
    private val dao: UserDao
)

class MainViewModel @Inject constructor(
    private val repository: UserRepository
)

// ==== 步骤 2：定义 Module ====

@Module
class NetworkModule {
    @Provides fun provideClient(): OkHttpClient = OkHttpClient()
    @Provides fun provideApi(client: OkHttpClient): ApiService = ApiService(client)
}

@Module
class DatabaseModule {
    @Provides fun provideDao(): UserDao = UserDao()
}

@Module
class RepositoryModule {
    @Provides fun provideRepo(api: ApiService, dao: UserDao): UserRepository {
        return UserRepository(api, dao)
    }
}

// ==== 步骤 3：定义 Component ====

@Component(modules = [NetworkModule::class, DatabaseModule::class, RepositoryModule::class])
interface AppComponent {
    fun getViewModel(): MainViewModel
}

// ==== 步骤 4：Dagger 生成代码 ====

// Dagger 生成的代码（简化版）
public abstract class DaggerAppComponent implements AppComponent {
    
    protected DaggerAppComponent() {}
    
    public static Builder builder() {
        return new Builder();
    }
    
    @Override
    public MainViewModel getViewModel() {
        return new MainViewModel(
            provideUserRepository(
                provideApiService(provideOkHttpClient()),
                provideUserDao()
            )
        );
    }
    
    private OkHttpClient provideOkHttpClient() {
        return new NetworkModule().provideClient();
    }
    
    private ApiService provideApiService(OkHttpClient client) {
        return new NetworkModule().provideApi(client);
    }
    
    private UserDao provideUserDao() {
        return new DatabaseModule().provideDao();
    }
    
    private UserRepository provideUserRepository(ApiService api, UserDao dao) {
        return new RepositoryModule().provideRepo(api, dao);
    }
}
```

### 3.3 依赖图的唯一性

```kotlin
// Dagger 确保每个依赖只创建一次（在相同作用域内）

@Component(modules = [AppModule::class])
interface AppComponent {
    fun getRepo1(): UserRepository
    fun getRepo2(): UserRepository
    fun getRepo3(): UserRepository
}

// 使用
val component = DaggerAppComponent.create()
val repo1 = component.getRepo1()
val repo2 = component.getRepo2()
val repo3 = component.getRepo3()

// 没有 @Singleton 时：repo1 != repo2 != repo3（每次都是新实例）
// 有 @Singleton 时：repo1 == repo2 == repo3（同一个实例）
```

### 3.4 依赖图的验证

```kotlin
// ==== 编译时验证 ====

// ❌ 错误 1：缺少依赖提供
@Component(modules = [NetworkModule::class])
interface AppComponent {
    fun getRepository(): UserRepository  // 编译错误！UserRepository 无法提供
}

// ❌ 错误 2：循环依赖
class A @Inject constructor(private val b: B)
class B @Inject constructor(private val a: A)
// 编译错误：循环依赖 detected

// ❌ 错误 3：作用域不匹配
@Module
abstract class WrongModule {
    @Provides
    @Singleton  // 编译错误！Component 没有 @Singleton 作用域
    fun provideApi(): ApiService = ApiService()
}

@Component(modules = [WrongModule::class])
@Singleton  // ✅ 需要添加
interface AppComponent
```

---

## 四、编译时代码生成

### 4.1 代码生成过程

```
源代码 (.kt/.java)
    ↓
注解处理器 (APT)
    ↓
扫描 @Component、@Module、@Inject 等注解
    ↓
分析依赖图
    ↓
生成 Dagger* 类
    ↓
编译为字节码
    ↓
运行时直接使用（无反射）
```

### 4.2 生成的代码结构

```kotlin
// 源代码
@Component(modules = [AppModule::class])
@Singleton
interface AppComponent {
    fun inject(application: MyApplication)
    fun getRepository(): UserRepository
}

// 生成的代码（简化版）
@Generated("dagger.internal.codegen.ComponentProcessor")
public abstract class DaggerAppComponent implements AppComponent {
    
    private DaggerAppComponent() {}
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static AppComponent create() {
        return new Builder().build();
    }
    
    protected abstract static class Builder {
        private AppModule appModule;
        
        public Builder appModule(AppModule module) {
            this.appModule = Preconditions.checkNotNull(module);
            return this;
        }
        
        public AppComponent build() {
            Preconditions.checkNotNull(appModule);
            return new DaggerAppComponent();
        }
    }
    
    @Override
    public UserRepository getRepository() {
        return AppModule_ProvideRepositoryFactory.provideRepository();
    }
    
    @Override
    public void inject(MyApplication application) {
        // 注入逻辑
    }
}

// Module 的工厂类
public final class AppModule_ProvideRepositoryFactory {
    public static UserRepository provideRepository() {
        return AppModule.provideRepository();
    }
}
```

### 4.3 代码生成的优势

```
1. 性能优势
   - 无反射开销
   - 直接方法调用
   - 与手写代码性能相当

2. 类型安全
   - 编译时检查所有依赖
   - IDE 实时提示错误
   - 无运行时 ClassNotFound 风险

3. 可追溯性
   - 生成的代码可读
   - 可以调试生成的代码
   - 清晰的依赖链路

4. 优化空间
   - 编译器可以进一步优化
   - 内联优化
   - 死代码消除
```

### 4.4 查看生成的代码

**Android Studio 中查看：**

```
1. 构建项目
2. 打开 build/generated/source/kapt/ 目录
3. 查找 Dagger* 类
4. 阅读生成的代码
```

**Kapt 配置：**

```kotlin
// build.gradle.kts
kapt {
    correctErrorTypes = true
    
    // 生成 Kotlin 源代码
    arguments {
        arg("dagger.gradle.incremental", "true")
    }
}

// 查看生成位置
// build/tmp/kapt3/stubs/debug/
// build/generated/source/kapt/debug/
```

---

## 五、Scope 作用域详解

### 5.1 @Singleton

最常用的作用域，表示整个应用生命周期内只有一个实例。

```kotlin
// ==== 定义单例 Component ====

@Singleton
@Component(modules = [AppModule::class])
interface AppComponent {
    fun getApiService(): ApiService
    fun getRepository(): UserRepository
}

// ==== 提供单例依赖 ====

@Module
object AppModule {
    
    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return ApiService()  // 整个应用只有一个实例
    }
    
    @Provides
    @Singleton
    fun provideRepository(api: ApiService): UserRepository {
        return UserRepository(api)  // 也是单例
    }
}

// ==== 使用 ====

val component = DaggerAppComponent.create()
val api1 = component.getApiService()
val api2 = component.getApiService()
// api1 == api2 (同一个实例)
```

**@Singleton 的注意事项：**

```kotlin
// ❌ 错误：Component 和 Provides 作用域不匹配
@Component(modules = [AppModule::class])  // 没有 @Singleton
interface AppComponent {
    fun getApi(): ApiService
}

@Module
object AppModule {
    @Provides
    @Singleton  // 编译错误！
    fun provideApi(): ApiService = ApiService()
}

// ✅ 正确：Component 也要有 @Singleton
@Singleton
@Component(modules = [AppModule::class])
interface AppComponent

@Module
object AppModule {
    @Provides
    @Singleton
    fun provideApi(): ApiService = ApiService()
}
```

### 5.2 自定义 Scope

Dagger 2 允许创建自定义作用域。

```kotlin
// ==== 定义自定义 Scope 注解 ====

@Scope
@Retention(AnnotationRetention.RUNTIME)
annotation class PerActivity

@Scope
@Retention(AnnotationRetention.RUNTIME)
annotation class PerFragment

@Scope
@Retention(AnnotationRetention.RUNTIME)
annotation class PerUserSession

// ==== 使用自定义 Scope ====

@PerActivity
@Component(
    modules = [ActivityModule::class],
    dependencies = [AppComponent::class]
)
interface ActivityComponent {
    fun inject(activity: MainActivity)
}

@Module
abstract class ActivityModule {
    
    @Provides
    @PerActivity
    fun provideAdapter(context: Context): RecyclerView.Adapter<*> {
        return MyAdapter(context)  // 每个 Activity 一个实例
    }
}

// ==== 生命周期管理 ====

class MainActivity : AppCompatActivity() {
    lateinit var activityComponent: ActivityComponent
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 创建 ActivityComponent
        activityComponent = DaggerActivityComponent.builder()
            .appComponent((application as MyApplication).appComponent)
            .build()
        
        activityComponent.inject(this)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // ActivityComponent 随 Activity 销毁
        // @PerActivity 作用域的依赖也被释放
    }
}
```

### 5.3 自定义 Scope 的实际应用

```kotlin
// ==== 用户会话作用域 ====

@Scope
@Retention(AnnotationRetention.RUNTIME)
annotation class PerUserSession

@PerUserSession
@Component(
    modules = [UserSessionModule::class],
    dependencies = [AppComponent::class]
)
interface UserSessionComponent {
    fun getUserManager(): UserManager
    fun getSessionManager(): SessionManager
    
    @Component.Factory
    interface Factory {
        fun create(@Component.Dependency app: AppComponent): UserSessionComponent
    }
}

@Module
abstract class UserSessionModule {
    
    @Binds
    @PerUserSession
    abstract fun bindUserManager(impl: UserManagerImpl): UserManager
    
    @Binds
    @PerUserSession
    abstract fun bindSessionManager(impl: SessionManagerImpl): SessionManager
}

// ==== 使用 ====

class MyApplication : Application() {
    lateinit var appComponent: AppComponent
    var userSessionComponent: UserSessionComponent? = null
    
    fun login(username: String, password: String) {
        // 登录成功后创建用户会话组件
        userSessionComponent = DaggerUserSessionComponent.factory()
            .create(appComponent)
    }
    
    fun logout() {
        // 登出时销毁用户会话组件
        userSessionComponent = null
        // @PerUserSession 作用域的依赖被释放
    }
}
```

### 5.4 Scope 层次结构

```
┌─────────────────────────────────────┐
│         @Singleton                  │  应用生命周期
│         AppComponent                │
├─────────────────────────────────────┤
│         @PerUserSession             │  用户会话生命周期
│         UserSessionComponent        │
├─────────────────────────────────────┤
│         @PerActivity                │  Activity 生命周期
│         ActivityComponent           │
├─────────────────────────────────────┤
│         @PerFragment                │  Fragment 生命周期
│         FragmentComponent           │
└─────────────────────────────────────┘

子组件可以访问父组件的依赖，反之不行
```

---

## 六、SubComponent vs Component 依赖

### 6.1 SubComponent（子组件）

SubComponent 是父组件的一部分，共享父组件的依赖。

```kotlin
// ==== 父组件 ====

@Singleton
@Component(modules = [AppModule::class])
interface AppComponent {
    
    // 创建子组件的工厂
    fun userComponent(): UserComponent.Factory
    fun activityComponent(): ActivityComponent.Factory
}

// ==== 子组件 ====

@PerUserSession
@Subcomponent(modules = [UserModule::class])
interface UserComponent {
    
    fun getUserManager(): UserManager
    
    @Subcomponent.Factory
    interface Factory {
        fun create(): UserComponent
    }
}

// ==== 使用 ====

class MyApplication : Application() {
    lateinit var appComponent: AppComponent
    
    override fun onCreate() {
        super.onCreate()
        appComponent = DaggerAppComponent.create()
    }
    
    fun createUserSession() {
        val userComponent = appComponent.userComponent().create()
        val userManager = userComponent.getUserManager()
    }
}
```

### 6.2 Component Dependencies（组件依赖）

组件依赖是组件之间的松耦合关系。

```kotlin
// ==== 父组件（作为依赖）====

@Singleton
@Component(modules = [AppModule::class])
interface AppComponent {
    fun getApiService(): ApiService
    fun getUserRepository(): UserRepository
}

// ==== 子组件（依赖父组件）====

@PerActivity
@Component(
    modules = [ActivityModule::class],
    dependencies = [AppComponent::class]  // 声明依赖
)
interface ActivityComponent {
    fun inject(activity: MainActivity)
    fun getAdapter(): RecyclerView.Adapter<*>
    
    @Component.Factory
    interface Factory {
        fun create(@Component.Dependency app: AppComponent): ActivityComponent
    }
}

// ==== 使用 ====

class MainActivity : AppCompatActivity() {
    lateinit var activityComponent: ActivityComponent
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val appComponent = (application as MyApplication).appComponent
        activityComponent = DaggerActivityComponent.factory()
            .create(appComponent)
        
        activityComponent.inject(this)
        
        // 可以访问父组件的依赖
        val api = appComponent.getApiService()
        val repo = appComponent.getUserRepository()
    }
}
```

### 6.3 SubComponent vs Dependencies 对比

| 特性 | SubComponent | Component Dependencies |
|------|--------------|----------------------|
| **关系** | 父子关系（紧密） | 依赖关系（松散） |
| **访问** | 自动访问父组件依赖 | 显式声明依赖 |
| **作用域** | 继承父组件作用域 | 独立作用域 |
| **创建** | 通过父组件工厂 | 独立工厂 |
| **推荐度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐（更灵活） |

```kotlin
// ==== 推荐：使用 Component Dependencies ====

// 更清晰、更灵活、更易于测试
@Component(dependencies = [AppComponent::class])
interface ActivityComponent

// ==== 不推荐：复杂的 SubComponent 层次 ====

@Component
interface AppComponent {
    fun userComponent(): UserComponent.Factory
}

@Subcomponent
interface UserComponent {
    fun sessionComponent(): SessionComponent.Factory
}

@Subcomponent
interface SessionComponent {
    // ... 过于复杂
}
```

---

## 七、Lazy 和 Provider 注入

### 7.1 Lazy 注入

`Lazy<T>` 延迟初始化依赖，首次使用时创建。

```kotlin
// ==== 基础用法 ====

class HeavyRepository @Inject constructor(
    private val apiProvider: Lazy<ApiService>
) {
    // api 不会立即创建
    
    fun loadData() {
        // 首次使用时创建
        val api = apiProvider.value
        api.fetchData()
        
        // 后续使用同一实例
        api.moreData()
    }
}

// ==== 实际应用场景 ====

// 场景 1：条件加载
class ConditionalLoader @Inject constructor(
    private val networkChecker: NetworkChecker,
    private val apiProvider: Lazy<ApiService>
) {
    fun loadData() {
        if (networkChecker.isOnline()) {
            // 只有在线时才创建 ApiService
            val api = apiProvider.value
            api.fetchData()
        }
    }
}

// 场景 2：循环依赖
class ClassA @Inject constructor(
    private val bProvider: Lazy<ClassB>  // 延迟获取
) {
    fun doWork() {
        bProvider.value.doSomething()
    }
}

class ClassB @Inject constructor(
    private val a: ClassA  // 直接注入
)

// 场景 3：性能优化
class ExpensiveOperation @Inject constructor(
    private val heavyDepProvider: Lazy<HeavyDependency>
) {
    private val heavyDep: HeavyDependency by lazy { heavyDepProvider.value }
    
    fun operationThatMightNotNeedHeavyDep() {
        // 如果不执行这段代码，HeavyDependency 永远不会创建
        if (shouldUseHeavyDep()) {
            heavyDep.doExpensiveWork()
        }
    }
}
```

### 7.2 Provider 注入

`Provider<T>` 每次获取都创建新实例。

```kotlin
// ==== 基础用法 ====

class FormProcessor @Inject constructor(
    private val formFactory: Provider<Form>
) {
    fun processForms() {
        // 每次获取都是新实例
        val form1 = formFactory.get()
        val form2 = formFactory.get()
        val form3 = formFactory.get()
        
        // form1 != form2 != form3
    }
}

// ==== 实际应用场景 ====

// 场景 1：需要多个实例
class ListAdapter @Inject constructor(
    private val itemFactory: Provider<ItemViewModel>
) {
    fun createItems(count: Int): List<ItemViewModel> {
        return (1..count).map { itemFactory.get() }
        // 每个 ItemViewModel 都是新实例
    }
}

// 场景 2：有状态对象
class RequestHandler @Inject constructor(
    private val requestFactory: Provider<HttpRequest>
) {
    fun handleRequests(requests: List<RequestData>) {
        for (data in requests) {
            // 每个请求使用新的 HttpRequest 实例
            val request = requestFactory.get()
            request.setData(data)
            request.execute()
        }
    }
}

// 场景 3：避免内存泄漏
class CacheManager @Inject constructor(
    private val entryFactory: Provider<CacheEntry>
) {
    fun createEntry(key: String): CacheEntry {
        // 每次创建新的缓存条目
        return entryFactory.get().apply { this.key = key }
    }
}
```

### 7.3 Lazy vs Provider 对比

```kotlin
// ==== 对比表 ====

| 特性 | Lazy<T> | Provider<T> |
|------|---------|-------------|
| **创建时机** | 首次使用时 | 每次 get() 时 |
| **实例数量** | 单例（作用域内） | 每次新实例 |
| **性能** | 高（只创建一次） | 低（每次都创建） |
| **适用场景** | 重量级依赖 | 需要多个实例 |

// ==== 代码对比 ====

class Example @Inject constructor(
    private val lazyDep: Lazy<Dependency>,
    private val providerDep: Provider<Dependency>
) {
    fun test() {
        // Lazy：只创建一次
        lazyDep.value  // 创建
        lazyDep.value  // 复用
        lazyDep.value  // 复用
        
        // Provider：每次都创建
        providerDep.get()  // 创建
        providerDep.get()  // 创建新实例
        providerDep.get()  // 创建新实例
    }
}
```

---

## 八、Multibinding 多绑定

### 8.1 @IntoSet

将多个依赖绑定到 Set 集合。

```kotlin
// ==== 基础用法 ====

@Module
abstract class PluginModule {
    
    @Binds
    @IntoSet
    abstract fun bindPluginA(impl: PluginA): Plugin
    
    @Binds
    @IntoSet
    abstract fun bindPluginB(impl: PluginB): Plugin
    
    @Binds
    @IntoSet
    abstract fun bindPluginC(impl: PluginC): Plugin
}

// ==== 使用 ====

class PluginManager @Inject constructor(
    private val plugins: Set<Plugin>
) {
    fun executeAll() {
        for (plugin in plugins) {
            plugin.execute()
        }
    }
}

// ==== @Provides 方式 ====

@Module
object InterceptorModule {
    
    @Provides
    @IntoSet
    fun provideLoggingInterceptor(): Interceptor {
        return LoggingInterceptor()
    }
    
    @Provides
    @IntoSet
    fun provideAuthInterceptor(): Interceptor {
        return AuthInterceptor()
    }
    
    @Provides
    @IntoSet
    fun provideCacheInterceptor(): Interceptor {
        return CacheInterceptor()
    }
}

// 使用
class ApiClient @Inject constructor(
    @JvmSuppressWildcards private val interceptors: Set<Interceptor>
) {
    fun createClient(): OkHttpClient {
        val builder = OkHttpClient.Builder()
        for (interceptor in interceptors) {
            builder.addInterceptor(interceptor)
        }
        return builder.build()
    }
}
```

### 8.2 @IntoMap

将多个依赖绑定到 Map 集合。

```kotlin
// ==== 基础用法 ====

@Module
abstract class HandlerModule {
    
    @Binds
    @IntoMap
    @StringKey("create")
    abstract fun bindCreateHandler(impl: CreateHandler): RequestHandler
    
    @Binds
    @IntoMap
    @StringKey("update")
    abstract fun bindUpdateHandler(impl: UpdateHandler): RequestHandler
    
    @Binds
    @IntoMap
    @StringKey("delete")
    abstract fun bindDeleteHandler(impl: DeleteHandler): RequestHandler
}

// ==== 使用 ====

class RequestProcessor @Inject constructor(
    private val handlers: Map<String, @JvmSuppressWildcards RequestHandler>
) {
    fun process(request: Request) {
        val handler = handlers[request.type]
            ?: throw IllegalArgumentException("Unknown type: ${request.type}")
        handler.handle(request)
    }
}
```

### 8.3 自定义 Map Key

```kotlin
// ==== 定义 Key 注解 ====

@MapKey
@Retention(AnnotationRetention.RUNTIME)
annotation class StringKey(val value: String)

@MapKey
@Retention(AnnotationRetention.RUNTIME)
annotation class IntKey(val value: Int)

@MapKey
@Retention(AnnotationRetention.RUNTIME)
annotation class ClassKey(val value: KClass<*>)

// ==== 使用自定义 Key ====

@Module
abstract class ViewModelModule {
    
    @Binds
    @IntoMap
    @ClassKey(MainViewModel::class)
    abstract fun bindMainViewModel(viewModel: MainViewModel): ViewModel
    
    @Binds
    @IntoMap
    @ClassKey(DetailViewModel::class)
    abstract fun bindDetailViewModel(viewModel: DetailViewModel): ViewModel
}

// 使用
class ViewModelFactory @Inject constructor(
    private val viewModels: Map<ClassKey, @JvmSuppressWildcards ViewModel>
) : ViewModelProvider.Factory {
    
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return viewModels[ClassKey(modelClass.kotlin)] as T
    }
}
```

### 8.4 实际应用场景

```kotlin
// ==== 场景 1：多数据源 ====

@Module
abstract class DataSourceModule {
    
    @Binds
    @IntoSet
    abstract fun bindNetworkSource(impl: NetworkDataSource): DataSource
    
    @Binds
    @IntoSet
    abstract fun bindCacheSource(impl: CacheDataSource): DataSource
    
    @Binds
    @IntoSet
    abstract fun bindDatabaseSource(impl: DatabaseDataSource): DataSource
}

class DataRepository @Inject constructor(
    private val dataSources: Set<@JvmSuppressWildcards DataSource>
) {
    suspend fun fetchData(): Data {
        // 尝试所有数据源
        for (source in dataSources) {
            val data = source.fetch()
            if (data != null) return data
        }
        throw DataNotFoundException()
    }
}

// ==== 场景 2：多转换器 ====

@Module
object ConverterModule {
    
    @Provides
    @IntoSet
    fun provideGsonConverter(): Converter {
        return GsonConverter()
    }
    
    @Provides
    @IntoSet
    fun provideMoshiConverter(): Converter {
        return MoshiConverter()
    }
    
    @Provides
    @IntoSet
    fun provideJacksonConverter(): Converter {
        return JacksonConverter()
    }
}

class ConverterManager @Inject constructor(
    private val converters: Set<@JvmSuppressWildcards Converter>
) {
    fun <T> convert(data: Any, targetType: Class<T>): T {
        for (converter in converters) {
            if (converter.canConvert(data, targetType)) {
                return converter.convert(data, targetType)
            }
        }
        throw ConversionException("No suitable converter found")
    }
}
```

---

## 九、性能优势分析

### 9.1 编译时 vs 运行时

```
==== 性能对比 ====

Dagger 2（编译时）:
- 代码生成在编译时完成
- 运行时直接调用方法
- 无反射开销
- 性能接近手写代码

Koin（运行时）:
- 依赖解析在运行时
- 使用反射或委托
- 有运行时开销
- 性能约为 Dagger 的 60-80%

手动 DI:
- 完全手写
- 最佳性能
- 维护成本高
```

### 9.2 性能测试数据

```kotlin
// ==== 启动时间测试 ====

测试场景：创建 100 个依赖对象

Dagger 2:     ~5ms   (编译时生成，运行时直接调用)
Koin:         ~15ms  (运行时解析)
手动 DI:      ~3ms   (最优，但维护成本高)

// ==== 内存占用 ====

Dagger 2:     基准
Koin:         +20%   (运行时元数据)
手动 DI:      -10%   (无框架开销)

// ==== 方法数影响 ====

Dagger 2:     +2000-5000 方法（生成的代码）
Koin:         +500-1000 方法
手动 DI:      0
```

### 9.3 优化建议

```kotlin
// ✅ 1. 使用 @Binds 代替 @Provides
@Module
abstract class OptimizedModule {
    @Binds abstract fun bindRepo(impl: RepoImpl): Repository  // 更好
}

// ✅ 2. 减少 Module 数量
@Module(includes = [A::class, B::class, C::class])  // 合并

// ✅ 3. 避免过度作用域
@Provides fun provideLogger(): Logger  // 无需 @Singleton

// ✅ 4. 使用 Lazy 延迟初始化
@Inject constructor(private val heavy: Lazy<HeavyDep>)

// ✅ 5. 减少依赖图复杂度
// 拆分 Component，按需创建
```

---

## 十、面试考点

### 10.1 基础问题

**Q1: Dagger 2 的核心注解有哪些？**

**A:**
```
@Component - 定义依赖注入的入口
@Module - 提供依赖的类
@Provides - 提供依赖实例的方法
@Binds - 绑定接口到实现
@Inject - 标记注入点（构造函数/字段/方法）
@Singleton - 单例作用域
@Scope - 自定义作用域
@Qualifier - 区分相同类型的依赖
@Named - 内置的 Qualifier
```

**Q2: @Provides 和 @Binds 的区别？**

**A:**
```kotlin
// @Provides
// - 用于创建实例
// - 方法体包含创建逻辑
// - 可用于 object 或 class Module
// - 生成额外代码

@Provides
fun provideRepository(): UserRepository {
    return UserRepositoryImpl()
}

// @Binds
// - 用于绑定接口到实现
// - 不创建实例
// - 只能用于 abstract Module
// - 性能更好

@Binds
abstract fun bindRepository(impl: UserRepositoryImpl): UserRepository
```

**Q3: 什么是编译时代码生成？**

**A:**
```
Dagger 2 在编译时通过注解处理器（APT）：
1. 扫描所有 @Component、@Module、@Inject 注解
2. 分析依赖图
3. 生成 Dagger* 工厂类
4. 编译后的代码直接实例化依赖

优势：
- 无反射，性能高
- 编译时检查错误
- 类型安全
```

### 10.2 进阶问题

**Q4: 如何解决循环依赖？**

**A:**
```kotlin
// 方法 1：使用 Lazy
class A @Inject constructor(private val bProvider: Lazy<B>)
class B @Inject constructor(private val a: A)

// 方法 2：使用 Provider
class A @Inject constructor(private val bProvider: Provider<B>)
class B @Inject constructor(private val a: A)

// 方法 3：重构设计
class Coordinator @Inject constructor(private val a: A, private val b: B)
```

**Q5: @Singleton 的作用是什么？**

**A:**
```
@Singleton 表示：
- 在 Component 生命周期内只有一个实例
- 需要 Component 也有 @Singleton 注解
- 不是真正的单例（Component 销毁后实例也销毁）

@Component
@Singleton
interface AppComponent {
    @Provides
    @Singleton
    fun provideApi(): ApiService
}
```

**Q6: Lazy 和 Provider 的区别？**

**A:**
```kotlin
// Lazy<T>
// - 延迟初始化
// - 首次访问时创建
// - 后续访问复用同一实例

@Inject constructor(private val dep: Lazy<Dependency>)
dep.value  // 第一次创建，后续复用

// Provider<T>
// - 每次获取都创建新实例
// - 适合需要多个实例的场景

@Inject constructor(private val dep: Provider<Dependency>)
dep.get()  // 每次都创建新实例
```

### 10.3 高级问题

**Q7: Dagger 2 的依赖图如何构建？**

**A:**
```
1. 从 Component 的注入方法/字段开始
2. 分析每个依赖的构造函数 @Inject
3. 递归分析依赖的依赖
4. 查找 @Module 中的 @Provides 方法
5. 构建完整的依赖树
6. 生成工厂类代码

如果依赖无法满足，编译时报错
```

**Q8: Multibinding 的使用场景？**

**A:**
```kotlin
// @IntoSet - 多个实现
@Module
abstract class PluginModule {
    @Binds @IntoSet abstract fun bindA(a: PluginA): Plugin
    @Binds @IntoSet abstract fun bindB(b: PluginB): Plugin
}
@Inject constructor(private val plugins: Set<Plugin>)

// @IntoMap - 带键的多个实现
@Module
abstract class HandlerModule {
    @Binds @IntoMap @StringKey("create")
    abstract fun bindCreate(h: CreateHandler): Handler
}
@Inject constructor(private val handlers: Map<String, Handler>)
```

**Q9: SubComponent 和 Component Dependencies 的区别？**

**A:**
```
SubComponent:
- 父子关系，紧密耦合
- 自动访问父组件依赖
- 通过父组件工厂创建

Component Dependencies:
- 依赖关系，松耦合
- 显式声明依赖
- 独立工厂创建
- 更灵活，推荐
```

**Q10: Dagger 2 的性能优势来自哪里？**

**A:**
```
1. 编译时代码生成（无反射）
2. 直接方法调用（无委托）
3. 依赖图预计算（无运行时解析）
4. 编译器优化（内联、死代码消除）

性能对比：
- Dagger 2: ~5ms 创建 100 个依赖
- Koin: ~15ms（3 倍差距）
- 手动 DI: ~3ms（但维护成本高）
```

---

## 十一、最佳实践和常见错误

### 11.1 最佳实践 ✅

```kotlin
// 1. 优先使用构造函数注入
class Repository @Inject constructor(private val api: ApiService)

// 2. 使用 @Binds 代替 @Provides（绑定接口时）
@Binds abstract fun bindRepo(impl: RepoImpl): Repository

// 3. 合理使用作用域
@Singleton fun provideApi(): ApiService  // 重量级
fun provideLogger(): Logger  // 轻量级无需作用域

// 4. 使用 Component Dependencies 而非复杂 SubComponent
@Component(dependencies = [AppComponent::class])
interface ActivityComponent

// 5. 使用 Lazy 延迟初始化重量级依赖
@Inject constructor(private val heavy: Lazy<HeavyDep>)

// 6. 使用 Qualifier 区分相同类型
@Named("base_url") fun provideUrl(): String
@Named("cdn_url") fun provideCdnUrl(): String
```

### 11.2 常见错误 ❌

```kotlin
// 1. 忘记 Component 的作用域
@Component  // 缺少 @Singleton
interface AppComponent {
    @Provides @Singleton  // 编译错误！
    fun provideApi(): ApiService
}

// 2. 在单例中持有 Activity Context
@Singleton
fun provideDep(activity: Activity): Dep  // 内存泄漏！

// 3. 循环依赖
class A @Inject constructor(b: B)
class B @Inject constructor(a: A)  // 编译错误

// 4. 忘记 @Inject 构造函数
class Repository constructor(  // 缺少 @Inject
    private val api: ApiService
)

// 5. Module 不是 object 或 abstract
@Module
class MyModule {  // 如果是 @Provides 需要实例化
    @Provides fun provideX(): X = X()
}
```

---

## 十二、参考资料

### 官方文档
- [Dagger 2 官方文档](https://dagger.dev/)
- [Dagger 2 GitHub](https://github.com/google/dagger)
- [Dagger 2 用户指南](https://dagger.dev/dev-guide/)

### 进阶阅读
- [Dagger 2 源码分析](https://medium.com/@iammert/dagger-2-source-code-analysis)
- [Dagger vs Koin 性能对比](https://proandroiddev.com/dagger-2-vs-koin-performance-comparison)
- [Dagger 2 最佳实践](https://github.com/googlesamples/android-architecture)

### 视频资源
- [Dagger 2 官方教程](https://www.youtube.com/results?search_query=dagger+2+tutorial)
- [Google I/O Dagger 演讲](https://www.youtube.com/watch?v=KjE2IDphA_U)

---

**🔗 上一篇**: [Hilt 框架详解](02_Hilt 框架.md)
**🔗 下一篇**: [Koin 框架详解](04_Koin.md)
