# Kotlin 高级开发面试知识点汇总 🚀

> Android 高级开发必备 Kotlin 核心知识点，包含详细示例代码和面试考点

---

## 目录

1. [空安全 (Null Safety)](#1-空安全)
2. [扩展函数与扩展属性](#2-扩展函数与扩展属性)
3. [高阶函数与 Lambda](#3-高阶函数与-lambda)
4. [协程 (Coroutines)](#4-协程)
5. [Flow 数据流](#5-flow-数据流)
6. [委托 (Delegation)](#6-委托)
7. [密封类 (Sealed Class)](#7-密封类)
8. [内联函数 (Inline)](#8-内联函数)
9. [泛型与型变](#9-泛型与型变)
10. [作用域函数](#10-作用域函数)

---

## 1. 空安全

### 1.1 基础语法

```kotlin
// 可空类型 vs 非空类型
var name: String = "Kotlin"        // 非空
var nullableName: String? = null   // 可空

// 安全调用操作符 ?.
val length = nullableName?.length

// Elvis 操作符 ?:
val nameOrEmpty = nullableName ?: "Default"

// 非空断言 !!
val length = nullableName!!.length  // 可能抛 NPE

// 安全转换 as?
val str: String? = obj as? String
```

### 1.2 面试考点

**Q: 如何安全处理可空类型？**

```kotlin
// ✅ 推荐方案

// 1. 安全调用 + Elvis
fun getUserEmail(user: User?): String {
    return user?.email ?: "unknown@example.com"
}

// 2. let 作用域
fun processUser(user: User?) {
    user?.let {
        println("User name: ${it.name}")
        println("Email: ${it.email}")
    }
}

// 3. 平台类型处理（Java 互操作）
fun handleJavaString(javaStr: String?) {
    val safeStr = javaStr?.trim()?.ifEmpty { "default" } ?: "default"
}

// 4. 可空类型智能转换
fun checkUser(user: User?) {
    if (user != null) {
        // 智能转换为非空
        println(user.name)
    }
}
```

### 1.3 高级技巧

```kotlin
// 可空类型的扩展函数
fun String?.isNullOrEmpty(): Boolean = this == null || this.isEmpty()

// 链式安全调用
fun getUserName(user: User?): String? {
    return user?.profile?.name?.trim()
}

// 可空类型的 Elvis 返回
fun validateUser(user: User?): Boolean {
    val name = user?.name ?: return false
    val email = user.email ?: return false
    return name.isNotEmpty() && email.contains("@")
}
```

---

## 2. 扩展函数与扩展属性

### 2.1 基础语法

```kotlin
// 扩展函数
fun String.addPrefix(prefix: String): String {
    return "$prefix$this"
}

// 使用
val result = "Kotlin".addPrefix("Hello ")  // "Hello Kotlin"

// 扩展属性
val String.lastChar: Char
    get() = this[this.length - 1]

// 使用
val last = "Kotlin".lastChar  // 'n'
```

### 2.2 面试考点

**Q: 扩展函数与成员函数的区别？**

```kotlin
// 扩展函数（静态解析）
class A
fun A.foo() = "extension"

class B {
    fun foo() = "member"
}

val a = A()
val b = B()

println(a.foo())  // "extension"
println(b.foo())  // "member"

// 扩展函数不能访问私有成员
class MyClass {
    private val secret = "hidden"
}

// ❌ 错误：无法访问 private 成员
// fun MyClass.getSecret() = secret
```

### 2.3 实战示例

```kotlin
// 1. Context 扩展（Android 常用）
fun Context.showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(this, message, duration).show()
}

fun Context.dpToPx(dp: Float): Int {
    return (dp * resources.displayMetrics.density).toInt()
}

fun Context.openUrl(url: String) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
    startActivity(intent)
}

// 2. View 扩展
fun View.visible() {
    visibility = View.VISIBLE
}

fun View.gone() {
    visibility = View.GONE
}

fun View.invisible() {
    visibility = View.INVISIBLE
}

// 3. 集合扩展
fun <T> List<T>.safeGet(index: Int): T? {
    return if (index in indices) this[index] else null
}

fun <T> List<T>.firstOrNull(predicate: (T) -> Boolean): T? {
    return this.filter(predicate).firstOrNull()
}

// 4. String 扩展
fun String.isValidEmail(): Boolean {
    return this.contains("@") && this.contains(".")
}

fun String.toTitleCase(): String {
    return this.split(" ").joinToString(" ") { word ->
        word.replaceFirstChar { it.uppercase() }
    }
}

// 5. 可空类型扩展
fun String?.isNullOrBlank(): Boolean = this == null || this.isBlank()

fun <T> T?.letOrNull(block: (T) -> Unit) {
    this?.let(block)
}
```

---

## 3. 高阶函数与 Lambda

### 3.1 基础语法

```kotlin
// 函数类型
val sum: (Int, Int) -> Int = { a, b -> a + b }

// 作为参数
fun operate(a: Int, b: Int, operation: (Int, Int) -> Int): Int {
    return operation(a, b)
}

// 作为返回值
fun getMultiplier(factor: Int): (Int) -> Int {
    return { x -> x * factor }
}

// 使用
val double = getMultiplier(2)
println(double(5))  // 10
```

### 3.2 面试考点

**Q: Lambda 表达式的 it 关键字？**

```kotlin
// it 是默认参数名
val numbers = listOf(1, 2, 3, 4, 5)

// 使用 it
val doubled = numbers.map { it * 2 }

// 自定义参数名
val doubled = numbers.map { number -> number * 2 }

// 多个参数必须命名
val pairs = listOf(1 to "a", 2 to "b")
pairs.forEach { (num, str) ->
    println("$num: $str")
}
```

### 3.3 实战示例

```kotlin
// 1. 自定义高阶函数
fun <T> List<T>.filterMap(
    predicate: (T) -> Boolean,
    transform: (T) -> String
): List<String> {
    return this.filter(predicate).map(transform)
}

// 使用
val result = listOf(1, 2, 3, 4, 5)
    .filterMap(
        { it % 2 == 0 },
        { "Number: $it" }
    )
// ["Number: 2", "Number: 4"]

// 2. 尾随 Lambda
fun performOperation(
    initialValue: Int,
    operation: (Int) -> Int
): Int {
    return operation(initialValue)
}

// 调用
val result = performOperation(10) {
    it * 2 + 5
}

// 3. 接收者函数类型
class Builder {
    var name: String = ""
    var age: Int = 0
}

fun build(block: Builder.() -> Unit): Builder {
    return Builder().apply(block)
}

// 使用
val person = build {
    name = "张三"
    age = 25
}

// 4. 挂起函数作为参数
suspend fun fetchData(
    url: String,
    onSuccess: (String) -> Unit,
    onError: (Throwable) -> Unit
) {
    try {
        val result = withContext(Dispatchers.IO) {
            // 网络请求
            "data"
        }
        onSuccess(result)
    } catch (e: Exception) {
        onError(e)
    }
}
```

---

## 4. 协程 (Coroutines)

### 4.1 基础语法

```kotlin
// CoroutineScope
lifecycleScope.launch {
    // 协程代码
}

// launch vs async
val job = launch {
    // 不返回值
}

val deferred = async {
    // 返回值
    "result"
}
val result = deferred.await()

// Dispatchers
withContext(Dispatchers.IO) {
    // IO 操作
}

withContext(Dispatchers.Main) {
    // UI 操作
}

withContext(Dispatchers.Default) {
    // CPU 密集型计算
}
```

### 4.2 面试考点

**Q: launch 和 async 的区别？**

```kotlin
// launch: 不返回值，适合火任务
launch {
    repository.saveData(data)
    showToast("保存成功")
}

// async: 返回值，需要 await()
val deferred1 = async { fetchData1() }
val deferred2 = async { fetchData2() }

// 并行执行
val result1 = deferred1.await()
val result2 = deferred2.await()

// 或者使用 awaitAll
val results = awaitAll(deferred1, deferred2)
```

**Q: 协程作用域的区别？**

```kotlin
// lifecycleScope: 与生命周期绑定
lifecycleScope.launch {
    // Activity/Fragment 销毁时自动取消
}

// viewModelScope: 与 ViewModel 绑定
class MyViewModel : ViewModel() {
    init {
        viewModelScope.launch {
            // ViewModel clear 时自动取消
        }
    }
}

// CoroutineScope: 自定义作用域
class MyRepository {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    fun loadData() {
        scope.launch {
            // 需要手动取消
        }
    }
    
    fun clear() {
        scope.cancel()
    }
}

// GlobalScope: 全局作用域（不推荐）
GlobalScope.launch {
    // 应用生命周期，容易内存泄漏
}
```

### 4.3 实战示例

```kotlin
// 1. 顺序执行
suspend fun loadUserData() = viewModelScope.launch {
    val user = userRepository.getUser()      // 先执行
    val posts = postRepository.getPosts()    // 后执行
    updateUI(user, posts)
}

// 2. 并行执行
suspend fun loadUserDataParallel() = viewModelScope.launch {
    val userDeferred = async { userRepository.getUser() }
    val postsDeferred = async { postRepository.getPosts() }
    
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    
    updateUI(user, posts)
}

// 3. 异常处理
suspend fun loadDataWithTryCatch() = viewModelScope.launch {
    try {
        val data = withContext(Dispatchers.IO) {
            repository.getData()
        }
        updateUI(data)
    } catch (e: Exception) {
        showError(e.message)
    }
}

// 4. SupervisorJob（子协程失败不影响其他）
val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

scope.launch {
    val job1 = launch {
        // 失败不影响 job2
        throw Exception("Error 1")
    }
    
    val job2 = launch {
        // 继续执行
        doSomething()
    }
}

// 5. 超时处理
suspend fun loadDataWithTimeout() = withTimeoutOrNull(5000) {
    repository.getData()
} ?: run {
    // 超时处理
    showTimeoutError()
}

// 6. 重试机制
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

// 7. 协程取消
val job = lifecycleScope.launch {
    while (isActive) {
        // 可取消的工作
        doWork()
        delay(1000)
    }
}

// 取消协程
job.cancel()

// 8. Flow 与协程结合
fun loadDataFlow(): Flow<Data> = flow {
    val data = repository.getData()
    emit(data)
}.flowOn(Dispatchers.IO)

// 收集
lifecycleScope.launch {
    loadDataFlow().collect { data ->
        updateUI(data)
    }
}
```

---

## 5. Flow 数据流

### 5.1 基础语法

```kotlin
// 创建 Flow
val numbers: Flow<Int> = flow {
    for (i in 1..5) {
        emit(i)
        delay(100)
    }
}

// 收集 Flow
lifecycleScope.launch {
    numbers.collect { value ->
        println(value)
    }
}

// 操作符
numbers
    .map { it * 2 }
    .filter { it > 4 }
    .collect { println(it) }
```

### 5.2 面试考点

**Q: Flow vs LiveData 的区别？**

```kotlin
// Flow 优势
// 1. 冷流（按需执行）
// 2. 丰富的操作符
// 3. 支持背压处理
// 4. 多平台支持

// LiveData 优势
// 1. 生命周期感知
// 2. 自动管理观察者
// 3. 配置更新保留数据

// 转换
fun asLiveData(): LiveData<T> = flow.asLiveData()
fun asFlow(): Flow<T> = liveData.asFlow()
```

### 5.3 实战示例

```kotlin
// 1. StateFlow（状态流）
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

// 2. SharedFlow（共享流）
class EventBus {
    private val _events = MutableSharedFlow<Event>()
    val events: SharedFlow<Event> = _events.asSharedFlow()
    
    suspend fun postEvent(event: Event) {
        _events.emit(event)
    }
}

// 3. Flow 操作符组合
fun searchQueryFlow(query: String): Flow<List<Result>> = flow {
    val results = repository.search(query)
    emit(results)
}
    .flowOn(Dispatchers.IO)
    .debounce(300)           // 防抖
    .distinctUntilChanged()  // 去重
    .retry(3)                // 重试
    .catch { e ->
        emit(emptyList())
    }

// 4. 多个 Flow 组合
fun combineFlows(): Flow<Pair<User, Posts>> = combine(
    userFlow,
    postsFlow
) { user, posts ->
    user to posts
}

// 5. flatMapLatest（只取最新）
fun searchWithLatest(queryFlow: Flow<String>): Flow<List<Result>> {
    return queryFlow.flatMapLatest { query ->
        repository.searchFlow(query)
    }
}

// 6. 背压处理
val sharedFlow = MutableSharedFlow<Event>(
    replay = 0,           // 不重放
    extraBufferCapacity = 10,  // 缓冲容量
    onBufferOverflow = BufferOverflow.DROP_LATEST  // 溢出策略
)
```

---

## 6. 委托 (Delegation)

### 6.1 基础语法

```kotlin
// 类委托
interface Base {
    fun print()
}

class BaseImpl : Base {
    override fun print() {
        println("BaseImpl")
    }
}

class Derived(b: Base) : Base by b

// 属性委托
class LazyExample {
    val value: String by lazy {
        println("computed!")
        "Hello"
    }
}

// 使用
val example = LazyExample()
println(example.value)  // 第一次：打印 "computed!" 然后 "Hello"
println(example.value)  // 第二次：只打印 "Hello"
```

### 6.2 面试考点

**Q: by lazy 的实现原理？**

```kotlin
// lazy 三种模式
val lazy1 by lazy(LazyThreadSafetyMode.SYNCHRONIZED) { compute() }  // 默认，线程安全
val lazy2 by lazy(LazyThreadSafetyMode.PUBLICATION) { compute() }   // 多线程初始化，可能多次计算
val lazy3 by lazy(LazyThreadSafetyMode.NONE) { compute() }          // 单线程，最快
```

### 6.3 实战示例

```kotlin
// 1. 自定义属性委托
class NotNullVar<T> {
    private var value: T? = null
    
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T {
        return value ?: throw IllegalStateException("Property ${property.name} not initialized")
    }
    
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        this.value = value
    }
}

class Example {
    var name: String by NotNullVar()
}

// 2. Observable 属性
import kotlin.properties.Delegates

class User {
    var name: String by Delegates.observable("<no name>") {
        prop, old, new ->
        println("$prop changed from $old to $new")
    }
}

// 3. 可空 Observable
var nullableName: String? by Delegates.vetoable(null) {
    prop, old, new ->
    new != null  // 返回 false 拒绝更新
}

// 4. Map 委托
class User(map: Map<String, Any?>) {
    val name: String by map
    val age: Int by map
}

val user = User(mapOf(
    "name" to "张三",
    "age" to 25
))
println(user.name)  // "张三"

// 5. 局部变量委托
fun example() {
    var name: String by Delegates.observable("") { _, old, new ->
        println("Changed from $old to $new")
    }
    name = "Kotlin"
}

// 6. 提供委托
class ResourceProvider {
    operator fun provideDelegate(
        thisRef: MyActivity,
        prop: KProperty<*>
    ): ReadOnlyProperty<MyActivity, String> {
        // 创建委托前执行
        return Property { _, _ -> "Value" }
    }
}
```

---

## 7. 密封类 (Sealed Class)

### 7.1 基础语法

```kotlin
sealed class Result {
    data class Success(val data: String) : Result()
    data class Error(val message: String) : Result()
    object Loading : Result()
}

// 使用
fun handleResult(result: Result) {
    when (result) {
        is Result.Success -> println("Success: ${result.data}")
        is Result.Error -> println("Error: ${result.message}")
        Result.Loading -> println("Loading...")
    }
}
```

### 7.2 面试考点

**Q: 密封类 vs 枚举类的区别？**

```kotlin
// 枚举类：只能有固定实例
enum class Status {
    SUCCESS, ERROR, LOADING
}

// 密封类：可以有多个子类，每个子类可以有不同状态
sealed class Status {
    object Success : Status()
    data class Error(val message: String) : Status()
    object Loading : Status()
}
```

### 7.3 实战示例

```kotlin
// 1. API 响应状态
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val code: Int, val message: String) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

// 使用
suspend fun fetchData(): ApiResult<User> {
    return try {
        val user = api.getUser()
        ApiResult.Success(user)
    } catch (e: Exception) {
        ApiResult.Error(500, e.message ?: "Unknown error")
    }
}

// 2. UI 状态
sealed class UiState {
    object Initial : UiState()
    object Loading : UiState()
    data class Success(val data: List<Item>) : UiState()
    data class Error(val message: String) : UiState()
}

// ViewModel
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Initial)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            _uiState.value = try {
                val data = repository.getData()
                UiState.Success(data)
            } catch (e: Exception) {
                UiState.Error(e.message ?: "Error")
            }
        }
    }
}

// 3. 导航事件
sealed class NavigationEvent {
    data class NavigateToDetail(val id: String) : NavigationEvent()
    object NavigateBack : NavigationEvent()
    data class ShowDialog(val message: String) : NavigationEvent()
}

// 4. 当表达式必须 exhaustive
fun processState(state: UiState): String {
    return when (state) {
        is UiState.Initial -> "Initial"
        is UiState.Loading -> "Loading"
        is UiState.Success -> "Success with ${state.data.size} items"
        is UiState.Error -> "Error: ${state.message}"
    }
}
```

---

## 8. 内联函数 (Inline)

### 8.1 基础语法

```kotlin
// 内联函数
inline fun <T> T.let(block: (T) -> R): R {
    return block(this)
}

// 使用
val result = "Kotlin".let {
    it.uppercase()
}
```

### 8.2 面试考点

**Q: inline 的作用和原理？**

```kotlin
// 内联前
fun <T> T.let(block: (T) -> R): R {
    return block(this)  // 创建 Lambda 对象
}

// 内联后（编译后）
val result = "Kotlin".uppercase()  // 直接展开代码
```

### 8.3 实战示例

```kotlin
// 1. 资源管理
inline fun <T : Closeable, R> T.use(block: (T) -> R): R {
    var exception: Throwable? = null
    try {
        return block(this)
    } catch (e: Throwable) {
        exception = e
        throw e
    } finally {
        try {
            close()
        } catch (e: Throwable) {
            if (exception == null) throw e
            exception.addSuppressed(e)
        }
    }
}

// 使用
FileInputStream("file.txt").use { fis ->
    // 自动关闭
}

// 2. 同步锁
inline fun <T> Any.synchronized(block: () -> T): T {
    return kotlin.synchronized(this, block)
}

// 3. 运行作用域
inline fun <T> T.run(block: T.() -> R): R {
    return block()
}

// 4. noinline（禁止内联）
inline fun test(
    inlineParam: () -> Unit,
    noinline noInlineParam: () -> Unit
) {
    inlineParam()  // 内联
    noInlineParam()  // 不内联，可以传递给其他函数
}

// 5. crossinline（禁止非局部返回）
inline fun test(crossinline block: () -> Unit) {
    val runnable = Runnable {
        block()  // 不能 return
    }
}

// 6. 内联类（值类）
@JvmInline
value class UserId(val value: String)

@JvmInline
value class Email(val value: String)

// 编译后直接是 String，没有对象开销
fun sendEmail(userId: UserId, email: Email) {
    // ...
}
```

---

## 9. 泛型与型变

### 9.1 基础语法

```kotlin
// 泛型函数
fun <T> List<T>.safeGet(index: Int): T? {
    return if (index in indices) this[index] else null
}

// 泛型类
class Box<T>(val content: T)

// 泛型约束
fun <T : Comparable<T>> max(a: T, b: T): T {
    return if (a > b) a else b
}

// 多个约束
fun <T> where(
    T : Comparable<T>,
    T : Cloneable
) {
    // ...
}
```

### 9.2 面试考点

**Q: in 和 out 关键字（型变）？**

```kotlin
// 协变（out）：只能读
interface Producer<out T> {
    fun produce(): T
}

// 逆变（in）：只能写
interface Consumer<in T> {
    fun consume(item: T)
}

// PECS 原则
// Producer Extends, Consumer Super
fun copy(
    from: Array<out Any>,  // 生产者
    to: Array<in Any>      // 消费者
) {
    for (i in from.indices) {
        to[i] = from[i]
    }
}
```

### 9.3 实战示例

```kotlin
// 1. 星投影
fun printList(list: List<*>) {
    for (item in list) {
        println(item)
    }
}

// 2. 泛型约束
fun <T : Number> sum(list: List<T>): Double {
    return list.sumOf { it.toDouble() }
}

// 3. 泛型 reified（需要 inline）
inline fun <reified T> List<*>.filterIsInstance(): List<T> {
    return this.filterIsInstance<T>()
}

// 使用
val list = listOf(1, "hello", 2, "world")
val strings = list.filterIsInstance<String>()

// 4. 泛型工厂
interface Factory<T> {
    fun create(): T
}

class UserFactory : Factory<User> {
    override fun create() = User()
}

// 5. 泛型仓库
class Repository<T> {
    private val items = mutableListOf<T>()
    
    fun add(item: T) {
        items.add(item)
    }
    
    fun getAll(): List<T> = items
}

// 6. 泛型扩展
fun <T> T.toResult(): Result<T> {
    return Result.Success(this)
}
```

---

## 10. 作用域函数

### 10.1 对比表

| 函数 | 对象引用 | 返回值 | 典型用途 |
|------|---------|-------|---------|
| **let** | `it` | 结果 | 空安全、变量作用域 |
| **run** | `this` | 结果 | 对象配置、计算 |
| **with** | `this` | 结果 | 对象操作（非扩展） |
| **apply** | `this` | 对象本身 | 对象初始化 |
| **also** | `it` | 对象本身 | 副作用、日志 |

### 10.2 实战示例

```kotlin
// 1. let - 空安全
val length = nullableString?.let {
    it.trim().length
} ?: 0

// 2. run - 对象配置
val textView = TextView(context).run {
    text = "Hello"
    textSize = 16f
    setPadding(16, 16, 16, 16)
    this  // 显式返回
}

// 3. with - 非扩展
with(textView) {
    text = "Hello"
    textSize = 16f
}

// 4. apply - 对象初始化
val intent = Intent().apply {
    action = Intent.ACTION_VIEW
    data = Uri.parse("https://example.com")
    putExtra("key", "value")
}

// 5. also - 副作用
val numbers = mutableListOf<Int>().also {
    println("Creating list with ${it.size} elements")
}
    .apply {
        add(1)
        add(2)
    }
    .also {
        println("List created: $it")
    }

// 6. 链式调用
val user = User().apply {
    name = "张三"
    age = 25
}.also {
    Log.d("User", "Created: $it")
}.let {
    it.copy(email = "test@example.com")
}

// 7. 实际场景
// 初始化 View
private fun setupViews() {
    recyclerView.apply {
        layoutManager = LinearLayoutManager(context)
        adapter = myAdapter
        addItemDecoration(DividerItemDecoration(context, VERTICAL))
    }
}

// 网络请求
suspend fun loadData() {
    val response = api.getData()
        .also { Log.d("API", "Response: $it") }
        .let {
            if (it.isSuccessful) it.body() else null
        }
        ?: run {
            showError()
            return
        }
    
    updateUI(response)
}

// 构建者模式
class DialogBuilder {
    var title: String = ""
    var message: String = ""
    var positiveButton: String = "OK"
    var negativeButton: String? = null
    
    fun build(): Dialog {
        return Dialog(title, message, positiveButton, negativeButton)
    }
}

fun dialog(block: DialogBuilder.() -> Unit): Dialog {
    return DialogBuilder().apply(block).build()
}

// 使用
dialog {
    title = "提示"
    message = "确定要删除吗？"
    positiveButton = "删除"
    negativeButton = "取消"
}.show()
```

---

## 综合实战示例

### ViewModel 完整示例

```kotlin
class UserViewModel(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // StateFlow 状态
    private val _uiState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val uiState: StateFlow<UiState<User>> = _uiState.asStateFlow()
    
    // SharedFlow 事件
    private val _events = MutableSharedFlow<UiEvent>()
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()
    
    // 密封类
    sealed class UiState<out T> {
        object Loading : UiState<Nothing>()
        data class Success<T>(val data: T) : UiState<T>()
        data class Error(val message: String) : UiState<Nothing>()
    }
    
    sealed class UiEvent {
        object NavigateBack : UiEvent()
        data class ShowToast(val message: String) : UiEvent()
    }
    
    // 协程 + Flow
    fun loadUser(userId: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
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
    
    // 重试机制
    fun loadUserWithRetry(userId: String, maxRetries: Int = 3) {
        viewModelScope.launch {
            retry(maxRetries) {
                val user = userRepository.getUser(userId)
                _uiState.value = UiState.Success(user)
            }
        }
    }
    
    // 自定义重试
    private suspend inline fun retry(
        times: Int,
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
    
    // 委托属性
    private val preferences: SharedPreferences by lazy {
        // 初始化
    }
    
    // 扩展函数使用
    private fun String.isValidEmail(): Boolean {
        return this.contains("@") && this.contains(".")
    }
}
```

---

## 面试速查表

| 知识点 | 难度 | 出现频率 | 关键概念 |
|--------|------|---------|---------|
| 空安全 | ⭐⭐ | ⭐⭐⭐⭐⭐ | `?.`, `?:`, `!!`, `let` |
| 扩展函数 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 静态解析、不能访问私有成员 |
| 高阶函数 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Lambda、函数类型、尾随 Lambda |
| 协程 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | `launch`/`async`、作用域、Dispatcher |
| Flow | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | `StateFlow`、`SharedFlow`、操作符 |
| 委托 | ⭐⭐⭐ | ⭐⭐⭐ | `by lazy`、`Delegates` |
| 密封类 | ⭐⭐⭐ | ⭐⭐⭐⭐ | `when` exhaustive、状态管理 |
| 内联函数 | ⭐⭐⭐⭐ | ⭐⭐⭐ | `inline`、`noinline`、`crossinline` |
| 泛型 | ⭐⭐⭐⭐ | ⭐⭐⭐ | `in`/`out`、PECS、`reified` |
| 作用域函数 | ⭐⭐ | ⭐⭐⭐⭐⭐ | `let`/`run`/`with`/`apply`/`also` |

---

**📚 推荐资源**
- [Kotlin 官方文档](https://kotlinlang.org/docs/home.html)
- [Kotlin Coroutines Guide](https://kotlinlang.org/docs/coroutines-guide.html)
- [Kotlin 实战](https://github.com/Kotlin/kotlin-examples)

**🎯 学习建议**
1. 先掌握基础语法（空安全、扩展函数）
2. 深入理解协程和 Flow（面试必考）
3. 熟练使用作用域函数
4. 理解密封类在状态管理中的应用
5. 实际项目中多练习泛型和内联函数

---

*最后更新：2026-04-14*
