# 鸿蒙 (HarmonyOS NEXT) 面试知识体系索引 🐾

> 面向鸿蒙开发者/初学者，系统掌握开发核心知识，高效准备面试，建立完整的鸿蒙知识图谱。
>
> **目标版本**: HarmonyOS NEXT (API 11/12+)
> **核心语言**: ArkTS（TypeScript 超集 + 声明式 UI 扩展）
> **应用模型**: Stage 模型

---

## 📖 知识模块目录

### 模块一：ArkTS 语言基础 (Language Core)
**TypeScript 超集 + 静态类型 + 声明式 UI 语法扩展**
```
01_Language/
├── 01_ArkTS 概述.md              # ArkTS vs TS/JS 关系、静态类型、禁止 any
├── 02_基础语法.md                # 类型声明/推导、let/const、块级作用域
├── 03_装饰器.md                  # @Component/@Entry/@Builder/@Styles/@Extend
├── 04_空安全.md                  # null/undefined 严格区分、联合类型
├── 05_类与接口.md                # class/interface/enum/generics
├── 06_泛型与 Record.md           # 泛型机制、Record 类型优势
├── 07_模块系统.md                # import/export、模块加载机制、单例模式
├── 08_闭包与作用域.md            # this 指向、箭头函数绑定、回调陷阱
├── 09_异步编程.md                # async/await、Promise 机制
├── 10_数据结构.md                # struct vs class、Sendable 对象
├── 11_与 C++ 交互.md             # NAPI 基础、napi_ref、.so 导入
└── 12_性能最佳实践.md            # Hidden Class、类型约束、避免 eval
```

### 模块二：ArkUI 与声明式 UI (UI & Layout)
**声明式 UI 开发 + 组件系统 + 布局容器 + 渲染三棵树**
```
02_ArkUI/
├── 01_声明式 UI 范式.md          # 声明式 vs 命令式、UI 即代码
├── 02_常用布局容器.md            # Row/Column/Stack/Flex/Grid/RelativeContainer
├── 03_布局约束与单位.md          # vp/fp/px、matchParent/weight/固定
├── 04_内置组件.md               # Text/Button/Image/List/Swiper/Scroll 等
├── 05_样式与属性.md             # 通用属性/几何属性/容器属性
├── 06_自定义组件.md             # @Component + build()、@Builder
├── 07_组件参数传递.md           # @Prop/@Link/@BuilderParam
├── 08_动画系统.md               # animation/animateTo/transition/motionPath
├── 09_断点与多端适配.md         # Breakpoints/媒体查询/栅格布局
├── 10_沉浸式状态栏.md           # 系统栏避让/全屏布局/安全区域
├── 11_列表渲染.md               # List/LazyForEach/IDataSource
├── 12_渲染三棵树原理.md         # ViewTree -> RenderTree -> LayerTree/RSNode
├── 13_XComponent 渲染.md        # EGL/OpenGL 高性能渲染
└── 14_弹窗与对话框.md           # Dialog/Popup/CustomDialogController
```

### 模块三：状态管理 (State Management)
**ArkUI 状态驱动机制 + 状态管理 V2 + 数据流动**
```
03_StateManagement/
├── 01_状态驱动机制.md           # 数据变化->监听->标记->刷新流程
├── 02_@State 本地状态.md        # 自身管理、脏节点标记、刷新机制
├── 03_@Prop 单向数据流.md      # 父子单向拷贝、深拷贝性能问题
├── 04_@Link 双向绑定.md         # 父子双向引用、响应式同步
├── 05_@Provide @Consume 跨树.md # 跨组件层级通信、爷孙传值
├── 06_@ObjectLink 深度绑定.md   # 嵌套对象监听、@Observed 类装饰
├── 07_@Watch 状态监听.md        # 状态变化回调、自动化数据请求
├── 08_AppStorage 全局单例.md    # 跨 UIAbility 共享、应用级存储
├── 09_LocalStorage 页面级存储.md # 页面/Ability 级单例、多窗口隔离
├── 10_PersistentStorage 持久化.md# XML/Preferences 持久化、写入磁盘
├── 11_状态管理 V2.md            # @Trace/@Local/@Param/@Event、ObservedV2
├── 12_单一数据源原则.md         # Source of Truth、引用传递
└── 13_复杂状态管理方案.md       # Store/Service 模式、混合方案
```

### 模块四：Stage 模型与应用架构 (Application Model)
**UIAbility + ExtensionAbility + Want + 生命周期**
```
04_StageModel/
├── 01_Application 生命周期.md   # 应用生命周期、ApplicationStage
├── 02_UIAbility 概述.md         # UIAbility 概念、作用、与 Android Activity 对比
├── 03_UIAbility 生命周期.md     # onCreate/onForeground/onBackground/onDestroy
├── 04_UIAbility 启动模式.md     # Singleton/Standard/Specified
├── 05_ExtensionAbility.md      # FormExtension/WorkSchedulerExtension/InputMethodExtension
├── 06_生命周期管理.md           # AbilityStage/生命周期感知、回调管理
├── 07_Want 意图.md             # Want 对象、parameters 传参、显式/隐式 Want
├── 08_Context 上下文.md        # ApplicationContext/UIAbilityContext 区别
├── 09_页面路由 Navigation.md    # Navigation 组件、路由栈、分栏/动效
├── 10_页面路由 Router.md        # 旧版 router API、pushUrl/replaceUrl
├── 11_跨 Ability 通信.md        # startAbility/stopAbility、AbilityDelegator
├── 12_事件总线与订阅.md         # CommonEvent、发布订阅机制
├── 13_深链接 Deep Link.md       # skills/uris 配置、隐式启动
├── 14_多窗口支持.md            # 多窗口管理、任务栈
└── 15_应用打包发布.md           # HAP/HAR/HSP、签名流程、上架
```

### 模块五：并发模型与网络 (Concurrency & Networking)
**Actor 模型 + TaskPool/Worker + 网络通信**
```
05_Concurrency/
├── 01_线程模型 Actor.md        # 线程隔离、消息传递、无锁机制
├── 02_TaskPool 任务池.md        # 短时任务、系统管理、推荐方案
├── 03_Worker 长时任务.md       # 手动管理、常驻任务、数量限制
├── 04_UI 线程与工作线程.md      # 主线程职责、子线程更新 UI 限制
├── 05_http 模块.md             # @kit.NetworkKit/http、createHttp/destroy
├── 06_rcp 网络库.md            # Remote Communication Kit、拦截器支持
├── 07_并发请求处理.md          # Promise.all/async/await、请求合并
├── 08_WebSocket 长连接.md      # webSocket 模块、消息订阅、重连
├── 09_大文件传输.md            # request 模块、系统代理传输
├── 10_Sendable 对象.md         # ISendable、线程间高效传递
├── 11_网络安全与 HTTPS.md      # SSL Pinning、证书校验、安全传输
└── 12_socket 通信.md           # TCP/UDP Socket、本地通信
```

### 模块六：数据存储 (Data Storage)
**Preferences + KV-Store + RDB + 文件 + 分布式数据**
```
06_Storage/
├── 01_Preferences 首选项.md    # Key-Value 配置、用户偏好设置
├── 02_KV-Store 键值数据库.md   # 分布式 KV、数据同步
├── 03_RDB 关系型数据库.md      # SQLite、RdbStore、事务、迁移
├── 04_文件存储.md              # fs 模块、沙箱目录、rawfile vs resource
├── 05_相册与媒体库.md          # PhotoViewPicker、URI 访问、多媒体
├── 06_数据加密.md              # RDB 加密、CryptoArchitectureKit
├── 07_分布式数据.md            # 跨设备数据同步、分布式软总线
└── 08_缓存策略.md              # 内存缓存、磁盘缓存、LruCache
```

### 模块七：分布式开发 (Distributed Development)
**鸿蒙核心特色 + 分布式软总线 + 跨设备协同**
```
07_Distributed/
├── 01_分布式软总线.md          # 设备发现、连接建立、统一通信管道
├── 02_设备发现与连接.md        # deviceManager API、订阅/连接/断开
├── 03_分布式数据对象.md        # 内存对象跨设备同步
├── 04_分布式任务调度.md        # 跨设备任务分发、远程调用
├── 05_分布式 UI 迁移.md        # 应用跨设备迁移、连续性体验
├── 06_分布式相机.md            # 远程拍照、设备能力共享
├── 07_分布式地图.md            # 跨设备地图协同
├── 08_分布式音频.md            # 音频跨设备播放、设备切换
└── 09_原子化服务.md            # 免安装、即点即用、元服务
```

### 模块八：权限与安全 (Permissions & Security)
**TokenID 访问控制 + 运行时权限 + 应用安全**
```
08_Permissions/
├── 01_权限模型概述.md          # TokenID/ATM 访问控制、权限等级
├── 02_权限分类.md              # system_basic/system_core/normal
├── 03_权限声明流程.md          # module.json5 声明、reqPermissions
├── 04_运行时权限申请.md        # checkAccessToken/requestPermissionsFromUser
├── 05_常见权限.md              # 相机/位置/麦克风/存储/蓝牙/WLAN
├── 06_应用沙箱.md              # 沙箱目录、文件隔离、URI 安全
├── 07_安全存储.md              # Asset Store、Token/密码安全存储
├── 08_签名与证书.md            # .p12/.csr/.cer/.p7b 证书流程
└── 09_安全加固.md              # 代码混淆/反调试/安全检测
```

### 模块九：性能优化 (Performance Optimization)
**启动/渲染/内存/网络/包体积优化**
```
09_Performance/
├── 01_启动优化.md              # 冷启动/Ability onCreate/首屏 build 优化
├── 02_渲染性能优化.md          # 渲染三棵树/减少 Layout/图片下采样
├── 03_内存优化.md              # 内存泄漏检测/Heap Snapshot/GC 原理
├── 04_列表性能优化.md          # LazyForEach/固定宽高/组件复用
├── 05_网络优化.md              # 连接复用/请求合并/数据压缩
├── 06_包体积优化.md            # HSP/代码压缩/图片压缩/动态导入
├── 07_动画性能.md              # 硬件加速/动效中断/弹簧模型
├── 08_电池优化.md              # 后台任务管理/唤醒锁/定位优化
├── 09_卡顿检测与优化.md        # SmartPerf/FPS 分析/主线程检查
└── 10_Profiler 工具.md         # DevEco Studio Profiler、性能分析
```

### 模块十：工程化与构建 (Engineering & Build)
**Hvigor + 多端构建 + 测试 + 代码规范**
```
10_Engineering/
├── 01_Hvigor 构建系统.md       # 鸿蒙构建工具、TS 脚本、构建流程
├── 02_项目结构.md              # entry/pages/resources/common 目录
├── 03_HAR HSP HAP 包.md       # 静态共享/动态共享/应用包的区别与选型
├── 04_模块化架构.md            # 模块划分、依赖管理、分包策略
├── 05_多环境配置.md            # Dev/Prod/Release product defines
├── 06_代码混淆.md              # build-profile.json5、ProGuard 配置
├── 07_多端构建与适配.md        # 断点/栅格/限定词/多设备输出
├── 08_国际化.md               # 多语言资源、zh_CN/en_US 配置
├── 09_测试框架 Hypium.md      # 单元测试、Mock、测试用例编写
├── 10_自动化构建 CI.md        # DevEco CI、持续集成流程
├── 11_源码保护.md             # ByteCodeHAR、字节码编译
└── 12_上架与发布.md           # AppGallery 上架、审核规范
```

### 模块十一：系统能力与底层 (System & Underlying)
**HongMeng Kernel + 安全模型 + 系统服务**
```
11_System/
├── 01_鸿蒙内核.md              # HongMeng Kernel、微内核架构
├── 02_系统启动流程.md          # Bootloader→Kernel→Init→Zygote→SystemServer
├── 03_进程与线程管理.md        # 进程模型、线程调度、OOM Killer
├── 04_安全模型.md              # TokenID/ATM、沙箱机制、SELinux
├── 05_系统服务.md              # 系统服务架构、系统能力调用
├── 06_通知系统.md              # Notification、通知渠道、消息推送
├── 07_广播与事件.md            # CommonEvent、系统广播
├── 08_NAPI 扩展开发.md         # C++ 接口暴露、NAPI 编程指南
├── 09_底层渲染机制.md          # RenderService、FrameNode/RenderNode
└── 10_新特性探索.md            # 鸿蒙 6.0/HDS、星闪、AI 能力
```

### 模块十二：新特性与前沿 (New Features)
**Compose + KMP + 鸿蒙最新技术方向**
```
12_NewFeatures/
├── 01_状态管理 V2 深度.md       # ObservedV2/@Trace/Signal/Proxy 原理
├── 02_原子化服务进阶.md        # 元服务架构、免安装、分发
├── 03_鸿蒙 AI 能力.md          # 端侧 AI、模型集成、AI 组件
├── 04_鸿蒙 6.0 新特性.md      # API 23+、新能力、新组件
├── 05_折叠屏/平板适配.md       # 折叠屏布局、自适应 UI
├── 06_车载鸿蒙.md              # HarmonyOS for Automotive、车机开发
├── 07_智能家居生态.md          # IoT 设备接入、分布式场景
└── 08_鸿蒙生态展望.md          # 鸿蒙生态发展、开发者机会
```

---

## 🎓 学习路径建议

### 初学者（0-6 个月入门）
1. **模块一**：ArkTS 语言基础 ⭐⭐⭐（类型系统、装饰器、空安全）
2. **模块二**：ArkUI 与布局 ⭐⭐⭐（常用组件、布局容器、自定义组件）
3. **模块三**：状态管理 ⭐⭐⭐（@State/@Prop/@Link、状态驱动机制）
4. **模块四**：Stage 模型基础 ⭐⭐（UIAbility 生命周期、页面路由）
5. **模块六**：数据存储 ⭐⭐（Preferences、RDB）

### 中级开发者（6-18 个月进阶）
1. **模块五**：并发与网络 ⭐⭐⭐（Actor 模型、TaskPool、http/rcp）
2. **模块七**：分布式开发 ⭐⭐⭐（软总线、跨设备协同、原子化服务）
3. **模块九**：性能优化 ⭐⭐⭐（启动/渲染/内存/列表优化）
4. **模块八**：权限与安全 ⭐⭐（权限模型、签名流程）
5. **模块十**：工程化 ⭐⭐（Hvigor、模块化、多端构建）
6. **模块三进阶**：状态管理 V2 ⭐⭐（@Trace/@Local、高级方案）

### 高级/架构师（18 个月+）
1. **模块十一**：系统与底层 ⭐⭐⭐（内核、安全模型、NAPI）
2. **模块十二**：前沿特性 ⭐⭐⭐（AI 能力、鸿蒙 6.0、车载生态）
3. **模块七深度**：分布式架构 ⭐⭐⭐（跨设备任务调度、分布式 UI）
4. **模块九深度**：性能工程 ⭐⭐⭐（全链路性能优化、性能建模）
5. **模块四深度**：应用架构设计 ⭐⭐⭐（多 Ability 架构、复杂路由）
6. **模块十深度**：大规模工程化 ⭐⭐⭐（多端自动化、CI/CD 流水线）

---

## 📝 模块划分说明

### 与 Android 知识体系对照

| Android 模块 | 鸿蒙对应模块 | 说明 |
|---|---|---|
| 01_Foundation（四大组件） | 04_StageModel | UIAbility/ExtensionAbility 类比四大组件 |
| 02_UI | 02_ArkUI | ArkUI 是鸿蒙的声明式 UI 框架（替代 XML 布局） |
| 03_Kotlin | 01_Language | ArkTS 对应 Kotlin，语言层面学习 |
| 04_Async | 05_Concurrency | Actor 模型是鸿蒙的核心并发模型 |
| 05_Storage | 06_Storage | Preferences/KV-Store/RDB 对应 SharedPreferences/Room |
| 06_Network | 05_Concurrency | http/rcp 模块对应 Retrofit/OkHttp |
| 07_Architecture | 04_StageModel | Stage 模型本身就是应用架构 |
| 08_DI | (融合) | 鸿蒙无统一 DI 框架，依赖模块系统 |
| 09_Jetpack | 04_StageModel + 02_ArkUI | ArkUI + Stage 即鸿蒙的"Jetpack" |
| 12_Performance | 09_Performance | 全链路性能优化 |
| 14_System | 11_System | HongMeng Kernel + 系统服务 |
| 15_Engineering | 10_Engineering | Hvigor + 模块化 + 测试 |
| 16_NewFeatures | 12_NewFeatures | ArkUI V2/原子服务/AI |
| - | **07_Distributed** | ⭐ 鸿蒙独有：分布式软总线与跨设备 |
| - | **08_Permissions** | ⭐ 独立安全模块：权限/证书/加密 |

### 为什么这样划分？

1. **ArkTS 独立为基础模块** — ArkTS 是鸿蒙开发的第一课，与 Kotlin 同等重要
2. **ArkUI 作为核心模块** — 声明式 UI + 渲染三棵树是鸿蒙最特色的部分
3. **状态管理独立模块** — 状态管理是鸿蒙面试最高频考点，分 V1/V2 两层
4. **Stage 模型整合架构** — UIAbility/ExtensionAbility/Want/路由 统一放在这里
5. **分布式开发单设模块** — 这是鸿蒙区别于 Android 的最大亮点
6. **权限安全独立模块** — TokenID/ATM 模型与 Android 完全不同，需单独讲解

---

## 📋 面试高频考点速查

### 必考（⭐⭐⭐⭐⭐）
- [ ] @State/@Prop/@Link 的区别
- [ ] 渲染三棵树原理
- [ ] UIAbility 生命周期
- [ ] Actor 线程模型
- [ ] LazyForEach 原理与限制
- [ ] HAP/HAR/HSP 区别
- [ ] 状态管理 V2 (@Trace/@Local)

### 高频（⭐⭐⭐⭐）
- [ ] @Builder/@BuilderParam/@Styles/@Extend 区别
- [ ] 分布式软总线原理
- [ ] AppStorage vs LocalStorage
- [ ] relativeContainer 解决的问题
- [ ] TaskPool vs Worker
- [ ] Want 意图传参方式
- [ ] 启动优化策略

### 中频（⭐⭐⭐）
- [ ] 断点与多端适配
- [ ] 权限申请流程
- [ ] NAPI 交互原理
- [ ] 深链接配置
- [ ] 原子化服务
- [ ] Hvigor 构建系统

---

## 📅 最后更新
2026-04-21

---

**📚 推荐资源**
- [HarmonyOS 官方文档](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/de)
- [DevEco Studio](https://developer.harmonyos.com/cn/develop/deveco-studio)
- [鸿蒙开发者社区](https://harmonyosdev.csdn.net)
- [ArkTS API 参考](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-api-0000001757151294)
- [OpenHarmony 社区](https://openharmony.cn)
- [鸿蒙 Codelabs](https://developer.harmonyos.com/cn/develop/codelabs)
- [鸿蒙面试知识库](https://harmonyos-next.github.io/interview-handbook-project/guide/index.html)
