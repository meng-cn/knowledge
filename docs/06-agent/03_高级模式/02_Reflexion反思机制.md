# Reflexion 反思机制

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 2 节
> **难度**：⭐⭐⭐ | **前置知识**：ReAct 模式

---

## 1. 概述

**Reflexion** 是由 Shinn et al. (2023) 提出的 Agent 自我改进机制。核心思想：**Agent 对自己的输出进行自我评估，发现错误后修正，迭代改进**。

简单理解：Agent 不是「做了一次就完事」，而是**做完 → 自我检查 → 发现不对 → 修正 → 再做**。

---

## 2. 核心概念

### 2.1 Reflexion 的核心组件

| 组件 | 功能 |
|------|------|
| **Actor** | 执行任务的 Agent |
| **Evaluator** | 评估 Agent 输出的模块 |
| **Memory** | 存储历史反馈，帮助 Agent 下次改进 |
| **Reflection Prompt** | 告诉 Agent "哪里错了，下次怎么做" |

### 2.2 Reflexion 流程

```
步骤1: Actor 生成初步答案
步骤2: Evaluator 评估答案
步骤3: 生成反馈（哪里错、怎么改）
步骤4: 反馈写入 Memory
步骤5: Actor 读取 Memory，生成修正答案
步骤6: 重复直到满意或达到上限
```

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│   Actor   │────→│Evaluator  │────→│ Feedback  │
│ (生成答案) │     │ (评估)     │     │ (反馈)    │
└───────────┘     └───────────┘     └─────┬─────┘
                                          ↓
                                    ┌───────────┐
                                    │  Memory   │
                                    │ (存反馈)   │
                                    └─────┬─────┘
                                          ↓
                                    ┌───────────┐
                                    │  Actor    │
                                    │ (修正答案) │
                                    └───────────┘
```

---

## 3. 技术原理

### 3.1 Reflexion Prompt 设计

```
你之前尝试了以下操作:
{previous_attempts}

评估反馈:
{evaluation}

请根据反馈修正你的操作，生成新的答案。
```

### 3.2 Reflexion Agent 实现

```python
from agents import Agent

reflexion_agent = Agent(
    name="ReflexionAgent",
    instructions="""
    1. 生成初步答案
    2. 自我评估答案质量
    3. 如果发现问题，记录反馈并修正
    4. 最多迭代 5 次
    """,
    tools=[evaluation_tool],
)

# 运行
result = await reflexion_agent.run("解决这个数学问题", max_iterations=5)
```

---

## 4. 实践指南

### 4.1 Reflexion 适用场景
- 答案质量关键（不能接受错误输出）
- 有明确的评估标准
- 迭代成本可接受（多轮 API 调用）

### 4.2 最佳实践

1. **反馈要具体** — "哪里错了 + 怎么改"
2. **Memory 管理** — 只保留最近的 N 条反馈
3. **评估标准可量化** — 用 metric 判断是否改进
4. **设迭代上限** — 避免无限循环

### 4.3 常见陷阱

| 陷阱 | 解法 |
|------|------|
| 反馈不够具体 | 结构化反馈格式 |
| 记忆污染 | 只保留最相关反馈 |
| 过拟合 | 评估用验证集 |
| 成本过高 | 设迭代上限 |

---

## 5. 参考资料

- [Reflexion 论文](https://arxiv.org/abs/2303.11366)
- [Self-RAG 论文](https://arxiv.org/abs/2310.11511)

---

## 6. 学习路径

1. **Level 1** — 理解 Reflexion 流程
2. **Level 2** — 实现简单的自我评估 Agent
3. **Level 3** — 加 Memory 存储反馈
4. **Level 4** — Reflexion + ReAct 结合
5. **Level 5** — 理解 Self-RAG 变体
