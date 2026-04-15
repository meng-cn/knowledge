# Android BroadcastReceiver 广播 - 全面详解

> 广播接收器是 Android 四大组件之一，用于接收和响应系统或应用发布的广播消息。

---

## 目录

1. [BroadcastReceiver 基础概念](#1-broadcastreceiver-基础概念)
2. [静态注册 vs 动态注册](#2-静态注册-vs-动态注册)
3. [有序广播 vs 无序广播](#3-有序广播-vs-无序广播)
4. [本地广播方案](#4-本地广播方案)
5. [系统广播](#5-系统广播)
6. [自定义广播](#6-自定义广播)
7. [Android 12+ 广播限制](#7-android-12-广播限制)
8. [广播优先级](#8-广播优先级)
9. [广播安全性](#9-广播安全性)
10. [面试考点](#10-面试考点)

---

## 1. BroadcastReceiver 基础概念

### 1.1 什么是 BroadcastReceiver

BroadcastReceiver（广播接收器）是 Android 四大组件之一，用于接收系统或其他应用发送的广播消息。

**核心特点：**

- ✅ 实现组件间通信
- ✅ 松耦合架构
- ✅ 系统事件监听
- ✅ 跨应用通信
- ⚠️ 无法长时间运行（执行时间有限制）
- ⚠️ 没有 UI

### 1.2 广播工作机制

```
┌─────────────────────────────────────────────────────────┐
│                   Android 广播机制                      │
│                                                        │
│   ┌───────┐     发送广播     ┌─────────────────┐       │
│   │ 发送者 │ ──────────────> │   Android 系统   │       │
│   │ (App) │                  │   (广播管理器)  │       │
│   └───────┘                  └────────┬────────┘       │
│                                       │                │
│                    匹配 IntentFilter   │                │
│               ┌───────────────────────┼──────────┐     │
│               │                       │          │     │
│               ▼                       ▼          ▼     │
│          ┌───────┐              ┌───────┐  ┌───────┐  │
│          │ 接收者 1│              │ 接收者 2│  │ 接收者 3│  │
│          └───────┘              └───────┘  └───────┘  │
│               │                       │          │     │
│               └───────────────────────┴──────────┘     │
│                             │                          │
│                             ▼                          │
│                    调用 onReceive()                     │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

### 1.3 使用场景

```kotlin
// 场景 1：监听系统事件
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // 系统启动完成后执行
        }
    }
}

// 场景 2：通知栏操作
class NotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_PLAY -> { /* 播放 */ }
            ACTION_PAUSE -> { /* 暂停 */ }
        }
    }
}

// 场景 3：应用间通信
class DataSyncReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // 接收其他应用发送的数据
    }
}
```

---

## 2. 静态注册 vs 动态注册

这是面试中最常考的区别！

### 2.1 对比表

| 特性 | 静态注册 | 动态注册 |
|------|---------|---------|
| 注册位置 | AndroidManifest.xml | 代码中 |
| 生命周期 | 与应用生命周期相同 | 与注册对象生命周期相同 |
| 启动能力 | 可以启动应用（BOOT_COMPLETED） | 应用需已运行 |
| 注销方式 | 无需注销 | 需手动 unregisterReceiver |
| 系统广播 | 可接收部分系统广播 | 可接收系统广播 |
| 内存泄漏 | 不会泄漏 | 忘记注销会泄漏 |
| 推荐度 | 系统事件 | 应用内事件 |

### 2.2 静态注册

**在 AndroidManifest.xml 中声明：**

```xml
<manifest>
    <application>
        <!-- 静态注册广播接收器 -->
        <receiver
            android:name=".BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
        
        <!-- 多个 action 监听 -->
        <receiver android:name=".PowerReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.ACTION_POWER_CONNECTED" />
                <action android:name="android.intent.action.ACTION_POWER_DISCONNECTED" />
            </intent-filter>
        </receiver>
        
        <!-- 私有广播（设置权限） -->
        <receiver
            android:name=".PrivateReceiver"
            android:permission="com.example.PRIVATE_BROADCAST_PERMISSION">
            <intent-filter>
                <action android:name="com.example.PRIVATE_ACTION" />
            </intent-filter>
        </receiver>
    </application>
</manifest>
```

**静态注册的 Receiver 实现：**

```kotlin
class BootReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d("BootReceiver", "系统启动完成")
                
                // 启动服务
                val serviceIntent = Intent(context, MyService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
                
                // 启动应用（如果需要）
                val mainIntent = context.packageManager
                    .getLaunchIntentForPackage(context.packageName)
                mainIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                // context.startActivity(mainIntent)
            }
            
            Intent.ACTION_SHUTDOWN -> {
                Log.d("BootReceiver", "系统即将关闭")
            }
        }
    }
}
```

**静态注册特点：**

- ✅ 应用未启动时也能接收广播（如 BOOT_COMPLETED）
- ✅ 无需手动管理生命周期
- ⚠️ 无法直接访问 Activity 上下文
- ⚠️ 接收器会被常驻，占用内存

### 2.3 动态注册

**在代码中注册和注销：**

```kotlin
class MainActivity : AppCompatActivity() {
    
    // 广播接收器实例
    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                Intent.ACTION_BATTERY_CHANGED -> {
                    val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, 0)
                    val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
                    val batteryPercent = (level * 100 / scale)
                    Log.d("Battery", "电量：$batteryPercent%")
                }
                Intent.ACTION_BATTERY_LOW -> {
                    Log.d("Battery", "电量低")
                }
                Intent.ACTION_BATTERY_OKAY -> {
                    Log.d("Battery", "电量充足")
                }
            }
        }
    }
    
    // 使用 Lambda 简化
    private val networkReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // 网络变化处理
        }
    }
    
    // 或使用普通类
    private val customReceiver = CustomReceiver()
    
    override fun onResume() {
        super.onResume()
        
        // 注册电池变化广播（sticky 广播）
        registerReceiver(
            batteryReceiver,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )
        
        // 注册网络变化广播
        val networkFilter = IntentFilter().apply {
            addAction(ConnectivityManager.CONNECTIVITY_ACTION)
        }
        registerReceiver(networkReceiver, networkFilter)
        
        // 注册自定义广播
        registerReceiver(
            customReceiver,
            IntentFilter("com.example.CUSTOM_ACTION")
        )
    }
    
    override fun onPause() {
        super.onPause()
        
        // 必须注销，否则内存泄漏
        try {
            unregisterReceiver(batteryReceiver)
            unregisterReceiver(networkReceiver)
            unregisterReceiver(customReceiver)
        } catch (e: IllegalArgumentException) {
            // 接收器未注册时抛出异常
            Log.e("MainActivity", "Receiver not registered", e)
        }
    }
}
```

**动态注册特点：**

- ✅ 可以访问 Activity 上下文
- ✅ 按需注册，节省资源
- ⚠️ 必须手动注销，否则内存泄漏
- ⚠️ 应用未运行时无法接收

### 2.4 动态注册的最佳实践

**使用 Lifecycle 自动管理：**

```kotlin
class MainActivity : AppCompatActivity() {
    
    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // 处理电池变化
        }
    }
    
    // 使用 LifecycleOwner 自动管理注册/注销
    private val lifecycleReceiver = LifecycleBroadcastReceiver(
        this,
        IntentFilter(Intent.ACTION_BATTERY_CHANGED).apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }
    ) { context, intent ->
        when (intent.action) {
            Intent.ACTION_BATTERY_CHANGED -> { /* 处理 */ }
            Intent.ACTION_SCREEN_ON -> { /* 处理 */ }
            Intent.ACTION_SCREEN_OFF -> { /* 处理 */ }
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 在 ON_START 时注册，ON_STOP 时注销
    }
}

// 自定义 LifecycleBroadcastReceiver
class LifecycleBroadcastReceiver(
    lifecycleOwner: LifecycleOwner,
    private val filter: IntentFilter,
    private val onReceive: (Context, Intent) -> Unit
) : BroadcastReceiver() {
    
    init {
        // 注册 Lifecycle 回调
        lifecycleOwner.lifecycle.addObserver(object : LifecycleObserver {
            @OnLifecycleEvent(Lifecycle.Event.ON_START)
            fun onStart(context: Context) {
                context.registerReceiver(this@LifecycleBroadcastReceiver, filter)
            }
            
            @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
            fun onStop(context: Context) {
                context.unregisterReceiver(this@LifecycleBroadcastReceiver)
            }
        })
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        onReceive(context, intent)
    }
}
```

---

## 3. 有序广播 vs 无序广播

### 3.1 核心区别

| 特性 | 有序广播 | 无序广播 |
|------|---------|---------|
| 传递方式 | 顺序传递 | 并行传递 |
| 接收顺序 | 按优先级 | 无固定顺序 |
| 可拦截 | 是（abortBroadcast） | 否 |
| 传递速度 | 慢 | 快 |
| 使用场景 | 需要处理顺序的场景 | 简单通知 |
| 系统广播 | 多为有序 | 多为无序 |

### 3.2 无序广播

**发送无序广播：**

```kotlin
// 发送无序广播（默认）
fun sendNormalBroadcast(context: Context) {
    val intent = Intent("com.example.NORMAL_ACTION")
    intent.putExtra("data", "无序广播数据")
    
    // sendBroadcast 发送无序广播
    context.sendBroadcast(intent)
}
```

**特点：** 所有接收者同时收到广播，没有先后顺序。

```
┌─────────────────────────────────────────┐
│          无序广播传递过程                │
│                                         │
│  发送者 ──> 系统 ──> 接收者 1            │
│                    ├─> 接收者 2          │
│                    ├─> 接收者 3          │
│                    └─> 接收者 4          │
│                    （同时到达）          │
└─────────────────────────────────────────┘
```

### 3.3 有序广播

**发送有序广播：**

```kotlin
fun sendOrderedBroadcast(context: Context) {
    val intent = Intent("com.example.ORDERED_ACTION")
    intent.putExtra("data", "有序广播数据")
    
    // sendOrderedBroadcast 发送有序广播
    // 参数说明：
    // 1. Intent：广播内容
    // 2. receiverPermission：权限控制（可为 null）
    // 3. resultReceiver：第一个接收者
    // 4. orderingHint：排序提示
    context.sendOrderedBroadcast(
        intent,
        null,  // 不限制权限
        null,  // 从系统注册的接收器开始
        Context.BROADCAST_ORDER_NORMAL  // 按优先级排序
    )
}

// 指定接收器优先级
context.sendOrderedBroadcast(
    intent,
    "com.example.MY_PERMISSION",
    myReceiver,  // 该接收器优先生成结果
    null,
    Context.BROADCAST_ORDER_NORMAL,
    null,
    null
)
```

**有序广播的拦截：**

```kotlin
class OrderedReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            "com.example.ORDERED_ACTION" -> {
                // 获取上一个接收器的结果
                val resultData = getResultData()
                val resultCode = getResultCode()
                
                Log.d("OrderedReceiver", "收到数据：$resultData")
                
                // 设置当前结果
                setResultCode(Activity.RESULT_OK)
                setResultData("处理后的数据")
                
                // 拦截广播，后续接收器收不到
                if (shouldAbort) {
                    abortBroadcast()
                    Log.d("OrderedReceiver", "广播已拦截")
                }
            }
        }
    }
}
```

**有序广播传递过程：**

```
┌──────────────────────────────────────────────┐
│            有序广播传递过程                  │
│                                             │
│  发送者 ──> 系统 ──> 接收者 1 (优先级 1)      │
│                     │                       │
│                     ├─> abortBroadcast?     │
│                     │    是：结束            │
│                     │    否：继续           │
│                     ▼                       │
│                    接收者 2 (优先级 0)        │
│                     │                       │
│                     ▼                       │
│                    接收者 3 (优先级 -1)       │
│                                             │
│  每个接收器都可以：                          │
│  - 查看并修改上一个的结果                    │
│  - 设置自己的结果                            │
│  - 拦截广播（abortBroadcast）               │
└──────────────────────────────────────────────┘
```

### 3.4 优先级设置

**在 Manifest 中设置优先级：**

```xml
<receiver android:name=".HighPriorityReceiver" android:exported="true">
    <intent-filter android:priority="1000">
        <action android:name="com.example.ACTION" />
    </intent-filter>
</receiver>

<receiver android:name=".NormalReceiver" android:exported="true">
    <intent-filter android:priority="500">
        <action android:name="com.example.ACTION" />
    </intent-filter>
</receiver>

<receiver android:name=".LowPriorityReceiver" android:exported="true">
    <intent-filter android:priority="0">
        <action android:name="com.example.ACTION" />
    </intent-filter>
</receiver>
```

**优先级范围：** -1000 到 1000，数值越大优先级越高

---

## 4. 本地广播方案

### 4.1 LocalBroadcastManager（已废弃）

LocalBroadcastManager 曾是 Google 推荐的本地广播方案，但已在 API 30 被废弃。

**废弃原因：**

- 使用静态变量，容易导致内存泄漏
- 无法在 Service 等组件中方便使用
- 与 Android 生命周期集成不好

**历史用法（了解即可）：**

```kotlin
// ❌ 已废弃
LocalBroadcastManager.getInstance(context)
    .sendBroadcast(intent)

LocalBroadcastManager.getInstance(context)
    .registerReceiver(receiver, filter)
```

### 4.2 替代方案 1：BroadcastDispatcher（推荐）

```kotlin
// 定义广播事件
data class BatteryLowEvent(val level: Int)
data class NetworkChangedEvent(val isAvailable: Boolean)

// 广播发送者
class BroadcastDispatcher {
    
    @Volatile
    private var instance: BroadcastDispatcher? = null
    
    companion object {
        val current: BroadcastDispatcher by lazy {
            instance ?: synchronized(this) {
                instance ?: BroadcastDispatcher().also { instance = it }
            }
        }
    }
    
    private val broadcastQueue = ConcurrentHashMap<String, MutableList<BroadcastListener>>()
    private val mainThreadHandler = Handler(Looper.getMainLooper())
    
    fun register(action: String, listener: BroadcastListener) {
        broadcastQueue.getOrPut(action) { mutableListOf() }
            .add(listener)
    }
    
    fun unregister(action: String, listener: BroadcastListener) {
        broadcastQueue[action]?.remove(listener)
    }
    
    fun send(action: String, data: Bundle? = null) {
        val listeners = broadcastQueue[action] ?: return
        
        for (listener in listeners) {
            mainThreadHandler.post {
                listener.onReceive(action, data)
            }
        }
    }
    
    interface BroadcastListener {
        fun onReceive(action: String, data: Bundle?)
    }
}

// 使用示例
class MainActivity : AppCompatActivity() {
    
    private val listener = BroadcastDispatcher.BroadcastListener { action, data ->
        when (action) {
            "com.example.BATTERY_LOW" -> {
                val level = data?.getInt("level") ?: 0
                showToast("电量低：$level%")
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        BroadcastDispatcher.current.register("com.example.BATTERY_LOW", listener)
    }
    
    override fun onPause() {
        super.onPause()
        BroadcastDispatcher.current.unregister("com.example.BATTERY_LOW", listener)
    }
}
```

### 4.3 替代方案 2：Flow（Kotlin 协程）

```kotlin
// 创建共享 Flow
object EventBus {
    private val _events = MutableSharedFlow<Event>()
    val events: SharedFlow<Event> = _events.asSharedFlow()
    
    fun emit(event: Event) {
        _events.tryEmit(event)
    }
}

sealed class Event {
    data class BatteryChanged(val level: Int) : Event()
    data class NetworkChanged(val isAvailable: Boolean) : Event()
    data class DataUpdated(val data: String) : Event()
}

// 发送事件
EventBus.emit(Event.BatteryChanged(15))

// 接收事件（在 ViewModel 中）
class MyViewModel : ViewModel() {
    val events = EventBus.events
    
    fun sendBatteryEvent(level: Int) {
        EventBus.emit(Event.BatteryChanged(level))
    }
}

// 在 Activity 中观察
class MainActivity : AppCompatActivity() {
    
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.events.collect { event ->
                    when (event) {
                        is Event.BatteryChanged -> {
                            showToast("电量：${event.level}%")
                        }
                        is Event.NetworkChanged -> {
                            updateNetworkUI(event.isAvailable)
                        }
                    }
                }
            }
        }
    }
}
```

### 4.4 替代方案 3：LiveData

```kotlin
// 使用 LiveData 进行应用内通信
class EventBus {
    private val _events = MutableLiveData<Event>()
    val events: LiveData<Event> = _events
    
    fun post(event: Event) {
        _events.postValue(event)
    }
}

// 使用
eventBus.post(Event.BatteryChanged(15))

viewModel.events.observe(this) { event ->
    when (event) {
        is Event.BatteryChanged -> showToast("电量：${event.level}%")
    }
}
```

---

## 5. 系统广播

### 5.1 常用系统广播分类

**电源相关：**

```kotlin
// 电池电量变化
IntentFilter().apply {
    addAction(Intent.ACTION_BATTERY_CHANGED)  // sticky 广播
    addAction(Intent.ACTION_BATTERY_LOW)
    addAction(Intent.ACTION_BATTERY_OKAY)
    addAction(Intent.ACTION_POWER_CONNECTED)
    addAction(Intent.ACTION_POWER_DISCONNECTED)
}

// 充电状态
val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, 0)
val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, 0)
val temperature = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0)
val voltage = intent.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0)
```

**网络相关：**

```kotlin
// 网络状态变化
IntentFilter().apply {
    addAction(ConnectivityManager.CONNECTIVITY_ACTION)  // API 21+ 废弃
    addAction(WifiManager.WIFI_STATE_CHANGED_ACTION)
    addAction(WifiManager.RSSI_CHANGED_ACTION)
}

// API 21+ 推荐使用
val broadcastReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            WifiManager.WIFI_STATE_CHANGED_ACTION -> {
                val state = intent.getIntExtra(
                    WifiManager.EXTRA_WIFI_STATE,
                    WifiManager.WIFI_STATE_UNKNOWN
                )
            }
        }
    }
}
```

**启动相关：**

```kotlin
// 系统启动
IntentFilter().apply {
    addAction(Intent.ACTION_BOOT_COMPLETED)  // 静态注册
    addAction(Intent.ACTION_QUIET_MODE_SETTING_CHANGED)
    addAction(Intent.ACTION_TIME_TICK)        // 每秒触发
    addAction(Intent.ACTION_TIME_CHANGED)     // 时间变化
    addAction(Intent.ACTION_DATE_CHANGED)     // 日期变化
}
```

**显示相关：**

```kotlin
IntentFilter().apply {
    addAction(Intent.ACTION_SCREEN_ON)
    addAction(Intent.ACTION_SCREEN_OFF)
    addAction(Intent.ACTION_USER_PRESENT)     // 解锁
    addAction(Intent.ACTION_DISPLAY_CHANGED)  // 显示配置变化
}
```

**存储相关：**

```kotlin
IntentFilter().apply {
   .addAction(Intent.ACTION_EXTERNAL_STORAGEMounted)
    addAction(Intent.ACTION_MEDIA_UNMOUNTED)
    addAction(Intent.ACTION_MEDIA_EJECT)
    addAction(Intent.ACTION_MEDIA_REMOUNT)
}
```

**电话相关：**

```kotlin
IntentFilter().apply {
    addAction(TelephonyManager.ACTION_PHONE_STATE_CHANGED)
}

// 处理电话状态
val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
when (state) {
    TelephonyManager.EXTRA_STATE_IDLE -> { /* 空闲 */ }
    TelephonyManager.EXTRA_STATE_RINGING -> { /* 来电 */ }
    TelephonyManager.EXTRA_STATE_OFFHOOK -> { /* 通话中 */ }
}
```

### 5.2 Sticky 广播

**什么是 Sticky 广播：**

Sticky 广播是指发送后会保留在系统中的广播，新注册的接收器会立即收到最后一次的广播数据。

**Sticky 广播列表：**

```kotlin
// 以下是常见的 Sticky 广播
Intent.ACTION_BATTERY_CHANGED
Intent.ACTION_BATTERY_LOW
Intent.ACTION_BATTERY_OKAY
Intent.ACTION_BATTERY_HEALTH
Intent.ACTION_SCREEN_OFF
Intent.ACTION_SCREEN_ON
Intent.ACTION_TIME_TICK
Intent.ACTION_TIME_CHANGED
Intent.ACTION_DATE_CHANGED

// 获取 Sticky 广播
val batteryIntent = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, 0)
```

**获取当前电池状态的完整示例：**

```kotlin
fun getBatteryInfo(context: Context): BatteryInfo {
    val intent = context.registerReceiver(
        null,
        IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    )
    
    val level = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, 0) ?: 0
    val scale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, 100) ?: 100
    val status = intent?.getIntExtra(BatteryManager.EXTRA_STATUS, 0) ?: 0
    val health = intent?.getIntExtra(BatteryManager.EXTRA_HEALTH, 0) ?: 0
    val temp = intent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0
    val voltage = intent?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0) ?: 0
    
    return BatteryInfo(
        percent = (level * 100 / scale),
        status = status,
        health = health,
        temperature = temp,
        voltage = voltage
    )
}

data class BatteryInfo(
    val percent: Int,
    val status: Int,
    val health: Int,
    val temperature: Int,
    val voltage: Int
)
```

**Sticky 广播的局限：**

从 Android 8.0 开始，大部分 Sticky 广播已被移除或限制。

### 5.3 系统广播的权限

```xml
<!-- AndroidManifest.xml -->
<manifest>
    <!-- 电池状态（无需权限） -->
    <!-- 网络状态（需权限） -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- 电话状态（需权限） -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    
    <!-- 蓝牙状态 -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    
    <!-- 同步状态 -->
    <uses-permission android:name="android.permission.READ_SYNC_STATS" />
    
    <!-- 设备存储 -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
</manifest>
```

---

## 6. 自定义广播

### 6.1 发送自定义广播

```kotlin
// 定义广播 Action
object BroadcastActions {
    const val DATA_UPDATED = "com.example.DATA_UPDATED"
    const val USER_LOGGED_IN = "com.example.USER_LOGGED_IN"
    const val ITEM_DELETED = "com.example.ITEM_DELETED"
}

// 发送普通广播
fun sendDataUpdatedBroadcast(context: Context, data: String) {
    val intent = Intent(BroadcastActions.DATA_UPDATED)
    intent.putExtra("data", data)
    intent.putExtra("timestamp", System.currentTimeMillis())
    
    // 发送无序广播
    context.sendBroadcast(intent)
}

// 发送有序广播
fun sendOrderedBroadcast(context: Context) {
    val intent = Intent(BroadcastActions.USER_LOGGED_IN)
    context.sendOrderedBroadcast(intent, null)
}

// 发送本地广播（应用内）
fun sendLocalBroadcast(context: Context) {
    val intent = Intent(BroadcastActions.ITEM_DELETED)
    intent.setPackage(context.packageName)  // 限制为本应用
    context.sendBroadcast(intent)
}

// 发送带有权限的广播
fun sendProtectedBroadcast(context: Context) {
    val intent = Intent("com.example.PROTECTED_ACTION")
    context.sendBroadcast(
        intent,
        "com.example.MY_BROADCAST_PERMISSION"
    )
}
```

### 6.2 接收自定义广播

```kotlin
// 静态注册
class CustomReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            BroadcastActions.DATA_UPDATED -> {
                val data = intent.getStringExtra("data")
                val timestamp = intent.getLongExtra("timestamp", 0)
                
                // 处理数据更新
                updateUI(data)
            }
            
            BroadcastActions.USER_LOGGED_IN -> {
                // 用户登录，刷新数据
                refreshData()
            }
            
            BroadcastActions.ITEM_DELETED -> {
                val itemId = intent.getStringExtra("item_id")
                // 删除 UI 中的对应项
                removeItem(itemId)
            }
        }
    }
}

// AndroidManifest.xml
<receiver
    android:name=".CustomReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="com.example.DATA_UPDATED" />
        <action android:name="com.example.USER_LOGGED_IN" />
        <action android:name="com.example.ITEM_DELETED" />
    </intent-filter>
</receiver>
```

### 6.3 广播数据传输

**基本数据类型：**

```kotlin
val intent = Intent("com.example.DATA_ACTION")
intent.putExtra("string", "文本数据")
intent.putExtra("int", 123)
intent.putExtra("long", 123456789L)
intent.putExtra("float", 3.14f)
intent.putExtra("double", 3.14159)
intent.putExtra("boolean", true)
intent.putExtra("char", 'A')

// 接收
val string = intent.getStringExtra("string")
val int = intent.getIntExtra("int", 0)
val long = intent.getLongExtra("long", 0L)
val float = intent.getFloatExtra("float", 0f)
val double = intent.getDoubleExtra("double", 0.0)
val boolean = intent.getBooleanExtra("boolean", false)
val char = intent.getStringExtra("char")?.first()
```

**复杂数据类型：**

```kotlin
// Serializable
class UserSerializable(
    val name: String,
    val age: Int
) : Serializable

intent.putExtra("user", UserSerializable("张三", 25))
val user = intent.getSerializableExtra("user") as? UserSerializable

// Parcelable（推荐）
@Parcelize
data class UserParcelable(
    val name: String,
    val age: Int
) : Parcelable

intent.putExtra("user", UserParcelable("张三", 25))
val user = intent.getParcelableExtra<UserParcelable>("user")

// 数组
intent.putStringArrayListExtra("names", arrayListOf("张三", "李四"))
val names = intent.getStringArrayListExtra("names")

// Bundle
val bundle = Bundle().apply {
    putString("name", "张三")
    putInt("age", 25)
}
intent.putExtra("user", bundle)
val bundle = intent.getBundleExtra("user")
```

---

## 7. Android 12+ 广播限制

### 7.1 Manifest 声明限制

从 Android 12（API 31）开始，对静态注册的广播接收器实施了更严格的限制。

**隐含权限广播不再工作：**

以下广播在 Android 12+ 不再通过静态注册接收：

```kotlin
// ❌ Android 12+ 无法通过静态注册接收这些广播
TelephonyManager.ACTION_NETWORK_STATE_CHANGED
ConnectivityManager.CONNECTIVITY_ACTION
BluetoothAdapter.ACTION_STATE_CHANGED
BatteryManager.ACTION_BATTERY_CHANGED
```

**需要显式声明的广播：**

```xml
<!-- ✅ 可以在 Manifest 中声明的广播 -->
<intent-filter>
    <action android:name="android.intent.action.BOOT_COMPLETED" />
    <action android:name="android.intent.action.TIME_SET" />
    <action android:name="android.intent.action.DATE_CHANGED" />
    <action android:name="android.intent.action.TIME_TICK" />
    <action android:name="android.intent.action.PACKAGE_ADDED" />
    <action android:name="android.intent.action.PACKAGE_REMOVED" />
    <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
</intent-filter>

<!-- ❌ 不完整的声明（Android 12+ 无效） -->
<intent-filter>
    <action android:name="android.net.wifi.WIFI_STATE_CHANGED" />
</intent-filter>
```

**完整可用的系统广播列表：**

Android 12+ 允许静态注册的广播主要分为两类：

1. **完全可用**：不需要额外权限
2. **需要权限**：需要声明对应的权限

### 7.2 动态注册替代方案

**方案 1：使用动态注册 + 保活**

```kotlin
class MyApplication : Application() {
    
    private val networkReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // 处理网络变化
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // 在 Application 中注册
        registerReceiver(
            networkReceiver,
            IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION)
        )
    }
    
    // Application 生命周期长，适合全局监听
}
```

**方案 2：使用 WorkManager + 定时检查**

```kotlin
class NetworkCheckWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        // 检查网络状态
        val isOnline = isNetworkAvailable(applicationContext)
        
        if (isOnline) {
            // 网络可用，执行同步
            syncData()
        }
        
        return Result.success()
    }
}

// 设置周期性检查
val workRequest = PeriodicWorkRequestBuilder<NetworkCheckWorker>(15, TimeUnit.MINUTES)
    .build()

WorkManager.getInstance(applicationContext).enqueue(workRequest)
```

### 7.3 前台服务监听广播

```kotlin
class MonitoringService : Service() {
    
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // 在前台服务中处理广播
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        
        startForeground(NOTIFICATION_ID, notification)
        
        // 在前台服务中注册广播
        registerReceiver(
            receiver,
            IntentFilter().apply {
                addAction(Intent.ACTION_SCREEN_ON)
                addAction(Intent.ACTION_SCREEN_OFF)
            },
            Context.RECEIVER_NOT_EXPORTED  // 仅接收应用内广播
        )
    }
    
    override fun onDestroy() {
        unregisterReceiver(receiver)
        super.onDestroy()
    }
}
```

---

## 8. 广播优先级

### 8.1 优先级设置

```xml
<!-- AndroidManifest.xml -->
<!-- 高优先级接收器 -->
<receiver
    android:name=".HighPriorityReceiver"
    android:exported="true">
    <intent-filter android:priority="1000">
        <action android:name="com.example.ACTION" />
    </intent-filter>
</receiver>

<!-- 正常优先级 -->
<receiver
    android:name=".NormalReceiver"
    android:exported="true">
    <intent-filter android:priority="500">
        <action android:name="com.example.ACTION" />
    </intent-filter>
</receiver>

<!-- 低优先级 -->
<receiver
    android:name=".LowPriorityReceiver"
    android:exported="true">
    <intent-filter android:priority="0">
        <action android:name="com.example.ACTION" />
    </intent-filter>
</receiver>
```

**优先级数值范围：** -1000 到 1000

### 8.2 优先级应用场景

**应用 1：系统通知拦截**

```kotlin
// 高优先级接收器，优先处理系统通知
class NotificationInterceptReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // 拦截通知
        if (shouldIntercept(intent)) {
            abortBroadcast()
        }
    }
}
```

**应用 2：数据同步优先级**

```kotlin
// 关键数据优先同步
class CriticalSyncReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // 优先处理关键数据
        val criticalData = getResultData()
        processCriticalData(criticalData)
        
        setResultCode(Activity.RESULT_OK)
        setResultData(processedData)
    }
}
```

---

## 9. 广播安全性

### 9.1 权限控制

**设置发送权限：**

```kotlin
// 发送需要权限的广播
context.sendBroadcast(
    intent,
    "com.example.MY_BROADCAST_PERMISSION"
)
```

**设置接收权限：**

```xml
<!-- 定义自定义权限 -->
<permission
    android:name="com.example.MY_BROADCAST_PERMISSION"
    android:protectionLevel="signature" />

<receiver
    android:name=".ProtectedReceiver"
    android:permission="com.example.MY_BROADCAST_PERMISSION"
    android:exported="true">
    <intent-filter>
        <action android:name="com.example.PROTECTED_ACTION" />
    </intent-filter>
</receiver>
```

**权限保护级别：**

| 级别 | 说明 | 使用场景 |
|------|------|---------|
| signature | 签名匹配 | 系统广播、关键操作 |
| signatureOrSystem | 签名或系统 | 系统组件 |
| privileged | 系统特权 | 系统应用 |
| normal | 普通权限 | 一般用途 |

### 9.2 本地广播安全

```kotlin
// 限制广播仅本应用接收
val intent = Intent("com.example.LOCAL_ACTION")
intent.setPackage(context.packageName)  // 关键：限制包名
context.sendBroadcast(intent)
```

### 9.3 防止广播滥用

```kotlin
// 添加频率限制
class RateLimitedReceiver : BroadcastReceiver() {
    
    private val lastReceiveTime = SparseLongArray()
    private val MIN_INTERVAL = 1000L  // 1 秒
    
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        
        val currentTime = System.currentTimeMillis()
        val lastTime = lastReceiveTime[action]
        
        if (currentTime - lastTime < MIN_INTERVAL) {
            Log.w("RateLimitedReceiver", "广播过于频繁，忽略")
            return
        }
        
        lastReceiveTime[action] = currentTime
        handleBroadcast(intent)
    }
}
```

---

## 10. 面试考点

### 10.1 基础题

**Q1: BroadcastReceiver 的作用？**

A: 用于接收系统或其他应用发送的广播消息，实现组件间解耦通信。

**Q2: 静态注册和动态注册的区别？**

A:
- 静态注册：在 Manifest 中声明，应用未启动也能接收（如 BOOT_COMPLETED）
- 动态注册：在代码中注册，需要手动注销，否则内存泄漏
- 静态注册适合系统事件，动态注册适合应用内事件

**Q3: 有序广播和无序广播的区别？**

A:
- 有序广播：按优先级顺序传递，可被拦截
- 无序广播：并行传递，速度快，不可拦截

### 10.2 进阶题

**Q4: 什么是 Sticky 广播？**

A: Sticky 广播发送后会保留在系统中，新注册的接收器会立即收到最后一次的广播数据。如电池状态、网络状态等。

**Q5: LocalBroadcastManager 为什么被废弃？**

A:
- 使用静态变量，容易导致内存泄漏
- 与生命周期集成不好
- 推荐替代方案：Flow、LiveData、自定义广播分发器

**Q6: Android 12+ 广播有什么限制？**

A:
- 隐式广播接收器限制
- 静态注册的系统广播范围缩小
- 需要使用动态注册或前台服务替代

### 10.3 高级题

**Q7: 如何防止广播内存泄漏？**

A:
- 动态注册的接收器必须注销
- 使用弱引用或 Lifecycle 管理
- 避免在接收器中持有 Activity 引用

**Q8: 如何实现安全的广播通信？**

A:
- 设置权限保护
- 使用 setPackage 限制广播范围
- 对敏感操作进行签名验证

**Q9: 广播和 AIDL 的选型？**

A:
- 广播：简单通知、解耦通信、一次性的
- AIDL：复杂数据、需要返回值、频繁通信

---

## 总结

BroadcastReceiver 是 Android 组件间通信的重要机制。掌握要点：

1. 区分静态注册和动态注册的适用场景
2. 理解有序广播和无序广播的传递机制
3. 注意 Android 12+ 的广播限制
4. 使用 Flow/LiveData 替代 LocalBroadcastManager
5. 注意内存泄漏和权限安全
