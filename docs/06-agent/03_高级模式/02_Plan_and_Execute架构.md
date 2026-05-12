# Plan-and-Execute 架构

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 2 节
> **难度**：⭐⭐⭐ | **前置知识**：ReAct 模式

---

## 1. 概述

**Plan-and-Execute** 是区分「玩具级」与「生产级」Agent 的核心分水岭。[来源: 技术栈 - Planning Agent 架构深度解析](https://jishuzhan.net/article/2046065875397181442)

ReAct 适合短任务（每一步决策都是 LLM 实时生成），但长任务需要**先规划后执行**，避免在每一步都调用 LLM（成本高、容易出错）。

---

## 2. 两种架构对比

| 架构 | 说明 | 适用场景 |
|--|-|--|- |
| **ReAct** | 每步推理 + 每步执行 | 短任务、简单流程 |
| **Plan-and-Execute** | 先生成完整计划，再逐步执行 | 长任务、复杂流程 |
| **Plan→Commit** | LLM 规划 + 系统确定性执行 | 生产级 Agent |

---

## 3. 参考资料

- [Planning Agent 架构深度解析 (技术栈)](https://jishuzhan.net/article/2046065875397181442)
- [从 ReAct 到 Plan-and-Execute (技术栈)](https://jishuzhan.net/article/2046050411493261314)
- [Planner + Executor Pattern (Utilia)](https://blogs.utilia.dev/planner-executor-pattern-architecting-reliable-agents)
- [Receding Horizon Planning and Plan Commitment (notes.muthu.co)](https://notes.muthu.co/2026/03/receding-horizon-planning-and-plan-commitment-in-agent-reasoning-loops/)
