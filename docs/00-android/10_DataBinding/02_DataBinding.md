# DataBinding 数据绑定深度解析

> **字数统计：约 10000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [DataBinding 配置（build.gradle）](#1-databinding-配置)
2. [layout 标签语法](#2-layout-标签语法)
3. [单向绑定 vs 双向绑定（@={}）](#3-单向绑定-vs-双向绑定)
4. [BindingAdapter 自定义绑定](#4-bindingadapter-自定义绑定)
5. [表达式语言（条件/运算/调用）](#5-表达式语言)
6. [图片绑定（ImageBindingAdapter）](#6-图片绑定)
7. [DataBinding vs ViewBinding](#7-databinding-vs-viewbinding)
8. [DataBinding vs Compose](#8-databinding-vs-compose)
9. [性能优化建议](#9-性能优化建议)
10. [面试考点](#10-面试考点)
11. [参考资料](#11-参考资料)

---

## 1. DataBinding 配置

### 1.1 项目级配置

在项目的 `build.gradle`（或 `build.gradle.kts`）中启用 DataBinding：

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
    }
}
```

```groovy
// 模块级 build.gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.example.myapp'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.example.myapp"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    // 启用 DataBinding
    buildFeatures {
        dataBinding true
        // 可以同时启用 ViewBinding
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.1'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.1'
}
```

```kotlin
// Kotlin DSL (build.gradle.kts)
android {
    // ...
    buildFeatures {
        dataBinding = true
        viewBinding = true
    }
}
```

### 1.2 添加必要依赖

```groovy
dependencies {
    // AndroidX 核心库
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    
    // Lifecycle 组件
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.1'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.1'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.1'
    
    // 如果是 Kotlin 项目
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.1'
    
    // Glide 图片加载（如果使用图片绑定）
    implementation 'com.github.bumptech.glide:glide:4.15.1'
    
    // 单元测试
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
}
```

### 1.3 ProGuard 配置

如果使用代码混淆，需要添加 DataBinding 的 ProGuard 规则：

```proguard
# DataBinding
-keepclassmembers class * {
    public *** getData();
    public void set*** (**);
}

# ViewModel
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <fields>;
}

# LiveData
-keepclassmembers class * extends androidx.lifecycle.LiveData {
    <fields>;
}
```

---

## 2. layout 标签语法

### 2.1 基础布局结构

使用 DataBinding 时，布局文件的根元素必须是 `<layout>` 标签：

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- 根元素必须是 layout -->
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- data 标签：定义绑定的数据变量 -->
    <data>
        <!-- 导入必要的类 -->
        <import type="android.view.View" />
        <import type="com.example.myapp.util.DateUtils" />
        
        <!-- 定义变量 -->
        <variable
            name="user"
            type="com.example.myapp.data.User" />
        <variable
            name="viewModel"
            type="com.example.myapp.viewmodel.UserViewModel" />
    </data>

    <!-- 根布局元素 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        tools:context=".UserActivity">

        <!-- 使用数据绑定 -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{user.name}" />
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{user.email}" />
        
        <!-- 使用表达式 -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_parent"
            android:text="@{DateUtils.formatDate(user.birthDate)}" />
        
        <!-- 使用变量方法 -->
        <Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Delete"
            android:onClick="@{()->viewModel.deleteUser(user)}" />

    </LinearLayout>
</layout>
```

### 2.2 导入语句

在 `<data>` 标签中使用 `<import>` 导入需要的类：

```xml
<data>
    <!-- 导入基础类型 -->
    <import type="android.view.View" />
    <import type="java.util.List" />
    
    <!-- 导入工具类 -->
    <import type="com.example.myapp.util.StringUtils" />
    <import type="com.example.myapp.util.DateUtils" />
    
    <!-- 导入静态方法 -->
    <import type="com.example.myapp.util.TextUtils" />
</data>

<!-- 使用导入的类 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:visibility="@{user.isActive ? View.VISIBLE : View.GONE}" />

<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{StringUtils.capitalize(user.name)}" />
```

### 2.3 变量定义

```xml
<data>
    <!-- 基本类型 -->
    <variable
        name="string"
        type="String" />
    
    <!-- 包装类型 -->
    <variable
        name="integer"
        type="Integer" />
    
    <!-- 自定义类 -->
    <variable
        name="user"
        type="com.example.myapp.data.User" />
    
    <!-- ViewModel -->
    <variable
        name="viewModel"
        type="com.example.myapp.viewmodel.UserViewModel" />
    
    <!-- List -->
    <variable
        name="items"
        type="List&lt;com.example.myapp.data.Item&gt;" />
    
    <!-- 适配器 -->
    <variable
        name="adapter"
        type="com.example.myapp.adapter.ItemAdapter" />
</data>
```

### 2.4 根布局元素

`<layout>` 标签下只能有一个根元素，常见选择：

```xml
<!-- 1. ConstraintLayout -->
<layout>
    <data>...</data>
    <androidx.constraintlayout.widget.ConstraintLayout>
        ...
    </androidx.constraintlayout.widget.ConstraintLayout>
</layout>

<!-- 2. LinearLayout -->
<layout>
    <data>...</data>
    <LinearLayout
        android:orientation="vertical">
        ...
    </LinearLayout>
</layout>

<!-- 3. FrameLayout -->
<layout>
    <data>...</data>
    <FrameLayout>
        ...
    </FrameLayout>
</layout>

<!-- 4. 使用 include 和 merge 优化 -->
<layout>
    <data>...</data>
    <merge>
        <!-- merge 用于布局片段 -->
        ...
    </merge>
</layout>
```

### 2.5 绑定表达式

```xml
<data>
    <variable
        name="user"
        type="com.example.myapp.data.User" />
</data>

<!-- 属性绑定 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{user.name}"
    android:textSize="@{user.fontSize}"
    android:textColor="@{user.textColor}"
    android:visibility="@{user.isVisible ? View.VISIBLE : View.GONE}" />

<!-- 点击事件绑定 -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:onClick="@{()->viewModel.onUserClick(user)}" />

<!-- 长按事件绑定 -->
<ImageView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:src="@{user.avatar}"
    app:onLongClick="@{()->viewModel.onUserLongClick(user)}" />
```

---

## 3. 单向绑定 vs 双向绑定

### 3.1 单向绑定（@{}）

单向绑定是最常用的绑定方式，数据从 ViewModel 流向 View：

```xml
<data>
    <variable
        name="user"
        type="com.example.myapp.data.User" />
</data>

<!-- 单向绑定：数据只从 user.name 流向 TextView -->
<TextView
    android:id="@+id/nameTextView"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{user.name}" />
```

```kotlin
// ViewModel
class UserViewModel : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user
    
    fun updateUserName(newName: String) {
        val currentUser = _user.value ?: return
        _user.value = currentUser.copy(name = newName)
    }
}

// Activity/Fragment
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val binding = ActivityUserBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 绑定 LiveData
        binding.lifecycleOwner = this
        binding.user = viewModel.user
        
        // 当 viewModel.user 变化时，nameTextView 自动更新
    }
}
```

### 3.2 双向绑定（@={}）

双向绑定允许 View 和 ViewModel 之间的数据同步更新：

```xml
<data>
    <variable
        name="user"
        type="com.example.myapp.data.User" />
</data>

<!-- 双向绑定：数据在 EditText 和 user.name 之间双向同步 -->
<EditText
    android:id="@+id/nameEditText"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@={user.name}" />

<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@={user.email}" />

<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@={user.phone}" />
```

```kotlin
// 数据模型
data class User(
    val id: String,
    var name: String = "",
    var email: String = "",
    var phone: String = ""
)

// 使用双向绑定
class UserEditActivity : AppCompatActivity() {
    private val viewModel: UserEditViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val binding = ActivityUserEditBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.lifecycleOwner = this
        binding.user = viewModel.user.value ?: User()
        
        // 用户输入时，user.name 自动更新
        // user.name 变化时，EditText 自动更新
    }
}
```

### 3.3 双向绑定的注意事项

```kotlin
// 注意 1：双向绑定要求属性是可变的
// ❌ 错误：val 属性无法双向绑定
data class User(
    val name: String  // 无法双向绑定
)

// ✅ 正确：var 属性可以双向绑定
data class User(
    var name: String = ""  // 可以双向绑定
)

// 注意 2：复杂类型需要实现 Observable 或使用 Binder
class ObservableUser {
    @Bindable
    var name: String = ""
        set(value) {
            field = value
            notifyPropertyChanged(BR.name)
        }
}

// 注意 3：双向绑定可能影响性能
// 每次输入都会触发数据更新
// 对于频繁输入的字段，建议使用单向绑定 + 手动提交
```

### 3.4 单向 vs 双向对比

| 特性 | 单向绑定 (@{}) | 双向绑定 (@={}) |
|------|--------------|---------------|
| 数据流向 | ViewModel → View | ViewModel ⇄ View |
| 性能 | 较好 | 稍差（每次变化都触发更新） |
| 适用场景 | 展示数据 | 表单输入 |
| 内存占用 | 较低 | 较高 |
| 调试难度 | 简单 | 较复杂 |

```xml
<!-- 推荐使用单向绑定 + 监听器处理输入 -->
<EditText
    android:id="@+id/nameEditText"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Enter name"
    android:textChangeListener="@{()->viewModel.onNameChange}" />

<!-- 或使用 TextWatcher -->
<EditText
    android:id="@+id/nameEditText"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:afterTextChanged="@{viewModel::onNameChanged}" />
```

---

## 4. BindingAdapter 自定义绑定

### 4.1 基础自定义 BindingAdapter

```kotlin
// 自定义 BindingAdapter
object BindingAdapters {
    
    // 1. 图片加载
    @BindingAdapter("app:imageUrl")
    fun loadImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(R.drawable.placeholder)
            return
        }
        Glide.with(view.context)
            .load(url)
            .placeholder(R.drawable.placeholder)
            .error(R.drawable.error)
            .into(view)
    }
    
    // 2. 圆角图片
    @BindingAdapter("app:circularImage")
    fun loadCircularImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) return
        Glide.with(view.context)
            .load(url)
            .circleCrop()
            .into(view)
    }
    
    // 3. 文本颜色
    @BindingAdapter("android:textColor")
    fun setTextColor(view: TextView, colorInt: Int) {
        view.setTextColor(Color.parseColor("#$colorInt"))
    }
    
    // 4. 可见性转换
    @BindingAdapter("android:visibility")
    fun setVisibility(view: View, isVisible: Boolean) {
        view.visibility = if (isVisible) View.VISIBLE else View.GONE
    }
    
    // 5. 多参数 BindingAdapter
    @BindingAdapter("app:imageUrl", "app:placeholder", "app:error")
    fun loadImageWithPlaceholders(
        view: ImageView,
        url: String?,
        @DrawableRes placeholder: Int,
        @DrawableRes error: Int
    ) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(placeholder)
            return
        }
        Glide.with(view.context)
            .load(url)
            .placeholder(placeholder)
            .error(error)
            .into(view)
    }
}
```

### 4.2 在布局中使用自定义 BindingAdapter

```xml
<layout>
    <data>
        <variable
            name="user"
            type="com.example.myapp.data.User" />
    </data>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">

        <!-- 使用自定义图片加载 -->
        <ImageView
            android:layout_width="100dp"
            android:layout_height="100dp"
            app:imageUrl="@{user.avatarUrl}" />
        
        <!-- 使用圆角图片 -->
        <ImageView
            android:layout_width="80dp"
            android:layout_height="80dp"
            app:circularImage="@{user.profilePicture}" />
        
        <!-- 使用多参数绑定 -->
        <ImageView
            android:layout_width="120dp"
            android:layout_height="120dp"
            app:imageUrl="@{user.coverImage}"
            app:placeholder="@drawable/cover_placeholder"
            app:error="@drawable/cover_error" />
        
        <!-- 使用可见性转换 -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{user.name}"
            android:visibility="@{user.isActive}" />

    </LinearLayout>
</layout>
```

### 4.3 高级 BindingAdapter 示例

```kotlin
object AdvancedBindingAdapters {
    
    // 1. 点击事件处理
    @BindingAdapter("android:onClick")
    fun setClickHandler(view: View, clickHandler: Clickable?) {
        view.setOnClickListener {
            clickHandler?.onClick(it)
        }
    }
    
    // 2. 长按事件处理
    @BindingAdapter("app:onLongClick")
    fun setLongClickHandler(view: View, clickHandler: Clickable?) {
        view.setOnLongClickListener {
            clickHandler?.onClick(it)
            true
        }
    }
    
    // 3. 文本格式化
    @BindingAdapter("app:formattedText")
    fun setFormattedText(view: TextView, text: String?) {
        val formatted = text?.let {
            it.replace("\\s+".toRegex(), " ").trim()
        } ?: ""
        view.text = formatted
    }
    
    // 4. 数字格式化
    @BindingAdapter("app:formattedNumber")
    fun setFormattedNumber(view: TextView, number: Double?) {
        val formatted = number?.let {
                String.format("%.2f", it)
            } ?: "0.00"
        view.text = formatted
    }
    
    // 5. 日期格式化
    @BindingAdapter("app:formattedDate")
    fun setFormattedDate(view: TextView, timestamp: Long?) {
        val formatted = timestamp?.let {
            SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
                .format(Date(it))
        } ?: "N/A"
        view.text = formatted
    }
    
    // 6. RecyclerView 适配器设置
    @BindingAdapter("app:items", "app:itemClick")
    fun setRecyclerViewAdapter(
        recyclerView: RecyclerView,
        items: List<Any>?,
        itemClickListener: ItemClickListener?
    ) {
        val adapter = recyclerView.adapter as? MyAdapter
        adapter?.submitList(items)
        adapter?.onItemClick = itemClickListener
    }
    
    // 7. ProgressBar 可见性
    @BindingAdapter("android:indeterminate", "app:showWhenLoading")
    fun setProgressBarVisibility(
        progressBar: ProgressBar,
        isIndeterminate: Boolean?,
        isLoading: Boolean
    ) {
        progressBar.isIndeterminate = isIndeterminate ?: true
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
    }
    
    // 8. 颜色解析
    @BindingAdapter("app:tint")
    fun setTint(view: ImageView, colorString: String?) {
        val color = colorString?.let {
            Color.parseColor(it)
        } ?: Color.TRANSPARENT
        view.imageTintList = ColorStateList.valueOf(color)
    }
}
```

### 4.4 处理空值和默认值

```kotlin
object SafeBindingAdapters {
    
    // 1. 安全的字符串绑定
    @BindingAdapter("app:safeText")
    fun setSafeText(view: TextView, text: String?) {
        view.text = text ?: "N/A"
    }
    
    // 2. 安全的图片绑定
    @BindingAdapter("app:safeImage")
    fun setSafeImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(R.drawable.default_image)
        } else {
            Glide.with(view.context)
                .load(url)
                .placeholder(R.drawable.loading)
                .error(R.drawable.default_image)
                .into(view)
        }
    }
    
    // 3. 安全的可见性绑定
    @BindingAdapter("app:goneIfEmpty")
    fun setGoneIfEmpty(view: View, text: String?) {
        view.visibility = if (text.isNullOrEmpty()) {
            View.GONE
        } else {
            View.VISIBLE
        }
    }
    
    // 4. 安全的数字绑定
    @BindingAdapter("app:positiveNumber")
    fun setPositiveNumber(view: TextView, number: Int?) {
        val value = number?.takeIf { it >= 0 } ?: 0
        view.text = value.toString()
    }
}
```

### 4.5 使用 Lambda 表达式

```kotlin
// 定义可点击接口
interface Clickable {
    fun onClick(view: View)
}

@BindingAdapter("android:onClick")
fun setClickHandler(view: View, clickable: Clickable?) {
    view.setOnClickListener {
        clickable?.onClick(it)
    }
}

// 在 ViewModel 中实现
class MyViewModel : ViewModel() {
    fun onItemClick(item: Item) {
        // 处理点击
    }
}

// 在布局中使用
<data>
    <variable
        name="viewModel"
        type="com.example.myapp.viewmodel.MyViewModel" />
</data>

<ImageView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:onClick="@{() -> viewModel.onItemClick(item)}" />
```

---

## 5. 表达式语言

### 5.1 字符串连接

```xml
<data>
    <variable
        name="user"
        type="com.example.myapp.data.User" />
    <variable
        name="greeting"
        type="String" />
</data>

<!-- 字符串连接 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{greeting + ', ' + user.name + '!'}" />

<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{'Welcome, ' + user.name}" />
```

### 5.2 算术运算

```xml
<data>
    <variable
        name="price"
        type="Double" />
    <variable
        name="tax"
        type="Double" />
    <variable
        name="quantity"
        type="Int" />
</data>

<!-- 加法 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{String.format('%.2f', price + tax)}" />

<!-- 乘法 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{String.format('%.2f', price * quantity)}" />

<!-- 减法 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{String.format('%.2f', price - price * 0.1)}" />

<!-- 除法 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{String.format('%.2f', price / quantity)}" />
```

### 5.3 条件表达式

```xml
<data>
    <variable
        name="user"
        type="com.example.myapp.data.User" />
    <variable
        name="count"
        type="Int" />
</data>

<!-- 三元运算符 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{user.isActive ? 'Active' : 'Inactive'}" />

<!-- 可见性控制 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{user.name}"
    android:visibility="@{user.name != null ? View.VISIBLE : View.GONE}" />

<!-- 颜色控制 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{user.name}"
    android:textColor="@{user.isActive ? @color/green : @color/red}" />

<!-- 复杂条件 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{count == 0 ? 'No items' : count == 1 ? '1 item' : count + ' items'}" />
```

### 5.4 逻辑运算

```xml
<data>
    <variable
        name="user"
        type="com.example.myapp.data.User" />
    <variable
        name="isAdmin"
        type="Boolean" />
</data>

<!-- 逻辑与 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:visibility="@{user.isActive &amp;&amp; isAdmin ? View.VISIBLE : View.GONE}" />

<!-- 逻辑或 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:visibility="@{user.isAdmin || user.isModerator ? View.VISIBLE : View.GONE}" />

<!-- 逻辑非 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:visibility="@{!user.isHidden ? View.VISIBLE : View.GONE}" />

<!-- 组合逻辑 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:visibility="@{(user.isActive &amp;&amp; !user.isBanned) || user.isAdmin ? View.VISIBLE : View.GONE}" />
```

### 5.5 比较运算

```xml
<data>
    <variable
        name="age"
        type="Int" />
    <variable
        name="score"
        type="Double" />
    <variable
        name="name"
        type="String" />
</data>

<!-- 等于 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{age == 18 ? 'Adult' : 'Minor'}" />

<!-- 不等于 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{name != null ? name : 'Anonymous'}" />

<!-- 大于/小于 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{score > 60 ? 'Pass' : 'Fail'}" />

<!-- 大于等于/小于等于 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : 'Average'}" />
```

### 5.6 方法调用

```xml
<data>
    <import type="java.text.SimpleDateFormat" />
    <import type="com.example.myapp.util.DateUtils" />
    <import type="com.example.myapp.util.StringUtils" />
    
    <variable
        name="user"
        type="com.example.myapp.data.User" />
    <variable
        name="viewModel"
        type="com.example.myapp.viewmodel.UserViewModel" />
</data>

<!-- 调用静态方法 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{DateUtils.formatDate(user.birthDate)}" />

<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{StringUtils.capitalize(user.name)}" />

<!-- 调用实例方法 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{user.getDisplayName()}" />

<!-- 调用 ViewModel 方法 -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Delete"
    android:onClick="@{() -> viewModel.deleteUser(user)}" />

<!-- 带参数的方法调用 -->
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Share"
    android:onClick="@{() -> viewModel.shareUser(user.id, user.name)}" />
```

### 5.7 集合访问

```xml
<data>
    <variable
        name="items"
        type="List&lt;com.example.myapp.data.Item&gt;" />
    <variable
        name="userMap"
        type="Map&lt;String, com.example.myapp.data.User&gt;" />
</data>

<!-- List 访问 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{items[0].name}" />

<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{items.size + ' items'}" />

<!-- Map 访问 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{userMap['key'].name}" />

<!-- 嵌套访问 -->
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@{items[0].tags[0].name}" />
```

### 5.8 操作符优先级

```xml
<!-- 注意操作符优先级 -->
<!-- * / % 优先级最高 -->
<!-- + - 次之 -->
<!-- < > <= >= -->
<!-- == != -->
<!-- &amp;&amp; -->
<!-- || -->
<!-- 三元运算符 ? : 优先级最低 -->

<!-- 建议使用括号确保正确性 -->
<TextView
    android:text="@{(a + b) * c}" />  <!-- 明确 -->
<TextView
    android:text="@{a + b * c}" />  <!-- b * c 先计算 -->
```

---

## 6. 图片绑定

### 6.1 使用 ImageBindingAdapter

```kotlin
// 图片绑定适配器
object ImageBindingAdapters {
    
    // 基础图片加载
    @BindingAdapter("app:image")
    fun setImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(R.drawable.placeholder)
            return
        }
        Glide.with(view.context)
            .load(url)
            .placeholder(R.drawable.loading)
            .error(R.drawable.error)
            .centerCrop()
            .into(view)
    }
    
    // 圆角图片
    @BindingAdapter("app:circularImage")
    fun setCircularImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) return
        Glide.with(view.context)
            .load(url)
            .circleCrop()
            .placeholder(R.drawable.loading)
            .error(R.drawable.error)
            .into(view)
    }
    
    // 圆角矩形图片
    @BindingAdapter("app:roundedImage", "app:cornerRadius")
    fun setRoundedImage(
        view: ImageView,
        url: String?,
        cornerRadius: Float
    ) {
        if (url.isNullOrEmpty()) return
        Glide.with(view.context)
            .load(url)
            .transform(RoundedCornersTransformation(cornerRadius, 0f))
            .placeholder(R.drawable.loading)
            .error(R.drawable.error)
            .into(view)
    }
    
    // 带占位符和错误图标的图片
    @BindingAdapter("app:image", "app:placeholder", "app:errorImage")
    fun setImageWithPlaceholders(
        view: ImageView,
        url: String?,
        @DrawableRes placeholder: Int,
        @DrawableRes errorImage: Int
    ) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(placeholder)
            return
        }
        Glide.with(view.context)
            .load(url)
            .placeholder(placeholder)
            .error(errorImage)
            .into(view)
    }
    
    // 使用 Picasso
    @BindingAdapter("app:picassoImage")
    fun setPicassoImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(R.drawable.placeholder)
            return
        }
        Picasso.get()
            .load(url)
            .placeholder(R.drawable.loading)
            .error(R.drawable.error)
            .into(view)
    }
    
    // 使用 Coil（Kotlin 协程友好）
    @BindingAdapter("app:coilImage")
    fun setCoilImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            view.setImageResource(R.drawable.placeholder)
            return
        }
        val context = view.context
        view.lifecycleOwner?.lifecycleScope?.launch {
            view.setImageDrawable(
                context.imageLoader
                    .execute(context, ImageRequest.Builder(context, url).build())
                    .drawable
            )
        }
    }
}
```

### 6.2 在布局中使用图片绑定

```xml
<layout>
    <data>
        <variable
            name="user"
            type="com.example.myapp.data.User" />
    </data>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">

        <!-- 基础图片 -->
        <ImageView
            android:layout_width="200dp"
            android:layout_height="200dp"
            app:image="@{user.avatarUrl}" />
        
        <!-- 圆形头像 -->
        <ImageView
            android:layout_width="80dp"
            android:layout_height="80dp"
            app:circularImage="@{user.profilePicture}" />
        
        <!-- 圆角矩形图片 -->
        <ImageView
            android:layout_width="150dp"
            android:layout_height="150dp"
            app:roundedImage="@{user.coverImage}"
            app:cornerRadius="@{16f}" />
        
        <!-- 带占位符的图片 -->
        <ImageView
            android:layout_width="match_parent"
            android:layout_height="200dp"
            app:image="@{user.backgroundImage}"
            app:placeholder="@drawable/bg_placeholder"
            app:errorImage="@drawable/bg_error" />

    </LinearLayout>
</layout>
```

### 6.3 图片绑定优化

```kotlin
// 优化 1：缓存图片
@BindingAdapter("app:cachedImage")
fun setCachedImage(view: ImageView, url: String?) {
    if (url.isNullOrEmpty()) return
    Glide.with(view.context)
        .load(url)
        .centerCrop()
        .diskCacheStrategy(DiskCacheStrategy.ALL)  // 缓存磁盘和内存
        .into(view)
}

// 优化 2：预加载图片
@BindingAdapter("app:preloadImage")
fun preloadImage(view: View, url: String?) {
    if (url.isNullOrEmpty()) return
    Glide.with(view.context)
        .preload(url)
}

// 优化 3：渐进式加载
@BindingAdapter("app:progressiveImage")
fun setProgressiveImage(view: ImageView, url: String?) {
    if (url.isNullOrEmpty()) return
    Glide.with(view.context)
        .load(url)
        .centerCrop()
        .placeholder(R.drawable.loading)
        .error(R.drawable.error)
        .thumbnail(0.25f)  // 先加载缩略图
        .into(view)
}

// 优化 4：图片尺寸优化
@BindingAdapter("app:optimizedImage", "app:width", "app:height")
fun setOptimizedImage(
    view: ImageView,
    url: String?,
    width: Int,
    height: Int
) {
    if (url.isNullOrEmpty()) return
    Glide.with(view.context)
        .load(url)
        .override(width, height)  // 指定目标尺寸
        .centerCrop()
        .into(view)
}
```

### 6.4 图片变换

```kotlin
// 图片变换适配器
object ImageTransformAdapters {
    
    @BindingAdapter("app:blurImage")
    fun setBlurImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) return
        Glide.with(view.context)
            .load(url)
            .transform(BlurTransformation(25f, true))
            .into(view)
    }
    
    @BindingAdapter("app:grayscaleImage")
    fun setGrayscaleImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) return
        Glide.with(view.context)
            .load(url)
            .transform(GrayscaleTransformation())
            .into(view)
    }
    
    @BindingAdapter("app:roundedTopImage")
    fun setRoundedTopImage(view: ImageView, url: String?) {
        if (url.isNullOrEmpty()) return
        Glide.with(view.context)
            .load(url)
            .transform(RoundedCornersTransformation(topLeft = 16f, topRight = 16f))
            .into(view)
    }
}
```

---

## 7. DataBinding vs ViewBinding

### 7.1 ViewBinding 简介

```kotlin
// ViewBinding 是编译时为布局文件生成的绑定类
// 不需要在布局中添加 <layout> 和 <data> 标签

// 生成的代码示例：
class ActivityMainBinding {
    val textView: TextView
    val button: Button
    // ...
}

// 使用方式
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.textView.text = "Hello"
        binding.button.setOnClickListener { /* ... */ }
    }
}
```

### 7.2 对比表格

| 特性 | DataBinding | ViewBinding |
|------|------------|-------------|
| 数据绑定 | ✅ 支持 | ❌ 不支持 |
| 表达式语言 | ✅ 支持 | ❌ 不支持 |
| 双向绑定 | ✅ 支持 | ❌ 不支持 |
| 性能 | 稍慢（表达式解析） | 更快（直接字段访问） |
| 空安全 | 部分支持 | ✅ 完全支持 |
| 学习曲线 | 陡峭 | 平缓 |
| 文件大小 | 较大 | 较小 |

### 7.3 使用场景建议

```
使用 DataBinding 的场景：
- 需要数据绑定
- 需要在布局中使用表达式
- 需要双向绑定
- 复杂的 UI 绑定逻辑

使用 ViewBinding 的场景：
- 只需要访问视图
- 追求更好的性能
- 简单的 UI 交互
- 与 ViewModel 配合使用

最佳实践：两者结合使用
- 使用 ViewBinding 访问视图
- 使用 DataBinding 处理数据绑定
- 在需要数据绑定的地方使用 DataBinding
```

### 7.4 混合使用示例

```kotlin
// 启用 ViewBinding 和 DataBinding
buildFeatures {
    viewBinding true
    dataBinding true
}

// 在 Activity 中使用
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 使用 ViewBinding 访问视图
        binding.button.setOnClickListener {
            viewModel.increment()
        }
        
        // 使用 DataBinding 绑定数据
        binding.lifecycleOwner = this
        binding.viewModel = viewModel
    }
}

// 布局文件使用 DataBinding
<layout>
    <data>
        <variable
            name="viewModel"
            type="com.example.MainViewModel" />
    </data>
    <LinearLayout>
        <TextView
            android:text="@{viewModel.count}" />
    </LinearLayout>
</layout>
```

---

## 8. DataBinding vs Compose

### 8.1 Compose 简介

```kotlin
// Jetpack Compose 是 Android 的新声明式 UI 框架
// 使用 Kotlin 代码构建 UI，而不是 XML

@Composable
fun UserCard(user: User) {
    Column {
        CircularProgressIndicator(
            modifier = Modifier.size(80.dp),
            // 圆角头像
        )
        Text(
            text = user.name,
            style = MaterialTheme.typography.h6
        )
        Text(
            text = user.email,
            style = MaterialTheme.typography.body2
        )
    }
}
```

### 8.2 对比表格

| 特性 | DataBinding | Compose |
|------|------------|---------|
| 声明式 | ✅ XML 声明 | ✅ 代码声明 |
| 学习曲线 | 中等 | 较陡 |
| 性能 | 中等 | 优秀（增量渲染） |
| 可测试性 | 中等 | 优秀 |
| 调试工具 | 中等 | 优秀（Layout Inspector） |
| 与现有代码兼容 | ✅ 完全兼容 | 需要适配 |
| 动画支持 | 有限 | ✅ 优秀 |

### 8.3 迁移建议

```
从 DataBinding 迁移到 Compose 的建议：

1. 新项目：直接使用 Compose
2. 现有项目：逐步迁移
   - 先迁移新功能的 UI
   - 逐步重构现有功能
   - 使用 ComposeView 集成

3. 混合使用：
   - 保留现有的 DataBinding 布局
   - 新功能使用 Compose
   - 通过 ComposeView 桥接
```

### 8.4 混合使用示例

```kotlin
// 在 View 中使用 Compose
AndroidView(
    factory = { context ->
        ComposeView(context).apply {
            setComposeView(
                UserCard(
                    user = User("张三", "zhangsan@example.com")
                )
            )
        }
    }
)

// 在 Compose 中使用 View
@Composable
fun MyScreen() {
    AndroidView(
        factory = { context ->
            // 创建传统的 View
            TextView(context)
        }
    )
}
```

---

## 9. 性能优化建议

### 9.1 减少不必要的绑定

```xml
<!-- ❌ 错误：频繁计算的表达式 -->
<TextView
    android:text="@{user.name + ' ' + user.lastName + ' ' + user.title}" />

<!-- ✅ 正确：在 ViewModel 中预计算 -->
<TextView
    android:text="@{user.fullDisplayName}" />
```

```kotlin
// ViewModel 中预计算
data class User(
    val name: String,
    val lastName: String,
    val title: String,
    val fullDisplayName: String = "$name $lastName $title"
)
```

### 9.2 使用单向绑定

```xml
<!-- ❌ 错误：频繁输入使用双向绑定 -->
<EditText
    android:text="@={user.name}" />

<!-- ✅ 正确：使用单向绑定 + TextWatcher -->
<EditText
    android:id="@+id/nameEditText"
    android:text="@{user.name}"
    android:afterTextChanged="@{viewModel::onNameChanged}" />
```

### 9.3 避免在表达式中调用方法

```xml
<!-- ❌ 错误：表达式中调用方法 -->
<TextView
    android:text="@{DateUtils.formatDate(user.birthDate)}" />

<!-- ✅ 正确：在数据类中预计算 -->
<TextView
    android:text="@{user.formattedBirthDate}" />
```

```kotlin
data class User(
    val birthDate: Date,
    val formattedBirthDate: String = DateUtils.formatDate(birthDate)
)
```

### 9.4 使用 observeAsState 而非直接绑定

```kotlin
// ❌ 错误：直接绑定 LiveData
binding.lifecycleOwner = this
binding.user = viewModel.user

// ✅ 正确：使用 observeAsState（Compose）或手动观察
viewLifecycleOwner.lifecycleScope.launch {
    viewModel.user.collect { user ->
        binding.user = user
    }
}
```

### 9.5 延迟绑定

```kotlin
// 延迟绑定可以减少初始渲染时间
class MyActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMyBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 延迟设置数据绑定
        binding.lifecycleOwner = this
        
        // 在数据准备好后再设置
        viewModel.data.observe(this) { data ->
            binding.data = data
        }
    }
}
```

### 9.6 使用 ViewBinding 替代 DataBinding（简单场景）

```kotlin
// 简单场景使用 ViewBinding 性能更好
class MyActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMyBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 直接设置文本
        binding.textView.text = "Hello"
    }
}
```

### 9.7 避免在布局中导入过多类

```xml
<!-- ❌ 错误：导入过多类 -->
<data>
    <import type="java.util.List" />
    <import type="java.util.Map" />
    <import type="java.util.Set" />
    <import type="android.view.View" />
    <import type="android.widget.LinearLayout" />
    <import type="android.widget.RelativeLayout" />
    <!-- ... 更多导入 -->
</data>

<!-- ✅ 正确：只导入必要的类 -->
<data>
    <import type="android.view.View" />
    <import type="com.example.myapp.util.DateUtils" />
</data>
```

---

## 10. 面试考点

### 基础考点

#### 1. DataBinding 的作用是什么？

```
答案要点：
- 将布局文件与数据源绑定
- 减少 findViewById 的使用
- 提供声明式的数据绑定方式
- 支持单向和双向绑定
```

#### 2. DataBinding 的基本配置？

```groovy
buildFeatures {
    dataBinding true
}

// 布局文件根元素必须是 <layout>
<layout>
    <data>
        <variable ... />
    </data>
    <LinearLayout>...</LinearLayout>
</layout>
```

#### 3. 单向绑定和双向绑定的区别？

```
单向绑定 (@{})：数据从 ViewModel 流向 View
双向绑定 (@={})：数据在 ViewModel 和 View 之间双向同步

双向绑定要求属性是可变的 (var)
双向绑定性能稍差，因为每次变化都触发更新
```

#### 4. BindingAdapter 是什么？如何使用？

```kotlin
@BindingAdapter("app:customAttribute")
fun setCustomAttribute(view: View, value: String?) {
    // 自定义绑定逻辑
}

<!-- 在布局中使用 -->
<View
    app:customAttribute="@{user.value}" />
```

### 进阶考点

#### 5. DataBinding 的性能优化？

```
答案要点：
1. 减少表达式复杂度
2. 使用单向绑定替代双向绑定
3. 在 ViewModel 中预计算数据
4. 避免在表达式中调用方法
5. 减少不必要的导入
```

#### 6. DataBinding 与 ViewBinding 的对比？

```
DataBinding:
- 支持数据绑定和表达式
- 性能稍慢
- 学习曲线较陡

ViewBinding:
- 只提供视图访问
- 性能更好
- 学习曲线平缓
```

#### 7. 如何处理 DataBinding 中的空值？

```kotlin
// 方式 1：在表达式中处理
<TextView
    android:text="@{user.name != null ? user.name : 'N/A'}" />

// 方式 2：在 BindingAdapter 中处理
@BindingAdapter("app:safeText")
fun setSafeText(view: TextView, text: String?) {
    view.text = text ?: "N/A"
}

// 方式 3：在 ViewModel 中提供默认值
data class User(
    val name: String = "N/A"
)
```

### 高级考点

#### 8. DataBinding 的实现原理？

```
答案要点：
1. 编译时生成 Binding 类
2. 使用 Reflection 和 Binder 更新属性
3. 使用 WeakReference 避免内存泄漏
4. 使用 Observable 监听数据变化
5. 通过 DataBinder 管理绑定关系
```

#### 9. 如何实现自定义 BindingAdapter？

```kotlin
// 单参数
@BindingAdapter("app:custom")
fun setCustom(view: View, value: String) {
    // 实现
}

// 多参数
@BindingAdapter("app:custom1", "app:custom2")
fun setCustom(
    view: View,
    value1: String,
    value2: String
) {
    // 实现
}

// 使用 @AllOf 处理多个同名属性
@BindingAdapter("android:text")
@JvmStatic
fun setText(view: TextView, text: String?) {
    view.text = text
}
```

#### 10. DataBinding 的常见坑？

```
常见坑：
1. 双向绑定导致性能问题
2. 表达式中方法调用导致频繁更新
3. 循环引用导致内存泄漏
4. 布局文件缺少 <layout> 标签
5. 导入的类没有使用

解决方案：
1. 使用单向绑定 + 监听器
2. 在 ViewModel 中预计算
3. 避免持有 View 引用
4. 检查布局文件结构
5. 清理未使用的导入
```

---

## 11. 参考资料

### 官方文档

- [DataBinding 官方文档](https://developer.android.com/topic/libraries/data-binding)
- [ViewBinding 官方文档](https://developer.android.com/topic/libraries/view-binding)
- [Jetpack Compose 官方文档](https://developer.android.com/jetpack/compose)

### 推荐资源

- [Android Codelabs - DataBinding](https://developer.android.com/codelabs/basic-android-kotlin-training-view-binding)
- [Now in Android](https://github.com/android/nowinandroid)

### 书籍

- 《Android Kotlin Fundamentals》
- 《First Android》

---

*本文完，感谢阅读！*
