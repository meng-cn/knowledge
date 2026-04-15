# MVVM 架构与 Hilt 依赖注入 🏗️

> Android 架构设计核心，大厂面试必考

---

## 一、MVVM 架构详解

### 1.1 架构核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    MVVM 架构分层                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  View Layer (UI)                                        │
│  ├── Activity                                           │
│  ├── Fragment                                           │
│  └── Composable                                         │
│         ↓ (观察)                                        │
│  ViewModel Layer (业务逻辑)                              │
│  ├── 持有 UI 数据                                         │
│  ├── 处理业务逻辑                                        │
│  └── 生命周期感知                                        │
│         ↓ (调用)                                        │
│  Model Layer (数据)                                     │
│  ├── Repository (数据仓库)                              │
│  ├── Local DataSource (本地数据源)                      │
│  └── Remote DataSource (远程数据源)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心组件职责

| 层级 | 组件 | 职责 | 不做什么 |
|------|------|------|---------|
| **View** | Activity/Fragment | 展示数据、用户交互 | 不处理业务逻辑 |
| **ViewModel** | ViewModel | 持有 UI 数据、业务逻辑 | 不持有 View 引用 |
| **Model** | Repository | 数据获取、缓存策略 | 不关心 UI |

---

## 二、MVVM 实战实现

### 2.1 完整代码示例

```kotlin
// ==================== 1. 数据层 ====================

// 数据模型
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val avatar: String
)

// 数据类（UI 展示用）
data class UserUiModel(
    val id: Int,
    val displayName: String,
    val avatarUrl: String,
    val isOnline: Boolean
)

// 本地数据源
class UserLocalDataSource @Inject constructor(
    private val userDao: UserDao
) {
    suspend fun getUser(): User? {
        return userDao.getUser()
    }
    
    suspend fun saveUser(user: User) {
        userDao.insert(user)
    }
}

// 远程数据源
class UserRemoteDataSource @Inject constructor(
    private val userApi: UserApi
) {
    suspend fun getUser(): User {
        return userApi.getUser()
    }
}

// 数据仓库（单一数据源）
class UserRepository @Inject constructor(
    private val localDataSource: UserLocalDataSource,
    private val remoteDataSource: UserRemoteDataSource
) {
    // 网络优先，缓存兜底
    suspend fun getUser(): Result<User> {
        return try {
            // 先请求网络
            val user = remoteDataSource.getUser()
            // 缓存到本地
            localDataSource.saveUser(user)
            Result.success(user)
        } catch (e: Exception) {
            // 网络失败，使用缓存
            val cachedUser = localDataSource.getUser()
            if (cachedUser != null) {
                Result.success(cachedUser)
            } else {
                Result.failure(e)
            }
        }
    }
    
    // Flow 方式
    fun getUserFlow(): Flow<User> = flow {
        val user = getUser().getOrThrow()
        emit(user)
    }.flowOn(Dispatchers.IO)
}

// ==================== 2. ViewModel 层 ====================

// UI 状态
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String, val code: Int? = null) : UiState<Nothing>()
}

// UI 事件
sealed class UiEvent {
    object NavigateBack : UiEvent()
    data class ShowSnackbar(val message: String) : UiEvent()
    data class NavigateToDetail(val userId: Int) : UiEvent()
}

// ViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // UI 状态 - StateFlow
    private val _uiState = MutableStateFlow<UiState<UserUiModel>>(UiState.Loading)
    val uiState: StateFlow<UiState<UserUiModel>> = _uiState.asStateFlow()
    
    // UI 事件 - SharedFlow
    private val _uiEvent = MutableSharedFlow<UiEvent>()
    val uiEvent: SharedFlow<UiEvent> = _uiEvent.asSharedFlow()
    
    // 加载用户数据
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            userRepository.getUserFlow()
                .flowOn(Dispatchers.IO)
                .catch { e ->
                    _uiState.value = UiState.Error(
                        message = e.message ?: "加载失败",
                        code = -1
                    )
                    _uiEvent.emit(UiEvent.ShowSnackbar("加载失败"))
                }
                .map { user ->
                    // 转换为 UI 模型
                    user.toUiModel()
                }
                .collect { userUiModel ->
                    _uiState.value = UiState.Success(userUiModel)
                }
        }
    }
    
    // 刷新数据
    fun refresh() {
        viewModelScope.launch {
            _uiEvent.emit(UiEvent.ShowSnackbar("正在刷新..."))
            loadUser(currentUserId)
        }
    }
    
    // 处理用户点击
    fun onUserClick(userId: Int) {
        viewModelScope.launch {
            _uiEvent.emit(UiEvent.NavigateToDetail(userId))
        }
    }
    
    // 返回
    fun navigateBack() {
        viewModelScope.launch {
            _uiEvent.emit(UiEvent.NavigateBack)
        }
    }
    
    // 扩展函数：数据模型 → UI 模型
    private fun User.toUiModel(): UserUiModel {
        return UserUiModel(
            id = id,
            displayName = name.ifEmpty { "未知用户" },
            avatarUrl = avatar,
            isOnline = checkIsOnline()
        )
    }
    
    private fun User.checkIsOnline(): Boolean {
        // 检查在线状态逻辑
        return true
    }
}

// ==================== 3. View 层 ====================

// Activity
class UserActivity : AppCompatActivity() {
    
    @Inject lateinit var viewModelFactory: ViewModelProvider.Factory
    private val viewModel: UserViewModel by viewModels { viewModelFactory }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user)
        
        setupViews()
        observeViewModel()
        
        // 加载数据
        viewModel.loadUser(userId)
    }
    
    private fun setupViews() {
        // 设置点击事件
        btnRefresh.setOnClickListener {
            viewModel.refresh()
        }
        
        btnBack.setOnClickListener {
            viewModel.navigateBack()
        }
    }
    
    private fun observeViewModel() {
        // 观察 UI 状态
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        renderUiState(state)
                    }
                }
                
                launch {
                    viewModel.uiEvent.collect { event ->
                        handleUiEvent(event)
                    }
                }
            }
        }
    }
    
    private fun renderUiState(state: UiState<UserUiModel>) {
        when (state) {
            is UiState.Loading -> {
                progressBar.visible()
                contentView.gone()
                errorView.gone()
            }
            is UiState.Success -> {
                progressBar.gone()
                contentView.visible()
                errorView.gone()
                
                // 渲染数据
                textViewName.text = state.data.displayName
                imageViewAvatar.load(state.data.avatarUrl)
            }
            is UiState.Error -> {
                progressBar.gone()
                contentView.gone()
                errorView.visible()
                textViewError.text = state.message
            }
        }
    }
    
    private fun handleUiEvent(event: UiEvent) {
        when (event) {
            is UiEvent.ShowSnackbar -> {
                Snackbar.make(rootView, event.message, Snackbar.LENGTH_SHORT).show()
            }
            is UiEvent.NavigateBack -> {
                finish()
            }
            is UiEvent.NavigateToDetail -> {
                startActivity(Intent(this, DetailActivity::class.java))
            }
        }
    }
}

// Fragment
class UserFragment : Fragment() {
    
    private val viewModel: UserViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    // 更新 UI
                }
            }
        }
    }
}
```

### 2.2 Jetpack Compose + MVVM

```kotlin
// Compose UI
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val coroutineScope = rememberCoroutineScope()
    
    // 收集事件
    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { event ->
            // 处理事件
        }
    }
    
    UserScreenContent(
        uiState = uiState,
        onRefreshClick = { viewModel.refresh() },
        onUserClick = { userId -> viewModel.onUserClick(userId) }
    )
}

@Composable
fun UserScreenContent(
    uiState: UiState<UserUiModel>,
    onRefreshClick: () -> Unit,
    onUserClick: (Int) -> Unit
) {
    when (val state = uiState) {
        is UiState.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        is UiState.Success -> {
            Column {
                Text(text = state.data.displayName)
                AsyncImage(
                    model = state.data.avatarUrl,
                    contentDescription = null
                )
                Button(onClick = onRefreshClick) {
                    Text("刷新")
                }
            }
        }
        is UiState.Error -> {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(text = "错误：${state.message}")
                Button(onClick = onRefreshClick) {
                    Text("重试")
                }
            }
        }
    }
}
```

---

## 三、Hilt 依赖注入

### 3.1 Hilt 基础配置

```kotlin
// 1. 添加依赖
// build.gradle.kts (app)
plugins {
    id("com.google.dagger.hilt.android")
}

dependencies {
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-android-compiler:2.48")
}

// 2. Application 配置
@HiltAndroidApp
class MyApplication : Application()

// 3. AndroidManifest.xml
<application
    android:name=".MyApplication"
    ... >
```

### 3.2 Hilt 注解详解

```kotlin
// @Inject - 构造函数注入
class UserRepository @Inject constructor(
    private val localDataSource: UserLocalDataSource,
    private val remoteDataSource: UserRemoteDataSource
)

// @Module + @Provides - 方法注入
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
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
    fun provideUserApi(retrofit: Retrofit): UserApi {
        return retrofit.create(UserApi::class.java)
    }
    
    @Provides
    @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .setDateFormat("yyyy-MM-dd HH:mm:ss")
            .create()
    }
}

// @HiltViewModel - ViewModel 注入
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel()

// @AndroidEntryPoint - Activity/Fragment 注入
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject lateinit var viewModelFactory: ViewModelProvider.Factory
}

// @HiltView - View 注入
@AndroidEntryPoint
class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    @Inject lateinit var repository: UserRepository
}
```

### 3.3 Hilt 作用域

```kotlin
// 1. @Singleton - 应用生命周期
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideDatabase(): AppDatabase {
        return Room.databaseBuilder(...)
    }
}

// 2. @ViewModelScoped - ViewModel 生命周期
@Module
@InstallIn(ViewModelComponent::class)
object ViewModelModule {
    @Provides
    @ViewModelScoped
    fun provideUseCase(): GetUserUseCase {
        return GetUserUseCase()
    }
}

// 3. @ActivityScoped - Activity 生命周期
@Module
@InstallIn(ActivityComponent::class)
abstract class ActivityModule {
    @Binds
    @ActivityScoped
    abstract fun bindNavigationHost(navHost: NavHost): NavHost
}

// 4. @FragmentScoped - Fragment 生命周期
@Module
@InstallIn(FragmentComponent::class)
object FragmentModule {
    @Provides
    @FragmentScoped
    fun provideAdapter(): RecyclerView.Adapter<*> {
        return MyAdapter()
    }
}
```

### 3.4 限定符（Qualifier）

```kotlin
// 1. @Named
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    @Named("base_url")
    fun provideBaseUrl(): String {
        return "https://api.example.com/"
    }
    
    @Provides
    @Singleton
    @Named("timeout")
    fun provideTimeout(): Long {
        return 30L
    }
}

// 使用
class ApiClient @Inject constructor(
    @Named("base_url") private val baseUrl: String,
    @Named("timeout") private val timeout: Long
)

// 2. 自定义限定符
@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class OkHttpClient

@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class RetrofitClient

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    @OkHttpClient
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    @RetrofitClient
    fun provideRetrofit(
        @OkHttpClient client: OkHttpClient
    ): Retrofit {
        return Retrofit.Builder()
            .client(client)
            .baseUrl(BASE_URL)
            .build()
    }
}
```

---

## 四、高级架构模式

### 4.1 Clean Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Clean Architecture 分层                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Presentation Layer (展示层)                            │
│  ├── UI (Activity/Fragment/Compose)                    │
│  ├── ViewModel                                          │
│  └── UI State/Event                                     │
│                                                         │
│  Domain Layer (业务逻辑层)                              │
│  ├── Use Cases (业务用例)                               │
│  ├── Domain Models (领域模型)                           │
│  └── Repository Interfaces (仓库接口)                   │
│                                                         │
│  Data Layer (数据层)                                    │
│  ├── Repository Implementations                        │
│  ├── Local Data Sources (Room, DataStore)              │
│  └── Remote Data Sources (Retrofit, API)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Use Case 实现

```kotlin
// Use Case 基类
abstract class UseCase<in Params, out Type> {
    abstract suspend fun run(params: Params): Type
    
    suspend operator fun invoke(params: Params): Type {
        return run(params)
    }
}

// 无参数 Use Case
abstract class UseCaseNoParams<out Type> {
    abstract suspend fun run(): Type
    
    suspend operator fun invoke(): Type {
        return run()
    }
}

// 具体 Use Case
class GetUserUseCase @Inject constructor(
    private val userRepository: UserRepository
) : UseCase<GetUserParams, User>() {
    
    override suspend fun run(params: GetUserParams): User {
        return userRepository.getUser(params.userId).getOrThrow()
    }
}

// 参数类
data class GetUserParams(val userId: Int)

// 使用 Use Case
@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUserUseCase: GetUserUseCase,
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val uiState: StateFlow<UiState<User>> = _uiState.asStateFlow()
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            val result = getUserUseCase(GetUserParams(userId))
            _uiState.value = UiState.Success(result)
        }
    }
}
```

### 4.3 Repository 模式进阶

```kotlin
// 通用 Repository 基类
abstract class BaseRepository {
    
    // 网络请求封装
    protected suspend fun <T> safeApiCall(
        apiCall: suspend () -> Response<T>
    ): Result<T> {
        return try {
            val response = apiCall()
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) }
                    ?: Result.failure(Exception("响应体为空"))
            } else {
                Result.failure(Exception("Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // 带缓存的网络请求
    protected suspend fun <T> fetchWithCache(
        cacheKey: String,
        apiCall: suspend () -> Result<T>,
        cacheDuration: Long = 5 * 60 * 1000 // 5 分钟
    ): Result<T> {
        // 检查缓存
        val cached = getCache<T>(cacheKey, cacheDuration)
        if (cached != null) {
            return Result.success(cached)
        }
        
        // 请求网络
        return apiCall().onSuccess { data ->
            saveCache(cacheKey, data)
        }
    }
    
    private fun <T> getCache(key: String, duration: Long): T? {
        // 实现缓存逻辑
        return null
    }
    
    private fun <T> saveCache(key: String, data: T) {
        // 实现缓存保存
    }
}

// 具体 Repository
class UserRepository @Inject constructor(
    private val userApi: UserApi,
    private val userDao: UserDao,
    private val preferences: DataStore<Preferences>
) : BaseRepository() {
    
    suspend fun getUser(userId: Int): Result<User> {
        return fetchWithCache(
            cacheKey = "user_$userId",
            apiCall = {
                safeApiCall { userApi.getUser(userId) }
            }
        )
    }
    
    suspend fun updateUser(user: User): Result<Unit> {
        return safeApiCall { userApi.updateUser(user) }
            .onSuccess {
                userDao.update(user)
            }
    }
}
```

---

## 五、MVI 架构

### 5.1 MVI 核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    MVI 架构流程                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  View  →  Intent (用户意图)                             │
│    ↑         ↓                                          │
│    │     ViewModel (处理 Intent)                        │
│    ↑         ↓                                          │
│    └── State (不可变状态)                               │
│                                                         │
│  单向数据流：View → Intent → State → View              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 MVI 实现示例

```kotlin
// 1. 定义 State
data class UserState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val events: List<UserEvent> = emptyList()
)

// 2. 定义 Intent
sealed class UserIntent {
    object LoadUser : UserIntent()
    data class UpdateUser(val user: User) : UserIntent()
    object Refresh : UserIntent()
    object ClearError : UserIntent()
}

// 3. 定义 Event
sealed class UserEvent {
    data class ShowMessage(val message: String) : UserEvent()
    object NavigateBack : UserEvent()
}

// 4. ViewModel 实现
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    // 处理 Intent
    fun processIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUser -> loadUser()
            is UserIntent.UpdateUser -> updateUser(intent.user)
            is UserIntent.Refresh -> refresh()
            is UserIntent.ClearError -> clearError()
        }
    }
    
    private fun loadUser() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            
            val result = userRepository.getUser()
            
            _state.value = when {
                result.isSuccess -> {
                    _state.value.copy(
                        isLoading = false,
                        user = result.getOrNull()
                    )
                }
                else -> {
                    _state.value.copy(
                        isLoading = false,
                        error = result.exceptionOrNull()?.message
                    )
                }
            }
        }
    }
    
    private fun updateUser(user: User) {
        viewModelScope.launch {
            val result = userRepository.updateUser(user)
            if (result.isFailure) {
                _state.update { currentState ->
                    currentState.copy(
                        error = result.exceptionOrNull()?.message
                    )
                }
            }
        }
    }
    
    private fun refresh() {
        // 刷新逻辑
    }
    
    private fun clearError() {
        _state.update { it.copy(error = null) }
    }
}

// 5. View 层
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsState()
    
    // 渲染 UI
    UserScreenContent(
        state = state,
        onIntent = { intent -> viewModel.processIntent(intent) }
    )
}

@Composable
fun UserScreenContent(
    state: UserState,
    onIntent: (UserIntent) -> Unit
) {
    Column {
        if (state.isLoading) {
            CircularProgressIndicator()
        }
        
        state.user?.let { user ->
            Text(text = user.name)
            Button(onClick = { onIntent(UserIntent.Refresh) }) {
                Text("刷新")
            }
        }
        
        state.error?.let { error ->
            Text(text = "错误：$error")
            Button(onClick = { onIntent(UserIntent.ClearError) }) {
                Text("清除错误")
            }
        }
    }
}
```

---

## 六、面试核心考点

### 6.1 基础问题

**Q1: MVVM 的优势？**

**A:**
1. **解耦**: View 和 ViewModel 分离，便于测试
2. **生命周期感知**: ViewModel 在配置更新时保留
3. **数据绑定**: 自动更新 UI
4. **单一职责**: 各层职责清晰

**Q2: ViewModel 为什么能保留数据？**

**A:**
- ViewModelStore 持有 ViewModel
- 配置更新（如屏幕旋转）时，Activity 重建但 ViewModelStore 保留
- 只有在 `finish()` 或进程被杀时才销毁

**Q3: LiveData vs StateFlow？**

**A:**
| 特性 | LiveData | StateFlow |
|------|---------|-----------|
| **生命周期** | 感知 | 需配合 `repeatOnLifecycle` |
| **平台** | Android | Multiplatform |
| **操作符** | 少 | 丰富 |
| **背压** | 有 | 可配置 |
| **推荐** | 旧项目 | 新项目 |

### 6.2 进阶问题

**Q4: Hilt 的优势？**

**A:**
1. **编译时检查**: 错误在编译时发现
2. **代码生成**: 减少模板代码
3. **作用域管理**: 清晰的生命周期
4. **与 Jetpack 集成**: ViewModel、Navigation 等

**Q5: 如何实现依赖倒置？**

**A:**
```kotlin
// 定义接口（Domain 层）
interface UserRepository {
    suspend fun getUser(): User
}

// 实现接口（Data 层）
class UserRepositoryImpl @Inject constructor(
    private val api: UserApi
) : UserRepository {
    override suspend fun getUser(): User {
        return api.getUser()
    }
}

// 使用接口（Presentation 层）
class UserViewModel @Inject constructor(
    private val repository: UserRepository  // 依赖接口
) : ViewModel()
```

**Q6: Clean Architecture 的优势？**

**A:**
1. **可测试性**: 各层独立，易于单元测试
2. **可维护性**: 职责清晰，代码易读
3. **可扩展性**: 新增功能不影响现有代码
4. **技术无关**: Domain 层不依赖具体实现

### 6.3 实战问题

**Q7: 如何处理 ViewModel 中的异常？**

**A:**
```kotlin
// 方式 1: try-catch
fun loadData() {
    viewModelScope.launch {
        try {
            val data = repository.getData()
            _uiState.value = UiState.Success(data)
        } catch (e: Exception) {
            _uiState.value = UiState.Error(e.message)
        }
    }
}

// 方式 2: Result 封装
fun loadData() {
    viewModelScope.launch {
        repository.getData()
            .onSuccess { _uiState.value = UiState.Success(it) }
            .onFailure { _uiState.value = UiState.Error(it.message) }
    }
}

// 方式 3: Flow catch
fun loadData() {
    viewModelScope.launch {
        repository.getDataFlow()
            .catch { e -> _uiState.value = UiState.Error(e.message) }
            .collect { data -> _uiState.value = UiState.Success(data) }
    }
}
```

**Q8: 如何测试 ViewModel？**

**A:**
```kotlin
// 单元测试
@Test
fun `loadUser returns success state`() = runTest {
    // 准备
    val mockRepository = mockk<UserRepository>()
    coEvery { mockRepository.getUser() } returns Result.success(User(1, "Test"))
    
    val viewModel = UserViewModel(mockRepository)
    
    // 执行
    viewModel.loadUser(1)
    
    // 验证
    val state = viewModel.uiState.value
    assertTrue(state is UiState.Success)
    assertEquals("Test", (state as UiState.Success).user.name)
}
```

---

## 七、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| MVVM 优势 | ⭐⭐ | 解耦、生命周期感知 |
| ViewModel 保留原理 | ⭐⭐⭐ | ViewModelStore |
| LiveData vs StateFlow | ⭐⭐ | 生命周期、操作符 |
| Hilt 优势 | ⭐⭐⭐ | 编译时检查、作用域 |
| 依赖倒置 | ⭐⭐⭐ | 接口抽象 |
| Clean Architecture | ⭐⭐⭐⭐ | 分层、可测试性 |
| MVI 架构 | ⭐⭐⭐⭐ | 单向数据流、不可变状态 |
| ViewModel 测试 | ⭐⭐⭐ | Mockk、runTest |

---

**📚 参考资料**
- [Android Architecture Guide](https://developer.android.com/topic/architecture)
- [Hilt 官方文档](https://developer.android.com/training/dependency-injection/hilt-android)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
