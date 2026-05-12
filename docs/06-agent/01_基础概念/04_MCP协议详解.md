# MCP 协议详解

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 4 节
> **难度**：⭐⭐ | **前置知识**：Function Calling

---

## 1. 概述

**MCP（Model Context Protocol，模型上下文协议）**是 Anthropic 在 2024 年底提出的标准化协议，旨在解决 AI Agent 与外部工具/数据源连接的问题。

核心思想：**一个协议统一所有 Agent 与工具的连接方式**，类似 USB 对硬件、HTTP 对 Web。

---

## 2. 核心概念

### 2.1 MCP 的三层架构

```
┌───────────────────────────────────┐
│       MCP Client (Agent)           │
│  (Claude, Cursor, Windsurf 等)     │
├───────────────────────────────────┤
│       MCP Protocol (transport)     │
│  (Stdio / SSE / HTTP)              │
├───────────────────────────────────┤
│       MCP Server (工具/数据源)      │
│  (文件系统, API, 数据库...)         │
└───────────────────────────────────┘
```

| 层 | 作用 | 示例 |
|--|-|--|-|
| Client | Agent 端连接 | Claude Desktop, Cursor |
| Protocol | 数据传输标准 | JSON-RPC 2.0 |
| Server | 工具实现 | 文件系统 Server, GitHub Server |

### 2.2 MCP 的三大资源

| 资源 | 说明 | 类比 |
|------|------|--|-|
| **Tools** | Agent 可调用的函数 | 函数库 |
| **Prompts** | 可复用的模板 | 代码片段 |
| **Resources** | 可读取的数据 | 文件 API |

### 2.3 MCP vs Function Calling 的区别

| 维度 | Function Calling | MCP |
|------|------|------|
| 定义方 | 模型提供商（OpenAI/Anthropic） | 独立协议标准 |
| 范围 | 单模型 | 跨模型统一 |
| 连接方式 | 每模型各自实现 | 统一协议 |
| 生态 | 各模型各自 | 工具一次编写，多处使用 |
| 成熟度 | 成熟 | 较新但发展快 |

---

## 3. 技术原理

### 3.1 MCP 通信流程

```
MCP Client              MCP Protocol            MCP Server
    │                        │                        │
    │  → Initialize         │                        │
    │  (capabilities)       │                        │
    │───────────────────────│───────────────────────→│
    │                        │                        │
    │                        │  ← List Tools         │
    │                        │  (可用的工具列表)        │
    │                        │←───────────────────────│
    │                        │                        │
    │  → Call Tool          │                        │
    │  (tool_name, params)  │                        │
    │───────────────────────│───────────────────────→│
    │                        │                        │
    │  ← Result             │                        │
    │  (tool result)        │←───────────────────────│
    │                        │                        │
```

### 3.2 MCP Server 实现示例

```python
from mcp.server import Server, McpError
from mcp.types import Tool, TextContent

app = Server("my-mcp-server")

@app.tool()
async def get_weather(location: str, unit: str = "celsius") -> list[TextContent]:
    """获取指定城市天气"""
    temp = get_temperature(location, unit)  # 你的逻辑
    return [TextContent(type="text", text=f"{location}: {temp}{unit}")]

@app.tool()
async def search_files(pattern: str, path: str = ".") -> list[TextContent]:
    """搜索文件"""
    files = search(path, pattern)
    return [TextContent(type="text", text="\n".join(files))]

# 启动 Server
import asyncio
asyncio.run(app.runstdio())
```

### 3.3 MCP 的传输协议

| 传输方式 | 适用场景 | 说明 |
|------|------|------|
| **Stdio** | 本地进程通信 | 最常用，CLI 工具 |
| **SSE** | 网络远程调用 | HTTP Server-Sent Events |
| **HTTP** | RESTful API | HTTP POST 请求 |

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

```bash
# 初始化 MCP Server
npm init -y
npm install @modelcontextprotocol/sdk
```

```python
from mcp.server import Server

app = Server("my-custom-server")

# 注册 Tools
# 注册 Resources  
# 注册 Prompts

if __name__ == "__main__":
    import asyncio
    asyncio.run(app.runstdio())
```

### 4.3 最佳实践

1. **Server 名要精确** — Claude 靠名字判断是否该调用
2. **工具描述要完整** — 告诉 Claude 什么时候用
3. **错误信息要友好** — Claude 会把这些返回给用户
4. **一次编写多处使用** — MCP 的核心理念

### 4.4 常见陷阱

| 陷阱 | 解法 |
|------|------|
| Server 启动失败 | 检查 command + args 路径 |
| Token 过期 | 加 refresh 机制 |
| 工具冲突 | 给工具命名唯一且精确 |
| 跨域问题 | 用 SSE 而非直接调用 |

---

## 5. 方案对比

| 协议 | 优势 | 劣势 | 适用 |
|------|------|------|------|
| MCP | 标准化, 跨模型 | 较新 | 未来统一标准 |
| Function Calling | 成熟 | 模型绑定 | 当前主流 |
| OpenAPI/Swagger | 标准 REST | 无 Agent 语义 | 传统 API |
| GraphQL | 灵活查询 | 无执行语义 | 数据查询 |

---

## 6. 工具链

| 工具 | 用途 | 链接 |
|------|------|------|
| @modelcontextprotocol/sdk | MCP Server SDK | github.com/modelcontextprotocol |
| Claude Desktop | MCP Client | claude.ai |
| Cursor | MCP Client | cursor.com |
| MCP Inspector | MCP 调试工具 | modelcontextprotocol.io |

---

## 7. 参考资料

- [MCP 官方规范](https://modelcontextprotocol.io/)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic MCP 公告](https://www.anthropic.com/news/model-context-protocol)

---

## 8. 学习路径

1. **Level 1** — 安装 MCP Inspector 调试工具
2. **Level 2** — 用 npx 启动一个 MCP Server
3. **Level 3** — 编写自定义 MCP Server
4. **Level 4** — 实现 MCP + Function Calling 混合
5. **Level 5** — 贡献 MCP 协议规范
