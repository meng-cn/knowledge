import{_ as a,o as n,c as t,ae as i}from"./chunks/framework.Czhw_PXq.js";const k=JSON.parse('{"title":"系统启动流程","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/11_System/02_系统启动流程.md","filePath":"04-harmonyos/11_System/02_系统启动流程.md"}'),p={name:"04-harmonyos/11_System/02_系统启动流程.md"};function e(l,s,r,d,h,o){return n(),t("div",null,[...s[0]||(s[0]=[i(`<h1 id="系统启动流程" tabindex="-1">系统启动流程 <a class="header-anchor" href="#系统启动流程" aria-label="Permalink to &quot;系统启动流程&quot;">​</a></h1><h2 id="_1-完整启动链" tabindex="-1">1. 完整启动链 <a class="header-anchor" href="#_1-完整启动链" aria-label="Permalink to &quot;1. 完整启动链&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 1. BootROM (固化在 Silicon)                                    │</span></span>
<span class="line"><span>│    → 验证 Bootloader 签名 → 跳转到 Bootloader                   │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 2. Bootloader (HiSilicon Fastboot / U-Boot)                   │</span></span>
<span class="line"><span>│    → 初始化 RAM/CPU/时钟 → 加载 Kernel → 跳转到 Kernel          │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 3. HongMeng Kernel                                            │</span></span>
<span class="line"><span>│    → 硬件初始化 → 内存管理 → 进程调度 → 挂载根文件系统            │</span></span>
<span class="line"><span>│    → 启动 Init 进程 (PID=1)                                    │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 4. Init 进程                                                   │</span></span>
<span class="line"><span>│    → 解析 init.hrc 配置 → 启动系统服务 → 启动 Zygote            │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 5. Zygote 进程                                                 │</span></span>
<span class="line"><span>│    → 预加载核心库 → 创建 Socket 监听 → fork 应用进程             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 6. SystemServer (系统集成服务)                                  │</span></span>
<span class="line"><span>│    → 启动 AMS/WMS/PMS 等核心服务 → 系统就绪                     │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 7. 桌面 Launcher 启动                                           │</span></span>
<span class="line"><span>│    → 用户可操作界面                                            │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_2-各阶段详解" tabindex="-1">2. 各阶段详解 <a class="header-anchor" href="#_2-各阶段详解" aria-label="Permalink to &quot;2. 各阶段详解&quot;">​</a></h2><h3 id="_2-1-bootrom-固化的代码-不可修改" tabindex="-1">2.1 BootROM（固化的代码，不可修改） <a class="header-anchor" href="#_2-1-bootrom-固化的代码-不可修改" aria-label="Permalink to &quot;2.1 BootROM（固化的代码，不可修改）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BootROM 职责：</span></span>
<span class="line"><span>├── 从 ROM 固定地址读取 Bootloader 镜像</span></span>
<span class="line"><span>├── RSA/ECC 签名验证（防篡改）</span></span>
<span class="line"><span>├── 初始化基础时钟</span></span>
<span class="line"><span>└── 设置栈指针和入口地址，跳转到 Bootloader</span></span></code></pre></div><p><strong>安全启动链（Chain of Trust）</strong>：每一级代码都验证下一级的签名，任何一环验证失败则终止启动。</p><h3 id="_2-2-bootloader" tabindex="-1">2.2 Bootloader <a class="header-anchor" href="#_2-2-bootloader" aria-label="Permalink to &quot;2.2 Bootloader&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 鸿蒙 Bootloader 初始化步骤</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">1.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> CPU</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 初始化（MMU/TLB/Cache）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">2.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> DDR</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 初始化（RAM</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 测试与配置）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">3.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 外设初始化（UART/RTC/WDT）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">4.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 安全启动验证</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">5.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 加载</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Kernel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 镜像到内存</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">6.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 传递</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Device</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Tree</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> HCS</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 参数</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">7.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 跳转到</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Kernel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 入口</span></span></code></pre></div><h3 id="_2-3-kernel-启动" tabindex="-1">2.3 Kernel 启动 <a class="header-anchor" href="#_2-3-kernel-启动" aria-label="Permalink to &quot;2.3 Kernel 启动&quot;">​</a></h3><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Kernel 启动关键阶段</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> start_kernel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   ├── </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setup_arch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()        — 架构初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   ├── </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mm_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()           — 内存管理初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   ├── </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sched_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()        — 调度器初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   ├── </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_IRQ</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()          — 中断初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   └── </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rest_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()         — 启动 Init 进程</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fork</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() 创建 PID</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 的 Init 进程</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Init 进程执行 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">etc</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">init</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">init.hrc 配置</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Kernel 等待 Init 完成根文件系统挂载</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 系统进入多任务模式</span></span></code></pre></div><p><strong>Kernel 启动时间优化</strong>：</p><ul><li>启用压缩内核（kernel 镜像压缩 40-50%）</li><li>异步初始化：非关键驱动延迟初始化</li><li>预分配内存池：减少启动时动态分配</li></ul><h3 id="_2-4-init-进程-pid-1" tabindex="-1">2.4 Init 进程（PID=1） <a class="header-anchor" href="#_2-4-init-进程-pid-1" aria-label="Permalink to &quot;2.4 Init 进程（PID=1）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Init 进程的职责：</span></span>
<span class="line"><span>├── 解析 init.hrc（HarmonyOS Runtime Config）配置文件</span></span>
<span class="line"><span>├── 启动系统守护进程（daemons）</span></span>
<span class="line"><span>├── 挂载文件系统分区</span></span>
<span class="line"><span>├── 创建 Zygote 进程</span></span>
<span class="line"><span>├── 处理子进程退出信号（SIGCHLD）</span></span>
<span class="line"><span>└── 维持系统核心服务运行</span></span></code></pre></div><p><strong>init.hrc 配置示例</strong>：</p><div class="language-hcs vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">hcs</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// /etc/init/init.hrc 配置</span></span>
<span class="line"><span>service zygote &quot;/system/bin/zygote&quot; {</span></span>
<span class="line"><span>  capability = CAP_SYS_ADMIN</span></span>
<span class="line"><span>  oneshot = false</span></span>
<span class="line"><span>  critical = true</span></span>
<span class="line"><span>  respawn = true</span></span>
<span class="line"><span>  env = &quot;ANDROID_ROOT=/system&quot;</span></span>
<span class="line"><span>  env = &quot;HOS_RUNTIME=/system/lib&quot;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>service system_server &quot;/system/bin/system_server&quot; {</span></span>
<span class="line"><span>  class = main</span></span>
<span class="line"><span>  depends = zygote</span></span>
<span class="line"><span>  critical = true</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>与 Android Init 对比</strong>：</p><table tabindex="0"><thead><tr><th>维度</th><th>Android Init</th><th>鸿蒙 Init</th></tr></thead><tbody><tr><td>配置文件</td><td>init.rc（脚本语言）</td><td>init.hrc（HCS 结构化配置）</td></tr><tr><td>语法</td><td>Shell-like 脚本</td><td>配置即数据（数据驱动）</td></tr><tr><td>服务管理</td><td>按 class/trigger 分组</td><td>按依赖图拓扑排序启动</td></tr><tr><td>日志</td><td>logcat</td><td>hilog</td></tr><tr><td>安全上下文</td><td>SELinux</td><td>ATM + SELinux</td></tr></tbody></table><h3 id="_2-5-zygote-进程" tabindex="-1">2.5 Zygote 进程 <a class="header-anchor" href="#_2-5-zygote-进程" aria-label="Permalink to &quot;2.5 Zygote 进程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Zygote 启动流程：</span></span>
<span class="line"><span>├── 1. 加载基础运行库（libark、libhilog 等）</span></span>
<span class="line"><span>├── 2. 初始化 ArkTS 运行时环境</span></span>
<span class="line"><span>├── 3. 预加载常用类（Text/Image/Button 等）</span></span>
<span class="line"><span>├── 4. 创建 Socket 监听（/dev/socket/zygote）</span></span>
<span class="line"><span>├── 5. 等待 AMS 通过 Socket 发送 fork 请求</span></span>
<span class="line"><span>└── 6. fork() 创建应用进程（减少冷启动时间 500ms+）</span></span></code></pre></div><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Zygote fork 应用进程的流程</span></span>
<span class="line"><span>// 1. AppProcessPool 向 Zygote 发送 fork 请求</span></span>
<span class="line"><span>// 2. Zygote fork() 子进程</span></span>
<span class="line"><span>// 3. 子进程初始化 ArkTS Runtime</span></span>
<span class="line"><span>// 4. 子进程启动 Application</span></span>
<span class="line"><span>// 5. 子进程启动 UIAbility</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 进程启动代码</span></span>
<span class="line"><span>import { app } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 通过 AppRuntime 启动应用</span></span>
<span class="line"><span>async function launchAbility(want: app.Want): Promise&lt;number&gt; {</span></span>
<span class="line"><span>  const result = await app.getApplicationContext().startAbility(want);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>Zygote 预加载内容</strong>：</p><table tabindex="0"><thead><tr><th>类别</th><th>内容</th></tr></thead><tbody><tr><td>运行时</td><td>ArkTS Runtime、GC 初始化、线程池</td></tr><tr><td>系统库</td><td>libarkui.so、libhilog.so、libace.so</td></tr><tr><td>UI 组件</td><td>所有内置组件的 ArkTS 类加载</td></tr><tr><td>资源框架</td><td>ResourceManager、Color/Font 缓存</td></tr><tr><td>网络库</td><td>http/socket 模块初始化</td></tr></tbody></table><h3 id="_2-6-systemserver" tabindex="-1">2.6 SystemServer <a class="header-anchor" href="#_2-6-systemserver" aria-label="Permalink to &quot;2.6 SystemServer&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SystemServer 启动的服务（部分）：</span></span>
<span class="line"><span>├── AMS (Ability Management Service)     — 管理 Ability 生命周期</span></span>
<span class="line"><span>├── WMS (Window Management Service)       — 窗口管理</span></span>
<span class="line"><span>├── PMS (Package Management Service)      — 包管理</span></span>
<span class="line"><span>├── IMS (Input Manager Service)            — 输入事件分发</span></span>
<span class="line"><span>├── NMS (Notification Management Service)  — 通知管理</span></span>
<span class="line"><span>├── KMS (Keymaster Service)               — 密钥管理</span></span>
<span class="line"><span>├── DMS (Device Manager Service)           — 设备管理</span></span>
<span class="line"><span>├── BMS (Battery Management Service)       — 电池管理</span></span>
<span class="line"><span>├── HWS (Hardware Sensor Service)          — 传感器服务</span></span>
<span class="line"><span>└── DAS (Distributed Ability Service)      — 分布式能力</span></span></code></pre></div><p><strong>SystemServer 启动阶段</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Phase 1: Core Services</span></span>
<span class="line"><span>  → 启动核心系统服务（AMS, WMS, PMS）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Phase 2: System Services</span></span>
<span class="line"><span>  → 启动辅助系统服务（IMS, NMS, BMS）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Phase 3: Startup Complete</span></span>
<span class="line"><span>  → 触发 onBootCompleted 回调</span></span>
<span class="line"><span>  → 启动 Launcher</span></span>
<span class="line"><span>  → 系统进入可交互状态</span></span></code></pre></div><h2 id="_3-启动时间分析" tabindex="-1">3. 启动时间分析 <a class="header-anchor" href="#_3-启动时间分析" aria-label="Permalink to &quot;3. 启动时间分析&quot;">​</a></h2><h3 id="_3-1-冷启动-vs-热启动" tabindex="-1">3.1 冷启动 vs 热启动 <a class="header-anchor" href="#_3-1-冷启动-vs-热启动" aria-label="Permalink to &quot;3.1 冷启动 vs 热启动&quot;">​</a></h3><table tabindex="0"><thead><tr><th>阶段</th><th>冷启动</th><th>热启动</th><th>优化目标</th></tr></thead><tbody><tr><td>BootROM</td><td>~100ms</td><td>-</td><td>不可优化</td></tr><tr><td>Bootloader</td><td>~500ms</td><td>-</td><td>不可优化</td></tr><tr><td>Kernel</td><td>~1000ms</td><td>-</td><td>压缩内核/异步初始化</td></tr><tr><td>Init</td><td>~200ms</td><td>-</td><td>精简启动服务</td></tr><tr><td>Zygote</td><td>~3000ms</td><td>-</td><td>预加载优化</td></tr><tr><td>App onCreate</td><td>~500-2000ms</td><td>~100ms</td><td>延迟初始化/懒加载</td></tr><tr><td>首屏 build</td><td>~200-1000ms</td><td>-</td><td>首屏内容裁剪</td></tr><tr><td><strong>总计</strong></td><td><strong>~5000-8000ms</strong></td><td><strong>~200-300ms</strong></td><td>&lt; 3s（应用市场要求）</td></tr></tbody></table><h3 id="_3-2-启动优化策略" tabindex="-1">3.2 启动优化策略 <a class="header-anchor" href="#_3-2-启动优化策略" aria-label="Permalink to &quot;3.2 启动优化策略&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. Application onCreate 优化：延迟非关键初始化</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct MyApp {</span></span>
<span class="line"><span>  @State isLoading: boolean = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  aboutToAppear() {</span></span>
<span class="line"><span>    // 延迟非关键初始化（300ms 后执行）</span></span>
<span class="line"><span>    setTimeout(() =&gt; {</span></span>
<span class="line"><span>      initNonCriticalServices();</span></span>
<span class="line"><span>    }, 300);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2. 使用 Ability 的 onWindowStageCreate 延迟加载</span></span>
<span class="line"><span>  //    避免在 onCreate 中做 UI 相关的初始化</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 预编译优化：使用 HAR/HSP 预加载常用模块</span></span>
<span class="line"><span>// 4. 首屏精简：首屏 build 只渲染必要内容</span></span>
<span class="line"><span>// 5. 懒加载：非首屏组件使用 LazyForEach 按需加载</span></span></code></pre></div><h2 id="_4-启动关键路径优化" tabindex="-1">4. 启动关键路径优化 <a class="header-anchor" href="#_4-启动关键路径优化" aria-label="Permalink to &quot;4. 启动关键路径优化&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>优化手段                  效果</span></span>
<span class="line"><span>─────────────────────────────────────────────</span></span>
<span class="line"><span>预加载常用组件库        减少 Zygote fork 时间 ~500ms</span></span>
<span class="line"><span>延迟初始化非关键服务    减少 onCreate 时间 ~300ms</span></span>
<span class="line"><span>首屏内容精简            减少首屏 build 时间 ~200ms</span></span>
<span class="line"><span>图片压缩/下采样        减少资源加载时间 ~100ms</span></span>
<span class="line"><span>ArkUI 编译优化         减少字节码体积 ~30%</span></span>
<span class="line"><span>HSP 动态共享           减少安装包体积，加快下载</span></span></code></pre></div><h2 id="_5-与-android-启动流程对比" tabindex="-1">5. 与 Android 启动流程对比 <a class="header-anchor" href="#_5-与-android-启动流程对比" aria-label="Permalink to &quot;5. 与 Android 启动流程对比&quot;">​</a></h2><table tabindex="0"><thead><tr><th>阶段</th><th>Android</th><th>鸿蒙</th></tr></thead><tbody><tr><td>固件层</td><td>ROM → U-Boot</td><td>BootROM → Bootloader</td></tr><tr><td>内核层</td><td>Linux Kernel</td><td>HongMeng Kernel</td></tr><tr><td>Init 进程</td><td>init (init.rc)</td><td>init (init.hrc)</td></tr><tr><td>Zygote</td><td>Java Zygote</td><td>ArkTS Zygote</td></tr><tr><td>System 服务</td><td>Java SystemServer</td><td>C++/ArkTS SystemServer</td></tr><tr><td>应用入口</td><td>Activity.onCreate()</td><td>UIAbility.onCreate()</td></tr><tr><td>预加载</td><td>Java 类 + Dex</td><td>ArkTS 类 + 运行时</td></tr><tr><td>多进程</td><td>fork + Zygote 连接</td><td>fork + Zygote Socket</td></tr></tbody></table><h2 id="_6-🎯-面试高频考点" tabindex="-1">6. 🎯 面试高频考点 <a class="header-anchor" href="#_6-🎯-面试高频考点" aria-label="Permalink to &quot;6. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙系统启动流程和-android-有什么区别" tabindex="-1">Q1: 鸿蒙系统启动流程和 Android 有什么区别？ <a class="header-anchor" href="#q1-鸿蒙系统启动流程和-android-有什么区别" aria-label="Permalink to &quot;Q1: 鸿蒙系统启动流程和 Android 有什么区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>内核不同：HongMeng 微内核 vs Linux 宏内核</li><li>配置格式：HCS 结构化配置 vs init.rc 脚本</li><li>Zygote 语言：ArkTS 运行时 vs Java Dalvik/ART</li><li>启动服务：C++/ArkTS SystemServer vs Java SystemServer</li><li>统一架构：同一内核覆盖 IoT/手机/车机 vs Android 分分支</li></ul><h3 id="q2-zygote-在鸿蒙中的作用是什么" tabindex="-1">Q2: Zygote 在鸿蒙中的作用是什么？ <a class="header-anchor" href="#q2-zygote-在鸿蒙中的作用是什么" aria-label="Permalink to &quot;Q2: Zygote 在鸿蒙中的作用是什么？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>预加载核心库和 UI 组件，减少应用冷启动时间</li><li>通过 fork() 创建应用进程，利用写时拷贝（Copy-on-Write）</li><li>监听 Socket 接收 AMS 的启动请求</li><li>与 Android 的 Zygote 原理相同，但运行环境是 ArkTS 而非 Java</li></ul><h3 id="q3-如何优化应用冷启动时间" tabindex="-1">Q3: 如何优化应用冷启动时间？ <a class="header-anchor" href="#q3-如何优化应用冷启动时间" aria-label="Permalink to &quot;Q3: 如何优化应用冷启动时间？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>Application onCreate 中只做必要初始化</li><li>非关键初始化延迟到 onForeground 或首屏渲染后</li><li>使用 HSP 动态共享模块减少包体积</li><li>首屏精简渲染内容，避免大量复杂组件</li><li>利用 LazyForEach 按需加载列表内容</li><li>图片资源按需加载和下采样</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：掌握从 BootROM → Launcher 的完整启动链，每个阶段负责什么、耗时多少、可优化空间多少。重点对比与 Android 的差异。</p></blockquote>`,49)])])}const g=a(p,[["render",e]]);export{k as __pageData,g as default};
