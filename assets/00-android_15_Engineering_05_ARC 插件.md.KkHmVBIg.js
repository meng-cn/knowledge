import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const c=JSON.parse('{"title":"ARC 插件与架构","description":"","frontmatter":{},"headers":[],"relativePath":"00-android/15_Engineering/05_ARC 插件.md","filePath":"00-android/15_Engineering/05_ARC 插件.md"}'),l={name:"00-android/15_Engineering/05_ARC 插件.md"};function e(t,s,r,h,o,d){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="arc-插件与架构" tabindex="-1">ARC 插件与架构 <a class="header-anchor" href="#arc-插件与架构" aria-label="Permalink to &quot;ARC 插件与架构&quot;">​</a></h1><blockquote><p><strong>字数统计：约 6000 字</strong><br><strong>难度等级：⭐⭐⭐</strong><br><strong>面试重要度：⭐⭐</strong></p></blockquote><hr><h2 id="_1-简介" tabindex="-1">1. 简介 <a class="header-anchor" href="#_1-简介" aria-label="Permalink to &quot;1. 简介&quot;">​</a></h2><p>ARC (Android Runtime Compiler) 插件用于优化编译：</p><ul><li>增量编译</li><li>代码生成</li><li>注解处理</li></ul><hr><h2 id="_2-常见插件" tabindex="-1">2. 常见插件 <a class="header-anchor" href="#_2-常见插件" aria-label="Permalink to &quot;2. 常见插件&quot;">​</a></h2><div class="language-gradle vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gradle</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Kapt - Kotlin 注解处理</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id(&quot;kotlin-kapt&quot;)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// KSP - Kotlin Symbol Processing</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id(&quot;com.google.devtools.ksp&quot;)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Hilt</span></span>
<span class="line"><span>plugins {</span></span>
<span class="line"><span>    id(&quot;com.google.dagger.hilt.android&quot;)</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="_3-性能优化" tabindex="-1">3. 性能优化 <a class="header-anchor" href="#_3-性能优化" aria-label="Permalink to &quot;3. 性能优化&quot;">​</a></h2><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Kapt 优化</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">kapt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    correctErrorTypes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    useBuildCache </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    arguments</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        arg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;dagger.fastInit&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;enabled&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><p><em>本文完</em></p>`,14)])])}const g=a(l,[["render",e]]);export{c as __pageData,g as default};
