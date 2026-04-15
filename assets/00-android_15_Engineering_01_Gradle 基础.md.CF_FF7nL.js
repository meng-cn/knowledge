import{_ as a,o as n,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const g=JSON.parse('{"title":"Gradle 基础","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/15_Engineering/01_Gradle 基础.md","filePath":"00-android/15_Engineering/01_Gradle 基础.md"}'),i={name:"00-android/15_Engineering/01_Gradle 基础.md"};function l(t,s,r,c,o,d){return n(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="gradle-基础" tabindex="-1">Gradle 基础 <a class="header-anchor" href="#gradle-基础" aria-label="Permalink to &quot;Gradle 基础&quot;">​</a></h1><blockquote><p><strong>字数统计：约 9000 字</strong><br><strong>难度等级：⭐⭐⭐⭐</strong><br><strong>面试重要度：⭐⭐⭐⭐⭐</strong></p></blockquote><hr><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-gradle-简介">Gradle 简介</a></li><li><a href="#2-构建脚本基础">构建脚本基础</a></li><li><a href="#3-依赖管理">依赖管理</a></li><li><a href="#4-构建变体">构建变体</a></li><li><a href="#5-自定义任务">自定义任务</a></li><li><a href="#6-性能优化">性能优化</a></li><li><a href="#7-面试考点">面试考点</a></li></ol><hr><h2 id="_1-gradle-简介" tabindex="-1">1. Gradle 简介 <a class="header-anchor" href="#_1-gradle-简介" aria-label="Permalink to &quot;1. Gradle 简介&quot;">​</a></h2><h3 id="_1-1-什么是-gradle" tabindex="-1">1.1 什么是 Gradle <a class="header-anchor" href="#_1-1-什么是-gradle" aria-label="Permalink to &quot;1.1 什么是 Gradle&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Gradle 是一个基于 JVM 的构建工具：</span></span>
<span class="line"><span>- 使用 Groovy 或 Kotlin DSL</span></span>
<span class="line"><span>- 增量构建（只构建变化的部分）</span></span>
<span class="line"><span>- 依赖管理</span></span>
<span class="line"><span>- 多项目构建</span></span>
<span class="line"><span>- 插件系统</span></span></code></pre></div><h3 id="_1-2-gradle-架构" tabindex="-1">1.2 Gradle 架构 <a class="header-anchor" href="#_1-2-gradle-架构" aria-label="Permalink to &quot;1.2 Gradle 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Gradle 核心组件：</span></span>
<span class="line"><span>- Gradle Wrapper (gradlew/gradlew.bat)</span></span>
<span class="line"><span>- build.gradle (构建脚本)</span></span>
<span class="line"><span>- settings.gradle (项目配置)</span></span>
<span class="line"><span>- gradle.properties (属性配置)</span></span>
<span class="line"><span>- local.properties (本地配置)</span></span></code></pre></div><h3 id="_1-3-项目结构" tabindex="-1">1.3 项目结构 <a class="header-anchor" href="#_1-3-项目结构" aria-label="Permalink to &quot;1.3 项目结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MyProject/</span></span>
<span class="line"><span>├── app/                      # 应用模块</span></span>
<span class="line"><span>│   ├── build.gradle          # 模块级构建脚本</span></span>
<span class="line"><span>│   ├── src/</span></span>
<span class="line"><span>│   │   ├── main/             # 主代码</span></span>
<span class="line"><span>│   │   ├── test/             # 单元测试</span></span>
<span class="line"><span>│   │   └── androidTest/      # 仪器测试</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── build.gradle              # 项目级构建脚本</span></span>
<span class="line"><span>├── settings.gradle           # 项目设置</span></span>
<span class="line"><span>├── gradle.properties         # Gradle 属性</span></span>
<span class="line"><span>└── gradle/</span></span>
<span class="line"><span>    └── wrapper/</span></span>
<span class="line"><span>        └── gradle-wrapper.properties</span></span></code></pre></div><hr><h2 id="_2-构建脚本基础" tabindex="-1">2. 构建脚本基础 <a class="header-anchor" href="#_2-构建脚本基础" aria-label="Permalink to &quot;2. 构建脚本基础&quot;">​</a></h2><h3 id="_2-1-项目级-build-gradle" tabindex="-1">2.1 项目级 build.gradle <a class="header-anchor" href="#_2-1-项目级-build-gradle" aria-label="Permalink to &quot;2.1 项目级 build.gradle&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 项目根目录 build.gradle</span></span>
<span class="line"><span>buildscript {</span></span>
<span class="line"><span>    ext.kotlin_version = &#39;1.9.0&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    repositories {</span></span>
<span class="line"><span>        google()</span></span>
<span class="line"><span>        mavenCentral()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    dependencies {</span></span>
<span class="line"><span>        classpath &#39;com.android.tools.build:gradle:8.1.0&#39;</span></span>
<span class="line"><span>        classpath &quot;org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version&quot;</span></span>
<span class="line"><span>        classpath &#39;com.google.dagger:hilt-android-gradle-plugin:2.48&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>allprojects {</span></span>
<span class="line"><span>    repositories {</span></span>
<span class="line"><span>        google()</span></span>
<span class="line"><span>        mavenCentral()</span></span>
<span class="line"><span>        maven { url &#39;https://jitpack.io&#39; }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>task clean(type: Delete) {</span></span>
<span class="line"><span>    delete rootProject.buildDir</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-2-模块级-build-gradle" tabindex="-1">2.2 模块级 build.gradle <a class="header-anchor" href="#_2-2-模块级-build-gradle" aria-label="Permalink to &quot;2.2 模块级 build.gradle&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// app/build.gradle</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id &#39;com.android.application&#39;</span></span>
<span class="line"><span>    id &#39;org.jetbrains.kotlin.android&#39;</span></span>
<span class="line"><span>    id &#39;kotlin-kapt&#39;</span></span>
<span class="line"><span>    id &#39;dagger.hilt.android.plugin&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    namespace &#39;com.example.app&#39;</span></span>
<span class="line"><span>    compileSdk 34</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    defaultConfig {</span></span>
<span class="line"><span>        applicationId &quot;com.example.app&quot;</span></span>
<span class="line"><span>        minSdk 21</span></span>
<span class="line"><span>        targetSdk 34</span></span>
<span class="line"><span>        versionCode 1</span></span>
<span class="line"><span>        versionName &quot;1.0.0&quot;</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        testInstrumentationRunner &quot;androidx.test.runner.AndroidJUnitRunner&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    buildTypes {</span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            minifyEnabled true</span></span>
<span class="line"><span>            proguardFiles getDefaultProguardFile(&#39;proguard-android-optimize.txt&#39;), &#39;proguard-rules.pro&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        debug {</span></span>
<span class="line"><span>            minifyEnabled false</span></span>
<span class="line"><span>            debuggable true</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    compileOptions {</span></span>
<span class="line"><span>        sourceCompatibility JavaVersion.VERSION_17</span></span>
<span class="line"><span>        targetCompatibility JavaVersion.VERSION_17</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    kotlinOptions {</span></span>
<span class="line"><span>        jvmTarget = &#39;17&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    buildFeatures {</span></span>
<span class="line"><span>        viewBinding true</span></span>
<span class="line"><span>        compose true</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    composeOptions {</span></span>
<span class="line"><span>        kotlinCompilerExtensionVersion &#39;1.5.0&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    // 依赖管理</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-3-settings-gradle" tabindex="-1">2.3 settings.gradle <a class="header-anchor" href="#_2-3-settings-gradle" aria-label="Permalink to &quot;2.3 settings.gradle&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// settings.gradle</span></span>
<span class="line"><span>pluginManagement {</span></span>
<span class="line"><span>    repositories {</span></span>
<span class="line"><span>        google()</span></span>
<span class="line"><span>        mavenCentral()</span></span>
<span class="line"><span>        gradlePluginPortal()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencyResolutionManagement {</span></span>
<span class="line"><span>    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)</span></span>
<span class="line"><span>    repositories {</span></span>
<span class="line"><span>        google()</span></span>
<span class="line"><span>        mavenCentral()</span></span>
<span class="line"><span>        maven { url &#39;https://jitpack.io&#39; }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>rootProject.name = &quot;MyProject&quot;</span></span>
<span class="line"><span>include &#39;:app&#39;</span></span>
<span class="line"><span>include &#39;:feature:login&#39;</span></span>
<span class="line"><span>include &#39;:feature:home&#39;</span></span>
<span class="line"><span>include &#39;:core:network&#39;</span></span>
<span class="line"><span>include &#39;:core:database&#39;</span></span></code></pre></div><h3 id="_2-4-gradle-properties" tabindex="-1">2.4 gradle.properties <a class="header-anchor" href="#_2-4-gradle-properties" aria-label="Permalink to &quot;2.4 gradle.properties&quot;">​</a></h3><div class="language-properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># gradle.properties</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Gradle 配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.jvmargs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=-Xmx2048m -</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Dfile.encoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=UTF-8</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.parallel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.caching</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.daemon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.configureondemand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Android 配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">android.useAndroidX</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">android.enableJetifier</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">android.nonTransitiveRClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Kotlin 配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">kotlin.code.style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=official</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">kotlin.incremental</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 构建配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">android.defaults.buildfeatures.buildconfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">android.nonFinalResIds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span></code></pre></div><hr><h2 id="_3-依赖管理" tabindex="-1">3. 依赖管理 <a class="header-anchor" href="#_3-依赖管理" aria-label="Permalink to &quot;3. 依赖管理&quot;">​</a></h2><h3 id="_3-1-依赖配置" tabindex="-1">3.1 依赖配置 <a class="header-anchor" href="#_3-1-依赖配置" aria-label="Permalink to &quot;3.1 依赖配置&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>dependencies {</span></span>
<span class="line"><span>    // 编译时依赖（打包到 APK）</span></span>
<span class="line"><span>    implementation &#39;androidx.core:core-ktx:1.12.0&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 仅编译时依赖（不打包到 APK）</span></span>
<span class="line"><span>    compileOnly &#39;javax.annotation:jsr250-api:1.0&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 运行时依赖（不编译）</span></span>
<span class="line"><span>    runtimeOnly &#39;androidx.profileinstaller:profileinstaller:1.3.1&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 测试依赖</span></span>
<span class="line"><span>    testImplementation &#39;junit:junit:4.13.2&#39;</span></span>
<span class="line"><span>    androidTestImplementation &#39;androidx.test.espresso:espresso-core:3.5.1&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // Kapt（注解处理）</span></span>
<span class="line"><span>    kapt &#39;com.google.dagger:hilt-compiler:2.48&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 本地模块依赖</span></span>
<span class="line"><span>    implementation project(&#39;:core:network&#39;)</span></span>
<span class="line"><span>    implementation project(&#39;:core:database&#39;)</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-2-依赖版本管理" tabindex="-1">3.2 依赖版本管理 <a class="header-anchor" href="#_3-2-依赖版本管理" aria-label="Permalink to &quot;3.2 依赖版本管理&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 方式 1：使用 ext</span></span>
<span class="line"><span>buildscript {</span></span>
<span class="line"><span>    ext {</span></span>
<span class="line"><span>        lifecycle_version = &#39;2.6.2&#39;</span></span>
<span class="line"><span>        room_version = &#39;2.6.0&#39;</span></span>
<span class="line"><span>        retrofit_version = &#39;2.9.0&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation &quot;androidx.lifecycle:lifecycle-runtime-ktx:$lifecycle_version&quot;</span></span>
<span class="line"><span>    implementation &quot;androidx.room:room-runtime:$room_version&quot;</span></span>
<span class="line"><span>    implementation &quot;com.squareup.retrofit2:retrofit:$retrofit_version&quot;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 方式 2：使用 Version Catalog (推荐)</span></span>
<span class="line"><span>// libs.versions.toml</span></span>
<span class="line"><span>[versions]</span></span>
<span class="line"><span>lifecycle = &quot;2.6.2&quot;</span></span>
<span class="line"><span>room = &quot;2.6.0&quot;</span></span>
<span class="line"><span>retrofit = &quot;2.9.0&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[libraries]</span></span>
<span class="line"><span>lifecycle-runtime = { group = &quot;androidx.lifecycle&quot;, name = &quot;lifecycle-runtime-ktx&quot;, version.ref = &quot;lifecycle&quot; }</span></span>
<span class="line"><span>room-runtime = { group = &quot;androidx.room&quot;, name = &quot;room-runtime&quot;, version.ref = &quot;room&quot; }</span></span>
<span class="line"><span>retrofit = { group = &quot;com.squareup.retrofit2&quot;, name = &quot;retrofit&quot;, version.ref = &quot;retrofit&quot; }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// build.gradle</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation libs.lifecycle.runtime</span></span>
<span class="line"><span>    implementation libs.room.runtime</span></span>
<span class="line"><span>    implementation libs.retrofit</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 方式 3：使用 BOM</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation platform(&#39;androidx.compose:compose-bom:2023.10.00&#39;)</span></span>
<span class="line"><span>    implementation &#39;androidx.compose.ui:ui&#39;</span></span>
<span class="line"><span>    implementation &#39;androidx.compose.material3:material3&#39;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-3-依赖冲突解决" tabindex="-1">3.3 依赖冲突解决 <a class="header-anchor" href="#_3-3-依赖冲突解决" aria-label="Permalink to &quot;3.3 依赖冲突解决&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 查看依赖树</span></span>
<span class="line"><span>// ./gradlew app:dependencies</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 查看特定依赖</span></span>
<span class="line"><span>// ./gradlew app:dependencies --configuration releaseRuntimeClasspath</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 排除传递依赖</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation(&#39;com.example:library:1.0.0&#39;) {</span></span>
<span class="line"><span>        exclude group: &#39;com.google.guava&#39;, module: &#39;guava&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 强制使用特定版本</span></span>
<span class="line"><span>configurations.all {</span></span>
<span class="line"><span>    resolutionStrategy {</span></span>
<span class="line"><span>        force &#39;com.google.guava:guava:32.0.0-jre&#39;</span></span>
<span class="line"><span>        eachDependency { details -&gt;</span></span>
<span class="line"><span>            if (details.requested.group == &#39;org.jetbrains.kotlin&#39;) {</span></span>
<span class="line"><span>                details.useVersion &#39;1.9.0&#39;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_4-构建变体" tabindex="-1">4. 构建变体 <a class="header-anchor" href="#_4-构建变体" aria-label="Permalink to &quot;4. 构建变体&quot;">​</a></h2><h3 id="_4-1-build-types" tabindex="-1">4.1 Build Types <a class="header-anchor" href="#_4-1-build-types" aria-label="Permalink to &quot;4.1 Build Types&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>android {</span></span>
<span class="line"><span>    buildTypes {</span></span>
<span class="line"><span>        debug {</span></span>
<span class="line"><span>            applicationIdSuffix &quot;.debug&quot;</span></span>
<span class="line"><span>            debuggable true</span></span>
<span class="line"><span>            minifyEnabled false</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            minifyEnabled true</span></span>
<span class="line"><span>            shrinkResources true</span></span>
<span class="line"><span>            proguardFiles getDefaultProguardFile(&#39;proguard-android-optimize.txt&#39;), &#39;proguard-rules.pro&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        staging {</span></span>
<span class="line"><span>            initWith debug</span></span>
<span class="line"><span>            applicationIdSuffix &quot;.staging&quot;</span></span>
<span class="line"><span>            buildConfigField &quot;String&quot;, &quot;BASE_URL&quot;, &#39;&quot;https://staging.api.com&quot;&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_4-2-product-flavors" tabindex="-1">4.2 Product Flavors <a class="header-anchor" href="#_4-2-product-flavors" aria-label="Permalink to &quot;4.2 Product Flavors&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>android {</span></span>
<span class="line"><span>    flavorDimensions &quot;version&quot;, &quot;environment&quot;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    productFlavors {</span></span>
<span class="line"><span>        // 版本维度</span></span>
<span class="line"><span>        free {</span></span>
<span class="line"><span>            dimension &quot;version&quot;</span></span>
<span class="line"><span>            applicationIdSuffix &quot;.free&quot;</span></span>
<span class="line"><span>            versionNameSuffix &quot;-free&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        paid {</span></span>
<span class="line"><span>            dimension &quot;version&quot;</span></span>
<span class="line"><span>            applicationIdSuffix &quot;.paid&quot;</span></span>
<span class="line"><span>            versionNameSuffix &quot;-paid&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        // 环境维度</span></span>
<span class="line"><span>        dev {</span></span>
<span class="line"><span>            dimension &quot;environment&quot;</span></span>
<span class="line"><span>            buildConfigField &quot;String&quot;, &quot;BASE_URL&quot;, &#39;&quot;https://dev.api.com&quot;&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        staging {</span></span>
<span class="line"><span>            dimension &quot;environment&quot;</span></span>
<span class="line"><span>            buildConfigField &quot;String&quot;, &quot;BASE_URL&quot;, &#39;&quot;https://staging.api.com&quot;&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        production {</span></span>
<span class="line"><span>            dimension &quot;environment&quot;</span></span>
<span class="line"><span>            buildConfigField &quot;String&quot;, &quot;BASE_URL&quot;, &#39;&quot;https://api.com&quot;&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 生成的变体组合：</span></span>
<span class="line"><span>// freeDev, freeStaging, freeProduction</span></span>
<span class="line"><span>// paidDev, paidStaging, paidProduction</span></span></code></pre></div><h3 id="_4-3-source-sets" tabindex="-1">4.3 Source Sets <a class="header-anchor" href="#_4-3-source-sets" aria-label="Permalink to &quot;4.3 Source Sets&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>android {</span></span>
<span class="line"><span>    sourceSets {</span></span>
<span class="line"><span>        main {</span></span>
<span class="line"><span>            java.srcDirs &#39;src/main/java&#39;</span></span>
<span class="line"><span>            res.srcDirs &#39;src/main/res&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        free {</span></span>
<span class="line"><span>            java.srcDirs &#39;src/free/java&#39;</span></span>
<span class="line"><span>            res.srcDirs &#39;src/free/res&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        paid {</span></span>
<span class="line"><span>            java.srcDirs &#39;src/paid/java&#39;</span></span>
<span class="line"><span>            res.srcDirs &#39;src/paid/res&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        debug {</span></span>
<span class="line"><span>            java.srcDirs &#39;src/debug/java&#39;</span></span>
<span class="line"><span>            res.srcDirs &#39;src/debug/res&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            java.srcDirs &#39;src/release/java&#39;</span></span>
<span class="line"><span>            res.srcDirs &#39;src/release/res&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_4-4-签名配置" tabindex="-1">4.4 签名配置 <a class="header-anchor" href="#_4-4-签名配置" aria-label="Permalink to &quot;4.4 签名配置&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>android {</span></span>
<span class="line"><span>    signingConfigs {</span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            storeFile file(&#39;../keystore/release.keystore&#39;)</span></span>
<span class="line"><span>            storePassword System.getenv(&#39;STORE_PASSWORD&#39;) ?: &#39;&#39;</span></span>
<span class="line"><span>            keyAlias &#39;release-key&#39;</span></span>
<span class="line"><span>            keyPassword System.getenv(&#39;KEY_PASSWORD&#39;) ?: &#39;&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        debug {</span></span>
<span class="line"><span>            storeFile file(&#39;../keystore/debug.keystore&#39;)</span></span>
<span class="line"><span>            storePassword &#39;android&#39;</span></span>
<span class="line"><span>            keyAlias &#39;androiddebugkey&#39;</span></span>
<span class="line"><span>            keyPassword &#39;android&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    buildTypes {</span></span>
<span class="line"><span>        release {</span></span>
<span class="line"><span>            signingConfig signingConfigs.release</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        debug {</span></span>
<span class="line"><span>            signingConfig signingConfigs.debug</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_5-自定义任务" tabindex="-1">5. 自定义任务 <a class="header-anchor" href="#_5-自定义任务" aria-label="Permalink to &quot;5. 自定义任务&quot;">​</a></h2><h3 id="_5-1-基础任务" tabindex="-1">5.1 基础任务 <a class="header-anchor" href="#_5-1-基础任务" aria-label="Permalink to &quot;5.1 基础任务&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 简单任务</span></span>
<span class="line"><span>tasks.register(&#39;hello&#39;) {</span></span>
<span class="line"><span>    doLast {</span></span>
<span class="line"><span>        println &#39;Hello, Gradle!&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 带参数的任务</span></span>
<span class="line"><span>tasks.register(&#39;greet&#39;) {</span></span>
<span class="line"><span>    def name = project.hasProperty(&#39;name&#39;) ? project.name : &#39;World&#39;</span></span>
<span class="line"><span>    doLast {</span></span>
<span class="line"><span>        println &quot;Hello, $name!&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用：./gradlew greet -Pname=Android</span></span></code></pre></div><h3 id="_5-2-任务依赖" tabindex="-1">5.2 任务依赖 <a class="header-anchor" href="#_5-2-任务依赖" aria-label="Permalink to &quot;5.2 任务依赖&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>tasks.register(&#39;taskA&#39;) {</span></span>
<span class="line"><span>    doLast {</span></span>
<span class="line"><span>        println &#39;Task A&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>tasks.register(&#39;taskB&#39;) {</span></span>
<span class="line"><span>    doLast {</span></span>
<span class="line"><span>        println &#39;Task B&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>tasks.register(&#39;taskC&#39;) {</span></span>
<span class="line"><span>    dependsOn taskA, taskB</span></span>
<span class="line"><span>    doLast {</span></span>
<span class="line"><span>        println &#39;Task C (after A and B)&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 或者</span></span>
<span class="line"><span>taskC.dependsOn taskA, taskB</span></span></code></pre></div><h3 id="_5-3-自定义插件" tabindex="-1">5.3 自定义插件 <a class="header-anchor" href="#_5-3-自定义插件" aria-label="Permalink to &quot;5.3 自定义插件&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// buildSrc/src/main/kotlin/VersionPlugin.kt</span></span>
<span class="line"><span>class VersionPlugin : Plugin&lt;Project&gt; {</span></span>
<span class="line"><span>    override fun apply(project: Project) {</span></span>
<span class="line"><span>        project.extensions.create(&quot;versionConfig&quot;, VersionConfig::class.java)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        project.afterEvaluate {</span></span>
<span class="line"><span>            val config = project.versionConfig as VersionConfig</span></span>
<span class="line"><span>            println &quot;Version: \${config.major}.\${config.minor}.\${config.patch}&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class VersionConfig {</span></span>
<span class="line"><span>    var major: String = &quot;1&quot;</span></span>
<span class="line"><span>    var minor: String = &quot;0&quot;</span></span>
<span class="line"><span>    var patch: String = &quot;0&quot;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用插件</span></span>
<span class="line"><span>// build.gradle</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id &#39;version-plugin&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>versionConfig {</span></span>
<span class="line"><span>    major = &quot;2&quot;</span></span>
<span class="line"><span>    minor = &quot;0&quot;</span></span>
<span class="line"><span>    patch = &quot;0&quot;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_5-4-apk-输出配置" tabindex="-1">5.4 APK 输出配置 <a class="header-anchor" href="#_5-4-apk-输出配置" aria-label="Permalink to &quot;5.4 APK 输出配置&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>android {</span></span>
<span class="line"><span>    applicationVariants.all { variant -&gt;</span></span>
<span class="line"><span>        variant.outputs.all { output -&gt;</span></span>
<span class="line"><span>            def versionName = variant.versionName</span></span>
<span class="line"><span>            def buildType = variant.buildType.name</span></span>
<span class="line"><span>            def flavor = variant.productFlavors[0].name</span></span>
<span class="line"><span>            </span></span>
<span class="line"><span>            outputFileName = &quot;app-\${flavor}-\${buildType}-v\${versionName}.apk&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 输出示例：</span></span>
<span class="line"><span>// app-free-release-v1.0.0.apk</span></span>
<span class="line"><span>// app-paid-debug-v1.0.0.apk</span></span></code></pre></div><hr><h2 id="_6-性能优化" tabindex="-1">6. 性能优化 <a class="header-anchor" href="#_6-性能优化" aria-label="Permalink to &quot;6. 性能优化&quot;">​</a></h2><h3 id="_6-1-启用构建缓存" tabindex="-1">6.1 启用构建缓存 <a class="header-anchor" href="#_6-1-启用构建缓存" aria-label="Permalink to &quot;6.1 启用构建缓存&quot;">​</a></h3><div class="language-properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># gradle.properties</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.caching</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.parallel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.configureondemand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.daemon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.jvmargs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=-Xmx2048m -</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Dfile.encoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=UTF-8</span></span></code></pre></div><h3 id="_6-2-分析构建性能" tabindex="-1">6.2 分析构建性能 <a class="header-anchor" href="#_6-2-分析构建性能" aria-label="Permalink to &quot;6.2 分析构建性能&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 生成构建报告</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --scan</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 分析任务执行时间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --profile</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看任务执行时间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tasks</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --all</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --timing</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看依赖树</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app:dependencies</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 清理构建缓存</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cleanBuildCache</span></span></code></pre></div><h3 id="_6-3-优化依赖" tabindex="-1">6.3 优化依赖 <a class="header-anchor" href="#_6-3-优化依赖" aria-label="Permalink to &quot;6.3 优化依赖&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 避免重复依赖</span></span>
<span class="line"><span>// 使用 dependencyAnalysis 插件检测</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 使用 implementation 代替 api</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    // ❌ 不推荐：暴露给下游模块</span></span>
<span class="line"><span>    api &#39;androidx.core:core-ktx:1.12.0&#39;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // ✅ 推荐：仅内部使用</span></span>
<span class="line"><span>    implementation &#39;androidx.core:core-ktx:1.12.0&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 延迟注解处理</span></span>
<span class="line"><span>kapt {</span></span>
<span class="line"><span>    correctErrorTypes = true</span></span>
<span class="line"><span>    useBuildCache = true</span></span>
<span class="line"><span>    arguments {</span></span>
<span class="line"><span>        arg(&#39;dagger.fastInit&#39;, &#39;enabled&#39;)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_6-4-模块化优化" tabindex="-1">6.4 模块化优化 <a class="header-anchor" href="#_6-4-模块化优化" aria-label="Permalink to &quot;6.4 模块化优化&quot;">​</a></h3><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// settings.gradle</span></span>
<span class="line"><span>enableFeaturePreview(&#39;TYPESAFE_PROJECT_ACCESSORS&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用项目访问器</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    // 推荐：类型安全</span></span>
<span class="line"><span>    implementation(projects.core.network)</span></span>
<span class="line"><span>    implementation(projects.core.database)</span></span>
<span class="line"><span>    implementation(projects.feature.login)</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 不推荐：字符串</span></span>
<span class="line"><span>    implementation project(&#39;:core:network&#39;)</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_6-5-配置缓存" tabindex="-1">6.5 配置缓存 <a class="header-anchor" href="#_6-5-配置缓存" aria-label="Permalink to &quot;6.5 配置缓存&quot;">​</a></h3><div class="language-properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># gradle.properties</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.configuration-cache</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">org.gradle.configuration-cache.problems</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=warn</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 使用配置缓存</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --configuration-cache</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看缓存信息</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --configuration-cache</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --info</span></span></code></pre></div><hr><h2 id="_7-面试考点" tabindex="-1">7. 面试考点 <a class="header-anchor" href="#_7-面试考点" aria-label="Permalink to &quot;7. 面试考点&quot;">​</a></h2><h3 id="_7-1-基础概念" tabindex="-1">7.1 基础概念 <a class="header-anchor" href="#_7-1-基础概念" aria-label="Permalink to &quot;7.1 基础概念&quot;">​</a></h3><p><strong>Q1: Gradle 的构建生命周期？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>1. Initialization - 初始化阶段</span></span>
<span class="line"><span>   - 创建 Project 对象</span></span>
<span class="line"><span>   - 确定哪些项目参与构建</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. Configuration - 配置阶段</span></span>
<span class="line"><span>   - 执行 build.gradle</span></span>
<span class="line"><span>   - 创建任务图</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. Execution - 执行阶段</span></span>
<span class="line"><span>   - 执行任务</span></span>
<span class="line"><span>   - 按依赖顺序</span></span></code></pre></div><p><strong>Q2: implementation 和 api 的区别？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>- implementation: 依赖不暴露给下游模块</span></span>
<span class="line"><span>- api: 依赖暴露给下游模块（传递依赖）</span></span>
<span class="line"><span>- 建议：优先使用 implementation，减少编译时间</span></span></code></pre></div><h3 id="_7-2-实战问题" tabindex="-1">7.2 实战问题 <a class="header-anchor" href="#_7-2-实战问题" aria-label="Permalink to &quot;7.2 实战问题&quot;">​</a></h3><p><strong>Q3: 如何解决依赖冲突？</strong></p><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 查看依赖树</span></span>
<span class="line"><span>./gradlew app:dependencies</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 排除冲突依赖</span></span>
<span class="line"><span>implementation(&#39;com.example:lib:1.0&#39;) {</span></span>
<span class="line"><span>    exclude group: &#39;com.google.guava&#39;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 强制版本</span></span>
<span class="line"><span>configurations.all {</span></span>
<span class="line"><span>    resolutionStrategy {</span></span>
<span class="line"><span>        force &#39;com.google.guava:guava:32.0.0&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>Q4: 如何优化构建速度？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>1. 启用构建缓存 (org.gradle.caching=true)</span></span>
<span class="line"><span>2. 启用并行构建 (org.gradle.parallel=true)</span></span>
<span class="line"><span>3. 启用配置缓存</span></span>
<span class="line"><span>4. 增加 JVM 内存 (-Xmx2048m)</span></span>
<span class="line"><span>5. 使用模块化</span></span>
<span class="line"><span>6. 避免不必要的任务</span></span>
<span class="line"><span>7. 使用 Gradle Daemon</span></span></code></pre></div><h3 id="_7-3-高级问题" tabindex="-1">7.3 高级问题 <a class="header-anchor" href="#_7-3-高级问题" aria-label="Permalink to &quot;7.3 高级问题&quot;">​</a></h3><p><strong>Q5: 什么是 Build Variant？</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>答案要点：</span></span>
<span class="line"><span>- Build Type + Product Flavor 的组合</span></span>
<span class="line"><span>- Build Type: debug/release/staging</span></span>
<span class="line"><span>- Product Flavor: free/paid, dev/prod</span></span>
<span class="line"><span>- 每个变体有独立的配置和代码</span></span></code></pre></div><p><strong>Q6: 如何自定义 Gradle 插件？</strong></p><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 创建插件类</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyPlugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Plugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Project</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> apply</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(project: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Project</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 插件逻辑</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 注册插件</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// resources/META-INF/gradle-plugins/my-plugin.properties</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">implementation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">class</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">com.example.MyPlugin</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 使用插件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    id </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;my-plugin&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li><a href="https://docs.gradle.org/" target="_blank" rel="noreferrer">Gradle 官方文档</a></li><li><a href="https://developer.android.com/studio/build" target="_blank" rel="noreferrer">Android Gradle Plugin</a></li><li><a href="https://docs.gradle.org/current/userguide/performance.html" target="_blank" rel="noreferrer">Gradle 性能优化</a></li></ul><hr><p><em>本文完，感谢阅读！</em></p>`,86)])])}const u=a(i,[["render",l]]);export{g as __pageData,u as default};
