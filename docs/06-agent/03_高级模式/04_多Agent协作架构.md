# 多Agent协作架构

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 4 节
> **难度**：⭐⭐⭐ | **前置知识**：单Agent基础

---

## 1. 概述

**多Agent协作（Multi-Agent Collaboration）**是将复杂任务拆给多个专业化 Agent 协同完成。每个 Agent 有独立角色、工具和能力。

核心理念：**分工 > 全能** — 让多个专门 Agent 比一个全能 Agent 更可靠。

---

## 2. 多Agent 的三种架构模式

| 模式 | 描述 | 适用场景 |
|--|-|--|- |
| **Sequential** | Agent A → Agent B → Agent C | 流水线任务 |
| **Hierarchical** | Manager Agent → Worker Agents | 项目管理 |
| **Swarm** | 多 Agent 并行 + 自主决策 | 分布式任务 |

---

## 3. MCP 在各框架中的支持

| 框架 | MCP 原生支持 | 集成难度 |
|--|-|--|- |
| **CrewAI** | ✅ 原生 | 低 | [CrewAI MCP](https://docs.crewai.org.cn/en/mcp/dsl-integration) |
| **AutoGen + Agent FW** | ✅ 原生 | 低 | [AutoGen+MCP](https://llmmultiagent.com/blogs/autogen_mcp_blog) |
| **OpenAI Agents SDK** | ✅ 原生 | 低 | OpenAI 官方 |
| **LangChain** | ✅ 通过扩展 | 中 | [ChatForest](https://chatforest.com/guides/mcp-ai-frameworks-langchain-langgraph-crewai/) |
| **自研** | ✅ 完全可控 | 高 | - |

---

## 4. 参考资料

- [Comparing 5 AI Agent Frameworks](https://nicklaunches.com/blog/ai-agent-frameworks-comparison-2025/)
- [AutoGen 与 MCP](https://llmmultiagent.com/blogs/autogen_mcp_blog)
- [CrewAI MCP 文档](https://docs.crewai.org.cn/en/mcp/dsl-integration)
- [MCP & 多框架集成 (Truto)](https://truto.one/blog/handling-auth-tool-sharing-in-multi-agent-frameworks-via-mcp/)
