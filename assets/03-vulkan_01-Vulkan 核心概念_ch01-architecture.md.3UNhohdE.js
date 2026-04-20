import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"第一章 · Vulkan 架构与核心概念","description":"","frontmatter":{},"headers":[],"relativePath":"03-vulkan/01-Vulkan 核心概念/ch01-architecture.md","filePath":"03-vulkan/01-Vulkan 核心概念/ch01-architecture.md"}'),l={name:"03-vulkan/01-Vulkan 核心概念/ch01-architecture.md"};function i(c,s,t,r,o,d){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="第一章-·-vulkan-架构与核心概念" tabindex="-1">第一章 · Vulkan 架构与核心概念 <a class="header-anchor" href="#第一章-·-vulkan-架构与核心概念" aria-label="Permalink to &quot;第一章 · Vulkan 架构与核心概念&quot;">​</a></h1><h2 id="_1-1-vulkan-是什么" tabindex="-1">1.1 Vulkan 是什么 <a class="header-anchor" href="#_1-1-vulkan-是什么" aria-label="Permalink to &quot;1.1 Vulkan 是什么&quot;">​</a></h2><p><strong>Vulkan</strong>（Khronos Group 于 2016 年发布）是一个<strong>低级、跨平台的图形 API</strong>，专为高性能 3D 图形和计算设计。</p><h3 id="核心设计哲学" tabindex="-1">核心设计哲学 <a class="header-anchor" href="#核心设计哲学" aria-label="Permalink to &quot;核心设计哲学&quot;">​</a></h3><p>| 原则 | 说明 | | <strong>显式控制</strong> | 一切由开发者管理，Driver 几乎不干预 | | <strong>低开销</strong> | 减少 CPU 驱动层开销，CPU/GPU 并行 | | <strong>多线程优化</strong> | 原生支持多线程命令提交 | | <strong>精确同步</strong> | 开发者完全控制资源访问时序 | | <strong>硬件抽象层</strong> | 面向现代 GPU 架构直接映射 |</p><h3 id="为什么选择-vulkan" tabindex="-1">为什么选择 Vulkan？ <a class="header-anchor" href="#为什么选择-vulkan" aria-label="Permalink to &quot;为什么选择 Vulkan？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OpenGL:                    Vulkan:</span></span>
<span class="line"><span>───────────               ───────────</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Driver 帮你做决定          你决定一切</span></span>
<span class="line"><span>&quot;画一个三角形&quot;             &quot;请给我 1000 字节，一个命令缓冲...&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CPU 开销大（~50-100%）    CPU 开销小（~10-20%）</span></span>
<span class="line"><span>GPU 利用率低（~40%）      GPU 利用率高（~90%）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>容易上手                   难上手</span></span>
<span class="line"><span></span></span>
<span class="line"><span>适合中小项目                适合高性能项目</span></span></code></pre></div><h2 id="_1-2-vulkan-架构总览-🔥" tabindex="-1">1.2 Vulkan 架构总览 🔥 <a class="header-anchor" href="#_1-2-vulkan-架构总览-🔥" aria-label="Permalink to &quot;1.2 Vulkan 架构总览 🔥&quot;">​</a></h2><h3 id="_1-2-1-分层架构" tabindex="-1">1.2.1 分层架构 <a class="header-anchor" href="#_1-2-1-分层架构" aria-label="Permalink to &quot;1.2.1 分层架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│               Your Application                   │</span></span>
<span class="line"><span>│           (你的游戏/渲染器)                       │</span></span>
<span class="line"><span>│   ┌───────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│   │           Vulkan API (C/C++)              │  │</span></span>
<span class="line"><span>│   │  vkCreateInstance → vkQueueSubmit → ...  │  │</span></span>
<span class="line"><span>│   └───────────────────────────────────────────┘  │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│           Vulkan Driver (Vendor)                │</span></span>
<span class="line"><span>│   ┌───────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│   │           Driver Layer                      │  │</span></span>
<span class="line"><span>│   │  OpenGL ES → Vulkan (通过翻译层)           │  │</span></span>
<span class="line"><span>│   │  Metal → Vulkan (通过 MoltenVK)            │  │</span></span>
<span class="line"><span>│   │  Native Vulkan → Hardware                 │  │</span></span>
<span class="line"><span>│   └───────────────────────────────────────────┘  │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│              GPU / Hardware                      │</span></span>
<span class="line"><span>│   ┌─────────────┐  ┌─────────────┐              │</span></span>
<span class="line"><span>│   │ Compute Unit │  │Graphics Unit│              │</span></span>
<span class="line"><span>│   │  (Shader)    │  │  (Shader)   │              │</span></span>
<span class="line"><span>│   └─────────────┘  └─────────────┘              │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-2-核心对象模型" tabindex="-1">1.2.2 核心对象模型 <a class="header-anchor" href="#_1-2-2-核心对象模型" aria-label="Permalink to &quot;1.2.2 核心对象模型&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Instance (实例)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Physical Device (物理设备)</span></span>
<span class="line"><span>    │   ├── GPU (GPU 0)</span></span>
<span class="line"><span>    │   ├── GPU (GPU 1)</span></span>
<span class="line"><span>    │   └── ...</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── Device (逻辑设备)</span></span>
<span class="line"><span>        ├── Queue Family (队列族)</span></span>
<span class="line"><span>        │   ├── Queue 0 (Graphics)</span></span>
<span class="line"><span>        │   ├── Queue 1 (Compute)</span></span>
<span class="line"><span>        │   └── Queue 2 (Transfer)</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├── Memory (内存管理)</span></span>
<span class="line"><span>        │   ├── Memory Type 0</span></span>
<span class="line"><span>        │   ├── Memory Type 1</span></span>
<span class="line"><span>        │   └── ...</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├── Resources (资源)</span></span>
<span class="line"><span>        │   ├── Buffers</span></span>
<span class="line"><span>        │   ├── Images</span></span>
<span class="line"><span>        │   ├── Samplers</span></span>
<span class="line"><span>        │   └── Pools</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├── Pipelines (管线)</span></span>
<span class="line"><span>        │   ├── Graphics Pipeline</span></span>
<span class="line"><span>        │   ├── Compute Pipeline</span></span>
<span class="line"><span>        │   └── Ray Tracing Pipeline</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        ├── Descriptor Sets (描述符)</span></span>
<span class="line"><span>        │   ├── Uniform Buffers</span></span>
<span class="line"><span>        │   ├── Storage Buffers</span></span>
<span class="line"><span>        │   └── Texture Views</span></span>
<span class="line"><span>        │</span></span>
<span class="line"><span>        └── Render Passes (渲染通道)</span></span>
<span class="line"><span>            └── Framebuffers</span></span></code></pre></div><h2 id="_1-3-核心概念详解-🔥" tabindex="-1">1.3 核心概念详解 🔥 <a class="header-anchor" href="#_1-3-核心概念详解-🔥" aria-label="Permalink to &quot;1.3 核心概念详解 🔥&quot;">​</a></h2><h3 id="_1-3-1-instance-实例" tabindex="-1">1.3.1 Instance（实例） <a class="header-anchor" href="#_1-3-1-instance-实例" aria-label="Permalink to &quot;1.3.1 Instance（实例）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>概念：一个 Vulkan 实例代表你与 Vulkan 驱动的&quot;连接&quot;</span></span>
<span class="line"><span>类比：数据库连接</span></span>
<span class="line"><span></span></span>
<span class="line"><span>创建流程:</span></span>
<span class="line"><span>1. 创建 Application Info（应用名称、版本）</span></span>
<span class="line"><span>2. 创建 Instance (指定需要的扩展)</span></span>
<span class="line"><span>3. 枚举物理设备 (Physical Devices)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键 API:</span></span>
<span class="line"><span>- vkCreateInstance()</span></span>
<span class="line"><span>- vkEnumeratePhysicalDevices()</span></span>
<span class="line"><span>- vkDestroyInstance()</span></span></code></pre></div><h3 id="_1-3-2-physical-device-物理设备" tabindex="-1">1.3.2 Physical Device（物理设备） <a class="header-anchor" href="#_1-3-2-physical-device-物理设备" aria-label="Permalink to &quot;1.3.2 Physical Device（物理设备）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>概念：实际的 GPU 硬件</span></span>
<span class="line"><span>类比：计算机中的显卡</span></span>
<span class="line"><span></span></span>
<span class="line"><span>每个 GPU 是一个 Physical Device，需要：</span></span>
<span class="line"><span>- 查询其能力（支持的 Vulkan 版本、特性）</span></span>
<span class="line"><span>- 查询其队列族（Queue Families）</span></span>
<span class="line"><span>- 查询其内存类型（Memory Types）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键 API:</span></span>
<span class="line"><span>- vkGetPhysicalDeviceProperties()</span></span>
<span class="line"><span>- vkGetPhysicalDeviceFeatures()</span></span>
<span class="line"><span>- vkGetPhysicalDeviceQueueFamilyProperties()</span></span></code></pre></div><h3 id="_1-3-3-logical-device-逻辑设备" tabindex="-1">1.3.3 Logical Device（逻辑设备） <a class="header-anchor" href="#_1-3-3-logical-device-逻辑设备" aria-label="Permalink to &quot;1.3.3 Logical Device（逻辑设备）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>概念：从 Physical Device 创建的&quot;虚拟连接&quot;</span></span>
<span class="line"><span>类比：SQLAlchemy Session（从数据库连接创建的会话）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>创建时指定:</span></span>
<span class="line"><span>- Queue 要求（Graphics/Compute/Transfer）</span></span>
<span class="line"><span>- 扩展（Extensions）</span></span>
<span class="line"><span>- 设备特性（Features）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键 API:</span></span>
<span class="line"><span>- vkCreateDevice()</span></span>
<span class="line"><span>- vkGetDeviceQueue()</span></span>
<span class="line"><span>- vkDestroyDevice()</span></span></code></pre></div><h3 id="_1-3-4-queue-队列" tabindex="-1">1.3.4 Queue（队列） <a class="header-anchor" href="#_1-3-4-queue-队列" aria-label="Permalink to &quot;1.3.4 Queue（队列）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>概念：GPU 执行命令的队列</span></span>
<span class="line"><span>类比：打印机队列（但 GPU 可以有多个队列）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Queue Family 类型:</span></span>
<span class="line"><span>- VK_QUEUE_GRAPHICS_BIT     — 图形渲染</span></span>
<span class="line"><span>- VK_QUEUE_COMPUTE_BIT       — 计算任务</span></span>
<span class="line"><span>- VK_QUEUE_TRANSFER_BIT      — 数据传输</span></span>
<span class="line"><span>- VK_QUEUE_SPARSE_BINDING_BIT — 稀疏绑定</span></span>
<span class="line"><span>- VK_QUEUE_PROTECTED_BIT     — 保护队列</span></span>
<span class="line"><span></span></span>
<span class="line"><span>一个物理设备可以有多个 Queue Family</span></span>
<span class="line"><span>每个 Queue Family 可以有多个 Queue</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键 API:</span></span>
<span class="line"><span>- vkGetDeviceQueue()</span></span>
<span class="line"><span>- vkQueueSubmit() — 提交命令缓冲</span></span>
<span class="line"><span>- vkQueueWaitIdle() — 等待队列空闲</span></span></code></pre></div><h3 id="_1-3-5-command-buffer-命令缓冲" tabindex="-1">1.3.5 Command Buffer（命令缓冲） <a class="header-anchor" href="#_1-3-5-command-buffer-命令缓冲" aria-label="Permalink to &quot;1.3.5 Command Buffer（命令缓冲）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>概念：记录渲染命令的&quot;回放&quot;</span></span>
<span class="line"><span>类比：视频带的&quot;录制&quot;功能</span></span>
<span class="line"><span></span></span>
<span class="line"><span>流程:</span></span>
<span class="line"><span>1. 创建 Command Pool（命令池）</span></span>
<span class="line"><span>2. 从 Pool 分配 Command Buffer</span></span>
<span class="line"><span>3. 开始记录命令（vkCmdBeginRenderPass → vkCmdDraw → vkCmdEndRenderPass）</span></span>
<span class="line"><span>4. 停止记录</span></span>
<span class="line"><span>5. 提交到 Queue 执行</span></span>
<span class="line"><span>6. 重置并复用</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键 API:</span></span>
<span class="line"><span>- vkAllocateCommandBuffers()</span></span>
<span class="line"><span>- vkBeginCommandBuffer()</span></span>
<span class="line"><span>- vkCmdBindPipeline()</span></span>
<span class="line"><span>- vkCmdDraw()</span></span>
<span class="line"><span>- vkEndCommandBuffer()</span></span>
<span class="line"><span>- vkQueueSubmit()</span></span></code></pre></div><h3 id="_1-3-6-memory-内存" tabindex="-1">1.3.6 Memory（内存） <a class="header-anchor" href="#_1-3-6-memory-内存" aria-label="Permalink to &quot;1.3.6 Memory（内存）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>概念：Vulkan 显式管理 GPU 内存</span></span>
<span class="line"><span>类比：C/C++ 的 malloc/free（但更复杂）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Vulkan 内存管理三层模型:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Physical Memory → Memory Type → Device Memory</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Physical Memory Types (驱动定义):</span></span>
<span class="line"><span>  VK_MEMORY_TYPE_DEVICE_LOCAL_BIT    — GPU 本地显存（最快）</span></span>
<span class="line"><span>  VK_MEMORY_TYPE_HOST_VISIBLE_BIT    — 主机可访问</span></span>
<span class="line"><span>  VK_MEMORY_TYPE_HOST_COHERENT_BIT   — 自动同步</span></span>
<span class="line"><span>  VK_MEMORY_TYPE_HOST_NON_COHERENT_BIT — 需要手动同步</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Memory Allocation:</span></span>
<span class="line"><span>  1. 查询 Physical Device 支持的 Memory Types</span></span>
<span class="line"><span>  2. 选择合适类型（考虑性能和可用性）</span></span>
<span class="line"><span>  3. 分配 Device Memory</span></span>
<span class="line"><span>  4. 绑定到 Buffer/Image</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键 API:</span></span>
<span class="line"><span>- vkGetPhysicalDeviceMemoryProperties()</span></span>
<span class="line"><span>- vkAllocateMemory()</span></span>
<span class="line"><span>- vkBindBufferMemory() / vkBindImageMemory()</span></span>
<span class="line"><span>- vkFreeMemory()</span></span></code></pre></div><h2 id="_1-4-渲染管线-render-pipeline-🔥" tabindex="-1">1.4 渲染管线（Render Pipeline）🔥 <a class="header-anchor" href="#_1-4-渲染管线-render-pipeline-🔥" aria-label="Permalink to &quot;1.4 渲染管线（Render Pipeline）🔥&quot;">​</a></h2><h3 id="_1-4-1-整体流程" tabindex="-1">1.4.1 整体流程 <a class="header-anchor" href="#_1-4-1-整体流程" aria-label="Permalink to &quot;1.4.1 整体流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Application</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 1. Instance (实例)</span></span>
<span class="line"><span>    │       └── 创建 Vulkan 连接</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 2. Physical Device (物理设备)</span></span>
<span class="line"><span>    │       └── 查询 GPU 能力</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 3. Logical Device (逻辑设备)</span></span>
<span class="line"><span>    │       └── 创建虚拟连接</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 4. Surface (表面)</span></span>
<span class="line"><span>    │       └── 窗口系统绑定</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 5. Swap Chain (交换链)</span></span>
<span class="line"><span>    │       └── 帧缓冲管理</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 6. Command Buffer (命令缓冲)</span></span>
<span class="line"><span>    │       └── 记录渲染命令</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 7. Render Pass (渲染通道)</span></span>
<span class="line"><span>    │       └── 定义渲染结构</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 8. Pipeline (管线)</span></span>
<span class="line"><span>    │       └── 渲染状态</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 9. Resources (资源)</span></span>
<span class="line"><span>    │       ├── Buffers (顶点、Uniform)</span></span>
<span class="line"><span>    │       ├── Images (纹理)</span></span>
<span class="line"><span>    │       └── Samplers (采样)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── 10. Render (渲染)</span></span>
<span class="line"><span>    │        └── vkQueueSubmit → GPU 执行</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── 11. Present (呈现)</span></span>
<span class="line"><span>             └── 图像显示到屏幕</span></span></code></pre></div><h3 id="_1-4-2-render-pass-详解" tabindex="-1">1.4.2 Render Pass 详解 <a class="header-anchor" href="#_1-4-2-render-pass-详解" aria-label="Permalink to &quot;1.4.2 Render Pass 详解&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Render Pass 定义&quot;如何渲染&quot;：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 渲染通道 (Render Pass)</span></span>
<span class="line"><span>   ├── 附件 (Attachments)</span></span>
<span class="line"><span>   │   ├── Color Attachment (颜色附件)</span></span>
<span class="line"><span>   │   ├── Depth Attachment (深度附件)</span></span>
<span class="line"><span>   │   └── Stencil Attachment (模板附件)</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   └── 子通道 (Subpasses)</span></span>
<span class="line"><span>       ├── Subpass 0 (主渲染)</span></span>
<span class="line"><span>       │   ├── 输入附件 (Input Attachments)</span></span>
<span class="line"><span>       │   ├── 颜色附件 (Color Attachments)</span></span>
<span class="line"><span>       │   ├── 深度附件 (Depth Attachment)</span></span>
<span class="line"><span>       │   └── 输出附件 (Output Attachments)</span></span>
<span class="line"><span>       └── ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. Framebuffer (帧缓冲)</span></span>
<span class="line"><span>   └── 绑定具体资源到 Attachments</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. Pipeline (管线)</span></span>
<span class="line"><span>   └── 绑定到 Render Pass</span></span></code></pre></div><h3 id="_1-4-3-pipeline-状态" tabindex="-1">1.4.3 Pipeline 状态 <a class="header-anchor" href="#_1-4-3-pipeline-状态" aria-label="Permalink to &quot;1.4.3 Pipeline 状态&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Graphics Pipeline 由多个阶段组成:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Input Assembly (顶点组装)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Vertex Input (顶点输入)</span></span>
<span class="line"><span>    │   ├── Vertex Buffer (顶点缓冲)</span></span>
<span class="line"><span>    │   └── Vertex Attribute Description</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Vertex Shader (顶点着色器)</span></span>
<span class="line"><span>    │   └── GLSL Shader Module</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Tessellation (可选)</span></span>
<span class="line"><span>    ├── Geometry Shader (可选)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Rasterization (光栅化)</span></span>
<span class="line"><span>    │   ├── Front Face (正面)</span></span>
<span class="line"><span>    │   ├── Polygon Mode (多边形模式)</span></span>
<span class="line"><span>    │   ├── Cull Mode (剔除模式)</span></span>
<span class="line"><span>    │   └── Depth Bias (深度偏置)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Multisample (多重采样)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Fragment Shader (片元着色器)</span></span>
<span class="line"><span>    │   └── GLSL Shader Module</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Color Blend (颜色混合)</span></span>
<span class="line"><span>    │   ├── Blend Enable (混合启用)</span></span>
<span class="line"><span>    │   ├── Blend Factor (混合因子)</span></span>
<span class="line"><span>    │   └── Color Mask (颜色掩码)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Depth Test (深度测试)</span></span>
<span class="line"><span>    │   ├── Depth Compare (比较方式)</span></span>
<span class="line"><span>    │   └── Depth Write (深度写入)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── Stencil Test (模板测试)</span></span>
<span class="line"><span>        ├── Compare Op (比较操作)</span></span>
<span class="line"><span>        └── Stencil Op (模板操作)</span></span></code></pre></div><h2 id="_1-5-核心对象关系图" tabindex="-1">1.5 核心对象关系图 <a class="header-anchor" href="#_1-5-核心对象关系图" aria-label="Permalink to &quot;1.5 核心对象关系图&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>    Instance</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       ├── Physical Device</span></span>
<span class="line"><span>       │   ├── GPU Info</span></span>
<span class="line"><span>       │   ├── Memory Types</span></span>
<span class="line"><span>       │   └── Queue Families</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       ├── Logical Device</span></span>
<span class="line"><span>       │   ├── Queue</span></span>
<span class="line"><span>       │   │   ├── Command Pool</span></span>
<span class="line"><span>       │   │   │   ├── Command Buffer</span></span>
<span class="line"><span>       │   │   │   └── ...</span></span>
<span class="line"><span>       │   │   └── Command Buffer</span></span>
<span class="line"><span>       │   │</span></span>
<span class="line"><span>       │   ├── Memory</span></span>
<span class="line"><span>       │   │   └── Device Memory</span></span>
<span class="line"><span>       │   │       ├── Buffer</span></span>
<span class="line"><span>       │   │       └── Image</span></span>
<span class="line"><span>       │   │</span></span>
<span class="line"><span>       │   ├── Pipeline</span></span>
<span class="line"><span>       │   │   ├── Shader Module</span></span>
<span class="line"><span>       │   │   └── Shader Stage</span></span>
<span class="line"><span>       │   │</span></span>
<span class="line"><span>       │   ├── Render Pass</span></span>
<span class="line"><span>       │   │   └── Framebuffer</span></span>
<span class="line"><span>       │   │       └── Image View</span></span>
<span class="line"><span>       │   │</span></span>
<span class="line"><span>       │   ├── Descriptor Set Layout</span></span>
<span class="line"><span>       │   │   ├── Uniform Buffer</span></span>
<span class="line"><span>       │   │   ├── Storage Buffer</span></span>
<span class="line"><span>       │   │   └── Sampler</span></span>
<span class="line"><span>       │   │</span></span>
<span class="line"><span>       │   └── Swap Chain</span></span>
<span class="line"><span>       │       ├── Image (xN)</span></span>
<span class="line"><span>       │       ├── Image View (xN)</span></span>
<span class="line"><span>       │       └── Allocator</span></span>
<span class="line"><span>       │</span></span>
<span class="line"><span>       └── Surface</span></span>
<span class="line"><span>           └── Window/System</span></span></code></pre></div><h2 id="_1-6-关键术语速查" tabindex="-1">1.6 关键术语速查 <a class="header-anchor" href="#_1-6-关键术语速查" aria-label="Permalink to &quot;1.6 关键术语速查&quot;">​</a></h2><p>| 术语 | 说明 | 类比 | | <strong>Instance</strong> | Vulkan 实例，与驱动的连接 | HTTP 客户端 | | <strong>Physical Device</strong> | 实际的 GPU 硬件 | 物理显卡 | | <strong>Logical Device</strong> | 从 Physical Device 创建的虚拟连接 | 数据库连接 | | <strong>Queue</strong> | GPU 执行命令的队列 | 打印机队列 | | <strong>Command Buffer</strong> | 记录命令的缓冲 | 录制视频 | | <strong>Render Pass</strong> | 定义渲染结构 | 烹饪步骤 | | <strong>Pipeline</strong> | 渲染状态 | 烹饪配方 | | <strong>Buffer</strong> | 线性内存（顶点、Uniform） | 数组 | | <strong>Image</strong> | 纹理资源 | 图像文件 | | <strong>Sampler</strong> | 纹理采样配置 | 放大镜设置 | | <strong>Frame Buffer</strong> | 帧缓冲（附件绑定） | 画布 | | <strong>Swap Chain</strong> | 帧缓冲管理 | 电影胶片 | | <strong>Fence</strong> | 驱动完成信号（CPU/GPU 同步） | 锁 | | <strong>Semaphore</strong> | GPU/GPU 同步 | 信号灯 | | <strong>Memory</strong> | GPU 显存管理 | malloc | | <strong>Descriptor Set</strong> | 描述符绑定（UBO、SRV） | 变量绑定 |</p><h2 id="_1-7-vulkan-vs-opengl-核心差异" tabindex="-1">1.7 Vulkan vs OpenGL 核心差异 <a class="header-anchor" href="#_1-7-vulkan-vs-opengl-核心差异" aria-label="Permalink to &quot;1.7 Vulkan vs OpenGL 核心差异&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OpenGL (Fixed Function):         Vulkan (Explicit):</span></span>
<span class="line"><span>─────────────────────            ────────────────────</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glVertexPointer()              →  手动绑定 Buffer</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glEnable(GL_DEPTH_TEST)        →  创建 Pipeline 时指定</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glUniformMatrix4fv(...)        →  创建 Uniform Buffer + Descriptor</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glDrawArrays(GL_TRIANGLES, ...)→  vkCmdDraw(..., commandBuffer)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glTexImage2D(...)              →  vkCreateImage + vkAllocateMemory + vkBind...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glUseProgram(program)          →  创建 Pipeline + vkCmdBindPipeline(...)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>glGetError()                   →  vkGetResult() / vkGetResultCallback()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>自动内存管理                    →  手动内存管理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>状态机（隐式状态）              →  显式状态</span></span></code></pre></div><h2 id="_1-8-渲染循环-render-loop" tabindex="-1">1.8 渲染循环（Render Loop） <a class="header-anchor" href="#_1-8-渲染循环-render-loop" aria-label="Permalink to &quot;1.8 渲染循环（Render Loop）&quot;">​</a></h2><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 典型的 Vulkan 渲染循环</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">while</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> not</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> should_terminate:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 1. 获取下一帧</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    image_index </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swap_chain.acquire_next_image()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 2. 等待之前的命令完成</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    wait_for_fence(fences[image_index])</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 3. 重置命令缓冲</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    reset_command_buffer(command_buffers[image_index])</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 4. 开始记录命令</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vkCmdBeginRenderPass(command_buffer)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkCmdBindPipeline(command_buffer, pipeline)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkCmdBindDescriptorSets(command_buffer, descriptor_sets)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkCmdBindVertexBuffers(command_buffer, vertex_buffers)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkCmdDraw(command_buffer, vertex_count, instance_count)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vkCmdEndRenderPass(command_buffer)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 5. 提交命令</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    submit_command_buffer(command_buffer)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 6. 呈现图像</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    swap_chain.present_image(image_index)</span></span></code></pre></div><h2 id="_1-9-核心-api-分类速查" tabindex="-1">1.9 核心 API 分类速查 <a class="header-anchor" href="#_1-9-核心-api-分类速查" aria-label="Permalink to &quot;1.9 核心 API 分类速查&quot;">​</a></h2><p>| 类别 | 函数 | | <strong>初始化</strong> | <code>vkCreateInstance()</code>, <code>vkCreateDevice()</code> | | <strong>枚举</strong> | <code>vkEnumeratePhysicalDevices()</code>, <code>vkEnumerateInstanceExtensionProperties()</code> | | <strong>资源</strong> | <code>vkCreateBuffer()</code>, <code>vkCreateImage()</code>, <code>vkCreateSampler()</code> | | <strong>内存</strong> | <code>vkAllocateMemory()</code>, <code>vkBindBufferMemory()</code> | | <strong>命令</strong> | <code>vkAllocateCommandBuffers()</code>, <code>vkCmdDraw()</code>, <code>vkQueueSubmit()</code> | | <strong>同步</strong> | <code>vkCreateFence()</code>, <code>vkCreateSemaphore()</code>, <code>vkWaitForFences()</code> | | <strong>渲染</strong> | <code>vkCreateRenderPass()</code>, <code>vkCreateFramebuffer()</code> | | <strong>管线</strong> | <code>vkCreateGraphicsPipelines()</code> | | <strong>呈现</strong> | <code>vkAcquireNextImageKHR()</code>, <code>vkQueuePresentKHR()</code> | | <strong>交换链</strong> | <code>vkCreateSwapchainKHR()</code>, <code>vkDestroySwapchainKHR()</code> |</p><hr>`,43)])])}const k=n(l,[["render",i]]);export{u as __pageData,k as default};
