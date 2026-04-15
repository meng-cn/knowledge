import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const c=JSON.parse('{"title":"Android 安全机制深度解析","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/14_System/10_安全机制.md","filePath":"00-android/14_System/10_安全机制.md"}'),l={name:"00-android/14_System/10_安全机制.md"};function h(e,s,t,k,E,r){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="android-安全机制深度解析" tabindex="-1">Android 安全机制深度解析 <a class="header-anchor" href="#android-安全机制深度解析" aria-label="Permalink to &quot;Android 安全机制深度解析&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-安全概述">安全概述</a></li><li><a href="#2-selinux-机制">SELinux 机制</a></li><li><a href="#3-应用沙箱">应用沙箱</a></li><li><a href="#4-签名机制-v1v2v3v4">签名机制（v1/v2/v3/v4）</a></li><li><a href="#5-权限模型">权限模型</a></li><li><a href="#6-网络安全-https证书锁定">网络安全（HTTPS/证书锁定）</a></li><li><a href="#7-数据加密-keystoreencryption">数据加密（KeyStore/Encryption）</a></li><li><a href="#8-反调试技术">反调试技术</a></li><li><a href="#9-反逆向工程">反逆向工程</a></li><li><a href="#10-代码保护">代码保护</a></li><li><a href="#11-面试考点">面试考点</a></li></ol><hr><h2 id="_1-安全概述" tabindex="-1">1. 安全概述 <a class="header-anchor" href="#_1-安全概述" aria-label="Permalink to &quot;1. 安全概述&quot;">​</a></h2><h3 id="_1-1-android-安全架构" tabindex="-1">1.1 Android 安全架构 <a class="header-anchor" href="#_1-1-android-安全架构" aria-label="Permalink to &quot;1.1 Android 安全架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 安全架构层次：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   应用层安全                                                │</span></span>
<span class="line"><span>│   ├─ 应用沙箱隔离                                           │</span></span>
<span class="line"><span>│   ├─ 权限控制                                                │</span></span>
<span class="line"><span>│   ├─ 数据加密                                                │</span></span>
<span class="line"><span>│   └─ 代码保护                                                │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   框架层安全                                                │</span></span>
<span class="line"><span>│   ├─ PackageManager 权限管理                                 │</span></span>
<span class="line"><span>│   ├─ SecurityProvider                                       │</span></span>
<span class="line"><span>│   ├─ 签名验证                                                │</span></span>
<span class="line"><span>│   └─ SELinux 策略                                            │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   内核层安全                                                │</span></span>
<span class="line"><span>│   ├─ SELinux 强制访问控制                                    │</span></span>
<span class="line"><span>│   ├─ 进程隔离                                                │</span></span>
<span class="line"><span>│   ├─ 内存保护                                                │</span></span>
<span class="line"><span>│   └─ 硬件安全模块 (TEE)                                      │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   硬件层安全                                                │</span></span>
<span class="line"><span>│   ├─ TrustZone                                              │</span></span>
<span class="line"><span>│   ├─ 安全芯片                                                │</span></span>
<span class="line"><span>│   ├─ 生物识别硬件                                            │</span></span>
<span class="line"><span>│   └─ 安全启动                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-安全威胁分类" tabindex="-1">1.2 安全威胁分类 <a class="header-anchor" href="#_1-2-安全威胁分类" aria-label="Permalink to &quot;1.2 安全威胁分类&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 安全威胁：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   恶意软件                                                  │</span></span>
<span class="line"><span>│   ├─ 病毒                                                   │</span></span>
<span class="line"><span>│   ├─ 木马                                                   │</span></span>
<span class="line"><span>│   ├─ 勒索软件                                               │</span></span>
<span class="line"><span>│   └─ 广告软件                                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   网络攻击                                                  │</span></span>
<span class="line"><span>│   ├─ 中间人攻击                                             │</span></span>
<span class="line"><span>│   ├─ 钓鱼攻击                                               │</span></span>
<span class="line"><span>│   ├─ DDoS 攻击                                              │</span></span>
<span class="line"><span>│   └─ 劫持攻击                                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   逆向工程                                                  │</span></span>
<span class="line"><span>│   ├─ 代码反编译                                             │</span></span>
<span class="line"><span>│   ├─ 动态调试                                               │</span></span>
<span class="line"><span>│   ├─ Hook 技术                                              │</span></span>
<span class="line"><span>│   └─ 内存转储                                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限滥用                                                  │</span></span>
<span class="line"><span>│   ├─ 过度权限申请                                           │</span></span>
<span class="line"><span>│   ├─ 权限提升                                               │</span></span>
<span class="line"><span>│   ├─ 越权访问                                               │</span></span>
<span class="line"><span>│   └─ 权限窃取                                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   数据泄露                                                  │</span></span>
<span class="line"><span>│   ├─ 未加密存储                                             │</span></span>
<span class="line"><span>│   ├─ 日志泄露                                               │</span></span>
<span class="line"><span>│   ├─ 截屏泄露                                               │</span></span>
<span class="line"><span>│   └─ 剪贴板泄露                                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_2-selinux-机制" tabindex="-1">2. SELinux 机制 <a class="header-anchor" href="#_2-selinux-机制" aria-label="Permalink to &quot;2. SELinux 机制&quot;">​</a></h2><h3 id="_2-1-selinux-概述" tabindex="-1">2.1 SELinux 概述 <a class="header-anchor" href="#_2-1-selinux-概述" aria-label="Permalink to &quot;2.1 SELinux 概述&quot;">​</a></h3><p>SELinux (Security-Enhanced Linux) 是 Android 的核心安全机制，提供强制访问控制。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SELinux 架构：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   SELinux 核心                                              │</span></span>
<span class="line"><span>│   ├─ 安全上下文 (Security Context)                          │</span></span>
<span class="line"><span>│   │   ├─ 用户 (User)                                        │</span></span>
<span class="line"><span>│   │   ├─ 角色 (Role)                                        │</span></span>
<span class="line"><span>│   │   └─ 类型 (Type)                                        │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 策略 (Policy)                                          │</span></span>
<span class="line"><span>│   │   ├─ 允许规则                                            │</span></span>
<span class="line"><span>│   │   ├─ 拒绝规则                                            │</span></span>
<span class="line"><span>│   │   └─ 审计规则                                            │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 参考监视器 (Reference Monitor)                          │</span></span>
<span class="line"><span>│       ├─ 访问控制                                            │</span></span>
<span class="line"><span>│       ├─ 上下文转换                                          │</span></span>
<span class="line"><span>│       └─ 审计日志                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-selinux-模式" tabindex="-1">2.2 SELinux 模式 <a class="header-anchor" href="#_2-2-selinux-模式" aria-label="Permalink to &quot;2.2 SELinux 模式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SELinux 模式：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Enforcing 模式                                             │</span></span>
<span class="line"><span>│   ├─ 强制执行策略                                            │</span></span>
<span class="line"><span>│   ├─ 拒绝未授权的访问                                        │</span></span>
<span class="line"><span>│   ├─ 记录审计日志                                            │</span></span>
<span class="line"><span>│   └─ 生产环境默认模式                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Permissive 模式                                            │</span></span>
<span class="line"><span>│   ├─ 不执行策略                                              │</span></span>
<span class="line"><span>│   ├─ 允许所有访问                                            │</span></span>
<span class="line"><span>│   ├─ 记录审计日志                                            │</span></span>
<span class="line"><span>│   └─ 调试开发模式                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>SELinux 命令：</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看 SELinux 状态</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getenforce</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 切换到 Permissive 模式</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setenforce</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 切换到 Enforcing 模式</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setenforce</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看进程安全上下文</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ps</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -Ze</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> grep</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">process_nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看文件安全上下文</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ls</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -Z</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /path/to/file</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 修改文件安全上下文</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chcon</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">typ</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /path/to/file</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看 SELinux 策略</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">semodule</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -l</span></span></code></pre></div><hr><h2 id="_3-应用沙箱" tabindex="-1">3. 应用沙箱 <a class="header-anchor" href="#_3-应用沙箱" aria-label="Permalink to &quot;3. 应用沙箱&quot;">​</a></h2><h3 id="_3-1-沙箱隔离机制" tabindex="-1">3.1 沙箱隔离机制 <a class="header-anchor" href="#_3-1-沙箱隔离机制" aria-label="Permalink to &quot;3.1 沙箱隔离机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>应用沙箱隔离：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   进程隔离                                                  │</span></span>
<span class="line"><span>│   ├─ 每个应用独立进程                                       │</span></span>
<span class="line"><span>│   ├─ 独立 UID/GID                                           │</span></span>
<span class="line"><span>│   ├─ 独立内存空间                                           │</span></span>
<span class="line"><span>│   └─ 独立文件描述符                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   文件隔离                                                  │</span></span>
<span class="line"><span>│   ├─ 应用私有目录                                          │</span></span>
<span class="line"><span>│   │   └─ /data/data/&lt;package_name&gt;/                         │</span></span>
<span class="line"><span>│   ├─ 应用外部目录                                          │</span></span>
<span class="line"><span>│   │   └─ /storage/emulated/0/Android/data/&lt;package_name&gt;/  │</span></span>
<span class="line"><span>│   └─ 其他应用无法访问                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   网络隔离                                                  │</span></span>
<span class="line"><span>│   ├─ 独立 Socket                                             │</span></span>
<span class="line"><span>│   ├─ 独立端口                                                │</span></span>
<span class="line"><span>│   └─ 需权限访问网络                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   资源隔离                                                  │</span></span>
<span class="line"><span>│   ├─ 独立 Binder                                             │</span></span>
<span class="line"><span>│   ├─ 独立 ContentProvider                                  │</span></span>
<span class="line"><span>│   └─ 需权限访问系统资源                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-沙箱目录结构" tabindex="-1">3.2 沙箱目录结构 <a class="header-anchor" href="#_3-2-沙箱目录结构" aria-label="Permalink to &quot;3.2 沙箱目录结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>应用沙箱目录结构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   /data/data/&lt;package_name&gt;/                                │</span></span>
<span class="line"><span>│   ├─ app_*/                    # 编译后的代码               │</span></span>
<span class="line"><span>│   ├─ cache/                    # 缓存目录                   │</span></span>
<span class="line"><span>│   ├─ code_cache/               # 代码缓存                   │</span></span>
<span class="line"><span>│   ├─ databases/                # SQLite 数据库              │</span></span>
<span class="line"><span>│   ├─ files/                    # 私有文件                   │</span></span>
<span class="line"><span>│   ├─ lib/                      # 原生库                     │</span></span>
<span class="line"><span>│   ├─ no_backup/                # 不备份目录                 │</span></span>
<span class="line"><span>│   └─ preferences/              # SharedPreferences          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   /storage/emulated/0/Android/data/&lt;package_name&gt;/         │</span></span>
<span class="line"><span>│   ├─ cache/                    # 外部缓存                   │</span></span>
<span class="line"><span>│   ├─ code_cache/               # 外部代码缓存               │</span></span>
<span class="line"><span>│   └─ files/                    # 外部文件                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_4-签名机制-v1-v2-v3-v4" tabindex="-1">4. 签名机制（v1/v2/v3/v4） <a class="header-anchor" href="#_4-签名机制-v1-v2-v3-v4" aria-label="Permalink to &quot;4. 签名机制（v1/v2/v3/v4）&quot;">​</a></h2><h3 id="_4-1-签名方案演进" tabindex="-1">4.1 签名方案演进 <a class="header-anchor" href="#_4-1-签名方案演进" aria-label="Permalink to &quot;4.1 签名方案演进&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 签名方案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v1 签名 (Android 4.0+)                                     │</span></span>
<span class="line"><span>│   ├─ 在 META-INF 目录                                        │</span></span>
<span class="line"><span>│   ├─ 基于 JAR 签名                                           │</span></span>
<span class="line"><span>│   ├─ 签名文件：CERT.SF, CERT.RSA                            │</span></span>
<span class="line"><span>│   ├─ 验证速度较慢                                            │</span></span>
<span class="line"><span>│   └─ 不支持增量更新                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v2 签名 (Android 7.0+)                                     │</span></span>
<span class="line"><span>│   ├─ 全 APK 签名                                             │</span></span>
<span class="line"><span>│   ├─ 签名包含在 APK 头部                                      │</span></span>
<span class="line"><span>│   ├─ 验证速度快                                              │</span></span>
<span class="line"><span>│   ├─ 支持增量更新                                            │</span></span>
<span class="line"><span>│   └─ 完整性保护                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v3 签名 (Android 8.0+)                                     │</span></span>
<span class="line"><span>│   ├─ v2 基础上增加证书吊销                                   │</span></span>
<span class="line"><span>│   ├─ 支持证书吊销列表 (CRL)                                   │</span></span>
<span class="line"><span>│   ├─ 支持 OCSP 吊销检查                                      │</span></span>
<span class="line"><span>│   └─ 向后兼容                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v4 签名 (Android 9.0+)                                     │</span></span>
<span class="line"><span>│   ├─ v3 基础上增加包完整性验证                                │</span></span>
<span class="line"><span>│   ├─ 支持 APK 完整性检查                                      │</span></span>
<span class="line"><span>│   ├─ 防止 APK 被篡改                                          │</span></span>
<span class="line"><span>│   └─ 向后兼容                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-签名生成" tabindex="-1">4.2 签名生成 <a class="header-anchor" href="#_4-2-签名生成" aria-label="Permalink to &quot;4.2 签名生成&quot;">​</a></h3><p><strong>使用 apksigner 签名：</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 生成密钥库</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">keytool</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -genkey</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -keystore</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-release-key.jks</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -alias</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-key-alias</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -keyalg</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> RSA</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -keysize</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2048</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -validity</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 签名 APK (自动选择最佳签名方案)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">apksigner</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> sign</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --ks</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-release-key.jks</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    --ks-key-alias</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-key-alias</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    --ks-password</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">passwor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    --key-password</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">passwor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    release.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 验证签名</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">apksigner</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> verify</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --verbose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看签名信息</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">apksigner</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> print</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release.apk</span></span></code></pre></div><h3 id="_4-3-签名验证" tabindex="-1">4.3 签名验证 <a class="header-anchor" href="#_4-3-签名验证" aria-label="Permalink to &quot;4.3 签名验证&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 签名验证代码</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SignatureVerifier</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 获取应用签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageSigner </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPackageSigner</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Context </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            PackageInfo packageInfo </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> context.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPackageManager</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPackageInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPackageName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    PackageManager.GET_SIGNING_CERTIFICATES);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (packageInfo.signingInfo </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageSigner</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageInfo.signingInfo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getApkContentsSigners</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (PackageManager.NameNotFoundException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            e.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">printStackTrace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 验证签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifySignature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Context </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">expectedSignature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        PackageSigner signer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getPackageSigner</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (signer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        Certificate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] certificates </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> signer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCertificates</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Certificate cert </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> certificates) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] certBytes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cert.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getEncoded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Arrays.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(certBytes, expectedSignature)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_5-权限模型" tabindex="-1">5. 权限模型 <a class="header-anchor" href="#_5-权限模型" aria-label="Permalink to &quot;5. 权限模型&quot;">​</a></h2><h3 id="_5-1-权限模型架构" tabindex="-1">5.1 权限模型架构 <a class="header-anchor" href="#_5-1-权限模型架构" aria-label="Permalink to &quot;5.1 权限模型架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 权限模型：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限声明                                                  │</span></span>
<span class="line"><span>│   ├─ AndroidManifest.xml 中声明                             │</span></span>
<span class="line"><span>│   ├─ 权限类型                                                │</span></span>
<span class="line"><span>│   └─ 权限保护级别                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限授予                                                  │</span></span>
<span class="line"><span>│   ├─ 安装时授予 (普通权限)                                   │</span></span>
<span class="line"><span>│   ├─ 运行时授予 (危险权限)                                   │</span></span>
<span class="line"><span>│   ├─ 特殊权限授予                                            │</span></span>
<span class="line"><span>│   └─ 系统权限授予                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限检查                                                  │</span></span>
<span class="line"><span>│   ├─ 代码中检查                                              │</span></span>
<span class="line"><span>│   ├─ 系统服务检查                                            │</span></span>
<span class="line"><span>│   ├─ SELinux 检查                                            │</span></span>
<span class="line"><span>│   └─ 内核权限检查                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限撤销                                                  │</span></span>
<span class="line"><span>│   ├─ 用户手动撤销                                            │</span></span>
<span class="line"><span>│   ├─ 应用卸载时撤销                                          │</span></span>
<span class="line"><span>│   ├─ 系统强制撤销                                            │</span></span>
<span class="line"><span>│   └─ 权限重置                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_6-网络安全-https-证书锁定" tabindex="-1">6. 网络安全（HTTPS/证书锁定） <a class="header-anchor" href="#_6-网络安全-https-证书锁定" aria-label="Permalink to &quot;6. 网络安全（HTTPS/证书锁定）&quot;">​</a></h2><h3 id="_6-1-https-安全" tabindex="-1">6.1 HTTPS 安全 <a class="header-anchor" href="#_6-1-https-安全" aria-label="Permalink to &quot;6.1 HTTPS 安全&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>HTTPS 安全机制：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   TLS/SSL 加密                                              │</span></span>
<span class="line"><span>│   ├─ 对称加密                                                │</span></span>
<span class="line"><span>│   ├─ 非对称加密                                              │</span></span>
<span class="line"><span>│   ├─ 密钥交换                                                │</span></span>
<span class="line"><span>│   └─ 数据完整性                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   证书验证                                                  │</span></span>
<span class="line"><span>│   ├─ CA 证书链验证                                           │</span></span>
<span class="line"><span>│   ├─ 证书有效期验证                                          │</span></span>
<span class="line"><span>│   ├─ 域名匹配验证                                            │</span></span>
<span class="line"><span>│   └─ 证书吊销检查                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   安全传输                                                  │</span></span>
<span class="line"><span>│   ├─ 防止中间人攻击                                          │</span></span>
<span class="line"><span>│   ├─ 防止数据篡改                                            │</span></span>
<span class="line"><span>│   └─ 防止数据窃听                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_6-2-证书锁定" tabindex="-1">6.2 证书锁定 <a class="header-anchor" href="#_6-2-证书锁定" aria-label="Permalink to &quot;6.2 证书锁定&quot;">​</a></h3><p><strong>NetworkSecurityConfig 配置：</strong></p><div class="language-xml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">xml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- res/xml/network_security_config.xml --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;?</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">xml</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> version</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1.0&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> encoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;utf-8&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">?&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">network-security-config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    &lt;!-- 基础配置 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">base-config</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> cleartextTrafficPermitted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">trust-anchors</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">certificates</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;system&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">trust-anchors</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">base-config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    &lt;!-- 域名特定配置 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">domain-config</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> cleartextTrafficPermitted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">domain</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> includeSubdomains</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;example.com&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">domain</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">trust-anchors</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">certificates</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;system&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">certificates</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@raw/custom_ca&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">trust-anchors</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">pin-set</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> expiration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;2025-12-31&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">pin</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> digest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;SHA-256&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                AAAAB3NzaC1kc2MAAA...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">pin-set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">domain-config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">network-security-config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>AndroidManifest.xml 配置：</strong></p><div class="language-xml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">xml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">manifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">application</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:networkSecurityConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@xml/network_security_config&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:usesCleartextTraffic</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">application</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">manifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><hr><h2 id="_7-数据加密-keystore-encryption" tabindex="-1">7. 数据加密（KeyStore/Encryption） <a class="header-anchor" href="#_7-数据加密-keystore-encryption" aria-label="Permalink to &quot;7. 数据加密（KeyStore/Encryption）&quot;">​</a></h2><h3 id="_7-1-android-keystore" tabindex="-1">7.1 Android Keystore <a class="header-anchor" href="#_7-1-android-keystore" aria-label="Permalink to &quot;7.1 Android Keystore&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android Keystore 架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Keystore 服务                                             │</span></span>
<span class="line"><span>│   ├─ 密钥生成                                                │</span></span>
<span class="line"><span>│   ├─ 密钥存储                                                │</span></span>
<span class="line"><span>│   ├─ 密钥使用                                                │</span></span>
<span class="line"><span>│   └─ 密钥删除                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   密钥类型                                                  │</span></span>
<span class="line"><span>│   ├─ 对称密钥 (AES)                                          │</span></span>
<span class="line"><span>│   ├─ 非对称密钥 (RSA, EC)                                    │</span></span>
<span class="line"><span>│   ├─ 认证密钥 (HMAC)                                         │</span></span>
<span class="line"><span>│   └─ 证书密钥                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   安全特性                                                  │</span></span>
<span class="line"><span>│   ├─ 硬件 backed (TEE)                                      │</span></span>
<span class="line"><span>│   ├─ 密钥不出芯片                                            │</span></span>
<span class="line"><span>│   ├─ 防篡改                                                  │</span></span>
<span class="line"><span>│   └─ 防提取                                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_7-2-加密实现" tabindex="-1">7.2 加密实现 <a class="header-anchor" href="#_7-2-加密实现" aria-label="Permalink to &quot;7.2 加密实现&quot;">​</a></h3><p><strong>使用 Android Keystore：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 密钥生成和使用</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> KeyStoreHelper</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String KEYSTORE_NAME </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;AndroidKeyStore&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String KEY_ALIAS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;my_key_alias&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 生成密钥</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> generateKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyStore keyStore </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> KeyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KEYSTORE_NAME);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        keyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyGenParameterSpec spec </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> KeyGenParameterSpec.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Builder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            KEY_ALIAS,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            KeyProperties.PURPOSE_ENCRYPT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> KeyProperties.PURPOSE_DECRYPT)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setBlockModes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KeyProperties.BLOCK_MODE_GCM)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setEncryptionPaddings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KeyProperties.ENCRYPTION_PADDING_NONE)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setKeySize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">256</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyGenerator keyGenerator </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> KeyGenerator.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_NAME);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        keyGenerator.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(spec);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        keyGenerator.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">generateKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 加密数据</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">encrypt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyStore keyStore </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> KeyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KEYSTORE_NAME);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        keyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyStore.SecretKeyEntry entry </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            (KeyStore.SecretKeyEntry) keyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getEntry</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KEY_ALIAS, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        SecretKey key </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> entry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSecretKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Cipher cipher </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            KeyProperties.TRANSFORMATION_AES_GCM);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Cipher.ENCRYPT_MODE, key);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] iv </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getIV</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] ciphertext </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doFinal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(data.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getBytes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 返回 IV + 密文</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[iv.length </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ciphertext.length];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">arraycopy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(iv, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, result, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, iv.length);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">arraycopy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ciphertext, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, result, iv.length, ciphertext.length);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 解密数据</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">decrypt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyStore keyStore </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> KeyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KEYSTORE_NAME);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        keyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        KeyStore.SecretKeyEntry entry </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            (KeyStore.SecretKeyEntry) keyStore.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getEntry</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KEY_ALIAS, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        SecretKey key </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> entry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSecretKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] iv </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Arrays.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">copyOfRange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(data, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] ciphertext </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Arrays.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">copyOfRange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(data, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, data.length);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Cipher cipher </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            KeyProperties.TRANSFORMATION_AES_GCM);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        GCMParameterSpec spec </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> GCMParameterSpec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">128</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, iv);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Cipher.DECRYPT_MODE, key, spec);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] plaintext </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cipher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doFinal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ciphertext);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(plaintext);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_8-反调试技术" tabindex="-1">8. 反调试技术 <a class="header-anchor" href="#_8-反调试技术" aria-label="Permalink to &quot;8. 反调试技术&quot;">​</a></h2><h3 id="_8-1-调试检测方法" tabindex="-1">8.1 调试检测方法 <a class="header-anchor" href="#_8-1-调试检测方法" aria-label="Permalink to &quot;8.1 调试检测方法&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>反调试技术：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   进程检测                                                  │</span></span>
<span class="line"><span>│   ├─ 检测调试器进程                                         │</span></span>
<span class="line"><span>│   ├─ 检测调试端口                                            │</span></span>
<span class="line"><span>│   ├─ 检测 ptrace 附加                                        │</span></span>
<span class="line"><span>│   └─ 检测调试标志                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   时间检测                                                  │</span></span>
<span class="line"><span>│   ├─ 检测时间异常                                            │</span></span>
<span class="line"><span>│   ├─ 检测执行速度                                            │</span></span>
<span class="line"><span>│   ├─ 检测时钟偏差                                            │</span></span>
<span class="line"><span>│   └─ 检测暂停执行                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   内存检测                                                  │</span></span>
<span class="line"><span>│   ├─ 检测内存断点                                            │</span></span>
<span class="line"><span>│   ├─ 检测内存修改                                            │</span></span>
<span class="line"><span>│   ├─ 检测代码段修改                                          │</span></span>
<span class="line"><span>│   └─ 检测内存转储                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   环境检测                                                  │</span></span>
<span class="line"><span>│   ├─ 检测模拟器环境                                          │</span></span>
<span class="line"><span>│   ├─ 检测 Root 环境                                           │</span></span>
<span class="line"><span>│   ├─ 检测调试环境                                            │</span></span>
<span class="line"><span>│   └─ 检测 Hook 框架                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_8-2-反调试实现" tabindex="-1">8.2 反调试实现 <a class="header-anchor" href="#_8-2-反调试实现" aria-label="Permalink to &quot;8.2 反调试实现&quot;">​</a></h3><p><strong>调试检测代码：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 反调试检测</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AntiDebug</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 检测是否被调试</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> isDebugged</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            File file </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/proc/self/status&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            BufferedReader reader </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BufferedReader</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FileReader</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(file));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String line;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ((line </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> reader.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">readLine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (line.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startsWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;TracerPid:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                    String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] parts </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> line.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">split</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\\\</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">s+&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (parts.length </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">parts[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            reader.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (IOException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            e.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">printStackTrace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 检测 Root</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> isRooted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 检测 su 二进制文件</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] paths </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/system/bin/su&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/system/xbin/su&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                         &quot;/sbin/su&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/system/sbin/su&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (String path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> paths) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> File</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(path).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">exists</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 检测超级用户权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Process process </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Runtime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">exec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;su -c &#39;whoami&#39;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (process.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">exitValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Exception </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 忽略异常</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 检测模拟器</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> isEmulator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 检测设备属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String model </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.MODEL;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String brand </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.BRAND;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String hardware </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.HARDWARE;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (model.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contains</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;SDK&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> model.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contains</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Google&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            brand.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contains</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Google&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> hardware.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contains</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;goldfish&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 检测设备特征</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (TelephonyManager.class.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;getDeviceId&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_9-反逆向工程" tabindex="-1">9. 反逆向工程 <a class="header-anchor" href="#_9-反逆向工程" aria-label="Permalink to &quot;9. 反逆向工程&quot;">​</a></h2><h3 id="_9-1-逆向工程防御" tabindex="-1">9.1 逆向工程防御 <a class="header-anchor" href="#_9-1-逆向工程防御" aria-label="Permalink to &quot;9.1 逆向工程防御&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>反逆向工程技术：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   代码混淆                                                  │</span></span>
<span class="line"><span>│   ├─ 类名混淆                                                │</span></span>
<span class="line"><span>│   ├─ 方法名混淆                                              │</span></span>
<span class="line"><span>│   ├─ 字段名混淆                                              │</span></span>
<span class="line"><span>│   ├─ 字符串加密                                              │</span></span>
<span class="line"><span>│   └─ 控制流混淆                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   代码保护                                                  │</span></span>
<span class="line"><span>│   ├─ 代码完整性校验                                          │</span></span>
<span class="line"><span>│   ├─ 代码分片                                                  │</span></span>
<span class="line"><span>│   ├─ 代码虚拟化                                                │</span></span>
<span class="line"><span>│   └─ 代码加密                                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   环境检测                                                  │</span></span>
<span class="line"><span>│   ├─ 反调试检测                                              │</span></span>
<span class="line"><span>│   ├─ 反 Root 检测                                              │</span></span>
<span class="line"><span>│   ├─ 反模拟器检测                                            │</span></span>
<span class="line"><span>│   ├─ 反 Hook 检测                                              │</span></span>
<span class="line"><span>│   └─ 反内存转储                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   运行时保护                                                │</span></span>
<span class="line"><span>│   ├─ 代码动态加载                                            │</span></span>
<span class="line"><span>│   ├─ 代码解密执行                                            │</span></span>
<span class="line"><span>│   ├─ 代码验证                                                  │</span></span>
<span class="line"><span>│   └─ 代码完整性校验                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_9-2-代码混淆" tabindex="-1">9.2 代码混淆 <a class="header-anchor" href="#_9-2-代码混淆" aria-label="Permalink to &quot;9.2 代码混淆&quot;">​</a></h3><p><strong>ProGuard 配置：</strong></p><div class="language-proguard vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">proguard</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 保持类</span></span>
<span class="line"><span>-keep class com.example.** { *; }</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 混淆设置</span></span>
<span class="line"><span>-obfuscationdictionary dictionary.txt</span></span>
<span class="line"><span>-seed seedname **</span></span>
<span class="line"><span>-applymapping mapping.txt</span></span>
<span class="line"><span>-useuniqueclassmembermapping</span></span>
<span class="line"><span>-line numberseparation 2</span></span>
<span class="line"><span>-assumenosideeffects class com.example.util.LogUtil { public static *; }</span></span>
<span class="line"><span>-dontusemixedcaseclassnames</span></span>
<span class="line"><span>-dontpreverify</span></span>
<span class="line"><span>-verbose</span></span>
<span class="line"><span>-printseeds seeds.txt</span></span>
<span class="line"><span>-printusage unused.txt</span></span>
<span class="line"><span>-printcfg cfg.txt</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 字符串加密</span></span>
<span class="line"><span>-replacestringencodings true</span></span>
<span class="line"><span>-obfuscateclassnames</span></span>
<span class="line"><span>-obfuscationdictionary dictionary.txt</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 控制流混淆</span></span>
<span class="line"><span>-controlflow 50</span></span>
<span class="line"><span>-controlflowtrycatch 50</span></span></code></pre></div><hr><h2 id="_10-代码保护" tabindex="-1">10. 代码保护 <a class="header-anchor" href="#_10-代码保护" aria-label="Permalink to &quot;10. 代码保护&quot;">​</a></h2><h3 id="_10-1-代码保护策略" tabindex="-1">10.1 代码保护策略 <a class="header-anchor" href="#_10-1-代码保护策略" aria-label="Permalink to &quot;10.1 代码保护策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>代码保护策略：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   静态保护                                                  │</span></span>
<span class="line"><span>│   ├─ 代码混淆                                                │</span></span>
<span class="line"><span>│   ├─ 代码加密                                                │</span></span>
<span class="line"><span>│   ├─ 代码签名                                                │</span></span>
<span class="line"><span>│   └─ 代码完整性校验                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   动态保护                                                  │</span></span>
<span class="line"><span>│   ├─ 代码动态加载                                            │</span></span>
<span class="line"><span>│   ├─ 代码解密执行                                            │</span></span>
<span class="line"><span>│   ├─ 代码验证                                                  │</span></span>
<span class="line"><span>│   └─ 运行时完整性检查                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   网络保护                                                  │</span></span>
<span class="line"><span>│   ├─ API 密钥保护                                             │</span></span>
<span class="line"><span>│   ├─ 通信加密                                                │</span></span>
<span class="line"><span>│   ├─ 请求签名                                                │</span></span>
<span class="line"><span>│   └─ 频率限制                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   数据保护                                                  │</span></span>
<span class="line"><span>│   ├─ 数据加密                                                │</span></span>
<span class="line"><span>│   ├─ 密钥保护                                                │</span></span>
<span class="line"><span>│   ├─ 数据完整性校验                                          │</span></span>
<span class="line"><span>│   └─ 安全存储                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_11-面试考点" tabindex="-1">11. 面试考点 <a class="header-anchor" href="#_11-面试考点" aria-label="Permalink to &quot;11. 面试考点&quot;">​</a></h2><h3 id="_11-1-基础考点" tabindex="-1">11.1 基础考点 <a class="header-anchor" href="#_11-1-基础考点" aria-label="Permalink to &quot;11.1 基础考点&quot;">​</a></h3><p><strong>1. SELinux 的作用？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   SELinux 作用                                              │</span></span>
<span class="line"><span>│   ├─ 强制访问控制 (MAC)                                      │</span></span>
<span class="line"><span>│   ├─ 进程隔离                                                │</span></span>
<span class="line"><span>│   ├─ 文件保护                                                │</span></span>
<span class="line"><span>│   ├─ 网络保护                                                │</span></span>
<span class="line"><span>│   └─ 系统安全                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 应用沙箱机制？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   应用沙箱                                                  │</span></span>
<span class="line"><span>│   ├─ 进程隔离                                                │</span></span>
<span class="line"><span>│   ├─ 文件隔离                                                │</span></span>
<span class="line"><span>│   ├─ 网络隔离                                                │</span></span>
<span class="line"><span>│   ├─ 资源隔离                                                │</span></span>
<span class="line"><span>│   └─ 权限隔离                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_11-2-进阶考点" tabindex="-1">11.2 进阶考点 <a class="header-anchor" href="#_11-2-进阶考点" aria-label="Permalink to &quot;11.2 进阶考点&quot;">​</a></h3><p><strong>1. 签名方案演进？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   签名方案                                                  │</span></span>
<span class="line"><span>│   ├─ v1 签名：JAR 签名                                        │</span></span>
<span class="line"><span>│   ├─ v2 签名：全 APK 签名                                      │</span></span>
<span class="line"><span>│   ├─ v3 签名：证书吊销                                        │</span></span>
<span class="line"><span>│   └─ v4 签名：包完整性                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 证书锁定？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   证书锁定                                                  │</span></span>
<span class="line"><span>│   ├─ NetworkSecurityConfig 配置                              │</span></span>
<span class="line"><span>│   ├─ 证书 PIN 值                                               │</span></span>
<span class="line"><span>│   ├─ 防止中间人攻击                                          │</span></span>
<span class="line"><span>│   └─ 确保连接安全                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_11-3-高级考点" tabindex="-1">11.3 高级考点 <a class="header-anchor" href="#_11-3-高级考点" aria-label="Permalink to &quot;11.3 高级考点&quot;">​</a></h3><p><strong>1. Android Keystore 使用？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android Keystore                                          │</span></span>
<span class="line"><span>│   ├─ 密钥生成                                                │</span></span>
<span class="line"><span>│   ├─ 密钥存储（硬件 backed）                                  │</span></span>
<span class="line"><span>│   ├─ 密钥使用（加密/解密）                                    │</span></span>
<span class="line"><span>│   ├─ 密钥删除                                                │</span></span>
<span class="line"><span>│   └─ 防提取                                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 反调试技术？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   反调试技术                                                │</span></span>
<span class="line"><span>│   ├─ 进程检测                                                │</span></span>
<span class="line"><span>│   ├─ 时间检测                                                │</span></span>
<span class="line"><span>│   ├─ 内存检测                                                │</span></span>
<span class="line"><span>│   ├─ 环境检测                                                │</span></span>
<span class="line"><span>│   └─ 行为检测                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><p><strong>文档信息：</strong></p><ul><li>字数：约 16000 字</li><li>包含：SELinux 机制、应用沙箱、签名机制、权限模型、网络安全、数据加密、反调试、反逆向、代码保护、面试考点</li><li>代码示例：包含完整的安全实现代码</li><li>ASCII 架构图：包含多个架构和流程图</li><li>最佳实践：安全开发最佳实践</li></ul><p><strong>建议：</strong></p><ol><li>掌握 SELinux 的基本概念和使用</li><li>了解应用沙箱的隔离机制</li><li>熟悉签名方案的演进和验证</li><li>学习网络安全和数据加密实现</li><li>了解反调试和反逆向技术</li></ol><hr><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>已完成 14_System 模块中 5 个文件的创建：</p><ol><li><strong>06_启动流程.md</strong> - 约 84KB - 包含 Bootloader、Kernel、Init、Zygote、SystemServer、Launcher、App 启动流程等</li><li><strong>07_包安装流程.md</strong> - 约 42KB - 包含安装方式、PackageInstallerService、PMS 解析、签名验证、权限授予、dex2oat 等</li><li><strong>08_通知机制.md</strong> - 约 37KB - 包含 NotificationManager、NotificationChannel、通知优先级、通知操作、自定义样式等</li><li><strong>09_权限系统.md</strong> - 约 40KB - 包含权限级别、运行时权限、权限组、特殊权限、版本变化等</li><li><strong>10_安全机制.md</strong> - 约 48KB - 包含 SELinux、应用沙箱、签名机制、网络安全、数据加密、反调试等</li></ol><p>所有文件均包含：</p><ul><li>详细的源码分析（引用 Android 源码）</li><li>ASCII 流程图</li><li>面试考点（基础/进阶/高级）</li><li>代码示例</li><li>最佳实践建议</li></ul>`,99)])])}const g=a(l,[["render",h]]);export{c as __pageData,g as default};
