# Android 面试知识库 - 完整内容总览 📚

> 系统性整理的 Android 高级开发面试知识点，包含详细解析和代码示例

---

## 📊 内容统计

| 模块 | 文件数 | 字数 | 完成度 |
|------|-------|------|--------|
| 01_Foundation | 2 | ~20k | ✅ 100% |
| 02_UI | 1 | ~18k | ✅ 100% |
| 03_Async | 2 | ~30k | ✅ 100% |
| 04_Storage | 1 | ~14k | ✅ 100% |
| 05_Network | 1 | ~18k | ✅ 100% |
| 06_Architecture | 1 | ~26k | ✅ 100% |
| 09_Kotlin | 1 | ~24k | ✅ 100% |
| 10_Performance | 1 | ~24k | ✅ 100% |
| **总计** | **10** | **~174k** | **✅ 核心完成** |

---

## 📂 完整目录结构

```
android-interview-content/
├── README_COMPLETE.md                    # 本文件
├── 00_INDEX.md                           # 知识体系索引
│
├── 01_Foundation/                        # 基础核心
│   ├── 01_四大组件.md                    # ✅ Activity/Service/Broadcast/ContentProvider
│   └── 02_Activity_生命周期.md           # ✅ 生命周期详解
│
├── 02_UI/                                # UI 与布局
│   └── 01_View 绘制流程.md               # ✅ Measure/Layout/Draw
│
├── 03_Async/                             # 异步与多线程
│   ├── 01_Kotlin 协程详解.md             # ✅ 协程/Flow/StateFlow/SharedFlow
│   └── 02_Handler 机制详解.md            # ✅ Handler/MessageQueue/Looper
│
├── 04_Storage/                           # 数据存储
│   └── 01_Room 与数据存储.md             # ✅ Room/DataStore/缓存策略
│
├── 05_Network/                           # 网络编程
│   └── 01_Retrofit 与 OkHttp 详解.md     # ✅ Retrofit/OkHttp/拦截器
│
├── 06_Architecture/                      # 架构模式
│   └── 01_MVVM 架构与 Hilt 依赖注入.md   # ✅ MVVM/MVI/Clean Architecture/Hilt
│
├── 09_Kotlin/                            # Kotlin 核心
│   └── Kotlin 高级面试知识点汇总.md       # ✅ 空安全/协程/泛型/内联等
│
└── 10_Performance/                       # 性能优化
    └── 01_Android 性能优化全攻略.md      # ✅ 启动/内存/布局/网络/包体积
```

---

## 📖 各模块核心内容

### 01_Foundation - 基础核心

#### 01_四大组件.md
- ✅ Activity 四种启动模式详解
- ✅ Service 启动方式对比（startService vs bindService）
- ✅ BroadcastReceiver 静态/动态注册
- ✅ ContentProvider 数据共享
- ✅ Intent 传递数据方式及限制
- ✅ 组件间通信方案

#### 02_Activity_生命周期.md
- ✅ 生命周期完整调用顺序
- ✅ onSaveInstanceState 作用
- ✅ 配置变更导致重建处理
- ✅ Activity 栈管理
- ✅ Intent Flag 使用
- ✅ 内存泄漏场景与检测

---

### 02_UI - UI 与布局

#### 01_View 绘制流程.md
- ✅ Measure 阶段（MeasureSpec 三种模式）
- ✅ Layout 阶段（ViewGroup 布局）
- ✅ Draw 阶段（onDraw 绘制）
- ✅ 自定义 View 完整模板
- ✅ 自定义 ViewGroup 实现（FlowLayout）
- ✅ invalidate vs requestLayout
- ✅ 性能优化（过度绘制、对象复用）

---

### 03_Async - 异步与多线程

#### 01_Kotlin 协程详解.md
- ✅ launch vs async 区别
- ✅ CoroutineScope（lifecycleScope/viewModelScope）
- ✅ Dispatchers（Main/IO/Default）
- ✅ 协程取消与异常处理
- ✅ SupervisorJob 隔离异常
- ✅ Flow 数据流（StateFlow/SharedFlow）
- ✅ Flow 操作符（map/filter/catch/retry/flatMapLatest）
- ✅ 协程与生命周期

#### 02_Handler 机制详解.md
- ✅ Handler/MessageQueue/Looper 关系
- ✅ 消息发送流程源码分析
- ✅ Looper.loop() 原理
- ✅ 线程切换实现
- ✅ ThreadLocal 原理
- ✅ 内存泄漏场景与解决方案
- ✅ Handler vs 协程对比

---

### 04_Storage - 数据存储

#### 01_Room 与数据存储.md
- ✅ Room 快速开始（Entity/Dao/Database）
- ✅ 高级查询（IN/LIKE/排序/聚合）
- ✅ TypeConverter 类型转换
- ✅ 数据库迁移（Migration）
- ✅ DataStore（Preferences/Proto）
- ✅ 缓存策略（LruCache/磁盘缓存/多级缓存）
- ✅ Room vs SQLite vs SharedPreferences

---

### 05_Network - 网络编程

#### 01_Retrofit 与 OkHttp 详解.md
- ✅ Retrofit 注解（GET/POST/PUT/DELETE）
- ✅ 请求参数（Path/Query/Body/Field）
- ✅ OkHttp 拦截器（应用/网络）
- ✅ 缓存策略（CacheControl）
- ✅ 文件上传下载（带进度）
- ✅ Token 无感知刷新（Authenticator）
- ✅ 统一响应处理（Result 封装）
- ✅ 性能优化（连接池/DNS/请求合并）

---

### 06_Architecture - 架构模式

#### 01_MVVM 架构与 Hilt 依赖注入.md
- ✅ MVVM 架构分层（View/ViewModel/Model）
- ✅ 完整代码示例（Data/ViewModel/View）
- ✅ Jetpack Compose + MVVM
- ✅ Hilt 注解（@Inject/@Module/@Provides/@HiltViewModel）
- ✅ Hilt 作用域（Singleton/ViewModelScoped/ActivityScoped）
- ✅ 限定符（@Named/自定义 Qualifier）
- ✅ Clean Architecture 分层
- ✅ Use Case 实现
- ✅ Repository 模式进阶
- ✅ MVI 架构（State/Intent/Event）

---

### 09_Kotlin - Kotlin 核心

#### Kotlin 高级面试知识点汇总.md
- ✅ 空安全（?. ?: !! let）
- ✅ 扩展函数与扩展属性
- ✅ 高阶函数与 Lambda
- ✅ 协程（launch/async/Scope/Dispatcher）
- ✅ Flow 数据流（StateFlow/SharedFlow）
- ✅ 委托（by lazy/Delegates）
- ✅ 密封类（Sealed Class）
- ✅ 内联函数（inline/noinline/crossinline）
- ✅ 泛型与型变（in/out/reified）
- ✅ 作用域函数（let/run/with/apply/also）
- ✅ 完整 ViewModel 实战示例

---

### 10_Performance - 性能优化

#### 01_Android 性能优化全攻略.md
- ✅ 启动优化（延迟/异步初始化/Startup 库/预加载）
- ✅ 内存优化（LeakCanary/常见泄漏场景/Bitmap 优化）
- ✅ 布局优化（减少层级/merge/ViewStub/RecyclerView 优化）
- ✅ 网络优化（缓存/请求合并/去重/压缩）
- ✅ 包体积优化（ProGuard/资源压缩/WebP/动态特性）
- ✅ 性能检测工具（Profiler/Systrace/Perfetto）
- ✅ 自定义性能监控（FPS/启动监控）

---

## 🎯 面试考点速查

### 基础必考（⭐⭐⭐⭐⭐）

| 知识点 | 难度 | 出现频率 | 关键概念 |
|--------|------|---------|---------|
| Activity 生命周期 | ⭐⭐ | ⭐⭐⭐⭐⭐ | onCreate/onStart/onResume |
| 四大组件 | ⭐⭐ | ⭐⭐⭐⭐⭐ | Activity/Service/Broadcast/ContentProvider |
| View 绘制流程 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Measure/Layout/Draw |
| Kotlin 空安全 | ⭐⭐ | ⭐⭐⭐⭐⭐ | `?.`, `?:`, `!!`, `let` |
| 协程基础 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | launch/async/Scope/Dispatcher |
| MVVM 架构 | ⭐⭐⭐ | ⭐⭐⭐⭐ | View/ViewModel/Model |
| 作用域函数 | ⭐⭐ | ⭐⭐⭐⭐⭐ | let/run/with/apply/also |

### 进阶必考（⭐⭐⭐⭐）

| 知识点 | 难度 | 出现频率 | 关键概念 |
|--------|------|---------|---------|
| Handler 机制 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Handler/MessageQueue/Looper |
| Flow 数据流 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | StateFlow/SharedFlow/操作符 |
| Retrofit/OkHttp | ⭐⭐⭐ | ⭐⭐⭐⭐ | 拦截器/缓存/Token 刷新 |
| Hilt 依赖注入 | ⭐⭐⭐⭐ | ⭐⭐⭐ | @Inject/@Module/作用域 |
| 内存泄漏 | ⭐⭐⭐ | ⭐⭐⭐⭐ | LeakCanary/常见场景 |
| 启动优化 | ⭐⭐⭐ | ⭐⭐⭐ | 延迟/异步初始化 |
| Room 数据库 | ⭐⭐⭐ | ⭐⭐⭐ | Entity/Dao/迁移 |

### 高级加分（⭐⭐⭐）

| 知识点 | 难度 | 出现频率 | 关键概念 |
|--------|------|---------|---------|
| Clean Architecture | ⭐⭐⭐⭐ | ⭐⭐ | 分层/Use Case |
| MVI 架构 | ⭐⭐⭐⭐ | ⭐⭐ | State/Intent/Event |
| Binder 机制 | ⭐⭐⭐⭐⭐ | ⭐⭐ | IPC/AIDL |
| 性能监控 | ⭐⭐⭐⭐ | ⭐⭐ | FPS/Systrace |
| 泛型与型变 | ⭐⭐⭐⭐ | ⭐⭐ | in/out/reified |
| 内联函数 | ⭐⭐⭐⭐ | ⭐⭐ | inline/noinline |

---

## 📝 学习路径建议

### 初级开发（0-2 年）
1. **基础核心**: Activity 生命周期、四大组件
2. **UI 基础**: View 绘制流程、常用布局
3. **Kotlin 基础**: 空安全、扩展函数、作用域函数
4. **协程基础**: launch/async、作用域、调度器

### 中级开发（2-5 年）
1. **异步进阶**: Handler 机制、Flow 数据流
2. **网络编程**: Retrofit、OkHttp、拦截器
3. **数据存储**: Room、DataStore、缓存策略
4. **架构模式**: MVVM、Hilt 依赖注入
5. **性能优化**: 内存优化、布局优化

### 高级开发（5 年+）
1. **架构设计**: Clean Architecture、MVI
2. **系统原理**: Binder、AMS、WMS
3. **性能调优**: 启动优化、性能监控
4. **工程化**: Gradle、模块化、CI/CD

---

## 🔥 高频面试题 Top 50

### Activity & 生命周期
1. Activity 生命周期详解
2. 四种启动模式区别
3. Activity 栈管理
4. onSaveInstanceState 作用
5. Activity 与 Service 通信

### View & UI
6. View 绘制三阶段
7. MeasureSpec 三种模式
8. 事件分发机制
9. 自定义 View 步骤
10. RecyclerView 优化

### 协程 & 多线程
11. 协程 vs 线程
12. launch vs async
13. Flow vs LiveData
14. StateFlow vs SharedFlow
15. Handler 机制原理

### 网络 & 存储
16. Retrofit 工作原理
17. OkHttp 拦截器
18. Token 无感知刷新
19. Room 优势
20. DataStore vs SharedPreferences

### 架构 & DI
21. MVVM 优势
22. ViewModel 保留原理
23. Hilt 优势
24. 依赖倒置
25. Clean Architecture

### Kotlin
26. 空安全处理
27. 扩展函数原理
28. 作用域函数区别
29. 协程挂起原理
30. 密封类使用

### 性能优化
31. 启动优化方案
32. 内存泄漏检测
33. Bitmap 优化
34. RecyclerView 优化
35. 包体积优化

### 系统原理
36. Binder 机制
37. AMS 作用
38. WMS 作用
39. 系统启动流程
40. App 启动流程

### 实战问题
41. 如何实现图片加载
42. 如何实现下拉刷新
43. 如何实现分页加载
44. 如何处理网络异常
45. 如何测试 ViewModel

### 开放问题
46. 你做过哪些性能优化
47. 你遇到的最大技术挑战
48. 你如何学习新技术
49. 你最喜欢的开源库
50. 你的职业规划

---

## 🚀 下一步计划

### 待补充内容（优先级中）
- [ ] 07_DI/ - 依赖注入详解（Dagger2/Koin）
- [ ] 08_Jetpack/ - Jetpack 组件全家桶
- [ ] 11_Testing/ - 测试（JUnit/Mockk/Espresso）
- [ ] 12_System/ - Android 系统原理（Binder/AMS/WMS）
- [ ] 13_Engineering/ - 工程化（Gradle/模块化）
- [ ] 14_NewFeatures/ - 新特性（Compose/KMP）

### 待完善功能
- [ ] 面试题库（按公司分类）
- [ ] 代码示例（可运行项目）
- [ ] 思维导图（知识图谱）
- [ ] 模拟面试（Q&A 练习）
- [ ] 简历指导（项目包装）

---

## 📚 参考资料

### 官方文档
- [Android Developers](https://developer.android.com)
- [Kotlin 官方文档](https://kotlinlang.org/docs/home.html)
- [Jetpack 组件](https://developer.android.com/jetpack)

### 优质博客
- [郭霖 Android 博客](https://blog.csdn.net/guolin_blog)
- [鸿洋 Android 博客](https://blog.csdn.net/lmj623565791)
- [Android Developers Blog](https://android-developers.googleblog.com)

### 开源项目
- [Retrofit](https://github.com/square/retrofit)
- [OkHttp](https://github.com/square/okhttp)
- [Kotlin Coroutines](https://github.com/Kotlin/kotlinx.coroutines)

---

**📅 最后更新**: 2026-04-14  
**📝 总字数**: ~174,000 字  
**📂 文档数**: 10 个核心文档  
**✅ 完成度**: 核心知识点 100% 覆盖

---

**祝面试顺利，拿到心仪的 Offer！🎯**
