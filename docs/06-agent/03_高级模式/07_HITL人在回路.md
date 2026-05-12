# HITL 人在回路

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 7 节
> **难度**：⭐⭐ | **前置知识**：Agent 基础

---

## 1. 概述

**HITL（Human-in-the-Loop，人在回路）**让 Agent 在执行关键步骤时请求人工审批。

---

## 2. 核心技术

### 2.1 HITL 时机

| 场景 | 原因 |
|------|------|
| 发送重要邮件 | 防止误发 |
| 执行删除操作 | 不可逆 |
| 财务决策 | 合规要求 |
| 医疗建议 | 安全 |

### 2.2 实现方式

```python
from agents import Agent

agent_with_approval = Agent(
    name="AgentHITL",
    instructions="执行任务，但关键操作前等待人工审批",
    tools=[execution_tool],
    handoff_handlers={
        "need_approval": lambda result: ask_human_approval(result)
    }
)
```

---

## 3. 参考资料

- [AgentBench 评估基准](https://github.com/THUDM/AgentBench)
