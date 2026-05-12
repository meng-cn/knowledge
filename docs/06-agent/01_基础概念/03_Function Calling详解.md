# Function Calling 详解

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 3 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 基础架构

---

## 1. 概述

**Function Calling（函数调用）**是 LLM 返回结构化数据（通常是 JSON）以触发外部代码执行的能力。它是 Agent 最核心的基础设施。

没有 Function Calling，Agent 就无法与外部世界交互。

---

## 2. 核心概念

### 2.1 Function Calling 的四种输出模式

| 模式 | 描述 | 支持模型 |
|------|------|--|-|
| **结构化输出** | 返回 JSON Schema 定义的结构 | GPT-4o, Claude 3.5 |
| **JSON Schema** | 标准 JSON Schema 格式 | 所有支持 FC 的模型 |
| **Text Format** | 纯文本格式参数 | 早期模型 |
| **Tool Use** | 多工具选择（含图片/音频） | GPT-4o, Claude Opus |

### 2.2 Function Calling 的工作流程

```
用户输入 → LLM 推理 → 返回 tool_calls（JSON） → 执行函数 → 返回结果 → LLM 生成最终回答
```

**详细流程**：

```
Step 1: 用户问 "北京明天天气如何？"
        ↓
Step 2: LLM 分析 → "需要调用 get_weather 工具"
        ↓
Step 3: LLM 返回 JSON:
{
  "tool_calls": [{
    "id": "call_001",
    "function": "get_weather",
    "arguments": {"location": "北京", "unit": "celsius"}
  }]
}
        ↓
Step 4: 你的代码执行 get_weather("北京", "celsius") → 返回 "25°C"
        ↓
Step 5: 将结果追加为 system_message 给 LLM
        ↓
Step 6: LLM 生成最终回答: "北京明天晴，温度 25°C..."
```

---

## 3. 技术原理

### 3.1 工具定义规范（JSON Schema）

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "获取指定城市的实时天气信息",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称，如'北京'"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "default": "celsius",
                    "description": "温度单位"
                },
                "days": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 7,
                    "default": 1,
                    "description": "查询天数"
                }
            },
            "required": ["location"],
            "additionalProperties": False
        }
    }
}]
```

### 3.2 LLM 内部如何做出调用决策

```
输入: "帮我查天气并告诉我会下雨吗"

LLM 内部推理:
┌─────────────────────────────────────┐
│ 1. 识别意图: 天气查询                 │
│ 2. 查找可用工具 → get_weather 匹配    │
│ 3. 提取参数: location="北京"          │
│ 4. 补充默认参数: unit="celsius"       │
│ 5. 判断是否需要额外工具 → 不需要      │
│ 6. 返回 tool_calls                    │
└─────────────────────────────────────┘
```

### 3.3 多工具调用

```python
# LLM 可以一次决定调用多个工具（并行执行）
{
  "tool_calls": [
    {"function": "get_weather", "arguments": {"location": "北京"}},
    {"function": "get_news", "arguments": {"topic": "AI", "count": 3}},
    {"function": "translate", "arguments": {"text": "Hello", "target": "zh"}}
  ]
}
```

---

## 4. 实践指南

### 4.1 完整 Agent 示例

```python
from openai import OpenAI
import json

client = OpenAI()

def get_weather(location: str, unit: str = "celsius") -> str:
    """获取指定城市的天气"""
    return f"{location}: 25°C, 晴"

def search_web(query: str, max_results: int = 5) -> str:
    """搜索网页"""
    return f"搜索 {query} 的 {max_results} 条结果..."

# 工具列表
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "城市名"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "在网上搜索信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        }
    }
]

# 工具映射
TOOL_MAP = {"get_weather": get_weather, "search_web": search_web}

def run_agent(messages):
    # 调用 LLM
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
        temperature=0.1
    )
    
    # 处理 tool_calls
    if response.choices[0].message.tool_calls:
        for tc in response.choices[0].message.tool_calls:
            func_name = tc.function.name
            args = json.loads(tc.function.arguments)
            
            # 执行工具
            result = TOOL_MAP[func_name](**args)
            
            # 追加结果到消息
            messages.append({
                "role": "assistant",
                "content": None,
                "tool_calls": [tc]
            })
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result
            })
        
        # LLM 根据工具结果生成最终回答
        final = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return final.choices[0].message.content
    
    return response.choices[0].message.content

# 使用
result = run_agent([
    {"role": "user", "content": "北京明天天气如何？帮我搜一下 AI 最新新闻"}
])
print(result)
```

### 4.2 Function Calling 最佳实践

1. **工具描述要精确** — 告诉 LLM 什么时候调用、做什么
2. **参数 schema 要完整** — 类型、枚举、默认值、描述
3. **temperature 设 0.0-0.3** — 保证结构输出稳定
4. **验证工具返回** — 不要直接信任 LLM 生成的参数
5. **错误处理** — 工具失败时返回友好错误信息给 LLM

### 4.3 常见陷阱

| 陷阱 | 原因 | 解法 |
|------|------|------|
| LLM 编造参数 | 工具描述模糊 | 加更多描述和示例 |
| 参数类型错误 | JSON Schema 不完整 | 加 type + enum |
| 调用不存在的工具 | 工具描述冲突 | 给工具命名更精确 |
| 并行调用过多 | LLM 过度调用 | 设 max_concurrent |

---

## 5. 方案对比

| 方案 | 优势 | 劣势 |
|------|------|------|
| GPT-4o FC | 最成熟 | 成本高 |
| Claude Tool Use | 超长上下文 | 生态较小 |
| 自定义 Function Calling | 完全可控 | 开发量大 |
| MCP Tools | 标准化 | 较新 |

---

## 6. 参考资料

- [OpenAI Function Calling 文档](https://platform.openai.com/docs/guides/function-calling)
- [Claude Tool Use 文档](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [ReAct 论文](https://arxiv.org/abs/2210.03629)

---

## 7. 学习路径

1. **Level 1** — 写一个 Function Calling 示例
2. **Level 2** — 实现多工具并行调用
3. **Level 3** — 对比不同模型的 FC 效果
4. **Level 4** — 实现 FC + RAG
5. **Level 5** — 理解 MCP 协议（FC 的标准化）
