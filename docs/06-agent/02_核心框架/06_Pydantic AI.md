# Pydantic AI

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 6 节
> **难度**：⭐⭐ | **前置知识**：Python + Pydantic

---

## 1. 概述

**Pydantic AI** 是 Pydantic 团队推出的 Python 原生 Agent 框架，利用 Pydantic 的类型系统和验证能力，让 Agent 的工具调用**类型安全、零运行时错误**。

核心理念：**类型安全 = 更少的 Bug + 更好的 DX**

---

## 2. 技术原理

### 2.1 核心代码示例

```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, Field

# 定义工具返回类型（类型安全！）
class WeatherResult(BaseModel):
    location: str = Field(description="城市名称")
    temperature: float = Field(description="温度")
    condition: str = Field(description="天气状况")

# 定义 Agent
agent = Agent(
    "openai:gpt-4o",
    system_prompt="你是一个天气助手"
)

# 工具定义（类型自动验证）
@agent.tool
async def get_weather(ctx: RunContext[None], city: str) -> WeatherResult:
    """获取指定城市的天气"""
    # 返回 WeatherResult，Pydantic 自动验证
    return WeatherResult(
        location=city,
        temperature=25.0,
        condition="晴"
    )

# 运行
result = await agent.run("北京天气")
print(result.data)  # WeatherResult 实例，类型安全
```

### 2.2 核心优势

1. **类型安全** — 参数和返回值都有类型验证
2. **零运行时错误** — Pydantic 在运行时验证输入/输出
3. **自动文档生成** — Pydantic 自动生成 API 文档
4. **开发者体验** — IDE 自动补全完整

---

## 3. 参考资料

- [Pydantic AI 官方文档](https://ai.pydantic.dev/)
- [Pydantic AI GitHub](https://github.com/pydantic/pydantic-ai)

---

## 4. 学习路径

1. **Level 1** — 理解类型安全 Agent
2. **Level 2** — 写一个 Pydantic Agent
3. **Level 3** — 对比与传统 Agent 的差异
4. **Level 4** — Pydantic AI + MCP
5. **Level 5** — 理解 Pydantic 验证原理
