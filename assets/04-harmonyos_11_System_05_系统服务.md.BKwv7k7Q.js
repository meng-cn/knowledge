import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const o=JSON.parse('{"title":"系统服务","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/11_System/05_系统服务.md","filePath":"04-harmonyos/11_System/05_系统服务.md"}'),e={name:"04-harmonyos/11_System/05_系统服务.md"};function l(t,s,h,r,k,c){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="系统服务" tabindex="-1">系统服务 <a class="header-anchor" href="#系统服务" aria-label="Permalink to &quot;系统服务&quot;">​</a></h1><h2 id="_1-系统服务架构" tabindex="-1">1. 系统服务架构 <a class="header-anchor" href="#_1-系统服务架构" aria-label="Permalink to &quot;1. 系统服务架构&quot;">​</a></h2><h3 id="_1-1-系统服务分层" tabindex="-1">1.1 系统服务分层 <a class="header-anchor" href="#_1-1-系统服务分层" aria-label="Permalink to &quot;1.1 系统服务分层&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>系统服务架构：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  框架层（Framework）                          │</span></span>
<span class="line"><span>│  ├── ArkUI Framework                         │</span></span>
<span class="line"><span>│  ├── ArkTS Runtime                           │</span></span>
<span class="line"><span>│  └── ArkBridge（ArkTS ↔ C++ 桥接）           │</span></span>
<span class="line"><span>├──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  系统服务层（System Services）                 │</span></span>
<span class="line"><span>│  ├── 核心系统服务                            │</span></span>
<span class="line"><span>│  │   ├── AMS (Ability Management Service)   │</span></span>
<span class="line"><span>│  │   ├── WMS (Window Management Service)    │</span></span>
<span class="line"><span>│  │   ├── PMS (Package Management Service)   │</span></span>
<span class="line"><span>│  │   └── IMS (Input Manager Service)        │</span></span>
<span class="line"><span>│  ├── 扩展系统服务                            │</span></span>
<span class="line"><span>│  │   ├── NMS (Notification Management)      │</span></span>
<span class="line"><span>│  │   ├── BMS (Battery Management)           │</span></span>
<span class="line"><span>│  │   ├── DAS (Distributed Ability Service)  │</span></span>
<span class="line"><span>│  │   └── HWS (Hardware Sensor Service)      │</span></span>
<span class="line"><span>│  └── 第三方服务                              │</span></span>
<span class="line"><span>│      └── 通过 system_ability_register 注册    │</span></span>
<span class="line"><span>├──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  服务管理（SA Manager）                        │</span></span>
<span class="line"><span>│  ├── system_ability_manager                  │</span></span>
<span class="line"><span>│  ├── service_registry                        │</span></span>
<span class="line"><span>│  └── capability_manager                      │</span></span>
<span class="line"><span>├──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  HDF 驱动层                                  │</span></span>
<span class="line"><span>│  ├── DriverFramework                         │</span></span>
<span class="line"><span>│  └── HAL                                     │</span></span>
<span class="line"><span>└──────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-系统服务注册与发现" tabindex="-1">1.2 系统服务注册与发现 <a class="header-anchor" href="#_1-2-系统服务注册与发现" aria-label="Permalink to &quot;1.2 系统服务注册与发现&quot;">​</a></h3><div class="language-cpp vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">cpp</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 系统服务通过 SystemAbility 框架注册</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 注册服务（C++ 端）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static_cast&lt;void&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SystemAbilityManagerClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">GetInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AddSystemAbility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;media.player&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;media_player&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;systemability&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 发现服务（C++ 端）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sp</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ISystemAbility</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> service </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SystemAbilityManagerClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">GetInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">GetSystemAbility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;media.player&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ArkTS 端调用系统服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">import { systemAbility } from </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@kit.AbilityKit&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 绑定系统服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">async function </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bindService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(serviceId: number) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> daAbility </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> await systemAbility.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createDAAbility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    want: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      deviceId: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      bundleName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;com.huawei.system&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      abilityName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SystemServiceAbility&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    callback: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      onConnect: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Service connected&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      onDisconnect: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Service disconnected&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_2-核心系统服务" tabindex="-1">2. 核心系统服务 <a class="header-anchor" href="#_2-核心系统服务" aria-label="Permalink to &quot;2. 核心系统服务&quot;">​</a></h2><h3 id="_2-1-ams-ability-management-service" tabindex="-1">2.1 AMS（Ability Management Service） <a class="header-anchor" href="#_2-1-ams-ability-management-service" aria-label="Permalink to &quot;2.1 AMS（Ability Management Service）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AMS 核心职责：</span></span>
<span class="line"><span>├── Ability 生命周期管理（create/destroy）</span></span>
<span class="line"><span>├── Ability 栈管理（返回栈/任务栈）</span></span>
<span class="line"><span>├── Ability 启动调度（启动模式/意图解析）</span></span>
<span class="line"><span>├── Ability 进程管理（进程创建/回收）</span></span>
<span class="line"><span>├── Ability 状态同步（前台/后台切换）</span></span>
<span class="line"><span>└── Ability 跨设备迁移（分布式）</span></span></code></pre></div><h3 id="_2-2-wms-window-management-service" tabindex="-1">2.2 WMS（Window Management Service） <a class="header-anchor" href="#_2-2-wms-window-management-service" aria-label="Permalink to &quot;2.2 WMS（Window Management Service）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>WMS 核心职责：</span></span>
<span class="line"><span>├── 窗口生命周期管理</span></span>
<span class="line"><span>├── 窗口布局计算（测量/布局/绘制）</span></span>
<span class="line"><span>├── 窗口动画管理（WindowAnimation）</span></span>
<span class="line"><span>├── 窗口栈管理（任务栏/浮动窗口）</span></span>
<span class="line"><span>├── 窗口安全控制（截图/录屏权限）</span></span>
<span class="line"><span>└── 多窗口管理（分屏/浮动）</span></span></code></pre></div><h3 id="_2-3-pms-package-management-service" tabindex="-1">2.3 PMS（Package Management Service） <a class="header-anchor" href="#_2-3-pms-package-management-service" aria-label="Permalink to &quot;2.3 PMS（Package Management Service）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>PMS 核心职责：</span></span>
<span class="line"><span>├── 应用包安装/卸载/更新</span></span>
<span class="line"><span>├── 权限管理（权限组/权限策略）</span></span>
<span class="line"><span>├── 组件解析（manifest 解析）</span></span>
<span class="line"><span>├── 签名验证</span></span>
<span class="line"><span>├── 包信息查询（包列表/安装信息）</span></span>
<span class="line"><span>└── 模块管理（HAR/HSP 模块解析）</span></span></code></pre></div><h3 id="_2-4-ims-input-manager-service" tabindex="-1">2.4 IMS（Input Manager Service） <a class="header-anchor" href="#_2-4-ims-input-manager-service" aria-label="Permalink to &quot;2.4 IMS（Input Manager Service）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>IMS 核心职责：</span></span>
<span class="line"><span>├── 输入事件采集（触摸/键盘/手柄）</span></span>
<span class="line"><span>├── 输入事件分发（到目标窗口）</span></span>
<span class="line"><span>├── 输入法管理（软键盘/硬件键盘）</span></span>
<span class="line"><span>├── 手势识别（滑动/长按/双击）</span></span>
<span class="line"><span>└── 事件拦截（拦截敏感事件）</span></span></code></pre></div><h2 id="_3-系统能力调用" tabindex="-1">3. 系统能力调用 <a class="header-anchor" href="#_3-系统能力调用" aria-label="Permalink to &quot;3. 系统能力调用&quot;">​</a></h2><h3 id="_3-1-abilitykit-系统能力" tabindex="-1">3.1 AbilityKit 系统能力 <a class="header-anchor" href="#_3-1-abilitykit-系统能力" aria-label="Permalink to &quot;3.1 AbilityKit 系统能力&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { app, common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 获取应用上下文</span></span>
<span class="line"><span>const context = this.getApplicationContext();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 启动 Ability</span></span>
<span class="line"><span>await context.startAbility({</span></span>
<span class="line"><span>  bundleName: &#39;com.example.target&#39;,</span></span>
<span class="line"><span>  abilityName: &#39;TargetAbility&#39;,</span></span>
<span class="line"><span>  parameters: {</span></span>
<span class="line"><span>    key1: &#39;value1&#39;,</span></span>
<span class="line"><span>    key2: 100</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 获取系统配置</span></span>
<span class="line"><span>const config = context.configuration;</span></span>
<span class="line"><span>console.log(\`Language: \${config.language}\`);</span></span>
<span class="line"><span>console.log(\`Region: \${config.country}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 应用生命周期回调</span></span>
<span class="line"><span>class MyApplication extends Application {</span></span>
<span class="line"><span>  onCreate() {</span></span>
<span class="line"><span>    console.log(&#39;Application created&#39;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  onWindowStageCreate(windowStage: app.WindowStage) {</span></span>
<span class="line"><span>    // 创建 UI</span></span>
<span class="line"><span>    windowStage.loadContent(&#39;pages/Index&#39;, (err) =&gt; {</span></span>
<span class="line"><span>      if (err) {</span></span>
<span class="line"><span>        console.error(&#39;Failed to load content&#39;);</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-2-common-模块系统能力" tabindex="-1">3.2 common 模块系统能力 <a class="header-anchor" href="#_3-2-common-模块系统能力" aria-label="Permalink to &quot;3.2 common 模块系统能力&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { common } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 获取设备信息</span></span>
<span class="line"><span>const deviceInfo = common.getDeviceSync();</span></span>
<span class="line"><span>console.log(&#39;Device ID: &#39; + deviceInfo.deviceId);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 应用状态管理</span></span>
<span class="line"><span>await common.setAppState({</span></span>
<span class="line"><span>  state: common.AppState.BACKGROUND</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 配置更新通知</span></span>
<span class="line"><span>common.on(&#39;configurationUpdated&#39;, (config) =&gt; {</span></span>
<span class="line"><span>  console.log(&#39;Config changed: &#39; + config.language);</span></span>
<span class="line"><span>});</span></span></code></pre></div><h3 id="_3-3-系统事件监听" tabindex="-1">3.3 系统事件监听 <a class="header-anchor" href="#_3-3-系统事件监听" aria-label="Permalink to &quot;3.3 系统事件监听&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 监听系统事件</span></span>
<span class="line"><span>import { appEvent } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 电池状态变化</span></span>
<span class="line"><span>appEvent.on(&#39;battery&#39;, (data: appEvent.BatteryEvent) =&gt; {</span></span>
<span class="line"><span>  if (data.state === appEvent.BatteryState.CHARGING) {</span></span>
<span class="line"><span>    console.log(&#39;Battery charging: &#39; + data.level + &#39;%&#39;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 网络状态变化</span></span>
<span class="line"><span>appEvent.on(&#39;network&#39;, (data: appEvent.NetworkEvent) =&gt; {</span></span>
<span class="line"><span>  console.log(&#39;Network changed: &#39; + data.type);</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 时间/时区变化</span></span>
<span class="line"><span>appEvent.on(&#39;timeZone&#39;, (data: appEvent.TimeZoneEvent) =&gt; {</span></span>
<span class="line"><span>  console.log(&#39;Timezone changed: &#39; + data.id);</span></span>
<span class="line"><span>});</span></span></code></pre></div><h2 id="_4-系统服务获取方式" tabindex="-1">4. 系统服务获取方式 <a class="header-anchor" href="#_4-系统服务获取方式" aria-label="Permalink to &quot;4. 系统服务获取方式&quot;">​</a></h2><h3 id="_4-1-通过-system-ability-获取" tabindex="-1">4.1 通过 system_ability 获取 <a class="header-anchor" href="#_4-1-通过-system-ability-获取" aria-label="Permalink to &quot;4.1 通过 system_ability 获取&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { systemAbility } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 获取系统服务代理</span></span>
<span class="line"><span>async function getSystemService(serviceName: string) {</span></span>
<span class="line"><span>  const saManager = systemAbility.getSystemAbilityManager();</span></span>
<span class="line"><span>  const service = saManager.getSystemAbility(serviceName);</span></span>
<span class="line"><span>  return service;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 常用系统服务名称</span></span>
<span class="line"><span>const SYSTEM_SERVICES = {</span></span>
<span class="line"><span>  &#39;abilityManager&#39;: &#39;ability_manager&#39;,</span></span>
<span class="line"><span>  &#39;windowManager&#39;: &#39;window_manager&#39;,</span></span>
<span class="line"><span>  &#39;packageManager&#39;: &#39;package_manager&#39;,</span></span>
<span class="line"><span>  &#39;inputManager&#39;: &#39;input_manager&#39;,</span></span>
<span class="line"><span>  &#39;notificationManager&#39;: &#39;notification_manager&#39;,</span></span>
<span class="line"><span>  &#39;deviceManager&#39;: &#39;device_manager&#39;,</span></span>
<span class="line"><span>  &#39;batteryManager&#39;: &#39;battery_manager&#39;,</span></span>
<span class="line"><span>  &#39;screenManager&#39;: &#39;screen_manager&#39;,</span></span>
<span class="line"><span>};</span></span></code></pre></div><h3 id="_4-2-通过-kit-api-获取" tabindex="-1">4.2 通过 Kit API 获取 <a class="header-anchor" href="#_4-2-通过-kit-api-获取" aria-label="Permalink to &quot;4.2 通过 Kit API 获取&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 大部分系统能力通过 @kit.* 模块提供</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 设备管理</span></span>
<span class="line"><span>import { deviceInfo } from &#39;@kit.DeviceKit&#39;;</span></span>
<span class="line"><span>const deviceModel = deviceInfo.getDeviceModel();</span></span>
<span class="line"><span>const deviceBrand = deviceInfo.getDeviceBrand();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 网络管理</span></span>
<span class="line"><span>import { net } from &#39;@kit.NetworkKit&#39;;</span></span>
<span class="line"><span>const networkInfo = net.getNetworkInfo();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 传感器</span></span>
<span class="line"><span>import { sensor } from &#39;@kit.SensorKit&#39;;</span></span>
<span class="line"><span>sensor.on(sensor.SensorType.ACCELEROMETER, (data) =&gt; {</span></span>
<span class="line"><span>  console.log(&#39;Accel: x=&#39; + data.x + &#39; y=&#39; + data.y + &#39; z=&#39; + data.z);</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 相机</span></span>
<span class="line"><span>import { camera } from &#39;@kit.CameraKit&#39;;</span></span>
<span class="line"><span>const cameraManager = camera.getCameraManager();</span></span></code></pre></div><h2 id="_5-自定义系统服务" tabindex="-1">5. 自定义系统服务 <a class="header-anchor" href="#_5-自定义系统服务" aria-label="Permalink to &quot;5. 自定义系统服务&quot;">​</a></h2><h3 id="_5-1-创建自定义系统服务" tabindex="-1">5.1 创建自定义系统服务 <a class="header-anchor" href="#_5-1-创建自定义系统服务" aria-label="Permalink to &quot;5.1 创建自定义系统服务&quot;">​</a></h3><div class="language-cpp vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">cpp</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// C++ 端：自定义系统服务</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyCustomService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ISystemAbility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  MyCustomService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int32_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> systemId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">bool</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> runningOnChildProcess</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      : </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ISystemAbility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(systemId, runningOnChildProcess) {}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  virtual</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OnStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">override</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 服务启动逻辑</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    SA_HILOGI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyCustomService started&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  virtual</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OnStop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">override</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 服务停止逻辑</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    SA_HILOGI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyCustomService stopped&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  virtual</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> bool</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ProcessRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">uint32_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> code</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                              const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MessageParcel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                              MessageParcel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> reply</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                              MessageOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">override</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (code) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CMD_GET_DATA:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 处理请求</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        reply.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">WriteString8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Hello from custom service&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ISystemAbility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ProcessRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(code, data, reply, option);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 注册服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">REGISTER_SYSTEM_ABILITY_BY_ID</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MyCustomService, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1001</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h3 id="_5-2-调用自定义服务" tabindex="-1">5.2 调用自定义服务 <a class="header-anchor" href="#_5-2-调用自定义服务" aria-label="Permalink to &quot;5.2 调用自定义服务&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// ArkTS 端：调用自定义系统服务</span></span>
<span class="line"><span>import { rpc } from &#39;@kit.BasicServicesKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function callCustomService() {</span></span>
<span class="line"><span>  const service = await rpc.SystemAbilityManager.getInstance()</span></span>
<span class="line"><span>    .getSystemAbility(1001);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 通过 IPC 调用</span></span>
<span class="line"><span>  const result = await service.invoke({</span></span>
<span class="line"><span>    code: 1001, // CMD_GET_DATA</span></span>
<span class="line"><span>    data: {}</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  console.log(&#39;Result: &#39; + result);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_6-系统服务-vs-android-系统服务" tabindex="-1">6. 系统服务 vs Android 系统服务 <a class="header-anchor" href="#_6-系统服务-vs-android-系统服务" aria-label="Permalink to &quot;6. 系统服务 vs Android 系统服务&quot;">​</a></h2><table tabindex="0"><thead><tr><th>维度</th><th>Android</th><th>鸿蒙</th></tr></thead><tbody><tr><td>服务管理</td><td>SystemServiceManager</td><td>SA Manager（SystemAbility）</td></tr><tr><td>服务注册</td><td>Java 注册</td><td>C++ register + SA 注册</td></tr><tr><td>服务发现</td><td>getServiceByName()</td><td>getSystemAbility()</td></tr><tr><td>通信机制</td><td>Binder IPC</td><td>Port + MQ / RPC</td></tr><tr><td>服务框架</td><td>AIDL + Binder</td><td>system_ability + IPC</td></tr><tr><td>生命周期</td><td>onCreate/onDestroy</td><td>OnStart/OnStop</td></tr><tr><td>服务分组</td><td>Group/Category</td><td>SystemAbility ID 范围</td></tr><tr><td>服务权限</td><td>权限组 + SELinux</td><td>TokenID + ATM + SELinux</td></tr></tbody></table><h2 id="_7-🎯-面试高频考点" tabindex="-1">7. 🎯 面试高频考点 <a class="header-anchor" href="#_7-🎯-面试高频考点" aria-label="Permalink to &quot;7. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙的系统服务架构与-android-的-systemserver-有什么区别" tabindex="-1">Q1: 鸿蒙的系统服务架构与 Android 的 SystemServer 有什么区别？ <a class="header-anchor" href="#q1-鸿蒙的系统服务架构与-android-的-systemserver-有什么区别" aria-label="Permalink to &quot;Q1: 鸿蒙的系统服务架构与 Android 的 SystemServer 有什么区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>鸿蒙通过 SA Manager 管理服务，Android 通过 SystemServiceManager</li><li>鸿蒙服务用 C++ 实现，Android 服务用 Java 实现</li><li>鸿蒙通过 system_ability_register 注册，Android 通过 addService</li><li>鸿蒙支持跨设备分布式服务，Android 服务局限于本地</li><li>鸿蒙服务生命周期由 OnStart/OnStop 管理，Android 由 onCreate/onDestroy</li></ul><h3 id="q2-如何获取和调用系统服务" tabindex="-1">Q2: 如何获取和调用系统服务？ <a class="header-anchor" href="#q2-如何获取和调用系统服务" aria-label="Permalink to &quot;Q2: 如何获取和调用系统服务？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>C++ 端：通过 SA Manager 的 getSystemAbility 获取</li><li>ArkTS 端：通过 @kit.* 模块直接调用（封装好的高层 API）</li><li>跨 Ability：通过 startAbility + Want 参数传递</li><li>服务注册：通过 REGISTER_SYSTEM_ABILITY_BY_ID 注册</li><li>权限验证：调用时 ATM 自动检查 TokenID 权限</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：掌握 <strong>SA Manager 架构</strong>、<strong>AMS/WMS/PMS 核心服务职责</strong>、<strong>系统能力调用方式</strong>。对比 Android 的 SystemServiceManager + Binder 体系。</p></blockquote>`,43)])])}const g=a(e,[["render",l]]);export{o as __pageData,g as default};
