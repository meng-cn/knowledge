import{_ as a,o as i,c as n,ae as p}from"./chunks/framework.Czhw_PXq.js";const c=JSON.parse('{"title":"第十三章 · 管线状态管理","description":"","frontmatter":{},"headers":[],"relativePath":"03-vulkan/02-中级 Vulkan/ch13-pipeline-state.md","filePath":"03-vulkan/02-中级 Vulkan/ch13-pipeline-state.md"}'),l={name:"03-vulkan/02-中级 Vulkan/ch13-pipeline-state.md"};function e(t,s,h,k,E,r){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="第十三章-·-管线状态管理" tabindex="-1">第十三章 · 管线状态管理 <a class="header-anchor" href="#第十三章-·-管线状态管理" aria-label="Permalink to &quot;第十三章 · 管线状态管理&quot;">​</a></h1><h2 id="_13-1-pipeline-layout" tabindex="-1">13.1 Pipeline Layout <a class="header-anchor" href="#_13-1-pipeline-layout" aria-label="Permalink to &quot;13.1 Pipeline Layout&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Pipeline Layout = Pipeline 的&quot;签名&quot;</span></span>
<span class="line"><span>- 描述符集布局 (Descriptor Set Layouts)</span></span>
<span class="line"><span>- 推送常量范围 (Push Constants)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Pipeline Layout 定义了 Shader 可以访问的所有资源</span></span>
<span class="line"><span>类比：C 函数签名</span></span></code></pre></div><h3 id="_13-1-1-创建-pipeline-layout" tabindex="-1">13.1.1 创建 Pipeline Layout <a class="header-anchor" href="#_13-1-1-创建-pipeline-layout" aria-label="Permalink to &quot;13.1.1 创建 Pipeline Layout&quot;">​</a></h3><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vkbottle</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline_layout_create_info </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vkbottle.PipelineLayoutCreateInfo(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    setLayouts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        descriptor_set_layout,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 描述符集布局</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    pushConstantRanges</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkbottle.PushConstantRange(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            stageFlags</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vkbottle.ShaderStageFlag.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">VERTEX</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vkbottle.ShaderStageFlag.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">FRAGMENT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            offset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">32</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 32 bytes push constants</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline_layout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> device.create_pipeline_layout(pipeline_layout_create_info)</span></span></code></pre></div><h2 id="_13-2-绑定顺序" tabindex="-1">13.2 绑定顺序 <a class="header-anchor" href="#_13-2-绑定顺序" aria-label="Permalink to &quot;13.2 绑定顺序&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>正确的绑定顺序（必须与 Pipeline Layout 顺序一致）:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. vkCmdBindPipeline()                    → 绑定 Pipeline</span></span>
<span class="line"><span>2. vkCmdBindDescriptorSets()               → 绑定描述符集</span></span>
<span class="line"><span>   setLayouts: [Layout0, Layout1]</span></span>
<span class="line"><span>   descriptorSets: [Set0, Set1]</span></span>
<span class="line"><span>3. vkCmdBindVertexBuffers()                → 绑定顶点缓冲</span></span>
<span class="line"><span>4. vkCmdBindIndexBuffer()                  → 绑定索引缓冲</span></span>
<span class="line"><span>5. vkCmdDraw() / vkCmdDrawIndexed()       → 绘制</span></span></code></pre></div><h3 id="_13-2-1-描述符集绑定" tabindex="-1">13.2.1 描述符集绑定 <a class="header-anchor" href="#_13-2-1-描述符集绑定" aria-label="Permalink to &quot;13.2.1 描述符集绑定&quot;">​</a></h3><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 绑定多个描述符集（如果有多个 Layout）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">command_buffer.bind_descriptor_sets(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    pipelineBindPoint</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vkbottle.PipelineBindPoint.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">GRAPHICS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    layout</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline_layout,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    firstSet</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,                    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 从哪个 set 开始</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    descriptorSets</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[               </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Set 数组</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        descriptor_set_0,          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Set 0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        descriptor_set_1,          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Set 1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    dynamicOffsets</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[],             </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 动态偏移（如果有 Dynamic Layout）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h2 id="_13-3-动态状态" tabindex="-1">13.3 动态状态 <a class="header-anchor" href="#_13-3-动态状态" aria-label="Permalink to &quot;13.3 动态状态&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>动态状态 = 可以在渲染时动态改变的参数（不需要重建 Pipeline）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>动态状态类型:</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ • Viewport                    │ • 视口尺寸       │</span></span>
<span class="line"><span>│ • Scissor                     │ • 裁剪区域       │</span></span>
<span class="line"><span>│ • LineWidth                   │ • 线条宽度       │</span></span>
<span class="line"><span>│ • DepthBias                   │ • 深度偏置       │</span></span>
<span class="line"><span>│ • BlendConstants              │ • 混合常数       │</span></span>
<span class="line"><span>│ • CompareMask                 │ • 模板比较掩码   │</span></span>
<span class="line"><span>│ • WriteMask                   │ • 模板写入掩码   │</span></span>
<span class="line"><span>│ • Reference                   │ • 模板参考值     │</span></span>
<span class="line"><span>│ • DepthBoundsTestEnable       │ • 深度范围测试   │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>启用动态状态:</span></span>
<span class="line"><span>  pipeline.create_info.dynamicState = [</span></span>
<span class="line"><span>      vkbottle.DynamicState.VIEWPORT,</span></span>
<span class="line"><span>      vkbottle.DynamicState.SCISSOR,</span></span>
<span class="line"><span>      vkbottle.DynamicState.LINE_WIDTH,</span></span>
<span class="line"><span>  ]</span></span></code></pre></div><h3 id="_13-3-1-动态状态设置" tabindex="-1">13.3.1 动态状态设置 <a class="header-anchor" href="#_13-3-1-动态状态设置" aria-label="Permalink to &quot;13.3.1 动态状态设置&quot;">​</a></h3><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 在渲染循环中动态改变</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">command_buffer.set_viewport(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    firstViewport</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    viewports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkbottle.Viewport(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            x</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            y</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            width</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">800.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            height</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            minDepth</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            maxDepth</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">command_buffer.set_scissor(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    firstScissor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    scissors</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkbottle.Rect2D(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            offset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">            extent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">800</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h2 id="_13-4-管线创建流程" tabindex="-1">13.4 管线创建流程 <a class="header-anchor" href="#_13-4-管线创建流程" aria-label="Permalink to &quot;13.4 管线创建流程&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 加载 Shader Modules</span></span>
<span class="line"><span>   → vkCreateShaderModule(vs_code, fs_code)</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>2. 创建 Shader Stage Info</span></span>
<span class="line"><span>   → PipelineShaderStageCreateInfo(vs_stage, fs_stage)</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>3. 定义 Vertex Input</span></span>
<span class="line"><span>   → VertexInputStateCreateInfo</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>4. 定义 Input Assembly</span></span>
<span class="line"><span>   → InputAssemblyStateCreateInfo(TOPology=TRIANGLE_LIST)</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>5. 定义 Viewport + Scissor</span></span>
<span class="line"><span>   → ViewportStateCreateInfo</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>6. 定义 Rasterization</span></span>
<span class="line"><span>   → RasterizationStateCreateInfo</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>7. 定义 Multisample</span></span>
<span class="line"><span>   → MultisampleStateCreateInfo</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>8. 定义 Color Blend</span></span>
<span class="line"><span>   → ColorBlendStateCreateInfo</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>9. 定义 Depth/Stencil</span></span>
<span class="line"><span>   → DepthStencilStateCreateInfo</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>10. 创建 Pipeline Layout</span></span>
<span class="line"><span>    → PipelineLayoutCreateInfo</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>11. 创建 Pipeline</span></span>
<span class="line"><span>    → createGraphicsPipelines()</span></span></code></pre></div><h2 id="_13-5-pipeline-cache-管线缓存" tabindex="-1">13.5 Pipeline Cache（管线缓存） <a class="header-anchor" href="#_13-5-pipeline-cache-管线缓存" aria-label="Permalink to &quot;13.5 Pipeline Cache（管线缓存）&quot;">​</a></h2><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Pipeline 创建成本高，可缓存重复创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 保存 Pipeline 的二进制表示</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 创建 Pipeline Cache</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline_cache </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> device.create_pipeline_cache(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vkbottle.PipelineCacheCreateInfo()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 使用 Cache 创建 Pipeline</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> device.create_graphics_pipelines(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    pipelineCache</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline_cache,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 传入 Cache</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    createInfos</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[pipeline_create_info],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 导出 Cache</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cache_data </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pipeline_cache.get_data()[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">with</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;pipeline_cache.bin&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;wb&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> f:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    f.write(cache_data)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 下次启动时导入 Cache</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">with</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;pipeline_cache.bin&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;rb&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> f:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    cache_data </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> f.read()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pipeline_cache_import </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vkbottle.PipelineCacheCreateInfo(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    initialData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cache_data,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    initialDataSize</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">len</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cache_data),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><hr><p>| 7-12 | ✅ | | <strong>13. 管线状态管理</strong> | ✅ | | 14-15 | 🔲 | | 16-25 | 🔲 | | 26-35 | 🔲 | | 36-40 | 🔲 | | A-D 附录 | 🔲 |</p>`,19)])])}const g=a(l,[["render",e]]);export{c as __pageData,g as default};
