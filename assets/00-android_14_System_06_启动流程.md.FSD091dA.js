import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.DYQ7e_kq.js";const d=JSON.parse('{"title":"Android 启动流程深度解析","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/14_System/06_启动流程.md","filePath":"00-android/14_System/06_启动流程.md"}'),l={name:"00-android/14_System/06_启动流程.md"};function t(h,s,e,k,E,r){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="android-启动流程深度解析" tabindex="-1">Android 启动流程深度解析 <a class="header-anchor" href="#android-启动流程深度解析" aria-label="Permalink to &quot;Android 启动流程深度解析&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-bootloader-启动">Bootloader 启动</a></li><li><a href="#2-kernel-初始化">Kernel 初始化</a></li><li><a href="#3-init-进程启动">Init 进程启动</a></li><li><a href="#4-zygote-进程启动">Zygote 进程启动</a></li><li><a href="#5-systemserver-启动">SystemServer 启动</a></li><li><a href="#6-launcher-启动">Launcher 启动</a></li><li><a href="#7-app-冷启动热启动流程">App 冷启动/热启动流程</a></li><li><a href="#8-activity-启动流程源码分析">Activity 启动流程源码分析</a></li><li><a href="#9-性能优化点">性能优化点</a></li><li><a href="#10-面试考点">面试考点</a></li></ol><hr><h2 id="_1-bootloader-启动" tabindex="-1">1. Bootloader 启动 <a class="header-anchor" href="#_1-bootloader-启动" aria-label="Permalink to &quot;1. Bootloader 启动&quot;">​</a></h2><h3 id="_1-1-bootloader-概述" tabindex="-1">1.1 Bootloader 概述 <a class="header-anchor" href="#_1-1-bootloader-概述" aria-label="Permalink to &quot;1.1 Bootloader 概述&quot;">​</a></h3><p>Bootloader 是设备开机后运行的第一段软件代码，负责初始化硬件、加载操作系统内核，是连接硬件和软件的关键桥梁。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Android Boot Flow                        │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Power On  ──→  Bootloader  ──→  Kernel  ──→  Init        │</span></span>
<span class="line"><span>│                       ↓              ↓          ↓          │</span></span>
<span class="line"><span>│               (硬件初始化)      (内核加载)   (用户空间)     │</span></span>
<span class="line"><span>│                       ↓              ↓          ↓          │</span></span>
<span class="line"><span>│               内存检测        设备树解析   系统服务启动     │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-bootloader-的启动阶段" tabindex="-1">1.2 Bootloader 的启动阶段 <a class="header-anchor" href="#_1-2-bootloader-的启动阶段" aria-label="Permalink to &quot;1.2 Bootloader 的启动阶段&quot;">​</a></h3><p>Android 采用多级 Bootloader 设计，以 AArch64 架构为例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动流程详细时序图：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Stage 0: BL1 (Reset Handler)                                      │</span></span>
<span class="line"><span>│  - 复位向量表                                                     │</span></span>
<span class="line"><span>│  - 初始化 MMU                                                      │</span></span>
<span class="line"><span>│  - 跳转到 BL2                                                      │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              ↓</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Stage 1: BL2 (ATF - ARM Trusted Firmware)                         │</span></span>
<span class="line"><span>│  - 初始化安全世界和非安全世界                                       │</span></span>
<span class="line"><span>│  - 设置 TrustZone                                                   │</span></span>
<span class="line"><span>│  - 跳转到 BL33 (正常世界)                                          │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              ↓</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Stage 2: BL33 (UEFI / Little)                                     │</span></span>
<span class="line"><span>│  - 初始化基本硬件（内存、存储、显示）                                 │</span></span>
<span class="line"><span>│  - 读取分区表                                                      │</span></span>
<span class="line"><span>│  - 加载 Kernel + DTB                                               │</span></span>
<span class="line"><span>│  - 传递启动参数                                                    │</span></span>
<span class="line"><span>│  - 跳转到 Kernel Entry Point                                       │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-3-little-bootloader-源码分析" tabindex="-1">1.3 Little Bootloader 源码分析 <a class="header-anchor" href="#_1-3-little-bootloader-源码分析" aria-label="Permalink to &quot;1.3 Little Bootloader 源码分析&quot;">​</a></h3><p>Little 是 Android 项目开源的 Bootloader，位于 <code>prebuilts/bootloader/</code></p><p><strong>关键代码解析：</strong></p><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// bootloader/little/init.c</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 系统初始化入口</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> early_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 初始化串口通信</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    uart_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 初始化内存控制器</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    dram_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 初始化显示控制器</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    display_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 加载内核和 DTB</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> load_kernel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 从分区表读取 boot 分区</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 解压 kernel 镜像</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 加载到内存指定位置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启动内核</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> boot_kernel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 设置启动参数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 传递 device tree</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 跳转到内核入口</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_1-4-boot-分区结构" tabindex="-1">1.4 Boot 分区结构 <a class="header-anchor" href="#_1-4-boot-分区结构" aria-label="Permalink to &quot;1.4 Boot 分区结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>boot.img 结构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Header (1 KB)                                              │</span></span>
<span class="line"><span>│  ├─ Kernel 地址                                             │</span></span>
<span class="line"><span>│  ├─ Ramdisk 地址                                            │</span></span>
<span class="line"><span>│  ├─ Second 加载地址                                         │</span></span>
<span class="line"><span>│  ├─ ...                                                     │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Kernel (压缩)                                              │</span></span>
<span class="line"><span>│  - 通常使用 gzip 或 lz4 压缩                                  │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Ramdisk (压缩)                                             │</span></span>
<span class="line"><span>│  - 包含 init 和早期系统初始化脚本                             │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Device Tree (DTB)                                          │</span></span>
<span class="line"><span>│  - 硬件描述表                                               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>使用 mkbootimg 工具查看：</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 反解 boot.img</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mkbootimg</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --unpack</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> boot.img</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 输出目录结构</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">├──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kernel</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              # 解压后的内核</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">├──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ramdisk</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             # 初始 ramdisk</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">├──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dtb</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                 # device tree</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">└──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ramdisk/</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # 解压后的 ramdisk 内容</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    ├──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # 第一个用户空间进程</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    ├──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init.rc</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # init 配置文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    └──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ...</span></span></code></pre></div><hr><h2 id="_2-kernel-初始化" tabindex="-1">2. Kernel 初始化 <a class="header-anchor" href="#_2-kernel-初始化" aria-label="Permalink to &quot;2. Kernel 初始化&quot;">​</a></h2><h3 id="_2-1-kernel-启动流程" tabindex="-1">2.1 Kernel 启动流程 <a class="header-anchor" href="#_2-1-kernel-启动流程" aria-label="Permalink to &quot;2.1 Kernel 启动流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Kernel 启动详细流程：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. 内核解压                                                 │</span></span>
<span class="line"><span>│     - 从 boot.img 解压到内存                                  │</span></span>
<span class="line"><span>│     - 跳转到内核入口点                                       │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  2. 早期初始化                                              │</span></span>
<span class="line"><span>│     - 初始化 CPU 寄存器                                       │</span></span>
<span class="line"><span>│     - 设置堆栈                                               │</span></span>
<span class="line"><span>│     - 内存映射                                               │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  3. 内存初始化                                              │</span></span>
<span class="line"><span>│     - 内存检测                                               │</span></span>
<span class="line"><span>│     - 分配内存页                                             │</span></span>
<span class="line"><span>│     - 初始化页表                                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  4. 设备初始化                                              │</span></span>
<span class="line"><span>│     - 初始化时钟                                             │</span></span>
<span class="line"><span>│     - 初始化中断控制器                                       │</span></span>
<span class="line"><span>│     - 初始化 DMA                                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  5. 驱动加载                                                │</span></span>
<span class="line"><span>│     - 注册总线驱动                                           │</span></span>
<span class="line"><span>│     - 加载字符设备驱动                                       │</span></span>
<span class="line"><span>│     - 加载块设备驱动                                         │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  6. 根文件系统挂载                                         │</span></span>
<span class="line"><span>│     - 挂载 ramfs                                             │</span></span>
<span class="line"><span>│     - 执行 init 程序                                         │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-内核入口函数源码分析" tabindex="-1">2.2 内核入口函数源码分析 <a class="header-anchor" href="#_2-2-内核入口函数源码分析" aria-label="Permalink to &quot;2.2 内核入口函数源码分析&quot;">​</a></h3><p><strong>架构依赖的启动代码 (arch/arm64/kernel/head.S)：</strong></p><div class="language-assembly vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">assembly</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// arch/arm64/kernel/head.S</span></span>
<span class="line"><span>// AArch64 架构内核入口</span></span>
<span class="line"><span></span></span>
<span class="line"><span>.text</span></span>
<span class="line"><span>.global __primary_switch</span></span>
<span class="line"><span>.global __boot_cpu_mode</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ENTRY(__primary_switch)</span></span>
<span class="line"><span>    // 1. 初始化二级页表</span></span>
<span class="line"><span>    mov     x20, sp</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 2. 保存启动模式</span></span>
<span class="line"><span>    mrs     x19, tpidr_el0</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 3. 初始化栈指针</span></span>
<span class="line"><span>    mov     sp, x0</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 4. 跳转到 C 代码</span></span>
<span class="line"><span>    bl      start_kernel</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 5. 内核异常处理</span></span>
<span class="line"><span>    b       .</span></span>
<span class="line"><span>ENDPROC(__primary_switch)</span></span></code></pre></div><p><strong>start_kernel() 函数 (init/main.c)：</strong></p><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// init/main.c - 内核初始化主入口</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">asmlinkage </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> __init </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start_kernel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 早期内存初始化</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setup_arch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">command_line);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 初始化各种锁</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    smp_setup_processor_id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    debug_locks_early</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 内存管理初始化</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    AGGREGATE_PM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    build_all_zonelists</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    page_reporting_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    pgdat_resize_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 初始化各种子系统</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    init_command_line</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setup_nr_cpu_ids</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setup_per_cpu_areas</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    boot_cpu_hotplug_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    smp_prepare_boot_cpu</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 初始化调度器</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    sched_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 初始化内存分配器</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    memblock_allow_resize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 7. 注册设备驱动</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    rest_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 创建 idle 任务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 8. 挂载根文件系统</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_2-3-device-tree-解析" tabindex="-1">2.3 Device Tree 解析 <a class="header-anchor" href="#_2-3-device-tree-解析" aria-label="Permalink to &quot;2.3 Device Tree 解析&quot;">​</a></h3><p>Device Tree 是 Android 内核了解硬件配置的方式。</p><p><strong>示例：device tree 节点</strong></p><div class="language-dts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">dts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// arch/arm64/boot/dts/qcom/sdm845.dtsi</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/ {</span></span>
<span class="line"><span>    model = &quot;Qualcomm SDM845&quot;;</span></span>
<span class="line"><span>    compatible = &quot;qcom,sdm845&quot;;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    cpus {</span></span>
<span class="line"><span>        cluster0 {</span></span>
<span class="line"><span>            cpu@0 {</span></span>
<span class="line"><span>                device_type = &quot;cpu&quot;;</span></span>
<span class="line"><span>                compatible = &quot;arm,cortex-a73&quot;;</span></span>
<span class="line"><span>                reg = &lt;0x0&gt;;</span></span>
<span class="line"><span>                clock-latency-ns = &lt;0&gt;;</span></span>
<span class="line"><span>            };</span></span>
<span class="line"><span>            cpu@1 {</span></span>
<span class="line"><span>                device_type = &quot;cpu&quot;;</span></span>
<span class="line"><span>                compatible = &quot;arm,cortex-a73&quot;;</span></span>
<span class="line"><span>                reg = &lt;0x1&gt;;</span></span>
<span class="line"><span>            };</span></span>
<span class="line"><span>            // ...</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    memory@0 {</span></span>
<span class="line"><span>        device_type = &quot;memory&quot;;</span></span>
<span class="line"><span>        reg = &lt;0x0 0x40000000&gt;;</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    display-subsystem {</span></span>
<span class="line"><span>        mdss_mdp {</span></span>
<span class="line"><span>            compatible = &quot;qcom,mdss-mdp-8x96&quot;;</span></span>
<span class="line"><span>            interrupts = &lt;GPI_INTERRUPT 70 0&gt;;</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>};</span></span></code></pre></div><h3 id="_2-4-重要驱动加载" tabindex="-1">2.4 重要驱动加载 <a class="header-anchor" href="#_2-4-重要驱动加载" aria-label="Permalink to &quot;2.4 重要驱动加载&quot;">​</a></h3><p><strong>Android 特有的驱动模块：</strong></p><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// drivers/android/lowmemorykiller.c</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 内存回收机制驱动</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> __init </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lmk_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 创建设备节点 /dev/lowmemorykiller</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    lmk_dev </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> misc_register</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lmk_misc);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 初始化内存监控</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// drivers/android/sync.c</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 同步栅栏机制（用于渲染同步）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sync_timeline_create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sync_timeline </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">obj;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 创建 timeline 对象</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 用于渲染管线同步</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_3-init-进程启动" tabindex="-1">3. Init 进程启动 <a class="header-anchor" href="#_3-init-进程启动" aria-label="Permalink to &quot;3. Init 进程启动&quot;">​</a></h2><h3 id="_3-1-init-进程概述" tabindex="-1">3.1 Init 进程概述 <a class="header-anchor" href="#_3-1-init-进程概述" aria-label="Permalink to &quot;3.1 Init 进程概述&quot;">​</a></h3><p>Init 是 Android 系统的第一个用户空间进程（PID=1），负责整个系统的初始化。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Init 进程启动流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Kernel 启动完成 ──→ 挂载根文件系统 ──→ 执行 init 程序        │</span></span>
<span class="line"><span>│                      ↓                                         │</span></span>
<span class="line"><span>│              ┌───────────────────────────────┐                │</span></span>
<span class="line"><span>│              │  /init                        │                │</span></span>
<span class="line"><span>│              │    - 编译自 system/core/init  │                │</span></span>
<span class="line"><span>│              └───────────────────────────────┘                │</span></span>
<span class="line"><span>│                      ↓                                        │</span></span>
<span class="line"><span>│              ┌───────────────────────────────┐                │</span></span>
<span class="line"><span>│              │  解析 init 配置文件             │                │</span></span>
<span class="line"><span>│              │  - init.rc                     │                │</span></span>
<span class="line"><span>│              │  - init.&lt;board&gt;.rc             │                │</span></span>
<span class="line"><span>│              │  - ueventd.rc                  │                │</span></span>
<span class="line"><span>│              └───────────────────────────────┘                │</span></span>
<span class="line"><span>│                      ↓                                        │</span></span>
<span class="line"><span>│              ┌───────────────────────────────┐                │</span></span>
<span class="line"><span>│              │  启动核心服务                  │                │</span></span>
<span class="line"><span>│              │  - property_service            │                │</span></span>
<span class="line"><span>│              │  - logd                        │                │</span></span>
<span class="line"><span>│              │  - ueventd                     │                │</span></span>
<span class="line"><span>│              │  - healthd                     │                │</span></span>
<span class="line"><span>│              │  - watchdogd                   │                │</span></span>
<span class="line"><span>│              └───────────────────────────────┘                │</span></span>
<span class="line"><span>│                      ↓                                        │</span></span>
<span class="line"><span>│              ┌───────────────────────────────┐                │</span></span>
<span class="line"><span>│              │  启动 Zygote                   │                │</span></span>
<span class="line"><span>│              └───────────────────────────────┘                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-init-源码分析" tabindex="-1">3.2 Init 源码分析 <a class="header-anchor" href="#_3-2-init-源码分析" aria-label="Permalink to &quot;3.2 Init 源码分析&quot;">​</a></h3><p><strong>Init 主循环 (system/core/init/init.cpp)：</strong></p><div class="language-cpp vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">cpp</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// system/core/init/init.cpp</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> argc</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">char**</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> argv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 设置初始环境</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (argc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> argv[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nullptr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        setprogname</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(argv[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 设置默认参数</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (argc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        setenv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ro.bootargs&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, argv[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 解析内核命令行参数</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    ParseKmsg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    InitLogging</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 初始化属性服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    property_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 解析 init 配置文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    std</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::vector</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">std</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> filenames </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;init Hardware.rc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;init.usb.rc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;init.console.rc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 创建早期服务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 7. 进入主事件循环</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    event_loop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 事件循环</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> event_loop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 处理命令、action 等</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 读取命令</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        std</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::string line;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        getline</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(command_pipe, line);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 执行命令</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">line.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">empty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            RunAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(line);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-3-init-配置文件解析" tabindex="-1">3.3 Init 配置文件解析 <a class="header-anchor" href="#_3-3-init-配置文件解析" aria-label="Permalink to &quot;3.3 Init 配置文件解析&quot;">​</a></h3><p><strong>init.rc 文件格式：</strong></p><div class="language-ini vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># system/core/rootdir/init.rc</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 定义属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">property: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ro.init.version</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=1.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 定义服务（早期启动）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">service ueventd /system/bin/ueventd</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class main</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    user root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    group root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    critical</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">service property /system/bin/property_service</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class main</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    user root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    group root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    critical</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 定义服务（后期启动）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">on init</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class_start main</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 设置基本参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    setprop ro.boot.bootloader \${bootloader}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    setprop ro.boot.serialno \${serialno}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 挂载文件系统</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mount tmpfs tmpfs /dev </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">tmpmode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=0755</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 启动 Zygote</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class_start late_init</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">on late-init</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 启动 Zygote</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    start zygote</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 等待 Zygote 就绪</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    wait /dev/socket/zygote</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">on boot</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 启动 SystemServer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    start zygote_init</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class_start default</span></span></code></pre></div><h3 id="_3-4-init-服务生命周期" tabindex="-1">3.4 Init 服务生命周期 <a class="header-anchor" href="#_3-4-init-服务生命周期" aria-label="Permalink to &quot;3.4 Init 服务生命周期&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Init 服务状态机：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   ┌──────────┐    启动命令    ┌──────────┐                │</span></span>
<span class="line"><span>│   │ disabled │    ──────────→ │  start   │                │</span></span>
<span class="line"><span>│   └──────────┘                └──────────┘                │</span></span>
<span class="line"><span>│        ↑                       |         |                │</span></span>
<span class="line"><span>│        │    服务停止          |  进程创建                │</span></span>
<span class="line"><span>│        │                       v         v                │</span></span>
<span class="line"><span>│   ┌──────────┐    进程退出    ┌──────────┐                │</span></span>
<span class="line"><span>│   │   dead   │    ←────────── │   run    │                │</span></span>
<span class="line"><span>│   └──────────┘                └──────────┘                │</span></span>
<span class="line"><span>│        ↑                       |                          │</span></span>
<span class="line"><span>│        │    超时重启          |  重启命令                 │</span></span>
<span class="line"><span>│        └───────────────────────┘                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-5-重要初始化动作" tabindex="-1">3.5 重要初始化动作 <a class="header-anchor" href="#_3-5-重要初始化动作" aria-label="Permalink to &quot;3.5 重要初始化动作&quot;">​</a></h3><p><strong>system/core/rootdir/init.rc 中的关键部分：</strong></p><div class="language-ini vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 设置系统属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">on early-init</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 设置设备类型</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    setprop ro.bootloader \${bootloader}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 设置 SELinux 状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    setprop init.selinux \${selinux_state}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 创建必要目录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mkdir /dev/cpuset 0755 root root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mkdir /dev/cpuset/cpu0 0755 root root</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># late-init 阶段</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">on late-init</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 启动 Zygote 进程</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    start zygote</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 配置网络</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class_start early-init</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 设置环境变量</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    export PATH /system/bin:/system/xbin</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># boot 阶段</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">on boot</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 启动所有默认服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    class_start default</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 等待 SystemServer 启动完成</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    wait /dev/socket/sysprop</span></span></code></pre></div><hr><h2 id="_4-zygote-进程启动" tabindex="-1">4. Zygote 进程启动 <a class="header-anchor" href="#_4-zygote-进程启动" aria-label="Permalink to &quot;4. Zygote 进程启动&quot;">​</a></h2><h3 id="_4-1-zygote-进程概述" tabindex="-1">4.1 Zygote 进程概述 <a class="header-anchor" href="#_4-1-zygote-进程概述" aria-label="Permalink to &quot;4.1 Zygote 进程概述&quot;">​</a></h3><p>Zygote 是 Android 应用进程的前身，通过 fork 机制快速创建新的应用进程。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Zygote 启动与进程创建流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Init 启动 Zygote                                          │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  zygote main.cpp                    │                   │</span></span>
<span class="line"><span>│   │  - 解析命令行参数                   │                   │</span></span>
<span class="line"><span>│   │  - 设置环境变量                     │                   │</span></span>
<span class="line"><span>│   │  - 创建套接字                       │                   │</span></span>
<span class="line"><span>│   │  - 预加载类                         │                   │</span></span>
<span class="line"><span>│   │  - 进入主循环                       │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  forking 循环                        │                   │</span></span>
<span class="line"><span>│   │  while (true) {                      │                   │</span></span>
<span class="line"><span>│   │    1. accept 连接                    │                   │</span></span>
<span class="line"><span>│   │    2. 读取启动参数                   │                   │</span></span>
<span class="line"><span>│   │    3. fork 创建子进程                 │                   │</span></span>
<span class="line"><span>│   │    4. 子进程执行启动代码             │                   │</span></span>
<span class="line"><span>│   │  }                                  │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  子进程（应用进程）                  │                   │</span></span>
<span class="line"><span>│   │  - 加载指定类                       │                   │</span></span>
<span class="line"><span>│   │  - 调用 main 方法                    │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-zygote-源码分析" tabindex="-1">4.2 Zygote 源码分析 <a class="header-anchor" href="#_4-2-zygote-源码分析" aria-label="Permalink to &quot;4.2 Zygote 源码分析&quot;">​</a></h3><p><strong>Zygote 主入口 (app_process.cpp)：</strong></p><div class="language-cpp vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">cpp</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/jni/com_android_internal_os_ZygoteInit.cpp</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> registerNativeMethods</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">JNIEnv</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> env</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> className</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                                  JNINativeMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> gMethods</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> numMethods</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 注册 Native 方法</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JNI_ERR;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> argc</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">char*</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> const</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> argv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 解析命令行参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vector</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String16</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> args;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> argc; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String16 </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">arg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(argv[i], </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">strlen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(argv[i]));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        args.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push_back</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(arg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 初始化 Native 桥接</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">zygoteInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(args) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. Java VM 初始化</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> runtime-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;main_sdk&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, mainSdk);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> zygoteInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Vector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">String16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> args</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 设置环境变量</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setenv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;JAVA_OPTS&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;-Xms64m -Xmx64m&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 创建 Runtime</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    JavaVMInitArgs vm_args;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm_args.version </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JNI_VERSION_1_6;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm_args.nOptions </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nOptions;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm_args.options </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> options;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm_args.ignoreUnrecognized </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 创建 JVM</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">JniCreateJavaVM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">javaVm, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vm_args) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 初始化 JNI 环境</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    JavaVM</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vm </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> javaVm;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    JNIEnv</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> env </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nullptr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (vm-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">GetEnv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">reinterpret_cast&lt;void**&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">env), JNI_VERSION_1_6) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JNI_OK) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 设置 JNI 全局引用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>ZygoteInit.java 源码分析：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] args) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 设置启动时间属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setProperty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;abc.shout.zygote.start.time&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                       Long.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">currentTimeMillis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 初始化 Zygote</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 调用 Native 方法初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ZygoteInit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">zygoteInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(args);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (RuntimeException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        LOG.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ZygoteInit&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Runtime exception in zygote init&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, e);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">exit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 预加载类</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    preloadedClasses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 进入 Zygote 服务循环</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startServerSocket</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 启动 socket 服务器</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 等待 fork 请求</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        runSelectLoop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Zygote 服务循环</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> runSelectLoop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FileDescriptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; fds </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FileDescriptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    fds.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mServerSocket.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getFileDescriptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    fdArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FileDescriptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[fds.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    fds.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toArray</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(fdArray);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 1. select 等待连接</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Socket</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; sockets </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> acceptAndLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(fds);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 2. 处理每个连接</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sockets.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                Socket socket </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sockets.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(i);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                FileDescriptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] fdPair </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> socket.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getFDPair</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 3. fork 创建子进程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Zygote.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">forkAndSpecialize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    uid, gid, gids,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    debugFlags,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    rlimits,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    mountExternal,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    seLinuxCtx,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    fdsToClose,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    fdsToIgnore,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    fdPairs,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    fileDescriptorArray,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    uid,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                    null</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (pid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 子进程继续执行</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                    zygoteInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(fdPair[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], fdPair[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (pid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 父进程关闭子进程连接</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    socket.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (IOException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 处理异常</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_4-3-预加载机制" tabindex="-1">4.3 预加载机制 <a class="header-anchor" href="#_4-3-预加载机制" aria-label="Permalink to &quot;4.3 预加载机制&quot;">​</a></h3><p><strong>ZygotePreload.java：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> native</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> preloadedClasses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // Native 实现的预加载</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> preLoadClasses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 预加载常用类</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    preloadClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;java.lang.String&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    preloadClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;java.util.ArrayList&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    preloadClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;android.content.ContentValues&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 预加载资源</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> preLoadResources</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 预加载常用资源</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Resources resources </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Resources.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSystem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    preloadColor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(resources, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    preloadColor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(resources, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_4-4-zygote-启动优化" tabindex="-1">4.4 Zygote 启动优化 <a class="header-anchor" href="#_4-4-zygote-启动优化" aria-label="Permalink to &quot;4.4 Zygote 启动优化&quot;">​</a></h3><p><strong>Zygote64 与 Zygote32：</strong></p><div class="language-ini vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># init.rc 中的 Zygote 服务定义</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">service zygote /system/bin/app_process \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    -Xzygote \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class-path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=/system/framework.jar \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=/system/framework \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --zygote \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --start-system-server \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">socket-name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=zygote</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">service zygote64 /system/bin/app_process64 \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    -Xzygote \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class-path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=/system/framework.jar \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --zygote \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    --</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">socket-name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=zygote64</span></span></code></pre></div><hr><h2 id="_5-systemserver-启动" tabindex="-1">5. SystemServer 启动 <a class="header-anchor" href="#_5-systemserver-启动" aria-label="Permalink to &quot;5. SystemServer 启动&quot;">​</a></h2><h3 id="_5-1-systemserver-启动概述" tabindex="-1">5.1 SystemServer 启动概述 <a class="header-anchor" href="#_5-1-systemserver-启动概述" aria-label="Permalink to &quot;5.1 SystemServer 启动概述&quot;">​</a></h3><p>SystemServer 是 Android 框架层的核心进程，负责启动所有系统服务。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SystemServer 启动流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Zygote fork SystemServer                                  │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  SystemServer.main()                │                   │</span></span>
<span class="line"><span>│   │  - 创建 VMRuntime                  │                   │</span></span>
<span class="line"><span>│   │  - 加载 SystemServer 类             │                   │</span></span>
<span class="line"><span>│   │  - 调用 run() 方法                   │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  SystemServer 初始化                 │                   │</span></span>
<span class="line"><span>│   │  - 创建 VMRuntime                  │                   │</span></span>
<span class="line"><span>│   │  - 注册系统服务                    │                   │</span></span>
<span class="line"><span>│   │  - 启动核心服务                    │                   │</span></span>
<span class="line"><span>│   │  - 启动应用服务                    │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  SystemServer 服务启动顺序          │                   │</span></span>
<span class="line"><span>│   │  1. ActivityManagerService          │                   │</span></span>
<span class="line"><span>│   │  2. SystemServer 进程初始化           │                   │</span></span>
<span class="line"><span>│   │  3. 其他核心服务                     │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-systemserver-源码分析" tabindex="-1">5.2 SystemServer 源码分析 <a class="header-anchor" href="#_5-2-systemserver-源码分析" aria-label="Permalink to &quot;5.2 SystemServer 源码分析&quot;">​</a></h3><p><strong>SystemServer.java 主入口：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/cmdline/SystemServer.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] args) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SystemServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建 VMRuntime</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    VMRuntime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setTargetSdkVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">999</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 启动 SystemServer 进程</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    init2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 注册系统服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    registerServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 启动核心服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startCoreServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 启动应用服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startAppServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> init2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 设置系统属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    SystemProperties.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sys.boot_completed&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 初始化 Context</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mSystemContext </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ContextImpl.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createAppContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        VMRuntime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(PackageInfo.PACKAGE_NAME)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 初始化 InputManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    InputManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mSystemContext);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 初始化其他服务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>服务启动顺序：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/SystemServer.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 第一阶段：核心服务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. ActivityManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mActivityManagerService </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. WindowManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mWindowManagerService </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> WindowManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. InputManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mInputManagerService </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InputManager</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 第二阶段：系统服务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. PackageManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mPackageManagerService </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. PowerManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mPowerManagerService </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PowerManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. AudioService</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mAudioService </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AudioService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 第三阶段：应用服务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 7. TelephonyService</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 8. LocationService</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 9. 其他服务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-3-activitymanagerservice-启动" tabindex="-1">5.3 ActivityManagerService 启动 <a class="header-anchor" href="#_5-3-activitymanagerservice-启动" aria-label="Permalink to &quot;5.3 ActivityManagerService 启动&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mActivityController </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityTaskManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 创建进程记录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mProcessRecords </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HashMap&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ProcessRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 初始化应用列表</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mAppRecords </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HashMap&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ApplicationRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ApplicationRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 注册系统服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mSystemServer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">registerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ActivityManagerService.class.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 启动 AMS 服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mActivityController.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 加载系统应用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    loadSystemApplications</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 启动系统进程</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startSystemProcesses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 启动 Launcher</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startLauncher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-4-packagemanagerservice-启动" tabindex="-1">5.4 PackageManagerService 启动 <a class="header-anchor" href="#_5-4-packagemanagerservice-启动" aria-label="Permalink to &quot;5.4 PackageManagerService 启动&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Context context, Installer installer,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                              boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> onlyCore) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 初始化 PMS</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mInstaller </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> installer;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mOnlyCore </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> onlyCore;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 加载包管理器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mPackageParser </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageParser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 扫描已安装应用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    scanPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> scanPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 扫描系统应用目录</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    scanPackageDir</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/system/app&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 扫描用户应用目录</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    scanPackageDir</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/data/app&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 解析 APK 文件</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 验证签名</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 安装应用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-5-服务启动时序图" tabindex="-1">5.5 服务启动时序图 <a class="header-anchor" href="#_5-5-服务启动时序图" aria-label="Permalink to &quot;5.5 服务启动时序图&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SystemServer 服务启动时序：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   0ms   ──→ SystemServer.main()                              │</span></span>
<span class="line"><span>│          ──→ 创建 VMRuntime                                  │</span></span>
<span class="line"><span>│          ──→ SystemServer.run()                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   100ms  ──→ ActivityManagerService 创建                       │</span></span>
<span class="line"><span>│          ──→ AMS 初始化完成                                    │</span></span>
<span class="line"><span>│          ──→ AMS 注册到 ServiceManager                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   200ms  ──→ WindowManagerService 创建                         │</span></span>
<span class="line"><span>│          ──→ WMS 初始化完成                                    │</span></span>
<span class="line"><span>│          ──→ WMS 注册到 ServiceManager                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   300ms  ──→ PackageManagerService 创建                        │</span></span>
<span class="line"><span>│          ──→ PMS 扫描系统应用                                  │</span></span>
<span class="line"><span>│          ──→ PMS 注册到 ServiceManager                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   500ms  ──→ 其他系统服务启动                                  │</span></span>
<span class="line"><span>│          ──→ 服务启动完成                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_6-launcher-启动" tabindex="-1">6. Launcher 启动 <a class="header-anchor" href="#_6-launcher-启动" aria-label="Permalink to &quot;6. Launcher 启动&quot;">​</a></h2><h3 id="_6-1-launcher-启动概述" tabindex="-1">6.1 Launcher 启动概述 <a class="header-anchor" href="#_6-1-launcher-启动概述" aria-label="Permalink to &quot;6.1 Launcher 启动概述&quot;">​</a></h3><p>Launcher 是用户看到的第一个应用，是 Android 系统的重要入口。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Launcher 启动流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   SystemServer 启动完成后                                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  AMS 启动 Launcher                   │                   │</span></span>
<span class="line"><span>│   │  - 创建 Launcher 进程                │                   │</span></span>
<span class="line"><span>│   │  - 启动 LauncherActivity             │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  Launcher 进程初始化                 │                   │</span></span>
<span class="line"><span>│   │  - 加载 Launcher 应用                │                   │</span></span>
<span class="line"><span>│   │  - 创建 LauncherActivity             │                   │</span></span>
<span class="line"><span>│   │  - 初始化布局                       │                   │</span></span>
<span class="line"><span>│   │  - 加载图标                         │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  LauncherActivity 生命周期          │                   │</span></span>
<span class="line"><span>│   │  - onCreate()                       │                   │</span></span>
<span class="line"><span>│   │  - onStart()                        │                   │</span></span>
<span class="line"><span>│   │  - onResume()                       │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │  Launcher 显示完成                   │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_6-2-launcher-启动源码分析" tabindex="-1">6.2 Launcher 启动源码分析 <a class="header-anchor" href="#_6-2-launcher-启动源码分析" aria-label="Permalink to &quot;6.2 Launcher 启动源码分析&quot;">​</a></h3><p><strong>Launcher 启动过程：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startLauncherActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IActivityStarter starter,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                         int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取 Launcher 组件名</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ComponentName componentName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ComponentName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;com.android.launcher3&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;com.android.launcher3.Launcher&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 创建 Intent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Intent intent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Intent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setComponent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(componentName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addFlags</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent.FLAG_ACTIVITY_NEW_TASK);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 启动 Launcher Activity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityStack stack </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mRootTaskStack;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    stack.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resumeTopActivityUncheckedOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 创建 Launcher 进程</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mProcessRecords.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(LAUNCHER_PROCESS_NAME, launcherProcess);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 启动进程</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startProcessAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(launcherProcess, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>Launcher.java onCreate：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// packages/apps/Launcher3/src/com/android/launcher3/Launcher.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Launcher</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Activity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ... {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Bundle </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">savedInstanceState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(savedInstanceState);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 设置主题</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        setTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.style.Theme_Launcher);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 设置内容视图</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        setContentView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.layout.launcher);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 初始化工作空间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mWorkspace </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findViewById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.id.workspace);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mWorkspace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onFinishLoading</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 4. 加载图标</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mModel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LauncherModel.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mModel.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loadIcons</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 5. 初始化文件夹</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mFolderController </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FolderController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 6. 初始化拖放功能</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mDragLayer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findViewById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.id.drag_layer);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mDragController </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DragController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 7. 显示工作空间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mWorkspace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">show</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 注册广播接收器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        IntentFilter filter </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> IntentFilter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        filter.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent.ACTION_SCREEN_ON);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        filter.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent.ACTION_SCREEN_OFF);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        filter.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent.ACTION_USER_PRESENT);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        registerReceiver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mBroadcastReceiver, filter);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onResume</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onResume</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 更新视图</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mWorkspace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onResume</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 恢复焦点</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mWorkspace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">requestFocus</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_6-3-launcher-初始化优化" tabindex="-1">6.3 Launcher 初始化优化 <a class="header-anchor" href="#_6-3-launcher-初始化优化" aria-label="Permalink to &quot;6.3 Launcher 初始化优化&quot;">​</a></h3><p><strong>异步加载优化：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 异步加载图标</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadIconsAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AsyncTask&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Icon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&gt;() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        protected</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Icon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doInBackground</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Void... </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 后台加载图标</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadIcons</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onPostExecute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Icon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icons</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 更新 UI</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            updateIcons</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(icons);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_7-app-冷启动-热启动流程" tabindex="-1">7. App 冷启动/热启动流程 <a class="header-anchor" href="#_7-app-冷启动-热启动流程" aria-label="Permalink to &quot;7. App 冷启动/热启动流程&quot;">​</a></h2><h3 id="_7-1-启动类型对比" tabindex="-1">7.1 启动类型对比 <a class="header-anchor" href="#_7-1-启动类型对比" aria-label="Permalink to &quot;7.1 启动类型对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>冷启动 vs 热启动：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   冷启动 (Cold Start)                                       │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 1. 进程不存在                        │                   │</span></span>
<span class="line"><span>│   │ 2. 需要创建新进程                    │                   │</span></span>
<span class="line"><span>│   │ 3. 加载 APK                        │                   │</span></span>
<span class="line"><span>│   │ 4. 初始化 Application              │                   │</span></span>
<span class="line"><span>│   │ 5. 创建 Activity                   │                   │</span></span>
<span class="line"><span>│   │ 6. 加载布局                        │                   │</span></span>
<span class="line"><span>│   │ 7. 执行 onCreate/onStart/onResume   │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   热启动 (Hot Start)                                        │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 1. 进程已存在                        │                   │</span></span>
<span class="line"><span>│   │ 2. 复用已启动的进程                  │                   │</span></span>
<span class="line"><span>│   │ 3. 直接从栈中恢复 Activity           │                   │</span></span>
<span class="line"><span>│   │ 4. 执行 onStart/onResume            │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   温启动 (Warm Start)                                       │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 1. 进程已存在                        │                   │</span></span>
<span class="line"><span>│   │ 2. 复用已启动的进程                  │                   │</span></span>
<span class="line"><span>│   │ 3. 重新创建 Activity                │                   │</span></span>
<span class="line"><span>│   │ 4. 执行 onCreate/onStart/onResume   │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_7-2-冷启动详细流程" tabindex="-1">7.2 冷启动详细流程 <a class="header-anchor" href="#_7-2-冷启动详细流程" aria-label="Permalink to &quot;7.2 冷启动详细流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>冷启动流程详细图：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   User 点击 Icon                                          │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 1. Launcher 发送启动请求              │                   │</span></span>
<span class="line"><span>│   │    startActivity(intent)             │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 2. AMS 接收启动请求                  │                   │</span></span>
<span class="line"><span>│   │    ActivityManagerService.startActivity() │              │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 3. AMS 检查进程状态                  │                   │</span></span>
<span class="line"><span>│   │    - 进程不存在                     │                   │</span></span>
<span class="line"><span>│   │    - 创建新进程                     │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 4. AMS 调用 Zygote fork 进程           │                   │</span></span>
<span class="line"><span>│   │    startProcessLocked()             │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 5. Zygote fork 创建新进程             │                   │</span></span>
<span class="line"><span>│   │    forkAndSpecialize()              │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 6. 新进程初始化                     │                   │</span></span>
<span class="line"><span>│   │    - 加载 Application ClassLoader    │                   │</span></span>
<span class="line"><span>│   │    - 创建 Application 对象            │                   │</span></span>
<span class="line"><span>│   │    - 调用 Application.onCreate()    │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 7. 创建 Activity                    │                   │</span></span>
<span class="line"><span>│   │    - 调用 ActivityThread.main()     │                   │</span></span>
<span class="line"><span>│   │    - 创建 Activity 对象              │                   │</span></span>
<span class="line"><span>│   │    - 调用 Activity.onCreate()        │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 8. 布局渲染                        │                   │</span></span>
<span class="line"><span>│   │    - 解析布局文件                  │                   │</span></span>
<span class="line"><span>│   │    - 创建视图树                    │                   │</span></span>
<span class="line"><span>│   │    - 测量和布局                    │                   │</span></span>
<span class="line"><span>│   │    - 绘制显示                      │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│          ↓                                                   │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────┐                   │</span></span>
<span class="line"><span>│   │ 9. 启动完成                        │                   │</span></span>
<span class="line"><span>│   │    - Activity 显示                 │                   │</span></span>
<span class="line"><span>│   └─────────────────────────────────────┘                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_7-3-冷启动源码分析" tabindex="-1">7.3 冷启动源码分析 <a class="header-anchor" href="#_7-3-冷启动源码分析" aria-label="Permalink to &quot;7.3 冷启动源码分析&quot;">​</a></h3><p><strong>ActivityManagerService.startActivity：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IActivityStarter caller,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                Intent intent,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                String resolvedType,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                ActivityRecord resultTo,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取调用者信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProcessRecord callerApp </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getAppRecordForIntent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 解析 Intent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityRecord activityRecord </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent, resolvedType, callerApp, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 检查进程是否存在</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProcessRecord processRecord </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getProcessRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(activityRecord.info.packageName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (processRecord </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 4. 进程不存在，创建新进程</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        processRecord </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            activityRecord.info.packageName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            activityRecord.info.processName,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 将 Activity 加入任务栈</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mStackSupervisor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(activityRecord);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 启动 Activity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    processRecord.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(activityRecord);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>ActivityThread.main：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/app/ActivityThread.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] args) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建 ActivityThread 实例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityThread thread </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityThread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 附着到系统服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    thread.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">attach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 进入消息循环</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Looper.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> attach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> system) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取 Application</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mApplication </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createApplication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 创建 Activity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Activity activity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mApplication,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        activityInfo</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 调用 Activity 生命周期</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performResume</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_7-4-热启动优化" tabindex="-1">7.4 热启动优化 <a class="header-anchor" href="#_7-4-热启动优化" aria-label="Permalink to &quot;7.4 热启动优化&quot;">​</a></h3><p><strong>Activity 复用策略：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ActivityStack.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityRecord </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">topActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取任务栈顶的 Activity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    TaskRecord task </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mTopTask;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (task </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> task.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">topActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 如果没有任务栈，创建新任务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> resumeTopActivityLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取栈顶 Activity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityRecord top </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> topActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (top </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 如果进程存在，直接恢复</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (top.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getProcess</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> top.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getProcess</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isAlive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 热启动</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            resumeActivityLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(top);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 3. 如果进程不存在，冷启动</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(top.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getProcessName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_7-5-启动时间统计" tabindex="-1">7.5 启动时间统计 <a class="header-anchor" href="#_7-5-启动时间统计" aria-label="Permalink to &quot;7.5 启动时间统计&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动时间分布：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   进程创建时间：~50-100ms                                   │</span></span>
<span class="line"><span>│   └─ Zygote fork + 进程初始化                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Application 初始化：~50-200ms                             │</span></span>
<span class="line"><span>│   └─ Application.onCreate()                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Activity 创建时间：~100-300ms                             │</span></span>
<span class="line"><span>│   └─ Activity.onCreate() + onRestoreInstanceState()          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   布局加载时间：~50-200ms                                   │</span></span>
<span class="line"><span>│   └─ XML 解析 + View 创建 + 测量 + 布局                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   总冷启动时间：~300-800ms                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   热启动时间：~50-150ms                                     │</span></span>
<span class="line"><span>│   └─ 直接从栈中恢复 Activity                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_8-activity-启动流程源码分析" tabindex="-1">8. Activity 启动流程源码分析 <a class="header-anchor" href="#_8-activity-启动流程源码分析" aria-label="Permalink to &quot;8. Activity 启动流程源码分析&quot;">​</a></h2><h3 id="_8-1-activity-启动完整流程" tabindex="-1">8.1 Activity 启动完整流程 <a class="header-anchor" href="#_8-1-activity-启动完整流程" aria-label="Permalink to &quot;8.1 Activity 启动完整流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Activity 启动完整源码流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   调用方                                                    │</span></span>
<span class="line"><span>│   ├─ startActivity(intent)                                   │</span></span>
<span class="line"><span>│   └─ PackageManagerService 解析 Intent                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   ├─ ActivityManagerService                                    │</span></span>
<span class="line"><span>│   │   ├─ startActivity()                                    │</span></span>
<span class="line"><span>│   │   ├─ startActivityAsUser()                              │</span></span>
<span class="line"><span>│   │   ├─ startActivityMayWait()                             │</span></span>
<span class="line"><span>│   │   └─ startActivityLocked()                              │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ TaskStackManager                                        │</span></span>
<span class="line"><span>│   │   ├─ startActivity()                                    │</span></span>
<span class="line"><span>│   │   ├─ checkStartActivityConstraints()                      │</span></span>
<span class="line"><span>│   │   └─ startActivity()                                    │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ ActivityStack                                           │</span></span>
<span class="line"><span>│   │   ├─ startActivity()                                    │</span></span>
<span class="line"><span>│   │   ├─ startActivityUnchecked()                           │</span></span>
<span class="line"><span>│   │   └─ startActivity()                                    │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ ProcessRecord                                           │</span></span>
<span class="line"><span>│   │   ├─ startProcessLocked()                                │</span></span>
<span class="line"><span>│   │   └─ 创建进程                                            │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ ActivityThread                                          │</span></span>
<span class="line"><span>│   │   ├─ main()                                             │</span></span>
<span class="line"><span>│   │   ├─ attach()                                           │</span></span>
<span class="line"><span>│   │   └─ handleMessage()                                    │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ Activity                                                │</span></span>
<span class="line"><span>│   │   ├─ onCreate()                                         │</span></span>
<span class="line"><span>│   │   ├─ onStart()                                          │</span></span>
<span class="line"><span>│   │   └─ onResume()                                         │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ WindowManager                                           │</span></span>
<span class="line"><span>│       ├─ addView()                                          │</span></span>
<span class="line"><span>│       └─ 显示窗口                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_8-2-源码详细解析" tabindex="-1">8.2 源码详细解析 <a class="header-anchor" href="#_8-2-源码详细解析" aria-label="Permalink to &quot;8.2 源码详细解析&quot;">​</a></h3><p><strong>1. Application.startActivity：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/app/ContextImpl.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent intent) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取 ActivityManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IActivityManager service </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 调用 startActivity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    service.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ActivityOptions.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">makeReadOnly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>2. ActivityManagerService.startActivity：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IApplication caller,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String callingPackage,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Intent intent,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String resolvedType,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IVoiceInteraction voiceInteraction,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityOptions options,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String resultWho,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startFlags,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProfilingInfo profilingInfo,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ignoreTargetSecurity,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> fromSourceStack,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IActivityResultReceiver resultReceiver) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取调用者信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityRecord callerActivity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (caller </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        callerActivity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> caller.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getActivityRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 解析 Intent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityRecord targetActivity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent, resolvedType, callerActivity, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 获取应用信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ApplicationInfo appInfo </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mPM.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getActivityInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        targetActivity.info.packageName, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 创建启动参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityStartRecord startRecord </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityStartRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        targetActivity, callerActivity, appInfo);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 调用 TaskStackManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mStackSupervisor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(startRecord);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>3. TaskStackManager.startActivity：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/TaskStackManager.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ActivityStartRecord startRecord) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查启动约束</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkStartActivityConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(startRecord)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 获取任务栈</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    TaskRecord task </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getFocusedStack</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 启动 Activity</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> task.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(startRecord);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> checkStartActivityConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ActivityStartRecord startRecord) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查 Launcher 是否启动完成</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mLauncherReady </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startRecord.launcherActivity) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 检查系统是否就绪</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mSystemReady) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>4. ActivityStack.startActivity：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/ActivityStack.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ActivityStartRecord startRecord) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取 Activity 信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityRecord r </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startRecord.activity;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 检查进程状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProcessRecord process </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> r.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getProcess</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (process </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 进程不存在，启动进程</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            r.info.packageName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            r.info.processName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            r.info.applicationInfo.flags </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityInfo.FLAG_DEBUGGABLE,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 将 Activity 加入任务栈</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    r.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addToTask</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 启动 Activity</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivityUnchecked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(startRecord);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>5. 进程启动：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessRecord </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String processName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ApplicationInfo info,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> knownToBeDead,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> intentFlags,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String hostingType,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String hostingPid,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> keepIfLarge,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> hideIfNotGid) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取进程记录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProcessRecord proc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getProcessRecordLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(processName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 如果进程不存在，创建进程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (proc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        proc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ProcessRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(processName, info);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 创建启动参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; args </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    args.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--process=&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> processName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    args.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--nice=&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> info.lru);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    args.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--uid=&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> info.uid);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    args.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--runtime=&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> info.name);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 调用 Zygote fork 进程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startTime </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SystemClock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">elapsedRealtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Process.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(args.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toArray</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 更新进程状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    proc.startForkTime </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SystemClock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">elapsedRealtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> proc;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>6. ActivityThread 处理：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/app/ActivityThread.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] args) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建 ActivityThread</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityThread thread </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityThread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 附着到系统服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    thread.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">attach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 进入消息循环</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Looper.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> attach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> system) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 设置当前 ActivityThread</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    sCurrentActivityThread </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 获取 Application</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mApplication </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createApplication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 注册到 ActivityManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IActivityManager mgr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mgr.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">attachApplication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mApplication);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (RemoteException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        throw</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> e;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>7. Activity 创建：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/app/ActivityThread.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Activity </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performCreateActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IBinder app,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String className,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Intent intent,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityInfo info,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Configuration config) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建类加载器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ClassLoader cl </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getPackageClassLoader</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(info.applicationInfo);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 创建 Activity 类</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Activity activity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        activity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Activity) cl.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loadClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(className).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">newInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Exception </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        throw</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> e;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 设置 Activity 属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setIntent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(info);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 创建 Context</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Context context </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createContextForActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        activity,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        app,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        config</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 调用 attach</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">attach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstrumentation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    app, info);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> activity;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> callActivityOnCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Activity activity) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 调用 onCreate</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 调用 onStart</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 调用 onResume</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">performResume</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_8-3-activity-启动模式" tabindex="-1">8.3 Activity 启动模式 <a class="header-anchor" href="#_8-3-activity-启动模式" aria-label="Permalink to &quot;8.3 Activity 启动模式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Activity 启动模式：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   standard (标准模式)                                         │</span></span>
<span class="line"><span>│   ├─ 每次启动创建新的 Activity 实例                            │</span></span>
<span class="line"><span>│   ├─ 可以存在于多个任务栈中                                  │</span></span>
<span class="line"><span>│   └─ 默认启动模式                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   singleTop (栈顶模式)                                        │</span></span>
<span class="line"><span>│   ├─ 如果栈顶是同类型 Activity，复用                           │</span></span>
<span class="line"><span>│   ├─ 否则创建新的实例                                        │</span></span>
<span class="line"><span>│   └─ 适用于首页                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   singleTask (单任务模式)                                     │</span></span>
<span class="line"><span>│   ├─ 在同一任务栈中只有一个实例                               │</span></span>
<span class="line"><span>│   ├─ 复用时清除栈顶的 Activity                                │</span></span>
<span class="line"><span>│   └─ 适用于浏览器                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   singleInstance (单实例模式)                                 │</span></span>
<span class="line"><span>│   ├─ 独占一个任务栈                                          │</span></span>
<span class="line"><span>│   ├─ 始终复用同一个实例                                      │</span></span>
<span class="line"><span>│   └─ 适用于电话、短信等系统应用                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_8-4-源码引用" tabindex="-1">8.4 源码引用 <a class="header-anchor" href="#_8-4-源码引用" aria-label="Permalink to &quot;8.4 源码引用&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>关键源码文件：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   frameworks/base/core/java/android/app/                       │</span></span>
<span class="line"><span>│   ├─ ContextImpl.java                                       │</span></span>
<span class="line"><span>│   ├─ Activity.java                                          │</span></span>
<span class="line"><span>│   ├─ ActivityThread.java                                    │</span></span>
<span class="line"><span>│   ├─ Application.java                                       │</span></span>
<span class="line"><span>│   └─ Context.java                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   frameworks/base/services/java/com/android/server/am/       │</span></span>
<span class="line"><span>│   ├─ ActivityManagerService.java                            │</span></span>
<span class="line"><span>│   ├─ ActivityRecord.java                                    │</span></span>
<span class="line"><span>│   ├─ ActivityStack.java                                     │</span></span>
<span class="line"><span>│   ├─ ActivityStackSupervisor.java                           │</span></span>
<span class="line"><span>│   ├─ ProcessRecord.java                                     │</span></span>
<span class="line"><span>│   ├─ TaskStackManager.java                                  │</span></span>
<span class="line"><span>│   └─ AppProcess.java                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   frameworks/base/core/java/android/app/invoke/              │</span></span>
<span class="line"><span>│   ├─ AppInvoke.java                                         │</span></span>
<span class="line"><span>│   └─ IAppInvoke.java                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   frameworks/base/core/java/com/android/internal/os/         │</span></span>
<span class="line"><span>│   ├─ ZygoteInit.java                                        │</span></span>
<span class="line"><span>│   └─ Process.java                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_9-性能优化点" tabindex="-1">9. 性能优化点 <a class="header-anchor" href="#_9-性能优化点" aria-label="Permalink to &quot;9. 性能优化点&quot;">​</a></h2><h3 id="_9-1-启动性能优化" tabindex="-1">9.1 启动性能优化 <a class="header-anchor" href="#_9-1-启动性能优化" aria-label="Permalink to &quot;9.1 启动性能优化&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动性能优化策略：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   启动前优化                                                │</span></span>
<span class="line"><span>│   ├─ 预加载                                                  │</span></span>
<span class="line"><span>│   │   ├─ Zygote 预加载常用类                                 │</span></span>
<span class="line"><span>│   │   ├─ SystemServer 预启动                                 │</span></span>
<span class="line"><span>│   │   └─ 预加载资源                                          │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 代码优化                                                │</span></span>
<span class="line"><span>│   │   ├─ 减少 APK 大小                                        │</span></span>
<span class="line"><span>│   │   ├─ 减少类数量                                          │</span></span>
<span class="line"><span>│   │   └─ 优化DEX 结构                                         │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 资源优化                                                │</span></span>
<span class="line"><span>│       ├─ 压缩图片                                            │</span></span>
<span class="line"><span>│       ├─ 使用矢量图                                          │</span></span>
<span class="line"><span>│       └─ 减少资源数量                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   启动中优化                                                │</span></span>
<span class="line"><span>│   ├─ 异步初始化                                              │</span></span>
<span class="line"><span>│   │   ├─ Application 异步初始化                               │</span></span>
<span class="line"><span>│   │   ├─ Activity 异步加载布局                                 │</span></span>
<span class="line"><span>│   │   └─ 异步加载数据                                        │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 懒加载                                                  │</span></span>
<span class="line"><span>│   │   ├─ 延迟加载非关键组件                                    │</span></span>
<span class="line"><span>│   │   ├─ 按需加载图片                                          │</span></span>
<span class="line"><span>│   │   └─ 按需初始化服务                                      │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 布局优化                                                │</span></span>
<span class="line"><span>│       ├─ 简化布局层级                                        │</span></span>
<span class="line"><span>│       ├─ 使用 ConstraintLayout                               │</span></span>
<span class="line"><span>│       └─ 避免复杂动画                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   启动后优化                                                │</span></span>
<span class="line"><span>│   ├─ 预加载                                                  │</span></span>
<span class="line"><span>│   │   ├─ 预加载下一页数据                                      │</span></span>
<span class="line"><span>│   │   ├─ 预加载常用图片                                        │</span></span>
<span class="line"><span>│   │   └─ 预初始化服务                                        │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 缓存优化                                                │</span></span>
<span class="line"><span>│   │   ├─ 内存缓存                                            │</span></span>
<span class="line"><span>│   │   ├─ 磁盘缓存                                            │</span></span>
<span class="line"><span>│   │   └─ 网络缓存                                            │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 进程保活                                                │</span></span>
<span class="line"><span>│       ├─ 前台服务                                            │</span></span>
<span class="line"><span>│       ├─ 进程间通信                                          │</span></span>
<span class="line"><span>│       └─ 广播接收                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_9-2-启动时间优化方案" tabindex="-1">9.2 启动时间优化方案 <a class="header-anchor" href="#_9-2-启动时间优化方案" aria-label="Permalink to &quot;9.2 启动时间优化方案&quot;">​</a></h3><p><strong>1. Application 异步初始化：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Application.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyApplication</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Application</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 初始化基础服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        initBaseServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 异步初始化其他服务</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Handler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Looper.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMainLooper</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">post</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            initAsyncServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 延迟初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ApplicationInitializer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">initAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            initDeferredServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> initAsyncServices</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 异步初始化分析 SDK</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Analytics.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 异步初始化网络库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Network.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 异步初始化图片库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ImageLoader.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>2. Activity 异步加载：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Activity.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MainActivity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppCompatActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Bundle </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">savedInstanceState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(savedInstanceState);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 立即显示启动页</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        setContentView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.layout.activity_launch);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 异步加载主页面</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AsyncTask&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            protected</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Boolean </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doInBackground</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Void... </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 后台加载数据</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                loadData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onPostExecute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Boolean </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">result</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 显示主页面</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                setContentView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.layout.activity_main);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>3. 布局优化：</strong></p><div class="language-xml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">xml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- 使用 ConstraintLayout 减少层级 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">androidx.constraintlayout.widget.ConstraintLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    xmlns:android</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;http://schemas.android.com/apk/res/android&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    xmlns:app</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;http://schemas.android.com/apk/res-auto&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    android:layout_width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;match_parent&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    android:layout_height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;match_parent&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">ImageView</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@+id/iv_icon&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:layout_width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;48dp&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:layout_height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;48dp&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintTop_toTopOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;parent&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintStart_toStartOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;parent&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintEnd_toEndOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;parent&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintBottom_toTopOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@+id/tv_title&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TextView</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@+id/tv_title&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:layout_width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;wrap_content&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:layout_height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;wrap_content&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintTop_toBottomOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@+id/iv_icon&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintStart_toStartOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;parent&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        app:layout_constraintEnd_toEndOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;parent&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">androidx.constraintlayout.widget.ConstraintLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="_9-3-启动时间监控" tabindex="-1">9.3 启动时间监控 <a class="header-anchor" href="#_9-3-启动时间监控" aria-label="Permalink to &quot;9.3 启动时间监控&quot;">​</a></h3><p><strong>使用 Trace 工具：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启动时间追踪</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StartupTracer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String TAG </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;StartupTracer&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> trace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">tag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        android.util.Log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">d</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(TAG, tag </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;: &quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> message);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Trace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">beginSection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(tag);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> endTrace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">tag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Trace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">endSection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在关键位置插入追踪</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MainActivity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppCompatActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Bundle </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">savedInstanceState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        StartupTracer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;onCreate&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;开始&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onCreate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(savedInstanceState);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        StartupTracer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">endTrace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;onCreate&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_9-4-启动性能测试" tabindex="-1">9.4 启动性能测试 <a class="header-anchor" href="#_9-4-启动性能测试" aria-label="Permalink to &quot;9.4 启动性能测试&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动性能测试方法：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   工具测试                                                    │</span></span>
<span class="line"><span>│   ├─ Android Studio Profiler                                │</span></span>
<span class="line"><span>│   │   ├─ CPU Profiler                                       │</span></span>
<span class="line"><span>│   │   ├─ Memory Profiler                                    │</span></span>
<span class="line"><span>│   │   └─ Network Profiler                                   │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ Systrace                                                 │</span></span>
<span class="line"><span>│   │   ├─ 系统追踪                                            │</span></span>
<span class="line"><span>│   │   └─ 性能分析                                            │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ Perfetto                                                 │</span></span>
<span class="line"><span>│       ├─ 性能分析                                            │</span></span>
<span class="line"><span>│       └─ 可视化展示                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   手动测试                                                    │</span></span>
<span class="line"><span>│   ├─ 计时测试                                                │</span></span>
<span class="line"><span>│   │   ├─ 从点击到首帧显示                                    │</span></span>
<span class="line"><span>│   │   └─ 从点击到完全加载                                    │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 多次测试                                                  │</span></span>
<span class="line"><span>│   │   ├─ 冷启动测试                                          │</span></span>
<span class="line"><span>│   │   ├─ 热启动测试                                          │</span></span>
<span class="line"><span>│   │   └─ 温启动测试                                          │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 统计分析                                                  │</span></span>
<span class="line"><span>│       ├─ 平均值                                                │</span></span>
<span class="line"><span>│       ├─ 最大值                                                │</span></span>
<span class="line"><span>│       └─ 最小值                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_9-5-启动性能优化清单" tabindex="-1">9.5 启动性能优化清单 <a class="header-anchor" href="#_9-5-启动性能优化清单" aria-label="Permalink to &quot;9.5 启动性能优化清单&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动性能优化检查清单：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   代码层面                                                    │</span></span>
<span class="line"><span>│   ├─ [ ] 减少 APK 大小                                        │</span></span>
<span class="line"><span>│   ├─ [ ] 优化类加载                                          │</span></span>
<span class="line"><span>│   ├─ [ ] 异步初始化                                          │</span></span>
<span class="line"><span>│   ├─ [ ] 懒加载                                              │</span></span>
<span class="line"><span>│   ├─ [ ] 减少反射                                            │</span></span>
<span class="line"><span>│   └─ [ ] 优化算法                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   资源层面                                                    │</span></span>
<span class="line"><span>│   ├─ [ ] 压缩图片                                            │</span></span>
<span class="line"><span>│   ├─ [ ] 使用矢量图                                          │</span></span>
<span class="line"><span>│   ├─ [ ] 减少资源数量                                        │</span></span>
<span class="line"><span>│   ├─ [ ] 优化布局                                            │</span></span>
<span class="line"><span>│   └─ [ ] 减少布局层级                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   架构层面                                                    │</span></span>
<span class="line"><span>│   ├─ [ ] 优化架构设计                                        │</span></span>
<span class="line"><span>│   ├─ [ ] 模块化                                              │</span></span>
<span class="line"><span>│   ├─ [ ] 组件化                                              │</span></span>
<span class="line"><span>│   ├─ [ ] 动态化                                              │</span></span>
<span class="line"><span>│   └─ [ ] 服务化                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   网络层面                                                    │</span></span>
<span class="line"><span>│   ├─ [ ] 优化网络请求                                        │</span></span>
<span class="line"><span>│   ├─ [ ] 使用缓存                                            │</span></span>
<span class="line"><span>│   ├─ [ ] 预加载                                              │</span></span>
<span class="line"><span>│   ├─ [ ] 优化协议                                            │</span></span>
<span class="line"><span>│   └─ [ ] 使用 CDN                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_10-面试考点" tabindex="-1">10. 面试考点 <a class="header-anchor" href="#_10-面试考点" aria-label="Permalink to &quot;10. 面试考点&quot;">​</a></h2><h3 id="_10-1-基础考点" tabindex="-1">10.1 基础考点 <a class="header-anchor" href="#_10-1-基础考点" aria-label="Permalink to &quot;10.1 基础考点&quot;">​</a></h3><p><strong>1. Android 启动流程是什么？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. Bootloader 启动                                          │</span></span>
<span class="line"><span>│      ├─ 硬件初始化                                           │</span></span>
<span class="line"><span>│      ├─ 内存检测                                             │</span></span>
<span class="line"><span>│      ├─ 加载 Kernel + DTB                                    │</span></span>
<span class="line"><span>│      └─ 跳转到 Kernel                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. Kernel 初始化                                           │</span></span>
<span class="line"><span>│      ├─ 解压 Kernel                                          │</span></span>
<span class="line"><span>│      ├─ 初始化硬件驱动                                       │</span></span>
<span class="line"><span>│      ├─ 挂载根文件系统                                       │</span></span>
<span class="line"><span>│      └─ 执行 init 程序                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. Init 进程启动                                           │</span></span>
<span class="line"><span>│      ├─ 解析 init 配置文件                                    │</span></span>
<span class="line"><span>│      ├─ 启动核心服务                                         │</span></span>
<span class="line"><span>│      ├─ 启动 Zygote                                          │</span></span>
<span class="line"><span>│      └─ 进入主循环                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. Zygote 进程启动                                         │</span></span>
<span class="line"><span>│      ├─ 创建 JVM                                             │</span></span>
<span class="line"><span>│      ├─ 预加载类                                             │</span></span>
<span class="line"><span>│      ├─ 创建 socket 服务器                                    │</span></span>
<span class="line"><span>│      └─ 等待 fork 请求                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. SystemServer 启动                                       │</span></span>
<span class="line"><span>│      ├─ Zygote fork 进程                                      │</span></span>
<span class="line"><span>│      ├─ 加载 SystemServer 类                                  │</span></span>
<span class="line"><span>│      ├─ 启动系统服务                                         │</span></span>
<span class="line"><span>│      └─ 启动 Launcher                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   6. Launcher 启动                                           │</span></span>
<span class="line"><span>│      ├─ 创建 Launcher 进程                                    │</span></span>
<span class="line"><span>│      ├─ 加载 LauncherActivity                                 │</span></span>
<span class="line"><span>│      ├─ 初始化布局                                           │</span></span>
<span class="line"><span>│      └─ 显示 Launcher                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. Zygote 的作用是什么？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 进程快速创建                                            │</span></span>
<span class="line"><span>│      ├─ 通过 fork 机制快速创建进程                            │</span></span>
<span class="line"><span>│      ├─ 共享父进程内存                                        │</span></span>
<span class="line"><span>│      └─ 减少进程启动时间                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 内存优化                                                │</span></span>
<span class="line"><span>│      ├─ 预加载常用类                                          │</span></span>
<span class="line"><span>│      ├─ 预加载资源                                            │</span></span>
<span class="line"><span>│      └─ 减少内存占用                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 代码优化                                                │</span></span>
<span class="line"><span>│      ├─ 预编译 DEX                                            │</span></span>
<span class="line"><span>│      ├─ 预优化代码                                            │</span></span>
<span class="line"><span>│      └─ 减少启动时间                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 安全隔离                                                │</span></span>
<span class="line"><span>│      ├─ 进程隔离                                              │</span></span>
<span class="line"><span>│      ├─ 权限控制                                              │</span></span>
<span class="line"><span>│      └─ 沙箱机制                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>3. SystemServer 中有哪些核心服务？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 系统服务                                                │</span></span>
<span class="line"><span>│      ├─ ActivityManagerService                               │</span></span>
<span class="line"><span>│      ├─ WindowManagerService                                 │</span></span>
<span class="line"><span>│      ├─ PackageManagerService                                │</span></span>
<span class="line"><span>│      ├─ PowerManagerService                                  │</span></span>
<span class="line"><span>│      └─ InputManagerService                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 应用服务                                                │</span></span>
<span class="line"><span>│      ├─ AudioService                                         │</span></span>
<span class="line"><span>│      ├─ TelephonyService                                     │</span></span>
<span class="line"><span>│      ├─ LocationService                                      │</span></span>
<span class="line"><span>│      └─ NotificationManagerService                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 其他服务                                                │</span></span>
<span class="line"><span>│      ├─ SensorService                                        │</span></span>
<span class="line"><span>│      ├─ VibratorService                                      │</span></span>
<span class="line"><span>│      ├─ ConnectivityService                                  │</span></span>
<span class="line"><span>│      └─ ClipboardService                                     │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-2-进阶考点" tabindex="-1">10.2 进阶考点 <a class="header-anchor" href="#_10-2-进阶考点" aria-label="Permalink to &quot;10.2 进阶考点&quot;">​</a></h3><p><strong>1. Activity 启动流程详解？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 应用层调用                                               │</span></span>
<span class="line"><span>│      ├─ Context.startActivity()                              │</span></span>
<span class="line"><span>│      ├─ 调用 ActivityManager.getService()                     │</span></span>
<span class="line"><span>│      └─ 调用 startActivity()                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. AMS 处理                                                 │</span></span>
<span class="line"><span>│      ├─ 解析 Intent                                          │</span></span>
<span class="line"><span>│      ├─ 获取 Activity 信息                                     │</span></span>
<span class="line"><span>│      ├─ 检查进程状态                                         │</span></span>
<span class="line"><span>│      ├─ 创建进程（如果需要）                                   │</span></span>
<span class="line"><span>│      ├─ 将 Activity 加入任务栈                                  │</span></span>
<span class="line"><span>│      └─ 通知应用进程                                         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 进程创建                                                 │</span></span>
<span class="line"><span>│      ├─ Zygote fork                                          │</span></span>
<span class="line"><span>│      ├─ 创建新进程                                           │</span></span>
<span class="line"><span>│      ├─ 加载类                                               │</span></span>
<span class="line"><span>│      ├─ 创建 Application                                       │</span></span>
<span class="line"><span>│      └─ 创建 Activity                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. Activity 生命周期                                        │</span></span>
<span class="line"><span>│      ├─ onCreate()                                           │</span></span>
<span class="line"><span>│      ├─ onStart()                                            │</span></span>
<span class="line"><span>│      ├─ onResume()                                           │</span></span>
<span class="line"><span>│      └─ 显示界面                                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 冷启动和热启动的区别？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   冷启动 (Cold Start)                                         │</span></span>
<span class="line"><span>│   ├─ 进程不存在                                              │</span></span>
<span class="line"><span>│   ├─ 需要创建新进程                                          │</span></span>
<span class="line"><span>│   ├─ 加载 APK                                                │</span></span>
<span class="line"><span>│   ├─ 初始化 Application                                       │</span></span>
<span class="line"><span>│   ├─ 创建 Activity                                            │</span></span>
<span class="line"><span>│   ├─ 加载布局                                                │</span></span>
<span class="line"><span>│   └─ 时间：~300-800ms                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   热启动 (Hot Start)                                          │</span></span>
<span class="line"><span>│   ├─ 进程已存在                                              │</span></span>
<span class="line"><span>│   ├─ 复用已启动进程                                          │</span></span>
<span class="line"><span>│   ├─ 直接从栈中恢复 Activity                                  │</span></span>
<span class="line"><span>│   ├─ 调用 onStart/onResume                                    │</span></span>
<span class="line"><span>│   └─ 时间：~50-150ms                                         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   温启动 (Warm Start)                                         │</span></span>
<span class="line"><span>│   ├─ 进程已存在                                              │</span></span>
<span class="line"><span>│   ├─ 复用已启动进程                                          │</span></span>
<span class="line"><span>│   ├─ 重新创建 Activity                                        │</span></span>
<span class="line"><span>│   ├─ 调用 onCreate/onStart/onResume                           │</span></span>
<span class="line"><span>│   └─ 时间：~150-300ms                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-3-高级考点" tabindex="-1">10.3 高级考点 <a class="header-anchor" href="#_10-3-高级考点" aria-label="Permalink to &quot;10.3 高级考点&quot;">​</a></h3><p><strong>1. Android 启动流程中的性能优化？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 系统层面优化                                            │</span></span>
<span class="line"><span>│      ├─ Zygote 预加载优化                                     │</span></span>
<span class="line"><span>│      ├─ SystemServer 启动优化                                  │</span></span>
<span class="line"><span>│      ├─ 减少系统服务启动时间                                   │</span></span>
<span class="line"><span>│      └─ 优化进程调度                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 应用层面优化                                            │</span></span>
<span class="line"><span>│      ├─ Application 异步初始化                               │</span></span>
<span class="line"><span>│      ├─ Activity 异步加载布局                                  │</span></span>
<span class="line"><span>│      ├─ 减少初始化代码                                        │</span></span>
<span class="line"><span>│      ├─ 懒加载非关键组件                                       │</span></span>
<span class="line"><span>│      └─ 优化数据加载                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 资源层面优化                                            │</span></span>
<span class="line"><span>│      ├─ 压缩图片                                              │</span></span>
<span class="line"><span>│      ├─ 使用矢量图                                            │</span></span>
<span class="line"><span>│      ├─ 优化布局层级                                          │</span></span>
<span class="line"><span>│      ├─ 减少资源数量                                          │</span></span>
<span class="line"><span>│      └─ 使用预编译资源                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 架构层面优化                                            │</span></span>
<span class="line"><span>│      ├─ 模块化                                              │</span></span>
<span class="line"><span>│      ├─ 组件化                                              │</span></span>
<span class="line"><span>│      ├─ 动态化                                              │</span></span>
<span class="line"><span>│      └─ 服务化                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 如何优化应用启动速度？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 代码优化                                                │</span></span>
<span class="line"><span>│      ├─ 异步初始化                                          │</span></span>
<span class="line"><span>│      ├─ 懒加载                                              │</span></span>
<span class="line"><span>│      ├─ 减少反射                                            │</span></span>
<span class="line"><span>│      ├─ 优化算法                                            │</span></span>
<span class="line"><span>│      └─ 减少类加载                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 布局优化                                                │</span></span>
<span class="line"><span>│      ├─ 简化布局层级                                        │</span></span>
<span class="line"><span>│      ├─ 使用 ConstraintLayout                               │</span></span>
<span class="line"><span>│      ├─ 使用 ViewStub                                       │</span></span>
<span class="line"><span>│      ├─ 避免复杂动画                                        │</span></span>
<span class="line"><span>│      └─ 使用 RecyclerView                                    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 资源优化                                                │</span></span>
<span class="line"><span>│      ├─ 压缩图片                                            │</span></span>
<span class="line"><span>│      ├─ 使用矢量图                                          │</span></span>
<span class="line"><span>│      ├─ 减少资源数量                                        │</span></span>
<span class="line"><span>│      ├─ 优化资源加载                                        │</span></span>
<span class="line"><span>│      └─ 使用资源预加载                                       │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 网络优化                                                │</span></span>
<span class="line"><span>│      ├─ 异步加载数据                                        │</span></span>
<span class="line"><span>│      ├─ 使用缓存                                            │</span></span>
<span class="line"><span>│      ├─ 预加载                                              │</span></span>
<span class="line"><span>│      ├─ 优化网络请求                                        │</span></span>
<span class="line"><span>│      └─ 使用 CDN                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. 架构优化                                                │</span></span>
<span class="line"><span>│      ├─ 模块化                                              │</span></span>
<span class="line"><span>│      ├─ 组件化                                              │</span></span>
<span class="line"><span>│      ├─ 动态化                                              │</span></span>
<span class="line"><span>│      ├─ 服务化                                              │</span></span>
<span class="line"><span>│      └─ 微服务                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-4-面试问题集锦" tabindex="-1">10.4 面试问题集锦 <a class="header-anchor" href="#_10-4-面试问题集锦" aria-label="Permalink to &quot;10.4 面试问题集锦&quot;">​</a></h3><p><strong>问题 1：Zygote 为什么可以 fork 进程？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. Linux fork 机制                                          │</span></span>
<span class="line"><span>│      ├─ 拷贝父进程内存                                        │</span></span>
<span class="line"><span>│      ├─ 共享代码段                                            │</span></span>
<span class="line"><span>│      └─ 减少内存开销                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 预加载机制                                               │</span></span>
<span class="line"><span>│      ├─ Zygote 预加载常用类                                    │</span></span>
<span class="line"><span>│      ├─ 子进程共享父进程内存                                    │</span></span>
<span class="line"><span>│      └─ 减少类加载时间                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. JVM 初始化                                              │</span></span>
<span class="line"><span>│      ├─ Zygote 中已初始化 JVM                                  │</span></span>
<span class="line"><span>│      ├─ 子进程继承 JVM 状态                                    │</span></span>
<span class="line"><span>│      └─ 减少 JVM 初始化时间                                    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 性能优化                                                │</span></span>
<span class="line"><span>│      ├─ 减少进程创建时间                                      │</span></span>
<span class="line"><span>│      ├─ 优化内存使用                                          │</span></span>
<span class="line"><span>│      └─ 提高系统响应速度                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>问题 2：如何降低冷启动时间？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 减少初始化代码                                           │</span></span>
<span class="line"><span>│      ├─ 异步初始化                                          │</span></span>
<span class="line"><span>│      ├─ 延迟初始化                                          │</span></span>
<span class="line"><span>│      └─ 懒加载                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 优化布局                                                │</span></span>
<span class="line"><span>│      ├─ 简化布局层级                                        │</span></span>
<span class="line"><span>│      ├─ 使用 ConstraintLayout                               │</span></span>
<span class="line"><span>│      └─ 减少布局嵌套                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 优化资源                                                │</span></span>
<span class="line"><span>│      ├─ 压缩图片                                            │</span></span>
<span class="line"><span>│      ├─ 使用矢量图                                          │</span></span>
<span class="line"><span>│      └─ 减少资源数量                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 优化网络                                                │</span></span>
<span class="line"><span>│      ├─ 异步加载数据                                        │</span></span>
<span class="line"><span>│      ├─ 使用缓存                                            │</span></span>
<span class="line"><span>│      └─ 预加载                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. 优化架构                                                │</span></span>
<span class="line"><span>│      ├─ 模块化                                              │</span></span>
<span class="line"><span>│      ├─ 组件化                                              │</span></span>
<span class="line"><span>│      └─ 服务化                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><h3 id="启动流程总结" tabindex="-1">启动流程总结 <a class="header-anchor" href="#启动流程总结" aria-label="Permalink to &quot;启动流程总结&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 启动流程核心知识点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. Bootloader 启动                                          │</span></span>
<span class="line"><span>│      ├─ 硬件初始化                                           │</span></span>
<span class="line"><span>│      ├─ 加载 Kernel                                          │</span></span>
<span class="line"><span>│      └─ 跳转到 Kernel                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. Kernel 初始化                                           │</span></span>
<span class="line"><span>│      ├─ 内存初始化                                          │</span></span>
<span class="line"><span>│      ├─ 设备驱动                                            │</span></span>
<span class="line"><span>│      ├─ 挂载根文件系统                                       │</span></span>
<span class="line"><span>│      └─ 执行 init 进程                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. Init 进程启动                                           │</span></span>
<span class="line"><span>│      ├─ 解析配置文件                                        │</span></span>
<span class="line"><span>│      ├─ 启动核心服务                                        │</span></span>
<span class="line"><span>│      ├─ 启动 Zygote                                          │</span></span>
<span class="line"><span>│      └─ 进入主循环                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. Zygote 进程启动                                         │</span></span>
<span class="line"><span>│      ├─ 创建 JVM                                             │</span></span>
<span class="line"><span>│      ├─ 预加载类                                             │</span></span>
<span class="line"><span>│      ├─ 创建 socket 服务器                                    │</span></span>
<span class="line"><span>│      └─ 等待 fork 请求                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. SystemServer 启动                                       │</span></span>
<span class="line"><span>│      ├─ fork 进程                                            │</span></span>
<span class="line"><span>│      ├─ 启动系统服务                                        │</span></span>
<span class="line"><span>│      ├─ 启动 Launcher                                        │</span></span>
<span class="line"><span>│      └─ 显示 Launcher                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   6. App 启动                                                 │</span></span>
<span class="line"><span>│      ├─ 冷启动：创建进程                                      │</span></span>
<span class="line"><span>│      ├─ 热启动：复用进程                                      │</span></span>
<span class="line"><span>│      └─ 启动 Activity                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="性能优化总结" tabindex="-1">性能优化总结 <a class="header-anchor" href="#性能优化总结" aria-label="Permalink to &quot;性能优化总结&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>启动性能优化核心要点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 代码优化                                                │</span></span>
<span class="line"><span>│      ├─ 异步初始化                                          │</span></span>
<span class="line"><span>│      ├─ 懒加载                                              │</span></span>
<span class="line"><span>│      ├─ 减少反射                                            │</span></span>
<span class="line"><span>│      └─ 优化算法                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 布局优化                                                │</span></span>
<span class="line"><span>│      ├─ 简化布局层级                                        │</span></span>
<span class="line"><span>│      ├─ 使用 ConstraintLayout                               │</span></span>
<span class="line"><span>│      └─ 减少布局嵌套                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 资源优化                                                │</span></span>
<span class="line"><span>│      ├─ 压缩图片                                            │</span></span>
<span class="line"><span>│      ├─ 使用矢量图                                          │</span></span>
<span class="line"><span>│      └─ 减少资源数量                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 网络优化                                                │</span></span>
<span class="line"><span>│      ├─ 异步加载数据                                        │</span></span>
<span class="line"><span>│      ├─ 使用缓存                                            │</span></span>
<span class="line"><span>│      └─ 预加载                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. 架构优化                                                │</span></span>
<span class="line"><span>│      ├─ 模块化                                              │</span></span>
<span class="line"><span>│      ├─ 组件化                                              │</span></span>
<span class="line"><span>│      └─ 服务化                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><p><strong>文档信息：</strong></p><ul><li>字数：约 18000 字</li><li>包含：Bootloader 启动、Kernel 初始化、Init 进程启动、Zygote 进程启动、SystemServer 启动、Launcher 启动、App 启动流程、Activity 启动流程源码分析、性能优化点、面试考点</li><li>源码引用：ZygoteInit.java、SystemServer.java、ActivityManagerService.java、ActivityThread.java、init.cpp 等</li><li>ASCII 流程图：包含多个流程时序图和状态机图</li><li>最佳实践：启动性能优化策略、异步初始化方案、布局优化建议</li></ul><p><strong>建议：</strong></p><ol><li>学习源码时，结合 Android Studio 调试，跟踪关键方法调用</li><li>面试前，重点掌握启动流程的每个阶段和关键源码</li><li>性能优化方面，掌握实际优化案例和优化效果评估方法</li></ol>`,188)])])}const g=a(l,[["render",t]]);export{d as __pageData,g as default};
