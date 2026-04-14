# SharedPreferences：Android 轻量级数据存储

## 目录

1. [SharedPreferences 概述](#1-sharedpreferences-概述)
2. [基本使用方式](#2-基本使用方式)
3. [高级功能与 API](#3-高级功能与-api)
4. [性能问题分析](#4-性能问题分析)
5. [数据安全与加密](#5-数据安全与加密)
6. [DataStore 替代方案](#6-datastore-替代方案)
7. [最佳实践](#7-最佳实践)
8. [面试考点](#8-面试考点)

---

## 1. SharedPreferences 概述

### 1.1 什么是 SharedPreferences

SharedPreferences 是 Android 提供的一种轻量级数据存储机制，采用 **XML 格式** 在本地保存 **键值对（Key-Value）** 数据。它是 Android 最早的数据持久化方案之一，适用于存储简单的配置信息、用户偏好设置等小量数据。

```
特点：
- 简单易用，API 友好
- 数据存储为 XML 文件
- 支持基本数据类型
- 适合存储少量配置数据
- 读写操作同步，可能导致性能问题
```

### 1.2 数据存储位置

SharedPreferences 数据存储在应用的私有目录中：

```
存储路径：/data/data/<package_name>/shared_prefs/

文件命名规则：<文件名>.xml

例如：
/data/data/com.example.app/shared_prefs/
    ├── settings.xml
    ├── user_prefs.xml
    └── app_config.xml
```

### 1.3 支持的数据类型

SharedPreferences 原生支持以下数据类型：

| 数据类型 | 写入方法 | 读取方法 |
|---------|---------|---------|
| String | `edit().putString(key, value)` | `getString(key, default)` |
| int | `edit().putInt(key, value)` | `getInt(key, default)` |
| float | `edit().putFloat(key, value)` | `getFloat(key, default)` |
| long | `edit().putLong(key, value)` | `getLong(key, default)` |
| boolean | `edit().putBoolean(key, value)` | `getBoolean(key, default)` |
| String Set | `edit().putStringSet(key, set)` | `getStringSet(key, default)` |

### 1.4 适用场景

**推荐使用场景：**

- 用户偏好设置（主题、语言、音量等）
- 应用配置信息
- 登录状态标记
- 简单的用户数据（用户名、头像 URL 等）
- 首选项开关

**不推荐场景：**

- 大量数据存储（超过 100KB）
- 频繁读写操作
- 复杂数据结构
- 敏感数据（需额外加密）
- 需要事务支持的数据

---

## 2. 基本使用方式

### 2.1 获取 SharedPreferences 实例

#### 方式一：通过 Context 获取（默认模式）

```kotlin
// 私有模式（默认）
val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)

// 或者使用 Kotlin 扩展函数
val sp by context.preferenceManager
```

#### 方式二：使用 PreferenceManager（推荐）

```kotlin
// Kotlin 扩展函数，提供更简洁的 API
val sp = PreferenceManager.getDefaultSharedPreferences(context)

// 或在 Activity 中使用
val sp = preferenceManager // 推荐方式
```

#### 方式三：通过文件名和模式获取

```kotlin
// 私有模式 - 只有当前应用可以访问
val privateSp = context.getSharedPreferences("private", Context.MODE_PRIVATE)

// 世界可读（不推荐，安全风险）
val worldReadableSp = context.getSharedPreferences("world", Context.MODE_WORLD_READABLE)

// 世界可读可写（严重安全风险）
val worldReadWriteSp = context.getSharedPreferences("world", Context.MODE_WORLD_READABLE or Context.MODE_WORLD_WRITEABLE)
```

> ⚠️ **安全提示：** `MODE_WORLD_READABLE` 和 `MODE_WORLD_WRITEABLE` 在 API 17+ 已被废弃，仅返回 MODE_PRIVATE。强烈建议使用 MODE_PRIVATE。

### 2.2 基本读写操作

#### 写入数据

```kotlin
class SharedPreferencesExample(context: Context) {
    private val sp = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    
    fun saveData() {
        val editor = sp.edit()
        
        // 写入不同类型的值
        editor.putString("user_name", "张三")
        editor.putInt("user_age", 25)
        editor.putFloat("volume", 0.8f)
        editor.putLong("last_login", System.currentTimeMillis())
        editor.putBoolean("is_dark_mode", true)
        
        // 写入 StringSet
        val tags = setOf("android", "kotlin", "development")
        editor.putStringSet("tags", tags)
        
        // 提交修改（同步）
        editor.apply() // 或 commit()
    }
}
```

#### 读取数据

```kotlin
fun readData(): Map<String, Any> {
    val sp = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    
    val map = mutableMapOf<String, Any>()
    
    map["userName"] = sp.getString("user_name", "默认用户")
    map["userAge"] = sp.getInt("user_age", 0)
    map["volume"] = sp.getFloat("volume", 0.5f)
    map["lastLogin"] = sp.getLong("last_login", 0L)
    map["isDarkMode"] = sp.getBoolean("is_dark_mode", false)
    map["tags"] = sp.getStringSet("tags", hashSetOf())
    
    return map
}
```

### 2.3 删除与清空操作

```kotlin
fun deleteOperations() {
    val sp = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    val editor = sp.edit()
    
    // 删除单个键
    editor.remove("user_name")
    
    // 清空所有数据
    editor.clear()
    
    // 提交
    editor.apply()
}
```

### 2.4 判断键是否存在

```kotlin
fun containsKey(key: String): Boolean {
    val sp = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    return sp.contains(key)
}

fun getAllKeys(): Set<String> {
    val sp = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    return sp.all.keys
}
```

### 2.5 commit() vs apply()

这是面试中的高频考点，两者的区别非常重要：

```kotlin
// commit() - 同步提交
val success: Boolean = editor.commit()

// apply() - 异步提交
editor.apply()
```

#### 详细对比

| 特性 | commit() | apply() |
|-----|---------|---------|
| **执行方式** | 同步 | 异步 |
| **返回值** | Boolean（成功/失败） | 无返回值（void） |
| **性能** | 阻塞当前线程 | 不阻塞，性能更好 |
| **失败处理** | 可能抛出异常 | 失败时回滚 |
| **使用场景** | 需要确保提交成功 | 一般场景（推荐） |

#### 底层实现原理

```kotlin
// commit() 实现（简化）
fun commit(): Boolean {
    writeToFile() // 同步写入 XML 文件
    Editor() // 创建新 Editor 实例
    return true
}

// apply() 实现（简化）
fun apply() {
    // 将修改暂存到 SharedPreferencesImpl 的 pendingWrites 队列
    // 通过 MessageQueue 异步写入
    // 如果后续有相同的修改，会合并写入操作
    pendingWrites.offer(CommitOp(this, mCommittedEdits))
}
```

#### 实际示例

```kotlin
// 场景 1：需要确保数据提交成功
if (editor.commit()) {
    Toast.makeText(context, "保存成功", Toast.LENGTH_SHORT).show()
} else {
    Toast.makeText(context, "保存失败", Toast.LENGTH_SHORT).show()
}

// 场景 2：普通保存，不关心结果（推荐）
editor.apply()
```

---

## 3. 高级功能与 API

### 3.1 监听数据变化

SharedPreferences 提供了注册监听器来监控数据变化：

```kotlin
class SharedPreferencesListenerExample(context: Context) {
    private val sp = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    private val listener = SharedPreferences.OnSharedPreferenceChangeListener { prefs, key ->
        when (key) {
            "user_name" -> {
                val newName = prefs?.getString("user_name", "")
                updateUserNameUI(newName)
            }
            "is_dark_mode" -> {
                val isDark = prefs?.getBoolean("is_dark_mode", false)
                updateTheme(isDark)
            }
            "language" -> {
                val language = prefs?.getString("language", "zh")
                switchLanguage(language)
            }
        }
    }
    
    init {
        // 注册监听器
        sp.registerOnSharedPreferenceChangeListener(listener)
    }
    
    // 记得在适当的时候注销监听器
    fun cleanup() {
        sp.unregisterOnSharedPreferenceChangeListener(listener)
    }
}
```

### 3.2 批量操作优化

```kotlin
// 错误示例：每次都触发写入
for (i in 1..100) {
    val editor = sp.edit()
    editor.putString("key_$i", "value_$i")
    editor.apply() // 100 次写入操作
}

// 正确示例：批量写入
fun batchWrite() {
    val editor = sp.edit()
    
    for (i in 1..100) {
        editor.putString("key_$i", "value_$i")
    }
    
    // 一次性写入所有数据
    editor.apply()
}
```

### 3.3 使用 Kotlin 扩展函数封装

```kotlin
// 扩展函数封装常用操作
val Context.appPreferences: SharedPreferences by lazy {
    getSharedPreferences("app_settings", Context.MODE_PRIVATE)
}

// 字符串操作
inline fun <reified T> SharedPreferences.getString(
    key: String, 
    defaultValue: T
): T = when (T::class) {
    String::class -> getString(key, defaultValue as? String) as T
    else -> defaultValue
}

// 封装常用操作
fun SharedPreferences.putString(key: String, value: String?) {
    edit().putString(key, value).apply()
}

fun SharedPreferences.putInt(key: String, value: Int) {
    edit().putInt(key, value).apply()
}

// 类型安全扩展
class TypedPreferences(val sp: SharedPreferences) {
    fun string(key: String, default: String = ""): String = 
        sp.getString(key, default)
    
    fun int(key: String, default: Int = 0): Int = 
        sp.getInt(key, default)
    
    fun long(key: String, default: Long = 0L): Long = 
        sp.getLong(key, default)
    
    fun boolean(key: String, default: Boolean = false): Boolean = 
        sp.getBoolean(key, default)
    
    fun float(key: String, default: Float = 0f): Float = 
        sp.getFloat(key, default)
    
    fun stringSet(key: String, default: Set<String> = hashSetOf()): Set<String> = 
        sp.getStringSet(key, default)
    
    // 批量写入
    fun batch(block: SharedPreferences.Editor.() -> Unit) {
        sp.edit(block).apply()
    }
    
    // 移除键
    fun remove(key: String) {
        sp.edit().remove(key).apply()
    }
    
    // 清空所有
    fun clear() {
        sp.edit().clear().apply()
    }
}

// 使用示例
fun useTypedPreferences(context: Context) {
    val prefs = TypedPreferences(context.appPreferences)
    
    prefs.putString("user_name", "张三")
    prefs.putInt("user_age", 25)
    prefs.boolean("is_logged_in", true)
    
    val name = prefs.string("user_name")
    val age = prefs.int("user_age")
}
```

### 3.4 配合 Gson 存储复杂对象

```kotlin
// 使用 Gson 序列化复杂对象
class User(
    val id: Int,
    val name: String,
    val email: String,
    val avatar: String,
    val preferences: List<String>
)

object SharedPreferencesHelper {
    private val gson = Gson()
    
    fun saveObject(
        context: Context, 
        key: String, 
        objectToSave: Any
    ) {
        val json = gson.toJson(objectToSave)
        context.appPreferences.edit().putString(key, json).apply()
    }
    
    fun getObject(
        context: Context, 
        key: String, 
        classOfT: Class<out Any>
    ): Any? {
        val json = context.appPreferences.getString(key, null)
        return if (json != null) {
            gson.fromJson(json, classOfT)
        } else {
            null
        }
    }
    
    // 泛型版本（Kotlin）
    inline fun <reified T> save(context: Context, key: String, value: T) {
        val json = gson.toJson(value)
        context.appPreferences.edit().putString(key, json).apply()
    }
    
    inline fun <reified T> get(
        context: Context, 
        key: String, 
        defaultValue: T? = null
    ): T? {
        val json = context.appPreferences.getString(key, null)
        return if (json != null) {
            gson.fromJson(json, T::class.java)
        } else {
            defaultValue
        }
    }
}

// 使用示例
fun saveUser(user: User) {
    SharedPreferencesHelper.save(context, "current_user", user)
}

fun loadUser(context: Context): User? {
    return SharedPreferencesHelper.get<User>(context, "current_user")
}
```

### 3.5 Android Preferences 库（AndroidX）

AndroidX 提供了 Jetpack Preferences 库，提供更现代的 API：

```kotlin
// 添加依赖
// implementation 'androidx.preference:preference-ktx:1.2.1'

class PreferencesManager(private val context: Context) {
    private val preferences = PreferenceManager.getDefaultSharedPreferences(context)
    
    // 使用偏好对象（推荐方式）
    private val userName by stringPreferences("user_name", "Guest")
    private val userAge by intPreferences("user_age", 18)
    private val isLoggedIn by booleanPreferences("is_logged_in", false)
    private val lastLoginTime by longPreferences("last_login_time", 0L)
    private val volume by floatPreferences("volume", 0.5f)
    
    // 监听单个键变化
    fun observeUserName(context: Context, listener: (String) -> Unit) {
        val flow = preferences.flowString("user_name", "Guest")
        flow.collect { userName ->
            listener(userName)
        }
    }
    
    // 使用 AndroidX Preferences DataStore（更推荐）
    private val dataStore = context.dataStore
    
    suspend fun saveDataStore(key: String, value: String) {
        dataStore.edit { preferences ->
            preferences[key] = value
        }
    }
    
    suspend fun getDataStore(key: String, default: String = ""): String {
        return dataStore.data.map { preferences ->
            preferences[key] ?: default
        }.first()
    }
}
```

---

## 4. 性能问题分析

### 4.1 性能瓶颈

SharedPreferences 存在多个性能问题：

#### 问题 1：XML 解析开销

```kotlin
// 每次读取都会解析整个 XML 文件
// 文件越大，解析越慢

// 示例：大文件性能测试
class PerformanceTest(context: Context) {
    private val sp = context.getSharedPreferences("large_prefs", Context.MODE_PRIVATE)
    
    fun testWritePerformance() {
        val startTime = System.currentTimeMillis()
        val editor = sp.edit()
        
        // 写入 1000 个键
        for (i in 1..1000) {
            editor.putString("key_$i", "value_$i")
        }
        
        editor.commit() // 同步提交
        
        val duration = System.currentTimeMillis() - startTime
        Log.d("Performance", "Write 1000 keys: ${duration}ms")
    }
    
    fun testReadPerformance() {
        val startTime = System.currentTimeMillis()
        
        // 读取所有键
        val all = sp.all
        
        val duration = System.currentTimeMillis() - startTime
        Log.d("Performance", "Read all keys: ${duration}ms")
    }
}
```

#### 问题 2：主线程阻塞

```kotlin
// commit() 在主线程执行会阻塞 UI
class MainActivity : AppCompatActivity() {
    private val sp = getSharedPreferences("settings", Context.MODE_PRIVATE)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 错误：主线程大量写入
        for (i in 1..100) {
            val editor = sp.edit()
            editor.putString("key_$i", "value_$i")
            editor.commit() // 阻塞主线程！
        }
        
        // 正确：使用 apply() 或在后台线程执行
        val editor = sp.edit()
        for (i in 1..100) {
            editor.putString("key_$i", "value_$i")
        }
        editor.apply() // 异步不阻塞
    }
}
```

#### 问题 3：多次写入不合并

```kotlin
// 错误示例：10 次写入操作
fun badExample() {
    for (i in 1..10) {
        val editor = sp.edit()
        editor.putString("key_$i", "value_$i")
        editor.apply() // 10 次写入文件
    }
}

// 正确示例：批量写入一次
fun goodExample() {
    val editor = sp.edit()
    for (i in 1..10) {
        editor.putString("key_$i", "value_$i")
    }
    editor.apply() // 只写入一次
}
```

### 4.2 性能测试对比

```kotlin
class SharedPreferencesPerformanceTest {
    // 测试配置
    private val testCases = listOf(
        TestCase(100, "small"),
        TestCase(1000, "medium"),
        TestCase(10000, "large")
    )
    
    // SharedPreferences 测试
    fun testSharedPreferences(context: Context, size: Int) {
        val sp = context.getSharedPreferences("perf_test_sp", Context.MODE_PRIVATE)
        val editor = sp.edit()
        
        val writeStart = System.currentTimeMillis()
        for (i in 1..size) {
            editor.putString("key_$i", "value_$i")
        }
        editor.commit()
        val writeTime = System.currentTimeMillis() - writeStart
        
        val readStart = System.currentTimeMillis()
        val all = sp.all
        val readTime = System.currentTimeMillis() - readStart
        
        Log.d("SP_Perf", "Size=$size, Write=$writeTime ms, Read=$readTime ms")
    }
    
    // DataStore 测试
    suspend fun testDataStore(context: Context, size: Int) {
        val dataStore = context.dataStore
        
        val writeStart = System.currentTimeMillis()
        dataStore.edit { prefs ->
            for (i in 1..size) {
                prefs["key_$i"] = "value_$i"
            }
        }
        val writeTime = System.currentTimeMillis() - writeStart
        
        val readStart = System.currentTimeMillis()
        val data = dataStore.data.first()
        val readTime = System.currentTimeMillis() - readStart
        
        Log.d("DataStore_Perf", "Size=$size, Write=$writeTime ms, Read=$readTime ms")
    }
}

// 性能对比结果（典型值）
// | 操作 | 数据量 | SharedPreferences | DataStore |
// |------|--------|-----------------|-----------|
// | 写入 | 100 条 | 5ms | 8ms |
// | 写入 | 1000 条 | 45ms | 15ms |
// | 写入 | 10000 条 | 450ms | 35ms |
// | 读取 | 100 条 | 3ms | 5ms |
// | 读取 | 1000 条 | 25ms | 8ms |
// | 读取 | 10000 条 | 250ms | 15ms |
```

### 4.3 优化建议

#### 优化 1：限制数据量

```kotlin
// 监控 SharedPreferences 文件大小
fun getSharedPreferencesSize(context: Context, name: String): Long {
    val file = File(
        context.filesDir,
        "shared_prefs/${name}.xml"
    )
    return if (file.exists()) file.length() else 0
}

// 检查是否需要清理
fun shouldCleanSharedPreferences(context: Context, name: String): Boolean {
    val size = getSharedPreferencesSize(context, name)
    return size > 100 * 1024 // 超过 100KB
}
```

#### 优化 2：使用多个小文件代替大文件

```kotlin
// 错误：一个大文件存储所有数据
val allPrefs = context.getSharedPreferences("all_data", Context.MODE_PRIVATE)

// 正确：按模块拆分
class PreferencesManager(context: Context) {
    private val userPrefs = context.getSharedPreferences("user", Context.MODE_PRIVATE)
    private val settingPrefs = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
    private val cachePrefs = context.getSharedPreferences("cache", Context.MODE_PRIVATE)
    
    fun saveUserName(name: String) {
        userPrefs.edit().putString("name", name).apply()
    }
    
    fun saveThemeDark(isDark: Boolean) {
        settingPrefs.edit().putBoolean("dark_mode", isDark).apply()
    }
}
```

#### 优化 3：避免频繁写入

```kotlin
// 使用防抖（Debounce）减少写入次数
class DebouncedSharedPreferences(context: Context) {
    private val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
    private val debounceMap = mutableMapOf<String, Long>()
    private val DEBOUNCE_INTERVAL = 1000L // 1 秒
    
    fun putDebouncedString(key: String, value: String) {
        val now = System.currentTimeMillis()
        
        // 如果距离上次写入时间太短，不执行
        if (now - (debounceMap[key] ?: 0) < DEBOUNCE_INTERVAL) {
            return
        }
        
        debounceMap[key] = now
        sp.edit().putString(key, value).apply()
    }
    
    // 使用协程实现防抖
    suspend fun putDebouncedWithCoroutine(key: String, value: String) {
        delay(DEBOUNCE_INTERVAL)
        sp.edit().putString(key, value).apply()
    }
}
```

#### 优化 4：使用内存缓存

```kotlin
// 使用 LruCache 缓存常用值
class CachedSharedPreferences(context: Context) {
    private val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
    
    // LruCache 配置
    private val cache = object : LruCache<String, Any>(100) {
        override fun sizeOf(key: String, value: Any): Int {
            return 1 // 每个条目计数为 1
        }
    }
    
    fun getString(key: String, default: String): String {
        // 先从缓存获取
        var value = cache.get(key)
        
        // 缓存未命中，从磁盘读取
        if (value == null) {
            value = sp.getString(key, default)
            cache.put(key, value)
        }
        
        return value as String
    }
    
    fun putString(key: String, value: String) {
        sp.edit().putString(key, value).apply()
        cache.put(key, value) // 更新缓存
    }
    
    fun clearCache() {
        cache.evictAll()
    }
}
```

---

## 5. 数据安全与加密

### 5.1 默认安全性

SharedPreferences 的默认存储方式存在安全隐患：

```xml
<!-- 存储位置：/data/data/com.example.app/shared_prefs/settings.xml -->
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="user_name">张三</string>
    <string name="password">123456</string> <!-- 明文存储！ -->
    <string name="token">eyJhbGciOiJIUzI1NiIsInR5cCI6...</string>
</map>
```

#### 安全风险：

1. **Root 设备可读取**：设备 Root 后，任何人都可以读取 XML 文件
2. **备份包含数据**：完整备份会包含所有 SharedPreferences
3. **明文存储**：敏感信息直接明文存储

### 5.2 使用 EncryptedSharedPreferences

AndroidX 提供了加密的 SharedPreferences 实现：

```kotlin
// 添加依赖
// implementation 'androidx.security:security-crypto:1.1.0-alpha06'

import android.security.crypto.CipherParams
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

// 初始化加密 SharedPreferences
class SecureSharedPreferences(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeySchema.V1)
        .build()
    
    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    // 存储敏感数据
    fun saveCredentials(username: String, password: String) {
        encryptedPrefs.edit()
            .putString("username", username)
            .putString("password", password)
            .apply()
    }
    
    fun getPassword(): String? {
        return encryptedPrefs.getString("password", null)
    }
    
    fun saveToken(token: String) {
        encryptedPrefs.edit()
            .putString("auth_token", token)
            .apply()
    }
}
```

### 5.3 自定义加密方案

如果需要更灵活的加密方案，可以自定义实现：

```kotlin
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.IvParameterSpec
import java.security.SecureRandom

class CustomEncryptionHelper(private val context: Context) {
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }
    private val alias = "encryption_key"
    
    // 生成或获取密钥
    fun getOrCreateKey(): SecretKey {
        if (!keyStore.containsAlias(alias)) {
            val keyGen = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )
            keyGen.init(
                KeyGenParameterSpec.Builder(
                    alias,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build()
            )
            keyGen.generateKey()
        }
        val keyEntry = keyStore.getKey(alias, null) as KeyStore.SecretKeyEntry
        return keyEntry.secretKey as SecretKey
    }
    
    // 加密字符串
    fun encrypt(plainText: String): String {
        val key = getOrCreateKey()
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        
        val iv = ByteArray(12)
        SecureRandom().nextBytes(iv)
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, key, spec)
        
        val encrypted = cipher.doFinal(plainText.toByteArray())
        return Base64.encodeToString(iv + encrypted, Base64.NO_WRAP)
    }
    
    // 解密字符串
    fun decrypt(cipherText: String): String {
        val key = getOrCreateKey()
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        
        val decoded = Base64.decode(cipherText, Base64.NO_WRAP)
        val iv = decoded.copyOfRange(0, 12)
        val cipherBytes = decoded.copyOfRange(12, decoded.size)
        
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, key, spec)
        
        val decrypted = cipher.doFinal(cipherBytes)
        return String(decrypted)
    }
    
    // 封装 SharedPreferences 操作
    fun saveEncrypted(key: String, value: String) {
        val encrypted = encrypt(value)
        context.getSharedPreferences("encrypted_prefs", Context.MODE_PRIVATE)
            .edit()
            .putString(key, encrypted)
            .apply()
    }
    
    fun getEncrypted(key: String, default: String = ""): String {
        val encrypted = context.getSharedPreferences("encrypted_prefs", Context.MODE_PRIVATE)
            .getString(key, null)
        
        return if (encrypted != null) {
            decrypt(encrypted)
        } else {
            default
        }
    }
}

// 使用示例
fun saveSensitiveData(context: Context) {
    val helper = CustomEncryptionHelper(context)
    
    helper.saveEncrypted("password", "my_secret_password")
    helper.saveEncrypted("credit_card", "4111111111111111")
    
    val password = helper.getEncrypted("password")
    Log.d("Secure", "Retrieved password: $password")
}
```

### 5.4 密钥管理最佳实践

```kotlin
// 使用 Android Keystore 系统
class KeyManager(private val context: Context) {
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }
    
    // 创建带生物识别要求的密钥
    fun createBiometricKey(alias: String) {
        val builder = KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true) // 需要生物识别
            .setUserAuthenticationValidityDurationSeconds(300) // 5 分钟内有效
        
        // 设置生物识别类型
        builder.setIsUserPresenceRequired(true)
        
        val keyGen = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        )
        keyGen.init(builder.build())
        keyGen.generateKey()
    }
    
    // 使用生物识别解锁加密数据
    suspend fun unlockWithBiometric(alias: String, encryptedData: ByteArray): ByteArray {
        val key = keyStore.getKey(alias, null) as SecretKey
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        
        // 显示生物识别对话框
        val cryptoObject = CancellationSignal()
        
        return cipher.doFinal(encryptedData)
    }
}
```

---

## 6. DataStore 替代方案

### 6.1 为什么使用 DataStore

DataStore 是 Jetpack 推荐的现代存储解决方案，相比 SharedPreferences 有显著优势：

| 特性 | SharedPreferences | DataStore |
|-----|-----------------|-----------|
| **API** | 同步阻塞 | 异步非阻塞 |
| **数据格式** | XML | Protobuf/二进制 |
| **类型安全** | 弱类型 | 强类型 |
| **并发写入** | 无保护 | 自动合并 |
| **监听** | 手动注册 | Flow 自动流 |
| **性能** | 数据量大时慢 | 优化更好 |
| **可靠性** | 可能丢数据 | 原子写入 |

### 6.2 Preferences DataStore 使用

```kotlin
// 添加依赖
// implementation "androidx.datastore:datastore-preferences:1.0.0"

class DataStoreManager(private val context: Context) {
    // 初始化 DataStore
    private val dataStore: DataStore<Preferences> = context.dataStore
    
    // 定义 Preference 键
    private val KEY_USERNAME = stringPreferences("username")
    private val KEY_USER_ID = longPreferences("user_id")
    private val KEY_IS_LOGGED_IN = booleanPreferences("is_logged_in")
    private val KEY_THEME = stringPreferences("theme")
    private val KEY_NOTIFICATIONS = booleanPreferences("notifications", default = true)
    
    // 写入数据
    suspend fun saveUsername(username: String) {
        dataStore.edit { preferences ->
            preferences[KEY_USERNAME] = username
        }
    }
    
    suspend fun saveUserId(id: Long) {
        dataStore.edit { preferences ->
            preferences[KEY_USER_ID] = id
        }
    }
    
    suspend fun saveLoginState(isLoggedIn: Boolean) {
        dataStore.edit { preferences ->
            preferences[KEY_IS_LOGGED_IN] = isLoggedIn
        }
    }
    
    // 读取数据（返回 Flow）
    fun observeUsername(): Flow<String> {
        return dataStore.data.map { preferences ->
            preferences[KEY_USERNAME] ?: "Guest"
        }
    }
    
    fun observeLoginState(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[KEY_IS_LOGGED_IN] ?: false
        }
    }
    
    // 读取单次数据
    suspend fun getUsername(): String {
        return dataStore.data.first()[KEY_USERNAME] ?: "Guest"
    }
    
    // 删除键
    suspend fun removeUsername() {
        dataStore.edit { preferences ->
            preferences.remove(KEY_USERNAME)
        }
    }
    
    // 清空所有
    suspend fun clearAll() {
        dataStore.edit { preferences ->
            preferences.clear()
        }
    }
    
    // 批量操作
    suspend fun saveUserProfile(name: String, email: String, age: Int) {
        dataStore.edit { preferences ->
            preferences[KEY_USERNAME] = name
            preferences[stringPreferences("email")] = email
            preferences[intPreferences("age")] = age
        }
    }
    
    // 复杂操作（使用回调避免并发问题）
    suspend fun incrementCounter() {
        dataStore.edit { preferences ->
            val current = preferences[intPreferences("counter", 0)]
            preferences[intPreferences("counter")] = current + 1
        }
    }
}
```

### 6.3 Proto DataStore 使用

Proto DataStore 提供了类型安全的 Protobuf 数据存储：

```kotlin
// 1. 定义 Protobuf 文件（.proto）
/*
syntax = "proto3";

package com.example.app;

option java_package = "com.example.app";
option java_outer_classname = "AppPreferences";

message UserPreferences {
    string username = 1;
    int64 user_id = 2;
    bool is_logged_in = 3;
    string theme = 4;
    repeated string notifications = 5;
    Map<String, String> custom_settings = 6;
}

message AppPreferences {
    UserPreferences user = 1;
    string version = 2;
    int64 last_login = 3;
}
*/

// 2. 使用 Proto DataStore
class ProtoDataStoreManager(private val context: Context) {
    // 初始化
    private val dataStore: DataStore<ProtoBuf> = context
        .producesProtoDataStore("app_prefs.pb")
    
    // 写入数据
    suspend fun saveUserPreferences(username: String, userId: Long) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(
                    UserPreferences.newBuilder()
                        .setUsername(username)
                        .setUserId(userId)
                        .setLoggedIn(true)
                        .build()
                )
                .setLastLogin(System.currentTimeMillis())
                .build()
        }
    }
    
    // 读取数据（Flow）
    fun observeUserPreferences(): Flow<UserPreferences> {
        return dataStore.data.map { proto ->
            proto.user
        }
    }
    
    // 更新特定字段
    suspend fun updateTheme(theme: String) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(
                    current.user.toBuilder()
                        .setTheme(theme)
                        .build()
                )
                .build()
        }
    }
    
    // 删除特定字段
    suspend fun clearUserSession() {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(
                    UserPreferences.newBuilder()
                        .setLoggedIn(false)
                        .build()
                )
                .build()
        }
    }
}
```

### 6.4 Preferences vs Proto DataStore

```kotlin
// Preferences DataStore - 适合简单场景
class SimplePrefsDataStore(context: Context) {
    private val dataStore = context.dataStore
    
    private val KEY_NAME = stringPreferences("name")
    private val KEY_AGE = intPreferences("age")
    
    suspend fun save(name: String, age: Int) {
        dataStore.edit { prefs ->
            prefs[KEY_NAME] = name
            prefs[KEY_AGE] = age
        }
    }
    
    fun observe(): Flow<Pair<String, Int>> {
        return dataStore.data.map { prefs ->
            Pair(
                prefs[KEY_NAME] ?: "",
                prefs[KEY_AGE] ?: 0
            )
        }
    }
}

// Proto DataStore - 适合复杂场景
class ComplexProtoDataStore(context: Context) {
    private val dataStore = context.producesProtoDataStore("complex_prefs.pb")
    
    // 类型安全，编译时检查
    suspend fun saveComplexData(user: UserProto, settings: SettingsProto) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(user)
                .setSettings(settings)
                .build()
        }
    }
    
    fun observeUser(): Flow<UserProto> {
        return dataStore.data.map { proto ->
            proto.user
        }
    }
    
    fun observeSettings(): Flow<SettingsProto> {
        return dataStore.data.map { proto ->
            proto.settings
        }
    }
}
```

### 6.5 迁移方案

从 SharedPreferences 迁移到 DataStore：

```kotlin
class MigrationHelper(private val context: Context) {
    private val oldPrefs = context.getSharedPreferences("old_settings", Context.MODE_PRIVATE)
    private val newPrefs = context.dataStore
    
    // 迁移函数
    suspend fun migrate() {
        val migrated = oldPrefs.getBoolean("migrated", false)
        
        if (!migrated) {
            // 读取旧数据
            val username = oldPrefs.getString("username", "") ?: ""
            val userId = oldPrefs.getLong("user_id", 0L)
            val isLoggedIn = oldPrefs.getBoolean("is_logged_in", false)
            
            // 写入新数据
            newPrefs.edit { prefs ->
                prefs[usernamePref] = username
                prefs[userIdPref] = userId
                prefs[isLoggedInPref] = isLoggedIn
            }
            
            // 标记已迁移
            newPrefs.edit { prefs ->
                prefs[migratedPref] = true
            }
            
            // 可选：清理旧数据
            oldPrefs.edit().clear().apply()
        }
    }
    
    // 自动迁移（首次启动时）
    suspend fun autoMigrate() {
        try {
            migrate()
        } catch (e: Exception) {
            Log.e("Migration", "Migration failed", e)
        }
    }
}

// 使用示例
class MainActivity : AppCompatActivity() {
    private val migrationHelper = MigrationHelper(this)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 在协程中执行迁移
        lifecycleScope.launch {
            migrationHelper.autoMigrate()
            // 迁移完成后初始化 UI
        }
    }
}
```

---

## 7. 最佳实践

### 7.1 架构设计

```kotlin
// 推荐：使用 Repository 模式封装数据存储
class SettingsRepository(private val context: Context) {
    private val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
    private val encryptedSp = EncryptedSharedPreferences.create(
        context,
        "secure_settings",
        MasterKey.Builder(context).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    // 公开 API
    fun saveTheme(theme: String) {
        sp.edit().putString("theme", theme).apply()
    }
    
    fun getTheme(): String = sp.getString("theme", "light") ?: "light"
    
    fun saveAuthToken(token: String) {
        encryptedSp.edit().putString("auth_token", token).apply()
    }
    
    fun getAuthToken(): String? = encryptedSp.getString("auth_token", null)
    
    // 监听数据变化
    fun observeTheme(): Flow<String> {
        return MutableSharedFlow<String>()
    }
}

// ViewModel 中使用
class SettingsViewModel(application: Application) : ViewModel() {
    private val repository = SettingsRepository(application)
    
    private val _theme = MutableStateFlow(repository.getTheme())
    val theme: StateFlow<String> = _theme.asStateFlow()
    
    init {
        // 监听 SharedPreferences 变化
        val sp = application.getSharedPreferences("settings", Context.MODE_PRIVATE)
        sp.registerOnSharedPreferenceChangeListener { _, key ->
            if (key == "theme") {
                _theme.value = repository.getTheme()
            }
        }
    }
    
    fun updateTheme(newTheme: String) {
        repository.saveTheme(newTheme)
    }
}
```

### 7.2 线程安全

```kotlin
// SharedPreferences 不是线程安全的
class ThreadSafeSharedPreferences(context: Context) {
    private val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
    private val lock = Object()
    
    fun putString(key: String, value: String) {
        synchronized(lock) {
            sp.edit().putString(key, value).apply()
        }
    }
    
    fun getString(key: String, default: String): String {
        synchronized(lock) {
            return sp.getString(key, default) ?: default
        }
    }
}

// 使用协程的 better 方式
class CoroutineSharedPreferences(context: Context) {
    private val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
    private val dispatcher = Dispatchers.IO
    
    suspend fun putString(key: String, value: String) {
        withContext(dispatcher) {
            sp.edit().putString(key, value).apply()
        }
    }
    
    suspend fun getString(key: String, default: String): String {
        return withContext(dispatcher) {
            sp.getString(key, default) ?: default
        }
    }
}
```

### 7.3 性能优化总结

```kotlin
class OptimizedSharedPreferences(context: Context) {
    // 1. 按模块拆分文件
    private val userPrefs = context.getSharedPreferences("user", Context.MODE_PRIVATE)
    private val appPrefs = context.getSharedPreferences("app", Context.MODE_PRIVATE)
    
    // 2. 使用 LruCache 缓存
    private val cache = object : LruCache<String, String>(100) {
        override fun sizeOf(key: String, value: String): Int = 1
    }
    
    // 3. 防抖写入
    private val debounceMap = mutableMapOf<String, Job>()
    private val debounceScope = CoroutineScope(Dispatchers.IO)
    
    fun putDebouncedString(key: String, value: String) {
        debounceMap[key]?.cancel()
        
        debounceMap[key] = debounceScope.launch {
            delay(500) // 500ms 防抖
            appPrefs.edit().putString(key, value).apply()
        }
    }
    
    fun getCachedString(key: String, default: String): String {
        // 先查缓存
        val cached = cache.get(key)
        if (cached != null) return cached
        
        // 从磁盘读取
        val value = appPrefs.getString(key, default) ?: default
        cache.put(key, value)
        return value
    }
}
```

### 7.4 测试策略

```kotlin
// 单元测试示例
class SharedPreferencesTest {
    private lateinit var context: Context
    private lateinit var sp: SharedPreferences
    
    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        sp = context.getSharedPreferences("test_prefs", Context.MODE_PRIVATE)
    }
    
    @Test
    fun testSaveAndLoad() {
        // 写入
        sp.edit().putString("key", "value").apply()
        
        // 读取
        val result = sp.getString("key", null)
        assertEquals("value", result)
    }
    
    @Test
    fun testRemove() {
        sp.edit().putString("key", "value").apply()
        sp.edit().remove("key").apply()
        
        val result = sp.getString("key", "default")
        assertEquals("default", result)
    }
    
    @After
    fun teardown() {
        sp.edit().clear().apply()
    }
}
```

---

## 8. 面试考点

### 考点 1：SharedPreferences 存储位置和格式

**问题：** SharedPreferences 的数据存储在哪里？文件格式是什么？

**答案：**
- 存储路径：`/data/data/<package_name>/shared_prefs/`
- 文件格式：XML
- 文件命名：`<name>.xml`

```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="username">john_doe</string>
    <int name="age">25</int>
    <boolean name="isLoggedIn">true</boolean>
</map>
```

### 考点 2：commit() vs apply()

**问题：** commit() 和 apply() 的区别是什么？应该使用哪一个？

**答案：**
- **commit()**：同步提交，阻塞当前线程，返回 Boolean 表示成功/失败
- **apply()**：异步提交，不阻塞，性能更好，失败时回滚
- **推荐使用**：apply()，除非需要确保提交成功

```kotlin
// commit()
val success = editor.commit() // 阻塞，返回 true/false

// apply()（推荐）
editor.apply() // 异步，不阻塞
```

### 考点 3：SharedPreferences 的性能问题

**问题：** SharedPreferences 有哪些性能问题？如何优化？

**答案：**

**性能问题：**
1. 每次读写都解析整个 XML 文件
2. 数据量大时性能急剧下降
3. commit() 在主线程阻塞
4. 多次写入不合并

**优化方案：**
1. 限制数据量（< 100KB）
2. 使用 apply() 替代 commit()
3. 按模块拆分多个文件
4. 使用 LruCache 缓存常用值
5. 批量写入一次提交

### 考点 4：线程安全问题

**问题：** SharedPreferences 是线程安全的吗？

**答案：**
- SharedPreferences 的读操作是线程安全的
- 写操作（Editor）不是线程安全的，需要外部同步
- 多个线程同时写入可能导致数据丢失

```kotlin
// 线程安全的写入
synchronized(lock) {
    sp.edit().putString(key, value).apply()
}

// 或使用 DataStore（原生线程安全）
```

### 考点 5：DataStore 相比 SharedPreferences 的优势

**问题：** 为什么推荐使用 DataStore 替代 SharedPreferences？

**答案：**
- **异步 API**：不阻塞主线程
- **类型安全**：Protobuf 定义
- **自动并发合并**：避免数据竞争
- **Flow 监听**：响应式编程
- **更好的性能**：特别是大数据量场景
- **原子写入**：数据可靠性更高

### 考点 6：敏感数据加密

**问题：** 如何在 SharedPreferences 中安全存储敏感数据？

**答案：**
1. 使用 EncryptedSharedPreferences（推荐）
2. 使用 Android Keystore 系统
3. 自定义加密方案（AES/GCM）
4. 配合生物识别解锁

```kotlin
val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    MasterKey.Builder(context).build(),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

### 考点 7：监听数据变化

**问题：** 如何监听 SharedPreferences 的数据变化？

**答案：**
```kotlin
sp.registerOnSharedPreferenceChangeListener { prefs, key ->
    when (key) {
        "theme" -> updateTheme(prefs?.getString("theme", "light"))
        "language" -> changeLanguage(prefs?.getString("language", "zh"))
    }
}

// 记得注销
sp.unregisterOnSharedPreferenceChangeListener(listener)
```

### 考点 8：支持的类型

**问题：** SharedPreferences 支持哪些数据类型？

**答案：**
- String（字符串）
- int（整数）
- float（浮点数）
- long（长整数）
- boolean（布尔值）
- Set<String>（字符串集合）

### 考点 9：最佳实践

**问题：** 使用 SharedPreferences 的最佳实践是什么？

**答案：**
1. 只存储少量配置数据（< 100KB）
2. 使用 apply() 而非 commit()
3. 按模块拆分文件
4. 敏感数据使用加密
5. 考虑使用 DataStore 替代
6. 添加数据迁移机制
7. 进行单元测试

### 考点 10：迁移到 DataStore

**问题：** 如何将现有 SharedPreferences 迁移到 DataStore？

**答案：**
```kotlin
suspend fun migrate() {
    val migrated = dataStore.data.first()[migratedPref] ?: false
    
    if (!migrated) {
        val oldData = oldPrefs.getString("key", "") ?: ""
        dataStore.edit { prefs ->
            prefs[newKey] = oldData
            prefs[migratedPref] = true
        }
    }
}
```

### 附加考点

**Q11：** SharedPreferences 的 XML 文件如何恢复？

**A11：** 可以手动编辑 XML 文件，但不推荐。建议使用 Android Debug Bridge 或自定义恢复工具。

**Q12：** 如何备份和恢复 SharedPreferences？

**A12：** 使用 Android Backup 服务或手动序列化到外部存储。

**Q13：** SharedPreferences 在应用更新后会保留吗？

**A13：** 会保留，除非用户清除应用数据或应用包名改变。

**Q14：** 什么是 SharedPreferences 的 MODE 常量？

**A14：**
- MODE_PRIVATE（默认）：仅当前应用可访问
- MODE_WORLD_READABLE：所有应用可读（已废弃）
- MODE_WORLD_WRITEABLE：所有应用可读写（已废弃）
- MODE_MULTI_PROCESS：多进程支持（部分有效）

**Q15：** SharedPreferences 支持跨进程共享吗？

**A15：** 支持，但需要使用 MODE_MULTI_PROCESS，且存在竞争条件风险。推荐使用 DataStore 或 Room。

---

## 总结

SharedPreferences 是 Android 最简单、最经典的数据存储方案，适用于：

✅ 存储少量配置信息  
✅ 用户偏好设置  
✅ 应用开关状态  
❌ 不用于存储大量数据  
❌ 不用于频繁读写  
❌ 不用于存储复杂数据结构  

随着 DataStore 的成熟，新项目推荐使用 DataStore，但了解 SharedPreferences 的原理和使用仍然是 Android 开发的基础。

**面试准备建议：**
1. 掌握基本的读写操作
2. 理解 commit() vs apply() 的区别
3. 了解性能问题和优化方案
4. 熟悉 EncryptedSharedPreferences
5. 了解 DataStore 的优势

**推荐学习路径：**
SharedPreferences → EncryptedSharedPreferences → DataStore → Room

---

*本文档涵盖 SharedPreferences 的核心知识点，建议配合实际项目练习以加深理解。*