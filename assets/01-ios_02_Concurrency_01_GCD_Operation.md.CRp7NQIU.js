import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const A=JSON.parse('{"title":"01 - GCD 与 Operation 全栈深度","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/02_Concurrency/01_GCD_Operation.md","filePath":"01-ios/02_Concurrency/01_GCD_Operation.md"}'),l={name:"01-ios/02_Concurrency/01_GCD_Operation.md"};function e(t,s,h,k,r,c){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="_01-gcd-与-operation-全栈深度" tabindex="-1">01 - GCD 与 Operation 全栈深度 <a class="header-anchor" href="#_01-gcd-与-operation-全栈深度" aria-label="Permalink to &quot;01 - GCD 与 Operation 全栈深度&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-gcd-全栈深度分析">GCD 全栈深度分析</a></li><li><a href="#2-operation-全栈深度分析">Operation 全栈深度分析</a></li><li><a href="#3-gcd-vs-operation-对比分析">GCD vs Operation 对比分析</a></li><li><a href="#4-并发性能分析与优化">并发性能分析与优化</a></li><li><a href="#5-面试题汇总">面试题汇总</a></li></ol><hr><h2 id="_1-gcd-全栈深度分析" tabindex="-1">1. GCD 全栈深度分析 <a class="header-anchor" href="#_1-gcd-全栈深度分析" aria-label="Permalink to &quot;1. GCD 全栈深度分析&quot;">​</a></h2><h3 id="_1-1-gcd-核心架构" tabindex="-1">1.1 GCD 核心架构 <a class="header-anchor" href="#_1-1-gcd-核心架构" aria-label="Permalink to &quot;1.1 GCD 核心架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Grand Central Dispatch 系统架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  GCD 核心组件：                                                     │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  队列（Queue）                                               │  │</span></span>
<span class="line"><span>│  │  ┌─────────────────────────────────────────────┐             │  │</span></span>
<span class="line"><span>│  │  │  串行队列（Serial Queue）                     │  │</span></span>
<span class="line"><span>│  │  │  • 一次只执行一个任务                          │  │</span></span>
<span class="line"><span>│  │  │  • 任务按提交顺序执行                            │  │</span></span>
<span class="line"><span>│  │  │  • 创建：dispatch_queue_create(&quot;name&quot;, DISPATCH_QUEUE_SERIAL) │  │</span></span>
<span class="line"><span>│  │  │                                              │  │</span></span>
<span class="line"><span>│  │  │  并发队列（Concurrent Queue）                 │  │</span></span>
<span class="line"><span>│  │  │  • 可以同时执行多个任务                          │  │</span></span>
<span class="line"><span>│  │  │  • 任务执行顺序不确定                            │  │</span></span>
<span class="line"><span>│  │  │  • 系统提供 4 个优先级全局队列                  │  │</span></span>
<span class="line"><span>│  │  │                                              │  │</span></span>
<span class="line"><span>│  │  │  主队列（Main Queue）                         │  │</span></span>
<span class="line"><span>│  │  │  • 与主线程关联的串行队列                        │  │</span></span>
<span class="line"><span>│  │  │  • 用于 UI 更新                                 │  │</span></span>
<span class="line"><span>│  │  │  • 访问：dispatch_get_main_queue()              │  │</span></span>
<span class="line"><span>│  │  └─────────────────────────────────────────────┘             │  │</span></span>
<span class="line"><span>│  │                                                              │  │</span></span>
<span class="line"><span>│  │  任务（Task / Block）                                        │  │</span></span>
<span class="line"><span>│  │  ┌─────────────────────────────────────────────┐             │  │</span></span>
<span class="line"><span>│  │  │  • 同步执行（sync）— 当前线程等待任务完成      │  │</span></span>
<span class="line"><span>│  │  │  • 异步执行（async）— 不等待，立即返回        │  │</span></span>
<span class="line"><span>│  │  │  • 延迟执行（asyncAfter）— 指定延迟后执行      │  │</span></span>
<span class="line"><span>│  │  │  • 一次性执行（once）— 只执行一次              │  │</span></span>
<span class="line"><span>│  │  │  • 栅栏（barrier）— 等待前后任务完成          │  │</span></span>
<span class="line"><span>│  │  └─────────────────────────────────────────────┘             │  │</span></span>
<span class="line"><span>│  │                                                              │  │</span></span>
<span class="line"><span>│  │  Dispatch Source（事件源）                                   │  │</span></span>
<span class="line"><span>│  │  ┌─────────────────────────────────────────────┐             │  │</span></span>
<span class="line"><span>│  │  │  • 文件描述符事件                             │  │</span></span>
<span class="line"><span>│  │  │  • 端口事件                                  │  │</span></span>
<span class="line"><span>│  │  │  • 信号量事件                                │  │</span></span>
<span class="line"><span>│  │  │  • 定时器事件                                │  │</span></span>
<span class="line"><span>│  │  │  • 系统状态变化                              │  │</span></span>
<span class="line"><span>│  │  │  • Mach 端口                                │  │</span></span>
<span class="line"><span>│  │  └─────────────────────────────────────────────┘             │  │</span></span>
<span class="line"><span>│  │                                                              │  │</span></span>
<span class="line"><span>│  │  Dispatch Group（任务组）                                    │  │</span></span>
<span class="line"><span>│  │  ┌─────────────────────────────────────────────┐             │  │</span></span>
<span class="line"><span>│  │  │  • 等待多个任务完成                            │  │</span></span>
<span class="line"><span>│  │  │  • 通知任务完成                              │  │</span></span>
<span class="line"><span>│  │  │  • 配合 notify 使用                            │  │</span></span>
<span class="line"><span>│  │  └─────────────────────────────────────────────┘             │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_1-2-gcd-核心-api-深度" tabindex="-1">1.2 GCD 核心 API 深度 <a class="header-anchor" href="#_1-2-gcd-核心-api-深度" aria-label="Permalink to &quot;1.2 GCD 核心 API 深度&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">GCD 核心 API：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 1. 全局队列（4 个优先级）                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let q = DispatchQueue.global(qos: .userInteractive)  // 最高      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let q = DispatchQueue.global(qos: .userInitiated)    // 高        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let q = DispatchQueue.global(qos: .default)          // 默认       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let q = DispatchQueue.global(qos: .utility)          // 低         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let q = DispatchQueue.global(qos: .background)       // 最低        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  QoS（Quality of Service）优先级：                           │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .userInteractive  — UI 交互（最高）                     │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .userInitiated    — 用户发起                            │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .default          — 系统默认                            │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .utility          — 耗时任务                            │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .background       — 后台任务（最低）                    │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .unspecified      — 未指定（退化为 default）            │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 2. 自定义队列                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let serialQueue = DispatchQueue(label: &quot;com.app.serial&quot;)  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let concurrentQueue = DispatchQueue(label: &quot;com.app.concurrent&quot;, attributes: .concurrent)  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  队列属性：                                               │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DISPATCH_QUEUE_SERIAL — 串行队列（默认）              │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DISPATCH_QUEUE_CONCURRENT — 并发队列                 │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 3. 任务执行                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 同步执行 — 阻塞当前线程                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  dispatch_sync(queue) {                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;Sync task&quot;)                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 异步执行 — 不阻塞当前线程                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  dispatch_async(queue) {                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;Async task&quot;)                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 异步延迟执行                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  dispatch_after(deadline: .now() + 2.0, queue: .main) {  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;Delayed task&quot;)                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 一次性执行 — 线程安全                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  dispatch_once(&amp;token) {                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 只执行一次                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 栅栏任务 — 等待前后任务完成                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.async { print(&quot;Before barrier&quot;) }                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.async(flags: .barrier) {                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;Barrier task&quot;)  // 独占执行                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.async { print(&quot;After barrier&quot;) }                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ⚠️ 注意：                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • sync 到当前队列 = 死锁！                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 主队列 sync 到主队列 = 死锁！                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 4. Dispatch Group（任务组）                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let group = DispatchGroup()                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  group.enter()                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.async {                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 任务 1                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      group.leave()                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  group.enter()                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.async {                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 任务 2                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      group.leave()                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  group.notify(queue: .main) {                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;所有任务完成&quot;)                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 等待超时                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let timeout = group.wait(timeout: .now() + 5.0)         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  if timeout == .success { print(&quot;超时&quot;) }                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 5. Dispatch Source（事件源）                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 定时器源                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let source = DispatchSource.timer(                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      label: &quot;timer&quot;,                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      schedule: .every(interval: 1.0),                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      leeway: .milliseconds(10)                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  )                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  source.setEventHandler {                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;Timer fired&quot;)                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  source.resume()                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 其他 Source 类型：                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DispatchSource.timer    — 定时器                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DispatchSource.read     — 读取事件                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DispatchSource.write    — 写入事件                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DispatchSource.mach     — Mach 端口                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DispatchSource.signal   — 信号                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • DispatchSource.process  — 进程事件                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 6. Signal（信号量）                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let semaphore = DispatchSemaphore(value: 1)               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 等待（减少计数，0 时阻塞）                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  semaphore.wait()                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 执行临界区                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // ...                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 释放（增加计数）                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  semaphore.signal()                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  应用场景：                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 限制并发数量（如最多 5 个网络请求）                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 同步线程间通信                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 资源池管理                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ⚠️ 注意：                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 等待次数必须等于释放次数                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 不平衡会导致永久阻塞                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">GCD 调度机制：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  GCD 调度流程：                                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────┐             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  1. 任务提交到队列                                    │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  2. 队列将任务放入 dispatch_queue                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  3. 系统调度器决定在哪个线程执行                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4. 线程池从全局线程池分配线程                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  5. 任务执行完成，线程返回线程池                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  线程池管理：                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 线程池大小根据 QoS 自动调整                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 高 QoS → 更多线程                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 低 QoS → 更少线程                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 线程数量上限：约 64 个（因设备而异）              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  队列调度优先级：                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  1. 主队列 → 主线程（最高）                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  2. 高 QoS 队列 → 高优先级线程                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  3. 默认队列 → 默认线程                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4. 低 QoS 队列 → 低优先级线程                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  5. 低优先级队列 → 最低优先级线程                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────────┘             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_2-operation-全栈深度分析" tabindex="-1">2. Operation 全栈深度分析 <a class="header-anchor" href="#_2-operation-全栈深度分析" aria-label="Permalink to &quot;2. Operation 全栈深度分析&quot;">​</a></h2><h3 id="_2-1-operation-核心架构" tabindex="-1">2.1 Operation 核心架构 <a class="header-anchor" href="#_2-1-operation-核心架构" aria-label="Permalink to &quot;2.1 Operation 核心架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Operation 系统架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Operation 核心组件：                                                  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  Operation 基类                                               │    │</span></span>
<span class="line"><span>│  │  ┌──────────────────────────────────────────────────────────────┐  │    │</span></span>
<span class="line"><span>│  │  │  • 核心属性                                                   │    │    │</span></span>
<span class="line"><span>│  │  │    • isReady: 是否就绪（可执行）                              │    │    │</span></span>
<span class="line"><span>│  │  │    • isExecuting: 是否正在执行                                │    │    │</span></span>
<span class="line"><span>│  │  │    • isFinished: 是否完成                                    │    │    │</span></span>
<span class="line"><span>│  │  │    • isCancelled: 是否已取消                                  │    │    │</span></span>
<span class="line"><span>│  │  │    • queuePriority: 队列优先级                              │    │    │</span></span>
<span class="line"><span>│  │  │    • dependsOn: 依赖的 Operation                            │    │    │</span></span>
<span class="line"><span>│  │  │    • cancel(): 取消任务                                     │    │    │</span></span>
<span class="line"><span>│  │  │    • start(): 开始执行                                      │    │    │</span></span>
<span class="line"><span>│  │  │    • main(): 默认执行方法                                    │    │    │</span></span>
<span class="line"><span>│  │  └──────────────────────────────────────────────────────────────┘    │    │</span></span>
<span class="line"><span>│  │                                                                      │    │</span></span>
<span class="line"><span>│  │  Operation 子类                                                     │    │</span></span>
<span class="line"><span>│  │  ┌──────────────────────────────────────────────────────────────┐    │    │</span></span>
<span class="line"><span>│  │  │  BlockOperation                                                  │    │    │</span></span>
<span class="line"><span>│  │  │  • 使用 Block 作为任务                                        │    │    │</span></span>
<span class="line"><span>│  │  │  • 支持添加多个 Block（自动串行执行）                         │    │    │</span></span>
<span class="line"><span>│  │  │  • 创建：BlockOperation(block: { })                            │    │    │</span></span>
<span class="line"><span>│  │  │                                                                   │    │    │</span></span>
<span class="line"><span>│  │  │  ClosureOperation (第三方)                                       │    │    │</span></span>
<span class="line"><span>│  │  │  • 更简洁的 Closure 封装                                      │    │    │</span></span>
<span class="line"><span>│  │  │  • 支持 async/await                                            │    │    │</span></span>
<span class="line"><span>│  │  └──────────────────────────────────────────────────────────────┘    │    │</span></span>
<span class="line"><span>│  │                                                                      │    │</span></span>
<span class="line"><span>│  │  OperationQueue                                                        │    │</span></span>
<span class="line"><span>│  │  ┌──────────────────────────────────────────────────────────────┐    │    │</span></span>
<span class="line"><span>│  │  │  • maxConcurrentOperationCount: 最大并发数                    │    │    │</span></span>
<span class="line"><span>│  │  │    • 1 = 串行（一次一个）                                     │    │    │</span></span>
<span class="line"><span>│  │  │    • 默认 = 系统推荐值（通常 4-8）                             │    │    │</span></span>
<span class="line"><span>│  │  │    • 0 或 -1 = 无限制                                         │    │    │</span></span>
<span class="line"><span>│  │  │                                                                   │    │    │</span></span>
<span class="line"><span>│  │  │  • operations: 当前队列中的 Operation                        │    │    │</span></span>
<span class="line"><span>│  │  │  • operationCount: 队列中的 Operation 数量                    │    │    │</span></span>
<span class="line"><span>│  │  │  • isSuspended: 是否暂停                                      │    │    │</span></span>
<span class="line"><span>│  │  │  • queuePriority: 队列优先级                                  │    │    │</span></span>
<span class="line"><span>│  │  │  • cancelAllOperations(): 取消所有任务                         │    │    │</span></span>
<span class="line"><span>│  │  │  • waitUntilAllOperationsAreFinished(): 等待所有任务完成       │    │    │</span></span>
<span class="line"><span>│  │  │  • addOperation(operations:): 批量添加                        │    │    │</span></span>
<span class="line"><span>│  │  │  • addOperations(operations, wait:): 批量添加（可选等待）      │    │    │</span></span>
<span class="line"><span>│  │  └──────────────────────────────────────────────────────────────┘    │    │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘    │    │</span></span>
<span class="line"><span>│                                                                      │    │</span></span>
<span class="line"><span>│  Operation 生命周期：                                                   │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span>│  │                                                              │      │</span></span>
<span class="line"><span>│  │  New → Ready → Executing → Finished                          │      │</span></span>
<span class="line"><span>│  │       → Cancelled                                            │      │</span></span>
<span class="line"><span>│  │                                                              │      │</span></span>
<span class="line"><span>│  │  • New: Operation 创建                                    │      │</span></span>
<span class="line"><span>│  │  • Ready: 满足依赖条件，队列可以执行                         │      │</span></span>
<span class="line"><span>│  │  • Executing: 正在执行（start() 被调用）                     │      │</span></span>
<span class="line"><span>│  │  • Cancelled: 被取消（isCancelled = true）                   │      │</span></span>
<span class="line"><span>│  │  • Finished: 执行完成（isFinished = true）                   │      │</span></span>
<span class="line"><span>│  │                                                              │      │</span></span>
<span class="line"><span>│  │  状态转换：                                                    │      │</span></span>
<span class="line"><span>│  │  • isReady: 依赖的 Operation 完成 → true                     │      │</span></span>
<span class="line"><span>│  │  • isExecuting: start() 调用 → true, didStart() 调用       │      │</span></span>
<span class="line"><span>│  │  • isFinished: 任务完成 → true, finish() 调用              │      │</span></span>
<span class="line"><span>│  │  • isCancelled: cancel() 调用 → true                        │      │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_2-2-operation-深度-api" tabindex="-1">2.2 Operation 深度 API <a class="header-anchor" href="#_2-2-operation-深度-api" aria-label="Permalink to &quot;2.2 Operation 深度 API&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Operation 核心 API：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 1. 创建 Operation                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // BlockOperation（最常用）                                  │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let op = BlockOperation {                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;Block task&quot;)                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 添加多个 Block（串行执行）                               │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.addExecutionBlock { print(&quot;Block 2&quot;) }                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.addExecutionBlock { print(&quot;Block 3&quot;) }                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 自定义 Operation（推荐用于复杂任务）                     │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  class MyOperation: Operation {                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      private var _isExecuting = false {                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          willSet { willChangeValue(forKey: &quot;isExecuting&quot;) } │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          didSet { didChangeValue(forKey: &quot;isExecuting&quot;) }   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      var isExecuting: Bool { _isExecuting }                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      private var _isFinished = false {                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          willSet { willChangeValue(forKey: &quot;isFinished&quot;) }  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          didSet { didChangeValue(forKey: &quot;isFinished&quot;) }    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      var isFinished: Bool { _isFinished }                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      override var isReady: Bool { super.isReady }          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      override var isConcurrent: Bool { true }              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      override func start() {                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          guard !isCancelled else { return }                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          _isExecuting = true                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          main()                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      func main() {                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          // 执行任务                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          _isExecuting = false                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          _isFinished = true                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 2. 任务依赖                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // Operation 依赖（有向无环图）                               │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let op1 = BlockOperation { print(&quot;Task 1&quot;) }               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let op2 = BlockOperation { print(&quot;Task 2&quot;) }               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let op3 = BlockOperation { print(&quot;Task 3&quot;) }               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op2.addDependency(op1)  // op2 依赖 op1                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op3.addDependency(op1)  // op3 依赖 op1                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op3.addDependency(op2)  // op3 依赖 op2（op1 → op2 → op3）  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // ⚠️ 注意：                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 依赖必须在同一队列中                                     │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 不能形成循环依赖（会永久阻塞）                            │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 依赖检查在队列中同步                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 3. 优先级                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // Operation 优先级（影响调度顺序）                          │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.queuePriority = .aboveNormal                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.qualityOfService = .userInitiated                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  优先级常量：                                                 │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .veryLow    — 最低                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .low      — 低                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .normal   — 默认（0）                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .aboveNormal — 高                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .belowNormal — 高于默认                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • .high     — 最高（8）                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 4. 取消 Operation                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 优雅取消                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.cancel()                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 检查取消状态                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  if op.isCancelled { return }                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 优雅取消策略：                                            │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 检查 isCancelled                                          │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 设置标志位中断长时间循环                                    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 不立即终止（可能泄漏资源）                                 │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 使用 DispatchWorkItem.cancel() 取消异步任务              │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 5. 最大并发数                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.maxConcurrentOperationCount = 4  // 最多 4 个并发      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.maxConcurrentOperationCount = 1  // 串行              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  queue.maxConcurrentOperationCount = 0  // 系统推荐值         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 性能影响：                                               │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 最大并发数影响内存占用                                    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 最大并发数影响 CPU 利用率                                 │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 过大并发数会导致资源竞争                                  │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 建议：根据任务类型设置不同队列                            │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 6. 完成处理                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 传统方式：KVO 观察                                      │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.addObserver(forKeyPath: &quot;isFinished&quot;, options: .new) {   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;完成&quot;)                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 现代方式：completionBlock                               │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  op.completionBlock = {                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;完成&quot;)                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // ⚠️ 注意：                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • completionBlock 在 Operation 完成的线程执行                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 如果需要主线程执行，需要 dispatch                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 7. 错误处理                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // Operation 本身不支持错误抛出                              │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 解决方案：                                                │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 1. 使用 Result/错误类型                                    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 2. 使用 completionBlock 传递错误                           │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 3. 使用 Operation 子类封装错误处理                          │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  class ErrorHandlingOperation: Operation {                   │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      enum TaskError: Error {                                │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          case network, parsing, timeout                     │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      var error: TaskError?                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      var result: String?                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      override func main() {                                │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          guard !isCancelled else { return }                 │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          do {                                               │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              // 执行任务                                       │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              try execute()                                   │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              result = &quot;success&quot;                              │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          } catch {                                          │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              error = .network                                │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          }                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_3-gcd-vs-operation-对比分析" tabindex="-1">3. GCD vs Operation 对比分析 <a class="header-anchor" href="#_3-gcd-vs-operation-对比分析" aria-label="Permalink to &quot;3. GCD vs Operation 对比分析&quot;">​</a></h2><h3 id="_3-1-全面对比表" tabindex="-1">3.1 全面对比表 <a class="header-anchor" href="#_3-1-全面对比表" aria-label="Permalink to &quot;3.1 全面对比表&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>GCD vs Operation 对比：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  特性            │  GCD                       │  Operation              │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  抽象层级        │  C API（底层）             │  Objective-C 对象（高层）  │</span></span>
<span class="line"><span>│  任务创建        │  闭包（block）               │  Operation 子类            │</span></span>
<span class="line"><span>│  依赖管理        │  ❌ 不支持                   │  ✅ 支持（有向无环图）    │</span></span>
<span class="line"><span>│  取消机制        │  ❌ 无原生支持               │  ✅ isCancelled            │</span></span>
<span class="line"><span>│  优先级          │  QoS（自动）                │  queuePriority + QoS       │</span></span>
<span class="line"><span>│  最大并发        │  系统决定                    │  maxConcurrentOperationCount │</span></span>
<span class="line"><span>│  生命周期        │  无状态                      │  New→Ready→Executing→Finished │</span></span>
<span class="line"><span>│  KVO            │  ❌                         │  ✅ isFinished / isExecuting │</span></span>
<span class="line"><span>│  错误处理        │  返回值 / 闭包              │  Result / completionBlock  │</span></span>
<span class="line"><span>│  线程安全        │  dispatch_sync / semaphore   │  Operation 内部              │</span></span>
<span class="line"><span>│  调试            │  Instruments / Xcode          │  Instruments / Xcode       │</span></span>
<span class="line"><span>│  自定义          │  有限                        │  完全自定义（子类）          │</span></span>
<span class="line"><span>│  网络集成        │  DispatchQueue.global         │  URLSession + Operation    │</span></span>
<span class="line"><span>│  内存管理        │  自动（闭包自动释放）         │  ARC                       │</span></span>
<span class="line"><span>│  适用场景        │  简单并发任务                │  复杂任务调度                │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>选择指南：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  场景                  │  推荐选择         │  原因               │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  简单异步任务           │  GCD              │  轻量、快速            │</span></span>
<span class="line"><span>│  依赖关系                │  Operation        │  原生支持依赖           │</span></span>
<span class="line"><span>│  取消控制               │  Operation        │  优雅取消              │</span></span>
<span class="line"><span>│  优先级管理             │  两者皆可         │  按需选择              │</span></span>
<span class="line"><span>│  网络请求队列           │  Operation        │  依赖 + 取消           │</span></span>
<span class="line"><span>│  大量简单并发           │  GCD              │  性能更佳             │</span></span>
<span class="line"><span>│  自定义任务生命周期     │  Operation        │  生命周期管理           │</span></span>
<span class="line"><span>│  数据转换管道           │  两者皆可         │  按复杂度选择          │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_4-并发性能分析与优化" tabindex="-1">4. 并发性能分析与优化 <a class="header-anchor" href="#_4-并发性能分析与优化" aria-label="Permalink to &quot;4. 并发性能分析与优化&quot;">​</a></h2><h3 id="_4-1-性能分析" tabindex="-1">4.1 性能分析 <a class="header-anchor" href="#_4-1-性能分析" aria-label="Permalink to &quot;4.1 性能分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>并发性能分析：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  优化策略            │  效果            │  适用场景           │</span></span>
<span class="line"><span>├──────────────────────┼──────────────────┼──────────────────┤</span></span>
<span class="line"><span>│  选择合适队列          │  避免不必要创建   │  所有场景          │</span></span>
<span class="line"><span>│  最小化队列数量        │  减少内存开销     │  大量并发           │</span></span>
<span class="line"><span>│  使用 Operation 依赖   │  避免死锁         │  依赖任务           │</span></span>
<span class="line"><span>│  限制最大并发          │  控制内存/CPU     │  大数据量           │</span></span>
<span class="line"><span>│  使用 GCD Source       │  系统级事件处理   │  文件/端口/信号     │</span></span>
<span class="line"><span>│  Dispatch Work Item    │  可取消异步任务   │  长时间任务         │</span></span>
<span class="line"><span>│  Concurrent 队列      │  最大化并行       │  独立任务           │</span></span>
<span class="line"><span>│  Barrier               │  线程安全写       │  共享数据            │</span></span>
<span class="line"><span>│  队列分组              │  简化等待         │  多任务聚合         │</span></span>
<span class="line"><span>│  QoS 匹配            │  优先级匹配       │  UI/后台混合        │</span></span>
<span class="line"><span>└──────────────────────┴──────────────────┴──────────────────┘</span></span></code></pre></div><hr><h2 id="_5-面试题汇总" tabindex="-1">5. 面试题汇总 <a class="header-anchor" href="#_5-面试题汇总" aria-label="Permalink to &quot;5. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: GCD 的队列类型和优先级？</strong></p><p><strong>答</strong>：</p><ul><li>队列类型：串行队列、并发队列、主队列</li><li>优先级（QoS）：userInteractive / userInitiated / default / utility / background</li><li>主队列是串行队列，与主线程关联</li><li>全局队列有 4 个优先级</li></ul><p><strong>Q2: Operation 的生命周期？</strong></p><p><strong>答</strong>：</p><ul><li>New → Ready → Executing → Finished</li><li>Cancelled 是可选中间状态</li><li>通过 KVO 观察状态变化</li><li>isReady 表示依赖满足且可执行</li></ul><p><strong>Q3: GCD 死锁产生的原因？</strong></p><p><strong>答</strong>：</p><ul><li>sync 到当前队列</li><li>主队列 sync 到主队列</li><li>解决：使用 async 或不同的队列</li></ul><p><strong>Q4: GCD vs Operation 的区别？</strong></p><p><strong>答</strong>：</p><ul><li>GCD 是 C API，Operation 是 Objective-C 对象</li><li>GCD 不支持依赖，Operation 支持</li><li>Operation 有优雅取消，GCD 没有</li><li>Operation 支持优先级和 KVO</li><li>GCD 性能更优，Operation 更灵活</li></ul><p><strong>Q5: Operation 的最大并发数如何设置？</strong></p><p><strong>答</strong>：</p><ul><li>maxConcurrentOperationCount</li><li>1 = 串行，&gt;1 = 并发，0/-1 = 系统默认</li><li>根据任务类型设置不同队列</li></ul><p><strong>Q6: GCD 的 Dispatch Source 有哪些类型？</strong></p><p><strong>答</strong>：</p><ul><li>timer、read、write、mach、signal、process</li><li>用于系统事件驱动编程</li><li>底层基于 Mach port</li></ul><hr><h2 id="_6-参考资源" tabindex="-1">6. 参考资源 <a class="header-anchor" href="#_6-参考资源" aria-label="Permalink to &quot;6. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/dispatch" target="_blank" rel="noreferrer">Apple: Grand Central Dispatch</a></li><li><a href="https://developer.apple.com/documentation/foundation/operation" target="_blank" rel="noreferrer">Apple: Operation Class Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/operationqueue" target="_blank" rel="noreferrer">Apple: OperationQueue Class Reference</a></li><li><a href="https://nshipster.com/dispatch" target="_blank" rel="noreferrer">NSHipster: Dispatch</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2017/705/" target="_blank" rel="noreferrer">WWDC 2017: What&#39;s New in Concurrent Programming</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2022/110260/" target="_blank" rel="noreferrer">WWDC 2022: Build a concurrent data pipeline with Swift</a></li></ul>`,47)])])}const d=a(l,[["render",e]]);export{A as __pageData,d as default};
