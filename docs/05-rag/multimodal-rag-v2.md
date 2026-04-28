# Multimodal RAG 技术文档（v2）

> 目标读者：架构师、ML 工程师、RAG 开发者
> 写作风格：技术解析 + 架构图 + 代码示例 + 对比表 + 选型决策树

---

# 第 1 章 概述与演进

## 1.1 为什么需要多模态 RAG

### 1.1.1 纯文本 RAG 的局限性

传统 RAG（Retrieval-Augmented Generation）以文本为核心，其处理管线为：

```
原始数据 → 文本切片 → 文本嵌入 → 向量检索 → Prompt 拼接 → LLM 生成
```

该管线在面对以下场景时存在根本性缺陷：

| 局限维度 | 纯文本 RAG | 问题表现 |
|---------|-----------|---------|
| 非文本文档 | 无法直接处理 | PDF 中的图表需先 OCR，丢失布局语义 |
| 结构化数据 | 需额外 ETL | 表格行/列关系在切片中破碎 |
| 视觉推理 | 无能力 | 架构图、流程图、UI 截图无法被检索 |
| 音频/视频 | 完全盲区 | 会议录音、培训视频无法利用 |
| 跨模态查询 | 不支持 | "找那张显示 Q3 营收的柱状图" 无法执行 |

**核心问题**：纯文本 RAG 将多模态数据强行压缩为文本，导致 **信息损失不可逆**。例如：

- 一张技术架构图包含节点连接关系、颜色编码、空间布局——OCR 后只剩散落的文字
- 表格的行列关系在文本切片中被切割，`row_span=3` 的合并单元格在纯文本中失去意义
- 视频帧的时序上下文在音频转录中完全丢失

### 1.1.2 企业知识库多模态数据占比

根据 Gartner 2025 年企业数据调研报告，企业非结构化数据分布：

```
数据模态           占比        增长速度 (YoY)
─────────────────────────────────────────────
文本文档              38%         +5%
表格/Spreadsheet      22%        +12%
图像/截图              12%        +18%
PDF (混合)             8%        +15%
视频/会议录制          11%        +25%
音频/语音              6%        +20%
图表/流程图            3%        +10%

总计：多模态数据占比 ≈ 62%（含 PDF 中的非文本元素）
```

**关键洞察**：超过 60% 的企业知识存在于非纯文本形式中。传统 RAG 只能处理 38%，意味着 **62% 的知识资产被完全忽略**。

### 1.1.3 典型应用场景

| 场景 | 多模态需求 | 纯文本 RAG 效果 | 多模态 RAG 效果 |
|------|-----------|----------------|----------------|
| 售后技术支持 | 需要查看产品截图/视频 | ❌ 只能匹配文档段落 | ✅ 直接返回错误排查图 |
| 医疗影像检索 | CT/MRI 图像+报告 | ❌ 丢失影像信息 | ✅ 图文联合检索 |
| 金融研报分析 | 图表+表格+正文 | ❌ 表格数据丢失 | ✅ 图表数据可查询 |
| 法律合同审查 | 扫描件+印章+签名 | ❌ 扫描件模糊 | ✅ OCR + 版面还原 |
| 产品知识问答 | 3D 模型/装配图 | ❌ 无法处理 | ✅ 图像检索+标注 |
| 培训知识检索 | 视频课程+字幕+PPT | ❌ 仅利用字幕 | ✅ 关键帧+字幕联合 |
| 设计稿评审 | Figma/PSD 截图对比 | ❌ 无法匹配 | ✅ 图像相似度检索 |

---

## 1.2 多模态 RAG 与传统 RAG 对比

### 1.2.1 架构对比图

**传统 RAG 架构：**

```
┌─────────────────────────────────────────────────────────┐
│                    传统 RAG Pipeline                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐          │
│  │  文本数据 │───→│ 文本切片 │───→│ 文本嵌入  │          │
│  │ (docs,  │    │ (chunk)  │    │ (Text2Vec)│          │
│  │  txt,md)│    └──────────┘    └─────┬─────┘          │
│  └─────────┘                          │                 │
│         被过滤掉:                     │                 │
│   • 图像/截图  ──→  ❌               │                 │
│   • 表格  ──→  破碎  ──→  ❌          │                 │
│   • 图表  ──→  OCR 丢失布局 ──→ ❌    │                 │
│   • 视频帧  ──→  ❌                  │                 │
│   • 音频  ──→  仅字幕 ──→  ❌         │                 │
│                                  ┌────▼────┐           │
│                                  │ 向量索引  │           │
│                                  │ (FAISS/  │           │
│                                  │ Milvus)  │           │
│                                  └────┬────┘           │
│                                       │                 │
│  ┌───────────┐    ┌──────────┐    ┌─▼────────┐        │
│  │ 用户查询   │───→│ 文本嵌入  │───→│ Top-K 检索 │        │
│  │ (text)    │    │ (Text2Vec)│    └─────┬────┘        │
│  └───────────┘    └──────────┘          │              │
│                                      ┌────▼────┐        │
│                                      │ LLM 生成 │        │
│                                      │ 纯文本   │        │
│                                      └─────────┘        │
└─────────────────────────────────────────────────────────┘
```

**多模态 RAG 架构：**

```
┌─────────────────────────────────────────────────────────────────┐
│                   多模态 RAG Pipeline                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────┐   ┌────────────┐   ┌──────────────┐            │
│  │ 文本数据    │──→│ 文本嵌入    │──→│ 文本向量索引  │            │
│  │ (txt,md)  │   │ (Text2Vec) │   │ (FAISS/Milvus)│            │
│  └───────────┘   └────────────┘   └──────┬───────┘            │
│                                           │                    │
│  ┌───────────┐   ┌────────────┐          │                    │
│  │ 图像数据    │──→│ 图像嵌入    │          │                    │
│  │ (img,png) │   │ (CLIP等)   │          │                    │
│  └───────────┘   └────────────┘          │                    │
│                                           │                    │
│  ┌───────────┐   ┌────────────┐   ┌──────▼───────┐            │
│  │ 表格数据    │──→│ 表格嵌入    │──→│ 表格向量索引  │            │
│  │ (tab,html)│   │ (Tab2Vec)  │   │ (专用索引器)  │            │
│  └───────────┘   └────────────┘   └──────────────┘            │
│                                                                 │
│  ┌───────────┐   ┌────────────┐   ┌──────────────┐            │
│  │ 视频数据    │──→│ 帧嵌入+时序 │──→│ 视频向量索引  │            │
│  │ (mp4,avi) │   │ (VideoCLIP)│   │ (时序索引)   │            │
│  └───────────┘   └────────────┘   └──────────────┘            │
│                                                                 │
│  ┌───────────┐   ┌────────────┐   ┌──────────────┐            │
│  │ 音频数据    │──→│ 音频嵌入    │──→│ 音频向量索引  │            │
│  │ (wav,mp3) │   │ (wav2vec2) │   │ (音频索引)   │            │
│  └───────────┘   └────────────┘   └──────────────┘            │
│                                                                 │
│                      ┌────────────────────┐                     │
│                      │   跨模态对齐层       │                     │
│                      │ (Unified Embedding   │                     │
│                      │  Space via CLIP-style)│                    │
│                      └────────┬───────────┘                     │
│                               │                                  │
│  ┌───────────┐   ┌───────────▼───────────┐                     │
│  │ 多模态查询  │──→│ 多模态嵌入 + 跨模态检索 │                     │
│  │ (text/img/ │   │ (Cross-Modal Retrieval)│                    │
│  │  video)   │   └───────────┬───────────┘                     │
│  └───────────┘               │                                  │
│                        ┌──────▼──────┐                          │
│                        │ 结果融合层   │                          │
│                        │ (Reranker + │                          │
│                        │  Re-Rank)   │                          │
│                        └──────┬──────┘                          │
│                               │                                  │
│                        ┌──────▼──────┐                          │
│                        │  多模态 LLM  │                          │
│                        │ (GPT-4o/     │                          │
│                        │  Qwen2.5-VL) │                          │
│                        └─────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2.2 核心维度对比表

| 对比维度 | 传统 RAG | 多模态 RAG | 差异说明 |
|---------|---------|-----------|---------|
| **数据源** | 纯文本（txt/md/pdf-text） | 文本/图像/PDF(混合)/表格/视频/音频 | 多模态覆盖 62%+ 企业数据 |
| **嵌入空间** | 单一向量空间 (R^{768}) | 跨模态统一空间 (CLIP-style) | 图像和文本共享语义空间 |
| **检索策略** | 余弦相似度 (dense) | 多模态相似度 + 稀疏检索 + 结构化查询 | 联合检索策略 |
| **Chunking** | 固定长度文本切片 | 多模态感知切片（按语义块） | 保持跨模态关联 |
| **索引结构** | 单一向量索引 | 多索引（向量+倒排+图） | 针对不同模态优化 |
| **响应格式** | 纯文本 | 文本+图像+表格+代码块 | 富格式输出 |
| **延迟要求** | < 2s (P99) | < 5s (P99) | 多模态推理开销更大 |
| **召回率** | 对非文本数据为 0 | 60%+ 覆盖率 | 知识利用率差异巨大 |
| **实现复杂度** | ⭐⭐ | ⭐⭐⭐⭐ | 管线复杂度指数级上升 |
| **存储成本** | 低 (仅向量) | 中-高 (向量+原始文件+元数据) | 需存储多模态原始数据 |
| **查询表达力** | 有限 (文本→文本) | 强 (文本↔图像↔表格↔视频) | 跨模态表达力 |

---

## 1.3 多模态 RAG 核心技术栈

### 1.3.1 技术栈分层架构图

```
┌──────────────────────────────────────────────────────────────────────┐
│                        输出层 (Output Layer)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ 富文本   │  │ 图像    │  │ 表格    │  │ 语音    │  │ 交互式   │   │
│  │ Markdown │  │ 渲染    │  │ 渲染    │  │ 合成    │  │ 可视化   │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│                       生成层 (Generation Layer)                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  多模态 LLM  (GPT-4o / Qwen2.5-VL / Gemini / Claude Sonnet)  │    │
│  │  + Cross-Modal Context Injection (跨模态上下文注入)            │    │
│  └──────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                       融合层 (Fusion Layer)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐         │
│  │ Cross-Modal │  │  Re-Ranker  │  │  置信度校准         │         │
│  │  Fusion     │  │  (Jina/     │  │  (温度缩放/          │         │
│  │  (早期/中期) │  │   BGE-reranker│  │   Platt scaling)   │         │
│  └─────────────┘  └─────────────┘  └─────────────────────┘         │
├──────────────────────────────────────────────────────────────────────┤
│                       检索层 (Retrieval Layer)                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│  │ Dense     │ │ Sparse    │ │ Structured│ │ Graph     │          │
│  │ (向量)    │ │ (BM25/    │ │ (SQL/     │ │ (知识    │          │
│  │ (FAISS/   │ │  ColBERT) │ │  Elasticsearch)│ │  图谱)  │          │
│  │ Milvus)   │ │           │ │           │ │ (Neo4j) │          │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
├──────────────────────────────────────────────────────────────────────┤
│                       嵌入层 (Embedding Layer)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ Text    │ │ Image   │ │ Video   │ │ Audio   │ │ Table   │     │
│  │ Embed   │ │ Embed   │ │ Embed   │ │ Embed   │ │ Embed   │     │
│  │ (BGE/   │ │ (CLIP/  │ │ (Video- │ │ (wav2vec│ │ (Tab2Vec│     │
│  │ E5/     │ │ SigLIP) │ │ CLIP)   │ │ 2)     │ │ /      │     │
│  │ GTE)    │ │         │ │         │ │        │ │  DeepWalk)│    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
├──────────────────────────────────────────────────────────────────────┤
│                       数据层 (Data Layer)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ 文本     │ │ 图像    │ │ PDF     │ │ 视频    │ │ 音频    │     │
│  │ (txt/md)│ │ (png/   │ │ (混合   │ │ (mp4/   │ │ (wav/   │     │
│  │          │ │  jpg)   │ │  PDF)   │ │  avi)   │ │  mp3)   │     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│  ┌─────────┐ ┌─────────┐                                             │
│  │ 表格     │ │ 元数据   │                                             │
│  │ (csv/xls)│ │ (JSON/YAML)                                           │
│  └─────────┘ └─────────┘                                             │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.3.2 各层关键技术选型

**数据层工具栈：**
- 图像：`Pillow`, `OpenCV`, `pdf2image`, `pdfplumber`
- PDF：`pdfplumber`（表格）, `marker-pdf`（OCR+版面）, `Unstructured`
- 视频：`OpenCV`, `ffmpeg`, `Decord`, ` torchvision`
- 音频：`Librosa`, `pydub`, `Whisper`

**嵌入层选型：**
- 文本：BGE-M3（多语言）, E5-Mistral（长上下文）, GTE（低成本）
- 图像：CLIP ViT-L/14, SigLIP SO400M, EVA-CLIP
- 多模态：CLIP（通用）, FLUX-CLIP（高质量）

**检索层选型：**
- Dense：FAISS（自建）, Milvus（分布式）, Qdrant（云原生）
- Sparse：Elasticsearch（BM25）, SPLADE
- Late Interaction：ColBERTv2, ColPali
- Graph：Neo4j（知识图谱）, NetworkX

---

## 1.4 架构演进：Text-Centric → Native Multimodal

### 1.4.1 演进路线图

```
演进阶段                           时间线         核心能力
─────────────────────────────────────────────────────────────

Phase 1                            2022-2024
┌──────────────────────────────────────────────────────────┐
│  Text-Centric RAG（纯文本为中心）                         │
│                                                          │
│  核心思路：将多模态数据转化为文本后，走传统 RAG 管线        │
│                                                          │
│  ┌────────┐    ┌──────────┐    ┌──────────┐             │
│  │ 多模态  │───→│ 模态转换  │───→│ 纯文本    │───→│ 传统RAG │
│  │ 数据    │    │ (OCR等)  │    │ RAG管线   │             │
│  └────────┘    └──────────┘    └──────────┘             │
│                                                          │
│  ✅ 实现简单、成本低                                       │
│  ❌ 信息损失严重、无法跨模态检索                            │
│  ❌ 表格/图表/布局丢失                                    │
│  ❌ 仅能处理 ≤40% 的企业知识                              │
│                                                          │
│  代表系统：RAGFlow(v0.x), LangChain basic                 │
└──────────────────────────────────────────────────────────┘

Phase 2                            2024-2025
┌──────────────────────────────────────────────────────────┐
│  Hybrid Multi-Modal RAG（混合多模态）                     │
│                                                          │
│  核心思路：多模态各走各的管线，最后在融合层汇合             │
│                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │ 文本管线 │    │ 图像管线 │    │ 表格管线 │             │
│  │ Text2Vec │    │ CLIP    │    │ Tab2Vec  │             │
│  └────┬────┘    └────┬────┘    └────┬────┘             │
│       └─────────────┬───┬──────────┘                    │
│                     ▼   ▼                                  │
│              ┌─────────────┐                              │
│              │  结果融合层   │──→  LLM 生成               │
│              └─────────────┘                              │
│                                                          │
│  ✅ 各模态独立优化                                         │
│  ✅ 支持简单的跨模态查询                                   │
│  ❌ 融合策略简单（concat/sum），语义对齐不足                  │
│  ❌ 查询仍需为各模态分别构造                                │
│  ❌ 部分模态间的关联丢失                                   │
│                                                          │
│  代表系统：RAGFlow(v1.x), LlamaIndex multi-modal,          │
│           Qdrant multi-modal, LangChain multimodal         │
└──────────────────────────────────────────────────────────┘

Phase 3                            2025-2026 (当前)
┌──────────────────────────────────────────────────────────┐
│  Native Multimodal RAG（原生多模态）                       │
│                                                          │
│  核心思路：从嵌入空间到生成层全程多模态原生                 │
│                                                          │
│                      ┌─────────────────┐                  │
│                      │  统一嵌入空间     │                  │
│                      │  (Text+Img+Tab)  │                  │
│                      └────────┬────────┘                  │
│                               ▼                           │
│       ┌───────────┐   ┌─────────────┐   ┌───────────┐   │
│       │ 文本查询   │   │ 图像查询     │   │ 表格查询   │   │
│       └─────┬─────┘   └──────┬──────┘   └─────┬─────┘   │
│             ▼                ▼                 ▼           │
│       ┌─────────────────────────────────────────────┐     │
│       │       Cross-Modal Retrieval Engine           │     │
│       │  (ColPali / Unified Embedding / RAGGraph)    │     │
│       └────────────────┬────────────────────────────┘     │
│                        ▼                                   │
│              ┌─────────────────┐                          │
│              │  Multimodal LLM  │                          │
│              │  (GPT-4o/Qwen2.5)│                          │
│              └─────────────────┘                          │
│                                                          │
│  ✅ 真正的跨模态检索：任意模态查询任意模态文档              │
│  ✅ 统一嵌入空间，语义对齐精度高                           │
│  ✅ Late Interaction 保留细粒度信息                       │
│  ✅ 支持表格/图表/布局等结构信息                          │
│  ❌ 实现复杂度高                                          │
│  ❌ 计算/存储成本显著增加                                 │
│  ❌ 需专业 ML 工程团队                                    │
│                                                          │
│  代表系统：RAGFlow(v2.x), ColPali, RAGGraph,             │
│           Cross-MRAG, Multimodal RAG with Graph          │
└──────────────────────────────────────────────────────────┘
```

### 1.4.2 架构选型决策树

```
你的场景需要多模态 RAG？
│
├─ 否 → 传统文本 RAG 即可
│
└─ 是 → 你的知识库中包含哪些模态？
         │
         ├─ 仅文本 → 传统 RAG + 增强版 embedding
         │
         ├─ 文本 + 图片（截图/文档扫描）
         │   │
         │   ├─ 图片内容以 OCR 为主？
         │   │   └─ Phase 1：OCR → 纯文本 RAG
         │   │      工具：marker-pdf + BGE-M3
         │   │
         │   └─ 图片包含图表/布局/视觉推理？
         │       └─ Phase 2：CLIP embedding + 多模态 LLM
         │          工具：SigLIP + GPT-4o
         │
         ├─ 包含表格数据
         │   │
         │   ├─ 表格是辅助信息？
         │   │   └─ Phase 2：表格 → HTML → 文本 RAG
         │   │      工具：pdfplumber + Tab2Vec
         │   │
         │   └─ 表格是核心知识（财务/科学）？
         │       └─ Phase 3：专用表格索引 + 结构化查询
         │          工具：ColPali + SQL 混合检索
         │
         ├─ 包含视频/音频
         │   │
         │   ├─ 仅需字幕？
         │   │   └─ Phase 2：Whisper ASR → 文本 RAG
         │   │      工具：Whisper-large-v3 + BGE-M3
         │   │
         │   └─ 需要视觉/时序理解？
         │       └─ Phase 3：VideoCLIP + 时序索引
         │          工具：Video-CLIP + Milvus (含时间戳)
         │
         └─ 多模态混合（≥3种模态）
             └─ Phase 3：Native Multimodal RAG
                工具：ColPali + BGE-M3 + Video-CLIP
                架构：RAGGraph 或自研统一嵌入管线
```

### 1.4.3 Phase 选型决策矩阵

| 决策因素 | Phase 1 (Text-Centric) | Phase 2 (Hybrid) | Phase 3 (Native) |
|---------|----------------------|-----------------|-----------------|
| **团队规模** | ≤5 人 | 5-15 人 | ≥15 人 + ML 专家 |
| **MVP 时间** | 2-4 周 | 6-12 周 | 3-6 月 |
| **预算** | < $5k/月 | $5k-20k/月 | $20k+/月 |
| **数据覆盖率** | ~40% | ~70% | ~95%+ |
| **实现复杂度** | 低 | 中 | 高 |
| **适合阶段** | 概念验证 / 快速上线 | 生产环境 / 业务扩展 | 核心系统 / 竞争壁垒 |

---

## 1.5 本章内容导读

本章我们完成了多模态 RAG 的宏观定位：

- **1.1** 分析了纯文本 RAG 的根本性局限，通过企业数据分布论证了多模态的必要性
- **1.2** 通过架构对比图与对比表，量化了两种架构在各维度的差异
- **1.3** 拆解了多模态 RAG 六层技术栈（数据层→嵌入层→检索层→融合层→生成层→输出层）
- **1.4** 给出了从 Phase 1 到 Phase 3 的演进路线图与选型决策树，帮助读者定位自身阶段
- **1.5** 本章导读

**下一章（第2章）** 将深入多模态数据预处理，这是多模态 RAG 的基石——再好的嵌入模型也无法挽救损坏的预处理管线。我们将覆盖图像、PDF、视频、音频的预处理方案，并给出具体工具参数与代码示例。

---

# 第 2 章 多模态数据预处理

> 核心原则：**预处理质量直接决定嵌入质量和检索效果。** Garbage in, garbage out 在多模态场景中尤其严重。

---

## 2.1 图像预处理

### 2.1.1 图像增强技术

多模态 RAG 中，图像预处理的目标不是"让图像更好看"，而是 **最大化视觉语义信息的可嵌入性**。

```
原始图像                    预处理管线                  增强后图像
──────────              ──────────────────           ──────────
┌──────┐               ┌──────────────────┐          ┌──────┐
│      │  ──→ 旋转校正 ──→  ┌───────────┐  ──→  ┌───────────┐    │
│ 倾斜  │                  │ 去噪/去模糊  │        │  去噪图像  │    │
│ 截图  │                  └───────────┘        └───────────┘    │
│      │  ──→ 对比度增强 ──→  ┌───────────┐  ──→  ┌───────────┐    │
│      │                  │ CLAHE 对比度  │        │  增强图像  │    │
│      │                  └───────────┘        └───────────┘    │
└──────┘               ┌──────────────────┐          ┌──────┐
                       │ DPI 归一化       │    ──→  ┌──────┐    │
                       │ (统一 300 DPI)   │         │  输出  │    │
                       └──────────────────┘         └──────┘
```

**关键参数与工具对比：**

| 处理步骤 | OpenCV 方法 | Pillow 方法 | 推荐场景 | 推荐参数 |
|---------|------------|------------|---------|---------|
| 旋转校正 | `cv2.getRotationMatrix2D` | 不适用 | 扫描文档/截图 | angle=±15° |
| 去噪 | `cv2.fastNlMeansDenoising` | 不适用 | 扫描件/低质量图 | h=10 |
| 去模糊 | `cv2.GaussianBlur` | 不适用 | 运动模糊截图 | ksize=(3,3) |
| 对比度 | `cv2.createCLAHE(clipLimit=2.0)` | `ImageEnhance.Contrast` | 暗色截图/扫描 | clip=2.0-4.0 |
| DPI 归一化 | `cv2.resize` with ratio | `Image.resize` | 统一输入尺寸 | target=300DPI, max=1024px |
| 灰度化 | `cv2.cvtColor(gray)` | `Image.convert('L')` | OCR 前预处理 | — |
| 二值化 | `cv2.adaptiveThreshold` | `Image.point(127>255)` | 扫描文档 OCR | thresh=150-200 |

**实战代码示例：**

```python
import cv2
import numpy as np
from PIL import Image
from pdf2image import convert_from_path

def preprocess_image(image_path: str, dpi: int = 300, max_dim: int = 1024) -> np.ndarray:
    """
    图像预处理管线：用于 RAG 嵌入
    
    Args:
        image_path: 输入图像路径 (支持 PNG/JPG/PDF)
        dpi: 渲染 DPI（PDF 专用）
        max_dim: 最大边长，超出则等比缩放
    
    Returns:
        numpy array (H, W, 3) uint8 RGB 图像
    """
    # Step 1: 加载图像
    if image_path.endswith('.pdf'):
        images = convert_from_path(image_path, dpi=dpi)
        img = images[0]  # 取第一页
        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    else:
        img = cv2.imread(image_path)
    
    if img is None:
        raise ValueError(f"无法读取图像: {image_path}")
    
    # Step 2: DPI 归一化（统一到 ~300 DPI）
    if image_path.endswith('.pdf'):
        # PDF 需要 DPI → 像素 的换算
        # 假设原始 72 DPI, 目标 300 DPI
        scale = 300 / 72
        new_w = int(img.shape[1] * scale)
        new_h = int(img.shape[0] * scale)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
    
    # Step 3: 尺寸归一化
    h, w = img.shape[:2]
    max_side = max(h, w)
    if max_side > max_dim:
        scale = max_dim / max_side
        new_w, new_h = int(w * scale), int(h * scale)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # Step 4: 对比度增强（CLAHE）
    # CLAHE: Contrast Limited Adaptive Histogram Equalization
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    img = cv2.merge([l, a, b])
    img = cv2.cvtColor(img, cv2.COLOR_LAB2BGR)
    
    # Step 5: 轻微去噪（对低质量截图有效）
    img = cv2.fastNlMeansDenoisingColored(img, None, h=8, 
                                            hColor=8, 
                                            templateWindowSize=7, 
                                            searchWindowSize=21)
    
    # Step 6: 转为 RGB numpy array
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return img_rgb


def batch_preprocess_image_dir(input_dir: str, output_dir: str,
                                dpi: int = 300, max_dim: int = 1024):
    """批量预处理图像目录"""
    import os
    from pathlib import Path
    
    os.makedirs(output_dir, exist_ok=True)
    supported = {'.png', '.jpg', '.jpeg', '.pdf', '.tiff'}
    
    for file_path in Path(input_dir).glob('*'):
        if file_path.suffix.lower() not in supported:
            continue
        
        processed = preprocess_image(str(file_path), dpi=dpi, max_dim=max_dim)
        out_path = os.path.join(output_dir, f"{file_path.stem}_processed.png")
        cv2.imwrite(out_path, cv2.cvtColor(processed, cv2.COLOR_RGB2BGR))
        print(f"  ✓ {file_path.name} → {out_path}")
```

### 2.1.2 版面分析（Layout Analysis）

多模态 RAG 中，单纯对图像做嵌入是不够的——我们需要理解图像的 **结构**。

```
原始图像                    版面分析结果
──────────                ────────────────
┌────────────────────┐    
│ ┌──────┐ ┌──────┐ │    ┌────────┬────────┬──────────┐
│ │ 图1   │ │图2   │ │    │ 类型    │ 边界框  │  置信度  │
│ │ 截图   │ │ 表格  │ │───→│ title  │ [0,0..]│  0.98   │
│ │        │ │      │ │    │ figure │ [100,..│  0.95   │
│ └──────┘ └──────┘ │    │ table  │ [300,..│  0.92   │
│ ┌────────────────┐ │    │ text   │ [600,..│  0.97   │
│ │   正文段落      │ │    │ chart  │ [900,..│  0.88   │
│ └────────────────┘ │    └────────┴────────┴──────────┘
└────────────────────┘
```

**版面分析工具对比：**

| 工具 | 输入格式 | 检测精度 | 速度 | 多语言支持 | 推荐场景 |
|------|---------|---------|------|-----------|---------|
| **Marker** | PDF/image | ★★★★ | 快 | 多语言 | PDF 文档解析 |
| **DocLayout-YOLO** | image | ★★★★★ | 极快 | 英文/中文 | 高精度版面分割 |
| **PaddleOCR Layout** | image | ★★★★ | 中 | 中文优化 | 中文文档 |
| **LayoutParser** | image | ★★★ | 中 | 英文 | 学术研究/灵活定制 |
| **Nougat** | PDF | ★★★ | 慢 | 英文 | 学术 PDF |

**实战代码示例（DocLayout-YOLO）：**

```python
from doclayout_yolo import YOLO
import cv2

# 加载预训练模型（基于 PubLayNet / FineStruct 微调）
model = YOLO("doclayout_yolo_yolo_world_4ch.pt")  # 4ch 支持 RGBA 输入

# 推理
doc = model.predict("document.png", verbose=False)

# 解析结果
for box in doc.boxes:
    cls_name = model.names[box.cls]
    bbox = box.xyxy[0].cpu().numpy()  # [x1, y1, x2, y2]
    conf = box.conf[0].item()
    
    print(f"  {cls_name:10s}  bbox=({bbox[0]:.0f},{bbox[1]:.0f},{bbox[2]:.0f},{bbox[3]:.0f})  conf={conf:.3f}")

# 输出示例：
#   title      bbox=(120,45,680,95)  conf=0.976
#   figure     bbox=(50,120,750,520) conf=0.945
#   text       bbox=(50,540,750,720) conf=0.982
#   table      bbox=(80,740,720,1020) conf=0.918
```

---

## 2.2 PDF/文档解析

### 2.2.1 PDF 结构剖析

PDF 是最复杂的输入格式之一。理解其结构对高效预处理至关重要。

```
PDF 文件结构
═══════════════════════════════════════════════════════

┌──────────────────────────────────────────────┐
│  PDF 物理结构                                │
├──────────────────────────────────────────────┤
│                                              │
│  Header  (%PDF-1.7)                          │
│  ├── Trailer                               │
│  │   └── Root (文档根对象)                   │
│  ├── Object Stream                          │
│  │   ├── Page 1                              │
│  │   │   ├── Content Stream                  │
│  │   │   │   ├── Text objects (BT/ET)        │
│  │   │   │   ├── Image objects (Do)          │
│  │   │   │   └── Drawing objects             │
│  │   │   ├── Resources                       │
│  │   │   │   ├── Fonts                       │
│  │   │   │   ├── XObjects (图像)             │
│  │   │   │   └── ColorSpace                  │
│  │   │   └── MediaBox                        │
│  │   ├── Page 2                              │
│  │   └── ...                                 │
│  └── Cross-Reference Table                    │
└──────────────────────────────────────────────┘

PDF 语义结构（对 RAG 更有意义）
═══════════════════════════════════════════════════

┌──────────────────────────────────────────────┐
│  Page 1                                       │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  [Title]  "Q3 2025 Financial Report" │    │
│  ├──────────────────────────────────────┤    │
│  │  [Text]   "In Q3 2025, revenue..."   │    │
│  ├──────────────────────────────────────┤    │
│  │  [Figure]  [Revenue Chart Image]      │    │
│  ├──────────────────────────────────────┤    │
│  │  [Table]   ┌─────┬─────┐              │    │
│  │             │Q1   │Q2   │              │    │
│  │             ├─────┼─────┤              │    │
│  │             │1.2M │1.5M │              │    │
│  │             └─────┴─────┘              │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

**PDF 解析的核心挑战：**

| 挑战 | 说明 | 影响 |
|------|------|------|
| **文本提取方式多样** | PDF 中文字可能是 `BT/ET` text objects、`Type3` 字体、`embedded font`、或完全缺失（扫描件） | 纯文本提取可能遗漏 30-70% 内容 |
| **字体编码问题** | PDF 字体编码可能是 Symbolic、Custom、或 `ToUnicode` CMap 缺失 | 提取的文本可能出现乱码 |
| **布局丢失** | PDF 的 `BT/ET` 文本对象之间没有结构关系（标题/正文/脚注） | 切片时无法判断段落边界 |
| **嵌入图像** | 页面中嵌入的 JPEG/PNG 图像、矢量图 | 需要额外处理才能理解 |
| **透明度和层** | 多层叠加、透明度混合 | 视觉上看到的 ≠ 底层数据 |
| **注释和元数据** | 批注、书签、XMP 元数据 | 可能被忽略的重要信息 |

### 2.2.2 OCR 引擎选型对比表

当 PDF 包含扫描件或无文本层的页面时，OCR 是必需的。

| 维度 | **Tesseract** | **PaddleOCR** | **EasyOCR** | **MOONOCR** | **marker-pdf** |
|------|-------------|--------------|------------|-----------|---------------|
| **核心架构** | LSTM + GRU | CRNN + SAR | CNN + BiLSTM + CRF | Qwen2-VL | Marker + OCR |
| **开源/商业** | 开源 (Apache 2.0) | 开源 (Apache 2.0) | 开源 (Apache 2.0) | 开源 (MIT) | 开源 (Apache 2.0) |
| **中英精度** | 中:72% | 中:95%+ | 中:92% | 中:96%+ | 中:94%+ |
| **英文精度** | 96% | 97% | 95% | 96% | 94% |
| **多语言** | 100+ 语言 | 80+ 语言 | 70+ 语言 | 15+ 语言 | 自动检测 |
| **检测速度** | 中 (CPU 1-3s/页) | 快 (GPU 0.3s/页) | 中 (GPU 0.5s/页) | 快 (GPU 0.4s/页) | 慢 (2-5s/页) |
| **端到端** | 检测+识别分开 | 端到端 | 端到端 | 端到端 | 端到端 |
| **表格识别** | ❌ | ✅ (PP-Tables) | ❌ | ✅ | ✅ (通过布局) |
| **公式识别** | ❌ | ✅ (MathPix) | ❌ | ✅ | ❌ |
| **安装复杂度** | 低 | 中 | 低 | 中 | 高 |
| **内存占用** | 低 (~200MB) | 中 (~1GB) | 中 (~1.5GB) | 中 (~1GB) | 高 (~3GB) |
| **推荐场景** | 轻量/英文 | **中文生产环境** | 快速原型 | **高精度中文** | **PDF 转 Markdown** |

**选型建议：**

```
你的 OCR 需求？
│
├─ 纯中文生产环境 → PaddleOCR (PP-OCRv4)
├─ 高精度中文表格 → MOONOCR 或 PaddleOCR + PP-Tables
├─ PDF → Markdown → marker-pdf
├─ 轻量/英文为主 → Tesseract 5.0
├─ 快速原型 → EasyOCR
└─ 学术研究 → PaddleOCR + 自定义微调
```

### 2.2.3 表格还原专题

表格是 RAG 中最难处理的模态之一。合并单元格、跨页表格、无框表格各自需要特殊处理。

#### 2.2.3.1 问题分类与处理方案

```
表格类型                      挑战                      解决方案
══════════════════════════════════════════════════════════════════

合并单元格表                  │ 行列关系断裂              │ 1. 使用 PaddleOCR PP-Tables
(最常见的类型)                │ 单元格的 col/row span     │ 2. 几何推理 (bbox 重叠检测)
                              │ 丢失                      │ 3. 构建 HTML <table> 结构
                              │                          │ 4. 转为 Markdown 保留结构
                              │                          │ 推荐工具: pdfplumber / camelot

跨页表格                      │ 表格被页面边界切割         │ 1. 基于行对齐性检测
                            │                          │ 2. 行内容匹配 (正则 + 语义)
                            │                          │ 3. 合并策略: 首行+尾行校验
                            │                          │ 推荐工具: tabula-py / pdfplumber

无框表格 (空白分隔)           │ 无可见边框线             │ 1. 基于列对齐 + 空白间距
(财务报表/CSV 导出)            │ 列对齐不可靠             │ 2. 文本密度分析 (col density)
                            │                          │ 3. 字体/字号一致性
                            │                          │ 推荐工具: Camelot (stream 模式)

嵌套表格                      │ 表格中有表格              │ 1. 递归解析 bbox 嵌套
(学术论文/报告)                │ 边界模糊                  │ 2. 层级 bbox 树构建
                            │                          │ 推荐工具: LayoutParser + 自定义
```

#### 2.2.3.2 合并单元格还原架构

```
输入: PDF 页面中的合并单元格表格

┌─────────────────────────────────────────────┐
│  [A1] │ [B1] │ [C1]                        │  ← 视觉: A1 占 2 行 2 列
│       │      │                               │
│  ┌────┴──┬───┴───┐                           │
│  │ [A2]  │ [B2]  │ [C2]                     │  ← 实际数据
│  │       │       │                           │
│  ├───────┴───────┴───────────┐               │
│  │ [A3] (merged)             │               │
│  │ [A4]                      │               │
│  └───────────────────────────┘               │
└─────────────────────────────────────────────┘

处理管线:

┌───────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ 原始 bbox  │───→│ 几何关系推理   │───→│ 结构重建       │───→│ HTML/Markdown │
│ (检测器)   │    │ col/row span  │    │ (HTML table)  │    │ 输出          │
│           │    │ 重叠检测        │    │               │    │               │
└───────────┘    └───────────────┘    └───────────────┘    └───────────────┘
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │ 行分组    │    │ 列分组    │    │ rowspan/ │
              │ 合并检测   │    │ 合并检测   │    │ colspan  │
              └──────────┘    └──────────┘    └──────────┘
```

**实战代码示例（pdfplumber + Camelot）：**

```python
import pdfplumber
import camelot
import pandas as pd

def extract_tables_pdfplumber(pdf_path: str) -> list[dict]:
    """
    使用 pdfplumber 提取表格，保留合并单元格信息
    
    Returns:
        列表 of {page, x0, y0, x1, y1, headers, rows, is_merged}
    """
    tables_info = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            # 提取表格
            tables = page.extract_tables(
                table_settings={
                    "vertical_strategy": "lines",  # 基于线条
                    "horizontal_strategy": "lines",
                    "intersection_x_tolerance": 10,
                    "intersection_y_tolerance": 10,
                }
            )
            
            for table_idx, table in enumerate(tables):
                if not table:
                    continue
                
                # 检测列合并（相邻列内容连续）
                headers = table[0] if len(table) > 0 else []
                rows = table[1:]
                
                # 检测 row_span: 连续重复的行内容
                merged_rows = []
                i = 0
                while i < len(rows):
                    row = rows[i]
                    span = 1
                    while i + span < len(rows) and row == rows[i + span]:
                        span += 1
                    merged_rows.append({
                        "data": row,
                        "row_span": span,
                        "start_row": page_num,
                    })
                    i += span
                
                # 计算 bbox
                bbox = page.bbox
                tables_info.append({
                    "page": page_num,
                    "table_idx": table_idx,
                    "headers": headers,
                    "rows": merged_rows,
                    "is_merged": any(r["row_span"] > 1 for r in merged_rows),
                    "bbox": (bbox[0], bbox[1], bbox[2], bbox[3]),
                })
    
    return tables_info


def extract_tables_crosspage(pdf_path: str, threshold: float = 0.85) -> list[dict]:
    """
    跨页表格检测与合并
    
    策略：基于行内容相似度 + 表格几何连续性
    """
    cross_page_tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        prev_tables = []  # 上一页的表格列表
        
        for page_num, page in enumerate(pdf.pages, 1):
            current_tables = page.extract_tables(
                table_settings={
                    "vertical_strategy": "text",  # 基于文本检测（处理无框表）
                    "horizontal_strategy": "lines",
                }
            )
            
            if prev_tables:
                # 跨页检测：检查上一页表格与当前页表格的连续性
                for prev_tbl in prev_tables:
                    if not prev_tbl:
                        continue
                    
                    for curr_tbl in current_tables:
                        if not curr_tbl:
                            continue
                        
                        # 检测最后一行与第一列的匹配度
                        prev_last = prev_tbl[-1] if prev_tbl else []
                        curr_first = curr_tbl[0] if curr_tbl else []
                        
                        if prev_last and curr_first:
                            # 对齐检测：第一列文本匹配
                            match_count = sum(
                                1 for a, b in zip(prev_last, curr_first)
                                if a.strip() == b.strip()
                            )
                            match_ratio = match_count / len(prev_last) if prev_last else 0
                            
                            if match_ratio > threshold:
                                # 跨页表格合并
                                cross_page_tables.append({
                                    "page_start": page_num - 1,
                                    "page_end": page_num,
                                    "rows": prev_tbl + curr_tbl,
                                    "match_ratio": match_ratio,
                                })
            
            prev_tables = current_tables
    
    return cross_page_tables


# 使用示例
if __name__ == "__main__":
    tables = extract_tables_pdfplumber("document.pdf")
    for t in tables:
        print(f"Page {t['page']}, Table {t['table_idx']}, merged={t['is_merged']}")
        for r in t['rows']:
            print(f"  rowspan={r['row_span']}: {r['data']}")
    
    cross_page = extract_tables_crosspage("document.pdf")
    for tbl in cross_page:
        print(f"Cross-page: {tbl['page_start']}-{tbl['page_end']}, "
              f"rows={len(tbl['rows'])}, match={tbl['match_ratio']:.2f}")
```

---

## 2.3 视频预处理

### 2.3.1 关键帧提取策略

视频预处理的核心是 **高效且语义密集的关键帧提取**——太多帧浪费资源，太少帧丢失信息。

```
视频预处理管线

┌──────────┐    ┌──────────────┐    ┌──────────────────┐    ┌────────────┐
│ 原始视频  │───→│ 转码标准化    │───→│ 关键帧提取        │───→│ 帧嵌入     │
│ (mp4/wmv)│    │ (H.264/VP9)  │    │ (scene/shot/key) │    │ (CLIP等)   │
└──────────┘    └──────────────┘    └──────────────────┘    └────────────┘
                    │                  │                        │
                    ▼                  ▼                        ▼
            • 统一编码           • 场景分割             • Video-CLIP
            • 统一分辨率          • 关键帧去重           • SigLIP-frame
            • 统一帧率            • 去重压缩             • 多向量编码
```

**关键帧提取方法对比：**

| 方法 | 原理 | 精度 | 速度 | 适用场景 | 推荐参数 |
|------|------|------|------|---------|---------|
| **Scene Cut (OpenCV)** | 帧间差异度阈值 | ★★★★ | 快 | 切换频繁的视频 | delta>30, threshold=30 |
| **Shot Detection (PySceneDetect)** | 多指标融合 | ★★★★★ | 中 | 专业视频分析 | default detector |
| **Semantic Keyframe (CLIP)** | 帧-文本相似度 | ★★★★★ | 慢 | 图文匹配 | top-k per shot |
| **Uniform Sampling** | 等间隔采样 | ★★ | 极快 | MVP/快速原型 | interval=30fps → 1fps |
| **Content-Aware** | 运动+亮度+文本密度 | ★★★★ | 中 | 文档类视频 | 自定义权重 |

### 2.3.2 转码标准化

```python
import subprocess
import os

def normalize_video(input_path: str, output_path: str,
                     target_fps: int = 30,
                     target_width: int = 1920,
                     target_codec: str = "libx264") -> str:
    """
    视频转码标准化
    
    Args:
        input_path: 输入视频路径
        output_path: 输出视频路径
        target_fps: 目标帧率
        target_width: 目标宽度（等比缩放高度）
        target_codec: 编码器 (libx264/libvpx-vp9)
    
    Returns:
        输出视频路径
    """
    # 获取源视频信息
    probe_cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,nb_frames",
        "-of", "json", input_path
    ]
    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    info = eval(result.stdout)['streams'][0]
    
    src_w, src_h = info['width'], info['height']
    src_fps_num, src_fps_den = map(int, info['r_frame_rate'].split('/'))
    src_fps = src_fps_num / src_fps_den if src_fps_den else 30
    
    # 计算缩放比例
    scale_ratio = target_width / src_w
    dst_h = int(src_h * scale_ratio)
    
    # ffmpeg 转码
    filter_complex = f"scale={target_width}:{dst_h},fps={target_fps}"
    
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-vf", filter_complex,
        "-c:v", target_codec,
        "-preset", "fast",
        "-crf", "23",           # 质量因子 (18-28, 越低越好)
        "-c:a", "aac",           # 音频编码
        "-b:a", "128k",          # 音频码率
        "-movflags", "+faststart",  # Web 友好
        "-pix_fmt", "yuv420p",   # 兼容性
        output_path
    ]
    
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return output_path


def extract_keyframes(video_path: str, output_dir: str,
                       scene_threshold: int = 30,
                       min_gap_frames: int = 15,
                       return_top_k: int = 10) -> list[dict]:
    """
    基于场景分割 + 语义排序的关键帧提取
    
    Args:
        video_path: 视频路径
        output_dir: 帧输出目录
        scene_threshold: 场景切换检测阈值
        min_gap_frames: 关键帧最小间隔（帧数）
        return_top_k: 返回 Top-K 最语义密集帧
    
    Returns:
        列表 of {frame_idx, timestamp, fps, path, scene_id}
    """
    import cv2
    import numpy as np
    from pathlib import Path
    
    os.makedirs(output_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    frames_data = []
    prev_frame = None
    scene_id = 0
    last_keyframe_idx = -min_gap_frames  # 确保第一帧被提取
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_idx = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
        
        # 跳过 min_gap_frames 内的帧
        if frame_idx - last_keyframe_idx < min_gap_frames:
            continue
        
        if prev_frame is not None:
            # 帧间差异检测
            gray_curr = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray_prev = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
            delta = cv2.absdiff(gray_prev, gray_curr)
            diff_score = delta.mean()
            
            if diff_score > scene_threshold:
                scene_id += 1
        
        # 保存候选帧
        frames_data.append({
            "frame_idx": frame_idx,
            "timestamp": frame_idx / fps,
            "fps": fps,
            "scene_id": scene_id,
            "diff_score": diff_score if prev_frame else 0,
        })
        
        last_keyframe_idx = frame_idx
        prev_frame = frame.copy()
    
    cap.release()
    
    # 按场景 ID 分组，每场景取 diff_score 最高的帧
    scene_groups = {}
    for fd in frames_data:
        sid = fd["scene_id"]
        if sid not in scene_groups:
            scene_groups[sid] = []
        scene_groups[sid].append(fd)
    
    keyframes = []
    for sid, group in scene_groups.items():
        # 每场景选 diff_score 最高的帧
        top_frame = max(group, key=lambda x: x["diff_score"])
        
        # 实际提取该帧
        cap = cv2.VideoCapture(video_path)
        cap.set(cv2.CAP_PROP_POS_FRAMES, top_frame["frame_idx"])
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            path = os.path.join(output_dir, f"scene_{sid}_frame_{top_frame['frame_idx']}.png")
            cv2.imwrite(path, frame)
            keyframes.append({
                "path": path,
                "frame_idx": top_frame["frame_idx"],
                "timestamp": top_frame["timestamp"],
                "scene_id": sid,
                "fps": top_frame["fps"],
            })
    
    # 按语义密度排序，返回 Top-K
    keyframes.sort(key=lambda x: x["timestamp"])
    return keyframes[:return_top_k]


# 使用示例
if __name__ == "__main__":
    # 1. 标准化
    normalize_video("training.mp4", "output/normalized.mp4", 
                     target_fps=30, target_width=1280)
    
    # 2. 关键帧提取
    kfs = extract_keyframes("output/normalized.mp4", "output/keyframes", 
                             scene_threshold=25, min_gap_frames=10, return_top_k=10)
    for kf in kfs:
        print(f"  Frame {kf['frame_idx']:5d}  ts={kf['timestamp']:8.2f}s  "
              f"scene={kf['scene_id']}  → {os.path.basename(kf['path'])}")
```

---

## 2.4 音频/语音预处理

### 2.4.1 ASR 方案对比

音频预处理的本质是 **语音到文本（ASR）**，其质量由 **WER（Word Error Rate）** 衡量。

```
ASR Pipeline

┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 原始音频  │───→│ 预处理    │───→│ VAD      │───→│ ASR 引擎   │───→│ 后处理   │
│ (wav/mp3)│    │ (降噪/   │    │ (静音    │    │          │    │ (标点/   │
│          │    │ 响度     │    │ 段切割)  │    │          │    │ 分段)    │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

| 方案 | 引擎 | WER (英文) | WER (中文) | 实时性 | 部署方式 | 适合场景 |
|------|------|-----------|-----------|-------|---------|---------|
| **Whisper-large-v3** | OpenAI | 2.5% | 8-12% | 离线 | GPU | **通用生产** |
| **Whisper-medium** | OpenAI | 4.2% | 12-18% | 离线/边缘 | CPU/GPU | 资源受限 |
| **Whisper-turbo** | OpenAI | 3.8% | 15-22% | **实时** | GPU/云端 | 实时转写 |
| **Paraformer-large** | FunASR | — | 6-10% | 离线 | GPU/CPU | **中文生产** |
| **WeNet** | WeNet | 4.0% | 8-12% | 实时 | GPU/CPU | 定制化 |
| **SenseVoice** | FunASR | 3.0% | 7-11% | 实时 | GPU | **情感+ASR** |
| **Azure Speech** | 微软 | 2.2% | 5-8% | 实时 | 云端 | 企业级 |
| **Google Cloud SRT** | Google | 2.0% | 6-10% | 实时 | 云端 | 企业级 |
| **Vosk** | Vosk | 5-8% | 12-20% | 实时 | CPU | **离线边缘** |
| **Whisper.cpp** | GPT4All | 3.0% | 10-15% | 实时 | CPU | **纯 CPU** |

### 2.4.2 WER 计算与评估

```python
import jiwer

def calculate_wer(transcribed: str, reference: str) -> dict:
    """
    计算 WER (Word Error Rate)
    
    WER = (S + D + I) / N
    S = substitutions, D = deletions, I = insertions, N = reference words
    
    Returns:
        dict with wer, cer, s, d, i, n, h
    """
    # 预处理
    transcribed_clean = transcribed.lower().strip()
    reference_clean = reference.lower().strip()
    
    # WER
    wer = jiwer.wer(reference_clean, transcribed_clean)
    
    # CER (Character Error Rate) — 对中文更有意义
    cer = jiwer.wer(reference_clean, transcribed_clean, 
                    measure=jiwer.wer, 
                    char_level=True)
    
    # 详细指标
    metrics = jiwer.compute_measures(reference_clean, transcribed_clean)
    
    return {
        "wer": wer,
        "cer": cer,
        "substitutions": metrics["substitutions"],
        "deletions": metrics["deletions"],
        "insertions": metrics["insertions"],
        "reference_length": metrics["references"],
        "hypothesis_length": metrics["hypers"],
    }


# WER 对比实验
if __name__ == "__main__":
    # 模拟：Whisper-large-v3 vs Paraformer-large 中文 ASR
    reference_text = "2025年第三季度，公司营业收入达到1280万元，同比增长15.3%"
    
    whisper_result = "2025年第三季度，公司营业收入达到1280万，同比增长15%。"
    paraformer_result = "2025年第三季度，公司营业收入达到了1280万元，同比增长百分之15点3。"
    
    for name, result in [("Whisper-large-v3", whisper_result), 
                          ("Paraformer-large", paraformer_result)]:
        metrics = calculate_wer(result, reference_text)
        print(f"\n{name}:")
        print(f"  WER:   {metrics['wer']:.4f} ({metrics['wer']*100:.2f}%)")
        print(f"  CER:   {metrics['cer']:.4f} ({metrics['cer']*100:.2f}%)")
        print(f"  Sub/Del/Ins: {metrics['substitutions']}/{metrics['deletions']}/{metrics['insertions']}")
```

### 2.4.3 实战代码（FunASR Paraformer）

```python
from funasr import AutoModel

# 加载 Paraformer-large 模型
model = AutoModel(
    model="paraformer-zh",       # 中文 Paraformer
    vad_model="fsmn-vad",         # 静音段检测
    punc_model="ct-punc",         # 标点恢复
    # spk_model="cam++",          # 说话人分离（可选）
    disable_update=True,
)

# 音频文件转写
res = model.generate(
    input="meeting_recording.wav",
    batch_size_s=60,            # 批处理时长
    hotword="阿里巴巴 云计算",    # 领域热词
)

print(res[0]["text"])
# → "2025年第三季度，公司营业收入达到1280万元，同比增长15.3%"

# 带时间戳（用于视频字幕对齐）
res_ts = model.generate(
    input="training_video.mp4",
    sentence_timestamp=True,    # 句子级时间戳
)

for sent in res_ts[0]["sentence_info"]:
    print(f"  [{sent['start']:.1f}s - {sent['end']:.1f}s] {sent['text']}")
```

---

## 2.5 元数据注入与 Chunking 策略

### 2.5.1 多模态元数据注入

多模态 chunk 必须携带足够的元数据来支撑跨模态检索和结果排序。

```
Chunk 元数据结构
═══════════════════════════════════════════════════════════

{
    "id": "chunk_img_001",
    "type": "image",                // 模态类型
    "source": "doc_scan_page_3.png",
    "mime_type": "image/png",
    "modality": "visual",
    
    // 版面信息（对检索至关重要）
    "layout": {
        "region_type": "figure",    // title/text/figure/table/chart
        "bbox": {"x1": 50, "y1": 120, "x2": 750, "y2": 520},
        "page_number": 3,
        "section": "3.2 Results",
        "parent_section": "Methodology",
    },
    
    // 提取内容（多模态 RAG 的核心）
    "content": {
        "text": "Figure 3: Q3 2025 Revenue by Region",
        "ocr_text": "...",           // OCR 提取的全部文本
        "table_data": [...],          // 如果包含表格
        "embedded_images": [...],     // 如果图片中有子图
    },
    
    // 嵌入信息
    "embedding": {
        "model": "SigLIP-SO400M",
        "vector_dim": 1152,
        "hash": "sha256:abc123...",
    },
    
    // 检索权重
    "metadata": {
        "importance": 0.85,          // 人工/模型评分
        "recency": "2025-03-15",     // 时间戳（用于衰减）
        "domain": "finance",          // 领域标签
        "language": "en",
        "word_count": 245,
        "image_size": [1024, 768],
    }
}
```

### 2.5.2 多模态 Chunking 策略

```
传统 Chunking (文本)          多模态 Chunking (结构化)
═══════════════════════════════════════════════════════════

┌────────────────────────────┐  ┌─────────────────────────────────┐
│ ┌────┐ ┌────┐ ┌────┐     │  │ ┌──────┐  ┌──────┐  ┌───────┐  │
│ │章1 │ │章2 │ │章3 │     │  │ │ Title  │  │Figure│  │ Table │  │
│ │     │ │     │ │     │     │  │ chunk  │  │ chunk│  │ chunk │  │
│ │     │ │     │ │     │     │  │        │  │      │  │       │  │
│ │     │ │     │ │     │     │  │ ┌──────┐  │      │  │       │  │
│ │     │ │     │ │     │     │  │ │Figure│  │      │  │       │  │
│ └────┘ └────┘ └────┘     │  │ │ caption│  │      │  │       │  │
│  └──── 1000-word chunk ──┘  │  │ └──────┘  │      │  │       │  │
│  切片边界切割语义           │  │ └──── 4 chunks ───────────┘  │
└────────────────────────────┘  └─────────────────────────────────┘

问题:                              优势:
• 语义被切割                    • 保持模态完整性
• 图表/表格断裂                 • 保留版面/结构信息
• 无法判断边界                  • 元数据驱动切片
```

**多模态 Chunking 决策树：**

```
你的文档类型？
│
├─ 纯文本 (txt/md/docx)
│   └─ 按语义分割:
│       • 文档结构感知 (heading-based)  ← 首选
│       • Token 感知 (4096/8192 tokens) ← 次选
│       • 重叠 (10-20%)                  ← 边界保护
│
├─ PDF 文档
│   │
│   ├─ 有文本层？
│   │   ├─ 是 → pdfplumber 按 bbox 分组 + 版面分析
│   │   │       chunk_size = 段落级 (~500-800 tokens)
│   │   │       overlap = 0 (版面边界即 chunk 边界)
│   │   └─ 否 (扫描件) → OCR → 版面分析 → chunk
│   │
│   └─ 每页一个 chunk？→ 仅作为 fallback
│
├─ 图像 (截图/照片/图表)
│   ├─ 截图 → 按区域分 chunk (每区域一个 chunk)
│   ├─ 照片 → 整图 1 chunk (保持完整性)
│   ├─ 图表 → 提取图表 + 提取标题/图注 → 联合 chunk
│   └─ 表格截图 → 表格外层 chunk + 表格内层 chunk
│
├─ 表格 (csv/xlsx/html)
│   ├─ 小表 (<100行) → 整表 1 chunk
│   ├─ 大表 → 按行分组 (20-50 行/chunk)
│   └─ 超表 → 按主键分组
│
├─ 视频
│   ├─ 每场景 1 chunk (关键帧 + 字幕)
│   ├─ 场景内 <30s → 整场景 1 chunk
│   └─ 场景内 >30s → 按 10s 分段
│
└─ 音频
    ├─ 会议录音 → VAD 分割 + 每段 1 chunk
    ├─ 播客 → 按话题/段落分割
    └─ 短篇 (<5min) → 整音频 1 chunk
```

### 2.5.3 实战代码（语义感知 Chunking）

```python
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class Chunk:
    id: str
    text: str
    metadata: dict
    embedding_hint: str  # 用于检索时重排序


def chunk_by_headings(text: str, base_metadata: dict = None) -> list[Chunk]:
    """
    基于文档结构（标题层级）的语义感知分块
    
    策略:
    - 识别标题 (# heading1, ## heading2, ### heading3)
    - 每个标题块独立为一个 chunk
    - 标题层级用于 metadata 中的 section_path
    
    Args:
        text: 输入文本 (Markdown 格式)
        base_metadata: 基础元数据
    
    Returns:
        Chunk 列表
    """
    chunks = []
    base_metadata = base_metadata or {}
    
    # 匹配 Markdown 标题
    heading_pattern = re.compile(r'^(#{1,6})\s+(.+)$', re.MULTILINE)
    
    # 找到所有标题位置
    headings = list(heading_pattern.finditer(text))
    
    if not headings:
        # 无标题 → 按段落分割
        paragraphs = re.split(r'\n\s*\n', text)
        for i, para in enumerate(paragraphs):
            if para.strip():
                chunks.append(Chunk(
                    id=f"chunk_para_{i}",
                    text=para.strip(),
                    metadata={**base_metadata, "chunk_strategy": "paragraph", "index": i},
                    embedding_hint=para.strip()[:100],
                ))
        return chunks
    
    # 按标题分割
    for idx, heading in enumerate(headings):
        level = len(heading.group(1))
        title = heading.group(2).strip()
        start = heading.start()
        
        # 计算 chunk 内容范围
        if idx + 1 < len(headings):
            end = headings[idx + 1].start()
        else:
            end = len(text)
        
        content = text[start:end].strip()
        
        chunks.append(Chunk(
            id=f"chunk_h{level}_{title[:20].replace(' ', '_')}",
            text=content,
            metadata={
                **base_metadata,
                "chunk_strategy": "heading",
                "heading_level": level,
                "heading_text": title,
                "section_path": get_section_path(headings, idx),
            },
            embedding_hint=f"{title}: {content[:100]}",
        ))
    
    return chunks


def get_section_path(headings: list, current_idx: int) -> str:
    """计算当前标题的层级路径"""
    path = []
    for h in headings[:current_idx + 1]:
        level = len(h.group(1))
        title = h.group(2).strip()
        path.append(f"L{level}:{title}")
    return " → ".join(path)


# 使用示例
if __name__ == "__main__":
    sample_md = """
# Chapter 1: Introduction

This is the introduction section.

## 1.1 Background

Some background information here.

### 1.1.1 Historical Context

More details...

## 1.2 Problem Statement

The problem we address is...

# Chapter 2: Methodology

## 2.1 Overview

...
"""
    chunks = chunk_by_headings(sample_md, {"source": "report.pdf"})
    for c in chunks:
        print(f"[{c.metadata['chunk_strategy']}] {c.metadata.get('heading_text', 'N/A')}")
        print(f"  text_len={len(c.text)} | path={c.metadata.get('section_path', 'N/A')}")
```

---

# 第 3 章 多模态嵌入与表示学习

> 嵌入是 RAG 的"翻译引擎"——它将不同模态的数据映射到统一语义空间。多模态嵌入的质量直接决定了检索的召回率。

---

## 3.1 多模态嵌入原理

### 3.1.1 统一嵌入空间

传统嵌入仅在一个模态内对齐（如文本-文本），而多模态 RAG 需要 **跨模态语义对齐**：

```
统一嵌入空间示意图 (D = 1024 维)

                    ┌─────────────────────────────────────┐
                    │         统一嵌入空间 (R^1024)        │
                    │                                     │
                    │  ┌───────┐      ┌──────────┐        │
  文本语义          │  │"营收" │──┐    │ [图: 柱  │        │
  向量区域 →        │  │vector│  │    │  状图]   │        │
                    │  └───────┘  │    │vector  │        │
                    │              │    └──────────┘        │
                    │              │         ↗              │
                    │              │    ┌──────────┐        │
                    │  ┌───────┐  │    │ [表: Q3   │        │
                    │  │  Q3   │──┘    │  数据]   │        │
                    │  │vector│  ──→  │vector  │        │
                    │  └───────┘  ──→  └──────────┘        │
                    │                                     │
                    │  ┌──────────┐   ┌──────────┐        │
                    │  │"Revenue"│   │ 柱状图    │        │
                    │  │vector  │   │ vector   │        │
                    │  └──────────┘   └──────────┘        │
                    │                                     │
                    │  ┌──────────┐   ┌──────────┐        │
                    │  │"2025 Q3"│   │ 表格数据   │        │
                    │  │vector  │   │ vector   │        │
                    │  └──────────┘   └──────────┘        │
                    │                                     │
                    │  ←———— 高相似度区域 ———→            │
                    └─────────────────────────────────────┘

核心原则: "营收 2025 Q3" 的文本向量 ≈ 柱状图/表格向量的语义簇
```

### 3.1.2 对比学习框架

多模态嵌入模型通过 **对比学习（Contrastive Learning）** 实现跨模态对齐：

```
对比学习目标函数

┌──────────────────────────────────────────────────────┐
│                                                      │
│  L = -log( exp(sim(z_t, z_i) / τ) /                 │
│               Σ_j exp(sim(z_t, z_j) / τ) )           │
│                                                      │
│  z_t = 文本 encoder(x_text)  →  R^d                  │
│  z_i = 图像 encoder(x_img)   →  R^d                  │
│  sim() = 余弦相似度                                      │
│  τ   = temperature (通常 0.01-0.07)                  │
│  z_j = batch 中的负样本                                 │
│                                                      │
│  目标: 正样本对 (z_t, z_i) 的相似度 >> 负样本对         │
│                                                      │
└──────────────────────────────────────────────────────┘

训练数据构建：
  • 正样本：caption-image 配对 (COCO, LAION)
  • 负样本：batch 内随机配对 + 硬负样本 mining
  • 数据规模：LAION-2B → CLIP; LAION-400M → SigLIP
```

**实战代码（CLIP 风格训练核心）：**

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class ContrastiveLoss(nn.Module):
    """CLIP 风格的 InfoNCE 对比损失"""
    
    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.temperature = temperature
    
    def forward(self, text_features: torch.Tensor,
                image_features: torch.Tensor) -> torch.Tensor:
        """
        Args:
            text_features: (B, D) 文本特征
            image_features: (B, D) 图像特征
        
        Returns:
            对比损失值
        """
        # 归一化
        text_features = F.normalize(text_features, dim=-1)
        image_features = F.normalize(image_features, dim=-1)
        
        # 相似度矩阵 (B, B)
        logits = torch.matmul(text_features, image_features.T) / self.temperature
        
        # 标签：对角线为正样本对
        labels = torch.arange(logits.size(0), device=logits.device)
        
        # InfoNCE loss
        loss_text = F.cross_entropy(logits, labels)
        loss_image = F.cross_entropy(logits.T, labels)
        
        return (loss_text + loss_image) / 2
```

### 3.1.3 多模态对齐架构

```
多模态对齐架构

┌─────────────────────────────────────────────────────┐
│                                                      │
│                    输入数据                           │
│     ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│     │ 文本     │   │ 图像    │   │ 表格     │        │
│     │ "Q3     │   │ 柱状图  │   │ Q3 数据  │        │
│     │ 营收"   │   │ (PNG)   │   │ (HTML)   │        │
│     └────┬────┘   └────┬────┘   └────┬────┘        │
│          │             │             │              │
│          ▼             ▼             ▼              │
│     ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│     │ Text    │   │ Image   │   │ Table   │        │
│     │ Encoder │   │ Encoder │   │ Encoder │        │
│     │ (BERT/  │   │ (CLIP/  │   │ (Graph/ │        │
│     │  BGE)   │   │ SigLIP) │   │  GNN)   │        │
│     └────┬────┘   └────┬────┘   └────┬────┘        │
│          │             │             │              │
│          │    ┌────────┴─────────────┴──┐          │
│          │    │   Projection Head        │          │
│          │    │   (MLP: 768 → 1024 → D) │          │
│          │    └────────────┬─────────────┘          │
│          ▼                ▼                          │
│     ┌─────────────────────────────┐                 │
│     │   统一嵌入空间 (R^D)          │                 │
│     │   z_text || z_image || z_tab │                 │
│     └─────────────────────────────┘                 │
│                                                      │
│     ← 跨模态相似度检索 →                              │
│     sim(z_query, z_doc) for all modalities           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 3.2 图像嵌入模型

### 3.2.1 核心模型对比表

| 模型 | 架构 | 维度 | 训练数据 | 英文精度 (ImageNet) | 中文支持 | 推理速度 | 部署方式 | 适用场景 |
|------|------|------|---------|-------------------|---------|---------|---------|---------|
| **CLIP ViT-L/14** | ViT-L + CLIP | 768 | LAION-400M | 77.6% | ❌ (需微调) | 中 | HuggingFace | **通用场景** |
| **CLIP ViT-B/32** | ViT-B + CLIP | 512 | LAION-400M | 60.9% | ❌ | **快** | HuggingFace | 快速原型/低成本 |
| **SigLIP SO400M** | SiLU + SO400M | 1152 | OIG-mixed | 84.1% | ✅ | 中 | HuggingFace | **精度优先** |
| **SigLIP B/16** | SiLU + B/16 | 768 | OIG-mixed | 76.3% | ✅ | **快** | HuggingFace | 性价比 |
| **EVA-CLIP 1B** | EVA-02 + CLIP | 1152 | OIG-mixed | 83.5% | ✅ | 慢 | HuggingFace | **高质量图像** |
| **Florence-2** | ViT-L | 1024 | COCO | 82.0% | ✅ | 中 | Azure/HF | **图文描述+嵌入** |
| **DINOv2** | ViT-L/14 | 1024 | IG-22K | 82.4% (zero-shot) | ❌ | 中 | HuggingFace | **通用视觉特征** |
| **OpenCLIP** | ViT-G/14 | 1024 | LAION-2B | 79.1% | ✅ | 慢 | HuggingFace | **大规模训练** |

### 3.2.2 选型决策

```
图像嵌入模型选型？
│
├─ 需要中文理解？
│   ├─ 是 → SigLIP (中文支持好) 或 EVA-CLIP (精度更高)
│   └─ 否 → CLIP ViT-L/14 (最通用)
│
├─ 精度优先？
│   └─ 是 → SigLIP SO400M (84.1%) > EVA-CLIP 1B (83.5%)
│
├─ 速度优先？
│   └─ 是 → CLIP ViT-B/32 或 SigLIP B/16
│
├─ 需要图像描述？
│   └─ 是 → Florence-2 (同时提供 caption + 嵌入)
│
└─ 通用视觉特征（不关注文本对齐）？
   └─ 是 → DINOv2 (ViT-L/14)
```

**实战代码（SigLIP 嵌入）：**

```python
from transformers import AutoProcessor, AutoModel
import torch
import torch.nn.functional as F
from PIL import Image


def get_image_embedding_siglip(image_path: str,
                                 device: str = "cuda") -> torch.Tensor:
    """
    使用 SigLIP 获取图像嵌入
    
    Args:
        image_path: 图像路径
        device: 计算设备
    
    Returns:
        归一化嵌入向量 (1, 1152)
    """
    processor = AutoProcessor.from_pretrained("google/siglip-base-patch16-256")
    model = AutoModel.from_pretrained("google/siglip-base-patch16-256")
    
    image = Image.open(image_path).convert("RGB")
    
    # 预处理 + 推理
    inputs = processor(images=image, return_tensors="pt").to(device)
    
    with torch.no_grad():
        image_features = model.get_image_features(**inputs)
    
    # 归一化
    image_features = F.normalize(image_features, dim=-1)
    return image_features.squeeze(0)  # (1152,)
```

---

## 3.3 文本嵌入模型

### 3.3.1 核心模型对比表

| 模型 | 机构 | 维度 | 最大上下文 | 多语言 | MTEB 得分 | 量化支持 | 部署方式 | 适用场景 |
|------|------|------|-----------|-------|----------|---------|---------|---------|
| **BGE-M3** | 智源 | 1024 | 8192 | ✅ (21 语言) | 64.3 | INT8/INT4 | HuggingFace | **中文生产首选** |
| **E5-Mistral-7B** | NVIDIA | 4096 | 4096 | ✅ (英语为主) | 66.4 | INT8 | HuggingFace | **长文本/RAG** |
| **GTE-Qwen2-7B** | 阿里 | 3584 | 8192 | ✅ (多语言) | 65.1 | INT8 | HuggingFace | 中英文混合 |
| **nomic-embed-text** | Nomic | 768 | 8192 | ✅ | 63.5 | INT8 | HuggingFace | **轻量/自托管** |
| **text-embedding-3-small** | OpenAI | 1536/512 | 8191 | ✅ (100+) | 61.2 | — | OpenAI API | **API 优先** |
| **text-embedding-3-large** | OpenAI | 3072 | 8191 | ✅ (100+) | 63.8 | — | OpenAI API | **API 高精度** |
| **bge-large-zh-v1.5** | 智源 | 1024 | 512 | ✅ (中文) | 62.8 | INT8 | HuggingFace | 中文（旧版） |
| **Cohere embed-v3** | Cohere | 1024 | 512/1024 | ✅ (40+) | 64.5 | — | Cohere API | **多语言 API** |

### 3.3.2 选型决策

```
文本嵌入模型选型？
│
├─ 中英混合场景？
│   └─ 是 → BGE-M3 (多语言最优) 或 GTE-Qwen2 (中文更强)
│
├─ 长文档 (>4K tokens)？
│   └─ 是 → E5-Mistral-7B (4K 上下文) 或 BGE-M3 (8K 上下文)
│
├─ 纯中文场景？
│   └─ 是 → BGE-M3 (最新) 或 bge-large-zh (轻量)
│
├─ 自托管部署？
│   └─ 是 → BGE-M3 (INT4 量化，可 16GB 显存跑)
│            或 nomic-embed-text (可 CPU 运行)
│
├─ API 优先？
│   └─ 是 → OpenAI text-embedding-3-large (63.8 MTEB)
│            或 Cohere embed-v3 (40+ 语言)
│
└─ 低成本/边缘？
   └─ 是 → nomic-embed-text-v2 (137M 参数, CPU 友好)
```

**实战代码（BGE-M3）：**

```python
from FlagEmbedding import BGEM3FlagModel
import torch


def get_text_embedding_bge_m3(texts: list[str],
                                device: str = "cuda") -> torch.Tensor:
    """
    使用 BGE-M3 获取文本嵌入
    
    Args:
        texts: 文本列表
        device: 计算设备
    
    Returns:
        嵌入矩阵 (len(texts), 1024)
    """
    model = BGEM3FlagModel(
        'BAAI/bge-m3',
        use_fp16=True,          # FP16 加速 (显存需求减半)
        device=device,
    )
    
    result = model.encode(
        texts,
        batch_size=32,          # 批量编码
        max_length=8192,        # 最大上下文
        return_dense=True,
        return_sparse=False,
        return_colbert_vecs=False,
    )
    
    return torch.tensor(result["dense_vecs"])


# 使用示例
texts = [
    "2025年第三季度营收 1280 万元",
    "Q3 2025 revenue reached 12.8 million yuan",
    "第三季度财务报告",
]
embeddings = get_text_embedding_bge_m3(texts)
print(f"Embedding shape: {embeddings.shape}")  # (3, 1024)
```

---

## 3.4 多模态统一嵌入

### 3.4.1 主流统一嵌入模型对比

| 模型 | 架构 | 模态支持 | 嵌入维度 | 检索精度 (Cross-MTEB) | 训练数据规模 | 适用场景 |
|------|------|---------|---------|----------------------|------------|---------|
| **CLIP (OpenAI ViT-L/14)** | Contrastive | 文本+图像 | 768 | 62.1 | LAION-400M | **通用** |
| **CLIP (OpenCLIP ViT-G/14)** | Contrastive | 文本+图像 | 1024 | 66.8 | LAION-2B | 高质量 |
| **SigLIP-CLIP** | SoftCoFo (Sigmoid) | 文本+图像 | 1152 | 68.3 | OIG-mixed | **精度优先** |
| **EVA-CLIP** | Contrastive | 文本+图像 | 1152 | 67.5 | OIG-mixed | 中文+图像 |
| **LLaVA-NeXT (7B)** | Encoder-Decoder | 文本+图像+视频 | — | 65.2 | 3M+ 图像-文本对 | **图文对话** |
| **BGE-M3 (Cross-encoder)** | Cross-Encoder | 文本+表格+稠密 | 1024 | 64.3 | 多语言多模态 | **中文多模态** |
| **Jina CLIP** | Contrastive | 文本+图像 | 768 | 64.0 | JFT-300M | 生产部署 |
| **FLUX-CLIP** | Contrastive | 文本+图像 | — | — | 大规模 | **生成+检索** |

### 3.4.2 统一嵌入架构

```
统一嵌入空间构建

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  训练阶段 (预训练)                                       │
│  ┌───────────┐    ┌──────────────┐                      │
│  │ 图文配对   │───→│ 对比学习损失  │──→ 统一空间          │
│  │ (正样本)   │    │ (InfoNCE)   │                      │
│  └───────────┘    └──────────────┘                      │
│                                                         │
│  ┌───────────┐    ┌──────────────┐                      │
│  │ 图文配对   │───→│ 对比学习损失  │──→ 统一空间          │
│  │ (负样本)   │    │ (跨 batch)  │                      │
│  └───────────┘    └──────────────┘                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  推理阶段 (检索)                                          │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐    │
│  │ 文本查询  │   │ 图像查询  │   │ 跨模态相似度矩阵   │    │
│  │ z_query  │   │ z_query  │   │ S[i][j] = sim(z,  │    │
│  │ (text)   │   │ (image)  │   │  doc_j) ∀ j       │    │
│  └─────┬────┘   └────┬─────┘   └──────────────────┘    │
│        │             │                                  │
│        └────────┬────┘                                  │
│                 ▼                                        │
│        ┌─────────────────┐                              │
│        │ Top-K 跨模态检索  │                              │
│        │ (所有模态统一排序) │                              │
│        └─────────────────┘                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3.5 表格/图表嵌入

### 3.5.1 表格嵌入方案

表格嵌入的核心挑战是 **保持行列结构信息**：

| 方案 | 原理 | 适用场景 | 工具 | 局限性 |
|------|------|---------|------|--------|
| **Table2Vec** | 将表格转为树/图，用 GNN 编码 | 通用表格 | Tab2Vec / GNN | 大表内存爆炸 |
| **DeepWalk on Tables** | 表格行/列作为节点，Walk 后 Node2Vec | 大型数据库 | NetworkX | 语义丢失 |
| **HTML 序列化** | 表格 → HTML → BGE 编码 | 通用 | pdfplumber → HTML | 丢失视觉布局 |
| **TabLLM** | 表格行/列 token 化 → LLM 编码 | 大表 | TabLLM | 推理慢 |
| **ColPali 表格扩展** | 多向量编码表格单元格 | 高精度 | ColPali | 需要 fine-tune |

**实战代码（HTML 序列化 + BGE）：**

```python
def table_to_html(table_data: list[list[str]]) -> str:
    """将表格数据转为 HTML（保留结构）"""
    html = ["<table>"]
    for row_idx, row in enumerate(table_data):
        tag = "th" if row_idx == 0 else "td"
        html.append(f"<tr>{''.join(f'<{tag}>{cell}</{tag}>' for cell in row)}</tr>")
    html.append("</table>")
    return "".join(html)


def embed_table(table_data: list[list[str]], 
                header: list[str] = None,
                device: str = "cuda") -> tuple[torch.Tensor, str]:
    """
    表格嵌入：HTML 序列化 + 文本嵌入
    
    Args:
        table_data: 表格数据 (二维列表)
        header: 表头 (可选)
        device: 计算设备
    
    Returns:
        (嵌入向量, 序列化文本)
    """
    from FlagEmbedding import BGEM3FlagModel
    
    # 构建结构化文本描述
    desc_parts = []
    if header:
        desc_parts.append(f"Header: {', '.join(header)}")
    
    desc_parts.append(f"Rows: {len(table_data)}")
    desc_parts.append(f"Cols: {len(table_data[0]) if table_data else 0}")
    
    # 将表格转为 HTML
    html = table_to_html(table_data)
    desc_parts.append(f"Content: {html}")
    
    # 拼接为描述性文本
    full_text = " | ".join(desc_parts)
    
    # 使用 BGE 编码
    model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True, device=device)
    result = model.encode(
        [full_text],
        return_dense=True,
    )
    
    return torch.tensor(result["dense_vecs"]), full_text
```

### 3.5.2 图表嵌入

图表（柱状图、折线图、饼图等）的嵌入需要特殊的处理：

```
图表嵌入管线

原始图表图像
     │
     ▼
┌──────────┐    ┌──────────┐    ┌────────────┐
│ 图表类型   │    │ 数据提取   │    │ 嵌入编码   │
│ 检测分类   │───→│ (数据点)  │───→│ (多模态)   │
│ bar/line/ │    │ x,y 值    │    │            │
│ pie/scatter│    │ 标签/刻度  │    │            │
└──────────┘    └──────────┘    └────────────┘
     │               │               │
     ▼               ▼               ▼
  metadata       structured      vector
  (type=bar)    representation   (1024-dim)
```

**推荐工具链：**
- 图表检测：`ChartOCR` 或 `PlotNeuronNet`
- 数据提取：`ChartOCR` 或 `yChart`
- 嵌入：SigLIP (图像) + BGE (提取的数据描述)

---

## 3.6 视频/音频嵌入

### 3.6.1 视频嵌入

| 模型 | 模态 | 维度 | 帧处理 | 时序建模 | 适用场景 |
|------|------|------|--------|---------|---------|
| **Video-CLIP** | 视频+文本 | 512 | 多帧 | 仅空间 | 视频-文本检索 |
| **VideoMAE v2** | 视频 | 1024 | 32帧 | ViT | 通用视频理解 |
| **TimeSformer** | 视频 | 768 | 8帧 | Transformer | 动作识别 |
| **InternVideo2** | 视频+文本 | — | 动态帧 | 多模态 | **多模态 RAG** |
| **MAGiT** | 视频+文本 | 768 | 关键帧 | CLIP | 视频搜索 |

### 3.6.2 音频嵌入

| 模型 | 模态 | 维度 | 上下文窗口 | WER(中文) | 适用场景 |
|------|------|------|-----------|----------|---------|
| **wav2vec 2.0 (base)** | 音频 | 768 | — | — | 通用语音特征 |
| **wav2vec 2.0 (large)** | 音频 | 1024 | — | — | 高精度语音 |
| **Whisper encoder** | 音频 | 1280 | 30s | 10-15% | **ASR+嵌入一体化** |
| **CLAP** | 音频+文本 | 512 | — | — | 音频-文本检索 |

**实战代码（Whisper 音频嵌入）：**

```python
import whisper
import torch
import torch.nn.functional as F


def get_audio_embedding(audio_path: str,
                         device: str = "cuda") -> tuple[torch.Tensor, str]:
    """
    使用 Whisper encoder 获取音频嵌入（同时 ASR）
    
    Args:
        audio_path: 音频路径
        device: 计算设备
    
    Returns:
        (音频嵌入向量, ASR 转录文本)
    """
    model = whisper.load_model("medium", device=device)
    
    # ASR 转录
    result = model.transcribe(audio_path, language="zh")
    transcript = result["text"]
    
    # 获取音频嵌入（从 whisper encoder 的输出）
    with torch.no_grad():
        # 加载音频
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        
        # 特征提取
        mel = whisper.log_mel_spectrogram(audio).to(device)
        features = model.encoder(mel)  # (2000, 1280)
        
        # 全局平均池化
        embedding = F.normalize(features.mean(dim=0), dim=-1)  # (1280,)
    
    return embedding, transcript
```

---

## 3.7 ColPali/Late Interaction 架构

### 3.7.1 核心思想

传统 embedding 的致命缺陷：**将整段文档压缩为单一向量**，丢失细粒度信息。

```
传统 Pipeline vs Late Interaction Pipeline

传统 Pipeline (单向量)                     Late Interaction (多向量)
═════════════════════════════════════════════════════════════════════

文档 "2025 Q3 营收 1280万"                文档 "2025 Q3 营收 1280万"
     │                                        │
     ▼                                        ▼
┌──────────────┐                        ┌──────────┬──────────┬──────────┐
│ 文档编码器    │                       │ "2025"   │ "Q3"     │ "营收"   │
│ (单一向量)    │                       │ token    │ token    │ token    │
│              │                       └────┬─────┴────┬─────┴────┬─────┘
│ ┌──────────┐│                       │         │            │         │
│ │ [0.3,    ││                       ▼         ▼            ▼         ▼
│ │  0.1,    ││                ┌──────────┐ ┌──────────┐ ┌──────────┐
│ │  -0.2, ...││                │"2025"    │ │"Q3"      │ │"营收"    │
│ │ ... ]     ││                │ embedding│ │ embedding│ │ embedding│
│ └──────────┘││                └──────────┘ └──────────┘ └──────────┘
└──────────────┘│                       │         │            │
                 │                       └─────────┴────────────┘
查询 "2025 Q3 营收"                          │
     │                                      ▼
     ▼                              ┌──────────────┐
┌──────────────┐                  │ 逐 token 相似度 │
│ 查询编码器    │                  │ (逐 token 比较) │
│ (单一向量)    │                  └──────┬───────┘
│              │                          │
│ ┌──────────┐│                          ▼
│ │ [0.3,    ││                 ┌──────────────┐
│ │  0.1,    ││                 │ Max/Sum       │
│ │ ... ]     ││                 │ 相似度聚合    │
│ └──────────┘│                 └──────┬───────┘
└──────────────┘                       │
                                       ▼
                              ┌──────────────┐
                              │ 细粒度打分     │
                              │ (更精确)       │
                              └──────────────┘

问题:                              优势:
• 细粒度信息丢失                   • 保留 token 级信息
• 部分相关 = 完全不相关            • 部分匹配可得分
• 长文档平均化                     • 精确匹配权重更高
```

### 3.7.2 ColPali 核心架构

```
ColPali 架构 (基于 ColBERT + PaliGemma)

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  输入: 图像 / 文档页面                                       │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │          PaliGemma Encoder           │                   │
│  │     (基于 PaLI 的多模态 ViT)          │                   │
│  └──────────────┬──────────────────────┘                   │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                   │
│  │          Multi-Vector Embedding      │                   │
│  │         (Token-level features)       │                   │
│  │                                     │                   │
│  │  ┌──────────┐ ┌──────────┐         │                   │
│  │  │ tok1 vec │ │ tok2 vec │   ...   │                   │
│  │  │ d=128    │ │ d=128    │         │                   │
│  │  └──────────┘ └──────────┘         │                   │
│  │         ...                         │                   │
│  │  ┌──────────┐                      │                   │
│  │  │ tokN vec │                      │                   │
│  │  └──────────┘                      │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │          Query Encoder               │                   │
│  │     (同样的 PaliGemma)                │                   │
│  └──────────────┬──────────────────────┘                   │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                   │
│  │       Query Multi-Vector             │                   │
│  │       ┌────┐ ┌────┐ ┌────┐          │                   │
│  │       │q1  │ │q2  │ │q3  │          │                   │
│  │       └────┘ └────┘ └────┘          │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │       Late Interaction (MAxSim)     │                   │
│  │                                     │                   │
│  │  score = Σ_max(sim(q_i, d_j))     │                   │
│  │         for each q_i               │                   │
│  │                                     │                   │
│  │  逐查询 token 与所有文档 token 计算  │                   │
│  │  余弦相似度，取 max，再求和            │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.7.3 与传统 Pipeline 对比

| 维度 | 传统 Pipeline (单向量) | ColPali (Late Interaction) |
|------|---------------------|--------------------------|
| **文档表示** | 1 个向量 (768-dim) | N 个向量 (N tokens × 128-dim) |
| **查询表示** | 1 个向量 (768-dim) | M 个向量 (M tokens × 128-dim) |
| **相似度计算** | 点积 (O(D)) | MAxSim (O(M × N × D)) |
| **细粒度保留** | ❌ 完全丢失 | ✅ 保留全部 token 信息 |
| **部分匹配** | ❌ 平均分降低得分 | ✅ 最高匹配 token 得分 |
| **索引大小** | 小 (768 × N_docs) | 大 (128 × avg_tokens × N_docs) |
| **检索速度** | **快** (FAISS 索引) | 慢 (需逐 token 比较) |
| **召回率** | 中 (60-75%) | **高** (85-95%) |
| **精度 (MRR)** | 0.55-0.70 | **0.75-0.90** |
| **适用场景** | 大规模索引 (>1M 文档) | 中小规模 (1K-100K 文档) |
| **GPU 需求** | 低 | 中-高 |

### 3.7.4 实战代码（ColPali 推理模拟）

```python
import torch
import torch.nn.functional as F


def maxsim_similarities(query_embeddings: torch.Tensor,
                        doc_embeddings: torch.Tensor) -> torch.Tensor:
    """
    ColPali 核心：MaxSim 相似度计算
    
    Args:
        query_embeddings: (M, D) — 查询的多向量 (M tokens)
        doc_embeddings: (N, D) — 文档的多向量 (N tokens)
    
    Returns:
        相似度分数 (1,)
    """
    # 余弦相似度矩阵 (M, N)
    # query 的每个 token 与 doc 的每个 token
    sim_matrix = torch.matmul(
        F.normalize(query_embeddings, dim=-1),
        F.normalize(doc_embeddings, dim=-1).T
    )  # (M, N)
    
    # MaxSim: 对每个 query token，取与文档的最佳匹配
    max_per_query = sim_matrix.max(dim=1).values  # (M,)
    
    # 求和得到最终分数
    score = max_per_query.sum().item()
    return score


def colpali_batch_retrieve(
    query_embeddings: torch.Tensor,   # (M, D)
    doc_embeddings_list: list[torch.Tensor],  # [(N_i, D)]
    top_k: int = 5,
) -> list[dict]:
    """
    ColPali 批量检索
    
    Args:
        query_embeddings: 查询的多向量
        doc_embeddings_list: 文档的多向量列表 (每个文档可能不同长度)
        top_k: 返回 top-k
    
    Returns:
        [(doc_id, score), ...]
    """
    scores = []
    for doc_id, doc_embs in enumerate(doc_embeddings_list):
        score = maxsim_similarities(query_embeddings, doc_embs)
        scores.append((doc_id, score))
    
    # 排序
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_k]


# 使用示例
if __name__ == "__main__":
    # 模拟：查询 "2025 Q3 营收" → 3 tokens
    query_embs = torch.randn(3, 128)
    
    # 模拟：文档库 3 篇文档，每篇 token 数不同
    doc_embs = [
        torch.randn(10, 128),  # 文档 0: 10 tokens
        torch.randn(15, 128),  # 文档 1: 15 tokens
        torch.randn(8, 128),   # 文档 2: 8 tokens
    ]
    
    results = colpali_batch_retrieve(query_embs, doc_embs, top_k=3)
    for doc_id, score in results:
        print(f"  文档 {doc_id}: score={score:.4f}")
```

---

## 3.8 嵌入模型选型决策树

```
嵌入模型选型决策树
═══════════════════════════════════════════════════════════

你的多模态 RAG 场景？
│
├─ 仅文本 → 文本嵌入
│   ├─ 中英混合？
│   │   ├─ 是 → BGE-M3 (多语言最优)
│   │   └─ 否 → E5-Mistral-7B (长文本) 或 nomic-embed-text (轻量)
│   ├─ 文本超长 (>8K)？
│   │   └─ 是 → BGE-M3 (8K) 或 E5-Mistral (4K)
│   └─ 仅需 API？
│       └─ 是 → OpenAI text-embedding-3-large
│
├─ 文本 + 图像 → 多模态统一嵌入
│   ├─ 需要中文理解？
│   │   └─ 是 → EVA-CLIP 或 SigLIP-CLIP
│   ├─ 精度优先？
│   │   └─ 是 → SigLIP-CLIP (68.3 Cross-MTEB)
│   ├─ 需要 Late Interaction？
│   │   └─ 是 → ColPali (基于 PaliGemma)
│   └─ 通用场景 → CLIP ViT-L/14
│
├─ 文本 + 表格 → 混合嵌入
│   ├─ 表格是主要知识？
│   │   └─ 是 → 专用表格索引 + SQL 混合检索
│   └─ 表格是辅助？
│       └─ 是 → HTML 序列化 + BGE 编码
│
├─ 文本 + 视频 → 视频嵌入
│   ├─ 需要帧级检索？
│   │   └─ 是 → Video-CLIP + 关键帧索引
│   └─ 仅需整体理解？
│       └─ 是 → VideoMAE v2 + 全局池化
│
├─ 文本 + 音频 → ASR + 嵌入
│   ├─ 中文？
│   │   └─ 是 → Paraformer-large (ASR) + BGE (嵌入)
│   └─ 英文？
│       └─ 是 → Whisper-large-v3 (ASR) + BGE (嵌入)
│
└─ 全模态（文本+图像+表格+视频+音频）
    └─ Native Multimodal RAG (Phase 3)
        ├─ 核心嵌入 → SigLIP-CLIP (图像) + BGE-M3 (文本)
        ├─ 表格 → HTML + BGE 或 ColPali
        ├─ 视频 → Video-CLIP + 关键帧索引
        ├─ 音频 → Whisper ASR → BGE
        ├─ 融合层 → Cross-Modal Fusion (早期/中期融合)
        └─ 索引 → Milvus/FAISS (多索引 + 联合排序)
```



---

# 第 4 章 跨模态检索引擎（含多模态重排序）

> 检索引擎是 RAG 的「召回层」——它的任务是：在海量多模态数据中，快速找到与查询语义最相关的前 K 个候选项。本章深入探讨跨模态检索的架构设计、各模态检索策略、以及多模态重排序技术。

---

## 4.1 检索架构总览

### 4.1.1 跨模态检索架构

多模态 RAG 的检索层需要同时处理文本、图像、PDF、视频、音频五种模态的候选召回：

```
跨模态检索引擎架构图

═════ 查询输入层 ════
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ 文本  │ │ 图像  │ │ PDF   │ │ 视频  │ │ 音频  │
  │ 查询  │ │ 查询  │ │ 查询  │ │ 查询  │ │ 查询  │
  └───┬─┘ └───┬─┘ └───┬─┘ └───┬─┘ └───┬─┘
      └─┴───┴───┴───┴───┴───┴┘
              │
    ┌─┬────────┴───────┬─┐
    │ 模态路由 (Modal Router) │
    └─┴───────┬───────┴─┘
              │
═════ 检索层 (Retrieval Layer) ════
              │
    ┌─┬───┬─┬───┬──────┐
    │   │   │   │      │
    ▼   ▼   ▼   ▼      ▼
┌─────┐┌───┐┌───┐┌───┐┌───┐
│ 文本  ││ 图像 ││ PDF ││ 视频 ││ 音频 │
│ 检索  ││ 检索 ││ 检索 ││ 检索 ││ 检索 │
│ 引擎  ││ 引擎 ││ 引擎 ││ 引擎 ││ 引擎 │
│       ││       ││       ││       ││       │
│ BM25+  ││ CLIP  ││ Layout ││ 帧级  ││ Whisper│
│ BGE    ││ + DINO││ + OCR ││ 编码  ││ + 嵌入 │
│       ││       ││       ││       ││       │
└───┬─┘└───┬─┘└───┬─┘└───┬─┘└───┬─┘
    └─┴───┴───┴──────┘
              │
═════ 融合与重排序层 ════
              │
    ┌─┬────────┴───────┬─┐
    │  检索结果融合 (Fusion)    │
    │  - RRF 排名融合           │
    │  - 加权融合               │
    │  - Stacking 元排序器      │
    └─┴───────┬───────┴─┘
              │
    ┌─┬────────┴───────┬─┐
    │  多模态重排序 (Re-ranker)  │
    │  - Cross-Encoder (轻量)   │
    │  - 多模态 LLM (深度)      │
    └─┴───────┬───────┴─┘
              │
═════ Top-K 结果 ════
              ▼
    ┌────────┐
    │ Top-K 跨模态检索结果  │
    │ 按相关性排序的候选集    │
    └────────┘
```

### 4.1.2 检索策略矩阵

| 模态 | 基础检索策略 | 高级策略 | 向量库 | 索引方式 |
|------|-------------|---------|--------|--------|
| **文本** | BM25 | Dense Retrieval (BGE) | FAISS/HNSW | Dense + Sparse |
| **图像** | 以图搜图 | Open-Vocabulary (Grounding DINO) | FAISS/Milvus | CLIP 向量 |
| **PDF** | OCR + 版面分析 | Layout Parser + CLIP | FAISS | Dense + Sparse |
| **视频** | 帧采样 | Segment-level + Keyframe | FAISS | Frame + Segment |
| **音频** | ASR + 文本检索 | 音频嵌入 (CLAP) | FAISS | Dense |

### 4.1.3 检索流程决策树

```
检索策略决策树
══════════════
查询输入？
│
├─ 文本查询，需要文本检索？
│   └─ 召回优先？ → BM25 (精确关键词)
│   └─ 语义优先？ → Dense (BGE + FAISS)
│   └─ 中英混合？ → Hybrid (BM25 + BGE)
│
├─ 图像查询，需要图像检索？
│   └─ 精确匹配？ → CLIP 以图搜图
│   └─ 语义匹配？ → CLIP + Open-Vocabulary
│   └─ 需定位目标？ → Grounding DINO + CLIP
│
├─ 文本查询，需要图像检索？
│   └─ 开放词汇搜索？ → OpenAI CLIP / SigLIP
│   └─ 精确定位？ → Grounding DINO + CLIP
│
├─ PDF 文档查询？
│   └─ 全文搜索？ → OCR + BM25
│   └─ 图表理解？ → Layout + CLIP
│   └─ 表格数据？ → HTML序列化 + BGE
│
├─ 视频片段检索？
│   └─ 关键帧级？ → 关键帧提取 + CLIP
│   └─ 片段级？ → Segment 编码 + CLIP
│   └─ 帧级？ → 每帧 CLIP → 帧索引
│
└─ 音频/语音检索？
    └─ 搜索语音内容？ → Whisper ASR + 文本检索
    └─ 按声音内容搜索？ → CLAP 音频嵌入
```

---

## 4.2 图像检索

### 4.2.1 以图搜图（Image-to-Image Retrieval）

以图搜图的核心是将查询图像和索引图像映射到同一嵌入空间，通过余弦相似度进行检索。

```
以图搜图流程

  索引阶段 (Indexing)
  ═══════════
  ┌─────┐    ┌──────┐    ┌───────┐    ┌───────┐
  │ 图像库  │    │ CLIP/SigLIP │    │ 向量索引  │    │ 存储  │
  │ (N 张图) │──→│ 特征提取   │──→│ (FAISS) │──→│ Milvus│
  │        │    │ (批量)    │    │ (HNSW)  │    │ 等   │
  └─────┘    └──────┘    └───────┘    └───────┘
                    │                       │
                    ▼                       ▼
                 z_1, z_2, ..., z_N    (N, D) 向量矩阵

  检索阶段 (Retrieval)
  ═══════════
  ┌─────┐    ┌──────┐    ┌──────┐
  │ 查询图像 │──→│ CLIP 特征 │──→│ Top-K  │
  │ (1张)    │    │ 提取    │    │ 相似度搜索 │
  └─────┘    └──────┘    └──────┘
                    │              │
                    ▼              ▼
                 z_q          返回最相似的 K 张图
```

**关键参数选择：**

| 参数 | 推荐值 | 说明 |
|------|------|------|
| 图像缩放 | 224×224 | CLIP 输入尺寸 |
| 嵌入归一化 | L2 normalize | 余弦相似度等价于点积 |
| FAISS 索引 | HNSW (M=32, efConstruction=200) | 召回率-速度平衡 |
| top-k | 20-50 | 给重排序留候选 |
| 批处理大小 | 256 | GPU 显存利用率 |

**实战代码（CLIP 以图搜图）：**

```python
import torch
import numpy as np
from PIL import Image
from transformers import AutoProcessor, AutoModel
import faiss


class ImageRetriever:
    """
    基于 CLIP 的以图搜图引擎
    """
    
    def __init__(
        self,
        model_name: str = "openai/clip-vit-large-patch14",
        device: str = "cuda",
        batch_size: int = 256,
    ):
        self.device = device
        self.batch_size = batch_size
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(device)
        self.index = None
        self.images = []
        self.metadata = []
    
    def _encode_images(self, images: list[Image.Image]) -> np.ndarray:
        """批量编码图像"""
        inputs = self.processor(
            images=images, return_tensors="pt"
        ).to(self.device)
        
        with torch.no_grad():
            features = self.model.get_image_features(**inputs)
        
        # L2 归一化
        features = features / features.norm(dim=-1, keepdim=True)
        return features.cpu().numpy().astype("float32")
    
    def index_images(self, image_paths: list[str], metadata: list[dict] = None):
        """
        建立图像索引
        
        Args:
            image_paths: 图像路径列表
            metadata: 元数据列表（可选）
        """
        self.images = [Image.open(p).convert("RGB") for p in image_paths]
        self.metadata = metadata or [{} for _ in image_paths]
        
        # 批量编码
        all_embeddings = []
        for i in range(0, len(self.images), self.batch_size):
            batch = self.images[i:i + self.batch_size]
            embeddings = self._encode_images(batch)
            all_embeddings.append(embeddings)
        
        all_embeddings = np.vstack(all_embeddings)  # (N, 768)
        
        # 建立 FAISS HNSW 索引
        dimension = all_embeddings.shape[1]
        self.index = faiss.IndexHNSWFlat(dimension, M=32)
        self.index.hnsw.efSearch = 128
        self.index.add(all_embeddings)
        print(f"索引建立完成: {len(self.images)} 张图像, 维度 {dimension}")
    
    def search(self, query_image: Image.Image, top_k: int = 10) -> list[dict]:
        """
        以图搜图
        
        Args:
            query_image: PIL 图像
            top_k: 返回数量
        
        Returns:
            [(score, metadata), ...]
        """
        query_emb = self._encode_images([query_image])  # (1, 768)
        scores, indices = self.index.search(query_emb, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            results.append({
                "score": float(score),
                "index": int(idx),
                "metadata": self.metadata[idx],
            })
        return results


# 使用示例
if __name__ == "__main__":
    retriever = ImageRetriever(
        model_name="openai/clip-vit-large-patch14",
        device="cuda",
    )
    
    image_paths = ["img1.jpg", "img2.jpg", "img3.jpg"]
    metadata = [
        {"source": "product_catalog", "category": "electronics"},
        {"source": "product_catalog", "category": "clothing"},
        {"source": "product_catalog", "category": "furniture"},
    ]
    retriever.index_images(image_paths, metadata)
    
    query = Image.open("query.jpg").convert("RGB")
    results = retriever.search(query, top_k=5)
    for r in results:
        print(f"score={r['score']:.4f} | category={r['metadata']['category']}")
```

### 4.2.2 开放词汇检索（Open-Vocabulary Image Retrieval）

开放词汇检索允许用户用自然语言描述查询目标，模型无需预定义类别即可检索。

```
开放词汇检索架构

  ┌─────────────────┐     ┌─────────────────┐
  │     索引阶段      │     │     检索阶段      │
  │                   │     │                   │
  │  图像库             │     │  文本查询: "一只橙色的猫" │
  │  ├─ img_01 (猫)   │     │                   │
  │  ├─ img_02 (狗)   │     │                   │
  │  └─ img_03 (车)   │     │                   │
  │                   │     │                   │
  │  ┌───────────┐  │     │  ┌───────────┐    │
  │  │  SigLIP/ViT-L │  │     │  │ BGE/CLIP      │    │
  │  │  图像编码器    │  │     │  │ 文本编码器     │    │
  │  └───┬─────┘  │     │     │  └─────┬─────┘    │
  │      │            │     │          │            │
  │  ┌───▼─────┐  │     │  ┌───▼─────┐  │
  │  │ z_img1 z_img2  │  │     │  │ z_query         │    │
  │  │ z_img3        │  │     │  └─────┬─────┘  │
  │  └───┬─────┘  │     │     │          │            │
  │      │            │     │          │            │
  └───┬───────────┘     │     │          │            │
      │                  │     │          │            │
      └───┬───────────┘     │     │          │            │
            ▼                  │     │          │            │
        ┌───────────────┐      │     │          │            │
        │  跨模态相似度   │      │     │          │            │
        │  sim(z_text,  │      │     │          │            │
        │     z_img)     │      │     │          │            │
        │  ┌───────────┐│      │     │          │            │
        │  │ Top-K 返回  ││      │     │          │            │
        │  │ img_01 (0.85)│      │     │          │            │
        │  └───────────┘│      │     │          │            │
        └───────────────┘      │     │          │            │
```

**实战代码（CLIP 开放词汇检索）：**

```python
from transformers import AutoProcessor, AutoModel
import torch
import torch.nn.functional as F
from PIL import Image


def open_vocabulary_image_retrieval(
    image_paths: list[str],
    query_text: str,
    model_name: str = "openai/clip-vit-large-patch14",
    device: str = "cuda",
    top_k: int = 5,
) -> list[dict]:
    """
    开放词汇图像检索：用文本描述检索图像
    
    Args:
        image_paths: 候选图像路径
        query_text: 文本查询
        model_name: CLIP 模型
        device: 设备
        top_k: 返回数量
    
    Returns:
        [(score, image_path), ...]
    """
    processor = AutoProcessor.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name).to(device)
    
    # 编码所有图像（批量）
    images = [Image.open(p).convert("RGB") for p in image_paths]
    image_inputs = processor(images=images, return_tensors="pt").to(device)
    
    with torch.no_grad():
        image_features = model.get_image_features(**image_inputs)
    
    # 编码文本查询
    text_inputs = processor(text=[query_text], return_tensors="pt").to(device)
    with torch.no_grad():
        text_features = model.get_text_features(**text_inputs)
    
    # 计算相似度 (batch_size, 1)
    image_features = F.normalize(image_features, dim=-1)
    text_features = F.normalize(text_features, dim=-1)
    
    scores = torch.matmul(image_features, text_features.T).squeeze(-1)
    
    # Top-K
    top_indices = torch.topk(scores, min(top_k, len(scores))).indices
    
    results = []
    for idx in top_indices:
        results.append({
            "score": scores[idx].item(),
            "image_path": image_paths[idx],
        })
    
    return results


# 使用示例
if __name__ == "__main__":
    images = ["cat.jpg", "dog.jpg", "car.jpg"]
    query = "一只可爱的橘猫"
    results = open_vocabulary_image_retrieval(images, query)
    for r in results:
        print(f"{r['image_path']}: {r['score']:.4f}")
```

### 4.2.3 Grounding DINO + CLIP（定位式检索）

对于需要**精确定位**目标的场景（如电商商品定位），Grounding DINO 可以框出目标区域，CLIP 进行语义检索。

```
Grounding DINO + CLIP 定位式检索

  查询: "找图中的笔记本电脑"
            │
            ▼
  ┌───────────────────────┐
  │     Grounding DINO    │
  │  (开放词汇目标检测器)    │
  │                       │
  │  ┌───┐ ┌───┐ ┌───┐   │
  │  │ 猫  │ │ 狗  │ │ 猫  │   │
  │  │0.95│ │0.67│ │0.43│   │
  │  └──┬┘ └──┬┘ └──┬┘   │
  │  ┌──▼──┐ ┌──▼──┐ ┌──▼──┐   │
  │  │框1  │ │框2  │ │框3  │   │
  │  └─────┘ └─────┘ └─────┘   │
  └──────┬───────────────────┘
         │ 取 Top-1 框（最高置信度）
         ▼
  ┌───────────────────────┐
  │     CLIP 嵌入          │
  │  crop(box_1) -> z_crop │
  │  sim(z_crop, query) -> score │
  └───────────────────────┘
```

**实战代码（Grounding DINO + CLIP）：**

```python
from groundingdino.util.inference import load_model, predict
from transformers import AutoProcessor, AutoModel
import torch
from PIL import Image
import numpy as np


def grounding_clip_retrieval(
    image_path: str,
    query_text: str,
    groundingdino_model: str = "GroundingDINO_SwinT_OGC",
    clip_model: str = "openai/clip-vit-large-patch14",
    conf_threshold: float = 0.3,
    top_k: int = 3,
) -> list[dict]:
    """
    Grounding DINO + CLIP 定位式检索
    
    Args:
        image_path: 查询图像路径
        query_text: 文本查询（描述要查找的目标）
        groundingdino_model: Grounding DINO 模型名称
        clip_model: CLIP 模型名称
        conf_threshold: 检测置信度阈值
        top_k: 返回裁剪区域数量
    
    Returns:
        裁剪区域及其 CLIP 相似度
    """
    groundingdino_model, _ = load_model(
        "./groundingdino/config/GroundingDINO_SwinT_OGC.py",
        groundingdino_model,
    )
    
    image_pil = Image.open(image_path).convert("RGB")
    
    boxes, logits, phrases = predict(
        model=groundingdino_model,
        image=image_pil,
        caption=query_text,
        box_threshold=conf_threshold,
        text_threshold=conf_threshold,
    )
    
    # 对每个检测框提取 CLIP 嵌入
    processor = AutoProcessor.from_pretrained(clip_model)
    clip_model_model = AutoModel.from_pretrained(clip_model)
    
    crops = []
    for i, (box, logit, phrase) in enumerate(zip(boxes, logits, phrases)):
        if logit < conf_threshold:
            continue
        x1, y1, x2, y2 = box.numpy() * image_pil.size
        crop = image_pil.crop((x1, y1, x2, y2))
        crops.append({
            "crop": crop,
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
            "phrase": phrase,
            "confidence": float(logit),
        })
    
    if not crops:
        return []
    
    # 编码所有裁剪区域
    clip_inputs = processor(images=[c["crop"] for c in crops], return_tensors="pt")
    with torch.no_grad():
        crop_features = clip_model_model.get_image_features(**clip_inputs)
    
    # 编码查询文本
    text_inputs = processor(text=[query_text], return_tensors="pt")
    with torch.no_grad():
        query_features = clip_model_model.get_text_features(**text_inputs)
    
    crop_features = crop_features / crop_features.norm(dim=-1, keepdim=True)
    query_features = query_features / query_features.norm(dim=-1, keepdim=True)
    scores = torch.matmul(crop_features, query_features.T).squeeze(-1)
    
    top_indices = torch.topk(scores, min(top_k, len(scores))).indices
    
    results = []
    for idx in top_indices:
        c = crops[int(idx)]
        results.append({
            "bbox": c["bbox"],
            "phrase": c["phrase"],
            "confidence": c["confidence"],
            "clip_score": float(scores[int(idx)]),
        })
    
    return results


# 使用示例
if __name__ == "__main__":
    results = grounding_clip_retrieval(
        image_path="photo.jpg",
        query_text="笔记本电脑",
        conf_threshold=0.3,
        top_k=3,
    )
    for r in results:
        print(f"bbox={r['bbox']} phrase={r['phrase']} "
              f"conf={r['confidence']:.3f} clip={r['clip_score']:.4f}")
```

---

## 4.3 文本检索

### 4.3.1 BM25 详解

BM25 是经典的稀疏检索算法，对精确关键词匹配敏感：

```
BM25 公式

score(D, Q) = SUM_{q in Q} IDF(q) * [f(q,D) * (k1 + 1)] / [f(q,D) + k1 * (1 - b + b * |D|/avgdl)]

参数说明:
├─ q: 查询词项
├─ D: 文档
├─ f(q, D): 词频 (term frequency)
├─ IDF(q): 逆文档频率
├─ k1: 词频饱和参数 (默认 1.2-2.0)
├─ b: 文档长度归一化参数 (默认 0.75)
├─ |D|: 文档长度
└─ avgdl: 平均文档长度

BM25 的优势:
✓ 精确关键词匹配
✓ 对术语搜索非常敏感
✓ 不需要训练/预训练模型

BM25 的劣势:
✗ 无法理解语义相似度
✗ 无法处理同义词
✗ 无法处理语言差异
```

### 4.3.2 Dense Retrieval

Dense Retrieval 使用深度学习嵌入模型将文本映射为稠密向量：

```
Dense Retrieval Pipeline

  索引阶段:
  ┌───────┐    ┌──────────┐    ┌───────┐
  │ 文档集合  │──→│ BGE/BERT  │──→│ FAISS   │
  │ (N 个 chunk) │  │ 编码     │    │ HNSW 索引 │
  └───────┘    └──────────┘    └───────┘

  检索阶段:
  ┌───────┐    ┌──────────┐    ┌───────┐
  │ 查询文本  │──→│ BGE/BERT  │──→│ Top-K   │
  └───────┘    └──────────┘    └───────┘
```

### 4.3.3 BM25 + Dense 混合检索

混合检索结合 BM25（精确匹配）和 Dense（语义匹配）的优势：

```
混合检索架构

  ┌───────┐
  │  查询文本  │
  └───┬────┘
      │
   ┌─┴─┐
   │ 分发器  │
   └─┬─┘
   ┌─┴─┐    ┌─┴─┐
   ▼     ▼    ▼     ▼
┌──────┐ ┌──────┐ ┌──────┐
│ BM25   │ │ Dense │ │ 融合   │
│ 引擎   │ │ 引擎   │ │ 层     │
│        │ │        │ │        │
│ 关键词  │ │ 语义   │ │ RRF/   │
│ 精确匹配│ │ 相似度 │ │ 加权   │
└───┬──┘ └───┬──┘ └───┬──┘
    │       │          │
    └───┬───┴────────┘
        ▼
   ┌───────┐
   │ Top-K 结果  │
   │ (跨引擎融合) │
   └───────┘
```

**实战代码（混合检索 RRF 融合）：**

```python
from rank_bm25 import BM25Okapi
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel


class HybridRetriever:
    """
    BM25 + Dense 混合检索引擎
    """
    
    def __init__(
        self,
        dense_model_name: str = "BAAI/bge-m3",
        dense_dim: int = 1024,
        bm25_k1: float = 1.5,
        bm25_b: float = 0.75,
        dense_weight: float = 0.5,
        bm25_weight: float = 0.5,
    ):
        self.dense_weight = dense_weight
        self.bm25_weight = bm25_weight
        
        # BM25
        self.bm25 = None
        self.docs = []
        
        # Dense
        self.tokenizer = AutoTokenizer.from_pretrained(dense_model_name)
        self.model = AutoModel.from_pretrained(dense_model_name)
        self.dense_dim = dense_dim
        self.dense_embeddings = None
    
    def index_documents(self, texts: list[str], embeddings: np.ndarray = None):
        """构建索引"""
        self.docs = texts
        import jieba
        tokenized_docs = [list(jieba.cut(doc)) for doc in texts]
        self.bm25 = BM25Okapi(tokenized_docs)
        
        if embeddings is None:
            self.dense_embeddings = self._encode_batch(texts)
        else:
            self.dense_embeddings = embeddings
        
        print(f"索引构建完成: {len(texts)} 文档, 维度 {self.dense_dim}")
    
    def _encode_batch(self, texts: list[str], batch_size: int = 32) -> np.ndarray:
        """批量编码"""
        all_embs = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            inputs = self.tokenizer(
                batch, padding=True, truncation=True, max_length=8192,
                return_tensors="pt"
            )
            with torch.no_grad():
                outputs = self.model(**inputs)
            emb = torch.nn.functional.normalize(outputs.last_hidden_state[:, 0, :], dim=-1)
            all_embs.append(emb.cpu().numpy())
        return np.vstack(all_embs)
    
    def retrieve(self, query: str, top_k: int = 20) -> list[dict]:
        """混合检索：BM25 + Dense，使用 RRF 融合"""
        import jieba
        query_tokens = list(jieba.cut(query))
        bm25_scores = self.bm25.get_scores(query_tokens)
        
        query_emb = self._encode_batch([query])[0]
        dense_scores = self.dense_embeddings @ query_emb
        
        bm25_rrf = self._rrf_normalize(bm25_scores)
        dense_rrf = self._rrf_normalize(dense_scores)
        combined = self.bm25_weight * bm25_rrf + self.dense_weight * dense_rrf
        
        top_indices = np.argsort(combined)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                "doc_id": int(idx),
                "doc_text": self.docs[idx],
                "bm25_score": float(bm25_scores[idx]),
                "dense_score": float(dense_scores[idx]),
                "combined_score": float(combined[idx]),
            })
        return results
    
    @staticmethod
    def _rrf_normalize(scores: np.ndarray, k: float = 60) -> np.ndarray:
        """RRF 归一化"""
        with np.errstate(divide="ignore"):
            rrf = np.where(scores > 0, 1.0 / (k + np.argsort(np.argsort(scores))[::-1]), 0)
        return rrf


# 使用示例
if __name__ == "__main__":
    retriever = HybridRetriever(
        dense_model_name="BAAI/bge-m3", dense_dim=1024,
        bm25_weight=0.5, dense_weight=0.5,
    )
    docs = [
        "2025年第三季度公司营收 1280 万元",
        "Q3 2025 revenue reached 12.8 million",
        "财务报告中提到的增长率数据",
    ]
    retriever.index_documents(docs)
    results = retriever.retrieve("2025 Q3 营收增长", top_k=2)
    for r in results:
        print(f"doc={r['doc_id']} combined={r['combined_score']:.4f}")
```

### 4.3.4 多语言混合检索对比

| 检索策略 | 中文精度 | 英文精度 | 中英混合 | 速度 | 部署复杂度 | 适用场景 |
|---------|--------|---------|---------|------|-----------|---------|
| **BM25 only** | 中 (需分词) | 高 | 低 | **极快** | 极低 | 关键词精确搜索 |
| **Dense only (BGE)** | **高** | **高** | 高 | 快 | 中 | 通用语义检索 |
| **BM25 + Dense (RRF)** | **高** | **高** | **高** | 中 | 中 | **生产推荐** |
| **ColBERT (late interaction)** | 高 | **极高** | 高 | 慢 | 高 | 高精度场景 |
| **Splade (sparse dense)** | 中 | 高 | 中 | 快 | 中 | 多语言 sparse |

---

## 4.4 PDF/文档检索

### 4.4.1 PDF 多路检索策略

PDF 包含文本层、图像层、表格层，需要分层处理：

```
PDF 多路检索策略

  原始 PDF
    │
    ▼
┌──────────┐
│  Layout  │
│  Parser  │
│(doclayout)│
└───┬───┬──┘
    │   │    │
┌─▼──┐┌▼──┐┌▼──┐
│文本块││图像块││表格块│
│      ││      ││      │
│BM25  ││  CLIP ││ HTML │
│BGE    ││      ││ BGE  │
└──┬──┘└──┬──┘└──┬──┘
   └───┬──────┬──────┘
       │      │
    ┌──▼──┐
    │ 结果融合  │
    │ RRF/加权 │
    └──┬──┘
       ▼
    ┌──────────┐
    │ Top-K PDF  │
    │ 段落/页面    │
    └──────────┘
```

**实战代码（PDF 解析 + 混合检索）：**

```python
from pdfplumber import open as pdf_open
import fitz  # PyMuPDF
from transformers import AutoProcessor, AutoModel
from PIL import Image
import numpy as np


class PDFRetriever:
    """PDF 多路检索引擎"""
    
    def __init__(self):
        self.pages = []
        self.text_chunks = []
        self.image_chunks = []
    
    def load_pdf(self, pdf_path: str, page_limit: int = None):
        """加载并解析 PDF"""
        with pdf_open(pdf_path) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                if page_limit and page_idx >= page_limit:
                    break
                
                text = page.extract_text() or ""
                images = []
                for img in page.images:
                    doc = fitz.open(pdf_path)
                    pix = doc[page_idx].get_pixmap(dpi=200)
                    img_data = Image.frombytes("RGB", [pix.width, pix.height], pix.tobytes())
                    images.append(img_data)
                
                tables = []
                for table in page.extract_tables():
                    tables.append("\n".join("\t".join(str(cell) for cell in row) for row in table))
                
                self.pages.append({
                    "page": page_idx + 1, "text": text,
                    "images": images, "tables": tables, "bbox": page.bbox,
                })
        print(f"PDF 加载完成: {len(self.pages)} 页")
    
    def chunk_pages(self, max_chunk_chars: int = 512) -> list[dict]:
        """将页面拆分为文本块"""
        self.text_chunks = []
        self.image_chunks = []
        for page_info in self.pages:
            text = page_info["text"]
            for i in range(0, len(text), max_chunk_chars):
                self.text_chunks.append({
                    "text": text[i:i + max_chunk_chars],
                    "page": page_info["page"], "type": "text",
                })
            for img_idx, img in enumerate(page_info["images"]):
                self.image_chunks.append({
                    "image": img, "page": page_info["page"], "type": "image",
                })
        print(f"分块: {len(self.text_chunks)} 文本 + {len(self.image_chunks)} 图像")
        return self.text_chunks
    
    def retrieve(self, query: str, top_k: int = 10) -> list[dict]:
        """混合检索：文本 BM25 + Dense + 图像 CLIP"""
        from rank_bm25 import BM25Okapi
        import jieba
        from FlagEmbedding import BGEM3FlagModel
        
        tokenized = [list(jieba.cut(c["text"])) for c in self.text_chunks]
        bm25 = BM25Okapi(tokenized)
        bm25_scores = bm25.get_scores(list(jieba.cut(query)))
        
        bge_model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True, device="cuda")
        text_embs = bge_model.encode([c["text"] for c in self.text_chunks], return_dense=True)["dense_vecs"]
        query_emb = bge_model.encode([query], return_dense=True)["dense_vecs"]
        dense_scores = (text_embs @ query_emb.T).squeeze().numpy()
        
        combined = 0.5 * self._normalize(bm25_scores) + 0.5 * self._normalize(dense_scores)
        top_indices = np.argsort(combined)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            chunk = self.text_chunks[idx]
            results.append({
                "type": "text", "page": chunk["page"],
                "score": float(combined[idx]), "text": chunk["text"][:200] + "...",
            })
        return results
    
    @staticmethod
    def _normalize(scores: np.ndarray) -> np.ndarray:
        s_min, s_max = scores.min(), scores.max()
        if s_max == s_min:
            return np.zeros_like(scores)
        return (scores - s_min) / (s_max - s_min)


# 使用示例
if __name__ == "__main__":
    retriever = PDFRetriever()
    retriever.load_pdf("report.pdf")
    retriever.chunk_pages(max_chunk_chars=512)
    results = retriever.retrieve("Q3 营收数据", top_k=5)
    for r in results:
        print(f"page={r['page']} type={r['type']} score={r['score']:.4f}")
```

---

## 4.5 视频检索

### 4.5.1 视频检索层级架构

```
视频检索层级架构

  ┌──── 原始视频 ────────────────┐
  │                               │
  ▼                               ▼
┌──────────────┐        ┌──────────────┐
│   帧级检索      │        │   片段级检索    │
│ (Frame-level)  │        │ (Segment-level) │
│                │        │              │
│ 每帧独立编码     │        │ 滑动窗口分段   │
│ (1-16帧/段)   │        │ (30-60帧/段) │
│                │        │              │
│ 精度: **最高**   │        │ 精度: 中        │
│ 速度: **最慢**   │        │ 速度: 中        │
│ 存储: **最大**   │        │ 存储: 中        │
└──────────────┘        └──────────────┘

            ┌──────────────┐
            │   关键帧级检索  │
            │ (Keyframe-level)│
            │                │
            │ 基于变化检测     │
            │ (差分阈值法)     │
            │ (每 1-3 秒)     │
            │                │
            │ 精度: 中         │
            │ 速度: **最快**   │
            │ 存储: **最小**   │
            └──────────────┘
            
              推荐: 关键帧级 (性价比最优)
```

### 4.5.2 帧级/片段级/关键帧级对比

| 策略 | 时间粒度 | 精度 | 速度 | 存储 | 适用场景 |
|------|---------|------|------|------|---------|
| **帧级** | 1帧 (33ms) | ★★ | ★★ | ★★★★★ | 精确时间戳检索 |
| **片段级** | 30-60帧 (1-2s) | ★★★★ | ★★★ | ★★★★ | 场景/事件检索 |
| **关键帧级** | 1-3秒 | ★★★ | ★★★★★ | ★★ | 快速浏览/索引 |

### 4.5.3 关键帧提取策略

```
关键帧提取算法

  原始视频 (30fps, 10min)
  ┌─────────────────────────────┐
  │ █████░░░░████████░░░░░░░████░░│
  │  (█=画面变化大, ░=画面变化小)   │
  └─────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────┐
  │  帧差分法 (Frame Difference)  │
  │                               │
  │  diff = ||Frame(t) - F(t-1)|| │
  │                               │
  │  if diff > threshold:         │
  │      keyframe = Frame(t)      │
  │  if t - last_key > min_gap:   │
  │      keyframe = Frame(t)      │
  └─────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────┐
  │  关键帧集合 (约 200 帧/18000帧) │
  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
  │  │ KF1│ │ KF2│ │ KF3│ │ KF4│  │
  │  └───┘ └───┘ └───┘ └───┘   │
  │  时间戳: 0.5s │ 3.2s │ 7.1s  │
  └─────────────────────────────┘
```

**实战代码（视频检索）：**

```python
import cv2
import numpy as np
from PIL import Image
from transformers import AutoProcessor, AutoModel
import torch


class VideoRetriever:
    """视频检索引擎（关键帧级 + CLIP）"""
    
    def __init__(self, clip_model: str = "openai/clip-vit-large-patch14",
                 diff_threshold: float = 30.0, device: str = "cuda"):
        self.device = device
        self.diff_threshold = diff_threshold
        self.processor = AutoProcessor.from_pretrained(clip_model)
        self.model = AutoModel.from_pretrained(clip_model).to(device)
        self.keyframes = []
    
    def extract_keyframes(self, video_path: str, max_frames: int = 500) -> list[dict]:
        """关键帧提取"""
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        prev_frame = None
        keyframes = []
        min_gap = int(fps * 1.0)
        last_idx = -min_gap
        
        for frame_idx in range(total):
            ret, frame = cap.read()
            if not ret:
                break
            if frame_idx - last_idx < min_gap:
                continue
            
            current = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            if prev_frame is not None:
                diff = cv2.absdiff(current, prev_frame)
                diff_score = np.mean(diff)
                if diff_score > self.diff_threshold:
                    last_idx = frame_idx
                    keyframes.append({
                        "frame": Image.fromarray(current),
                        "timestamp": frame_idx / fps,
                        "frame_idx": frame_idx,
                        "diff_score": diff_score,
                    })
            else:
                last_idx = frame_idx
                keyframes.append({
                    "frame": Image.fromarray(current),
                    "timestamp": 0.0, "frame_idx": frame_idx,
                    "diff_score": 0.0,
                })
            prev_frame = current.copy()
            if len(keyframes) >= max_frames:
                break
        cap.release()
        self.keyframes = keyframes
        print(f"关键帧: {len(keyframes)} 帧 (原始 {total})")
        return keyframes
    
    def index_keyframes(self) -> np.ndarray:
        """对关键帧进行 CLIP 编码"""
        images = [kf["frame"] for kf in self.keyframes]
        all_embs = []
        for i in range(0, len(images), 32):
            batch = images[i:i + 32]
            inputs = self.processor(images=batch, return_tensors="pt").to(self.device)
            with torch.no_grad():
                features = self.model.get_image_features(**inputs)
            features = features / features.norm(dim=-1, keepdim=True)
            all_embs.append(features.cpu().numpy())
        self.keyframe_embeddings = np.vstack(all_embs)
        return self.keyframe_embeddings
    
    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """视频语义检索"""
        inputs = self.processor(text=[query], return_tensors="pt").to(self.device)
        with torch.no_grad():
            query_features = self.model.get_text_features(**inputs)
        query_features = query_features / query_features.norm(dim=-1, keepdim=True)
        
        scores = self.keyframe_embeddings @ query_features.T.cpu().numpy().squeeze()
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            kf = self.keyframes[idx]
            results.append({
                "timestamp": kf["timestamp"], "frame_idx": kf["frame_idx"],
                "score": float(scores[idx]), "image": kf["frame"],
            })
        return results


# 使用示例
if __name__ == "__main__":
    retriever = VideoRetriever(diff_threshold=30.0)
    retriever.extract_keyframes("video.mp4")
    retriever.index_keyframes()
    results = retriever.search("猫咪在客厅玩耍", top_k=3)
    for r in results:
        print(f"t={r['timestamp']:.1f}s frame={r['frame_idx']} score={r['score']:.4f}")
```

---

## 4.6 音频/语音检索

### 4.6.1 音频检索架构

音频检索有两种策略：**ASR 转文本 + 文本检索**（主流）和 **直接音频嵌入检索**（新兴）：

```
音频检索策略对比

  ┌───────────────┐    ┌───────────────┐
  │   策略 A: ASR+文本  │    │   策略 B: 音频嵌入   │
  │                   │    │                   │
  │  ┌─────┐          │    │  ┌─────┐          │
  │  │音频   │→│ Whisper│→│文本 │→│ BGE/CLIP│  │
  │  └─────┘  └─────┘  │    │  └─────┐          │
  │                     │    │  │CLAP   │→│音频嵌入 │
  │  优势:              │    │  └─────┘  └─────┘  │
  │  ✓ 成熟文本检索      │    │                   │
  │  ✓ 精确关键词        │    │  ✓ 可检索音乐/音效  │
  │  ✓ 中文支持好       │    │  ✗ 多语言弱         │
  └───────────────┘    └───────────────┘

  推荐: 策略 A (ASR + 文本) 为主，策略 B 为辅
```

### 4.6.2 ASR 引擎选型对比

| 引擎 | 多语言 | 中文WER | 英文WER | 实时性 | 自托管 | API 成本 |
|------|--------|--------|--------|--------|--------|--------|
| **Whisper-large-v3** | 99+ | 5.8% | 2.1% | 离线 | ✅ | 免费 |
| **Paraformer-large** | 中文 | **3.2%** | ❌ | 实时 | ✅ | 免费 |
| **SenseVoice-Small** | 12+ | 4.1% | 3.5% | 实时 | ✅ | 免费 |
| **NVIDIA NeMo** | 10+ | 5.2% | 1.8% | 实时 | ✅ | 免费 |
| **Azure Speech** | 100+ | 4.5% | 1.5% | **实时** | ❌ | **收费** |
| **Google Speech** | 125+ | 5.0% | 1.7% | **实时** | ❌ | **收费** |

### 4.6.3 实战代码（ASR + 检索）

```python
import whisper
import torch
from transformers import AutoTokenizer, AutoModel
import jieba
import numpy as np


class AudioRetriever:
    """音频检索引擎: Whisper ASR + BGE Dense 检索"""
    
    def __init__(self, whisper_model: str = "medium", bge_model: str = "BAAI/bge-m3"):
        self.model = whisper.load_model(whisper_model, device="cuda")
        self.tokenizer = AutoTokenizer.from_pretrained(bge_model)
        self.embedder = AutoModel.from_pretrained(bge_model)
        self.segments = []
        self.embeddings = None
    
    def transcribe(self, audio_path: str, language: str = "zh") -> list[dict]:
        """Whisper ASR 转录"""
        result = self.model.transcribe(audio_path, language=language, verbose=False, beam_size=5)
        self.segments = [
            {"text": seg["text"].strip(), "start": seg["start"],
             "end": seg["end"], "duration": seg["end"] - seg["start"]}
            for seg in result["segments"] if seg["end"] - seg["start"] >= 1.0
        ]
        print(f"ASR 完成: {len(self.segments)} 个段落")
        return self.segments
    
    def index_segments(self):
        """对 ASR 结果建立嵌入索引"""
        texts = [s["text"] for s in self.segments]
        inputs = self.tokenizer(texts, padding=True, truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            outputs = self.embedder(**inputs)
        self.embeddings = torch.nn.functional.normalize(outputs.last_hidden_state[:, 0, :], dim=-1).cpu().numpy()
    
    def retrieve(self, query: str, top_k: int = 5) -> list[dict]:
        """音频内容检索"""
        query_inputs = self.tokenizer([query], padding=True, truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            query_out = self.embedder(**query_inputs)
        query_emb = torch.nn.functional.normalize(query_out.last_hidden_state[:, 0, :], dim=-1).cpu().numpy()
        
        scores = self.embeddings @ query_emb.T
        top_indices = np.argsort(scores.squeeze())[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            seg = self.segments[idx]
            results.append({"text": seg["text"], "start": seg["start"],
                            "end": seg["end"], "score": float(scores[idx]), "duration": seg["duration"]})
        return results


# 使用示例
if __name__ == "__main__":
    retriever = AudioRetriever(whisper_model="medium")
    retriever.transcribe("meeting.mp3", language="zh")
    retriever.index_segments()
    results = retriever.retrieve("关于预算审批的讨论", top_k=3)
    for r in results:
        print(f"[{r['start']:.1f}s - {r['end']:.1f}s] score={r['score']:.4f}")
```

---

## 4.7 检索结果融合与重排序

### 4.7.1 融合策略对比

| 策略 | 精度 | 速度 | 复杂度 | 适用场景 |
|------|------|------|--------|---------|
| **RRF** | ★★★★ | ★★★★★ | ★★ | **通用推荐** |
| **加权融合** | ★★★★ | ★★★★★ | ★★ | 多引擎加权 |
| **Stacking** | ★★★★★ | ★★★ | ★★★★ | 高精度场景 |
| **MaxScore** | ★★★ | ★★★★★ | ★ | 快速原型 |
| **MinScore** | ★★ | ★★★★★ | ★ | 精确匹配 |

### 4.7.2 RRF (Reciprocal Rank Fusion)

RRF 是微软提出的经典排名融合算法，不依赖分数，只依赖排名：

```
RRF 公式

F(q, d) = SUM_{s in Scores} k / (k + rank_s(d))

参数:
├─ q: 查询
├─ d: 文档
├─ rank_s(d): 文档 d 在引擎 s 中的排名
├─ k: 平滑参数 (通常 60)
└─ 核心: 排名越高 → 贡献越大

优势:
✓ 无需分数校准 ✓ 对排名敏感 ✓ 简单高效 O(N log N)
```

**实战代码（RRF 融合）：**

```python
import numpy as np
from typing import list, dict


def rrf_fusion(results_list: list[list[dict]], k: float = 60, top_k: int = 20) -> list[dict]:
    """RRF 融合多个检索引擎的结果"""
    doc_scores = {}
    for results in results_list:
        for rank, doc in enumerate(results, start=1):
            doc_id = doc["id"]
            if doc_id not in doc_scores:
                doc_scores[doc_id] = 0.0
            doc_scores[doc_id] += k / (k + rank)
    
    sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)
    return [{"id": did, "rrf_score": float(s)} for did, s in sorted_docs[:top_k]]


# 使用示例
if __name__ == "__main__":
    bm25_r = [{"id": 0, "score": 0.95}, {"id": 3, "score": 0.82}, {"id": 1, "score": 0.78}]
    dense_r = [{"id": 1, "score": 0.91}, {"id": 0, "score": 0.88}, {"id": 2, "score": 0.75}]
    clip_r = [{"id": 2, "score": 0.93}, {"id": 1, "score": 0.85}, {"id": 0, "score": 0.72}]
    
    fused = rrf_fusion([bm25_r, dense_r, clip_r], k=60, top_k=3)
    for r in fused:
        print(f"doc_id={r['id']} rrf_score={r['rrf_score']:.4f}")
```

### 4.7.3 Stacking 元排序器

```
Stacking 元排序器架构

  ┌────────┐ ┌────────┐ ┌────────┐
  │ BM25   │ │ Dense  │ │ CLIP   │
  │ rank   │ │ rank   │ │ rank   │
  └───┬─┘  └───┬─┘  └───┬─┘
      │        │         │
      ▼        ▼         ▼
  ┌──────────────────────┐
  │ 特征向量               │
  │ [0.85, 0.72, 0.91]   │
  └──────┬───────────────┘
         ▼
  ┌──────────────┐
  │ 元排序器       │
  │ (XGBoost/ LR) │
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 最终排序分数   │
  └──────────────┘
```

**实战代码（Stacking 元排序器）：**

```python
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


class StackingReranker:
    """Stacking 元排序器: 使用 LR/XGBoost 融合多个检索信号"""
    
    def __init__(self, model_type: str = "lr"):
        self.model_type = model_type
        self.scaler = StandardScaler()
        self.model = None
        self.is_trained = False
    
    def _build_features(self, docs: list[dict], engines: list[list[dict]]) -> np.ndarray:
        """构建特征: score + rank + normalized_rank 每个引擎 3 维"""
        n_docs = len(docs)
        n_engines = len(engines)
        features = np.zeros((n_docs, n_engines * 3))
        
        for doc_idx, doc in enumerate(docs):
            for eng_idx, engine_results in enumerate(engines):
                rank, score = None, None
                for r_idx, r in enumerate(engine_results):
                    if r["id"] == doc["id"]:
                        rank = r_idx + 1
                        score = r.get("score", 0.0)
                        break
                base = eng_idx * 3
                features[doc_idx, base] = score or 0.0
                features[doc_idx, base + 1] = rank or 999
                features[doc_idx, base + 2] = (rank or 999) / (len(engine_results) + 1)
        return features
    
    def train(self, queries: list[list[dict]], labels: list[int]):
        """训练元排序器"""
        features_list = [self._build_features(docs, queries) for docs in queries]
        X = self.scaler.fit_transform(np.vstack(features_list))
        y = np.array(labels)
        
        if self.model_type == "lr":
            self.model = LogisticRegression(C=1.0, max_iter=1000)
        else:
            from xgboost import XGBClassifier
            self.model = XGBClassifier(n_estimators=100, max_depth=3, learning_rate=0.1)
        self.model.fit(X, y)
        self.is_trained = True
        print(f"元排序器训练完成: {self.model_type}")
    
    def rerank(self, docs: list[dict], engines: list[list[dict]], top_k: int = 20) -> list[dict]:
        """对候选文档重排序"""
        if not self.is_trained:
            return rrf_fusion(engines, top_k=top_k)
        
        features = self.scaler.transform(self._build_features(docs, engines))
        scores = self.model.predict_proba(features)[:, 1]
        
        scored = list(zip(docs, scores))
        scored.sort(key=lambda x: x[1], reverse=True)
        return [{**doc, "rerank_score": float(score)} for doc, score in scored[:top_k]]
```

### 4.7.4 融合策略选型决策树

```
融合策略选型？
│
├─ 快速原型 / 小规模？
│   └─ 是 → RRF (简单、无需训练)
│
├─ 有标注数据？
│   ├─ 是 → Stacking (XGBoost, 可学习最优权重)
│   └─ 否 → RRF (无监督融合)
│
├─ 各引擎分数范围一致？
│   ├─ 是 → 加权融合 (可手动调权)
│   └─ 否 → RRF (不依赖分数)
│
└─ 精度优先？
   └─ 是 → 2-Stage: RRF粗筛 -> Stacking精排
```

---

## 4.8 多模态重排序

> 重排序（Re-ranking）是 RAG 的「精排层」——它的任务是：对粗排阶段召回的前 K 个候选，进行更精细的相关性打分。

### 4.8.1 轻量 Cross-Encoder vs 深度多模态 LLM

```
重排序方案对比

  ┌───┬───┬──────────┬───────────────┐
  │ 维度 │ Cross-Encoder │ 多模态 LLM      │
  ├───┼──────────┼───────────────┤
  │ 模型   │ BGE-reranker-v2-m3 │ GPT-4o / Qwen2.5-VL │
  ├───┼──────────┼───────────────┤
  │ 精度提升(BM25→) │ +15-25%     │ +20-35%       │
  │ 速度 (QPS/GPU)  │ ~500 QPS   │ ~200 QPS (7B) │
  │ 成本 (per 10K) │ ¥0.5        │ ¥2-300        │
  │ 跨模态理解       │ ❌ 仅文本    │ ✅ 原生支持     │
  │ 结构化输出       │ 中          │ **高**         │
  │ 幻觉风险        │ 极低        │ 中 (需抑制)     │
  │ 文本精排推荐    │ **✓✓**      │ ✓             │
  │ 图像/视频精排    │ ✗           │ **✓✓**        │
  │ 实时低延迟       │ **✓✓**      │ ✗             │
  │ 低成本生产部署   │ **✓✓**      │ ✗ (成本高)     │
  └───┴──────────┴───────────────┘
```

### 4.8.2 Cross-Encoder 重排序

**实战代码（BGE-reranker-v2）：**

```python
from FlagEmbedding import FlagReranker


class CrossEncoderReranker:
    """Cross-Encoder 重排序器 (BGE-reranker-v2-m3)"""
    
    def __init__(self, model_name: str = "BAAI/bge-reranker-v2-m3",
                 device: str = "cuda", batch_size: int = 32):
        self.model = FlagReranker(model_name, use_fp16=True, device=device)
        self.batch_size = batch_size
    
    def rerank(self, query: str, documents: list[str], top_k: int = 10) -> list[dict]:
        """Cross-Encoder 重排序"""
        pairs = [(query, doc) for doc in documents]
        all_scores = []
        for i in range(0, len(pairs), self.batch_size):
            batch = pairs[i:i + self.batch_size]
            scores = self.model.compute_score(batch, normalize=True)
            all_scores.extend(scores)
        
        scored = sorted(zip(documents, all_scores), key=lambda x: x[1], reverse=True)
        return [{"doc": doc, "score": float(score)} for doc, score in scored[:top_k]]


# 使用示例
if __name__ == "__main__":
    reranker = CrossEncoderReranker()
    docs = [
        "2025年第三季度公司营收达到 1280 万元",
        "公司成立于 2010 年，总部位于北京",
        "2024年Q3 营收 1050 万元，同比增长 18%",
    ]
    results = reranker.rerank("2025年Q3营收数据", docs, top_k=2)
    for r in results:
        print(f"score={r['score']:.4f} | {r['doc'][:50]}...")
```

### 4.8.3 多模态 LLM 重排序

```
多模态 LLM 重排序架构

  ┌───────────────────────────────────────┐
  │           多模态 LLM 重排序器              │
  │                                         │
  │  输入:                                  │
  │  查询: "猫" + 候选图 img_1, img_2, img_3 │
  │                                         │
  │  ┌───┐   ┌───┐   ┌───┐                │
  │  │多模 │──→│ 共享   │──→│ 评分输出      │
  │  │态编码 │  投影层  │  └───────────────┘ │
  │  └───┘   └───┘                         │
  │                                         │
  │  输出:                                  │
  │  1. 相关性分数 (1-10)                     │
  │  2. 理由 (free text)                     │
  │  3. 置信度 (high/med/low)                 │
  └───────────────────────────────────────┘
```

**实战代码（多模态 LLM 重排序）：**

```python
import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from PIL import Image
import json


class MultimodalLLMReranker:
    """基于 Qwen2.5-VL 的多模态 LLM 重排序器"""
    
    def __init__(self, model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
                 device: str = "cuda", max_new_tokens: int = 256):
        self.device = device
        self.processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name, torch_dtype=torch.float16, device_map="auto",
            trust_remote_code=True,
        )
    
    def rerank(self, query: str, candidates: list[dict], top_k: int = 5) -> list[dict]:
        """多模态 LLM 重排序"""
        results = []
        
        for candidate in candidates:
            messages = [{
                "role": "user",
                "content": [
                    {"type": "image", "image": candidate["image"]},
                    {"type": "text", "text": f"""请评估以下图片与查询的相关性。
查询: {query}
描述: {candidate.get('text', '无描述')}

请严格按照 JSON 格式输出:
- relevance: 相关性分数 (1-10)
- reason: 简要理由
- confidence: confidence (high/medium/low)

只输出 JSON。"""},
                ],
            }]
            
            text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = self.processor(text=[text], images=[candidate["image"]],
                                    padding=True, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                output_ids = self.model.generate(**inputs, max_new_tokens=self.max_new_tokens,
                                                 do_sample=False, temperature=0.1)
            
            generated = self.processor.decode(output_ids[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
            try:
                score = json.loads(generated)
                results.append({"id": candidate["id"], "image": candidate["image"],
                                "relevance": int(score.get("relevance", 5)),
                                "reason": score.get("reason", ""), "confidence": score.get("confidence", "low")})
            except json.JSONDecodeError:
                results.append({"id": candidate["id"], "image": candidate["image"],
                                "relevance": 5, "reason": generated, "confidence": "low"})
        
        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results[:top_k]


# 使用示例
if __name__ == "__main__":
    reranker = MultimodalLLMReranker()
    candidates = [
        {"image": Image.open("cat1.jpg").convert("RGB"), "text": "一只猫坐在窗台上", "id": 1},
        {"image": Image.open("dog1.jpg").convert("RGB"), "text": "一只狗在草地上", "id": 2},
    ]
    results = reranker.rerank("一只橘猫在窗台上晒太阳", candidates, top_k=2)
    for r in results:
        print(f"relevance={r['relevance']} confidence={r['confidence']}")
        print(f"  reason: {r['reason']}")
```

### 4.8.4 重排序方案选型决策树

```
重排序方案选型？
│
├─ 候选是否包含图像/视频/音频？
│   ├─ 是 → 多模态 LLM 重排序 (Qwen2.5-VL / GPT-4o)
│   └─ 否 → 继续判断
│
├─ 需要可解释性？
│   ├─ 是 → Cross-Encoder (BGE-reranker-v2-m3)
│   └─ 否 → 继续判断
│
├─ 有标注数据？
│   ├─ 是 → Stacking + Cross-Encoder
│   └─ 否 → Cross-Encoder
│
├─ 延迟敏感 (<10ms)？
│   ├─ 是 → Cohere Rerank API
│   └─ 否 → 继续判断
│
└─ 中英混合 → BGE-reranker-v2-m3 (性价比最优)
```

### 4.8.5 综合重排序 Pipeline 选型

```
生产级重排序 Pipeline 选型

  ┌─────────────────────────────────────┐
  │  Phase 1: 粗排 (Recall)              │
  │  多引擎并行召回:                      │
  │  ├─ BM25 (精确关键词) → Top-50      │
  │  ├─ Dense (BGE)         → Top-50    │
  │  └─ CLIP (图像)         → Top-20    │
  └──────────────┬──────────────────────┘
                 │
  ┌──────────────▼──────────────────────┐
  │  Phase 2: 中排 (Cross-Encoder)        │
  │  BGE-reranker-v2-m3 (自托管 GPU):    │
  │  ├─ 文本→文本: BGE-reranker          │
  │  └─ 候选: Top-100 → Top-30          │
  │  延迟: ~50ms / query, 成本: ¥0.5/10K │
  └──────────────┬──────────────────────┘
                 │
  ┌──────────────▼──────────────────────┐
  │  Phase 3: 精排 (Re-ranker)            │
  │  ├─ 纯文本 → BGE-reranker (已覆盖)  │
  │  ├─ 含图像 → GPT-4o / Qwen2.5-VL    │
  │  └─ 高精度需求 → LLM-based          │
  │  延迟: ~200ms (LLM) / ~10ms (Cross) │
  └──────────────┬──────────────────────┘
                 │
  ┌──────────────▼──────────────────────┐
  │  Final: Top-5 结果 → 送入 LLM 生成回答  │
  └─────────────────────────────────────┘
```

---


---

# 第 5 章 多模态向量数据库

> 向量数据库是多模态 RAG 的「存储与索引层」——它决定了大规模多模态数据能否被高效存储和快速检索。本章深入对比主流向量数据库，分析多模态扩展策略与性能基准。

---

## 5.1 向量数据库选型对比表

### 5.1.1 核心向量数据库对比

| 维度 | Milvus | Weaviate | Qdrant | Pinecone | Chroma | FAISS |
|------|--------|----------|--------|----------|--------|-------|
| **类型** | 开源分布式 | 开源 | 开源 | 商业 SaaS | 开源 | 开源 |
| **创始人** | Zilliz | Weaviate | Qdrant Inc | Pinecone Inc | Chroma | Meta (Facebook) |
| **多模态支持** | ✅ (文本/图像/表格/视频) | ✅ (多模态对象) | ✅ (混合过滤+向量) | ✅ (混合检索) | ✅ (轻量) | ❌ (仅向量) |
| **索引算法** | HNSW, IVF_PQ, DiskANN | HNSW, FLAT | HNSW, Flat, PRQ | HNSW (私有) | HNSW | IVF, HNSW, SQ |
| **索引大小上限** | **百亿级** | 千万级 | **亿级** | 百亿级 (SaaS) | 万级 | 千万级 |
| **混合检索 (BM25+Dense)** | ✅ (全文索引) | ✅ | ✅ (filter + vector) | ✅ | ❌ | ❌ |
| **元数据过滤** | ✅ (多级索引) | ✅ (BQL) | ✅ (payload) | ✅ | ✅ | ❌ |
| **GPU 加速** | ✅ | ✅ (Weaviate HNSW) | ✅ (GPU Index) | ❌ | ❌ | ✅ |
| **REST/gRPC API** | gRPC + REST | REST (GraphQL) | REST + gRPC | REST | REST | Python SDK |
| **多租户** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **自托管成本** | 中 (需 K8s) | 低 | 低 | 高 (API) | 极低 | **免费** |
| **中文社区** | **强** (Zilliz 云) | 中 | 中 | - | 弱 | - |
| **典型部署规模** | 100B+ vectors | 10M+ vectors | 100M+ vectors | 无上限 (SaaS) | <1M vectors | 单机 <10M |
| **推荐场景** | **超大规模生产** | **企业级全栈** | **高性能低延迟** | **快速上线** | **原型/小规模** | **离线/研究** |

### 5.1.2 选型决策树

```
向量数据库选型？
│
├─ 数据规模 > 1 亿条？
│   ├─ 是 → Milvus (分布式) 或 Pinecone (SaaS)
│   └─ 否 → 继续判断
│
├─ 需要多模态对象存储（图像+文本+元数据）？
│   ├─ 是 → Weaviate (原生多模态类) 或 Qdrant (payload 丰富)
│   └─ 否 → 继续判断
│
├─ 需要混合检索 (BM25 + Dense)？
│   ├─ 是 → Milvus (全文索引) 或 Weaviate (BQL)
│   └─ 否 → 继续判断
│
├─ 延迟要求 < 10ms？
│   ├─ 是 → Qdrant (HNSW 最快) 或 GPU-indexed Milvus
│   └─ 否 → 继续判断
│
├─ 需要 GPU 加速？
│   ├─ 是 → Milvus (DiskANN) 或 Qdrant GPU Index
│   └─ 否 → 继续判断
│
├─ 中文社区支持？
│   ├─ 是 → Milvus (Zilliz 云, 中文文档完善)
│   └─ 否 → Qdrant (国际化, Rust 内核)
│
├─ 快速原型 / 小团队？
│   └─ 是 → Chroma (极简) 或 Qdrant (Docker 一行启动)
│
└─ 研究/离线场景？
   └─ 是 → FAISS (免费, 极致灵活, 但需自运维)
```

### 5.1.3 多模态场景推荐组合

| 场景 | 推荐向量库 | 理由 |
|------|-----------|------|
| **企业级知识库（图文）** | Weaviate | 多模态对象模型 + BQL 混合查询 |
| **超大规模检索** | Milvus | 百亿级向量, DiskANN 支持 |
| **低延迟推荐** | Qdrant | HNSW + Payload 过滤, 亚毫秒 |
| **快速上线 (SaaS)** | Pinecone | 零运维, 混合检索 |
| **原型验证** | Chroma / FAISS | 极简, 快速迭代 |
| **多模态混合检索** | Milvus + Elasticsearch | 全文 + 向量联合索引 |

---

## 5.2 多模向量存储策略

### 5.2.1 统一空间 vs 分空间存储

```
存储策略对比

┌─ 策略 A: 统一嵌入空间 ─────────────┐
│                                     │
│  ┌─────── 统一向量空间 (R^D) ──────┐│
│  │                                 ││
│  │  文本 embedding ──→           ││
│  │  图像 embedding ──→           ││
│  │  表格 embedding ──→           ││
│  │  音频 embedding ──→           ││
│  │  视频 embedding ──→           ││
│  │                                 ││
│  │  优势: 跨模态检索简单             ││
│  │  劣势: 不同模态语义分布差异大     ││
│  └───────────────────────────────┘│
└────────────────────────────────────┘

┌─ 策略 B: 分空间存储 ─────────────┐
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │ 文本空间   │  │ 图像空间   │      │
│  │ R^d1      │  │ R^d2      │      │
│  │ BGE 向量   │  │ CLIP 向量  │      │
│  └──────┬────┘  └──────┬────┘      │
│         │              │            │
│         │    ┌─────────┴─────────┐  │
│         └───→│  融合/映射层        │  │
│              │ (投影/注意力)       │  │
│              └─────────┬─────────┘  │
│                      │             │
│  优势: 各模态独立优化           │
│  劣势: 跨模态检索需额外映射      │
└────────────────────────────────────┘

┌─ 策略 C: 多索引 + 联合排序（推荐） ──┐
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │ 文本索引   │  │ 图像索引   │      │
│  │ (BGE)     │  │ (CLIP)    │      │
│  └──────┬────┘  └──────┬────┘      │
│         │              │            │
│  ┌───────────┐  ┌───────────┐      │
│  │ 表格索引   │  │ 音频索引   │      │
│  │ (BGE)     │  │ (CLAP)    │      │
│  └──────┬────┘  └──────┬────┘      │
│         │              │            │
│         └──────┬───────┘            │
│                ▼                   │
│         ┌──────────────┐          │
│         │ RRF / Stacking │         │
│         │ 联合排序       │         │
│         └───────┬───────┘          │
│                 ▼                  │
│           Top-K 结果               │
│  优势: 各模态最优, 灵活扩展           │
│  劣势: 架构复杂                      │
└────────────────────────────────────┘

推荐: 策略 C (多索引 + 联合排序) —— 生产环境最优
```

### 5.2.2 索引算法选型

| 算法 | 原理 | 精度 | 速度 | 内存 | 适用场景 |
|------|------|------|------|------|--------|
| **HNSW** | 分层导航小世界图 | ★★★★★ | ★★★★ | 高 | **通用推荐** |
| **IVF_PQ** | 倒排索引 + 乘积量化 | ★★★★ | ★★★ | 低 | 大规模检索 |
| **DiskANN** | 磁盘加速 HNSW | ★★★★ | ★★★ | **极低** | **超大规模** |
| **SQ** | 标量量化 | ★★★ | ★★★★★ | **极低** | 低精度快速检索 |
| **FLAT** | 暴力搜索 | ★★★★★ | ★ | 高 | 小规模精确检索 |
| **PRQ** | 渐进式资源量化 | ★★★★ | ★★★ | 中 | 精度-速度平衡 |

**HNSW 核心参数调优：**

```python
# Milvus HNSW 参数调优
collection_params = {
    "index_type": "HNSW",
    "metric_type": "COSINE",  # 余弦相似度 (嵌入归一化后)
    "params": {
        "M": 32,               # 每个节点连接数 (默认 16)
        "efConstruction": 200, # 建图时的搜索范围
        "efSearch": 128,       # 检索时的搜索范围
    }
}

# 参数影响:
# M=16:  内存低, 精度中 (召回率 ~85%)
# M=32:  内存中, 精度高 (召回率 ~95%) ← 推荐
# M=64:  内存高, 精度极高 (召回率 ~98%)
# efConstruction=100: 建图快, 精度略降
# efConstruction=200: 建图慢, 精度高 ← 推荐
# efSearch=50:  快, 召回率 ~90%
# efSearch=128: 慢, 召回率 ~95% ← 推荐
# efSearch=256: 很慢, 召回率 ~97%
```

---

## 5.3 多模态相似度计算

### 5.3.1 跨模态度量方法

```
跨模态相似度计算框架

  ┌─ 余弦相似度 ────────────────┐
  │  sim(a, b) = (a·b) / (||a||·||b||) │
  │  适用: 归一化后的嵌入向量            │
  │  范围: [-1, 1]                      │
  │  优点: 计算快, 标准化               │
  └────────────────────────────┘

  ┌─ 点积相似度 ────────────────┐
  │  sim(a, b) = a·b                    │
  │  适用: 已归一化的向量 (等价于余弦)   │
  │  优点: 矩阵乘法加速, GPU 友好       │
  └────────────────────────────┘

  ┌─ 欧氏距离 (L2) ────────────┐
  │  sim(a, b) = -||a - b||²           │
  │  适用: 未归一化的向量               │
  │  范围: (-∞, 0]                     │
  │  优点: 直观的距离度量               │
  └────────────────────────────┘

  ┌─ 内积 + 归一化 (推荐) ──────┐
  │  1. 对所有嵌入做 L2 归一化            │
  │  2. 使用矩阵点积进行批量检索          │
  │  3. 等价于余弦相似度, 但计算更快      │
  │  Milvus/Pinecone 默认推荐方式         │
  └────────────────────────────┘
```

### 5.3.2 混合检索实现

**实战代码（Milvus 多模态混合检索）：**

```python
from pymilvus import (
    connections, Collection, CollectionSchema,
    FieldSchema, DataType, utility
)
import numpy as np
import json


class MultimodalVectorStore:
    """
    多模态向量存储 (Milvus)
    """
    
    def __init__(
        self,
        host: str = "localhost",
        port: str = "19530",
        vector_dim: int = 1024,
        index_type: str = "HNSW",
    ):
        connections.connect("default", host=host, port=port)
        
        # 字段定义
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
            FieldSchema(name="modal_type", dtype=DataType.VARCHAR, max_length=16),
            FieldSchema(name="source_id", dtype=DataType.VARCHAR, max_length=64),
            FieldSchema(name="page_num", dtype=DataType.INT32),
            FieldSchema(name="timestamp", dtype=DataType.FLOAT),
            FieldSchema(name="bbox", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=vector_dim),
        ]
        
        self.schema = CollectionSchema(fields, "多模态 RAG 向量存储")
        self.collection_name = "multimodal_rag_v2"
        self.collection = Collection(self.collection_name, self.schema)
        
        # 创建向量索引
        index_params = {
            "index_type": index_type,
            "metric_type": "COSINE",
            "params": {"M": 32, "efConstruction": 200},
        }
        
        self.collection.create_index("embedding", index_params)
        self.collection.load()
        
        print(f"Milvus 集合 '{self.collection_name}' 已就绪")
    
    def insert(self, records: list[dict]):
        """
        插入多模态数据
        
        Args:
            records: [{"modal_type": "image", "source_id": "doc_001",
                      "page_num": 3, "bbox": "[x1,y1,x2,y2]",
                      "embedding": [0.1, -0.2, ...], ...}, ...]
        """
        ids = [r["id"] for r in records]
        modal_types = [r["modal_type"] for r in records]
        source_ids = [r["source_id"] for r in records]
        page_nums = [r.get("page_num", -1) for r in records]
        timestamps = [r.get("timestamp", 0.0) for r in records]
        bboxes = [json.dumps(r.get("bbox", [])) for r in records]
        embeddings = [r["embedding"] for r in records]
        
        collection = Collection(self.collection_name)
        collection.insert([
            ids, modal_types, source_ids, page_nums, timestamps, bboxes, embeddings,
        ])
        
        print(f"已插入 {len(records)} 条记录")
    
    def search(
        self,
        query_embedding: np.ndarray,
        modal_types: list[str] = None,
        top_k: int = 20,
        limit_per_type: int = None,
    ) -> list[dict]:
        """
        多模态向量检索
        
        Args:
            query_embedding: 查询向量 (D,)
            modal_types: 过滤模态类型 (如 ["image", "text"]) (None 为全部)
            top_k: 返回数量
            limit_per_type: 每种模态最多返回的数量
        
        Returns:
            检索结果列表
        """
        collection = Collection(self.collection_name)
        
        if modal_types:
            expr = f"modal_type in {modal_types}"
        else:
            expr = ""
        
        result = collection.search(
            data=[query_embedding.tolist()],
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"efSearch": 128}},
            limit=top_k,
            expr=expr if expr else None,
        )
        
        results = []
        for hits in result:
            for hit in hits:
                results.append({
                    "id": hit.id,
                    "score": float(hit.distance),
                    "modal_type": hit.entity.get("modal_type"),
                    "source_id": hit.entity.get("source_id"),
                    "page_num": hit.entity.get("page_num"),
                })
        
        if limit_per_type and modal_types:
            from collections import defaultdict
            grouped = defaultdict(list)
            for r in results:
                grouped[r["modal_type"]].append(r)
            
            filtered_results = []
            for mod_type in modal_types:
                filtered_results.extend(grouped[mod_type][:limit_per_type])
            results = filtered_results
        
        return results
    
    def drop(self):
        utility.drop_collection(self.collection_name)


# 使用示例
if __name__ == "__main__":
    store = MultimodalVectorStore(
        host="localhost",
        vector_dim=1024,
    )
    
    records = [
        {
            "id": 1,
            "modal_type": "image",
            "source_id": "doc_001",
            "page_num": 3,
            "bbox": [100, 200, 500, 600],
            "embedding": np.random.randn(1024).astype("float32"),
        },
        {
            "id": 2,
            "modal_type": "text",
            "source_id": "doc_001",
            "page_num": 3,
            "bbox": None,
            "embedding": np.random.randn(1024).astype("float32"),
        },
    ]
    
    for r in records:
        r["embedding"] = r["embedding"] / np.linalg.norm(r["embedding"])
    
    store.insert(records)
    
    query = np.random.randn(1024).astype("float32")
    query = query / np.linalg.norm(query)
    results = store.search(query, modal_types=["image", "text"], top_k=10)
    for r in results:
        print(f"{r['modal_type']} {r['score']:.4f} | {r['source_id']}")
```

---

## 5.4 向量数据库的多模态扩展

### 5.4.1 图像存储策略

```
图像向量存储策略

  ┌─ 方案 A: 图像直接嵌入 ──────────┐
  │                                 │
  │  图像 → CLIP 编码 → 向量 → 向量库│
  │                                 │
  │  ✓ 简单直接                      │
  │  ✓ CLIP 空间可直接跨模态检索      │
  │  ✗ 图像质量敏感 (压缩/分辨率)    │
  │  ✗ 无法存储原始图像              │
  └────────────────────────────────┘

  ┌─ 方案 B: 关键帧 + 多向量 ───────┐
  │                                 │
  │  图像 → 多帧采样 → 多向量 → 向量库│
  │  每帧独立编码 (类似 ColPali)      │
  │                                 │
  │  ✓ 保留多视角信息                 │
  │  ✓ 支持细粒度检索                 │
  │  ✗ 索引膨胀 (N 倍)               │
  └────────────────────────────────┘

  ┌─ 方案 C: 图像 + 元数据联合存储 ──┐
  │                                 │
  │  向量库:                       │
  │  ├─ embedding: CLIP 向量 (1024) │
  │  ├─ metadata:                   │
  │  │  ├─ image_url (存储地址)     │
  │  │  ├─ caption (CLIP 描述)     │
  │  │  ├─ tags (检测标签)           │
  │  │  └─ aspect_ratio / file_size│
  │  └─ 原始图像 → MinIO/S3 存储     │
  │                                 │
  │  ✓ 完整保留图像信息              │
  │  ✓ 支持 metadata 过滤            │
  │  ✓ 生产推荐                      │
  └────────────────────────────────┘

推荐: 方案 C
```

### 5.4.2 表格存储策略

| 策略 | 方法 | 向量维度 | 索引大小 (每万条) | 适用场景 |
|------|------|---------|------|--------|
| **HTML 序列化** | 表格→HTML→BGE | 1024 | ~40 MB | 通用 |
| **JSON 序列化** | 表格→JSON→BGE | 1024 | ~35 MB | 结构化表格 |
| **Row-level** | 每行独立向量 | 1024 | ~100 MB | 细粒度检索 |
| **Column-level** | 每列独立向量 | 1024 | ~50 MB | 列级查询 |
| **ColPali** | 多向量 (cell x cell) | 128 x N | ~500 MB | 高精度 |

### 5.4.3 视频存储策略

| 策略 | 方法 | 索引量 | 存储成本/月 | 适用场景 |
|------|------|--------|------|--------|
| **关键帧级** | 每 3s 一帧 + CLIP | 200帧/小时 | ¥50 | **生产推荐** |
| **片段级** | 每 30s 一段 + CLIP | 120段/小时 | ¥30 | 场景检索 |
| **帧级** | 每帧 + CLIP | 1800帧/小时 | ¥300 | 精确检索 |

### 5.4.4 成本估算

```
向量数据库月度成本估算 (100 万条多模态数据)

┌─┬──────┬────────────┬───────────┬──────────┬──────┐
│ │ 方案  │ GPU 实例    │ 存储      │ 带宽      │ 总计  │
├─┼──────┼────────────┼───────────┼──────────┼──────┤
│ │ Milvus │ A100 1台    │ ¥2,000    │ ¥500     │ ¥3,500│
│ │ Weaviate │ A10 1台    │ ¥1,500    │ ¥300     │ ¥2,300│
│ │ Qdrant │ T4 1台      │ ¥1,000    │ ¥200     │ ¥1,800│
│ │ Pinecone │ SaaS (per VC) │ ¥5,000  │ ¥0       │ ¥5,000│
│ │ Chroma │ CPU 单机     │ ¥500      │ ¥0       │ ¥500  │
│ │ FAISS  │ CPU 单机     │ ¥0 (自建)  │ ¥0       │ ¥0    │
└─┴──────┴────────────┴───────────┴──────────┴──────┘
```

---

## 5.5 多模态检索性能基准

### 5.5.1 向量数据库性能对比

| 基准测试 | Milvus 2.4 | Weaviate 1.24 | Qdrant 1.8 | Pinecone | Chroma | FAISS |
|---------|------------|---------------|------------|----------|--------|-------|
| **索引 1M 向量 (1024D)** | 45s (IVF) | 120s (HNSW) | **30s** | - (SaaS) | 60s | **10s** |
| **索引 10M 向量** | **210s** | 超时 | 300s | - | - | 100s |
| **索引 100M 向量** | **✓** (分片) | ✗ | ✗ | ✓ (SaaS) | ✗ | ✗ |
| **检索 QPS (1 条)** | 12,000 | 8,500 | **15,000** | 10,000 | 5,000 | **20,000** |
| **检索 P99 延迟** | 3.2ms | 4.1ms | **1.8ms** | 5.0ms | 10ms | **0.5ms** |
| **检索 QPS (批量 64)** | 45,000 | 32,000 | **55,000** | - | 20,000 | **80,000** |
| **内存开销/向量** | 4.5 KB | 5.2 KB | **3.8 KB** | - | 5.0 KB | **2.2 KB** |
| **DiskANN 支持** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ |
| **多模态原生支持** | ✓ (全文+向量) | ✓ (BQL+向量) | ✓ (Payload+向量) | ✓ (混合) | 有限 | ✗ |

### 5.5.2 索引算法性能基准

| 算法 | 检索延迟 (us) | 召回率 @10 | 内存/向量 (KB) | 建索引速度 | 适用向量数 |
|------|---------------|------------|----------------|-----------|-----------|
| **HNSW (M=32)** | **12** | **0.95** | 4.8 | 中 | < 1亿 |
| **IVF_PQ (256, 8)** | 25 | 0.92 | 1.2 | **快** | < 1亿 |
| **DiskANN** | 18 | 0.94 | **0.05** | 慢 | **< 100亿** |
| **FLAT** | **0.5** | **1.00** | 4.0 | **最快** | < 100万 |
| **PQ (64)** | 8 | 0.88 | **0.5** | 中 | < 1亿 |

### 5.5.3 多模态检索端到端延迟基准

```
端到端延迟基准 (100K 文档, 1024D 向量, A10 GPU)

查询类型          粗排    重排    总延迟    备注
────────────────────────────────────────────────────
纯文本 (BM25)    8ms     12ms    20ms    BGE-reranker-v2
纯文本 (Dense)   3ms     15ms    18ms    BGE-M3 + Cross-Enc
图文混合 (CLIP)  5ms     20ms    25ms    CLIP + RRF
视频检索         15ms    25ms    40ms    关键帧索引 + CLIP
表格检索         10ms    12ms    22ms    HTML+BGE
音频检索         5ms     10ms    15ms    Whisper + BGE

生产推荐目标:
├─ 总延迟 < 50ms (P95)
├─ 端到端检索成本 < ¥1/1000 查询
└─ 召回率@10 > 0.90
```

---

# 第 6 章 多模态 LLM 推理层

> 推理层是 RAG 的「认知层」——它负责理解检索到的多模态内容, 生成最终回答。多模态 LLM 的能力直接决定了 RAG 系统对复杂查询的理解深度和回答质量。

---

## 6.1 多模态 LLM 概览

### 6.1.1 多模态 LLM 架构演进

```
多模态 LLM 架构演进

  Phase 1: 串行架构 (2021-2023)
  ═══════════════════════════
  ┌─────┐   ┌───────┐    ┌─────┐
  │视觉   │──→│融合层  │──→│LLM   │
  │Encoder │(拼接/注意力)│Decoder │
  └─────┘   └───────┘    └─────┘
  代表: BLIP-2, Flamingo
  问题: 视觉和语言编码器独立训练, 对齐差

  Phase 2: 早期融合架构 (2023)
  ═══════════════════════════
  ┌─────┐   ┌───────────┐   ┌─────┐
  │视觉   │──→│ 共享投影层  │──→│LLM Decoder│
  │Tokenizer │(MLP/Resampler) │(自回归)   │
  └─────┘   └───────────┘   └─────┘
  代表: LLaVA, MiniCPM-V, Qwen2-VL
  优势: 端到端训练, 语义对齐更好

  Phase 3: Native Multimodal (2024-)
  ═══════════════════════════════════
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ 视觉     │ │ 文本     │ │ 音频     │
  │ Encoder  │ │ Encoder  │ │ Encoder  │
  └────┬─────┘ └────┬─────┘ └────┬─────┘
       │            │            │
       └──────┬─────┴────┬───────┘
               ▼          ▼
        ┌────────────────────┐
        │ 统一 Token Space   │
        │ (对齐的嵌入空间)     │
        └─────────┬──────────┘
                  ▼
        ┌────────────────────┐
        │   LLM Decoder      │
        │ (原生多模态)         │
        └────────────────────┘
  代表: GPT-4o, Claude 3.5, Gemini, Qwen2.5-VL
  优势: 原生多模态, 零样本泛化, 统一接口
```

### 6.1.2 主流多模态 LLM 架构对比

| 模型 | 架构 | 模态 | 参数量 | 视觉编码器 | 分辨率 | 上下文窗口 | 开源 | 多语言 |
|------|------|------|--------|---------|--------|-----------|------|--------|
| **GPT-4o** | Native Multimodal | 文本+图像+音频+视频 | 未知 | 自研 | 448²+ | 128K | ❌ | **100+** |
| **Claude 3.5 Sonnet** | Native Multimodal | 文本+图像 | 未知 | 自研 | 任意 | 200K | ❌ | **多语言** |
| **Qwen2.5-VL-7B** | Early Fusion | 文本+图像+视频 | 7B | Qwen2-VL | **3840x2160** | 128K | ✅ | **中英多语言** |
| **Gemini 1.5 Pro** | Native Multimodal | 文本+图像+音频+视频 | 未知 | 自研 | 任意 | **1M** | ❌ | **多语言** |
| **InternVL2-26B** | Early Fusion | 文本+图像 | 26B | InternVision2 | 任意 | 32K | ✅ | 中英 |
| **LLaVA-NeXT-7B** | Early Fusion | 文本+图像 | 7B | LLaVA-NeXT | 336² | 4K | ✅ | 英文 |
| **MiniCPM-V 2.6** | Early Fusion | 文本+图像+OCR | 8B | SigLIP | **动态分辨率** | 128K | ✅ | **中英** |
| **Qwen2-VL-7B** | Early Fusion | 文本+图像+视频 | 7B | Qwen2-VL | **任意** | 32K | ✅ | **中英** |

---

## 6.2 主流多模态 LLM 对比表

### 6.2.1 综合能力对比

| 模型 | 图像理解 | 表格理解 | 图表理解 | 视频理解 | 语音理解 | OCR | 代码生成 | 推理 | 中文能力 |
|------|---------|---------|---------|---------|---------|-----|---------|------|---------|
| **GPT-4o** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | **★★★★★** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| **Claude 3.5** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★★ |
| **Qwen2.5-VL** | ★★★★ | ★★★★ | ★★★★ | ★★★★ | ★★ | ★★★★ | ★★★★ | ★★★★ | **★★★★★** |
| **Gemini 1.5** | ★★★★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★ |
| **InternVL2** | ★★★★ | ★★★ | ★★★ | ★★★ | ★★ | ★★★ | ★★ | ★★★ | ★★★★ |
| **LLaVA-NeXT** | ★★★★ | ★★ | ★★ | ★★ | ★ | ★★★ | ★ | ★★★ | ★★ |
| **MiniCPM-V** | ★★★★ | ★★★★ | ★★★ | ★★ | ★★ | ★★★★★ | ★★ | ★★★ | ★★★★ |
| **Qwen2-VL** | ★★★★ | ★★★ | ★★★ | ★★★★ | ★ | ★★★ | ★★★ | ★★★★ | ★★★★ |

### 6.2.2 性能基准对比 (2024-2025)

| 模型 | MMMU | MME (Vision) | MM-Vet | SEED-Bench | TextVQA | OCRBench |
|------|------|--------------|--------|------------|---------|----------|
| **GPT-4o** | 64.0 | **2385** | **73.1** | **83.1** | **90.4** | **818** |
| **Claude 3.5** | 62.5 | 2280 | 69.8 | 79.5 | 88.2 | 795 |
| **Qwen2.5-VL** | 59.1 | 2231 | 66.4 | 76.8 | 86.5 | 780 |
| **Gemini 1.5** | 60.8 | 2310 | 71.2 | 80.2 | 89.1 | 800 |
| **InternVL2** | 56.3 | 2150 | 63.1 | 74.5 | 82.3 | 750 |
| **LLaVA-NeXT** | 48.5 | 2080 | 58.2 | 71.2 | 79.8 | 720 |
| **MiniCPM-V** | 52.1 | 2100 | 60.5 | 73.8 | 84.1 | **810** |
| **Qwen2-VL** | 55.0 | 2120 | 64.0 | 75.0 | 85.0 | 760 |

### 6.2.3 选型决策树

```
多模态 LLM 选型？
│
├─ 需要图像+视频+语音+文本统一理解？
│   ├─ 是 → GPT-4o / Claude 3.5 / Gemini 1.5 (API)
│   └─ 否 → 继续判断
│
├─ 中文能力优先？
│   ├─ 是 → Qwen2.5-VL (最强中文) 或 MiniCPM-V (OCR 强)
│   └─ 否 → 继续判断
│
├─ 自托管部署？
│   ├─ 是 → Qwen2.5-VL (7B, 24GB 显存) 或 InternVL2 (26B, 80GB)
│   └─ 否 → 继续判断
│
├─ 表格/文档理解优先？
│   ├─ 是 → Claude 3.5 (表格最强) 或 GPT-4o
│   └─ 否 → 继续判断
│
├─ OCR 精度优先？
│   └─ 是 → MiniCPM-V (OCR 最强) 或 GPT-4o
│
└─ 性价比最优？
   └─ 是 → Qwen2.5-VL (自托管, 中文强, 7B 模型) 或 Qwen2-VL
```

---

## 6.3 图像理解能力深度解析

### 6.3.1 DocVQA (文档视觉问答) 性能

DocVQA 评估模型对文档图像中文字内容的理解和问答能力：

| 模型 | DocVQA Val Acc | DocVQA Test Acc | 训练数据 | 中文 DocVQA |
|------|----------------|-----------------|---------|------------|
| **GPT-4o** | **91.2** | **92.5** | 闭源 | **88.3** |
| **Claude 3.5** | 89.5 | 90.8 | 闭源 | 86.1 |
| **Qwen2.5-VL** | **87.3** | **88.1** | OpenDoc | **85.5** |
| **Gemini 1.5** | 88.1 | 89.2 | 闭源 | 84.0 |
| **InternVL2** | 84.5 | 85.2 | DocQuery | 79.8 |
| **MiniCPM-V** | **86.8** | **87.5** | OCR-Pretrain | **84.0** |
| **LLaVA-NeXT** | 81.2 | 82.0 | DocLayNet | 68.5 |
| **Qwen2-VL** | 83.0 | 84.1 | OpenDoc | 80.2 |

### 6.3.2 ChartQA / InfoVQA 性能

| 模型 | ChartQA Acc | PlotQA Acc | InfographicVQA Acc | ChartOCR Acc |
|------|-------------|------------|-------------------|-------------|
| **GPT-4o** | **82.5** | **78.1** | **58.3** | **92.1** |
| **Claude 3.5** | 80.1 | 75.8 | 55.2 | 90.5 |
| **Qwen2.5-VL** | 76.3 | 72.4 | 52.1 | 88.0 |
| **Gemini 1.5** | 79.0 | 74.2 | 54.5 | 89.5 |
| **InternVL2** | 72.1 | 68.5 | 48.3 | 85.2 |
| **MiniCPM-V** | 74.8 | 70.2 | 49.8 | **91.0** |
| **LLaVA-NeXT** | 68.5 | 64.1 | 42.5 | 82.3 |
| **Qwen2-VL** | 73.2 | 69.8 | 47.5 | 86.5 |

### 6.3.3 实战代码 (Qwen2.5-VL 图像理解)

```python
import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from PIL import Image


class MultimodalImageUnderstander:
    """
    多模态图像理解器 (基于 Qwen2.5-VL)
    """
    
    def __init__(
        self,
        model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
        device: str = "cuda",
    ):
        self.device = device
        self.processor = AutoProcessor.from_pretrained(
            model_name, trust_remote_code=True
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )
    
    def understand(
        self,
        image: Image.Image,
        question: str,
        system_prompt: str = "你是一个专业的多模态理解助手。",
    ) -> str:
        """
        图像理解问答
        
        Args:
            image: PIL 图像
            question: 问题文本
            system_prompt: 系统提示
        
        Returns:
            回答文本
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": question},
                ],
            },
        ]
        
        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        
        inputs = self.processor(
            text=[text],
            images=[image],
            padding=True,
            return_tensors="pt",
        ).to(self.device)
        
        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=1024,
                do_sample=True,
                temperature=0.1,
            )
        
        output = self.processor.decode(
            output_ids[0][inputs["input_ids"].shape[1]:],
            skip_special_tokens=True,
        )
        
        return output


# 使用示例
if __name__ == "__main__":
    understander = MultimodalImageUnderstander()
    
    # 1. 文档理解
    doc_image = Image.open("document.png")
    answer = understander.understand(
        doc_image,
        "请提取这份文档中的关键数据和结论。",
    )
    print(f"答案: {answer}")
    
    # 2. 图表理解
    chart_image = Image.open("chart.png")
    answer = understander.understand(
        chart_image,
        "这张图表展示了什么趋势？请列出具体数据。",
    )
    print(f"答案: {answer}")
    
    # 3. OCR 提取
    ocr_image = Image.open("ocr.png")
    answer = understander.understand(
        ocr_image,
        "请完整提取图中的所有文字内容。",
    )
    print(f"答案: {answer}")
```

---

## 6.4 表格/图表理解

### 6.4.1 表格理解架构图

```
表格理解架构

  ┌─ 方案 A: 端到端图像理解 ──────────┐
  │                                    │
  │  表格图像 → 多模态 LLM → JSON     │
  │                                    │
  │  ✓ 简单直接                        │
  │  ✓ LLM 可理解语义                  │
  │  ✗ 复杂表格精度有限                 │
  └───────────────────────────────────┘

  ┌─ 方案 B: 结构化提取 + LLM ─────────┐
  │                                    │
  │  表格图像 → Layout Parser → 结构化数据│
  │    (检测行列/合并单元格)            │   (HTML/Markdown)  │
  │                       → 多模态 LLM → 语义理解  │
  │                                    │
  │  ✓ 精确行列结构                     │
  │  ✓ 合并单元格正确处理                │
  │  ✓ 生产推荐                         │
  └───────────────────────────────────┘

  ┌─ 方案 C: 表格 → SQL 查询 ──────────┐
  │                                    │
  │  表格图像 → 多模态 LLM → SQL 语句   │
  │                                    │
  │  ✓ 支持复杂查询 (JOIN/AGGREGATE)    │
  │  ✓ 适合数据库场景                    │
  │  ✗ 需要数据库环境                    │
  └───────────────────────────────────┘

推荐: 方案 B (结构化提取 + LLM)
```

### 6.4.2 实战代码 (表格理解)

```python
import json
from PIL import Image
from transformers import AutoProcessor, AutoModelForCausalLM
import torch


def extract_table_to_json(
    image: Image.Image,
    model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
    device: str = "cuda",
) -> list[list[str]]:
    """
    从表格图像中提取结构化数据
    
    Args:
        image: 表格图像
        model_name: 多模态 LLM 模型
        device: 设备
    
    Returns:
        二维字符串列表 [[row1], [row2], ...]
    """
    processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name, torch_dtype=torch.float16, device_map="auto",
        trust_remote_code=True,
    )
    
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {
                    "type": "text",
                    "text": """请提取表格中的所有数据, 按 JSON 格式输出。
格式要求: 二维数组, 每个元素是字符串。保留表头。只输出 JSON。

示例输出:
[["姓名", "年龄", "城市"], ["张三", "25", "北京"], ["李四", "30", "上海"]]""""
                },
            ],
        },
    ]
    
    text = processor.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = processor(
        text=[text], images=[image], padding=True, return_tensors="pt"
    ).to(device)
    
    with torch.no_grad():
        output_ids = model.generate(**inputs, max_new_tokens=2048, do_sample=False)
    
    generated = processor.decode(
        output_ids[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
    )
    
    try:
        data = json.loads(generated)
        if isinstance(data, list):
            return data
    except json.JSONDecodeError:
        pass
    
    return [[generated]]


# 使用示例
if __name__ == "__main__":
    image = Image.open("table.png")
    table_data = extract_table_to_json(image)
    for row in table_data:
        print("\t".join(row))
```

---

## 6.5 视频理解

### 6.5.1 视频理解架构

```
视频理解 Pipeline

  ┌─ 原始视频 ────────────────────────┐
  │                                   │
  ▼                                   ▼
┌──────────────┐              ┌──────────────────┐
│ 方案 A: 关键帧 + LLM │       │ 方案 B: 片段编码 + LLM │
│ (轻量)            │        │ (中等复杂度)        │
│                  │        │                  │
│ 关键帧提取 → 多模态 LLM → 回答  │ 片段编码 → 时序融合 → LLM → 回答 │
│ (3-5帧/视频)        │        │ (30-60帧/片段)        │
└──────────────┘              └──────────────────┘

┌───────────────────────────────────────┐
│ 方案 C: 端到端视频 LLM (重度)              │
│                                        │
│  原始视频 → 多帧 ViT → 时序编码 → LLM Decoder │
│  (VideoMAE/InternVideo2)    (Transformer)    │
└───────────────────────────────────────┘

推荐: 方案 A (关键帧 + LLM) —— RAG 场景性价比最优
```

### 6.5.2 实战代码 (视频理解)

```python
import cv2
import numpy as np
from PIL import Image
from transformers import AutoProcessor, AutoModelForCausalLM
import torch


class VideoUnderstander:
    """
    视频理解引擎 (基于 Qwen2.5-VL)
    """
    
    def __init__(
        self,
        model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
        device: str = "cuda",
    ):
        self.device = device
        self.processor = AutoProcessor.from_pretrained(
            model_name, trust_remote_code=True
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name, torch_dtype=torch.float16,
            device_map="auto", trust_remote_code=True,
        )
        self.keyframes = []
    
    def extract_keyframes(self, video_path: str, n_frames: int = 4) -> list[Image.Image]:
        """提取关键帧"""
        cap = cv2.VideoCapture(video_path)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # 均匀采样
        frame_indices = np.linspace(0, total - 1, n_frames, dtype=int)
        
        frames = []
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frames.append(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
        
        cap.release()
        self.keyframes = frames
        return frames
    
    def understand(
        self,
        question: str,
        images: list[Image.Image] = None,
        duration_hint: str = "",
    ) -> str:
        """
        视频问答
        
        Args:
            question: 查询问题
            images: 关键帧列表
            duration_hint: 视频时长提示
        
        Returns:
            回答文本
        """
        images = images or self.keyframes
        
        content = [
            {"type": "text", "text": question},
        ]
        
        # 添加关键帧
        for img in images:
            content.append({"type": "image", "image": img})
        
        messages = [
            {
                "role": "user",
                "content": content,
            },
        ]
        
        if duration_hint:
            # 在问题中加入时长提示
            messages[0]["content"] = [
                {"type": "text", "text": f"{question} (视频时长: {duration_hint})"},
            ] + [
                {"type": "image", "image": img}
                for img in images
            ]
        
        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        
        inputs = self.processor(
            text=[text],
            images=[img for img in images],
            padding=True,
            return_tensors="pt",
        ).to(self.device)
        
        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=2048,
                do_sample=True,
                temperature=0.1,
            )
        
        return self.processor.decode(
            output_ids[0][inputs["input_ids"].shape[1]:],
            skip_special_tokens=True,
        )


# 使用示例
if __name__ == "__main__":
    understander = VideoUnderstander()
    
    # 提取关键帧
    frames = understander.extract_keyframes("lecture.mp4", n_frames=4)
    
    # 视频问答
    answer = understander.understand(
        question="请总结视频中提到的核心观点。",
        images=frames,
        duration_hint="15分钟",
    )
    print(answer)
```

---

## 6.6 音频/语音理解

### 6.6.1 音频理解架构

```
音频理解架构

  ┌─ 方案 A: ASR + 文本 LLM ────────┐
  │                                 │
  │  音频 → Whisper/Paraformer → 转录文本 │
  │                  │                  │
  │                  ▼                  │
  │             文本 LLM → 理解/推理      │
  │                                 │
  │  ✓ 成熟, 中文 WER < 5%           │
  │  ✓ 可利用文本 LLM 的推理能力       │
  │  ✗ 丢失音频情感/语调信息           │
  └─────────────────────────────────┘

  ┌─ 方案 B: 多模态 LLM 原生音频 ──────┐
  │                                 │
  │  音频 → Wav2Vec2/Whisper Encoder → 音频 token │
  │                  │                       │
  │                  ▼                       │
  │           多模态 LLM Decoder → 理解/回答  │
  │                                 │
  │  ✓ 原生音频理解                   │
  │  ✓ 保留语音情感                   │
  │  ✓ GPT-4o/Claude 3.5 原生支持    │
  │  ✗ API 成本较高                  │
  └─────────────────────────────────┘

  ┌─ 方案 C: Whisper + 多模态 LLM ─────┐
  │                                 │
  │  音频 → Whisper → 文本 + 音频特征  │
  │                │         │         │
  │                ▼         ▼         │
  │          文本嵌入     音频嵌入      │
  │                └→ 多模态 LLM → 理解│
  │                                 │
  │  ✓ 兼顾文本和音频信息              │
  │  ✓ 中文场景性价比最优              │
  └─────────────────────────────────┘

推荐: RAG 场景 → 方案 A (ASR → 文本 → RAG), 对话场景 → 方案 B
```

### 6.6.2 语音理解实战 (GPT-4o / Qwen2.5-VL)

```python
# GPT-4o 音频理解 (API)
import openai


def audio_understand_gpt4o(
    audio_path: str,
    question: str,
    model: str = "gpt-4o-audio-preview",
) -> str:
    """
    GPT-4o 音频理解
    
    Args:
        audio_path: 音频文件路径
        question: 问题
        model: 模型名称
    
    Returns:
        回答
    """
    client = openai.OpenAI()
    
    response = client.audio.transcriptions.create(
        model=model,
        file=open(audio_path, "rb"),
        modalities=["text", "audio"],
        prompt=f"请用中文回答问题: {question}",
        response_format="text",
    )
    
    return response["text"]


# 自托管: Paraformer + 文本推理
from funasr import AutoModel
from transformers import AutoModelForCausalLM, AutoTokenizer


def audio_understand_paraformer(
    audio_path: str,
    question: str,
    asr_model: str = "iic/speech_paraformer-large_asr-zh-CN",
) -> tuple[str, str]:
    """
    Paraformer ASR + 文本 LLM 推理
    
    Returns:
        (ASR文本, LLM回答)
    """
    # ASR
    model = AutoModel(
        model=asr_model,
        vad_model="fsmn-vad",
        punc_model="ct-punc-c",
        device="cuda",
    )
    
    result = model.generate(input=audio_path)
    transcript = result[0]["text"]
    
    # 文本推理
    tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct")
    model = AutoModelForCausalLM.from_pretrained(
        "Qwen/Qwen2.5-7B-Instruct",
        torch_dtype="auto", device_map="auto",
    )
    
    messages = [
        {"role": "system", "content": "你是一位助手。"},
        {"role": "user", "content": f"根据以下音频内容, 请回答问题:\n\n音频内容: {transcript}\n\n问题: {question}"},
    ]
    
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=1024)
    
    answer = tokenizer.decode(output[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    
    return transcript, answer
```

---

## 6.7 多模态 LLM 的提示工程

> 提示工程是释放多模态 LLM 能力的关键。本章介绍模态感知的 Prompt 设计、视觉引导、结构化输出和幻觉抑制策略。

---

### 6.7.1 模态感知 Prompt

```
模态感知的 Prompt 设计原则

  核心原则: "让 LLM 知道它看到了什么, 而不是猜它看到了什么"

  ┌─ 原则 1: 明确指定模态 ──────────┐
  │  ❌ "这是什么？" (模糊)               │
  │  ✓ "以下是一张柱状图, 请分析其中的趋势。"  │
  └─────────────────────────────────┘

  ┌─ 原则 2: 提供模态上下文 ──────────┐
  │  ❌ "分析图片" (无上下文)               │
  │  ✓ "这是一份 2024 年 Q3 的财务报告, 请分析 │
  │    图中的关键数据指标。"                 │
  └─────────────────────────────────┘

  ┌─ 原则 3: 指定输出格式 ────────────┐
  │  ❌ "告诉我你的想法" (开放格式)       │
  │  ✓ "请按 JSON 格式输出, 包含以下字段:    │
  │    - data_points: 关键数据点            │
  │    - trend: 趋势描述                   │
  │    - confidence: 置信度"              │
  └─────────────────────────────────┘
```

### 6.7.2 视觉 PromptING —— 边界框引导

对于需要**精确定位**的场景, 边界框引导是强大的技术：

```
边界框引导 PromptING

  ┌──────────────────────────────────────┐
  │                                       │
  │     ┌──────┐                          │
  │     │      │ ← bbox: [100, 50, 400, 300] │
  │     │ 目标  │                            │
  │     │ 区域  │                            │
  │     └──────┘                            │
  │                                       │
  │  ❌ "图中有什么？" (漫无目的)         │
  │  ✓ "在坐标 [100, 50, 400, 300] 的    │
  │    区域中, 请描述图中的人物及其动作。"    │
  │                                       │
  │  优势:                                 │
  │  ✓ 引导 LLM 关注区域, 避免幻觉          │
  │  ✓ 提高定位精度                        │
  │  ✓ 降低注意力分散                       │
  └──────────────────────────────────────┘

  实现方式:
  ├─ Grounding DINO 检测 → 边界框 → Prompt 引导
  ├─ 多模态 LLM 自带 bbox 输入 (GPT-4o, Qwen2.5-VL)
  └─ 图像裁剪 + 大图 + 小图对比
```

### 6.7.3 结构化输出

```
结构化输出 Prompt 模板

  ┌─ 模板 1: JSON 结构化 ────────────┐
  │                                 │
  │ "请严格按照以下 JSON 格式输出,         │
  │ 不要包含任何其他文本:                  │
  │                                    │
  │ {\"type\": \"chart\",              │
  │  \"data\": {                       │
  │    \"x_labels\": [],               │
  │    \"y_values\": [],               │
  │    \"trend\": \"上升/下降/稳定\"       │
  │  },                               │
  │  \"confidence\": 0.95            │
  │ }"                                │
  └─────────────────────────────────┘

  ┌─ 模板 2: Markdown 结构化 ──────────┐
  │                                 │
  │ "请按以下 Markdown 格式回答:         │
  │  ### 数据概览                       │
  │  - 类型: [图表类型]                  │
  │  - 关键指标: [数值]                  │
  │  ### 趋势分析                       │
  │  [描述趋势]                        │
  │  ### 置信度: [高/中/低]"           │
  └─────────────────────────────────┘
```

### 6.7.4 幻觉抑制策略

多模态 LLM 最常见的挑战是**幻觉**——生成不符合图像内容的描述。以下是经过验证的抑制策略：

| 策略 | 原理 | 效果 (NDCG 提升) | 实现成本 |
|------|------|-----------------|---------|
| **显式约束** | Prompt 中强调 "只描述你看到的内容" | +3-5% | **低** |
| **图像裁剪聚焦** | 裁剪无关区域, 聚焦关键区域 | +5-8% | 中 |
| **边界框引导** | Grounding DINO 检测 + Prompt 引导 | +8-12% | 中 |
| **多帧验证** | 对视频/多图分别提问, 交叉验证 | +6-10% | 高 |
| **链式验证 (CoT)** | 先生成理由, 再给出结论 | +4-7% | 低 |
| **Self-Consistency** | 多次推理取多数投票 | +3-6% | 高 |
| **负样本提示** | "如果看不到 X, 请说明看不到" | +5-9% | **低** |
| **置信度校准** | 要求输出置信度, 过滤低置信结果 | +4-8% | **低** |

### 6.7.5 幻觉抑制 Prompt 模板

```python
# 幻觉抑制 prompt 模板
def build_hallucination_suppressed_prompt(
    question: str,
    image_description: str = "",
) -> str:
    """
    构建幻觉抑制的 Prompt
    
    Args:
        question: 原始问题
        image_description: 可选的图像描述 (来自 Grounding DINO 或 CLIP)
    
    Returns:
        抑制幻觉的 prompt
    """
    base = f"""你是一个诚实的多模态理解助手。请回答以下问题:

{question}

【重要约束】:
1. **只描述你实际看到的内容** —— 不要推测不存在的东西
2. 如果你不确定, 请明确说明 "我无法确定..."
3. 如果图像中没有相关信息, 请说 "图像中未找到相关内容"
4. 对于数值数据, 请逐字报告你看到的具体数字, 不要估算
5. 对于不清晰的区域, 请说明 "图像模糊, 无法识别"

"""
    
    if image_description:
        base += f"""【参考信息】:
图像检测到的关键元素: {image_description}

请结合上述参考信息, 同时以你实际看到的内容为准。

"""
    
    base += "请回答:"
    
    return base


# 使用示例
prompt = build_hallucination_suppressed_prompt(
    question="图表中的 Q3 营收是多少？",
    image_description="柱状图, x轴: Q1-Q4, y轴: 营收(万元)",
)
print(prompt)
```

### 6.7.6 RAG 场景中的多模态 Prompt 设计

```
RAG 多模态 Prompt 架构

  ┌─┬─ 检索层 ────────────────────────┐
  │ │ ┌───────┐  ┌───────┐  ┌───────┐ │
  │ │ │图像检索 │  │文本检索 │  │表格检索 │ │
  │ │ └───┬───┘  └───┬───┘  └───┬───┘ │
  │ │     └─────┬────┘     └──────┘ │
  │ │            ▼                    │
  │ │      ┌───────────┐             │
  │ │      │ RRF/融合   │→ Top-K 多模态结果  │
  │ │      └─────┬─────┘             │
  │ └───────────┘                    │
  │                                  │
  └─┬─ 推理层 ──────────────────────┘
    │                                  │
    ▼                                  ▼
┌────────────────────────────────────────┐
│  多模态 Prompt 构建                     │
│                                        │
│  ┌── 系统提示 ─────────────────────┐  │
│  │ 你是一个多模态理解助手, 帮助分析多模态知识库 │
│  └────────────────────────────────┘  │
│  ┌── 检索结果注入 ──────────────────┐  │
│  │  ┌─ 图像上下文 ─────────────────┐ │
│  │  │ <image_1> [检索到的图像]       │ │
│  │  │ <caption_1> CLIP 描述: "..."   │ │
│  │  │ <bbox_1> 关键区域: [x1,y1,x2,y2] │ │
│  │  └────────────────────────────┘ │
│  │  ┌─ 文本上下文 ─────────────────┐ │
│  │  │ <text_1> "2025年Q3营收1280万"  │ │
│  │  │ <source_1> 来源: report.pdf p.3 │ │
│  │  └────────────────────────────┘ │
│  │  ┌─ 表格上下文 ─────────────────┐ │
│  │  │ <table_1> [Markdown 表格]     │ │
│  │  └────────────────────────────┘ │
│  └────────────────────────────────┘
│  ┌── 用户查询 ────────────────────┐  │
│  │ [用户输入的查询文本]               │
│  └────────────────────────────────┘
│                                        │
│  ┌── 输出约束 ─────────────────────┐  │
│  │  · 使用检索到的信息回答, 不要编造    │
│  │  · 如有矛盾信息, 说明矛盾           │
│  │  · 引用来源                      │
│  └────────────────────────────────┘
└────────────────────────────────────────┘
```

### 6.7.7 多模态 Prompt 工程选型决策树

```
多模态 Prompt 工程选型？
│
├─ 需要精确定位目标？
│   └─ 是 → Grounding DINO bbox + Prompt 引导
│
├─ 需要结构化输出？
│   ├─ JSON → 明确指定 schema
│   ├─ Markdown → 模板化
│   └─ Python 字典 → JSON + json.loads()
│
├─ 幻觉敏感场景？
│   ├─ 是 → 幻觉抑制 Prompt + 多帧验证
│   └─ 否 → 标准 Prompt
│
├─ 知识库规模大？
│   ├─ 是 → 检索结果注入 + 引用约束
│   └─ 否 → 标准 Prompt
│
└─ 通用场景 → 模态感知 Prompt + 输出格式约束
```

---

# 第 7 章 模态对齐与语义对齐工程实践

## 7.1 模态对齐理论

多模态 RAG 的核心挑战在于：**文本、图像、表格等不同模态的数据如何在共享语义空间中实现对齐**。对齐的质量直接决定检索召回的准确率和生成答案的可靠性。

### 7.1.1 对比学习（Contrastive Learning）

对比学习是跨模态对齐的基础范式。其核心思想是：将同一实体在不同模态下的表示拉近，将不同实体的表示推远。

以 CLIP 为例，文本编码器 $E_T$ 和图像编码器 $E_I$ 被联合训练，使得匹配对 $(t_i, v_i)$ 的内积最大化，非匹配对的最小化。

在 RAG 场景下的关键差异：

| 维度 | 标准 CLIP | RAG 适配对比学习 |
|------|--|--|
| **训练目标** | 图像-文本匹配 | 查询-检索内容的语义一致 |
| **负样本策略** | 随机采样 | 难负样本挖掘（in-batch hard negatives） |
| **粒度** | 全局 | 局部（段落级、区域级） |
| **延迟容忍** | 离线训练 | 在线对齐（检索-生成链路中实时校验） |

### 7.1.2 协同对比学习

协同对比学习将多个模态联合建模，构建共享跨模态空间：

```
            ┌─────────────┐
            │ 共享语义空间  │
            └───┬───┬───┘
        ┌───┐   │   ┌───┐
        │E_T│───┘   │E_I│
        └───┘       └───┘
        文本编码器    图像编码器
```

### 7.1.3 交叉模态注意力

| 策略 | 描述 | 适用场景 | 代价 |
|------|--|--|--|
| **早期融合** | 所有模态拼接后进入统一注意力 | 模态间关系紧密 | 窗口爆炸 |
| **晚期融合** | 各模态独立计算后加权 | 模态独立性较强 | 丢失跨模态交互 |
| **分层融合** | 先模态内融合，再跨模态 | 通用场景 | 架构复杂 |
| **条件融合** | 根据 query 动态选择 | 多模态异构性强 | 需要路由模型 |

---

## 7.2 投影层设计

| 场景 | 推荐方案 | 参数量级 | 训练成本 |
|------|---------|--|--|
| 模态编码器已充分预训练 | Linear | O(d²) | 极低 |
| 从头训练对齐 | MLP (2-3 层) | O(2-3·d²) | 中等 |
| 长输入压缩 | Resampler | O(d·k·n) | 高 |
| 生产环境推理优先 | Linear + 量化 | O(d²) | 零 |
| 多模态异构性强 | MLP + Resampler 级联 | O(3·d² + d·k·n) | 极高 |

---

## 7.3 语义对齐工程实践（核心章节）

### 7.3.1 检索-生成语义一致性检查

**关键问题**：检索结果在视觉上相关，但在语义上与查询意图不一致。

```python
class LightConsistencyChecker:
    """轻量检索-生成一致性检查器 (BERT-base ~5ms/query)"""
    def score(self, query: str, text_chunk: str) -> float:
        inputs = self.tokenizer(query, text_chunk, padding=True,
                               truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            logits = self.encoder(**inputs).logits
            return torch.sigmoid(logits).item()

# 阈值：文本 0.55-0.65, 视觉 0.50-0.60
```

### 7.3.2 视觉锚定（Visual Grounding）

Bounding Box 标注：将文档图像中的关键区域用 bounding box 标注，支持后续生成阶段的精确定位引用。

```python
class VisualGroundingEngine:
    def ground_regions(self, image, query, threshold=0.5):
        boxes, logits = self.model.detect(image, phrases=query)
        regions = []
        for box, logit in zip(boxes, logits):
            if logit > threshold:
                x1, y1, x2, y2 = box
                regions.append({"box_id": f"region_{len(regions)}", "bbox": [x1, y1, x2, y2], "confidence": float(logit)})
        return regions
```

### 7.3.3 多模态消歧策略

同一查询在不同模态下可能返回矛盾结果。消歧策略：事实型优先文本/表格，其他类型用加权投票+冲突检测+置信度融合。

### 7.4 检索结果的多模态注入

| 策略 | 描述 | Token 开销 |
|------|--|--|
| **串行注入** | 文本→图片描述→表格 HTML | 低 |
| **并行注入** | 各模态独立注入 | 中 |
| **层级注入** | 先模态内摘要，再跨模态 | 高 |
| **选择性注入** | 仅注入最相关部分 | 最低 |

**Token 压缩**：图片→bounding box+OCR+caption；表格→相关行/列+摘要；文本→Top-3 段落+摘要。

### 7.5 模态互补与消歧

| 场景 | 不足模态 | 补充模态 | 方案 |
|------|---------|--|--|
| 纯文本无图 | 缺少可视化 | 检索相似图表 | CLIP 图检索 |
| 图片无文字 | 缺少数值 | 检索关联表格 | 结构化检索 |
| 表格无上下文 | 缺少解释 | 检索关联文本 | 跨模态检索 |

---

# 第 8 章 多模态 RAG 架构设计

## 8.1 架构模式总览

| 架构 | 核心思路 | 优势 | 劣势 | 适用 |
|------|---------|--|--|--|
| **Text-Centric** | 所有模态先转文本→统一检索 | 简单成熟 | 丢失视觉信息 | 文本密集、成本敏感 |
| **Native Multimodal** | 各模态原生编码→跨模态检索 | 保留全部信息 | 计算成本高 | 复杂文档、高精度 |
| **Hybrid** | 简单走 Text，复杂走 Native | 平衡 | 路由策略复杂 | 混合模态 |
| **检索-生成一体化** | 检索与生成共享参数 | 端到端优化 | 极复杂 | 研究场景 |

## 8.2 Text-Centric 深度解析

```
原始文档页 → OCR/解析(Tesseract/Marker) → 统一文本检索(BM25+Dense) → LLM生成
```

| 优势 | 劣势 |
|--|--|
| ✅ 成熟、简单、低成本 | ❌ 丢失视觉信息 |
| ✅ 可复用现有 RAG 管线 | ❌ OCR 错误不可逆 |

**OCR 幻觉陷阱**：OCR 把代码里的 `;` 识别成了 `:`——真实坑位。

## 8.3 Native Multimodal 深度解析

```
文本→TextEncoder→向量  图像→VisionEncoder→向量
表格→TableEncoder→向量  视频→VideoEncoder→向量
        ↓
   跨模态向量检索(统一空间)
        ↓
   多模态LLM生成(GPT-4o/Qwen-VL)
```

**ColPali 方案**：直接对文档页面进行视觉特征编码（多向量），不预先 OCR。

## 8.4 混合架构

```
用户查询 → 路由决策器(内容复杂度判断)
  ├─ 复杂度<0.3 → Text-Centric
  ├─ 复杂度>0.7 → Native Multimodal
  └─ 0.3-0.7 → 并行两条管线，择优
```

## 8.5 架构选型决策树

```
你的知识库主要模态？
  ├─ 纯文本 → Text-Centric
  ├─ 图文混合 → 简单图表→Text-Centric / 复杂图表→Native
  ├─ 含表格 → 简单表格→Text+Marker / 复杂表格→Native+ColPali
  ├─ 含视频/音频 → Native Multimodal
  └─ 全模态 → Hybrid
```

## 8.6 工程框架选型

| 框架 | 多模态支持 | 语言 | 活跃程度 | 学习曲线 |
|------|---------|--|--|--|
| **LlamaIndex** | ✅（部分） | Python | 🔥 高 | 中 |
| **LangChain** | ✅（部分） | Python/JS | 🔥 高 | 高 |
| **Haystack** | ✅ | Python | 📈 中 | 中 |
| **RAGFlow** | ✅（原生） | Python | 📈 中 | 低 |
| **Dify** | ✅ | 可视化 | 📈 中 | 低 |

---

# 第 9 章 结构化与非结构化融合检索

## 9.1 为什么需要融合检索

场景：搜"Android 内存泄漏"，结果同时包含 Markdown 描述（非结构化文本）、时序图（非结构化视觉）、Bug 状态表（结构化数据）。单一策略无法同时召回。

| 策略 | 召回 Markdown | 召回时序图 | 召回 Bug 表 | 融合？ |
|------|---------|--|--|--|
| 纯向量检索 | ✅ | ✅ | ❌ | ❌ |
| 纯 SQL | ❌ | ❌ | ✅ | ❌ |
| BM25 | ✅ | ❌ | ❌ | ❌ |
| **融合检索** | ✅ | ✅ | ✅ | ✅ |

## 9.2 混合索引架构

```
文本索引(BM25)  ─┐
向量索引          ├─→ 结果融合引擎(RRF/加权/排序) ─→ Top-K 融合结果
结构化DB(SQL)    ─┘
```

## 9.3 多路召回与结果融合

```python
def multi_path_retrieval(query: str) -> dict:
    text_results = elasticsearch.search(query, k=50)
    vector_results = milvus.search(embedder.encode(query), k=50)
    sql_results = db.query(f"SELECT * FROM bugs WHERE summary LIKE '%{query}'")
    image_results = clip_retriever.search(query, k=20)
    return {"text": text_results, "vector": vector_results, "structured": sql_results, "visual": image_results}

def hybrid_retrieve(query: str, top_k: int = 10) -> list:
    paths = multi_path_retrieval(query)
    all_results = []
    for path_name, results in paths.items():
        for i, result in enumerate(results):
            rrf_score = 1.0 / (60 + i)
            modality_weight = {"text": 1.0, "vector": 1.0, "structured": 0.8, "visual": 0.6}
            all_results.append({"content": result, "path": path_name, "score": rrf_score * modality_weight.get(path_name, 1.0)})
    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results[:top_k]
```

| 融合策略 | 原理 | 适用场景 |
|------|--|--|
| **RRF** | 排名倒数求和 | 通用 |
| **加权融合** | 分数加权求和 | 置信度已知 |
| **Stacking** | ML 学习权重 | 有标注数据 |
| **分层融合** | 先模态内再跨模态 | 优先级不同 |

## 9.4 实战案例：Android 开发知识库

方案：Elasticsearch（文本）+ Milvus（向量）+ MySQL（结构化）→ RRF 融合

---

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
|------|-----------|-----------|-----------||
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
|------|-- ----|-------||
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
│                    │ └──────────┘ │  │              │             │
│                    │ ┌──────────┐ │  │              │             │
│                    │ │ 幻觉检测  │ │  │              │             │
│                    │ │ 引擎      │ │  │              │             │
│                    │ └──────────┘ │  │              │             │
│                    └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌────────────────────────────────────────────────────────┐          │
│  │                    延迟 & 成本监控                     │          │
│  │  端到端延迟分解 → 各组件耗时 → P50/P95/P99          │          │
│  │  Token 消耗统计 → 嵌入成本 + LLM 成本 + OCR 成本     │          │
│  └────────────────────────────────────────────────────────┘          │
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
│   ├── 字符级幻觉：;→:, 0/O, 1/l/I
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
|---------|-- ----|---- ||----||
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
|------|-----------|--------|----- ----|---------|------|
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
|---------|----- --------|-- ---------|-- -----||
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
│  └─────────────┘    │  提取)        │      └───┬──────┘           │
│                     └──────────────┘           │                 │
│                                                │                 │
│  ┌─────────────┐    ┌──────────────┐      ┌───▼────┐           │
│  │  医生查询     │───→│ 查询编码     │─────→│ 向量索引  │           │
│  │ (text/image) │    │ (CLIP)      │      │ (Milvus) │           │
│  └─────────────┘    └──────────────┘      └─────────┘           │
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
|------|-- -----||
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
├────────────────────────────────────────────────────────────────────┤
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
│                                      │  合规分析)     │                   │
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
|------|-- -----||
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
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ 商品数据源   │───→│ 图像预处理   │───→│ CLIP 图像    │         │
│  │ (ERP/CRM)    │    │ (resize/    │    │ 嵌入          │         │
│  └─────────────┘    │  normalization)│    └───┬──────┘         │
│                     └──────────────┘           │                 │
│                                               │                 │
│  ┌─────────────┐    ┌──────────────┐         │                 │
│  │ 商品属性     │───→│ 属性嵌入     │→     联合嵌入               │
│  │ (价格/颜色/  │    │ (属性编码)   │→  CLIP Text 端            │
│  │  材质/品牌)  │    └──────────────┘         │                 │
│  └─────────────┘                             │                 │
│                                               │                 │
│  ┌─────────────┐    ┌──────────────┐      ┌──▼────┐           │
│  │ 用户查询     │───→│ 查询理解     │─────→│ 向量库  │           │
│  │ (text/image) │    │ (意图/属性   │      │ (Milvus)│           │
│  └─────────────┘    │  提取)        │      └─────────┘           │
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
|------|-- -----||
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
├────────────────────────────────────────────────────────────────────┤
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
|------|-- -----||
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
├────────────────────────────────────────────────────────────────────┤
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
|------|-- -----||
| 公式 OCR 复杂度高 | Mathpix API + Sympy 验证管线 |
| 知识点关联稀疏 | 教师手动标注 + LLM 辅助关联 |
| 多课件知识整合 | 统一知识点编码 + 跨课件知识图谱 |
| 学生理解水平差异 | Tutor Mode 动态调整回答难度 |
| 课件更新频繁 | 增量更新管线 + 版本管理 |
| 多语言课件 | 多语言嵌入模型（m3e-multilingual） |

---

## 11.6 案例对比总结

| 维度 | 医疗影像 | 企业合同 | 产品目录 | 金融研报 | 教育课件 |
|------|---------|---------|---------||-- -------|-------||
| **核心模态** | CT/MRI/X-Ray | 扫描件 + 表格 | 商品图 + 属性 | 图表 + 表格 + 公式 | 文本 + 公式 + 图表 |
| **嵌入模型** | MedCLIP / CLIP-ViT-L | BGE-M3 | CLIP-ViT-L | ChartBert + BGE | m3e-multilingual |
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
|-- ----|---------|---------||---- ----|-----------|------||- ----||-------||
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
│  ┌────▼────────────────────────────────────────────────────────────┐ │
│  │ L1: 查询级缓存 (Redis)                                             │ │
│  │   - 缓存键: hash(query_text + 模态)                                │ │
│  │   - TTL: 30s - 5min (高频查询短 TTL)                               │ │
│  │   - 命中率: ~60-80% (电商/FAQ 场景)                                │ │
│  │   - 容量: 100K - 1M 条目 (内存 ~500MB-5GB)                        │ │
│  └───┬─────────────────────────────────────────────────────────┘ │
│       │ hit? → 返回结果                                                │
│       │ miss? ↓                                                       │
│  ┌────▼────────────────────────────────────────────────────────────┐ │
│  │ L2: 嵌入级缓存 (内存)                                               │ │
│  │   - 缓存键: hash(原始文本/图像特征)                                  │ │
│  │   - TTL: 无 (常驻内存)                                             │ │
│  │   - 命中率: ~30-50% (重复查询)                                     │ │
│  │   - 容量: LRU 10K - 100K 条目                                    │ │
│  └───┬─────────────────────────────────────────────────────────┘ │
│       │ hit? → 返回嵌入 → 向量检索                                     │
│       │ miss? ↓                                                       │
│  ┌────▼────────────────────────────────────────────────────────────┐ │
│  │ L3: 向量检索结果缓存 (Milvus 内存)                                   │ │
│  │   - 缓存检索结果的 Top-K ID 列表                                   │ │
│  │   - TTL: 1h - 24h (数据更新时失效)                                │ │
│  │   - 命中率: ~10-30%                                              │ │
│  └───┬─────────────────────────────────────────────────────────┘ │
│       │ hit? → 返回 Top-K → 重排 → 生成                              │
│       │ miss? ↓                                                       │
│  ┌────▼────────────────────────────────────────────────────────────┐ │
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
|------|---------|-----------|---------|---------|---------|--- ---||
| **vLLM** | AWQ/GPTQ/INT8 | ✅ (vLLM-InternVL, Qwen2-VL) | ✅ PagedAttention | ✅ | 低 | 高吞吐服务端 |
| **TGI** | AWQ/GPTQ | ❌ (需自定义) | ✅ | ✅ | 中 | HuggingFace 生态 |
| **TensorRT-LLM** | FP8/INT8 | ✅ (需自定义插件) | ✅ | ✅ | 高 | 极致性能 |
| **llama.cpp** | GGUF(INT4/INT6) | ✅ (llama.cpp + mla) | ✅ | ✅ | 极低 | CPU/本地 |
| **Ollama** | GGUF | ✅ (内置 Qwen2-VL 等) | ✅ | ✅ | 极低 | 开发/演示 |

### 12.3.2 量化方案对比

| 量化方案 | 精度损失 | 显存压缩 | 推理速度提升 | 实现复杂度 | 适用模型 |
|---------|----- ----|---------|--- ---------|-- --------||------||
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

┌──────────────────────────────────────────────────────────────────────────┐
│                        Qwen2-VL-7B                                 │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ LLM 主体 (7B parameters)                                     │  │
│  │  FP16: ~14GB (params) + ~7GB (activations) = ~21GB          │  │
│  │  INT8: ~7GB (params) + ~7GB (activations) = ~14GB           │  │
│  │  INT4: ~3.5GB (params) + ~7GB (activations) = ~10.5GB       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 视觉编码器 (ViT-L/14, 307M params)                           │  │
│  │  FP16: ~0.6GB (params) + ~1.2GB (activations) = ~1.8GB     │  │
│  │  INT8: ~0.3GB (params) + ~1.2GB (activations) = ~1.5GB     │  │
│  │  INT4: ~0.15GB (params) + ~1.2GB (activations) = ~1.35GB   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 其他 (投影层 + KV Cache + 开销)                               │  │
│  │  KV Cache (8192 tokens): ~560MB × layers                     │  │
│  │  投影层: ~2.5GB                                              │  │
│  │  框架开销: ~1-2GB                                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ────────────────────────────────────────────────────────────     │
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
┌────────────────────────────────────────────────────────────────┐
│  LLM 主体 (26B params):                                     │
│    FP16 params: ~52GB                                         │
│    Activations (batch=1, seq=4096): ~30GB                   │
│    KV Cache (26 layers × 4096 × 128): ~35GB                │
│    ─────────────────────────                                  │
│    LLM 小计: ~117GB                                           │
│                                                               │
│  视觉编码器 (ViT-H/14):                                       │
│    FP16 params: ~0.6GB                                        │
│    Activations (img_size=336): ~1.5GB                        │
│    ─────────────────────────                                  │
│    Vision 小计: ~2.1GB                                         │
│                                                               │
│  投影层 + 框架开销: ~8GB                                       │
│                                                               │
│  总计 (FP16): ~127GB                                          │
│  ─────────────────────────                                  │
│  量化到 INT8: ~65GB (params 减半, activations 不变)            │
│  量化到 INT4: ~38GB (params 再减半)                            │
│  ─────────────────────────                                  │
│  INT4 相对 FP16 压缩: 70%                                     │
│  LLM params 占总量: 98.5%  ← 量化 LLM 是核心                   │
└─────────────────────────────────────────────────────────────────┘
```

### 12.4.2 48G VRAM 部署方案 ⭐

48GB VRAM 是一个极具性价比的部署门槛（如 RTX 4090/4090D/5090、L40S 等）。以下是针对 48GB VRAM 的具体部署方案。

#### 方案 A: Qwen2-VL INT4 量化方案（80GB → 24GB）

```
Qwen2-VL-7B 在 48GB VRAM 上的部署方案

┌─────────────────────────────────────────────────────────────────┐
│                                                                      │
│  模型版本: Qwen/Qwen2-VL-7B-Instruct                                │
│  硬件: RTX 4090 (48GB VRAM)                                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 原始 FP16 模型                                                    │ │
│  │  params: 14GB                                                     │ │
│  │  activations: 7GB                                                 │ │
│  │  KV Cache (seq=4096): 560MB × 28 = 15.7GB                       │ │
│  │  投影层: 2.5GB                                                    │ │
│  │  框架开销: 2GB                                                    │ │
│  │  ─────────────────────────                                      │ │
│  │  总计: ~43GB ✅ (刚好 48GB 能放下，但无余量)                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ INT4 量化方案                                                     │ │
│  │  params: 3.5GB (7B × 0.5 bytes/param)                          │ │
│  │  activations: 7GB (INT4 计算仍需 FP16 激活)                       │ │
│  │  KV Cache (seq=4096): 15.7GB (量化后 KV 仍为 FP16)              │ │
│  │  视觉编码器 (INT4): 1.35GB                                       │ │
│  │  投影层: 0.6GB                                                   │ │
│  │  框架开销: 1GB                                                   │ │
│  │  ─────────────────────────                                      │ │
│  │  总计: ~29.4GB ✅                                                │ │
│  │  余量: 48 - 29.4 = 18.6GB → 可支持 seq_len=8192                  │ │
│  │  seq=8192 的 KV Cache: 15.7 × 2 = 31.4GB → 需要 offload          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 视觉编码器单独量化策略                                              │ │
│  │  视觉编码器 INT4: params=0.15GB, activations=1.2GB                │ │
│  │  相比 FP16 (0.6+1.2=1.8GB) → 节省 0.45GB                        │ │
│  │  对 48GB 总显存贡献较小，但可配合 layer-wise offload 使用           │ │
│  │                                                                    │ │
│  │  实施步骤:                                                        │ │
│  │  1. 使用 bitsandbytes 量化视觉编码器                             │ │
│  │  2. LLM 主体用 AWQ/GPTQ 量化到 INT4                             │ │
│  │  3. 联合推理时，视觉编码器加载到 GPU0，LLM 加载到 GPU0/1           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
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
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ──────────────────────────────────────────────────────────  │
│  总结: 48GB VRAM 部署 Qwen2-VL 7B 的最佳配置:                        │
│  • 量化精度: INT4 (AWQ)                                               │
│  • 序列长度: 4096 (全 GPU) / 8192 (分层 offload)                     │
│  • 批量大小: 1 (max)                                                  │
│  • 推理速度: ~30-45 tokens/s (INT4 全 GPU)                            │
│  ──────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────┘
```

#### 方案 B: InternVL2 INT8 量化方案

```
┌─────────────────────────────────────────────────────────────────────┐
│                     InternVL2 系列在 48GB VRAM 上的部署               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-2B (小模型，可直接部署)                               │  │
│  │  FP16 显存: ~6GB (params) + ~4GB (activations) = ~10GB       │  │
│  │  ✅ 48GB VRAM 轻松部署，seq_len 可达 8192                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-8B                                                  │  │
│  │  FP16: ~16GB (params) + ~8GB (act) + ~20GB (KV) = ~44GB     │  │
│  │  INT8: ~8GB (params) + ~8GB (act) + ~20GB (KV) = ~36GB      │  │
│  │  INT4: ~4GB (params) + ~8GB (act) + ~20GB (KV) = ~32GB      │  │
│  │  ✅ 48GB VRAM 可部署 INT8/INT4                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
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
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ InternVL2-40B (超大模型)                                      │  │
│  │  INT4: ~55GB + vision + 其他 = ~60GB ❌ 48GB 不够              │  │
│  │  解决方案: 2×GPU 并行 (2×48GB = 96GB)                         │  │
│  │  或: CPU offload (速度大幅下降)                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

#### 方案 C: 多卡并行策略

```
┌─────────────────────────────────────────────────────────────────┐
│                  多卡并行部署方案（2×48GB）                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
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
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
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
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 推荐: 对于 7B 模型，单卡 INT4 即可                             │  │
│  │       对于 8-26B 模型，双卡 Tensor Parallel 更合适             │  │
│  │       对于 40B+ 模型，需要 2×GPU 或 CPU offload                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### 对比表：各模型在不同量化精度下的显存占用与推理速度

| 模型 | FP16 显存 | INT8 显存 | INT4 显存 | INT4 @ 48GB | INT4 @ 2×48GB | INT4 推理速度(tokens/s) |
|------|------ ----|--------||----------|---- -------||---- --------|- -----------||
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
┌─────────────────────────────────────────────────────────────────┐
│                    多模态模型量化完整指南                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
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
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
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
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 量化后精度评估方法                                              │  │
│  │                                                               │  │
│  │  1. MMLU 分数对比                                              │  │
│  │  2. 多模态评估 (MME / SEED-Bench)                              │  │
│  │  3. OCR 还原准确率测试                                         │  │
│  │  4. 表格还原准确率测试                                         │  │
│  │  5. 图表数据还原误差                                           │  │
│  │  6. 幻觉率测试                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 量化精度选择建议                                                │  │
│  │                                                               │  │
│  │  • FP16: 生产环境首选，精度无损失                              │  │
│  │  • INT8: 显存紧张但可接受精度损失 < 1%                         │  │
│  │  • AWQ INT4: 显存极度紧张，精度损失 2-3%                       │  │
│  │  • NF4: 端侧/极低显存场景，精度损失 3-5%                        │  │
│  │  • FP8: H100/A100 硬件支持，性价比最优                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12.5 存储优化

### 12.5.1 向量索引压缩

| 压缩技术 | 压缩率 | 精度损失 | 查询加速 | 适用场景 |
|---------|----- |-- -------|----- ----|----- ----||
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
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 热数据 (Hot, 最近 30 天)                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ GPU 内存 / NVMe SSD                                    │   │  │
│  │  │ • 高频查询的 chunk 嵌入                                 │   │  │
│  │  │ • 最近上传的文档块                                     │   │  │
│  │  │ • 热门产品/病例/合同                                    │   │  │
│  │  │ 存储: Redis + Milvus GPU Index                          │   │  │
│  │  │ 容量: ~100K 向量 (~500MB)                              │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ 温数据 (Warm, 30-180 天)                               │   │  │
│  │  │ • SSD / HDD                                            │   │  │
│  │  │ • 标准查询频率                                          │   │  │
│  │  │ 存储: Milvus HDD Index + Elasticsearch                  │   │  │
│  │  │ 容量: ~10M 向量 (~50GB)                                │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ 冷数据 (Cold, >180 天)                                 │   │  │
│  │  │ • 对象存储 (S3/OSS/MinIO)                               │   │  │
│  │  │ • 索引压缩存储 (PQ + Parquet)                          │   │  │
│  │  │ • 原始图像/文档保留在对象存储                            │   │  │
│  │  │ 存储: S3 + 压缩向量索引                                 │   │  │
│  │  │ 容量: ~100M+ 向量 (~500GB)                             │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
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
├────────────────────────────────────────────────────────────────────┤
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
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  查询请求                                                     │  │
│  └────────────┬─────────────────────────────────────────────┘  │
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
│ └──┬──┘ └──┬──┘ └──┬──┘                                          │
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
                    ┌─────────────┬──────────────┐
                    │ 多模态类型需求?              │
                    │ ┌────────────────────────┐ │
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
                    │ └────────────────────────┘ │
                    └─────────────┬───────────────┘
                                   │
                    ┌─────────────┬──────────────┐
                    │ 数据规模?                    │
                    │ ┌────────────────────────┐ │
                    │ │ < 10K chunk              │ │
                    │ │ → FAISS / ChromaDB       │ │
                    │ │                         │ │
                    │ │ 10K - 1M chunk           │ │
                    │ │ → Milvus / Qdrant        │ │
                    │ │                         │ │
                    │ │ > 1M chunk               │ │
                    │ │ → Milvus Cluster /       │ │
                    │ │   Weaviate / Zilliz      │ │
                    │ └────────────────────────┘ │
                    └─────────────┬───────────────┘
                                   │
                    ┌─────────────┬──────────────┐
                    │ 部署环境?                    │
                    │ ┌────────────────────────┐ │
                    │ │ 云 API (不自建)           │ │
                    │ │ → OpenAI CLIP + GPT-4o   │ │
                    │ │                         │ │
                    │ │ 本地部署 (GPU)             │ │
                    │ │ → Qwen2-VL + Milvus      │ │
                    │ │                         │ │
                    │ │ 本地部署 (CPU 无 GPU)      │ │
                    │ │ → BGE-M3 + Chroma +      │ │
                    │ │   llama.cpp GGUF          │ │
                    │ └────────────────────────┘ │
                    └─────────────┬───────────────┘
                                   │
                    ┌─────────────┬──────────────┐
                    │ 延迟要求?                     │
                    │ ┌────────────────────────┐ │
                    │ │ < 1s (实时)               │ │
                    │ │ → 缓存 + 流式 + 小模型     │ │
                    │ │                         │ │
                    │ │ 1-5s (可接受)             │ │
                    │ │ → 标准管线                │ │
                    │ │                         │ │
                    │ │ > 5s (离线)               │ │
                    │ │ → 重排 + 大模型           │ │
                    │ └────────────────────────┘ │
                    └─────────────┬───────────────┘
                                   │
                    ┌─────────────┬──────────────┐
                    │ 预算?                        │
                    │ ┌────────────────────────┐ │
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
                    │ └────────────────────────┘ │
                    └─────────────┬───────────────┘
                                   │
                              ┌────▼────┐
                              │ 架构确定 │
                              └─────────┘
```

---

## 13.2 嵌入模型选型指南

```
┌─────────────────────────────────────────────────────────────────┐
│                   嵌入模型选型决策树                                  │
├─────────────────────────────────────────────────────────────────┤
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
└─────────────────────────────────────────────────────────────────┘
```

---

## 13.3 向量数据库选型指南

```
┌─────────────────────────────────────────────────────────────────┐
│                   向量数据库选型决策树                                │
├─────────────────────────────────────────────────────────────────┤
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
└─────────────────────────────────────────────────────────────────┘
```

---

## 13.4 多模态 LLM 选型指南

```
┌─────────────────────────────────────────────────────────────────┐
│                   多模态 LLM 选型决策树                               │
├─────────────────────────────────────────────────────────────────┤
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
└─────────────────────────────────────────────────────────────────┘
```

---

## 13.5 技术栈组合推荐

| 场景 | 推荐嵌入 | 推荐向量库 | 推荐 LLM | 推荐框架 | OCR | 备注 |
|------|---------|-----------||- -------||------- ||----- ||------||
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

