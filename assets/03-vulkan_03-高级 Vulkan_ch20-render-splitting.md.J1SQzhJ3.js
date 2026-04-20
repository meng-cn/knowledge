import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const E=JSON.parse('{"title":"第十九章 · 渲染分割 (Render Splitting)","description":"","frontmatter":{},"headers":[],"relativePath":"03-vulkan/03-高级 Vulkan/ch20-render-splitting.md","filePath":"03-vulkan/03-高级 Vulkan/ch20-render-splitting.md"}'),e={name:"03-vulkan/03-高级 Vulkan/ch20-render-splitting.md"};function l(t,s,h,k,r,d){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="第十九章-·-渲染分割-render-splitting" tabindex="-1">第十九章 · 渲染分割 (Render Splitting) <a class="header-anchor" href="#第十九章-·-渲染分割-render-splitting" aria-label="Permalink to &quot;第十九章 · 渲染分割 (Render Splitting)&quot;">​</a></h1><h2 id="_19-1-渲染模式对比" tabindex="-1">19.1 渲染模式对比 <a class="header-anchor" href="#_19-1-渲染模式对比" aria-label="Permalink to &quot;19.1 渲染模式对比&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>渲染分割 = 将渲染任务分成多个 Pass，每个 Pass 处理不同的渲染任务</span></span>
<span class="line"><span></span></span>
<span class="line"><span>三种主要渲染模式:</span></span>
<span class="line"><span>┌───────────────────────────────┐</span></span>
<span class="line"><span>│ 前向渲染 (Forward Rendering)   │</span></span>
<span class="line"><span>│ 最亮的物体在最前              │</span></span>
<span class="line"><span>│ 每个像素计算所有光源          │</span></span>
<span class="line"><span>└───────────────────────────────┘</span></span>
<span class="line"><span>┌───────────────────────────────┐</span></span>
<span class="line"><span>│ 延迟渲染 (Deferred Rendering) │</span></span>
<span class="line"><span>│ 先渲染 G-Buffer              │</span></span>
<span class="line"><span>│ 再对每个像素计算所有光源      │</span></span>
<span class="line"><span>└───────────────────────────────┘</span></span>
<span class="line"><span>┌───────────────────────────────┐</span></span>
<span class="line"><span>│ Clustered/Forward+ Rendering  │</span></span>
<span class="line"><span>│ 将空间分簇，每簇计算部分光源  │</span></span>
<span class="line"><span>│ 前向的改进版                  │</span></span>
<span class="line"><span>└───────────────────────────────┘</span></span></code></pre></div><h2 id="_19-2-前向渲染-forward-rendering" tabindex="-1">19.2 前向渲染 (Forward Rendering) <a class="header-anchor" href="#_19-2-前向渲染-forward-rendering" aria-label="Permalink to &quot;19.2 前向渲染 (Forward Rendering)&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>前向渲染 = 传统渲染模式</span></span>
<span class="line"><span></span></span>
<span class="line"><span>流程:</span></span>
<span class="line"><span>1. 按深度排序物体（近到远）</span></span>
<span class="line"><span>2. 对每个物体：</span></span>
<span class="line"><span>   - 设置 Uniform（模型、视角、光照）</span></span>
<span class="line"><span>   - 渲染物体（绘制调用）</span></span>
<span class="line"><span>3. 后处理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点:</span></span>
<span class="line"><span>  - 实现简单</span></span>
<span class="line"><span>  - 对少量光源高效</span></span>
<span class="line"><span>  - 透明物体处理简单</span></span>
<span class="line"><span></span></span>
<span class="line"><span>缺点:</span></span>
<span class="line"><span>  - 光源多时性能差（O(N光源 × N物体)）</span></span>
<span class="line"><span>  - 重复计算（相同光照被多个物体重新计算）</span></span></code></pre></div><h3 id="_19-2-1-前向渲染管线" tabindex="-1">19.2.1 前向渲染管线 <a class="header-anchor" href="#_19-2-1-前向渲染管线" aria-label="Permalink to &quot;19.2.1 前向渲染管线&quot;">​</a></h3><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">def</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> forward_render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(scene, camera):</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 1. 渲染不透明物体（按深度排序）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    opaque_objects </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> sorted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(scene.objects, </span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">                          key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=lambda</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> o: distance(camera.pos, o.pos))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> obj </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> opaque_objects:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        update_ubo(camera, obj)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        bind_pipeline(obj.material)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        bind_descriptor_sets(obj.material)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        draw(obj.mesh)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 2. 渲染透明物体（从后往前）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    transparent_objects </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> sorted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(scene.transparent_objects, </span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">                                key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=lambda</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> o: distance(camera.pos, o.pos), </span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">                                reverse</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">True</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> obj </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> transparent_objects:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        enable_blending()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        update_ubo(camera, obj)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        bind_pipeline(obj.material)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        draw(obj.mesh)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 3. 后处理</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    render_pass_post_process()</span></span></code></pre></div><h2 id="_19-3-延迟渲染-deferred-rendering" tabindex="-1">19.3 延迟渲染 (Deferred Rendering) <a class="header-anchor" href="#_19-3-延迟渲染-deferred-rendering" aria-label="Permalink to &quot;19.3 延迟渲染 (Deferred Rendering)&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>延迟渲染 = 先渲染几何信息，再计算光照</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Pass 1: Geometry Pass (G-Buffer)</span></span>
<span class="line"><span>  ┌──────┐ ┌───┐ ┌───┐ ┌──────┐</span></span>
<span class="line"><span>  │ Pos   │ │ Norm│ │ Col │ │ Depth │</span></span>
<span class="line"><span>  └───────┘ └───┘ └───┘ └──────┘</span></span>
<span class="line"><span>  所有物体渲染到 G-Buffer（4 个纹理附件）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Pass 2: Lighting Pass</span></span>
<span class="line"><span>  ┌────────┐ ┌───────┐ ┌───────┐</span></span>
<span class="line"><span>  │ PointLight1 → G-Buffer → 计算所有光源 │</span></span>
<span class="line"><span>  │ PointLight2 → G-Buffer → 每个像素计算所有光源 │</span></span>
<span class="line"><span>  │ DirectionalLight → G-Buffer → 高效！ │</span></span>
<span class="line"><span>  └───────┘ └───────┘ └───────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点:</span></span>
<span class="line"><span>  - 光源数量不影响性能（O(光源) = O(像素)）</span></span>
<span class="line"><span>  - 无重复计算</span></span>
<span class="line"><span></span></span>
<span class="line"><span>缺点:</span></span>
<span class="line"><span>  - MSAA 困难</span></span>
<span class="line"><span>  - 透明物体处理复杂</span></span>
<span class="line"><span>  - 内存带宽要求高</span></span></code></pre></div><h3 id="_19-3-1-g-buffer-创建" tabindex="-1">19.3.1 G-Buffer 创建 <a class="header-anchor" href="#_19-3-1-g-buffer-创建" aria-label="Permalink to &quot;19.3.1 G-Buffer 创建&quot;">​</a></h3><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># --- 创建 G-Buffer ---</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">g_buffer_attachments </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 位置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    create_render_target(device, width, height, vkbottle.Format.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">R32G32B32_SFLOAT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 法线</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    create_render_target(device, width, height, vkbottle.Format.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">R16G16B16A16_SFLOAT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 颜色/材质</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    create_render_target(device, width, height, vkbottle.Format.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">R16G16B16A16_SFLOAT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 深度</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    create_depth_image(device, width, height),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre></div><h3 id="_19-3-2-光照-pass" tabindex="-1">19.3.2 光照 Pass <a class="header-anchor" href="#_19-3-2-光照-pass" aria-label="Permalink to &quot;19.3.2 光照 Pass&quot;">​</a></h3><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 光照 Pass 只渲染一个全屏四边形</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Shader 从 G-Buffer 读取信息并计算光照</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">def</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lighting_pass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(device, command_buffer, g_buffer, lights, viewport):</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 1. 开始 Render Pass（使用 G-Buffer 作为附件）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    render_pass_begin_info </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vkbottle.RenderPassBeginInfo(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        renderPass</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">g_buffer_render_pass,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        framebuffer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">g_buffer_framebuffer,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        renderArea</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vkbottle.Rect2D(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">offset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">extent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">viewport),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 2. 绑定全屏四边形管线</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    command_buffer.bind_pipeline_graphics(light_pipeline)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 3. 绑定 G-Buffer 描述符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    command_buffer.bind_descriptor_sets(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkbottle.PipelineBindPoint.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">GRAPHICS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        light_pipeline_layout,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [g_buffer_descriptor_set],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 4. 绑定光源 Uniform</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    command_buffer.bind_descriptor_sets(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vkbottle.PipelineBindPoint.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">GRAPHICS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        light_pipeline_layout,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [light_descriptor_set],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 5. 绘制全屏四边形</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    command_buffer.draw(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">vertexCount</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">instanceCount</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">                       firstVertex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">firstInstance</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 6. 结束</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    command_buffer.end_render_pass()</span></span></code></pre></div><h2 id="_19-4-clustered-forward-rendering" tabindex="-1">19.4 Clustered/Forward+ Rendering <a class="header-anchor" href="#_19-4-clustered-forward-rendering" aria-label="Permalink to &quot;19.4 Clustered/Forward+ Rendering&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Clustered Rendering = 空间分簇 + 前向渲染</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 将相机视锥体分簇（3D grid）</span></span>
<span class="line"><span>2. 对每个光源，确定它影响的簇</span></span>
<span class="line"><span>3. 对每个簇，只渲染影响该簇的光源</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点:</span></span>
<span class="line"><span>  - 前向的性能</span></span>
<span class="line"><span>  - 延迟的扩展性</span></span>
<span class="line"><span>  - 混合两种模式的优点</span></span>
<span class="line"><span></span></span>
<span class="line"><span>复杂度:</span></span>
<span class="line"><span>  - 高（需要 GPU 计算着色器）</span></span>
<span class="line"><span>  - 需要 Cluster 分配</span></span>
<span class="line"><span>  - 需要 Cluster 感知的光源查询</span></span></code></pre></div><h2 id="_19-5-多-pass-渲染流程" tabindex="-1">19.5 多 Pass 渲染流程 <a class="header-anchor" href="#_19-5-多-pass-渲染流程" aria-label="Permalink to &quot;19.5 多 Pass 渲染流程&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>多 Pass 渲染通用流程:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Pass 1: Scene → G-Buffer/RT1</span></span>
<span class="line"><span>Pass 2: RT1 → RT2 (后处理)</span></span>
<span class="line"><span>Pass 3: RT2 → Screen (呈现)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>每个 Pass 需要:</span></span>
<span class="line"><span>  1. 新的 Render Pass（或复用）</span></span>
<span class="line"><span>  2. 新的 Framebuffer</span></span>
<span class="line"><span>  3. 同步屏障（确保数据就绪）</span></span>
<span class="line"><span>  4. 切换 Pipeline</span></span>
<span class="line"><span>  5. 切换描述符</span></span></code></pre></div><hr><p>| 16-18 | ✅ | | <strong>19. 渲染分割</strong> | ✅ | | 20-25 | 🔲 |</p>`,19)])])}const g=a(e,[["render",l]]);export{E as __pageData,g as default};
