# DataStore：Android 现代数据存储方案

## 目录

1. [DataStore 概述](#1-datastore-概述)
2. [Preferences DataStore](#2-preferences-datastore)
3. [Proto DataStore](#3-proto-datastore)
4. [DataStore vs SharedPreferences](#4-datastore-vs-sharedpreferences)
5. [高级用法](#5-高级用法)
6. [迁移与兼容](#6-迁移与兼容)
7. [最佳实践](#7-最佳实践)
8. [面试考点](#8-面试考点)

---

## 1. DataStore 概述

### 1.1 什么是 DataStore

DataStore 是 Jetpack 套件中由 Google 官方推出的现代数据存储解决方案，采用 **Kotlin Coroutines** 和 **Flow** 提供异步、类型安全的数据存储 API。

```
核心特性：
- 异步非阻塞 API
- 响应式数据流（Flow）
- 类型安全
- 支持并发写入（自动合并）
- 基于 Protobuf 的二进制存储
- 向后兼容性
```

### 1.2 DataStore 的两种类型

| 类型 | 特点 | 适用场景 |
|-----|-|-----|
| **Preferences DataStore** | 类似 SharedPreferences，键值对存储 | 简单配置、快速迁移 |
| **Proto DataStore** | Protobuf 序列化，类型安全 | 复杂数据、新项目 |

### 1.3 添加依赖

```gradle
dependencies {
    // Preferences DataStore
    implementation "androidx.datastore:datastore-preferences:1.0.0"
    
    // Proto DataStore
    implementation "androidx.datastore:datastore:1.0.0"
    
    // Protobuf 插件
    classpath "com.google.protobuf:protobuf-gradle-plugin:0.9.4"
    
    // Kotlin 扩展
    implementation "com.google.protobuf:protobuf-kotlin-lite:4.25.1"
}
```

### 1.4 配置 Protobuf 插件

```gradle
plugins {
    id("com.google.protobuf") version "0.9.4"
}

protobuf {
    generateProtoTasks {
        all().forEach { task ->
            task.builtins {
                create("kotlin") {
                    option("lite")
                }
            }
        }
    }
}
```

---

## 2. Preferences DataStore

### 2.1 基本使用

```kotlin
// 初始化 DataStore
class DataStoreManager(private val context: Context) {
    // 使用 Application Context 避免内存泄漏
    private val dataStore: DataStore<Preferences> = 
        context.dataStore
}
```

### 2.2 定义偏好键

```kotlin
// 创建偏好键（类型安全）
private val KEY_USERNAME = stringPreferences("username")
private val KEY_USER_ID = longPreferences("user_id")
private val KEY_IS_LOGGED_IN = booleanPreferences("is_logged_in")
private val KEY_THEME = stringPreferences("theme")
private val KEY_NOTIFICATIONS = booleanPreferences("notifications", default = true)
private val KEY_VOLUME = floatPreferences("volume", default = 0.5f)
private val KEY_TAGS = stringSetPreferences("tags", default = emptySet())

// 带默认值的偏好键
private val KEY_LAST_LOGIN = longPreferences("last_login", default = 0L)
```

### 2.3 写入数据

```kotlin
class DataStoreOperations(private val context: Context) {
    private val dataStore = context.dataStore
    
    // 写入字符串
    suspend fun saveUsername(username: String) {
        dataStore.edit { preferences ->
            preferences[KEY_USERNAME] = username
        }
    }
    
    // 写入多种类型
    suspend fun saveUserProfile(name: String, age: Int, email: String) {
        dataStore.edit { preferences ->
            preferences[stringPreferences("name")] = name
            preferences[intPreferences("age")] = age
            preferences[stringPreferences("email")] = email
        }
    }
    
    // 批量写入
    suspend fun saveSettings(settings: Map<String, Any>) {
        dataStore.edit { preferences ->
            settings.forEach { (key, value) ->
                when (value) {
                    is String -> preferences[stringPreferences(key)] = value
                    is Int -> preferences[intPreferences(key)] = value
                    is Boolean -> preferences[booleanPreferences(key)] = value
                    is Long -> preferences[longPreferences(key)] = value
                    is Float -> preferences[floatPreferences(key)] = value
                }
            }
        }
    }
}
```

### 2.4 读取数据

```kotlin
class DataStoreReader(private val context: Context) {
    private val dataStore = context.dataStore
    
    // 读取单个值（一次性的）
    suspend fun getUsername(): String {
        return dataStore.data.first()[KEY_USERNAME] ?: "Guest"
    }
    
    // 读取所有偏好
    suspend fun getAllPreferences(): Preferences {
        return dataStore.data.first()
    }
    
    // 读取多个值
    suspend fun getUserProfile(): UserProfile {
        val prefs = dataStore.data.first()
        return UserProfile(
            name = prefs[stringPreferences("name")] ?: "",
            age = prefs[intPreferences("age")] ?: 0,
            email = prefs[stringPreferences("email")] ?: ""
        )
    }
}
```

### 2.5 监听数据变化（Flow）

这是 DataStore 最强大的特性之一：

```kotlin
class DataStoreObserver(private val context: Context) {
    private val dataStore = context.dataStore
    
    // 监听单个键的变化
    fun observeUsername(): Flow<String> {
        return dataStore.data.map { preferences ->
            preferences[KEY_USERNAME] ?: "Guest"
        }
    }
    
    // 监听多个键的变化
    fun observeUserSettings(): Flow<UserSettings> {
        return dataStore.data.map { preferences ->
            UserSettings(
                theme = preferences[stringPreferences("theme")] ?: "light",
                isDarkMode = preferences[booleanPreferences("dark_mode")] ?: false,
                language = preferences[stringPreferences("language")] ?: "zh",
                notifications = preferences[booleanPreferences("notifications")] ?: true
            )
        }
    }
    
    // 在 ViewModel 中使用
    class SettingsViewModel(private val context: Context) : ViewModel() {
        private val dataStore = context.dataStore
        
        val usernameFlow: StateFlow<String> = dataStore
            .data
            .map { it[stringPreferences("username")] ?: "Guest" }
            .stateIn(
                viewModelScope,
                SharingStarted.Lazily,
                "Guest"
            )
        
        val themeFlow: StateFlow<String> = dataStore
            .data
            .map { it[stringPreferences("theme")] ?: "light" }
            .stateIn(
                viewModelScope,
                SharingStarted.Lazily,
                "light"
            )
        
        fun updateUsername(name: String) {
            viewModelScope.launch {
                dataStore.edit { prefs ->
                    prefs[stringPreferences("username")] = name
                }
            }
        }
    }
}
```

### 2.6 在 UI 层使用

```kotlin
class SettingsActivity : AppCompatActivity() {
    private val viewModel: SettingsViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 使用 LiveData 或 StateFlow
        viewModel.usernameFlow.observe(this) { username ->
            userNameText.text = username
        }
        
        viewModel.themeFlow.observe(this) { theme ->
            applyTheme(theme)
        }
    }
}

// Compose 版本
@Composable
fun SettingsScreen(viewModel: SettingsViewModel = hiltViewModel()) {
    val username by viewModel.usernameFlow.collectAsState()
    val theme by viewModel.themeFlow.collectAsState()
    
    Text(text = "Welcome, $username")
    Button(onClick = { viewModel.updateTheme("dark") }) {
        Text("Switch to Dark Mode")
    }
}
```

### 2.7 删除和清空

```kotlin
class DataStoreCleaner(private val context: Context) {
    private val dataStore = context.dataStore
    
    // 删除单个键
    suspend fun removeUsername() {
        dataStore.edit { preferences ->
            preferences.remove(KEY_USERNAME)
        }
    }
    
    // 删除多个键
    suspend fun removeMultiple(keys: List<PreferenceAny<*>>) {
        dataStore.edit { preferences ->
            keys.forEach { key ->
                preferences.remove(key)
            }
        }
    }
    
    // 清空所有数据
    suspend fun clearAll() {
        dataStore.edit { preferences ->
            preferences.clear()
        }
    }
    
    // 条件删除
    suspend fun removeExpiredData(expiryTime: Long) {
        dataStore.edit { preferences ->
            val lastActive = preferences[longPreferences("last_active")] ?: 0L
            if (System.currentTimeMillis() - lastActive > expiryTime) {
                preferences.clear()
            }
        }
    }
}
```

### 2.8 条件更新

```kotlin
class ConditionalUpdates(private val context: Context) {
    private val dataStore = context.dataStore
    
    // 原子递增
    suspend fun incrementCounter() {
        dataStore.edit { preferences ->
            val current = preferences[intPreferences("counter", 0)]
            preferences[intPreferences("counter")] = current + 1
        }
    }
    
    // 条件更新
    suspend fun updateIfConditionMet() {
        dataStore.edit { preferences ->
            val isLoggedIn = preferences[booleanPreferences("is_logged_in")] ?: false
            if (isLoggedIn) {
                preferences[longPreferences("last_activity")] = System.currentTimeMillis()
            }
        }
    }
    
    // 复杂条件更新
    suspend fun updateSettings(newSettings: UserSettings) {
        dataStore.edit { preferences ->
            val currentTheme = preferences[stringPreferences("theme")] ?: "light"
            
            // 只在主题改变时更新
            if (currentTheme != newSettings.theme) {
                preferences[stringPreferences("theme")] = newSettings.theme
            }
            
            // 更新其他设置
            preferences[booleanPreferences("notifications")] = newSettings.notifications
        }
    }
    
    // 回调式更新
    suspend fun updateWithCallback(current: Preferences): Preferences {
        return dataStore.updateData { prefs ->
            // 返回修改后的 Preferences
            prefs.toMutablePreferences().apply {
                this[stringPreferences("counter")] = 
                    (prefs[intPreferences("counter")] ?: 0) + 1
            }
        }
    }
}
```

---

## 3. Proto DataStore

### 3.1 Protobuf 文件定义

```protobuf
// 文件：app_prefs.proto
syntax = "proto3";

package com.example.app;

option java_package = "com.example.app.datastore";
option java_outer_classname = "AppPreferences";

// 用户偏好
message UserPreferences {
    string username = 1;
    int64 user_id = 2;
    bool is_logged_in = 3;
    string avatar_url = 4;
    repeated string interests = 5;
}

// 应用设置
message AppSettings {
    string theme = 1;
    string language = 2;
    bool notifications_enabled = 3;
    float volume = 4;
    int32 auto_save_interval = 5;
}

// 主要偏好消息
message AppPreferences {
    UserPreferences user = 1;
    AppSettings settings = 2;
    string app_version = 3;
    int64 last_login_timestamp = 4;
    map<string, string> custom_data = 5;
}

// 枚举类型示例
enum Theme {
    THEME_UNSPECIFIED = 0;
    THEME_LIGHT = 1;
    THEME_DARK = 2;
    THEME_SYSTEM = 3;
}

message ThemeSettings {
    Theme current_theme = 1;
    bool follow_system = 2;
}
```

### 3.2 编译和生成代码

在 `build.gradle` 中配置后，Protobuf 文件会编译生成 Kotlin 代码：

```
src/main/proto/app_prefs.proto
  ↓ 编译
build/generated/source/proto/main/kotlin/com/example/app/datastore/AppPreferencesOuterClass.kt
```

### 3.3 Proto DataStore 基本使用

```kotlin
class ProtoDataStoreManager(private val context: Context) {
    // 初始化 Proto DataStore
    private val dataStore: DataStore<ProtoBuf> = context
        .producesProtoDataStore("app_prefs.pb")
    
    // 或使用自定义名称
    private val dataStore = context
        .produceDataStore(
            fileName = "app_preferences.pb",
            producer = { ProtoBuf.getDefaultInstance() }
        )
    
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
                .setLastLoginTimestamp(System.currentTimeMillis())
                .build()
        }
    }
    
    // 读取数据（返回 Flow）
    fun observeUserPreferences(): Flow<UserPreferences> {
        return dataStore.data.map { proto ->
            proto.user
        }
    }
    
    // 读取应用设置
    fun observeSettings(): Flow<AppSettings> {
        return dataStore.data.map { proto ->
            proto.settings
        }
    }
    
    // 获取当前值
    suspend fun getCurrentUser(): UserPreferences {
        return dataStore.data.first().user
    }
}
```

### 3.4 更新特定字段

```kotlin
class ProtoDataStoreUpdates(private val context: Context) {
    private val dataStore = context.producesProtoDataStore("app_prefs.pb")
    
    // 更新用户名
    suspend fun updateUsername(username: String) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(
                    current.user.toBuilder()
                        .setUsername(username)
                        .build()
                )
                .build()
        }
    }
    
    // 更新主题
    suspend fun updateTheme(theme: String) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setSettings(
                    current.settings.toBuilder()
                        .setTheme(theme)
                        .build()
                )
                .build()
        }
    }
    
    // 添加兴趣标签
    suspend fun addInterest(interest: String) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(
                    current.user.toBuilder()
                        .addInterests(interest)
                        .build()
                )
                .build()
        }
    }
    
    // 删除兴趣标签
    suspend fun removeInterest(interest: String) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setUser(
                    current.user.toBuilder()
                        .removeInterests(current.user.interests.indexOf(interest))
                        .build()
                )
                .build()
        }
    }
    
    // 更新 Map 字段
    suspend fun updateCustomData(key: String, value: String) {
        dataStore.updateData { current ->
            current.toBuilder()
                .putCustomData(key, value)
                .build()
        }
    }
    
    // 批量更新
    suspend fun updateProfile(
        username: String? = null,
        avatarUrl: String? = null,
        isLoggedin: Boolean? = null
    ) {
        dataStore.updateData { current ->
            val userBuilder = current.user.toBuilder()
            
            username?.let { userBuilder.setUsername(it) }
            avatarUrl?.let { userBuilder.setAvatarUrl(it) }
            isLoggedin?.let { userBuilder.setLoggedIn(it) }
            
            current.toBuilder()
                .setUser(userBuilder.build())
                .build()
        }
    }
}
```

### 3.5 类型安全和编译时检查

```kotlin
// Protobuf 提供编译时类型安全
class TypeSafeExample(private val context: Context) {
    private val dataStore = context.producesProtoDataStore("app_prefs.pb")
    
    suspend fun demonstrateTypeSafety() {
        dataStore.updateData { current ->
            // 类型安全：错误会在编译时捕获
            current.toBuilder()
                .setUser(  // 必须是 UserPreferences 类型
                    UserPreferences.newBuilder()
                        .setUsername("John")  // String
                        .setUserId(123)       // Long
                        .setLoggedIn(true)    // Boolean
                        .build()
                )
                .build()
        }
    }
    
    // 使用枚举类型
    suspend fun setTheme(theme: Theme) {
        dataStore.updateData { current ->
            current.toBuilder()
                .setSettings(
                    current.settings.toBuilder()
                        .setTheme(theme)  // 枚举类型
                        .build()
                )
                .build()
        }
    }
}
```

### 3.6 默认值和验证

```protobuf
// 定义默认值
message UserPreferences {
    string username = 1;
    int32 age = 2 [default = 18];
    bool is_active = 3 [default = true];
    
    // 验证规则
    string email = 4;
    options (validate.rules).string = {
        pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    };
}
```

### 3.7 数据迁移

```kotlin
class ProtoDataStoreMigration(private val context: Context) {
    private val dataStore = context.producesProtoDataStore("app_prefs.pb")
    
    // 检查版本并迁移
    suspend fun migrateIfNeeded() {
        val currentVersion = dataStore.data.first().app_version
        
        if (currentVersion < CURRENT_APP_VERSION) {
            performMigration(currentVersion)
        }
    }
    
    private suspend fun performMigration(fromVersion: String) {
        when (fromVersion) {
            "1.0" -> {
                // 从 v1 迁移到 v2
                dataStore.updateData { current ->
                    current.toBuilder()
                        .setSettings(
                            current.settings.toBuilder()
                                .setAutoSaveInterval(30)  // 新增字段默认值
                                .build()
                        )
                        .setAppVersion("2.0")
                        .build()
                }
            }
            "2.0" -> {
                // 从 v2 迁移到 v3
                // ... 迁移逻辑
            }
        }
    }
}
```

---

## 4. DataStore vs SharedPreferences

### 4.1 功能对比

| 特性 | SharedPreferences | Preferences DataStore | Proto DataStore |
|-----|----------------|---|----|
| **API** | 同步阻塞 | 异步非阻塞 | 异步非阻塞 |
| **返回值** | 直接返回值 | suspend 函数 | suspend 函数 |
| **监听** | 回调接口 | Flow | Flow |
| **类型安全** | 弱类型 | 中 | 强类型 |
| **并发处理** | 手动处理 | 自动合并 | 自动合并 |
| **数据格式** | XML | 二进制 | Protobuf |
| **性能** | 数据量大时慢 | 较好 | 最好 |
| **可靠性** | 可能丢数据 | 原子写入 | 原子写入 |
| **学习成本** | 低 | 中 | 中高 |
| **迁移难度** | N/A | 容易 | 中等 |

### 4.2 代码对比

#### SharedPreferences 方式

```kotlin
// SharedPreferences 读取（阻塞）
val sp = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
val username = sp.getString("username", "Guest")
val isLoggedIn = sp.getBoolean("is_logged_in", false)

// SharedPreferences 写入（阻塞）
sp.edit()
    .putString("username", "John")
    .putBoolean("is_logged_in", true)
    .apply()

// SharedPreferences 监听
sp.registerOnSharedPreferenceChangeListener { prefs, key ->
    if (key == "username") {
        val newName = prefs?.getString("username", "Guest")
        // 更新 UI
    }
}
```

#### Preferences DataStore 方式

```kotlin
// DataStore 读取（异步）
suspend fun getUsername(): String {
    return dataStore.data.first()[stringPreferences("username")] ?: "Guest"
}

// DataStore 写入（异步）
suspend fun saveUsername(username: String) {
    dataStore.edit { prefs ->
        prefs[stringPreferences("username")] = username
    }
}

// DataStore 监听（Flow）
fun observeUsername(): Flow<String> {
    return dataStore.data.map { prefs ->
        prefs[stringPreferences("username")] ?: "Guest"
    }
}
```

### 4.3 性能对比

```kotlin
class PerformanceComparison(context: Context) {
    private val sp = context.getSharedPreferences("perf_test_sp", Context.MODE_PRIVATE)
    private val dataStore = context.dataStore
    
    // SharedPreferences 性能测试
    fun testSharedPreferencesPerformance() {
        val startTime = System.currentTimeMillis()
        
        val editor = sp.edit()
        for (i in 1..1000) {
            editor.putString("key_$i", "value_$i")
        }
        editor.commit()
        
        val writeTime = System.currentTimeMillis() - startTime
        Log.d("SP_Write", "${writeTime}ms for 1000 entries")
    }
    
    // DataStore 性能测试
    suspend fun testDataStorePerformance() {
        val startTime = System.currentTimeMillis()
        
        dataStore.edit { prefs ->
            for (i in 1..1000) {
                prefs[stringPreferences("key_$i")] = "value_$i"
            }
        }
        
        val writeTime = System.currentTimeMillis() - startTime
        Log.d("DS_Write", "${writeTime}ms for 1000 entries")
    }
    
    // 典型结果：
    // | 操作 | 数据量 | SharedPreferences | DataStore |
    // |------|--------|---------------|-------|
    // | 写入 | 100 | 5ms | 8ms |
    // | 写入 | 1000 | 45ms | 15ms |
    // | 写入 | 10000 | 450ms | 35ms |
    // | 读取 | 1000 | 25ms | 8ms |
}
```

### 4.4 可靠性对比

```kotlin
// SharedPreferences：可能丢失数据
fun spExample() {
    val editor = sp.edit()
    editor.putString("key1", "value1")
    // 如果此时应用崩溃，数据可能丢失
    editor.apply()
}

// DataStore：原子写入，不会丢失
suspend fun dataStoreExample() {
    dataStore.edit { prefs ->
        prefs[stringPreferences("key1")] = "value1"
        // 所有修改原子写入，要么全成功，要么全失败
    }
}
```

---

## 5. 高级用法

### 5.1 复杂数据结构

```kotlin
// Preferences DataStore 存储复杂对象
class ComplexDataStore(context: Context) {
    private val dataStore = context.dataStore
    private val gson = Gson()
    
    // 存储 List
    suspend fun saveTags(tags: List<String>) {
        val json = gson.toJson(tags)
        dataStore.edit { prefs ->
            prefs[stringPreferences("tags")] = json
        }
    }
    
    suspend fun getTags(): List<String> {
        val json = dataStore.data.first()[stringPreferences("tags")] ?: "[]"
        return gson.fromJson(json, ArrayList::class.java) as List<String>
    }
    
    // 存储复杂对象
    suspend fun saveUserPreferences(userPrefs: UserPreferences) {
        val json = gson.toJson(userPrefs)
        dataStore.edit { prefs ->
            prefs[stringPreferences("user_prefs")] = json
        }
    }
    
    suspend fun getUserPreferences(): UserPreferences? {
        val json = dataStore.data.first()[stringPreferences("user_prefs")]
        return json?.let { gson.fromJson(it, UserPreferences::class.java) }
    }
}
```

### 5.2 数据验证

```kotlin
class ValidatedDataStore(context: Context) {
    private val dataStore = context.dataStore
    
    suspend fun saveValidatedEmail(email: String) {
        if (!isValidEmail(email)) {
            throw IllegalArgumentException("Invalid email")
        }
        
        dataStore.edit { prefs ->
            prefs[stringPreferences("email")] = email
        }
    }
    
    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    suspend fun saveValidatedAge(age: Int) {
        if (age < 0 || age > 150) {
            throw IllegalArgumentException("Age must be between 0 and 150")
        }
        
        dataStore.edit { prefs ->
            prefs[intPreferences("age")] = age
        }
    }
}
```

### 5.3 加密存储

```kotlin
class EncryptedDataStore(context: Context) {
    private val dataStore = context.dataStore
    private val encryptedDataStore = context
        .encryptedDataStore("encrypted_prefs")
    
    // 加密偏好键
    private val KEY_PASSWORD = encryptedStringPreferences("password")
    private val KEY_TOKEN = encryptedStringPreferences("auth_token")
    
    suspend fun saveEncryptedPassword(password: String) {
        encryptedDataStore.edit { prefs ->
            prefs[KEY_PASSWORD] = password
        }
    }
    
    suspend fun getEncryptedPassword(): String? {
        return encryptedDataStore.data.first()[KEY_PASSWORD]
    }
}
```

### 5.4 多进程支持

```kotlin
class MultiProcessDataStore(context: Context) {
    // DataStore 原生支持多进程
    private val dataStore = context.dataStore
    
    // 所有进程共享同一个 DataStore
    // 自动处理并发写入
    suspend fun saveData(value: String) {
        dataStore.edit { prefs ->
            prefs[stringPreferences("shared_data")] = value
        }
    }
    
    // 监听数据变化（所有进程）
    fun observeData(): Flow<String> {
        return dataStore.data.map { prefs ->
            prefs[stringPreferences("shared_data")] ?: ""
        }
    }
}
```

### 5.5 缓存策略

```kotlin
class CachedDataStore(context: Context) {
    private val dataStore = context.dataStore
    private val cache = object : LruCache<String, Any>(100) {
        override fun sizeOf(key: String, value: Any): Int = 1
    }
    
    suspend fun getCachedString(key: String, default: String): String {
        // 1. 检查缓存
        var value = cache[key]
        
        // 2. 缓存未命中，从 DataStore 读取
        if (value == null) {
            value = dataStore.data.first()[stringPreferences(key)] ?: default
            cache[key] = value
        }
        
        return value as String
    }
    
    suspend fun putCachedString(key: String, value: String) {
        // 更新 DataStore
        dataStore.edit { prefs ->
            prefs[stringPreferences(key)] = value
        }
        
        // 更新缓存
        cache[key] = value
    }
}
```

---

## 6. 迁移与兼容

### 6.1 从 SharedPreferences 迁移

```kotlin
class SharedPreferencesMigration(context: Context) {
    private val oldPrefs = context.getSharedPreferences("old_prefs", Context.MODE_PRIVATE)
    private val dataStore = context.dataStore
    
    suspend fun migrate() {
        // 检查是否已迁移
        val migrated = dataStore.data.first()[booleanPreferences("migrated")] ?: false
        
        if (!migrated) {
            // 读取旧数据
            val username = oldPrefs.getString("username", "") ?: ""
            val userId = oldPrefs.getLong("user_id", 0L)
            val isLoggedIn = oldPrefs.getBoolean("is_logged_in", false)
            
            // 写入新数据
            dataStore.edit { prefs ->
                prefs[stringPreferences("username")] = username
                prefs[longPreferences("user_id")] = userId
                prefs[booleanPreferences("is_logged_in")] = isLoggedIn
                prefs[booleanPreferences("migrated")] = true
            }
            
            // 可选：清理旧数据
            oldPrefs.edit().clear().apply()
        }
    }
    
    // 自动迁移（在 Application 启动时）
    class App : Application() {
        override fun onCreate() {
            super.onCreate()
            
            viewModelScope.launch {
                try {
                    SharedPreferencesMigration(this@App).migrate()
                } catch (e: Exception) {
                    Log.e("Migration", "Failed", e)
                }
            }
        }
    }
}
```

### 6.2 双写策略（兼容性）

```kotlin
class DualWriteStorage(context: Context) {
    private val sp = context.getSharedPreferences("old_prefs", Context.MODE_PRIVATE)
    private val dataStore = context.dataStore
    
    // 同时写入两个存储
    suspend fun saveWithDualWrite(username: String) {
        // 写入 DataStore（新）
        dataStore.edit { prefs ->
            prefs[stringPreferences("username")] = username
        }
        
        // 写入 SharedPreferences（旧）
        sp.edit().putString("username", username).apply()
    }
    
    // 优先从 DataStore 读取，失败则从 SharedPreferences 读取
    suspend fun getWithFallback(): String {
        val fromDataStore = dataStore.data.first()[stringPreferences("username")]
        return fromDataStore ?: sp.getString("username", "Guest") ?: "Guest"
    }
}
```

### 6.3 回滚策略

```kotlin
class RollbackStrategy(context: Context) {
    private val dataStore = context.dataStore
    private val backupSp = context.getSharedPreferences("backup", Context.MODE_PRIVATE)
    
    suspend fun saveWithBackup(key: String, value: String) {
        // 保存备份
        val currentValue = dataStore.data.first()[stringPreferences(key)]
        backupSp.edit().putString("backup_$key", currentValue).apply()
        
        // 写入新值
        dataStore.edit { prefs ->
            prefs[stringPreferences(key)] = value
        }
    }
    
    suspend fun rollback(key: String) {
        val backupValue = backupSp.getString("backup_$key")
        if (backupValue != null) {
            dataStore.edit { prefs ->
                prefs[stringPreferences(key)] = backupValue
            }
        }
    }
}
```

---

## 7. 最佳实践

### 7.1 架构设计

```kotlin
// Repository 层封装
class SettingsRepository(private val context: Context) {
    private val dataStore = context.dataStore
    
    // 定义偏好键
    private object Keys {
        val USERNAME = stringPreferences("username")
        val THEME = stringPreferences("theme", "light")
        val LANGUAGE = stringPreferences("language", "zh")
    }
    
    // 公开方法
    fun observeUsername(): Flow<String> {
        return dataStore.data.map { prefs ->
            prefs[Keys.USERNAME] ?: "Guest"
        }
    }
    
    suspend fun saveUsername(username: String) {
        dataStore.edit { prefs ->
            prefs[Keys.USERNAME] = username
        }
    }
}

// ViewModel 层
class SettingsViewModel(application: Application) : ViewModel() {
    private val repository = SettingsRepository(application)
    
    val username: StateFlow<String> = repository
        .observeUsername()
        .stateIn(
            viewModelScope,
            SharingStarted.Lazily,
            "Guest"
        )
    
    fun updateUsername(newUsername: String) {
        viewModelScope.launch {
            repository.saveUsername(newUsername)
        }
    }
}

// UI 层（Compose）
@Composable
fun SettingsScreen(viewModel: SettingsViewModel = hiltViewModel()) {
    val username by viewModel.username.collectAsState()
    
    var inputName by remember { mutableStateOf(username) }
    
    TextField(
        value = inputName,
        onValueChange = { inputName = it },
        label = { Text("Username") }
    )
    
    Button(onClick = { viewModel.updateUsername(inputName) }) {
        Text("Save")
    }
}
```

### 7.2 错误处理

```kotlin
class SafeDataStore(context: Context) {
    private val dataStore = context.dataStore
    
    suspend fun safeSave(username: String): Result<Unit> {
        return try {
            dataStore.edit { prefs ->
                prefs[stringPreferences("username")] = username
            }
            Result.success(Unit)
        } catch (e: IOException) {
            Log.e("DataStore", "Save failed", e)
            Result.failure(e)
        }
    }
    
    suspend fun safeLoad(username: String): String {
        return try {
            dataStore.data.first()[stringPreferences("username")] ?: username
        } catch (e: Exception) {
            Log.e("DataStore", "Load failed", e)
            username
        }
    }
}
```

### 7.3 性能优化

```kotlin
class OptimizedDataStore(context: Context) {
    private val dataStore = context.dataStore
    
    // 1. 批量写入
    suspend fun saveBatch(settings: Settings) {
        dataStore.edit { prefs ->
            prefs[stringPreferences("theme")] = settings.theme
            prefs[booleanPreferences("notifications")] = settings.notifications
            prefs[floatPreferences("volume")] = settings.volume
            // 一次性写入所有数据
        }
    }
    
    // 2. 避免频繁读取
    private val _currentData = MutableStateFlow<Preferences>(Preferences.emptyPreferences())
    val currentData: StateFlow<Preferences> = _currentData.asStateFlow()
    
    init {
        viewModelScope.launch {
            dataStore.data.collect { prefs ->
                _currentData.value = prefs
            }
        }
    }
    
    // 3. 使用 StateFlow 缓存
    fun observeCached(key: Preference<String>): StateFlow<String> {
        return currentData.map { prefs ->
            prefs[key] ?: ""
        }.stateIn(
            viewModelScope,
            SharingStarted.Lazily,
            ""
        )
    }
}
```

### 7.4 测试策略

```kotlin
class DataStoreTest {
    private lateinit var dataStore: DataStore<Preferences>
    private val testContext = ContextWrapper(FileContext("test"))
    
    @Before
    fun setup() {
        dataStore = testContext.dataStore
    }
    
    @Test
    fun testSaveAndLoad() = runBlocking {
        // Save
        dataStore.edit { prefs ->
            prefs[stringPreferences("key")] = "value"
        }
        
        // Load
        val result = dataStore.data.first()[stringPreferences("key")]
        assertEquals("value", result)
    }
    
    @Test
    fun testObserve() = runBlocking {
        val job = launch {
            dataStore.data.collect { prefs ->
                // 处理数据变化
            }
        }
        
        dataStore.edit { prefs ->
            prefs[stringPreferences("key")] = "value"
        }
        
        job.join()
    }
}
```

---

## 8. 面试考点

### 考点 1：DataStore 的核心特性

**问题：** DataStore 相比 SharedPreferences 有哪些核心优势？

**答案：**
1. **异步 API**：不阻塞主线程
2. **类型安全**：特别是 Proto DataStore
3. **自动并发合并**：避免数据竞争
4. **Flow 监听**：响应式编程
5. **原子写入**：数据可靠性更高

### 考点 2：Preferences vs Proto DataStore

**问题：** 什么时候使用 Preferences DataStore，什么时候使用 Proto DataStore？

**答案：**
- **Preferences DataStore**：简单场景、从 SharedPreferences 迁移
- **Proto DataStore**：复杂数据、类型安全需求、新项目

### 考点 3：DataStore 的写入机制

**问题：** DataStore 如何保证数据一致性？

**答案：**
- 使用 `edit {}` 或 `updateData {}` 进行原子写入
- 多个写入自动合并
- 失败时回滚

### 考点 4：Flow 监听

**问题：** 如何监听 DataStore 的数据变化？

**答案：**
```kotlin
dataStore.data.map { prefs ->
    prefs[stringPreferences("key")] ?: "default"
}.collect { value ->
    // 处理数据变化
}
```

### 考点 5：迁移方案

**问题：** 如何将 SharedPreferences 迁移到 DataStore？

**答案：**
1. 检查迁移标志位
2. 读取旧数据
3. 写入新数据
4. 标记已迁移
5. 清理旧数据

### 考点 6：并发处理

**问题：** 多个线程同时写入 DataStore 会发生什么？

**答案：**
- DataStore 自动处理并发
- 写入操作会合并
- 不会丢失数据

### 考点 7：性能对比

**问题：** DataStore 和 SharedPreferences 的性能差异？

**答案：**
- 小数据量：差异不大
- 大数据量：DataStore 明显更优
- 写入性能：DataStore 优化更好

### 考点 8：数据格式

**问题：** DataStore 使用什么格式存储数据？

**答案：**
- **Preferences DataStore**：二进制格式
- **Proto DataStore**：Protobuf 格式

### 考点 9：默认值处理

**问题：** DataStore 如何处理默认值？

**答案：**
```kotlin
// Preferences DataStore
val key = stringPreferences("key", default = "default_value")

// Proto DataStore
// 在 .proto 文件中定义默认值
```

### 考点 10：加密支持

**问题：** DataStore 如何加密敏感数据？

**答案：**
- 使用 `EncryptedDataStore`
- 结合 Android Keystore
- 敏感数据单独加密

### 附加考点

**Q11：** DataStore 支持哪些数据类型？

**A11：** String, Int, Long, Float, Boolean, StringSet（Preferences）；Protobuf 类型（Proto）

**Q12：** 如何清空 DataStore 所有数据？

**A12：**
```kotlin
dataStore.edit { prefs ->
    prefs.clear()
}
```

**Q13：** DataStore 的文件存储位置？

**A13：** `/data/data/<package_name>/datastore/`

**Q14：** Proto DataStore 的编译过程？

**A14：** 使用 Protobuf Gradle 插件编译 .proto 文件生成 Kotlin 代码

**Q15：** DataStore 的异常处理？

**A15：** 使用 try-catch 捕获 IOException 等异常

---

## 总结

DataStore 是 Android 现代数据存储的最佳选择：

✅ 异步非阻塞  
✅ 类型安全  
✅ Flow 监听  
✅ 并发安全  
✅ 性能优秀  

**使用建议：**
- 新项目：直接使用 Proto DataStore
- 旧项目迁移：先使用 Preferences DataStore
- 敏感数据：使用 EncryptedDataStore

**学习路径：**
SharedPreferences → Preferences DataStore → Proto DataStore

---

*本文档涵盖 DataStore 的核心知识点，建议配合实际项目练习以加深理解。*