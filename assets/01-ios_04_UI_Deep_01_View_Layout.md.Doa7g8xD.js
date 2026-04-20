import{_ as i,o as a,c as n,ae as p}from"./chunks/framework.Czhw_PXq.js";const g=JSON.parse('{"title":"01 - View 基础与布局引擎","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/04_UI_Deep/01_View_Layout.md","filePath":"01-ios/04_UI_Deep/01_View_Layout.md"}'),l={name:"01-ios/04_UI_Deep/01_View_Layout.md"};function h(t,s,e,k,r,d){return a(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="_01-view-基础与布局引擎" tabindex="-1">01 - View 基础与布局引擎 <a class="header-anchor" href="#_01-view-基础与布局引擎" aria-label="Permalink to &quot;01 - View 基础与布局引擎&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-uiview-底层原理">UIView 底层原理</a></li><li><a href="#2-图层系统core-animation">图层系统（Core Animation）</a></li><li><a href="#3-视图层次与渲染管线">视图层次与渲染管线</a></li><li><a href="#4-布局引擎详解">布局引擎详解</a></li><li><a href="#5-autolayout-机制">AutoLayout 机制</a></li><li><a href="#6-约束优先级详解">约束优先级详解</a></li><li><a href="#7-stackview-原理">StackView 原理</a></li><li><a href="#8-snapkit-声明式布局">SnapticK 声明式布局</a></li><li><a href="#9-布局性能分析">布局性能分析</a></li><li><a href="#10-面试考点汇总">面试考点汇总</a></li></ol><hr><h2 id="_1-uiview-底层原理" tabindex="-1">1. UIView 底层原理 <a class="header-anchor" href="#_1-uiview-底层原理" aria-label="Permalink to &quot;1. UIView 底层原理&quot;">​</a></h2><h3 id="_1-1-uiview-的内存布局" tabindex="-1">1.1 UIView 的内存布局 <a class="header-anchor" href="#_1-1-uiview-的内存布局" aria-label="Permalink to &quot;1.1 UIView 的内存布局&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>UIView 对象内存布局（64-bit）：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ NSObject isa 指针（指向 UIView 的 Class 对象）       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ UIView 私有关联对象（weak reference list 等）         │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ CALayer *layer（强引用，UIView 的 layer 代理）       │</span></span>
<span class="line"><span>│ view.layer == layer 为 true（关联对象代理模式）       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ CGRect _frame（布局框架，等价于 layer.frame 但不直接 │</span></span>
<span class="line"><span>│ 关联，UIView 通过 setNeedsLayout 触发布局更新）       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ CGRect _bounds（局部坐标系）                         │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ CGPoint _center（中心点）                            │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ CGFloat _transform（仿射变换矩阵）                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ CGFloat _alpha, _opacity, _transform、_contentScale │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ NSString *_restorationIdentifier                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ UIView 私有 ivars（系统内部管理，不暴露）            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键结论：</span></span>
<span class="line"><span>- UIView 只是 CALayer 的代理层，本身不存储像素数据</span></span>
<span class="line"><span>- UIView 的渲染完全委托给 layer（CALayer）</span></span>
<span class="line"><span>- UIView.frame 与 layer.frame 通过关联属性同步</span></span></code></pre></div><h3 id="_1-2-uiview-vs-calayer-的本质区别" tabindex="-1">1.2 UIView vs CALayer 的本质区别 <a class="header-anchor" href="#_1-2-uiview-vs-calayer-的本质区别" aria-label="Permalink to &quot;1.2 UIView vs CALayer 的本质区别&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────┬──────────────────┬─────────────────────┐</span></span>
<span class="line"><span>│    维度       │     UIView       │    CALayer          │</span></span>
<span class="line"><span>├──────────────┼──────────────────┼─────────────────────┤</span></span>
<span class="line"><span>│ 继承关系     │ UIResponder      │ NSObject            │</span></span>
<span class="line"><span>│ 核心职责     │ 事件响应+渲染代理 │ 像素渲染            │</span></span>
<span class="line"><span>│ 像素存储     │ ❌ 不存储         │ ✅  backingStore    │</span></span>
<span class="line"><span>│ 事件处理     │ ✅                │ ❌                  │</span></span>
<span class="line"><span>│ 层级管理     │ ✅ 通过 superview │ ✅ 通过 superlayer  │</span></span>
<span class="line"><span>│ 动画支持     │ ✅ 隐式动画代理   │ ✅ 隐式动画          │</span></span>
<span class="line"><span>│ 创建方式     │ [[UIView alloc]  │ [[CALayer alloc]    │</span></span>
<span class="line"><span>│              │ initWithFrame:]  │                     │</span></span>
<span class="line"><span>├──────────────┼──────────────────┼─────────────────────┤</span></span>
<span class="line"><span>│ 性能         │ 有 responder 链开销 │ 纯渲染，更轻量     │</span></span>
<span class="line"><span>│ 适用场景     │ UI 组件           │ 自定义渲染/粒子      │</span></span>
<span class="line"><span>└──────────────┴──────────────────┴─────────────────────┘</span></span></code></pre></div><h3 id="_1-3-uiview-的生命周期方法" tabindex="-1">1.3 UIView 的生命周期方法 <a class="header-anchor" href="#_1-3-uiview-的生命周期方法" aria-label="Permalink to &quot;1.3 UIView 的生命周期方法&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// UIView 生命周期完整流程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">UIView </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 初始化（代码创建时调用）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">frame</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: CGRect) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">frame</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: frame)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1. init(frame:) - 内存分配完成&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ 适合：设置基础属性、初始化数据</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    required</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> init?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">coder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: NSCoder) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">coder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: coder)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1. init(coder:) - XIB/Storyboard 加载&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 布局前 - 第一次</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> awakeFromNib</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">awakeFromNib</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2. awakeFromNib - XIB/Storyboard 加载后&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ 适合：XIB 组件的初始化（只在 XIB 时调用）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 布局前 - 尺寸已确定</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> prepareForReuse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">prepareForReuse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;3. prepareForReuse - Cell 复用准备&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ 适合：TableViewCell/CollectionViewCell 的复用清理</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 添加超视图后</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> didAddSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> subview: UIView) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">didAddSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(subview)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;4. didAddSubview - 子视图已添加&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 布局前 - 可修改 frame</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> willMove</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toSuperview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newSuperview: UIView</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">willMove</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">toSuperview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: newSuperview)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;5. willMove - 即将移动&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 布局前 - 可修改 frame</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> layoutSubviews</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">layoutSubviews</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;6. layoutSubviews - 布局完成（可重写）&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ 适合：调整子视图的 frame</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 注意：可能被多次调用，需做 diff</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 7. 首次布局完成</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> draw</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rect: CGRect) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">draw</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(rect)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;7. draw - 绘制（CoreGraphics）&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ⚠️ 不推荐重写，使用 CoreGraphics 绘制开销大</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 现代方案：CAShapeLayer + UIBezierPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 8. 布局完成</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> layoutIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">layoutIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;8. layoutIfNeeded - 布局完成（触发）&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 9. 设置动画约束</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> updateConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">updateConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;9. updateConstraints - 约束更新&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ 适合：修改约束，但不常用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_2-图层系统-core-animation" tabindex="-1">2. 图层系统（Core Animation） <a class="header-anchor" href="#_2-图层系统-core-animation" aria-label="Permalink to &quot;2. 图层系统（Core Animation）&quot;">​</a></h2><h3 id="_2-1-calayer-架构" tabindex="-1">2.1 CALayer 架构 <a class="header-anchor" href="#_2-1-calayer-架构" aria-label="Permalink to &quot;2.1 CALayer 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Core Animation 图层树：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    CALayer (根图层)                 │</span></span>
<span class="line"><span>│                  （window的layer）                  │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│           superlayer（父图层）                      │</span></span>
<span class="line"><span>│           一个图层有且只有一个 superlayer            │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│           sublayers（子图层数组）                    │</span></span>
<span class="line"><span>│           可嵌套任意层，形成图层树                   │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│           渲染相关属性：                           │</span></span>
<span class="line"><span>│           • backgroundColor                      │</span></span>
<span class="line"><span>│           • borderWidth / borderColor            │</span></span>
<span class="line"><span>│           • cornerRadius / masksToBounds          │</span></span>
<span class="line"><span>│           • shadow* / shadowPath                │</span></span>
<span class="line"><span>│           • contents（CGImage）                  │</span></span>
<span class="line"><span>│           • contentsScale（@2x/@3x 适配）         │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│           变换相关属性：                           │</span></span>
<span class="line"><span>│           • transform（CATransform3D）           │</span></span>
<span class="line"><span>│           • sublayerTransform                      │</span></span>
<span class="line"><span>│           • anchorPoint / position / bounds       │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CALayer 渲染流程：</span></span>
<span class="line"><span>┌───────────┐    ┌─────────────┐    ┌───────────────┐    ┌──────────────┐</span></span>
<span class="line"><span>│ CALayer   │───▶│ CATransaction│──▶│ 提交到CADisplay │──▶│ CADisplayLink │</span></span>
<span class="line"><span>│ (创建/更新)│   │ (事务管理)   │    │ (60fps/120fps) │    │ (帧同步)     │</span></span>
<span class="line"><span>└───────────┘    └─────────────┘    └───────────────┘    └──────────────┘</span></span>
<span class="line"><span>     │                  │                    │                   │</span></span>
<span class="line"><span>     ▼                  ▼                    ▼                   ▼</span></span>
<span class="line"><span>  属性设置          批处理/事务           渲染指令            vsync 信号</span></span></code></pre></div><h3 id="_2-2-隐式动画机制" tabindex="-1">2.2 隐式动画机制 <a class="header-anchor" href="#_2-2-隐式动画机制" aria-label="Permalink to &quot;2.2 隐式动画机制&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Core Animation 的默认隐式动画</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@objc</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyLayer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">CALayer </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 触发隐式动画的关键：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 修改可动画的属性 → 自动添加默认 CATransition</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 可动画的属性：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ bounds / position / frame（frame 会触发 bounds+position）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ opacity / alpha</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ backgroundColor / borderColor</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ cornerRadius</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ shadow*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ transform</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ✅ contents</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 不可动画的属性：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ❌ sublayers（需要手动添加/移除动画）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ❌ masksToBounds</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ❌ borderWidth</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ❌ 需要设置 actionForKey 禁用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;默认动画时长：</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\\(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">action</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forKey</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bounds&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">duration</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;N/A&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    required</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> init?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">coder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: NSCoder) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        fatalError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;init(coder:) has not been implemented&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 重写 action(forKey:) 控制动画行为</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">forKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CAAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;backgroundColor&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 自定义淡入动画</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> anim </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CABasicAnimation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">keyPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;backgroundColor&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            anim.duration </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            anim.fromValue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIColor.white.cgColor</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            anim.toValue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIColor.red.cgColor</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> anim</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bounds&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 禁用 bounds 动画</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        default:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 使用默认行为</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: event)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 动画类型对比：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CABasicAnimation：单一属性变化（位置/大小/颜色）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAKeyframeAnimation：关键帧路径动画</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CATransition：过渡动画（fade/slide/rotate/ripple 等）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAAnimationGroup：多动画组合</span></span></code></pre></div><h3 id="_2-3-图层类型速查" tabindex="-1">2.3 图层类型速查 <a class="header-anchor" href="#_2-3-图层类型速查" aria-label="Permalink to &quot;2.3 图层类型速查&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 常用 CALayer 子类：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAScrollLayer    — 滚动支持</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CATiledLayer     — 平铺渲染（大图片/地图）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CALayer          — 基础层（自定义渲染）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAGradientLayer  — 渐变背景（性能比 UIImageView 好）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAShapeLayer     — 矢量形状（贝塞尔路径）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAGlassLayer     — iOS 15+ 毛玻璃效果</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAEmitterLayer   — 粒子系统</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAReplicatorLayer — 复制图层（涟漪效果/频谱）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CAEAGLLayer      — OpenGL ES 渲染</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CVOpenGLESTexture — 视频帧渲染</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用建议：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - 渐变：用 CAGradientLayer（GPU 渲染，比 CG 快 10x+）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - 描边/圆角：用 CAShapeLayer（避免离屏渲染）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - 动画：用 Core Animation（GPU 合成，不阻塞主线程）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// - 自定义图形：用 UIGraphicsImageRenderer（离屏渲染）</span></span></code></pre></div><hr><h2 id="_3-视图层次与渲染管线" tabindex="-1">3. 视图层次与渲染管线 <a class="header-anchor" href="#_3-视图层次与渲染管线" aria-label="Permalink to &quot;3. 视图层次与渲染管线&quot;">​</a></h2><h3 id="_3-1-渲染管线全链路" tabindex="-1">3.1 渲染管线全链路 <a class="header-anchor" href="#_3-1-渲染管线全链路" aria-label="Permalink to &quot;3.1 渲染管线全链路&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 渲染管线（完整流程）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 第 1 阶段：布局（Layout Phase）                              │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. setNeedsLayout() 标记需要布局                            │</span></span>
<span class="line"><span>│  2. 等待下一个 runloop 的 update 事件                         │</span></span>
<span class="line"><span>│  3. 调用 layoutIfNeeded() / layoutSubviews()                  │</span></span>
<span class="line"><span>│  4. 递归调用 subviews.layoutSubviews()                        │</span></span>
<span class="line"><span>│  5. 计算每个 view 的 frame/bounds（AutoLayout 求解）           │</span></span>
<span class="line"><span>│  6. 将 frame 同步到 layer.frame                               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  触发方式：                                                   │</span></span>
<span class="line"><span>│  • setNeedsLayout() — 标记，延迟到下一次 runloop               │</span></span>
<span class="line"><span>│  • layoutIfNeeded() — 强制立即执行                            │</span></span>
<span class="line"><span>│  • UIView.animate() — 隐式触发                               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  耗时：通常 16ms 以内（60fps），超时会掉帧                     │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  第 2 阶段：绘制（Draw Phase）                               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. drawHierarchy(in:) / draw(_:)                           │</span></span>
<span class="line"><span>│  2. 递归调用 subviews 的 draw                                 │</span></span>
<span class="line"><span>│  3. 每个 view 的 layer 的 draw                                │</span></span>
<span class="line"><span>│  4. CGImage 绘制到 backingStore（位图）                       │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  触发方式：                                                   │</span></span>
<span class="line"><span>│  • 需要 content 为 nil（自动绘制）                            │</span></span>
<span class="line"><span>│  • 手动重写 draw(_:) 方法（不推荐）                           │</span></span>
<span class="line"><span>│  • UIGraphicsBeginImageContext()                            │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  ⚠️ 注意：draw 阶段在主线程执行，非常耗时！                    │</span></span>
<span class="line"><span>│  ✅ 替代方案：使用 CAShapeLayer / 预渲染图片                  │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  第 3 阶段：提交（Commit Phase）                             │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. 将所有 layer 合成指令提交到 CADisplayLink                  │</span></span>
<span class="line"><span>│  2. CATransaction.commit() — 批量提交                        │</span></span>
<span class="line"><span>│  3. 等待 VSync 信号（60fps/120fps）                          │</span></span>
<span class="line"><span>│  4. GPU 执行合成指令（离屏渲染/混合/裁切）                     │</span></span>
<span class="line"><span>│  5. 输出到屏幕                                                │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  💡 关键点：                                                  │</span></span>
<span class="line"><span>│  • 合成阶段在 GPU 执行，不阻塞主线程                          │</span></span>
<span class="line"><span>│  • 离屏渲染会在 CPU 创建临时缓冲区，性能下降 5-10x             │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>完整时序图：</span></span>
<span class="line"><span>Frame 1 (0ms)     Frame 2 (16.67ms)   Frame 3 (33.33ms)</span></span>
<span class="line"><span>┌────────┐        ┌────────┐           ┌────────┐</span></span>
<span class="line"><span>│布局      │──▶    │布局      │──▶       │布局      │</span></span>
<span class="line"><span>│绘制      │──▶    │绘制      │──▶       │绘制      │</span></span>
<span class="line"><span>│提交      │──▶    │提交      │──▶       │提交      │</span></span>
<span class="line"><span>└────────┘        └────────┘           └────────┘</span></span>
<span class="line"><span>                     ▲                      ▲</span></span>
<span class="line"><span>                  VSync（GPU 合成）       VSync（GPU 合成）</span></span></code></pre></div><h3 id="_3-2-离屏渲染-off-screen-rendering-深度分析" tabindex="-1">3.2 离屏渲染（Off-Screen Rendering）深度分析 <a class="header-anchor" href="#_3-2-离屏渲染-off-screen-rendering-深度分析" aria-label="Permalink to &quot;3.2 离屏渲染（Off-Screen Rendering）深度分析&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ⚠️ 离屏渲染 = 性能杀手</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 原理：GPU 无法在当前渲染帧处理，需要创建新的缓冲区</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 触发离屏渲染的情况：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. layer.masksToBounds = true / clipsToBounds = true</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. layer.cornerRadius &gt; 0（且未使用 CAShapeLayer）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. layer.shadow* 属性（阴影）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. layer.shouldRasterize = true</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. CGPath 复杂路径（CAShapeLayer）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. 模糊效果 / 混合模式</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 检测离屏渲染：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. Instruments → Core Animation → Color Off-screen Rendered</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 红色 = 离屏渲染，绿色 = 正常</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优化方案对比表：</span></span></code></pre></div><table tabindex="0"><thead><tr><th>问题</th><th>原因</th><th>传统方案</th><th>现代方案</th><th>性能提升</th></tr></thead><tbody><tr><td>圆角</td><td><code>masksToBounds=true</code></td><td>用 CAShapeLayer 替代</td><td>使用 <code>layer.mask</code> + UIBezierPath</td><td>5-10x</td></tr><tr><td>阴影</td><td>shadowPath 未设置</td><td>预渲染 shadowImage</td><td>设置 <code>shadowPath</code> 为 CGPath</td><td>3-5x</td></tr><tr><td>圆角+阴影</td><td>两者同时触发</td><td>分别优化</td><td>用 CAShapeLayer + shadowPath</td><td>5-8x</td></tr><tr><td>裁剪圆角</td><td>clipsToBounds</td><td>使用 <code>layer.mask</code></td><td>使用 <code>UIGraphicsImageRenderer</code> 预渲染</td><td>3-5x</td></tr></tbody></table><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 最佳实践：圆角优化</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 方法 1：使用 CAShapeLayer（推荐 ✅✅）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setCornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> radius: CGFloat) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.cornerRadius </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> radius</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAShapeLayer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maskPath </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: radius)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        (layer.mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CAShapeLayer)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maskPath.path</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 方法 2：使用 UIBezierPath（适合动态圆角）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setCornerRadiusWithMask</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> radius: CGFloat) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roundedRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cornerRadius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: radius)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maskLayer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CAShapeLayer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        maskLayer.path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.mask </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maskLayer</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 方法 3：预渲染为图片（适合固定圆角 + 复杂背景）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> preRenderAsImage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UIImage {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> renderer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIGraphicsImageRenderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">bounds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> renderer.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">image</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ctx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            drawHierarchy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">afterScreenUpdates</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 最佳实践：阴影优化</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setShadow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">offset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: CGSize, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: UIColor, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">opacity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Float</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">radius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: CGFloat) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOffset </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> offset</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> color.cgColor</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowOpacity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> opacity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowRadius </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> radius</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ⚠️ 关键：设置 shadowPath，避免离屏渲染！</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIBezierPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bounds.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">insetBy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">dx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">dy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        layer.shadowPath </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path.cgPath</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_4-布局引擎详解" tabindex="-1">4. 布局引擎详解 <a class="header-anchor" href="#_4-布局引擎详解" aria-label="Permalink to &quot;4. 布局引擎详解&quot;">​</a></h2><h3 id="_4-1-布局系统架构" tabindex="-1">4.1 布局系统架构 <a class="header-anchor" href="#_4-1-布局系统架构" aria-label="Permalink to &quot;4.1 布局系统架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌───────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    iOS 布局引擎架构                             │</span></span>
<span class="line"><span>├───────────────┐   ┌──────────────┐   ┌────────────────────┐   │</span></span>
<span class="line"><span>│   UIView      │   │ NSLayoutConstraint │   │ NSLayoutConstraint │   │</span></span>
<span class="line"><span>│   (框架)      │──▶│   约束求解器    │──▶│   AutoLayout引擎  │   │</span></span>
<span class="line"><span>│   _frame      │   │ (Engine)       │   │ (布局传递)        │   │</span></span>
<span class="line"><span>│   _bounds     │   │                │   │                    │   │</span></span>
<span class="line"><span>│   _center     │   │ 输入:           │   │ 输出:              │   │</span></span>
<span class="line"><span>│               │   │ • NSLayoutConstraint 对象      │   │ • 最终 frame 值         │   │</span></span>
<span class="line"><span>│               │   │ • NSLayoutConstraint 优先级      │   │ • 布局完成通知        │   │</span></span>
<span class="line"><span>│               │   │ • NSLayoutConstraint 状态      │   │                    │   │</span></span>
<span class="line"><span>└───────────────┘   └──────────────────────────────┘   └────────────────────┘</span></span>
<span class="line"><span>         │                      │                            │</span></span>
<span class="line"><span>         ▼                      ▼                            ▼</span></span>
<span class="line"><span>   视图层级           约束求解器              布局传递（自上而下→自下而上）</span></span>
<span class="line"><span>   UIView            NSLayoutConstraint  Engine            layoutSubviews</span></span>
<span class="line"><span>                      Engine              Engine</span></span></code></pre></div><h3 id="_4-2-autolayout-核心组件" tabindex="-1">4.2 AutoLayout 核心组件 <a class="header-anchor" href="#_4-2-autolayout-核心组件" aria-label="Permalink to &quot;4.2 AutoLayout 核心组件&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// NSLayoutConstraint 是 AutoLayout 的核心类</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 它定义了两个视图之间的线性关系：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// NSLayoutConstraint 的构成要素：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    NSLayoutConstraint(</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        item: viewA,           // 被约束的视图</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        attribute: .top,       // 约束属性（top/left/width等）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        relatedBy: .equal,     // 关系（&gt;= &lt;= ==）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        toItem: viewB,         // 目标视图（nil = 超级视图/参考系）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        attribute: .topMargin, // 目标属性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        multiplier: 1.0,       // 乘数系数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        constant: 20.0         // 偏移常量</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    )</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 简化理解：viewA.top = viewB.top * multiplier + constant</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 例：viewA.top = viewB.top * 1.0 + 20.0 → viewA 顶部在 viewB 顶部下方 20pt</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// NSLayoutConstraint 的状态机：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   NSLayoutPriorityHigh  = 1000（必需）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   NSLayoutPriorityWindowSizeStayable = 999（系统窗口大小保持）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   NSLayoutPriorityFittingSizeLayout = 50（压缩优先级）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   NSLayoutPriorityDefaultLow = 251（默认低优先级）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   NSLayoutPriorityRequired = 1000（必须满足）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   NSLayoutPriorityDefaultHigh = 750（默认高优先级）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// NSLayoutConstraint 的求解过程：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 收集所有约束 → NSLayoutConstraint 对象数组</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 构建约束图（Constraint Graph）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    每个约束是有向边，视图是节点</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 求解线性方程组（使用高斯消元法等）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 处理优先级（优先级低的约束在冲突时让步）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. 输出每个视图的最终 frame</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. 通过 setNeedsLayout → layoutSubviews 应用到 UIView</span></span></code></pre></div><h3 id="_4-3-布局传递流程" tabindex="-1">4.3 布局传递流程 <a class="header-anchor" href="#_4-3-布局传递流程" aria-label="Permalink to &quot;4.3 布局传递流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AutoLayout 布局传递（双遍算法）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第一遍：自上而下（Forward Pass）— 确定约束</span></span>
<span class="line"><span>┌───────────────────────────────────┐</span></span>
<span class="line"><span>│  UIWindow                            │</span></span>
<span class="line"><span>│  ┌───────────────────────────────┐ │</span></span>
<span class="line"><span>│  │  ViewController.view              │ │</span></span>
<span class="line"><span>│  │  ┌────────────────────────────┐ │ │</span></span>
<span class="line"><span>│  │  │  NavigationBar              │ │ │</span></span>
<span class="line"><span>│  │  │  ┌────────────────────────┐ │ │ │</span></span>
<span class="line"><span>│  │  │  │  Content View             │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  ┌───────────────────┐ │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  │  TableView          │ │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  │  ┌───────────────┐ │ │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  │  │  Cell[0]        │ │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  │  │  Cell[1]        │ │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  │  └─────────────────┘ │ │ │ │</span></span>
<span class="line"><span>│  │  │  │  └──────────────────────┘ │ │ │</span></span>
<span class="line"><span>│  │  └──────────────────────────────┘ │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第二遍：自下而上（Backward Pass）— 确定尺寸</span></span>
<span class="line"><span>┌───────────────────────────────────┐</span></span>
<span class="line"><span>│  Cell[0]（返回 intrinsicContentSize）  │</span></span>
<span class="line"><span>│  Cell[1]（返回 intrinsicContentSize）  │</span></span>
<span class="line"><span>│  TableView（根据 cells 累加高度）       │</span></span>
<span class="line"><span>│  Content View（根据 TableView 布局）   │</span></span>
<span class="line"><span>│  ViewController.view                  │</span></span>
<span class="line"><span>│  Window（根据 view 布局）             │</span></span>
<span class="line"><span>└────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>最终结果：每个视图都有了确定的 frame</span></span></code></pre></div><hr><h2 id="_5-autolayout-机制" tabindex="-1">5. AutoLayout 机制 <a class="header-anchor" href="#_5-autolayout-机制" aria-label="Permalink to &quot;5. AutoLayout 机制&quot;">​</a></h2><h3 id="_5-1-创建约束的-4-种方式" tabindex="-1">5.1 创建约束的 4 种方式 <a class="header-anchor" href="#_5-1-创建约束的-4-种方式" aria-label="Permalink to &quot;5.1 创建约束的 4 种方式&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 1：NSLayoutConstraint（代码创建）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 精确控制，但代码冗长</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> constraint </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> NSLayoutConstraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewA,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    attribute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .top,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    relatedBy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .equal,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    toItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    attribute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .top,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    multiplier</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">view.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addConstraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(constraint)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 2：NSLayoutConstraint.activate()（批量激活）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> constraints </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    viewA.topAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.topAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    viewA.leadingAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.leadingAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    viewA.trailingAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.trailingAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    viewA.heightAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.heightAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">multiplier</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">NSLayoutConstraint.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(constraints)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 3：VFL（Visual Format Language）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 简洁但可读性差，已不推荐</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> views </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;viewA&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> viewA, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;viewB&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> viewB]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> constraints </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSLayoutConstraint.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    withVisualFormat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;V:|-[viewA]-[viewB]-|&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    options</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    metrics</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    views</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: views</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 4：NSLayoutAnchor（现代推荐 ✅）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 类型安全，链式调用，自动推断约束关系</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">viewA.topAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.topAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).isActive </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">viewA.leadingAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.leadingAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).isActive </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">viewA.trailingAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.trailingAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).isActive </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">viewA.heightAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: viewB.heightAnchor, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">multiplier</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).isActive </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 5：UIStackView（声明式）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> stack </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIStackView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">arrangedSubviews</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [viewA, viewB])</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stack.axis </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .vertical</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stack.spacing </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stack.distribution </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .fillEqually</span></span></code></pre></div><h3 id="_5-2-约束优先级系统" tabindex="-1">5.2 约束优先级系统 <a class="header-anchor" href="#_5-2-约束优先级系统" aria-label="Permalink to &quot;5.2 约束优先级系统&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 约束优先级详解（按重要性排序）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                    优先级层级                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1000 (Required)         — 必须满足             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 内容压缩/内容伸展优先级                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 系统默认约束                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│   750 (High)              — 默认高优先级         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • UIView 默认约束                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • NSLayoutConstraint.defaultHigh           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│   500 (Medium)            — 中间优先级           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 手动设置的中等优先级                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│   251 (Low)               — 默认低优先级         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • NSLayoutConstraint.defaultLow            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 内容压缩优先级                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│    1 (Lowest)             — 最低优先级           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 自定义最低优先级                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">约束冲突时的处理规则：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">1. 高优先级约束优先满足</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">2. 相同优先级：先添加的约束优先</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">3. 相同优先级+同时添加：系统随机选择一个约束作为&quot;winner&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">4. 冲突必须解决：否则触发断言崩溃（fatal error）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优先级应用场景：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 场景 1：可变间距（低优先级间距约束）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">leadingConstraint.priority </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .defaultLow  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 允许压缩</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 这样当空间不足时，间距会先被压缩而不是裁剪内容</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 场景 2：等高（低优先级高度约束）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">heightConstraint.priority </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .defaultLow  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 允许压缩</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 当内容高度可变时，高度约束不强制等高等</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 场景 3：优先填充（高优先级拉伸约束）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">widthConstraint.priority </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .defaultHigh  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优先拉伸</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优先满足宽度，再处理高度</span></span></code></pre></div><hr><h2 id="_6-stackview-原理" tabindex="-1">6. StackView 原理 <a class="header-anchor" href="#_6-stackview-原理" aria-label="Permalink to &quot;6. StackView 原理&quot;">​</a></h2><h3 id="_6-1-uistackview-内部机制" tabindex="-1">6.1 UIStackView 内部机制 <a class="header-anchor" href="#_6-1-uistackview-内部机制" aria-label="Permalink to &quot;6.1 UIStackView 内部机制&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">UIStackView 的工作原理：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│               UIStackView                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  arrangedSubviews = [                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│    view0（intrinsic width: 100）          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│    view1（intrinsic width: 150）          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│    view2（intrinsic width: 200）          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ]                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  axis = .horizontal → 水平排列             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  spacing = 10（子视图之间的间距）            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  distribution = .fill → 填满剩余空间         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  alignment = .fill → 对齐方式               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  layoutMargins = UIEdgeInsets                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  axisLayoutMargins（垂直方向间距）           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  计算过程：                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1. 收集所有 arrangedSubviews 的尺寸         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  2. 根据 axis 计算主轴/交叉轴尺寸            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  3. 根据 distribution 分配剩余空间           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  4. 根据 spacing 设置子视图间距               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  5. 生成 NSLayoutConstraint 并添加            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  6. 触发布局传递（layoutSubviews）           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">distribution 模式对比：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────┬──────────────────┬───────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 模式   │  描述             │  适用场景                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├───────┼──────────────────┼───────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ fill   │ 填满剩余空间       │ 等分布局（最常见）           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ equalSpacing │ 等间距      │ 子视图尺寸固定               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ fillProportionally │ 按尺寸比例│ 内容不等宽度的列表           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ equalCentering │ 等中心间距  │ 中间留白场景                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────┴──────────────────┴───────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// StackView 的高级用法：</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">extension</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIStackView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 动态添加子视图（自动创建约束）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> addArrangedSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> view: UIView) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addArrangedSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 自动创建约束：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // view.leadingAnchor == self.layoutMarginsGuide.leadingAnchor</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // view.trailingAnchor == self.layoutMarginsGuide.trailingAnchor</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // view.topAnchor == self.arrangedSubviews.last?.bottomAnchor + spacing</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 移除子视图（自动移除约束）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> removeArrangedSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> view: UIView) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">removeArrangedSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 注意：不会 removeFromSuperview，只是移除约束</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        view.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">removeFromSuperview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 需要手动调用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 插入子视图到指定位置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> insertArrangedSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> view: UIView, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">at</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> stackIndex: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">insertArrangedSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">at</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: stackIndex)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_6-2-stackview-常见坑" tabindex="-1">6.2 StackView 常见坑 <a class="header-anchor" href="#_6-2-stackview-常见坑" aria-label="Permalink to &quot;6.2 StackView 常见坑&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 坑 1：StackView 内的子视图约束优先级问题</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// StackView 内部会自动管理子视图的约束</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不要在 StackView 子视图上设置 leading/trailing 约束</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// StackView 会覆盖你设置的约束！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 正确做法：只在子视图上设置 width/height 约束</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">button.widthAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalToConstant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).isActive </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">button.leadingAnchor.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">constraint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: view.leadingAnchor).isActive </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ❌ StackView 会管理</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 坑 2：contentCompressionResistancePriority 冲突</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// StackView 中子视图的压缩优先级会冲突</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 解决：设置合理的 compression resistance 优先级</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">label.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">setContentCompressionResistancePriority</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(.defaultLow, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .horizontal)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 坑 3：StackView 不处理 intrinsicContentSize 的动态变化</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 当子视图内容变化导致尺寸变化时，StackView 不会自动更新</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 解决：调用 setNeedsLayout() + layoutIfNeeded()</span></span></code></pre></div><hr><h2 id="_7-snapkit-声明式布局" tabindex="-1">7. SnapKit 声明式布局 <a class="header-anchor" href="#_7-snapkit-声明式布局" aria-label="Permalink to &quot;7. SnapKit 声明式布局&quot;">​</a></h2><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SnapKit 是 AutoLayout 的 DSL 封装，简化约束编写</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 原理：在内部转换为 NSLayoutConstraint</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SnapKit</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyViewController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">UIViewController </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> title </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UILabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> button </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIButton</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> viewDidLoad</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">viewDidLoad</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        view.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(title)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        view.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addSubview</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(button)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 声明式约束（可读性极高）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        title.snp.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">makeConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { make </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.top.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view.safeAreaLayoutGuide).</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">offset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.left.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view.snp.left).</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">offset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.right.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view.snp.right).</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">offset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        button.snp.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">makeConstraints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { make </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.top.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(title.snp.bottom).</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">offset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.centerX.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(view.snp.centerX)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.width.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">120</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            make.height.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">equalTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">44</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SnapKit 优势：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// • 类型安全（编译期检查约束属性类型）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// • 链式调用（代码更紧凑）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// • 自动处理约束激活/失效</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// • 支持更新约束（updateConstraints）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// • 支持约束失效（removeConstraints）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// • 支持约束调试（printLogOnFail）</span></span></code></pre></div><hr><h2 id="_8-布局性能分析" tabindex="-1">8. 布局性能分析 <a class="header-anchor" href="#_8-布局性能分析" aria-label="Permalink to &quot;8. 布局性能分析&quot;">​</a></h2><h3 id="_8-1-常见布局性能瓶颈" tabindex="-1">8.1 常见布局性能瓶颈 <a class="header-anchor" href="#_8-1-常见布局性能瓶颈" aria-label="Permalink to &quot;8.1 常见布局性能瓶颈&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>布局性能问题排查清单：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────┬──────────────────────┬───────────────┬──────────┐</span></span>
<span class="line"><span>│ 问题   │ 产生原因              │ 检测方式       │ 解决方案  │</span></span>
<span class="line"><span>├───────┼──────────────────────┼───────────────┼──────────┤</span></span>
<span class="line"><span>│ 约束过多│ 一个视图上约束&gt;10      │ 调试器/日志   │ 合并约束  │</span></span>
<span class="line"><span>│ 约束冲突│ 多约束冲突无法求解      │ 崩溃日志      │ 修复优先级│</span></span>
<span class="line"><span>│ 频繁布局│ 循环触发 setNeedsLayout│ Instruments   │ 避免重复  │</span></span>
<span class="line"><span>│ 离屏渲染│ cornerRadius/shadow    │ CA Color Offscreen │ CAShapeLayer│</span></span>
<span class="line"><span>│ 复杂约束│ 嵌套约束/循环约束      │ 调试器警告      │ 简化约束  │</span></span>
<span class="line"><span>│ 动态约束│ 运行时频繁修改约束      │ 性能分析      │ 预定义约束│</span></span>
<span class="line"><span>│ 惯性布局│ large contents size 缓存未命中│ 调试器     │ 设置intrinsicSize│</span></span>
<span class="line"><span>└───────┴──────────────────────┴───────────────┴──────────┘</span></span></code></pre></div><h3 id="_8-2-布局性能优化策略" tabindex="-1">8.2 布局性能优化策略 <a class="header-anchor" href="#_8-2-布局性能优化策略" aria-label="Permalink to &quot;8.2 布局性能优化策略&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优化策略（按优先级排序）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 减少约束数量（最有效的优化）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 每个视图的约束数量控制在 5-8 个以内</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 合并多个约束为一个（如用 multiplier 代替多个 constant）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 避免嵌套 StackView</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 嵌套 StackView 会创建大量隐式约束</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 替代方案：使用 AutoLayout 直接约束</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 使用 prefersStatusBarUpdateAnimation</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 避免在布局过程中触发状态栏更新</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 预渲染静态内容</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 静态背景/图标等预渲染为图片（避免每帧重新绘制）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. 减少 draw(_:) 调用</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 CoreGraphics 绘制的视图放在后台渲染</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. 使用 UIView.performWithoutAnimation</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在代码中修改布局时避免触发动画</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">UIView.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">performWithoutAnimation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    view.frame </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newFrame</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 7. 约束复用（TableView/CollectionView）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 复用单元格时，约束不需要重新创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// NSLayoutConstraint 对象可复用</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 8. 使用 AutoResizing（Autoresizing）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 简单场景用 autoresizingMask 比 AutoLayout 快 5-10x</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 适合：简单的相对位置调整</span></span></code></pre></div><hr><h2 id="_9-面试题汇总" tabindex="-1">9. 面试题汇总 <a class="header-anchor" href="#_9-面试题汇总" aria-label="Permalink to &quot;9. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: UIView 和 CALayer 的本质区别是什么？为什么 UIView 需要 layer？</strong></p><p><strong>答</strong>：</p><ul><li>UIView 继承自 UIResponder，负责事件响应和渲染代理</li><li>CALayer 是实际存储像素数据的层，负责渲染</li><li>UIView 通过 <code>layer</code> 代理与 CALayer 关联（关联对象模式）</li><li>UIView 的渲染完全委托给 layer，自身不存储任何像素数据</li><li>UIView 的优势：可以响应事件、管理层级关系、处理手势</li></ul><p><strong>Q2: 离屏渲染的产生原因和优化方案？</strong></p><p><strong>答</strong>：</p><ul><li><strong>产生原因</strong>：GPU 无法在当前渲染帧处理，需要创建新的缓冲区</li><li><strong>触发条件</strong>：masksToBounds/clipsToBounds、cornerRadius（非 CAShapeLayer）、shadow、复杂混合模式、模糊效果</li><li><strong>检测</strong>：Instruments → Core Animation → Color Off-screen Rendered（红色 = 离屏）</li><li><strong>优化</strong>： <ul><li>圆角：用 CAShapeLayer + mask 替代</li><li>阴影：设置 shadowPath 避免离屏</li><li>预渲染：静态内容用 UIGraphicsImageRenderer</li><li>避免同时使用圆角 + 阴影 + 裁剪</li></ul></li></ul><p><strong>Q3: AutoLayout 的求解过程？</strong></p><p><strong>答</strong>：</p><ol><li>收集所有 NSLayoutConstraint 对象</li><li>构建约束图（视图为节点，约束为边）</li><li>求解线性方程组（高斯消元法）</li><li>处理优先级（高优先级优先满足，低优先级让步）</li><li>输出每个视图的最终 frame</li><li>通过 layoutSubviews 应用到 UIView</li><li>双遍算法：自上而下确定约束 → 自下而上确定尺寸</li></ol><p><strong>Q4: StackView 的工作原理？有哪些坑？</strong></p><p><strong>答</strong>：</p><ul><li>内部通过自动创建 NSLayoutConstraint 实现</li><li>遍历 arrangedSubviews 计算尺寸并分配</li><li><strong>坑</strong>：子视图上设置 leading/trailing 会被覆盖、压缩优先级冲突、动态内容不自动更新</li></ul><p><strong>Q5: 如何优化列表的布局性能？</strong></p><p><strong>答</strong>：</p><ul><li>减少约束数量（5-8 个以内）</li><li>预计算 intrinsicContentSize</li><li>使用 Content Size Category 缓存</li><li>避免在布局回调中修改约束</li><li>复用约束对象而非每次创建新约束</li><li>复杂单元格使用 draw 替代 AutoLayout</li></ul><hr><h2 id="_10-参考资源" tabindex="-1">10. 参考资源 <a class="header-anchor" href="#_10-参考资源" aria-label="Permalink to &quot;10. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/uikit/uiview" target="_blank" rel="noreferrer">Apple: UIView Class Reference</a></li><li><a href="https://developer.apple.com/documentation/quartzcore/calayer" target="_blank" rel="noreferrer">Apple: CALayer Class Reference</a></li><li><a href="https://developer.apple.com/documentation/uikit/nslayoutconstraint" target="_blank" rel="noreferrer">Apple: NSLayoutConstraint Class Reference</a></li><li><a href="https://nshipster.com/uiview" target="_blank" rel="noreferrer">NSHipster: UIView</a></li><li><a href="https://nshipster.com/nslayoutconstraint" target="_blank" rel="noreferrer">NSHipster: NSLayoutConstraint</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2018/218" target="_blank" rel="noreferrer">WWDC 2018: Auto Layout Essentials</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2019/226" target="_blank" rel="noreferrer">WWDC 2019: Advanced Auto Layout Techniques</a></li><li><a href="https://developer.apple.com/documentation/quartzcore/core_animation" target="_blank" rel="noreferrer">Core Animation Programming Guide</a></li></ul>`,77)])])}const y=i(l,[["render",h]]);export{g as __pageData,y as default};
