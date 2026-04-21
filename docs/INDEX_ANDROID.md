# Android 面试知识体系索引 📚

## 🎯 学习目标
- 系统性掌握 Android 开发核心知识
- 高效准备 Android 面试
- 建立完整的知识图谱

---

## 📖 知识模块目录（最终修正版）

### 模块一：Android 基础核心 (Foundation)
**四大组件 + 生命周期 + 基础通信**
```
01_Foundation/
├── 01_四大组件.md                    # Activity/Service/BroadcastReceiver/ContentProvider
├── 02_Activity_生命周期.md           # Activity 生命周期详解
├── 03_Service 服务.md               # Service 启动方式、前台服务
├── 04_BroadcastReceiver 广播.md     # 静态/动态注册、有序/无序
├── 05_ContentProvider 内容提供者.md # 数据共享、UriMatcher
├── 06_Intent 与 IntentFilter.md     # 显式/隐式 Intent、PendingIntent
├── 07_启动模式与任务栈.md           # Standard/SingleTop/SingleTask/SingleInstance
├── 08_组件间通信.md                 # Binder/Messenger/AIDL/事件总线
└── 09_Fragment_详解.md              # Fragment 生命周期/事务/通信（四大组件之一）
```

### 模块二：UI 与布局 (UI & Layout)
**View 系统 + 布局 + 动画 + 自定义 UI**
```
02_UI/
├── 01_常用布局.md                   # LinearLayout/RelativeLayout/ConstraintLayout
├── 02_View_绘制流程.md              # Measure/Layout/Draw
├── 03_事件分发机制.md               # dispatchTouchEvent/onInterceptTouchEvent
├── 04_自定义 View.md                # 自定义 View/ViewGroup 完整流程
├── 05_RecyclerView 优化.md          # ViewHolder/预取/DiffUtil
├── 06_Animations 动画.md            # View/Property 动画
├── 07_Material_Design.md            # Material Components
├── 08_Adapter 模式.md               # Adapter 设计模式
└── 09_响应式布局.md                 # 多屏幕适配、折叠屏
```

### 模块三：Kotlin 核心 (Kotlin Core)
**语言特性 + 协程 + Flow（统一在这里）**
```
03_Kotlin/
├── 01_基础语法.md
├── 02_空安全.md                     # ?. ?: !! let
├── 03_扩展函数.md
├── 04_高阶函数.md
├── 05_Lambda 表达式.md
├── 06_委托属性.md                   # by lazy/observable
├── 07_密封类.md                     # Sealed Class vs Enum
├── 08_内联函数.md                   # inline/noinline/crossinline/reified
├── 09_协程详解.md                   # launch/async/Scope/Dispatcher
├── 10_Suspend 函数.md               # 挂起与恢复
├── 11_CoroutineScope.md             # SupervisorJob/结构化并发
└── 12_Flow 操作符.md                # StateFlow/SharedFlow/操作符
```

### 模块四：异步与多线程 (Async & Threading)
**Handler + 线程池 + 协程应用场景**
```
04_Async/
├── 01_线程基础.md                   # Thread/Runnable/线程状态
├── 02_Handler_机制.md              # Handler/MessageQueue/Looper
├── 03_线程池.md                    # ThreadPoolExecutor/拒绝策略
├── 04_AsyncTask_废弃替代.md        # ExecutorService/协程替代
├── 05_协程应用场景.md              # 协程 vs 线程对比（引用 03_Kotlin 内容）
├── 06_Lifecycle_感知协程.md        # lifecycleScope/viewModelScope
└── 07_线程通信.md                  # wait/notify/Lock
```

### 模块五：数据存储 (Data Storage)
**本地存储 + 数据库 + 缓存**
```
05_Storage/
├── 01_SharedPreferences.md
├── 02_SQLite_数据库.md
├── 03_Room_ORM.md                 # Entity/Dao/Database/迁移（Room 是 Jetpack 组件）
├── 04_DataStore.md                # Preferences/Proto DataStore（Jetpack 组件）
├── 05_文件存储.md                 # 内部/外部存储
├── 06_网络缓存.md                 # HTTP 缓存策略
└── 07_内存管理.md                 # LruCache/缓存策略
```

### 模块六：网络编程 (Networking)
**HTTP + Retrofit + OkHttp + 图片加载**
```
06_Network/
├── 01_HTTP_基础.md                # HTTP/HTTPS/状态码
├── 02_Retrofit_框架.md            # 注解/ConverterFactory/CallAdapter
├── 03_OkHttp_底层.md             # 拦截器/连接池/缓存
├── 04_Volley.md                  # Volley 轻量请求
├── 05_WebSocket.md               # 长连接/推送
├── 06_网络优化.md                # 请求合并/数据压缩
├── 07_证书与加密.md              # HTTPS/SSL Pinning
└── 08_图片加载_Glide.md          # Glide 缓存/占位
```

### 模块七：架构模式 (Architecture)
**MVVM/MVP/MVI + Repository 模式（架构设计层面）**
```
07_Architecture/
├── 01_MVVM 架构与 Hilt 依赖注入.md               # ViewModel+LiveData/Flow 在架构中的应用
├── 02_MVP 架构.md               # Presenter 设计
├── 03_MVI 架构.md               # State/Intent/Event/单向数据流
├── 04_VIPER 架构.md             # Viper 分层
├── 05_Repository 模式.md        # 数据源抽象/缓存策略
├── 06_Clean_Architecture.md     # 分层/依赖倒置
└── 07_架构对比.md               # MVC/MVP/MVVM/MVI 对比选择
```

### 模块八：依赖注入 (Dependency Injection)
**Hilt/Dagger 2/Koin（完整的 DI 框架都放在这里）**
```
08_DI/
├── 01_DI 基础概念.md            # 依赖倒置/IoC/三种注入方式
├── 02_Hilt 框架.md              # @HiltAndroidApp/@Module/@Inject
├── 03_Dagger 2.md              # Component/Module/SubComponent
├── 04_Koin.md                  # DSL 语法/作用域
├── 05_作用域管理.md            # Singleton/Scoped/Factory
└── 06_测试与模拟.md            # DI 测试/Mock 注入
```

### 模块九：Jetpack 组件 (Jetpack)
**官方 Jetpack 组件（Lifecycle、ViewModel、LiveData 等）- 只放组件 API 使用**
```
09_Jetpack/
├── 01_Lifecycle.md             # LifecycleOwner/Observer（Jetpack Foundation）
├── 02_ViewModel_组件.md        # ViewModel 组件 API 使用（Jetpack Foundation，非架构层面）
├── 03_LiveData_组件.md         # LiveData 组件 API 使用（Jetpack Foundation，非架构层面）
├── 04_Navigation.md            # NavHostFragment/NavGraph（Jetpack Navigation）
├── 05_WorkManager.md          # Worker/WorkRequest（Jetpack Architecture）
├── 06_SavedStateHandle.md     # SavedState/ViewModel 状态恢复（Jetpack）
├── 07_Startup.md              # App Startup 库（Jetpack Performance）
├── 08_SplashScreen.md         # Splash Screen API（Jetpack Performance）
└── 09_Paging.md               # Paging 3 分页加载（Jetpack Architecture）
```

### 模块十：数据绑定与视图绑定 (Data Binding)
**ViewBinding + DataBinding（独立模块，因为它们不是 Jetpack 组件）**
```
10_DataBinding/
├── 01_ViewBinding.md          # ViewBinding 自动绑定（AGP 功能）
├── 02_DataBinding.md          # DataBinding 数据绑定
├── 03_双向绑定.md             # @={} 双向绑定
├── 04_BindingAdapter.md       # 自定义 BindingAdapter
└── 05_表达式语言.md           # DataBinding 表达式语法
```

### 模块十一：兼容库与适配 (Compatibility)
**AppCompat + 兼容库（独立模块，因为 AppCompat 不是 Jetpack）**
```
11_Compat/
├── 01_AppCompatActivity.md    # AppCompatActivity（支持库）
├── 02_AppCompatDelegate.md    # 主题适配（支持库）
├── 03_深色模式适配.md         # Dark Theme
├── 04_Toolbar.md              # ActionBar 替代方案
└── 05_多屏幕适配.md           # 多设备适配
```

### 模块十二：性能优化 (Performance)
**启动/内存/布局/网络/包体积优化**
```
12_Performance/
├── 01_Android 性能优化全攻略.md              # 冷启动/异步初始化
├── 02_内存优化.md              # LeakCanary/内存泄漏检测
├── 03_布局优化.md              # 减少层级/过度绘制
├── 04_网络优化.md              # 连接复用/请求合并
├── 05_电量优化.md              # 后台任务优化
├── 06_包体积优化.md            # ProGuard/资源压缩
├── 07_动画性能.md              # 硬件加速
├── 08_数据库优化.md            # Room 查询优化
├── 09_渲染优化.md              # GPU 渲染/Systrace
└── 10_Profiler 工具.md         # Android Profiler/Perfetto
```

### 模块十三：测试与调试 (Testing)
**单元测试 + UI 测试 + 调试工具**
```
13_Testing/
├── 01_单元测试_JUnit.md
├── 02_模拟_Mockk.md            # Mock/Mockk
├── 03_UI 测试_Espresso.md      # Espresso UI 测试
├── 04_自动化测试.md            # 自动化测试框架
├── 05_Logcat 调试.md
├── 06_AndroidStudio 调试.md
├── 07_性能分析.md
└── 08_内存泄漏_LeakCanary.md
```

### 模块十四：Android 系统 (System)
**系统原理 + Binder + AMS/WMS/PMS**
```
14_System/
├── 01_Zygote 进程.md
├── 02_SystemServer.md
├── 03_AMS_PMS_WMS.md          # 三大服务
├── 04_Binder 机制.md           # Binder IPC/AIDL 底层
├── 05_AIDL 跨进程.md           # 跨进程通信
├── 06_启动流程.md              # Bootloader→Kernel→Init→Zygote
├── 07_包安装流程.md            # PMS 解析 APK/签名验证
├── 08_通知机制.md              # NotificationChannel
├── 09_权限系统.md              # 运行时权限
└── 10_安全机制.md              # SELinux/沙箱/反调试
```

### 模块十五：模块化与工程化 (Engineering)
**Gradle + 模块化 + CI/CD**
```
15_Engineering/
├── 01_Gradle 基础.md
├── 02_Groovy_Kotlin_DSL.md
├── 03_模块化架构.md            # 模块划分/依赖管理
├── 04_动态特性.md              # Dynamic Feature Module
├── 05_ARC 插件.md
├── 06_CI_CD.md                # GitHub Actions/GitLab CI
├── 07_代码规范.md              # Kotlin Style Guide
├── 08_版本管理.md              # Semantic Versioning
├── 09_埋点统计.md              # 数据分析/埋点
└── 10_崩溃统计.md              # Crashlytics/Bugly
```

### 模块十六：新特性与前沿 (New Features)
**Compose + KMP + 新 Android 版本特性**
```
16_NewFeatures/
├── 01_Compose_Jetpack.md       # Jetpack Compose 声明式 UI
├── 02_Compose_Multiplatform.md # Compose Multiplatform
├── 03_KMP_多平台.md            # Kotlin Multiplatform
├── 04_Android_13_新特性.md    # Android 13/14/15 新特性
├── 05_折叠屏适配.md            # Foldable/折叠屏
├── 06_手势导航.md              # Gesture Navigation
├── 07_隐私权限.md              # 隐私沙盒
└── 08_5G 优化.md               # 5G 网络优化
```

---

## 🎓 学习路径建议

### 初级开发（0-2 年）
1. **模块一**：基础核心 ⭐⭐⭐（四大组件、Activity 生命周期、Fragment）
2. **模块二**：UI 与布局 ⭐⭐⭐（View 绘制、事件分发）
3. **模块三**：Kotlin 核心 ⭐⭐⭐（空安全、协程、Flow）
4. **模块五**：数据存储 ⭐⭐（SharedPreferences、Room）

### 中级开发（2-5 年）
1. **模块四**：异步与多线程 ⭐⭐（Handler、线程池）
2. **模块六**：网络编程 ⭐⭐（Retrofit、OkHttp）
3. **模块七**：架构模式 ⭐⭐（MVVM、Repository）
4. **模块八**：依赖注入 ⭐⭐（Hilt、Dagger 2）
5. **模块九**：Jetpack 组件 ⭐⭐（Lifecycle、ViewModel、LiveData）
6. **模块十**：数据绑定 ⭐⭐（ViewBinding、DataBinding）
7. **模块十一**：兼容适配 ⭐⭐（AppCompat、深色模式）
8. **模块十二**：性能优化 ⭐⭐（启动、内存、布局）

### 高级开发（5 年+）
1. **模块十三**：测试与调试 ⭐（单元测试、Espresso）
2. **模块十四**：Android 系统 ⭐（Binder、AMS/WMS）
3. **模块十五**：模块化与工程化 ⭐（Gradle、CI/CD）
4. **模块十六**：新特性与前沿 ⭐（Compose、KMP）

---

## 📝 内容来源

### 官方文档
- [Android Developer Guide](https://developer.android.com/guide)
- [Kotlin 官方文档](https://kotlinlang.org/docs/home.html)
- [Jetpack 组件文档](https://developer.android.com/jetpack)

### 优质博客
- [Android Developers Blog](https://android-developers.googleblog.com)
- [Kotlin Blog](https://blog.kotlinlang.org)
- [郭霖 Android 博客](https://blog.csdn.net/guolin_blog)
- [博客园 Android 专栏](https://www.cnblogs.com/tag/android)

### 开源项目
- [Retrofit](https://github.com/square/retrofit)
- [OkHttp](https://github.com/square/okhttp)
- [Glide](https://github.com/bumptech/glide)
- [Room](https://github.com/android/room)

### 面试题库
- [LeetCode Android 专题](https://leetcode.com)
- [牛客网 Android 题库](https://www.nowcoder.com)
- [GitHub 面试宝典](https://github.com/guolindev/Android-Interview)

---

## 📋 模块关系说明

### 为什么这样划分？

1. **01_Foundation 包含 Fragment**
   - Fragment 是四大组件之一（与 Activity/Service/BroadcastReceiver/ContentProvider 同级）
   - 不应该放在 Jetpack 模块

2. **09_Jetpack 只包含真正的 Jetpack 组件**
   - Lifecycle、ViewModel、LiveData（Jetpack Foundation）
   - Room、DataStore、WorkManager、Navigation（Jetpack Architecture）
   - **不包含**：AppCompat（支持库）、DataBinding（独立库）、Fragment（四大组件）

3. **10_DataBinding 独立模块**
   - ViewBinding（AGP 功能）
   - DataBinding（独立库）
   - 它们不是 Jetpack 组件，应该独立

4. **11_Compat 兼容库独立模块**
   - AppCompat（支持库，2017 年前）
   - 深色模式适配
   - 多屏幕适配
   - **注意**：AppCompat 不是 Jetpack 组件！

5. **07_Architecture 架构模式**
   - MVVM/MVP/MVI（架构设计层面）
   - Repository 模式
   - **不包含**：组件 API 使用

6. **03_Kotlin 包含完整的协程/Flow**
   - 避免在 Async 和 Kotlin 中重复
   - 语言特性统一放在 Kotlin 模块

---

**📅 最后更新**: 2026-04-14  
**📝 修正说明**: 
- ✅ Fragment 移到 01_Foundation（四大组件之一）
- ✅ AppCompat 移到 11_Compat（支持库，不是 Jetpack）
- ✅ DataBinding 移到 10_DataBinding（独立模块）
- ✅ Jetpack 模块只包含真正的 Jetpack 组件
- ✅ 协程内容统一到 03_Kotlin
- ✅ ViewModel/LiveData 区分组件 API（09_Jetpack）和架构应用（07_Architecture）
- ✅ Hilt 内容集中到 08_DI
- 从 14 个模块扩展到 16 个模块（更清晰）
