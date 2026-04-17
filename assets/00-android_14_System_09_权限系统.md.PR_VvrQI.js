import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.DYQ7e_kq.js";const c=JSON.parse('{"title":"Android 权限系统深度解析","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/14_System/09_权限系统.md","filePath":"00-android/14_System/09_权限系统.md"}'),l={name:"00-android/14_System/09_权限系统.md"};function e(h,s,t,k,E,r){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="android-权限系统深度解析" tabindex="-1">Android 权限系统深度解析 <a class="header-anchor" href="#android-权限系统深度解析" aria-label="Permalink to &quot;Android 权限系统深度解析&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-权限系统概述">权限系统概述</a></li><li><a href="#2-权限级别详解">权限级别详解</a></li><li><a href="#3-运行时权限-android-60">运行时权限 (Android 6.0+)</a></li><li><a href="#4-权限组-permission-groups">权限组（Permission Groups）</a></li><li><a href="#5-权限拒绝处理">权限拒绝处理</a></li><li><a href="#6-特殊权限">特殊权限</a></li><li><a href="#7-权限自动授予">权限自动授予</a></li><li><a href="#8-权限检查最佳实践">权限检查最佳实践</a></li><li><a href="#9-android-版本权限变化">Android 版本权限变化</a></li><li><a href="#10-面试考点">面试考点</a></li></ol><hr><h2 id="_1-权限系统概述" tabindex="-1">1. 权限系统概述 <a class="header-anchor" href="#_1-权限系统概述" aria-label="Permalink to &quot;1. 权限系统概述&quot;">​</a></h2><h3 id="_1-1-权限系统架构" tabindex="-1">1.1 权限系统架构 <a class="header-anchor" href="#_1-1-权限系统架构" aria-label="Permalink to &quot;1.1 权限系统架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 权限系统架构：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   应用层                                                    │</span></span>
<span class="line"><span>│   ├─ 声明权限（AndroidManifest.xml）                        │</span></span>
<span class="line"><span>│   ├─ 请求权限（运行时）                                      │</span></span>
<span class="line"><span>│   └─ 检查权限（代码中）                                      │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   框架层                                                    │</span></span>
<span class="line"><span>│   ├─ PackageManagerService 管理权限                          │</span></span>
<span class="line"><span>│   ├─ ActivityManagerService 处理权限请求                     │</span></span>
<span class="line"><span>│   └─ PermissionController 控制权限                           │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   系统层                                                    │</span></span>
<span class="line"><span>│   ├─ SELinux 强制访问控制                                    │</span></span>
<span class="line"><span>│   ├─ 沙箱隔离                                                │</span></span>
<span class="line"><span>│   └─ 内核权限检查                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-权限发展历程" tabindex="-1">1.2 权限发展历程 <a class="header-anchor" href="#_1-2-权限发展历程" aria-label="Permalink to &quot;1.2 权限发展历程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 权限系统演进：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 5.1 及之前                                        │</span></span>
<span class="line"><span>│   ├─ 安装时授权                                              │</span></span>
<span class="line"><span>│   ├─ 全有或全无                                              │</span></span>
<span class="line"><span>│   ├─ 用户无法选择权限                                        │</span></span>
<span class="line"><span>│   └─ 权限一次性授予                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 6.0 (M)                                           │</span></span>
<span class="line"><span>│   ├─ 运行时权限引入                                          │</span></span>
<span class="line"><span>│   ├─ 危险权限需要运行时请求                                   │</span></span>
<span class="line"><span>│   ├─ 用户可选择性授权                                        │</span></span>
<span class="line"><span>│   └─ 权限可动态撤销                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 7.0 (N)                                           │</span></span>
<span class="line"><span>│   ├─ 权限组优化                                              │</span></span>
<span class="line"><span>│   ├─ 权限请求优化                                            │</span></span>
<span class="line"><span>│   └─ 后台权限限制开始                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 8.0 (O)                                           │</span></span>
<span class="line"><span>│   ├─ 后台启动限制                                            │</span></span>
<span class="line"><span>│   ├─ 精确位置权限                                            │</span></span>
<span class="line"><span>│   └─ 通知权限细化                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 9.0 (Pie)                                         │</span></span>
<span class="line"><span>│   ├─ 分区增强                                                │</span></span>
<span class="line"><span>│   ├─ 后台位置限制                                            │</span></span>
<span class="line"><span>│   └─ 权限使用限制                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 10 (Q)                                            │</span></span>
<span class="line"><span>│   ├─ 模糊位置权限                                            │</span></span>
<span class="line"><span>│   ├─ 后台权限限制加强                                        │</span></span>
<span class="line"><span>│   ├─ 分区存储                                                │</span></span>
<span class="line"><span>│   └─ 权限自动授予优化                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 11 (R)                                            │</span></span>
<span class="line"><span>│   ├─ 一次性权限                                              │</span></span>
<span class="line"><span>│   ├─ 后台权限限制进一步                                      │</span></span>
<span class="line"><span>│   ├─ 权限使用情况显示                                        │</span></span>
<span class="line"><span>│   └─ 通知权限分类                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 12 (S)                                            │</span></span>
<span class="line"><span>│   ├─ 通知权限强制请求                                        │</span></span>
<span class="line"><span>│   ├─ 权限请求优化                                            │</span></span>
<span class="line"><span>│   ├─ 权限使用情况报告                                        │</span></span>
<span class="line"><span>│   └─ 后台权限限制更严格                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 13 (T)                                            │</span></span>
<span class="line"><span>│   ├─ 媒体权限拆分                                            │</span></span>
<span class="line"><span>│   ├─ 通知权限正式引入                                        │</span></span>
<span class="line"><span>│   ├─ 短信权限细化                                            │</span></span>
<span class="line"><span>│   └─ 通话权限细化                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 14 (U)                                            │</span></span>
<span class="line"><span>│   ├─ 权限请求优化                                            │</span></span>
<span class="line"><span>│   ├─ 权限使用追踪                                            │</span></span>
<span class="line"><span>│   ├─ 权限管理改进                                            │</span></span>
<span class="line"><span>│   └─ 隐私权限增强                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_2-权限级别详解" tabindex="-1">2. 权限级别详解 <a class="header-anchor" href="#_2-权限级别详解" aria-label="Permalink to &quot;2. 权限级别详解&quot;">​</a></h2><h3 id="_2-1-普通权限-normal" tabindex="-1">2.1 普通权限 (Normal) <a class="header-anchor" href="#_2-1-普通权限-normal" aria-label="Permalink to &quot;2.1 普通权限 (Normal)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>普通权限特点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   特点                                                      │</span></span>
<span class="line"><span>│   ├─ 不影响用户隐私                                         │</span></span>
<span class="line"><span>│   ├─ 安装时自动授予                                         │</span></span>
<span class="line"><span>│   ├─ 不需要用户确认                                         │</span></span>
<span class="line"><span>│   └─ 不需要运行时请求                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   示例权限                                                  │</span></span>
<span class="line"><span>│   ├─ INTERNET         # 网络访问                           │</span></span>
<span class="line"><span>│   ├─ ACCESS_NETWORK_STATE  # 网络状态                      │</span></span>
<span class="line"><span>│   ├─ VIBRATE          # 振动                               │</span></span>
<span class="line"><span>│   ├─ WRITE_SETTINGS   # 写入设置 (实际是 signature)        │</span></span>
<span class="line"><span>│   ├─ RECEIVE_BOOT_COMPLETED # 开机广播                     │</span></span>
<span class="line"><span>│   ├─ FOREGROUND_SERVICE # 前台服务                          │</span></span>
<span class="line"><span>│   └─ POST_NOTIFICATIONS # 发送通知 (Android 13+ 需请求)    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-危险权限-dangerous" tabindex="-1">2.2 危险权限 (Dangerous) <a class="header-anchor" href="#_2-2-危险权限-dangerous" aria-label="Permalink to &quot;2.2 危险权限 (Dangerous)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>危险权限分类：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   相机权限                                                  │</span></span>
<span class="line"><span>│   ├─ CAMERA           # 访问相机                           │</span></span>
<span class="line"><span>│   └─ 涉及用户隐私，需要运行时请求                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   位置权限                                                  │</span></span>
<span class="line"><span>│   ├─ ACCESS_FINE_LOCATION   # 精确位置                      │</span></span>
<span class="line"><span>│   ├─ ACCESS_COARSE_LOCATION # 模糊位置                      │</span></span>
<span class="line"><span>│   └─ 涉及用户位置隐私                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   通讯录权限                                                │</span></span>
<span class="line"><span>│   ├─ READ_CONTACTS      # 读取通讯录                        │</span></span>
<span class="line"><span>│   ├─ WRITE_CONTACTS     # 写入通讯录                        │</span></span>
<span class="line"><span>│   └─ 涉及用户联系人隐私                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   日历权限                                                  │</span></span>
<span class="line"><span>│   ├─ READ_CALENDAR      # 读取日历                          │</span></span>
<span class="line"><span>│   ├─ WRITE_CALENDAR     # 写入日历                          │</span></span>
<span class="line"><span>│   └─ 涉及用户日程隐私                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   电话权限                                                  │</span></span>
<span class="line"><span>│   ├─ CALL_PHONE         # 拨打电话                          │</span></span>
<span class="line"><span>│   ├─ READ_PHONE_STATE   # 读取电话状态                      │</span></span>
<span class="line"><span>│   ├─ READ_PHONE_NUMBERS # 读取电话号码                      │</span></span>
<span class="line"><span>│   ├─ READ_CALL_LOG      # 读取通话记录                      │</span></span>
<span class="line"><span>│   ├─ WRITE_CALL_LOG     # 写入通话记录                      │</span></span>
<span class="line"><span>│   └─ 涉及用户通话隐私                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   短信权限                                                  │</span></span>
<span class="line"><span>│   ├─ SEND_SMS           # 发送短信                          │</span></span>
<span class="line"><span>│   ├─ RECEIVE_SMS        # 接收短信                          │</span></span>
<span class="line"><span>│   ├─ READ_SMS           # 读取短信                          │</span></span>
<span class="line"><span>│   └─ 涉及用户短信隐私                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   存储权限                                                  │</span></span>
<span class="line"><span>│   ├─ READ_EXTERNAL_STORAGE   # 读取外部存储                 │</span></span>
<span class="line"><span>│   ├─ WRITE_EXTERNAL_STORAGE  # 写入外部存储                 │</span></span>
<span class="line"><span>│   ├─ MANAGE_EXTERNAL_STORAGE # 管理所有文件 (Android 11+)   │</span></span>
<span class="line"><span>│   └─ 涉及用户文件隐私                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   传感器权限                                                │</span></span>
<span class="line"><span>│   ├─ BODY_SENSORS     # 身体传感器                          │</span></span>
<span class="line"><span>│   └─ 涉及用户健康数据                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-3-签名权限-signature" tabindex="-1">2.3 签名权限 (Signature) <a class="header-anchor" href="#_2-3-签名权限-signature" aria-label="Permalink to &quot;2.3 签名权限 (Signature)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>签名权限特点：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   特点                                                      │</span></span>
<span class="line"><span>│   ├─ 仅限系统签名应用                                       │</span></span>
<span class="line"><span>│   ├─ 安装时自动授予（如果签名匹配）                          │</span></span>
<span class="line"><span>│   ├─ 普通应用无法获得                                       │</span></span>
<span class="line"><span>│   └─ 用于系统级功能                                         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   示例权限                                                  │</span></span>
<span class="line"><span>│   ├─ REBOOT            # 重启系统                           │</span></span>
<span class="line"><span>│   ├─ SET_DEBUG_APP     # 设置调试应用                        │</span></span>
<span class="line"><span>│   ├─ BIND_ACCESSIBILITY_SERVICE # 绑定无障碍服务             │</span></span>
<span class="line"><span>│   ├─ BIND_INPUT_METHOD  # 绑定输入法                         │</span></span>
<span class="line"><span>│   ├─ WRITE_SETTINGS    # 写入系统设置                        │</span></span>
<span class="line"><span>│   ├─ DELETE_PACKAGES   # 删除应用                           │</span></span>
<span class="line"><span>│   └─ GRANT_PERMISSIONS # 授予权限                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-4-签名或系统权限-signature-or-system" tabindex="-1">2.4 签名或系统权限 (Signature or System) <a class="header-anchor" href="#_2-4-签名或系统权限-signature-or-system" aria-label="Permalink to &quot;2.4 签名或系统权限 (Signature or System)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>签名或系统权限：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   特点                                                      │</span></span>
<span class="line"><span>│   ├─ 系统应用或签名应用可获得                                │</span></span>
<span class="line"><span>│   ├─ 系统分区应用自动授予                                    │</span></span>
<span class="line"><span>│   ├─ 普通应用无法获得                                       │</span></span>
<span class="line"><span>│   └─ 用于系统级功能                                         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   示例权限                                                  │</span></span>
<span class="line"><span>│   ├─ BIND_TELEphony_SERVICE   # 绑定电话服务                │</span></span>
<span class="line"><span>│   ├─ BROADCAST_STICKY         # 发送粘性广播                │</span></span>
<span class="line"><span>│   ├─ PROCESS_OUTGOING_CALLS   # 处理拨出通话                │</span></span>
<span class="line"><span>│   └─ READ_LOGS                # 读取日志                    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_3-运行时权限-android-6-0" tabindex="-1">3. 运行时权限 (Android 6.0+) <a class="header-anchor" href="#_3-运行时权限-android-6-0" aria-label="Permalink to &quot;3. 运行时权限 (Android 6.0+)&quot;">​</a></h2><h3 id="_3-1-运行时权限请求流程" tabindex="-1">3.1 运行时权限请求流程 <a class="header-anchor" href="#_3-1-运行时权限请求流程" aria-label="Permalink to &quot;3.1 运行时权限请求流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>运行时权限请求流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   应用检查权限状态                                          │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│   │ 检查是否已授予                                │       │</span></span>
<span class="line"><span>│   │ - ContextCompat.checkSelfPermission()          │       │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   未授予则请求权限                                          │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│   │  Activity.requestPermissions()                  │       │</span></span>
<span class="line"><span>│   │  - 显示系统权限对话框                             │       │</span></span>
<span class="line"><span>│   │  - 用户选择允许或拒绝                             │       │</span></span>
<span class="line"><span>│   └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   用户做出选择                                              │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   ┌──────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│   │ 回调 onRequestPermissionsResult()          │       │</span></span>
<span class="line"><span>│   │  - 处理允许结果                             │       │</span></span>
<span class="line"><span>│   │  - 处理拒绝结果                             │       │</span></span>
<span class="line"><span>│   └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│   执行相应操作                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-运行时权限请求代码" tabindex="-1">3.2 运行时权限请求代码 <a class="header-anchor" href="#_3-2-运行时权限请求代码" aria-label="Permalink to &quot;3.2 运行时权限请求代码&quot;">​</a></h3><p><strong>基本权限请求：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 运行时权限请求</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PermissionActivity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppCompatActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PERMISSION_REQUEST_CODE </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 请求相机权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestCameraPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 检查权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ContextCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkSelfPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                Manifest.permission.CAMERA) </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                !=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 2. 检查是否需要说明</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ActivityCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shouldShowRequestPermissionRationale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    Manifest.permission.CAMERA)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 显示说明对话框</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                showPermissionRationaleDialog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 3. 请求权限</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ActivityCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">requestPermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]{Manifest.permission.CAMERA},</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                PERMISSION_REQUEST_CODE);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 权限已授予，执行操作</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            useCamera</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 处理权限结果</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onRequestPermissionsResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> requestCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                          @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NonNull</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">permissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                          @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NonNull</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">grantResults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onRequestPermissionsResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(requestCode, permissions, grantResults);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (requestCode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PERMISSION_REQUEST_CODE) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (grantResults.length </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                grantResults[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 权限已授予</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                useCamera</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 权限被拒绝</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                showPermissionDeniedDialog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-3-多权限请求" tabindex="-1">3.3 多权限请求 <a class="header-anchor" href="#_3-3-多权限请求" aria-label="Permalink to &quot;3.3 多权限请求&quot;">​</a></h3><p><strong>请求多个权限：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 请求多个权限</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestMultiplePermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查需要请求的权限</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; permissionsToRequest </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ContextCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkSelfPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Manifest.permission.CAMERA) </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            !=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        permissionsToRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Manifest.permission.CAMERA);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ContextCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkSelfPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Manifest.permission.RECORD_AUDIO) </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            !=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        permissionsToRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Manifest.permission.RECORD_AUDIO);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ContextCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkSelfPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Manifest.permission.WRITE_EXTERNAL_STORAGE) </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            !=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        permissionsToRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Manifest.permission.WRITE_EXTERNAL_STORAGE);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 如果有需要请求的权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">permissionsToRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isEmpty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ActivityCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">requestPermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            permissionsToRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toArray</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            PERMISSION_REQUEST_CODE);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 所有权限都已授予</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        usePermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 处理多权限结果</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onRequestPermissionsResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                      @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NonNull</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] permissions,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                                      @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NonNull</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] grantResults) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    super</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onRequestPermissionsResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(requestCode, permissions, grantResults);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (requestCode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PERMISSION_REQUEST_CODE) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> allGranted </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> grantResults) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                allGranted </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (allGranted) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            usePermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showPartialPermissionDeniedDialog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_4-权限组-permission-groups" tabindex="-1">4. 权限组（Permission Groups） <a class="header-anchor" href="#_4-权限组-permission-groups" aria-label="Permalink to &quot;4. 权限组（Permission Groups）&quot;">​</a></h2><h3 id="_4-1-权限组分类" tabindex="-1">4.1 权限组分类 <a class="header-anchor" href="#_4-1-权限组分类" aria-label="Permalink to &quot;4.1 权限组分类&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>权限组分类：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   相机组 (CAMERA)                                            │</span></span>
<span class="line"><span>│   └─ CAMERA                                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   位置组 (LOCATION)                                         │</span></span>
<span class="line"><span>│   ├─ ACCESS_FINE_LOCATION                                   │</span></span>
<span class="line"><span>│   └─ ACCESS_COARSE_LOCATION                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   通讯录组 (CONTACTS)                                       │</span></span>
<span class="line"><span>│   ├─ READ_CONTACTS                                         │</span></span>
<span class="line"><span>│   └─ WRITE_CONTACTS                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   日历组 (CALENDAR)                                         │</span></span>
<span class="line"><span>│   ├─ READ_CALENDAR                                         │</span></span>
<span class="line"><span>│   └─ WRITE_CALENDAR                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   短信组 (SMS)                                              │</span></span>
<span class="line"><span>│   ├─ SEND_SMS                                              │</span></span>
<span class="line"><span>│   ├─ RECEIVE_SMS                                           │</span></span>
<span class="line"><span>│   └─ READ_SMS                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   电话组 (PHONE)                                            │</span></span>
<span class="line"><span>│   ├─ CALL_PHONE                                            │</span></span>
<span class="line"><span>│   ├─ READ_PHONE_STATE                                      │</span></span>
<span class="line"><span>│   ├─ READ_PHONE_NUMBERS                                    │</span></span>
<span class="line"><span>│   ├─ READ_CALL_LOG                                         │</span></span>
<span class="line"><span>│   └─ WRITE_CALL_LOG                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   存储组 (STORAGE)                                          │</span></span>
<span class="line"><span>│   ├─ READ_EXTERNAL_STORAGE                                 │</span></span>
<span class="line"><span>│   └─ WRITE_EXTERNAL_STORAGE                                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   传感器组 (SENSORS)                                        │</span></span>
<span class="line"><span>│   └─ BODY_SENSORS                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-权限组优势" tabindex="-1">4.2 权限组优势 <a class="header-anchor" href="#_4-2-权限组优势" aria-label="Permalink to &quot;4.2 权限组优势&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>权限组优势：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 一次性授予组内所有权限                                 │</span></span>
<span class="line"><span>│      ├─ 减少权限请求次数                                    │</span></span>
<span class="line"><span>│      ├─ 提升用户体验                                       │</span></span>
<span class="line"><span>│      └─ 简化权限管理                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 权限关联                                                │</span></span>
<span class="line"><span>│      ├─ 组内权限相关功能                                    │</span></span>
<span class="line"><span>│      ├─ 统一管理                                           │</span></span>
<span class="line"><span>│      └─ 便于用户理解                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 权限撤销                                                │</span></span>
<span class="line"><span>│      ├─ 撤销组权限影响所有                                  │</span></span>
<span class="line"><span>│      ├─ 统一处理                                           │</span></span>
<span class="line"><span>│      └─ 便于权限状态同步                                    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_5-权限拒绝处理" tabindex="-1">5. 权限拒绝处理 <a class="header-anchor" href="#_5-权限拒绝处理" aria-label="Permalink to &quot;5. 权限拒绝处理&quot;">​</a></h2><h3 id="_5-1-权限拒绝类型" tabindex="-1">5.1 权限拒绝类型 <a class="header-anchor" href="#_5-1-权限拒绝类型" aria-label="Permalink to &quot;5.1 权限拒绝类型&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>权限拒绝类型：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   普通拒绝                                                  │</span></span>
<span class="line"><span>│   ├─ 用户选择&quot;不允许&quot;                                       │</span></span>
<span class="line"><span>│   ├─ 可以再次请求                                           │</span></span>
<span class="line"><span>│   ├─ 显示说明对话框                                         │</span></span>
<span class="line"><span>│   └─ 建议解释权限用途                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   永久拒绝                                                  │</span></span>
<span class="line"><span>│   ├─ 用户选择&quot;不允许&quot;并勾选&quot;不再询问&quot;                        │</span></span>
<span class="line"><span>│   ├─ 无法再次自动请求                                       │</span></span>
<span class="line"><span>│   ├─ 需跳转到设置页面                                       │</span></span>
<span class="line"><span>│   └─ 用户手动开启权限                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   系统拒绝                                                  │</span></span>
<span class="line"><span>│   ├─ 系统限制（如儿童模式）                                  │</span></span>
<span class="line"><span>│   ├─ 企业管理器限制                                        │</span></span>
<span class="line"><span>│   ├─ 安全软件拦截                                           │</span></span>
<span class="line"><span>│   └─ 需要解除限制                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-权限拒绝处理策略" tabindex="-1">5.2 权限拒绝处理策略 <a class="header-anchor" href="#_5-2-权限拒绝处理策略" aria-label="Permalink to &quot;5.2 权限拒绝处理策略&quot;">​</a></h3><p><strong>处理权限拒绝：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 处理权限拒绝</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PermissionHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 检查是否需要说明</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldShowRationale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Activity </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">activity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">permission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shouldShowRequestPermissionRationale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            activity, permission);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 检查是否永久拒绝</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> isPermissionPermanentlyDenied</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Activity </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">activity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">permission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ActivityCompat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shouldShowRequestPermissionRationale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            activity, permission);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 跳转到设置页面</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openAppSettings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Activity </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">activity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Intent intent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Intent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Uri uri </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Uri.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fromParts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;package&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPackageName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(uri);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        activity.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 显示权限说明对话框</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> showPermissionRationaleDialog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(DialogFragment </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">dialog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        dialog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">show</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSupportFragmentManager</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;PermissionRationale&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 处理权限结果</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handlePermissionResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> requestCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">grantResults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (grantResults.length </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> grantResults) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManager.PERMISSION_GRANTED) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 权限已授予</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                    usePermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 权限被拒绝</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                    handlePermissionDenied</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_6-特殊权限" tabindex="-1">6. 特殊权限 <a class="header-anchor" href="#_6-特殊权限" aria-label="Permalink to &quot;6. 特殊权限&quot;">​</a></h2><h3 id="_6-1-悬浮窗权限" tabindex="-1">6.1 悬浮窗权限 <a class="header-anchor" href="#_6-1-悬浮窗权限" aria-label="Permalink to &quot;6.1 悬浮窗权限&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SYSTEM_ALERT_WINDOW 权限：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   用途                                                      │</span></span>
<span class="line"><span>│   ├─ 显示在其他应用之上                                     │</span></span>
<span class="line"><span>│   ├─ 创建悬浮窗                                             │</span></span>
<span class="line"><span>│   ├─ 画屏取词                                               │</span></span>
<span class="line"><span>│   └─ 通知提醒                                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   请求方式                                                  │</span></span>
<span class="line"><span>│   ├─ 不能通过代码请求                                       │</span></span>
<span class="line"><span>│   ├─ 需跳转到设置页面                                       │</span></span>
<span class="line"><span>│   ├─ 用户手动开启                                           │</span></span>
<span class="line"><span>│   └─ Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   检查权限                                                  │</span></span>
<span class="line"><span>│   ├─ Settings.canDrawOverlays()                             │</span></span>
<span class="line"><span>│   └─ 返回 boolean 值                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>请求悬浮窗权限：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 请求悬浮窗权限</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestOverlayPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.M) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Settings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">canDrawOverlays</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 跳转到设置页面</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Intent intent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Intent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Uri.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;package:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getPackageName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()));</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 权限已授予</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            createOverlay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_6-2-修改系统设置权限" tabindex="-1">6.2 修改系统设置权限 <a class="header-anchor" href="#_6-2-修改系统设置权限" aria-label="Permalink to &quot;6.2 修改系统设置权限&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>WRITE_SETTINGS 权限：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   用途                                                      │</span></span>
<span class="line"><span>│   ├─ 修改系统设置                                           │</span></span>
<span class="line"><span>│   ├─ 修改辅助功能设置                                       │</span></span>
<span class="line"><span>│   ├─ 修改显示设置                                           │</span></span>
<span class="line"><span>│   └─ 修改网络设置                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   请求方式                                                  │</span></span>
<span class="line"><span>│   ├─ 不能通过代码请求                                       │</span></span>
<span class="line"><span>│   ├─ 需跳转到设置页面                                       │</span></span>
<span class="line"><span>│   ├─ 用户手动开启                                           │</span></span>
<span class="line"><span>│   └─ Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS)          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   检查权限                                                  │</span></span>
<span class="line"><span>│   ├─ Settings.System.canWrite()                             │</span></span>
<span class="line"><span>│   └─ 返回 boolean 值                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>请求修改系统设置权限：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 请求修改系统设置权限</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestWriteSettingsPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.M) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Settings.System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">canWrite</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 跳转到设置页面</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Intent intent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Intent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Settings.ACTION_MANAGE_WRITE_SETTINGS);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Uri.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;package:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getPackageName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()));</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 权限已授予</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            modifySettings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_6-3-无障碍服务权限" tabindex="-1">6.3 无障碍服务权限 <a class="header-anchor" href="#_6-3-无障碍服务权限" aria-label="Permalink to &quot;6.3 无障碍服务权限&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BIND_ACCESSIBILITY_SERVICE 权限：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   用途                                                      │</span></span>
<span class="line"><span>│   ├─ 无障碍辅助                                             │</span></span>
<span class="line"><span>│   ├─ 自动点击                                               │</span></span>
<span class="line"><span>│   ├─ 屏幕读取                                               │</span></span>
<span class="line"><span>│   ├─ 模拟触摸                                               │</span></span>
<span class="line"><span>│   └─ 应用自动化                                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   请求方式                                                  │</span></span>
<span class="line"><span>│   ├─ 需实现 AccessibilityService                           │</span></span>
<span class="line"><span>│   ├─ 在 AndroidManifest.xml 声明                             │</span></span>
<span class="line"><span>│   ├─ 跳转到无障碍设置页面                                    │</span></span>
<span class="line"><span>│   ├─ 用户手动开启                                           │</span></span>
<span class="line"><span>│   └─ Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   检查权限                                                  │</span></span>
<span class="line"><span>│   ├─ AccessibilityManager.isAccessibilityEnabled()          │</span></span>
<span class="line"><span>│   └─ 返回 boolean 值                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_7-权限自动授予" tabindex="-1">7. 权限自动授予 <a class="header-anchor" href="#_7-权限自动授予" aria-label="Permalink to &quot;7. 权限自动授予&quot;">​</a></h2><h3 id="_7-1-权限自动授予机制" tabindex="-1">7.1 权限自动授予机制 <a class="header-anchor" href="#_7-1-权限自动授予机制" aria-label="Permalink to &quot;7.1 权限自动授予机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>权限自动授予：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   自动授予条件                                              │</span></span>
<span class="line"><span>│   ├─ 应用来自可信来源                                       │</span></span>
<span class="line"><span>│   ├─ 应用是系统应用                                         │</span></span>
<span class="line"><span>│   ├─ 应用是 Google Play 应用                                 │</span></span>
<span class="line"><span>│   ├─ 权限是普通权限                                         │</span></span>
<span class="line"><span>│   └─ 用户之前授予过同类权限                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   不自动授予情况                                            │</span></span>
<span class="line"><span>│   ├─ 危险权限需要明确请求                                    │</span></span>
<span class="line"><span>│   ├─ 特殊权限需要手动设置                                    │</span></span>
<span class="line"><span>│   ├─ 用户明确拒绝过                                          │</span></span>
<span class="line"><span>│   └─ 应用来自非可信来源                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_7-2-优化权限请求" tabindex="-1">7.2 优化权限请求 <a class="header-anchor" href="#_7-2-优化权限请求" aria-label="Permalink to &quot;7.2 优化权限请求&quot;">​</a></h3><p><strong>权限请求优化：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 权限请求优化</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PermissionOptimizer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 按需请求权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestPermissionOnDemand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">permission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 检查功能是否需要</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isFeatureNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permission)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 2. 在用户使用功能时请求</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestPermissionAtFeatureUse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permission);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 分步请求权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestPermissionsStepByStep</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 先请求核心功能权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        requestCorePermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 用户使用时再请求其他权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        requestAdditionalPermissionsOnUse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 解释权限用途</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> explainPermissionUsage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">permission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 显示说明对话框</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        showPermissionExplanation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permission);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 解释权限用途</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        explainWhyNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permission);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 展示隐私政策</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        showPrivacyPolicy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_8-权限检查最佳实践" tabindex="-1">8. 权限检查最佳实践 <a class="header-anchor" href="#_8-权限检查最佳实践" aria-label="Permalink to &quot;8. 权限检查最佳实践&quot;">​</a></h2><h3 id="_8-1-权限检查清单" tabindex="-1">8.1 权限检查清单 <a class="header-anchor" href="#_8-1-权限检查清单" aria-label="Permalink to &quot;8.1 权限检查清单&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>权限检查最佳实践：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   1. 最小权限原则                                            │</span></span>
<span class="line"><span>│      ├─ 只申请必要的权限                                     │</span></span>
<span class="line"><span>│      ├─ 避免过度申请                                         │</span></span>
<span class="line"><span>│      └─ 按功能模块申请                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   2. 合理时机请求                                            │</span></span>
<span class="line"><span>│      ├─ 在需要时请求                                         │</span></span>
<span class="line"><span>│      ├─ 避免启动时批量请求                                    │</span></span>
<span class="line"><span>│      ├─ 提供功能降级方案                                      │</span></span>
<span class="line"><span>│      └─ 给予用户选择空间                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   3. 友好的权限说明                                          │</span></span>
<span class="line"><span>│      ├─ 清晰解释权限用途                                      │</span></span>
<span class="line"><span>│      ├─ 说明为什么需要                                        │</span></span>
<span class="line"><span>│      ├─ 展示隐私政策                                          │</span></span>
<span class="line"><span>│      └─ 提供拒绝后的替代方案                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   4. 优雅的错误处理                                          │</span></span>
<span class="line"><span>│      ├─ 处理权限拒绝                                         │</span></span>
<span class="line"><span>│      ├─ 提供功能降级                                         │</span></span>
<span class="line"><span>│      ├─ 引导用户设置权限                                      │</span></span>
<span class="line"><span>│      └─ 避免频繁骚扰                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   5. 权限状态同步                                            │</span></span>
<span class="line"><span>│      ├─ 监听权限变化                                         │</span></span>
<span class="line"><span>│      ├─ 更新 UI 状态                                           │</span></span>
<span class="line"><span>│      ├─ 同步权限数据                                          │</span></span>
<span class="line"><span>│      └─ 处理权限撤销                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_9-android-版本权限变化" tabindex="-1">9. Android 版本权限变化 <a class="header-anchor" href="#_9-android-版本权限变化" aria-label="Permalink to &quot;9. Android 版本权限变化&quot;">​</a></h2><h3 id="_9-1-主要版本变化" tabindex="-1">9.1 主要版本变化 <a class="header-anchor" href="#_9-1-主要版本变化" aria-label="Permalink to &quot;9.1 主要版本变化&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Android 版本权限变化：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 6.0 (M)                                           │</span></span>
<span class="line"><span>│   ├─ 引入运行时权限                                          │</span></span>
<span class="line"><span>│   ├─ 危险权限需要运行时请求                                   │</span></span>
<span class="line"><span>│   └─ 权限可动态撤销                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 7.0 (N)                                           │</span></span>
<span class="line"><span>│   ├─ 权限组优化                                              │</span></span>
<span class="line"><span>│   ├─ 后台权限限制开始                                        │</span></span>
<span class="line"><span>│   └─ 通知权限细化                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 8.0 (O)                                           │</span></span>
<span class="line"><span>│   ├─ 后台启动限制                                            │</span></span>
<span class="line"><span>│   ├─ 精确位置权限                                            │</span></span>
<span class="line"><span>│   └─ Doze 模式加强                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 9.0 (Pie)                                         │</span></span>
<span class="line"><span>│   ├─ 后台位置限制                                            │</span></span>
<span class="line"><span>│   ├─ 分区存储开始                                            │</span></span>
<span class="line"><span>│   └─ 权限使用限制                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 10 (Q)                                            │</span></span>
<span class="line"><span>│   ├─ 模糊位置权限                                            │</span></span>
<span class="line"><span>│   ├─ 分区存储正式推出                                        │</span></span>
<span class="line"><span>│   ├─ 后台权限限制加强                                        │</span></span>
<span class="line"><span>│   └─ 一次权限授权                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 11 (R)                                            │</span></span>
<span class="line"><span>│   ├─ 一次性权限                                              │</span></span>
<span class="line"><span>│   ├─ 通知权限分类                                            │</span></span>
<span class="line"><span>│   ├─ 权限使用情况显示                                        │</span></span>
<span class="line"><span>│   └─ 后台权限限制进一步                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 12 (S)                                            │</span></span>
<span class="line"><span>│   ├─ 通知权限强制请求                                        │</span></span>
<span class="line"><span>│   ├─ 屏幕录制权限                                            │</span></span>
<span class="line"><span>│   ├─ 麦克风/相机指示器                                       │</span></span>
<span class="line"><span>│   └─ 权限请求优化                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 13 (T)                                            │</span></span>
<span class="line"><span>│   ├─ 媒体权限拆分                                            │</span></span>
<span class="line"><span>│   ├─ 通知权限正式引入                                        │</span></span>
<span class="line"><span>│   ├─ 短信权限细化                                            │</span></span>
<span class="line"><span>│   ├─ 通话权限细化                                            │</span></span>
<span class="line"><span>│   └─ 近场通信权限                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 14 (U)                                            │</span></span>
<span class="line"><span>│   ├─ 权限使用追踪                                            │</span></span>
<span class="line"><span>│   ├─ 权限管理改进                                            │</span></span>
<span class="line"><span>│   ├─ 隐私权限增强                                            │</span></span>
<span class="line"><span>│   └─ 应用锁权限                                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_9-2-版本适配代码" tabindex="-1">9.2 版本适配代码 <a class="header-anchor" href="#_9-2-版本适配代码" aria-label="Permalink to &quot;9.2 版本适配代码&quot;">​</a></h3><p><strong>版本适配权限：</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 版本适配权限</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VersionAdaptedPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 请求存储权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestStoragePermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.R) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 11+ 使用分区存储</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestScopedStorage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.M) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 6.0-10 使用运行时权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestRuntimeStoragePermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 5.1 及以下安装时授权</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            useStorage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 请求位置权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestLocationPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.Q) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 10+ 区分精确/模糊位置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestApproximateLocationPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.M) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 6.0-9 运行时权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestRuntimeLocationPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 5.1 及以下安装时授权</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            useLocation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 请求通知权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestNotificationPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Build.VERSION.SDK_INT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Build.VERSION_CODES.TIRAMISU) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 13+ 需要 POST_NOTIFICATIONS 权限</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestPostNotificationsPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // Android 12 及以下不需要</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            showNotification</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_10-面试考点" tabindex="-1">10. 面试考点 <a class="header-anchor" href="#_10-面试考点" aria-label="Permalink to &quot;10. 面试考点&quot;">​</a></h2><h3 id="_10-1-基础考点" tabindex="-1">10.1 基础考点 <a class="header-anchor" href="#_10-1-基础考点" aria-label="Permalink to &quot;10.1 基础考点&quot;">​</a></h3><p><strong>1. 权限级别分类？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限级别                                                  │</span></span>
<span class="line"><span>│   ├─ 普通权限 (Normal)       安装时自动授予                  │</span></span>
<span class="line"><span>│   ├─ 危险权限 (Dangerous)     运行时请求                     │</span></span>
<span class="line"><span>│   ├─ 签名权限 (Signature)     系统签名应用                   │</span></span>
<span class="line"><span>│   └─ 签名或系统权限         系统应用                         │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 运行时权限请求流程？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   运行时权限请求流程                                        │</span></span>
<span class="line"><span>│   ├─ 检查权限状态                                           │</span></span>
<span class="line"><span>│   ├─ 检查是否需要说明                                       │</span></span>
<span class="line"><span>│   ├─ 请求权限                                               │</span></span>
<span class="line"><span>│   ├─ 用户选择允许或拒绝                                     │</span></span>
<span class="line"><span>│   └─ 回调处理结果                                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-2-进阶考点" tabindex="-1">10.2 进阶考点 <a class="header-anchor" href="#_10-2-进阶考点" aria-label="Permalink to &quot;10.2 进阶考点&quot;">​</a></h3><p><strong>1. 特殊权限有哪些？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   特殊权限                                                  │</span></span>
<span class="line"><span>│   ├─ SYSTEM_ALERT_WINDOW    悬浮窗                          │</span></span>
<span class="line"><span>│   ├─ WRITE_SETTINGS         修改系统设置                     │</span></span>
<span class="line"><span>│   ├─ BIND_ACCESSIBILITY_SERVICE  无障碍服务                  │</span></span>
<span class="line"><span>│   ├─ BIND_VPN_SERVICE       VPN 服务                         │</span></span>
<span class="line"><span>│   ├─ BIND_WALLPAPER         壁纸服务                         │</span></span>
<span class="line"><span>│   └─ POST_NOTIFICATIONS     发送通知 (Android 13+)            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 权限拒绝如何处理？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限拒绝处理                                              │</span></span>
<span class="line"><span>│   ├─ 普通拒绝：可以再次请求                                 │</span></span>
<span class="line"><span>│   ├─ 永久拒绝：跳转到设置页面                                │</span></span>
<span class="line"><span>│   ├─ 提供功能降级方案                                       │</span></span>
<span class="line"><span>│   ├─ 解释权限用途                                           │</span></span>
<span class="line"><span>│   └─ 避免频繁骚扰                                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_10-3-高级考点" tabindex="-1">10.3 高级考点 <a class="header-anchor" href="#_10-3-高级考点" aria-label="Permalink to &quot;10.3 高级考点&quot;">​</a></h3><p><strong>1. Android 13+ 新增权限？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   Android 13+ 新增权限                                      │</span></span>
<span class="line"><span>│   ├─ POST_NOTIFICATIONS     发送通知                        │</span></span>
<span class="line"><span>│   ├─ READ_MEDIA_IMAGES      读取图片                        │</span></span>
<span class="line"><span>│   ├─ READ_MEDIA_VIDEO       读取视频                        │</span></span>
<span class="line"><span>│   ├─ READ_MEDIA_AUDIO       读取音频                        │</span></span>
<span class="line"><span>│   ├─ READ_CALL_LOG          读取通话记录                      │</span></span>
<span class="line"><span>│   ├─ READ_SMS               读取短信                        │</span></span>
<span class="line"><span>│   └─ SEND_SMS/RECEIVE_SMS    发送/接收短信                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>2. 权限请求最佳实践？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│   权限请求最佳实践                                          │</span></span>
<span class="line"><span>│   ├─ 最小权限原则                                          │</span></span>
<span class="line"><span>│   ├─ 合理时机请求                                          │</span></span>
<span class="line"><span>│   ├─ 友好的权限说明                                          │</span></span>
<span class="line"><span>│   ├─ 优雅的错误处理                                          │</span></span>
<span class="line"><span>│   └─ 权限状态同步                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><p><strong>文档信息：</strong></p><ul><li>字数：约 14000 字</li><li>包含：权限级别、运行时权限、权限组、权限拒绝处理、特殊权限、权限自动授予、最佳实践、Android 版本变化、面试考点</li><li>代码示例：包含完整的权限请求、检查、处理代码</li><li>ASCII 流程图：包含多个流程时序图和架构图</li><li>最佳实践：权限请求最佳实践、版本适配建议</li></ul><p><strong>建议：</strong></p><ol><li>掌握运行时权限请求的完整流程</li><li>了解各 Android 版本的权限变化</li><li>熟悉特殊权限的请求方式</li><li>学习权限请求的最佳实践</li></ol>`,94)])])}const g=a(l,[["render",e]]);export{c as __pageData,g as default};
