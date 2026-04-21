import{_ as a,o as n,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"进程与线程管理","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/11_System/03_进程与线程管理.md","filePath":"04-harmonyos/11_System/03_进程与线程管理.md"}'),l={name:"04-harmonyos/11_System/03_进程与线程管理.md"};function t(i,s,o,r,c,d){return n(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="进程与线程管理" tabindex="-1">进程与线程管理 <a class="header-anchor" href="#进程与线程管理" aria-label="Permalink to &quot;进程与线程管理&quot;">​</a></h1><h2 id="_1-进程模型" tabindex="-1">1. 进程模型 <a class="header-anchor" href="#_1-进程模型" aria-label="Permalink to &quot;1. 进程模型&quot;">​</a></h2><h3 id="_1-1-鸿蒙进程模型概述" tabindex="-1">1.1 鸿蒙进程模型概述 <a class="header-anchor" href="#_1-1-鸿蒙进程模型概述" aria-label="Permalink to &quot;1.1 鸿蒙进程模型概述&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>进程模型层次：</span></span>
<span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  Application（应用）                  │</span></span>
<span class="line"><span>│  ├── UIAbility（UI 界面入口）          │</span></span>
<span class="line"><span>│  └── ExtensionAbility（扩展组件）     │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  Process（进程）                      │</span></span>
<span class="line"><span>│  ├── 应用进程（Application Process）   │</span></span>
<span class="line"><span>│  ├── 系统进程（System Process）        │</span></span>
<span class="line"><span>│  └── 服务进程（Service Process）       │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  Thread（线程）                      │</span></span>
<span class="line"><span>│  ├── UI 线程（主线程）                │</span></span>
<span class="line"><span>│  ├── Worker 线程（工作线程）           │</span></span>
<span class="line"><span>│  └── System Thread（系统线程）        │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-进程分类" tabindex="-1">1.2 进程分类 <a class="header-anchor" href="#_1-2-进程分类" aria-label="Permalink to &quot;1.2 进程分类&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类型</th><th>说明</th><th>优先级</th><th>生命周期</th></tr></thead><tbody><tr><td><strong>前台进程</strong></td><td>有正在交互的 UI</td><td>FOREGROUND（最高）</td><td>直到用户退出</td></tr><tr><td><strong>可见进程</strong></td><td>有可见但非交互的 UI</td><td>VISIBLE</td><td>直到不可见</td></tr><tr><td><strong>服务进程</strong></td><td>有后台服务运行</td><td>SERVICE</td><td>直到服务停止</td></tr><tr><td><strong>后台进程</strong></td><td>Activity 在后台（onBackground）</td><td>BACKGROUND</td><td>内存紧张时被杀</td></tr><tr><td><strong>空进程</strong></td><td>无活跃组件</td><td>EMPTY（最低）</td><td>立即可被杀</td></tr></tbody></table><h3 id="_1-3-与-android-进程模型对比" tabindex="-1">1.3 与 Android 进程模型对比 <a class="header-anchor" href="#_1-3-与-android-进程模型对比" aria-label="Permalink to &quot;1.3 与 Android 进程模型对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>Android</th><th>鸿蒙</th></tr></thead><tbody><tr><td>进程入口</td><td>Activity/Service</td><td>UIAbility/ExtensionAbility</td></tr><tr><td>进程隔离</td><td>UID 隔离</td><td>TokenID + 沙箱隔离</td></tr><tr><td>进程间通信</td><td>Binder</td><td>IPC (Port + MessageQueue)</td></tr><tr><td>进程优先级</td><td>5 级（foreground→empty）</td><td>6 级（含 process-group）</td></tr><tr><td>OOM Killer</td><td>Adj 值排序</td><td>重要性等级排序</td></tr><tr><td>多进程</td><td>声明式（android:process）</td><td>声明式（process 属性）</td></tr><tr><td>启动方式</td><td>fork + Zygote 连接</td><td>fork + Zygote Socket</td></tr></tbody></table><h2 id="_2-进程生命周期" tabindex="-1">2. 进程生命周期 <a class="header-anchor" href="#_2-进程生命周期" aria-label="Permalink to &quot;2. 进程生命周期&quot;">​</a></h2><h3 id="_2-1-uiability-进程状态转换" tabindex="-1">2.1 UIAbility 进程状态转换 <a class="header-anchor" href="#_2-1-uiability-进程状态转换" aria-label="Permalink to &quot;2.1 UIAbility 进程状态转换&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>         ┌──────────────┐</span></span>
<span class="line"><span>         │   已创建      │</span></span>
<span class="line"><span>         │  onCreate    │</span></span>
<span class="line"><span>         └──────┬───────┘</span></span>
<span class="line"><span>                │</span></span>
<span class="line"><span>         ┌──────▼───────┐       用户切出</span></span>
<span class="line"><span>         │   前台运行    │◄──────────┐</span></span>
<span class="line"><span>         │ onForeground │           │</span></span>
<span class="line"><span>         └──────┬───────┘           │</span></span>
<span class="line"><span>                │                    │</span></span>
<span class="line"><span>         ┌──────▼───────┐       重新切入</span></span>
<span class="line"><span>         │   后台暂停    │──────────►│</span></span>
<span class="line"><span>         │ onBackground │           │</span></span>
<span class="line"><span>         └──────┬───────┘           │</span></span>
<span class="line"><span>                │                    │</span></span>
<span class="line"><span>         ┌──────▼───────┐  长时间/低内存</span></span>
<span class="line"><span>         │    终止      │──────────►│</span></span>
<span class="line"><span>         │  onDestroy   │           │</span></span>
<span class="line"><span>         └──────────────┘           │</span></span></code></pre></div><h3 id="_2-2-进程保活策略" tabindex="-1">2.2 进程保活策略 <a class="header-anchor" href="#_2-2-进程保活策略" aria-label="Permalink to &quot;2.2 进程保活策略&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 鸿蒙进程保活机制</span></span>
<span class="line"><span>import { common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 提升进程优先级：启动前台服务</span></span>
<span class="line"><span>async function keepProcessAlive() {</span></span>
<span class="line"><span>  const foregroundService = {</span></span>
<span class="line"><span>    foregroundServiceType: &#39;common&#39;,</span></span>
<span class="line"><span>    notificationId: 1001,</span></span>
<span class="line"><span>    content: {</span></span>
<span class="line"><span>      title: &#39;服务运行中&#39;,</span></span>
<span class="line"><span>      text: &#39;后台任务执行中&#39;,</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>  await this.context.startForegroundService(foregroundService);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 使用 WorkScheduler 执行后台任务</span></span>
<span class="line"><span>import { workScheduler } from &#39;@kit.BusinessKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await workScheduler.scheduleAbility({</span></span>
<span class="line"><span>  bundleName: &#39;com.example.myapp&#39;,</span></span>
<span class="line"><span>  abilityName: &#39;BackgroundWorkAbility&#39;,</span></span>
<span class="line"><span>  type: workScheduler.WorkType.WORK_TYPE_PERIODIC,</span></span>
<span class="line"><span>  interval: 3600000, // 1 小时</span></span>
<span class="line"><span>  periodic: true,</span></span>
<span class="line"><span>});</span></span></code></pre></div><h3 id="_2-3-进程回收策略" tabindex="-1">2.3 进程回收策略 <a class="header-anchor" href="#_2-3-进程回收策略" aria-label="Permalink to &quot;2.3 进程回收策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>回收优先级（从高到低）：</span></span>
<span class="line"><span>1. 空进程 (EMPTY) — 可立即回收</span></span>
<span class="line"><span>2. 后台进程 (BACKGROUND) — 可回收</span></span>
<span class="line"><span>3. 服务进程 (SERVICE) — 谨慎回收，通知用户</span></span>
<span class="line"><span>4. 可见进程 (VISIBLE) — 仅在内存极紧张时</span></span>
<span class="line"><span>5. 前台进程 (FOREGROUND) — 几乎不回收</span></span>
<span class="line"><span></span></span>
<span class="line"><span>OOM 评分公式（简化）：</span></span>
<span class="line"><span>score = base_score + process_type_penalty + cpu_time_penalty</span></span></code></pre></div><h2 id="_3-线程模型-actor-模型" tabindex="-1">3. 线程模型（Actor 模型） <a class="header-anchor" href="#_3-线程模型-actor-模型" aria-label="Permalink to &quot;3. 线程模型（Actor 模型）&quot;">​</a></h2><h3 id="_3-1-arkts-线程模型" tabindex="-1">3.1 ArkTS 线程模型 <a class="header-anchor" href="#_3-1-arkts-线程模型" aria-label="Permalink to &quot;3.1 ArkTS 线程模型&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>鸿蒙采用 Actor 模型作为核心并发模型：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Actor 特性：</span></span>
<span class="line"><span>├── 线程隔离：每个 Actor 运行在独立线程上</span></span>
<span class="line"><span>├── 消息传递：通过消息队列通信，无共享内存</span></span>
<span class="line"><span>├── 无锁设计：不需要同步原语，避免死锁</span></span>
<span class="line"><span>├── 轻量级：线程创建开销低（~100μs）</span></span>
<span class="line"><span>└── 结构化：线程池统一管理</span></span></code></pre></div><h3 id="_3-2-taskpool-推荐方案" tabindex="-1">3.2 TaskPool（推荐方案） <a class="header-anchor" href="#_3-2-taskpool-推荐方案" aria-label="Permalink to &quot;3.2 TaskPool（推荐方案）&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// TaskPool 是系统管理的线程池，适合短时任务</span></span>
<span class="line"><span>import { taskpool } from &#39;@kit.ArkTaskPool&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 定义任务函数</span></span>
<span class="line"><span>@worker</span></span>
<span class="line"><span>function fetchData(url: string): string {</span></span>
<span class="line"><span>  // 在工作线程中执行网络请求</span></span>
<span class="line"><span>  return http.get(url).sync();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 TaskPool</span></span>
<span class="line"><span>async function loadData() {</span></span>
<span class="line"><span>  // 1. 注册任务</span></span>
<span class="line"><span>  await taskpool.register(fetchData);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2. 提交任务</span></span>
<span class="line"><span>  const promise = taskpool.run(fetchData, [&#39;https://api.example.com/data&#39;]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 3. 获取结果</span></span>
<span class="line"><span>  const result = await promise;</span></span>
<span class="line"><span>  console.log(&#39;Data: &#39; + result);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// TaskPool vs Worker 对比：</span></span>
<span class="line"><span>// TaskPool: 系统管理，自动调度，适合短时 (&lt; 5s) 任务</span></span>
<span class="line"><span>// Worker:   手动管理，适合长时 (&gt; 5s) 或常驻任务</span></span></code></pre></div><h3 id="_3-3-worker-长时任务" tabindex="-1">3.3 Worker（长时任务） <a class="header-anchor" href="#_3-3-worker-长时任务" aria-label="Permalink to &quot;3.3 Worker（长时任务）&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Worker 适合长时间运行或常驻任务</span></span>
<span class="line"><span>// 需要手动创建和管理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@worker</span></span>
<span class="line"><span>class MyWorker {</span></span>
<span class="line"><span>  private running: boolean = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  start() {</span></span>
<span class="line"><span>    this.running = true;</span></span>
<span class="line"><span>    while (this.running) {</span></span>
<span class="line"><span>      // 执行常驻任务</span></span>
<span class="line"><span>      this.processData();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  stop() {</span></span>
<span class="line"><span>    this.running = false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private processData() {</span></span>
<span class="line"><span>    // 处理数据</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 创建和销毁 Worker</span></span>
<span class="line"><span>const worker = new MyWorker();</span></span>
<span class="line"><span>worker.start();</span></span>
<span class="line"><span>// ... 完成时</span></span>
<span class="line"><span>worker.stop();</span></span></code></pre></div><h3 id="_3-4-线程池使用" tabindex="-1">3.4 线程池使用 <a class="header-anchor" href="#_3-4-线程池使用" aria-label="Permalink to &quot;3.4 线程池使用&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { thread } from &#39;@kit.ArkThread&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 获取系统线程池</span></span>
<span class="line"><span>const executor = thread.createExecutor();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 提交任务到线程池</span></span>
<span class="line"><span>const future = executor.submit(() =&gt; {</span></span>
<span class="line"><span>  // 异步任务</span></span>
<span class="line"><span>  return heavyComputation();</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 获取结果</span></span>
<span class="line"><span>const result = future.get(); // 阻塞等待</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 线程池资源释放</span></span>
<span class="line"><span>executor.shutdown();</span></span></code></pre></div><h3 id="_3-5-主线程与工作线程" tabindex="-1">3.5 主线程与工作线程 <a class="header-anchor" href="#_3-5-主线程与工作线程" aria-label="Permalink to &quot;3.5 主线程与工作线程&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// ⚠️ 关键规则：UI 操作只能在主线程进行</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct WorkerDemo {</span></span>
<span class="line"><span>  @State message: string = &#39;加载中...&#39;;</span></span>
<span class="line"><span>  @State isLoading: boolean = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  aboutToAppear() {</span></span>
<span class="line"><span>    // 在主线程：可以直接更新 @State</span></span>
<span class="line"><span>    this.message = &#39;开始加载&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 提交到工作线程</span></span>
<span class="line"><span>    taskpool.run(() =&gt; {</span></span>
<span class="line"><span>      // 工作线程：不能更新 @State</span></span>
<span class="line"><span>      const data = this.fetchFromServer();</span></span>
<span class="line"><span>      // ✅ 正确：通过 callback 回到主线程更新</span></span>
<span class="line"><span>      this.$emit(&#39;dataLoaded&#39;, data);</span></span>
<span class="line"><span>    }).catch((err: Error) =&gt; {</span></span>
<span class="line"><span>      // ✅ 正确：主线程中处理错误</span></span>
<span class="line"><span>      this.message = &#39;加载失败: &#39; + err.message;</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  fetchFromServer(): string {</span></span>
<span class="line"><span>    // 模拟网络请求</span></span>
<span class="line"><span>    return &#39;Server Data&#39;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_4-线程调度" tabindex="-1">4. 线程调度 <a class="header-anchor" href="#_4-线程调度" aria-label="Permalink to &quot;4. 线程调度&quot;">​</a></h2><h3 id="_4-1-调度策略" tabindex="-1">4.1 调度策略 <a class="header-anchor" href="#_4-1-调度策略" aria-label="Permalink to &quot;4.1 调度策略&quot;">​</a></h3><table tabindex="0"><thead><tr><th>策略</th><th>说明</th><th>适用场景</th></tr></thead><tbody><tr><td><strong>SCHED_OTHER</strong></td><td>CFS 公平调度（默认）</td><td>普通应用任务</td></tr><tr><td><strong>SCHED_FIFO</strong></td><td>实时先入先出</td><td>音视频处理</td></tr><tr><td><strong>SCHED_RR</strong></td><td>实时轮转调度</td><td>实时通信任务</td></tr><tr><td><strong>SCHED_DEADLINE</strong></td><td>截止期调度</td><td>严格实时任务</td></tr></tbody></table><h3 id="_4-2-线程优先级" tabindex="-1">4.2 线程优先级 <a class="header-anchor" href="#_4-2-线程优先级" aria-label="Permalink to &quot;4.2 线程优先级&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>优先级范围：0（最低）~ 127（最高）</span></span>
<span class="line"><span>────────────────────────────────────</span></span>
<span class="line"><span>SCHED_DEADLINE: 0-99（高优先）</span></span>
<span class="line"><span>SCHED_FIFO/RR:  0-99（高优先）</span></span>
<span class="line"><span>SCHED_OTHER:    -20~19（相对 Linux  nice）</span></span>
<span class="line"><span>────────────────────────────────────</span></span>
<span class="line"><span>系统限制：用户线程最高优先级 ≤ 63（防止饿死内核）</span></span></code></pre></div><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { thread } from &#39;@kit.ArkThread&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 创建高优先级线程</span></span>
<span class="line"><span>const highPriorityThread = await thread.startThread({</span></span>
<span class="line"><span>  name: &#39;high-priority-worker&#39;,</span></span>
<span class="line"><span>  prio: thread.ThreadPriority.HIGH,  // 优先级</span></span>
<span class="line"><span>  onExit: (code) =&gt; console.log(&#39;Done&#39;),</span></span>
<span class="line"><span>});</span></span></code></pre></div><h2 id="_5-oom-killer" tabindex="-1">5. OOM Killer <a class="header-anchor" href="#_5-oom-killer" aria-label="Permalink to &quot;5. OOM Killer&quot;">​</a></h2><h3 id="_5-1-oom-机制" tabindex="-1">5.1 OOM 机制 <a class="header-anchor" href="#_5-1-oom-机制" aria-label="Permalink to &quot;5.1 OOM 机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OOM Killer 触发条件：</span></span>
<span class="line"><span>├── 可用内存 &lt; 阈值（可配置）</span></span>
<span class="line"><span>├── 连续分配失败（kmalloc 返回 NULL）</span></span>
<span class="line"><span>└── 内存压力达到 OOM_SCORE 阈值</span></span>
<span class="line"><span></span></span>
<span class="line"><span>OOM 评分因素：</span></span>
<span class="line"><span>├── 进程重要性（前台 &gt; 后台）</span></span>
<span class="line"><span>├── 进程驻留时间</span></span>
<span class="line"><span>├── 进程的 RSS/VSZ 大小</span></span>
<span class="line"><span>├── 进程是否有子进程</span></span>
<span class="line"><span>└── 手动设定的 oom_adj 值</span></span></code></pre></div><h3 id="_5-2-内存回收流程" tabindex="-1">5.2 内存回收流程 <a class="header-anchor" href="#_5-2-内存回收流程" aria-label="Permalink to &quot;5.2 内存回收流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 内存分配失败</span></span>
<span class="line"><span>2. 触发内存回收（kswapd / khugepaged）</span></span>
<span class="line"><span>3. 扫描 LRU 链表，释放可回收页面</span></span>
<span class="line"><span>4. 如果仍不足 → OOM Killer 介入</span></span>
<span class="line"><span>5. 按重要性排序，杀死最低优先级进程</span></span>
<span class="line"><span>6. 释放内存 → 原请求分配成功</span></span></code></pre></div><h3 id="_5-3-oom-防护策略" tabindex="-1">5.3 OOM 防护策略 <a class="header-anchor" href="#_5-3-oom-防护策略" aria-label="Permalink to &quot;5.3 OOM 防护策略&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 主动释放不需要的资源</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct MemoryAwareComponent {</span></span>
<span class="line"><span>  @State imageData: string = &#39;&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 页面隐藏时释放大图内存</span></span>
<span class="line"><span>  onWillDisappear() {</span></span>
<span class="line"><span>    this.imageData = &#39;&#39;; // 释放图片数据</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 页面显示时按需加载</span></span>
<span class="line"><span>  onWillAppear() {</span></span>
<span class="line"><span>    // 仅在需要时加载</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 使用 Weakref 管理长生命周期引用</span></span>
<span class="line"><span>// 3. 图片使用 decodePixel 下采样</span></span>
<span class="line"><span>// 4. 避免在 @State 中存放大对象</span></span>
<span class="line"><span>// 5. 及时关闭文件句柄和数据库连接</span></span></code></pre></div><h3 id="_5-4-内存泄漏检测" tabindex="-1">5.4 内存泄漏检测 <a class="header-anchor" href="#_5-4-内存泄漏检测" aria-label="Permalink to &quot;5.4 内存泄漏检测&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>检测手段：</span></span>
<span class="line"><span>├── DevEco Profiler Memory 面板</span></span>
<span class="line"><span>├── Heap Snapshot 对比</span></span>
<span class="line"><span>├── @State 大对象检查</span></span>
<span class="line"><span>├── 闭包中意外引用（闭包陷阱）</span></span>
<span class="line"><span>└── 监听器未注销（addEventListener）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>常见泄漏场景：</span></span>
<span class="line"><span>├── @State 存储大数组/对象</span></span>
<span class="line"><span>├── 定时器未清理（clearTimeout）</span></span>
<span class="line"><span>├── 网络请求未 abort</span></span>
<span class="line"><span>├── 自定义事件监听未 removeListener</span></span>
<span class="line"><span>└── 闭包中持有 UIComponent 引用</span></span></code></pre></div><h2 id="_6-🎯-面试高频考点" tabindex="-1">6. 🎯 面试高频考点 <a class="header-anchor" href="#_6-🎯-面试高频考点" aria-label="Permalink to &quot;6. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙的-actor-线程模型与-android-线程模型有什么区别" tabindex="-1">Q1: 鸿蒙的 Actor 线程模型与 Android 线程模型有什么区别？ <a class="header-anchor" href="#q1-鸿蒙的-actor-线程模型与-android-线程模型有什么区别" aria-label="Permalink to &quot;Q1: 鸿蒙的 Actor 线程模型与 Android 线程模型有什么区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>鸿蒙 Actor 模型：线程隔离 + 消息传递，无共享内存，天然避免竞态条件</li><li>Android 线程模型：共享内存 + 同步原语（mutex/semaphore），需要手动处理同步</li><li>鸿蒙 TaskPool 由系统管理，Android Handler/Executor 需要手动管理</li><li>鸿蒙禁止跨线程操作 UI，Android 通过 Handler 回调到主线程</li></ul><h3 id="q2-taskpool-和-worker-怎么选" tabindex="-1">Q2: TaskPool 和 Worker 怎么选？ <a class="header-anchor" href="#q2-taskpool-和-worker-怎么选" aria-label="Permalink to &quot;Q2: TaskPool 和 Worker 怎么选？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>TaskPool</strong>：系统管理线程池，适合短时任务（&lt; 5s），无需手动管理</li><li><strong>Worker</strong>：手动创建管理，适合长时任务（&gt; 5s），可常驻运行</li><li>TaskPool 有任务超时机制（默认 60s），Worker 无超时限制</li><li>TaskPool 自动回收线程，Worker 需要手动 shutdown</li><li>大量短时任务优先用 TaskPool（减少线程创建开销）</li></ul><h3 id="q3-鸿蒙如何防止-oom" tabindex="-1">Q3: 鸿蒙如何防止 OOM？ <a class="header-anchor" href="#q3-鸿蒙如何防止-oom" aria-label="Permalink to &quot;Q3: 鸿蒙如何防止 OOM？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>架构层面：分层 OOM Killer，按重要性排序回收</li><li>开发层面：避免 @State 存储大对象，及时释放资源</li><li>图片处理：使用 decodePixel 下采样，按需加载</li><li>懒加载：LazyForEach 按需加载列表</li><li>缓存策略：实现 LruCache，设置大小上限</li><li>监控：使用 Profiler 定期检测内存泄漏</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：Actor 模型是鸿蒙并发的核心，对比 Android 的 Handler 模型强调<strong>无锁、线程隔离</strong>的优势。TaskPool vs Worker 是高频对比题。</p></blockquote>`,53)])])}const k=a(l,[["render",t]]);export{u as __pageData,k as default};
