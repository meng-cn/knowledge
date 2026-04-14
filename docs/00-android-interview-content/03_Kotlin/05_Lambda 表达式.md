# Kotlin Lambda 表达式详解 🎯

> Android 面试必考 Kotlin Lambda 表达式，包含 Lambda 语法、匿名函数、接收者的 Lambda、Lambda 捕获、性能优化等核心知识点

---

## 目录

1. [Lambda 语法](#1-lambda-语法)
2. [Lambda 与匿名函数](#2-lambda-与匿名函数)
3. [接收者的 Lambda](#3-接收者的-lambda)
4. [Lambda 捕获](#4-lambda-捕获)
5. [Lambda 性能](#5-lambda-性能)
6. [面试考点汇总](#6-面试考点汇总)

---

## 1. Lambda 语法

### 1.1 基础语法

Lambda 表达式是匿名函数的简洁表示形式：

```kotlin
// 完整语法：{ 参数 -> 函数体 }
val sum = { a: Int, b: Int -> a + b }

// 类型推断（推荐）
val sum: (Int, Int) -> Int = { a, b -> a + b }

// 单个参数可以使用 it（省略参数声明）
val double: (Int) -> Int = { it * 2 }

// 无参数
val greet: () -> String = { "Hello" }

// 无返回值
val printHello: () -> Unit = { println("Hello") }

// 多行 Lambda
val complex = { x: Int, y: Int ->
    val sum = x + y
    val product = x * y
    sum + product  // 最后一行是返回值
}
```

### 1.2 Lambda 的参数

```kotlin
// 多个参数
val sum: (Int, Int) -> Int = { a, b -> a + b }

// 带类型声明
val sum2 = { a: Int, b: Int -> a + b }

// 使用 it（单个参数）
val numbers = listOf(1, 2, 3)
numbers.forEach { println(it) }

// 自定义参数名（更清晰）
numbers.forEach { number ->
    println("Number: $number")
}

// 多个参数必须命名
val pairs = listOf(1 to "a", 2 to "b")
pairs.forEach { (num, str) ->
    println("$num: $str")
}

// 忽略不需要的参数
listOf(1, 2, 3).forEach { _ ->
    println("Item")
}
```

### 1.3 Lambda 的返回值

```kotlin
// 隐式返回（最后一行）
val sum: (Int, Int) -> Int = { a, b ->
    a + b  // 自动返回
}

// 显式返回
val sum2: (Int, Int) -> Int = { a, b ->
    return@sum2 a + b
}

// 带标签的返回（用于嵌套 Lambda）
fun nestedExample() {
    val list = listOf(1, 2, 3)
    
    list.forEach {
        if (it == 2) {
            return@forEach  // 只返回当前 Lambda
        }
        println(it)
    }
    
    println("Done")  // 会继续执行
}

// 从外部函数返回（需要 inline）
inline fun <T> List<T>.findAndReturn(predicate: (T) -> Boolean): T? {
    for (element in this) {
        if (predicate(element)) {
            return element  // 非局部返回
        }
    }
    return null
}
```

### 1.4 Lambda 作为参数

```kotlin
// 尾随 Lambda（最后一个参数是函数）
fun <T> List<T>.customMap(transform: (T) -> Int): List<Int> {
    return this.map(transform)
}

// 调用 - Lambda 放在括号外
val numbers = listOf(1, 2, 3)
val result = numbers.customMap {
    it * 2
}

// 只有 Lambda 参数时，括号可以省略
fun runBlock(block: () -> Unit) {
    block()
}

// 调用
runBlock {
    println("Hello")
}

// 多个参数时
fun <T> List<T>.process(
    prefix: String,
    transform: (T) -> String
): List<String> {
    return this.map { "$prefix${transform(it)}" }
}

// 调用
val result = numbers.process("Number: ") {
    it.toString()
}
```

### 1.5 Lambda 的类型推断

```kotlin
// 上下文类型推断
val sum: (Int, Int) -> Int = { a, b -> a + b }

// 作为参数时推断
fun operate(a: Int, b: Int, operation: (Int, Int) -> Int): Int {
    return operation(a, b)
}

operate(3, 4) { a, b -> a + b }  // 推断为 (Int, Int) -> Int

// 返回值推断
fun getOperation(): (Int, Int) -> Int {
    return { a, b -> a + b }  // 推断返回类型
}

// 属性推断
class Calculator {
    var operation: (Int, Int) -> Int = { a, b -> a + b }
}
```

### 1.6 Lambda 的实际应用

```kotlin
// 1. 集合操作
val numbers = listOf(1, 2, 3, 4, 5)

numbers.filter { it % 2 == 0 }      // [2, 4]
numbers.map { it * 2 }              // [2, 4, 6, 8, 10]
numbers.reduce { acc, num -> acc + num }  // 15

// 2. 回调函数
class Button {
    var onClick: (() -> Unit)? = null
    
    fun click() {
        onClick?.invoke()
    }
}

val button = Button()
button.onClick = {
    println("Button clicked!")
}

// 3. 协程
lifecycleScope.launch {
    val result = withContext(Dispatchers.IO) {
        // Lambda 中的代码在 IO 线程执行
        api.loadData()
    }
    // 回到主线程
    updateUI(result)
}

// 4. 作用域函数
val person = Person().apply {
    name = "张三"
    age = 25
}

person.let {
    println("Name: ${it.name}")
}

person.run {
    println("Age: $age")
}
```

---

## 2. Lambda 与匿名函数

### 2.1 Lambda 表达式

```kotlin
// Lambda 表达式
val sum = { a: Int, b: Int -> a + b }

// 简洁，但不能指定返回类型
// 返回值由最后一行推断

// 不能从 Lambda 中非局部返回（除非 inline）
fun example() {
    listOf(1, 2, 3).forEach {
        if (it == 2) {
            // return  // ❌ 错误：不能从 Lambda 返回
            return@forEach  // ✅ 正确：从 Lambda 返回
        }
    }
}
```

### 2.2 匿名函数

```kotlin
// 匿名函数语法
val sum = fun(a: Int, b: Int): Int {
    return a + b
}

// 可以指定返回类型
val divide = fun(a: Int, b: Int): Double {
    return a.toDouble() / b
}

// 匿名函数可以非局部返回
fun example() {
    listOf(1, 2, 3).forEach(fun(value) {
        if (value == 2) {
            return  // ✅ 正确：从匿名函数返回，不是从 example 返回
        }
        println(value)
    })
}

// 带接收者的匿名函数
val block: StringBuilder.() -> Unit = fun() {
    this.append("Hello")  // this 是 StringBuilder
    append(" World")      // this 可以省略
}
```

### 2.3 Lambda vs 匿名函数对比

```kotlin
// Lambda 表达式
val lambda = { x: Int -> x * 2 }

// 匿名函数
val anonymous = fun(x: Int): Int { return x * 2 }

// 对比：
// 1. Lambda 更简洁，匿名函数更明确
// 2. Lambda 返回类型由推断，匿名函数可以显式指定
// 3. Lambda 在 inline 函数中可以非局部返回
// 4. 匿名函数的 return 只从匿名函数本身返回

// 使用场景：
// - 优先使用 Lambda（简洁）
// - 需要显式返回类型时使用匿名函数
// - 需要明确 return 行为时使用匿名函数
```

### 2.4 带接收者的函数类型

```kotlin
// Lambda 形式
val block1: StringBuilder.() -> Unit = {
    append("Hello")  // this 是 StringBuilder
}

// 匿名函数形式
val block2: StringBuilder.() -> Unit = fun() {
    this.append("Hello")
}

// 使用
val sb = StringBuilder()
sb.block1()
sb.block2()

// 实际应用：DSL 构建器
class Dialog {
    var title: String = ""
    var message: String = ""
}

fun dialog(configure: Dialog.() -> Unit): Dialog {
    return Dialog().apply(configure)
}

// 使用
dialog {
    title = "提示"
    message = "确定吗？"
}
```

### 2.5 函数引用

```kotlin
// 函数引用是 Lambda 的另一种形式
fun add(a: Int, b: Int): Int = a + b

val sum = ::add  // 函数引用

// 调用
val result = sum(3, 4)  // 7

// 方法引用
class Calculator {
    fun add(a: Int, b: Int): Int = a + b
}

val calc = Calculator()
val sum2 = calc::add

// 构造函数引用
val createList = ::ArrayList
val list = createList<Int>()

// 属性引用
class User(val name: String)
val user = User("张三")
val getName = User::name
val nameValue = getName.get(user)  // "张三"
```

---

## 3. 接收者的 Lambda

### 3.1 带接收者的函数类型

```kotlin
// 语法：接收者类型。(参数) -> 返回类型
val block: StringBuilder.() -> Unit = {
    append("Hello")  // this 是 StringBuilder
    append(" ")
    append("World")
}

// 使用
val sb = StringBuilder()
sb.block()  // 在 StringBuilder 的上下文中执行
println(sb.toString())  // "Hello World"

// 显式使用 this
val block2: StringBuilder.() -> Unit = {
    this.append("Hello")  // 显式 this
}
```

### 3.2 标准库中的接收者 Lambda

```kotlin
// let - 接收者是 it
val result = "Kotlin".let {
    it.uppercase()  // it 是 String
}

// run - 接收者是 this
val result2 = "Kotlin".run {
    this.uppercase()  // this 是 String
    length            // 返回最后一行
}

// with - 接收者是 this（不是扩展函数）
val result3 = with(StringBuilder()) {
    append("Hello")
    append(" World")
    toString()
}

// apply - 接收者是 this，返回 this
val sb = StringBuilder().apply {
    append("Hello")
    append(" World")
}  // sb 是 StringBuilder

// also - 接收者是 it，返回 this
val sb2 = StringBuilder().also {
    it.append("Hello")
}  // sb2 是 StringBuilder
```

### 3.3 创建 DSL

```kotlin
// HTML 构建器 DSL
interface Element {
    fun render(): String
}

class Tag(val name: String, val children: MutableList<Element> = mutableListOf()) : Element {
    override fun render(): String {
        return "<$name>${children.joinToString("") { it.render() }}</$name>"
    }
}

class Text(val text: String) : Element {
    override fun render(): String = text
}

fun tag(name: String, init: Tag.() -> Unit = {}): Tag {
    val tag = Tag(name)
    tag.init()
    return tag
}

fun text(text: String): Text = Text(text)

fun Tag.child(element: Element) {
    children.add(element)
}

// 使用
val html = tag("html") {
    child(tag("body") {
        child(tag("h1") {
            child(text("Hello DSL"))
        })
        child(tag("p") {
            child(text("This is a DSL example"))
        })
    })
}

println(html.render())
// <html><body><h1>Hello DSL</h1><p>This is a DSL example</p></body></html>
```

### 3.4 类型安全的构建器

```kotlin
// 配置 DSL
class DatabaseConfig {
    var host: String = "localhost"
    var port: Int = 5432
    var username: String = ""
    var password: String = ""
    var database: String = ""
    
    fun validate() {
        require(username.isNotEmpty()) { "Username is required" }
        require(password.isNotEmpty()) { "Password is required" }
        require(database.isNotEmpty()) { "Database is required" }
    }
}

fun database(init: DatabaseConfig.() -> Unit): DatabaseConfig {
    val config = DatabaseConfig()
    config.init()
    config.validate()
    return config
}

// 使用
val dbConfig = database {
    host = "192.168.1.100"
    port = 5432
    username = "admin"
    password = "secret"
    database = "mydb"
}

// 嵌套 DSL
class Server {
    var host: String = ""
    var port: Int = 0
    val endpoints = mutableListOf<String>()
    
    fun endpoint(path: String, init: EndpointConfig.() -> Unit) {
        val config = EndpointConfig(path)
        config.init()
        endpoints.add(config.path)
    }
}

class EndpointConfig(val path: String) {
    var method: String = "GET"
    var timeout: Long = 5000
}

fun server(init: Server.() -> Unit): Server {
    val server = Server()
    server.init()
    return server
}

// 使用
val serverConfig = server {
    host = "localhost"
    port = 8080
    endpoint("/api/users") {
        method = "GET"
        timeout = 3000
    }
    endpoint("/api/posts") {
        method = "POST"
    }
}
```

### 3.5 作用域函数对比

```kotlin
val person = Person("张三", 25)

// let - 对象为 it，返回 Lambda 结果
val nameLength = person.let {
    it.name.length  // 返回 Int
}

// run - 对象为 this，返回 Lambda 结果
val nameLength2 = person.run {
    name.length  // 返回 Int
}

// with - 对象为 this，返回 Lambda 结果（不是扩展函数）
val nameLength3 = with(person) {
    name.length  // 返回 Int
}

// apply - 对象为 this，返回对象本身
val person2 = Person("李四", 30).apply {
    age = 31  // 修改属性
}  // 返回 Person

// also - 对象为 it，返回对象本身
val person3 = Person("王五", 35).also {
    println("Created: ${it.name}")  // 副作用
}  // 返回 Person
```

---

## 4. Lambda 捕获

### 4.1 捕获外部变量

```kotlin
// Lambda 可以捕获外部变量
fun createCounter(): () -> Int {
    var count = 0  // 被捕获的变量
    return {
        count++
        count
    }
}

// 使用
val counter = createCounter()
println(counter())  // 1
println(counter())  // 2
println(counter())  // 3

// 捕获的变量是闭包的一部分
// 即使外部函数返回，变量仍然存在
```

### 4.2 捕获 this

```kotlin
// 捕获外部类的 this
class Outer {
    private val value = "Outer"
    
    fun getPrinter(): () -> Unit {
        return {
            println(value)  // 捕获 Outer 的 value
        }
    }
}

// 内层类的 this 捕获
class Outer2 {
    val value = "Outer"
    
    inner class Inner {
        val value = "Inner"
        
        fun print() {
            val block: () -> Unit = {
                println(value)           // Inner.value（最近的 this）
                println(this@Inner.value) // 明确指定 Inner 的 this
                println(this@Outer2.value) // 明确指定 Outer2 的 this
            }
            block()
        }
    }
}
```

### 4.3 捕获可变变量

```kotlin
// 捕获的可变变量必须是 effectively final（Java 8+）
// Kotlin 中可以直接捕获 var

var count = 0
val increment = {
    count++  // 可以修改捕获的 var
}

increment()
println(count)  // 1

// 注意：多个 Lambda 捕获同一个 var
var shared = 0
val inc = { shared++ }
val dec = { shared-- }

inc()
inc()
dec()
println(shared)  // 1
```

### 4.4 捕获的性能考虑

```kotlin
// 捕获变量会创建闭包对象
// 每次捕获都会增加内存开销

// ❌ 避免：在循环中创建捕获 Lambda
fun badExample() {
    val results = mutableListOf<() -> Int>()
    for (i in 1..10) {
        results.add { i }  // 每个 Lambda 都捕获 i
    }
}

// ✅ 推荐：避免不必要的捕获
fun goodExample() {
    val results = mutableListOf<Int>()
    for (i in 1..10) {
        results.add(i)  // 直接存储值
    }
}

// 捕获 this 的开销
class MyClass {
    private val data = LargeObject()
    
    fun getPrinter(): () -> Unit {
        return {
            println(data)  // 捕获 this，持有 data 引用
        }
    }
}

// 可能导致内存泄漏
// 如果 Lambda 的生命周期比 MyClass 长
```

### 4.5 捕获与内存泄漏

```kotlin
// Android 中的内存泄漏示例
class MyActivity : AppCompatActivity() {
    private var callback: (() -> Unit)? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // ❌ 错误：Lambda 捕获 this（Activity）
        callback = {
            // 使用 Activity 的成员
            findViewById<View>(R.id.view)
        }
        
        // 如果 callback 的生命周期比 Activity 长
        // 会导致 Activity 无法被 GC
    }
    
    override fun onDestroy() {
        super.onDestroy()
        callback = null  // 释放引用
    }
}

// ✅ 正确做法
class MyActivity2 : AppCompatActivity() {
    private var callback: (() -> Unit)? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 使用 WeakReference
        val weakRef = WeakReference(this)
        callback = {
            weakRef.get()?.findViewById<View>(R.id.view)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        callback = null
    }
}

// ✅ 使用 Lifecycle 感知
class MyActivity3 : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            // 协程自动感知生命周期
            // Activity 销毁时自动取消
            delay(1000)
            // 安全使用 Activity
        }
    }
}
```

### 4.6 捕获最佳实践

```kotlin
// 1. 最小化捕获
class DataProcessor {
    private val config = Config()
    
    // ❌ 捕获整个 this
    val process: (String) -> String = { data ->
        config.process(data)
    }
    
    // ✅ 只捕获需要的
    val process2: (String) -> String = { data ->
        config.process(data)
    }
}

// 2. 避免循环引用
class MyClass {
    var callback: (() -> Unit)? = null
    
    fun setup() {
        // ❌ 循环引用：this 持有 callback，callback 捕获 this
        callback = {
            doSomething()
        }
    }
    
    // ✅ 使用 WeakReference
    fun setup2() {
        val weakRef = WeakReference(this)
        callback = {
            weakRef.get()?.doSomething()
        }
    }
}

// 3. 及时清理
class MyViewModel : ViewModel() {
    private var listener: ((String) -> Unit)? = null
    
    fun setListener(listener: (String) -> Unit) {
        this.listener = listener
    }
    
    override fun onCleared() {
        super.onCleared()
        listener = null  // 清理回调
    }
}
```

---

## 5. Lambda 性能

### 5.1 Lambda 的对象创建

```kotlin
// Lambda 会创建函数对象
// 每次调用都会创建新对象（除非内联）

// 普通 Lambda
fun example() {
    val list = listOf(1, 2, 3)
    list.forEach { println(it) }
    // 1. 创建 Lambda 对象
    // 2. 调用 forEach 方法
    // 3. 在循环中调用 Lambda
}

// 内联 Lambda
inline fun <T> List<T>.forEach(action: (T) -> Unit) {
    for (element in this) action(element)
}

// 内联后直接展开
for (element in this) {
    println(element)  // 没有 Lambda 对象创建
}
```

### 5.2 内联优化

```kotlin
// inline 关键字消除 Lambda 开销
inline fun <T, R> List<T>.map(transform: (T) -> R): List<R> {
    val result = ArrayList<R>(size)
    for (item in this) {
        result.add(transform(item))  // 内联展开
    }
    return result
}

// 使用
val result = listOf(1, 2, 3).map {
    it * 2  // 直接展开为 result.add(item * 2)
}

// noinline：禁止特定 Lambda 内联
inline fun test(
    inlineParam: () -> Unit,
    noinline noInlineParam: () -> Unit
) {
    inlineParam()  // 内联
    executeLater(noInlineParam)  // 不内联，可以作为对象传递
}

fun executeLater(action: () -> Unit) {
    // 延迟执行
    action()
}
```

### 5.3 装箱开销

```kotlin
// 基本类型的 Lambda 参数会装箱
val list = listOf(1, 2, 3)  // List<Int>，Int 装箱为 Integer

list.forEach {
    println(it)  // it 是 Integer（装箱）
}

// 使用原始类型数组避免装箱
val array = intArrayOf(1, 2, 3)  // IntArray

array.forEach {
    println(it)  // it 是 int（原始类型）
}

// 自定义内联函数避免装箱
inline fun IntArray.forEach(action: (Int) -> Unit) {
    for (i in this.indices) {
        action(this[i])  // 没有装箱
    }
}
```

### 5.4 性能对比

```kotlin
// 性能测试
fun performanceTest() {
    val list = (1..10000).toList()
    
    // 1. 普通 for 循环（最快）
    var sum1 = 0
    for (item in list) {
        sum1 += item
    }
    
    // 2. 内联 forEach（接近 for 循环）
    var sum2 = 0
    list.forEach {
        sum2 += it
    }
    
    // 3. 非内联 map + sum（较慢）
    val sum3 = list.map { it * 2 }.sum()
    
    // 4. 序列（惰性求值，适合大数据）
    val sum4 = list.asSequence()
        .filter { it % 2 == 0 }
        .map { it * 2 }
        .sum()
}

// 建议：
// - 简单遍历使用 for 循环或内联 forEach
// - 复杂链式操作使用序列（Sequence）
// - 避免在循环中创建对象
```

### 5.5 序列优化

```kotlin
// 序列：惰性求值，避免中间集合
val list = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

// List：立即求值，创建中间集合
val result1 = list
    .filter {
        println("Filter: $it")
        it % 2 == 0
    }
    .map {
        println("Map: $it")
        it * 2
    }
    .take(2)
// 所有元素都经过 filter 和 map，即使只取 2 个

// Sequence：惰性求值，不创建中间集合
val result2 = list.asSequence()
    .filter {
        println("Filter: $it")
        it % 2 == 0
    }
    .map {
        println("Map: $it")
        it * 2
    }
    .take(2)
    .toList()
// 只处理需要的元素

// 使用场景：
// - 大数据集使用 Sequence
// - 短链式操作使用 List
// - 需要多次遍历使用 List
```

### 5.6 性能最佳实践

```kotlin
// 1. 使用内联函数
inline fun <T> List<T>.forEach(action: (T) -> Unit)

// 2. 避免在循环中创建 Lambda
// ❌ 不好
for (i in 1..100) {
    list.filter { it == i }  // 每次创建 Lambda
}

// ✅ 好
val filters = (1..100).map { i ->
    list.filter { it == i }
}

// 3. 使用序列处理大数据
largeList.asSequence()
    .filter { it > 0 }
    .map { it * 2 }
    .take(10)
    .toList()

// 4. 避免不必要的装箱
val array = intArrayOf(1, 2, 3)
array.forEach { println(it) }  // 没有装箱

// 5. 使用合适的集合操作
// ❌ 不好：创建中间集合
val result = list.filter { it > 0 }.map { it * 2 }

// ✅ 好：单次遍历
val result = list.mapNotNull {
    if (it > 0) it * 2 else null
}
```

---

## 6. 面试考点汇总

### 6.1 基础问题

**Q1: Lambda 表达式的语法是什么？**

```kotlin
// 答案要点：
// 1. { 参数 -> 函数体 }
// 2. 单个参数可以用 it
// 3. 类型可以推断
// 4. 最后一行是返回值

// 完整语法
val sum = { a: Int, b: Int -> a + b }

// 类型推断
val sum: (Int, Int) -> Int = { a, b -> a + b }

// 单个参数
val double: (Int) -> Int = { it * 2 }

// 多行 Lambda
val complex = { x: Int ->
    val result = x * 2
    result + 1  // 返回值
}
```

**Q2: Lambda 和匿名函数的区别？**

```kotlin
// 答案要点：
// 1. Lambda 更简洁，匿名函数更明确
// 2. Lambda 返回类型由推断，匿名函数可以显式指定
// 3. Lambda 在 inline 函数中可以非局部返回
// 4. 匿名函数的 return 只从匿名函数本身返回

// Lambda
val lambda = { x: Int -> x * 2 }

// 匿名函数
val anonymous = fun(x: Int): Int { return x * 2 }
```

**Q3: 什么是尾随 Lambda？**

```kotlin
// 答案要点：
// 1. 最后一个参数是函数时可以放在括号外
// 2. 如果只有 Lambda 参数，括号可以省略
// 3. 提高代码可读性

// 尾随 Lambda
list.map { it * 2 }

// 只有 Lambda 参数
run {
    println("Hello")
}

// 多个参数
list.fold(0) { acc, num ->
    acc + num
}
```

### 6.2 进阶问题

**Q4: Lambda 如何捕获外部变量？**

```kotlin
// 答案要点：
// 1. Lambda 可以捕获外部作用域的变量
// 2. 捕获的变量形成闭包
// 3. 可以捕获 var 并修改
// 4. 注意内存泄漏风险

// 捕获示例
fun createCounter(): () -> Int {
    var count = 0
    return {
        count++
        count
    }
}

val counter = createCounter()
println(counter())  // 1, 2, 3...
```

**Q5: 带接收者的 Lambda 如何使用？**

```kotlin
// 答案要点：
// 1. 函数类型：Receiver.(Params) -> Return
// 2. Lambda 内 this 指向接收者
// 3. 用于 DSL 和作用域函数
// 4. 标准库：let、run、with、apply、also

// 定义
val block: StringBuilder.() -> Unit = {
    append("Hello")  // this 是 StringBuilder
}

// 使用
val sb = StringBuilder()
sb.block()

// 作用域函数
person.let { it.name }
person.run { name }
```

**Q6: inline 关键字的作用？**

```kotlin
// 答案要点：
// 1. 将 Lambda 代码内联到调用处
// 2. 避免 Lambda 对象创建开销
// 3. 支持非局部返回
// 4. 需要 reified 时使用

inline fun <T> List<T>.forEach(action: (T) -> Unit) {
    for (element in this) action(element)
}

// 内联后直接展开
for (element in this) {
    println(element)
}
```

### 6.3 原理问题

**Q7: Lambda 的性能开销？**

```kotlin
// 答案要点：
// 1. Lambda 会创建函数对象
// 2. 有分配和 GC 开销
// 3. 使用 inline 可以消除开销
// 4. 基本类型参数注意装箱

// 普通 Lambda
list.forEach { println(it) }
// 1. 创建 Lambda 对象
// 2. 调用 forEach
// 3. 调用 Lambda

// 内联 Lambda
inline fun <T> List<T>.forEach(action: (T) -> Unit)
// 直接展开，无对象创建
```

**Q8: 闭包的实现原理？**

```kotlin
// 答案要点：
// 1. Lambda 捕获外部变量形成闭包
// 2. 捕获的变量存储在 Lambda 对象中
// 3. 即使外部函数返回，变量仍然存在
// 4. 可变变量需要特殊处理

// 闭包示例
fun createCounter(): () -> Int {
    var count = 0  // 被捕获
    return { count++ }
}
// count 存储在 Lambda 对象中
// 即使 createCounter 返回，count 仍然存在
```

### 6.4 实战问题

**Q9: 如何避免 Lambda 导致的内存泄漏？**

```kotlin
// 答案要点：
// 1. 注意 Lambda 捕获 this
// 2. 使用 WeakReference
// 3. 及时清理回调引用
// 4. 使用 Lifecycle 感知组件

// Android 示例
class MyActivity : AppCompatActivity() {
    private var callback: (() -> Unit)? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 使用 WeakReference
        val weakRef = WeakReference(this)
        callback = {
            weakRef.get()?.findViewById<View>(R.id.view)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        callback = null  // 清理
    }
}
```

**Q10: 如何使用 Lambda 创建 DSL？**

```kotlin
// 答案要点：
// 1. 使用带接收者的 Lambda
// 2. 使用 apply/scope 函数
// 3. 提供清晰的配置 API
// 4. 返回构建的对象

// DSL 示例
class Dialog {
    var title: String = ""
    var message: String = ""
}

fun dialog(configure: Dialog.() -> Unit): Dialog {
    return Dialog().apply(configure)
}

// 使用
dialog {
    title = "提示"
    message = "确定吗？"
}
```

**Q11: 标准库中有哪些作用域函数？**

```kotlin
// 答案要点：
// 1. let - 对象为 it，返回 Lambda 结果
// 2. run - 对象为 this，返回 Lambda 结果
// 3. with - 对象为 this，返回 Lambda 结果（非扩展）
// 4. apply - 对象为 this，返回对象本身
// 5. also - 对象为 it，返回对象本身

val person = Person("张三", 25)

person.let { it.name }           // it 是 Person
person.run { name }              // this 是 Person
with(person) { name }            // this 是 Person
person.apply { age = 26 }        // 返回 Person
person.also { println(it) }      // 返回 Person
```

---

## 最佳实践总结

### ✅ 推荐做法

```kotlin
// 1. 使用简洁的 Lambda 语法
list.map { it * 2 }

// 2. 使用尾随 Lambda
list.fold(0) { acc, num ->
    acc + num
}

// 3. 使用内联函数
inline fun <T> List<T>.forEach(action: (T) -> Unit)

// 4. 清晰命名 Lambda 参数
list.map { number -> number * 2 }

// 5. 使用作用域函数
person.let { println(it.name) }
```

### ❌ 避免做法

```kotlin
// 1. 避免过长的 Lambda
list.map {
    // 几十行代码
}

// 2. 避免嵌套过深
list.map { x ->
    list2.map { y ->
        list3.map { z ->
            // ...
        }
    }
}

// 3. 避免内存泄漏
// Lambda 捕获 this 时要注意生命周期

// 4. 避免不必要的装箱
// 使用原始类型数组
```

---

## 参考资料

- [Kotlin 官方文档 - Lambda 表达式](https://kotlinlang.org/docs/lambdas.html)
- [Kotlin 内联函数](https://kotlinlang.org/docs/inline-functions.html)
- [Kotlin 作用域函数](https://kotlinlang.org/docs/scope-functions.html)

---

*最后更新：2026-04-14*
