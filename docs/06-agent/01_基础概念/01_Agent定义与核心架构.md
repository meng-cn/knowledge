# Agent 定义与核心架构

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 1 节
> **难度**：⭐⭐⭐ | **前置知识**：无

---

## 1. 概述

**AI Agent（智能体）**是一种能**感知环境**、**自主决策**并**执行行动**的 AI 系统。它不只是回答问题的聊天机器人，而是能理解指令后自主拆解任务、规划步骤、调用工具、完成目标的「数字员工」。

本质区别：
- **LLM（大语言模型）**：你说什么 → 它回答什么（思考者）
- **Agent（智能体）**：你说目标 → 它主动完成（行动者）

---

## 2. 核心概念

### 2.1 Agent 的四模块架构（2026 年标准）

```
┌─────────────────────────────────────────────────────┐
│                    AI Agent                           │
│                                                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │  大脑    │───→│  规划    │───→│  记忆    │         │
│  │ (LLM)   │    │ (计划)  │    │ (存储)  │         │
│  └─────────┘    └─────────┘    └─────────┘         │
│       ↓              ↓              ↓                │
│  ┌─────────────────────────────────────────────┐    │
│  │              行动 (Action / Tool Use)          │    │
│  └─────────────────────────────────────────────┘    │
│       ↓                                              │
│  ┌─────────────────────────────────────────────┐    │
│  │           环境 (Environment / API)             │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

| 模块 | 功能 | 2026 年关键技术 |
|------|------|------|
| **大脑 (LLM)** | 意图理解、推理决策 | GPT-4o, Claude Opus, 模型路由 |
| **规划 (Planning)** | 任务拆解、动态调整 | ReAct, ToT, Agent-X |
| **记忆 (Memory)** | 跨会话连贯性、个性化 | 向量DB, MAGMA 多图架构 |
| **行动 (Action)** | 工具调用、API 执行 | Function Calling, MCP |

### 2.2 Agent 的核心能力

1. **自主性** — 不依赖人工干预，自主推进任务
2. **工具使用** — 通过 API/脚本/浏览器执行外部操作
3. **规划能力** — 将复杂目标拆解为可执行步骤
4. **记忆管理** — 短期对话 + 长期知识库 + 个性化记忆
5. **反思改进** — 对输出自我评估并迭代
6. **多Agent协作** — 与多个 Agent 协同完成复杂任务

---

## 3. 技术原理

### 3.1 Agent 执行循环（标准流程）

```mermaid
graph LR
    用户目标 --> 大脑
    大脑 --> 规划
    规划 --> 行动
    行动 --> 环境
    环境 --> 结果
    结果 --> 大脑
    大脑 --> 反思
    反思 --> 规划
    规划 -. 完成? --> 最终输出
```

**循环详解**：
1. **接收目标** → 用户输入任务目标
2. **大脑理解** → LLM 理解意图，拆解任务
3. **规划路径** → 生成执行计划（步骤列表）
4. **行动执行** → 调用工具/API 执行每一步
5. **获取结果** → 收集执行反馈
6. **反思迭代** → 评估结果，决定继续或修正
7. **完成输出** → 返回最终结果给用户

### 3.2 Agent vs LLM 的本质区别

| 维度 | LLM（大语言模型） | Agent（智能体） |
|------|------|------|
| 交互模式 | 一问一答 | 多步自主执行 |
| 工具使用 | ❌ | ✅ Function Calling / MCP |
| 记忆管理 | 仅上下文窗口 | 短期 + 长期 + 知识库 |
| 自主性 | 被动响应 | 主动规划和执行 |
| 复杂性 | 单轮推理 | 多轮迭代 + 反思 |
| 可靠性 | 幻觉概率高 | 通过反思+验证降低 |

### 3.3 Agent 的四个发展阶段

| 阶段 | 能力 | 代表 |
|------|------|------|
| L1 聊天型 | 上下文理解 + 简单工具调用 | ChatGPT (Plugins) |
| L2 工作流型 | 固定流程执行 + 多步调用 | AutoGPT, LangChain |
| L3 自主型 | 自主规划 + 反思 + 记忆 | CrewAI, OpenAI Agents |
| L4 进化型 | 自我改进 + 端到端训练 | 前沿研究 |

---

## 4. 实践指南

### 4.1 最简 Agent（Function Calling）

```python
from openai import OpenAI

client = OpenAI()

def get_weather(location: str, unit: str = "celsius"):
    """获取指定城市的天气信息"""
    return f"{location}: 25°C ({unit})"

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["location"]
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools
)

# LLM 返回 tool_calls，你调用对应函数后把结果返回给 LLM
```

### 4.2 最佳实践
- **永远设置低 temperature**（0.0-0.3），保证决策稳定
- **工具描述要精确** — LLM 依赖描述决定调用哪个工具
- **工具输入验证** — 不要信任 LLM 生成的参数，始终做校验
- **设置超时和重试** — 防止死循环和无限等待

### 4.3 常见陷阱
- **幻觉工具调用** → LLM 编造不存在的参数
  - 解法：工具描述要具体，加上 validation
- **token 爆炸** → 多步调用导致上下文过大
  - 解法：记忆压缩 + 定期清理
- **循环执行** → Agent 无法判断何时停止
  - 解法：最大迭代次数 + 结果校验

---

## 5. 方案对比

| 方案 | 优势 | 劣势 | 适用场景 |
|------|------|------|--|-|
| OpenAI Function Calling | 最成熟，文档完善 | 仅限 OpenAI 模型 | 通用开发 |
| Anthropic Tool Use | 超长上下文，推理强 | 生态较小 | 长文档处理 |
| 自研工具协议 | 完全可控 | 开发成本高 | 企业定制 |
| MCP 协议 | 标准化连接 | 较新，成熟度待验证 | 未来统一标准 |

---

## 6. 工具链

| 工具 | 用途 | 链接 |
|------|------|------|
| OpenAI Function Calling API | 模型端工具调用 | openai.com |
| MCP Server SDK | MCP 服务端实现 | modelcontextprotocol.io |
| LangChain Tool | 内置工具链 | python.langchain.com |
| Browserbase | 浏览器自动化 | browserbase.com |

---

## 7. 参考资料

- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
- [The Landscape of Emerging AI Agent Architectures](https://arxiv.org/abs/2404.11584)
- [A Survey on LLM-Based Agents](https://arxiv.org/abs/2406.05804)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)

---

## 8. 学习路径

1. **Level 1** — 理解四模块架构，写一个 Function Calling Agent
2. **Level 2** — 理解 Agent 执行循环，实现多步工具链
3. **Level 3** — 理解 Agent-X 按需规划模式
4. **Level 4** — 实现记忆压缩和反思机制
5. **Level 5** — 阅读 LangChain/LangGraph 源码
