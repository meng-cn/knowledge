import{_ as a,o as n,c as i,a0 as e}from"./chunks/framework.D7EjqxMK.js";const k=JSON.parse('{"title":"混合模式：Vibe + Spec","description":"","frontmatter":{},"headers":[],"relativePath":"07-ai-coding/04_vibe_vs_spec/03_混合模式.md","filePath":"07-ai-coding/04_vibe_vs_spec/03_混合模式.md"}'),p={name:"07-ai-coding/04_vibe_vs_spec/03_混合模式.md"};function l(t,s,h,o,d,c){return n(),i("div",null,[...s[0]||(s[0]=[e(`<h1 id="混合模式-vibe-spec" tabindex="-1">混合模式：Vibe + Spec <a class="header-anchor" href="#混合模式-vibe-spec" aria-label="Permalink to &quot;混合模式：Vibe + Spec&quot;">​</a></h1><blockquote><p><strong>在知识图谱中的位置</strong>：模块四 · 04_vibe_vs_spec · 第 3 节 <strong>难度</strong>：⭐⭐</p></blockquote><hr><h2 id="_1-混合模式核心理念" tabindex="-1">1. 混合模式核心理念 <a class="header-anchor" href="#_1-混合模式核心理念" aria-label="Permalink to &quot;1. 混合模式核心理念&quot;">​</a></h2><p>Vibe Coding 和 Spec-Driven Development 不是非此即彼的对立关系，而是互补关系：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Vibe Coding (灵活) + Spec Coding (规范) = 最佳实践</span></span>
<span class="line"><span></span></span>
<span class="line"><span>探索阶段: Vibe → 快速试错、创意发散</span></span>
<span class="line"><span>落地阶段: Spec → 规范落地、质量保证</span></span></code></pre></div><hr><h2 id="_2-推荐工作流" tabindex="-1">2. 推荐工作流 <a class="header-anchor" href="#_2-推荐工作流" aria-label="Permalink to &quot;2. 推荐工作流&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌────────────────────────────────────────────┐</span></span>
<span class="line"><span>│   Vibe + Spec 混合工作流                    │</span></span>
<span class="line"><span>│                                            │</span></span>
<span class="line"><span>│  1. Vibe Coding 探索 (3-5 轮对话)         │</span></span>
<span class="line"><span>│     ↓ 确定最终方案                           │</span></span>
<span class="line"><span>│  2. 整理 PRD (Spec)                         │</span></span>
<span class="line"><span>│     ↓ PRD 包含技术栈/API/Schema              │</span></span>
<span class="line"><span>│  3. AI Agent 按 PRD 生成代码                 │</span></span>
<span class="line"><span>│     ↓ AI 生成代码                            │</span></span>
<span class="line"><span>│  4. 人工审查 + 测试                         │</span></span>
<span class="line"><span>│     ↓ 测试通过                               │</span></span>
<span class="line"><span>│  5. 提交 PR / 部署                           │</span></span>
<span class="line"><span>└────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_3-实践示例" tabindex="-1">3. 实践示例 <a class="header-anchor" href="#_3-实践示例" aria-label="Permalink to &quot;3. 实践示例&quot;">​</a></h2><h3 id="阶段一-vibe-探索" tabindex="-1">阶段一：Vibe 探索 <a class="header-anchor" href="#阶段一-vibe-探索" aria-label="Permalink to &quot;阶段一：Vibe 探索&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>开发者: &quot;I want a dashboard with auth, a database, and charts&quot;</span></span>
<span class="line"><span>AI: [生成一个基础版本]</span></span>
<span class="line"><span>开发者: &quot;Make it blue, add a sidebar&quot;</span></span>
<span class="line"><span>AI: [修改]</span></span>
<span class="line"><span>开发者: &quot;Add user management&quot;</span></span>
<span class="line"><span>AI: [添加]</span></span>
<span class="line"><span>...</span></span></code></pre></div><h3 id="阶段二-整理-prd" tabindex="-1">阶段二：整理 PRD <a class="header-anchor" href="#阶段二-整理-prd" aria-label="Permalink to &quot;阶段二：整理 PRD&quot;">​</a></h3><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;"># Dashboard App PRD</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 技术栈</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> React + TypeScript + Tailwind CSS</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PostgreSQL</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JWT Auth</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 功能</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">1.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 用户认证 (邮箱/密码 + OAuth)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">2.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 数据报表 (Chart.js)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">3.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 用户管理 (CRUD)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## API</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## Schema</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">...</span></span></code></pre></div><h3 id="阶段三-ai-按-prd-生成生产代码" tabindex="-1">阶段三：AI 按 PRD 生成生产代码 <a class="header-anchor" href="#阶段三-ai-按-prd-生成生产代码" aria-label="Permalink to &quot;阶段三：AI 按 PRD 生成生产代码&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>开发者: &quot;按照以下 PRD 生成完整代码 [粘贴 PRD]&quot;</span></span>
<span class="line"><span>AI: [按 PRD 生成完整代码 + 测试]</span></span></code></pre></div><hr><h2 id="_4-参考资料" tabindex="-1">4. 参考资料 <a class="header-anchor" href="#_4-参考资料" aria-label="Permalink to &quot;4. 参考资料&quot;">​</a></h2><ul><li><a href="https://tomkennes.com/blog/ai-assisted-coding-2/" target="_blank" rel="noreferrer">From Vibe Coding to Spec-Driven Development (tomkennes.com)</a></li><li><a href="https://www.augmentcode.com/guides/vibe-coding-vs-spec-driven-development" target="_blank" rel="noreferrer">Vibe Coding vs Spec-Driven Development (Augment Code)</a></li></ul>`,20)])])}const g=a(p,[["render",l]]);export{k as __pageData,g as default};
