# Agentic Coding 全景

> **在知识图谱中的位置**：模块七 · 07_前沿趋势 · 第 1 节
> **难度**：⭐⭐⭐

---

## 1. 概述

**Agentic Coding** 是 AI 编程的下一个范式——AI Agent 不再只是"补全代码"，而是自主执行完整的开发任务：从理解需求、规划架构、编写代码、调试、测试到部署。

---

## 2. Agentic Coding vs 传统 AI 编程

```
传统 AI 编程:
  用户 → 补全建议/Chat → 用户审查 → 用户执行

Agentic Coding:
  用户 → 描述任务 → Agent 自主执行（规划+编码+调试+测试） → 用户审查
```

| 维度 | 传统 AI 编程 | Agentic Coding |
|--|-|--|
| **自主性** | 被动响应 | 自主执行完整流程 |
| **上下文** | 当前文件 | 整个代码库 |
| **执行** | 用户手动 | Agent 自动执行 |
| **复杂度** | 单任务 | 多步骤协作 |
| **工具** | IDE 内置 | 终端、浏览器、版本控制 |

---

## 3. 核心 Agent 能力

### 3.1 需求理解

Agent 理解自然语言描述的需求，拆解为可执行任务。

### 3.2 架构规划

Agent 设计代码架构、API 设计、数据库 Schema。

### 3.3 代码生成

Agent 生成完整代码（多文件、跨模块）。

### 3.4 调试

Agent 诊断 Bug、运行测试、自动修复。

### 3.5 测试

Agent 生成测试用例、运行测试、确保覆盖率。

### 3.6 部署

Agent 配置环境、构建、部署到目标平台。

---

## 4. Agentic Coding 的代表工具

| 工具 | 类型 | 核心能力 |
|--|-|-|
| **Cursor Composer** | IDE | 跨文件生成 + 执行 |
| **Claude Code** | CLI Agent | 终端对话式开发 |
| **OpenAI Codex CLI** | CLI Agent | 自主编码 Agent |
| **Devin** | AI Agent | 全自主开发 |
| **GitHub Copilot Agent** | IDE | Explore/Task/Plan/Review |

---

## 5. 参考资料

- [2026 Agentic Coding 全景图 (腾讯云)](https://cloud.tencent.com.cn/developer/article/2658138)
- [How to build reliable AI workflows with agentic primitives and context engineering (GitHub Blog)](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/)
- [Coding Agent Development Workflows (nick-tune.me)](https://nick-tune.me/blog/2026-01-07-coding-agent-development-workflows/)
- [The Complete Guide to Prompting AI Coding Agents (2026) (sureprompts.com)](https://sureprompts.com/blog/the-complete-guide-to-prompting-ai-coding-agents-2026)
