# Android 13/14/15 新特性

> **字数统计：约 9000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [Android 13 新特性](#1-android-13-新特性)
2. [Android 14 新特性](#2-android-14-新特性)
3. [Android 15 新特性](#3-android-15-新特性)
4. [适配指南](#4-适配指南)
5. [面试考点](#5-面试考点)

---

## 1. Android 13 新特性

### 1.1 通知权限

```kotlin
// 请求通知权限
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            NOTIFICATION_PERMISSION_REQUEST
        )
    }
}
```

### 1.2 精细权限

```kotlin
// 精确读取通话状态
Manifest.permission.READ_PHONE_STATE

// 精确读取联系人
Manifest.permission.READ_CONTACTS
```

### 1.3 动态字体

```kotlin
// 使用动态字体
val textStyle = TextStyle(
    fontFamily = FontFamily.Default,
    fontSize = 16.sp
)
```

---

## 2. Android 14 新特性

### 2.1 应用包可见性

```xml
<!-- AndroidManifest.xml -->
<queries>
    <package android:name="com.example.app" />
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="https" />
    </intent>
</queries>
```

### 2.2 隐私标签

```xml
<privacy-domain
    android:targetApi="34">
    <domain android:permission="android.permission.ACCESS_NETWORK_STATE" />
</privacy-domain>
```

### 2.3 备份与恢复

```kotlin
// 备份数据
val backupManager = getSystemService(BackupManager::class.java)
val data = mapOf("key" to "value")
backupManager.dataChanged(data)
```

---

## 3. Android 15 新特性

### 3.1 隐私沙盒

```kotlin
// 访问受限数据
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
    // 使用 PrivacySandbox
}
```

### 3.2 应用启动优化

```kotlin
// 延迟初始化
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // 使用 App Startup
        InitializationService.get(this)
            .initializeComponent(MyInitializer::class.java)
    }
}
```

---

## 4. 适配指南

### 4.1 目标 SDK

```gradle
android {
    defaultConfig {
        targetSdk 34
    }
}
```

### 4.2 权限处理

```kotlin
// 动态权限
fun requestPermission(permission: String, requestCode: Int) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        // 特殊权限处理
    }
    ActivityCompat.requestPermissions(this, arrayOf(permission), requestCode)
}
```

---

## 5. 面试考点

**Q1: Android 13 新增权限？**
- POST_NOTIFICATIONS

**Q2: 如何处理权限拒绝？**
- 检测版本
- 提供降级方案

---

*本文完*
