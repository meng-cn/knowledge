import{_ as n,o as a,c as p,ae as i}from"./chunks/framework.Czhw_PXq.js";const d=JSON.parse('{"title":"02 - Runloop 深度","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/10_System_Principles/02_Runloop_Deep.md","filePath":"01-ios/10_System_Principles/02_Runloop_Deep.md"}'),l={name:"01-ios/10_System_Principles/02_Runloop_Deep.md"};function e(t,s,o,h,c,r){return a(),p("div",null,[...s[0]||(s[0]=[i(`<h1 id="_02-runloop-深度" tabindex="-1">02 - Runloop 深度 <a class="header-anchor" href="#_02-runloop-深度" aria-label="Permalink to &quot;02 - Runloop 深度&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-runloop-内核架构">RunLoop 内核架构</a></li><li><a href="#2-mode-详解">Mode 详解</a></li><li><a href="#3-source-原理">Source 原理</a></li><li><a href="#4-timer-原理与精度问题">Timer 原理与精度问题</a></li><li><a href="#5-runloop-应用场景">RunLoop 应用场景</a></li><li><a href="#6-runloop-源码级分析">RunLoop 源码级分析</a></li><li><a href="#7-面试题汇总">面试题汇总</a></li></ol><hr><h2 id="_1-runloop-内核架构" tabindex="-1">1. RunLoop 内核架构 <a class="header-anchor" href="#_1-runloop-内核架构" aria-label="Permalink to &quot;1. RunLoop 内核架构&quot;">​</a></h2><h3 id="_1-1-core-foundation-runloop-对象" tabindex="-1">1.1 Core Foundation RunLoop 对象 <a class="header-anchor" href="#_1-1-core-foundation-runloop-对象" aria-label="Permalink to &quot;1.1 Core Foundation RunLoop 对象&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>RunLoop 核心对象（Core Foundation 层级）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. CFRunLoopRef (RunLoop)                                  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  • modeList：模式列表（Modes）                       │  │</span></span>
<span class="line"><span>│  │  • currentMode：当前运行的模式                         │  │</span></span>
<span class="line"><span>│  │  • modes：模式数组                                  │  │</span></span>
<span class="line"><span>│  │  • observers：观察者列表                              │  │</span></span>
<span class="line"><span>│  │  • timers：定时器列表                                │  │</span></span>
<span class="line"><span>│  │  • sources：源列表（Source0/Source1）                │  │</span></span>
<span class="line"><span>│  │  • port：端口（用于线程间通信）                       │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  2. CFRunLoopModeRef (模式)                                  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  • name：模式名称（NSDefaultRunLoopMode 等）           │  │</span></span>
<span class="line"><span>│  │  • sources0：Source0（非系统事件）                      │  │</span></span>
<span class="line"><span>│  │  • sources1：Source1（系统事件/端口）                   │  │</span></span>
<span class="line"><span>│  │  • timers：定时器列表                                  │  │</span></span>
<span class="line"><span>│  │  • observers：观察者列表                               │  │</span></span>
<span class="line"><span>│  │  • port：端口                                          │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  3. CFRunLoopSourceRef (源)                                  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  Source0（非系统事件）                                 │  │</span></span>
<span class="line"><span>│  │  ├─ 回调函数（callback）                              │  │</span></span>
<span class="line"><span>│  │  ├─ 上下文（context）                                 │  │</span></span>
<span class="line"><span>│  │  └─ 用于应用层事件（performSelector 等）               │  │</span></span>
<span class="line"><span>│  │                                                          │  │</span></span>
<span class="line"><span>│  │  Source1（系统事件/端口）                              │  │</span></span>
<span class="line"><span>│  │  ├─ mach_port（端口）                                 │  │</span></span>
<span class="line"><span>│  │  ├─ handler（回调函数）                               │  │</span></span>
<span class="line"><span>│  │  └─ 用于系统间通信（Mach port）                        │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  4. CFRunLoopTimerRef (定时器)                               │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  • interval：间隔时间                                  │  │</span></span>
<span class="line"><span>│  │  • tolerance：容差（允许的时间偏差）                     │  │</span></span>
<span class="line"><span>│  │  • handler：回调函数                                   │  │</span></span>
<span class="line"><span>│  │  • flags：标志（repeating/oneshot）                    │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  5. CFRunLoopObserverRef (观察者)                            │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  • activities：活动类型                                │  │</span></span>
<span class="line"><span>│  │  • order：优先级                                      │  │</span></span>
<span class="line"><span>│  │  • callout：回调函数                                   │  │</span></span>
<span class="line"><span>│  │  • context：上下文                                      │  │</span></span>
<span class="line"><span>│  │                                                      │  │</span></span>
<span class="line"><span>│  │  activities（按执行顺序）：                            │  │</span></span>
<span class="line"><span>│  │  1. Entry（进入）                                    │  │</span></span>
<span class="line"><span>│  │  2. BeforeTimers（定时器前）                          │  │</span></span>
<span class="line"><span>│  │  3. BeforeSources（源前）                            │  │</span></span>
<span class="line"><span>│  │  4. BeforeWait（等待前）                              │  │</span></span>
<span class="line"><span>│  │  5. AfterWait（等待后）                              │  │</span></span>
<span class="line"><span>│  │  6. Exit（退出）                                    │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_1-2-线程与-runloop-的关系" tabindex="-1">1.2 线程与 RunLoop 的关系 <a class="header-anchor" href="#_1-2-线程与-runloop-的关系" aria-label="Permalink to &quot;1.2 线程与 RunLoop 的关系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>线程与 RunLoop 映射关系：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  每个线程（包括主线程）都有一个 RunLoop                      │</span></span>
<span class="line"><span>│  • 主线程的 RunLoop 由 UIKit 自动创建                        │</span></span>
<span class="line"><span>│  • 子线程的 RunLoop 需要手动创建                            │</span></span>
<span class="line"><span>│  • 一个线程只有一个 RunLoop 对象                             │</span></span>
<span class="line"><span>│  • RunLoop 通过线程局部存储（TLS）保存                       │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  访问 RunLoop 的方法：                                       │</span></span>
<span class="line"><span>│  • [NSRunLoop currentRunLoop]    — 获取当前线程的 RunLoop    │</span></span>
<span class="line"><span>│  • [NSRunLoop mainRunLoop]      — 获取主线程的 RunLoop      │</span></span>
<span class="line"><span>│  • CFRunLoopGetCurrent()         — CF 版本                   │</span></span>
<span class="line"><span>│  • CFRunLoopGetMain()            — 主线程 CF 版本           │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  线程 RunLoop 生命周期：                                    │</span></span>
<span class="line"><span>│  • 主线程：自动创建，运行至程序退出                            │</span></span>
<span class="line"><span>│  • 子线程：手动创建，RunLoop 运行完即销毁                      │</span></span>
<span class="line"><span>│  • 当子线程没有事件处理时，RunLoop 会自动退出                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  主线程 RunLoop 保持运行机制：                               │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  │  main()                                                    │</span></span>
<span class="line"><span>│  │  ↓                                                        │</span></span>
<span class="line"><span>│  │  UIApplicationMain()                                       │</span></span>
<span class="line"><span>│  │  ↓                                                        │</span></span>
<span class="line"><span>│  │  [UIApplication sharedApplication] 自动创建主线程 RunLoop   │</span></span>
<span class="line"><span>│  │  ↓                                                        │</span></span>
<span class="line"><span>│  │  [[NSRunLoop currentRunLoop] run] — 永远运行                │</span></span>
<span class="line"><span>│  │  ↓                                                        │</span></span>
<span class="line"><span>│  │  (等待事件 → 处理事件 → 等待事件 ...)                        │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>⚠️ 关键理解：</span></span>
<span class="line"><span>• RunLoop 不是线程的替身，线程才是 RunLoop 的宿主</span></span>
<span class="line"><span>• RunLoop 只是线程的一个管理器，负责调度事件和定时器</span></span>
<span class="line"><span>• 主线程的 RunLoop 由 UIKit 自动管理</span></span>
<span class="line"><span>• 子线程的 RunLoop 需要手动创建并启动</span></span></code></pre></div><h3 id="_1-3-runloop-模式" tabindex="-1">1.3 RunLoop 模式 <a class="header-anchor" href="#_1-3-runloop-模式" aria-label="Permalink to &quot;1.3 RunLoop 模式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>RunLoop 的标准模式（Core Foundation 定义）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  NSDefaultRunLoopMode（kCFRunLoopDefaultMode）              │</span></span>
<span class="line"><span>│  • 默认模式：普通事件处理                                   │</span></span>
<span class="line"><span>│  • 包括：UI 事件、定时器、performSelector                   │</span></span>
<span class="line"><span>│  • 当 UI 滚动时，RunLoop 会切换到 UITrackingRunLoopMode      │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  UITrackingRunLoopMode                                           │</span></span>
<span class="line"><span>│  • UI 滚动模式：保证 UI 流畅                                │</span></span>
<span class="line"><span>│  • 在 UI 滚动期间，其他模式的任务暂停                        │</span></span>
<span class="line"><span>│  • UI 事件优先级最高                                         │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  NSRunLoopCommonModes（kCFRunLoopCommonModes）              │</span></span>
<span class="line"><span>│  • 伪模式：不是真正的模式                                    │</span></span>
<span class="line"><span>│  • 将多个模式归为一组                                        │</span></span>
<span class="line"><span>│  • 添加到 common modes 的源/定时器在所有 common 模式中运行    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  UIDefaultRunLoopMode = NSDefaultRunLoopMode                  │</span></span>
<span class="line"><span>│  • UIKit 内部使用                                           │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  NSURLSessionConfigurationNSURLSessionTaskOperationMode    │</span></span>
<span class="line"><span>│  • URLSession 异步回调模式                                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  GSEventReceiveRunLoopMode                                  │</span></span>
<span class="line"><span>│  • 底层事件模式                                             │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>模式切换时机：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  正常状态：NSDefaultRunLoopMode                              │</span></span>
<span class="line"><span>│       │                                                    │</span></span>
<span class="line"><span>│       │ UI 开始滚动                                        │</span></span>
<span class="line"><span>│       ▼                                                    │</span></span>
<span class="line"><span>│  UITrackingRunLoopMode                                     │</span></span>
<span class="line"><span>│       │                                                    │</span></span>
<span class="line"><span>│       │ UI 滚动结束                                        │</span></span>
<span class="line"><span>│       ▼                                                    │</span></span>
<span class="line"><span>│  NSDefaultRunLoopMode（回到默认模式）                       │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  ⚠️ 注意：                                                   │</span></span>
<span class="line"><span>│  • 模式切换是自动的，开发者无需手动管理                      │</span></span>
<span class="line"><span>│  • 但可以通过 CFRunLoopAddCommonTimer 将定时器添加到 common modes │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_2-mode-详解" tabindex="-1">2. Mode 详解 <a class="header-anchor" href="#_2-mode-详解" aria-label="Permalink to &quot;2. Mode 详解&quot;">​</a></h2><h3 id="_2-1-runloop-运行循环机制" tabindex="-1">2.1 RunLoop 运行循环机制 <a class="header-anchor" href="#_2-1-runloop-运行循环机制" aria-label="Permalink to &quot;2.1 RunLoop 运行循环机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>RunLoop 运行循环（核心机制）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  核心循环：                                                │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  while (!done) {                                  │  │</span></span>
<span class="line"><span>│  │    1. 通知 Observers：即将进入循环                    │  │</span></span>
<span class="line"><span>│  │    2. 处理 pending 的 Source0（非系统事件）           │  │</span></span>
<span class="line"><span>│  │    3. 处理 pending 的 Source1（系统事件/端口）        │  │</span></span>
<span class="line"><span>│  │    4. 如果没有 Source0/Source1 事件：                │  │</span></span>
<span class="line"><span>│  │       a. 通知 Observers：即将等待                     │  │</span></span>
<span class="line"><span>│  │       b. 进入等待，直到有事件或定时器触发              │  │</span></span>
<span class="line"><span>│  │       c. 通知 Observers：等待唤醒                    │  │</span></span>
<span class="line"><span>│  │       d. 唤醒后重新处理事件                           │  │</span></span>
<span class="line"><span>│  │    5. 处理 Timer 事件（如果在等待时间内）              │  │</span></span>
<span class="line"><span>│  │    6. 通知 Observers：即将退出循环                    │  │</span></span>
<span class="line"><span>│  │  }                                                 │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  事件处理优先级（从高到低）：                                 │</span></span>
<span class="line"><span>│  1. Source1（系统事件/端口）— 高优先级                      │</span></span>
<span class="line"><span>│  2. Source0（非系统事件）— 中优先级                          │</span></span>
<span class="line"><span>│  3. Timer — 低优先级                                        │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  ⚠️ Timer 精度：                                            │</span></span>
<span class="line"><span>│  • Timer 在指定的 timeInterval 后触发                       │</span></span>
<span class="line"><span>│  • 但实际触发时间受 Mode 影响                               │</span></span>
<span class="line"><span>│  • 如果在 UITrackingRunLoopMode 模式下，Timer 不会触发       │</span></span>
<span class="line"><span>│  • 解决方案：将 Timer 添加到 NSRunLoopCommonModes            │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_2-2-source-详解" tabindex="-1">2.2 Source 详解 <a class="header-anchor" href="#_2-2-source-详解" aria-label="Permalink to &quot;2.2 Source 详解&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Source 系统：</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Source0（非系统事件）                                       │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 回调机制                                          │   │</span></span>
<span class="line"><span>│  │  • 用于应用层事件（performSelector、自定义事件）       │   │</span></span>
<span class="line"><span>│  │  • 手动触发（通过 CFRunLoopSourceSignal）              │   │</span></span>
<span class="line"><span>│  │  • 不直接绑定端口                                     │   │</span></span>
<span class="line"><span>│  │                                                  │   │</span></span>
<span class="line"><span>│  │  触发流程：                                          │   │</span></span>
<span class="line"><span>│  │  1. 调用 CFRunLoopSourceSignal(source)              │   │</span></span>
<span class="line"><span>│  │  2. 通知 RunLoop 有事件待处理                          │   │</span></span>
<span class="line"><span>│  │  3. RunLoop 在下一循环调用 Source0 的 handler        │   │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Source1（系统事件/端口）                                    │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • mach_port 机制                                   │   │</span></span>
<span class="line"><span>│  │  • 用于系统间通信（Mach port）                       │   │</span></span>
<span class="line"><span>│  │  • 系统自动触发                                      │   │</span></span>
<span class="line"><span>│  │  • 基于 GCD 的 dispatch 也通过 Source1 实现           │   │</span></span>
<span class="line"><span>│  │                                                  │   │</span></span>
<span class="line"><span>│  │  触发流程：                                          │   │</span></span>
<span class="line"><span>│  │  1. 系统发送消息到 mach_port                        │   │</span></span>
<span class="line"><span>│  │  2. Source1 收到事件                                │   │</span></span>
<span class="line"><span>│  │  3. 调用 Source1 的 handler                         │   │</span></span>
<span class="line"><span>│  │  4. dispatch_async 的 block 通过 Source1 触发         │   │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  dispatch_async 与 RunLoop 的关系：                        │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  当 dispatch_async 发送到主线程时：                    │</span></span>
<span class="line"><span>│  │  1. 创建 GCD Source（Source1）                      │    │</span></span>
<span class="line"><span>│  │  2. 通过 mach_port 通知 RunLoop                       │</span></span>
<span class="line"><span>│  │  3. RunLoop 在下一个循环处理 Source                   │</span></span>
<span class="line"><span>│  │  4. handler 执行 dispatch queue 的 block             │</span></span>
<span class="line"><span>│  │                                                  │    │</span></span>
<span class="line"><span>│  │  ⚠️ 如果在主线程的 runLoop 中 dispatch_async：       │</span></span>
<span class="line"><span>│  │     当前 RunLoop 循环不会执行该 block                    │</span></span>
<span class="line"><span>│  │     要等到下一个循环才执行                                │</span></span>
<span class="line"><span>│  │     解决方案：CFRunLoopWakeUp() 或 dispatch_sync  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_2-3-timer-精度与容差" tabindex="-1">2.3 Timer 精度与容差 <a class="header-anchor" href="#_2-3-timer-精度与容差" aria-label="Permalink to &quot;2.3 Timer 精度与容差&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Timer 精度问题（经典面试题）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Timer 触发时间偏差原因：                                   │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  1. Mode 切换                                       │    │</span></span>
<span class="line"><span>│  │     • 在 UITrackingRunLoopMode 模式下 Timer 不触发    │</span></span>
<span class="line"><span>│  │     • UI 滚动时 Timer 延迟触发                        │</span></span>
<span class="line"><span>│  │     • 解决方案：添加到 common modes                  │</span></span>
<span class="line"><span>│  │                                                   │    │</span></span>
<span class="line"><span>│  │  2. 任务执行耗时                                     │</span></span>
<span class="line"><span>│  │     • Timer 回调任务耗时 &gt; timeInterval             │</span></span>
<span class="line"><span>│  │     • Timer 不会重叠执行，等前一个完成后再触发         │</span></span>
<span class="line"><span>│  │     • 解决方案：使用 CADisplayLink 替代              │</span></span>
<span class="line"><span>│  │                                                   │    │</span></span>
<span class="line"><span>│  │  3. RunLoop 唤醒延迟                                 │</span></span>
<span class="line"><span>│  │     • 等待事件时 RunLoop 进入休眠                     │</span></span>
<span class="line"><span>│  │     • 从休眠到唤醒有延迟                              │</span></span>
<span class="line"><span>│  │     • 解决方案：使用 NSTimer.tolerance（iOS 10+）    │</span></span>
<span class="line"><span>│  │                                                   │    │</span></span>
<span class="line"><span>│  │  4. 线程阻塞                                         │</span></span>
<span class="line"><span>│  │     • 主线程被阻塞时 Timer 不会触发                   │</span></span>
<span class="line"><span>│  │     • 解决方案：不要在主线程执行耗时任务              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  NSTimer.tolerance（iOS 10+）：                           │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  • tolerance 指定允许的时间偏差                      │</span></span>
<span class="line"><span>│  │  • 系统利用 tolerance 优化电源消耗                   │</span></span>
<span class="line"><span>│  │  • 如果 tolerance = 1.0s，系统可以将 Timer 触发      │</span></span>
<span class="line"><span>│  │    时间提前/延后最多 1 秒                            │</span></span>
<span class="line"><span>│  │  • 适用于：不要求精确时间的 Timer                     │</span></span>
<span class="line"><span>│  │  • 示例：NSTimer scheduledTimerWithTimeInterval:     │</span></span>
<span class="line"><span>│  │      tolerance: executingHandler:                    │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Timer 创建方式对比：                                       │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  创建方式                          │  说明                │  │</span></span>
<span class="line"><span>│  ├──────────────────────────────────────────────────────┤  │</span></span>
<span class="line"><span>│  │  scheduledTimer:                   │  添加到默认 RunLoop   │  │</span></span>
<span class="line"><span>│  │  scheduledTimerWithTimeInterval:   │  同上，自定义间隔    │  │</span></span>
<span class="line"><span>│  │  timerWithTimeInterval:            │  不自动添加           │  │</span></span>
<span class="line"><span>│  │  CADisplayLink                     │  与屏幕刷新同步       │  │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_3-runloop-应用场景" tabindex="-1">3. RunLoop 应用场景 <a class="header-anchor" href="#_3-runloop-应用场景" aria-label="Permalink to &quot;3. RunLoop 应用场景&quot;">​</a></h2><h3 id="_3-1-典型应用场景" tabindex="-1">3.1 典型应用场景 <a class="header-anchor" href="#_3-1-典型应用场景" aria-label="Permalink to &quot;3.1 典型应用场景&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">RunLoop 的典型应用场景：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  场景 1：NSTimer 在 UI 滚动时不暂停                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  问题：NSTimer 在 UI 滚动时被暂停                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  原因：滚动时 RunLoop 切换到 UITrackingRunLoopMode            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解决：将 Timer 添加到 common modes                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 方案 1：添加到 common modes                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  [timer runLoop: [NSRunLoop currentRunLoop]                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│              forMode: NSRunLoopCommonModes];                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 方案 2：使用 CADisplayLink（与屏幕刷新同步）              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  CADisplayLink *link = [CADisplayLink                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      displayLinkWithTarget:self                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      selector:@selector(update:)];                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  [link addToRunLoop:[NSRunLoop currentRunLoop]                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      forMode: NSRunLoopCommonModes];                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  场景 2：异步操作在主线程回调                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  dispatch_async(dispatch_get_main_queue(), ^{                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 不会在当前 RunLoop 循环执行                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 要等到下一个循环才执行                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      [self doSomething];                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  });                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解决方案：                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 方案 1：直接调用（不在 RunLoop 中）                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  [self doSomething];                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 方案 2：唤醒 RunLoop                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  CFRunLoopWakeUp(CFRunLoopGetCurrent());                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 方案 3：dispatch_sync（同步调用）                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  dispatch_sync(dispatch_get_main_queue(), ^{                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      [self doSomething];                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  });                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  场景 3：子线程维持 RunLoop 运行                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 创建子线程 + RunLoop                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  NSThread *thread = [[NSThread alloc]                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      initWithTarget:self                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      selector:@selector(runLoopThread)                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      object:nil];                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  [thread start];                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  - (void)runLoopThread {                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      [[NSRunLoop currentRunLoop] addTimer:timer               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      forMode:NSDefaultRunLoopMode];                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      [[NSRunLoop currentRunLoop] run];                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  }                                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  场景 4：GCD 的 main queue 与 RunLoop 的关系                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • GCD 的 main queue 基于主线程的 RunLoop                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • dispatch_async(main) 的 block 通过 RunLoop 触发            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 如果主线程的 RunLoop 没有运行，block 不会执行                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 如果主线程的 RunLoop 正在等待（休眠），block 不会立即执行    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  场景 5：网络请求回调在主线程执行                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • NSURLSession 的 delegate 回调默认在主线程的 RunLoop 中执行  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 这是因为 URLSession 将回调添加到主线程的 RunLoop             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 可以通过 configuration.queue 指定回调队列                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  场景 6：performSelector 的实现原理                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ─────────────────────────────────────────────                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • performSelector:withObject:afterDelay:                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│    本质上是通过 NSTimer + RunLoop 实现                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • Timer 被添加到 RunLoop 中，在指定时间触发                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 触发时调用目标对象的方法                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 如果 RunLoop 处于 UITrackingRunLoopMode，延迟会不准确        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_4-runloop-源码级分析" tabindex="-1">4. RunLoop 源码级分析 <a class="header-anchor" href="#_4-runloop-源码级分析" aria-label="Permalink to &quot;4. RunLoop 源码级分析&quot;">​</a></h2><h3 id="_4-1-cfrunloop-源码关键结构" tabindex="-1">4.1 CFRunLoop 源码关键结构 <a class="header-anchor" href="#_4-1-cfrunloop-源码关键结构" aria-label="Permalink to &quot;4.1 CFRunLoop 源码关键结构&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">CFRunLoop 核心源码结构（简化版）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  struct __CFRunLoop {                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFRuntimeBase _base;                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      pthread_t _pthread;                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      uint32_t _modeListCount;                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableSetRef _modes;                         │  /* 模式集合           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      void *_dispatchQueue;                           │  /* GCD 队列          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      dispatch_source_t _dispatchSource;              │  /* Dispatch Source   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFStringRef _name;                              │  /* RunLoop 名称      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      int _spinCount;                                 │  /* 自旋计数           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  };                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  struct __CFRunLoopMode {                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFRuntimeBase _base;                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFStringRef _name;                              │  /* 模式名称           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      bool _stopped;                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableSetRef _sources0;                      │  /* Source0 集合      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableSetRef _sources1;                      │  /* Source1 集合      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableArrayRef _observers;                   │  /* 观察者             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableArrayRef _timers;                      │  /* Timer 集合         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      dispatch_source_t _dispatchSource;              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  };                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  struct __CFRunLoopObserver {                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFRuntimeBase _base;                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      uint32_t _bits;                                 │  /* 活动类型           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableArrayRef _calloutArray;                │  /* callout 数组       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  };                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  struct __CFRunLoopSource {                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFRuntimeBase _base;                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      uint32_t _bits;                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      CFMutableSetRef _runLoops;                      │  /* 所属 RunLoop      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      void *_context;                                 │  /* 上下文             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      uint32_t _order;                                │  /* 优先级             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  };                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_4-2-cfrunlooprun-源码核心流程" tabindex="-1">4.2 CFRunLoopRun 源码核心流程 <a class="header-anchor" href="#_4-2-cfrunlooprun-源码核心流程" aria-label="Permalink to &quot;4.2 CFRunLoopRun 源码核心流程&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">CFRunLoopRun 核心循环（源码级）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  int CFRunLoopRun(void) {                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      int __CFRunLoopRun(CFRunLoopRef rl,            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          CFRunLoopModeRef rlm,                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          CFTimeInterval seconds,                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          Boolean stopAfterHandle) {                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 1. 通知 Observer：进入循环                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      __CFRunLoopDoObservers(rl, rlm, kCFRunLoopEntry); │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 2. 执行 Dispatch Source                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      dispatch_resume(rlm-&gt;_dispatchSource);           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 3. 处理 pending 的 Source0                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      boolean sources0Handled = false;                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      do {                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          sources0Handled = __CFRunLoopDoSources0(...);  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      } while (sources0Handled);                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 4. 处理 pending 的 Source1                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      boolean sourceHandled = false;                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      if (!stopAfterHandle) {                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          __CFRunLoopDoSources1(...);                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      }                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 5. 处理 Timers                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      __CFRunLoopDoTimers(rl, rlm, mach_absolute_time());│</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 6. 如果有 Dispatch Source，处理它                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      __CFRunLoopDoDispatch(...);                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 7. 进入等待（如果没有更多事件）                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      if (!stopAfterHandle) {                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          __CFRunLoopDoObservers(rl, rlm,               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│              kCFRunLoopBeforeWaiting);                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          __CFRunLoopWait(...);  // 等待事件              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          __CFRunLoopDoObservers(rl, rlm,               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│              kCFRunLoopAfterWaiting);                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      }                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      // 8. 通知 Observer：退出循环                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      __CFRunLoopDoObservers(rl, rlm,                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│          kCFRunLoopExit);                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      return result;                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ⚠️ 关键理解：                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • RunLoop 是一个 while 循环，持续等待和处理事件         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 事件处理完成后进入等待（休眠）                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 有事件或定时器触发时唤醒                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 主线程的 RunLoop 永远不会退出                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_5-runloop-应用场景深度分析" tabindex="-1">5. RunLoop 应用场景深度分析 <a class="header-anchor" href="#_5-runloop-应用场景深度分析" aria-label="Permalink to &quot;5. RunLoop 应用场景深度分析&quot;">​</a></h2><h3 id="_5-1-性能优化中的应用" tabindex="-1">5.1 性能优化中的应用 <a class="header-anchor" href="#_5-1-性能优化中的应用" aria-label="Permalink to &quot;5.1 性能优化中的应用&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">RunLoop 在性能优化中的应用：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1. 延迟加载：                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 在 runLoop 的 BeforeWait 阶段进行数据加载            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 利用等待时间做后台处理                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 在 AfterWait 阶段更新 UI                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  2. 批量更新：                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 在 BeforeTimers 阶段合并多个更新                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 减少重复的 layout/relayout                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  3. 避免频繁更新：                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 不要在 BeforeSources 阶段做耗时操作                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 使用 CADisplayLink 替代 Timer（与屏幕刷新同步）     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  4. 主线程保活：                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 子线程使用 RunLoop 保持活跃                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 添加 Timer/Source 到 RunLoop                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 调用 [[NSRunLoop currentRunLoop] run]              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  5. 网络请求回调：                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • URLSession 默认在主线程的 RunLoop 中回调            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 可以通过 configuration.queue 指定其他队列            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">RunLoop 的常见坑：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  坑 1：Timer 在 UI 滚动时被暂停                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解：添加到 common modes                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  坑 2：dispatch_async(main) 不立即执行                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解：直接调用或 CFRunLoopWakeUp                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  坑 3：performSelector:afterDelay: 不准                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解：使用 CADisplayLink 或 NSTimer                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  坑 4：子线程 RunLoop 自动退出                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解：添加 Timer/Source 或调用 run                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  坑 5：RunLoop 阻塞导致事件不处理                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  解：不要在 RunLoop 中做耗时操作                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_6-面试题汇总" tabindex="-1">6. 面试题汇总 <a class="header-anchor" href="#_6-面试题汇总" aria-label="Permalink to &quot;6. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: RunLoop 的核心作用是什么？</strong></p><p><strong>答</strong>：</p><ul><li>RunLoop 是事件处理和管理线程运行的核心机制</li><li>保持线程活跃（主线程通过 RunLoop 保持运行）</li><li>调度事件和定时器（Source0/Source1/Timer）</li><li>协调事件分发（UI 事件、网络回调、定时器）</li></ul><p><strong>Q2: RunLoop 的 Mode 有哪些？</strong></p><p><strong>答</strong>：</p><ul><li>NSDefaultRunLoopMode：默认模式（普通事件处理）</li><li>UITrackingRunLoopMode：UI 滚动模式（保证流畅）</li><li>NSRunLoopCommonModes：伪模式（归组）</li><li>UIDefaultRunLoopMode、NSURLSession 模式等</li></ul><p><strong>Q3: RunLoop 的 Source 和 Timer 的关系？</strong></p><p><strong>答</strong>：</p><ul><li>Source0：非系统事件，需要手动触发</li><li>Source1：系统事件/端口，通过 mach_port 触发</li><li>Timer 是 Source 的一种封装，底层也是 mach port</li><li>Timer 在指定的 timeInterval 后触发，实际受 Mode 影响</li><li>在 UITrackingRunLoopMode 下 Timer 不会触发</li><li>解决方案：添加到 common modes 或使用 CADisplayLink</li></ul><p><strong>Q4: dispatch_async(main) 为什么不立即执行？</strong></p><p><strong>答</strong>：</p><ul><li>dispatch_async 通过 RunLoop 的 Source1 触发</li><li>RunLoop 当前循环已经处理完 Source1，要等到下一个循环</li><li>解决方案：直接调用、CFRunLoopWakeUp、或 dispatch_sync</li></ul><p><strong>Q5: RunLoop 的 Observer 有哪些活动类型？</strong></p><p><strong>答</strong>：</p><ol><li>Entry：进入循环</li><li>BeforeTimers：定时器前</li><li>BeforeSources：源前</li><li>BeforeWait：等待前</li><li>AfterWait：等待后</li><li>Exit：退出循环</li></ol><p><strong>Q6: 如何实现一个子线程的长期运行？</strong></p><p><strong>答</strong>：</p><ul><li>创建子线程</li><li>在子线程中创建 RunLoop</li><li>添加 Timer/Source 到 RunLoop</li><li>调用 [[NSRunLoop currentRunLoop] run]</li><li>或者使用 dispatch queue + RunLoop 配合</li></ul><hr><h2 id="_7-参考资源" tabindex="-1">7. 参考资源 <a class="header-anchor" href="#_7-参考资源" aria-label="Permalink to &quot;7. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/foundation/cfrunloop" target="_blank" rel="noreferrer">Apple: RunLoop Programming Guide</a></li><li><a href="https://developer.apple.com/documentation/corefoundation/cfrunloop" target="_blank" rel="noreferrer">Apple: CFRunLoopRef Reference</a></li><li><a href="https://opensource.apple.com/tarballs/CF/" target="_blank" rel="noreferrer">Core Foundation: RunLoop Source Code</a></li><li><a href="https://nshipster.com/runloop" target="_blank" rel="noreferrer">NSHipster: RunLoop</a></li><li><a href="https://www.objc.io/issues/13-concurrency/runloop/" target="_blank" rel="noreferrer">objc.io: RunLoop</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2018/224" target="_blank" rel="noreferrer">WWDC 2018: Modern RunLoop Techniques</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2020/10149" target="_blank" rel="noreferrer">WWDC 2020: What&#39;s New in Concurrency</a></li></ul>`,57)])])}const D=n(l,[["render",e]]);export{d as __pageData,D as default};
