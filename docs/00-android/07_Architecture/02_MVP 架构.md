# MVP 架构深度解析 🏛️

> 经典架构模式详解，面试高频考点

---

## 一、MVP 架构核心概念

### 1.1 架构概述

MVP（Model-View-Presenter）是 MVC 架构的改进版本，旨在解决 MVC 在 Android 开发中的不足。

```
┌─────────────────────────────────────────────────────────┐
│                    MVP 架构分层                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Model Layer (数据层)                                   │
│  ├── 业务逻辑处理                                        │
│  ├── 数据获取和存储                                      │
│  └── 与网络、数据库交互                                  │
│         ↓                                                 │
│  Presenter Layer ( presenter 层)                         │
│  ├── 连接 View 和 Model                                   │
│  ├── 处理用户交互逻辑                                     │
│  ├── 更新 View 显示数据                                    │
│  └── 业务规则处理                                        │
│         ↓ ↑                                              │
│  View Layer (视图层)                                     │
│  ├── Activity/Fragment                                   │
│  ├── 展示数据                                            │
│  └── 接收用户交互                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心职责划分

| 层级 | 职责 | 特点 |
|------|------|------|
| **Model** | 数据操作、业务逻辑 | 独立于 UI |
| **Presenter** | 协调 View 和 Model、处理业务 | 持有 View 接口引用 |
| **View** | 展示数据、用户交互 | 通过接口与 Presenter 通信 |

### 1.3 MVP vs MVC

```
MVC 问题:
┌─────────────────────────────────────┐
│  Controller (Activity/Fragment)     │
│  ├── 用户交互处理                   │
│  ├── 业务逻辑处理                   │
│  ├── 数据获取                       │
│  └── UI 更新                         │
│  ↑                              ↓ │
│  └────────── 紧耦合 ────────────────┘
└─────────────────────────────────────┘

MVP 改进:
┌─────────────────────────────────────┐
│  View (接口定义)                    │
│  ↓                                  │
│  Presenter (业务逻辑、数据协调)      │
│  ↓                                  │
│  Model (数据层)                     │
└─────────────────────────────────────┘
  ↑                                  ↓
  └─── Activity/Fragment (实现 View 接口) ──┘
```

---

## 二、MVP 实战实现

### 2.1 基本实现模式

```kotlin
// ==================== 1. View 接口定义 ====================

// 定义 View 接口
interface UserView {
    fun showLoading()
    fun hideLoading()
    fun showUser(user: User)
    fun showError(message: String)
    fun showEmpty()
}

// ==================== 2. Presenter 实现 ====================

// 依赖注入的 Presenter
class UserPresenter @Inject constructor(
    private val userRepository: UserRepository
) {
    // 持有 View 接口的弱引用
    private var _view: UserView? = null
    private val view: UserView
        get() = _view ?: throw IllegalStateException("View is not attached")
    
    // 关联 View
    fun attach(view: UserView) {
        _view = view
    }
    
    // 解离 View
    fun detach() {
        _view = null
    }
    
    // 加载用户数据
    fun loadUser(userId: Int) {
        // 显示加载中
        view.showLoading()
        
        viewModelScope.launch {
            try {
                val result = userRepository.getUser(userId)
                
                when {
                    result.isSuccess -> {
                        val user = result.getOrThrow()
                        view.hideLoading()
                        view.showUser(user)
                    }
                    else -> {
                        val error = result.exceptionOrNull()
                        view.hideLoading()
                        view.showError(error?.message ?: "未知错误")
                    }
                }
            } catch (e: Exception) {
                view.hideLoading()
                view.showError(e.message ?: "加载失败")
            }
        }
    }
    
    // 刷新数据
    fun refresh() {
        // 实现刷新逻辑
    }
}

// ==================== 3. View 实现 ====================

// Activity 实现 View 接口
class UserActivity : AppCompatActivity(), UserView {
    
    private lateinit var presenter: UserPresenter
    private lateinit var progressBar: ProgressBar
    private lateinit var tvUserName: TextView
    private lateinit var tvUserEmail: TextView
    private lateinit var layoutEmpty: LinearLayout
    private lateinit var layoutError: LinearLayout
    private lateinit var tvError: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user)
        
        // 初始化 View
        initViews()
        
        // 初始化 Presenter
        initPresenter()
        
        // 关联 View
        presenter.attach(this)
        
        // 加载数据
        loadUser()
    }
    
    private fun initViews() {
        progressBar = findViewById(R.id.progress_bar)
        tvUserName = findViewById(R.id.tv_user_name)
        tvUserEmail = findViewById(R.id.tv_user_email)
        layoutEmpty = findViewById(R.id.layout_empty)
        layoutError = findViewById(R.id.layout_error)
        tvError = findViewById(R.id.tv_error)
    }
    
    private fun initPresenter() {
        // 通过 Hilt 获取 Presenter
        presenter = Hilt_DependencyUserPresenter(this)
    }
    
    private fun loadUser() {
        val userId = intent.getIntExtra("userId", 1)
        presenter.loadUser(userId)
    }
    
    // 实现 View 接口方法
    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        tvUserName.visibility = View.GONE
        tvUserEmail.visibility = View.GONE
        layoutEmpty.visibility = View.GONE
        layoutError.visibility = View.GONE
    }
    
    override fun hideLoading() {
        progressBar.visibility = View.GONE
    }
    
    override fun showUser(user: User) {
        tvUserName.visibility = View.VISIBLE
        tvUserEmail.visibility = View.VISIBLE
        layoutEmpty.visibility = View.GONE
        layoutError.visibility = View.GONE
        
        tvUserName.text = user.name
        tvUserEmail.text = user.email
    }
    
    override fun showError(message: String) {
        tvUserName.visibility = View.GONE
        tvUserEmail.visibility = View.GONE
        layoutEmpty.visibility = View.GONE
        layoutError.visibility = View.VISIBLE
        
        tvError.text = message
    }
    
    override fun showEmpty() {
        tvUserName.visibility = View.GONE
        tvUserEmail.visibility = View.GONE
        layoutEmpty.visibility = View.VISIBLE
        layoutError.visibility = View.GONE
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // 解离 View，防止内存泄漏
        presenter.detach()
    }
}
```

### 2.2 使用 Fragment + MVP

```kotlin
// Fragment 实现 View 接口
class UserFragment : Fragment(), UserView {
    
    private lateinit var presenter: UserPresenter
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
        
        // 初始化 Presenter
        presenter = Hilt_DependencyUserPresenter(this)
        
        // 关联 View
        presenter.attach(this)
        
        // 设置点击事件
        binding.btnRefresh.setOnClickListener {
            presenter.refresh()
        }
    }
    
    override fun onResume() {
        super.onResume()
        // Fragment 可见时重新关联 View
        if (presenter != null) {
            presenter.attach(this)
        }
    }
    
    override fun onPause() {
        // Fragment 不可见时解离 View
        presenter.detach()
        super.onPause()
    }
    
    override fun onDestroyView() {
        _binding = null
        presenter.detach()
        super.onDestroyView()
    }
    
    // 实现 View 接口
    override fun showLoading() {
        binding.progressBar.show()
        binding.contentLayout.hide()
    }
    
    override fun hideLoading() {
        binding.progressBar.hide()
    }
    
    override fun showUser(user: User) {
        binding.progressBar.hide()
        binding.contentLayout.show()
        binding.tvName.text = user.name
    }
    
    override fun showError(message: String) {
        binding.progressBar.hide()
        binding.tvError.text = message
    }
    
    override fun showEmpty() {
        binding.progressBar.hide()
        binding.layoutEmpty.show()
    }
}
```

### 2.3 MVP 基类设计

```kotlin
// ==================== MVP 基类 ====================

// View 基类
abstract class BaseView : LifecycleOwner {
    override fun getLifecycle(): Lifecycle {
        return lifecycle
    }
}

// Presenter 基类
abstract class BasePresenter<V : BaseView> {
    // 使用弱引用避免内存泄漏
    private var _view: WeakRef<V>? = null
    
    protected val view: V
        get() {
            _view?.get()?.let { return it }
            throw IllegalStateException("View is not attached")
        }
    
    // 关联 View
    fun attach(view: V) {
        _view = WeakRef(view)
    }
    
    // 解离 View
    fun detach() {
        _view?.clear()
        _view = null
    }
    
    // 检查 View 是否关联
    protected fun isAttached(): Boolean {
        return _view?.get() != null
    }
    
    // 在关联时调用
    protected abstract fun onAttach()
    
    // 在解离时调用
    protected abstract fun onDetach()
    
    override fun finalize() {
        detach()
        super.finalize()
    }
}

// 具体 Presenter 实现
class UserPresenter<V : UserView> @Inject constructor(
    private val userRepository: UserRepository
) : BasePresenter<V>() {
    
    override fun onAttach() {
        // 关联时执行
    }
    
    override fun onDetach() {
        // 解离时清理资源
    }
    
    fun loadUser(userId: Int) {
        view.showLoading()
        
        viewModelScope.launch {
            try {
                val result = userRepository.getUser(userId)
                
                if (result.isSuccess && result.getOrNull() != null) {
                    view.hideLoading()
                    view.showUser(result.getOrThrow())
                } else {
                    view.hideLoading()
                    view.showError("加载失败")
                }
            } catch (e: Exception) {
                view.hideLoading()
                view.showError(e.message ?: "加载失败")
            }
        }
    }
    
    fun refresh() {
        val userId = view.getUserId()
        loadUser(userId)
    }
}

// 泛型 View 接口
interface UserView : BaseView {
    fun showLoading()
    fun hideLoading()
    fun showUser(user: User)
    fun showError(message: String)
    fun showEmpty()
    
    fun getUserId(): Int
}
```

### 2.4 MVP + Retrofit + RxJava

```kotlin
// ==================== MVP + RxJava 实现 ====================

interface UserView : LifecycleOwner {
    fun showLoading()
    fun hideLoading()
    fun showUser(user: User)
    fun showError(message: String)
    fun showEmpty()
}

class UserPresenter @Inject constructor(
    private val userApi: UserApi
) : DisposableManager {
    
    private var _view: WeakRef<UserView>? = null
    private val view: UserView
        get() = _view?.get() ?: throw IllegalStateException("View not attached")
    
    private val disposable: CompositeDisposable by lazy { CompositeDisposable() }
    
    fun attach(view: UserView) {
        _view = WeakRef(view)
    }
    
    fun detach() {
        _view?.clear()
        _view = null
        dispose()
    }
    
    override fun dispose() {
        disposable.clear()
    }
    
    override fun add(disposable: Disposable) {
        disposable.add(disposable)
    }
    
    fun loadUser(userId: Int) {
        view.showLoading()
        
        disposable.add(
            userApi.getUser(userId)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .flatMap { response ->
                    if (response.isSuccessful) {
                    response.body()?.let {
                        Single.just(it)
                    } ?: Single.error(Exception("Empty response"))
                    } else {
                        Single.error(Exception("Error: ${response.code()}"))
                    }
                }
                .subscribe(
                    { user ->
                        view.hideLoading()
                        view.showUser(user)
                    },
                    { throwable ->
                        view.hideLoading()
                        view.showError(throwable.message ?: "加载失败")
                    }
                )
        )
    }
    
    fun searchUsers(keyword: String) {
        if (keyword.isBlank()) {
            view.showError("请输入搜索关键词")
            return
        }
        
        view.showLoading()
        
        disposable.add(
            userApi.searchUsers(keyword)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .flatMapSingle { response ->
                    if (response.isSuccessful) {
                        val users = response.body()
                        if (users.isNullOrEmpty()) {
                            Single.error(Exception("没有找到用户"))
                        } else {
                            Single.just(users)
                        }
                    } else {
                        Single.error(Exception("搜索失败"))
                    }
                }
                .subscribe(
                    { users ->
                        view.hideLoading()
                        view.showUsers(users)
                    },
                    { throwable ->
                        view.hideLoading()
                        view.showError(throwable.message ?: "搜索失败")
                    }
                )
        )
    }
}

// Activity 实现
class SearchUserActivity : AppCompatActivity(), UserView {
    
    private lateinit var presenter: UserPresenter
    private val binding: ActivitySearchUserBinding by lazy {
        ActivitySearchUserBinding.inflate(layoutInflater)
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(binding.root)
        
        presenter = Hilt_DependencyUserPresenter(this)
        presenter.attach(this)
        
        setupSearch()
    }
    
    private fun setupSearch() {
        binding.etSearch.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                binding.ivSearch.visibility = View.VISIBLE
            }
        }
        
        binding.ivSearch.setOnClickListener {
            val keyword = binding.etSearch.text.toString().trim()
            if (keyword.isNotEmpty()) {
                presenter.searchUsers(keyword)
            }
        }
    }
    
    override fun showLoading() {
        binding.progressBar.show()
    }
    
    override fun hideLoading() {
        binding.progressBar.hide()
    }
    
    override fun showUser(user: User) {
        // 实现
    }
    
    override fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
    
    override fun showEmpty() {
        // 实现
    }
    
    override fun onDestroy() {
        presenter.detach()
        super.onDestroy()
    }
}
```

---

## 三、MVP 进阶模式

### 3.1 多状态处理

```kotlin
// ==================== MVP 多状态处理 ====================

// 定义状态接口
interface StatefulView {
    fun showLoading()
    fun hideLoading()
    fun showError(error: Throwable, retry: () -> Unit)
    fun showEmpty(message: String, onRetry: () -> Unit)
}

// View 基类
interface UserView : StatefulView {
    fun showUser(user: User)
    fun showUsers(users: List<User>)
}

// Presenter 基类
abstract class BasePresenter<V> : DisposableManager {
    protected var _view: WeakRef<V>? = null
    
    protected val view: V
        get() = _view?.get() as? V ?: throw IllegalStateException("View not attached")
    
    fun attach(view: V) {
        _view = WeakRef(view)
    }
    
    fun detach() {
        _view?.clear()
        _view = null
        dispose()
    }
    
    // 显示加载状态
    protected fun showLoading() {
        if (isViewAttached()) {
            (view as? StatefulView)?.showLoading()
        }
    }
    
    // 隐藏加载状态
    protected fun hideLoading() {
        if (isViewAttached()) {
            (view as? StatefulView)?.hideLoading()
        }
    }
    
    // 显示错误状态
    protected fun showError(error: Throwable, retry: (() -> Unit)?) {
        if (isViewAttached()) {
            val statefulView = view as? StatefulView
            statefulView?.showError(error, retry ?: {} )
        }
    }
    
    // 显示空状态
    protected fun showEmpty(message: String, onRetry: (() -> Unit)?) {
        if (isViewAttached()) {
            val statefulView = view as? StatefulView
            statefulView?.showEmpty(message, onRetry ?: {})
        }
    }
    
    private fun isViewAttached(): Boolean {
        return _view?.get() != null
    }
}

// 具体实现
class UserPresenter @Inject constructor(
    private val userRepository: UserRepository
) : BasePresenter<UserView>() {
    
    fun loadUser(userId: Int) {
        showLoading()
        
        viewModelScope.launch {
            try {
                val result = userRepository.getUser(userId)
                hideLoading()
                
                if (result.isSuccess) {
                    val user = result.getOrNull()
                    if (user != null) {
                        view.showUser(user)
                    } else {
                        showEmpty("用户不存在", ::loadUser)
                    }
                } else {
                    val error = result.exceptionOrNull() ?: Exception("未知错误")
                    showError(error, ::loadUser)
                }
            } catch (e: Exception) {
                hideLoading()
                showError(e, ::loadUser)
            }
        }
    }
    
    fun refresh() {
        loadUser(currentUserId)
    }
}

// Activity 实现
class UserActivity : AppCompatActivity(), UserView, StatefulView {
    
    private lateinit var presenter: UserPresenter
    private lateinit var layoutManager: LinearLayoutManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user)
        
        presenter = Hilt_DependencyUserPresenter(this)
        presenter.attach(this)
        
        presenter.loadUser(1)
    }
    
    override fun showLoading() {
        binding.progressBar.visibility = View.VISIBLE
        binding.contentLayout.visibility = View.GONE
        binding.errorLayout.visibility = View.GONE
        binding.emptyLayout.visibility = View.GONE
    }
    
    override fun hideLoading() {
        binding.progressBar.visibility = View.GONE
    }
    
    override fun showError(error: Throwable, retry: () -> Unit) {
        binding.progressBar.visibility = View.GONE
        binding.contentLayout.visibility = View.GONE
        binding.errorLayout.visibility = View.VISIBLE
        binding.emptyLayout.visibility = View.GONE
        
        binding.tvError.text = error.message ?: "加载失败"
        binding.btnRetry.setOnClickListener {
            retry()
        }
    }
    
    override fun showEmpty(message: String, onRetry: () -> Unit) {
        binding.progressBar.visibility = View.GONE
        binding.contentLayout.visibility = View.GONE
        binding.errorLayout.visibility = View.GONE
        binding.emptyLayout.visibility = View.VISIBLE
        
        binding.tvEmpty.text = message
        binding.btnEmptyRetry.setOnClickListener {
            onRetry()
        }
    }
    
    override fun showUser(user: User) {
        binding.progressBar.visibility = View.GONE
        binding.contentLayout.visibility = View.VISIBLE
        binding.errorLayout.visibility = View.GONE
        binding.emptyLayout.visibility = View.GONE
        
        binding.tvName.text = user.name
        binding.tvEmail.text = user.email
    }
    
    override fun showUsers(users: List<User>) {
        // 实现
    }
    
    override fun onDestroy() {
        presenter.detach()
        super.onDestroy()
    }
}
```

### 3.2 MVP + MVVM 混合模式

```kotlin
// ==================== MVP + MVVM 混合模式 ====================

// ViewModel 负责数据和状态管理
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user
    
    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error
    
    fun loadUser(userId: Int) {
        _loading.value = true
        
        viewModelScope.launch {
            try {
                val result = userRepository.getUser(userId)
                _loading.value = false
                
                if (result.isSuccess && result.getOrNull() != null) {
                    _user.value = result.getOrNull()
                } else {
                    _error.value = "加载失败"
                }
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }
}

// Presenter 负责协调
class UserPresenter @Inject constructor(
    private val viewModel: UserViewModel
) {
    private var _view: WeakRef<UserView>? = null
    private val view: UserView
        get() = _view?.get() ?: throw IllegalStateException("View not attached")
    
    fun attach(view: UserView) {
        _view = WeakRef(view)
        observeViewModel()
    }
    
    fun detach() {
        _view?.clear()
        _view = null
    }
    
    private fun observeViewModel() {
        // 观察数据
        viewModel.user.observeForever { user ->
            if (_view?.get() != null) {
                _view?.get()?.showUser(user)
            }
        }
        
        // 观察加载状态
        viewModel.loading.observeForever { loading ->
            if (_view?.get() != null) {
                if (loading) {
                    _view?.get()?.showLoading()
                } else {
                    _view?.get()?.hideLoading()
                }
            }
        }
        
        // 观察错误
        viewModel.error.observeForever { error ->
            if (_view?.get() != null && error != null) {
                _view?.get()?.showError(error)
            }
        }
    }
    
    fun loadUser(userId: Int) {
        viewModel.loadUser(userId)
    }
}
```

---

## 四、MVP 最佳实践

### 4.1 内存泄漏防范

```kotlin
// ==================== 内存泄漏防范 ====================

// 1. 使用弱引用
class SafePresenter<V> {
    private var _view: WeakReference<V>? = null
    
    protected val view: V
        get() {
            val v = _view?.get()
            if (v == null) {
                throw IllegalStateException("View is not attached")
            }
            return v
        }
    
    fun attach(view: V) {
        _view = WeakReference(view)
    }
    
    fun detach() {
        _view?.clear()
        _view = null
    }
}

// 2. 在生命周期中管理
abstract class MvpFragment<V, P> : Fragment() {
    protected lateinit var presenter: P
        private set
    
    abstract fun createPresenter(): P
    
    override fun onResume() {
        super.onResume()
        attachView()
    }
    
    override fun onPause() {
        detachView()
        super.onPause()
    }
    
    override fun onDestroyView() {
        detachView()
        super.onDestroyView()
    }
    
    private fun attachView() {
        presenter.attach(this as V)
    }
    
    private fun detachView() {
        presenter.detach()
    }
}

// 3. 使用 Lifecycle 感知
class LifecycleAwarePresenter<V> : LifecycleObserver {
    private var _view: WeakReference<V>? = null
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart() {
        // 执行需要 View 的操作
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStop() {
        // 清理资源
    }
    
    fun attach(view: V, lifecycle: Lifecycle) {
        _view = WeakReference(view)
        lifecycle.addObserver(this)
    }
    
    fun detach() {
        _view?.clear()
        _view = null
    }
}
```

### 4.2 异步处理优化

```kotlin
// ==================== 异步处理优化 ====================

class OptimizedPresenter @Inject constructor(
    private val userRepository: UserRepository
) : BasePresenter<UserView>() {
    
    // 取消之前的请求
    private var currentJob: Job? = null
    
    fun loadUser(userId: Int) {
        // 取消之前的请求
        currentJob?.cancel()
        
        showLoading()
        
        currentJob = viewModelScope.launch {
            try {
                // 使用 Flow 支持取消
                userRepository.getUserFlow(userId)
                    .first()
                    .let { user ->
                        hideLoading()
                        view.showUser(user)
                    }
            } catch (e: CancellationException) {
                // 正常取消，不显示错误
            } catch (e: Exception) {
                hideLoading()
                showError(e.message ?: "加载失败", ::loadUser)
            }
        }
    }
    
    // 防抖搜索
    private val searchJob = Job()
    
    fun searchUsers(keyword: String) {
        if (keyword.isBlank()) {
            view.showEmpty("请输入关键词")
            return
        }
        
        searchJob.cancel()
        searchJob.invokeOnCompletion {
            if (it is CancellationException) {
                view.hideLoading()
            }
        }
        
        view.showLoading()
        
        viewModelScope.launch(searchJob) {
            // 延迟处理，防抖
            delay(300)
            
            try {
                val result = userRepository.searchUsers(keyword)
                view.hideLoading()
                
                if (result.isEmpty()) {
                    view.showEmpty("没有找到用户")
                } else {
                    view.showUsers(result)
                }
            } catch (e: Exception) {
                view.hideLoading()
                showError(e.message ?: "搜索失败", ::searchUsers)
            }
        }
    }
}
```

### 4.3 复用与抽象

```kotlin
// ==================== 复用与抽象 ====================

// 通用 Presenter 基类
abstract class BaseMvpPresenter<V : BaseMvpView> : DisposableManager {
    
    protected var _view: WeakReference<V>? = null
    protected val view: V
        get() = _view?.get() as? V ?: throw IllegalStateException("View is not attached")
    
    fun attach(view: V) {
        _view = WeakReference(view)
        onAttachView()
    }
    
    fun detach() {
        onDetachView()
        _view?.clear()
        _view = null
        dispose()
    }
    
    // 回调
    protected open fun onAttachView() {}
    protected open fun onDetachView() {}
    
    // 状态管理
    protected fun showLoading() {
        if (isAttached) (view as? StatefulView)?.showLoading()
    }
    
    protected fun hideLoading() {
        if (isAttached) (view as? StatefulView)?.hideLoading()
    }
    
    protected fun showError(throwable: Throwable, retry: (() -> Unit)?) {
        if (isAttached) {
            (view as? StatefulView)?.showError(throwable, retry ?: {})
        }
    }
    
    private val isAttached: Boolean
        get() = _view?.get() != null
}

// 通用 View 接口
interface BaseMvpView : LifecycleOwner {
    fun getUserId(): Int
}

interface StatefulView {
    fun showLoading()
    fun hideLoading()
    fun showError(throwable: Throwable, retry: () -> Unit)
    fun showEmpty(message: String, onRetry: () -> Unit)
}

// 可复用的列表 Presenter
abstract class ListPresenter<V : BaseMvpView & StatefulView, T> : BaseMvpPresenter<V>() {
    
    protected var currentPage = 0
    protected var hasMore = true
    
    abstract suspend fun loadPage(page: Int): List<T>
    
    abstract fun renderList(data: List<T>)
    
    fun loadData() {
        showLoading()
        
        viewModelScope.launch {
            try {
                val data = loadPage(currentPage)
                
                if (data.isNotEmpty()) {
                    hasMore = data.size >= PAGE_SIZE
                } else {
                    hasMore = false
                }
                
                renderList(data)
                hideLoading()
            } catch (e: Exception) {
                showError(e, ::loadData)
            }
        }
    }
    
    fun loadMore() {
        if (!hasMore) return
        
        currentPage++
        loadData()
    }
    
    fun refresh() {
        currentPage = 0
        hasMore = true
        loadData()
    }
}

// 具体实现
class UserListPresenter @Inject constructor(
    private val userRepository: UserRepository
) : ListPresenter<UserListView, User>() {
    
    override suspend fun loadPage(page: Int): List<User> {
        return userRepository.getUsers(page, PAGE_SIZE)
    }
    
    override fun renderList(data: List<User>) {
        view.showUsers(data)
    }
}
```

---

## 五、MVP vs MVVM 对比

### 5.1 架构对比

```
┌─────────────────────────────────────────────────────────┐
│                      MVP vs MVVM                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MVP 架构：                                              │
│  ┌─────────┐    ┌───────────┐    ┌─────────┐          │
│  │  View   │←───│ Presenter │───→│  Model  │          │
│  │ (接口)  │    │  (业务)   │    │ (数据)  │          │
│  └─────────┘    └───────────┘    └─────────┘          │
│      ↑                                                    │
│      │ Activity/Fragment 实现                            │
│                                                         │
│  MVVM 架构：                                             │
│  ┌─────────┐    ┌───────────┐    ┌─────────┐          │
│  │  View   │───→│ ViewModel │───→│ Model   │          │
│  │ (UI)    │←───│  (状态)   │    │ (数据)  │          │
│  └─────────┘    └───────────┘    └─────────┘          │
│      ↓                                                    │
│      │ 数据绑定/观察者模式                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 核心差异

| 维度 | MVP | MVVM |
|------|-----|------|
| **View 实现** | 接口定义，Activity 实现 | 直接使用 Activity/Fragment |
| **通信方式** | 直接调用接口方法 | 数据绑定、观察者模式 |
| **状态管理** | Presenter 管理 | ViewModel + LiveData/Flow |
| **生命周期** | 手动管理 attach/detach | 自动感知 |
| **配置更新** | 需要手动处理 | ViewModel 自动保留 |
| **代码量** | 较多（接口 + 实现） | 较少 |
| **测试难度** | 容易（接口隔离） | 较容易 |
| **学习曲线** | 平缓 | 稍陡（数据绑定） |
| **适用场景** | 复杂业务逻辑 | 数据驱动 UI |

### 5.3 代码对比

```kotlin
// ==================== MVP 实现 ====================

// View 接口
interface UserView {
    fun showLoading()
    fun showUser(user: User)
    fun showError(message: String)
}

// Presenter
class UserPresenter {
    private var _view: WeakReference<UserView>? = null
    private val view get() = _view?.get() ?: throw IllegalStateException("Not attached")
    
    fun attach(view: UserView) { _view = WeakReference(view) }
    fun detach() { _view?.clear(); _view = null }
    
    fun loadUser() {
        view.showLoading()
        // 加载逻辑
        view.showUser(user)
    }
}

// Activity
class UserActivity : AppCompatActivity(), UserView {
    private lateinit var presenter: UserPresenter
    
    override fun showLoading() { progressBar.show() }
    override fun showUser(user: User) { tvName.text = user.name }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    
    override fun onResume() { presenter.attach(this) }
    override fun onPause() { presenter.detach() }
}

// ==================== MVVM 实现 ====================

// ViewModel
class UserViewModel : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user
    
    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    fun loadUser() {
        _loading.value = true
        // 加载逻辑
        _user.value = user
        _loading.value = false
    }
}

// Activity
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 观察状态
        viewModel.loading.observe(this) { loading ->
            if (loading) progressBar.show() else progressBar.hide()
        }
        
        viewModel.user.observe(this) { user ->
            tvName.text = user.name
        }
        
        viewModel.loadUser()
    }
}
```

---

## 六、面试核心考点

### 6.1 基础问题

**Q1: MVP 架构的核心思想？**

**A:**
```
MVP = Model-View-Presenter

核心思想:
1. View 层只负责展示，通过接口与 Presenter 通信
2. Presenter 层负责业务逻辑，连接 View 和 Model
3. Model 层负责数据操作，独立于 UI

特点:
- 职责清晰分离
- 便于单元测试
- 解决了 MVC 中 Controller 过于臃肿的问题
```

**Q2: Presenter 为什么要使用弱引用？**

**A:**
```
原因: 防止内存泄漏

Presenter 持有 View 的强引用，而 View (Activity/Fragment) 的生命周期较短。
如果 Presenter 长期持有 View 的引用，会导致 View 无法被回收，产生内存泄漏。

使用弱引用的好处:
1. 不阻止 View 被垃圾回收
2. 在需要访问 View 时检查是否有效
3. 配合 attach/detach 机制管理生命周期

示例:
private var _view: WeakReference<UserView>? = null
protected val view get() = _view?.get() ?: throw IllegalStateException("Not attached")
```

**Q3: MVP 中 attach/detach 的时机？**

**A:**
```
Fragment:
- onResume() 调用 attach()
- onPause() 调用 detach()

Activity:
- onStart() 调用 attach()
- onStop() 调用 detach()

原因:
1. 确保 View 可见时才进行交互
2. 在 View 不可见时及时释放引用
3. 避免在后台执行不必要的 UI 更新
```

**Q4: MVP 如何处理配置更新（屏幕旋转）？**

**A:**
```
方案 1: 使用 ViewModel 保存状态
class UserPresenter {
    private val viewModel: UserViewModel by viewModel()
    
    fun loadUser() {
        viewModel.userData.observe { data ->
            view.showData(data)
        }
    }
}

方案 2: 使用 onSaveInstanceState
class UserActivity : AppCompatActivity() {
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt("userId", currentUserId)
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        val userId = savedInstanceState?.getInt("userId") ?: 1
        presenter.loadUser(userId)
    }
}
```

### 6.2 进阶问题

**Q5: MVP 如何处理异步请求的取消？**

**A:**
```kotlin
// 使用协程
class UserPresenter {
    private var currentJob: Job? = null
    
    fun loadUser(userId: Int) {
        currentJob?.cancel()
        currentJob = viewModelScope.launch {
            // 异步请求
        }
    }
}

// 使用 RxJava
class UserPresenter : DisposableManager {
    private val disposable = CompositeDisposable()
    
    fun loadUser(userId: Int) {
        disposable.add(
            api.getUser(userId)
                .subscribe { ... }
        )
    }
    
    override fun dispose() {
        disposable.clear()
    }
}
```

**Q6: MVP 中如何处理多页面共享状态？**

**A:**
```kotlin
// 方案 1: 使用 ViewModel 共享
class SharedViewModel : ViewModel() {
    private val _sharedState = MutableLiveData<SharedState>()
    val sharedState: LiveData<SharedState> = _sharedState
}

class PresenterA {
    private val viewModel: SharedViewModel by activityViewModels()
}

class PresenterB {
    private val viewModel: SharedViewModel by activityViewModels()
}

// 方案 2: 使用 EventBus
class Presenter {
    fun updateSharedData(data: Data) {
        EventBus.getDefault().post(data)
    }
}
```

**Q7: MVP 的优缺点？**

**A:**
```
优点:
1. 职责清晰，View、Presenter、Model 分离
2. 便于单元测试，Presenter 不依赖 Android 框架
3. 可维护性好，修改一处不影响其他层
4. 支持多种 View 实现

缺点:
1. 代码量较多，需要定义大量接口
2. 需要手动管理生命周期
3. 配置更新时需要特殊处理
4. 不支持数据绑定，UI 更新需要手动调用
```

**Q8: MVP 与 MVVM 如何选择？**

**A:**
```
选择 MVP:
- 项目已经使用 MVP，保持一致性
- 需要更精细的控制 UI 更新
- 团队对数据绑定不熟悉
- 需要更清晰的架构分层

选择 MVVM:
- 新项目，追求开发效率
- UI 更新频繁，需要数据绑定
- 使用 Jetpack Compose
- 需要更好的配置更新支持
```

### 6.3 实战问题

**Q9: MVP 中如何实现数据缓存？**

**A:**
```kotlin
class UserPresenter {
    private val cache = HashMap<Int, User>()
    
    fun loadUser(userId: Int) {
        // 先查缓存
        val cached = cache[userId]
        if (cached != null && isCacheValid(cached)) {
            view.showUser(cached)
            return
        }
        
        // 缓存失效，请求网络
        view.showLoading()
        viewModelScope.launch {
            val user = userRepository.getUser(userId)
            cache[userId] = user
            view.hideLoading()
            view.showUser(user)
        }
    }
    
    private fun isCacheValid(user: User): Boolean {
        return System.currentTimeMillis() - user.cacheTime < CACHE_DURATION
    }
}
```

**Q10: MVP 如何处理错误和异常？**

**A:**
```kotlin
// 定义统一错误处理
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val code: Int) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

class UserPresenter {
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            val result = runCatching {
                userRepository.getUser(userId)
            }
            
            when (result) {
                is Result.Success -> {
                    view.hideLoading()
                    view.showUser(result.data)
                }
                is Result.Error -> {
                    view.hideLoading()
                    view.showError(result.message)
                }
            }
        }
    }
}

// 错误枚举
enum class ErrorCode(
    val code: Int,
    val message: String
) {
    NETWORK_ERROR(1001, "网络错误"),
    SERVER_ERROR(1002, "服务器错误"),
    DATA_NOT_FOUND(1003, "数据不存在"),
    UNKNOWN_ERROR(9999, "未知错误")
}
```

**Q11: MVP 的 Presenter 应该单例吗？**

**A:**
```
不推荐单例！

原因:
1. Presenter 持有 View 引用，单例会导致内存泄漏
2. 每个页面实例应该有自己的 Presenter
3. 不同页面可能需要不同的业务逻辑

正确的做法:
- Activity/Fragment 创建时创建 Presenter
- Activity/Fragment 销毁时释放 Presenter
- 需要共享状态时使用 ViewModel 或 Repository
```

**Q12: MVP 中的 View 接口应该定义多少方法？**

**A:**
```
原则:
1. 只定义 Presenter 需要调用的方法
2. 方法粒度适中，避免过于细碎
3. 考虑错误处理、加载状态等

示例:
interface UserView {
    // 状态管理
    fun showLoading()
    fun hideLoading()
    
    // 数据显示
    fun showUser(user: User)
    fun showUsers(users: List<User>)
    
    // 错误处理
    fun showError(message: String)
    fun showNetworkError()
    
    // 空状态
    fun showEmpty(message: String)
    
    // 导航
    fun navigateToDetail(userId: Int)
    
    // 用户交互
    fun confirmDelete(userId: Int): Boolean
}

不好的做法（过于细碎）:
interface UserView {
    fun setUserName(name: String)
    fun setUserEmail(email: String)
    fun setUserAvatar(avatar: String)
    // ... 太多细碎方法
}
```

### 6.4 架构演进问题

**Q13: MVP 如何演进到 MVVM？**

**A:**
```kotlin
// 阶段 1: 纯 MVP
class UserPresenter {
    fun loadUser() { /* 业务逻辑 */ }
}

// 阶段 2: MVP + ViewModel
class UserViewModel : ViewModel() {
    fun loadUser() { /* 业务逻辑 */ }
}

class UserPresenter(private val viewModel: UserViewModel) {
    fun loadUser() {
        viewModel.loadUser()
        // 协调逻辑
    }
}

// 阶段 3: 纯 MVVM
class UserViewModel : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user
    
    fun loadUser() {
        // 业务逻辑 + 状态管理
    }
}
```

**Q14: 如何在 MVP 中实现依赖注入？**

**A:**
```kotlin
// 使用 Dagger/Hilt
@Module
@InstallIn(SingletonComponent::class)
object PresenterModule {
    
    @Provides
    fun provideUserPresenter(
        userRepository: UserRepository
    ): UserPresenter {
        return UserPresenter(userRepository)
    }
}

@AndroidEntryPoint
class UserActivity : AppCompatActivity(), UserView {
    @Inject lateinit var presenter: UserPresenter
    
    override fun onResume() {
        super.onResume()
        presenter.attach(this)
    }
    
    override fun onPause() {
        presenter.detach()
        super.onPause()
    }
}
```

### 6.5 测试相关问题

**Q15: 如何测试 MVP 的 Presenter？**

**A:**
```kotlin
// Mock View 接口
class MockUserView : UserView {
    var isLoading = false
    var user: User? = null
    var errorMessage: String? = null
    
    override fun showLoading() { isLoading = true }
    override fun hideLoading() { isLoading = false }
    override fun showUser(user: User) { this.user = user }
    override fun showError(message: String) { errorMessage = message }
}

// Mock Repository
class MockUserRepository : UserRepository {
    fun getUser(userId: Int): Result<User> {
        return Result.success(User(1, "Test User", "test@example.com"))
    }
}

// 测试 Presenter
@Test
fun `test loadUser success`() {
    // 准备
    val mockView = MockUserView()
    val mockRepository = MockUserRepository()
    val presenter = UserPresenter(mockRepository)
    presenter.attach(mockView)
    
    // 执行
    presenter.loadUser(1)
    
    // 验证
    assertEquals(false, mockView.isLoading)
    assertEquals("Test User", mockView.user?.name)
    assertNull(mockView.errorMessage)
    
    // 清理
    presenter.detach()
}

@Test
fun `test loadUser error`() {
    val mockView = MockUserView()
    val mockRepository = object : UserRepository {
        override fun getUser(userId: Int): Result<User> {
            return Result.failure(Exception("Network error"))
        }
    }
    
    val presenter = UserPresenter(mockRepository)
    presenter.attach(mockView)
    
    presenter.loadUser(1)
    
    assertEquals(false, mockView.isLoading)
    assertNull(mockView.user)
    assertNotNull(mockView.errorMessage)
    
    presenter.detach()
}
```

---

## 七、MVP 实战案例：用户列表

### 7.1 完整实现

```kotlin
// ==================== 1. Model 层 ====================

data class User(
    val id: Int,
    val name: String,
    val email: String,
    val avatar: String
)

interface UserRepository {
    suspend fun getUsers(page: Int, size: Int): List<User>
    suspend fun getUserById(id: Int): User
    suspend fun searchUsers(keyword: String): List<User>
}

class UserRepositoryImpl @Inject constructor(
    private val userApi: UserApi,
    private val userDao: UserDao
) : UserRepository {
    
    private val cache = ConcurrentHashMap<Int, User>()
    
    override suspend fun getUsers(page: Int, size: Int): List<User> {
        // 网络优先，缓存兜底
        return try {
            val users = userApi.getUsers(page, size)
            users.forEach { user ->
                cache[user.id] = user
            }
            users
        } catch (e: Exception) {
            // 返回缓存数据
            cache.values.toList()
        }
    }
    
    override suspend fun getUserById(id: Int): User {
        // 先查缓存
        cache[id]?.let { return it }
        
        // 查网络
        try {
            val user = userApi.getUserById(id)
            cache[user.id] = user
            return user
        } catch (e: Exception) {
            // 查本地数据库
            return userDao.getUserById(id)
                ?: throw Exception("用户不存在")
        }
    }
    
    override suspend fun searchUsers(keyword: String): List<User> {
        return try {
            userApi.searchUsers(keyword)
        } catch (e: Exception) {
            // 本地搜索
            cache.values.filter {
                it.name.contains(keyword, ignoreCase = true) ||
                it.email.contains(keyword, ignoreCase = true)
            }
        }
    }
}

// ==================== 2. View 接口 ====================

interface UserListView : StatefulView {
    fun showUsers(users: List<User>)
    fun showNoMore()
    fun showSearchResult(users: List<User>)
    fun navigateToDetail(userId: Int)
}

// ==================== 3. Presenter 实现 ====================

class UserListPresenter @Inject constructor(
    private val userRepository: UserRepository
) : BaseMvpPresenter<UserListView>() {
    
    companion object {
        private const val PAGE_SIZE = 20
    }
    
    private var currentPage = 0
    private var hasMore = true
    private val users = mutableListOf<User>()
    private var currentJob: Job? = null
    
    override fun onAttachView() {
        // 首次加载
        loadMore()
    }
    
    fun loadMore() {
        if (!hasMore || isloading) return
        
        currentJob?.cancel()
        currentJob = viewModelScope.launch {
            try {
                val pageUsers = userRepository.getUsers(currentPage, PAGE_SIZE)
                
                if (pageUsers.isNotEmpty()) {
                    users.addAll(pageUsers)
                    hasMore = pageUsers.size >= PAGE_SIZE
                    view.showUsers(users.toList())
                } else {
                    hasMore = false
                    view.showNoMore()
                }
            } catch (e: Exception) {
                showError(e, ::loadMore)
            }
        }
    }
    
    fun refresh() {
        currentPage = 0
        hasMore = true
        users.clear()
        loadMore()
    }
    
    fun search(keyword: String) {
        if (keyword.isBlank()) {
            view.showEmpty("请输入搜索关键词")
            return
        }
        
        currentJob?.cancel()
        currentJob = viewModelScope.launch {
            try {
                val result = userRepository.searchUsers(keyword)
                if (result.isEmpty()) {
                    view.showEmpty("没有找到用户")
                } else {
                    view.showSearchResult(result)
                }
            } catch (e: Exception) {
                showError(e, ::search)
            }
        }
    }
    
    fun goToDetail(userId: Int) {
        view.navigateToDetail(userId)
    }
}

// ==================== 4. View 实现 ====================

class UserListActivity : AppCompatActivity(), UserListView {
    
    private lateinit var presenter: UserListPresenter
    private lateinit var adapter: UserAdapter
    private val binding: ActivityUserListBinding by lazy {
        ActivityUserListBinding.inflate(layoutInflater)
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(binding.root)
        
        // 初始化 Presenter
        presenter = Hilt_DependencyUserListPresenter(this)
        
        // 初始化 RecyclerView
        initRecyclerView()
        
        // 初始化搜索
        initSearch()
        
        // 关联 View
        presenter.attach(this)
    }
    
    private fun initRecyclerView() {
        adapter = UserAdapter()
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter
        
        // 下拉刷新
        binding.swipeRefresh.setOnRefreshListener {
            presenter.refresh()
        }
        
        // 加载更多
        binding.recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                super.onScrolled(recyclerView, dx, dy)
                
                val visibleItemCount = recyclerView.childCount
                val totalItemCount = adapter.itemCount
                val pastItems = recyclerView.layoutManager?.findFirstVisibleItemPosition() ?: 0
                
                if (pastItems + visibleItemCount >= totalItemCount) {
                    presenter.loadMore()
                }
            }
        })
        
        // 点击事件
        adapter.setOnItemClickListener { position ->
            val user = adapter.getItem(position)
            presenter.goToDetail(user.id)
        }
    }
    
    private fun initSearch() {
        binding.etSearch.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                binding.ivSearch.visibility = View.VISIBLE
            }
        }
        
        binding.ivSearch.setOnClickListener {
            val keyword = binding.etSearch.text.toString().trim()
            presenter.search(keyword)
        }
    }
    
    // 实现 StatefulView
    override fun showLoading() {
        binding.progressBar.visibility = View.VISIBLE
    }
    
    override fun hideLoading() {
        binding.progressBar.visibility = View.GONE
        binding.swipeRefresh.isRefreshing = false
    }
    
    override fun showError(error: Throwable, retry: () -> Unit) {
        hideLoading()
        binding.tvError.text = error.message ?: "加载失败"
        binding.btnRetry.setOnClickListener { retry() }
        binding.errorLayout.visibility = View.VISIBLE
        binding.recyclerView.visibility = View.GONE
    }
    
    override fun showEmpty(message: String, onRetry: () -> Unit) {
        hideLoading()
        binding.tvEmpty.text = message
        binding.emptyLayout.visibility = View.VISIBLE
        binding.recyclerView.visibility = View.GONE
    }
    
    // 实现 UserListView
    override fun showUsers(users: List<User>) {
        hideLoading()
        binding.errorLayout.visibility = View.GONE
        binding.emptyLayout.visibility = View.GONE
        binding.recyclerView.visibility = View.VISIBLE
        adapter.updateData(users)
    }
    
    override fun showNoMore() {
        // 显示"没有更多了"提示
    }
    
    override fun showSearchResult(users: List<User>) {
        hideLoading()
        adapter.updateData(users)
    }
    
    override fun navigateToDetail(userId: Int) {
        val intent = Intent(this, UserDetailActivity::class.java)
        intent.putExtra("userId", userId)
        startActivity(intent)
    }
    
    override fun onDestroy() {
        presenter.detach()
        super.onDestroy()
    }
}

// ==================== 5. Adapter 实现 ====================

class UserAdapter : RecyclerView.Adapter<UserAdapter.ViewHolder>() {
    
    private var users = mutableListOf<User>()
    private var onItemClickListener: ((Int) -> Unit)? = null
    
    fun updateData(newUsers: List<User>) {
        users = newUsers.toMutableList()
        notifyDataSetChanged()
    }
    
    fun getItem(position: Int): User {
        return users[position]
    }
    
    fun setOnItemClickListener(listener: (Int) -> Unit) {
        onItemClickListener = listener
    }
    
    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tv_name)
        private val tvEmail: TextView = itemView.findViewById(R.id.tv_email)
        private val ivAvatar: ImageView = itemView.findViewById(R.id.iv_avatar)
        
        fun bind(user: User, position: Int) {
            tvName.text = user.name
            tvEmail.text = user.email
            ivAvatar.load(user.avatar)
            
            itemView.setOnClickListener {
                onItemClickListener?.invoke(user.id)
            }
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_user, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(users[position], position)
    }
    
    override fun getItemCount(): Int {
        return users.size
    }
}
```

---

## 八、MVP 最佳实践总结

### 8.1 实践要点

| 类别 | 实践 | 说明 |
|------|------|------|
| **引用管理** | 使用 WeakReference | 防止内存泄漏 |
| **生命周期** | 在 onResume/onPause 中 attach/detach | 配合 View 生命周期 |
| **异步处理** | 使用协程/RxJava 管理 | 支持取消 |
| **状态管理** | 统一处理 Loading/Error/Empty | 提升用户体验 |
| **接口设计** | 粒度适中，职责单一 | 便于维护 |
| **依赖注入** | 使用 Hilt/Dagger | 便于测试 |
| **测试** | Mock View 接口 | 单元测试 |

### 8.2 常见陷阱

```kotlin
// ❌ 陷阱 1: 不使用弱引用
class BadPresenter {
    private var _view: UserView? = null  // 强引用，内存泄漏！
    
    fun attach(view: UserView) {
        _view = view
    }
}

// ✅ 正确做法
class GoodPresenter {
    private var _view: WeakReference<UserView>? = null
    
    fun attach(view: UserView) {
        _view = WeakReference(view)
    }
    
    fun detach() {
        _view?.clear()
        _view = null
    }
}

// ❌ 陷阱 2: 在错误时机 attach/detach
class BadActivity : AppCompatActivity(), UserView {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        presenter.attach(this)  // onCreate 中 attach，如果页面未显示会执行 UI 操作
    }
}

// ✅ 正确做法
class GoodActivity : AppCompatActivity(), UserView {
    override fun onResume() {
        super.onResume()
        presenter.attach(this)  // onResume 中 attach，确保 View 可见
    }
    
    override fun onPause() {
        presenter.detach(this)  // onPause 中 detach
        super.onPause()
    }
}

// ❌ 陷阱 3: 不处理配置更新
class BadActivity : AppCompatActivity(), UserView {
    // 屏幕旋转后，Presenter 中的数据丢失
}

// ✅ 正确做法
class GoodActivity : AppCompatActivity(), UserView {
    private val viewModel: UserViewModel by viewModels()
    
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        viewModel.saveState()
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.restoreState()
    }
}
```

### 8.3 性能优化

```kotlin
// 1. 减少不必要的 attach/detach
class OptimizedPresenter {
    private var isAttached = false
    
    fun attach(view: V) {
        if (!isAttached) {
            _view = WeakReference(view)
            isAttached = true
            onAttachView()
        }
    }
    
    fun detach() {
        if (isAttached) {
            onDetachView()
            _view?.clear()
            _view = null
            isAttached = false
        }
    }
}

// 2. 请求合并和防抖
class OptimizedPresenter {
    private val searchJob = Job()
    
    fun search(keyword: String) {
        searchJob.cancel()
        searchJob = Job()
        
        viewModelScope.launch(searchJob) {
            delay(300)  // 防抖
            // 搜索逻辑
        }
    }
}

// 3. 合理使用缓存
class OptimizedPresenter {
    private val cache = LRUCache<Int, User>(100)
    
    fun loadUser(userId: Int) {
        val cached = cache.get(userId)
        if (cached != null && isCacheValid(cached)) {
            view.showUser(cached)
            return
        }
        
        // 请求网络
        viewModelScope.launch {
            val user = userRepository.getUser(userId)
            cache.put(userId, user)
            view.showUser(user)
        }
    }
}
```

---

## 九、MVP 面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| MVP 核心概念 | ⭐⭐ | Model/View/Presenter 职责 |
| Presenter 弱引用 | ⭐⭐⭐ | 防止内存泄漏 |
| attach/detach 时机 | ⭐⭐⭐ | onResume/onPause |
| 配置更新处理 | ⭐⭐⭐ | ViewModel/InstanceState |
| 异步请求取消 | ⭐⭐⭐ | 协程 Job/RxJava Disposable |
| MVP vs MVVM | ⭐⭐⭐ | 对比分析 |
| 单元测试 | ⭐⭐⭐ | Mock View |
| 依赖注入集成 | ⭐⭐⭐ | Hilt/Dagger |
| 状态管理 | ⭐⭐⭐ | Loading/Error/Empty |
| 性能优化 | ⭐⭐⭐⭐ | 缓存/防抖/请求合并 |

---

## 十、扩展阅读

### 10.1 参考资料

- [Android Architecture Components](https://developer.android.com/topic/architecture)
- [MVP 模式详解](https://medium.com/androiddevelopers/architecture-components-and-what-you-can-do-with-them-230886e7014f)
- [Effective Android - MVP](https://github.com/googlesamples/android-architecture)

### 10.2 相关模式

- [MVC](../02_MVC/01_MVC 架构.md)
- [MVVM](./01_MVVM 架构与 Hilt 依赖注入.md)
- [MVI](./03_MVI 架构.md)

### 10.3 实战项目

- [Architecture Blueprints](https://github.com/googlesamples/android-architecture)
- [Now in Android](https://github.com/android/nowinandroid)

---

**🔗 上一篇**: [MVVM 架构与 Hilt 依赖注入](./01_MVVM 架构与 Hilt 依赖注入.md)

**🔗 下一篇**: [MVI 架构](./03_MVI 架构.md)