# VIPER 架构深度解析 🔷

> iOS 领域经典架构，Android 复杂项目备选方案

---

## 一、VIPER 架构核心概念

### 1.1 架构概述

VIPER（View-Interactor-Presenter-Entity-Router）是 iOS 领域经典的架构模式，源于 Clean Architecture 思想，在 Android 复杂项目中也有应用场景。

```
┌─────────────────────────────────────────────────────────┐
│                    VIPER 架构分层                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────┐            │
│  │              View Layer                 │            │
│  │  - Activity/Fragment                    │            │
│  │  - 展示 UI，接收用户输入                │            │
│  │  - 不处理业务逻辑                       │            │
│  └──────────────┬──────────────────────────┘            │
│                 │                                        │
│                 ↓                                        │
│  ┌─────────────────────────────────────────┐            │
│  │            Presenter                    │            │
│  │  - 连接 View 和 Interactor              │            │
│  │  - 处理 UI 相关逻辑                     │            │
│  │  - 准备数据给 View                      │            │
│  └──────────────┬──────────────────────────┘            │
│                 │                                        │
│                 ↓                                        │
│  ┌─────────────────────────────────────────┐            │
│  │           Interactor                    │            │
│  │  - 核心业务逻辑                         │            │
│  │  - 数据获取和转换                      │            │
│  │  - 调用 Repository/DataManager         │            │
│  │  - 无 UI 依赖                           │            │
│  └──────────────┬──────────────────────────┘            │
│                 │                                        │
│                 ↓                                        │
│  ┌─────────────────────────────────────────┐            │
│  │              Entity                     │            │
│  │  - 纯数据模型                          │            │
│  │  - 业务领域对象                        │            │
│  │  - 无依赖                             │            │
│  └──────────────┬──────────────────────────┘            │
│                 │                                        │
│                 ↓                                        │
│  ┌─────────────────────────────────────────┐            │
│  │             Router                       │            │
│  │  - 页面跳转                              │            │
│  │  - 导航逻辑处理                         │            │
│  │  - 传递参数                             │            │
│  └─────────────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心组件职责

| 组件 | 职责 | 依赖 | 特点 |
|------|------|------|------|
| **View** | 展示数据、接收输入 | Presenter | 被动、瘦客户端 |
| **Presenter** | 协调 View 和 Interactor | View(接口)、Interactor(接口) | UI 逻辑、数据转换 |
| **Interactor** | 核心业务逻辑 | Repository、Entity | 可测试、无 UI 依赖 |
| **Entity** | 业务数据模型 | 无 | 纯数据、无依赖 |
| **Router** | 页面导航 | 无 | 导航逻辑独立 |

### 1.3 VIPER vs 其他架构

```
┌─────────────────────────────────────────────────────────┐
│                  架构分层对比                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MVC:  3 层                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐                         │
│  │ View │  │ Model│  │ Ctrl │                         │
│  └──────┘  └──────┘  └──────┘                         │
│                                                         │
│  MVP:  3 层                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐                         │
│  │ View │  │Model │  │ Pres │                         │
│  └──────┘  └──────┘  └──────┘                         │
│                                                         │
│  MVVM: 3 层                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐                         │
│  │ View │  │Model │  │VM    │                         │
│  └──────┘  └──────┘  └──────┘                         │
│                                                         │
│  VIPER: 5 层                                            │
│  ┌──────┐  ┌──────┐  ┌─────────┐  ┌──────┐  ┌──────┐ │
│  │ View │  │Pres  │  │ Interac │  │ Entity│  │Route ││
│  └──────┘  └──────┘  └─────────┘  └──────┘  └──────┘ │
│                                                         │
│  层数越多，职责越清晰，但代码量也越大                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 二、VIPER 实战实现

### 2.1 完整用户模块示例

```kotlin
// ==================== 1. Entity 层 - 纯数据模型 ====================

// 用户实体
data class UserEntity(
    val id: Int,
    val name: String,
    val email: String,
    val avatarUrl: String,
    val createdAt: Long
) {
    // 业务方法（领域逻辑）
    fun isActive(): Boolean = System.currentTimeMillis() - createdAt < 365 * 24 * 60 * 60 * 1000
    
    fun displayName(): String = name.ifEmpty { "未知用户" }
    
    fun isValidEmail(): Boolean = email.contains("@")
}

// 用户列表实体
data class UserListEntity(
    val users: List<UserEntity>,
    val total: Int,
    val page: Int,
    val pageSize: Int
) {
    val hasMore: Boolean get() = users.size >= pageSize && (page + 1) * pageSize < total
}

// ==================== 2. View 层 - 接口定义 ====================

// View 协议
interface UserViewProtocol {
    fun showLoading()
    fun hideLoading()
    fun showUsers(users: List<UserUIModel>)
    fun showError(message: String)
    fun showEmpty()
    
    // 返回必要数据给 Presenter
    fun getUserId(): Int
    fun getPageSize(): Int
}

// UI 模型（与 Entity 转换）
data class UserUIModel(
    val id: Int,
    val displayName: String,
    val email: String,
    val avatarUrl: String,
    val isActive: Boolean
)

// ==================== 3. Presenter 层 - 业务协调 ====================

// Presenter 协议
interface UserPresenterProtocol {
    fun viewDidLoad()
    fun onRefresh()
    fun onUserClick(userId: Int)
    fun onRetry()
}

// Presenter 实现
class UserPresenterImpl @Inject constructor(
    private val interactor: UserInteractorProtocol
) : UserPresenterProtocol {
    
    // View 的弱引用
    private var _view: WeakReference<UserViewProtocol>? = null
    
    private val view: UserViewProtocol
        get() = _view?.get() ?: throw IllegalStateException("View not attached")
    
    // 关联 View
    fun attachView(view: UserViewProtocol) {
        _view = WeakReference(view)
    }
    
    // 解离 View
    fun detachView() {
        _view?.clear()
        _view = null
    }
    
    override fun viewDidLoad() {
        loadUsers()
    }
    
    override fun onRefresh() {
        loadUsers()
    }
    
    override fun onUserClick(userId: Int) {
        // 通知 Router 跳转
    }
    
    override fun onRetry() {
        loadUsers()
    }
    
    private fun loadUsers() {
        view.showLoading()
        
        viewModelScope.launch {
            try {
                val userId = view.getUserId()
                val pageSize = view.getPageSize()
                
                val userList = interactor.loadUsers(userId, pageSize)
                
                if (isAttached()) {
                    view.hideLoading()
                    
                    if (userList.users.isEmpty()) {
                        view.showEmpty()
                    } else {
                        // 转换为 UI 模型
                        val uiModels = userList.users.map { it.toUIModel() }
                        view.showUsers(uiModels)
                    }
                }
            } catch (e: Exception) {
                if (isAttached()) {
                    view.hideLoading()
                    view.showError(e.message ?: "加载失败")
                }
            }
        }
    }
    
    private fun UserEntity.toUIModel(): UserUIModel {
        return UserUIModel(
            id = id,
            displayName = displayName(),
            email = email,
            avatarUrl = avatarUrl,
            isActive = isActive()
        )
    }
    
    private fun isAttached(): Boolean = _view?.get() != null
}

// ==================== 4. Interactor 层 - 核心业务逻辑 ====================

// Interactor 协议
interface UserInteractorProtocol {
    suspend fun loadUsers(userId: Int, pageSize: Int): UserListEntity
    suspend fun getUserDetail(userId: Int): UserEntity
    suspend fun searchUsers(keyword: String): List<UserEntity>
}

// Interactor 实现
class UserInteractorImpl @Inject constructor(
    private val userRepository: UserRepository
) : UserInteractorProtocol {
    
    override suspend fun loadUsers(userId: Int, pageSize: Int): UserListEntity {
        // 业务逻辑：加载用户列表
        val users = userRepository.getUsers(userId, pageSize)
        
        return UserListEntity(
            users = users,
            total = users.size,
            page = 1,
            pageSize = pageSize
        )
    }
    
    override suspend fun getUserDetail(userId: Int): UserEntity {
        // 业务逻辑：获取用户详情
        val user = userRepository.getUser(userId)
        
        // 应用业务规则
        return user.copy(
            // 添加业务逻辑处理
        )
    }
    
    override suspend fun searchUsers(keyword: String): List<UserEntity> {
        // 业务逻辑：搜索用户
        val results = userRepository.search(keyword)
        
        // 过滤和排序
        return results
            .filter { it.isActive() }
            .sortedBy { it.name }
    }
    
    // 复杂业务逻辑示例
    suspend fun getUsersWithFilters(
        userId: Int,
        minAge: Int? = null,
        maxAge: Int? = null,
        isActive: Boolean? = null
    ): List<UserEntity> {
        val allUsers = userRepository.getUsers(userId)
        
        return allUsers.filter { user ->
            // 应用过滤规则
            when {
                isActive != null -> user.isActive() == isActive
                else -> true
            }
        }
    }
}

// ==================== 5. Router 层 - 导航处理 ====================

// Router 协议
interface UserRouterProtocol {
    fun navigateToUserDetail(userId: Int)
    fun navigateToSearch()
    fun navigateBack()
    fun navigateToLogin()
}

// Router 实现
class UserRouterImpl @Inject constructor(
    private val activity: AppCompatActivity
) : UserRouterProtocol {
    
    override fun navigateToUserDetail(userId: Int) {
        val intent = Intent(activity, UserDetailActivity::class.java).apply {
            putExtra(EXTRA_USER_ID, userId)
        }
        activity.startActivity(intent)
        activity.overridePendingTransition(R.anim.slide_in, R.anim.slide_out)
    }
    
    override fun navigateToSearch() {
        val intent = Intent(activity, SearchActivity::class.java)
        activity.startActivity(intent)
    }
    
    override fun navigateBack() {
        activity.onBackPressed()
    }
    
    override fun navigateToLogin() {
        val intent = Intent(activity, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        activity.startActivity(intent)
    }
    
    companion object {
        private const val EXTRA_USER_ID = "user_id"
    }
}

// ==================== 6. View 实现 - Activity/Fragment ====================

class UserActivity : AppCompatActivity(), UserViewProtocol {
    
    private lateinit var presenter: UserPresenterProtocol
    private lateinit var router: UserRouterProtocol
    
    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyView: ViewGroup
    private lateinit var errorView: ViewGroup
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user)
        
        initViews()
        initPresenter()
        initRouter()
        
        // 关联 View
        (presenter as UserPresenterImpl).attachView(this)
        
        // 加载数据
        presenter.viewDidLoad()
    }
    
    private fun initViews() {
        recyclerView = findViewById(R.id.recyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyView = findViewById(R.id.emptyView)
        errorView = findViewById(R.id.errorView)
        
        setupRecyclerView()
    }
    
    private fun setupRecyclerView() {
        val adapter = UserAdapter()
        recyclerView.adapter = adapter
        
        adapter.setOnItemClickListener { position ->
            val user = adapter.getItem(position)
            presenter.onUserClick(user.id)
        }
    }
    
    private fun initPresenter() {
        presenter = Hilt_DependencyUserPresenterImpl(this)
    }
    
    private fun initRouter() {
        router = Hilt_DependencyUserRouterImpl(this)
    }
    
    // 实现 View 协议
    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        recyclerView.visibility = View.GONE
        emptyView.visibility = View.GONE
        errorView.visibility = View.GONE
    }
    
    override fun hideLoading() {
        progressBar.visibility = View.GONE
    }
    
    override fun showUsers(users: List<UserUIModel>) {
        hideLoading()
        recyclerView.visibility = View.VISIBLE
        emptyView.visibility = View.GONE
        errorView.visibility = View.GONE
        
        (recyclerView.adapter as UserAdapter).updateData(users)
    }
    
    override fun showError(message: String) {
        hideLoading()
        recyclerView.visibility = View.GONE
        emptyView.visibility = View.GONE
        errorView.visibility = View.VISIBLE
        
        findViewById<TextView>(R.id.tvError).text = message
        findViewById<Button>(R.id.btnRetry).setOnClickListener {
            presenter.onRetry()
        }
    }
    
    override fun showEmpty() {
        hideLoading()
        recyclerView.visibility = View.GONE
        emptyView.visibility = View.VISIBLE
        errorView.visibility = View.GONE
    }
    
    override fun getUserId(): Int {
        return intent.getIntExtra(EXTRA_USER_ID, 1)
    }
    
    override fun getPageSize(): Int {
        return 20
    }
    
    override fun onDestroy() {
        // 解离 View
        (presenter as UserPresenterImpl).detachView()
        super.onDestroy()
    }
}
```

### 2.2 VIPER + Navigation 组件

```kotlin
// ==================== VIPER + Jetpack Navigation ====================

// Router 使用 Navigation Component
class UserRouterImpl @Inject constructor(
    private val navController: NavController
) : UserRouterProtocol {
    
    override fun navigateToUserDetail(userId: Int) {
        val bundle = Bundle().apply {
            putInt(ARG_USER_ID, userId)
        }
        
        navController.navigate(
            R.id.action_user_list_to_user_detail,
            bundle
        )
    }
    
    override fun navigateToSearch() {
        navController.navigate(R.id.action_user_list_to_search)
    }
    
    override fun navigateBack() {
        navController.popBackStack()
    }
    
    override fun navigateToLogin() {
        navController.navigate(
            R.id.action_user_list_to_login,
            navController.currentDestination?.getId()
        )
    }
}

// Fragment 实现 View
class UserFragment : Fragment(), UserViewProtocol {
    
    private lateinit var presenter: UserPresenterProtocol
    private lateinit var router: UserRouterProtocol
    
    private var _binding: FragmentUserBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUserBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        initPresenter()
        initRouter()
        
        (presenter as UserPresenterImpl).attachView(this)
        
        presenter.viewDidLoad()
    }
    
    private fun initPresenter() {
        presenter = Hilt_DependencyUserPresenterImpl(requireContext())
    }
    
    private fun initRouter() {
        router = Hilt_DependencyUserRouterImpl(findNavController())
    }
    
    override fun onResume() {
        super.onResume()
        // Fragment 可见时重新关联
        if (::presenter.isInitialized) {
            (presenter as UserPresenterImpl).attachView(this)
        }
    }
    
    override fun onPause() {
        // Fragment 不可见时解离
        (presenter as UserPresenterImpl).detachView()
        super.onPause()
    }
    
    override fun onDestroyView() {
        _binding = null
        (presenter as UserPresenterImpl).detachView()
        super.onDestroyView()
    }
    
    // 实现 View 协议...
}
```

### 2.3 VIPER + Repository 模式

```kotlin
// ==================== VIPER + Repository ====================

// Repository 接口
interface UserRepository {
    suspend fun getUsers(userId: Int, limit: Int): List<UserEntity>
    suspend fun getUser(userId: Int): UserEntity
    suspend fun search(keyword: String): List<UserEntity>
}

// Repository 实现
class UserRepositoryImpl @Inject constructor(
    private val userApi: UserApi,
    private val userDao: UserDao,
    private val cacheManager: CacheManager
) : UserRepository {
    
    private val cacheKey = "users"
    
    override suspend fun getUsers(userId: Int, limit: Int): List<UserEntity> {
        // 先查缓存
        val cached = cacheManager.get<List<UserEntity>>(cacheKey)
        if (cached != null && isCacheValid(cached)) {
            return cached
        }
        
        // 请求网络
        return try {
            val users = userApi.getUsers(userId, limit)
            cacheManager.put(cacheKey, users)
            users
        } catch (e: Exception) {
            // 网络失败返回缓存
            cached ?: emptyList()
        }
    }
    
    override suspend fun getUser(userId: Int): UserEntity {
        // 先查本地数据库
        val cached = userDao.getUser(userId)
        if (cached != null) {
            return cached
        }
        
        // 请求网络
        return try {
            val user = userApi.getUser(userId)
            userDao.insert(user)
            user
        } catch (e: Exception) {
            throw e
        }
    }
    
    override suspend fun search(keyword: String): List<UserEntity> {
        return try {
            userApi.search(keyword)
        } catch (e: Exception) {
            // 本地搜索
            userDao.search(keyword)
        }
    }
    
    private fun isCacheValid(data: Any): Boolean {
        return System.currentTimeMillis() - cacheManager.getTimestamp(cacheKey) < CACHE_DURATION
    }
}

// Interactor 使用 Repository
class UserInteractorImpl @Inject constructor(
    private val userRepository: UserRepository
) : UserInteractorProtocol {
    
    override suspend fun loadUsers(userId: Int, pageSize: Int): UserListEntity {
        val users = userRepository.getUsers(userId, pageSize)
        
        // 应用业务规则
        return UserListEntity(
            users = users.filter { it.isActive() },
            total = users.size,
            page = 1,
            pageSize = pageSize
        )
    }
}
```

---

## 三、VIPER 进阶模式

### 3.1 多个 Interactor 协作

```kotlin
// ==================== 多个 Interactor 协作 ====================

// 用户 Interactor
class UserInteractorImpl @Inject constructor(
    private val userRepository: UserRepository
) : UserInteractorProtocol {
    
    override suspend fun loadUsers(): List<UserEntity> {
        return userRepository.getAllUsers()
    }
}

// 认证 Interactor
class AuthInteractorImpl @Inject constructor(
    private val authRepository: AuthRepository
) : AuthInteractorProtocol {
    
    override suspend fun validateToken(): Boolean {
        return authRepository.isTokenValid()
    }
    
    override suspend fun refreshToken(): String {
        return authRepository.refreshToken()
    }
}

// Presenter 协调多个 Interactor
class UserPresenterImpl @Inject constructor(
    private val userInteractor: UserInteractorProtocol,
    private val authInteractor: AuthInteractorProtocol
) : UserPresenterProtocol {
    
    override fun viewDidLoad() {
        // 先验证认证状态
        viewModelScope.launch {
            try {
                val isValid = authInteractor.validateToken()
                
                if (!isValid) {
                    val newToken = authInteractor.refreshToken()
                    // 更新 token
                }
                
                // 加载用户数据
                val users = userInteractor.loadUsers()
                
                if (isAttached()) {
                    view.showUsers(users)
                }
            } catch (e: Exception) {
                if (isAttached()) {
                    view.showError(e.message)
                }
            }
        }
    }
}

// ==================== Interactor 之间通信 ====================

// 方式 1: 通过 Presenter 协调
class UserPresenterImpl @Inject constructor(
    private val userInteractor: UserInteractorProtocol,
    private val analyticsInteractor: AnalyticsInteractorProtocol
) : UserPresenterProtocol {
    
    override fun onUserClick(userId: Int) {
        // 记录分析
        viewModelScope.launch {
            analyticsInteractor.trackUserView(userId)
        }
        
        // 跳转
        router.navigateToUserDetail(userId)
    }
}

// 方式 2: 通过事件总线（不推荐，降低可测试性）
// 方式 3: Interactor 依赖其他 Interactor（谨慎使用）
class UserInteractorImpl @Inject constructor(
    private val userRepository: UserRepository,
    private val notificationInteractor: NotificationInteractorProtocol
) : UserInteractorProtocol {
    
    override suspend fun loadUsers(): List<UserEntity> {
        val users = userRepository.getAllUsers()
        
        // 发送通知
        viewModelScope.launch {
            notificationInteractor.sendNotification("新消息")
        }
        
        return users
    }
}
```

### 3.2 VIPER + 状态管理

```kotlin
// ==================== VIPER + 状态管理 ====================

// 定义状态
sealed class UserScreenState {
    object Initial : UserScreenState()
    object Loading : UserScreenState()
    data class Success(val users: List<UserEntity>) : UserScreenState()
    data class Error(val message: String) : UserScreenState()
    object Empty : UserScreenState()
}

// Presenter 管理状态
class UserPresenterImpl @Inject constructor(
    private val interactor: UserInteractorProtocol
) : UserPresenterProtocol {
    
    private var _view: WeakReference<UserViewProtocol>? = null
    private var currentState: UserScreenState = UserScreenState.Initial
    
    private val view: UserViewProtocol
        get() = _view?.get() ?: throw IllegalStateException("View not attached")
    
    override fun viewDidLoad() {
        loadUsers()
    }
    
    private fun loadUsers() {
        currentState = UserScreenState.Loading
        if (isAttached()) view.showLoading()
        
        viewModelScope.launch {
            try {
                val users = interactor.loadUsers()
                
                currentState = when {
                    users.isEmpty() -> UserScreenState.Empty
                    else -> UserScreenState.Success(users)
                }
                
                if (isAttached()) {
                    view.hideLoading()
                    when (currentState) {
                        is UserScreenState.Empty -> view.showEmpty()
                        is UserScreenState.Success -> view.showUsers((currentState as UserScreenState.Success).users)
                        else -> {}
                    }
                }
            } catch (e: Exception) {
                currentState = UserScreenState.Error(e.message ?: "加载失败")
                
                if (isAttached()) {
                    view.hideLoading()
                    view.showError(currentState as UserScreenState.Error)
                }
            }
        }
    }
}

// ==================== VIPER + MVVM 混合 ====================

// ViewModel 管理数据
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _users = MutableStateFlow<List<UserEntity>>(emptyList())
    val users: StateFlow<List<UserEntity>> = _users.asStateFlow()
    
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadUsers() {
        _loading.value = true
        
        viewModelScope.launch {
            try {
                val users = userRepository.getAllUsers()
                _users.value = users
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            }
            
            _loading.value = false
        }
    }
}

// Presenter 使用 ViewModel
class UserPresenterImpl @Inject constructor(
    private val viewModel: UserViewModel
) : UserPresenterProtocol {
    
    private var _view: WeakReference<UserViewProtocol>? = null
    private val view: UserViewProtocol get() = _view?.get() ?: throw IllegalStateException("View not attached")
    
    override fun viewDidLoad() {
        observeViewModel()
        viewModel.loadUsers()
    }
    
    private fun observeViewModel() {
        viewModel.users.observeForever { users ->
            if (isAttached()) {
                view.showUsers(users)
            }
        }
        
        viewModel.loading.observeForever { loading ->
            if (isAttached()) {
                if (loading) view.showLoading()
                else view.hideLoading()
            }
        }
        
        viewModel.error.observeForever { error ->
            if (isAttached() && error != null) {
                view.showError(error)
            }
        }
    }
    
    private fun isAttached(): Boolean = _view?.get() != null
}
```

### 3.3 VIPER 模块复用

```kotlin
// ==================== VIPER 模块复用 ====================

// 定义可复用的 Interactor
interface BaseListInteractor<T> {
    suspend fun loadPage(page: Int, size: Int): List<T>
    suspend fun search(keyword: String): List<T>
    suspend fun refresh(): List<T>
}

// 通用实现
abstract class BaseListInteractorImpl<T> @Inject constructor(
    protected val repository: BaseRepository<T>
) : BaseListInteractor<T> {
    
    private var cache: List<T>? = null
    private var currentPage = 0
    
    override suspend fun loadPage(page: Int, size: Int): List<T> {
        currentPage = page
        return try {
            val data = repository.getPaginated(page, size)
            cache = data
            data
        } catch (e: Exception) {
            cache ?: emptyList()
        }
    }
    
    override suspend fun search(keyword: String): List<T> {
        return repository.search(keyword)
    }
    
    override suspend fun refresh(): List<T> {
        cache = null
        currentPage = 0
        return loadPage(0, DEFAULT_PAGE_SIZE)
    }
}

// 具体实现
class UserInteractorImpl @Inject constructor(
    userRepository: UserRepository
) : BaseListInteractorImpl<UserEntity>(userRepository), UserInteractorProtocol {
    
    override suspend fun loadUsers(userId: Int, pageSize: Int): UserListEntity {
        val users = loadPage(0, pageSize)
        return UserListEntity(
            users = users,
            total = users.size,
            page = 0,
            pageSize = pageSize
        )
    }
}

// 可复用的 Presenter 基类
abstract class BaseListPresenter<V : ListViewProtocol<T>, T> {
    protected var _view: WeakReference<V>? = null
    protected abstract val interactor: BaseListInteractor<T>
    
    protected val view: V
        get() = _view?.get() as? V ?: throw IllegalStateException("View not attached")
    
    fun attachView(view: V) {
        _view = WeakReference(view)
    }
    
    fun detachView() {
        _view?.clear()
        _view = null
    }
    
    protected fun isAttached(): Boolean = _view?.get() != null
    
    open fun loadMore() {
        view.showLoadingMore()
        
        viewModelScope.launch {
            try {
                val data = interactor.loadPage(currentPage, pageSize)
                
                if (isAttached()) {
                    view.hideLoadingMore()
                    view.appendData(data)
                }
            } catch (e: Exception) {
                if (isAttached()) {
                    view.hideLoadingMore()
                    view.showError(e.message)
                }
            }
        }
    }
    
    protected var currentPage = 0
    protected var pageSize = 20
}

// 具体 Presenter 实现
class UserPresenterImpl @Inject constructor(
    private val userInteractor: UserInteractorProtocol
) : BaseListPresenter<UserViewProtocol, UserEntity>(), UserPresenterProtocol {
    
    override val interactor: BaseListInteractor<UserEntity>
        get() = userInteractor as BaseListInteractor<UserEntity>
    
    // 实现 UserPresenterProtocol 的其他方法
}
```

---

## 四、VIPER 最佳实践

### 4.1 依赖注入配置

```kotlin
// ==================== Hilt 配置 ====================

// 1. Entity 模块
@Module
@InstallIn(SingletonComponent::class)
object EntityModule {
    // Entity 是纯数据类，不需要注入
}

// 2. Repository 模块
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}

// 3. Interactor 模块
@Module
@InstallIn(SingletonComponent::class)
abstract class InteractorModule {
    @Binds
    abstract fun bindUserInteractor(
        impl: UserInteractorImpl
    ): UserInteractorProtocol
    
    @Binds
    abstract fun bindAuthInteractor(
        impl: AuthInteractorImpl
    ): AuthInteractorProtocol
}

// 4. Presenter 模块
@Module
@InstallIn(ActivityRetainedComponent::class)
abstract class PresenterModule {
    @Binds
    abstract fun bindUserPresenter(
        impl: UserPresenterImpl
    ): UserPresenterProtocol
}

// 5. Router 模块
@Module
@InstallIn(ActivityComponent::class)
abstract class RouterModule {
    @Binds
    abstract fun bindUserRouter(
        impl: UserRouterImpl
    ): UserRouterProtocol
}

// 使用
@AndroidEntryPoint
class UserActivity : AppCompatActivity(), UserViewProtocol {
    
    @Inject lateinit var presenter: UserPresenterProtocol
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        (presenter as UserPresenterImpl).attachView(this)
        presenter.viewDidLoad()
    }
    
    override fun onDestroy() {
        (presenter as UserPresenterImpl).detachView()
        super.onDestroy()
    }
}
```

### 4.2 单元测试

```kotlin
// ==================== 单元测试 ====================

// Mock 依赖
class MockUserInteractor : UserInteractorProtocol {
    override suspend fun loadUsers(userId: Int, pageSize: Int): UserListEntity {
        return UserListEntity(
            users = listOf(
                UserEntity(1, "Test User", "test@example.com", "", 0)
            ),
            total = 1,
            page = 1,
            pageSize = pageSize
        )
    }
    
    override suspend fun getUserDetail(userId: Int): UserEntity {
        return UserEntity(1, "Test User", "test@example.com", "", 0)
    }
    
    override suspend fun searchUsers(keyword: String): List<UserEntity> {
        return emptyList()
    }
}

class MockUserView : UserViewProtocol {
    var isLoading = false
    var users: List<UserUIModel>? = null
    var errorMessage: String? = null
    
    override fun showLoading() { isLoading = true }
    override fun hideLoading() { isLoading = false }
    override fun showUsers(users: List<UserUIModel>) { this.users = users }
    override fun showError(message: String) { errorMessage = message }
    override fun showEmpty() {}
    override fun getUserId(): Int = 1
    override fun getPageSize(): Int = 20
}

// 测试 Presenter
@Test
fun `test loadUsers success`() = runTest {
    // 准备
    val mockInteractor = MockUserInteractor()
    val mockView = MockUserView()
    
    val presenter = UserPresenterImpl(mockInteractor)
    presenter.attachView(mockView)
    
    // 执行
    presenter.viewDidLoad()
    
    // 等待异步完成
    delay(100)
    
    // 验证
    assertFalse(mockView.isLoading)
    assertNotNull(mockView.users)
    assertEquals(1, mockView.users?.size)
    assertNull(mockView.errorMessage)
    
    // 清理
    presenter.detachView()
}

@Test
fun `test loadUsers error`() = runTest {
    val mockInteractor = object : UserInteractorProtocol {
        override suspend fun loadUsers(userId: Int, pageSize: Int): UserListEntity {
            throw Exception("Network error")
        }
        
        override suspend fun getUserDetail(userId: Int): UserEntity {
            throw NotImplementedError()
        }
        
        override suspend fun searchUsers(keyword: String): List<UserEntity> {
            throw NotImplementedError()
        }
    }
    
    val mockView = MockUserView()
    val presenter = UserPresenterImpl(mockInteractor)
    presenter.attachView(mockView)
    
    presenter.viewDidLoad()
    delay(100)
    
    assertFalse(mockView.isLoading)
    assertNull(mockView.users)
    assertNotNull(mockView.errorMessage)
    
    presenter.detachView()
}

// 测试 Interactor
@Test
fun `test interactor loadUsers`() = runTest {
    val mockRepository = mockk<UserRepository>()
    coEvery { mockRepository.getUsers(any(), any()) } returns listOf(
        UserEntity(1, "Test", "test@example.com", "", 0)
    )
    
    val interactor = UserInteractorImpl(mockRepository)
    
    val result = interactor.loadUsers(1, 20)
    
    assertEquals(1, result.users.size)
    assertTrue(result.users.all { it.isActive() })
}

// 测试 Router
@Test
fun `test router navigate to detail`() {
    val mockNavController = mockk<NavController>()
    
    val router = UserRouterImpl(mockNavController)
    
    router.navigateToUserDetail(1)
    
    verify { mockNavController.navigate(any(), any()) }
}
```

### 4.3 内存管理

```kotlin
// ==================== 内存管理 ====================

// 1. 使用弱引用
class UserPresenterImpl @Inject constructor(
    private val interactor: UserInteractorProtocol
) : UserPresenterProtocol {
    
    // 使用 WeakReference 防止内存泄漏
    private var _view: WeakReference<UserViewProtocol>? = null
    
    private val view: UserViewProtocol
        get() {
            val v = _view?.get()
            if (v == null) {
                throw IllegalStateException("View not attached")
            }
            return v
        }
    
    fun attachView(view: UserViewProtocol) {
        _view = WeakReference(view)
    }
    
    fun detachView() {
        _view?.clear()
        _view = null
    }
    
    private fun isAttached(): Boolean {
        return _view?.get() != null
    }
}

// 2. 生命周期管理
class UserPresenterImpl @Inject constructor(
    private val interactor: UserInteractorProtocol
) : UserPresenterProtocol, LifecycleObserver {
    
    private var _view: WeakReference<UserViewProtocol>? = null
    private val compositeDisposable = CompositeDisposable()
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart() {
        // 恢复未完成的请求
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStop() {
        // 取消请求
        compositeDisposable.clear()
    }
    
    fun attachView(view: UserViewProtocol, lifecycle: Lifecycle) {
        _view = WeakReference(view)
        lifecycle.addObserver(this)
    }
    
    fun detachView() {
        _view?.clear()
        _view = null
        compositeDisposable.clear()
    }
}

// 3. 取消未完成的请求
class UserPresenterImpl @Inject constructor(
    private val interactor: UserInteractorProtocol
) : UserPresenterProtocol {
    
    private var currentJob: Job? = null
    
    fun loadUsers() {
        // 取消之前的请求
        currentJob?.cancel()
        
        currentJob = viewModelScope.launch {
            try {
                val users = interactor.loadUsers()
                if (isAttached()) {
                    view.showUsers(users)
                }
            } catch (e: CancellationException) {
                // 正常取消，不处理
            } catch (e: Exception) {
                if (isAttached()) {
                    view.showError(e.message)
                }
            }
        }
    }
    
    override fun detachView() {
        currentJob?.cancel()
        currentJob = null
        _view?.clear()
        _view = null
    }
}
```

---

## 五、VIPER 优缺点分析

### 5.1 优点

| 优点 | 说明 |
|------|------|
| **职责清晰** | 每个组件职责单一，易于理解 |
| **可测试性高** | 各组件独立，易于单元测试 |
| **可维护性好** | 修改一处不影响其他组件 |
| **可复用性强** | Interactor 可以在不同 View 间复用 |
| **无循环依赖** | 依赖方向单一 |
| **易于扩展** | 新增功能不影响现有代码 |

### 5.2 缺点

| 缺点 | 说明 |
|------|------|
| **代码量多** | 需要定义大量接口和类 |
| **学习曲线陡** | 新手需要时间理解 |
| **开发效率低** | 简单功能需要完整 VIPER 结构 |
| **过度设计风险** | 小项目使用 VIPER 过于复杂 |

### 5.3 适用场景

```
适合使用 VIPER 的场景:
✓ 大型复杂项目
✓ 业务逻辑复杂
✓ 团队对架构有深刻理解
✓ 需要高度可测试性
✓ 长期维护的项目

不适合使用 VIPER 的场景:
✗ 小型项目
✗ 快速原型开发
✗ 简单 UI 展示
✗ 团队经验不足
✗ 时间紧迫的项目
```

---

## 六、VIPER 与 Clean Architecture 对比

### 6.1 架构映射

```
┌─────────────────────────────────────────────────────────┐
│            VIPER ↔ Clean Architecture 映射               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  VIPER                  Clean Architecture             │
│  ─────                  ─────────────────             │
│                                                         │
│  View  ←───────────→   Presentation Layer              │
│  Presenter  ───────→   Presentation Layer              │
│  Interactor ───────→   Domain Layer                    │
│  Entity   ───────→   Domain Layer                      │
│  Router   ───────→   Presentation Layer               │
│                                                         │
│  VIPER 是 Clean Architecture 的具体实现                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 核心差异

| 维度 | VIPER | Clean Architecture |
|------|-------|------------------|
| **抽象程度** | 具体架构模式 | 架构原则 |
| **组件数量** | 5 个明确组件 | 分层概念 |
| **灵活性** | 固定结构 | 灵活实现 |
| **学习成本** | 较高 | 中等 |
| **适用性** | 特定场景 | 通用 |

---

## 七、VIPER 面试核心考点

### 7.1 基础问题

**Q1: VIPER 架构的核心组件？**

**A:**
```
VIPER = View + Interactor + Presenter + Entity + Router

View: 展示层，接收用户输入，展示数据
Interactor: 核心业务逻辑，处理数据
Presenter: 协调 View 和 Interactor
Entity: 纯数据模型，领域对象
Router: 页面导航

依赖方向: View → Presenter → Interactor → Entity
```

**Q2: 为什么需要弱引用？**

**A:**
```
Presenter 持有 View 的弱引用，防止内存泄漏。

强引用问题:
Presenter 生命周期 > View 生命周期
Presenter 强引用 View → View 无法被 GC → 内存泄漏

弱引用解决:
_view = WeakReference(view)
view = _view?.get() ?: throw "Not attached"
```

**Q3: Interactor 为什么无 UI 依赖？**

**A:**
```
1. 便于单元测试：不需要 Mock Android 框架
2. 可复用：可以在不同 View 间共享
3. 职责单一：只负责业务逻辑
4. 符合单一职责原则

实现:
interface Interactor {
    suspend fun doBusinessLogic(): Data
}
// 不依赖 View、Activity、Fragment
```

### 7.2 进阶问题

**Q4: VIPER 如何处理配置更新？**

**A:**
```kotlin
// 方案 1: ViewModel 保存状态
class UserPresenter {
    private val viewModel: UserViewModel by activityViewModels()
    
    override fun viewDidLoad() {
        viewModel.loadData()
        viewModel.data.observe { data ->
            if (isAttached()) view.showData(data)
        }
    }
}

// 方案 2: Interactor 缓存
class UserInteractor {
    private val cache = ConcurrentHashMap<Int, User>()
    
    suspend fun loadUser(id: Int): User {
        cache[id]?.let { return it }
        val user = api.getUser(id)
        cache[id] = user
        return user
    }
}
```

**Q5: VIPER vs MVP vs MVVM 如何选择？**

**A:**
```
选择 VIPER:
- 大型复杂项目
- 业务逻辑复杂
- 需要高度可测试性
- 长期维护

选择 MVP:
- 中等复杂度项目
- 团队熟悉 MVP
- 需要清晰的职责分离

选择 MVVM:
- 新项目
- 使用数据绑定/Compose
- 追求开发效率
- 简单到中等的业务逻辑
```

**Q6: 如何减少 VIPER 的代码量？**

**A:**
```kotlin
// 1. 使用基类
abstract class BasePresenter<V> {
    protected var _view: WeakReference<V>? = null
    // ...
}

// 2. 复用 Interactor
abstract class BaseListInteractor<T> {
    // ...
}

// 3. 简化简单模块
// 简单页面可以使用 MVP 或 MVVM，复杂模块使用 VIPER

// 4. 使用扩展函数
fun UserPresenterProtocol.viewDidLoad() {
    // 通用逻辑
}
```

### 7.3 实战问题

**Q7: VIPER 如何实现列表分页加载？**

**A:**
```kotlin
class UserInteractorImpl : UserInteractorProtocol {
    private var currentPage = 0
    private var hasMore = true
    
    override suspend fun loadMore(): List<UserEntity> {
        val users = userRepository.getUsers(currentPage, PAGE_SIZE)
        
        hasMore = users.size >= PAGE_SIZE
        currentPage++
        
        return users
    }
    
    fun canLoadMore(): Boolean = hasMore
}

class UserPresenterImpl : UserPresenterProtocol {
    override fun onLoadMoreTriggered() {
        if (!interactor.canLoadMore()) return
        
        view.showLoadingMore()
        
        viewModelScope.launch {
            val users = interactor.loadMore()
            
            if (isAttached()) {
                view.hideLoadingMore()
                view.appendUsers(users)
            }
        }
    }
}
```

**Q8: VIPER 如何实现搜索功能？**

**A:**
```kotlin
// Interactor 层
class UserInteractorImpl : UserInteractorProtocol {
    override suspend fun search(query: String): List<UserEntity> {
        return try {
            userRepository.search(query)
        } catch (e: Exception) {
            // 本地搜索兜底
            localRepository.search(query)
        }
    }
}

// Presenter 层
class UserPresenterImpl : UserPresenterProtocol {
    private var searchJob: Job? = null
    
    override fun onSearchQuery(query: String) {
        searchJob?.cancel()
        
        searchJob = viewModelScope.launch {
            delay(300) // 防抖
            
            val results = interactor.search(query)
            
            if (isAttached()) {
                view.showSearchResults(results)
            }
        }
    }
}
```

---

## 八、VIPER 面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| VIPER 核心组件 | ⭐⭐ | 5 层职责 |
| 弱引用使用 | ⭐⭐⭐ | 防止内存泄漏 |
| Interactor 职责 | ⭐⭐⭐ | 纯业务逻辑 |
| Router 作用 | ⭐⭐ | 导航独立 |
| 单元测试 | ⭐⭐⭐ | Mock 依赖 |
| 配置更新处理 | ⭐⭐⭐ | ViewModel/缓存 |
| VIPER vs 其他架构 | ⭐⭐⭐ | 场景选择 |
| 代码量优化 | ⭐⭐⭐ | 基类/复用 |
| 列表分页 | ⭐⭐⭐⭐ | 状态管理 |
| 搜索防抖 | ⭐⭐⭐ | 协程 cancel |

---

## 九、参考资料

### 9.1 官方资源

- [VIPER Architecture](https://www.objc.io/issues/13-architecture/viper/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### 9.2 推荐文章

- [VIPER in Android](https://medium.com/androiddevelopers/viper-architecture-in-android-7f8b9c4d9c5e)
- [Architecture Patterns in Android](https://proandroiddev.com/architecture-patterns-in-android-2023-complete-guide-4c7f5f5e5c5e)

### 9.3 相关模式

- [Clean Architecture](./06_Clean_Architecture.md)
- [Repository 模式](./05_Repository 模式.md)

---

**🔗 上一篇**: [MVI 架构](./03_MVI 架构.md)

**🔗 下一篇**: [Repository 模式](./05_Repository 模式.md)