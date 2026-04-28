# 进阶篇：LazyGraphRAG（按需图谱 RAG）

> 核心新增：惰性评估 · 按需图谱构建 · 子图提取 · 查询时图谱构建
> 相对于传统 GraphRAG，LazyGraphRAG 引入的核心能力是：
> - **不预构建完整图谱，而是在查询时按需构建必要的子图**
> - **查询前评估是否真的需要图谱**（不需要则走普通向量检索）
> - **子图按需构建，构建完即弃，不长期存储**
> - **索引成本降低 99.9%，全局搜索成本降低 700x+**

---

## 一、LazyGraphRAG 概览

### 1.1 LazyGraphRAG 是什么

**LazyGraphRAG** = 按需构建的知识图谱 RAG

传统 GraphRAG 的核心问题：**索引成本极高**。需要对所有文档进行实体抽取、关系抽取、社区检测、摘要生成等大量 LLM 调用。

LazyGraphRAG 的核心思想：**不预构建完整图谱，而是在查询时按需构建必要的子图**。

**设计哲学**：
- **按需（Lazy）**：不是"先建好再查"，而是"查到哪建到哪"
- **临时（Transient）**：子图构建完即用于检索，不长期存储
- **降级（Graceful Degradation）**：子图构建失败/超时 → 回到普通向量检索

### 1.2 架构演进

```
基础 RAG:
  原始文档 → 分块 → 向量化 → 向量数据库 → 检索 → 生成

Hybrid RAG:
  原始文档 → 分块 → 向量化 → 向量数据库 → BM25+向量检索 → 重排序 → 生成

GraphRAG (微软):
  原始文档 → 分块 → 实体抽取 → 关系抽取 → 图谱构建 → 社区检测 → 社区摘要
            → 图谱遍历 + 向量检索 → 图感知生成 → 全局搜索

LazyGraphRAG:
  原始文档 → 分块 → 向量化 → 向量数据库（基础层不变）
            → 查询时 → 惰性评估 → 按需图谱 → 按需检索 → 图感知生成
```

### 1.3 与传统 GraphRAG 的详细对比

| 维度 | 传统 GraphRAG | LazyGraphRAG |
|------|----------|------------|
| **图谱构建时机** | 离线预构建（索引阶段） | 在线按需构建（查询阶段） |
| **图谱存储** | 全图谱长期存储 | 临时子图（构建完即弃） |
| **索引成本** | 高（LLM 全量：10,000+ 调用） | 降低 99.9%，≈ 向量 RAG |
| **索引时间** | 长（数小时到数天） | 近零（无索引阶段） |
| **存储成本** | 高（全图谱 + 社区摘要 + 向量索引） | 低（仅向量索引） |
| **查询延迟** | 低（图谱已就绪） | 中（需即时构建子图） |
| **更新成本** | 高（全量重建） | 低（增量更新） |
| **适用场景** | 静态知识、小规模文档 | 动态/大规模/频繁更新的数据 |
| **多跳推理** | ✅ | ✅ |
| **全局搜索** | ✅（社区摘要） | 有限（子图内社区检测） |
| **工程可行性** | ⭐⭐（复杂） | ⭐⭐⭐⭐⭐（简单） |

### 1.4 架构总览

```
用户查询
    │
    ▼
┌───────────────┐
│ 查询理解       │
│ (复杂度/置信度)│
└──────┬───────┘
       │ 是否需要图谱?
       │
   ┌───┴───┐
   │否     │是
   ▼       ▼
┌──────┐ ┌──────────────┐
│向量检索│ │ 种子节点选择  │
└───┬──┘ └───┬─────────┘
    │         │  k-hop 邻居扩展
    ▼         ▼
┌──────┐ ┌──────────────┐
│ 直接  │ │  实时抽取     │
│ 生成  │ └───┬─────────┘
└──────┘     │
             ▼
       ┌──────────────┐
       │ 子图构建      │
       │ (临时子图)    │
       └───┬──────────┘
           │
           ▼
       ┌──────────────┐
       │ 子图检索      │
       │ + 向量融合    │
       └───┬──────────┘
           │
           ▼
       ┌──────────────┐
       │ 图感知生成    │
       └──────────────┘
```

### 1.5 LazyGraphRAG 的核心优势

| 优势 | 说明 |
|------|------|
| **零索引成本** | 不需要预构建图谱，节省 99.9% 的 LLM 调用 |
| **实时性** | 最新文档自动可用（无需重建图谱） |
| **成本可控** | 只在真正需要图谱时才调用 LLM 抽取 |
| **降级保障** | 子图构建失败 → 回到向量检索，不会失败 |

---

## 二、惰性评估机制

### 2.1 触发条件判断

**核心问题**：每次查询都要判断是否真的需要图谱？如果每次都用图谱，和传统 GraphRAG 没区别。

**评估信号**：

| 信号 | 说明 | 计算方法 | 权重 |
|------|------|----------|------|
| **查询复杂度** | 复杂查询（多实体、多关系）更可能需要图谱 | 句法分析 + 语义分析 | w1 = 0.35 |
| **向量置信度** | 向量检索结果置信度低 → 可能缺图谱 | 最高分 vs 最低分的差距 | w2 = 0.30 |
| **实体匹配** | 查询包含图谱中存在的实体 → 可能有用 | BM25/向量匹配度 | w3 = 0.20 |
| **历史查询记录** | 之前的查询需要图谱 → 类似查询也可能需要 | 查询模式学习 | w4 = 0.15 |

### 2.2 查询复杂度评估

**方法 1：句法分析**

```python
import spacy

nlp = spacy.load("zh_core_web_sm")

def query_complexity_syntactic(query: str) -> float:
    """通过句法分析评估查询复杂度"""
    doc = nlp(query)
    
    score = 0.0
    
    # 1. 谓词数量（多谓词 → 复杂）
    verbs = [token for token in doc if token.pos_ == "VERB"]
    score += len(verbs) * 0.15
    
    # 2. 从句数量（嵌套从句 → 复杂）
    clauses = [sent for sent in doc.sents if len(sent) > 5]
    score += len(clauses) * 0.1
    
    # 3. 并列结构（"和"、"与"、"或" → 多实体）
    conjunctions = [token for token in doc if token.lemma_ in ["和", "与", "或"]]
    score += len(conjunctions) * 0.2
    
    return min(score, 1.0)  # 归一化到 [0, 1]
```

**方法 2：语义分析**

```python
def query_complexity_semantic(query: str, entity_index) -> tuple[float, int]:
    """通过语义分析评估查询复杂度"""
    # 1. 实体数量（实体越多 → 越可能需图谱）
    entities = entity_index.match(query)
    entity_count = len(entities)
    
    # 2. 关系暗示（"关系"、"差异"、"比较" → 关系查询）
    relation_keywords = ["关系", "差异", "比较", "对比", "区别", "关联", "联系"]
    has_relation = any(kw in query for kw in relation_keywords)
    
    # 3. 全局暗示（"主题"、"趋势"、"概述" → 全局查询）
    global_keywords = ["主题", "趋势", "概述", "总结", "整体"]
    has_global = any(kw in query for kw in global_keywords)
    
    # 综合评分
    score = 0.0
    score += min(entity_count / 5.0, 1.0) * 0.4  # 实体数量权重
    score += 0.3 if has_relation else 0.0
    score += 0.2 if has_global else 0.0
    
    return min(score, 1.0), entity_count
```

**综合复杂度评分**：

```python
def compute_complexity_score(query: str, entity_index) -> float:
    """综合评分公式"""
    syntactic = query_complexity_syntactic(query)
    semantic, entity_count = query_complexity_semantic(query, entity_index)
    
    score = 0.4 * syntactic + 0.6 * semantic
    return min(score, 1.0)
```

**复杂度评分阈值**：

| 评分范围 | 判定 | 说明 |
|------|------|------|
| [0, 0.3) | 简单查询 | 不需要图谱 |
| [0.3, 0.6) | 中等复杂度 | 可选图谱 |
| [0.6, 1.0] | 复杂查询 | 需要图谱 |

### 2.3 向量检索置信度评估

**置信度计算**：

```python
def compute_confidence(vector_scores: list[float]) -> float:
    """
    基于向量检索结果的置信度
    
    参数:
        vector_scores: 按相似度排序的向量得分 [s1, s2, s3, ...]
    
    返回:
        置信度分数 [0, 1]，越高越确定
    """
    if len(vector_scores) < 2:
        return 1.0 if vector_scores else 0.0
    
    top_score = vector_scores[0]
    bottom_score = vector_scores[-1]
    
    # 最高分与最低分的差距越大 → 置信度越高
    gap = top_score - bottom_score
    
    # 相对差距归一化
    confidence = gap / (top_score + 1e-8)
    
    return min(confidence, 1.0)
```

**置信度判定**：

| 置信度 | 判定 | 说明 |
|------|------|------|
| > 0.8 | 高置信度 | 不需要图谱 |
| [0.5, 0.8] | 中置信度 | 可选图谱 |
| < 0.5 | 低置信度 | 需要图谱 |

**自适应阈值**：

```python
class AdaptiveConfidenceThreshold:
    """自适应置信度阈值"""
    
    def __init__(self, percentile=75):
        self.hist_confidence = []  # 历史置信度
        self.percentile = percentile
    
    def update(self, confidence: float):
        self.hist_confidence.append(confidence)
        if len(self.hist_confidence) > 1000:
            self.hist_confidence = self.hist_confidence[-1000:]
    
    def get_threshold(self) -> float:
        """基于历史分布的动态阈值"""
        if len(self.hist_confidence) < 10:
            return 0.5  # 默认阈值
        threshold = np.percentile(self.hist_confidence, self.percentile)
        return threshold
```

### 2.4 实体匹配策略

```python
class EntityMatcher:
    """实体匹配器"""
    
    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver
    
    def match_query_entities(self, query: str) -> dict:
        """
        从查询中识别实体并匹配图谱
        
        返回: {canonical_name: {matched, confidence, id}}
        """
        # 1. 从查询中提取候选实体（可用 NER）
        candidates = self._extract_candidates(query)
        
        # 2. 在图谱索引中匹配
        results = {}
        for candidate in candidates:
            # BM25 匹配
            bm25_score = self._bm25_match(candidate)
            # 向量相似度匹配
            vector_score = self._vector_match(candidate)
            # 模糊匹配
            fuzzy_score = self._fuzzy_match(candidate)
            
            # 综合匹配度
            confidence = 0.4 * bm25_score + 0.3 * vector_score + 0.3 * fuzzy_score
            
            if confidence > 0.5:
                results[candidate] = {
                    "matched": True,
                    "confidence": confidence,
                    "score": {
                        "bm25": bm25_score,
                        "vector": vector_score,
                        "fuzzy": fuzzy_score
                    }
                }
        return results
    
    def _bm25_match(self, entity: str) -> float:
        """BM25 匹配"""
        # Cypher 查询实体索引
        query = """
        CALL db.index.fulltext.queryNodes('entity_index', $entity)
        YIELD node, score
        RETURN score
        """
        # ... 执行并返回 score
        return 0.0  # placeholder
    
    def _vector_match(self, entity: str) -> float:
        """向量相似度匹配"""
        # 查询实体向量，计算与查询实体向量的相似度
        return 0.0  # placeholder
    
    def _fuzzy_match(self, entity: str) -> float:
        """模糊匹配（编辑距离）"""
        from difflib import SequenceMatcher
        max_ratio = 0.0
        for known in self._get_all_entity_names():
            ratio = SequenceMatcher(None, entity.lower(), known.lower()).ratio()
            max_ratio = max(max_ratio, ratio)
        return max_ratio
```

### 2.5 多信号融合决策

**融合公式**：

```python
import numpy as np
from scipy.special import expit  # sigmoid

class LazyGraphTrigger:
    """惰性图谱触发器"""
    
    def __init__(self, weights=None):
        # 权重可通过训练学习
        self.weights = weights or {
            "complexity": 0.35,
            "confidence": 0.30,
            "entity_match": 0.20,
            "history": 0.15
        }
    
    def should_use_graph(self, query: str, entity_index, history=None) -> bool:
        """
        判断是否需要使用图谱
        
        返回: (should_use: bool, confidence: float)
        """
        # 1. 复杂度信号
        complexity = compute_complexity_score(query, entity_index)
        
        # 2. 向量置信度信号
        vector_scores = self._get_vector_scores(query)
        vector_confidence = compute_confidence(vector_scores)
        
        # 3. 实体匹配信号
        entity_matches = self._match_entities(query, entity_index)
        entity_signal = len(entity_matches) / max(len(entity_matches) + 1, 1)
        
        # 4. 历史查询信号
        history_signal = self._get_history_signal(query, history) if history else 0.0
        
        # 综合评分
        raw_score = (
            self.weights["complexity"] * complexity +
            self.weights["confidence"] * (1.0 - vector_confidence) +  # 置信度越低，越需要图谱
            self.weights["entity_match"] * entity_signal +
            self.weights["history"] * history_signal
        )
        
        # Sigmoid 映射到 [0, 1]
        trigger_prob = expit(4 * (raw_score - 0.5))  # 4 控制曲线斜率
        
        should_use = trigger_prob > 0.5  # 阈值可配置
        
        return should_use, trigger_prob
    
    def _get_history_signal(self, query: str, history: dict) -> float:
        """基于历史查询的记录"""
        # 简单的查询模式相似度
        similarity = self._query_similarity(query, history)
        return similarity
    
    def _query_similarity(self, query: str, history: dict) -> float:
        """计算查询与历史查询的相似度"""
        # 实现略
        return 0.0
```

### 2.6 评估延迟预算

**关键原则**：评估本身不应成为瓶颈！

| 评估阶段 | 目标延迟 | 实现方式 |
|------|--|------|
| 复杂度评估 | < 1ms | 本地句法分析（无 LLM 调用） |
| 置信度计算 | < 1ms | 向量检索结果复用 |
| 实体匹配 | < 5ms | 图数据库索引查询（预建索引） |
| 历史查询 | < 0.1ms | 内存缓存 |
| **总评估延迟** | **< 10ms** | **可忽略不计** |

---

## 三、按需图谱构建

### 3.1 种子节点选择

**从查询中识别种子实体的 Prompt**：

```python
PROMPT_SEED_EXTRACT = """
你是一个实体识别专家。从以下查询中识别可能需要在知识图谱中查找的种子实体。

查询：{query}

种子实体是：
- 可能是人名、组织名、产品名等
- 是查询的核心对象
- 不需要关系或动作相关的词

输出格式：JSON 数组，每个元素包含 entity 和 type：
[{{"entity": "实体名称", "type": "实体类型"}}]

要求：
- 只输出 JSON，不要其他内容
- 如果查询中没有明显的种子实体，输出空数组 []
- 类型可以是：PERSON / ORGANIZATION / PRODUCT / EVENT / LOCATION
"""
```

**种子节点消歧**：

```python
def disambiguate_seed(seed_entity: str, neo4j_driver) -> list[dict]:
    """
    将种子实体消歧到图谱中的节点
    
    返回: [{node_id, name, score, type}]
    """
    # 在图谱中查找匹配的节点
    query = """
    MATCH (n:Entity)
    WHERE n.name = $name OR n.name CONTAINS $name
    WITH n, 
         CASE 
            WHEN n.name = $name THEN 1.0
            WHEN toLower(n.name) = toLower($name) THEN 0.9
            WHEN n.name CONTAINS $name THEN 0.7
            ELSE 0.5
         END AS score
    RETURN n.name AS name, score, labels(n) AS type, id(n) AS node_id
    ORDER BY score DESC
    LIMIT 5
    """
    result = neo4j_driver.query(query, {"name": seed_entity})
    return result
```

### 3.2 k-hop 邻居扩展

**详细算法**：

```python
def k_hop_neighbors(neo4j_driver, seed_node_id: int, k: int, 
                    max_nodes: int = 100) -> list[dict]:
    """
    获取种子节点的 k-hop 邻居
    
    参数:
        seed_node_id: 种子节点 ID
        k: 跳数（1-3）
        max_nodes: 最大节点数（防止子图过大）
    
    返回: [{node_id, name, type, properties}, ...]
    """
    if k == 1:
        query = """
        MATCH path = (start {node_id: $seed_id})-[:*1]-(neighbor)
        WHERE start <> neighbor
        RETURN neighbor.node_id AS node_id, 
               neighbor.name AS name, 
               labels(neighbor) AS type,
               properties(neighbor) AS properties,
               size((start)-->(neighbor)) AS degree
        ORDER BY degree DESC
        LIMIT $max_nodes
        """
    elif k == 2:
        query = """
        MATCH path = (start {node_id: $seed_id})-[:*1..2]-(neighbor)
        WHERE start <> neighbor
        WITH neighbor, min(length(path)) AS hops
        RETURN neighbor.node_id AS node_id,
               neighbor.name AS name,
               labels(neighbor) AS type,
               properties(neighbor) AS properties,
               hops AS hop_distance
        ORDER BY hops, random()
        LIMIT $max_nodes
        """
    elif k == 3:
        query = """
        MATCH path = (start {node_id: $seed_id})-[:*1..3]-(neighbor)
        WHERE start <> neighbor
        WITH neighbor, min(length(path)) AS hops
        RETURN neighbor.node_id AS node_id,
               neighbor.name AS name,
               labels(neighbor) AS type,
               properties(neighbor) AS properties,
               hops AS hop_distance
        ORDER BY hops, random()
        LIMIT $max_nodes
        """
    else:
        raise ValueError("k > 3 会导致节点爆炸，不建议使用")
    
    result = neo4j_driver.query(query, {
        "seed_id": seed_node_id,
        "max_nodes": max_nodes
    })
    return result
```

**k=1, 2, 3 的子图大小估算**（以平均每个节点有 10 条边为例）：

| k 值 | 节点数估算 | 边数估算 | Token 估算 |
|------|------|--|------|
| k=1 | ~10-30 | ~10-30 | ~200-800 |
| k=2 | ~50-200 | ~50-400 | ~1000-5000 |
| k=3 | ~100-500 | ~100-1500 | ~2000-12000 |

**边界控制**：

```python
class SubgraphBoundary:
    """子图边界控制器"""
    
    def __init__(self, max_nodes=100, max_edges=200, max_tokens=8000, timeout_ms=5000):
        self.max_nodes = max_nodes
        self.max_edges = max_edges
        self.max_tokens = max_tokens
        self.timeout_ms = timeout_ms
    
    def check_and_trim(self, subgraph: dict) -> dict:
        """检查子图大小并必要时剪枝"""
        node_count = len(subgraph.get("nodes", []))
        edge_count = len(subgraph.get("edges", []))
        token_count = self._estimate_tokens(subgraph)
        
        # 检查是否超限
        if node_count > self.max_nodes:
            subgraph = self._trim_by_degree(subgraph, self.max_nodes)
        if edge_count > self.max_edges:
            subgraph = self._trim_by_confidence(subgraph, self.max_edges)
        if token_count > self.max_tokens:
            subgraph = self._compress_with_summaries(subgraph)
        
        return subgraph
    
    def _trim_by_degree(self, subgraph: dict, max_nodes: int) -> dict:
        """按节点度（连接数）剪枝"""
        nodes = subgraph["nodes"]
        # 按 degree 排序，保留前 max_nodes
        nodes = sorted(nodes, key=lambda n: -n.get("degree", 0))
        subgraph["nodes"] = nodes[:max_nodes]
        return subgraph
    
    def _trim_by_confidence(self, subgraph: dict, max_edges: int) -> dict:
        """按边置信度剪枝"""
        edges = subgraph["edges"]
        edges = sorted(edges, key=lambda e: -e.get("confidence", 0))
        subgraph["edges"] = edges[:max_edges]
        return subgraph
    
    def _compress_with_summaries(self, subgraph: dict) -> dict:
        """用社区摘要压缩子图"""
        # 实现略（调用 LLM 生成社区摘要）
        return subgraph
```

### 3.3 路径扩展策略

```python
def path_extension(neo4j_driver, seed_node_id: int, max_depth: int = 3) -> list[dict]:
    """
    沿已知关系路径扩展，找到更远的关联实体
    
    适用场景：多跳推理、长距离关联
    """
    query = """
    MATCH path = (start {node_id: $seed_id})-[*1..$max_depth]->(end)
    WHERE length(path) > 1
    RETURN path, 
           [n IN nodes(path) | n.name] AS entity_chain,
           [r IN relationships(path) | {rel: r.name, conf: r.confidence}] AS relation_chain
    LIMIT 50
    """
    result = neo4j_driver.query(query, {
        "seed_id": seed_node_id,
        "max_depth": max_depth
    })
    return result
```

### 3.4 实时抽取管线

**轻量 LLM 选型**：

| LLM | 精度 (NER) | 速度 | 成本 | 适用场景 |
|------|------|--|------|--|
| GPT-4o | 最高 | 慢 | 高 | 高精度需求 |
| GPT-4o-mini | 高 | 中 | 低 | 大多数场景 |
| GPT-3.5-turbo | 中 | 快 | 极低 | 低预算场景 |
| Claude Haiku | 高 | 快 | 低 | 备选方案 |
| 开源（Llama 3） | 中 | 中 | 中 | 本地部署 |

**批量抽取策略**：

```python
class BatchExtractor:
    """批量抽取器"""
    
    def __init__(self, llm_client, batch_size=4):
        self.llm = llm_client
        self.batch_size = batch_size
    
    def extract_batch(self, doc_chunks: list[dict]) -> list[dict]:
        """
        批量抽取实体和关系
        
        策略：
        1. 将 doc_chunks 分成 batch_size 大小的批次
        2. 每个批次调用一次 LLM
        3. 合并结果
        """
        all_results = []
        
        for i in range(0, len(doc_chunks), self.batch_size):
            batch = doc_chunks[i:i + self.batch_size]
            
            # 合并批次文本为一次调用
            combined_text = "\n---\n".join(
                f"文档 {idx + i}:\n{chunk['content']}"
                for idx, chunk in enumerate(batch)
            )
            
            prompt = f"""
从以下文档中抽取实体和关系三元组。

{combined_text}

输出 JSON:
{{"entities": [...], "relations": [...]}}
"""
            response = self.llm.chat(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            result = self._parse_llm_output(response)
            all_results.extend(result)
        
        return all_results
```

### 3.5 子图生成与存储

**子图格式**：

```json
{
  "nodes": [
    {
      "id": "n1",
      "name": "Microsoft",
      "type": "ORGANIZATION",
      "properties": {"source": "doc_12"},
      "embedding": [0.12, -0.34, ...]
    },
    {
      "id": "n2",
      "name": "Azure",
      "type": "PRODUCT",
      "properties": {"source": "doc_12"},
      "embedding": [0.45, 0.12, ...]
    }
  ],
  "edges": [
    {
      "source": "n1",
      "target": "n2",
      "relation": "released",
      "confidence": 0.95
    }
  ]
}
```

**临时存储机制**：

```python
import redis
import json
import time

class SubgraphStore:
    """临时子图存储（Redis）"""
    
    def __init__(self, redis_client, ttl=300):
        self.redis = redis_client
        self.ttl = ttl  # 5 分钟过期
    
    def put(self, query_hash: str, subgraph: dict):
        """存储子图"""
        key = f"subgraph:{query_hash}"
        self.redis.setex(key, self.ttl, json.dumps(subgraph))
    
    def get(self, query_hash: str) -> dict:
        """获取子图"""
        key = f"subgraph:{query_hash}"
        data = self.redis.get(key)
        return json.loads(data) if data else None
    
    def delete(self, query_hash: str):
        """删除子图"""
        key = f"subgraph:{query_hash}"
        self.redis.delete(key)
```

---

## 四、基于 LazyGraph 的检索

### 4.1 检索流程

```
用户查询
    │
    ▼
┌─ 惰性评估 ────── 否 ──→ 普通向量检索 → LLM 生成 → 回答
│    (复杂度+置信度)
│    是
▼
┌─ 种子节点选择 ──→ 图谱节点匹配
│
▼
┌─ k-hop 扩展 ──→ 邻居节点收集
│   (边界控制)
▼
┌─ 实时抽取 ──→ 对邻居关联文档进行实体/关系抽取
│   (轻量 LLM)
▼
┌─ 子图构建 ──→ 合并为临时子图
│
▼
┌─ 子图检索 ──→ 子图遍历 + 向量融合
│
▼
┌─ 上下文构建 ──→ 子图上下文 + 向量上下文
│
▼
┌─ 图感知生成 ──→ LLM 生成 → 回答
```

### 4.2 子图检索算法

**子图内节点检索**：

```python
def search_in_subgraph(subgraph: dict, query_vector: list, top_k: int = 10) -> list:
    """
    在子图中检索与查询最相关的节点
    
    策略：
    1. 向量相似度检索（节点 embedding vs 查询向量）
    2. 图谱路径相关性（节点与种子的距离）
    3. 联合排序
    """
    results = []
    seed_id = subgraph.get("seed_id")
    
    for node in subgraph["nodes"]:
        # 1. 向量相似度
        vec_score = cosine_similarity(node["embedding"], query_vector)
        
        # 2. 路径相关性（与种子的距离，越近越相关）
        hop_distance = node.get("hop_distance", 999)
        path_score = 1.0 / (1.0 + hop_distance)
        
        # 3. 联合评分
        combined_score = 0.6 * vec_score + 0.4 * path_score
        
        results.append({
            "node_id": node["id"],
            "name": node["name"],
            "score": combined_score,
            "vec_score": vec_score,
            "path_score": path_score
        })
    
    # 按联合评分排序
    results = sorted(results, key=lambda x: -x["score"])
    return results[:top_k]
```

### 4.3 RRF 融合实现

```python
def rrf_fusion(graph_results: list, vector_results: list, k: int = 60) -> list:
    """
    RRF（Reciprocal Rank Fusion）融合子图检索和向量检索结果
    
    RRF(k) = Σ_{d ∈ results} 1 / (k + rank(d))
    """
    score_map = {}
    
    # 子图结果
    for rank, doc in enumerate(graph_results, 1):
        node_id = doc["node_id"]
        score_map[node_id] = score_map.get(node_id, 0) + 1.0 / (k + rank)
    
    # 向量结果
    for rank, doc in enumerate(vector_results, 1):
        doc_id = doc["doc_id"]
        score_map[doc_id] = score_map.get(doc_id, 0) + 1.0 / (k + rank)
    
    # 按分数降序排序
    return sorted(score_map.items(), key=lambda x: -x[1])
```

### 4.4 子图剪枝与压缩

**剪枝策略**：

| 策略 | 方法 | 效果 |
|------|------|------|
| **度剪枝** | 移除度最低的节点 | 减少 20-30% 节点 |
| **置信度剪枝** | 移除关系置信度 < 0.5 的边 | 减少 30-50% 边 |
| **距离剪枝** | 移除 hop_distance > 2 的节点 | 减少子图大小 |

**压缩方法**：

```python
def compress_subgraph(subgraph: dict, target_tokens: int = 4000) -> dict:
    """
    压缩子图：用社区摘要替代节点属性
    
    1. 在子图内运行轻量社区检测
    2. 对每个社区生成摘要
    3. 用摘要替代原始节点属性
    """
    # 1. 子图内社区检测
    communities = light_weight_leiden(subgraph)
    
    # 2. 社区摘要
    community_summaries = {}
    for comm_id, nodes in communities.items():
        node_text = " ".join(n["name"] for n in nodes)
        summary = self._generate_community_summary(node_text)
        community_summaries[comm_id] = summary
    
    # 3. 重构子图
    compressed = {
        "communities": community_summaries,
        "seed": subgraph["seed"],
        "node_names": list(set(n["name"] for n in subgraph["nodes"]))
    }
    return compressed
```

---

## 五、LazyGraphRAG 生成阶段

### 5.1 上下文构建

**子图上下文格式**：

```
【子图信息】
实体-关系三元组：
  Microsoft → released → Azure
  Microsoft → invested_in → OpenAI
  Satya Nadella → CEO_of → Microsoft

相关社区：
  社区 A: "云服务平台"（包含 Azure, AWS, Google Cloud）
  社区 B: "人工智能"（包含 OpenAI, ChatGPT, GPT-4）

节点名称列表：
  Microsoft, Azure, OpenAI, Satya Nadella, GPT-4, ...
```

**向量上下文格式**：

```
【向量检索结果】（Top-K）
chunk_1: "Azure 是微软的云服务平台..." [doc_12]
chunk_2: "微软投资了 OpenAI..." [doc_34]
chunk_3: "Satya Nadella 是微软的 CEO..." [doc_56]
```

### 5.2 图谱感知 Prompt 设计

**完整 Prompt 模板**：

```python
PROMPT_LAZY_GRAPH = """
你是一个专业助手。请基于以下信息回答问题。

【子图信息（查询时构建的临时图谱）】
实体-关系三元组：
{triplets}

社区摘要（子图内）：
{community_summaries}

【向量检索结果（Hybrid RAG 召回）】
{vector_results}

【原始文档片段（引用来源）】
{doc_fragments}

【用户查询】
{query}

【回答要求】
1. 必须基于上述信息回答，不要编造事实
2. 引用来源用 [doc_X] 标记
3. 如果信息不足，明确说明
4. 答案要简洁、准确
"""
```

**上下文窗口 Token 预算分配**：

| 组件 | Token 预算 | 说明 |
|------|------|------|
| 子图三元组 | ~1000-3000 | 临时子图规模小 |
| 社区摘要 | ~500-1500 | 子图内社区数少 |
| 向量检索结果 | ~1000-3000 | Top-K chunks |
| 原始文档片段 | ~500-2000 | 引用来源 |
| 指令 | ~200-500 | 系统指令 |

### 5.3 生成质量控制

| 策略 | 方法 | 实现 |
|------|------|--|
| **图谱约束** | Prompt 中明确列出子图实体和关系，强制 LLM 引用 | 模板化 Prompt |
| **幻觉检测** | 生成后检查答案中的每个事实是否在子图中存在 | 实体匹配验证 |
| **多候选生成** | 生成 N 个候选答案，投票选出 | N=3-5 |
| **置信度评估** | 评估每个答案的置信度，低于阈值标记为"不确定" | 事实匹配率 |
| **降级策略** | 生成失败时回到纯向量检索的结果 | 兜底机制 |

```python
class QualityChecker:
    """生成质量控制"""
    
    def verify_against_subgraph(self, answer: str, subgraph: dict) -> dict:
        """验证答案与子图事实的一致性"""
        # 1. 提取答案中的实体
        answer_entities = self._extract_entities(answer)
        
        # 2. 检查实体是否在子图中
        subgraph_names = set(n["name"] for n in subgraph["nodes"])
        
        # 3. 检查关系是否在子图中
        answer_relations = self._extract_relations(answer)
        subgraph_relations = set((e["source"], e["target"], e["relation"]) for e in subgraph["edges"])
        
        # 4. 计算匹配率
        entity_match = len(answer_entities.intersection(subgraph_names)) / max(len(answer_entities), 1)
        relation_match = len(answer_relations.intersection(subgraph_relations)) / max(len(answer_relations), 1)
        
        confidence = 0.5 * entity_match + 0.5 * relation_match
        
        return {
            "confidence": confidence,
            "entity_match": entity_match,
            "relation_match": relation_match,
            "unverified_facts": answer_entities - subgraph_names
        }
```

### 5.4 延迟优化

#### 并行化策略

```
子图构建流程（串行）:
查询 → 评估 → 种子选择 → k-hop 扩展 → 实时抽取 → 子图构建

优化为（并行）:
查询 → 评估 → [种子选择, 向量检索] → k-hop 扩展 → [实时抽取 + 预计算]
                                                → 子图构建 + 候选向量检索
```

**预计算策略**：

```python
class PrecomputationEngine:
    """预计算引擎"""
    
    def __init__(self, neo4j_driver, vector_store):
        self.driver = neo4j_driver
        self.store = vector_store
    
    def precompute_for_query(self, query: str) -> dict:
        """
        在子图构建时，提前预计算可能需要的结果
        
        1. 并行执行：种子节点选择 + 向量检索
        2. 并行执行：k-hop 扩展 + 预取候选文档
        3. 异步：实时抽取完成后，立即启动候选查询的向量检索
        """
        results = {}
        
        # 并行 1：种子节点 + 向量检索
        seed_entities = self._extract_seeds(query)
        vector_results = self.store.search(query, k=20)
        results["seeds"] = seed_entities
        results["vector"] = vector_results
        
        # 并行 2：k-hop 扩展 + 预取候选文档
        subgraph = self._get_subgraph(seed_entities)
        candidate_docs = self._get_candidate_docs(subgraph)
        results["subgraph"] = subgraph
        results["candidate_docs"] = candidate_docs
        
        # 异步 3：实时抽取完成后，预计算候选查询的向量检索
        self._async_precompute(vector_results, candidate_docs)
        
        return results
```

#### 端到端延迟分解

| 阶段 | 延迟（估算） | 优化手段 |
|------|------|--|
| 惰性评估 | < 10ms | 本地计算 |
| 种子节点选择 | < 20ms | 图数据库索引查询 |
| k-hop 扩展 | < 50ms | 预建索引 |
| 实时抽取 | 200-500ms | 轻量 LLM、批量调用 |
| 子图构建 | < 10ms | 内存操作 |
| 子图检索 | < 20ms | 内存计算 |
| 向量融合 | < 10ms | 预计算 |
| LLM 生成 | 500-2000ms | 取决于模型和输入长度 |
| **总延迟** | **~800-2600ms** | 取决于实时抽取和 LLM 生成 |

**延迟优化效果对比**：

| 优化手段 | 延迟改善 |
|------|--|
| 子图构建与 LLM 调用并行化 | -300ms |
| 预计算候选向量检索 | -100ms |
| 智能缓存 | -200ms（缓存命中时） |
| 超时降级 | 避免无限等待 |

### 5.5 智能缓存

```python
class IntelligentCache:
    """智能缓存"""
    
    def __init__(self, ttl=300):
        self.ttl = ttl
        self.cache = {}  # query_hash → result
    
    def get(self, query: str) -> dict:
        """获取缓存"""
        query_hash = self._hash(query)
        if query_hash in self.cache:
            entry = self.cache[query_hash]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["result"]
            else:
                del self.cache[query_hash]
        return None
    
    def put(self, query: str, result: dict):
        """存入缓存"""
        query_hash = self._hash(query)
        self.cache[query_hash] = {
            "result": result,
            "timestamp": time.time()
        }
    
    def invalidate_by_doc(self, doc_id: str):
        """文档更新时失效相关缓存"""
        keys_to_delete = [k for k, v in self.cache.items() if doc_id in v["result"]]
        for k in keys_to_delete:
            del self.cache[k]
```

---

## 六、成本对比与基准

### 6.1 成本对比

| 组件 | 传统 GraphRAG | LazyGraphRAG |
|------|------|------|
| **索引成本** | ~$2.91（1000 文档） | **$0**（零索引） |
| **存储成本** | 全图谱 + 社区摘要 + 向量索引 | 仅向量索引 |
| **查询成本** | 高（社区摘要 Map-Reduce） | 低（按需子图） |
| **维护成本** | 高（文档更新需重建） | 低（增量更新） |

### 6.2 不同文档规模的成本对比

| 文档数 | 传统 GraphRAG 成本 | LazyGraphRAG 成本（100 查询/天） | 节省 |
|------|--|------|--|
| 100 文档 | $0.29 | $0.50 | - |
| 1000 文档 | $2.91 | $0.50 | **83%** |
| 10000 文档 | $29.10 | $0.50 | **98%** |
| 100000 文档 | $291.00 | $0.50 | **99.8%** |

### 6.3 实际场景案例

#### 场景 1：企业知识库（1000 文档，每天 100 查询）

| 指标 | 传统 GraphRAG | LazyGraphRAG |
|------|----|----|
| 索引成本（一次性） | $2.91 | $0 |
| 每日查询成本 | ~$0.50 | ~$0.50 |
| 总月成本（30 天） | $17.7 | $15 |
| 索引时间 | 2-4 小时 | 0 |
| 查询延迟 | 200-500ms | 800-2000ms |
| 适合度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

#### 场景 2：文档频繁更新（每天 10% 文档变更）

| 指标 | 传统 GraphRAG | LazyGraphRAG |
|------|----|----|
| 每日索引成本 | $0.29/daily | $0 |
| 每月索引成本 | $8.7 | $0 |
| 数据新鲜度 | 滞后 2-4 小时 | 实时 |
| 适合度 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

#### 场景 3：大规模语料库（100000 文档）

| 指标 | 传统 GraphRAG | LazyGraphRAG |
|------|----|----|
| 索引成本 | $291 | $0 |
| 索引时间 | 1-2 天 | 0 |
| 存储成本 | 高 | 低 |
| 适合度 | ⭐⭐（成本过高） | ⭐⭐⭐⭐⭐ |

---

## 七、代码骨架

### 7.1 惰性评估触发器

```python
import numpy as np
from scipy.special import expit

class LazyGraphTrigger:
    """惰性图谱触发器"""
    
    def __init__(self, weights=None, threshold=0.5):
        self.weights = weights or {
            "complexity": 0.35,
            "confidence": 0.30,
            "entity_match": 0.20,
            "history": 0.15
        }
        self.threshold = threshold
    
    def should_use_graph(self, query: str, vector_scores: list, 
                         entity_matches: list, history_score: float) -> tuple:
        """
        判断是否使用图谱
        
        返回: (should_use: bool, trigger_prob: float)
        """
        complexity = self._eval_complexity(query)
        confidence = self._eval_confidence(vector_scores)
        entity_signal = len(entity_matches) / max(len(entity_matches) + 1, 1)
        
        raw_score = (
            self.weights["complexity"] * complexity +
            self.weights["confidence"] * (1.0 - confidence) +
            self.weights["entity_match"] * entity_signal +
            self.weights["history"] * history_score
        )
        
        trigger_prob = expit(4 * (raw_score - 0.5))
        return trigger_prob > self.threshold, trigger_prob
```

### 7.2 种子节点提取 Prompt

```python
PROMPT_SEED = """
从以下查询中识别种子实体：

查询：{query}

输出 JSON：[{{"entity": "名称", "type": "类型"}}]
"""
```

### 7.3 k-hop 扩展（Neo4j Cypher）

```cypher
-- k=2 邻居扩展
MATCH path = (start {node_id: $seed_id})-[:*1..2]-(neighbor)
WHERE start <> neighbor
WITH neighbor, min(length(path)) AS hops
RETURN neighbor.name AS name, labels(neighbor) AS type, properties(neighbor) AS props, hops
ORDER BY hops, random()
LIMIT 100;
```

### 7.4 子图构建与缓存（Python）

```python
class LazyGraphEngine:
    """LazyGraphRAG 引擎"""
    
    def __init__(self, neo4j_driver, vector_store, llm_client):
        self.neo4j = neo4j_driver
        self.vector = vector_store
        self.llm = llm_client
        self.trigger = LazyGraphTrigger()
        self.cache = IntelligentCache()
    
    def query(self, query: str) -> dict:
        """主查询入口"""
        # 1. 缓存检查
        cached = self.cache.get(query)
        if cached:
            return cached
        
        # 2. 惰性评估
        vector_scores = self._get_vector_scores(query)
        should_use_graph, prob = self.trigger.should_use_graph(
            query, vector_scores, [], 0.0
        )
        
        # 3. 条件分支
        if not should_use_graph:
            result = self._vector_only(query)
        else:
            result = self._lazy_graph_query(query)
        
        # 4. 缓存
        self.cache.put(query, result)
        return result
    
    def _lazy_graph_query(self, query: str) -> dict:
        """LazyGraph 查询流程"""
        # 种子节点
        seeds = self._extract_seeds(query)
        
        # k-hop 扩展
        neighbors = self._get_neighbors(seeds, k=2)
        
        # 子图构建
        subgraph = self._build_subgraph(seeds, neighbors)
        
        # 子图检索
        graph_results = self._search_subgraph(subgraph)
        
        # 向量融合
        vector_results = self._vector_search(query)
        fused = rrf_fusion(graph_results, vector_results)
        
        # 图感知生成
        context = self._build_context(subgraph, fused)
        answer = self._generate(query, context)
        
        return {"answer": answer, "method": "lazy_graph"}
```

### 7.5 降级策略

```python
def fallback_to_vector(query: str, subgraph: dict, error: Exception) -> dict:
    """
    子图构建失败时的降级
    
    降级策略：
    1. 记录失败日志
    2. 记录子图大小/构建时间用于优化
    3. 回到普通向量检索
    4. 不向用户暴露失败
    """
    log_failure(query, subgraph, error)
    return {
        "answer": self._vector_only(query)["answer"],
        "method": "vector_fallback",
        "fallback_from": "lazy_graph"
    }
```

### 7.6 成本估算函数

```python
def estimate_cost(doc_count: int, query_count: int = 100, 
                  model_price: float = 0.00015) -> dict:
    """
    估算 GraphRAG 成本
    
    参数:
        doc_count: 文档数量
        query_count: 每日查询数
        model_price: GPT-4o-mini 每 token 价格
    
    返回: {index_cost, query_cost, storage_cost, total}
    """
    # 索引成本
    chunks = doc_count * 10  # 假设每文档 10 个 chunk
    entity_calls = chunks  # 每个 chunk 1 次
    relation_calls = chunks  # 每个 chunk 1 次
    community_calls = max(1, chunks // 20)  # 社区数估算
    total_llm_calls = entity_calls + relation_calls + community_calls
    
    index_cost = total_llm_calls * 600 * model_price  # 600 tokens/call
    
    # 查询成本（每次查询约 3000 tokens）
    query_cost = query_count * 30 * 30 * model_price  # 30 天
    
    return {
        "index_cost": index_cost,
        "query_cost_30d": query_cost,
        "total": index_cost + query_cost
    }
```

---

> **进阶基础**：[GraphRAG 概览](graphrag.md)
> **进阶进阶**：[生产部署](production.md)
