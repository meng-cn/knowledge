# OpenAI Agents SDK

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 4 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 基础概念

---

## 1. 概述

**OpenAI Agents SDK** 是 OpenAI 官方推出的轻量 Agent SDK，核心理念是**最小代码实现 Agent**。

---

## 2. 核心对象

| 对象 | 功能 |
|--|- |
| **Agent** | Agent 定义（名称+指令+工具） |
| **Handoff** | Agent 间交接 |
| **Guardrail** | 输入/输出安全护栏 |

---

## 3. 框架对比

| 方案 | 代码量 | 灵活性 | 适合场景 |
|--|-|--|- |
| OpenAI SDK | 极少 | 中 | 快速开发 |
| LangGraph | 多 | 高 | 复杂工作流 |
| LangChain | 多 | 高 | 链式编排 |
| 自研 | 最多 | 最高 | 企业定制 |

---

## 4. 参考资料

- [OpenAI Agents SDK GitHub](https://github.com/openai/openai-agents-python)
- [OpenAI Agents SDK 文档](https://openai.github.io/openai-agents-python/)
- [OpenAI Agents SDK vs LangGraph vs CrewAI 2026 Matrix](https://www.digitalapplied.com/blog/openai-agents-sdk-vs-langgraph-vs-crewai-matrix-2026)
- [LangChain vs CrewAI vs OpenAI Agents SDK 2026](https://apiscout.dev/blog/langchain-vs-crewai-vs-openai-agents-sdk-2026)
