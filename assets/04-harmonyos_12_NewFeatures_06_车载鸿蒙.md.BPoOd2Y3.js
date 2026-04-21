import{_ as n,o as a,c as p,ae as l}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"车载鸿蒙","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/12_NewFeatures/06_车载鸿蒙.md","filePath":"04-harmonyos/12_NewFeatures/06_车载鸿蒙.md"}'),e={name:"04-harmonyos/12_NewFeatures/06_车载鸿蒙.md"};function i(t,s,c,o,r,d){return a(),p("div",null,[...s[0]||(s[0]=[l(`<h1 id="车载鸿蒙" tabindex="-1">车载鸿蒙 <a class="header-anchor" href="#车载鸿蒙" aria-label="Permalink to &quot;车载鸿蒙&quot;">​</a></h1><h2 id="_1-车载鸿蒙概述" tabindex="-1">1. 车载鸿蒙概述 <a class="header-anchor" href="#_1-车载鸿蒙概述" aria-label="Permalink to &quot;1. 车载鸿蒙概述&quot;">​</a></h2><h3 id="_1-1-harmonyos-for-automotive" tabindex="-1">1.1 HarmonyOS for Automotive <a class="header-anchor" href="#_1-1-harmonyos-for-automotive" aria-label="Permalink to &quot;1.1 HarmonyOS for Automotive&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>HarmonyOS for Automotive 架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  车载鸿蒙应用层                                   │</span></span>
<span class="line"><span>│  ├── 车机应用（导航/音乐/通讯）                   │</span></span>
<span class="line"><span>│  ├── 座舱 HMI（仪表盘/中控/后屏）                 │</span></span>
<span class="line"><span>│  └── 第三方应用（游戏/办公/影音）                 │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  车载框架层                                      │</span></span>
<span class="line"><span>│  ├── ArkUI（座舱 UI 框架）                       │</span></span>
<span class="line"><span>│  ├── 车载框架 API（车辆控制/传感器/通信）        │</span></span>
<span class="line"><span>│  ├── 分布式能力（手机-车机协同）                 │</span></span>
<span class="line"><span>│  └── AI 能力（语音/视觉/导航）                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  车载中间件                                      │</span></span>
<span class="line"><span>│  ├── 车载系统服务（电源/空调/车窗）              │</span></span>
<span class="line"><span>│  ├── 车载安全（ADAS/安全域隔离）                 │</span></span>
<span class="line"><span>│  ├── OTA 升级（空中下载）                        │</span></span>
<span class="line"><span>│  └── 多域融合（座舱域/智驾域/车身域）           │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  车载内核/驱动                                   │</span></span>
<span class="line"><span>│  ├── HongMeng Kernel（车载实时内核）             │</span></span>
<span class="line"><span>│  ├── HDF 车载驱动（传感器/执行器）               │</span></span>
<span class="line"><span>│  └── 车载通信（车载以太网/车载 CAN）             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-车载鸿蒙-vs-android-auto-carplay" tabindex="-1">1.2 车载鸿蒙 vs Android Auto/CarPlay <a class="header-anchor" href="#_1-2-车载鸿蒙-vs-android-auto-carplay" aria-label="Permalink to &quot;1.2 车载鸿蒙 vs Android Auto/CarPlay&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>车载鸿蒙</th><th>Android Auto</th><th>CarPlay</th></tr></thead><tbody><tr><td>架构</td><td>原生车载系统</td><td>手机投屏</td><td>手机投屏</td></tr><tr><td>深度集成</td><td>车辆 API 直接集成</td><td>有限 API</td><td>有限 API</td></tr><tr><td>自定义</td><td>高度自定义 HMI</td><td>固定 UI 模板</td><td>固定 UI 模板</td></tr><tr><td>性能</td><td>原生应用，高性能</td><td>受限于手机性能</td><td>受限于手机性能</td></tr><tr><td>离线能力</td><td>完全离线可用</td><td>依赖手机网络</td><td>依赖手机网络</td></tr><tr><td>车机厂商</td><td>OEM 深度定制</td><td>第三方适配</td><td>第三方适配</td></tr><tr><td>AI 集成</td><td>小艺车载</td><td>Google AI</td><td>Siri</td></tr><tr><td>生态</td><td>鸿蒙生态（元服务）</td><td>Google 生态</td><td>Apple 生态</td></tr></tbody></table><h2 id="_2-车机应用开发" tabindex="-1">2. 车机应用开发 <a class="header-anchor" href="#_2-车机应用开发" aria-label="Permalink to &quot;2. 车机应用开发&quot;">​</a></h2><h3 id="_2-1-车载应用模型" tabindex="-1">2.1 车载应用模型 <a class="header-anchor" href="#_2-1-车载应用模型" aria-label="Permalink to &quot;2.1 车载应用模型&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>车机应用模型：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  UIAbility（车机页面入口）                          │</span></span>
<span class="line"><span>│  ├── 仪表盘页面                                    │</span></span>
<span class="line"><span>│  ├── 中控页面                                      │</span></span>
<span class="line"><span>│  ├── 后屏页面                                      │</span></span>
<span class="line"><span>│  └── HUD 页面                                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  车载 ExtensionAbility                             │</span></span>
<span class="line"><span>│  ├── VehicleExtensionAbility（车辆控制）           │</span></span>
<span class="line"><span>│  ├── AudioExtensionAbility（音频管理）             │</span></span>
<span class="line"><span>│  ├── NavigationExtensionAbility（导航管理）        │</span></span>
<span class="line"><span>│  └── DisplayExtensionAbility（显示管理）           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-车载-ui-开发" tabindex="-1">2.2 车载 UI 开发 <a class="header-anchor" href="#_2-2-车载-ui-开发" aria-label="Permalink to &quot;2.2 车载 UI 开发&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 车机仪表盘组件</span></span>
<span class="line"><span>@Entry</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct Dashboard {</span></span>
<span class="line"><span>  @State speed: number = 0;</span></span>
<span class="line"><span>  @State battery: number = 85;</span></span>
<span class="line"><span>  @State navigation: NavigationInfo = new NavigationInfo();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Row() {</span></span>
<span class="line"><span>      // 左侧速度表</span></span>
<span class="line"><span>      Speedometer({ speed: this.speed })</span></span>
<span class="line"><span>        .width(280)</span></span>
<span class="line"><span>        .height(280)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 中间导航信息</span></span>
<span class="line"><span>      Column() {</span></span>
<span class="line"><span>        NavigationInfo({</span></span>
<span class="line"><span>          destination: this.navigation.destination,</span></span>
<span class="line"><span>          eta: this.navigation.eta,</span></span>
<span class="line"><span>          distance: this.navigation.distance</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .width(&#39;40%&#39;)</span></span>
<span class="line"><span>      .height(&#39;100%&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 右侧状态卡片</span></span>
<span class="line"><span>      Column() {</span></span>
<span class="line"><span>        StateCard({ title: &#39;电量&#39;, value: this.battery + &#39;%&#39;, icon: &#39;🔋&#39; })</span></span>
<span class="line"><span>        StateCard({ title: &#39;里程&#39;, value: &#39;12,580&#39;, icon: &#39;🚗&#39; })</span></span>
<span class="line"><span>        StateCard({ title: &#39;温度&#39;, value: &#39;24°C&#39;, icon: &#39;🌡️&#39; })</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .width(200)</span></span>
<span class="line"><span>      .height(&#39;100%&#39;)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    .width(&#39;100%&#39;)</span></span>
<span class="line"><span>    .height(&#39;100%&#39;)</span></span>
<span class="line"><span>    .backgroundColor(&#39;#1a1a2e&#39;)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 速度表组件</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>struct Speedometer {</span></span>
<span class="line"><span>  @Prop speed: number = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  build() {</span></span>
<span class="line"><span>    Column() {</span></span>
<span class="line"><span>      // 圆形速度显示</span></span>
<span class="line"><span>      Canvas((ctx: CanvasRenderingContext2D) =&gt; {</span></span>
<span class="line"><span>        // 绘制速度圆环</span></span>
<span class="line"><span>        ctx.beginPath();</span></span>
<span class="line"><span>        ctx.arc(140, 140, 100, -Math.PI / 2, -Math.PI / 2 + (this.speed / 200) * Math.PI * 2);</span></span>
<span class="line"><span>        ctx.lineWidth = 20;</span></span>
<span class="line"><span>        ctx.strokeStyle = this.speed &gt; 120 ? &#39;#ff4444&#39; : &#39;#4488ff&#39;;</span></span>
<span class="line"><span>        ctx.stroke();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 绘制速度数值</span></span>
<span class="line"><span>        ctx.fillStyle = &#39;#ffffff&#39;;</span></span>
<span class="line"><span>        ctx.font = &#39;48px Arial&#39;;</span></span>
<span class="line"><span>        ctx.textAlign = &#39;center&#39;;</span></span>
<span class="line"><span>        ctx.fillText(String(this.speed), 140, 160);</span></span>
<span class="line"><span>        ctx.font = &#39;16px Arial&#39;;</span></span>
<span class="line"><span>        ctx.fillText(&#39;km/h&#39;, 140, 185);</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>      .width(280)</span></span>
<span class="line"><span>      .height(280)</span></span>
<span class="line"><span>      .borderRadius(140)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-3-车载传感器接入" tabindex="-1">2.3 车载传感器接入 <a class="header-anchor" href="#_2-3-车载传感器接入" aria-label="Permalink to &quot;2.3 车载传感器接入&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 车载传感器数据接入</span></span>
<span class="line"><span>import { vehicleSensor } from &#39;@kit.VehicleKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class VehicleSensorService {</span></span>
<span class="line"><span>  private speedSubscription: number = 0;</span></span>
<span class="line"><span>  private batterySubscription: number = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async initSensors() {</span></span>
<span class="line"><span>    // 订阅车速</span></span>
<span class="line"><span>    this.speedSubscription = await vehicleSensor.subscribe(</span></span>
<span class="line"><span>      vehicleSensor.SensorType.SPEED,</span></span>
<span class="line"><span>      (data: vehicleSensor.SensorData) =&gt; {</span></span>
<span class="line"><span>        console.log(\`Speed: \${data.value} km/h\`);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 订阅电量</span></span>
<span class="line"><span>    this.batterySubscription = await vehicleSensor.subscribe(</span></span>
<span class="line"><span>      vehicleSensor.SensorType.BATTERY_LEVEL,</span></span>
<span class="line"><span>      (data: vehicleSensor.SensorData) =&gt; {</span></span>
<span class="line"><span>        console.log(\`Battery: \${data.value}%\`);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async unsubscribe() {</span></span>
<span class="line"><span>    await vehicleSensor.unsubscribe(this.speedSubscription);</span></span>
<span class="line"><span>    await vehicleSensor.unsubscribe(this.batterySubscription);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-4-车机与手机协同" tabindex="-1">2.4 车机与手机协同 <a class="header-anchor" href="#_2-4-车机与手机协同" aria-label="Permalink to &quot;2.4 车机与手机协同&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 车机与手机分布式协同</span></span>
<span class="line"><span>import { distributedAbility } from &#39;@kit.DistributedKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 手机 → 车机：导航投屏</span></span>
<span class="line"><span>async function castToCar(phoneUri: string) {</span></span>
<span class="line"><span>  const carDevices = await distributedAbility.getCarDevices();</span></span>
<span class="line"><span>  if (carDevices.length &gt; 0) {</span></span>
<span class="line"><span>    await distributedAbility.castAbility({</span></span>
<span class="line"><span>      fromApp: phoneUri,</span></span>
<span class="line"><span>      toDevice: carDevices[0].deviceId,</span></span>
<span class="line"><span>      type: distributedAbility.CastType.NAVIGATION</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 车机 → 手机：音乐续播</span></span>
<span class="line"><span>async function musicContinuity() {</span></span>
<span class="line"><span>  const phone = await distributedAbility.findPhoneDevice();</span></span>
<span class="line"><span>  if (phone) {</span></span>
<span class="line"><span>    await distributedAbility.transferAbility({</span></span>
<span class="line"><span>      fromDevice: &#39;car&#39;,</span></span>
<span class="line"><span>      toDevice: phone.deviceId,</span></span>
<span class="line"><span>      want: {</span></span>
<span class="line"><span>        bundleName: &#39;com.example.music&#39;,</span></span>
<span class="line"><span>        abilityName: &#39;MusicAbility&#39;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 手机 → 车机：日历同步</span></span>
<span class="line"><span>async function syncCalendar() {</span></span>
<span class="line"><span>  await distributedAbility.syncData({</span></span>
<span class="line"><span>    dataType: &#39;calendar&#39;,</span></span>
<span class="line"><span>    deviceId: &#39;car-device-id&#39;</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_3-车载-hmi-设计" tabindex="-1">3. 车载 HMI 设计 <a class="header-anchor" href="#_3-车载-hmi-设计" aria-label="Permalink to &quot;3. 车载 HMI 设计&quot;">​</a></h2><h3 id="_3-1-车载-hmi-设计原则" tabindex="-1">3.1 车载 HMI 设计原则 <a class="header-anchor" href="#_3-1-车载-hmi-设计原则" aria-label="Permalink to &quot;3.1 车载 HMI 设计原则&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>车载 HMI 设计原则：</span></span>
<span class="line"><span>├── 安全优先：驾驶时减少分心，关键信息一目了然</span></span>
<span class="line"><span>├── 简洁布局：信息密度适中，避免信息过载</span></span>
<span class="line"><span>├── 大图标/大字体：驾驶中需远距离识别</span></span>
<span class="line"><span>├── 语音优先：关键操作通过语音完成</span></span>
<span class="line"><span>├── 暗色主题：减少驾驶时的屏幕眩光</span></span>
<span class="line"><span>├── 实时反馈：操作后立即显示反馈</span></span>
<span class="line"><span>├── 断网可用：离线场景核心功能可用</span></span>
<span class="line"><span>└── 多屏协同：仪表盘/中控/后屏/HUD 协同</span></span></code></pre></div><h3 id="_3-2-多屏协同" tabindex="-1">3.2 多屏协同 <a class="header-anchor" href="#_3-2-多屏协同" aria-label="Permalink to &quot;3.2 多屏协同&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>多屏协同架构：</span></span>
<span class="line"><span>┌──────────────┐  ┌──────────────────┐  ┌──────────────┐</span></span>
<span class="line"><span>│  仪表盘      │  │  中控屏          │  │  后屏        │</span></span>
<span class="line"><span>│  (驾驶信息)  │──│  (导航/多媒体)   │──│  (娱乐/控制) │</span></span>
<span class="line"><span>│              │  │                  │  │              │</span></span>
<span class="line"><span>│  速度/转速   │  │  导航            │  │  视频        │</span></span>
<span class="line"><span>│  电量/里程   │  │  音乐            │  │  空调控制    │</span></span>
<span class="line"><span>│  驾驶辅助    │  │  电话            │  │  座椅控制    │</span></span>
<span class="line"><span>│  警示信息    │  │  设置            │  │  后排娱乐    │</span></span>
<span class="line"><span>└──────────────┘  └──────────────────┘  └──────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>多屏协同能力：</span></span>
<span class="line"><span>├── 跨屏拖拽：导航从手机拖到中控屏</span></span>
<span class="line"><span>├── 多屏联动：中控屏选音乐，后屏显示歌词</span></span>
<span class="line"><span>├── 屏间切换：导航信息自动显示到仪表盘</span></span>
<span class="line"><span>└── 内容迁移：应用窗口在屏间迁移</span></span></code></pre></div><h2 id="_4-车载开发工具" tabindex="-1">4. 车载开发工具 <a class="header-anchor" href="#_4-车载开发工具" aria-label="Permalink to &quot;4. 车载开发工具&quot;">​</a></h2><h3 id="_4-1-deveco-studio-车载开发支持" tabindex="-1">4.1 DevEco Studio 车载开发支持 <a class="header-anchor" href="#_4-1-deveco-studio-车载开发支持" aria-label="Permalink to &quot;4.1 DevEco Studio 车载开发支持&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DevEco Studio 车载开发工具：</span></span>
<span class="line"><span>├── 车载模拟器：模拟不同车机屏幕</span></span>
<span class="line"><span>├── 车载 HMI 预览：多屏同时预览</span></span>
<span class="line"><span>├── 车载 API 检查：车辆 API 兼容性检查</span></span>
<span class="line"><span>├── 传感器模拟：模拟车速/电量/温度等</span></span>
<span class="line"><span>├── 性能分析：车载应用性能监控</span></span>
<span class="line"><span>└── OTA 调试：OTA 升级调试</span></span></code></pre></div><h2 id="_5-🎯-面试高频考点" tabindex="-1">5. 🎯 面试高频考点 <a class="header-anchor" href="#_5-🎯-面试高频考点" aria-label="Permalink to &quot;5. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-车载鸿蒙与-android-auto-carplay-的区别" tabindex="-1">Q1: 车载鸿蒙与 Android Auto/CarPlay 的区别？ <a class="header-anchor" href="#q1-车载鸿蒙与-android-auto-carplay-的区别" aria-label="Permalink to &quot;Q1: 车载鸿蒙与 Android Auto/CarPlay 的区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>架构</strong>：车载鸿蒙是原生车载系统，Android Auto/CarPlay 是手机投屏</li><li><strong>深度集成</strong>：车载鸿蒙直接集成车辆 API，第三方仅能访问有限 API</li><li><strong>自定义</strong>：车载鸿蒙 OEM 高度自定义 HMI，Android Auto/CarPlay 固定模板</li><li><strong>性能</strong>：车载鸿蒙原生应用高性能，投屏方案受限于手机性能</li><li><strong>离线</strong>：车载鸿蒙完全离线可用，投屏方案依赖手机网络</li><li><strong>生态</strong>：鸿蒙生态（元服务/分布式） vs Google/Apple 生态</li></ul><h3 id="q2-车载-hmi-设计原则是什么" tabindex="-1">Q2: 车载 HMI 设计原则是什么？ <a class="header-anchor" href="#q2-车载-hmi-设计原则是什么" aria-label="Permalink to &quot;Q2: 车载 HMI 设计原则是什么？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>安全优先</strong>：驾驶时减少分心</li><li><strong>简洁布局</strong>：避免信息过载</li><li><strong>大图标/大字体</strong>：远距离可识别</li><li><strong>语音优先</strong>：关键操作通过语音</li><li><strong>暗色主题</strong>：减少眩光</li><li><strong>多屏协同</strong>：仪表盘/中控/后屏/HUD 协同</li><li><strong>断网可用</strong>：离线核心功能可用</li></ul><h3 id="q3-车机与手机如何协同" tabindex="-1">Q3: 车机与手机如何协同？ <a class="header-anchor" href="#q3-车机与手机如何协同" aria-label="Permalink to &quot;Q3: 车机与手机如何协同？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>分布式软总线</strong>：设备发现 + 连接</li><li><strong>跨设备应用迁移</strong>：导航/音乐无缝切换</li><li><strong>多屏协同</strong>：内容在屏间迁移/联动</li><li><strong>共享能力</strong>：手机摄像头/麦克风共享给车机</li><li><strong>同步数据</strong>：日历/联系人/媒体库同步</li><li><strong>统一体验</strong>：跨设备一致的操作体验</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：车载鸿蒙是鸿蒙最重要的增长方向之一。重点掌握 <strong>原生架构优势</strong>、<strong>车载 HMI 设计原则</strong>、<strong>车机-手机协同</strong>、<strong>多屏协同</strong>。对比 Android Auto/CarPlay 时强调<strong>深度集成</strong>和<strong>原生性能</strong>。</p></blockquote>`,35)])])}const b=n(e,[["render",i]]);export{u as __pageData,b as default};
