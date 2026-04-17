import{_ as a,o as i,c as n,ae as p}from"./chunks/framework.DYQ7e_kq.js";const g=JSON.parse('{"title":"03_AMS_PMS_WMS","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/14_System/03_AMS_PMS_WMS.md","filePath":"00-android/14_System/03_AMS_PMS_WMS.md"}'),l={name:"00-android/14_System/03_AMS_PMS_WMS.md"};function t(e,s,h,k,r,E){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="_03-ams-pms-wms" tabindex="-1">03_AMS_PMS_WMS <a class="header-anchor" href="#_03-ams-pms-wms" aria-label="Permalink to &quot;03_AMS_PMS_WMS&quot;">​</a></h1><blockquote><p><strong>核心摘要</strong>：AMS、PMS、WMS 是 Android 系统最核心的三大服务，分别负责应用生命周期管理、包管理和窗口管理。理解这三大服务是理解 Android 系统架构的关键。</p></blockquote><hr><h2 id="一、三大服务概述" tabindex="-1">一、三大服务概述 <a class="header-anchor" href="#一、三大服务概述" aria-label="Permalink to &quot;一、三大服务概述&quot;">​</a></h2><h3 id="_1-1-服务架构位置" tabindex="-1">1.1 服务架构位置 <a class="header-anchor" href="#_1-1-服务架构位置" aria-label="Permalink to &quot;1.1 服务架构位置&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      SystemServer 进程                       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │           ActivityManagerService (AMS)              │    │</span></span>
<span class="line"><span>│  │  - 应用进程管理                                      │    │</span></span>
<span class="line"><span>│  │  - Activity/Service/Broadcast 管理                   │    │</span></span>
<span class="line"><span>│  │  - 任务栈管理                                        │    │</span></span>
<span class="line"><span>│  │  - 进程优先级管理                                    │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │          PackageManagerService (PMS)                │    │</span></span>
<span class="line"><span>│  │  - APK 解析和安装                                    │    │</span></span>
<span class="line"><span>│  │  - 组件信息收集                                      │    │</span></span>
<span class="line"><span>│  │  - 权限管理                                          │    │</span></span>
<span class="line"><span>│  │  - 签名验证                                          │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │           WindowManagerService (WMS)                │    │</span></span>
<span class="line"><span>│  │  - 窗口管理                                          │    │</span></span>
<span class="line"><span>│  │  - 表面管理                                          │    │</span></span>
<span class="line"><span>│  │  - 输入事件分发                                      │    │</span></span>
<span class="line"><span>│  │  - 动画管理                                          │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              其他系统服务                            │    │</span></span>
<span class="line"><span>│  │  PowerManagerService, InputManagerService...        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                          │</span></span>
<span class="line"><span>          ┌───────────────┼───────────────┐</span></span>
<span class="line"><span>          │               │               │</span></span>
<span class="line"><span>          ▼               ▼               ▼</span></span>
<span class="line"><span>    ┌──────────┐    ┌──────────┐    ┌──────────┐</span></span>
<span class="line"><span>    │ App 进程 1 │    │ App 进程 2 │    │ App 进程 3 │</span></span>
<span class="line"><span>    └──────────┘    └──────────┘    └──────────┘</span></span></code></pre></div><h3 id="_1-2-三大服务的关系" tabindex="-1">1.2 三大服务的关系 <a class="header-anchor" href="#_1-2-三大服务的关系" aria-label="Permalink to &quot;1.2 三大服务的关系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    三大服务协作关系                          │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>启动 App 流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────┐      ┌─────────┐      ┌─────────┐</span></span>
<span class="line"><span>  │   PMS   │ ────&gt;│   AMS   │ ────&gt;│   WMS   │</span></span>
<span class="line"><span>  └─────────┘      └─────────┘      └─────────┘</span></span>
<span class="line"><span>       │                │                │</span></span>
<span class="line"><span>       │                │                │</span></span>
<span class="line"><span>       ▼                ▼                ▼</span></span>
<span class="line"><span>  解析 APK          创建进程          创建窗口</span></span>
<span class="line"><span>  获取组件信息       启动 Activity      显示界面</span></span>
<span class="line"><span>  检查权限          管理生命周期       处理输入</span></span>
<span class="line"><span></span></span>
<span class="line"><span>详细流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. PMS 阶段：</span></span>
<span class="line"><span>   - 解析 AndroidManifest.xml</span></span>
<span class="line"><span>   - 收集 Activity/Service/BroadcastReceiver 信息</span></span>
<span class="line"><span>   - 检查权限声明</span></span>
<span class="line"><span>   - 验证签名</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. AMS 阶段：</span></span>
<span class="line"><span>   - 接收 startActivity 请求</span></span>
<span class="line"><span>   - 检查目标 Activity 是否存在（查询 PMS）</span></span>
<span class="line"><span>   - 决定是否需要创建新进程</span></span>
<span class="line"><span>   - 创建/复用进程</span></span>
<span class="line"><span>   - 调度 Activity 生命周期</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. WMS 阶段：</span></span>
<span class="line"><span>   - 接收 addWindow 请求</span></span>
<span class="line"><span>   - 创建 Surface</span></span>
<span class="line"><span>   - 管理窗口层级</span></span>
<span class="line"><span>   - 分发输入事件</span></span></code></pre></div><h3 id="_1-3-服务对比表" tabindex="-1">1.3 服务对比表 <a class="header-anchor" href="#_1-3-服务对比表" aria-label="Permalink to &quot;1.3 服务对比表&quot;">​</a></h3><table tabindex="0"><thead><tr><th>特性</th><th>AMS</th><th>PMS</th><th>WMS</th></tr></thead><tbody><tr><td>全称</td><td>ActivityManagerService</td><td>PackageManagerService</td><td>WindowManagerService</td></tr><tr><td>核心职责</td><td>应用生命周期管理</td><td>包管理</td><td>窗口管理</td></tr><tr><td>主要接口</td><td>IActivityManager</td><td>IPackageManager</td><td>IWindowManager</td></tr><tr><td>服务对象</td><td>Activity/Service/Process</td><td>APK/Component/Permission</td><td>Window/Surface/Input</td></tr><tr><td>启动阶段</td><td>Bootstrap</td><td>Bootstrap</td><td>Other</td></tr><tr><td>依赖服务</td><td>PMS</td><td>无</td><td>AMS、DisplayManager</td></tr><tr><td>Binder 调用频率</td><td>极高</td><td>中等</td><td>高</td></tr></tbody></table><hr><h2 id="二、activitymanagerservice-ams" tabindex="-1">二、ActivityManagerService (AMS) <a class="header-anchor" href="#二、activitymanagerservice-ams" aria-label="Permalink to &quot;二、ActivityManagerService (AMS)&quot;">​</a></h2><h3 id="_2-1-ams-职责概述" tabindex="-1">2.1 AMS 职责概述 <a class="header-anchor" href="#_2-1-ams-职责概述" aria-label="Permalink to &quot;2.1 AMS 职责概述&quot;">​</a></h3><p>AMS 是 Android 系统最核心的服务，负责管理所有应用进程和组件的生命周期。</p><p><strong>核心职责</strong>：</p><ol><li><strong>进程管理</strong>：创建、销毁、回收应用进程</li><li><strong>Activity 管理</strong>：管理 Activity 栈和生命周期</li><li><strong>Service 管理</strong>：管理 Service 的启动和绑定</li><li><strong>Broadcast 管理</strong>：管理和分发系统广播</li><li><strong>ContentProvider 管理</strong>：管理 ContentProvider 的发布和访问</li><li><strong>任务栈管理</strong>：管理 Task 和返回栈</li><li><strong>优先级管理</strong>：管理进程优先级和 OOM 调整</li><li><strong>权限检查</strong>：检查组件访问权限</li></ol><h3 id="_2-2-ams-架构" tabindex="-1">2.2 AMS 架构 <a class="header-anchor" href="#_2-2-ams-架构" aria-label="Permalink to &quot;2.2 AMS 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    ActivityManagerService                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              ActivityStackSupervisor                │    │</span></span>
<span class="line"><span>│  │  - 管理所有 Activity 栈                              │    │</span></span>
<span class="line"><span>│  │  - 调度 Activity 启动和生命周期                      │    │</span></span>
<span class="line"><span>│  │  - 处理 Task 栈操作                                  │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│           │                    │                             │</span></span>
<span class="line"><span>│           ▼                    ▼                             │</span></span>
<span class="line"><span>│  ┌─────────────────┐  ┌─────────────────┐                    │</span></span>
<span class="line"><span>│  │  ActivityStack  │  │  ActivityStack  │                    │</span></span>
<span class="line"><span>│  │  (Home Stack)   │  │  (App Stack)    │                    │</span></span>
<span class="line"><span>│  │  ┌───────────┐  │  │  ┌───────────┐  │                    │</span></span>
<span class="line"><span>│  │  │ Activity  │  │  │  │ Activity  │  │                    │</span></span>
<span class="line"><span>│  │  │ Record    │  │  │  │ Record    │  │                    │</span></span>
<span class="line"><span>│  │  └───────────┘  │  │  └───────────┘  │                    │</span></span>
<span class="line"><span>│  └─────────────────┘  └─────────────────┘                    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │                ProcessRecord 管理                    │    │</span></span>
<span class="line"><span>│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │</span></span>
<span class="line"><span>│  │  │  Process  │  │  Process  │  │  Process  │        │    │</span></span>
<span class="line"><span>│  │  │  Record   │  │  Record   │  │  Record   │        │    │</span></span>
<span class="line"><span>│  │  │ (App 1)   │  │ (App 2)   │  │ (System)  │        │    │</span></span>
<span class="line"><span>│  │  └───────────┘  └───────────┘  └───────────┘        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              ServiceRecord 管理                      │    │</span></span>
<span class="line"><span>│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │</span></span>
<span class="line"><span>│  │  │  Service  │  │  Service  │  │  Service  │        │    │</span></span>
<span class="line"><span>│  │  │  Record   │  │  Record   │  │  Record   │        │    │</span></span>
<span class="line"><span>│  │  └───────────┘  └───────────┘  └───────────┘        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │           Broadcast 队列和分发                       │    │</span></span>
<span class="line"><span>│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │</span></span>
<span class="line"><span>│  │  │  Parallel │  │  Ordered  │  │  Sticky   │        │    │</span></span>
<span class="line"><span>│  │  │  Queue    │  │  Queue    │  │  Queue    │        │    │</span></span>
<span class="line"><span>│  │  └───────────┘  └───────────┘  └───────────┘        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-3-activity-启动流程源码分析" tabindex="-1">2.3 Activity 启动流程源码分析 <a class="header-anchor" href="#_2-3-activity-启动流程源码分析" aria-label="Permalink to &quot;2.3 Activity 启动流程源码分析&quot;">​</a></h3><h4 id="_2-3-1-应用侧发起启动" tabindex="-1">2.3.1 应用侧发起启动 <a class="header-anchor" href="#_2-3-1-应用侧发起启动" aria-label="Permalink to &quot;2.3.1 应用侧发起启动&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/app/Activity.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent intent) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent intent, @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Bundle options) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (options </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        startActivityForResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        startActivityForResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivityForResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent intent, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Bundle options) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取 Instrumentation</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Instrumentation.ActivityResult ar </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mInstrumentation.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execStartActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, mMainThread.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getApplicationThread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), mToken,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, intent, requestCode, options);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 处理结果</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ar </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mMainThread.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendActivityResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mToken, mEmbeddedID,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            requestCode, RESULT_CANCELED, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_2-3-2-instrumentation-层" tabindex="-1">2.3.2 Instrumentation 层 <a class="header-anchor" href="#_2-3-2-instrumentation-层" aria-label="Permalink to &quot;2.3.2 Instrumentation 层&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/app/Instrumentation.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityResult </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execStartActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Context who, IBinder contextThread,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        IBinder token, Activity target, Intent intent, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Bundle options) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 准备 Intent</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (mActivityMonitors </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 监控逻辑</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">migrateExtraStreamToClipData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">prepareToLeaveProcess</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(who);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 通过 Binder 调用 AMS</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Intent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resolveTypeIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(who.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContentResolver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            token,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            target </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> target.mEmbeddedID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            requestCode,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 检查启动结果</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        checkStartActivityResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result, intent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (RemoteException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> RuntimeException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Failure from system&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, e);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_2-3-3-ams-侧处理" tabindex="-1">2.3.3 AMS 侧处理 <a class="header-anchor" href="#_2-3-3-ams-侧处理" aria-label="Permalink to &quot;2.3.3 AMS 侧处理&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IApplicationThread caller, String callingPackage,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Intent intent, String resolvedType, IBinder resultTo, String resultWho,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startFlags, ProfilerInfo profilerInfo, Bundle options) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 调用内部方法</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivityAsUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(caller, callingPackage, intent, resolvedType,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        resultTo, resultWho, requestCode, startFlags, profilerInfo, options,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        UserHandle.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCallingUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivityAsUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IApplicationThread caller, String callingPackage,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Intent intent, String resolvedType, IBinder resultTo, String resultWho,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startFlags, ProfilerInfo profilerInfo, Bundle options,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 验证调用者身份</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    enforceNotIsolatedCaller</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;startActivity&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 获取调用者进程记录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProcessRecord callerApp </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getRecordForAppLOSP</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(caller);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 委托给 ActivityStackSupervisor</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mActivityStackSupervisor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startActivityMayWait</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(caller, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, callingPackage,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        intent, resolvedType, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, resultTo, resultWho, requestCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        startFlags, profilerInfo, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, userId,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;startActivityAsUser&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_2-3-4-activitystacksupervisor-处理" tabindex="-1">2.3.4 ActivityStackSupervisor 处理 <a class="header-anchor" href="#_2-3-4-activitystacksupervisor-处理" aria-label="Permalink to &quot;2.3.4 ActivityStackSupervisor 处理&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ActivityStackSupervisor.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivityMayWait</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IApplicationThread caller, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> callingUid,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String callingPackage, Intent intent, String resolvedType,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        IBinder resultTo, String resultWho, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> requestCode, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startFlags,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ProfilerInfo profilerInfo, WaitResult outResult, Bundle options,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> componentOnly, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId, IActivityContainer iContainer,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        TaskRecord inTask, String reason) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 验证 Intent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    intent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifyActivityIntent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 收集组件信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityInfo aInfo </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> resolveActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 创建 ActivityRecord</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ActivityRecord r </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ActivityRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mService, callerApp, callingUid,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        callingPackage, intent, resolvedType, aInfo, mService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getGlobalConfiguration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        resultTo, resultWho, requestCode, componentOnly, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, container, options);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 启动 Activity</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startActivityUnchecked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(r, sourceRecord, voiceSession, voiceInteractor,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        startFlags, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options, inTask);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_2-3-5-完整启动流程图" tabindex="-1">2.3.5 完整启动流程图 <a class="header-anchor" href="#_2-3-5-完整启动流程图" aria-label="Permalink to &quot;2.3.5 完整启动流程图&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                  Activity 启动完整流程                       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  1. Activity.startActivity(intent)                          │</span></span>
<span class="line"><span>│     └─&gt; Instrumentation.execStartActivity()                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  2. Binder 跨进程调用                                       │</span></span>
<span class="line"><span>│     └─&gt; ActivityManager.getService().startActivity()        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  3. AMS.startActivityAsUser()                               │</span></span>
<span class="line"><span>│     ├─&gt; 验证调用者身份                                      │</span></span>
<span class="line"><span>│     ├─&gt; 获取调用者进程记录                                  │</span></span>
<span class="line"><span>│     └─&gt; 委托给 ActivityStackSupervisor                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  4. ActivityStackSupervisor.startActivityMayWait()          │</span></span>
<span class="line"><span>│     ├─&gt; 解析 ActivityInfo（查询 PMS）                       │</span></span>
<span class="line"><span>│     ├─&gt; 创建 ActivityRecord                                 │</span></span>
<span class="line"><span>│     └─&gt; startActivityUnchecked()                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  5. ActivityStack.startActivityUnchecked()                  │</span></span>
<span class="line"><span>│     ├─&gt; 计算启动标志                                        │</span></span>
<span class="line"><span>│     ├─&gt; 决定启动模式（standard/singleTop/singleTask/...）   │</span></span>
<span class="line"><span>│     ├─&gt; 决定目标 Task 栈                                    │</span></span>
<span class="line"><span>│     └─&gt; startActivityLocked()                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  6. ActivityStackSupervisor.realStartActivityLocked()       │</span></span>
<span class="line"><span>│     ├─&gt; 检查进程是否存在                                    │</span></span>
<span class="line"><span>│     ├─&gt; 进程不存在：创建新进程                              │</span></span>
<span class="line"><span>│     └─&gt; 进程存在：发送 H 消息调度启动                       │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  7. 应用进程侧处理                                          │</span></span>
<span class="line"><span>│     ├─&gt; ActivityThread.scheduleLaunchActivity()             │</span></span>
<span class="line"><span>│     ├─&gt; H 消息处理                                          │</span></span>
<span class="line"><span>│     ├─&gt; Activity.performCreate()                            │</span></span>
<span class="line"><span>│     ├─&gt; Activity.onCreate()                                 │</span></span>
<span class="line"><span>│     ├─&gt; Activity.onStart()                                  │</span></span>
<span class="line"><span>│     └─&gt; Activity.onResume()                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  8. WMS 侧处理                                              │</span></span>
<span class="line"><span>│     ├─&gt; ViewRootImpl.setView()                              │</span></span>
<span class="line"><span>│     ├─&gt; WMS.addWindow()                                     │</span></span>
<span class="line"><span>│     └─&gt; SurfaceFlinger 合成显示                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-4-进程管理" tabindex="-1">2.4 进程管理 <a class="header-anchor" href="#_2-4-进程管理" aria-label="Permalink to &quot;2.4 进程管理&quot;">​</a></h3><h4 id="_2-4-1-processrecord" tabindex="-1">2.4.1 ProcessRecord <a class="header-anchor" href="#_2-4-1-processrecord" aria-label="Permalink to &quot;2.4.1 ProcessRecord&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ProcessRecord.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ProcessRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 进程信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityInfo info;          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 应用信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String processName;         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 进程名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> uid;                    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// UID</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pid;                    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// PID</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 组件列表</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ActivityRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; activities </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ServiceRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; services </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BroadcastRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; receivers </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ContentProviderRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; providers </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArraySet&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 进程状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> setAdj;                       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 当前 OOM 调整值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> curAdj;                       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 缓存的 OOM 调整值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> killed;                   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 是否被杀死</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> killedByAm;               </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 是否被 AMS 杀死</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 内存信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lastPss;                     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 上次 PSS 值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lastSwapPss;                 </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 上次 Swap PSS 值</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 时间信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lastActivityTime;            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 上次活动时间</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lastStateChangeTime;         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 上次状态改变时间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_2-4-2-进程创建流程" tabindex="-1">2.4.2 进程创建流程 <a class="header-anchor" href="#_2-4-2-进程创建流程" aria-label="Permalink to &quot;2.4.2 进程创建流程&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessRecord </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String processName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ApplicationInfo info, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> knownToBeDead, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> intentFlags,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> hostingRecord, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> allowWhileBooting, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> isolated,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> isolatedUid, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> keepIfLarge, String abiOverride,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String entryPoint, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] entryPointArgs, Runnable crashHandler) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查进程是否已存在</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ProcessRecord app </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getProcessRecordLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(processName, info.uid, keepIfLarge);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (app </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> app.pid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 进程已存在</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">knownToBeDead) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> app;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 创建 ProcessRecord</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (app </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        app </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> newProcessRecordLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(info, processName, isolated, isolatedUid);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 启动进程</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(app, hostingRecord, abiOverride, entryPoint, entryPointArgs);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> app.mPendingStart </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> :</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> app;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startProcessLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ProcessRecord app, String hostingRecord,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String abiOverride, String entryPoint, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] entryPointArgs) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 准备启动参数</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] mounts </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mProcessCpuTracker.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMounts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 调用 Process.start()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Process.ProcessStartResult startResult </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Process.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(entryPoint,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        app.processName, uid, uid, gids, debugFlags, mountExternal,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        app.info.targetSdkVersion, app.seInfo, requiredAbi, instructionSet,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        app.info.dataDir, invokeWith, app.info.packageName, zygotePolicyFlags,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        isTopApp, app.mDisabledCompatChanges, pkgDataInfoMap,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        whitelistedDataInfoMap, bindMountAppsData, bindMountAppStorageDirs,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;PROC_START_SEQUENCE=&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> startSeq});</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 记录进程信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    app.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setPid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(startResult.pid);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    app.mPendingStart </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    app.mKnownToBeDead </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 添加到进程列表</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mProcessNames.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(app.processName, app.uid, app);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mPidSelfLocked.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(startResult.pid, app);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// libcore/ojvm/src/main/java/java/lang/Process.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessStartResult </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String processClass,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String niceName, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> uid, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> gid, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] gids, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> debugFlags,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mountExternal, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> targetSdkVersion, String seInfo, String abi,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String instructionSet, String appDataDir, String invokeWith,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String packageName, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> zygotePolicyFlags, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> isTopApp,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> disabledCompatChanges, Map</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String, Pair</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String, Long</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pkgDataInfoMap,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Map</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String, Pair</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String, Long</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> whitelistedDataInfoMap,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bindMountAppsData, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bindMountAppStorageDirs,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] zygoteArgs) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 通过 ZygoteProcess 连接 Zygote</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> zygoteProcess.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(processClass, niceName, uid, gid, gids,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        debugFlags, mountExternal, targetSdkVersion, seInfo, abi, instructionSet,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        appDataDir, invokeWith, packageName, zygotePolicyFlags, isTopApp,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        disabledCompatChanges, pkgDataInfoMap, whitelistedDataInfoMap,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        bindMountAppsData, bindMountAppStorageDirs, zygoteArgs);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_2-5-进程优先级和-oom-调整" tabindex="-1">2.5 进程优先级和 OOM 调整 <a class="header-anchor" href="#_2-5-进程优先级和-oom-调整" aria-label="Permalink to &quot;2.5 进程优先级和 OOM 调整&quot;">​</a></h3><h4 id="_2-5-1-进程优先级层级" tabindex="-1">2.5.1 进程优先级层级 <a class="header-anchor" href="#_2-5-1-进程优先级层级" aria-label="Permalink to &quot;2.5.1 进程优先级层级&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    进程优先级层级                            │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  Foreground (0)                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  - 用户正在交互的 Activity                           │    │</span></span>
<span class="line"><span>│  │  - 前台 Service（startForeground()）                 │    │</span></span>
<span class="line"><span>│  │  - 执行中的 BroadcastReceiver                        │    │</span></span>
<span class="line"><span>│  │  OOM Adjust: 0                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  Visible (1)                                                │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  - 可见但不在前台的 Activity（对话框后的 Activity）   │    │</span></span>
<span class="line"><span>│  │  - 被前台 Activity 绑定的 Service                     │    │</span></span>
<span class="line"><span>│  │  OOM Adjust: 1                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  Perceptible (2)                                            │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  - 用户可感知的进程（如播放音乐的后台进程）           │    │</span></span>
<span class="line"><span>│  │  OOM Adjust: 2                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  Foreground Service (3)                                     │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  - 前台 Service 但不在活跃状态                        │    │</span></span>
<span class="line"><span>│  │  OOM Adjust: 3                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  Background (4-12)                                          │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  - 后台 Activity（用户不可见）                        │    │</span></span>
<span class="line"><span>│  │  - 后台 Service                                      │    │</span></span>
<span class="line"><span>│  │  OOM Adjust: 4-12（根据 LRU 顺序）                    │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  Empty (15)                                                 │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  - 没有任何组件的进程                                │    │</span></span>
<span class="line"><span>│  │  OOM Adjust: 15                                     │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h4 id="_2-5-2-oom-调整计算" tabindex="-1">2.5.2 OOM 调整计算 <a class="header-anchor" href="#_2-5-2-oom-调整计算" aria-label="Permalink to &quot;2.5.2 OOM 调整计算&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ProcessList.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// OOM 调整值常量</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UNKNOWN_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 未知</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CACHED_APP_MAX_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 15</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 缓存进程最大值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CACHED_APP_MIN_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 缓存进程最小值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SERVICE_B_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 绑定服务 B 类</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PREVIOUS_APP_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 上一个应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HOME_APP_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Home 应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SERVICE_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 服务进程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HEAVY_WEIGHT_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 重量级应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> BACKUP_APP_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 备份应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PERCEPTIBLE_APP_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 可感知应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> VISIBLE_APP_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 可见应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> FOREGROUND_APP_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前台应用</span></span></code></pre></div><p><strong>计算流程</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> updateOomAdjLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ProcessRecord proc) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 确定进程类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> adj </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> computeOomAdjLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(proc, ProcessList.UNKNOWN_ADJ, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 应用调整</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    proc.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setAdj</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(adj);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 通知内核</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (proc.pid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> proc.pid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MY_PID) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Process.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setOomAdj</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(proc.pid, proc.adj);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> computeOomAdjLocked</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ProcessRecord proc, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cachedAdj,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> doingAll) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查是否有前台 Activity</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (proc.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">hasForegroundActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.FOREGROUND_APP_ADJ;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 检查是否可见</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (proc.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">hasVisibleActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.VISIBLE_APP_ADJ;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 检查是否有前台 Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (proc.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">hasForegroundService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.PERCEPTIBLE_APP_ADJ;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 检查是否是备份应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (proc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mBackupTarget) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.BACKUP_APP_ADJ;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 检查 LRU 顺序</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lruIndex </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mLruProcessList.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">indexOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(proc);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (lruIndex </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.CACHED_APP_MIN_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            (lruIndex </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ProcessList.CACHED_APP_MAX_ADJ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.CACHED_APP_MIN_ADJ) </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">             /</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mLruProcessList.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 默认：空进程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ProcessList.UNKNOWN_ADJ;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="三、packagemanagerservice-pms" tabindex="-1">三、PackageManagerService (PMS) <a class="header-anchor" href="#三、packagemanagerservice-pms" aria-label="Permalink to &quot;三、PackageManagerService (PMS)&quot;">​</a></h2><h3 id="_3-1-pms-职责概述" tabindex="-1">3.1 PMS 职责概述 <a class="header-anchor" href="#_3-1-pms-职责概述" aria-label="Permalink to &quot;3.1 PMS 职责概述&quot;">​</a></h3><p>PMS 负责管理系统中所有已安装的 APK 包，包括解析、安装、卸载、查询等操作。</p><p><strong>核心职责</strong>：</p><ol><li><strong>APK 解析</strong>：解析 AndroidManifest.xml，收集组件信息</li><li><strong>安装管理</strong>：处理 APK 安装请求，包括系统安装和用户安装</li><li><strong>卸载管理</strong>：处理 APK 卸载请求</li><li><strong>组件查询</strong>：提供 Activity、Service、BroadcastReceiver、ContentProvider 查询</li><li><strong>权限管理</strong>：管理应用权限的授予和撤销</li><li><strong>签名验证</strong>：验证 APK 签名的一致性</li><li><strong>DEX 优化</strong>：管理 DEX 文件的优化（dex2oat）</li><li><strong>共享库管理</strong>：管理系统共享库</li></ol><h3 id="_3-2-pms-架构" tabindex="-1">3.2 PMS 架构 <a class="header-anchor" href="#_3-2-pms-架构" aria-label="Permalink to &quot;3.2 PMS 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   PackageManagerService                     │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              PackageParser                          │    │</span></span>
<span class="line"><span>│  │  - 解析 AndroidManifest.xml                         │    │</span></span>
<span class="line"><span>│  │  - 收集组件信息（Activity/Service/...）              │    │</span></span>
<span class="line"><span>│  │  - 解析权限和特性                                    │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│           │                                                  │</span></span>
<span class="line"><span>│           ▼                                                  │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              PackageSetting 管理                     │    │</span></span>
<span class="line"><span>│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │</span></span>
<span class="line"><span>│  │  │  Package  │  │  Package  │  │  Package  │        │    │</span></span>
<span class="line"><span>│  │  │  Setting  │  │  Setting  │  │  Setting  │        │    │</span></span>
<span class="line"><span>│  │  │ (App 1)   │  │ (App 2)   │  │ (System)  │        │    │</span></span>
<span class="line"><span>│  │  └───────────┘  └───────────┘  └───────────┘        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              Installer 通信                          │    │</span></span>
<span class="line"><span>│  │  - 通过 Socket 与 installd 守护进程通信               │    │</span></span>
<span class="line"><span>│  │  - 执行 APK 复制、权限设置、DEX 优化等操作            │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              权限管理                                │    │</span></span>
<span class="line"><span>│  │  - BasePermission 管理                              │    │</span></span>
<span class="line"><span>│  │  - GrantedPermissions 管理                          │    │</span></span>
<span class="line"><span>│  │  - PermissionTrees 管理                             │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              应用信息缓存                            │    │</span></span>
<span class="line"><span>│  │  - mPackages: PackageName → PackageSetting          │    │</span></span>
<span class="line"><span>│  │  - mSettings: 持久化设置                            │    │</span></span>
<span class="line"><span>│  │  - mActivities: Activity 查询表                      │    │</span></span>
<span class="line"><span>│  │  - mServices: Service 查询表                         │    │</span></span>
<span class="line"><span>│  │  - mReceivers: BroadcastReceiver 查询表              │    │</span></span>
<span class="line"><span>│  │  - mProviders: ContentProvider 查询表                │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-3-apk-解析流程" tabindex="-1">3.3 APK 解析流程 <a class="header-anchor" href="#_3-3-apk-解析流程" aria-label="Permalink to &quot;3.3 APK 解析流程&quot;">​</a></h3><h4 id="_3-3-1-packageparser-解析" tabindex="-1">3.3.1 PackageParser 解析 <a class="header-anchor" href="#_3-3-1-packageparser-解析" aria-label="Permalink to &quot;3.3.1 PackageParser 解析&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/content/pm/PackageParser.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Package </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parsePackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(File packageFile, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parseFlags)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        throws PackageParserException {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 验证 APK 文件</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">packageFile.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageParserException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(INSTALL_PARSE_FAILED_NOT_APK,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;Package file &quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> packageFile </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot; is not a file&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 打开 APK（ZIP 格式）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ZipFile zipFile </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ZipFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageFile)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 读取 AndroidManifest.xml</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        XmlResourceParser parser </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openXmlResourceParser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(zipFile, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;AndroidManifest.xml&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 4. 解析 Manifest</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Package pkg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parsePackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parser, parseFlags);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pkg;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Package </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parsePackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(XmlResourceParser parser, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> flags)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        throws XmlPullParserException, IOException {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建 Package 对象</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Package pkg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 解析根节点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> type;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ((type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">next</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> XmlPullParser.END_DOCUMENT) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> XmlPullParser.START_TAG) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String tagName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (tagName.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;manifest&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 解析 manifest 属性</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                parseManifest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg, parser, flags);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (tagName.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;application&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 解析 application 节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                parseApplication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg, parser, flags);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (tagName.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;activity&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 解析 activity 节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                parseActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg, parser, flags);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (tagName.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;service&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 解析 service 节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                parseService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg, parser, flags);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // ... 其他组件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pkg;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_3-3-2-组件信息收集" tabindex="-1">3.3.2 组件信息收集 <a class="header-anchor" href="#_3-3-2-组件信息收集" aria-label="Permalink to &quot;3.3.2 组件信息收集&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/content/pm/PackageParser.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Activity </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parseActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Package owner, Resources res,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        XmlResourceParser parser, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> flags, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] outError) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建 Activity 对象</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Activity a </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Activity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 解析属性</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    TypedArray sa </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> res.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">obtainAttributes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(attrs, R.styleable.AndroidManifestActivity);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    a.info.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sa.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.styleable.AndroidManifestActivity_name);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    a.info.label </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sa.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getText</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.styleable.AndroidManifestActivity_label);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    a.info.icon </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sa.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getResourceId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.styleable.AndroidManifestActivity_icon, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    a.info.enabled </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sa.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getBoolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.styleable.AndroidManifestActivity_enabled, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    a.info.exported </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sa.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getBoolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.styleable.AndroidManifestActivity_exported, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    a.info.launchMode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sa.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInteger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(R.styleable.AndroidManifestActivity_launchMode, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 解析 intent-filter</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    parseIntent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(res, parser, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, flags, a.intents, outError);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 解析 meta-data</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    parseBundleExtras</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(res, parser, a.metaData, outError);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> a;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-4-apk-安装流程" tabindex="-1">3.4 APK 安装流程 <a class="header-anchor" href="#_3-4-apk-安装流程" aria-label="Permalink to &quot;3.4 APK 安装流程&quot;">​</a></h3><h4 id="_3-4-1-安装方式" tabindex="-1">3.4.1 安装方式 <a class="header-anchor" href="#_3-4-1-安装方式" aria-label="Permalink to &quot;3.4.1 安装方式&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      APK 安装方式                           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  1. 系统预装                                                │</span></span>
<span class="line"><span>│     └─&gt; /system/app, /system/priv-app                       │</span></span>
<span class="line"><span>│     └─&gt; 系统启动时 PMS 扫描安装                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  2. 用户安装（PackageInstaller）                            │</span></span>
<span class="line"><span>│     └─&gt; 用户通过界面安装                                    │</span></span>
<span class="line"><span>│     └─&gt; PackageInstallerService 处理                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  3. ADB 安装                                                │</span></span>
<span class="line"><span>│     └─&gt; adb install xxx.apk                                 │</span></span>
<span class="line"><span>│     └─&gt; PackageManagerService.installPackage()              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  4. 静默安装（系统权限）                                    │</span></span>
<span class="line"><span>│     └─&gt; PackageManager.installPackage()                     │</span></span>
<span class="line"><span>│     └─&gt; 需要 INSTALL_PACKAGES 权限                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h4 id="_3-4-2-安装流程源码" tabindex="-1">3.4.2 安装流程源码 <a class="header-anchor" href="#_3-4-2-安装流程源码" aria-label="Permalink to &quot;3.4.2 安装流程源码&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> installPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Uri packageURI, IPackageInstallObserver2 observer,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> installFlags, String installerPackageName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        VerificationParams verificationParams, String managedProfileName) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建安装参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    InstallParams params </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InstallParams</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageURI, observer, installFlags,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        installerPackageName, verificationParams, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, managedProfileName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 检查权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> callingUid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Binder.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCallingUid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    enforceCrossUserPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(callingUid, android.Manifest.permission.INSTALL_PACKAGES,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;installPackage&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 将安装请求加入队列</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mQueue.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addInstall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 安装队列处理</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageHandler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Handler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Message </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">msg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (msg.what) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> INIT_COPY</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 1. 初始化复制</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                handleInitCopy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MCS_BOUND</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 2. 绑定 MediaContainerService</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                handleMcsBound</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SEND_MSG</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 3. 发送安装消息</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                handleSendMsg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handleInitCopy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取下一个安装请求</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    InstallParams params </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mQueue.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getInstall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (params </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 验证 APK</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">verifyPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 3. 开始复制</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            startCopy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startCopy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(InstallParams params) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 验证参数</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">validateInstall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 2. 创建临时目录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            File tempDir </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createTempDir</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 3. 复制 APK 到临时目录</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            copyPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params.packageURI, tempDir);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 4. 安装 APK</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            installPackageLI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(params, tempDir);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 5. 清理临时文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        cleanupTempDir</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> installPackageLI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(InstallParams params, File tempDir) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 解析 APK</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    PackageParser.Package pkg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> parsePackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(tempDir);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 检查签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">verifySignatures</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 检查权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">grantPermissions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 设置应用目录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    File appDir </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createAppDir</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg.packageName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 复制 APK 到应用目录</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    copyPackage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(tempDir, appDir);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 优化 DEX</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    performDexOpt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 7. 更新 PackageSetting</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    updatePackageSetting</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 8. 发送安装完成广播</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    sendPackageInstalledBroadcast</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_3-4-3-安装流程图" tabindex="-1">3.4.3 安装流程图 <a class="header-anchor" href="#_3-4-3-安装流程图" aria-label="Permalink to &quot;3.4.3 安装流程图&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    APK 安装完整流程                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  1. 用户触发安装                                            │</span></span>
<span class="line"><span>│     └─&gt; PackageInstaller.install()                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  2. PackageManagerService.installPackage()                  │</span></span>
<span class="line"><span>│     └─&gt; 创建 InstallParams，加入队列                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  3. PackageHandler.handleMessage()                          │</span></span>
<span class="line"><span>│     ├─&gt; INIT_COPY: 初始化复制                               │</span></span>
<span class="line"><span>│     ├─&gt; MCS_BOUND: 绑定 MediaContainerService               │</span></span>
<span class="line"><span>│     └─&gt; SEND_MSG: 发送安装消息                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  4. 验证 APK                                                │</span></span>
<span class="line"><span>│     ├─&gt; 检查 APK 完整性                                     │</span></span>
<span class="line"><span>│     ├─&gt; 检查签名                                            │</span></span>
<span class="line"><span>│     └─&gt; 检查最低 SDK 版本                                    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  5. 复制 APK                                                │</span></span>
<span class="line"><span>│     ├─&gt; 复制到 /data/app/&lt;package&gt;/                         │</span></span>
<span class="line"><span>│     ├─&gt; 设置文件权限（chmod）                               │</span></span>
<span class="line"><span>│     └─&gt; 设置 SELinux 上下文                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  6. 解析 AndroidManifest.xml                                │</span></span>
<span class="line"><span>│     ├─&gt; PackageParser.parsePackage()                        │</span></span>
<span class="line"><span>│     ├─&gt; 收集组件信息                                        │</span></span>
<span class="line"><span>│     └─&gt; 解析权限和特性                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  7. 签名验证                                                │</span></span>
<span class="line"><span>│     ├─&gt; 检查新 APK 签名                                     │</span></span>
<span class="line"><span>│     ├─&gt; 如果是更新，检查与旧版本签名一致                    │</span></span>
<span class="line"><span>│     └─&gt; 验证证书链                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  8. 权限授予                                                │</span></span>
<span class="line"><span>│     ├─&gt; 解析权限声明                                        │</span></span>
<span class="line"><span>│     ├─&gt; 自动授予 normal 权限                                │</span></span>
<span class="line"><span>│     └─&gt; dangerous 权限等待用户确认                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  9. DEX 优化                                                │</span></span>
<span class="line"><span>│     ├─&gt; 调用 dex2oat                                        │</span></span>
<span class="line"><span>│     ├─&gt; 生成 OAT 文件                                       │</span></span>
<span class="line"><span>│     └─&gt; 存储在 /data/dalvik-cache/                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  10. 更新 PackageSetting                                    │</span></span>
<span class="line"><span>│      ├─&gt; 添加到 mPackages 映射                              │</span></span>
<span class="line"><span>│      ├─&gt; 更新 components.xml                                │</span></span>
<span class="line"><span>│      └─&gt; 更新 settings.xml                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  11. 发送广播                                               │</span></span>
<span class="line"><span>│      ├─&gt; ACTION_PACKAGE_ADDED                               │</span></span>
<span class="line"><span>│      ├─&gt; ACTION_PACKAGE_REPLACED（如果是更新）              │</span></span>
<span class="line"><span>│      └─&gt; 通知 Launcher 更新图标                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-5-签名验证" tabindex="-1">3.5 签名验证 <a class="header-anchor" href="#_3-5-签名验证" aria-label="Permalink to &quot;3.5 签名验证&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifySignatures</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(PackageParser.Package pkg) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 检查是否是系统应用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isSystemApp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 系统应用使用预置签名</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifySystemSignatures</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 检查是否是更新</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    PackageSetting ps </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mSettings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getPackageLPr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg.packageName);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ps </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 更新：检查签名一致性</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifyUpdateSignatures</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ps, pkg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 新安装：验证签名证书</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifyNewPackageSignatures</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pkg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> boolean</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> verifyUpdateSignatures</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(PackageSetting ps, PackageParser.Package pkg) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取旧签名</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    SigningDetails oldSignatures </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ps.signingDetails;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 获取新签名</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    SigningDetails newSignatures </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pkg.signingDetails;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 检查签名是否一致</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">oldSignatures.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkCapability</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(newSignatures,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            SigningDetails.CAPABILITY_NEVER_ROLLBACK)) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Slog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">w</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(TAG, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Signature mismatch for &quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pkg.packageName);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="四、windowmanagerservice-wms" tabindex="-1">四、WindowManagerService (WMS) <a class="header-anchor" href="#四、windowmanagerservice-wms" aria-label="Permalink to &quot;四、WindowManagerService (WMS)&quot;">​</a></h2><h3 id="_4-1-wms-职责概述" tabindex="-1">4.1 WMS 职责概述 <a class="header-anchor" href="#_4-1-wms-职责概述" aria-label="Permalink to &quot;4.1 WMS 职责概述&quot;">​</a></h3><p>WMS 负责管理系统中所有窗口，包括窗口的创建、销毁、层级管理、输入事件分发等。</p><p><strong>核心职责</strong>：</p><ol><li><strong>窗口管理</strong>：创建、销毁、更新窗口</li><li><strong>Surface 管理</strong>：与 SurfaceFlinger 协作管理 Surface</li><li><strong>窗口层级</strong>：管理窗口的 Z-order 和层级关系</li><li><strong>输入事件分发</strong>：将输入事件分发到正确的窗口</li><li><strong>动画管理</strong>：管理窗口动画和过渡动画</li><li><strong>壁纸管理</strong>：管理壁纸窗口</li><li><strong>状态栏管理</strong>：管理状态栏和导航栏</li><li><strong>屏幕管理</strong>：管理屏幕旋转、休眠等</li></ol><h3 id="_4-2-wms-架构" tabindex="-1">4.2 WMS 架构 <a class="header-anchor" href="#_4-2-wms-架构" aria-label="Permalink to &quot;4.2 WMS 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   WindowManagerService                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              Window 管理                             │    │</span></span>
<span class="line"><span>│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │</span></span>
<span class="line"><span>│  │  │  Window   │  │  Window   │  │  Window   │        │    │</span></span>
<span class="line"><span>│  │  │  State    │  │  State    │  │  State    │        │    │</span></span>
<span class="line"><span>│  │  │ (App 1)   │  │ (App 2)   │  │ (StatusBar)│       │    │</span></span>
<span class="line"><span>│  │  └───────────┘  └───────────┘  └───────────┘        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              AppWindowToken 管理                     │    │</span></span>
<span class="line"><span>│  │  - 每个应用一个 AppWindowToken                       │    │</span></span>
<span class="line"><span>│  │  - 管理应用的所有窗口                                │    │</span></span>
<span class="line"><span>│  │  - 处理应用级别的动画                                │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              Input 管理                              │    │</span></span>
<span class="line"><span>│  │  - InputManager 协作                                 │    │</span></span>
<span class="line"><span>│  │  - 输入事件分发                                      │    │</span></span>
<span class="line"><span>│  │  - 触摸事件处理                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              Surface 管理                            │    │</span></span>
<span class="line"><span>│  │  - 创建 Surface                                      │    │</span></span>
<span class="line"><span>│  │  - 与 SurfaceFlinger 通信                            │    │</span></span>
<span class="line"><span>│  │  - 管理 Surface 层级                                 │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │              动画管理                                │    │</span></span>
<span class="line"><span>│  │  - WindowAnimation                                   │    │</span></span>
<span class="line"><span>│  │  - AppTransition                                     │    │</span></span>
<span class="line"><span>│  │  - 自定义动画                                        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-3-窗口层级" tabindex="-1">4.3 窗口层级 <a class="header-anchor" href="#_4-3-窗口层级" aria-label="Permalink to &quot;4.3 窗口层级&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      窗口层级（Z-Order）                     │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  最高层                                                     │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_SECURE_OVERLAY (24)                           │    │</span></span>
<span class="line"><span>│  │  - 安全覆盖层（截屏时隐藏）                          │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_ACCESSIBILITY_OVERLAY (23)                    │    │</span></span>
<span class="line"><span>│  │  - 无障碍覆盖层                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_INPUT_METHOD (22)                             │    │</span></span>
<span class="line"><span>│  │  - 输入法窗口                                        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_VOICE_INTERACTION (21)                        │    │</span></span>
<span class="line"><span>│  │  - 语音交互窗口                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_STATUS_BAR (20)                               │    │</span></span>
<span class="line"><span>│  │  - 状态栏                                            │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_SYSTEM_ALERT (19)                             │    │</span></span>
<span class="line"><span>│  │  - 系统警告（需要 SYSTEM_ALERT_WINDOW 权限）          │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_APPLICATION_PANEL (3)                         │    │</span></span>
<span class="line"><span>│  │  - 应用面板（PopupMenu 等）                          │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_APPLICATION (2)                               │    │</span></span>
<span class="line"><span>│  │  - 应用窗口（Activity）                              │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  TYPE_APPLICATION_STARTING (1)                      │    │</span></span>
<span class="line"><span>│  │  - 启动窗口（StartingWindow）                        │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  最低层                                                     │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-4-窗口创建流程" tabindex="-1">4.4 窗口创建流程 <a class="header-anchor" href="#_4-4-窗口创建流程" aria-label="Permalink to &quot;4.4 窗口创建流程&quot;">​</a></h3><h4 id="_4-4-1-应用侧请求" tabindex="-1">4.4.1 应用侧请求 <a class="header-anchor" href="#_4-4-1-应用侧请求" aria-label="Permalink to &quot;4.4.1 应用侧请求&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/core/java/android/view/ViewRootImpl.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(View view, WindowManager.LayoutParams attrs, View panelParentView) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    synchronized</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (mView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            mView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> view;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 1. 请求创建窗口</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            requestLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 2. 通过 Binder 调用 WMS</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                res </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mWindowSession.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addToDisplay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mWindow, mSeq, mWindowAttributes,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                    getHostDisplayClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), mDisplay.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getDisplayId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                    mPendingDisplayCutout, mTempInsets, mInputChannel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (RemoteException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_4-4-2-wms-侧处理" tabindex="-1">4.4.2 WMS 侧处理 <a class="header-anchor" href="#_4-4-2-wms-侧处理" aria-label="Permalink to &quot;4.4.2 WMS 侧处理&quot;">​</a></h4><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/wm/WindowManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> addToDisplay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IWindow window, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> seq, WindowManager.LayoutParams attrs,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> displayId, Rect outContentInsets, InputChannel outInputChannel) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mDisplayContent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addToDisplay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(window, seq, attrs, displayId,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        outContentInsets, outInputChannel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/wm/DisplayContent.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> addToDisplay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IWindow window, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> seq, WindowManager.LayoutParams attrs,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> displayId, Rect outContentInsets, InputChannel outInputChannel) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 创建 WindowState</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    WindowState win </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> WindowState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, window, seq, attrs);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 添加窗口</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    addWindow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(win);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 创建 Surface</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    win.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createSurface</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 设置输入通道</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (outInputChannel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        InputChannel.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">copy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(outInputChannel, win.mInputChannel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> win.mClientSequenceNumber;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="_4-4-3-窗口创建流程图" tabindex="-1">4.4.3 窗口创建流程图 <a class="header-anchor" href="#_4-4-3-窗口创建流程图" aria-label="Permalink to &quot;4.4.3 窗口创建流程图&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    窗口创建完整流程                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  1. Activity.onCreate()                                     │</span></span>
<span class="line"><span>│     └─&gt; 创建 DecorView                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  2. Activity.onResume()                                     │</span></span>
<span class="line"><span>│     └─&gt; WindowManager.addView(DecorView, LayoutParams)      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  3. ViewRootImpl.setView()                                  │</span></span>
<span class="line"><span>│     ├─&gt; 创建 ViewRootImpl                                   │</span></span>
<span class="line"><span>│     ├─&gt; 请求布局（requestLayout）                           │</span></span>
<span class="line"><span>│     └─&gt; 调用 WindowSession.addToDisplay()                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  4. Binder 跨进程调用                                       │</span></span>
<span class="line"><span>│     └─&gt; WindowManagerService.addToDisplay()                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  5. WMS 创建 WindowState                                    │</span></span>
<span class="line"><span>│     ├─&gt; 创建 WindowState 对象                               │</span></span>
<span class="line"><span>│     ├─&gt; 添加到窗口列表                                      │</span></span>
<span class="line"><span>│     └─&gt; 计算窗口位置                                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  6. 创建 Surface                                            │</span></span>
<span class="line"><span>│     ├─&gt; 调用 SurfaceControl.createSurface()                 │</span></span>
<span class="line"><span>│     ├─&gt; SurfaceFlinger 创建 Surface                         │</span></span>
<span class="line"><span>│     └─&gt; 返回 Surface 对象                                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  7. 应用侧绘制                                              │</span></span>
<span class="line"><span>│     ├─&gt; ViewRootImpl.performTraversals()                    │</span></span>
<span class="line"><span>│     ├─&gt; DecorView.draw()                                    │</span></span>
<span class="line"><span>│     └─&gt; Canvas 绘制到 Surface                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  8. SurfaceFlinger 合成                                     │</span></span>
<span class="line"><span>│     ├─&gt; 收集所有 Surface                                    │</span></span>
<span class="line"><span>│     ├─&gt; 按 Z-order 合成                                     │</span></span>
<span class="line"><span>│     └─&gt; 输出到 Framebuffer                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-5-输入事件分发" tabindex="-1">4.5 输入事件分发 <a class="header-anchor" href="#_4-5-输入事件分发" aria-label="Permalink to &quot;4.5 输入事件分发&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    输入事件分发流程                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  1. InputReader（独立线程）                                 │</span></span>
<span class="line"><span>│     └─&gt; 从 /dev/input/event* 读取原始事件                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  2. InputReader 处理                                        │</span></span>
<span class="line"><span>│     ├─&gt; 解析原始事件                                        │</span></span>
<span class="line"><span>│     ├─&gt; 转换为 MotionEvent                                  │</span></span>
<span class="line"><span>│     └─&gt; 放入 InputDispatcher 队列                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  3. InputDispatcher（独立线程）                             │</span></span>
<span class="line"><span>│     ├─&gt; 从队列取出事件                                      │</span></span>
<span class="line"><span>│     ├─&gt; 查询 WMS 获取目标窗口                               │</span></span>
<span class="line"><span>│     └─&gt; 分发到目标窗口                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  4. WMS 查询目标窗口                                        │</span></span>
<span class="line"><span>│     ├─&gt; 根据坐标查找最顶层窗口                              │</span></span>
<span class="line"><span>│     ├─&gt; 检查窗口是否可接收输入                              │</span></span>
<span class="line"><span>│     └─&gt; 返回 WindowState                                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  5. 应用侧处理                                              │</span></span>
<span class="line"><span>│     ├─&gt; InputChannel 接收事件                               │</span></span>
<span class="line"><span>│     ├─&gt; ViewRootImpl.dispatchPointerEvent()                 │</span></span>
<span class="line"><span>│     ├─&gt; DecorView.dispatchTouchEvent()                      │</span></span>
<span class="line"><span>│     ├─&gt; Activity.dispatchTouchEvent()                       │</span></span>
<span class="line"><span>│     ├─&gt; ViewGroup.dispatchTouchEvent()                      │</span></span>
<span class="line"><span>│     └─&gt; View.onTouchEvent()                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="五、服务间通信" tabindex="-1">五、服务间通信 <a class="header-anchor" href="#五、服务间通信" aria-label="Permalink to &quot;五、服务间通信&quot;">​</a></h2><h3 id="_5-1-ams-与-pms-通信" tabindex="-1">5.1 AMS 与 PMS 通信 <a class="header-anchor" href="#_5-1-ams-与-pms-通信" aria-label="Permalink to &quot;5.1 AMS 与 PMS 通信&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// AMS 获取 PMS 引用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PackageManagerService mPackageManagerService;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 查询 Activity 信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ActivityInfo </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resolveActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Intent intent, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ActivityManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resolveIntent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intent,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            intent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resolveTypeIfNeeded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mContext.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContentResolver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()),</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (RemoteException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 检查权限</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> checkPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String permission, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pid, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> uid) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mPackageManagerService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">checkPermission</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(permission, pid, uid);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-2-ams-与-wms-通信" tabindex="-1">5.2 AMS 与 WMS 通信 <a class="header-anchor" href="#_5-2-ams-与-wms-通信" aria-label="Permalink to &quot;5.2 AMS 与 WMS 通信&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// AMS 获取 WMS 引用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> WindowManagerService mWindowManagerService;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 添加 AppWindowToken</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> addAppToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(AppWindowToken token) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mWindowManagerService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addAppToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(token);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 移除 AppWindowToken</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> removeAppToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(AppWindowToken token) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mWindowManagerService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">removeAppToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(token);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置窗口可见性</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setAppVisibility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(AppWindowToken token, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> visible) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    mWindowManagerService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setAppVisibility</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(token, visible);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-3-pms-与-wms-通信" tabindex="-1">5.3 PMS 与 WMS 通信 <a class="header-anchor" href="#_5-3-pms-与-wms-通信" aria-label="Permalink to &quot;5.3 PMS 与 WMS 通信&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// PMS 获取 WMS 引用（通过 ServiceManager）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> IWindowManager mWindowManager </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> WindowManagerGlobal.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getWindowManagerService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 更新应用图标</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> updateAppIcon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String packageName) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mWindowManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">updateAppIcon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(packageName);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (RemoteException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="六、面试考点" tabindex="-1">六、面试考点 <a class="header-anchor" href="#六、面试考点" aria-label="Permalink to &quot;六、面试考点&quot;">​</a></h2><h3 id="_6-1-基础问题" tabindex="-1">6.1 基础问题 <a class="header-anchor" href="#_6-1-基础问题" aria-label="Permalink to &quot;6.1 基础问题&quot;">​</a></h3><h4 id="q1-ams-的主要职责是什么" tabindex="-1">Q1: AMS 的主要职责是什么？ <a class="header-anchor" href="#q1-ams-的主要职责是什么" aria-label="Permalink to &quot;Q1: AMS 的主要职责是什么？&quot;">​</a></h4><p><strong>参考答案</strong>： AMS（ActivityManagerService）是 Android 系统最核心的服务，主要职责包括：</p><ol><li>管理所有应用进程的生命周期（创建、销毁、回收）</li><li>管理 Activity 的生命周期和任务栈</li><li>管理 Service 的启动和绑定</li><li>管理和分发系统广播</li><li>管理 ContentProvider 的发布和访问</li><li>管理进程优先级和 OOM 调整</li></ol><h4 id="q2-pms-是如何解析-apk-的" tabindex="-1">Q2: PMS 是如何解析 APK 的？ <a class="header-anchor" href="#q2-pms-是如何解析-apk-的" aria-label="Permalink to &quot;Q2: PMS 是如何解析 APK 的？&quot;">​</a></h4><p><strong>参考答案</strong>： PMS 使用 PackageParser 解析 APK：</p><ol><li>打开 APK 文件（ZIP 格式）</li><li>读取 AndroidManifest.xml</li><li>解析 manifest 根节点，获取包名、版本等信息</li><li>解析 application 节点，获取应用级配置</li><li>解析各组件节点（activity、service、receiver、provider）</li><li>解析权限和特性声明</li><li>将解析结果存储到 Package 对象中</li></ol><h4 id="q3-wms-的窗口层级是如何划分的" tabindex="-1">Q3: WMS 的窗口层级是如何划分的？ <a class="header-anchor" href="#q3-wms-的窗口层级是如何划分的" aria-label="Permalink to &quot;Q3: WMS 的窗口层级是如何划分的？&quot;">​</a></h4><p><strong>参考答案</strong>： WMS 将窗口分为多个层级（TYPE_*）：</p><ul><li>TYPE_APPLICATION_STARTING (1)：启动窗口</li><li>TYPE_APPLICATION (2)：应用窗口</li><li>TYPE_APPLICATION_PANEL (3)：应用面板</li><li>TYPE_STATUS_BAR (20)：状态栏</li><li>TYPE_SYSTEM_ALERT (19)：系统警告</li><li>TYPE_INPUT_METHOD (22)：输入法窗口</li><li>TYPE_ACCESSIBILITY_OVERLAY (23)：无障碍覆盖层</li><li>TYPE_SECURE_OVERLAY (24)：安全覆盖层</li></ul><h3 id="_6-2-进阶问题" tabindex="-1">6.2 进阶问题 <a class="header-anchor" href="#_6-2-进阶问题" aria-label="Permalink to &quot;6.2 进阶问题&quot;">​</a></h3><h4 id="q4-activity-启动的完整流程是什么" tabindex="-1">Q4: Activity 启动的完整流程是什么？ <a class="header-anchor" href="#q4-activity-启动的完整流程是什么" aria-label="Permalink to &quot;Q4: Activity 启动的完整流程是什么？&quot;">​</a></h4><p><strong>参考答案</strong>：</p><ol><li>Activity.startActivity() → Instrumentation.execStartActivity()</li><li>通过 Binder 调用 AMS.startActivity()</li><li>AMS 验证调用者，获取进程记录</li><li>ActivityStackSupervisor 解析 ActivityInfo（查询 PMS）</li><li>创建 ActivityRecord，决定启动模式</li><li>检查进程是否存在，不存在则创建新进程</li><li>应用进程侧：ActivityThread.scheduleLaunchActivity()</li><li>H 消息处理，调用 Activity.performCreate()</li><li>Activity.onCreate() → onStart() → onResume()</li><li>WMS 创建窗口，SurfaceFlinger 合成显示</li></ol><h4 id="q5-apk-安装的完整流程是什么" tabindex="-1">Q5: APK 安装的完整流程是什么？ <a class="header-anchor" href="#q5-apk-安装的完整流程是什么" aria-label="Permalink to &quot;Q5: APK 安装的完整流程是什么？&quot;">​</a></h4><p><strong>参考答案</strong>：</p><ol><li>PackageManagerService.installPackage() 接收安装请求</li><li>验证 APK 完整性和签名</li><li>复制 APK 到 /data/app/&lt;package&gt;/</li><li>PackageParser 解析 AndroidManifest.xml</li><li>检查签名一致性（更新时对比旧版本）</li><li>授予权限（normal 自动授予，dangerous 等待用户确认）</li><li>dex2oat 优化 DEX 文件</li><li>更新 PackageSetting，添加到 mPackages</li><li>发送 ACTION_PACKAGE_ADDED 广播</li><li>通知 Launcher 更新图标</li></ol><h4 id="q6-窗口是如何创建的" tabindex="-1">Q6: 窗口是如何创建的？ <a class="header-anchor" href="#q6-窗口是如何创建的" aria-label="Permalink to &quot;Q6: 窗口是如何创建的？&quot;">​</a></h4><p><strong>参考答案</strong>：</p><ol><li>Activity 创建 DecorView</li><li>WindowManager.addView() 请求添加窗口</li><li>ViewRootImpl.setView() 调用 WindowSession.addToDisplay()</li><li>Binder 调用 WMS.addToDisplay()</li><li>WMS 创建 WindowState 对象</li><li>创建 Surface（SurfaceFlinger 分配）</li><li>应用侧绘制（Canvas 绘制到 Surface）</li><li>SurfaceFlinger 合成所有 Surface 输出到 Framebuffer</li></ol><h3 id="_6-3-深度问题" tabindex="-1">6.3 深度问题 <a class="header-anchor" href="#_6-3-深度问题" aria-label="Permalink to &quot;6.3 深度问题&quot;">​</a></h3><h4 id="q7-ams-如何管理进程优先级" tabindex="-1">Q7: AMS 如何管理进程优先级？ <a class="header-anchor" href="#q7-ams-如何管理进程优先级" aria-label="Permalink to &quot;Q7: AMS 如何管理进程优先级？&quot;">​</a></h4><p><strong>参考答案</strong>： AMS 通过 OOM Adjust 机制管理进程优先级：</p><ol><li>根据进程状态计算 OOM 调整值（0-15）</li><li>优先级：Foreground(0) &gt; Visible(1) &gt; Perceptible(2) &gt; Background(4-12) &gt; Empty(15)</li><li>定期调用 updateOomAdjLocked() 更新所有进程</li><li>通过 Process.setOomAdj(pid, adj) 通知内核</li><li>内存不足时，LMK（Low Memory Killer）根据 OOM Adjust 杀死进程</li></ol><p><strong>计算逻辑</strong>：</p><ul><li>有前台 Activity：FOREGROUND_APP_ADJ (0)</li><li>可见但非前台：VISIBLE_APP_ADJ (1)</li><li>有前台 Service：PERCEPTIBLE_APP_ADJ (2)</li><li>后台进程：根据 LRU 顺序计算 (4-12)</li><li>空进程：CACHED_APP_MAX_ADJ (15)</li></ul><h4 id="q8-pms-的签名验证机制是怎样的" tabindex="-1">Q8: PMS 的签名验证机制是怎样的？ <a class="header-anchor" href="#q8-pms-的签名验证机制是怎样的" aria-label="Permalink to &quot;Q8: PMS 的签名验证机制是怎样的？&quot;">​</a></h4><p><strong>参考答案</strong>： PMS 的签名验证流程：</p><ol><li><strong>新安装</strong>：验证 APK 的签名证书，提取公钥</li><li><strong>更新安装</strong>：对比新旧 APK 的签名 <ul><li>签名必须一致（或满足升级策略）</li><li>检查证书链和有效期</li></ul></li><li><strong>系统应用</strong>：使用预置签名验证</li><li><strong>共享 UID</strong>：相同 UID 的应用必须签名一致</li></ol><p><strong>签名策略</strong>：</p><ul><li>SigningDetails.CAPABILITY_NEVER_ROLLBACK：禁止回滚</li><li>SigningDetails.CAPABILITY_CAN_ROLLBACK：允许回滚</li><li>v2/v3 签名方案支持更细粒度的权限控制</li></ul><h4 id="q9-wms-如何分发输入事件" tabindex="-1">Q9: WMS 如何分发输入事件？ <a class="header-anchor" href="#q9-wms-如何分发输入事件" aria-label="Permalink to &quot;Q9: WMS 如何分发输入事件？&quot;">​</a></h4><p><strong>参考答案</strong>： 输入事件分发流程：</p><ol><li>InputReader 从 /dev/input/event* 读取原始事件</li><li>InputReader 解析为 MotionEvent</li><li>放入 InputDispatcher 队列</li><li>InputDispatcher 查询 WMS 获取目标窗口</li><li>WMS 根据坐标和 Z-order 查找最顶层可接收输入的窗口</li><li>InputDispatcher 通过 InputChannel 发送事件到应用进程</li><li>ViewRootImpl 接收事件，调用 dispatchPointerEvent()</li><li>事件沿 View 树传递：DecorView → Activity → ViewGroup → View</li></ol><p><strong>ANR 机制</strong>：</p><ul><li>输入事件 5 秒内未处理完成，触发 ANR</li><li>InputDispatcher 监控应用响应时间</li><li>超时后杀死应用或弹出 ANR 对话框</li></ul><hr><h2 id="七、参考资料" tabindex="-1">七、参考资料 <a class="header-anchor" href="#七、参考资料" aria-label="Permalink to &quot;七、参考资料&quot;">​</a></h2><ol><li><a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/am/ActivityManagerService.java" target="_blank" rel="noreferrer">Android 源码 - ActivityManagerService.java</a></li><li><a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/pm/PackageManagerService.java" target="_blank" rel="noreferrer">Android 源码 - PackageManagerService.java</a></li><li><a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/wm/WindowManagerService.java" target="_blank" rel="noreferrer">Android 源码 - WindowManagerService.java</a></li><li><a href="https://developer.android.com/guide/components/activities/activity-lifecycle" target="_blank" rel="noreferrer">Android 组件生命周期</a></li><li><a href="https://developer.android.com/guide/topics/permissions/overview" target="_blank" rel="noreferrer">Android 权限模型</a></li></ol><hr><p><strong>本文约 14,000 字，涵盖 AMS、PMS、WMS 三大核心服务的核心知识点。建议结合源码深入理解，并在实际项目中观察三大服务的行为</strong>。</p>`,136)])])}const c=a(l,[["render",t]]);export{g as __pageData,c as default};
