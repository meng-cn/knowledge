# LLM-as-Agent

> **在知识图谱中的位置**：模块五 · 05_前沿趋势 · 第 1 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 框架基础

---

## 1. 概述

**LLM-as-Agent（模型即 Agent）**是 2025 年最大的范式转变——Agent 不需要框架了，LLM 本身就是 Agent。

核心思想：**Function Calling + 原生 Agent 能力直接集成在模型端**，框架只是薄封装。

---

## 2. 核心演进

### 2.1 从框架到模型

```
2023: LLM + LangChain 框架 → Agent
2024: LLM + OpenAI Agents SDK → Agent
2025: LLM(原生 FC) → Agent ✅ 框架消失
```

### 2.2 关键里程碑

| 时间 | 事件 | 意义 |
|------|------|------|
| 2023.06 | ChatGPT Plugins | 首次工具调用 |
| 2023.11 | GPT-4 Function Calling | 结构化输出 |
| 2024.05 | GPT-4o Multi-modal FC | 多模态调用 |
| 2024.09 | Claude 3.5 Computer Use | Claude 直接操作电脑 |
| 2024.12 | MCP 协议标准化 | 工具连接标准 |
| 2025.03 | GPT-4.5 Agent Mode | 原生 Agent 模式 |

---

## 3. 技术原理

### 3.1 原生 Agent 能力

| 能力 | 说明 | 当前模型 |
|------|------|------|
| **Function Calling** | 结构化输出 + 工具调用 | GPT-4o, Claude 3.5 |
| **Code Interpreter** | 执行代码 | GPT-4, Claude |
| **Browser Use** | 操作浏览器 | Claude Computer Use |
| **Computer Use** | 操作桌面 | Claude 3.5 |

### 3.2 GPT-4.5 Agent Mode

```
传统: 用户 → Agent框架 → LLM → 工具 → 工具 → LLM → 用户
LLM-as: 用户 → LLM(原生 Agent) → 工具 → 用户
         ← 工具结果 → ← 工具结果 → 
```

---

## 4. 实践指南

### 4.1 LLM-as-Agent 实现

```python
from openai import OpenAI

client = OpenAI()

# 不需要框架！直接调用 LLM 的 Function Calling
response = client.chat.completions.create(
    model="gpt-4.5",
    messages=[{"role": "user", "content": "帮我查天气并订餐厅"}],
    tools=[get_weather_tool, book_restaurant_tool],
    agent_mode="auto"  # 原生 Agent 模式
)

# LLM 自主决定调用工具，返回最终结果
print(response.final_output)
```

### 4.2 Claude Computer Use

```python
# Claude 直接操作你的电脑界面
import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    messages=[{"role": "user", "content": "打开浏览器搜索 AI Agent"}],
    computer_use="enabled"  # 原生桌面控制
)
```

---

## 5. 影响与趋势

### 5.1 对框架的影响

| 影响 | 说明 |
|------|------|
| **框架简化** | LangChain → OpenAI SDK，代码量减少 70%+ |
| **框架整合** | LangChain/LlamaIndex 将被纳入 OpenAI/Ecosystem |
| **LLM 成为平台** | OpenAI/Claude 成为 Agent 平台本身 |
| **框架价值转移** | 从「编排」转向「监控/部署/评测」 |

### 5.2 未来方向

1. **多模型原生 Agent** — 不同模型不同 Agent 能力
2. **模型端工具注册** — 在模型侧管理工具
3. **Agent 即 API** — Agent 能力直接暴露为 API

---

## 6. 参考资料

- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [Claude Computer Use](https://www.anthropic.com/news/computer-use)
- [Anthropic MCP 协议](https://modelcontextprotocol.io/)

---

## 7. 学习路径

1. **Level 1** — 理解 LLM-as-Agent 概念
2. **Level 2** — 用 OpenAI Agents SDK 体验
3. **Level 3** — 对比传统框架的差异
4. **Level 4** — 理解 MCP 协议如何统一工具
5. **Level 5** — 预测未来 Agent 形态
