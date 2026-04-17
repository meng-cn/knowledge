import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.DYQ7e_kq.js";const c=JSON.parse('{"title":"Android Studio 调试技巧","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/13_Testing/06_AndroidStudio 调试.md","filePath":"00-android/13_Testing/06_AndroidStudio 调试.md"}'),l={name:"00-android/13_Testing/06_AndroidStudio 调试.md"};function e(t,s,h,k,d,r){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="android-studio-调试技巧" tabindex="-1">Android Studio 调试技巧 <a class="header-anchor" href="#android-studio-调试技巧" aria-label="Permalink to &quot;Android Studio 调试技巧&quot;">​</a></h1><blockquote><p><strong>字数统计：约 7000 字</strong><br><strong>难度等级：⭐⭐⭐</strong><br><strong>面试重要度：⭐⭐⭐</strong></p></blockquote><hr><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-调试器基础">调试器基础</a></li><li><a href="#2-断点技巧">断点技巧</a></li><li><a href="#3-变量查看">变量查看</a></li><li><a href="#4-高级调试">高级调试</a></li><li><a href="#5-性能分析">性能分析</a></li><li><a href="#6-面试考点">面试考点</a></li></ol><hr><h2 id="_1-调试器基础" tabindex="-1">1. 调试器基础 <a class="header-anchor" href="#_1-调试器基础" aria-label="Permalink to &quot;1. 调试器基础&quot;">​</a></h2><h3 id="_1-1-启动调试" tabindex="-1">1.1 启动调试 <a class="header-anchor" href="#_1-1-启动调试" aria-label="Permalink to &quot;1.1 启动调试&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动方式：</span></span>
<span class="line"><span>1. Debug 按钮（绿色虫子图标）</span></span>
<span class="line"><span>2. Run → Debug &#39;app&#39;</span></span>
<span class="line"><span>3. Shift + F9</span></span>
<span class="line"><span>4. 命令行：adb shell am set-debug-app</span></span></code></pre></div><h3 id="_1-2-调试窗口" tabindex="-1">1.2 调试窗口 <a class="header-anchor" href="#_1-2-调试窗口" aria-label="Permalink to &quot;1.2 调试窗口&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>调试窗口组成：</span></span>
<span class="line"><span>- Debugger - 线程和栈帧</span></span>
<span class="line"><span>- Variables - 变量值</span></span>
<span class="line"><span>- Console - 输出日志</span></span>
<span class="line"><span>- Watches - 监控表达式</span></span>
<span class="line"><span>- Breakpoints - 断点列表</span></span></code></pre></div><hr><h2 id="_2-断点技巧" tabindex="-1">2. 断点技巧 <a class="header-anchor" href="#_2-断点技巧" aria-label="Permalink to &quot;2. 断点技巧&quot;">​</a></h2><h3 id="_2-1-基础断点" tabindex="-1">2.1 基础断点 <a class="header-anchor" href="#_2-1-基础断点" aria-label="Permalink to &quot;2.1 基础断点&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 点击行号左侧添加断点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 断点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> repository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    updateUI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_2-2-条件断点" tabindex="-1">2.2 条件断点 <a class="header-anchor" href="#_2-2-条件断点" aria-label="Permalink to &quot;2.2 条件断点&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 右键断点 → 设置条件</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> processItems</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(items: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">List</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (item </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> items) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 条件断点：item.id == 5</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        process</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(item)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 条件示例：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// item.id == 5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// count &gt; 10</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// name.startsWith(&quot;A&quot;)</span></span></code></pre></div><h3 id="_2-3-异常断点" tabindex="-1">2.3 异常断点 <a class="header-anchor" href="#_2-3-异常断点" aria-label="Permalink to &quot;2.3 异常断点&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>添加异常断点：</span></span>
<span class="line"><span>1. View → Breakpoints</span></span>
<span class="line"><span>2. 点击 + → Java Exception Breakpoint</span></span>
<span class="line"><span>3. 输入异常类名：NullPointerException</span></span>
<span class="line"><span></span></span>
<span class="line"><span>常用异常：</span></span>
<span class="line"><span>- NullPointerException</span></span>
<span class="line"><span>- IllegalArgumentException</span></span>
<span class="line"><span>- IndexOutOfBoundsException</span></span>
<span class="line"><span>- ClassCastException</span></span></code></pre></div><h3 id="_2-4-方法断点" tabindex="-1">2.4 方法断点 <a class="header-anchor" href="#_2-4-方法断点" aria-label="Permalink to &quot;2.4 方法断点&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在方法签名处设置断点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方法断点</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 进入方法时暂停</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 右键断点 → 选择 Method Entry/Exit</span></span></code></pre></div><h3 id="_2-5-日志断点" tabindex="-1">2.5 日志断点 <a class="header-anchor" href="#_2-5-日志断点" aria-label="Permalink to &quot;2.5 日志断点&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 右键断点 → 移除勾选&quot;Suspend&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在&quot;Log&quot;中输入日志消息</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 格式：Data loaded: \${data.size}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不暂停程序，只记录日志</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> repository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 日志断点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    updateUI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_3-变量查看" tabindex="-1">3. 变量查看 <a class="header-anchor" href="#_3-变量查看" aria-label="Permalink to &quot;3. 变量查看&quot;">​</a></h2><h3 id="_3-1-查看变量" tabindex="-1">3.1 查看变量 <a class="header-anchor" href="#_3-1-查看变量" aria-label="Permalink to &quot;3.1 查看变量&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>查看方式：</span></span>
<span class="line"><span>1. Variables 窗口</span></span>
<span class="line"><span>2. 鼠标悬停</span></span>
<span class="line"><span>3. Evaluate Expression (Alt+F8)</span></span>
<span class="line"><span>4. Watches 窗口</span></span></code></pre></div><h3 id="_3-2-表达式求值" tabindex="-1">3.2 表达式求值 <a class="header-anchor" href="#_3-2-表达式求值" aria-label="Permalink to &quot;3.2 表达式求值&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Alt+F8 打开 Evaluate Expression</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 计算表达式</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.size</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">user.name.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toUpperCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 调用方法</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">repository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { it.id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 修改变量值</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">count </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">user.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;New Name&quot;</span></span></code></pre></div><h3 id="_3-3-监控表达式" tabindex="-1">3.3 监控表达式 <a class="header-anchor" href="#_3-3-监控表达式" aria-label="Permalink to &quot;3.3 监控表达式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>添加 Watch：</span></span>
<span class="line"><span>1. 右键变量 → Add to Watches</span></span>
<span class="line"><span>2. Watches 窗口点击 +</span></span>
<span class="line"><span></span></span>
<span class="line"><span>常用监控：</span></span>
<span class="line"><span>- data.size</span></span>
<span class="line"><span>- user?.name</span></span>
<span class="line"><span>- count &gt; 10</span></span>
<span class="line"><span>- list.isEmpty()</span></span></code></pre></div><h3 id="_3-4-对象查看" tabindex="-1">3.4 对象查看 <a class="header-anchor" href="#_3-4-对象查看" aria-label="Permalink to &quot;3.4 对象查看&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看对象详情</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> User</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;admin&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看字段</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">user.id</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">user.name</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看集合</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">list[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">map[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;key&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看流</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stream.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><hr><h2 id="_4-高级调试" tabindex="-1">4. 高级调试 <a class="header-anchor" href="#_4-高级调试" aria-label="Permalink to &quot;4. 高级调试&quot;">​</a></h2><h3 id="_4-1-多线程调试" tabindex="-1">4.1 多线程调试 <a class="header-anchor" href="#_4-1-多线程调试" aria-label="Permalink to &quot;4.1 多线程调试&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看所有线程</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Debugger 窗口显示所有线程</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 切换线程</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 点击不同线程查看其栈帧</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 线程特定断点</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 右键断点 → Condition → Thread</span></span></code></pre></div><h3 id="_4-2-协程调试" tabindex="-1">4.2 协程调试 <a class="header-anchor" href="#_4-2-协程调试" aria-label="Permalink to &quot;4.2 协程调试&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启用协程调试</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Settings → Build → Debugger → Koroutines</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看协程栈</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Debugger 窗口显示协程信息</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 协程断点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">suspend</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 断点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> withContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Dispatchers.IO) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        repository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_4-3-热修复" tabindex="-1">4.3 热修复 <a class="header-anchor" href="#_4-3-热修复" aria-label="Permalink to &quot;4.3 热修复&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>使用 Apply Changes：</span></span>
<span class="line"><span>1. 修改代码</span></span>
<span class="line"><span>2. 点击 Apply Changes 按钮</span></span>
<span class="line"><span>3. 选择模式：</span></span>
<span class="line"><span>   - Run App - 完全重启</span></span>
<span class="line"><span>   - Apply Changes and Restart Activity</span></span>
<span class="line"><span>   - Apply Changes and Restart</span></span>
<span class="line"><span>   - Apply Code Changes - 仅代码</span></span></code></pre></div><h3 id="_4-4-条件日志" tabindex="-1">4.4 条件日志 <a class="header-anchor" href="#_4-4-条件日志" aria-label="Permalink to &quot;4.4 条件日志&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 Timber 条件日志</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DebugLogging</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> debug</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (BuildConfig.DEBUG) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Timber.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">d</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Debug message&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> tree</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (BuildConfig.DEBUG) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Timber.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Timber.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">DebugTree</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_5-性能分析" tabindex="-1">5. 性能分析 <a class="header-anchor" href="#_5-性能分析" aria-label="Permalink to &quot;5. 性能分析&quot;">​</a></h2><h3 id="_5-1-android-profiler" tabindex="-1">5.1 Android Profiler <a class="header-anchor" href="#_5-1-android-profiler" aria-label="Permalink to &quot;5.1 Android Profiler&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>打开方式：</span></span>
<span class="line"><span>View → Tool Windows → Profiler</span></span>
<span class="line"><span></span></span>
<span class="line"><span>分析内容：</span></span>
<span class="line"><span>- CPU - 处理器使用</span></span>
<span class="line"><span>- Memory - 内存使用</span></span>
<span class="line"><span>- Energy - 电量消耗</span></span>
<span class="line"><span>- Network - 网络流量</span></span></code></pre></div><h3 id="_5-2-内存分析" tabindex="-1">5.2 内存分析 <a class="header-anchor" href="#_5-2-内存分析" aria-label="Permalink to &quot;5.2 内存分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Memory Profiler：</span></span>
<span class="line"><span>1. 查看内存使用</span></span>
<span class="line"><span>2. 捕获堆转储</span></span>
<span class="line"><span>3. 分析内存泄漏</span></span>
<span class="line"><span>4. 查看对象分配</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤：</span></span>
<span class="line"><span>1. 点击 Record</span></span>
<span class="line"><span>2. 执行操作</span></span>
<span class="line"><span>3. 停止记录</span></span>
<span class="line"><span>4. 分析结果</span></span></code></pre></div><h3 id="_5-3-cpu-分析" tabindex="-1">5.3 CPU 分析 <a class="header-anchor" href="#_5-3-cpu-分析" aria-label="Permalink to &quot;5.3 CPU 分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CPU Profiler：</span></span>
<span class="line"><span>1. 查看 CPU 使用率</span></span>
<span class="line"><span>2. 捕获方法追踪</span></span>
<span class="line"><span>3. 分析性能瓶颈</span></span>
<span class="line"><span></span></span>
<span class="line"><span>追踪类型：</span></span>
<span class="line"><span>- Sampled - 采样，低开销</span></span>
<span class="line"><span>- Traced - 追踪，详细</span></span></code></pre></div><h3 id="_5-4-网络分析" tabindex="-1">5.4 网络分析 <a class="header-anchor" href="#_5-4-网络分析" aria-label="Permalink to &quot;5.4 网络分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Network Profiler：</span></span>
<span class="line"><span>1. 查看网络请求</span></span>
<span class="line"><span>2. 分析请求大小</span></span>
<span class="line"><span>3. 查看响应时间</span></span>
<span class="line"><span>4. 检查请求内容</span></span></code></pre></div><hr><h2 id="_6-面试考点" tabindex="-1">6. 面试考点 <a class="header-anchor" href="#_6-面试考点" aria-label="Permalink to &quot;6. 面试考点&quot;">​</a></h2><h3 id="_6-1-基础概念" tabindex="-1">6.1 基础概念 <a class="header-anchor" href="#_6-1-基础概念" aria-label="Permalink to &quot;6.1 基础概念&quot;">​</a></h3><p><strong>Q1: 如何设置断点？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>- 点击行号左侧</span></span>
<span class="line"><span>- 右键设置条件</span></span>
<span class="line"><span>- 可以设置日志断点</span></span></code></pre></div><p><strong>Q2: 什么是条件断点？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>- 满足条件时才暂停</span></span>
<span class="line"><span>- 减少不必要的暂停</span></span>
<span class="line"><span>- 提高调试效率</span></span></code></pre></div><h3 id="_6-2-实战问题" tabindex="-1">6.2 实战问题 <a class="header-anchor" href="#_6-2-实战问题" aria-label="Permalink to &quot;6.2 实战问题&quot;">​</a></h3><p><strong>Q3: 如何调试协程？</strong></p><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启用协程调试</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Settings → Debugger → Koroutines</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查看协程栈</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Debugger 窗口显示协程信息</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">suspend</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> debug</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 可以正常设置断点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> withContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Dispatchers.IO) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        fetchData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>Q4: 如何分析内存泄漏？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>1. 打开 Memory Profiler</span></span>
<span class="line"><span>2. 捕获堆转储</span></span>
<span class="line"><span>3. 分析对象引用</span></span>
<span class="line"><span>4. 查找泄漏路径</span></span>
<span class="line"><span>5. 使用 LeakCanary 辅助</span></span></code></pre></div><hr><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li><a href="https://developer.android.com/studio/debug" target="_blank" rel="noreferrer">Android Studio Debugger</a></li><li><a href="https://developer.android.com/studio/profile" target="_blank" rel="noreferrer">Android Profiler</a></li></ul><hr><p><em>本文完，感谢阅读！</em></p>`,70)])])}const g=a(l,[["render",e]]);export{c as __pageData,g as default};
