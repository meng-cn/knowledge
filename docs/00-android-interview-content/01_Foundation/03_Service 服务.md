# Android Service 服务 - 全面详解

> 服务是 Android 四大组件之一，用于在后台执行长时间运行的操作，没有 UI 界面。

---

## 目录

1. [Service 基础概念](#1-service-基础概念)
2. [startService vs bindService](#2-startservice-vs-bindservice)
3. [Service 生命周期详解](#3-service-生命周期详解)
4. [前台服务（Foreground Service）](#4-前台服务 foreground-service)
5. [IntentService 与 ForegroundService](#5-intentservice-与-foregroundservice)
6. [Service 保活方案](#6-service-保活方案)
7. [Service 与 Thread 对比](#7-service-与-thread-对比)
8. [内存泄漏场景](#8-内存泄漏场景)
9. [最佳实践](#9-最佳实践)
10. [面试考点](#10-面试考点)

---

## 1. Service 基础概念

### 1.1 什么是 Service

Service 是 Android 四大组件之一（Activity、Service、BroadcastReceiver、ContentProvider），它是一种可以在后台执行长时间运行操作的组件。

**核心特点：**

- ✅ 没有用户界面
- ✅ 可以长时间运行
- ✅ 由组件启动（Activity、BroadcastReceiver 等）
- ✅ 可以被系统杀死
- ❌ 不在独立线程运行（需要在 Service 内开启新线程执行耗时操作）

### 1.2 Service 使用场景

```kotlin
// 场景 1：音乐播放
class MusicService : Service() {
    // 后台播放音乐，即使用户切换到其他应用
}

// 场景 2：文件下载
class DownloadService : Service() {
    // 下载大文件，用户可切换应用
}

// 场景 3：位置追踪
class LocationService : Service() {
    // 持续获取 GPS 位置
}

// 场景 4：数据同步
class SyncService : Service() {
    // 后台同步数据到服务器
}
```

### 1.3 Service 的局限性

**重要认知：Service 不是独立进程！**

```
┌─────────────────────────────────────┐
│        应用进程 (App Process)        │
│                                     │
│  ┌───────────┐  ┌───────────────┐   │
│  │  Activity │  │   Service     │   │  ← 同一进程，共享内存
│  └───────────┘  └───────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

Service 与应用的其他组件运行在同一个进程中，如果主线程被阻塞，Service 也会受到影响。

### 1.4 Service 声明

**AndroidManifest.xml 中的声明：**

```xml
<manifest>
    <!-- 基础 Service 声明 -->
    <service android:name=".MusicService" />
    
    <!-- 指定进程（多进程 Service） -->
    <service 
        android:name=".HeavyTaskService"
        android:process=":background" />
    
    <!-- 设置导出属性 -->
    <service 
        android:name=".ExportedService"
        android:exported="true" />
    
    <!-- 设置权限 -->
    <service 
        android:name=".SecureService"
        android:permission="com.example.MY_SERVICE_PERMISSION" />
</manifest>
```

---

## 2. startService vs bindService

这是面试中最常考的问题之一，必须深入理解！

### 2.1 启动方式对比

| 特性 | startService() | bindService() |
|------|---------------|---------------|
| 启动方式 | 组件启动 | 绑定启动 |
| 生命周期 | 调用 stopService() 或 Service 调用 stopSelf() 后结束 | 所有客户端解绑后结束 |
| 通信方式 | 单向通知 | 双向 IBinder 通信 |
| 调用 stopSelf() 效果 | 停止 Service | 无效（只要有绑定） |
| 返回 Binder | 无 | 有，可远程调用 |
| 典型场景 | 音乐播放、文件下载 | 与 Service 交互、获取数据 |

### 2.2 startService() 详解

**Activity 启动 Service：**

```kotlin
// 方式 1：使用显式 Intent
class MainActivity : AppCompatActivity() {
    fun startMusicService() {
        val intent = Intent(this, MusicService::class.java)
        // API 21+ 使用 startForegroundService
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }
    
    fun stopMusicService() {
        val intent = Intent(this, MusicService::class.java)
        stopService(intent)
    }
}
```

**startService 的 Service 实现：**

```kotlin
class MusicService : Service() {
    
    private var isPlaying = false
    private var mediaPlayer: MediaPlayer? = null
    
    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {
        // 处理启动命令
        when (intent?.action) {
            ACTION_PLAY -> playMusic()
            ACTION_PAUSE -> pauseMusic()
            ACTION_STOP -> stopMusic()
        }
        
        // 返回值的含义（非常重要！）
        return if (isRecreateNeeded) {
            START_REDELIVER_INTENT  // 服务被杀死后重启，会重新传递 Intent
        } else {
            START_NOT_STICKY        // 服务被杀死后不重启
        }
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        // startService 方式不需要实现
        return null
    }
    
    private fun playMusic() {
        // ⚠️ 注意：onStartCommand 在主线程执行！
        // 耗时操作必须放到子线程
        Handler(Looper.getMainLooper()).post {
            // 创建通知并设为前台服务
            createNotification()
            startForeground(NOTIFICATION_ID, notification)
            
            // 在后台线程播放音乐
            mediaPlayer = MediaPlayer()
            // ... 播放逻辑
        }
    }
    
    companion object {
        const val ACTION_PLAY = "com.example.ACTION_PLAY"
        const val ACTION_PAUSE = "com.example.ACTION_PAUSE"
        const val ACTION_STOP = "com.example.ACTION_STOP"
        const val NOTIFICATION_ID = 1001
    }
}
```

### 2.3 bindService() 详解

**Activity 绑定 Service：**

```kotlin
class MainActivity : AppCompatActivity() {
    
    private var serviceBound = false
    private var musicBinder: MusicService.MusicBinder? = null
    
    // 定义 Service 连接回调
    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            serviceBound = true
            musicBinder = service as MusicService.MusicBinder
            
            // 获取 Service 实例
            val serviceInstance = musicBinder?.service
            
            // 调用 Service 的方法
            serviceInstance?.playMusic()
        }
        
        override fun onServiceDisconnected(name: ComponentName?) {
            serviceBound = false
            musicBinder = null
        }
    }
    
    fun bindToService() {
        val intent = Intent(this, MusicService::class.java)
        bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }
    
    fun unbindFromService() {
        if (serviceBound) {
            unbindService(connection)
            serviceBound = false
            musicBinder = null
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        unbindFromService()
    }
}
```

**bindService 的 Service 实现：**

```kotlin
class MusicService : Service() {
    
    // 暴露给客户端的 Binder
    private val binder = MusicBinder()
    
    // 对外公开的接口
    inner class MusicBinder : Binder() {
        // 获取 Service 实例
        fun getService(): MusicService = this@MusicService
    }
    
    override fun onBind(intent: Intent?): IBinder {
        // 返回 Binder 对象，客户端通过它调用 Service 方法
        return binder
    }
    
    // 暴露的方法
    fun playMusic() {
        Log.d("MusicService", "播放音乐")
        // ... 播放逻辑
    }
    
    fun pauseMusic() {
        Log.d("MusicService", "暂停音乐")
    }
    
    fun stopMusic() {
        Log.d("MusicService", "停止音乐")
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d("MusicService", "Service 创建")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d("MusicService", "Service 销毁")
    }
}
```

### 2.4 混合使用 startService + bindService

**为什么需要混合使用？**

- `startService()`：确保 Service 持续运行
- `bindService()`：与 Service 进行通信

**使用场景：** 音乐播放场景，用户可能切换应用，Service 需要持续运行，但同时需要控制音乐的播放/暂停。

```kotlin
class MainActivity : AppCompatActivity() {
    
    private var serviceBound = false
    private var musicBinder: MusicService.MusicBinder? = null
    
    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            serviceBound = true
            musicBinder = service as MusicService.MusicBinder
            
            // 获取当前播放状态
            musicBinder?.service?.getPlayState()?.observe(this@MainActivity) { state ->
                updateUI(state)
            }
        }
        
        override fun onServiceDisconnected(name: ComponentName?) {
            serviceBound = false
            musicBinder = null
        }
    }
    
    override fun onStart() {
        super.onStart()
        // 启动 Service（保证存活）
        val intent = Intent(this, MusicService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        
        // 绑定 Service（获取通信接口）
        bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }
    
    override fun onStop() {
        super.onStop()
        // 只解绑，不停止 Service
        if (serviceBound) {
            unbindService(connection)
            serviceBound = false
        }
    }
}

class MusicService : Service() {
    
    private var startCount = 0
    private var bindCount = 0
    
    private val binder = MusicBinder()
    
    inner class MusicBinder : Binder() {
        fun getService(): MusicService = this@MusicService
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startCount++
        Log.d("MusicService", "onStartCommand called, count: $startCount")
        return START_NOT_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        bindCount++
        Log.d("MusicService", "onBind called, count: $bindCount")
        return binder
    }
    
    override fun onUnbind(intent: Intent?): Boolean {
        bindCount--
        Log.d("MusicService", "onUnbind called, count: $bindCount")
        return false
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d("MusicService", "onDestroy: startCount=$startCount, bindCount=$bindCount")
    }
}
```

**执行流程分析：**

```
┌─────────────────────────────────────────────────────────┐
│  Activity.onStart()                                     │
│       │                                                 │
│       ├─> startService()                                │
│       │       │                                         │
│       │       └─> Service.onCreate()                    │
│       │            └─> Service.onStartCommand()         │
│       │                                                 │
│       └─> bindService()                                 │
│               │                                         │
│               └─> Service.onBind()                      │
│                    └─> Activity.onServiceConnected()    │
└─────────────────────────────────────────────────────────┘

Activity 解绑时：
Activity.unbindService() -> Service.onUnbind()

只有当 startCount 和 bindCount 都为 0 时，Service 才会调用 onDestroy()
```

---

## 3. Service 生命周期详解

### 3.1 完整生命周期

```
┌─────────────────────────────────────────────────────────────┐
│                    Service 生命周期                          │
│                                                             │
│   startService 方式：                                       │
│   onCreate() → onStartCommand() → (重复调用) → stopSelf()  │
│                                              → onDestroy()  │
│                                                             │
│   bindService 方式：                                        │
│   onCreate() → onBind() → onUnbind() → onDestroy()          │
│                                                             │
│   混合方式：                                                │
│   onCreate() → onStartCommand() + onBind()                  │
│   (stopService && unbindService) → onDestroy()              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 各回调方法详解

**onCreate() - 创建时调用**

```kotlin
class MyService : Service() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 1. 初始化工作（只执行一次）
        initDatabase()
        initNetwork()
        
        // 2. 设置前台服务
        startForeground(NOTIFICATION_ID, notification)
        
        // 3. 启动后台线程
        executorService = Executors.newSingleThreadExecutor()
        
        // 4. 注册接收器
        registerReceiver(broadcastReceiver, filter)
        
        Log.i("MyService", "onCreate: Service 已创建")
    }
}
```

**onStartCommand() - 启动时调用**

这是最重要的方法，返回值决定 Service 被杀死后的行为：

```kotlin
override fun onStartCommand(
    intent: Intent?,
    flags: Int,
    startId: Int
): Int {
    
    // 1. 处理 Intent 传递的参数
    val action = intent?.action
    val data = intent?.getStringExtra("data")
    
    // 2. 根据参数执行不同操作
    when (action) {
        ACTION_START -> startWork()
        ACTION_STOP -> stopWork()
    }
    
    // 3. 返回值：决定 Service 被杀死后的行为
    return when {
        // 系统杀死 Service 后，会重新创建并调用 onStartCommand
        // 会传递原始 Intent 或新的 Intent
        isPersistentService -> START_REDELIVER_INTENT
        
        // 系统杀死 Service 后，不会重启
        // 适合一次性任务
        else -> START_NOT_STICKY
        
        // 系统杀死 Service 后，会重启但不传递 Intent
        // 适合不需要 Intent 的场景
        // START_STICKY
    }
}

// 返回值对比
const val START_NOT_STICKY = 0       // 不重启（默认）
const val START_STICKY = 1           // 重启，不传 Intent
const val START_REDELIVER_INTENT = 2 // 重启，传递 Intent
```

**返回值详细对比：**

| 返回值 | 服务被杀死后 | Intent 传递 | 使用场景 |
|--------|------------|-----------|---------|
| START_NOT_STICKY | 不重启 | - | 音乐暂停、临时任务 |
| START_STICKY | 重启 | 传递 null | 持续运行的服务 |
| START_REDELIVER_INTENT | 重启 | 传递原始 Intent | 下载、需要重试的任务 |
| START_STICKY_COMPATIBILITY | 兼容旧版本 | 同 START_STICKY | 兼容性处理 |

**onBind() - 绑定时调用**

```kotlin
override fun onBind(intent: Intent?): IBinder? {
    // 返回 IBinder 对象，供客户端调用 Service 方法
    // 如果是纯 startService 方式，返回 null
    return if (intent?.action == ACTION_BIND) {
        localBinder
    } else {
        // 跨进程通信时返回 Messenger 或 AIDL Binder
        messenger
    }
}
```

**onUnbind() - 解绑时调用**

```kotlin
override fun onUnbind(intent: Intent?): Boolean {
    // intent 参数是最后一次调用 onBind() 时传入的 Intent
    
    // 返回 true：当有客户端重新绑定时，系统会调用 onRebind()
    // 返回 false：有客户端重新绑定时，系统调用 onBind()
    return true
}

// 当 onUnbind() 返回 true 时，重新绑定会调用此方法
override fun onRebind(intent: Intent?) {
    // 重新绑定的处理逻辑
    super.onRebind(intent)
}
```

**onTaskRemoved() - 任务被移除时调用**

```kotlin
override fun onTaskRemoved(rootIntent: Intent?) {
    super.onTaskRemoved(rootIntent)
    
    // 当用户滑动清除后台应用时调用
    // 通常用于停止前台服务或清理资源
    stopForeground(true)
    stopSelf()
}
```

**onDestroy() - 销毁时调用**

```kotlin
override fun onDestroy() {
    // 1. 清理资源
    executorService?.shutdown()
    
    // 2. 取消注册
    unregisterReceiver(broadcastReceiver)
    
    // 3. 停止播放
    mediaPlayer?.release()
    
    // 4. 关闭连接
    database?.close()
    
    super.onDestroy()
    Log.i("MyService", "onDestroy: Service 已销毁")
}
```

### 3.3 生命周期时序图

**startService 方式：**

```
Activity                      Service
    |                           |
    |    startService()         |
    |    ─────────────────────> |
    |                           |
    |                       onCreate()
    |                           │
    |                    onStartCommand()
    |                           │
    |    startService() (重复)   |
    |    ─────────────────────> |
    |                       onStartCommand()
    |                           │
    |    stopService()          |
    |    ─────────────────────> |
    |                           |
    |                       stopSelf()
    |                           │
    |                        onDestroy()
    |                           │
```

**bindService 方式：**

```
Activity                      Service
    |                           |
    |    bindService()          |
    |    ─────────────────────> |
    |                           |
    |                       onCreate()
    |                           │
    |                        onBind()
    |                           │
    |    onServiceConnected()   |
    |    <──────────────────────|
    |                           |
    |    调用 Binder 方法        |
    |    ─────────────────────> |
    |                           |
    |    unbindService()        |
    |    ─────────────────────> |
    |                           |
    |                       onUnbind()
    |                           │
    |                        onDestroy()
    |                           │
```

### 3.4 Service 被杀死后的行为

**系统杀死 Service 的常见场景：**

1. 内存不足时，系统回收资源
2. Service 优先级低于前台应用
3. 用户手动清除后台
4. 系统重启

**不同返回值的表现：**

```kotlin
// 场景 1: START_NOT_STICKY - 不重启
class MusicService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 音乐播放场景
        // 如果服务被杀死，用户需要手动重新开始
        return START_NOT_STICKY
    }
}

// 场景 2: START_STICKY - 重启但不传 Intent
class LocationService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 位置追踪场景
        // 如果服务被杀死，系统会重启它，但不传递之前的 Intent
        // 适合不需要特定参数的持续运行服务
        return START_STICKY
    }
}

// 场景 3: START_REDELIVER_INTENT - 重启并传 Intent
class DownloadService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 下载场景
        // 如果服务被杀死，系统会重启并传递原始 Intent
        // 可以重新开始下载任务
        val url = intent?.getStringExtra("url")
        startDownload(url)
        return START_REDELIVER_INTENT
    }
}
```

---

## 4. 前台服务（Foreground Service）

### 4.1 什么是前台服务

前台服务是一种可以执行长时间操作且显示持续通知的 Service。由于有通知栏显示，系统不会轻易杀死它。

**重要性对比：**

```
进程优先级（从高到低）：
1. 前台服务 ⭐⭐⭐⭐⭐ (最高优先级)
2. 可见的 Activity
3. 服务（由 startService 启动）
4. 可见的 Service
5. 后台服务
6. 已停止的 Activity
7. 内容提供者
8. 广播接收器
9. 应用进程
```

### 4.2 前台服务创建流程

**步骤 1：添加权限**

```xml
<!-- AndroidManifest.xml -->
<manifest>
    <!-- Android 9.0+ 必须声明 -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <!-- 特定类型的前台服务 -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    
    <!-- 通知权限（Android 13+） -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
</manifest>
```

**步骤 2：创建 Notification**

```kotlin
class MyForegroundService : Service() {
    
    private val notificationManager by lazy {
        getSystemService(NotificationManager::class.java)
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // 创建通知渠道（Android 8.0+ 必需）
        createNotificationChannel()
        
        // 启动前台服务（必须在 onCreate 中尽快调用，Android 8.0+ 要求 5 秒内）
        startForeground(NOTIFICATION_ID, createNotification())
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "前台服务通知",
                NotificationManager.IMPORTANCE_LOW  // 低优先级，无声音和状态栏显示
            ).apply {
                description = "前台服务运行时显示的通知"
                setShowBadge(false)
            }
            
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        // 点击通知打开的 Activity
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // 播放按钮
        val playIntent = Intent(ACTION_PLAY)
        val playPendingIntent = PendingIntent.getService(
            this,
            0,
            playIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // 暂停按钮
        val pauseIntent = Intent(ACTION_PAUSE)
        val pausePendingIntent = PendingIntent.getService(
            this,
            0,
            pauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("正在播放")
            .setContentText("Music Service")
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentIntent(pendingIntent)
            // 添加操作按钮
            .addAction(R.drawable.ic_play, "播放", playPendingIntent)
            .addAction(R.drawable.ic_pause, "暂停", pausePendingIntent)
            // 设置优先级
            .setPriority(NotificationCompat.PRIORITY_LOW)
            // 设置为正在进行中
            .setOngoing(true)
            .build()
    }
    
    companion object {
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "foreground_service_channel"
        const val ACTION_PLAY = "com.example.ACTION_PLAY"
        const val ACTION_PAUSE = "com.example.ACTION_PAUSE"
    }
}
```

### 4.3 前台服务类型（Android 14+）

从 Android 14（API 34）开始，前台服务必须声明类型：

```xml
<!-- AndroidManifest.xml -->
<service
    android:name=".MusicService"
    android:exported="false"
    android:foregroundServiceType="mediaPlayback" />

<service
    android:name=".LocationService"
    android:exported="false"
    android:foregroundServiceType="location" />

<service
    android:name=".DownloadService"
    android:exported="false"
    android:foregroundServiceType="dataSync" />

<!-- 支持多种类型 -->
<service
    android:name=".MultiTypeService"
    android:exported="false"
    android:foregroundServiceType="location|camera|microphone" />
```

**前台服务类型列表：**

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| mediaPlayback | 媒体播放 | 音乐播放器 |
| mediaProjection | 屏幕录制 | 录屏应用 |
| location | 定位 | 导航、位置追踪 |
| dataSync | 数据同步 | 后台同步 |
| phoneCall | 电话 | 通话应用 |
| health | 健康 | 健康监测 |
| connectedCar | 车载连接 | 车载应用 |
| shortService | 短时服务 | 快速任务 |
| none | 未指定 | 不推荐 |

**运行时设置类型：**

```kotlin
// Android 14+ 必须在 startForeground 时指定类型
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
    startForeground(
        NOTIFICATION_ID,
        notification,
        ForegroundServiceType MEDIA_PLAYBACK  // 必须与 Manifest 声明一致
    )
} else {
    startForeground(NOTIFICATION_ID, notification)
}
```

### 4.4 前台服务注意事项

**⚠️ 重要限制：**

1. **5 秒限制**：Android 8.0+，必须在 `onCreate()` 后的 5 秒内调用 `startForeground()`，否则会抛出异常

2. **通知不可关闭**：前台服务的通知必须显示，用户无法直接关闭

3. **电量消耗**：前台服务会消耗更多电量，使用需谨慎

4. **系统仍可能杀死**：极端情况下（如严重内存不足），系统仍可能杀死前台服务

**错误示例 - 忘记设置前台服务：**

```kotlin
// ❌ 错误示例
class MyService : Service() {
    override fun onCreate() {
        super.onCreate()
        // 忘记调用 startForeground()
        // Android 8.0+ 会在 5 秒后杀死服务
    }
}

// ✅ 正确示例
class MyService : Service() {
    override fun onCreate() {
        super.onCreate()
        
        // 创建通知
        val notification = createNotification()
        
        // 尽快启动前台服务
        startForeground(NOTIFICATION_ID, notification)
        
        // 其他初始化工作
        initResources()
    }
}
```

---

## 5. IntentService 与 ForegroundService

### 5.1 IntentService（已废弃）

**IntentService 特点：**

- ✅ 自动处理工作队列
- ✅ 工作完成后自动停止
- ✅ 单线程处理任务
- ✅ 无需手动管理线程
- ❌ API 30+ 已废弃

**使用示例：**

```kotlin
// 自定义 IntentService
class MyIntentService extends IntentService("MyIntentService") {
    
    public MyIntentService() {
        super("MyIntentService");
    }
    
    @Override
    protected void onHandleIntent(Intent intent) {
        // 所有任务都在此方法中处理
        // 每个 Intent 会在单独的线程中执行
        
        String action = intent.getAction();
        if (ACTION_DOWNLOAD.equals(action)) {
            String url = intent.getStringExtra("url");
            downloadFile(url);
        }
    }
    
    private void downloadFile(String url) {
        // 执行下载操作
        // 下载完成后服务会自动停止
    }
}

// 启动 IntentService
Intent intent = new Intent(this, MyIntentService.class);
intent.setAction(ACTION_DOWNLOAD);
intent.putExtra("url", "https://example.com/file");
startService(intent);
```

**工作原理：**

```
┌─────────────────────────────────────────────────────────────┐
│                IntentService 工作流程                        │
│                                                             │
│  startService(1) ──→ 创建工作线程 ──→ onHandleIntent(1)      │
│       │                                              │      │
│       ↓                                              ↓      │
│  startService(2) ──→ 加入队列        ──→ onHandleIntent(2)   │
│       │                                              │      │
│       ↓                                              ↓      │
│  startService(3) ──→ 加入队列        ──→ onHandleIntent(3)   │
│                                                             │
│  队列清空后 ──────────────────→ stopSelf() ──→ onDestroy()  │
└─────────────────────────────────────────────────────────────┘
```

**替代方案 - 使用 JobScheduler 或 WorkManager：**

```kotlin
// 推荐使用 WorkManager 替代 IntentService
fun enqueueDownloadWork(url: String) {
    val downloadWork = OneTimeWorkRequestBuilder<DownloadWorker>()
        .setInputData(
            Data.Builder()
                .putString("url", url)
                .build()
        )
        .addTag("download")
        .build()
    
    WorkManager.getInstance(applicationContext).enqueue(downloadWork)
}
```

### 5.2 JobIntentService

**JobIntentService 是 IntentService 的替代品：**

- ✅ 与 JobScheduler 集成
- ✅ 更好的后台执行保证
- ✅ 支持批量任务
- ⚠️ API 30+ 也已被废弃

```kotlin
class MyJobIntentService : JobIntentService() {
    
    companion object {
        private const val SERVICE_ID = 12345
        
        fun enqueueWork(context: Context, action: String, data: String) {
            val intent = Intent(context, MyJobIntentService::class.java).apply {
                this.action = action
                putExtra("data", data)
            }
            enqueueWork(context, MyJobIntentService::class.java, SERVICE_ID, intent)
        }
    }
    
    override fun onHandleWork(intent: Intent) {
        // 处理工作
        val action = intent.action
        val data = intent.getStringExtra("data")
        
        when (action) {
            ACTION_SYNC -> syncData(data)
        }
    }
}
```

### 5.3 现代替代方案

**方案 1：WorkManager（推荐）**

```kotlin
// 定义 Worker
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        val url = inputData.getString("url") ?: return Result.retry()
        
        try {
            // 执行同步任务
            syncData(url)
            return Result.success()
        } catch (e: Exception) {
            return Result.retry()
        }
    }
}

// 使用 WorkManager
val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
    .setInputData(
        Data.Builder()
            .putString("url", "https://example.com/api")
            .build()
    )
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
    )
    .build()

WorkManager.getInstance(applicationContext).enqueue(workRequest)
```

**方案 2：Coroutine + Service**

```kotlin
class CoroutineService : Service() {
    
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val taskId = intent?.getStringExtra("taskId")
        
        serviceScope.launch {
            try {
                performTask(taskId)
            } catch (e: Exception) {
                Log.e("CoroutineService", "Task failed", e)
            }
        }
        
        return START_STICKY
    }
    
    private suspend fun performTask(taskId: String?) {
        withContext(Dispatchers.IO) {
            // 执行耗时操作
        }
    }
    
    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }
}
```

---

## 6. Service 保活方案

### 6.1 为什么需要保活

尽管 Android 系统会合理管理进程，但在某些场景下（如音乐播放、定位追踪、即时通讯），我们需要尽可能保持 Service 运行。

### 6.2 保活方案对比

| 方案 | 保活能力 | 系统限制 | 推荐度 |
|------|---------|---------|--------|
| 前台服务 | ⭐⭐⭐⭐⭐ | Android 14+ 需声明类型 | ⭐⭐⭐⭐⭐ |
| JobScheduler | ⭐⭐⭐⭐ | 系统调度 | ⭐⭐⭐⭐ |
| AlarmManager | ⭐⭐⭐⭐ | Doze 模式限制 | ⭐⭐⭐ |
| 广播监听 | ⭐⭐⭐ | 限制增多 | ⭐⭐ |
| 多进程 | ⭐⭐ | 资源消耗 | ⭐⭐ |
| WakeLock | ⭐ | 限制严格 | ⭐ |

### 6.3 前台服务保活（最有效）

```kotlin
class PersistentService : Service() {
    
    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, createNotification())
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 返回 START_STICKY，即使系统杀死也会重启
        return START_STICKY
    }
    
    // 监听系统重启广播
    private val rebootReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
                val serviceIntent = Intent(context, PersistentService::class.java)
                context.startForegroundService(serviceIntent)
            }
        }
    }
}
```

### 6.4 JobScheduler 保活

**适合场景**：网络同步、数据备份等定时任务

```kotlin
// 创建 JobService
class SyncJobService : JobService() {
    
    override fun onStartJob(params: JobParameters): Boolean {
        Log.d("SyncJobService", "Job started: ${params.jobId}")
        
        // 执行后台任务
        serviceScope.launch(Dispatchers.IO) {
            syncData()
        }
        
        // 返回 true 表示任务继续执行
        // 返回 false 表示任务完成
        return true
    }
    
    override fun onStopJob(params: JobParameters): Boolean {
        // 任务被中断，返回 true 表示需要重试
        Log.d("SyncJobService", "Job stopped: ${params.jobId}")
        return true
    }
}

// 在 Manifest 中声明
<service
    android:name=".SyncJobService"
    android:permission="android.permission.BIND_JOB_SERVICE"
    android:exported="true" />

// 调度任务
fun scheduleSyncJob() {
    val componentName = ComponentName(this, SyncJobService::class.java)
    val jobInfo = JobInfo.Builder(100, componentName)
        .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
        .setPersisted(true)  // 设备重启后仍然有效
        .setPeriodic(15 * 60 * 1000L)  // 15 分钟
        .build()
    
    val jobScheduler = getSystemService(JobScheduler::class.java)
    jobScheduler.schedule(jobInfo)
}
```

### 6.5 AlarmManager 保活

```kotlin
class AlarmManagerHelper {
    
    fun setRepeatingAlarm(context: Context, interval: Long) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, BootReceiver::class.java).apply {
            action = ACTION_SERVICE_START
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // 设置重复闹钟
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // 允许在 Doze 模式下唤醒
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                System.currentTimeMillis() + interval,
                pendingIntent
            )
        } else {
            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                System.currentTimeMillis() + interval,
                pendingIntent
            )
        }
    }
}

// 接收闹钟广播
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_SERVICE_START) {
            val serviceIntent = Intent(context, PersistentService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
```

### 6.6 多进程保活

```xml
<!-- AndroidManifest.xml -->
<application>
    <!-- 主进程 Service -->
    <service
        android:name=".MainService"
        android:process=":main" />
    
    <!-- 独立进程 Service -->
    <service
        android:name=".BackgroundService"
        android:process=":background" />
    
    <!-- 固定名称进程 -->
    <service
        android:name=".FixedService"
        android:process="com.example.fixed" />
</application>
```

**优势**：主进程崩溃不影响后台进程

**劣势**：内存占用增加，进程间通信复杂

### 6.7 保活组合策略

```kotlin
class RobustService : Service() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 1. 前台服务
        startForeground(NOTIFICATION_ID, notification)
        
        // 2. 设置 JobScheduler 定时检查
        scheduleCheckJob()
        
        // 3. 设置闹钟唤醒
        setWakeAlarm()
    }
    
    private fun scheduleCheckJob() {
        // 如果服务停止，Job 会重启它
    }
    
    private fun setWakeAlarm() {
        // 定时唤醒，检查服务状态
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 即使被杀死也会重启
        return START_STICKY
    }
    
    // 监控 Service 状态
    private fun monitorService() {
        // 使用 Watcher 监控进程状态
    }
}
```

---

## 7. Service 与 Thread 对比

### 7.1 核心区别

| 特性 | Service | Thread |
|------|---------|--------|
| 生命周期管理 | 系统管理 | 手动管理 |
| 启动方式 | 组件启动 | 代码创建 |
| 可被系统杀死 | 是 | 否（随进程） |
| 跨进程通信 | 支持（Binder） | 不支持 |
| 内存泄漏风险 | 较高 | 较低 |
| 使用场景 | 长时间任务 | 短时任务 |

### 7.2 常见误区

**误区 1：Service 在独立线程运行**

```kotlin
// ❌ 错误：在 onStartCommand 中执行耗时操作
class MyService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 这是在主线程！会阻塞 UI
        val result = expensiveOperation()
        return START_NOT_STICKY
    }
}

// ✅ 正确：使用线程池或协程
class MyService : Service() {
    private val executor = Executors.newSingleThreadExecutor()
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        executor.submit {
            val result = expensiveOperation()
            // 处理结果
        }
        return START_NOT_STICKY
    }
}
```

**误区 2：Service 比 Thread 更不容易被杀死**

```
真相：Service 和 Thread 运行在同一进程中
进程被杀死时，两者都会结束

进程优先级决定存活率：
- 前台服务 > 后台服务
- 但都比前台 Activity 低
```

### 7.3 选择建议

**使用 Service 的场景：**

```kotlin
// ✅ 需要跨组件访问
// ✅ 需要系统生命周期管理
// ✅ 需要前台服务保活
// ✅ 需要与其他应用交互

// 使用 Thread 的场景：
// ✅ 短时任务
// ✅ 不需要系统管理
// ✅ Activity 内简单异步
```

---

## 8. 内存泄漏场景

### 8.1 常见泄漏点

**场景 1：Handler 泄漏**

```kotlin
// ❌ 泄漏：匿名内部类持有 Service 引用
class MyService : Service() {
    
    private val handler = Handler(Looper.getMainLooper()) {
        // 使用 this，持有 Service 引用
        updateUI()
        true
    }
    
    override fun onDestroy() {
        // 没有移除消息，Service 无法被回收
        super.onDestroy()
    }
}

// ✅ 解决：移除消息或使用静态 Handler
override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    super.onDestroy()
}
```

**场景 2：未取消的 Timer**

```kotlin
// ❌ 泄漏
class MyService : Service() {
    
    private val timer = Timer()
    private val task = TimerTask {
        // 持有 Service 引用
        doWork()
    }
    
    override fun onCreate() {
        super.onCreate()
        timer.schedule(task, 0, 1000)
    }
    
    override fun onDestroy() {
        // 忘记取消 Timer
        super.onDestroy()
    }
}

// ✅ 解决
override fun onDestroy() {
    timer.cancel()
    super.onDestroy()
}
```

**场景 3：未注销的 Receiver**

```kotlin
// ❌ 泄漏
class MyService : Service() {
    
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // 持有 Service 引用
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        registerReceiver(receiver, filter)
    }
    
    override fun onDestroy() {
        // 忘记注销
        super.onDestroy()
    }
}

// ✅ 解决
override fun onDestroy() {
    unregisterReceiver(receiver)
    super.onDestroy()
}
```

**场景 4：未关闭的资源**

```kotlin
// ❌ 泄漏
class MyService : Service() {
    
    private var database: SQLiteDatabase? = null
    private var cursor: Cursor? = null
    
    override fun onCreate() {
        super.onCreate()
        database = dbHelper.writableDatabase
        cursor = database?.query(...)
    }
    
    override fun onDestroy() {
        // 忘记关闭
        super.onDestroy()
    }
}

// ✅ 解决
override fun onDestroy() {
    cursor?.close()
    database?.close()
    super.onDestroy()
}
```

### 8.2 检测工具

**使用 LeakCanary：**

```kotlin
// build.gradle
dependencies {
    debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'
}
```

LeakCanary 会自动检测并报告内存泄漏。

---

## 9. 最佳实践

### 9.1 代码组织

```kotlin
// 推荐的 Service 结构
class MusicService : Service() {
    
    // 1. 依赖注入
    private val musicPlayer: MusicPlayer by lazy { ... }
    private val repository: MusicRepository by lazy { ... }
    
    // 2. 生命周期管理
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    // 3. 状态管理
    private val playState = MutableStateFlow(PlayState.STOPPED)
    
    // 4. 对外暴露的 Binder
    private val binder = ServiceBinder()
    
    inner class ServiceBinder : Binder() {
        fun getService(): MusicService = this@MusicService
    }
    
    override fun onCreate() {
        super.onCreate()
        initResources()
        startForeground(NOTIFICATION_ID, createNotification())
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handleIntent(intent)
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? = binder
    
    override fun onDestroy() {
        serviceScope.cancel()
        cleanupResources()
        super.onDestroy()
    }
    
    private fun initResources() { ... }
    private fun handleIntent(intent: Intent?) { ... }
    private fun cleanupResources() { ... }
}
```

### 9.2 资源管理

```kotlin
// 使用 try-finally 或 use 块
database.use {
    // 自动关闭
}

// 使用 Finally 确保清理
try {
    doWork()
} finally {
    cleanup()
}
```

### 9.3 测试建议

```kotlin
// 单元测试
class MusicServiceTest {
    
    @Test
    fun testPlayMusic() {
        val service = MusicService()
        service.onCreate()
        
        service.playMusic()
        
        verify(musicPlayer).play()
    }
}
```

---

## 10. 面试考点

### 10.1 基础题

**Q1: Service 运行在哪个线程？**

A: Service 默认运行在主线程，需要在 Service 内开启新线程执行耗时操作。

**Q2: startService 和 bindService 的区别？**

A:
- startService: 启动 Service，Service 独立运行，需要手动停止
- bindService: 绑定 Service，通过 Binder 与 Service 通信，解绑后 Service 可能被销毁
- 可以混合使用

**Q3: onStartCommand 的返回值含义？**

A:
- START_NOT_STICKY: 不重启（默认）
- START_STICKY: 重启，不传 Intent
- START_REDELIVER_INTENT: 重启，传递 Intent

### 10.2 进阶题

**Q4: 前台服务的作用？**

A: 前台服务通过显示通知表明正在进行的操作，提高进程优先级，降低被系统杀死的可能性。

**Q5: Service 的保活方案有哪些？**

A:
1. 前台服务（最有效）
2. JobScheduler
3. AlarmManager
4. 多进程
5. 广播监听

**Q6: IntentService 和 Service 的区别？**

A:
- IntentService 单线程处理任务，任务完成后自动停止
- Service 需要手动管理生命周期
- IntentService 已废弃，推荐使用 WorkManager

### 10.3 高级题

**Q7: Service 内存泄漏的场景及解决方案？**

A:
- Handler 泄漏：移除消息或使用静态 Handler
- Timer 泄漏：在 onDestroy 中取消
- Receiver 泄漏：在 onDestroy 中注销
- 资源泄漏：及时关闭数据库、文件等

**Q8: 如何实现跨进程的 Service 通信？**

A: 使用 AIDL 或 Messenger 实现跨进程通信。

**Q9: 前台服务被杀死的场景？**

A:
- 用户手动关闭
- 系统严重内存不足
- 违反后台执行限制
- 权限被撤销

---

## 总结

Service 是 Android 后台任务的核心组件，掌握 Service 的生命周期、启动方式、前台服务和保活方案是面试必备知识。记住：

1. Service 不在独立线程运行
2. 区分 startService 和 bindService
3. 前台服务是最有效的保活方式
4. 注意资源管理，避免内存泄漏
5. 现代开发推荐使用 WorkManager 替代 Service 处理后台任务
