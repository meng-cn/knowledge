# Toolbar 详解

> **字数统计：约 8000 字**  
> **难度等级：⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [Toolbar 简介](#1-toolbar-简介)
2. [基础使用](#2-基础使用)
3. [自定义 Toolbar](#3-自定义-toolbar)
4. [与 Navigation 集成](#4-与-navigation-集成)
5. [面试考点](#5-面试考点)

---

## 1. Toolbar 简介

### 1.1 什么是 Toolbar

```
Toolbar 是 ActionBar 的现代化替代：
- 更灵活的位置（不一定在顶部）
- 更好的自定义能力
- Material Design 标准组件
- 支持更多功能
```

### 1.2 Toolbar vs ActionBar

| 特性 | ActionBar | Toolbar |
|------|-----------|---------|
| 位置 | 只能顶部 | 任意位置 |
| 自定义 | 有限 | 高度灵活 |
| 多 Toolbar | ❌ 不支持 | ✅ 支持 |
| 推荐程度 | ❌ 不推荐 | ✅ 推荐 |

---

## 2. 基础使用

### 2.1 添加依赖

```gradle
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.10.0'
}
```

### 2.2 布局配置

```xml
<!-- activity_main.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/toolbar"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        android:background="?attr/colorPrimary"
        app:title="@string/app_name"
        app:titleTextColor="@android:color/white"
        app:navigationIcon="@drawable/ic_menu" />

    <!-- 内容 -->
    <FrameLayout
        android:id="@+id/content"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

### 2.3 Activity 配置

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var toolbar: MaterialToolbar
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        toolbar = findViewById(R.id.toolbar)
        
        // 设置为 ActionBar
        setSupportActionBar(toolbar)
        
        // 配置 ActionBar
        supportActionBar?.apply {
            title = "My App"
            subtitle = "Subtitle"
            setDisplayHomeAsUpEnabled(true)
            setHomeAsUpIndicator(R.drawable.ic_menu)
        }
        
        // 设置导航点击
        toolbar.setNavigationOnClickListener {
            // 处理导航点击
            finish()
        }
    }
    
    // 处理菜单点击
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

### 2.4 菜单配置

```xml
<!-- res/menu/toolbar_menu.xml -->
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">

    <!-- 始终显示 -->
    <item
        android:id="@+id/action_search"
        android:icon="@drawable/ic_search"
        android:title="Search"
        app:showAsAction="ifRoom" />

    <!-- 溢出菜单 -->
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

</menu>
```

```kotlin
class MainActivity : AppCompatActivity() {
    
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
            R.id.action_settings -> {
                // 设置
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
```

---

## 3. 自定义 Toolbar

### 3.1 自定义布局

```xml
<!-- 自定义 Toolbar 布局 -->
<com.google.android.material.appbar.MaterialToolbar
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    android:background="@drawable/toolbar_gradient">

    <!-- Logo -->
    <ImageView
        android:id="@+id/toolbarLogo"
        android:layout_width="40dp"
        android:layout_height="40dp"
        android:layout_gravity="start"
        android:src="@drawable/ic_logo" />

    <!-- 标题 -->
    <TextView
        android:id="@+id/toolbarTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="My App"
        android:textColor="@color/white"
        android:textSize="18sp"
        android:textStyle="bold" />

    <!-- 右侧操作 -->
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

</com.google.android.material.appbar.MaterialToolbar>
```

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        val toolbarTitle = findViewById<TextView>(R.id.toolbarTitle)
        val toolbarSearch = findViewById<ImageView>(R.id.toolbarSearch)
        val toolbarMenu = findViewById<ImageView>(R.id.toolbarMenu)
        
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(false)
        
        toolbarTitle.text = "Custom Title"
        
        toolbarSearch.setOnClickListener {
            // 搜索
        }
        
        toolbarMenu.setOnClickListener {
            // 菜单
        }
    }
}
```

### 3.2 主题配置

```xml
<!-- themes.xml -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <!-- 关闭默认 ActionBar -->
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>
    
    <!-- Toolbar 样式 -->
    <item name="toolbarStyle">@style/CustomToolbar</item>
</style>

<style name="CustomToolbar" parent="Widget.MaterialComponents.Toolbar.Primary">
    <item name="android:background">?attr/colorPrimary</item>
    <item name="titleTextColor">@android:color/white</item>
    <item name="navigationIconTint">@android:color/white</item>
</style>
```

### 3.3 CollapsingToolbar

```xml
<!-- 可折叠 Toolbar -->
<com.google.android.material.appbar.AppBarLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <com.google.android.material.appbar.CollapsingToolbarLayout
        android:layout_width="match_parent"
        android:layout_height="200dp"
        app:layout_scrollFlags="scroll|exitUntilCollapsed">

        <ImageView
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:scaleType="centerCrop"
            android:src="@drawable/header_image"
            app:layout_collapseMode="parallax" />

        <com.google.android.material.appbar.MaterialToolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:layout_collapseMode="pin" />

    </com.google.android.material.appbar.CollapsingToolbarLayout>

</com.google.android.material.appbar.AppBarLayout>
```

```kotlin
class DetailActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detail)
        
        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        val collapsingToolbar = findViewById<CollapsingToolbarLayout>(R.id.collapsingToolbar)
        
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        
        collapsingToolbar.title = "Detail Page"
        
        // 监听折叠状态
        appBarLayout.addOnOffsetChangedListener { appBarLayout, verticalOffset ->
            val scrollRange = appBarLayout.totalScrollRange
            val progress = 1 - Math.abs(verticalOffset) / scrollRange.toFloat()
            // 根据进度更新 UI
        }
    }
}
```

---

## 4. 与 Navigation 集成

### 4.1 基础集成

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var toolbar: MaterialToolbar
    private lateinit var navController: NavController
    private lateinit var appBarConfiguration: AppBarConfiguration
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        
        // 配置 Navigation
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController
        
        // 配置顶级目的地
        appBarConfiguration = AppBarConfiguration(
            setOf(R.id.home, R.id.dashboard, R.id.notifications)
        )
        
        // 集成 Toolbar 和 Navigation
        NavigationUI.setupWithNavController(toolbar, navController, appBarConfiguration)
    }
    
    // 处理返回按钮
    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }
}
```

### 4.2 动态标题

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val navController = findNavController(R.id.nav_host_fragment)
        
        // 监听目的地变化
        navController.addOnDestinationChangedListener { _, destination, _ ->
            when (destination.id) {
                R.id.home -> {
                    supportActionBar?.title = "Home"
                }
                R.id.detail -> {
                    supportActionBar?.title = "Detail"
                }
                R.id.settings -> {
                    supportActionBar?.title = "Settings"
                }
            }
        }
    }
}
```

---

## 5. 面试考点

### 5.1 基础概念

**Q1: Toolbar 和 ActionBar 的区别？**

```
答案要点：
- Toolbar 更灵活（位置、样式）
- Toolbar 支持自定义布局
- Toolbar 支持多个实例
- ActionBar 是系统级，Toolbar 是普通 View
```

**Q2: 如何设置 Toolbar 为 ActionBar？**

```kotlin
val toolbar = findViewById<Toolbar>(R.id.toolbar)
setSupportActionBar(toolbar)
```

### 5.2 实战问题

**Q3: 如何实现返回按钮？**

```kotlin
supportActionBar?.setDisplayHomeAsUpEnabled(true)

override fun onOptionsItemSelected(item: MenuItem): Boolean {
    return when (item.itemId) {
        android.R.id.home -> {
            onBackPressedDispatcher.onBackPressed()
            true
        }
        else -> super.onOptionsItemSelected(item)
    }
}
```

**Q4: 如何与 Navigation 集成？**

```kotlin
val appBarConfiguration = AppBarConfiguration(
    setOf(R.id.home, R.id.dashboard)
)

NavigationUI.setupWithNavController(toolbar, navController, appBarConfiguration)
```

### 5.3 高级问题

**Q5: CollapsingToolbarLayout 的作用？**

```
答案要点：
- 实现可折叠的 Toolbar
- 滚动时收缩/展开
- 配合 AppBarLayout 使用
- 支持视差滚动效果
```

---

## 参考资料

- [Material Toolbar](https://material.io/components/app-bars-top)
- [ActionBar 迁移指南](https://developer.android.com/guide/topics/ui/actionbar)

---

*本文完，感谢阅读！*
