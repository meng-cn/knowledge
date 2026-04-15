# SafeArgs 安全传参深度解析

> **字数统计：约 8000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [SafeArgs 插件配置](#1-safeargs-插件配置)
2. [类型安全传参](#2-类型安全传参)
3. [与 Navigation 集成](#3-与-navigation-集成)
4. [自定义类型支持](#4-自定义类型支持)
5. [复杂数据类型传递](#5-复杂数据类型传递)
6. [null 安全处理](#6-null-安全处理)
7. [替代传统的 Intent 传参](#7-替代传统的-intent-传参)
8. [面试考点](#8-面试考点)
9. [参考资料](#9-参考资料)

---

## 1. SafeArgs 插件配置

### 1.1 添加 SafeArgs 插件

在项目的 `build.gradle` 中配置 SafeArgs 插件：

```groovy
// 项目级 build.gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.0'
        
        // SafeArgs 插件
        classpath 'androidx.navigation:navigation-safe-args-gradle-plugin:2.6.0'
    }
}
```

```groovy
// 模块级 build.gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    
    // 应用 SafeArgs 插件（必须在最后）
    id 'androidx.navigation.safeargs.kotlin'
}

android {
    namespace 'com.example.myapp'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.example.myapp"
        minSdk 21
        targetSdk 34
    }
}

dependencies {
    // Navigation 组件
    implementation 'androidx.navigation:navigation-fragment-ktx:2.6.0'
    implementation 'androidx.navigation:navigation-ui-ktx:2.6.0'
    
    // ViewModel
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.1'
}
```

```kotlin
// Kotlin DSL (build.gradle.kts)
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("androidx.navigation.safeargs.kotlin")
}
```

### 1.2 配置说明

```
配置要点：
1. SafeArgs 插件必须在所有其他插件之后应用
2. 使用 'androidx.navigation.safeargs.kotlin' 用于 Kotlin 项目
3. 使用 'androidx.navigation.safeargs' 用于 Java 项目
4. 插件版本需要与 Navigation 版本匹配

支持的语言：
- Kotlin: androidx.navigation.safeargs.kotlin
- Java: androidx.navigation.safeargs
- 都支持：androidx.navigation.safeargs
```

### 1.3 生成文件位置

SafeArgs 插件会在编译时生成以下文件：

```
生成文件结构：
build/
└── generated/
    └── data_binding_binding_gen/
        └── debug/
            └── com.example.myapp/
                └── nav/
                    ├── NavGraphDirections.kt
                    ├── FragmentADirections.kt
                    ├── FragmentBArgs.kt
                    └── ...

或者（使用 customBuildType）：
build/
└── generated/
    └── safeargs/
        └── debug/
            └── com.example.myapp/
                └── nav/
                    └── ...
```

### 1.4 自定义输出目录

```groovy
android {
    // ...
    
    // 自定义 SafeArgs 输出目录
    sourceSets {
        main {
            java.srcDirs += 'build/generated/safeargs/debug'
            java.srcDirs += 'build/generated/safeargs/release'
        }
    }
}
```

---

## 2. 类型安全传参

### 2.1 定义 Navigation Graph

创建导航图文件 `res/navigation/nav_graph.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/nav_graph"
    app:startDestination="@id/fragment_home">

    <!-- 定义参数 -->
    <fragment
        android:id="@+id/fragment_home"
        android:name="com.example.myapp.home.HomeFragment"
        android:label="Home">
        
        <!-- 输出参数（Fragment 传递出去的数据） -->
        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/fragment_detail" />
            
    </fragment>
    
    <fragment
        android:id="@+id/fragment_detail"
        android:name="com.example.myapp.detail.DetailFragment"
        android:label="Detail">
        
        <!-- 输入参数（Fragment 接收的数据） -->
        <argument
            android:name="userId"
            app:argType="string"
            android:defaultValue="\"\"" />
        
        <argument
            android:name="userName"
            app:argType="string"
            android:defaultValue="\"Unknown\"" />
        
        <argument
            android:name="userAge"
            app:argType="integer"
            android:defaultValue="0" />
        
        <argument
            android:name="userBalance"
            app:argType="float"
            android:defaultValue="0.0" />
        
        <argument
            android:name="isActive"
            app:argType="boolean"
            android:defaultValue="false" />
        
        <argument
            android:name="userTags"
            app:argType="androidx.navigation.NavType"
            app:nullable="true"
            android:defaultValue="null" />
            
    </fragment>
    
</navigation>
```

### 2.2 生成的 SafeArgs 类

编译后会自动生成以下类：

```kotlin
// 自动生成的类
package com.example.myapp.nav

class DetailFragmentArgs(
    @param:JvmField val userId: String,
    @param:JvmField val userName: String,
    @param:JvmField val userAge: Int,
    @param:JvmField val userBalance: Float,
    @param:JvmField val isActive: Boolean,
    @param:JvmField val userTags: List<String>?
) {
    constructor(bundle: Bundle) : this(
        bundle.getString("userId") ?: "",
        bundle.getString("userName") ?: "Unknown",
        bundle.getInt("userAge", 0),
        bundle.getFloat("userBalance", 0f),
        bundle.getBoolean("isActive", false),
        bundle.getStringArrayList("userTags")
    )
    
    fun toBundle(): Bundle {
        val _bundle = Bundle()
        _bundle.putString("userId", userId)
        _bundle.putString("userName", userName)
        _bundle.putInt("userAge", userAge)
        _bundle.putFloat("userBalance", userBalance)
        _bundle.putBoolean("isActive", isActive)
        _bundle.putStringArrayList("userTags", userTags as ArrayList<String>?)
        return _bundle
    }
}

// 导航方向类
interface FragmentHomeDirections {
    fun actionHomeToDetail(
        userId: String = "",
        userName: String = "Unknown",
        userAge: Int = 0,
        userBalance: Float = 0f,
        isActive: Boolean = false,
        userTags: List<String>? = null
    ): NavDirections
    
    companion object {
        @JvmStatic
        fun createIfNeeded(): FragmentHomeDirections? = null
    }
}
```

### 2.3 使用 SafeArgs 传递参数

```kotlin
// Fragment 中接收参数
class DetailFragment : Fragment() {
    
    // 使用 by lazy 延迟初始化
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 直接访问参数
        val userId = args.userId
        val userName = args.userName
        val userAge = args.userAge
        val userBalance = args.userBalance
        val isActive = args.isActive
        val userTags = args.userTags
        
        // 显示数据
        textViewUserId.text = userId
        textViewUserName.text = userName
        textViewUserAge.text = userAge.toString()
    }
}

// 导航到目标 Fragment
class HomeFragment : Fragment() {
    
    private val userId = "123"
    private val userName = "张三"
    private val userAge = 25
    private val userBalance = 1000.5f
    private val isActive = true
    private val userTags = listOf("tag1", "tag2")
    
    private fun navigateToDetail() {
        // 方式 1：使用 navController
        val action = HomeFragmentDirections.actionHomeToDetail(
            userId = userId,
            userName = userName,
            userAge = userAge,
            userBalance = userBalance,
            isActive = isActive,
            userTags = userTags
        )
        findNavController().navigate(action)
        
        // 方式 2：使用扩展函数
        navigate<DetailFragment>(
            HomeFragmentDirections.actionHomeToDetail(
                userId = userId,
                userName = userName
            )
        )
        
        // 方式 3：使用 ViewModel 中的导航
        viewModel.navigateToDetail(userId, userName)
    }
}
```

### 2.4 基本类型支持

```xml
<!-- Navigation Graph 中支持的基本类型 -->
<argument
    android:name="stringArg"
    app:argType="string" />

<argument
    android:name="intArg"
    app:argType="integer" />

<argument
    android:name="longArg"
    app:argType="long" />

<argument
    android:name="floatArg"
    app:argType="float" />

<argument
    android:name="doubleArg"
    app:argType="double" />

<argument
    android:name="booleanArg"
    app:argType="boolean" />

<argument
    android:name="uriArg"
    app:argType="uri" />

<argument
    android:name="colorArg"
    app:argType="color" />

<argument
    android:name="dimenArg"
    app:argType="dimen" />
```

---

## 3. 与 Navigation 集成

### 3.1 Navigation Host Fragment

```xml
<!-- 布局文件中添加 NavHostFragment -->
<androidx.fragment.app.FragmentContainerView
    android:id="@+id/nav_host_fragment"
    android:name="androidx.navigation.fragment.NavHostFragment"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:defaultNavHost="true"
    app:navGraph="@navigation/nav_graph" />
```

```kotlin
// Activity 中设置
class MainActivity : AppCompatActivity() {
    
    private lateinit var navController: NavController
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 获取 NavController
        navController = findNavController(R.id.nav_host_fragment)
        
        // 或者通过 NavHostFragment 获取
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController
    }
}
```

### 3.2 使用 NavDirections 导航

```kotlin
class HomeFragment : Fragment() {
    
    private fun navigateToDetail(userId: String) {
        // 获取导航方向
        val directions = HomeFragmentDirections.actionHomeToDetail(userId)
        
        // 执行导航
        findNavController().navigate(directions)
    }
    
    // 带多个参数
    private fun navigateToDetail(
        userId: String,
        userName: String,
        userAge: Int
    ) {
        val directions = HomeFragmentDirections.actionHomeToDetail(
            userId = userId,
            userName = userName,
            userAge = userAge
        )
        findNavController().navigate(directions)
    }
    
    // 使用 bundle
    private fun navigateWithBundle() {
        val bundle = Bundle().apply {
            putString("userId", "123")
            putString("userName", "张三")
        }
        
        val directions = HomeFragmentDirections.actionHomeToDetail("123")
        findNavController().navigate(directions, bundle)
    }
}
```

### 3.3 处理导航返回

```kotlin
class DetailFragment : Fragment() {
    
    // 接收参数
    private val args: DetailFragmentArgs by navArgs()
    
    // 返回结果
    private fun navigateBackWithResult() {
        val result = NavDirectionsResult(
            isSuccess = true,
            message = "Success"
        )
        
        // 使用 PopDirections 返回
        val directions = DetailFragmentDirections.popUpToHome()
        findNavController().navigate(directions)
        
        // 或者使用 setResult
        parentFragmentManager.setFragmentResult(
            REQUEST_KEY,
            Bundle().apply {
                putString("result", result.message)
            }
        )
    }
    
    // 接收返回结果
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        parentFragmentManager.setFragmentResultListener(REQUEST_KEY, viewLifecycleOwner) { key, bundle ->
            val result = bundle.getString("result")
            // 处理结果
        }
    }
}
```

### 3.4 导航动画

```kotlin
// 自定义导航动画
class HomeFragment : Fragment() {
    
    private fun navigateToDetailWithAnimation(userId: String) {
        val directions = HomeFragmentDirections.actionHomeToDetail(userId)
        
        // 设置动画
        findNavController().navigate(
            directions,
            navController.navOptions {
                anim {
                    enter = R.anim.slide_in_right
                    exit = R.anim.slide_out_left
                    popEnter = R.anim.slide_in_left
                    popExit = R.anim.slide_out_right
                }
            }
        )
    }
}

// res/anim/slide_in_right.xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:fromXDelta="100%"
        android:toXDelta="0%"
        android:duration="300" />
</set>

// res/anim/slide_out_left.xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:fromXDelta="0%"
        android:toXDelta="-100%"
        android:duration="300" />
</set>
```

---

## 4. 自定义类型支持

### 4.1 定义自定义类型转换器

```kotlin
// 定义数据类
data class User(
    val id: String,
    val name: String,
    val email: String
)

// 自定义类型转换器
object CustomTypeConverter {
    
    // 序列化为 String
    fun userToString(user: User): String {
        return "${user.id}|${user.name}|${user.email}"
    }
    
    // 从 String 反序列化
    fun stringToUser(str: String): User? {
        val parts = str.split("|")
        return if (parts.size == 3) {
            User(parts[0], parts[1], parts[2])
        } else {
            null
        }
    }
}
```

### 4.2 使用 Parcelize 注解

```kotlin
// 使用 AndroidX Parcelize
@Parcelize
data class User(
    val id: String,
    val name: String,
    val email: String
) : Parcelable

// 在 Navigation Graph 中定义
<argument
    android:name="user"
    app:argType="com.example.myapp.User" />

// 生成的代码会自动处理 Parcelable
class DetailFragmentArgs(bundle: Bundle) {
    val user: User = bundle.getParcelable("user")!!
}
```

### 4.3 使用自定义转换器

```kotlin
// 定义转换器
class UserConverter {
    companion object {
        fun toBundle(user: User): Bundle {
            return Bundle().apply {
                putString("userId", user.id)
                putString("userName", user.name)
                putString("userEmail", user.email)
            }
        }
        
        fun fromBundle(bundle: Bundle): User {
            return User(
                id = bundle.getString("userId") ?: "",
                name = bundle.getString("userName") ?: "",
                email = bundle.getString("userEmail") ?: ""
            )
        }
    }
}

// 在 Fragment 中使用
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    // 使用转换器获取 User
    private val user: User by lazy {
        UserConverter.fromBundle(args.userBundle)
    }
}
```

### 4.4 使用 Kotlinx Serialization

```kotlin
// 添加依赖
dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0'
}

// 定义序列化数据类
@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String
)

// 序列化
fun userToString(user: User): String {
    return Json.encodeToString(User.serializer(), user)
}

// 反序列化
fun stringToUser(str: String): User? {
    return try {
        Json.decodeFromString(User.serializer(), str)
    } catch (e: Exception) {
        null
    }
}

// 在 Navigation 中使用
<argument
    android:name="user"
    app:argType="string" />

// 传递序列化后的字符串
val directions = HomeFragmentDirections.actionHomeToDetail(
    userString = userToString(user)
)

// 接收时反序列化
val user: User = stringToUser(args.userString)!!
```

### 4.5 复杂对象传递

```kotlin
// 使用 UUID 作为标识符
class HomeFragment : Fragment() {
    
    private val userViewModel: UserViewModel by activityViewModels()
    
    private fun navigateToDetail(user: User) {
        // 将 User 存入 ViewModel
        userViewModel.setSelectedUser(user)
        
        // 只传递 ID
        val directions = HomeFragmentDirections.actionHomeToDetail(
            userId = user.id
        )
        findNavController().navigate(directions)
    }
}

// DetailFragment 从 ViewModel 获取
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    private val userViewModel: UserViewModel by activityViewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 从 ViewModel 获取 User
        val user = userViewModel.getSelectedUser(args.userId)
        
        // 或者使用 LiveData/Flow
        userViewModel.userFlow.collect { user ->
            // 更新 UI
        }
    }
}
```

---

## 5. 复杂数据类型传递

### 5.1 传递 List

```xml
<!-- Navigation Graph -->
<argument
    android:name="userList"
    app:argType="androidx.navigation.NavType"
    app:nullable="true"
    android:defaultValue="null" />
```

```kotlin
// 传递 List
class HomeFragment : Fragment() {
    
    private val users = listOf(
        User("1", "张三", "zhangsan@example.com"),
        User("2", "李四", "lisi@example.com")
    )
    
    private fun navigateToUserList() {
        // 方式 1：传递 List 的字符串表示
        val userStrings = users.joinToString(",") { "${it.id}:${it.name}" }
        val directions = HomeFragmentDirections.actionHomeToUserList(
            userStrings = userStrings
        )
        findNavController().navigate(directions)
        
        // 方式 2：使用 ArrayList（推荐）
        val userArrayList = ArrayList(users)
        val directions2 = HomeFragmentDirections.actionHomeToUserList(
            userList = userArrayList
        )
        findNavController().navigate(directions2)
        
        // 方式 3：使用 ViewModel 传递
        userListViewModel.setUsers(users)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToUserList()
        )
    }
}

// 接收 List
class UserListFragment : Fragment() {
    
    private val args: UserListFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 方式 1：解析字符串
        val users = args.userStrings.split(",")
            .map { parts ->
                val (id, name) = parts.split(":")
                User(id, name, "")
            }
        
        // 方式 2：直接获取 List
        val users = args.userList
        
        // 方式 3：从 ViewModel 获取
        val users = userListViewModel.users.value ?: emptyList()
    }
}
```

### 5.2 传递 Map

```kotlin
// 传递 Map
class HomeFragment : Fragment() {
    
    private val dataMap = mapOf(
        "key1" to "value1",
        "key2" to "value2",
        "key3" to "value3"
    )
    
    private fun navigateWithMap() {
        // 方式 1：转换为 Bundle
        val bundle = Bundle().apply {
            dataMap.forEach { (key, value) ->
                putString(key, value)
            }
        }
        
        val directions = HomeFragmentDirections.actionHomeToMapFragment()
        findNavController().navigate(directions, bundle)
        
        // 方式 2：使用 JSON 序列化
        val jsonString = Json.encodeToString(dataMap)
        val directions2 = HomeFragmentDirections.actionHomeToMapFragment(
            dataJson = jsonString
        )
        findNavController().navigate(directions2)
    }
}

// 接收 Map
class MapFragment : Fragment() {
    
    private val args: MapFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 方式 1：从 Bundle 获取
        val map = args.bundle.toMap()
        
        // 方式 2：从 JSON 解析
        val map = Json.decodeFromString<Map<String, String>>(args.dataJson)
    }
}
```

### 5.3 传递大对象

```kotlin
// ❌ 不推荐：直接传递大对象
class BigObject(
    val data: ByteArray = ByteArray(10 * 1024 * 1024) // 10MB
)

// ✅ 推荐：传递引用或 ID
class HomeFragment : Fragment() {
    
    private val bigObject = BigObject()
    
    private fun navigateWithBigObject() {
        // 方式 1：存入 ViewModel
        dataViewModel.setBigObject(bigObject)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToBigObjectFragment()
        )
        
        // 方式 2：使用文件路径
        val filePath = saveObjectToFile(bigObject)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToBigObjectFragment(
                filePath = filePath
            )
        )
        
        // 方式 3：使用数据 ID
        val dataId = database.insertBigObject(bigObject)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToBigObjectFragment(
                dataId = dataId
            )
        )
    }
    
    private fun saveObjectToFile(obj: BigObject): String {
        val file = File(cacheDir, "big_object.tmp")
        FileOutputStream(file).use { it.write(obj.data) }
        return file.absolutePath
    }
}
```

### 5.4 传递图片

```kotlin
// 传递图片
class HomeFragment : Fragment() {
    
    private val bitmap: Bitmap = ...
    
    private fun navigateWithImage() {
        // 方式 1：使用 URI
        val uri = saveImageToContentProvider(bitmap)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToImageFragment(
                imageUri = uri.toString()
            )
        )
        
        // 方式 2：使用文件路径
        val filePath = saveImageToFile(bitmap)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToImageFragment(
                imagePath = filePath
            )
        )
        
        // 方式 3：使用图片 ID
        val imageId = database.insertImage(bitmap)
        findNavController().navigate(
            HomeFragmentDirections.actionHomeToImageFragment(
                imageId = imageId
            )
        )
    }
}
```

---

## 6. null 安全处理

### 6.1 定义可空参数

```xml
<!-- Navigation Graph -->
<!-- 可空参数 -->
<argument
    android:name="optionalString"
    app:argType="string"
    app:nullable="true"
    android:defaultValue="null" />

<!-- 非空参数（有默认值） -->
<argument
    android:name="requiredString"
    app:argType="string"
    android:defaultValue="\"default\"" />

<!-- 非空参数（无默认值，必须提供） -->
<argument
    android:name="mandatoryString"
    app:argType="string" />
```

### 6.2 处理可空参数

```kotlin
// 接收可空参数
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 处理可空参数
        val optional = args.optionalString  // String?
        val required = args.requiredString  // String
        val mandatory = args.mandatoryString  // String
        
        // 安全使用
        optional?.let {
            // 处理非 null 情况
        } ?: run {
            // 处理 null 情况
        }
        
        // 使用 Elvis 操作符
        val displayName = optional ?: "Unknown"
    }
}
```

### 6.3 验证必需参数

```kotlin
// 在 Fragment 中验证必需参数
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 验证必需参数
        require(!args.mandatoryString.isNullOrEmpty()) {
            "mandatoryString cannot be null or empty"
        }
        
        // 或者使用 assert
        assert(args.mandatoryString.isNotEmpty()) {
            "mandatoryString must not be empty"
        }
    }
}
```

### 6.4 提供默认值

```xml
<!-- Navigation Graph 中提供默认值 -->
<argument
    android:name="stringArg"
    app:argType="string"
    android:defaultValue="\"default\"" />

<argument
    android:name="intArg"
    app:argType="integer"
    android:defaultValue="0" />

<argument
    android:name="booleanArg"
    app:argType="boolean"
    android:defaultValue="false" />

<argument
    android:name="floatArg"
    app:argType="float"
    android:defaultValue="0.0f" />
```

```kotlin
// 在代码中使用默认值
class HomeFragment : Fragment() {
    
    private fun navigateWithDefaults() {
        // 不传递参数，使用默认值
        val directions = HomeFragmentDirections.actionHomeToDetail(
            // 不传参数，使用默认值
        )
        findNavController().navigate(directions)
        
        // 只传递部分参数
        val directions2 = HomeFragmentDirections.actionHomeToDetail(
            mandatoryString = "value",
            // 其他参数使用默认值
        )
        findNavController().navigate(directions2)
    }
}
```

### 6.5 处理 null 安全

```kotlin
// 使用 Safe Args 的空安全特性
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    // 方式 1：使用 let
    args.optionalString?.let { optional ->
        // 使用 optional
    }
    
    // 方式 2：使用 run
    val result = args.optionalString?.run {
        // 使用 this
        length
    } ?: 0
    
    // 方式 3：使用 takeIf
    val validString = args.optionalString?.takeIf { it.isNotEmpty() }
    
    // 方式 4：使用 takeUnless
    val nonEmptyString = args.optionalString?.takeUnless { it.isEmpty() }
    
    // 方式 5：使用 orEmpty
    val safeString = args.optionalString.orEmpty()
    
    // 方式 6：使用 orNull
    val nonNull = args.optionalString?.ifEmpty { null }
}
```

---

## 7. 替代传统的 Intent 传参

### 7.1 传统 Intent 传参方式

```kotlin
// ❌ 传统 Intent 传参（不类型安全）
class HomeActivity : AppCompatActivity() {
    
    private fun navigateToDetail() {
        val intent = Intent(this, DetailActivity::class.java).apply {
            putExtra("userId", "123")
            putExtra("userName", "张三")
            putExtra("userAge", 25)
        }
        startActivity(intent)
    }
}

class DetailActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 容易出错：参数名拼写错误、类型不匹配
        val userId = intent.getStringExtra("userId")  // 可能为 null
        val userName = intent.getStringExtra("userName")  // 可能为 null
        val userAge = intent.getIntExtra("userAge", 0)  // 默认值可能掩盖错误
    }
}
```

### 7.2 SafeArgs 类型安全方式

```kotlin
// ✅ SafeArgs 传参（类型安全）
// Navigation Graph
<fragment
    android:id="@+id/fragment_detail"
    android:name="com.example.myapp.detail.DetailFragment">
    <argument
        android:name="userId"
        app:argType="string" />
    <argument
        android:name="userName"
        app:argType="string" />
    <argument
        android:name="userAge"
        app:argType="integer" />
</fragment>

// 生成的代码
class DetailFragmentArgs(
    val userId: String,  // 非空
    val userName: String,  // 非空
    val userAge: Int  // 非空
)

// 使用
class HomeFragment : Fragment() {
    
    private fun navigateToDetail() {
        val directions = HomeFragmentDirections.actionHomeToDetail(
            userId = "123",
            userName = "张三",
            userAge = 25
        )
        findNavController().navigate(directions)
    }
}

class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    // 直接访问，类型安全
    val userId = args.userId
    val userName = args.userName
    val userAge = args.userAge
}
```

### 7.3 对比总结

| 特性 | Intent | SafeArgs |
|------|----------|----------|
| 类型安全 | ❌ 否 | ✅ 是 |
| 编译时检查 | ❌ 否 | ✅ 是 |
| 参数名拼写检查 | ❌ 运行时 | ✅ 编译时 |
| 默认值支持 | ✅ 是 | ✅ 是 |
| 可空参数处理 | ❌ 需要手动 | ✅ 自动 |
| 重构支持 | ❌ 困难 | ✅ 容易 |
| IDE 自动完成 | ❌ 有限 | ✅ 完整 |

### 7.4 迁移指南

```kotlin
// 迁移步骤：
// 1. 在 Navigation Graph 中定义参数
// 2. 使用 SafeArgs 替换 Intent
// 3. 更新 Fragment 接收参数
// 4. 测试所有导航路径

// 从 Activity 迁移到 Fragment
// Before:
startActivity(Intent(this, DetailActivity::class.java).apply {
    putExtra("userId", userId)
})

// After:
findNavController().navigate(
    HomeFragmentDirections.actionHomeToDetail(userId)
)
```

### 7.5 处理 Activity 与 Fragment 混合

```kotlin
// 如果项目中有 Activity 和 Fragment 混合，可以使用 FragmentResult
// Activity 中
class HomeActivity : AppCompatActivity() {
    
    private fun navigateToFragment() {
        val fragment = DetailFragment()
        val bundle = Bundle().apply {
            putString("userId", "123")
        }
        fragment.arguments = bundle
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, fragment)
            .commit()
    }
}

// Fragment 中接收
class DetailFragment : Fragment() {
    
    private val userId: String? by lazy {
        arguments?.getString("userId")
    }
}
```

---

## 8. 面试考点

### 基础考点

#### 1. SafeArgs 是什么？有什么作用？

```
答案要点：
- SafeArgs 是 Navigation 组件提供的类型安全的参数传递工具
- 编译时生成参数类，确保参数类型和名称正确
- 避免传统的 Intent 传参的类型错误和拼写错误
- 提供更好的 IDE 支持和重构能力
```

#### 2. 如何配置 SafeArgs 插件？

```groovy
// 项目级
classpath 'androidx.navigation:navigation-safe-args-gradle-plugin:2.6.0'

// 模块级
id 'androidx.navigation.safeargs.kotlin'

// 注意事项：
// - 插件必须在最后应用
// - Kotlin 项目使用 .kotlin 版本
```

#### 3. SafeArgs 支持哪些数据类型？

```
基本类型：
- string
- integer / int
- long
- float
- double
- boolean
- uri
- color
- dimen

自定义类型：
- Parcelable
- Serializable
- 自定义转换器

集合类型：
- List
- Map（需要转换）
```

### 进阶考点

#### 4. 如何在 SafeArgs 中传递自定义类型？

```
方式 1：使用 @Parcelize 注解
@Parcelize
data class User(...) : Parcelable

方式 2：使用转换器序列化
fun userToString(user: User): String

方式 3：使用 ViewModel 传递
viewModel.setObject(user)
```

#### 5. SafeArgs 如何处理可空参数？

```xml
<argument
    android:name="optional"
    app:argType="string"
    app:nullable="true"
    android:defaultValue="null" />
```

```kotlin
// 接收可空参数
val optional: String? = args.optional

// 提供默认值
val withDefault = args.optional ?: "default"
```

#### 6. 如何在 ViewModel 中使用 SafeArgs 导航？

```kotlin
class HomeViewModel : ViewModel() {
    
    private val navController: NavController? = null
    
    fun navigateToDetail(userId: String) {
        val directions = HomeFragmentDirections.actionHomeToDetail(userId)
        navController?.navigate(directions)
    }
}
```

### 高级考点

#### 7. SafeArgs 生成的代码原理是什么？

```
答案要点：
1. 插件读取 Navigation Graph XML
2. 根据 argument 定义生成 Args 类
3. 根据 action 定义生成 Directions 类
4. 使用 KSP 或注解处理器生成 Kotlin 代码
5. 生成的代码在编译时加入项目
```

#### 8. SafeArgs 如何处理配置变化？

```
答案要点：
1. SafeArgs 使用 Bundle 存储参数
2. 配置变化时，参数会自动保存在 Fragment 的 arguments
3. 使用 by navArgs() 会自动从 arguments 获取
4. 与 ViewModel 配合可以保持数据
```

#### 9. SafeArgs 的性能开销？

```
答案要点：
1. 编译时生成代码，运行时开销小
2. 使用 Bundle 传递，与传统方式类似
3. 自定义类型需要序列化，可能有性能开销
4. 大对象建议通过 ViewModel 或数据库传递
```

#### 10. SafeArgs 的最佳实践？

```
1. 优先使用基本类型
2. 大对象使用 ViewModel 或数据库
3. 自定义类型使用 Parcelable
4. 提供合理的默认值
5. 使用可空参数处理可选值
6. 避免传递敏感数据
7. 使用导航图管理导航逻辑
```

---

## 9. 参考资料

### 官方文档

- [Navigation Safe Args Plugin](https://developer.android.com/navigation/add-plugin)
- [Navigation Component](https://developer.android.com/topic/libraries/navigation)

### 推荐资源

- [Android Codelabs - Navigation](https://developer.android.com/codelabs/android-navigation-component)
- [Now in Android](https://github.com/android/nowinandroid)

### 相关工具

- [Android Studio Navigation Editor](https://developer.android.com/studio/intro/navigation)
- [Kotlin Serialization](https://github.com/Kotlin/kotlinx.serialization)

---

*本文完，感谢阅读！*
