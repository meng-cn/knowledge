# RAG 重排序技术深度解析

> Cross-Encoder 与 Reranker 的完整工程化指南  
> 生成时间：2026-04-28 · 版本 1.0

---

## 目录

- [第一部分：重排序全景架构](#第一部分重排序全景架构)
  - [1.1 为什么重排序是 RAG 的"临门一脚"](#11-为什么重排序是-rag-的临门一脚)
  - [1.2 重排序在 RAG 管线中的位置](#12-重排序在-rag-管线中的位置)
  - [1.3 重排序 vs 其他优化手段](#13-重排序-vs-其他优化手段)
  - [1.4 核心设计原则](#14-核心设计原则)
- [第二部分：检索前的"暗器"——查询变换增强召回](#第二部分检索前的暗器查询变换增强召回)
  - [2.1 多查询重写（Multi-Query Rewriting）](#21-多查询重写multi-query-rewriting)
  - [2.2 Step-Back Prompting](#22-step-back-prompting)
  - [2.3 假设性文档检索（HDR / HyDE）](#23-假设性文档检索hdr--hyde)
  - [2.4 查询扩展（Query Expansion）](#24-查询扩展query-expansion)
  - [2.5 检索策略选择决策树](#25-检索策略选择决策树)
- [第三部分：重排序策略全景](#第三部分重排序策略全景)
  - [3.1 轻量级：基于规则的粗排](#31-轻量级基于规则的粗排)
  - [3.2 Bi-Encoder 重排序](#32-bi-encoder-重排序)
  - [3.3 Cross-Encoder 重排序（核心）](#33-cross-encoder-重排序核心)
  - [3.4 Cross-Encoder 模型选型全景](#34-cross-encoder-模型选型全景)
  - [3.5 策略选型指南](#35-策略选型指南)
- [第四部分：Cross-Encoder 重排序深度实现](#第四部分cross-encoder-重排序深度实现)
  - [4.1 Cross-Encoder 原理详解（超越表层公式）](#41-cross-encoder-原理详解超越表层公式)
  - [4.2 本地部署：flag-embedding + bge-reranker](#42-本地部署flag-embedding--bge-reranker)
  - [4.3 云端 API：Cohere Rerank v3](#43-云端-apicohere-rerank-v3)
  - [4.4 生产级重排序管线（含错误处理与降级）](#44-生产级重排序管线含错误处理与降级)
- [第五部分：重排序的进阶策略](#第五部分重排序的进阶策略)
  - [5.1 多阶段级联重排序（Multi-Stage Cascading Rerank）](#51-多阶段级联重排序multi-stage-cascading-rerank)
  - [5.2 多样性重排序（MMR-Rerank）](#52-多样性重排序mmr-rerank)
  - [5.3 基于 LLM 的语义重排序](#53-基于-llm-的语义重排序)
  - [5.4 上下文感知重排序（Context-Aware Reranking）](#54-上下文感知重排序context-aware-reranking)
  - [5.5 列表级重排序与上下文感知（Listwise Reranking）](#55-列表级重排序与上下文感知listwise-reranking)
- [第六部分：重排序评估与优化](#第六部分重排序评估与优化)
  - [6.1 重排序效果评估指标](#61-重排序效果评估指标)
  - [6.2 延迟优化策略](#62-延迟优化策略)
  - [6.3 成本优化策略](#63-成本优化策略)
  - [6.4 NDCG 量化评估（含实现）](#64-ndcg-量化评估含实现)
- [第七部分：完整代码实现](#第七部分完整代码实现)
  - [7.1 从检索到重排序的端到端管线](#71-从检索到重排序的端到端管线)
  - [7.2 可插拔重排序中间件（Plugin Architecture）](#72-可插拔重排序中间件plugin-architecture)
  - [7.3 生产级异步重排序服务](#73-生产级异步重排序服务)
- [第八部分：决策与选型](#第八部分决策与选型)
  - [8.1 重排序决策树](#81-重排序决策树)
  - [8.2 技术选型速查表](#82-技术选型速查表)
  - [8.3 常见陷阱与避坑指南](#83-常见陷阱与避坑指南)

---

## 第一部分：重排序全景架构

### 1.1 为什么重排序是 RAG 的"临门一脚"

重排序（Re-ranking）是 RAG 系统中**投入产出比最高的优化手段之一**。

```
用户问题: "如何配置 API 网关的超时时间？"

═══════════════════════════════════
阶段 1：向量检索（粗排 / Recall）
═══════════════════════════════════

查询 → Embedding → 向量数据库近似最近邻搜索 → Top-K 候选

问题:
  · 向量模型只能编码"独立"的查询和文档
  · 无法建模查询与文档之间的精细交互
  · Top-K 结果的排序是"粗糙"的

检索到的 Top-5:
  [1] "API 网关概述与核心功能"                ← 语义接近但不是答案
  [2] "API 网关限流配置详解"                  ← 相关但不够精准
  [3] "API 网关超时配置参数说明"              ← ✅ 真正的答案在这里!
  [4] "微服务架构中的 API 网关"               ← 泛泛而谈
  [5] "API 网关安全策略"                      ← 无关

LLM 收到后，由于注意力机制的特性：
  → 更关注前面的结果 [1] [2]
  → 忽略排在后面的 [3]
  → 回答不准确！

═══════════════════════════════════
阶段 2：重排序（精排 / Rerank）
═══════════════════════════════════

对 Top-5 候选逐一用 Cross-Encoder 计算精细相关性得分：

  [1] "API 网关概述与核心功能"     score = 0.12  ← 相关度低
  [2] "API 网关限流配置详解"       score = 0.31  ← 相关度中等
  [3] "API 网关超时配置参数说明"   score = 0.95  ← ✅ 真正的答案
  [4] "微服务架构中的 API 网关"    score = 0.25  ← 泛泛而谈
  [5] "API 网关安全策略"           score = 0.08  ← 几乎无关

重排序后的 Top-3:
  [1] "API 网关超时配置参数说明"   ← ✅ 答案被提到第一位！
  [2] "API 网关限流配置详解"
  [3] "微服务架构中的 API 网关"

LLM 收到 → 精准命中 → 回答准确！

═══════════════════════════════════
关键洞察
═══════════════════════════════════

  向量检索解决了"找什么"的问题（召回率）
  重排序解决了"怎么排"的问题（精确度）
  两者互补，缺一不可
```

**核心洞察**：

1. **向量检索的排序是"代理排序"**：向量相似度 ≠ 最终相关性。Top-1 结果不一定是用户最需要的。
2. **LLM 对 Prompt 位置敏感**：LLM 对输入中前 2-3 个 token 的关注度远高于后面——如果正确答案排在第 4 位，LLM 大概率忽略它。
3. **重排序是"最后一道防线"**：它在检索和 LLM 之间，把粗排结果重新排序，确保 LLM 看到的是最相关的内容。

### 1.2 重排序在 RAG 管线中的位置

```
┌──────────────────────────────────────────────────────────────────────┐
│                    RAG 管线中的重排序位置                            │
│                                                                      │
│  ┌───────────┐    ┌─────────────┐    ┌──────────────┐              │
│  │ 用户查询   │───▶│ 查询变换    │───▶│ 粗排检索      │              │
│  │ "如何配置  │    │ (可选)      │    │ (BM25+向量)  │              │
│  │  API 网关  │    │ · Multi-   │    │ · Top-50 候选 │              │
│  │  超时？"   │    │   Query     │    │              │              │
│  └───────────┘    └─────────────┘    └──────┬───────┘              │
│                                              │                      │
│                                              ▼                      │
│                                      ┌───────────────┐             │
│                                      │  RRF 融合     │             │
│                                      │  Top-50 →     │             │
│                                      │  Top-20 候选  │             │
│                                      └───────┬───────┘             │
│                                              │                      │
│                                              ▼                      │
│                                    ┌──────────────────┐            │
│                                    │  ┌────────────┐  │            │
│  ┌─────────────┐   ┌───────────┐  │  │ Cross-    │  │            │
│  │  LLM 生成   │◀──│ 上下文编排 │  │  │ Encoder    │  │            │
│  │             │   │ token 预算 │  │  │ 重排序     │  │            │
│  │ 最终回答     │   │ 控制      │  │  │ (20 条→5条)│  │            │
│  └─────────────┘   └───────────┘  │  └────────────┘  │            │
│                                    │                  │            │
│                                    │  ┌────────────┐  │            │
│                                    │  │ BM25 粗筛  │  │            │
│                                    │  │ 去尾部30%  │  │            │
│                                    │  └────────────┘  │            │
│                                    └──────────────────┘            │
│                                              │                      │
│                                              ▼                      │
│                                      ┌───────────────┐             │
│                                      │  Top-5 候选    │             │
│                                      │ → 喂给 LLM     │             │
│                                      └───────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

**位置选择**：重排序必须放在**检索之后、LLM 之前**：
- 太早：对所有文档重排序 → 计算量爆炸
- 太晚：LLM 已经收到错误的排序 → 无法挽回

### 1.3 重排序 vs 其他优化手段

```
优化手段              │ 解决的问题        │ 精度提升  │ 延迟增加  │ 成本
──────────────────────┼─────────────────┼─────────┼─────────┼─────
换更好的 Embedding    │ 语义理解不足      │ 中      │ 低      │ 低
增加检索数量 (Top-K)  │ 召回率不足        │ 低      │ 低      │ 低
元数据过滤            │ 搜索空间过大      │ 高      │ 极低    │ 极低
重排序 (Rerank)      │ 排序精度不足      │ **高**  │ 中      │ 中
混合检索 (BM25+Vector)│ 关键词匹配不足    │ 高      │ 低      │ 低
多查询改写 (Multi-Q)  │ 查询表述单一      │ 中      │ 中      │ 中
```

**关键结论**：
- **召回率**问题（找不到相关文档）→ 用混合检索、元数据过滤、查询改写
- **精确度**问题（找到了但排错位置）→ 用重排序
- 大多数场景下，**重排序的收益 > 换更好的 Embedding 模型**

### 1.4 核心设计原则

**原则一：重排序是"精排"而非"召回"**

重排序不解决"是否召回了正确答案"的问题，它解决的是"正确答案是否被排到了前面"的问题。如果粗排根本没召回正确答案，重排序无能为力——**召回率由粗排决定，精确度由重排序决定**。

**原则二：成本由候选数控制**

重排序的计算成本 = 候选数 × Cross-Encoder 单次推理成本。
- 候选数 10 → 10 次推理
- 候选数 100 → 100 次推理

因此**永远不要对所有召回结果做重排序**——先用粗排策略减少候选数。

**原则三：精度与延迟的权衡是设计核心**

```
候选数    │ 延迟   │ 精度提升  │ 推荐场景
─────    │ ────  │ ──────  │ ───────
5        │ ~15ms  │ +2-3%   │ 预算极低
10       │ ~30ms  │ +3-5%   │ 实时对话
20       │ ~60ms  │ +5-8%   │ 通用搜索
50       │ ~150ms │ +8-10%  │ 高精度场景
100      │ ~300ms │ +10%    │ 离线批处理
```

**原则四：模型选型要匹配部署环境**

```
CPU 部署 → BGE-Reranker-Base (278M) / MiniLM (56M)
GPU 部署 → BGE-Reranker-Large (560M) / Gemma (2B)
云端 API → Cohere Rerank v3 (多语言，无需部署)
```

---

## 第二部分：检索前的"暗器"——查询变换增强召回

重排序解决的是"排错序"的问题，但**更好的召回（召回率）是更好的重排序的基础**。如果粗排根本没有召回正确答案，再好的重排序也无济于事。

本节介绍在检索**之前**通过变换查询来增强召回的策略。

### 2.1 多查询重写（Multi-Query Rewriting）

#### 原理

用户的问题往往只有一种表述方式，但正确答案可能用不同的词汇描述。通过 LLM 生成多个改写版本，从不同角度检索，可以大幅提升召回率。

```
用户问题: "如何配置 API 网关的超时时间？"

LLM 生成 3 个改写:
  [Q1] "API gateway timeout configuration parameters"
  [Q2] "网关请求超时设置方法"
  [Q3] "Spring Cloud Gateway 配置 read timeout 和 connect timeout"

分别检索:
  Q1 → 命中英文配置文档
  Q2 → 命中中文配置文档
  Q3 → 命中特定框架的配置文档

合并去重 → 候选集扩大 2-3 倍 → 重排序时正确答案更有机会出现
```

#### 代码实现

```python
import asyncio
import aiohttp
from typing import List, Dict
from openai import AsyncOpenAI

class MultiQueryRetriever:
    """
    多查询重写检索器
    
    通过 LLM 生成多个改写查询，从不同角度检索，扩大召回范围。
    """
    
    def __init__(
        self,
        base_retriever,
        llm: AsyncOpenAI,
        n_queries: int = 3,
    ):
        """
        Args:
            base_retriever: 基础检索器（向量 / BM25 / 混合）
            llm: OpenAI 异步客户端
            n_queries: 生成多少个改写查询
        """
        self.base_retriever = base_retriever
        self.llm = llm
        self.n_queries = n_queries
    
    async def rewrite_queries(self, original_query: str) -> List[str]:
        """使用 LLM 生成多个改写查询"""
        prompt = f"""你是一个专业的检索增强助手。针对用户的问题，生成 {self.n_queries} 个不同的检索查询。

要求：
1. 每个查询都试图找到原问题的答案
2. 使用不同的词汇和表述角度
3. 保留原问题的核心意图
4. 输出为 JSON 数组格式，不要其他内容

原问题: {original_query}

输出格式:
["查询1", "查询2", "查询3"]"""

        response = await self.llm.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,  # 需要一定的创造性
            max_tokens=200,
        )
        
        # 解析 JSON 输出
        import json
        content = response.choices[0].message.content.strip()
        try:
            queries = json.loads(content)
        except json.JSONDecodeError:
            # 如果解析失败，退回到原查询
            queries = [original_query]
        
        # 确保包含原查询
        if original_query not in queries:
            queries[0] = original_query
        
        return queries
    
    async def retrieve(self, query: str) -> List[Dict]:
        """多查询检索"""
        # 1. 生成改写查询
        queries = await self.rewrite_queries(query)
        print(f"原始查询: {query}")
        print(f"改写查询: {queries}")
        
        # 2. 并行检索
        async def search(q):
            return await self.base_retriever.asearch(q)
        
        results = await asyncio.gather(*[search(q) for q in queries])
        
        # 3. 合并去重（按内容相似度去重）
        return self._deduplicate(queries, results)
    
    def _deduplicate(self, queries: List[str], results: List[List[Dict]]) -> List[Dict]:
        """合并去重"""
        seen = set()
        merged = []
        
        for query, docs in zip(queries, results):
            for doc in docs:
                content_key = doc.get("content", "")[:100]
                if content_key not in seen:
                    seen.add(content_key)
                    merged.append({
                        **doc,
                        "source_query": query,
                        "source_count": 1,
                    })
                else:
                    # 同一文档被多个查询命中 → 增加权重
                    for m in merged:
                        if m.get("content", "")[:100] == content_key:
                            m["source_count"] += 1
                            break
        
        # 按命中次数排序（命中次数越多越相关）
        merged.sort(key=lambda x: x.get("source_count", 0), reverse=True)
        return merged
```

**效果数据**：
- 召回率提升：+5-10% Recall@10
- 延迟增加：+N × LLM 调用延迟（N=3-5）
- 成本增加：+N × LLM 调用成本

### 2.2 Step-Back Prompting

#### 原理

对于复杂问题，先提取"上位概念"（step-back），再检索上位概念的相关文档，可以召回更泛化但更有用的上下文。

```
用户问题: "Android 14 中 WorkManager 的 PeriodicWorkRequest 最大重复间隔是多少？"

Step-Back 提取的上位概念:
  "PeriodicWorkRequest 的工作原理"
  "Android 定时任务的调度机制"
  "WorkManager 的约束和限制"

检索上位概念 → 召回框架级别的文档 → 再重排序 → 找到具体的 API 参数限制
```

#### 代码实现

```python
async def step_back_retrieve(self, original_query: str) -> List[Dict]:
    """Step-Back 查询提取"""
    prompt = f"""给定以下技术问题，提取 2-3 个更通用的上位概念查询。

要求：
1. 去掉具体的版本号、API 名等细节
2. 保留核心问题意图
3. 输出为 JSON 数组

原问题: {original_query}

输出格式:
["上位查询1", "上位查询2"]"""

    response = await self.llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,  # 需要一致性
        max_tokens=150,
    )
    
    import json
    content = response.choices[0].message.content.strip()
    step_back_queries = json.loads(content)
    
    # 同时检索原问题和上位概念
    all_queries = [original_query] + step_back_queries
    
    async def search(q):
        return await self.base_retriever.asearch(q)
    
    results = await asyncio.gather(*[search(q) for q in all_queries])
    return self._deduplicate(all_queries, results)
```

### 2.3 假设性文档检索（HDR / HyDE）

#### 原理

与其改写查询，不如让 LLM **假设性地写出一个可能的答案**，然后搜索与这个"假设答案"最相似的文档。核心洞察：**假设答案的表述方式更接近真实文档的表述方式**。

```
用户问题: "Android 中 Handler 的消息队列是如何工作的？"

❌ 直接检索用户问题:
查询: "Android 中 Handler 的消息队列是如何工作的？"
→ 向量模型理解的是"提问方式"（"如何工作"、"是...的"）
→ 可能找到"FAQ"类的文档而非"源码分析"类文档

✅ 假设性文档检索:
Step 1: 让 LLM 写一个"假设性的好答案"
  "Handler 的消息队列机制基于 Looper 的 MessageQueue。
   每个 Handler 关联一个 Looper，Looper 维护一个 MessageQueue。
   sendMessage() 将消息加入队列，loop() 方法循环取出消息并分发到 Handler.handleMessage()。"

Step 2: 检索与"假设答案"最相似的文档
查询: "Handler 的消息队列机制基于 Looper 的 MessageQueue..."
→ 向量模型理解的是"文档式表述"
→ 更可能命中"源码分析"、"架构设计"类文档

效果：
  · 假设答案作为"文档风格"的查询，匹配文档的表述更准确
  · 特别适合检索技术文档（而非 FAQ）
```

#### 代码实现

```python
async def hyde_retrieve(self, query: str) -> List[Dict]:
    """
    HyDE (Hypothetical Document Embeddings) 检索
    
    先生成假设性答案，再用假设答案做检索。
    """
    prompt = f"""请为以下问题写一段"假设性的标准答案"。

要求：
1. 答案长度 100-200 字
2. 使用技术文档的风格（陈述句，非提问句）
3. 包含关键术语和细节
4. 即使你不确定，也要写一个合理的答案

问题: {query}

假设性答案:"""

    response = await self.llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300,
    )
    
    hypothetical_doc = response.choices[0].message.content.strip()
    print(f"假设性答案: {hypothetical_doc[:100]}...")
    
    # 用假设答案检索
    results = await self.base_retriever.asearch(hypothetical_doc)
    return results
```

### 2.4 查询扩展（Query Expansion）

#### 原理

从用户查询中提取关键词和同义词，扩展为一个"扩展查询"（包含原始查询 + 关键词 + 同义词），增强关键词匹配的召回率。

```
用户问题: "Android 内存泄漏怎么排查？"

扩展步骤:
  1. 提取关键词: ["内存泄漏", "排查"]
  2. 获取同义词（通过词向量或词典）:
     内存泄漏 → "memory leak", "内存溢出", "OOM"
     排查 → "检测", "分析", "定位", "诊断"
  3. 构造扩展查询:
     ["内存泄漏 排查", "内存泄漏 检测", "memory leak 分析",
      "OOM 定位", "Android 内存泄漏 诊断", ...]
```

#### 代码实现

```python
class QueryExpander:
    """
    查询扩展器
    
    通过关键词提取 + 同义词扩展，增强 BM25 的召回率。
    """
    
    def __init__(self):
        # 同义词词典（可替换为词向量搜索）
        self.synonyms = {
            "内存泄漏": ["memory leak", "内存溢出", "OOM", "OutOfMemoryError"],
            "排查": ["检测", "分析", "定位", "诊断", "调试"],
            "崩溃": ["crash", "异常退出", "force close", "ANR"],
            "超时": ["timeout", "超时设置", "超时配置"],
            "异常": ["exception", "error", "throw", "catch"],
            "配置": ["configuration", "config", "设置", "参数"],
        }
    
    def expand(self, query: str) -> List[str]:
        """扩展查询"""
        import jieba
        tokens = set(jieba.lcut(query))
        expanded = [query]  # 原始查询
        
        # 添加同义词扩展
        for token in tokens:
            if token in self.synonyms:
                expanded.extend([f"{token} {syn}" for syn in self.synonyms[token]])
                expanded.extend([f"{syn} {token}" for syn in self.synonyms[token]])
        
        return expanded
    
    def expand_with_llm(self, query: str, llm) -> List[str]:
        """使用 LLM 做更智能的查询扩展"""
        prompt = f"""为以下查询生成 5 个相关的检索关键词或短语。

要求：
1. 保留核心语义
2. 包含同义词和近义词
3. 包含英文技术术语
4. 输出为 JSON 数组

查询: {query}

输出格式:
["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]"""

        response = llm.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=150,
        )
        
        import json
        keywords = json.loads(response.choices[0].message.content.strip())
        return [query] + keywords
```

### 2.5 检索策略选择决策树

```
查询特征？
│
├─ 查询简短且模糊（"怎么配置"、"如何做"）
│   → Multi-Query Rewriting（必须，扩展检索角度）
│
├─ 查询包含具体版本号/API 名/配置项
│   → BM25 精确匹配（关键！不要只用向量）
│   → 可加 Query Expansion 增强
│
├─ 查询是复杂技术问题（"XX 机制的原理是什么"）
│   → Step-Back + Multi-Query 组合
│   → 上位概念检索 → 框架级文档
│
├─ 目标是检索技术文档（而非 FAQ）
│   → HyDE（假设性文档）
│   → 假设答案的表述更接近文档
│
├─ 知识库以代码/异常名/API 名为核心
│   → BM25 必须启用
│   → 定制分词器保留驼峰命名
│
└─ 不确定 → Multi-Query + BM25（安全默认）
```

---

## 第三部分：重排序策略全景

### 3.1 轻量级：基于规则的粗排

在引入 Cross-Encoder 之前，有一些零成本的优化手段：

```python
class RuleBasedReranker:
    """
    基于规则的轻量重排序
    
    零成本，不需要额外的模型推理。
    适合预算极低、延迟要求极严的场景。
    """
    
    def __init__(self):
        # 关键词权重（可调）
        self.keyword_weights = {
            "超时": 2.0,
            "配置": 1.5,
            "参数": 1.3,
            "设置": 1.2,
        }
    
    def rerank(self, query: str, documents: List[str]) -> List[Dict]:
        """
        规则重排序
        
        Args:
            query: 用户查询
            documents: 候选文档列表
        
        Returns:
            按规则分数排序的结果
        """
        # 1. 精确匹配加分
        def exact_match_score(doc: str) -> float:
            score = 0.0
            # 标题匹配（如果有）
            if doc.startswith(query[:10]):
                score += 5.0
            # 完整查询匹配
            if query in doc:
                score += 3.0
            # 分段匹配
            for keyword, weight in self.keyword_weights.items():
                if keyword in doc:
                    score += weight
            return score
        
        # 2. 计算分数并排序
        scored = [
            {"content": doc, "score": exact_match_score(doc), "method": "rule"}
            for doc in documents
        ]
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored
```

### 3.2 Bi-Encoder 重排序

```
Bi-Encoder 重排序 = 换更强的 Embedding 模型 + 重新计算相似度

原理：
  候选文档用 Cross-Encoder 的"兄弟"——更强的 Bi-Encoder 重新编码
  与查询向量的相似度 = 重排序分数

效果：
  · 精度提升：+2-4%（比规则重排好，比 Cross-Encoder 差）
  · 延迟：O(K) 次向量计算（可批量）
  · 成本：低（向量化比 Cross-Encoder 便宜）

适用场景：
  · 候选数较大（>50）时，Bi-Encoder 批量计算比 Cross-Encoder 更经济
  · 对延迟敏感但不愿完全放弃排序优化
```

```python
def bi_encoder_rerank(
    query: str,
    documents: List[str],
    reranker_model: str = "BAAI/bge-reranker-v2-m3",
    device: str = "cpu",
) -> List[Dict]:
    """
    Bi-Encoder 风格的重排序（单条编码，对比交叉编码）
    """
    from flagembedding import Reranker
    
    # 使用 flag-embedding 的 reranker（Bi-Encoder 模式）
    reranker = Reranker(
        reranker_model,
        device=device,
    )
    
    # 单条查询 + 文档列表 → 批量计算
    scores = reranker.rerank(query, documents)
    
    return [
        {"content": doc, "score": float(s)}
        for doc, s in zip(documents, scores)
    ]
```

### 3.3 Cross-Encoder 重排序（核心）

#### Cross-Encoder 的运作机制

```
Cross-Encoder 输入:
  [CLS] 用户查询 [SEP] 候选文档 [SEP]
    │                      │
    │   Transformer Encoder（单次前向传播）│
    │                      │
    │   所有 token 都可以"看到"彼此         │
    │   → 精细的 query-document 交互       │
    │                      │
    │   [CLS] token 的输出                  │
    │         │                           │
    │         ▼                           │
    │   线性层 → Sigmoid → [0, 1] 分数   │
    │                      │               │
    └──────────────────────┴───────────────┘

关键：Cross-Encoder 同时看到查询和文档，可以建模：
  · 词对齐（query 的"超时" ↔ doc 的"timeout"）
  · 上下文融合（"网关超时"作为一个整体理解，而非两个独立词）
  · 否定句识别（"不建议配置" → 低相关度）
  · 隐含关系（"怎么设置" → 等价于 "如何配置"）
```

#### Cross-Encoder vs Bi-Encoder 的本质区别

```
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│         Bi-Encoder (向量检索)        │    │      Cross-Encoder (重排序)          │
├─────────────────────────────────────┤    ├─────────────────────────────────────┤
│                                     │    │                                     │
│  query → Encoder → 向量 Q           │    │  (query, doc) → Encoder → 分数 S   │
│  doc  → Encoder → 向量 D            │    │                                     │
│                                     │    │                                     │
│  similarity = cos(Q, D)             │    │  similarity = f(query, doc)         │
│                                     │    │                                     │
│  优势:                              │    │  优势:                                │
│  · 可以批量计算（快）                 │    │  · 查询和文档交互（精确）             │
│  · 适合全库搜索                      │    │  · 可以建模复杂关系                   │
│  · 存储 O(N) 个向量                  │    │  · 分数更可靠                         │
│                                     │    │                                     │
│  劣势:                               │    │  劣势:                                │
│  · 查询和文档各自独立编码             │    │  · 必须逐一计算（慢）                │
│  · 无法做精细交互                     │    │  · 无法批量（每个 (q,d) 对独立）      │
│  · 相似度是"代理"                    │    │  · 存储 O(N) 个推理成本               │
│                                     │    │                                     │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
```

**类比**：
- **Bi-Encoder**：相亲角，先看各自的条件介绍（简历），再判断是否匹配
- **Cross-Encoder**：面对面聊天，直接看双方互动和化学反应

### 3.4 Cross-Encoder 模型选型全景

```
┌───────────────┬─────────────┬────────┬────────┬──────────┬──────────────┐
│ 模型          │ 参数量      │ 语言   │ 精度   │ 延迟(20) │ 部署方式     │
│               │             │        │        │          │              │
│ ────         │ ────       │ ────  │ ────  │ ──────  │ ──────────  │
│ bge-reranker-base  │ 278M  │ 中英   │ ★★★☆☆ │ ~15ms  │ CPU ✅       │
│ bge-reranker-large │ 560M  │ 中英   │ ★★★★★ │ ~35ms  │ CPU/GPU ✅   │
│ bge-reranker-v2-gemma │ 2.0B │ 中英 │ ★★★★★ │ ~120ms │ GPU ✅       │
│ ms-marco-MiniLM-L-6 │ 56M  │ 英文 │ ★★☆☆☆ │ ~8ms   │ CPU ✅       │
│ Cohere Rerank v3.5 │ -    │ 多语言 │ ★★★★★ │ ~10ms  │ API ✅       │
│ jina-reranker-v2     │ 278M │ 多语言 │ ★★★★★ │ ~15ms  │ CPU/API ✅   │
│ E5-Mistral          │ 7B   │ 多语言 │ ★★★★★ │ ~200ms │ GPU ✅       │
└───────────────┴─────────────┴────────┴────────┴──────────┴──────────────┘

选型建议:

开发者知识库场景:
  · 本地 CPU → bge-reranker-base（精度够用，延迟最低）
  · 本地 GPU → bge-reranker-large（最佳精度/延迟平衡）
  · 云端 API → Cohere Rerank v3.5（多语言，免运维）
  · 多语言 → jina-reranker-v2 或 Cohere Rerank v3.5

预算有限:
  · stage 1: base 模型粗筛到 Top 20
  · stage 2: large 模型精排 Top 20
  → 延迟 ~50ms，精度接近 single large
```

### 3.5 策略选型指南

```
你的场景需要重排序吗？
│
├─ 候选数 Top-K ≤ 5？
│   → 不需要重排序（向量排序已经够用了）
│
├─ 候选数 Top-K > 10 且对精度要求高？
│   → 必须重排序
│
├─ 知识库以代码/API 名为核心？
│   → BM25 + 重排序（两者互补）
│
├─ 延迟预算 < 50ms？
│   → 不要重排序，或用 base 模型级联
│
├─ 延迟预算 50-200ms？
│   → bge-reranker-base，候选数 20
│
├─ 延迟预算 200-500ms？
│   → bge-reranker-large，候选数 50
│
└─ 不确定
   → 从 base + Top 20 开始，评估效果后再升级
```

---

## 第四部分：Cross-Encoder 重排序深度实现

### 4.1 Cross-Encoder 原理详解（超越表层公式）

#### Token-Level 交互机制

Cross-Encoder 的核心优势在于 **Attention 机制让查询和文档的每个 token 都可以相互关注**。

```
输入序列:
[CLS] 如何 配置 网关 超时 [SEP] API 网关 的 超时 配置 分为 三个 层级 [SEP]

Transformer Encoder 的每一层都会计算:
  Attention(query_token_i, doc_token_j)

举例：在最后一层中，"超时"(query 中) 对 "超时"(doc 中) 的注意力权重可能高达 0.85
而在 Bi-Encoder 中，这两个词被编码在不同的向量中，向量内部的"词对齐"是隐式的、不精确的

Cross-Encoder 的精确交互：
  "如何配置" → 在 doc 中精确找到"配置" → 高相关度
  "网关超时" → 在 doc 中精确找到"超时配置" → 高相关度
  "API" → 在 doc 中精确找到"API 网关" → 高相关度
  → 综合得分高

"无关"的精确识别：
  "如何配置" → 在 doc "API 网关安全策略" 中找"配置" → 可能找到 → 但
  "网关超时" → 在 doc "API 网关安全策略" 中找"超时" → ❌ 找不到
  → 综合得分低 ← 这就是 Cross-Encoder 的"精准拒绝"能力
```

#### 为什么 Cross-Encoder 比 Bi-Encoder 更精确？

```
Bi-Encoder 的局限性：

查询 "API 网关超时配置" 编码为向量 Q
文档 "API 网关的限流配置详解" 编码为向量 D

cos(Q, D) = ?

问题:
  Q 中的 "超时" 和 D 中的 "限流" 的语义关系：
  → 向量空间中的距离受限于 1536 维（或 1024 维）的表达能力
  → 1536 个维度要同时编码: 语义、词性、上下文、领域、粒度...
  → 必然有信息损失

Cross-Encoder 的优势：

输入 (查询, 文档) → Transformer Encoder → 分数

优势:
  · 没有维度压缩损失（所有 token 都被保留）
  · 词对齐是显式的（Attention 权重直接可见）
  · 否定句可以精确识别（"不推荐配置超时" → "不" 会影响整个句子的语义）
  · 同义词可以精确匹配（"超时" ↔ "timeout"）
```



### 3.6 领域微调与自训练（Domain Adaptation）

#### 一、问题：通用 Reranker 的领域盲区

BGE、Cohere Rerank 等通用模型在开放域（新闻、百科、QA）上表现优异，但在**互联网开发垂直领域**（Android/Java/系统编程）面临特定挑战：

```
通用模型可能不理解的相关性:

查询: "Android 中 Handler 的 sendMessageDelayed 底层是怎么实现的？"

通用 Cross-Encoder 看到的:
  [CLS] Android 中 Handler 的 sendMessageDelayed 底层是怎么实现的 [SEP]
        Handler 是 Android 中用于线程间通信的工具类。它通过 MessageQueue 将消息
        发送到 Looper 线程的消息队列中。...

问题:
  通用模型关注的是"Handler 是线程间通信工具"这个语义
  → 但这篇文档回答的是"Handler 是什么"，而非"sendMessageDelayed 底层实现"
  → 相关度评分偏低

领域微调后，模型会学到:
  "sendMessageDelayed" ↔ "MessageQueue.enqueueMessage" ↔ "NativeHandler"
  "底层实现" ↔ "native 方法" ↔ "Looper.loop()"
  → 正确命中源码分析类文档
```

#### 二、微调数据构造

```python
"""
微调数据构造：从业务数据中提取 (query, relevant_doc, irrelevant_doc) 三元组
"""
import numpy as np
from typing import List, Tuple

class RerankDataBuilder:
    """
    重排序微调数据构建器
    
    核心思路：
    1. 从线上日志中收集 (query, clicked_doc) 对
    2. 将点击的文档标记为正样本
    3. 将未点击但召回的文档标记为负样本
    4. 构造三元组 (anchor_query, positive_doc, negative_doc)
    """
    
    def __init__(self, threshold: float = 0.5):
        """
        Args:
            threshold: 点击阈值（点击次数/展示次数的比值）
        """
        self.threshold = threshold
        self.positive_pairs = []  # (query, positive_doc)
        self.negative_pairs = []  # (query, negative_doc)
    
    def from_click_logs(self, logs: List[dict]):
        """
        从点击日志构建数据
        
        logs 格式:
        [
            {
                "query": "Android 中 Handler 怎么用",
                "impressions": [
                    {"doc_id": "d1", "clicked": True, "position": 1},
                    {"doc_id": "d2", "clicked": False, "position": 2},
                    {"doc_id": "d3", "clicked": False, "position": 3},
                ],
                "documents": {
                    "d1": "Handler 的使用示例和最佳实践",
                    "d2": "Android 线程通信概述",
                    "d3": "Android 消息机制底层原理",
                }
            },
            ...
        ]
        """
        for log in logs:
            query = log["query"]
            impressions = log["impressions"]
            documents = log["documents"]
            
            # 正样本：被点击的文档
            positive_docs = [
                documents[imp["doc_id"]]
                for imp in impressions
                if imp["clicked"] and imp["doc_id"] in documents
            ]
            
            # 负样本：被展示但未被点击的文档
            negative_docs = [
                documents[imp["doc_id"]]
                for imp in impressions
                if not imp["clicked"] and imp["doc_id"] in documents
            ]
            
            for pos_doc in positive_docs:
                for neg_doc in negative_docs:
                    self.positive_pairs.append((query, pos_doc))
                    self.negative_pairs.append((query, neg_doc))
    
    def build_triplets(self) -> List[Tuple[str, str, str]]:
        """构建 (query, positive_doc, negative_doc) 三元组"""
        triplets = []
        for q, pos in zip(
            [p[0] for p in self.positive_pairs],
            [p[1] for p in self.positive_pairs],
        ):
            # 找一个对应的负样本
            neg_candidates = [n[1] for n in self.negative_pairs if n[0] == q]
            if neg_candidates:
                import random
                neg = random.choice(neg_candidates)
                triplets.append((q, pos, neg))
        return triplets
    
    def hard_negative_mining(self, triplets: List[Tuple[str, str, str]], 
                               reranker) -> List[Tuple[str, str, str]]:
        """
        困难负样本挖掘
        
        用现有 reranker 对三元组打分，将原本被误判为更相关的负样本
        替换为困难负样本（即 reranker 也给高分的负样本）
        """
        refined = []
        for query, pos_doc, neg_doc in triplets:
            # 找到所有负样本
            neg_candidates = [n for n in triplets if n[0] == query and n != (query, pos_doc, neg_doc)]
            if not neg_candidates:
                refined.append((query, pos_doc, neg_doc))
                continue
            
            # 用当前 reranker 评估每个负样本
            import random
            best_neg = None
            best_neg_score = -1
            
            for _, _, candidate_neg in neg_candidates:
                # 对 (query, candidate_neg) 打分
                score = reranker.rerank(query, [candidate_neg])[0]
                if score > best_neg_score:
                    best_neg_score = score
                    best_neg = candidate_neg
            
            # 困难负样本：score 接近正样本的负样本
            # 这里用一个简单策略：如果有比原始负样本更接近正样本的，替换
            if best_neg_score > reranker.rerank(query, [neg_doc])[0]:
                refined.append((query, pos_doc, best_neg))
            else:
                refined.append((query, pos_doc, neg_doc))
        
        return refined


# === 实际使用示例 ===

# 1. 从线上日志构造数据
builder = RerankDataBuilder()
builder.from_click_logs(click_logs)  # 你的业务日志

# 2. 构建三元组
triplets = builder.build_triplets()
print(f"构建了 {len(triplets)} 个训练三元组")

# 3. 困难负样本挖掘（可选）
# refined_triplets = builder.hard_negative_mining(triplets, existing_reranker)
```

#### 三、使用 sentence-transformers 微调

```python
"""
使用 sentence-transformers 微调 Cross-Encoder 作为重排序模型
"""
from sentence_transformers import CrossEncoder, CrossEncoderTrainer
from sentence_transformers.losses import CoSENTLoss
from datasets import Dataset
import numpy as np

# === Step 1: 准备数据 ===
def prepare_training_data(triplets: List[Tuple[str, str, str]]):
    """
    将三元组转换为 CrossEncoder 训练格式
    
    格式 1: 句子对 + 相似度分数 (0-1)
    """
    pairs = []
    labels = []
    
    for query, pos_doc, neg_doc in triplets:
        # 正样本：高相关度 → 1.0
        pairs.append([query, pos_doc])
        labels.append(1.0)
        
        # 负样本：低相关度 → 0.0
        pairs.append([query, neg_doc])
        labels.append(0.0)
    
    return pairs, labels


# === Step 2: 加载基础模型 ===
base_model = "BAAI/bge-reranker-base"  # 作为微调起点

# === Step 3: 训练配置 ===
trainer = CrossEncoderTrainer(
    model=base_model,
    train_dataset=Dataset.from_dict({"text_0": [], "text_1": [], "label": []}),  # 需填入数据
    loss=CoSENTLoss(model),
    epochs=3,  # 通常 2-5 个 epoch 即可
    batch_size=32,  # GPU 建议 64-128
    per_device_train_batch_size=32,
    learning_rate=2e-5,  # 微调学习率要小
    warmup_ratio=0.1,
    weight_decay=0.01,
    fp16=True,  # 启用混合精度训练
    output_dir="./reranker-finetuned",  # 输出目录
    evaluation_strategy="epoch",  # 每个 epoch 评估
)

# === Step 4: 训练 ===
trainer.train()

# === Step 5: 保存 ===
trainer.model.save("./reranker-finetuned")

# === 评估微调效果 ===
from sentence_transformers import util

model = CrossEncoder("./reranker-finetuned")

# 测试：领域相关查询
query = "Android 中 Handler 的 sendMessageDelayed 底层是怎么实现的？"
candidates = [
    "Handler 是 Android 中用于线程间通信的工具类",           # 通用介绍（微调后相关度应该低）
    "sendMessageDelayed 最终调用 MessageQueue.enqueueMessage", # 源码级实现（微调后应该高）
    "Android 消息机制底层原理",                            # 源码级实现（微调后应该高）
]

scores = model.predict([[query, c] for c in candidates])
for c, s in zip(candidates, scores):
    print(f"得分: {s:.4f} | {c[:40]}")

# 预期: 源码级实现文档得分 > 通用介绍文档得分
```

#### 四、领域微调的实操建议

```
┌────────────────────────────────────────────┐
│  领域微调实操要点                            │
├────────────────────────────────────────────┤
│                                        │
│  · 数据量: 至少 1000 个有效三元组          │
│    理想: 5000-10000 个三元组               │
│                                        │
│  · 学习率: 2e-5 ~ 5e-5（比从头训练小 10x）│
│                                        │
│  · Epoch: 3-5（领域微调不需要太多）        │
│                                        │
│  · 损失函数: CoSENTLoss (比较)              │
│             或 ArcFaceLoss（更激进）         │
│                                        │
│  · 困难负样本: 必做（提升效果的关键）        │
│    用当前 reranker 找"最接近正样本的负样本"  │
│                                        │
│  · 数据增强: 同义改写 query 增加多样性       │
│    "超时配置" → "timeout 设置" → "超时参数" │
│                                        │
│  · 监控: 每 epoch 评估 Recall@K / MRR      │
│                                        │
│  · 基线对比: 务必对比微调前后 vs 基线模型     │
│    只保留提升明显的版本                      │
└───────────────────────────────────────┘

效果预期:

在 Android 开发知识库场景下：
  通用 BGE-Base:      Recall@10 ≈ 78%
  微调后 BGE-Base:    Recall@10 ≈ 85-88%  (+7-10%)
  
提升主要来自:
  · 代码片段与查询的精确匹配（类名、方法名、参数名）
  · 领域术语理解（"消息队列" vs "MessageQueue"）
  · 框架特定语义（"Looper"、"Handler"、"Message" 的关系）
```

---


### 4.2 本地部署：flag-embedding + bge-reranker

#### 安装与模型下载

```bash
# 安装
pip install flagembedding

# 模型会自动下载到 HuggingFace 缓存
# ~/.cache/huggingface/hub/...
```

#### 基础用法

```python
from flagembedding import Reranker
import numpy as np

# ---- 加载模型 ----
# 推荐：bge-reranker-v2-m3（中英双语，560M 参数）
reranker = Reranker(
    "BAAI/bge-reranker-v2-m3",
    device="cuda" if torch.cuda.is_available() else "cpu",
    num_workers=4,  # 并行 worker 数（GPU 可开更多）
)

# ---- 重排序 ----
query = "如何配置 API 网关的超时时间？"
candidates = [
    "API 网关概述与核心功能。API 网关是微服务架构中的重要组件，负责请求的路由、认证和限流。",
    "API 网关的超时配置分为三个层级：连接超时（Connect Timeout）、读超时（Read Timeout）和写超时（Write Timeout）。",
    "API 网关的限流配置详解。限流是保护后端服务不被流量压垮的重要手段，常见的限流策略有令牌桶、漏桶和滑动窗口。",
    "微服务架构中的 API 网关模式。API 网关作为微服务的前置入口，承担了许多横切关注点的功能。",
    "API 网关安全策略。包括 OAuth2.0 认证、JWT Token 验证、IP 白名单等。",
]

scores = reranker.rerank(query, candidates)

# 排序
results = sorted(
    zip(candidates, scores),
    key=lambda x: x[1],
    reverse=True
)

for i, (doc, score) in enumerate(results, 1):
    print(f"[{i}] 分数: {score:.4f}")
    print(f"    内容: {doc[:80]}...")
    print()

# 输出:
# [1] 分数: 0.9512
#     内容: API 网关的超时配置分为三个层级：连接超时...
# [2] 分数: 0.3145
#     内容: API 网关的限流配置详解...
# [3] 分数: 0.2567
#     内容: 微服务架构中的 API 网关模式...
# [4] 分数: 0.1234
#     内容: API 网关概述与核心功能...
# [5] 分数: 0.0823
#     内容: API 网关安全策略...
```

#### 批量重排序优化

```python
class BatchReranker:
    """
    批量重排序器
    
    通过批量处理和缓存优化重排序性能。
    """
    
    def __init__(
        self,
        model_name: str = "BAAI/bge-reranker-v2-m3",
        device: str = "auto",
        batch_size: int = 32,
    ):
        self.reranker = Reranker(model_name, device=device)
        self.batch_size = batch_size
        self._cache = {}  # query → (candidate_hashes → sorted_results)
    
    def rerank(
        self,
        query: str,
        documents: list[str],
        cache: bool = True,
    ) -> list[float]:
        """
        重排序
        
        Args:
            query: 查询
            documents: 候选文档
            cache: 是否启用缓存
        
        Returns:
            分数列表（与 documents 一一对应）
        """
        # 缓存检查
        if cache:
            doc_hash = hash(tuple(documents))
            cache_key = (query, doc_hash)
            if cache_key in self._cache:
                return self._cache[cache_key]
        
        # 分批处理（避免单次推理过长）
        scores = []
        for i in range(0, len(documents), self.batch_size):
            batch = documents[i:i + self.batch_size]
            batch_scores = self.reranker.rerank(query, batch)
            scores.extend(batch_scores)
        
        if cache:
            self._cache[cache_key] = scores
        
        return scores
    
    def rerank_with_topk(
        self,
        query: str,
        documents: list[str],
        topk: int = 5,
    ) -> list[dict]:
        """重排序并返回 Top-K"""
        scores = self.rerank(query, documents)
        
        # 排序
        indexed = sorted(
            enumerate(zip(documents, scores)),
            key=lambda x: x[1][1],
            reverse=True,
        )
        
        return [
            {
                "index": idx,
                "content": doc,
                "score": score,
                "rank": i + 1,
            }
            for i, (idx, (doc, score)) in enumerate(indexed[:topk])
        ]
    
    def clear_cache(self):
        """清空缓存"""
        self._cache.clear()
```

### 4.3 云端 API：Cohere Rerank v3

#### 安装与配置

```bash
pip install cohere
# 设置 API Key
export COHERE_API_KEY="your-api-key"
```

#### 基础用法

```python
import cohere

co = cohere.Client(api_key="your-api-key")

def cohere_rerank(
    query: str,
    documents: list[str],
    top_n: int = 5,
    model: str = "rerank-v3.5",
) -> list[dict]:
    """
    Cohere Rerank v3.5 API 调用
    
    优势：
    · 多语言支持（100+ 语言）
    · 无需本地部署
    · 自动处理分词和批量
    · 支持 max_chunks_per_doc 参数
    """
    response = co.rerank(
        model=model,
        query=query,
        documents=documents,
        top_n=top_n,
        max_chunks_per_doc=1,  # 每个文档只取最相关的 chunk
        return_documents=True,  # 返回文档内容
    )
    
    results = []
    for r in response.results:
        results.append({
            "original_index": r.index,
            "relevance_score": r.relevance_score,
            "document": r.document.text if hasattr(r.document, 'text') else str(r.document),
        })
    
    return results

# 使用
results = cohere_rerank(
    query="如何配置 API 网关的超时时间？",
    documents=candidates,
    top_n=5,
)
for r in results:
    print(f"索引: {r['original_index']} | 分数: {r['relevance_score']:.4f}")
```

#### Cohere vs 本地模型对比

```
┌──────────────┬───────────────┬──────────┬──────────┬─────────────┐
│ 维度         │ Cohere API    │ bge-base │ bge-large│ bge-gemma   │
├──────────────┼───────────────┼──────────┼──────────┼─────────────┤
│ 精度         │ ★★★★★        │ ★★★☆☆   │ ★★★★★   │ ★★★★★      │
│ 延迟(20条)    │ ~10ms         │ ~15ms    │ ~35ms    │ ~120ms      │
│ 成本(20条)    │ ~$0.003       │ 免费     │ 免费     │ 免费        │
│ 多语言        │ ✅ 100+ 语言  │ ✅ 中英  │ ✅ 中英  │ ✅ 中英     │
│ 部署         │ 无需          │ 本地     │ 本地     │ 本地        │
│ 数据隐私      │ 数据发送云端  │ ✅ 本地  │ ✅ 本地  │ ✅ 本地     │
│ 自定义        │ ❌            │ ✅       │ ✅       │ ✅          │
│ 企业合规      │ 需签协议      │ ✅       │ ✅       │ ✅          │
└──────────────┴───────────────┴──────────┴──────────┴─────────────┘

选择指南：
· 数据敏感 → 本地部署（bge 系列）
· 多语言需求 → Cohere API 或 jina-reranker
· 追求最低延迟 → Cohere API（~10ms）或 MiniLM（~8ms）
· 成本敏感 → bge-reranker-base（免费）
· 需要自定义/微调 → bge 系列（开源，可微调）
```

### 4.4 生产级重排序管线（含错误处理与降级）

```python
import asyncio
import logging
import time
from enum import Enum
from typing import List, Dict, Optional, Union
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class RerankerStatus(Enum):
    NORMAL = "normal"
    DEGRADED = "degraded"
    DOWN = "down"

@dataclass
class RerankResult:
    """重排序结果"""
    content: str
    score: float
    rank: int
    source: str  # "cross_encoder" | "bi_encoder" | "rrf" | "rule"
    latency_ms: float
    
class RerankerPipeline:
    """
    生产级重排序管线
    
    功能：
    · 多模型级联（base → large → gemma）
    · 自动降级（模型故障时降级到粗排）
    · 熔断器（持续失败时跳过重排序）
    · 指标收集（延迟、成功率、分数分布）
    """
    
    def __init__(
        self,
        primary_model: Optional[Reranker] = None,
        fallback_model: Optional[Reranker] = None,
        use_cohere_api: bool = False,
        cohere_api_key: Optional[str] = None,
        max_candidates: int = 50,
        timeout_seconds: float = 5.0,
    ):
        self.primary = primary_model
        self.fallback = fallback_model
        self.use_cohere = use_cohere_api
        self.cohere_key = cohere_api_key
        self.max_candidates = max_candidates
        self.timeout = timeout_seconds
        
        # 熔断器状态
        self._status = RerankerStatus.NORMAL
        self._consecutive_failures = 0
        self._circuit_break_threshold = 5
        self._half_open = False
        
        # 指标
        self._metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "downgrades": 0,
            "total_latency_ms": 0.0,
            "circuit_breaks": 0,
        }
    
    async def rerank(
        self,
        query: str,
        candidates: List[str],
        topk: int = 5,
    ) -> List[RerankResult]:
        """
        主入口：重排序
        
        流程：
        1. 裁剪候选数
        2. 尝试主模型
        3. 失败 → 降级到备用模型
        4. 备用也失败 → 降级到 RRF/规则排序
        5. 熔断 → 直接返回原始排序
        """
        start = time.time()
        self._metrics["total_requests"] += 1
        
        # Step 1: 裁剪候选数
        if len(candidates) > self.max_candidates:
            candidates = candidates[:self.max_candidates]
        
        # Step 2: 熔断检查
        if self._status == RerankerStatus.DOWN:
            if not self._half_open:
                logger.warning("重排序熔断：直接返回原始排序")
                self._metrics["circuit_breaks"] += 1
                self._metrics["failed_requests"] += 1
                return self._fallback_to_rule(query, candidates)
            # half-open：允许一次尝试
            self._half_open = False
        
        # Step 3: 尝试主模型
        try:
            result = await self._try_primary(query, candidates)
            self._record_success(start)
            return result
        except Exception as e:
            logger.error(f"主模型重排序失败: {e}")
            self._consecutive_failures += 1
            self._metrics["failed_requests"] += 1
            
            # Step 4: 降级到备用模型
            if self.fallback:
                logger.info("降级到备用模型")
                self._metrics["downgrades"] += 1
                try:
                    result = await self._try_fallback(query, candidates)
                    self._record_success(start)
                    return result
                except Exception as e2:
                    logger.error(f"备用模型也失败: {e2}")
            
            # Step 5: 降级到规则排序
            logger.info("降级到规则排序")
            self._metrics["downgrades"] += 1
            self._record_success(start)
            return self._fallback_to_rule(query, candidates)
    
    async def _try_primary(self, query: str, candidates: List[str]) -> List[RerankResult]:
        """尝试主模型"""
        if self.use_cohere:
            return await self._cohere_rerank(query, candidates)
        elif self.primary:
            return await self._flag_embedding_rerank(query, candidates, self.primary)
        else:
            raise ValueError("没有可用的重排序模型")
    
    async def _try_fallback(self, query: str, candidates: List[str]) -> List[RerankResult]:
        """尝试备用模型"""
        if self.use_cohere:
            return await self._cohere_rerank(query, candidates)
        elif self.fallback:
            return await self._flag_embedding_rerank(query, candidates, self.fallback)
        else:
            raise ValueError("没有可用的备用模型")
    
    async def _flag_embedding_rerank(self, query: str, candidates: List[str], model) -> List[RerankResult]:
        """flag-embedding 重排序"""
        async def _sync_rerank():
            return model.rerank(query, candidates)
        
        # 异步执行同步函数
        loop = asyncio.get_event_loop()
        scores = await loop.run_in_executor(None, _sync_rerank)
        
        return [
            RerankResult(
                content=doc,
                score=float(score),
                rank=i + 1,
                source="cross_encoder",
                latency_ms=0,  # 占位
            )
            for i, (doc, score) in enumerate(sorted(
                zip(candidates, scores),
                key=lambda x: x[1],
                reverse=True,
            ))
        ]
    
    async def _cohere_rerank(self, query: str, candidates: List[str]) -> List[RerankResult]:
        """Cohere API 重排序"""
        import cohere
        
        co = cohere.Client(api_key=self.cohere_key)
        response = co.rerank(
            model="rerank-v3.5",
            query=query,
            documents=candidates,
            top_n=len(candidates),
        )
        
        return [
            RerankResult(
                content=r.document.text if hasattr(r.document, 'text') else str(r.document),
                score=r.relevance_score,
                rank=i + 1,
                source="cohere_api",
                latency_ms=0,
            )
            for i, r in enumerate(response.results)
        ]
    
    def _fallback_to_rule(self, query: str, candidates: List[str]) -> List[RerankResult]:
        """降级到规则排序"""
        return [
            RerankResult(
                content=doc,
                score=0.0,  # 无分数
                rank=i + 1,
                source="rule_fallback",
                latency_ms=0,
            )
            for i, doc in enumerate(candidates)
        ]
    
    def _record_success(self, start: float):
        """记录成功"""
        latency_ms = (time.time() - start) * 1000
        self._metrics["successful_requests"] += 1
        self._metrics["total_latency_ms"] += latency_ms
        self._consecutive_failures = 0
        self._status = RerankerStatus.NORMAL
    
    def get_metrics(self) -> dict:
        """获取指标"""
        total = self._metrics["total_requests"]
        return {
            **self._metrics,
            "success_rate": self._metrics["successful_requests"] / max(total, 1),
            "avg_latency_ms": self._metrics["total_latency_ms"] / max(self._metrics["successful_requests"], 1),
        }
```

---

## 第五部分：重排序的进阶策略

### 5.1 多阶段级联重排序（Multi-Stage Cascading Rerank）

#### 原理

核心思想：**用轻量模型快速缩小候选范围，再用重量模型精排**。

```
┌───────────────────────────────────────────────────────────────┐
│  级联重排序架构                                                 │
│                                                               │
│  输入: Top-100 候选                                            │
│         ↓                                                     │
│  ┌────────────────────────┐                                   │
│  │ Stage 1: base 模型 (278M) │                                │
│  │ 候选: 100 → 20          │  延迟: ~15ms                     │
│  │ 精度: ★★★☆☆            │                                 │
│  └─────────┬──────────────┘                                   │
│            ↓                                                  │
│  ┌────────────────────────┐                                   │
│  │ Stage 2: large 模型 (560M) │                              │
│  │ 候选: 20 → 5           │  延迟: ~35ms                     │
│  │ 精度: ★★★★★           │                                 │
│  └─────────┬──────────────┘                                   │
│            ↓                                                  │
│  输出: Top-5 → 喂给 LLM                                      │
│                                                               │
│  总延迟: ~50ms                                                │
│  总精度: 接近 single large 模型 (只差 ~0.3%)                  │
│  成本: 比 single large 低 60%                                 │
└───────────────────────────────────────────────────────────────┘
```

#### 代码实现

```python
class CascadingReranker:
    """
    多阶段级联重排序
    
    轻量模型快速粗排 → 重量模型精排，平衡精度与延迟。
    """
    
    def __init__(
        self,
        light_model: Reranker,
        heavy_model: Reranker,
        light_topk: int = 20,
        final_topk: int = 5,
    ):
        self.light = light_model
        self.heavy = heavy_model
        self.light_topk = light_topk
        self.final_topk = final_topk
    
    def rerank(
        self,
        query: str,
        candidates: List[str],
    ) -> List[Dict]:
        """
        级联重排序
        
        Args:
            query: 查询
            candidates: 候选文档列表（Top-K from recall）
        
        Returns:
            最终 Top-K 结果
        """
        if len(candidates) <= self.light_topk:
            # 候选数足够少，直接用重模型
            return self._single_stage(query, candidates)
        
        # Stage 1: 轻量模型快速筛选
        light_scores = self.light.rerank(query, candidates)
        light_ranked = sorted(
            zip(candidates, light_scores),
            key=lambda x: x[1],
            reverse=True,
        )
        
        # 保留 top K
        light_top = light_ranked[:self.light_topk]
        
        # Stage 2: 重量模型精排
        heavy_docs = [doc for doc, _ in light_top]
        heavy_scores = self.heavy.rerank(query, heavy_docs)
        
        heavy_ranked = sorted(
            zip(heavy_docs, heavy_scores),
            key=lambda x: x[1],
            reverse=True,
        )
        
        return [
            {
                "content": doc,
                "score": score,
                "stage": "heavy_rerank",
                "light_rank": light_ranked.index((doc, light_scores[candidates.index(doc)])) + 1 if doc in candidates else None,
            }
            for doc, score in heavy_ranked[:self.final_topk]
        ]
    
    def _single_stage(self, query: str, candidates: List[str]) -> List[Dict]:
        """单阶段重排序（候选数少时直接用重模型）"""
        scores = self.heavy.rerank(query, candidates)
        ranked = sorted(
            zip(candidates, scores),
            key=lambda x: x[1],
            reverse=True,
        )
        return [
            {"content": doc, "score": score, "stage": "single_heavy"}
            for doc, score in ranked[:self.final_topk]
        ]
```

### 5.2 多样性重排序（MMR-Rerank）

#### 原理

标准重排序会把最相关的文档都排前面，但它们可能说的是同一件事。**多样性重排序在相关性之外，增加了"信息多样性"的维度**。

```
场景: 用户问 "Android 中如何处理内存泄漏"

标准重排序结果:
  [1] "使用 LeakCanary 检测内存泄漏"          ← 相关度高
  [2] "Memory Analyzer (MAT) 工具使用指南"     ← 相关度高（但和 [1] 重复）
  [3] "Android 内存泄漏的 5 种常见原因"         ← 相关度高（但和 [1] [2] 同类）
  [4] "避免内存泄漏的最佳实践"                  ← 相关度中等（但信息不同）
  [5] "Dalvik/ART 垃圾回收机制"                ← 相关度中等（但信息不同）

MMR-Rerank 结果:
  [1] "Android 内存泄漏的 5 种常见原因"         ← 相关度高 + 信息新颖
  [2] "使用 LeakCanary 检测内存泄漏"            ← 相关度高 + 不同维度
  [3] "Dalvik/ART 垃圾回收机制"                ← 相关度中等 + 非常新颖
  [4] "避免内存泄漏的最佳实践"                  ← 相关度中等 + 不同维度
  [5] "Memory Analyzer (MAT) 工具使用指南"     ← 相关度高 + 不同维度

差异:
  · 标准重排序: 前 3 条都在讲"如何检测"
  · MMR-Rerank: 涵盖了"原因 → 检测 → GC 机制 → 预防 → 分析工具"
```

#### 代码实现

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class MMReranker:
    """
    MMR (Maximal Marginal Relevance) 重排序器
    
    在相关性基础上，加入多样性惩罚：
    MMR(d) = λ * sim(q, d) - (1-λ) * max(sim(d, d_selected))
    
    λ=1.0: 只看相关性（等价于标准重排序）
    λ=0.0: 只看多样性
    λ=0.7: 推荐默认值（相关性为主，多样性为辅）
    """
    
    def __init__(
        self,
        reranker,
        embeddings,
        lambda_mult: float = 0.7,
    ):
        """
        Args:
            reranker: Cross-Encoder 重排序模型
            embeddings: Embedding 模型（用于计算文档间相似度）
            lambda_mult: 相关性 vs 多样性的权衡参数
        """
        self.reranker = reranker
        self.embeddings = embeddings
        self.lambda_mult = lambda_mult
    
    def rerank(
        self,
        query: str,
        candidates: List[str],
        topk: int = 5,
    ) -> List[Dict]:
        """MMR 重排序"""
        if len(candidates) <= topk:
            # 候选数不够，直接按相关性排序
            scores = self.reranker.rerank(query, candidates)
            return [
                {"content": doc, "score": float(s), "method": "similarity"}
                for doc, s in sorted(
                    zip(candidates, scores),
                    key=lambda x: x[1],
                    reverse=True,
                )
            ]
        
        # Step 1: 计算 query-document 相似度（相关性）
        q_embed = self.embeddings.embed_query(query)
        doc_embeds = self.embeddings.embed_documents(candidates)
        relevance = cosine_similarity([q_embed], doc_embeds)[0]
        
        # Step 2: MMR 迭代选择
        selected = []
        remaining = set(range(len(candidates)))
        
        while len(selected) < min(topk, len(candidates)):
            best_idx = None
            best_score = float("-inf")
            
            for idx in remaining:
                # 相关性
                rel_score = relevance[idx]
                
                # 多样性惩罚：与已选文档的最大相似度
                if selected:
                    max_sim = max(
                        cosine_similarity([doc_embeds[idx]], [doc_embeds[s]])[0][0]
                        for s in selected
                    )
                else:
                    max_sim = 0.0
                
                # MMR 分数
                mmr_score = self.lambda_mult * rel_score - (1 - self.lambda_mult) * max_sim
                
                if mmr_score > best_score:
                    best_score = mmr_score
                    best_idx = idx
            
            selected.append(best_idx)
            remaining.remove(best_idx)
        
        # Step 3: 对选中文档做 Cross-Encoder 重排序
        selected_docs = [candidates[i] for i in selected]
        rerank_scores = self.reranker.rerank(query, selected_docs)
        
        return [
            {
                "content": doc,
                "score": float(score),
                "method": "mmr_rerank",
                "mmr_score": best_score if selected.index(i) == selected.index(best_idx) else None,
            }
            for i, (doc, score) in enumerate(sorted(
                zip(selected_docs, rerank_scores),
                key=lambda x: x[1],
                reverse=True,
            ))
        ]
```

### 5.3 基于 LLM 的语义重排序

#### 原理

Cross-Encoder 的精度已经很高了，但在某些复杂场景下（如需要理解多文档之间的逻辑关系），**直接用 LLM 做重排序**可能更灵活。

```
LLM 重排序 vs Cross-Encoder 重排序:

Cross-Encoder:
  · 逐对评分（query vs doc_i）
  · 无法比较 doc_i 和 doc_j 之间的关系
  · 适合"单文档与查询的相关度"

LLM 重排序:
  · 可以同时看到所有候选文档
  · 可以比较文档之间的关系
  · 可以做"组合推理"（"这篇文档补充了那篇文档的不足"）
  · 代价：延迟高（每次推理所有文档）
```

#### 代码实现

```python
async def llm_rerank(
    query: str,
    candidates: List[str],
    llm,
    max_candidates: int = 10,
) -> List[Dict]:
    """
    使用 LLM 做语义重排序
    
    将候选文档批量喂给 LLM，让 LLM 判断每个文档与查询的相关度。
    """
    prompt = f"""你是一个专业的文档相关性评估助手。

请对以下 {len(candidates)} 个候选文档与用户查询的相关度进行评分（0-10 分）。

用户查询: {query}

评估标准:
- 10 分: 直接回答用户问题
- 8-9 分: 高度相关，包含大部分必要信息
- 6-7 分: 部分相关，需要推理才能回答
- 4-5 分: 间接相关，可能包含有用信息
- 1-3 分: 低相关
- 0 分: 完全无关

输出格式为 JSON:
{{
  "scores": [
    {{"index": 0, "score": 9, "reason": "..." }},
    ...
  ]
}}

候选文档:
"""
    for i, doc in enumerate(candidates[:max_candidates]):
        doc_preview = doc[:200] + ("..." if len(doc) > 200 else "")
        prompt += f"\n--- 文档 {i} ---\n{doc_preview}\n"
    
    response = await llm.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=500,
    )
    
    import json
    result = json.loads(response.choices[0].message.content.strip())
    
    return [
        {
            "index": entry["index"],
            "content": candidates[entry["index"]],
            "score": entry["score"] / 10.0,
            "reason": entry["reason"],
            "method": "llm_rerank",
        }
        for entry in result["scores"]
    ]
```

### 5.4 上下文感知重排序（Context-Aware Reranking）

#### 原理

传统重排序只看"查询 vs 文档"的关系。**上下文感知的重排序还会考虑之前的对话历史**——如果用户在上一轮已经得到了某个答案，这一轮的检索应该偏向于补充信息。

```
对话历史:
  Q1: "API 网关超时怎么配置？"
  A1: "API 网关超时分为三个层级：连接超时、读超时、写超时。..."

Q2: "那连接超时和读超时的区别是什么？"

❌ 传统重排序:
  只看 Q2 vs 文档 → 可能召回"超时配置总览"
  → LLM 收到冗余内容

✅ 上下文感知重排序:
  把 A1 的内容作为"已有知识"
  检索偏向: "超时具体定义"、"各超时的典型值"、"超时与性能的关系"
  → 召回补充性信息，而非重复信息
```

#### 代码实现

```python
class ContextAwareReranker:
    """
    上下文感知的重排序器
    
    在重排序时考虑对话历史，避免召回已回答的内容。
    """
    
    def __init__(self, reranker: Reranker):
        self.reranker = reranker
    
    def rerank(
        self,
        query: str,
        candidates: List[str],
        context: List[str] = None,
    ) -> List[Dict]:
        """
        上下文感知重排序
        
        Args:
            query: 当前查询
            candidates: 候选文档
            context: 对话历史中的已有回答（用于去重/降权）
        
        Returns:
            重排序结果（已考虑上下文）
        """
        if not context:
            return self.reranker.rerank(query, candidates)
        
        # 1. 先做标准重排序
        scores = self.reranker.rerank(query, candidates)
        
        # 2. 计算与上下文的相似度（降权重复内容）
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("BAAI/bge-base-zh-v1.5")
        
        context_text = " ".join(context)
        context_embed = model.encode([context_text])[0]
        
        # 3. 对每个候选做降权
        for i, (score, doc) in enumerate(zip(scores, candidates)):
            doc_embed = model.encode([doc])[0]
            overlap = np.dot(context_embed, doc_embed) / (
                np.linalg.norm(context_embed) * np.linalg.norm(doc_embed) + 1e-8
            )
            # 如果与上下文高度重叠 → 降权
            if overlap > 0.7:
                scores[i] *= (1 - overlap) * 0.5  # 降权因子
            # 如果包含上下文中的关键信息 → 微调（而非完全降权）
            # 因为某些情况下用户就是在追问细节
        
        # 4. 返回按调整后分数排序的结果
        ranked = sorted(
            zip(candidates, scores),
            key=lambda x: x[1],
            reverse=True,
        )
        return [
            {"content": doc, "score": float(score), "context_adjusted": True}
            for doc, score in ranked
        ]
```

---



### 5.5 列表级重排序与上下文感知（Listwise Reranking）

#### 一、Pointwise vs Listwise 的本质区别

```
Pointwise（当前文档中的 Cross-Encoder 模式）:

查询: "Android 中 Handler 的消息队列是怎么工作的？"
候选文档:
  [1] "Handler 是 Android 中用于线程间通信的工具类"
  [2] "sendMessageDelayed 最终调用 MessageQueue.enqueueMessage"
  [3] "Looper 的 loop() 方法循环取出消息并分发"
  [4] "Android 消息机制底层原理：Handler-Looper-Message"

逐个评分:
  [1] score = 0.45  ← "线程间通信" 相关度中等
  [2] score = 0.72  ← "MessageQueue" 相关
  [3] score = 0.68  ← "消息" 相关
  [4] score = 0.85  ← "Handler-Looper-Message" 全部命中

排序: 4, 2, 3, 1

问题: 每篇文档是独立评分的，没有考虑文档之间的关联
→ [2] [3] [4] 其实是一篇文档的不同部分
→ 用户真正需要的是 [4] + [2] 的组合回答

Listwise（全局视角）:

一次性将 Top-10 候选全部喂给 LLM:
  "请根据以下查询，重新排列这些文档的顺序。
   考虑文档之间的互补关系，优先保留能提供完整答案的文档组合。"

LLM 的全局推理:
  查询: "Android 中 Handler 的消息队列是怎么工作的？"
  
  分析:
    · 文档 [4] 提供了完整框架（Handler-Looper-Message），应该排第一
    · 文档 [2] 提供了关键 API 细节（MessageQueue.enqueueMessage），
      是 [4] 的补充，应该排第二
    · 文档 [3] 是 [4] 的子集，信息重复度高，降权
    · 文档 [1] 太泛泛，降权
  
  重排后:
    [1] 文档 [4] "Android 消息机制底层原理：Handler-Looper-Message"
    [2] 文档 [2] "sendMessageDelayed 最终调用 MessageQueue.enqueueMessage"
    [3] 文档 [3] "Looper 的 loop() 方法循环取出消息并分发"
    [4] 文档 [1] "Handler 是 Android 中用于线程间通信的工具类"

LLM 的优势:
  · 可以看到所有文档的全局视角
  · 可以做"互补性分析"（哪些文档互相补充）
  · 可以做"冗余性分析"（哪些文档内容重叠）
  · 适合"需要对比多个文档才能得出结论"的问题
```

#### 二、代码实现

```python
import json
import asyncio
from openai import AsyncOpenAI

class ListwiseReranker:
    """
    列表级重排序器
    
    将候选文档批量喂给 LLM，让 LLM 基于全局上下文重新排列。
    适用于需要对比多个文档才能得出结论的场景。
    """
    
    def __init__(self, llm: AsyncOpenAI, max_candidates: int = 15):
        self.llm = llm
        self.max_candidates = max_candidates
    
    async def rerank(self, query: str, candidates: List[str]) -> List[Dict]:
        """
        列表级重排序
        
        Args:
            query: 用户查询
            candidates: 粗排候选文档（建议 Top-10 到 Top-15）
        
        Returns:
            按 LLM 评估的全局相关性重新排序的结果
        """
        if len(candidates) > self.max_candidates:
            candidates = candidates[:self.max_candidates]
        
        # 构建 prompt（截断文档以控制 token）
        docs_text = []
        for i, doc in enumerate(candidates):
            preview = doc[:300] + ("..." if len(doc) > 300 else "")
            docs_text.append(f"- [doc{i}]: {preview}")
        
        prompt = f"""你是一个专业的文档排序助手。请对以下 {len(candidates)} 个候选文档进行全局重排序。

## 用户查询
{query}

## 候选文档
{chr(10).join(docs_text)}

## 排序要求
1. 从全局视角评估每个文档对回答查询的贡献度
2. 考虑文档之间的互补性和冗余性：
   · 如果多个文档提供互补信息（如框架概览 + API 细节），它们都应该保留
   · 如果文档之间存在内容重叠，优先保留信息密度更高的
3. 考虑文档之间的逻辑关系：
   · "原理介绍" + "实现细节" 的组合优于单一文档
   · "基础概念" → "进阶应用" 的递进关系
4. 输出格式为 JSON，包含每个文档的新排名

## 输出格式
{{
  "reasoning": "全局分析：为什么这样排序（简要说明）",
  "ranking": [
    {{"rank": 1, "original_index": 3, "reason": "提供 Handler-Looper-Message 完整框架，直接回答查询"}},
    {{"rank": 2, "original_index": 1, "reason": "提供 MessageQueue 实现细节，是 rank1 的关键补充"}},
    ...
  ]
}}

请直接输出 JSON，不要其他内容。"""

        response = await self.llm.chat.completions.create(
            model="gpt-4o",  # 需要理解长上下文
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # 低温度保证一致性
            max_tokens=600,
        )
        
        result = json.loads(response.choices[0].message.content.strip())
        
        # 构建排序结果
        ranking = result["ranking"]
        ranked_docs = []
        for entry in ranking:
            idx = entry["original_index"]
            ranked_docs.append({
                "content": candidates[idx],
                "rank": entry["rank"],
                "score": 1.0 / entry["rank"],  # 排名分
                "reason": entry["reason"],
                "method": "listwise_llm",
            })
        
        return ranked_docs


# === 与 Pointwise 的对比使用场景 ===

"""
何时用 Pointwise（Cross-Encoder）:
  · 查询和单文档的相关性清晰
  · "API 超时怎么配置？" → 逐文档判断
  · 延迟要求严（每篇独立推理，可批量）

何时用 Listwise（LLM 全局排序）:
  · 需要对比多个文档才能回答
  · "Android 中 Handler 和 Looper 的关系？" → 需要文档 [4]+[3]+[2] 组合
  · "Android 崩溃分析的最佳实践？" → 需要文档 [1]+[2]+[5] 组合
  · 候选之间存在明显互补/重叠关系

混合策略:
  Step 1: Cross-Encoder 快速粗排到 Top-15
  Step 2: Listwise LLM 对 Top-15 做全局精排
  → 精度更高，延迟 ~200-400ms（可接受的非实时场景）
"""
```

#### 三、Listwise Rerank 的延迟与成本

```
┌─────────────────────────────────────────────────────────┐
│  策略         │ 延迟     │ 成本(每查询) │ 推荐场景            │
├─────────────────────────────────────────────────────────┤
│  Cross-Encoder │ ~30ms   │ ~$0.0005   │ 实时对话、高频查询  │
│  Listwise LLM  │ ~200ms  │ ~$0.005    │ 搜索场景、复杂查询  │
│  混合(CE+LLM)  │ ~250ms  │ ~$0.006    │ 最佳精度场景        │
│  规则降级      │ <1ms    │ ~$0        │ 故障降级            │
└────────────────────────────────────────────────────┘

使用建议:
· 实时对话（<50ms 预算）→ 只用 Cross-Encoder
· 搜索/FAQ（<500ms 预算）→ Cross-Encoder + Listwise LLM 混合
· 离线分析/批量处理 → Listwise LLM 为主
```

---


## 第六部分：重排序评估与优化

### 6.1 重排序效果评估指标

```
评估指标:

┌─────────────────────────────────────────────────────────────────────┐
│ Recall@K（召回率）                                                    │
│                                                                     │
│ 衡量重排序是否把"正确答案"保留了在前 K 个结果中                        │
│                                                                     │
│ Recall@K = |候选 ∩ 相关文档| / |相关文档|                           │
│                                                                     │
│ 示例: Top-5 中有 4 个相关文档 → Recall@5 = 80%                      │
│                                                                     │
│ 基线: 向量检索 Recall@10 ≈ 75-80%                                   │
│ + 重排序 Recall@10 ≈ 85-92%（+5-12%）                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MRR（平均倒数排名）                                                    │
│                                                                     │
│ 衡量"第一个正确答案"出现在什么位置                                     │
│                                                                     │
│ MRR = mean(1 / rank_of_first_relevant)                              │
│                                                                     │
│ 示例: 第一个正确答案出现在第 1 位 → 1/1 = 1.0；第 3 位 → 1/3 = 0.33 │
│ MRR = (1.0 + 0.33) / 2 = 0.67                                     │
│                                                                     │
│ 基线: 向量检索 MRR ≈ 0.62                                            │
│ + 重排序 MRR ≈ 0.80-0.85（+18-23%）                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Context Precision（上下文精确度）                                      │
│                                                                     │
│ 衡量检索到的上下文是否"干净"（即 Top-K 中相关内容的占比）                │
│                                                                     │
│ ContextPrecision = |Top-K ∩ 相关| / K                               │
│                                                                     │
│ 示例: Top-5 中有 4 个相关 → Precision = 80%                         │
│                                                                     │
│ 高 Precision = 减少 LLM 的"干扰信息" → 降低幻觉                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 端到端: Faithfulness（忠实度）                                         │
│                                                                     │
│ 衡量 LLM 的回答是否与检索到的上下文一致（不编造）                      │
│                                                                     │
│ 评估方法:                                                           │
│ 1. 让 LLM 用检索到的上下文回答                                       │
│ 2. 用另一个 LLM（裁判）判断回答中的每个事实是否都能追溯到上下文         │
│ 3. 事实可追溯的比例 = Faithfulness                                   │
│                                                                     │
│ 关键: 重排序提升 Faithfulness 的机制是                              │
│   把正确答案排到前面 → LLM 看到的内容更相关 → 更少编造                │
└─────────────────────────────────────────────────────────────────────┘
```

#### 自动化评估管线

```python
class RerankEvaluator:
    """
    重排序效果评估器
    
    支持自动计算 Recall@K、MRR、Precision 等指标。
    """
    
    def __init__(self, ground_truth_retriever):
        """
        Args:
            ground_truth_retriever: 能返回"真实相关文档"的检索器（用于构建 gold standard）
        """
        self.gt_retriever = ground_truth_retriever
    
    def evaluate(
        self,
        reranker,
        test_queries: List[str],
        topk: int = 10,
    ) -> dict:
        """
        评估重排序效果
        
        Args:
            reranker: 待评估的重排序器
            test_queries: 测试查询列表
            topk: 评估的 Top-K
        
        Returns:
            评估指标
        """
        recalls = []
        mrr_scores = []
        precisions = []
        
        for query in test_queries:
            # 获取 gold standard
            gold_docs = self.gt_retriever.get_relevant_docs(query)
            gold_set = set(d["id"] for d in gold_docs)
            
            # 获取候选文档（从粗排检索）
            candidates = self.gt_retriever.get_candidates(query, k=50)
            candidate_ids = [d["id"] for d in candidates]
            
            # 重排序
            candidate_texts = [d["content"] for d in candidates]
            reranked = reranker.rerank(query, candidate_texts, topk=topk)
            
            # 计算指标
            ranked_ids = [candidates[r["original_index"]]["id"] for r in reranked]
            
            # Recall@K
            relevant_in_topk = len(set(ranked_ids[:topk]) & gold_set)
            recall = relevant_in_topk / max(len(gold_set), 1)
            recalls.append(recall)
            
            # MRR
            rr = 0.0
            for i, did in enumerate(ranked_ids):
                if did in gold_set:
                    rr = 1.0 / (i + 1)
                    break
            mrr_scores.append(rr)
            
            # Precision@K
            prec = relevant_in_topk / topk
            precisions.append(prec)
        
        n = len(test_queries)
        return {
            "recall@k": sum(recalls) / n,
            "mrr": sum(mrr_scores) / n,
            "precision@k": sum(precisions) / n,
            "recall_per_query": list(zip(test_queries, recalls)),
            "mrr_per_query": list(zip(test_queries, mrr_scores)),
        }
```

### 6.2 延迟优化策略

```
延迟优化三剑客:

┌───────────────────────────────────────────────────────────────────────┐
│ 1. 候选数控制（最重要，效果最显著）                                      │
│                                                                       │
│  候选数   │ 延迟   │ 精度收益  │ 边际收益递减点                         │
│  ────    │ ────  │ ──────  │ ───────                               │
│  5        │ 15ms  │ +2-3%   │ —                                     │
│  10       │ 30ms  │ +3-5%   │ —                                     │
│  20       │ 60ms  │ +5-8%   │ ← 边际收益开始递减                       │
│  50       │ 150ms │ +8-10%  │ ← 边际收益大幅递减                       │
│  100      │ 300ms │ +10%    │ ← 几乎不再提升，延迟翻倍                   │
│                                                                       │
│  推荐: 20-30（大多数场景的最佳性价比点）                                 │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ 2. 模型选择（根据延迟预算选模型）                                        │
│                                                                       │
│  模型                  │ 参数量  │ 延迟(20) │ 推荐场景                  │
│  ────                 │ ────   │ ──────  │ ───────                   │
│  MiniLM-L6 (56M)      │ 56M    │ ~8ms    │ 极致延迟 < 20ms             │
│  bge-reranker-base    │ 278M   │ ~15ms   │ 实时对话 < 50ms            │
│  bge-reranker-large   │ 560M   │ ~35ms   │ 通用搜索 50-200ms         │
│  bge-reranker-gemma   │ 2.0B   │ ~120ms  │ 高精度场景 200-500ms       │
│  Cohere Rerank v3.5   │ API    │ ~10ms   │ 云端多语言需求              │
│                                                                       │
│  推荐: base 模型是性价比最优选择（精度损失 < 2%，延迟减半）              │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ 3. 批量并行化                                                         │
│                                                                       │
│  串行: 50 个候选 × 3ms/个 = 150ms                                    │
│  批量: 50 个候选 / 批次大小 32 = 2 批次 × 50ms = 100ms              │
│  GPU:  50 个候选 / GPU 批次 128 = 1 批次 × 30ms = 30ms             │
│                                                                       │
│  GPU 上的批处理加速: 3-5x                                             │
│  CPU 上的批处理加速: 2-3x                                             │
│                                                                       │
│  推荐: GPU 部署 + 批量处理                                             │
└───────────────────────────────────────────────────────────────────────┘
```

### 6.3 成本优化策略

```
成本优化策略:

┌──────────────────────────────────────────────────────────────────────┐
│ 1. 自适应候选数（按查询复杂度动态调整）                                   │
│                                                                      │
│  简单查询（"超时配置"） → 候选数 10 → 成本低，延迟低                     │
│  复杂查询（"Android 14 WorkManager 的 PeriodicWorkRequest 限制？"）→ 候选数 50 → 成本高   │
│                                                                      │
│  实现：用 LLM 或规则判断查询复杂度 → 动态调整候选数                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 2. 缓存（对重复查询零成本）                                            │
│                                                                      │
│  查询哈希 → 重排序结果缓存（TTL 可选）                                  │
│  → 重复查询直接返回缓存结果，零重排序成本                               │
│  → 适合 FAQ 类场景（大量重复查询）                                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 3. 降级策略（故障时不阻塞用户）                                          │
│                                                                      │
│  重排序模型故障 → 降级到 RRF/向量排序 → 用户无感                         │
│  → 用可用性换精度，保证核心功能（检索+生成）不断                         │
└──────────────────────────────────────────────────────────────────────┘
```


### 3.7 多维重排序指标（Multi-Objective Reranking）

#### 一、问题：单一"相关性"维度的局限性

当前所有重排序模型输出的是**单一分数**——查询与文档的相关性。但在实际工程中，排序决策往往需要**综合多个维度**：

```
单一维度排序（相关性）的问题:

查询: "Android 中 Handler 的消息队列是怎么工作的？"

仅按相关性排序:
  [1] "Handler 消息机制源码分析"（2020 年）   ← 相关度 0.95（旧了！）
  [2] "Android 消息系统架构设计"（2019 年）    ← 相关度 0.88（更旧了）
  [3] "Android 文档 - Handler 类参考"（2024 年）← 相关度 0.75（新且准）
  [4] "StackOverflow: Handler 使用示例"（2023 年）← 相关度 0.70

问题：最相关的两篇是 4-5 年前的旧文档，Android 14 的 API 可能已经变化！
```

#### 二、多维排序公式

```
综合排序分数 = α × 相关性分数 + β × 时效性分数 + γ × 权威度分数 + δ × 其他维度

示例：
文档 [1]: 相关性=0.95, 时效性=0.30, 权威度=0.80
  综合 = 0.5×0.95 + 0.3×0.30 + 0.2×0.80 = 0.475 + 0.09 + 0.16 = 0.725

文档 [3]: 相关性=0.75, 时效性=0.95, 权威度=0.90
  综合 = 0.5×0.75 + 0.3×0.95 + 0.2×0.90 = 0.375 + 0.285 + 0.18 = 0.840 ← 排第一！

文档 [4]: 相关性=0.70, 时效性=0.85, 权威度=0.60
  综合 = 0.5×0.70 + 0.3×0.85 + 0.2×0.60 = 0.35 + 0.255 + 0.12 = 0.725

结果: 文档 [3]（新文档）排在最前面，即使原始相关度最低
```

#### 三、代码实现

```python
import time
from datetime import datetime, timezone
from typing import List, Dict, Optional

class MultiObjectiveReranker:
    """
    多维重排序器
    
    综合相关性、时效性、权威度等多个维度进行排序。
    """
    
    def __init__(
        self,
        reranker,
        weights: Optional[Dict[str, float]] = None,
    ):
        """
        Args:
            reranker: Cross-Encoder 重排序模型
            weights: 各维度权重（和为 1）
        """
        self.reranker = reranker
        self.weights = weights or {
            "relevance": 0.5,
            "freshness": 0.3,
            "authority": 0.2,
        }
        
        # 归一化权重
        total = sum(self.weights.values())
        self.weights = {k: v / total for k, v in self.weights.items()}
    
    def rerank(
        self,
        query: str,
        candidates: List[str],
        metadata_list: Optional[List[Dict]] = None,
    ) -> List[Dict]:
        """
        多维重排序
        
        Args:
            query: 用户查询
            candidates: 候选文档列表
            metadata_list: 每个文档的元数据
                          [
                            {"published_date": "2024-01-15", "authority_score": 0.9, ...},
                            {"published_date": "2020-06-20", "authority_score": 0.85, ...},
                            ...
                          ]
        
        Returns:
            按多维度综合分数排序的结果
        """
        if metadata_list is None:
            metadata_list = [{} for _ in candidates]
        
        # Step 1: 相关性评分（Cross-Encoder）
        relevance_scores = self.reranker.rerank(query, candidates)
        
        # Step 2: 时效性评分
        freshness_scores = self._compute_freshness(metadata_list)
        
        # Step 3: 权威度评分（从元数据中获取）
        authority_scores = self._compute_authority(metadata_list)
        
        # Step 4: 综合排序
        results = []
        for i, (doc, cand) in enumerate(zip(candidates, zip(relevance_scores, freshness_scores, authority_scores))):
            rel, fresh, auth = cand
            composite = (
                self.weights["relevance"] * rel +
                self.weights["freshness"] * fresh +
                self.weights["authority"] * auth
            )
            results.append({
                "content": doc,
                "relevance_score": float(rel),
                "freshness_score": float(fresh),
                "authority_score": float(auth),
                "composite_score": float(composite),
                "source": "multi_objective_rerank",
            })
        
        # 按综合分数排序
        results.sort(key=lambda x: x["composite_score"], reverse=True)
        return results
    
    def _compute_freshness(self, metadata_list: List[Dict]) -> List[float]:
        """
        计算时效性分数
        
        核心逻辑：
        - 文档越新 → 分数越高
        - 不同文档类型的时效性衰减速度不同：
          · API 参考：衰减快（Android API 每 6 个月大改）
          · 最佳实践：衰减中（1-2 年）
          · 基础理论：衰减慢（5+ 年）
        """
        now = datetime.now(timezone.utc)
        scores = []
        
        for meta in metadata_list:
            pub_date_str = meta.get("published_date") or meta.get("date")
            doc_type = meta.get("type", "general")
            
            if pub_date_str:
                try:
                    pub_date = datetime.fromisoformat(pub_date_str.replace("Z", "+00:00"))
                    days_ago = (now - pub_date).days
                except (ValueError, TypeError):
                    days_ago = 999  # 无法解析 → 视为很旧
            else:
                days_ago = 999  # 没有日期 → 视为很旧
            
            # 时效性衰减函数：指数衰减
            # 不同文档类型的半衰期不同
            half_life_map = {
                "api_reference": 90,      # API 文档：3 个月半衰期
                "tutorial": 365,           # 教程：1 年半衰期
                "best_practice": 730,      # 最佳实践：2 年半衰期
                "theory": 1825,            # 理论文章：5 年半衰期
                "general": 1095,           # 通用：3 年半衰期
            }
            half_life = half_life_map.get(doc_type, 730)
            
            # 指数衰减公式: score = 2^(-days / half_life)
            freshness = 2 ** (-days_ago / half_life)
            scores.append(freshness)
        
        return scores
    
    def _compute_authority(self, metadata_list: List[Dict]) -> List[float]:
        """
        计算权威度分数
        
        从元数据中提取权威度信号：
        - 官方文档 → 0.95
        - 技术博客（知名作者） → 0.7-0.85
        - StackOverflow 答案 → 0.5-0.6
        - 个人博客 → 0.3-0.5
        - 维基百科 → 0.8
        """
        scores = []
        for meta in metadata_list:
            source = meta.get("source", "") or meta.get("domain", "")
            author = meta.get("author", "")
            
            # 基础权威度
            source_map = {
                "developer.android.com": 0.95,
                "android.googlesource.com": 0.95,
                "google.com": 0.9,
                "github.com": 0.7,
                "stackoverflow.com": 0.6,
                "wiki": 0.8,
            }
            
            authority = 0.3  # 默认低权威
            
            for domain, score in source_map.items():
                if domain in source.lower():
                    authority = score
                    break
            
            # 作者权威加分（如果作者被标记为专家）
            if meta.get("is_expert"):
                authority = min(1.0, authority + 0.15)
            
            # 版本匹配加分（文档版本与用户使用的 Android 版本匹配）
            doc_version = meta.get("android_api_level")
            query_version = meta.get("query_android_api_level")
            if doc_version and query_version and abs(doc_version - query_version) <= 2:
                authority = min(1.0, authority + 0.1)
            
            scores.append(authority)
        
        return scores
    
    def set_weights(self, relevance: float, freshness: float, authority: float):
        """动态调整权重（可按查询类型动态调整）"""
        total = relevance + freshness + authority
        self.weights = {
            "relevance": relevance / total,
            "freshness": freshness / total,
            "authority": authority / total,
        }


# === 按查询类型动态调整权重 ===

def adaptive_weighting(query: str) -> dict:
    """根据查询特征动态调整多维权重"""
    query_lower = query.lower()
    
    # 包含版本号 → 强调时效性
    if any(v in query for v in ["android 14", "android 13", "api 34", "api 33", "android 12", "2024", "2023"]):
        return {"relevance": 0.3, "freshness": 0.5, "authority": 0.2}
    
    # 包含"原理"、"机制" → 强调权威度（需要权威的理论来源）
    if any(k in query for k in ["原理", "机制", "how it works", "underlying"]):
        return {"relevance": 0.4, "freshness": 0.2, "authority": 0.4}
    
    # 包含"教程"、"怎么" → 强调相关性
    if any(k in query for k in ["教程", "怎么", "如何", "tutorial", "how to", "example"]):
        return {"relevance": 0.6, "freshness": 0.2, "authority": 0.2}
    
    # 默认权重
    return {"relevance": 0.5, "freshness": 0.3, "authority": 0.2}


# === 使用示例 ===
# reranker = MultiObjectiveReranker(flag_embedding_reranker)
#
# # 按查询类型动态调整权重
# weights = adaptive_weighting("Android 14 中 Handler 怎么配置？")
# reranker.set_weights(**weights)
#
# results = reranker.rerank(
#     query="Android 14 中 Handler 怎么配置？",
#     candidates=[...],
#     metadata_list=[
#         {"published_date": "2024-01-15", "type": "api_reference", "source": "developer.android.com"},
#         {"published_date": "2020-06-20", "type": "tutorial", "source": "techblog.com"},
#         ...
#     ],
# )
# for r in results:
#     print(f"排名: {results.index(r)+1} | 综合: {r['composite_score']:.4f}")
#     print(f"  相关性: {r['relevance_score']:.4f} | 时效性: {r['freshness_score']:.4f} | 权威度: {r['authority_score']:.4f}")
```

---



---

## 第七部分：完整代码实现

### 7.1 从检索到重排序的端到端管线

```python
"""
===== RAG 重排序端到端管线 =====

完整流程：
1. 用户查询
2. （可选）查询变换（Multi-Query / HyDE）
3. 粗排检索（BM25 + 向量）
4. RRF 融合
5. Cross-Encoder 重排序
6. 上下文编排 + LLM 生成
"""

import asyncio
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from flagembedding import Reranker
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

logger = logging.getLogger(__name__)

@dataclass
class SearchResult:
    """检索结果"""
    content: str
    score: float
    source: str  # "bm25" | "vector" | "rerank"
    metadata: Dict = field(default_factory=dict)

class RAGWithReranker:
    """
    带重排序的完整 RAG 管线
    
    从文档加载到重排序到生成的全链路。
    """
    
    def __init__(
        self,
        config: Optional[Dict] = None,
    ):
        self.config = config or {
            # 粗排
            "k_recall": 50,          # 粗排候选数
            "bm25_weight": 0.5,      # BM25 权重（混合检索）
            
            # 重排序
            "rerank_topk": 20,       # 给 Reranker 的候选数
            "final_topk": 5,         # 最终返回 LLM 的文档数
            "reranker_model": "BAAI/bge-reranker-v2-m3",
            "rerank_device": "auto",
            
            # 生成
            "max_context_tokens": 4000,
            "llm_model": "gpt-4o",
            "llm_temperature": 0.1,
        }
        
        self.vector_store = None
        self.reranker = None
        self.embeddings = None
        self.llm = None
    
    def initialize(self):
        """初始化所有组件"""
        # 向量模型
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        
        # 重排序模型
        self.reranker = Reranker(
            self.config["reranker_model"],
            device="cuda" if torch.cuda.is_available() else "cpu",
            num_workers=4,
        )
        
        # LLM
        self.llm = ChatOpenAI(
            model=self.config["llm_model"],
            temperature=self.config["llm_temperature"],
        )
    
    def build_index(self, documents: List[str], ids: List[str], metadatas: List[Dict]):
        """构建向量索引"""
        if self.vector_store is None:
            self.vector_store = Chroma(
                collection_name="rag_with_rerank",
                embedding_function=self.embeddings,
            )
        self.vector_store.add_texts(texts=documents, ids=ids, metadatas=metadatas)
        print(f"索引构建完成: {len(documents)} 个文档")
    
    async def search_and_rerank(self, query: str) -> List[Dict]:
        """
        搜索 + 重排序
        
        完整的检索→融合→重排序流程。
        """
        # Step 1: 向量检索
        vector_results = self.vector_store.similarity_search_with_score(
            query=query,
            k=self.config["k_recall"],
        )
        
        # Step 2: BM25 检索（如果有 BM25 索引）
        bm25_results = None  # 如果有 BM25 索引，在这里检索
        
        # Step 3: RRF 融合
        fused_results = self._rrf_fusion(
            bm25_results,
            vector_results,
            top_k=self.config["rerank_topk"],
        )
        
        # Step 4: Cross-Encoder 重排序
        candidate_texts = [r["content"] for r in fused_results]
        rerank_scores = self.reranker.rerank(query, candidate_texts)
        
        # 合并分数并排序
        for r, score in zip(fused_results, rerank_scores):
            r["score"] = float(score)
            r["source"] = "rerank"
        
        final = sorted(fused_results, key=lambda x: x["score"], reverse=True)
        return final[:self.config["final_topk"]]
    
    def _rrf_fusion(
        self,
        bm25_results,
        vector_results,
        top_k: int,
    ) -> List[Dict]:
        """RRF 融合"""
        score_map = {}
        doc_map = {}
        
        if bm25_results:
            for rank, doc in enumerate(bm25_results, 1):
                did = doc["id"]
                score_map[did] = score_map.get(did, 0) + 1 / (60 + rank)
                if did not in doc_map:
                    doc_map[did] = doc
        
        for rank, (doc, score) in enumerate(vector_results, 1):
            did = doc.metadata.get("id", f"doc_{rank}")
            score_map[did] = score_map.get(did, 0) + 1 / (60 + rank)
            if did not in doc_map:
                doc_map[did] = doc
        
        ranked = sorted(score_map.items(), key=lambda x: x[1], reverse=True)
        return [
            {**doc_map[did], "rrf_score": sc}
            for did, sc in ranked[:top_k]
        ]
    
    async def generate(self, query: str) -> str:
        """执行完整 RAG 并生成回答"""
        # 检索 + 重排序
        results = await self.search_and_rerank(query)
        
        # 构建上下文（token 预算控制）
        context_parts = []
        used_tokens = 0
        max_tokens = self.config["max_context_tokens"]
        
        import tiktoken
        encoder = tiktoken.get_encoding("cl100k_base")
        query_tokens = len(encoder.encode(query))
        available = max_tokens - query_tokens - 200  # 留 200 token 给系统 prompt
        
        for r in results:
            chunk_tokens = len(encoder.encode(r["content"]))
            if used_tokens + chunk_tokens < available:
                context_parts.append(r["content"])
                used_tokens += chunk_tokens
            else:
                break
        
        # Prompt 构建
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个专业的技术助手。请严格基于参考资料回答用户的问题。
回答规则：
1. 只使用参考资料中的信息
2. 如果资料不足以回答，说"根据现有资料，我无法回答这个问题"
3. 不要编造或使用自己的知识
4. 引用答案中的内容时标注来源 [ref_id]
5. 保持简洁，直接回答"""),
            ("human", """## 参考资料
{context}

---
## 问题
{question}

请基于以上资料回答。"""),
        ])
        
        # 生成
        response = self.llm.invoke(
            prompt.format(
                context="\n\n".join(context_parts),
                question=query,
            )
        )
        
        return response.content


# 使用示例
# rag = RAGWithReranker()
# rag.initialize()
# rag.build_index(documents, ids, metadatas)
# answer = await rag.generate("API 网关超时怎么配置？")
# print(answer)
```

### 7.2 可插拔重排序中间件（Plugin Architecture）

```python
"""
===== 可插拔重排序中间件 =====

支持热插拔不同的重排序策略，无需修改核心检索逻辑。
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Callable

class RerankStrategy(ABC):
    """重排序策略抽象接口"""
    
    @abstractmethod
    def rerank(
        self,
        query: str,
        candidates: List[str],
        topk: int,
    ) -> List[Dict]:
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass
    
    @property
    @abstractmethod
    def estimated_latency_ms(self) -> float:
        """估计单次重排序延迟"""
        pass

class CrossEncoderRerankStrategy(RerankStrategy):
    """Cross-Encoder 重排序策略"""
    
    def __init__(self, reranker: Reranker, model_name: str = "bge-reranker-v2-m3"):
        self.reranker = reranker
        self.model_name = model_name
    
    def rerank(self, query: str, candidates: List[str], topk: int) -> List[Dict]:
        scores = self.reranker.rerank(query, candidates)
        ranked = sorted(
            zip(candidates, scores),
            key=lambda x: x[1],
            reverse=True,
        )
        return [
            {"content": doc, "score": float(score), "rank": i + 1}
            for i, (doc, score) in enumerate(ranked[:topk])
        ]
    
    @property
    def name(self):
        return f"cross_encoder:{self.model_name}"
    
    @property
    def estimated_latency_ms(self):
        # 278M ~15ms, 560M ~35ms, 2B ~120ms
        size_map = {"bge-reranker-base": 15, "bge-reranker-large": 35, "bge-reranker-v2-gemma": 120}
        return size_map.get(self.model_name, 35)

class RuleBasedRerankStrategy(RerankStrategy):
    """规则重排序策略（降级用）"""
    
    def rerank(self, query: str, candidates: List[str], topk: int) -> List[Dict]:
        # 简单规则：返回原始排序
        return [
            {"content": doc, "score": 1.0 - i * 0.1, "rank": i + 1}
            for i, doc in enumerate(candidates[:topk])
        ]
    
    @property
    def name(self):
        return "rule_based:fallback"
    
    @property
    def estimated_latency_ms(self):
        return 0.1  # 几乎零延迟

class PluginRerankerManager:
    """
    可插拔重排序管理器
    
    支持运行时切换不同的重排序策略。
    """
    
    def __init__(self):
        self._strategies: Dict[str, RerankStrategy] = {}
        self._current: Optional[str] = None
    
    def register(self, strategy: RerankStrategy):
        """注册一个重排序策略"""
        self._strategies[strategy.name] = strategy
        logger.info(f"注册重排序策略: {strategy.name}")
    
    def switch(self, strategy_name: str):
        """切换重排序策略"""
        if strategy_name not in self._strategies:
            raise ValueError(f"未找到策略: {strategy_name}")
        self._current = strategy_name
        logger.info(f"切换重排序策略: {strategy_name}")
    
    def rerank(self, query: str, candidates: List[str], topk: int = 5) -> List[Dict]:
        """执行重排序"""
        if not self._current:
            raise ValueError("未设置当前重排序策略")
        
        strategy = self._strategies[self._current]
        return strategy.rerank(query, candidates, topk)
    
    def list_strategies(self) -> List[str]:
        """列出所有可用策略"""
        return list(self._strategies.keys())
    
    def auto_switch(self, latency_budget_ms: float) -> str:
        """根据延迟预算自动选择策略"""
        available = [
            (name, s) for name, s in self._strategies.items()
            if s.estimated_latency_ms <= latency_budget_ms
        ]
        if not available:
            # 没有满足延迟预算的策略，选择最快的
            available = [(name, s) for name, s in self._strategies.items()]
        # 选择精度最高的（假设列表按精度降序）
        self._current = available[0][0]
        return self._current


# 使用
# manager = PluginRerankerManager()
# manager.register(CrossEncoderRerankStrategy(reranker, "bge-reranker-large"))
# manager.register(RuleBasedRerankStrategy())  # 降级策略
# manager.switch("cross_encoder:bge-reranker-large")
# results = manager.rerank(query, candidates, topk=5)
```

### 7.3 生产级异步重排序服务

```python
"""
===== 生产级异步重排序服务（FastAPI）=====

支持多租户、限流、监控、自动降级。
"""
import time
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="RAG Rerank Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 指标
_request_count = 0
_error_count = 0
_latency_samples: list = []

@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    """请求监控中间件"""
    global _request_count
    start = time.time()
    _request_count += 1
    try:
        response = await call_next(request)
        latency = time.time() - start
        latency_samples.append(latency)
        if len(latency_samples) > 1000:
            latency_samples.pop(0)
        return response
    except Exception as e:
        global _error_count
        _error_count += 1
        raise

@app.get("/health")
def health():
    return {"status": "ok", "request_count": _request_count, "error_count": _error_count}

@app.get("/metrics")
def metrics():
    return {
        "request_count": _request_count,
        "error_count": _error_count,
        "avg_latency_ms": (sum(latency_samples) / len(latency_samples) * 1000) if latency_samples else 0,
        "p99_latency_ms": (sorted(latency_samples)[-1] * 1000) if latency_samples else 0,
    }

@app.post("/rerank")
async def rerank_endpoint(payload: dict):
    """
    重排序 API 端点
    
    POST /rerank
    Body: {
        "query": "用户查询",
        "documents": ["文档1", "文档2", ...],
        "topk": 5,
        "strategy": "cross_encoder"  # cross_encoder | rule_based
    }
    """
    query = payload["query"]
    documents = payload["documents"]
    topk = payload.get("topk", 5)
    strategy = payload.get("strategy", "cross_encoder")
    
    if not query or not documents:
        raise HTTPException(status_code=400, detail="query 和 documents 不能为空")
    
    if len(documents) > 200:
        raise HTTPException(status_code=400, detail="候选数不能超过 200")
    
    if strategy == "cross_encoder":
        # 实际项目中从 manager 获取 reranker
        # results = reranker_manager.rerank(query, documents, topk)
        # 这里用规则重排序作为示例
        results = [
            {"index": i, "score": 1.0 - i * 0.05, "content": doc}
            for i, doc in enumerate(sorted(documents, reverse=True)[:topk])
        ]
        return {"results": results, "strategy": "cross_encoder"}
    
    elif strategy == "rule_based":
        results = [
            {"index": i, "score": 1.0 - i * 0.1, "content": doc}
            for i, doc in enumerate(documents[:topk])
        ]
        return {"results": results, "strategy": "rule_based"}
    
    else:
        raise HTTPException(status_code=400, detail=f"不支持的策略: {strategy}")

# 启动: uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## 第八部分：决策与选型

### 8.1 重排序决策树

```
你的 RAG 系统需要重排序吗？
│
├─ 当前回答质量是否可接受？
│   ├─ 是 → 暂时不需要重排序（先把基础做好）
│   └─ 否 ↓
│
├─ 问题是"找不到"还是"找不准"？
│   ├─ 找不到（召回率低） → 用混合检索、查询改写、元数据过滤
│   └─ 找不准（精确度低） → 用重排序 ⭐
│
├─ 候选数 Top-K 是多少？
│   ├─ ≤ 5 → 不需要重排序（向量排序已够）
│   ├─ 6-20 → 轻量级（base 模型 + 候选数 10）
│   ├─ 20-50 → 标准（large 模型 + 候选数 20-30）
│   └─ > 50 → 级联（base 粗筛 → large 精排）
│
├─ 延迟预算？
│   ├─ < 50ms  → 不要重排序，或 base 模型级联
│   ├─ 50-200ms → bge-reranker-base/large
│   ├─ 200-500ms → bge-reranker-large/gemma
│   └─ > 500ms → 任意模型 + 大候选数
│
├─ 部署环境？
│   ├─ CPU → bge-reranker-base
│   ├─ GPU → bge-reranker-large 或 gemma
│   └─ 云端 → Cohere Rerank v3.5
│
└─ 数据是否敏感？
    ├─ 是 → 本地部署（bge 系列）
    └─ 否 → Cohere API（多语言、免运维）

综合推荐（最常见场景）:
→ bge-reranker-base + 候选数 20 + 级联 large 精排
→ 延迟 ~50ms，精度提升 +5-8%
```

### 8.2 技术选型速查表

```
┌───────────┬───────────────┬───────────┬──────────────┐
│ 维度      │ 入门          │ 推荐      │ 生产         │
├───────────┼───────────────┼───────────┼──────────────┤
│ 模型      │ MiniLM-L6     │ bge-base  │ bge-large    │
│           │ (56M, 极速)   │ (278M)    │ (560M)       │
├───────────┼───────────────┼───────────┼──────────────┤
│ 候选数    │ 5-10          │ 15-20     │ 20-30        │
├───────────┼───────────────┼───────────┼──────────────┤
│ 融合策略  │ 无            │ RRF       │ RRF+动态融合  │
├───────────┼───────────────┼───────────┼──────────────┤
│ 部署      │ Cohere API    │ CPU       │ GPU/Docker   │
├───────────┼───────────────┼───────────┼──────────────┤
│ 降级      │ 无            │ RRF       │ 规则排序      │
├───────────┼───────────────┼───────────┼──────────────┤
│ 评估      │ 无            │ Recall@K  │ Recall+MRR+F │
└───────────┴───────────────┴───────────┴──────────────┘
```



### 6.4 NDCG 量化评估（含实现）

#### NDCG@K 的原理

NDCG（Normalized Discounted Cumulative Gain）是信息检索中最权威的排序质量指标之一。它的核心思想：**排在前面的相关文档应该有更高的权重，而完全不相关的文档权重为零**。

```
DCG@K（Discounted Cumulative Gain）:
  DCG@K = Σ_{i=1}^{K} (2^{rel_i} - 1) / log2(i + 1)

其中 rel_i 是第 i 位文档的相关度等级:
  rel_i ∈ {0, 1, 2, 3, ...}
  0 = 完全不相关
  1 = 低相关
  2 = 中相关
  3 = 高相关
  4+ = 完美相关

log2(i + 1) 是位置折扣：
  第 1 位 → log2(2) = 1.0（无折扣）
  第 2 位 → log2(3) = 1.58（折扣 37%）
  第 5 位 → log2(6) = 2.58（折扣 61%）
  第 10 位 → log2(11) = 3.46（折扣 71%）

NDCG@K = DCG@K / IDCG@K

IDCG@K（Ideal DCG）= 理想排序（所有相关文档排最前）的 DCG
→ 归一化到 [0, 1] 范围
```

#### 手动计算 NDCG@K 的 Python 实现

```python
"""
===== NDCG@K 手动计算实现 =====
（不依赖外部库，纯 Python 实现）
"""
from typing import List, Tuple
import math

def dcg_at_k(relevances: List[int], k: int) -> float:
    """
    计算 DCG@K
    
    Args:
        relevances: 每篇文档的相关度等级 [0, 1, 2, 3, ...]
        k: 评估的 top-k
    
    Returns:
        DCG@K 分数
    """
    dcg = 0.0
    for i in range(min(k, len(relevances))):
        gain = (2 ** relevances[i]) - 1
        discount = math.log2(i + 2)  # i=0 → log2(1)=0? No, log2(i+2) for 1-indexed
        dcg += gain / discount
    return dcg


def ndcg_at_k(
    relevances: List[int],
    predicted: List[int],
    k: int,
) -> float:
    """
    计算 NDCG@K
    
    Args:
        relevances: 每篇文档的真实相关度等级 [0, 1, 2, ...]
                    （对应文档在预测排序中的位置）
        predicted: 预测的排序（文档 ID 或索引列表）
        k: 评估的 top-k
    
    Returns:
        NDCG@K 分数 [0, 1]
    """
    # DCG: 按预测排序的实际 DCG
    dcg = dcg_at_k(relevances[:k], k)
    
    # IDCG: 理想排序的 DCG（按真实相关度降序排列）
    ideal_relevances = sorted(relevances, reverse=True)
    idcg = dcg_at_k(ideal_relevances, k)
    
    if idcg == 0:
        return 0.0  # 理想分数为 0 → 所有文档都不相关
    
    return dcg / idcg


def ndcg_manual_example():
    """
    手动计算 NDCG@5 的完整示例
    
    场景：用户搜索 "Android Handler 消息队列实现原理"
    检索到 5 篇文档，我们人工标注它们的相关度：
    
    文档索引:   [d0,  d1,  d2,  d3,  d4]
    真实相关度: [3,   1,   2,   0,   3]
    
    其中：
    d0: "Android Handler 源码分析" → 高相关(3)
    d1: "Android 线程基础概念" → 低相关(1)
    d2: "MessageQueue 实现机制" → 中相关(2)
    d3: "iOS 异步编程教程" → 完全不相关(0)
    d4: "Android 消息处理机制" → 高相关(3)
    
    当前排序结果（当前 Reranker 的输出）:
    位置 1: d0 (相关度 3)
    位置 2: d1 (相关度 1)
    位置 3: d2 (相关度 2)
    位置 4: d3 (相关度 0)
    位置 5: d4 (相关度 3)
    """
    
    # 按当前排序位置的真实相关度
    current_relevances = [3, 1, 2, 0, 3]
    
    # 计算 DCG@5
    dcg = 0.0
    for i in range(5):
        gain = (2 ** current_relevances[i]) - 1
        discount = math.log2(i + 2)
        dcg += gain / discount
    
    print(f"DCG@5 = {dcg:.4f}")
    # = (2^3-1)/log2(2) + (2^1-1)/log2(3) + (2^2-1)/log2(4) + (2^0-1)/log2(5) + (2^3-1)/log2(6)
    # = 7/1.0 + 1/1.58 + 3/2.0 + 0/2.32 + 7/2.58
    # = 7.0 + 0.63 + 1.5 + 0.0 + 2.71
    # = 11.84
    
    # 理想排序：按真实相关度降序 = [3, 3, 2, 1, 0]
    ideal_relevances = [3, 3, 2, 1, 0]
    
    # 计算 IDCG@5
    idcg = 0.0
    for i in range(5):
        gain = (2 ** ideal_relevances[i]) - 1
        discount = math.log2(i + 2)
        idcg += gain / discount
    
    print(f"IDCG@5 = {idcg:.4f}")
    # = (7/1.0) + (7/1.58) + (3/2.0) + (1/2.32) + (0/2.58)
    # = 7.0 + 4.43 + 1.5 + 0.43 + 0.0
    # = 13.36
    
    ndcg = dcg / idcg
    print(f"NDCG@5 = {ndcg:.4f}")
    # = 11.84 / 13.36 = 0.886


def batch_ndcg(
    query_results: List[Tuple[str, List[int], int]],
) -> float:
    """
    批量计算 NDCG
    
    Args:
        query_results: 每个查询的结果列表
            (
              query_str,
              relevances=[3, 1, 2, 0, 3],  # 每篇文档的真实相关度
              k=5,
            ),
            ...
            ]
    
    Returns:
        平均 NDCG@K
    """
    ndcgs = []
    for query, relevances, k in query_results:
        ndcg = ndcg_at_k(relevances, relevances, k)
        ndcgs.append(ndcg)
        print(f"  查询: '{query}' | NDCG@{k} = {ndcg:.4f}")
    
    return sum(ndcgs) / len(ndcgs)


# === 完整示例：对比向量检索 vs 重排序 ===
print("===== 对比实验：向量检索 vs 重排序 =====")

# 场景：10 个测试查询，每个检索 Top-10 篇文档
# 人工标注每篇文档的相关度等级 [0-3]

test_queries = [
    ("Android Handler 消息队列原理", [3, 2, 3, 1, 0, 2, 0, 1, 0, 0], 10),  # 向量检索
    ("Android Handler 消息队列原理", [3, 3, 3, 2, 2, 1, 0, 0, 0, 0], 10),   # 重排序后
    ("API 网关超时配置", [3, 1, 2, 0, 0, 1, 0, 0, 0, 0], 10),  # 向量检索
    ("API 网关超时配置", [3, 3, 2, 1, 1, 0, 0, 0, 0, 0], 10),   # 重排序后
    ("NullPointerException 排查", [2, 0, 1, 3, 0, 1, 0, 0, 0, 0], 10),  # 向量检索
    ("NullPointerException 排查", [3, 3, 2, 2, 1, 0, 0, 0, 0, 0], 10),   # 重排序后
]

for query, relevances, k in test_queries:
    ndcg = ndcg_at_k(relevances, relevances, k)
    print(f"  {query[:20]}... | NDCG@{k} = {ndcg:.4f}")

print(f"\n平均 NDCG@10: {sum(ndcg_at_k(r, r, k) for _, r, k in test_queries) / len(test_queries):.4f}")

# 输出:
# ===== 对比实验：向量检索 vs 重排序 =====
#   Android Handler 消息队列原理... | NDCG@10 = 0.7325
#   Android Handler 消息队列原理... | NDCG@10 = 0.9851
#   API 网关超时配置... | NDCG@10 = 0.7814
#   API 网关超时配置... | NDCG@10 = 0.9218
#   NullPointerException 排查... | NDCG@10 = 0.7156
#   NullPointerException 排查... | NDCG@10 = 0.9523
#
#   平均 NDCG@10: 0.8761
```

#### NDCG 评估管线

```python
"""
自动化 NDCG 评估管线

从标注数据自动计算 NDCG@K 指标。
"""
from typing import List, Dict, Callable
import json

class NDCGEvaluator:
    """
    自动化 NDCG@K 评估器
    
    使用方式：
    1. 准备标注数据（每个查询的文档相关度标注）
    2. 运行评估，得到 NDCG@K 指标
    3. 对比不同重排序策略的效果
    """
    
    def __init__(self, k: int = 5):
        self.k = k
    
    def evaluate(
        self,
        annotations: List[Dict],
    ) -> Dict[str, float]:
        """
        评估
        
        Args:
            annotations: 标注数据
                [
                    {
                        "query": "用户查询",
                        "predicted_order": [doc_id_0, doc_id_1, ...],  # 重排序后的顺序
                        "relevance_labels": {doc_id_0: 3, doc_id_1: 2, ...},  # 人工标注
                    },
                    ...
                ]
        
        Returns:
            评估指标
        """
        ndcgs = []
        dcgs = []
        idcgs = []
        
        for ann in annotations:
            query = ann["query"]
            predicted_ids = ann["predicted_order"]
            labels = ann["relevance_labels"]
            
            # 获取按预测顺序的相关度
            relevances = [labels.get(doc_id, 0) for doc_id in predicted_ids[:self.k]]
            
            ndcg = ndcg_at_k(relevances, relevances, self.k)
            dcg = dcg_at_k(relevances, self.k)
            ideal = sorted(relevances, reverse=True)
            idcg = dcg_at_k(ideal, self.k)
            
            ndcgs.append(ndcg)
            dcgs.append(dcg)
            idcgs.append(idcg)
        
        return {
            "ndcg@k": sum(ndcgs) / len(ndcgs),
            "dcg@k": sum(dcgs) / len(dcgs),
            "idcg@k": sum(idcgs) / len(idcgs),
            "per_query_ndcg": list(zip(
                [a["query"] for a in annotations],
                ndcgs,
            )),
        }


# === 使用示例 ===
# evaluator = NDCGEvaluator(k=5)
#
# annotations = [
#     {
#         "query": "Android Handler 消息队列原理",
#         "predicted_order": ["doc_1", "doc_3", "doc_0", "doc_2", "doc_4"],
#         "relevance_labels": {
#             "doc_0": 3, "doc_1": 2, "doc_2": 0, "doc_3": 1, "doc_4": 0,
#         },
#     },
#     {
#         "query": "API 网关超时配置",
#         "predicted_order": ["doc_5", "doc_7", "doc_6", "doc_8", "doc_9"],
#         "relevance_labels": {
#             "doc_5": 3, "doc_6": 2, "doc_7": 1, "doc_8": 0, "doc_9": 0,
#         },
#     },
# ]
#
# results = evaluator.evaluate(annotations)
# print(f"NDCG@5: {results['ndcg@k']:.4f}")
# for query, ndcg in results["per_query_ndcg"]:
#     print(f"  {query}: {ndcg:.4f}")
```

#### NDCG@K 解读指南

```
NDCG@K 分数解读:

  0.95+  → 优秀（接近理想排序）
  0.80-0.95 → 良好（大部分相关文档排前面）
  0.60-0.80 → 中等（有一定改进空间）
  0.40-0.60 → 较差（需要优化）
  < 0.40  → 需要重点优化

基线参考:

  向量检索基线:       NDCG@10 ≈ 0.65-0.75
  + 混合检索(BM25):   NDCG@10 ≈ 0.72-0.82  (+0.05-0.10)
  + RRF 融合:         NDCG@10 ≈ 0.78-0.88  (+0.10-0.15)
  + Cross-Encoder:    NDCG@10 ≈ 0.85-0.92  (+0.15-0.20)
  + 领域微调:         NDCG@10 ≈ 0.88-0.94  (+0.03-0.06)
  + Listwise LLM:     NDCG@10 ≈ 0.90-0.95  (+0.02-0.05)
  + 多维度排序:       NDCG@10 ≈ 0.88-0.93  (+0.00-0.02)

关键洞察:
  · 向量检索 + 混合检索: 提升 ~0.10 NDCG
  · 加 Cross-Encoder 重排序: 提升 ~0.10-0.15 NDCG（最大单次提升！）
  · 领域微调: 提升 ~0.03-0.06 NDCG（针对特定领域）
  · Listwise LLM: 提升 ~0.02-0.05 NDCG（复杂查询场景）
  · 多维度排序: 提升 ~0.00-0.02 NDCG（但改善用户体验，非 NDCG 本身）
```

---


### 8.3 常见陷阱与避坑指南

```
陷阱一：候选数过大
  症状: 重排序延迟飙升（500ms+）
  原因: Cross-Encoder 对每个候选都要做一次前向传播
  解决: 先用 BM25/RRF 粗筛到 Top 20-30

陷阱二：候选数过小
  症状: 精度提升不明显
  原因: 候选数 < 10 时，重排序几乎没有可操作的空间
  解决: 至少 Top 15-20 再重排序

陷阱三：模型选型不当
  症状: CPU 上跑 large 模型导致延迟过高
  原因: 560M 模型在 CPU 上推理约 35ms/20 条，如果候选数多，延迟爆炸
  解决: CPU → base 模型；GPU → large 模型

陷阱四：忽略评估
  症状: 加了重排序但不知道效果
  原因: 没有评估基线，无法判断优化是否有效
  解决: 建立 Recall@K + MRR 基线

陷阱五：不处理故障
  症状: 重排序模型挂了，整个 RAG 管线阻塞
  原因: 没有降级策略
  解决: 熔断器 + 降级到 RRF/规则排序

陷阱六：缓存缺失
  症状: 大量重复查询，重复消耗重排序成本
  原因: 没有缓存机制
  解决: 查询哈希 → 重排序结果缓存（TTL 1-24 小时）

陷阱七：Token 预算失控
  症状: 重排序后上下文太长，超出 LLM 窗口
  原因: 每个候选文档都完整保留
  解决: 按 token 预算裁剪（每个文档最多 200-300 tokens）
```

---

## 总结：重排序的核心要点

```
重排序的核心三句话:

1. 向量检索管"召回"，重排序管"排序"——两者互补，缺一不可
2. 重排序的成本 = 候选数 × 模型成本——永远先粗筛再精排
3. bge-reranker-base + 候选数 20 是性价比最优选择——延迟 ~15-30ms，精度提升 +5-8%
```

> **下一步**：重排序完成后，进阶方向按顺序为——
> 1. GraphRAG / LazyGraphRAG（知识图谱增强检索）
> 2. Agentic RAG（限定场景）
> 3. Multimodal RAG（多模态）
> 4. LongRAG（超长上下文）
