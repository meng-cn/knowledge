import{_ as s,o as n,c as e,a0 as p}from"./chunks/framework.D7EjqxMK.js";const u=JSON.parse('{"title":"提示工程最佳实践","description":"","frontmatter":{},"headers":[],"relativePath":"07-ai-coding/06_工程实践/02_提示工程最佳实践.md","filePath":"07-ai-coding/06_工程实践/02_提示工程最佳实践.md"}'),t={name:"07-ai-coding/06_工程实践/02_提示工程最佳实践.md"};function i(l,a,o,r,c,d){return n(),e("div",null,[...a[0]||(a[0]=[p(`<h1 id="提示工程最佳实践" tabindex="-1">提示工程最佳实践 <a class="header-anchor" href="#提示工程最佳实践" aria-label="Permalink to &quot;提示工程最佳实践&quot;">​</a></h1><blockquote><p><strong>在知识图谱中的位置</strong>：模块六 · 06_工程实践 · 第 2 节 <strong>难度</strong>：⭐⭐⭐</p></blockquote><hr><h2 id="_1-ai-编程提示工程核心原则" tabindex="-1">1. AI 编程提示工程核心原则 <a class="header-anchor" href="#_1-ai-编程提示工程核心原则" aria-label="Permalink to &quot;1. AI 编程提示工程核心原则&quot;">​</a></h2><h3 id="原则一-提供上下文" tabindex="-1">原则一：提供上下文 <a class="header-anchor" href="#原则一-提供上下文" aria-label="Permalink to &quot;原则一：提供上下文&quot;">​</a></h3><p>给 AI 足够的代码上下文：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>❌ &quot;修复这个 Bug&quot;</span></span>
<span class="line"><span>✅ &quot;在 src/api/auth/login.ts 第 25 行，当密码验证失败时，返回 401 而不是 500。</span></span>
<span class="line"><span>    当前代码：...（粘贴代码）&quot;</span></span></code></pre></div><h3 id="原则二-明确约束" tabindex="-1">原则二：明确约束 <a class="header-anchor" href="#原则二-明确约束" aria-label="Permalink to &quot;原则二：明确约束&quot;">​</a></h3><p>指定技术栈、框架、编码规范：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;用 React + TypeScript 重写这个组件。</span></span>
<span class="line"><span>遵循 Airbnb JavaScript Style Guide。</span></span>
<span class="line"><span>使用 functional components + hooks。&quot;</span></span></code></pre></div><h3 id="原则三-分步请求" tabindex="-1">原则三：分步请求 <a class="header-anchor" href="#原则三-分步请求" aria-label="Permalink to &quot;原则三：分步请求&quot;">​</a></h3><p>大任务拆成小步骤：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Step 1: &quot;Create a basic todo list component&quot;</span></span>
<span class="line"><span>Step 2: &quot;Add edit functionality with a modal dialog&quot;</span></span>
<span class="line"><span>Step 3: &quot;Add filtering by status&quot;</span></span></code></pre></div><h3 id="原则四-指定输出格式" tabindex="-1">原则四：指定输出格式 <a class="header-anchor" href="#原则四-指定输出格式" aria-label="Permalink to &quot;原则四：指定输出格式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;以 JSON 格式返回 API 设计</span></span>
<span class="line"><span>以 SQL 格式返回数据库 Schema</span></span>
<span class="line"><span>以 Markdown 格式返回 PRD&quot;</span></span></code></pre></div><hr><h2 id="_2-常用-prompt-模板" tabindex="-1">2. 常用 Prompt 模板 <a class="header-anchor" href="#_2-常用-prompt-模板" aria-label="Permalink to &quot;2. 常用 Prompt 模板&quot;">​</a></h2><h3 id="代码生成-prompt" tabindex="-1">代码生成 Prompt <a class="header-anchor" href="#代码生成-prompt" aria-label="Permalink to &quot;代码生成 Prompt&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>你是一位 senior [语言] 开发者。请根据以下 PRD 生成完整代码：</span></span>
<span class="line"><span></span></span>
<span class="line"><span># PRD</span></span>
<span class="line"><span>[粘贴 PRD]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>要求：</span></span>
<span class="line"><span>1. 使用 [技术栈]</span></span>
<span class="line"><span>2. 遵循 [编码规范]</span></span>
<span class="line"><span>3. 包含错误处理</span></span>
<span class="line"><span>4. 添加 JSDoc/文档字符串</span></span></code></pre></div><h3 id="代码审查-prompt" tabindex="-1">代码审查 Prompt <a class="header-anchor" href="#代码审查-prompt" aria-label="Permalink to &quot;代码审查 Prompt&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>请审查以下代码，重点关注：</span></span>
<span class="line"><span>1. 安全漏洞</span></span>
<span class="line"><span>2. 性能问题</span></span>
<span class="line"><span>3. 代码风格</span></span>
<span class="line"><span>4. 边界情况</span></span>
<span class="line"><span></span></span>
<span class="line"><span>代码：</span></span>
<span class="line"><span>[粘贴代码]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请用 Markdown 格式输出审查结果。</span></span></code></pre></div><h3 id="bug-修复-prompt" tabindex="-1">Bug 修复 Prompt <a class="header-anchor" href="#bug-修复-prompt" aria-label="Permalink to &quot;Bug 修复 Prompt&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>以下代码在 [场景] 时会崩溃：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>代码：</span></span>
<span class="line"><span>[粘贴代码]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>错误信息：</span></span>
<span class="line"><span>[粘贴错误信息]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请：</span></span>
<span class="line"><span>1. 分析 Bug 原因</span></span>
<span class="line"><span>2. 提供修复代码</span></span>
<span class="line"><span>3. 解释修复原理</span></span></code></pre></div><hr><h2 id="_3-参考资料" tabindex="-1">3. 参考资料 <a class="header-anchor" href="#_3-参考资料" aria-label="Permalink to &quot;3. 参考资料&quot;">​</a></h2><ul><li><a href="https://sureprompts.com/blog/the-complete-guide-to-prompting-ai-coding-agents-2026" target="_blank" rel="noreferrer">The Complete Guide to Prompting AI Coding Agents (2026) (sureprompts.com)</a></li><li><a href="https://sureprompts.com/blog/prompt-engineering-for-developers" target="_blank" rel="noreferrer">Prompt Engineering for Developers (sureprompts.com)</a></li><li><a href="https://claudefa.st/blog/guide/development/agentic-engineering-best-practices" target="_blank" rel="noreferrer">Claude Code Best Practices: 5 Agentic Engineering Techniques (claudefa.st)</a></li><li><a href="https://www.bradjolicoeur.com/article/ai-software-engineering-vibe-spec-prompting" target="_blank" rel="noreferrer">Master AI in Software Engineering: Vibe vs. Spec Coding (bradjolicoeur.com)</a></li></ul>`,26)])])}const g=s(t,[["render",i]]);export{u as __pageData,g as default};
