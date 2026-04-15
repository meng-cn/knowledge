# Jetpack 组件全家桶 🧰

> Android 官方架构组件，现代化开发必备

---

## 一、Lifecycle 生命周期感知

### 1.1 基础使用

```kotlin
// 1. 添加依赖
dependencies {
    val lifecycle_version = "2.7.0"
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:$lifecycle_version")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:$lifecycle_version")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:$lifecycle_version")
}

// 2. LifecycleObserver
class MyLifecycleObserver : LifecycleObserver {
    
    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreate(owner: LifecycleOwner) {
        Log.d("Lifecycle", "ON_CREATE")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStart(owner: LifecycleOwner) {
        Log.d("Lifecycle", "ON_START")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    fun onResume(owner: LifecycleOwner) {
        Log.d("Lifecycle", "ON_RESUME")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    fun onPause(owner: LifecycleOwner) {
        Log.d("Lifecycle", "ON_PAUSE")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStop(owner: LifecycleOwner) {
        Log.d("Lifecycle", "ON_STOP")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    fun onDestroy(owner: LifecycleOwner) {
        Log.d("Lifecycle", "ON_DESTROY")
    }
}

// 3. 使用
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val observer = MyLifecycleObserver()
        lifecycle.addObserver(observer)
    }
}

// 4. 使用协程作用域（推荐）
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 在 STARTED 状态收集，STOPPED 自动暂停
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    updateUI(state)
                }
            }
        }
        
        // 或在 RESUMED 状态收集
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.RESUMED) {
                viewModel.flow.collect { value ->
                    // 只在可见时更新
                }
            }
        }
    }
}
```

### 1.2 LifecycleService

```kotlin
// 生命周期感知的 Service
class MyLifecycleService : LifecycleService() {
    
    private val observer = MyLifecycleObserver()
    
    override fun onCreate() {
        super.onCreate()
        lifecycle.addObserver(observer)
    }
}
```

### 1.3 ProcessLifecycleOwner

```kotlin
// 应用级生命周期
class MyApplication : Application(), LifecycleObserver {
    
    override fun onCreate() {
        super.onCreate()
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onAppForeground() {
        Log.d("App", "App 进入前台")
    }
    
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onAppBackground() {
        Log.d("App", "App 进入后台")
    }
}
```

---

## 二、ViewModel 数据持有

### 2.1 ViewModel 基础

```kotlin
// 1. 创建 ViewModel
class UserViewModel : ViewModel() {
    
    // UI 数据
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
    
    // 加载数据
    fun loadUsers() {
        viewModelScope.launch {
            val userList = repository.getUsers()
            _users.value = userList
        }
    }
    
    // ViewModel 销毁时自动取消协程
    override fun onCleared() {
        super.onCleared()
        // 清理资源
    }
}

// 2. Activity 中使用
class MainActivity : AppCompatActivity() {
    
    // 方式 1: 委托属性（推荐）
    private val viewModel: UserViewModel by viewModels()
    
    // 方式 2: ViewModelProvider
    private lateinit var viewModel: UserViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        viewModel = ViewModelProvider(this)[UserViewModel::class.java]
        
        // 观察数据
        viewModel.users.observe(this) { users ->
            adapter.submitList(users)
        }
    }
}

// 3. Fragment 中使用
class UserFragment : Fragment() {
    
    // 与 Activity 共享 ViewModel
    private val viewModel: UserViewModel by activityViewModels()
    
    // Fragment 独立的 ViewModel
    private val fragmentViewModel: UserViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 观察数据
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.users.collect { users ->
                    // 更新 UI
                }
            }
        }
    }
}
```

### 2.2 SavedStateHandle

```kotlin
// 1. 保存状态
class UserViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 保存和恢复数据
    private val userId: Int? = savedStateHandle["user_id"]
    
    fun setUserId(id: Int) {
        savedStateHandle["user_id"] = id
    }
    
    // 监听变化
    val userIdFlow = savedStateHandle.getStateFlow("user_id", 0)
}

// 2. 使用
class MainActivity : AppCompatActivity() {
    
    private val viewModel: UserViewModel by viewModels {
        UserViewModelFactory(
            defaultArgs = intent.extras?.let { bundle ->
                SavedStateHandle.from(bundle)
            }
        )
    }
}
```

---

## 三、LiveData 可观察数据

### 3.1 LiveData 基础

```kotlin
class MyViewModel : ViewModel() {
    
    // MutableLiveData - 可修改
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    // 设置值
    fun setData(value: String) {
        _data.value = value  // 主线程
    }
    
    // 异步设置
    fun loadAsync() {
        viewModelScope.launch {
            val result = withContext(Dispatchers.IO) {
                fetchData()
            }
            _data.postValue(result)  // 子线程
        }
    }
    
    // 观察
    fun observe(activity: AppCompatActivity) {
        data.observe(activity) { value ->
            // 自动生命周期管理
            updateUI(value)
        }
    }
}
```

### 3.2 LiveData 转换

```kotlin
class MyViewModel : ViewModel() {
    
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
    
    // map 转换
    val userNames: LiveData<List<String>> = users.map { userList ->
        userList.map { user -> user.name }
    }
    
    // switchMap（切换数据源）
    val userId = MutableLiveData<Int>()
    val userData: LiveData<User> = userId.switchMap { id ->
        repository.getUserLiveData(id)
    }
    
    // MediatorLiveData（合并多个数据源）
    val combinedData = MediatorLiveData<Pair<List<User>, List<Post>>>()
    
    init {
        val usersSource = users
        val postsSource = posts
        
        combinedData.addSource(usersSource) { users ->
            combinedData.value = users to postsSource.value
        }
        
        combinedData.addSource(postsSource) { posts ->
            combinedData.value = usersSource.value to posts
        }
    }
}
```

### 3.3 LiveData vs StateFlow

```kotlin
// LiveData
val liveData = MutableLiveData<String>()
liveData.observe(lifecycleOwner) { value ->
    // 自动生命周期管理
}

// StateFlow
val stateFlow = MutableStateFlow<String>("")
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        stateFlow.collect { value ->
            // 需要手动管理生命周期
        }
    }
}

// 转换
val stateFlowAsLiveData = stateFlow.asLiveData()
val liveDataAsStateFlow = liveData.asFlow()
```

---

## 四、Navigation 导航组件

### 4.1 基础配置

```kotlin
// 1. 添加依赖
dependencies {
    val nav_version = "2.7.6"
    implementation("androidx.navigation:navigation-fragment-ktx:$nav_version")
    implementation("androidx.navigation:navigation-ui-ktx:$nav_version")
}

// 2. 创建导航图
// res/navigation/nav_graph.xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">
    
    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.HomeFragment"
        android:label="Home">
        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/detailFragment" />
    </fragment>
    
    <fragment
        android:id="@+id/detailFragment"
        android:name="com.example.DetailFragment"
        android:label="Detail">
        <argument
            android:name="itemId"
            app:argType="string" />
    </fragment>
</navigation>

// 3. 在 Activity 中使用
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val navController = findNavController(R.id.nav_host_fragment)
        setupActionBarWithNavController(navController)
    }
    
    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment)
        return navController.navigateUp() || super.onSupportNavigateUp()
    }
}
```

### 4.2 SafeArgs 类型安全导航

```kotlin
// 1. 启用 SafeArgs
// build.gradle.kts
plugins {
    id("androidx.navigation.safeargs.kotlin")
}

// 2. 生成 Directions 和 Args 类
// HomeFragmentDirections 和 DetailFragmentArgs

// 3. 使用
class HomeFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        button.setOnClickListener {
            val action = HomeFragmentDirections.actionHomeToDetail("item_123")
            findNavController().navigate(action)
        }
    }
}

// 4. 接收参数
class DetailFragment : Fragment() {
    
    private val args: DetailFragmentArgs by navArgs()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val itemId = args.itemId  // 类型安全
        println("Item ID: $itemId")
    }
}
```

### 4.3 深层链接

```xml
<!-- nav_graph.xml -->
<fragment
    android:id="@+id/detailFragment"
    android:name="com.example.DetailFragment">
    <argument
        android:name="itemId"
        app:argType="string" />
    <deepLink
        android:id="@+id/deepLink"
        app:uri="example://detail/{itemId}" />
</fragment>
```

```kotlin
// AndroidManifest.xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="example" android:host="detail" />
</intent-filter>
```

---

## 五、Room 数据库

详见 `04_Storage/01_Room 与数据存储.md`

---

## 六、WorkManager 后台任务

### 6.1 基础使用

```kotlin
// 1. 添加依赖
dependencies {
    val work_version = "2.9.0"
    implementation("androidx.work:work-runtime-ktx:$work_version")
}

// 2. 创建 Worker
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        return try {
            // 执行同步任务
            syncData()
            Result.success()
        } catch (e: Exception) {
            Result.retry()  // 重试
        }
    }
    
    private fun syncData() {
        // 同步逻辑
    }
}

// 3. 调度任务
fun scheduleSync(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)  // 需要网络
        .setRequiresCharging(true)  // 需要充电
        .setRequiresBatteryNotLow(true)  // 电量充足
        .build()
    
    val workRequest = OneTimeWorkRequestBuilder<SyncWorker>()
        .setConstraints(constraints)
        .setBackoffCriteria(
            BackoffPolicy.EXPONENTIAL,  // 指数退避
            WorkRequest.MIN_BACKOFF_MILLIS,
            TimeUnit.MILLISECONDS
        )
        .build()
    
    WorkManager.getInstance(context).enqueue(workRequest)
}

// 4. 周期性任务
fun schedulePeriodicSync(context: Context) {
    val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
        repeatInterval = 1,
        repeatIntervalTimeUnit = TimeUnit.HOURS
    )
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()
    
    WorkManager.getInstance(context).enqueue(workRequest)
}

// 5. 监听任务状态
WorkManager.getInstance(context)
    .getWorkInfoByIdLiveData(workRequest.id)
    .observe(this) { workInfo ->
        when (workInfo?.state) {
            WorkInfo.State.RUNNING -> {
                // 运行中
            }
            WorkInfo.State.SUCCEEDED -> {
                // 成功
            }
            WorkInfo.State.FAILED -> {
                // 失败
            }
            else -> {}
        }
    }
```

### 6.2 链式任务

```kotlin
// 顺序执行多个任务
val uploadWork = OneTimeWorkRequestBuilder<UploadWorker>().build()
val notifyWork = OneTimeWorkRequestBuilder<NotifyWorker>().build()

WorkManager.getInstance(context)
    .beginWith(uploadWork)
    .then(notifyWork)  // upload 完成后执行 notify
    .enqueue()
```

### 6.3 传递输入数据

```kotlin
// 1. 创建带数据的 WorkRequest
val data = Data.Builder()
    .putString("key", "value")
    .putInt("count", 10)
    .build()

val workRequest = OneTimeWorkRequestBuilder<MyWorker>()
    .setInputData(data)
    .build()

// 2. Worker 中接收
class MyWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    
    override fun doWork(): Result {
        val inputData = inputData
        val value = inputData.getString("key")
        val count = inputData.getInt("count", 0)
        
        // 处理数据
        
        // 返回输出数据
        val outputData = Data.Builder()
            .putString("result", "success")
            .build()
        
        return Result.success(outputData)
    }
}
```

---

## 七、DataBinding 数据绑定

### 7.1 基础使用

```kotlin
// 1. 启用 DataBinding
// build.gradle.kts
android {
    buildFeatures {
        dataBinding = true
    }
}

// 2. 布局文件
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android">
    <data>
        <variable
            name="user"
            type="com.example.User" />
        <variable
            name="viewModel"
            type="com.example.UserViewModel" />
    </data>
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{user.name}" />
        
        <Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:onClick="@{() -> viewModel.onButtonClick()}"
            android:text="Click" />
    </LinearLayout>
</layout>

// 3. Activity 中使用
class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private val viewModel: UserViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = DataBindingUtil.setContentView(this, R.layout.activity_main)
        binding.user = User("张三", 25)
        binding.viewModel = viewModel
        binding.lifecycleOwner = this
    }
}
```

### 7.2 绑定适配器

```kotlin
// 自定义 BindingAdapter
object BindingAdapters {
    
    @BindingAdapter("imageUrl")
    @JvmStatic
    fun loadImage(view: ImageView, url: String?) {
        Glide.with(view.context)
            .load(url)
            .into(view)
    }
    
    @BindingAdapter("visibleIf")
    @JvmStatic
    fun setVisibleIf(view: View, visible: Boolean) {
        view.visibility = if (visible) View.VISIBLE else View.GONE
    }
    
    @BindingAdapter("errorMessage")
    @JvmStatic
    fun setError(tickerView: TextView, error: String?) {
        if (error != null) {
            tickerView.text = error
            tickerView.visibility = View.VISIBLE
        } else {
            tickerView.visibility = View.GONE
        }
    }
}

// 使用
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    app:imageUrl="@{user.avatar}"
    app:visibleIf="@{user.isActive}"
    app:errorMessage="@{viewModel.error}" />
```

---

## 八、面试核心考点

### 8.1 基础问题

**Q1: ViewModel 为什么能在配置更新时保留数据？**

**A:**
- ViewModel 通过 `ViewModelStore` 持有
- 配置更新（如屏幕旋转）时，Activity 重建但 `ViewModelStore` 保留
- 只有在 `finish()` 或进程被杀时才销毁

**Q2: LiveData 的优势？**

**A:**
1. **生命周期感知**: 只在活跃状态（STARTED/RESUMED）更新
2. **自动管理**: 自动添加/移除观察者
3. **防止内存泄漏**: 与生命周期绑定
4. **数据粘性**: 重新观察时收到最新数据
5. **配置更新保留**: 屏幕旋转数据不丢失

**Q3: Navigation 的优势？**

**A:**
1. **可视化编辑**: Android Studio 导航图
2. **类型安全**: SafeArgs 生成代码
3. **自动处理返回栈**: 简化返回逻辑
4. **深层链接**: 统一处理 deep link
5. **动画支持**: 内置过渡动画

### 8.2 进阶问题

**Q4: LiveData vs StateFlow 如何选择？**

**A:**
| 场景 | 推荐 |
|------|------|
| 旧项目迁移 | LiveData |
| 新项目 | StateFlow |
| 需要多平台 | StateFlow |
| 简单 UI 状态 | LiveData |
| 复杂数据流 | StateFlow |

**Q5: WorkManager 的使用场景？**

**A:**
- **延迟性任务**: 可以稍后执行
- **可确保执行**: 即使应用退出也会执行
- **周期性任务**: 定期同步数据
- **约束任务**: 需要网络/充电等条件

**Q6: 如何实现 Fragment 间通信？**

**A:**
```kotlin
// 方式 1: 共享 ViewModel
class SharedViewModel : ViewModel() {
    val selectedItemId = MutableLiveData<String>()
}

// Fragment A
class FragmentA : Fragment() {
    private val viewModel: SharedViewModel by activityViewModels()
    
    fun selectItem(id: String) {
        viewModel.selectedItemId.value = id
    }
}

// Fragment B
class FragmentB : Fragment() {
    private val viewModel: SharedViewModel by activityViewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewModel.selectedItemId.observe(viewLifecycleOwner) { id ->
            // 接收选中项
        }
    }
}

// 方式 2: Navigation + SafeArgs
val action = FragmentADirections.actionFragmentAToFragmentB(itemId)
findNavController().navigate(action)
```

### 8.3 实战问题

**Q7: 如何使用 SavedStateHandle？**

**A:**
```kotlin
class ProductViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    // 从 SavedStateHandle 获取参数
    private val productId: String = savedStateHandle["product_id"]
    
    // 监听变化
    val productIdFlow = savedStateHandle.getStateFlow<String>("product_id", "")
    
    // 保存状态
    fun setProductId(id: String) {
        savedStateHandle["product_id"] = id
    }
}

// 使用
class ProductActivity : AppCompatActivity() {
    
    private val viewModel: ProductViewModel by viewModels {
        ProductViewModelFactory(
            defaultArgs = intent.extras?.let { bundle ->
                SavedStateHandle.from(bundle)
            }
        )
    }
}
```

**Q8: 如何实现后台数据同步？**

**A:**
```kotlin
// 使用 WorkManager
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        return try {
            // 1. 同步数据
            val repository = MyRepository(applicationContext)
            repository.syncData()
            
            Result.success()
        } catch (e: Exception) {
            // 2. 失败重试
            Result.retry()
        }
    }
}

// 调度
fun scheduleSync(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresCharging(false)
        .build()
    
    val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
        1, TimeUnit.HOURS
    )
    .setConstraints(constraints)
    .build()
    
    WorkManager.getInstance(context).enqueue(workRequest)
}
```

---

## 九、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| ViewModel 保留原理 | ⭐⭐⭐ | ViewModelStore |
| LiveData 优势 | ⭐⭐ | 生命周期感知 |
| Navigation SafeArgs | ⭐⭐ | 类型安全导航 |
| WorkManager 场景 | ⭐⭐⭐ | 延迟性、可确保执行 |
| DataBinding 使用 | ⭐⭐ | 布局绑定 |
| SavedStateHandle | ⭐⭐⭐ | 进程杀死恢复 |
| Fragment 通信 | ⭐⭐ | 共享 ViewModel |
| Lifecycle 感知 | ⭐⭐ | 自动管理 |

---

**📚 参考资料**
- [Android Jetpack](https://developer.android.com/jetpack)
- [ViewModel 官方文档](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [Navigation 官方文档](https://developer.android.com/guide/navigation)

**🔗 下一篇**: [Android 系统架构](../12_System/01_Android 系统架构.md)
