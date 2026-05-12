# Agent 编排模式

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 6 节
> **难度**：⭐⭐ | **前置知识**：多Agent协作

---

## 1. 概述

**Agent 编排（Agent Orchestration）**决定 Agent 的流程：哪些 Agent 运行、按什么顺序、如何决策下一步。

---

## 2. 三种编排模式

### 2.1 LLM 决策编排

让 LLM 决定执行哪个 Agent（最灵活）：

```python
# 所有 Agent 的 instructions 放在 context 中
# LLM 根据当前状态决定下一步
result = await Runner.run(main_agent, query, context=agents)
```

**优点**：灵活、适应性强
**缺点**：不可预测、调试困难

### 2.2 代码编排

用代码控制流程（最可控）：

```python
def workflow(query):
    agent_a_result = agent_a.run(query)
    if need_agent_b(agent_a_result):
        return agent_b.run(agent_a_result)
    else:
        return agent_a_result
```

**优点**：确定性强、可调试
**缺点**：不够灵活

### 2.3 混合编排

推荐方式：**关键路径用代码，灵活路径用 LLM**：

```python
# 关键流程用代码
result = agent_a.run(query)
final = agent_b.run(result)  # 确定路径

# 灵活部分交给 LLM
context = {"agent_c": agent_c, "agent_d": agent_d}
flexible_result = await Runner.run(main, context=context)
```

---

## 3. 参考资料

- [OpenAI Agents SDK 编排指南](https://openai.github.io/openai-agents-python/)
