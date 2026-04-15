# 11. CoroutineScope 深度解析

## 目录

1. [CoroutineScope 接口](#1-coroutinescope-接口)
2. [Job 与 SupervisorJob 对比](#2-job-与-supervisorjob-对比)
3. [作用域传播](#3-作用域传播)
4. [结构化并发原理](#4-结构化并发原理)
5. [lifecycleScope](#5-lifecyclescope)
6. [viewModelScope](#6-viewmodelscope)
7. [自定义 Scope](#7-自定义-scope)
8. [协程泄漏检测](#8-协程泄漏检测)
9. [取消传播](#9-取消传播)
10. [异常隔离](#10-异常隔离)
11. [性能优化](#11-性能优化)
12. [面试考点](#12-面试考点)

---

## 1. CoroutineScope 接口

### 1.1 接口定义

```kotlin
/**
 * CoroutineScope 是协程的作用域容器
 * 它提供了协程生命周期管理的上下文
 */
interface CoroutineScope {
    /**
     * 协程上下文，包含 Job 和 Dispatcher
     */
    val coroutineContext: CoroutineContext
}

// CoroutineScope 的实现
class CoroutineScopeImpl(override val coroutineContext: CoroutineContext) : CoroutineScope
```

### 1.2 创建方式

```kotlin
// 1. 使用 runBlocking
runBlocking {
    // 临时作用域
    launch { /* ... */ }
}

// 2. 使用 coroutineScope
coroutineScope {
    // 结构化作用域
    launch { /* ... */ }
}

// 3. 显式创建
val scope = CoroutineScope(Dispatchers.Default)

// 4. 使用 SupervisorJob
val supervisorScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
```

### 1.3 CoroutineContext

```kotlin
// CoroutineContext 包含多个元素
interface CoroutineContext {
    val Job: Job?
    val CoroutineDispatcher: CoroutineDispatcher?
    val CoroutineExceptionHandler: CoroutineExceptionHandler?
    // ...
}

// 创建上下文
val context = Job() + Dispatchers.Main + CoroutineExceptionHandler { _, exception ->
    println("Error: $exception")
}

val scope = CoroutineScope(context)
```

### 1.4 作用域的生命周期

```kotlin
// 作用域的生命周期管理
class MyScope : CoroutineScope {
    override val coroutineContext: CoroutineContext = 
        SupervisorJob() + Dispatchers.Default
    
    fun start() {
        // 开始执行
    }
    
    fun stop() {
        coroutineContext[Job]?.cancel()
    }
}
```

### 1.5 作用域构建器

```kotlin
// 主要构建器
coroutineScope {
    // 等待所有子协程完成
    launch { /* ... */ }
    launch { /* ... */ }
}  // 等待完成

supervisorScope {
    // 异常隔离
    launch { /* ... */ }
}

withContext(Dispatchers.IO) {
    // 切换上下文
}
```

---

## 2. Job 与 SupervisorJob 对比

### 2.1 Job 基础

```kotlin
// Job 是协程的任务抽象
class Job(
    parent: Job? = null,
    incomplete: Boolean = false
) : CoroutineContext.Element, Completable, Deferred<Unit>

// Job 的状态
enum class JobStatus {
    NEW, CREATED, ACTIVE, COMPLETING, 
    COMPLETED, CANCELLED, CANCELLING, FAILED
}
```

### 2.2 Job 与 SupervisorJob 对比

| 特性 | Job | SupervisorJob |
|------|-----|---------------|
| 异常传播 | 传播到父协程 | 不传播 |
| 取消传播 | 取消所有子协程 | 取消所有子协程 |
| 异常隔离 | ❌ | ✅ |
| 适用场景 | 一般场景 | 需要独立处理的场景 |

### 2.3 Job 示例

```kotlin
// 使用 Job
val job = Job()
val scope = CoroutineScope(job + Dispatchers.Default)

scope.launch {
    // 协程
}

// 取消
job.cancel()
```

### 2.4 SupervisorJob 示例

```kotlin
// 使用 SupervisorJob
val supervisorJob = SupervisorJob()
val scope = CoroutineScope(supervisorJob + Dispatchers.Default)

scope.launch {
    // 异常不会传播到其他协程
    throw Exception("Error 1")
}

scope.launch {
    // 继续执行
    println("Running")
}
```

### 2.5 使用场景对比

```kotlin
// Job 场景：需要错误传播
fun jobExample() = runBlocking {
    val job = Job()
    coroutineScope(job) {
        launch {
            // 错误会传播到父协程
            throw Exception()
        }
    }
}

// SupervisorJob 场景：需要错误隔离
fun supervisorJobExample() = runBlocking {
    val supervisorJob = SupervisorJob()
    coroutineScope(supervisorJob) {
        launch {
            // 错误不会影响其他协程
            throw Exception()
        }
        launch {
            // 继续执行
        }
    }
}
```

### 2.6 异常处理对比

```kotlin
// Job 的异常处理
val job = Job()
coroutineScope(job) {
    launch {
        throw Exception("Error")
    }
}
// 异常会传播到父协程

// SupervisorJob 的异常处理
val supervisorJob = SupervisorJob()
coroutineScope(supervisorJob) {
    launch {
        throw Exception("Error")
    }
    launch {
        // 不受影响
    }
}
// 异常被隔离
```

---

## 3. 作用域传播

### 3.1 上下文传播

```kotlin
// 父作用域的上下文会传播到子协程
coroutineScope {
    println("Parent context: $coroutineContext")
    
    launch {
        // 继承父作用域的上下文
        println("Child context: $coroutineContext")
    }
}

// 可以覆盖
coroutineScope(Dispatchers.IO) {
    launch(Dispatchers.Main) {
        // 使用 Main 调度器
        println("Context: $coroutineContext")
    }
}
```

### 3.2 继承链

```kotlin
// 继承链
val parentJob = Job()
val childJob = Job(parentJob)
val grandChildJob = Job(childJob)

coroutineScope(parentJob) {
    launch {
        coroutineScope(childJob) {
            launch {
                coroutineScope(grandChildJob) {
                    // 三层继承
                }
            }
        }
    }
}
```

### 3.3 上下文元素

```kotlin
// 上下文元素
class MyContextElement : CoroutineContext.Element {
    companion object Key : CoroutineContext.Key<MyContextElement>
    
    override val key: CoroutineContext.Key<*> = Key
}

val context = MyContext.Key to MyContextElement()
val scope = CoroutineScope(context)
```

### 3.4 自定义上下文

```kotlin
// 自定义上下文元素
class LogContext(val logger: Logger) : CoroutineContext.Element {
    companion object Key : CoroutineContext.Key<LogContext>
    override val key: CoroutineContext.Key<*> = Key
}

val context = LogContext(Logger())
val scope = CoroutineScope(context + Dispatchers.Default)

scope.launch {
    val logger = coroutineContext[LogContext.Key]?.logger
    logger?.log("Message")
}
```

### 3.5 上下文组合

```kotlin
// 组合多个上下文元素
val context = Job() + 
              Dispatchers.Main + 
              CoroutineExceptionHandler { _, e ->
                  println("Error: $e")
              } +
              MyContextElement()

val scope = CoroutineScope(context)
```

---

## 4. 结构化并发原理

### 4.1 结构化并发概念

```kotlin
// 结构化并发：协程作为构建块
coroutineScope {
    // 所有子协程都是这个作用域的一部分
    // 父作用域等待所有子协程完成
    
    launch { /* Block 1 */ }
    launch { /* Block 2 */ }
    launch { /* Block 3 */ }
}  // 等待所有子协程完成
```

### 4.2 结构化并发示例

```kotlin
// 典型示例
suspend fun structuredConcurrencyExample() {
    coroutineScope {
        val deferred1 = async { fetchUser() }
        val deferred2 = async { fetchPosts() }
        val deferred3 = async { fetchComments() }
        
        val user = deferred1.await()
        val posts = deferred2.await()
        val comments = deferred3.await()
        
        showUserWithPostsAndComments(user, posts, comments)
    }
}
```

### 4.3 取消传播

```kotlin
// 取消父作用域会取消所有子协程
coroutineScope {
    val job1 = launch {
        delay(1000)
        println("Job 1")
    }
    
    val job2 = launch {
        delay(2000)
        println("Job 2")
    }
    
    // 取消作用域
    cancel()
    // job1 和 job2 都会被取消
}
```

### 4.4 错误传播

```kotlin
// 错误传播到父协程
coroutineScope {
    launch {
        throw Exception("Error")
    }
    launch {
        println("This will not execute")
    }
}
// 第一个协程的错误会取消其他协程

// 使用 SupervisorJob 隔离
supervisorScope {
    launch {
        throw Exception("Error")
    }
    launch {
        println("This will execute")
    }
}
```

### 4.5 层次结构

```kotlin
// 层次结构
coroutineScope {
    val parent = launch {
        val child1 = launch { /* ... */ }
        val child2 = launch { /* ... */ }
        
        child1.join()
        child2.join()
    }
    
    parent.join()
}
```

### 4.6 生命周期管理

```kotlin
// 结构化并发的生命周期
suspend fun lifecycleExample() {
    coroutineScope {
        launch {
            // 协程的生命周期与作用域绑定
            // 作用域结束时，所有协程都会结束
        }
    }
    // 所有子协程完成
}
```

---

## 5. lifecycleScope

### 5.1 LifecycleOwner 的协程作用域

```kotlin
// lifecycleScope 是 LifecycleOwner 的扩展属性
// 它与 Lifecycle 的生命周期绑定

class MyActivity : AppCompatActivity() {
    // lifecycleScope 在 Activity 销毁时自动取消
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            // 协程在 Activity 销毁时自动取消
            loadData()
        }
    }
}
```

### 5.2 生命周期感知

```kotlin
// lifecycleScope 感知生命周期
class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        lifecycleScope.launch {
            // 只有在 Lifecycle.State.STARTED 或 ABOVE 时执行
            // Fragment 销毁时自动取消
        }
    }
}
```

### 5.3 使用场景

```kotlin
// UI 更新
class MyActivity : AppCompatActivity() {
    override fun onResume() {
        super.onResume()
        
        lifecycleScope.launch {
            // UI 更新操作
            updateUI()
        }
    }
}

// 数据加载
class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        lifecycleScope.launch {
            // 数据加载
            val data = repository.getData()
            showData(data)
        }
    }
}
```

### 5.4 生命周期状态

```kotlin
// lifecycleScope 根据生命周期状态执行
lifecycleScope.launch(context = Lifecycle coroutineContext) {
    // 根据生命周期状态决定是否执行
}
```

### 5.5 注意事项

```kotlin
// ❌ 错误：在 lifecycleScope 之外使用
fun wrongExample() {
    // lifecycleScope.launch { }  // 错误：不在 LifecycleOwner 中
}

// ✅ 正确：在 LifecycleOwner 中使用
class MyActivity : AppCompatActivity() {
    fun correctExample() {
        lifecycleScope.launch {
            // 正确
        }
    }
}
```

### 5.6 与 ViewModel 配合

```kotlin
// lifecycleScope 与 ViewModel 配合
class MyActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            viewModel.data.collect { data ->
                // UI 更新
                updateUI(data)
            }
        }
    }
}
```

---

## 6. viewModelScope

### 6.1 ViewModel 的协程作用域

```kotlin
// viewModelScope 是 ViewModel 的协程作用域
// 它与 ViewModel 的生命周期绑定

class MyViewModel : ViewModel() {
    // viewModelScope 在 ViewModel 清除时自动取消
    
    init {
        viewModelScope.launch {
            // 协程在 ViewModel 清除时自动取消
            loadData()
        }
    }
}
```

### 6.2 与 LiveData 配合

```kotlin
// 与 LiveData 配合
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<Data>()
    val data: LiveData<Data> = _data
    
    fun loadData() {
        viewModelScope.launch {
            val result = repository.fetchData()
            _data.value = result
        }
    }
}
```

### 6.3 与 StateFlow 配合

```kotlin
// 与 StateFlow 配合
class MyViewModel : ViewModel() {
    private val _state = MutableStateFlow<State>(State.Loading)
    val state: StateFlow<State> = _state
    
    init {
        viewModelScope.launch {
            _state.value = State.Loading
            val data = repository.fetchData()
            _state.value = State.Success(data)
        }
    }
}
```

### 6.4 使用场景

```kotlin
// 数据加载
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            try {
                val data = repository.fetchData()
                _data.value = data
            } catch (e: Exception) {
                _error.value = e
            }
        }
    }
}

// 用户操作
class MyViewModel : ViewModel() {
    fun onUserAction(action: Action) {
        viewModelScope.launch {
            handleAction(action)
        }
    }
}
```

### 6.5 生命周期管理

```kotlin
// viewModelScope 的生命周期
class MyViewModel : ViewModel() {
    // 创建时启动
    init {
        viewModelScope.launch {
            // 执行
        }
    }
    
    // ViewModel 清除时自动取消
    override fun onCleared() {
        super.onCleared()
        // viewModelScope 自动取消，无需手动处理
    }
}
```

### 6.6 最佳实践

```kotlin
// 最佳实践
class MyViewModel : ViewModel() {
    // 1. 使用 viewModelScope 而不是自己创建 Scope
    // 2. 在 ViewModel 中处理业务逻辑
    // 3. 使用 StateFlow 或 LiveData 暴露数据
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState
    
    init {
        viewModelScope.launch {
            loadInitialData()
        }
    }
    
    private suspend fun loadInitialData() {
        try {
            val data = repository.fetchData()
            _uiState.value = UiState.Success(data)
        } catch (e: Exception) {
            _uiState.value = UiState.Error(e)
        }
    }
}
```

---

## 7. 自定义 Scope

### 7.1 创建自定义 Scope

```kotlin
// 创建自定义 Scope
class CustomScope(
    dispatcher: CoroutineDispatcher = Dispatchers.Default,
    job: Job = SupervisorJob()
) : CoroutineScope {
    override val coroutineContext: CoroutineContext = job + dispatcher
}

// 使用
val scope = CustomScope()
scope.launch {
    // 协程
}
```

### 7.2 带参数的 Scope

```kotlin
// 带参数的自定义 Scope
class ConfigurableScope(
    private val config: Config
) : CoroutineScope {
    override val coroutineContext: CoroutineContext = 
        SupervisorJob() + 
        Dispatchers.Default +
        CoroutineExceptionHandler { _, exception ->
            config.errorHandler.handle(exception)
        }
}
```

### 7.3 作用域工厂

```kotlin
// 作用域工厂
object ScopeFactory {
    fun createDefaultScope(): CoroutineScope {
        return CoroutineScope(Dispatchers.Default)
    }
    
    fun createIOScope(): CoroutineScope {
        return CoroutineScope(Dispatchers.IO)
    }
    
    fun createMainScope(): CoroutineScope {
        return CoroutineScope(Dispatchers.Main)
    }
}

// 使用
val defaultScope = ScopeFactory.createDefaultScope()
val ioScope = ScopeFactory.createIOScope()
```

### 7.4 可配置的 Scope

```kotlin
// 可配置的 Scope
data class ScopeConfig(
    val dispatcher: CoroutineDispatcher = Dispatchers.Default,
    val job: Job = SupervisorJob(),
    val errorHandler: (Throwable) -> Unit = { }
)

class ConfigurableScope(
    config: ScopeConfig
) : CoroutineScope {
    override val coroutineContext: CoroutineContext = 
        config.job + 
        config.dispatcher +
        CoroutineExceptionHandler { _, exception ->
            config.errorHandler(exception)
        }
}
```

### 7.5 作用域池

```kotlin
// 作用域池
class ScopePool {
    private val scopes = mutableListOf<CoroutineScope>()
    
    fun acquire(): CoroutineScope {
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
        scopes.add(scope)
        return scope
    }
    
    fun release(scope: CoroutineScope) {
        scope.coroutineContext[Job]?.cancel()
        scopes.remove(scope)
    }
    
    fun releaseAll() {
        scopes.forEach { 
            it.coroutineContext[Job]?.cancel() 
        }
        scopes.clear()
    }
}
```

### 7.6 作用域注册

```kotlin
// 作用域注册
class ScopeRegistry {
    private val registry = mutableMapOf<String, CoroutineScope>()
    
    fun register(name: String, scope: CoroutineScope) {
        registry[name] = scope
    }
    
    fun get(name: String): CoroutineScope? {
        return registry[name]
    }
    
    fun unregister(name: String) {
        registry.remove(name)?.coroutineContext[Job]?.cancel()
    }
}
```

---

## 8. 协程泄漏检测

### 8.1 泄漏原因

```kotlin
// 泄漏原因 1：未等待协程完成
fun leakyFunction1() {
    launch {
        // 协程在函数返回后继续运行
    }
    // 函数返回，协程可能泄漏
}

// 泄漏原因 2：持有协程引用
class LeakyClass {
    val jobs = mutableListOf<Job>()
    
    fun addJob() {
        val job = launch { /* ... */ }
        jobs.add(job)  // 持有引用，无法 GC
    }
}
```

### 8.2 检测方法

```kotlin
// 使用 Android Profiler
// 1. 内存分析 - 检查未完成的协程
// 2. 线程分析 - 检查阻塞的线程
// 3. CPU 分析 - 检查异常高的 CPU 使用

// 代码检测
fun checkLeakedCoroutines() {
    val activeJobs = coroutineContext[Job]?.children?.toList()
    if (activeJobs != null && activeJobs.isNotEmpty()) {
        println("Active jobs: ${activeJobs.size}")
        activeJobs.forEach { job ->
            println("Job: $job, isActive: ${job.isActive}")
        }
    }
}
```

### 8.3 预防泄漏

```kotlin
// 预防 1：使用结构化并发
coroutineScope {
    // 自动等待所有子协程
}

// 预防 2：及时取消
val job = launch { /* ... */ }
// 在不需要时取消
job.cancel()

// 预防 3：使用生命周期作用域
class MyViewModel : ViewModel() {
    // viewModelScope 在 ViewModel 销毁时自动取消
    viewModelScope.launch {
        // 安全
    }
}
```

### 8.4 调试工具

```kotlin
// 添加调试日志
class DebugCoroutineScope(private val scope: CoroutineScope) {
    fun launch(block: suspend CoroutineScope.() -> Unit): Job {
        val job = scope.launch {
            println("Coroutine started: ${coroutineContext}")
            try {
                block()
            } finally {
                println("Coroutine finished: ${coroutineContext}")
            }
        }
        return job
    }
}
```

### 8.5 泄漏监控

```kotlin
// 协程泄漏监控
class CoroutineLeakMonitor {
    private val activeCoroutines = mutableListOf<Job>()
    
    fun track(job: Job) {
        activeCoroutines.add(job)
        job.invokeOnCompletion {
            activeCoroutines.remove(job)
        }
    }
    
    fun getLeakedCoroutines(): List<Job> {
        return activeCoroutines.filter { it.isActive }
    }
    
    fun reportLeaks() {
        val leaks = getLeakedCoroutines()
        if (leaks.isNotEmpty()) {
            println("Leaked coroutines: ${leaks.size}")
        }
    }
}
```

### 8.6 自动化检测

```kotlin
// 自动化检测
class AutoLeakDetector {
    private val jobs = mutableListOf<Job>()
    
    fun launch(block: suspend CoroutineScope.() -> Unit): Job {
        val job = coroutineScope.launch(block)
        jobs.add(job)
        return job
    }
    
    fun checkLeaks(): List<Job> {
        return jobs.filter { it.isActive }
    }
    
    fun cleanup() {
        jobs.forEach { it.cancel() }
        jobs.clear()
    }
}
```

---

## 9. 取消传播

### 9.1 取消机制

```kotlin
// 取消机制
val scope = CoroutineScope(Job())

scope.launch {
    launch {
        // 子协程
    }
}

// 取消父作用域
scope.cancel()
// 所有子协程都会被取消
```

### 9.2 取消传播链

```kotlin
// 取消传播链
val parentJob = Job()
val childJob = Job(parentJob)

coroutineScope(parentJob) {
    launch {
        coroutineScope(childJob) {
            launch {
                // 最内层协程
            }
        }
    }
}

// 取消 parentJob 会取消所有子协程
parentJob.cancel()
```

### 9.3 取消原因

```kotlin
// 取消原因
val job = launch {
    // ...
}

// 指定取消原因
job.cancel(CancellationException("User cancelled"))

// 获取取消原因
job.invokeOnCompletion { exception ->
    if (exception is CancellationException) {
        println("Cancelled: ${exception.message}")
    }
}
```

### 9.4 取消处理

```kotlin
// 捕取消异常
suspend fun handleCancellation() {
    try {
        launch {
            delay(1000)
        }.join()
    } catch (e: CancellationException) {
        println("Cancelled: ${e.message}")
    }
}

// 忽略取消
suspend fun ignoreCancellation() {
    try {
        // 操作
    } catch (e: CancellationException) {
        // 忽略
    }
}

// 重新抛出取消
suspend fun rethrowCancellation() {
    try {
        // 操作
    } catch (e: CancellationException) {
        throw e
    }
}
```

### 9.5 取消与恢复

```kotlin
// 取消与恢复
suspend fun cancelAndResume() {
    suspendCancellableCoroutine<Unit> { continuation ->
        continuation.invokeOnCancellation {
            // 取消时的处理
        }
        
        // 恢复
        continuation.resume(Unit)
    }
}
```

### 9.6 取消最佳实践

```kotlin
// 最佳实践 1：使用 cancelAndJoin
val job = launch {
    // ...
}
job.cancelAndJoin()

// 最佳实践 2：使用 withTimeout
suspend fun withTimeoutExample() {
    withTimeout(1000) {
        longRunningOperation()
    }
}

// 最佳实践 3：使用 SupervisorJob 隔离
supervisorScope {
    launch {
        // 失败不会取消其他协程
    }
}
```

---

## 10. 异常隔离

### 10.1 异常传播

```kotlin
// launch 的异常传播到父协程
launch {
    throw Exception("Error")  // 父协程会捕获
}

// async 的异常延迟到 await
val deferred = async {
    throw Exception("Error")  // await 时抛出
}

try {
    deferred.await()
} catch (e: Exception) {
    println("Caught: ${e.message}")
}
```

### 10.2 SupervisorJob 隔离

```kotlin
// SupervisorJob 隔离异常
val supervisorJob = SupervisorJob()
coroutineScope(supervisorJob) {
    launch {
        throw Exception("Error 1")
    }
    launch {
        throw Exception("Error 2")
    }
    launch {
        // 继续执行，不受影响
        println("Running")
    }
}
```

### 10.3 try-catch 处理

```kotlin
// 在协程中使用 try-catch
suspend fun safeOperation() {
    try {
        riskyOperation()
    } catch (e: Exception) {
        println("Error: ${e.message}")
    }
}

// 在 launch 中处理
launch {
    try {
        riskyOperation()
    } catch (e: Exception) {
        println("Launch error: ${e.message}")
    }
}

// 在 async 中处理
val deferred = async {
    try {
        riskyOperation()
    } catch (e: Exception) {
        defaultValue
    }
}
```

### 10.4 全局异常处理

```kotlin
// 设置全局异常处理器
val scope = CoroutineScope(
    SupervisorJob() + 
    Dispatchers.Default +
    CoroutineExceptionHandler { _, exception ->
        println("Unhandled exception: $exception")
    }
)

scope.launch {
    throw Exception("Global error")
}
```

### 10.5 异常恢复

```kotlin
// 使用 retry 恢复
suspend fun <T> retry(
    times: Int = 3,
    delay: Duration = 1.second,
    block: suspend () -> T
): T {
    repeat(times) { attempt ->
        try {
            return block()
        } catch (e: Exception) {
            if (attempt == times - 1) throw e
            delay(delay)
        }
    }
    throw IllegalStateException("Should not reach here")
}

// 使用
suspend fun fetchWithRetry() {
    val data = retry(times = 3) {
        api.fetchData()
    }
}
```

### 10.6 异常日志

```kotlin
// 记录异常日志
class ExceptionLogger : CoroutineExceptionHandler {
    override fun handleException(context: CoroutineContext, exception: Throwable) {
        Timber.e(exception, "Coroutine exception")
    }
}

val scope = CoroutineScope(
    SupervisorJob() + 
    Dispatchers.Default +
    ExceptionLogger()
)
```

---

## 11. 性能优化

### 11.1 减少作用域创建

```kotlin
// 优化 1：复用作用域
val sharedScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

// 使用共享作用域
fun useSharedScope() {
    sharedScope.launch {
        // 协程
    }
}
```

### 11.2 调度器优化

```kotlin
// 使用合适的调度器
class OptimizedScope : CoroutineScope {
    override val coroutineContext: CoroutineContext = 
        SupervisorJob() + Dispatchers.Default
}
```

### 11.3 批处理

```kotlin
// 批处理优化
suspend fun batchProcess(items: List<Item>) {
    items.chunked(100).forEach { batch ->
        batch.forEach { item ->
            process(item)
        }
    }
}
```

### 11.4 并发控制

```kotlin
// 使用 Semaphore 控制并发
val semaphore = Semaphore(10)

suspend fun controlledConcurrent(items: List<Item>) {
    items.forEach { item ->
        withSemaphore(semaphore) {
            process(item)
        }
    }
}
```

### 11.5 内存优化

```kotlin
// 避免持有协程引用
class OptimizedClass {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    fun process() {
        scope.launch {
            // 不保存 job 引用
        }
    }
}
```

### 11.6 泄漏预防

```kotlin
// 泄漏预防
class LeakPreventionScope : CoroutineScope {
    override val coroutineContext: CoroutineContext = SupervisorJob() + Dispatchers.Default
    
    fun launchSafe(block: suspend CoroutineScope.() -> Unit): Job {
        val job = launch(block)
        job.invokeOnCompletion {
            // 清理
        }
        return job
    }
}
```

---

## 12. 面试考点

### 12.1 基础考点

#### Q1: 什么是 CoroutineScope？

**A:**
- CoroutineScope 是协程的作用域容器
- 它包含 coroutineContext（Job + Dispatcher）
- 提供协程生命周期管理

#### Q2: 如何创建 CoroutineScope？

**A:**
```kotlin
val scope = CoroutineScope(Dispatchers.Default)
```

#### Q3: lifecycleScope 和 viewModelScope 的区别？

**A:**
- lifecycleScope 绑定到 LifecycleOwner
- viewModelScope 绑定到 ViewModel
- 两者都在生命周期结束时自动取消

### 12.2 进阶考点

#### Q4: Job 和 SupervisorJob 的区别？

**A:**
- Job: 异常传播到父协程
- SupervisorJob: 异常隔离，不传播

#### Q5: 如何实现协程泄漏检测？

**A:**
- 使用 Android Profiler
- 检查未完成的 Job
- 使用 DebugCoroutineScope

#### Q6: 结构化并发的原理？

**A:**
- 父协程等待所有子协程完成
- 子协程的异常传播到父协程
- 取消父协程取消所有子协程

### 12.3 高级考点

#### Q7: 如何自定义 CoroutineScope？

**A:**
```kotlin
class CustomScope : CoroutineScope {
    override val coroutineContext = SupervisorJob() + Dispatchers.Default
}
```

#### Q8: 如何优化 CoroutineScope 性能？

**A:**
- 减少作用域创建
- 使用合适的调度器
- 批处理
- 并发控制

#### Q9: 如何实现协程泄漏监控？

**A:**
```kotlin
class LeakMonitor {
    private val jobs = mutableListOf<Job>()
    fun track(job: Job) { jobs.add(job) }
    fun getLeaks() = jobs.filter { it.isActive }
}
```

---

## 总结

CoroutineScope 是 Kotlin 协程的核心组件，提供了协程生命周期管理的基础设施。掌握 CoroutineScope、Job、SupervisorJob、lifecycleScope、viewModelScope 等概念，对于构建健壮、高效的协程应用至关重要。

核心要点：
1. **作用域** - CoroutineScope 提供生命周期管理
2. **Job vs SupervisorJob** - 异常隔离
3. **生命周期作用域** - lifecycleScope、viewModelScope
4. **结构化并发** - 清晰的协程层次
5. **泄漏检测** - 预防协程泄漏