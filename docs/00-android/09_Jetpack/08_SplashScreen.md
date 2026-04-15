# SplashScreen API 详解

> 📚 Android 面试指南 - Jetpack 组件系列
>
> 📝 字数：约 10000 字 | ⏱ 建议阅读时间：40 分钟

---

## 目录

1. [SplashScreen API 介绍](#1-splashscreen-api-介绍)
2. [替换自定义 Splash Activity](#2-替换自定义-splash-activity)
3. [主题配置](#3-主题配置)
4. [延迟显示](#4-延迟显示)
5. [图标动画](#5-图标动画)
6. [深色模式支持](#6-深色模式支持)
7. [性能优化](#7-性能优化)
8. [最佳实践](#8-最佳实践)
9. [常见问题](#9-常见问题)
10. [面试考点](#10-面试考点)

---

## 1. SplashScreen API 介绍

### 1.1 什么是 SplashScreen API？

**SplashScreen API** 是 Android 12（API 级别 32）引入的新功能，用于提供一致的品牌化启动体验。

在 Android 12 之前，开发者需要自己实现启动页：

```kotlin
// ❌ Android 12 之前的方式
class SplashActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        
        // 显示自定义 Logo
        // 处理动画
        // 延迟跳转到主页面
        
        // 问题：
        // 1. 系统启动动画和自定义启动页之间有闪屏
        // 2. 不同应用体验不一致
        // 3. 需要处理各种边界情况
    }
}
```

Android 12 引入了系统级别的启动页，但会导致闪屏问题：

```
┌─────────────┬──────────────┬──────────────┐
│ 系统启动页  │  自定义启动页  │  主页面       │
│ (强制显示)   │  (Activity 加载) │  (内容)      │
└─────────────┴──────────────┴──────────────┘
        ↓              ↓              ↓
    系统主题        可能不同主题      最终主题
   (可能闪屏)       (可能闪屏)
```

**SplashScreen API** 解决了这些问题：

```kotlin
// ✅ Android 12+ 使用 SplashScreen API
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 应用主题中包含 SplashScreen 配置
        // 系统启动页会自动延续到应用加载完成
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| 品牌一致性 | 系统启动页和应用启动页使用相同品牌元素 |
| 无缝过渡 | 消除启动过程中的闪屏 |
| 深色模式支持 | 自动适配系统主题 |
| 延迟控制 | 控制启动页显示时长 |
| 图标动画 | 支持 Logo 动画效果 |
| 向后兼容 | 通过库支持 Android 5.0+ |

### 1.3 添加依赖

```kotlin
// build.gradle (Module)
dependencies {
    // SplashScreen 库（向后兼容）
    implementation("androidx.core:core-splashscreen:1.0.1")
}
```

### 1.4 工作原理

```
┌──────────────────────────────────────────────┐
│              应用启动流程                     │
└──────────────────────────────────────────────┘

Android 12+:
┌─────────┬──────────┬──────────┬──────────┐
│ 系统启动│ SplashScreen│ SplashScreen│ 主页面  │
│  动画   │  延续     │  淡出     │  显示   │
└─────────┴──────────┴──────────┴──────────┘
    无闪屏（使用相同的品牌元素）

Android 11 及之前:
┌──────────┬──────────┐
│SplashScreen│ 主页面   │
│ (库实现)  │ 显示     │
└──────────┴──────────┘
```

---

## 2. 替换自定义 Splash Activity

### 2.1 传统方式的问题

```kotlin
// ❌ 传统 Splash Activity
class SplashActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivitySplashBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 延迟跳转到主页面
        Handler(Looper.getMainLooper()).postDelayed({
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }, 2000)
    }
    
    // 问题：
    // 1. 额外的 Activity 启动开销
    // 2. 系统启动页和自定义页之间的闪屏
    // 3. 需要处理后台恢复等边界情况
}
```

### 2.2 使用 SplashScreen API 替换

#### 步骤 1：修改主题

```xml
<!-- res/values/themes.xml -->
<resources>
    <!-- Base application theme -->
    <style name="Theme.MyApp" parent="Theme.MaterialComponents.DayNight">
        <!-- SplashScreen 配置 -->
        <item name="windowSplashScreenBackground">@color/splash_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_logo</item>
        <item name="postSplashScreenTheme">@style/Theme.MyApp</item>
    </style>
    
    <!-- 应用启动时的主题 -->
    <style name="Theme.MyApp.Starting" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_logo</item>
        <item name="postSplashScreenTheme">@style/Theme.MyApp</item>
    </style>
</resources>
```

#### 步骤 2：在 AndroidManifest.xml 中配置

```xml
<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <application
        android:name=".MyApplication"
        android:theme="@style/Theme.MyApp.Starting">
        
        <!-- 不再需要 SplashActivity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MyApp.Starting">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
    </application>
</manifest>
```

#### 步骤 3：移除自定义 SplashActivity

```kotlin
// ✅ 删除自定义 SplashActivity
// 直接使用 MainActivity 作为入口

class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // SplashScreen 会自动显示，直到应用内容准备就绪
        super.onCreate(savedInstanceState)
        
        // 可以在这里执行初始化，SplashScreen 会保持显示
        performInitialization()
        
        setContentView(R.layout.activity_main)
    }
    
    private fun performInitialization() {
        // 加载用户配置
        // 检查登录状态
        // 准备初始数据
    }
}
```

### 2.3 迁移检查清单

```kotlin
/**
 * 从自定义 SplashActivity 迁移到 SplashScreen API 的检查清单
 */

// ✅ 1. 添加依赖
// implementation("androidx.core:core-splashscreen:1.0.1")

// ✅ 2. 创建启动主题
// 包含 windowSplashScreen 属性

// ✅ 3. 配置 AndroidManifest
// 设置应用或 Activity 的 theme

// ✅ 4. 移除 SplashActivity
// 从代码中删除

// ✅ 5. 更新 Manifest
// 移除 SplashActivity 的声明

// ✅ 6. 处理初始化逻辑
// 将 SplashActivity 中的逻辑移到合适的位置

// ✅ 7. 测试
// 冷启动、热启动、配置变化等场景
```

---

## 3. 主题配置

### 3.1 基本主题属性

```xml
<!-- res/values/themes.xml -->
<resources>
    
    <!-- SplashScreen 启动主题 -->
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        
        <!-- 背景颜色 -->
        <item name="windowSplashScreenBackground">@color/primary_brand</item>
        
        <!-- 图标（Android 12+ 支持动画） -->
        <item name="windowSplashScreenAnimatedIcon">@drawable/app_logo</item>
        
        <!-- 图标背景（圆形） -->
        <item name="windowSplashScreenIconBackgroundColor">@color/icon_background</item>
        
        <!-- SplashScreen 消失后应用的主题 -->
        <item name="postSplashScreenTheme">@style/Theme.App</item>
        
    </style>
    
    <!-- 应用主主题 -->
    <style name="Theme.App" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary_brand</item>
        <item name="colorPrimaryVariant">@color/primary_dark</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorSecondary">@color/secondary_brand</item>
        <!-- 其他主题属性 -->
    </style>
    
</resources>
```

### 3.2 深色模式主题

```xml
<!-- res/values/themes.xml (浅色模式) -->
<resources>
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/white</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_dark</item>
        <item name="windowSplashScreenIconBackgroundColor">@color/transparent</item>
        <item name="postSplashScreenTheme">@style/Theme.App.Light</item>
    </style>
</resources>

<!-- res/values-night/themes.xml (深色模式) -->
<resources>
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/black</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_light</item>
        <item name="windowSplashScreenIconBackgroundColor">@color/transparent</item>
        <item name="postSplashScreenTheme">@style/Theme.App.Dark</item>
    </style>
</resources>
```

### 3.3 多主题支持

```xml
<!-- res/values/themes.xml -->
<resources>
    
    <!-- 默认主题 -->
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_blue</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_blue</item>
        <item name="postSplashScreenTheme">@style/Theme.App.Blue</item>
    </style>
    
    <!-- 节日主题 -->
    <style name="Theme.App.Starting.Christmas" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/christmas_red</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_christmas</item>
        <item name="postSplashScreenTheme">@style/Theme.App.Christmas</item>
    </style>
    
    <!-- 活动主题 -->
    <style name="Theme.App.Starting.Sale" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/sale_yellow</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_sale</item>
        <item name="postSplashScreenTheme">@style/Theme.App.Sale</item>
    </style>
    
</resources>
```

### 3.4 Kotlin 代码中选择主题

```kotlin
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 根据条件选择主题
        val isChristmas = isChristmasSeason()
        val isSalePeriod = isSalePeriod()
        
        // 注意：主题通常在 Manifest 中静态配置
        // 动态切换需要在 Activity 级别处理
    }
}

// 在 Activity 中动态应用主题
class MainActivity : AppCompatActivity() {
    
    override fun attachBaseContext(newBase: Context) {
        // 在 onCreate 之前执行
        val theme = when {
            isChristmasSeason() -> R.style.Theme_App_Starting_Christmas
            isSalePeriod() -> R.style.Theme_App_Starting_Sale
            else -> R.style.Theme_App_Starting
        }
        val context = ContextThemeWrapper(newBase, theme)
        super.attachBaseContext(context)
    }
    
    private fun isChristmasSeason(): Boolean {
        val calendar = Calendar.getInstance()
        return calendar.month == Calendar.DECEMBER && calendar.dayOfMonth in 20..31
    }
}
```

---

## 4. 延迟显示

### 4.1 基本延迟控制

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 方式 1：使用 addCallback（推荐）
        addSplashScreen().setKeepOnScreenCondition {
            // 返回 true 保持显示，false 则消失
            !isAppReady()
        }
        
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
    
    private var isReady = false
    
    private fun isAppReady(): Boolean {
        return isReady
    }
    
    // 初始化完成后标记为就绪
    private fun initializeApp() {
        viewModelScope.launch {
            // 加载必要的数据
            loadUserConfig()
            loadInitialData()
            
            // 标记完成
            isReady = true
            
            // SplashScreen 会自动消失
        }
    }
}
```

### 4.2 使用 SetKeepOnScreenCondition

```kotlin
class MainActivity : AppCompatActivity() {
    
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        addSplashScreen().setKeepOnScreenCondition {
            // 基于 ViewModel 状态决定
            viewModel.appState.value == AppState.Loading
        }
        
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 观察状态变化
        lifecycleScope.launch {
            viewModel.appState.collect { state ->
                when (state) {
                    is AppState.Ready -> {
                        // 应用准备完成，SplashScreen 会消失
                    }
                    is AppState.Error -> {
                        // 处理错误
                    }
                }
            }
        }
    }
}

// ViewModel
class MainViewModel : ViewModel() {
    
    sealed class AppState {
        object Loading : AppState()
        data class Ready(val data: Data) : AppState()
        data class Error(val message: String) : AppState()
    }
    
    private val _appState = MutableStateFlow<AppState>(AppState.Loading)
    val appState: StateFlow<AppState> = _appState.asStateFlow()
    
    init {
        initialize()
    }
    
    private fun initialize() {
        viewModelScope.launch {
            try {
                val data = repository.loadInitialData()
                _appState.value = AppState.Ready(data)
            } catch (e: Exception) {
                _appState.value = AppState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

### 4.3 最小显示时间

```kotlin
class MainActivity : AppCompatActivity() {
    
    private var splashStartTime = 0L
    private val MIN_SPLASH_DURATION = 1500L // 至少显示 1.5 秒
    
    override fun onCreate(savedInstanceState: Bundle?) {
        splashStartTime = System.currentTimeMillis()
        
        addSplashScreen().setKeepOnScreenCondition {
            val elapsed = System.currentTimeMillis() - splashStartTime
            val isAppReady = isAppReady()
            
            // 确保至少显示 MIN_SPLASH_DURATION 毫秒
            !isAppReady || elapsed < MIN_SPLASH_DURATION
        }
        
        super.onCreate(savedInstanceState)
    }
    
    private fun isAppReady(): Boolean {
        // 检查应用是否准备就绪
        return true
    }
}
```

### 4.4 异步加载处理

```kotlin
class MainActivity : AppCompatActivity() {
    
    private var isInitialized = false
    private val initJob = Job()
    private val initScope = CoroutineScope(Dispatchers.IO + initJob)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        addSplashScreen().setKeepOnScreenCondition {
            !isInitialized
        }
        
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 启动初始化
        initScope.launch {
            performAsyncInitialization()
            isInitialized = true
        }
    }
    
    private suspend fun performAsyncInitialization() {
        withContext(Dispatchers.IO) {
            // 模拟耗时操作
            delay(2000)
            loadUserPreferences()
            checkAuthentication()
            loadRemoteConfig()
        }
    }
    
    override fun onDestroy() {
        initJob.cancel()
        super.onDestroy()
    }
}
```

---

## 5. 图标动画

### 5.1 静态图标

```xml
<!-- res/values/themes.xml -->
<style name="Theme.App.Starting" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/primary</item>
    <!-- 静态图标 -->
    <item name="windowSplashScreenAnimatedIcon">@drawable/logo_static</item>
    <item name="postSplashScreenTheme">@style/Theme.App</item>
</style>
```

### 5.2 矢量动画图标（Android 12+）

```xml
<!-- res/drawable/logo_animation.xml -->
<objectAnimator xmlns:android="http://schemas.android.com/apk/res/android"
    android:duration="1500">
    
    <propertyValuesHolder
        android:propertyName="scaleX"
        android:valueType="floatType"
        android:valueFrom="0.0"
        android:valueTo="1.0" />
    
    <propertyValuesHolder
        android:propertyName="scaleY"
        android:valueType="floatType"
        android:valueFrom="0.0"
        android:valueTo="1.0" />
    
    <propertyValuesHolder
        android:propertyName="alpha"
        android:valueType="floatType"
        android:valueFrom="0.0"
        android:valueTo="1.0" />
    
</objectAnimator>
```

### 5.3 Lottie 动画

```kotlin
// 1. 添加 Lottie 依赖
// implementation("com.airbnb.android:lottie:6.1.0")

// 2. 准备 Lottie 动画文件
// res/raw/logo_animation.json

// 3. 在主题中配置（需要使用自定义实现）
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 对于复杂的动画，可能需要自定义 View
        // SplashScreen API 目前主要支持矢量动画
    }
}
```

### 5.4 创建动画图标

```xml
<!-- res/drawable/splash_logo_animated.xml -->
<!-- 使用 animator 创建简单的缩放和淡入效果 -->
<animated-vector 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:drawable="@drawable/splash_logo_base">
    
    <target android:name="logo_group">
        <aapt:attr name="android:animation">
            <set>
                <objectAnimator
                    android:propertyName="translateX"
                    android:duration="500"
                    android:valueFrom="-100"
                    android:valueTo="0"
                    android:valueType="floatType"
                    android:interpolator="@android:anim/decelerate_interpolator" />
                
                <objectAnimator
                    android:propertyName="scaleX"
                    android:duration="500"
                    android:valueFrom="0.5"
                    android:valueTo="1.0"
                    android:valueType="floatType"
                    android:interpolator="@android:anim/decelerate_interpolator" />
                
                <objectAnimator
                    android:propertyName="scaleY"
                    android:duration="500"
                    android:valueFrom="0.5"
                    android:valueTo="1.0"
                    android:valueType="floatType"
                    android:interpolator="@android:anim/decelerate_interpolator" />
            </set>
        </aapt:attr>
    </target>
    
</animated-vector>
```

---

## 6. 深色模式支持

### 6.1 自动深色模式适配

```xml
<!-- res/values/themes.xml -->
<resources>
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_bg_light</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_for_light</item>
        <item name="windowSplashScreenIconBackgroundColor">?attr/colorPrimary</item>
        <item name="postSplashScreenTheme">@style/Theme.App</item>
    </style>
</resources>

<!-- res/values-night/themes.xml -->
<resources>
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_bg_dark</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/logo_for_dark</item>
        <item name="windowSplashScreenIconBackgroundColor">?attr/colorPrimaryDark</item>
        <item name="postSplashScreenTheme">@style/Theme.App</item>
    </style>
</resources>
```

### 6.2 颜色资源定义

```xml
<!-- res/values/colors.xml -->
<resources>
    <color name="splash_bg_light">#FFFFFF</color>
    <color name="splash_bg_dark">#121212</color>
    <color name="icon_background_light">#F5F5F5</color>
    <color name="icon_background_dark">#1E1E1E</color>
</resources>
```

### 6.3 动态深色模式检测

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 检测系统深色模式设置
        val isDarkMode = resources.configuration.uiMode and 
            Configuration.UI_MODE_NIGHT_MASK == Configuration.UI_MODE_NIGHT_YES
        
        // 可以根据深色模式调整 SplashScreen 行为
        if (isDarkMode) {
            // 深色模式特定逻辑
        }
        
        super.onCreate(savedInstanceState)
    }
}
```

---

## 7. 性能优化

### 7.1 减少启动时间

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. 延迟非关键初始化
        addSplashScreen().setKeepOnScreenCondition {
            !isCriticalInitComplete()
        }
        
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 2. 非关键操作延迟执行
        lifecycleScope.launch {
            delay(500) // 延迟执行
            performNonCriticalInit()
        }
    }
    
    private var criticalComplete = false
    
    private fun isCriticalInitComplete(): Boolean {
        return criticalComplete
    }
    
    // 只执行关键初始化
    private fun criticalInit() {
        // 必要的初始化
        criticalComplete = true
    }
    
    // 非关键操作
    private fun performNonCriticalInit() {
        // 广告 SDK 初始化
        // 分析数据上传
        // 预加载非关键资源
    }
}
```

### 7.2 预加载优化

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        addSplashScreen().setKeepOnScreenCondition {
            !isPreloadComplete()
        }
        
        super.onCreate(savedInstanceState)
        
        // 预加载关键资源
        preloadCriticalResources()
    }
    
    private var preloadComplete = false
    
    private fun isPreloadComplete(): Boolean = preloadComplete
    
    private fun preloadCriticalResources() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                // 预加载图片
                imagePlaceholder = loadPlaceholder()
                
                // 预加载配置
                appConfig = loadConfig()
                
                // 预加载数据库
                database = initDatabase()
                
                preloadComplete = true
            }
        }
    }
}
```

### 7.3 启动时间监控

```kotlin
class StartupMonitor {
    
    companion object {
        private var startupStartTime: Long = 0
        
        fun onStart() {
            startupStartTime = System.currentTimeMillis()
        }
        
        fun onComplete(tag: String) {
            val elapsed = System.currentTimeMillis() - startupStartTime
            Log.d("Startup", "$tag: ${elapsed}ms")
        }
    }
}

class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        StartupMonitor.onStart()
        
        addSplashScreen().setKeepOnScreenCondition {
            !isAppReady()
        }
        
        super.onCreate(savedInstanceState)
        
        StartupMonitor.onComplete("SplashScreen")
        
        setContentView(R.layout.activity_main)
        
        StartupMonitor.onComplete("ContentReady")
    }
}
```

---

## 8. 最佳实践

### 8.1 推荐配置

```xml
<!-- res/values/themes.xml -->
<resources>
    <!-- 启动主题最佳实践 -->
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <!-- 1. 使用品牌色作为背景 -->
        <item name="windowSplashScreenBackground">@color/brand_primary</item>
        
        <!-- 2. 使用优化过的矢量图标 -->
        <item name="windowSplashScreenAnimatedIcon">@drawable/brand_logo</item>
        
        <!-- 3. 设置图标背景（可选） -->
        <item name="windowSplashScreenIconBackgroundColor">@color/brand_accent</item>
        
        <!-- 4. 指定主主题 -->
        <item name="postSplashScreenTheme">@style/Theme.App</item>
    </style>
    
    <!-- 主主题 -->
    <style name="Theme.App" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/brand_primary</item>
        <item name="colorPrimaryVariant">@color/brand_primary_dark</item>
        <item name="colorOnPrimary">@color/white</item>
    </style>
</resources>
```

### 8.2 图标设计建议

```kotlin
/**
 * SplashScreen 图标设计最佳实践：
 * 
 * 1. 使用矢量图形（XML 或 Lottie）
 * 2. 保持图标简洁，易于识别
 * 3. 确保在圆形裁剪中良好显示
 * 4. 考虑深浅色模式的对比度
 * 5. 动画时长控制在 1-2 秒
 * 6. 文件大小尽量小
 */
```

### 8.3 测试要点

```kotlin
/**
 * 测试清单：
 * 
 * ✅ 冷启动（应用完全关闭后启动）
 * ✅ 热启动（应用在前台）
 * ✅ 温启动（应用在后台）
 * ✅ 配置变化（屏幕旋转）
 * ✅ 深浅色模式切换
 * ✅ 不同 Android 版本
 * ✅ 不同屏幕尺寸
 * ✅ 快速返回（Back 后立即启动）
 */
```

---

## 9. 常见问题

### 9.1 闪屏问题

**问题**：SplashScreen 和应用主题之间有闪屏。

```kotlin
// ❌ 错误：背景色不一致
<style name="Theme.App.Starting" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/white</item>  <!-- 白色 -->
    <item name="postSplashScreenTheme">@style/Theme.App</item>
</style>

<style name="Theme.App" parent="Theme.MaterialComponents">
    <item name="colorPrimary">@color/blue</item>  <!-- 蓝色 -->
</style>

// ✅ 解决：确保颜色一致
<style name="Theme.App.Starting" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/brand_primary</item>
    <item name="postSplashScreenTheme">@style/Theme.App</item>
</style>
```

### 9.2 图标不显示

**问题**：在旧设备上图标不显示。

```kotlin
// 检查：
// 1. 是否添加了 core-splashscreen 依赖
// 2. 图标是否是正确的格式
// 3. 是否在主题中正确配置
```

---

## 10. 面试考点

### 10.1 基础考点

#### Q1: SplashScreen API 是什么？

**参考答案**：

> SplashScreen API 是 Android 12 引入的启动页 API，提供一致的品牌化启动体验，消除系统启动页和应用内容之间的闪屏。

#### Q2: 如何配置 SplashScreen？

**参考答案**：

```xml
<style name="Theme.App.Starting" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/background</item>
    <item name="windowSplashScreenAnimatedIcon">@drawable/logo</item>
    <item name="postSplashScreenTheme">@style/Theme.App</item>
</style>
```

### 10.2 进阶考点

#### Q3: 如何控制 SplashScreen 的显示时间？

**参考答案**：

```kotlin
addSplashScreen().setKeepOnScreenCondition {
    !isAppReady()
}
```

### 10.3 高级考点

#### Q4: SplashScreen API 的兼容性如何保证？

**参考答案**：

> 使用 `androidx.core:core-splashscreen` 库可以支持 Android 5.0+ 的设备。

---

## 总结

SplashScreen API 是现代 Android 应用的重要特性：

1. **消除闪屏**：系统启动页和应用启动页无缝衔接
2. **品牌一致性**：统一的品牌体验
3. **易于实现**：简单的主题配置
4. **向后兼容**：支持 Android 5.0+
5. **性能优化**：减少启动时间

---

*📚 参考资料*
- [Android Developers - SplashScreen](https://developer.android.com/guide/topics/ui/splash-screen)

> 最后更新：2024 年
> 字数统计：约 10000 字