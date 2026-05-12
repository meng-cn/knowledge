# LangChain 全解析

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 1 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 基础概念

---

## 1. 概述

**LangChain** 是最流行的 Agent 开发框架（200K+ GitHub Stars）。它提供一套完整的 Agent 组件：链（Chain）、代理（Agent）、记忆（Memory）、工具（Tool）和输出解析器。

---

## 2. 核心组件

| 组件 | 功能 |
|--|- |
| **LLMs** | 模型接口统一 |
| **Prompts** | 提示管理/模板化 |
| **Chains** | 多步骤串联 |
| **Agents** | 工具调用决策 |
| **Memory** | 对话历史管理 |
| **Tools** | 外部功能注册 |
| **Indexes** | 文档检索索引 |

---

## 3. Agent 类型

| 类型 | 特点 | 来源 |
|--|-|--|- |
| **ReAct Agent** | 推理+行动交替 | [LangChain Docs](https://python.langchain.com/docs/modules/agents/) |
| **OpenAI Functions Agent** | 基于 Function Calling | [LangChain Docs](https://python.langchain.com/docs/modules/agents/) |
| **Conversational Agent** | 对话式 + 工具 | [LangChain Docs](https://python.langchain.com/docs/modules/agents/) |

---

## 4. 参考资料

- [LangChain 官方文档](https://python.langchain.com/)
- [LangChain Hub](https://smith.langchain.com/hub)
- [Comparing 5 AI Agent Frameworks](https://nicklaunches.com/blog/ai-agent-frameworks-comparison-2025/)
