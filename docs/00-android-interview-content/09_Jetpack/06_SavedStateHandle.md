# SavedStateHandle 详解

> 📚 Android 面试指南 - Jetpack 组件系列
>
> 📝 字数：约 12000 字 | ⏱ 建议阅读时间：45 分钟

---

## 目录

1. [SavedState 基础概念](#1-savedstate-基础概念)
2. [SavedStateHandle 详解](#2-savedstatehandle-详解)
3. [ViewModel 与 SavedStateHandle 集成](#3-viewmodel-与-savedstatehandle-集成)
4. [状态恢复原理](#4-状态恢复原理)
5. [配置变化时的状态保存](#5-配置变化时的状态保存)
6. [与 SharedPreferences 对比](#6-与-sharedpreferences-对比)
7. [最佳实践](#7-最佳实践)
8. [常见问题](#8-常见问题)
9. [面试考点](#9-面试考点)

---

## 1. SavedState 基础概念

### 1.1 什么是 SavedState？

在 Android 开发中，**状态保存与恢复**是一个经典问题。当发生以下场景时，系统会销毁并重建 Activity 或 Fragment：

- **配置变化**（Configuration Change）：屏幕旋转、语言切换、字体大小调整等
- **内存回收**：系统内存不足时杀死后台进程
- **多任务切换**：用户切换到最近任务列表再返回

在传统的开发模式中，我们使用 `onSaveInstanceState()` 和 `onRestoreInstanceState()` 来处理：

```kotlin
class MainActivity : AppCompatActivity() {
    
    private var userInput: String = ""
    private var scrollPosition: Int = 0
    
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString("user_input", userInput)
        outState.putInt("scroll_position", scrollPosition)
    }
    
    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        userInput = savedInstanceState.getString("user_input") ?: ""
        scrollPosition = savedInstanceState.getInt("scroll_position", 0)
    }
}
```

这种方式存在以下**问题**：

1. **样板代码多**：每个需要保存的状态都要手动处理
2. **容易出错**：忘记某个字段、Key 写错、类型不匹配
3. **与 MVVM 架构冲突**：ViewModel 中的数据不会被自动保存
4. **测试困难**：状态恢复逻辑难以单元测试

### 1.2 SavedStateRegistry

AndroidX 引入了 `SavedStateRegistry` 作为状态保存的统一入口：

```kotlin
interface SavedStateRegistry {
    /**
     * Returns the SavedStateProvider registered with the given tag.
     */
    fun <T : SavedStateRegistry.SavedStateProvider> 
        getSavedStateProvider(stateOwner: StateOwner, 
                            key: String): T?
    
    /**
     * Returns the current saved state.
     */
    val currentState: Bundle
}
```

`SavedStateRegistry` 提供了：
- 统一的状态管理接口
- 支持多个组件共享状态
- 生命周期感知
- 与 ViewModel 深度集成

### 1.3 SavedStateHandle 的核心价值

`SavedStateHandle` 是 AndroidX 1.1.0+ 引入的状态管理方案，核心优势：

```kotlin
// 传统方式 vs SavedStateHandle 对比

// ❌ 传统方式
override fun onSaveInstanceState(outState: Bundle) {
    outState.putString("user_name", name)
    outState.putInt("item_count", count)
    // ... 20+ 字段的重复代码
}

// ✅ SavedStateHandle 方式
private val savedStateHandle: SavedStateHandle = ...

// 直接使用，像普通 Map 一样简单
val name: String by savedState.getStateFlow("name", "")
val count: Int by savedState.getStateFlow("count", 0)
```

**核心特性**：

| 特性 | 说明 |
|------|------|
| 类型安全 | 编译时类型检查 |
| 自动序列化 | 支持复杂对象序列化 |
| 生命周期感知 | 自动在配置变化时保存 |
| ViewModel 集成 | 直接在构造函数注入 |
| 状态流支持 | 结合 StateFlow 使用 |

---

## 2. SavedStateHandle 详解

### 2.1 基本语法与 API

#### 2.1.1 创建与获取

```kotlin
// 在 ViewModel 中获取
class MyViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 方式 1：直接访问
    private val count: Int?
        get() = savedStateHandle["count"]
    
    // 方式 2：使用泛型获取（类型安全）
    private val name: String?
        get() = savedStateHandle.get<String>("name")
    
    // 方式 3：带默认值
    private val items: List<String>
        get() = savedStateHandle.get<List<String>>("items") ?: emptyList()
}

// 在 Fragment 中获取
class MyFragment : Fragment() {
    private val savedStateHandle: SavedStateHandle by lazy {
        requireArguments() // 如果使用了 setArguments
    }
}
```

#### 2.1.2 核心 API

```kotlin
class SavedStateHandle internal constructor() {
    
    // === 读取 API ===
    
    /**
     * 获取状态值（可能为 null）
     */
    operator fun <T> get(key: String): T?
    
    /**
     * 获取状态值，带默认值
     */
    @JvmOverloads
    fun <T> get(key: String, defaultValue: T): T
    
    /**
     * 判断是否包含某个 key
     */
    fun contains(key: String): Boolean
    
    /**
     * 获取所有 key
     */
    val keys: Set<String>
    
    // === 写入 API ===
    
    /**
     * 设置状态值
     */
    operator fun <T> set(key: String, value: T)
    
    /**
     * 删除状态值
     */
    fun remove(key: String)
    
    // === 高级 API ===
    
    /**
     * 注册状态变更监听器
     */
    fun observe(
        key: String,
        observer: (T) -> Unit
    )
    
    /**
     * 创建 StateFlow（推荐方式）
     */
    fun <T> getStateFlow(
        key: String,
        defaultValue: T
    ): StateFlow<T>
}
```

### 2.2 数据读写操作

#### 2.2.1 基本类型读写

```kotlin
class BasicViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // === 写入操作 ===
    
    fun writeBasicTypes() {
        // 字符串
        savedStateHandle["name"] = "张三"
        
        // 数字类型
        savedStateHandle["age"] = 25
        savedStateHandle["score"] = 95.5f
        savedStateHandle["balance"] = 1000.0
        
        // 布尔值
        savedStateHandle["isActive"] = true
        savedStateHandle["isCompleted"] = false
        
        // 字符
        savedStateHandle["grade"] = 'A'
        
        // 字节
        savedStateHandle["data"] = byteArrayOf(1, 2, 3)
    }
    
    // === 读取操作 ===
    
    fun readBasicTypes() {
        // 直接读取（可能为 null）
        val name: String? = savedStateHandle["name"]
        val age: Int? = savedStateHandle["age"]
        
        // 带默认值读取
        val score: Float = savedStateHandle.get("score", 0f)
        val isActive: Boolean = savedStateHandle.get("isActive", false)
        
        // 类型安全的泛型读取
        val balance: Double? = savedStateHandle.get<Double>("balance")
    }
    
    // === 检查与删除 ===
    
    fun checkAndRemove() {
        // 检查是否存在
        if (savedStateHandle.contains("tempData")) {
            val tempData = savedStateHandle.get<String>("tempData")
            // 使用后立即删除
            savedStateHandle.remove("tempData")
        }
        
        // 获取所有已保存的 key
        val allKeys = savedStateHandle.keys
        allKeys.forEach { key ->
            println("Key: $key, Value: ${savedStateHandle[key]}")
        }
    }
}
```

#### 2.2.2 集合类型读写

```kotlin
class CollectionViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    fun handleCollections() {
        // === List ===
        val stringList = listOf("Apple", "Banana", "Orange")
        savedStateHandle["fruits"] = stringList
        
        val retrievedList: List<String>? = savedStateHandle.get("fruits")
        
        // === Set ===
        val uniqueItems = setOf("A", "B", "C")
        savedStateHandle["uniqueItems"] = uniqueItems
        
        // === Map ===
        val userMap = mapOf(
            "name" to "张三",
            "age" to 25,
            "city" to "北京"
        )
        savedStateHandle["userInfo"] = userMap
        
        // === Array ===
        val numbers = intArrayOf(1, 2, 3, 4, 5)
        savedStateHandle["numbers"] = numbers
        
        // === ArrayList ===
        val mutableList = mutableListOf<String>()
        mutableList.add("Item1")
        mutableList.add("Item2")
        savedStateHandle["mutableList"] = mutableList
    }
    
    // 读取集合时注意类型
    fun readCollections() {
        // List 可能返回 ArrayList
        val fruits: List<String>? = savedStateHandle.get("fruits")
        
        // Map 可能返回 HashMap
        val userInfo: Map<String, Any>? = savedStateHandle.get("userInfo")
        
        // 如果原始类型需要精确匹配，可能需要转换
        val stringSet: Set<String>? = savedStateHandle.get("uniqueItems")?.toSet()
    }
}
```

#### 2.2.3 自定义对象序列化

```kotlin
// === 1. 使用 Parcelable（推荐）===

@Parcelize
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val tags: List<String>
) : Parcelable

class UserViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    fun handleParcelable() {
        // 保存
        val user = User(1, "张三", "zhangsan@example.com", listOf("vip", "active"))
        savedStateHandle["currentUser"] = user
        
        // 读取
        val retrievedUser: User? = savedStateHandle.get("currentUser")
        
        // 带默认值
        val currentUser: User = savedStateHandle.get("currentUser", User(0, "", "", emptyList()))
    }
}

// === 2. 使用 Serializable（不推荐但兼容）===

data class Product(
    val sku: String,
    val price: Double,
    val inventory: Int
) : Serializable

class ProductViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    fun handleSerializable() {
        val product = Product("SKU001", 99.99, 100)
        savedStateHandle["product"] = product
        
        val retrieved: Product? = savedStateHandle.get("product")
    }
}

// === 3. 使用 SavedStateRegistry.Saver（自定义序列化）===

class ComplexViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    data class ComplexData(
        val id: String,
        val timestamp: Long,
        val metadata: Map<String, Any>
    )
    
    // 创建自定义 Saver
    private val complexDataSaver = object : SavedStateRegistry.Saver<ComplexData, Any> {
        override fun createInitialState(): ComplexData {
            return ComplexData("", 0L, emptyMap())
        }
        
        override fun save(state: ComplexData): Any {
            return mapOf(
                "id" to state.id,
                "timestamp" to state.timestamp,
                "metadata" to state.metadata
            )
        }
        
        override fun restore(state: Any?): ComplexData {
            return when (state) {
                is Map<*, *> -> {
                    ComplexData(
                        id = state["id"] as? String ?: "",
                        timestamp = state["timestamp"] as? Long ?: 0L,
                        metadata = state["metadata"] as? Map<String, Any> ?: emptyMap()
                    )
                }
                else -> createInitialState()
            }
        }
    }
    
    fun handleComplexData() {
        val data = ComplexData(
            id = "DATA_001",
            timestamp = System.currentTimeMillis(),
            metadata = mapOf("version" to 1, "source" to "api")
        )
        
        // 使用 Saver 保存
        savedStateHandle["complexData"] = data
        
        // 读取
        val restored: ComplexData? = savedStateHandle.get("complexData")
    }
}
```

### 2.3 StateFlow 集成

```kotlin
class StateFlowViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // === 1. 创建 StateFlow ===
    
    /**
     * getStateFlow 是最佳实践
     * 优点：
     * - 自动处理状态保存
     * - 支持配置变化恢复
     * - 响应式更新
     * - 线程安全
     */
    private val counter: StateFlow<Int> = savedStateHandle.getStateFlow(
        key = "counter",
        defaultValue = 0
    )
    
    private val username: StateFlow<String> = savedStateHandle.getStateFlow(
        key = "username",
        defaultValue = ""
    )
    
    private val isLoggedIn: StateFlow<Boolean> = savedStateHandle.getStateFlow(
        key = "isLoggedIn",
        defaultValue = false
    )
    
    // === 2. 更新 StateFlow 的值 ===
    
    fun incrementCounter() {
        // 直接修改底层状态，StateFlow 会自动通知观察者
        savedStateHandle["counter"] = savedStateHandle.get("counter", 0) + 1
    }
    
    fun setUserName(name: String) {
        savedStateHandle["username"] = name
    }
    
    fun toggleLogin() {
        val current = savedStateHandle.get("isLoggedIn", false)
        savedStateHandle["isLoggedIn"] = !current
    }
    
    // === 3. 在 UI 层使用 ===
    
    // ViewModel 暴露 StateFlow
    val counterState: StateFlow<Int> = counter
    val usernameState: StateFlow<String> = username
    val loginState: StateFlow<Boolean> = isLoggedIn
}

// Activity/Fragment 中的使用
class MyActivity : AppCompatActivity() {
    
    private val viewModel: StateFlowViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 使用 collectAsState 观察变化
        lifecycleScope.launch {
            viewModel.counterState.collect { count ->
                textView.text = "Counter: $count"
            }
        }
        
        lifecycleScope.launch {
            viewModel.usernameState.collect { name ->
                usernameTextView.text = name
            }
        }
        
        // 或者在 Compose 中使用
        // val count by viewModel.counterState.collectAsState()
    }
    
    // 配置变化时，StateFlow 会自动恢复到之前的值
}
```

### 2.4 多 ViewModel 状态共享

```kotlin
// SavedStateHandle 支持在不同 ViewModel 之间共享状态

// 父 Fragment 的 ViewModel
class ParentViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    init {
        savedStateHandle["sharedData"] = "From Parent"
    }
}

// 子 Fragment 的 ViewModel
class ChildViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 如果 SavedStateHandle 的 key 正确配置，可以访问共享状态
    val sharedData: String?
        get() = savedStateHandle.get("sharedData")
}

// 使用 setViewModelStoreKey 实现共享
class ParentFragment : Fragment() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 设置相同的 viewModelStoreKey 共享 SavedStateHandle
        childFragment.viewModelStoreKey = "shared_key"
        viewModelStoreKey = "shared_key"
    }
}
```

---

## 3. ViewModel 与 SavedStateHandle 集成

### 3.1 构造函数注入

```kotlin
// === 1. 基本注入方式 ===

class MyViewModel(
    // SavedStateHandle 通过 ViewModelProvider 自动注入
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 直接使用
    init {
        // 初始化状态
        val count = savedStateHandle.get("count") ?: 0
        savedStateHandle["count"] = count
    }
}

// === 2. 带依赖的 ViewModel ===

class UserViewModel(
    savedStateHandle: SavedStateHandle,
    private val userRepository: UserRepository,
    private val authManager: AuthManager
) : ViewModel() {
    
    // 从 SavedStateHandle 获取用户 ID
    private val userId: Long
        get() = savedStateHandle.get("userId") ?: 0L
    
    // 从 SavedStateHandle 获取筛选条件
    private val filter: UserFilter?
        get() = savedStateHandle.get("filter")
    
    // 获取用户数据
    fun getUser() {
        if (userId > 0) {
            viewModelScope.launch {
                val user = userRepository.findById(userId)
                savedStateHandle["currentUser"] = user
            }
        }
    }
}

// === 3. 带导航参数的 ViewModel ===

class DetailViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 从 SafeArgs 获取的参数会自动存入 SavedStateHandle
    val itemId: Long
        get() = savedStateHandle.args?.itemId ?: 0L
    
    val isSelected: Boolean
        get() = savedStateHandle.args?.isSelected ?: false
    
    // 初始化时加载数据
    init {
        if (itemId > 0) {
            loadData(itemId)
        }
    }
    
    private fun loadData(id: Long) {
        // 加载逻辑
    }
}
```

### 3.2 ViewModel 作用域与 SavedState

```kotlin
class ScopedViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // === 1. 与 ViewModelScope 配合 ===
    
    fun updateWithLifecycle() {
        // 这个协程会在 ViewModel 销毁时自动取消
        viewModelScope.launch {
            val result = repository.fetchData()
            
            // 保存结果到 SavedStateHandle
            savedStateHandle["data"] = result
            
            // 配置变化时，数据会被保留
        }
    }
    
    // === 2. 状态与业务逻辑分离 ===
    
    data class AppState(
        val isLoading: Boolean = false,
        val data: Data? = null,
        val error: String? = null
    )
    
    private val _appState = MutableStateFlow(AppState())
    val appState: StateFlow<AppState> = _appState.asStateFlow()
    
    // 持久化关键状态
    private val persistedState: StateFlow<String> = 
        savedStateHandle.getStateFlow("persistedState", "")
    
    fun loadData() {
        viewModelScope.launch {
            _appState.update { it.copy(isLoading = true) }
            
            try {
                val data = repository.fetchData()
                savedStateHandle["lastFetchedData"] = data  // 持久化
                _appState.update { it.copy(data = data, isLoading = false) }
            } catch (e: Exception) {
                savedStateHandle["lastError"] = e.message  // 持久化错误
                _appState.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }
}
```

### 3.3 与 ViewModelProvider 配合

```kotlin
// === 1. 在 Fragment 中使用 ===

class MyFragment : Fragment() {
    
    // 使用 by viewModels() 委托
    private val viewModel: MyViewModel by viewModels()
    
    // 或者使用 viewModelScope 直接创建
    private val viewModel2: MyViewModel by viewModels {
        ViewModelProvider.AndroidViewModelFactory.getInstance(requireActivity().application)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // SavedStateHandle 自动关联到 ViewModel
        // 不需要手动传递
    }
}

// === 2. 在 Activity 中使用 ===

class MainActivity : AppCompatActivity() {
    
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // SavedStateHandle 从 Activity 的 SavedStateRegistry 获取
    }
}

// === 3. 自定义 ViewModel 作用域 ===

class CustomScopeFragment : Fragment() {
    
    // 使用 SharedViewModel 在多个 Fragment 间共享
    private val sharedViewModel: SharedViewModel by activityViewModels()
    
    // 每个 Fragment 有自己的 SavedStateHandle
    private val localViewModel: LocalViewModel by viewModels()
}
```

---

## 4. 状态恢复原理

### 4.1 内部机制解析

```kotlin
// SavedStateHandle 内部实现简化版

class SavedStateHandle {
    private val registry: SavedStateRegistry
    private val key: String
    private val state: Bundle
    
    init {
        // 1. 获取 SavedStateRegistry
        registry = getSavedStateRegistry()
        
        // 2. 注册 SavedStateProvider
        registry.registerSavedStateProvider(key) { 
            produceState() 
        }
        
        // 3. 从 Bundle 恢复状态
        state = registry.consumeRestoredStateForKey(key) ?: Bundle()
    }
    
    // 产生状态（当需要保存时调用）
    private fun produceState(): Bundle {
        return Bundle().apply {
            // 将当前状态写入 Bundle
            putAll(currentState)
        }
    }
    
    // 保存单个值
    fun <T> set(key: String, value: T) {
        state.put(key, value)
        notifyChange(key, value)
    }
    
    // 获取单个值
    fun <T> get(key: String): T? {
        return state.get(key)
    }
}
```

### 4.2 状态保存流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    配置变化发生                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  Activity/Fragment 销毁前      │
        │  onSaveInstanceState()        │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  SavedStateRegistry 触发      │
        │  所有 SavedStateProvider      │
        │  produceSavedState()          │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  SavedStateHandle 收集        │
        │  所有状态到 Bundle            │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  Bundle 传递到重建的          │
        │  Activity/Fragment            │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  ViewModel 重建              │
        │  SavedStateHandle 恢复        │
        │  consumeRestoredStateForKey() │
        └──────────────────────────────┘
```

### 4.3 代码级追踪

```kotlin
// === 1. 注册阶段 ===

class SavedStateRegistryController {
    
    fun registerViewModel(viewModel: ViewModel, key: String) {
        val provider = ViewModelSavedStateProvider(viewModel)
        registry.registerSavedStateProvider(key, provider)
    }
}

// === 2. 保存阶段 ===

class ViewModelSavedStateProvider(
    private val viewModel: ViewModel
) : SavedStateRegistry.SavedStateProvider {
    
    override fun onSaveInstanceState(): Bundle {
        return Bundle().apply {
            // 获取 ViewModel 的 SavedStateHandle
            val handle = viewModel.getSavedStateHandle()
            // 合并所有状态
            putAll(handle.bundle)
        }
    }
    
    override fun onRestoreInstanceState(state: Bundle?) {
        state?.let {
            // 恢复状态到 SavedStateHandle
            viewModel.getSavedStateHandle().restore(it)
        }
    }
}

// === 3. 生命周期集成 ===

class ViewModelProvider {
    
    fun <T : ViewModel> get(key: String, creator: ViewModelCreator<T>): T {
        // 1. 创建或获取 ViewModel
        val viewModel = createOrGet(key, creator)
        
        // 2. 关联 SavedStateRegistry
        val registry = viewOwner.savedStateRegistry
        
        // 3. 创建 SavedStateHandle
        val handle = SavedStateHandle(registry, viewModelKey)
        
        // 4. 如果 ViewModel 需要，注入 handle
        if (viewModel is HasSavedStateHandle) {
            (viewModel as HasSavedStateHandle).injectHandle(handle)
        }
        
        return viewModel
    }
}
```

### 4.4 时序图分析

```kotlin
// 配置变化时的完整时序

// Actor 定义
Activity --> SavedStateRegistry: 触发保存
SavedStateRegistry --> SavedStateProvider: onSaveInstanceState()
SavedStateProvider --> SavedStateHandle: 收集状态
SavedStateHandle --> Bundle: 序列化所有数据
Bundle --> Activity: 返回保存的 Bundle

// 重建阶段
Activity --> Bundle: onCreate(savedInstanceState)
Bundle --> SavedStateRegistry: 传递 Bundle
SavedStateRegistry --> SavedStateProvider: onRestoreInstanceState()
SavedStateProvider --> SavedStateHandle: 恢复状态
SavedStateHandle --> ViewModel: 注入恢复后的状态
```

---

## 5. 配置变化时的状态保存

### 5.1 屏幕旋转处理

```kotlin
class RotateAwareViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 这些值会在屏幕旋转时自动保存和恢复
    private val scrollPosition: StateFlow<Int> = 
        savedStateHandle.getStateFlow("scrollPosition", 0)
    
    private val searchQuery: StateFlow<String> = 
        savedStateHandle.getStateFlow("searchQuery", "")
    
    private val selectedFilter: StateFlow<Filter> = 
        savedStateHandle.getStateFlow("selectedFilter", Filter.ALL)
    
    // 不会被保存的临时状态
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun updateScrollPosition(position: Int) {
        savedStateHandle["scrollPosition"] = position
    }
    
    fun setSearchQuery(query: String) {
        savedStateHandle["searchQuery"] = query
    }
}

// 在 Fragment 中使用
class SearchFragment : Fragment() {
    
    private val viewModel: RotateAwareViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                // 滚动时更新状态
                val position = recyclerView.getChildAt(0)?.layoutPosition ?: 0
                viewModel.updateScrollPosition(position)
                
                // 屏幕旋转后，位置会自动恢复
            }
        })
    }
}
```

### 5.2 复杂场景处理

```kotlin
class ComplexStateViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // === 1. 列表状态 ===
    
    data class ListState(
        val items: List<Item>,
        val scrollPosition: Int,
        val isExpanded: Map<Int, Boolean>,
        val selection: Set<Int>
    )
    
    private val listState: StateFlow<ListState> = 
        savedStateHandle.getStateFlow(
            "listState",
            ListState(emptyList(), 0, emptyMap(), emptySet())
        )
    
    // === 2. 表单状态 ===
    
    data class FormState(
        val name: String = "",
        val email: String = "",
        val phone: String = "",
        val isValid: Boolean = false
    )
    
    private val formState: StateFlow<FormState> = 
        savedStateHandle.getStateFlow("formState", FormState())
    
    fun updateName(name: String) {
        savedStateHandle["formState"] = formState.value.copy(name = name)
    }
    
    fun updateEmail(email: String) {
        savedStateHandle["formState"] = formState.value.copy(email = email)
    }
    
    // === 3. 多步骤向导状态 ===
    
    sealed class StepState {
        data class Step1(val input1: String) : StepState()
        data class Step2(val input2: Int) : StepState()
        data class Step3(val input3: Boolean) : StepState()
    }
    
    private val wizardState: StateFlow<StepState> = 
        savedStateHandle.getStateFlow("wizardState", Step1(""))
    
    fun advanceToStep2(input1: String) {
        savedStateHandle["wizardState"] = Step2(0)
        // Step1 的数据可以保存到另一个 key
        savedStateHandle["step1Data"] = input1
    }
    
    fun backToStep1() {
        val input1 = savedStateHandle.get<String>("step1Data") ?: ""
        savedStateHandle["wizardState"] = Step1(input1)
    }
}
```

### 5.3 性能优化策略

```kotlin
class OptimizedViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // === 1. 选择性保存 ===
    
    // 只保存必要的状态，避免 Bundle 过大
    private val criticalState: StateFlow<String> = 
        savedStateHandle.getStateFlow("critical", "")
    
    // 临时状态不保存
    private val _tempState = MutableStateFlow("")
    val tempState: StateFlow<String> = _tempState.asStateFlow()
    
    // === 2. 增量更新 ===
    
    data class AppState(
        val version: Int = 0,
        val data: Data? = null
    )
    
    private val appState: StateFlow<AppState> = 
        savedStateHandle.getStateFlow("appState", AppState())
    
    fun updateData(data: Data) {
        // 只更新必要字段，保留其他状态
        val current = appState.value
        savedStateHandle["appState"] = current.copy(data = data, version = current.version + 1)
    }
    
    // === 3. 懒加载恢复 ===
    
    private val _lazyData = MutableStateFlow<Data?>(null)
    val lazyData: StateFlow<Data?> = _lazyData.asStateFlow()
    
    init {
        // 检查是否有保存的数据
        val saved = savedStateHandle.get<String>("savedData")
        if (saved != null) {
            // 异步恢复，不阻塞主线程
            viewModelScope.launch {
                val data = parseData(saved)
                _lazyData.value = data
            }
        }
    }
    
    // === 4. 压缩大数据 ===
    
    private fun compressData(data: String): String {
        return GZIP.compress(data)  // 自定义压缩
    }
    
    private fun decompressData(compressed: String): String {
        return GZIP.decompress(compressed)
    }
    
    fun saveLargeData(data: String) {
        // 压缩后保存
        val compressed = compressData(data)
        savedStateHandle["largeData"] = compressed
    }
    
    fun loadLargeData(): String? {
        val compressed = savedStateHandle.get<String>("largeData")
        return compressed?.let { decompressData(it) }
    }
}
```

---

## 6. 与 SharedPreferences 对比

### 6.1 对比表格

| 特性 | SavedStateHandle | SharedPreferences |
|------|-----------------|------------------|
| **设计目的** | 配置变化状态恢复 | 持久化存储 |
| **存储位置** | Bundle（内存） | XML 文件（磁盘） |
| **性能** | 极快（内存操作） | 较慢（磁盘 I/O） |
| **容量限制** | Bundle 限制 (~1MB) | 较大 (~几 MB） |
| **生命周期** | 进程生命周期 | 应用生命周期 |
| **线程安全** | 是 | 否（需要同步） |
| **异步支持** | 原生支持 | 需要 Editor 异步 |
| **类型安全** | 高 | 低 |
| **使用场景** | UI 状态、临时数据 | 用户设置、配置 |

### 6.2 代码对比

```kotlin
// === SharedPreferences 方式 ===

class OldSchoolViewModel(application: Application) : ViewModel() {
    
    private val prefs = application.getSharedPreferences("my_prefs", Context.MODE_PRIVATE)
    private val editor = prefs.edit()
    
    fun saveUserName(name: String) {
        editor.putString("user_name", name).apply()
    }
    
    fun getUserName(): String? {
        return prefs.getString("user_name", null)
    }
    
    fun saveCounter() {
        val current = prefs.getInt("counter", 0)
        editor.putInt("counter", current + 1).apply()
    }
    
    // 问题：
    // 1. 需要手动管理 Editor
    // 2. 每次修改都涉及磁盘 I/O
    // 3. 线程不安全
    // 4. 配置变化时需要手动恢复
}

// === SavedStateHandle 方式 ===

class ModernViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 使用 StateFlow，自动处理
    private val userName: StateFlow<String> = 
        savedStateHandle.getStateFlow("user_name", "")
    
    private val counter: StateFlow<Int> = 
        savedStateHandle.getStateFlow("counter", 0)
    
    fun setUserName(name: String) {
        savedStateHandle["user_name"] = name
        // 自动保存，配置变化时自动恢复
    }
    
    fun incrementCounter() {
        val current = savedStateHandle.get("counter", 0)
        savedStateHandle["counter"] = current + 1
    }
    
    // 优势：
    // 1. 简洁的 API
    // 2. 内存操作，速度快
    // 3. 线程安全
    // 4. 自动处理配置变化
    // 5. 响应式更新
}
```

### 6.3 使用场景选择

```kotlin
/**
 * 何时使用 SavedStateHandle：
 * 
 * ✅ UI 状态（选中项、展开/收起、滚动位置）
 * ✅ 临时数据（表单输入、搜索查询）
 * ✅ 导航参数（详情页 ID、筛选条件）
 * ✅ 列表状态（分页、排序）
 * 
 * 何时使用 SharedPreferences/DataStore：
 * 
 * ✅ 用户设置（主题、语言、通知开关）
 * ✅ 登录凭证（Token、会话信息）
 * ✅ 持久化配置（API Key、服务器地址）
 * ✅ 统计信息（使用次数、首次使用时间）
 */

class BestPracticeViewModel(
    savedStateHandle: SavedStateHandle,
    private val dataStore: DataStore
) : ViewModel() {
    
    // SavedStateHandle: UI 状态
    private val searchQuery: StateFlow<String> = 
        savedStateHandle.getStateFlow("searchQuery", "")
    
    private val sortBy: StateFlow<SortOrder> = 
        savedStateHandle.getStateFlow("sortBy", SortOrder.DEFAULT)
    
    // DataStore: 持久化设置
    private val theme: Flow<String> = 
        dataStore.data.map { prefs ->
            prefs.getString("theme") ?: "system"
        }
    
    private val language: Flow<String> = 
        dataStore.data.map { prefs ->
            prefs.getString("language") ?: "en"
        }
    
    // 组合使用
    fun updateTheme(theme: String) {
        viewModelScope.launch {
            dataStore.edit { prefs ->
                prefs["theme"] = theme
            }
        }
    }
    
    fun updateSearchQuery(query: String) {
        savedStateHandle["searchQuery"] = query
    }
}
```

---

## 7. 最佳实践

### 7.1 代码组织

```kotlin
// ✅ 推荐：集中管理 StateFlow

class WellStructuredViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 1. 定义数据类
    data class ViewState(
        val items: List<Item> = emptyList(),
        val isLoading: Boolean = false,
        val error: String? = null,
        val scrollPosition: Int = 0
    )
    
    // 2. 创建 StateFlow
    private val _viewState = MutableStateFlow(ViewState())
    val viewState: StateFlow<ViewState> = _viewState.asStateFlow()
    
    // 3. 持久化关键状态
    private val scrollPosition: StateFlow<Int> = 
        savedStateHandle.getStateFlow("scrollPosition", 0)
    
    private val searchQuery: StateFlow<String> = 
        savedStateHandle.getStateFlow("searchQuery", "")
    
    // 4. 统一更新方法
    fun updateItems(items: List<Item>) {
        _viewState.update { 
            it.copy(items = items, isLoading = false, error = null)
        }
    }
    
    fun showLoading() {
        _viewState.update { it.copy(isLoading = true) }
    }
    
    fun showError(message: String) {
        _viewState.update { 
            it.copy(error = message, isLoading = false)
        }
    }
    
    fun updateScrollPosition(position: Int) {
        savedStateHandle["scrollPosition"] = position
    }
}

// ❌ 不推荐：分散的状态管理

class BadPracticeViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 多个独立的 StateFlow，难以维护
    private val _items = MutableStateFlow<List<Item>>(emptyList())
    private val _loading = MutableStateFlow(false)
    private val _error = MutableStateFlow<String?>(null)
    private val _position = MutableStateFlow(0)
    
    // 调用方需要同时观察多个流
    val items: StateFlow<List<Item>> = _items
    val loading: StateFlow<Boolean> = _loading
    val error: StateFlow<String?> = _error
    val position: StateFlow<Int> = _position
}
```

### 7.2 命名规范

```kotlin
class NamingConventionViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // ✅ 清晰的命名
    private val currentUserId: StateFlow<Long> = 
        savedStateHandle.getStateFlow("current_user_id", 0L)
    
    private val isFormValid: StateFlow<Boolean> = 
        savedStateHandle.getStateFlow("is_form_valid", false)
    
    // ✅ 使用下划线分隔（Bundle 的惯例）
    private val selectedItemIds: StateFlow<Set<Long>> = 
        savedStateHandle.getStateFlow("selected_item_ids", emptySet())
    
    // ❌ 避免混淆的命名
    // private val data: StateFlow<Data> = ...  // 太泛
    // private val value: StateFlow<Any> = ...  // 无意义
}
```

### 7.3 测试策略

```kotlin
// SavedStateHandle 的单元测试

class SavedStateHandleViewModelTest {
    
    @Test
    fun `state is restored after configuration change`() = runTest {
        // 1. 创建 SavedStateHandle
        val handle = SavedStateHandle()
        
        // 2. 设置初始状态
        handle["counter"] = 5
        
        // 3. 创建 ViewModel
        val viewModel = CounterViewModel(handle)
        
        // 4. 验证状态已恢复
        assertEquals(5, viewModel.counter.value)
        
        // 5. 更新状态
        viewModel.increment()
        
        // 6. 验证 SavedStateHandle 已更新
        assertEquals(6, handle.get<Int>("counter"))
    }
    
    @Test
    fun `default value is used when no saved state`() = runTest {
        val handle = SavedStateHandle()
        val viewModel = CounterViewModel(handle)
        
        // 默认值应该是 0
        assertEquals(0, viewModel.counter.value)
    }
}

// 集成测试
class SavedStateIntegrationTest {
    
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()
    
    @Test
    fun `state persists across fragment recreation`() {
        // 1. 创建 Fragment
        val fragment = MyFragment()
        val viewModel = fragment.viewModel
        
        // 2. 设置状态
        viewModel.setCounter(10)
        
        // 3. 模拟配置变化
        val savedStateHandle = viewModel.savedStateHandle
        val bundle = Bundle()
        savedStateHandle.save(bundle)
        
        // 4. 重建 Fragment
        val newFragment = MyFragment()
        newFragment.arguments = bundle
        
        // 5. 验证状态恢复
        val newViewModel = newFragment.viewModel
        assertEquals(10, newViewModel.counter.value)
    }
}
```

### 7.4 调试技巧

```kotlin
class DebuggableViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 记录状态变更
    private val counter: StateFlow<Int> = savedStateHandle.getStateFlow("counter", 0)
    
    init {
        if (BuildConfig.DEBUG) {
            savedStateHandle.addObserver(
                object : SavedStateRegistry.SavedStateProvider {
                    override fun onSaveInstanceState(): Bundle {
                        val bundle = onSaveInstanceState()
                        Log.d("SavedState", "Saving state: ${bundle.toMap()}")
                        return bundle
                    }
                }
            )
        }
    }
    
    // 自定义调试方法
    fun dumpState() {
        if (BuildConfig.DEBUG) {
            Log.d("SavedState", "Current state keys: ${savedStateHandle.keys}")
            savedStateHandle.keys.forEach { key ->
                Log.d("SavedState", "$key = ${savedStateHandle[key]}")
            }
        }
    }
}
```

---

## 8. 常见问题

### 8.1  Bundle 大小限制

**问题**：SavedStateHandle 基于 Bundle，有 ~1MB 的大小限制。

```kotlin
// ❌ 错误：保存大量数据

class BadPracticeViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 保存 10000 条记录？这会崩溃！
    fun saveLargeList(items: List<Item>) {
        savedStateHandle["items"] = items  // ❌ 可能超过 Bundle 限制
    }
}

// ✅ 正确：只保存必要的引用或摘要

class GoodPracticeViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 只保存列表 ID 和滚动位置
    private val listId: StateFlow<String> = 
        savedStateHandle.getStateFlow("listId", "")
    
    private val scrollPosition: StateFlow<Int> = 
        savedStateHandle.getStateFlow("scrollPosition", 0)
    
    // 数据从服务器/数据库重新加载
    fun reloadList() {
        val id = listId.value
        viewModelScope.launch {
            val items = repository.getListItem(id)
            // 更新 UI，但不保存到 SavedStateHandle
        }
    }
}
```

### 8.2 循环依赖

**问题**：在 SavedStateHandle 中保存 ViewModel 引用会导致循环依赖。

```kotlin
// ❌ 错误：保存 ViewModel 或 Context

class CircularDependencyViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    init {
        // ViewModel 本身不能被序列化
        savedStateHandle["viewModel"] = this  // ❌ 崩溃！
    }
}

// ✅ 正确：只保存数据

class CorrectViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    data class ViewState(
        val items: List<Item>,
        val isLoading: Boolean
    )
    
    private val viewState: StateFlow<ViewState> = 
        savedStateHandle.getStateFlow("viewState", ViewState(emptyList(), false))
}
```

### 8.3 线程安全

**问题**：SavedStateHandle 是线程安全的，但 StateFlow 的更新需要注意。

```kotlin
class ThreadSafeViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // ✅ 正确：直接更新 SavedStateHandle
    fun updateFromBackground() {
        viewModelScope.launch(Dispatchers.IO) {
            val data = repository.fetchData()
            // SavedStateHandle 会自动处理线程切换
            savedStateHandle["data"] = data
        }
    }
    
    // ✅ 正确：使用协程作用域
    fun updateWithScope() {
        viewModelScope.launch {
            val data = withContext(Dispatchers.IO) {
                repository.fetchData()
            }
            savedStateHandle["data"] = data
        }
    }
}
```

### 8.4 序列化问题

**问题**：某些对象类型无法序列化到 Bundle。

```kotlin
// ❌ 不可序列化的类型

class UnserializableViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    data class BadData(
        val callback: () -> Unit,      // ❌ Lambda 不可序列化
        val stream: InputStream,       // ❌ IO 流不可序列化
        val context: Context           // ❌ Context 不可序列化
    )
    
    fun saveBadData() {
        val data = BadData({ }, FileInputStream("/tmp"), applicationContext)
        savedStateHandle["badData"] = data  // ❌ 崩溃！
    }
}

// ✅ 可序列化的类型

class SerializableViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    data class GoodData(
        val id: String,           // ✅ 基本类型
        val timestamp: Long,      // ✅ 数字类型
        val tags: List<String>,   // ✅ 集合（元素可序列化）
        val config: Map<String, String>  // ✅ Map
    ) : Parcelable
    
    fun saveGoodData() {
        val data = GoodData("123", System.currentTimeMillis(), 
                           listOf("tag1"), mapOf("key" to "value"))
        savedStateHandle["goodData"] = data  // ✅ 成功
    }
}
```

---

## 9. 面试考点

### 9.1 基础考点

#### Q1: 什么是 SavedStateHandle？

**参考答案**：

> SavedStateHandle 是 AndroidX ViewModel 库提供的一个类，用于在配置变化（如屏幕旋转）时保存和恢复 ViewModel 的状态。
>
> 核心特性：
> - 类似 Map 的 API，简单易用
> - 自动处理序列化/反序列化
> - 与 ViewModel 深度集成
> - 支持 StateFlow 响应式更新
>
> ```kotlin
> class MyViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
>     private val count: StateFlow<Int> = 
>         savedStateHandle.getStateFlow("count", 0)
> }
> ```

#### Q2: SavedStateHandle 与传统 onSaveInstanceState 的区别？

**参考答案**：

| 方面 | onSaveInstanceState | SavedStateHandle |
|------|-------------------|-----------------|
| 位置 | Activity/Fragment | ViewModel |
| 类型安全 | 低（字符串 key） | 高（泛型） |
| 代码量 | 多（样板代码） | 少（简洁） |
| 测试 | 困难 | 容易 |
| MVVM 适配 | 需要手动同步 | 原生支持 |

#### Q3: 如何创建 SavedStateHandle？

**参考答案**：

> SavedStateHandle 不能手动创建，必须通过 ViewModel 的构造函数注入：
>
> ```kotlin
> class MyViewModel(
>     savedStateHandle: SavedStateHandle  // 由 ViewModelProvider 自动注入
> ) : ViewModel()
> ```

### 9.2 进阶考点

#### Q4: SavedStateHandle 的状态恢复原理是什么？

**参考答案**：

> SavedStateHandle 基于 `SavedStateRegistry` 实现：
>
> 1. **注册阶段**：ViewModel 创建时，SavedStateHandle 向 SavedStateRegistry 注册一个 SavedStateProvider
> 2. **保存阶段**：配置变化前，Registry 调用所有 Provider 的 `onSaveInstanceState()`，收集 Bundle
> 3. **传递阶段**：Bundle 通过 Activity/Fragment 的重建过程传递
> 4. **恢复阶段**：新的 SavedStateHandle 从 Bundle 中恢复数据
>
> 关键代码：
> ```kotlin
> registry.registerSavedStateProvider(key) { produceState() }
> registry.consumeRestoredStateForKey(key)
> ```

#### Q5: StateFlow 与普通 MutableStateFlow 在 SavedStateHandle 中有什么区别？

**参考答案**：

> ```kotlin
> // getStateFlow 创建的是持久化的 StateFlow
> private val counter: StateFlow<Int> = 
>     savedStateHandle.getStateFlow("counter", 0)
>
> // 这个 counter 会在配置变化时自动恢复值
>
> // 普通 MutableStateFlow 不会持久化
> private val _temp = MutableStateFlow(0)
> val temp: StateFlow<Int> = _temp.asStateFlow()
>
> // 屏幕旋转后，temp 会重置为初始值
> ```
>
> 关键区别：
> - `getStateFlow` 的值保存在 SavedStateHandle 的 Bundle 中
> - 普通 StateFlow 只存在于内存中
> - `getStateFlow` 更新会触发配置变化时的保存

#### Q6: SavedStateHandle 的 Bundle 大小限制是多少？如何处理大数据？

**参考答案**：

> Bundle 的大小限制约为 1MB（实际上可能更小，取决于设备）。
>
> 处理大数据的策略：
>
> 1. **不保存大数据**：只保存引用或 ID，数据从服务器/数据库重新加载
> 2. **增量保存**：只保存状态的变化部分
> 3. **压缩**：对文本数据进行压缩
> 4. **分页**：只保存当前页的状态
>
> ```kotlin
> // ✅ 推荐：只保存列表 ID 和页码
> private val listId: StateFlow<String> = 
>     savedStateHandle.getStateFlow("listId", "")
> private val currentPage: StateFlow<Int> = 
>     savedStateHandle.getStateFlow("currentPage", 0)
>
> // ❌ 不推荐：保存整个列表
> // savedStateHandle["items"] = allItems  // 可能超过限制
> ```

### 9.3 高级考点

#### Q7: 自定义 SavedStateHandle 的序列化机制？

**参考答案**：

> 可以通过实现 `SavedStateRegistry.Saver` 接口来自定义序列化：
>
> ```kotlin
> class CustomSaver : SavedStateRegistry.Saver<ComplexData, Bundle> {
>     override fun createInitialState(): ComplexData {
>         return ComplexData(defaultValue)
>     }
>     
>     override fun save(state: ComplexData): Bundle {
>         return Bundle().apply {
>             putString("data", state.toJson())
>         }
>     }
>     
>     override fun restore(state: Bundle?): ComplexData {
>         return state?.getString("data")?.let { 
>             ComplexData.fromJson(it) 
>         } ?: createInitialState()
>     }
> }
> ```
>
> 也可以实现 `Parcelable` 或 `Serializable` 让 SavedStateHandle 自动处理。

#### Q8: SavedStateHandle 在多个 ViewModel 间共享状态？

**参考答案**：

> SavedStateHandle 默认是每个 ViewModel 独享的，但可以通过以下方式实现共享：
>
> 1. **使用相同的 viewModelStoreKey**：
>    ```kotlin
>    // Fragment A
>    val viewModel: SharedViewModel by viewModels(key = "shared_key")
>    
>    // Fragment B
>    val viewModel: SharedViewModel by viewModels(key = "shared_key")
>    // 两个 Fragment 共享同一个 ViewModel 实例
>    ```
>
> 2. **使用 activityViewModels()**：
>    ```kotlin
>    val viewModel: SharedViewModel by activityViewModels()
>    // 整个 Activity 的所有 Fragment 共享
>    ```
>
> 3. **通过 SavedStateRegistry 直接访问**：
>    ```kotlin
>    val registry = findViewWithLifecycle(requireView())
>        .let { SavedStateRegistry.get(it) }
>    val provider = registry.getSavedStateProvider<SomeProvider>("key")
>    ```

#### Q9: SavedStateHandle 的性能优化？

**参考答案**：

> 1. **减少不必要的保存**：
>    ```kotlin
>    // 只保存关键状态，临时状态使用普通 StateFlow
>    private val criticalState: StateFlow<String> = 
>        savedStateHandle.getStateFlow("critical", "")
>    private val _tempState = MutableStateFlow("")
>    ```
>
> 2. **批量更新**：
>    ```kotlin
>    // 避免多次单独更新
>    data class AppState(val a: String, val b: Int, val c: Boolean)
>    private val appState: StateFlow<AppState> = 
>        savedStateHandle.getStateFlow("appState", AppState("", 0, false))
>    ```
>
> 3. **延迟恢复**：
>    ```kotlin
>    init {
>        viewModelScope.launch {
>            // 异步恢复，不阻塞 UI
>            val data = savedStateHandle.get<String>("largeData")?.let {
>                parseLargeData(it)
>            }
>        }
>    }
>    ```
>
> 4. **使用弱引用**：
>    ```kotlin
>    // 对于可能很大的对象，使用引用或 ID
>    private val dataId: StateFlow<String> = 
>        savedStateHandle.getStateFlow("dataId", "")
>    ```

#### Q10: SavedStateHandle 的测试策略？

**参考答案**：

> SavedStateHandle 可以进行完整的单元测试：
>
> ```kotlin
> @Test
> fun testStateRestoration() = runTest {
>     // 1. 创建 SavedStateHandle
>     val handle = SavedStateHandle()
>     
>     // 2. 设置初始数据
>     handle["counter"] = 5
>     
>     // 3. 创建 ViewModel
>     val viewModel = CounterViewModel(handle)
>     
>     // 4. 验证状态已恢复
>     assertEquals(5, viewModel.counter.value)
>     
>     // 5. 更新状态
>     viewModel.increment()
>     
>     // 6. 验证 SavedStateHandle 已更新
>     assertEquals(6, handle.get<Int>("counter"))
> }
>
> // 集成测试模拟配置变化
> @Test
> fun testConfigurationChange() {
>     val handle = SavedStateHandle()
>     val viewModel = MyViewModel(handle)
>     
>     // 设置状态
>     viewModel.setCounter(10)
>     
>     // 模拟保存
>     val bundle = Bundle()
>     handle.saveTo(bundle)
>     
>     // 模拟恢复
>     val newHandle = SavedStateHandle(bundle)
>     val newViewModel = MyViewModel(newHandle)
>     
>     assertEquals(10, newViewModel.counter.value)
> }
> ```

---

## 附录：完整示例

### 完整示例：带 SavedStateHandle 的搜索列表

```kotlin
// ViewModel
class SearchListViewModel(
    savedStateHandle: SavedStateHandle,
    private val repository: SearchRepository
) : ViewModel() {
    
    // 状态数据类
    data class State(
        val query: String = "",
        val items: List<SearchItem> = emptyList(),
        val isLoading: Boolean = false,
        val error: String? = null,
        val scrollPosition: Int = 0,
        val isFilterExpanded: Boolean = false
    )
    
    // 持久化的关键状态
    private val searchQuery: StateFlow<String> = 
        savedStateHandle.getStateFlow("search_query", "")
    
    private val scrollPosition: StateFlow<Int> = 
        savedStateHandle.getStateFlow("scroll_position", 0)
    
    private val isFilterExpanded: StateFlow<Boolean> = 
        savedStateHandle.getStateFlow("filter_expanded", false)
    
    // 非持久化的临时状态
    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state.asStateFlow()
    
    // 初始化
    init {
        viewModelScope.launch {
            searchQuery.collect { query ->
                performSearch(query)
            }
        }
    }
    
    // 执行搜索
    private fun performSearch(query: String) {
        if (query.isBlank()) {
            _state.update { it.copy(items = emptyList()) }
            return
        }
        
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val items = repository.search(query)
                _state.update { 
                    it.copy(
                        items = items,
                        isLoading = false,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _state.update { 
                    it.copy(
                        error = e.message,
                        isLoading = false
                    )
                }
            }
        }
    }
    
    // 更新搜索查询
    fun onQueryChanged(query: String) {
        savedStateHandle["search_query"] = query
    }
    
    // 更新滚动位置
    fun onScrolled(position: Int) {
        savedStateHandle["scroll_position"] = position
    }
    
    // 切换筛选器展开状态
    fun toggleFilter() {
        val current = savedStateHandle.get<Boolean>("filter_expanded") ?: false
        savedStateHandle["filter_expanded"] = !current
    }
    
    // 获取恢复后的滚动位置
    fun getRestoredScrollPosition(): Int {
        return scrollPosition.value
    }
}

// Fragment
class SearchListFragment : Fragment() {
    
    private val viewModel: SearchListViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 观察状态
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                updateUI(state)
            }
        }
        
        // 恢复滚动位置
        viewLifecycleOwner.lifecycleScope.launch {
            delay(100) // 等待布局完成
            recyclerView.scrollToPosition(viewModel.getRestoredScrollPosition())
        }
        
        // 设置滚动监听
        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                val position = recyclerView.getChildAt(0)?.layoutPosition ?: 0
                viewModel.onScrolled(position)
            }
        })
    }
    
    private fun updateUI(state: SearchListViewModel.State) {
        adapter.submitList(state.items)
        progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE
        errorView.visibility = if (state.error != null) View.VISIBLE else View.GONE
    }
}
```

---

## 总结

SavedStateHandle 是 Android 现代开发中不可或缺的状态管理工具：

1. **简单高效**：类似 Map 的 API，开箱即用
2. **类型安全**：泛型支持，编译时检查
3. **响应式**：与 StateFlow 完美集成
4. **生命周期感知**：自动处理配置变化
5. **测试友好**：支持完整的单元测试

掌握 SavedStateHandle 对于构建健壮的 MVVM 应用至关重要！

---

*📚 参考资料*
- [Android Developers - SavedStateHandle](https://developer.android.com/reference/androidx/lifecycle/SavedStateHandle)
- [ViewModel Documentation](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [StateFlow Guide](https://developer.android.com/kotlin/flow)

> 最后更新：2024 年
> 字数统计：约 12000 字