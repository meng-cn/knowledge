import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const r=JSON.parse('{"title":"03 - 系统原理","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/10_System_Principles/03_System_Deep.md","filePath":"01-ios/10_System_Principles/03_System_Deep.md"}'),l={name:"01-ios/10_System_Principles/03_System_Deep.md"};function h(e,s,k,t,A,D){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="_03-系统原理" tabindex="-1">03 - 系统原理 <a class="header-anchor" href="#_03-系统原理" aria-label="Permalink to &quot;03 - 系统原理&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-启动原理dyld-加载流程">启动原理：dyld 加载流程</a></li><li><a href="#2-mach-o-文件格式深度分析">Mach-O 文件格式深度分析</a></li><li><a href="#3-动态链接机制">动态链接机制</a></li><li><a href="#4-进程管理与调度">进程管理与调度</a></li><li><a href="#5-安全机制代码签名与沙盒">安全机制：代码签名与沙盒</a></li><li><a href="#6-越狱检测">越狱检测</a></li><li><a href="#7-面试题汇总">面试题汇总</a></li></ol><hr><h2 id="_1-启动原理-dyld-加载流程" tabindex="-1">1. 启动原理：dyld 加载流程 <a class="header-anchor" href="#_1-启动原理-dyld-加载流程" aria-label="Permalink to &quot;1. 启动原理：dyld 加载流程&quot;">​</a></h2><h3 id="_1-1-ios-应用启动全链路-源码级" tabindex="-1">1.1 iOS 应用启动全链路（源码级） <a class="header-anchor" href="#_1-1-ios-应用启动全链路-源码级" aria-label="Permalink to &quot;1.1 iOS 应用启动全链路（源码级）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 应用启动流程（完整链路）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  第 1 阶段：内核加载（Kernel Phase）                                  │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────────────────      │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  1. 用户点击 App 图标                                               │</span></span>
<span class="line"><span>│  ↓                                                                   │</span></span>
<span class="line"><span>│  2. 内核启动新进程（fork + exec）                                    │</span></span>
<span class="line"><span>│  ↓                                                                   │</span></span>
<span class="line"><span>│  3. 加载 Mach-O 可执行文件到内存                                      │</span></span>
<span class="line"><span>│  ↓                                                                   │</span></span>
<span class="line"><span>│  4. 初始化 Mach-O 段（__TEXT/__DATA/__LINKEDIT）                     │</span></span>
<span class="line"><span>│  ↓                                                                   │</span></span>
<span class="line"><span>│  5. 设置进程内存布局                                                  │</span></span>
<span class="line"><span>│  ↓                                                                   │</span></span>
<span class="line"><span>│  6. 跳转到 dyld（动态链接器）                                        │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────────────────      │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  第 2 阶段：dyld 加载（Dynamic Linker Phase）                        │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────────────────      │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  7. dyld 加载主可执行文件                                             │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │  dyld 加载流程：                                               │</span></span>
<span class="line"><span>│  │  ├─ 解析依赖（依赖 framework）                                │</span></span>
<span class="line"><span>│  │  ├─ 加载依赖（按依赖图顺序）                                  │</span></span>
<span class="line"><span>│  │  ├─ 符号绑定（动态链接）                                      │</span></span>
<span class="line"><span>│  │  ├─ 初始化（调用 +load 方法）                                │</span></span>
<span class="line"><span>│  │  └─ 准备入口点                                                │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  8. dyld 调用 _objc_init                                             │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │  _objc_init 工作：                                              │</span></span>
<span class="line"><span>│  │  ├─ 初始化 Class Hash Table（类缓存表）                        │</span></span>
<span class="line"><span>│  │  ├─ 初始化 Method Caches（方法缓存）                           │</span></span>
<span class="line"><span>│  │  ├─ 初始化 Protocol Table（协议表）                            │</span></span>
<span class="line"><span>│  │  ├─ 初始化 Weak Reference Table（弱引用表）                    │</span></span>
<span class="line"><span>│  │  └─ 初始化 Associate Objects（关联对象）                       │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  9. dyld 调用 _objc_loadImages                                         │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │  _objc_loadImages 工作：                                         │</span></span>
<span class="line"><span>│  │  ├─ 读取 MH_OBJECT 段的 __objc_classlist 段                    │</span></span>
<span class="line"><span>│  │  ├─ 为每个类创建 Class 结构体                                   │</span></span>
<span class="line"><span>│  │  ├─ 解析 Class 的 Ivar/Method/Protocol                         │</span></span>
<span class="line"><span>│  │  ├─ 创建 metaclass                                              │</span></span>
<span class="line"><span>│  │  ├─ 调用所有 +load 方法（类 → 分类 → 协议）                    │</span></span>
<span class="line"><span>│  │  └─ 注册类到 class hash table                                    │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  10. dyld 调用 main()                                                │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │  main() 函数（UIApplicationMain）：                            │</span></span>
<span class="line"><span>│  │  ├─ 初始化 UIApplication                                       │</span></span>
<span class="line"><span>│  │  ├─ 加载 Info.plist                                             │</span></span>
<span class="line"><span>│  │  ├─ 创建 AppDelegate（初始化）                                   │</span></span>
<span class="line"><span>│  │  └─ 启动 RunLoop（无限循环）                                     │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  11. RunLoop 开始运行                                                 │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │  RunLoop 循环：                                                  │</span></span>
<span class="line"><span>│  │  • 等待事件（UI 事件、定时器、网络回调）                        │</span></span>
<span class="line"><span>│  │  • 处理事件                                                      │</span></span>
<span class="line"><span>│  │  • 回到等待                                                      │</span></span>
<span class="line"><span>│  │  • （永远不会退出）                                             │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>启动时序图：</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Time 0ms    →    内核加载 Mach-O 文件                              │</span></span>
<span class="line"><span>│  Time 1ms    →    dyld 开始加载                                      │</span></span>
<span class="line"><span>│  Time 5ms    →    依赖 framework 加载                                │</span></span>
<span class="line"><span>│  Time 10ms   →    符号绑定完成                                       │</span></span>
<span class="line"><span>│  Time 15ms   →    +load 方法调用完成                                │</span></span>
<span class="line"><span>│  Time 20ms   →    _objc_init 完成                                   │</span></span>
<span class="line"><span>│  Time 25ms   →    main() 执行                                       │</span></span>
<span class="line"><span>│  Time 30ms   →    UIApplicationMain 创建                            │</span></span>
<span class="line"><span>│  Time 35ms   →    RunLoop 启动                                      │</span></span>
<span class="line"><span>│  Time 40ms   →    应用可用                                            │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  冷启动总时间：&lt; 100ms（理想情况）                                    │</span></span>
<span class="line"><span>│  冷启动总时间：200-500ms（典型应用）                                 │</span></span>
<span class="line"><span>│  冷启动总时间：&gt; 1s（启动慢的应用）                                 │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>启动优化策略：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 优化手段                  │ 效果           │ 复杂度   │</span></span>
<span class="line"><span>├────────────────────────────────────┼─────────────┼───────┤</span></span>
<span class="line"><span>│ 延迟加载                    │ 减少 30-50%  │ ⭐        │</span></span>
<span class="line"><span>│ 懒加载资源                  │ 减少 20-40%  │ ⭐       │</span></span>
<span class="line"><span>│ 优化 +load 方法              │ 减少 10-20%  │ ⭐⭐     │</span></span>
<span class="line"><span>│ 预链接（Pre-linking）        │ 减少 10-15%  │ ⭐       │</span></span>
<span class="line"><span>│ 减少 Framework 数量          │ 减少 5-10%   │ ⭐⭐     │</span></span>
<span class="line"><span>│ 符号剥离（Dead Code Strip）  │ 减少包体积    │ ⭐       │</span></span>
<span class="line"><span>│ 使用 Bitcode                 │ 构建优化      │ ⭐⭐⭐    │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_1-2-dyld-动态链接器详解" tabindex="-1">1.2 dyld 动态链接器详解 <a class="header-anchor" href="#_1-2-dyld-动态链接器详解" aria-label="Permalink to &quot;1.2 dyld 动态链接器详解&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">dyld（Dynamic Link Editor）详解：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">核心职责：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 加载 Mach-O 可执行文件和 framework</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 解析动态符号（动态链接）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 调用初始化函数（_init 段）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 调用 +load 方法</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 创建 RunLoop</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 调用 main()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">dyld 加载流程：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1. 加载主可执行文件                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 读取 Mach-O 头部                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 验证签名                                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 映射到内存                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  2. 解析依赖（依赖图）                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 读取 __LINKEDIT 段的依赖列表                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 按依赖图顺序递归加载（BFS 广度优先）                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 系统 framework 优先（/System/Library/Frameworks）         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 第三方 framework 后加载（@rpath/@loader_path）              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  3. 符号绑定（Dynamic Binding）                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 读取 __LINKEDIT 段的符号表                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 解析每个 symbol 的地址                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 更新 GOT（Global Offset Table）                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 更新 PLT（Procedure Linkage Table）                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  4. 初始化（Initialization）                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 调用 _init 段中的初始化函数                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 调用 ObjC 的 +load 方法（按加载顺序）                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 调用 C++ 的静态构造函数                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  5. 准备入口点                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 设置 main() 作为入口                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 启动 RunLoop                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ Mach-O 加载方式：                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • MH_EXECUTE（可执行文件）                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • MH_DYLIB（动态库）                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • MH_DYLIB_STUB（动态库存根）                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • MH_BUNDLE（插件）                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ @rpath / @loader_path / @executable_path 的区别：                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • @executable_path：可执行文件所在路径                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • @loader_path：加载当前库的模块所在路径                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • @rpath：运行时搜索路径（LD_RUNPATH_SEARCH_PATHS）             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">符号绑定流程：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  未解析符号（undefined symbol）：                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 链接时解析（静态链接）                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 运行时解析（动态链接）                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  GOT（Global Offset Table）：                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 存储动态链接符号的实际地址                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 首次访问时填充                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 后续访问直接读取                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  PLT（Procedure Linkage Table）：                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 函数调用入口                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 首次调用时触发 dyld 解析                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 解析后直接跳转到函数地址                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  性能影响：                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • GOT/PLT 增加二进制文件体积                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 首次访问有延迟（符号解析）                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 减少动态依赖可以减少启动时间                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_2-mach-o-文件格式深度分析" tabindex="-1">2. Mach-O 文件格式深度分析 <a class="header-anchor" href="#_2-mach-o-文件格式深度分析" aria-label="Permalink to &quot;2. Mach-O 文件格式深度分析&quot;">​</a></h2><h3 id="_2-1-mach-o-文件结构" tabindex="-1">2.1 Mach-O 文件结构 <a class="header-anchor" href="#_2-1-mach-o-文件结构" aria-label="Permalink to &quot;2.1 Mach-O 文件结构&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Mach-O（Mach Object）文件结构：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Mach-O 头部（Mach-O Header）                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  magic（魔数）                                          │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  cputype（CPU 类型）                                   │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  cpusubtype（CPU 子类型）                              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  filetype（文件类型）                                   │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ncmds（命令数量）                                     │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  sizeofcmds（命令总大小）                               │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  flags（标志位）                                       │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  reserved（保留字段）                                   │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Load Commands（加载命令）                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  LC_SEGMENT_64：内存段定义                              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  LC_LOAD_DYLIB：加载动态库                              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  LC_MAIN：入口点                                        │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  LC_FUNCTION_STARTS：函数起始地址                       │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  LC_CODE_SIGNATURE：代码签名                            │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  LC_ENCRYPTION_INFO：加密信息                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Segments（内存段）                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __PAGEZERO（页零段，空段，防止空指针访问）             │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __TEXT（代码段）                                      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __text（代码）                                    │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __const（常量）                                   │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __cstring（字符串常量）                            │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_methname（方法名）                         │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_methtype（方法类型）                        │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_classname（类名）                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_selrefs（选择器引用）                      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_protorefs（协议引用）                      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ __objc_classrefs（类引用）                        │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                       │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __DATA（数据段）                                     │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __got（全局偏移表）                               │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __nl_symbol_ptr（名称链接符号指针）              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __la_symbol_ptr（延迟符号指针）                   │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_classlist（类列表）                        │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_catlist（分类列表）                        │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_protolist（协议列表）                      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_const（常量）                              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_ivar（实例变量）                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ __objc_data（数据）                              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ __bss（未初始化数据）                            │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                       │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __LINKEDIT（链接编辑段）                              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ 符号表                                             │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ 依赖列表                                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ 代码签名                                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  关键理解：                                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • Mach-O 是 iOS/macOS 的可执行文件格式                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 类似 ELF（Linux）或 PE（Windows）                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 包含代码、数据、符号表、动态依赖等所有信息                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 通过 otool / nm / size 等工具可以查看 Mach-O 文件            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Mach-O 工具命令：                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • otool -fv Mach-O 查看依赖                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • otool -L Mach-O 查看动态链接                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • nm Mach-O 查看符号                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • size Mach-O 查看大小                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • dwarfdump Mach-O 查看 DWARF 调试信息                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • lipo -info Mach-O 查看架构                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_2-2-mach-o-架构与-fat-binary" tabindex="-1">2.2 Mach-O 架构与 Fat Binary <a class="header-anchor" href="#_2-2-mach-o-架构与-fat-binary" aria-label="Permalink to &quot;2.2 Mach-O 架构与 Fat Binary&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Fat Binary（胖二进制）结构：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Fat Binary（通用二进制）                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Fat Header                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ magic（Fat Magic Number）                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ nfat（架构数量）                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Fat Archive（架构列表）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  CPU 1（ARM64）                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ offset（偏移）                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ size（大小）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ align（对齐）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ Mach-O 二进制                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  CPU 2（ARM64e）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ offset（偏移）                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ size（大小）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ align（对齐）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ Mach-O 二进制                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  CPU 3（x86_64）（模拟器）                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ offset（偏移）                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ size（大小）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ align（对齐）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ Mach-O 二进制                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  特点：                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 一个 Fat Binary 包含多个架构的 Mach-O 文件        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • iOS 发布时拆分为单架构（strip 去除未用的架构）     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • Xcode Archive 时生成 Fat Binary                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • lipo 工具可以操作 Fat Binary                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 模拟器用 x86_64，真机用 arm64/arm64e              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  架构类型：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • ARM64（iPhone 5s 及以后）                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • ARM64e（iPhone XS 及以后，含 RNDKey）             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • x86_64（模拟器）                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • armv7（旧设备，已废弃）                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • armv7s（iPhone 5，已废弃）                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  代码签名与 Fat Binary：                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 每个架构都需要独立的代码签名                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • __LINKEDIT 段中包含签名数据                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 签名验证在进程启动时进行                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_3-动态链接机制" tabindex="-1">3. 动态链接机制 <a class="header-anchor" href="#_3-动态链接机制" aria-label="Permalink to &quot;3. 动态链接机制&quot;">​</a></h2><h3 id="_3-1-动态链接原理" tabindex="-1">3.1 动态链接原理 <a class="header-anchor" href="#_3-1-动态链接原理" aria-label="Permalink to &quot;3.1 动态链接原理&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">动态链接机制（Dynamic Linking）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  动态链接流程：                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  1. 程序启动，dyld 加载依赖 framework                     │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                                    │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  2. 遍历 __LINKEDIT 段的依赖列表                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                                    │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  3. 对每个依赖 framework：                               │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 查找路径（@rpath/@loader_path/@executable_path）    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 加载到进程内存                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 解析符号                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 更新全局符号表                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                                    │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4. 符号绑定（Symbol Binding）：                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 读取 GOT/PLT                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 解析未解析的符号                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     • 填充 GOT（首次访问时）                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                                    │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  5. 调用 _init 段中的初始化函数                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  6. 调用 ObjC 的 +load 方法                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  7. 进入 main()                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  链接方式对比：                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────┬──────────────────┬────────────────┬─────────┐  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 链接方式   │ 优点              │ 缺点              │ 适用场景  │  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├──────────┼──────────────────┼────────────────┼─────────┤  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 静态链接   │ 无运行时开销      │ 包体积大           │ 内库  │  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 动态链接   │ 共享库、减小体积  │ 首次加载慢        │ 系统库 │  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 延迟绑定   │ 按需加载          │ 首次访问有延迟    │ 默认   │  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────┴──────────────────┴────────────────┴─────────┘  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  性能优化：                                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 减少动态依赖数量                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 使用 -dead_strip 剥离无用代码                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 使用 Bitcode 优化                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 使用 LTO（Link Time Optimization）                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_3-2-符号查找与绑定" tabindex="-1">3.2 符号查找与绑定 <a class="header-anchor" href="#_3-2-符号查找与绑定" aria-label="Permalink to &quot;3.2 符号查找与绑定&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">符号查找与绑定（Symbol Lookup &amp; Binding）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  符号查找顺序：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  1. 全局符号表（dyld 维护）                     │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  2. 依赖 framework 的符号表                     │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  3. 系统框架的符号表                            │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4. 未解析符号 → 动态解析（runtime）           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  符号类型：                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ UND（未定义）— 需要动态链接                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ ABS（绝对地址）— 链接时已知                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ SECT（段内地址）— 链接时已知                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─_PBOTH（预绑定）— 预绑定符号                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ W_LSYM（局部符号）— 链接器内部使用                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  符号绑定机制：                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ GOT（Global Offset Table）：存储动态链接符号的地址      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ PLT（Procedure Linkage Table）：函数调用入口            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ GOT 首次访问时触发 dyld 解析                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ PLT 跳转到 GOT，GOT 中存储实际地址                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  性能影响：                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 符号解析在运行时进行，有延迟                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 减少动态依赖可以减少符号解析时间                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 使用 bitcode 可以在 App Store 优化符号                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_4-进程管理与调度" tabindex="-1">4. 进程管理与调度 <a class="header-anchor" href="#_4-进程管理与调度" aria-label="Permalink to &quot;4. 进程管理与调度&quot;">​</a></h2><h3 id="_4-1-ios-进程模型" tabindex="-1">4.1 iOS 进程模型 <a class="header-anchor" href="#_4-1-ios-进程模型" aria-label="Permalink to &quot;4.1 iOS 进程模型&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">iOS 进程模型：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  进程状态机：                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  New → Running → Waiting → Terminated       │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │    │         ↓             ↑                 │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │    └───── Suspended ←────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Running → 进程正在 CPU 执行                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Waiting → 进程等待资源（I/O、网络等）                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Suspended → 进程挂起（内存管理）                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Terminated → 进程终止                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  New → 进程刚创建                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  iOS 进程状态转换：                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Active（活跃）→ 前台运行                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Inactive（非活跃）→ 前台但被阻塞（来电等）              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Background（后台）→ 后台运行                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Suspended（挂起）→ 系统暂停，冻结内存                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ Not Running（未运行）→ 进程已终止                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  进程优先级：                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  优先级（QoS 类别）                             │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ User Interactive（用户交互）— 最高             │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ User Initiated（用户发起）— 高                │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Utility（工具）— 中                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Background（后台）— 低                        │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ Accessibility（无障碍）— 最低                  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  进程调度策略：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 优先级抢占调度                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 时间片轮转调度                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 实时优先级调度                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_4-2-内存管理" tabindex="-1">4.2 内存管理 <a class="header-anchor" href="#_4-2-内存管理" aria-label="Permalink to &quot;4.2 内存管理&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">iOS 内存模型：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  内存区域划分：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  栈（Stack）                                │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 局部变量                                  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 函数参数                                  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 自动释放池                                │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 线程局部存储（TLS）                         │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 大小固定，增长方向：高地址 → 低地址           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  堆（Heap）                                 │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • malloc/calloc/realloc/new                 │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • ARC 管理的对象                            │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 大小动态，增长方向：低地址 → 高地址           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 由 ARC/内存管理器管理                        │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __TEXT 段（代码段）                          │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 可执行代码                                  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 常量数据                                    │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __DATA 段（数据段）                          │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 静态变量                                    │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 全局变量                                    │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • GOT/PLT 表                                  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  __LINKEDIT 段（链接编辑段）                     │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 符号表                                      │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 依赖列表                                    │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 代码签名                                    │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  内存管理对比：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ ARC：编译器自动插入 retain/release                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ MRC：手动管理内存（OC 旧项目）                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ GC：Apple 已废弃                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ malloc/free：底层内存分配                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  内存优化策略：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 减少堆分配次数                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 使用对象池/缓存                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 及时释放不再需要的引用                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 使用 Weak 引用避免循环                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 使用 Instruments 检测泄漏                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_5-安全机制-代码签名与沙盒" tabindex="-1">5. 安全机制：代码签名与沙盒 <a class="header-anchor" href="#_5-安全机制-代码签名与沙盒" aria-label="Permalink to &quot;5. 安全机制：代码签名与沙盒&quot;">​</a></h2><h3 id="_5-1-代码签名" tabindex="-1">5.1 代码签名 <a class="header-anchor" href="#_5-1-代码签名" aria-label="Permalink to &quot;5.1 代码签名&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">代码签名（Code Signing）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  代码签名的目的：                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 验证应用的完整性和来源                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 防止应用被篡改                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 确保只运行签名过的代码                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  签名流程：                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  1. 开发者生成密钥对                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  2. 向 Apple 申请证书（Provisioning Profile）   │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  3. Xcode 使用证书对 Mach-O 文件签名            │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4. 签名数据存储在 __LINKEDIT/CodeSignature 段  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  5. 安装时验证签名                              │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  6. 启动时内核验证签名                          │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  签名验证阶段：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 安装验证（codesign 工具）                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 启动验证（内核 dyld 验证）                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 运行时验证（可选）                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  签名相关文件：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Entitlements（权限配置）                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Provisioning Profile（描述文件）                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ Certificate（证书）                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ Keychain（密钥链）                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  签名检查命令：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • codesign -dvv Mach-O 查看签名信息                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • codesign --verify Mach-O 验证签名                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • codesign -s - Mach-O 签名                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_5-2-沙盒机制" tabindex="-1">5.2 沙盒机制 <a class="header-anchor" href="#_5-2-沙盒机制" aria-label="Permalink to &quot;5.2 沙盒机制&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">沙盒（Sandbox）机制：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  沙盒结构：                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Documents/                                │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 用户数据（持久化存储）                      │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • iTunes/iCloud 同步                        │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Library/                                  │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ Caches/（缓存）                         │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ Preferences/（偏好设置）                │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ Application Support/（应用数据）         │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  tmp/                                      │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 临时文件（系统可能清理）                   │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ⚠️ 沙盒限制：                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 不能访问其他 App 的目录                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 不能写入沙盒外目录                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 需要权限请求（相机/相册/位置等）          │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  权限请求流程：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  1. 在 Info.plist 声明权限                     │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  2. 运行时请求权限（AVCapture、CLLocationManager）│        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  3. 系统弹窗提示用户                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4. 用户授权/拒绝                              │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ↓                                           │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  5. 处理授权结果                              │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Privacy Manifest（隐私清单）：                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • iOS 17+ 强制要求                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 声明 App 使用的 API 和数据收集行为                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • App Store 审核时检查                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 不合规可能导致拒审                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_6-越狱检测" tabindex="-1">6. 越狱检测 <a class="header-anchor" href="#_6-越狱检测" aria-label="Permalink to &quot;6. 越狱检测&quot;">​</a></h2><h3 id="_6-1-常见越狱检测方式" tabindex="-1">6.1 常见越狱检测方式 <a class="header-anchor" href="#_6-1-常见越狱检测方式" aria-label="Permalink to &quot;6.1 常见越狱检测方式&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">越狱检测策略：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1. 检查已知越狱文件                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ /Applications/Cydia.app                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ /Library/MobileSubstrate/MobileSubstrate.dylib      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ /usr/bin/ssh                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ /usr/sbin/sshd                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ /etc/ssh/sshd_config                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  2. 检查可执行文件权限                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 尝试写入 /var/mobile/                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 尝试创建 /usr/bin/                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 尝试修改 /Applications/                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  3. 检查 dyld 注入                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 检查 DYLD_INSERT_LIBRARIES 环境变量                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 检查已加载的 framework（MobileSubstrate）           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 检查异常的 dyld 行为                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  4. 检查二进制签名                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 验证二进制文件的签名是否完整                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 检查是否有被篡改的 Mach-O 文件                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 检查 Entitlements 是否被修改                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  5. 运行时检测                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 尝试执行 su 命令                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 尝试打开 /dev/kmem                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 检查 /proc/self/maps 中是否有异常库                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  6. URL Scheme 检测                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 检查 cydia:// URL Scheme                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 检查 file:// URL Scheme（读取系统文件）             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  检测方案对比：                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────┬────────────────────────────┬─────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 方式      │ 可靠性                  │  误报率    │  适用场景  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─────────┼────────────────────────────┼─────────┤   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 文件检查  │ 高                      │  低        │ 简单检测  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 权限检查  │ 中                      │  中        │ 基础检测  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ dyld 注入  │ 高                      │  低        │ 高级检测  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 签名检查  │ 高                      │  低        │ 安全检测  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ 运行时检测  │ 高                      │  中        │ 深度检测  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ URL Scheme│ 中                      │  高        │ 辅助检测  │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────┴────────────────────────────┴─────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ⚠️ 注意：                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 越狱检测只能提高逆向难度，不能完全阻止                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 过度检测可能导致误判                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 建议结合多种方案                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_7-面试题汇总" tabindex="-1">7. 面试题汇总 <a class="header-anchor" href="#_7-面试题汇总" aria-label="Permalink to &quot;7. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: iOS 应用启动流程？</strong></p><p><strong>答</strong>：</p><ol><li>内核加载 Mach-O 可执行文件</li><li>dyld 加载依赖 framework</li><li>符号绑定（GOT/PLT）</li><li>_objc_init 初始化 Runtime</li><li>_objc_loadImages 加载类</li><li>调用 +load 方法</li><li>main() → UIApplicationMain</li><li>RunLoop 启动（无限循环）</li></ol><p><strong>Q2: Mach-O 文件结构？</strong></p><p><strong>答</strong>：</p><ul><li>Header：文件类型、CPU 类型、命令数量</li><li>Load Commands：加载命令（SEGMENT_64、LOAD_DYLIB、MAIN 等）</li><li>Segments：__PAGEZERO、__TEXT（代码）、__DATA（数据）、__LINKEDIT（符号/签名）</li></ul><p><strong>Q3: 动态链接机制？</strong></p><p><strong>答</strong>：</p><ul><li>dyld 在运行时解析符号</li><li>GOT/PLT 存储动态链接符号的地址</li><li>首次访问时触发 dyld 解析</li><li>减少动态依赖可以减少启动时间</li><li>使用 strip 剥离无用符号</li></ul><p><strong>Q4: 代码签名与沙盒机制？</strong></p><p><strong>答</strong>：</p><ul><li>代码签名：开发者证书 + Provisioning Profile + 密钥链</li><li>签名验证：安装时验证 + 启动时内核验证</li><li>沙盒：Documents/Library/tmp 目录结构</li><li>权限请求：Info.plist 声明 + 运行时弹窗</li></ul><p><strong>Q5: 越狱检测方案？</strong></p><p><strong>答</strong>：</p><ol><li>检查已知越狱文件（/Applications/Cydia.app 等）</li><li>检查权限（能否写入系统目录）</li><li>检查 dyld 注入（DYLD_INSERT_LIBRARIES）</li><li>检查二进制签名</li><li>运行时检测（su 命令、/dev/kmem）</li><li>URL Scheme 检测（cydia://）</li></ol><ul><li>结合多种方案，单一方案不可靠</li></ul><hr><h2 id="_8-参考资源" tabindex="-1">8. 参考资源 <a class="header-anchor" href="#_8-参考资源" aria-label="Permalink to &quot;8. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/foundation/mach-o-file-format-reference" target="_blank" rel="noreferrer">Apple: Mach-O File Format Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/dynamic-library-programming-topics" target="_blank" rel="noreferrer">Apple: Dynamic Library Programming Topics</a></li><li><a href="https://developer.apple.com/documentation/security/1639487-certificate_authority_and_code" target="_blank" rel="noreferrer">Apple: Code Signing Guide</a></li><li><a href="https://developer.apple.com/documentation/security/app_sandbox" target="_blank" rel="noreferrer">Apple: App Sandboxing</a></li><li><a href="https://opensource.apple.com/tarballs/CF/" target="_blank" rel="noreferrer">Core Foundation: Mach-O Reference</a></li><li><a href="https://nshipster.com/mach-o" target="_blank" rel="noreferrer">NSHipster: Mach-O</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2019/705" target="_blank" rel="noreferrer">WWDC 2019: What&#39;s New in Security</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2020/10240" target="_blank" rel="noreferrer">WWDC 2020: Explore Crash Reports</a></li></ul>`,59)])])}const d=a(l,[["render",h]]);export{r as __pageData,d as default};
