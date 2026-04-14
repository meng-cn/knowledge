# AppCompat 兼容库深度解析

> **字数统计：约 8000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [AppCompatActivity](#1-appcompatactivity)
2. [AppCompatDelegate](#2-appcompatdelegate)
3. [主题和样式自定义](#3-主题和样式自定义)
4. [深色模式适配（darkTheme）](#4-深色模式适配)
5. [Material Components](#5-material-components)
6. [Toolbar 使用](#6-toolbar-使用)
7. [返回按钮处理](#7-返回按钮处理)
8. [兼容性处理（API 16+）](#8-兼容性处理)
9. [面试考点](#9-面试考点)
10. [参考资料](#10-参考资料)

---

## 1. AppCompatActivity

### 1.1 什么是 AppCompatActivity？

**AppCompatActivity** 是 AndroidX 提供的兼容 Activity 基类，它提供了以下核心功能：

```kotlin
// AppCompatActivity 继承链
abstract class AppCompatActivity : ComponentActivity, AppCompatV7HelperWrapper

// ComponentActivity 提供了依赖注入、ViewModel 支持等功能
class ComponentActivity : Activity, ViewModelStoreOwner, ComponentCallbacks

// AppCompatActivity 提供了以下特性：
// - ActionBar 兼容支持
// - Theme 兼容性支持
// - Material Design 组件支持
// - 深色模式支持
```

### 1.2 为什么使用 AppCompatActivity？

```kotlin
// ❌ 错误：直接继承 Activity，无法使用 Material 组件
class MyActivity : AppCompatActivity() {
    // 无法使用 AppCompatActivity 提供的兼容特性
}

// ✅ 正确：继承 AppCompatActivity
class MyActivity : AppCompatActivity() {
    // 可以使用：
    // - ActionBar/Toolbar
    // - Material 主题
    // - 深色模式
    // - 其他兼容特性
}
```

### 1.3 AppCompatActivity 的核心方法

```kotlin
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 1. 设置主题
        setTheme(R.style.AppTheme)
        
        // 2. 支持 ActionBar
        if (supportActionBar != null) {
            supportActionBar?.title = "My App"
            supportActionBar?.setDisplayHomeAsUpEnabled(true)
        }
        
        // 3. 启动子 Activity
        startActivityForResult(intent, REQUEST_CODE)
        
        // 4. 处理返回结果
        // onActivityResult 在 AppCompatActivity 中被封装
    }
    
    // 支持库版本的 onActivityResult
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        // 处理返回结果
    }
}
```

### 1.4 AppCompatActivity vs Activity

| 特性 | Activity | AppCompatActivity |
|------|----------|----------------|
| ActionBar 支持 | API 11+ | API 7+ |
| Theme 兼容 | 原生 | 兼容旧版本 |
| Material 组件 | 有限 | 完整支持 |
| 深色模式 | Android 10+ | 向下兼容 |
| 推荐程度 | ❌ 不推荐 | ✅ 推荐 |

### 1.5 迁移到 AppCompatActivity

```kotlin
// 迁移前
class MyActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        requestWindowFeature(Window.FEATURE_ACTION_BAR)
    }
}

// 迁移后
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // ActionBar 自动支持
    }
}
```

---

## 2. AppCompatDelegate

### 2.1 AppCompatDelegate 的作用

**AppCompatDelegate** 是 AppCompatActivity 的核心组件，负责：

```kotlin
// AppCompatDelegate 的职责：
// 1. 主题应用
// 2. ActionBar 管理
// 3. 深色模式支持
// 4. 导航栏样式统一

class AppCompatDelegate {
    companion object {
        // 获取当前 Activity 的 Delegate 实例
        fun defaultImpl(activity: Activity): AppCompatDelegate
        
        // 设置深色模式
        fun.setDefaultNightMode(mode: Int)
    }
}
```

### 2.2 使用 AppCompatDelegate

```kotlin
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 设置深色模式
        AppCompatDelegate.setDefaultNightMode(
            AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM  // 跟随系统
        )
    }
}

// 在 Activity 中
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 必须在 super.onCreate() 之前设置主题
        AppCompatDelegate.setDefaultNightMode(
            AppCompatDelegate.MODE_NIGHT_YES  // 强制深色
        )
        super.onCreate(savedInstanceState)
    }
}
```

### 2.3 深色模式控制

```kotlin
// 深色模式常量
class AppCompatDelegate {
    companion object {
        const val MODE_NIGHT_NO = 0          // 禁用深色模式
        const val MODE_NIGHT_YES = 1         // 启用深色模式
        const val MODE_NIGHT_AUTO = 2        // 自动检测
        const val MODE_NIGHT_FOLLOW_SYSTEM = 3  // 跟随系统
        const val MODE_NIGHT_UNSPECIFIED = -1  // 未指定
    }
}

// 在代码中控制深色模式
class MyActivity : AppCompatActivity() {
    
    private fun toggleDarkMode() {
        val currentMode = AppCompatDelegate.getDefaultNightMode()
        val newMode = if (currentMode == AppCompatDelegate.MODE_NIGHT_YES) {
            AppCompatDelegate.MODE_NIGHT_NO
        } else {
            AppCompatDelegate.MODE_NIGHT_YES
        }
        AppCompatDelegate.setDefaultNightMode(newMode)
        
        // 重启 Activity 以应用新主题
        recreate()
    }
}
```

### 2.4 AppCompatDelegate 源码分析

```kotlin
// 简化版源码
class AppCompatDelegate {
    private var mNightMode: Int = MODE_NIGHT_FOLLOW_SYSTEM
    
    fun setDefaultNightMode(mode: Int) {
        mNightMode = mode
        // 保存设置
        saveNightMode(mode)
    }
    
    fun getDefaultNightMode(): Int = mNightMode
    
    // 根据模式决定是否启用深色模式
    fun applyDayNight(): Boolean {
        return when (mNightMode) {
            MODE_NIGHT_NO -> false
            MODE_NIGHT_YES -> true
            MODE_NIGHT_FOLLOW_SYSTEM -> {
                // 检查系统设置
                resources.configuration.uiMode and 
                    Configuration.UI_MODE_NIGHT_MASK == 
                    Configuration.UI_MODE_NIGHT_YES
            }
            else -> false
        }
    }
}
```

---

## 3. 主题和样式自定义

### 3.1 主题与样式的区别

```xml
<!-- styles.xml -->
<!-- 样式：定义一组 UI 属性 -->
<style name="CustomButtonStyle">
    <item name="android:textColor">@color/primary</item>
    <item name="android:background">@drawable/button_bg</item>
    <item name="android:padding">16dp</item>
</style>

<!-- 主题：应用于整个 Activity/Application 的样式集合 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <item name="colorPrimary">@color/primary</item>
    <item name="colorPrimaryDark">@color/primary_dark</item>
    <item name="colorAccent">@color/accent</item>
    <item name="buttonStyle">@style/CustomButtonStyle</item>
</style>
```

### 3.2 定义主题

```xml
<!-- res/values/themes.xml -->
<resources>
    <!-- 基础主题 -->
    <style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- 主色 -->
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryVariant">@color/primary_variant</item>
        <item name="colorOnPrimary">@color/white</item>
        
        <!-- 主色深色 -->
        <item name="colorPrimaryDark">@color/primary_dark</item>
        
        <!-- 强调色 -->
        <item name="colorAccent">@color/accent</item>
        <item name="colorSecondary">@color/secondary</item>
        <item name="colorOnSecondary">@color/white</item>
        
        <!-- 背景色 -->
        <item name="android:colorBackground">@color/background</item>
        <item name="colorSurface">@color/surface</item>
        <item name="colorOnSurface">@color/on_surface</item>
        
        <!-- 状态颜色 -->
        <item name="colorError">@color/error</item>
        <item name="colorOnError">@color/white</item>
        
        <!-- 组件样式 -->
        <item name="buttonStyle">@style/AppButton</item>
        <item name="textAppearanceHeadline1">@style/TextAppearance.App.Headline</item>
        <item name="textAppearanceBody1">@style/TextAppearance.App.Body</item>
    </style>
    
    <!-- 自定义按钮样式 -->
    <style name="AppButton" parent="Widget.MaterialComponents.Button">
        <item name="backgroundTint">@color/primary</item>
        <item name="cornerRadius">8dp</item>
        <item name="android:textColor">@color/white</item>
    </style>
    
    <!-- 无 ActionBar 主题 -->
    <style name="AppTheme.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
    
    <!-- 全屏主题 -->
    <style name="AppTheme.FullScreen" parent="AppTheme">
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
    
    <!-- 对话框主题 -->
    <style name="AppTheme.Dialog" parent="Theme.MaterialComponents.Dialog">
        <item name="android:backgroundDimEnabled">true</item>
        <item name="android:windowBackground">@drawable/dialog_background</item>
    </style>
</resources>
```

### 3.3 颜色资源定义

```xml
<!-- res/values/colors.xml -->
<resources>
    <!-- 主色 -->
    <color name="primary">#6200EE</color>
    <color name="primary_variant">#3700B3</color>
    <color name="primary_dark">#3700B3</color>
    <color name="on_primary">#FFFFFF</color>
    
    <!-- 强调色 -->
    <color name="accent">#03DAC6</color>
    <color name="secondary">#03DAC6</color>
    <color name="on_secondary">#FFFFFF</color>
    
    <!-- 背景色 -->
    <color name="background">#FFFFFF</color>
    <color name="surface">#FFFFFF</color>
    <color name="on_surface">#000000</color>
    
    <!-- 状态颜色 -->
    <color name="error">#B00020</color>
    <color name="on_error">#FFFFFF</color>
    
    <!-- 其他颜色 -->
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
    <color name="gray">#9E9E9E</color>
    <color name="divider">#E0E0E0</color>
</resources>

<!-- 深色模式颜色 -->
<!-- res/values-night/colors.xml -->
<resources>
    <color name="background">#121212</color>
    <color name="surface">#1E1E1E</color>
    <color name="on_surface">#FFFFFF</color>
    <color name="primary">#BB86FC</color>
    <color name="primary_variant">#3700B3</color>
    <color name="accent">#03DAC6</color>
</resources>
```

### 3.4 应用主题

```xml
<!-- AndroidManifest.xml -->
<application
    android:name=".MyApplication"
    android:theme="@style/AppTheme">
    
    <!-- 为特定 Activity 设置不同主题 -->
    <activity
        android:name=".SplashActivity"
        android:theme="@style/AppTheme.FullScreen" />
    
    <activity
        android:name=".LoginActivity"
        android:theme="@style/AppTheme.NoActionBar" />
    
    <activity
        android:name=".SettingsActivity"
        android:theme="@style/AppTheme" />
</application>
```

### 3.5 动态切换主题

```kotlin
class MyActivity : AppCompatActivity() {
    
    private fun changeTheme(themeRes: Int) {
        val theme = createTheme()
        theme.applyStyle(themeRes, true)
        applyOverrideTheme(theme)
        recreate()
    }
    
    // 使用 Material You 动态取色
    private fun applyDynamicColors() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val dynamicColors = DynamicColors.getDynamicColors(this)
            val theme = Theme(context.theme)
            
            dynamicColors.getPrimary().let { primary ->
                theme.setAttribute(R.attr.colorPrimary, primary)
            }
            dynamicColors.getSurface().let { surface ->
                theme.setAttribute(R.attr.colorSurface, surface)
            }
            
            applyOverrideTheme(theme)
            recreate()
        }
    }
}
```

---

## 4. 深色模式适配

### 4.1 深色模式基础配置

```xml
<!-- res/values/themes.xml (浅色模式) -->
<resources>
    <style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/primary_light</item>
        <item name="colorSurface">@color/surface_light</item>
        <item name="colorOnSurface">@color/on_surface_light</item>
    </style>
</resources>

<!-- res/values-night/themes.xml (深色模式) -->
<resources>
    <style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/primary_dark</item>
        <item name="colorSurface">@color/surface_dark</item>
        <item name="colorOnSurface">@color/on_surface_dark</item>
    </style>
</resources>
```

### 4.2 使用 DayNight 主题

```xml
<!-- Theme.MaterialComponents.DayNight.* 会自动根据系统设置切换 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <!-- 浅色模式和深色模式的属性会自动切换 -->
</style>

<!-- 可用主题变体 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <!-- 无 ActionBar -->
</style>

<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.Dialog">
    <!-- 对话框主题 -->
</style>

<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.BottomSheetDialog">
    <!-- BottomSheet 主题 -->
</style>
```

### 4.3 手动切换深色模式

```kotlin
class SettingsActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivitySettingsBinding
    private lateinit var viewModel: SettingsViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 监听深色模式切换
        binding.toggleDarkModeSwitch.setOnCheckedChangeListener { _, isChecked ->
            val mode = if (isChecked) {
                AppCompatDelegate.MODE_NIGHT_YES
            } else {
                AppCompatDelegate.MODE_NIGHT_NO
            }
            AppCompatDelegate.setDefaultNightMode(mode)
            
            // 保存设置
            prefs.isDarkModeEnabled = isChecked
            
            // 重建 Activity 以应用新主题
            recreate()
        }
        
        // 恢复保存的设置
        binding.toggleDarkModeSwitch.isChecked = prefs.isDarkModeEnabled
        
        // 应用深色模式
        val currentMode = prefs.getNightMode()
        AppCompatDelegate.setDefaultNightMode(currentMode)
    }
}
```

### 4.4 深色模式适配注意事项

```kotlin
// 注意事项 1：图片资源
// 提供深色模式专用的图片
// res/drawable/ic_logo.xml (浅色)
// res/drawable-night/ic_logo.xml (深色)

// 注意事项 2：背景颜色
// 深色模式下避免使用白色背景
// res/values/colors.xml
// res/values-night/colors.xml

// 注意事项 3：阴影效果
// 深色模式下阴影可能不明显，需要调整
@color/cardview_shadow_end_color  // 调整阴影颜色

// 注意事项 4：图片透明度
// 深色模式下图片可能需要调整透明度
<item name="android:alpha">0.87</item>

// 注意事项 5：文字颜色对比度
// 确保深色模式下文字可读
```

### 4.5 深色模式测试

```kotlin
// 使用 Android Studio 的预览功能测试深色模式
@Preview(name = "Light Mode", showBackground = true)
@Preview(name = "Dark Mode", showBackground = true, uiMode = Configuration.UI_MODE_NIGHT_YES)
@Composable
fun MyLayoutPreview() {
    MyLayout()
}

// 在代码中测试
@Test
fun testDarkMode() {
    val activity = Roblectric.buildActivity(MyActivity::class.java).create().get()
    
    // 切换到深色模式
    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
    activity.recreate()
    
    // 验证 UI 变化
    assertTrue(activity.findViewById<View>(R.id.textView).textColor is DarkColor)
}
```

---

## 5. Material Components

### 5.1 添加 Material Components 依赖

```groovy
dependencies {
    implementation 'com.google.android.material:material:1.9.0'
}
```

### 5.2 常用 Material 组件

```xml
<!-- 1. Button 系列 -->
<!-- Filled Button -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Filled"
    style="@style/Widget.MaterialComponents.Button" />

<!-- Outlined Button -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Outlined"
    style="@style/Widget.MaterialComponents.Button.OutlinedButton" />

<!-- Text Button -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Text"
    style="@style/Widget.MaterialComponents.Button.TextButton" />

<!-- 2. CardView -->
<com.google.android.material.card.MaterialCardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:cardElevation="4dp"
    app:cardCornerRadius="8dp">
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Card Title"
            style="@style/TextAppearance.MaterialComponents.Headline6" />
        
    </LinearLayout>
</com.google.android.material.card.MaterialCardView>

<!-- 3. Snackbar -->
<!-- 在代码中使用 -->
Snackbar.make(anchorView, "Message", Snackbar.LENGTH_SHORT).show()

<!-- 4. Floating Action Button -->
<com.google.android.material.floatingactionbutton.FloatingActionButton
    android:id="@+id/fab"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:src="@drawable/ic_add"
    app:layout_anchor="@id/recyclerView"
    app:layout_anchorGravity="bottom|end"
    app:tint="@color/white" />

<!-- 5. AppBarLayout + Toolbar -->
<com.google.android.material.appbar.AppBarLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content">
    
    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/toolbar"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        app:title="Title"
        app:navigationIcon="@drawable/ic_back" />
    
</com.google.android.material.appbar.AppBarLayout>

<!-- 6. BottomNavigationView -->
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottomNav"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_gravity="bottom"
    app:menu="@menu/bottom_nav_menu" />

<!-- 7. TabLayout -->
<com.google.android.material.tabs.TabLayout
    android:id="@+id/tabLayout"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

<com.google.android.material.tabs.TabLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:tabMode="scrollable"
    app:tabGravity="fill" />

<!-- 8. Chip -->
<com.google.android.material.chip.Chip
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Chip"
    app:chipIcon="@drawable/ic_chip" />

<!-- 9. TextInputLayout -->
<com.google.android.material.textfield.TextInputLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:hintTextAppearance="@style/CustomHint">
    
    <com.google.android.material.textfield.TextInputEditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Enter text" />
    
</com.google.android.material.textfield.TextInputLayout>

<!-- 10. CircularProgressIndicator -->
<com.google.android.material.progressindicator.CircularProgressIndicator
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- 11. LinearProgressIndicator -->
<com.google.android.material.progressindicator.LinearProgressIndicator
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

<!-- 12. Switch -->
<com.google.android.material.switchmaterial.SwitchMaterial
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:checked="true" />

<!-- 13. Checkbox -->
<com.google.android.material.checkbox.MaterialCheckBox
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Checkbox" />

<!-- 14. RadioButton -->
<com.google.android.material.radiobutton.MaterialRadioButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Option" />

<!-- 15. Slider -->
<com.google.android.material.slider.Slider
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:value="50" />

<!-- 16. NavigationRail -->
<com.google.android.material.navigationrail.NavigationRailView
    android:layout_width="wrap_content"
    android:layout_height="match_parent"
    app:menu="@menu/navigation_rail_menu" />

<!-- 17. NavigationView -->
<com.google.android.material.navigation.NavigationView
    android:layout_width="wrap_content"
    android:layout_height="match_parent"
    app:headerLayout="@layout/nav_header"
    app:menu="@menu/nav_menu" />

<!-- 18. BottomSheetDialog -->
<!-- 在代码中使用 -->
val bottomSheet = BottomSheetDialog(this)
bottomSheet.setContentView(R.layout.bottom_sheet)
bottomSheet.show()

<!-- 19. Text Input -->
<com.google.android.material.textfield.TextInputEditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Email"
    android:inputType="textEmailAddress" />

<!-- 20. AutoCompleteTextView -->
<com.google.android.material.autocomplete.AutoCompleteTextView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Search" />
```

### 5.3 自定义 Material 组件样式

```xml
<!-- 自定义 Button 样式 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <item name="buttonStyle">@style/AppButton</item>
    <item name="fabStyle">@style/AppFAB</item>
    <item name="cardViewStyle">@style/AppCardView</item>
</style>

<style name="AppButton" parent="Widget.MaterialComponents.Button">
    <item name="backgroundTint">@color/primary</item>
    <item name="cornerRadius">8dp</item>
    <item name="android:textColor">@color/white</item>
    <item name="android:textAllCaps">false</item>
</style>

<style name="AppOutlinedButton" parent="Widget.MaterialComponents.Button.OutlinedButton">
    <item name="strokeColor">@color/primary</item>
    <item name="android:textColor">@color/primary</item>
    <item name="cornerRadius">8dp</item>
</style>

<style name="AppFAB" parent="Widget.MaterialComponents.FloatingActionButton">
    <item name="backgroundTint">@color/primary</item>
    <item name="tint">@color/white</item>
    <item name="elevation">6dp</item>
</style>

<style name="AppCardView" parent="Widget.MaterialComponents.CardView">
    <item name="cardBackgroundColor">@color/surface</item>
    <item name="cardCornerRadius">8dp</item>
    <item name="cardElevation">2dp</item>
</style>

<style name="AppChip" parent="Widget.MaterialComponents.Chip.Choice">
    <item name="chipBackgroundColor">@color/primary</item>
    <item name="chipIconTint">@color/white</item>
    <item name="textEndPadding">8dp</item>
    <item name="textStartPadding">8dp</item>
</style>
```

### 5.4 Material Design 3 (Material You)

```xml
<!-- Material Design 3 主题 -->
<style name="AppTheme" parent="Theme.Material3.DayNight.DarkActionBar">
    <!-- Material 3 颜色属性 -->
    <item name="colorPrimary">@color/md_theme_primary</item>
    <item name="colorOnPrimary">@color/md_theme_on_primary</item>
    <item name="colorPrimaryContainer">@color/md_theme_primary_container</item>
    <item name="colorOnPrimaryContainer">@color/md_theme_on_primary_container</item>
    
    <item name="colorSecondary">@color/md_theme_secondary</item>
    <item name="colorOnSecondary">@color/md_theme_on_secondary</item>
    
    <item name="colorTertiary">@color/md_theme_tertiary</item>
    <item name="colorOnTertiary">@color/md_theme_on_tertiary</item>
    
    <item name="colorError">@color/md_theme_error</item>
    <item name="colorOnError">@color/md_theme_on_error</item>
    
    <item name="android:colorBackground">@color/md_theme_background</item>
    <item name="colorOnBackground">@color/md_theme_on_background</item>
    
    <item name="colorSurface">@color/md_theme_surface</item>
    <item name="colorOnSurface">@color/md_theme_on_surface</item>
    
    <item name="colorSurfaceVariant">@color/md_theme_surface_variant</item>
    <item name="colorOnSurfaceVariant">@color/md_theme_on_surface_variant</item>
</style>

<!-- 使用 Material 3 组件 -->
<!-- Button -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Filled"
    style="@style/Widget.Material3.Button" />

<!-- Outlined Button -->
<Button
    style="@style/Widget.Material3.Button.OutlinedButton" />

<!-- Elevated Button -->
<Button
    style="@style/Widget.Material3.Button.ElevatedButton" />

<!-- Text Button -->
<Button
    style="@style/Widget.Material3.Button.TextButton" />

<!-- Filled Tonal Button -->
<Button
    style="@style/Widget.Material3.Button.TonalButton" />
```

---

## 6. Toolbar 使用

### 6.1 基础 Toolbar 配置

```xml
<!-- 布局文件 -->
<androidx.appcompat.widget.Toolbar
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    android:background="?attr/colorPrimary"
    android:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar"
    app:popupTheme="@style/ThemeOverlay.AppCompat.Light"
    app:title="@string/app_name" />
```

```kotlin
class MyActivity : AppCompatActivity() {
    
    private lateinit var toolbar: Toolbar
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        
        // 设置标题
        supportActionBar?.title = "My Title"
        
        // 设置副标题
        supportActionBar?.subtitle = "My Subtitle"
        
        // 显示返回按钮
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        
        // 自定义返回按钮图标
        supportActionBar?.setHomeAsUpIndicator(R.drawable.ic_back)
    }
    
    // 处理返回按钮点击
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressedDispatcher.onBackPressed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
```

### 6.2 自定义 Toolbar

```xml
<!-- 自定义 Toolbar 布局 -->
<androidx.appcompat.widget.Toolbar
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    android:background="@drawable/toolbar_background">
    
    <!-- 左侧 Logo -->
    <ImageView
        android:id="@+id/toolbarLogo"
        android:layout_width="32dp"
        android:layout_height="32dp"
        android:layout_gravity="start"
        android:src="@drawable/ic_logo" />
    
    <!-- 标题 -->
    <TextView
        android:id="@+id/toolbarTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="Title"
        android:textColor="@color/white"
        android:textSize="18sp"
        android:textStyle="bold" />
    
    <!-- 右侧菜单 -->
    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="end"
        android:gravity="center_vertical">
        
        <ImageView
            android:id="@+id/toolbarSearch"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:padding="8dp"
            android:src="@drawable/ic_search" />
        
        <ImageView
            android:id="@+id/toolbarMenu"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:padding="8dp"
            android:src="@drawable/ic_menu" />
        
    </LinearLayout>
    
</androidx.appcompat.widget.Toolbar>
```

```kotlin
class MyActivity : AppCompatActivity() {
    
    private lateinit var toolbar: Toolbar
    private lateinit var toolbarTitle: TextView
    private lateinit var toolbarSearch: ImageView
    private lateinit var toolbarMenu: ImageView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        toolbar = findViewById(R.id.toolbar)
        toolbarTitle = findViewById(R.id.toolbarTitle)
        toolbarSearch = findViewById(R.id.toolbarSearch)
        toolbarMenu = findViewById(R.id.toolbarMenu)
        
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(false)  // 隐藏默认标题
        
        // 设置自定义标题
        toolbarTitle.text = "Custom Title"
        
        // 设置点击事件
        toolbarSearch.setOnClickListener {
            // 搜索
        }
        
        toolbarMenu.setOnClickListener {
            // 菜单
        }
        
        // 设置返回按钮
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressedDispatcher.onBackPressed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
```

### 6.3 Toolbar 与 Navigation

```kotlin
class MyActivity : AppCompatActivity() {
    
    private lateinit var toolbar: Toolbar
    private lateinit var navController: NavController
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        
        // 获取 NavController
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController
        
        // 配置 Toolbar 与 Navigation 集成
        setupNavigation(toolbar)
    }
    
    private fun setupNavigation(toolbar: Toolbar) {
        val appBarConfiguration = AppBarConfiguration(
            setOf(R.id.navigation_home, R.id.navigation_dashboard, R.id.navigation_notifications)
        )
        
        NavigationUI.setupWithNavController(toolbar, navController, appBarConfiguration)
        
        // 自动处理返回按钮
        // 在导航栈顶部时隐藏，否则显示
    }
}
```

### 6.4 Toolbar 菜单

```xml
<!-- menu/toolbar_menu.xml -->
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">
    
    <!-- 始终显示在 Toolbar 上 -->
    <item
        android:id="@+id/action_search"
        android:icon="@drawable/ic_search"
        android:title="Search"
        app:showAsAction="ifRoom" />
    
    <!-- 如果空间足够则显示 -->
    <item
        android:id="@+id/action_share"
        android:icon="@drawable/ic_share"
        android:title="Share"
        app:showAsAction="ifRoom" />
    
    <!-- 总是显示在溢出菜单中 -->
    <item
        android:id="@+id/action_settings"
        android:title="Settings"
        app:showAsAction="never" />
    
    <!-- 子菜单 -->
    <item
        android:id="@+id/action_more"
        android:title="More"
        app:showAsAction="never">
        <menu>
            <item
                android:id="@+id/action_about"
                android:title="About" />
            <item
                android:id="@+id/action_help"
                android:title="Help" />
        </menu>
    </item>
    
    <!-- 可编辑菜单项 -->
    <item
        android:id="@+id/action_edit"
        android:icon="@drawable/ic_edit"
        android:title="Edit"
        app:showAsAction="ifRoom"
        app:alphabeticShortcut="e" />
    
</menu>
```

```kotlin
class MyActivity : AppCompatActivity() {
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.toolbar_menu, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_search -> {
                // 搜索
                true
            }
            R.id.action_share -> {
                // 分享
                true
            }
            R.id.action_settings -> {
                // 设置
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    // 菜单准备
    override fun onPrepareOptionsMenu(menu: Menu): Boolean {
        // 根据状态显示/隐藏菜单项
        val showEdit = shouldShowEdit()
        menu.findItem(R.id.action_edit)?.isVisible = showEdit
        
        return true
    }
}
```

---

## 7. 返回按钮处理

### 7.1 使用 onBackPressedDispatcher

```kotlin
// AndroidX 推荐的返回按钮处理方式
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        
        // 设置返回按钮点击
        toolbar.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }
    
    // 添加返回回调
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        onBackPressedDispatcher.addCallback(this) {
            // 处理返回逻辑
            if (canGoBack()) {
                goBack()
            } else {
                finish()
            }
        }
    }
}
```

### 7.2 处理 Fragment 返回

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 添加返回回调处理 Fragment 返回
        onBackPressedDispatcher.addCallback(this) {
            val navController = findNavController(R.id.nav_host_fragment)
            
            if (navController.popBackStack()) {
                // Fragment 返回栈处理成功
            } else {
                // 没有 Fragment 可返回，退出 Activity
                finish()
            }
        }
    }
}
```

### 7.3 处理 Dialog/BottomSheet 返回

```kotlin
class MyActivity : AppCompatActivity() {
    
    private var currentDialog: Dialog? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // 检查是否有 Dialog 显示
                currentDialog?.let { dialog ->
                    if (dialog.isShowing) {
                        dialog.dismiss()
                        return
                    }
                }
                
                // 检查是否有 BottomSheet 显示
                val bottomSheet = findBottomSheet()
                bottomSheet?.let {
                    if (it.isVisible) {
                        it.hide()
                        return
                    }
                }
                
                // 处理 Fragment 返回
                val navController = findNavController(R.id.nav_host_fragment)
                if (navController.popBackStack()) {
                    return
                }
                
                // 退出 Activity
                finish()
            }
        })
    }
    
    private fun showDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_content)
        currentDialog = dialog
        dialog.show()
    }
}
```

### 7.4 使用 Navigation 处理返回

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var navController: NavController
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        navController = findNavController(R.id.nav_host_fragment)
        
        // 配置返回按钮
        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        
        NavigationUI.setupWithNavController(toolbar, navController)
        
        // 返回按钮由 NavigationUI 自动处理
    }
}
```

### 7.5 自定义返回逻辑

```kotlin
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 添加多个返回回调，按优先级处理
        // 1. 处理 WebView 返回
        webViewBackCallback?.isEnabled = webView.canGoBack()
        
        // 2. 处理视频播放返回
        videoPlayerBackCallback?.isEnabled = isVideoPlaying
        
        // 3. 处理 Fragment 返回
        fragmentBackCallback?.isEnabled = true
    }
    
    private val webViewBackCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            webView.goBack()
            isEnabled = webView.canGoBack()
        }
    }
    
    private val videoPlayerBackCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            stopVideo()
            isEnabled = false
        }
    }
    
    private val fragmentBackCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            val navController = findNavController(R.id.nav_host_fragment)
            if (!navController.popBackStack()) {
                finish()
            }
        }
    }
}
```

---

## 8. 兼容性处理

### 8.1 支持的最低 API

```groovy
android {
    defaultConfig {
        minSdk 21  // 使用 Material 组件最低支持 API 21
        targetSdk 34
    }
}
```

```xml
<!-- AppCompat 支持 API 7+ -->
<!-- Material Components 支持 API 14+ -->
<!-- Material 3 支持 API 21+ -->
```

### 8.2 处理 API 差异

```kotlin
// 使用 Build.VERSION 检查 API
class MyActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // API 29+ 特性
            useNewFeature()
        } else {
            // 旧版本兼容处理
            useLegacyFeature()
        }
    }
}

// 使用 androidx 的兼容库
// 使用 AlertDialog 而不是原生 Dialog
val dialog = AlertDialog.Builder(this)
    .setTitle("Title")
    .setMessage("Message")
    .setPositiveButton("OK", null)
    .create()

// 使用 Toolbar 而不是原生 ActionBar
setSupportActionBar(toolbar)

// 使用 CardView 而不是自定义背景
val cardView = MaterialCardView(this)
```

### 8.3 资源文件兼容

```xml
<!-- 为不同 API 提供不同资源 -->
<!-- res/values/strings.xml (默认) -->
<string name="feature_name">Feature</string>

<!-- res/values-21/strings.xml (API 21+) -->
<string name="feature_name">New Feature</string>

<!-- res/values-v31/strings.xml (API 31+) -->
<string name="feature_name">Latest Feature</string>
```

### 8.4 处理主题兼容

```xml
<!-- 为旧版本提供兼容主题 -->
<!-- res/values/themes.xml -->
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <!-- 兼容旧版本 -->
</style>

<!-- res/values-v21/themes.xml (API 21+) -->
<style name="AppTheme" parent="Theme.MaterialComponents.Light.DarkActionBar">
    <!-- 使用 Material Design -->
</style>

<!-- res/values-v31/themes.xml (API 31+) -->
<style name="AppTheme" parent="Theme.Material3.Light.DarkActionBar">
    <!-- 使用 Material Design 3 -->
</style>
```

### 8.5 处理动画兼容

```kotlin
// 使用 AppCompat 提供的动画
// 而不是原生动画
import androidx.core.content.ContextCompat

val animator = ContextCompat.getDrawable(this, R.anim.fade_in)

// 使用 ObjectAnimator 进行兼容动画
ObjectAnimator.ofFloat(view, View.ALPHA, 0f, 1f).apply {
    duration = 300
    start()
}
```

---

## 9. 面试考点

### 基础考点

#### 1. 为什么要使用 AppCompatActivity 而不是 Activity？

```
答案要点：
- 提供 ActionBar 兼容支持（API 7+）
- 提供 Theme 兼容性支持
- 提供 Material 组件支持
- 提供深色模式支持
- 更好的向后兼容性
```

#### 2. AppCompatDelegate 的作用是什么？

```
答案要点：
- 管理 ActionBar
- 应用主题
- 处理深色模式
- 提供兼容 API
```

#### 3. 如何实现深色模式？

```xml
<!-- 1. 使用 DayNight 主题 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
</style>

<!-- 2. 创建 values-night 目录 -->
<!-- res/values/colors.xml -->
<!-- res/values-night/colors.xml -->

<!-- 3. 代码控制 -->
AppCompatDelegate.setDefaultNightMode(mode)
```

#### 4. Toolbar 如何设置？

```kotlin
val toolbar = findViewById<Toolbar>(R.id.toolbar)
setSupportActionBar(toolbar)
supportActionBar?.title = "Title"
supportActionBar?.setDisplayHomeAsUpEnabled(true)
```

### 进阶考点

#### 5. Material Components 有哪些常用组件？

```
答案要点：
- Button 系列 (Filled, Outlined, Text)
- CardView
- FloatingActionButton
- Snackbar
- BottomNavigationView
- TabLayout
- Chip
- TextInputLayout
- ProgressBar
- Switch/Checkbox/RadioButton
```

#### 6. 如何处理返回按钮？

```kotlin
// 使用 onBackPressedDispatcher
onBackPressedDispatcher.addCallback(this) {
    // 处理返回逻辑
}

// 使用 NavigationUI
NavigationUI.setupWithNavController(toolbar, navController)
```

#### 7. 自定义 Toolbar 的方法？

```
1. 使用自定义布局
2. 隐藏默认标题，使用自定义 TextView
3. 使用 Menu 添加菜单项
4. 使用 NavigationIcon 设置返回按钮
```

### 高级考点

#### 8. AppCompat 的工作原理？

```
答案要点：
1. 在运行时检测 Android 版本
2. 使用兼容代码提供统一 API
3. 通过 Delegate 模式实现功能
4. 主题通过 Style 和 Theme 属性应用
```

#### 9. Material Design 2 vs Material Design 3？

```
Material Design 2:
- 固定的颜色方案
- 有限的动态取色
- 标准的组件样式

Material Design 3:
- 动态取色 (Material You)
- 更多颜色变体
- 改进的组件设计
- 更好的可访问性
```

#### 10. 如何优化 AppCompat 性能？

```
1. 避免不必要的主题切换
2. 减少 Toolbar 的重建
3. 使用合适的最小 API 版本
4. 避免在旧设备上使用高版本特性
5. 合理使用深色模式资源
```

---

## 10. 参考资料

### 官方文档

- [AndroidX AppCompat](https://developer.android.com/jetpack/androidx/releases/appcompat)
- [Material Components for Android](https://github.com/material-components/material-components-android)
- [Material Design Guidelines](https://material.io/design)

### 推荐资源

- [Android Developers Guide](https://developer.android.com/guide)
- [Material Design 3](https://m3.material.io/)

---

*本文完，感谢阅读！*
