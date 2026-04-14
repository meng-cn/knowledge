# AppCompatDelegate 深度解析

> **字数统计：约 10000 字**  
> **难度等级：⭐⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐⭐**

---

## 目录

1. [AppCompatDelegate 概述](#1-appcompatdelegate-概述)
2. [主题管理系统](#2-主题管理系统)
3. [日间/夜间模式原理](#3-日间夜间模式原理)
4. [手动切换主题](#4-手动切换主题)
5. [followSystem 模式详解](#5-followsystem-模式详解)
6. [源码深度分析](#6-源码深度分析)
7. [最佳实践与陷阱](#7-最佳实践与陷阱)
8. [面试考点大全](#8-面试考点大全)
9. [参考资料](#9-参考资料)

---

## 1. AppCompatDelegate 概述

### 1.1 什么是 AppCompatDelegate？

**AppCompatDelegate** 是 AndroidX AppCompat 库中的核心类，它是 AppCompatActivity 的功能实现者，负责处理以下关键任务：

```kotlin
// AppCompatDelegate 的类结构
public abstract class AppCompatDelegate {
    
    // 核心职责：
    // 1. 主题和应用样式的管理
    // 2. ActionBar 的创建和生命周期管理
    // 3. 深色/浅色模式的检测和控制
    // 4. 夜间模式的自动检测和手动设置
    
    // 继承关系
    public abstract class AppCompatDelegateImpl extends AppCompatDelegate
    public class VectorEnabledTintResourcesWrapper
    
    // 静态工具方法
    public static AppCompatDelegate create(...)
    public static void installViewFactory()
    public static void installMenuFactory()
}
```

### 1.2 AppCompatDelegate 的设计模式

AppCompatDelegate 使用了多种设计模式，理解这些模式对于深入理解其工作原理至关重要：

```kotlin
// 1. 单例模式 - 全局配置
public abstract class AppCompatDelegate {
    private static final AppCompatDelegateImpl DEFAULTDelegate;
    
    static {
        DEFAULTDelegate = create(null, null);
    }
    
    public static AppCompatDelegate getDefaultDelegate() {
        return DEFAULTDelegate;
    }
}

// 2. 工厂模式 - 创建不同实现
public static AppCompatDelegate create(
    Context context, 
    WindowCallback callback,
    Bundle icicle) {
    
    if (context == null) {
        return new AppCompatDelegateImplV14();
    } else if (Build.VERSION.SDK_INT >= 21) {
        return new AppCompatDelegateImplV21();
    } else {
        return new AppCompatDelegateImplV14();
    }
}

// 3. 策略模式 - 夜间模式策略
public interface NightModeManager {
    int getDefaultNightMode();
    void setDefaultNightMode(int mode);
}

// 4. 委托模式 - Activity 委托给 Delegate
public class AppCompatActivity {
    private AppCompatDelegate mDelegate;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        mDelegate.installViewFactory();
        mDelegate.installMenuFactory();
        super.onCreate(savedInstanceState);
        mDelegate.onCreate(savedInstanceState);
    }
}
```

### 1.3 AppCompatDelegate 在生命周期中的调用

理解 AppCompatDelegate 在 Activity 生命周期中的调用时序至关重要：

```kotlin
// Activity 生命周期中 AppCompatDelegate 的调用
class AppCompatActivity : ComponentActivity() {
    
    private lateinit var mDelegate: AppCompatDelegateImpl
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. 初始化 Delegate
        mDelegate = AppCompatDelegateImpl.createActivityDelegate(this)
        
        // 2. 安装 View 工厂（在 super.onCreate() 之前）
        mDelegate.installViewFactory()
        
        // 3. 安装 Menu 工厂（在 super.onCreate() 之前）
        mDelegate.installMenuFactory()
        
        // 4. 调用父类 onCreate
        super.onCreate(savedInstanceState)
        
        // 5. Delegate 处理 onCreate
        mDelegate.onCreate(savedInstanceState)
    }
    
    override fun onResume() {
        super.onResume()
        mDelegate.onResume()
    }
    
    override fun onStart() {
        super.onStart()
        mDelegate.onStart()
    }
    
    override fun onStop() {
        super.onStop()
        mDelegate.onStop()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        mDelegate.onDestroy()
    }
    
    override fun onBackPressed() {
        mDelegate.onBackPressed()
    }
}
```

### 1.4 AppCompatDelegate 版本演进

不同 API 级别使用不同的 Delegate 实现：

```kotlin
// API 7-13: AppCompatDelegateImplV7
// 提供最基础的 ActionBar 支持
class AppCompatDelegateImplV7 : AppCompatDelegateImpl() {
    override fun installViewFactory() {
        // 简单的 View 工厂安装
        ActivityViewGroupCompat.setActivity(this)
    }
}

// API 14-20: AppCompatDelegateImplV14
// 添加更多兼容性支持
class AppCompatDelegateImplV14 : AppCompatDelegateImplV7() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // 添加夜间模式支持
        super.onCreate(savedInstanceState)
        initializeNightMode()
    }
}

// API 21+: AppCompatDelegateImplV21
// 使用原生 Material Design 特性
class AppCompatDelegateImplV21 : AppCompatDelegateImplV14() {
    override fun applyDayNight() {
        // 使用原生 API 设置主题
        if (Build.VERSION.SDK_INT >= 26) {
            setWindowFlag(Window.FEATURE_OVERRIDES, true)
        }
    }
}
```

---

## 2. 主题管理系统

### 2.1 主题的底层机制

Android 主题是一个包含多个属性（Attribute）的样式（Style），理解属性解析过程对主题管理至关重要：

```xml
<!-- 主题定义 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <!-- 颜色属性 -->
    <item name="colorPrimary">@color/primary</item>
    <item name="colorPrimaryDark">@color/primary_dark</item>
    <item name="colorAccent">@color/accent</item>
    
    <!-- 组件样式属性 -->
    <item name="buttonStyle">@style/AppButton</item>
    <item name="toolbarStyle">@style/AppToolbar</item>
    
    <!-- 窗口属性 -->
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>
</style>

<!-- 属性引用示例 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:background="?attr/colorPrimary"  <!-- 引用主题属性 -->
    android:textColor="?android:attr/textColorPrimary" />  <!-- 引用框架属性 -->
```

### 2.2 主题属性查找顺序

当控件引用主题属性时，系统会按照以下顺序查找：

```kotlin
// 主题属性查找流程图
private TypedValue resolveAttribute(int resid, Resources.Theme theme) {
    // 1. 当前控件的样式（style 属性）
    style -> 
        // 2. 当前 Activity 的主题（android:theme）
        activityTheme -> 
            // 3. 应用的默认主题（android:theme）
            applicationTheme -> 
                // 4. 系统默认主题
                systemTheme
}

// 实际查找示例
@NonNull
@Override
public TypedValue resolveAttribute(@AttrRes int resId, TypedValue outValue, boolean resolveRefs) {
    // 1. 首先查找当前样式
    TypedValue value = mTheme.resolveAttribute(resId, outValue, resolveRefs);
    
    // 2. 如果未找到，递归查找父主题
    if (value == null) {
        value = resolveFromParentTheme(resId, outValue, resolveRefs);
    }
    
    return value;
}
```

### 2.3 属性作用域

理解不同属性的作用域对于主题管理至关重要：

```xml
<!-- 框架属性 (android:attr) -->
<!-- 这些是 Android 系统提供的标准属性 -->
<TextView
    android:textColor="@android:color/primary_text_dark"
    android:textSize="@android:dimen/app_icon_size" />

<!-- 主题属性 (attr) -->
<!-- 这些是 AppCompat 和 Material 提供的属性 -->
<TextView
    android:textColor="?attr/colorPrimary"
    android:background="?attr/selectableItemBackground" />

<!-- 颜色资源 -->
<!-- 这些是静态颜色定义 -->
<TextView
    android:textColor="@color/primary"
    android:background="@drawable/button_bg" />
```

### 2.4 主题覆盖与继承

```xml
<!-- 基础主题 -->
<style name="Base.AppTheme" parent="Theme.MaterialComponents.DayNight">
    <item name="colorPrimary">@color/primary</item>
    <item name="colorSecondary">@color/secondary</item>
</style>

<!-- 带 ActionBar 的主题 -->
<style name="AppTheme.DarkActionBar" parent="Base.AppTheme">
    <item name="windowActionBar">true</item>
    <item name="windowNoTitle">false</item>
</style>

<!-- 不带 ActionBar 的主题 -->
<style name="AppTheme.NoActionBar" parent="Base.AppTheme">
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>
    <item name="android:windowContentTransitions">true</item>
</style>

<!-- 透明主题 -->
<style name="AppTheme.Transparent" parent="Base.AppTheme">
    <item name="android:windowIsTranslucent">true</item>
    <item name="android:background">@android:color/transparent</item>
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:colorBackgroundCacheHint">@null</item>
</style>
```

### 2.5 动态主题应用

```kotlin
// 在运行时动态应用主题
class ThemeManager {
    
    companion object {
        const val PREF_THEME = "theme_preference"
        const val THEME_LIGHT = "light"
        const val THEME_DARK = "dark"
        const val THEME_SYSTEM = "system"
    }
    
    fun applyTheme(context: Context, themeName: String) {
        val themeRes = when (themeName) {
            THEME_LIGHT -> R.style.AppTheme_Light
            THEME_DARK -> R.style.AppTheme_Dark
            THEME_SYSTEM -> R.style.AppTheme_System
            else -> R.style.AppTheme_Light
        }
        
        // 保存主题选择
        saveThemePreference(context, themeName)
        
        // 重启应用以应用新主题
        restartApplication(context)
    }
    
    fun getThemeForContext(context: Context): String {
        val prefs = context.getSharedPreferences(PREF_THEME, Context.MODE_PRIVATE)
        return prefs.getString(PREF_THEME, THEME_SYSTEM) ?: THEME_SYSTEM
    }
    
    private fun saveThemePreference(context: Context, themeName: String) {
        context.getSharedPreferences(PREF_THEME, Context.MODE_PRIVATE)
            .edit()
            .putString(PREF_THEME, themeName)
            .apply()
    }
    
    private fun restartApplication(context: Context) {
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        (context.applicationContext as? Application)?.exitApplication()
    }
}
```

### 2.6 使用 ThemeOverlay 进行局部主题覆盖

```xml
<!-- 定义 ThemeOverlay -->
<style name="ThemeOverlay.App.Button" parent="">
    <item name="colorPrimary">@color/white</item>
    <item name="colorOnPrimary">@color/primary</item>
    <item name="backgroundTint">@color/secondary</item>
</style>

<!-- 应用到特定视图 -->
<Button
    style="@style/Widget.MaterialComponents.Button"
    android:text="Themed Button"
    app:theme="@style/ThemeOverlay.App.Button" />

<!-- 或者在代码中应用 -->
<TextView
    android:id="@+id/specialText"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val textView = findViewById<TextView>(R.id.specialText)
        textView.apply {
            // 应用 ThemeOverlay
            context.theme.applyStyle(R.style.ThemeOverlay.App.Button, true)
        }
    }
}
```

### 2.7 主题属性动态查询

```kotlin
// 动态获取主题属性值
class ThemeUtils {
    
    companion object {
        fun getColor(context: Context, attrRes: Int): Int {
            val typedValue = TypedValue()
            context.theme.resolveAttribute(attrRes, typedValue, true)
            return typedValue.data
        }
        
        fun getDimension(context: Context, attrRes: Int): Float {
            val typedValue = TypedValue()
            context.theme.resolveAttribute(attrRes, typedValue, true)
            return TypedValue.complexToDimension(
                typedValue.data,
                context.resources.displayMetrics
            )
        }
        
        fun getDrawable(context: Context, attrRes: Int): Drawable? {
            val typedValue = TypedValue()
            context.theme.resolveAttribute(attrRes, typedValue, true)
            return ContextCompat.getDrawable(context, typedValue.resourceId)
        }
    }
}

// 使用示例
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 获取主题颜色
        val primaryColor = ThemeUtils.getColor(this, R.attr.colorPrimary)
        val accentColor = ThemeUtils.getColor(this, R.attr.colorAccent)
        
        // 获取主题维度
        val actionBarHeight = ThemeUtils.getDimension(this, R.attr.actionBarSize)
        
        // 获取主题 drawable
        val rippleDrawable = ThemeUtils.getDrawable(this, R.attr/selectableItemBackground)
    }
}
```

---

## 3. 日间/夜间模式原理

### 3.1 夜间模式的检测机制

AppCompatDelegate 通过多种方式检测是否应该启用夜间模式：

```kotlin
// AppCompatDelegate 中的夜间模式检测
class AppCompatDelegateImplV19 extends AppCompatDelegateImplV14 {
    
    private int getNightMode(): int {
        // 1. 检查是否设置了默认夜间模式
        int defaultNightMode = mNightModeManager.getDefaultNightMode();
        
        if (defaultNightMode == MODE_NIGHT_NO) {
            return MODE_NIGHT_NO;
        } else if (defaultNightMode == MODE_NIGHT_YES) {
            return MODE_NIGHT_YES;
        }
        
        // 2. 跟随系统设置
        if (defaultNightMode == MODE_NIGHT_FOLLOW_SYSTEM) {
            return getNightModeFromSystem();
        }
        
        // 3. 自动检测（基于时间）
        if (defaultNightMode == MODE_NIGHT_AUTO_BATTERY) {
            return getNightModeFromBatteryOpt();
        }
        
        // 4. 默认跟随系统
        return getNightModeFromSystem();
    }
    
    private int getNightModeFromSystem(): int {
        Configuration config = getResources().getConfiguration();
        int uiMode = config.uiMode;
        
        if ((uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES) {
            return MODE_NIGHT_YES;
        } else {
            return MODE_NIGHT_NO;
        }
    }
    
    private int getNightModeFromBatteryOpt(): int {
        // 根据电池优化模式决定
        boolean isBatterySaverOn = isBatterySaverOn();
        return isBatterySaverOn ? MODE_NIGHT_YES : getNightModeFromSystem();
    }
}
```

### 3.2 夜间模式的常量定义

```kotlin
// AppCompatDelegate 中的夜间模式常量
public class AppCompatDelegate {
    public static final int MODE_NIGHT_NO = 0;              // 始终禁用夜间模式
    public static final int MODE_NIGHT_YES = 1;             // 始终启用夜间模式
    public static final int MODE_NIGHT_AUTO_BATTERY = 2;    // 根据电池优化模式自动切换
    public static final int MODE_NIGHT_FOLLOW_SYSTEM = 3;   // 跟随系统设置
    public static final int MODE_NIGHT_UNSPECIFIED = -1;    // 未指定（默认跟随系统）
    
    // 使用示例
    companion object {
        fun setNightMode() {
            // 始终禁用夜间模式
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            
            // 始终启用夜间模式
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            
            // 根据电池优化自动切换
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_AUTO_BATTERY)
            
            // 跟随系统设置（推荐）
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        }
    }
}
```

### 3.3 配置变更处理

当夜间模式发生变化时，系统会触发配置变更，需要正确处理：

```xml
<!-- AndroidManifest.xml -->
<activity
    android:name=".MyActivity"
    android:configChanges="uiMode|orientation|screenSize">
</activity>
```

```kotlin
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 应用保存的夜间模式设置
        applySavedNightMode()
    }
    
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        
        // 检查夜间模式是否变化
        val nightModeChanged = (newConfig.uiMode and Configuration.UI_MODE_NIGHT_MASK) !=
            (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK)
            
        if (nightModeChanged) {
            // 处理夜间模式变化
            updateUIForNightMode()
        }
    }
    
    private fun applySavedNightMode() {
        val prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE)
        val nightMode = prefs.getString(PREF_NIGHT_MODE, "system")
        
        val mode = when (nightMode) {
            "light" -> AppCompatDelegate.MODE_NIGHT_NO
            "dark" -> AppCompatDelegate.MODE_NIGHT_YES
            else -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        
        AppCompatDelegate.setDefaultNightMode(mode)
    }
    
    private fun updateUIForNightMode() {
        // 更新 UI 组件
        // 重新加载图片资源
        // 更新颜色等
    }
}
```

### 3.4 夜间模式资源限定符

使用资源限定符为夜间模式提供专用资源：

```
res/
├── values/
│   ├── colors.xml          # 浅色模式颜色
│   ├── themes.xml          # 浅色模式主题
│   └── strings.xml
├── values-night/
│   ├── colors.xml          # 深色模式颜色
│   ├── themes.xml          # 深色模式主题
│   └── strings.xml
├── drawable/
│   ├── bg_card.xml         # 浅色背景
│   └── ic_launcher.xml
├── drawable-night/
│   ├── bg_card.xml         # 深色背景
│   └── ic_launcher.xml
├── layout/
│   └── activity_main.xml
└── layout-night/
    └── activity_main.xml    # 可选：深色模式专属布局
```

```xml
<!-- res/values/colors.xml (浅色模式) -->
<resources>
    <color name="background">#FFFFFF</color>
    <color name="surface">#FFFFFF</color>
    <color name="on_background">#000000</color>
    <color name="on_surface">#000000</color>
    <color name="primary">#1976D2</color>
    <color name="on_primary">#FFFFFF</color>
</resources>

<!-- res/values-night/colors.xml (深色模式) -->
<resources>
    <color name="background">#121212</color>
    <color name="surface">#1E1E1E</color>
    <color name="on_background">#FFFFFF</color>
    <color name="on_surface">#FFFFFF</color>
    <color name="primary">#90CAF9</color>
    <color name="on_primary">#000000</color>
</resources>
```

### 3.5 使用 Night Mode 的 Preview

在 Android Studio 中预览夜间模式：

```kotlin
@Preview(name = "Light Mode", group = "Day Night")
@Preview(name = "Dark Mode", group = "Day Night", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Composable
fun GreetingPreview() {
    MyAppTheme {
        Greeting("Android")
    }
}

@Preview(
    name = "Light Mode",
    uiMode = Configuration.UI_MODE_NIGHT_NO,
    showBackground = true,
    showSystemUi = true
)
@Preview(
    name = "Dark Mode",
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    showBackground = true,
    showSystemUi = true
)
@Composable
fun MyLayoutPreview() {
    MyLayout()
}
```

### 3.6 夜间模式的自动切换监听

```kotlin
class NightModeObserver(private val context: Context) {
    
    private var nightModeCallback: ((Boolean) -> Unit)? = null
    
    fun setOnNightModeChangedListener(callback: (Boolean) -> Unit) {
        nightModeCallback = callback
    }
    
    fun startObserving() {
        // 使用 RegisterReceiver 监听配置变化
        val filter = IntentFilter(Configuration.CONFIGURATION_CHANGED)
        context.registerReceiver(broadcastReceiver, filter)
    }
    
    fun stopObserving() {
        try {
            context.unregisterReceiver(broadcastReceiver)
        } catch (e: IllegalArgumentException) {
            // Receiver not registered
        }
    }
    
    private val broadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == Configuration.CONFIGURATION_CHANGED) {
                val currentNightMode = isNightModeEnabled()
                nightModeCallback?.invoke(currentNightMode)
            }
        }
    }
    
    private fun isNightModeEnabled(): Boolean {
        val uiMode = context.resources.configuration.uiMode
        return (uiMode and Configuration.UI_MODE_NIGHT_YES) == Configuration.UI_MODE_NIGHT_YES
    }
}

// 使用示例
class MyActivity : AppCompatActivity() {
    
    private lateinit var nightModeObserver: NightModeObserver
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        nightModeObserver = NightModeObserver(this)
        nightModeObserver.setOnNightModeChangedListener { isDarkMode ->
            // 更新 UI
            updateTheme(isDarkMode)
        }
        nightModeObserver.startObserving()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        nightModeObserver.stopObserving()
    }
}
```

---

## 4. 手动切换主题

### 4.1 基础的手动切换实现

```kotlin
class ThemeSwitcher(private val context: Context) {
    
    companion object {
        private const val PREF_NAME = "theme_prefs"
        private const val KEY_THEME = "theme_mode"
    }
    
    enum class ThemeMode {
        LIGHT, DARK, SYSTEM
    }
    
    private val prefs: SharedPreferences = 
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    
    fun getCurrentThemeMode(): ThemeMode {
        val modeString = prefs.getString(KEY_THEME, ThemeMode.SYSTEM.name)
        return ThemeMode.valueOf(modeString ?: ThemeMode.SYSTEM.name)
    }
    
    fun setThemeMode(mode: ThemeMode) {
        prefs.edit().putString(KEY_THEME, mode.name).apply()
        applyTheme()
    }
    
    fun toggleTheme() {
        val currentMode = getCurrentThemeMode()
        val newMode = when (currentMode) {
            ThemeMode.LIGHT -> ThemeMode.DARK
            ThemeMode.DARK -> ThemeMode.LIGHT
            ThemeMode.SYSTEM -> ThemeMode.LIGHT
        }
        setThemeMode(newMode)
    }
    
    private fun applyTheme() {
        // 重新创建活动以应用新主题
        recreateActivity()
    }
    
    private fun recreateActivity() {
        val activity = context as? Activity
        activity?.recreate()
    }
}
```

### 4.2 在 Settings 界面中切换主题

```kotlin
class SettingsFragment : Fragment() {
    
    private lateinit var themeSwitcher: ThemeSwitcher
    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        themeSwitcher = ThemeSwitcher(requireContext())
        setupThemeSelector()
    }
    
    private fun setupThemeSelector() {
        val currentMode = themeSwitcher.getCurrentThemeMode()
        
        // 设置单选按钮组
        binding.themeRadioGroup.checkedRadioButtonId = when (currentMode) {
            ThemeSwitcher.ThemeMode.LIGHT -> R.id.radioLight
            ThemeSwitcher.ThemeMode.DARK -> R.id.radioDark
            ThemeSwitcher.ThemeMode.SYSTEM -> R.id.radioSystem
        }
        
        binding.themeRadioGroup.setOnCheckedChangeListener { _, checkedId ->
            val newMode = when (checkedId) {
                R.id.radioLight -> ThemeSwitcher.ThemeMode.LIGHT
                R.id.radioDark -> ThemeSwitcher.ThemeMode.DARK
                R.id.radioSystem -> ThemeSwitcher.ThemeMode.SYSTEM
                else -> ThemeSwitcher.ThemeMode.SYSTEM
            }
            themeSwitcher.setThemeMode(newMode)
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### 4.3 应用级别的统一主题管理

```kotlin
class AppThemeManager {
    
    companion object {
        @Volatile
        private var instance: AppThemeManager? = null
        
        fun getInstance(context: Context): AppThemeManager {
            return instance ?: synchronized(this) {
                instance ?: AppThemeManager(context.applicationContext).also {
                    instance = it
                }
            }
        }
    }
    
    private val context: Context
    private val prefs: SharedPreferences
    
    enum class Theme {
        LIGHT, DARK, FOLLOW_SYSTEM
    }
    
    init {
        this.context = context
        this.prefs = context.getSharedPreferences(
            context.getString(R.string.app_name),
            Context.MODE_PRIVATE
        )
    }
    
    fun getTheme(): Theme {
        val themeString = prefs.getString(KEY_THEME, Theme.FOLLOW_SYSTEM.name)
        return Theme.valueOf(themeString ?: Theme.FOLLOW_SYSTEM.name)
    }
    
    fun setTheme(theme: Theme) {
        prefs.edit().putString(KEY_THEME, theme.name).apply()
        updateNightMode(theme)
    }
    
    fun toggleTheme() {
        val currentTheme = getTheme()
        val newTheme = when (currentTheme) {
            Theme.LIGHT -> Theme.DARK
            Theme.DARK -> Theme.LIGHT
            Theme.FOLLOW_SYSTEM -> Theme.LIGHT
        }
        setTheme(newTheme)
    }
    
    private fun updateNightMode(theme: Theme) {
        val nightMode = when (theme) {
            Theme.LIGHT -> AppCompatDelegate.MODE_NIGHT_NO
            Theme.DARK -> AppCompatDelegate.MODE_NIGHT_YES
            Theme.FOLLOW_SYSTEM -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        AppCompatDelegate.setDefaultNightMode(nightMode)
    }
    
    private companion object {
        const val KEY_THEME = "theme_mode"
    }
}

// 在 Application 中初始化
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 初始化主题管理器
        val themeManager = AppThemeManager.getInstance(this)
        val currentTheme = themeManager.getTheme()
        updateNightModeForApp(currentTheme)
    }
    
    private fun updateNightModeForApp(theme: AppThemeManager.Theme) {
        val nightMode = when (theme) {
            AppThemeManager.Theme.LIGHT -> AppCompatDelegate.MODE_NIGHT_NO
            AppThemeManager.Theme.DARK -> AppCompatDelegate.MODE_NIGHT_YES
            AppThemeManager.Theme.FOLLOW_SYSTEM -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        AppCompatDelegate.setDefaultNightMode(nightMode)
    }
}
```

### 4.4 在 BaseActivity 中统一处理主题

```kotlin
abstract class BaseActivity : AppCompatActivity() {
    
    protected val themeManager: AppThemeManager by lazy {
        AppThemeManager.getInstance(applicationContext)
    }
    
    override fun attachBaseContext(newBase: Context) {
        // 在 attachBaseContext 中应用主题（必须在 super.attachBaseContext 之前）
        val theme = themeManager.getTheme()
        val context = applyTheme(newBase, theme)
        super.attachBaseContext(context)
    }
    
    private fun applyTheme(context: Context, theme: AppThemeManager.Theme): Context {
        val themeResId = when (theme) {
            AppThemeManager.Theme.LIGHT -> R.style.AppTheme_Light
            AppThemeManager.Theme.DARK -> R.style.AppTheme_Dark
            AppThemeManager.Theme.FOLLOW_SYSTEM -> R.style.AppTheme_System
        }
        
        val themeObj = createTheme()
        themeObj.applyStyle(themeResId, true)
        
        return ContextThemeWrapper(context, themeResId)
    }
    
    // 或者使用 AppCompatDelegate 的方式
    override fun onCreate(savedInstanceState: Bundle?) {
        // 在 super.onCreate() 之前设置夜间模式
        val theme = themeManager.getTheme()
        val nightMode = when (theme) {
            AppThemeManager.Theme.LIGHT -> AppCompatDelegate.MODE_NIGHT_NO
            AppThemeManager.Theme.DARK -> AppCompatDelegate.MODE_NIGHT_YES
            AppThemeManager.Theme.FOLLOW_SYSTEM -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        AppCompatDelegate.setDefaultNightMode(nightMode)
        
        super.onCreate(savedInstanceState)
    }
}
```

### 4.5 平滑主题切换动画

```kotlin
class SmoothThemeSwitcher(private val activity: Activity) {
    
    fun switchTheme(newTheme: AppThemeManager.Theme) {
        // 1. 保存当前状态
        val currentState = saveState()
        
        // 2. 播放过渡动画
        activity.window.setStatusBarColor(Color.TRANSPARENT)
        activity.window.navigationBarColor = Color.TRANSPARENT
        
        // 3. 淡出动画
        val fadeOut = AlphaAnimation(1f, 0f).apply {
            duration = 200
            fillAfter = true
        }
        activity.window.decorView.startAnimation(fadeOut)
        
        // 4. 切换主题
        themeManager.setTheme(newTheme)
        
        // 5. 淡入动画
        activity.window.decorView.postDelayed({
            val fadeIn = AlphaAnimation(0f, 1f).apply {
                duration = 200
                fillAfter = true
            }
            activity.window.decorView.startAnimation(fadeIn)
            
            // 6. 恢复状态栏颜色
            fadeIn.setAnimationListener(object : Animation.AnimationListener {
                override fun onAnimationStart(animation: Animation?) {}
                override fun onAnimationEnd(animation: Animation?) {
                    activity.window.setStatusBarColor(getStatusBarColor())
                    activity.window.navigationBarColor = getNavigationBarColor()
                }
                override fun onAnimationRepeat(animation: Animation?) {}
            })
            
            // 7. 重建 Activity
            activity.recreate()
        }, 200)
    }
    
    private fun saveState(): Bundle {
        return Bundle().apply {
            // 保存需要保留的状态
            putString("currentTab", getCurrentTab())
            putInt("scrollPosition", getScrollPosition())
        }
    }
    
    private fun restoreState(bundle: Bundle) {
        // 恢复状态
    }
}
```

### 4.6 主题切换的最佳实践

```kotlin
// 最佳实践 1：在 Application 中统一设置
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 在最早的生命周期设置主题
        val theme = ThemePrefs.getTheme(this)
        AppCompatDelegate.setDefaultNightMode(getNightModeFromTheme(theme))
    }
}

// 最佳实践 2：使用 DayNight 主题父类
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <!-- 自动根据夜间模式切换 -->
</style>

// 最佳实践 3：提供主题预览
class ThemePreviewFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 显示当前主题预览
        showThemePreview()
        
        // 允许用户预览不同主题
        binding.themeLightPreview.setOnClickListener {
            previewTheme(Theme.LIGHT)
        }
        
        binding.themeDarkPreview.setOnClickListener {
            previewTheme(Theme.DARK)
        }
    }
    
    private fun previewTheme(theme: Theme) {
        // 临时应用主题进行预览
        val dialog = ThemePreviewDialog(this, theme)
        dialog.show()
    }
}

// 最佳实践 4：记住用户的选择
class ThemePrefs {
    
    companion object {
        private const val PREF_NAME = "app_prefs"
        private const val KEY_THEME = "theme_mode"
    }
    
    fun saveTheme(context: Context, theme: AppThemeManager.Theme) {
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_THEME, theme.name)
            .apply()
    }
    
    fun getTheme(context: Context): AppThemeManager.Theme {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val themeString = prefs.getString(KEY_THEME, AppThemeManager.Theme.FOLLOW_SYSTEM.name)
        return AppThemeManager.Theme.valueOf(themeString)
    }
}
```

---

## 5. followSystem 模式详解

### 5.1 followSystem 模式的工作原理

```kotlin
// followSystem 模式的实现原理
class AppCompatDelegateImplV19 : AppCompatDelegateImplV14() {
    
    override fun applyDayNight(): Boolean {
        val nightMode = getDefaultNightMode()
        
        return when (nightMode) {
            MODE_NIGHT_NO -> false
            MODE_NIGHT_YES -> true
            MODE_NIGHT_FOLLOW_SYSTEM -> {
                // 跟随系统设置
                getNightModeFromSystem()
            }
            MODE_NIGHT_AUTO_BATTERY -> {
                // 根据电池优化模式决定
                getNightModeFromBatteryOpt()
            }
            else -> false
        }
    }
    
    private fun getNightModeFromSystem(): Boolean {
        // 检查系统 UI 模式
        val config = resources.configuration
        val uiMode = config.uiMode
        
        // UI_MODE_NIGHT_MASK 提取夜间模式位
        return (uiMode and Configuration.UI_MODE_NIGHT_MASK) == 
            Configuration.UI_MODE_NIGHT_YES
    }
}
```

### 5.2 系统夜间模式的检测

```kotlin
// 多种方式检测系统夜间模式
class SystemNightModeDetector {
    
    fun isNightMode(context: Context): Boolean {
        // 方法 1: 通过 Configuration 检测
        return isNightModeViaConfiguration(context)
    }
    
    private fun isNightModeViaConfiguration(context: Context): Boolean {
        val config = context.resources.configuration
        val uiMode = config.uiMode
        return (uiMode and Configuration.UI_MODE_NIGHT_YES) == Configuration.UI_MODE_NIGHT_YES
    }
    
    // API 29+ 可以使用更精确的方法
    private fun isNightModeViaUiModeManager(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val uiModeManager = context.getSystemService(UI_MODE_SERVICE) as UiModeManager
            return uiModeManager.nightMode == UiModeManager.MODE_NIGHT_YES
        }
        return isNightModeViaConfiguration(context)
    }
    
    // 监听系统夜间模式变化
    fun observeNightModeChanges(context: Context, callback: (Boolean) -> Unit) {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.action == Configuration.CONFIGURATION_CHANGED) {
                    val isNight = isNightMode(context)
                    callback(isNight)
                }
            }
        }
        
        val filter = IntentFilter(Configuration.CONFIGURATION_CHANGED)
        context.registerReceiver(receiver, filter)
    }
}
```

### 5.3 处理 followSystem 模式的边界情况

```kotlin
class FollowSystemThemeManager {
    
    // 边界情况 1: 系统快速切换主题
    private var isUpdatingTheme = false
    
    fun handleThemeChange(context: Context) {
        if (isUpdatingTheme) return // 防止重复更新
        
        isUpdatingTheme = true
        try {
            val isSystemNightMode = SystemNightModeDetector().isNightMode(context)
            applyTheme(context, isSystemNightMode)
        } finally {
            isUpdatingTheme = false
        }
    }
    
    // 边界情况 2: 24 小时制和 12 小时制的自动切换
    fun handleAutomaticTimeBasedSwitch() {
        // 有些系统会根据时间自动切换夜间模式
        // 我们需要确保我们的应用正确响应这种变化
    }
    
    // 边界情况 3: 多显示器设置
    fun handleMultipleDisplaySettings() {
        // 某些设备可能有多个显示器，每个显示器可能有不同的主题设置
    }
    
    // 边界情况 4: 省电模式影响
    fun handleBatterySaverMode(context: Context) {
        val powerManager = context.getSystemService(POWER_SERVICE) as PowerManager
        if (powerManager.isPowerSaveMode) {
            // 省电模式下，系统可能强制使用深色模式
            // 我们需要决定是跟随系统还是保持用户设置
        }
    }
}
```

### 5.4 followSystem 与用户设置的冲突处理

```kotlin
class ThemeConflictResolver {
    
    enum class ThemePriority {
        USER_OVERRIDE,  // 用户明确设置（最高优先级）
        FOLLOW_SYSTEM,  // 跟随系统
        DEFAULT_LIGHT   // 默认浅色
    }
    
    private var userThemeOverride: AppThemeManager.Theme? = null
    
    fun resolveTheme(context: Context): AppThemeManager.Theme {
        // 1. 检查用户是否有明确的主题设置
        val savedTheme = ThemePrefs.getTheme(context)
        
        if (savedTheme != AppThemeManager.Theme.FOLLOW_SYSTEM) {
            return savedTheme  // 用户明确设置，优先使用
        }
        
        // 2. 跟随系统设置
        val isSystemNight = SystemNightModeDetector().isNightMode(context)
        return if (isSystemNight) {
            AppThemeManager.Theme.DARK
        } else {
            AppThemeManager.Theme.LIGHT
        }
    }
    
    fun setUserThemeOverride(theme: AppThemeManager.Theme) {
        userThemeOverride = theme
        ThemePrefs.saveTheme(context, theme)
    }
    
    fun clearUserThemeOverride() {
        userThemeOverride = null
        ThemePrefs.saveTheme(context, AppThemeManager.Theme.FOLLOW_SYSTEM)
    }
}
```

### 5.5 在 followSystem 模式下提供用户覆盖

```kotlin
class ThemeWithOverrideManager {
    
    companion object {
        const val PREF_KEY = "theme_override"
    }
    
    private val prefs: SharedPreferences
    
    init {
        this.prefs = context.getSharedPreferences(PREF_KEY, Context.MODE_PRIVATE)
    }
    
    fun getCurrentTheme(): AppThemeManager.Theme {
        // 检查是否有用户覆盖
        val override = prefs.getString(OVERRIDE_KEY, null)
        if (override != null) {
            return AppThemeManager.Theme.valueOf(override)
        }
        
        // 没有覆盖，跟随系统
        return AppThemeManager.Theme.FOLLOW_SYSTEM
    }
    
    fun setOverride(theme: AppThemeManager.Theme) {
        prefs.edit().putString(OVERRIDE_KEY, theme.name).apply()
        applyTheme(theme)
    }
    
    fun clearOverride() {
        prefs.edit().remove(OVERRIDE_KEY).apply()
        applyTheme(AppThemeManager.Theme.FOLLOW_SYSTEM)
    }
    
    private fun applyTheme(theme: AppThemeManager.Theme) {
        val nightMode = when (theme) {
            AppThemeManager.Theme.LIGHT -> AppCompatDelegate.MODE_NIGHT_NO
            AppThemeManager.Theme.DARK -> AppCompatDelegate.MODE_NIGHT_YES
            AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        AppCompatDelegate.setDefaultNightMode(nightMode)
    }
}

// UI 实现
class ThemeSettingsDialogFragment : DialogFragment() {
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return ThemeSettingsBinding.inflate(inflater, container, false).root.also { root ->
            val binding = ThemeSettingsBinding.bind(root)
            
            setupThemeOptions(binding)
            setupOverrideOptions(binding)
        }
    }
    
    private fun setupThemeOptions(binding: ThemeSettingsBinding) {
        binding.themeRadioSystem.setOnCheckedChangeListener { _, checked ->
            if (checked) {
                themeManager.clearOverride()
            }
        }
        
        binding.themeRadioLight.setOnCheckedChangeListener { _, checked ->
            if (checked) {
                themeManager.setOverride(AppThemeManager.Theme.LIGHT)
            }
        }
        
        binding.themeRadioDark.setOnCheckedChangeListener { _, checked ->
            if (checked) {
                themeManager.setOverride(AppThemeManager.Theme.DARK)
            }
        }
    }
    
    private fun setupOverrideOptions(binding: ThemeSettingsBinding) {
        // 显示当前是跟随系统还是用户覆盖
        val currentTheme = themeManager.getCurrentTheme()
        
        when (currentTheme) {
            AppThemeManager.Theme.LIGHT -> {
                binding.themeRadioLight.isChecked = true
                binding.overrideHint.text = "已强制使用浅色主题"
            }
            AppThemeManager.Theme.DARK -> {
                binding.themeRadioDark.isChecked = true
                binding.overrideHint.text = "已强制使用深色主题"
            }
            AppThemeManager.Theme.FOLLOW_SYSTEM -> {
                binding.themeRadioSystem.isChecked = true
                binding.overrideHint.text = "跟随系统主题设置"
            }
        }
    }
}
```

### 5.6 测试 followSystem 模式

```kotlin
// Unit Test
class FollowSystemModeTest {
    
    @Test
    fun testFollowSystemLightMode() {
        // 模拟系统浅色模式
        val mockConfig = Configuration().apply {
            uiMode = Configuration.UI_MODE_NIGHT_NO
        }
        
        val detector = SystemNightModeDetector(mockConfig)
        assertFalse(detector.isNightMode())
    }
    
    @Test
    fun testFollowSystemDarkMode() {
        // 模拟系统深色模式
        val mockConfig = Configuration().apply {
            uiMode = Configuration.UI_MODE_NIGHT_YES
        }
        
        val detector = SystemNightModeDetector(mockConfig)
        assertTrue(detector.isNightMode())
    }
    
    @Test
    fun testUserOverrideTakesPrecedence() {
        // 测试用户覆盖优先级
        val resolver = ThemeConflictResolver()
        resolver.setUserThemeOverride(AppThemeManager.Theme.DARK)
        
        val theme = resolver.resolveTheme(mockContext)
        assertEquals(AppThemeManager.Theme.DARK, theme)
    }
}

// UI Test
@get:Rule
val activityTestRule = ActivityScenarioRule(MainActivity::class.java)

@Test
fun testThemeChangeOnSystemNightModeToggle() {
    // 1. 初始状态 - 浅色模式
    activityTestRule.scenario.onActivity { activity ->
        val rootView = activity.findViewById<View>(android.R.id.content)
        val backgroundColor = ThemeUtils.getColor(activity, R.attr.colorSurface)
        assertEquals(Color.WHITE, backgroundColor)
    }
    
    // 2. 模拟系统切换到深色模式
    activityTestRule.scenario.onActivity { activity ->
        val config = activity.resources.configuration.apply {
            uiMode = uiMode or Configuration.UI_MODE_NIGHT_YES
        }
        activity.resources.updateConfiguration(config, activity.resources.displayMetrics)
    }
    
    // 3. 验证主题已更新
    activityTestRule.scenario.onActivity { activity ->
        val rootView = activity.findViewById<View>(android.R.id.content)
        val backgroundColor = ThemeUtils.getColor(activity, R.attr.colorSurface)
        assertEquals(Color.parseColor("#121212"), backgroundColor)
    }
}
```

---

## 6. 源码深度分析

### 6.1 AppCompatDelegate 创建流程

```kotlin
// AppCompatDelegate 的创建流程
public static AppCompatDelegate create(
    Context context, 
    WindowCallback callback,
    Bundle icicle) {
    
    // 1. 根据上下文类型创建不同的实现
    if (context == null) {
        // 没有 Context，使用基础实现
        return new AppCompatDelegateImplV14();
    }
    
    // 2. 检测 Activity 类型
    if (context instanceof Activity) {
        return createActivityDelegate((Activity) context);
    }
    
    // 3. 检测 Application 类型
    if (context instanceof Application) {
        return new AppCompatDelegateImplV14();
    }
    
    // 4. 默认实现
    return new AppCompatDelegateImplV14();
}

// Activity Delegate 创建
private static AppCompatDelegate createActivityDelegate(Activity activity) {
    // 根据 API 级别创建不同的实现
    if (Build.VERSION.SDK_INT >= 29) {
        return new AppCompatDelegateImplV29(activity);
    } else if (Build.VERSION.SDK_INT >= 21) {
        return new AppCompatDelegateImplV21(activity);
    } else {
        return new AppCompatDelegateImplV14(activity);
    }
}
```

### 6.2 主题应用流程

```kotlin
// 主题应用的完整流程
class AppCompatDelegateImplV14 extends AppCompatDelegateImplV7 {
    
    @Override
    public void installViewFactory() {
        // 1. 安装 AppCompat 的 View 工厂
        ViewCompat.setFactory(activity, new AppCompatViewInflater());
    }
    
    @Override
    public void installMenuFactory() {
        // 2. 安装 AppCompat 的 Menu 工厂
        MenuBuilder.setFactory(new AppCompatMenuInflater());
    }
    
    @Override
    public void onCreate(Bundle icicle) {
        // 3. 应用主题
        applyDayNight();
        
        // 4. 创建 ActionBar
        installActionBar();
        
        // 5. 初始化夜间模式
        initializeNightMode();
    }
    
    private void applyDayNight() {
        // 获取当前的夜间模式设置
        int nightMode = getDefaultNightMode();
        
        // 应用相应的主题
        if (shouldUseNightTheme(nightMode)) {
            applyNightTheme();
        } else {
            applyDayTheme();
        }
    }
    
    private void applyNightTheme() {
        // 应用夜间主题
        Context themeContext = createNightContext(context);
        setContext(themeContext);
    }
}
```

### 6.3 夜间模式 Manager 源码分析

```kotlin
// NightModeManager 的完整实现
class NightModeManager {
    
    private static final String PREF_NAME = "androidx.appcompat.theme.night_mode";
    private static final String PREF_KEY = "night_mode";
    
    private SharedPreferences prefs;
    private int nightMode = MODE_NIGHT_FOLLOW_SYSTEM;
    
    init {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        loadNightMode();
    }
    
    fun getDefaultNightMode(): Int {
        return nightMode;
    }
    
    fun setDefaultNightMode(int mode) {
        // 1. 更新内部状态
        nightMode = mode;
        
        // 2. 保存到 SharedPreferences
        saveNightMode(mode);
        
        // 3. 通知所有 Activity 重建
        notifyModeChanged();
    }
    
    private fun loadNightMode() {
        nightMode = prefs.getInt(PREF_KEY, MODE_NIGHT_FOLLOW_SYSTEM);
    }
    
    private fun saveNightMode(int mode) {
        prefs.edit().putInt(PREF_KEY, mode).apply();
    }
    
    private fun notifyModeChanged() {
        // 通知所有注册的监听器
        for (callback in modeChangeCallbacks) {
            callback.onNightModeChanged(nightMode);
        }
    }
    
    interface NightModeChangedListener {
        fun onNightModeChanged(mode: Int)
    }
}
```

### 6.4 ContextThemeWrapper 源码分析

```kotlin
// ContextThemeWrapper 是如何工作的
public class ContextThemeWrapper extends ContextWrapper {
    
    private static final int THEME_ATTR_PRIVATE = 0x01010000;
    
    private final Resources.Theme mTheme;
    private final int mThemeResId;
    
    public ContextThemeWrapper(Context base, int themeResId) {
        super(base);
        mThemeResId = themeResId;
        
        // 创建新的 Theme 对象
        mTheme = base.getTheme();
        mTheme.applyStyle(themeResId, true);
    }
    
    @Override
    public Resources.Theme getTheme() {
        // 返回包装后的 Theme
        return mTheme;
    }
    
    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(newBase);
        // 重新应用主题
        mTheme.applyStyle(mThemeResId, true);
    }
}
```

### 6.5 View 工厂机制源码

```kotlin
// AppCompatViewInflater 源码分析
class AppCompatViewInflater implements LayoutInflater.Factory2 {
    
    @Override
    public View onCreateView(
        String name, 
        Context context, 
        AttributeSet attrs) {
        
        // 1. 检查是否是 AppCompat 组件
        if (isAppCompatView(name)) {
            // 返回 AppCompat 版本的 View
            return createAppCompatView(name, context, attrs);
        }
        
        // 2. 检查是否是支持库组件
        if (isSupportLibraryView(name)) {
            return createSupportLibraryView(name, context, attrs);
        }
        
        // 3. 返回默认 View
        return null;
    }
    
    @Override
    public View onCreateView(
        String name, 
        Context context, 
        AttributeSet attrs, 
        boolean isInheritContextTheme) {
        
        // 处理继承主题的情况
        if (isInheritContextTheme) {
            context = createThemedContext(context, attrs);
        }
        
        return onCreateView(name, context, attrs);
    }
    
    private Context createThemedContext(Context context, AttributeSet attrs) {
        // 从属性中提取主题
        TypedValue themeValue = new TypedValue();
        attrs.getValue(
            androidx.appcompat.R.attr.theme, 
            themeValue, 
            true);
        
        if (themeValue.resourceId != 0) {
            return new ContextThemeWrapper(context, themeValue.resourceId);
        }
        
        return context;
    }
    
    private View createAppCompatView(
        String name, 
        Context context, 
        AttributeSet attrs) {
        
        // 根据 View 名称创建对应的 AppCompat 组件
        return switch(name) {
            case "Button" -> new AppCompatButton(context, attrs);
            case "EditText" -> new AppCompatEditText(context, attrs);
            case "TextView" -> new AppCompatTextView(context, attrs);
            case "ImageView" -> new AppCompatImageView(context, attrs);
            case "SeekBar" -> new AppCompatSeekBar(context, attrs);
            case "Spinner" -> new AppCompatSpinner(context, attrs);
            case "Toolbar" -> new Toolbar(context, attrs);
            default -> null;
        };
    }
}
```

### 6.6 夜间模式切换源码

```kotlin
// 夜间模式切换的完整流程
class AppCompatDelegateImplV19 extends AppCompatDelegateImplV14 {
    
    @Override
    public void applyDayNight() {
        // 1. 获取当前的夜间模式设置
        int nightMode = getDefaultNightMode();
        
        // 2. 决定是否使用夜间主题
        boolean useNightTheme = shouldUseNightTheme(nightMode);
        
        // 3. 应用主题
        if (useNightTheme) {
            applyNightTheme();
        } else {
            applyDayTheme();
        }
        
        // 4. 通知 UI 更新
        notifyThemeChanged();
    }
    
    private boolean shouldUseNightTheme(int nightMode) {
        return switch(nightMode) {
            case MODE_NIGHT_NO -> false;
            case MODE_NIGHT_YES -> true;
            case MODE_NIGHT_AUTO_BATTERY -> isBatterySaverOn();
            case MODE_NIGHT_FOLLOW_SYSTEM -> getNightModeFromSystem();
            default -> false;
        };
    }
    
    private boolean getNightModeFromSystem() {
        Configuration config = getResources().getConfiguration();
        return (config.uiMode & Configuration.UI_MODE_NIGHT_MASK) == 
            Configuration.UI_MODE_NIGHT_YES;
    }
    
    private void applyNightTheme() {
        // 应用夜间主题
        Context themeContext = createNightContext(context);
        setContext(themeContext);
        
        // 重建所有 View
        recreateViews();
    }
    
    private Context createNightContext(Context context) {
        // 创建带夜间主题的 Context
        return new ContextThemeWrapper(context, R.style.Theme_Night);
    }
}
```

---

## 7. 最佳实践与陷阱

### 7.1 最佳实践

#### 实践 1: 在正确的生命周期设置主题

```kotlin
// ✅ 正确：在 attachBaseContext 中设置
abstract class ThemedActivity : AppCompatActivity() {
    
    override fun attachBaseContext(newBase: Context) {
        val theme = getThemeForActivity()
        val themedContext = ContextThemeWrapper(newBase, theme)
        super.attachBaseContext(themedContext)
    }
    
    private fun getThemeForActivity(): Int {
        return when {
            isDarkModeEnabled() -> R.style.AppTheme_Dark
            else -> R.style.AppTheme_Light
        }
    }
}

// ✅ 正确：在 super.onCreate() 之前设置
abstract class ThemedActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        val nightMode = getNightModeForActivity()
        AppCompatDelegate.setDefaultNightMode(nightMode)
        super.onCreate(savedInstanceState)
    }
    
    private fun getNightModeForActivity(): Int {
        return when (themeManager.getTheme()) {
            Theme.LIGHT -> AppCompatDelegate.MODE_NIGHT_NO
            Theme.DARK -> AppCompatDelegate.MODE_NIGHT_YES
            Theme.SYSTEM -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
    }
}

// ❌ 错误：在 setContentView 之后设置
class WrongActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 太晚了！View 已经创建了
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
    }
}
```

#### 实践 2: 使用 DayNight 主题

```xml
<!-- ✅ 推荐：使用 DayNight 主题 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <item name="colorPrimary">@color/primary</item>
    <item name="colorSurface">@color/surface</item>
</style>

<!-- ❌ 不推荐：使用固定主题 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DarkActionBar">
    <!-- 不会自动切换夜间模式 -->
</style>
```

#### 实践 3: 提供主题切换入口

```kotlin
// 在 Settings 中提供主题切换
class SettingsActivity : AppCompatActivity() {
    
    private lateinit var themeSwitcher: ThemeSwitcher
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        themeSwitcher = ThemeSwitcher(this)
        
        setupThemeSelector()
        setupThemePreview()
    }
    
    private fun setupThemeSelector() {
        // 提供三个选项：浅色、深色、跟随系统
        binding.radioLight.setOnClickListener {
            themeSwitcher.setTheme(Theme.LIGHT)
        }
        
        binding.radioDark.setOnClickListener {
            themeSwitcher.setTheme(Theme.DARK)
        }
        
        binding.radioSystem.setOnClickListener {
            themeSwitcher.setTheme(Theme.SYSTEM)
        }
    }
    
    private fun setupThemePreview() {
        // 提供主题预览功能
        binding.previewButton.setOnClickListener {
            showThemePreviewDialog()
        }
    }
}
```

#### 实践 4: 处理配置变更

```kotlin
// 处理夜间模式配置变更
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 保存夜间模式状态
        isNightMode = (resources.configuration.uiMode and 
            Configuration.UI_MODE_NIGHT_YES) == 
            Configuration.UI_MODE_NIGHT_YES
    }
    
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        
        // 检测夜间模式是否变化
        val newNightMode = (newConfig.uiMode and 
            Configuration.UI_MODE_NIGHT_YES) == 
            Configuration.UI_MODE_NIGHT_YES
            
        if (newNightMode != isNightMode) {
            isNightMode = newNightMode
            updateUIForNightMode()
        }
    }
    
    private fun updateUIForNightMode() {
        // 更新 UI 元素
        // 重新加载图片
        // 更新颜色等
    }
}
```

#### 实践 5: 测试夜间模式

```kotlin
// 使用 Android Studio 的 Preview 功能
@Preview(name = "Light", group = "DayNight")
@Preview(name = "Dark", group = "DayNight", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Composable
fun MyComposablePreview() {
    MyAppTheme {
        MyComposable()
    }
}

// 编写 Unit Test
@Test
fun testNightModeResources() {
    val lightColor = ContextCompat.getColor(context, R.color.background)
    val darkColor = ContextCompat.getColor(context, R.color.background)
    
    // 验证浅色和深色模式颜色不同
    assertNotEquals(lightColor, darkColor)
}

// 编写 UI Test
@Test
fun testThemeSwitch() {
    activityTestRule.scenario.onActivity { activity ->
        // 验证浅色模式
        assertEquals(Color.WHITE, activity.window.decorView.background)
        
        // 切换到深色模式
        themeSwitcher.setTheme(Theme.DARK)
        
        // 验证深色模式
        assertEquals(Color.BLACK, activity.window.decorView.background)
    }
}
```

### 7.2 常见陷阱

#### 陷阱 1: 主题设置时机错误

```kotlin
// ❌ 陷阱：在错误的时机设置主题
class BadActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 太晚了！View 已经使用默认主题创建了
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
    }
}

// ✅ 解决：在正确的时机设置主题
class GoodActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // 在 super.onCreate() 之前设置
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

#### 陷阱 2: 忘记保存用户设置

```kotlin
// ❌ 陷阱：不保存用户主题设置
class BadThemeSwitcher {
    fun switchTheme(theme: Theme) {
        AppCompatDelegate.setDefaultNightMode(getNightMode(theme))
        // 没有保存设置，重启后会丢失
    }
}

// ✅ 解决：保存用户设置
class GoodThemeSwitcher {
    fun switchTheme(theme: Theme) {
        // 保存设置
        prefs.edit().putString(KEY_THEME, theme.name).apply()
        
        // 应用主题
        AppCompatDelegate.setDefaultNightMode(getNightMode(theme))
    }
}
```

#### 陷阱 3: 忽略配置变更

```kotlin
// ❌ 陷阱：不处理配置变更
class BadActivity : AppCompatActivity() {
    // 没有声明 configChanges
    // 系统会重启 Activity
}

// ✅ 解决：处理配置变更
class GoodActivity : AppCompatActivity() {
    
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        // 处理夜间模式变化
    }
}
```

#### 陷阱 4: 硬编码颜色值

```kotlin
// ❌ 陷阱：硬编码颜色值
class BadUI {
    private fun setBackgroundColor(view: View) {
        view.setBackgroundColor(Color.WHITE)  // 硬编码
    }
}

// ✅ 解决：使用主题属性
class GoodUI {
    private fun setBackgroundColor(view: View) {
        val color = ThemeUtils.getColor(context, R.attr.colorSurface)
        view.setBackgroundColor(color)
    }
}
```

#### 陷阱 5: 忘记更新图片资源

```kotlin
// ❌ 陷阱：图片在深色模式下不协调
// 只有浅色模式的图片
res/drawable/ic_logo.xml

// ✅ 解决：提供深色模式专用图片
res/drawable/ic_logo.xml        // 浅色模式
res/drawable-night/ic_logo.xml  // 深色模式
```

---

## 8. 面试考点大全

### 基础考点（初级工程师）

#### Q1: 什么是 AppCompatDelegate？它的主要作用是什么？

**答案要点：**
```
1. AppCompatDelegate 是 AndroidX AppCompat 库的核心类
2. 主要作用：
   - 管理主题和样式
   - 处理 ActionBar 的创建和生命周期
   - 控制深色/浅色模式
   - 提供兼容性 API
3. 使用场景：
   - AppCompatActivity 通过它实现兼容功能
   - 手动管理主题时可以独立使用
```

#### Q2: 如何设置深色模式？有哪些模式可选？

**答案要点：**
```
设置方式：
AppCompatDelegate.setDefaultNightMode(mode)

可选模式：
1. MODE_NIGHT_NO - 始终浅色
2. MODE_NIGHT_YES - 始终深色
3. MODE_NIGHT_FOLLOW_SYSTEM - 跟随系统
4. MODE_NIGHT_AUTO_BATTERY - 根据电池优化
5. MODE_NIGHT_UNSPECIFIED - 未指定
```

#### Q3: 如何实现手动主题切换？

**答案要点：**
```
步骤：
1. 保存用户选择（SharedPreferences）
2. 设置夜间模式
3. 重建 Activity（recreate()）

代码示例：
AppCompatDelegate.setDefaultNightMode(mode)
prefs.edit().putString(KEY, mode).apply()
recreate()
```

### 进阶考点（中级工程师）

#### Q4: followSystem 模式是如何工作的？

**答案要点：**
```
工作原理：
1. 检测系统 UI 模式（Configuration.UI_MODE_NIGHT_MASK）
2. 根据系统设置决定是否使用深色主题
3. 监听配置变更，自动响应系统主题变化

关键点：
- 通过 Configuration.uiMode 检测
- 系统主题变化会触发 CONFIGURATION_CHANGED
- 可以结合用户覆盖实现灵活的主题管理
```

#### Q5: 主题属性查找的顺序是什么？

**答案要点：**
```
查找顺序：
1. 控件的 style 属性
2. Activity 的 theme 属性
3. Application 的 theme 属性
4. 系统默认主题

使用 ?attr.xxx 可以引用主题属性
使用 ?android:attr.xxx 可以引用框架属性
```

#### Q6: 如何正确处理配置变更？

**答案要点：**
```
处理配置变更的方式：
1. 在 Manifest 中声明 configChanges
2. 重写 onConfigurationChanged 方法
3. 保存和恢复状态

示例：
android:configChanges="uiMode|orientation"
override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    // 处理夜间模式变化
}
```

### 高级考点（高级工程师/架构师）

#### Q7: AppCompatDelegate 的源码实现原理是什么？

**答案要点：**
```
核心实现：
1. 工厂模式创建不同 API 版本的实现
2. 委托模式将功能委托给 Delegate
3. ContextThemeWrapper 包装 Context 实现主题切换
4. View 工厂机制提供 AppCompat View

源码流程：
create() -> AppCompatDelegateImplVxx
onCreate() -> installViewFactory() -> installMenuFactory() -> applyDayNight()
```

#### Q8: 如何实现主题的动态切换而不重启 Activity？

**答案要点：**
```
方案 1: 使用 ThemeOverlay
- 针对特定视图应用覆盖主题
- 不影响整个 Activity

方案 2: 使用 ContextThemeWrapper
- 为特定 View 创建新的 Context
- 只更新需要变化的 View

方案 3: 使用动画过渡
- 在 recreate() 前后添加过渡动画
- 提供平滑的切换体验
```

#### Q9: Material Design 3 的动态取色如何实现？

**答案要点：**
```
Android 12+ 支持动态取色：
1. 使用 DynamicColors 类获取动态颜色
2. 应用主题属性
3. 提供降级方案

代码示例：
val dynamicColors = DynamicColors.getDynamicColors(context)
dynamicColors.getPrimary()?.let {
    theme.applyColor(R.attr.colorPrimary, it)
}
```

#### Q10: 如何设计一个灵活的主题管理系统？

**答案要点：**
```
设计要点：
1. 主题枚举类型（LIGHT, DARK, SYSTEM）
2. 使用单例模式管理主题状态
3. 提供主题监听器接口
4. 支持主题预览功能
5. 提供用户覆盖机制
6. 正确处理配置变更
7. 提供回退方案

架构设计：
- ThemeManager：主题管理的单例
- ThemePrefs：主题设置的存储
- NightModeObserver：监听系统主题变化
- ThemeSwitcher：提供主题切换 API
- ThemePreview：提供主题预览功能
```

---

## 9. 参考资料

### 官方文档
- [AppCompatDelegate 官方文档](https://developer.android.com/reference/androidx/appcompat/app/AppCompatDelegate)
- [深色模式指南](https://developer.android.com/guide/topics/ui/day-night)
- [Material Design 主题](https://material.io/design/color/dark-theme)

### 源码地址
- [AndroidX AppCompat 源码](https://github.com/androidx/androidx/tree/main/appcompat)

### 推荐文章
- [Android 主题和样式详解](https://developer.android.com/guide/topics/ui/themes)
- [Material Design 3 动态取色](https://material.io/blog/android-12s-new-material-you-design-system)

---

*本文完，感谢阅读！*