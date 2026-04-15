# MVI 架构深度解析 🔄

> 单向数据流架构，Jetpack Compose 首选模式

---

## 一、MVI 架构核心概念

### 1.1 架构概述

MVI（Model-View-Intent）是一种基于单向数据流的架构模式，起源于 Flutter 的 Redux 模式，在 Android 领域随着 Jetpack Compose 的流行而得到广泛应用。

```
┌─────────────────────────────────────────────────────────┐
│                    MVI 架构核心                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Intent (用户意图)                                       │
│       ↓                                                  │
│  ┌─────────────────────────────────────┐               │
│  │          ViewModel                  │               │
│  │  - 接收 Intent                       │               │
│  │  - 处理业务逻辑                      │               │
│  │  - 更新 State                        │               │
│  └─────────────────────────────────────┘               │
│       ↓                                                  │
│  State (不可变状态)                                       │
│       ↓                                                  │
│  View (UI 渲染)                                          │
│       ↓                                                  │
│  └─────────────── 用户交互 → Intent ───────────────────┘
│                                                         │
│  单向数据流：Intent → ViewModel → State → View → Intent │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 职责 | 特点 |
|------|------|------|
| **Intent** | 用户意图、事件 | 不可变、瞬时 |
| **State** | 应用状态 | 不可变、单一数据源 |
| **ViewModel** | 处理逻辑 | 接收 Intent，返回新 State |
| **View** | UI 渲染 | 观察 State，触发 Intent |

### 1.3 MVI vs 传统架构

```
传统架构 (双向通信):
┌─────────────────────────────────────┐
│  View  ←──────────────→  ViewModel  │
│   ↓              ↑           ↓      │
│   └────────── 双向绑定 ────────────┘
└─────────────────────────────────────┘

MVI 架构 (单向数据流):
┌─────────────────────────────────────┐
│  View  →  Intent  →  ViewModel      │
│   ↑                              ↓ │
│   └─────────── State ←─────────────┘
│     单向数据流：Intent → State → View │
└─────────────────────────────────────┘
```

---

## 二、MVI 实战实现

### 2.1 基础实现

```kotlin
// ==================== 1. 定义 State ====================

// State 是不可变数据类
@JvmInline
value class UserId(val value: Int)

data class UserState(
    val userId: UserId? = null,
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val events: List<UserEvent> = emptyList()
) {
    companion object {
        fun loading(): UserState {
            return UserState(isLoading = true)
        }
        
        fun success(user: User): UserState {
            return UserState(
                userId = user.id,
                isLoading = false,
                user = user
            )
        }
        
        fun error(message: String): UserState {
            return UserState(
                isLoading = false,
                error = message
            )
        }
    }
}

// ==================== 2. 定义 Intent ====================

sealed class UserIntent {
    data class LoadUser(val userId: Int) : UserIntent()
    object RefreshUser : UserIntent()
    data class UpdateUser(val user: User) : UserIntent()
    object ClearError : UserIntent()
    data class DeleteUser(val userId: Int) : UserIntent()
}

// ==================== 3. 定义 Event ====================

sealed class UserEvent {
    data class NavigateToDetail(val userId: Int) : UserEvent()
    data class ShowSnackbar(val message: String) : UserEvent()
    data class ShowDialog(val title: String, val message: String) : UserEvent()
    object NavigateBack : UserEvent()
}

// ==================== 4. ViewModel 实现 ====================

@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // 初始状态
    private val initialState = UserState()
    
    // StateFlow 持状态
    private val _state = MutableStateFlow(initialState)
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    init {
        // 初始化时加载
        processIntent(UserIntent.LoadUser(1))
    }
    
    // 处理 Intent - 返回新的 State
    fun processIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUser -> loadUser(intent.userId)
            is UserIntent.RefreshUser -> refreshUser()
            is UserIntent.UpdateUser -> updateUser(intent.user)
            is UserIntent.ClearError -> clearError()
            is UserIntent.DeleteUser -> deleteUser(intent.userId)
        }
    }
    
    // 加载用户
    private fun loadUser(userId: Int) {
        viewModelScope.launch {
            // 更新状态为加载中
            _state.update { it.copy(isLoading = true, error = null) }
            
            try {
                val result = userRepository.getUser(userId)
                
                _state.update { currentState ->
                    when {
                        result.isSuccess -> {
                            val user = result.getOrThrow()
                            UserState.success(user)
                        }
                        else -> {
                            UserState.error("加载失败")
                        }
                    }
                }
            } catch (e: Exception) {
                _state.update { currentState ->
                    UserState.error(e.message ?: "未知错误")
                }
            }
        }
    }
    
    // 刷新用户
    private fun refreshUser() {
        val currentUserId = _state.value.userId
        if (currentUserId != null) {
            loadUser(currentUserId.value)
        }
    }
    
    // 更新用户
    private fun updateUser(user: User) {
        viewModelScope.launch {
            val result = userRepository.updateUser(user)
            
            _state.update { currentState ->
                when {
                    result.isSuccess -> {
                        currentState.copy(
                            user = user,
                            error = null
                        )
                    }
                    else -> {
                        currentState.copy(
                            error = "更新失败"
                        )
                    }
                }
            }
        }
    }
    
    // 清除错误
    private fun clearError() {
        _state.update { it.copy(error = null) }
    }
    
    // 删除用户
    private fun deleteUser(userId: Int) {
        viewModelScope.launch {
            _state.update { it.copy(events = it.events + UserEvent.ShowDialog(
                "确认删除",
                "确定要删除这个用户吗？"
            ))}
        }
    }
    
    // 处理事件（确认删除）
    fun handleEvent(event: UserEvent) {
        when (event) {
            is UserEvent.NavigateToDetail -> {
                // 处理导航
            }
            is UserEvent.ShowSnackbar -> {
                // 显示提示
            }
        }
    }
}

// ==================== 5. View 层实现 ====================

// Compose 实现
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    // 收集 State
    val currentState by viewModel.state.collectAsState()
    
    // 收集一次性事件
    LaunchedEffect(Unit) {
        // 处理事件逻辑
    }
    
    // 渲染 UI
    UserScreenContent(
        state = currentState,
        onIntent = { intent -> viewModel.processIntent(intent) }
    )
}

@Composable
fun UserScreenContent(
    state: UserState,
    onIntent: (UserIntent) -> Unit
) {
    // 加载中状态
    if (state.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }
    
    // 错误状态
    if (state.error != null) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Default.Error, contentDescription = null)
            Text(text = state.error ?: "出错了")
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = { onIntent(UserIntent.RefreshUser) }) {
                Text("重试")
            }
            Spacer(modifier = Modifier.height(8.dp))
            TextButton(onClick = { onIntent(UserIntent.ClearError) }) {
                Text("忽略")
            }
        }
        return
    }
    
    // 数据显示
    state.user?.let { user ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // 用户头像
            AsyncImage(
                model = user.avatar,
                contentDescription = "用户头像",
                modifier = Modifier
                    .size(80.dp)
                    .border(
                        BorderStroke(2.dp, Color.Gray),
                        RoundedCornerShape(50.dp)
                    )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 用户名
            Text(
                text = user.name,
                style = MaterialTheme.typography.h5
            )
            
            // 用户邮箱
            Text(
                text = user.email,
                style = MaterialTheme.typography.body1,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // 操作按钮
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(onClick = { onIntent(UserIntent.RefreshUser) }) {
                    Icon(Icons.Default.Refresh, contentDescription = null)
                }
                
                OutlinedButton(onClick = { 
                    onIntent(UserIntent.DeleteUser(user.id))
                }) {
                    Icon(Icons.Default.Delete, contentDescription = null)
                }
            }
        }
    } ?: run {
        // 空状态
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("暂无数据")
        }
    }
}
```

### 2.2 MVI + StateFlow + SharedFlow

```kotlin
// ==================== MVI + StateFlow + SharedFlow ====================

@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // 状态 - StateFlow
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    // 一次性事件 - SharedFlow
    private val _event = MutableSharedFlow<UserEvent>()
    val event: SharedFlow<UserEvent> = _event.asSharedFlow()
    
    init {
        processIntent(UserIntent.LoadUser(1))
    }
    
    fun processIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUser -> loadUser(intent.userId)
            is UserIntent.RefreshUser -> refreshUser()
            is UserIntent.UpdateUser -> updateUser(intent.user)
            is UserIntent.ClearError -> clearError()
            is UserIntent.DeleteUser -> deleteUser(intent.userId)
        }
    }
    
    private fun loadUser(userId: Int) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                
                _state.update { currentState ->
                    currentState.copy(
                        isLoading = false,
                        user = user
                    )
                }
                
                // 发送成功事件
                _event.emit(UserEvent.ShowSnackbar("加载成功"))
            } catch (e: Exception) {
                _state.update { currentState ->
                    currentState.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            }
        }
    }
    
    private fun refreshUser() {
        val currentUserId = _state.value.userId ?: return
        loadUser(currentUserId)
    }
    
    private fun updateUser(user: User) {
        viewModelScope.launch {
            try {
                val result = userRepository.updateUser(user)
                
                if (result.isSuccess) {
                    _state.update { currentState ->
                        currentState.copy(user = user)
                    }
                    _event.emit(UserEvent.ShowSnackbar("更新成功"))
                }
            } catch (e: Exception) {
                _event.emit(UserEvent.ShowSnackbar("更新失败：${e.message}"))
            }
        }
    }
    
    private fun clearError() {
        _state.update { it.copy(error = null) }
    }
    
    private fun deleteUser(userId: Int) {
        // 先显示确认对话框
        _event.emit(UserEvent.ShowDialog(
            title = "确认删除",
            message = "确定要删除这个用户吗？"
        ))
        
        // 监听确认事件（需要从外部触发）
        // 实际使用中，应该由 UI 确认后再调用删除
    }
    
    // 处理确认删除
    fun confirmDelete() {
        val userId = _state.value.userId ?: return
        
        viewModelScope.launch {
            try {
                val result = userRepository.deleteUser(userId)
                
                if (result.isSuccess) {
                    _state.update { currentState ->
                        currentState.copy(
                            user = null,
                            userId = null
                        )
                    }
                    _event.emit(UserEvent.ShowSnackbar("删除成功"))
                } else {
                    _event.emit(UserEvent.ShowSnackbar("删除失败"))
                }
            } catch (e: Exception) {
                _event.emit(UserEvent.ShowSnackbar("删除失败：${e.message}"))
            }
        }
    }
}

// Compose 实现
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel(),
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    navigator: Navigator? = null
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    
    // 收集一次性事件
    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is UserEvent.ShowSnackbar -> {
                    scope.launch {
                        snackbarHostState.showSnackbar(event.message)
                    }
                }
                is UserEvent.ShowDialog -> {
                    // 显示对话框
                }
                is UserEvent.NavigateToDetail -> {
                    navigator?.navigate("user/${event.userId}")
                }
                is UserEvent.NavigateBack -> {
                    navigator?.popBackStack()
                }
            }
        }
    }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        UserScreenContent(
            state = state,
            onIntent = { intent -> viewModel.processIntent(intent) },
            onConfirmDelete = { viewModel.confirmDelete() },
            modifier = Modifier.padding(paddingValues)
        )
    }
}

@Composable
fun UserScreenContent(
    state: UserState,
    onIntent: (UserIntent) -> Unit,
    onConfirmDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    // 实现 UI 渲染逻辑
}
```

### 2.3 MVI 工具库：MVI-kt

```kotlin
// ==================== 使用 MVI-kt 工具库 ====================

// MVI 基类
abstract class MviViewModel<State, Event, Intent> : ViewModel() where State : MviState {
    
    // 初始状态
    abstract fun initialState(): State
    
    // 处理 Intent 并返回新的 State
    abstract suspend fun handleIntent(intent: Intent): State
    
    // StateFlow
    private val _state = MutableStateFlow(initialState())
    val state: StateFlow<State> = _state.asStateFlow()
    
    // SharedFlow 用于一次性事件
    private val _event = MutableSharedFlow<Event>()
    val event: SharedFlow<Event> = _event.asSharedFlow()
    
    // 处理 Intent
    open fun processIntent(intent: Intent) {
        viewModelScope.launch {
            val newState = handleIntent(intent)
            _state.value = newState
        }
    }
    
    // 发送事件
    protected suspend fun emitEvent(event: Event) {
        _event.emit(event)
    }
    
    // 更新状态
    protected suspend fun updateState(update: State.() -> State) {
        _state.value = _state.value.update()
    }
}

// 具体实现
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : MviViewModel<UserState, UserEvent, UserIntent>() {
    
    override fun initialState(): UserState {
        return UserState()
    }
    
    override suspend fun handleIntent(intent: UserIntent): UserState {
        return when (intent) {
            is UserIntent.LoadUser -> loadUser(intent.userId)
            is UserIntent.RefreshUser -> refreshUser()
            is UserIntent.UpdateUser -> updateUser(intent.user)
            is UserIntent.ClearError -> clearError()
            is UserIntent.DeleteUser -> deleteUser(intent.userId)
        }
    }
    
    private suspend fun loadUser(userId: Int): UserState {
        return try {
            _state.value.copy(isLoading = true, error = null)
            
            val user = userRepository.getUser(userId).getOrThrow()
            
            _state.value.copy(
                isLoading = false,
                userId = userId,
                user = user
            ).also {
                emitEvent(UserEvent.ShowSnackbar("加载成功"))
            }
        } catch (e: Exception) {
            _state.value.copy(
                isLoading = false,
                error = e.message
            )
        }
    }
    
    private suspend fun refreshUser(): UserState {
        val userId = _state.value.userId ?: return _state.value
        return loadUser(userId)
    }
    
    private suspend fun updateUser(user: User): UserState {
        return try {
            val result = userRepository.updateUser(user)
            
            if (result.isSuccess) {
                _state.value.copy(user = user).also {
                    emitEvent(UserEvent.ShowSnackbar("更新成功"))
                }
            } else {
                _state.value.copy(error = "更新失败")
            }
        } catch (e: Exception) {
            _state.value.copy(error = e.message)
        }
    }
    
    private suspend fun clearError(): UserState {
        return _state.value.copy(error = null)
    }
    
    private suspend fun deleteUser(userId: Int): UserState {
        emitEvent(UserEvent.ShowDialog("确认删除", "确定删除吗？"))
        return _state.value
    }
}
```

### 2.4 MVI + Unidata (Turbine)

```kotlin
// ==================== MVI + Unidata 模式 ====================

// 定义 State 更新器
sealed class UserStateReducer {
    object Initial : UserStateReducer()
    data class Loading(val isLoading: Boolean) : UserStateReducer()
    data class UserLoaded(val user: User) : UserStateReducer()
    data class Error(val error: String) : UserStateReducer()
    object ErrorCleared : UserStateReducer()
}

// 使用 StateFlow 的 reducer 模式
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // State
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    // Event
    private val _event = MutableSharedFlow<UserEvent>()
    val event: SharedFlow<UserEvent> = _event.asSharedFlow()
    
    init {
        processIntent(UserIntent.LoadUser(1))
    }
    
    fun processIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUser -> loadUser(intent.userId)
            is UserIntent.RefreshUser -> refreshUser()
            is UserIntent.UpdateUser -> updateUser(intent.user)
            is UserIntent.ClearError -> clearError()
            is UserIntent.DeleteUser -> deleteUser(intent.userId)
        }
    }
    
    private fun loadUser(userId: Int) {
        viewModelScope.launch {
            // 使用 reduce 更新状态
            reduce(UserStateReducer.Loading(true))
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                reduce(UserStateReducer.UserLoaded(user))
                _event.emit(UserEvent.ShowSnackbar("加载成功"))
            } catch (e: Exception) {
                reduce(UserStateReducer.Loading(false))
                reduce(UserStateReducer.Error(e.message ?: "未知错误"))
            }
        }
    }
    
    private fun reduce(reducer: UserStateReducer) {
        _state.update { currentState ->
            when (reducer) {
                is UserStateReducer.Initial -> currentState
                is UserStateReducer.Loading -> {
                    currentState.copy(isLoading = reducer.isLoading)
                }
                is UserStateReducer.UserLoaded -> {
                    currentState.copy(
                        user = reducer.user,
                        isLoading = false,
                        error = null
                    )
                }
                is UserStateReducer.Error -> {
                    currentState.copy(
                        error = reducer.error,
                        isLoading = false
                    )
                }
                is UserStateReducer.ErrorCleared -> {
                    currentState.copy(error = null)
                }
            }
        }
    }
    
    private fun refreshUser() {
        val userId = _state.value.userId ?: return
        loadUser(userId)
    }
    
    private fun updateUser(user: User) {
        viewModelScope.launch {
            try {
                val result = userRepository.updateUser(user)
                if (result.isSuccess) {
                    reduce(UserStateReducer.UserLoaded(user))
                    _event.emit(UserEvent.ShowSnackbar("更新成功"))
                }
            } catch (e: Exception) {
                reduce(UserStateReducer.Error(e.message ?: "更新失败"))
            }
        }
    }
    
    private fun clearError() {
        reduce(UserStateReducer.ErrorCleared)
    }
    
    private fun deleteUser(userId: Int) {
        _event.emit(UserEvent.ShowDialog("确认删除", "确定删除吗？"))
    }
}
```

---

## 三、MVI 进阶模式

### 3.1 复合 State 处理

```kotlin
// ==================== 复合 State 处理 ====================

// 使用 sealed class 定义状态机
sealed class ScreenState {
    object Initial : ScreenState()
    object Loading : ScreenState()
    data class Success<T>(val data: T) : ScreenState()
    data class Error(val message: String, val retry: () -> Unit = {}) : ScreenState()
    object Empty : ScreenState()
}

// State 包含多个子状态
data class UserState(
    val userScreen: ScreenState = ScreenState.Initial,
    val commentsScreen: ScreenState = ScreenState.Initial,
    val searchQuery: String = "",
    val isSearching: Boolean = false
)

// ViewModel 处理复合状态
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val commentRepository: CommentRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            _state.update { it.copy(userScreen = ScreenState.Loading) }
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                _state.update { it.copy(userScreen = ScreenState.Success(user)) }
            } catch (e: Exception) {
                _state.update { 
                    it.copy(userScreen = ScreenState.Error(
                        e.message ?: "加载失败",
                        retry = { loadUser(userId) }
                    ))
                }
            }
        }
    }
    
    fun loadComments(userId: Int) {
        viewModelScope.launch {
            _state.update { it.copy(commentsScreen = ScreenState.Loading) }
            
            try {
                val comments = commentRepository.getComments(userId)
                if (comments.isEmpty()) {
                    _state.update { it.copy(commentsScreen = ScreenState.Empty) }
                } else {
                    _state.update { it.copy(commentsScreen = ScreenState.Success(comments)) }
                }
            } catch (e: Exception) {
                _state.update { 
                    it.copy(commentsScreen = ScreenState.Error(e.message ?: "加载失败"))
                }
            }
        }
    }
    
    fun search(query: String) {
        _state.update { it.copy(searchQuery = query, isSearching = true) }
        // 搜索逻辑
    }
}

// Compose 渲染
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsState()
    
    Column {
        // 渲染用户状态
        when (val userState = state.userScreen) {
            is ScreenState.Loading -> {
                CircularProgressIndicator()
            }
            is ScreenState.Success<*> -> {
                val user = userState.data as User
                UserCard(user = user)
            }
            is ScreenState.Error -> {
                ErrorView(
                    message = userState.message,
                    onRetry = userState.retry
                )
            }
            else -> {}
        }
        
        // 渲染评论状态
        when (val commentsState = state.commentsScreen) {
            is ScreenState.Loading -> {
                LinearProgressIndicator()
            }
            is ScreenState.Success<*> -> {
                val comments = commentsState.data as List<Comment>
                CommentsList(comments = comments)
            }
            is ScreenState.Empty -> {
                EmptyView(message = "暂无评论")
            }
            is ScreenState.Error -> {
                ErrorView(
                    message = commentsState.message,
                    onRetry = commentsState.retry
                )
            }
            else -> {}
        }
    }
}
```

### 3.2 MVI 状态持久化

```kotlin
// ==================== MVI 状态持久化 ====================

class UserViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val preferences: UserPreferences
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    // 持久化状态
    private val _savedState = MutableStateFlow<UserState?>(null)
    
    init {
        // 恢复之前保存的状态
        restoreState()
    }
    
    private fun restoreState() {
        viewModelScope.launch {
            val saved = preferences.getLastState()
            if (saved != null) {
                _state.value = saved
                _savedState.value = saved
            }
        }
    }
    
    // 保存状态
    private suspend fun saveState(state: UserState) {
        // 只保存关键状态，不保存临时状态
        val savedState = state.copy(
            isLoading = false,
            error = null
        )
        preferences.saveState(savedState)
        _savedState.value = savedState
    }
    
    fun processIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUser -> loadUser(intent.userId)
            is UserIntent.RefreshUser -> refreshUser()
            // ...
        }
    }
    
    private fun loadUser(userId: Int) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                
                val newState = _state.value.copy(
                    isLoading = false,
                    user = user
                )
                
                _state.value = newState
                saveState(newState)
            } catch (e: Exception) {
                _state.update { 
                    it.copy(isLoading = false, error = e.message)
                }
            }
        }
    }
    
    // 清除保存的状态
    fun clearSavedState() {
        viewModelScope.launch {
            preferences.clearState()
            _savedState.value = null
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        //  ViewModel 销毁时保存状态
        _savedState.value?.let { saveState(it) }
    }
}

// 状态存储
interface UserPreferences {
    suspend fun saveState(state: UserState)
    suspend fun getLastState(): UserState?
    suspend fun clearState()
}

class UserPreferencesImpl @Inject constructor(
    private val dataStore: DataStore<Preferences>
) : UserPreferences {
    
    companion object {
        private val STATE_KEY = Preferences.StringKeys("user_state")
    }
    
    override suspend fun saveState(state: UserState) {
        val json = Json.encodeToString(UserState.serializer(), state)
        dataStore.edit { prefs ->
            prefs[STATE_KEY] = json
        }
    }
    
    override suspend fun getLastState(): UserState? {
        return try {
            val json = dataStore.data.map { prefs ->
                prefs[STATE_KEY]
            }.firstOrNull()
            
            json?.let { Json.decodeFromString(UserState.serializer(), it) }
        } catch (e: Exception) {
            null
        }
    }
    
    override suspend fun clearState() {
        dataStore.edit { prefs ->
            prefs.remove(STATE_KEY)
        }
    }
}
```

### 3.3 MVI 状态管理优化

```kotlin
// ==================== MVI 状态管理优化 ====================

// 1. 状态合并
class OptimizedUserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // 使用 StateFlow 的 update 进行状态合并
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            // 原子更新，避免竞态条件
            _state.update { currentState ->
                currentState.copy(isLoading = true, error = null)
            }
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                
                _state.update { currentState ->
                    // 检查是否是最新的请求
                    if (currentState.lastRequestId == userId) {
                        currentState.copy(
                            isLoading = false,
                            user = user,
                            lastRequestId = userId
                        )
                    } else {
                        currentState
                    }
                }
            } catch (e: Exception) {
                _state.update { currentState ->
                    if (currentState.lastRequestId == userId) {
                        currentState.copy(
                            isLoading = false,
                            error = e.message,
                            lastRequestId = userId
                        )
                    } else {
                        currentState
                    }
                }
            }
        }
    }
}

// 2. 防抖处理
class DebounceUserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    // 搜索防抖
    private val searchJob = MutableSharedFlow<String>()
    
    init {
        viewModelScope.launch {
            searchJob
                .debounce(300)
                .distinctUntilChanged()
                .collect { query ->
                    searchUsers(query)
                }
        }
    }
    
    fun onSearchQuery(query: String) {
        // 更新查询状态
        _state.update { it.copy(searchQuery = query) }
        
        // 发送搜索请求
        viewModelScope.launch {
            searchJob.emit(query)
        }
    }
    
    private suspend fun searchUsers(query: String) {
        if (query.isBlank()) {
            _state.update { it.copy(users = emptyList()) }
            return
        }
        
        _state.update { it.copy(isSearching = true) }
        
        try {
            val users = userRepository.searchUsers(query)
            _state.update { it.copy(isSearching = false, users = users) }
        } catch (e: Exception) {
            _state.update { it.copy(isSearching = false, error = e.message) }
        }
    }
}

// 3. 状态缓存
class CachedUserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    // 本地缓存
    private val cache = ConcurrentHashMap<Int, User>()
    
    fun loadUser(userId: Int) {
        // 先查缓存
        val cached = cache[userId]
        if (cached != null && isCacheValid(cached)) {
            _state.update { it.copy(user = cached, isLoading = false) }
        }
        
        // 异步刷新
        viewModelScope.launch {
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                cache[userId] = user
                
                _state.update { 
                    it.copy(user = user, isLoading = false)
                }
            } catch (e: Exception) {
                _state.update { 
                    it.copy(isLoading = false, error = e.message)
                }
            }
        }
    }
    
    private fun isCacheValid(user: User): Boolean {
        val cacheTime = user.cacheTime ?: return false
        val now = System.currentTimeMillis()
        return now - cacheTime < CACHE_DURATION_MS
    }
}
```

---

## 四、MVI vs MVVM 深度对比

### 4.1 架构对比

```
┌─────────────────────────────────────────────────────────┐
│                    MVI vs MVVM 对比                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MVVM:                                                  │
│  ┌─────────┐    ┌─────────────┐    ┌─────────┐        │
│  │  View   │───→│  ViewModel  │───→│  Model  │        │
│  │         │    │             │    │         │        │
│  └─────────┘    └─────────────┘    └─────────┘        │
│      ↑              │                                  │
│      └──────────────┘                                  │
│         LiveData/StateFlow (双向)                      │
│                                                         │
│  MVI:                                                   │
│  ┌─────────┐    ┌─────────────┐    ┌─────────┐        │
│  │  View   │───→│   Intent    │───→│ ViewModel│       │
│  │         │    │             │    │         │        │
│  └─────────┘    └─────────────┘    └─────────┘        │
│      ↑                                      │          │
│      │            ┌─────────┐               │          │
│      └────────────│  State  │←──────────────┘          │
│                   └─────────┘                          │
│                   单向数据流                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 核心差异

| 维度 | MVVM | MVI |
|------|------|-----|
| **数据流** | 双向绑定 | 单向数据流 |
| **状态管理** | LiveData/StateFlow | 不可变 State |
| **事件处理** | LiveData/Flow | SharedFlow/Event |
| **State 可变更性** | 可变 | 不可变 |
| **调试难度** | 中等 | 容易（State 可追溯） |
| **代码量** | 较少 | 中等 |
| **学习曲线** | 平缓 | 稍陡 |
| **适用场景** | 传统 View、简单交互 | Compose、复杂交互 |
| **性能** | 优秀 | 优秀 |
| **可测试性** | 良好 | 优秀 |

### 4.3 代码对比

```kotlin
// ==================== MVVM 实现 ====================

@HiltViewModel
class UserViewModelMVVM @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // 多个独立的状态
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                _user.value = user
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            }
            
            _isLoading.value = false
        }
    }
    
    fun clearError() {
        _error.value = null
    }
}

// Compose 渲染 - 需要组合多个 State
@Composable
fun UserScreenMVVM(viewModel: UserViewModelMVVM) {
    val isLoading by viewModel.isLoading.collectAsState()
    val user by viewModel.user.collectAsState()
    val error by viewModel.error.collectAsState()
    
    // 需要手动组合状态
    if (isLoading) {
        CircularProgressIndicator()
    } else if (error != null) {
        ErrorView(error)
    } else if (user != null) {
        UserCard(user)
    }
}

// ==================== MVI 实现 ====================

@HiltViewModel
class UserViewModelMVI @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    // 单一状态
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            
            try {
                val user = userRepository.getUser(userId).getOrThrow()
                _state.update { it.copy(isLoading = false, user = user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }
}

// Compose 渲染 - 单一 State 源
@Composable
fun UserScreenMVI(viewModel: UserViewModelMVI) {
    val state by viewModel.state.collectAsState()
    
    // 状态自然组合
    when {
        state.isLoading -> CircularProgressIndicator()
        state.error != null -> ErrorView(state.error)
        state.user != null -> UserCard(state.user)
    }
}
```

---

## 五、MVI 最佳实践

### 5.1 状态设计原则

```kotlin
// ==================== 状态设计原则 ====================

// ✅ 原则 1: State 应该是不可变的
data class UserState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

// ✅ 原则 2: 使用 data class 自动实现 equals/hashCode
// ✅ 原则 3: 提供合理的默认值
// ✅ 原则 4: 使用 sealed class 定义状态类型

// ✅ 原则 5: State 应该包含渲染所需的所有数据
data class UserListState(
    val users: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val hasMore: Boolean = true,
    val error: String? = null,
    val currentPage: Int = 0
)

// ✅ 原则 6: 使用 companion object 提供工厂方法
data class UserState(
    val user: User? = null
) {
    companion object {
        fun initial() = UserState()
        fun loading() = UserState(isLoading = true)
        fun success(user: User) = UserState(user = user)
        fun error(message: String) = UserState(error = message)
    }
}
```

### 5.2 Event 处理模式

```kotlin
// ==================== Event 处理模式 ====================

// 模式 1: Event 在 State 中（不推荐，Event 会留存）
data class UserState(
    val events: List<Event> = emptyList()
)

// 模式 2: 使用 SharedFlow（推荐）
class UserViewModel {
    private val _event = MutableSharedFlow<UserEvent>()
    val event: SharedFlow<UserEvent> = _event.asSharedFlow()
    
    fun navigateToDetail(userId: Int) {
        viewModelScope.launch {
            _event.emit(UserEvent.NavigateToDetail(userId))
        }
    }
}

// 模式 3: 使用 SingleEvent 包装
class SingleEvent<T>(private val content: T) {
    private var hasBeenHandled = false
    
    fun getContentIfNotHandled(): T? {
        return if (hasBeenHandled) {
            null
        } else {
            hasBeenHandled = true
            content
        }
    }
    
    fun peekContent(): T = content
}

data class UserState(
    val navigateEvent: SingleEvent<Int>? = null
)

// 模式 4: StateFlow + 事件收集
class UserViewModel {
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()
    
    fun showSnackbar(message: String) {
        _state.update { 
            it.copy(showSnackbarEvent = SingleEvent(message))
        }
        
        // 延迟清除
        viewModelScope.launch {
            delay(3000)
            _state.update { 
                it.copy(showSnackbarEvent = null)
            }
        }
    }
}

// Compose 收集事件
@Composable
fun UserScreen(viewModel: UserViewModel) {
    val state by viewModel.state.collectAsState()
    
    // 收集 Snackbar 事件
    LaunchedEffect(state.showSnackbarEvent) {
        state.showSnackbarEvent?.getContentIfNotHandled()?.let { message ->
            // 显示 Snackbar
        }
    }
}
```

### 5.3 错误处理

```kotlin
// ==================== 错误处理 ====================

// 1. 定义统一错误类型
sealed class AppError {
    data class NetworkError(val code: Int, val message: String) : AppError()
    data class ServerError(val code: Int, val message: String) : AppError()
    data class ParseError(val message: String) : AppError()
    data class UnknownError(val message: String) : AppError()
}

// 2. State 中包含错误
data class UserState(
    val error: AppError? = null
)

// 3. 错误处理策略
class UserViewModel {
    private val _state = MutableStateFlow(UserState())
    
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            try {
                val user = userRepository.getUser(userId)
                _state.update { it.copy(user = user, error = null) }
            } catch (e: HttpException) {
                val appError = AppError.NetworkError(
                    code = e.code(),
                    message = getErrorMessage(e.code())
                )
                _state.update { it.copy(error = appError) }
            } catch (e: Exception) {
                _state.update { 
                    it.copy(error = AppError.UnknownError(e.message ?: "未知错误"))
                }
            }
        }
    }
    
    private fun getErrorMessage(code: Int): String {
        return when (code) {
            401 -> "未授权，请重新登录"
            403 -> "无权访问"
            404 -> "用户不存在"
            500 -> "服务器错误"
            else -> "请求失败"
        }
    }
}

// 4. 错误重试机制
data class UserState(
    val error: AppError? = null,
    val retryCount: Int = 0
) {
    companion object {
        const val MAX_RETRY_COUNT = 3
    }
}

class UserViewModel {
    fun loadUser(userId: Int) {
        viewModelScope.launch {
            var retryCount = 0
            
            while (retryCount < UserState.MAX_RETRY_COUNT) {
                try {
                    val user = userRepository.getUser(userId)
                    _state.update { it.copy(user = user, error = null, retryCount = 0) }
                    return@launch
                } catch (e: Exception) {
                    retryCount++
                    
                    if (retryCount >= UserState.MAX_RETRY_COUNT) {
                        _state.update { 
                            it.copy(error = e.toAppError(), retryCount = retryCount)
                        }
                        break
                    }
                    
                    // 指数退避
                    delay(1000L * retryCount)
                }
            }
        }
    }
}
```

---

## 六、面试核心考点

### 6.1 基础问题

**Q1: MVI 架构的核心思想？**

**A:**
```
MVI = Model-View-Intent

核心思想:
1. 单向数据流：Intent → ViewModel → State → View
2. 不可变 State：所有状态更新都返回新的 State 对象
3. 单一数据源：State 是 UI 的唯一数据源
4. Intent 驱动：所有用户交互都通过 Intent 触发

优势:
- 状态可追溯，易于调试
- 代码结构清晰，易于维护
- 天然支持热重载（Hot Reload）
- 与 Jetpack Compose 完美契合
```

**Q2: MVI 中的 State 为什么要不可变？**

**A:**
```
不可变 State 的优势:
1. 线程安全：不可变对象天生线程安全
2. 状态追溯：每次更新都创建新对象，可追溯状态变化
3. 简化 diff：Compose 可以通过引用比较判断是否需要重新渲染
4. 避免副作用：无法意外修改状态

实现方式:
data class UserState(
    val user: User? = null  // 使用 val 而非 var
)

更新状态:
_state.update { currentState ->
    currentState.copy(user = newUser)  // 返回新对象
}
```

**Q3: MVI 如何处理一次性事件（如导航、Snackbar）？**

**A:**
```kotlin
// 方式 1: SharedFlow
class UserViewModel {
    private val _event = MutableSharedFlow<UserEvent>()
    val event: SharedFlow<UserEvent> = _event.asSharedFlow()
    
    fun showSnackbar(message: String) {
        viewModelScope.launch {
            _event.emit(UserEvent.ShowSnackbar(message))
        }
    }
}

// 方式 2: SingleEvent
class SingleEvent<T>(private val content: T) {
    private var hasBeenHandled = false
    
    fun getContentIfNotHandled(): T? {
        return if (hasBeenHandled) null else {
            hasBeenHandled = true
            content
        }
    }
}

// 方式 3: StateFlow + LaunchedEffect
data class UserState(
    val showSnackbar: String? = null
)

@Composable
fun Screen(viewModel: UserViewModel) {
    val state by viewModel.state.collectAsState()
    
    LaunchedEffect(state.showSnackbar) {
        state.showSnackbar?.let { showSnackbar(it) }
    }
}
```

**Q4: MVI vs MVVM 如何选择？**

**A:**
```
选择 MVI:
- 使用 Jetpack Compose
- 需要复杂的状态管理
- 需要状态可追溯
- 团队熟悉不可变数据

选择 MVVM:
- 使用传统 View
- 简单的项目
- 团队更熟悉 LiveData
- 性能要求极高（State 创建开销）
```

### 6.2 进阶问题

**Q5: MVI 如何处理状态更新的性能问题？**

**A:**
```kotlin
// 问题：频繁创建新 State 对象可能影响性能

// 优化 1: 只在必要时更新
private fun updateState(update: State.() -> State) {
    val newState = _state.value.update()
    if (newState != _state.value) {
        _state.value = newState
    }
}

// 优化 2: 使用 StateFlow 的 update（原子操作）
_state.update { currentState ->
    currentState.copy(user = user)
}

// 优化 3: 批量更新
private fun batchUpdate(updates: List<(UserState) -> UserState>) {
    val newState = updates.fold(_state.value) { state, update ->
        update(state)
    }
    _state.value = newState
}

// 优化 4: 使用@Stable 标记
@Stable
data class UserState(
    val user: User? = null
)
```

**Q6: MVI 如何实现撤销/重做功能？**

**A:**
```kotlin
// 使用命令模式实现撤销/重做
class CommandManager<T> {
    private val undoStack = ArrayDeque<Command<T>>()
    private val redoStack = ArrayDeque<Command<T>>()
    
    fun execute(command: Command<T>) {
        command.execute()
        undoStack.push(command)
        redoStack.clear()
    }
    
    fun undo() {
        val command = undoStack.popOrNull() ?: return
        command.undo()
        redoStack.push(command)
    }
    
    fun redo() {
        val command = redoStack.popOrNull() ?: return
        command.execute()
        undoStack.push(command)
    }
}

interface Command<T> {
    fun execute()
    fun undo()
}

class UserEditCommand(
    private val viewModel: UserViewModel,
    private val oldUser: User,
    private val newUser: User
) : Command<User> {
    override fun execute() {
        viewModel.updateUser(newUser)
    }
    
    override fun undo() {
        viewModel.updateUser(oldUser)
    }
}
```

**Q7: MVI 如何处理异步操作的竞态条件？**

**A:**
```kotlin
// 问题：快速连续请求可能导致旧请求覆盖新请求

class UserViewModel {
    private var currentRequestId: Int = 0
    
    fun loadUser(userId: Int) {
        val requestId = ++currentRequestId
        
        viewModelScope.launch {
            val user = userRepository.getUser(userId)
            
            // 只处理最新请求
            if (requestId == currentRequestId) {
                _state.update { it.copy(user = user) }
            }
        }
    }
}

// 或者使用 Flow 的 cancel 机制
fun loadUser(userId: Int) {
    job?.cancel()
    job = viewModelScope.launch {
        _state.update { it.copy(isLoading = true) }
        
        try {
            val user = userRepository.getUser(userId)
            _state.update { it.copy(user = user, isLoading = false) }
        } catch (e: Exception) {
            _state.update { it.copy(error = e.message, isLoading = false) }
        }
    }
}
```

**Q8: MVI 的状态如何持久化？**

**A:**
```kotlin
// 1. 使用 DataStore
class UserViewModel {
    init {
        restoreState()
    }
    
    private fun restoreState() {
        viewModelScope.launch {
            val saved = dataStore.getState()
            saved?.let { _state.value = it }
        }
    }
    
    override fun onCleared() {
        _state.value?.let { saveState(it) }
        super.onCleared()
    }
}

// 2. 使用 SavedStateHandle（推荐）
class UserViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val userId: String by savedStateHandle.navArgument()
    private val _state = MutableStateFlow(UserState())
    
    // SavedStateHandle 自动处理配置更新
}
```

### 6.3 实战问题

**Q9: MVI 中如何实现列表下拉刷新和上拉加载更多？**

**A:**
```kotlin
data class UserListState(
    val users: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val hasMore: Boolean = true,
    val currentPage: Int = 0,
    val error: String? = null
)

class UserListViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserListState())
    val state: StateFlow<UserListState> = _state.asStateFlow()
    
    init {
        loadMore()
    }
    
    fun loadMore() {
        val currentState = _state.value
        
        if (currentState.isLoadingMore || !currentState.hasMore) {
            return
        }
        
        _state.update { it.copy(isLoadingMore = true) }
        
        viewModelScope.launch {
            try {
                val users = userRepository.getUsers(
                    page = currentState.currentPage + 1,
                    size = PAGE_SIZE
                )
                
                _state.update { currentState ->
                    currentState.copy(
                        users = currentState.users + users,
                        isLoadingMore = false,
                        hasMore = users.size >= PAGE_SIZE,
                        currentPage = currentState.currentPage + 1
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingMore = false, error = e.message) }
            }
        }
    }
    
    fun refresh() {
        _state.update { 
            it.copy(
                users = emptyList(),
                currentPage = 0,
                hasMore = true,
                error = null
            )
        }
        loadMore()
    }
    
    fun clearError() {
        _state.update { it.copy(error = null) }
    }
}

// Compose 实现
@Composable
fun UserListScreen(viewModel: UserListViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsState()
    
    LazyColumn(
        state = lazyColumnState
    ) {
        items(state.users) { user ->
            UserItem(user)
        }
        
        if (state.isLoadingMore) {
            item {
                CircularProgressIndicator()
            }
        }
        
        if (!state.hasMore) {
            item {
                Text("没有更多了")
            }
        }
    }
    
    // 上拉加载更多
    LaunchedEffect(Unit) {
        lazyColumnState.collect { state ->
            if (state.layoutInfo.visibleItemsInfo.lastOrNull()?.index
                ?: 0 >= state.layoutInfo.totalItemsCount - 2) {
                viewModel.loadMore()
            }
        }
    }
}
```

**Q10: MVI 如何实现搜索功能（防抖、历史记录）？**

**A:**
```kotlin
data class SearchState(
    val query: String = "",
    val results: List<SearchResult> = emptyList(),
    val isLoading: Boolean = false,
    val history: List<String> = emptyList(),
    val error: String? = null
)

class SearchViewModel @Inject constructor(
    private val searchRepository: SearchRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(SearchState())
    val state: StateFlow<SearchState> = _state.asStateFlow()
    
    // 搜索防抖
    private val searchFlow = MutableSharedFlow<String>()
    
    init {
        // 加载历史记录
        loadHistory()
        
        // 监听搜索
        viewModelScope.launch {
            searchFlow
                .debounce(300)
                .distinctUntilChanged()
                .filter { it.isNotBlank() }
                .collect { query ->
                    search(query)
                }
        }
    }
    
    fun onQueryChange(query: String) {
        _state.update { it.copy(query = query) }
        
        if (query.isBlank()) {
            _state.update { it.copy(results = emptyList()) }
            return
        }
        
        viewModelScope.launch {
            searchFlow.emit(query)
        }
    }
    
    private fun search(query: String) {
        _state.update { it.copy(isLoading = true) }
        
        viewModelScope.launch {
            try {
                val results = searchRepository.search(query)
                _state.update { 
                    it.copy(
                        results = results,
                        isLoading = false,
                        history = addHistory(query)
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }
    
    private fun addHistory(query: String): List<String> {
        val currentState = _state.value.history
        return (listOf(query) + currentState.filter { it != query })
            .take(MAX_HISTORY_SIZE)
    }
    
    fun clearHistory() {
        _state.update { it.copy(history = emptyList()) }
    }
    
    fun searchHistoryItem(query: String) {
        onQueryChange(query)
    }
}
```

---

## 七、MVI 实战案例

### 7.1 完整的用户列表实现

```kotlin
// ==================== 完整的 MVI 用户列表实现 ====================

// 1. State 定义
data class UserListState(
    val users: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val hasMore: Boolean = true,
    val currentPage: Int = 0,
    val error: String? = null,
    val searchQuery: String = "",
    val isSearching: Boolean = false,
    val selectedUserIds: Set<Int> = emptySet()
) {
    fun isSelected(userId: Int): Boolean = selectedUserIds.contains(userId)
    
    fun selectUser(userId: Int): UserListState {
        return copy(selectedUserIds = selectedUserIds + userId)
    }
    
    fun deselectUser(userId: Int): UserListState {
        return copy(selectedUserIds = selectedUserIds - userId)
    }
    
    fun selectAll(): UserListState {
        return copy(selectedUserIds = users.mapTo(mutableSetOf()) { it.id })
    }
    
    fun deselectAll(): UserListState {
        return copy(selectedUserIds = emptySet())
    }
}

// 2. Intent 定义
sealed class UserListIntent {
    object LoadMore : UserListIntent()
    object Refresh : UserListIntent()
    data class Search(val query: String) : UserListIntent()
    data class SelectUser(val userId: Int) : UserListIntent()
    data class DeselectUser(val userId: Int) : UserListIntent()
    object SelectAll : UserListIntent()
    object DeselectAll : UserListIntent()
    data class DeleteSelected(val userIds: Set<Int>) : UserListIntent()
    object ClearError : UserListIntent()
}

// 3. Event 定义
sealed class UserListEvent {
    data class ShowError(val message: String) : UserListEvent()
    data class ShowSuccess(val message: String) : UserListEvent()
    data class NavigateToDetail(val userId: Int) : UserListEvent()
}

// 4. ViewModel 实现
@HiltViewModel
class UserListViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    companion object {
        private const val PAGE_SIZE = 20
    }
    
    private val _state = MutableStateFlow(UserListState())
    val state: StateFlow<UserListState> = _state.asStateFlow()
    
    private val _event = MutableSharedFlow<UserListEvent>()
    val event: SharedFlow<UserListEvent> = _event.asSharedFlow()
    
    init {
        processIntent(UserListIntent.LoadMore)
    }
    
    fun processIntent(intent: UserListIntent) {
        when (intent) {
            is UserListIntent.LoadMore -> loadMore()
            is UserListIntent.Refresh -> refresh()
            is UserListIntent.Search -> search(intent.query)
            is UserListIntent.SelectUser -> selectUser(intent.userId)
            is UserListIntent.DeselectUser -> deselectUser(intent.userId)
            is UserListIntent.SelectAll -> selectAll()
            is UserListIntent.DeselectAll -> deselectAll()
            is UserListIntent.DeleteSelected -> deleteSelected(intent.userIds)
            is UserListIntent.ClearError -> clearError()
        }
    }
    
    private fun loadMore() {
        val currentState = _state.value
        
        if (currentState.isLoadingMore || !currentState.hasMore) {
            return
        }
        
        _state.update { it.copy(isLoadingMore = true) }
        
        viewModelScope.launch {
            try {
                val users = userRepository.getUsers(
                    page = currentState.currentPage + 1,
                    size = PAGE_SIZE
                )
                
                _state.update { currentState ->
                    currentState.copy(
                        users = currentState.users + users,
                        isLoadingMore = false,
                        hasMore = users.size >= PAGE_SIZE,
                        currentPage = currentState.currentPage + 1
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingMore = false, error = e.message) }
                _event.emit(UserListEvent.ShowError("加载更多失败"))
            }
        }
    }
    
    private fun refresh() {
        _state.update { 
            it.copy(
                users = emptyList(),
                currentPage = 0,
                hasMore = true,
                error = null
            )
        }
        loadMore()
    }
    
    private fun search(query: String) {
        if (query.isBlank()) {
            _state.update { it.copy(searchQuery = query, results = emptyList()) }
            return
        }
        
        _state.update { it.copy(searchQuery = query, isSearching = true) }
        
        viewModelScope.launch {
            try {
                val users = userRepository.searchUsers(query)
                
                _state.update { currentState ->
                    currentState.copy(
                        users = users,
                        isSearching = false,
                        hasMore = false,
                        currentPage = 0
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(isSearching = false, error = e.message) }
                _event.emit(UserListEvent.ShowError("搜索失败"))
            }
        }
    }
    
    private fun selectUser(userId: Int) {
        _state.update { it.selectUser(userId) }
    }
    
    private fun deselectUser(userId: Int) {
        _state.update { it.deselectUser(userId) }
    }
    
    private fun selectAll() {
        _state.update { it.selectAll() }
    }
    
    private fun deselectAll() {
        _state.update { it.deselectAll() }
    }
    
    private fun deleteSelected(userIds: Set<Int>) {
        viewModelScope.launch {
            try {
                userRepository.deleteUsers(userIds)
                
                _state.update { currentState ->
                    currentState.copy(
                        users = currentState.users.filterNot { it.id in userIds },
                        selectedUserIds = emptySet()
                    )
                }
                
                _event.emit(UserListEvent.ShowSuccess("删除成功"))
            } catch (e: Exception) {
                _event.emit(UserListEvent.ShowError("删除失败"))
            }
        }
    }
    
    private fun clearError() {
        _state.update { it.copy(error = null) }
    }
    
    // 点击用户
    fun onUserClick(userId: Int) {
        viewModelScope.launch {
            _event.emit(UserListEvent.NavigateToDetail(userId))
        }
    }
}

// 5. Compose UI 实现
@Composable
fun UserListScreen(
    viewModel: UserListViewModel = hiltViewModel(),
    navigator: Navigator? = null
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    // 收集事件
    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                is UserListEvent.ShowError -> {
                    scope.launch {
                        snackbarHostState.showSnackbar(event.message)
                    }
                }
                is UserListEvent.ShowSuccess -> {
                    scope.launch {
                        snackbarHostState.showSnackbar(event.message)
                    }
                }
                is UserListEvent.NavigateToDetail -> {
                    navigator?.navigate("user/${event.userId}")
                }
            }
        }
    }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            UserListTopBar(
                state = state,
                onSearch = { query ->
                    viewModel.processIntent(UserListIntent.Search(query))
                },
                onSelectAll = { viewModel.processIntent(UserListIntent.SelectAll) },
                onDeselectAll = { viewModel.processIntent(UserListIntent.DeselectAll) },
                onDeleteSelected = {
                    viewModel.processIntent(
                        UserListIntent.DeleteSelected(state.selectedUserIds)
                    )
                },
                canDelete = state.selectedUserIds.isNotEmpty()
            )
        }
    ) { paddingValues ->
        UserListContent(
            state = state,
            onRefresh = { viewModel.processIntent(UserListIntent.Refresh) },
            onLoadMore = { viewModel.processIntent(UserListIntent.LoadMore) },
            onUserClick = { userId -> viewModel.onUserClick(userId) },
            onUserLongClick = { userId ->
                viewModel.processIntent(
                    if (state.isSelected(userId)) {
                        UserListIntent.DeselectUser(userId)
                    } else {
                        UserListIntent.SelectUser(userId)
                    }
                )
            },
            modifier = Modifier.padding(paddingValues)
        )
    }
}

@Composable
fun UserListContent(
    state: UserListState,
    onRefresh: () -> Unit,
    onLoadMore: () -> Unit,
    onUserClick: (Int) -> Unit,
    onUserLongClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val refreshState = rememberRefreshState {
        onRefresh()
    }
    
    val lazyColumnState = rememberLazyColumnState()
    
    // 监听滚动到底部
    LaunchedEffect(lazyColumnState) {
        lazyColumnState.collect { state ->
            val visibleItems = state.layoutInfo.visibleItemsInfo
            if (visibleItems.isNotEmpty()) {
                val lastVisibleIndex = visibleItems.last().index
                val totalItems = state.layoutInfo.totalItemsCount
                
                if (lastVisibleIndex >= totalItems - 2) {
                    onLoadMore()
                }
            }
        }
    }
    
    Box {
        if (state.error != null) {
            ErrorView(
                message = state.error,
                onRetry = onRefresh
            )
        }
        
        if (state.users.isEmpty() && !state.isLoading && state.searchQuery.isBlank()) {
            EmptyView(
                message = "暂无用户"
            )
        }
        
        LazyColumn(
            state = lazyColumnState,
            modifier = modifier
        ) {
            items(
                items = state.users,
                key = { user -> user.id }
            ) { user ->
                UserListItem(
                    user = user,
                    isSelected = state.isSelected(user.id),
                    onClick = { onUserClick(user.id) },
                    onLongClick = { onUserLongClick(user.id) }
                )
            }
            
            if (state.isLoadingMore) {
                item {
                    LoadingItem()
                }
            }
            
            if (!state.hasMore && state.users.isNotEmpty()) {
                item {
                    NoMoreItem()
                }
            }
        }
    }
}
```

---

## 八、MVI 面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| MVI 核心概念 | ⭐⭐ | 单向数据流、不可变 State |
| State 不可变性 | ⭐⭐⭐ | 线程安全、状态追溯 |
| Event 处理方式 | ⭐⭐⭐ | SharedFlow/SingleEvent |
| MVI vs MVVM | ⭐⭐⭐ | 数据流、状态管理 |
| 防抖实现 | ⭐⭐⭐ | debounce、distinctUntilChanged |
| 竞态条件处理 | ⭐⭐⭐⭐ | 请求 ID、cancel 机制 |
| 状态持久化 | ⭐⭐⭐ | SavedStateHandle、DataStore |
| 撤销重做 | ⭐⭐⭐⭐ | 命令模式 |
| 列表优化 | ⭐⭐⭐ | key、diff、分页 |
| 性能优化 | ⭐⭐⭐⭐ | @Stable、批量更新 |

---

## 九、参考资料

### 9.1 官方文档

- [Jetpack Compose Architecture](https://developer.android.com/jetpack/compose/architecture)
- [StateFlow Documentation](https://developer.android.com/kotlin/flow/stateflow)
- [Unidata Pattern](https://developer.android.com/jetpack/compose/state-holding-layer)

### 9.2 推荐资源

- [MVI in Android](https://proandroiddev.com/android-architecture-mvi-pattern-4c4e47c27f38)
- [Compose MVI Samples](https://github.com/android/compose-samples)

### 9.3 相关模式

- [MVVM 架构](./01_MVVM 架构与 Hilt 依赖注入.md)
- [MVP 架构](./02_MVP 架构.md)

---

**🔗 上一篇**: [MVP 架构](./02_MVP 架构.md)

**🔗 下一篇**: [VIPER 架构](./04_VIPER 架构.md)