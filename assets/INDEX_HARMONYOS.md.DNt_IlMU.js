import{_ as n,o as s,c as e,ae as t}from"./chunks/framework.Czhw_PXq.js";const h=JSON.parse('{"title":"鸿蒙 (HarmonyOS NEXT) 面试知识体系索引 🐾","description":"","frontmatter":{},"headers":[],"relativePath":"INDEX_HARMONYOS.md","filePath":"INDEX_HARMONYOS.md"}'),p={name:"INDEX_HARMONYOS.md"};function i(l,a,r,o,d,c){return s(),e("div",null,[...a[0]||(a[0]=[t(`<h1 id="鸿蒙-harmonyos-next-面试知识体系索引-🐾" tabindex="-1">鸿蒙 (HarmonyOS NEXT) 面试知识体系索引 🐾 <a class="header-anchor" href="#鸿蒙-harmonyos-next-面试知识体系索引-🐾" aria-label="Permalink to &quot;鸿蒙 (HarmonyOS NEXT) 面试知识体系索引 🐾&quot;">​</a></h1><blockquote><p>面向鸿蒙开发者/初学者，系统掌握开发核心知识，高效准备面试，建立完整的鸿蒙知识图谱。</p><p><strong>目标版本</strong>: HarmonyOS NEXT (API 11/12+) <strong>核心语言</strong>: ArkTS（TypeScript 超集 + 声明式 UI 扩展） <strong>应用模型</strong>: Stage 模型</p></blockquote><hr><h2 id="📖-知识模块目录" tabindex="-1">📖 知识模块目录 <a class="header-anchor" href="#📖-知识模块目录" aria-label="Permalink to &quot;📖 知识模块目录&quot;">​</a></h2><h3 id="模块一-arkts-语言基础-language-core" tabindex="-1">模块一：ArkTS 语言基础 (Language Core) <a class="header-anchor" href="#模块一-arkts-语言基础-language-core" aria-label="Permalink to &quot;模块一：ArkTS 语言基础 (Language Core)&quot;">​</a></h3><p><strong>TypeScript 超集 + 静态类型 + 声明式 UI 语法扩展</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>01_Language/</span></span>
<span class="line"><span>├── 01_ArkTS 概述.md              # ArkTS vs TS/JS 关系、静态类型、禁止 any</span></span>
<span class="line"><span>├── 02_基础语法.md                # 类型声明/推导、let/const、块级作用域</span></span>
<span class="line"><span>├── 03_装饰器.md                  # @Component/@Entry/@Builder/@Styles/@Extend</span></span>
<span class="line"><span>├── 04_空安全.md                  # null/undefined 严格区分、联合类型</span></span>
<span class="line"><span>├── 05_类与接口.md                # class/interface/enum/generics</span></span>
<span class="line"><span>├── 06_泛型与 Record.md           # 泛型机制、Record 类型优势</span></span>
<span class="line"><span>├── 07_模块系统.md                # import/export、模块加载机制、单例模式</span></span>
<span class="line"><span>├── 08_闭包与作用域.md            # this 指向、箭头函数绑定、回调陷阱</span></span>
<span class="line"><span>├── 09_异步编程.md                # async/await、Promise 机制</span></span>
<span class="line"><span>├── 10_数据结构.md                # struct vs class、Sendable 对象</span></span>
<span class="line"><span>├── 11_与 C++ 交互.md             # NAPI 基础、napi_ref、.so 导入</span></span>
<span class="line"><span>└── 12_性能最佳实践.md            # Hidden Class、类型约束、避免 eval</span></span></code></pre></div><h3 id="模块二-arkui-与声明式-ui-ui-layout" tabindex="-1">模块二：ArkUI 与声明式 UI (UI &amp; Layout) <a class="header-anchor" href="#模块二-arkui-与声明式-ui-ui-layout" aria-label="Permalink to &quot;模块二：ArkUI 与声明式 UI (UI &amp; Layout)&quot;">​</a></h3><p><strong>声明式 UI 开发 + 组件系统 + 布局容器 + 渲染三棵树</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>02_ArkUI/</span></span>
<span class="line"><span>├── 01_声明式 UI 范式.md          # 声明式 vs 命令式、UI 即代码</span></span>
<span class="line"><span>├── 02_常用布局容器.md            # Row/Column/Stack/Flex/Grid/RelativeContainer</span></span>
<span class="line"><span>├── 03_布局约束与单位.md          # vp/fp/px、matchParent/weight/固定</span></span>
<span class="line"><span>├── 04_内置组件.md               # Text/Button/Image/List/Swiper/Scroll 等</span></span>
<span class="line"><span>├── 05_样式与属性.md             # 通用属性/几何属性/容器属性</span></span>
<span class="line"><span>├── 06_自定义组件.md             # @Component + build()、@Builder</span></span>
<span class="line"><span>├── 07_组件参数传递.md           # @Prop/@Link/@BuilderParam</span></span>
<span class="line"><span>├── 08_动画系统.md               # animation/animateTo/transition/motionPath</span></span>
<span class="line"><span>├── 09_断点与多端适配.md         # Breakpoints/媒体查询/栅格布局</span></span>
<span class="line"><span>├── 10_沉浸式状态栏.md           # 系统栏避让/全屏布局/安全区域</span></span>
<span class="line"><span>├── 11_列表渲染.md               # List/LazyForEach/IDataSource</span></span>
<span class="line"><span>├── 12_渲染三棵树原理.md         # ViewTree -&gt; RenderTree -&gt; LayerTree/RSNode</span></span>
<span class="line"><span>├── 13_XComponent 渲染.md        # EGL/OpenGL 高性能渲染</span></span>
<span class="line"><span>└── 14_弹窗与对话框.md           # Dialog/Popup/CustomDialogController</span></span></code></pre></div><h3 id="模块三-状态管理-state-management" tabindex="-1">模块三：状态管理 (State Management) <a class="header-anchor" href="#模块三-状态管理-state-management" aria-label="Permalink to &quot;模块三：状态管理 (State Management)&quot;">​</a></h3><p><strong>ArkUI 状态驱动机制 + 状态管理 V2 + 数据流动</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>03_StateManagement/</span></span>
<span class="line"><span>├── 01_状态驱动机制.md           # 数据变化-&gt;监听-&gt;标记-&gt;刷新流程</span></span>
<span class="line"><span>├── 02_@State 本地状态.md        # 自身管理、脏节点标记、刷新机制</span></span>
<span class="line"><span>├── 03_@Prop 单向数据流.md      # 父子单向拷贝、深拷贝性能问题</span></span>
<span class="line"><span>├── 04_@Link 双向绑定.md         # 父子双向引用、响应式同步</span></span>
<span class="line"><span>├── 05_@Provide @Consume 跨树.md # 跨组件层级通信、爷孙传值</span></span>
<span class="line"><span>├── 06_@ObjectLink 深度绑定.md   # 嵌套对象监听、@Observed 类装饰</span></span>
<span class="line"><span>├── 07_@Watch 状态监听.md        # 状态变化回调、自动化数据请求</span></span>
<span class="line"><span>├── 08_AppStorage 全局单例.md    # 跨 UIAbility 共享、应用级存储</span></span>
<span class="line"><span>├── 09_LocalStorage 页面级存储.md # 页面/Ability 级单例、多窗口隔离</span></span>
<span class="line"><span>├── 10_PersistentStorage 持久化.md# XML/Preferences 持久化、写入磁盘</span></span>
<span class="line"><span>├── 11_状态管理 V2.md            # @Trace/@Local/@Param/@Event、ObservedV2</span></span>
<span class="line"><span>├── 12_单一数据源原则.md         # Source of Truth、引用传递</span></span>
<span class="line"><span>└── 13_复杂状态管理方案.md       # Store/Service 模式、混合方案</span></span></code></pre></div><h3 id="模块四-stage-模型与应用架构-application-model" tabindex="-1">模块四：Stage 模型与应用架构 (Application Model) <a class="header-anchor" href="#模块四-stage-模型与应用架构-application-model" aria-label="Permalink to &quot;模块四：Stage 模型与应用架构 (Application Model)&quot;">​</a></h3><p><strong>UIAbility + ExtensionAbility + Want + 生命周期</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>04_StageModel/</span></span>
<span class="line"><span>├── 01_Application 生命周期.md   # 应用生命周期、ApplicationStage</span></span>
<span class="line"><span>├── 02_UIAbility 概述.md         # UIAbility 概念、作用、与 Android Activity 对比</span></span>
<span class="line"><span>├── 03_UIAbility 生命周期.md     # onCreate/onForeground/onBackground/onDestroy</span></span>
<span class="line"><span>├── 04_UIAbility 启动模式.md     # Singleton/Standard/Specified</span></span>
<span class="line"><span>├── 05_ExtensionAbility.md      # FormExtension/WorkSchedulerExtension/InputMethodExtension</span></span>
<span class="line"><span>├── 06_生命周期管理.md           # AbilityStage/生命周期感知、回调管理</span></span>
<span class="line"><span>├── 07_Want 意图.md             # Want 对象、parameters 传参、显式/隐式 Want</span></span>
<span class="line"><span>├── 08_Context 上下文.md        # ApplicationContext/UIAbilityContext 区别</span></span>
<span class="line"><span>├── 09_页面路由 Navigation.md    # Navigation 组件、路由栈、分栏/动效</span></span>
<span class="line"><span>├── 10_页面路由 Router.md        # 旧版 router API、pushUrl/replaceUrl</span></span>
<span class="line"><span>├── 11_跨 Ability 通信.md        # startAbility/stopAbility、AbilityDelegator</span></span>
<span class="line"><span>├── 12_事件总线与订阅.md         # CommonEvent、发布订阅机制</span></span>
<span class="line"><span>├── 13_深链接 Deep Link.md       # skills/uris 配置、隐式启动</span></span>
<span class="line"><span>├── 14_多窗口支持.md            # 多窗口管理、任务栈</span></span>
<span class="line"><span>└── 15_应用打包发布.md           # HAP/HAR/HSP、签名流程、上架</span></span></code></pre></div><h3 id="模块五-并发模型与网络-concurrency-networking" tabindex="-1">模块五：并发模型与网络 (Concurrency &amp; Networking) <a class="header-anchor" href="#模块五-并发模型与网络-concurrency-networking" aria-label="Permalink to &quot;模块五：并发模型与网络 (Concurrency &amp; Networking)&quot;">​</a></h3><p><strong>Actor 模型 + TaskPool/Worker + 网络通信</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>05_Concurrency/</span></span>
<span class="line"><span>├── 01_线程模型 Actor.md        # 线程隔离、消息传递、无锁机制</span></span>
<span class="line"><span>├── 02_TaskPool 任务池.md        # 短时任务、系统管理、推荐方案</span></span>
<span class="line"><span>├── 03_Worker 长时任务.md       # 手动管理、常驻任务、数量限制</span></span>
<span class="line"><span>├── 04_UI 线程与工作线程.md      # 主线程职责、子线程更新 UI 限制</span></span>
<span class="line"><span>├── 05_http 模块.md             # @kit.NetworkKit/http、createHttp/destroy</span></span>
<span class="line"><span>├── 06_rcp 网络库.md            # Remote Communication Kit、拦截器支持</span></span>
<span class="line"><span>├── 07_并发请求处理.md          # Promise.all/async/await、请求合并</span></span>
<span class="line"><span>├── 08_WebSocket 长连接.md      # webSocket 模块、消息订阅、重连</span></span>
<span class="line"><span>├── 09_大文件传输.md            # request 模块、系统代理传输</span></span>
<span class="line"><span>├── 10_Sendable 对象.md         # ISendable、线程间高效传递</span></span>
<span class="line"><span>├── 11_网络安全与 HTTPS.md      # SSL Pinning、证书校验、安全传输</span></span>
<span class="line"><span>└── 12_socket 通信.md           # TCP/UDP Socket、本地通信</span></span></code></pre></div><h3 id="模块六-数据存储-data-storage" tabindex="-1">模块六：数据存储 (Data Storage) <a class="header-anchor" href="#模块六-数据存储-data-storage" aria-label="Permalink to &quot;模块六：数据存储 (Data Storage)&quot;">​</a></h3><p><strong>Preferences + KV-Store + RDB + 文件 + 分布式数据</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>06_Storage/</span></span>
<span class="line"><span>├── 01_Preferences 首选项.md    # Key-Value 配置、用户偏好设置</span></span>
<span class="line"><span>├── 02_KV-Store 键值数据库.md   # 分布式 KV、数据同步</span></span>
<span class="line"><span>├── 03_RDB 关系型数据库.md      # SQLite、RdbStore、事务、迁移</span></span>
<span class="line"><span>├── 04_文件存储.md              # fs 模块、沙箱目录、rawfile vs resource</span></span>
<span class="line"><span>├── 05_相册与媒体库.md          # PhotoViewPicker、URI 访问、多媒体</span></span>
<span class="line"><span>├── 06_数据加密.md              # RDB 加密、CryptoArchitectureKit</span></span>
<span class="line"><span>├── 07_分布式数据.md            # 跨设备数据同步、分布式软总线</span></span>
<span class="line"><span>└── 08_缓存策略.md              # 内存缓存、磁盘缓存、LruCache</span></span></code></pre></div><h3 id="模块七-分布式开发-distributed-development" tabindex="-1">模块七：分布式开发 (Distributed Development) <a class="header-anchor" href="#模块七-分布式开发-distributed-development" aria-label="Permalink to &quot;模块七：分布式开发 (Distributed Development)&quot;">​</a></h3><p><strong>鸿蒙核心特色 + 分布式软总线 + 跨设备协同</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>07_Distributed/</span></span>
<span class="line"><span>├── 01_分布式软总线.md          # 设备发现、连接建立、统一通信管道</span></span>
<span class="line"><span>├── 02_设备发现与连接.md        # deviceManager API、订阅/连接/断开</span></span>
<span class="line"><span>├── 03_分布式数据对象.md        # 内存对象跨设备同步</span></span>
<span class="line"><span>├── 04_分布式任务调度.md        # 跨设备任务分发、远程调用</span></span>
<span class="line"><span>├── 05_分布式 UI 迁移.md        # 应用跨设备迁移、连续性体验</span></span>
<span class="line"><span>├── 06_分布式相机.md            # 远程拍照、设备能力共享</span></span>
<span class="line"><span>├── 07_分布式地图.md            # 跨设备地图协同</span></span>
<span class="line"><span>├── 08_分布式音频.md            # 音频跨设备播放、设备切换</span></span>
<span class="line"><span>└── 09_原子化服务.md            # 免安装、即点即用、元服务</span></span></code></pre></div><h3 id="模块八-权限与安全-permissions-security" tabindex="-1">模块八：权限与安全 (Permissions &amp; Security) <a class="header-anchor" href="#模块八-权限与安全-permissions-security" aria-label="Permalink to &quot;模块八：权限与安全 (Permissions &amp; Security)&quot;">​</a></h3><p><strong>TokenID 访问控制 + 运行时权限 + 应用安全</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>08_Permissions/</span></span>
<span class="line"><span>├── 01_权限模型概述.md          # TokenID/ATM 访问控制、权限等级</span></span>
<span class="line"><span>├── 02_权限分类.md              # system_basic/system_core/normal</span></span>
<span class="line"><span>├── 03_权限声明流程.md          # module.json5 声明、reqPermissions</span></span>
<span class="line"><span>├── 04_运行时权限申请.md        # checkAccessToken/requestPermissionsFromUser</span></span>
<span class="line"><span>├── 05_常见权限.md              # 相机/位置/麦克风/存储/蓝牙/WLAN</span></span>
<span class="line"><span>├── 06_应用沙箱.md              # 沙箱目录、文件隔离、URI 安全</span></span>
<span class="line"><span>├── 07_安全存储.md              # Asset Store、Token/密码安全存储</span></span>
<span class="line"><span>├── 08_签名与证书.md            # .p12/.csr/.cer/.p7b 证书流程</span></span>
<span class="line"><span>└── 09_安全加固.md              # 代码混淆/反调试/安全检测</span></span></code></pre></div><h3 id="模块九-性能优化-performance-optimization" tabindex="-1">模块九：性能优化 (Performance Optimization) <a class="header-anchor" href="#模块九-性能优化-performance-optimization" aria-label="Permalink to &quot;模块九：性能优化 (Performance Optimization)&quot;">​</a></h3><p><strong>启动/渲染/内存/网络/包体积优化</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>09_Performance/</span></span>
<span class="line"><span>├── 01_启动优化.md              # 冷启动/Ability onCreate/首屏 build 优化</span></span>
<span class="line"><span>├── 02_渲染性能优化.md          # 渲染三棵树/减少 Layout/图片下采样</span></span>
<span class="line"><span>├── 03_内存优化.md              # 内存泄漏检测/Heap Snapshot/GC 原理</span></span>
<span class="line"><span>├── 04_列表性能优化.md          # LazyForEach/固定宽高/组件复用</span></span>
<span class="line"><span>├── 05_网络优化.md              # 连接复用/请求合并/数据压缩</span></span>
<span class="line"><span>├── 06_包体积优化.md            # HSP/代码压缩/图片压缩/动态导入</span></span>
<span class="line"><span>├── 07_动画性能.md              # 硬件加速/动效中断/弹簧模型</span></span>
<span class="line"><span>├── 08_电池优化.md              # 后台任务管理/唤醒锁/定位优化</span></span>
<span class="line"><span>├── 09_卡顿检测与优化.md        # SmartPerf/FPS 分析/主线程检查</span></span>
<span class="line"><span>└── 10_Profiler 工具.md         # DevEco Studio Profiler、性能分析</span></span></code></pre></div><h3 id="模块十-工程化与构建-engineering-build" tabindex="-1">模块十：工程化与构建 (Engineering &amp; Build) <a class="header-anchor" href="#模块十-工程化与构建-engineering-build" aria-label="Permalink to &quot;模块十：工程化与构建 (Engineering &amp; Build)&quot;">​</a></h3><p><strong>Hvigor + 多端构建 + 测试 + 代码规范</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>10_Engineering/</span></span>
<span class="line"><span>├── 01_Hvigor 构建系统.md       # 鸿蒙构建工具、TS 脚本、构建流程</span></span>
<span class="line"><span>├── 02_项目结构.md              # entry/pages/resources/common 目录</span></span>
<span class="line"><span>├── 03_HAR HSP HAP 包.md       # 静态共享/动态共享/应用包的区别与选型</span></span>
<span class="line"><span>├── 04_模块化架构.md            # 模块划分、依赖管理、分包策略</span></span>
<span class="line"><span>├── 05_多环境配置.md            # Dev/Prod/Release product defines</span></span>
<span class="line"><span>├── 06_代码混淆.md              # build-profile.json5、ProGuard 配置</span></span>
<span class="line"><span>├── 07_多端构建与适配.md        # 断点/栅格/限定词/多设备输出</span></span>
<span class="line"><span>├── 08_国际化.md               # 多语言资源、zh_CN/en_US 配置</span></span>
<span class="line"><span>├── 09_测试框架 Hypium.md      # 单元测试、Mock、测试用例编写</span></span>
<span class="line"><span>├── 10_自动化构建 CI.md        # DevEco CI、持续集成流程</span></span>
<span class="line"><span>├── 11_源码保护.md             # ByteCodeHAR、字节码编译</span></span>
<span class="line"><span>└── 12_上架与发布.md           # AppGallery 上架、审核规范</span></span></code></pre></div><h3 id="模块十一-系统能力与底层-system-underlying" tabindex="-1">模块十一：系统能力与底层 (System &amp; Underlying) <a class="header-anchor" href="#模块十一-系统能力与底层-system-underlying" aria-label="Permalink to &quot;模块十一：系统能力与底层 (System &amp; Underlying)&quot;">​</a></h3><p><strong>HongMeng Kernel + 安全模型 + 系统服务</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>11_System/</span></span>
<span class="line"><span>├── 01_鸿蒙内核.md              # HongMeng Kernel、微内核架构</span></span>
<span class="line"><span>├── 02_系统启动流程.md          # Bootloader→Kernel→Init→Zygote→SystemServer</span></span>
<span class="line"><span>├── 03_进程与线程管理.md        # 进程模型、线程调度、OOM Killer</span></span>
<span class="line"><span>├── 04_安全模型.md              # TokenID/ATM、沙箱机制、SELinux</span></span>
<span class="line"><span>├── 05_系统服务.md              # 系统服务架构、系统能力调用</span></span>
<span class="line"><span>├── 06_通知系统.md              # Notification、通知渠道、消息推送</span></span>
<span class="line"><span>├── 07_广播与事件.md            # CommonEvent、系统广播</span></span>
<span class="line"><span>├── 08_NAPI 扩展开发.md         # C++ 接口暴露、NAPI 编程指南</span></span>
<span class="line"><span>├── 09_底层渲染机制.md          # RenderService、FrameNode/RenderNode</span></span>
<span class="line"><span>└── 10_新特性探索.md            # 鸿蒙 6.0/HDS、星闪、AI 能力</span></span></code></pre></div><h3 id="模块十二-新特性与前沿-new-features" tabindex="-1">模块十二：新特性与前沿 (New Features) <a class="header-anchor" href="#模块十二-新特性与前沿-new-features" aria-label="Permalink to &quot;模块十二：新特性与前沿 (New Features)&quot;">​</a></h3><p><strong>Compose + KMP + 鸿蒙最新技术方向</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>12_NewFeatures/</span></span>
<span class="line"><span>├── 01_状态管理 V2 深度.md       # ObservedV2/@Trace/Signal/Proxy 原理</span></span>
<span class="line"><span>├── 02_原子化服务进阶.md        # 元服务架构、免安装、分发</span></span>
<span class="line"><span>├── 03_鸿蒙 AI 能力.md          # 端侧 AI、模型集成、AI 组件</span></span>
<span class="line"><span>├── 04_鸿蒙 6.0 新特性.md      # API 23+、新能力、新组件</span></span>
<span class="line"><span>├── 05_折叠屏/平板适配.md       # 折叠屏布局、自适应 UI</span></span>
<span class="line"><span>├── 06_车载鸿蒙.md              # HarmonyOS for Automotive、车机开发</span></span>
<span class="line"><span>├── 07_智能家居生态.md          # IoT 设备接入、分布式场景</span></span>
<span class="line"><span>└── 08_鸿蒙生态展望.md          # 鸿蒙生态发展、开发者机会</span></span></code></pre></div><hr><h2 id="🎓-学习路径建议" tabindex="-1">🎓 学习路径建议 <a class="header-anchor" href="#🎓-学习路径建议" aria-label="Permalink to &quot;🎓 学习路径建议&quot;">​</a></h2><h3 id="初学者-0-6-个月入门" tabindex="-1">初学者（0-6 个月入门） <a class="header-anchor" href="#初学者-0-6-个月入门" aria-label="Permalink to &quot;初学者（0-6 个月入门）&quot;">​</a></h3><ol><li><strong>模块一</strong>：ArkTS 语言基础 ⭐⭐⭐（类型系统、装饰器、空安全）</li><li><strong>模块二</strong>：ArkUI 与布局 ⭐⭐⭐（常用组件、布局容器、自定义组件）</li><li><strong>模块三</strong>：状态管理 ⭐⭐⭐（@State/@Prop/@Link、状态驱动机制）</li><li><strong>模块四</strong>：Stage 模型基础 ⭐⭐（UIAbility 生命周期、页面路由）</li><li><strong>模块六</strong>：数据存储 ⭐⭐（Preferences、RDB）</li></ol><h3 id="中级开发者-6-18-个月进阶" tabindex="-1">中级开发者（6-18 个月进阶） <a class="header-anchor" href="#中级开发者-6-18-个月进阶" aria-label="Permalink to &quot;中级开发者（6-18 个月进阶）&quot;">​</a></h3><ol><li><strong>模块五</strong>：并发与网络 ⭐⭐⭐（Actor 模型、TaskPool、http/rcp）</li><li><strong>模块七</strong>：分布式开发 ⭐⭐⭐（软总线、跨设备协同、原子化服务）</li><li><strong>模块九</strong>：性能优化 ⭐⭐⭐（启动/渲染/内存/列表优化）</li><li><strong>模块八</strong>：权限与安全 ⭐⭐（权限模型、签名流程）</li><li><strong>模块十</strong>：工程化 ⭐⭐（Hvigor、模块化、多端构建）</li><li><strong>模块三进阶</strong>：状态管理 V2 ⭐⭐（@Trace/@Local、高级方案）</li></ol><h3 id="高级-架构师-18-个月" tabindex="-1">高级/架构师（18 个月+） <a class="header-anchor" href="#高级-架构师-18-个月" aria-label="Permalink to &quot;高级/架构师（18 个月+）&quot;">​</a></h3><ol><li><strong>模块十一</strong>：系统与底层 ⭐⭐⭐（内核、安全模型、NAPI）</li><li><strong>模块十二</strong>：前沿特性 ⭐⭐⭐（AI 能力、鸿蒙 6.0、车载生态）</li><li><strong>模块七深度</strong>：分布式架构 ⭐⭐⭐（跨设备任务调度、分布式 UI）</li><li><strong>模块九深度</strong>：性能工程 ⭐⭐⭐（全链路性能优化、性能建模）</li><li><strong>模块四深度</strong>：应用架构设计 ⭐⭐⭐（多 Ability 架构、复杂路由）</li><li><strong>模块十深度</strong>：大规模工程化 ⭐⭐⭐（多端自动化、CI/CD 流水线）</li></ol><hr><h2 id="📝-模块划分说明" tabindex="-1">📝 模块划分说明 <a class="header-anchor" href="#📝-模块划分说明" aria-label="Permalink to &quot;📝 模块划分说明&quot;">​</a></h2><h3 id="与-android-知识体系对照" tabindex="-1">与 Android 知识体系对照 <a class="header-anchor" href="#与-android-知识体系对照" aria-label="Permalink to &quot;与 Android 知识体系对照&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Android 模块</th><th>鸿蒙对应模块</th><th>说明</th></tr></thead><tbody><tr><td>01_Foundation（四大组件）</td><td>04_StageModel</td><td>UIAbility/ExtensionAbility 类比四大组件</td></tr><tr><td>02_UI</td><td>02_ArkUI</td><td>ArkUI 是鸿蒙的声明式 UI 框架（替代 XML 布局）</td></tr><tr><td>03_Kotlin</td><td>01_Language</td><td>ArkTS 对应 Kotlin，语言层面学习</td></tr><tr><td>04_Async</td><td>05_Concurrency</td><td>Actor 模型是鸿蒙的核心并发模型</td></tr><tr><td>05_Storage</td><td>06_Storage</td><td>Preferences/KV-Store/RDB 对应 SharedPreferences/Room</td></tr><tr><td>06_Network</td><td>05_Concurrency</td><td>http/rcp 模块对应 Retrofit/OkHttp</td></tr><tr><td>07_Architecture</td><td>04_StageModel</td><td>Stage 模型本身就是应用架构</td></tr><tr><td>08_DI</td><td>(融合)</td><td>鸿蒙无统一 DI 框架，依赖模块系统</td></tr><tr><td>09_Jetpack</td><td>04_StageModel + 02_ArkUI</td><td>ArkUI + Stage 即鸿蒙的&quot;Jetpack&quot;</td></tr><tr><td>12_Performance</td><td>09_Performance</td><td>全链路性能优化</td></tr><tr><td>14_System</td><td>11_System</td><td>HongMeng Kernel + 系统服务</td></tr><tr><td>15_Engineering</td><td>10_Engineering</td><td>Hvigor + 模块化 + 测试</td></tr><tr><td>16_NewFeatures</td><td>12_NewFeatures</td><td>ArkUI V2/原子服务/AI</td></tr><tr><td>-</td><td><strong>07_Distributed</strong></td><td>⭐ 鸿蒙独有：分布式软总线与跨设备</td></tr><tr><td>-</td><td><strong>08_Permissions</strong></td><td>⭐ 独立安全模块：权限/证书/加密</td></tr></tbody></table><h3 id="为什么这样划分" tabindex="-1">为什么这样划分？ <a class="header-anchor" href="#为什么这样划分" aria-label="Permalink to &quot;为什么这样划分？&quot;">​</a></h3><ol><li><strong>ArkTS 独立为基础模块</strong> — ArkTS 是鸿蒙开发的第一课，与 Kotlin 同等重要</li><li><strong>ArkUI 作为核心模块</strong> — 声明式 UI + 渲染三棵树是鸿蒙最特色的部分</li><li><strong>状态管理独立模块</strong> — 状态管理是鸿蒙面试最高频考点，分 V1/V2 两层</li><li><strong>Stage 模型整合架构</strong> — UIAbility/ExtensionAbility/Want/路由 统一放在这里</li><li><strong>分布式开发单设模块</strong> — 这是鸿蒙区别于 Android 的最大亮点</li><li><strong>权限安全独立模块</strong> — TokenID/ATM 模型与 Android 完全不同，需单独讲解</li></ol><hr><h2 id="📋-面试高频考点速查" tabindex="-1">📋 面试高频考点速查 <a class="header-anchor" href="#📋-面试高频考点速查" aria-label="Permalink to &quot;📋 面试高频考点速查&quot;">​</a></h2><h3 id="必考-⭐⭐⭐⭐⭐" tabindex="-1">必考（⭐⭐⭐⭐⭐） <a class="header-anchor" href="#必考-⭐⭐⭐⭐⭐" aria-label="Permalink to &quot;必考（⭐⭐⭐⭐⭐）&quot;">​</a></h3><ul><li>[ ] @State/@Prop/@Link 的区别</li><li>[ ] 渲染三棵树原理</li><li>[ ] UIAbility 生命周期</li><li>[ ] Actor 线程模型</li><li>[ ] LazyForEach 原理与限制</li><li>[ ] HAP/HAR/HSP 区别</li><li>[ ] 状态管理 V2 (@Trace/@Local)</li></ul><h3 id="高频-⭐⭐⭐⭐" tabindex="-1">高频（⭐⭐⭐⭐） <a class="header-anchor" href="#高频-⭐⭐⭐⭐" aria-label="Permalink to &quot;高频（⭐⭐⭐⭐）&quot;">​</a></h3><ul><li>[ ] @Builder/@BuilderParam/@Styles/@Extend 区别</li><li>[ ] 分布式软总线原理</li><li>[ ] AppStorage vs LocalStorage</li><li>[ ] relativeContainer 解决的问题</li><li>[ ] TaskPool vs Worker</li><li>[ ] Want 意图传参方式</li><li>[ ] 启动优化策略</li></ul><h3 id="中频-⭐⭐⭐" tabindex="-1">中频（⭐⭐⭐） <a class="header-anchor" href="#中频-⭐⭐⭐" aria-label="Permalink to &quot;中频（⭐⭐⭐）&quot;">​</a></h3><ul><li>[ ] 断点与多端适配</li><li>[ ] 权限申请流程</li><li>[ ] NAPI 交互原理</li><li>[ ] 深链接配置</li><li>[ ] 原子化服务</li><li>[ ] Hvigor 构建系统</li></ul><hr><h2 id="📅-最后更新" tabindex="-1">📅 最后更新 <a class="header-anchor" href="#📅-最后更新" aria-label="Permalink to &quot;📅 最后更新&quot;">​</a></h2><p>2026-04-21</p><hr><p><strong>📚 推荐资源</strong></p><ul><li><a href="https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/de" target="_blank" rel="noreferrer">HarmonyOS 官方文档</a></li><li><a href="https://developer.harmonyos.com/cn/develop/deveco-studio" target="_blank" rel="noreferrer">DevEco Studio</a></li><li><a href="https://harmonyosdev.csdn.net" target="_blank" rel="noreferrer">鸿蒙开发者社区</a></li><li><a href="https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/arkts-api-0000001757151294" target="_blank" rel="noreferrer">ArkTS API 参考</a></li><li><a href="https://openharmony.cn" target="_blank" rel="noreferrer">OpenHarmony 社区</a></li><li><a href="https://developer.harmonyos.com/cn/develop/codelabs" target="_blank" rel="noreferrer">鸿蒙 Codelabs</a></li><li><a href="https://harmonyos-next.github.io/interview-handbook-project/guide/index.html" target="_blank" rel="noreferrer">鸿蒙面试知识库</a></li></ul>`,68)])])}const g=n(p,[["render",i]]);export{h as __pageData,g as default};
