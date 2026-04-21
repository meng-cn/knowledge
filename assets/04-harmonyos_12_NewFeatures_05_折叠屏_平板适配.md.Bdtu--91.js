import{_ as s,o as a,c as p,ae as l}from"./chunks/framework.Czhw_PXq.js";const g=JSON.parse('{"title":"折叠屏/平板适配","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/12_NewFeatures/05_折叠屏/平板适配.md","filePath":"04-harmonyos/12_NewFeatures/05_折叠屏/平板适配.md"}'),e={name:"04-harmonyos/12_NewFeatures/05_折叠屏/平板适配.md"};function i(t,n,c,o,r,d){return a(),p("div",null,[...n[0]||(n[0]=[l(`<h1 id="折叠屏-平板适配" tabindex="-1">折叠屏/平板适配 <a class="header-anchor" href="#折叠屏-平板适配" aria-label="Permalink to &quot;折叠屏/平板适配&quot;">​</a></h1><h2 id="_1-折叠屏适配概述" tabindex="-1">1. 折叠屏适配概述 <a class="header-anchor" href="#_1-折叠屏适配概述" aria-label="Permalink to &quot;1. 折叠屏适配概述&quot;">​</a></h2><h3 id="_1-1-折叠屏形态" tabindex="-1">1.1 折叠屏形态 <a class="header-anchor" href="#_1-1-折叠屏形态" aria-label="Permalink to &quot;1.1 折叠屏形态&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>鸿蒙折叠屏形态：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  折叠屏形态分类                                     │</span></span>
<span class="line"><span>│  ├── 翻盖式（Flip）：外屏 + 内屏（如 Mate X Flip）   │</span></span>
<span class="line"><span>│  ├── 折屏式（Fold）：展开/折叠（如 Mate X5）        │</span></span>
<span class="line"><span>│  ├── 多折屏：多次折叠（如 Mate XTs）               │</span></span>
<span class="line"><span>│  └── 卷轴屏：屏幕展开/收缩                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  适配挑战：                                         │</span></span>
<span class="line"><span>│  ├── 多屏幕尺寸：7.8&quot; / 8.0&quot; / 10.2&quot; / 12.6&quot;      │</span></span>
<span class="line"><span>│  ├── 折痕区域：屏幕中间有物理折痕                    │</span></span>
<span class="line"><span>│  ├── 多窗口：同时显示多个应用                        │</span></span>
<span class="line"><span>│  ├── 折叠状态：折叠/展开/半折叠三种状态              │</span></span>
<span class="line"><span>│  └── 交互方式：多角度悬停、手势操作                  │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-鸿蒙折叠屏适配策略" tabindex="-1">1.2 鸿蒙折叠屏适配策略 <a class="header-anchor" href="#_1-2-鸿蒙折叠屏适配策略" aria-label="Permalink to &quot;1.2 鸿蒙折叠屏适配策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>适配策略：</span></span>
<span class="line"><span>┌───────────────────────┬───────────────────────┐</span></span>
<span class="line"><span>│ 策略                  │ 适用场景              │</span></span>
<span class="line"><span>├───────────────────────┼───────────────────────┤</span></span>
<span class="line"><span>│ 断点适配              │ 不同尺寸显示不同布局   │</span></span>
<span class="line"><span>│ 栅格布局              │ 网格化自动排列        │</span></span>
<span class="line"><span>│ 相对布局              │ RelativeContainer 灵活布局 │</span></span>
<span class="line"><span>│ 多窗口                │ 分屏/浮动窗口         │</span></span>
<span class="line"><span>│ 状态感知              │ 根据折叠状态切换 UI    │</span></span>
<span class="line"><span>│ 媒体查询              │ 响应式 CSS 条件       │</span></span>
<span class="line"><span>└───────────────────────┴───────────────────────┘</span></span></code></pre></div><h2 id="_2-断点与多端适配" tabindex="-1">2. 断点与多端适配 <a class="header-anchor" href="#_2-断点与多端适配" aria-label="Permalink to &quot;2. 断点与多端适配&quot;">​</a></h2><h3 id="_2-1-断点机制" tabindex="-1">2.1 断点机制 <a class="header-anchor" href="#_2-1-断点机制" aria-label="Permalink to &quot;2.1 断点机制&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 使用媒体查询进行断点适配</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct FoldablePage {</span></span>
<span class="line"><span>  @State isFolded: boolean = false;</span></span>
<span class="line"><span>  @State isTablet: boolean = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 断点定义</span></span>
<span class="line"><span>  private breakpoints: Breakpoints = {</span></span>
<span class="line"><span>    small: 0,</span></span>
<span class="line"><span>    medium: 600,</span></span>
<span class="line"><span>    large: 1024,</span></span>
<span class="line"><span>    xlarge: 1440</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    // 使用媒体查询</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      this.renderContent()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .onVisibleAreaChange((visibleArea: number) =&gt; {</span></span>
<span class="line"><span>      this.isTablet = visibleArea &gt; 0.9;</span></span>
<span class="line"><span>    })</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Builder</span></span>
<span class="line"><span>  renderContent() {</span></span>
<span class="line"><span>    // 根据屏幕尺寸渲染不同布局</span></span>
<span class="line"><span>    if (this.isFolded) {</span></span>
<span class="line"><span>      // 折叠状态：单列布局</span></span>
<span class="line"><span>      SingleColumnLayout()</span></span>
<span class="line"><span>    } else if (this.isTablet) {</span></span>
<span class="line"><span>      // 展开状态/平板：双列布局</span></span>
<span class="line"><span>      DoubleColumnLayout()</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 手机：默认布局</span></span>
<span class="line"><span>      DefaultLayout()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-2-媒体查询适配" tabindex="-1">2.2 媒体查询适配 <a class="header-anchor" href="#_2-2-媒体查询适配" aria-label="Permalink to &quot;2.2 媒体查询适配&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 媒体查询：响应式布局</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct ResponsivePage {</span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      // 媒体查询容器</span></span>
<span class="line"><span>      this.renderContent()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Builder</span></span>
<span class="line"><span>  renderContent() {</span></span>
<span class="line"><span>    Row() {</span></span>
<span class="line"><span>      // 侧边栏（仅在大屏显示）</span></span>
<span class="line"><span>      this.renderSidebar()</span></span>
<span class="line"><span>        .width(&#39;25%&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 主内容</span></span>
<span class="line"><span>      this.renderMainContent()</span></span>
<span class="line"><span>        .width(&#39;75%&#39;)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Builder</span></span>
<span class="line"><span>  renderSidebar() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(&#39;侧边栏&#39;)</span></span>
<span class="line"><span>        .fontSize(18)</span></span>
<span class="line"><span>        .fontWeight(FontWeight.Bold)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .backgroundColor(&#39;#f0f0f0&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Builder</span></span>
<span class="line"><span>  renderMainContent() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(&#39;主内容区&#39;)</span></span>
<span class="line"><span>        .fontSize(24)</span></span>
<span class="line"><span>        .fontWeight(FontWeight.Bold)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .backgroundColor(&#39;#ffffff&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_3-折叠状态感知" tabindex="-1">3. 折叠状态感知 <a class="header-anchor" href="#_3-折叠状态感知" aria-label="Permalink to &quot;3. 折叠状态感知&quot;">​</a></h2><h3 id="_3-1-折叠状态监听" tabindex="-1">3.1 折叠状态监听 <a class="header-anchor" href="#_3-1-折叠状态监听" aria-label="Permalink to &quot;3.1 折叠状态监听&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { window } from &#39;@kit.WindowKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 折叠状态监听</span></span>
<span class="line"><span>class FoldManager {</span></span>
<span class="line"><span>  private currentFoldAngle: number = 0;</span></span>
<span class="line"><span>  private foldState: FoldState = FoldState.UNKNOWN;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async init() {</span></span>
<span class="line"><span>    // 监听折叠角度变化</span></span>
<span class="line"><span>    window.getMainWindow().then((win: window.Window) =&gt; {</span></span>
<span class="line"><span>      win.on(&#39;foldAngleChange&#39;, (angle: number) =&gt; {</span></span>
<span class="line"><span>        this.currentFoldAngle = angle;</span></span>
<span class="line"><span>        this.updateFoldState(angle);</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 监听窗口状态变化</span></span>
<span class="line"><span>    window.on(&#39;windowStateChange&#39;, (state: window.WindowState) =&gt; {</span></span>
<span class="line"><span>      if (state === window.WindowState.MULTI_WINDOW) {</span></span>
<span class="line"><span>        // 多窗口模式</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private updateFoldState(angle: number) {</span></span>
<span class="line"><span>    if (angle &lt; 45) {</span></span>
<span class="line"><span>      this.foldState = FoldState.FOLDED;  // 折叠</span></span>
<span class="line"><span>    } else if (angle &gt; 135) {</span></span>
<span class="line"><span>      this.foldState = FoldState.UNFOLDED;  // 展开</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      this.foldState = FoldState.HALF_FOLDED;  // 半折叠</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>enum FoldState {</span></span>
<span class="line"><span>  FOLDED,</span></span>
<span class="line"><span>  HALF_FOLDED,</span></span>
<span class="line"><span>  UNFOLDED,</span></span>
<span class="line"><span>  UNKNOWN</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-2-根据折叠状态切换-ui" tabindex="-1">3.2 根据折叠状态切换 UI <a class="header-anchor" href="#_3-2-根据折叠状态切换-ui" aria-label="Permalink to &quot;3.2 根据折叠状态切换 UI&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct FoldAwarePage {</span></span>
<span class="line"><span>  @State foldState: FoldState = FoldState.UNKNOWN;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      this.renderByFoldState()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .onAppear(() =&gt; {</span></span>
<span class="line"><span>      // 初始化折叠状态</span></span>
<span class="line"><span>      this.initFoldState();</span></span>
<span class="line"><span>    })</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Builder</span></span>
<span class="line"><span>  renderByFoldState() {</span></span>
<span class="line"><span>    switch (this.foldState) {</span></span>
<span class="line"><span>      case FoldState.FOLDED:</span></span>
<span class="line"><span>        // 折叠：紧凑布局</span></span>
<span class="line"><span>        Column() {</span></span>
<span class="line"><span>          CompactCard()</span></span>
<span class="line"><span>          CompactList()</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        .width(&#39;100%&#39;)</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      case FoldState.HALF_FOLDED:</span></span>
<span class="line"><span>        // 半折叠：分栏布局</span></span>
<span class="line"><span>        Row() {</span></span>
<span class="line"><span>          HalfLeft()</span></span>
<span class="line"><span>          HalfRight()</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        .width(&#39;100%&#39;)</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      case FoldState.UNFOLDED:</span></span>
<span class="line"><span>        // 展开：宽屏布局</span></span>
<span class="line"><span>        Row() {</span></span>
<span class="line"><span>          Sidebar()</span></span>
<span class="line"><span>          MainContent()</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        .width(&#39;100%&#39;)</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      default:</span></span>
<span class="line"><span>        DefaultLayout()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async initFoldState() {</span></span>
<span class="line"><span>    const win = await window.getMainWindow();</span></span>
<span class="line"><span>    // 获取当前折叠状态</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_4-多窗口适配" tabindex="-1">4. 多窗口适配 <a class="header-anchor" href="#_4-多窗口适配" aria-label="Permalink to &quot;4. 多窗口适配&quot;">​</a></h2><h3 id="_4-1-多窗口模式" tabindex="-1">4.1 多窗口模式 <a class="header-anchor" href="#_4-1-多窗口模式" aria-label="Permalink to &quot;4.1 多窗口模式&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 鸿蒙支持多种窗口模式</span></span>
<span class="line"><span>enum WindowMode {</span></span>
<span class="line"><span>  FULL_SCREEN,       // 全屏模式</span></span>
<span class="line"><span>  MULTI_WINDOW,      // 多窗口模式</span></span>
<span class="line"><span>  FLOATING_WINDOW,   // 浮动窗口</span></span>
<span class="line"><span>  PIP_WINDOW,        // 画中画</span></span>
<span class="line"><span>  SPLIT_SCREEN       // 分屏</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 窗口管理</span></span>
<span class="line"><span>import { window } from &#39;@kit.WindowKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 检查多窗口支持</span></span>
<span class="line"><span>const isMultiWindowSupported = window.isMultiWindowSupported();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 获取窗口管理器</span></span>
<span class="line"><span>const windowManager = window.getWindowManager();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 设置窗口模式</span></span>
<span class="line"><span>await windowManager.setWindowMode({</span></span>
<span class="line"><span>  mode: WindowMode.SPLIT_SCREEN,</span></span>
<span class="line"><span>  splitRatio: 0.5  // 50% 分屏</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 窗口状态监听</span></span>
<span class="line"><span>window.on(&#39;windowSizeChange&#39;, (size: window.WindowSize) =&gt; {</span></span>
<span class="line"><span>  console.log(\`Window size: \${size.width} x \${size.height}\`);</span></span>
<span class="line"><span>  this.onResize(size);</span></span>
<span class="line"><span>});</span></span></code></pre></div><h3 id="_4-2-分屏适配" tabindex="-1">4.2 分屏适配 <a class="header-anchor" href="#_4-2-分屏适配" aria-label="Permalink to &quot;4.2 分屏适配&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 分屏适配：根据窗口大小动态调整</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct SplitScreenPage {</span></span>
<span class="line"><span>  @State contentWidth: number = 0;</span></span>
<span class="line"><span>  @State contentHeight: number = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  onWindowStageCreate(windowStage: app.WindowStage) {</span></span>
<span class="line"><span>    windowStage.getMainWindow().then((win: window.Window) =&gt; {</span></span>
<span class="line"><span>      win.on(&#39;windowSizeChange&#39;, (size: window.WindowSize) =&gt; {</span></span>
<span class="line"><span>        this.contentWidth = size.width;</span></span>
<span class="line"><span>        this.contentHeight = size.height;</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    // 自适应宽度组件</span></span>
<span class="line"><span>    Row() {</span></span>
<span class="line"><span>      ForEach(this.generateItems(), (item: Item) =&gt; {</span></span>
<span class="line"><span>        ItemCard()</span></span>
<span class="line"><span>          .width(this.contentWidth / 3 - 10)  // 自适应宽度</span></span>
<span class="line"><span>          .aspectRatio(1)</span></span>
<span class="line"><span>      }, (item: Item) =&gt; item.id)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .justifyContent(FlexAlign.CENTER)</span></span>
<span class="line"><span>    .alignItems(VerticalAlign.CENTER)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_5-平板适配" tabindex="-1">5. 平板适配 <a class="header-anchor" href="#_5-平板适配" aria-label="Permalink to &quot;5. 平板适配&quot;">​</a></h2><h3 id="_5-1-平板-ui-设计原则" tabindex="-1">5.1 平板 UI 设计原则 <a class="header-anchor" href="#_5-1-平板-ui-设计原则" aria-label="Permalink to &quot;5.1 平板 UI 设计原则&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>平板 UI 设计原则：</span></span>
<span class="line"><span>├── 充分利用大屏空间（不要简单拉伸手机布局）</span></span>
<span class="line"><span>├── 使用多列布局（2-4 列）</span></span>
<span class="line"><span>├── 导航结构扁平化（底部导航/侧边栏）</span></span>
<span class="line"><span>├── 字体/图标适当放大（至少 1.5x）</span></span>
<span class="line"><span>├── 减少手势操作（大屏适合按钮/卡片）</span></span>
<span class="line"><span>├── 支持分屏/浮动窗口</span></span>
<span class="line"><span>└── 适配横屏/竖屏</span></span></code></pre></div><h3 id="_5-2-平板布局模板" tabindex="-1">5.2 平板布局模板 <a class="header-anchor" href="#_5-2-平板布局模板" aria-label="Permalink to &quot;5.2 平板布局模板&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 平板宽屏布局</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct TabletPage {</span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Row() {</span></span>
<span class="line"><span>      // 左侧导航栏</span></span>
<span class="line"><span>      NavigationBar()</span></span>
<span class="line"><span>        .width(280)</span></span>
<span class="line"><span>        .height(&#39;100%&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 中间内容区</span></span>
<span class="line"><span>      Column() {</span></span>
<span class="line"><span>        TopBar()</span></span>
<span class="line"><span>        MainContent()</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .width(&#39;60%&#39;)</span></span>
<span class="line"><span>      .height(&#39;100%&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 右侧信息面板（仅在大屏显示）</span></span>
<span class="line"><span>      InfoPanel()</span></span>
<span class="line"><span>        .width(320)</span></span>
<span class="line"><span>        .height(&#39;100%&#39;)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导航栏</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct NavigationBar {</span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(&#39;导航&#39;)</span></span>
<span class="line"><span>        .fontSize(20)</span></span>
<span class="line"><span>        .fontWeight(FontWeight.Bold)</span></span>
<span class="line"><span>        .margin({ top: 20, bottom: 20 })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      ListItem({ name: &#39;首页&#39;, icon: &#39;🏠&#39; })</span></span>
<span class="line"><span>      ListItem({ name: &#39;消息&#39;, icon: &#39;📬&#39; })</span></span>
<span class="line"><span>      ListItem({ name: &#39;设置&#39;, icon: &#39;⚙️&#39; })</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>    .backgroundColor(&#39;#f5f5f5&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 信息面板（仅在大屏显示）</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct InfoPanel {</span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(&#39;详细信息&#39;)</span></span>
<span class="line"><span>        .fontSize(18)</span></span>
<span class="line"><span>        .fontWeight(FontWeight.Bold)</span></span>
<span class="line"><span>      Divider()</span></span>
<span class="line"><span>      // 详情内容</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>    .backgroundColor(&#39;#fafafa&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_6-相对布局适配" tabindex="-1">6. 相对布局适配 <a class="header-anchor" href="#_6-相对布局适配" aria-label="Permalink to &quot;6. 相对布局适配&quot;">​</a></h2><h3 id="_6-1-relativecontainer-优势" tabindex="-1">6.1 RelativeContainer 优势 <a class="header-anchor" href="#_6-1-relativecontainer-优势" aria-label="Permalink to &quot;6.1 RelativeContainer 优势&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>RelativeContainer 在折叠屏/平板中的优势：</span></span>
<span class="line"><span>├── 不依赖固定尺寸，自动适配</span></span>
<span class="line"><span>├── 组件相对定位，响应窗口大小变化</span></span>
<span class="line"><span>├── 支持断点/媒体查询</span></span>
<span class="line"><span>├── 适合复杂布局（如平板的多面板）</span></span>
<span class="line"><span>└── 性能优于嵌套的 Column/Row</span></span></code></pre></div><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 相对布局适配折叠屏</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct RelativeFoldablePage {</span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    RelativeContainer() {</span></span>
<span class="line"><span>      // 1. 定义区域（Regions）</span></span>
<span class="line"><span>      this.defineRegions();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 2. 内容区域</span></span>
<span class="line"><span>      Column() {</span></span>
<span class="line"><span>        Text(&#39;内容区&#39;)</span></span>
<span class="line"><span>          .fontSize(24)</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .id(&#39;content&#39;)</span></span>
<span class="line"><span>      .alignRules({</span></span>
<span class="line"><span>        top: { anchor: &#39;toolbar&#39;, align: VerticalAlign.Top },</span></span>
<span class="line"><span>        bottom: { anchor: &#39;status_bar&#39;, align: VerticalAlign.Bottom },</span></span>
<span class="line"><span>        left: { anchor: &#39;sidebar&#39;, align: HorizontalAlign.Left },</span></span>
<span class="line"><span>        right: { anchor: &#39;info_panel&#39;, align: HorizontalAlign.Right }</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 3. 侧边栏</span></span>
<span class="line"><span>      Column() {</span></span>
<span class="line"><span>        Text(&#39;侧边栏&#39;)</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .id(&#39;sidebar&#39;)</span></span>
<span class="line"><span>      .alignRules({</span></span>
<span class="line"><span>        top: { anchor: &#39;toolbar&#39;, align: VerticalAlign.Top },</span></span>
<span class="line"><span>        bottom: { anchor: &#39;content&#39;, align: VerticalAlign.Bottom },</span></span>
<span class="line"><span>        left: { anchor: ParentLayout.Left }</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 4. 工具栏</span></span>
<span class="line"><span>      Row() {</span></span>
<span class="line"><span>        Text(&#39;工具栏&#39;)</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .id(&#39;toolbar&#39;)</span></span>
<span class="line"><span>      .alignRules({</span></span>
<span class="line"><span>        top: { anchor: ParentLayout.Top },</span></span>
<span class="line"><span>        left: { anchor: ParentLayout.Left },</span></span>
<span class="line"><span>        right: { anchor: ParentLayout.Right }</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 5. 信息面板（仅在大屏显示）</span></span>
<span class="line"><span>      Column() {</span></span>
<span class="line"><span>        Text(&#39;信息面板&#39;)</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .id(&#39;info_panel&#39;)</span></span>
<span class="line"><span>      .alignRules({</span></span>
<span class="line"><span>        top: { anchor: &#39;toolbar&#39;, align: VerticalAlign.Top },</span></span>
<span class="line"><span>        bottom: { anchor: &#39;content&#39;, align: VerticalAlign.Bottom },</span></span>
<span class="line"><span>        right: { anchor: ParentLayout.Right }</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  defineRegions() {</span></span>
<span class="line"><span>    const regionWidth = Math.min(300, this.getDisplayWidth() * 0.2);</span></span>
<span class="line"><span>    const panelWidth = Math.min(320, this.getDisplayWidth() * 0.2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.addArea(&#39;sidebar&#39;, Area.LEFT, { width: regionWidth });</span></span>
<span class="line"><span>    this.addArea(&#39;info_panel&#39;, Area.RIGHT, { width: panelWidth });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  getDisplayWidth(): number {</span></span>
<span class="line"><span>    return 1080; // 实际通过 window API 获取</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_7-🎯-面试高频考点" tabindex="-1">7. 🎯 面试高频考点 <a class="header-anchor" href="#_7-🎯-面试高频考点" aria-label="Permalink to &quot;7. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-折叠屏适配的策略有哪些" tabindex="-1">Q1: 折叠屏适配的策略有哪些？ <a class="header-anchor" href="#q1-折叠屏适配的策略有哪些" aria-label="Permalink to &quot;Q1: 折叠屏适配的策略有哪些？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>断点适配</strong>：不同屏幕宽度使用不同布局</li><li><strong>媒体查询</strong>：响应式条件布局</li><li><strong>折叠状态感知</strong>：监听折叠角度切换 UI</li><li><strong>相对布局</strong>：RelativeContainer 自适应</li><li><strong>栅格布局</strong>：网格化自动排列</li><li><strong>多窗口支持</strong>：分屏/浮动窗口</li><li>核心原则：根据状态/尺寸动态调整，而非固定布局</li></ul><h3 id="q2-平板-ui-设计有哪些最佳实践" tabindex="-1">Q2: 平板 UI 设计有哪些最佳实践？ <a class="header-anchor" href="#q2-平板-ui-设计有哪些最佳实践" aria-label="Permalink to &quot;Q2: 平板 UI 设计有哪些最佳实践？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>充分利用大屏空间（多列布局）</li><li>导航扁平化（底部导航/侧边栏）</li><li>字体/图标放大（至少 1.5x）</li><li>支持分屏/浮动窗口</li><li>适配横屏/竖屏</li><li>减少手势操作（多用按钮/卡片）</li><li>不要简单拉伸手机布局</li></ul><h3 id="q3-relativecontainer-相比嵌套布局的优势" tabindex="-1">Q3: RelativeContainer 相比嵌套布局的优势？ <a class="header-anchor" href="#q3-relativecontainer-相比嵌套布局的优势" aria-label="Permalink to &quot;Q3: RelativeContainer 相比嵌套布局的优势？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>自适应</strong>：不依赖固定尺寸，自动适配窗口变化</li><li><strong>组件相对定位</strong>：基于锚点和规则定位</li><li><strong>性能更好</strong>：比多层嵌套 Column/Row 性能优</li><li><strong>适合复杂布局</strong>：平板多面板、折叠屏多状态</li><li><strong>断点支持</strong>：可配合媒体查询</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：折叠屏/平板适配是鸿蒙面试的亮点题。重点掌握 <strong>折叠状态感知</strong>、<strong>断点适配</strong>、<strong>多窗口适配</strong>、<strong>RelativeContainer 优势</strong>。强调鸿蒙在多端适配上的独特优势。</p></blockquote>`,42)])])}const u=s(e,[["render",i]]);export{g as __pageData,u as default};
