# Agentic RAG（代理增强检索）技术深度解析

> LLM Agent 驱动的动态检索、工具调用与多代理协作
> ReAct · LangGraph · AutoGen · Reflexion · Plan-and-Execute
> 生成时间：2026-04-28 · 版本 2.0（深度扩充）

---

## 目录

- [第一部分：Agentic RAG 全景架构](#第一部分agentic-rag-全景架构)
  - [1.1 为什么需要 Agentic RAG](#11-为什么需要-agentic-rag)
  - [1.2 什么是 Agentic RAG](#12-什么是-agentic-rag)
  - [1.3 RAG 演进三阶段](#13-rag-演进三阶段)
  - [1.4 核心设计原则](#14-核心设计原则)
- [第二部分：Agentic RAG 核心机制](#第二部分agentic-rag-核心机制)
  - [2.1 工具使用（Tool Use / Function Calling）](#21-工具使用tool-use--function-calling)
  - [2.2 记忆机制（Memory）](#22-记忆机制memory)
  - [2.3 规划与推理（Planning & Reasoning）](#23-规划与推理planning--reasoning)
  - [2.4 反思与自我纠正（Reflection & Self-Correction）](#24-反思与自我纠正reflection--self-correction)
  - [2.5 人在回路（Human-in-the-Loop）](#25-人在回路human-in-the-loop)
- [第三部分：ReAct 框架详解](#第三部分react-框架详解)
  - [3.1 ReAct 原理详解](#31-react-原理详解)
  - [3.2 ReAct 典型工作流](#32-react-典型工作流)
  - [3.3 ReAct 实现（LangChain / LlamaIndex）](#33-react-实现langchain--llamaindex)
  - [3.4 ReAct 变体：ReAct + Self-Ask、Plan-and-Execute、Reflexion](#34-react-变体react--self-askplan-and-executereflexion)
- [第四部分：多代理 RAG 系统](#第四部分多代理-rag-系统)
  - [4.1 多代理架构设计](#41-多代理架构设计)
  - [4.2 代理角色模式](#42-代理角色模式)
  - [4.3 经典框架：LangGraph / AutoGen / CrewAI](#43-经典框架langgraph--autogen--crewai)
  - [4.4 代理通信与协调机制](#44-代理通信与协调机制)
- [第五部分：工具生态与集成](#第五部分工具生态与集成)
  - [5.1 工具定义与管理](#51-工具定义与管理)
  - [5.2 RAG 生态工具（向量库、图谱、搜索、代码执行等）](#52-rag-生态工具向量库图谱搜索代码执行等)
  - [5.3 工具选择与编排](#53-工具选择与编排)
- [第六部分：Agentic RAG 评估与优化](#第六部分agentic-rag-评估与优化)
  - [6.1 Agentic RAG 评估指标体系](#61-agentic-rag-评估指标体系)
  - [6.2 延迟与成本分析](#62-延迟与成本分析)
  - [6.3 失败率分析与缓解（90% 失败率根因）](#63-失败率分析与缓解90-失败率根因)
  - [6.4 生产化部署策略](#64-生产化部署策略)
- [第七部分：完整代码实现](#第七部分完整代码实现)
  - [7.1 ReAct Agent 完整实现](#71-react-agent-完整实现)
  - [7.2 LangGraph 多代理 RAG 管线](#72-langgraph-多代理-rag-管线)
  - [7.3 AutoGen 多代理协作](#73-autogen-多代理协作)
- [第八部分：决策与选型](#第八部分决策与选型)
  - [8.1 Agentic RAG 决策树](#81-agentic-rag-决策树)
  - [8.2 技术选型速查表](#82-技术选型速查表)
  - [8.3 常见陷阱与避坑指南](#83-常见陷阱与避坑指南)

---

## 第一部分：Agentic RAG 全景架构

### 1.1 为什么需要 Agentic RAG

传统 RAG 的核心问题：**检索流程是固定的**。无论查询多复杂，系统总是执行同样的"检索 → 重排序 → 生成"流水线。

**传统 RAG 的固有局限**：

| 局限 | 具体表现 | 示例 |
|------|--|--|
| **固定检索流程** | 无法根据查询类型动态选择检索策略 | "对比 2023 和 2024 年 Q4 销售数据"需要 SQL 查询 + 文档检索，但传统 RAG 只走向量检索 |
| **无法使用工具** | 不能调用外部 API、数据库、计算器 | "计算 15% 的折扣价"无法用向量检索回答 |
| **无法多步推理** | 单次检索无法覆盖跨多步的推理链 | "A 公司收购 B 后，B 的产品线如何影响了 C 的市场份额？" |
| **无法自我纠正** | 检索失败时不会重试或换策略 | Top-K 结果不相关时直接生成错误答案 |
| **无法动态调整** | 不能根据中间结果调整后续行为 | 第一步检索发现答案不完整时无法调整 |

**需要 Agentic RAG 的场景**：

| 场景 | 传统 RAG | Agentic RAG |
|------|------|------|
| 金融分析（财报对比、趋势预测） | ❌ 无法执行数据分析 | ✅ Agent 可调用 SQL + 计算器 + 文档 |
| 法律条文比对 | ❌ 多文档交叉引用困难 | ✅ Agent 可逐一检索、对比、总结 |
| 科研文献综述 | ❌ 无法发现隐含关联 | ✅ Agent 可遍历引用链、发现关联 |
| 代码调试 | ❌ 无法执行代码 | ✅ Agent 可运行代码、查看错误 |
| 复杂客户支持 | ❌ 固定 FAQ 检索 | ✅ Agent 可调用知识库 + CRM + 工单系统 |
| 简单知识问答 | ✅ Hybrid RAG 足够 | ⚠️ 过度工程化 |
| 单文档理解 | ✅ 足够了 | ⚠️ 过度工程化 |
| 高延迟要求场景 | ✅ 毫秒级 | ⚠️ Agent 需要多步 LLM 调用 |

### 1.2 什么是 Agentic RAG

**定义**：Agentic RAG = LLM Agent + RAG

Agent 是一个能够自主感知环境、做出决策、执行行动的系统。在 RAG 场景中，Agent 不再是"被动地检索-生成"，而是"主动地决定：我需要用什么工具、检索什么信息、如何推理"。

**Agent 的核心循环（ReAct）**：

```
┌─────────────────────────────────────────┐
│           Agent 核心循环                    │
│                                           │
│  Thought（思考）: "我需要先查文档 X"       │
│       │                                   │
│       ▼                                   │
│  Action（行动）: search_docs("X")         │
│       │                                   │
│       ▼                                   │
│  Observation（观察）: 返回结果 Y           │
│       │                                   │
│       ▼                                   │
│  新的 Thought: "Y 包含关键信息，生成答案"    │
│       │                                   │
│       ▼                                   │
│  输出最终答案                               │
└─────────────────────────────────────────┘
```

**Agent 与传统 RAG 的架构差异**：

```
传统 RAG:
┌─────┐    ┌──────┐    ┌───────┐    ┌───────┐    ┌──────┐
│查询  │──→│检索  │──→│重排序 │──→│生成   │──→│答案  │
└─────┘    └──────┘    └───────┘    └───────┘    └──────┘
  固定流程（不可改变）

Agentic RAG:
┌─────┐
│查询  │
└──┬──┘
   ▼
┌─────────┐
│ Agent   │ ←── 自主决策：用什么工具、检索什么
│ (循环)   │
│ Thought │
│ Action  │
│ Obsrv   │
└──┬──┘
   │
   ├─→ 向量检索 → 返回 → Agent 决策
   ├─→ SQL 查询 → 返回 → Agent 决策
   ├─→ 图谱查询 → 返回 → Agent 决策
   ├─→ 计算器 → 返回 → Agent 决策
   └─→ 完成 → 生成答案
```

**Agentic RAG 的核心能力**：

| 能力 | 说明 | 与传统 RAG 的差异 |
|------|--|------|
| 动态检索策略 | 根据查询类型自主选择检索方式 | 固定向量检索 vs 动态选择 |
| 工具使用 | 调用外部 API、数据库、计算器 | 只能检索 vs 可调用工具 |
| 多步推理 | 通过 Thought-Action-Observation 循环完成复杂推理 | 单步推理 vs 多步推理 |
| 自我纠正 | 发现错误时自动调整策略重试 | 失败即终止 vs 自动恢复 |
| 人在回路 | 关键决策点保留人工审批 | 无 vs 可选 |

### 1.3 RAG 演进三阶段

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  基础 RAG    │  │  Hybrid RAG  │  │ Agentic RAG  │
│  (2023)      │  │  (2024)      │  │  (2025-2026) │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ • 向量检索   │  │ • BM25+向量  │  │ • 动态检索   │
│ • 固定流程   │  │ • 多路检索   │  │ • 工具调用   │
│ • 单向推理   │  │ • 重排序     │  │ • 多步推理   │
│ • LLM 生成  │  │ • 混合融合   │  │ • 自我纠正   │
│ • 无工具     │  │ • 查询优化   │  │ • 人在回路   │
└──────────────┘  └──────────────┘  └──────────────┘

关键转折点：
2023: Chroma + LangChain → 基础 RAG 工程化
2024: Cohere Reranker + Weaviate 混合检索 → Hybrid RAG 成熟
2025: GPT-4 Function Calling → Agentic RAG 兴起
     LangGraph + AutoGen → 多代理 RAG 框架
```

**各阶段对比**：

| 维度 | 基础 RAG | Hybrid RAG | Agentic RAG |
|------|------|------|------|
| **检索策略** | 单一向量检索 | BM25 + 向量 + RRF | 动态选择（Agent 决定） |
| **查询理解** | 无 | 查询改写/分解 | Agent 自主理解 |
| **工具使用** | ❌ | ❌ | ✅ 向量库/SQL/API/代码 |
| **推理能力** | 单步 | 单步 + 重排序 | 多步 + 自我纠正 |
| **错误恢复** | ❌ | ❌ | ✅ 自动重试/换策略 |
| **人类干预** | ❌ | ❌ | ✅ HITL 可选 |
| **工程复杂度** | 低 | 中 | 高 |
| **适用场景** | 简单问答 | 所有企业场景 | 复杂决策场景 |
| **成本** | 低 | 中 | 高（多次 LLM 调用） |

**Agentic RAG 的兴起背景**：

- **GPT-4 Function Calling**：使 LLM 能够结构化地调用外部工具
- **LangChain Agent 框架**：标准化了 Agent 的开发模式
- **GPT-4/o 推理能力**：足够理解复杂查询并制定策略
- **LangGraph/AutoGen**：多代理协作框架使系统级 Agent 成为可能
- **LLM 成本下降**：使多步推理的成本可接受

### 1.4 核心设计原则

**原则 1：最小可用原则——能不用 Agent 就不用**

```
判断流程：
    查询复杂度低？ → 是 → Hybrid RAG 足够
    工具调用必要？ → 是 → 需要 Agent
    多步推理必要？ → 是 → 需要 Agent
    自我纠正必要？ → 是 → 需要 Agent
    以上都不是？ → 是 → Hybrid RAG 足够
```

**原则 2：降级优先——Agent 失败时降级到简单 RAG**

```
Agent 执行:
    正常 → Agent 流程
    失败（超时/错误） → 降级 → Hybrid RAG → 生成答案
    降级也失败 → 返回错误消息
```

**原则 3：人在回路——关键决策点保留人工审批**

```
高风险决策 → HITL 审批 → 批准/驳回/修正 → Agent 继续/终止
```

**原则 4：可解释性——Agent 的每一步决策都可追溯**

```
Agent 记录:
    Step 1: Thought → "需要查 SQL 数据库"
    Step 2: Action → SQL("SELECT ...")
    Step 3: Observation → "返回 10 条记录"
    Step 4: Thought → "数据不完整，需要再查文档"
    Step 5: Action → VectorSearch("关键词")
    Step 6: Observation → "返回 Top 5 chunks"
    Step 7: Thought → "综合数据生成答案"
```

---

## 第二部分：Agentic RAG 核心机制

### 2.1 工具使用（Tool Use / Function Calling）

**Function Calling 原理**：

```
1. 系统发送工具定义（JSON Schema）给 LLM
2. LLM 根据用户查询决定调用哪个工具
3. LLM 输出结构化 JSON 表示工具调用
4. 系统执行工具调用
5. 系统返回工具结果
6. LLM 根据结果生成最终回答
```

**工具定义标准格式（JSON Schema）**：

```json
{
  "type": "function",
  "function": {
    "name": "search_documents",
    "description": "在知识库中搜索文档片段",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "搜索查询关键词"
        },
        "top_k": {
          "type": "integer",
          "description": "返回结果数量",
          "default": 5
        },
        "filters": {
          "type": "object",
          "description": "可选的过滤条件",
          "properties": {
            "year": {"type": "integer"},
            "category": {"type": "string"}
          }
        }
      },
      "required": ["query"]
    }
  }
}
```

**Function Calling vs Prompt-based 工具调用对比**：

| 维度 | Function Calling | Prompt-based |
|------|------|--|
| **结构化输出** | ✅ JSON Schema 保证 | ❌ LLM 可能格式错误 |
| **类型安全** | ✅ 类型校验 | ❌ 需要手动解析 |
| **可靠性** | 高（~95%+） | 中（~70-85%） |
| **灵活性** | 中（固定 Schema） | 高（自由格式） |
| **延迟** | 低 | 中 |
| **适用场景** | 生产级系统 | 原型/探索 |

**OpenAI Function Calling 实现**：

```python
from openai import OpenAI

client = OpenAI()

# 工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_documents",
            "description": "在知识库中搜索文档",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "top_k": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "execute_sql",
            "description": "执行 SQL 查询",
            "parameters": {
                "type": "object",
                "properties": {
                    "sql": {"type": "string", "description": "SQL 查询语句"}
                },
                "required": ["sql"]
            }
        }
    }
]

# 第一次调用：让 LLM 决定调用哪个工具
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "对比 2023 和 2024 年 Q4 的销售数据"}],
    tools=tools,
    tool_choice="auto"
)

# LLM 返回：需要调用 execute_sql 工具
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        args = json.loads(tool_call.function.arguments)
        if tool_call.function.name == "execute_sql":
            result = execute_sql(args["sql"])
            # 第二次调用：传入工具结果，让 LLM 生成答案
            response2 = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": "对比 2023 和 2024 年 Q4 的销售数据"},
                    {"role": "assistant", "tool_calls": [tool_call]},
                    {"role": "tool", "tool_call_id": tool_call.id, "content": str(result)}
                ],
                tools=tools
            )
```

**工具调用的安全策略**：

| 风险 | 缓解措施 |
|------|--|
| SQL 注入 | SQL 白名单、参数化查询 |
| 文件操作越权 | 沙箱执行、路径白名单 |
| 网络请求滥用 | URL 白名单、超时限制 |
| API 调用成本失控 | 频率限制、预算告警 |
| 代码执行恶意代码 | 沙箱执行、资源限制 |

### 2.2 记忆机制（Memory）

Agent 需要记忆来维持对话连贯性和利用历史信息。

**记忆层级**：

```
┌──────────────────────────────────────┐
│           长期记忆                      │
│  （向量数据库 / 知识图谱）               │
│  存储：跨会话的知识、经验教训              │
├──────────────────────────────────────┤
│           工作记忆                      │
│  （当前任务的上下文）                    │
│  存储：当前任务的状态、中间结果            │
├──────────────────────────────────────┤
│           短期记忆                      │
│  （滑动窗口 / 最近 K 条消息）            │
│  存储：最近 K 轮对话                      │
└──────────────────────────────────────┘
```

**各类记忆详解**：

| 类型 | 存储位置 | 容量 | 检索策略 | 更新频率 |
|------|------|------|------|------|
| **长期记忆** | 向量数据库（Milvus/Pinecone） | 无限 | 向量相似度检索 | 低频（事件触发） |
| **工作记忆** | Agent 内部状态 | ~10-20K tokens | 直接访问 | 每次迭代 |
| **短期记忆** | 消息历史（滑动窗口） | ~4K 消息 | 顺序访问 | 每次消息 |

**记忆检索策略**：

```python
class AgentMemory:
    """Agent 记忆管理"""
    
    def __init__(self, vector_store, max_short_window=20):
        self.vector_store = vector_store
        self.short_window = max_short_window
        self.work_state = {}  # 工作记忆
        self.short_history = []  # 短期记忆
    
    def store(self, memory: dict):
        """存储记忆到长期记忆"""
        self.vector_store.add(
            id=memory["id"],
            text=memory["text"],
            metadata=memory.get("metadata", {})
        )
    
    def retrieve(self, query: str, k: int = 5) -> list:
        """检索长期记忆"""
        return self.vector_store.search(query, k=k)
    
    def update_work_state(self, key: str, value):
        """更新工作记忆"""
        self.work_state[key] = value
    
    def get_work_state(self) -> dict:
        """获取工作记忆"""
        return self.work_state
    
    def append_history(self, message: dict):
        """追加短期记忆"""
        self.short_history.append(message)
        if len(self.short_history) > self.short_window:
            self.short_history = self.short_history[-self.short_window:]
    
    def get_history(self) -> list:
        """获取短期记忆"""
        return self.short_history
```

---

## 2.6 状态持久化（State Persistence）

### 2.6.1 为什么状态持久化至关重要

Agentic RAG 是有状态的——Agent 在多轮 Thought-Action-Observation 循环中维护着中间结果、检索历史、决策轨迹。如果系统崩溃或用户网络中断，这些状态全部丢失，任务被迫从头开始。**状态持久化是生产级 Agentic RAG 的基础设施**。

典型崩溃场景：
- 系统重启导致内存中 checkpoint 丢失
- 用户网络断开后重新连接，Agent 状态不恢复
- 高并发下 Agent 实例迁移到其他节点
- 长时间任务（>30 分钟）的进度保存

### 2.6.2 LangGraph Checkpoint 机制

LangGraph 在任意节点执行后可保存完整状态快照，支持中断恢复和会话迁移。

| Checkpoint 后端 | 适用场景 | 延迟 | 持久性 | 分布式 |
|------|--|--|--|--|
| **MemorySaver** | 开发/测试 | <1ms | ❌ 内存中，进程关闭即失 | ❌ |
| **PostgresSaver** | 生产环境 | 5-50ms | ✅ PostgreSQL 持久化 | ✅ 支持主从 |
| **RedisSaver** | 高并发 | <1ms | ⚠️ 依赖 TTL 配置 | ✅ 原生分布式 |
| **SQLiteSaver** | 轻量生产 | 5-20ms | ✅ SQLite 文件 | ❌ 单文件 |

**Checkpoint 数据模型**：

```json
{
  "thread_id": "session_123",
  "checkpoint_ns": "",
  "checkpoint_id": "uuid_v4",
  "parent_checkpoint_id": "uuid_v4",
  "metadata": {
    "source": "agent_node",
    "step": 3,
    "ts": "2026-04-28T14:00:00Z",
    "user_id": "u_12345"
  },
  "channel_values": {
    "query": "A 公司 2024 年营收",
    "intermediate_steps": [{"thought": "检索 SQL", "action": "SQL(...)", "observation": "10 条记录"}],
    "retrieved_docs": [...],
    "current_thought": "还需要检索图谱...",
    "needs_retrieval": true
  }
}
```

### 2.6.3 多轮对话轨迹存储策略

| 策略 | 说明 | 适用场景 |
|------|--|--|
| **完整保留** | 保存所有步骤，不压缩 | 短对话（<10 步），调试需求 |
| **滑动窗口** | 只保留最近 N 步 | 中长对话，节省空间 |
| **摘要压缩** | 用 LLM 将前 N 步压缩为摘要 | 长对话，token 有限制 |
| **分层存储** | 近期步骤完整保留，远期步骤摘要 | 通用方案 |

**摘要压缩 Prompt 模板**：

```python
COMPRESSION_PROMPT = """
请将以下 Agent 执行轨迹压缩为摘要，保留：
- 最终目标和当前状态
- 已获取的关键信息
- 正在进行的决策
- 未完成的子任务

原始轨迹：{traces}

输出格式（JSON）：
{{
  "goal": "目标",
  "current_status": "当前状态",
  "key_findings": ["发现 1", "发现 2"],
  "pending_tasks": ["待办 1"],
  "compressed_steps": "步骤摘要"
}}
"""
```

**完整 Checkpointer 配置**：

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import StateGraph

# 开发环境：内存级
checkpointer_dev = MemorySaver()

# 生产环境：持久化
import psycopg
conn = psycopg.connect("postgresql://user:pass@localhost:5432/rag")
checkpointer_prod = PostgresSaver(conn)

# 使用
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("retrieval", retrieval_node)
workflow.add_node("generate", generate_node)
workflow.add_conditional_edges("agent", route)
workflow.add_edge("retrieval", "agent")
workflow.add_edge("generate", END)
app = workflow.compile(checkpointer=checkpointer_prod)

# 保存断点
config = {"configurable": {"thread_id": "session_123"}}
result = app.invoke(state, config=config)

# 恢复断点（从崩溃中恢复）
state = app.get_state(config).values
result = app.invoke(state, config=config)
```

**恢复流程**：

```
崩溃发生
    │
    ▼
检查是否存在 checkpoint
    │
    ├─ 有 → 加载最新 checkpoint → 从断点恢复
    │
    └─ 无 → 从用户查询重新开始（可能丢失中间步骤）
```

---

## 2.7 知识库演进（Knowledge Evolution / Feedback Loop）

### 2.7.1 知识回流机制

Agent 在执行任务过程中发现的新知识或对已有知识的修正，应自动回流到 RAG 知识库中，形成**主动学习闭环**。

**知识回流的触发条件**：

| 触发条件 | 示例 | 处理方式 |
|------|--|--|
| **新知识发现** | Agent 检索到未入库的高质量文档 | 自动入库 + 向量化 |
| **错误知识修正** | 用户反馈某答案错误，Agent 发现正确信息 | 标记旧知识为过时 + 插入新知识 |
| **隐式用户反馈** | 用户点赞某答案 | 提升该知识片段权重 |
| **隐式用户反馈** | 用户点踩某答案 | 降低该知识片段权重，触发人工审核 |
| **Agent 主动总结** | Agent 在长期对话中发现知识模式 | 定期生成知识摘要入库 |

**增量更新 Pipeline**：

```python
class KnowledgeEvolutionPipeline:
    """知识回流管道"""
    
    def __init__(self, vector_store, knowledge_graph):
        self.vector_store = vector_store
        self.kg = knowledge_graph
    
    def on_agent_completion(self, agent_traces: list):
        """Agent 执行完成后，分析是否需要知识回流"""
        new_knowledge = []
        corrections = []
        
        for trace in agent_traces:
            if trace.get("was_missed_by_kg"):
                new_knowledge.append(trace["new_doc"])
            if trace.get("error_corrected"):
                corrections.append(trace["correction"])
        
        for doc in new_knowledge:
            self.vector_store.upsert(doc["id"], doc["text"], doc["metadata"])
            self.kg.add_entity(doc["entities"])
        
        for corr in corrections:
            self._apply_correction(corr)
    
    def _apply_correction(self, correction):
        """应用知识修正"""
        self.vector_store.update(correction["old_id"], 
                                 metadata={"status": "deprecated", 
                                          "replaced_by": correction["new_id"]})
        self.vector_store.upsert(correction["new_id"], correction["new_text"])
        self.vector_store.decrease_weight(correction["old_id"], decay=0.3)
    
    def periodic_summarization(self, user_id: str, window_days: int = 7):
        """定期将用户对话中沉淀的知识摘要入库"""
        conversations = self._get_conversations(user_id, window_days)
        summary = llm.generate(f"""
        从以下对话中，提炼值得长期保留的知识。
        输出：新知识片段（如有）、需要修正的知识（如有）、过期知识标记（如有）。
        对话：{conversations}
        """)
        self._apply_summary(summary)
```

**知识衰减策略**：

```
时间衰减曲线：权重 = base_weight × e^(-λt)

衰减率（不同知识类型）：
- 时效性知识（新闻、政策）：λ = 0.1/天（快速衰减）
- 技术文档：λ = 0.01/月（慢衰减）
- 基础概念：λ = 0.001/年（几乎不衰减）
```

---

## 2.8 跨会话记忆（Cross-Session Memory）

### 2.8.1 用户级 vs 会话级记忆

| 维度 | 会话级记忆 | 用户级记忆 |
|------|--|--|
| **作用范围** | 单次对话 | 跨所有会话 |
| **生命周期** | 会话结束 → 可选保留 | 长期保留，定期压缩 |
| **存储** | 内存 / 短期 DB | 向量数据库 / 知识图谱 |
| **检索方式** | 上下文窗口 | 向量相似度检索 |
| **隐私要求** | 低 | 高（含个人偏好、历史） |

### 2.8.2 记忆压缩策略

```
定期压缩（每周/每月）：
原始记忆（膨胀）
- 100 条历史对话
- 50 次检索记录
- 30 次工具调用
    │
    ▼
LLM 压缩摘要（保留精华）
    │
    ▼
压缩后记忆（精简）
- 用户偏好：喜欢简洁回答
- 常用工具：SQL + 文档检索
- 知识领域：金融 + 法律
- 历史决策：曾做过 X 分析
```

### 2.8.3 知识图谱在长期记忆中的作用

知识图谱可作为长期记忆的骨架结构：

- **实体锚定**：对话中的关键实体自动抽取并入库
- **关系建模**：实体间关系随对话不断修正
- **推理辅助**：基于图谱关系辅助 Agent 推理
- **压缩载体**：图谱节点数 << 原始对话数

---

**推理范式对比**：

| 范式 | 描述 | 优点 | 缺点 |
|--|------|------|--|
| **零-shot** | 直接回答 | 简单 | 复杂任务容易出错 |
| **CoT** | 链式推理（逐步思考） | 提升复杂任务准确率 | 不产生外部动作 |
| **ReAct** | 推理+行动交替 | 可利用外部信息 | 步骤多、成本高 |
| **ToT** | 思维树（多路径探索） | 探索多种方案 | Token 消耗大 |
| **GoT** | 思维图（网状推理） | 最灵活 | 最复杂 |
| **Self-Ask** | 自我追问分解 | 适合事实查询 | 依赖精确信息源 |
| **Plan-and-Execute** | 先规划后执行 | 结构化 | 规划错误难恢复 |

**Tree of Thoughts（ToT）详解**：

```
                    [初始问题]
                        │
              ┌─────────┼─────────┐
              │         │         │
           路径A       路径B     路径C
         (思考1.1)   (思考2.1)  (思考3.1)
              │         │         │
         ┌────┴────┐    │         │
         │        │   验证→    验证→
      路径A.1  路径A.2  (通过)    (失败→回溯)
         │        │
      验证→    验证→
      (通过)   (通过)
         │        │
      [答案A.1] [答案A.2]
           选择最佳答案
```

**Planner-and-Execute 模式**：

```python
PLAN_PROMPT = """
你是一个规划专家。将以下任务分解为可执行的步骤。

任务：{query}

要求：
- 每个步骤必须可执行
- 步骤之间有关联依赖
- 考虑使用哪些工具
- 标注每个步骤的预期输入和输出

输出格式（JSON）：
{{"steps": [
  {{"step": 1, "action": "工具名", "input": "描述", "output": "描述", "depends_on": null}},
  {{"step": 2, "action": "工具名", "input": "步骤1的输出", "output": "描述", "depends_on": 1}},
  ...
]}}
"""

EXECUTE_PROMPT = """
请执行步骤：{step_description}

可用工具：{available_tools}

当前状态：{current_state}

输出格式（JSON）：
{{"result": "执行结果", "status": "success/error", "error": "错误信息（如果失败）"}}
"""
```

**Self-Consistency（自我一致性）**：

```
策略：对同一问题生成 N 条推理路径，选择出现最多的答案

示例：
问题："15% 的 200 是多少？"

路径 1: 200 * 0.15 = 30
路径 2: 200 * 15 / 100 = 30
路径 3: 200 - (200 * 0.85) = 30
路径 4: 200 * 15% = 30
路径 5: 200 / 100 * 15 = 30

投票结果：30（5/5 一致 → 高置信度）
```

### 2.4 反思与自我纠正（Reflection & Self-Correction）

**Reflexion 框架**（Shinn et al., 2023）：

```
┌──────────┐    ┌───────────┐    ┌───────────────┐
│  初始回答  │──→│ 自我评估  │──→│ 回答正确？    │
│          │    │ 反思失败   │    │ 是 → 输出     │
└──────────┘    └───────────┘    └───────┬───────┘
                                           │ 否
                                  ┌────────▼───────┐
                                  │ 生成反思笔记     │
                                  │ "我犯了X错误"   │
                                  └───────┬────────┘
                                          │
                                  ┌────────▼───────┐
                                  │ 基于反思重试     │
                                  └────────┬───────┘
                                           │
                                   ┌───────▼───────┐
                                   │ 重新评估...    │
                                   └───────────────┘
```

**反思 Prompt 模板**：

```python
REFLECTION_PROMPT = """
请反思以下回答是否正确，如果错误，请解释错误原因。

原始查询：{query}
工具调用记录：{tool_log}
中间结果：{intermediate_results}
当前回答：{answer}

反思要求：
1. 检查回答中的每个事实是否支持
2. 检查推理逻辑是否完整
3. 检查是否有遗漏的关键信息
4. 指出错误（如果有）

反思输出（JSON）：
{{
  "correct": true/false,
  "errors": ["错误1", "错误2"],
  "reflections": "反思笔记",
  "improvement_suggestions": ["改进建议1", "改进建议2"]
}}
"""
```

**多代理辩论（Multi-Agent Debate）**：

```
┌─────────────┐      ┌─────────────┐
│ Agent A     │      │ Agent B     │
│ （论证方）   │      │ （质疑方）   │
│             │      │             │
│ "X 是 Y 的   │◄────│ "我不同意，   │
│   CEO"      │      │ 我看到 Z 说   │
└──────┬──────┘      │   Y 的 CEO   │
       │             │   是 W"      │
       │ 辩论→       └──────┬───────┘
       │ 辩论→              │ 辩论→
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│ 仲裁 Agent   │◄────│ 综合双方论点 │
│ （裁决方）   │      └─────────────┘
│             │
│ "综合双方，  │
│   X 确实是  │
│   Y 的 CEO" │
└─────────────┘
```

### 2.5 人在回路（Human-in-the-Loop）

**HITL 应用场景**：

| 场景 | 风险等级 | HITL 必要性 |
|------|--|--|
| 法律合规审查 | 极高 | 必须 |
| 医疗诊断 | 极高 | 必须 |
| 金融交易 | 高 | 建议 |
| 客服自动回复 | 中 | 可选 |
| 内部知识查询 | 低 | 不需要 |

**HITL 实现方式**：

| 方式 | 说明 | 延迟影响 | 适用场景 |
|------|--|------|--|
| **审批流** | Agent 提交决策，人工审批后继续 | +2s-5min | 高风险决策 |
| **投票机制** | 多个 Agent + 人类投票 | +1s-1min | 重要判断 |
| **反馈循环** | 人工修正 Agent 输出 | 异步 | 训练/改进 |
| **边界限定** | Agent 在限定范围内自主，超出范围请求人工 | +0.1-1s | 日常运营 |

**LangGraph HITL 支持**：

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

# 检查点保存（支持中断恢复）
checkpointer = MemorySaver()

# 定义节点
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))
workflow.add_node("human_review", human_approval_node)  # HITL 节点

# 条件边：Agent 可能决定提交人工审批
def route_after_agent(state):
    if state["needs_human_approval"]:
        return "human_review"
    elif state["needs_tools"]:
        return "tools"
    else:
        return END

workflow.add_conditional_edges("agent", route_after_agent)

# 编译时传入 checkpointer
app = workflow.compile(checkpointer=checkpointer)
```

---

## 第三部分：ReAct 框架详解

### 3.1 ReAct 原理详解

**ReAct** = **Re**asoning + **Act**ing

核心思想：Agent 不应只推理或只行动，而是交替进行推理和行动，用行动的结果来指导后续的推理。

**ReAct 与其他推理范式的对比**：

| 维度 | CoT | ReAct | Plan-and-Execute | Reflexion |
|------|------|------|------|--|
| **推理** | ✅ | ✅ | ✅ | ✅ |
| **行动** | ❌ | ✅ | ✅ | ❌ |
| **外部信息利用** | ❌ | ✅ | ✅ | ❌ |
| **错误恢复** | ❌ | ✅（回溯） | 有限 | ✅（重试） |
| **可解释性** | 高 | 高 | 中 | 中 |
| **复杂度** | 低 | 中 | 中 | 高 |
| **适用场景** | 逻辑推理 | 信息检索+推理 | 多步骤任务 | 需要自我改进 |

**ReAct 在 RAG 场景中的独特价值**：

```
问题："A 公司收购 B 后，B 的产品线对 C 公司市场的影响是什么？"

CoT（无法做到）:
  "A 收购了 B → B 有 X 产品 → X 可能影响 C"  ← 无法验证

ReAct（可以做到）:
  Thought: "我需要先确认 A 是否收购了 B"
  Action: search_documents("A 收购 B")
  Observation: "确认：A 于 2023 年收购了 B"
  Thought: "现在需要确认 B 的产品线"
  Action: query_graph("B 的产品线")
  Observation: "B 的产品：X, Y, Z"
  Thought: "现在需要查 C 公司的市场数据"
  Action: execute_sql("SELECT ...")
  Observation: "C 的 Q1-Q4 市场份额数据"
  Thought: "综合以上信息生成回答"
  Output: "A 收购 B 后，B 的产品 X 对 C 的市场份额从 15% 降到 12%..."
```

### 3.2 ReAct 典型工作流

```
┌─────────────┐
│ 用户查询     │
│ "A 收购 B？" │
└──────┬──────┘
       ▼
┌───────────────────────────────────┐
│  Step 1: Thought                   │
│  "我需要搜索 A 和 B 的收购信息"     │
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Step 2: Action                    │
│  search_documents(query="A 收购 B")│
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Step 3: Observation               │
│  "返回：A 于 2023-01-15 收购了 B" │
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Step 4: Thought                   │
│  "收购已确认。现在查看收购金额"      │
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Step 5: Action                    │
│  search_documents(query="A 收购 B 金额") │
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Step 6: Observation               │
│  "返回：收购金额 687 亿美元"         │
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Step 7: Thought                   │
│  "信息充分，生成最终回答"            │
└────────────┬──────────────────────┘
       ▼
┌───────────────────────────────────┐
│  Output                            │
│  "A 公司于 2023 年 1 月 15 日以    │
│   687 亿美元收购了 B 公司"           │
└───────────────────────────────────┘
```

**终止条件**：

| 条件 | 说明 | 实现 |
|------|--|------|
| **答案确定** | Agent 认为答案完整 | 置信度 > 阈值 |
| **达到最大步数** | 防止无限循环 | max_iterations = 10-20 |
| **检测到循环** | Agent 重复相同步骤 | 历史记录检测 |
| **超时** | 执行时间超过限制 | TTL = 30-60s |
| **错误次数过多** | 连续错误 > 阈值 | error_count > 3 |

### 3.3 ReAct 实现（LangChain / LlamaIndex）

**LangChain ReAct Agent 实现**：

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun

# 定义工具
@tool
def search_knowledge_base(query: str) -> str:
    """在知识库中搜索"""
    # 实现向量检索
    return f"搜索结果: ..."

@tool
def execute_sql(sql: str) -> str:
    """执行 SQL 查询"""
    # 实现 SQL 查询
    return f"SQL 结果: ..."

@tool
def calculate(expression: str) -> str:
    """数学计算"""
    return str(eval(expression))

# 创建 Agent
llm = ChatOpenAI(model="gpt-4o", temperature=0)
tools = [search_knowledge_base, execute_sql, calculate]

agent = create_react_agent(
    llm=tools,
    tools=tools,
    prompt=ReActPromptTemplate()  # 自定义 Prompt
)

executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10,
    handle_parsing_errors=True,
    return_intermediate_steps=True  # 记录中间步骤
)

# 执行
result = executor.invoke({"input": "计算 A 产品 2024 年 Q4 的销售额增长率"})
```

**LlamaIndex AgentQueryEngine**：

```python
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool

# 定义工具
query_engine_tool = QueryEngineTool.from_defaults(
    query_engine=vector_store.as_query_engine(),
    description="搜索知识库中的文档片段"
)

sql_query_engine_tool = QueryEngineTool.from_defaults(
    query_engine=sql_query_engine,
    description="执行 SQL 查询获取结构化数据"
)

# 创建 Agent
agent = ReActAgent.from_tools(
    [query_engine_tool, sql_query_engine_tool],
    llm=ChatGPT(model="gpt-4o"),
    verbose=True
)

# 执行
response = agent.chat("A 产品 2024 年 Q4 的销售额是多少？")
```

### 3.4 ReAct 变体

**ReAct + Self-Ask（通过追问分解问题）**：

```
问题："比尔·盖茨的妻子是谁？"

Agent: 我不知道 → 让我问第一个问题
Action: search("微软创始人的妻子是谁？")
Result: 没有直接答案

Agent: 让我换个方式问 → 第二个问题
Action: search("比尔·盖茨的配偶")
Result: "Melinda Gates"

Agent: 答案已找到 → Melinda Gates
```

**Plan-and-Execute（先规划后执行）**：

```
问题："分析 A 公司近三年的营收趋势"

Step 1: 规划
Plan: [
  1. 获取 2022 年营收数据 (SQL)
  2. 获取 2023 年营收数据 (SQL)
  3. 获取 2024 年营收数据 (SQL)
  4. 获取行业基准数据 (搜索)
  5. 生成趋势分析 (LLM)
]

Step 2: 执行（按规划逐步执行）
Step 3: 汇总结果生成回答
```

**Reflexion（反思+重试）**：

```
第一次尝试:
Agent: "答案是 X" → 评估: "X 错误"
反思: "我用了错误的数据库"

第二次尝试:
Agent: "使用正确的数据库重新查询"
结果: "答案是 Y" → 评估: "Y 正确"
```

---

### 3.5 高级工作流模式（Advanced Patterns）

传统 ReAct 框架虽然灵活，但在实际生产场景中，单一模式往往难以应对复杂需求。本节深入解析三种主流的高级工作流模式：**Self-RAG**（自反思检索增强）、**CRAG**（纠正型 RAG）、**Plan-and-Execute**（规划执行框架），以及它们之间的对比与选型策略。

---

## 3.5.1 Self-RAG：让检索与生成真正"自主"

### 3.5.1.1 核心思想

**Self-RAG**（Dasigi et al., 2023, Stanford）的核心理念非常朴素但强大：**让语言模型自主决定是否需要检索、如何评价检索结果、以及如何在生成过程中持续自我评估**。它不是"先检索再固定地生成"，而是"根据实际需求动态触发检索"。

**传统 RAG 的核心缺陷**：
- **盲目检索**：无论用户问什么，每次都做向量检索 → 浪费 Token、引入噪声
- **被动接受**：检索回来的片段不管质量如何，直接塞给生成模型
- **黑盒生成**：生成结果无法追溯、无法验证

Self-RAG 通过引入 **Critique Tokens**（评论令牌）解决了这些问题。这些 Critique Tokens 是语言模型在生成过程中主动输出的特殊标记，充当自我评估的"信号"。

### 3.5.1.2 三大关键能力详解

#### 能力 1：自适应检索（Adaptive Retrieval）

模型在每个生成步骤前都会先判断：**我现在需要检索吗？**

```
传统 RAG:  用户查询 → [强制检索] → 检索结果 → 生成

Self-RAG:  用户查询
              │
        ┌─────┴─────┐
        ▼           ▼
    需要检索？    不需要检索？
    是 ↓           是 ↓
  检索         直接用内部知识
  检索结果    生成答案
    ↓
  质量评价？
    ↓
  足够好 → 用于生成
  不够好 → 重新检索或不用
```

**自适应检索的判断逻辑**：

| 情况 | 是否检索 | 原因 |
|------|--|--|
| 常识问题（"水的沸点是多少"） | ❌ 不检索 | LLM 内部知识足够 |
| 时效性问题（"2025 年最新的政策"） | ✅ 检索 | 内部知识可能过时 |
| 领域专有知识（"某个特定公司的财报数据"） | ✅ 检索 | 超出训练数据范围 |
| 模糊/开放问题 | ✅ 检索 | 需要补充上下文 |
| 简单是/否问题 | 视情况 | 高置信度时不检索 |

实现方式：Self-RAG 在 Token 空间里预置了专门的 `Retrieval Decision Token`（如 `<retrieval_needed>` 和 `<no_retrieval_needed>`），模型在生成每个 token 时会先判断是否发出检索信号。

#### 能力 2：检索结果评价（Retrieval Evaluation）

检索回来的片段并非直接可用，Self-RAG 对每个检索片段进行**两个维度的评价**：

```
检索片段 → relevance_token → relevant / non-relevant
                    → supported_token → supported / unsupported

如果 relevant + supported → 放心使用
如果 relevant + unsupported → 标记不确定性，生成时用标注
如果 non-relevant → 丢弃
```

- **Relevance（相关性）**：这个片段与当前查询是否相关？
- **Support（支持度）**：当前生成内容能否被这个片段支撑？

评价标记（Critique Tokens）：
- `<relevant>` / `<not_relevant>`：检索结果是否相关
- `<supported>` / `<unsupported>`：生成内容是否被检索结果支持

**评价的时机**：
1. **检索后评价**：每个检索回来的 chunk 先打 relevance 标签
2. **生成中评价**：每生成一段内容，检查是否有 `<supported>` 标记
3. **生成后评价**：最终输出时检查整体支持度

#### 能力 3：自反思生成（Self-Reflective Generation）

在生成过程中，Self-RAG 不仅输出答案，还输出**置信度标记**和**引用标记**：

```
<answer> 答案内容 </answer>
<support> 支持度评分 </support>
<relevance> 引用片段的相关度 </relevance>
<confidence> 置信度 </confidence>
```

模型在生成每个句子后会评估：
- 这个句子是否被检索结果支持？
- 如果不支持，是知识不确定还是推理错误？
- 是否需要更多检索？

### 3.5.1.3 Self-RAG vs ReAct 对比

| 维度 | ReAct | Self-RAG |
|------|--|--|
| **检索触发** | 由 Agent 的 Thought 决定（显式） | 由 Critique Token 自动触发（隐式） |
| **检索决策粒度** | 每次循环一次（粗粒度） | 每个生成步骤前（细粒度） |
| **结果评价** | ❌ 无，直接用于生成 | ✅ relevance + support 双重评价 |
| **引用追溯** | ❌ 不直接支持 | ✅ 每句可追溯来源 |
| **置信度输出** | ❌ 不直接输出 | ✅ 每句置信度 + 整体置信度 |
| **Token 效率** | 中（每次循环都需要 LLM 调用） | 高（不需检索时跳过检索步骤） |
| **延迟** | 中（多轮 LLM 调用） | 中-低（条件性跳过检索） |
| **复杂度** | 中 | 高（需要微调模型） |
| **训练成本** | 无（零样本可用） | 高（需要专门微调模型） |
| **适用场景** | 通用 Agent | 需要高精度 + 可解释性的场景 |

**核心差异一句话总结**：ReAct 是"手动控制"——Agent 每一步都主动决定是否检索；Self-RAG 是"自动控制"——模型内置了检索决策、结果评价、置信评估的完整闭环，更加自动化但需要专门的模型微调。

### 3.5.1.4 优缺点分析

**优点**：
- **Token 效率高**：对于内部知识足够的问题，完全跳过检索步骤，减少 30-50% 的 Token 消耗
- **可解释性强**：每句话都有支持度标记和置信度，便于审计和调试
- **抗噪声能力强**：检索结果会被评价过滤，噪声片段不会污染生成
- **自动纠错**：生成过程中检测到 unsupported 内容时自动触发反思循环

**缺点**：
- **需要模型微调**：原版 Self-RAG 需要在特定数据集上微调模型以学习 Critique Tokens，成本高
- **依赖模型能力**：模型的检索决策质量受模型本身能力影响
- **评价阶段额外成本**：每次检索后增加 LLM 调用进行评价
- **实现复杂度高**：相比 ReAct 的简单 Thought-Action-Observation 循环，Self-RAG 有 5-6 个阶段的复杂管线

**适用场景**：
- ✅ 需要高精度、可追溯的专业问答系统
- ✅ 对幻觉零容忍的场景（医疗、法律、金融）
- ✅ 检索噪声大的场景（大量不相关文档的混合库）
- ❌ 快速原型 / MVP 阶段（需要先验证需求）

---

## 3.5.2 CRAG（Corrective RAG）

### 3.5.2.1 核心思想

**CRAG**（Corrective RAG）的核心思想与 Self-RAG 有本质不同：CRAG 采用**先检索、后评估、再补救**的策略。它不跳过检索，而是在检索后增加一个**轻量级评估器**来检测检索内容的质量。如果质量差，则触发补救措施（Web Search、重新分块、扩展查询、多策略检索等）。

```
CRAG 核心流程：

用户查询 → 检索 → 质量评估器
                      │
              ┌───────┴───────┐
              │               │
         质量合格        质量不合格
              │               │
              ▼               ▼
          直接生成      触发补救措施
                        │
                   ┌────┴────┐
                   │ 补救策略  │
                   │         │
              Web Search  重新分块
              扩展查询    多策略检索
                        │
                        ▼
                   重新检索 → 评估
                   （直至质量合格）
```

### 3.5.2.2 质量评估器实现

评估器不需要是强大的 LLM，一个轻量级模型即可：

```python
class RetrievalEvaluator:
    """轻量级检索质量评估器"""
    
    def __init__(self, evaluator_model="cross-encoder/ms-marco-MiniLM-L-6-v2"):
        # 可选：使用 Cross-Encoder 或 7B 级别的小模型
        self.evaluator = load_evaluator(evaluator_model)
    
    def evaluate(self, query: str, chunks: list) -> float:
        """返回 0-1 的质量分数"""
        scores = []
        for chunk in chunks[:3]:  # 只看 Top 3
            score = self.evaluator.score(query, chunk)
            scores.append(score)
        return max(scores)  # 取最高分作为整体质量
    
    def should_retrieve_again(self, query: str, chunks: list, threshold: float = 0.5) -> bool:
        """质量低于阈值时触发重新检索"""
        quality = self.evaluate(query, chunks)
        return quality < threshold
```

### 3.5.2.3 补救措施详解

| 补救策略 | 适用场景 | 说明 |
|------|--|--|
| **Web Search** | 知识库无相关内容 | 转向外部搜索引擎 |
| **查询扩展** | 关键词不够精确 | 用 LLM 扩展同义词和变体 |
| **多策略检索** | 单一检索方式不够 | 同时跑向量 + BM25 + 图谱 |
| **重新分块** | chunk 粒度不合适 | 调整分块大小或重叠 |
| **降级检索** | 高级检索失败 | 回到简单向量检索 |

### 3.5.2.4 CRAG vs Self-RAG 对比

| 维度 | Self-RAG | CRAG |
|------|--|--|
| **检索策略** | 选择性检索（可能跳过） | 必检索 + 质量评估 |
| **评估方式** | LLM 自评价（Critique Tokens） | 轻量级分类器/Cross-Encoder |
| **补救措施** | 自反思循环（重新检索+反思） | 多策略补救链 |
| **额外成本** | 每次检索后需要 LLM 评价 | 轻量模型评价，成本低 |
| **延迟** | 中高 | 低-中 |
| **实现难度** | 高（需要微调模型） | 中（可集成现成评估器） |
| **适用场景** | 需要可解释性和高准确率 | 需要低延迟和低成本 |

---

## 3.5.3 Plan-and-Execute 深化

### 3.5.3.1 Planner 阶段详解

**Planner 的核心职责**：将复杂任务拆解为可执行的步骤序列，并分析步骤间依赖关系。

```python
PLAN_PROMPT = """
你是一个规划专家。将以下任务分解为可执行的步骤。

任务：{query}

要求：
- 每个步骤必须可执行
- 步骤之间有关联依赖
- 考虑使用哪些工具
- 标注每个步骤的预期输入和输出

输出格式（JSON）：
{{"steps": [
  {{"step": 1, "action": "工具名", "input": "描述", "output": "描述", "depends_on": null}},
  {{"step": 2, "action": "工具名", "input": "步骤1的输出", "output": "描述", "depends_on": 1}},
  ...
]}}
"""

# 示例输出：
# {{
#   "steps": [
#     {{"step": 1, "action": "vector_search", "input": "关键词", "output": "Top 5 chunks", "depends_on": null}},
#     {{"step": 2, "action": "sql_query", "input": "SQL语句", "output": "结构化数据", "depends_on": null}},
#     {{"step": 3, "action": "combine_and_analyze", "input": "步骤1+步骤2结果", "output": "综合分析", "depends_on": [1, 2]}},
#     {{"step": 4, "action": "generate_answer", "input": "步骤3结果", "output": "最终答案", "depends_on": 3}}
#   ]
# }}
```

### 3.5.3.2 步骤依赖分析与并行执行

Planner 需要输出依赖关系图，从而确定哪些步骤可以并行：

```
依赖图分析：

Step 1 [vector_search] ──┐
                           ├──→ Step 3 [combine] → Step 4 [generate]
Step 2 [sql_query] ───────┘

并行组1：Step 1 + Step 2（无依赖，可并行）
串行组：  Step 3 → Step 4（有依赖，必须串行）

执行时间对比：
- 串行执行：3s + 2s + 5s + 3s = 13s
- 并行执行：max(3s, 2s) + 5s + 3s = 11s（节省约 15%）
```

### 3.5.3.3 Executor 阶段设计

```python
class PlanExecutor:
    """执行规划好的步骤序列"""
    
    def __init__(self, planner_llm, executor_llm, tools):
        self.planner_llm = planner_llm
        self.executor_llm = executor_llm
        self.tools = tools
    
    def execute(self, query: str) -> str:
        # Step 1: Planner 生成计划
        plan = self.planner_llm.generate(PLAN_PROMPT.format(query=query))
        plan = json.loads(plan)
        
        # Step 2: 构建依赖图
        dep_graph = self._build_dependency_graph(plan["steps"])
        
        # Step 3: 按拓扑排序执行
        completed = {{}}
        for step in dep_graph.topological_sort():
            # 等待依赖完成
            deps = step.get("depends_on", [])
            if deps:
                dep_results = {{d: completed[d] for d in deps}}
                inputs = self._merge_dep_results(dep_results, step["input"])
            else:
                inputs = step["input"]
            
            # 执行步骤
            result = self._execute_step(step, inputs)
            completed[step["step"]] = result
            
            # 错误处理：步骤失败则重试或降级
            if result.get("status") == "error" and step.get("retry_count", 0) < 2:
                step["retry_count"] = step.get("retry_count", 0) + 1
                continue  # 重试
            
            if result.get("status") == "error":
                return self._fallback_to_simple_rag(query)
        
        # Step 4: 生成最终答案
        final = self.executor_llm.generate(f"""
        基于以上所有步骤的结果，生成最终回答。
        步骤结果：{json.dumps(completed, ensure_ascii=False)}
        原始查询：{query}
        """)
        return final
    
    def _fallback_to_simple_rag(self, query: str) -> str:
        """降级到简单 RAG"""
        chunks = vector_store.search(query, k=5)
        answer = self.executor_llm.generate(f"""
        基于以下信息回答用户问题：
        查询：{query}
        信息：{chunks}
        如果信息不足，请明确说明无法回答。
        """)
        return answer
```

### 3.5.3.4 Plan-and-Execute vs ReAct 详细对比

| 维度 | ReAct | Plan-and-Execute |
|------|--|--|
| **控制方式** | 每步动态决策 | 一次性规划全部步骤 |
| **错误恢复** | 回退到上一步重试 | 可能需要重新规划 |
| **并行性** | 难以并行（每步依赖前一步） | 可并行独立步骤 |
| **超长链路** | 不稳定（累积误差） | 稳定（规划阶段保证一致性） |
| **灵活性** | 高（根据中间结果调整） | 中（规划后相对固定） |
| **Token 消耗** | 中（每步少量） | 低-中（规划一次性生成） |
| **调试难度** | 中（每步可观测） | 高（需要对比预期与实际的差距） |
| **适用场景** | 中等复杂度、需要灵活调整 | 超长链路（10+ 步）、强一致性 |
| **不适用场景** | 不适合 >20 步的超长链路 | 简单查询（过度工程化） |

**选择建议**：
- **短链路（<5 步）**：ReAct 足够
- **中等链路（5-10 步）**：Plan-and-Execute 更稳定
- **超长链路（>10 步）**：Plan-and-Execute 是必须

---

## 3.5.4 模式选型决策树

```
你的任务复杂度？
    │
    ├─ 简单查询（<3步）
    │   └──► ReAct（最轻量）
    │
    ├─ 需要选择性检索
    │   ├─ 有微调模型 → Self-RAG
    │   └─ 无微调模型 → CRAG
    │
    ├─ 需要多步强一致性
    │   ├─ 5-10步 → Plan-and-Execute
    │   └─ >10步 → Plan-and-Execute（必须）
    │
    ├─ 需要自我纠错
    │   └──► Reflexion 框架
    │
    └─ 不确定
        └──► 先用 ReAct 打底
            └──► 根据指标缺口逐步升级
```

---

## 第四部分：多代理 RAG 系统

### 4.1 多代理架构设计

**架构模式对比**：

| 模式 | 描述 | 适用场景 | 复杂度 |
|------|--|------|--|
| **管道式** | Agent 按顺序串联执行 | 线性任务 | 低 |
| **分层式** | 上层 Agent 调度下层 Agent | 复杂任务分解 | 中 |
| **网状式** | Agent 之间自由通信 | 需要灵活协作 | 高 |
| **主从式** | 一个 Master Agent 调度所有 | 任务调度 | 中 |

```
管道式:  Agent1 → Agent2 → Agent3 → 输出
分层式:     Agent-Manager
           /     |      \
      Agent-A  Agent-B  Agent-C
主从式:     Agent-Manager (决策)
         ↙         |         ↘
    Agent-SQL  Agent-Vector  Agent-Search
```

### 4.2 代理角色模式

| 角色 | 职责 | 工具 |
|------|--|------|
| **检索 Agent** | 负责信息检索 | 向量库、图谱、搜索引擎 |
| **分析 Agent** | 负责数据分析 | SQL、计算器、Python |
| **推理 Agent** | 负责逻辑推理 | 无（纯 LLM） |
| **生成 Agent** | 负责答案生成 | 模板、LLM |
| **验证 Agent** | 负责答案质量检查 | 验证规则、交叉检查 |
| **编排 Agent** | 负责任务调度 | 状态机、工作流引擎 |

### 4.3 经典框架对比

| 维度 | LangGraph | AutoGen | CrewAI |
|------|--|------|--|
| **核心模型** | 图状态机 | 多代理对话 | 角色驱动 |
| **编程模型** | 节点+边+状态 | 对话+GroupChat | Agent+Task+Crew |
| **HITL** | 原生支持 | 支持 | 支持 |
| **Checkpoint** | 原生 | 需手动 | 需手动 |
| **可视化** | 支持 | 有限 | 有限 |
| **学习曲线** | 中 | 中 | 低 |
| **适合场景** | 复杂工作流 | 多代理对话 | 快速原型 |

### 4.4 代理通信与协调机制

| 模式 | 说明 | 优缺点 |
|------|--|------|
| **直接通信** | Agent → Agent 直接消息 | 简单但耦合度高 |
| **广播** | 所有 Agent 接收所有消息 | 解耦但冗余高 |
| **路由** | 通过 Router 分发消息 | 灵活但 Router 复杂 |
| **发布-订阅** | Agent 发布事件，订阅者响应 | 完全解耦但调试难 |

---

## 4.5 多代理协作架构详解（Advanced Patterns）

### 4.5.1 中心化架构（Manager-Workers / Supervisor）

**架构设计**：

```
                    ┌───────────────────────┐
                    │   Supervisor Agent     │
                    │   (理解任务 → 分解 → 调度) │
                    └───────┬─────┬─────────┘
                            │
              ┌──────────────┼───────────────┐
              ▼               ▼                 ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │ Worker A   │  │ Worker B  │  │ Worker C  │
     │ (检索专员)  │  │ (分析专员)  │  │ (生成专员)  │
     │ 工具:向量库 │  │ 工具:SQL/  │  │ 工具:模板 │
     │       图谱  │  │ 计算器/代码│  │           │
     └───────────┘  └───────────┘  └───────────┘
              │                 │                 │
              └───────────────┬────────────────┘
                            ▼
                    ┌───────────────────────┐
                    │   结果汇聚 → 验证 → 输出  │
                    └────────────────────────┘
```

**Supervisor Agent 的决策逻辑**：

```python
SUPERVISOR_PROMPT = """
你是任务调度主管。接收到的任务是：{task}

当前可用 Worker：
- {worker_descriptions}

你的职责：
1. 理解任务需求
2. 选择执行策略（单 Worker / 并行 / 串行）
3. 分配子任务给 Worker
4. 聚合 Worker 返回的结果
5. 验证最终输出质量

输出格式（JSON）：
{{{{
  "strategy": "single/parallel/serial",
  "assignments": [
    {{{{"worker": "WorkerA", "task": "描述", "depends_on": null}}}},
    {{{{"worker": "WorkerB", "task": "描述", "depends_on": null}}}}
  ],
  "aggregation": "如何合并结果"
}}}}
"""
```

**LangGraph Supervisor Pattern 实现**：

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal

class SupervisorState(TypedDict):
    task: str
    strategy: str
    assignments: list
    worker_results: list
    final_answer: str

def supervisor_node(state: SupervisorState) -> dict:
    """Supervisor 节点：决定分发策略"""
    response = llm.generate(SUPERVISOR_PROMPT.format(
        task=state["task"],
        worker_descriptions=describe_workers()
    ))
    plan = json.loads(response)
    return {{"strategy": plan["strategy"], "assignments": plan["assignments"]}}

def route_workers(state: SupervisorState) -> Literal["parallel", "serial", "aggregate"]:
    if state["strategy"] == "parallel":
        return "parallel"
    else:
        return "serial"

workflow = StateGraph(SupervisorState)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("worker_pool", worker_node)
workflow.add_conditional_edges("supervisor", route_workers)
workflow.add_edge("worker_pool", "aggregate")
workflow.add_edge("aggregate", END)
```

### 4.5.2 去中心化/链式架构（Pipeline）

**架构设计**：

```
查询输入
    │
    ▼
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Step 1:  │───→│ Step 2:  │───→│ Step 3:  │───→│ Step 4:  │
│ 意图分类  │    │ 检索 Agent│    │ 分析 Agent│    │ 生成 Agent│
│ (7B 模型) │    │ (向量+SQL)│    │ (LLM)    │    │ (LLM)    │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
    │              │              │              │
    ▼              ▼              ▼              ▼
  [路由标签]    [检索结果]    [分析结果]    [最终答案]
```

**各站职责明确，接口标准化**：

```python
# 每站的输入输出格式统一
class PipelineMessage(TypedDict):
    input_query: str           # 原始查询
    intent: str               # 意图标签（Step 1 输出）
    retrieved_docs: list      # 检索结果（Step 2 输出）
    analysis: dict            # 分析结果（Step 3 输出）
    final_answer: str         # 最终答案（Step 4 输出）
    metadata: dict            # 元数据（延迟、token 等）

# 各站之间通过标准格式传递数据
# 每站独立、可单独替换、可单独测试
```

**适用场景**：标准化流程任务、每个环节职责单一明确、需要独立扩放各站。

### 4.5.3 动态协作架构（Dynamic / Emergent Collaboration）

**架构设计**：

```
Agent A (检索专家) ──┐
                       ├──→ [能力注册中心] ──→ 动态路由 ──→ Agent C
Agent B (分析专家) ──┘                              (按需发现)
Agent D (搜索专家) ──┘

Agent 注册能力 → 查询者根据能力需求自动匹配
```

**Agent Registry（能力注册中心）**：

```python
class AgentRegistry:
    """Agent 能力注册与发现"""
    
    _registry = {{}}
    
    @classmethod
    def register(cls, agent_name: str, capabilities: list, 
                 model: str = "gpt-4o"):
        cls._registry[agent_name] = {{
            "capabilities": capabilities,  # 能做什么
            "model": model,                # 用的模型
            "latency_ms": 500,            # 预估延迟
            "status": "available"
        }}
    
    @classmethod
    def find_agents(cls, required_capabilities: list) -> list:
        """根据所需能力查找匹配的 Agent"""
        matches = []
        for name, info in cls._registry.items():
            if all(cap in info["capabilities"] for cap in required_capabilities):
                matches.append((name, info))
        return sorted(matches, key=lambda x: x[1]["latency_ms"])

# 注册
AgentRegistry.register("retrieval_agent", ["vector_search", "sql_query", "graph_query"])
AgentRegistry.register("analysis_agent", ["data_analysis", "code_execution", "visualization"])
AgentRegistry.register("generation_agent", ["answer_generation", "report_writing"])

# 动态查找
needed = ["vector_search", "data_analysis"]
candidates = AgentRegistry.find_agents(needed)
# → [("retrieval_agent", ...), ("analysis_agent", ...)]
```

### 4.5.4 混合架构（实际生产推荐）

**大多数生产系统不是纯中心化或纯去中心化，而是混合的**：

```
┌────────────────────────────────────┐
│          Manager (高层调度)         │
│     理解任务 → 分解 → 选择架构      │
└───────────┬───────────┬───────────┘
            │
    ┌───────┴────────┐
    ▼                ▼
┌────────────┐  ┌────────────┐
│  链式流水线  │  │ 动态协作网  │
│ (标准化任务) │  │ (探索性任务)│
│            │  │            │
│ Step1 → 2→3│  │ Agent A ↔ B │
│            │  │     ↔ C    │
└────────────┘  └────────────┘
```

### 4.5.5 代理间通信协议

| 维度 | 同步通信 | 异步通信 |
|------|--|--|
| **适用场景** | 需要即时结果 | 独立任务、解耦 |
| **延迟** | 中-高（等待返回） | 低（发送即走） |
| **复杂度** | 低 | 高（需要回调/重试） |
| **容错** | 直接失败 | 需要重试和死信队列 |
| **典型实现** | HTTP/gRPC | MQ/Event Bus |

---

## 第五部分：工具生态与集成

### 5.1 工具定义与管理

工具是 Agent 执行任务的手段。定义工具的标准格式：

```python
# LangChain 工具定义
from langchain_core.tools import tool

@tool
def search_knowledge_base(query: str, top_k: int = 5) -> str:
    """在知识库中搜索文档片段。

    Args:
        query: 搜索关键词
        top_k: 返回结果数量，默认 5

    Returns:
        搜索结果文本
    """
    ...
```

### 5.2 RAG 生态工具

| 工具类型 | 代表 | Agent 集成方式 |
|------|--|--|
| **向量数据库** | Milvus、Pinecone | API 调用 / LangChain Tool |
| **知识图谱** | Neo4j | Cypher 查询工具 |
| **搜索引擎** | DuckDuckGo、Bing | API 集成 |
| **SQL 数据库** | MySQL、PostgreSQL | 参数化查询工具 |
| **代码执行** | Jupyter、E2B | 沙箱执行工具 |
| **API 调用** | HTTP 请求 | 通用 HTTP 工具 |
| **计算器** | Python eval / Wolfram | 数学计算工具 |
| **文件操作** | 读写文件 | 文件操作工具 |

### 5.3 工具选择与编排

**编排模式**：

```
线性: A → B → C
并行: A  B  C → 聚合
条件: if X → A else → B
循环: → A → 检查 → 是 → A → ...
子代理: A → 委托给 B → B 的结果 → A 继续
```

---

## 第六部分：Agentic RAG 评估与优化

### 6.1 Agentic RAG 评估指标体系

| 维度 | 指标 | 说明 |
|------|--|------|
| **检索质量** | Recall@K, MRR, NDCG | 同传统 RAG |
| **推理质量** | 多步推理准确率 | 每步推理的正确率 |
| **工具使用** | Tool Success Rate | 工具调用成功率 |
| **生成质量** | Faithfulness, Answer Relevance | 同传统 RAG |
| **Agent 特有** | Step Accuracy, Loop Detection | Agent 特有指标 |

### 6.2 延迟与成本分析

**延迟分解**：

| 阶段 | 延迟 | 说明 |
|------|--|------|
| 思考（Thought） | 500-2000ms | LLM 推理 |
| 行动（Action） | 10-500ms | 工具调用 |
| 观察（Observation） | 10-500ms | 等待返回 |
| 反思（Reflection） | 500-2000ms | 自我评估 |
| **总计（典型 5 步）** | **5-15 秒** | |

**成本模型**：

| 阶段 | GPT-4o 成本估算 |
|--|------|
| 每次 Thought | ~$0.003-0.01（1-2K tokens） |
| 每次 Action | ~$0（工具调用不额外收费） |
| 每次 Observation | ~$0（工具返回给 LLM 的 tokens） |
| **典型 5 步 Agent** | **$0.015-0.05/查询** |

### 6.3 失败率分析与缓解（90% 失败率根因）

**90% 失败率的数据**：
- 研究表明，多步 Agent 系统在实际生产中约 90% 的失败源于链式失败累积
- 每步 95% 成功率 × 10 步 = 59.9%

**失败场景分类**：

| 失败类型 | 占比 | 原因 | 缓解 |
|------|--|------|--|
| 工具选择错误 | 25% | LLM 选了错误的工具 | 工具描述优化、Few-shot 示例 |
| 工具调用参数错误 | 20% | 参数格式不对 | JSON Schema 校验 |
| 工具执行失败 | 15% | API 错误、超时 | 重试机制 |
| 推理错误 | 20% | Thought 步骤出错 | Self-Consistency、Reflexion |
| 信息不足 | 10% | 无法回答的场景 | 明确说明"不知道" |
| 循环 | 5% | Agent 重复执行 | 循环检测 |
| 上下文溢出 | 5% | 超过 Token 限制 | 记忆压缩 |

### 6.4 生产化部署策略

- **监控**：Agent 步骤日志、工具调用日志、延迟追踪
- **安全**：工具权限、沙箱执行、输入验证
- **灰度发布**：先对少量用户启用 Agent，逐步放量
- **降级**：Agent 超时 → 回到 Hybrid RAG

---

## 6.5 并行执行策略（Parallel Execution）

### 6.5.1 哪些步骤可以并行

| 并行组 | 说明 | 风险 |
|------|--|--|
| **多关键词向量检索** | 不同关键词的检索互不依赖 | 低 |
| **多表 SQL 查询** | 不同表的查询可并行 | 低 |
| **多个外部 API 调用** | 独立 API 可并行 | 中（结果聚合复杂） |
| **多个 Worker Agent 的独立任务** | Manager 分发的不依赖任务 | 低 |
| **检索结果重排序** | 不同 reranker 并行跑 | 中（资源消耗） |

### 6.5.2 依赖分析

```
任务依赖图：
  [检索向量] ──┐
               ├──→ [合并结果] ──→ [重排序] ──→ [生成]
  [检索SQL] ───┘              ↑
                              │
              [图谱查询] ──────┘

可并行组1：[检索向量] + [检索SQL] + [图谱查询]
可并行组2：[重排序]（如果用了多个 reranker）
不能并行：[合并结果] → [重排序] → [生成]（必须串行）
```

### 6.5.3 并行工具调用实现

```python
import asyncio
from typing import List, Any

async def parallel_tool_calls(tools_calls: list) -> list:
    """并行执行多个工具调用"""
    async def execute(tool_call):
        if tool_call["name"] == "vector_search":
            return await vector_store.asearch(tool_call["args"])
        elif tool_call["name"] == "sql_query":
            return await db.aseq(tool_call["args"])
        elif tool_call["name"] == "graph_query":
            return await graph.cquery(tool_call["args"])
    
    # 并行执行
    results = await asyncio.gather(
        *[execute(tc) for tc in tools_calls],
        return_exceptions=True
    )
    
    # 处理异常
    return [
        r if not isinstance(r, Exception) else f"Error: {{r}}"
        for r in results
    ]

# 使用
tasks = [
    {{"name": "vector_search", "args": {{"query": "A公司", "top_k": 5}}}},
    {{"name": "sql_query", "args": {{"sql": "SELECT ..."}}}},
    {{"name": "graph_query", "args": {{"cypher": "MATCH ..."}}}},
]
results = await parallel_tool_calls(tasks)
```

---

## 6.6 短路机制（Early Termination）

### 6.6.1 提前终止条件

| 条件 | 判定方式 | 阈值 |
|------|--|--|
| **检索质量极高** | 最高相关度 > 0.95 且信息充分 | cosine > 0.95 |
| **多源信息一致** | 3+ 独立源给出相同信息 | 一致性 > 0.9 |
| **Agent 高置信度** | LLM 输出 confidence > 0.9 | confidence > 0.9 |
| **已获取充分证据** | 证据数量 > 最低要求 | evidence_count ≥ 3 |

### 6.6.2 置信度评估实现

```python
def should_terminate(state: AgentState) -> tuple:
    """判断是否可以提前终止"""
    
    # 条件 1：最高检索分数足够高
    if state["retrieved_docs"]:
        max_score = max(d["score"] for d in state["retrieved_docs"])
        if max_score > 0.95:
            return True, f"检索质量极高（max_score={{max_score:.3f}}）"
    
    # 条件 2：多源一致
    if len(state["retrieved_docs"]) >= 3:
        sources = set(d.get("source") for d in state["retrieved_docs"])
        if len(sources) >= 3:
            consistency = calculate_consistency(state["retrieved_docs"])
            if consistency > 0.9:
                return True, f"多源一致（一致性={{consistency:.3f}}）"
    
    # 条件 3：Agent 高置信度
    if state.get("confidence") and state["confidence"] > 0.9:
        return True, f"Agent 高置信度（{{state['confidence']:.3f}}）"
    
    return False, "不满足终止条件"


# 在 ReAct 循环中加入短路检查
def react_loop(state):
    for step in range(MAX_STEPS):
        # ... 执行 Thought-Action-Observation
        
        # 短路检查
        can_stop, reason = should_terminate(state)
        if can_stop:
            print(f"✅ 短路：{{reason}}")
            return generate_final_answer(state)  # 提前返回
    
    return generate_final_answer(state)  # 正常终止
```

---

## 6.7 小模型替代策略（Model Sizing）

### 6.7.1 模型选择决策表

| 环节 | 推荐模型 | 理由 | GPT-4o 成本对比 |
|------|--|--|----|
| **意图分类/路由** | 7B 本地模型（Qwen2.5-7B） | 分类任务简单，7B 足够 | ~1/50 成本 |
| **简单工具选择** | 14B 本地模型 | 工具选择需要一定推理 | ~1/25 成本 |
| **简单答案生成** | 14B/70B 本地模型 | 知识性回答不需要顶级模型 | ~1/10-1/100 |
| **复杂推理/分析** | GPT-4o / Claude Sonnet | 复杂推理需要强模型 | 基准 |
| **最终答案生成** | GPT-4o / Claude Opus | 最终输出质量最关键 | 基准 |
| **检索结果评分** | Cross-Encoder（非 LLM） | 排序用专用模型更高效 | ~0 成本 |

### 6.7.2 混合模型架构示例

```
用户查询
    │
    ▼
┌───────────────┐
│  7B 模型        │  ← 意图分类（快速、便宜）
│  分类：金融分析  │
└──────┬───────┘
       │
    ┌────┐
    │ 并行执行  │
    │ (小模型)  │
    │         │
    │ 向量检索 │──→ Cross-Encoder 评分
    │ SQL查询  │──→ 14B 初步分析
    │ 图谱查询  │──→ 14B 关联分析
    └───┬───┘
       │
    ┌────┐
    │ 70B /   │  ← 复杂推理
    │ GPT-4o   │     （关键决策）
    │ 最终生成  │
    └─────────┘
```

### 6.7.3 成本对比

| 策略 | 单次查询成本（估算） | 延迟（P50） |
|------|----|--|
| **全用 GPT-4o** | $0.02-0.05 | 8-15s |
| **7B 分类 + GPT-4o 生成** | $0.01-0.03 | 5-10s |
| **全部本地 14B** | $0.001-0.005 | 3-8s |
| **全部本地 70B** | $0.005-0.02 | 5-12s |
| **混合（7B→14B→GPT-4o）** | $0.008-0.02 | 4-8s |

---

## 6.8 Agent 专属评估指标体系（Agentic Evaluation）

### 6.8.1 工具调用准确率（Tool Call Accuracy）

**三层评估**：

```
工具调用准确率 = 工具选择正确率 × 参数完整率 × 参数语义正确率

三层逐级过滤：
Layer 1: 选了哪个工具？ → 选对了吗？
Layer 2: 参数给全了吗？ → 格式对吗？
Layer 3: 参数值对吗？ → 语义合理吗？
```

**评估指标分解**：

| 指标 | 计算方式 | 目标值 |
|------|--|--|
| **工具选择准确率** | 正确工具选择数 / 总工具调用数 | >90% |
| **参数完整性** | 非空必填参数数 / 总必填参数数 | >95% |
| **参数语义正确率** | 语义正确的参数值 / 总参数值 | >85% |
| **工具执行成功率** | 成功执行数 / 总调用数 | >95% |

**评估脚本**：

```python
class ToolCallEvaluator:
    """工具调用评估器"""
    
    def __init__(self, golden_dataset: list):
        self.golden = golden_dataset  # [{query, expected_tool, expected_params}, ...]
    
    def evaluate(self, agent_traces: list) -> dict:
        """批量评估 Agent 的工具调用"""
        results = []
        
        for trace, golden in zip(agent_traces, self.golden):
            tool_correct = trace["tool_name"] == golden["expected_tool"]
            
            param_missing = sum(
                1 for k, v in golden["expected_params"].items()
                if k not in trace.get("params", {{}}) or not trace["params"].get(k)
            )
            param_complete = 1 - param_missing / max(len(golden["expected_params"]), 1)
            
            results.append({{
                "query": golden["query"],
                "tool_correct": tool_correct,
                "param_complete": param_complete,
                "overall_correct": tool_correct and param_complete > 0.8
            }})
        
        return {{
            "tool_accuracy": sum(1 for r in results if r["tool_correct"]) / len(results),
            "param_completeness": sum(r["param_complete"] for r in results) / len(results),
            "overall_accuracy": sum(1 for r in results if r["overall_correct"]) / len(results),
        }}
```

### 6.8.2 轨迹正确性分析（Trajectory Analysis）

**评估维度**：

```
Agent 轨迹评估：
    │
    ├─ 路径合理性：步骤是否符合逻辑？
    ├─ 最短路径：与黄金路径步数对比
    ├─ 冗余步骤：有无不必要的操作？
    └─ 错误步骤：哪一步导致最终错误？
```

**轨迹对比方法**：

| 方法 | 说明 | 适用场景 |
|------|--|--|
| **Levenshtein 距离** | 计算两个 action sequence 的最小编辑距离 | 通用对比 |
| **子序列匹配** | 黄金路径是否是子序列 | 验证是否按最优路径走 |
| **关键步骤覆盖** | 黄金路径的关键步骤是否都执行了 | 验证核心步骤 |
| **人工评审** | 专家标注最优路径，人工对比 | 小批量精评 |

**可视化对比**：

```
黄金路径 vs Agent 实际路径对比：

黄金路径：检索向量 → 检索SQL → 合并分析 → 生成
Agent路径：检索向量 → [错误：查了图谱] → 检索SQL → 合并分析 → 生成

  检索向量     ████████████  ✅ 匹配
  查图谱       ████████████  ❌ 冗余（黄金路径无此步）
  检索SQL      ████████████  ✅ 匹配
  合并分析     ████████████  ✅ 匹配
  生成         ████████████  ✅ 匹配

结论：Agent 多走了 1 步（查图谱），但不影响最终结果
```

### 6.8.3 循环检测与终止率（Loop Detection & Termination）

**循环类型与检测**：

```python
class LoopDetector:
    """循环检测器"""
    
    def __init__(self, max_steps=20):
        self.max_steps = max_steps
        self.action_hashes = {{}}  # (action, state_hash) → [steps]
        self.info_entropy_history = []
    
    def check_loop(self, action: str, observation: str, step: int) -> dict:
        """检查当前步是否形成循环"""
        
        # 1. 精确状态重复检测（死循环）
        state_key = hash((action, observation))
        if state_key in self.action_hashes:
            repeated_steps = self.action_hashes[state_key]
            return {{
                "type": "dead_loop",
                "repeated_at": repeated_steps + [step],
                "severity": "high"
            }}
        self.action_hashes[state_key] = [step]
        
        # 2. 信息熵衰减检测（渐近无效）
        current_entropy = self._calculate_entropy(observation)
        self.info_entropy_history.append(current_entropy)
        if len(self.info_entropy_history) > 3:
            recent = self.info_entropy_history[-3:]
            if all(recent[i] > recent[i+1] for i in range(len(recent)-1)):
                if recent[-1] < 0.1:  # 信息增量趋近于0
                    return {{
                        "type": "asymptotically_invalid",
                        "entropy_trend": recent,
                        "severity": "medium"
                    }}
        
        # 3. 步数超限（振荡保护）
        if step >= self.max_steps:
            return {{
                "type": "step_limit",
                "step": step,
                "severity": "low"
            }}
        
        return {{"type": "none"}}

# 终止率指标计算
def calculate_termination_rates(all_trajectories: list) -> dict:
    normal = sum(1 for t in all_trajectories if t["termination"] == "normal")
    timeout = sum(1 for t in all_trajectories if t["termination"] == "timeout")
    loop = sum(1 for t in all_trajectories if t["termination"] == "loop_detected")
    early = sum(1 for t in all_trajectories if t["termination"] == "early_terminate")
    total = len(all_trajectories)
    
    return {{
        "normal_rate": normal / total,
        "timeout_rate": timeout / total,
        "loop_rate": loop / total,
        "early_terminate_rate": early / total,
        "avg_steps": sum(t["steps"] for t in all_trajectories) / total
    }}
```

### 6.8.4 Agent 评估指标体系总览

| 层级 | 指标 | 目标 |
|------|--|--|
| **检索质量** | Recall@K, MRR, NDCG | Recall@10 > 0.8 |
| **工具质量** | 工具选择准确率、参数完整率 | >90% |
| **推理质量** | 每步推理正确率 | >85% |
| **生成质量** | Faithfulness, Answer Relevance | >0.8 |
| **Agent 特有** | 轨迹最优率、循环率、短路率 | 循环率 <1% |
| **效率** | 平均步数、Token 效率、P95 延迟 | 按需定义 |

### 6.8.5 自动化评估流水线

```
模型/工具变更
    │
    ▼
触发回归测试
    │
    ├─► 运行 golden test set（500+ 测试用例）
    │     ├─ 工具调用准确率评估
    │     ├─ 轨迹对比分析
    │     ├─ 生成质量评估（RAGAS）
    │     └─ 性能基准测试
    │
    ├─► A/B 测试（线上流量分流）
    │     ├─ 对照组：原版本
    │     └─ 实验组：新版本
    │
    └─► 指标对比
          ├─ 通过：部署上线
          └─ 不通过：回滚 + 修复
```

---

### 7.1 ReAct Agent 完整实现（从零）

```python
import json
from typing import List, Dict, Any
from openai import OpenAI

class ReActAgent:
    """从零实现的 ReAct Agent"""
    
    def __init__(self, llm_client: OpenAI, tools: List[Dict], 
                 max_iterations: int = 10, system_prompt: str = None):
        self.llm = llm_client
        self.tools = tools
        self.max_iterations = max_iterations
        self.history = []  # 对话历史
        
        # 工具名称 → 函数映射
        self.tool_map = {}
        for tool in tools:
            self.tool_map[tool["name"]] = tool["function"]
    
    def add_tool_definitions(self):
        """构建工具定义（用于 system prompt）"""
        return [
            {
                "type": "function",
                "function": {
                    "name": t["name"],
                    "description": t["description"],
                    "parameters": t["parameters"]
                }
            }
            for t in self.tools
        ]
    
    def execute_tool(self, tool_name: str, arguments: Dict) -> str:
        """执行工具调用"""
        if tool_name not in self.tool_map:
            return f"错误：未知工具 {tool_name}"
        try:
            result = self.tool_map[tool_name](**arguments)
            return json.dumps(result, ensure_ascii=False)
        except Exception as e:
            return f"错误：{str(e)}"
    
    def run(self, query: str) -> str:
        """执行 ReAct 循环"""
        messages = [
            {"role": "system", "content": "你是一个有帮助的助手。"},
            {"role": "user", "content": query}
        ]
        
        for iteration in range(self.max_iterations):
            # Step 1: 调用 LLM
            tool_defs = self.add_tool_definitions()
            response = self.llm.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=tool_defs,
                tool_choice="auto"
            )
            
            choice = response.choices[0]
            
            # Step 2: 检查是否有工具调用
            if choice.message.tool_calls:
                for tool_call in choice.message.tool_calls:
                    tool_name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    # 记录 Thought
                    messages.append({
                        "role": "assistant",
                        "content": f"Thought: 我需要调用 {tool_name} 工具，参数：{args}"
                    })
                    
                    # 执行 Action
                    result = self.execute_tool(tool_name, args)
                    
                    # 记录 Observation
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result
                    })
                    
            elif choice.message.content:
                # Step 3: 直接生成答案
                return choice.message.content
        
        return "错误：超过最大迭代次数"
```

### 7.2 LangGraph 多代理 RAG 管线

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
import operator

# 定义状态
class AgentState(TypedDict):
    query: str
    agent_output: str
    intermediate_steps: Annotated[list, operator.add]
    needs_retrieval: bool
    retrieved_docs: list
    needs_human_approval: bool

# 定义节点
def agent_node(state: AgentState) -> dict:
    """Agent 节点：决定下一步"""
    # ... 调用 LLM 决定
    return {"intermediate_steps": [(Thought("需要检索"), "retrieval")]}

def retrieval_node(state: AgentState) -> dict:
    """检索节点"""
    docs = vector_store.search(state["query"], k=5)
    return {"retrieved_docs": docs}

def generate_node(state: AgentState) -> dict:
    """生成节点"""
    # ... 生成最终回答
    return {"agent_output": "最终回答..."}

# 定义图
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("retrieval", retrieval_node)
workflow.add_node("generate", generate_node)

# 条件边
def route(state):
    if state["needs_retrieval"]:
        return "retrieval"
    elif state["needs_human_approval"]:
        return "human_review"
    else:
        return "generate"

workflow.add_conditional_edges("agent", route)
workflow.add_edge("retrieval", "agent")
workflow.add_edge("generate", END)

app = workflow.compile(checkpointer=MemorySaver())
```

### 7.3 AutoGen 多代理协作

```python
from autogen import ConversableAgent, GroupChat, GroupChatManager

# 定义 Agent
searcher = ConversableAgent(
    name="Searcher",
    llm_config={"model": "gpt-4o"},
    system_message="你是一个搜索助手，负责检索相关信息。"
)

analyzer = ConversableAgent(
    name="Analyzer",
    llm_config={"model": "gpt-4o"},
    system_message="你是一个数据分析助手，负责分析数据。"
)

writer = ConversableAgent(
    name="Writer",
    llm_config={"model": "gpt-4o"},
    system_message="你是一个写作助手，负责生成最终报告。"
)

# GroupChat
groupchat = GroupChat(agents=[searcher, analyzer, writer], messages=[], max_round=10)
manager = GroupChatManager(groupchat=groupchat, llm_config={"model": "gpt-4o"})

# 执行
searcher.initiate_chat(
    manager,
    message="分析 A 公司近三年的营收趋势"
)
```

---

## 第八部分：决策与选型

### 8.1 Agentic RAG 决策树

```
你的 RAG 需求是什么？
    │
    ├─ 简单知识问答 / FAQ
    │   └──► Hybrid RAG（BM25 + 向量 + RRF）
    │
    ├─ 需要跨文档关联 / 多跳推理
    │   └──► GraphRAG / LazyGraphRAG
    │
    ├─ 需要复杂多步决策
    │   ├─ 需要调用外部工具（SQL / API / 代码）
    │   │   └──► ReAct Agent
    │   ├─ 需要多 Agent 协作
    │   │   ├─ 复杂工作流 → LangGraph
    │   │   ├─ 多代理对话 → AutoGen
    │   │   └─ 快速原型 → CrewAI
    │   └──► ⚠️ 加 HITL（人在回路）节点
    │
    ├─ 需要自我纠正 / 反思
    │   └──► Reflexion 框架
    │
    ├─ 需要全局洞察 / 汇总
    │   └──► GraphRAG Global Search
    │
    └─ 不确定
        └──► 先用 Hybrid RAG 打底
            └──► 根据指标缺口逐步升级
                └──► 必要时引入 Agent
```

### 8.2 技术选型速查表

| 需求 | 推荐 |
|------|------|
| RAG 基础架构 | LlamaIndex 或 LangChain |
| 多代理工作流 | LangGraph |
| 多代理对话 | AutoGen |
| 快速原型 | CrewAI |
| LLM | GPT-4o（高精度）、Claude（长上下文）、本地模型（成本敏感） |
| 向量数据库 | Milvus（大规模）、Pinecone（托管）、pgvector（已有 PG） |
| 评估框架 | RAGAS |

### 8.3 常见陷阱与避坑指南

| 陷阱 | 后果 | 解决方案 |
|------|--|--|
| 过度使用 Agent | 成本爆炸、延迟增加 | 先用 Hybrid RAG，只在必要时用 Agent |
| 缺少错误恢复 | Agent 失败后直接报错 | 实现降级到 Hybrid RAG |
| 缺少 HITL | 高风险决策无人审核 | 关键决策点加审批 |
| 缺少监控 | 无法定位问题 | 记录所有步骤日志 |
| 工具权限过大 | 安全风险 | 沙箱执行、权限最小化 |
| 调试困难 | Agent 行为不确定 | 详细日志、可视化执行路径 |
| 成本失控 | 无限制的 LLM 调用 | Token 预算、频率限制 |

---

> **基础篇参考**：[ch00-overview.md](ch00-overview.md) · [ch01-basic-rag-deep-dive.md](ch01-basic-rag-deep-dive.md) · [ch02-hybrid-rag-deep-dive.md](ch02-hybrid-rag-deep-dive.md)
> **进阶篇参考**：[ch05-graphrag.md](ch05-graphrag.md) · [ch06-lazygraphrag.md](ch06-lazygraphrag.md)
