import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const c=JSON.parse('{"title":"Groovy vs Kotlin DSL","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/15_Engineering/02_Groovy_Kotlin_DSL.md","filePath":"00-android/15_Engineering/02_Groovy_Kotlin_DSL.md"}'),l={name:"00-android/15_Engineering/02_Groovy_Kotlin_DSL.md"};function e(t,s,h,k,r,d){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="groovy-vs-kotlin-dsl" tabindex="-1">Groovy vs Kotlin DSL <a class="header-anchor" href="#groovy-vs-kotlin-dsl" aria-label="Permalink to &quot;Groovy vs Kotlin DSL&quot;">​</a></h1><blockquote><p><strong>字数统计：约 8000 字</strong><br><strong>难度等级：⭐⭐⭐</strong><br><strong>面试重要度：⭐⭐⭐</strong></p></blockquote><hr><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-dsl-简介">DSL 简介</a></li><li><a href="#2-groovy-dsl">Groovy DSL</a></li><li><a href="#3-kotlin-dsl">Kotlin DSL</a></li><li><a href="#4-对比与迁移">对比与迁移</a></li><li><a href="#5-最佳实践">最佳实践</a></li><li><a href="#6-面试考点">面试考点</a></li></ol><hr><h2 id="_1-dsl-简介" tabindex="-1">1. DSL 简介 <a class="header-anchor" href="#_1-dsl-简介" aria-label="Permalink to &quot;1. DSL 简介&quot;">​</a></h2><h3 id="_1-1-什么是-dsl" tabindex="-1">1.1 什么是 DSL <a class="header-anchor" href="#_1-1-什么是-dsl" aria-label="Permalink to &quot;1.1 什么是 DSL&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DSL (Domain Specific Language) 领域特定语言：</span></span>
<span class="line"><span>- 专为特定领域设计的语言</span></span>
<span class="line"><span>- Gradle 使用 DSL 描述构建配置</span></span>
<span class="line"><span>- 两种选择：Groovy DSL 和 Kotlin DSL</span></span></code></pre></div><h3 id="_1-2-文件扩展名" tabindex="-1">1.2 文件扩展名 <a class="header-anchor" href="#_1-2-文件扩展名" aria-label="Permalink to &quot;1.2 文件扩展名&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Groovy DSL:</span></span>
<span class="line"><span>- build.gradle</span></span>
<span class="line"><span>- settings.gradle</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Kotlin DSL:</span></span>
<span class="line"><span>- build.gradle.kts</span></span>
<span class="line"><span>- settings.gradle.kts</span></span></code></pre></div><h3 id="_1-3-历史背景" tabindex="-1">1.3 历史背景 <a class="header-anchor" href="#_1-3-历史背景" aria-label="Permalink to &quot;1.3 历史背景&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>时间线：</span></span>
<span class="line"><span>- 2012: Gradle 开始支持 Android</span></span>
<span class="line"><span>- 2018: Gradle 4.0 引入 Kotlin DSL 实验性支持</span></span>
<span class="line"><span>- 2020: Gradle 6.0 Kotlin DSL 稳定</span></span>
<span class="line"><span>- 2023: Google 推荐 Kotlin DSL</span></span></code></pre></div><hr><h2 id="_2-groovy-dsl" tabindex="-1">2. Groovy DSL <a class="header-anchor" href="#_2-groovy-dsl" aria-label="Permalink to &quot;2. Groovy DSL&quot;">​</a></h2><h3 id="_2-1-基础语法" tabindex="-1">2.1 基础语法 <a class="header-anchor" href="#_2-1-基础语法" aria-label="Permalink to &quot;2.1 基础语法&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// build.gradle (Groovy)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 插件</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id &#39;com.android.application&#39;</span></span>
<span class="line"><span>    id &#39;org.jetbrains.kotlin.android&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Android 配置</span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    namespace &#39;com.example.app&#39;</span></span>
<span class="line"><span>    compileSdk 34</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    defaultConfig {</span></span>
<span class="line"><span>        applicationId &quot;com.example.app&quot;</span></span>
<span class="line"><span>        minSdk 21</span></span>
<span class="line"><span>        targetSdk 34</span></span>
<span class="line"><span>        versionCode 1</span></span>
<span class="line"><span>        versionName &quot;1.0&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    buildTypes {</span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            minifyEnabled true</span></span>
<span class="line"><span>            proguardFiles getDefaultProguardFile(&#39;proguard-android.txt&#39;), &#39;proguard-rules.pro&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 依赖</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation &#39;androidx.core:core-ktx:1.12.0&#39;</span></span>
<span class="line"><span>    implementation &#39;androidx.appcompat:appcompat:1.6.1&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    testImplementation &#39;junit:junit:4.13.2&#39;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-2-动态特性" tabindex="-1">2.2 动态特性 <a class="header-anchor" href="#_2-2-动态特性" aria-label="Permalink to &quot;2.2 动态特性&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 字符串插值</span></span>
<span class="line"><span>def version = &quot;1.0.0&quot;</span></span>
<span class="line"><span>println &quot;Version: \${version}&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 闭包</span></span>
<span class="line"><span>tasks.register(&#39;hello&#39;) {</span></span>
<span class="line"><span>    doLast {</span></span>
<span class="line"><span>        println &#39;Hello&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 动态方法调用</span></span>
<span class="line"><span>def configName = &#39;release&#39;</span></span>
<span class="line"><span>android.buildTypes.&quot;\${configName}&quot;.minifyEnabled = true</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 元编程</span></span>
<span class="line"><span>def configs = [&#39;debug&#39;, &#39;release&#39;]</span></span>
<span class="line"><span>configs.each { config -&gt;</span></span>
<span class="line"><span>    android.buildTypes.&quot;\${config}&quot;.debuggable = (config == &#39;debug&#39;)</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-3-脚本插件" tabindex="-1">2.3 脚本插件 <a class="header-anchor" href="#_2-3-脚本插件" aria-label="Permalink to &quot;2.3 脚本插件&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// apply from: &#39;config.gradle&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// config.gradle</span></span>
<span class="line"><span>ext {</span></span>
<span class="line"><span>    androidVersion = 34</span></span>
<span class="line"><span>    minSdkVersion = 21</span></span>
<span class="line"><span>    targetSdkVersion = 34</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    versions = [</span></span>
<span class="line"><span>        coreKtx: &#39;1.12.0&#39;,</span></span>
<span class="line"><span>        appcompat: &#39;1.6.1&#39;,</span></span>
<span class="line"><span>        material: &#39;1.10.0&#39;</span></span>
<span class="line"><span>    ]</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用</span></span>
<span class="line"><span>// build.gradle</span></span>
<span class="line"><span>apply from: &#39;config.gradle&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    compileSdk rootProject.ext.androidVersion</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    defaultConfig {</span></span>
<span class="line"><span>        minSdk rootProject.ext.minSdkVersion</span></span>
<span class="line"><span>        targetSdk rootProject.ext.targetSdkVersion</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    def versions = rootProject.ext.versions</span></span>
<span class="line"><span>    implementation &quot;androidx.core:core-ktx:\${versions.coreKtx}&quot;</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_3-kotlin-dsl" tabindex="-1">3. Kotlin DSL <a class="header-anchor" href="#_3-kotlin-dsl" aria-label="Permalink to &quot;3. Kotlin DSL&quot;">​</a></h2><h3 id="_3-1-基础语法" tabindex="-1">3.1 基础语法 <a class="header-anchor" href="#_3-1-基础语法" aria-label="Permalink to &quot;3.1 基础语法&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 插件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.android.application&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;org.jetbrains.kotlin.android&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Android 配置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">android</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    namespace </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;com.example.app&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    compileSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 34</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    defaultConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        applicationId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;com.example.app&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        minSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 21</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        targetSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 34</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        versionCode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        versionName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    buildTypes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        release</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            isMinifyEnabled </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            proguardFiles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                getDefaultProguardFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;proguard-android-optimize.txt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                &quot;proguard-rules.pro&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 依赖</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;androidx.core:core-ktx:1.12.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;androidx.appcompat:appcompat:1.6.1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    testImplementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;junit:junit:4.13.2&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-2-类型安全" tabindex="-1">3.2 类型安全 <a class="header-anchor" href="#_3-2-类型安全" aria-label="Permalink to &quot;3.2 类型安全&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 版本常量</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lifecycleVersion </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;2.6.2&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> roomVersion </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;2.6.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> retrofitVersion </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;2.9.0&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 依赖 - 类型安全</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;androidx.lifecycle:lifecycle-runtime-ktx:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">$lifecycleVersion</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;androidx.room:room-runtime:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">$roomVersion</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.squareup.retrofit2:retrofit:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">$retrofitVersion</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 Version Catalog (推荐)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.androidx.core.ktx)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.androidx.appcompat)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.squareup.retrofit2)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-3-自定义函数" tabindex="-1">3.3 自定义函数 <a class="header-anchor" href="#_3-3-自定义函数" aria-label="Permalink to &quot;3.3 自定义函数&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 定义函数</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Project</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">androidVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 34</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DependencyHandlerScope</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">implementationOnly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(dependency: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;implementation&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, dependency)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">android</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    compileSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> androidVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementationOnly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.example:library:1.0.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-4-脚本插件-kotlin" tabindex="-1">3.4 脚本插件 (Kotlin) <a class="header-anchor" href="#_3-4-脚本插件-kotlin" aria-label="Permalink to &quot;3.4 脚本插件 (Kotlin)&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// buildSrc/src/main/kotlin/Versions.kt</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">object</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Versions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> coreKtx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.12.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> appcompat </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.6.1&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> material </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.10.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;androidx.core:core-ktx:\${Versions.coreKtx}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;androidx.appcompat:appcompat:\${Versions.appcompat}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.google.android.material:material:\${Versions.material}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 或使用 Version Catalog</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// libs.versions.toml</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[versions]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">core</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ktx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.12.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">appcompat </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.6.1&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[libraries]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">core</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ktx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { group </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;androidx.core&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;core-ktx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version.ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;core-ktx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">appcompat </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { group </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;androidx.appcompat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;appcompat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version.ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;appcompat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span></code></pre></div><hr><h2 id="_4-对比与迁移" tabindex="-1">4. 对比与迁移 <a class="header-anchor" href="#_4-对比与迁移" aria-label="Permalink to &quot;4. 对比与迁移&quot;">​</a></h2><h3 id="_4-1-语法对比" tabindex="-1">4.1 语法对比 <a class="header-anchor" href="#_4-1-语法对比" aria-label="Permalink to &quot;4.1 语法对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>特性</th><th>Groovy DSL</th><th>Kotlin DSL</th></tr></thead><tbody><tr><td>文件扩展名</td><td><code>.gradle</code></td><td><code>.gradle.kts</code></td></tr><tr><td>属性赋值</td><td><code>property = value</code></td><td><code>property = value</code></td></tr><tr><td>方法调用</td><td><code>method &#39;arg&#39;</code></td><td><code>method(&quot;arg&quot;)</code></td></tr><tr><td>闭包</td><td><code>{ }</code></td><td><code>{ }</code></td></tr><tr><td>字符串插值</td><td><code>&quot;\${var}&quot;</code></td><td><code>&quot;\${var}&quot;</code></td></tr><tr><td>类型安全</td><td>❌ 动态</td><td>✅ 静态</td></tr><tr><td>IDE 支持</td><td>一般</td><td>优秀</td></tr><tr><td>编译速度</td><td>快</td><td>稍慢</td></tr><tr><td>学习曲线</td><td>低 (Groovy)</td><td>中 (Kotlin)</td></tr></tbody></table><h3 id="_4-2-常见转换" tabindex="-1">4.2 常见转换 <a class="header-anchor" href="#_4-2-常见转换" aria-label="Permalink to &quot;4.2 常见转换&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Groovy → Kotlin</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 插件</span></span>
<span class="line"><span>// Groovy:</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id &#39;com.android.application&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Kotlin:</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id(&quot;com.android.application&quot;)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 属性</span></span>
<span class="line"><span>// Groovy:</span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    namespace &#39;com.example.app&#39;</span></span>
<span class="line"><span>    compileSdk 34</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Kotlin:</span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    namespace = &quot;com.example.app&quot;</span></span>
<span class="line"><span>    compileSdk = 34</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 布尔值</span></span>
<span class="line"><span>// Groovy:</span></span>
<span class="line"><span>buildTypes {</span></span>
<span class="line"><span>    release {</span></span>
<span class="line"><span>        minifyEnabled true</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Kotlin:</span></span>
<span class="line"><span>buildTypes {</span></span>
<span class="line"><span>    release {</span></span>
<span class="line"><span>        isMinifyEnabled = true</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 依赖</span></span>
<span class="line"><span>// Groovy:</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation &#39;androidx.core:core-ktx:1.12.0&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Kotlin:</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation(&quot;androidx.core:core-ktx:1.12.0&quot;)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 5. 方法调用</span></span>
<span class="line"><span>// Groovy:</span></span>
<span class="line"><span>proguardFiles getDefaultProguardFile(&#39;file.txt&#39;), &#39;proguard-rules.pro&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Kotlin:</span></span>
<span class="line"><span>proguardFiles(</span></span>
<span class="line"><span>    getDefaultProguardFile(&quot;proguard-android-optimize.txt&quot;),</span></span>
<span class="line"><span>    &quot;proguard-rules.pro&quot;</span></span>
<span class="line"><span>)</span></span></code></pre></div><h3 id="_4-3-迁移步骤" tabindex="-1">4.3 迁移步骤 <a class="header-anchor" href="#_4-3-迁移步骤" aria-label="Permalink to &quot;4.3 迁移步骤&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1. 备份现有配置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cp</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build.gradle</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build.gradle.backup</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2. 重命名文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mv</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build.gradle</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mv</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> settings.gradle</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> settings.gradle.kts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 3. 转换语法</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 插件：id &#39;xxx&#39; → id(&quot;xxx&quot;)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 属性：name &#39;value&#39; → name = &quot;value&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 依赖：&#39;group:artifact:version&#39; → (&quot;group:artifact:version&quot;)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 4. 同步项目</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># File → Sync Project with Gradle Files</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 5. 修复错误</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 根据 IDE 提示修复类型错误</span></span></code></pre></div><h3 id="_4-4-迁移示例" tabindex="-1">4.4 迁移示例 <a class="header-anchor" href="#_4-4-迁移示例" aria-label="Permalink to &quot;4.4 迁移示例&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 迁移前 (Groovy)</span></span>
<span class="line"><span>// build.gradle</span></span>
<span class="line"><span>apply plugin: &#39;com.android.application&#39;</span></span>
<span class="line"><span>apply plugin: &#39;kotlin-android&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    compileSdkVersion 34</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    defaultConfig {</span></span>
<span class="line"><span>        applicationId &quot;com.example.app&quot;</span></span>
<span class="line"><span>        minSdkVersion 21</span></span>
<span class="line"><span>        targetSdkVersion 34</span></span>
<span class="line"><span>        versionCode 1</span></span>
<span class="line"><span>        versionName &quot;1.0&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    buildTypes {</span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            minifyEnabled true</span></span>
<span class="line"><span>            proguardFiles getDefaultProguardFile(&#39;proguard-android.txt&#39;), &#39;proguard-rules.pro&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation &#39;androidx.core:core-ktx:1.12.0&#39;</span></span>
<span class="line"><span>    implementation &#39;androidx.appcompat:appcompat:1.6.1&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 迁移后 (Kotlin)</span></span>
<span class="line"><span>// build.gradle.kts</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id(&quot;com.android.application&quot;)</span></span>
<span class="line"><span>    id(&quot;org.jetbrains.kotlin.android&quot;)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    compileSdk = 34</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    defaultConfig {</span></span>
<span class="line"><span>        applicationId = &quot;com.example.app&quot;</span></span>
<span class="line"><span>        minSdk = 21</span></span>
<span class="line"><span>        targetSdk = 34</span></span>
<span class="line"><span>        versionCode = 1</span></span>
<span class="line"><span>        versionName = &quot;1.0&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    buildTypes {</span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            isMinifyEnabled = true</span></span>
<span class="line"><span>            proguardFiles(</span></span>
<span class="line"><span>                getDefaultProguardFile(&quot;proguard-android-optimize.txt&quot;),</span></span>
<span class="line"><span>                &quot;proguard-rules.pro&quot;</span></span>
<span class="line"><span>            )</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation(&quot;androidx.core:core-ktx:1.12.0&quot;)</span></span>
<span class="line"><span>    implementation(&quot;androidx.appcompat:appcompat:1.6.1&quot;)</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_5-最佳实践" tabindex="-1">5. 最佳实践 <a class="header-anchor" href="#_5-最佳实践" aria-label="Permalink to &quot;5. 最佳实践&quot;">​</a></h2><h3 id="_5-1-选择建议" tabindex="-1">5.1 选择建议 <a class="header-anchor" href="#_5-1-选择建议" aria-label="Permalink to &quot;5.1 选择建议&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>选择 Kotlin DSL 当：</span></span>
<span class="line"><span>- 新项目</span></span>
<span class="line"><span>- 团队熟悉 Kotlin</span></span>
<span class="line"><span>- 需要更好的 IDE 支持</span></span>
<span class="line"><span>- 重视类型安全</span></span>
<span class="line"><span></span></span>
<span class="line"><span>选择 Groovy DSL 当：</span></span>
<span class="line"><span>- 旧项目迁移成本高</span></span>
<span class="line"><span>- 团队熟悉 Groovy</span></span>
<span class="line"><span>- 需要动态特性</span></span>
<span class="line"><span>- 构建速度敏感</span></span></code></pre></div><h3 id="_5-2-版本管理" tabindex="-1">5.2 版本管理 <a class="header-anchor" href="#_5-2-版本管理" aria-label="Permalink to &quot;5.2 版本管理&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 1: Version Catalog (推荐)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// libs.versions.toml</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[versions]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">android</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gradle </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;8.1.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kotlin </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.9.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">core</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ktx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.12.0&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[plugins]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">android</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">application </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;com.android.application&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version.ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;android-gradle&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kotlin</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">android </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;org.jetbrains.kotlin.android&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version.ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kotlin&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[libraries]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">core</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ktx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { group </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;androidx.core&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;core-ktx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version.ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;core-ktx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    alias</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.plugins.android.application)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    alias</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.plugins.kotlin.android)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.core.ktx)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 2: buildSrc</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// buildSrc/src/main/kotlin/Versions.kt</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">object</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Versions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> coreKtx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.12.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 3: 版本对象</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">object</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    object</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AndroidX</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> coreKtx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;androidx.core:core-ktx:1.12.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Dependencies.AndroidX.coreKtx)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_5-3-共享配置" tabindex="-1">5.3 共享配置 <a class="header-anchor" href="#_5-3-共享配置" aria-label="Permalink to &quot;5.3 共享配置&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// buildSrc/src/main/kotlin/AndroidModuleConfig.kt</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Project</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureAndroidModule</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    android</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        compileSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 34</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        defaultConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            minSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 21</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            targetSdk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 34</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        compileOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            sourceCompatibility </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JavaVersion.VERSION_17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            targetCompatibility </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JavaVersion.VERSION_17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模块 build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.android.library&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureAndroidModule</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><h3 id="_5-4-性能优化" tabindex="-1">5.4 性能优化 <a class="header-anchor" href="#_5-4-性能优化" aria-label="Permalink to &quot;5.4 性能优化&quot;">​</a></h3><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// gradle.properties</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">org.gradle.jvmargs</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Xmx2048m </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Dfile.encoding</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">UTF</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">org.gradle.parallel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">org.gradle.caching</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">org.gradle.configuration</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cache</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 避免在配置阶段执行耗时操作</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">tasks.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">register</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;expensiveTask&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    doLast</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 耗时操作放在 doLast 中</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_6-面试考点" tabindex="-1">6. 面试考点 <a class="header-anchor" href="#_6-面试考点" aria-label="Permalink to &quot;6. 面试考点&quot;">​</a></h2><h3 id="_6-1-基础概念" tabindex="-1">6.1 基础概念 <a class="header-anchor" href="#_6-1-基础概念" aria-label="Permalink to &quot;6.1 基础概念&quot;">​</a></h3><p><strong>Q1: Groovy DSL 和 Kotlin DSL 的区别？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>- Groovy: 动态类型，简洁，编译快</span></span>
<span class="line"><span>- Kotlin: 静态类型，IDE 支持好，类型安全</span></span>
<span class="line"><span>- Google 推荐：Kotlin DSL (2023+)</span></span>
<span class="line"><span>- 迁移趋势：Groovy → Kotlin</span></span></code></pre></div><p><strong>Q2: 为什么推荐 Kotlin DSL？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>1. 类型安全 - 编译时检查</span></span>
<span class="line"><span>2. IDE 支持 - 自动补全、导航</span></span>
<span class="line"><span>3. 重构友好 - 重命名、查找引用</span></span>
<span class="line"><span>4. Kotlin 生态 - 团队技能复用</span></span>
<span class="line"><span>5. 未来趋势 - Google 官方推荐</span></span></code></pre></div><h3 id="_6-2-实战问题" tabindex="-1">6.2 实战问题 <a class="header-anchor" href="#_6-2-实战问题" aria-label="Permalink to &quot;6.2 实战问题&quot;">​</a></h3><p><strong>Q3: 如何管理依赖版本？</strong></p><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 推荐：Version Catalog</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// libs.versions.toml</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[versions]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">core</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ktx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.12.0&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[libraries]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">core</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ktx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { group </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;androidx.core&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;core-ktx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version.ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;core-ktx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build.gradle.kts</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    implementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(libs.core.ktx)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>Q4: 如何从 Groovy 迁移到 Kotlin DSL？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>1. 重命名文件 (.gradle → .gradle.kts)</span></span>
<span class="line"><span>2. 转换语法 (id &#39;xxx&#39; → id(&quot;xxx&quot;))</span></span>
<span class="line"><span>3. 属性赋值 (name &#39;value&#39; → name = &quot;value&quot;)</span></span>
<span class="line"><span>4. 依赖格式 (&#39;group:art:ver&#39; → (&quot;group:art:ver&quot;))</span></span>
<span class="line"><span>5. 同步并修复错误</span></span></code></pre></div><h3 id="_6-3-高级问题" tabindex="-1">6.3 高级问题 <a class="header-anchor" href="#_6-3-高级问题" aria-label="Permalink to &quot;6.3 高级问题&quot;">​</a></h3><p><strong>Q5: 什么是 buildSrc？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>- 共享构建逻辑的模块</span></span>
<span class="line"><span>- 自动编译并添加到 classpath</span></span>
<span class="line"><span>- 用于定义版本、插件、配置</span></span>
<span class="line"><span>- 替代方案：Version Catalog,  Convention Plugins</span></span></code></pre></div><p><strong>Q6: 如何优化 Kotlin DSL 编译速度？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>1. 启用配置缓存</span></span>
<span class="line"><span>2. 使用 build cache</span></span>
<span class="line"><span>3. 避免 buildSrc 过大</span></span>
<span class="line"><span>4. 使用 Version Catalog</span></span>
<span class="line"><span>5. 减少脚本复杂度</span></span></code></pre></div><hr><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li><a href="https://docs.gradle.org/current/userguide/kotlin_dsl.html" target="_blank" rel="noreferrer">Gradle Kotlin DSL 文档</a></li><li><a href="https://developer.android.com/studio/build" target="_blank" rel="noreferrer">Android Gradle Plugin</a></li><li><a href="https://docs.gradle.org/current/userguide/platforms.html" target="_blank" rel="noreferrer">Version Catalog</a></li></ul><hr><p><em>本文完，感谢阅读！</em></p>`,73)])])}const E=a(l,[["render",e]]);export{c as __pageData,E as default};
