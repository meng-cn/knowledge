# 03_WorkManager.md - WorkManager 后台任务

## 目录
1. [WorkManager 概述](#workmanager-概述)
2. [Worker/CoroutineWorker](#worker-coroutineworker)
3. [OneTimeWorkRequest/PeriodicWorkRequest](#onetimeworkrequest-periodicworkrequest)
4. [WorkManager 约束](#workmanager-约束)
5. [WorkManager 链式任务](#workmanager-链式任务)
6. [WorkManager vs Service vs AlarmManager](#workmanager-vs-service-vs-alarmmanager)
7. [WorkManager 状态观察](#workmanager-状态观察)
8. [面试考点](#面试考点)
9. [最佳实践与常见错误](#最佳实践与常见错误)
10. [参考资料](#参考资料)

---

## WorkManager 概述

### 什么是 WorkManager？

WorkManager 是 Android Jetpack 的一部分，用于管理需要保证执行的后台任务。它适用于那些即使应用退出或设备重启后仍需执行的任务。

**核心特点：**
- **保证执行**：任务会被持久化，确保最终执行
- **灵活调度**：支持一次性任务和周期性任务
- **约束条件**：可以根据网络、电量、存储等条件调度
- **任务链**：支持任务依赖和链式执行
- **向后兼容**：最低支持 API 14（使用 JobScheduler、AlarmManager、BroadcastReceiver 组合实现）

### 适用场景

| 场景 | 是否适合 WorkManager | 说明 |
|------|---------------------|------|
| 数据同步 | ✅ 适合 | 需要保证执行，可以延迟 |
| 日志上传 | ✅ 适合 | 可以批量处理，不紧急 |
| 图片压缩 | ✅ 适合 | 可以在充电时执行 |
| 实时消息推送 | ❌ 不适合 | 需要即时响应，使用 FCM |
| 闹钟提醒 | ❌ 不适合 | 需要精确时间，使用 AlarmManager |
| 音乐播放 | ❌ 不适合 | 需要持续运行，使用 Foreground Service |
| 位置跟踪 | ❌ 不适合 | 需要持续运行，使用 Foreground Service |

### 添加依赖

```gradle
// app/build.gradle
dependencies {
    // WorkManager
    implementation "androidx.work:work-runtime-ktx:2.9.0"
    
    // 可选：用于测试
    testImplementation "androidx.work:work-testing:2.9.0"
    
    // 可选：用于 GCMNetworkManager 支持（已废弃）
    // implementation "androidx.work:work-gcm:2.9.0"
}
```

### WorkManager 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      WorkManager 架构                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Worker     │───▶│  WorkRequest │───▶│ WorkManager  │  │
│  │  (工作逻辑)   │    │  (工作请求)   │    │  (管理器)     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │doWork()      │    │Constraints   │    │enqueue()     │  │
│  │Result        │    │InputData     │    │getStatus()   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  底层调度器                            │   │
│  │  JobScheduler (API 23+) / AlarmManager + BroadcastReceiver │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Worker/CoroutineWorker

### Worker 基础类

Worker 是一个抽象类，需要在 `doWork()` 方法中实现具体的工作逻辑。

```kotlin
class SimpleWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        // 执行后台任务
        val inputData = inputData.getString(KEY_INPUT_DATA)
        
        // 模拟耗时操作
        Thread.sleep(2000)
        
        // 返回结果
        return when {
            // 成功
            successCondition -> Result.success()
            
            // 失败，不再重试
            failureCondition -> Result.failure()
            
            // 失败，需要重试
            else -> Result.retry()
        }
    }
}
```

### CoroutineWorker（推荐）

CoroutineWorker 是基于协程的 Worker 实现，代码更简洁。

```kotlin
class DataSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            // 获取输入数据
            val userId = inputData.getLong(KEY_USER_ID, -1L)
            val syncType = inputData.getString(KEY_SYNC_TYPE) ?: "full"
            
            // 执行网络请求（协程自动处理线程）
            val repository = DataRepository.getInstance()
            val data = repository.syncData(userId, syncType)
            
            // 保存数据到数据库
            repository.saveData(data)
            
            // 输出数据供后续任务使用
            val outputData = Data.Builder()
                .putLong(KEY_SYNCED_COUNT, data.size.toLong())
                .build()
            
            Result.success(outputData)
            
        } catch (e: Exception) {
            Log.e("DataSyncWorker", "同步失败", e)
            
            // 根据错误类型决定重试还是失败
            if (e is NetworkException && runAttemptCount < MAX_RETRIES) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
    
    companion object {
        const val KEY_USER_ID = "user_id"
        const val KEY_SYNC_TYPE = "sync_type"
        const val KEY_SYNCED_COUNT = "synced_count"
        const val MAX_RETRIES = 3
    }
}
```

### WorkerParameters

WorkerParameters 提供了任务的元数据：

```kotlin
class DetailedWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        // 访问输入数据
        val inputData: Data = params.inputData
        
        // 访问任务 ID
        val id: UUID = params.id
        
        // 访问任务标签
        val tags: Set<String> = params.tags
        
        // 访问重试次数
        val runAttemptCount: Int = params.runAttemptCount
        
        // 访问执行进度（用于长任务）
        // setProgressAsync() 发送进度
        
        return Result.success()
    }
}
```

### 带进度的 Worker

对于长时间运行的任务，可以报告进度：

```kotlin
class ImageProcessingWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        val imagePaths = inputData.getStringArray(KEY_IMAGE_PATHS) ?: return Result.failure()
        
        imagePaths.forEachIndexed { index, path ->
            // 处理图片
            processImage(path)
            
            // 报告进度
            val progress = Data.Builder()
                .putInt(KEY_PROGRESS, (index + 1) * 100 / imagePaths.size)
                .build()
            
            setProgressAsync(progress)
        }
        
        return Result.success()
    }
    
    private suspend fun processImage(path: String) {
        // 模拟图片处理
        delay(1000)
    }
    
    companion object {
        const val KEY_IMAGE_PATHS = "image_paths"
        const val KEY_PROGRESS = "progress"
    }
}

// 观察进度
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        WorkManager.getInstance(this)
            .getWorkInfoByIdLiveData(workId)
            .observe(this) { workInfo ->
                val progress = workInfo?.progress?.getInt("progress", 0) ?: 0
                progressBar.progress = progress
            }
    }
}
```

### 初始化 WorkManager

WorkManager 默认会自动初始化。如果需要自定义配置：

```kotlin
// 方式 1：在 AndroidManifest 中禁用自动初始化
<application>
    <provider
        android:name="androidx.startup.InitializationProvider"
        android:authorities="${applicationId}.androidx-startup"
        android:exported="false"
        tools:node="merge">
        
        <meta-data
            android:name="androidx.work.WorkManagerInitializer"
            android:value="androidx.startup" />
    </provider>
</application>

// 方式 2：在 Application 中手动初始化
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        val config = Configuration.Builder()
            .setMinimumLoggingLevel(Log.INFO)
            .setExecutor(Executors.newFixedThreadPool(4))
            .setTaskExecutor(Executors.newFixedThreadPool(4))
            .build()
        
        WorkManager.initialize(this, config)
    }
}
```

---

## OneTimeWorkRequest/PeriodicWorkRequest

### OneTimeWorkRequest（一次性任务）

```kotlin
// 基本用法
val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .build()

WorkManager.getInstance(context).enqueue(workRequest)

// 带输入数据
val inputData = Data.Builder()
    .putLong("user_id", 123L)
    .putString("sync_type", "full")
    .build()

val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .setInputData(inputData)
    .build()

WorkManager.getInstance(context).enqueue(workRequest)

// 带约束条件
val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)
    .setRequiresBatteryNotLow(true)
    .build()

val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .setConstraints(constraints)
    .setInputData(inputData)
    .build()

// 带延迟执行
val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .setInitialDelay(10, TimeUnit.MINUTES)
    .build()

// 带重试策略
val retryPolicy = BackoffPolicy.EXPONENTIAL // 或 LINEAR

val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .setBackoffCriteria(
        retryPolicy,
        WorkRequest.MIN_BACKOFF_MILLIS,
        TimeUnit.MILLISECONDS
    )
    .build()

// 添加标签
val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .addTag("sync")
    .addTag("user_123")
    .build()

// 完整示例
val workRequest = OneTimeWorkRequestBuilder<DataSyncWorker>()
    .setInputData(inputData)
    .setConstraints(constraints)
    .setInitialDelay(5, TimeUnit.MINUTES)
    .setBackoffCriteria(
        BackoffPolicy.EXPONENTIAL,
        OneTimeWorkRequest.MIN_BACKOFF_MILLIS,
        TimeUnit.MILLISECONDS
    )
    .addTag("data_sync")
    .build()

WorkManager.getInstance(context).enqueue(workRequest)
```

### PeriodicWorkRequest（周期性任务）

```kotlin
// 基本用法（最小周期 15 分钟）
val workRequest = PeriodicWorkRequestBuilder<DataSyncWorker>(
    repeatInterval = 15,
    repeatIntervalTimeUnit = TimeUnit.MINUTES
).build()

WorkManager.getInstance(context).enqueue(workRequest)

// 带初始延迟
val workRequest = PeriodicWorkRequestBuilder<DataSyncWorker>(
    repeatInterval = 1,
    repeatIntervalTimeUnit = TimeUnit.HOURS
).setInitialDelay(30, TimeUnit.MINUTES)
    .build()

// 带灵活间隔（Android 7.0+）
// 灵活间隔允许系统在指定时间窗口内灵活调度，有助于省电
val workRequest = PeriodicWorkRequestBuilder<DataSyncWorker>(
    repeatInterval = 1,
    repeatIntervalTimeUnit = TimeUnit.HOURS,
    flexInterval = 15,
    flexIntervalTimeUnit = TimeUnit.MINUTES
).build()

// 灵活间隔说明：
// - repeatInterval: 1 小时
// - flexInterval: 15 分钟
// - 实际执行时间：每小时的最后 15 分钟内任意时间

// 带约束条件
val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.UNMETERED) // 仅 WiFi
    .setRequiresBatteryNotLow(true)
    .setRequiresStorageNotLow(true)
    .build()

val workRequest = PeriodicWorkRequestBuilder<LogUploadWorker>(
    repeatInterval = 1,
    repeatIntervalTimeUnit = TimeUnit.DAYS
).setConstraints(constraints)
    .build()

// 添加到队列
WorkManager.getInstance(context).enqueue(workRequest)
```

### 周期性任务注意事项

```kotlin
/*
 重要注意事项：
 
 1. 最小周期限制
    - 最小 repeatInterval 为 15 分钟
    - 这是系统级别的限制，无法绕过
    
 2. 执行时间不精确
    - WorkManager 不保证精确的执行时间
    - 系统会根据设备状态（电量、网络等）调整执行时间
    
 3. 灵活间隔
    - flexInterval 必须小于 repeatInterval
    - 灵活间隔内任务可能随时执行
    
 4. 任务持久化
    - 周期性任务会持久化，即使应用卸载重装（除非明确取消）
    
 5. 应用终止
    - 应用被强制停止后，任务仍会执行
*/

// 示例：每日数据备份
val backupWorkRequest = PeriodicWorkRequestBuilder<BackupWorker>(
    repeatInterval = 1,
    repeatIntervalTimeUnit = TimeUnit.DAYS,
    flexInterval = 2,
    flexIntervalTimeUnit = TimeUnit.HOURS
).setConstraints(
    Constraints.Builder()
        .setRequiredNetworkType(NetworkType.UNMETERED)
        .setRequiresBatteryNotLow(true)
        .setRequiresCharging(true) // 仅在充电时
        .build()
).setInitialDelay(1, TimeUnit.HOURS) // 1 小时后开始
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "daily_backup", // 唯一名称
    ExistingPeriodicWorkPolicy.KEEP, // 保留现有任务
    backupWorkRequest
)
```

### 唯一工作（Unique Work）

```kotlin
// 唯一一次性工作
WorkManager.getInstance(context).enqueueUniqueWork(
    "unique_sync_work", // 唯一名称
    ExistingWorkPolicy.REPLACE, // 替换现有任务
    oneTimeWorkRequest
)

// 唯一周期性工作
WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "daily_sync", // 唯一名称
    ExistingPeriodicWorkPolicy.KEEP, // 保留现有任务
    periodicWorkRequest
)

// ExistingWorkPolicy 选项：
// - REPLACE: 替换现有任务
// - KEEP: 保留现有任务，忽略新任务
// - APPEND: 将新任务添加为现有任务的后续任务（链式）
```

---

## WorkManager 约束

### 约束类型

WorkManager 支持多种约束条件：

```kotlin
val constraints = Constraints.Builder()
    // 网络类型约束
    .setRequiredNetworkType(NetworkType.CONNECTED)
    
    // 电量约束
    .setRequiresBatteryNotLow(true)
    
    // 充电约束
    .setRequiresCharging(true)
    
    // 存储约束
    .setRequiresStorageNotLow(true)
    
    // 设备空闲约束（Android 6.0+）
    .setRequiresDeviceIdle(true)
    
    // 内容 URI 触发约束（Android 7.0+）
    .setTriggerContentUris(
        listOf(
            TriggerContentUri(
                uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                notifyForDescendants = true
            )
        )
    )
    
    .build()
```

### NetworkType 详解

```kotlin
// NetworkType 选项：

// 不限制网络
NetworkType.NOT_REQUIRED

// 任意网络连接（WiFi 或移动数据）
NetworkType.CONNECTED

// 未计费的连接（通常指 WiFi）
NetworkType.UNMETERED

// 非漫游网络
NetworkType.NOT_ROAMING

// 计量网络（如移动数据）
NetworkType.METERED

// 临时网络（Android 11+）
NetworkType.TEMPORARILY_UNMETERED
```

### 约束使用示例

```kotlin
// 示例 1：仅在 WiFi 且充电时上传大文件
val uploadConstraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.UNMETERED)
    .setRequiresCharging(true)
    .setRequiresBatteryNotLow(true)
    .build()

val uploadWork = OneTimeWorkRequestBuilder<UploadWorker>()
    .setConstraints(uploadConstraints)
    .build()

// 示例 2：仅在设备空闲时执行维护任务
val maintenanceConstraints = Constraints.Builder()
    .setRequiresDeviceIdle(true)
    .setRequiresBatteryNotLow(true)
    .build()

val maintenanceWork = OneTimeWorkRequestBuilder<MaintenanceWorker>()
    .setConstraints(maintenanceConstraints)
    .build()

// 示例 3：仅在非漫游网络下同步数据
val syncConstraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.NOT_ROAMING)
    .build()

val syncWork = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(syncConstraints)
    .build()

// 示例 4：监听内容变化触发任务
val contentConstraints = Constraints.Builder()
    .setTriggerContentUris(
        listOf(
            TriggerContentUri(
                uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                notifyForDescendants = true
            ),
            TriggerContentUri(
                uri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                notifyForDescendants = false
            )
        )
    )
    .build()

val contentWork = OneTimeWorkRequestBuilder<ContentWatcherWorker>()
    .setConstraints(contentConstraints)
    .build()
```

### 约束检查

```kotlin
// 检查当前约束是否满足
class ConstraintChecker(private val context: Context) {
    
    fun isNetworkMet(networkType: NetworkType): Boolean {
        val connectivityManager = context.getSystemService(
            Context.CONNECTIVITY_SERVICE
        ) as ConnectivityManager
        
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network)
            ?: return false
        
        return when (networkType) {
            NetworkType.NOT_REQUIRED -> true
            NetworkType.CONNECTED -> capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            NetworkType.UNMETERED -> !capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_METERED)
            NetworkType.NOT_ROAMING -> !capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_ROAMING)
            NetworkType.METERED -> capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_METERED)
            NetworkType.TEMPORARILY_UNMETERED -> capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_TEMPORARILY_NOT_METERED)
        }
    }
    
    fun isCharging(): Boolean {
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return batteryManager.isCharging
    }
    
    fun isBatteryNotLow(): Boolean {
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return batteryManager.isBatteryLow.not()
    }
}
```

---

## WorkManager 链式任务

### 使用 WorkContinuation

```kotlin
// 链式任务：任务 B 在任务 A 成功后执行
val continuation = WorkManager.getInstance(context)
    .beginWith(
        OneTimeWorkRequestBuilder<DownloadWorker>().build()
    )
    .then(
        OneTimeWorkRequestBuilder<ProcessWorker>().build()
    )
    .then(
        OneTimeWorkRequestBuilder<UploadWorker>().build()
    )

continuation.enqueue()

// 链式任务流程：
// DownloadWorker → ProcessWorker → UploadWorker
```

### 多输入任务

```kotlin
// 多个任务并行执行，完成后汇聚到一个任务
val image1Work = OneTimeWorkRequestBuilder<ImageProcessWorker>()
    .addTag("image1")
    .build()

val image2Work = OneTimeWorkRequestBuilder<ImageProcessWorker>()
    .addTag("image2")
    .build()

val image3Work = OneTimeWorkRequestBuilder<ImageProcessWorker>()
    .addTag("image3")
    .build()

// 汇聚任务：接收所有前置任务的输出
val mergeWork = OneTimeWorkRequestBuilder<MergeWorker>()
    .setInputMerger(OverwritingInputMerger::class.java)
    .build()

val continuation = WorkManager.getInstance(context)
    .beginWith(image1Work, image2Work, image3Work)
    .then(mergeWork)

continuation.enqueue()
```

### InputMerger

```kotlin
// 默认 InputMerger：只保留最后一个任务的输出
// OverwritingInputMerger：合并所有输入，后一个覆盖前一个的同名键

// 自定义 InputMerger
class CustomInputMerger : InputMerger() {
    override fun merge(
        context: Context,
        inputs: Array<Data>
    ): Data {
        val builder = Data.Builder()
        
        inputs.forEach { data ->
            data.keyValueMap.forEach { (key, value) ->
                when (value) {
                    is Int -> builder.put(key, value)
                    is Long -> builder.put(key, value)
                    is String -> builder.put(key, value)
                    is Boolean -> builder.put(key, value)
                    is Float -> builder.put(key, value)
                    is Double -> builder.put(key, value)
                }
            }
        }
        
        return builder.build()
    }
}

// 使用自定义 InputMerger
val mergeWork = OneTimeWorkRequestBuilder<MergeWorker>()
    .setInputMerger(CustomInputMerger::class.java)
    .build()
```

### 链式任务示例：图片处理流程

```kotlin
// 定义各个 Worker
class DownloadWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val imageUrl = inputData.getString("image_url") ?: return Result.failure()
        
        // 下载图片
        val imagePath = downloadImage(imageUrl)
        
        // 输出路径供下一个任务使用
        val output = Data.Builder()
            .putString("image_path", imagePath)
            .build()
        
        return Result.success(output)
    }
}

class CompressWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val imagePath = inputData.getString("image_path") ?: return Result.failure()
        
        // 压缩图片
        val compressedPath = compressImage(imagePath)
        
        val output = Data.Builder()
            .putString("compressed_path", compressedPath)
            .putString("image_path", imagePath) // 保留原始路径
            .build()
        
        return Result.success(output)
    }
}

class UploadWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val compressedPath = inputData.getString("compressed_path") ?: return Result.failure()
        
        // 上传图片
        val uploadUrl = uploadImage(compressedPath)
        
        val output = Data.Builder()
            .putString("upload_url", uploadUrl)
            .build()
        
        return Result.success(output)
    }
}

// 构建链式任务
fun createImageProcessingChain(imageUrl: String): WorkContinuation {
    val inputData = Data.Builder()
        .putString("image_url", imageUrl)
        .build()
    
    val downloadWork = OneTimeWorkRequestBuilder<DownloadWorker>()
        .setInputData(inputData)
        .build()
    
    val compressWork = OneTimeWorkRequestBuilder<CompressWorker>()
        .build()
    
    val uploadWork = OneTimeWorkRequestBuilder<UploadWorker>()
        .build()
    
    return WorkManager.getInstance(application)
        .beginWith(downloadWork)
        .then(compressWork)
        .then(uploadWork)
}

// 执行
createImageProcessingChain("https://example.com/image.jpg")
    .enqueue()
```

### 条件链式任务

```kotlin
// 根据前置任务的结果决定是否执行后续任务
class ConditionalWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val shouldContinue = inputData.getBoolean("should_continue", false)
        
        return if (shouldContinue) {
            Result.success()
        } else {
            // 返回失败，后续任务不会执行
            Result.failure()
        }
    }
}

// 使用
val checkWork = OneTimeWorkRequestBuilder<CheckWorker>().build()
val conditionalWork = OneTimeWorkRequestBuilder<ConditionalWorker>().build()
val processWork = OneTimeWorkRequestBuilder<ProcessWorker>().build()

WorkManager.getInstance(context)
    .beginWith(checkWork)
    .then(conditionalWork)
    .then(processWork) // 仅当 conditionalWork 成功时执行
    .enqueue()
```

---

## WorkManager vs Service vs AlarmManager

### 对比表格

| 特性 | WorkManager | Service | AlarmManager |
|------|-------------|---------|--------------|
| **保证执行** | ✅ 强保证 | ⚠️ 有限保证 | ✅ 强保证 |
| **精确时间** | ❌ 不精确 | ❌ 不精确 | ✅ 精确 |
| **后台执行** | ✅ 支持 | ⚠️ 受限 | ✅ 支持 |
| **约束条件** | ✅ 丰富 | ❌ 无 | ⚠️ 有限 |
| **任务链** | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |
| **最小 API** | 14 | 1 | 1 |
| **适用场景** | 延迟后台任务 | 持续运行任务 | 精确时间任务 |

### 选择指南

```
是否需要精确时间执行？
├─ 是 → 使用 AlarmManager（如闹钟、日历提醒）
└─ 否 → 是否需要持续运行？
    ├─ 是 → 使用 Foreground Service（如音乐播放、位置跟踪）
    └─ 否 → 使用 WorkManager（如数据同步、日志上传）
```

### 详细对比

#### WorkManager

```kotlin
// 适用场景：
// - 数据同步
// - 日志上传
// - 图片/视频处理
// - 定期清理缓存
// - 任何可以延迟执行的后台任务

// 优点：
// - 保证执行（即使应用退出、设备重启）
// - 支持约束条件（网络、电量、存储等）
// - 支持任务链
// - 自动选择最佳调度策略
// - 向后兼容

// 缺点：
// - 执行时间不精确
// - 最小周期 15 分钟
// - 不适合实时任务
```

#### Service

```kotlin
// 适用场景：
// - 音乐播放（Foreground Service）
// - 位置跟踪（Foreground Service）
// - 文件下载（建议使用 DownloadManager 或 WorkManager）
// - 后台通信

// 类型：
// 1. Started Service：启动后独立运行
// 2. Bound Service：与组件绑定
// 3. Foreground Service：显示通知，优先级高

// 优点：
// - 可以持续运行
// - 可以立即执行
// - 可以与 UI 交互（Bound Service）

// 缺点：
// - Android 8.0+ 后台执行受限
// - 需要处理通知（Foreground Service）
// - 消耗电量
// - 不保证重启后执行

// 示例：Foreground Service
class LocationService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("位置跟踪")
            .setContentText("正在跟踪您的位置")
            .setSmallIcon(R.drawable.ic_location)
            .build()
        
        startForeground(1, notification)
        
        // 开始位置跟踪
        startLocationUpdates()
        
        return START_STICKY
    }
}
```

#### AlarmManager

```kotlin
// 适用场景：
// - 闹钟
// - 日历提醒
// - 定时任务（需要精确时间）
// - 唤醒设备执行任务

// 优点：
// - 精确时间执行
// - 可以唤醒设备
// - 保证执行

// 缺点：
// - Android 6.0+ 受 Doze 模式限制
// - 没有约束条件支持
// - 不支持任务链
// - 代码较复杂

// 示例：设置精确闹钟
val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
val intent = Intent(context, AlarmReceiver::class.java)
val pendingIntent = PendingIntent.getBroadcast(
    context, 0, intent, PendingIntent.FLAG_IMMUTABLE
)

// 精确时间（API 19+ 使用 setExact）
alarmManager.setExactAndAllowWhileIdle(
    AlarmManager.RTC_WAKEUP,
    triggerTimeMillis,
    pendingIntent
)

// 周期性闹钟（不推荐，使用 WorkManager 替代）
alarmManager.setRepeating(
    AlarmManager.RTC_WAKEUP,
    triggerTimeMillis,
    intervalMillis,
    pendingIntent
)
```

### 组合使用示例

```kotlin
// 场景：每天凌晨 2 点同步数据（精确时间），但可以在 WiFi 条件下延迟执行

// 1. 使用 AlarmManager 设置精确触发时间
fun scheduleDailySync(context: Context) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, SyncTriggerReceiver::class.java)
    val pendingIntent = PendingIntent.getBroadcast(
        context, 0, intent, PendingIntent.FLAG_IMMUTABLE
    )
    
    // 设置每天凌晨 2 点
    val calendar = Calendar.getInstance().apply {
        timeInMillis = System.currentTimeMillis()
        set(Calendar.HOUR_OF_DAY, 2)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        if (timeInMillis < System.currentTimeMillis()) {
            add(Calendar.DAY_OF_YEAR, 1)
        }
    }
    
    alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        calendar.timeInMillis,
        pendingIntent
    )
}

// 2. BroadcastReceiver 触发 WorkManager
class SyncTriggerReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // 使用 WorkManager 执行实际同步（支持约束条件）
        val syncWork = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.UNMETERED)
                    .build()
            )
            .build()
        
        WorkManager.getInstance(context).enqueue(syncWork)
        
        // 重新设置明天的闹钟
        scheduleDailySync(context)
    }
}
```

---

## WorkManager 状态观察

### 获取 WorkInfo

```kotlin
// 通过 WorkRequest ID 获取状态
val workManager = WorkManager.getInstance(context)
val workInfoLiveData = workManager.getWorkInfoByIdLiveData(workId)

workInfoLiveData.observe(lifecycleOwner) { workInfo ->
    when (workInfo?.state) {
        WorkInfo.State.ENQUEUED -> {
            // 已加入队列，等待执行
        }
        WorkInfo.State.RUNNING -> {
            // 正在执行
            val progress = workInfo.progress.getInt("progress", 0)
        }
        WorkInfo.State.SUCCEEDED -> {
            // 执行成功
            val outputData = workInfo.outputData
        }
        WorkInfo.State.FAILED -> {
            // 执行失败
        }
        WorkInfo.State.BLOCKED -> {
            // 被阻塞（等待前置任务）
        }
        WorkInfo.State.CANCELLED -> {
            // 已取消
        }
        else -> {}
    }
}
```

### 通过标签观察

```kotlin
// 通过标签获取所有相关任务的状态
val workInfosLiveData = workManager.getWorkInfosByTagLiveData("sync_tag")

workInfosLiveData.observe(lifecycleOwner) { workInfos ->
    workInfos.forEach { workInfo ->
        Log.d("WorkManager", "任务 ${workInfo.id} 状态：${workInfo.state}")
    }
}

// 检查是否有任务在运行
val hasRunningWork = workInfos.any { it.state == WorkInfo.State.RUNNING }
```

### 取消任务

```kotlin
// 取消单个任务
workManager.cancelWorkById(workId)

// 通过标签取消所有相关任务
workManager.cancelAllWorkByTag("sync_tag")

// 取消所有任务
workManager.cancelAllWork()

// 取消唯一任务
workManager.cancelUniqueWork("unique_sync_work")
```

### 获取所有任务

```kotlin
// 获取所有任务（不推荐，可能返回大量数据）
workManager.getWorkInfosLiveData().observe(lifecycleOwner) { workInfos ->
    workInfos.forEach { workInfo ->
        Log.d("WorkManager", "任务：${workInfo.id}, 状态：${workInfo.state}")
    }
}
```

### 完整状态观察示例

```kotlin
class WorkManagerViewModel(application: Application) : AndroidViewModel(application) {
    
    private val workManager = WorkManager.getInstance(application)
    
    // 当前任务 ID
    private val _currentWorkId = MutableLiveData<UUID?>()
    val currentWorkId: LiveData<UUID?> = _currentWorkId
    
    // 任务状态
    val workInfo: LiveData<WorkInfo?> = Transformations.switchMap(_currentWorkId) { id ->
        id?.let { workManager.getWorkInfoByIdLiveData(it) }
            ?: MutableLiveData(null)
    }
    
    // 任务状态文本
    val workStateText: LiveData<String> = Transformations.map(workInfo) { info ->
        when (info?.state) {
            WorkInfo.State.ENQUEUED -> "等待中..."
            WorkInfo.State.RUNNING -> "执行中 ${info.progress.getInt("progress", 0)}%"
            WorkInfo.State.SUCCEEDED -> "完成"
            WorkInfo.State.FAILED -> "失败"
            WorkInfo.State.BLOCKED -> "阻塞"
            WorkInfo.State.CANCELLED -> "已取消"
            null -> "无任务"
        }
    }
    
    // 启动任务
    fun startSyncWork(userId: Long) {
        val inputData = Data.Builder()
            .putLong("user_id", userId)
            .build()
        
        val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setInputData(inputData)
            .addTag("sync")
            .build()
        
        workManager.enqueue(workRequest)
        _currentWorkId.value = workRequest.id
    }
    
    // 取消任务
    fun cancelWork() {
        _currentWorkId.value?.let { id ->
            workManager.cancelWorkById(id)
        }
        _currentWorkId.value = null
    }
    
    // 获取所有同步任务
    fun getSyncWorkInfos(): LiveData<List<WorkInfo>> {
        return workManager.getWorkInfosByTagLiveData("sync")
    }
}
```

---

## 面试考点

### 基础问题

#### Q1: WorkManager 的主要特点是什么？

**参考答案：**

WorkManager 的主要特点包括：

1. **保证执行**：任务会被持久化，即使应用退出或设备重启也会执行
2. **灵活调度**：支持一次性任务（OneTimeWorkRequest）和周期性任务（PeriodicWorkRequest）
3. **约束条件**：支持网络、电量、存储、设备空闲等约束
4. **任务链**：支持链式任务和并行任务汇聚
5. **向后兼容**：最低支持 API 14，自动选择最佳调度策略（JobScheduler/AlarmManager）
6. **可观察**：提供 LiveData 观察任务状态和进度

#### Q2: Worker 和 CoroutineWorker 的区别？

**参考答案：**

| 特性 | Worker | CoroutineWorker |
|------|--------|-----------------|
| **线程模型** | 同步，在后台线程执行 | 异步，基于协程 |
| **方法签名** | `doWork(): Result` | `suspend fun doWork(): Result` |
| **代码简洁性** | 需要手动管理线程 | 代码更简洁 |
| **推荐程度** | ⚠️ 不推荐 | ✅ 推荐 |

```kotlin
// Worker（同步）
override fun doWork(): Result {
    return try {
        // 需要手动处理线程
        Thread.sleep(1000)
        Result.success()
    } catch (e: Exception) {
        Result.retry()
    }
}

// CoroutineWorker（异步）
override suspend fun doWork(): Result {
    return try {
        // 直接使用 suspend 函数
        delay(1000)
        Result.success()
    } catch (e: Exception) {
        Result.retry()
    }
}
```

#### Q3: 如何传递输入数据给 Worker？

**参考答案：**

```kotlin
// 1. 创建输入数据
val inputData = Data.Builder()
    .putLong("user_id", 123L)
    .putString("sync_type", "full")
    .putBoolean("force", true)
    .build()

// 2. 设置到 WorkRequest
val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
    .setInputData(inputData)
    .build()

// 3. 在 Worker 中接收
class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val userId = inputData.getLong("user_id", -1L)
        val syncType = inputData.getString("sync_type")
        val force = inputData.getBoolean("force", false)
        
        // 执行业务逻辑
        return Result.success()
    }
}
```

#### Q4: PeriodicWorkRequest 的最小周期是多少？

**参考答案：**

PeriodicWorkRequest 的最小周期是 **15 分钟**。这是系统级别的限制，无法绕过。

```kotlin
// ✅ 正确：最小 15 分钟
val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES
).build()

// ❌ 错误：小于 15 分钟会被拒绝
val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    5, TimeUnit.MINUTES // 会抛出异常
).build()
```

如果需要更频繁的 periodic 任务，考虑：
- 使用前台服务
- 重新评估是否真的需要周期性执行
- 使用其他触发机制（如内容观察者）

### 进阶问题

#### Q5: WorkManager 如何保证任务执行？

**参考答案：**

WorkManager 通过以下机制保证任务执行：

1. **任务持久化**：任务信息存储在 SQLite 数据库中，即使进程被杀死也不会丢失
2. **系统调度器**：根据 Android 版本自动选择最佳调度器
   - API 23+：使用 JobScheduler
   - API 14-22：使用 AlarmManager + BroadcastReceiver
3. **设备重启恢复**：注册 BroadcastReceiver 监听设备重启，恢复任务
4. **应用更新保留**：任务会保留到应用更新后

```
任务提交 → 持久化到数据库 → 系统调度器 → 执行条件满足 → 执行 Worker
                ↑                                      ↓
                └─────────── 失败重试 ─────────────────┘
```

#### Q6: 如何实现任务链？链式任务的执行流程是什么？

**参考答案：**

使用 `WorkContinuation` 实现任务链：

```kotlin
val continuation = WorkManager.getInstance(context)
    .beginWith(downloadWork)
    .then(processWork)
    .then(uploadWork)

continuation.enqueue()
```

**执行流程：**

1. `downloadWork` 首先执行
2. 如果 `downloadWork` 返回 `Result.success()`，则执行 `processWork`
3. 如果 `processWork` 返回 `Result.success()`，则执行 `uploadWork`
4. 任何任务返回 `Result.failure()`，链终止
5. 任何任务返回 `Result.retry()`，该任务重试，链暂停

**数据传递：**
- 前置任务的 `outputData` 会合并到后续任务的 `inputData`
- 使用 `InputMerger` 控制合并策略

#### Q7: WorkManager 的约束条件有哪些？如何选择合适的约束？

**参考答案：**

**约束类型：**

```kotlin
Constraints.Builder()
    .setRequiredNetworkType(NetworkType.UNMETERED)  // 网络类型
    .setRequiresBatteryNotLow(true)                  // 电量充足
    .setRequiresCharging(true)                       // 充电中
    .setRequiresStorageNotLow(true)                  // 存储充足
    .setRequiresDeviceIdle(true)                     // 设备空闲
    .setTriggerContentUris(...)                      // 内容 URI 触发
    .build()
```

**选择策略：**

| 任务类型 | 推荐约束 |
|----------|----------|
| 大文件上传 | UNMETERED + RequiresCharging |
| 日志上传 | CONNECTED |
| 数据同步 | NOT_ROAMING |
| 缓存清理 | RequiresDeviceIdle + RequiresBatteryNotLow |
| 图片处理 | RequiresCharging + RequiresStorageNotLow |

#### Q8: WorkManager 与 JobScheduler 的区别？

**参考答案：**

| 特性 | WorkManager | JobScheduler |
|------|-------------|--------------|
| **API 支持** | 14+ | 21+ |
| **使用难度** | 简单 | 复杂 |
| **任务链** | 支持 | 不支持 |
| **LiveData 支持** | 支持 | 不支持 |
| **约束条件** | 丰富 | 有限 |
| **底层实现** | 自动选择 | 直接使用 |

**关系：** WorkManager 在 API 23+ 设备上底层使用 JobScheduler 实现。

```kotlin
// WorkManager（推荐）
val workRequest = OneTimeWorkRequestBuilder<MyWorker>().build()
WorkManager.getInstance(context).enqueue(workRequest)

// JobScheduler（不推荐，除非需要更细粒度控制）
val jobInfo = JobInfo.Builder(jobId, componentName)
    .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED)
    .build()
jobScheduler.schedule(jobInfo)
```

---

## 最佳实践与常见错误

### 最佳实践

#### 1. 使用 CoroutineWorker 替代 Worker

```kotlin
// ✅ 推荐
class MyWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        // 直接使用 suspend 函数
        return Result.success()
    }
}

// ❌ 不推荐
class MyWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        // 需要手动处理线程
        return Result.success()
    }
}
```

#### 2. 使用唯一工作避免重复任务

```kotlin
// ✅ 推荐：使用唯一名称
WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "daily_sync",
    ExistingPeriodicWorkPolicy.KEEP,
    periodicWorkRequest
)

// ❌ 不推荐：可能导致重复任务
WorkManager.getInstance(context).enqueue(periodicWorkRequest)
```

#### 3. 合理设置约束条件

```kotlin
// ✅ 推荐：根据任务类型设置约束
val uploadConstraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.UNMETERED)
    .setRequiresCharging(true)
    .build()

// ❌ 不推荐：无约束可能导致用户体验问题
val constraints = Constraints.Builder().build() // 可能在移动数据下执行大文件上传
```

#### 4. 使用标签管理任务

```kotlin
// ✅ 推荐：添加标签便于管理
val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
    .addTag("sync")
    .addTag("user_$userId")
    .build()

// 后续可以通过标签取消或观察
workManager.cancelAllWorkByTag("sync")
workManager.getWorkInfosByTagLiveData("sync")
```

#### 5. 正确处理重试

```kotlin
// ✅ 推荐：设置合理的重试策略
val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
    .setBackoffCriteria(
        BackoffPolicy.EXPONENTIAL,
        OneTimeWorkRequest.MIN_BACKOFF_MILLIS,
        TimeUnit.MILLISECONDS
    )
    .build()

// 在 Worker 中根据错误类型决定是否重试
override suspend fun doWork(): Result {
    return try {
        // 业务逻辑
        Result.success()
    } catch (e: NetworkException) {
        // 网络错误可以重试
        Result.retry()
    } catch (e: DataException) {
        // 数据错误重试无意义
        Result.failure()
    }
}
```

### 常见错误

#### 错误 1：在 UI 线程执行耗时操作

```kotlin
// ❌ 错误：在 doWork 中阻塞主线程
class MyWorker : CoroutineWorker() {
    override suspend fun doWork(): Result {
        // 这会阻塞协程
        Thread.sleep(10000)
        return Result.success()
    }
}

// ✅ 正确：使用 suspend 函数
override suspend fun doWork(): Result {
    delay(10000) // 不会阻塞
    return Result.success()
}
```

#### 错误 2：忘记处理输入数据

```kotlin
// ❌ 错误：没有验证输入数据
override suspend fun doWork(): Result {
    val userId = inputData.getLong("user_id", -1L)
    // 直接使用，可能为 -1
    repository.sync(userId)
    return Result.success()
}

// ✅ 正确：验证输入数据
override suspend fun doWork(): Result {
    val userId = inputData.getLong("user_id", -1L)
    if (userId == -1L) {
        return Result.failure()
    }
    repository.sync(userId)
    return Result.success()
}
```

#### 错误 3：过度使用周期性任务

```kotlin
// ❌ 错误：设置过短的周期
val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES // 最小周期，但可能不需要这么频繁
).build()

// ✅ 正确：根据实际需求设置
val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    1, TimeUnit.HOURS // 每小时同步一次
).build()
```

#### 错误 4：在 Worker 中持有 Context 引用

```kotlin
// ❌ 错误：可能导致内存泄漏
class MyWorker : CoroutineWorker() {
    companion object {
        var context: Context? = null // 静态引用 Context
    }
    
    constructor(context: Context, params: WorkerParameters) : super(context, params) {
        MyWorker.context = context
    }
}

// ✅ 正确：使用传入的 context 参数
override suspend fun doWork(): Result {
    // applicationContext 是安全的
    val repository = Repository.getInstance(applicationContext)
    return Result.success()
}
```

#### 错误 5：不取消不再需要的任务

```kotlin
// ❌ 错误：用户登出后任务仍在执行
fun login(userId: String) {
    val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
        .setInputData(Data.Builder().putString("user_id", userId).build())
        .build()
    WorkManager.getInstance(context).enqueue(workRequest)
}

// 用户登出时没有取消任务

// ✅ 正确：登出时取消相关任务
fun logout() {
    WorkManager.getInstance(context).cancelAllWorkByTag("user_$userId")
    // 清除用户数据
}
```

---

## 参考资料

### 官方文档
- [WorkManager 官方文档](https://developer.android.com/topic/libraries/architecture/workmanager)
- [WorkManager 版本说明](https://developer.android.com/jetpack/androidx/releases/work)
- [后台任务指南](https://developer.android.com/guide/background)

### 源码阅读
- [WorkManager 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:work/workmanager/src/main/java/androidx/work/WorkManager.java)
- [Worker 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:work/workmanager/src/main/java/androidx/work/Worker.java)

### 相关文章
- [Android WorkManager 完全指南](https://medium.com/androiddevelopers/work-manager-and-kotlin-coroutines-smart-background-processing-for-the-modern-android-developer-1b5f5a7f2b3f)
- [使用 WorkManager 处理后台任务](https://proandroiddev.com/android-workmanager-tutorial-2c06e8e5c2f0)

---

## 总结

WorkManager 是 Android Jetpack 中用于管理后台任务的核心组件，它提供了：

1. **保证执行**：任务持久化，确保最终执行
2. **灵活调度**：支持一次性和周期性任务
3. **约束条件**：根据网络、电量等条件智能调度
4. **任务链**：支持复杂的任务依赖关系
5. **状态观察**：通过 LiveData 观察任务状态和进度

WorkManager 适用于数据同步、日志上传、图片处理等可以延迟执行的后台任务。对于需要精确时间或持续运行的任务，应考虑使用 AlarmManager 或 Foreground Service。

掌握 WorkManager 对于开发高质量、省电、用户体验良好的 Android 应用至关重要。
