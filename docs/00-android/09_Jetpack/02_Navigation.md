# 02_Navigation.md - Navigation 导航组件

## 目录
1. [Navigation 概述](#navigation-概述)
2. [Navigation Graph 配置](#navigation-graph-配置)
3. [NavHostFragment](#navhostfragment)
4. [SafeArgs 传递数据](#safeargs-传递数据)
5. [DeepLink 处理](#deeplink-处理)
6. [底部导航集成](#底部导航集成)
7. [动画配置](#动画配置)
8. [面试考点](#面试考点)
9. [最佳实践与常见错误](#最佳实践与常见错误)
10. [参考资料](#参考资料)

---

## Navigation 概述

### 什么是 Navigation 组件？

Navigation 是 Android Jetpack 的一部分，用于简化应用内的导航实现。它提供了一套统一的框架来管理 Fragment 事务、Back Stack、Deep Link 等导航相关功能。

**核心优势：**
- 可视化编辑导航图（Navigation Graph）
- 自动处理 Fragment 事务和 Back Stack
- 类型安全的参数传递（SafeArgs）
- 简化 Deep Link 实现
- 内置动画支持
- 与 BottomNavigationView 无缝集成

### Navigation 三大核心组件

```
┌─────────────────────────────────────────────────────────┐
│                    Navigation 架构                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   NavGraph   │───▶│  NavHost     │───▶│NavController│ │
│  │  (导航图)     │    │  (宿主)       │    │ (控制器)   │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                   │                   │       │
│         ▼                   ▼                   ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  destinations │    │  Fragment    │    │ navigate()│ │
│  │  (目的地)     │    │  Container   │    │ popBackStack││
│  └──────────────┘    └──────────────┘    └───────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. **Navigation Graph（导航图）**：XML 资源文件，定义所有导航目的地和可能的操作
2. **NavHost（导航宿主）**：显示导航目的地的容器，通常是 `NavHostFragment`
3. **NavController（导航控制器）**：管理应用导航的类，控制导航行为

### 添加依赖

```gradle
// app/build.gradle
dependencies {
    // Navigation Fragment
    implementation "androidx.navigation:navigation-fragment-ktx:2.7.7"
    
    // Navigation UI（与 BottomNavigationView 等集成）
    implementation "androidx.navigation:navigation-ui-ktx:2.7.7"
    
    // SafeArgs（类型安全参数传递）
    // 在 project-level build.gradle 中配置
}
```

---

## Navigation Graph 配置

### 创建 Navigation Graph

在 `res/navigation/` 目录下创建导航图 XML 文件：

```xml
<!-- res/navigation/nav_graph.xml -->
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">

    <!-- 首页 Fragment -->
    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.app.ui.HomeFragment"
        android:label="@string/home"
        tools:layout="@layout/fragment_home">
        
        <!-- 动作：跳转到详情页 -->
        <action
            android:id="@+id/action_homeFragment_to_detailFragment"
            app:destination="@id/detailFragment"
            app:enterAnim="@anim/nav_enter"
            app:exitAnim="@anim/nav_exit"
            app:popEnterAnim="@anim/nav_pop_enter"
            app:popExitAnim="@anim/nav_pop_exit" />
            
        <!-- 参数定义（配合 SafeArgs） -->
        <argument
            android:name="userId"
            app:argType="string"
            android:defaultValue="0" />
    </fragment>

    <!-- 详情页 Fragment -->
    <fragment
        android:id="@+id/detailFragment"
        android:name="com.example.app.ui.DetailFragment"
        android:label="@string/detail"
        tools:layout="@layout/fragment_detail">
        
        <argument
            android:name="itemId"
            app:argType="long" />
        <argument
            android:name="itemTitle"
            app:argType="string"
            app:nullable="true" />
            
        <action
            android:id="@+id/action_detailFragment_to_homeFragment"
            app:destination="@id/homeFragment"
            app:popUpTo="@id/homeFragment"
            app:popUpToInclusive="false" />
    </fragment>

    <!-- 设置页 Fragment -->
    <fragment
        android:id="@+id/settingsFragment"
        android:name="com.example.app.ui.SettingsFragment"
        android:label="@string/settings"
        tools:layout="@layout/fragment_settings" />

    <!-- Activity 作为目的地 -->
    <activity
        android:id="@+id/detailActivity"
        android:name="com.example.app.ui.DetailActivity"
        android:label="@string/detail_activity" />

    <!-- 嵌套导航图（用于 Bottom Navigation） -->
    <navigation
        android:id="@+id/home_nav_graph"
        app:startDestination="@id/homeListFragment">
        
        <fragment
            android:id="@+id/homeListFragment"
            android:name="com.example.app.ui.HomeListFragment"
            android:label="列表" />
            
        <fragment
            android:id="@+id/homeDetailFragment"
            android:name="com.example.app.ui.HomeDetailFragment"
            android:label="详情" />
    </navigation>

</navigation>
```

### Navigation Graph 属性说明

| 属性 | 说明 |
|------|------|
| `android:id` | 导航图的唯一标识 |
| `app:startDestination` | 起始目的地 ID |
| `android:name` | Fragment/Activity 的完整类名 |
| `android:label` | 目的地标签（可用于 Toolbar 标题） |
| `tools:layout` | 预览时显示的布局 |
| `app:destination` | 动作的目标目的地 |
| `app:popUpTo` | 弹出到指定目的地 |
| `app:popUpToInclusive` | 是否包含 popUpTo 指定的目的地 |
| `app:enterAnim/exitAnim` | 进入/退出动画 |
| `app:popEnterAnim/popExitAnim` | 返回时的进入/退出动画 |

### 动态创建 Navigation Graph

```kotlin
// 在代码中动态构建导航图
val navGraph = NavGraph(NavInflater(context, resources).inflate(R.navigation.nav_graph))

// 设置起始目的地
navGraph.setStartDestination(R.id.loginFragment)

// 设置给 NavController
navController.graph = navGraph
```

### 多个 Navigation Graph

对于复杂应用，可以使用多个导航图：

```kotlin
// 主导航图
val navGraph = navController.navInflater.inflate(R.navigation.nav_graph_main)

// 嵌套导航图
val homeNavGraph = navController.navInflater.inflate(R.navigation.nav_graph_home)
navGraph.addNavigation(homeNavGraph)

navController.graph = navGraph
```

---

## NavHostFragment

### 基本用法

`NavHostFragment` 是 Navigation 组件提供的 Fragment 容器，用于显示导航目的地。

```xml
<!-- activity_main.xml -->
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.fragment.app.FragmentContainerView
        android:id="@+id/nav_host_fragment"
        android:name="androidx.navigation.fragment.NavHostFragment"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:defaultNavHost="true"
        app:navGraph="@navigation/nav_graph"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 属性说明

| 属性 | 说明 |
|------|------|
| `android:name` | 必须设置为 `androidx.navigation.fragment.NavHostFragment` |
| `app:navGraph` | 关联的导航图资源 |
| `app:defaultNavHost="true"` | 拦截系统返回键，交由 NavController 处理 |
| `android:id` | Fragment 容器 ID |

### 在代码中获取 NavController

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var navController: NavController
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 方式 1：通过 NavHostFragment 获取
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController
        
        // 方式 2：通过 Navigation.findNavController (已废弃)
        // navController = Navigation.findNavController(this, R.id.nav_host_fragment)
        
        // 方式 3：通过 View 获取
        // navController = findNavController(R.id.nav_host_fragment)
    }
    
    // 处理返回键
    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp() || super.onSupportNavigateUp()
    }
}
```

### 在 Fragment 中获取 NavController

```kotlin
class HomeFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 方式 1：通过 View 扩展
        val navController = findNavController()
        
        // 方式 2：通过 Navigation.findNavController
        val navController = Navigation.findNavController(view)
        
        // 方式 3：通过 Activity 获取
        val navController = (activity as MainActivity).navController
        
        // 导航
        navController.navigate(R.id.action_homeFragment_to_detailFragment)
    }
}
```

### 自定义 NavHost

如果需要自定义 NavHost，可以继承 `NavHostFragment`：

```kotlin
class CustomNavHostFragment : NavHostFragment() {
    
    override fun createNavController(): NavController {
        val navController = super.createNavController()
        
        // 自定义配置
        navController.addOnDestinationChangedListener { controller, destination, arguments ->
            Log.d("NavHost", "导航到：${destination.label}")
        }
        
        return navController
    }
}
```

---

## SafeArgs 传递数据

### SafeArgs 插件配置

SafeArgs 是 Navigation 的 Gradle 插件，用于生成类型安全的参数传递代码。

**Project-level build.gradle：**

```gradle
buildscript {
    dependencies {
        // 添加 SafeArgs 插件
        classpath "androidx.navigation:navigation-safe-args-gradle-plugin:2.7.7"
    }
}
```

**App-level build.gradle：**

```gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    // 应用 SafeArgs 插件
    id 'androidx.navigation.safeargs.kotlin'
}

dependencies {
    implementation "androidx.navigation:navigation-fragment-ktx:2.7.7"
}
```

### 定义参数

在 Navigation Graph 中定义参数：

```xml
<fragment
    android:id="@+id/detailFragment"
    android:name="com.example.app.ui.DetailFragment"
    android:label="@string/detail">
    
    <!-- 基本类型参数 -->
    <argument
        android:name="itemId"
        app:argType="long"
        android:defaultValue="0L" />
    
    <argument
        android:name="itemTitle"
        app:argType="string"
        app:nullable="true"
        android:defaultValue="@null" />
    
    <!-- 布尔类型 -->
    <argument
        android:name="isFavorite"
        app:argType="boolean"
        android:defaultValue="false" />
    
    <!-- 枚举类型 -->
    <argument
        android:name="sortType"
        app:argType="com.example.app.SortType"
        android:defaultValue="DATE" />
    
    <!-- 自定义 Parcelable 类型 -->
    <argument
        android:name="userData"
        app:argType="com.example.app.model.User"
        app:nullable="true" />
    
    <!-- 引用类型 -->
    <argument
        android:name="callback"
        app:argType="com.example.app.Callback"
        app:nullable="true" />
        
</fragment>
```

### 生成的类

编译后，SafeArgs 会为每个 Fragment 生成两个类：

1. **DetailFragmentArgs**：用于接收参数
2. **DetailFragmentDirections**：用于构建导航动作

### 传递参数

```kotlin
// 方式 1：使用 Directions 类（推荐）
val action = HomeFragmentDirections
    .actionHomeFragmentToDetailFragment(
        itemId = 123L,
        itemTitle = "商品标题",
        isFavorite = true
    )
findNavController().navigate(action)

// 方式 2：使用 Bundle
val bundle = bundleOf(
    "itemId" to 123L,
    "itemTitle" to "商品标题",
    "isFavorite" to true
)
findNavController().navigate(R.id.detailFragment, bundle)

// 方式 3：通过 NavOptions
val navOptions = NavOptions.Builder()
    .setLaunchSingleTop(true)
    .setPopUpTo(R.id.homeFragment, false)
    .build()

findNavController().navigate(
    R.id.action_homeFragment_to_detailFragment,
    bundle,
    navOptions
)
```

### 接收参数

```kotlin
class DetailFragment : Fragment() {
    
    // 方式 1：使用 by navArgs() 委托（推荐）
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 类型安全地访问参数
        val itemId: Long = args.itemId
        val itemTitle: String? = args.itemTitle
        val isFavorite: Boolean = args.isFavorite
        
        textView.text = itemTitle
    }
    
    // 方式 2：手动解析（不推荐）
    /*
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val itemId = arguments?.getLong("itemId") ?: 0L
        val itemTitle = arguments?.getString("itemTitle")
    }
    */
}
```

### 自定义类型转换器

对于复杂类型，可以注册自定义 TypeConverter：

```kotlin
// 定义数据类
@Parcelize
data class User(
    val id: Long,
    val name: String
) : Parcelable

// 在 Navigation Graph 中使用
<argument
    android:name="user"
    app:argType="com.example.app.model.User"
    app:nullable="true" />

// 或者使用 TypeConverter
class UserTypeConverter {
    @TypeConverter
    fun fromUser(user: User): String {
        return "${user.id}:${user.name}"
    }
    
    @TypeConverter
    fun toUser(data: String): User {
        val parts = data.split(":")
        return User(parts[0].toLong(), parts[1])
    }
}
```

---

## DeepLink 处理

### 什么是 DeepLink？

DeepLink 允许用户通过 URL 直接跳转到应用的特定页面。Navigation 组件简化了 DeepLink 的实现。

### 配置 DeepLink

#### 方式 1：在 Navigation Graph 中配置

```xml
<fragment
    android:id="@+id/detailFragment"
    android:name="com.example.app.ui.DetailFragment"
    android:label="@string/detail">
    
    <argument
        android:name="itemId"
        app:argType="long" />
    
    <deepLink
        android:autoVerify="true"
        app:uri="example://detail/{itemId}" />
    
    <!-- 多个 DeepLink -->
    <deepLink
        app:uri="https://www.example.com/detail/{itemId}" />
    
    <!-- 带查询参数的 DeepLink -->
    <deepLink
        app:uri="example://product?id={itemId}&amp;source={source}" />
        
</fragment>
```

#### 方式 2：在代码中配置

```kotlin
val navGraph = navController.navInflater.inflate(R.navigation.nav_graph)

val detailDestination = navGraph.findNode(R.id.detailFragment)
detailDestination.addDeepLink(
    navDeepLink {
        uriPattern = "example://detail/{itemId}"
        action = Intent.ACTION_VIEW
    }
)

navController.graph = navGraph
```

### 处理 DeepLink 参数

```kotlin
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // DeepLink 传递的参数会自动填充到 args 中
        val itemId = args.itemId
        
        // 获取 DeepLink 的 URI
        val uri = requireActivity().intent?.data
        Log.d("DeepLink", "URI: $uri")
    }
}
```

### 配置 AndroidManifest

```xml
<application>
    <activity
        android:name=".ui.MainActivity"
        android:exported="true">
        
        <!-- 主入口 -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
        
        <!-- DeepLink 配置 -->
        <intent-filter android:autoVerify="true">
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            
            <data android:scheme="https" android:host="www.example.com" />
            <data android:scheme="example" android:host="detail" />
        </intent-filter>
        
    </activity>
</application>
```

### App Links（Android 6.0+）

App Links 是 DeepLink 的增强版，支持自动验证域名所有权：

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    
    <data android:scheme="https" 
          android:host="www.example.com" 
          android:pathPrefix="/detail" />
</intent-filter>
```

需要配置 `assetlinks.json` 文件来验证域名所有权。

### 测试 DeepLink

```bash
# 使用 ADB 测试 DeepLink
adb shell am start -W -a android.intent.action.VIEW \
    -d "example://detail/123" com.example.app

# 测试 HTTPS DeepLink
adb shell am start -W -a android.intent.action.VIEW \
    -d "https://www.example.com/detail/123" com.example.app
```

---

## 底部导航集成

### 与 BottomNavigationView 集成

```xml
<!-- activity_main.xml -->
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.fragment.app.FragmentContainerView
        android:id="@+id/nav_host_fragment"
        android:name="androidx.navigation.fragment.NavHostFragment"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:defaultNavHost="true"
        app:navGraph="@navigation/mobile_navigation"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toTopOf="@id/nav_view" />

    <com.google.android.material.bottomnavigation.BottomNavigationView
        android:id="@+id/nav_view"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:background="?android:attr/windowBackground"
        app:menu="@menu/bottom_nav_menu"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 菜单配置

```xml
<!-- res/menu/bottom_nav_menu.xml -->
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/navigation_home"
        android:icon="@drawable/ic_home"
        android:title="@string/home" />
    <item
        android:id="@+id/navigation_dashboard"
        android:icon="@drawable/ic_dashboard"
        android:title="@string/dashboard" />
    <item
        android:id="@+id/navigation_notifications"
        android:icon="@drawable/ic_notifications"
        android:title="@string/notifications" />
</menu>
```

### 在代码中集成

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var navController: NavController
    private lateinit var appBarConfiguration: AppBarConfiguration
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 获取 NavController
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController
        
        // 配置 BottomNavigationView
        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.nav_view)
        
        // 方式 1：使用 NavigationUI 自动设置（推荐）
        bottomNavigationView.setupWithNavController(navController)
        
        // 方式 2：手动监听（需要自定义逻辑时）
        /*
        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    navController.navigate(R.id.homeFragment)
                    true
                }
                R.id.navigation_dashboard -> {
                    navController.navigate(R.id.dashboardFragment)
                    true
                }
                else -> false
            }
        }
        */
        
        // 配置 Toolbar
        appBarConfiguration = AppBarConfiguration(
            setOf(R.id.homeFragment, R.id.dashboardFragment, R.id.notificationsFragment)
        )
        
        setupActionBarWithNavController(navController, appBarConfiguration)
    }
    
    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }
}
```

### 与 NavigationRail 集成

```xml
<!-- 适用于平板等大屏设备 -->
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.navigation.ui.NavigationRailView
        android:id="@+id/nav_rail"
        android:layout_width="wrap_content"
        android:layout_height="match_parent"
        app:menu="@menu/bottom_nav_menu"
        app:headerLayout="@layout/nav_rail_header" />

    <androidx.fragment.app.FragmentContainerView
        android:id="@+id/nav_host_fragment"
        android:name="androidx.navigation.fragment.NavHostFragment"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:navGraph="@navigation/mobile_navigation"
        app:defaultNavHost="true" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

```kotlin
// 在代码中集成
val navRail = findViewById<NavigationRailView>(R.id.nav_rail)
navRail.setupWithNavController(navController)
```

### 处理 Fragment 重建问题

BottomNavigationView 切换时，默认会重建 Fragment。可以通过以下方式避免：

```kotlin
// 方式 1：使用 NavigationUI 的默认行为（已优化）
bottomNavigationView.setupWithNavController(navController)

// 方式 2：自定义 ItemReselectedListener
bottomNavigationView.setOnItemReselectedListener { item ->
    // 点击已选中的 item 时的处理
    // 默认不执行导航，避免重建 Fragment
}

// 方式 3：使用 Fragment 的保留实例
class HomeFragment : Fragment() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 保留 Fragment 实例
        retainInstance = true // 已废弃，使用 ViewModel 替代
    }
}
```

---

## 动画配置

### 在 Navigation Graph 中配置动画

```xml
<action
    android:id="@+id/action_homeFragment_to_detailFragment"
    app:destination="@id/detailFragment"
    app:enterAnim="@anim/nav_enter"
    app:exitAnim="@anim/nav_exit"
    app:popEnterAnim="@anim/nav_pop_enter"
    app:popExitAnim="@anim/nav_pop_exit" />
```

### 创建动画资源

```xml
<!-- res/anim/nav_enter.xml - 进入动画 -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:fromXDelta="100%"
        android:toXDelta="0%"
        android:duration="300" />
    <alpha
        android:fromAlpha="0.0"
        android:toAlpha="1.0"
        android:duration="300" />
</set>

<!-- res/anim/nav_exit.xml - 退出动画 -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:fromXDelta="0%"
        android:toXDelta="-100%"
        android:duration="300" />
    <alpha
        android:fromAlpha="1.0"
        android:toAlpha="0.0"
        android:duration="300" />
</set>

<!-- res/anim/nav_pop_enter.xml - 返回时进入动画 -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:fromXDelta="-100%"
        android:toXDelta="0%"
        android:duration="300" />
</set>

<!-- res/anim/nav_pop_exit.xml - 返回时退出动画 -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:fromXDelta="0%"
        android:toXDelta="100%"
        android:duration="300" />
</set>
```

### 使用 Animator（属性动画）

```xml
<!-- res/animator/slide_in_right.xml -->
<objectAnimator xmlns:android="http://schemas.android.com/apk/res/android"
    android:duration="300"
    android:interpolator="@android:interpolator/fast_out_slow_in">
    <propertyValuesHolder
        android:propertyName="translationX"
        android:valueFrom="1000"
        android:valueTo="0" />
    <propertyValuesHolder
        android:propertyName="alpha"
        android:valueFrom="0"
        android:valueTo="1" />
</objectAnimator>
```

### 在代码中配置动画

```kotlin
// 方式 1：通过 NavOptions
val navOptions = NavOptions.Builder()
    .setEnterAnim(R.anim.nav_enter)
    .setExitAnim(R.anim.nav_exit)
    .setPopEnterAnim(R.anim.nav_pop_enter)
    .setPopExitAnim(R.anim.nav_pop_exit)
    .build()

navController.navigate(R.id.detailFragment, null, navOptions)

// 方式 2：通过 FragmentTransaction
supportFragmentManager.beginTransaction()
    .setCustomAnimations(
        R.anim.nav_enter,
        R.anim.nav_exit,
        R.anim.nav_pop_enter,
        R.anim.nav_pop_exit
    )
    .replace(R.id.container, DetailFragment())
    .addToBackStack(null)
    .commit()
```

### 使用 Material 动画

```kotlin
// 使用 Material 组件的共享元素过渡
val navOptions = NavOptions.Builder()
    .setEnterAnim(R.anim.mtrl_bottom_sheet_slide_in)
    .setExitAnim(R.anim.mtrl_bottom_sheet_slide_out)
    .build()

// 共享元素过渡
val sharedElementTransition = FragmentNavigator.Extras.Builder()
    .addSharedElements(
        imageView to "image_transition"
    )
    .build()

navController.navigate(
    R.id.detailFragment,
    bundle,
    navOptions,
    sharedElementTransition
)
```

### 禁用动画

```kotlin
// 在特定场景下禁用动画
val navOptions = NavOptions.Builder()
    .setEnterAnim(0)
    .setExitAnim(0)
    .setPopEnterAnim(0)
    .setPopExitAnim(0)
    .build()

// 或者使用全局设置
navController.graph = navGraph
navController.setOnDestinationChangedListener { _, _, _ ->
    // 自定义逻辑
}
```

---

## 面试考点

### 基础问题

#### Q1: Navigation 组件的核心组件有哪些？

**参考答案：**
Navigation 组件有三个核心组件：

1. **Navigation Graph**：XML 资源文件，定义所有导航目的地和动作
2. **NavHost**：导航容器，显示目的地内容，通常是 `NavHostFragment`
3. **NavController**：导航控制器，管理导航行为，执行 navigate() 等操作

三者关系：NavController 操作 NavHost，根据 Navigation Graph 的定义进行导航。

#### Q2: 如何使用 SafeArgs 传递参数？

**参考答案：**

```kotlin
// 1. 配置插件
// build.gradle 中应用 'androidx.navigation.safeargs.kotlin'

// 2. 在 Navigation Graph 中定义参数
<fragment android:id="@+id/detailFragment">
    <argument android:name="itemId" app:argType="long" />
</fragment>

// 3. 传递参数（使用生成的 Directions 类）
val action = HomeFragmentDirections.actionHomeToDetail(itemId = 123L)
navController.navigate(action)

// 4. 接收参数（使用 navArgs 委托）
class DetailFragment : Fragment() {
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(...) {
        val itemId = args.itemId // 类型安全
    }
}
```

#### Q3: NavHostFragment 的作用是什么？

**参考答案：**
NavHostFragment 是 Navigation 组件提供的 Fragment 容器，主要作用：

1. **显示目的地**：作为 Fragment 的容器，显示当前导航目的地
2. **管理 Back Stack**：自动管理 Fragment 的回退栈
3. **处理返回键**：设置 `defaultNavHost="true"` 可拦截系统返回键
4. **关联导航图**：通过 `app:navGraph` 属性关联导航配置

```xml
<androidx.fragment.app.FragmentContainerView
    android:name="androidx.navigation.fragment.NavHostFragment"
    app:navGraph="@navigation/nav_graph"
    app:defaultNavHost="true" />
```

#### Q4: 如何配置 DeepLink？

**参考答案：**

```xml
<!-- 1. 在 Navigation Graph 中配置 -->
<fragment android:id="@+id/detailFragment">
    <deepLink app:uri="example://detail/{itemId}" />
</fragment>

<!-- 2. 在 AndroidManifest 中配置 Intent Filter -->
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="example" android:host="detail" />
    </intent-filter>
</activity>

<!-- 3. 在 Fragment 中接收参数 -->
private val args: DetailFragmentArgs by navArgs()
val itemId = args.itemId
```

### 进阶问题

#### Q5: Navigation 如何处理 Fragment 的 Back Stack？

**参考答案：**

Navigation 自动管理 Back Stack：

1. **navigate()**：将新目的地压入栈
2. **popBackStack()**：弹出栈顶目的地
3. **popUpTo**：弹出到指定目的地

```kotlin
// 基本导航
navController.navigate(R.id.detailFragment)

// 带 popUpTo 的导航
navController.navigate(R.id.detailFragment) {
    popUpTo(R.id.homeFragment) // 弹出到 homeFragment
    popUpToInclusive = false   // 不弹出 homeFragment 本身
}

// 直接弹出
navController.popBackStack()

// 弹出到特定目的地
navController.popBackStack(R.id.homeFragment, false)
```

**原理**：NavController 内部维护一个 `BackStackEntry` 列表，每次导航操作都会更新这个列表，并通知 NavHost 显示相应的 Fragment。

#### Q6: 如何解决 BottomNavigationView 切换时 Fragment 重建的问题？

**参考答案：**

**问题分析**：默认情况下，BottomNavigationView 每次切换都会重新创建 Fragment。

**解决方案：**

**方案 1：使用 NavigationUI（推荐）**
```kotlin
bottomNavigationView.setupWithNavController(navController)
// NavigationUI 内部已优化，会复用 Fragment 实例
```

**方案 2：自定义 Fragment 工厂**
```kotlin
class ReuseFragmentFactory : FragmentFactory() {
    private val fragments = mutableMapOf<Class<*>, Fragment>()
    
    override fun instantiate(classLoader: ClassLoader, className: String): Fragment {
        return fragments.getOrPut(loadFragmentClass(classLoader, className)) {
            super.instantiate(classLoader, className)
        }
    }
}

supportFragmentManager.fragmentFactory = ReuseFragmentFactory()
```

**方案 3：使用 ViewModel 保存状态**
```kotlin
class HomeViewModel : ViewModel() {
    // 在 ViewModel 中保存状态，Fragment 重建后恢复
    val data = MutableLiveData<List<Item>>()
}
```

#### Q7: Navigation 的动画原理是什么？

**参考答案：**

Navigation 动画基于 FragmentTransaction 的 `setCustomAnimations()` 方法：

1. **动画资源**：支持传统的 View 动画（`<set>`、`<translate>`）和属性动画（`<objectAnimator>`）
2. **四种动画**：
   - `enterAnim`：新 Fragment 进入
   - `exitAnim`：旧 Fragment 退出
   - `popEnterAnim`：返回时新 Fragment 进入
   - `popExitAnim`：返回时旧 Fragment 退出

```xml
<action
    app:enterAnim="@anim/slide_in_right"
    app:exitAnim="@anim/slide_out_left"
    app:popEnterAnim="@anim/slide_in_left"
    app:popExitAnim="@anim/slide_out_right" />
```

**原理**：NavController 在执行导航时，会创建 FragmentTransaction，调用 `setCustomAnimations()` 设置动画，然后提交事务。

#### Q8: 如何实现嵌套 Navigation Graph？

**参考答案：**

嵌套 Navigation Graph 用于复杂导航场景，如 Bottom Navigation 的每个 Tab 有自己的导航栈：

```xml
<!-- 主导航图 -->
<navigation xmlns:app="http://schemas.android.com/apk/res-auto"
    app:startDestination="@id/home_nav_graph">

    <!-- 嵌套导航图：首页 -->
    <navigation
        android:id="@+id/home_nav_graph"
        app:startDestination="@id/homeListFragment">
        
        <fragment android:id="@+id/homeListFragment" />
        <fragment android:id="@+id/homeDetailFragment">
            <action app:destination="@id/homeListFragment" />
        </fragment>
    </navigation>

    <!-- 嵌套导航图：个人中心 -->
    <navigation
        android:id="@+id/profile_nav_graph"
        app:startDestination="@id/profileFragment">
        
        <fragment android:id="@+id/profileFragment" />
        <fragment android:id="@+id/settingsFragment" />
    </navigation>

</navigation>
```

**使用场景**：
- Bottom Navigation 每个 Tab 独立导航栈
- 侧边导航栏
- 复杂的层级导航

---

## 最佳实践与常见错误

### 最佳实践

#### 1. 使用 SafeArgs 进行类型安全的参数传递

```kotlin
// ✅ 推荐：使用 SafeArgs
val action = HomeFragmentDirections.actionToDetail(itemId = 123L)
navController.navigate(action)

// ❌ 不推荐：手动传递 Bundle
val bundle = bundleOf("itemId" to 123L)
navController.navigate(R.id.detailFragment, bundle)
```

#### 2. 使用 by navArgs() 委托接收参数

```kotlin
// ✅ 推荐
class DetailFragment : Fragment() {
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(...) {
        val itemId = args.itemId
    }
}

// ❌ 不推荐
override fun onViewCreated(...) {
    val itemId = arguments?.getLong("itemId") ?: 0L
}
```

#### 3. 使用 popUpTo 避免栈无限增长

```kotlin
// ✅ 推荐：登录成功后清除登录栈
navController.navigate(R.id.homeFragment) {
    popUpTo(R.id.loginFragment) { inclusive = true }
}

// ❌ 不推荐：栈会无限增长
navController.navigate(R.id.homeFragment)
```

#### 4. 使用 AppBarConfiguration 配置 Toolbar

```kotlin
// ✅ 推荐
val appBarConfiguration = AppBarConfiguration(
    setOf(R.id.home, R.id.dashboard, R.id.notifications)
)
setupActionBarWithNavController(navController, appBarConfiguration)

// 在 Activity 中
override fun onSupportNavigateUp(): Boolean {
    return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
}
```

#### 5. 使用 ViewModel 保存 Fragment 状态

```kotlin
// ✅ 推荐：状态保存在 ViewModel 中
class HomeViewModel : ViewModel() {
    val items = MutableLiveData<List<Item>>()
}

class HomeFragment : Fragment() {
    private val viewModel: HomeViewModel by viewModels()
    
    // Fragment 重建后，数据自动恢复
}
```

### 常见错误

#### 错误 1：忘记设置 defaultNavHost

```xml
<!-- ❌ 错误：返回键无法正确处理 -->
<androidx.fragment.app.FragmentContainerView
    android:name="androidx.navigation.fragment.NavHostFragment"
    app:navGraph="@navigation/nav_graph" />

<!-- ✅ 正确 -->
<androidx.fragment.app.FragmentContainerView
    android:name="androidx.navigation.fragment.NavHostFragment"
    app:navGraph="@navigation/nav_graph"
    app:defaultNavHost="true" />
```

#### 错误 2：在错误的时机获取 NavController

```kotlin
// ❌ 错误：在 onCreate 中获取 viewLifecycleOwner 相关的 NavController
class MyFragment : Fragment() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val navController = findNavController() // 可能为 null
    }
}

// ✅ 正确：在 onViewCreated 中获取
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    val navController = findNavController()
}
```

#### 错误 3：滥用 popUpToInclusive

```kotlin
// ❌ 错误：意外清除了不该清除的目的地
navController.navigate(R.id.homeFragment) {
    popUpTo(R.id.homeFragment) { inclusive = true } // 连 homeFragment 也弹出了
}

// ✅ 正确
navController.navigate(R.id.homeFragment) {
    popUpTo(R.id.homeFragment) { inclusive = false } // 保留 homeFragment
}
```

#### 错误 4：DeepLink 参数类型不匹配

```xml
<!-- ❌ 错误：参数类型定义与实际传递不符 -->
<argument android:name="userId" app:argType="long" />
<!-- DeepLink 传递的是字符串 -->

<!-- ✅ 正确：确保类型匹配 -->
<argument android:name="userId" app:argType="string" />
```

#### 错误 5：忘记处理 DeepLink 的启动模式

```kotlin
// ❌ 错误：每次 DeepLink 都创建新实例
// 没有配置 launchMode

// ✅ 正确：在 AndroidManifest 中配置
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:exported="true">
    <!-- DeepLink 配置 -->
</activity>
```

---

## 参考资料

### 官方文档
- [Navigation 官方文档](https://developer.android.com/guide/navigation)
- [Navigation 版本说明](https://developer.android.com/jetpack/androidx/releases/navigation)
- [SafeArgs 插件](https://developer.android.com/guide/navigation/navigation-pass-data#Safe-args)

### 源码阅读
- [NavController 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:navigation/navigation-runtime/src/main/java/androidx/navigation/NavController.kt)
- [NavHostFragment 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:navigation/navigation-fragment/src/main/java/androidx/navigation/fragment/NavHostFragment.kt)

### 相关文章
- [Android Navigation 完全指南](https://medium.com/androiddevelopers/navigation-5b5e06892c20)
- [Deep Linking in Android](https://developer.android.com/training/app-links/deep-linking)

---

## 总结

Navigation 组件是 Android Jetpack 中用于简化导航实现的核心组件，它提供了：

1. **可视化导航图**：通过 XML 定义导航结构
2. **类型安全参数传递**：SafeArgs 插件生成类型安全的代码
3. **自动 Back Stack 管理**：无需手动管理 Fragment 事务
4. **DeepLink 支持**：简化 DeepLink 配置和处理
5. **动画支持**：内置导航动画配置
6. **UI 组件集成**：与 BottomNavigationView、Toolbar 等无缝集成

掌握 Navigation 组件对于开发结构清晰、用户体验良好的 Android 应用至关重要。在面试中，Navigation 常与 Fragment、ViewModel、LiveData 等组件结合考察。
