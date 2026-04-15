# ViewModel 深度解析

> **字数统计：约 10000 字**  
> **难度等级：⭐⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐⭐**

---

## 目录

1. [ViewModel 基础概念和职责](#1-viewmodel-基础概念和职责)
2. [ViewModel 创建和使用](#2-viewmodel-创建和使用)
3. [ViewModel 与生命周期绑定](#3-viewmodel-与生命周期绑定)
4. [ViewModel 数据保留原理](#4-viewmodel-数据保留原理)
5. [ViewModel 与 LiveData/Flow 配合](#5-viewmodel-与-livedataflow-配合)
6. [SavedStateHandle 使用](#6-savedstatehandle-使用)
7. [ViewModel 最佳实践](#7-viewmodel-最佳实践)
8. [常见错误和坑](#8-常见错误和坑)
9. [面试考点](#9-面试考点)
10. [参考资料](#10-参考资料)

---

## 1. ViewModel 基础概念和职责

### 1.1 什么是 ViewModel？

**ViewModel** 是 Android Jetpack 组件库中 `androidx.lifecycle:lifecycle-viewmodel` 库提供的核心组件，它是 **MVC 和 MVP 架构模式的演变**，专门用于 **存储和管理 UI 相关的数据**。

```kotlin
// ViewModel 的基本结构
class MyViewModel : ViewModel() {
    // 这里存放 UI 相关的数据
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    // ViewModel 的销毁回调
    override fun onCleared() {
        super.onCleared()
        // 清理资源
    }
}
```

### 1.2 ViewModel 的核心职责

#### 职责一：数据保持（Survive Configuration Changes）

```kotlin
// ❌ 错误：Activity 旋转后数据丢失
class MyActivity : AppCompatActivity() {
    private var userName: String = ""
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 用户输入数据
        userName = "张三"
        // 设备旋转后，Activity 重建，userName 重置为空
    }
}

// ✅ 正确：使用 ViewModel 保持数据
class MyViewModel : ViewModel() {
    private val _userName = MutableLiveData<String>()
    val userName: LiveData<String> = _userName
    
    fun setUserName(name: String) {
        _userName.value = name
    }
}

class MyActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.setUserName("张三")
        // 设备旋转后，viewModel 中的数据仍然存在
    }
}
```

#### 职责二：数据准备和转换

```kotlin
class UserViewModel : ViewModel() {
    private val repository: UserRepository
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
    
    init {
        loadUsers()
    }
    
    fun loadUsers() {
        viewModelScope.launch {
            try {
                val userList = repository.fetchUsers()
                _users.value = userList
            } catch (e: Exception) {
                // 处理错误
            }
        }
    }
    
    // 数据转换：将原始数据转换为 UI 可用格式
    fun searchUsers(query: String): LiveData<List<User>> {
        return Transformations.map(_users) { users ->
            users.filter { it.name.contains(query, ignoreCase = true) }
        }
    }
}
```

#### 职责三：作为 UI 和 Repository 之间的桥梁

```kotlin
// Repository 层：数据处理
class UserRepository {
    suspend fun getUsers(): List<User> = coroutineScope {
        // 网络请求、数据库查询等
        api.getUserList()
    }
}

// ViewModel 层：协调 UI 和 Repository
class UserViewModel(private val repository: UserRepository) : ViewModel() {
    private val _uiState = MutableLiveData<UiState<List<User>>>()
    val uiState: LiveData<UiState<List<User>>> = _uiState
    
    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            try {
                val users = repository.getUsers()
                _uiState.value = UiState.Success(users)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

// UI 状态 sealed class
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<out T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
    data class Empty(val message: String = "No data") : UiState<Nothing>()
}
```

### 1.3 ViewModel 的设计原则

#### 原则一：UI 感知零感知（UI Agnostic）

```kotlin
// ✅ ViewModel 不应该依赖 View
class MyViewModel : ViewModel() {
    // ViewModel 不知道 Activity、Fragment、View 的存在
    fun processData() {
        // 只处理数据，不操作 UI
    }
}

// ❌ ViewModel 不应该持有 View 的引用
class BadViewModel : ViewModel() {
    private var textView: TextView? = null  // 错误！
    
    fun updateUI(text: String) {
        textView?.text = text  // 错误！
    }
}

// ✅ ViewModel 通过 LiveData 暴露数据
class GoodViewModel : ViewModel() {
    private val _text = MutableLiveData<String>()
    val text: LiveData<String> = _text
    
    fun updateText(newText: String) {
        _text.value = newText
    }
}
```

#### 原则二：生命周期感知

```kotlin
class MyViewModel : ViewModel() {
    // ViewModel 的生命周期独立于 Activity/Fragment
    // 在配置变化时不会销毁，只在 ViewModelStore 销毁时才清理
    
    override fun onCleared() {
        super.onCleared()
        // 这里进行资源清理
        // 取消网络请求、关闭数据库连接等
    }
}
```

---

## 2. ViewModel 创建和使用

### 2.1 ViewModel 的创建方式

#### 方式一：Kotlin 委托属性（推荐）

```kotlin
class MyActivity : AppCompatActivity() {
    // Activity 作用域的 ViewModel
    private val viewModel: MyViewModel by viewModels()
    
    // 使用自定义 ViewModelStoreOwner
    private val viewModelWithOwner: MyViewModel by viewModels(ownerProducer = { customStoreOwner })
    
    // 使用自定义 ViewModelProvider.Factory
    private val viewModelWithFactory: MyViewModel by viewModels {
        ViewModelProvider.AndroidViewModelFactory.getInstance(application)
    }
    
    // 使用名称创建 ViewModel（同一个名称返回同一实例）
    private val namedViewModel: MyViewModel by viewModels(
        key = "myViewModelKey"
    )
}

class MyFragment : Fragment() {
    // Fragment 作用域的 ViewModel
    private val viewModel: MyViewModel by viewModels()
    
    // 与 Activity 共享的 ViewModel（整个 Fragment 树共享）
    private val sharedViewModel: MyViewModel by activityViewModels()
}
```

#### 方式二：ViewModelProvider 直接创建

```kotlin
class MyActivity : AppCompatActivity() {
    private lateinit var viewModel: MyViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 默认工厂
        viewModel = ViewModelProvider(this)[MyViewModel::class.java]
        
        // 自定义工厂
        val factory = MyViewModelFactory(application)
        viewModel = ViewModelProvider(this, factory)[MyViewModel::class.java]
        
        // 使用名称
        viewModel = ViewModelProvider(this)[MyViewModel::class.java, "myKey"]
    }
}
```

#### 方式三：Hilt 依赖注入（推荐）

```kotlin
// ViewModel 注解
@HiltViewModel
class MyViewModel @Inject constructor(
    private val repository: UserRepository,
    private val api: ApiService
) : ViewModel() {
    // ViewModel 内容由 Hilt 管理
}

// Activity 中使用
@AndroidEntryPoint
class MyActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    // Hilt 会自动处理 ViewModel 的创建和依赖注入
}

// Fragment 中使用
@AndroidEntryPoint
class MyFragment : Fragment() {
    private val viewModel: MyViewModel by viewModels()
}
```

### 2.2 ViewModel 的作用域（Scope）

#### Activity 作用域

```kotlin
// Activity 中的 ViewModel
class MainActivity : AppCompatActivity() {
    private val mainViewModel: MainViewModel by viewModels()
    // 这个 ViewModel 只属于当前 Activity
}

// Fragment 中的 Activity 作用域 ViewModel
class ChildFragment : Fragment() {
    private val mainViewModel: MainViewModel by activityViewModels()
    // 与 Activity 共享同一个 ViewModel 实例
}
```

#### Fragment 作用域

```kotlin
// Fragment 中的 ViewModel
class DetailFragment : Fragment() {
    private val detailViewModel: DetailViewModel by viewModels()
    // 这个 ViewModel 只属于当前 Fragment
}
```

#### DialogFragment 作用域

```kotlin
// DialogFragment 中的 ViewModel
class DialogFragment : Fragment() {
    private val dialogViewModel: DialogViewModel by viewModels()
    
    // 显示对话框
    override fun onCreateView(...) {
        dialogViewModel.data.observe(viewLifecycleOwner) {
            // 处理数据
        }
    }
    
    // Dialog 关闭后，ViewModel 仍然存在（直到 Fragment 销毁）
}
```

### 2.3 ViewModel 的参数传递

#### 方式一：构造函数参数

```kotlin
// 无参构造函数（默认）
class MyViewModel : ViewModel() {
    // 默认创建
}

// 带参数的构造函数
class UserViewModel(
    private val userId: String,
    private val repository: UserRepository
) : ViewModel() {
    
    init {
        loadUser(userId)
    }
    
    private fun loadUser(userId: String) {
        viewModelScope.launch {
            // 加载用户数据
        }
    }
}

// 使用 Factory 创建
class UserViewModelFactory(
    private val userId: String,
    private val repository: UserRepository
) : ViewModelProvider.Factory {
    
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(UserViewModel::class.java)) {
            return UserViewModel(userId, repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

// 在 Activity 中使用
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModels {
        UserViewModelFactory(userId, userRepository)
    }
}
```

#### 方式二：SavedStateHandle（推荐）

```kotlin
class UserViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    // 从 SavedStateHandle 获取参数
    val userId: String = savedState.get<String>("userId") ?: ""
    
    // 或者使用 defaultArgs
    val userIdWithDefault: String = savedState["userId"] ?: "default"
    
    // 处理复杂的参数
    val userPreferences: UserPreferences = savedState.get(
        "userPreferences",
        UserPreferences::class.java
    ) ?: UserPreferences()
}

// 创建 ViewModel
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModels()
    
    // 参数会通过 SavedStateHandle 自动传递
    // 在 Navigation 中使用时，参数会自动从 args 中获取
}
```

---

## 3. ViewModel 与生命周期绑定

### 3.1 ViewModel 的生命周期

```kotlin
class LifecycleDemoViewModel : ViewModel() {
    
    // ViewModel 创建时机：第一次通过 ViewModelProvider 获取时
    init {
        println("ViewModel 创建")
    }
    
    // ViewModel 销毁时机：ViewModelStore 被清除时
    override fun onCleared() {
        super.onCleared()
        println("ViewModel 销毁")
        // 清理资源
    }
}

// 测试场景
class TestActivity : AppCompatActivity() {
    private val viewModel: LifecycleDemoViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 第一次获取 ViewModel，触发 init
    }
    
    // 设备旋转
    // Activity 重建，但 ViewModel 不会重建（init 不会再次执行）
    
    // 按 Home 键，应用进入后台
    // ViewModel 仍然存在
    
    // 系统内存不足，杀死进程
    // ViewModel 也会丢失
    
    // 调用 viewModelStore.clear()
    // ViewModel 触发 onCleared()
}
```

### 3.2 ViewModel 与 Activity/Fragment 生命周期对比

```
Activity/Fragment 生命周期        ViewModel 生命周期
━━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━━

onCreate()                   创建（第一次获取时）
onStart()                    │
onResume()                   │ 存在（不被配置变化影响）
onPause()                    │
onStop()                     │
onDestroy()                  │ （设备旋转）
                             │
Activity 重建 onCreate()     继续存在
                             │
                             │
进程被杀死                   销毁
                             │
                             │
手动 clear()                 销毁 onCleared()
```

### 3.3 ViewModel 与 LifecycleOwner 的绑定

```kotlin
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun updateData() {
        _data.value = "New Data"
    }
}

class MyFragment : Fragment() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // LiveData 会自动绑定到 LifecycleOwner
        // 推荐使用 viewLifecycleOwner 而不是 lifecycleOwner
        viewModel.data.observe(viewLifecycleOwner) { data ->
            textView.text = data
        }
        
        // Fragment 进入后台时，LiveData 暂停更新
        // Fragment 销毁时，LiveData 自动解绑
    }
}
```

### 3.4 ViewModel 在不同场景下的行为

#### 场景一：设备旋转

```kotlin
class RotationTestViewModel : ViewModel() {
    private var createCount = 0
    private var clearCount = 0
    
    init {
        createCount++
        println("ViewModel 创建次数：$createCount")
    }
    
    override fun onCleared() {
        super.onCleared()
        clearCount++
        println("ViewModel 清理次数：$clearCount")
    }
    
    fun getCreateCount(): Int = createCount
    fun getClearCount(): Int = clearCount
}

class RotationTestActivity : AppCompatActivity() {
    private val viewModel: RotationTestViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 旋转设备前
        // ViewModel 创建次数：1
        
        // 旋转设备后
        // Activity 重建，但 ViewModel 创建次数仍为 1
        
        // 这说明 ViewModel 在配置变化时保持不变
    }
}
```

#### 场景二：Fragment 切换

```kotlin
class SharedViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun updateData(newData: String) {
        _data.value = newData
    }
}

class FirstFragment : Fragment() {
    // 使用 activityViewModels() 共享 ViewModel
    private val sharedViewModel: SharedViewModel by activityViewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        sharedViewModel.data.observe(viewLifecycleOwner) {
            // 监听数据变化
        }
        
        // 切换到此 Fragment 时，数据依然存在
        sharedViewModel.updateData("First Fragment")
    }
}

class SecondFragment : Fragment() {
    private val sharedViewModel: SharedViewModel by activityViewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        sharedViewModel.data.observe(viewLifecycleOwner) {
            // 这里能接收到 FirstFragment 设置的数据
        }
    }
}
```

---

## 4. ViewModel 数据保留原理

### 4.1 ViewModelStore 机制

```kotlin
// ViewModelStore 是 ViewModel 的容器
class ViewModelStore {
    private val creationalMap = mutableMapOf<String, ReportCreational>()
    private val modelMap = mutableMapOf<String, ViewModel>()
    
    // 获取 ViewModel
    fun <T : ViewModel> get(key: String, modelClass: Class<T>): T {
        // 1. 检查是否已存在
        val existing = modelMap[key] as? T
        if (existing != null) {
            return existing  // 返回已存在的实例
        }
        
        // 2. 创建新实例
        val instance = createInstance(key, modelClass)
        modelMap[key] = instance
        return instance
    }
    
    // 清除所有 ViewModel
    fun clear() {
        modelMap.forEach { (_, viewModel) ->
            viewModel.onCleared()  // 调用 onCleared
        }
        modelMap.clear()
    }
}
```

### 4.2 ViewModelProvider 工作原理

```kotlin
class ViewModelProvider(
    val owner: ViewModelStoreOwner,  // ViewModelStoreOwner 接口
    private val factory: Factory = DefaultViewModelProviderFactory()
) {
    private val viewModelStore: ViewModelStore = owner.viewModelStore
    
    @Suppress("UNCHECKED_CAST")
    operator fun <T : ViewModel> get(
        modelClass: Class<T>,
        key: String = Utils.DEFAULT_KEY
    ): T {
        return viewModelStore.get(key, modelClass)
            ?: viewModelStore.get(key, modelClass) {
                factory.create(modelClass)  // 通过 Factory 创建
            } as T
    }
}
```

### 4.3 ViewModelStoreOwner 接口

```kotlin
// Activity 实现了这个接口
abstract class AppCompatActivity : ComponentActivity(), ViewModelStoreOwner {
    
    @Transient
    private val _viewModelStore: ViewModelStore by lazy { ViewModelStore() }
    
    override val viewModelStore: ViewModelStore
        get() = _viewModelStore
    
    // 在 Activity 销毁时保留 ViewModelStore
    // 在 Activity 重建时复用同一个 ViewModelStore
}

// Fragment 也实现了这个接口
abstract class Fragment : LifecycleOwner, ViewModelStoreOwner {
    
    private val _viewModelStore = ViewModelStore()
    
    override val viewModelStore: ViewModelStore
        get() = _viewModelStore
    
    // Fragment 切换到后台时保留 ViewModelStore
    // 但 Fragment 销毁时会清理 ViewModelStore
}
```

### 4.4 配置变化时的完整流程

```kotlin
class ConfigurationChangeDemo : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 第一次启动
        // 1. 创建 Activity
        // 2. 创建 ViewModelStore
        // 3. 通过 ViewModelProvider 获取 ViewModel
        // 4. ViewModelProvider 在 ViewModelStore 中查找
        // 5. 找不到则创建新的 ViewModel
        // 6. 放入 ViewModelStore 缓存
        
        // 设备旋转
        // 1. 旧 Activity 销毁（onDestroy）
        // 2. 创建新 Activity
        // 3. 新 Activity 复用同一个 ViewModelStore
        // 4. ViewModelProvider 在 ViewModelStore 中查找
        // 5. 找到已存在的 ViewModel
        // 6. 返回同一个 ViewModel 实例
    }
}
```

### 4.5 ViewModel 内存管理

```kotlin
class MemoryManagementViewModel : ViewModel() {
    
    // ✅ 正确：使用 LiveData/StateFlow
    private val _data = MutableLiveData<List<Item>>()
    val data: LiveData<List<Item>> = _data
    
    // ✅ 正确：使用 viewModelScope 执行协程
    fun loadData() {
        viewModelScope.launch {
            val items = repository.fetchItems()
            _data.value = items
        }
    }
    
    // ❌ 错误：持有 View 的引用
    private var textView: TextView? = null  // 可能导致内存泄漏
    
    // ❌ 错误：使用 GlobalScope
    fun loadDataWrong() {
        GlobalScope.launch {  // ViewModel 销毁后协程仍在执行
            val items = repository.fetchItems()
            // 可能导致内存泄漏
        }
    }
    
    // ✅ 正确：在 onCleared 中清理资源
    override fun onCleared() {
        super.onCleared()
        // 取消未完成的协程（viewModelScope 会自动处理）
        // 关闭数据库连接
        // 取消网络订阅
    }
}
```

---

## 5. ViewModel 与 LiveData/Flow 配合

### 5.1 ViewModel + LiveData

```kotlin
class DataViewModel : ViewModel() {
    
    // 1. 使用 MutableLiveData 存储可变数据
    private val _userName = MutableLiveData<String>()
    val userName: LiveData<String> = _userName
    
    // 2. 使用 MediatorLiveData 组合多个 LiveData
    private val _searchQuery = MutableLiveData<String>()
    private val _filterType = MutableLiveData<FilterType>()
    val searchResults = MediatorLiveData<List<Item>>()
    
    init {
        searchResults.addSource(_searchQuery) { query ->
            filterData(query, _filterType.value)
        }
        searchResults.addSource(_filterType) { type ->
            filterData(_searchQuery.value, type)
        }
    }
    
    private fun filterData(query: String?, type: FilterType?) {
        val results = repository.search(query, type)
        searchResults.value = results
    }
    
    override fun onCleared() {
        super.onCleared()
        searchResults.removeSource(_searchQuery)
        searchResults.removeSource(_filterType)
    }
    
    // 3. 使用 Transformations 转换数据
    private val _items = MutableLiveData<List<Item>>()
    val items: LiveData<List<Item>> = _items
    
    // map 转换
    val itemNames: LiveData<List<String>> = Transformations.map(_items) { items ->
        items.map { it.name }
    }
    
    // switchMap 转换
    val selectedItem: LiveData<ItemDetail> = Transformations.switchMap(_items) { items ->
        if (items.isNotEmpty()) {
            getSelectedItem(items.first().id)
        } else {
            LiveData.fromCallable { null }
        }
    }
    
    // 4. 处理异步数据加载
    private val _loading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _loading
    
    fun loadItems() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val items = repository.fetchItems()
                _items.value = items
            } catch (e: Exception) {
                // 处理错误
            } finally {
                _loading.value = false
            }
        }
    }
}
```

### 5.2 ViewModel + StateFlow（推荐）

```kotlin
class FlowViewModel : ViewModel() {
    
    // 1. 使用 StateFlow 作为状态管理
    private val _uiState = MutableStateFlow<UiState<Nothing>>(UiState.Idle)
    val uiState: StateFlow<UiState<Nothing>> = _uiState.asStateFlow()
    
    // 2. 使用 SharedFlow 处理事件
    private val _event = MutableSharedFlow<Event>()
    val event: SharedFlow<Event> = _event
    
    sealed class Event {
        data class ShowToast(val message: String) : Event()
        data class NavigateTo(val screen: Screen) : Event()
    }
    
    sealed class UiState<out T> {
        object Idle : UiState<Nothing>()
        object Loading : UiState<Nothing>()
        data class Success<out T>(val data: T) : UiState<T>()
        data class Error(val message: String) : UiState<Nothing>()
    }
    
    // 3. 加载数据
    fun loadData() {
        viewModelScope.launch {
            _uiState.update { UiState.Loading }
            
            try {
                val data = repository.fetchData()
                _uiState.update { UiState.Success(data) }
            } catch (e: Exception) {
                _uiState.update { UiState.Error(e.message ?: "Unknown error") }
                _event.emit(Event.ShowToast(e.message ?: "Error"))
            }
        }
    }
    
    // 4. 处理用户输入
    fun onSearchQuery(query: String) {
        viewModelScope.launch {
            _uiState.update { UiState.Loading }
            val results = repository.search(query)
            _uiState.update { UiState.Success(results) }
        }
    }
    
    // 5. 组合多个 Flow
    private val _searchQuery = MutableStateFlow("")
    private val _filterType = MutableStateFlow(FilterType.ALL)
    
    val searchResults: StateFlow<List<Item>> = viewModelScope.launchWhenStarted {
        combine(_searchQuery, _filterType) { query, filterType ->
            repository.search(query, filterType)
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )
    
    // 6. 使用 reduce 处理状态转换
    private val _reducerState = MutableStateFlow<State>(InitialState)
    
    fun dispatch(action: Action) {
        _reducerState.update { currentState ->
            reduce(currentState, action)
        }
    }
    
    private fun reduce(state: State, action: Action): State {
        return when (action) {
            is Action.Load -> state.copy(loading = true)
            is Action.LoadSuccess -> state.copy(
                loading = false,
                data = action.data
            )
            is Action.LoadError -> state.copy(
                loading = false,
                error = action.error
            )
        }
    }
}
```

### 5.3 LiveData 与 StateFlow 对比

| 特性 | LiveData | StateFlow |
|------|----------|-----------|
| 线程安全 | 是 | 是 |
| 生命周期感知 | 是 | 需要配合 collectLatest |
| 初始值 | 可选 | 必需 |
| 空值支持 | 是 | 否 |
| 背压处理 | 自动 | 需要配置 |
| 可测试性 | 中等 | 高 |
| Kotlin 原生 | 否（Java 友好） | 是 |

```kotlin
// LiveData 测试示例
@Test
fun testLiveData() = runTest {
    val viewModel = MyViewModel()
    val observer = Mockito.mock(MutableLiveData.Observer::class.java)
    
    viewModel.data.observeForever(observer)
    viewModel.loadData()
    
    Mockito.verify(observer).onChanged(any())
}

// StateFlow 测试示例
@Test
fun testStateFlow() = runTest {
    val viewModel = MyViewModel()
    
    viewModel.loadData()
    
    val state = viewModel.uiState.first()
    assertTrue(state is UiState.Success)
}
```

---

## 6. SavedStateHandle 使用

### 6.1 SavedStateHandle 基础用法

```kotlin
class UserViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    
    // 1. 从 SavedStateHandle 获取参数
    val userId: String = savedState["userId"] ?: ""
    
    // 2. 获取带默认值的参数
    val userName: String = savedState["userName"] ?: "未知用户"
    
    // 3. 获取可空参数
    val optionalAge: Int? = savedState["age"]
    
    // 4. 设置参数
    fun setUserName(name: String) {
        savedState["userName"] = name
    }
    
    // 5. 设置可空参数
    fun setOptionalData(data: String?) {
        savedState["optionalData"] = data
    }
    
    // 6. 获取参数列表
    val tags: List<String> = savedState["tags"] ?: emptyList()
    
    // 7. 获取复杂对象（需要注册 Serializer）
    val preferences: UserPreferences = savedState.get(
        "preferences",
        UserPreferences::class.java
    ) ?: UserPreferences()
}
```

### 6.2 与 Navigation 集成

```kotlin
// Fragment 定义
@JvmInline
value class UserId(val value: String)

class UserDetailFragment : Fragment() {
    
    private val viewModel: UserDetailViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // SavedStateHandle 会自动从 Navigation 的 args 中获取参数
        // 如果通过 navGraph 定义了参数，这里会自动填充
    }
}

// Navigation 配置
// navigation_graph.xml
<action
    android:id="@+id/action_to_user_detail"
    android:destination="@id/user_detail_fragment"
    app:arguments="@+id/argument_user_id" />

<argument
    android:name="userId"
    app:argType="string"
    android:defaultValue="\"\""/>
```

### 6.3 SavedStateHandle 与 ViewModel 生命周期

```kotlin
class SavedStateDemoViewModel(
    savedState: SavedStateHandle
) : ViewModel(savedState) {
    
    init {
        // SavedStateHandle 在 ViewModel 创建时就可用
        // 即使在配置变化后，SavedStateHandle 中的数据也会保留
        
        val savedData = savedState["data"]
        println("Saved data: $savedData")
    }
    
    fun saveData(data: String) {
        savedState["data"] = data
        // 数据会自动保存到 Bundle
        // 在配置变化时自动恢复
    }
    
    override fun onCleared() {
        super.onCleared()
        // SavedStateHandle 在 ViewModel 销毁时不会调用 onCleared
        // 但如果 ViewModelStore 被清理，SavedStateHandle 的数据也会丢失
    }
}
```

### 6.4 使用泛型类型

```kotlin
class GenericViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    
    // 1. 使用 Kotlin 原生序列化
    data class User(
        val id: String,
        val name: String
    )
    
    // 注册 Serializer
    private val userSerializer = KotlinSerializer(User::class.java)
    
    val user: User? = savedState.get("user", userSerializer)
    
    fun saveUser(user: User) {
        savedState["user"] = user
    }
    
    // 2. 使用默认 Serializer（支持基本类型）
    val stringList: List<String> = savedState["stringList"] ?: emptyList()
    val intMap: Map<String, Int> = savedState["intMap"] ?: emptyMap()
    
    // 3. 自定义对象序列化
    class CustomObjectSerializer(
        private val clazz: KClass<out Any>
    ) : Serializer<Any> {
        
        override fun serialize(input: Any): ByteArray {
            // 序列化逻辑
            return KSerializer.serialize(input)
        }
        
        override fun deserialize(bytes: ByteArray): Any {
            // 反序列化逻辑
            return KSerializer.deserialize(bytes)
        }
    }
}
```

### 6.5 最佳实践

```kotlin
class BestPracticeViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    
    // ✅ 使用默认值处理 null
    val userName: String = savedState["userName"] ?: "默认用户"
    
    // ✅ 使用可选参数
    val optionalId: Int? = savedState["id"]
    
    // ✅ 使用数据类存储复杂状态
    data class ViewState(
        val isLoading: Boolean = false,
        val error: String? = null,
        val data: List<Item>? = null
    )
    
    private val _viewState = savedState.getStateFlow<ViewState>(
        key = "viewState",
        initialValue = ViewState()
    )
    val viewState: StateFlow<ViewState> = _viewState
    
    // ✅ 使用状态管理而不是直接修改
    fun updateState(update: ViewState.() -> ViewState) {
        _viewState.value = _viewState.value.update()
    }
    
    // ✅ 使用事件处理导航
    sealed class Event {
        data class NavigateToDetail(val itemId: String) : Event()
        data class ShowError(val message: String) : Event()
    }
    
    private val _event = MutableSharedFlow<Event>()
    val event: SharedFlow<Event> = _event.asSharedFlow()
    
    fun triggerNavigation(itemId: String) {
        viewModelScope.launch {
            _event.emit(Event.NavigateToDetail(itemId))
        }
    }
}
```

---

## 7. ViewModel 最佳实践

### 7.1 单一职责原则

```kotlin
// ❌ 坏示例：ViewModel 职责过多
class BadViewModel : ViewModel() {
    // 处理数据
    private val _data = MutableLiveData<List<Item>>()
    val data: LiveData<List<Item>> = _data
    
    // 处理 UI 逻辑
    fun updateUI() {
        // 不应该直接操作 UI
    }
    
    // 处理业务逻辑
    fun complexBusinessLogic() {
        // 太复杂的业务逻辑应该交给 UseCase
    }
    
    // 处理网络请求
    suspend fun fetchFromNetwork() {
        // 网络请求应该交给 Repository
    }
}

// ✅ 好示例：职责清晰
class GoodViewModel(
    private val loadItemsUseCase: LoadItemsUseCase
) : ViewModel() {
    // 只负责协调 UI 和数据
    
    private val _uiState = MutableStateFlow<UiState<List<Item>>>(UiState.Idle)
    val uiState: StateFlow<UiState<List<Item>>> = _uiState
    
    fun loadItems() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val items = loadItemsUseCase.execute()
                _uiState.value = UiState.Success(items)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Error")
            }
        }
    }
}

class LoadItemsUseCase(
    private val repository: ItemRepository
) {
    suspend operator fun invoke(): List<Item> {
        return repository.getItems()
    }
}
```

### 7.2 使用 sealed class 管理状态

```kotlin
// 定义 UI 状态
sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<out T>(val data: T) : UiState<T>()
    data class Error(val message: String, val throwable: Throwable? = null) : UiState<Nothing>()
    object Empty : UiState<Nothing>()
}

class StatefulViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState<List<Item>>>(UiState.Idle)
    val uiState: StateFlow<UiState<List<Item>>> = _uiState.asStateFlow()
    
    fun loadItems() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            try {
                val items = repository.getItems()
                _uiState.value = if (items.isEmpty()) {
                    UiState.Empty
                } else {
                    UiState.Success(items)
                }
            } catch (e: Exception) {
                _uiState.value = UiState.Error("加载失败", e)
            }
        }
    }
}

// UI 层处理状态
class ItemFragment : Fragment() {
    private val viewModel: StatefulViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is UiState.Loading -> showLoading()
                    is UiState.Success -> showItems(state.data)
                    is UiState.Error -> showError(state.message)
                    is UiState.Empty -> showEmpty()
                    else -> {}
                }
            }
        }
    }
}
```

### 7.3 使用 UseCase 模式

```kotlin
// UseCase 接口
interface UseCase<Params, Output> {
    suspend operator fun invoke(params: Params): Output
}

// 无参数的 UseCase
class LoadUsersUseCase(
    private val userRepository: UserRepository
) : UseCase<Unit, Result<List<User>>> {
    suspend operator fun invoke(params: Unit): Result<List<User>> {
        return try {
            Result.success(userRepository.getAllUsers())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// 有参数的 UseCase
data class GetUserParams(val userId: String)

class GetUserUseCase(
    private val userRepository: UserRepository
) : UseCase<GetUserParams, Result<User>> {
    suspend operator fun invoke(params: GetUserParams): Result<User> {
        return try {
            Result.success(userRepository.getUser(params.userId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// ViewModel 使用 UseCase
class UserViewModel(
    private val loadUsersUseCase: LoadUsersUseCase,
    private val getUserUseCase: GetUserUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UiState<List<User>>>(UiState.Idle)
    val uiState: StateFlow<UiState<List<User>>> = _uiState.asStateFlow()
    
    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            when (val result = loadUsersUseCase(Unit)) {
                is Result.Success -> {
                    _uiState.value = UiState.Success(result.data)
                }
                is Result.Failure -> {
                    _uiState.value = UiState.Error(result.exception.message ?: "Error")
                }
            }
        }
    }
    
    fun loadUser(userId: String) {
        viewModelScope.launch {
            when (val result = getUserUseCase(GetUserParams(userId))) {
                is Result.Success -> {
                    // 处理成功
                }
                is Result.Failure -> {
                    // 处理错误
                }
            }
        }
    }
}
```

### 7.4 处理事件和导航

```kotlin
class EventViewModel : ViewModel() {
    
    // 事件 sealed class
    sealed class Event {
        data class NavigateToDetail(val itemId: String) : Event()
        data class ShowToast(val message: String) : Event()
        data class ShowError(val error: String) : Event()
        object RefreshComplete : Event()
    }
    
    // 使用 SharedFlow 分发事件
    private val _event = MutableSharedFlow<Event>(
        extraBufferCapacity = 1,  // 允许一个事件缓冲
        onBufferOverflow = SharedFlow.BufferOverflowEnum.DROP_OLDEST
    )
    val event: SharedFlow<Event> = _event.asSharedFlow()
    
    fun navigateToItem(item: Item) {
        viewModelScope.launch {
            _event.emit(Event.NavigateToDetail(item.id))
        }
    }
    
    fun showToast(message: String) {
        viewModelScope.launch {
            _event.emit(Event.ShowToast(message))
        }
    }
}

// UI 层处理事件
class EventFragment : Fragment() {
    private val viewModel: EventViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 使用 lifecycleScope 确保在 Fragment 销毁时取消收集
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.event.collect { event ->
                    when (event) {
                        is EventViewModel.Event.NavigateToDetail -> {
                            navigateToDetail(event.itemId)
                        }
                        is EventViewModel.Event.ShowToast -> {
                            Toast.makeText(context, event.message, Toast.LENGTH_SHORT).show()
                        }
                        is EventViewModel.Event.ShowError -> {
                            showErrorDialog(event.error)
                        }
                        is EventViewModel.Event.RefreshComplete -> {
                            stopRefreshing()
                        }
                    }
                }
            }
        }
    }
}
```

### 7.5 依赖注入与 ViewModel

```kotlin
// 使用 Hilt 注入 ViewModel
@HiltViewModel
class MyViewModel @Inject constructor(
    private val repository: UserRepository,
    private val apiService: ApiService,
    private val prefs: AppPreferences
) : ViewModel() {
    
    // 依赖通过构造函数注入
    // Hilt 负责创建 ViewModel 实例
    
    fun loadData() {
        viewModelScope.launch {
            val users = repository.getUsers()
            // 处理数据
        }
    }
}

// 使用 Koin 注入 ViewModel
class MyViewModel @Injectable constructor(
    private val repository: UserRepository
) : ViewModel() {
    // Koin 负责创建 ViewModel 实例
}

// ViewModel 模块定义
class ViewModelModule : Module {
    factory { 
        MyViewModel(get()) 
    }
}
```

---

## 8. 常见错误和坑

### 错误 1：在 ViewModel 中持有 View 引用

```kotlin
// ❌ 错误：ViewModel 持有 View 引用，导致内存泄漏
class BadViewModel : ViewModel() {
    private var progressBar: ProgressBar? = null
    private var textView: TextView? = null
    
    fun showLoading(view: View) {
        progressBar = view.findViewById(R.id.progressBar)
        progressBar?.visibility = View.VISIBLE
    }
}

// ✅ 正确：通过 LiveData/Flow 暴露状态
class GoodViewModel : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun showLoading() {
        _isLoading.value = true
    }
    
    fun hideLoading() {
        _isLoading.value = false
    }
}

// UI 层处理 View
class MyFragment : Fragment() {
    private val viewModel: GoodViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val progressBar = view.findViewById<ProgressBar>(R.id.progressBar)
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.isLoading.collect { loading ->
                progressBar.visibility = if (loading) View.VISIBLE else View.GONE
            }
        }
    }
}
```

### 错误 2：ViewModel 中直接使用 GlobalScope

```kotlin
// ❌ 错误：使用 GlobalScope，协程不会随着 ViewModel 销毁而取消
class BadViewModel : ViewModel() {
    fun loadData() {
        GlobalScope.launch {
            val data = repository.fetchData()
            // ViewModel 销毁后，这个协程仍在执行
            // 可能导致内存泄漏和空指针异常
        }
    }
}

// ✅ 正确：使用 viewModelScope
class GoodViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data = repository.fetchData()
            // ViewModel 销毁时，这个协程会自动取消
        }
    }
}
```

### 错误 3：在 ViewModel 中直接操作 UI

```kotlin
// ❌ 错误：ViewModel 直接操作 UI
class BadViewModel : ViewModel() {
    fun showDialog(activity: Activity, message: String) {
        AlertDialog.Builder(activity)
            .setMessage(message)
            .show()
    }
}

// ✅ 正确：通过事件或状态暴露
class GoodViewModel : ViewModel() {
    private val _event = MutableSharedFlow<Event>()
    val event: SharedFlow<Event> = _event.asSharedFlow()
    
    sealed class Event {
        data class ShowDialog(val message: String) : Event()
    }
    
    fun triggerDialog(message: String) {
        viewModelScope.launch {
            _event.emit(Event.ShowDialog(message))
        }
    }
}
```

### 错误 4：ViewModel 中不使用 sealed class 管理状态

```kotlin
// ❌ 错误：使用多个独立的 LiveData
class BadViewModel : ViewModel() {
    private val _data = MutableLiveData<List<Item>>()
    val data: LiveData<List<Item>> = _data
    
    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error
    
    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    // 问题：UI 需要同时监听三个 LiveData，容易状态不一致
}

// ✅ 正确：使用 sealed class 统一状态
class GoodViewModel : ViewModel() {
    sealed class UiState {
        object Loading : UiState()
        data class Success(val data: List<Item>) : UiState()
        data class Error(val message: String) : UiState()
    }
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
}
```

### 错误 5：ViewModel 中忽略错误处理

```kotlin
// ❌ 错误：不处理异常
class BadViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data = repository.fetchData()  // 可能抛出异常
            _data.value = data
        }
    }
}

// ✅ 正确：完整的错误处理
class GoodViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            try {
                val data = repository.fetchData()
                _uiState.value = UiState.Success(data)
            } catch (e: NetworkException) {
                _uiState.value = UiState.NetworkError
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

### 错误 6：ViewModel 中重复创建实例

```kotlin
// ❌ 错误：多次创建 ViewModel
class BadActivity : AppCompatActivity() {
    private val viewModel1: MyViewModel by viewModels()
    private val viewModel2: MyViewModel by viewModels()  // 这是不同的实例！
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val viewModel3: MyViewModel by viewModels()  // 又是不同的实例！
    }
}

// ✅ 正确：复用同一个 ViewModel
class GoodActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 复用 viewModel
    }
}
```

### 错误 7：SavedStateHandle 使用不当

```kotlin
// ❌ 错误：未处理 null 值
class BadViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    val userId: String = savedState["userId"]!!  // 可能抛出 NullPointerException
}

// ✅ 正确：使用默认值
class GoodViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    val userId: String = savedState["userId"] ?: "default"
    val optionalId: String? = savedState["userId"]
}
```

---

## 9. 面试考点

### 基础考点

#### 1. ViewModel 的作用是什么？

```
答案要点：
1. 存储和管理 UI 相关的数据
2. 在配置变化（如设备旋转）时保留数据
3. 作为 UI 和 Repository 之间的桥梁
4. 实现关注点分离，UI 只负责展示，ViewModel 负责数据逻辑
```

#### 2. ViewModel 的生命周期是怎样的？

```
答案要点：
1. ViewModel 在第一次通过 ViewModelProvider 获取时创建
2. 配置变化时不会销毁（Activity/Fragment 重建但 ViewModel 保留）
3. ViewModelStore 被 clear 时调用 onCleared()
4. 应用进程被杀死时 ViewModel 也会丢失
```

#### 3. ViewModel 与 LiveData 如何配合使用？

```kotlin
示例代码：
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun updateData() {
        _data.value = "New Data"
    }
}

class MyActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.data.observe(this) { data ->
            // 更新 UI
        }
    }
}
```

#### 4. 为什么要使用 MutableLiveData？

```
答案要点：
1. MutableLiveData 可以在 ViewModel 内部修改值
2. LiveData 是只读的，外部无法修改
3. 遵循开闭原则，防止外部直接修改数据
4. 保证数据流的可控性
```

### 进阶考点

#### 5. ViewModel 是如何在配置变化时保留数据的？

```
答案要点：
1. ViewModel 存储在 ViewModelStore 中
2. ViewModelStore 存储在 ViewModelStoreOwner 中
3. Activity/Fragment 重建时会复用同一个 ViewModelStore
4. ViewModelProvider 从 ViewModelStore 中获取已存在的 ViewModel
5. 源码：Activity.onRetainNonConfigurationInstance() -> ViewModelStore
```

#### 6. ViewModel 与 ViewModelProvider 的关系？

```kotlin
示例代码：
// ViewModelProvider 是 ViewModel 的工厂和提供者
class ViewModelProvider(
    owner: ViewModelStoreOwner,
    factory: Factory
) {
    operator fun <T : ViewModel> get(modelClass: Class<T>): T {
        return viewModelStore.get(key, modelClass) ?: createNew()
    }
}

// 使用委托属性简化创建
val viewModel: MyViewModel by viewModels()
// 等同于
val viewModel: MyViewModel = ViewModelProvider(this)[MyViewModel::class.java]
```

#### 7. SavedStateHandle 是什么？如何使用？

```kotlin
示例代码：
class MyViewModel(savedState: SavedStateHandle) : ViewModel(savedState) {
    val userId: String = savedState["userId"] ?: ""
    
    fun setUserName(name: String) {
        savedState["userName"] = name
    }
}

// 数据会在 ViewModel 重建时自动恢复
// 与 Android 的 onSaveInstanceState 类似，但更安全
```

#### 8. 如何处理 ViewModel 中的异步操作？

```kotlin
示例代码：
class MyViewModel : ViewModel() {
    // 使用 viewModelScope 执行协程
    fun loadData() {
        viewModelScope.launch {
            try {
                val data = repository.fetchData()
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
    
    // ViewModel 销毁时，协程会自动取消
}
```

### 高级考点

#### 9. ViewModel 与 MVI 架构的关系？

```
答案要点：
1. MVI (Model-View-Intent) 架构中，ViewModel 作为 Model 层
2. ViewModel 暴露 StateFlow 作为单一数据源（Single Source of Truth）
3. Intent 通过函数调用触发
4. View 通过 collect StateFlow 更新 UI
5. 使用 sealed class 管理状态，保证状态转换的可控性
```

#### 10. ViewModel 中如何管理多个 Fragment 共享的状态？

```kotlin
示例代码：
// 使用 activityViewModels() 共享 ViewModel
class FirstFragment : Fragment() {
    private val sharedViewModel: SharedViewModel by activityViewModels()
}

class SecondFragment : Fragment() {
    private val sharedViewModel: SharedViewModel by activityViewModels()
    // 与 FirstFragment 共享同一个 ViewModel 实例
}

// 使用 MediatorLiveData 组合多个数据源
class SharedViewModel : ViewModel() {
    val mediatorData = MediatorLiveData<String>()
    
    init {
        mediatorData.addSource(viewModel1.data) { /* 处理 */ }
        mediatorData.addSource(viewModel2.data) { /* 处理 */ }
    }
}
```

#### 11. ViewModel 内存泄漏的常见原因和解决方案？

```
答案要点：
常见原因：
1. ViewModel 中持有 View 引用
2. 使用 GlobalScope 而不是 viewModelScope
3. LiveData 未正确解绑（使用 viewLifecycleOwner 可避免）
4. 在 ViewModel 中注册未取消的监听器

解决方案：
1. 不持有 View 引用，通过 LiveData/Flow 暴露状态
2. 使用 viewModelScope 执行协程
3. 使用 viewLifecycleOwner 观察 LiveData
4. 在 onCleared() 中清理资源
```

#### 12. 如何在 ViewModel 中实现单例模式？

```
答案要点：
1. ViewModel 本身就是单例（在同一个 ViewModelStore 中）
2. 通过 ViewModelProvider 获取 ViewModel，保证同一 key 返回同一实例
3. 使用 viewModels() 委托属性自动管理生命周期

代码示例：
class MyViewModel : ViewModel() {
    // 同一个 Activity/Fragment 中，多次获取返回同一实例
}

class MyActivity : AppCompatActivity() {
    private val viewModel1: MyViewModel by viewModels()
    private val viewModel2: MyViewModel by viewModels()
    // viewModel1 === viewModel2
}
```

#### 13. ViewModel 与 Compose 的集成？

```kotlin
示例代码：
@Composable
fun MyScreen() {
    val viewModel: MyViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    when (val state = uiState) {
        is UiState.Loading -> CircularProgressIndicator()
        is UiState.Success -> ShowItems(state.data)
        is UiState.Error -> ErrorView(state.message)
    }
}

// ViewModel 与 Compose 的配合
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
}
```

#### 14. ViewModel 在后台执行任务的最佳实践？

```kotlin
示例代码：
class BackgroundViewModel : ViewModel() {
    // 使用 viewModelScope 确保任务在 ViewModel 销毁时取消
    fun startLongTask() {
        viewModelScope.launch {
            // 长时间运行的任务
            withContext(Dispatchers.IO) {
                // IO 密集型操作
            }
        }
    }
    
    // 使用 SupervisorJob 确保子任务独立取消
    private val supervisorJob = SupervisorJob()
    private val backgroundScope = CoroutineScope(supervisorJob + Dispatchers.Default)
    
    override fun onCleared() {
        super.onCleared()
        backgroundScope.cancel()
    }
}
```

---

## 10. 参考资料

### 官方文档

- [ViewModel 官方文档](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [Lifecycle 官方文档](https://developer.android.com/topic/libraries/architecture/lifecycle)
- [LiveData 官方文档](https://developer.android.com/topic/libraries/architecture/livedata)
- [SavedStateHandle 官方文档](https://developer.android.com/reference/androidx/lifecycle/SavedStateHandle)

### 推荐资源

- [Android Developers Guide - ViewModel](https://developer.android.com/codelabs/androidx-room-with-riptide)
- [Architecture Blueprints](https://github.com/googlesamples/android-architecture)
- [Now in Android](https://github.com/android/nowinandroid) - 官方示例项目

### 书籍

- 《Android The Big Nerd Ranch》
- 《First Android》
- 《Kotlin for Android Developers》

---

*本文完，感谢阅读！*
