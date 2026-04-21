import{_ as a,o as n,c as p,ae as i}from"./chunks/framework.Czhw_PXq.js";const k=JSON.parse('{"title":"安全模型","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/11_System/04_安全模型.md","filePath":"04-harmonyos/11_System/04_安全模型.md"}'),e={name:"04-harmonyos/11_System/04_安全模型.md"};function l(t,s,o,c,r,d){return n(),p("div",null,[...s[0]||(s[0]=[i(`<h1 id="安全模型" tabindex="-1">安全模型 <a class="header-anchor" href="#安全模型" aria-label="Permalink to &quot;安全模型&quot;">​</a></h1><h2 id="_1-安全架构总览" tabindex="-1">1. 安全架构总览 <a class="header-anchor" href="#_1-安全架构总览" aria-label="Permalink to &quot;1. 安全架构总览&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>鸿蒙安全架构分层：</span></span>
<span class="line"><span>┌──────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用层安全                               │</span></span>
<span class="line"><span>│  └── 应用签名 + 权限申请 + 沙箱隔离       │</span></span>
<span class="line"><span>├──────────────────────────────────────────┤</span></span>
<span class="line"><span>│  框架层安全                               │</span></span>
<span class="line"><span>│  └── TokenID/ATM + 能力门限 + URI 权限   │</span></span>
<span class="line"><span>├──────────────────────────────────────────┤</span></span>
<span class="line"><span>│  系统服务层安全                           │</span></span>
<span class="line"><span>│  └── SELinux 强制访问控制 + 域隔离        │</span></span>
<span class="line"><span>├──────────────────────────────────────────┤</span></span>
<span class="line"><span>│  内核层安全                               │</span></span>
<span class="line"><span>│  └── HongMeng Kernel + MPU + 内存保护    │</span></span>
<span class="line"><span>├──────────────────────────────────────────┤</span></span>
<span class="line"><span>│  硬件层安全                               │</span></span>
<span class="line"><span>│  └── TEE + 安全芯片 + 安全启动链          │</span></span>
<span class="line"><span>└──────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_2-tokenid-与访问控制" tabindex="-1">2. TokenID 与访问控制 <a class="header-anchor" href="#_2-tokenid-与访问控制" aria-label="Permalink to &quot;2. TokenID 与访问控制&quot;">​</a></h2><h3 id="_2-1-tokenid-机制" tabindex="-1">2.1 TokenID 机制 <a class="header-anchor" href="#_2-1-tokenid-机制" aria-label="Permalink to &quot;2.1 TokenID 机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TokenID 是鸿蒙的核心访问控制机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>TokenID 特性：</span></span>
<span class="line"><span>├── 每个进程/线程拥有唯一的 TokenID</span></span>
<span class="line"><span>├── TokenID 包含权限信息和角色信息</span></span>
<span class="line"><span>├── 访问资源时必须携带 TokenID 进行验证</span></span>
<span class="line"><span>├── TokenID 不可伪造，由内核分配</span></span>
<span class="line"><span>└── TokenID 有时间/空间/角色三维约束</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TokenID 的三维约束模型：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────┐</span></span>
<span class="line"><span>│          空间维度 (空间)           │</span></span>
<span class="line"><span>│  └── 进程/线程/Ability 级别       │</span></span>
<span class="line"><span>├──────────────────────────────────┤</span></span>
<span class="line"><span>│          时间维度 (时效)           │</span></span>
<span class="line"><span>│  └── Token 有效期 / 一次性使用    │</span></span>
<span class="line"><span>├──────────────────────────────────┤</span></span>
<span class="line"><span>│          角色维度 (角色)           │</span></span>
<span class="line"><span>│  └── 权限组 / 角色组 绑定         │</span></span>
<span class="line"><span>└──────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-权限等级" tabindex="-1">2.2 权限等级 <a class="header-anchor" href="#_2-2-权限等级" aria-label="Permalink to &quot;2.2 权限等级&quot;">​</a></h3><table tabindex="0"><thead><tr><th>权限等级</th><th>说明</th><th>示例</th><th>申请方式</th></tr></thead><tbody><tr><td><strong>system_core</strong></td><td>核心系统权限</td><td>system_monitor</td><td>系统签名</td></tr><tr><td><strong>system_basic</strong></td><td>基础系统权限</td><td>ohos.permission.INTERNET</td><td>自动授予</td></tr><tr><td><strong>normal</strong></td><td>普通权限</td><td>camera/storage</td><td>用户授予</td></tr><tr><td><strong>dynamic</strong></td><td>动态权限</td><td>location/record</td><td>运行时申请</td></tr></tbody></table><h3 id="_2-3-权限检查" tabindex="-1">2.3 权限检查 <a class="header-anchor" href="#_2-3-权限检查" aria-label="Permalink to &quot;2.3 权限检查&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { permission } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 检查权限状态</span></span>
<span class="line"><span>async function checkPermission() {</span></span>
<span class="line"><span>  const token = await permission.checkAccessToken(&#39;ohos.permission.CAMERA&#39;);</span></span>
<span class="line"><span>  console.log(&#39;Token: &#39; + token);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // token = 0: 无权限</span></span>
<span class="line"><span>  // token &gt; 0: 有权限</span></span>
<span class="line"><span>  // token = -1: 权限不存在</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 请求权限</span></span>
<span class="line"><span>async function requestCameraPermission() {</span></span>
<span class="line"><span>  const permissions = [&#39;ohos.permission.CAMERA&#39;];</span></span>
<span class="line"><span>  const token = await permission.requestPermissionsFromUser(permissions);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (token === 0) {</span></span>
<span class="line"><span>    console.log(&#39;权限已授予&#39;);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    console.log(&#39;权限被拒绝&#39;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 动态权限申请（用户手动弹窗）</span></span>
<span class="line"><span>// 与 Android onRequestPermissionsResult 类似</span></span>
<span class="line"><span>// 鸿蒙通过 system.router.pushUrl 弹出权限对话框</span></span></code></pre></div><h3 id="_2-4-权限声明" tabindex="-1">2.4 权限声明 <a class="header-anchor" href="#_2-4-权限声明" aria-label="Permalink to &quot;2.4 权限声明&quot;">​</a></h3><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// module.json5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;module&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;reqPermissions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ohos.permission.INTERNET&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;reason&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;需要访问网络&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;usedScene&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;abilities&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;EntryAbility&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;when&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;always&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ohos.permission.CAMERA&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;reason&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;拍照需要&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;usedScene&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;abilities&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;EntryAbility&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &quot;when&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;always&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_3-atm-ability-token-manager" tabindex="-1">3. ATM（Ability Token Manager） <a class="header-anchor" href="#_3-atm-ability-token-manager" aria-label="Permalink to &quot;3. ATM（Ability Token Manager）&quot;">​</a></h2><h3 id="_3-1-atm-机制" tabindex="-1">3.1 ATM 机制 <a class="header-anchor" href="#_3-1-atm-机制" aria-label="Permalink to &quot;3.1 ATM 机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ATM (Ability Token Manager) 是系统级的能力访问管理器：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ATM 职责：</span></span>
<span class="line"><span>├── 管理 Ability 的生命周期 Token</span></span>
<span class="line"><span>├── 验证 Ability 的跨进程访问权限</span></span>
<span class="line"><span>├── 管理 URI 权限（file:// 和 resource://）</span></span>
<span class="line"><span>├── 管理 Service 连接</span></span>
<span class="line"><span>└── 管理跨 Ability 的参数传递</span></span></code></pre></div><h3 id="_3-2-uri-权限" tabindex="-1">3.2 URI 权限 <a class="header-anchor" href="#_3-2-uri-权限" aria-label="Permalink to &quot;3.2 URI 权限&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// URI 权限：控制文件资源的跨应用访问</span></span>
<span class="line"><span>import { uri } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 授予 URI 权限（临时文件访问权限）</span></span>
<span class="line"><span>async function grantUriPermission(want: app.Want) {</span></span>
<span class="line"><span>  const uriPermissionFlags: number = (</span></span>
<span class="line"><span>    uri.URIPermissionFlag.READ_URI_PERMISSION</span></span>
<span class="line"><span>    | uri.URIPermissionFlag.WRITE_URI_PERMISSION</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 授予目标 Ability 读取 URI 的权限</span></span>
<span class="line"><span>  await this.context.grantUriPermission(&#39;com.target.app&#39;, uri, uriPermissionFlags);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 撤销 URI 权限</span></span>
<span class="line"><span>async function revokeUriPermission(want: app.Want) {</span></span>
<span class="line"><span>  await this.context.revokeUriPermission(&#39;com.target.app&#39;, uri);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-3-能力门限-capability" tabindex="-1">3.3 能力门限（Capability） <a class="header-anchor" href="#_3-3-能力门限-capability" aria-label="Permalink to &quot;3.3 能力门限（Capability）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>能力门限是鸿蒙 IPC 机制中的安全传递机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>IPC 消息传递时，权限内嵌在消息中：</span></span>
<span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│  IPC Message                             │</span></span>
<span class="line"><span>│  ├── 消息头（类型/大小）                   │</span></span>
<span class="line"><span>│  ├── 消息体（数据内容）                    │</span></span>
<span class="line"><span>│  └── Capability（能力描述）               │</span></span>
<span class="line"><span>│       ├── 可访问的资源列表                 │</span></span>
<span class="line"><span>│       ├── 可执行的命令列表                 │</span></span>
<span class="line"><span>│       └── 有效期/空间范围                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>接收方验证：</span></span>
<span class="line"><span>1. 检查消息来源的 TokenID</span></span>
<span class="line"><span>2. 验证 Capability 是否包含目标资源</span></span>
<span class="line"><span>3. 检查有效期和空间范围</span></span>
<span class="line"><span>4. 通过 → 执行；不通过 → 拒绝</span></span></code></pre></div><h2 id="_4-沙箱机制" tabindex="-1">4. 沙箱机制 <a class="header-anchor" href="#_4-沙箱机制" aria-label="Permalink to &quot;4. 沙箱机制&quot;">​</a></h2><h3 id="_4-1-应用沙箱" tabindex="-1">4.1 应用沙箱 <a class="header-anchor" href="#_4-1-应用沙箱" aria-label="Permalink to &quot;4.1 应用沙箱&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>每个应用运行在独立的沙箱中：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>沙箱特性：</span></span>
<span class="line"><span>├── 文件系统隔离：应用只能访问自己的沙箱目录</span></span>
<span class="line"><span>├── 网络隔离：独立网络命名空间</span></span>
<span class="line"><span>├── 进程隔离：独立 PID/UID</span></span>
<span class="line"><span>├── 内存隔离：独立虚拟地址空间</span></span>
<span class="line"><span>└── 设备能力隔离：摄像头/麦克风等需要权限</span></span></code></pre></div><h3 id="_4-2-沙箱目录结构" tabindex="-1">4.2 沙箱目录结构 <a class="header-anchor" href="#_4-2-沙箱目录结构" aria-label="Permalink to &quot;4.2 沙箱目录结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>应用的沙箱目录结构：</span></span>
<span class="line"><span>┌── /data/user/0/&lt;bundleName&gt;/          （应用数据目录）</span></span>
<span class="line"><span>│   ├── files/                          （内部文件存储）</span></span>
<span class="line"><span>│   ├── cache/                          （内部缓存）</span></span>
<span class="line"><span>│   ├── preferences/                    （偏好设置）</span></span>
<span class="line"><span>│   └── database/                       （数据库）</span></span>
<span class="line"><span>├── /data/media/0/                      （共享存储/DCIM）</span></span>
<span class="line"><span>├── /system/                            （系统只读分区）</span></span>
<span class="line"><span>└── /vendor/                            （厂商分区）</span></span></code></pre></div><h3 id="_4-3-uri-安全机制" tabindex="-1">4.3 URI 安全机制 <a class="header-anchor" href="#_4-3-uri-安全机制" aria-label="Permalink to &quot;4.3 URI 安全机制&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// URI 访问安全：通过 Uri 而非直接路径访问文件</span></span>
<span class="line"><span>import { uri } from &#39;@kit.AbilityKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ✅ 正确：通过 URI 访问共享文件</span></span>
<span class="line"><span>async function shareFile(targetUri: string) {</span></span>
<span class="line"><span>  // 通过 URI 传递，而非文件路径</span></span>
<span class="line"><span>  const fileUri = uri.createFileUri(&#39;/data/user/0/com.example/myapp/files/doc.pdf&#39;);</span></span>
<span class="line"><span>  // 授予临时权限给目标应用</span></span>
<span class="line"><span>  await this.context.grantUriPermission(targetUri, fileUri, uri.URIPermissionFlag.READ_URI_PERMISSION);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ❌ 错误：直接拼接文件路径（不安全）</span></span>
<span class="line"><span>// const filePath = &#39;/data/data/com.example/files/doc.pdf&#39;;</span></span></code></pre></div><h2 id="_5-selinux" tabindex="-1">5. SELinux <a class="header-anchor" href="#_5-selinux" aria-label="Permalink to &quot;5. SELinux&quot;">​</a></h2><h3 id="_5-1-selinux-在鸿蒙中的应用" tabindex="-1">5.1 SELinux 在鸿蒙中的应用 <a class="header-anchor" href="#_5-1-selinux-在鸿蒙中的应用" aria-label="Permalink to &quot;5.1 SELinux 在鸿蒙中的应用&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SELinux（Security-Enhanced Linux）提供强制访问控制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>域（Domain）模型：</span></span>
<span class="line"><span>├── 每个进程/线程运行在特定域中</span></span>
<span class="line"><span>├── 域之间通过策略规则定义访问权限</span></span>
<span class="line"><span>├── 默认策略：DENY ALL（拒绝所有未明确允许的访问）</span></span>
<span class="line"><span>└── 域过渡：通过 exec 触发域切换</span></span>
<span class="line"><span></span></span>
<span class="line"><span>示例策略规则：</span></span>
<span class="line"><span>┌──────────────────────────────────────┐</span></span>
<span class="line"><span>│ allow app_domain camera_device:chr_file { read write }; │</span></span>
<span class="line"><span>│ allow system_domain window_service:unix_stream_socket { connect }; │</span></span>
<span class="line"><span>│ allow init_domain zygote_domain:process { fork signull }; │</span></span>
<span class="line"><span>└──────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-selinux-模式" tabindex="-1">5.2 SELinux 模式 <a class="header-anchor" href="#_5-2-selinux-模式" aria-label="Permalink to &quot;5.2 SELinux 模式&quot;">​</a></h3><table tabindex="0"><thead><tr><th>模式</th><th>说明</th><th>适用场景</th></tr></thead><tbody><tr><td><strong>enforcing</strong></td><td>强制执行，违规操作被阻止</td><td>生产环境（默认）</td></tr><tr><td><strong>permissive</strong></td><td>记录违规但不阻止</td><td>开发调试</td></tr><tr><td><strong>disabled</strong></td><td>禁用 SELinux</td><td>调试（不推荐）</td></tr></tbody></table><h3 id="_5-3-与-android-selinux-对比" tabindex="-1">5.3 与 Android SELinux 对比 <a class="header-anchor" href="#_5-3-与-android-selinux-对比" aria-label="Permalink to &quot;5.3 与 Android SELinux 对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>Android SELinux</th><th>鸿蒙 SELinux</th></tr></thead><tbody><tr><td>策略管理</td><td>sepolicy 编译为二进制</td><td>init.hrc 配置策略</td></tr><tr><td>域划分</td><td>app/domain/service</td><td>TokenID + ATM 联合管理</td></tr><tr><td>类型系统</td><td>type + role</td><td>能力门限 + 权限组</td></tr><tr><td>默认策略</td><td>宽松（allow by default）</td><td>严格（deny by default）</td></tr></tbody></table><h2 id="_6-安全启动链" tabindex="-1">6. 安全启动链 <a class="header-anchor" href="#_6-安全启动链" aria-label="Permalink to &quot;6. 安全启动链&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>安全启动 Chain of Trust：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  BootROM（固化在芯片中）              │</span></span>
<span class="line"><span>│  ├── 验证 Bootloader 签名            │</span></span>
<span class="line"><span>│  └── 公钥固化在 ROM 中               │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  Bootloader（U-Boot/Fastboot）       │</span></span>
<span class="line"><span>│  ├── 验证 Kernel 签名               │</span></span>
<span class="line"><span>│  └── 传递 Device Tree               │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  Kernel（HongMeng Kernel）           │</span></span>
<span class="line"><span>│  ├── 初始化安全子系统                 │</span></span>
<span class="line"><span>│  ├── 验证系统分区签名                │</span></span>
<span class="line"><span>│  └── 挂载根文件系统                  │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  Userspace                         │</span></span>
<span class="line"><span>│  ├── 验证系统服务签名                │</span></span>
<span class="line"><span>│  └── 验证应用签名                   │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h2 id="_7-国密算法支持" tabindex="-1">7. 国密算法支持 <a class="header-anchor" href="#_7-国密算法支持" aria-label="Permalink to &quot;7. 国密算法支持&quot;">​</a></h2><table tabindex="0"><thead><tr><th>算法</th><th>说明</th><th>应用场景</th></tr></thead><tbody><tr><td><strong>SM2</strong></td><td>非对称加密（椭圆曲线）</td><td>数字签名/密钥交换</td></tr><tr><td><strong>SM3</strong></td><td>密码散列函数</td><td>数据完整性校验</td></tr><tr><td><strong>SM4</strong></td><td>对称加密（分组密码）</td><td>数据加密存储</td></tr><tr><td><strong>SM9</strong></td><td>基于身份的密码算法</td><td>物联网设备认证</td></tr></tbody></table><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 国密算法使用示例</span></span>
<span class="line"><span>import { cryptoFramework } from &#39;@kit.SecurityFrameworkKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// SM2 密钥对生成</span></span>
<span class="line"><span>const keyPair = await cryptoFramework.generateKeyPair({</span></span>
<span class="line"><span>  algorithm: &#39;SM2&#39;,</span></span>
<span class="line"><span>  keySize: 256</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// SM3 哈希</span></span>
<span class="line"><span>const hash = await cryptoFramework.hash({</span></span>
<span class="line"><span>  algorithm: &#39;SM3&#39;,</span></span>
<span class="line"><span>  data: buffer</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// SM4 加密</span></span>
<span class="line"><span>const encrypted = await cryptoFramework.encrypt({</span></span>
<span class="line"><span>  algorithm: &#39;SM4&#39;,</span></span>
<span class="line"><span>  key: keyPair.publicKey,</span></span>
<span class="line"><span>  data: buffer,</span></span>
<span class="line"><span>  mode: &#39;ECB&#39;</span></span>
<span class="line"><span>});</span></span></code></pre></div><h2 id="_8-应用签名与安全" tabindex="-1">8. 应用签名与安全 <a class="header-anchor" href="#_8-应用签名与安全" aria-label="Permalink to &quot;8. 应用签名与安全&quot;">​</a></h2><h3 id="_8-1-应用签名流程" tabindex="-1">8.1 应用签名流程 <a class="header-anchor" href="#_8-1-应用签名流程" aria-label="Permalink to &quot;8.1 应用签名流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>签名流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. 生成密钥对                        │</span></span>
<span class="line"><span>│     → keytool 生成 .p12 密钥文件     │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  2. 生成 CSR                         │</span></span>
<span class="line"><span>│     → Certificate Signing Request   │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  3. 申请证书                         │</span></span>
<span class="line"><span>│     → 发布证书 (.cer)               │</span></span>
<span class="line"><span>│     → 中间证书 (.p7b)               │</span></span>
<span class="line"><span>├─────────────────────────────────────┤</span></span>
<span class="line"><span>│  4. 打包签名                         │</span></span>
<span class="line"><span>│     → 在 DevEco Studio 中配置        │</span></span>
<span class="line"><span>│     → hvigor 自动签名                │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span></code></pre></div><h3 id="_8-2-签名验证" tabindex="-1">8.2 签名验证 <a class="header-anchor" href="#_8-2-签名验证" aria-label="Permalink to &quot;8.2 签名验证&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>签名验证时机：</span></span>
<span class="line"><span>├── 安装时：验证签名与 manifest 匹配</span></span>
<span class="line"><span>├── 运行时：验证跨应用调用的签名一致性</span></span>
<span class="line"><span>├── 更新时：验证签名与新包匹配（同签名应用才可覆盖更新）</span></span>
<span class="line"><span>└── 系统服务：验证系统服务的签名身份</span></span></code></pre></div><h2 id="_9-🎯-面试高频考点" tabindex="-1">9. 🎯 面试高频考点 <a class="header-anchor" href="#_9-🎯-面试高频考点" aria-label="Permalink to &quot;9. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙的-tokenid-机制与-android-的-uid-机制有什么区别" tabindex="-1">Q1: 鸿蒙的 TokenID 机制与 Android 的 UID 机制有什么区别？ <a class="header-anchor" href="#q1-鸿蒙的-tokenid-机制与-android-的-uid-机制有什么区别" aria-label="Permalink to &quot;Q1: 鸿蒙的 TokenID 机制与 Android 的 UID 机制有什么区别？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>TokenID 是三维约束（空间/时间/角色），UID 是一维（进程级）</li><li>TokenID 可动态分配/撤销，UID 固定</li><li>TokenID 通过 ATM 集中管理，UID 由内核分配</li><li>TokenID 支持细粒度权限（能力门限），UID 是粗粒度</li><li>TokenID 与 Ability 生命周期绑定，UID 与进程绑定</li></ul><h3 id="q2-鸿蒙的沙箱机制如何实现" tabindex="-1">Q2: 鸿蒙的沙箱机制如何实现？ <a class="header-anchor" href="#q2-鸿蒙的沙箱机制如何实现" aria-label="Permalink to &quot;Q2: 鸿蒙的沙箱机制如何实现？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>文件系统：每个应用独立沙箱目录，不能访问其他应用目录</li><li>网络：独立网络命名空间</li><li>内存：独立虚拟地址空间</li><li>URI 权限：通过 grantUriPermission 实现临时文件共享</li><li>SELinux：强制域隔离，默认拒绝未授权的域间访问</li></ul><h3 id="q3-如何申请和检查运行时权限" tabindex="-1">Q3: 如何申请和检查运行时权限？ <a class="header-anchor" href="#q3-如何申请和检查运行时权限" aria-label="Permalink to &quot;Q3: 如何申请和检查运行时权限？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>在 module.json5 中声明权限</li><li>使用 permission.checkAccessToken() 检查权限</li><li>使用 permission.requestPermissionsFromUser() 申请权限</li><li>用户通过系统弹窗手动确认</li><li>权限分为 normal（自动授予）和 dynamic（需用户确认）</li><li>不同权限等级需要不同签名</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：安全是面试重点。重点掌握 <strong>TokenID 三维模型</strong>、<strong>ATM 管理</strong>、<strong>URI 权限</strong>、<strong>沙箱隔离</strong> 四个核心概念，对比 Android 的 UID/SELinux/PackageManager。</p></blockquote>`,56)])])}const u=a(e,[["render",l]]);export{k as __pageData,u as default};
