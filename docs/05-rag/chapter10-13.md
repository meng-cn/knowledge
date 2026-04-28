# 第 10 章 评估体系与指标

## 10.1 检索评估指标

### 10.1.1 多模态检索指标定义

在 Multimodal RAG 中，检索评估的核心挑战在于**跨模态匹配度**的量化。传统文本检索指标需要扩展为多模态版本。

#### Recall@k 的多模态定义

Recall@k 衡量在 top-k 检索结果中，是否包含所有相关文档块：

$$\text{Recall@k} = \frac{|\text{Retrieved}_k \cap \text{Relevant}|}{|\text{Relevant}|}$$

在跨模态场景中，"相关"的定义需要扩展：

- **同模态匹配**：图像查询检索到图像块，文本查询检索到文本块
- **跨模态匹配**：图像查询检索到包含该图像的文本描述块，文本查询检索到语义关联的图像块
- **部分匹配**：检索到的块包含查询部分相关的元素（如文本块中包含查询图像的 alt_text 字段）

```python
import numpy as np
from typing import List, Set, Tuple

class MultimodalRecall:
    """多模态 Recall@k 计算"""
    
    def __init__(self, k: int = 5):
        self.k = k
    
    def compute(self, 
                query: dict,           # {"modality": "image", "data": image_tensor}
                retrieved_chunks: List[dict],  # [{"modality": "image", "sim": float}, ...]
                relevant_chunks: Set[int]) -> float:
        """
        query: 查询的模态和内容
        retrieved_chunks: 检索结果列表，包含模态和相似度
        relevant_chunks: 相关 chunk 的索引集合
        
        Returns: Recall@k 值
        """
        # 跨模态相关性判定
        hit_count = 0
        for i, chunk in enumerate(retrieved_chunks[:self.k]):
            if i in relevant_chunks:
                hit_count += 1
                continue
            # 跨模态相关性检查
            if self._is_cross_modal_relevant(chunk, query):
                hit_count += 1
        
        # 所有相关 chunk 的数量（可能是跨模态的）
        total_relevant = len(relevant_chunks)
        if total_relevant == 0:
            # 跨模态: 查询模态的 ground truth
            total_relevant = self._count_cross_modal_relevant(query)
        
        return hit_count / max(total_relevant, 1)
    
    def _is_cross_modal_relevant(self, chunk: dict, query: dict) -> bool:
        """判断跨模态相关性"""
        if chunk["modality"] == query["modality"]:
            return True
        # 跨模态: 检查 semantic_link 或 bbox alignment
        if "semantic_link" in chunk.get("metadata", {}):
            if "semantic_link" in query.get("metadata", {}):
                return chunk["metadata"]["semantic_link"] == query["metadata"]["semantic_link"]
        if "bbox_aligned" in chunk.get("metadata", {}):
            return chunk["metadata"]["bbox_aligned"]
        return False
```

#### Precision@k 的多模态定义

$$\text{Precision@k} = \frac{|\text{Retrieved}_k \cap \text{Relevant}|}{k}$$

在跨模态场景中，Precision@k 的"命中"判定需要区分：
- **精确命中**：检索到完全相关的 chunk（同模态或跨模态 semantic link）
- **部分命中**：检索到包含相关元素的 chunk（如包含相关文本描述的图像块）

#### MRR (Mean Reciprocal Rank)

$$\text{MRR} = \frac{1}{|Q|} \sum_{q \in Q} \frac{1}{\text{rank}_q}$$

多模态 MRR 的关键在于：**跨模态查询的 rank 计算需要考虑语义等价类**。

例如：查询一张 "会议室投影仪" 的截图，检索结果中：
- rank 1: 投影仪产品图 → 完全相关 (rank=1, 1/1=1.0)
- rank 3: 投影仪安装文档 → 跨模态相关 (rank=3, 1/3=0.333)
- rank 5: 会议室照片 → 部分相关 (需加权)

```python
class MultimodalMRR:
    """多模态 MRR 计算"""
    
    @staticmethod
    def compute(query: dict, retrieved: List[dict], 
                gt_chunk_ids: List[int],
                threshold: float = 0.85) -> float:
        """
        query: 查询 {"modality": "image", "content": image}
        retrieved: 检索结果 [{"id": str, "modality": str, "score": float}, ...]
        gt_chunk_ids: ground truth chunk IDs
        threshold: 跨模态相关的最低相似度阈值
        
        Returns: MRR 值
        """
        # 构建 ground truth 索引
        gt_set = set(gt_chunk_ids)
        
        # 查找最高排名
        for rank, chunk in enumerate(retrieved, 1):
            chunk_id = chunk["id"]
            if chunk_id in gt_set:
                return 1.0 / rank
            # 跨模态匹配
            if MultimodalMRR._is_cross_modal_hit(chunk, query, threshold):
                return 1.0 / rank
        
        return 0.0
    
    @staticmethod
    def _is_cross_modal_hit(chunk: dict, query: dict, threshold: float) -> bool:
        if chunk.get("modality") == query.get("modality"):
            return chunk.get("score", 0) >= threshold
        # 跨模态语义链接
        return chunk.get("semantic_overlap", 0) >= threshold
```

#### NDCG@k 的多模态定义

$$\text{NDCG@k} = \frac{\text{DCG@k}}{\text{IDCG@k}}$$

其中 DCG（Discounted Cumulative Gain）在多模态场景下需要引入**跨模态增益**：

```python
def multilingual_ndcg_at_k(query: dict, 
                            retrieved: List[dict], 
                            relevance_map: dict,  # chunk_id -> relevance_score
                            k: int = 5) -> float:
    """
    多模态 NDCG@k 计算
    relevance_score: 0=不相关, 1=部分相关, 2=跨模态相关, 3=完全相关
    """
    # 计算 DCG
    dcg = 0.0
    for i, chunk in enumerate(retrieved[:k]):
        cid = chunk["id"]
        # 获取相关性评分（可能为跨模态评分）
        rel = relevance_map.get(cid, 0)
        # 对数折扣: log2(rel+1) / log2(i+1)
        dcg += (2 ** rel - 1) / np.log2(i + 2)
    
    # 计算理想 DCG（按相关性降序排列）
    all_rels = sorted(relevance_map.values(), reverse=True)[:k]
    idcg = sum((2 ** r - 1) / np.log2(i + 2) for i, r in enumerate(all_rels))
    
    return dcg / idcg if idcg > 0 else 0.0
```

### 10.1.2 跨模态检索的特殊性

| 维度 | 纯文本检索 | 跨模态检索 | 特殊性说明 |
|------|-----------|-----------|-----------|
| 相似度空间 | 单一嵌入空间 | 多嵌入空间 | 需对齐 CLIP/CLIP-like 空间 |
| 相关性判定 | 文本相似度 | 跨模态语义映射 | 需要跨模态匹配规则 |
| 噪声容忍度 | 同义词可容忍 | 模态间噪声大 | 图像→文本噪声远高于文本→文本 |
| 零样本迁移 | 有限 | 依赖预训练对齐质量 | 取决于 CLIP/BLIP/ALIGN 等模型的对齐能力 |
| 评估集构建 | 容易 | 困难 | 需要跨模态标注（图像-文本对） |

**关键挑战 1：嵌入空间不一致**

不同模态的嵌入向量来自不同的模型分支，需要在**联合嵌入空间**中计算相似度。以 CLIP 为例：

```python
# CLIP 联合嵌入空间示例
import torch
import clip

model, preprocess = clip.load("ViT-L/14@336px")

# 文本嵌入
text_inputs = clip.tokenize(["一张会议室的投影仪照片", "汽车前脸特写"])
text_features = model.encode_text(text_inputs)  # [2, 768]

# 图像嵌入
image1 = preprocess(Image.open("projector.jpg")).unsqueeze(0)
image2 = preprocess(Image.open("car.jpg")).unsqueeze(0)
image_features = model.encode_image(image1)      # [1, 768]

# 跨模态相似度矩阵（768 维空间的点积归一化）
similarity = torch.matmul(image_features, text_features.T)
# sim(image1, text1) ≈ 0.78  # 高相关
# sim(image1, text2) ≈ 0.32  # 低相关

# 归一化
similarity /= 0.1  # temperature
probs = torch.softmax(similarity, dim=-1)
```

**关键挑战 2：跨模态 Chunk 关联**

在 Multimodal RAG 中，一个文档块可能同时包含图像和文本，检索时需要明确：

```
文档块类型                    嵌入策略                           检索时的匹配方式
───────────────────────────────────────────────────────────────────────────────
纯文本块                     Text2Vec 文本嵌入                   文本↔文本 直接匹配
纯图像块                     CLIP Image2Vec 图像嵌入               图像↔图像 / 文本↔图像 (跨模态)
图文混合块（图像+alt_text）  联合嵌入 (image_embed + text_embed)   文本↔图文块（加权融合）
表格块                      Table2Vec 表格结构化嵌入               查询关键词↔表格列名匹配
图表块 (PNG/SVG)            ChartBERT/ChartQA 图表语义嵌入            查询↔图表语义标签
```

---

## 10.2 生成评估指标

### 10.2.1 内容相关性评估

多模态 RAG 的生成输出可能是**纯文本、多模态混合（文本+图像+表格）、结构化 JSON**，需要分别评估：

```python
from typing import Union, Dict, Any

class GenerationEvaluator:
    """多模态生成评估"""
    
    def __init__(self, llm_evaluator: str = "gpt-4o"):
        self.llm_evaluator = llm_evaluator
        # 多维度评分权重
        self.weights = {
            "relevance": 0.35,      # 内容相关性
            "factual_acc": 0.30,    # 事实准确性
            "multimodal_quality": 0.20, # 多模态输出质量
            "format_fidelity": 0.15,  # 格式保真度
        }
    
    def evaluate(self, 
                 query: str,
                 context: Dict[str, Any],  # 检索到的多模态上下文
                 response: Dict[str, Any], # 生成响应
                 ground_truth: str = None) -> Dict[str, float]:
        """
        context: {"text_chunks": [...], "images": [...], "tables": [...]}
        response: {"text": "...", "referenced_images": [urls], "referenced_tables": [...]}
        """
        scores = {}
        
        # 1. 内容相关性 (Relevance)
        scores["relevance"] = self._eval_relevance(query, response)
        
        # 2. 事实准确性 (Factual Accuracy)
        scores["factual_acc"] = self._eval_factual_accuracy(context, response, ground_truth)
        
        # 3. 多模态输出质量 (Multimodal Quality)
        scores["multimodal_quality"] = self._eval_multimodal_quality(response)
        
        # 4. 格式保真度 (Format Fidelity)
        scores["format_fidelity"] = self._eval_format_fidelity(context, response)
        
        # 加权总分
        scores["overall"] = sum(scores[k] * self.weights[k] for k in self.weights)
        scores["weights"] = self.weights
        
        return scores
    
    def _eval_relevance(self, query: str, response: dict) -> float:
        """评估响应与查询的相关性（0-1 分）"""
        # 基于 LLM-as-Judge
        prompt = f"""
评估以下 RAG 系统回答与查询的相关性（0-1 分）：

查询: {query}
回答: {response.get('text', '')}
引用的多模态资源: {response.get('referenced_images', [])}

评估标准:
- 1.0: 直接且完整地回答了查询
- 0.8: 基本相关但有遗漏
- 0.5: 部分相关
- 0.0: 不相关

只返回 0-1 之间的浮点数。
"""
        return self._llm_score(prompt)
    
    def _eval_factual_accuracy(self, context: dict, response: dict, gt: str = None) -> float:
        """
        事实准确性评估：对比生成的内容与检索上下文的一致性
        使用 claim-based 验证方法
        """
        # 从响应中提取事实声明（Claims）
        claims = self._extract_claims(response.get("text", ""))
        
        # 每个 claim 在上下文中是否有证据
        verified_count = 0
        total_claims = len(claims)
        
        for claim in claims:
            has_evidence = self._check_evidence_in_context(claim, context)
            if has_evidence:
                verified_count += 1
        
        return verified_count / max(total_claims, 1)
    
    def _eval_multimodal_quality(self, response: dict) -> float:
        """
        多模态输出质量评估:
        - 引用的图像是否与文本描述一致
        - 表格数据是否正确呈现
        - 图像分辨率/质量
        """
        score = 1.0
        
        # 检查引用的图像是否合理
        if "referenced_images" in response and response["referenced_images"]:
            # 检查图像URL是否可访问
            for img_url in response["referenced_images"]:
                if not self._is_image_accessible(img_url):
                    score -= 0.2
        
        # 检查表格数据格式
        if "tables" in response:
            for table in response["tables"]:
                if not self._validate_table_format(table):
                    score -= 0.1
        
        return max(score, 0.0)
    
    def _eval_format_fidelity(self, context: dict, response: dict) -> float:
        """
        格式保真度：多模态 chunk 的格式信息是否被忠实还原
        例如：表格的行列关系、图表的标注、图片的 alt 文本
        """
        score = 1.0
        fidelity_checks = 0
        passed_checks = 0
        
        # 检查表格格式
        if "tables" in context:
            for ctx_table in context["tables"]:
                if ctx_table.get("rows") and "tables" in response:
                    for resp_table in response["tables"]:
                        if resp_table.get("rows"):
                            fidelity_checks += 1
                            if len(resp_table["rows"]) == len(ctx_table["rows"]):
                                passed_checks += 1
        
        return passed_checks / max(fidelity_checks, 1)
```

### 10.2.2 表格还原准确率

表格还原是 Multimodal RAG 中最棘手的生成任务之一。评估指标包括：

| 指标 | 定义 | 计算公式 |
|------|------|---------|
| Cell-Level Accuracy (CLA) | 每个单元格内容的准确率 | $|\{c_{i,j} : \hat{c}_{i,j} = c_{i,j}\}| / (m \times n)$ |
| Structure Accuracy (SA) | 行列结构完全匹配的表格比例 | $\mathbb{I}(\text{shape}(\hat{T}) = \text{shape}(T))$ |
| Row/Col Alignment (RCA) | 行/列内容匹配比例 | $\frac{1}{2}(\text{row\_match} + \text{col\_match})$ |
| Merge-Cell Accuracy (MCA) | 合并单元格识别准确率 | $|\text{correct\_merged}| / |\text{total\_merged}|$ |

```python
def evaluate_table_reconstruction(original: pd.DataFrame, 
                                   reconstructed: pd.DataFrame) -> Dict[str, float]:
    """评估表格还原质量"""
    metrics = {}
    
    # Cell-Level Accuracy
    if original.shape == reconstructed.shape:
        cell_match = (original.fillna("") == reconstructed.fillna("")).to_numpy().mean()
        metrics["cell_accuracy"] = cell_match
    else:
        metrics["cell_accuracy"] = 0.0
    
    # Structure Accuracy
    metrics["structure_accuracy"] = float(original.shape == reconstructed.shape)
    
    # Row/Column alignment
    orig_headers = [str(c) for c in original.columns]
    recon_headers = [str(c) for c in reconstructed.columns]
    
    row_match = sum(1 for i, row in enumerate(original.itertuples(index=False)) 
                    if i < len(reconstructed) and 
                    all(str(a) == str(b) for a, b in zip(row, reconstructed.iloc[i])))
    metrics["row_alignment"] = row_match / max(len(original), 1)
    
    col_match = sum(1 for j, (oh, rh) in enumerate(zip(orig_headers, recon_headers))
                    if oh == rh)
    metrics["col_alignment"] = col_match / max(len(orig_headers), 1)
    
    metrics["rca"] = 0.5 * (metrics["row_alignment"] + metrics["col_alignment"])
    
    return metrics
```

### 10.2.3 图表还原评估

图表（chart/diagram）的还原比表格更复杂，因为包含视觉语义：

```python
def evaluate_chart_reconstruction(original_img: np.ndarray,
                                   generated_chart: dict) -> dict:
    """
    评估图表还原质量
    original_img: 原始图表图像
    generated_chart: 生成的结构化图表表示
    """
    # 1. 图表类型识别准确率
    true_type = detect_chart_type(original_img)  # "bar"/"pie"/"line"/"scatter"
    pred_type = generated_chart.get("type")
    type_accuracy = 1.0 if true_type == pred_type else 0.0
    
    # 2. 数据点还原误差
    true_data = extract_data_points(original_img)  # [(x1,y1), (x2,y2), ...]
    pred_data = generated_chart.get("data_points", [])
    data_error = compute_data_error(true_data, pred_data)
    
    # 3. 标注/标签还原
    true_labels = extract_labels(original_img)
    pred_labels = generated_chart.get("labels", [])
    label_accuracy = compute_label_match(true_labels, pred_labels)
    
    # 4. 色彩还原度
    true_colors = extract_colors(original_img)
    pred_colors = generated_chart.get("colors", [])
    color_fidelity = compute_color_similarity(true_colors, pred_colors)
    
    return {
        "type_accuracy": type_accuracy,
        "data_rmse": data_error,
        "label_accuracy": label_accuracy,
        "color_fidelity": color_fidelity,
        "overall": 0.3 * type_accuracy + 0.3 * (1 - data_error) + 
                   0.2 * label_accuracy + 0.2 * color_fidelity
    }
```

---

## 10.3 端到端评估体系

### 10.3.1 评估架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                    端到端 Multimodal RAG 评估体系                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  测试数据集   │  │  评估引擎     │  │  结果聚合    │             │
│  │              │  │              │  │              │             │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │             │
│  │ │ MLVR     │ │  │ │ 检索评估  │ │  │ │ 指标聚合  │ │             │
│  │ │ MME      │ │──→│ 引擎      │──→│ 引擎       │──→│ 报告生成   │ │             │
│  │ │ SEED-B   │ │  │ │          │ │  │ │          │  │              │ │             │
│  │ │ MMMU     │ │  │ │          │ │  │ │          │ │             │
│  │ │ Custom   │ │  │ └──────────┘ │  │ └──────────┘ │             │
│  │ │ Benchmark│ │  │ ┌──────────┐ │  │              │             │
│  │ └──────────┘ │  │ │ 生成评估  │ │  │              │             │
│  │              │  │ │ 引擎      │ │  │              │             │
│  │              │  │ │          │ │  │              │             │
│  └──────────────┘  │ │          │ │  │              │             │
│                    │ │          │ │  │              │             │
│                    │ └──────────┘ │  │              │             │
│                    │ ┌──────────┐ │  │              │             │
│                    │ │ 幻觉检测  │ │  │              │             │
│                    │ │ 引擎      │ │  │              │             │
│                    │ └──────────┘ │  │              │             │
│                    └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │                    延迟 & 成本监控                     │          │
│  │  端到端延迟分解 → 各组件耗时 → P50/P95/P99          │          │
│  │  Token 消耗统计 → 嵌入成本 + LLM 成本 + OCR 成本     │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.3.2 基准测试套件

#### MLVR (Multilingual Multimodal Visual Retrieval)

| 维度 | 说明 |
|------|------|
| 语言覆盖 | 中/英/日/韩/法 5 种语言 |
| 模态 | 图像→文本 / 文本→图像 双向检索 |
| 评测规模 | 10,000+ 图文对 |
| 评估指标 | Recall@1/5/10, MRR, NDCG@5 |
| 关键特性 | 跨语言检索、细粒度区域定位 |

#### MME (Multimodal Evaluation)

| 维度 | 说明 |
|------|------|
| 评测维度 | 感知评估（21 项）+ 认知评估（15 项） |
| 模态 | 图像、图像+文本 |
| 评测类型 | 分类、OCR、计数、存在检测、文本翻译、文本识别、实例关系、代码理解、数学推理、科学推理、常识推理、工具使用 |
| 评分方式 | 每维度 0-100 分，总分 4000 |
| 关键特性 | 区分感知能力 vs 认知能力 |

#### SEED-Bench

| 维度 | 说明 |
|------|------|
| 评测维度 | 图像理解（4 项）+ 视频理解（1 项）+ 多图推理（1 项） |
| 图像理解 | 图像分类、OCR、视觉定位、视觉推理 |
| 评测规模 | 11 个数据集，28,430 样本 |
| 关键特性 | 区分 4 个推理级别（识别→分析→推理→探索） |

#### MMMU (Multi-discipline Multi-task Multimodal Understanding)

| 维度 | 说明 |
|------|------|
| 学科覆盖 | 30 个学科（STEM/Humanities/Social Sciences 等） |
| 题型 | 选择题 + 开放式问题 |
| 模态 | 图像 + 文本 |
| 评测规模 | 1,230 题（测试集 622 题） |
| 关键特性 | 真实大学考试题目，区分知识检索 vs 推理 |

#### 自建评测基准（针对 Multimodal RAG 场景）

```python
# 自建 Multimodal RAG 评测基准
import json
from dataclasses import dataclass
from typing import List

@dataclass
class MultimodalRAGEvalSample:
    """Multimodal RAG 评测样本"""
    sample_id: str
    query: str                           # 用户查询（可能是纯文本或含图片）
    query_modality: str                  # "text" / "image" / "mixed"
    expected_chunks: List[str]           # 期望检索到的 chunk IDs
    expected_answer: str                 # 期望答案
    ground_truth_images: List[str] = None # 期望引用的图像
    ground_truth_tables: List[str] = None # 期望引用的表格
    difficulty: str = "easy"             # "easy"/"medium"/"hard"
    domain: str = "general"              # 领域标签
    eval_aspects: List[str] = None       # 评估维度
    
    def to_dict(self):
        return {
            "sample_id": self.sample_id,
            "query": self.query,
            "query_modality": self.query_modality,
            "expected_chunks": self.expected_chunks,
            "expected_answer": self.expected_answer,
            "ground_truth_images": self.ground_truth_images or [],
            "ground_truth_tables": self.ground_truth_tables or [],
            "difficulty": self.difficulty,
            "domain": self.domain,
            "eval_aspects": self.eval_aspects or [
                "retrieval_recall", "retrieval_precision",
                "generation_relevance", "factual_accuracy",
                "multimodal_quality", "format_fidelity"
            ]
        }

class MultimodalRAGEvaluator:
    """Multimodal RAG 端到端评估器"""
    
    def __init__(self, benchmark_path: str):
        self.samples = self._load_benchmark(benchmark_path)
    
    def _load_benchmark(self, path: str) -> List[MultimodalRAGEvalSample]:
        """加载评测集"""
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [MultimodalRAGEvalSample(**item) for item in data]
    
    def run_evaluation(self, rag_system, output_path: str):
        """执行端到端评测"""
        results = []
        
        for sample in self.samples:
            # 1. 检索阶段评估
            retrieved = rag_system.retrieve(sample.query, k=5)
            retrieval_scores = self._eval_retrieval(sample, retrieved)
            
            # 2. 生成阶段评估
            response = rag_system.generate(sample.query, retrieved)
            generation_scores = self._eval_generation(sample, response)
            
            # 3. 幻觉检测
            hallucination_scores = self._detect_hallucination(sample, response, retrieved)
            
            # 4. 延迟和成本
            latency_metrics = rag_system.get_latency_metrics()
            cost_metrics = rag_system.get_cost_metrics()
            
            results.append({
                "sample_id": sample.sample_id,
                "difficulty": sample.difficulty,
                "domain": sample.domain,
                "retrieval": retrieval_scores,
                "generation": generation_scores,
                "hallucination": hallucination_scores,
                "latency": latency_metrics,
                "cost": cost_metrics,
            })
        
        # 聚合结果
        summary = self._aggregate_results(results)
        
        # 保存结果
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump({"samples": results, "summary": summary}, f, ensure_ascii=False, indent=2)
        
        return summary
    
    def _eval_retrieval(self, sample: MultimodalRAGEvalSample, 
                        retrieved: list) -> dict:
        """检索阶段评估"""
        gt_ids = set(sample.expected_chunks)
        ret_ids = set(r["id"] for r in retrieved[:5])
        
        hits = gt_ids & ret_ids
        return {
            "recall@5": len(hits) / max(len(gt_ids), 1),
            "precision@5": len(hits) / 5,
            "mrr": 1.0 / (next(i for i, r in enumerate(retrieved) if r["id"] in gt_ids) + 1) 
                    if any(r["id"] in gt_ids for r in retrieved) else 0.0,
            "ndcg@5": self._compute_ndcg(retrieved, gt_ids),
        }
    
    def _eval_generation(self, sample: MultimodalRAGEvalSample,
                         response: dict) -> dict:
        """生成阶段评估"""
        # 使用 LLM-as-Judge + 规则评估
        return {
            "relevance": self._eval_relevance(sample, response),
            "factual_accuracy": self._eval_factual_accuracy(sample, response),
            "multimodal_quality": self._eval_multimodal_quality(sample, response),
            "format_fidelity": self._eval_format_fidelity(sample, response),
        }
    
    def _detect_hallucination(self, sample: MultimodalRAGEvalSample,
                               response: dict, retrieved: list) -> dict:
        """幻觉检测"""
        claims = self._extract_claims(response.get("text", ""))
        hallucinated = []
        
        for claim in claims:
            # 在检索上下文中查找证据
            has_evidence = any(self._find_evidence(claim, chunk) for chunk in retrieved)
            if not has_evidence:
                # 进一步验证：在 ground truth 中查找
                if not self._find_evidence(claim, sample.expected_answer):
                    hallucinated.append(claim)
        
        return {
            "hallucination_rate": len(hallucinated) / max(len(claims), 1),
            "hallucinated_claims": hallucinated,
            "hallucination_types": self._classify_hallucination_types(hallucinated),
        }
    
    def _aggregate_results(self, results: list) -> dict:
        """聚合所有评测结果"""
        # 按难度分组的指标
        by_difficulty = {}
        by_domain = {}
        
        for r in results:
            diff = r["difficulty"]
            if diff not in by_difficulty:
                by_difficulty[diff] = []
            by_difficulty[diff].append(r)
            
            domain = r["domain"]
            if domain not by_domain:
                by_domain[domain] = []
            by_domain[domain].append(r)
        
        return {
            "total_samples": len(results),
            "overall": {
                "retrieval_recall@5": np.mean([r["retrieval"]["recall@5"] for r in results]),
                "retrieval_precision@5": np.mean([r["retrieval"]["precision@5"] for r in results]),
                "retrieval_mrr": np.mean([r["retrieval"]["mrr"] for r in results]),
                "generation_relevance": np.mean([r["generation"]["relevance"] for r in results]),
                "factual_accuracy": np.mean([r["generation"]["factual_accuracy"] for r in results]),
                "hallucination_rate": np.mean([r["hallucination"]["hallucination_rate"] for r in results]),
                "avg_latency_ms": np.mean([r["latency"]["total_ms"] for r in results]),
                "avg_cost_usd": np.mean([r["cost"]["total_usd"] for r in results]),
            },
            "by_difficulty": {k: self._aggregate_group(v) for k, v in by_difficulty.items()},
            "by_domain": {k: self._aggregate_group(v) for k, v in by_domain.items()},
        }
    
    def _aggregate_group(self, group_results: list) -> dict:
        """聚合一组结果"""
        return {
            "recall@5": np.mean([r["retrieval"]["recall@5"] for r in group_results]),
            "precision@5": np.mean([r["retrieval"]["precision@5"] for r in group_results]),
            "hallucination_rate": np.mean([r["hallucination"]["hallucination_rate"] for r in group_results]),
            "avg_latency_ms": np.mean([r["latency"]["total_ms"] for r in group_results]),
        }
```

---

## 10.4 幻觉检测与抑制评估

### 10.4.1 多模态幻觉分类

多模态 RAG 中的幻觉比纯文本 RAG 更复杂，因为幻觉可以出现在多个层面：

```
多模态幻觉分类体系
├── 文本幻觉（与纯文本 RAG 相同）
│   ├── 事实性幻觉：生成与事实不符的内容
│   ├── 逻辑性幻觉：推理链条断裂
│   └── 上下文幻觉：捏造不存在的上下文信息
│
├── 视觉幻觉（多模态特有）
│   ├── 视觉感知幻觉：误识别图像内容
│   │   ├── 对象误认：猫→狗
│   │   ├── 属性误认：红色→蓝色
│   │   └── 数量误认：3 个→5 个
│   ├── 空间关系幻觉：错误描述对象间空间关系
│   └── 时序幻觉（视频）：错误描述事件顺序
│
├── OCR 幻觉（图像→文本 特有）
│   ├── 字符级幻觉：;→:, 0→O, 1→l
│   ├── 结构级幻觉：表格行列错位
│   ├── 符号级幻觉：±→+, →→=
│   └── 布局级幻觉：标题/正文/脚注混淆
│
└── 跨模态幻觉（多模态特有）
    ├── 引用幻觉：引用不存在的图像/表格
    ├── 对齐幻觉：图像与文本描述不匹配
    └── 模态偏好幻觉：过度依赖某一模态而忽略另一模态
```

### 10.4.2 OCR 幻觉检测

OCR 幻觉是 Multimodal RAG 中最隐蔽也最严重的幻觉类型之一。以下是常见模式：

#### OCR 幻觉常见模式

| 模式类别 | 示例 | 频率 | 影响 |
|---------|------|------|------|
| **; vs : 混淆** | `2025; Q3 营收` → `2025: Q3 营收` | 高 | 改变时间语义 |
| **空格丢失** | `Total 1, 234` → `Total 1,234` | 极高 | 改变数值含义 |
| **符号误认** | `±5%` → `+5%`, `≥100` → `>100` | 高 | 改变约束条件 |
| **字符形状混淆** | `0/O`, `1/l/I`, `5/S`, `8/B` | 高 | 数据错误 |
| **公式误认** | $\sum_{i=1}^{n}$ → `sin(i=1:n)` | 中 | 公式不可还原 |
| **上标/下标丢失** | `H₂O` → `H2O`, `x²` → `x2` | 高 | 科学含义改变 |
| **合并单元格误识别** | 跨行合并→拆分为多行 | 高 | 表格结构破坏 |
| **脚注/页码混入正文** | `*参见附录 A` 混入正文 | 中 | 上下文污染 |
| **水印/噪声文字** | 图片水印被识别为内容 | 低 | 噪声引入 |

#### OCR 幻觉检测算法

```python
import re
from typing import List, Tuple

class OCRHallucinationDetector:
    """OCR 幻觉检测器"""
    
    # OCR 幻觉模式定义
    PATTERN_HALLUCINATIONS = {
        # ; vs : 混淆
        "semicolon_colon_mismatch": {
            "pattern": re.compile(r'[0-9]+[\s]*;', re.IGNORECASE),
            "description": "数字后的分号可能应为冒号（时间/版本格式）",
            "severity": "HIGH",
            "correction": lambda m: m.group().replace(';', ':')
        },
        
        # 空格丢失导致数值错误
        "space_loss_in_numbers": {
            "pattern": re.compile(r'[0-9]+[, ]+[0-9]+'),
            "description": "逗号或空格分隔的数值可能因空格丢失被合并",
            "severity": "CRITICAL",
            "examples": ["'1, 234' → '1,234'", "'1 234' → '1234'"]
        },
        
        # 符号误认
        "symbol_misrecognition": {
            "pattern": re.compile(r'[\u00B1\u2265\u2264\u2192]|\b(plu|minus|equals)\b', re.IGNORECASE),
            "description": "特殊符号可能被误识别为 ASCII 字符",
            "severity": "HIGH"
        },
        
        # 数字与字母形状混淆
        "digit_letter_confusion": {
            "pattern": re.compile(r'(?<![a-zA-Z])(0|1|l|I|8|B)(?![a-zA-Z])'),
            "description": "数字与字母的形状混淆",
            "severity": "MEDIUM",
            "corrections": {"0": ["O", "o"], "1": ["l", "I"], "8": ["B", "b"]}
        },
        
        # 上标/下标丢失
        "superscript_subscript_loss": {
            "pattern": re.compile(r'[A-Z][a-z]?[0-9]+$|[0-9]+(?:st|nd|rd|th)\b', re.IGNORECASE),
            "description": "上标/下标可能被识别为普通文本",
            "severity": "MEDIUM"
        },
        
        # 合并单元格拆分行
        "merged_cell_split": {
            "pattern": re.compile(r'^\s*[-=]{3,}\s*$', re.MULTILINE),
            "description": "表格分隔线可能表示合并单元格边界",
            "severity": "HIGH"
        },
        
        # 脚注混入正文
        "footnote_mixed_in_text": {
            "pattern": re.compile(r'^\*\s+', re.MULTILINE),
            "description": "行首 * 可能表示脚注标记",
            "severity": "LOW"
        },
    }
    
    def detect(self, ocr_text: str, source_image: str = None) -> List[dict]:
        """
        检测 OCR 文本中的幻觉
        
        Returns: List of detected hallucinations
        """
        hallucinations = []
        
        for name, config in self.PATTERN_HALLUCINATIONS.items():
            pattern = config["pattern"]
            matches = pattern.findall(ocr_text)
            
            if matches:
                for match in matches:
                    # 定位匹配在文本中的位置
                    match_obj = pattern.search(ocr_text)
                    if match_obj:
                        start, end = match_obj.span()
                        
                        # 使用视觉上下文增强检测
                        confidence = self._compute_confidence(
                            ocr_text[start:end], config, source_image, (start, end)
                        )
                        
                        hallucinations.append({
                            "type": name,
                            "text": match,
                            "start": start,
                            "end": end,
                            "confidence": confidence,
                            "severity": config["severity"],
                            "description": config["description"],
                            "suggested_correction": config.get("correction", {}).get(match) 
                                                    if isinstance(config.get("correction"), dict)
                                                    else match  # 需要 LLM 辅助纠正
                        })
        
        return hallucinations
    
    def _compute_confidence(self, matched_text: str, config: dict,
                           source_image: str, span: Tuple[int, int]) -> float:
        """
        综合 OCR 置信度和视觉上下文计算幻觉置信度
        
        使用视觉证据（原始图像对应区域）来辅助判断 OCR 结果是否正确
        """
        # 1. OCR 自身置信度（来自 Tesseract/PaddleOCR 等）
        ocr_confidence = self._get_ocr_confidence(span)  # 0-1
        
        # 2. 视觉上下文验证
        visual_confidence = self._visual_verify(span, source_image)
        
        # 3. LLM 辅助验证
        llm_confidence = self._llm_verify(matched_text, span)
        
        # 综合置信度
        return 0.4 * ocr_confidence + 0.35 * visual_confidence + 0.25 * llm_confidence
    
    def _visual_verify(self, span: Tuple[int, int], image: str) -> float:
        """使用视觉模型验证 OCR 结果"""
        # 裁剪 OCR 文本对应的图像区域
        # （需要 OCR 输出的 bbox 信息）
        bbox = self._ocr_to_bbox(span)
        cropped = self._crop_image(image, bbox)
        
        # 用视觉 OCR 模型重新识别
        visual_ocr_result = self._visual_ocr_model(cropped)
        
        # 比较 OCR 结果与视觉 OCR 结果
        if visual_ocr_result == self._ocr_text_at_bbox(span):
            return 1.0
        else:
            return 0.3  # 差异大，OCR 可能错误
```

### 10.4.3 OCR + LLM 双重验证策略

```
┌──────────────────────────────────────────────────────────────┐
│              OCR + LLM 双重验证架构                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐                                             │
│  │  原始图像    │                                             │
│  └──────┬──────┘                                             │
│         │                                                    │
│    ┌────▼────┐                                               │
│    │ OCR 引擎  │ ←─ 输出: 文本 + bbox + confidence           │
│    │(Tesseract/│                                               │
│    │ PaddleOCR)│                                               │
│    └────┬────┘                                               │
│         │                                                    │
│         ├── 低置信度区域 ──→ 标记为 "疑似幻觉"                │
│         │                                                    │
│    ┌────▼────┐  高置信度区域                                 │
│    │ 文本块   │                                             │
│    └────┬────┘                                               │
│         │                                                    │
│    ┌────▼────┐                                               │
│    │ LLM 验证  │  ←─ 输入: 文本 + 对应图像区域               │
│    │ (VLM)    │  ←─ 输出: 验证结果 + 纠正建议                 │
│    └────┬────┘                                               │
│         │                                                    │
│    ┌────▼──────────────────┐                                 │
│    │  验证结果              │                                 │
│    │  ┌──────────────────┐ │                                 │
│    │  │ ✓ 确认正确 (高置信)│ │  → 直接入库                    │
│    │  ├──────────────────┤ │                                 │
│    │  │ ⚠️ 疑似错误 (低置信)│ │  → 触发人工审核                 │
│    │  ├──────────────────┤ │                                 │
│    │  │ ✗ 确认错误        │ │  → 使用视觉 VLM 重新 OCR         │
│    │  └──────────────────┘ │                                 │
│    └────────────────────────┘                                 │
│                                                              │
│  关键：利用 VLM 的视觉理解能力，对 OCR 文本与图像区域进行      │
│  一致性验证，有效降低 OCR 幻觉率                              │
└──────────────────────────────────────────────────────────────┘
```

#### 代码实现

```python
import asyncio
from typing import List, Optional

class OCRLLMDualVerification:
    """OCR + LLM 双重验证"""
    
    def __init__(self, ocr_engine: str = "paddleocr", 
                 vlm_model: str = "qwen2-vl-7b"):
        self.ocr_engine = self._init_ocr(ocr_engine)
        self.vlm_model = self._init_vlm(vlm_model)
    
    async def verify(self, image: bytes, bbox: dict) -> dict:
        """
        对 OCR 结果进行双重验证
        
        bbox: {"x1": int, "y1": int, "x2": int, "y2": int}
        
        Returns: {
            "ocr_text": str,
            "ocr_confidence": float,
            "llm_verified": bool,
            "llm_confidence": float,
            "correction": str or None,
            "hallucination_risk": "high" | "medium" | "low",
        }
        """
        # Step 1: OCR 提取文本
        ocr_result = self.ocr_engine.ocr(image, bbox)
        ocr_text = ocr_result["text"]
        ocr_conf = ocr_result["confidence"]
        
        # Step 2: 如果 OCR 置信度低，直接标记
        if ocr_conf < 0.6:
            return {
                "ocr_text": ocr_text,
                "ocr_confidence": ocr_conf,
                "llm_verified": False,
                "llm_confidence": 0.0,
                "correction": None,
                "hallucination_risk": "high",
                "action": "manual_review"
            }
        
        # Step 3: LLM 验证
        cropped_image = self._crop(image, bbox)
        llm_result = await self.vlm_model.verify_text_on_image(
            image=cropped_image, 
            text=ocr_text
        )
        
        llm_verified = llm_result["is_consistent"]
        llm_confidence = llm_result["confidence"]
        correction = llm_result.get("correction")
        
        # Step 4: 综合判定
        if ocr_conf >= 0.85 and llm_confidence >= 0.85:
            risk = "low"
        elif ocr_conf >= 0.6 or llm_confidence >= 0.6:
            risk = "medium"
        else:
            risk = "high"
        
        return {
            "ocr_text": ocr_text,
            "ocr_confidence": ocr_conf,
            "llm_verified": llm_verified,
            "llm_confidence": llm_confidence,
            "correction": correction or (ocr_text if not llm_verified else None),
            "hallucination_risk": risk,
            "action": "auto_accept" if risk == "low" else "manual_review"
        }
```

### 10.4.4 OCR 幻觉检测效果对比

| 方案 | 检测准确率 | 误报率 | 延迟增加 | 适用场景 | 缺点 |
|------|-----------|--------|---------|---------|------|
| 规则正则 | 65% | 30% | +2ms | 简单文本 | 无法覆盖复杂模式 |
| OCR 置信度 | 75% | 20% | +0ms | 所有 OCR | 依赖 OCR 引擎质量 |
| LLM 单轮验证 | 88% | 8% | +200ms | 高价值文档 | 成本较高 |
| **OCR+LLM 双重** | **95%** | **3%** | **+210ms** | **生产环境** | **架构复杂** |
| OCR+LLM+人工审核 | 99.5% | 0.5% | +2.5s | 医疗/法律 | 人力成本 |

---

## 10.5 延迟与成本评估

### 10.5.1 端到端延迟分解

```
┌─────────────────────────────────────────────────────────────────────┐
│                    端到端延迟分解（以 10 路并发为例）                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  用户查询输入                                                         │
│       │                                                             │
│  ┌────▼────┐  Δt₁: 2-5ms (网络传输)                                │
│  │ 查询路由  │                                                      │
│  └────┬────┘  Δt₂: 10-30ms (路由决策)                              │
│       │                                                             │
│       ├─── 检索管线 ─────────────────────────────────────────────    │
│       │                                                             │
│       │  ┌─────────────┐  Δt₃: 50-200ms                           │
│       │  │ 查询编码     │  (嵌入模型，batched)                      │
│       │  └──────┬──────┘                                            │
│       │         │                                                    │
│       │  ┌──────▼──────┐  Δt₄: 10-100ms                           │
│       │  │ 向量检索     │  (HNSW + 内存访问)                        │
│       │  └──────┬──────┘                                            │
│       │         │                                                    │
│       │  ┌──────▼──────┐  Δt₅: 100-500ms                          │
│       │  │ 多模态重排   │  (cross-encoder, reranking)               │
│       │  └──────┬──────┘                                            │
│       │         │                                                    │
│       ├─── 重排结果输出 ─────────────────────────────────────        │
│       │                                                             │
│       ├─── 生成管线 ─────────────────────────────────────────────    │
│       │                                                             │
│       │  ┌─────────────┐  Δt₆: 200-800ms                          │
│       │  │ Prompt 组装  │  (模板渲染 + 多模态上下文拼接)             │
│       │  └──────┬──────┘                                            │
│       │         │                                                    │
│       │  ┌──────▼──────┐  Δt₇: 1000-5000ms (TTFT)                 │
│       │  │ LLM 首 token │  (TTFT: Time to First Token)              │
│       │  └──────┬──────┘                                            │
│       │         │  Δt₈: 50-200ms/token (后续 token 生成速度)        │
│       │         │                                                    │
│       ├─── 输出组装 ─────────────────────────────────────────────    │
│       │  ┌─────────────┐  Δt₉: 5-20ms                             │
│       │  │ 输出后处理   │  (JSON 解析 + 多模态渲染)                 │
│       │  └──────┬──────┘                                            │
│       │         │  Δt₁₀: 50-100ms (网络传输)                       │
│       │                                                    │
│       ▼                                                             │
│  响应输出                                                          │
│                                                                     │
│  ─────────────────────────────────────────────────────────────     │
│  典型延迟分解 (ms):                                                │
│  ┌──────────┬───────┬───────┬───────┬──────────┐                  │
│  │ 阶段     │ P50   │ P90   │ P95   │ P99      │                  │
│  ├──────────┼───────┼───────┼───────┼──────────┤                  │
│  │ 编码     │ 100   │ 200   │ 300   │ 500      │                  │
│  │ 检索     │ 50    │ 80    │ 120   │ 200      │                  │
│  │ 重排     │ 250   │ 400   │ 600   │ 1000     │                  │
│  │ Prompt   │ 300   │ 500   │ 800   │ 1500     │                  │
│  │ TTFT     │ 1500  │ 2500  │ 3500  │ 6000     │                  │
│  │ 生成     │ 1000  │ 2000  │ 3000  │ 5000     │ (150 tokens)     │
│  │ 后处理   │ 50    │ 80    │ 120   │ 200      │                  │
│  ├──────────┼───────┼───────┼───────┼──────────┤                  │
│  │ 总计     │ 3750  │ 6260  │ 8640  │ 14400    │                  │
│  └──────────┴───────┴───────┴───────┴──────────┘                  │
│                                                                     │
│  优化空间:  │ TTFT 占 40% │ 重排占 13% │ 检索占 1%                 │
│  │ 嵌入占 3% │ 生成占 27% │ 其他占 16% │                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.5.2 延迟优化策略

| 优化策略 | P50 延迟减少 | 实现复杂度 | 适用场景 |
|---------|-------------|-----------|---------|
| 嵌入模型缓存 | -30% | 低 | 重复查询多的场景 |
| 检索结果缓存 | -25% | 低 | 缓存命中率高时 |
| 流式检索 + 流式生成 | -40% TTFT | 中 | 对首字延迟敏感 |
| 检索重排降级 | -20% | 中 | 重排模型成本高时 |
| 小模型 LLM 生成 | -35% | 高 | 质量可降级时 |
| 异步 pipeline | +吞吐量 2-3x | 高 | 高并发场景 |

### 10.5.3 成本评估

```python
class MultimodalRAGCostEstimator:
    """Multimodal RAG 成本估算器"""
    
    # 各组件成本 (USD/单位)
    COSTS = {
        "embedding": {"per_1k_tokens": 0.0001, "per_1k_images": 0.01},
        "reranking": {"per_request": 0.005},
        "ocr": {"per_page": 0.001},
        "llm": {
            "qwen2_vl_7b": {"per_1k_input": 0.0007, "per_1k_output": 0.0028},
            "gpt_4o": {"per_1k_input": 0.025, "per_1k_output": 0.10},
            "claude_3.5_sonnet": {"per_1k_input": 0.003, "per_1k_output": 0.015},
        },
        "vector_db": {"per_1m_queries": 0.50},
        "storage": {"per_gb_month": 0.023},
    }
    
    def estimate_query_cost(self, query: dict, response: dict = None) -> dict:
        """估算单次查询成本"""
        costs = {}
        
        # 嵌入成本
        costs["embedding"] = self._cost_embedding(query)
        
        # OCR 成本（如果有图像）
        if query.get("has_images"):
            costs["ocr"] = self.COSTS["ocr"]["per_page"] * query.get("image_pages", 1)
        
        # 检索成本
        costs["retrieval"] = self.COSTS["vector_db"]["per_1m_queries"] / 1_000_000
        
        # 重排成本
        costs["reranking"] = self.COSTS["reranking"]["per_request"]
        
        # LLM 成本
        if response:
            input_tokens = query.get("prompt_tokens", 0)
            output_tokens = response.get("output_tokens", 0)
            costs["llm"] = (
                self.COSTS["llm"]["gpt_4o"]["per_1k_input"] * input_tokens / 1000 +
                self.COSTS["llm"]["gpt_4o"]["per_1k_output"] * output_tokens / 1000
            )
        
        return costs
    
    def estimate_daily_cost(self, daily_queries: int, avg_cost: float) -> dict:
        """估算每日/月成本"""
        return {
            "daily": daily_queries * avg_cost,
            "monthly": daily_queries * avg_cost * 30,
            "yearly": daily_queries * avg_cost * 365,
        }
```

---

# 第 11 章 实战案例

## 11.1 医疗影像 RAG 系统

### 11.1.1 场景描述

**目标**：构建面向放射科的 multimodal RAG 系统，支持医生通过自然语言查询，快速检索相似病例的影像（CT/MRI/X-Ray）和诊断报告。

**核心需求**：
- 图像查询：医生上传一张 CT 切片，检索相似病例
- 文本查询：描述症状或诊断关键词，检索相关影像和报告
- 跨模态检索：支持 "找到所有显示肺部结节≥5mm 的 CT 报告"
- 合规性：HIPAA 合规，数据不离开院内网络

### 11.1.2 技术方案

```
┌────────────────────────────────────────────────────────────────────┐
│                   医疗影像 RAG 系统架构                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  PACS 系统   │───→│ DICOM 解析   │───→│ 图像预处理   │         │
│  │  (影像存储)  │    │ + metadata   │    │  (缩放/标准化)│         │
│  └─────────────┘    └──────────────┘    └──────┬───────┘         │
│                                                  │                 │
│                                            ┌────▼────┐           │
│  ┌─────────────┐    ┌──────────────┐      │ ViT     │           │
│  │  影像报告     │───→│ 报告解析     │      │ CLIP    │           │
│  │  (PACS/EMR) │    │ (NER + 实体  │      │ 嵌入    │           │
│  └─────────────┘    │  提取)        │      └────┬────┘           │
│                     └──────────────┘           │                 │
│                                                │                 │
│                                            ┌───▼────┐           │
│  ┌─────────────┐    ┌──────────────┐      │ 向量索引  │           │
│  │  医生查询     │───→│ 查询编码     │─────→│ (Milvus) │           │
│  │ (text/image) │    │ (CLIP)      │      └─────────┘           │
│  └─────────────┘    └──────────────┘           │                 │
│                                                 │                 │
│                                         ┌───────▼───────┐        │
│                                         │ 相似病例检索   │        │
│                                         └───┬───┬───┬───┘        │
│                                             │   │   │   │          │
│                                     ┌────────┐ ┌───┐ ┌───┐ ┌────────┐ │
│                                     │ 病例 1  │ │...│ │病例N│ │ 病例 N  │ │
│                                     │影像+报告│ │   │ │影像+报告│ │       │ │
│                                     └────────┘ └───┘ └───┘ └────────┘ │
│                                             │                           │
│                                      ┌──────▼───────┐                   │
│                                      │  LLM 聚合    │                   │
│                                      │ (诊断摘要生成) │                   │
│                                      └──────┬───────┘                   │
│                                             │                           │
│                                      ┌──────▼───────┐                   │
│                                      │  医生工作站   │                   │
│                                      │  (结果展示)   │                   │
│                                      └──────────────┘                   │
└────────────────────────────────────────────────────────────────────┘
```

### 11.1.3 关键组件

```python
import pydicom
import numpy as np
from PIL import Image
from typing import List, Dict, Tuple

class MedicalImageRAG:
    """医疗影像 RAG 系统"""
    
    def __init__(self, clip_model: str = "clip-ViT-L-14", 
                 vector_db: str = "milvus"):
        self.clip_model = self._load_clip(clip_model)
        self.vector_db = self._init_vector_db(vector_db)
        
    def ingest_image(self, dicom_path: str, report: str = None) -> str:
        """
        摄入 DICOM 影像及其报告
        
        Returns: chunk_id
        """
        # Step 1: DICOM 解析
        dcm = pydicom.dcmread(dicom_path)
        
        # 提取关键 metadata
        metadata = {
            "patient_age": dcm.get("PatientAge", "N/A"),
            "patient_sex": dcm.get("PatientSex", "N/A"),
            "study_date": dcm.get("StudyDate", "N/A"),
            "modality": dcm.get("Modality", "N/A"),  # CT/MRI/XR
            "body_part": dcm.get("BodyPartExamined", "N/A"),
            "slice_thickness": dcm.get("SliceThickness", "N/A"),
            "institution": dcm.get("InstitutionName", "N/A"),
        }
        
        # Step 2: DICOM → 图像
        pixel_data = dcm.pixel_array.astype(np.float32)
        
        # Windowing (CT 的 HU 值窗宽窗位)
        if dcm.Modality == "CT":
            # CT 窗宽窗位调整
            window_center = float(dcm.get("WindowCenter", 40))
            window_width = float(dcm.get("WindowWidth", 400))
            pixel_data = self._apply_ct_windowing(pixel_data, window_center, window_width)
        
        # 归一化到 [0, 1]
        pixel_data = (pixel_data - pixel_data.min()) / (pixel_data.max() - pixel_data.min() + 1e-8)
        image = Image.fromarray((pixel_data * 255).astype(np.uint8))
        
        # Step 3: 多切片处理
        if hasattr(dcm, 'Rows') and dcm.Rows > 1:
            # 多切片：取关键切片（中间层 + 最大最小层）
            n_slices = dcm.get("Rows", 1)
            slice_indices = [0, n_slices // 2, n_slices - 1]
            chunk_ids = []
            for idx in slice_indices:
                slice_img = image.convert('L')
                chunk_id = self._embed_and_store(
                    image=slice_img,
                    modality="ct_slice",
                    metadata={**metadata, "slice_index": idx}
                )
                chunk_ids.append(chunk_id)
        else:
            chunk_ids = [self._embed_and_store(
                image=image,
                modality=dcm.get("Modality", "unknown"),
                metadata=metadata
            )]
        
        # Step 4: 报告嵌入（如果有）
        if report:
            report_chunk_id = self._embed_report(report, metadata)
            # 建立影像-报告关联
            self.vector_db.link_chunks(chunk_ids[0], report_chunk_id)
        
        return chunk_ids
    
    def search(self, 
               query_image: Image.Image = None,
               query_text: str = None,
               k: int = 5) -> List[Dict]:
        """
        多模态病例检索
        
        Returns: List[{"chunk_id": str, "similarity": float, "metadata": dict}]
        """
        # 构建查询嵌入
        if query_image:
            query_embedding = self.clip_model.encode_image(query_image)
        elif query_text:
            query_embedding = self.clip_model.encode_text(query_text)
        else:
            raise ValueError("需提供 query_image 或 query_text")
        
        # 向量检索
        results = self.vector_db.search(
            embedding=query_embedding,
            k=k,
            filter_expr={"modality": "ct"}  # 可选：过滤模态
        )
        
        # 后处理：按临床相关性加权
        scored_results = []
        for r in results:
            # 基础相似度
            base_score = r["similarity"]
            
            # 临床权重调整
            weight = 1.0
            if r["metadata"].get("modality") == query_text and "body_part" in query_text:
                weight += 0.2  # 检查部位匹配
            
            scored_results.append({
                "chunk_id": r["id"],
                "similarity": base_score * weight,
                "metadata": r["metadata"],
                "has_report": r.get("has_report", False),
            })
        
        # 按相似度排序
        scored_results.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_results
    
    def _apply_ct_windowing(self, pixel_data: np.ndarray, 
                           center: float, width: float) -> np.ndarray:
        """CT 窗宽窗位调整"""
        lower = center - width / 2
        upper = center + width / 2
        pixel_data = np.clip(pixel_data, lower, upper)
        pixel_data = (pixel_data - lower) / (upper - lower)
        return pixel_data
```

### 11.1.4 挑战与解决方案

| 挑战 | 解决方案 |
|------|---------|
| DICOM 数据量大（单患者 GB 级） | 只嵌入关键切片（中间层 + 上下层），全量数据保留在 PACS |
| 医学图像嵌入空间差异 | 使用 MedCLIP（医疗领域预训练的 CLIP）而非通用 CLIP |
| 跨模态检索精度 | 联合检索：图像嵌入 + 报告文本嵌入的加权融合 |
| 隐私合规 | 全本地部署，数据不离开院内网络；嵌入后不保留原始图像 |
| 罕见病例检索少 | 使用对比学习增强：正常 vs 异常对的对比嵌入 |
| 影像质量差异大 | DICOM 标准化管线 + 自动 quality check |

---

## 11.2 企业合同知识库

### 11.2.1 场景描述

**目标**：构建企业合同知识库 RAG 系统，支持法务团队快速检索合同条款、对比条款差异、生成合规报告。

**核心需求**：
- 扫描件合同 OCR 还原（包含印章、手写签名）
- 条款级检索（精确到具体条款编号）
- 多合同对比分析
- 合同条款变更追踪

### 11.2.2 技术方案

```
┌────────────────────────────────────────────────────────────────────┐
│                   企业合同知识库 RAG 架构                           │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ 合同文档     │───→│ 版面分析     │───→│ OCR + 表格   │         │
│  │ (PDF/扫描件) │    │ (LayoutLMv3) │    │ 还原         │         │
│  └─────────────┘    └──────────────┘    └──────┬───────┘         │
│                                                 │                 │
│  ┌─────────────┐                                 │                 │
│  │ 合同元数据   │──→  条款实体提取               │                 │
│  │ (类型/日期/  │   (NER on OCR 结果)            │                 │
│  │  金额/对方)  │                                │                 │
│  └─────────────┘                                │                 │
│                                                  │                 │
│  ┌─────────────┐    ┌──────────────┐            │                 │
│  │ 法务查询     │───→│ 查询理解     │──→  条款编号 │                 │
│  │ (自然语言)   │    │ (意图分类)   │   + 关键词   │                 │
│  └─────────────┘    └──────────────┘            │                 │
│                                                  │                 │
│                                         ┌───────▼───────┐        │
│                                         │ 混合检索       │        │
│                                         │ (向量 + BM25) │        │
│                                         └───┬───┬───┬───┘        │
│                                             │   │   │   │          │
│                                     ┌────────┐ ┌───┐ ┌───┐ ┌────────┐ │
│                                     │ 合同 A  │ │...│ │合同B│ │ 合同 N  │ │
│                                     │条款块  │ │   │ │条款块│ │ 条款块 │ │
│                                     └────────┘ └───┘ └───┘ └────────┘ │
│                                             │                           │
│                                      ┌──────▼───────┐                   │
│                                      │  LLM 聚合    │                   │
│                                      │ (条款对比/    │                   │
│                                      │ 合规分析)     │                   │
│                                      └──────┬───────┘                   │
│                                             │                           │
│                                      ┌──────▼───────┐                   │
│                                      │  法务工作台   │                   │
│                                      └──────────────┘                   │
└────────────────────────────────────────────────────────────────────┘
```

### 11.2.3 关键组件

```python
import LayoutParser as lp
import rapidfuzz

class ContractKnowledgeBase:
    """企业合同知识库"""
    
    def __init__(self, embedding_model: str = "bge-m3",
                 vector_db: str = "milvus"):
        self.embedding_model = self._load_embedding(embedding_model)
        self.vector_db = self._init_vector_db(vector_db)
        self.ocr_engine = self._init_ocr("paddleocr")
        self.layout_analyzer = lp.PaddleParser(model="layoutlmv3")
    
    def ingest_contract(self, pdf_path: str) -> str:
        """摄入合同文档"""
        # Step 1: 版面分析
        layout = self.layout_analyzer.parse(pdf_path)
        
        # Step 2: 识别各区域类型
        regions = {
            "text_blocks": [],   # 纯文本
            "tables": [],        # 表格
            "signatures": [],    # 签名区域
            "stamps": [],        # 印章
            "headers": [],       # 页眉
            "footers": [],       # 页脚
        }
        
        for region in layout:
            if region.type == "text":
                regions["text_blocks"].append(region)
            elif region.type == "table":
                regions["tables"].append(region)
            elif region.type == "signature":
                regions["signatures"].append(region)
            elif region.type == "stamp":
                regions["stamps"].append(region)
        
        # Step 3: OCR + 表格还原
        chunks = []
        
        # 文本块 OCR
        for block in regions["text_blocks"]:
            ocr_result = self.ocr_engine.ocr(block.image)
            text = self._clean_contract_text(ocr_result.text)
            
            # 条款识别（正则：条款编号）
            clause_match = re.match(r'(第[一二三四五六七八九十百]+[条款]?[\d.]*\s*)', text)
            clause_id = clause_match.group(1) if clause_match else "uncategorized"
            
            chunk = {
                "text": text,
                "clause_id": clause_id,
                "page": block.page,
                "bbox": block.bbox,
                "metadata": {
                    "region_type": "text",
                    "clause_reference": clause_id,
                }
            }
            chunks.append(chunk)
        
        # 表格还原
        for table in regions["tables"]:
            markdown_table = self._ocr_table_to_markdown(table.image)
            chunk = {
                "text": markdown_table,
                "clause_id": "table",
                "page": table.page,
                "bbox": table.bbox,
                "metadata": {
                    "region_type": "table",
                    "rows": markdown_table.count('\n') + 1,
                }
            }
            chunks.append(chunk)
        
        # Step 4: 嵌入 + 存储
        chunk_ids = []
        for chunk in chunks:
            embedding = self.embedding_model.encode(chunk["text"])
            chunk_id = self.vector_db.upsert(
                embedding=embedding,
                metadata=chunk["metadata"],
                text=chunk["text"],
            )
            chunk_ids.append(chunk_id)
        
        return chunk_ids
    
    def search_clauses(self, query: str, contract_type: str = None) -> List[Dict]:
        """检索合同条款"""
        # Step 1: 查询理解
        query_intent = self._classify_intent(query)  # "查找/对比/变更/合规"
        clause_refs = self._extract_clause_references(query)  # "第5条", "付款条件"
        
        # Step 2: 混合检索
        results = []
        
        # 向量检索
        vector_results = self.vector_db.search(
            query_embedding=self.embedding_model.encode(query),
            k=10,
        )
        results.extend(vector_results)
        
        # BM25 检索（条款编号精确匹配）
        if clause_refs:
            bm25_results = self.vector_db.bm25_search(
                query=" ".join(clause_refs),
                filter={"clause_id": clause_refs[0]},
            )
            results.extend(bm25_results)
        
        # Step 3: 合并 + 去重 + 重排
        merged = self._merge_and_rerank(results, query)
        
        return merged
    
    def compare_contracts(self, contract_a: str, contract_b: str,
                          clause_id: str = None) -> Dict:
        """对比两份合同的条款差异"""
        # 检索两份合同中相同条款编号的文本
        clauses_a = self.vector_db.query_by_metadata(
            filter={"contract_id": contract_a, "clause_id": clause_id}
        )
        clauses_b = self.vector_db.query_by_metadata(
            filter={"contract_id": contract_b, "clause_id": clause_id}
        )
        
        # LLM 差异分析
        diff_prompt = f"""
对比以下两份合同的同一条款，找出差异：

合同 A ({contract_a}) 条款 {clause_id}:
{clauses_a[0]['text']}

合同 B ({contract_b}) 条款 {clause_id}:
{clauses_b[0]['text']}

请列出所有差异点，并指出哪份合同更有利。
"""
        diff_analysis = self.llm.generate(diff_prompt)
        
        return {
            "contract_a": contract_a,
            "contract_b": contract_b,
            "clause_id": clause_id,
            "clause_a_text": clauses_a[0]['text'],
            "clause_b_text": clauses_b[0]['text'],
            "diff_analysis": diff_analysis,
        }
```

### 11.2.4 挑战与解决方案

| 挑战 | 解决方案 |
|------|---------|
| 扫描件 OCR 质量差 | LayoutLMv3 版面分析 + PaddleOCR 混合管线；关键区域手动标注 |
| 合同条款结构复杂 | 条款编号正则匹配 + LLM 辅助条款边界识别 |
| 表格还原错误 | TableFormer 表格检测 + OCR + 结构恢复 |
| 印章/手写签名 | 印章区域独立 OCR；手写签名使用专用手写 OCR |
| 多合同对比 | 条款编号标准化 + 语义对齐（LLM 辅助） |
| 版本追踪 | 合同版本 MD5 + 条款级 diff 追踪 |

---

## 11.3 产品目录智能检索

### 11.3.1 场景描述

**目标**：构建零售/电商产品目录 RAG 系统，支持图像/文本混合查询，精准检索产品图片、规格参数、价格信息。

**核心需求**：
- 以图搜图：上传产品图片，检索相似商品
- 文本查询：描述产品特征，检索对应商品
- 多模态属性检索：价格区间 + 颜色 + 尺寸 + 材质
- 高并发低延迟（大促场景）

### 11.3.2 技术方案

```
┌────────────────────────────────────────────────────────────────────┐
│                   产品目录智能检索架构                              │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ 商品数据源   │───→│ 图像预处理   │───→│ CLIP 图像    │         │
│  │ (ERP/CRM)    │    │ (resize/    │    │ 嵌入          │         │
│  └─────────────┘    │  normalization)│    └──────┬──────┘         │
│                     └──────────────┘           │                 │
│                                               │                 │
│  ┌─────────────┐    ┌──────────────┐         │                 │
│  │ 商品属性     │───→│ 属性嵌入     │→     联合嵌入               │
│  │ (价格/颜色/  │    │ (属性编码)   │→  CLIP Text 端            │
│  │  材质/品牌)  │    └──────────────┘         │                 │
│  └─────────────┘                             │                 │
│                                               │                 │
│                                            ┌──▼────┐           │
│  ┌─────────────┐    ┌──────────────┐      │ 向量库  │           │
│  │ 用户查询     │───→│ 查询理解     │─────→│ (Milvus)│           │
│  │ (text/image) │    │ (意图/属性   │      └─────────┘           │
│  └─────────────┘    │  提取)        │              │              │
│                     └──────────────┘              │              │
│                                                   │              │
│                                          ┌────────▼────────┐   │
│                                          │ 混合检索         │   │
│                                          │ (图像+属性+文本) │   │
│                                          └───┬───┬───┬───┘   │
│                                              │   │   │   │        │
│                                      ┌────────┐ ┌───┐ ┌───┐ ┌────────┐ │
│                                      │ 产品 1  │ │...│ │产品N│ │ 产品 N  │ │
│                                      │图片+属性│ │   │ │图片+属性│ │       │ │
│                                      └────────┘ └───┘ └───┘ └────────┘ │
│                                             │                           │
│                                      ┌──────▼───────┐                   │
│                                      │  搜索结果     │                   │
│                                      │  (价格/库存/  │                   │
│                                      │   优惠券)      │                   │
│                                      └──────────────┘                   │
└────────────────────────────────────────────────────────────────────┘
```

### 11.3.3 关键组件

```python
class ProductCatalogRAG:
    """产品目录 RAG 系统"""
    
    def __init__(self):
        self.image_encoder = self._load_clip("ViT-L/14")
        self.property_encoder = self._init_property_encoder()
    
    def ingest_product(self, product: dict) -> str:
        """摄入商品信息"""
        # 商品属性编码
        property_embedding = self.property_encoder.encode({
            "category": product["category"],
            "brand": product["brand"],
            "color": product["color"],
            "price_range": product["price_range"],  # (min, max)
            "size": product["size"],
            "material": product["material"],
        })
        
        # 主图嵌入
        image_embedding = self.image_encoder.encode_image(product["main_image"])
        
        # 商品描述文本嵌入
        text_embedding = self.text_encoder.encode(product["description"])
        
        # 联合嵌入（加权融合）
        joint_embedding = (
            0.4 * image_embedding +   # 图像权重最高（主图匹配）
            0.35 * text_embedding +   # 描述次之
            0.25 * property_embedding  # 属性辅助
        )
        
        # 存入向量库（附带商品属性作为 metadata）
        return self.vector_db.upsert(
            embedding=joint_embedding,
            metadata={
                "product_id": product["id"],
                "category": product["category"],
                "brand": product["brand"],
                "price": product["price"],
                "stock": product["stock"],
                "properties": property_embedding,
            }
        )
    
    def search_products(self, 
                       query_image: Image = None,
                       query_text: str = None,
                       filters: dict = None) -> List[Dict]:
        """
        多模态产品检索
        
        filters: {"price_range": (0, 1000), "color": "red", ...}
        """
        # 构建联合查询嵌入
        embeddings = []
        
        if query_image:
            embeddings.append(("image", self.image_encoder.encode_image(query_image)))
        
        if query_text:
            embeddings.append(("text", self.text_encoder.encode(query_text)))
        
        if filters and "property_embedding" in filters:
            embeddings.append(("property", filters["property_embedding"]))
        
        # 联合查询
        if len(embeddings) == 1:
            query_embedding = embeddings[0][1]
        else:
            # 加权融合
            weights = [0.4 if e[0] == "image" else 0.3 if e[0] == "text" else 0.3 
                       for e in embeddings]
            query_embedding = sum(w * e[1] for w, e in zip(weights, embeddings))
        
        # 向量检索
        raw_results = self.vector_db.search(
            embedding=query_embedding,
            k=50,  # 召回更多以便后处理
            filter_expr=filters if filters else None,
        )
        
        # 业务规则重排
        scored_results = []
        for r in raw_results:
            score = r["similarity"]
            
            # 库存优先级
            if r["metadata"]["stock"] <= 0:
                score *= 0.1  # 无货降权
            
            # 价格匹配度（如果查询包含价格信息）
            if filters and "price_range" in filters:
                price = r["metadata"]["price"]
                pr_min, pr_max = filters["price_range"]
                if price < pr_min or price > pr_max:
                    score *= 0.5
            
            # 品牌偏好（用户历史购买数据）
            if "preferred_brands" in filters:
                if r["metadata"]["brand"] in filters["preferred_brands"]:
                    score *= 1.2
            
            scored_results.append({
                "product_id": r["metadata"]["product_id"],
                "similarity": score,
                "metadata": r["metadata"],
                "price": r["metadata"]["price"],
                "stock": r["metadata"]["stock"],
            })
        
        # 按综合评分排序
        scored_results.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_results[:20]  # 返回 top 20
```

### 11.3.4 挑战与解决方案

| 挑战 | 解决方案 |
|------|---------|
| 商品图片风格差异大 | 图像预处理标准化（白底图统一 + 颜色校正） |
| 属性匹配精度 | 属性编码独立于图像编码，混合检索 |
| 大促高并发 | Redis 缓存热门商品嵌入；预计算每日更新嵌入 |
| 新品冷启动 | 商品描述文本嵌入作为 fallback；人工标注辅助 |
| 相似商品去重 | 余弦相似度去重 + 商品 SKU 匹配 |
| 跨品类推荐 | 类目层嵌入 + 跨类目联合检索 |

---

## 11.4 金融研报分析系统

### 11.4.1 场景描述

**目标**：构建面向券商/基金的金融研报 RAG 系统，支持从研报中提取图表数据、财务指标、市场观点，并回答投资分析问题。

**核心需求**：
- 研报中图表数据精确还原（柱状图/折线图/饼图）
- 财务表格还原与计算
- 跨研报观点聚合
- 实时数据接入（股价/财报）

### 11.4.2 技术方案

```
┌────────────────────────────────────────────────────────────────────┐
│                   金融研报分析系统架构                              │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  ┌─────────────┐    ┌──────────────┐                              │
│  │ 研报 PDF     │───→│ 版面分析     │──→ 文本区域 / 表格区域 /    │
│  │ (内网/外网)  │    │ (LayoutParser)│   图表区域 / 公式区域       │
│  └─────────────┘    └──────────────┘                              │
│                                     │                              │
│                        ┌────────────▼────────────┐                │
│                        │    多模态内容处理        │                │
│                        │  ┌──────────────────┐   │                │
│                        │  │ 文本 OCR         │   │                │
│                        │  │ → 段落嵌入       │   │                │
│                        │  ├──────────────────┤   │                │
│                        │  │ 表格还原         │   │                │
│                        │  │ → Table2Vec      │   │                │
│                        │  ├──────────────────┤   │                │
│                        │  │ 图表还原         │   │                │
│                        │  │ → ChartBert      │   │                │
│                        │  │ → 数据点提取     │   │                │
│                        │  └──────────────────┘   │                │
│                        └────────────┬────────────┘                │
│                                     │                              │
│                          ┌──────────▼──────────┐                  │
│                          │  结构化知识图谱      │                  │
│                          │  ┌───────────────┐  │                  │
│                          │  │ 实体: 公司/行业 │  │                  │
│                          │  │ 关系: 投资评级  │  │                  │
│                          │  │ 财务指标: PE/PB │  │                  │
│                          │  │ 图表数据点      │  │                  │
│                          │  └───────────────┘  │                  │
│                          └──────────┬──────────┘                  │
│                                     │                              │
│  ┌─────────────┐    ┌──────────────┐                            │
│  │ 分析师查询   │───→│ 查询理解     │──→ 图表查询 / 财务查询 /   │
│  │ (自然语言)   │    │ (意图/实体   │   观点查询                  │
│  └─────────────┘    │  提取)        │                            │
│                     └──────────────┘                            │
│                                     │                            │
│                          ┌──────────▼──────────┐                  │
│                          │  多源检索            │                  │
│                          │ (文本+表格+图表+    │                  │
│                          │  知识图谱+实时数据)  │                  │
│                          └──────────┬──────────┘                  │
│                                     │                              │
│                          ┌──────────▼──────────┐                  │
│                          │  LLM 聚合生成        │                  │
│                          │ (研报摘要/对比分析/  │                  │
│                          │  投资建议)           │                  │
│                          └──────────┬──────────┘                  │
│                                     │                              │
│  ┌─────────────┐                   │                              │
│  │ 投资工作台   │←──────────────────┘                              │
│  │ (图表+结论)  │                                                 │
│  └─────────────┘                                                 │
└────────────────────────────────────────────────────────────────────┘
```

### 11.4.3 关键组件

```python
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, List, Tuple

class FinancialReportRAG:
    """金融研报 RAG 系统"""
    
    def __init__(self):
        self.chart_retriever = ChartDataRetriever()  # 图表数据提取
        self.table_parser = FinancialTableParser()    # 财务表格解析
        self.knowledge_graph = FinancialKG()          # 金融知识图谱
    
    def analyze_chart(self, chart_image: np.ndarray) -> Dict:
        """
        从研报图表中提取数据
        
        Returns: {
            "chart_type": "bar"/"line"/"pie",
            "x_labels": [...],
            "y_values": [...],
            "title": str,
            "legend": [...],
            "data_points": [(x, y), ...],
            "unit": str,  # "亿元"/"%"
        }
        """
        result = self.chart_retriever.extract(chart_image)
        
        # 金融场景增强
        if result["chart_type"] == "bar":
            # 财务柱状图：提取同比增长率
            result["growth_rate"] = self._compute_growth_rate(result["y_values"])
        
        if result["chart_type"] == "line":
            # 趋势分析
            result["trend"] = self._detect_trend(result["y_values"])
            result["peak_value"] = max(result["y_values"])
            result["peak_date"] = result["x_labels"][result["y_values"].index(max(result["y_values"]))]
        
        return result
    
    def parse_financial_table(self, table_image: np.ndarray) -> pd.DataFrame:
        """解析财务表格"""
        # 表格结构识别
        table_structure = self.table_parser.detect_structure(table_image)
        
        # 单元格 OCR
        ocr_result = self.table_parser.ocr_cells(table_image)
        
        # 财务字段标准化
        df = self.table_parser.standardize_financial_columns(ocr_result.df)
        
        return df
    
    def query_reports(self, query: str) -> Dict:
        """
        研报查询
        
        query: "对比茅台和五粮液近 5 年营收增长趋势"
        """
        # 查询理解
        intent = self._classify_intent(query)  # "comparison"/"trend"/"indicator"
        entities = self._extract_entities(query)  # ["茅台", "五粮液", "营收"]
        time_range = self._extract_time_range(query)  # ("2020", "2025")
        
        # 多源检索
        retrieval_results = {}
        
        # 1. 研报文本检索
        text_results = self.vector_db.search(
            query=query,
            filter={"doc_type": "research_report"},
            k=10,
        )
        retrieval_results["text"] = text_results
        
        # 2. 图表数据检索
        if "营收" in query or "增长" in query:
            chart_results = self.knowledge_graph.query_financial_data(
                companies=entities.get("companies", []),
                metric="revenue",
                time_range=time_range,
            )
            retrieval_results["charts"] = chart_results
        
        # 3. 财务表格检索
        if "财报" in query:
            table_results = self.knowledge_graph.query_financial_tables(
                companies=entities.get("companies", []),
                time_range=time_range,
            )
            retrieval_results["tables"] = table_results
        
        # LLM 聚合生成
        prompt = f"""
基于以下多源信息回答投资分析问题：

查询: {query}

文本信息:
{text_results[:3]}

图表数据:
{chart_results}

财务表格:
{table_results[:2]}

请给出:
1. 数据对比分析
2. 趋势判断
3. 投资建议
4. 数据引用来源
"""
        analysis = self.llm.generate(prompt)
        
        return {
            "query": query,
            "retrieval": retrieval_results,
            "analysis": analysis,
            "data_sources": [r.get("source") for r in text_results],
        }
```

### 11.4.4 挑战与解决方案

| 挑战 | 解决方案 |
|------|---------|
| 图表数据还原准确率 | ChartBert + 人工标注增强 + 领域微调 |
| 财务表格列名多样 | 财务术语标准化映射表（"营收"→"revenue"） |
| 跨研报数据对齐 | 知识图谱 + 实体链接（公司实体统一编码） |
| 实时数据接入 | 接入 Wind/彭博 API，与静态研报数据融合 |
| 研报观点冲突 | 观点置信度加权（券商评级 + 分析师历史准确率） |
| 合规审计 | 所有输出标注数据来源 + 不可篡改审计日志 |

---

## 11.5 教育课件问答系统

### 11.5.1 场景描述

**目标**：构建教育领域的 Multimodal RAG 系统，支持教师和学生通过自然语言检索课件中的知识点、公式、图表。

**核心需求**：
- 课件（PPT/PDF）中知识点精准定位
- 公式识别与数学表达还原
- 教学场景优化（学生→教师视角）
- 多课件知识关联

### 11.5.2 技术方案

```
┌────────────────────────────────────────────────────────────────────┐
│                   教育课件问答系统架构                              │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  ┌─────────────┐    ┌──────────────┐                              │
│  │ 课件资源     │───→│ 课件解析     │→ 知识点/公式/图表/图片区域   │
│  │ (PPT/PDF)    │    │ (Layout+OCR) │                              │
│  └─────────────┘    └──────────────┘                              │
│                                     │                              │
│                        ┌────────────▼────────────┐                │
│                        │    知识库构建            │                │
│                        │  ┌──────────────────┐   │                │
│                        │  │ 知识点图          │   │                │
│                        │  │ - 前驱知识点      │   │                │
│                        │  │ - 后置知识点      │   │                │
│                        │  │ - 关联公式        │   │                │
│                        │  │ - 例题关联        │   │                │
│                        │  └──────────────────┘   │                │
│                        └────────────┬────────────┘                │
│                                     │                              │
│  ┌─────────────┐    ┌──────────────┐                            │
│  │ 用户查询     │───→│ 查询理解     │→ 知识点检索 /               │
│  │ (学生/教师)  │    │ (角色/难度   │   公式检索 /                │
│  └─────────────┘    │  理解)        │   例题检索                  │
│                     └──────────────┘                            │
│                                     │                            │
│                          ┌──────────▼──────────┐                  │
│                          │  多模态检索          │                  │
│                          │ (知识点+公式+图表)   │                  │
│                          └──────────┬──────────┘                  │
│                                     │                              │
│                          ┌──────────▼──────────┐                  │
│                          │  教育适配生成        │                  │
│                          │ (根据角色调整难度)   │                  │
│                          └──────────┬──────────┘                  │
│                                     │                              │
│  ┌─────────────┐                   │                              │
│  │ 教学界面     │←──────────────────┘                              │
│  │ (答案+课件   │                                                 │
│  │  + 关联知识点)│                                                 │
│  └─────────────┘                                                 │
└────────────────────────────────────────────────────────────────────┘
```

### 11.5.3 关键组件

```python
import sympy
from sympy.parsing.latex import parse_latex

class EducationPPTQA:
    """教育课件问答系统"""
    
    def __init__(self):
        self.knowledge_graph = KnowledgeGraph()  # 知识点图谱
        self.formula_engine = FormulaEngine()    # 公式引擎
        self.tutor_mode = TutorModeEngine()      # 教学模式
    
    def ingest_courseware(self, ppt_path: str) -> Dict[str, str]:
        """摄入课件，构建知识点图谱"""
        # 解析 PPT 页面
        pages = self._parse_ppt(ppt_path)
        
        chunk_ids = {}
        for page_num, page in enumerate(pages):
            # 版面分析
            layout = self._analyze_layout(page)
            
            for element in layout:
                if element.type == "text":
                    # 知识点提取（标题 + 正文）
                    if element.is_heading or element.level <= 2:
                        concept_id = self._extract_concept(element.text)
                        chunk_ids[f"concept_{concept_id}"] = self.vector_db.upsert(
                            embedding=self.text_encoder.encode(element.text),
                            metadata={
                                "page": page_num,
                                "type": "concept",
                                "concept_id": concept_id,
                            }
                        )
                
                elif element.type == "formula":
                    # 公式 LaTeX 提取
                    latex = self._ocr_formula_to_latex(element.image)
                    # 验证公式可解析
                    try:
                        parsed = parse_latex(latex)
                        is_valid = True
                    except:
                        is_valid = False
                    
                    if is_valid:
                        formula_id = f"formula_{page_num}_{element.id}"
                        chunk_ids[formula_id] = self.vector_db.upsert(
                            embedding=self.text_encoder.encode(latex),
                            metadata={
                                "page": page_num,
                                "type": "formula",
                                "concept_ids": concept_id,  # 关联知识点
                                "latex": latex,
                                "is_valid": is_valid,
                            }
                        )
                
                elif element.type == "chart":
                    # 图表数据提取
                    chart_data = self.chart_retriever.extract(element.image)
                    chart_id = f"chart_{page_num}_{element.id}"
                    chunk_ids[chart_id] = self.vector_db.upsert(
                        embedding=self.text_encoder.encode(str(chart_data)),
                        metadata={
                            "page": page_num,
                            "type": "chart",
                            "concept_ids": concept_id,
                            "chart_data": chart_data,
                        }
                    )
        
        # 构建知识点图谱
        self._build_knowledge_graph(chunk_ids)
        
        return chunk_ids
    
    def answer(self, query: str, 
               user_role: str = "student",
               difficulty: str = "auto") -> Dict:
        """
        课件问答
        
        Returns: {
            "answer": str,
            "referenced_concepts": [...],
            "related_formulas": [...],
            "related_charts": [...],
            "related_concepts": [...],  # 前置/后置关联知识点
            "difficulty_adjusted": str,
        }
        """
        # 查询理解
        query_type = self._classify_query_type(query)  # "definition"/"formula"/"example"/"concept"
        concepts = self._extract_concepts(query)
        
        # 根据角色调整检索策略
        if user_role == "teacher":
            # 教师模式：返回详细知识图谱
            results = self._teacher_mode_search(query, concepts)
        else:
            # 学生模式：返回简化答案 + 关联知识点
            results = self._student_mode_search(query, concepts)
        
        # 根据难度调整
        if difficulty == "auto":
            results = self.tutor_mode.adjust_difficulty(results, user_role)
        elif difficulty == "easy":
            results = self.tutor_mode.simplify(results)
        elif difficulty == "hard":
            results = self.tutor_mode.extend_with_advanced_concepts(results)
        
        # LLM 生成答案
        answer = self.tutor_mode.generate_answer(
            query=query,
            retrieved=results,
            user_role=user_role,
            difficulty=difficulty,
        )
        
        return {
            "answer": answer,
            "referenced_concepts": results.get("concepts", []),
            "related_formulas": results.get("formulas", []),
            "related_charts": results.get("charts", []),
            "related_concepts": results.get("prerequisite_concepts", []) + 
                              results.get("followup_concepts", []),
            "difficulty_adjusted": results.get("difficulty_label", difficulty),
        }
```

### 11.5.4 挑战与解决方案

| 挑战 | 解决方案 |
|------|---------|
| 公式 OCR 复杂度高 | Mathpix API + Sympy 验证管线 |
| 知识点关联稀疏 | 教师手动标注 + LLM 辅助关联 |
| 多课件知识整合 | 统一知识点编码 + 跨课件知识图谱 |
| 学生理解水平差异 | Tutor Mode 动态调整回答难度 |
| 课件更新频繁 | 增量更新管线 + 版本管理 |
| 多语言课件 | 多语言嵌入模型（m3e-multilingual） |

---

## 11.6 案例对比总结

| 维度 | 医疗影像 | 企业合同 | 产品目录 | 金融研报 | 教育课件 |
|------|---------|---------|---------|---------|---------|
| **核心模态** | CT/MRI/X-Ray | 扫描件 + 表格 | 商品图 + 属性 | 图表 + 表格 + 公式 | 文本 + 公式 + 图表 |
| **嵌入模型** | MedCLIP | BGE-M3 | CLIP-ViT-L | ChartBert + BGE | m3e-multilingual |
| **向量库** | Milvus | Milvus + ES | Milvus + Redis | Milvus + Neo4j | Elasticsearch |
| **OCR 引擎** | PaddleOCR | PaddleOCR | PaddleOCR | PaddleOCR + Mathpix | PaddleOCR + Mathpix |
| **检索模式** | 图像↔图像 | 文本↔文本 | 图像+属性 | 文本+图表+表格 | 知识点图谱 |
| **延迟要求** | P95 < 2s | P95 < 1s | P95 < 200ms | P95 < 3s | P95 < 2s |
| **核心挑战** | 影像质量差异 | 扫描件 OCR | 高并发 | 图表还原 | 公式识别 |
| **隐私要求** | HIPAA 极高 | GDPR 高 | 低 | SEC 高 | 低 |
| **LLM 角色** | 诊断摘要 | 条款对比 | 商品推荐 | 投资分析 | 教学生成 |
| **评估重点** | Recall@k + 诊断精度 | 条款还原率 | 转化率 + PCTR | 数据准确率 | 知识点覆盖率 |

---

# 第 12 章 性能优化（含本地部署与显存优化）

## 12.1 嵌入加速

### 12.1.1 INT8/INT4 量化嵌入模型

```
┌──────────────────────────────────────────────────────────────┐
│                   嵌入模型量化加速方案                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  原始模型 (FP16)       量化模型 (INT8/INT4)                  │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │ Layer 1 (FP16)│ →  │ Layer 1 (INT8)│ →  矩阵乘法加速    │
│  │ Layer 2 (FP16)│ →  │ Layer 2 (INT8)│ →  TensorRT/ONNX   │
│  │ Layer 3 (FP16)│ →  │ Layer 3 (INT8)│ →  INT8 矩阵运算   │
│  │ ...           │      │ ...          │                     │
│  │ Output (FP16) │ →  │ Output (INT8) │ →  恢复为 FP32     │
│  └──────────────┘      └──────────────┘                     │
│                                                              │
│  量化方法:                                                    │
│  • per-channel INT8: 按通道量化（精度高，适合 LLM 嵌入）       │
│  • per-tensor INT8: 按张量量化（速度快，适合 CLIP）           │
│  • INT4: 极低精度（仅适合小规模模型）                         │
│                                                              │
│  关键：量化后需要校准（Calibration）                          │
│  校准数据集 → 找激活值分布 → 确定量化参数 (scale, zero_point)│
└──────────────────────────────────────────────────────────────┘
```

```python
import torch
import torch.nn as nn
from torch.quantization import quantize_dynamic, quantize_fx

class EmbeddingQuantizer:
    """嵌入模型量化器"""
    
    def __init__(self, model: nn.Module, target_dtype: str = "int8"):
        self.model = model
        self.target_dtype = target_dtype
    
    def quantize(self, calibration_data: list) -> nn.Module:
        """
        量化嵌入模型
        
        Args:
            calibration_data: 校准数据集（少量真实查询的 embedding 输入）
        
        Returns:
            quantized_model: 量化后的模型
        """
        if self.target_dtype == "int8":
            # 使用 torch.quantization 进行量化
            self.model.eval()
            
            # 静态量化需要指定量化模块
            quantized = quantize_fx.prepare_fx(
                self.model, 
                {nn.Linear: torch.quantization.get_default_qat_linear_config()},
                calibration_data,
            )
            
            # 运行校准数据
            quantized.eval()
            with torch.no_grad():
                for data in calibration_data:
                    _ = quantized(data)
            
            # 转换为量化模型
            quantized_model = quantize_fx.convert_fx(quantized)
        
        elif self.target_dtype == "int4":
            # INT4 量化使用 nn.quantized.dynamic 或外部库（如 bitsandbytes）
            quantized_model = self._int4_quantize(self.model)
        
        # 验证精度损失
        self._verify_accuracy(self.model, quantized_model, calibration_data)
        
        return quantized_model
    
    def _int4_quantize(self, model: nn.Module) -> nn.Module:
        """INT4 量化（使用 bitsandbytes 或 AWQ）"""
        import bitsandbytes as bnb
        
        # 替换 Linear 层为 INT4 量化层
        def replace_linear(model):
            for name, module in model.named_children():
                if isinstance(module, nn.Linear):
                    setattr(model, name, bnb.nn.Linear4bit(
                        module.in_features,
                        module.out_features,
                        dtype=torch.float16,
                        quant_type="nf4",  # 归一化 INT4
                    ))
                else:
                    replace_linear(module)
        
        quantized_model = copy.deepcopy(model)
        replace_linear(quantized_model)
        return quantized_model
    
    def _verify_accuracy(self, original: nn.Module, quantized: nn.Module,
                         calibration_data: list) -> float:
        """验证量化前后精度一致性"""
        similarities = []
        
        with torch.no_grad():
            for data in calibration_data:
                orig_output = original(data)
                quant_output = quantized(data)
                
                # 余弦相似度
                sim = torch.nn.functional.cosine_similarity(
                    orig_output, quant_output, dim=-1
                ).mean().item()
                similarities.append(sim)
        
        avg_similarity = np.mean(similarities)
        print(f"量化精度验证: 平均余弦相似度 = {avg_similarity:.4f}")
        
        if avg_similarity < 0.95:
            print("⚠️ 量化精度损失过大，建议降级精度或使用 INT8")
        
        return avg_similarity

# 批处理嵌入加速
class BatchedEmbedding:
    """批处理嵌入引擎"""
    
    def __init__(self, model: nn.Module, batch_size: int = 32):
        self.model = model
        self.batch_size = batch_size
    
    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """
        批量编码文本，最大化 GPU 利用率
        
        Args:
            texts: 文本列表
        
        Returns:
            embeddings: np.ndarray (N, D)
        """
        all_embeddings = []
        
        # 分 batch 处理
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            
            # Tokenize
            tokens = self.tokenizer(
                batch, 
                padding=True, 
                truncation=True, 
                return_tensors="pt"
            ).to(self.model.device)
            
            # 推理
            with torch.no_grad():
                outputs = self.model(**tokens)
            
            # 取 [CLS] token 或 mean pooling
            embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            all_embeddings.append(embeddings)
        
        return np.vstack(all_embeddings)
```

### 12.1.2 量化效果对比

| 模型 | 原始精度 | INT8 精度 | INT4 精度 | INT8 加速比 | INT4 加速比 | INT8 显存 | INT4 显存 |
|------|---------|---------|---------|-----------|-----------|---------|---------|
| BGE-M3 (768D) | 100% | 99.8% | 98.5% | 2.3x | 3.8x | 4.1MB | 2.0MB |
| CLIP-ViT-L | 100% | 99.9% | 98.2% | 2.5x | 4.0x | 480MB | 240MB |
| E5-Mistral | 100% | 99.7% | 97.8% | 2.1x | 3.5x | 1.5GB | 750MB |
| text-embedding-3-small | 100% | 99.9% | N/A | 2.0x | N/A | 40MB | N/A |
| sentence-transformers | 100% | 99.5% | 97.0% | 2.0x | 3.2x | 0.5GB | 256MB |

---

## 12.2 检索加速

### 12.2.1 HNSW 参数调优

```
┌────────────────────────────────────────────────────────────────────┐
│                   HNSW 参数调优指南                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  HNSW 核心参数对性能的影响                                          │
│  ┌───────────────┬────────────────┬──────────┬─────────┐         │
│  │ 参数          │ 调高效果       │ 调低效果  │ 推荐值  │         │
│  ├───────────────┼────────────────┼──────────┼─────────┤         │
│  │ M (连接度)    │ ↑ 召回率, ↑ 构建时间, ↑ 内存  │ ↓ 速度, ↓ 内存 │ 12-48  │         │
│  │ efConstruction│ ↑ 构建质量   │ ↓ 构建时间 │ 100-500 │         │
│  │ efSearch      │ ↑ 召回率     │ ↓ 搜索速度  │ 50-200 │         │
│  │ maxElements   │ ↑ 最大容量   │ ↓ 最大容量  │ N      │         │
│  │ numThreads    │ ↑ 构建速度   │ ↓ 构建速度  │ 0/所有 │         │
│  │ random_seed   │ 控制构建随机性  │ -        │ 任意   │         │
│  └───────────────┴────────────────┴──────────┴─────────┘         │
│                                                                    │
│  参数调优策略:                                                      │
│  • 召回率优先: M=32, efConstruction=500, efSearch=200             │
│  • 速度优先:   M=16, efConstruction=100, efSearch=50              │
│  • 平衡模式:   M=24, efConstruction=300, efSearch=100             │
│                                                                    │
│  关键洞察:                                                        │
│  • efSearch 与召回率近似线性关系（到饱和点）                        │
│  • M 对索引大小影响显著（每个向量额外 2*M*d bytes）                │
│  • efConstruction 影响索引构建质量，过大会导致过拟合                │
└────────────────────────────────────────────────────────────────────┘
```

```python
import faiss
import numpy as np

class HNSWOptimizer:
    """HNSW 参数调优器"""
    
    def __init__(self, embedding_dim: int = 768):
        self.dim = embedding_dim
    
    def benchmark_params(self, 
                        embeddings: np.ndarray,
                        ground_truth: np.ndarray,
                        param_grid: dict = None) -> pd.DataFrame:
        """
        对 HNSW 参数网格进行基准测试
        
        Args:
            embeddings: (N, D) 训练向量
            ground_truth: (N, k) 每行的 ground truth 邻居
            param_grid: 参数网格 {M: [...], efConstruction: [...], efSearch: [...]}
        
        Returns:
            DataFrame: 各参数的性能指标
        """
        if param_grid is None:
            param_grid = {
                "M": [12, 24, 32, 48],
                "efConstruction": [100, 200, 300, 500],
                "efSearch": [20, 50, 100, 200],
            }
        
        results = []
        
        for M in param_grid["M"]:
            for efConstruction in param_grid["efConstruction"]:
                # 构建索引
                index = faiss.IndexHNSWFlat(self.dim, M)
                index.hnsw.efConstruction = efConstruction
                index.add(embeddings)
                
                # 搜索
                index.hnsw.efSearch = param_grid["efSearch"][0]  # 先用一个 efSearch 值
                distances, indices = index.search(embeddings, 10)
                
                # 计算 Recall@10
                recalls = self._compute_recall(indices, ground_truth)
                
                # 索引大小
                index_size_mb = faiss.estimate_index_size(index) / (1024 * 1024)
                
                # 构建时间
                import time
                start = time.time()
                index.add(embeddings)
                build_time = time.time() - start
                
                results.append({
                    "M": M,
                    "efConstruction": efConstruction,
                    "recall@10": recalls.mean(),
                    "index_size_mb": index_size_mb,
                    "build_time_s": build_time,
                })
        
        return pd.DataFrame(results)
    
    def _compute_recall(self, predicted: np.ndarray, 
                        ground_truth: np.ndarray) -> np.ndarray:
        """计算 Recall@k"""
        n_queries = predicted.shape[0]
        recalls = []
        
        for i in range(n_queries):
            hit = 0
            for j in range(predicted.shape[1]):
                if predicted[i, j] in ground_truth[i]:
                    hit += 1
            recalls.append(hit / len(ground_truth[i]))
        
        return np.array(recalls)
```

### 12.2.2 缓存分层架构

```
┌───────────────────────────────────────────────────────────────────────┐
│                    多级缓存架构                                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  查询请求                                                              │
│       │                                                               │
│  ┌────▼─────────────────────────────────────────────────────────────┐ │
│  │ L1: 查询级缓存 (Redis)                                             │ │
│  │   - 缓存键: hash(query_text + 模态)                                │ │
│  │   - TTL: 30s - 5min (高频查询短 TTL)                               │ │
│  │   - 命中率: ~60-80% (电商/FAQ 场景)                                │ │
│  │   - 容量: 100K - 1M 条目 (内存 ~500MB-5GB)                        │ │
│  └────┬─────────────────────────────────────────────────────────────┘ │
│       │ hit? → 返回结果                                                │
│       │ miss? ↓                                                       │
│  ┌────▼─────────────────────────────────────────────────────────────┐ │
│  │ L2: 嵌入级缓存 (内存)                                               │ │
│  │   - 缓存键: hash(原始文本/图像特征)                                  │ │
│  │   - TTL: 无 (常驻内存)                                             │ │
│  │   - 命中率: ~30-50% (重复查询)                                     │ │
│  │   - 容量: LRU 10K - 100K 条目                                    │ │
│  └────┬─────────────────────────────────────────────────────────────┘ │
│       │ hit? → 返回嵌入 → 向量检索                                     │
│       │ miss? ↓                                                       │
│  ┌────▼─────────────────────────────────────────────────────────────┐ │
│  │ L3: 向量检索结果缓存 (Milvus 内存)                                   │ │
│  │   - 缓存检索结果的 Top-K ID 列表                                   │ │
│  │   - TTL: 1h - 24h (数据更新时失效)                                │ │
│  │   - 命中率: ~10-30%                                              │ │
│  └────┬─────────────────────────────────────────────────────────────┘ │
│       │ hit? → 返回 Top-K → 重排 → 生成                              │
│       │ miss? ↓                                                       │
│  ┌────▼─────────────────────────────────────────────────────────────┐ │
│  │ L4: 向量检索 (Milvus/FAISS)                                       │ │
│  │   - 实时检索 Top-K                                                │ │
│  │   - 延迟: 5-100ms                                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  缓存优化:                                                            │ │
│  • L1/L2 使用 Redis / Memcached                                    │ │
│  • L2 使用 Python LRU cache 或 Redis Hash                          │ │
│  • 缓存失效: 数据更新时 + TTL 机制                                    │ │
│  • 缓存预热: 启动时加载高频查询嵌入                                     │ │
└───────────────────────────────────────────────────────────────────────┘
```

```python
import hashlib
import time
from functools import lru_cache
from typing import Optional

class MultiTierCache:
    """多级缓存系统"""
    
    def __init__(self, l1_ttl: int = 60, l2_maxsize: int = 10000):
        self.l1_ttl = l1_ttl  # 秒
        self.l2_maxsize = l2_maxsize
        
        # L1: Redis
        self.l1 = self._init_redis()
        
        # L2: 内存 LRU
        self.l2_embeddings = {}
        self.l2_embeddings_time = {}
    
    def get_embedding(self, text: str) -> Optional[np.ndarray]:
        """带多级缓存的嵌入获取"""
        cache_key = hashlib.md5(text.encode()).hexdigest()
        
        # L1: Redis 查询
        cached = self.l1.get(f"embedding:{cache_key}")
        if cached:
            return np.frombuffer(cached, dtype=np.float32)
        
        # L2: 内存查询
        if cache_key in self.l2_embeddings:
            if time.time() - self.l2_embeddings_time[cache_key] < self.l1_ttl:
                return self.l2_embeddings[cache_key]
            else:
                del self.l2_embeddings[cache_key]
                del self.l2_embeddings_time[cache_key]
        
        # Miss: 计算嵌入并缓存
        embedding = self._compute_embedding(text)
        
        # 写入 L2
        self.l2_embeddings[cache_key] = embedding
        self.l2_embeddings_time[cache_key] = time.time()
        if len(self.l2_embeddings) > self.l2_maxsize:
            oldest = min(self.l2_embeddings_time, key=self.l2_embeddings_time.get)
            del self.l2_embeddings[oldest]
            del self.l2_embeddings_time[oldest]
        
        # 写入 L1
        self.l1.setex(f"embedding:{cache_key}", self.l1_ttl, embedding.tobytes())
        
        return embedding
    
    def invalidate(self, text_pattern: str = None):
        """清除缓存"""
        if text_pattern:
            keys = self.l1.keys(f"embedding:{text_pattern}*")
            self.l1.delete(*keys)
        else:
            # 全部清除
            keys = self.l1.keys("embedding:*")
            self.l1.delete(*keys)
            self.l2_embeddings.clear()
```

---

## 12.3 多模态 LLM 推理加速

### 12.3.1 推理引擎对比

| 引擎 | 量化支持 | 多模态支持 | 批量推理 | 流式输出 | 部署难度 | 适用场景 |
|------|---------|-----------|---------|---------|---------|---------|
| **vLLM** | AWQ/GPTQ/INT8 | ✅ (vLLM-InternVL, Qwen2-VL) | ✅ PagedAttention | ✅ | 低 | 高吞吐服务端 |
| **TGI** | AWQ/GPTQ | ❌ (需自定义) | ✅ | ✅ | 中 | HuggingFace 生态 |
| **TensorRT-LLM** | FP8/INT8 | ✅ (需自定义插件) | ✅ | ✅ | 高 | 极致性能 |
| **llama.cpp** | GGUF(INT4/INT6) | ✅ (llama.cpp + mla) | ✅ | ✅ | 极低 | CPU/本地 |
| **Ollama** | GGUF | ✅ (内置 Qwen2-VL 等) | ✅ | ✅ | 极低 | 开发/演示 |

### 12.3.2 量化方案对比

| 量化方案 | 精度损失 | 显存压缩 | 推理速度提升 | 实现复杂度 | 适用模型 |
|---------|---------|---------|-----------|-----------|---------|
| **FP16** | 0% | 1x | 1x | - | 基线 |
| **INT8** | <1% | 2x | 1.5-2x | 低 | 所有模型 |
| **AWQ** | <1% | 4x | 2-3x | 中 | Qwen2-VL, LLaMA3 |
| **GPTQ** | <0.5% | 4x | 2-3x | 中 | 兼容 AWQ 的模型 |
| **FP8** | <2% | 2x | 2-3x | 高 | H100+ |
| **INT4** | 2-5% | 8x | 3-5x | 高 | 小模型/端侧 |
| **NF4** | 1-3% | 8x | 3-5x | 高 | 小模型/端侧 |

### 12.3.3 vLLM 部署多模态 LLM

```python
# 使用 vLLM 部署多模态 LLM (Qwen2-VL)
from vllm import LLM, SamplingParams
from transformers import AutoProcessor

class MultimodalLLMEngine:
    """多模态 LLM 推理引擎 (vLLM)"""
    
    def __init__(self, model_name: str = "Qwen/Qwen2-VL-7B-Instruct",
                 quantization: str = "awq",
                 gpu_memory_utilization: float = 0.9,
                 max_model_len: int = 8192,
                 tensor_parallel_size: int = 1):
        
        self.llm = LLM(
            model=model_name,
            quantization=quantization,  # "awq" / "gptq" / "fp8"
            gpu_memory_utilization=gpu_memory_utilization,
            max_model_len=max_model_len,
            tensor_parallel_size=tensor_parallel_size,
            dtype="float16",  # 量化时 auto
            max_num_seqs=256,  # 并发批次大小
        )
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.sampling_params = SamplingParams(
            temperature=0.7,
            max_tokens=2048,
            top_p=0.95,
        )
    
    def generate(self, 
                 images: list,  # List[PIL.Image]
                 prompt: str,
                 stop: list = None) -> str:
        """
        多模态生成
        
        Args:
            images: 输入图像列表
            prompt: 文本提示
        """
        messages = [{"role": "user", "content": [
            {"type": "text", "text": prompt},
            *[{
                "type": "image", 
                "image": img, 
                "resize": 512
            } for img in images]
        }]}
        
        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        
        # vLLM 推理
        outputs = self.llm.generate(
            prompts=[text],
            sampling_params=self.sampling_params,
            images=[images],
        )
        
        return outputs[0].outputs[0].text
```

### 12.3.4 llama.cpp GGUF 部署

```python
# llama.cpp GGUF 格式（CPU/低显存部署）
import subprocess
import json

class GGUFDeployment:
    """llama.cpp GGUF 部署"""
    
    def __init__(self, gguf_path: str, n_gpu_layers: int = -1):
        """
        gguf_path: .gguf 模型文件
        n_gpu_layers: -1 表示全量 GPU, 0 表示 CPU
        """
        self.gguf_path = gguf_path
        self.n_gpu_layers = n_gpu_layers
    
    def generate(self, prompt: str, n_ctx: int = 8192) -> str:
        """
        通过 llama.cpp CLI 生成
        
        注意：多模态需要 llama.cpp 的 multimodal 分支
        """
        cmd = [
            "llama-cli",
            "-m", self.gguf_path,
            "-p", prompt,
            "-ngl", str(self.n_gpu_layers),
            "-c", str(n_ctx),
            "-t", "8",  # 线程数
            "--top-p", "0.95",
            "--temp", "0.7",
            "--verbose",
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout
    
    def quantize(self, original_model: str, output_gguf: str,
                 quant_type: str = "Q4_K_M") -> str:
        """量化原始模型为 GGUF"""
        cmd = [
            "llama-quantize",
            original_model,
            output_gguf,
            quant_type,  # Q4_K_M / Q5_K_M / Q6_K / Q8_0
        ]
        
        subprocess.run(cmd)
        return output_gguf
```

---

## 12.4 多模态模型本地部署与显存优化

### 12.4.1 视觉编码器显存瓶颈分析

#### 视觉编码器 vs LLM 显存占比

多模态大模型的显存消耗由两部分构成：
1. **视觉编码器**（Vision Encoder / ViT / SigLIP 等）
2. **LLM 部分**（语言模型主体，transformer layers）

传统认知中，LLM 主体是显存大头。但实际上，对于多模态模型，视觉编码器的显存占用不可忽略——尤其在高分辨率、长序列场景下。

```
多模态模型显存构成分析

┌────────────────────────────────────────────────────────────────────┐
│                        Qwen2-VL-7B                                 │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ LLM 主体 (7B parameters)                                     │  │
│  │  FP16: ~14GB (params) + ~7GB (activations) = ~21GB          │  │
│  │  INT8: ~7GB (params) + ~7GB (activations) = ~14GB           │  │
│  │  INT4: ~3.5GB (params) + ~7GB (activations) = ~10.5GB       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 视觉编码器 (ViT-L/14, 307M params)                           │  │
│  │  FP16: ~0.6GB (params) + ~1.2GB (activations) = ~1.8GB     │  │
│  │  INT8: ~0.3GB (params) + ~1.2GB (activations) = ~1.5GB     │  │
│  │  INT4: ~0.15GB (params) + ~1.2GB (activations) = ~1.35GB   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 其他 (投影层 + KV Cache + 开销)                               │  │
│  │  KV Cache (8192 tokens): ~560MB × layers                     │  │
│  │  投影层: ~2.5GB                                              │  │
│  │  框架开销: ~1-2GB                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ─────────────────────────────────────────────────────────────     │
│  FP16 总计: ~23-28GB  |  INT8 总计: ~17-22GB |  INT4 总计: ~14-18GB│
│                                                                    │
│  关键发现:                                                        │
│  • 视觉编码器参数量虽小，但激活值（尤其长序列下）不可忽略           │
│  • KV Cache 随序列长度线性增长，是主要显存消耗之一                  │
│  • 量化 LLM 主体收益最大（每减少 1 位 = ~3.5GB 释放）              │
│  • 单独量化视觉编码器收益有限（~0.45GB）但可配合 LLM 量化叠加使用   │
└────────────────────────────────────────────────────────────────────┘
```

#### InternVL2 显存分析

InternVL2-26B 的显存构成更极端——LLM 部分占绝对大头：

```
InternVL2-26B 显存构成（FP16）
┌────────────────────────────────────────────────────────────┐
│  LLM 主体 (26B params):                                     │
│    FP16 params: ~52GB                                         │
│    Activations (batch=1, seq=4096): ~30GB                   │
│    KV Cache (26 layers × 4096 × 128): ~35GB                │
│    ──────────────────────────────                           │
│    LLM 小计: ~117GB                                           │
│                                                               │
│  视觉编码器 (ViT-H/14):                                       │
│    FP16 params: ~0.6GB                                        │
│    Activations (img_size=336): ~1.5GB                        │
│    ──────────────────────────────                           │
│    Vision 小计: ~2.1GB                                         │
│                                                               │
│  投影层 + 框架开销: ~8GB                                       │
│                                                               │
│  总计 (FP16): ~127GB                                          │
│  ──────────────────────────────                               │
│  量化到 INT8: ~65GB (params 减半, activations 不变)            │
│  量化到 INT4: ~38GB (params 再减半)                            │
│  ──────────────────────────────                               │
│  INT4 相对 FP16 压缩: 70%                                     │
│  LLM params 占总量: 98.5%  ← 量化 LLM 是核心                   │
└───────────────────────────────────────────────────────────────┘
```

### 12.4.2 48G VRAM 部署方案 ⭐

48GB VRAM 是一个极具性价比的部署门槛（如 RTX 4090/4090D/5090、L40S 等）。以下是针对 48GB VRAM 的具体部署方案。

#### 方案 A: Qwen2-VL INT4 量化方案（80GB → 24GB）

```
Qwen2-VL-7B 在 48GB VRAM 上的部署方案

┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  模型版本: Qwen/Qwen2-VL-7B-Instruct                                │
│  硬件: RTX 4090 (48GB VRAM)                                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ 原始 FP16 模型                                                    │ │
│  │  params: 14GB                                                     │ │
│  │  activations: 7GB                                                 │ │
│  │  KV Cache (seq=4096): 560MB × 28 = 15.7GB                       │ │
│  │  投影层: 2.5GB                                                    │ │
│  │  框架开销: 2GB                                                    │ │
│  │  ───────────────────────────────────                              │ │
│  │  总计: ~43GB ✅ (刚好 48GB 能放下，但无余量)                      │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ INT4 量化方案                                                     │ │
│  │  params: 3.5GB (7B × 0.5 bytes/param)                          │ │
│  │  activations: 7GB (INT4 计算仍需 FP16 激活)                       │ │
│  │  KV Cache (seq=4096): 15.7GB (量化后 KV 仍为 FP16)              │ │
│  │  视觉编码器 (INT4): 1.35GB                                       │ │
│  │  投影层: 0.6GB                                                   │ │
│  │  框架开销: 1GB                                                   │ │
│  │  ───────────────────────────────────                              │ │
│  │  总计: ~29.4GB ✅                                                │ │
│  │  余量: 48 - 29.4 = 18.6GB → 可支持 seq_len=8192                  │ │
│  │  seq=8192 的 KV Cache: 15.7 × 2 = 31.4GB → 需要 offload          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ 视觉编码器单独量化策略                                              │ │
│  │  视觉编码器 INT4: params=0.15GB, activations=1.2GB                │ │
│  │  相比 FP16 (0.6+1.2=1.8GB) → 节省 0.45GB                        │ │
│  │  对 48GB 总显存贡献较小，但可配合 layer-wise offload 使用           │ │
│  │                                                                    │ │
│  │  实施步骤:                                                        │ │
│  │  1. 使用 bitsandbytes 量化视觉编码器                             │ │
│  │  2. LLM 主体用 AWQ/GPTQ 量化到 INT4                             │ │
│  │  3. 联合推理时，视觉编码器加载到 GPU0，LLM 加载到 GPU0/1           │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Layer-wise Offload（逐层卸载）                                     │ │
│  │  当序列长度超过显存容量时，使用层卸载策略:                          │ │
│  │                                                                    │ │
│  │  策略 1: 视觉编码器始终在 GPU，LLM 层卸载到 CPU                     │ │
│  │    - 视觉编码器: GPU (1.8GB)                                      │ │
│  │    - LLM 前 N 层: GPU (按需)                                      │ │
│  │    - LLM 剩余层: CPU RAM (动态加载)                                │ │
│  │    - 适用: 推理速度可降级，但显存足够                              │ │
│  │                                                                    │ │
│  │  策略 2: 分层 GPU/CPU 混合                                         │ │
│  │    GPU: 视觉编码器 + LLM 前 10 层 + KV Cache                       │ │
│  │    CPU: LLM 剩余 18 层                                            │ │
│  │    显存: 8 + 2.1 + 15.7 = 25.8GB (GPU0) + 48GB (GPU1)            │ │
│  │    速度: ~5-8 tokens/s (受 PCIe 带宽限制)                          │ │
│  │                                                                    │ │
│  │  策略 3: vLLM 的 offload_enabled                                  │ │
│  │    offload_vocab=True + offload_size=8GB                          │ │
│  │    自动管理参数在 GPU/CPU 间的迁移                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│  总结: 48GB VRAM 部署 Qwen2-VL 7B 的最佳配置:                        │ │
│  • 量化精度: INT4 (AWQ)                                               │ │
│  • 序列长度: 4096 (全 GPU) / 8192 (分层 offload)                     │ │
│  • 批量大小: 1 (max)                                                  │ │
│  • 推理速度: ~30-45 tokens/s (INT4 全 GPU)                            │ │
│  ──────────────────────────────────────────────────────────────────  │
└──────────────────────────────────────────────────────────────────────┘
```

#### 方案 B: InternVL2 INT8 量化方案

```
┌─────────────────────────────────────────────────────────────────────┐
│                     InternVL2 系列在 48GB VRAM 上的部署               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-2B (小模型，可直接部署)                               │  │
│  │  FP16 显存: ~6GB (params) + ~4GB (activations) = ~10GB       │  │
│  │  ✅ 48GB VRAM 轻松部署，seq_len 可达 8192                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-8B                                                  │  │
│  │  FP16: ~16GB (params) + ~8GB (act) + ~20GB (KV) = ~44GB     │  │
│  │  INT8: ~8GB (params) + ~8GB (act) + ~20GB (KV) = ~36GB      │  │
│  │  INT4: ~4GB (params) + ~8GB (act) + ~20GB (KV) = ~32GB      │  │
│  │  ✅ 48GB VRAM 可部署 INT8/INT4                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-26B (大模型，需要分层策略)                            │  │
│  │  FP16: ~127GB ❌ 远超 48GB                                    │  │
│  │  INT8: ~65GB ❌ 仍需 offload                                  │  │
│  │  INT4: ~38GB ✅ + 3.5GB (vision) + 2.5GB (其他) = ~44GB      │  │
│  │  ✅ 48GB VRAM 可部署 INT4 版本（接近极限）                    │  │
│  │                                                                   │  │
│  │  实施:                                                          │  │
│  │  1. AWQ 量化 LLM 主体到 INT4                                   │  │
│  │  2. 视觉编码器单独 INT4 量化                                   │  │
│  │  3. 使用 vLLM + offload_vocab=True                             │  │
│  │  4. 序列长度限制在 2048 (节省 KV Cache 显存)                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-40B (超大模型)                                      │  │
│  │  INT4: ~55GB + vision + 其他 = ~60GB ❌ 48GB 不够              │  │
│  │  解决方案: 2×GPU 并行 (2×48GB = 96GB)                         │  │
│  │  或: CPU offload (速度大幅下降)                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

#### 方案 C: 多卡并行策略

```
┌──────────────────────────────────────────────────────────────────────┐
│                  多卡并行部署方案（2×48GB）                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Tensor Parallel (张量并行)                                     │  │
│  │                                                               │  │
│  │  GPU0: Qwen2-VL 7B 的前 14 层 + 视觉编码器                    │  │
│  │  GPU1: Qwen2-VL 7B 的后 14 层                                 │  │
│  │                                                               │  │
│  │  显存分配:                                                    │  │
│  │  GPU0: 视觉(1.8GB) + 前14层(7GB) + KV(15GB) + 框架(2GB)     │  │
│  │        = ~25.8GB (48GB 的 54%)                                │  │
│  │  GPU1: 后14层(7GB) + KV(15GB) + 同步开销(3GB) = ~25GB        │  │
│  │        (48GB 的 52%)                                           │  │
│  │                                                               │  │
│  │  优势: 双卡各占显存 ~50%，支持 seq_len=8192                    │  │
│  │  速度: ~60-80 tokens/s (双卡推理，TensorRT-LLM 加速)           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Pipeline Parallel (流水线并行)                                 │  │
│  │                                                               │  │
│  │  GPU0: 视觉编码器 + 嵌入层 + 前 10 层                          │  │
│  │  GPU1: 后 18 层 + 输出层                                       │  │
│  │                                                               │  │
│  │  显存分配:                                                    │  │
│  │  GPU0: 视觉(1.8GB) + 前10层(5GB) + KV(10GB) = ~17GB          │  │
│  │  GPU1: 后18层(9GB) + KV(10GB) = ~19GB                         │  │
│  │                                                               │  │
│  │  优势: 各卡显存更均衡                                         │  │
│  │  速度: ~50-70 tokens/s (流水线有气泡)                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 推荐: 对于 7B 模型，单卡 INT4 即可                             │  │
│  │       对于 8-26B 模型，双卡 Tensor Parallel 更合适             │  │
│  │       对于 40B+ 模型，需要 2×GPU 或 CPU offload                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

#### 对比表：各模型在不同量化精度下的显存占用与推理速度

| 模型 | FP16 显存 | INT8 显存 | INT4 显存 | INT4 @ 48GB | INT4 @ 2×48GB | INT4 推理速度(tokens/s) |
|------|----------|----------|----------|------------|-------------|----------------------|
| **Qwen2-VL-2B** | 6GB | 3.5GB | 2GB | ✅ 全 GPU | — | 80-120 |
| **Qwen2-VL-7B** | 43GB | 28GB | **29.4GB** | ✅ 全 GPU (seq=4096) | — | 30-45 |
| **Qwen2-VL-7B** | 43GB | 28GB | 29.4GB | ✅ 全 GPU (seq=8192, offload) | — | 15-25 |
| **InternVL2-2B** | 10GB | 6GB | 4GB | ✅ 全 GPU (seq=8192) | — | 100-150 |
| **InternVL2-8B** | 44GB | 36GB | **32GB** | ✅ 全 GPU (seq=4096) | — | 25-40 |
| **InternVL2-26B** | 127GB | 65GB | **44GB** | ⚠️ 接近极限 | ✅ 全 GPU | 10-15 |
| **InternVL2-40B** | 180GB | 95GB | **60GB** | ❌ 需 offload | ✅ 全 GPU | 8-12 |
| **Qwen2.5-72B** | 144GB | 72GB | 40GB | ⚠️ + offload | ✅ 2×GPU | 15-20 |

> **48GB VRAM 部署推荐方案总结：**
> - **Qwen2-VL-7B INT4** → 单卡 48GB 全 GPU（最佳性价比）
> - **InternVL2-8B INT4** → 单卡 48GB 全 GPU
> - **InternVL2-26B INT4** → 单卡 48GB 接近极限（需限制 seq_len）或 2×GPU
> - **Qwen2.5-72B INT4** → 2×48GB Tensor Parallel + offload

### 12.4.3 多模态模型量化指南

```
┌──────────────────────────────────────────────────────────────────────┐
│                    多模态模型量化完整指南                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 量化流程:                                                       │  │
│  │                                                               │  │
│  │  1. 视觉编码器量化                                              │  │
│  │     • 使用 bitsandbytes 的 quantize_accelerator()               │  │
│  │     • 或使用 AWQ 的 AutoAWQ 量化 ViT 层                        │  │
│  │     • INT4 量化 ViT: ~0.15GB vs FP16: ~0.6GB                  │  │
│  │                                                               │  │
│  │  2. LLM 部分量化                                              │  │
│  │     • AWQ (推荐): 使用 32 条校准数据，per-channel INT4         │  │
│  │     • GPTQ: 使用 128 条校准数据，每层独立量化                   │  │
│  │     • FP8: 使用 H100 的 native FP8 tensor core                 │  │
│  │                                                               │  │
│  │  3. 量化后精度评估                                              │  │
│  │     • MMLU / C-Eval 分数保持 > 原始 95%                        │  │
│  │     • CLIP score 保持 > 0.95                                   │  │
│  │     • OCR 幻觉率增加 < 2%                                       │  │
│  │                                                               │  │
│  │  4. 部署验证                                                    │  │
│  │     • 端到端延迟测试                                            │  │
│  │     • 显存峰值测试                                              │  │
│  │     • 多模态输出质量测试                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ AWQ 量化示例代码                                                │  │
│  │                                                               │  │
│  │  from awq import AutoAWQForCausalLM                           │  │
│  │  from transformers import AutoTokenizer                       │  │
│  │                                                               │  │
│  │  model_path = "Qwen/Qwen2-VL-7B-Instruct"                    │  │
│  │  awq_model = AutoAWQForCausalLM.from_pretrained(model_path)  │  │
│  │  tokenizer = AutoTokenizer.from_pretrained(model_path)       │  │
│  │                                                               │  │
│  │  # 校准数据（32 条真实查询）                                   │  │
│  │  calibration_data = [                                         │  │
│  │      "描述这张医疗影像的关键发现",                              │  │
│  │      "合同中关于违约责任的具体条款",                             │  │
│  │      "这份财报中营收同比增长多少？",                            │  │
│  │      # ... 更多校准样本                                        │  │
│  │  ]                                                            │  │
│  │                                                               │  │
│  │  # AWQ 量化到 INT4                                             │  │
│  │  q_config = {                                                 │  │
│  │      "zero_point": True,                                      │  │
│  │      "prev_layer_num": 3,                                     │  │
│  │      "group_size": 128,                                       │  │
│  │  }                                                            │  │
│  │                                                               │  │
│  │  awq_model.quantize(                                         │  │
│  │      tokenizer,                                             │  │
│  │      quant_config=q_config,                                  │  │
│  │      calib_data=calibration_data,                            │  │
│  │  )                                                            │  │
│  │                                                               │  │
│  │  awq_model.save_quantized("qwen2-vl-7b-int4-awq")            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 量化后精度评估方法                                              │  │
│  │                                                               │  │
│  │  1. MMLU 分数对比                                              │  │
│  │  2. 多模态评估 (MME / SEED-Bench)                              │  │
│  │  3. OCR 还原准确率测试                                         │  │
│  │  4. 表格还原准确率测试                                         │  │
│  │  5. 图表数据还原误差                                           │  │
│  │  6. 幻觉率测试                                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 量化精度选择建议                                                │  │
│  │                                                               │  │
│  │  • FP16: 生产环境首选，精度无损失                              │  │
│  │  • INT8: 显存紧张但可接受精度损失 < 1%                         │  │
│  │  • AWQ INT4: 显存极度紧张，精度损失 2-3%                       │  │
│  │  • NF4: 端侧/极低显存场景，精度损失 3-5%                        │  │
│  │  • FP8: H100/A100 硬件支持，性价比最优                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 12.5 存储优化

### 12.5.1 向量索引压缩

| 压缩技术 | 压缩率 | 精度损失 | 查询加速 | 适用场景 |
|---------|-------|---------|---------|---------|
| PQ (Product Quantization) | 64-128x | 1-3% | 2-5x | 大规模向量库 |
| SQ (Scalar Quantization) | 8x | <1% | 1.5x | 通用场景 |
| HNSW 索引压缩 | 2-4x | <0.5% | 1-2x | 近似最近邻 |
| IVF 索引 | 4-8x | 1-2% | 3-10x | 亿级向量 |
| 浮点量化 (FP16→INT8) | 2x | <1% | 1.5-2x | 所有场景 |
| 向量量化 (Float→INT4) | 4x | 1-3% | 2-4x | 显存受限场景 |

### 12.5.2 多模态数据冷热分层

```
┌────────────────────────────────────────────────────────────────────┐
│                   多模态数据冷热分层架构                            │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 热数据 (Hot, 最近 30 天)                                       │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │ GPU 内存 / NVMe SSD                                    │   │  │
│  │  │ • 高频查询的 chunk 嵌入                                 │   │  │
│  │  │ • 最近上传的文档块                                     │   │  │
│  │  │ • 热门产品/病例/合同                                    │   │  │
│  │  │ 存储: Redis + Milvus GPU Index                          │   │  │
│  │  │ 容量: ~100K 向量 (~500MB)                              │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │ 温数据 (Warm, 30-180 天)                               │   │  │
│  │  │ • SSD / HDD                                            │   │  │
│  │  │ • 标准查询频率                                          │   │  │
│  │  │ 存储: Milvus HDD Index + Elasticsearch                  │   │  │
│  │  │ 容量: ~10M 向量 (~50GB)                                │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │ 冷数据 (Cold, >180 天)                                 │   │  │
│  │  │ • 对象存储 (S3/OSS/MinIO)                               │   │  │
│  │  │ • 索引压缩存储 (PQ + Parquet)                          │   │  │
│  │  │ • 原始图像/文档保留在对象存储                            │   │  │
│  │  │ 存储: S3 + 压缩向量索引                                 │   │  │
│  │  │ 容量: ~100M+ 向量 (~500GB)                             │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  数据迁移策略:                                                      │  │
│  • 热→温: 自动降权查询频率 < 1/day                                  │  │
│  • 温→冷: 查询频率 < 1/week + TTL 到期                             │  │
│  • 冷→热: 查询时动态加载 + 重建缓存                                  │  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 12.6 系统级优化

### 12.6.1 流式检索与生成

```
┌────────────────────────────────────────────────────────────────────┐
│                   流式检索与生成架构                                 │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  传统管线 (阻塞式):                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ 检索完成 │ →│ 组装    │ →│ 生成    │ →│ 输出    │                │
│  │ 100%    │  │ Prompt  │  │ 100%    │  │ 100%    │                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                    │
│  流式管线:                                                        │
│  ┌─────────┐ ┌───────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ 检索    │ →│ 部分  │ →│ 部分    │ →│ 生成    │ →│ 流式   │     │
│  │ chunk 1 │  │ Prompt│  │ Prompt  │  │ Token 1 │  │ 输出    │     │
│  └─────────┘ └───────┘ └─────────┘ └─────────┘ └─────────┘     │
│         │         │         │                                        │
│  ┌─────────┐ ┌───────┐ ┌─────────┐ ┌─────────┐                   │
│  │ 检索    │ →│ 更多  │ →│ 更多    │ →│ 生成    │                   │
│  │ chunk 2 │  │ Prompt│  │ Prompt  │  │ Token 2 │                   │
│  └─────────┘ └───────┘ └─────────┘ └─────────┘                   │
│                                                                    │
│  TTFT 从 ~3.5s 降到 ~500ms (仅等待检索 chunk 1)                    │
└────────────────────────────────────────────────────────────────────┘
```

```python
import asyncio
import queue
from typing import AsyncIterator

async def streaming_multimodal_rag(query: str, k: int = 5) -> AsyncIterator[str]:
    """
    流式 Multimodal RAG 查询
    
    Yield: 逐个 token 输出
    """
    # 1. 异步检索 chunk 1（立即开始发送）
    chunk_queue = queue.Queue()
    
    async def retrieve_chunks():
        for i in range(k):
            chunk = await rag_system.retrieve_chunk(i)  # 逐个检索
            chunk_queue.put_nowait(chunk)
    
    # 启动检索协程
    asyncio.create_task(retrieve_chunks())
    
    # 2. 流式组装 Prompt 和生成
    prompt_parts = []
    
    # 获取 chunk 1 后立即开始组装和生成
    if chunk_queue.get_nowait():
        prompt_parts.append(chunk["text"])
    
    # 生成器启动（TTFT 最小化）
    stream = await llm_engine.stream_generate(
        prompt="".join(prompt_parts),
        images=chunk.get("images", []),
    )
    
    async for token in stream:
        yield token  # 立即输出
    
    # 3. 后续 chunk 的增量更新（可选）
    while not chunk_queue.empty():
        chunk = chunk_queue.get_nowait()
        # 如果用户等待，可以追加信息
        if chunk.get("images"):
            yield f"\n\n![image]({chunk['image_url']})"
```

### 12.6.2 异步处理与并行 Pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│                   异步并行 Pipeline 架构                            │
├────────────────────────────────────────────────────────────────────┘
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  查询请求                                                     │  │
│  └────────────┬─────────────────────────────────────────────────┘  │
│               │                                                      │
│         ┌─────▼─────┐                                               │
│         │ 路由/调度  │                                               │
│         └─────┬─────┘                                               │
│               │                                                      │
│    ┌──────────┼──────────┐                                          │
│    │          │          │                                          │
│    ▼          ▼          ▼                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐                                    │
│ │ OCR  │ │ 文本  │ │ 表格  │  ← 并行预处理                       │
│ │ 处理  │ │ 编码  │ │ 解析  │                                    │
│ └───┬──┘ └───┬──┘ └───┬──┘                                          │
│     │        │        │                                          │
│     └────────┼────────┘                                          │
│              ▼                                                   │
│     ┌─────────────┐                                               │
│     │ 嵌入融合     │ ← 合并多模态嵌入                             │
│     └─────────────┘                                               │
│              │                                                      │
│              ▼                                                     │
│     ┌─────────────┐                                               │
│     │ 向量检索     │                                               │
│     └─────────────┘                                               │
│              │                                                      │
│              ▼                                                     │
│     ┌─────────────┐                                               │
│     │ 重排         │                                               │
│     └─────────────┘                                               │
│              │                                                      │
│              ▼                                                     │
│     ┌─────────────┐                                               │
│     │ 生成         │                                               │
│     └─────────────┘                                               │
│              │                                                      │
│              ▼                                                     │
│     ┌─────────────┐                                               │
│     │ 后处理/渲染  │                                               │
│     └─────────────┘                                               │
│                                                                    │
│  关键优化点:                                                        │  │
│  • OCR + 文本编码 + 表格解析并行执行（减少 40% 预处理时间）          │
│  • 检索结果可异步并行加载多模态资源（图像/表格）                     │
│  • 流式输出从生成开始即可返回，无需等待全部检索完成                    │
└────────────────────────────────────────────────────────────────────┘
```

---

# 第 13 章 选型指南与决策树

## 13.1 多模态 RAG 整体选型框架

### 从场景到架构的完整决策路径

```
                            ┌─────────────┐
                            │  场景确定    │
                            │ (输入输出)   │
                            └──────┬──────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 多模态类型需求?              │
                    │ ┌─────────────────────────┐ │
                    │ │ 纯文本 RAG 即可?         │ │
                    │ │ → 用传统 RAG (LangChain) │ │
                    │ │                         │ │
                    │ │ 需要图像?                │ │
                    │ │ → 进入 CLIP 管线         │ │
                    │ │                         │ │
                    │ │ 需要表格/图表?            │ │
                    │ │ → 进入 LayoutAnalysis    │ │
                    │ │                         │ │
                    │ │ 需要视频/音频?            │ │
                    │ │ → 进入 Audio/Video 管线  │ │
                    │ └─────────────────────────┘ │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 数据规模?                    │
                    │ ┌─────────────────────────┐ │
                    │ │ < 10K chunk              │ │
                    │ │ → FAISS / ChromaDB       │ │
                    │ │                         │ │
                    │ │ 10K - 1M chunk           │ │
                    │ │ → Milvus / Qdrant        │ │
                    │ │                         │ │
                    │ │ > 1M chunk               │ │
                    │ │ → Milvus Cluster /       │ │
                    │ │   Weaviate / Zilliz      │ │
                    │ └─────────────────────────┘ │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 部署环境?                    │
                    │ ┌─────────────────────────┐ │
                    │ │ 云 API (不自建)           │ │
                    │ │ → OpenAI CLIP + GPT-4o   │ │
                    │ │                         │ │
                    │ │ 本地部署 (GPU)             │ │
                    │ │ → Qwen2-VL + Milvus      │ │
                    │ │                         │ │
                    │ │ 本地部署 (CPU 无 GPU)      │ │
                    │ │ → BGE-M3 + Chroma +      │ │
                    │ │   llama.cpp GGUF          │ │
                    │ └─────────────────────────┘ │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 延迟要求?                     │
                    │ ┌─────────────────────────┐ │
                    │ │ < 1s (实时)               │ │
                    │ │ → 缓存 + 流式 + 小模型     │ │
                    │ │                         │ │
                    │ │ 1-5s (可接受)             │ │
                    │ │ → 标准管线                │ │
                    │ │                         │ │
                    │ │ > 5s (离线)               │ │
                    │ │ → 重排 + 大模型           │ │
                    │ └─────────────────────────┘ │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 预算?                        │
                    │ ┌─────────────────────────┐ │
                    │ │ 无/低预算                  │ │
                    │ │ → 开源栈 (bge + milvus   │ │
                    │ │   + qwen2-vl)              │ │
                    │ │                         │ │
                    │ │ 中等预算                    │ │
                    │ │ → 混合 (开源 + 付费 API)   │ │
                    │ │                         │ │
                    │ │ 高预算                     │ │
                    │ │ → 全商业方案 (OpenAI +     │ │
                    │ │   Pinecone + GPT-4o)       │ │
                    │ └─────────────────────────┘ │
                    └──────────────┬──────────────┘
                                   │
                              ┌────▼────┐
                              │ 架构确定 │
                              └─────────┘
```

---

## 13.2 嵌入模型选型指南

```
┌──────────────────────────────────────────────────────────────────────┐
│                   嵌入模型选型决策树                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  开始                                                                 │
│   │                                                                  │
│   ├── 需要跨模态（图像↔文本）检索？                                  │
│   │  ├── 是 → CLIP 系列                                              │
│   │  │     ├── 追求精度 → CLIP-ViT-L/14 (768D)                      │
│   │  │     ├── 追求速度 → OpenAI text-embedding-3-small              │
│   │  │     └── 多语言 → LaBSE / m3e-multilingual                    │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要中文优化？                                                │
│   │  ├── 是 → BGE-M3 / M3E                                           │
│   │  │     ├── 通用中文 → BGE-M3 (1024D)                            │
│   │  │     └── 轻量级 → BGE-base-zh (768D)                          │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要表格/代码/数学嵌入？                                       │
│   │  ├── 是 → CodeBERT / Table2Vec / ChartBert                      │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要低显存部署？                                              │
│   │  ├── 是 → BGE-small / M3E-small (INT4)                         │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   └── 最终选择:                                                     │
│       ├── 纯文本 + 中文 → BGE-M3                                    │
│       ├── 多模态 (图像↔文本) → CLIP-ViT-L/14                         │
│       ├── 表格专用 → Table2Vec / TableFormer                          │
│       ├── 代码/公式 → CodeBERT / MathBERT                           │
│       └── 轻量级 → BGE-small-zh / m3e-base                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 13.3 向量数据库选型指南

```
┌──────────────────────────────────────────────────────────────────────┐
│                   向量数据库选型决策树                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  开始                                                                 │
│   │                                                                  │
│   ├── 数据规模?                                                      │
│   │  ├── < 100K 向量 → Chroma / FAISS                              │
│   │  ├── 100K - 10M 向量 → Milvus / Qdrant                         │
│   │  ├── 10M - 100M 向量 → Milvus Cluster / Zilliz Cloud           │
│   │  └── > 100M 向量 → Weaviate / Qdrant Cluster                   │
│   │                                                                  │
│   ├── 需要多模态混合检索？(向量 + 全文)                              │
│   │  ├── 是 → Milvus (Hybrid Search) / Elasticsearch                │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要过滤/标量字段检索？                                        │
│   │  ├── 是 → Milvus / Pinecone / Weaviate                         │
│   │  └── 否 → FAISS 即可                                             │
│   │                                                                  │
│   ├── 需要云托管?                                                    │
│   │  ├── 是 → Pinecone / Zilliz Cloud / Qdrant Cloud               │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要分布式/集群?                                               │
│   │  ├── 是 → Milvus Cluster / Weaviate Cluster                    │
│   │  └── 否 → 单机即可                                               │
│   │                                                                  │
│   └── 最终选择:                                                     │
│       ├── 小数据 + 简单 → Chroma                                    │
│       ├── 中等 + 需要过滤 → Milvus                                  │
│       ├── 云托管 → Pinecone / Zilliz                                │
│       ├── 企业级 → Milvus Cluster / Weaviate Cluster                │
│       └── 全文混合 → Elasticsearch +向量插件                         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 13.4 多模态 LLM 选型指南

```
┌──────────────────────────────────────────────────────────────────────┐
│                   多模态 LLM 选型决策树                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  开始                                                                 │
│   │                                                                  │
│   ├── 部署环境?                                                      │
│   │  ├── 纯云 API → GPT-4o / Claude Sonnet 3.5 / Gemini 2.0        │
│   │  ├── 本地 GPU (≥24GB) → Qwen2-VL-7B / InternVL2-8B             │
│   │  ├── 本地 GPU (≥48GB) → Qwen2-VL-7B INT4 / InternVL2-26B INT4  │
│   │  └── CPU/低显存 → llama.cpp GGUF (Qwen2.5)                     │
│   │                                                                  │
│   ├── 需要图表数据提取？                                            │
│   │  ├── 是 → Qwen2-VL (ChartBert 集成) / InternVL2                │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要 OCR 能力？                                               │
│   │  ├── 是 → Qwen2-VL (内置 OCR) / InternVL2                      │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 需要表格还原？                                                │
│   │  ├── 是 → Qwen2-VL / InternVL2                                 │
│   │  └── 否 → 进入下一步                                             │
│   │                                                                  │
│   ├── 推理速度要求？                                                │
│   │  ├── < 5s (实时) → Qwen2-VL-2B / GPT-4o-mini                   │
│   │  ├── 5-15s (标准) → Qwen2-VL-7B / InternVL2-8B                 │
│   │  └── > 15s (可接受) → InternVL2-26B / Qwen2-VL-72B             │
│   │                                                                  │
│   └── 最终选择:                                                     │
│       ├── 云 API 首选 → GPT-4o / Claude Sonnet 3.5                  │
│       ├── 本地 1GPU → Qwen2-VL-7B (INT4)                           │
│       ├── 本地 2GPU → InternVL2-26B (INT4)                          │
│       ├── 极致速度 → Qwen2-VL-2B                                    │
│       └── 极致精度 → InternVL2-26B / Qwen2-VL-72B                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 13.5 技术栈组合推荐

| 场景 | 推荐嵌入 | 推荐向量库 | 推荐 LLM | 推荐框架 | OCR | 备注 |
|------|---------|-----------|---------|---------|-----|------|
| **医疗影像** | MedCLIP / CLIP-ViT-L | Milvus | Qwen2-VL-7B INT4 | vLLM | PaddleOCR | HIPAA 合规 |
| **企业合同** | BGE-M3 | Milvus + ES | GPT-4o / Qwen2-VL | LangChain + LlamaParse | PaddleOCR + Mathpix | 条款级检索 |
| **产品目录** | CLIP-ViT-L | Milvus + Redis | GPT-4o-mini | LlamaIndex | PaddleOCR | 高并发 |
| **金融研报** | ChartBert + BGE | Milvus + Neo4j | Qwen2-VL-7B | 自研 | PaddleOCR + Mathpix | 图表还原优先 |
| **教育课件** | m3e-multilingual | Elasticsearch | Qwen2-VL-7B | LlamaIndex | Mathpix + PaddleOCR | 公式解析 |
| **通用轻量** | BGE-M3 | Chroma | Qwen2-VL-2B | LangChain | PaddleOCR | 快速部署 |
| **云 API** | text-emb-3 | Pinecone | GPT-4o | OpenAI SDK | GPT-4o 内建 | 零运维 |
| **本地全栈** | BGE-M3 + CLIP | Milvus | Qwen2-VL-7B | vLLM | PaddleOCR | 全本地 |

---

## 13.6 常见陷阱与避坑指南

### 陷阱 1: OCR 幻觉陷阱

```
问题: OCR 将 "; " 误识别为 ": "，将 "1, 234" 误识别为 "1,234"
影响: 金融数据错误 → 投资决策失误
避免策略:
  • OCR + LLM 双重验证 (见 10.4.3)
  • OCR 置信度阈值 ≥ 0.85 才入库
  • 关键数值字段使用多引擎交叉验证
```

### 陷阱 2: 嵌入空间不一致

```
问题: 文本嵌入来自 BGE-M3，图像嵌入来自 CLIP-ViT-L，无法直接比较相似度
影响: 跨模态检索完全失效
避免策略:
  • 使用同一模型的 image/text 编码器（如 CLIP 全家桶）
  • 或使用 CLIP-like 对齐空间（Laion-CLIP, SigLIP）
  • 跨空间对齐: 使用 LLM 生成文本描述再嵌入
```

### 陷阱 3: 向量维度爆炸

```
问题: 多模态 chunk 嵌入维度从 768 → 4096 → 10240+
影响: 存储成本 × 检索延迟 × 缓存命中率下降
避免策略:
  • 使用 PCA/UMAP 压缩到合理维度（512-1024）
  • 不同模态用不同维度：图像 768，文本 1024
  • 定期清理低质量低质量向量
```

### 陷阱 4: 多模态 LLM 幻觉放大效应

```
问题: LLM 在"看到"错误 OCR 结果后，幻觉生成更"合理"的虚假内容
影响: 错误答案看起来更可信（因为语言流畅）
避免策略:
  • OCR 幻觉检测 (见 10.4)
  • LLM 输出引用强制验证
  • 多模态一致性检查（文本描述 ↔ 图像内容）
```

### 陷阱 5: Chunking 不当

```
问题: 将多模态文档（图文混排）简单按字符切分
影响: 失去版面语义，表格行/列关系被切割，图像-文本关联丢失
避免策略:
  • 使用 Layout Analysis 先识别 chunk 边界
  • 图像和文字分别 chunk，再通过 metadata 关联
  • 表格保持完整 chunk（不切分）
```

### 陷阱 6: Layout Analysis 缺失

```
问题: 对扫描 PDF 不做版面分析，直接 OCR 全文
影响: 页眉/页脚/边注/图注混入正文，检索结果噪声大
避免策略:
  • LayoutLMv3 / DocLayout-YOLO 做版面分析
  • 识别 text/table/chart/image/title/annotation 区域
  • 每种区域用不同的 chunk 策略
```

### 避坑 Checklist

```
□ OCR 是否使用双重验证？
□ 嵌入空间是否一致？
□ 向量维度是否可控？
□ Chunking 是否基于版面分析？
□ 是否有 OCR 幻觉检测？
□ 是否有查询缓存？
□ 是否有 HNSW 参数基准测试？
□ 是否有量化后精度验证？
□ 多模态 chunk 的 metadata 是否完整？
□ 向量数据库是否有 TTL + 冷热分层？
□ 是否有端到端延迟监控？
□ 是否有成本估算？
```

---

> 生成时间：2026-04-28 · 版本 1.0
