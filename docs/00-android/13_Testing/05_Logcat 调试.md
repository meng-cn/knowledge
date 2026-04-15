# Logcat 调试技巧

> **字数统计：约 6000 字**  
> **难度等级：⭐⭐**  
> **面试重要度：⭐⭐⭐**

---

## 目录

1. [Logcat 基础](#1-logcat-基础)
2. [日志级别](#2-日志级别)
3. [过滤与搜索](#3-过滤与搜索)
4. [实战技巧](#4-实战技巧)
5. [最佳实践](#5-最佳实践)
6. [面试考点](#6-面试考点)

---

## 1. Logcat 基础

### 1.1 什么是 Logcat

```
Logcat 是 Android 的日志系统：
- 记录系统和应用日志
- 实时查看应用行为
- 调试和排查问题
- 性能分析
```

### 1.2 查看 Logcat

```bash
# Android Studio
# View → Tool Windows → Logcat

# 命令行
adb logcat

# 实时查看
adb logcat -v time

# 保存日志
adb logcat -d > log.txt

# 清空日志
adb logcat -c
```

---

## 2. 日志级别

### 2.1 日志级别说明

```kotlin
import android.util.Log

class LoggingExample {
    
    companion object {
        private const val TAG = "MyApp"
    }
    
    // Verbose - 最详细，生产环境关闭
    fun verbose() {
        Log.v(TAG, "Verbose message")
    }
    
    // Debug - 调试信息，生产环境关闭
    fun debug() {
        Log.d(TAG, "Debug message")
    }
    
    // Info - 一般信息
    fun info() {
        Log.i(TAG, "Info message")
    }
    
    // Warning - 警告，可能有问题
    fun warning() {
        Log.w(TAG, "Warning message")
    }
    
    // Error - 错误，需要关注
    fun error() {
        Log.e(TAG, "Error message", Exception("Stack trace"))
    }
    
    // Wtf - What a Terrible Failure，严重错误
    fun wtf() {
        Log.wtf(TAG, "This should never happen")
    }
}
```

### 2.2 日志级别过滤

```bash
# 只显示 Error 及以上
adb logcat *:E

# 只显示 Warning 及以上
adb logcat *:W

# 只显示特定 TAG
adb logcat MyApp:I

# 多个 TAG
adb logcat MyApp:I OtherApp:D *:S

# 显示所有
adb logcat *:V
```

---

## 3. 过滤与搜索

### 3.1 按 TAG 过滤

```bash
# 单个 TAG
adb logcat -s "MyApp"

# 多个 TAG
adb logcat -s "MyApp" "OtherApp"

# TAG + 级别
adb logcat MyApp:I OtherApp:D *:S
```

### 3.2 按进程过滤

```bash
# 获取进程 PID
adb shell ps | grep com.example.app

# 按 PID 过滤
adb logcat --pid=1234

# 按包名过滤
adb logcat --pid=$(adb shell pidof com.example.app)
```

### 3.3 按时间过滤

```bash
# 显示时间戳
adb logcat -v time

# 显示日期时间
adb logcat -v threadtime

# 显示可机器读取的时间
adb logcat -v threadtime

# 只显示最近 100 行
adb logcat -t 100

# 只显示最近 1 分钟
adb logcat -T "01-01 12:00:00.000"
```

### 3.4 关键词搜索

```bash
# 包含关键词
adb logcat | grep "NullPointerException"

# 排除关键词
adb logcat | grep -v "Choreographer"

# 正则匹配
adb logcat | grep -E "Error|Exception"

# 高亮显示
adb logcat | grep --color=always "Error"
```

---

## 4. 实战技巧

### 4.1 崩溃排查

```bash
# 查找崩溃
adb logcat | grep "FATAL"

# 查找异常
adb logcat | grep "Exception"

# 查找 ANR
adb logcat | grep "ANR"

# 查看崩溃堆栈
adb logcat -d | grep -A 50 "Caused by"
```

```kotlin
// 捕获未处理异常
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e("CrashHandler", "Uncaught exception", throwable)
            // 保存崩溃日志
            saveCrashLog(throwable)
        }
    }
    
    private fun saveCrashLog(throwable: Throwable) {
        val writer = PrintWriter(File(cacheDir, "crash.log"))
        throwable.printStackTrace(writer)
        writer.close()
    }
}
```

### 4.2 网络调试

```kotlin
// OkHttp 日志拦截器
class NetworkLogging {
    
    private val loggingInterceptor = HttpLoggingInterceptor { message ->
        Log.d("OkHttp", message)
    }.apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val client = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .build()
}
```

```bash
# 查看网络日志
adb logcat -s "OkHttp"

# 查看 HTTP 错误
adb logcat | grep "HTTP"
```

### 4.3 性能分析

```kotlin
// 性能日志
class PerformanceLogging {
    
    fun measureTime(tag: String, block: () -> Unit) {
        val start = System.currentTimeMillis()
        block()
        val duration = System.currentTimeMillis() - start
        Log.d(tag, "Execution time: ${duration}ms")
    }
    
    fun trace(tag: String, message: String) {
        Trace.beginSection(message)
        try {
            // 代码
        } finally {
            Trace.endSection()
        }
    }
}
```

```bash
# 查看性能日志
adb logcat -s "Performance"

# 使用 Systrace
adb shell am set-debug-app --persistent com.example.app
```

### 4.4 数据库调试

```kotlin
// Room 查询日志
class DatabaseLogging {
    
    private val queryCallback = RoomDatabase.QueryCallback { sql, bindArgs ->
        Log.d("Database", "SQL: $sql, Args: ${bindArgs.joinToString()}")
    }
    
    // 在 Room 配置中启用
    // .addQueryCallback(queryCallback, Executors.newSingleThreadExecutor())
}
```

### 4.5 协程调试

```kotlin
// 协程日志
class CoroutineLogging {
    
    suspend fun debugCoroutine() {
        withContext(Dispatchers.Default) {
            Log.d("Coroutine", "Running on ${Thread.currentThread().name}")
            // 代码
        }
    }
    
    // 使用 CoroutineExceptionHandler
    val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
        Log.e("Coroutine", "Coroutine failed", throwable)
    }
    
    fun launchWithLogging() {
        CoroutineScope(exceptionHandler).launch {
            // 代码
        }
    }
}
```

---

## 5. 最佳实践

### 5.1 日志规范

```kotlin
class LoggingBestPractices {
    
    companion object {
        // ✅ 使用常量 TAG
        private const val TAG = "MyClass"
        
        // ❌ 不要每次创建
        // private val TAG = javaClass.simpleName // 性能开销
    }
    
    // ✅ 包含上下文信息
    fun loadData(userId: String) {
        Log.d(TAG, "Loading data for user: $userId")
        // 代码
    }
    
    // ✅ 记录异常堆栈
    fun handleError(error: Throwable) {
        Log.e(TAG, "Error occurred", error)
    }
    
    // ✅ 避免敏感信息
    fun login(password: String) {
        // ❌ 不要记录密码
        // Log.d(TAG, "Password: $password")
        
        // ✅ 记录脱敏信息
        Log.d(TAG, "Login attempt for user")
    }
    
    // ✅ 生产环境关闭调试日志
    fun debug(message: String) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG, message)
        }
    }
}
```

### 5.2 日志工具类

```kotlin
object Logger {
    
    private const val TAG_PREFIX = "MyApp_"
    
    fun d(tag: String, message: String) {
        if (BuildConfig.DEBUG) {
            Log.d("$TAG_PREFIX$tag", message)
        }
    }
    
    fun e(tag: String, message: String, throwable: Throwable? = null) {
        Log.e("$TAG_PREFIX$tag", message, throwable)
    }
    
    fun i(tag: String, message: String) {
        Log.i("$TAG_PREFIX$tag", message)
    }
    
    fun w(tag: String, message: String) {
        Log.w("$TAG_PREFIX$tag", message)
    }
    
    // 带类名的快捷方法
    inline fun <reified T> T.debug(message: String) {
        Logger.d(T::class.java.simpleName, message)
    }
    
    inline fun <reified T> T.error(message: String, throwable: Throwable? = null) {
        Logger.e(T::class.java.simpleName, message, throwable)
    }
}

// 使用
class MyClass {
    fun loadData() {
        this.debug("Loading data")
        // 代码
    }
}
```

### 5.3 日志性能

```kotlin
class LoggingPerformance {
    
    // ✅ 避免字符串拼接
    fun efficientLog(value: Int) {
        if (Log.isLoggable(TAG, Log.DEBUG)) {
            Log.d(TAG, "Value: $value")
        }
    }
    
    // ❌ 避免昂贵操作
    fun inefficientLog() {
        // 即使不显示也会执行
        Log.d(TAG, "Data: ${expensiveOperation()}")
    }
    
    private fun expensiveOperation(): String {
        // 耗时操作
        return "data"
    }
}
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: Logcat 的作用是什么？**

```
答案要点：
- 查看系统和应用日志
- 调试和排查问题
- 性能分析
- 崩溃调查
```

**Q2: 日志级别有哪些？**

```
答案要点：
- Verbose (V) - 最详细
- Debug (D) - 调试
- Info (I) - 一般信息
- Warning (W) - 警告
- Error (E) - 错误
- Wtf (WTF) - 严重错误
```

### 6.2 实战问题

**Q3: 如何查找崩溃日志？**

```bash
# 查找崩溃
adb logcat | grep "FATAL"

# 查找异常
adb logcat | grep "Exception"

# 查看堆栈
adb logcat -d | grep -A 50 "Caused by"
```

**Q4: 如何优化日志性能？**

```kotlin
// 使用 isLoggable 检查
if (Log.isLoggable(TAG, Log.DEBUG)) {
    Log.d(TAG, message)
}

// 生产环境关闭调试日志
if (BuildConfig.DEBUG) {
    Log.d(TAG, message)
}
```

---

## 参考资料

- [Logcat 官方文档](https://developer.android.com/studio/debug/logcat)
- [Android Debugging](https://developer.android.com/studio/debug)

---

*本文完，感谢阅读！*
