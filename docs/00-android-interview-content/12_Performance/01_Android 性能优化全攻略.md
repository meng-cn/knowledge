# Android 性能优化全攻略 🚀

> 大厂面试必考，性能优化实战指南

---

## 一、性能优化总览

```
┌─────────────────────────────────────────────────────────┐
│              Android 性能优化六大维度                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 启动优化  →  减少冷启动时间                          │
│  2. 内存优化  →  降低 OOM 风险                            │
│  3. 布局优化  →  提升渲染性能                            │
│  4. 网络优化  →  减少流量、提升速度                      │
│  5. 电量优化  →  延长续航时间                            │
│  6. 包体积优化 →  减少下载成本                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 二、启动优化

### 2.1 启动流程分析

```
┌─────────────────────────────────────────────────────────┐
│              冷启动流程                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  App 启动 → Application.onCreate()                      │
│     ↓                                                    │
│  ContentProvider.onCreate()                            │
│     ↓                                                    │
│  Activity.onCreate()                                    │
│     ↓                                                    │
│  setContentView()                                       │
│     ↓                                                    │
│  onMeasure/onLayout/onDraw                              │
│     ↓                                                    │
│  首帧绘制完成 (Displayed)                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 启动优化方案

```kotlin
// ==================== 1. Application 优化 ====================

// ❌ 错误：在 Application 中初始化所有东西
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        initLibrary1()  // 耗时
        initLibrary2()  // 耗时
        initLibrary3()  // 耗时
        // ... 几十个初始化
    }
}

// ✅ 正确：延迟初始化 + 异步初始化
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 1. 只初始化必须的（同步）
        initCriticalLibraries()
        
        // 2. 异步初始化非必须的
        initAsync()
        
        // 3. 延迟初始化（IdleHandler）
        initDelayed()
    }
    
    private fun initCriticalLibraries() {
        // 只初始化影响启动的库
    }
    
    private fun initAsync() {
        // 使用协程异步初始化
        CoroutineScope(Dispatchers.IO).launch {
            initLibrary1()
            initLibrary2()
        }
    }
    
    private fun initDelayed() {
        // 主线程空闲时初始化
        Looper.getMainLooper().queue.addIdleHandler {
            initLibrary3()
            false  // 只执行一次
        }
    }
}

// ==================== 2. 使用 Startup 库 ====================

// 添加依赖
// implementation("androidx.startup:startup-runtime:1.1.1")

// 定义初始化器
class Library1Initializer : Initializer<Library1> {
    override fun create(context: Context): Library1 {
        return Library1.init(context)
    }
    
    override fun dependencies(): List<Class<out Initializer<*>>> {
        return emptyList()  // 无依赖
    }
}

class Library2Initializer : Initializer<Library2> {
    override fun create(context: Context): Library2 {
        return Library2.init(context)
    }
    
    override fun dependencies(): List<Class<out Initializer<*>>> {
        return listOf(Library1Initializer::class.java)  // 依赖 Library1
    }
}

// AndroidManifest.xml
<provider
    android:name="androidx.startup.InitializationProvider"
    android:authorities="${applicationId}.androidx-startup"
    android:exported="false"
    tools:node="merge">
    
    <meta-data
        android:name="com.example.Library1Initializer"
        android:value="androidx.startup" />
    
    <meta-data
        android:name="com.example.Library2Initializer"
        android:value="androidx.startup" />
</provider>

// ==================== 3. 异步布局 ====================

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 异步加载布局
        setContentView(R.layout.activity_main)
        
        // 或者使用 ViewStub 延迟加载
        val stub = findViewById<ViewStub>(R.id.stub)
        stub.inflate()
    }
}

// ==================== 4. 预加载 ====================

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 预加载首页数据
        preloadHomeData()
        
        // 预加载首页布局
        preloadHomeLayout()
        
        // 跳转到首页
        startActivity(Intent(this, HomeActivity::class.java))
        finish()
    }
    
    private fun preloadHomeData() {
        // 预加载数据到缓存
    }
    
    private fun preloadHomeLayout() {
        // 预加载布局
        val view = LayoutInflater.from(this)
            .inflate(R.layout.activity_home, null)
    }
}

// ==================== 5. 优化 Application 创建 ====================

// 使用 Trace 分析启动耗时
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        Trace.beginSection("Application.onCreate")
        
        try {
            initLibraries()
        } finally {
            Trace.endSection()
        }
    }
}

// 查看启动耗时
adb shell am start -W com.example/.MainActivity
```

### 2.3 启动检测工具

```kotlin
// 1. 使用 Systrace
adb shell am set-profile-interval com.example 1000

// 2. 使用 Perfetto
https://ui.perfetto.dev

// 3. 自定义启动监控
object StartupMonitor {
    
    private val tasks = mutableListOf<StartupTask>()
    
    fun register(task: StartupTask) {
        tasks.add(task)
    }
    
    fun executeAll() {
        val startTime = System.currentTimeMillis()
        
        tasks.forEach { task ->
            val taskStart = System.currentTimeMillis()
            task.execute()
            val taskEnd = System.currentTimeMillis()
            
            Log.d("Startup", "${task.name}: ${taskEnd - taskStart}ms")
        }
        
        val endTime = System.currentTimeMillis()
        Log.d("Startup", "Total: ${endTime - startTime}ms")
    }
}

interface StartupTask {
    val name: String
    fun execute()
}
```

---

## 三、内存优化

### 3.1 内存泄漏检测

```kotlin
// ==================== 1. LeakCanary 集成 ====================

// 添加依赖
dependencies {
    debugImplementation("com.squareup.leakcanary:leakcanary-android:2.12")
}

// 自动检测内存泄漏
// 泄漏时会收到通知

// ==================== 2. 常见泄漏场景 ====================

// ❌ 场景 1: 静态引用 Context
class BadSingleton {
    companion object {
        lateinit var context: Context  // 泄漏！
    }
}

// ✅ 正确：使用 Application
class GoodSingleton {
    companion object {
        lateinit var context: Application
    }
}

// ❌ 场景 2: 未注销的 BroadcastReceiver
class BadActivity : AppCompatActivity() {
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            // ...
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerReceiver(receiver, IntentFilter("ACTION"))
        // 忘记注销
    }
}

// ✅ 正确
class GoodActivity : AppCompatActivity() {
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            // ...
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerReceiver(receiver, IntentFilter("ACTION"))
    }
    
    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(receiver)  // 及时注销
    }
}

// ❌ 场景 3: Handler 泄漏
class BadHandler : Handler() {
    override fun handleMessage(msg: Message) {
        // 引用了外部 Activity
    }
}

class BadActivity : AppCompatActivity() {
    private val handler = BadHandler()  // 隐式引用 Activity
    
    fun doSomething() {
        handler.postDelayed({
            // 延迟任务
        }, 5000)
    }
}

// ✅ 正确
class GoodActivity : AppCompatActivity() {
    private val handler = object : Handler(Looper.getMainLooper()) {
        override fun handleMessage(msg: Message) {
            // 使用弱引用
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)  // 清理消息
    }
}

// ❌ 场景 4: 非静态内部类
class BadActivity : AppCompatActivity() {
    private val task = object : Runnable {
        override fun run() {
            // 引用了 Activity
        }
    }
}

// ✅ 正确：使用静态类 + 弱引用
class GoodActivity : AppCompatActivity() {
    private val task = MyTask(this)
    
    private class MyTask(activity: Activity) : Runnable {
        private val activityRef = WeakReference(activity)
        
        override fun run() {
            val activity = activityRef.get()
            activity?.let {
                // 使用 Activity
            }
        }
    }
}

// ❌ 场景 5: 单例持有 View
class BadSingleton {
    companion object {
        private var view: View? = null  // 泄漏！
        
        fun setView(v: View) {
            view = v
        }
    }
}

// ✅ 正确
class GoodSingleton {
    companion object {
        private var viewRef: WeakReference<View>? = null
        
        fun setView(v: View) {
            viewRef = WeakReference(v)
        }
        
        fun getView(): View? {
            return viewRef?.get()
        }
    }
}

// ==================== 3. Bitmap 优化 ====================

// ❌ 错误：加载大图
fun loadBitmap(path: String): Bitmap {
    return BitmapFactory.decodeFile(path)  // 可能 OOM
}

// ✅ 正确：采样加载
fun loadBitmap(path: String, reqWidth: Int, reqHeight: Int): Bitmap {
    // 1. 获取图片尺寸
    val options = BitmapFactory.Options().apply {
        inJustDecodeBounds = true
    }
    BitmapFactory.decodeFile(path, options)
    
    // 2. 计算采样率
    options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
    
    // 3. 加载压缩后的图片
    options.inJustDecodeBounds = false
    return BitmapFactory.decodeFile(path, options)
}

private fun calculateInSampleSize(
    options: BitmapFactory.Options,
    reqWidth: Int,
    reqHeight: Int
): Int {
    val (height: Int, width: Int) = options.run { outHeight to outWidth }
    var inSampleSize = 1
    
    if (height > reqHeight || width > reqWidth) {
        val halfHeight: Int = height / 2
        val halfWidth: Int = width / 2
        
        while (halfHeight / inSampleSize >= reqHeight &&
               halfWidth / inSampleSize >= reqWidth) {
            inSampleSize *= 2
        }
    }
    
    return inSampleSize
}

// ==================== 4. 内存监控 ====================

object MemoryMonitor {
    
    fun getMemoryInfo(): MemoryInfo {
        val runtime = Runtime.getRuntime()
        return MemoryInfo(
            totalMemory = runtime.totalMemory(),
            freeMemory = runtime.freeMemory(),
            maxMemory = runtime.maxMemory(),
            usedMemory = runtime.totalMemory() - runtime.freeMemory()
        )
    }
    
    fun getProcessMemoryInfo(context: Context): ProcessMemoryInfo {
        val memoryInfo = ActivityManager.MemoryInfo()
        val activityManager = context.getSystemService(ACTIVITY_SERVICE) as ActivityManager
        activityManager.getMemoryInfo(memoryInfo)
        
        return ProcessMemoryInfo(
            availableMem = memoryInfo.availMem,
            totalMem = memoryInfo.totalMem,
            lowMemory = memoryInfo.lowMemory
        )
    }
}

data class MemoryInfo(
    val totalMemory: Long,
    val freeMemory: Long,
    val maxMemory: Long,
    val usedMemory: Long
)

data class ProcessMemoryInfo(
    val availableMem: Long,
    val totalMem: Long,
    val lowMemory: Boolean
)
```

### 3.2 内存优化最佳实践

```kotlin
// 1. 使用对象池
class ObjectPool<T>(private val factory: () -> T) {
    private val pool = ArrayDeque<T>()
    
    fun acquire(): T {
        return if (pool.isNotEmpty()) {
            pool.removeLast()
        } else {
            factory()
        }
    }
    
    fun release(obj: T) {
        pool.addLast(obj)
    }
}

// 2. 避免自动装箱
// ❌ 错误
val sum: Int = list.sum()  // 自动装箱

// ✅ 正确
var sum = 0
for (item in list) {
    sum += item
}

// 3. 使用 StringBuilder
// ❌ 错误
var result = ""
for (i in 0..100) {
    result += i  // 创建 100 个 String 对象
}

// ✅ 正确
val result = StringBuilder()
for (i in 0..100) {
    result.append(i)
}

// 4. 及时释放资源
class ResourceHolder {
    private val resources = mutableListOf<Closeable>()
    
    fun addResource(resource: Closeable) {
        resources.add(resource)
    }
    
    fun releaseAll() {
        resources.forEach { resource ->
            try {
                resource.close()
            } catch (e: Exception) {
                // 处理异常
            }
        }
        resources.clear()
    }
}
```

---

## 四、布局优化

### 4.1 减少视图层级

```xml
<!-- ❌ 错误：嵌套过深 -->
<LinearLayout>
    <LinearLayout>
        <LinearLayout>
            <TextView />
        </LinearLayout>
    </LinearLayout>
</LinearLayout>

<!-- ✅ 正确：使用 ConstraintLayout -->
<androidx.constraintlayout.widget.ConstraintLayout>
    <TextView
        android:id="@+id/textView"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

### 4.2 使用 <merge> 标签

```xml
<!-- ✅ 使用 merge 减少层级 -->
<!-- res/layout/item_layout.xml -->
<merge xmlns:android="http://schemas.android.com/apk/res/android">
    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content" />
</merge>

// 代码中使用
class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : LinearLayout(context, attrs) {
    
    init {
        // inflate 到 this，不会增加额外层级
        LayoutInflater.from(context)
            .inflate(R.layout.item_layout, this, true)
    }
}
```

### 4.3 ViewStub 延迟加载

```xml
<!-- 布局文件 -->
<ViewStub
    android:id="@+id/stub_loading"
    android:layout="@layout/layout_loading"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```

```kotlin
// 代码中使用
val viewStub = findViewById<ViewStub>(R.id.stub_loading)

// 按需加载
viewStub.setOnInflateListener { stub, inflated ->
    // 初始化 inflated View
}

val loadingView = viewStub.inflate()  // 调用时才加载
```

### 4.4 RecyclerView 优化

```kotlin
// 1. 使用 DiffUtil
class MyDiffUtilCallback(
    private val oldList: List<Item>,
    private val newList: List<Item>
) : DiffUtil.Callback() {
    
    override fun getOldListSize() = oldList.size
    override fun getNewListSize() = newList.size
    
    override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        return oldList[oldItemPosition].id == newList[newItemPosition].id
    }
    
    override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        return oldList[oldItemPosition] == newList[newItemPosition]
    }
}

// 使用
val diffResult = DiffUtil.calculateDiff(MyDiffUtilCallback(oldList, newList))
diffResult.dispatchUpdatesTo(adapter)

// 2. 预取优化
recyclerView.layoutManager = LinearLayoutManager(context).apply {
    initialPrefetchItemCount = 5  // 预取 5 个 item
}

// 3. 固定大小
recyclerView.setHasFixedSize(true)  // item 大小固定

// 4. 视图缓存
recyclerView.setItemViewCacheSize(20)  // 缓存 20 个视图

// 5. 分页加载
class PagingAdapter : RecyclerView.Adapter<PagingAdapter.ViewHolder>() {
    
    private val items = mutableListOf<Item>()
    private var isLoading = false
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        if (position == itemCount - 1 && !isLoading) {
            // 加载更多
            loadMore()
        }
    }
}
```

### 4.5 过度绘制检测

```kotlin
// 1. 开发者选项
// 设置 → 开发者选项 → 调试 GPU 过度绘制

// 2. 代码检测
class OverdrawView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    
    init {
        // 移除不必要的背景
        setBackground(null)
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        // 直接绘制内容，不要先绘制背景
    }
}

// 3. 布局检查
fun checkOverdraw(viewGroup: ViewGroup) {
    for (i in 0 until viewGroup.childCount) {
        val child = viewGroup.getChildAt(i)
        
        if (child is ViewGroup) {
            checkOverdraw(child)
        } else {
            // 检查背景
            if (child.background != null) {
                Log.w("Overdraw", "${child.javaClass.simpleName} has background")
            }
        }
    }
}
```

---

## 五、网络优化

### 5.1 缓存策略

```kotlin
// 1. OKHttp 缓存
val cacheDir = File(context.cacheDir, "http_cache")
val cache = Cache(cacheDir, 10 * 1024 * 1024)  // 10MB

val client = OkHttpClient.Builder()
    .cache(cache)
    .build()

// 2. 缓存控制
val request = Request.Builder()
    .url("https://api.example.com/data")
    .cacheControl(CacheControl.Builder()
        .maxAge(5, TimeUnit.MINUTES)      // 5 分钟内使用缓存
        .maxStale(1, TimeUnit.HOURS)      // 可接受 1 小时过期缓存
        .build())
    .build()

// 3. 拦截器缓存
class CacheInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        // 无网络时使用缓存
        if (!isNetworkAvailable()) {
            val cacheRequest = request.newBuilder()
                .header("Cache-Control", "only-if-cached, max-stale=3600")
                .build()
            return chain.proceed(cacheRequest)
        }
        
        val response = chain.proceed(request)
        
        // 设置缓存策略
        return response.newBuilder()
            .header("Cache-Control", "public, max-age=300")
            .removeHeader("Pragma")
            .build()
    }
}
```

### 5.2 请求优化

```kotlin
// 1. 请求合并
suspend fun loadUserData() = coroutineScope {
    val userDeferred = async { api.getUser() }
    val postsDeferred = async { api.getPosts() }
    val commentsDeferred = async { api.getComments() }
    
    // 并行执行
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    val comments = commentsDeferred.await()
    
    updateUI(user, posts, comments)
}

// 2. 请求去重
class RequestDeduplicator {
    private val pendingRequests = mutableMapOf<String, Deferred<Any>>()
    
    suspend fun <T> request(
        key: String,
        block: suspend () -> T
    ): T {
        // 检查是否有相同请求正在进行
        @Suppress("UNCHECKED_CAST")
        pendingRequests[key]?.let {
            return it.await() as T
        }
        
        // 创建新请求
        val deferred = CoroutineScope(Dispatchers.IO).async {
            block()
        }
        
        pendingRequests[key] = deferred as Deferred<Any>
        
        return try {
            deferred.await()
        } finally {
            pendingRequests.remove(key)
        }
    }
}

// 3. 数据压缩
val client = OkHttpClient.Builder()
    .addInterceptor { chain ->
        val request = chain.request().newBuilder()
            .header("Accept-Encoding", "gzip")
            .build()
        
        chain.proceed(request)
    }
    .build()
```

---

## 六、包体积优化

### 6.1 代码压缩

```gradle
// build.gradle.kts
android {
    buildTypes {
        release {
            // 启用代码压缩
            isMinifyEnabled = true
            isShrinkResources = true
            
            // ProGuard 规则
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

```proguard
# proguard-rules.pro

# 保留必要的类
-keep class com.example.model.** { *; }

# 移除日志
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# 移除调试代码
-assumenosideeffects class com.example.Debug {
    public static *** log(...);
}
```

### 6.2 资源优化

```gradle
android {
    defaultConfig {
        // 只保留特定语言资源
        resConfigs "zh", "en"
        
        // 只保留特定密度资源
        resConfigs "xxhdpi", "xhdpi", "hdpi"
    }
    
    // 自动移除未使用的资源
    buildTypes {
        release {
            shrinkResources true
        }
    }
}
```

### 6.3 使用 WebP 格式

```kotlin
// 转换工具
// 使用 Android Studio: Right Click → Convert to WebP

// 或者使用命令行
cwebp input.png -q 80 -o output.webp

// 节省 25-35% 体积
```

### 6.4 动态特性模块

```gradle
// 动态功能模块
dynamic-features {
    include ':feature:checkout', ':feature:profile'
}
```

```xml
<!-- AndroidManifest.xml -->
<dist:module
    dist:instant="true"
    dist:title="@string/title_checkout">
    <dist:delivery>
        <dist:install-time />
    </dist:delivery>
    <dist:fusing dist:include="true" />
</dist:module>
```

---

## 七、性能检测工具

### 7.1 常用工具

| 工具 | 用途 | 命令 |
|------|------|------|
| **Android Profiler** | CPU/内存/网络监控 | Android Studio |
| **LeakCanary** | 内存泄漏检测 | 自动集成 |
| **Systrace** | 系统级性能分析 | `adb shell systrace` |
| **Perfetto** | 高级性能分析 | https://ui.perfetto.dev |
| **Layout Inspector** | 布局分析 | Android Studio |
| **GPU Overdraw** | 过度绘制检测 | 开发者选项 |

### 7.2 自定义性能监控

```kotlin
// 1. 方法耗时监控
object PerformanceMonitor {
    
    inline fun <T> measureTimeMillis(
        tag: String,
        block: () -> T
    ): T {
        val start = System.currentTimeMillis()
        val result = block()
        val end = System.currentTimeMillis()
        Log.d("Performance", "$tag: ${end - start}ms")
        return result
    }
}

// 使用
val data = PerformanceMonitor.measureTimeMillis("loadData") {
    repository.getData()
}

// 2. FPS 监控
class FpsMonitor {
    private var frameCount = 0
    private var lastTime = 0L
    
    fun start() {
        Choreographer.getInstance().postFrameCallback { fps ->
            frameCount++
            val currentTime = System.currentTimeMillis()
            
            if (currentTime - lastTime >= 1000) {
                Log.d("FPS", "FPS: $frameCount")
                frameCount = 0
                lastTime = currentTime
            }
            
            Choreographer.getInstance().postFrameCallback(this::start)
        }
    }
}

// 3. 启动监控
object StartupMonitor {
    
    private val tasks = mutableListOf<StartupTask>()
    
    fun register(task: StartupTask) {
        tasks.add(task)
    }
    
    fun executeAll() {
        val startTime = System.currentTimeMillis()
        
        tasks.forEach { task ->
            val taskStart = System.currentTimeMillis()
            task.execute()
            val taskEnd = System.currentTimeMillis()
            
            Log.d("Startup", "${task.name}: ${taskEnd - taskStart}ms")
        }
        
        val endTime = System.currentTimeMillis()
        Log.d("Startup", "Total: ${endTime - startTime}ms")
    }
}
```

---

## 八、面试核心考点

### 8.1 基础问题

**Q1: 如何优化 App 启动速度？**

**A:**
1. **延迟初始化**: 非必须库延迟初始化
2. **异步初始化**: 使用协程异步初始化
3. **使用 Startup**: Jetpack Startup 库
4. **预加载**: 预加载数据和布局
5. **优化 Application**: 减少 onCreate 中的工作

**Q2: 如何检测内存泄漏？**

**A:**
1. **LeakCanary**: 自动检测
2. **Android Profiler**: 手动监控
3. **MAT**: 分析 hprof 文件
4. **常见场景**: 静态引用、未注销的广播、Handler 等

**Q3: 如何优化 RecyclerView？**

**A:**
1. **DiffUtil**: 局部刷新
2. **预取**: `initialPrefetchItemCount`
3. **视图缓存**: `setItemViewCacheSize`
4. **避免嵌套**: 减少层级
5. **图片优化**: 懒加载、复用

### 8.2 进阶问题

**Q4: 如何减少包体积？**

**A:**
1. **代码压缩**: ProGuard/R8
2. **资源压缩**: `shrinkResources`
3. **WebP 格式**: 替代 PNG/JPG
4. **动态特性**: 按需下载
5. **移除无用资源**: 清理未使用资源

**Q5: 如何优化网络请求？**

**A:**
1. **缓存**: OKHttp 缓存
2. **请求合并**: 并行执行
3. **请求去重**: 避免重复请求
4. **数据压缩**: Gzip
5. **DNS 优化**: DNS 预解析

**Q6: 如何检测过度绘制？**

**A:**
1. **开发者选项**: 调试 GPU 过度绘制
2. **颜色含义**: 蓝 (1x)、绿 (2x)、粉 (3x)、红 (4x+)
3. **优化方案**: 移除背景、减少层级

### 8.3 实战问题

**Q7: 如何监控 FPS？**

**A:**
```kotlin
class FpsMonitor {
    fun start() {
        Choreographer.getInstance().postFrameCallback { fps ->
            Log.d("FPS", "FPS: $fps")
            Choreographer.getInstance().postFrameCallback(this::start)
        }
    }
}
```

**Q8: 如何优化 Bitmap 内存？**

**A:**
1. **采样加载**: `inSampleSize`
2. **压缩**: 降低质量
3. **缓存**: LruCache
4. **及时回收**: `recycle()`
5. **使用 Glide**: 自动优化

---

## 九、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| 启动优化 | ⭐⭐⭐ | 延迟/异步初始化、Startup |
| 内存泄漏 | ⭐⭐⭐ | LeakCanary、常见场景 |
| RecyclerView 优化 | ⭐⭐⭐ | DiffUtil、预取、缓存 |
| 包体积优化 | ⭐⭐⭐ | ProGuard、WebP、动态特性 |
| 网络优化 | ⭐⭐⭐ | 缓存、合并、去重 |
| 过度绘制 | ⭐⭐ | GPU 检测、移除背景 |
| Bitmap 优化 | ⭐⭐⭐ | 采样、压缩、缓存 |
| FPS 监控 | ⭐⭐⭐ | Choreographer |

---

**📚 参考资料**
- [Android Performance](https://developer.android.com/topic/performance)
- [Android Vitals](https://developer.android.com/google/play/overview/vitals)
- [性能优化实战](https://github.com/xxx)

**🔗 下一篇**: [Android 系统原理](../12_System/01_Android 系统架构.md)
