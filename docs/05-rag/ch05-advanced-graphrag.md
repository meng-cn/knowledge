# 进阶篇：GraphRAG（知识图谱增强 RAG）

> 核心新增：实体抽取 · 知识图谱构建 · 图数据库集成 · 图谱检索 · 图感知生成 · 全局搜索
> 相对于基础 RAG，GraphRAG 引入的核心能力是：
> - **实体与关系抽取**（LLM 从文本中提取结构化三元组）
> - **知识图谱构建与存储**（节点/边/社区/摘要）
> - **基于图的检索**（k-hop 遍历、社区检测、DRIFT）
> - **图感知生成**（图谱上下文注入、引用溯源、全局摘要）
> - **全局搜索**（社区摘要 Map-Reduce，回答"整个语料说了什么"）

---

## 一、GraphRAG 架构总览

### 1.1 整体架构图

```
┌──────────────┐
│  原始文档     │
└──────┬───────┘
       │ 文档分割
       ▼
┌──────────────┐
│  Chunk 列表   │
└──────┬───────┘
       │ 实体/关系抽取  ←── LLM 调用（关键新增步骤）
       ▼
┌──────────────┐
│  知识图谱     │ ←── Neo4j / FalkorDB 等图数据库
│  (节点+边+社区)│
└──────┬───────┘
       │ 图谱遍历 + 向量检索  ←── 混合检索（新增图路径）
       ▼
┌──────────────┐
│  上下文构建   │  ←── 图谱上下文 + 向量上下文联合
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  LLM 生成     │
└──────────────┘
```

**对比传统 RAG 流水线**：

```
传统 RAG:                          GraphRAG:
────────                           ─────────
原始文档 → 分块 → 向量化 →         原始文档 → 分块 → 实体抽取 → 关系抽取
          → 向量数据库              → 图谱构建 → 社区检测 → 社区摘要
                                      → 向量数据库
                                    → 图谱遍历 + 向量检索
                                    → 上下文构建
                                    → LLM 生成
```

**关键差异**：
- GraphRAG 多了 **4 个新增步骤**：实体抽取 (LLM)、关系抽取 (LLM)、社区检测 (Leiden)、社区摘要 (LLM)
- GraphRAG 在检索阶段多了 **图谱遍历**，与向量检索联合
- GraphRAG 在生成阶段多了 **图谱约束**，减少幻觉

### 1.2 GraphRAG 的核心价值

| 价值维度 | 传统 RAG | GraphRAG |
|------|------|------|
| 多跳推理 | ❌ | ✅ |
| 全局摘要 | ❌ | ✅ |
| 实体关系理解 | 弱 | 强 |
| 幻觉缓解 | 一般 | 显著改善 |
| 可解释性 | 低 | 高（图路径可追溯） |
| 跨文档关联 | ❌ | ✅ |
| 矛盾检测 | ❌ | ✅ |
| 新实体发现 | ❌ | ✅ |

**技术原理对比**：

| 维度 | 传统 RAG 原理 | GraphRAG 原理 |
|------|------|--|
| **多跳推理** | 单条 chunk 相似度最高 → 无法跨越多个文档 | k-hop 遍历可沿关系边找到远距离关联 |
| **全局摘要** | 无法回答"整个语料说了什么" | Leiden 社区检测 → 社区摘要 → Map-Reduce |
| **实体关系** | 向量相似度隐含关系，但不精确 | 显式的实体-关系-实体三元组 |
| **可解释性** | 只能给出"最相似的 N 个 chunk" | 可展示推理链：实体 → 关系 → 实体 → 文档 |

### 1.3 GraphRAG 的两种模式

#### 本地模式 (Local Mode)

**适用**："X 是什么？X 和 Y 的关系？"等实体相关查询

**执行流程**：
```
1. 查询解析 → 识别目标实体（如 "Microsoft"）
2. 实体匹配 → 在图谱中找到"Microsoft"节点
3. k-hop 邻居扩展 → 找到所有 k=1 或 k=2 的邻居节点
4. 邻居聚合 → 收集邻居的节点属性 + 边关系 + 关联文档片段
5. 向量融合 → 邻居的向量表示 + 查询的向量表示做联合相似度
6. 上下文构建 → 将聚合结果 + 向量检索结果合并为 Prompt 输入
7. LLM 生成 → 基于上下文生成回答
```

**优势**：精确的局部关系推理，回答实体相关问题能力强。

#### 全局模式 (Global Mode)

**适用**："数据集的主题？整体趋势？"等全局性问题

**执行流程**：
```
1. 社区检测 → 使用 Leiden 算法对全图谱进行层次化社区划分
2. 社区摘要 → 对每个社区（预计算）用 LLM 生成语义摘要
3. 社区匹配 → 查询与社区摘要做向量相似度匹配
4. Map-Reduce 聚合 → 对匹配的社区摘要进行层次化聚合
5. LLM 生成 → 基于聚合结果生成全局回答
```

**优势**：可以回答跨文档、全局性的问题——这是传统 RAG **完全无法做到**的。

### 1.4 为什么需要知识图谱增强

**传统 RAG 的四大痛点**：

| 痛点 | 具体表现 | GraphRAG 如何解决 |
|------|------|--|
| **语义鸿沟** | 向量相似度无法捕捉实体间关系（如"A → works_at → B"的语义无法通过向量近似表达） | 显式存储实体-关系-实体三元组 |
| **多跳推理断裂** | 单条 chunk 难以覆盖跨越多个文档的推理链（推理链长度 > chunk 长度） | k-hop 遍历可沿关系边找到远距离关联 |
| **全局洞察缺失** | 无法回答"整个语料说了什么"类问题 | Leiden 社区检测 + 社区摘要 + Map-Reduce |
| **事实一致性差** | 检索与生成之间缺乏结构约束，LLM 容易自由发挥产生幻觉 | 图谱提供事实约束，生成时强制引用图谱实体和关系 |

**知识图谱带来的增益**：
- 结构化上下文：实体-关系-实体三元组天然支持关系推理
- 多跳推理能力：通过图谱遍历可跨越多个节点找到关联
- 全局摘要能力：社区检测+LLM 摘要可回答全局性问题
- 可解释性：图谱路径可作为推理链追溯
- 幻觉缓解：图谱提供事实约束，减少 LLM 自由发挥

**适用场景**：
| 场景 | GraphRAG |
|------|------|
| 事实问答 | ✅ |
| 多跳推理 | ✅ |
| 汇总类问题 | ✅ |
| 矛盾检测 | ✅ |
| 新实体发现 | ✅ |
| 合规审查（全局风险评估） | ✅ |
| 跨文档关联检索 | ✅ |
| 概念关系挖掘 | ✅ |
| 简单单文档问答 | ❌（过度工程） |
| 极高延迟要求的实时场景 | ❌ |
| 文档更新极频繁场景 | ❌（图谱重建成本高） |

**不适用的场景**：
- 简单单文档问答（arXiv:2502.11371 系统评估结论）
- 检索延迟要求极高的实时场景
- 文档更新非常频繁的场景（图谱重建成本高）

---

## 二、实体与关系抽取

### 2.1 实体识别 (NER)

#### 方法对比

| 方法 | 精度 | 成本 | 可扩展性 | 适用场景 |
|------|------|------|------|------|
| 规则引擎（SpaCy） | 中（需领域适配） | 低 | 高 | 通用场景 |
| 序列标注模型（BIO） | 高（需标注数据） | 中 | 中 | 有大量标注数据的领域 |
| LLM Prompt-driven | 高（零样本可用） | 中（每文档调用） | 高 | 缺乏标注数据的场景 |

#### LLM Prompt-driven NER 完整实现

**Step 1：实体类型体系设计**

```json
{
  "entity_types": [
    "PERSON",         // 人物
    "ORGANIZATION",   // 组织/公司
    "PRODUCT",        // 产品/服务
    "EVENT",          // 事件
    "LOCATION",       // 地点/城市
    "DATE",           // 日期
    "TECHNOLOGY",     // 技术/协议
    "CURRENCY",       // 货币
    "MISC"            // 其他
  ],
  "exclusion_rules": [
    "忽略常见名词（不视为实体）",
    "忽略无意义的代词（他、她、它）",
    "日期统一标准化格式（YYYY-MM-DD）"
  ]
}
```

**Step 2：LLM Prompt 模板（含 few-shot）**

```python
PROMPT_NER = """
你是一个实体抽取专家。从以下文本中抽取所有实体，按照预定义的实体类型分类。

实体类型定义：
{entity_types}

约束：
- 只抽取有意义的实体，忽略常见名词和代词
- 同一实体的不同表述（如"微软"和"Microsoft"）保持原文表述
- 日期统一使用 YYYY-MM-DD 格式
- 输出必须是合法 JSON 数组

Few-shot 示例：
示例 1:
文本：微软发布了 Azure OpenAI Service
输出：[
  {{"entity": "微软", "type": "ORGANIZATION"}},
  {{"entity": "Azure OpenAI Service", "type": "PRODUCT"}}
]

示例 2:
文本：2024 年 3 月 15 日，苹果在 iPhone 发布会上发布了 Vision Pro
输出：[
  {{"entity": "2024-03-15", "type": "DATE"}},
  {{"entity": "苹果", "type": "ORGANIZATION"}},
  {{"entity": "iPhone", "type": "PRODUCT"}},
  {{"entity": "Vision Pro", "type": "PRODUCT"}}
]

现在处理以下文本：
文本：{document_chunk}
输出：
"""
```

**Step 3：批量处理与去重**

```python
import json
from collections import defaultdict

class EntityExtractor:
    """LLM 驱动的实体抽取器（批量 + 去重）"""

    def __init__(self, llm_client, model="gpt-4o-mini"):
        self.llm = llm_client
        self.model = model
        # 全局实体缓存（同文档内去重）
        self.entity_cache = defaultdict(list)  # entity_text → [doc_ids]

    def extract_batch(self, chunks: list[dict]) -> list[dict]:
        """批量抽取实体"""
        all_entities = []
        for i, chunk in enumerate(chunks):
            prompt = PROMPT_NER.format(
                entity_types=self._format_entity_types(),
                document_chunk=chunk["content"]
            )
            # 调用 LLM（可并行）
            response = self.llm.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1  # 低温度保证一致性
            )
            entities = self._parse_llm_output(response)
            for entity in entities:
                entity["source_doc_id"] = chunk["doc_id"]
                entity["source_chunk_id"] = chunk["chunk_id"]
                # 去重
                self._dedup_entity(entity)
            all_entities.extend(entities)
        return all_entities

    def _dedup_entity(self, entity: dict):
        """实体去重"""
        text = entity["entity"].lower().strip()
        if text not in self.entity_cache:
            self.entity_cache[text].append(entity)
        # 同文档内相同文本+类型的实体视为同一实体，合并
        pass
```

**成本估算**（以 1000 文档、每文档 10 个 chunk 为例）：
- 实体抽取调用数：10,000 次
- 每调用 Token：输入 ~500 + 输出 ~100 = 600 tokens
- GPT-4o-mini 成本：$0.15/百万 input tokens + $0.60/百万 output tokens
- 实体抽取总成本：10000 × 600 / 1000000 × ($0.15 + $0.60) ≈ **$0.90**
- GPT-4o 成本（10x）：≈ **$9.00**

### 2.2 关系抽取

#### 关系类型体系

```json
{
  "relation_types": [
    {"name": "founded_by", "description": "X 由 Y 创立"},
    {"name": "works_at", "description": "X 在 Y 工作/任职"},
    {"name": "located_in", "description": "X 位于 Y"},
    {"name": "acquired", "description": "X 收购了 Y"},
    {"name": "competes_with", "description": "X 与 Y 竞争"},
    {"name": "uses", "description": "X 使用 Y（技术/产品）"},
    {"name": "part_of", "description": "X 是 Y 的一部分"},
    {"name": "related_to", "description": "X 与 Y 有某种关联"}
  ]
}
```

#### LLM Prompt-driven 关系抽取 Prompt

```python
PROMPT_RE = """
你是一个关系抽取专家。从以下文本中抽取所有关系三元组 (subject, relation, object)。

关系类型定义：
{relation_types}

约束：
- subject 和 object 必须是上一步抽取到的实体
- 只抽取有明确关系的关系，不猜测模糊关系
- 如果同一对实体有多个关系，分别列出
- 输出必须是合法 JSON 数组

Few-shot 示例：
示例 1:
文本：微软收购了 Activision Blizzard
实体：[微软, Activision Blizzard]
输出：[{"subject": "微软", "relation": "acquired", "object": "Activision Blizzard"}]

示例 2:
文本：Tim Cook 在苹果公司工作，苹果位于加州库比蒂诺
实体：[Tim Cook, 苹果公司, 库比蒂诺]
输出：[
  {{"subject": "Tim Cook", "relation": "works_at", "object": "苹果公司"}},
  {{"subject": "苹果公司", "relation": "located_in", "object": "库比蒂诺"}}
]

现在处理以下文本：
文本：{document_chunk}
实体：{entities_in_chunk}
输出：
"""
```

#### 监督式 vs Prompt-based 关系抽取对比

| 维度 | 监督式（TACRED/DocRED） | Prompt-based（LLM） |
|------|--------|---------|
| **精度** | 高（需大量标注数据训练） | 高（零样本可用，但需 fine-tuning 提升） |
| **关系类型** | 受限预定义类型（TACRED 32 类） | 灵活可扩展 |
| **标注成本** | 高（需人工标注数万对） | 低（无需标注） |
| **跨领域迁移** | 差（需重新训练） | 好（few-shot 即可） |
| **推理成本** | 低（模型推理） | 中（LLM 调用） |

#### 证据融合策略

当多条证据指向同一关系时，需要融合：

```python
class EvidenceFusion:
    """关系证据融合"""

    def fuse_relations(self, evidence_list: list[dict]) -> list[dict]:
        """
        输入：[{subject, object, relation, confidence, source_doc_id, ...}]
        输出：[(subject, object, relation, confidence, sources)]
        """
        # 按 (subject, object, relation) 分组
        groups = defaultdict(list)
        for ev in evidence_list:
            key = (ev["subject"].lower(), ev["object"].lower(), ev["relation"])
            groups[key].append(ev)

        fused = []
        for key, evidences in groups.items():
            # 加权平均置信度
            avg_conf = sum(e["confidence"] for e in evidences) / len(evidences)
            # 去重后的来源文档
            sources = list(set(e["source_doc_id"] for e in evidences))
            fused.append({
                "subject": key[0],
                "object": key[1],
                "relation": key[2],
                "confidence": avg_conf,
                "supporting_docs": sources,
                "evidence_count": len(evidences)
            })
        return fused
```

### 2.3 实体消歧与链接

#### 实体消歧

**问题**：同一实体的不同表述（如 "Microsoft"、"微软"、"MSFT"）。

**策略**：
1. **字符串匹配**：编辑距离、同义词库、缩写映射
2. **嵌入相似度**：用同一实体在不同文档中出现的上下文做平均嵌入，计算相似度
3. **上下文一致性**：同一实体在不同文档中出现时的上下文分布应相似

```python
class EntityDisambiguator:
    """实体消歧器"""

    def disambiguate(self, entities: list[dict]) -> dict[str, str]:
        """
        输入：实体列表 [{entity: "微软", text: "Microsoft", type: "ORGANIZATION", ...}]
        输出：统一标识映射 {"微软": "Microsoft", "MSFT": "Microsoft", ...}
        """
        # 1. 按类型分组
        groups = defaultdict(list)
        for e in entities:
            groups[e["type"]].append(e)

        # 2. 在每个类型组内，用嵌入相似度聚类
        canonical_map = {}  # canonical_name → [aliases]
        for etype, group in groups.items():
            canonical = self._cluster_by_embedding(group)
            canonical_map[etype] = canonical
        return canonical_map

    def _cluster_by_embedding(self, entities: list[dict]) -> dict[str, list[str]]:
        """基于嵌入相似度的聚类"""
        from sklearn.cluster import DBSCAN
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        texts = [e["text"] for e in entities]
        embeddings = model.encode(texts)

        db = DBSCAN(eps=0.35, min_samples=1)
        labels = db.fit_predict(embeddings)

        clusters = defaultdict(list)
        for e, label in zip(entities, labels):
            clusters[label].append(e["text"])

        # 取每个簇的首个作为规范名
        canonical_map = {}
        for label, aliases in clusters.items():
            canonical = aliases[0]
            for alias in aliases:
                canonical_map[alias] = canonical
        return canonical_map
```

---

## 三、知识图谱构建

### 3.1 图谱构建流程

```
┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐
│ 抽取结果│ → │实体对齐│ → │关系融合│ → │图谱存储│
│(节点+边)│   │(合并) │   │(验证) │   │(Neo4j)│
└───────┘   └───────┘   └───────┘   └───────┘
```

### 3.2 实体对齐与关系融合

**实体对齐算法**：

| 方法 | 精度 | 速度 | 适用场景 |
|------|------|------|------|
| 字符串精确匹配 | 低 | 极快 | 同一数据源 |
| 编辑距离 + 同义词 | 中 | 快 | 跨数据源 |
| 嵌入聚类（DBSCAN） | 高 | 中 | 大规模数据 |
| 图神经网络节点嵌入 | 最高 | 慢 | 已有部分图谱 |

### 3.3 图谱存储选型

| 数据库 | 类型 | 查询语言 | 图RAG适用性 | 安装复杂度 | 延迟（P50） |
|--------|------|----------|------|------|------|
| **Neo4j** | 原生图数据库 | Cypher | ⭐⭐⭐⭐ 通用，社区成熟 | 中 | 5-20ms |
| **FalkorDB** | 原生图 | SQL | ⭐⭐⭐⭐ 低延迟，专为GraphRAG优化 | 低（Redis模块） | <1ms |
| **NebulaGraph** | 分布式图 | NGL | ⭐⭐⭐ 大规模 | 高 | 10-50ms |
| **TigerGraph** | 原生图 | GSQL | ⭐⭐⭐ 高性能分析 | 高 | 5-30ms |
| **Amazon Neptune** | 多模型 | Gremlin/SPARQL | ⭐⭐ 云原生 | 中 | 20-50ms |

**Neo4j 安装与配置**（Docker）：

```yaml
# docker-compose.yml
version: '3.8'
services:
  neo4j:
    image: neo4j:5
    ports:
      - "7474:7474"   # HTTP
      - "7687:7687"   # Bolt
    environment:
      NEO4J_AUTH: neo4j/password
      NEO4J_dbms_memory_heap_max__size: 4G
      NEO4J_dbms_memory_heap_initial__size: 2G
      NEO4J_dbms_memory_pagecache_size: 2G
    volumes:
      - ./neo4j/data:/data
      - ./neo4j/logs:/logs
```

**Neo4j Cypher 查询示例**：

```cypher
-- 创建节点
CREATE (e:Entity {name: "Microsoft", type: "ORGANIZATION", source: "document_1"})
CREATE (p:Entity {name: "Azure OpenAI Service", type: "PRODUCT", source: "document_1"})
CREATE (r:Relationship {name: "released", confidence: 0.95})

-- 创建关系
MATCH (e:Entity {name: "Microsoft"})
MATCH (p:Entity {name: "Azure OpenAI Service"})
CREATE (e)-[:RELEAVED {confidence: 0.95, source: "document_1"}]->(p)

-- 查询图谱：找出 Microsoft 的 2-hop 邻居
MATCH path = (start:Entity {name: "Microsoft"})-[:*1..2]-(neighbor)
RETURN path

-- 查询所有关系类型为 "acquired" 的路径
MATCH path = (a)-[:ACQUIRED]->(b)
RETURN a.name, b.name, relationships(path)
```

### 3.4 图索引策略

| 索引类型 | 适用场景 | Neo4j 配置 | 查询性能 |
|------|------|------|------|
| **标签索引 (Label Index)** | 按实体类型快速查找 | `CREATE INDEX entity_type FOR (e:Entity) ON (e.type)` | O(log N) |
| **名称索引** | 按实体名称匹配 | `CREATE INDEX entity_name FOR (e:Entity) ON (e.name)` | O(log N) |
| **向量索引** | 向量相似度搜索 | Neo4j GDS 向量化 + HNSW | O(log N) |
| **全文索引** | BM25 关键词搜索 | Neo4j full-text index | O(1) |

---

## 四、基于图的检索策略

### 4.1 Local Search（本地搜索）—— 详细实现

**适用**："X 是什么？X 和 Y 的关系？"等实体相关查询

**完整执行流程**：

```
Step 1: 查询解析
┌──────────────────────────────┐
│ 查询："微软和 Google 的竞争关系？" │
│ 解析结果：                       │
│   目标实体: ["微软", "Google"]     │
│   关系类型: "competes_with"       │
│   查询类型: "关系查询"             │
└───────────────────────────────┘
              │
              ▼
Step 2: 实体匹配（图谱中查找）
┌──────────────────────────────┐
│ 查询图谱：                     │
│   找到 "Microsoft" 节点         │
│   找到 "Google" 节点            │
│   验证两者都存在                 │
└───────────────────────────────┘
              │
              ▼
Step 3: k-hop 邻居扩展
┌──────────────────────────────┐
│ k=1 邻居 (Microsoft):          │
│   ├─ Azure (PRODUCT, released)  │
│   ├─ Windows (PRODUCT, released) │
│   └─ Satya Nadella (PERSON, CEO) │
│   └─ OpenAI (ORGANIZATION, invested_in) │
│   ...                           │
│   共 N 个节点, M 条边              │
└───────────────────────────────┘
              │
              ▼
Step 4: 邻居聚合
┌──────────────────────────────┐
│ 聚合格式：                      │
│ [                            │
│   {                           │
│     "entity": "Azure",         │
│     "type": "PRODUCT",         │
│     "relations": ["released_by_Microsoft"], │
│     "context": "Azure 是微软的云服务平台", │
│     "source_doc": "doc_1, doc_2" │
│   },                           │
│   ...                          │
│ ]                              │
│ 总 Token 数：~X tokens           │
└─────────────────────────────┘
              │
              ▼
Step 5: 上下文构建
┌──────────────────────────────┐
│ Prompt 输入 =                  │
│   图谱上下文（节点+边+摘要）      │
│   + 向量检索结果（Top-K chunks）  │
│   + 用户查询                    │
│   + 指令                       │
└─────────────────────────────┘
              │
              ▼
Step 6: LLM 生成
┌──────────────────────────────┐
│ 输出：                        │
│ "微软和 Google 的竞争主要体现在    │
│  云服务和AI领域。在云服务方面，     │
│  Azure vs Google Cloud；在AI方面， │
│  Azure OpenAI vs Google Gemini。" │
└──────────────────────────────┘
```

**k-hop 邻居扩展的 Cypher 查询**：

```python
def get_k_hop_neighbors(neo4j_driver, entity_name: str, k: int = 2) -> dict:
    """获取实体的 k-hop 邻居"""
    if k == 1:
        query = """
        MATCH (start:Entity {name: $entity_name})-[r]->(neighbor)
        RETURN start.name AS subject, r.name AS relation, neighbor.name AS object,
               labels(start) AS subject_types, labels(neighbor) AS neighbor_types,
               properties(r) AS relation_props
        """
    elif k == 2:
        query = """
        MATCH path = (start:Entity {name: $entity_name})-[:*1..2]-(neighbor)
        RETURN path
        """
    else:
        raise ValueError(f"k={k} 的邻居扩展需要特殊处理（k>2 时节点爆炸）")

    result = neo4j_driver.query(query, {"entity_name": entity_name})
    return result
```

**k=1, 2, 3 的邻居数量估算**（以平均每个节点有 10 条边为例）：

| k 值 | 邻居数（估算） | Token 数 | 适用场景 |
|------|------|------|------|
| k=1 | ~10-30 | ~500-2000 | 简单关系查询 |
| k=2 | ~100-300 | ~5000-15000 | 中等复杂度查询 |
| k=3 | ~500-1000 | ~25000-50000 | 复杂多跳查询 |

**上下文压缩策略**（当邻居太多时）：
1. **按关系权重排序**：优先保留高置信度的关系
2. **按节点重要性排序**：优先保留 degree 高的节点
3. **社区摘要替代原始节点**：将每个社区的邻居节点合并为一个摘要
4. **Token 预算限制**：设定最大 Token 数，超限时截断

### 4.2 Global Search（全局搜索）—— 详细实现

**适用**："数据集的主题？整体趋势？"等全局性问题

**Leiden 社区检测原理**：

```
Leiden 算法 = Louvain 算法的改进版

核心步骤：
1. 随机初始化：每个节点一个社区
2. 局部移动：将节点移动到使其模块度 (Modularity) 最大的社区
3. 聚合：将每个社区的节点聚合为一个超级节点
4. 重复步骤 2-3，直到模块度不再显著提升
5. 结果：层次化社区树（Level 0 → Level 1 → Level 2 → ...）
```

**社区摘要生成 Prompt**：

```python
PROMPT_COMMUNITY_SUMMARY = """
你是一个分析专家。基于以下社区内的实体、关系和文档片段，
为该社区生成一段简短的语义摘要（50-100 字）。

社区信息：
实体：{entities}
关系：{relations}
相关文档片段：{docs}

要求：
- 摘要必须覆盖社区的核心主题
- 不要编造任何不存在的事实
- 用简洁的语言概括社区的核心内容

摘要：
"""
```

**Map-Reduce 层级聚合**：

```
Level 0 社区（最细粒度）：
  社区 A: ["实体1, 实体2, 实体3", "关系1, 关系2"]
  社区 B: ["实体4, 实体5, 实体6", "关系3, 关系4"]
  ...

Level 1 社区（Level 0 的父社区）：
  社区 AB: 社区A + 社区B 的摘要
  社区 CD: 社区C + 社区D 的摘要
  ...

Level 2+ 社区（继续向上聚合）：
  ...

最终：生成一个全局回答
```

**复杂度分析**：

| 阶段 | 操作 | LLM 调用次数 | Token 消耗（估算） |
|------|------|------|---------|
| 社区检测 | Leiden 算法（无需 LLM） | 0 | 0 |
| 社区摘要生成 | 每个社区一次 LLM 调用 | 社区数 | 社区数 × 1000 tokens |
| Map-Reduce 聚合 | Level 1 → Level 2 等 | 社区树节点数 | 树节点数 × 500 tokens |
| 最终回答 | 一次 LLM 调用 | 1 | ~1000 tokens |

### 4.3 DRIFT（动态推理集成）

**适用**：复杂多步查询

**完整流程**：

```
1. 社区概览 → 对图谱进行高层社区概览
2. 生成子查询 → 基于概览，LLM 生成多个子查询
3. Local 深入 → 对每个子查询执行 Local Search
4. 综合回答 → 汇总所有子查询结果
```

```python
PROMPT_SUBQUERY = """
基于以下图谱概览和原始查询，生成 3-5 个子查询来全面回答原始问题。

图谱概览：
{community_overview}

原始查询：{original_query}

要求：
- 每个子查询聚焦一个方面
- 子查询之间不要重复
- 子查询应该是可以通过 Local Search 回答的实体相关问题

子查询：
"""

PROMPT_FUSION = """
综合以下多个 Local Search 的结果，生成一个完整、一致的回答。

Local Search 结果：
{search_results}

原始查询：{original_query}

回答：
"""
```

### 4.4 混合检索

**RRF（Reciprocal Rank Fusion）公式**：

```
RRF(k) = Σ_{d ∈ results} 1 / (k + rank(d))

其中：
- k 是偏移常数（通常取 60）
- rank(d) 是文档 d 在某个检索器中的排名
- 对每个检索器（向量、图谱、BM25）分别计算排名，然后求和
```

```python
def rrf_fusion(candidate_sets: dict[str, list], k: int = 60) -> list:
    """
    RRF 融合多个检索器的结果

    参数:
        candidate_sets: {retriever_name: [doc_id, doc_id, ...]}
        k: 偏移常数

    返回:
        [(doc_id, rrf_score), ...] 按分数降序
    """
    score_map = defaultdict(float)
    for retriever, candidates in candidate_sets.items():
        for rank, doc_id in enumerate(candidates, 1):
            score_map[doc_id] += 1.0 / (k + rank)

    # 按分数降序排序
    return sorted(score_map.items(), key=lambda x: -x[1])
```

---

## 五、图感知生成

### 5.1 图谱上下文注入

**Prompt 构造模板**：

```python
PROMPT_GRAPH_AWARE = """
你是一个专业助手。请基于以下信息回答问题。

【图谱信息】
实体-关系三元组：
{triplets}

社区摘要（相关社区）：
{community_summaries}

【向量检索结果】
{vector_results}

【原始文档片段（引用）】
{doc_fragments}

【用户查询】
{query}

要求：
- 必须基于上述信息回答，不要编造事实
- 引用来源用 [doc_X] 标记
- 如果信息不足，明确说明
"""
```

**上下文窗口 Token 预算分配**：

| 组件 | Token 预算占比 | 说明 |
|------|------|------|
| 图谱三元组 | ~30-40% | 最重要的结构信息 |
| 社区摘要 | ~20-30% | 高层语义 |
| 向量检索结果 | ~20-30% | 语义近似 |
| 原始文档片段 | ~10-20% | 引用来源 |
| 指令 | ~5-10% | 系统指令 |

### 5.2 引用与溯源

**引用标记系统**：

```python
# 生成时给每个信息片段加上引用标记
triple_with_ref = [
    {
        "subject": "Microsoft",
        "relation": "acquired",
        "object": "Activision Blizzard",
        "ref_doc": ["doc_12", "doc_34"],
        "confidence": 0.95
    },
    ...
]

# LLM 回答中可以这样引用：
# "微软在 2023 年收购了 Activision Blizzard [doc_12, doc_34]。"
```

### 5.3 减少幻觉的策略

| 策略 | 方法 | 效果 |
|------|------|------|
| **图谱约束** | Prompt 中明确列出图谱中的实体和关系，强制 LLM 引用 | 减少自由发挥 |
| **事实核查** | 生成后检查答案中的每个事实是否在图谱中存在 | 检测幻觉 |
| **多源验证** | 要求 LLM 在多个邻居节点交叉验证 | 提高可靠性 |
| **置信度阈值** | 生成置信度低于阈值的回答标记为"不确定" | 防止过度自信 |
| **社区摘要验证** | 全局回答必须与社区摘要一致 | 保证全局一致性 |

---

## 六、微软 GraphRAG 索引流水线

### 6.1 详细流水线

```
原始文档
    │
    ▼
┌──────────────────┐
│  文本分块 (Chunk) │  → chunk_size=1000, overlap=200
└──────┬───────────┘
       │ 按文档顺序处理
       ▼
┌──────────────────┐
│  实体抽取 (LLM)   │  → LLM: gpt-4o-mini, temperature=0.1
│  (每个 Chunk 1次) │  → 输出: [{entity, type}]
└──────┬───────────┘
       │ 按文档顺序处理
       ▼
┌──────────────────┐
│  关系抽取 (LLM)   │  → LLM: gpt-4o-mini, temperature=0.1
│  (每个 Chunk 1次) │  → 输出: [{subject, relation, object}]
└──────┬───────────┘
       │ 按文档顺序处理
       ▼
┌──────────────────┐
│  实体消歧/合并     │  → 基于嵌入聚类（DBSCAN）
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  构建知识图谱      │  → 节点属性 + 边属性 → Neo4j
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Leiden 社区检测   │  → resolution=0.8, max_iterations=100
│  (无需 LLM)        │  → 输出: 层次化社区树
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  社区摘要生成 (LLM)│  → 每个社区 1 次 LLM 调用
│  (Level 0/1/2+ 各) │  → 输出: 社区语义摘要
└──────────────────┘
```

### 6.2 LLM 调用成本估算

| 步骤 | 文档数 | Chunk 数 | 每 Chunk LLM 调用 | 总 LLM 调用 |
|------|------|------|---------|------|
| 实体抽取 | 1000 | 10000 | 1 | 10,000 |
| 关系抽取 | 1000 | 10000 | 1 | 10,000 |
| 社区摘要 | — | — | 社区数 | ~100-500 |
| **总计** | 1000 | 10000 | — | **~20,500** |

**成本对比**（GPT-4o-mini）：

| 组件 | Token 输入 | Token 输出 | 成本（GPT-4o-mini） |
|------|------|------|---------|
| 实体抽取 | 10000 × 500 = 5M | 10000 × 100 = 1M | $0.75 + $0.60 = $1.35 |
| 关系抽取 | 10000 × 500 = 5M | 10000 × 100 = 1M | $0.75 + $0.60 = $1.35 |
| 社区摘要 | 500 × 2000 = 1M | 500 × 200 = 100K | $0.15 + $0.06 = $0.21 |
| **总成本** | | | **≈ $2.91** |

**成本优化策略**：
1. **模型降级**：实体/关系抽取可用 GPT-4o-mini（$0.15/M）而非 GPT-4o（$15/M）
2. **批量调用**：将多个 chunk 的抽取合并为一次批量调用
3. **缓存**：相同文本的抽取结果缓存
4. **分层处理**：高价值文档用高质量模型，低价值文档用低成本模型

---

## 七、GraphRAG vs LazyGraphRAG 性能权衡

| 指标 | 传统 GraphRAG | LazyGraphRAG |
|------|----------|---------|
| 索引成本 | 高（LLM 全量：10,000+ 调用） | 降低 99.9%，≈ 向量 RAG |
| 查询成本 | 高（社区摘要 Map-Reduce） | 全局搜索降低 700x+ |
| 工程可行性 | ⭐⭐（复杂） | ⭐⭐⭐⭐⭐（简单） |
| 存储成本 | 高（全图谱 + 社区摘要） | 低（仅子图） |
| 更新成本 | 高（全量重建） | 低（增量更新） |

> LazyGraphRAG 详见 [lazygraphrag.md](lazygraphrag.md)。

---

## 八、适用场景与决策树

```
需要知识图谱增强？
    │
    ├─ 需要跨文档关联/多跳推理
    │   ├─ 文档规模小（<1000）、成本充裕
    │   │   └──► GraphRAG（微软）
    │   ├─ 文档规模大、需控制成本
    │   │   └──► LazyGraphRAG
    │   └──► 图数据库：Neo4j / FalkorDB
    │
    ├─ 需要全局洞察/汇总类问题
    │   └──► GraphRAG Global Search
    │
    ├─ 查询模式简单、图谱需求低
    │   └──► 普通 Hybrid RAG
    │
    └─ 不确定
        └──► 先用 Hybrid RAG 打底
            └──► 根据查询复杂度逐步引入 GraphRAG
```

---

> **进阶进阶**：[LazyGraphRAG（按需图谱 RAG）](lazygraphrag.md)
