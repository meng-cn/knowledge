# LlamaIndex 检索优先

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 3 节
> **难度**：⭐⭐ | **前置知识**：RAG 基础

---

## 1. 概述

**LlamaIndex**（原 GPT Index）是**检索优先**的 Agent 框架，专注于将私有数据连接到大语言模型。

核心理念：**数据先于模型** — 先构建索引，再用 Agent 检索。

---

## 2. 核心组件

| 组件 | 功能 |
|--|- |
| **Reader** | 文档加载器 |
| **Node Parser** | 切分文档为节点 |
| **Index** | 构建检索索引 |
| **Query Engine** | 查询检索结果 |
| **Chat Engine** | 对话式问答 |
| **Storage** | 持久化索引 |

### 索引类型

| 索引类型 | 适合场景 |
|--|- |
| **VectorStoreIndex** | 语义检索 |
| **KeywordIndex** | 关键词检索 |
| **KnowledgeGraphIndex** | 知识图谱检索 |
| **SummaryIndex** | 摘要检索 |

---

## 3. 参考资料

- [LlamaIndex 官方文档](https://docs.llamaindex.ai/)
- [LlamaIndex GitHub](https://github.com/run-llama/llama_index)
- [Comparing 5 AI Agent Frameworks](https://nicklaunches.com/blog/ai-agent-frameworks-comparison-2025/)
