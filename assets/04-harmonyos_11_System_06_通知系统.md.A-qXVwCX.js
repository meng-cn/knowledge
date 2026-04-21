import{_ as s,o as a,c as p,ae as i}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"通知系统（Notification）","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/11_System/06_通知系统.md","filePath":"04-harmonyos/11_System/06_通知系统.md"}'),e={name:"04-harmonyos/11_System/06_通知系统.md"};function l(t,n,c,o,r,d){return a(),p("div",null,[...n[0]||(n[0]=[i(`<h1 id="通知系统-notification" tabindex="-1">通知系统（Notification） <a class="header-anchor" href="#通知系统-notification" aria-label="Permalink to &quot;通知系统（Notification）&quot;">​</a></h1><h2 id="_1-通知系统架构" tabindex="-1">1. 通知系统架构 <a class="header-anchor" href="#_1-通知系统架构" aria-label="Permalink to &quot;1. 通知系统架构&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>通知系统架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用层                                     │</span></span>
<span class="line"><span>│  └── 构建 Notification                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Notification Manager                        │</span></span>
<span class="line"><span>│  ├── 通知渠道管理                            │</span></span>
<span class="line"><span>│  ├── 通知分类/优先级                         │</span></span>
<span class="line"><span>│  └── 通知聚合/折叠                           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Notification Service                        │</span></span>
<span class="line"><span>│  ├── 状态栏通知（StatusBar）                  │</span></span>
<span class="line"><span>│  ├── 横幅通知（Banner）                      │</span></span>
<span class="line"><span>│  ├── 锁屏通知                                │</span></span>
<span class="line"><span>│  └── 媒体通知                                │</span></span>
<span class="line"><span>├─────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  分发层                                      │</span></span>
<span class="line"><span>│  ├── 本地通知（推送）                        │</span></span>
<span class="line"><span>│  └── 远程通知（Push Kit）                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_2-通知类型" tabindex="-1">2. 通知类型 <a class="header-anchor" href="#_2-通知类型" aria-label="Permalink to &quot;2. 通知类型&quot;">​</a></h2><table tabindex="0"><thead><tr><th>类型</th><th>说明</th><th>展示位置</th></tr></thead><tbody><tr><td><strong>普通通知</strong></td><td>文本+图片+按钮</td><td>状态栏 + 通知抽屉</td></tr><tr><td><strong>横幅通知</strong></td><td>弹窗式通知，自动消失</td><td>屏幕顶部浮动</td></tr><tr><td><strong>大通知</strong></td><td>可展开的详细通知</td><td>状态栏 + 通知抽屉</td></tr><tr><td><strong>媒体通知</strong></td><td>音乐播放控制</td><td>媒体中心</td></tr><tr><td><strong>进度通知</strong></td><td>显示下载/上传进度</td><td>状态栏</td></tr><tr><td><strong>远程通知</strong></td><td>通过 Push Kit 推送</td><td>状态栏 + 通知抽屉</td></tr><tr><td><strong>表单通知</strong></td><td>卡片式通知（Form）</td><td>桌面/锁屏</td></tr></tbody></table><h2 id="_3-通知构建与发送" tabindex="-1">3. 通知构建与发送 <a class="header-anchor" href="#_3-通知构建与发送" aria-label="Permalink to &quot;3. 通知构建与发送&quot;">​</a></h2><h3 id="_3-1-本地通知" tabindex="-1">3.1 本地通知 <a class="header-anchor" href="#_3-1-本地通知" aria-label="Permalink to &quot;3.1 本地通知&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { notification } from &#39;@kit.BasicServicesKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 创建通知渠道（Android 10+ 必需）</span></span>
<span class="line"><span>const channelId = &#39;my_channel&#39;;</span></span>
<span class="line"><span>const channel: notification.NotificationChannel = {</span></span>
<span class="line"><span>  name: &#39;重要通知&#39;,</span></span>
<span class="line"><span>  channelDescription: &#39;用于重要事件的通知渠道&#39;,</span></span>
<span class="line"><span>  importance: notification.Importance.IMPORTANCE_HIGH, // 高重要性</span></span>
<span class="line"><span>  enableLights: true,</span></span>
<span class="line"><span>  lightColor: &#39;#FF0000&#39;,</span></span>
<span class="line"><span>  lockscreenVisibility: notification.LockscreenVisibility.VISIBILITY_PUBLIC,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 创建通知渠道</span></span>
<span class="line"><span>await notification.createNotificationChannel(channelId, channel);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 构建通知内容</span></span>
<span class="line"><span>const template: notification.NotificationContent = {</span></span>
<span class="line"><span>  normal: {</span></span>
<span class="line"><span>    title: &#39;新消息&#39;,</span></span>
<span class="line"><span>    text: &#39;您有一条新消息，点击查看&#39;,</span></span>
<span class="line"><span>    extraInfo: &#39;extra info&#39;,</span></span>
<span class="line"><span>    normalExtracInfo: {</span></span>
<span class="line"><span>      clickIntent: {</span></span>
<span class="line"><span>        parameters: {</span></span>
<span class="line"><span>          url: &#39;https://example.com&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      action: notification.Action.ACTION_TYPE_CLICK,</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  large: {</span></span>
<span class="line"><span>    title: &#39;新消息详情&#39;,</span></span>
<span class="line"><span>    largePicPath: &#39;/data/user/0/com.example/files/image.jpg&#39;,</span></span>
<span class="line"><span>    largeText: &#39;这是一条很长的通知内容，用于展示详细信息。&#39;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 创建并发送通知</span></span>
<span class="line"><span>const request: notification.Request = {</span></span>
<span class="line"><span>  content: template,</span></span>
<span class="line"><span>  id: 1001,</span></span>
<span class="line"><span>  channelId: channelId,</span></span>
<span class="line"><span>  normal: {</span></span>
<span class="line"><span>    advancedNormalContent: {</span></span>
<span class="line"><span>      clickIntent: {</span></span>
<span class="line"><span>        parameters: { url: &#39;https://example.com&#39; },</span></span>
<span class="line"><span>        action: notification.Action.ACTION_TYPE_CLICK</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await notification.publishNotification(request);</span></span></code></pre></div><h3 id="_3-2-横幅通知-banner" tabindex="-1">3.2 横幅通知（Banner） <a class="header-anchor" href="#_3-2-横幅通知-banner" aria-label="Permalink to &quot;3.2 横幅通知（Banner）&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { banner } from &#39;@kit.BasicServicesKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 创建横幅通知</span></span>
<span class="line"><span>const bannerRequest: banner.Request = {</span></span>
<span class="line"><span>  bannerType: banner.BannerType.NORMAL,</span></span>
<span class="line"><span>  template: {</span></span>
<span class="line"><span>    title: &#39;提示&#39;,</span></span>
<span class="line"><span>    text: &#39;这是一条横幅通知&#39;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  action: {</span></span>
<span class="line"><span>    clickIntent: {</span></span>
<span class="line"><span>      parameters: { type: &#39;banner_click&#39; },</span></span>
<span class="line"><span>      action: banner.Action.ACTION_TYPE_CLICK</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const bannerId = await banner.publish(bannerRequest);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 自动消失（3 秒后）</span></span>
<span class="line"><span>setTimeout(async () =&gt; {</span></span>
<span class="line"><span>  await banner.cancel(bannerId);</span></span>
<span class="line"><span>}, 3000);</span></span></code></pre></div><h3 id="_3-3-进度通知" tabindex="-1">3.3 进度通知 <a class="header-anchor" href="#_3-3-进度通知" aria-label="Permalink to &quot;3.3 进度通知&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { notification } from &#39;@kit.BasicServicesKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 进度通知（下载/上传）</span></span>
<span class="line"><span>const progressRequest: notification.Request = {</span></span>
<span class="line"><span>  content: {</span></span>
<span class="line"><span>    normal: {</span></span>
<span class="line"><span>      title: &#39;文件下载中&#39;,</span></span>
<span class="line"><span>      text: &#39;正在下载...&#39;,</span></span>
<span class="line"><span>      normalExtracInfo: {</span></span>
<span class="line"><span>        clickIntent: {</span></span>
<span class="line"><span>          parameters: { url: &#39;detail&#39; },</span></span>
<span class="line"><span>          action: notification.Action.ACTION_TYPE_CLICK</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  id: 2001,</span></span>
<span class="line"><span>  channelId: &#39;download_channel&#39;,</span></span>
<span class="line"><span>  normal: {</span></span>
<span class="line"><span>    progress: {</span></span>
<span class="line"><span>      max: 100,</span></span>
<span class="line"><span>      current: 50,</span></span>
<span class="line"><span>      style: notification.ProgressStyle.PROGRESS_STYLE_INDETERMINATE</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 更新进度</span></span>
<span class="line"><span>const updateRequest: notification.Request = {</span></span>
<span class="line"><span>  content: progressRequest.content,</span></span>
<span class="line"><span>  id: progressRequest.id,</span></span>
<span class="line"><span>  channelId: progressRequest.channelId,</span></span>
<span class="line"><span>  normal: {</span></span>
<span class="line"><span>    progress: {</span></span>
<span class="line"><span>      max: 100,</span></span>
<span class="line"><span>      current: 75, // 更新进度</span></span>
<span class="line"><span>      style: notification.ProgressStyle.PROGRESS_STYLE_NORMAL</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await notification.updateNotification(updateRequest);</span></span></code></pre></div><h2 id="_4-通知渠道管理" tabindex="-1">4. 通知渠道管理 <a class="header-anchor" href="#_4-通知渠道管理" aria-label="Permalink to &quot;4. 通知渠道管理&quot;">​</a></h2><h3 id="_4-1-渠道概念" tabindex="-1">4.1 渠道概念 <a class="header-anchor" href="#_4-1-渠道概念" aria-label="Permalink to &quot;4.1 渠道概念&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>通知渠道（Notification Channel）：</span></span>
<span class="line"><span>├── 应用可以创建多个渠道，每个渠道代表一类通知</span></span>
<span class="line"><span>├── 用户可以独立设置每个渠道的行为</span></span>
<span class="line"><span>├── 渠道一旦创建，只能修改不可见性（重要性和可关闭性）</span></span>
<span class="line"><span>├── 不同渠道可以有不同的重要性级别</span></span>
<span class="line"><span>└── 用户关闭渠道后，该渠道通知不再展示</span></span></code></pre></div><h3 id="_4-2-渠道配置" tabindex="-1">4.2 渠道配置 <a class="header-anchor" href="#_4-2-渠道配置" aria-label="Permalink to &quot;4.2 渠道配置&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { notification } from &#39;@kit.BasicServicesKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 重要性级别（从高到低）</span></span>
<span class="line"><span>const IMPORTANCE_LEVELS = {</span></span>
<span class="line"><span>  MAX:       notification.Importance.MAX,     // 震动 + 响铃 + 横幅</span></span>
<span class="line"><span>  HIGH:      notification.Importance.HIGH,    // 响铃 + 横幅</span></span>
<span class="line"><span>  NORMAL:    notification.Importance.NORMAL,  // 横幅</span></span>
<span class="line"><span>  LOW:       notification.Importance.LOW,     // 仅状态栏</span></span>
<span class="line"><span>  MIN:       notification.Importance.MIN,     // 不展示（仅通知抽屉）</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 创建多个渠道</span></span>
<span class="line"><span>const channels: notification.NotificationChannel[] = [</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;消息通知&#39;,</span></span>
<span class="line"><span>    channelDescription: &#39;消息相关通知&#39;,</span></span>
<span class="line"><span>    importance: notification.Importance.HIGH,</span></span>
<span class="line"><span>    enableVibration: true,</span></span>
<span class="line"><span>    lockscreenVisibility: notification.LockscreenVisibility.VISIBILITY_PUBLIC,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;系统通知&#39;,</span></span>
<span class="line"><span>    channelDescription: &#39;系统相关通知&#39;,</span></span>
<span class="line"><span>    importance: notification.Importance.NORMAL,</span></span>
<span class="line"><span>    lockscreenVisibility: notification.LockscreenVisibility.VISIBILITY_PRIVATE,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;推广通知&#39;,</span></span>
<span class="line"><span>    channelDescription: &#39;营销推广通知&#39;,</span></span>
<span class="line"><span>    importance: notification.Importance.LOW,</span></span>
<span class="line"><span>    lockscreenVisibility: notification.LockscreenVisibility.VISIBILITY_SECRET,</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const channel of channels) {</span></span>
<span class="line"><span>  await notification.createNotificationChannel(&#39;channel_&#39; + channel.name, channel);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_5-远程通知-push-kit" tabindex="-1">5. 远程通知（Push Kit） <a class="header-anchor" href="#_5-远程通知-push-kit" aria-label="Permalink to &quot;5. 远程通知（Push Kit）&quot;">​</a></h2><h3 id="_5-1-push-kit-架构" tabindex="-1">5.1 Push Kit 架构 <a class="header-anchor" href="#_5-1-push-kit-架构" aria-label="Permalink to &quot;5.1 Push Kit 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Push Kit 推送流程：</span></span>
<span class="line"><span>┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐</span></span>
<span class="line"><span>│ 服务端    │─────│ Agconnect │─────│ 推送服务  │─────│ 设备端   │</span></span>
<span class="line"><span>│  (APNs)  │     │ (AGC)    │     │ (HMS/Push)│     │ (App)    │</span></span>
<span class="line"><span>└──────────┘     └──────────┘     └──────────┘     └──────────┘</span></span>
<span class="line"><span>     │                │                │                │</span></span>
<span class="line"><span>     └──────── 云端消息通道 ──────────────┘</span></span></code></pre></div><h3 id="_5-2-push-kit-配置" tabindex="-1">5.2 Push Kit 配置 <a class="header-anchor" href="#_5-2-push-kit-配置" aria-label="Permalink to &quot;5.2 Push Kit 配置&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 在 module.json5 中声明权限</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  &quot;reqPermissions&quot;: [</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      &quot;name&quot;: &quot;ohos.permission.INTERNET&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  ]</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 初始化 Push Kit</span></span>
<span class="line"><span>import { push } from &#39;@kit.PushKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function initPush() {</span></span>
<span class="line"><span>  // 获取推送 Token</span></span>
<span class="line"><span>  const token = await push.getToken();</span></span>
<span class="line"><span>  console.log(&#39;Push Token: &#39; + token);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 监听 Token 刷新</span></span>
<span class="line"><span>  push.on(&#39;token&#39;, (newToken: string) =&gt; {</span></span>
<span class="line"><span>    console.log(&#39;Token refreshed: &#39; + newToken);</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 监听消息（App 在前台时）</span></span>
<span class="line"><span>  push.on(&#39;message&#39;, (msg: push.PushMessage) =&gt; {</span></span>
<span class="line"><span>    if (msg.data) {</span></span>
<span class="line"><span>      console.log(&#39;Push data: &#39; + msg.data);</span></span>
<span class="line"><span>      // 收到前台推送，可显示本地通知</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 处理通知点击</span></span>
<span class="line"><span>push.on(&#39;click&#39;, (msg: push.PushMessage) =&gt; {</span></span>
<span class="line"><span>  // 用户点击通知，执行对应操作</span></span>
<span class="line"><span>  router.pushUrl({</span></span>
<span class="line"><span>    url: &#39;pages/Detail&#39;,</span></span>
<span class="line"><span>    params: { data: msg.data }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>});</span></span></code></pre></div><h3 id="_5-3-通知消息处理" tabindex="-1">5.3 通知消息处理 <a class="header-anchor" href="#_5-3-通知消息处理" aria-label="Permalink to &quot;5.3 通知消息处理&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 消息处理策略</span></span>
<span class="line"><span>enum PushMessageHandler {</span></span>
<span class="line"><span>  // 1. 自动展示（默认）</span></span>
<span class="line"><span>  // 不需要额外代码，系统自动展示通知</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2. 自定义处理（前台消息）</span></span>
<span class="line"><span>  onMessage(msg: push.PushMessage) {</span></span>
<span class="line"><span>    // 根据消息类型做不同处理</span></span>
<span class="line"><span>    switch (msg.type) {</span></span>
<span class="line"><span>      case &#39;message&#39;:</span></span>
<span class="line"><span>        showLocalNotification(msg);</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      case &#39;command&#39;:</span></span>
<span class="line"><span>        handleCommand(msg.data);</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      case &#39;silent&#39;:</span></span>
<span class="line"><span>        // 静默消息，不展示通知，只更新数据</span></span>
<span class="line"><span>        updateData(msg.data);</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_6-通知与-android-对比" tabindex="-1">6. 通知与 Android 对比 <a class="header-anchor" href="#_6-通知与-android-对比" aria-label="Permalink to &quot;6. 通知与 Android 对比&quot;">​</a></h2><table tabindex="0"><thead><tr><th>维度</th><th>Android</th><th>鸿蒙</th></tr></thead><tbody><tr><td>通知构建</td><td>Notification.Builder</td><td>notification.NotificationBuilder</td></tr><tr><td>通知渠道</td><td>NotificationChannel</td><td>NotificationChannel</td></tr><tr><td>横幅通知</td><td>原生支持</td><td>Banner API</td></tr><tr><td>远程推送</td><td>FCM / 厂商 Push</td><td>Push Kit (AGC)</td></tr><tr><td>通知点击</td><td>PendingIntent</td><td>clickIntent (Want)</td></tr><tr><td>大通知</td><td>setStyle(Notif.BigText)</td><td>large 属性</td></tr><tr><td>进度通知</td><td>setProgress()</td><td>normal.progress</td></tr><tr><td>通知渠道创建</td><td>代码创建（不可删除）</td><td>代码创建（仅可不可见）</td></tr></tbody></table><h2 id="_7-🎯-面试高频考点" tabindex="-1">7. 🎯 面试高频考点 <a class="header-anchor" href="#_7-🎯-面试高频考点" aria-label="Permalink to &quot;7. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙通知系统的工作原理" tabindex="-1">Q1: 鸿蒙通知系统的工作原理？ <a class="header-anchor" href="#q1-鸿蒙通知系统的工作原理" aria-label="Permalink to &quot;Q1: 鸿蒙通知系统的工作原理？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>通知通过 Notification Manager 管理，分为本地通知和远程通知</li><li>本地通知通过 notification.publishNotification() 发送</li><li>远程通知通过 Push Kit 实现，通过云端（AGC）推送</li><li>通知渠道是 Android 10+ 的概念，鸿蒙同样采用</li><li>用户可在设置中管理每个渠道的展示行为</li><li>通知可包含点击 Intent，跳转到指定页面</li></ul><h3 id="q2-push-kit-与-fcm-的区别" tabindex="-1">Q2: Push Kit 与 FCM 的区别？ <a class="header-anchor" href="#q2-push-kit-与-fcm-的区别" aria-label="Permalink to &quot;Q2: Push Kit 与 FCM 的区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>Push Kit 是鸿蒙生态的推送服务，通过 AGC（AppGallery Connect）</li><li>FCM 是 Google 的推送服务，鸿蒙 NEXT 不再支持 GMS/FCM</li><li>Push Kit 支持国内网络环境，FCM 在国内不可用</li><li>Push Kit 的 Token 通过 AGC SDK 获取，FCM 通过 Firebase SDK</li><li>Push Kit 支持消息类型：消息/指令/静默</li></ul><h3 id="q3-如何实现通知的自定义样式" tabindex="-1">Q3: 如何实现通知的自定义样式？ <a class="header-anchor" href="#q3-如何实现通知的自定义样式" aria-label="Permalink to &quot;Q3: 如何实现通知的自定义样式？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>通过 NotificationTemplate 定义样式（normal/large/banner）</li><li>使用 large 属性实现大通知（大图/长文本）</li><li>使用 Banner API 实现横幅通知</li><li>使用 action 属性添加通知内按钮</li><li>使用 clickIntent 实现点击跳转</li><li>通过 importance 控制通知的重要性级别</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：重点掌握 <strong>通知渠道</strong>、<strong>本地/远程通知区别</strong>、<strong>Push Kit 推送流程</strong>。对比 Android 的 Notification 体系。</p></blockquote>`,38)])])}const g=s(e,[["render",l]]);export{u as __pageData,g as default};
