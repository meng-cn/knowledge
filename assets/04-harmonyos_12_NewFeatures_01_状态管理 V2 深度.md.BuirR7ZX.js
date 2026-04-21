import{_ as a,o as n,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"状态管理 V2 深度","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/12_NewFeatures/01_状态管理 V2 深度.md","filePath":"04-harmonyos/12_NewFeatures/01_状态管理 V2 深度.md"}'),l={name:"04-harmonyos/12_NewFeatures/01_状态管理 V2 深度.md"};function i(t,s,c,r,o,d){return n(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="状态管理-v2-深度" tabindex="-1">状态管理 V2 深度 <a class="header-anchor" href="#状态管理-v2-深度" aria-label="Permalink to &quot;状态管理 V2 深度&quot;">​</a></h1><h2 id="_1-状态管理-v2-概述" tabindex="-1">1. 状态管理 V2 概述 <a class="header-anchor" href="#_1-状态管理-v2-概述" aria-label="Permalink to &quot;1. 状态管理 V2 概述&quot;">​</a></h2><h3 id="_1-1-v1-vs-v2-对比" tabindex="-1">1.1 V1 vs V2 对比 <a class="header-anchor" href="#_1-1-v1-vs-v2-对比" aria-label="Permalink to &quot;1.1 V1 vs V2 对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>状态管理版本演进：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ArkUI State Management V1:</span></span>
<span class="line"><span>├── @State / @Prop / @Link / @Provide / @Consume</span></span>
<span class="line"><span>├── @Observed / @ObjectLink</span></span>
<span class="line"><span>├── AppStorage / LocalStorage / PersistentStorage</span></span>
<span class="line"><span>└── 局限：响应式粒度粗、嵌套对象监听不完美</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ArkUI State Management V2:</span></span>
<span class="line"><span>├── @Trace V2 — 细粒度响应式追踪</span></span>
<span class="line"><span>├── @Local / @Param — 新的数据绑定方式</span></span>
<span class="line"><span>├── @Event — 响应式回调</span></span>
<span class="line"><span>├── ObservedV2 — 深度对象监听</span></span>
<span class="line"><span>├── Signal 响应式 — 细粒度信号</span></span>
<span class="line"><span>├── Proxy 代理 — 动态数据管理</span></span>
<span class="line"><span>└── 优势：响应式粒度精确、性能更优、开发体验更好</span></span></code></pre></div><h3 id="_1-2-v2-核心设计理念" tabindex="-1">1.2 V2 核心设计理念 <a class="header-anchor" href="#_1-2-v2-核心设计理念" aria-label="Permalink to &quot;1.2 V2 核心设计理念&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>V2 设计目标：</span></span>
<span class="line"><span>├── 细粒度响应：只更新真正依赖变化的组件</span></span>
<span class="line"><span>├── 类型安全：完整的 TypeScript 类型推导</span></span>
<span class="line"><span>├── 性能优化：减少不必要的渲染</span></span>
<span class="line"><span>├── 简洁语法：减少样板代码</span></span>
<span class="line"><span>└── 向后兼容：与 V1 状态共存</span></span></code></pre></div><h2 id="_2-trace-深度解析" tabindex="-1">2. @Trace 深度解析 <a class="header-anchor" href="#_2-trace-深度解析" aria-label="Permalink to &quot;2. @Trace 深度解析&quot;">​</a></h2><h3 id="_2-1-trace-原理" tabindex="-1">2.1 @Trace 原理 <a class="header-anchor" href="#_2-1-trace-原理" aria-label="Permalink to &quot;2.1 @Trace 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Trace 是 V2 的核心装饰器，实现细粒度的响应式追踪：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  @Trace 工作原理                                    │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  1. 编译期：Dawn 编译器将 @Trace 标记的类/属性       │</span></span>
<span class="line"><span>│     编译为响应式类型                                  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  2. 运行期：Proxy 代理拦截属性的 get/set             │</span></span>
<span class="line"><span>│     → get: 建立依赖关系（依赖收集）                   │</span></span>
<span class="line"><span>│     → set: 触发依赖更新（变更通知）                   │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  3. 更新机制：                                       │</span></span>
<span class="line"><span>│     属性变化 → 追踪依赖 → 标记脏节点 → 局部刷新       │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-trace-使用" tabindex="-1">2.2 @Trace 使用 <a class="header-anchor" href="#_2-2-trace-使用" aria-label="Permalink to &quot;2.2 @Trace 使用&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 定义响应式类</span></span>
<span class="line"><span>import { Trace } from &#39;@kit.ArkUI&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Trace</span></span>
<span class="line"><span>class UserModel {</span></span>
<span class="line"><span>  @Trace name: string = &#39;John&#39;;</span></span>
<span class="line"><span>  @Trace age: number = 25;</span></span>
<span class="line"><span>  @Trace address: Address = new Address();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  constructor() {</span></span>
<span class="line"><span>    // 响应式属性自动代理</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 响应式方法（方法调用不会触发刷新，需要返回响应式值）</span></span>
<span class="line"><span>  updateName(newName: string) {</span></span>
<span class="line"><span>    this.name = newName;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Trace</span></span>
<span class="line"><span>class Address {</span></span>
<span class="line"><span>  @Trace city: string = &#39;Beijing&#39;;</span></span>
<span class="line"><span>  @Trace street: string = &#39;ChangAn&#39;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 使用响应式数据</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct UserCard {</span></span>
<span class="line"><span>  @Trace user: UserModel = new UserModel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(\`Name: \${this.user.name}\`)</span></span>
<span class="line"><span>        .fontSize(18)</span></span>
<span class="line"><span>      Text(\`Age: \${this.user.age}\`)</span></span>
<span class="line"><span>        .fontSize(16)</span></span>
<span class="line"><span>      Text(\`City: \${this.user.address.city}\`)</span></span>
<span class="line"><span>        .fontSize(14)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Button(&#39;Update Name&#39;)</span></span>
<span class="line"><span>        .onClick(() =&gt; {</span></span>
<span class="line"><span>          this.user.name = &#39;Jane&#39;;  // ✅ 只刷新相关 Text</span></span>
<span class="line"><span>          this.user.address.city = &#39;Shanghai&#39;;  // ✅ 只刷新 Address Text</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-3-trace-与-state-对比" tabindex="-1">2.3 @Trace 与 @State 对比 <a class="header-anchor" href="#_2-3-trace-与-state-对比" aria-label="Permalink to &quot;2.3 @Trace 与 @State 对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>特性</th><th>@State (V1)</th><th>@Trace (V2)</th></tr></thead><tbody><tr><td>响应粒度</td><td>粗（整个组件刷新）</td><td>细（精确到属性）</td></tr><tr><td>嵌套对象</td><td>需要 @Observed + @ObjectLink</td><td>自动响应</td></tr><tr><td>性能</td><td>中等</td><td>更优</td></tr><tr><td>语法</td><td>属性装饰器</td><td>类装饰器 + 属性装饰器</td></tr><tr><td>类型推导</td><td>有限</td><td>完整</td></tr><tr><td>适用场景</td><td>简单状态</td><td>复杂对象/类</td></tr></tbody></table><h2 id="_3-observedv2-深度对象监听" tabindex="-1">3. ObservedV2 深度对象监听 <a class="header-anchor" href="#_3-observedv2-深度对象监听" aria-label="Permalink to &quot;3. ObservedV2 深度对象监听&quot;">​</a></h2><h3 id="_3-1-observedv2-原理" tabindex="-1">3.1 ObservedV2 原理 <a class="header-anchor" href="#_3-1-observedv2-原理" aria-label="Permalink to &quot;3.1 ObservedV2 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ObservedV2 是 V2 的深层对象监听机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  ObservedV2 机制                                     │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  1. 递归代理：对整个对象树建立 Proxy                 │</span></span>
<span class="line"><span>│  2. 惰性计算：只在读取属性时建立依赖                  │</span></span>
<span class="line"><span>│  3. 精确追踪：只标记直接依赖的属性                    │</span></span>
<span class="line"><span>│  4. 自动清理：组件销毁时自动断开依赖                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-observedv2-使用" tabindex="-1">3.2 ObservedV2 使用 <a class="header-anchor" href="#_3-2-observedv2-使用" aria-label="Permalink to &quot;3.2 ObservedV2 使用&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { ObservedV2 } from &#39;@kit.ArkUI&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 定义嵌套对象</span></span>
<span class="line"><span>@ObservedV2</span></span>
<span class="line"><span>class Order {</span></span>
<span class="line"><span>  @Trace items: OrderItem[] = [];</span></span>
<span class="line"><span>  @Trace totalAmount: number = 0;</span></span>
<span class="line"><span>  @Trace status: string = &#39;pending&#39;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@ObservedV2</span></span>
<span class="line"><span>class OrderItem {</span></span>
<span class="line"><span>  @Trace name: string = &#39;&#39;;</span></span>
<span class="line"><span>  @Trace price: number = 0;</span></span>
<span class="line"><span>  @Trace quantity: number = 1;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 使用</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct OrderList {</span></span>
<span class="line"><span>  @Trace order: Order = new Order();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  aboutToAppear() {</span></span>
<span class="line"><span>    this.order.items = [</span></span>
<span class="line"><span>      { name: &#39;Apple&#39;, price: 10, quantity: 2 },</span></span>
<span class="line"><span>      { name: &#39;Banana&#39;, price: 5, quantity: 3 }</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span>    this.order.totalAmount = 35;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      // 自动响应嵌套属性变化</span></span>
<span class="line"><span>      ForEach(this.order.items, (item: OrderItem) =&gt; {</span></span>
<span class="line"><span>        Text(\`\${item.name} x\${item.quantity} = ¥\${item.price * item.quantity}\`)</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Text(\`Total: ¥\${this.order.totalAmount}\`)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Button(&#39;Add Item&#39;)</span></span>
<span class="line"><span>        .onClick(() =&gt; {</span></span>
<span class="line"><span>          this.order.items.push({</span></span>
<span class="line"><span>            name: &#39;Orange&#39;,</span></span>
<span class="line"><span>            price: 8,</span></span>
<span class="line"><span>            quantity: 1</span></span>
<span class="line"><span>          });</span></span>
<span class="line"><span>          this.order.totalAmount += 8;  // 自动触发刷新</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-3-observedv2-vs-旧版-observed" tabindex="-1">3.3 ObservedV2 vs 旧版 Observed <a class="header-anchor" href="#_3-3-observedv2-vs-旧版-observed" aria-label="Permalink to &quot;3.3 ObservedV2 vs 旧版 Observed&quot;">​</a></h3><table tabindex="0"><thead><tr><th>特性</th><th>@Observed (V1)</th><th>@ObservedV2 (V2)</th></tr></thead><tbody><tr><td>嵌套监听</td><td>需 @ObjectLink 配合</td><td>自动递归代理</td></tr><tr><td>数组操作</td><td>需手动 notify</td><td>自动监听 push/pop</td></tr><tr><td>性能</td><td>较深时开销大</td><td>惰性计算，更优</td></tr><tr><td>类型推导</td><td>有限</td><td>完整</td></tr><tr><td>迁移成本</td><td>需重写</td><td>渐进式迁移</td></tr></tbody></table><h2 id="_4-signal-响应式" tabindex="-1">4. Signal 响应式 <a class="header-anchor" href="#_4-signal-响应式" aria-label="Permalink to &quot;4. Signal 响应式&quot;">​</a></h2><h3 id="_4-1-signal-原理" tabindex="-1">4.1 Signal 原理 <a class="header-anchor" href="#_4-1-signal-原理" aria-label="Permalink to &quot;4.1 Signal 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Signal 是 V2 引入的细粒度响应式机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Signal 概念：</span></span>
<span class="line"><span>├── Signal 是一个包含 value 和 dependents 的对象</span></span>
<span class="line"><span>├── 读取 signal.value 时建立依赖</span></span>
<span class="line"><span>├── 设置 signal.value 时通知依赖</span></span>
<span class="line"><span>├── 依赖更新时自动执行计算（computed）</span></span>
<span class="line"><span>└── 支持批量更新（transaction）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Signal 与 @Trace 的关系：</span></span>
<span class="line"><span>├── @Trace 是声明式，编译期生成</span></span>
<span class="line"><span>├── Signal 是编程式，运行期创建</span></span>
<span class="line"><span>├── Signal 更灵活（可以条件创建/动态销毁）</span></span>
<span class="line"><span>└── @Trace 更简洁（代码量少）</span></span></code></pre></div><h3 id="_4-2-signal-使用" tabindex="-1">4.2 Signal 使用 <a class="header-anchor" href="#_4-2-signal-使用" aria-label="Permalink to &quot;4.2 Signal 使用&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Signal, computed, batch } from &#39;@kit.ArkUI&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 创建 Signal</span></span>
<span class="line"><span>class Counter {</span></span>
<span class="line"><span>  count: Signal&lt;number&gt; = new Signal(0);</span></span>
<span class="line"><span>  name: Signal&lt;string&gt; = new Signal(&#39;Counter&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  increment() {</span></span>
<span class="line"><span>    this.count.value += 1;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 创建派生信号（自动追踪依赖）</span></span>
<span class="line"><span>class ComputedValues {</span></span>
<span class="line"><span>  private _count: Signal&lt;number&gt; = new Signal(0);</span></span>
<span class="line"><span>  private _multiplier: Signal&lt;number&gt; = new Signal(2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 派生值：当 count 或 multiplier 变化时自动重新计算</span></span>
<span class="line"><span>  get doubled() {</span></span>
<span class="line"><span>    return this._count.value * this._multiplier.value;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  set count(v: number) { this._count.value = v; }</span></span>
<span class="line"><span>  get count() { return this._count.value; }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  set multiplier(v: number) { this._multiplier.value = v; }</span></span>
<span class="line"><span>  get multiplier() { return this._multiplier.value; }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 批量更新（合并多次变更通知）</span></span>
<span class="line"><span>function batchUpdate() {</span></span>
<span class="line"><span>  batch(() =&gt; {</span></span>
<span class="line"><span>    // 这 3 次修改只会触发一次刷新</span></span>
<span class="line"><span>    count.value = 1;</span></span>
<span class="line"><span>    name.value = &#39;New&#39;;</span></span>
<span class="line"><span>    total.value = 100;</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_5-proxy-代理式数据管理" tabindex="-1">5. Proxy 代理式数据管理 <a class="header-anchor" href="#_5-proxy-代理式数据管理" aria-label="Permalink to &quot;5. Proxy 代理式数据管理&quot;">​</a></h2><h3 id="_5-1-proxy-原理" tabindex="-1">5.1 Proxy 原理 <a class="header-anchor" href="#_5-1-proxy-原理" aria-label="Permalink to &quot;5.1 Proxy 原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Proxy 是 V2 的运行时数据代理机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Proxy 特性：</span></span>
<span class="line"><span>├── 运行时创建，无需编译期装饰器</span></span>
<span class="line"><span>├── 支持动态数据（运行时才知道的数据结构）</span></span>
<span class="line"><span>├── 可以拦截和自定义属性访问行为</span></span>
<span class="line"><span>├── 深度代理，自动处理嵌套对象</span></span>
<span class="line"><span>└── 性能开销略高于 @Trace</span></span></code></pre></div><h3 id="_5-2-proxy-使用" tabindex="-1">5.2 Proxy 使用 <a class="header-anchor" href="#_5-2-proxy-使用" aria-label="Permalink to &quot;5.2 Proxy 使用&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Proxy } from &#39;@kit.ArkUI&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 创建响应式代理</span></span>
<span class="line"><span>function createDynamicConfig(): Proxy&lt;Config&gt; {</span></span>
<span class="line"><span>  const raw: Config = {</span></span>
<span class="line"><span>    theme: &#39;light&#39;,</span></span>
<span class="line"><span>    fontSize: 16,</span></span>
<span class="line"><span>    items: []</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>  return Proxy.create(raw);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>interface Config {</span></span>
<span class="line"><span>  theme: string;</span></span>
<span class="line"><span>  fontSize: number;</span></span>
<span class="line"><span>  items: string[];</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 使用代理</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct DynamicConfigPage {</span></span>
<span class="line"><span>  @Trace config: Proxy&lt;Config&gt; = createDynamicConfig();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      Text(\`Theme: \${this.config.theme}\`)</span></span>
<span class="line"><span>      Text(\`Font Size: \${this.config.fontSize}\`)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      Button(&#39;Switch Theme&#39;)</span></span>
<span class="line"><span>        .onClick(() =&gt; {</span></span>
<span class="line"><span>          this.config.theme = this.config.theme === &#39;light&#39; ? &#39;dark&#39; : &#39;light&#39;;</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_5-3-param-与-event" tabindex="-1">5.3 @Param 与 @Event <a class="header-anchor" href="#_5-3-param-与-event" aria-label="Permalink to &quot;5.3 @Param 与 @Event&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// @Param：父组件向子组件传入响应式参数</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct ChildComponent {</span></span>
<span class="line"><span>  @Param value: number;  // 响应式绑定，子组件可修改</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Text(\`Value: \${this.value}\`)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// @Event：子组件向父组件传递回调</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct ParentComponent {</span></span>
<span class="line"><span>  @Param childValue: number = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    ChildComponent({</span></span>
<span class="line"><span>      value: this.childValue,</span></span>
<span class="line"><span>      onChange: (newValue: number) =&gt; {</span></span>
<span class="line"><span>        this.childValue = newValue;  // 自动刷新</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    })</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_6-状态管理混合方案" tabindex="-1">6. 状态管理混合方案 <a class="header-anchor" href="#_6-状态管理混合方案" aria-label="Permalink to &quot;6. 状态管理混合方案&quot;">​</a></h2><h3 id="_6-1-推荐方案" tabindex="-1">6.1 推荐方案 <a class="header-anchor" href="#_6-1-推荐方案" aria-label="Permalink to &quot;6.1 推荐方案&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>状态管理选型指南：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────┬───────────────┬────────────────┐</span></span>
<span class="line"><span>│ 场景                  │ 推荐方案       │ 原因            │</span></span>
<span class="line"><span>├──────────────────────┼───────────────┼────────────────┤</span></span>
<span class="line"><span>│ 组件内部状态          │ @State        │ 简单直接        │</span></span>
<span class="line"><span>│ 父子单向数据流        │ @Prop         │ 单向拷贝安全    │</span></span>
<span class="line"><span>│ 父子双向绑定          │ @Link         │ 双向同步        │</span></span>
<span class="line"><span>│ 复杂嵌套对象          │ @Trace + @ObservedV2 │ 细粒度+深度监听  │</span></span>
<span class="line"><span>│ 运行时动态对象        │ Proxy         │ 动态创建        │</span></span>
<span class="line"><span>│ 简单计算值            │ Signal        │ 细粒度响应      │</span></span>
<span class="line"><span>│ 全局单例              │ AppStorage    │ 应用级共享       │</span></span>
<span class="line"><span>│ 页面级存储            │ LocalStorage  │ 页面/Ability 隔离 │</span></span>
<span class="line"><span>└──────────────────────┴───────────────┴────────────────┘</span></span></code></pre></div><h3 id="_6-2-实际项目架构" tabindex="-1">6.2 实际项目架构 <a class="header-anchor" href="#_6-2-实际项目架构" aria-label="Permalink to &quot;6.2 实际项目架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>推荐架构（大型项目）：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Store（全局状态，使用 @Trace 类）                   │</span></span>
<span class="line"><span>│  ├── @Trace userStore                              │</span></span>
<span class="line"><span>│  ├── @Trace settingsStore                          │</span></span>
<span class="line"><span>│  └── @Trace cartStore                              │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Service（业务逻辑层）                              │</span></span>
<span class="line"><span>│  ├── UserService                                   │</span></span>
<span class="line"><span>│  ├── SettingsService                               │</span></span>
<span class="line"><span>│  └── CartService                                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Component（UI 组件）                               │</span></span>
<span class="line"><span>│  ├── 子组件用 @Param 接收状态                       │</span></span>
<span class="line"><span>│  ├── 子组件用 @Event 通知父组件                     │</span></span>
<span class="line"><span>│  └── 局部状态用 @State                            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_7-🎯-面试高频考点" tabindex="-1">7. 🎯 面试高频考点 <a class="header-anchor" href="#_7-🎯-面试高频考点" aria-label="Permalink to &quot;7. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-trace-v2-与-state-v1-的区别" tabindex="-1">Q1: @Trace V2 与 @State V1 的区别？ <a class="header-anchor" href="#q1-trace-v2-与-state-v1-的区别" aria-label="Permalink to &quot;Q1: @Trace V2 与 @State V1 的区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>响应粒度</strong>：@Trace 细粒度（属性级），@State 粗粒度（组件级）</li><li><strong>嵌套对象</strong>：@Trace 自动响应嵌套变化，@State 需要 @Observed + @ObjectLink</li><li><strong>性能</strong>：@Trace 只更新依赖的子树，@State 刷新整个组件</li><li><strong>语法</strong>：@Trace 是类装饰器 + 属性装饰器，@State 是属性装饰器</li><li><strong>适用</strong>：@Trace 适合复杂对象，@State 适合简单状态</li></ul><h3 id="q2-observedv2-的原理是什么" tabindex="-1">Q2: ObservedV2 的原理是什么？ <a class="header-anchor" href="#q2-observedv2-的原理是什么" aria-label="Permalink to &quot;Q2: ObservedV2 的原理是什么？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>递归代理整个对象树</li><li>读取时建立依赖关系（依赖收集）</li><li>写入时触发依赖更新（变更通知）</li><li>惰性计算，只在真正使用时建立依赖</li><li>组件销毁时自动清理依赖</li><li>自动监听数组操作（push/pop/splice）</li></ul><h3 id="q3-signal-与-trace-怎么选" tabindex="-1">Q3: Signal 与 @Trace 怎么选？ <a class="header-anchor" href="#q3-signal-与-trace-怎么选" aria-label="Permalink to &quot;Q3: Signal 与 @Trace 怎么选？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>@Trace</strong>：声明式，编译期生成，代码简洁，适合大多数场景</li><li><strong>Signal</strong>：编程式，运行时创建，更灵活，适合动态创建/条件响应</li><li>Signal 支持批量更新（transaction），@Trace 不支持</li><li>@Trace 性能更优（编译期优化），Signal 开销略大</li><li>新项目优先使用 @Trace，复杂场景用 Signal</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：状态管理 V2 是面试最高频考点之一。重点掌握 <strong>@Trace 细粒度响应原理</strong>、<strong>ObservedV2 递归代理</strong>、<strong>Signal 与 @Trace 的区别</strong>。回答时强调性能优化优势。</p></blockquote>`,49)])])}const g=a(l,[["render",i]]);export{u as __pageData,g as default};
