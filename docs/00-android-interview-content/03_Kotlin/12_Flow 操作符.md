# 12. Kotlin Flow 操作符详解

## 目录

1. [Flow 基础概念（冷数据流）](#1-flow-基础概念冷数据流)
2. [Cold vs Hot Flow](#2-cold-vs-hot-flow)
3. [StateFlow 详解](#3-stateflow-详解)
4. [SharedFlow 详解](#4-sharedflow-详解)
5. [Flow 转换操作符](#5-flow-转换操作符)
6. [Flow 过滤操作符](#6-flow-过滤操作符)
7. [Flow 组合操作符](#7-flow-组合操作符)
8. [Flow 异常操作符](#8-flow-异常操作符)
9. [Flow 终端操作符](#9-flow-终端操作符)
10. [Flow 与 LiveData 对比](#10-flow-与-livedata-对比)
11. [Flow 与 RxJava 对比](#11-flow-与-rxjava-对比)
12. [Flow 性能优化](#12-flow-性能优化)
13. [最佳实践](#13-最佳实践)
14. [面试考点](#14-面试考点)

---

## 1. Flow 基础概念（冷数据流）

### 1.1 什么是 Flow

**Flow** 是 Kotlin 协程提供的响应式数据流，从 Kotlin 1.3.40 开始引入。它是一种**冷数据流（Cold Data Stream）**，意味着每次收集时都会重新执行产生数据的操作。

```kotlin
import kotlinx.coroutines.flow.*

// 创建 Flow
val flow: Flow<Int> = flow {
    emit(1)
    emit(2)
    emit(3)
}

// 收集 Flow
flow.collect { value ->
    println("Received: $value")
}
```

### 1.2 Flow 的冷数据流特性

```kotlin
// Flow 是冷的：每次 collect 都会重新执行
val coldFlow = flow {
    println("Producing data...")
    emit(1)
    emit(2)
    emit(3)
}

// 第一次收集
println("First collection:")
coldFlow.collect { println("  -> $it") }

// 第二次收集
println("\nSecond collection:")
coldFlow.collect { println("  -> $it") }

// 输出：
// First collection:
// Producing data...
//   -> 1
//   -> 2
//   -> 3
// 
// Second collection:
// Producing data...
//   -> 1
//   -> 2
//   -> 3
```

### 1.3 Flow 与 Iterable 对比

```kotlin
// Iterable：同步、阻塞
val list = listOf(1, 2, 3, 4, 5)
list.forEach { println(it) }  // 同步执行

// Flow：异步、非阻塞
val flow = flowOf(1, 2, 3, 4, 5)
flow.collect { println(it) }  // 异步收集

// Flow 支持 suspend 函数
suspend fun fetchData(): Data {
    delay(1000)
    return Data("Result")
}

val flowWithSuspend = flow {
    val data = fetchData()  // 可以在 Flow 中使用 suspend 函数
    emit(data)
}
```

### 1.4 Flow 构建器

```kotlin
// flow {} 构建器
val customFlow = flow<Int> {
    for (i in 1..5) {
        delay(100)
        emit(i)
    }
}

// flowOf() - 从集合创建
val simpleFlow = flowOf(1, 2, 3, 4, 5)

// asFlow() - 从 Iterable 转换
val listAsFlow = listOf(1, 2, 3).asFlow()

// channelAsFlow() - 从 Channel 转换
val channel = Channel<Int>()
val channelFlow = channel.asFlow()
```

### 1.5 Flow 的基本结构

```kotlin
// Flow 的基本结构
interface Flow<out T> {
    suspend fun collect(collector: FlowCollector<T>)
}

// 使用示例
val flow = flow {
    // 生产者代码
    emit(1)
    emit(2)
}.map { it * 2 }  // 转换操作

flow.collect { value ->
    // 消费者代码
    println(value)
}
```

---

## 2. Cold vs Hot Flow

### 2.1 Cold Flow（冷数据流）

```kotlin
// Cold Flow：每次收集都重新执行
val coldFlow = flow {
    println("Starting production...")
    emit(1)
    emit(2)
    emit(3)
}

// 多个收集器
coldFlow.collect { println("Collector 1: $it") }
coldFlow.collect { println("Collector 2: $it") }

// 每个收集器都会重新执行生产者代码
```

### 2.2 Hot Flow（热数据流）

```kotlin
// Hot Flow：独立于收集器运行
val hotFlow = MutableSharedFlow<Int>()

// 发射数据（即使没有收集器）
hotFlow.emit(1)
hotFlow.emit(2)

// 多个收集器共享同一个数据流
hotFlow.collect { println("Collector 1: $it") }
hotFlow.collect { println("Collector 2: $it") }
```

### 2.3 Cold vs Hot 对比

| 特性 | Cold Flow | Hot Flow |
|------|----------|-----|
| 执行时机 | collect 时执行 | 独立执行 |
| 多个收集器 | 各自执行 | 共享执行 |
| 状态保持 | 无状态 | 有状态 |
| 内存占用 | 低 | 较高 |
| 典型类型 | Flow | StateFlow, SharedFlow |

### 2.4 冷流转热流

```kotlin
// 使用 shareIn 将冷流转为热流
val coldFlow = flow {
    println("Producing...")
    emit(1)
    emit(2)
}

// 转为热流
val hotFlow = coldFlow.shareIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5000)
)

// 多个收集器共享
hotFlow.collect { println("1: $it") }
hotFlow.collect { println("2: $it") }
```

### 2.5 使用场景

```kotlin
// Cold Flow 场景
// - 网络请求
// - 数据库查询
// - 文件读取

val apiFlow = flow {
    val data = api.fetchData()
    emit(data)
}

// Hot Flow 场景
// - UI 状态
// - 实时数据
// - 传感器数据

val uiStateFlow = MutableStateFlow<UiState>(UiState.Initial)
```

---

## 3. StateFlow 详解

### 3.1 StateFlow 基础

```kotlin
// StateFlow 是热数据流，保持当前状态
val stateFlow = MutableStateFlow<Int>(0)

// 发射值
stateFlow.value = 1
stateFlow.value = 2

// 收集
stateFlow.collect { value ->
    println("Value: $value")
}
```

### 3.2 StateFlow 特性

```kotlin
// 1. 保存当前状态
val stateFlow = MutableStateFlow<String>("Initial")

// 2. 新收集器立即收到当前值
stateFlow.value = "Updated"
stateFlow.collect { println("Received: $it") }  // 立即收到 "Updated"

// 3. 不可为 null（使用 StateFlow<T>）
// stateFlow.value = null  // 编译错误
```

### 3.3 StateFlow 与 LiveData

```kotlin
// LiveData
val liveData = MutableLiveData<String>()
liveData.value = "Hello"

// StateFlow
val stateFlow = MutableStateFlow<String>("Hello")
stateFlow.value = "World"

// StateFlow 优势
// 1. 更好的空安全
// 2. 支持协程
// 3. 更强大的操作符
```

### 3.4 StateFlow 在 ViewModel 中

```kotlin
class MyViewModel : ViewModel() {
    // 私有可变 StateFlow
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    
    // 公开只读 StateFlow
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val data = repository.fetchData()
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e)
            }
        }
    }
}

// UI 层观察
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is UiState.Loading -> showLoading()
                    is UiState.Success -> showData(state.data)
                    is UiState.Error -> showError(state.error)
                }
            }
        }
    }
}
```

### 3.5 StateFlow 转换

```kotlin
// map 转换
val mappedFlow = stateFlow.map { it * 2 }

// filter 过滤
val filteredFlow = stateFlow.filter { it > 0 }

// flatMap 平铺
val flatMappedFlow = stateFlow.flatMapLatest { id ->
    getUserFlow(id)
}
```

### 3.6 StateFlow 初始值

```kotlin
// 必须提供初始值
val stateFlow = MutableStateFlow<Int>(0)  // 初始值为 0

// 使用 sealed class 初始值
sealed class UiState {
    object Loading : UiState()
    data class Success(val data: Data) : UiState()
    data class Error(val error: String) : UiState()
}

val uiStateFlow = MutableStateFlow<UiState>(UiState.Loading)
```

---

## 4. SharedFlow 详解

### 4.1 SharedFlow 基础

```kotlin
// SharedFlow 是热数据流，不保存历史值
val sharedFlow = MutableSharedFlow<Int>()

// 发射值
sharedFlow.emit(1)
sharedFlow.emit(2)

// 收集（只会收到 emit 后的值）
sharedFlow.collect { println("Received: $it") }
```

### 4.2 SharedFlow 配置

```kotlin
// 配置 SharedFlow
val sharedFlow = MutableSharedFlow<Int>(
    replay = 0,           // 重放值数量（默认 0）
    bufferSize = 0,       // 缓冲区大小（0=CHANNEL_BUFFERED）
    extraBufferHandling = null,  // 额外缓冲区处理
    onBufferOverflow = SharedFlow.BufferOverflow.DROP_LATEST  // 溢出处理
)

// 发射
sharedFlow.emit(1)
sharedFlow.emit(2)
```

### 4.3 SharedFlow 溢出策略

```kotlin
// BufferOverflow.DROP_LATEST - 丢弃最新值（默认）
val dropLatest = MutableSharedFlow<Int>(
    onBufferOverflow = SharedFlow.BufferOverflow.DROP_LATEST
)

// BufferOverflow.DROP_OLDEST - 丢弃最旧值
val dropOldest = MutableSharedFlow<Int>(
    onBufferOverflow = SharedFlow.BufferOverflow.DROP_OLDEST
)

// BufferOverflow.SUSPEND - 挂起发射
val suspendEmit = MutableSharedFlow<Int>(
    onBufferOverflow = SharedFlow.BufferOverflow.SUSPEND
)
```

### 4.4 SharedFlow 重放

```kotlin
// 重放最后 N 个值
val replaySharedFlow = MutableSharedFlow<Int>(
    replay = 3
)

replaySharedFlow.emit(1)
replaySharedFlow.emit(2)
replaySharedFlow.emit(3)

// 新收集器会收到 1, 2, 3
replaySharedFlow.collect { println("Received: $it") }
```

### 4.5 SharedFlow 使用场景

```kotlin
// 场景 1：事件流（不重放）
class MyViewModel : ViewModel() {
    val _event = MutableSharedFlow<UiEvent>()
    val event: SharedFlow<UiEvent> = _event.asSharedFlow()
    
    fun triggerEvent() {
        viewModelScope.launch {
            _event.emit(UiEvent.ShowToast("Done"))
        }
    }
}

// 场景 2：需要重放的流
val configFlow = MutableSharedFlow<Config>(replay = 1)
```

### 4.6 SharedFlow 与 StateFlow 对比

```kotlin
// StateFlow：保存状态，新收集器收到当前值
val stateFlow = MutableStateFlow<String>("Initial")
stateFlow.value = "Updated"
stateFlow.collect { println(it) }  // 输出 "Updated"

// SharedFlow：不保存状态，新收集器只收到新值
val sharedFlow = MutableSharedFlow<String>()
sharedFlow.emit("Initial")
sharedFlow.emit("Updated")
sharedFlow.collect { println(it) }  // 不输出，除非 emit 后收集
```

---

## 5. Flow 转换操作符

### 5.1 map

```kotlin
// map - 转换元素
val flow = flowOf(1, 2, 3, 4, 5)

val mapped = flow.map { it * 2 }
mapped.collect { println(it) }  // 2, 4, 6, 8, 10

// map 带索引
val withIndex = flow.mapIndexed { index, value ->
    "${index}: $value"
}
withIndex.collect { println(it) }  // "0: 1", "1: 2", ...
```

### 5.2 flatMap

```kotlin
// flatMap - 平铺嵌套 Flow
val outerFlow = flowOf(1, 2, 3)

val flatMapped = outerFlow.flatMap { number ->
    flowOf(number, number * 2, number * 3)
}

flatMapped.collect { println(it) }  
// 1, 2, 3, 2, 4, 6, 3, 6, 9
```

### 5.3 flatMapLatest

```kotlin
// flatMapLatest - 取消之前的 Flow，只保留最新的
val searchQueryFlow = MutableSharedFlow<String>()

val resultFlow = searchQueryFlow.flatMapLatest { query ->
    searchApi(query)  // 每次新查询，取消之前的请求
}

resultFlow.collect { println(it) }
```

### 5.4 flatMapConcat

```kotlin
// flatMapConcat - 按顺序执行，不取消之前的
val flow = flowOf(1, 2, 3)

val concatenated = flow.flatMapConcat { number ->
    flow {
        delay(100)
        emit(number * 2)
        delay(100)
        emit(number * 3)
    }
}

concatenated.collect { println(it) }
// 按顺序：2, 3, 4, 6, 6, 9
```

### 5.5 flatMapMerge

```kotlin
// flatMapMerge - 并发执行，合并结果
val flow = flowOf(1, 2, 3)

val merged = flow.flatMapMerge { number ->
    flow {
        delay(number * 100)
        emit(number * 2)
    }
}

merged.collect { println(it) }
// 并发执行，顺序不定
```

### 5.6 combine

```kotlin
// combine - 合并多个 Flow
val flow1 = flowOf(1, 2, 3)
val flow2 = flowOf("a", "b", "c")

val combined = flow1.combine(flow2) { num, str ->
    "$num-$str"
}

combined.collect { println(it) }
// 每次有新值时组合：1-a, 2-b, 3-c
```

### 5.7 zip

```kotlin
// zip - 组合多个 Flow 的元素
val flow1 = flowOf(1, 2, 3)
val flow2 = flowOf("a", "b", "c", "d")

val zipped = flow1.zip(flow2) { num, str ->
    "$num-$str"
}

zipped.collect { println(it) }
// 1-a, 2-b, 3-c（以最短的 Flow 为准）
```

### 5.8 transform

```kotlin
// transform - 转换并可以发射多个值
val flow = flowOf(1, 2, 3)

val transformed = flow.transform { value ->
    emit(value)
    emit(value * 2)
    emit(value * 3)
}

transformed.collect { println(it) }
// 1, 2, 3, 2, 4, 6, 3, 6, 9
```

---

## 6. Flow 过滤操作符

### 6.1 filter

```kotlin
// filter - 过滤元素
val flow = flowOf(1, 2, 3, 4, 5)

val filtered = flow.filter { it > 2 }
filtered.collect { println(it) }  // 3, 4, 5

// filterIndexed
val filteredIndexed = flow.filterIndexed { index, value ->
    index % 2 == 0
}
filteredIndexed.collect { println(it) }  // 1, 3, 5
```

### 6.2 filterNot

```kotlin
// filterNot - 反向过滤
val flow = flowOf(1, 2, 3, 4, 5)

val filteredNot = flow.filterNot { it % 2 == 0 }
filteredNot.collect { println(it) }  // 1, 3, 5
```

### 6.3 filterDistinct

```kotlin
// filterDistinct - 过滤重复值
val flow = flowOf(1, 1, 2, 2, 3, 3)

val distinct = flow.distinctUntilChanged()
distinct.collect { println(it) }  // 1, 2, 3
```

### 6.4 take

```kotlin
// take - 取前 N 个元素
val flow = flowOf(1, 2, 3, 4, 5)

val taken = flow.take(3)
taken.collect { println(it) }  // 1, 2, 3
```

### 6.5 takeWhile

```kotlin
// takeWhile - 取直到条件不满足
val flow = flowOf(1, 2, 3, 4, 5)

val takenWhile = flow.takeWhile { it < 4 }
takenWhile.collect { println(it) }  // 1, 2, 3
```

### 6.6 drop

```kotlin
// drop - 丢弃前 N 个元素
val flow = flowOf(1, 2, 3, 4, 5)

val dropped = flow.drop(2)
dropped.collect { println(it) }  // 3, 4, 5
```

### 6.7 first

```kotlin
// first - 获取第一个元素
val flow = flowOf(1, 2, 3)

val first = flow.first()
println(first)  // 1

// first 带条件
val firstGreater = flow.first { it > 1 }
println(firstGreater)  // 2
```

### 6.8 single

```kotlin
// single - 确保只有一个元素
val singleFlow = flowOf(1)

val single = singleFlow.single()
println(single)  // 1

// 多个元素会抛异常
try {
    flowOf(1, 2).single()  // IllegalArgumentException
} catch (e: Exception) {
    println("Error: ${e.message}")
}
```

### 6.9 skip

```kotlin
// skip - 跳过前 N 个元素（与 drop 相同）
val flow = flowOf(1, 2, 3, 4, 5)

val skipped = flow.skip(2)
skipped.collect { println(it) }  // 3, 4, 5
```

---

## 7. Flow 组合操作符

### 7.1 merge

```kotlin
// merge - 合并多个 Flow
val flow1 = flowOf(1, 2, 3)
val flow2 = flowOf("a", "b", "c")

val merged = flow1.merge(flow2)
merged.collect { println(it) }
// 交错输出：1, a, 2, b, 3, c
```

### 7.2 mergeMany

```kotlin
// mergeMany - 合并嵌套 Flow
val outerFlow = flowOf(
    flowOf(1, 2),
    flowOf(3, 4),
    flowOf(5, 6)
)

val mergedMany = outerFlow.mergeMany()
mergedMany.collect { println(it) }
// 1, 2, 3, 4, 5, 6
```

### 7.3 concat

```kotlin
// concat - 连接多个 Flow
val flow1 = flowOf(1, 2, 3)
val flow2 = flowOf(4, 5, 6)

val concatenated = flow1.concat(flow2)
concatenated.collect { println(it) }
// 1, 2, 3, 4, 5, 6
```

### 7.4 concatMany

```kotlin
// concatMany - 按顺序连接嵌套 Flow
val outerFlow = flowOf(
    flowOf(1, 2),
    flowOf(3, 4),
    flowOf(5, 6)
)

val concatMany = outerFlow.concatMany()
concatMany.collect { println(it) }
// 1, 2, 3, 4, 5, 6（按顺序）
```

### 7.5 onEach

```kotlin
// onEach - 在发射时执行操作
val flow = flowOf(1, 2, 3)

val withSideEffect = flow.onEach { value ->
    println("Emitting: $value")
}

withSideEffect.collect { println("Received: $it") }
```

### 7.6 onStart

```kotlin
// onStart - 在开始收集时执行
val flow = flowOf(1, 2, 3)

val withStart = flow.onStart {
    println("Collection started")
}

withStart.collect { println("Received: $it") }
```

### 7.7 onComplete

```kotlin
// onComplete - 在完成收集时执行
val flow = flowOf(1, 2, 3)

val withComplete = flow.onCompletion { throwable ->
    if (throwable == null) {
        println("Completed normally")
    } else {
        println("Completed with error: $throwable")
    }
}

withComplete.collect { println("Received: $it") }
```

---

## 8. Flow 异常操作符

### 8.1 catch

```kotlin
// catch - 捕获异常
val flow = flow {
    emit(1)
    throw Exception("Error")
    emit(2)  // 不会执行
}

val caught = flow.catch { e ->
    println("Caught: ${e.message}")
    emit(0)  // 发射默认值
}

caught.collect { println("Received: $it") }
```

### 8.2 retry

```kotlin
// retry - 重试失败的操作
val flow = flow {
    attemptCount++
    if (attemptCount < 3) {
        throw Exception("Attempt $attemptCount")
    }
    emit("Success")
}

var attemptCount = 0
val retried = flow.retry(2) { e ->
    println("Retry: ${e.message}")
    true  // 继续重试
}

retried.collect { println("Result: $it") }
```

### 8.3 retryWhen

```kotlin
// retryWhen - 有条件重试
val flow = flow {
    attemptCount++
    if (attemptCount < 3) {
        throw Exception("Attempt $attemptCount")
    }
    emit("Success")
}

var attemptCount = 0
val retryWhenFlow = flow.retryWhen { cause, attempt ->
    if (attempt < 2 && cause is IOException) {
        println("Retry attempt $attempt")
        delay(1000 * (attempt + 1))
        true
    } else {
        false
    }
}
```

### 8.4 handleException

```kotlin
// handleException - 处理异常
val flow = flow {
    emit(1)
    throw Exception("Error")
}

val handled = flow.handleException { e ->
    println("Handled: ${e.message}")
}

handled.collect { println("Received: $it") }
```

---

## 9. Flow 终端操作符

### 9.1 collect

```kotlin
// collect - 终端操作符，开始收集
val flow = flowOf(1, 2, 3)

flow.collect { value ->
    println("Received: $value")
}

// collect 是 suspend 函数
suspend fun processFlow() {
    flow.collect { /* ... */ }
}
```

### 9.2 collectLatest

```kotlin
// collectLatest - 取消之前的收集，只处理最新的
val flow = MutableSharedFlow<Int>()

flow.collectLatest { value ->
    println("Processing: $value")
    delay(1000)
}
```

### 9.3 collectWhile

```kotlin
// collectWhile - 条件收集
val flow = flowOf(1, 2, 3, 4, 5)

flow.collectWhile { value ->
    value < 4
} {
    println("Received: $it")
}
// 1, 2, 3
```

### 9.4 launchIn

```kotlin
// launchIn - 在作用域中自动启动收集
val flow = flowOf(1, 2, 3)

flow.launchIn(viewModelScope) { value ->
    println("Received: $value")
}
```

### 9.5 first

```kotlin
// first - 获取第一个元素
val flow = flowOf(1, 2, 3)

val first = flow.first()
println(first)  // 1

// first 带条件
val firstEven = flow.first { it % 2 == 0 }
println(firstEven)  // 2
```

### 9.6 single

```kotlin
// single - 确保只有一个元素
val singleFlow = flowOf(1)
val single = singleFlow.single()
println(single)  // 1
```

### 9.7 reduce

```kotlin
// reduce - 归约
val flow = flowOf(1, 2, 3, 4, 5)

val sum = flow.reduce { acc, value ->
    acc + value
}
println(sum)  // 15
```

### 9.8 fold

```kotlin
// fold - 带初始值的归约
val flow = flowOf(1, 2, 3, 4, 5)

val sum = flow.fold(0) { acc, value ->
    acc + value
}
println(sum)  // 15
```

---

## 10. Flow 与 LiveData 对比

### 10.1 LiveData 基础

```kotlin
// LiveData
val liveData = MutableLiveData<String>()
liveData.value = "Hello"

// 观察
liveData.observe(lifecycleOwner) { value ->
    println(value)
}
```

### 10.2 Flow 与 LiveData 对比

| 特性 | LiveData | Flow |
|------|----------|------|
| 生命周期感知 | ✅ | 需要 lifecycleScope |
| 线程切换 | ✅ | 需要 withContext |
| 操作符 | 有限 | 丰富 |
| 协程支持 | ❌ | ✅ |
| 空安全 | 一般 | 优秀 |

### 10.3 LiveData 转 Flow

```kotlin
// LiveData 转 Flow
val liveData = MutableLiveData<String>()

val flow = liveData.asFlow()
flow.collect { println(it) }
```

### 10.4 Flow 转 LiveData

```kotlin
// Flow 转 LiveData
val flow = flowOf("Hello", "World")

val liveData = MediatorLiveData<String>().apply {
    sourceFlow = flow.asLiveData()
}
```

### 10.5 使用建议

```kotlin
// 新推荐使用 Flow
// 1. 更好的协程支持
// 2. 更丰富的操作符
// 3. 更好的空安全

// LiveData 仍然有用
// 1. 与现有代码兼容
// 2. 生命周期感知
```

---

## 11. Flow 与 RxJava 对比

### 11.1 RxJava 基础

```kotlin
// RxJava
Observable.create<Int> { emitter ->
    emitter.onNext(1)
    emitter.onNext(2)
    emitter.onNext(3)
}.subscribe {
    println(it)
}
```

### 11.2 Flow 与 RxJava 对比

| 特性 | RxJava | Flow |
|------|--------|------|
| 学习曲线 | 陡峭 | 平缓 |
| 性能 | 高 | 高 |
| 操作符 | 非常丰富 | 足够 |
| 协程集成 | 需要适配 | 原生支持 |
| 调试 | 困难 | 容易 |

### 11.3 Flow 替代 RxJava

```kotlin
// RxJava: map + filter
observable.map { it * 2 }
          .filter { it > 2 }
          .subscribe { println(it) }

// Flow: 相同操作
flow.map { it * 2 }
    .filter { it > 2 }
    .collect { println(it) }
```

### 11.4 RxJava 转 Flow

```kotlin
// Observable 转 Flow
val observable = Observable.fromIterable(listOf(1, 2, 3))

val flow = observable.asFlow()
flow.collect { println(it) }
```

---

## 12. Flow 性能优化

### 12.1 减少不必要的操作

```kotlin
// 优化：减少操作符链
val optimized = flow
    .filter { it > 0 }
    .map { it * 2 }
    .collect { println(it) }

// 避免：嵌套操作符
val unoptimized = flow
    .map { flowOf(it, it * 2) }
    .flatMap { it }
    .collect { println(it) }
```

### 12.2 使用 buffer

```kotlin
// buffer - 缓冲数据
val flow = flowOf(1, 2, 3, 4, 5)

val buffered = flow.buffer(10)
buffered.collect { println(it) }
```

### 12.3 使用 flowOn

```kotlin
// flowOn - 指定生产者线程
val flow = flowOf(1, 2, 3)

val withFlowOn = flow
    .flowOn(Dispatchers.IO)
    .map { it * 2 }
    .flowOn(Dispatchers.Default)
    .collect { println(it) }
```

### 12.4 缓存

```kotlin
// 缓存 Flow 结果
val cachedFlow = flow.cache(3)
```

---

## 13. 最佳实践

### 13.1 命名规范

```kotlin
// Flow 命名
val userFlow: Flow<User>
val uiStateFlow: StateFlow<UiState>
val eventFlow: SharedFlow<UiEvent>
```

### 13.2 错误处理

```kotlin
// 错误处理
val flow = flow {
    try {
        emit(fetchData())
    } catch (e: Exception) {
        emit(DefaultData)
    }
}
```

### 13.3 测试

```kotlin
// 测试 Flow
@Test
fun testFlow() = runTest {
    val flow = flowOf(1, 2, 3)
    val result = flow.toList()
    assertEquals(listOf(1, 2, 3), result)
}
```

---

## 14. 面试考点

### 14.1 基础考点

#### Q1: Flow 是什么？它与 LiveData 的区别？

**A:**
- Flow 是冷数据流，需要收集才执行
- LiveData 是生命周期感知数据持有者
- Flow 支持协程，LiveData 不支持

#### Q2: StateFlow 和 SharedFlow 的区别？

**A:**
- StateFlow 保存当前状态，新收集器收到当前值
- SharedFlow 不保存状态，新收集器只收到新值

#### Q3: Cold Flow 和 Hot Flow 的区别？

**A:**
- Cold Flow：每次收集都重新执行
- Hot Flow：独立于收集器运行

### 14.2 进阶考点

#### Q4: flatMapLatest 的用途？

**A:**
- 用于搜索场景，取消之前的请求
- 只保留最新的 Flow

#### Q5: 如何实现 Flow 的重试？

**A:**
```kotlin
flow.retry(3) { e -> true }
```

### 14.3 高级考点

#### Q6: Flow 的背压处理？

**A:**
- 使用 SharedFlow 的 onBufferOverflow
- 使用 buffer 操作符

#### Q7: 如何优化 Flow 性能？

**A:**
- 减少操作符链
- 使用 flowOn 指定线程
- 使用缓存

---

## 总结

Kotlin Flow 是响应式编程的强大工具，提供了丰富的操作符和协程支持。掌握 Flow 的基础概念、冷热流区别、StateFlow/SharedFlow、操作符使用和性能优化，对于构建现代化的 Android 应用至关重要。

核心要点：
1. **冷数据流** - Flow 是冷的
2. **StateFlow vs SharedFlow** - 状态 vs 事件
3. **操作符** - 丰富的转换和过滤
4. **错误处理** - catch 和 retry
5. **性能优化** - 合理设计