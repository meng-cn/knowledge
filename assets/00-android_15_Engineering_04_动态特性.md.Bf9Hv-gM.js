import{_ as a,o as n,c as i,ae as l}from"./chunks/framework.DYQ7e_kq.js";const c=JSON.parse('{"title":"动态特性模块","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/15_Engineering/04_动态特性.md","filePath":"00-android/15_Engineering/04_动态特性.md"}'),e={name:"00-android/15_Engineering/04_动态特性.md"};function p(t,s,h,r,o,d){return n(),i("div",null,[...s[0]||(s[0]=[l(`<h1 id="动态特性模块" tabindex="-1">动态特性模块 <a class="header-anchor" href="#动态特性模块" aria-label="Permalink to &quot;动态特性模块&quot;">​</a></h1><blockquote><p><strong>字数统计：约 7000 字</strong><br><strong>难度等级：⭐⭐⭐⭐</strong><br><strong>面试重要度：⭐⭐⭐</strong></p></blockquote><hr><h2 id="_1-简介" tabindex="-1">1. 简介 <a class="header-anchor" href="#_1-简介" aria-label="Permalink to &quot;1. 简介&quot;">​</a></h2><p>动态特性模块 (Dynamic Feature Module) 允许按需下载功能：</p><ul><li>减少初始 APK 大小</li><li>按需交付功能</li><li>支持即时体验</li></ul><hr><h2 id="_2-配置" tabindex="-1">2. 配置 <a class="header-anchor" href="#_2-配置" aria-label="Permalink to &quot;2. 配置&quot;">​</a></h2><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// settings.gradle.kts</span></span>
<span class="line"><span>include(&quot;:app&quot;)</span></span>
<span class="line"><span>include(&quot;:feature:login&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// app/build.gradle.kts</span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation(project(&quot;:feature:login&quot;))</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// feature/login/build.gradle.kts</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id(&quot;com.android.dynamic-feature&quot;)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>android {</span></span>
<span class="line"><span>    namespace = &quot;com.example.feature.login&quot;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dependencies {</span></span>
<span class="line"><span>    implementation(project(&quot;:app&quot;))</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_3-下载管理" tabindex="-1">3. 下载管理 <a class="header-anchor" href="#_3-下载管理" aria-label="Permalink to &quot;3. 下载管理&quot;">​</a></h2><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FeatureManager</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> installFeature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(feature: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> installRequest </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> InstallRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Builder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        SplitInstallManagerFactory.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startInstall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(installRequest)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_4-面试考点" tabindex="-1">4. 面试考点 <a class="header-anchor" href="#_4-面试考点" aria-label="Permalink to &quot;4. 面试考点&quot;">​</a></h2><p><strong>Q: 动态模块的好处？</strong></p><ul><li>减少初始下载大小</li><li>按需加载功能</li><li>支持即时体验</li></ul><hr><p><em>本文完</em></p>`,18)])])}const g=a(e,[["render",p]]);export{c as __pageData,g as default};
