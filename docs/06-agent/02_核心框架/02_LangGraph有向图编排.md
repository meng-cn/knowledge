# LangGraph 有向图编排

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 2 节
> **难度**：⭐⭐⭐ | **前置知识**：LangChain 基础

---

## 1. 概述

**LangGraph** 是 LangChain 团队推出的有向图编排框架，用于构建**有状态、可循环**的 Agent 工作流。

核心差异：LangChain 的 Chain 是**无状态链式**（线性执行），LangGraph 是**有状态图式**（可循环、可分支）。[来源: Guangjuke - AI Agent开发框架终极决策树](https://edu.guangjuke.com/haowen/360.html)

---

## 2. 核心概念

### 三大核心概念

| 概念 | 说明 | 类比 |
|--|-|--|- |
| **Node** | 图中的节点，执行具体逻辑 | 函数/步骤 |
| **Edge** | 节点之间的连线，定义流向 | 路由/分支 |
| **State** | 跨节点共享的状态数据 | 内存/上下文 |

### 适用场景

- Agent 需要**循环决策**（执行→评估→修正→再执行）
- 工作流有**分支和合并**
- 需要**持久化状态**（跨步骤保存进度）
- Agent 需要**中断和恢复**

---

## 3. 参考资料

- [LangGraph 官方文档](https://langchain-ai.github.io/langgraph/)
- [LangGraph 博客](https://blog.langchain.dev/langgraph/)
- [Comparing 5 AI Agent Frameworks](https://nicklaunches.com/blog/ai-agent-frameworks-comparison-2025/)
