# Memory 记忆架构

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 5 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 基础

---

## 1. 概述

**Agent 的记忆**是 Agent 区别于静态 LLM 的核心能力。没有记忆的 Agent 只能做「一次性问答」，有记忆的 Agent 才能实现**跨会话连贯性、个性化、学习能力**。

2025-2026 年，Memory 已成为 Agent 架构的独立模块。

---

## 2. 核心概念

### 2.1 Agent 的三层记忆架构

```
┌─────────────────────────────┐
│      Agent Memory           │
│                             │
│  ┌───────────┐ ┌──────────┐│
│  │ 工作记忆   │ │ 短期记忆  ││
│  │ (Working)  │ │ (Short)  ││
│  │ 当前任务   │ │ 对话历史  ││
│  │ 上下文窗口 │ │ 数小时    ││
│  └───────────┘ └──────────┘│
│                             │
│  ┌───────────┐ ┌──────────┐│
│  │ 长期记忆   │ │ 个人记忆  ││
│  │ (Long-term)│ │ (Personal)││
│  │ 知识库     │ │ 用户偏好  ││
│  │ 向量DB     │ │ 经验      ││
│  └───────────┘ └──────────┘│
└─────────────────────────────┘
```

| 类型 | 容量 | 持久性 | 技术实现 |
|------|------|------|--|-|
| **工作记忆** | ~128K tokens | 单次对话 | LLM 上下文窗口 |
| **短期记忆** | ~10K 条 | 数小时/天 | ConversationBufferMemory |
| **长期记忆** | 无限 | 永久 | 向量DB (Chroma/Pinecone) |
| **个人记忆** | 有限 | 永久 | MAGMA 多图架构 |

### 2.2 MAGMA 架构（2025 年突破）

**MAGMA（Memory-Augmented Graph）** 是 2025 年的关键突破：

```
用户记忆图:
┌──────────────────────────┐
│                        │
│  [用户: 喜欢编程] ────→ [Python]
│        │                   ↓
│        │              [项目: Django]
│        │                   ↓
│  [用户: 住北京] ───→ [工具: VS Code]
│                        ↓
│                  [框架: LangChain]
│                        ↓
│                 [目标: 学 Agent]
│                        ↓
│                  [偏好: 中文文档]
│                        ↓
│                   [历史: 面试准备]
│                        ↓
│                   [下一步: 准备面试]
│                        │
└──────────────────────────┘
```

MAGMA 的核心：用**图谱结构**存储记忆，而非向量检索。支持：
- **关联推理** — "喜欢编程" → "Python" → "Django"
- **类人遗忘** — 不重要的记忆自动衰减
- **个性化检索** — 根据场景召回相关记忆

---

## 3. 技术原理

### 3.1 记忆写入流程

```
用户交互 → 提取记忆点 → 分类（短期/长期/个人）→ 存储
         → 评估重要性 → 决定是否需要长期存储
```

### 3.2 记忆读取流程

```
当前上下文 → 检索相关记忆 → 评估相关性 → 注入 Prompt
              （向量检索/图谱遍历/关键词）
```

### 3.3 代码示例

```python
# 短期记忆 — 对话历史
from langchain.memory import ConversationBufferMemory
memory = ConversationBufferMemory()
memory.save_context({"input": "你好"}, {"output": "你好！有什么可以帮你的？"})

# 长期记忆 — 向量存储
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectordb = Chroma(collection_name="agent_memory", embedding_function=embeddings)

# 存储记忆
from langchain.docstore.document import Document
docs = [Document(page_content="用户喜欢编程")]
vectordb.add_documents(docs)

# 检索记忆
results = vectordb.similarity_search("编程", k=3)
```

---

## 4. 实践指南

### 4.1 记忆策略

| 场景 | 策略 |
|------|------|
| 客服 Agent | 短期记忆 + 用户画像 |
| 研究 Agent | 长期记忆（向量DB） |
| 个人助手 | MAGMA 个人记忆图 |
| 代码 Agent | 工作记忆 + 项目记忆 |

### 4.2 最佳实践

1. **记忆压缩** — 定期摘要，避免上下文爆炸
2. **分级存储** — 重要/一般/过期分级
3. **遗忘机制** — 不重要记忆自动衰减
4. **安全隐私** — 个人记忆加密存储

### 4.3 常见陷阱

| 陷阱 | 解法 |
|------|------|
| 记忆污染 | 评估相关性后再注入 |
| 检索噪声 | MAGMA 图谱检索 |
| 存储成本 | 定期清理/压缩 |
| 隐私泄露 | 加密+权限 |

---

## 5. 参考资料

- [MAGMA 论文](https://arxiv.org/abs/2501.11539)
- [LangChain Memory 文档](https://python.langchain.com/docs/modules/memory/)
