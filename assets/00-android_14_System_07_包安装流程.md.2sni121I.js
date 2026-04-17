import{_ as a,o as i,c as n,ae as p}from"./chunks/framework.DYQ7e_kq.js";const g=JSON.parse('{"title":"Android 包安装流程深度解析","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/14_System/07_包安装流程.md","filePath":"00-android/14_System/07_包安装流程.md"}'),l={name:"00-android/14_System/07_包安装流程.md"};function h(k,s,e,t,r,E){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="android-包安装流程深度解析" tabindex="-1">Android 包安装流程深度解析 <a class="header-anchor" href="#android-包安装流程深度解析" aria-label="Permalink to &quot;Android 包安装流程深度解析&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-包安装概述">包安装概述</a></li><li><a href="#2-安装方式详解">安装方式详解</a></li><li><a href="#3-packageinstallerservice">PackageInstallerService</a></li><li>[PMS 解析 APK](#4-pms 解析 apk)</li><li><a href="#5-签名验证机制">签名验证机制</a></li><li><a href="#6-权限授予流程">权限授予流程</a></li><li>[dex2oat 优化](#7-dex2oat 优化)</li><li><a href="#8-安装失败原因">安装失败原因</a></li><li><a href="#9-增量更新">增量更新</a></li><li><a href="#10-面试考点">面试考点</a></li></ol><hr><h2 id="_1-包安装概述" tabindex="-1">1. 包安装概述 <a class="header-anchor" href="#_1-包安装概述" aria-label="Permalink to &quot;1. 包安装概述&quot;">​</a></h2><h3 id="_1-1-apk-包结构" tabindex="-1">1.1 APK 包结构 <a class="header-anchor" href="#_1-1-apk-包结构" aria-label="Permalink to &quot;1.1 APK 包结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>APK 文件结构详解：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   APK 文件结构                                               │</span></span>
<span class="line"><span>│   ├─ META-INF/                                              │</span></span>
<span class="line"><span>│   │   ├─ MANIFEST.MF        # 清单文件                      │</span></span>
<span class="line"><span>│   │   ├─ SIGNATURE.RSA      # 签名文件                      │</span></span>
<span class="line"><span>│   │   └─ CODECSIGN          # 签名校验                      │</span></span>
<span class="line"><span>│   ├─ res/                           # 资源目录               │</span></span>
<span class="line"><span>│   │   ├─ drawable/          # 图片资源                      │</span></span>
<span class="line"><span>│   │   ├─ layout/            # 布局文件                      │</span></span>
<span class="line"><span>│   │   ├─ values/            # 值资源                        │</span></span>
<span class="line"><span>│   │   └─ ...                              # 其他资源         │</span></span>
<span class="line"><span>│   ├─ assets/                          # 原始资产文件         │</span></span>
<span class="line"><span>│   ├─ classes.dex                    # 编译后的 DEX 文件        │</span></span>
<span class="line"><span>│   ├─ resources.arsc             # 资源映射文件               │</span></span>
<span class="line"><span>│   ├─ AndroidManifest.xml        # 清单文件                  │</span></span>
<span class="line"><span>│   ├─ lib/                             # 原生库               │</span></span>
<span class="line"><span>│   │   ├─ arm64-v8a/         # ARM64 架构                   │</span></span>
<span class="line"><span>│   │   ├─ armeabi-v7a/       # ARMv7 架构                   │</span></span>
<span class="line"><span>│   │   ├─ x86/               # x86 架构                     │</span></span>
<span class="line"><span>│   │   └─ x86_64/            # x86_64 架构                  │</span></span>
<span class="line"><span>│   └─ ...                              # 其他文件             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-安装流程总览" tabindex="-1">1.2 安装流程总览 <a class="header-anchor" href="#_1-2-安装流程总览" aria-label="Permalink to &quot;1.2 安装流程总览&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 包安装完整流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 用户触发安装                                           │</span></span>
<span class="line"><span>│      ├─ 点击安装包                                          │</span></span>
<span class="line"><span>│      ├─ ADB 安装                                            │</span></span>
<span class="line"><span>│      └─ 系统更新                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. PackageInstallerService                                │</span></span>
<span class="line"><span>│      ├─ 接收安装请求                                        │</span></span>
<span class="line"><span>│      ├─ 验证安装权限                                        │</span></span>
<span class="line"><span>│      └─ 调用 PMS 安装                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. PackageManagerService 处理                              │</span></span>
<span class="line"><span>│      ├─ 解析 APK                                            │</span></span>
<span class="line"><span>│      ├─ 验证签名                                            │</span></span>
<span class="line"><span>│      ├─ 分配 UID/GID                                        │</span></span>
<span class="line"><span>│      ├─ 复制文件                                            │</span></span>
<span class="line"><span>│      ├─ 编译 DEX                                            │</span></span>
<span class="line"><span>│      └─ 注册组件                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. dex2oat 编译优化                                       │</span></span>
<span class="line"><span>│      ├─ DEX 到 OAT 编译                                      │</span></span>
<span class="line"><span>│      ├─ 预优化                                              │</span></span>
<span class="line"><span>│      └─ 缓存 OAT 文件                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. 安装完成                                              │</span></span>
<span class="line"><span>│      ├─ 更新包信息                                          │</span></span>
<span class="line"><span>│      ├─ 通知安装完成                                        │</span></span>
<span class="line"><span>│      └─ 清理临时文件                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_2-安装方式详解" tabindex="-1">2. 安装方式详解 <a class="header-anchor" href="#_2-安装方式详解" aria-label="Permalink to &quot;2. 安装方式详解&quot;">​</a></h2><h3 id="_2-1-系统应用安装" tabindex="-1">2.1 系统应用安装 <a class="header-anchor" href="#_2-1-系统应用安装" aria-label="Permalink to &quot;2.1 系统应用安装&quot;">​</a></h3><p>系统应用在系统启动时由 PMS 扫描安装。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>系统应用安装流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   System Image 分区                                        │</span></span>
<span class="line"><span>│   ├─ /system/app/                 # 系统应用                │</span></span>
<span class="line"><span>│   ├─ /system/priv-app/            # 特权应用                │</span></span>
<span class="line"><span>│   ├─ /system/product/             # 产品分区应用            │</span></span>
<span class="line"><span>│   └─ /system/vendor/              # 厂商分区应用            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   SystemServer 启动时                                      │</span></span>
<span class="line"><span>│   ├─ PMS 扫描系统应用目录                                    │</span></span>
<span class="line"><span>│   ├─ 解析 APK 文件                                           │</span></span>
<span class="line"><span>│   ├─ 验证签名                                              │</span></span>
<span class="line"><span>│   ├─ 安装到系统分区                                        │</span></span>
<span class="line"><span>│   └─ 注册系统组件                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>系统应用特点：</strong></p><ul><li>无需用户授权即可安装</li><li>拥有系统权限</li><li>无法卸载（某些情况下可以禁用）</li><li>位于系统分区</li></ul><h3 id="_2-2-用户应用安装" tabindex="-1">2.2 用户应用安装 <a class="header-anchor" href="#_2-2-用户应用安装" aria-label="Permalink to &quot;2.2 用户应用安装&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户应用安装流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   用户点击安装包                                            │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│   │ PackageInstaller 显示安装界面                     │       │</span></span>
<span class="line"><span>│   │ - 应用名称                                       │       │</span></span>
<span class="line"><span>│   │ - 应用图标                                       │       │</span></span>
<span class="line"><span>│   │ - 权限列表                                       │       │</span></span>
<span class="line"><span>│   │ - 安装按钮                                       │       │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   用户点击&quot;安装&quot;                                           │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│   │ PackageInstallerService 接收请求                 │       │</span></span>
<span class="line"><span>│   │ - 验证安装权限                                   │       │</span></span>
<span class="line"><span>│   │ - 调用 PMS.installPackageAsUser()               │       │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   PackageManagerService 处理                                │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   安装完成                                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-3-adb-安装" tabindex="-1">2.3 ADB 安装 <a class="header-anchor" href="#_2-3-adb-安装" aria-label="Permalink to &quot;2.3 ADB 安装&quot;">​</a></h3><p><strong>ADB 安装命令：</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 安装 APK 到默认用户</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 安装 APK 到指定用户</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --user</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 允许降级安装</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -d</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 不替换现有应用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -r</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 跳过权限验证</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --bypass-low-target-sdk-block</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app.apk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 指定安装位置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">adb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --pkgs-dir</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /data/app</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app.apk</span></span></code></pre></div><p><strong>ADB 安装源码分析：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> installPackageAsUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String hostPath,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                       PackageInstallParams params,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                       int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    enforceBlockInstallation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 复制 APK 文件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    File stagedFile </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getPackageStagedFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(hostPath, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 解析 APK</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    PackageParser.Package parsedPackage </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageParser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    parsedPackage.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(stagedFile);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 验证签名</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    verifySignature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parsedPackage);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 安装应用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    installPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parsedPackage, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_2-4-安装权限对比" tabindex="-1">2.4 安装权限对比 <a class="header-anchor" href="#_2-4-安装权限对比" aria-label="Permalink to &quot;2.4 安装权限对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>安装权限对比表：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   安装方式       权限要求       安装位置      卸载权限     │</span></span>
<span class="line"><span>│   ─────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│   系统应用       无          /system/app   需 Root      │</span></span>
<span class="line"><span>│   用户应用       无          /data/app     可卸载      │</span></span>
<span class="line"><span>│   ADB 安装       ADB 权限     /data/app     可卸载      │</span></span>
<span class="line"><span>│   商店安装       无          /data/app     可卸载      │</span></span>
<span class="line"><span>│   特权应用       系统签名    /system/priv  需系统权限  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_3-packageinstallerservice" tabindex="-1">3. PackageInstallerService <a class="header-anchor" href="#_3-packageinstallerservice" aria-label="Permalink to &quot;3. PackageInstallerService&quot;">​</a></h2><h3 id="_3-1-packageinstallerservice-概述" tabindex="-1">3.1 PackageInstallerService 概述 <a class="header-anchor" href="#_3-1-packageinstallerservice-概述" aria-label="Permalink to &quot;3.1 PackageInstallerService 概述&quot;">​</a></h3><p>PackageInstallerService 负责处理应用安装的前端交互，是用户和 PMS 之间的桥梁。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>PackageInstallerService 架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   PackageInstallerService                                   │</span></span>
<span class="line"><span>│   ├─ PackageInstaller                                       │</span></span>
<span class="line"><span>│   │   ├─ 显示安装界面                                        │</span></span>
<span class="line"><span>│   │   ├─ 接收用户操作                                        │</span></span>
<span class="line"><span>│   │   └─ 调用 InstallerService                              │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ InstallerService                                       │</span></span>
<span class="line"><span>│   │   ├─ 处理安装请求                                        │</span></span>
<span class="line"><span>│   │   ├─ 验证权限                                            │</span></span>
<span class="line"><span>│   │   └─ 调用 PMS 安装                                        │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ PackageInstallerActivity                               │</span></span>
<span class="line"><span>│       ├─ 显示应用信息                                        │</span></span>
<span class="line"><span>│       ├─ 显示权限列表                                        │</span></span>
<span class="line"><span>│       └─ 处理用户确认                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-packageinstaller-源码分析" tabindex="-1">3.2 PackageInstaller 源码分析 <a class="header-anchor" href="#_3-2-packageinstaller-源码分析" aria-label="Permalink to &quot;3.2 PackageInstaller 源码分析&quot;">​</a></h3><p><strong>PackageInstaller.java：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/com/android/content/pm/IPackageInstaller.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageInstaller</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 安装会话状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SESSION_INSTALL_PENDING </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SESSION_INSTALL_RUNNING </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SESSION_INSTALL_SUCCESS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SESSION_INSTALL_FAILURE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 安装会话</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Session</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 安装应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> install</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RemoteException;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 获取安装状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getStatus</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RemoteException;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 获取安装进度</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getProgress</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RemoteException;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 验证 APK</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RemoteException;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 创建安装会话</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Params </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RemoteException;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 获取会话</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> abstract</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Session </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> sessionId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RemoteException;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>PackageInstallerService.java：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/pm/PackageInstallerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageInstallerService</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> IPackageInstaller.Stub</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Params </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 验证参数</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        validateParams</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 创建会话</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Session session </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Session</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mSessions.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(session.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), session);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 返回会话 ID</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> session.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Session </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> sessionId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 获取会话</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mSessions.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(sessionId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Session 类</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Session</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mId;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Params mParams;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mStatus </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SESSION_INSTALL_PENDING;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mProgress </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Session</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Params </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> generateId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mParams </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> params;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> install</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 验证会话</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        checkSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 调用 PMS 安装</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        IPackageManager pm </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        pm.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">installPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mParams.packagePath, mParams.installFlags);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 更新状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mStatus </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SESSION_INSTALL_RUNNING;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-3-安装会话管理" tabindex="-1">3.3 安装会话管理 <a class="header-anchor" href="#_3-3-安装会话管理" aria-label="Permalink to &quot;3.3 安装会话管理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>安装会话状态流转：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   ┌─────────────┐   创建会话  ┌─────────────┐              │</span></span>
<span class="line"><span>│   │   None      │   ───────→  │  PENDING    │              │</span></span>
<span class="line"><span>│   └─────────────┘             └─────────────┘              │</span></span>
<span class="line"><span>│                                    ↓                       │</span></span>
<span class="line"><span>│                            用户点击安装                     │</span></span>
<span class="line"><span>│                                    ↓                       │</span></span>
<span class="line"><span>│   ┌─────────────┐   安装失败  ┌─────────────┐              │</span></span>
<span class="line"><span>│   │   CANCELLED │  ←──────── │  RUNNING    │              │</span></span>
<span class="line"><span>│   └─────────────┘   取消      └─────────────┘              │</span></span>
<span class="line"><span>│                                    ↓                       │</span></span>
<span class="line"><span>│                            安装完成                         │</span></span>
<span class="line"><span>│                                    ↓                       │</span></span>
<span class="line"><span>│   ┌─────────────┐              ┌─────────────┐              │</span></span>
<span class="line"><span>│   │   SUCCESS   │   成功      │  FAILURE    │              │</span></span>
<span class="line"><span>│   └─────────────┘   状态      └─────────────┘              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_4-pms-解析-apk" tabindex="-1">4. PMS 解析 APK <a class="header-anchor" href="#_4-pms-解析-apk" aria-label="Permalink to &quot;4. PMS 解析 APK&quot;">​</a></h2><h3 id="_4-1-packageparser-概述" tabindex="-1">4.1 PackageParser 概述 <a class="header-anchor" href="#_4-1-packageparser-概述" aria-label="Permalink to &quot;4.1 PackageParser 概述&quot;">​</a></h3><p>PackageParser 负责解析 APK 文件，提取应用信息。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>PackageParser 解析流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   PackageParser                                             │</span></span>
<span class="line"><span>│   ├─ 解析 AndroidManifest.xml                                │</span></span>
<span class="line"><span>│   │   ├─ 应用包名                                            │</span></span>
<span class="line"><span>│   │   ├─ 应用版本                                            │</span></span>
<span class="line"><span>│   │   ├─ 应用组件                                            │</span></span>
<span class="line"><span>│   │   ├─ 应用权限                                            │</span></span>
<span class="line"><span>│   │   └─ 应用特征                                            │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 解析 resources.arsc                                     │</span></span>
<span class="line"><span>│   │   ├─ 资源 ID 映射                                          │</span></span>
<span class="line"><span>│   │   ├─ 资源类型                                            │</span></span>
<span class="line"><span>│   │   └─ 资源字符串                                          │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 解析 classes.dex                                        │</span></span>
<span class="line"><span>│   │   ├─ 类列表                                              │</span></span>
<span class="line"><span>│   │   ├─ 方法列表                                            │</span></span>
<span class="line"><span>│   │   └─ 字段列表                                            │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 解析其他文件                                             │</span></span>
<span class="line"><span>│       ├─ lib 库文件                                           │</span></span>
<span class="line"><span>│       ├─ assets 资源                                          │</span></span>
<span class="line"><span>│       └─ 其他文件                                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-androidmanifest-xml-解析" tabindex="-1">4.2 AndroidManifest.xml 解析 <a class="header-anchor" href="#_4-2-androidmanifest-xml-解析" aria-label="Permalink to &quot;4.2 AndroidManifest.xml 解析&quot;">​</a></h3><p><strong>AndroidManifest.xml 结构：</strong></p><div class="language-xml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">xml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;?</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">xml</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> version</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1.0&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> encoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;utf-8&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">?&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">manifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    xmlns:android</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;http://schemas.android.com/apk/res/android&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.example.app&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    android:versionCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    android:versionName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    android:installLocation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;auto&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    &lt;!-- 权限声明 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">uses-permission</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;android.permission.INTERNET&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">uses-permission</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;android.permission.CAMERA&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    &lt;!-- 特性声明 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">uses-feature</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;android.hardware.camera&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:required</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    &lt;!-- 应用组件 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">application</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:icon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@mipmap/ic_launcher&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:label</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@string/app_name&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        android:theme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@style/AppTheme&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        &lt;!-- Activity --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">activity</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.MainActivity&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  android:exported</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">intent-filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">action</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;android.intent.action.MAIN&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">category</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;android.intent.category.LAUNCHER&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">intent-filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">activity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        &lt;!-- Service --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">service</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.MyService&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                 android:exported</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        &lt;!-- BroadcastReceiver --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">receiver</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.MyReceiver&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  android:exported</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        &lt;!-- ContentProvider --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">provider</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> android:name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.MyProvider&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  android:authorities</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.example.app.provider&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                  android:exported</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">application</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">manifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>PackageParser 解析源码：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/packages/PackageManagerService/PackageParser.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageParser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Package </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parsePackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(File </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">packageFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ParseException {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 打开 APK 文件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ZipFile zipFile </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ZipFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageFile);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 解析 AndroidManifest.xml</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        XmlResourceParser parser </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openXml</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(zipFile, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;AndroidManifest.xml&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Package parsedPackage </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parseManifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 解析 resources.arsc</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Resources resources </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadResources</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(zipFile);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 4. 解析其他文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        parseAssets</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(zipFile);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parsedPackage;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Package </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parseManifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(XmlResourceParser </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">parser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Package pkg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">next</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> XmlPullParser.END_DOCUMENT) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;manifest&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 解析包名</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.packageName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAttributeValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;package&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 解析版本</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.versionCode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getIntAttribute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;versionCode&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.versionName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAttributeValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;versionName&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 解析权限</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.permissions </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parsePermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 解析组件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.activities </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parseComponents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;activity&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.services </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parseComponents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;service&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.receivers </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parseComponents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;receiver&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    pkg.providers </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parseComponents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;provider&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Exception </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ParseException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Failed to parse manifest&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pkg;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_4-3-package-对象结构" tabindex="-1">4.3 Package 对象结构 <a class="header-anchor" href="#_4-3-package-对象结构" aria-label="Permalink to &quot;4.3 Package 对象结构&quot;">​</a></h3><p><strong>Package 对象：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/packages/PackageManagerService/PackageParser.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 包名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String packageName;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 版本信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> versionCode;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String versionName;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 应用信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ApplicationInfo applicationInfo;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 组件列表</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Activity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; activities;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; services;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Receiver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; receivers;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; providers;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 权限信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Permission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; permissions;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] requestedPermissions;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 签名信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageSigner signer;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 安装路径</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String codePath;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String nativeLibPath;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 其他信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> flags;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sdkVersion;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String targetSdkVersion;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_5-签名验证机制" tabindex="-1">5. 签名验证机制 <a class="header-anchor" href="#_5-签名验证机制" aria-label="Permalink to &quot;5. 签名验证机制&quot;">​</a></h2><h3 id="_5-1-签名概述" tabindex="-1">5.1 签名概述 <a class="header-anchor" href="#_5-1-签名概述" aria-label="Permalink to &quot;5.1 签名概述&quot;">​</a></h3><p>签名是 Android 应用安全的基础，用于验证应用来源和完整性。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 签名机制：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   签名流程                                                  │</span></span>
<span class="line"><span>│   ├─ 开发者生成密钥对                                       │</span></span>
<span class="line"><span>│   │   ├─ 公钥                                               │</span></span>
<span class="line"><span>│   │   └─ 私钥                                               │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ 使用私钥对 APK 签名                                      │</span></span>
<span class="line"><span>│   │   ├─ 计算 APK 摘要                                        │</span></span>
<span class="line"><span>│   │   ├─ 使用私钥加密摘要                                     │</span></span>
<span class="line"><span>│   │   └─ 生成签名文件                                        │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ 安装时验证签名                                         │</span></span>
<span class="line"><span>│       ├─ 使用公钥解密签名                                     │</span></span>
<span class="line"><span>│       ├─ 计算 APK 摘要                                        │</span></span>
<span class="line"><span>│       └─ 对比摘要验证完整性                                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-签名生成" tabindex="-1">5.2 签名生成 <a class="header-anchor" href="#_5-2-签名生成" aria-label="Permalink to &quot;5.2 签名生成&quot;">​</a></h3><p><strong>使用 keytool 生成密钥：</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 生成密钥库</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">keytool</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -genkey</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -keystore</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-release-key.jks</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -alias</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-key-alias</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -keyalg</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> RSA</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -keysize</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2048</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -validity</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看密钥库信息</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">keytool</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -list</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -v</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -keystore</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-release-key.jks</span></span></code></pre></div><p><strong>使用 jarsigner 签名：</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 签名 APK</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">jarsigner</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -verbose</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -sigalg</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> SHA1withRSA</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -digestalg</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> SHA1</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -keystore</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> my-release-key.jks</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    release-unsigned.apk</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    my-key-alias</span></span></code></pre></div><h3 id="_5-3-签名验证源码" tabindex="-1">5.3 签名验证源码 <a class="header-anchor" href="#_5-3-签名验证源码" aria-label="Permalink to &quot;5.3 签名验证源码&quot;">​</a></h3><p><strong>PackageSigner 验证：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/packages/PackageManagerService/PackageSigner.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageSigner</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> Certificate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] mCertificates;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SigningDetails mSigningDetails;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageSigner</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Certificate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">certificates</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mCertificates </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> certificates;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mSigningDetails </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SigningDetails</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 验证签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(File </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">packageFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> IOException {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 读取 APK 文件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        JarFile jarFile </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> JarFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageFile);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 获取签名信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        java.security.cert.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Certificate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] certs </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> jarFile.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCertificates</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 验证签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Certificate cert </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> certs) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">verifySignature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cert)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifySignature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Certificate </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">cert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 获取公钥</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        PublicKey publicKey </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cert.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPublicKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 验证签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Signature signature </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Signature.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;SHA1withRSA&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            signature.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">initVerify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(publicKey);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 3. 计算 APK 摘要</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            MessageDigest digest </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MessageDigest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;SHA-1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            digest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">readFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageFile));</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            byte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] digestBytes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> digest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">digest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 4. 验证签名</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            signature.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(digestBytes);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> signature.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSignatureBytes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Exception </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-4-签名方案演进" tabindex="-1">5.4 签名方案演进 <a class="header-anchor" href="#_5-4-签名方案演进" aria-label="Permalink to &quot;5.4 签名方案演进&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 签名方案演进：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v1 签名 (Android 4.0+)                                     │</span></span>
<span class="line"><span>│   ├─ 在 META-INF 目录中存储签名                               │</span></span>
<span class="line"><span>│   ├─ 基于 JAR 签名机制                                       │</span></span>
<span class="line"><span>│   └─ 签名文件：CERT.SF, CERT.RSA                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v2 签名 (Android 7.0+)                                     │</span></span>
<span class="line"><span>│   ├─ 全 APK 签名                                             │</span></span>
<span class="line"><span>│   ├─ 签名包含在 APK 头部                                      │</span></span>
<span class="line"><span>│   ├─ 签名验证更快                                           │</span></span>
<span class="line"><span>│   └─ 支持增量更新                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v3 签名 (Android 8.0+)                                     │</span></span>
<span class="line"><span>│   ├─ 在 v2 基础上增加证书吊销列表                              │</span></span>
<span class="line"><span>│   ├─ 支持证书吊销                                           │</span></span>
<span class="line"><span>│   └─ 向后兼容 v2                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   v4 签名 (Android 9.0+)                                     │</span></span>
<span class="line"><span>│   ├─ 在 v3 基础上增加包完整性验证                              │</span></span>
<span class="line"><span>│   ├─ 支持 APK 完整性验证                                      │</span></span>
<span class="line"><span>│   └─ 向后兼容 v3                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_6-权限授予流程" tabindex="-1">6. 权限授予流程 <a class="header-anchor" href="#_6-权限授予流程" aria-label="Permalink to &quot;6. 权限授予流程&quot;">​</a></h2><h3 id="_6-1-权限分类" tabindex="-1">6.1 权限分类 <a class="header-anchor" href="#_6-1-权限分类" aria-label="Permalink to &quot;6.1 权限分类&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>权限分类详解：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   普通权限 (Normal)                                         │</span></span>
<span class="line"><span>│   ├─ 不影响用户隐私                                         │</span></span>
<span class="line"><span>│   ├─ 安装时自动授予                                         │</span></span>
<span class="line"><span>│   └─ 示例：INTERNET, ACCESS_NETWORK_STATE                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   危险权限 (Dangerous)                                      │</span></span>
<span class="line"><span>│   ├─ 涉及用户隐私                                           │</span></span>
<span class="line"><span>│   ├─ 运行时请求                                             │</span></span>
<span class="line"><span>│   └─ 示例：CAMERA, LOCATION, CONTACTS                       │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   签名权限 (Signature)                                      │</span></span>
<span class="line"><span>│   ├─ 需要系统签名                                           │</span></span>
<span class="line"><span>│   ├─ 仅限系统应用                                           │</span></span>
<span class="line"><span>│   └─ 示例：REBOOT, SET_DEBUG_APP                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   特殊权限 (Special)                                        │</span></span>
<span class="line"><span>│   ├─ 需要用户手动授权                                       │</span></span>
<span class="line"><span>│   ├─ 通过系统设置授予                                       │</span></span>
<span class="line"><span>│   └─ 示例：BIND_ACCESSIBILITY_SERVICE, BIND_VPN_SERVICE     │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_6-2-权限授予流程" tabindex="-1">6.2 权限授予流程 <a class="header-anchor" href="#_6-2-权限授予流程" aria-label="Permalink to &quot;6.2 权限授予流程&quot;">​</a></h3><p><strong>运行时权限请求流程：</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>运行时权限请求：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   应用请求权限                                              │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   Activity.requestPermissions()                             │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│   │ AMS 处理权限请求                                  │       │</span></span>
<span class="line"><span>│   │ - 检查权限级别                                  │       │</span></span>
<span class="line"><span>│   │ - 检查是否已授权                                │       │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   系统显示权限对话框                                        │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   用户选择允许或拒绝                                        │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   更新权限数据库                                            │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   回调 onRequestPermissionsResult()                         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_6-3-权限授予源码" tabindex="-1">6.3 权限授予源码 <a class="header-anchor" href="#_6-3-权限授予源码" aria-label="Permalink to &quot;6.3 权限授予源码&quot;">​</a></h3><p><strong>PackageManagerService 权限授予：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> grantRuntimePermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String packageName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                          String permissionName,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                          int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取权限信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    PermissionInfo permissionInfo </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getPermissionInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permissionName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 验证权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validatePermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permissionInfo);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 更新权限授予状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mPermissionEntries.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageName, permissionName, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 通知 AMS</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mActivityManagerService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">permissionGranted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageName, permissionName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 权限检查</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> checkPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String permissionName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                      String packageName,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                                      int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取权限授予状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> granted </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mPermissionEntries.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageName, permissionName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 返回权限状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> granted;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_7-dex2oat-优化" tabindex="-1">7. dex2oat 优化 <a class="header-anchor" href="#_7-dex2oat-优化" aria-label="Permalink to &quot;7. dex2oat 优化&quot;">​</a></h2><h3 id="_7-1-dex2oat-概述" tabindex="-1">7.1 dex2oat 概述 <a class="header-anchor" href="#_7-1-dex2oat-概述" aria-label="Permalink to &quot;7.1 dex2oat 概述&quot;">​</a></h3><p>dex2oat 是将 DEX 文件编译成 OAT 文件的工具，提升应用启动和运行性能。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>dex2oat 编译流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   DEX 文件                                                   │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   dex2oat 编译器                                            │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   OAT 文件 (Native 代码)                                    │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   缓存到 /data/dalvik-vm-cache                               │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   应用启动时加载 OAT                                        │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   更快的执行速度                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_7-2-oat-文件结构" tabindex="-1">7.2 OAT 文件结构 <a class="header-anchor" href="#_7-2-oat-文件结构" aria-label="Permalink to &quot;7.2 OAT 文件结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OAT 文件结构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   OAT 文件                                                  │</span></span>
<span class="line"><span>│   ├─ OAT Header                                            │</span></span>
<span class="line"><span>│   │   ├─ Magic Number                                      │</span></span>
<span class="line"><span>│   │   ├─ Version                                           │</span></span>
<span class="line"><span>│   │   └─ File Info                                         │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ Code Cache                                            │</span></span>
<span class="line"><span>│   │   ├─ Compiled Methods                                  │</span></span>
<span class="line"><span>│   │   ├─ JIT Code                                          │</span></span>
<span class="line"><span>│   │   └─ Debug Info                                        │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   ├─ Image Segment                                         │</span></span>
<span class="line"><span>│   │   ├─ Runtime Image                                     │</span></span>
<span class="line"><span>│   │   ├─ Class Images                                      │</span></span>
<span class="line"><span>│   │   └─ Static Data                                       │</span></span>
<span class="line"><span>│   │                                                             │</span></span>
<span class="line"><span>│   └─ DEX Files                                             │</span></span>
<span class="line"><span>│       ├─ Primary DEX                                       │</span></span>
<span class="line"><span>│       ├─ Secondary DEX                                     │</span></span>
<span class="line"><span>│       └─ Optimization Info                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_7-3-编译模式" tabindex="-1">7.3 编译模式 <a class="header-anchor" href="#_7-3-编译模式" aria-label="Permalink to &quot;7.3 编译模式&quot;">​</a></h3><p><strong>编译模式对比：</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>编译模式对比：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Speed             Size            Space                   │</span></span>
<span class="line"><span>│   ──────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│   快速启动          小文件          节省空间                │</span></span>
<span class="line"><span>│   平衡模式          中等文件        平衡                    │</span></span>
<span class="line"><span>│   优化模式          大文件          占用更多空间            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_8-安装失败原因" tabindex="-1">8. 安装失败原因 <a class="header-anchor" href="#_8-安装失败原因" aria-label="Permalink to &quot;8. 安装失败原因&quot;">​</a></h2><h3 id="_8-1-常见安装失败原因" tabindex="-1">8.1 常见安装失败原因 <a class="header-anchor" href="#_8-1-常见安装失败原因" aria-label="Permalink to &quot;8.1 常见安装失败原因&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>安装失败原因分类：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   签名相关                                                  │</span></span>
<span class="line"><span>│   ├─ 签名验证失败                                          │</span></span>
<span class="line"><span>│   ├─ 签名不匹配                                            │</span></span>
<span class="line"><span>│   └─ 证书过期                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   版本相关                                                  │</span></span>
<span class="line"><span>│   ├─ 版本冲突                                              │</span></span>
<span class="line"><span>│   ├─ 无法降级安装                                          │</span></span>
<span class="line"><span>│   └─ 版本不兼容                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   存储相关                                                  │</span></span>
<span class="line"><span>│   ├─ 存储空间不足                                          │</span></span>
<span class="line"><span>│   ├─ 存储路径无效                                          │</span></span>
<span class="line"><span>│   └─ 存储权限不足                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限相关                                                  │</span></span>
<span class="line"><span>│   ├─ 权限拒绝                                              │</span></span>
<span class="line"><span>│   ├─ 权限不匹配                                            │</span></span>
<span class="line"><span>│   └─ 特殊权限未授权                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   系统相关                                                  │</span></span>
<span class="line"><span>│   ├─ 系统版本不兼容                                        │</span></span>
<span class="line"><span>│   ├─ 系统组件冲突                                          │</span></span>
<span class="line"><span>│   └─ 系统资源不足                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_8-2-错误代码" tabindex="-1">8.2 错误代码 <a class="header-anchor" href="#_8-2-错误代码" aria-label="Permalink to &quot;8.2 错误代码&quot;">​</a></h3><p><strong>PackageManager 安装错误代码：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/com/android/content/pm/IPackageManager.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageManager</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 安装成功</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_SUCCEEDED </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 安装失败</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_ALREADY_EXISTS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_INVALID_URI </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_PARSE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_NEWER </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_UPDATE_INCOMPATIBLE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_ARCH_MISMATCH </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_NO_MATCHING_ABIS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_CONTAINER_DIR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_INTERNAL_ERROR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_INVALID_APK </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 11</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_INSUFFICIENT_STORAGE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_BLOCKED </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 13</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_CANCELLED </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 14</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_OLDER </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 15</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_DOWNGRADE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_UPDATE_DATA_LOSS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 17</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_MISSING_FEATURE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 18</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_REPLACE_COULDNT_DELETE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 19</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_TEST_ONLY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_CPU_ABI_INCOMPATIBLE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 21</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_DEPENDENCY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 22</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_8-3-安装失败处理" tabindex="-1">8.3 安装失败处理 <a class="header-anchor" href="#_8-3-安装失败处理" aria-label="Permalink to &quot;8.3 安装失败处理&quot;">​</a></h3><p><strong>异常处理代码：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 安装失败处理</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onInstallFailed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> errorCode, String message) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (errorCode) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_SUCCEEDED</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 安装成功</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_ALREADY_EXISTS</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 已存在，提示用户更新</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showUpdateDialog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_INSUFFICIENT_STORAGE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 存储空间不足</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showStorageError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_INVALID_APK</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // APK 无效</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showInvalidApkError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INSTALL_FAILED_UPDATE_INCOMPATIBLE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 更新不兼容</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showIncompatibleError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        default:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 其他错误</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(errorCode, message);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_9-增量更新" tabindex="-1">9. 增量更新 <a class="header-anchor" href="#_9-增量更新" aria-label="Permalink to &quot;9. 增量更新&quot;">​</a></h2><h3 id="_9-1-增量更新原理" tabindex="-1">9.1 增量更新原理 <a class="header-anchor" href="#_9-1-增量更新原理" aria-label="Permalink to &quot;9.1 增量更新原理&quot;">​</a></h3><p>增量更新只下载变更部分，减少下载时间和流量消耗。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>增量更新流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   旧版本 APK         新版本 APK                              │</span></span>
<span class="line"><span>│        ↓                ↓                                    │</span></span>
<span class="line"><span>│   ┌──────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│   │    对比分析差异                      │                 │</span></span>
<span class="line"><span>│   │    - 代码变更                         │                 │</span></span>
<span class="line"><span>│   │    - 资源变更                         │                 │</span></span>
<span class="line"><span>│   │    - 文件变更                         │                 │</span></span>
<span class="line"><span>│   └──────────────────────────────────────┘                 │</span></span>
<span class="line"><span>│        ↓                                                   │</span></span>
<span class="line"><span>│   生成增量补丁包 (Delta Patch)                              │</span></span>
<span class="line"><span>│        ↓                                                   │</span></span>
<span class="line"><span>│   下载增量补丁包                                            │</span></span>
<span class="line"><span>│        ↓                                                   │</span></span>
<span class="line"><span>│   应用补丁包                                                │</span></span>
<span class="line"><span>│        ↓                                                   │</span></span>
<span class="line"><span>│   生成完整 APK                                              │</span></span>
<span class="line"><span>│        ↓                                                   │</span></span>
<span class="line"><span>│   验证签名                                                  │</span></span>
<span class="line"><span>│        ↓                                                   │</span></span>
<span class="line"><span>│   安装新版本                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_9-2-增量更新实现" tabindex="-1">9.2 增量更新实现 <a class="header-anchor" href="#_9-2-增量更新实现" aria-label="Permalink to &quot;9.2 增量更新实现&quot;">​</a></h3><p><strong>bsdiff 算法：</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>bsdiff 算法原理：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 对比新旧文件                                            │</span></span>
<span class="line"><span>│      ├─ 计算搜索表                                          │</span></span>
<span class="line"><span>│      ├─ 查找相同块                                          │</span></span>
<span class="line"><span>│      └─ 标记差异块                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 生成补丁文件                                           │</span></span>
<span class="line"><span>│      ├─ 记录相同块位置                                      │</span></span>
<span class="line"><span>│      ├─ 记录差异块内容                                      │</span></span>
<span class="line"><span>│      └─ 生成补丁数据                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 应用补丁文件                                           │</span></span>
<span class="line"><span>│      ├─ 读取旧文件                                          │</span></span>
<span class="line"><span>│      ├─ 应用补丁数据                                        │</span></span>
<span class="line"><span>│      └─ 生成新文件                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_10-面试考点" tabindex="-1">10. 面试考点 <a class="header-anchor" href="#_10-面试考点" aria-label="Permalink to &quot;10. 面试考点&quot;">​</a></h2><h3 id="_10-1-基础考点" tabindex="-1">10.1 基础考点 <a class="header-anchor" href="#_10-1-基础考点" aria-label="Permalink to &quot;10.1 基础考点&quot;">​</a></h3><p><strong>1. APK 包结构？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   APK 包结构                                                │</span></span>
<span class="line"><span>│   ├─ META-INF/         # 签名目录                           │</span></span>
<span class="line"><span>│   ├─ res/              # 资源目录                           │</span></span>
<span class="line"><span>│   ├─ assets/           # 原始资产                           │</span></span>
<span class="line"><span>│   ├─ classes.dex       # 编译后的代码                       │</span></span>
<span class="line"><span>│   ├─ resources.arsc    # 资源映射                           │</span></span>
<span class="line"><span>│   ├─ AndroidManifest.xml # 清单文件                         │</span></span>
<span class="line"><span>│   └─ lib/              # 原生库                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 安装流程是什么？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   安装流程                                                  │</span></span>
<span class="line"><span>│   ├─ 用户触发安装                                          │</span></span>
<span class="line"><span>│   ├─ PackageInstallerService 处理                            │</span></span>
<span class="line"><span>│   ├─ PMS 解析 APK                                          │</span></span>
<span class="line"><span>│   ├─ 验证签名                                              │</span></span>
<span class="line"><span>│   ├─ 分配 UID/GID                                          │</span></span>
<span class="line"><span>│   ├─ 复制文件                                              │</span></span>
<span class="line"><span>│   ├─ dex2oat 编译                                          │</span></span>
<span class="line"><span>│   └─ 注册组件                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-2-进阶考点" tabindex="-1">10.2 进阶考点 <a class="header-anchor" href="#_10-2-进阶考点" aria-label="Permalink to &quot;10.2 进阶考点&quot;">​</a></h3><p><strong>1. 签名验证机制？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   签名验证                                                  │</span></span>
<span class="line"><span>│   ├─ 使用私钥签名                                          │</span></span>
<span class="line"><span>│   ├─ 计算 APK 摘要                                          │</span></span>
<span class="line"><span>│   ├─ 加密摘要                                              │</span></span>
<span class="line"><span>│   ├─ 验证时解密签名                                        │</span></span>
<span class="line"><span>│   ├─ 计算当前 APK 摘要                                       │</span></span>
<span class="line"><span>│   └─ 对比摘要验证完整性                                     │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 权限授予流程？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限授予                                                  │</span></span>
<span class="line"><span>│   ├─ 普通权限：安装时自动授予                               │</span></span>
<span class="line"><span>│   ├─ 危险权限：运行时请求                                   │</span></span>
<span class="line"><span>│   ├─ 签名权限：系统签名应用                                 │</span></span>
<span class="line"><span>│   └─ 特殊权限：系统设置授予                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-3-高级考点" tabindex="-1">10.3 高级考点 <a class="header-anchor" href="#_10-3-高级考点" aria-label="Permalink to &quot;10.3 高级考点&quot;">​</a></h3><p><strong>1. dex2oat 优化原理？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   dex2oat 优化                                              │</span></span>
<span class="line"><span>│   ├─ 将 DEX 编译成 Native 代码                                │</span></span>
<span class="line"><span>│   ├─ 提升执行速度                                          │</span></span>
<span class="line"><span>│   ├─ 减少启动时间                                          │</span></span>
<span class="line"><span>│   ├─ 支持多种编译模式                                      │</span></span>
<span class="line"><span>│   └─ 缓存 OAT 文件                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 增量更新原理？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   增量更新                                                  │</span></span>
<span class="line"><span>│   ├─ 对比新旧版本差异                                      │</span></span>
<span class="line"><span>│   ├─ 生成增量补丁包                                        │</span></span>
<span class="line"><span>│   ├─ 下载增量补丁包                                        │</span></span>
<span class="line"><span>│   ├─ 应用补丁包                                            │</span></span>
<span class="line"><span>│   └─ 生成完整 APK                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><p><strong>文档信息：</strong></p><ul><li>字数：约 13000 字</li><li>包含：安装方式、PackageInstallerService、PMS 解析 APK、签名验证、权限授予、dex2oat 优化、安装失败原因、增量更新、面试考点</li><li>源码引用：PackageParser.java、PackageSigner.java、PackageManagerService.java、PackageInstallerService.java 等</li><li>ASCII 流程图：包含多个流程时序图和状态机图</li><li>最佳实践：安装优化建议、签名最佳实践、权限请求最佳实践</li></ul><p><strong>建议：</strong></p><ol><li>学习源码时，结合实际安装包进行调试</li><li>掌握不同签名方案的区别和应用场景</li><li>了解 dex2oat 优化原理和编译模式选择</li></ol>`,125)])])}const c=a(l,[["render",h]]);export{g as __pageData,c as default};
