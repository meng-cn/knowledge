# 01_Lifecycle.md - Lifecycle 生命周期组件

## 目录
1. [Lifecycle 概述](#lifecycle-概述)
2. [LifecycleOwner 与 LifecycleObserver](#lifecycleowner-与-lifecycleobserver)
3. [Lifecycle 状态和事件](#lifecycle-状态和事件)
4. [@OnLifecycleEvent 注解](#onlifecycleevent-注解)
5. [自定义 LifecycleObserver](#自定义-lifecycleobserver)
6. [与 ViewModel/协程集成](#与-viewmodel 协程集成)
7. [面试考点](#面试考点)
8. [最佳实践与常见错误](#最佳实践与常见错误)
9. [参考资料](#参考资料)

---

## Lifecycle 概述

### 什么是 Lifecycle？

Lifecycle 是 Android Jetpack 架构组件之一，用于管理组件（如 Activity、Fragment）的生命周期状态。它允许其他组件观察生命周期变化并做出响应，从而实现更好的生命周期感知。

**核心优势：**
- 解决内存泄漏问题
- 避免在错误的生命周期阶段执行操作
- 实现组件间的解耦
- 简化生命周期相关代码

### 为什么需要 Lifecycle？

在传统的 Android 开发中，我们经常遇到以下问题：

```kotlin
// ❌ 错误示例：没有生命周期感知
class MyActivity : AppCompatActivity() {
    private var locationListener: LocationListener? = null
    
    override fun onStart() {
        super.onStart()
        locationListener = LocationListener { /* 更新 UI */ }
        // 如果忘记在 onStop 中移除，会导致内存泄漏
    }
    
    // 容易忘记在 onStop 中清理
}
```

使用 Lifecycle 后：

```kotlin
// ✅ 正确示例：生命周期感知
class MyActivity : AppCompatActivity() {
    private val locationObserver = LocationObserver { /* 更新 UI */ }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycle.addObserver(locationObserver)
    }
}

class LocationObserver(private val callback: () -> Unit) : LifecycleObserver {
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun startListening() {
        // 开始监听位置
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun stopListening() {
        // 停止监听，避免内存泄漏
    }
}
```

---

## LifecycleOwner 与 LifecycleObserver

### LifecycleOwner

LifecycleOwner 是一个拥有 Lifecycle 的组件接口。它表示该组件具有生命周期，可以被观察。

**内置的 LifecycleOwner 实现：**
- `AppCompatActivity`
- `Fragment`
- `Service` (通过 LifecycleService)

```kotlin
// Activity 作为 LifecycleOwner
class MainActivity : AppCompatActivity() { // 自动实现 LifecycleOwner
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 获取 Lifecycle
        val lifecycle = this.lifecycle
        
        // 添加观察者
        lifecycle.addObserver(MyObserver())
    }
}

// Fragment 作为 LifecycleOwner
class MyFragment : Fragment() { // 自动实现 LifecycleOwner
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Fragment 有自己的生命周期
        viewLifecycleOwner.lifecycle.addObserver(MyObserver())
    }
}
```

### 自定义 LifecycleOwner

在某些场景下，你可能需要自定义 LifecycleOwner：

```kotlin
class CustomLifecycleComponent : LifecycleOwner {
    private val lifecycleRegistry = LifecycleRegistry(this)
    
    override val lifecycle: Lifecycle
        get() = lifecycleRegistry
    
    fun start() {
        lifecycleRegistry.currentState = Lifecycle.State.STARTED
    }
    
    fun stop() {
        lifecycleRegistry.currentState = Lifecycle.State.CREATED
    }
    
    fun destroy() {
        lifecycleRegistry.currentState = Lifecycle.State.DESTROYED
    }
}
```

### LifecycleObserver

LifecycleObserver 是一个接口，用于观察 LifecycleOwner 的生命周期变化。

```kotlin
interface MyObserver : LifecycleObserver {
    
    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreate(owner: LifecycleOwner) {
        Log.d("Observer", "onCreate")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart(owner: LifecycleOwner) {
        Log.d("Observer", "onStart")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    fun onResume(owner: LifecycleOwner) {
        Log.d("Observer", "onResume")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    fun onPause(owner: LifecycleOwner) {
        Log.d("Observer", "onPause")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStop(owner: LifecycleOwner) {
        Log.d("Observer", "onStop")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    fun onDestroy(owner: LifecycleOwner) {
        Log.d("Observer", "onDestroy")
    }
}
```

---

## Lifecycle 状态和事件

### Lifecycle.State（状态）

Lifecycle 有 5 种状态，形成一个状态图：

```
INITIALIZED → CREATED → STARTED → RESUMED
     ↓           ↓          ↓         ↓
  DESTROYED ← DESTROYED ← DESTROYED ← DESTROYED
```

| 状态 | 描述 | 对应 Activity 方法 |
|------|------|-------------------|
| `INITIALIZED` | 初始状态，刚创建但未启动 | - |
| `CREATED` | 已创建，但未启动 | `onCreate()` 后 |
| `STARTED` | 已启动，但未在前台 | `onStart()` 后 |
| `RESUMED` | 活跃状态，在前台运行 | `onResume()` 后 |
| `DESTROYED` | 已销毁 | `onDestroy()` 后 |

```kotlin
// 检查当前状态
fun checkLifecycleState(lifecycle: Lifecycle) {
    when (lifecycle.currentState) {
        Lifecycle.State.INITIALIZED -> Log.d("State", "初始化")
        Lifecycle.State.CREATED -> Log.d("State", "已创建")
        Lifecycle.State.STARTED -> Log.d("State", "已启动")
        Lifecycle.State.RESUMED -> Log.d("State", "活跃中")
        Lifecycle.State.DESTROYED -> Log.d("State", "已销毁")
    }
}

// 检查是否处于某个状态或更高
fun isAtLeastStarted(lifecycle: Lifecycle): Boolean {
    return lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)
}
```

### Lifecycle.Event（事件）

Lifecycle 有 7 种事件：

| 事件 | 触发时机 | 转换后状态 |
|------|----------|-----------|
| `ON_CREATE` | onCreate() 调用后 | CREATED |
| `ON_START` | onStart() 调用后 | STARTED |
| `ON_RESUME` | onResume() 调用后 | RESUMED |
| `ON_PAUSE` | onPause() 调用后 | CREATED |
| `ON_STOP` | onStop() 调用后 | CREATED |
| `ON_DESTROY` | onDestroy() 调用后 | DESTROYED |
| `ON_ANY` | 任何事件（通配符） | 不变 |

```kotlin
class FullEventObserver : LifecycleObserver {
    
    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreate() {
        Log.d("Event", "收到 ON_CREATE 事件")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart() {
        Log.d("Event", "收到 ON_START 事件")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    fun onResume() {
        Log.d("Event", "收到 ON_RESUME 事件")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    fun onPause() {
        Log.d("Event", "收到 ON_PAUSE 事件")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStop() {
        Log.d("Event", "收到 ON_STOP 事件")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    fun onDestroy() {
        Log.d("Event", "收到 ON_DESTROY 事件")
    }
    
    // ON_ANY 可以捕获所有事件
    @OnLifecycleEvent(Lifecycle.Event.ON_ANY)
    fun onAnyEvent(event: Lifecycle.Event) {
        Log.d("Event", "收到任意事件：$event")
    }
}
```

### 状态转换图

```
                    ON_CREATE
    INITIALIZED ──────────────► CREATED
         │                        │
         │ ON_DESTROY             │ ON_START
         ▼                        ▼
    DESTROYED ◄─────────────── STARTED
         ▲                        │
         │                        │ ON_RESUME
         │ ON_DESTROY             ▼
         │                    RESUMED
         │                        │
         │                        │ ON_PAUSE
         └────────────────────────┘
```

---

## @OnLifecycleEvent 注解

### 基本用法

`@OnLifecycleEvent` 注解用于标记方法在特定生命周期事件时调用。

```kotlin
class SimpleObserver : LifecycleObserver {
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun startTracking() {
        // 开始跟踪
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun stopTracking() {
        // 停止跟踪
    }
}
```

### 方法签名

注解方法可以有以下几种签名：

```kotlin
class MethodSignatureObserver : LifecycleObserver {
    
    // 无参数
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun startNoArgs() {}
    
    // 接收 LifecycleOwner 参数
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun startWithOwner(owner: LifecycleOwner) {
        val activity = owner as? AppCompatActivity
        // 可以访问 LifecycleOwner
    }
    
    // 接收 LifecycleOwner 和 Lifecycle.Event 参数
    @OnLifecycleEvent(Lifecycle.Event.ON_ANY)
    fun onAny(owner: LifecycleOwner, event: Lifecycle.Event) {
        Log.d("Any", "事件：$event, Owner: $owner")
    }
}
```

### 注意事项

⚠️ **重要：** `@OnLifecycleEvent` 注解在 Lifecycle 2.4.0 之后被标记为废弃，推荐使用 `LifecycleEventObserver` 或 `DefaultLifecycleObserver`。

```kotlin
// ✅ 推荐方式：使用 LifecycleEventObserver
class ModernObserver : LifecycleEventObserver {
    override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
        when (event) {
            Lifecycle.Event.ON_START -> {
                // 处理 START 事件
            }
            Lifecycle.Event.ON_STOP -> {
                // 处理 STOP 事件
            }
            else -> {}
        }
    }
}

// ✅ 推荐方式：使用 DefaultLifecycleObserver
class DefaultObserver : DefaultLifecycleObserver {
    override fun onCreate(owner: LifecycleOwner) {
        Log.d("Default", "onCreate")
    }
    
    override fun onStart(owner: LifecycleOwner) {
        Log.d("Default", "onStart")
    }
    
    override fun onResume(owner: LifecycleOwner) {
        Log.d("Default", "onResume")
    }
    
    override fun onPause(owner: LifecycleOwner) {
        Log.d("Default", "onPause")
    }
    
    override fun onStop(owner: LifecycleOwner) {
        Log.d("Default", "onStop")
    }
    
    override fun onDestroy(owner: LifecycleOwner) {
        Log.d("Default", "onDestroy")
    }
}
```

---

## 自定义 LifecycleObserver

### 实用场景：网络状态观察者

```kotlin
class NetworkObserver(
    private val context: Context,
    private val onNetworkAvailable: () -> Unit,
    private val onNetworkUnavailable: () -> Unit
) : LifecycleObserver {
    
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            onNetworkAvailable()
        }
        
        override fun onLost(network: Network) {
            onNetworkUnavailable()
        }
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun registerNetworkCallback() {
        val connectivityManager = context.getSystemService(
            Context.CONNECTIVITY_SERVICE
        ) as ConnectivityManager
        
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun unregisterNetworkCallback() {
        val connectivityManager = context.getSystemService(
            Context.CONNECTIVITY_SERVICE
        ) as ConnectivityManager
        
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }
}

// 使用
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val networkObserver = NetworkObserver(
            context = this,
            onNetworkAvailable = { /* 更新 UI */ },
            onNetworkUnavailable = { /* 显示错误 */ }
        )
        
        lifecycle.addObserver(networkObserver)
    }
}
```

### 实用场景：传感器观察者

```kotlin
class SensorObserver(
    private val context: Context,
    private val onSensorChanged: (FloatArray) -> Unit
) : LifecycleObserver {
    
    private lateinit var sensorManager: SensorManager
    private lateinit var accelerometer: Sensor
    private val sensorEventListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            onSensorChanged(event.values)
        }
        
        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun startListening() {
        sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        sensorManager.registerListener(
            sensorEventListener,
            accelerometer,
            SensorManager.SENSOR_DELAY_NORMAL
        )
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun stopListening() {
        sensorManager.unregisterListener(sensorEventListener)
    }
}
```

### 实用场景：数据库连接管理者

```kotlin
class DatabaseConnectionObserver(
    private val database: YourDatabase
) : LifecycleObserver {
    
    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun openDatabase() {
        // 打开数据库连接
        database.open()
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    fun closeDatabase() {
        // 关闭数据库连接
        database.close()
    }
}
```

### 组合多个观察者

```kotlin
class CompositeObserver : LifecycleObserver {
    
    private val observers = mutableListOf<LifecycleObserver>()
    
    fun addObserver(observer: LifecycleObserver) {
        observers.add(observer)
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_ANY)
    fun forwardEvent(owner: LifecycleOwner, event: Lifecycle.Event) {
        observers.forEach { observer ->
            // 通过反射或其他方式转发事件
        }
    }
}
```

---

## 与 ViewModel/协程集成

### Lifecycle + ViewModel

ViewModel 本身不是 LifecycleObserver，但可以与 Lifecycle 配合使用：

```kotlin
class MainViewModel(
    private val repository: DataRepository
) : ViewModel() {
    
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun loadData() {
        viewModelScope.launch {
            _data.value = repository.loadData()
        }
    }
}

// 在 Activity/Fragment 中观察
class MainFragment : Fragment() {
    
    private val viewModel: MainViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // LiveData 自动感知生命周期
        viewModel.data.observe(viewLifecycleOwner) { data ->
            // 只在活跃状态更新 UI
            textView.text = data
        }
    }
}
```

### Lifecycle + 协程

#### 使用 lifecycleScope

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // lifecycleScope 自动在 onDestroy 时取消
        lifecycleScope.launch {
            val data = withContext(Dispatchers.IO) {
                repository.loadData()
            }
            // 更新 UI
        }
        
        // 重复执行的任务
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                // 只在 STARTED 及以上状态执行
                fetchLatestData()
            }
        }
    }
}
```

#### 使用 repeatOnLifecycle

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 当生命周期低于 STARTED 时自动取消
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                // 这个协程会在 STOP 时取消，START 时重新启动
                repository.dataFlow.collect { data ->
                    updateUI(data)
                }
            }
        }
    }
}
```

#### 使用 flowWithLifecycle (已废弃，使用 flowWithLifecycle 扩展)

```kotlin
// 推荐方式：使用 StateFlow + repeatOnLifecycle
class MainViewModel : ViewModel() {
    
    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state
    
    init {
        viewModelScope.launch {
            repository.getDataFlow()
                .flowOn(Dispatchers.IO)
                .collect { data ->
                    _state.value = UiState.Success(data)
                }
        }
    }
}

// 在 Fragment 中
class MainFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect { state ->
                    render(state)
                }
            }
        }
    }
}
```

### LifecycleService

对于 Service，可以使用 LifecycleService 来获得生命周期感知能力：

```kotlin
class MyLifecycleService : LifecycleService() {
    
    override fun onCreate() {
        super.onCreate()
        
        lifecycleScope.launch {
            // Service 中的协程
        }
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        return START_STICKY
    }
}
```

---

## 面试考点

### 基础问题

#### Q1: Lifecycle 组件的主要作用是什么？

**参考答案：**
Lifecycle 组件的主要作用是：
1. **生命周期感知**：让组件能够感知 Activity/Fragment 的生命周期状态
2. **防止内存泄漏**：自动在适当时机停止后台任务
3. **代码解耦**：将生命周期相关逻辑从 Activity/Fragment 中分离
4. **简化开发**：减少样板代码，提高代码可维护性

#### Q2: Lifecycle 有哪些状态？请按顺序说明。

**参考答案：**
Lifecycle 有 5 种状态：
1. `INITIALIZED` - 初始状态
2. `CREATED` - 已创建（onCreate 之后）
3. `STARTED` - 已启动（onStart 之后）
4. `RESUMED` - 活跃状态（onResume 之后）
5. `DESTROYED` - 已销毁

状态转换是单向的，只能通过事件推进。

#### Q3: @OnLifecycleEvent 注解有哪些用法？

**参考答案：**
```kotlin
// 1. 无参数
@OnLifecycleEvent(Lifecycle.Event.ON_START)
fun onStart() {}

// 2. 接收 LifecycleOwner
@OnLifecycleEvent(Lifecycle.Event.ON_START)
fun onStart(owner: LifecycleOwner) {}

// 3. 接收 LifecycleOwner 和 Event（仅用于 ON_ANY）
@OnLifecycleEvent(Lifecycle.Event.ON_ANY)
fun onAny(owner: LifecycleOwner, event: Lifecycle.Event) {}
```

注意：该注解在 2.4.0 后已废弃，推荐使用 DefaultLifecycleObserver。

#### Q4: LifecycleOwner 和 LifecycleObserver 的区别？

**参考答案：**
- **LifecycleOwner**：拥有生命周期的组件（如 Activity、Fragment），提供 `getLifecycle()` 方法
- **LifecycleObserver**：观察生命周期变化的接口，通过注解或接口方法响应生命周期事件

关系：LifecycleOwner 持有 Lifecycle，LifecycleObserver 观察 Lifecycle。

### 进阶问题

#### Q5: 如何在 ViewModel 中感知生命周期？

**参考答案：**
ViewModel 本身不应该直接持有 Context 或感知生命周期，但可以通过以下方式间接实现：

```kotlin
// 方式 1：使用 SavedStateHandle
class MyViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {}

// 方式 2：通过 LiveData/StateFlow 在 UI 层感知
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<Data>()
    val data: LiveData<Data> = _data
    
    fun loadData() {
        viewModelScope.launch {
            // 协程自动在 ViewModel 清除时取消
        }
    }
}

// 方式 3：使用 LifecycleCoroutineScope（在 Activity/Fragment 中）
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.dataFlow.collect { }
    }
}
```

#### Q6: repeatOnLifecycle 和 flowWithLifecycle 的区别？

**参考答案：**
- **repeatOnLifecycle**：是 lifecycle-runtime-ktx 提供的扩展函数，当生命周期低于指定状态时取消协程，回到该状态时重新启动
- **flowWithLifecycle**：是 lifecycle-livedata-ktx 提供的 Flow 扩展，在生命周期低于指定状态时停止发射

```kotlin
// repeatOnLifecycle - 重新启动
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        flow.collect { } // 每次重新启动都会重新收集
    }
}

// flowWithLifecycle - 暂停/恢复
lifecycleScope.launch {
    flow.flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
        .collect { } // 暂停时不发射，恢复时继续
}
```

#### Q7: 如何处理 Fragment 的生命周期观察？

**参考答案：**
Fragment 有两个 LifecycleOwner：
1. `fragment.lifecycle` - Fragment 自身的生命周期
2. `fragment.viewLifecycleOwner.lifecycle` - Fragment 视图的生命周期

```kotlin
class MyFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 观察视图生命周期（推荐用于 UI 相关）
        viewLifecycleOwner.lifecycle.addObserver(object : LifecycleObserver {
            @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
            fun onDestroy() {
                // 清理视图相关资源
            }
        })
        
        // 观察 Fragment 生命周期（用于 Fragment 本身的状态）
        lifecycle.addObserver(object : LifecycleObserver {
            @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
            fun onDestroy() {
                // 清理 Fragment 相关资源
            }
        })
        
        // LiveData 观察应该使用 viewLifecycleOwner
        viewModel.data.observe(viewLifecycleOwner) { }
    }
}
```

#### Q8: Lifecycle 的原理是什么？

**参考答案：**
Lifecycle 的核心实现基于观察者模式：

1. **LifecycleRegistry**：Lifecycle 的具体实现，维护当前状态和观察者列表
2. **ObserverWithState**：包装观察者，跟踪其当前状态
3. **状态同步**：当 LifecycleOwner 状态变化时，LifecycleRegistry 计算需要分发给每个观察者的事件
4. **事件分发**：按顺序调用观察者的对应方法

```
Activity → ReportFragment (注入) → LifecycleRegistry → 通知所有 Observer
```

在 Activity 中，通过 `ReportFragment` 注入生命周期事件；在 Fragment 中，直接由 Fragment 管理。

---

## 最佳实践与常见错误

### 最佳实践

#### 1. 使用 DefaultLifecycleObserver 替代注解

```kotlin
// ✅ 推荐
class MyObserver : DefaultLifecycleObserver {
    override fun onStart(owner: LifecycleOwner) { }
    override fun onStop(owner: LifecycleOwner) { }
}

// ❌ 不推荐（已废弃）
class MyObserver : LifecycleObserver {
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart() { }
}
```

#### 2. 正确使用 viewLifecycleOwner

```kotlin
// ✅ 正确：使用 viewLifecycleOwner 观察 UI 相关数据
viewModel.uiState.observe(viewLifecycleOwner) { state ->
    updateUI(state)
}

// ❌ 错误：使用 this（Fragment 本身）可能导致空指针
viewModel.uiState.observe(this) { state ->
    updateUI(state) // view 可能为 null
}
```

#### 3. 及时移除观察者

```kotlin
// ✅ 推荐：在适当时机移除
class MyActivity : AppCompatActivity() {
    private val observer = MyObserver()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycle.addObserver(observer)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        lifecycle.removeObserver(observer)
    }
}

// 或者让 Lifecycle 自动管理（观察者内部处理）
```

#### 4. 使用 lifecycleScope 替代手动管理协程

```kotlin
// ✅ 推荐
lifecycleScope.launch {
    val data = fetchData()
    updateUI(data)
}

// ❌ 不推荐
val job = CoroutineScope(Dispatchers.Main).launch {
    val data = fetchData()
    updateUI(data)
}
// 需要手动取消
```

### 常见错误

#### 错误 1：在错误的生命周期阶段访问 View

```kotlin
// ❌ 错误
class MyFragment : Fragment() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 此时 view 还未创建
        textView.text = "Hello" // NullPointerException
    }
}

// ✅ 正确
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    textView.text = "Hello"
}
```

#### 错误 2：忘记处理配置变化

```kotlin
// ❌ 错误：屏幕旋转后重复注册
class MyActivity : AppCompatActivity() {
    private val observer = MyObserver()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycle.addObserver(observer) // 每次 recreate 都添加
    }
}

// ✅ 正确：观察者应该是幂等的，或使用单例
```

#### 错误 3：在后台线程更新 Lifecycle

```kotlin
// ❌ 错误
lifecycleScope.launch(Dispatchers.IO) {
    lifecycleRegistry.currentState = Lifecycle.State.STARTED // 必须在主线程
}

// ✅ 正确
lifecycleScope.launch(Dispatchers.Main) {
    lifecycleRegistry.currentState = Lifecycle.State.STARTED
}
```

#### 错误 4：过度使用 LifecycleObserver

```kotlin
// ❌ 不推荐：简单逻辑不需要观察者
class SimpleObserver : LifecycleObserver {
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart() {
        Log.d("TAG", "Started") // 仅仅打印日志
    }
}

// ✅ 推荐：直接在 Activity 中处理
override fun onStart() {
    super.onStart()
    Log.d("TAG", "Started")
}
```

---

## 参考资料

### 官方文档
- [Lifecycle 官方文档](https://developer.android.com/topic/libraries/architecture/lifecycle)
- [Lifecycle 版本说明](https://developer.android.com/jetpack/androidx/releases/lifecycle)
- [处理生命周期](https://developer.android.com/guide/components/activities/activity-lifecycle)

### 源码阅读
- [LifecycleRegistry 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:lifecycle/lifecycle-runtime/src/main/java/androidx/lifecycle/LifecycleRegistry.java)
- [ReportFragment 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:lifecycle/lifecycle-runtime/src/main/java/androidx/lifecycle/ReportFragment.java)

### 相关文章
- [Android Lifecycle 生命周期详解](https://medium.com/androiddevelopers/lifecycle-and-lifecycleowner-coming-soon-8c90e50f8b5)
- [使用 Lifecycle 避免内存泄漏](https://proandroiddev.com/android-architecture-components-lifecycle-observability-101-850d19c182c4)

---

## 总结

Lifecycle 组件是 Android Jetpack 的核心组件之一，它提供了：

1. **统一的生命周期管理**：标准化的状态和事件模型
2. **生命周期感知能力**：让组件能够响应生命周期变化
3. **内存泄漏防护**：自动在适当时机清理资源
4. **代码解耦**：将生命周期逻辑与业务逻辑分离

掌握 Lifecycle 对于编写高质量、可维护的 Android 应用至关重要。在面试中，Lifecycle 相关的知识点经常与 ViewModel、LiveData、协程等结合考察，需要深入理解其原理和使用场景。
