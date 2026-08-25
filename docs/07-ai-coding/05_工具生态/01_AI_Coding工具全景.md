# AI Coding 工具全景

> **在知识图谱中的位置**：模块五 · 05_工具生态 · 第 1 节
> **难度**：⭐⭐⭐

---

## 1. 工具分类

### 分类一：AI-Native IDE

| 工具 | 提供商 | 核心特色 | 定价 |
|--|-|--|-|
| **Cursor** | Cursor (Svix) | AI-First IDE，Composer 模式 | $20/月 (Pro) |
| **Windsurf** | OpenAI (收购 Codeium) | 深度上下文感知 | 免费+付费 |

### 分类二：CLI Agent

| 工具 | 提供商 | 核心特色 | 定价 |
|--|-|--|-|
| **Claude Code** | Anthropic | Claude 驱动的 CLI Agent | API 费用 |
| **OpenAI Codex** | OpenAI | Codex 模型 CLI Agent | API 费用 |
| **Devin** | Cognition Labs | 自主 AI 软件工程师 | 企业定价 |

### 分类三：IDE 插件

| 工具 | 提供商 | 核心特色 | 定价 |
|--|-|--|-|
| **GitHub Copilot** | GitHub + OpenAI | 代码补全 + Chat | $10/月 (个人) |
| **Sourcegraph Cody** | Sourcegraph | 代码库级理解 | 免费+企业版 |
| **Continue** | 开源社区 | 开源 AI 编程 | 免费 |

---

## 2. 2026 年主流工具对比

### Cursor vs Copilot vs Claude Code

| 维度 | Cursor | Copilot | Claude Code |
|--|-|-|--|
| **类型** | AI-Native IDE | IDE 插件 | CLI Agent |
| **核心模型** | Claude + GPT-4 | GPT-4o | Claude |
| **交互模式** | 对话 + Composer | 补全 + Chat | 对话 + 执行 |
| **代码库理解** | ✅ 深度索引 | ⚠️ 基础 | ✅ 深度 |
| **多文件编辑** | ✅ Composer | ❌ | ✅ |
| **终端集成** | ✅ | ⚠️ 基础 | ✅ |
| **价格** | $20/月 (Pro) | $10/月 (个人) | API 费用 |
| **适用场景** | 完整开发 | 代码补全 | CLI 开发 |

### 完整对比

| 工具 | 类型 | 核心模型 | 定价 | 来源 |
|--|-|--|-|--|
| **Cursor** | AI IDE | Claude + GPT-4 | $20/月 | [Scrimba](https://scrimba.com/articles/best-ai-coding-assistants-2026/) |
| **Windsurf** | AI IDE | Claude + GPT | 免费+付费 | [pandev-metrics](https://pandev-metrics.com/docs/blog/cursor-vs-windsurf-vs-cody) |
| **Claude Code** | CLI Agent | Claude | API | [dev.to](https://dev.to/dextralabs/claude-code-vs-cursor-vs-windsurf-i-used-all-three-for-2-weeks-heres-my-honest-take-nk8) |
| **GitHub Copilot** | IDE 插件 | GPT-4o | $10/月 | [scrimba.com](https://scrimba.com/articles/best-ai-coding-assistants-2026/) |
| **Sourcegraph Cody** | IDE 插件 | 多模型 | 免费+企业 | [aristoaistack](https://aristoaistack.com/posts/github-copilot-vs-cursor-vs-cody-which-ai-coding-assistant/) |
| **OpenAI Codex** | CLI Agent | Codex | API | [pandev-metrics](https://pandev-metrics.com/docs/blog/cursor-vs-windsurf-vs-cody) |
| **Continue** | IDE 插件 | 多模型 | 免费 | [腾讯云](https://cloud.tencent.com/developer/article/2622151) |
| **Devin** | AI Agent | 自有模型 | 企业 | [scrimba.com](https://scrimba.com/articles/best-ai-coding-assistants-2026/) |

---

## 3. 选型建议

| 场景 | 推荐工具 | 理由 |
|--|-|-|
| 完整 IDE 体验 | Cursor | Composer 模式最强 |
| 代码补全 | GitHub Copilot | 补全效果最好 |
| CLI 开发 | Claude Code | 对话式 CLI 最强 |
| 代码库级理解 | Sourcegraph Cody | 索引整个代码库 |
| 预算有限 | Continue | 开源免费 |
| 企业团队 | Copilot Enterprise | 企业级管理 |

---

## 4. 参考资料

- [Best AI Coding Assistants 2026 (scrimba.com)](https://scrimba.com/articles/best-ai-coding-assistants-2026/)
- [Cursor vs Windsurf vs Cody (pandev-metrics.com)](https://pandev-metrics.com/docs/blog/cursor-vs-windsurf-vs-cody)
- [AI Coding Agents 2026 (aristoaistack.com)](https://aristoaistack.com/posts/ai-coding-agents-cursor-windsurf-claude-code-codex-2026/)
- [7 Best AI Coding Tools Ranked (ybuild.ai)](https://ybuild.ai/en/blog/best-ai-coding-tools-ranked-2026)
- [Best AI Coding Assistants (aitoolsdigest.com)](https://www.aitoolsdigest.com/blog/best-ai-coding-assistants-2026)
- [Claude Code vs Cursor vs Windsurf (dev.to)](https://dev.to/dextralabs/claude-code-vs-cursor-vs-windsurf-i-used-all-three-for-2-weeks-heres-my-honest-take-nk8)
- [I Tested 7 AI Coding Assistants (mynestup.com)](https://mynestup.com/i-tested-7-ai-coding-assistants-for-30-days-heres-the-winner/)
- [2026年10款最佳GitHub Copilot替代方案 (weavai.app)](https://weavai.app/blog/zh-cn/2026/04/25/2026%e5%b9%b410%e6%ac%be%e6%9c%80%e4%bdb%b3github-copilot%e6%9b%bf%e4%bb%a3%e6%96%b9%e6%a1%88%e8%af%84%e6%b5%8b/)
