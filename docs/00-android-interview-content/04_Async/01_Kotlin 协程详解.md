# Kotlin 协程详解 ⚡

> Android 异步编程核心，面试必考知识点

---

## 一、协程基础概念

### 1.1 什么是协程？

```
协程 = 轻量级线程

传统线程模型：
  Thread 1: [Task A] ──────●─────────
  Thread 2: [Task B] ──────────●───
  Thread 3: [Task C] ──────────────●───
  
协程模型：
  Thread 1: [Coroutine A] → [Coroutine B] → [Coroutine C]
  
  ● = 线程切换（开销大）
  → = 协程切换（开销小）
```

### 1.2 协程优势

| 特性 | 传统线程 | 协程 |
|------|---------|------|
| **创建成本** | 高（1MB 栈空间） | 低（几 KB） |
| **切换开销** | 高（内核态切换） | 低（用户态切换） |
| **数量限制** | 约 1000 个 | 数万个 |
| **代码可读性** | 回调地狱 | 同步风格 |

---

## 二、协程核心 API

### 2.1 启动协程

```kotlin
// 1. launch - 不返回值
val job = lifecycleScope.launch {
    // 协程代码
    val data = fetchData()
    updateUI(data)
}

// 2. async - 返回值
val deferred = lifecycleScope.async {
    // 返回值
    fetchData()
}

// 获取结果
val result = deferred.await()

// 3. GlobalScope - 全局作用域（不推荐）
GlobalScope.launch {
    // 应用生命周期，容易泄漏
}
```

### 2.2 作用域（CoroutineScope）

```kotlin
// Android 常用作用域

// 1. lifecycleScope - 与生命周期绑定
lifecycleScope.launch {
    // Activity/Fragment 销毁时自动取消
}

// 2. viewModelScope - 与 ViewModel 绑定
class MyViewModel : ViewModel() {
    init {
        viewModelScope.launch {
            // ViewModel clear 时自动取消
        }
    }
}

// 3. 自定义作用域
class Repository {
    private val scope = CoroutineScope(
        Dispatchers.IO + SupervisorJob()
    )
    
    fun loadData() {
        scope.launch {
            // 需要手动取消
        }
    }
    
    fun clear() {
        scope.cancel()
    }
}

// 4. runBlocking - 阻塞当前线程（测试用）
fun main() = runBlocking {
    launch {
        delay(1000)
        println("World")
    }
    println("Hello")
}
// 输出：Hello → World
```

### 2.3 调度器（Dispatchers）

```kotlin
// 1. Dispatchers.Main - 主线程（UI 线程）
withContext(Dispatchers.Main) {
    // 更新 UI
    textView.text = "Hello"
}

// 2. Dispatchers.IO - IO 密集型
withContext(Dispatchers.IO) {
    // 文件读写、数据库、网络
    val data = readFile()
}

// 3. Dispatchers.Default - CPU 密集型
withContext(Dispatchers.Default) {
    // 复杂计算、JSON 解析
    val result = complexCalculation()
}

// 4. Dispatchers.Unconfined - 不受限制（不推荐）
withContext(Dispatchers.Unconfined) {
    // 只在特定场景使用
}
```

---

## 三、协程进阶

### 3.1 协程取消

```kotlin
// 1. 主动取消
val job = lifecycleScope.launch {
    while (isActive) {
        // 可取消的工作
        doWork()
        delay(1000)
    }
}

// 取消协程
job.cancel()

// 2. 取消并等待完成
job.cancelAndJoin()

// 3. 超时取消
withTimeout(5000) {
    // 5 秒后自动取消
    fetchData()
}

// 4. 超时返回 null
val result = withTimeoutOrNull(5000) {
    fetchData()
} ?: run {
    // 超时处理
    showTimeoutError()
}

// 5. 检查取消状态
suspend fun doWork() {
    // 主动检查
    if (isActive) {
        // 继续工作
    }
    
    // 或抛出取消异常
    ensureActive()
}
```

### 3.2 异常处理

```kotlin
// 1. try-catch
lifecycleScope.launch {
    try {
        val data = withContext(Dispatchers.IO) {
            repository.getData()
        }
        updateUI(data)
    } catch (e: Exception) {
        showError(e.message)
    }
}

// 2. CoroutineExceptionHandler
val handler = CoroutineExceptionHandler { _, exception ->
    println("Caught $exception")
}

val scope = CoroutineScope(Dispatchers.Main + handler)
scope.launch {
    throw RuntimeException("Error")
}

// 3. SupervisorJob（子协程独立）
val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

scope.launch {
    val job1 = launch {
        // 失败不影响其他
        throw Exception("Error 1")
    }
    
    val job2 = launch {
        // 继续执行
        doSomething()
    }
}

// 4. 重试机制
suspend fun loadDataWithRetry(
    maxRetries: Int = 3,
    delayMs: Long = 1000
): Data {
    var lastException: Exception? = null
    
    repeat(maxRetries) { attempt ->
        try {
            return repository.getData()
        } catch (e: Exception) {
            lastException = e
            if (attempt < maxRetries - 1) {
                delay(delayMs)
            }
        }
    }
    
    throw lastException ?: Exception("Unknown error")
}
```

### 3.3 协程组合

```kotlin
// 1. 顺序执行
suspend fun loadSequential() {
    val user = userRepository.getUser()      // 先执行
    val posts = postRepository.getPosts()    // 后执行
    updateUI(user, posts)
}

// 2. 并行执行
suspend fun loadParallel() {
    val userDeferred = async { userRepository.getUser() }
    val postsDeferred = async { postRepository.getPosts() }
    
    // 等待两个都完成
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    
    updateUI(user, posts)
}

// 3. awaitAll
suspend fun loadAll() {
    val deferreds = listOf(
        async { fetchData1() },
        async { fetchData2() },
        async { fetchData3() }
    )
    
    val results = deferreds.awaitAll()
    updateUI(results)
}

// 4. 竞态（取最快结果）
suspend fun race(): Data {
    return withTimeoutOrNull(5000) {
        fetchDataFromSlowSource()
    } ?: fetchDataFromFastSource()
}
```

---

## 四、Flow 数据流

### 4.1 Flow 基础

```kotlin
// 创建 Flow
fun numberFlow(): Flow<Int> = flow {
    for (i in 1..5) {
        emit(i)
        delay(100)
    }
}

// 收集 Flow
lifecycleScope.launch {
    numberFlow().collect { value ->
        println(value)
    }
}

// 操作符
numberFlow()
    .map { it * 2 }           // 转换
    .filter { it > 4 }        // 过滤
    .onEach { println(it) }   // 副作用
    .collect { println(it) }
```

### 4.2 StateFlow vs SharedFlow

```kotlin
// StateFlow - 状态流
class ViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    init {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            _uiState.value = UiState.Success(data)
        }
    }
}

// SharedFlow - 事件流
class EventBus {
    private val _events = MutableSharedFlow<Event>(
        replay = 0,              // 不重放
        extraBufferCapacity = 10 // 缓冲
    )
    val events: SharedFlow<Event> = _events.asSharedFlow()
    
    suspend fun postEvent(event: Event) {
        _events.emit(event)
    }
}

// 对比
// StateFlow: 有初始值、总是有最新值、适合 UI 状态
// SharedFlow: 无初始值、可配置重放、适合事件通知
```

### 4.3 Flow 操作符

```kotlin
// 1. 转换操作符
flow.map { it * 2 }
flow.mapNotNull { it?.toString() }
flow.flatMapConcat { flowFrom(it) }
flow.flatMapMerge { flowFrom(it) }
flow.flatMapLatest { flowFrom(it) }  // 只取最新

// 2. 过滤操作符
flow.filter { it > 0 }
flow.filterNotNull()
flow.filterIsInstance<String>()
flow.distinctUntilChanged()  // 去重

// 3. 聚合操作符
flow.reduce { acc, value -> acc + value }
flow.fold(0) { acc, value -> acc + value }

// 4. 异常处理
flow.catch { e ->
    emit(defaultValue)
}
flow.retry(3) { e ->
    e is NetworkException
}
flow.onCompletion { cause ->
    if (cause != null) {
        println("Completed with error: $cause")
    }
}

// 5. 背压处理
flow.buffer()              // 缓冲
flow.bufferOnOverflow()    // 溢出策略
flow.collectLatest { value ->
    // 只处理最新值
}
```

### 4.4 Flow 实战示例

```kotlin
// 1. 搜索功能（防抖 + 取消旧请求）
fun searchQuery(queryFlow: Flow<String>): Flow<List<Result>> {
    return queryFlow
        .debounce(300)              // 防抖 300ms
        .distinctUntilChanged()     // 去重
        .flatMapLatest { query ->   // 取消旧请求
            repository.searchFlow(query)
        }
        .catch { e ->
            emit(emptyList())
        }
}

// 2. 下拉刷新 + 分页
fun loadPagedData(): Flow<List<Item>> = flow {
    var page = 1
    while (true) {
        val items = repository.getPages(page++)
        emit(items)
        if (items.isEmpty()) break
    }
}
    .flowOn(Dispatchers.IO)
    .retry(3)

// 3. 组合多个 Flow
fun combineData(): Flow<Pair<User, Posts>> = combine(
    userFlow,
    postsFlow
) { user, posts ->
    user to posts
}

// 4. 状态管理
sealed class UiState {
    object Loading : UiState()
    data class Success(val data: List<Item>) : UiState()
    data class Error(val message: String) : UiState()
}

fun loadState(): Flow<UiState> = flow {
    emit(UiState.Loading)
    try {
        val data = repository.getData()
        emit(UiState.Success(data))
    } catch (e: Exception) {
        emit(UiState.Error(e.message ?: "Error"))
    }
}
```

---

## 五、协程与生命周期

### 5.1 LifecycleScope

```kotlin
// Activity/Fragment 中使用
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 自动在 onDestroy 取消
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                // 只在 STARTED 状态收集
                viewModel.uiState.collect { state ->
                    updateUI(state)
                }
            }
        }
    }
}

// repeatOnLifecycle 优势
// 1. 自动开始/停止收集
// 2. 避免后台收集浪费资源
// 3. 防止内存泄漏
```

### 5.2 ViewModelScope

```kotlin
class MyViewModel(
    private val repository: UserRepository
) : ViewModel() {
    
    // StateFlow 状态
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    // 协程自动在 onCleared 取消
    fun loadUser() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            repository.getUserFlow()
                .flowOn(Dispatchers.IO)
                .catch { e ->
                    _uiState.value = UiState.Error(e.message ?: "Error")
                }
                .collect { user ->
                    _uiState.value = UiState.Success(user)
                }
        }
    }
    
    // 并行加载
    fun loadUserData() {
        viewModelScope.launch {
            val userDeferred = async { repository.getUser() }
            val postsDeferred = async { repository.getPosts() }
            
            val user = userDeferred.await()
            val posts = postsDeferred.await()
            
            _uiState.value = UiState.Success(user, posts)
        }
    }
}
```

---

## 六、面试核心考点

### 6.1 基础问题

**Q1: 协程与线程的区别？**

**A:**
- **线程**: 操作系统调度，重量级，1MB 栈空间
- **协程**: 用户态调度，轻量级，几 KB
- **关系**: 协程运行在线程上，多个协程可复用少量线程

**Q2: launch 和 async 的区别？**

**A:**
| 特性 | launch | async |
|------|--------|-------|
| **返回值** | Job | Deferred<T> |
| **异常处理** | 立即抛出 | await 时抛出 |
| **使用场景** | 火任务 | 需要结果 |

```kotlin
// launch
val job = launch {
    repository.saveData()  // 不返回值
}

// async
val deferred = async {
    repository.getData()  // 返回值
}
val result = deferred.await()
```

**Q3: suspend 函数的作用？**

**A:**
- 标记可挂起的函数
- 只能在协程或其他 suspend 函数中调用
- 不阻塞线程，只是暂停协程执行

### 6.2 进阶问题

**Q4: 协程取消的原理？**

**A:**
- 通过 `Job.cancel()` 设置取消标志
- 协程在挂起点检查取消状态
- 主动检查：`isActive`、`ensureActive()`
- 挂起函数自动检查：`delay()`、`withContext()`

**Q5: SupervisorJob 的作用？**

**A:**
- 子协程失败不影响父协程和其他子协程
- 适用于独立任务场景

```kotlin
val scope = CoroutineScope(SupervisorJob())

scope.launch {
    // 失败不影响其他
    throw Exception("Error")
}

scope.launch {
    // 继续执行
    doSomething()
}
```

**Q6: Flow 的冷流与热流？**

**A:**
- **冷流（Flow）**: 按需执行，每次收集都重新执行
- **热流（StateFlow/SharedFlow）**: 持续发射，与收集者无关

### 6.3 实战问题

**Q7: 如何实现协程重试？**

**A:**
```kotlin
suspend fun retry(
    times: Int = 3,
    initialDelay: Long = 100,
    maxDelay: Long = 1000,
    factor: Double = 2.0,
    block: suspend () -> Unit
) {
    var currentDelay = initialDelay
    repeat(times - 1) {
        try {
            block()
            return
        } catch (e: Exception) {
            // 记录错误
        }
        delay(currentDelay)
        currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelay)
    }
    block()  // 最后一次
}
```

**Q8: 如何处理协程异常？**

**A:**
1. **try-catch**: 直接捕获
2. **CoroutineExceptionHandler**: 统一处理
3. **Flow.catch**: Flow 异常处理
4. **SupervisorJob**: 隔离异常

---

## 七、性能优化

### 7.1 避免协程泄漏

```kotlin
// ❌ 错误：GlobalScope 泄漏
class MyViewModel : ViewModel() {
    fun loadData() {
        GlobalScope.launch {  // 不会自动取消
            repository.getData()
        }
    }
}

// ✅ 正确：使用 viewModelScope
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {  // 自动取消
            repository.getData()
        }
    }
}
```

### 7.2 合理使用 Dispatchers

```kotlin
// ❌ 错误：在主线程执行 IO 操作
lifecycleScope.launch {
    val data = repository.getData()  // 阻塞主线程
}

// ✅ 正确：切换到 IO 线程
lifecycleScope.launch {
    val data = withContext(Dispatchers.IO) {
        repository.getData()
    }
    updateUI(data)  // 自动回到主线程
}
```

### 7.3 避免不必要的协程创建

```kotlin
// ❌ 错误：嵌套协程
lifecycleScope.launch {
    launch {  // 不必要的嵌套
        fetchData()
    }
}

// ✅ 正确：直接调用
lifecycleScope.launch {
    fetchData()
}
```

---

## 八、实战代码模板

### 8.1 ViewModel 完整示例

```kotlin
class UserViewModel(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // 状态
    private val _uiState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val uiState: StateFlow<UiState<User>> = _uiState.asStateFlow()
    
    // 事件
    private val _events = MutableSharedFlow<UiEvent>()
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()
    
    // 密封类
    sealed class UiState<out T> {
        object Loading : UiState<Nothing>()
        data class Success<T>(val data: T) : UiState<T>()
        data class Error(val message: String) : UiState<Nothing>()
    }
    
    sealed class UiEvent {
        data class ShowToast(val message: String) : UiEvent()
        object NavigateBack : UiEvent()
    }
    
    // 加载数据
    fun loadUser(userId: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            withContext(Dispatchers.IO) {
                try {
                    val user = userRepository.getUser(userId)
                    _uiState.value = UiState.Success(user)
                } catch (e: Exception) {
                    _uiState.value = UiState.Error(e.message ?: "Error")
                    _events.emit(UiEvent.ShowToast("加载失败"))
                }
            }
        }
    }
    
    // 使用 Flow
    fun loadUserFlow(userId: String) {
        viewModelScope.launch {
            userRepository.getUserFlow(userId)
                .flowOn(Dispatchers.IO)
                .catch { e ->
                    _uiState.value = UiState.Error(e.message ?: "Error")
                    _events.emit(UiEvent.ShowToast("加载失败"))
                }
                .collect { user ->
                    _uiState.value = UiState.Success(user)
                }
        }
    }
    
    // 并行加载
    fun loadUserData(userId: String) {
        viewModelScope.launch {
            val userDeferred = async { userRepository.getUser(userId) }
            val postsDeferred = async { userRepository.getPosts(userId) }
            
            try {
                val user = userDeferred.await()
                val posts = postsDeferred.await()
                _uiState.value = UiState.Success(user, posts)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Error")
            }
        }
    }
}
```

---

## 九、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| 协程 vs 线程 | ⭐⭐ | 轻量级、用户态调度 |
| launch vs async | ⭐⭐ | 返回值、异常处理 |
| suspend 作用 | ⭐⭐ | 挂起、不阻塞 |
| 协程取消 | ⭐⭐⭐ | Job、isActive、ensureActive |
| SupervisorJob | ⭐⭐⭐ | 子协程独立 |
| Dispatchers | ⭐⭐ | Main/IO/Default |
| Flow 操作符 | ⭐⭐⭐ | map/filter/catch/retry |
| StateFlow vs SharedFlow | ⭐⭐⭐ | 状态 vs 事件 |
| 协程泄漏 | ⭐⭐⭐⭐ | 作用域选择 |
| 异常处理 | ⭐⭐⭐ | try-catch/CoroutineExceptionHandler |

---

**📚 参考资料**
- [Kotlin Coroutines Guide](https://kotlinlang.org/docs/coroutines-guide.html)
- [Kotlin Flow 官方文档](https://kotlinlang.org/docs/flow.html)
- [Android 协程最佳实践](https://developer.android.com/kotlin/coroutines)

