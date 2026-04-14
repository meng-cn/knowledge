# Activity 生命周期深度解析 🔄

## 一、生命周期详解

### 1.1 标准启动流程

```
┌──────────────────────────────────────────────┐
│  onCreate() - 初始化                          │
│  - setContentView()                          │
│  - 初始化数据                                 │
│  - 绑定事件                                  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  onStart() - 可见但不可交互                   │
│  - 初始化 UI 组件                              │
│  - 绑定数据                                  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  onResume() - 完全可见且可交互（前台）         │
│  - 启动动画                                 │
│  - 启动视频播放                             │
│  - 获取焦点                                  │
└──────────────────────────────────────────────┘
```

### 1.2 常见场景分析

#### 场景 1: 切换到后台

```
onPause() → onStop() → (onDestroy())
```

**触发条件:**
- 按 Home 键
- 切换到其他应用
- 屏幕关闭

#### 场景 2: 从后台回到前台

```
onRestart() → onStart() → onResume()
```

#### 场景 3: 启动新 Activity

```
onPause() → (onStop()) → 新 Activity 启动
```

**注意:** 新 Activity 是否完全覆盖当前 Activity 决定是否调用 `onStop()`

---

## 二、面试核心考点

### 2.1 基础问题

**Q1: Activity 什么时候被系统回收？**

**A:**
1. **用户按 Home 键**: 进入后台，等待内存不足时回收
2. **屏幕旋转**: 默认销毁重建（可通过 `configChanges` 避免）
3. **语言切换**: 配置变更导致重建
4. **内存不足**: 系统回收后台 Activity

**Q2: onSaveInstanceState 的作用？**

**A:**
- 保存临时状态（如编辑框内容、滚动位置）
- 在 `onPause()` 之前调用
- Bundle 大小限制约 1MB

```kotlin
override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putString("text", editText.text.toString())
}

override fun onRestoreInstanceState(savedInstanceState: Bundle) {
    super.onRestoreInstanceState(savedInstanceState)
    editText.text = savedInstanceState.getString("text")
}
```

**Q3: 配置变更导致重建如何避免？**

**A:**

```xml
<!-- AndroidManifest.xml -->
<activity
    android:name=".MyActivity"
    android:configChanges="orientation|screenSize|keyboardHidden" />
```

```kotlin
override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    // 处理配置变化
}
```

### 2.2 进阶问题

**Q4: Activity 栈（任务栈）的管理？**

**A:**

```
┌──────────────┐
│  Activity D  │ ← 栈顶
├──────────────┤
│  Activity C  │
├──────────────┤
│  Activity B  │
├──────────────┤
│  Activity A  │ ← 栈底
└──────────────┘
```

**操作:**
- `startActivity()`: 压栈
- `finish()`: 出栈
- `moveTaskToBack()`: 整个栈移到后台
- `FLAG_ACTIVITY_CLEAR_TOP`: 清除上面的 Activity

**Q5: 四大启动模式深度解析？**

**A:**

#### Standard（标准模式）

```
Task 1:
  A → B → C → B' → D
```
- 每次启动都创建新实例
- 默认模式

#### SingleTop（栈顶复用）

```
Task 1:
  A → B → C
  (B 再次启动，调用 onNewIntent，不创建 B')
```

```kotlin
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    // 处理新 Intent
    setIntent(intent)
}
```

#### SingleTask（任务栈复用）

```
Task 1:
  A → B → C
  (B 再次启动，清除 C，B 成为栈顶，调用 onNewIntent)
```

#### SingleInstance（独立栈）

```
Task 1: A → B
Task 2: [C] ← 独占
Task 3: D → E
```

**Q6: Intent Flag 常用标志位？**

**A:**

| Flag | 作用 |
|------|------|
| `FLAG_ACTIVITY_NEW_TASK` | 在新任务栈启动 |
| `FLAG_ACTIVITY_CLEAR_TOP` | 清除栈顶 Activity |
| `FLAG_ACTIVITY_SINGLE_TOP` | 栈顶复用 |
| `FLAG_ACTIVITY_MULTIPLE_TASK` | 允许多个任务栈 |
| `FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS` | 不在最近任务显示 |

```kotlin
val intent = Intent(this, TargetActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
}
startActivity(intent)
```

---

## 三、内存泄漏问题

### 3.1 常见泄漏场景

**场景 1: 未注销的 BroadcastReceiver**

```kotlin
// ❌ 错误示例
val receiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        // ...
    }
}
registerReceiver(receiver, IntentFilter("ACTION"))
// 忘记 unregisterReceiver

// ✅ 正确示例
override fun onDestroy() {
    super.onDestroy()
    unregisterReceiver(receiver)
}
```

**场景 2: 静态引用 Context**

```kotlin
// ❌ 错误
companion object {
    lateinit var context: Context
}

// ✅ 正确
companion object {
    lateinit var context: Application
}
```

**场景 3: 未销毁的 Handler**

```kotlin
// ❌ 错误
private val handler = Handler(Looper.getMainLooper()) {
    // 引用了 Activity
}

// ✅ 正确
private val handler = object : Handler(Looper.getMainLooper()) {
    override fun handleMessage(msg: Message) {
        // 使用弱引用
    }
}.apply {
    // 在 onDestroy 中移除消息
}

override fun onDestroy() {
    super.onDestroy()
    handler.removeCallbacksAndMessages(null)
}
```

### 3.2 检测工具

**LeakCanary 集成:**

```kotlin
// build.gradle.kts
dependencies {
    debugImplementation("com.squareup.leakcanary:leakcanary-android:2.12")
}
```

```kotlin
// 检测 Activity 泄漏
LintResult.findLeaks(this)
```

---

## 四、性能优化

### 4.1 启动优化

**延迟初始化:**

```kotlin
// ❌ 低效
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    initViews()      // 耗时操作
    initData()       // 耗时操作
    initNetwork()    // 耗时操作
}

// ✅ 优化
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    initViews()
}

override fun onResume() {
    super.onResume()
    initData()
    initNetwork()
}
```

**预加载:**

```kotlin
// 在 SplashActivity 中预加载
class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 预加载首页数据
        lifecycleScope.launch {
            preloadHomeData()
        }
        
        // 跳转首页
        startActivity(Intent(this, HomeActivity::class.java))
        finish()
    }
}
```

### 4.2 配置更新优化

**避免重建:**

```xml
<activity
    android:name=".MyActivity"
    android:configChanges="orientation|screenSize|keyboardHidden|locale" />
```

```kotlin
override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    
    when (newConfig.hardKeyboardHidden) {
        Configuration.HARDKEYBOARDHIDDEN_NO -> {
            // 键盘显示
        }
        Configuration.HARDKEYBOARDHIDDEN_YES -> {
            // 键盘隐藏
        }
    }
}
```

---

## 五、实战代码示例

### 5.1 完整的 Activity 模板

```kotlin
class MainActivity : AppCompatActivity() {
    
    // 生命周期监听
    private val lifecycleObserver = object : LifecycleObserver {
        @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
        fun onCreate() {
            Log.d("Lifecycle", "ON_CREATE")
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_START)
        fun onStart() {
            Log.d("Lifecycle", "ON_START")
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
        fun onResume() {
            Log.d("Lifecycle", "ON_RESUME")
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        fun onPause() {
            Log.d("Lifecycle", "ON_PAUSE")
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
        fun onStop() {
            Log.d("Lifecycle", "ON_STOP")
        }
        
        @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        fun onDestroy() {
            Log.d("Lifecycle", "ON_DESTROY")
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 注册生命周期观察者
        lifecycle.addObserver(lifecycleObserver)
        
        // 初始化
        initViews()
        initData()
        setupObservers()
    }
    
    override fun onStart() {
        super.onStart()
        // 启动统计
        trackActivityStart()
    }
    
    override fun onResume() {
        super.onResume()
        // 恢复资源
        resumeResources()
    }
    
    override fun onPause() {
        // 暂停资源
        pauseResources()
        super.onPause()
    }
    
    override fun onStop() {
        // 停止统计
        trackActivityStop()
        super.onStop()
    }
    
    override fun onDestroy() {
        // 清理资源
        cleanupResources()
        super.onDestroy()
    }
    
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        // 保存状态
        outState.putInt("scrollPosition", recyclerView.layoutManager?.findFirstVisibleItemPosition() ?: 0)
    }
    
    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        // 恢复状态
        recyclerView.scrollToPosition(savedInstanceState.getInt("scrollPosition"))
    }
    
    private fun initViews() {
        // 初始化视图
    }
    
    private fun initData() {
        // 初始化数据
    }
    
    private fun setupObservers() {
        // 设置观察者
    }
    
    private fun resumeResources() {
        // 恢复资源（如视频播放）
    }
    
    private fun pauseResources() {
        // 暂停资源
    }
    
    private fun cleanupResources() {
        // 清理资源（取消注册、释放引用）
    }
}
```

---

## 六、常见面试题汇总

| 问题 | 难度 | 关键点 |
|------|------|-------|
| Activity 生命周期顺序 | ⭐⭐ | onCreate→onStart→onResume |
| 配置变更导致重建 | ⭐⭐⭐ | configChanges |
| onSaveInstanceState 作用 | ⭐⭐⭐ | 临时状态保存 |
| 四种启动模式区别 | ⭐⭐⭐ | Standard/SingleTop/SingleTask/SingleInstance |
| Activity 栈管理 | ⭐⭐⭐ | 压栈、出栈、FLAG |
| 内存泄漏场景 | ⭐⭐⭐⭐ | 未注销、静态引用、Handler |
| Intent Flag 作用 | ⭐⭐⭐ | NEW_TASK、CLEAR_TOP |
| 启动优化方案 | ⭐⭐⭐⭐ | 延迟加载、预加载 |

---

## 七、进阶知识点

### 7.1 Fragment 与 Activity 生命周期

```
Activity: onCreate → onStart → onResume
        ↓
Fragment: onCreate → onAttach → onCreateView → onStart → onResume
```

### 7.2 对话框 Activity

```kotlin
class DialogActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 设置窗口参数
        window.setFlags(
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        )
        
        // 点击外部关闭
        window.setGravity(Gravity.CENTER)
        window.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    }
}
```

### 7.3 转场动画

```xml
<!-- res/values/strings.xml -->
<string name="activity_open_enter">@android:anim/fade_in</string>
<string name="activity_open_exit">@android:anim/fade_out</string>
```

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    overridePendingTransition(R.anim.slide_in, R.anim.slide_out)
}

override fun onBackPressed() {
    super.onBackPressed()
    overridePendingTransition(R.anim.slide_in, R.anim.slide_out)
}
```

---

**📚 参考资料**
- [Android Developers - Activity](https://developer.android.com/guide/components/activities)
- [Activity 生命周期源码分析](https://juejin.cn/post/xxxx)
- [Android 性能优化实战](https://github.com/xxx)

