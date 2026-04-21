import{_ as a,o as s,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const h=JSON.parse('{"title":"广播与事件（CommonEvent）","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/11_System/07_广播与事件.md","filePath":"04-harmonyos/11_System/07_广播与事件.md"}'),t={name:"04-harmonyos/11_System/07_广播与事件.md"};function i(l,n,o,c,d,r){return s(),p("div",null,[...n[0]||(n[0]=[e(`<h1 id="广播与事件-commonevent" tabindex="-1">广播与事件（CommonEvent） <a class="header-anchor" href="#广播与事件-commonevent" aria-label="Permalink to &quot;广播与事件（CommonEvent）&quot;">​</a></h1><h2 id="_1-commonevent-概述" tabindex="-1">1. CommonEvent 概述 <a class="header-anchor" href="#_1-commonevent-概述" aria-label="Permalink to &quot;1. CommonEvent 概述&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CommonEvent 是鸿蒙系统的发布-订阅广播机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  CommonEvent 特性                                 │</span></span>
<span class="line"><span>│  ├── 发布-订阅模式：发布者不感知订阅者               │</span></span>
<span class="line"><span>│  ├── 系统级广播：系统事件通过 CommonEvent 广播       │</span></span>
<span class="line"><span>│  ├── 支持跨应用通信：不同应用通过事件名订阅           │</span></span>
<span class="line"><span>│  ├── 异步通信：发布后立即返回，不等待处理完成          │</span></span>
<span class="line"><span>│  ├── 有序/无序广播：通过 flags 区分                 │</span></span>
<span class="line"><span>│  └── 订阅限流：每个应用对同一事件最多订阅 100 次     │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_2-commonevent-发布" tabindex="-1">2. CommonEvent 发布 <a class="header-anchor" href="#_2-commonevent-发布" aria-label="Permalink to &quot;2. CommonEvent 发布&quot;">​</a></h2><h3 id="_2-1-发布-commonevent" tabindex="-1">2.1 发布 CommonEvent <a class="header-anchor" href="#_2-1-发布-commonevent" aria-label="Permalink to &quot;2.1 发布 CommonEvent&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 发布有序事件（有序广播）</span></span>
<span class="line"><span>async function publishOrderedEvent() {</span></span>
<span class="line"><span>  const want: common.EventWant = {</span></span>
<span class="line"><span>    action: &#39;com.example.action.MY_EVENT&#39;,</span></span>
<span class="line"><span>    parameters: {</span></span>
<span class="line"><span>      key1: &#39;value1&#39;,</span></span>
<span class="line"><span>      key2: 100</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const publishInfo: common.PublishOptions = {</span></span>
<span class="line"><span>    permissions: [&#39;ohos.permission.BROADCAST_COMMON&#39;], // 需要权限</span></span>
<span class="line"><span>    flags: common.Flags.FLAG_OWNED_SYNC, // 同步等待</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  await common.publishEvent(&#39;com.example.action.MY_EVENT&#39;, want, publishInfo);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 发布无序事件（无序广播）</span></span>
<span class="line"><span>async function publishUnorderedEvent() {</span></span>
<span class="line"><span>  const want: common.EventWant = {</span></span>
<span class="line"><span>    action: &#39;com.example.action.MY_EVENT_ASYNC&#39;,</span></span>
<span class="line"><span>    parameters: {</span></span>
<span class="line"><span>      key1: &#39;value1&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 无序：不需要权限</span></span>
<span class="line"><span>  await common.publishEvent(&#39;com.example.action.MY_EVENT_ASYNC&#39;, want);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 发布系统事件</span></span>
<span class="line"><span>async function publishSystemEvent() {</span></span>
<span class="line"><span>  const want: common.EventWant = {</span></span>
<span class="line"><span>    action: &#39;com.huawei.system.bootup&#39;, // 系统启动事件</span></span>
<span class="line"><span>    parameters: {</span></span>
<span class="line"><span>      bootType: &#39;cold&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>  await common.publishEvent(want.action, want);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-2-系统内置事件" tabindex="-1">2.2 系统内置事件 <a class="header-anchor" href="#_2-2-系统内置事件" aria-label="Permalink to &quot;2.2 系统内置事件&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名（Action）</th><th>说明</th><th>触发时机</th></tr></thead><tbody><tr><td><code>com.huawei.system.bootup</code></td><td>系统启动完成</td><td>开机完成后</td></tr><tr><td><code>com.huawei.intent.action.USER_PRESENT</code></td><td>用户解锁设备</td><td>解锁时</td></tr><tr><td><code>com.huawei.intent.action.ACTION_POWER_CONNECTED</code></td><td>充电器连接</td><td>插拔充电器</td></tr><tr><td><code>com.huawei.intent.action.ACTION_POWER_DISCONNECTED</code></td><td>充电器断开</td><td>拔充电器</td></tr><tr><td><code>ohos.action.internetConnectivityChange</code></td><td>网络连通性变化</td><td>网络切换时</td></tr><tr><td><code>ohos.action.timeChange</code></td><td>时间变更</td><td>时间变化</td></tr><tr><td><code>ohos.action.timezoneChange</code></td><td>时区变更</td><td>时区变化</td></tr><tr><td><code>com.huawei.intent.action.PACKAGE_ADDED</code></td><td>应用安装</td><td>安装完成</td></tr><tr><td><code>com.huawei.intent.action.PACKAGE_REMOVED</code></td><td>应用卸载</td><td>卸载完成</td></tr><tr><td><code>ohos.wifi.WIFI_STATE_CHANGED</code></td><td>WiFi 状态变化</td><td>WiFi 开关</td></tr></tbody></table><h2 id="_3-commonevent-订阅" tabindex="-1">3. CommonEvent 订阅 <a class="header-anchor" href="#_3-commonevent-订阅" aria-label="Permalink to &quot;3. CommonEvent 订阅&quot;">​</a></h2><h3 id="_3-1-订阅-commonevent" tabindex="-1">3.1 订阅 CommonEvent <a class="header-anchor" href="#_3-1-订阅-commonevent" aria-label="Permalink to &quot;3.1 订阅 CommonEvent&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 订阅事件（需要订阅者）</span></span>
<span class="line"><span>interface MySubscriber extends common.Subscriber {</span></span>
<span class="line"><span>  onReceiveEvent(want: common.EventWant): void {</span></span>
<span class="line"><span>    console.log(\`Received event: \${want.action}\`);</span></span>
<span class="line"><span>    console.log(\`Parameters:\`, want.parameters);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 创建订阅者</span></span>
<span class="line"><span>const mySubscriber: common.Subscriber = {</span></span>
<span class="line"><span>  wantList: [</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      actions: [</span></span>
<span class="line"><span>        &#39;com.example.action.MY_EVENT&#39;,</span></span>
<span class="line"><span>        &#39;com.example.action.MY_EVENT_ASYNC&#39;,</span></span>
<span class="line"><span>      ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>  onReceiveEvent(want: common.EventWant) {</span></span>
<span class="line"><span>    console.log(&#39;Received: &#39; + want.action);</span></span>
<span class="line"><span>    console.log(&#39;Params:&#39;, want.parameters);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 注册订阅</span></span>
<span class="line"><span>const subscriberId = await common.subscribe(mySubscriber);</span></span>
<span class="line"><span>console.log(&#39;Subscriber ID: &#39; + subscriberId);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 取消订阅</span></span>
<span class="line"><span>async function unsubscribeEvent() {</span></span>
<span class="line"><span>  await common.unsubscribe(subscriberId);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-2-事件过滤器" tabindex="-1">3.2 事件过滤器 <a class="header-anchor" href="#_3-2-事件过滤器" aria-label="Permalink to &quot;3.2 事件过滤器&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 订阅过滤器：匹配特定事件</span></span>
<span class="line"><span>import { common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const filter: common.SubscriberOptions = {</span></span>
<span class="line"><span>  wantList: [</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      actions: [&#39;com.example.action.MY_EVENT&#39;],</span></span>
<span class="line"><span>      entities: [&#39;entity.default&#39;],</span></span>
<span class="line"><span>      URI: &#39;uri://example.com/event&#39;,</span></span>
<span class="line"><span>      parameters: {</span></span>
<span class="line"><span>        key1: &#39;value1&#39;  // 参数过滤</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  ]</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const subscriber = {</span></span>
<span class="line"><span>  wantList: filter.wantList,</span></span>
<span class="line"><span>  onReceiveEvent: (want: common.EventWant) =&gt; {</span></span>
<span class="line"><span>    // 处理匹配的事件</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const id = await common.subscribe(subscriber);</span></span></code></pre></div><h2 id="_4-权限与安全" tabindex="-1">4. 权限与安全 <a class="header-anchor" href="#_4-权限与安全" aria-label="Permalink to &quot;4. 权限与安全&quot;">​</a></h2><h3 id="_4-1-权限要求" tabindex="-1">4.1 权限要求 <a class="header-anchor" href="#_4-1-权限要求" aria-label="Permalink to &quot;4.1 权限要求&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>发布权限：</span></span>
<span class="line"><span>├── 无序 CommonEvent：不需要特殊权限（ohos.permission.BROADCAST_COMMON）</span></span>
<span class="line"><span>├── 有序 CommonEvent：需要 ohos.permission.BROADCAST_COMMON</span></span>
<span class="line"><span>└── 系统级事件：需要系统权限（ohos.permission.SYSTEM_BROADCAST）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>订阅权限：</span></span>
<span class="line"><span>├── 无序事件：无需权限</span></span>
<span class="line"><span>├── 有序事件：需与发布方相同权限</span></span>
<span class="line"><span>└── 系统事件：需对应系统权限</span></span></code></pre></div><h3 id="_4-2-安全限制" tabindex="-1">4.2 安全限制 <a class="header-anchor" href="#_4-2-安全限制" aria-label="Permalink to &quot;4.2 安全限制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>安全限制：</span></span>
<span class="line"><span>├── 事件名规范：需以应用 bundleName 为前缀（防止冲突）</span></span>
<span class="line"><span>├── 消息大小限制：单次事件数据不超过 1MB</span></span>
<span class="line"><span>├── 订阅次数限制：同一事件最多订阅 100 次/应用</span></span>
<span class="line"><span>├── 发布频率限制：防止滥用导致系统负载过高</span></span>
<span class="line"><span>└── 跨应用隔离：不可发布/订阅其他应用的私有事件</span></span></code></pre></div><h2 id="_5-commonevent-与-android-broadcast-对比" tabindex="-1">5. CommonEvent 与 Android Broadcast 对比 <a class="header-anchor" href="#_5-commonevent-与-android-broadcast-对比" aria-label="Permalink to &quot;5. CommonEvent 与 Android Broadcast 对比&quot;">​</a></h2><table tabindex="0"><thead><tr><th>维度</th><th>Android BroadcastReceiver</th><th>鸿蒙 CommonEvent</th></tr></thead><tbody><tr><td>通信模式</td><td>发布-订阅</td><td>发布-订阅</td></tr><tr><td>有序/无序</td><td>有序/无序广播</td><td>通过 flags 区分</td></tr><tr><td>权限控制</td><td>权限声明 + 动态权限</td><td>发布权限 + 订阅权限</td></tr><tr><td>事件类型</td><td>Intent Action</td><td>Want Action + parameters</td></tr><tr><td>注册方式</td><td>Manifest 静态 / 动态</td><td>动态注册</td></tr><tr><td>执行线程</td><td>主线程（可能导致 ANR）</td><td>异步（不阻塞主线程）</td></tr><tr><td>超时限制</td><td>有序广播 10s 超时</td><td>无固定超时（FLAG_OWNED_SYNC）</td></tr><tr><td>系统事件</td><td>AndroidManifest 定义</td><td>CommonEvent 预定义</td></tr><tr><td>性能</td><td>BroadcastReceiver 开销大</td><td>CommonEvent 更轻量</td></tr></tbody></table><h2 id="_6-使用场景" tabindex="-1">6. 使用场景 <a class="header-anchor" href="#_6-使用场景" aria-label="Permalink to &quot;6. 使用场景&quot;">​</a></h2><h3 id="_6-1-跨-ability-通信" tabindex="-1">6.1 跨 Ability 通信 <a class="header-anchor" href="#_6-1-跨-ability-通信" aria-label="Permalink to &quot;6.1 跨 Ability 通信&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Ability A：发布事件</span></span>
<span class="line"><span>async function notifyAbilityB() {</span></span>
<span class="line"><span>  const want: common.EventWant = {</span></span>
<span class="line"><span>    action: &#39;com.example.app.ACTION_UPDATE&#39;,</span></span>
<span class="line"><span>    parameters: { data: &#39;new_data&#39;, timestamp: Date.now() }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>  await common.publishEvent(want.action, want);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Ability B：订阅事件</span></span>
<span class="line"><span>const subscriber: common.Subscriber = {</span></span>
<span class="line"><span>  wantList: [{ actions: [&#39;com.example.app.ACTION_UPDATE&#39;] }],</span></span>
<span class="line"><span>  onReceiveEvent(want: common.EventWant) {</span></span>
<span class="line"><span>    const { data, timestamp } = want.parameters;</span></span>
<span class="line"><span>    this.refreshData(data);</span></span>
<span class="line"><span>    console.log(\`Updated at \${timestamp}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span>const subId = await common.subscribe(subscriber);</span></span></code></pre></div><h3 id="_6-2-系统状态监听" tabindex="-1">6.2 系统状态监听 <a class="header-anchor" href="#_6-2-系统状态监听" aria-label="Permalink to &quot;6.2 系统状态监听&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 监听网络状态变化</span></span>
<span class="line"><span>import { common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span>import { net } from &#39;@kit.NetworkKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 方式一：通过 CommonEvent 监听</span></span>
<span class="line"><span>const networkSubscriber: common.Subscriber = {</span></span>
<span class="line"><span>  wantList: [{ actions: [&#39;ohos.action.internetConnectivityChange&#39;] }],</span></span>
<span class="line"><span>  onReceiveEvent(want: common.EventWant) {</span></span>
<span class="line"><span>    const networkInfo = net.getNetworkInfo();</span></span>
<span class="line"><span>    console.log(&#39;Network: &#39; + networkInfo.connected);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span>await common.subscribe(networkSubscriber);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 方式二：使用 net 模块（推荐）</span></span>
<span class="line"><span>import { net } from &#39;@kit.NetworkKit&#39;;</span></span>
<span class="line"><span>net.on(&#39;connectivityChange&#39;, (info: net.NetChangeInfo) =&gt; {</span></span>
<span class="line"><span>  console.log(&#39;Connected: &#39; + info.connected);</span></span>
<span class="line"><span>});</span></span></code></pre></div><h2 id="_7-🎯-面试高频考点" tabindex="-1">7. 🎯 面试高频考点 <a class="header-anchor" href="#_7-🎯-面试高频考点" aria-label="Permalink to &quot;7. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-commonevent-与-android-broadcast-的区别" tabindex="-1">Q1: CommonEvent 与 Android Broadcast 的区别？ <a class="header-anchor" href="#q1-commonevent-与-android-broadcast-的区别" aria-label="Permalink to &quot;Q1: CommonEvent 与 Android Broadcast 的区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>执行线程：Android Broadcast 在主线程（可能 ANR），CommonEvent 异步</li><li>注册方式：Android 支持静态（Manifest）和动态，鸿蒙仅支持动态注册</li><li>超时处理：Android 有序广播有 10s 超时，鸿蒙无固定超时</li><li>性能：CommonEvent 更轻量，广播更安全</li><li>权限：CommonEvent 发布/订阅均需验证权限，更安全</li></ul><h3 id="q2-commonevent-的有序和无序有什么区别" tabindex="-1">Q2: CommonEvent 的有序和无序有什么区别？ <a class="header-anchor" href="#q2-commonevent-的有序和无序有什么区别" aria-label="Permalink to &quot;Q2: CommonEvent 的有序和无序有什么区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>有序</strong>：通过 FLAG_OWNED_SYNC 等 flag 控制，按优先级顺序依次传递</li><li><strong>无序</strong>：同时传递给所有订阅者，不等待处理</li><li><strong>权限</strong>：有序需要权限，无序不需要</li><li><strong>使用场景</strong>：有序用于需要确认的场景（如系统关键事件），无序用于通知场景</li></ul><h3 id="q3-commonevent-的订阅限制" tabindex="-1">Q3: CommonEvent 的订阅限制？ <a class="header-anchor" href="#q3-commonevent-的订阅限制" aria-label="Permalink to &quot;Q3: CommonEvent 的订阅限制？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>同一应用对同一事件最多订阅 100 次</li><li>事件数据不超过 1MB</li><li>事件名需以 bundleName 为前缀</li><li>发布无序事件无需权限，有序需要 BROADCAST_COMMON 权限</li><li>系统级事件需要 SYSTEM_BROADCAST 权限</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：重点掌握 <strong>发布-订阅机制</strong>、<strong>有序/无序区别</strong>、<strong>权限控制</strong>。对比 Android Broadcast 时强调 <strong>异步执行</strong> 和 <strong>安全性</strong>。</p></blockquote>`,37)])])}const b=a(t,[["render",i]]);export{h as __pageData,b as default};
