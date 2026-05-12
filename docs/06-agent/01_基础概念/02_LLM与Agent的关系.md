# LLM 与 Agent 的关系

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 2 节
> **难度**：⭐⭐⭐ | **前置知识**：基础 LLM 知识

---

## 1. 概述

LLM（大语言模型）是 Agent 的「大脑」，但 LLM ≠ Agent。理解两者的关系是掌握 Agent 技术的关键。

---

## 2. 核心概念

### 2.1 LLM 是什么

大语言模型本质是一个**概率文本生成器**：给定上下文输入，输出下一个词的概率分布。

```
Input: "帮我查北京明天天气"
        ↓
  LLM 推理（175B+ 参数）
        ↓
Output: "北京明天晴，最高温度 25°C，最低 15°C..."
```

**局限**：
- 知识截止于训练数据，无法获取实时信息
- 无法直接操作外部系统
- 没有持久记忆（仅靠上下文窗口）
- 可能有幻觉

### 2.2 Agent 是什么

Agent = LLM + 工具 + 记忆 + 规划 + 反思

```
用户: "帮我查天气并订餐厅"
        ↓
┌────────────────────────────────┐
│          AI Agent               │
│                                │
│  ┌──────┐    ┌──────┐         │
│  │ LLM  │───→│规划器 │        │
│  │ (大脑) │    │      │         │
│  └──────┘    └──────┘         │
│      ↓            ↓             │
│  ┌──────────┐ ┌──────────┐    │
│  │ 天气工具 │ │ 订餐工具 │    │
│  └──────────┘ └──────────┘    │
└────────────────────────────────┘
        ↓
输出: "已查询天气（25°C晴），已为您预订 XX 餐厅 19:00"
```

### 2.3 LLM → Agent 的跃迁路径

| 阶段 | 描述 | 技术要点 |
|------|------|--|-|
| 纯 LLM | 问答 | Prompt Engineering |
| + 工具调用 | Function Calling | 结构化输出 |
| + RAG | 知识库问答 | 向量检索 |
| + 规划 | 多步推理 | ReAct / CoT |
| + 记忆 | 跨会话 | 向量DB + 摘要 |
| + 反思 | 自我改进 | Reflexion |
| = Agent | 自主执行任务 | 完整四模块 |

---

## 3. 技术原理

### 3.1 LLM 作为 Agent 大脑

LLM 在 Agent 中承担三个核心角色：

| 角色 | 能力 | 要求 |
|------|------|------|
| **意图理解** | 理解用户目标 | 通用理解力 |
| **推理决策** | 决定调用哪个工具 | Function Calling |
| **结果评估** | 判断是否继续或停止 | 逻辑推理 |

### 3.2 关键转折点：GPT-4 Function Calling

2023 年是 LLM → Agent 的关键转折点：

- **GPT-3.5**（2023 年中）：ChatGPT 对话 + Plugins 实验
- **GPT-4**（2023.11）：Function Calling 正式支持，结构化 JSON 输出
- **GPT-4o**（2024.05）：多模态 + 高效 Function Calling
- **Claude 3**（2024.02）：超长上下文 + 精确工具调用
- **GPT-4.5/Opus**（2025）：接近人类推理能力

### 3.3 LLM-as-Agent 趋势（2025-2026）

OpenAI 和 Anthropic 正在推动**不需要框架的 Agent**：

```
传统路径: 用户 → Agent框架(LangChain) → LLM → 工具
新路径:   用户 → LLM(GPT-4o) → 工具(原生FC)
```

- **OpenAI Agents SDK**：官方轻量 SDK，Agent 即概念
- **Claude Computer Use**：Claude 直接操作电脑界面
- **GPT-4.5 Agent Mode**：OpenAI 内置 Agent 能力

---

## 4. 实践指南

### 4.1 最小 Agent 实现（10 行代码）

```python
from openai import OpenAI
from agents import Agent, Runner

client = OpenAI()

# 定义 Agent（大脑 + 工具）
agent = Agent(
    name="WeatherAgent",
    instructions="你是一个天气查询助手，调用工具获取实时天气",
    tools=[get_weather_tool],  # 你的工具
)

# 运行 Agent（自动规划 + 执行）
result = await Runner.run(agent, "北京明天天气如何？")
print(result.final_output)  # Agent 自动调用工具后返回结果
```

### 4.2 模型选择决策树

```
你需要 Agent？
  ├── 需要 Function Calling？
  │   ├── GPT-4o（最成熟）
  │   ├── Claude 3.5 Sonnet（性价比）
  │   └── Claude 3.5 Opus（推理最强）
  ├── 需要超长上下文？
  │   ├── Claude 3.5 Sonnet（200K）
  │   └── Gemini 2.0（1M）
  ├── 需要自部署？
  │   ├── DeepSeek-R1（开源推理）
  │   └── Llama 3.1（开源通用）
  └── 需要多模态？
      └── GPT-4o / Claude 3.5 / Gemini 2.0
```

### 4.3 最佳实践
- **Function Calling 温度设 0.1** — 确保结构输出稳定
- **工具描述 > 工具名** — LLM 看描述决定调用
- **返回格式严格** — JSON Schema 定义工具参数
- **多轮对话保留上下文** — 每步结果追加到消息

### 4.4 常见陷阱
- **混淆 RAG 和 Agent** — RAG 是检索增强，不是 Agent
- **过度使用 LLM 做决策** — 能用代码判断就不用 LLM
- **忽略成本** — 每步工具调用 = 一次 API 费用

---

## 5. 方案对比

| 对比维度 | 纯 LLM | LLM + Function Calling | 完整 Agent |
|------|------|------|--|-|
| 自主性 | ❌ | ⚠️ 有限 | ✅ 完全自主 |
| 工具使用 | ❌ | ✅ 简单调用 | ✅ 复杂编排 |
| 记忆管理 | ❌ | ❌ | ✅ 长期+短期 |
| 多步推理 | ⚠️ 可能 | ⚠️ 有限 | ✅ 规划+反思 |
| 可靠性 | 中 | 中高 | 高（有验证） |
| 成本 | 低 | 中 | 高（多步） |

---

## 6. 工具链

| 工具 | 用途 |
|------|------|
| OpenAI API | Function Calling |
| Claude API | Tool Use |
| LiteLLM | 统一多模型调用 |
| Vercel AI SDK | Web 端 Agent |

---

## 7. 参考资料

- [OpenAI Function Calling 文档](https://platform.openai.com/docs/guides/function-calling)
- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
- [2025 AI Agent 行业研究报告](https://pdf.dfcfw.com/pdf/H3_AP202503131644339445_1.pdf)

---

## 8. 学习路径

1. **Level 1** — 写一个 Function Calling 示例
2. **Level 2** — 实现 3 个工具的协作调用
3. **Level 3** — 对比 GPT-4o vs Claude 的工具调用效果
4. **Level 4** — 理解 LLM-as-Agent 范式
5. **Level 5** — 阅读 OpenAI Agents SDK 源码
