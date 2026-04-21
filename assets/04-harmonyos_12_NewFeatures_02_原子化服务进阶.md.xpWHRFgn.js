import{_ as a,o as n,c as p,ae as i}from"./chunks/framework.Czhw_PXq.js";const k=JSON.parse('{"title":"原子化服务进阶","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/12_NewFeatures/02_原子化服务进阶.md","filePath":"04-harmonyos/12_NewFeatures/02_原子化服务进阶.md"}'),l={name:"04-harmonyos/12_NewFeatures/02_原子化服务进阶.md"};function t(e,s,h,o,d,c){return n(),p("div",null,[...s[0]||(s[0]=[i(`<h1 id="原子化服务进阶" tabindex="-1">原子化服务进阶 <a class="header-anchor" href="#原子化服务进阶" aria-label="Permalink to &quot;原子化服务进阶&quot;">​</a></h1><h2 id="_1-原子化服务概述" tabindex="-1">1. 原子化服务概述 <a class="header-anchor" href="#_1-原子化服务概述" aria-label="Permalink to &quot;1. 原子化服务概述&quot;">​</a></h2><h3 id="_1-1-什么是原子化服务" tabindex="-1">1.1 什么是原子化服务 <a class="header-anchor" href="#_1-1-什么是原子化服务" aria-label="Permalink to &quot;1.1 什么是原子化服务&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>原子化服务（Atomic Service）是鸿蒙的核心特色：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>核心概念：</span></span>
<span class="line"><span>├── 免安装：用户不需要安装，即点即用</span></span>
<span class="line"><span>├── 元服务（Meta Service）：原子化服务的上层概念</span></span>
<span class="line"><span>├── 服务卡片（Service Widget）：元服务的入口</span></span>
<span class="line"><span>├── 场景化分发：根据场景自动推荐服务</span></span>
<span class="line"><span>└── 跨端流转：服务可在不同设备间无缝迁移</span></span></code></pre></div><h3 id="_1-2-与传统应用的对比" tabindex="-1">1.2 与传统应用的对比 <a class="header-anchor" href="#_1-2-与传统应用的对比" aria-label="Permalink to &quot;1.2 与传统应用的对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>传统应用（HAP）</th><th>原子化服务</th></tr></thead><tbody><tr><td>安装</td><td>需要下载安装</td><td>免安装，即点即用</td></tr><tr><td>包体积</td><td>较大（通常 &gt; 10MB）</td><td>轻量（通常 &lt; 5MB）</td></tr><tr><td>启动速度</td><td>较慢（需要冷启动）</td><td>快（直接加载）</td></tr><tr><td>使用方式</td><td>从桌面图标启动</td><td>卡片/搜索/场景触发</td></tr><tr><td>生命周期</td><td>独立应用生命周期</td><td>卡片/服务生命周期</td></tr><tr><td>分发渠道</td><td>AppGallery 应用市场</td><td>元服务市场/场景化分发</td></tr><tr><td>更新</td><td>应用商店更新</td><td>静默更新（无感）</td></tr><tr><td>安装位置</td><td>/data/app/</td><td>/data/atomic/</td></tr></tbody></table><h2 id="_2-元能力架构" tabindex="-1">2. 元能力架构 <a class="header-anchor" href="#_2-元能力架构" aria-label="Permalink to &quot;2. 元能力架构&quot;">​</a></h2><h3 id="_2-1-元能力-meta-capability" tabindex="-1">2.1 元能力（Meta Capability） <a class="header-anchor" href="#_2-1-元能力-meta-capability" aria-label="Permalink to &quot;2.1 元能力（Meta Capability）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>元能力是原子化服务的能力描述框架：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  元能力类型                                     │</span></span>
<span class="line"><span>│  ├── 展示能力：展示内容（文本/图片/卡片）          │</span></span>
<span class="line"><span>│  ├── 交互能力：用户交互（点击/滑动/输入）          │</span></span>
<span class="line"><span>│  ├── 数据能力：数据获取/处理/存储                │</span></span>
<span class="line"><span>│  ├── 设备能力：调用设备功能（相机/位置/传感器）    │</span></span>
<span class="line"><span>│  ├── 分发能力：服务分发/推荐/搜索                │</span></span>
<span class="line"><span>│  └── 连接能力：网络/分布式/设备连接               │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-元服务架构" tabindex="-1">2.2 元服务架构 <a class="header-anchor" href="#_2-2-元服务架构" aria-label="Permalink to &quot;2.2 元服务架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>元服务分层架构：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  元服务入口                                     │</span></span>
<span class="line"><span>│  ├── 服务卡片（Service Widget）                   │</span></span>
<span class="line"><span>│  ├── 万能卡片（Form）                            │</span></span>
<span class="line"><span>│  └── 搜索推荐（Search）                          │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  元服务能力层                                    │</span></span>
<span class="line"><span>│  ├── ArkUI 组件库（元服务能力组件）              │</span></span>
<span class="line"><span>│  ├── 元服务 API（元能力调用）                    │</span></span>
<span class="line"><span>│  └── 场景引擎（场景识别/推荐）                   │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  元服务运行时                                    │</span></span>
<span class="line"><span>│  ├── 元服务框架（元能力运行时）                   │</span></span>
<span class="line"><span>│  ├── 元服务分发器（场景化分发）                   │</span></span>
<span class="line"><span>│  └── 元服务管理（安装/更新/卸载）                │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-3-元能力开发" tabindex="-1">2.3 元能力开发 <a class="header-anchor" href="#_2-3-元能力开发" aria-label="Permalink to &quot;2.3 元能力开发&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 声明元服务能力</span></span>
<span class="line"><span>// module.json5</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  &quot;module&quot;: {</span></span>
<span class="line"><span>    &quot;metadata&quot;: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        &quot;name&quot;: &quot;atomicService&quot;,</span></span>
<span class="line"><span>        &quot;type&quot;: &quot;feature&quot;,</span></span>
<span class="line"><span>        &quot;description&quot;: &quot;元服务描述&quot;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>    &quot;metaInfo&quot;: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        &quot;name&quot;: &quot;widget&quot;,</span></span>
<span class="line"><span>        &quot;config&quot;: {</span></span>
<span class="line"><span>          &quot;formBindingData&quot;: {</span></span>
<span class="line"><span>            &quot;title&quot;: &quot;元服务标题&quot;</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>          &quot;supportDimensions&quot;: [&quot;2x2&quot;, &quot;2x4&quot;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    ]</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 创建元服务页面</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct AtomicServicePage {</span></span>
<span class="line"><span>  @State title: string = &#39;元服务&#39;;</span></span>
<span class="line"><span>  @State count: number = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(this.title)</span></span>
<span class="line"><span>        .fontSize(24)</span></span>
<span class="line"><span>        .fontWeight(FontWeight.Bold)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Button(&#39;点击次数: &#39; + this.count)</span></span>
<span class="line"><span>        .onClick(() =&gt; {</span></span>
<span class="line"><span>          this.count += 1;</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Button(&#39;跳转到完整应用&#39;)</span></span>
<span class="line"><span>        .onClick(() =&gt; {</span></span>
<span class="line"><span>          // 从元服务跳转到完整应用</span></span>
<span class="line"><span>          router.pushUrl({</span></span>
<span class="line"><span>            url: &#39;pages/FullApp&#39;</span></span>
<span class="line"><span>          });</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_3-免安装方案" tabindex="-1">3. 免安装方案 <a class="header-anchor" href="#_3-免安装方案" aria-label="Permalink to &quot;3. 免安装方案&quot;">​</a></h2><h3 id="_3-1-免安装原理" tabindex="-1">3.1 免安装原理 <a class="header-anchor" href="#_3-1-免安装原理" aria-label="Permalink to &quot;3.1 免安装原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>免安装流程：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. 用户触发（卡片/搜索/场景）                      │</span></span>
<span class="line"><span>│     → 元服务发现引擎匹配                            │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  2. 下载元服务包（轻量 HAP）                        │</span></span>
<span class="line"><span>│     → 只下载元服务部分（不下载完整应用）             │</span></span>
<span class="line"><span>│     → 增量更新，体积更小                            │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  3. 沙箱中运行                                     │</span></span>
<span class="line"><span>│     → 独立的沙箱目录                               │</span></span>
<span class="line"><span>│     → 独立的 TokenID                              │</span></span>
<span class="line"><span>│     → 完整的系统权限                                │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  4. 生命周期管理                                   │</span></span>
<span class="line"><span>│     → 卡片隐藏/显示                                │</span></span>
<span class="line"><span>│     → 后台保活                                     │</span></span>
<span class="line"><span>│     → 自动清理（长时间不用的元服务）                  │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-元服务卡片" tabindex="-1">3.2 元服务卡片 <a class="header-anchor" href="#_3-2-元服务卡片" aria-label="Permalink to &quot;3.2 元服务卡片&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { formInfo, formBindingData } from &#39;@kit.FormKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 创建元服务卡片</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>@CustomEntity(&#39;MyWidget&#39;, &#39;MyWidgetForm&#39;)</span></span>
<span class="line"><span>struct MyWidget {</span></span>
<span class="line"><span>  @State data: WidgetData = { title: &#39;&#39;, value: 0 };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  aboutToAppear() {</span></span>
<span class="line"><span>    // 从元服务框架获取数据</span></span>
<span class="line"><span>    formInfo.getFormInfo((data: formBindingData.FormBindingData) =&gt; {</span></span>
<span class="line"><span>      this.data = data.getValue(&#39;data&#39;) as WidgetData;</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(this.data.title)</span></span>
<span class="line"><span>        .fontSize(20)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Text(String(this.data.value))</span></span>
<span class="line"><span>        .fontSize(40)</span></span>
<span class="line"><span>        .fontWeight(FontWeight.Bold)</span></span>
<span class="line"><span>        .fontColor(Color.Red)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>    .borderRadius(16)</span></span>
<span class="line"><span>    .backgroundColor(Color.White)</span></span>
<span class="line"><span>    .padding(16)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 卡片配置</span></span>
<span class="line"><span>interface WidgetConfig {</span></span>
<span class="line"><span>  title: string;</span></span>
<span class="line"><span>  type: string;</span></span>
<span class="line"><span>  size: [number, number];  // 2x2 / 2x4</span></span>
<span class="line"><span>  refreshRate: number;  // 更新频率（分钟）</span></span>
<span class="line"><span>  isPreheat: boolean;  // 是否预热</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 卡片数据更新</span></span>
<span class="line"><span>async function updateWidgetData(widgetId: number, data: WidgetData) {</span></span>
<span class="line"><span>  // 通过元服务框架更新卡片数据</span></span>
<span class="line"><span>  const updateResult = await formInfo.updateForm(widgetId, {</span></span>
<span class="line"><span>    data: data</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-3-元服务生命周期" tabindex="-1">3.3 元服务生命周期 <a class="header-anchor" href="#_3-3-元服务生命周期" aria-label="Permalink to &quot;3.3 元服务生命周期&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>元服务卡片生命周期：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  onFormVisible — 卡片显示（用户可见）               │</span></span>
<span class="line"><span>│  → 开始数据刷新                                    │</span></span>
<span class="line"><span>│  → 启动数据拉取                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  onFormHidden — 卡片隐藏（用户不可见）              │</span></span>
<span class="line"><span>│  → 暂停数据刷新（减少功耗）                          │</span></span>
<span class="line"><span>│  → 缓存最新数据                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  onFormClick — 卡片点击                            │</span></span>
<span class="line"><span>│  → 跳转到对应页面                                  │</span></span>
<span class="line"><span>│  → 执行对应操作                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  onFormDelete — 卡片删除                            │</span></span>
<span class="line"><span>│  → 清理资源                                        │</span></span>
<span class="line"><span>│  → 停止数据刷新                                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_4-场景化分发" tabindex="-1">4. 场景化分发 <a class="header-anchor" href="#_4-场景化分发" aria-label="Permalink to &quot;4. 场景化分发&quot;">​</a></h2><h3 id="_4-1-场景引擎" tabindex="-1">4.1 场景引擎 <a class="header-anchor" href="#_4-1-场景引擎" aria-label="Permalink to &quot;4.1 场景引擎&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>场景化分发原理：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  场景识别引擎                                       │</span></span>
<span class="line"><span>│  ├── 时间感知：根据时间推荐服务（早高峰→交通）       │</span></span>
<span class="line"><span>│  ├── 位置感知：根据位置推荐服务（商场→优惠）         │</span></span>
<span class="line"><span>│  ├── 行为感知：根据行为推荐服务（搜索→相关服务）     │</span></span>
<span class="line"><span>│  ├── 设备感知：根据设备推荐服务（车机→车载服务）     │</span></span>
<span class="line"><span>│  └── 社交感知：根据社交关系推荐服务                  │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  分发策略                                           │</span></span>
<span class="line"><span>│  ├── 精准推荐：基于用户画像的个性化推荐              │</span></span>
<span class="line"><span>│  ├── 热度排名：基于使用频率的排行榜                  │</span></span>
<span class="line"><span>│  └── 关联推荐：基于服务关联度的推荐                  │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-场景化分发配置" tabindex="-1">4.2 场景化分发配置 <a class="header-anchor" href="#_4-2-场景化分发配置" aria-label="Permalink to &quot;4.2 场景化分发配置&quot;">​</a></h3><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Ability 的 skills 配置，定义服务入口</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;abilities&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;EntryAbility&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;srcEntry&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;./ets/entry/EntryAbility.ets&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;description&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;元服务入口&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;skills&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;entities&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;entity.system.home&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 桌面场景</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;actions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;action.system.home&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;uris&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;scheme&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;atomic&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;host&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;myapp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;pathPrefix&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/widget&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;entities&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;entity.system.search&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 搜索场景</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;actions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;action.system.search&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;metadata&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;searchKeyword&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">              &quot;resource&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;json/default/search_keyword.json&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_5-元服务-vs-传统应用开发" tabindex="-1">5. 元服务 vs 传统应用开发 <a class="header-anchor" href="#_5-元服务-vs-传统应用开发" aria-label="Permalink to &quot;5. 元服务 vs 传统应用开发&quot;">​</a></h2><h3 id="_5-1-开发差异" tabindex="-1">5.1 开发差异 <a class="header-anchor" href="#_5-1-开发差异" aria-label="Permalink to &quot;5.1 开发差异&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>传统应用</th><th>元服务</th></tr></thead><tbody><tr><td>入口组件</td><td>UIAbility</td><td>FormExtensionAbility</td></tr><tr><td>UI 构建</td><td>完整页面</td><td>卡片布局</td></tr><tr><td>包结构</td><td>完整 HAP</td><td>轻量 HAP</td></tr><tr><td>生命周期</td><td>Ability 生命周期</td><td>卡片生命周期</td></tr><tr><td>更新方式</td><td>应用商店更新</td><td>静默更新</td></tr><tr><td>分发渠道</td><td>AppGallery</td><td>元服务市场 + 场景化</td></tr><tr><td>代码体积</td><td>较大</td><td>较小</td></tr><tr><td>启动方式</td><td>图标点击</td><td>卡片/搜索/场景触发</td></tr></tbody></table><h3 id="_5-2-元服务打包" tabindex="-1">5.2 元服务打包 <a class="header-anchor" href="#_5-2-元服务打包" aria-label="Permalink to &quot;5.2 元服务打包&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 元服务构建配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># build-profile.json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  &quot;modules&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      &quot;name&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;entry&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      &quot;srcEntry&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;./ets/entry/EntryAbility.ets&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      &quot;destPath&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;./entry&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      &quot;metadata&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          &quot;name&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;atomicService&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          &quot;type&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;feature&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_6-🎯-面试高频考点" tabindex="-1">6. 🎯 面试高频考点 <a class="header-anchor" href="#_6-🎯-面试高频考点" aria-label="Permalink to &quot;6. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-元服务的核心特点是什么" tabindex="-1">Q1: 元服务的核心特点是什么？ <a class="header-anchor" href="#q1-元服务的核心特点是什么" aria-label="Permalink to &quot;Q1: 元服务的核心特点是什么？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>免安装：即点即用，无需下载完整应用</li><li>卡片入口：通过服务卡片/万能卡片访问</li><li>场景化分发：根据时间/位置/行为等场景自动推荐</li><li>轻量包：只包含元服务部分，体积小</li><li>跨端流转：可跨设备迁移</li><li>静默更新：无感更新，用户无感知</li></ul><h3 id="q2-元服务的生命周期如何管理" tabindex="-1">Q2: 元服务的生命周期如何管理？ <a class="header-anchor" href="#q2-元服务的生命周期如何管理" aria-label="Permalink to &quot;Q2: 元服务的生命周期如何管理？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>onFormVisible：卡片显示，开始数据刷新</li><li>onFormHidden：卡片隐藏，暂停刷新</li><li>onFormClick：卡片点击，跳转页面</li><li>onFormDelete：卡片删除，清理资源</li><li>卡片生命周期与应用生命周期解耦</li></ul><h3 id="q3-元服务与传统应用的区别" tabindex="-1">Q3: 元服务与传统应用的区别？ <a class="header-anchor" href="#q3-元服务与传统应用的区别" aria-label="Permalink to &quot;Q3: 元服务与传统应用的区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>安装方式：免安装 vs 需要安装</li><li>入口：卡片/搜索 vs 桌面图标</li><li>包体积：轻量（&lt; 5MB） vs 完整（&gt; 10MB）</li><li>分发：场景化 vs 应用市场</li><li>更新：静默 vs 应用商店更新</li><li>适用场景：简单功能 vs 复杂应用</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：元服务是鸿蒙区别于其他平台的<strong>核心特色</strong>。重点掌握 <strong>免安装原理</strong>、<strong>卡片生命周期</strong>、<strong>场景化分发机制</strong>。强调元服务在 IoT 生态中的价值。</p></blockquote>`,42)])])}const u=a(l,[["render",t]]);export{k as __pageData,u as default};
