# ReAct 模式

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 1 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 基础

---

## 1. 概述

**ReAct（Reasoning + Acting）**是 AI Agent 最经典的工作流模式，由 Yao et al. (2022) 在论文《ReAct: Synergizing Reasoning and Acting in Language Models》中首次提出。

核心思想：**让 LLM 交替进行「推理」和「行动」**。

---

## 2. 核心概念

ReAct 输出包含三个交替元素：

| 元素 | 说明 | 示例 |
|--|-|--|
| **Thought** | LLM 的推理过程 | "我需要先查天气" |
| **Action** | 调用的工具 | "search: 北京天气" |
| **Observation** | 工具返回的结果 | "北京: 25°C 晴" |

```
Thought: 我需要查询北京的天气
Action: search(query="北京天气")
Observation: 北京: 25°C 晴
Thought: 天气信息已获取
Action: finish(answer="北京明天晴，25°C")
```

### ReAct vs 传统 Chain of Thought

```
传统 CoT:   推理 → 推理 → 推理 → 回答（纯文字）
ReAct:      推理 → 行动 → 观察 → 推理 → 行动 → 回答（交替）
```

---

## 3. 参考资料

- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
- [LangChain ReAct 文档](https://python.langchain.com/docs/modules/agents/agent_types/react/)
- [ReAct 架构深度解析](https://jishuzhan.net/article/2053319676944515073)
- [ReAct、Plan-and-Execute、Reflection、Multi-Agent 工程范式](https://gitcode.csdn.net/69c1ee540a2f6a37c599e1e8.html)
