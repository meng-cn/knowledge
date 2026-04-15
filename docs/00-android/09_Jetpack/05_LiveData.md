# 05_LiveData.md - LiveData 数据观察

## 目录
1. [LiveData 概述](#livedata-概述)
2. [LiveData 基础使用](#livedata-基础使用)
3. [MutableLiveData](#mutablelivedata)
4. [Transformations（map/switchMap）](#transformationsmapswitchmap)
5. [MediatorLiveData](#mediatorlivedata)
6. [LiveData vs StateFlow](#livedata-vs-stateflow)
7. [LiveData 粘性事件](#livedata-粘性事件)
8. [面试考点](#面试考点)
9. [最佳实践与常见错误](#最佳实践与常见错误)
10. [参考资料](#参考资料)

---

## LiveData 概述

### 什么是 LiveData？

LiveData 是 Android Jetpack 架构组件之一，是一个可观察的数据持有类。与普通的观察者模式不同，LiveData 具有生命周期感知能力，只在组件处于活跃状态（Started 或 Resumed）时才更新 UI。

**核心特点：**
- **生命周期感知**：自动管理观察者，防止内存泄漏
- **数据一致性**：确保 UI 始终显示最新数据
- **自动清理**：观察者销毁时自动移除
- **配置变化处理**：屏幕旋转后自动恢复最新数据
- **线程安全**：可以在任何线程设置值

### LiveData 的优势

```
┌─────────────────────────────────────────────────────────────┐
│                    LiveData 核心优势                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 生命周期感知                                              │
│     └─ 只在活跃状态更新 UI，避免崩溃                          │
│                                                             │
│  2. 自动内存管理                                              │
│     └─ 观察者销毁时自动清理，防止内存泄漏                      │
│                                                             │
│  3. 数据一致性                                                │
│     └─ 观察者重新激活时自动接收最新数据                        │
│                                                             │
│  4. 配置变化处理                                              │
│     └─ 屏幕旋转后自动恢复，无需手动保存状态                    │
│                                                             │
│  5. 线程安全                                                  │
│     └─ 可以在后台线程更新，自动切换到主线程                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 添加依赖

```gradle
// app/build.gradle
dependencies {
    // LiveData（通常包含在 lifecycle-livedata-ktx 中）
    implementation "androidx.lifecycle:lifecycle-livedata-ktx:2.7.0"
    
    // ViewModel（通常与 LiveData 一起使用）
    implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0"
}
```

---

## LiveData 基础使用

### 创建 LiveData

```kotlin
// 1. 直接创建不可变 LiveData
val liveData: LiveData<String> = LiveData<String>().apply {
    value = "Initial value"
}

// 2. 使用 MutableLiveData（可变）
val mutableLiveData = MutableLiveData<String>()
mutableLiveData.value = "Initial value"

// 3. 从 ViewModel 中创建
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data // 暴露不可变引用
    
    fun updateData(newValue: String) {
        _data.value = newValue
    }
}

// 4. 使用 liveData 构建器（Kotlin）
val data: LiveData<String> = liveData {
    emit("Initial value")
    
    // 可以执行协程操作
    val result = withContext(Dispatchers.IO) {
        fetchData()
    }
    emit(result)
}

// 5. 从 Flow 转换
val flowData: Flow<String> = flow { emit("data") }
val liveData: LiveData<String> = flowData.asLiveData()
```

### 观察 LiveData

```kotlin
class MyFragment : Fragment() {
    
    private val viewModel: MyViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 基本观察
        viewModel.data.observe(viewLifecycleOwner) { data ->
            textView.text = data
        }
        
        // 带条件观察
        viewModel.data.observe(viewLifecycleOwner) { data ->
            if (data.isNotEmpty()) {
                textView.text = data
                errorView.visibility = View.GONE
            } else {
                errorView.visibility = View.VISIBLE
            }
        }
        
        // 多次观察同一个 LiveData
        viewModel.data.observe(viewLifecycleOwner) { data ->
            textView.text = data
        }
        
        viewModel.data.observe(viewLifecycleOwner) { data ->
            logData(data)
        }
    }
}
```

### LiveData 生命周期状态

```kotlin
class LifecycleAwareObserver : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val liveData = MutableLiveData<String>()
        
        // 不同生命周期状态下观察
        liveData.observe(this) { data ->
            // this = Fragment，在 Fragment 活跃时更新
            Log.d("LiveData", "数据更新：$data")
        }
        
        liveData.observe(viewLifecycleOwner) { data ->
            // viewLifecycleOwner = Fragment 视图的生命周期
            // 从 onViewCreated 到 onDestroyView
            textView.text = data
        }
        
        liveData.observe(this) { data ->
            // 在 Activity 中观察
            // activity 作为 LifecycleOwner
        }
    }
    
    /*
     生命周期状态说明：
     
     - CREATED: LiveData 不会分发更新
     - STARTED: LiveData 开始分发更新
     - RESUMED: LiveData 持续分发更新
     - PAUSED: LiveData 暂停分发（但保留最新值）
     - STOPPED: LiveData 暂停分发
     - DESTROYED: LiveData 自动移除观察者
     */
}
```

### 设置值的方式

```kotlin
class LiveDataValueDemo : ViewModel() {
    
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun demonstrateSetValue() {
        // 1. value - 在主线程设置
        _data.value = "Main thread value"
        
        // 2. postValue - 在后台线程设置（异步）
        CoroutineScope(Dispatchers.IO).launch {
            val result = fetchData()
            _data.postValue(result) // 切换到主线程更新
        }
        
        // 3. setValue 内部实现
        /*
        @MainThread
        public void setValue(T value) {
            assertMainThread("setValue");
            mData = value;
            dispatchingValue(null);
        }
        
        public void postValue(T value) {
            boolean postTask;
            synchronized (mDataLock) {
                postTask = mPendingData == NOT_SET;
                mPendingData = value;
            }
            if (!postTask) return;
            ArchTaskExecutor.getInstance().postToMainThread(mPostValueRunnable);
        }
        */
    }
    
    private suspend fun fetchData(): String {
        delay(1000)
        return "Fetched data"
    }
}
```

---

## MutableLiveData

### 基本用法

```kotlin
class MyViewModel : ViewModel() {
    
    // 1. 基本类型
    private val _name = MutableLiveData<String>()
    val name: LiveData<String> = _name
    
    // 2. 数字类型
    private val _count = MutableLiveData<Int>()
    val count: LiveData<Int> = _count
    
    // 3. 布尔类型
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // 4. 列表类型
    private val _items = MutableLiveData<List<Item>>()
    val items: LiveData<List<Item>> = _items
    
    // 5. 自定义对象
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user
    
    // 6. 带初始值
    private val _status = MutableLiveData<Status>(Status.IDLE)
    val status: LiveData<Status> = _status
    
    fun updateName(newName: String) {
        _name.value = newName
    }
    
    fun incrementCount() {
        _count.value = (_count.value ?: 0) + 1
    }
    
    fun setLoading(loading: Boolean) {
        _isLoading.value = loading
    }
    
    fun updateItems(newItems: List<Item>) {
        _items.value = newItems
    }
}
```

### 常用操作

```kotlin
class MutableLiveDataOperations : ViewModel() {
    
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun operations() {
        // 1. 设置值
        _data.value = "New value"
        
        // 2. 获取值
        val currentValue = _data.value
        
        // 3. 设置 null
        _data.value = null
        
        // 4. 观察并修改
        _data.observeForever { value ->
            // 修改值（注意避免无限循环）
            if (value == "old") {
                _data.value = "new"
            }
        }
        
        // 5. 添加永久观察者（需要手动移除）
        val observer = Observer<String> { value ->
            Log.d("LiveData", "Value: $value")
        }
        _data.observeForever(observer)
        
        // 6. 移除永久观察者
        _data.removeObserver(observer)
        
        // 7. 移除所有观察者
        _data.removeObservers(this) // LifecycleOwner
    }
}
```

### 封装最佳实践

```kotlin
// ✅ 推荐：暴露不可变 LiveData
class MyViewModel : ViewModel() {
    
    // 私有可变，公有不可变
    private val _userName = MutableLiveData<String>()
    val userName: LiveData<String> = _userName
    
    // 通过方法修改
    fun setUserName(name: String) {
        _userName.value = name
    }
}

// ❌ 不推荐：暴露可变 LiveData
class BadViewModel : ViewModel() {
    // 外部可以直接修改，破坏封装
    val userName: MutableLiveData<String> = MutableLiveData()
}

// 使用场景：
// Fragment 中
class MyFragment : Fragment() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        // 只能观察，不能修改
        viewModel.userName.observe(viewLifecycleOwner) { name ->
            textView.text = name
        }
        
        // 通过方法修改
        button.setOnClickListener {
            viewModel.setUserName("New Name")
        }
    }
}
```

---

## Transformations（map/switchMap）

### map 转换

`map` 用于将一个 LiveData 的值转换为另一个类型。

```kotlin
class MapTransformationDemo : ViewModel() {
    
    private val _userName = MutableLiveData<String>()
    val userName: LiveData<String> = _userName
    
    // 1. 基本 map
    val userNameUpperCase: LiveData<String> = Transformations.map(_userName) { name ->
        name.uppercase()
    }
    
    // 2. 链式 map
    val userNameLength: LiveData<Int> = Transformations.map(userNameUpperCase) { name ->
        name.length
    }
    
    // 3. 复杂转换
    val userDisplayInfo: LiveData<String> = Transformations.map(_userName) { name ->
        when {
            name.isEmpty() -> "请输入用户名"
            name.length < 3 -> "用户名太短"
            else -> "欢迎，$name!"
        }
    }
    
    // 4. 使用扩展函数（KTX）
    val userNameKtx: LiveData<String> = _userName.map { name ->
        "Hello, $name"
    }
    
    fun setUserName(name: String) {
        _userName.value = name
    }
}

// 使用示例
class MyFragment : Fragment() {
    
    private val viewModel: MapTransformationDemo by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        // 观察转换后的数据
        viewModel.userNameUpperCase.observe(viewLifecycleOwner) { upperName ->
            textView.text = upperName
        }
        
        viewModel.userDisplayInfo.observe(viewLifecycleOwner) { info ->
            infoTextView.text = info
        }
        
        // 修改原始数据，所有转换都会自动更新
        viewModel.setUserName("john")
    }
}
```

### switchMap 转换

`switchMap` 用于将一个 LiveData 的值转换为另一个 LiveData，常用于根据参数切换数据源。

```kotlin
class SwitchMapDemo : ViewModel() {
    
    private val _userId = MutableLiveData<String>()
    val userId: LiveData<String> = _userId
    
    // 1. 基本 switchMap
    val userData: LiveData<User> = Transformations.switchMap(_userId) { id ->
        // 返回一个新的 LiveData
        getUserLiveData(id)
    }
    
    // 2. 使用 Repository
    val userDataFromRepo: LiveData<User> = Transformations.switchMap(_userId) { id ->
        userRepository.getUserById(id) // 返回 LiveData<User>
    }
    
    // 3. 处理加载状态
    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    val userDataWithLoading: LiveData<User?> = Transformations.switchMap(_userId) { id ->
        _loading.value = true
        
        // 模拟网络请求
        val userLiveData = MutableLiveData<User>()
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val user = api.getUser(id)
                userLiveData.postValue(user)
            } catch (e: Exception) {
                // 处理错误
            } finally {
                _loading.postValue(false)
            }
        }
        
        userLiveData
    }
    
    // 4. 使用 KTX 扩展
    val userDataKtx: LiveData<User> = _userId.switchMap { id ->
        getUserLiveData(id)
    }
    
    private fun getUserLiveData(id: String): LiveData<User> {
        val liveData = MutableLiveData<User>()
        // 加载数据
        return liveData
    }
    
    fun setUserId(id: String) {
        _userId.value = id
    }
}
```

### map vs switchMap

```kotlin
/*
 map 和 switchMap 的区别：
 
 map:
 - 输入：LiveData<T>
 - 输出：LiveData<R>
 - 转换函数：(T) -> R
 - 场景：简单的值转换
 
 switchMap:
 - 输入：LiveData<T>
 - 输出：LiveData<R>
 - 转换函数：(T) -> LiveData<R>
 - 场景：根据参数切换数据源
 
 示例对比：
 */

class ComparisonDemo : ViewModel() {
    
    private val _userId = MutableLiveData<String>()
    
    // map - 简单转换
    val userIdDisplay: LiveData<String> = Transformations.map(_userId) { id ->
        "用户 ID: $id" // 直接返回转换后的值
    }
    
    // switchMap - 切换数据源
    val userData: LiveData<User> = Transformations.switchMap(_userId) { id ->
        userRepository.getUserById(id) // 返回新的 LiveData
    }
    
    /*
     何时使用 map：
     - 格式化显示文本
     - 计算派生值
     - 简单的类型转换
     
     何时使用 switchMap：
     - 根据 ID 加载数据
     - 切换不同的数据源
     - 需要根据参数发起网络请求
     */
}
```

### 实际应用场景

```kotlin
class RealWorldExample : ViewModel() {
    
    // 场景 1：搜索功能
    private val _searchQuery = MutableLiveData<String>()
    val searchQuery: LiveData<String> = _searchQuery
    
    val searchResults: LiveData<List<Item>> = Transformations.switchMap(_searchQuery) { query ->
        if (query.length < 2) {
            // 查询太短，返回空列表
            MutableLiveData(emptyList())
        } else {
            // 执行搜索
            repository.search(query)
        }
    }
    
    // 场景 2：筛选功能
    private val _filterType = MutableLiveData<FilterType>()
    val filterType: LiveData<FilterType> = _filterType
    
    val filteredItems: LiveData<List<Item>> = Transformations.switchMap(_filterType) { type ->
        repository.getItemsByFilter(type)
    }
    
    // 场景 3：分页加载
    private val _currentPage = MutableLiveData<Int>(1)
    val currentPage: LiveData<Int> = _currentPage
    
    val pagedData: LiveData<List<Item>> = Transformations.switchMap(_currentPage) { page ->
        repository.getItemsByPage(page)
    }
    
    // 场景 4：表单验证
    private val _email = MutableLiveData<String>()
    private val _password = MutableLiveData<String>()
    
    val isFormValid: LiveData<Boolean> = Transformations.map(_email) { email ->
        email.isValidEmail() && (_password.value?.isValidPassword() == true)
    }
    
    val emailError: LiveData<String?> = Transformations.map(_email) { email ->
        when {
            email.isEmpty() -> null
            !email.isValidEmail() -> "无效的邮箱地址"
            else -> null
        }
    }
    
    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }
    
    fun setFilterType(type: FilterType) {
        _filterType.value = type
    }
    
    fun loadNextPage() {
        _currentPage.value = (_currentPage.value ?: 1) + 1
    }
}

// 辅助函数
fun String.isValidEmail(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

fun String.isValidPassword(): Boolean {
    return length >= 8
}
```

---

## MediatorLiveData

### 基本用法

`MediatorLiveData` 可以观察多个 LiveData 源，并将它们合并为一个 LiveData。

```kotlin
class MediatorLiveDataDemo : ViewModel() {
    
    private val _liveData1 = MutableLiveData<String>()
    private val _liveData2 = MutableLiveData<Int>()
    
    // 合并多个 LiveData
    val combinedData = MediatorLiveData<String>()
    
    init {
        // 添加第一个数据源
        combinedData.addSource(_liveData1) { value1 ->
            val value2 = _liveData2.value ?: 0
            combinedData.value = "$value1 - $value2"
        }
        
        // 添加第二个数据源
        combinedData.addSource(_liveData2) { value2 ->
            val value1 = _liveData1.value ?: ""
            combinedData.value = "$value1 - $value2"
        }
    }
    
    fun updateData1(value: String) {
        _liveData1.value = value
    }
    
    fun updateData2(value: Int) {
        _liveData2.value = value
    }
}
```

### 实际应用场景

#### 场景 1：合并用户信息

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {
    
    private val _userId = MutableLiveData<String>()
    
    // 从不同来源获取用户数据
    val userProfile: LiveData<UserProfile> = MediatorLiveData()
    val userSettings: LiveData<UserSettings> = MediatorLiveData()
    
    // 合并后的完整用户数据
    val completeUserData: LiveData<CompleteUserData> = MediatorLiveData()
    
    init {
        // 观察用户资料
        userProfile.addSource(_userId) { id ->
            // 设置数据源
        }
        
        // 观察用户设置
        userSettings.addSource(_userId) { id ->
            // 设置数据源
        }
        
        // 合并数据
        completeUserData.addSource(userProfile) { profile ->
            updateCompleteData(profile, userSettings.value)
        }
        
        completeUserData.addSource(userSettings) { settings ->
            updateCompleteData(userProfile.value, settings)
        }
    }
    
    private fun updateCompleteData(
        profile: UserProfile?,
        settings: UserSettings?
    ) {
        if (profile != null && settings != null) {
            (completeUserData as MediatorLiveData).value = CompleteUserData(profile, settings)
        }
    }
    
    fun setUserId(id: String) {
        _userId.value = id
    }
}
```

#### 场景 2：网络状态 + 数据

```kotlin
class NetworkDataViewModel : ViewModel() {
    
    private val _networkStatus = MutableLiveData<NetworkStatus>()
    private val _data = MutableLiveData<List<Item>>()
    
    // 组合网络状态和数据
    val uiState: LiveData<UiState> = MediatorLiveData()
    
    init {
        uiState.addSource(_networkStatus) { status ->
            updateUiState(status, _data.value)
        }
        
        uiState.addSource(_data) { data ->
            updateUiState(_networkStatus.value, data)
        }
    }
    
    private fun updateUiState(
        networkStatus: NetworkStatus?,
        data: List<Item>?
    ) {
        val state = when (networkStatus) {
            NetworkStatus.LOADING -> UiState.Loading
            NetworkStatus.CONNECTED -> {
                if (data != null) UiState.Success(data) else UiState.Loading
            }
            NetworkStatus.DISCONNECTED -> UiState.Error("无网络连接")
            null -> UiState.Loading
        }
        
        (uiState as MediatorLiveData).value = state
    }
}

sealed class UiState {
    object Loading : UiState()
    data class Success(val data: List<Item>) : UiState()
    data class Error(val message: String) : UiState()
}

enum class NetworkStatus { LOADING, CONNECTED, DISCONNECTED }
```

#### 场景 3：多条件筛选

```kotlin
class FilterViewModel : ViewModel() {
    
    private val _categoryFilter = MutableLiveData<String?>()
    private val _priceFilter = MutableLiveData<PriceRange?>()
    private val _sortFilter = MutableLiveData<SortOption>()
    
    // 所有筛选条件
    val filters: LiveData<FilterConfig> = MediatorLiveData()
    
    // 筛选后的结果
    val filteredResults: LiveData<List<Product>> = MediatorLiveData()
    
    init {
        // 合并筛选条件
        filters.addSource(_categoryFilter) { updateFilters() }
        filters.addSource(_priceFilter) { updateFilters() }
        filters.addSource(_sortFilter) { updateFilters() }
        
        // 根据筛选条件获取结果
        filteredResults.addSource(filters) { config ->
            // 设置新的数据源
            filteredResults.removeSource(filteredResults.value)
            filteredResults.addSource(repository.getFilteredProducts(config)) { products ->
                filteredResults.value = products
            }
        }
    }
    
    private fun updateFilters() {
        (filters as MediatorLiveData).value = FilterConfig(
            category = _categoryFilter.value,
            priceRange = _priceFilter.value,
            sortOption = _sortFilter.value ?: SortOption.DEFAULT
        )
    }
    
    fun setCategory(category: String?) {
        _categoryFilter.value = category
    }
    
    fun setPriceRange(range: PriceRange?) {
        _priceFilter.value = range
    }
    
    fun setSortOption(option: SortOption) {
        _sortFilter.value = option
    }
}
```

### 移除数据源

```kotlin
class MediatorWithRemove : ViewModel() {
    
    private val _source1 = MutableLiveData<String>()
    private val _source2 = MutableLiveData<String>()
    
    val result = MediatorLiveData<String>()
    
    private var isObservingSource2 = true
    
    init {
        result.addSource(_source1) { value ->
            result.value = "Source1: $value"
        }
        
        result.addSource(_source2) { value ->
            if (isObservingSource2) {
                result.value = "Source2: $value"
            }
        }
    }
    
    fun removeSource2() {
        result.removeSource(_source2)
        isObservingSource2 = false
    }
    
    fun reAddSource2() {
        result.addSource(_source2) { value ->
            result.value = "Source2: $value"
        }
        isObservingSource2 = true
    }
}
```

---

## LiveData vs StateFlow

### 对比表格

| 特性 | LiveData | StateFlow |
|------|----------|-----------|
| **所属库** | AndroidX Lifecycle | KotlinX Coroutines |
| **平台依赖** | Android 专用 | 多平台（KMM） |
| **生命周期感知** | 内置 | 需要配合 lifecycleScope |
| **线程安全** | 是 | 是 |
| **粘性事件** | 是 | 是 |
| **背压处理** | 自动丢弃 | 需要配置缓冲区 |
| **操作符** | Transformations | 丰富的 Flow 操作符 |
| **测试** | 需要 Android 环境 | 纯 Kotlin 测试 |

### 代码对比

```kotlin
// LiveData 实现
class LiveDataViewModel : ViewModel() {
    private val _count = MutableLiveData<Int>(0)
    val count: LiveData<Int> = _count
    
    fun increment() {
        _count.value = (_count.value ?: 0) + 1
    }
}

// StateFlow 实现
class StateFlowViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count
    
    fun increment() {
        _count.value++
    }
}

// 观察对比
class MyFragment : Fragment() {
    
    private val liveDataViewModel: LiveDataViewModel by viewModels()
    private val stateFlowViewModel: StateFlowViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // LiveData 观察
        liveDataViewModel.count.observe(viewLifecycleOwner) { count ->
            textView.text = count.toString()
        }
        
        // StateFlow 观察
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                stateFlowViewModel.count.collect { count ->
                    textView.text = count.toString()
                }
            }
        }
    }
}
```

### 选择指南

```
是否需要多平台支持？
├─ 是 → 使用 StateFlow
└─ 否 → 是否需要与现有 LiveData 代码集成？
    ├─ 是 → 使用 LiveData
    └─ 否 → 是否使用协程？
        ├─ 是 → 使用 StateFlow
        └─ 否 → 使用 LiveData
```

### 互操作

```kotlin
// Flow 转 LiveData
val flow: Flow<String> = flowOf("data")
val liveData: LiveData<String> = flow.asLiveData()

// LiveData 转 Flow（需要额外库）
// 使用 androidx.lifecycle:lifecycle-runtime-ktx
val liveData: LiveData<String> = MutableLiveData()
val stateFlow: StateFlow<String> = liveData.toStateFlow()

// 或者使用自定义扩展
fun <T> LiveData<T>.toStateFlow(): StateFlow<T> {
    val liveData = this
    return channelFlow {
        val observer = Observer<T> { value ->
            trySend(value)
        }
        liveData.observeForever(observer)
        awaitClose {
            liveData.removeObserver(observer)
        }
    }.stateIn(CoroutineScope(Dispatchers.Main), SharingStarted.Lazily, null as T)
}
```

### 迁移示例

```kotlin
// 从 LiveData 迁移到 StateFlow
class BeforeMigration : ViewModel() {
    private val _uiState = MutableLiveData<UiState>()
    val uiState: LiveData<UiState> = _uiState
    
    init {
        load()
    }
    
    private fun load() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val data = repository.getData()
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

// 迁移后
class AfterMigration : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState
    
    init {
        load()
    }
    
    private fun load() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val data = repository.getData()
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}
```

---

## LiveData 粘性事件

### 什么是粘性事件？

粘性事件是指当观察者开始观察时，会立即收到最近一次设置的值。这是 LiveData 的核心特性之一。

```kotlin
class StickyEventDemo : ViewModel() {
    
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    init {
        // 设置初始值
        _data.value = "Initial value"
    }
}

class MyFragment : Fragment() {
    
    private val viewModel: StickyEventDemo by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 即使在这里才开始观察，也会立即收到 "Initial value"
        viewModel.data.observe(viewLifecycleOwner) { value ->
            Log.d("Sticky", "收到值：$value")
            // 输出：收到值：Initial value
        }
    }
}
```

### 粘性事件的问题

粘性事件可能导致数据被重复处理：

```kotlin
class ProblemDemo : Fragment() {
    
    private val viewModel: MyViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 问题：每次进入 Fragment 都会收到之前的值
        viewModel.showMessage.observe(viewLifecycleOwner) { message ->
            // 如果是导航后返回，会再次显示消息
            showToast(message) // 可能不需要
        }
    }
}

class MyViewModel : ViewModel() {
    private val _showMessage = MutableLiveData<String>()
    val showMessage: LiveData<String> = _showMessage
    
    fun showMessage(message: String) {
        _showMessage.value = message
    }
}
```

### 解决方案

#### 方案 1：使用 Event 包装类

```kotlin
// Event 包装类
open class Event<out T>(private val content: T) {
    
    @Suppress("MemberVisibilityCanBePrivate")
    var hasBeenHandled = false
        private set
    
    fun getContentIfNotHandled(): T? {
        return if (hasBeenHandled) {
            null
        } else {
            hasBeenHandled = true
            content
        }
    }
    
    fun peekContent(): T = content
}

// 使用 Event
class EventViewModel : ViewModel() {
    private val _message = MutableLiveData<Event<String>>()
    val message: LiveData<Event<String>> = _message
    
    fun showMessage(msg: String) {
        _message.value = Event(msg)
    }
}

// 在 Fragment 中
class MyFragment : Fragment() {
    
    private val viewModel: EventViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel.message.observe(viewLifecycleOwner) { event ->
            event.getContentIfNotHandled()?.let { message ->
                // 只处理一次
                showToast(message)
            }
        }
    }
}
```

#### 方案 2：使用 SingleLiveEvent

```kotlin
// SingleLiveEvent 实现
class SingleLiveEvent<T> : MutableLiveData<T>() {
    
    private val pending = AtomicBoolean(false)
    
    @MainThread
    override fun observe(owner: LifecycleOwner, observer: Observer<in T>) {
        super.observe(owner) { t ->
            if (pending.compareAndSet(true, false)) {
                observer.onChanged(t)
            }
        }
    }
    
    @MainThread
    override fun setValue(t: T?) {
        pending.set(true)
        super.setValue(t)
    }
    
    @MainThread
    fun call() {
        value = null
    }
}

// 使用
class SingleLiveEventViewModel : ViewModel() {
    private val _navigate = SingleLiveEvent<String>()
    val navigate: LiveData<String> = _navigate
    
    fun navigateTo(screen: String) {
        _navigate.value = screen
    }
}

// 在 Fragment 中
class MyFragment : Fragment() {
    
    private val viewModel: SingleLiveEventViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel.navigate.observe(viewLifecycleOwner) { screen ->
            // 只触发一次
            navigateToScreen(screen)
        }
    }
}
```

#### 方案 3：使用 Flow 的 SharedFlow

```kotlin
// 使用 SharedFlow 替代 SingleLiveEvent
class FlowViewModel : ViewModel() {
    private val _message = MutableSharedFlow<String>()
    val message: SharedFlow<String> = _message
    
    fun showMessage(msg: String) {
        viewModelScope.launch {
            _message.emit(msg)
        }
    }
}

// 在 Fragment 中
class MyFragment : Fragment() {
    
    private val viewModel: FlowViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.message.collect { message ->
                    // 只处理一次，没有粘性
                    showToast(message)
                }
            }
        }
    }
}
```

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| Event 包装类 | 简单、兼容 LiveData | 需要手动处理 | ⭐⭐⭐⭐ |
| SingleLiveEvent | 专为一次性事件设计 | 自定义实现 | ⭐⭐⭐⭐ |
| SharedFlow | 官方推荐、无粘性 | 需要协程 | ⭐⭐⭐⭐⭐ |

---

## 面试考点

### 基础问题

#### Q1: LiveData 的核心特点是什么？

**参考答案：**

LiveData 的核心特点包括：

1. **生命周期感知**：只在组件活跃（Started/Resumed）时更新 UI
2. **自动内存管理**：观察者销毁时自动移除，防止内存泄漏
3. **数据一致性**：配置变化后自动恢复最新数据
4. **线程安全**：可以在任何线程设置值，自动切换到主线程
5. **粘性事件**：观察者开始观察时立即收到最新值

#### Q2: MutableLiveData 和 LiveData 的区别？

**参考答案：**

- **LiveData**：不可变，只能观察，不能修改值
- **MutableLiveData**：可变，既可以观察也可以修改值

```kotlin
// 推荐做法
class MyViewModel : ViewModel() {
    // 内部可变
    private val _data = MutableLiveData<String>()
    // 外部不可变
    val data: LiveData<String> = _data
    
    fun updateData(value: String) {
        _data.value = value // 内部可以修改
    }
}

// Fragment 中
viewModel.data.observe(viewLifecycleOwner) { } // 只能观察
// viewModel.data.value = "" // 编译错误，不能修改
```

#### Q3: value 和 postValue 的区别？

**参考答案：**

| 方法 | 线程 | 执行方式 | 使用场景 |
|------|------|----------|----------|
| `value` | 主线程 | 同步 | 在主线程设置值 |
| `postValue` | 任意线程 | 异步 | 在后台线程设置值 |

```kotlin
// 主线程
liveData.value = "Main thread"

// 后台线程
CoroutineScope(Dispatchers.IO).launch {
    val result = fetchData()
    liveData.postValue(result) // 切换到主线程
}
```

#### Q4: Transformations.map 和 switchMap 的区别？

**参考答案：**

- **map**：将 LiveData<T> 转换为 LiveData<R>，转换函数为 `(T) -> R`
- **switchMap**：将 LiveData<T> 转换为 LiveData<R>，转换函数为 `(T) -> LiveData<R>`

```kotlin
// map - 简单转换
val upperName = Transformations.map(name) { it.uppercase() }

// switchMap - 切换数据源
val userData = Transformations.switchMap(userId) { id ->
    repository.getUser(id) // 返回 LiveData<User>
}
```

### 进阶问题

#### Q5: LiveData 如何避免内存泄漏？

**参考答案：**

LiveData 通过以下机制避免内存泄漏：

1. **WeakReference**：观察者使用弱引用持有 LifecycleOwner
2. **自动清理**：LifecycleOwner 销毁时自动移除观察者
3. **生命周期感知**：只在活跃状态分发更新

```kotlin
// LiveData 内部实现
class Wrapper<T>(
    val observer: Observer<T>,
    val lifecycleOwner: LifecycleOwner
) {
    // 使用 WeakReference 持有 observer
}

// 当 LifecycleOwner 销毁时
lifecycle.addObserver(object : GenericLifecycleObserver {
    override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
        if (event == Lifecycle.Event.ON_DESTROY) {
            removeObserver(observer) // 自动移除
        }
    }
})
```

#### Q6: 如何处理 LiveData 的粘性事件问题？

**参考答案：**

粘性事件可能导致数据被重复处理，解决方案：

**方案 1：Event 包装类**
```kotlin
class Event<out T>(private val content: T) {
    var hasBeenHandled = false
        private set
    
    fun getContentIfNotHandled(): T? {
        return if (hasBeenHandled) null else {
            hasBeenHandled = true
            content
        }
    }
}
```

**方案 2：SingleLiveEvent**
```kotlin
class SingleLiveEvent<T> : MutableLiveData<T>() {
    private val pending = AtomicBoolean(false)
    
    override fun setValue(t: T?) {
        pending.set(true)
        super.setValue(t)
    }
}
```

**方案 3：使用 SharedFlow**
```kotlin
private val _message = MutableSharedFlow<String>()
val message: SharedFlow<String> = _message
```

#### Q7: LiveData 和 StateFlow 如何选择？

**参考答案：**

**选择 LiveData 的场景：**
- 纯 Android 项目
- 与现有 LiveData 代码集成
- 需要简单的生命周期感知

**选择 StateFlow 的场景：**
- 多平台项目（KMM）
- 使用协程的项目
- 需要丰富的操作符
- 需要纯 Kotlin 测试

```kotlin
// LiveData
val data: LiveData<String> = MutableLiveData()
data.observe(viewLifecycleOwner) { }

// StateFlow
val data: StateFlow<String> = MutableStateFlow("")
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        data.collect { }
    }
}
```

#### Q8: MediatorLiveData 的使用场景？

**参考答案：**

MediatorLiveData 用于合并多个 LiveData 源：

**使用场景：**
1. 合并多个数据源（用户资料 + 用户设置）
2. 组合网络状态和数据
3. 多条件筛选
4. 监听多个输入生成输出

```kotlin
val combined = MediatorLiveData<String>()
combined.addSource(liveData1) { v1 ->
    combined.value = "$v1 - ${liveData2.value}"
}
combined.addSource(liveData2) { v2 ->
    combined.value = "${liveData1.value} - $v2"
}
```

---

## 最佳实践与常见错误

### 最佳实践

#### 1. 暴露不可变 LiveData

```kotlin
// ✅ 推荐
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
}

// ❌ 不推荐
class MyViewModel : ViewModel() {
    val data: MutableLiveData<String> = MutableLiveData()
}
```

#### 2. 使用正确的 LifecycleOwner

```kotlin
// ✅ 推荐：Fragment 中使用 viewLifecycleOwner
viewModel.data.observe(viewLifecycleOwner) { }

// ❌ 不推荐：可能导致空指针
viewModel.data.observe(this) { }
```

#### 3. 使用 Transformations 处理派生数据

```kotlin
// ✅ 推荐
val displayName: LiveData<String> = Transformations.map(userName) { 
    "Hello, $it" 
}

// ❌ 不推荐：在观察者中处理
userName.observe(viewLifecycleOwner) { name ->
    textView.text = "Hello, $name" // 逻辑混在一起
}
```

#### 4. 使用 Event 处理一次性事件

```kotlin
// ✅ 推荐
private val _message = MutableLiveData<Event<String>>()
val message: LiveData<Event<String>> = _message

message.observe(viewLifecycleOwner) { event ->
    event.getContentIfNotHandled()?.let {
        showToast(it)
    }
}
```

### 常见错误

#### 错误 1：在后台线程使用 value

```kotlin
// ❌ 错误
CoroutineScope(Dispatchers.IO).launch {
    liveData.value = "Data" // 崩溃！必须在主线程
}

// ✅ 正确
CoroutineScope(Dispatchers.IO).launch {
    liveData.postValue("Data") // 异步切换到主线程
}
```

#### 错误 2：忘记处理 null 值

```kotlin
// ❌ 错误
viewModel.data.observe(viewLifecycleOwner) { data ->
    textView.text = data.toString() // data 可能为 null
}

// ✅ 正确
viewModel.data.observe(viewLifecycleOwner) { data ->
    textView.text = data ?: "Default"
}
```

#### 错误 3：在观察者中修改 LiveData

```kotlin
// ❌ 错误：可能导致无限循环
liveData.observe(viewLifecycleOwner) { value ->
    if (value == "old") {
        liveData.value = "new" // 触发新的观察
    }
}

// ✅ 正确：在 ViewModel 中修改
fun updateIfNeeded() {
    if (_data.value == "old") {
        _data.value = "new"
    }
}
```

#### 错误 4：使用 observeForever 忘记移除

```kotlin
// ❌ 错误
liveData.observeForever { value -> }
// 忘记移除，导致内存泄漏

// ✅ 正确
val observer = Observer<String> { }
liveData.observeForever(observer)

override fun onDestroy() {
    liveData.removeObserver(observer)
}
```

---

## 参考资料

### 官方文档
- [LiveData 官方文档](https://developer.android.com/topic/libraries/architecture/livedata)
- [LiveData 版本说明](https://developer.android.com/jetpack/androidx/releases/lifecycle)
- [架构组件指南](https://developer.android.com/topic/libraries/architecture/guide)

### 源码阅读
- [LiveData 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:lifecycle/lifecycle-livedata-core/src/main/java/androidx/lifecycle/LiveData.java)
- [MediatorLiveData 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:lifecycle/lifecycle-livedata-core/src/main/java/androidx/lifecycle/MediatorLiveData.java)

### 相关文章
- [LiveData vs StateFlow](https://medium.com/androiddevelopers/liveevents-with-kotlin-flow-73b721d87f3e)
- [处理 LiveData 粘性事件](https://medium.com/androiddevelopers/livedata-with-snackbar-navigation-and-other-events-the-singleliveevent-case-ac2622673150)

---

## 总结

LiveData 是 Android Jetpack 中用于构建响应式 UI 的核心组件，它提供了：

1. **生命周期感知**：自动管理观察者，防止内存泄漏
2. **数据一致性**：确保 UI 始终显示最新数据
3. **线程安全**：可以在任何线程更新数据
4. **转换能力**：通过 Transformations 处理派生数据
5. **合并能力**：通过 MediatorLiveData 合并多个数据源

虽然 StateFlow 在多平台项目中更受欢迎，但 LiveData 仍然是 Android 开发中的重要组件。理解 LiveData 的原理和使用场景对于构建高质量的 Android 应用至关重要。
