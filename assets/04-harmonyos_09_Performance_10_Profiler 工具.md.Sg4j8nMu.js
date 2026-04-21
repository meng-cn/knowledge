import{_ as s,o as n,c as e,ae as p}from"./chunks/framework.Czhw_PXq.js";const k=JSON.parse('{"title":"Profiler 工具","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/09_Performance/10_Profiler 工具.md","filePath":"04-harmonyos/09_Performance/10_Profiler 工具.md"}'),i={name:"04-harmonyos/09_Performance/10_Profiler 工具.md"};function l(t,a,r,o,h,c){return n(),e("div",null,[...a[0]||(a[0]=[p(`<h1 id="profiler-工具" tabindex="-1">Profiler 工具 <a class="header-anchor" href="#profiler-工具" aria-label="Permalink to &quot;Profiler 工具&quot;">​</a></h1><blockquote><p>DevEco Studio Profiler 全链路性能分析：CPU、内存、网络、渲染、电量。</p></blockquote><hr><h2 id="_1-profiler-概述" tabindex="-1">1. Profiler 概述 <a class="header-anchor" href="#_1-profiler-概述" aria-label="Permalink to &quot;1. Profiler 概述&quot;">​</a></h2><h3 id="_1-1-profiler-面板" tabindex="-1">1.1 Profiler 面板 <a class="header-anchor" href="#_1-1-profiler-面板" aria-label="Permalink to &quot;1.1 Profiler 面板&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DevEco Studio Profiler</span></span>
<span class="line"><span>├─ CPU Profile（CPU 分析）</span></span>
<span class="line"><span>├─ Memory Profile（内存分析）</span></span>
<span class="line"><span>├─ Network Profile（网络分析）</span></span>
<span class="line"><span>├─ Battery / Power（电量分析）</span></span>
<span class="line"><span>├─ FPS / Render（渲染分析）</span></span>
<span class="line"><span>└─ Startup Analysis（启动分析）</span></span></code></pre></div><h3 id="_1-2-使用方式" tabindex="-1">1.2 使用方式 <a class="header-anchor" href="#_1-2-使用方式" aria-label="Permalink to &quot;1.2 使用方式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 打开 DevEco Studio → Profiler 面板</span></span>
<span class="line"><span>2. 选择目标设备/模拟器</span></span>
<span class="line"><span>3. 点击 Record 开始采集</span></span>
<span class="line"><span>4. 执行应用操作（模拟场景）</span></span>
<span class="line"><span>5. 点击 Stop 停止采集</span></span>
<span class="line"><span>6. 分析数据，定位问题</span></span></code></pre></div><hr><h2 id="_2-cpu-profile" tabindex="-1">2. CPU Profile <a class="header-anchor" href="#_2-cpu-profile" aria-label="Permalink to &quot;2. CPU Profile&quot;">​</a></h2><h3 id="_2-1-cpu-分析" tabindex="-1">2.1 CPU 分析 <a class="header-anchor" href="#_2-1-cpu-分析" aria-label="Permalink to &quot;2.1 CPU 分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CPU Profile 信息：</span></span>
<span class="line"><span>├─ CPU 使用率趋势图</span></span>
<span class="line"><span>├─ 方法调用火焰图（火焰图）</span></span>
<span class="line"><span>├─ 方法耗时排行</span></span>
<span class="line"><span>└─ 线程调度信息</span></span></code></pre></div><h3 id="_2-2-火焰图分析" tabindex="-1">2.2 火焰图分析 <a class="header-anchor" href="#_2-2-火焰图分析" aria-label="Permalink to &quot;2.2 火焰图分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>火焰图（Flame Graph）：</span></span>
<span class="line"><span>├─ 横轴：调用占比</span></span>
<span class="line"><span>├─ 纵轴：调用栈深度</span></span>
<span class="line"><span>├─ 最宽 = 耗时最多</span></span>
<span class="line"><span>└─ 最上层 = 入口方法</span></span>
<span class="line"><span></span></span>
<span class="line"><span>使用场景：</span></span>
<span class="line"><span>├─ 定位耗时方法</span></span>
<span class="line"><span>├─ 发现递归/循环瓶颈</span></span>
<span class="line"><span>└─ 分析 CPU 热点</span></span></code></pre></div><h3 id="_2-3-cpu-优化建议" tabindex="-1">2.3 CPU 优化建议 <a class="header-anchor" href="#_2-3-cpu-优化建议" aria-label="Permalink to &quot;2.3 CPU 优化建议&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CPU 优化：</span></span>
<span class="line"><span>├─ 减少主线程工作</span></span>
<span class="line"><span>├─ 避免循环中的对象创建</span></span>
<span class="line"><span>├─ 使用缓存减少重复计算</span></span>
<span class="line"><span>├─ 异步化耗时任务</span></span>
<span class="line"><span>└─ 使用 TaskPool 分配任务</span></span></code></pre></div><hr><h2 id="_3-memory-profile" tabindex="-1">3. Memory Profile <a class="header-anchor" href="#_3-memory-profile" aria-label="Permalink to &quot;3. Memory Profile&quot;">​</a></h2><h3 id="_3-1-内存分析" tabindex="-1">3.1 内存分析 <a class="header-anchor" href="#_3-1-内存分析" aria-label="Permalink to &quot;3.1 内存分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Memory Profile 信息：</span></span>
<span class="line"><span>├─ 内存趋势图（总内存/堆内存/原生内存）</span></span>
<span class="line"><span>├─ Heap Snapshot（堆快照）</span></span>
<span class="line"><span>├─ 对象分配排行</span></span>
<span class="line"><span>├─ 内存泄漏检测</span></span>
<span class="line"><span>└─ GC 日志</span></span></code></pre></div><h3 id="_3-2-heap-snapshot-使用" tabindex="-1">3.2 Heap Snapshot 使用 <a class="header-anchor" href="#_3-2-heap-snapshot-使用" aria-label="Permalink to &quot;3.2 Heap Snapshot 使用&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Heap Snapshot 使用流程：</span></span>
<span class="line"><span>1. 执行特定操作（如打开页面）</span></span>
<span class="line"><span>2. 拍摄 Heap Snapshot</span></span>
<span class="line"><span>3. 再次执行操作</span></span>
<span class="line"><span>4. 再拍摄 Heap Snapshot</span></span>
<span class="line"><span>5. 对比两次快照，查看新增对象</span></span>
<span class="line"><span>6. 定位泄漏对象</span></span></code></pre></div><h3 id="_3-3-内存泄漏检测" tabindex="-1">3.3 内存泄漏检测 <a class="header-anchor" href="#_3-3-内存泄漏检测" aria-label="Permalink to &quot;3.3 内存泄漏检测&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 常见泄漏点 &amp; Profiler 确认</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BadClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> instance</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BadClass</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> largeData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ArrayBuffer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1024</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1024</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 泄漏原因：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. static 持有实例</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 大对象未释放</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 事件监听未移除</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Profiler 确认：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - Heap Snapshot 中 largeData 持续增长</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - GC 无法回收</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - 内存趋势持续上升</span></span></code></pre></div><hr><h2 id="_4-network-profile" tabindex="-1">4. Network Profile <a class="header-anchor" href="#_4-network-profile" aria-label="Permalink to &quot;4. Network Profile&quot;">​</a></h2><h3 id="_4-1-网络分析" tabindex="-1">4.1 网络分析 <a class="header-anchor" href="#_4-1-网络分析" aria-label="Permalink to &quot;4.1 网络分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Network Profile 信息：</span></span>
<span class="line"><span>├─ 所有 HTTP/WebSocket 请求</span></span>
<span class="line"><span>├─ 请求耗时（连接/TTFB/响应）</span></span>
<span class="line"><span>├─ 请求/响应大小</span></span>
<span class="line"><span>├─ 请求频率统计</span></span>
<span class="line"><span>└─ 网络类型（WiFi/4G/5G）</span></span></code></pre></div><h3 id="_4-2-网络优化建议" tabindex="-1">4.2 网络优化建议 <a class="header-anchor" href="#_4-2-网络优化建议" aria-label="Permalink to &quot;4.2 网络优化建议&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Network Profile 优化建议：</span></span>
<span class="line"><span>├─ 请求过多 → 合并/批量</span></span>
<span class="line"><span>├─ TTFB 过长 → CDN/缓存</span></span>
<span class="line"><span>├─ 响应过大 → gzip 压缩</span></span>
<span class="line"><span>├─ 请求失败 → 重试/降级</span></span>
<span class="line"><span>└─ 重复请求 → 去重/缓存</span></span></code></pre></div><hr><h2 id="_5-battery-power" tabindex="-1">5. Battery / Power <a class="header-anchor" href="#_5-battery-power" aria-label="Permalink to &quot;5. Battery / Power&quot;">​</a></h2><h3 id="_5-1-电量分析" tabindex="-1">5.1 电量分析 <a class="header-anchor" href="#_5-1-电量分析" aria-label="Permalink to &quot;5.1 电量分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Power Profile 信息：</span></span>
<span class="line"><span>├─ 电量消耗趋势</span></span>
<span class="line"><span>├─ 各模块耗电排行</span></span>
<span class="line"><span>├─ CPU/网络/屏幕耗电占比</span></span>
<span class="line"><span>└─ 功耗分析（待机/使用中）</span></span></code></pre></div><h3 id="_5-2-省电建议" tabindex="-1">5.2 省电建议 <a class="header-anchor" href="#_5-2-省电建议" aria-label="Permalink to &quot;5.2 省电建议&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Power Profile 优化建议：</span></span>
<span class="line"><span>├─ 网络模块耗电高 → 批量请求/缓存</span></span>
<span class="line"><span>├─ GPS 模块耗电高 → 降低定位频率</span></span>
<span class="line"><span>├─ CPU 模块耗电高 → 减少计算/异步化</span></span>
<span class="line"><span>├─ 屏幕模块耗电高 → 降低亮度/缩短超时</span></span>
<span class="line"><span>└─ 后台模块耗电高 → 减少后台任务</span></span></code></pre></div><hr><h2 id="_6-fps-render" tabindex="-1">6. FPS / Render <a class="header-anchor" href="#_6-fps-render" aria-label="Permalink to &quot;6. FPS / Render&quot;">​</a></h2><h3 id="_6-1-渲染分析" tabindex="-1">6.1 渲染分析 <a class="header-anchor" href="#_6-1-渲染分析" aria-label="Permalink to &quot;6.1 渲染分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Render Profile 信息：</span></span>
<span class="line"><span>├─ FPS 趋势图</span></span>
<span class="line"><span>├─ 每帧耗时（Layout/DRAW/GPU）</span></span>
<span class="line"><span>├─ 掉帧标记</span></span>
<span class="line"><span>└─ 渲染阻塞检测</span></span></code></pre></div><hr><h2 id="_7-startup-analysis" tabindex="-1">7. Startup Analysis <a class="header-anchor" href="#_7-startup-analysis" aria-label="Permalink to &quot;7. Startup Analysis&quot;">​</a></h2><h3 id="_7-1-启动分析" tabindex="-1">7.1 启动分析 <a class="header-anchor" href="#_7-1-启动分析" aria-label="Permalink to &quot;7.1 启动分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Startup Analysis 信息：</span></span>
<span class="line"><span>├─ 启动时间线</span></span>
<span class="line"><span>├─ 各阶段耗时（进程创建→首屏）</span></span>
<span class="line"><span>├─ 热启动/冷启动对比</span></span>
<span class="line"><span>└─ 启动阻塞检测</span></span></code></pre></div><hr><h2 id="_8-面试高频考点" tabindex="-1">8. 面试高频考点 <a class="header-anchor" href="#_8-面试高频考点" aria-label="Permalink to &quot;8. 面试高频考点&quot;">​</a></h2><h3 id="q1-profiler-工具有哪些" tabindex="-1">Q1: Profiler 工具有哪些？ <a class="header-anchor" href="#q1-profiler-工具有哪些" aria-label="Permalink to &quot;Q1: Profiler 工具有哪些？&quot;">​</a></h3><p><strong>回答</strong>：DevEco Studio Profiler 包含 CPU、内存、网络、电池、FPS、启动分析。每个面板有特定用途。</p><h3 id="q2-如何用-profiler-找内存泄漏" tabindex="-1">Q2: 如何用 Profiler 找内存泄漏？ <a class="header-anchor" href="#q2-如何用-profiler-找内存泄漏" aria-label="Permalink to &quot;Q2: 如何用 Profiler 找内存泄漏？&quot;">​</a></h3><p><strong>回答</strong>：执行操作前后各拍一次 Heap Snapshot，对比两次快照查看新增对象，定位未释放的对象。</p><hr><blockquote><p>🐱 <strong>小猫提示</strong>：Profiler 记住 <strong>&quot;CPU/内存/网络/电池/FPS/启动 六大面板、Heap Snapshot 对比较、火焰图找 CPU 热点&quot;</strong>。</p></blockquote>`,52)])])}const u=s(i,[["render",l]]);export{k as __pageData,u as default};
