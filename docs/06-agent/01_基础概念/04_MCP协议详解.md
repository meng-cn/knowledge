# MCP 协议详解

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 4 节
> **难度**：⭐⭐ | **前置知识**：Function Calling

---

## 1. 概述

**MCP（Model Context Protocol，模型上下文协议）**是 Anthropic 在 **2024 年 11 月**提出的标准化协议，旨在解决 AI Agent 与外部工具/数据源连接的问题。

**核心里程碑**：2025 年 12 月 9 日，Anthropic 将 MCP 协议捐赠给 Linux Foundation 下新成立的 **Agentic AI Foundation (AAIF)**，联合创始成员包括 Anthropic、OpenAI、Block、AWS、Google、Microsoft 等。[来源: Anthropic 官方公告](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation) [来源: GitHub Blog](https://github.blog/open-source/maintainers/mcp-joins-the-linux-foundation-what-this-means-for-developers-building-the-next-era-ai-tools-and-agents/)

MCP 已从 Anthropic 的单一厂商协议，演变成为**开源标准**，运行在 AAIF（[aaif.io](https://aaif.io/)）之下。

---

## 2. 核心概念

### 2.1 MCP 的三层架构

```
┌─────────────────────────────────────────────────────────────────┐
│       MCP Client (Agent)                                       │
│  (Claude, Cursor, Windsurf 等)                                  │
├─────────────────────────────────────────────────────────────────┤
│       MCP Protocol (transport)                                  │
│  (Stdio / SSE / HTTP)                                           │
├─────────────────────────────────────────────────────────────────┤
│       MCP Server (工具/数据源)                                   │
│  (文件系统, API, 数据库...)                                      │
└─────────────────────────────────────────────────────────────────┘
```

| 层 | 作用 | 示例 |
|--|-|--|- |
| Client | Agent 端连接 | Claude Desktop, Cursor |
| Protocol | 数据传输标准 | JSON-RPC 2.0 |
| Server | 工具实现 | 文件系统 Server, GitHub Server |

### 2.2 MCP 的三大资源

| 资源 | 说明 | 类比 |
|--|-|--|- |
| **Tools** | Agent 可调用的函数 | 函数库 |
| **Prompts** | 可复用的模板 | 代码片段 |
| **Resources** | 可读取的数据 | 文件 API |

### 2.3 MCP vs Function Calling 的区别

| 维度 | Function Calling | MCP |
|--|-|--|- |
| 定义方 | 模型提供商（OpenAI/Anthropic） | 独立协议标准 (AAIF) |
| 范围 | 单模型 | 跨模型统一 |
| 连接方式 | 每模型各自实现 | 统一协议 |
| 生态 | 各模型各自 | 工具一次编写，多处使用 |
| 成熟度 | 成熟 | 发展快，AAIF 托管 |

---

## 3. MCP 在各框架中的集成

### 3.1 CrewAI MCP 原生支持

CrewAI 已原生支持 MCP Server 作为工具使用。[来源: CrewAI 官方文档](https://docs.crewai.org.cn/en/mcp/dsl-integration)

```python
# CrewAI 中使用 MCP Server
from crewai import Agent, Crew, Task
from crewai.tools import MCPTool

knowledge_tool = MCPTool(
    server="enterprise-mcp",
    tool_name="query_knowledge_base"
)

researcher = Agent(
    role="研究员",
    tools=[knowledge_tool]
)
```

### 3.2 AutoGen + Agent Framework MCP 支持

Microsoft AutoGen 框架已原生集成 MCP，用于多智能体系统构建。[来源: AutoGen 与 MCP 文章](https://llmmultiagent.com/blogs/autogen_mcp_blog)

### 3.3 MCP 在各框架中的支持度汇总

| 框架 | MCP 原生支持 | 集成难度 | 来源 |
|--|-|--|-|--|
| **CrewAI** | ✅ 原生 | 低 | [CrewAI MCP 文档](https://docs.crewai.org.cn/en/mcp/dsl-integration) |
| **AutoGen + Agent FW** | ✅ 原生 | 低 | [AutoGen+MCP 文章](https://llmmultiagent.com/blogs/autogen_mcp_blog) |
| **LangChain** | ✅ 通过扩展 | 中 | [MCP & AI Frameworks 文章](https://chatforest.com/guides/mcp-ai-frameworks-langchain-langgraph-crewai/) |
| **OpenAI Agents SDK** | ✅ 原生 | 低 | OpenAI 官方 |
| **自研** | ✅ 完全可控 | 高 | - |

[来源: How to Handle Authentication and Tool Sharing in Multi-Agent MCP Systems](https://truto.one/blog/handling-auth-tool-sharing-in-multi-agent-frameworks-via-mcp/)

---

## 4. 实践指南

### 4.1 MCP Server 注册到 Claude Desktop

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username/Documents"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxx"
      }
    }
  }
}
```

### 4.2 编写自定义 MCP Server

```python
from mcp.server import Server

app = Server("my-mcp-server")

@app.tool()
async def get_weather(location: str) -> str:
    """获取指定城市天气"""
    temp = get_temperature(location)
    return f"{location}: {temp}°C"

# 启动
import asyncio
asyncio.run(app.runstdio())
```

### 4.3 最佳实践

1. **Server 名要精确** — Claude 靠名字判断是否该调用
2. **工具描述要完整** — 告诉 Claude 什么时候用
3. **错误信息要友好** — Claude 会把这些返回给用户
4. **一次编写多处使用** — MCP 的核心理念

---

## 5. 参考资料

- [Anthropic 捐赠 MCP 到 AAIF](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [MCP joins the Linux Foundation (GitHub Blog)](https://github.blog/open-source/maintainers/mcp-joins-the-linux-foundation-what-this-means-for-developers-building-the-next-era-ai-tools-and-agents/)
- [Model Context Protocol - AAIF](https://aaif.io/projects/model-context-protocol/)
- [MCP 官方规范](https://modelcontextprotocol.io/specification/latest)
- [CrewAI MCP 集成文档](https://docs.crewai.org.cn/en/mcp/dsl-integration)
- [AutoGen 与 MCP](https://llmmultiagent.com/blogs/autogen_mcp_blog)
- [MCP 生态：10+ 框架集成 (ChatForest)](https://chatforest.com/guides/mcp-ai-frameworks-langchain-langgraph-crewai/)
- [MCP 认证与多框架集成 (Truto)](https://truto.one/blog/handling-auth-tool-sharing-in-multi-agent-frameworks-via-mcp/)

---

## 6. 学习路径

1. **Level 1** — 安装 MCP Inspector 调试工具
2. **Level 2** — 用 npx 启动一个 MCP Server
3. **Level 3** — 编写自定义 MCP Server
4. **Level 4** — 实现 MCP + Function Calling 混合
5. **Level 5** — 阅读 MCP 协议规范源码
