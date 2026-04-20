import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const c=JSON.parse('{"title":"03 - UI 系统深度","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/04_UI_Deep/03_UI_System_Deep.md","filePath":"01-ios/04_UI_Deep/03_UI_System_Deep.md"}'),l={name:"01-ios/04_UI_Deep/03_UI_System_Deep.md"};function h(e,s,t,k,r,E){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="_03-ui-系统深度" tabindex="-1">03 - UI 系统深度 <a class="header-anchor" href="#_03-ui-系统深度" aria-label="Permalink to &quot;03 - UI 系统深度&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-uikit-渲染管线深度分析">UIKit 渲染管线深度分析</a></li><li><a href="#2-core-animation-合成机制">Core Animation 合成机制</a></li><li><a href="#3-离屏渲染深度分析">离屏渲染深度分析</a></li><li><a href="#4-屏幕渲染光栅化与帧率">屏幕渲染：光栅化与帧率</a></li><li><a href="#5-布局引擎源码级分析">布局引擎源码级分析</a></li><li><a href="#6-ui-性能优化全攻略">UI 性能优化全攻略</a></li><li><a href="#7-accessibility-无障碍">Accessibility 无障碍</a></li><li><a href="#8-面试考点汇总">面试考点汇总</a></li></ol><hr><h2 id="_1-uikit-渲染管线深度分析" tabindex="-1">1. UIKit 渲染管线深度分析 <a class="header-anchor" href="#_1-uikit-渲染管线深度分析" aria-label="Permalink to &quot;1. UIKit 渲染管线深度分析&quot;">​</a></h2><h3 id="_1-1-渲染管线全链路-源码级" tabindex="-1">1.1 渲染管线全链路（源码级） <a class="header-anchor" href="#_1-1-渲染管线全链路-源码级" aria-label="Permalink to &quot;1.1 渲染管线全链路（源码级）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     iOS 渲染管线完整流程                                │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Phase 1: 布局（Layout Phase）                                       │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────────────────        │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  CADisplayLink → Runloop (TimerCommon)                              │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  -display 事件到达 → setNeedsLayout 标记的视图触发                    │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  [CATransaction begin]  // 自动 begin                               │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  UIView _setNeedsLayoutRecursive()                                  │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CALayer setNeedsLayout()                                           │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  [_updateLayoutWithTransaction:]                                    │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  layoutIfNeeded() → layoutSubviews()                                │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  递归：                                                              │</span></span>
<span class="line"><span>│  ┌─→ view.layoutSubviews()                                        │</span></span>
<span class="line"><span>│  │   └─→ layer.layoutSublayers()                                   │</span></span>
<span class="line"><span>│  │   └─→ draw(in:) (如果 needsDisplay)                              │</span></span>
<span class="line"><span>│  │                                                                    │</span></span>
<span class="line"><span>│  │   └─→ subviews.forEach { v.setNeedsLayout() }  // 向下            │</span></span>
<span class="line"><span>│  └─→ subviews.forEach { v.layoutIfNeeded() }  // 向上                │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Phase 2: 绘制（Draw Phase）                                       │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────────────────        │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  CATransaction flush() 触发                                            │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  [CADisplayLink next VSync 前]                                      │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CATiledLayer.tileCache.update() // 平铺更新                         │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CARenderer.update()                                                │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CAContext.render()                                                 │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CAViewRender.render() → CAViewRenderContext.render()              │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CAContext.renderTree()                                             │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  渲染树（Render Tree）构建：                                          │</span></span>
<span class="line"><span>│  ┌─→ CAPropertyAnimation.update()   // 动画                         │</span></span>
<span class="line"><span>│  ├─→ CAReplicatorLayer.update()     // 复制层                        │</span></span>
<span class="line"><span>│  ├─→ CAEmitterLayer.update()         // 粒子                         │</span></span>
<span class="line"><span>│  ├─→ CALayer.draw(in:)              // 自定义绘制                     │</span></span>
<span class="line"><span>│  ├─→ CAImageProvider.update()        // 图片                         │</span></span>
<span class="line"><span>│  └─→ CAImageProvider.cacheImage()    // 缓存                         │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Phase 3: 提交（Commit Phase）                                     │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────────────────        │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  CATransaction flush() → 提交到 CADisplayLink                        │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CAContext.flush()                                                  │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CAContext.commit()                                                 │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  CAImageProvider.commit()                                           │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  离屏缓冲区（Off-screen buffer）                                    │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  GPU 合成指令（OpenGL ES / Metal）                                   │</span></span>
<span class="line"><span>│       │                                                              │</span></span>
<span class="line"><span>│       ▼                                                              │</span></span>
<span class="line"><span>│  VSync → 输出到屏幕                                                   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>渲染管线时序图：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Frame 1 (0ms)         Frame 2 (16.67ms)     Frame 3 (33.33ms)</span></span>
<span class="line"><span>┌──────────────┐      ┌───────────────┐      ┌───────────────┐</span></span>
<span class="line"><span>│ Runloop:     │      │ Runloop:      │      │ Runloop:      │</span></span>
<span class="line"><span>│ 1. layout    │─┐    │ 1. layout     │─┐    │ 1. layout     │─┐</span></span>
<span class="line"><span>│ 2. draw      │ │    │ 2. draw       │ │    │ 2. draw       │ │</span></span>
<span class="line"><span>│ 3. commit    │─┘    │ 3. commit     │─┘    │ 3. commit     │─┘</span></span>
<span class="line"><span>│ 4. wait      │       │ 4. wait       │       │ 4. wait       │</span></span>
<span class="line"><span>└─────────────┘       └───────────────┘      └───────────────┘</span></span>
<span class="line"><span>                        ▲ VSync                   ▲ VSync</span></span>
<span class="line"><span>                       (GPU 合成)                (GPU 合成)</span></span></code></pre></div><h3 id="_1-2-catransaction-深度分析" tabindex="-1">1.2 CATransaction 深度分析 <a class="header-anchor" href="#_1-2-catransaction-深度分析" aria-label="Permalink to &quot;1.2 CATransaction 深度分析&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">CATransaction（事务）是 Core Animation 的核心机制：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">原理：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ CATransaction                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 作用：                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 批量提交图层属性的变更                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 合并多个动画为一个                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 自动 begin/commit                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 保证原子性（全部成功或全部失败）        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 生命周期：                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 隐式 begin：每次事件循环自动开始        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 隐式 commit：事件循环结束时自动提交     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 显式 begin/commit：手动控制            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 关键方法：                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.begin()               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.commit()              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.flush()               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.setValue(_, forKey:)  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.animationDuration     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.animationTimingFunction│</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • CATransaction.shouldRasterize        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 注意：                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 每次修改可动画属性，自动隐式 begin    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 修改完自动 commit，产生动画            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • flush() 强制立即提交                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CATransaction 的最佳实践：</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> batchUpdate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 手动 begin（避免隐式动画）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">begin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 禁用隐式动画</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">setAnimationDuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 批量修改</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    layer.backgroundColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIColor.red.cgColor</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    layer.opacity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    layer.bounds </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newBounds</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    layer.transform </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newTransform</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 提交</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">commit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 或者用 flush() 立即执行</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // CATransaction.flush()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CATransaction 嵌套：</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">begin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">setAnimationDuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 外层动画</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">begin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">setAnimationDuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 内层动画（会覆盖外层）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">commit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CATransaction.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">commit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><hr><h2 id="_2-core-animation-合成机制" tabindex="-1">2. Core Animation 合成机制 <a class="header-anchor" href="#_2-core-animation-合成机制" aria-label="Permalink to &quot;2. Core Animation 合成机制&quot;">​</a></h2><h3 id="_2-1-渲染服务器-render-server" tabindex="-1">2.1 渲染服务器（Render Server） <a class="header-anchor" href="#_2-1-渲染服务器-render-server" aria-label="Permalink to &quot;2.1 渲染服务器（Render Server）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Core Animation 渲染架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    App Process                         │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  CAContext (Core Animation Context)             │  │</span></span>
<span class="line"><span>│  │  • 管理渲染命令缓冲区                           │  │</span></span>
<span class="line"><span>│  │  • 处理图层树（Render Tree）                     │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  CAViewRender (视图渲染层)                       │  │</span></span>
<span class="line"><span>│  │  • 构建渲染树                                  │  │</span></span>
<span class="line"><span>│  │  • 处理动画                                    │  │</span></span>
<span class="line"><span>│  │  • 处理滤镜                                    │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│                    │ Mach IPC                         │</span></span>
<span class="line"><span>│                    ▼                                   │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>                     ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                 Render Server (守护进程)               │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  CAGraphicsRenderer (GPU 渲染)                  │  │</span></span>
<span class="line"><span>│  │  • Metal / OpenGL ES                            │  │</span></span>
<span class="line"><span>│  │  • 帧缓冲区管理                                  │  │</span></span>
<span class="line"><span>│  │  • 合成引擎（Compositing Engine）               │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  CADisplay (显示同步)                             │  │</span></span>
<span class="line"><span>│  │  • VSync 信号管理                               │  │</span></span>
<span class="line"><span>│  │  • 帧率控制 (60fps / 120fps)                    │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  CAHardwareBackedLayer (硬件加速层)              │  │</span></span>
<span class="line"><span>│  │  • 直接写入 framebuffer                          │  │</span></span>
<span class="line"><span>│  │  • 不经过 CPU                                    │  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│                    │                                │</span></span>
<span class="line"><span>│                    ▼                                   │</span></span>
<span class="line"><span>│              物理屏幕                                    │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键理解：</span></span>
<span class="line"><span>• Core Animation 不只在 App 内部渲染，而是通过 Mach IPC 将渲染命令发送给 Render Server 守护进程</span></span>
<span class="line"><span>• Render Server 在独立进程运行，崩溃不会影响 App</span></span>
<span class="line"><span>• GPU 合成指令在 Render Server 的 GPU 上下文执行</span></span>
<span class="line"><span>• 这解释了为什么 Core Animation 性能高：GPU 并行处理图层合成</span></span></code></pre></div><h3 id="_2-2-图层合成分层结构" tabindex="-1">2.2 图层合成分层结构 <a class="header-anchor" href="#_2-2-图层合成分层结构" aria-label="Permalink to &quot;2.2 图层合成分层结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>图层合成（Compositing）过程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  图层树（Render Tree）                              │</span></span>
<span class="line"><span>│                                                    │</span></span>
<span class="line"><span>│  Window Layer (Root)                               │</span></span>
<span class="line"><span>│  ├─ View Controller View                           │</span></span>
<span class="line"><span>│  │  ├─ SubView 1 (opacity: 0.8, blendMode: normal)│</span></span>
<span class="line"><span>│  │  │  ├─ ImageLayer (contents: CGImage)          │</span></span>
<span class="line"><span>│  │  │  └─ LabelLayer (backgroundColor: white)     │</span></span>
<span class="line"><span>│  │  └─ SubView 2 (opacity: 0.6, blendMode: multiply)│</span></span>
<span class="line"><span>│  │     └─ TextFieldLayer                          │</span></span>
<span class="line"><span>│  └─ Window Overlay Layer (blur effect)             │</span></span>
<span class="line"><span>│                                                    │</span></span>
<span class="line"><span>│  合成步骤（自上而下）：                               │</span></span>
<span class="line"><span>│  1. 遍历所有可见图层（visibility: hidden 跳过）      │</span></span>
<span class="line"><span>│  2. 对每个图层：                                    │</span></span>
<span class="line"><span>│     • 应用变换（transform）                        │</span></span>
<span class="line"><span>│     • 应用裁剪（mask）                            │</span></span>
<span class="line"><span>│     • 应用阴影（shadow）                          │</span></span>
<span class="line"><span>│     • 渲染到离屏缓冲区（如需离屏）                  │</span></span>
<span class="line"><span>│  3. 按层顺序（zPosition）排序                       │</span></span>
<span class="line"><span>│  4. 混合（blending）：                              │</span></span>
<span class="line"><span>│     • normal / multiply / screen / overlay        │</span></span>
<span class="line"><span>│     • 根据 opacity 混合                            │</span></span>
<span class="line"><span>│  5. 输出到最终缓冲区                                 │</span></span>
<span class="line"><span>│  6. VSync 同步输出到屏幕                            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>混合模式对比：</span></span>
<span class="line"><span>┌────────┬─────────────────────┬──────────────────────┐</span></span>
<span class="line"><span>│ 模式     │  效果                  │  性能影响           │</span></span>
<span class="line"><span>├────────┼─────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ normal │ 正常混合              │ 无                  │</span></span>
<span class="line"><span>│ multiply │ 变暗效果              │ 低                  │</span></span>
<span class="line"><span>│ screen │ 变亮效果              │ 低                  │</span></span>
<span class="line"><span>│ overlay │ 叠加效果              │ 低                  │</span></span>
<span class="line"><span>│ lighten │ 取亮值                │ 低                  │</span></span>
<span class="line"><span>│ darken │ 取暗值                │ 低                  │</span></span>
<span class="line"><span>│ plusDarker │ 变暗                │ 中                  │</span></span>
<span class="line"><span>│ plusLighter │ 变亮                │ 中                  │</span></span>
<span class="line"><span>│ colorDodge │ 颜色增亮             │ 中                  │</span></span>
<span class="line"><span>│ colorBurn  │ 颜色加深             │ 中                  │</span></span>
<span class="line"><span>│ hardLight  │ 强光                  │ 中                  │</span></span>
<span class="line"><span>│ softLight  │ 柔光                  │ 中                  │</span></span>
<span class="line"><span>│ difference │ 差值                  │ 高                  │</span></span>
<span class="line"><span>│ exclusion  │ 排除                  │ 高                  │</span></span>
<span class="line"><span>│ hue/sat/color/luminosity │ 色彩模式  │ 高                  │</span></span>
<span class="line"><span>└────────┴─────────────────────┴──────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>性能影响等级：</span></span>
<span class="line"><span>• 无：GPU 原生支持，零开销</span></span>
<span class="line"><span>• 低：简单乘法/加法，GPU 原生支持</span></span>
<span class="line"><span>• 中：需要额外计算，GPU 可处理</span></span>
<span class="line"><span>• 高：复杂计算，可能触发离屏渲染</span></span></code></pre></div><h3 id="_2-3-caanimation-动画系统" tabindex="-1">2.3 CAAnimation 动画系统 <a class="header-anchor" href="#_2-3-caanimation-动画系统" aria-label="Permalink to &quot;2.3 CAAnimation 动画系统&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">CAAnimation 体系：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│            CAAnimation              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                │                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌───────────┐  ┌───────────────┐  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ CABasicAnimation │  CAKeyframeAnimation │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • 单属性变化     │  • 关键帧路径动画   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • fromValue/toValue│ • values 数组     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • keyPath        │  • path CGPath    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • duration       │  • times 时间比例  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • timingFunction │  • pathAnimation  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────┘  └───────────────┘  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                │                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌───────────┐  ┌───────────────┐  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ CATransition  │  CAAnimationGroup │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • 过渡动画     │  • 多动画组合    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • type/fade  │  • 子动画数组    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • slide/rotate │  • 统一 duration │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • ripple/push  │  • 同步/异步执行 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────┘  └───────────┘  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                │                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌───────────┐                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ CAPropertyAnimation │           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • 子类基类          │           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │ • keyPath 解析      │           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────┘                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CABasicAnimation 核心机制：</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> animate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> animation </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CABasicAnimation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">keyPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;position.y&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.fromValue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layer.position.y</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.toValue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layer.position.y </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 100</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.duration </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.timingFunction </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAMediaTimingFunction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .easeInOut)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.fillMode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .forwards</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.isRemovedOnCompletion </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.delegate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    layer.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(animation, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;position&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ⚠️ 重要：动画完成后 layer.position 不变！</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 实际视觉位置由 animation 控制</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 如需持久化，需要在动画完成后手动设置 layer.position</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ✅ 正确做法：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 动画完成后设置真实值</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 或者删除动画后设置新位置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // layer.position.y += 100</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAKeyframeAnimation（关键帧路径动画）：</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> pathAnimation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CGMutablePath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    path.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">move</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CGPoint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">x</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">y</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    path.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addQuadCurve</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CGPoint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">x</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">y</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">controlPoint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CGPoint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">x</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">150</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">y</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-50</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    path.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addLine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CGPoint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">x</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">y</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> animation </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAKeyframeAnimation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">keyPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;position&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.duration </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.timingFunction </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAMediaTimingFunction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .easeInOut)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.rotationMode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .rotateAuto  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自动旋转方向</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.fillMode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .forwards</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    animation.isRemovedOnCompletion </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    layer.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(animation, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;path&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_3-离屏渲染深度分析" tabindex="-1">3. 离屏渲染深度分析 <a class="header-anchor" href="#_3-离屏渲染深度分析" aria-label="Permalink to &quot;3. 离屏渲染深度分析&quot;">​</a></h2><h3 id="_3-1-离屏渲染的产生机制" tabindex="-1">3.1 离屏渲染的产生机制 <a class="header-anchor" href="#_3-1-离屏渲染的产生机制" aria-label="Permalink to &quot;3.1 离屏渲染的产生机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>离屏渲染（Off-Screen Rendering）本质：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  正常渲染（On-Screen）                                    │</span></span>
<span class="line"><span>│  ┌────────────────────────────────┐                      │</span></span>
<span class="line"><span>│  │  GPU 渲染管线                   │                      │</span></span>
<span class="line"><span>│  │  1. 收集命令                    │                      │</span></span>
<span class="line"><span>│  │  2. 直接渲染到帧缓冲区          │                      │</span></span>
<span class="line"><span>│  │  3. VSync 输出到屏幕            │                      │</span></span>
<span class="line"><span>│  └───────────────────────────────┘                      │</span></span>
<span class="line"><span>│                                                        │</span></span>
<span class="line"><span>│  离屏渲染（Off-Screen）                                │</span></span>
<span class="line"><span>│  ┌────────────────────────────────┐                      │</span></span>
<span class="line"><span>│  │  GPU 渲染管线                   │                      │</span></span>
<span class="line"><span>│  │  1. 检测到不可合并的属性          │                      │</span></span>
<span class="line"><span>│  │  2. 创建新的离屏缓冲区           │                      │</span></span>
<span class="line"><span>│  │  3. 在缓冲区中渲染               │                      │</span></span>
<span class="line"><span>│  │  4. 将结果混合到主帧缓冲区        │                      │</span></span>
<span class="line"><span>│  │  5. 释放离屏缓冲区               │                      │</span></span>
<span class="line"><span>│  └───────────────────────────────┘                      │</span></span>
<span class="line"><span>│                                                        │</span></span>
<span class="line"><span>│  性能影响：                                             │</span></span>
<span class="line"><span>│  • 内存带宽增加 2x（读写两个缓冲区）                    │</span></span>
<span class="line"><span>│  • GPU 额外合成开销                                  │</span></span>
<span class="line"><span>│  • CPU 创建/释放缓冲区开销                            │</span></span>
<span class="line"><span>│  • 总体性能下降：5-10x（取决于图层大小和复杂度）          │</span></span>
<span class="line"><span>│                                                        │</span></span>
<span class="line"><span>│  触发条件（Instruments → Core Animation 查看红色）     │</span></span>
<span class="line"><span>│  • layer.masksToBounds = true / clipsToBounds = true   │</span></span>
<span class="line"><span>│  • layer.cornerRadius &gt; 0（且未用 CAShapeLayer）       │</span></span>
<span class="line"><span>│  • layer.shadow* 属性（且未设置 shadowPath）           │</span></span>
<span class="line"><span>│  • layer.shouldRasterize = true                       │</span></span>
<span class="line"><span>│  • layer.compositingFilter（混合滤镜）                 │</span></span>
<span class="line"><span>│  • 复杂 CGPath（CAShapeLayer）                         │</span></span>
<span class="line"><span>│  • 模糊效果 / 混合模式                                │</span></span>
<span class="line"><span>│  • layer.borderWidth &gt; 0 且 masksToBounds = true       │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>离屏渲染检测：</span></span>
<span class="line"><span>┌─────────────────────────────┐</span></span>
<span class="line"><span>│  Instruments → Core Animation│</span></span>
<span class="line"><span>│                              │</span></span>
<span class="line"><span>│  Color Off-screen Rendered  │</span></span>
<span class="line"><span>│  (红色 = 离屏渲染)            │</span></span>
<span class="line"><span>│                              │</span></span>
<span class="line"><span>│  Color Hits Spills and Misses │</span></span>
<span class="line"><span>│  · Green = hit cache        │</span></span>
<span class="line"><span>│  · Red = spill (offscreen)  │</span></span>
<span class="line"><span>│  · Blue = miss              │</span></span>
<span class="line"><span>│                              │</span></span>
<span class="line"><span>│  Color Blended Layers         │</span></span>
<span class="line"><span>│  (黄色 = 混合层)            │</span></span>
<span class="line"><span>│                              │</span></span>
<span class="line"><span>│  Color Instanced Draw Calls  │</span></span>
<span class="line"><span>│  (绿色 = 实例化绘制)         │</span></span>
<span class="line"><span>│                              │</span></span>
<span class="line"><span>│  Color Abandoned Layers       │</span></span>
<span class="line"><span>│  (灰色 = 废弃图层)           │</span></span>
<span class="line"><span>└──────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><h3 id="_3-2-各类离屏渲染的详细分析与优化" tabindex="-1">3.2 各类离屏渲染的详细分析与优化 <a class="header-anchor" href="#_3-2-各类离屏渲染的详细分析与优化" aria-label="Permalink to &quot;3.2 各类离屏渲染的详细分析与优化&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────┬───────────────────────────┬──────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  问题类型     │  原因                   │  优化方案    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├───────────────┼───────────────────────────┼──────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 圆角 + 裁剪   │ masksToBounds=true       │ CAShapeLayer │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 圆角 + 阴影   │ 两者同时触发             │ 组合优化      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 阴影 + shadowPath │ shadowPath 未设置   │ 设置 shadowPath│</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 圆角 + 图片    │ imageView + cornerRadius │ 预渲染/掩码   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 模糊效果      │ blur filter              │ UIVisualEffectView│</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 混合模式      │ compositingFilter        │ 预合成        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ shouldRasterize│ 重复渲染的图层           │ 按需启用      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 渐变背景      │ CAGradientLayer          │ 无（GPU优化）  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ CAShapeLayer  │ 复杂路径                 │ 简化路径      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────┴───────────────────────────┴──────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 圆角 + 裁剪优化（最经典）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ❌ 触发离屏渲染</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setCornerRadiusBad</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.cornerRadius </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.masksToBounds </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 离屏！</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ✅ 不触发离屏渲染</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setCornerRadiusGood</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAShapeLayer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mask.path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mask</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ✅✅ 性能最优（适合固定圆角）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setCornerRadiusOptimal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAShapeLayer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mask.path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mask.shouldRasterize </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 不缓存</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mask</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 阴影优化</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ❌ 触发离屏渲染</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setShadowBad</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOffset </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CGSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIColor.black.cgColor</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOpacity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowRadius </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // shadowPath 未设置 → 离屏！</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ✅ 不触发离屏渲染</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setShadowGood</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOffset </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CGSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIColor.black.cgColor</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOpacity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowRadius </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 关键：设置 shadowPath</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">insetBy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">dx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">dy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowPath </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 圆角 + 阴影 组合优化</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setCornerRadiusAndShadow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">radius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: CGFloat, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shadowColor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: UIColor, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shadowOffset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: CGSize, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shadowOpacity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Float</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shadowRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: CGFloat) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 圆角：用 mask</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: radius)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAShapeLayer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mask.path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mask</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 阴影：用 shadowPath</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> shadowPath </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">insetBy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">dx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">dy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: radius)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowPath </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> shadowPath.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOffset </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> shadowOffset</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> shadowColor.cgColor</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOpacity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> shadowOpacity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowRadius </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> shadowRadius</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. shouldRasterize 的陷阱</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ⚠️ shouldRasterize 不是银弹</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldRasterizeCarefully</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ 适用场景：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // • 图层内容不变且频繁渲染（如静态图标）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // • 图层包含多个子层且不需要动态更新</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // • 图层大小固定</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ❌ 不适用场景：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // • 图层内容会动态变化（每次变化都会重新栅格化，更慢！）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // • 图层很大（栅格化开销大）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // • 图层透明度变化（透明区域需要重新栅格化）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shouldRasterize </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.rasterizationScale </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIScreen.main.scale</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_4-屏幕渲染-光栅化与帧率" tabindex="-1">4. 屏幕渲染：光栅化与帧率 <a class="header-anchor" href="#_4-屏幕渲染-光栅化与帧率" aria-label="Permalink to &quot;4. 屏幕渲染：光栅化与帧率&quot;">​</a></h2><h3 id="_4-1-帧率与掉帧分析" tabindex="-1">4.1 帧率与掉帧分析 <a class="header-anchor" href="#_4-1-帧率与掉帧分析" aria-label="Permalink to &quot;4.1 帧率与掉帧分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>帧率（FPS）与渲染时间关系：</span></span>
<span class="line"><span>┌──────────────┬───────────────┬─────────┬──────────────┐</span></span>
<span class="line"><span>│ 帧率          │ 每帧时间       │ 可用预算 │ 状态          │</span></span>
<span class="line"><span>├──────────────┼───────────────┼─────────┼──────────────┤</span></span>
<span class="line"><span>│ 60 FPS       │ 16.67ms       │ ~14ms   │ 正常          │</span></span>
<span class="line"><span>│ 120 FPS (ProMotion) │ 8.33ms  │ ~6ms   │ 超高刷新率    │</span></span>
<span class="line"><span>│ 30 FPS       │ 33.33ms       │ ~28ms   │ 卡顿开始       │</span></span>
<span class="line"><span>│ &lt; 30 FPS     │ &gt; 33ms        │ &gt; 28ms  │ 明显卡顿       │</span></span>
<span class="line"><span>└──────────────┴───────────────┴─────────┴──────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>掉帧原因分析：</span></span>
<span class="line"><span>┌───────────┬─────────────────────┬──────────────────────┐</span></span>
<span class="line"><span>│ 原因       │  表现形式            │  检测方法            │</span></span>
<span class="line"><span>├───────────┼─────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 主线程阻塞  │ FPS 突降             │ Instruments Timeline  │</span></span>
<span class="line"><span>│ 离屏渲染    │ 滚动卡顿            │ CA Color Offscreen     │</span></span>
<span class="line"><span>│ 频繁布局    │ 内容跳动            │ Layout Analyzer        │</span></span>
<span class="line"><span>│ 图片加载    │ 加载时卡顿           │ Network Monitor        │</span></span>
<span class="line"><span>│ 字体渲染    │ 文本加载闪烁         │ Core Text 分析         │</span></span>
<span class="line"><span>│ 网络请求    │ 网络请求时卡顿       │ Network Monitor        │</span></span>
<span class="line"><span>│ 磁盘IO      │ 启动时卡顿          │ File System Monitor    │</span></span>
<span class="line"><span>│ GPU 过载    │ 动画卡顿            │ Metal GPU Trace       │</span></span>
<span class="line"><span>└───────────┴─────────────────────┴──────────────────────┘</span></span>
<span class="line"><span>*/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 检测当前帧率（自定义）</span></span>
<span class="line"><span>class FrameRateMonitor {</span></span>
<span class="line"><span>    private var frameCount = 0</span></span>
<span class="line"><span>    private var lastCheckTime = CFAbsoluteTimeGetCurrent()</span></span>
<span class="line"><span>    private var displayLink: CADisplayLink?</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    func startMonitoring() {</span></span>
<span class="line"><span>        displayLink = CADisplayLink(target: self, selector: #selector(updateFrame))</span></span>
<span class="line"><span>        displayLink?.add(to: .main, forMode: .common)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    @objc func updateFrame() {</span></span>
<span class="line"><span>        frameCount += 1</span></span>
<span class="line"><span>        let now = CFAbsoluteTimeGetCurrent()</span></span>
<span class="line"><span>        if now - lastCheckTime &gt;= 1.0 {</span></span>
<span class="line"><span>            print(&quot;FPS: \\(frameCount)&quot;)  // 每秒输出一次</span></span>
<span class="line"><span>            frameCount = 0</span></span>
<span class="line"><span>            lastCheckTime = now</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 检测掉帧（Instruments Timeline）：</span></span>
<span class="line"><span>// 1. Instruments → Time Profiler</span></span>
<span class="line"><span>// 2. 过滤主线程（pthread 0）</span></span>
<span class="line"><span>// 3. 查看红色竖线（丢帧）</span></span>
<span class="line"><span>// 4. 点击红色竖线查看调用栈</span></span></code></pre></div><h3 id="_4-2-渲染性能分析工具" tabindex="-1">4.2 渲染性能分析工具 <a class="header-anchor" href="#_4-2-渲染性能分析工具" aria-label="Permalink to &quot;4.2 渲染性能分析工具&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              UI 性能分析工具链                           │</span></span>
<span class="line"><span>├───────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  1. Instruments → Core Animation                      │</span></span>
<span class="line"><span>│     • Color Off-screen Rendered (离屏渲染检测)        │</span></span>
<span class="line"><span>│     • Color Hits Spills and Misses (缓存命中)         │</span></span>
<span class="line"><span>│     • Color Blended Layers (混合层检测)               │</span></span>
<span class="line"><span>│     • Color Abandoned Layers (废弃图层)               │</span></span>
<span class="line"><span>│     • Color Instanced Draw Calls (实例化绘制)         │</span></span>
<span class="line"><span>│     • GPU Profile (GPU 性能)                          │</span></span>
<span class="line"><span>│     • Metal GPU Frame (Metal 帧分析)                  │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  2. Instruments → Time Profiler                       │</span></span>
<span class="line"><span>│     • 主线程耗时分析                                  │</span></span>
<span class="line"><span>│     • 掉帧位置定位                                    │</span></span>
<span class="line"><span>│     • 调用栈分析                                      │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  3. Instruments → Alloc / Leaks                       │</span></span>
<span class="line"><span>│     • 内存分配热点                                    │</span></span>
<span class="line"><span>│     • 内存泄漏检测                                    │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  4. Instruments → Metal System Trace                  │</span></span>
<span class="line"><span>│     • CPU/GPU 同步分析                                │</span></span>
<span class="line"><span>│     • Metal API 调用分析                              │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  5. 命令行工具：                                      │</span></span>
<span class="line"><span>│     • xcrun metal --analyze (Metal 代码分析)          │</span></span>
<span class="line"><span>│     • xcrun metal --check (Metal 检查)                │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  6. 自定义检测：                                      │</span></span>
<span class="line"><span>│     • CADisplayLink (帧率检测)                        │</span></span>
<span class="line"><span>│     • UIGraphicsBeginImageContext (离屏检测)         │</span></span>
<span class="line"><span>│     • 自定义 FPS 计数器                               │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_5-布局引擎源码级分析" tabindex="-1">5. 布局引擎源码级分析 <a class="header-anchor" href="#_5-布局引擎源码级分析" aria-label="Permalink to &quot;5. 布局引擎源码级分析&quot;">​</a></h2><h3 id="_5-1-nslayoutconstraint-求解过程" tabindex="-1">5.1 NSLayoutConstraint 求解过程 <a class="header-anchor" href="#_5-1-nslayoutconstraint-求解过程" aria-label="Permalink to &quot;5.1 NSLayoutConstraint 求解过程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AutoLayout 约束求解算法（源码级）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. 收集所有 NSLayoutConstraint                            │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│  │ NSLayoutConstraint[]                   │                 │</span></span>
<span class="line"><span>│  │ • viewA.top == viewB.top + 20         │                 │</span></span>
<span class="line"><span>│  │ • viewA.leading == viewB.leading + 10 │                 │</span></span>
<span class="line"><span>│  │ • viewA.width == viewB.width * 0.5    │                 │</span></span>
<span class="line"><span>│  └───────────────────────────────────────┘                 │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  2. 构建约束图（Constraint Graph）                           │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│  │  节点：所有视图                         │                 │</span></span>
<span class="line"><span>│  │  边：约束（NSLayoutConstraint）        │                 │</span></span>
<span class="line"><span>│  │  • 方向性：leading/width 等属性方向     │                 │</span></span>
<span class="line"><span>│  │  • 权重：优先级（NSLayoutPriority）     │                 │</span></span>
<span class="line"><span>│  └───────────────────────────────────────┘                 │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  3. 求解线性方程组                                             │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│  │  NSLayoutConstraint 求解：             │                 │</span></span>
<span class="line"><span>│  │  • AX = B （矩阵方程）                 │                 │</span></span>
<span class="line"><span>│  │  • A = 约束矩阵（系数）                │                 │</span></span>
<span class="line"><span>│  │  • X = 变量矩阵（最终 frame）          │                 │</span></span>
<span class="line"><span>│  │  • B = 常量矩阵（常量偏移）            │                 │</span></span>
<span class="line"><span>│  │                                       │                 │</span></span>
<span class="line"><span>│  │  求解算法：高斯消元法（Gaussian Elimination）│                 │</span></span>
<span class="line"><span>│  │  • 时间复杂度：O(n³)                  │                 │</span></span>
<span class="line"><span>│  │  • n = 约束数量                        │                 │</span></span>
<span class="line"><span>│  └───────────────────────────────────────┘                 │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  4. 处理优先级（优先级低的约束让步）                          │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│  │  相同优先级：                           │                 │</span></span>
<span class="line"><span>│  │  • 先添加的约束优先                      │                 │</span></span>
<span class="line"><span>│  │  • 冲突时系统随机选 winner              │                 │</span></span>
<span class="line"><span>│  │                                       │                 │</span></span>
<span class="line"><span>│  │  不同优先级：                           │                 │</span></span>
<span class="line"><span>│  │  • 高优先级约束优先满足                  │                 │</span></span>
<span class="line"><span>│  │  • 低优先级约束在冲突时让步              │                 │</span></span>
<span class="line"><span>│  └───────────────────────────────────────┘                 │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  5. 输出最终 frame                                            │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│  │  每个 NSLayoutConstraint             │                 │</span></span>
<span class="line"><span>│  │  → NSLayoutConstraint.Engine 求解     │                 │</span></span>
<span class="line"><span>│  │  → 输出 NSLayoutConstraint.Result     │                 │</span></span>
<span class="line"><span>│  │  → setNeedsLayout → layoutSubviews    │                 │</span></span>
<span class="line"><span>│  └───────────────────────────────────────┘                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-布局引擎源码关键方法" tabindex="-1">5.2 布局引擎源码关键方法 <a class="header-anchor" href="#_5-2-布局引擎源码关键方法" aria-label="Permalink to &quot;5.2 布局引擎源码关键方法&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// UIKit 内部布局流程（简化版）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 标记需要布局</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)setNeedsLayout {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">_needsLayout) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        _needsLayout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> YES</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> setLayoutRootNodeIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> setNeedsDisplay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 触发重绘</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 触发布局</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)layoutIfNeeded {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> layoutIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> layoutSublayersOfLayer:self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.layer];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 布局传递（双遍算法）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// First Pass: 自上而下确定约束</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)updateConstraintsIfNeeded {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (UIView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">subview </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.subviews) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [subview </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">updateConstraintsIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> updateConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 子类可重写</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Second Pass: 自下而上确定尺寸</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)layoutSubviews {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (UIView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">subview </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.subviews) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [subview </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">layoutSubviews</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> layoutSubviews</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 子类可重写</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 绘制</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)drawRect:(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CGRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)rect {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ⚠️ 不推荐重写！</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 现代方案：CoreGraphics / CAShapeLayer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. 提交到渲染服务器</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)layerCommit {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CATransaction</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> flush</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [CAContext </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_6-ui-性能优化全攻略" tabindex="-1">6. UI 性能优化全攻略 <a class="header-anchor" href="#_6-ui-性能优化全攻略" aria-label="Permalink to &quot;6. UI 性能优化全攻略&quot;">​</a></h2><h3 id="_6-1-优化策略优先级表" tabindex="-1">6.1 优化策略优先级表 <a class="header-anchor" href="#_6-1-优化策略优先级表" aria-label="Permalink to &quot;6.1 优化策略优先级表&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌────────┬────────────────────────┬─────────────┬──────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 优先级  │  优化策略              │  效果       │  复杂度      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├────────┼────────────────────────┼─────────────┼──────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐⭐  │ 避免离屏渲染           │ 5-10x      │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐⭐  │ 减少约束数量 (≤8)      │ 3-5x       │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐⭐  │ 正确的 Cell 复用        │ 3-5x       │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐⭐  │ 异步图片加载           │ 2-3x       │ ⭐⭐         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐⭐  │ 避免 draw(_:)          │ 2-3x       │ ⭐⭐         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐   │ 使用 UIGraphicsImageRenderer│ 2x     │ ⭐⭐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐   │ 使用 CAShapeLayer      │ 3-5x       │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐   │ 预渲染静态内容          │ 2x         │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐⭐   │ 减少 subviews 数量     │ 2x         │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐    │ 使用 autoresizingMask   │ 5-10x      │ ⭐⭐⭐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ ⭐    │ 简化约束层级            │ 2x         │ ⭐           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────┴────────────────────────┴─────────────┴──────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优化实战：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 使用 UIGraphicsImageRenderer（iOS 10+）替代 UIGraphicsBeginImageContext</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> renderViewAsImage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIImage {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> renderer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIGraphicsImageRenderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">bounds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">format</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: traitCollection))</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> renderer.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">image</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ctx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        drawHierarchy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">afterScreenUpdates</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 减少 subviews 数量</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 太多 subviews 会导致 hitTest 和布局性能下降</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BadView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">UIView </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ❌ 50 个子视图</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> labels </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">..&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">UILabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 合并 subviews</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> GoodView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">UIView </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 用一个自定义视图代替 50 个 UILabel</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> customView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CustomContentView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 使用 Content Size Category 缓存</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// iOS 11+ 自动缓存 IntrinsicContentSize</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 避免在 layoutSubviews 中重复计算</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> intrinsicContentSize: CGSize {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // iOS 11+ 自动缓存</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CGSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: UIView.noIntrinsicMetric, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: UIView.noIntrinsicMetric)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 减少 layer 属性访问（频繁访问触发隐式同步）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 在循环中频繁访问 layer 属性</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> _</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> in</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">..&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> width </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layer.bounds.width  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 触发隐式同步</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> height </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layer.bounds.height</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 缓存值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bounds </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layer.bounds</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> width </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bounds.width</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> height </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bounds.height</span></span></code></pre></div><hr><h2 id="_7-accessibility-无障碍" tabindex="-1">7. Accessibility 无障碍 <a class="header-anchor" href="#_7-accessibility-无障碍" aria-label="Permalink to &quot;7. Accessibility 无障碍&quot;">​</a></h2><h3 id="_7-1-accessibility-体系" tabindex="-1">7.1 Accessibility 体系 <a class="header-anchor" href="#_7-1-accessibility-体系" aria-label="Permalink to &quot;7.1 Accessibility 体系&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Accessibility（无障碍）：为视力/听力/运动障碍用户提供替代交互方式。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ Accessibility 核心体系              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  VoiceOver（屏幕阅读器）             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 朗读当前焦点元素                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ 手势导航（左/右滑动）             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ 双指滚动（快速滚动）              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  关键属性：                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ isAccessibilityElement          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityLabel             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityHint              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityValue             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityTraits            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityFrame             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityActivationPoint   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityFrameInContainerView│</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ accessibilityLanguage           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  UIAccessibility 协议方法：         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityPerformEscape     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ├─ accessibilityFocus()           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─ accessibilityScroll()           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 无障碍最佳实践：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 为每个交互元素设置 label</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">button.accessibilityLabel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;关闭&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">button.accessibilityHint </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;点击关闭当前页面&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 组合视图设为无障碍元素</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stackView.isAccessibilityElement </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 不朗读子视图</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stackView.accessibilityLabel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;搜索结果&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stackView.accessibilityElements </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [label1, label2, label3]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 使用 accessibilityTraits 描述元素类型</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">imageView.accessibilityTraits </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">image</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">button.accessibilityTraits </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [.button]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">toggle.accessibilityTraits </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [.button, .selected]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">textFiled.accessibilityTraits </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [.editable]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 自定义 VoiceOver 朗读内容</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> accessibilityLabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data: Item) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data.isImage {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;图片：</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\\(data.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">description</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\\(data.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">title</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \\(data.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">description</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. 动态内容更新通知 VoiceOver</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> observeValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">forKeyPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> keyPath: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">of</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> object: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Any</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">change</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [NSKeyValueChangeKey : </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Any</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">UnsafeMutableRawPointer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> keyPath </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;count&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        UIAccessibility.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">post</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">notification</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .layoutChanged, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">argument</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. 动态岛/灵动岛适配</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// iOS 16+ 使用 Dynamic Island API</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 确保 VoiceOver 能正确朗读动态岛内容</span></span></code></pre></div><hr><h2 id="_8-面试题汇总" tabindex="-1">8. 面试题汇总 <a class="header-anchor" href="#_8-面试题汇总" aria-label="Permalink to &quot;8. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: UIKit 渲染管线的工作流程？</strong></p><p><strong>答</strong>：</p><ol><li><strong>布局阶段</strong>：setNeedsLayout → layoutSubviews → 递归布局子视图</li><li><strong>绘制阶段</strong>：draw(_😃 → CoreGraphics 渲染到 backingStore</li><li><strong>提交阶段</strong>：CATransaction.commit → CADisplayLink → GPU 合成 → VSync</li></ol><p><strong>Q2: 离屏渲染的产生原因和优化方案？</strong></p><p><strong>答</strong>：</p><ul><li><strong>产生</strong>：GPU 无法在当前帧处理，需要创建新缓冲区</li><li><strong>触发</strong>：masksToBounds、cornerRadius（非 CAShapeLayer）、shadow（无 shadowPath）、模糊效果</li><li><strong>检测</strong>：Instruments → Core Animation → Color Off-screen Rendered（红色）</li><li><strong>优化</strong>：CAShapeLayer mask 替代裁剪、shadowPath、shouldRasterize 按需启用、预渲染</li></ul><p><strong>Q3: 离屏渲染性能影响？</strong></p><p><strong>答</strong>：</p><ul><li>内存带宽增加 2x（读写两个缓冲区）</li><li>GPU 额外合成开销</li><li>CPU 创建/释放缓冲区开销</li><li>总体性能下降 5-10 倍</li></ul><p><strong>Q4: AutoLayout 约束求解原理？</strong></p><p><strong>答</strong>：</p><ol><li>收集所有 NSLayoutConstraint</li><li>构建约束图（视图为节点，约束为边）</li><li>求解线性方程组（高斯消元法）</li><li>处理优先级（高优先级优先满足）</li><li>双遍算法：自上而下确定约束 → 自下而上确定尺寸</li><li>输出 frame → layoutSubviews</li></ol><p><strong>Q5: StackView 的工作原理？</strong></p><p><strong>答</strong>：</p><ul><li>内部通过自动创建 NSLayoutConstraint 实现</li><li>遍历 arrangedSubviews 计算尺寸并分配</li><li>distribution 模式控制空间分配</li><li>子视图上设置 leading/trailing 会被覆盖</li></ul><p><strong>Q6: 如何检测和优化 UI 性能？</strong></p><p><strong>答</strong>：</p><ul><li><strong>检测</strong>：Instruments（Core Animation/Time Profiler/Metal GPU Trace）</li><li><strong>优化</strong>：避免离屏渲染、减少约束、正确 Cell 复用、异步图片加载、减少 draw()、预渲染静态内容</li></ul><p><strong>Q7: Core Animation 合成机制？</strong></p><p><strong>答</strong>：</p><ul><li>Core Animation 通过 Mach IPC 将渲染命令发送给 Render Server 守护进程</li><li>Render Server 在独立进程运行，崩溃不影响 App</li><li>GPU 执行合成指令（Metal/OpenGL ES）</li><li>VSync 信号同步输出到屏幕</li></ul><hr><h2 id="_9-参考资源" tabindex="-1">9. 参考资源 <a class="header-anchor" href="#_9-参考资源" aria-label="Permalink to &quot;9. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/quartzcore/core_animation" target="_blank" rel="noreferrer">Apple: Core Animation Programming Guide</a></li><li><a href="https://developer.apple.com/documentation/uikit" target="_blank" rel="noreferrer">Apple: UIKit Class Reference</a></li><li><a href="https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/" target="_blank" rel="noreferrer">Apple: Auto Layout Guide</a></li><li><a href="https://developer.apple.com/accessibility/" target="_blank" rel="noreferrer">Apple: Accessibility Programming Guide</a></li><li><a href="https://nshipster.com/uiview" target="_blank" rel="noreferrer">NSHipster: UIView</a></li><li><a href="https://nshipster.com/caanimation" target="_blank" rel="noreferrer">NSHipster: CAAnimation</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2018/226" target="_blank" rel="noreferrer">WWDC 2018: Advanced Auto Layout Techniques</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2019/219" target="_blank" rel="noreferrer">WWDC 2019: What&#39;s New in UIKit</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2020/10115" target="_blank" rel="noreferrer">WWDC 2020: Build Custom Collection Layouts</a></li><li><a href="https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreAnimation_guide/" target="_blank" rel="noreferrer">Apple: Core Animation Internals</a></li></ul>`,70)])])}const y=a(l,[["render",h]]);export{c as __pageData,y as default};
