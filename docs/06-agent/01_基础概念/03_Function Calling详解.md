# Function Calling 详解

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 3 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 基础

---

## 1. 概述

**Function Calling（函数调用）**是 LLM 返回结构化数据（通常是 JSON）以触发外部代码执行的能力。它是 Agent 最核心的基础设施。

---

## 2. 核心概念

### 2.1 Function Calling 的工作流程

```
用户输入 → LLM 推理 → 返回 tool_calls（JSON） → 执行函数 → 返回结果 → LLM 生成最终回答
```

**详细流程**：

```
Step 1: 用户问 "北京明天天气如何？"
Step 2: LLM 分析 → "需要调用 get_weather 工具"
Step 3: LLM 返回:
{
  "tool_calls": [{
    "id": "call_001",
    "function": "get_weather",
    "arguments": {"location": "北京", "unit": "celsius"}
  }]
}
Step 4: 你的代码执行 get_weather("北京", "celsius") → 返回 "25°C"
Step 5: 将结果追加为 tool_message 给 LLM
Step 6: LLM 生成最终回答: "北京明天晴，温度 25°C..."
```

### 2.2 多工具调用

```python
# LLM 可以一次决定调用多个工具（并行执行）
{
  "tool_calls": [
    {"function": "get_weather", "arguments": {"location": "北京"}},
    {"function": "search_web", "arguments": {"query": "AI", "count": 3}},
    {"function": "translate", "arguments": {"text": "Hello", "target": "zh"}}
  ]
}
```

---

## 3. 实践指南

### 3.1 Function Calling 最佳实践

1. **工具描述要精确** — 告诉 LLM 什么时候调用、做什么
2. **参数 schema 要完整** — 类型、枚举、默认值、描述
3. **temperature 设 0.0-0.3** — 保证结构输出稳定
4. **验证工具返回** — 不要直接信任 LLM 生成的参数
5. **错误处理** — 工具失败时返回友好错误信息给 LLM

### 3.2 常见陷阱

| 陷阱 | 原因 | 解法 |
|--|-|--|- |
| LLM 编造参数 | 工具描述模糊 | 加更多描述和示例 |
| 参数类型错误 | JSON Schema 不完整 | 加 type + enum |
| 调用不存在的工具 | 工具描述冲突 | 给工具命名更精确 |
| 并行调用过多 | LLM 过度调用 | 设 max_concurrent |

---

## 4. 参考资料

- [OpenAI Function Calling 文档](https://platform.openai.com/docs/guides/function-calling)
- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)

---

## 5. 学习路径

1. **Level 1** — 写一个 Function Calling 示例
2. **Level 2** — 实现多工具并行调用
3. **Level 3** — 对比不同模型的 FC 效果
4. **Level 4** — 实现 FC + RAG
5. **Level 5** — 理解 MCP 协议（FC 的标准化）
