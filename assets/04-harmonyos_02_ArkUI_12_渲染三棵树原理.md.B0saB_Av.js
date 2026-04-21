import{_ as s,o as n,c as e,ae as i}from"./chunks/framework.Czhw_PXq.js";const k=JSON.parse('{"title":"渲染三棵树原理","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/02_ArkUI/12_渲染三棵树原理.md","filePath":"04-harmonyos/02_ArkUI/12_渲染三棵树原理.md"}'),p={name:"04-harmonyos/02_ArkUI/12_渲染三棵树原理.md"};function l(t,a,r,h,d,o){return n(),e("div",null,[...a[0]||(a[0]=[i(`<h1 id="渲染三棵树原理" tabindex="-1">渲染三棵树原理 <a class="header-anchor" href="#渲染三棵树原理" aria-label="Permalink to &quot;渲染三棵树原理&quot;">​</a></h1><blockquote><p>ArkUI 的渲染引擎核心：逻辑树 → 渲染树 → 节点树（LayerTree/RSNode）。</p></blockquote><hr><h2 id="_1-渲染三棵树概览" tabindex="-1">1. 渲染三棵树概览 <a class="header-anchor" href="#_1-渲染三棵树概览" aria-label="Permalink to &quot;1. 渲染三棵树概览&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户操作（点击/状态变化）</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>【第一棵：逻辑树 ViewTree】</span></span>
<span class="line"><span>   ArkUI 框架层</span></span>
<span class="line"><span>   - 组件描述</span></span>
<span class="line"><span>   - 状态管理</span></span>
<span class="line"><span>   - 数据绑定</span></span>
<span class="line"><span>    ↓ Diff</span></span>
<span class="line"><span>【第二棵：渲染树 RenderTree】</span></span>
<span class="line"><span>   ArkUI RenderService</span></span>
<span class="line"><span>   - 布局计算（Layout/Measure）</span></span>
<span class="line"><span>   - 样式计算</span></span>
<span class="line"><span>   - 节点树生成</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>【第三棵：节点树 LayerTree/RSNode】</span></span>
<span class="line"><span>   Render Service / GPU</span></span>
<span class="line"><span>   - 绘制（Draw）</span></span>
<span class="line"><span>   - 合成（Composition）</span></span>
<span class="line"><span>   - 显存管理</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>屏幕显示</span></span></code></pre></div><hr><h2 id="_2-第一棵-逻辑树-viewtree" tabindex="-1">2. 第一棵：逻辑树（ViewTree） <a class="header-anchor" href="#_2-第一棵-逻辑树-viewtree" aria-label="Permalink to &quot;2. 第一棵：逻辑树（ViewTree）&quot;">​</a></h2><h3 id="_2-1-职责" tabindex="-1">2.1 职责 <a class="header-anchor" href="#_2-1-职责" aria-label="Permalink to &quot;2.1 职责&quot;">​</a></h3><p>逻辑树是 ArkUI 的<strong>UI 描述层</strong>，由框架创建和维护：</p><ul><li>组件树结构的创建和管理</li><li>状态管理（@State/@Prop/@Link 等）</li><li>Diff 算法对比新旧 UI 描述</li><li>生成渲染树变更指令</li></ul><h3 id="_2-2-生命周期" tabindex="-1">2.2 生命周期 <a class="header-anchor" href="#_2-2-生命周期" aria-label="Permalink to &quot;2.2 生命周期&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>组件创建 → 逻辑树节点创建</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>状态变化 → Diff 对比 → 变更标记</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>渲染树更新 → 变更下发到渲染树</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>组件销毁 → 逻辑树节点销毁</span></span></code></pre></div><h3 id="_2-3-diff-算法" tabindex="-1">2.3 Diff 算法 <a class="header-anchor" href="#_2-3-diff-算法" aria-label="Permalink to &quot;2.3 Diff 算法&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 状态变化后，ArkUI 执行 Diff 对比</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> oldTree</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 旧的 UI 描述</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> newTree</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 新的 UI 描述</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Diff 对比（三层）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newTree.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (newTree[i] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> oldTree[i]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 相同 → 跳过</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (newTree[i].type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> oldTree[i].type) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 类型相同 → 对比属性，更新变化的属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 类型不同 → 删除旧节点，创建新节点</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_3-第二棵-渲染树-rendertree" tabindex="-1">3. 第二棵：渲染树（RenderTree） <a class="header-anchor" href="#_3-第二棵-渲染树-rendertree" aria-label="Permalink to &quot;3. 第二棵：渲染树（RenderTree）&quot;">​</a></h2><h3 id="_3-1-职责" tabindex="-1">3.1 职责 <a class="header-anchor" href="#_3-1-职责" aria-label="Permalink to &quot;3.1 职责&quot;">​</a></h3><p>渲染树是 ArkUI 的<strong>布局计算层</strong>：</p><ul><li>执行 Measure（测量）→ Layout（布局）→ Draw（绘制）</li><li>坐标系统计算</li><li>层合并（Layer Merging）优化</li><li>渲染指令生成</li></ul><h3 id="_3-2-渲染流程" tabindex="-1">3.2 渲染流程 <a class="header-anchor" href="#_3-2-渲染流程" aria-label="Permalink to &quot;3.2 渲染流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. Measure（测量）</span></span>
<span class="line"><span>   - 计算每个节点需要的尺寸</span></span>
<span class="line"><span>   - 从叶子节点向根节点传递（Bottom-up）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. Layout（布局）</span></span>
<span class="line"><span>   - 根据测量结果确定每个节点的位置</span></span>
<span class="line"><span>   - 从根节点向叶子节点传递（Top-down）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. Draw（绘制）</span></span>
<span class="line"><span>   - 生成绘制指令</span></span>
<span class="line"><span>   - 传递给渲染服务（RenderService）</span></span></code></pre></div><h3 id="_3-3-层合并-layer-merging-优化" tabindex="-1">3.3 层合并（Layer Merging）优化 <a class="header-anchor" href="#_3-3-层合并-layer-merging-优化" aria-label="Permalink to &quot;3.3 层合并（Layer Merging）优化&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>未合并：</span></span>
<span class="line"><span>┌─────┐  ┌─────┐  ┌─────┐</span></span>
<span class="line"><span>│ Text │  │Text │  │Text │</span></span>
<span class="line"><span>└─────┘  └─────┘  └─────┘</span></span>
<span class="line"><span>（3 个渲染层）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>层合并后：</span></span>
<span class="line"><span>┌─────────────────┐</span></span>
<span class="line"><span>│ Text Text Text  │</span></span>
<span class="line"><span>└─────────────────┘</span></span>
<span class="line"><span>（1 个渲染层）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>效果：减少 GPU 层数，提升渲染性能</span></span></code></pre></div><hr><h2 id="_4-第三棵-节点树-layertree-rsnode" tabindex="-1">4. 第三棵：节点树（LayerTree/RSNode） <a class="header-anchor" href="#_4-第三棵-节点树-layertree-rsnode" aria-label="Permalink to &quot;4. 第三棵：节点树（LayerTree/RSNode）&quot;">​</a></h2><h3 id="_4-1-职责" tabindex="-1">4.1 职责 <a class="header-anchor" href="#_4-1-职责" aria-label="Permalink to &quot;4.1 职责&quot;">​</a></h3><p>节点树是<strong>渲染服务层</strong>（RenderService），直接操作 GPU：</p><ul><li>FrameNode → RenderNode 的映射</li><li>GPU 显存管理</li><li>绘制指令执行</li><li>图层合成</li></ul><h3 id="_4-2-framenode-vs-rendernode" tabindex="-1">4.2 FrameNode vs RenderNode <a class="header-anchor" href="#_4-2-framenode-vs-rendernode" aria-label="Permalink to &quot;4.2 FrameNode vs RenderNode&quot;">​</a></h3><table tabindex="0"><thead><tr><th>概念</th><th>层级</th><th>说明</th></tr></thead><tbody><tr><td><strong>FrameNode</strong></td><td>ArkUI 层</td><td>开发者可见的 UI 组件节点</td></tr><tr><td><strong>RenderNode</strong></td><td>RenderService 层</td><td>底层渲染对象，不可见</td></tr></tbody></table><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ArkUI 层                    RenderService 层</span></span>
<span class="line"><span>FrameNode (UI节点)    →    RenderNode (渲染对象)</span></span>
<span class="line"><span>FrameNode (UI节点)    →    RenderNode (渲染对象)</span></span>
<span class="line"><span>    ↓                        ↓</span></span>
<span class="line"><span>Diff 对比 (ArkUI)      变更下发 (RenderService)</span></span>
<span class="line"><span>    ↓                        ↓</span></span>
<span class="line"><span>Measure/Layout/Draw   →    GPU 绘制 → 合成 → 屏幕</span></span></code></pre></div><hr><h2 id="_5-渲染优化的核心思路" tabindex="-1">5. 渲染优化的核心思路 <a class="header-anchor" href="#_5-渲染优化的核心思路" aria-label="Permalink to &quot;5. 渲染优化的核心思路&quot;">​</a></h2><h3 id="_5-1-减少不必要的重建" tabindex="-1">5.1 减少不必要的重建 <a class="header-anchor" href="#_5-1-减少不必要的重建" aria-label="Permalink to &quot;5.1 减少不必要的重建&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>❌ 触发全量重建：</span></span>
<span class="line"><span>├─ 修改了根节点的 @State</span></span>
<span class="line"><span>├─ build() 中嵌套太深（Diff 开销大）</span></span>
<span class="line"><span>└─ 频繁创建/销毁组件节点</span></span>
<span class="line"><span></span></span>
<span class="line"><span>✅ 局部刷新：</span></span>
<span class="line"><span>├─ 修改局部 @State（只重建该节点及其子树）</span></span>
<span class="line"><span>├─ 使用 LazyForEach（按需渲染）</span></span>
<span class="line"><span>└─ 组件提取复用（减少 Diff 范围）</span></span></code></pre></div><h3 id="_5-2-减少层数" tabindex="-1">5.2 减少层数 <a class="header-anchor" href="#_5-2-减少层数" aria-label="Permalink to &quot;5.2 减少层数&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 减少层数的方法：</span></span>
<span class="line"><span>├─ 合并相邻相同样式的文本（层合并）</span></span>
<span class="line"><span>├─ 使用固定宽高（避免 Measure 重复计算）</span></span>
<span class="line"><span>├─ 减少嵌套深度（降低布局计算量）</span></span>
<span class="line"><span>└─ 使用图片下采样（减少显存占用）</span></span></code></pre></div><h3 id="_5-3-渲染三棵树性能影响" tabindex="-1">5.3 渲染三棵树性能影响 <a class="header-anchor" href="#_5-3-渲染三棵树性能影响" aria-label="Permalink to &quot;5.3 渲染三棵树性能影响&quot;">​</a></h3><p>| 优化点 | 影响哪棵树 | 效果 | |---|-|-|--| | 固定宽高 | 第二棵（RenderTree） | 避免重复 Measure | | 减少嵌套 | 第一棵 + 第二棵 | 减少 Diff + 布局开销 | | LazyForEach | 第二棵 + 第三棵 | 按需创建渲染层 | | 图片下采样 | 第三棵（LayerTree） | 减少显存占用 | | 层合并 | 第三棵（LayerTree） | 减少 GPU 层数 |</p><hr><h2 id="_6-面试高频考点" tabindex="-1">6. 面试高频考点 <a class="header-anchor" href="#_6-面试高频考点" aria-label="Permalink to &quot;6. 面试高频考点&quot;">​</a></h2><h3 id="q1-渲染三棵树分别是什么" tabindex="-1">Q1: 渲染三棵树分别是什么？ <a class="header-anchor" href="#q1-渲染三棵树分别是什么" aria-label="Permalink to &quot;Q1: 渲染三棵树分别是什么？&quot;">​</a></h3><p><strong>回答</strong>：</p><ol><li><strong>逻辑树（ViewTree）</strong>：UI 描述层，包含组件树和状态管理，执行 Diff 对比</li><li><strong>渲染树（RenderTree）</strong>：布局计算层，执行 Measure → Layout → Draw</li><li><strong>节点树（LayerTree/RSNode）</strong>：渲染服务层，映射到 GPU，执行绘制和合成</li></ol><h3 id="q2-framenode-和-rendernode-的区别" tabindex="-1">Q2: FrameNode 和 RenderNode 的区别？ <a class="header-anchor" href="#q2-framenode-和-rendernode-的区别" aria-label="Permalink to &quot;Q2: FrameNode 和 RenderNode 的区别？&quot;">​</a></h3><p><strong>回答</strong>：FrameNode 是 ArkUI 层开发者可见的 UI 节点，RenderNode 是 RenderService 层底层渲染对象。FrameNode 通过 Diff 对比生成变更指令，传递给 RenderNode 执行。</p><h3 id="q3-层合并-layer-merging-的作用" tabindex="-1">Q3: 层合并（Layer Merging）的作用？ <a class="header-anchor" href="#q3-层合并-layer-merging-的作用" aria-label="Permalink to &quot;Q3: 层合并（Layer Merging）的作用？&quot;">​</a></h3><p><strong>回答</strong>：将相邻相同样式的组件合并为同一个渲染层，减少 GPU 层数，提升渲染性能。</p><hr><blockquote><p>🐱 <strong>小猫提示</strong>：渲染三棵树是鸿蒙面试中<strong>最硬核的原理题</strong>。记住：<strong>ViewTree（Diff）→ RenderTree（Measure/Layout/Draw）→ LayerTree（GPU绘制/合成）</strong>。面试中能画出来就稳了。</p></blockquote>`,50)])])}const g=s(p,[["render",l]]);export{k as __pageData,g as default};
