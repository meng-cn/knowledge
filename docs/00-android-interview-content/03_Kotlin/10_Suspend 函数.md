# 10. Kotlin Suspend 函数详解

## 目录

1. [suspend 关键字原理](#1-suspend-关键字原理)
2. [挂起与恢复机制](#2-挂起与恢复机制)
3. [协程状态机](#3-协程状态机)
4. [suspendCoroutine 实现](#4-suspendcoroutine-实现)
5. [suspendCancellableCoroutine 实现](#5-suspendcancellablecoroutine-实现)
6. [桥接回调到协程](#6-桥接回调到协程)
7. [桥接 Future/CompletableFuture](#7-桥接-futurecompletablefuture)
8. [suspend 函数组合](#8-suspend-函数组合)
9. [避免阻塞协程](#9-避免阻塞协程)
10. [常见错误](#10-常见错误)
11. [最佳实践](#11-最佳实践)
12. [性能优化](#12-性能优化)
13. [面试考点](#13-面试考点)

---

## 1. suspend 关键字原理

### 1.1 什么是 suspend 函数

**suspend 函数**是 Kotlin 协程中的核心概念，它标记一个函数可以"挂起"（暂停执行）而不会阻塞线程。当挂起函数被调用时，如果它需要等待某些异步操作完成，它会暂停当前协程的执行，释放线程去做其他工作。

```kotlin
// 基本定义
suspend fun fetchData(): Data {
    // 可以调用其他挂起函数
    delay(1000)
    return api.getData()
}

// 只能在协程或另一个挂起函数中调用
fun main() = runBlocking {
    val data = fetchData()  // ✅ 正确
}

// ❌ 错误：不能在普通函数中调用
// fun regularFunction() {
//     fetchData()  // 编译错误
// }
```

### 1.2 suspend 的编译时转换

Kotlin 编译器会将 suspend 函数转换为状态机。让我们看看这个过程：

```kotlin
// 原始代码
suspend fun example() {
    println("Before")
    delay(1000)
    println("After")
}

// 编译后（简化版）
fun example(
    continuation: Continuation<Unit>
): Any? {
    return exampleSuspended(continuation, 0)
}

private fun exampleSuspended(
    continuation: Continuation<Unit>,
    state: Int
): Any? {
    return when (state) {
        0 -> {
            println("Before")
            // delay 会检查 continuation
            delay(1000, continuation)
            exampleSuspended(continuation, 1)
        }
        1 -> {
            println("After")
            completion(Unit)
        }
        else -> COROUTINE_SUSPENDED
    }
}
```

### 1.3 suspend 函数的限制

```kotlin
// ✅ 可以定义 suspend 函数
suspend fun suspendFunction() { }

// ✅ suspend 函数可以调用 suspend 函数
suspend fun suspendFunction1() {
    suspendFunction2()
}

// ❌ suspend 函数不能是静态的
class MyClass {
    // suspend fun staticFunction() { }  // 错误
}

// ❌ suspend 函数不能是接口方法（协程上下文不确定）
interface MyInterface {
    // suspend fun interfaceMethod() { }  // 错误（Kotlin 1.3 之前）
    // Kotlin 1.3+ 支持接口中的 suspend 方法
}

// ❌ 普通函数不能调用 suspend 函数
fun regularFunction() {
    // suspendFunction()  // 错误
}
```

### 1.4 suspend 修饰符的位置

```kotlin
// suspend 必须放在 return type 之前
suspend fun fetchData(): Result<Data> { }

// 不能放在参数位置
// fun suspend fetchData(): Data { }  // 错误
```

---

## 2. 挂起与恢复机制

### 2.1 挂起（Suspend）

当协程执行到挂起点时，它会：
1. 保存当前状态
2. 释放线程
3. 等待异步操作完成

```kotlin
suspend fun demonstrateSuspend() {
    println("Start: ${Thread.currentThread().name}")
    
    // 挂起点
    delay(1000)
    
    println("Resume: ${Thread.currentThread().name}")
}

fun main() = runBlocking {
    demonstrateSuspend()
}
```

### 2.2 恢复（Resume）

当异步操作完成后：
1. 协程从挂起点恢复
2. 继续执行后续代码
3. 可能在不同线程继续

```kotlin
suspend fun demonstrateResume() {
    println("Before suspend: Thread = ${Thread.currentThread().name}")
    
    withContext(Dispatchers.IO) {
        delay(1000)
    }
    
    println("After resume: Thread = ${Thread.currentThread().name}")
}
```

### 2.3 挂起点检测

```kotlin
// 常见的挂起点
suspend fun commonSuspendPoints() {
    // delay() - 时间延迟
    delay(1000)
    
    // 网络请求
    val response = api.fetchData()
    
    // 数据库查询
    val data = database.query()
    
    // 文件读写
    val content = file.readText()
    
    // 协程等待
    job.join()
    deferred.await()
}
```

### 2.4 非阻塞挂起

```kotlin
// 挂起不会阻塞线程
suspend fun nonBlockingSuspend() {
    println("Thread before: ${Thread.currentThread().name}")
    
    delay(1000)  // 挂起，释放线程
    
    println("Thread after: ${Thread.currentThread().name}")
    // 线程可能已经改变
}

// 对比阻塞
fun blockingOperation() {
    println("Thread before: ${Thread.currentThread().name}")
    
    Thread.sleep(1000)  // 阻塞，占用线程
    
    println("Thread after: ${Thread.currentThread().name}")
    // 线程相同
}
```

---

## 3. 协程状态机

### 3.1 状态机原理

Kotlin 协程使用状态机来管理挂起和恢复：

```kotlin
// 状态机状态
sealed class CoroutineState {
    object Running : CoroutineState()
    object Suspended : CoroutineState()
    object Completed : CoroutineState()
    object Cancelled : CoroutineState()
}

// 状态转换
class CoroutineStateMachine {
    private var state: CoroutineState = CoroutineState.Running
    
    fun suspend() {
        state = CoroutineState.Suspended
    }
    
    fun resume() {
        if (state == CoroutineState.Suspended) {
            state = CoroutineState.Running
        }
    }
    
    fun complete() {
        state = CoroutineState.Completed
    }
}
```

### 3.2 状态机实现示例

```kotlin
// 简化的状态机实现
class SimpleStateMachine {
    private var state: Int = 0
    
    suspend fun execute() {
        when (state) {
            0 -> {
                println("Step 1")
                delay(100)
                state = 1
                // 挂起，状态保存为 1
            }
            1 -> {
                println("Step 2")
                delay(100)
                state = 2
            }
            2 -> {
                println("Step 3")
                state = 3
            }
        }
    }
}
```

### 3.3 状态保存与恢复

```kotlin
// 状态保存
suspend fun statePreservation() {
    var value = 0
    
    println("Before: $value")
    delay(100)  // 挂起，value = 0 被保存
    
    value = 1
    println("After: $value")  // 恢复后 value = 1
}

// 多状态
suspend fun multipleStates() {
    var state1 = 0
    var state2 = 0
    
    println("State1: $state1, State2: $state2")
    delay(100)
    
    state1 = 1
    println("State1: $state1, State2: $state2")
    delay(100)
    
    state2 = 1
    println("State1: $state1, State2: $state2")
}
```

### 3.4 状态机调试

```kotlin
// 添加调试信息
suspend fun debuggableStateMachine() {
    println("Starting state machine")
    
    println("State 0")
    delay(100)
    
    println("State 1")
    delay(100)
    
    println("State 2")
    println("State machine completed")
}

// 使用
fun main() = runBlocking {
    debuggableStateMachine()
}
```

---

## 4. suspendCoroutine 实现

### 4.1 基本用法

`suspendCoroutine` 用于将回调风格的 API 转换为协程风格的 suspend 函数：

```kotlin
// 将回调 API 转换为 suspend 函数
suspend fun fetchWithCallback(): String {
    return suspendCoroutine { continuation ->
        // 调用回调风格的 API
        callbackApi { result ->
            // 当回调完成时，恢复协程
            continuation.resume(result)
        }
    }
}

// 回调风格的 API
fun callbackApi(callback: (String) -> Unit) {
    Handler(Looper.getMainLooper()).postDelayed({
        callback("Result from callback")
    }, 1000)
}
```

### 4.2 完整示例

```kotlin
// 模拟网络请求
interface NetworkCallback {
    fun onSuccess(data: String)
    fun onError(error: Exception)
}

suspend fun networkRequest(): String {
    return suspendCoroutine { continuation ->
        // 调用回调风格 API
        makeRequest(object : NetworkCallback {
            override fun onSuccess(data: String) {
                continuation.resume(data)
            }
            
            override fun onError(error: Exception) {
                continuation.resumeWithException(error)
            }
        })
    }
}

// 使用
fun main() = runBlocking {
    try {
        val result = networkRequest()
        println("Result: $result")
    } catch (e: Exception) {
        println("Error: ${e.message}")
    }
}
```

### 4.3 状态保存

```kotlin
// suspendCoroutine 会保存协程状态
suspend fun stateWithSuspendCoroutine(): String {
    var state = 0
    
    val part1 = suspendCoroutine<String> { continuation ->
        // 第一次挂起，state = 0
        callback { result ->
            continuation.resume(result)
        }
    }
    
    state = 1
    
    val part2 = suspendCoroutine<String> { continuation ->
        // 第二次挂起，state = 1
        callback { result ->
            continuation.resume(result)
        }
    }
    
    return "$part1-$part2"
}
```

### 4.4 错误处理

```kotlin
// 处理错误
suspend fun requestWithErrorHandling(): String {
    return suspendCoroutine { continuation ->
        makeRequest(object : NetworkCallback {
            override fun onSuccess(data: String) {
                continuation.resume(data)
            }
            
            override fun onError(error: Exception) {
                continuation.resumeWithException(error)
            }
        })
    }
}

// 使用 try-catch
fun main() = runBlocking {
    try {
        val result = requestWithErrorHandling()
        println("Success: $result")
    } catch (e: Exception) {
        println("Failed: ${e.message}")
    }
}
```

### 4.5 suspendCoroutine 的返回类型

```kotlin
// 返回不同类型
suspend fun suspendCoroutineInt(): Int = suspendCoroutine {
    callback { value ->
        it.resume(value)
    }
}

suspend fun suspendCoroutineList(): List<String> = suspendCoroutine {
    callback { list ->
        it.resume(list)
    }
}

suspend fun suspendCoroutineObject(): Any = suspendCoroutine {
    callback { obj ->
        it.resume(obj)
    }
}
```

---

## 5. suspendCancellableCoroutine 实现

### 5.1 可取消的协程

`suspendCancellableCoroutine` 允许协程在挂起时被取消：

```kotlin
// 基本用法
suspend fun cancellableRequest(): String {
    return suspendCancellableCoroutine { continuation ->
        // 执行请求
        val request = makeRequest()
        
        // 注册取消回调
        continuation.invokeOnCancellation {
            // 协程被取消时调用
            request.cancel()
        }
    }
}

// 使用
fun main() = runBlocking {
    val job = launch {
        cancellableRequest()
    }
    
    delay(500)
    job.cancel()  // 取消协程，请求也会被取消
}
```

### 5.2 完整的取消处理

```kotlin
// 完整的取消处理示例
suspend fun cancellableNetworkRequest(): Data {
    return suspendCancellableCoroutine { continuation ->
        val request = apiRequest(object : RequestCallback {
            override fun onSuccess(data: Data) {
                continuation.resume(data)
            }
            
            override fun onError(error: Exception) {
                continuation.resumeWithException(error)
            }
        })
        
        // 注册取消回调
        continuation.invokeOnCancellation {
            request.cancel()
            // 通知 API 取消
        }
    }
}
```

### 5.3 取消与恢复

```kotlin
// 取消与恢复的完整流程
suspend fun demonstrateCancellation() {
    return suspendCancellableCoroutine<Unit> { continuation ->
        println("Coroutine suspended")
        
        // 模拟异步操作
        Handler(Looper.getMainLooper()).postDelayed({
            if (!continuation.isCancelled) {
                continuation.resume(Unit)
                println("Coroutine resumed")
            } else {
                println("Coroutine was cancelled")
            }
        }, 2000)
        
        continuation.invokeOnCancellation {
            println("Cancellation detected")
        }
    }
}

fun main() = runBlocking {
    val job = launch {
        demonstrateCancellation()
    }
    
    delay(1000)
    job.cancel()
}
```

### 5.4 取消原因

```kotlin
// 获取取消原因
suspend fun getCancellationReason() {
    suspendCancellableCoroutine<Unit> { continuation ->
        continuation.invokeOnCancellation { cause ->
            println("Cancelled because: $cause")
        }
    }
}

// 指定取消原因
val job = launch {
    getCancellationReason()
}
job.cancel(CancellationException("User requested cancellation"))
```

### 5.5 资源清理

```kotlin
// 确保资源清理
suspend fun resourceCleanupExample() {
    suspendCancellableCoroutine<Unit> { continuation ->
        val resource = acquireResource()
        
        try {
            // 使用资源
            // ...
            
            // 恢复协程
            continuation.resume(Unit)
        } finally {
            releaseResource(resource)
        }
        
        continuation.invokeOnCancellation {
            releaseResource(resource)
        }
    }
}
```

---

## 6. 桥接回调到协程

### 6.1 回调转协程模式

```kotlin
// 原始回调 API
interface CallbackApi {
    fun fetchData(callback: (Result<Data>) -> Unit)
}

// 桥接到协程
suspend fun callbackApi.toCoroutine(): Data {
    return suspendCoroutine { continuation ->
        fetchData { result ->
            when (result) {
                is Result.Success -> continuation.resume(result.data)
                is Result.Error -> continuation.resumeWithException(result.error)
            }
        }
    }
}
```

### 6.2 实际案例：Room 数据库

```kotlin
// Room 的回调 API
@Dao
interface UserDaoCallback {
    fun getUser(id: Int, callback: (User?) -> Unit)
}

// 桥接到协程
suspend fun UserDaoCallback.getUserSuspend(id: Int): User? {
    return suspendCoroutine { continuation ->
        getUser(id) { user ->
            continuation.resume(user)
        }
    }
}

// 使用
fun main() = runBlocking {
    val user = userDao.getUserSuspend(1)
    println("User: $user")
}
```

### 6.3 实际案例： Retrofit

```kotlin
// Retrofit 的 Call 已经支持协程
interface ApiService {
    @GET("user/{id}")
    suspend fun getUser(@Path("id") id: Int): User
}

// 使用
fun main() = runBlocking {
    val user = apiService.getUser(1)
    println("User: $user")
}
```

### 6.4 实际案例： Firebase

```kotlin
// Firebase 的回调 API
fun getDocument(callback: (DocumentSnapshot?) -> Unit) {
    database.collection("users").document("123")
        .get { snapshot, error ->
            if (error != null) {
                callback(null)
            } else {
                callback(snapshot)
            }
        }
}

// 桥接到协程
suspend fun getDocumentSuspend(): DocumentSnapshot? {
    return suspendCoroutine { continuation ->
        getDocument { snapshot ->
            continuation.resume(snapshot)
        }
    }
}

// 使用
fun main() = runBlocking {
    val snapshot = getDocumentSuspend()
    println("Document: $snapshot")
}
```

### 6.5 实际案例： Android API

```kotlin
// Android 的 ContentResolver 回调
fun loadContentUri(uri: Uri, callback: (String?) -> Unit) {
    contentResolver.openInputStream(uri)?.use {
        val data = it.readText()
        callback(data)
    }
}

// 桥接到协程
suspend fun loadContentUriSuspend(uri: Uri): String? {
    return suspendCoroutine { continuation ->
        loadContentUri(uri) { data ->
            continuation.resume(data)
        }
    }
}
```

---

## 7. 桥接 Future/CompletableFuture

### 7.1 Future 转协程

```kotlin
// 将 Future 转换为协程
suspend fun <T> CompletableFuture<T>.await(): T {
    return suspendCancellableCoroutine { continuation ->
        whenComplete { result, throwable ->
            if (throwable != null) {
                continuation.resumeWithException(throwable)
            } else {
                continuation.resume(result)
            }
        }
        
        continuation.invokeOnCancellation {
            cancel(true)
        }
    }
}

// 使用
fun main() = runBlocking {
    val future = CompletableFuture.supplyAsync {
        Thread.sleep(1000)
        "Result"
    }
    
    val result = future.await()
    println("Result: $result")
}
```

### 7.2 Future 转协程简化版

```kotlin
// 简化版本
suspend fun <T> Future<T>.await(): T {
    return suspendCoroutine { continuation ->
        object : FutureTask<T>(callable { get() }, null) {
            override fun done() {
                try {
                    continuation.resume(get())
                } catch (e: Exception) {
                    continuation.resumeWithException(e)
                }
            }
        }.run {
            addListener { done() }, true
        }
    }
}
```

### 7.3 CompletableFuture 高级用法

```kotlin
// 带超时的 Future
suspend fun <T> CompletableFuture<T>.awaitWithTimeout(timeout: Long): T {
    return withTimeout(timeout) {
        await()
    }
}

// 使用
fun main() = runBlocking {
    val future = CompletableFuture.supplyAsync {
        Thread.sleep(2000)
        "Result"
    }
    
    try {
        val result = future.awaitWithTimeout(1000)
        println("Result: $result")
    } catch (e: TimeoutCancellationException) {
        println("Timeout")
    }
}
```

### 7.4 Java 的 Future 桥接

```kotlin
// Java 的 Future
suspend fun <T> JavaFuture<T>.await(): T {
    return suspendCancellableCoroutine { continuation ->
        val task = Callable<T> { get() }
        val futureTask = FutureTask(task) {
            try {
                continuation.resume(futureTask.get())
            } catch (e: Exception) {
                continuation.resumeWithException(e)
            }
        }
        
        executorService.execute(futureTask)
        
        continuation.invokeOnCancellation {
            futureTask.cancel(true)
        }
    }
}
```

### 7.5 并行 Future

```kotlin
// 并行执行多个 Future
suspend fun <T> List<CompletableFuture<T>>.awaitAll(): List<T> {
    return this.map { it.await() }
}

// 使用
fun main() = runBlocking {
    val futures = listOf(
        CompletableFuture.supplyAsync { "A" },
        CompletableFuture.supplyAsync { "B" },
        CompletableFuture.supplyAsync { "C" }
    )
    
    val results = futures.awaitAll()
    println("Results: $results")
}
```

---

## 8. suspend 函数组合

### 8.1 组合多个 suspend 函数

```kotlin
// 组合多个 suspend 函数
suspend fun combineSuspendFunctions(): CombinedResult {
    val user = fetchUser()
    val posts = fetchPosts(user.id)
    val comments = fetchComments(posts.first().id)
    
    return CombinedResult(user, posts, comments)
}

// 使用
fun main() = runBlocking {
    val result = combineSuspendFunctions()
    println("Result: $result")
}
```

### 8.2 并行组合

```kotlin
// 并行执行
suspend fun parallelCombine(): CombinedResult {
    coroutineScope {
        val userDeferred = async { fetchUser() }
        val postsDeferred = async { fetchPosts() }
        val commentsDeferred = async { fetchComments() }
        
        CombinedResult(
            userDeferred.await(),
            postsDeferred.await(),
            commentsDeferred.await()
        )
    }
}
```

### 8.3 链式组合

```kotlin
// 链式调用
suspend fun chainSuspendFunctions(): FinalResult {
    return fetchUser()
        .let { fetchPosts(it.id) }
        .firstOrNull()
        ?.let { fetchComments(it.id) }
        ?: emptyList()
}
```

### 8.4 条件组合

```kotlin
// 条件执行
suspend fun conditionalCombine(): Result {
    return if (shouldFetchUser()) {
        fetchUser()
    } else {
        getCachedUser()
    }.let { user ->
        fetchPosts(user.id)
    }
}
```

### 8.5 错误处理组合

```kotlin
// 组合时的错误处理
suspend fun combineWithErrorHandling(): Result {
    return try {
        val user = fetchUser()
        val posts = fetchPosts(user.id)
        Result.Success(user, posts)
    } catch (e: Exception) {
        Result.Error(e)
    }
}
```

---

## 9. 避免阻塞协程

### 9.1 阻塞操作的危害

```kotlin
// ❌ 错误：阻塞协程
suspend fun blockingExample() {
    delay(1000)
    Thread.sleep(1000)  // 阻塞！
    delay(1000)
}

// ✅ 正确：使用非阻塞
suspend fun nonBlockingExample() {
    delay(1000)
    // 没有 Thread.sleep
    delay(1000)
}
```

### 9.2 常见的阻塞操作

```kotlin
// 阻塞操作列表
fun blockingOperations() {
    Thread.sleep(1000)       // 阻塞
    file.readBytes()         // 可能阻塞
    socket.read()            // 阻塞
    database.query()         // 可能阻塞
}

// 非阻塞替代
suspend fun nonBlockingOperations() {
    delay(1000)              // 非阻塞
    withContext(Dispatchers.IO) { file.readBytes() }  // IO 线程
    withContext(Dispatchers.IO) { socket.read() }     // IO 线程
    withContext(Dispatchers.IO) { database.query() }  // IO 线程
}
```

### 9.3 使用 withContext

```kotlin
// 将阻塞操作移到 IO 线程
suspend fun safeBlockingOperation() {
    val result = withContext(Dispatchers.IO) {
        // 阻塞操作在 IO 线程执行
        blockingApi()
    }
    // 自动切换回原线程
}
```

### 9.4 检查阻塞

```kotlin
// 检查是否有阻塞操作
suspend fun checkBlocking() {
    // 使用 Profiler 检查
    // 1. CPU 占用
    // 2. 线程状态
    // 3. 内存使用
}
```

---

## 10. 常见错误

### 10.1 在 UI 线程阻塞

```kotlin
// ❌ 错误：在 UI 线程阻塞
fun onClick() {
    runBlocking {
        Thread.sleep(1000)  // 阻塞 UI 线程
    }
}

// ✅ 正确：使用 IO 线程
fun onClick() {
    viewModelScope.launch {
        val result = withContext(Dispatchers.IO) {
            // IO 操作
        }
        // UI 更新
    }
}
```

### 10.2 忘记处理异常

```kotlin
// ❌ 错误：忘记处理异常
launch {
    riskyOperation()  // 可能抛出异常
}

// ✅ 正确：处理异常
launch {
    try {
        riskyOperation()
    } catch (e: Exception) {
        handleError(e)
    }
}
```

### 10.3 阻塞主线程

```kotlin
// ❌ 错误：阻塞主线程
fun main() = runBlocking {
    Thread.sleep(1000)  // 阻塞
}

// ✅ 正确：使用 delay
fun main() = runBlocking {
    delay(1000)  // 非阻塞
}
```

### 10.4 混用阻塞和非阻塞

```kotlin
// ❌ 错误：混用
suspend fun mixedOperations() {
    val data1 = blockingApi()
    val data2 = nonBlockingApi()
}

// ✅ 正确：统一使用非阻塞
suspend fun nonBlockingOperations() {
    val data1 = withContext(Dispatchers.IO) { blockingApi() }
    val data2 = nonBlockingApi()
}
```

---

## 11. 最佳实践

### 11.1 命名规范

```kotlin
// suspend 函数命名
suspend fun fetchData()      // ✅ 动词开头
suspend fun calculateResult() // ✅ 动词开头

// 非 suspend 函数
fun getData()               // ✅ 名词或动词
fun getResult()             // ✅
```

### 11.2 异常处理

```kotlin
// 在 suspend 函数中处理异常
suspend fun safeFetchData(): Result<Data> {
    return try {
        Result.Success(fetchData())
    } catch (e: Exception) {
        Result.Error(e)
    }
}
```

### 11.3 文档说明

```kotlin
/**
 * 获取用户数据
 * @param id 用户 ID
 * @return 用户对象
 * @throws IOException 网络错误
 * @throws NotFoundException 用户不存在
 */
suspend fun getUser(id: Int): User {
    // 实现
}
```

### 11.4 测试

```kotlin
// 测试 suspend 函数
@Test
fun testSuspendFunction() = runBlocking {
    val result = getUser(1)
    assertEquals("Alice", result.name)
}
```

---

## 12. 性能优化

### 12.1 减少挂起次数

```kotlin
// 优化：减少挂起
suspend fun optimized() {
    val data1 = fetchData1()
    val data2 = fetchData2()
    // 并行执行
}

// 使用
suspend fun parallel() {
    coroutineScope {
        val d1 = async { fetchData1() }
        val d2 = async { fetchData2() }
        val result1 = d1.await()
        val result2 = d2.await()
    }
}
```

### 12.2 缓存结果

```kotlin
// 缓存 suspend 函数结果
class CachedSuspendFunction {
    private val cache = ConcurrentHashMap<String, Data>()
    
    suspend fun fetchData(key: String): Data {
        return cache.getOrPut(key) {
            actualFetch(key)
        }
    }
}
```

### 12.3 批处理

```kotlin
// 批处理优化
suspend fun batchFetch(ids: List<Int>): List<User> {
    return withContext(Dispatchers.IO) {
        repository.fetchBatch(ids)
    }
}
```

---

## 13. 面试考点

### 13.1 基础考点

#### Q1: suspend 函数的作用？

**A:**
- 标记函数可以挂起
- 只能在协程或另一个 suspend 函数中调用
- 不阻塞线程，只是暂停执行

#### Q2: suspend 函数的编译原理？

**A:**
- 转换为状态机
- 保存和恢复执行状态
- 使用 Continuation 接口

#### Q3: suspendCoroutine 的用法？

**A:**
- 将回调 API 转换为协程
- 接收 Continuation 参数
- 调用 resume 恢复协程

### 13.2 进阶考点

#### Q4: 如何实现协程的取消？

**A:**
- 使用 suspendCancellableCoroutine
- 注册 invokeOnCancellation 回调
- 在取消时清理资源

#### Q5: 桥接 Future 到协程？

**A:**
```kotlin
suspend fun <T> Future<T>.await(): T {
    return suspendCancellableCoroutine { continuation ->
        // 实现
    }
}
```

### 13.3 高级考点

#### Q6: suspend 函数的状态机实现细节？

**A:**
- 编译器生成状态机代码
- 保存局部变量
- 管理挂起点和恢复点

#### Q7: 如何优化 suspend 函数性能？

**A:**
- 减少挂起次数
- 使用缓存
- 批处理
- 并行执行

---

## 总结

suspend 函数是 Kotlin 协程的核心，它通过状态机机制实现了非阻塞的异步编程。掌握 suspend 函数的工作原理、挂起恢复机制、状态机实现和桥接技术，对于编写高效的协程代码至关重要。

核心要点：
1. **状态机** - suspend 函数转换为状态机
2. **挂起恢复** - 不阻塞线程
3. **suspendCoroutine** - 桥接回调
4. **suspendCancellableCoroutine** - 可取消
5. **避免阻塞** - 使用 withContext