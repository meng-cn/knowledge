# Android Intent 与 IntentFilter - 全面详解

> Intent（意图）是 Android 组件间通信的核心机制，IntentFilter 用于定义组件可以接收的 Intent 类型。

---

## 目录

1. [Intent 基础概念](#1-intent-基础概念)
2. [显式 Intent vs 隐式 Intent](#2-显式-intent-vs-隐式-intent)
3. [IntentFilter 匹配规则](#3-intentfilter-匹配规则)
4. [PendingIntent 详解](#4-pendingintent-详解)
5. [Intent Flag 常用标志位](#5-intent-flag-常用标志位)
6. [Intent 数据传递限制](#6-intent-数据传递限制)
7. [ClipData 传递大文件](#7-clipdata-传递大文件)
8. [面试考点](#8-面试考点)

---

## 1. Intent 基础概念

### 1.1 什么是 Intent

Intent（意图）是 Android 中用于在组件之间传递消息的对象。它描述了"想要做什么"，而不指定"如何实现"。

**核心作用：**

- ✅ 启动 Activity
- ✅ 启动 Service
- ✅ 发送 BroadcastReceiver
- ✅ 组件间数据传递
- ✅ 实现组件解耦

### 1.2 Intent 的分类

```kotlin
// 1. 普通 Intent（Implicit/Explicit）
val intent = Intent(this, TargetActivity::class.java)

// 2. PendingIntent（延迟执行的 Intent）
val pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)

// 3. ForegroundServiceIntent（前台服务专用）
val fgIntent = Intent(this, MyService::class.java)
```

### 1.3 Intent 的组成要素

```kotlin
val intent = Intent().apply {
    // 1. Action：要执行的操作
    action = Intent.ACTION_VIEW
    
    // 2. Data：操作的数据 URI
    data = Uri.parse("https://www.example.com")
    
    // 3. Type：数据的 MIME 类型
    type = "image/*"
    
    // 4. Category：额外的分类信息
    addCategory(Intent.CATEGORY_BROWSABLE)
    
    // 5. Component：目标组件（显式 Intent）
    `class` = TargetActivity::class.java
    
    // 6. Extras：附加数据
    putExtra("key", "value")
    
    // 7. Flags：标志位
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    
    // 8. Package：目标包名
    `package` = "com.example"
}
```

---

## 2. 显式 Intent vs 隐式 Intent

### 2.1 核心区别

| 特性 | 显式 Intent | 隐式 Intent |
|------|-----------|-----------|
| 指定目标 | 明确指定组件类名 | 不指定具体组件 |
| 匹配方式 | 直接启动 | 系统匹配 IntentFilter |
| 使用场景 | 应用内组件调用 | 跨应用调用、系统功能 |
| 安全性 | 较高 | 需要权限控制 |
| 可替代性 | 单一目标 | 多个应用可响应 |

### 2.2 显式 Intent（Explicit Intent）

**定义：明确指定目标组件的 Intent**

```kotlin
// 方式 1：直接指定类（推荐）
val intent = Intent(this, TargetActivity::class.java)

// 方式 2：指定包名和类名
val intent = Intent().apply {
    `package` = "com.example"
    `class` = "com.example.TargetActivity"
}

// 方式 3：ComponentName
val component = ComponentName(this, TargetActivity::class.java)
val intent = Intent().setComponent(component)

// 启动 Activity
startActivity(intent)

// 启动 Service
startService(intent)

// 发送广播
sendBroadcast(intent)
```

**适用场景：**

```kotlin
// 场景 1：应用内 Activity 跳转
class MainActivity : AppCompatActivity() {
    fun goToDetail() {
        val intent = Intent(this, DetailActivity::class.java)
        startActivity(intent)
    }
}

// 场景 2：启动本应用的 Service
class MainActivity : AppCompatActivity() {
    fun startDownload() {
        val intent = Intent(this, DownloadService::class.java)
        startService(intent)
    }
}

// 场景 3：发送应用内广播
class DataUpdater {
    fun notifyDataChanged(context: Context) {
        val intent = Intent(DATA_UPDATED_ACTION)
        context.sendBroadcast(intent)
    }
}
```

### 2.3 隐式 Intent（Implicit Intent）

**定义：不指定具体组件，通过 Action/Data/Category 让系统匹配**

```kotlin
// 方式 1：使用系统 Action
// 打开浏览器
val webIntent = Intent(Intent.ACTION_VIEW).apply {
    data = Uri.parse("https://www.example.com")
}

// 发送短信
val smsIntent = Intent(Intent.ACTION_SENDTO).apply {
    data = Uri.parse("smsto:13800138000")
}

// 拨打电话
val callIntent = Intent(Intent.ACTION_CALL).apply {
    data = Uri.parse("tel:13800138000")
}

// 拍照
val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)

// 选择图片
val pickIntent = Intent(Intent.ACTION_PICK).apply {
    type = MediaType.IMAGE
}

// 方式 2：自定义 Action
val customIntent = Intent("com.example.CUSTOM_ACTION").apply {
    putExtra("data", "some value")
}

// 启动隐式 Intent
startActivity(webIntent)

// 或者查看有哪些应用可以处理
val resolveInfoList = packageManager.queryIntentActivities(
    webIntent,
    PackageManager.ResolveInfoFlags.of(0)
)
```

### 2.4 隐式 Intent 的系统功能

```kotlin
// 1. 查看地图
val mapIntent = Intent(Intent.ACTION_VIEW).apply {
    data = Uri.parse("geo:39.9042,116.4074")
}

// 2. 设置闹钟
val alarmIntent = Intent(Intent.ACTION_SET_ALARM).apply {
    putExtra(AlarmClock.EXTRA_MESSAGE, "起床了")
    putExtra(
        AlarmClock.EXTRA_WAKEUP_TIME,
        System.currentTimeMillis() + 60 * 60 * 1000
    )
}

// 3. 分享文本
val shareTextIntent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "这是要分享的文本")
}

// 4. 分享文件
val shareFileIntent = Intent(Intent.ACTION_SEND).apply {
    type = "image/*"
    putExtra(Intent.EXTRA_STREAM, fileUri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

// 5. 安装应用
val installIntent = Intent(Intent.ACTION_VIEW).apply {
    data = Uri.fromFile(apkFile)
    type = "application/vnd.android.package-archive"
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}

// 6. 删除应用
val uninstallIntent = Intent(Intent.ACTION_DELETE).apply {
    data = Uri.parse("package:com.example")
}
```

### 2.5 创建选择器（Chooser）

```kotlin
// 问题：直接 startActivity(隐式 Intent) 会直接打开默认应用
// 解决：使用选择器让用户选择应用

// 方式 1：简单的选择器
fun shareWithChooser(context: Context, text: String) {
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
    }
    
    val chooserIntent = Intent.createChooser(shareIntent, "选择分享方式")
    context.startActivity(chooserIntent)
}

// 方式 2：带默认应用的选择器
fun shareWithDefaultChooser(context: Context, text: String, defaultApp: ComponentName?) {
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
    }
    
    val chooserIntent = Intent.createChooser(shareIntent, "选择分享方式")
    
    // 设置默认应用
    defaultApp?.let {
        chooserIntent.putExtra(
            Intent.EXTRA_INITIAL_INTENTS,
            arrayOf(Intent().setComponent(it))
        )
    }
    
    context.startActivity(chooserIntent)
}

// 方式 3：自定义选择器样式
fun shareWithCustomChooser(context: Context, text: String) {
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
    }
    
    val chooserIntent = Intent.createChooser(shareIntent, "选择分享方式")
    
    // 隐藏某些应用
    chooserIntent.putExtra(
        Intent.EXTRA_EXCLUDE_COMPONENTS,
        arrayOf(ComponentName(context, UnwantedActivity::class.java))
    )
    
    context.startActivity(chooserIntent)
}
```

---

## 3. IntentFilter 匹配规则

### 3.1 IntentFilter 的作用

IntentFilter 定义了组件可以接收的 Intent 类型，系统通过 IntentFilter 来匹配 Intent 和目标组件。

### 3.2 匹配三要素

Intent 和 IntentFilter 的匹配需要同时满足：

1. **Action 匹配**
2. **Data 匹配**
3. **Category 匹配**

**只有三要素全部匹配，Intent 才能成功传递给目标组件。**

### 3.3 Action 匹配

```kotlin
// IntentFilter 中声明接收的 Action
val filter = IntentFilter()
filter.addAction(Intent.ACTION_VIEW)
filter.addAction(Intent.ACTION_EDIT)
filter.addAction("com.example.CUSTOM_ACTION")

// Intent 中指定 Action
val intent = Intent("com.example.CUSTOM_ACTION")

// 匹配成功
```

**Manifest 中声明：**

```xml
<activity android:name=".MyActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <action android:name="android.intent.action.SEND" />
        <action android:name="com.example.CUSTOM_ACTION" />
    </intent-filter>
</activity>
```

### 3.4 Data 匹配

Data 匹配包含两个部分：**Scheme** 和 **Host/Path**

```kotlin
// 1. 匹配 URI
val filter = IntentFilter()
filter.addDataScheme("http")
filter.addDataScheme("https")

// 匹配：http://example.com, https://example.com

// 2. 匹配 MIME Type
filter.addDataMimeType("image/*")
filter.addDataMimeType("text/plain")

// 匹配：image/jpeg, text/plain

// 3. 完整的 URI 匹配
val filter = IntentFilter()
filter.setDataScheme("http")
filter.addDataHost("example.com")
filter.addDataPathPrefix("/api/")

// 匹配：http://example.com/api/users
```

**Manifest 中声明 Data 匹配：**

```xml
<activity android:name=".BrowserActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- 匹配 HTTP/HTTPS URL -->
        <data android:scheme="http" />
        <data android:scheme="https" />
        
        <!-- 匹配特定域名 -->
        <data android:host="example.com" />
        <data android:host="www.example.com" />
        
        <!-- 匹配路径 -->
        <data android:pathPrefix="/articles/" />
        
        <!-- 或简写 -->
        <data android:scheme="https" android:host="example.com" android:pathPrefix="/articles/" />
    </intent-filter>
</activity>
```

**Data 匹配规则详解：**

```
┌──────────────────────────────────────────┐
│        Data 匹配优先级（从高到低）        │
├──────────────────────────────────────────┤
│ 1. scheme + host + port + path           │
│ 2. scheme + host + path                  │
│ 3. scheme + host                         │
│ 4. scheme + path                         │
│ 5. scheme                                │
│ 6. MIME type                             │
└──────────────────────────────────────────┘

示例：
Intent: content://com.example.provider/users/123

IntentFilter 1:
  <data android:scheme="content" android:host="com.example.provider" />
  ✓ 匹配成功（scheme + host）

IntentFilter 2:
  <data android:scheme="content" android:host="com.example.provider" android:pathPrefix="/users/" />
  ✓ 匹配成功（更精确）

IntentFilter 3:
  <data android:scheme="content" />
  ✓ 匹配成功（只匹配 scheme）
```

### 3.5 Category 匹配

```kotlin
// 标准 Category
val filter = IntentFilter()
filter.addCategory(Intent.CATEGORY_DEFAULT)  // 默认添加
filter.addCategory(Intent.CATEGORY_BROWSABLE) // 可浏览
filter.addCategory(Intent.CATEGORY_LAUNCHER)  // 启动器

// Intent 必须包含 IntentFilter 声明的所有 Category
val intent = Intent(Intent.ACTION_VIEW).apply {
    addCategory(Intent.CATEGORY_BROWSABLE)
}
```

**常用 Category：**

| Category | 说明 | 使用场景 |
|----------|------|----------|
| CATEGORY_DEFAULT | 默认类别 | 所有 Intent 自动添加 |
| CATEGORY_BROWSABLE | 可浏览 | 可被浏览器打开的 URL |
| CATEGORY_LAUNCHER | 启动器 | 显示在主屏幕的应用入口 |
| CATEGORY_APP_BROWSER | 浏览器应用 | 浏览器类应用 |
| CATEGORY_APP_BROWSER | 邮件应用 | 邮件客户端 |

**Manifest 示例：**

```xml
<!-- 应用主入口 -->
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>

<!-- 可被浏览器打开的页面 -->
<activity android:name=".ArticleActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="example.com" android:pathPrefix="/article/" />
    </intent-filter>
</activity>
```

### 3.6 优先级（Priority）

```xml
<!-- 优先级范围：-1000 到 1000 -->
<!-- 数值越高，优先级越高 -->

<intent-filter android:priority="999">
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="https" />
</intent-filter>

<intent-filter android:priority="100">
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="https" />
</intent-filter>
```

### 3.7 完整匹配示例

```xml
<!-- 定义一个完整的 IntentFilter -->
<activity android:name=".CustomProtocolActivity" android:exported="true">
    <intent-filter android:priority="999">
        <!-- Action -->
        <action android:name="android.intent.action.VIEW" />
        
        <!-- Categories -->
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- Data -->
        <data android:scheme="myapp" />
        <data android:host://user/profile/123
    </intent-filter>
</activity>

<!-- 匹配的 Intent -->
val intent = Intent(Intent.ACTION_VIEW).apply {
    addCategory(Intent.CATEGORY_BROWSABLE)
    data = Uri.parse("myapp://user/profile/123")
}
```

### 3.8 动态注册 IntentFilter

```kotlin
class MainActivity : AppCompatActivity() {
    
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // 处理广播
        }
    }
    
    override fun onResume() {
        super.onResume()
        
        // 创建 IntentFilter
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_BATTERY_CHANGED)
            addAction("com.example.CUSTOM_ACTION")
        }
        
        // 注册接收器
        registerReceiver(receiver, filter)
    }
    
    override fun onPause() {
        super.onPause()
        unregisterReceiver(receiver)
    }
}
```

---

## 4. PendingIntent 详解

### 4.1 什么是 PendingIntent

PendingIntent（待定 Intent）是一个 Intent 的包装器，它允许其他应用以你的应用身份执行预定义的 Intent 操作。

**核心特点：**

- ✅ 延迟执行 Intent
- ✅ 授权其他应用使用
- ✅ 保留原始 Intent 的权限
- ⚠️ 需要注意安全性

### 4.2 使用场景

```kotlin
// 场景 1：Notification 点击跳转
val intent = Intent(context, TargetActivity::class.java)
val pendingIntent = PendingIntent.getActivity(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)

val notification = NotificationCompat.Builder(context, CHANNEL_ID)
    .setContentIntent(pendingIntent)
    .build()

// 场景 2：AlarmManager 定时任务
val intent = Intent(context, BootReceiver::class.java)
val pendingIntent = PendingIntent.getBroadcast(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)

alarmManager.set(
    AlarmManager.RTC_WAKEUP,
    triggerTime,
    pendingIntent
)

// 场景 3：Service 远程调用
val intent = Intent(context, MyService::class.java)
val pendingIntent = PendingIntent.getService(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)
```

### 4.3 三种类型

**1. getActivity() - 启动 Activity**

```kotlin
val pendingIntent = PendingIntent.getActivity(
    context,
    requestCode,
    intent,
    flags
)

// 使用：Notification、Dialog 等
```

**2. getBroadcast() - 发送广播**

```kotlin
val pendingIntent = PendingIntent.getBroadcast(
    context,
    requestCode,
    intent,
    flags
)

// 使用：AlarmManager、Notification 等
```

**3. getService() - 启动 Service**

```kotlin
val pendingIntent = PendingIntent.getService(
    context,
    requestCode,
    intent,
    flags
)

// 使用：JobScheduler、其他应用启动服务等
```

### 4.4 RequestCode 的作用

```kotlin
// RequestCode 用于区分同一 Context 创建的多个 PendingIntent

// 错误示例：相同的 requestCode 会导致 PendingIntent 覆盖
val intent1 = Intent(context, ActivityA::class.java)
val pendingIntent1 = PendingIntent.getActivity(context, 0, intent1, flags)

val intent2 = Intent(context, ActivityB::class.java)
val pendingIntent2 = PendingIntent.getActivity(context, 0, intent2, flags)

// pendingIntent2 会覆盖 pendingIntent1

// 正确示例：使用不同的 requestCode
val pendingIntent1 = PendingIntent.getActivity(context, 1001, intent1, flags)
val pendingIntent2 = PendingIntent.getActivity(context, 1002, intent2, flags)
```

### 4.5 Flags 标志位

**重要 Flags：**

```kotlin
// 1. FLAG_UPDATE_CURRENT（最常用）
// 如果 PendingIntent 已存在，更新 Intent，保留原始 flags
PendingIntent.FLAG_UPDATE_CURRENT

// 2. FLAG_ONE_SHOT
// 使用一次后自动失效
PendingIntent.FLAG_ONE_SHOT

// 3. FLAG_NO_CREATE
// 如果 PendingIntent 不存在，返回 null
PendingIntent.FLAG_NO_CREATE

// 4. FLAG_CANCEL_CURRENT
// 如果 PendingIntent 已存在，先取消再创建
PendingIntent.FLAG_CANCEL_CURRENT

// 5. FLAG_IMMUTABLE（安全性必需）
// 创建的 PendingIntent 不可变
PendingIntent.FLAG_IMMUTABLE

// 6. FLAG_MUTABLE（Android 12+）
// 可变的 PendingIntent（用于可编辑的通知）
PendingIntent.FLAG_MUTABLE
```

**组合使用示例：**

```kotlin
// 标准用法（推荐）
val pendingIntent = PendingIntent.getActivity(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)

// Android 12+ 可编辑通知
val pendingIntent = PendingIntent.getActivity(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
)
```

### 4.6 安全风险

**风险 1：PendingIntent 劫持**

```kotlin
// ❌ 危险：使用 FLAG_UPDATE_CURRENT 且未设置 FLAG_IMMUTABLE
val intent = Intent(context, VulnerableActivity::class.java)
val pendingIntent = PendingIntent.getActivity(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT
)

// 其他应用可以修改这个 PendingIntent 的 Intent
// 可能导致跳转到恶意应用

// ✅ 安全：添加 FLAG_IMMUTABLE
val pendingIntent = PendingIntent.getActivity(
    context,
    0,
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)
```

**风险 2：重复触发**

```kotlin
// ❌ 危险：相同的 requestCode 可能导致重复触发
fun sendNotification(context: Context) {
    val intent = Intent(context, Receiver::class.java)
    val pendingIntent = PendingIntent.getBroadcast(
        context,
        0,  // 固定 requestCode
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT
    )
    // 多次调用会使用同一个 PendingIntent
}

// ✅ 安全：使用动态 requestCode
fun sendNotification(context: Context, notificationId: Int) {
    val intent = Intent(context, Receiver::class.java)
    val pendingIntent = PendingIntent.getBroadcast(
        context,
        notificationId,  // 使用 notificationId 作为 requestCode
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT
    )
}
```

**风险 3：组件暴露**

```kotlin
// ❌ 危险：exported=true 且无权限控制的组件
<receiver android:name=".Receiver" android:exported="true" />

// ✅ 安全：添加权限控制
<receiver 
    android:name=".Receiver" 
    android:exported="true"
    android:permission="com.example.MY_PERMISSION" />
```

### 4.7 Android 版本兼容性

```kotlin
// Android 12+ 必须指定 immutable/mutable
fun createPendingIntent(context: Context, intent: Intent, requestCode: Int): PendingIntent {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE
        )
    } else {
        PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            0
        )
    }
}

// 通用工具方法
fun getSafePendingIntent(
    context: Context,
    requestCode: Int,
    intent: Intent,
    isMutable: Boolean = false,
    flags: Int = PendingIntent.FLAG_UPDATE_CURRENT
): PendingIntent {
    val immutableFlag = if (isMutable) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_MUTABLE
        } else {
            0
        }
    } else {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_IMMUTABLE
        } else {
            0
        }
    }
    
    return PendingIntent.getActivity(
        context,
        requestCode,
        intent,
        flags or immutableFlag
    )
}
```

---

## 5. Intent Flag 常用标志位

### 5.1 Activity Flag 分类

**任务栈控制 Flag：**

```kotlin
// 1. FLAG_ACTIVITY_NEW_TASK
// 在新任务栈中启动 Activity
val intent = Intent(this, TargetActivity::class.java).apply {
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}
// 使用场景：Service 启动 Activity、Notification 点击跳转

// 2. FLAG_ACTIVITY_SINGLE_TOP
// 如果栈顶已是该 Activity，复用栈顶
addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)

// 3. FLAG_ACTIVITY_CLEAR_TOP
// 清除目标 Activity 下方的所有 Activity
addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

// 4. FLAG_ACTIVITY_CLEAR_TASK
// 清除整个任务栈
addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK)

// 5. FLAG_ACTIVITY_MULTIPLE_TASK
// 允许创建多个相同任务
addFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK)
```

**生命周期控制 Flag：**

```kotlin
// 6. FLAG_ACTIVITY_NO_HISTORY
// Activity 不使用后不在历史记录中保留
addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY)

// 7. FLAG_ACTIVITY_CLEAR_TOP
// 清除栈中目标 Activity 上方的所有 Activity
addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

// 8. FLAG_ACTIVITY_FORWARD_RESULT
// 将结果转发给下一个 Activity
addFlags(Intent.FLAG_ACTIVITY_FORWARD_RESULT)
```

**UI 控制 Flag：**

```kotlin
// 9. FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
// 不从最近任务列表中显示
addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS)

// 10. FLAG_ACTIVITY_NEW_DOCUMENT
// 作为新文档打开（Android 7.0+）
addFlags(Intent.FLAG_ACTIVITY_NEW_DOCUMENT)

// 11. FLAG_ACTIVITY_TASK_ON_HOME
// 将任务移到主屏幕
addFlags(Intent.FLAG_ACTIVITY_TASK_ON_HOME)
```

### 5.2 Flag 组合使用

**场景 1：从 Notification 启动 Activity**

```kotlin
val intent = Intent(this, MainActivity::class.java).apply {
    // 必须：在新任务栈中启动
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    // 可选：如果栈顶是 MainActivity，复用
    addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    // 可选：清除栈中其他 Activity
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
}
```

**场景 2：登录页跳转（清除历史）**

```kotlin
val intent = Intent(this, HomeActivity::class.java).apply {
    // 在新任务栈中启动
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    // 清除整个任务栈
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK)
}
startActivity(intent)
// 现在只能从 HomeActivity 开始，无法返回登录页
```

**场景 3：查看大图（不保留在历史中）**

```kotlin
val intent = Intent(this, ImageViewActivity::class.java).apply {
    // 不保留在历史记录中
    addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY)
    // 用户退出后立即清除
    addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS)
}
```

**场景 4：SingleTask + CLEAR_TOP**

```kotlin
// 当目标 Activity 的启动模式为 SingleTask 时
val intent = Intent(this, MainActivity::class.java).apply {
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
}
// 效果：如果 MainActivity 已存在，清除其上方所有 Activity，并调用 onNewIntent()
```

### 5.3 Flag 使用注意事项

```kotlin
// ⚠️ 注意 1：FLAG_ACTIVITY_NEW_TASK 的副作用
// 使用 NEW_TASK 时，Activity 会在新的任务栈中启动
// 可能导致用户按 Home 键后回到原任务栈

// ⚠️ 注意 2：FLAG_ACTIVITY_CLEAR_TASK 需要配合 NEW_TASK
val intent = Intent(this, MainActivity::class.java).apply {
    // ❌ 错误：单独使用 CLEAR_TASK 无效
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK)
    
    // ✅ 正确：配合 NEW_TASK 使用
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
}

// ⚠️ 注意 3：Flag 的组合顺序
// 某些 Flag 的组合会产生特定效果
addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
```

---

## 6. Intent 数据传递限制

### 6.1 1MB 限制

**问题：Intent 传递数据有大约 1MB 的限制（TransactionTooLargeException）**

```kotlin
// ❌ 错误：传递大数据
class LargeDataActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val largeData = intent.getStringExtra("large_data")  // 可能导致崩溃
    }
}

// 错误信息：
// android.os.TransactionTooLargeException: 
//   data clip too large, parcel size: 10485760 bytes
```

### 6.2 安全的传递方式

**方案 1：使用文件传递**

```kotlin
// 发送方
fun sendLargeData(context: Context, data: String) {
    // 写入临时文件
    val file = File(context.cacheDir, "large_data.txt")
    file.writeText(data)
    
    val intent = Intent(context, TargetActivity::class.java)
    intent.putExtra("file_path", file.absolutePath)
    startActivity(intent)
}

// 接收方
class TargetActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val filePath = intent.getStringExtra("file_path")
        val data = File(filePath).readText()
        
        // 使用完后删除
        File(filePath).delete()
    }
}
```

**方案 2：使用 ContentProvider**

```kotlin
// 发送方
fun sendLargeData(context: Context, data: List<String>) {
    // 将数据存储到 ContentProvider
    val uri = context.contentResolver.insert(
        TempDataContract.CONTENT_URI,
        ContentValues().apply {
            put(TempDataContract.DATA, Json.encode(data))
            put(TempDataContract.CREATED_AT, System.currentTimeMillis())
        }
    )
    
    val intent = Intent(context, TargetActivity::class.java)
    intent.data = uri
    startActivity(intent)
}

// 接收方
class TargetActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val uri = intent.data
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val data = it.getString(it.getColumnIndexOrThrow(TempDataContract.DATA))
                // 处理数据
            }
        }
    }
}
```

**方案 3：使用 SharedPreferences**

```kotlin
// 发送方
fun sendLargeData(context: Context, data: String) {
    // 写入 SharedPreferences
    val prefs = context.getSharedPreferences("temp_data", Context.MODE_PRIVATE)
    prefs.edit().putString("large_data", data).apply()
    
    val intent = Intent(context, TargetActivity::class.java)
    intent.putExtra("has_data", true)
    startActivity(intent)
}

// 接收方
class TargetActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val prefs = getSharedPreferences("temp_data", Context.MODE_PRIVATE)
        val data = prefs.getString("large_data", null)
        
        // 清除数据
        prefs.edit().remove("large_data").apply()
    }
}
```

**方案 4：使用 ViewModel（应用内）**

```kotlin
// 定义共享 ViewModel
class TempDataViewModel : ViewModel() {
    private var _data: String? = null
    val data: String? get() = _data
    
    fun setData(data: String) {
        _data = data
    }
    
    fun clearData() {
        _data = null
    }
}

// 发送方
class SenderActivity : AppCompatActivity() {
    private val viewModel: TempDataViewModel by viewModels()
    
    fun sendToTarget() {
        viewModel.setData(largeData)
        
        val intent = Intent(this, TargetActivity::class.java)
        startActivity(intent)
    }
}

// 接收方
class TargetActivity : AppCompatActivity() {
    private val viewModel: TempDataViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val data = viewModel.data
        viewModel.clearData()
    }
}
```

### 6.3 Intent 能传递的数据类型

```kotlin
// 基本类型
intent.putExtra("int", 123)
intent.putExtra("long", 123L)
intent.putExtra("float", 3.14f)
intent.putExtra("double", 3.14)
intent.putExtra("boolean", true)
intent.putExtra("char", 'A')

// 字符串
intent.putExtra("string", "text")
intent.putStringArrayListExtra("strings", arrayListOf("a", "b"))

// 可序列化的对象
intent.putExtra("serializable", UserSerializable(name, age))
intent.putSerializableExtras("users", HashSet(arrayOf(user1, user2)))

// Parcelable（推荐）
intent.putExtra("parcelable", UserParcelable(name, age))
intent.putParcelableArrayListExtra("users", arrayListOf(user1, user2))

// Bundle
intent.putExtra("bundle", bundle)

// ClipData（拖拽、剪贴板）
intent.clipData = ClipData.newUri(...)
```

---

## 7. ClipData 传递大文件

### 7.1 什么是 ClipData

ClipData 用于封装多个 Uri，支持拖拽、剪贴板和数据共享。

### 7.2 使用 ClipData 传递文件

```kotlin
// 方式 1：单个文件
fun shareSingleFile(context: Context, fileUri: Uri) {
    val clipData = ClipData.newUri(
        context,
        "File Share",
        fileUri
    )
    
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "application/*"
        putExtra(Intent.EXTRA_STREAM, fileUri)
        clipData = clipData
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    
    startActivity(Intent.createChooser(intent, "分享文件"))
}

// 方式 2：多个文件
fun shareMultipleFiles(context: Context, fileUris: List<Uri>) {
    val clipData = ClipData.newUri(
        context,
        "File Share",
        fileUris[0]  // 第一个 URI
    )
    
    // 添加其他 URI
    for (i in 1 until fileUris.size) {
        clipData.addItem(
            ClipData.Item(fileUris[i]).apply {
                icon = context.getDrawable(R.drawable.ic_file)
            }
        )
    }
    
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "application/*"
        clipData = clipData
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    
    startActivity(Intent.createChooser(intent, "分享文件"))
}
```

### 7.3 接收 ClipData

```kotlin
class ClipDataReceiverActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val clipData = intent.clipData
        clipData?.let {
            for (i in 0 until it.itemCount) {
                val item = it.getItemAt(i)
                
                // 获取 URI
                val uri = item.uri
                val text = item.text
                
                // 处理数据
                processItem(uri, text)
            }
        }
    }
    
    private fun processItem(uri: Uri?, text: String?) {
        // 处理文件
    }
}
```

### 7.4 拖拽功能

```kotlin
// 设置拖拽
class DraggableImageView(context: Context) : ImageView(context) {
    
    init {
        isClickable = true
        isLongClickable = true
    }
    
    override fun onLongClick(v: View): Boolean {
        val clipData = ClipData.newUri(
            context,
            "Image Drag",
            imageUri
        )
        
        val dragShadowBuilder = View.DragShadowBuilder(this)
        
        startDragAndDrop(
            clipData,
            DragShadowBuilder(this),
            null,
            0
        )
        
        return true
    }
}

// 接收拖拽
class DropTargetActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val dropZone = findViewById<View>(R.id.drop_zone)
        
        dropZone.setOnDragListener { v, event ->
            when (event.action) {
                DragEvent.ACTION_DROP -> {
                    val clipData = event.clipData
                    // 处理接收的数据
                    true
                }
                DragEvent.ACTION_DRAG_ENTERED -> true
                else -> false
            }
        }
    }
}
```

---

## 8. 面试考点

### 8.1 基础题

**Q1: Intent 的作用是什么？**

A: Intent 是 Android 组件间通信的机制，用于启动 Activity、Service、发送广播，以及传递数据。

**Q2: 显式 Intent 和隐式 Intent 的区别？**

A:
- 显式 Intent：明确指定目标组件，用于应用内调用
- 隐式 Intent：通过 Action/Data/Category 让系统匹配，用于跨应用调用

**Q3: IntentFilter 的匹配规则？**

A: IntentFilter 通过 Action、Data、Category 三要素匹配 Intent，三者必须全部匹配。

### 8.2 进阶题

**Q4: PendingIntent 的作用和类型？**

A:
- 作用：延迟执行 Intent，授权其他应用使用
- 类型：getActivity()、getBroadcast()、getService()

**Q5: PendingIntent 的安全风险？**

A:
- PendingIntent 劫持：其他应用修改 Intent
- 重复触发：相同的 requestCode
- 解决方案：使用 FLAG_IMMUTABLE、动态 requestCode

**Q6: Intent 传递数据的限制？**

A: Intent 传递数据约 1MB 限制，超过会抛出 TransactionTooLargeException。

### 8.3 高级题

**Q7: 如何传递大文件？**

A:
- 使用文件路径 + 临时文件
- 使用 ContentProvider
- 使用 ClipData 传递 Uri
- 使用 SharedPreferences/ViewModel

**Q8: FLAG_ACTIVITY_NEW_TASK 的作用和副作用？**

A:
- 作用：在新任务栈中启动 Activity
- 副作用：可能导致任务栈混乱

**Q9: 如何防止 PendingIntent 劫持？**

A:
- 使用 FLAG_IMMUTABLE
- 验证目标组件
- 使用动态 requestCode

---

## 总结

Intent 是 Android 组件通信的核心，掌握要点：

1. 区分显式和隐式 Intent 的适用场景
2. 理解 IntentFilter 的匹配规则
3. 注意 PendingIntent 的安全风险
4. 合理使用 Intent Flag 控制任务栈
5. 避免 Intent 传递大数据
6. 使用 ClipData 传递文件
