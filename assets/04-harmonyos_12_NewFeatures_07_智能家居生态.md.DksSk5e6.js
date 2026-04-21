import{_ as a,o as n,c as p,ae as i}from"./chunks/framework.Czhw_PXq.js";const d=JSON.parse('{"title":"智能家居生态","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/12_NewFeatures/07_智能家居生态.md","filePath":"04-harmonyos/12_NewFeatures/07_智能家居生态.md"}'),l={name:"04-harmonyos/12_NewFeatures/07_智能家居生态.md"};function e(t,s,h,c,o,r){return n(),p("div",null,[...s[0]||(s[0]=[i(`<h1 id="智能家居生态" tabindex="-1">智能家居生态 <a class="header-anchor" href="#智能家居生态" aria-label="Permalink to &quot;智能家居生态&quot;">​</a></h1><h2 id="_1-鸿蒙智能家居生态概述" tabindex="-1">1. 鸿蒙智能家居生态概述 <a class="header-anchor" href="#_1-鸿蒙智能家居生态概述" aria-label="Permalink to &quot;1. 鸿蒙智能家居生态概述&quot;">​</a></h2><h3 id="_1-1-鸿蒙-iot-架构" tabindex="-1">1.1 鸿蒙 IoT 架构 <a class="header-anchor" href="#_1-1-鸿蒙-iot-架构" aria-label="Permalink to &quot;1.1 鸿蒙 IoT 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>鸿蒙 IoT 生态架构：</span></span>
<span class="line"><span>┌───────────────────────────────────────────┐</span></span>
<span class="line"><span>│  智能家居生态层                              │</span></span>
<span class="line"><span>│  ├── 智能家居设备（灯/空调/窗帘/锁/音箱等）  │</span></span>
<span class="line"><span>│  ├── 智能音箱（小艺音箱）                    │</span></span>
<span class="line"><span>│  ├── 智慧屏（电视/显示器）                   │</span></span>
<span class="line"><span>│  └── 全屋智能解决方案                        │</span></span>
<span class="line"><span>├───────────────────────────────────────────┤</span></span>
<span class="line"><span>│  鸿蒙分布式能力层                            │</span></span>
<span class="line"><span>│  ├── 分布式软总线（设备发现/连接/通信）      │</span></span>
<span class="line"><span>│  ├── 分布式数据（跨设备数据同步）            │</span></span>
<span class="line"><span>│  ├── 分布式 UI（跨设备 UI 迁移）            │</span></span>
<span class="line"><span>│  └── 分布式任务调度（跨设备任务执行）        │</span></span>
<span class="line"><span>├───────────────────────────────────────────┤</span></span>
<span class="line"><span>│  鸿蒙系统层                                  │</span></span>
<span class="line"><span>│  ├── HongMeng Kernel（轻量内核）            │</span></span>
<span class="line"><span>│  ├── ArkTS/ArkUI（跨设备统一开发）           │</span></span>
<span class="line"><span>│  └── HarmonyOS Connect（设备接入标准）       │</span></span>
<span class="line"><span>└───────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-鸿蒙-iot-设备分类" tabindex="-1">1.2 鸿蒙 IoT 设备分类 <a class="header-anchor" href="#_1-2-鸿蒙-iot-设备分类" aria-label="Permalink to &quot;1.2 鸿蒙 IoT 设备分类&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类别</th><th>设备类型</th><th>示例</th></tr></thead><tbody><tr><td>核心设备</td><td>手机/平板/智慧屏/音箱</td><td>Mate 60 / MatePad / Vision</td></tr><tr><td>环境设备</td><td>灯/空调/窗帘/净化器</td><td>智能灯/智能空调/智能窗帘</td></tr><tr><td>安防设备</td><td>摄像头/门锁/传感器</td><td>智能摄像头/智能门锁/门窗传感器</td></tr><tr><td>厨电设备</td><td>冰箱/烤箱/洗碗机</td><td>智能冰箱/智能烤箱</td></tr><tr><td>个人设备</td><td>手表/手环/耳机</td><td>Watch GT / FreeBuds</td></tr></tbody></table><h2 id="_2-分布式协同" tabindex="-1">2. 分布式协同 <a class="header-anchor" href="#_2-分布式协同" aria-label="Permalink to &quot;2. 分布式协同&quot;">​</a></h2><h3 id="_2-1-分布式软总线" tabindex="-1">2.1 分布式软总线 <a class="header-anchor" href="#_2-1-分布式软总线" aria-label="Permalink to &quot;2.1 分布式软总线&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>分布式软总线核心能力：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  设备发现                                            │</span></span>
<span class="line"><span>│  ├── mDNS 广播发现                                  │</span></span>
<span class="line"><span>│  ├── 蓝牙 LE 辅助发现                               │</span></span>
<span class="line"><span>│  └── 主动扫描发现                                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  设备连接                                            │</span></span>
<span class="line"><span>│  ├── P2P 直连（低延迟）                              │</span></span>
<span class="line"><span>│  ├── WiFi Direct 连接                              │</span></span>
<span class="line"><span>│  └── 蓝牙连接（低功耗）                              │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  统一通信管道                                        │</span></span>
<span class="line"><span>│  ├── 消息路由（设备间自动路由）                      │</span></span>
<span class="line"><span>│  ├── 传输优化（自适应带宽/延迟）                     │</span></span>
<span class="line"><span>│  └── 安全加密（端到端加密）                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-分布式-ui-迁移" tabindex="-1">2.2 分布式 UI 迁移 <a class="header-anchor" href="#_2-2-分布式-ui-迁移" aria-label="Permalink to &quot;2.2 分布式 UI 迁移&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>场景：手机上看视频 → 智慧屏播放</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. 用户点击&quot;投屏&quot;按钮                        │</span></span>
<span class="line"><span>│     → 检测到附近的智慧屏                        │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  2. 分布式 UI 迁移                              │</span></span>
<span class="line"><span>│     → 应用窗口从手机迁移到智慧屏                 │</span></span>
<span class="line"><span>│     → 视频播放状态保持（进度/音量）               │</span></span>
<span class="line"><span>│     → 音频自动切换到智慧屏扬声器                  │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  3. 跨设备控制                                  │</span></span>
<span class="line"><span>│     → 手机变为遥控器                             │</span></span>
<span class="line"><span>│     → 视频继续在智慧屏播放                       │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 分布式 UI 迁移示例</span></span>
<span class="line"><span>import { distributedAbility } from &#39;@kit.DistributedKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function castToScreen() {</span></span>
<span class="line"><span>  // 1. 发现智慧屏</span></span>
<span class="line"><span>  const screens = await distributedAbility.getDevices({</span></span>
<span class="line"><span>    capability: &#39;display&#39;,</span></span>
<span class="line"><span>    filter: { brand: &#39;huawei&#39; }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (screens.length === 0) return;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2. 迁移应用窗口</span></span>
<span class="line"><span>  const migration = await distributedAbility.castAbility({</span></span>
<span class="line"><span>    fromApp: &#39;com.example.myapp&#39;,</span></span>
<span class="line"><span>    toDevice: screens[0].deviceId,</span></span>
<span class="line"><span>    type: distributedAbility.CastType.VIDEO,</span></span>
<span class="line"><span>    state: {</span></span>
<span class="line"><span>      playPosition: this.videoPosition,</span></span>
<span class="line"><span>      volume: this.videoVolume</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (migration.success) {</span></span>
<span class="line"><span>    console.log(&#39;投屏成功&#39;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-3-分布式数据同步" tabindex="-1">2.3 分布式数据同步 <a class="header-anchor" href="#_2-3-分布式数据同步" aria-label="Permalink to &quot;2.3 分布式数据同步&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>分布式数据同步场景：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  跨设备数据同步                                      │</span></span>
<span class="line"><span>│  ├── 手机拍照 → 平板查看                            │</span></span>
<span class="line"><span>│  ├── 手机编辑文档 → 电脑继续                         │</span></span>
<span class="line"><span>│  ├── 手表心率 → 手机健康面板                        │</span></span>
<span class="line"><span>│  ├── 门锁状态 → 手机通知                            │</span></span>
<span class="line"><span>│  └── 空调设置 → 手机同步                            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 分布式 KV-Store 数据同步</span></span>
<span class="line"><span>import { distributedData } from &#39;@kit.DistributedKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 创建分布式 KV-Store</span></span>
<span class="line"><span>const store = await distributedData.createKVStore({</span></span>
<span class="line"><span>  appId: &#39;com.example.smartHome&#39;,</span></span>
<span class="line"><span>  config: {</span></span>
<span class="line"><span>    syncPolicy: distributedData.SyncPolicy.SYNC_POLICY_ALL,</span></span>
<span class="line"><span>    autoSync: true</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 写入数据（自动同步到所有设备）</span></span>
<span class="line"><span>await store.put(&#39;livingRoom.light&#39;, &#39;on&#39;);</span></span>
<span class="line"><span>await store.put(&#39;livingRoom.brightness&#39;, &#39;80&#39;);</span></span>
<span class="line"><span>await store.put(&#39;livingRoom.temperature&#39;, &#39;24&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 读取数据（本地优先，自动同步）</span></span>
<span class="line"><span>const lightState = await store.get(&#39;livingRoom.light&#39;);</span></span>
<span class="line"><span>if (lightState?.value === &#39;on&#39;) {</span></span>
<span class="line"><span>  this.turnOnLight();</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_3-智能家居设备接入" tabindex="-1">3. 智能家居设备接入 <a class="header-anchor" href="#_3-智能家居设备接入" aria-label="Permalink to &quot;3. 智能家居设备接入&quot;">​</a></h2><h3 id="_3-1-harmonyos-connect" tabindex="-1">3.1 HarmonyOS Connect <a class="header-anchor" href="#_3-1-harmonyos-connect" aria-label="Permalink to &quot;3.1 HarmonyOS Connect&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>HarmonyOS Connect 是鸿蒙的设备接入标准：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  设备接入流程                                        │</span></span>
<span class="line"><span>│  ├── 1. 设备认证（设备证书 + 产品 ID）             │</span></span>
<span class="line"><span>│  ├── 2. 设备配网（配网模式 + 手机引导）             │</span></span>
<span class="line"><span>│  ├── 3. 设备发现（mDNS + 蓝牙辅助）                │</span></span>
<span class="line"><span>│  ├── 4. 服务注册（设备能力描述注册）                │</span></span>
<span class="line"><span>│  └── 5. 设备联动（场景编排 + 自动化规则）           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-设备能力描述" tabindex="-1">3.2 设备能力描述 <a class="header-anchor" href="#_3-2-设备能力描述" aria-label="Permalink to &quot;3.2 设备能力描述&quot;">​</a></h3><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// device_capability.json</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;device&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;product_id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;smart_light_001&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;product_name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;智能灯&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;capabilities&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;light&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;switch&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;开关&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;access&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;read_write&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;brightness&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;number&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;亮度&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;range&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;min&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;max&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;step&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;color_temp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;number&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;色温&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;range&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;min&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2700</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;max&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6500</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;step&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;scene&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;enum&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;场景模式&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;values&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;reading&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;movie&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sleep&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;party&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-3-设备控制示例" tabindex="-1">3.3 设备控制示例 <a class="header-anchor" href="#_3-3-设备控制示例" aria-label="Permalink to &quot;3.3 设备控制示例&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 控制智能家居设备</span></span>
<span class="line"><span>import { deviceManager } from &#39;@kit.DistributedKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class SmartHomeController {</span></span>
<span class="line"><span>  // 1. 搜索设备</span></span>
<span class="line"><span>  async searchDevices(): Promise&lt;deviceManager.DeviceInfo[]&gt; {</span></span>
<span class="line"><span>    const devices = await deviceManager.scanDevices({</span></span>
<span class="line"><span>      serviceType: &#39;smart_light&#39;</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    return devices;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2. 控制设备</span></span>
<span class="line"><span>  async setLight(deviceId: string, brightness: number) {</span></span>
<span class="line"><span>    await deviceManager.invokeService(deviceId, &#39;setBrightness&#39;, {</span></span>
<span class="line"><span>      brightness: brightness</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 3. 场景联动</span></span>
<span class="line"><span>  async setScene(deviceIds: string[], scene: string) {</span></span>
<span class="line"><span>    for (const deviceId of deviceIds) {</span></span>
<span class="line"><span>      await deviceManager.invokeService(deviceId, &#39;setScene&#39;, {</span></span>
<span class="line"><span>        scene: scene</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 4. 自动化规则</span></span>
<span class="line"><span>  async createAutomation(condition: string, action: string) {</span></span>
<span class="line"><span>    await deviceManager.createAutomationRule({</span></span>
<span class="line"><span>      condition: condition,  // &quot;when light &lt; 30&quot;</span></span>
<span class="line"><span>      action: action         // &quot;then turn on lamp&quot;</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_4-全屋智能方案" tabindex="-1">4. 全屋智能方案 <a class="header-anchor" href="#_4-全屋智能方案" aria-label="Permalink to &quot;4. 全屋智能方案&quot;">​</a></h2><h3 id="_4-1-全屋智能架构" tabindex="-1">4.1 全屋智能架构 <a class="header-anchor" href="#_4-1-全屋智能架构" aria-label="Permalink to &quot;4.1 全屋智能架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>全屋智能方案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  控制中心（手机/音箱/智慧屏）                        │</span></span>
<span class="line"><span>│  ├── 场景编排（回家/离家/睡眠/观影）               │</span></span>
<span class="line"><span>│  ├── 设备管理（添加/删除/分组）                     │</span></span>
<span class="line"><span>│  └── 数据统计（能耗/使用习惯）                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  中枢网关（家庭中心）                                │</span></span>
<span class="line"><span>│  ├── 设备接入（Zigbee/BLE/Wi-Fi/星闪）            │</span></span>
<span class="line"><span>│  ├── 场景执行（自动化规则）                         │</span></span>
<span class="line"><span>│  ├── 数据同步（跨设备数据同步）                     │</span></span>
<span class="line"><span>│  └── 语音交互（小艺）                               │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  设备层                                              │</span></span>
<span class="line"><span>│  ├── 照明（智能灯/灯带/吸顶灯）                    │</span></span>
<span class="line"><span>│  ├── 安防（摄像头/门锁/传感器）                    │</span></span>
<span class="line"><span>│  ├── 环境（空调/新风/净化器）                      │</span></span>
<span class="line"><span>│  ├── 窗帘（电动窗帘/遮阳帘）                       │</span></span>
<span class="line"><span>│  └── 娱乐（音箱/电视/投影）                        │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-场景编排" tabindex="-1">4.2 场景编排 <a class="header-anchor" href="#_4-2-场景编排" aria-label="Permalink to &quot;4.2 场景编排&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 场景编排</span></span>
<span class="line"><span>import { sceneManager } from &#39;@kit.DistributedKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 回家场景</span></span>
<span class="line"><span>async function homeScene() {</span></span>
<span class="line"><span>  await sceneManager.executeScene(&#39;home&#39;, {</span></span>
<span class="line"><span>    livingRoom: { light: &#39;on&#39;, brightness: 80 },</span></span>
<span class="line"><span>    bedroom: { light: &#39;on&#39;, brightness: 60 },</span></span>
<span class="line"><span>    airConditioner: { temp: 24, mode: &#39;cool&#39; },</span></span>
<span class="line"><span>    curtain: { open: true }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 离家场景</span></span>
<span class="line"><span>async function leaveScene() {</span></span>
<span class="line"><span>  await sceneManager.executeScene(&#39;leave&#39;, {</span></span>
<span class="line"><span>    lights: &#39;off&#39;,</span></span>
<span class="line"><span>    airConditioner: &#39;off&#39;,</span></span>
<span class="line"><span>    curtain: &#39;close&#39;,</span></span>
<span class="line"><span>    camera: &#39;start&#39;,</span></span>
<span class="line"><span>    alarm: &#39;enable&#39;</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 睡眠场景</span></span>
<span class="line"><span>async function sleepScene() {</span></span>
<span class="line"><span>  await sceneManager.executeScene(&#39;sleep&#39;, {</span></span>
<span class="line"><span>    livingRoom: { light: &#39;off&#39; },</span></span>
<span class="line"><span>    bedroom: { light: &#39;on&#39;, brightness: 20, color: &#39;warm&#39; },</span></span>
<span class="line"><span>    airConditioner: { temp: 26, mode: &#39;sleep&#39; },</span></span>
<span class="line"><span>    curtain: &#39;close&#39;,</span></span>
<span class="line"><span>    nightLight: &#39;on&#39;</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 自定义场景</span></span>
<span class="line"><span>async function createCustomScene() {</span></span>
<span class="line"><span>  const scene = await sceneManager.createScene({</span></span>
<span class="line"><span>    name: &#39;Movie Night&#39;,</span></span>
<span class="line"><span>    trigger: &#39;voice&#39;,</span></span>
<span class="line"><span>    actions: [</span></span>
<span class="line"><span>      { device: &#39;livingRoom.light&#39;, action: &#39;setBrightness&#39;, value: 10 },</span></span>
<span class="line"><span>      { device: &#39;livingRoom.light&#39;, action: &#39;setColor&#39;, value: &#39;blue&#39; },</span></span>
<span class="line"><span>      { device: &#39;television&#39;, action: &#39;turnOn&#39; },</span></span>
<span class="line"><span>      { device: &#39;curtain&#39;, action: &#39;close&#39; },</span></span>
<span class="line"><span>      { device: &#39;airConditioner&#39;, action: &#39;setTemp&#39;, value: 25 }</span></span>
<span class="line"><span>    ]</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_5-智能家居开发" tabindex="-1">5. 智能家居开发 <a class="header-anchor" href="#_5-智能家居开发" aria-label="Permalink to &quot;5. 智能家居开发&quot;">​</a></h2><h3 id="_5-1-智能家居应用架构" tabindex="-1">5.1 智能家居应用架构 <a class="header-anchor" href="#_5-1-智能家居应用架构" aria-label="Permalink to &quot;5.1 智能家居应用架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>智能家居应用架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用层                                              │</span></span>
<span class="line"><span>│  ├── 设备控制面板                                    │</span></span>
<span class="line"><span>│  ├── 场景编排界面                                    │</span></span>
<span class="line"><span>│  ├── 数据统计面板                                    │</span></span>
<span class="line"><span>│  └── 语音控制界面                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  服务层                                              │</span></span>
<span class="line"><span>│  ├── 设备管理服务                                    │</span></span>
<span class="line"><span>│  ├── 场景管理服务                                    │</span></span>
<span class="line"><span>│  ├── 自动化规则管理                                  │</span></span>
<span class="line"><span>│  └── 数据统计服务                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  分布式层                                            │</span></span>
<span class="line"><span>│  ├── 设备发现/连接                                   │</span></span>
<span class="line"><span>│  ├── 数据同步                                        │</span></span>
<span class="line"><span>│  └── 远程指令下发                                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_6-🎯-面试高频考点" tabindex="-1">6. 🎯 面试高频考点 <a class="header-anchor" href="#_6-🎯-面试高频考点" aria-label="Permalink to &quot;6. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙分布式软总线的工作原理" tabindex="-1">Q1: 鸿蒙分布式软总线的工作原理？ <a class="header-anchor" href="#q1-鸿蒙分布式软总线的工作原理" aria-label="Permalink to &quot;Q1: 鸿蒙分布式软总线的工作原理？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>设备发现：mDNS 广播 + 蓝牙 LE 辅助</li><li>设备连接：P2P 直连 + WiFi Direct</li><li>统一通信管道：自动路由 + 传输优化</li><li>安全加密：端到端加密</li><li>跨设备通信延迟 &lt; 20ms</li><li>支持百设备并发</li></ul><h3 id="q2-分布式-ui-迁移的原理" tabindex="-1">Q2: 分布式 UI 迁移的原理？ <a class="header-anchor" href="#q2-分布式-ui-迁移的原理" aria-label="Permalink to &quot;Q2: 分布式 UI 迁移的原理？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>设备发现后建立连接</li><li>应用窗口状态序列化</li><li>跨设备迁移窗口状态</li><li>音频/视频/输入自动切换</li><li>操作连续性保持</li><li>手机变为遥控器</li></ul><h3 id="q3-全屋智能的核心技术" tabindex="-1">Q3: 全屋智能的核心技术？ <a class="header-anchor" href="#q3-全屋智能的核心技术" aria-label="Permalink to &quot;Q3: 全屋智能的核心技术？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>设备接入：HarmonyOS Connect 标准</li><li>场景编排：可视化场景模板 + 自定义</li><li>自动化规则：条件触发 + 动作执行</li><li>语音控制：小艺语音识别 + NLU</li><li>数据同步：分布式 KV-Store 跨设备同步</li><li>多屏协同：手机/智慧屏/音箱联动</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：智能家居是鸿蒙 IoT 生态的核心。重点掌握 <strong>分布式软总线</strong>、<strong>分布式 UI 迁移</strong>、<strong>HarmonyOS Connect 设备接入</strong>、<strong>场景编排</strong>。强调鸿蒙在 IoT 领域的统一架构优势。</p></blockquote>`,42)])])}const E=a(l,[["render",e]]);export{d as __pageData,E as default};
