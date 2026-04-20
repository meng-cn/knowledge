import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const k=JSON.parse('{"title":"01 - iOS 发布与部署全栈","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/16_Relase_Deploy/01_Release_Deploy.md","filePath":"01-ios/16_Relase_Deploy/01_Release_Deploy.md"}'),t={name:"01-ios/16_Relase_Deploy/01_Release_Deploy.md"};function e(l,s,h,d,r,o){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="_01-ios-发布与部署全栈" tabindex="-1">01 - iOS 发布与部署全栈 <a class="header-anchor" href="#_01-ios-发布与部署全栈" aria-label="Permalink to &quot;01 - iOS 发布与部署全栈&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-发布流程概览">发布流程概览</a></li><li><a href="#2-签名与证书">签名与证书</a></li><li><a href="#3-描述文件-provisioning-profile">描述文件 (Provisioning Profile)</a></li><li><a href="#4-构建配置">构建配置</a></li><li><a href="#5-app-store-发布">App Store 发布</a></li><li><a href="#6-testflight-分发">TestFlight 分发</a></li><li><a href="#7-企业内部分发">企业内部分发</a></li><li><a href="#8-发布流程对比">发布流程对比</a></li><li><a href="#9-fastlane-自动化">Fastlane 自动化</a></li><li><a href="#10-发布检查清单">发布检查清单</a></li><li><a href="#11-面试考点汇总">面试考点汇总</a></li></ol><hr><h2 id="_1-发布流程概览" tabindex="-1">1. 发布流程概览 <a class="header-anchor" href="#_1-发布流程概览" aria-label="Permalink to &quot;1. 发布流程概览&quot;">​</a></h2><h3 id="_1-1-ios-分发方式对比" tabindex="-1">1.1 iOS 分发方式对比 <a class="header-anchor" href="#_1-1-ios-分发方式对比" aria-label="Permalink to &quot;1.1 iOS 分发方式对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>分发方式</th><th>适用场景</th><th>审核</th><th>证书类型</th><th>安装方式</th></tr></thead><tbody><tr><td><strong>App Store</strong></td><td>公开应用</td><td>✅ 需要</td><td>App Store</td><td>App Store 下载</td></tr><tr><td><strong>TestFlight</strong></td><td>内部/外部测试</td><td>✅ 需要</td><td>Ad Hoc/Distribution</td><td>TestFlight App</td></tr><tr><td><strong>Ad Hoc</strong></td><td>小范围测试</td><td>❌ 不需要</td><td>Ad Hoc</td><td>描述文件安装</td></tr><tr><td><strong>Enterprise</strong></td><td>企业内部</td><td>❌ 不需要</td><td>Enterprise</td><td>企业签名</td></tr><tr><td><strong>App Link</strong></td><td>直接安装</td><td>❌ 不需要</td><td>Developer</td><td>HTTPS + manifest</td></tr></tbody></table><h3 id="_1-2-发布流程" tabindex="-1">1.2 发布流程 <a class="header-anchor" href="#_1-2-发布流程" aria-label="Permalink to &quot;1.2 发布流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 发布流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────┐</span></span>
<span class="line"><span>│ 代码完成 │───→│ 签名   │───→│ 构建   │───→│ 提交   │───→│ 分发/上架  │</span></span>
<span class="line"><span>│          │    │ 证书   │    │ Archive│    │ App Store│    │ TestFlight │</span></span>
<span class="line"><span>└─────────┘    └───────┘    └───────┘    └───────┘    └───────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关键步骤：</span></span>
<span class="line"><span>1. 确保证书和描述文件有效</span></span>
<span class="line"><span>2. 配置正确的 Build Configuration (Release)</span></span>
<span class="line"><span>3. 设置正确的 Bundle Version 和 Build Number</span></span>
<span class="line"><span>4. 创建 Archive</span></span>
<span class="line"><span>5. 验证和提交</span></span></code></pre></div><hr><h2 id="_2-签名与证书" tabindex="-1">2. 签名与证书 <a class="header-anchor" href="#_2-签名与证书" aria-label="Permalink to &quot;2. 签名与证书&quot;">​</a></h2><h3 id="_2-1-证书类型" tabindex="-1">2.1 证书类型 <a class="header-anchor" href="#_2-1-证书类型" aria-label="Permalink to &quot;2.1 证书类型&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 证书体系：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                 Apple 证书类型                          │</span></span>
<span class="line"><span>├────────────────────┼────────────────────┬─────────────┤</span></span>
<span class="line"><span>│  证书类型          │  用途               │  有效期     │</span></span>
<span class="line"><span>├────────────────────┼────────────────┬──┼──────────────┤</span></span>
<span class="line"><span>│  Apple Development │ 开发调试        │  1年      │</span></span>
<span class="line"><span>│  Apple Distribution│ App Store 发布  │  1年      │</span></span>
<span class="line"><span>│  Ad Hoc Distribution│ 内部测试(最多100台)| 1年      │</span></span>
<span class="line"><span>│  In-House (Enterprise)│ 企业内部分发  │  3年      │</span></span>
<span class="line"><span>│  Developer ID       │ Mac App Store   │  1年      │</span></span>
<span class="line"><span>│  Web Distribution   │ Web 推送证书    │  1年      │</span></span>
<span class="line"><span>└───────────────────┴───────────────┴──┴─────────────┘</span></span></code></pre></div><h3 id="_2-2-证书管理" tabindex="-1">2.2 证书管理 <a class="header-anchor" href="#_2-2-证书管理" aria-label="Permalink to &quot;2.2 证书管理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>证书管理方式：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────┬────────────────────┬──────────────────────┐</span></span>
<span class="line"><span>│ 管理方式      │  优势               │  劣势                 │</span></span>
<span class="line"><span>├──────────────┼────────────────┬──┼─────────────────────┤</span></span>
<span class="line"><span>│ 手动管理      │ 简单直接         │ 容易过期、难同步      │</span></span>
<span class="line"><span>│ Xcode Autom. │ 自动化           │ 配置复杂              │</span></span>
<span class="line"><span>│ Fastlane+m.  │ 全自动化         │ 需学习成本            │</span></span>
<span class="line"><span>│ Xcode Cloud  │ Apple 原生       │ 平台锁定              │</span></span>
<span class="line"><span>│ Cert + sigh  │ Fastlane 工具链  │ 独立工具              │</span></span>
<span class="line"><span>└──────────────┴────────────────────┴──┴─────────────────────┘</span></span></code></pre></div><hr><h2 id="_3-描述文件-provisioning-profile" tabindex="-1">3. 描述文件 (Provisioning Profile) <a class="header-anchor" href="#_3-描述文件-provisioning-profile" aria-label="Permalink to &quot;3. 描述文件 (Provisioning Profile)&quot;">​</a></h2><h3 id="_3-1-描述文件组成" tabindex="-1">3.1 描述文件组成 <a class="header-anchor" href="#_3-1-描述文件组成" aria-label="Permalink to &quot;3.1 描述文件组成&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Provisioning Profile 结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────┐</span></span>
<span class="line"><span>│          Provisioning Profile             │</span></span>
<span class="line"><span>├───────────────────┬──────────────────┬──┤</span></span>
<span class="line"><span>│  Team ID          │  App ID          │  │</span></span>
<span class="line"><span>│  Certificate IDs  │  Device IDs      │  │</span></span>
<span class="line"><span>│  Entitlements     │  Expiration Date │  │</span></span>
<span class="line"><span>│  Profile UUID     │  Name            │  │</span></span>
<span class="line"><span>└───────────────────┴─────────────────┴──┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Profile 类型：</span></span>
<span class="line"><span>• Development Profile: 开发调试，绑定开发证书 + 设备</span></span>
<span class="line"><span>• Distribution Profile: App Store 发布，绑定分发证书</span></span>
<span class="line"><span>• Ad Hoc Profile: 内部测试，最多 100 台设备</span></span>
<span class="line"><span>• In-House Profile: 企业分发，绑定企业证书</span></span></code></pre></div><h3 id="_3-2-app-id-与-entitlements" tabindex="-1">3.2 App ID 与 Entitlements <a class="header-anchor" href="#_3-2-app-id-与-entitlements" aria-label="Permalink to &quot;3.2 App ID 与 Entitlements&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>App ID 配置：</span></span>
<span class="line"><span>├── Bundle ID (反向域名格式)</span></span>
<span class="line"><span>├── Capabilities:</span></span>
<span class="line"><span>│   ├── App Groups</span></span>
<span class="line"><span>│   ├── Associated Domains</span></span>
<span class="line"><span>│   ├── Game Center</span></span>
<span class="line"><span>│   ├── Hotspot Helper</span></span>
<span class="line"><span>│   ├── Identity Service</span></span>
<span class="line"><span>│   ├── In-App Purchase</span></span>
<span class="line"><span>│   ├── MapKit</span></span>
<span class="line"><span>│   ├── Push Notifications</span></span>
<span class="line"><span>│   ├── Safari SSO</span></span>
<span class="line"><span>│   └── Wireless Accessory Configuration</span></span>
<span class="line"><span>└── Entitlements (权限声明)</span></span></code></pre></div><hr><h2 id="_4-构建配置" tabindex="-1">4. 构建配置 <a class="header-anchor" href="#_4-构建配置" aria-label="Permalink to &quot;4. 构建配置&quot;">​</a></h2><h3 id="_4-1-xcode-build-configuration" tabindex="-1">4.1 Xcode Build Configuration <a class="header-anchor" href="#_4-1-xcode-build-configuration" aria-label="Permalink to &quot;4.1 Xcode Build Configuration&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode 构建配置：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────┬───────────────┬───────────────────┐</span></span>
<span class="line"><span>│ 配置项     │  Debug        │  Release          │</span></span>
<span class="line"><span>├───────────┼───────────────┼───────────────────┤</span></span>
<span class="line"><span>│ 优化级别   │ No Optimization│ Optimize Size    │</span></span>
<span class="line"><span>│ DEBUG      │ YES           │ NO                │</span></span>
<span class="line"><span>│ NSAssert   │ Enabled       │ Disabled          │</span></span>
<span class="line"><span>│ 符号表     │ 完整          │ 剥离              │</span></span>
<span class="line"><span>│ 死代码剥离  │ 否           │ 是 (Dead Code Stripping) │</span></span>
<span class="line"><span>│ 归档文件   │ .dSYM 生成    │ .dSYM 生成       │</span></span>
<span class="line"><span>│ IPD        │ 禁用          │ 启用 (Instrumentation Profiling) │</span></span>
<span class="line"><span>└───────────┴───────────────┴───────────────────┘</span></span></code></pre></div><h3 id="_4-2-archive-流程" tabindex="-1">4.2 Archive 流程 <a class="header-anchor" href="#_4-2-archive-流程" aria-label="Permalink to &quot;4.2 Archive 流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Archive 创建流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Product → Archive → Distribute App</span></span>
<span class="line"><span></span></span>
<span class="line"><span>分发选项：</span></span>
<span class="line"><span>├── App Store Connect (上传到 App Store)</span></span>
<span class="line"><span>├── App Store Distribution (提交到 App Store)</span></span>
<span class="line"><span>├── Ad Hoc (导出 .ipa + 描述文件)</span></span>
<span class="line"><span>├── Enterprise (企业签名分发)</span></span>
<span class="line"><span>├── Development (开发调试)</span></span>
<span class="line"><span>└── Custom (自定义签名配置)</span></span></code></pre></div><hr><h2 id="_5-app-store-发布" tabindex="-1">5. App Store 发布 <a class="header-anchor" href="#_5-app-store-发布" aria-label="Permalink to &quot;5. App Store 发布&quot;">​</a></h2><h3 id="_5-1-app-store-connect-流程" tabindex="-1">5.1 App Store Connect 流程 <a class="header-anchor" href="#_5-1-app-store-connect-流程" aria-label="Permalink to &quot;5.1 App Store Connect 流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>App Store Connect 流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────┐    ┌──────────────┐    ┌──────────────┐</span></span>
<span class="line"><span>│ 创建 App     │───→│ 填写元数据    │───→│ 上传构建版本  │</span></span>
<span class="line"><span>│ (App Store)  │    │ (名称/描述等) │    │ (Xcode/Fastlane) │</span></span>
<span class="line"><span>└─────────────┘    └─────────────┘    └────────┬────┘</span></span>
<span class="line"><span>                                                │</span></span>
<span class="line"><span>┌─────────────┐    ┌──────────────┐    ┌────────┐</span></span>
<span class="line"><span>│ 管理版本     │←───│ 审核结果     │←───│ Apple审核│</span></span>
<span class="line"><span>│ (发布/下架)  │    │ (通过/拒绝)  │    │ (1-14天) │</span></span>
<span class="line"><span>└─────────────┘    └─────────────┘    └─────────┘</span></span></code></pre></div><h3 id="_5-2-提交元数据" tabindex="-1">5.2 提交元数据 <a class="header-anchor" href="#_5-2-提交元数据" aria-label="Permalink to &quot;5.2 提交元数据&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>要求</th></tr></thead><tbody><tr><td>App 名称</td><td>最多 30 字符</td><td>唯一性</td></tr><tr><td>副标题</td><td>最多 30 字符</td><td>可选</td></tr><tr><td>描述</td><td>应用描述</td><td>至少 75 字符</td></tr><tr><td>关键词</td><td>搜索关键词</td><td>最多 100 字符</td></tr><tr><td>分类</td><td>主要/次要分类</td><td>必须</td></tr><tr><td>年龄分级</td><td>内容分级</td><td>必须</td></tr><tr><td>定价</td><td>免费版/付费</td><td>必须</td></tr><tr><td>版权</td><td>© 年份+公司</td><td>可选</td></tr><tr><td>支持 URL</td><td>技术支持页面</td><td>必须</td></tr><tr><td>营销 URL</td><td>营销落地页</td><td>可选</td></tr></tbody></table><h3 id="_5-3-app-review-指南要点" tabindex="-1">5.3 App Review 指南要点 <a class="header-anchor" href="#_5-3-app-review-指南要点" aria-label="Permalink to &quot;5.3 App Review 指南要点&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类别</th><th>常见拒绝原因</th></tr></thead><tbody><tr><td>GC_1.1</td><td>功能不完整/崩溃</td></tr><tr><td>GC_2.1</td><td>元数据不准确</td></tr><tr><td>GC_5.1.1</td><td>内购类型错误</td></tr><tr><td>GC_5.2.1</td><td>链接到外部付款</td></tr><tr><td>GC_5.3.1</td><td>缺失隐私政策</td></tr><tr><td>GC_5.4.1</td><td>广告 SDK 违规</td></tr><tr><td>GC_7.1.1</td><td>未提供测试账号</td></tr></tbody></table><hr><h2 id="_6-testflight-分发" tabindex="-1">6. TestFlight 分发 <a class="header-anchor" href="#_6-testflight-分发" aria-label="Permalink to &quot;6. TestFlight 分发&quot;">​</a></h2><h3 id="_6-1-testflight-类型" tabindex="-1">6.1 TestFlight 类型 <a class="header-anchor" href="#_6-1-testflight-类型" aria-label="Permalink to &quot;6.1 TestFlight 类型&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类型</th><th>人数限制</th><th>审核</th><th>适用场景</th></tr></thead><tbody><tr><td>内部测试</td><td>最多 100 人</td><td>❌</td><td>团队成员</td></tr><tr><td>外部测试</td><td>最多 10,000 人</td><td>✅</td><td>外部用户</td></tr></tbody></table><h3 id="_6-2-testflight-流程" tabindex="-1">6.2 TestFlight 流程 <a class="header-anchor" href="#_6-2-testflight-流程" aria-label="Permalink to &quot;6.2 TestFlight 流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TestFlight 分发流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Developer Portal → 创建测试组</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>Xcode → 上传构建版本</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>App Store Connect → 选择构建版本 → 提交审核</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>审核通过 → 邀请测试者</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>测试者安装 TestFlight App → 测试应用</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>收集反馈 → 修复问题 → 重新构建 → 重复</span></span></code></pre></div><hr><h2 id="_7-企业内部分发" tabindex="-1">7. 企业内部分发 <a class="header-anchor" href="#_7-企业内部分发" aria-label="Permalink to &quot;7. 企业内部分发&quot;">​</a></h2><h3 id="_7-1-企业签名流程" tabindex="-1">7.1 企业签名流程 <a class="header-anchor" href="#_7-1-企业签名流程" aria-label="Permalink to &quot;7.1 企业签名流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>企业签名发布流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────┐    ┌────────┐    ┌────────┐</span></span>
<span class="line"><span>│ 企业证书     │───→│ 构建 .ipa│───→│ 上传到  │</span></span>
<span class="line"><span>│ (In-House)  │    │  Archive│    │ HTTPS  │</span></span>
<span class="line"><span>└─────────────┘    └───┬───┘    └────┬───┘</span></span>
<span class="line"><span>                       │              │</span></span>
<span class="line"><span>              ┌────────┴───┐    ┌──────┴──────┐</span></span>
<span class="line"><span>              │ manifest.plist │  │ 用户点击链接  │</span></span>
<span class="line"><span>              │ (安装配置)   │    │ 安装到设备   │</span></span>
<span class="line"><span>              └─────────────┘    └─────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>manifest.plist 格式：</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    &quot;items&quot;: [{</span></span>
<span class="line"><span>        &quot;assets&quot;: [{</span></span>
<span class="line"><span>            &quot;kind&quot;: &quot;software-package&quot;,</span></span>
<span class="line"><span>            &quot;url&quot;: &quot;https://example.com/app.ipa&quot;</span></span>
<span class="line"><span>        }],</span></span>
<span class="line"><span>        &quot;metadata&quot;: {</span></span>
<span class="line"><span>            &quot;bundle-identifier&quot;: &quot;com.example.app&quot;,</span></span>
<span class="line"><span>            &quot;version&quot;: &quot;1.0&quot;,</span></span>
<span class="line"><span>            &quot;title&quot;: &quot;My Enterprise App&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }]</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户安装链接：</span></span>
<span class="line"><span>&lt;a href=&quot;itms-services://?action=download-manifest&amp;url=https://example.com/manifest.plist&quot;&gt;</span></span>
<span class="line"><span>    安装应用</span></span>
<span class="line"><span>&lt;/a&gt;</span></span></code></pre></div><hr><h2 id="_8-发布流程对比" tabindex="-1">8. 发布流程对比 <a class="header-anchor" href="#_8-发布流程对比" aria-label="Permalink to &quot;8. 发布流程对比&quot;">​</a></h2><table tabindex="0"><thead><tr><th>维度</th><th>App Store</th><th>TestFlight</th><th>Ad Hoc</th><th>Enterprise</th></tr></thead><tbody><tr><td>审核时间</td><td>1-14 天</td><td>1-14 天</td><td>即时</td><td>即时</td></tr><tr><td>设备限制</td><td>无</td><td>10,000 人</td><td>100 台</td><td>无限制</td></tr><tr><td>成本</td><td>免费（开发者 $99/年）</td><td>免费</td><td>免费</td><td>$299/年</td></tr><tr><td>更新频率</td><td>每 7 天 1 次构建</td><td>每 7 天 1 次</td><td>每 7 天 1 次</td><td>每 7 天 1 次</td></tr><tr><td>安装方式</td><td>App Store</td><td>TestFlight App</td><td>描述文件</td><td>manifest 链接</td></tr><tr><td>自动更新</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr><tr><td>适用阶段</td><td>正式发布</td><td>UAT/测试</td><td>内部测试</td><td>企业部署</td></tr></tbody></table><hr><h2 id="_9-fastlane-自动化" tabindex="-1">9. Fastlane 自动化 <a class="header-anchor" href="#_9-fastlane-自动化" aria-label="Permalink to &quot;9. Fastlane 自动化&quot;">​</a></h2><h3 id="_9-1-fastlane-发布脚本" tabindex="-1">9.1 Fastlane 发布脚本 <a class="header-anchor" href="#_9-1-fastlane-发布脚本" aria-label="Permalink to &quot;9.1 Fastlane 发布脚本&quot;">​</a></h3><div class="language-ruby vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ruby</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Fastfile - 发布流程自动化</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">platform </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:ios</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  desc </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Deploy a new version to the App Store&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lane </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:release</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 1. 证书管理</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">type:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;app_store&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">readonly:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 2. 构建</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gym</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      export_method:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;app-store&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      export_options:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        provisioningProfiles:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;com.example.app&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyApp App Store&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 3. 提交到 App Store</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    deliver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      force:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_screenshots:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_metadata:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      submit_for_review:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  desc </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Submit to TestFlight&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lane </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:beta</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">type:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;adhoc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gym</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">export_method:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;adhoc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    pilot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      distribution:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;internal&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      beta_app_description:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Beta build for testing&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  desc </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Enterprise deployment&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lane </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:enterprise</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">type:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;in_house&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gym</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">export_method:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;enterprise&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 生成 manifest.plist</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    sigh</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      app_identifier:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;com.example.app&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      provisioning_name:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp Enterprise&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span></code></pre></div><hr><h2 id="_10-发布检查清单" tabindex="-1">10. 发布检查清单 <a class="header-anchor" href="#_10-发布检查清单" aria-label="Permalink to &quot;10. 发布检查清单&quot;">​</a></h2><h3 id="_10-1-发布前检查" tabindex="-1">10.1 发布前检查 <a class="header-anchor" href="#_10-1-发布前检查" aria-label="Permalink to &quot;10.1 发布前检查&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>发布前检查清单：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 版本号更新 (CFBundleShortVersionString)</span></span>
<span class="line"><span>□ 构建号递增 (CFBundleVersion)</span></span>
<span class="line"><span>□ Bundle ID 正确</span></span>
<span class="line"><span>□ 签名配置正确 (Certificate + Provisioning Profile)</span></span>
<span class="line"><span>□ 图标和启动图更新</span></span>
<span class="line"><span>□ 隐私政策 URL 设置</span></span>
<span class="line"><span>□ App Icon 所有尺寸</span></span>
<span class="line"><span>□ 截图更新 (所有设备尺寸)</span></span>
<span class="line"><span>□ 内购项目创建并审核通过</span></span>
<span class="line"><span>□ App Store 元数据填写</span></span>
<span class="line"><span>□ 测试账号准备 (如需要)</span></span>
<span class="line"><span>□ 构建配置为 Release</span></span>
<span class="line"><span>□ 死代码剥离开启</span></span>
<span class="line"><span>□ 符号表 .dSYM 保留</span></span>
<span class="line"><span>□ CI/CD Pipeline 通过</span></span>
<span class="line"><span>□ Beta 测试无严重 Bug</span></span>
<span class="line"><span>□ 证书/Profile 未过期</span></span>
<span class="line"><span>□ 目标设备兼容测试通过</span></span></code></pre></div><hr><h2 id="_11-面试考点汇总" tabindex="-1">11. 面试考点汇总 <a class="header-anchor" href="#_11-面试考点汇总" aria-label="Permalink to &quot;11. 面试考点汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><ol><li><p><strong>iOS 应用的签名流程是什么？</strong></p><ul><li>开发者签名 → 打包签名 → 验证签名</li><li>证书 + 描述文件 + App ID 三者匹配</li><li>签名确保代码完整性</li></ul></li><li><p><strong>App Store 审核被拒怎么办？</strong></p><ul><li>分析拒绝原因，对照 App Review Guidelines</li><li>修复问题后重新提交，附注说明</li><li>常见原因：功能不完整、元数据错误、内购违规</li></ul></li><li><p><strong>TestFlight 和 Ad Hoc 的区别？</strong></p><ul><li>TestFlight：最多 10,000 人，需要审核，通过 App 安装</li><li>Ad Hoc：最多 100 台设备，不需要审核，通过描述文件安装</li></ul></li><li><p><strong>企业签名的风险？</strong></p><ul><li>证书可能被 Apple 撤销</li><li>应用被分发到非目标用户</li><li>安全风险：代码可被反编译和篡改</li></ul></li><li><p><strong>Bundle ID 和 Bundle Version 的作用？</strong></p><ul><li>Bundle ID：应用唯一标识，与 App ID 匹配</li><li>Bundle Version：内部版本号，每次构建必须递增</li><li>CFBundleShortVersionString：对外版本号</li></ul></li></ol><h3 id="面试回答模板" tabindex="-1">面试回答模板 <a class="header-anchor" href="#面试回答模板" aria-label="Permalink to &quot;面试回答模板&quot;">​</a></h3><blockquote><p>&quot;iOS 发布我使用 Fastlane 自动化。证书管理用 match，构建用 gym，提交到 App Store 用 deliver。TestFlight 用 pilot 分发。每次发布前检查清单确保版本号、签名、配置正确。审核被拒时对照 Guidelines 逐条修复。&quot;</p></blockquote><hr><p><em>本文档对标 Android <code>16_Release_Deploy/</code> 的深度</em></p>`,64)])])}const g=a(t,[["render",e]]);export{k as __pageData,g as default};
