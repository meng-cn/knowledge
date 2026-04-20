import{_ as n,o as a,c as p,ae as l}from"./chunks/framework.Czhw_PXq.js";const d=JSON.parse('{"title":"02 - Swift Concurrency 全栈深度","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/02_Concurrency/02_Swift_Concurrency.md","filePath":"01-ios/02_Concurrency/02_Swift_Concurrency.md"}'),i={name:"01-ios/02_Concurrency/02_Swift_Concurrency.md"};function e(c,s,t,r,h,k){return a(),p("div",null,[...s[0]||(s[0]=[l(`<h1 id="_02-swift-concurrency-全栈深度" tabindex="-1">02 - Swift Concurrency 全栈深度 <a class="header-anchor" href="#_02-swift-concurrency-全栈深度" aria-label="Permalink to &quot;02 - Swift Concurrency 全栈深度&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-asyncawait-核心机制">async/await 核心机制</a></li><li><a href="#2-task-与-taskgroup-深度分析">Task 与 TaskGroup 深度分析</a></li><li><a href="#3-actor-深度分析">Actor 深度分析</a></li><li><a href="#4-sendable-深度分析">Sendable 深度分析</a></li><li><a href="#5-结构化并发">结构化并发</a></li><li><a href="#6-并发调试与测试">并发调试与测试</a></li><li><a href="#7-gcd-迁移到-async-await">GCD 迁移到 async-await</a></li><li><a href="#8-面试题汇总">面试题汇总</a></li></ol><hr><h2 id="_1-async-await-核心机制" tabindex="-1">1. async/await 核心机制 <a class="header-anchor" href="#_1-async-await-核心机制" aria-label="Permalink to &quot;1. async/await 核心机制&quot;">​</a></h2><h3 id="_1-1-async-await-原理" tabindex="-1">1.1 async/await 原理 <a class="header-anchor" href="#_1-1-async-await-原理" aria-label="Permalink to &quot;1.1 async/await 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>async/await 的核心机制：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  async/await 本质：                                                │</span></span>
<span class="line"><span>│  • async/await 不是线程，是异步编程的语法糖                         │</span></span>
<span class="line"><span>│  • 编译器将 async 函数转换为状态机（State Machine）                 │</span></span>
<span class="line"><span>│  • 函数在 await 点挂起，等待结果后恢复                              │</span></span>
<span class="line"><span>│  • 不创建新线程，只是异步调度                                         │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  async 函数与普通函数的区别：                                        │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  特性            │  普通函数           │  async 函数             │</span></span>
<span class="line"><span>│  ├─────────────────┼────────────────────┼────────────────────┤   │</span></span>
<span class="line"><span>│  │  执行方式        │  同步阻塞            │  异步非阻塞             │</span></span>
<span class="line"><span>│  │  返回值          │  T                  │  Task&lt;T&gt;               │</span></span>
<span class="line"><span>│  │  挂起            │  不能                │  可以                   │</span></span>
<span class="line"><span>│  │  线程            │  当前线程            │  可切换线程              │</span></span>
<span class="line"><span>│  │  开销            │  零                  │  状态机切换              │</span></span>
<span class="line"><span>│  └─────────────────┴────────────────────┴────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  async/await 的工作流程：                                            │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  func fetchData() async -&gt; Data {                              │</span></span>
<span class="line"><span>│  │      // 1. 异步函数开始执行                                    │</span></span>
<span class="line"><span>│  │      // 2. 遇到 await → 挂起当前协程                           │</span></span>
<span class="line"><span>│  │      let data = try await networkRequest()                      │</span></span>
<span class="line"><span>│  │      // 3. 网络请求完成 → 恢复协程                              │</span></span>
<span class="line"><span>│  │      // 4. 继续执行                                           │</span></span>
<span class="line"><span>│  │      return parse(data)                                       │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  async/await 调度流程：                                          │</span></span>
<span class="line"><span>│  │  ┌──────────────┐   ┌───────┐   ┌──────────┐   ┌───────┐       │</span></span>
<span class="line"><span>│  │  │ 执行 async   │──▶│ await │──▶│ 网络请求  │──▶│ 恢复   │       │</span></span>
<span class="line"><span>│  │  │ 函数         │   │ 挂起  │   │ (后台)   │   │ 继续  │       │</span></span>
<span class="line"><span>│  │  └─────────────┘   └───────┘   └──────────┘   └───────┘       │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  协程（Coroutine）：                                             │</span></span>
<span class="line"><span>│  │  • 轻量级线程（约 4KB 栈空间）                                  │</span></span>
<span class="line"><span>│  │  • 可手动挂起和恢复                                             │</span></span>
<span class="line"><span>│  │  • 协程池：系统维护的协程调度器                                 │</span></span>
<span class="line"><span>│  │  • Swift 并发使用 Continuation（延续）管理协程                  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  async/await 的性能分析：                                            │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 协程创建：约 4KB 栈空间（比线程 ~1MB 小得多）               │</span></span>
<span class="line"><span>│  │  • 协程挂起：O(1) 状态保存                                      │</span></span>
<span class="line"><span>│  │  • 协程恢复：O(1) 状态恢复                                      │</span></span>
<span class="line"><span>│  │  • async/await 比 GCD 更轻量                                   │</span></span>
<span class="line"><span>│  │  • 大量并发任务时，async/await 比 GCD 更节省内存                │</span></span>
<span class="line"><span>│  │  • 线程切换开销：async/await 在同一个线程池内                   │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_1-2-async-await-核心-api" tabindex="-1">1.2 async/await 核心 API <a class="header-anchor" href="#_1-2-async-await-核心-api" aria-label="Permalink to &quot;1.2 async/await 核心 API&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">async/await 核心 API：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 1. 基本 async/await                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // async 函数定义                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  func fetchData() async throws -&gt; Data {                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 异步返回 Data                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // await 调用                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let data = try await fetchData()                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 并发调用（并行执行）                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let (data1, data2) = try await withTaskGroup(of: Data.self) {  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      group.addTask { try await fetchData(id: 1) }              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      group.addTask { try await fetchData(id: 2) }              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      return (group.next()!, group.next()!)                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 超时                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let result = try await withTimeout(seconds: 5.0) {            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      try await fetchData()                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 错误处理                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  do {                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      let data = try await fetchData()                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  } catch {                                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(&quot;错误: \\(error)&quot;)                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // Task.detached（独立任务）                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Task.detached {                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 不在当前任务层级结构中                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 2. withCheckedContinuation / withUnsafeContinuation             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 桥接同步 API 到 async                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  func fetchData() async throws -&gt; Data {                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      return try await withCheckedContinuation { continuation in  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          networkRequest { data, error in                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              if let error = error {                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                  continuation.resume(throwing: error)            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              } else {                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                  continuation.resume(returning: data!)            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │              }                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          }                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // ⚠️ 注意：                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 必须调用 resume 一次                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 必须在任务上下文中调用                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 线程安全：resume 可在任何线程调用                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 3. async let（并行异步变量）                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // async let 创建并行任务                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  async let data1 = fetchData(id: 1)                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  async let data2 = fetchData(id: 2)                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 等待完成                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let result = try await (await data1, await data2)              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // async let 的取消                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Task {                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      async let result = heavyWork()                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      await result  // 等待完成                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }.cancel()  // 取消任务                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ⚠️ 注意：                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • async let 是结构化并发的基础                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 所有 async let 必须在当前 Task 中完成                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • async let 的父 Task 取消 → 子任务也取消                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 4. Task（任务创建）                                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 创建任务                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Task {                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 在独立线程中执行                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      await doWork()                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 任务层级关系                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Task {                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 父 Task                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      async let child1 = heavyWork1()                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      async let child2 = heavyWork2()                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 父 Task 取消 → child1/child2 也取消                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 任务优先级                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Task(priority: .userInitiated) {                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      await doWork()                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 任务分离（Detached Task）                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Task.detached(priority: .userInitiated) {                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      await doWork()                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // Task 的取消                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let task = Task {                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      await longWork()                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  task.cancel()  // 取消任务                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  await task.value  // 等待结果（取消后抛出 CancellationError）  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  // 5. async sequence（异步序列）                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // 异步迭代                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  for await item in asyncSequence {                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(item)                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // AsyncThrowingSequence                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  for try await item in throwingSequence {                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(item)                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // AsyncStream（异步流）                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  let stream = AsyncStream&lt;Int&gt; { continuation in                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      // 持续产出值                                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      for i in 0..&lt;100 {                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │          continuation.yield(i)                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      }                                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      continuation.finish()                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  // AsyncStream 的使用                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  for await value in stream {                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │      print(value)                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  }                                                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_2-task-与-taskgroup-深度分析" tabindex="-1">2. Task 与 TaskGroup 深度分析 <a class="header-anchor" href="#_2-task-与-taskgroup-深度分析" aria-label="Permalink to &quot;2. Task 与 TaskGroup 深度分析&quot;">​</a></h2><h3 id="_2-1-taskgroup-深度" tabindex="-1">2.1 TaskGroup 深度 <a class="header-anchor" href="#_2-1-taskgroup-深度" aria-label="Permalink to &quot;2.1 TaskGroup 深度&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TaskGroup 详解：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  withTaskGroup（通用任务组）                                          │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 创建任务组                                                  │</span></span>
<span class="line"><span>│  │  let results = try await withTaskGroup(of: Data.self) { group in  │</span></span>
<span class="line"><span>│  │      // 添加任务                                                │</span></span>
<span class="line"><span>│  │      for id in ids {                                            │</span></span>
<span class="line"><span>│  │          group.addTask {                                        │</span></span>
<span class="line"><span>│  │              try await fetchData(id: id)                          │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │      // 获取结果                                                │</span></span>
<span class="line"><span>│  │      var results: [Data] = []                                  │</span></span>
<span class="line"><span>│  │      for await result in group {                                │</span></span>
<span class="line"><span>│  │          results.append(result)                                  │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      return results                                             │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // withThrowingTaskGroup（可抛出）                            │</span></span>
<span class="line"><span>│  │  let results = try await withThrowingTaskGroup(of: Data.self) {  │</span></span>
<span class="line"><span>│  │      for id in ids {                                            │</span></span>
<span class="line"><span>│  │          group.addTask {                                        │</span></span>
<span class="line"><span>│  │              try fetchData(id: id)                                │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      var results: [Data] = []                                  │</span></span>
<span class="line"><span>│  │      for try await result in group {                            │</span></span>
<span class="line"><span>│  │          results.append(result)                                  │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      return results                                             │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // withThrowingTaskGroup（可抛出）                            │</span></span>
<span class="line"><span>│  │  let results = try await withThrowingTaskGroup(of: Data.self) {  │</span></span>
<span class="line"><span>│  │      for id in ids {                                            │</span></span>
<span class="line"><span>│  │          group.addTask {                                        │</span></span>
<span class="line"><span>│  │              try fetchData(id: id)                                │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      var results: [Data] = []                                  │</span></span>
<span class="line"><span>│  │      for try await result in group {                            │</span></span>
<span class="line"><span>│  │          results.append(result)                                  │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      return results                                             │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // withThrowingTaskGroup（可抛出）                            │</span></span>
<span class="line"><span>│  │  let results = try await withThrowingTaskGroup(of: Data.self) {  │</span></span>
<span class="line"><span>│  │      for id in ids {                                            │</span></span>
<span class="line"><span>│  │          group.addTask {                                        │</span></span>
<span class="line"><span>│  │              try fetchData(id: id)                                │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      var results: [Data] = []                                  │</span></span>
<span class="line"><span>│  │      for try await result in group {                            │</span></span>
<span class="line"><span>│  │          results.append(result)                                  │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      return results                                             │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  ⚠️ 注意事项：                                                    │</span></span>
<span class="line"><span>│  │  • 所有 addTask 必须在函数返回前完成                           │</span></span>
<span class="line"><span>│  │  • group 退出时自动 cancel 所有未完成任务                      │</span></span>
<span class="line"><span>│  │  • 返回时所有子任务必须完成                                     │</span></span>
<span class="line"><span>│  │  • 可以用 group.cancelAll() 手动取消所有任务                   │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  任务组类型对比：                                                   │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  类型                  │ 错误处理   │ 并发控制   │ 适用场景    │   │</span></span>
<span class="line"><span>│  ├───────────────────────────┼───────────┼───────────┼────────────┤   │</span></span>
<span class="line"><span>│  │  withTaskGroup       │ 手动      │ 手动      │ 简单并行  │   │</span></span>
<span class="line"><span>│  │  withThrowingTaskGroup │ 自动      │ 手动      │ 可抛出并行 │   │</span></span>
<span class="line"><span>│  │  withTaskGroup(of:)  │ 手动      │ 类型安全  │ 强类型并行 │   │</span></span>
<span class="line"><span>│  │  UncheckedTaskGroup  │ 无        │ 无        │ 特殊场景   │   │</span></span>
<span class="line"><span>│  └───────────────────────────┴───────────┴───────────┴────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  TaskGroup 的性能分析：                                              │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 任务创建：O(1)（协程栈 4KB）                                │</span></span>
<span class="line"><span>│  │  • 任务添加：O(1)                                               │</span></span>
<span class="line"><span>│  │  • 任务执行：系统调度（自动负载均衡）                            │</span></span>
<span class="line"><span>│  │  • 结果获取：O(n)（遍历结果）                                   │</span></span>
<span class="line"><span>│  │  • 内存：每个任务 4KB + 协程上下文                            │</span></span>
<span class="line"><span>│  │  • 与 GCD 对比：async/await 更轻量                           │</span></span>
<span class="line"><span>│  └───────────────────────────┴───────────┴───────────┴────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_3-actor-深度分析" tabindex="-1">3. Actor 深度分析 <a class="header-anchor" href="#_3-actor-深度分析" aria-label="Permalink to &quot;3. Actor 深度分析&quot;">​</a></h2><h3 id="_3-1-actor-原理" tabindex="-1">3.1 Actor 原理 <a class="header-anchor" href="#_3-1-actor-原理" aria-label="Permalink to &quot;3.1 Actor 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Actor 深度分析：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Actor 核心概念：                                                  │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  Actor 是 Swift 6 并发模型的核心                              │</span></span>
<span class="line"><span>│  │  • Actor 是一种引用类型（类似 class）                          │</span></span>
<span class="line"><span>│  │  • Actor 内部状态自动线程安全                                  │</span></span>
<span class="line"><span>│  │  • Actor 的方法调用是异步的                                   │</span></span>
<span class="line"><span>│  │  • Actor 隔离了可变状态                                        │</span></span>
<span class="line"><span>│  │  • Actor 不能有继承（单一隔离保障）                              │</span></span>
<span class="line"><span>│  │  • Actor 的方法只能在 actor 内部调用                          │</span></span>
<span class="line"><span>│  │  • 跨 actor 调用必须是 async                                   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Actor 的基本用法：                                                  │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 定义 Actor                                                  │</span></span>
<span class="line"><span>│  │  actor Cache {                                                  │</span></span>
<span class="line"><span>│  │      private var store = [String: Any]()                       │</span></span>
<span class="line"><span>│  │      private let lock = NSLock()                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │      func get(key: String) -&gt; Any? {                          │</span></span>
<span class="line"><span>│  │          // 自动串行执行，无需手动加锁                          │</span></span>
<span class="line"><span>│  │          return store[key]                                     │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │      func set(key: String, value: Any) {                      │</span></span>
<span class="line"><span>│  │          store[key] = value                                     │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │      func remove(key: String) -&gt; Any? {                       │</span></span>
<span class="line"><span>│  │          return store.removeValue(forKey: key)                  │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 使用 Actor                                                  │</span></span>
<span class="line"><span>│  │  let cache = Cache()                                            │</span></span>
<span class="line"><span>│  │  await cache.set(key: &quot;user&quot;, value: userData)                 │</span></span>
<span class="line"><span>│  │  let value = await cache.get(key: &quot;user&quot;)                      │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // Actor 的串行执行保证：                                      │</span></span>
<span class="line"><span>│  │  // • 同一 Actor 的方法调用不会并发执行                         │</span></span>
<span class="line"><span>│  │  // • 外部调用必须是 async                                       │</span></span>
<span class="line"><span>│  │  // • 内部调用可以同步（同一线程）                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // Actor 继承 Actor（不是 class）                              │</span></span>
<span class="line"><span>│  │  actor BaseCache: AnyObject {                                   │</span></span>
<span class="line"><span>│  │      func clear() { /* 清空缓存 */ }                            │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  actor LRUCache: BaseCache {                                   │</span></span>
<span class="line"><span>│  │      // 可以继承 BaseCache 的 actor 方法                        │</span></span>
<span class="line"><span>│  │      override func clear() { /* LRU 清空 */ }                  │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Actor 隔离与全局 Actor：                                            │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 全局 Actor（@MainActor）                                  │</span></span>
<span class="line"><span>│  │  @MainActor                                                   │</span></span>
<span class="line"><span>│  │  func updateUI() {                                            │</span></span>
<span class="line"><span>│  │      // 永远在主线程执行                                       │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // Actor 隔离                                             │</span></span>
<span class="line"><span>│  │  actor Cache {                                                 │</span></span>
<span class="line"><span>│  │      func get(key: String) -&gt; Any? {                         │</span></span>
<span class="line"><span>│  │          // 只能在 actor 内部或 async 调用                      │</span></span>
<span class="line"><span>│  │          return store[key]                                     │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      func set(key: String, value: Any) {                      │</span></span>
<span class="line"><span>│  │          store[key] = value                                     │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // @unchecked Sendable                                       │</span></span>
<span class="line"><span>│  │  struct UnsafeCache: @unchecked Sendable {                     │</span></span>
<span class="line"><span>│  │      private var store = [String: Any]()                       │</span></span>
<span class="line"><span>│  │      // 手动保证线程安全                                       │</span></span>
<span class="line"><span>│  │      private let lock = NSLock()                              │</span></span>
<span class="line"><span>│  │      func get(key: String) -&gt; Any? {                          │</span></span>
<span class="line"><span>│  │          lock.lock()                                            │</span></span>
<span class="line"><span>│  │          defer { lock.unlock() }                               │</span></span>
<span class="line"><span>│  │          return store[key]                                     │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // Actor 的同步方法（内部调用）                               │</span></span>
<span class="line"><span>│  │  actor Cache {                                                 │</span></span>
<span class="line"><span>│  │      func synchronizedOperation() {                           │</span></span>
<span class="line"><span>│  │          // 在 actor 内部调用，不需要 async                     │</span></span>
<span class="line"><span>│  │          let value = get(key: &quot;test&quot;)                          │</span></span>
<span class="line"><span>│  │          set(key: &quot;test&quot;, value: &quot;new&quot;)                        │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Actor 的性能分析：                                                  │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • Actor 调用开销：O(1)（协程调度）                            │</span></span>
<span class="line"><span>│  │  • Actor 隔离：编译期生成异步包装器                           │</span></span>
<span class="line"><span>│  │  • 串行保证：同一 Actor 的方法串行执行                        │</span></span>
<span class="line"><span>│  │  • 性能：比手动加锁更高效（零锁开销）                          │</span></span>
<span class="line"><span>│  │  • 内存：每个 Actor ~4KB                                      │</span></span>
<span class="line"><span>│  │  • 死锁：不可能（编译器保证）                                  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Actor vs 锁的对比：                                               │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  特性              │  Actor               │  手动锁            │   │</span></span>
<span class="line"><span>│  ├───────────────────────┼───────────────────┼──────────────────┤   │</span></span>
<span class="line"><span>│  │  线程安全          │ ✅ 自动              │  ❌ 手动            │   │</span></span>
<span class="line"><span>│  │  死锁风险          │ ✅ 编译器保证        │  ❌ 可能死锁        │   │</span></span>
<span class="line"><span>│  │  性能              │ ✅ 高（协程调度）     │  ⚠️ 低（锁竞争）     │   │</span></span>
<span class="line"><span>│  │  可维护性          │ ✅ 高（结构化并发）   │  ❌ 低（手动管理）   │   │</span></span>
<span class="line"><span>│  │  调试              │ ✅ 编译期检查         │  ❌ 运行时问题       │   │</span></span>
<span class="line"><span>│  └───────────────────────┴───────────────────┴──────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_4-sendable-深度分析" tabindex="-1">4. Sendable 深度分析 <a class="header-anchor" href="#_4-sendable-深度分析" aria-label="Permalink to &quot;4. Sendable 深度分析&quot;">​</a></h2><h3 id="_4-1-sendable-原理" tabindex="-1">4.1 Sendable 原理 <a class="header-anchor" href="#_4-1-sendable-原理" aria-label="Permalink to &quot;4.1 Sendable 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Sendable 深度分析（Swift 6 核心）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Sendable 的核心：                                                 │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • Sendable 是一个标记协议（零方法）                       │</span></span>
<span class="line"><span>│  │  • 标记该类型可以在线程间安全传递                           │</span></span>
<span class="line"><span>│  │  • Swift 6 编译期检查数据隔离                             │</span></span>
<span class="line"><span>│  │  • 不是运行时的检查，是编译期的静态验证                      │</span></span>
<span class="line"><span>│  │  • 所有可变状态必须通过 Actor 或不可变类型处理               │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Sendable 的默认实现：                                              │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 自动实现 Sendable（值类型）                                  │</span></span>
<span class="line"><span>│  │  struct Point: Sendable {  // 自动遵循                        │</span></span>
<span class="line"><span>│  │      let x: Int                                                │</span></span>
<span class="line"><span>│  │      let y: Int                                                │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 自动实现 Sendable（不可变引用类型）                          │</span></span>
<span class="line"><span>│  │  final class Config: Sendable {  // 自动遵循                   │</span></span>
<span class="line"><span>│  │      let value: String                                           │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 需要手动实现（复杂类型）                                    │</span></span>
<span class="line"><span>│  │  class Cache: Sendable {                                        │</span></span>
<span class="line"><span>│  │      // ⚠️ 需要手动保证线程安全                               │</span></span>
<span class="line"><span>│  │      // @unchecked Sendable 绕过编译检查                        │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // Sendable 的约束                                            │</span></span>
<span class="line"><span>│  │  • 值类型：默认 Sendable（所有属性 Sendable）                   │</span></span>
<span class="line"><span>│  │  • 引用类型：需要显式实现或 @unchecked Sendable              │</span></span>
<span class="line"><span>│  │  • 类属性必须是不可变或 Sendable                              │</span></span>
<span class="line"><span>│  │  • 闭包不能捕获可变非 Sendable 值                           │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Sendable 的检查规则：                                              │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 正确：                                                     │</span></span>
<span class="line"><span>│  │  struct SafeData: Sendable {  // ✅ 自动符合                   │</span></span>
<span class="line"><span>│  │      let value: String                                         │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 错误：                                                     │</span></span>
<span class="line"><span>│  │  class UnsafeCache {                                           │</span></span>
<span class="line"><span>│  │      var store = [String: Any]()  // ❌ 可变非 Sendable        │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 解决方案：                                                 │</span></span>
<span class="line"><span>│  │  final class SafeCache: Sendable {                             │</span></span>
<span class="line"><span>│  │      private let store: [String: Any]                           │</span></span>
<span class="line"><span>│  │      init(store: [String: Any]) {  // 不可变                   │</span></span>
<span class="line"><span>│  │          self.store = store                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // @unchecked Sendable（手动保证）                           │</span></span>
<span class="line"><span>│  │  class ManualCache: @unchecked Sendable {                      │</span></span>
<span class="line"><span>│  │      private var store = [String: Any]()                       │</span></span>
<span class="line"><span>│  │      private let lock = NSLock()                              │</span></span>
<span class="line"><span>│  │      func get(key: String) -&gt; Any? {                          │</span></span>
<span class="line"><span>│  │          lock.lock()                                            │</span></span>
<span class="line"><span>│  │          defer { lock.unlock() }                               │</span></span>
<span class="line"><span>│  │          return store[key]                                     │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Sendable 性能分析：                                                │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 编译期检查：零运行时开销                                     │</span></span>
<span class="line"><span>│  │  • @unchecked Sendable：零开销（绕过检查）                     │</span></span>
<span class="line"><span>│  │  • Sendable 协议：零开销（标记协议）                            │</span></span>
<span class="line"><span>│  │  • 编译器优化：可安全删除数据                                   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_5-结构化并发" tabindex="-1">5. 结构化并发 <a class="header-anchor" href="#_5-结构化并发" aria-label="Permalink to &quot;5. 结构化并发&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>结构化并发（Structured Concurrency）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  核心概念：                                                         │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 任务有明确的生命周期                                        │</span></span>
<span class="line"><span>│  │  • 子任务的生命周期依赖于父任务                                  │</span></span>
<span class="line"><span>│  │  • 父任务等待子任务完成                                        │</span></span>
<span class="line"><span>│  │  • 父任务取消 → 子任务也取消                                   │</span></span>
<span class="line"><span>│  │  • 父任务无法返回直到子任务完成                                 │</span></span>
<span class="line"><span>│  │  • 防止泄漏和孤儿任务                                          │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  结构化并发的三个原则：                                         │</span></span>
<span class="line"><span>│  │  1. 每个任务都有明确的父任务                                    │</span></span>
<span class="line"><span>│  │  2. 子任务在父任务作用域内创建                                   │</span></span>
<span class="line"><span>│  │  3. 父任务在返回前等待子任务完成                                │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  结构化并发的生命周期：                                          │</span></span>
<span class="line"><span>│  │  ┌──────────────────────┐                                      │</span></span>
<span class="line"><span>│  │  │ 父 Task               │                                      │</span></span>
<span class="line"><span>│  │  │  ┌────────────────┐  │                                      │</span></span>
<span class="line"><span>│  │  │  │ 子 Task 1       │  │                                      │</span></span>
<span class="line"><span>│  │  │  │  ┌───────────┐  │  │                                      │</span></span>
<span class="line"><span>│  │  │  │  │ 子 Task 1a│  │  │                                      │</span></span>
<span class="line"><span>│  │  │  │  └───────────┘  │  │                                      │</span></span>
<span class="line"><span>│  │  │  └─────────────────┘  │                                      │</span></span>
<span class="line"><span>│  │  │  ┌────────────────┐  │                                      │</span></span>
<span class="line"><span>│  │  │  │ 子 Task 2       │  │                                      │</span></span>
<span class="line"><span>│  │  │  └─────────────────┘  │                                      │</span></span>
<span class="line"><span>│  │  └─────────────────────┘                                      │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  父任务取消 → 子任务 1a → 子任务 1 → 子任务 2 全部取消          │</span></span>
<span class="line"><span>│  │  父任务等待所有子任务完成 → 返回                                  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  结构化并发的 API：                                                  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // withTaskGroup: 并行执行多个任务                            │</span></span>
<span class="line"><span>│  │  let results = try await withTaskGroup(of: Data.self) { group in  │</span></span>
<span class="line"><span>│  │      for id in ids {                                            │</span></span>
<span class="line"><span>│  │          group.addTask {                                        │</span></span>
<span class="line"><span>│  │              try await fetchData(id: id)                          │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      var results: [Data] = []                                  │</span></span>
<span class="line"><span>│  │      for await result in group {                                │</span></span>
<span class="line"><span>│  │          results.append(result)                                  │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      return results                                             │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 与 async let 对比：                                        │</span></span>
<span class="line"><span>│  │  async let a = fetchData(id: 1)                                 │</span></span>
<span class="line"><span>│  │  async let b = fetchData(id: 2)                                 │</span></span>
<span class="line"><span>│  │  let results = try await (await a, await b)                    │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // withTaskGroup vs async let 对比：                          │</span></span>
<span class="line"><span>│  │  ┌───────┬───────────────────────┬───────────────────────┐      │</span></span>
<span class="line"><span>│  │  │ 特性   │  withTaskGroup        │  async let              │      │</span></span>
<span class="line"><span>│  │  ├───────┼───────────────────────┼───────────────────────┤      │</span></span>
<span class="line"><span>│  │  │ 动态数量 │ ✅ 支持               │  ❌ 编译期确定           │      │</span></span>
<span class="line"><span>│  │  │ 性能    │ ✅ 高                 │  ✅ 高                  │      │</span></span>
<span class="line"><span>│  │  │ 灵活性   │ ✅ 高                 │  ⚠️ 有限                │      │</span></span>
<span class="line"><span>│  │  │ 可读性   │ ⚠️ 中等               │  ✅ 高                  │      │</span></span>
<span class="line"><span>│  │  │ 取消    │ ✅ 父任务取消 → 子任务  │  ✅ 父任务取消 → 子任务   │      │</span></span>
<span class="line"><span>│  │  └───────┴───────────────────────┴───────────────────────┘      │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  结构化并发 vs 非结构化并发：                                        │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  特性          │  结构化（withTaskGroup/async let）  │  非结构化（Task）     │   │</span></span>
<span class="line"><span>│  │  ├─────────────┼───────────────────────────────┼────────────────────┤   │</span></span>
<span class="line"><span>│  │  生命周期      │ 自动管理                        │ 手动管理            │   │</span></span>
<span class="line"><span>│  │  取消传播      │ ✅ 自动                          │  ❌ 手动            │   │</span></span>
<span class="line"><span>│  │  错误传播      │ ✅ 自动                          │  ⚠️ 手动            │   │</span></span>
<span class="line"><span>│  │  内存安全      │ ✅ 编译期检查                    │  ⚠️ 运行时          │   │</span></span>
<span class="line"><span>│  │  适用场景      │ 确定数量的任务                    │ 动态/后台任务       │   │</span></span>
<span class="line"><span>│  │  性能          │ ✅ 高                            │  ✅ 高              │   │</span></span>
<span class="line"><span>│  └─────────────┴───────────────────────────────┴────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_6-并发调试与测试" tabindex="-1">6. 并发调试与测试 <a class="header-anchor" href="#_6-并发调试与测试" aria-label="Permalink to &quot;6. 并发调试与测试&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>并发调试与测试：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  并发调试工具：                                                     │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  1. Thread Sanitizer（TSan）                              │   │</span></span>
<span class="line"><span>│  │     • 检测数据竞争（Data Race）                            │   │</span></span>
<span class="line"><span>│  │     • Xcode → Product → Profile → Thread Sanitizer          │   │</span></span>
<span class="line"><span>│  │     • 运行时检查，不添加代码                                │   │</span></span>
<span class="line"><span>│  │                                                                  │   │</span></span>
<span class="line"><span>│  │  2. Xcode Concurrency Mode                                │   │</span></span>
<span class="line"><span>│  │     • 启用并发模式检查                                     │   │</span></span>
<span class="line"><span>│  │     • Build Settings → Swift Concurrency                    │   │</span></span>
<span class="line"><span>│  │                                                                  │   │</span></span>
<span class="line"><span>│  │  3. OSLog 并发日志                                          │   │</span></span>
<span class="line"><span>│  │     • os_log 记录并发事件                                   │   │</span></span>
<span class="line"><span>│  │     • ActivityTracing 分析                                  │   │</span></span>
<span class="line"><span>│  │                                                                  │   │</span></span>
<span class="line"><span>│  │  4. Instruments                                            │   │</span></span>
<span class="line"><span>│  │     • Thread Debugger                                       │   │</span></span>
<span class="line"><span>│  │     • Time Profiler                                           │   │</span></span>
<span class="line"><span>│  │     • Allocation Tracker                                     │   │</span></span>
<span class="line"><span>│  │                                                                  │   │</span></span>
<span class="line"><span>│  │  ⚠️ 常见并发问题：                                          │   │</span></span>
<span class="line"><span>│  │  • Data Race：多线程同时读写同一个变量                        │   │</span></span>
<span class="line"><span>│  │  • Deadlock：任务互相等待                                    │   │</span></span>
<span class="line"><span>│  │  • Task Leaks：任务未正确取消                                │   │</span></span>
<span class="line"><span>│  │  • Task Cancellation：取消未正确传播                        │   │</span></span>
<span class="line"><span>│  │  • Task Priority：优先级未正确设置                            │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  并发测试策略：                                                     │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // XCTest + async/await                                    │</span></span>
<span class="line"><span>│  │  func testAsyncFunction() async {                            │</span></span>
<span class="line"><span>│  │      let result = try await fetchData()                       │</span></span>
<span class="line"><span>│  │      XCTAssertNotNil(result)                                   │</span></span>
<span class="line"><span>│  │      XCTAssertTrue(result.count &gt; 0)                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // 并发测试                                                 │</span></span>
<span class="line"><span>│  │  func testConcurrentAccess() async {                          │</span></span>
<span class="line"><span>│  │      let group = DispatchGroup()                               │</span></span>
<span class="line"><span>│  │      for _ in 0..&lt;100 {                                       │</span></span>
<span class="line"><span>│  │          group.enter()                                          │</span></span>
<span class="line"><span>│  │          Task {                                                │</span></span>
<span class="line"><span>│  │              await cache.set(key: &quot;test&quot;, value: &quot;value&quot;)       │</span></span>
<span class="line"><span>│  │              group.leave()                                       │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      group.wait()                                              │</span></span>
<span class="line"><span>│  │      let value = await cache.get(key: &quot;test&quot;)                 │</span></span>
<span class="line"><span>│  │      XCTAssertEqual(value, &quot;value&quot;)                            │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // Task 取消测试                                             │</span></span>
<span class="line"><span>│  │  func testCancellation() async {                              │</span></span>
<span class="line"><span>│  │      let task = Task {                                         │</span></span>
<span class="line"><span>│  │          try await Task.sleep(nanoseconds: 1_000_000_000)       │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      task.cancel()                                               │</span></span>
<span class="line"><span>│  │      do {                                                      │</span></span>
<span class="line"><span>│  │          try await task.value                                   │</span></span>
<span class="line"><span>│  │      } catch is CancellationError {                            │</span></span>
<span class="line"><span>│  │          XCTAssertTrue(true)  // ✅ 取消成功                   │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  ⚠️ 测试注意事项：                                          │   │</span></span>
<span class="line"><span>│  │  • 测试 async 函数需要 async 标记                              │   │</span></span>
<span class="line"><span>│  │  • XCTest 自动支持 async 测试                                   │   │</span></span>
<span class="line"><span>│  │  • 并发测试需要多次运行才能检测到数据竞争                       │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  性能分析：                                                       │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • async/await 性能：O(1) 协程切换                         │   │</span></span>
<span class="line"><span>│  │  • Actor 隔离性能：O(1) 协程调度                            │   │</span></span>
<span class="line"><span>│  │  • Task 创建性能：约 4KB/任务                               │   │</span></span>
<span class="line"><span>│  │  • 与 GCD 对比：async/await 更简洁、更安全                   │   │</span></span>
<span class="line"><span>│  │  • Swift 6 Sendable：编译期检查，零运行时开销               │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Swift 6 与 Swift 5 并发对比：                                     │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  特性              │  Swift 5 Concurrency      │  Swift 6       │   │</span></span>
<span class="line"><span>│  │  ├─────────────┼───────────────────────────┼───────────────┤   │</span></span>
<span class="line"><span>│  │  Sendable        │ 可选                    │ 强制检查        │   │</span></span>
<span class="line"><span>│  │  Data Isolation  │ 无                      │ 严格隔离        │   │</span></span>
<span class="line"><span>│  │  Actor           │ 可用但宽松               │ 严格隔离        │   │</span></span>
<span class="line"><span>│  │  编译期检查      │ 宽松                    │ 严格            │   │</span></span>
<span class="line"><span>│  │  兼容性           │ Swift 5.5+              │ Swift 6+        │   │</span></span>
<span class="line"><span>│  │  推荐           │ 逐步迁移到 Swift 6       │ 使用 Swift 6   │   │</span></span>
<span class="line"><span>│  └─────────────┴───────────────────────────┴───────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_7-gcd-迁移到-async-await" tabindex="-1">7. GCD 迁移到 async-await <a class="header-anchor" href="#_7-gcd-迁移到-async-await" aria-label="Permalink to &quot;7. GCD 迁移到 async-await&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>GCD 迁移到 async/await：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  迁移策略：                                                         │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // GCD 异步任务                                                │</span></span>
<span class="line"><span>│  │  DispatchQueue.global().async {                                │</span></span>
<span class="line"><span>│  │      let data = networkRequest()                               │</span></span>
<span class="line"><span>│  │      DispatchQueue.main.async {                                │</span></span>
<span class="line"><span>│  │          updateUI(data)                                         │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // → async/await                                              │</span></span>
<span class="line"><span>│  │  Task {                                                         │</span></span>
<span class="line"><span>│  │      let data = await networkRequest()                          │</span></span>
<span class="line"><span>│  │      Task { @MainActor in                                       │</span></span>
<span class="line"><span>│  │          updateUI(data)                                          │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // GCD 串行队列                                                 │</span></span>
<span class="line"><span>│  │  let queue = DispatchQueue(label: &quot;com.app.serial&quot;)             │</span></span>
<span class="line"><span>│  │  queue.async { firstTask() }                                    │</span></span>
<span class="line"><span>│  │  queue.async { secondTask() }                                  │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // → async/await（actor）                                      │</span></span>
<span class="line"><span>│  │  actor SerialQueue {                                            │</span></span>
<span class="line"><span>│  │      private var pending = [() -&gt; Void]()                       │</span></span>
<span class="line"><span>│  │      func execute(_ work: @escaping () -&gt; Void) {              │</span></span>
<span class="line"><span>│  │          pending.append(work)                                    │</span></span>
<span class="line"><span>│  │          processNext()                                            │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │      func processNext() {                                       │</span></span>
<span class="line"><span>│  │          guard let work = pending.first else { return }          │</span></span>
<span class="line"><span>│  │          pending.removeFirst()                                   │</span></span>
<span class="line"><span>│  │          work()                                                  │</span></span>
<span class="line"><span>│  │          processNext()                                            │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // GCD 信号量                                                  │</span></span>
<span class="line"><span>│  │  let semaphore = DispatchSemaphore(value: 0)                    │</span></span>
<span class="line"><span>│  │  queue.async {                                                   │</span></span>
<span class="line"><span>│  │      doWork()                                                    │</span></span>
<span class="line"><span>│  │      semaphore.signal()                                           │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │  semaphore.wait()                                               │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // → async/await（withCheckedContinuation）                    │</span></span>
<span class="line"><span>│  │  let result = try await withCheckedContinuation { continuation in  │</span></span>
<span class="line"><span>│  │      queue.async {                                               │</span></span>
<span class="line"><span>│  │          doWork()                                                │</span></span>
<span class="line"><span>│  │          continuation.resume()                                   │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // GCD 栅栏（barrier）                                          │</span></span>
<span class="line"><span>│  │  queue.async(flags: .barrier) { writeData() }                   │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // → async/await（actor 天然串行）                              │</span></span>
<span class="line"><span>│  │  actor DataStore {                                              │</span></span>
<span class="line"><span>│  │      func write(_ data: Data) {                                │</span></span>
<span class="line"><span>│  │          // 自动串行，天然屏障                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // GCD 任务组                                                  │</span></span>
<span class="line"><span>│  │  let group = DispatchGroup()                                    │</span></span>
<span class="line"><span>│  │  for id in ids {                                                │</span></span>
<span class="line"><span>│  │      group.enter()                                              │</span></span>
<span class="line"><span>│  │      queue.async {                                              │</span></span>
<span class="line"><span>│  │          fetchData(id: id)                                       │</span></span>
<span class="line"><span>│  │          group.leave()                                           │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │  group.notify(queue: .main) {                                   │</span></span>
<span class="line"><span>│  │      completeAll()                                              │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  // → async/await（withTaskGroup）                               │</span></span>
<span class="line"><span>│  │  await withTaskGroup(of: Data.self) { group in                │</span></span>
<span class="line"><span>│  │      for id in ids {                                            │</span></span>
<span class="line"><span>│  │          group.addTask {                                        │</span></span>
<span class="line"><span>│  │              try await fetchData(id: id)                          │</span></span>
<span class="line"><span>│  │          }                                                      │</span></span>
<span class="line"><span>│  │      }                                                          │</span></span>
<span class="line"><span>│  │  }                                                              │</span></span>
<span class="line"><span>│  │  completeAll()                                                  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  迁移收益：                                                         │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 代码更简洁：消除嵌套回调（Callback Hell）                   │   │</span></span>
<span class="line"><span>│  │  • 更安全：编译期检查（Sendable + Data Isolation）             │   │</span></span>
<span class="line"><span>│  │  • 更清晰：结构化并发保证任务生命周期                          │   │</span></span>
<span class="line"><span>│  │  • 更易调试：Task 取消自动传播                               │   │</span></span>
<span class="line"><span>│  │  • 性能：async/await 与 GCD 相当（协程 vs 线程池）            │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_8-面试题汇总" tabindex="-1">8. 面试题汇总 <a class="header-anchor" href="#_8-面试题汇总" aria-label="Permalink to &quot;8. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: async/await 的核心原理？</strong></p><p><strong>答</strong>：</p><ul><li>async/await 是异步编程的语法糖</li><li>编译器将 async 函数转换为状态机</li><li>在 await 点挂起，等待后恢复</li><li>使用协程（Coroutine），轻量级（约 4KB 栈空间）</li><li>不创建新线程，只是异步调度</li></ul><p><strong>Q2: TaskGroup 的工作原理？</strong></p><p><strong>答</strong>：</p><ul><li>创建多个并行任务</li><li>任务组自动管理任务生命周期</li><li>所有子任务完成后 group 退出</li><li>父任务取消 → 子任务也取消</li><li>支持并发、类型安全</li></ul><p><strong>Q3: Actor 的核心机制？</strong></p><p><strong>答</strong>：</p><ul><li>Actor 是引用类型，内部状态自动线程安全</li><li>Actor 的方法调用是异步的</li><li>同一 Actor 的方法串行执行（天然屏障）</li><li>跨 Actor 调用必须是 async</li><li>不能继承（保证隔离性）</li></ul><p><strong>Q4: Sendable 的作用？</strong></p><p><strong>答</strong>：</p><ul><li>标记类型可以在线程间安全传递</li><li>Swift 6 编译期检查数据隔离</li><li>值类型默认 Sendable</li><li>引用类型需要手动实现</li><li>编译期检查，零运行时开销</li></ul><p><strong>Q5: 结构化并发 vs 非结构化并发？</strong></p><p><strong>答</strong>：</p><ul><li>结构化：任务生命周期明确，自动传播取消</li><li>非结构化：手动管理，Task</li><li>推荐优先使用结构化并发</li><li>非结构化适用于后台/独立任务</li></ul><p><strong>Q6: GCD 迁移到 async/await 的收益？</strong></p><p><strong>答</strong>：</p><ul><li>代码更简洁（消除回调地狱）</li><li>更安全（编译期检查）</li><li>更清晰（结构化并发）</li><li>更易调试（任务取消自动传播）</li><li>性能相当</li></ul><hr><h2 id="_9-参考资源" tabindex="-1">9. 参考资源 <a class="header-anchor" href="#_9-参考资源" aria-label="Permalink to &quot;9. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/swift/concurrency" target="_blank" rel="noreferrer">Apple: Swift Concurrency</a></li><li><a href="https://www.swift.org/documentation/" target="_blank" rel="noreferrer">Apple: Swift 6 Migration Guide</a></li><li><a href="https://www.swift.org/blog/swift-concurrency/" target="_blank" rel="noreferrer">Apple: Structured Concurrency</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2021/10216/" target="_blank" rel="noreferrer">WWDC 2021: Meet Swift Concurrency</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2022/110260/" target="_blank" rel="noreferrer">WWDC 2022: Build concurrent data pipelines</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2023/722/" target="_blank" rel="noreferrer">WWDC 2023: Swift concurrency deep dive</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2024/10268/" target="_blank" rel="noreferrer">WWDC 2024: Swift concurrency best practices</a></li><li><a href="https://www.swiftbysundell.com/articles/swift-concurrency/" target="_blank" rel="noreferrer">Swift by Sundell: Swift Concurrency</a></li></ul>`,54)])])}const u=n(i,[["render",e]]);export{d as __pageData,u as default};
