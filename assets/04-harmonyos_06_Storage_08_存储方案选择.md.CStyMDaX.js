import{_ as a,o as s,c as n,ae as e}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"存储方案对比与选择","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/06_Storage/08_存储方案选择.md","filePath":"04-harmonyos/06_Storage/08_存储方案选择.md"}'),d={name:"04-harmonyos/06_Storage/08_存储方案选择.md"};function r(p,t,l,o,i,c){return s(),n("div",null,[...t[0]||(t[0]=[e(`<h1 id="存储方案对比与选择" tabindex="-1">存储方案对比与选择 <a class="header-anchor" href="#存储方案对比与选择" aria-label="Permalink to &quot;存储方案对比与选择&quot;">​</a></h1><blockquote><p>鸿蒙多种存储方案，面试高频：根据场景选择正确的存储方案。</p></blockquote><hr><h2 id="_1-存储方案全景" tabindex="-1">1. 存储方案全景 <a class="header-anchor" href="#_1-存储方案全景" aria-label="Permalink to &quot;1. 存储方案全景&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>鸿蒙存储体系</span></span>
<span class="line"><span>├── 键值存储</span></span>
<span class="line"><span>│   ├── Preferences（小配置）</span></span>
<span class="line"><span>│   └── KV-Store（分布式同步）</span></span>
<span class="line"><span>├── 关系型数据库</span></span>
<span class="line"><span>│   └── RDB（SQLite）</span></span>
<span class="line"><span>├── 文件存储</span></span>
<span class="line"><span>│   ├── 内部存储（沙箱）</span></span>
<span class="line"><span>│   ├── 外部存储（公共目录）</span></span>
<span class="line"><span>│   └── rawfile / resource</span></span>
<span class="line"><span>├── 安全存储</span></span>
<span class="line"><span>│   └── AssetStore（卸载保留）</span></span>
<span class="line"><span>└── 缓存</span></span>
<span class="line"><span>    ├── LruCache（内存）</span></span>
<span class="line"><span>    └── 多级缓存</span></span></code></pre></div><hr><h2 id="_2-决策树" tabindex="-1">2. 决策树 <a class="header-anchor" href="#_2-决策树" aria-label="Permalink to &quot;2. 决策树&quot;">​</a></h2><h3 id="_2-1-如何选择存储方案" tabindex="-1">2.1 如何选择存储方案 <a class="header-anchor" href="#_2-1-如何选择存储方案" aria-label="Permalink to &quot;2.1 如何选择存储方案&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>需要存储数据？</span></span>
<span class="line"><span>├─ 简单的键值配置？</span></span>
<span class="line"><span>│   └─ 单设备 → Preferences</span></span>
<span class="line"><span>│   └─ 多设备同步 → KV-Store</span></span>
<span class="line"><span>├─ 结构化数据？</span></span>
<span class="line"><span>│   └─ 关系型查询 → RDB</span></span>
<span class="line"><span>│   └─ 大量数据 → RDB（百万级）</span></span>
<span class="line"><span>├─ 大文件？</span></span>
<span class="line"><span>│   └─ 图片/视频 → 文件存储</span></span>
<span class="line"><span>│   └─ 大文件传输 → request 代理</span></span>
<span class="line"><span>├─ 敏感数据？</span></span>
<span class="line"><span>│   └─ 应用卸载后保留 → AssetStore</span></span>
<span class="line"><span>│   └─ 密钥管理 → KeyStore</span></span>
<span class="line"><span>├─ 缓存？</span></span>
<span class="line"><span>│   └─ 频繁访问 → LruCache（内存）</span></span>
<span class="line"><span>│   └─ 重启恢复 → KV-Store</span></span>
<span class="line"><span>└─ 其他</span></span>
<span class="line"><span>    └─ 图片缓存 → LruCache + 文件缓存</span></span></code></pre></div><h3 id="_2-2-场景速查表" tabindex="-1">2.2 场景速查表 <a class="header-anchor" href="#_2-2-场景速查表" aria-label="Permalink to &quot;2.2 场景速查表&quot;">​</a></h3><table tabindex="0"><thead><tr><th>场景</th><th>推荐方案</th><th>原因</th></tr></thead><tbody><tr><td>用户偏好设置</td><td>Preferences</td><td>简单 K-V</td></tr><tr><td>登录 Token</td><td>AssetStore</td><td>卸载保留</td></tr><tr><td>用户列表</td><td>RDB</td><td>结构化、查询</td></tr><tr><td>分布式配置</td><td>KV-Store</td><td>多设备同步</td></tr><tr><td>图片</td><td>文件存储</td><td>容量大</td></tr><tr><td>图片缓存</td><td>LruCache</td><td>内存快</td></tr><tr><td>密码</td><td>AES + KeyStore</td><td>安全</td></tr><tr><td>应用状态</td><td>KV-Store</td><td>持久化+同步</td></tr><tr><td>临时数据</td><td>内存缓存</td><td>快，不用持久化</td></tr></tbody></table><hr><h2 id="_3-详细对比表" tabindex="-1">3. 详细对比表 <a class="header-anchor" href="#_3-详细对比表" aria-label="Permalink to &quot;3. 详细对比表&quot;">​</a></h2><table tabindex="0"><thead><tr><th>方案</th><th>类型</th><th>容量</th><th>持久化</th><th>分布式</th><th>速度</th><th>加密</th></tr></thead><tbody><tr><td>Preferences</td><td>K-V</td><td>≤1MB</td><td>✅</td><td>❌</td><td>⚡⚡</td><td>❌</td></tr><tr><td>KV-Store</td><td>K-V</td><td>大</td><td>✅</td><td>✅</td><td>⚡⚡</td><td>❌</td></tr><tr><td>RDB</td><td>关系型</td><td>大</td><td>✅</td><td>❌</td><td>⚡</td><td>❌</td></tr><tr><td>文件存储</td><td>文件</td><td>大</td><td>✅</td><td>❌</td><td>⚡</td><td>❌</td></tr><tr><td>AssetStore</td><td>安全</td><td>小</td><td>✅卸载后</td><td>❌</td><td>⚡</td><td>✅</td></tr><tr><td>LruCache</td><td>内存</td><td>小</td><td>❌</td><td>❌</td><td>⚡⚡⚡</td><td>❌</td></tr></tbody></table><hr><h2 id="_4-面试高频考点" tabindex="-1">4. 面试高频考点 <a class="header-anchor" href="#_4-面试高频考点" aria-label="Permalink to &quot;4. 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙有哪些存储方案" tabindex="-1">Q1: 鸿蒙有哪些存储方案？ <a class="header-anchor" href="#q1-鸿蒙有哪些存储方案" aria-label="Permalink to &quot;Q1: 鸿蒙有哪些存储方案？&quot;">​</a></h3><p><strong>回答</strong>：Preferences（K-V配置）、KV-Store（分布式）、RDB（关系型数据库）、文件存储（沙箱/外部）、AssetStore（安全卸载保留）、缓存（LruCache）。</p><h3 id="q2-如何选择合适的存储方案" tabindex="-1">Q2: 如何选择合适的存储方案？ <a class="header-anchor" href="#q2-如何选择合适的存储方案" aria-label="Permalink to &quot;Q2: 如何选择合适的存储方案？&quot;">​</a></h3><p><strong>回答</strong>：根据场景选：简单配置用 Preferences，分布式同步用 KV-Store，结构化数据用 RDB，大文件用文件存储，敏感数据用 AssetStore，频繁访问用 LruCache 缓存。</p><h3 id="q3-preferences-vs-kv-store" tabindex="-1">Q3: Preferences vs KV-Store？ <a class="header-anchor" href="#q3-preferences-vs-kv-store" aria-label="Permalink to &quot;Q3: Preferences vs KV-Store？&quot;">​</a></h3><p><strong>回答</strong>：Preferences 单设备简单 K-V；KV-Store 支持分布式同步。</p><hr><blockquote><p>🐱 <strong>小猫提示</strong>：存储方案选择记住 <strong>&quot;场景→方案</strong>对应关系。Preferences 小配置、KV-Store 分布式、RDB 结构化、AssetStore 敏感、LruCache 缓存&quot;。**</p></blockquote>`,24)])])}const _=a(d,[["render",r]]);export{u as __pageData,_ as default};
