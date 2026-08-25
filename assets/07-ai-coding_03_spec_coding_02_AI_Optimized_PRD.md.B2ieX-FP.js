import{_ as i,o as a,c as n,a0 as p}from"./chunks/framework.D7EjqxMK.js";const g=JSON.parse('{"title":"AI-Optimized PRD for AI Agents","description":"","frontmatter":{},"headers":[],"relativePath":"07-ai-coding/03_spec_coding/02_AI_Optimized_PRD.md","filePath":"07-ai-coding/03_spec_coding/02_AI_Optimized_PRD.md"}'),l={name:"07-ai-coding/03_spec_coding/02_AI_Optimized_PRD.md"};function t(h,s,e,k,d,r){return a(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="ai-optimized-prd-for-ai-agents" tabindex="-1">AI-Optimized PRD for AI Agents <a class="header-anchor" href="#ai-optimized-prd-for-ai-agents" aria-label="Permalink to &quot;AI-Optimized PRD for AI Agents&quot;">​</a></h1><blockquote><p><strong>在知识图谱中的位置</strong>：模块三 · 03_spec_coding · 第 2 节 <strong>难度</strong>：⭐⭐⭐</p></blockquote><hr><h2 id="_1-概述" tabindex="-1">1. 概述 <a class="header-anchor" href="#_1-概述" aria-label="Permalink to &quot;1. 概述&quot;">​</a></h2><p><strong>AI-Optimized PRD</strong> 是专为 AI Agent（Cursor、Claude Code 等）阅读优化的需求文档。在 2026 年，PRD 不仅要给人看，还要给 AI Agent 执行。<a href="https://thehuman2ai.com/product/guides/prd/ai-optimized" target="_blank" rel="noreferrer">来源: AI-Optimized PRD (thehuman2ai.com)</a></p><hr><h2 id="_2-ai-optimized-prd-模板" tabindex="-1">2. AI-Optimized PRD 模板 <a class="header-anchor" href="#_2-ai-optimized-prd-模板" aria-label="Permalink to &quot;2. AI-Optimized PRD 模板&quot;">​</a></h2><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;"># 项目名称</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 概述</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">一句话描述：这个项目/功能是什么。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 目标用户</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 用户 A</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 用户 B</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 技术栈</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 前端：React + TypeScript + Tailwind CSS</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 后端：Node.js + Express</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 数据库：PostgreSQL</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 部署：Docker + AWS</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 核心功能</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### 功能 1：用户认证</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 邮箱/密码登录</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OAuth (Google/GitHub)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> JWT Token 认证</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 密码重置</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### 功能 2：用户管理</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 创建/读取/更新/删除用户</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 用户角色 (admin/user)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 用户状态 (active/inactive)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### 功能 3：数据报表</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 按日期范围筛选</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 数据导出 (CSV/PDF)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 图表展示 (Chart.js)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## API 设计</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 方法 | 端点 | 描述 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|--|-|--|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| POST | /api/auth/login | 用户登录 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| POST | /api/auth/register | 用户注册 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| GET | /api/users | 获取用户列表 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| POST | /api/users | 创建用户 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| GET | /api/users/:id | 获取单个用户 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| PUT | /api/users/:id | 更新用户 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| DELETE | /api/users/:id | 删除用户 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 数据库 Schema</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`sql</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">CREATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> TABLE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> users</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SERIAL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> PRIMARY KEY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    email </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">255</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UNIQUE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    password_hash </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">255</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    role</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DEFAULT</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;user&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    status</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DEFAULT</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;active&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    created_at </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">TIMESTAMP</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> DEFAULT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> NOW</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    updated_at </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">TIMESTAMP</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> DEFAULT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> NOW</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h2 id="文件结构" tabindex="-1">文件结构 <a class="header-anchor" href="#文件结构" aria-label="Permalink to &quot;文件结构&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>src/</span></span>
<span class="line"><span>├── api/</span></span>
<span class="line"><span>│   ├── auth/</span></span>
<span class="line"><span>│   │   ├── login.ts</span></span>
<span class="line"><span>│   │   └── register.ts</span></span>
<span class="line"><span>│   └── users/</span></span>
<span class="line"><span>│       ├── list.ts</span></span>
<span class="line"><span>│       ├── create.ts</span></span>
<span class="line"><span>│       ├── get.ts</span></span>
<span class="line"><span>│       ├── update.ts</span></span>
<span class="line"><span>│       └── delete.ts</span></span>
<span class="line"><span>├── components/</span></span>
<span class="line"><span>├── lib/</span></span>
<span class="line"><span>│   └── db.ts</span></span>
<span class="line"><span>└── utils/</span></span>
<span class="line"><span>    └── validation.ts</span></span></code></pre></div><h2 id="开发顺序" tabindex="-1">开发顺序 <a class="header-anchor" href="#开发顺序" aria-label="Permalink to &quot;开发顺序&quot;">​</a></h2><ol><li>数据库 Schema</li><li>API 端点</li><li>前端页面</li><li>前端组件</li><li>联调测试</li></ol><h2 id="验收标准" tabindex="-1">验收标准 <a class="header-anchor" href="#验收标准" aria-label="Permalink to &quot;验收标准&quot;">​</a></h2><ul><li>[ ] 用户可注册/登录</li><li>[ ] JWT Token 验证正确</li><li>[ ] CRUD 操作全部完成</li><li>[ ] 角色权限控制</li><li>[ ] 数据验证和错误处理</li><li>[ ] 测试覆盖率 &gt; 80%</li></ul><h2 id="约束条件" tabindex="-1">约束条件 <a class="header-anchor" href="#约束条件" aria-label="Permalink to &quot;约束条件&quot;">​</a></h2><ul><li>不允许使用 MongoDB</li><li>必须使用 TypeScript strict mode</li><li>所有 API 端点必须有错误处理</li><li>不允许在客户端存储密码</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 3. AI-Optimized PRD 原则</span></span>
<span class="line"><span></span></span>
<span class="line"><span>| 原则 | 说明 |</span></span>
<span class="line"><span>|--|-|</span></span>
<span class="line"><span>| **结构化** | 用清晰的分节和列表 |</span></span>
<span class="line"><span>| **具体** | 不要写&quot;漂亮的 UI&quot;，写&quot;使用 Tailwind CSS，间距 4px&quot; |</span></span>
<span class="line"><span>| **有序** | 明确开发顺序 |</span></span>
<span class="line"><span>| **可验证** | 每条需求有可验证的标准 |</span></span>
<span class="line"><span>| **面向 Agent** | 写给 AI 读，格式清晰 |</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 4. 参考资料</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- [AI-Optimized PRD: a requirements document for AI agents (thehuman2ai.com)](https://thehuman2ai.com/product/guides/prd/ai-optimized)</span></span>
<span class="line"><span>- [Behavior-driven prompting: PRD to BDD to living spec (ralphloopsarecool.com)](https://ralphloopsarecool.com/blog/behavior-driven-prompting/)</span></span>
<span class="line"><span>- [Claude Code Best Practices (claudefa.st)](https://claudefa.st/blog/guide/development/agentic-engineering-best-practices)</span></span></code></pre></div>`,17)])])}const o=i(l,[["render",t]]);export{g as __pageData,o as default};
