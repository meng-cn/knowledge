# Jetpack Compose

> **字数统计：约 15000 字**  
> **难度等级：⭐⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐⭐**

---

## 目录

1. [Compose 简介](#1-compose-简介)
2. [核心概念](#2-核心概念)
3. [基础使用](#3-基础使用)
4. [状态管理](#4-状态管理)
5. [列表与导航](#5-列表与导航)
6. [布局与动画](#6-布局与动画)
7. [Material Design 3](#7-material-design-3)
8. [性能优化](#8-性能优化)
9. [面试考点](#9-面试考点)

---

## 1. Compose 简介

### 1.1 什么是 Jetpack Compose

```
Jetpack Compose 是 Android 的现代化 UI 工具包：
- 声明式 UI（不同于命令式 View 系统）
- Kotlin 优先
- 无需 XML 布局
- 与现有 View 系统集成
```

### 1.2 与传统 View 的对比

| 特性 | View 系统 | Compose |
|-----|-|-|-|
| 声明方式 | XML | Kotlin 代码 |
| UI 更新 | 手动刷新 | 自动重组 |
| 代码量 | 多 | 少 |
| 学习曲线 | 平缓 | 较陡 |
| 性能 | 优化充分 | 持续优化 |
| 推荐 | 传统项目 | 新项目 |

### 1.3 集成依赖

```gradle
// 启用 Compose
android {
    buildFeatures {
        compose true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.0"
    }
}

dependencies {
    // Compose 核心
    implementation platform("androidx.compose:compose-bom:2023.10.00")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    
    // Material Design
    implementation("androidx.compose.material3:material3")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    
    // 与 View 系统集成
    implementation("androidx.compose.ui:ui-viewbinding")
}
```

---

## 2. 核心概念

### 2.1 @Composable 函数

```kotlin
// 声明式 UI
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}

// 组合多个 Composable
@Composable
fun UserProfile(user: User) {
    Column {
        Image(
            bitmap = user.avatar,
            contentDescription = "Profile picture"
        )
        Text(text = user.name)
        Text(text = user.email)
        Button(onClick = { /* click handler */ }) {
            Text(text = "Follow")
        }
    }
}

// 带条件的 Composable
@Composable
fun LoadingOrContent(isLoading: Boolean, content: @Composable () -> Unit) {
    if (isLoading) {
        CircularProgressIndicator()
    } else {
        content()
    }
}
```

### 2.2 状态与重组

```kotlin
@Composable
fun Counter() {
    // 声明状态变量
    var count by remember { mutableStateOf(0) }
    
    // 当 count 变化时，自动重组
    Column {
        Text(text = "Count: $count")
        
        Button(onClick = { count++ }) {
            Text(text = "Increment")
        }
    }
}

// 状态提升
@Composable
fun CounterWithReset() {
    var count by remember { mutableStateOf(0) }
    
    Counter(count = count, onReset = { count = 0 })
}

@Composable
fun Counter(count: Int, onReset: () -> Unit) {
    Column {
        Text(text = "Count: $count")
        Button(onClick = onReset) {
            Text(text = "Reset")
        }
    }
}
```

### 2.3 记忆化

```kotlin
// remember - 在重组时保留值
@Composable
fun MyComposable() {
    val value = remember { expensiveCalculation() }
    
    // value 在重组时不会重新计算
}

// rememberUpdatedState - 更新状态引用
@Composable
fun MyComposable() {
    var count by remember { mutableStateOf(0) }
    val latestCount = rememberUpdatedState(count)
    
    LaunchedEffect(Unit) {
        // 异步操作中使用最新状态
        delay(1000)
        // 使用 latestCount 而不是 count
    }
}

// derivedStateOf - 派生状态
@Composable
fun MyComposable() {
    var name by remember { mutableStateOf("") }
    
    val isNameValid = remember(name) {
        name.isNotBlank() && name.length >= 3
    }
    
    // 或使用 derivedStateOf
    val isNameValid = derivedStateOf {
        name.isNotBlank() && name.length >= 3
    }.value
}
```

---

## 3. 基础使用

### 3.1 基础组件

```kotlin
// Text - 文本
Text(
    text = "Hello World",
    fontSize = 16.sp,
    color = Color.Blue,
    fontStyle = FontStyle.Italic
)

// Button - 按钮
Button(
    onClick = { /* action */ },
    enabled = true,
    colors = ButtonDefaults.buttonColors(
        backgroundColor = Color.LightGray
    )
) {
    Text("Click me")
}

// TextField - 输入框
var text by remember { mutableStateOf("") }
TextField(
    value = text,
    onValueChange = { text = it },
    label = { Text("Enter text") },
    modifier = Modifier.fillMaxWidth()
)

// Image - 图片
Image(
    painter = painterResource(id = R.drawable.ic_launcher),
    contentDescription = "Logo",
    modifier = Modifier.size(48.dp)
)

// 或使用图片加载库
AsyncImage(
    model = imageUrl,
    contentDescription = null,
    modifier = Modifier.size(100.dp),
    contentScale = ContentScale.Crop,
    placeholder = ImagePainter(...),
    error = ImagePainter(...)
)
```

### 3.2 布局组件

```kotlin
// Row - 水平布局
Row(
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically,
    modifier = Modifier.fillMaxWidth()
) {
    Text("Left")
    Text("Center")
    Text("Right")
}

// Column - 垂直布局
Column(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier.fillMaxSize()
) {
    Text("Top")
    Text("Middle")
    Text("Bottom")
}

// Spacer - 空白
Spacer(modifier = Modifier.height(16.dp))

// Box - 重叠布局
Box(
    modifier = Modifier.size(200.dp),
    contentAlignment = Alignment.Center
) {
    Image(...)
    Text("Overlay", modifier = Modifier.padding(8.dp))
}

// Surface - 容器
Surface(
    shape = RoundedCornerShape(16.dp),
    shadowElevation = 8.dp,
    color = Color.White
) {
    Text("Content")
}
```

### 3.3 Modifier 修饰符

```kotlin
// 基础 Modifier
Modifier
    .fillMaxWidth()
    .fillMaxHeight()
    .padding(16.dp)
    .background(Color.Gray)
    .clickable { onClick() }
    .border(width = 2.dp, color = Color.Black)
    .size(100.dp)
    .weight(1f)
    .heightIn(min = 50.dp)
    .widthIn(max = 200.dp)

// 组合 Modifier
val customModifier = Modifier
    .padding(16.dp)
    .background(Color.White)
    .elevation(4.dp)

// 可复用 Modifier
val cardModifier = Modifier
    .fillMaxWidth()
    .padding(16.dp)
    .background(Color.White)
    .elevation(8.dp)
    .clip(RoundedCornerShape(8.dp))

// 使用
Surface(modifier = cardModifier) {
    Text("Card Content")
}

// 顺序重要
// ✅ 正确
Modifier.padding(16.dp).background(Color.Red)

// ❌ 错误（背景在 padding 外部）
Modifier.background(Color.Red).padding(16.dp)
```

---

## 4. 状态管理

### 4.1 StateFlow 与 ViewModel

```kotlin
// ViewModel
class LoginViewModel : ViewModel() {
    
    private val _loginState = MutableStateFlow<LoginState>(LoginState.Idle)
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()
    
    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loginState.value = LoginState.Loading
            try {
                val user = repository.login(username, password)
                _loginState.value = LoginState.Success(user)
            } catch (e: Exception) {
                _loginState.value = LoginState.Error(e.message)
            }
        }
    }
}

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    data class Success(val user: User) : LoginState()
    data class Error(val message: String?) : LoginState()
}

// Composable 使用
@Composable
fun LoginScreen(viewModel: LoginViewModel = hiltViewModel()) {
    val loginState by viewModel.loginState.collectAsState()
    
    LoginUI(state = loginState)
}

@Composable
fun LoginUI(state: LoginState) {
    when (state) {
        is LoginState.Idle -> LoginForm()
        is LoginState.Loading -> LoadingDialog()
        is LoginState.Success -> SuccessScreen(state.user)
        is LoginState.Error -> ErrorScreen(state.message)
    }
}
```

### 4.2 LaunchedEffect

```kotlin
// 在重组时启动协程
@Composable
fun MyComposable() {
    LaunchedEffect(Unit) {
        // 只在第一次进入时执行
        loadData()
    }
}

// 带键值的 LaunchedEffect
@Composable
fun MyComposable(itemId: Int) {
    LaunchedEffect(itemId) {
        // 当 itemId 变化时重新执行
        loadItem(item)
    }
}

// 清理已启动的协程
@Composable
fun MyComposable() {
    val job = remember { Job() }
    
    LaunchedEffect(job) {
        while (true) {
            delay(1000)
            // 定期执行
        }
    }
    
    DisposableEffect(Unit) {
        onDispose {
            job.cancel()
        }
    }
}
```

### 4.3 SideEffect

```kotlin
// SideEffect - 在重组时执行副作用
@Composable
fun MyComposable() {
    SideEffect {
        // 每次重组时执行
        updateAnalytics()
    }
}

// 使用场景：
// - 分析埋点
// - 更新全局状态
// - 清理资源
```

### 4.4 rememberSaveable

```kotlin
// 保存状态（屏幕旋转等）
@Composable
fun MyComposable() {
    var text by rememberSaveable { mutableStateOf("") }
    
    TextField(
        value = text,
        onValueChange = { text = it }
    )
}

// 自定义序列化
@Composable
fun MyComposable() {
    var item by rememberSaveable(
        saver = UserSaver
    ) { mutableStateOf(User(1, "Name")) }
}

object UserSaver : Saver<User, Map<String, Any>> {
    override fun restore(value: Map<String, Any>): User {
        return User(
            id = value["id"] as Int,
            name = value["name"] as String
        )
    }
    
    override fun save(value: User): Map<String, Any> {
        return mapOf(
            "id" to value.id,
            "name" to value.name
        )
    }
}
```

---

## 5. 列表与导航

### 5.1 LazyColumn

```kotlin
@Composable
fun UserList(users: List<User>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(
            count = 100,
            key = { it } // 使用 key 优化
        ) { index ->
            UserItem(user = User(index, "User $index"))
        }
    }
}

// LazyColumn 高级用法
@Composable
fun AdvancedLazyColumn() {
    LazyColumn {
        // 头部
        header {
            HeaderItem()
        }
        
        // 项目列表
        items(users) { user ->
            UserItem(user)
        }
        
        // 底部
        footer {
            FooterItem()
        }
        
        // 间隔
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // 分页加载
        stickyHeader {
            SectionHeader()
        }
    }
}

// LazyRow - 水平列表
@Composable
fun HorizontalList() {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(16.dp)
    ) {
        items(items) { item ->
            ItemCard(item)
        }
    }
}

// 嵌套列表
@Composable
fun NestedList() {
    LazyColumn {
        items(groups) { group ->
            GroupHeader(group.name)
            
            LazyColumn {
                items(group.items) { item ->
                    ItemCard(item)
                }
            }
        }
    }
}
```

### 5.2 Navigation Compose

```kotlin
// 定义路由
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Detail : Screen("detail/{id}") {
        fun createRoute(id: String) = "detail/$id"
    }
    object Settings : Screen("settings")
}

// Navigation 图
@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onItemClick = { id ->
                    navController.navigate(Screen.Detail.createRoute(id))
                }
            )
        }
        
        composable(
            route = Screen.Detail.route,
            arguments = listOf(
                navArgument("id") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id")
            DetailScreen(
                itemId = id,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.Settings.route) {
            SettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}

// 深度链接
composable(
    route = "profile/{userId}",
    deepLinks = listOf(
        navDeepLink {
            uriPattern = "https://example.com/profile/{userId}"
        }
    )
) { backStackEntry ->
    val userId = backStackEntry.arguments?.getString("userId")
    ProfileScreen(userId)
}
```

### 5.3 回退栈处理

```kotlin
@Composable
fun MyScreen(navController: NavController) {
    // 处理返回按钮
    val canPop = remember { navController.previousBackStackEntry != null }
    
    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    if (canPop) {
                        IconButton(onClick = { navController.popBackStack() }) {
                            Icon(Icons.Default.ArrowBack, "Back")
                        }
                    }
                },
                title = { Text("Title") }
            )
        }
    ) {
        // Content
    }
}
```

---

## 6. 布局与动画

### 6.1 自定义布局

```kotlin
// Layout - 自定义布局
@Layout
fun CustomLayout(
    content: @Composable () -> Unit
) {
    // 测量子组件
    val placeables = content.measure(MeasurableMeasurableConstraints())
    
    layout(width, height) {
        // 放置子组件
        placeables.forEach { placeable ->
            placeable.placeRelative(x, y)
        }
    }
}

// 使用
CustomLayout {
    Box {
        Text("Content 1")
        Text("Content 2")
    }
}
```

### 6.2 动画

```kotlin
// AnimatedVisibility - 显示/隐藏动画
@Composable
fun AnimatedItem(visible: Boolean) {
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInHorizontally(),
        exit = fadeOut() + slideOutHorizontally()
    ) {
        Card {
            Text("Animated Content")
        }
    }
}

// AnimatedContent - 内容切换动画
@Composable
fun AnimatedContentScreen() {
    var count by remember { mutableStateOf(0) }
    
    AnimatedContent(
        targetState = count,
        transitionSpec = {
            slideIntoContainer(
                AnimatedContentTransitionSpec.SlideDirection.Left,
                200
            ) with slideOutOfContainer(
                AnimatedContentTransitionSpec.SlideDirection.Right,
                200
            )
        }
    ) { targetCount ->
        Text("Count: $targetCount")
    }
    
    Button(onClick = { count++ }) {
        Text("Increment")
    }
}

// animateFloatAsState - 属性动画
@Composable
fun AnimatedRotation(isRotating: Boolean) {
    val rotation by animateFloatAsState(
        targetValue = if (isRotating) 360f else 0f,
        animationSpec = tween(
            durationMillis = 1000,
            easing = LinearEasing
        )
    )
    
    Icon(
        imageVector = Icons.Default.Refresh,
        contentDescription = null,
        modifier = Modifier.rotate(rotation)
    )
}

// animateDpAsState
@Composable
fun AnimatedSize(isExpanded: Boolean) {
    val height by animateDpAsState(
        targetValue = if (isExpanded) 200.dp else 100.dp,
        animationSpec = spring()
    )
    
    Box(modifier = Modifier.height(height)) {
        Text("Animated Size")
    }
}
```

### 6.3 手势

```kotlin
// 点击
Modifier.clickable { onClick() }

// 长按
Modifier.longClickable { onLongClick() }

// 双击
Modifier.doubleClickable { onDoubleClick() }

// 拖动
Modifier.draggable(
    orientation = Orientation.Vertical,
    onDragStopped = { offset -> /* handle */ }
)

// 滚动
LaunchedEffect(Unit) {
    Modifier.scrollable(remember { MutableState(0, 0) })
}
```

---

## 7. Material Design 3

### 7.1 主题配置

```kotlin
// Material3 主题
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        if (dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            darkDynamicColorScheme()
        } else {
            darkColorScheme()
        }
    } else {
        if (dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            lightDynamicColorScheme()
        } else {
            lightColorScheme()
        }
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

// 自定义颜色
val CustomColorScheme = lightColorScheme(
    primary = Purple80,
    secondary = Teal200,
    tertiary = Pink80,
    error = Color(0xFFB3261E)
)

// 自定义字体
val Typography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 40.sp,
        lineHeight = 52.sp,
        letterSpacing = (-0.25).sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
)
```

### 7.2 常用组件

```kotlin
// Scaffold - 布局骨架
@Composable
fun AppScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Title") },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Search, null)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = true,
                    onClick = {},
                    icon = { Icon(Icons.Default.Home, null) },
                    label = { Text("Home") }
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {}) {
                Icon(Icons.Default.Add, null)
            }
        }
    ) { innerPadding ->
        LazyColumn(
            contentPadding = innerPadding
        ) {
            items(100) { index ->
                CardItem("Item $index")
            }
        }
    }
}

// Card - 卡片
Card(
    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
) {
    Text("Card Content")
}

// Dialog - 对话框
@Composable
fun DialogScreen() {
    var showDialog by remember { mutableStateOf(false) }
    
    Button(onClick = { showDialog = true }) {
        Text("Show Dialog")
    }
    
    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Dialog Title") },
            text = { Text("Dialog Content") },
            confirmButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("OK")
                }
            }
        )
    }
}

// Snackbar - 通知
@Composable
fun SnackbarScreen() {
    val snackbarHostState = remember { SnackbarHostState() }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) {
        Button(onClick = {
            snackbarHostState.showSnackbar("Action completed")
        }) {
            Text("Trigger Snackbar")
        }
    }
}
```

---

## 8. 性能优化

### 8.1 重组优化

```kotlin
// 使用 key
@Composable
fun ItemList(items: List<Item>) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            ItemRow(item)
        }
    }
}

// 使用 subcomposition
@Composable
fun Parent() {
    var count by remember { mutableStateOf(0) }
    
    SubComposition(count)
    
    // 其他不相关的状态
    var other by remember { mutableStateOf("") }
}

// 避免在 Composable 中创建对象
@Composable
fun Inefficient() {
    // ❌ 每次都创建新对象
    val data = listOf(1, 2, 3)
    Text(data.toString())
}

@Composable
fun Efficient() {
    // ✅ 使用 remember
    val data = remember { listOf(1, 2, 3) }
    Text(data.toString())
}
```

### 8.2 内存优化

```kotlin
// 使用 LazyColumn 替代 Column
@Composable
fun InefficientList() {
    // ❌ 所有项目都创建
    Column {
        repeat(1000) {
            ItemCard("Item $it")
        }
    }
}

@Composable
fun EfficientList() {
    // ✅ 只创建可见项目
    LazyColumn {
        items(1000) {
            ItemCard("Item $it")
        }
    }
}

// 图片加载优化
@Composable
fun OptimizedImage(url: String) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(url)
            .crossfade(true)
            .build(),
        contentDescription = null,
        modifier = Modifier
            .size(100.dp)
            .clip(RoundedCornerShape(8.dp))
    )
}
```

---

## 9. 面试考点

### 9.1 基础概念

**Q1: Compose 的优势？**

```
答案要点：
- 声明式 UI（状态驱动）
- 代码量少
- 与 Kotlin 深度集成
- 无需 XML
- 自动处理状态变化
- 更好的测试性
```

**Q2: @Composable 是什么？**

```
答案要点：
- 标记 UI 函数的注解
- 支持状态和重组
- 可以组合其他 Composable
- 支持 remember 和状态管理
```

### 9.2 实战问题

**Q3: 如何实现列表？**

```kotlin
LazyColumn {
    items(items, key = { it.id }) { item ->
        ItemRow(item)
    }
}
```

**Q4: 状态如何管理？**

```kotlin
var count by remember { mutableStateOf(0) }

// 或使用 ViewModel + StateFlow
val state by viewModel.state.collectAsState()
```

### 9.3 高级问题

**Q5: 重组优化技巧？**

```
答案要点：
1. 使用 key 稳定项目
2. 使用 remember
3. 拆分 Composable
4. 使用 derivedStateOf
5. 避免创建对象
```

---

## 参考资料

- [Jetpack Compose 官方文档](https://developer.android.com/jetpack/compose)
- [Material Design 3](https://m3.material.io/)
- [Compose 性能最佳实践](https://developer.android.com/jetpack/compose/performance)

---

*本文完，感谢阅读！*
