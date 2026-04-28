# 基础 RAG 技术节点深度解析

> 从零开始构建生产级 RAG 系统的完整技术手册  
> 生成时间：2026-04-28 · 版本 2.0

---

## 目录

- [第一部分：RAG 全景架构](#第一部分rag-全景架构)
  - [1.1 为什么需要 RAG](#11-为什么需要-rag)
  - [1.2 RAG 解决的问题](#12-rag-解决的问题)
  - [1.3 基础 RAG 的完整架构大图](#13-基础-rag-的完整架构大图)
  - [1.4 离线流 vs 在线流](#14-离线流-vs-在线流)
  - [1.5 核心设计原则](#15-核心设计原则)
- [第二部分：九个技术节点逐节拆解](#第二部分九个技术节点逐节拆解)
- [第三部分：三个关键补充方向 ⭐](#第三部分三个关键补充方向)
  - [补充一：元数据过滤 (Metadata Filtering)](#补充一元数据过滤-metadata-filtering)
  - [补充二：向量数据库索引参数详解与持久化最佳实践](#补充二向量数据库索引参数详解与持久化最佳实践)
  - [补充三：Prompt 模板优化（防止幻觉的基础手段）](#补充三prompt-模板优化防止幻觉的基础手段)
- [第四部分：完整管线代码](#第四部分完整管线代码)
- [附录：技术选型速查表](#附录技术选型速查表)

---

## 第一部分：RAG 全景架构

### 1.1 为什么需要 RAG

在理解 RAG 之前，先想一个问题：**为什么不能直接让大语言模型回答问题？**

大语言模型（LLM）本质上是一个基于预训练语料统计概率生成文本的系统。它在训练时"记住"了海量知识，但这份"记忆"有几个根本性的限制：

| 限制 | 具体表现 | 实际影响 |
|------|----------|--|
| **知识截止** | 模型只能回答训练数据中包含的知识 | 无法回答关于"今天发生了什么"的问题 |
| **领域盲区** | 通用模型缺乏企业私有知识 | 无法回答"我们公司的报销流程是什么" |
| **知识固化** | 更新知识需要重新训练模型 | 政策变更 → 重新训练 → 昂贵且缓慢 |
| **不可验证** | 模型生成的内容没有引用来源 | 用户无法判断答案是否可信 |
| **成本高昂** | 持续训练/微调成本巨大 | 中小企业难以负担 |

**RAG（Retrieval-Augmented Generation，检索增强生成）** 的出现就是为了解决这些问题。它的核心思想极其简单——**在回答之前，先"查资料"**。

```
传统方式:  用户提问 → LLM（凭记忆回答）→ 回答（可能过时/错误）
RAG 方式:  用户提问 → 检索知识库 → 找到相关资料 → LLM（带着资料回答）→ 回答（准确/可验证）
```

RAG 的优势在于：
- **时效性**：知识库可以随时更新，回答永远基于最新资料
- **领域专用**：可以喂入任何私有文档（内部流程、产品手册、法规政策）
- **可解释性**：每个回答都可以追溯到参考资料
- **低成本**：无需微调/训练，只需管理知识库

### 1.2 RAG 解决的问题

RAG 主要解决以下四个层面的问题：

```
┌──────────────────────────────────────────────────────────────┐
│                   RAG 解决的四大问题                          │
├──────────────┬───────────────────────────────────────────────┤
│ 知识缺失      │ LLM 没有你的企业数据 → RAG 让它"看到"这些数据   │
│              │ "我们的 CRM 系统里有哪些未解决的工单？"          │
├──────────────┼───────────────────────────────────────────────┤
│ 知识过时      │ 模型的知识停留在训练截止时间 → RAG 提供最新信息   │
│              │ "2024 年最新的产品定价是多少？"                   │
├──────────────┼───────────────────────────────────────────────┤
│ 幻觉问题      │ LLM 可能"编造"不存在的细节 → RAG 提供可验证依据  │
│              │ "根据参考资料 X，答案应该是..."                   │
├──────────────┼───────────────────────────────────────────────┤
│ 领域专业性    │ 通用模型在垂直领域（法律/医疗/金融）表现不足     │
│              │ RAG 喂入领域专用文档 → 回答更精准                   │
└──────────────┴───────────────────────────────────────────────┘
```

### 1.3 基础 RAG 的完整架构大图

这是本节的重点——**在拆解任何节点之前，先理解整体架构**。一张大图胜过千言万语：

```
┌────────────────────────────────── 生产级 RAG 系统完整架构图 ──────────────────────────────────┐
│                                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                    数据源 (Sources)                                          │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─────────┐         │  │
│  │  │ PDF  │ │ Word │ │ HTML │ │ MD   │ │ JSON  │ │ CSV   │ │ API   │ │ 数据库  │  ...    │  │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └─────────┘         │  │
│  └─────┼────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────────────────────┘  │
│        │        │        │        │         │         │         │                                                         │
│  ┌─────▼────────▼────────▼────────▼─────────▼─────────▼─────────▼───────────────────────────────────────────────┐  │
│  │                                        离线流：索引构建管道 (Offline Indexing Pipeline)                        │
│  │                                                                                                              │
│  │  ┌──────────────┐    ┌────────────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────────────┐     │  │
│  │  │  1. 文档加载  │───▶│  2. 解析与清洗  │───▶│  3. 文本分块 │───▶│  4. 向量化  │───▶│   5. 向量存储     │     │  │
│  │  │              │    │                │    │              │    │            │    │                  │     │  │
│  │  │ 格式转换      │    │ 去噪声/保结构    │    │ 拆分语义块   │    │ 文本→向量  │    │ 存储+索引        │     │  │
│  │  │ 统一文档格式  │    │ 移除页眉页脚    │    │ chunk_size   │    │ embedding  │    │ 向量+元数据+文本  │     │  │
│  │  └──────────────┘    └────────────────┘    └──────────────┘    └────────────┘    └──────────────────┘     │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                        在线流：查询管道 (Online Query Pipeline)                                  │
│  │                                                                                                                 │
│  │  ┌──────────┐   ┌────────────────┐   ┌──────────────────┐   ┌──────────────┐   ┌────────────────┐           │  │
│  │  │ 6. 检索  │──▶│  7. Prompt 构建 │──▶│   8. LLM 生成   │──▶│  9. 引用输出  │           │           │  │
│  │  │          │   │                │   │                │   │              │           │           │  │
│  │  │ 向量搜索  │   │ 上下文编排     │   │ 基于上下文生成  │   │ 引用溯源     │           │           │  │
│  │  │ TopK 相关 │   │ token 预算控制 │   │ 低温度+约束    │   │ 格式/引用标记  │           │           │  │
│  │  └──────────┘   └────────────────┘   └──────────────────┘   └──────────────┘           │           │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  ┌────────────────────────────────────────── 支撑层 (Supporting Layer) ────────────────────────────────────────────┐  │
│  │                                                                                                                │  │
│  │  ┌─────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────┐           │  │
│  │  │   评估系统   │  │  监控告警   │  │  权限控制   │  │ 缓存管理    │  │  索引增量更新  │  │  安全检测   │           │  │
│  │  │ (RAGAS)     │  │ (延迟/成本) │  │ (RBAC)     │  │ (Redis等)   │  │ (upsert/delete) │  │ (防投毒)  │           │  │
│  │  └─────────────┘  └────────────┘  └────────────┘  └─────────────┘  └──────────────┘  └────────────┘           │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**上图解读**：

这张架构图可以分成三个层次来理解：

**第一层：数据源（Sources）** —— 你有哪些知识来源？
PDF、Word、HTML、Markdown、JSON、CSV、API 接口、数据库……任何你能获取的格式都是数据源。RAG 的第一步就是让系统能读取这些数据。

**第二层：离线流（Offline Pipeline）** —— 在后台构建知识库
这是**一次性的（或定期执行）**的数据处理流程。用户看不到这个过程，但它决定了检索的"素材质量"。九个节点中的前五个（①~⑤）属于这个流。

**第三层：在线流（Online Pipeline）** —— 用户提问时的实时处理流程
当用户提出问题后，系统实时执行：检索 → 构建 Prompt → 生成 → 输出。节点⑥~⑨属于这个流。

**支撑层（Supporting Layer）** —— 贯穿始终的运维能力
评估、监控、权限、缓存、更新、安全。这些不直接参与 RAG 流程，但决定了系统能否在生产环境中稳定运行。

### 1.4 离线流 vs 在线流

理解离线流和在线流的区分至关重要，这直接决定了系统设计和部署方式：

```
                      ┌─────────────────────────────────────┐
                      │          离线流 (Indexing)          │
                      │                                      │
                      │  · 不直接对用户可见                   │
                      │  · 批量处理、可以很慢                  │
                      │  · 可以重试、可以批量                  │
                      │  · 决定"检索素材的质量"               │
                      │                                      │
                      │  执行时机: 文件变更 / 定时任务          │
                      │  关键指标: 覆盖率、准确性、完整性        │
                      └─────────────────────────────────────┘

                      ┌─────────────────────────────────────┐
                      │          在线流 (Querying)          │
                      │                                      │
                      │  · 直接响应用户请求                   │
                      │  · 需要低延迟（端到端 < 3-5 秒）      │
                      │  · 每次请求独立                       │
                      │  · 决定"回答的质量"                  │
                      │                                      │
                      │  执行时机: 用户实时提问                  │
                      │  关键指标: 延迟、相关性、忠实度          │
                      └─────────────────────────────────────┘
```

**为什么分两个流？**

1. **性能隔离**：索引是 CPU/内存密集型的，查询是 GPU/网络密集型的，分开部署互不干扰
2. **更新策略不同**：索引可以批量处理、重试、分批；查询必须快速响应
3. **可维护性**：索引管道可以独立升级（比如换分块策略），不影响在线查询
4. **伸缩性**：索引和查询可以根据负载独立扩缩容

### 1.5 核心设计原则

在设计 RAG 系统时，有四个不可违背的原则：

**原则一：Garbage In, Garbage Out（GIGO）**

RAG 系统的回答质量严格受限于索引阶段的数据质量。如果文档加载不完整、清洗过度、分块破坏语义、向量化丢失关键信息——这些问题会像多米诺骨牌一样在后续节点被放大。

```
文档质量  →  分块质量  →  向量质量  →  检索质量  →  回答质量
  ↓            ↓            ↓            ↓            ↓
 100%          90%          80%          70%          50%
```

**原则二：检索是核心瓶颈**

在 RAG 系统的九个节点中，**检索节点（节点六）对最终质量的影响最大**。再好的 LLM 也无法弥补糟糕的检索——给它错误的上下文，它只会"流畅地胡说八道"。

**原则三：评估不可省略**

没有评估的 RAG 是盲人摸象。必须建立基线指标（Recall@K、Faithfulness、Context Precision 等），才能知道优化是否有效。

**原则四：渐进式复杂化**

从最简单的 RAG（向量检索 + 生成）开始，确认它能解决 80% 的问题后，再引入混合检索、重排序、GraphRAG 等进阶技术。**不要一开始就上 Agentic RAG。**

---

## 第二部分：九个技术节点逐节拆解

---

### 节点一：文档加载 (Document Loading)

#### 一、这个节点是干什么的？

想象你刚入职一家公司，老板给你一箱文件——有 PDF 手册、Word 文档、HTML 网页打印稿、Markdown 笔记、Excel 表格。你需要把它们都"读"进来，变成系统能统一处理的数据。

**文档加载器的任务就是做这件事：把各种格式的原始文档，转换为统一的 `Document` 对象（包含 `page_content` 文本 + `metadata` 元数据）。**

#### 二、为什么它很重要？

文档加载看似简单，实则暗藏很多坑：

| 陷阱 | 具体表现 | 后果 |
|------|--|------|
| PDF 文字编码 | PDF 中的文字可能以不可见的方式编码，直接读取得到乱码 | 所有后续节点都失效 |
| 扫描件 PDF | PDF 是图片，没有文字层 | `PyPDFLoader` 读出来是空的 |
| HTML 复杂结构 | 导航栏、广告、脚本都混在一起 | 引入大量噪声 |
| 表格丢失 | 表格被拆成乱序的文本 | 结构化信息丢失 |
| 特殊格式 | PPTX、PowerPoint、Excel、XML 等 | 需要专门的加载器 |
| 编码问题 | GBK/GB2312/UTF-8 混用 | 中文乱码 |

#### 三、技术原理

文档加载的核心流程是：

```
原始文件 (bytes)
    │
    ▼
┌──────────────────────────────────────────┐
│  格式检测（通过文件扩展名和 magic bytes）   │
│  .pdf → PyPDFLoader                       │
│  .docx → Docx2txtLoader                   │
│  .html → UnstructuredHTMLLoader           │
│  .md → TextLoader                         │
│  ...                                      │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│  格式特定解析器                            │
│  - PDF: 提取文字层 + 页面布局              │
│  - DOCX: 解压 ZIP + 解析 XML               │
│  - HTML: 解析 DOM 树 + 提取正文             │
│  - Markdown: 直接读取文本                   │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│  输出统一格式                              │
│  Document(page_content="文本...",         │
│           metadata={source, page, ...})   │
└──────────────────────────────────────────┘
```

**关键设计决策**：
- **每页一个 Document**（PDF）还是**每节一个 Document**？前者简单但粒度粗，后者粒度高但可能跨页
- **保留元数据**：`source`（来源文件）、`page`（页码）、`section`（章节名）——元数据在后续检索过滤中极其重要
- **容错处理**：加载失败时是跳过还是重试？建议跳过并记录日志

#### 四、代码实现

```python
# ================================================================
# 方案 A：LangChain 文档加载器（推荐：覆盖面最广）
# ================================================================
from langchain_community.document_loaders import (
    PyPDFLoader,          # PDF 加载
    Docx2txtLoader,        # Word 文档加载
    UnstructuredHTMLLoader,  # HTML 网页加载
    TextLoader,            # 纯文本加载
    DirectoryLoader,       # 批量目录加载
    JSONLoader,            # JSON 加载
)
import os

# ---- 单个 PDF 文件加载 ----
loader = PyPDFLoader("docs/company_handbook.pdf")
pages = loader.load()  # 返回 list[Document]

for page in pages[:3]:  # 只看前两页做演示
    print(f"--- 第 {page.metadata['page']} 页 ---")
    print(f"来源: {page.metadata['source']}")
    print(f"内容预览: {page.page_content[:200]}...")
    print()

# ---- 批量加载整个目录 ----
# 自动检测文件类型，支持 glob 模式
dir_loader = DirectoryLoader(
    "./docs/",                   # 文档目录
    glob="**/*.pdf",             # 匹配模式（** 表示递归子目录）
    loader_cls=PyPDFLoader,      # 使用的加载器类
    show_progress=True,          # 显示加载进度条
    loader_kwargs={"password": "secret"},  # 加密 PDF 的密码
)
all_docs = dir_loader.load()
print(f"总共加载了 {len(all_docs)} 页")

# ---- Word 文档加载 ----
docx_loader = Docx2txtLoader("docs/project_proposal.docx")
docx_docs = docx_loader.load()

# ---- HTML 网页加载 ----
html_loader = UnstructuredHTMLLoader("docs/api_guide.html")
html_docs = html_loader.load()

# ---- JSON 文件加载（支持 jq 路径提取）----
json_loader = JSONLoader(
    file_path="docs/api_docs.json",
    jq_schema=".articles[]",      # jq 表达式：提取 articles 数组中的每个元素
    text_content=True,            # 提取为文本
)
json_docs = json_loader.load()

# ---- 混合格式目录加载 ----
mixed_loader = DirectoryLoader(
    "./docs/",
    glob="**/*.{pdf,docx,md,txt}",  # 多种扩展名
    show_progress=True,
)
mixed_docs = mixed_loader.load()
```

```python
# ================================================================
# 方案 B：LlamaIndex 加载器（文档解析更强）
# ================================================================
from llama_index.readers.file import (
    PDFReader,
    DocxReader,
    MarkdownReader,
    SimpleDirectoryReader,  # 统一的文件目录加载器
)
from llama_index.readers.web import SimpleWebPageReader

# ---- 统一目录加载器（推荐）----
reader = SimpleDirectoryReader(
    input_dir="./docs/",
    required_exts=[".pdf", ".docx", ".md", ".txt", ".pptx"],
    recursive=True,           # 递归子目录
    filename_as_id=True,      # 使用文件名作为 Document ID
    num_files_limit=100,      # 限制文件数量（防内存溢出）
)
all_docs = reader.load_data()

# ---- 在线 URL 加载 ----
# 加载网页内容
web_reader = SimpleWebPageReader(html_to_text=True)
web_docs = web_reader.load_data([
    "https://example.com/docs/getting-started",
    "https://example.com/docs/api-reference",
])

# ---- PDF 加载（支持更多 PDF 引擎）----
pdf_reader = PDFReader()
pdf_docs = pdf_reader.load_data(file_path="docs/manual.pdf")
```

```python
# ================================================================
# 方案 C：手动加载（深入理解原理 + 无外部依赖）
# ================================================================
import fitz  # PyMuPDF — 比 pdfplumber 更快
import docx
from bs4 import BeautifulSoup
import json

def load_pdf(filepath: str, password: str = None) -> list:
    """手动 PDF 加载器：每页作为独立 Document"""
    doc = fitz.open(filepath)
    pages = []
    for i in range(len(doc)):
        page = doc[i]
        # 提取文字（包含布局信息）
        text = page.get_text("text")
        # 提取元数据
        metadata = {
            "source": filepath,
            "page": i + 1,
            "total_pages": len(doc),
            "width": page.rect.width,
            "height": page.rect.height,
            "title": doc.metadata.get("title", "") if i == 0 else "",
        }
        pages.append({
            "page_content": text,
            "metadata": metadata,
        })
    doc.close()
    return pages


def load_docx(filepath: str) -> dict:
    """手动 DOCX 加载器"""
    doc = docx.Document(filepath)
    # 提取段落
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    # 提取表格
    tables = []
    for table in doc.tables:
        rows = []
        for row in table.rows:
            rows.append([cell.text for cell in row.cells])
        tables.append(rows)

    return {
        "page_content": "\n\n".join(paragraphs),
        "metadata": {
            "source": filepath,
            "title": doc.core_properties.title or "",
            "author": doc.core_properties.author or "",
            "tables": tables,
            "paragraph_count": len(paragraphs),
        }
    }


def load_html(filepath: str) -> str:
    """HTML 加载：去除导航、广告等非内容元素"""
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    # 移除干扰元素
    for tag_name in ["script", "style", "nav", "footer", "header", "aside"]:
        for tag in soup.find_all(tag_name):
            tag.decompose()

    # 提取正文（按优先级尝试）
    body = soup.find("main") or soup.find("article") or soup.find("div", class_="content")
    if body:
        text = body.get_text(separator="\n", strip=True)
    else:
        text = soup.get_text(separator="\n", strip=True)

    return text


# 使用
pdf_pages = load_pdf("docs/manual.pdf")
print(f"PDF 加载: {len(pdf_pages)} 页")

docx_result = load_docx("docs/proposal.docx")
print(f"DOCX: {docx_result['metadata']['paragraph_count']} 个段落")
```

```python
# ================================================================
# 方案 D：扫描版 PDF 加载（需要 OCR）
# ================================================================
from pdf2image import convert_from_path
import pytesseract

def load_scanned_pdf(filepath: str) -> list:
    """扫描版 PDF 加载：先转图片再 OCR"""
    # 将 PDF 页面转为图片
    images = convert_from_path(filepath, dpi=300)
    pages = []
    for i, image in enumerate(images):
        # OCR 提取文字
        text = pytesseract.image_to_string(image, lang="chi_sim+eng")
        pages.append({
            "page_content": text,
            "metadata": {"source": filepath, "page": i + 1},
        })
    return pages


# 安装: pip install pdf2image pytesseract poppler
# 注意：还需要安装 Tesseract OCR 引擎 (Windows: choco install tesseract)
```

#### 五、文档加载的技术决策点

在选择文档加载方案时，需要回答以下问题：

```
文档加载选型决策树
│
├─ 你的文档是什么格式？
│   ├─ 单一格式 (全是 PDF) → 对应格式 Loader
│   └─ 混合格式 → DirectoryLoader / SimpleDirectoryReader
│
├─ 文档大小？
│   ├─ < 1000 页 → 全量加载
│   └─ > 1000 页 → 分批加载 + 增量索引
│
├─ PDF 类型？
│   ├─ 文本 PDF → PyPDFLoader / pypdf
│   └─ 扫描 PDF → OCR (tesseract / paddleocr)
│
├─ 需要元数据吗？
│   ├─ 需要 → 选择支持 metadata 的 Loader
│   └─ 不需要 → 简单文本提取即可
│
└─ 生产环境？
    ├─ 是 → LangChain DirectoryLoader (稳定)
    └─ 否 → 手动加载 (理解原理)
```

---

### 节点二：文档解析与清洗 (Parsing & Cleaning)

#### 一、这个节点是干什么的？

如果你拿到了一份 PDF 文档，直接读取的原始文本往往长这样：

```
===== 第 15 页原始 PDF 文本 =====
Acme Corp · 员工手册 v3.2 · 机密文档                       ← 页眉（噪声）
                                                             
15.2  请假审批流程                                           ← 标题
───────────────────────────────                              
员工请假须提前 3 个工作日提交申请，  
具体流程如下：                                                  
                                                             
1. 登录 HR 系统提交请假申请                                    
2. 直属经理审批（≤3 天）                                     
3. HR 部门备案（>3 天）                                      
                                                             
[上一页]                  [下一页]                           ← 导航（噪声）
                                                             
Acme Corp · 员工手册 v3.2 · 机密文档                       ← 页脚重复（噪声）
```

**解析与清洗的任务就是把这份"脏"文本变成干净的文本**：

```
===== 清洗后的文本 =====
15.2  请假审批流程
───────────────────────────────
员工请假须提前 3 个工作日提交申请，具体流程如下：

1. 登录 HR 系统提交请假申请
2. 直属经理审批（≤3 天）
3. HR 部门备案（>3 天）
```

#### 二、为什么它很重要？

清洗不干净，噪声会严重影响检索质量：

```
场景：用户问"请假流程是什么？"

❌ 未清洗:
检索系统搜到包含"Acme Corp · 员工手册 v3.2 · 机密文档"等噪声的 chunk
→ 向量表示被噪声干扰
→ 与真实内容的相关度降低
→ 检索质量下降

✅ 已清洗:
干净的 chunk 只包含有效内容
→ 向量表示精准
→ 检索准确度高
```

**噪声的五大来源**：

| 噪声类型 | 示例 | 占比（典型） |
|---------|------|------|
| 页眉/页脚 | "Acme Corp · 手册 v3.2" | 15-20% |
| 页码 | "Page 15 / 56" | 5-10% |
| 重复内容 | 页眉 = 页脚，每页重复 | 10-15% |
| 空行/空行 | 连续 5+ 个空行 | 5-8% |
| 导航元素 | "[上一页] [下一页]" | 3-5% |
| 乱码/特殊字符 | PDF 编码错误产生的乱码 | 2-5% |

#### 三、技术原理

```
原始文本
    │
    ▼
┌──────────────────────────────────────┐
│  第 1 步：噪声检测                      │
│  · 页眉页脚模式匹配                     │
│  · 重复行检测                           │
│  · 空行密度分析                          │
│  · 特殊字符过滤                          │
└───────────────┬─────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  第 2 步：噪声移除                      │
│  · 删除页眉页脚匹配行                    │
│  · 合并连续空行为最多 2 个                │
│  · 移除不可见控制字符                    │
│  · 去除导航元素                          │
└───────────────┬─────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  第 3 步：结构恢复                      │
│  · 保留标题层级 (##, ###)               │
│  · 保留列表结构 (-, 1.)                 │
│  · 保留表格结构                          │
│  · 保留代码块                            │
└───────────────┬─────────────────────┘
                │
                ▼
           干净文本 + 元数据
```

#### 四、代码实现

```python
# ================================================================
# 方案 A：LangChain 内置清洗
# ================================================================
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_transformers import Html2TextTransformer

# ---- HTML 转纯文本 ----
html_transformer = Html2TextTransformer()
# 自动将 HTML 转为干净的 Markdown/纯文本
cleaned_docs = html_transformer.transform_documents(html_docs)

# ---- 合并过小/过碎的文档块 ----
from langchain_core.documents import Document

def merge_small_chunks(docs: list[Document], min_length: int = 200) -> list[Document]:
    """将相邻的小文档块合并成更大的块"""
    merged = []
    current_content = ""
    current_meta = None

    for doc in docs:
        if current_content and len(current_content) < min_length:
            # 如果当前块太小，和下一个合并
            current_content += "\n\n" + doc.page_content
            current_meta = doc.metadata
        else:
            if current_content:
                merged.append(Document(page_content=current_content, metadata=current_meta))
            current_content = doc.page_content
            current_meta = doc.metadata

    if current_content:
        merged.append(Document(page_content=current_content, metadata=current_meta))

    return merged


# ================================================================
# 方案 B：自定义清洗器（推荐生产环境使用）
# ================================================================
import re
from typing import List, Dict, Optional

class DocumentCleaner:
    """
    可复用的文档清洗器
    
    设计原则：
    1. 保留语义结构（标题、列表、表格）
    2. 去除噪声（页眉页脚、空行、重复）
    3. 输出干净的文本 + 元数据
    """

    # 常见页眉/页脚/导航模式（正则表达式）
    NOISE_PATTERNS = [
        r'^\s*[A-Z][a-zA-Z\s]+\s*v\d+\.?\d*\s*·\s*[机密保密文档]?\s*$',  # "Acme Corp · 手册 v2.1 · 机密"
        r'^\s*page\s*\d+\s*(?:of|\/)\s*\d+\s*$',                           # "page 15 / 56"
        r'^\s*第\s*\d+\s*页\s*(?:共|of)\s*\d+\s*页?\s*$',                  # "第 15 页 / 共 56 页"
        r'^\s*\[上一页\]\s*\[下一页\]\s*$',                                 # "[上一页] [下一页]"
        r'^\s*Confidential\s*$',                                             # "Confidential"
        r'^\s*机密\s*$',                                                     # "机密"
        r'^\s*Copyright\s*\d+\s*.*$',                                       # "Copyright 2024 ..."
        r'^\s*\d+\s*$',                                                     # "15"（单数字页码行）
        r'^\s*─────────*\s*$',                                               # "─────"（分隔线）
    ]

    def __init__(self):
        self.compiled_patterns = [
            re.compile(p, re.IGNORECASE | re.MULTILINE) for p in self.NOISE_PATTERNS
        ]

    def clean(self, text: str) -> str:
        """清洗一段文本"""
        lines = text.split('\n')
        cleaned_lines = []

        for line in lines:
            stripped = line.strip()

            # 1. 跳过页眉页脚匹配的行
            if any(p.match(stripped) for p in self.compiled_patterns):
                continue

            # 2. 跳过不可见字符行
            if not stripped:
                # 保留最多 2 个连续空行（避免段落间完全消失）
                if cleaned_lines and cleaned_lines[-1] != '':
                    cleaned_lines.append('')
                continue

            # 3. 移除控制字符（保留 \n, \t, 中文标点）
            cleaned_line = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', stripped)
            if cleaned_line.strip():
                cleaned_lines.append(cleaned_line)

        # 合并结果
        result = '\n\n'.join(cleaned_lines).strip()

        # 4. 最终清理：合并多余空行
        result = re.sub(r'\n{4,}', '\n\n\n', result)

        return result

    def extract_metadata(self, text: str) -> Dict[str, Optional[str]]:
        """从文本中提取元数据"""
        metadata = {}

        # 尝试提取章节标题
        title_match = re.search(r'^(#+\s+.+)$', text.split('\n')[0], re.MULTILINE)
        if title_match:
            metadata['chapter'] = title_match.group(1).strip()

        # 尝试提取版本号
        version_match = re.search(r'v(\d+\.\d+)', text)
        if version_match:
            metadata['version'] = version_match.group(1)

        return metadata


# 使用示例
cleaner = DocumentCleaner()

# 清洗前
raw_text = """
Acme Corp · 员工手册 v3.2 · 机密文档
                                             
15.2  请假审批流程
───────────────────────────────
员工请假须提前 3 个工作日提交申请。
                                             
[上一页]                  [下一页]
Acme Corp · 员工手册 v3.2 · 机密文档
"""

cleaned_text = cleaner.clean(raw_text)
metadata = cleaner.extract_metadata(cleaned_text)

print("清洗前:", len(raw_text), "字符")
print("清洗后:", len(cleaned_text), "字符")
print("去除率:  ", round((1 - len(cleaned_text) / len(raw_text)) * 100, 1), "%")
print()
print("清洗结果:")
print(cleaned_text)
print()
print("提取元数据:", metadata)
```

```python
# ================================================================
# 方案 C：LlamaParse 企业级文档解析（最强大）
# ================================================================
# LlamaParse 是 LlamaIndex 的企业级文档解析服务，支持 90+ 格式
# 自动处理表格、图片、公式、复杂布局
from llama_parse import LlamaParse

# 安装: pip install llama-parse
# API Key 设置: export LLAMA_CLOUD_API_KEY="..."

parser = LlamaParse(
    result_type="markdown",          # 输出 Markdown 格式
    verbose=True,                    # 详细日志
    ignore_errors=False,             # 遇到错误是否跳过
    parsing_instruction="提取所有表格和公式",  # 自定义解析指令
)

# 加载复杂 PDF（自动处理表格、图表、多栏排版）
docs = parser.load_data("docs/complex_financial_report.pdf")

# 每个文档的 page_content 包含结构化的 Markdown
# 表格自动转换为 Markdown 表格格式
# 图片自动提取并描述
# 公式自动提取
```

#### 五、清洗效果对比

```
清洗前（1200 字符，57% 是噪声）：
  Acme Corp · 员工手册 v3.2 · 机密文档           ← 页眉
                                                  
  15.2  请假审批流程                              ← 标题
  ─────────────────────────────────                ← 分隔线
  员工请假须提前 3 个工作日提交申请，具体流程如下：    ← 正文
                                                  
  1. 登录 HR 系统提交请假申请                      ← 正文
  2. 直属经理审批（≤3 天）                        ← 正文
  3. HR 部门备案（>3 天）                         ← 正文
                                                  
  [上一页]                  [下一页]               ← 导航
  Acme Corp · 员工手册 v3.2 · 机密文档           ← 页脚

清洗后（320 字符，去除率 73%）：
  15.2  请假审批流程
  ─────────────────────────────────
  员工请假须提前 3 个工作日提交申请，具体流程如下：

  1. 登录 HR 系统提交请假申请
  2. 直属经理审批（≤3 天）
  3. HR 部门备案（>3 天）
```

---

### 节点三：文本分块 (Chunking)

#### 一、这个节点是干什么的？

想象一下：你有一本 500 页的公司手册，用户问了一个关于"请假流程"的问题。

如果 LLM 一次能读 500 页，那当然最好。但 LLM 的上下文窗口是有限的（4K-200K tokens），而且把整本手册都喂给 LLM 成本极高。

**分块的任务就是把长文档拆成一段一段小文本（chunk），每段只包含一个完整的语义单元。**

```
一本 500 页的手册
    │
    ▼
┌──────────────────────────────────────────┐
│  chunk 1 (512 tokens): "请假审批流程"       │
│  chunk 2 (480 tokens): "报销管理规定"        │
│  chunk 3 (520 tokens): "绩效考核标准"        │
│  chunk 4 (495 tokens): "加班申请流程"        │
│  ...                                      │
└──────────────────────────────────────────┘
    │
用户问"请假流程"
    │
    ▼
只检索 chunk 1（精准！）
```

#### 二、分块的核心矛盾

分块没有"完美"方案，只有**权衡**：

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│       大块策略                │    │       小块策略                │
│                              │    │                              │
│  ✅ 优点                     │    │  ✅ 优点                     │
│  · 保留完整上下文             │    │  · 检索更精准                 │
│  · 减少 chunk 数量           │    │  · 减少噪声                    │
│  · 适合长段落内容             │    │  · 向量计算更快               │
│                              │    │                              │
│  ❌ 缺点                     │    │  ❌ 缺点                     │
│  · 可能包含不相关内容         │    │  · 边界处丢失上下文            │
│  · 检索时可能引入噪声          │    │  · 需要更多 chunk              │
│                              │    │                              │
│  典型大小: 1000-2000 tokens   │    │  典型大小: 100-512 tokens     │
└──────────────────────────────┘    └──────────────────────────────┘

              ★ 推荐折中方案: 512 tokens + 64 tokens 重叠 ★
```

**重叠（Overlap）的作用**：
- 防止一个完整的段落被切割到两个 chunk 中
- 保证语义连续性
- 代价：索引体积增大 ~10-15%

#### 三、分块策略对比

```
策略类型         │ 分割边界       │ 语义完整性 │ 实现难度 │ 推荐度
─────────────────┼───────────────┼───────────┼─────────┼───────
固定大小          │ 固定字符数      │  ★★☆☆     │  ⭐      │  入门
递归字符          │ 段落→句子→字符  │  ★★★☆     │  ⭐⭐    │  推荐
基于 token        │ token 精确计数  │  ★★★☆     │  ⭐⭐    │  生产推荐
语义分块          │ embedding 相似度 │  ★★★★     │  ⭐⭐⭐  │  最佳效果
Markdown 感知     │ # 标题层级      │  ★★★★     │  ⭐⭐    │  Markdown 文档
代码感知          │ def/class 边界  │  ★★★★     │  ⭐⭐⭐  │  代码文档
```

#### 四、代码实现

```python
# ================================================================
# 方案 A：递归字符分块（LangChain 默认推荐）
# ================================================================
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 最常用配置：按字符分割，递归查找分割点
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,            # 每个 chunk 最多 500 个字符
    chunk_overlap=50,          # 相邻 chunk 重叠 50 个字符
    length_function=len,       # 用 len() 计算长度（字符数）
    is_separator_regex=False,  # separators 是否为正则表达式
)

# 使用
chunks = splitter.split_text(long_document_text)
print(f"原文: {len(long_document_text)} 字符")
print(f"分块: {len(chunks)} 个 chunk，每个最多 {splitter.chunk_size} 字符")

# 查看分块结果
for i, chunk in enumerate(chunks[:5]):
    print(f"\n--- Chunk {i+1} ({len(chunk)} chars) ---")
    print(chunk[:150] + "...")
```

```python
# ================================================================
# 方案 B：基于 Token 的分块（生产环境推荐）
# ================================================================
import tiktoken

def tiktoken_length(text: str) -> int:
    """使用 tiktoken 精确计算 token 数量"""
    # cl100k_base 是 GPT-4/GPT-3.5 的 tokenizer
    encoder = tiktoken.get_encoding("cl100k_base")
    return len(encoder.encode(text))

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,                 # 512 tokens ≈ 2000 字符
    chunk_overlap=64,               # 64 tokens 重叠（~256 字符）
    length_function=tiktoken_length,  # 用 token 计数！
    separators=[
        "\n\n\n",           # 首先按 3 个换行（章节间）分割
        "\n\n",             # 然后按 2 个换行（段落间）分割
        "\n",               # 然后按 1 个换行（行间）分割
        "。", "！", "？", "；", "…",  # 中文标点
        " ",                # 按空格分割
        "",                 # 最后按字符分割
    ],
    chunk_size_limit=1024,      # 最大 token 数（含安全余量）
    min_chunk_size=64,           # 最小 token 数（避免过碎）
)

# 使用
chunks = splitter.split_text(chinese_document_text)
print(f"分块后: {len(chunks)} 个 chunk")
token_sizes = [tiktoken_length(c) for c in chunks]
print(f"Token 分布: min={min(token_sizes)}, max={max(token_sizes)}, avg={sum(token_sizes)/len(token_sizes):.1f}")
```

```python
# ================================================================
# 方案 C：语义分块（按主题自动分割，最佳效果但成本最高）
# ================================================================
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# 需要先安装: pip install langchain-experimental
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

semantic_splitter = SemanticChunker(
    embeddings=embeddings,
    number_of_chunks=100,                    # 预估 chunk 数量
    sentence_split_char="\n\n",               # 候选分割符
    min_chunk_size=100,                       # 最小 chunk 长度
    breakpoint_threshold_type="percentile",   # 分割阈值类型
    breakpoint_threshold_amount=95,           # 阈值百分位
    # 其他可选: "mean", "std", "interquartile", "constant"
)

# 使用
semantic_chunks = semantic_splitter.split_text(long_document_text)
# 语义分块会在主题/话题切换处自动分割
print(f"语义分块结果: {len(semantic_chunks)} 个 chunk")

# 语义分块的好处：
# 1. 每个 chunk 内部语义连贯
# 2. chunk 之间有明显的主题差异
# 3. chunk 大小自适应（同主题的大段自动合并）
```

```python
# ================================================================
# 方案 D：Markdown 感知分块（保留标题层级）
# ================================================================
from langchain_text_splitters import MarkdownHeaderTextSplitter

# 定义要保留的标题层级
headers_to_split_on = [
    ("#", "Level1Heading"),     # # 一级标题
    ("##", "Level2Heading"),    # ## 二级标题
    ("###", "Level3Heading"),   # ### 三级标题
]

markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on,
)

# 拆分 Markdown 文档
chunks = markdown_splitter.split_text(markdown_text)

# 每个 chunk 自动携带标题层级元数据
for chunk in chunks[:3]:
    print(f"标题: {chunk.metadata}")  # {'Level1Heading': '...', 'Level2Heading': '...'}
    print(f"内容: {chunk.page_content[:100]}...")
    print()
```

```python
# ================================================================
# 方案 E：LlamaIndex 多种节点解析器
# ================================================================
from llama_index.core.node_parser import (
    SentenceSplitter,    # 基于标点分割
    MarkdownNodeParser,  # 保留 Markdown 结构
    TokenTextSplitter,   # 精确 token 级别
)

# ---- SentenceSplitter：基于句子边界分割 ----
sentence_parser = SentenceSplitter(
    chunk_size=256,
    chunk_overlap=32,
    paragraph_separator="\n\n",   # 段落分隔符
)
nodes = sentence_parser.parse_nodes(all_nodes)

# ---- MarkdownNodeParser：保留标题层级 ----
md_parser = MarkdownNodeParser(
    include_metadata=True,
    include_prev_next_rel=True,  # 保留与前一个/后一个节点的关系
)
nodes = md_parser.parse_nodes(all_nodes)

# ---- TokenTextSplitter：精确 token 级别 ----
token_parser = TokenTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
)
nodes = token_parser.parse_nodes(all_nodes)
```

```python
# ================================================================
# 方案 F：自适应分块器（根据内容类型自动选择策略）
# ================================================================
import re
from typing import List

class AdaptiveChunker:
    """
    自适应分块器：根据内容类型自动选择最优分块策略
    
    代码文档 → 按函数/类边界分割
    散文文档 → 按段落/句子分割
    表格数据 → 按行分割
    通用文档 → 递归字符分割（默认）
    """

    def __init__(self, max_tokens: int = 512, overlap_tokens: int = 64):
        self.max_tokens = max_tokens
        self.overlap_tokens = overlap_tokens
        self.encoder = tiktoken.get_encoding("cl100k_base")

    def chunk(self, text: str, content_type: str = "auto") -> List[str]:
        """根据内容类型自动选择分块策略"""
        if content_type == "auto":
            content_type = self._detect_content_type(text)

        strategies = {
            "code": self._chunk_code,
            "prose": self._chunk_prose,
            "table": self._chunk_table,
            "mixed": self._chunk_mixed,
        }

        strategy = strategies.get(content_type, self._chunk_prose)
        return strategy(text)

    def _detect_content_type(self, text: str) -> str:
        """自动检测内容类型"""
        lines = text.split('\n')
        if not lines:
            return "prose"

        # 检测是否为代码
        code_indicators = sum(1 for line in lines if re.match(r'^\s*(def |class |function |const |let |var |if |for |while |import |export |return |=>)', line))
        code_ratio = code_indicators / len(lines)
        if code_ratio > 0.3:
            return "code"

        # 检测是否为表格
        tab_count = sum(1 for line in lines if '\t' in line)
        if tab_count / len(lines) > 0.3:
            return "table"

        return "prose"

    def _chunk_prose(self, text: str) -> List[str]:
        """散文/通用文档分块：按段落+句子分割"""
        paragraphs = re.split(r'\n{2,}', text)
        chunks = []
        current = ""

        for para in paragraphs:
            if tiktoken_len(current + "\n\n" + para) > self.max_tokens:
                if current:
                    chunks.append(current)
                    current = ""
                # 如果单段超过 chunk_size，按句子分割
                sentences = re.split(r'[。！？\n]', para)
                for sentence in sentences:
                    if tiktoken_len(current + sentence) > self.max_tokens:
                        if current:
                            chunks.append(current)
                            current = ""
                        # 极端情况：按字符分割
                        chars = list(sentence)
                        for i in range(0, len(chars), self.max_tokens // 4):
                            chunks.append(''.join(chars[i:i + self.max_tokens // 4]))
                    else:
                        current = (current + sentence + "。").strip() if current else sentence
            else:
                current = (current + "\n\n" + para).strip() if current else para

        if current:
            chunks.append(current)
        return chunks

    def _chunk_code(self, text: str) -> List[str]:
        """代码分块：按函数/类定义边界"""
        # 按函数/类定义分割
        blocks = re.split(r'\n(?=def |class |function |const |var )', text)
        chunks = []
        current = ""

        for block in blocks:
            if tiktoken_len(current + "\n\n" + block) > self.max_tokens:
                if current:
                    chunks.append(current)
                    current = ""
                # 极端情况：按行分割
                lines = block.split('\n')
                for line in lines:
                    if tiktoken_len(current + line) > self.max_tokens:
                        chunks.append(current)
                        current = line
                    else:
                        current = (current + "\n" + line).strip() if current else line
            else:
                current = (current + "\n\n" + block).strip() if current else block

        if current:
            chunks.append(current)
        return chunks

    def _chunk_table(self, text: str) -> List[str]:
        """表格分块：每行一个 chunk"""
        return [line for line in text.split('\n') if line.strip()]

    def _chunk_mixed(self, text: str) -> List[str]:
        """混合内容：分段检测类型，分别处理"""
        chunks = []
        paragraphs = re.split(r'\n{2,}', text)
        current_type = "prose"
        current_text = ""

        for para in paragraphs:
            para_type = self._detect_content_type(para)
            if para_type != current_type:
                # 类型变化，先处理当前块
                if current_text:
                    strategy = {"code": self._chunk_code, "prose": self._chunk_prose, "table": self._chunk_table}.get(current_type, self._chunk_prose)
                    chunks.extend(strategy(current_text))
                current_type = para_type
                current_text = para
            else:
                current_text += "\n\n" + para if current_text else para

        if current_text:
            strategy = {"code": self._chunk_code, "prose": self._chunk_prose, "table": self._chunk_table}.get(current_type, self._chunk_prose)
            chunks.extend(strategy(current_text))
        return chunks


def tiktoken_len(text: str) -> int:
    encoder = tiktoken.get_encoding("cl100k_base")
    return len(encoder.encode(text))


# 使用
chunker = AdaptiveChunker(max_tokens=512, overlap_tokens=64)

# 代码文档
code_chunks = chunker.chunk(code_text, content_type="auto")  # 自动检测为 code
# 散文文档
prose_chunks = chunker.chunk(prose_text, content_type="auto")  # 自动检测为 prose
# 混合文档
mixed_chunks = chunker.chunk(mixed_text, content_type="auto")  # 自动检测并分段
```

#### 五、分块参数调优指南

```
分块参数调优决策树
│
├─ 文档语言？
│   ├─ 中文 → chunk_size ≈ 512 tokens (≈ 2000 字符)
│   │          overlap ≈ 64 tokens (≈ 256 字符)
│   └─ 英文 → chunk_size ≈ 512 tokens (≈ 2000 字符)
│              overlap ≈ 64 tokens (≈ 256 字符)
│
├─ 文档类型？
│   ├─ 代码文档 → 按函数/类边界
│   ├─ Markdown → 按标题层级
│   ├─ 表格 → 按行
│   └─ 通用 → 递归字符（推荐默认）
│
├─ 向量数据库？
│   ├─ Chroma/FAISS → chunk_size 可稍大（768 tokens）
│   ├─ Qdrant → 中等（512 tokens）
│   └─ Milvus → 可稍小（256 tokens，并行索引效果好）
│
├─ LLM 上下文窗口？
│   ├─ 4K 窗口 → chunk_size < 512
│   ├─ 8K 窗口 → chunk_size 512-1024
│   └─ 32K+ → chunk_size 1024-2048
│
└─ 默认推荐（不确定时）
    └─ chunk_size=512 tokens, overlap=64 tokens, 递归字符
```

---

### 节点四：向量化 (Embedding)

#### 一、这个节点是干什么的？

向量化是把**文本**变成**向量**（一串数字）的过程。核心思想是：**语义相似的文本，在向量空间中的距离应该更近**。

```
文本: "人工智能的未来发展趋势"
    │
    ▼ [embedding model]
向量: [-0.023, 0.456, -0.891, 0.123, -0.045, ...]
    │
    │ 1536 个浮点数（text-embedding-3-small 的维度）
    │
    ▼
存储在向量数据库中
```

#### 二、为什么向量化很重要？

向量化的质量直接决定了检索的精准度：

```
查询: "AI 的发展趋势"
检索到的相关文档:
  ✅ "人工智能的未来发展将深刻改变各行各业"    → 向量距离近
  ✅ "AI 技术正推动全球产业升级"                → 向量距离近
  ❌ "今天天气真好，适合出去散步"               → 向量距离远
```

**注意**：向量化 ≠ 编码（如 UTF-8）。这里的 embedding 是通过深度学习模型（通常是 transformer）将语义信息压缩到高维向量中。

#### 三、技术原理

```
embedding 模型的训练过程（简化版）：

1. 准备大量文本对（句子 A, 句子 B）
2. 让模型学习：语义相似 → 向量距离近；语义不相关 → 向量距离远
3. 损失函数：对比损失（Contrastive Loss）

训练好的模型输入文本 → 输出固定维度的向量

示例（以 text-embedding-3-small 为例）：
输入: "北京是中国的首都"
输出: [-0.023, 0.456, -0.891, 0.123, ...]  (1536 维)

输入: "北京的首都是中国"
输出: [-0.021, 0.452, -0.887, 0.125, ...]  (1536 维)
cosine_similarity ≈ 0.92  ← 高相似度！

输入: "今天天气不错"
输出: [0.234, -0.567, 0.123, -0.789, ...]  (1536 维)
cosine_similarity ≈ 0.15  ← 低相似度！
```

#### 四、代码实现

```python
# ================================================================
# 方案 A：OpenAI Embeddings（推荐：精度最高、最流行）
# ================================================================
from langchain_openai import OpenAIEmbeddings

# 创建嵌入模型
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 最新模型：1536 维，性价比最优
    # model="text-embedding-3-large",  # 更高精度：3072 维，更慢更贵
)

# 嵌入单个文本（查询时）
query_vector = embeddings.embed_query("AI 的发展趋势是什么？")
print(f"查询向量维度: {len(query_vector)}")
# 输出: 查询向量维度: 1536

# 嵌入批量文本（索引时，推荐！比逐个调用快 5-10x）
documents = [
    "人工智能的未来发展将深刻改变各行各业。",
    "AI 的发展趋势包括大模型和自动化。",
    "今天天气不错，适合出去散步。",
]
vectors = embeddings.embed_documents(documents)

from sklearn.metrics.pairwise import cosine_similarity
# 计算文档间相似度
sim_matrix = cosine_similarity(vectors)
print("文档相似度矩阵:")
print(sim_matrix.round(4))
# [[1.0, 0.95, 0.12],
#  [0.95, 1.0, 0.10],
#  [0.12, 0.10, 1.0]]
```

```python
# ================================================================
# 方案 B：本地嵌入模型（无需 API Key，隐私数据推荐）
# ================================================================
from langchain_huggingface import HuggingFaceEmbeddings

# HuggingFace 开源模型（CPU/GPU 均可运行）
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",  # 中文最强
    # model_name="BAAI/bge-base-zh-v1.5",  # 平衡精度与速度
    # model_name="sentence-transformers/all-MiniLM-L6-v2",  # 轻量，英文
    model_kwargs={"device": "cpu"},  # "cuda" 加速
    encode_kwargs={"normalize_embeddings": True},  # L2 归一化
)

# 嵌入
query_vector = embeddings.embed_query("AI 的未来是什么？")
doc_vectors = embeddings.embed_documents(documents)

# 注意：bge-large-zh-v1.5 维度为 1024
print(f"向量维度: {len(query_vector)}")  # 1024
```

```python
# ================================================================
# 方案 C：sentence-transformers 库（更细粒度控制）
# ================================================================
# 安装: pip install sentence-transformers
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# 选择模型
model = SentenceTransformer("BAAI/bge-large-zh-v1.5")

# 批量编码（高效）
texts = [
    "人工智能的未来发展将深刻改变各行各业。",
    "AI 的发展趋势包括大模型和自动化。",
    "今天天气不错，适合出去散步。",
]
vectors = model.encode(texts, normalize_embeddings=True)

# 查询编码
query = "AI 的未来是什么？"
query_vector = model.encode(query, normalize_embeddings=True)

# 手动计算相似度
similarities = cosine_similarity([query_vector], vectors)[0]
print(f"查询与各文档的相似度: {similarities.round(4)}")
# [0.95, 0.92, 0.15]

# 排序取 TopK
top_k_idx = np.argsort(similarities)[::-1][:3]
print(f"Top3 相关文档索引: {top_k_idx}")  # [0, 1, 2]
```

```python
# ================================================================
# 方案 D：生产级批量嵌入管线（含重试、去重、批处理优化）
# ================================================================
import time
from typing import List
from concurrent.futures import ThreadPoolExecutor

class EmbeddingPipeline:
    """生产级批量嵌入管线"""

    def __init__(self, embeddings, batch_size: int = 32, max_retries: int = 3):
        self.embeddings = embeddings
        self.batch_size = batch_size
        self.max_retries = max_retries

    def embed_all(self, texts: List[str], deduplicate: bool = True) -> List[List[float]]:
        """
        批量嵌入，支持去重和重试
        
        Args:
            texts: 文本列表
            deduplicate: 是否去重（相同文本只嵌入一次）
        
        Returns:
            向量列表（与 texts 一一对应）
        """
        if deduplicate:
            # 去重：相同文本只嵌入一次
            unique_texts = list(dict.fromkeys(texts))  # 保持顺序去重
        else:
            unique_texts = texts

        # 分批嵌入（API 通常对 batch size 有上限）
        all_vectors = []
        for i in range(0, len(unique_texts), self.batch_size):
            batch = unique_texts[i:i + self.batch_size]
            vector_batch = self._embed_with_retry(batch)
            all_vectors.extend(vector_batch)

        if deduplicate:
            # 重建去重后的向量列表
            seen = {}
            result = []
            for text, vector in zip(unique_texts, all_vectors):
                if text not in seen:
                    seen[text] = vector
                result.append(seen[text])
            return result
        else:
            return all_vectors

    def _embed_with_retry(self, batch: List[str]) -> List[List[float]]:
        """带重试的嵌入调用（指数退避）"""
        for attempt in range(self.max_retries):
            try:
                return self.embeddings.embed_documents(batch)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    raise
                wait_time = 2 ** attempt  # 1s, 2s, 4s...
                time.sleep(wait_time)
                print(f"嵌入失败，{wait_time}s 后重试 ({attempt + 1}/{self.max_retries})")
        return []
```

#### 五、Embedding 模型选型指南

```
模型选型决策树
│
├─ 中文内容为主？
│   ├─ 最高精度 → BAAI/bge-large-zh-v1.5 (1024 维)
│   ├─ 平衡精度/速度 → BAAI/bge-base-zh-v1.5 (768 维)
│   └─ 最快/最小 → BAAI/bge-small-zh-v1.5 (512 维)
│
├─ 多语言内容？
│   ├─ Cohere embed-multilingual-v3.0 (100+ 语言)
│   └─ BAAI/bge-m3 (100+ 语言，本地运行)
│
├─ 英文内容为主？
│   ├─ OpenAI text-embedding-3-large (3072 维)
│   ├─ OpenAI text-embedding-3-small (1536 维) ← 性价比最优
│   └─ all-MiniLM-L6-v2 (本地，轻量，384 维)
│
└─ 生产环境推荐
    ├─ 预算充足 + 追求精度 → OpenAI text-embedding-3-small
    ├─ 隐私敏感 + 需要离线 → BAAI/bge-large-zh-v1.5
    └─ 多语言 + 本地运行 → BAAI/bge-m3
```

---

### 节点五：向量存储 (Vector Store)

#### 一、这个节点是干什么的？

向量存储 = 向量数据库 + 元数据管理 + 近似最近邻搜索。

它有三个核心职责：
1. **存储**：保存向量 + 原始文本 + 元数据
2. **索引**：建立高效的搜索索引（HNSW 等）
3. **检索**：接受查询向量，返回最相似的 K 个文档

#### 二、为什么选择正确的向量数据库很重要？

不同的向量数据库在**性能、功能、成本、扩展性**上差异巨大：

```
场景                → 推荐方案
────────────────────────────────────────────────
开发/原型 (< 10 万向量)  → Chroma (零配置)
中小生产 (10 万-1000 万)  → Qdrant 或 Weaviate
大规模生产 (1000 万-10 亿) → Milvus
已有 PostgreSQL         → pgvector (零额外部署)
需要托管服务           → Pinecone
需要最强混合搜索        → Weaviate
```

#### 三、索引类型详解（关键！）

向量数据库的核心是**索引结构**，它决定了搜索的速度和精度。两种最基本的索引类型：

```
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│         Flat 暴力搜索            │    │         HNSW 图索引              │
│  (Brute Force)                  │    │  (Hierarchical Navigable Small World)│
│                                 │    │                                  │
│  原理:                          │    │  原理:                            │
│  将查询向量与数据库中的所有       │    │  构建一个多层级的图结构：          │
│  向量逐一计算距离                │    │  · 顶层：节点少，搜索范围小       │
│  · 搜索时间: O(N)                │    │  · 中层：节点中等                │
│  · 精度: 100%（无损失）           │    │  · 底层：节点最多，精度最高       │
│  · 适合: < 10 万向量             │    │  · 搜索: 从顶层快速定位，逐层下降  │
│  · 不适合: 大规模数据              │    │  · 搜索时间: O(log N)           │
│                                 │    │  · 精度: 近似 (召回率 ~99%)      │
│  代码示例:                       │    │                                  │
│  index = faiss.IndexFlatIP(dim)  │    │  HNSW 参数调优：                 │
│  index.add(vectors)              │    │  · M=16:  每个节点的连接数       │
│                                  │    │  · efConstruction=128: 构建时搜索  │
│  优点:                           │    │  · efSearch=64: 查询时搜索精度      │
│  · 简单、无调参、100% 精度        │    │                                  │
│  · 适合小规模                     │    │  M↑  → 精度↑  延迟↑              │
│  · 存储: 所有向量都在内存中        │    │  ef↑  → 精度↑  延迟↑             │
└─────────────────────────────────┘    └─────────────────────────────────┘
```

**选择建议**：

| 数据规模 | 推荐索引 | 原因 |
|------|------|--|
| < 10 万向量 | **Flat**（暴力搜索） | 规模小，Flat 足够快，且精度 100% |
| 10 万 - 100 万 | **HNSW (M=16, efConstruction=128)** | 平衡精度和速度 |
| 100 万 - 10 亿 | **HNSW (M=32, efConstruction=256) + IVF** | 大规模需要分桶 |
| > 10 亿 | **HNSW + GPU (FAISS/cuVS)** | 需要硬件加速 |

#### 四、向量数据库的持久化（持久化！）

**如果不持久化，程序一重启，所有索引和数据都会丢失！** 这是一个非常常见的坑。

```python
# ================================================================
# Chroma：自动持久化（最简单）
# ================================================================
from langchain_chroma import Chroma

# 指定 persist_directory 即可自动持久化
vectorstore = Chroma(
    collection_name="my_knowledge_base",
    embedding_function=embeddings,
    persist_directory="./chroma_db",  # ← 关键：指定持久化目录
)

# 写入后，数据自动保存到 ./chroma_db/ 目录
# 即使程序关闭，下次启动时:
vectorstore_again = Chroma(
    collection_name="my_knowledge_base",
    embedding_function=embeddings,
    persist_directory="./chroma_db",  # ← 从同一目录加载
)
# 数据完全保留，无需重新向量化！

# 手动保存（Chroma 在持久化模式下通常自动保存）
vectorstore.persist()

# 检查持久化状态
print(f"已存储 {vectorstore._collection.count()} 个向量")  # 启动后依然正确
```

```python
# ================================================================
# FAISS：需要手动持久化（索引 + 文档存储）
# ================================================================
import faiss
import pickle
from langchain_community.vectorstores import FAISS

# === 保存（每次写入后调用） ===
faiss_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore={},  # 文档存储
    index_to_docstore_id={},
)

# 方式一：FAISS 自带方法（推荐）
faiss_store.save_local("./faiss_index")  # 保存整个 store（索引 + 文档）

# 方式二：分别保存
faiss.save_index("./faiss_index.index")  # 保存索引
with open("./faiss_index.pkl", "wb") as f:
    pickle.dump((docstore, index_to_docstore_id), f)  # 保存文档映射

# === 加载 ===
# 方式一：FAISS 自带方法（推荐）
faiss_store_loaded = FAISS.load_local(
    "./faiss_index",
    embeddings,
    allow_dangerous_deserialization=True,
)

# 方式二：分别加载
index = faiss.read_index("./faiss_index.index")
with open("./faiss_index.pkl", "rb") as f:
    docstore, index_to_docstore_id = pickle.load(f)
```

```python
# ================================================================
# Qdrant：自动持久化（需要配置）
# ================================================================
from qdrant_client import QdrantClient

# 本地模式（自动持久化到 ./qdrant_data/）
client = QdrantClient(path="./qdrant_data")

# 内存模式（不持久化，重启丢失）- ❌ 生产不要用
client = QdrantClient(":memory:")

# 持久化方式对比:
# 本地磁盘: QdrantClient(path="./data")
# Docker:   docker run -v $(pwd)/data:/qdrant/storage qdrant/qdrant
# 云端:     QdrantClient(url="https://your-instance.qdrant.tech")
```

```python
# ================================================================
# Milvus：自动持久化（需要配置存储后端）
# ================================================================
from pymilvus import connections, Collection

# 连接本地 Milvus（数据存在 /var/lib/milvus/data/）
connections.connect("default", host="localhost", port="19530")

# 持久化策略:
# 1. etcd: 元数据存在 etcd，向量数据存在本地（默认）
# 2. MySQL: 元数据存在 MySQL
# 3. MinIO: 向量数据存在对象存储（适合超大规模）

# 生产环境推荐 Docker Compose:
# services:
#   etcd:
#     volumes: [./etcd-data:/bitnami/etcd]
#   minio:
#     volumes: [./minio-data:/minio_data]
#   milvus:
#     volumes: [./milvus-data:/var/lib/milvus]
#     depends_on: [etcd, minio]
```

#### 五、持久化检查清单

```
持久化检查清单
│
├─ Chroma
│   ├─ ✅ persist_directory="./chroma_db" → 自动持久化
│   ├─ ✅ 下次启动指定同一目录 → 数据恢复
│   ├─ ⚠️ 生产环境建议定期备份 ./chroma_db/
│   └─ ⚠️ 磁盘满？设置 max_collection_size 或定期清理
│
├─ FAISS
│   ├─ ✅ faiss.save_index() → 保存索引
│   ├─ ✅ pickle dump → 保存文档映射
│   ├─ ⚠️ 分别保存，不会丢
│   └─ ⚠️ load 时需要重建 docstore 映射
│
├─ Qdrant
│   ├─ ✅ QdrantClient(path="./data") → 自动持久化
│   ├─ ✅ 不需要手动 save
│   └─ ⚠️ 需要配置 WAL（Write-Ahead Log）防丢失
│
├─ Milvus
│   ├─ ✅ etcd + 本地文件 → 元数据+数据分离
│   ├─ ✅ 生产推荐 MinIO 对象存储
│   └─ ⚠️ 需要 Docker Compose 部署 3+ 组件
│
└─ 通用建议
    ├─ ✅ 所有持久化目录加入 gitignore
    ├─ ✅ 定期备份（每天/每周）
    ├─ ✅ 监控磁盘空间
    └─ ✅ 生产环境用云服务（Chroma Cloud / Milvus Cloud）
```

#### 六、代码实现

向量存储 = 向量数据库 + 元数据管理 + 近似最近邻搜索。

它有三个核心职责：
1. **存储**：保存向量 + 原始文本 + 元数据
2. **索引**：建立高效的搜索索引（HNSW 等）
3. **检索**：接受查询向量，返回最相似的 K 个文档

```
┌───────────────────────────────────────────────────────┐
│                  向量数据库                              │
│                                                        │
│  ┌────┬──────────────┬───────────────┬──────────────┐ │
│  │ ID │ 向量 (1536维) │  元数据        │  原始文本      │ │
│  ├────┼──────────────┼───────────────┼──────────────┤ │
│  │ 1  │ [-0.023,...] │ source: docs/ │ API 网关配置  │ │
│  │    │              │ gateway.md    │ 超时设置      │ │
│  │    │              │ page: 5       │              │ │
│  ├────┼──────────────┼───────────────┼──────────────┤ │
│  │ 2  │ [0.456,...]  │ source: docs/ │ 数据库连接池  │ │
│  │    │              │ database.md   │ 配置指南      │ │
│  │    │              │ page: 12      │              │ │
│  ├────┼──────────────┼───────────────┼──────────────┤ │
│  │ 3  │ [-0.891,...] │ source: docs/ │ 负载均衡策略  │ │
│  │    │              │ loadbalancer  │ 及优化        │ │
│  │    │              │ .md           │              │ │
│  └────┴──────────────┴───────────────┴──────────────┘ │
│                                                        │
│  索引: HNSW (Hierarchical Navigable Small World)       │
│  M=16, efConstruction=128                              │
│                                                        │
│  查询: "如何配置 API 网关？"                            │
│  结果: ID 1 (0.92), ID 5 (0.85), ID 3 (0.78)         │
└───────────────────────────────────────────────────────┘
```

#### 二、为什么选择正确的向量数据库很重要？

不同的向量数据库在**性能、功能、成本、扩展性**上差异巨大：

```
场景                → 推荐方案
────────────────────────────────────────────────
开发/原型 (< 10 万向量)  → Chroma (零配置)
中小生产 (10 万-1000 万)  → Qdrant 或 Weaviate
大规模生产 (1000 万-10 亿) → Milvus
已有 PostgreSQL         → pgvector (零额外部署)
需要托管服务           → Pinecone
需要最强混合搜索        → Weaviate
```

#### 三、代码实现

```python
# ================================================================
# 方案 A：Chroma（零配置，适合开发和原型）
# ================================================================
from langchain_chroma import Chroma
from langchain_core.documents import Document

# ---- 创建新向量库 ----
vectorstore = Chroma(
    collection_name="my_knowledge_base",
    embedding_function=embeddings,
    persist_directory="./chroma_db",  # 持久化到磁盘
)

# ---- 插入文档（自动向量化）----
docs = [
    Document(
        page_content="API 网关的超时配置分为三个层级：连接超时、读超时、写超时。",
        metadata={"source": "docs/gateway.md", "page": 5, "content_type": "technical"},
    ),
    Document(
        page_content="数据库连接池用于管理数据库连接的生命周期，避免频繁创建连接的开销。",
        metadata={"source": "docs/database.md", "page": 12, "content_type": "technical"},
    ),
    Document(
        page_content="今天天气不错，适合出去散步。",
        metadata={"source": "docs/notes.md", "page": 1, "content_type": "general"},
    ),
]
vectorstore.add_documents(docs)
print(f"已存储 {vectorstore._collection.count()} 个向量")

# ---- 相似搜索 ----
results = vectorstore.similarity_search(
    query="如何配置网关超时？",
    k=3,  # 返回 Top3
)
for doc in results:
    print(f"来源: {doc.metadata['source']}, 内容: {doc.page_content[:40]}...")

# ---- 删除文档 ----
vectorstore.delete([id_1, id_2])  # 按 ID 删除

# ---- 更新/替换文档 (upsert) ----
vectorstore.update_document(doc_id, new_doc)
```

```python
# ================================================================
# 方案 B：FAISS（Facebook 开源，速度极快）
# ================================================================
import faiss
import numpy as np
from langchain_community.vectorstores import FAISS

# 从已有 vectors 创建 FAISS 索引
vectors_np = np.array(vectors_list).astype('float32')
dim = vectors_np.shape[1]

# 创建 HNSW 索引
index = faiss.IndexHNSWFlat(dim, 32)  # M=32（每个节点的连接数）
index.hnsw.efConstruction = 128        # 构建时的搜索宽度
index.add(vectors_np)                  # 添加向量

# 使用 LangChain 封装
faiss_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore={},                          # 文档存储
    index_to_docstore_id={},              # ID 映射
)

# 插入文档
faiss_store.add_documents(docs)

# 搜索
faiss_store.index.hnsw.ef = 128  # 搜索精度（越大越精确，越慢）
results = faiss_store.similarity_search_with_score(
    query="网关配置指南",
    k=5,
)
for doc, score in results:
    similarity = 1 - score  # score 是距离（越小越好）
    print(f"相似度: {similarity:.4f} | {doc.page_content[:40]}")
```

```python
# ================================================================
# 方案 C：Qdrant（支持混合检索和丰富过滤）
# ================================================================
from qdrant_client import QdrantClient, models
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
import uuid

# ---- 连接 Qdrant ----
client = QdrantClient(url="http://localhost:6333")

# ---- 创建集合 ----
client.recreate_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(
        size=1536,
        distance=Distance.COSINE,
    ),
)

# ---- 插入文档 ----
points = []
for doc in docs:
    vector = embeddings.embed_query(doc.page_content)
    points.append(
        PointStruct(
            id=uuid.uuid4().hex,
            vector=vector,
            payload={  # 元数据（可用于过滤）
                "content": doc.page_content,
                "source": doc.metadata["source"],
                "page": doc.metadata["page"],
                "content_type": doc.metadata.get("content_type", "text"),
            }
        )
    )

# 批量上传
client.upsert(
    collection_name="knowledge_base",
    points=points[:128],  # 每批最多 128 个
    wait=True,
)

# ---- 带过滤的搜索 ----
search_result = client.search(
    collection_name="knowledge_base",
    query_vector=embeddings.embed_query("API 网关配置"),
    limit=5,
    query_filter=Filter(
        must=[
            FieldCondition(key="content_type", match=MatchValue(value="technical")),
            FieldCondition(key="source", match=MatchValue(value="docs/api/")),
        ]
    ),
)
```

```python
# ================================================================
# 方案 D：pgvector（PostgreSQL 扩展，适合已有 PG 的企业）
# ================================================================
# 安装: pip install psycopg2 pgvector
# PostgreSQL: CREATE EXTENSION vector;

import psycopg2
from pgvector.psycopg import register_vector
import numpy as np

conn = psycopg2.connect("dbname=rag_db user=rag_host")
register_vector(conn)
cur = conn.cursor()

# 创建表
cur.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding VECTOR(1536),
        created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
""")
conn.commit()

# 插入
cur.execute("""
    INSERT INTO documents (content, metadata, embedding)
    VALUES (%s, %s, %s) RETURNING id;
""", (content, metadata, vector))
doc_id = cur.fetchone()[0]

# 搜索（余弦相似度 + 元数据过滤）
cur.execute("""
    SELECT id, content, metadata, 1 - (embedding <=> %s::vector) AS similarity
    FROM documents
    WHERE metadata->>'source' LIKE 'docs/%'
    ORDER BY embedding <=> %s::vector
    LIMIT 5;
""", (query_vector, query_vector))
results = cur.fetchall()
```

```python
# ================================================================
# 方案 E：Milvus（大规模生产，十亿级）
# ================================================================
from pymilvus import connections, Collection, CollectionSchema, FieldSchema, DataType, utility

connections.connect("default", host="localhost", port="19530")

# 创建集合
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="metadata", dtype=DataType.JSON),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
]
schema = CollectionSchema(fields, "Knowledge Base")
collection = Collection("knowledge_base", schema)

# 创建索引
index_params = {"index_type": "HNSW", "metric_type": "COSINE", "params": {"M": 16, "efConstruction": 128}}
collection.create_index("embedding", index_params)
collection.load()

# 插入
collection.insert([{"content": d.page_content, "metadata": d.metadata, "embedding": v} for d, v in zip(docs, vectors)])
collection.flush()

# 搜索
results = collection.search(data=[query_vector], anns_field="embedding", param={"ef": 64}, limit=5, output_fields=["content", "metadata"])
```


#### 七、增量更新机制（增量入库，避免索引膨胀）

##### 一、为什么需要增量更新？

知识库最常见的运维问题：**文档会更新，但 RAG 管线不会自动感知**。

```
❌ 全量重建（Naive 方案）：
  每次文档变更 → 删除整个向量库 → 重新加载所有文档 → 重新向量化 → 重新存储
  → 100 万文档变更 1 个 → 重新向量化 100 万篇（浪费！）
  → 索引膨胀（旧向量不会被删除）

✅ 增量更新（Production 方案）：
  每次文档变更 → 只处理有变化的文档 → 增量入库
  → 100 万文档变更 1 个 → 只重新向量化 1 篇
  → 用 document_id 做幂等去重
```

##### 二、基于文件 Hash 的增量判断逻辑

```
索引构建时的完整流程：

1. 扫描文档目录，获取所有文件路径
   ↓
2. 对每个文件计算内容 Hash（SHA-256）
   ↓
3. 查询向量库中该文件的 metadata['file_hash']
   ↓
4. 对比 Hash 值：
   ├─ 无匹配 → 新文档 → 插入
   ├─ Hash 相同 → 未变更 → 跳过
   └─ Hash 不同 → 已更新 → 先删除旧向量，再插入新向量
   ↓
5. 更新 metadata['last_updated'] = datetime.now()
```

##### 三、代码实现

```python
# =============================================
# 增量入库实现
# =============================================
import hashlib
import os
from pathlib import Path
from datetime import datetime
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from typing import Optional

class IncrementalRAGIndexer:
    """
    支持增量更新的 RAG 索引器
    
    核心逻辑：
    1. 文件 Hash 作为唯一标识
    2. Hash 变更才触发重新向量化
    3. 删除旧向量避免索引膨胀
    """
    
    def __init__(self, persist_dir: str = "./rag_vector_db",
                 collection_name: str = "knowledge_base"):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self.vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=persist_dir,
        )
    
    @staticmethod
    def compute_file_hash(filepath: str) -> str:
        """计算文件的 SHA-256 Hash 值"""
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    def _get_existing_hashes(self) -> dict:
        """获取向量库中已有文档的 file_hash 映射"""
        existing = self.vectorstore.get()
        if existing['metadatas']:
            return {
                meta.get('file_path', ''): meta.get('file_hash', '')
                for meta in existing['metadatas']
            }
        return {}
    
    def process_file(self, filepath: str) -> str:
        """
        处理单个文件，返回操作类型
        
        Returns:
            "inserted" | "updated" | "skipped" | "deleted"
        """
        file_hash = self.compute_file_hash(filepath)
        existing_hashes = self._get_existing_hashes()
        
        # 检查是否是新文档
        existing_hash = existing_hashes.get(filepath)
        
        if not existing_hash:
            # 新文档 → 插入
            print(f"  [NEW] {filepath}")
            return "inserted"
        
        if existing_hash == file_hash:
            # 未变更 → 跳过
            print(f"  [SKIP] {filepath} (no change)")
            return "skipped"
        
        # Hash 不同 → 更新
        print(f"  [UPDATE] {filepath} (hash changed)")
        return "updated"
    
    def index_directory(self, doc_dir: str) -> dict:
        """
        增量索引整个目录
        
        Returns:
            {"inserted": N, "updated": N, "skipped": N, "deleted": N}
        """
        dir_path = Path(doc_dir)
        stats = {"inserted": 0, "updated": 0, "skipped": 0, "deleted": 0}
        existing_hashes = self._get_existing_hashes()
        tracked_files = set()
        
        # 1. 先删除已不在目录中的文档
        for fp in existing_hashes:
            tracked_files.add(fp)
            if not os.path.exists(fp):
                # 文件被删除了，从向量库中移除
                self.vectorstore.delete(ids=[
                    idx for idx, meta in enumerate(existing_hashes)
                    if list(existing_hashes.keys())[idx] == fp
                ])
                stats["deleted"] += 1
                print(f"  [DELETED] {fp}")
        
        # 2. 处理所有新/更新的文件
        for filepath in dir_path.rglob("*"):
            if not filepath.is_file():
                continue
            ext = filepath.suffix.lower()
            if ext not in (".pdf", ".md", ".txt", ".docx", ".html"):
                continue
            
            # 使用绝对路径作为唯一标识
            abs_path = str(filepath.resolve())
            file_hash = self.compute_file_hash(str(filepath))
            
            # 检查是否变更
            existing_hash = existing_hashes.get(abs_path)
            if existing_hash and existing_hash == file_hash:
                stats["skipped"] += 1
                print(f"  [SKIP] {filepath}")
                continue
            
            # 如果之前存在但文件已不存在，跳过
            if abs_path not in [str(f) for f in dir_path.rglob("*")]:
                continue
            
            # 新增/更新 → 处理
            if not existing_hash:
                stats["inserted"] += 1
                print(f"  [NEW] {filepath}")
            else:
                stats["updated"] += 1
                print(f"  [UPDATED] {filepath}")
            
            # 这里调用你的文档加载+分块+向量化流程
            # 伪代码：
            # docs = load_and_chunk(filepath)
            # # 删除旧向量
            # old_ids = [idx for idx, m in enumerate(self.vectorstore.get()['metadatas'])
            #            if m.get('file_hash') == existing_hash]
            # self.vectorstore.delete(ids=old_ids)
            # # 插入新向量
            # self.vectorstore.add_documents(docs, metadatas={
            #     "file_path": abs_path,
            #     "file_hash": file_hash,
            #     "last_updated": datetime.now().isoformat(),
            #     "action": "inserted" if not existing_hash else "updated"
            # })
        
        # 3. 清理不再存在的文件
        for fp in existing_hashes:
            if fp not in tracked_files and not os.path.exists(fp):
                # 从向量库中删除
                self.vectorstore.delete(
                    ids=[existing_hashes[fp]]
                )
                stats["deleted"] += 1
        
        return stats


# 使用示例
indexer = IncrementalRAGIndexer("./rag_vector_db")
stats = indexer.index_directory("./docs/")
print(f"增量索引完成: {stats}")
# 输出: {'inserted': 3, 'updated': 1, 'skipped': 96, 'deleted': 0}
# → 只有 4 篇文档触发了重新向量化！
```



---

### 节点六：检索 (Retrieval)

#### 一、这个节点是干什么的？

检索是 RAG 系统的**核心瓶颈**——它的质量直接决定了最终回答的质量。再好的 LLM 也无法弥补糟糕的检索。

检索的任务很简单：**给定一个查询，从向量数据库中找出最相关的 K 个文档。**

```
查询: "API 网关如何配置超时？"
    │
    ▼ [向量化查询]
查询向量: [-0.023, 0.456, ...]
    │
    ▼ [计算余弦相似度]
┌──────┬──────────┬──────────────────────────┐
│ 文档 │ 相似度   │ 内容摘要                  │
├──────┼──────────┼──────────────────────────┤
│ doc3 │ 0.92     │ API 网关超时配置指南      │
│ doc1 │ 0.87     │ 网关基本配置说明          │
│ doc5 │ 0.78     │ 微服务架构概览            │
│ doc2 │ 0.65     │ 数据库连接池配置          │
│ doc4 │ 0.52     │ 员工手册                  │
└──────┴──────────┴──────────────────────────┘
    │
    ▼ [返回 TopK]
检索结果: [doc3, doc1, doc5]
```

#### 二、为什么检索很重要？

```
检索质量直接影响回答质量的链式效应：
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 文档质量  │───▶│ 向量质量  │───▶│ 检索质量  │───▶│ 回答质量  │
│          │    │          │    │          │    │          │
│ 如果     │    │ 如果     │    │ 如果     │    │ 如果     │
│ 文档有   │    │ 向量有   │    │ 检索     │    │ LLM 收到 │
│ 噪声     │    │ 噪声     │    │ 不准     │    │ 错误     │
│ → 向量   │    │ → 向量   │    │ → 检索   │    │ → LLM  │
│ 有噪声   │    │ 不准     │    │ 到错误   │    │ 回答    │
│          │    │          │    │ 文档     │    │ 不准确  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

#### 三、技术原理

```
检索流程:

1. 查询向量化
   用户查询 → embedding model → 查询向量

2. 相似度计算
   查询向量 vs 所有文档向量 → 余弦相似度

3. 近似最近邻搜索 (ANN)
   HNSW/IVF/PQ 等算法 → TopK 最相似文档

4. 后处理
   去重 → 排序 → 过滤 → 返回 TopK
```

#### 四、代码实现

```python
# ================================================================
# 方案 A：基础相似搜索（最简单）
# ================================================================
from langchain_chroma import Chroma

vectorstore = Chroma(
    collection_name="my_knowledge_base",
    embedding_function=embeddings,
)

results = vectorstore.similarity_search(
    query="API 网关如何配置超时？",
    k=5,  # 返回 Top5
)
for doc in results:
    print(f"[{doc.metadata['source']}] {doc.page_content[:60]}...")
```

```python
# ================================================================
# 方案 B：带相关度分数的搜索
# ================================================================
results_with_scores = vectorstore.similarity_search_with_score(
    query="API 网关如何配置超时？",
    k=5,
)
for doc, score in results_with_scores:
    similarity = 1 - score  # 余弦距离 → 相似度
    print(f"相似度: {similarity:.4f} | {doc.page_content[:60]}...")
    # 相似度: 0.9234 | API 网关的超时配置分为三个层级：...
```

```python
# ================================================================
# 方案 C：MMR（最大边际相关性，自动去重）
# ================================================================
# MMR 在相关性和多样性之间做权衡
results = vectorstore.max_marginal_relevance_search(
    query="API 网关如何配置超时？",
    k=5,           # 最终返回 5 个
    fetch_k=20,    # 先检索 20 个候选
    lambda_mult=0.5,  # 相关性(1-λ) vs 多样性(λ) 权重
)
# lambda=0: 只看相关性（可能重复）
# lambda=1: 只看多样性（可能不相关）
# lambda=0.5: 平衡
```

```python
# ================================================================
# 方案 D：带元数据过滤的检索
# ================================================================
results = vectorstore.similarity_search(
    query="API 网关如何配置超时？",
    k=5,
    filter={"source": {"$contains": "docs/api/"}},
    # 其他过滤语法（因数据库而异）：
    # filter={"page": {"$gte": 10}},           # 页码 >= 10
    # filter={"content_type": "technical"},    # 固定值
)
```

```python
# ================================================================
# 方案 E：Hybrid 混合检索（BM25 + 向量 + RRF 融合）⭐推荐
# ================================================================
from langchain_community.retrievers import BM25Retriever

# BM25 检索器（关键词精确匹配）
bm25_retriever = BM25Retriever.from_documents(all_documents)
bm25_retriever.k = 10

# 向量检索器
vector_retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 10},
)

# RRF 融合
def reciprocal_rank_fusion(results: list[list], k: int = 60) -> list:
    """Reciprocal Rank Fusion 融合多路检索结果"""
    score_map = {}
    for doc_list in results:
        for rank, doc in enumerate(doc_list):
            doc_id = doc.page_content[:50]  # 去重键
            score_map[doc_id] = score_map.get(doc_id, 0) + 1 / (k + rank + 1)
    ranked_docs = sorted(score_map.items(), key=lambda x: x[1], reverse=True)
    return [next(d for d in docs if d.page_content[:50] == did) for did, _ in ranked_docs[:k]]

# 合并
bm25_results = bm25_retriever.get_relevant_documents("API 网关配置")
vector_results = vector_retriever.invoke("API 网关配置")
combined = reciprocal_rank_fusion([bm25_results, vector_results], k=60)
```

```python
# ================================================================
# 方案 F：Multi-Query 检索（改写查询后分别检索）
# ================================================================
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm_for_queries = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=vector_retriever,
    llm=llm_for_queries,
    prompt="""请针对原问题写 3 个不同的查询版本，
    每个版本都试图找到原问题的答案。
    原问题: {question}""",
)
results = multi_query_retriever.invoke("API 网关如何配置超时？")
```

#### 六、⚡ 轻量进阶：重排序 (Rerank) —— 召回后的"临门一脚"

##### 一、为什么需要重排序？

向量检索（向量相似度搜索）找的是**"语义最接近"**的文档，但它有两个天然局限：

```
用户问题: "如何配置 API 网关的超时时间？"

❌ 纯向量检索 Top-5 结果：
  [1] "API 网关的限流配置详解"              ← 相关但不够精准
  [2] "API 网关概述与核心功能"              ← 语义接近，但不是答案
  [3] "API 网关超时配置参数说明"            ← ✅ 真正的答案在这里!
  [4] "微服务架构中的 API 网关"              ← 泛泛而谈
  [5] "API 网关安全策略"                    ← 无关
  → LLM 会优先关注 [1] 和 [2]，忽略 [3] → 回答不准确!

✅ 用 Cross-Encoder 重排序后再检索 Top-3：
  [1] "API 网关超时配置参数说明"            ← ✅ 真正的答案
  [2] "如何配置 API 网关的超时时间"          ← ✅ 高度相关
  [3] "API 网关限流配置详解"                ← 次相关
  → LLM 拿到的是精准内容 → 回答准确!
```

**核心洞察**：向量检索的 Top-K 结果，**不保证按相关性排序**。LLM 对 Prompt 前 2-3 个 token 的关注度远高于后面——如果正确答案排在第 4 位，LLM 大概率忽略它。

##### 二、Cross-Encoder 重排序原理（极简版）

```
第一阶段：向量检索（召回）
  用户 query → Embedding → 与所有文档向量做近似最近邻搜索
  → Top-K 候选（速度快，但排序精度低）
  → 10-50 个候选文档
  ↓

第二阶段：重排序（精排）
  对 Top-K 候选逐一计算 query-document 相关性得分
  → Cross-Encoder 同时输入 query 和 document，输出相关性分数
  → 按分数排序 → Top-3 或 Top-5 给 LLM
  → 精度高，计算量小（只算 K 个候选）
```

**Cross-Encoder vs Bi-Encoder 的区别**：

| 方法 | 原理 | 速度 | 精度 |
|--|--|--|--|
| Bi-Encoder (向量检索) | query 和 doc 分别编码 → 计算相似度 | 快（批量计算） | 中 |
| Cross-Encoder (重排序) | query 和 doc 拼接后编码 → 输出相关性分数 | 慢（逐一计算） | **高** |

**为什么推荐重排序？**
- 比换 Embedding 模型**更有效**：同一 Embedding 模型 + 重排序，效果远超换更好的 Embedding
- 计算量可控：只对 Top-K（10-50）个候选做重排序，不是全库
- 即插即用：加在检索和 LLM 之间，不需要修改其他节点

##### 三、代码实现（两种方案）

```python
# =============================================
# 方案 A：BGE-Reranker（开源免费，推荐）
# =============================================
# pip install flag-embedding

from flag_embedding.reranker import Reranker

# 加载模型
reranker = Reranker('BAAI/bge-reranker-large')

# 对检索结果排序
query = "如何配置 API 网关的超时时间？"
retrieved_docs = ["API 网关概述", "超时配置参数说明", "限流配置详解", "网关安全"]

# 返回排序后的结果
sorted_results = reranker.compute_score([[query, doc] for doc in retrieved_docs])
# sorted_results = [0.92, 0.75, 0.31, 0.12] (从高到低)

# 取 Top-3 给 LLM
relevance_rank = sorted(range(len(sorted_results)), key=lambda k: sorted_results[k], reverse=True)
top_3_context = "\n".join(retrieved_docs[r] for r in relevance_rank[:3])
```

```python
# =============================================
# 方案 B：Cohere Rerank（API，生产环境推荐）
# =============================================
# pip install cohere
import cohere

c = cohere.Client("your-api-key")

query = "如何配置 API 网关的超时时间？"
docs = ["API 网关概述", "超时配置参数说明", "限流配置详解", "网关安全"]

# 返回排序结果
response = c.rerank(
    model="rerank-v3.5",
    query=query,
    documents=docs,
    top_n=3,  # 只返回最相关的 3 个
)

# 每个结果有相关性分数
for result in response.results:
    print(f"[{result.index}] score={result.relevance_score:.4f} | {docs[result.index]}")
# 输出示例:
# [1] score=0.9512 | 超时配置参数说明
# [2] score=0.3201 | 限流配置详解
# [0] score=0.1145 | API 网关概述
```


### 节点八：LLM 生成 (LLM Generation)

#### 一、这个节点是干什么的？

LLM 接收到 Prompt（系统指令 + 上下文 + 用户查询），生成最终回答。

#### 二、关键设计决策

| 决策 | 推荐 | 原因 |
|------|------|------|
| temperature | 0.1-0.3 | 低温度减少随机性，RAG 不需要创造性 |
| max_tokens | 根据问题设定 | 太长浪费，太短不够 |
| 输出格式 | 自由文本 / JSON / XML | 取决于下游需求 |
| 是否流式 | 是 | 降低首 token 延迟 |

#### 三、代码实现

```python
# ================================================================
# 方案 A：标准生成
# ================================================================
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOpenAI(model="gpt-4o", temperature=0.1)

response = llm.invoke([
    SystemMessage(content="你是一个专业的知识助手。"),
    HumanMessage(content=f"""请根据以下参考资料回答问题。

参考资料:
{context}

问题: {question}

请基于上述资料直接回答问题。引用格式：[ref_id]。
如果资料不足以回答，请说明。

回答:"""),
])
print(response.content)
```

```python
# ================================================================
# 方案 B：结构化输出（JSON）
# ================================================================
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel

class Answer(BaseModel):
    answer: str
    references: list[str]
    confidence: float
    missing_info: str

parser = JsonOutputParser(pydantic_object=Answer)

response = llm.invoke([
    SystemMessage(content=f"请输出 JSON: {parser.get_format_instructions()}"),
    HumanMessage(content=f"参考资料:\n{context}\n问题: {question}"),
])
answer = Answer(**response.content)
print(f"答案: {answer.answer}")
print(f"置信度: {answer.confidence}")
```

```python
# ================================================================
# 方案 C：流式输出（降低首 token 延迟）
# ================================================================
for chunk in llm.stream(messages):
    if chunk.content:
        print(chunk.content, end="", flush=True)
```

---

### 节点九：引用与输出格式化

#### 一、这个节点是干什么的？

确保每个回答都能追溯到参考资料。这是 RAG 区别于纯 LLM 回答的关键。

#### 二、代码实现

```python
class CitationFormatter:
    """引用格式化器"""

    def format(self, answer: str, docs: list) -> str:
        output = answer
        ref_list = "\n\n**参考文献：**\n"
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "未知")
            page = doc.metadata.get("page", "")
            ref_list += f"[ref{i+1}] {source}" + (f" (第{i+1}页)" if page else "") + "\n"
        return output + ref_list
```

---

## 第三部分：三个关键补充方向 ⭐

---

### 补充一：元数据过滤 (Metadata Filtering)

#### 一、什么是元数据过滤？为什么它很重要？

元数据过滤的本质：**在向量检索的同时，附加结构化的过滤条件，将搜索空间精准缩小到目标子集**。

```
用户问题: "帮我查一下 2024 年关于 Android 内存优化的文档"

❌ 没有元数据过滤:
直接向量搜索 "2024 Android 内存优化"
→ 召回 50 个相关文档（包含 2022 年的、iOS 的、网络优化的）
→ 需要后续人工筛选，且向量搜索本身无法区分年份和标签

✅ 有元数据过滤:
向量搜索 "内存优化" + 过滤条件 {"year": 2024, "tags": ["Android", "内存优化"]}
→ 召回 3 个精准匹配文档
→ 搜索空间从 50 → 3（缩小 94%），准确度大幅提升
```

#### 二、元数据过滤的三个核心环节

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  第 1 步：索引构建时提取元数据                                                     │
│                                                                                  │
│  原始文档 → 解析 → 自动提取 + 手动标注元数据                                     │
│  → 年份、分类标签、作者、来源、内容类型、权限级别                                 │
│  → 存入向量库的 metadata 字段                                                     │
│  → 关键：元数据是后续过滤的 "燃料"                                                │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────┐               │
│  │  文档 1 (page_content: "API 网关配置...")                      │               │
│  │  metadata:                                                    │               │
│  │    {"year": 2024, "tags": ["API", "网关"],                   │               │
│  │     "author": "张明", "content_type": "manual",              │               │
│  │     "source": "docs/api/", "page": 5}                        │               │
│  │  → 每个文档自带标签！                                           │               │
│  └───────────────────────────────────────────────────────────────┘               │
├──────────────────────────────────────────────────────────────────────────────────┤
│  第 2 步：查询时提取过滤条件                                                        │
│                                                                                  │
│  用户: "2024 年关于 Android 内存优化"                                           │
│  → 自动提取: year=2024, tags=["Android", "内存优化"]                           │
│                                                                                  │
│  用户: "张明写的 API 文档"                                                       │
│  → 自动提取: author="张明", content_type="api"                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│  第 3 步：检索时应用过滤                                                            │
│                                                                                  │
│  vector_store.similarity_search(                                                │
│      query="内存优化",                                                           │
│      k=5,                                                                        │
│      filter={"year": 2024, "tags": "Android"},                                │
│  )                                                                                │
│  → 只在 metadata 符合条件的文档中做向量搜索                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### 三、元数据提取策略

```
元数据提取方式
│
├─ 自动提取（推荐首选）
│   ├─ 文件名解析: "android_14_memory_2024.pdf" → {year:2024, tags:["android"]}
│   ├─ 文档内提取: 从 PDF/Markdown 头部提取标题、日期、作者
│   ├─ 目录结构: docs/2024/android/memory/ → 自动映射路径为标签
│   └─ LLM 辅助: 让 LLM 从文档内容中提取结构化元数据
│
├─ 手动标注（适合重要文档）
│   ├─ 通过 CMS/知识库后台手动添加标签
│   ├─ 适合需要精确分类的文档（如合规文档、法律文件）
│   └─ 成本：高，但准确度高
│
└─ 混合策略（推荐生产方案）
    ├─ 自动提取作为默认值
    └─ 手动修正作为补充
```

#### 四、代码实现

```python
# =======================================================
# 1. 索引构建时：元数据自动提取器
# =======================================================
import re
from typing import List, Dict
from datetime import datetime
from langchain_core.documents import Document

class MetadataExtractor:
    """
    元数据自动提取器
    
    从文件名、目录结构、文档内容中自动提取结构化元数据
    """
    
    def __init__(self):
        # 文件类型到内容类型的映射
        self.type_map = {
            ".pdf": "document",
            ".docx": "document",
            ".md": "markdown",
            ".txt": "text",
            ".json": "data",
            ".html": "web",
            ".pptx": "presentation",
        }
        
        # 目录路径到标签的映射
        self.tag_map = {
            "android": ["Android"],
            "ios": ["iOS"],
            "web": ["Web"],
            "api": ["API"],
            "memory": ["内存", "Memory"],
            "performance": ["性能", "Performance"],
            "security": ["安全", "Security"],
            "network": ["网络", "Network"],
        }
    
    def extract_from_filename(self, filename: str) -> Dict:
        """从文件名提取元数据"""
        metadata = {}
        
        # 提取年份
        year_match = re.search(r'(\d{4})', filename)
        if year_match:
            metadata['year'] = int(year_match.group(1))
        
        # 提取文件类型
        for ext, content_type in self.type_map.items():
            if filename.endswith(ext):
                metadata['content_type'] = content_type
                break
        
        # 提取文件扩展名作为标签
        if '.' in filename:
            base = filename.rsplit('.', 1)[0]
            metadata['filename_tag'] = base.lower()
        
        return metadata
    
    def extract_from_path(self, filepath: str) -> Dict:
        """从文件路径提取元数据"""
        metadata = {}
        parts = filepath.lower().split('/')
        
        # 从路径各段提取标签
        all_tags = set()
        for part in parts:
            for key, tags in self.tag_map.items():
                if key in part:
                    all_tags.update(tags)
        
        if all_tags:
            metadata['tags'] = list(all_tags)
        
        # 从路径提取来源
        if 'docs' in parts:
            metadata['source'] = 'docs'
        elif 'wiki' in parts:
            metadata['source'] = 'wiki'
        elif 'internal' in parts:
            metadata['source'] = 'internal'
        
        # 从路径提取内容类型
        for part in parts:
            if 'api' in part:
                metadata.setdefault('content_type', 'api_reference')
            elif 'tutorial' in part:
                metadata.setdefault('content_type', 'tutorial')
            elif 'guide' in part:
                metadata.setdefault('content_type', 'guide')
        
        return metadata
    
    def extract_from_content(self, content: str) -> Dict:
        """从文档内容提取元数据（启发式）"""
        metadata = {}
        lines = content.split('\n')
        
        # 提取作者
        author_match = re.search(r'作者[:：]\s*(.+)', content)
        if author_match:
            metadata['author'] = author_match.group(1).strip()
        
        # 提取日期
        date_match = re.search(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})', content)
        if date_match:
            date_str = date_match.group(1)
            try:
                parsed = datetime.strptime(date_str[:10], '%Y-%m-%d')
                metadata['published_date'] = date_str
                metadata['year'] = parsed.year
            except:
                year_match = re.search(r'(\d{4})', date_str)
                if year_match:
                    metadata['year'] = int(year_match.group(1))
        
        # 提取章节标题
        heading_match = re.match(r'^#+\s+(.+)$', lines[0], re.MULTILINE)
        if heading_match:
            metadata['title'] = heading_match.group(1).strip()
        
        return metadata
    
    def extract_all(self, filepath: str, content: str) -> Dict:
        """综合提取所有元数据"""
        filename = filepath.split('/')[-1] if '/' in filepath else filepath
        
        # 1. 从文件名提取
        meta = self.extract_from_filename(filename)
        
        # 2. 从路径提取（补充）
        path_meta = self.extract_from_path(filepath)
        for k, v in path_meta.items():
            if k not in meta:
                meta[k] = v
            elif isinstance(v, list) and isinstance(meta[k], list):
                meta[k] = list(set(meta[k]) | set(v))
        
        # 3. 从内容提取（补充）
        content_meta = self.extract_from_content(content)
        for k, v in content_meta.items():
            if k not in meta:
                meta[k] = v
        
        return meta
```

```python
# =======================================================
# 2. 检索时：元数据过滤
# =======================================================
from langchain_chroma import Chroma

vectorstore = Chroma(
    collection_name="knowledge_base",
    embedding_function=embeddings,
    persist_directory="./chroma_db",
)

# === 基础过滤（单值匹配）===
# 只搜索 2024 年的文档
results = vectorstore.similarity_search(
    query="内存优化",
    k=5,
    filter={"year": 2024},
)

# 只搜索 Android 相关文档
results = vectorstore.similarity_search(
    query="内存优化",
    k=5,
    filter={"tags": "Android"},
)

# === 高级过滤（组合条件）===
# Chroma 支持的过滤操作符:
# $eq / $neq    → 等于 / 不等于
# $in / $nin    → 在列表中 / 不在列表中
# $gte / $lte   → 大于等于 / 小于等于
# $contains      → 包含子字符串

# 年份范围 + 标签
results = vectorstore.similarity_search(
    query="内存优化",
    k=5,
    filter={
        "year": {"$gte": 2023, "$lte": 2024},  # 2023-2024
        "tags": "Android",                        # 标签包含 Android
        "source": {"$neq": "external"},           # 排除外部来源
    },
)

# === Qdrant 过滤语法（不同数据库语法不同）===
# from qdrant_client import models
# filter = models.Filter(
#     must=[
#         models.FieldCondition(key="year", range=models.Range(gte=2023, lte=2024)),
#         models.FieldCondition(key="tags", match=models.MatchAny(any=["Android"])),
#         models.FieldCondition(key="source", match=models.MatchValue(value="docs")),
#     ]
# )
# client.search(collection_name="kb", query_vector=vector, query_filter=filter)

# === Elasticsearch 过滤语法 ===
# from elasticsearch import Elasticsearch
# es = Elasticsearch(["http://localhost:9200"])
# results = es.search(
#     index="kb",
#     body={
#         "knn": {"field": "embedding", "vector": vector, "k": 5},
#         "filter": {
#             "bool": {
#                 "must": [
#                     {"range": {"year": {"gte": 2023, "lte": 2024}}},
#                     {"term": {"tags": "Android"}},
#                     {"term": {"source": "docs"}},
#                 ]
#             }
#         }
#     }
# )

# === pgvector 过滤语法 ===
# cur.execute("""
#     SELECT id, content, 1 - (embedding <=> %s::vector) AS similarity
#     FROM documents
#     WHERE year >= 2023 AND year <= 2024
#       AND tags @> ARRAY['Android']::jsonb[]
#       AND source = 'docs'
#     ORDER BY embedding <=> %s::vector
#     LIMIT 5;
# """, (query_vector, query_vector))
```

```python
# =======================================================
# 3. 元数据过滤的效果对比
# =======================================================
"""
效果数据（典型企业知识库）:

场景: "2024 年关于 Android 内存优化的文档"

无过滤:
  召回数量: 50 个文档
  其中相关: 8 个
  命中率:   8/50 = 16%
  Top-1 相关: ❌ 第 12 位

有过滤:
  召回数量: 3 个文档
  其中相关: 3 个
  命中率:   3/3 = 100%
  Top-1 相关: ✅ 第 1 位

结论: 元数据过滤可以将检索准确率从 16% → 100%，
      同时将检索空间缩小 94%，大幅减少幻觉和噪音。
"""
```

---

### 补充二：向量数据库索引参数详解与持久化最佳实践

#### 一、索引参数详解（HNSW 关键参数）

向量数据库的核心是**索引结构**，它决定了搜索的速度和精度。HNSW 是最常用的索引类型，关键参数直接影响性能。

```
HNSW 关键参数:

M=16           → 每个节点的最大连接数
                 M↑: 精度↑ 延迟↑ 内存↑
                 M↓: 精度↓ 延迟↓ 内存↓
                 推荐: 16 (默认)

efConstruction=128 → 构建索引时的搜索宽度
                  ef↑: 索引质量↑ 构建时间↑
                  推荐: 128 (默认)

efSearch=64      → 查询时的搜索宽度
                  ef↑: 精度↑ 延迟↑
                  ef=200+ 接近 Flat 精度
                  推荐: 64-128（根据精度/延迟权衡）

┌──────────────────────────────────────────────────────────────────┐
│  ef 参数的直观理解:                                              │
│                                                                │
│  ef=10:  快速但不精确（跳着搜，可能错过最优解）                   │
│  ef=64:  平衡（推荐默认）                                        │
│  ef=128: 精确（扩大搜索范围）                                    │
│  ef=200+: 近似暴力搜索（慢但准）                                 │
└──────────────────────────────────────────────────────────────────┘
```

**参数调优建议**：

| 场景 | M | efConstruction | efSearch | 说明 |
|------|---|-----|------|------|
| 开发/原型 | 16 | 128 | 32 | 快速迭代 |
| 生产默认 | 16 | 128 | 64 | 平衡精度/延迟 |
| 高精度场景 | 32 | 256 | 128 | 精度优先 |
| 低延迟场景 | 8 | 64 | 32 | 延迟优先 |

#### 二、向量数据库持久化最佳实践

**不持久化 = 数据随程序消失**。这是初学者最常踩的坑。

```python
# ================================================================
# Chroma 持久化（最简单，推荐新手）
# ================================================================
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

# === 写入阶段（首次）===
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 指定 persist_directory → 自动持久化到磁盘
vectorstore = Chroma(
    collection_name="my_knowledge_base",
    embedding_function=embeddings,
    persist_directory="./chroma_db",  # ← 持久化目录
)

# 写入文档
docs = [
    ("API 网关配置指南...", {"source": "docs/api", "page": 1}),
    ("内存优化最佳实践...", {"source": "docs/perf", "page": 1}),
]
vectorstore.add_texts(texts=[d[0] for d in docs], metadatas=[d[1] for d in docs])

# 保存（Chroma 通常自动保存，也可手动调用）
vectorstore.persist()
print(f"已保存 {vectorstore._collection.count()} 条数据到 ./chroma_db/")

# === 读取阶段（重启后）===
loaded_store = Chroma(
    collection_name="my_knowledge_base",
    embedding_function=embeddings,
    persist_directory="./chroma_db",  # ← 同一目录
)

print(f"已加载 {loaded_store._collection.count()} 条数据")  # 依然 = 2！
results = loaded_store.similarity_search("配置指南", k=3)

# === 备份策略 ===
import shutil
shutil.copytree("./chroma_db", "./chroma_db_backup")  # 备份整个目录
```

```python
# ================================================================
# FAISS 持久化（需手动保存索引 + 文档）
# ================================================================
import faiss
import pickle
import os
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

# === 写入阶段 ===
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
dim = 1536
index = faiss.IndexFlatL2(dim)  # Flat L2 索引

faiss_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore={},
    index_to_docstore_id={},
)
faiss_store.add_texts(texts=["文本1", "文本2"])

# === 持久化（两种方法）===
# 方法 1: save_local（推荐）
faiss_store.save_local("./faiss_index")
# 方法 2: 分别保存
faiss.save_index("./faiss_index.index")
with open("./faiss_index.docstore.pkl", "wb") as f:
    pickle.dump(faiss_store.docstore, f)

# === 读取阶段（重启后）===
loaded_store = FAISS.load_local(
    "./faiss_index",
    embeddings,
    allow_dangerous_deserialization=True,
)
print(f"已加载 {loaded_store.docstore.count()} 条数据")
```

```python
# ================================================================
# Qdrant 持久化（自动，最简单）
# ================================================================
from qdrant_client import QdrantClient
from qdrant_client import models
import uuid

# 正确: 本地磁盘持久化
client = QdrantClient(path="./qdrant_data")  # 数据自动存到 ./qdrant_data/
# 错误: 内存模式（重启丢失！）
# client = QdrantClient(":memory:")

client.recreate_collection(
    collection_name="kb",
    vectors_config=models.VectorParams(
        size=1536,
        distance=models.Distance.COSINE,
    ),
)

# === 写入 ===
for text in ["文本1", "文本2"]:
    vector = embeddings.embed_query(text)
    client.upsert(
        collection_name="kb",
        points=[models.PointStruct(
            id=uuid.uuid4().hex,
            vector=vector,
            payload={"content": text},
        )],
    )

# === 读取（重启后，数据自动保留）===
results = client.search(
    collection_name="kb",
    query_vector=embeddings.embed_query("文本1"),
    limit=5,
)
```

**持久化检查清单**：

```
持久化检查清单
│
├─ Chroma
│   ├─ ✅ persist_directory="./chroma_db"
│   ├─ ✅ 重启后指定同一目录即可恢复
│   ├─ ⚠️ 定期备份 ./chroma_db/ 目录
│   └─ ❌ 不要把持久化目录加入 .gitignore 以外的版本控制
│
├─ FAISS
│   ├─ ✅ faiss.save_index("index.index") 保存索引
│   ├─ ✅ pickle dump docstore 保存文档映射
│   ├─ ✅ FAISS.save_local("dir/") 一键保存整个 store
│   ├─ ❌ 只保存索引不保存 docstore = 有向量无内容
│   └─ ❌ pickle 反序列化要设 allow_dangerous_deserialization
│
├─ Qdrant
│   ├─ ✅ QdrantClient(path="./data") 本地持久化
│   ├─ ❌ QdrantClient(":memory:") 不持久化
│   └─ ✅ 生产推荐 Docker 部署 + 数据卷挂载
│
├─ pgvector
│   ├─ ✅ 数据存在 PostgreSQL 本身
│   ├─ ✅ 通过 pg_dump 备份
│   └─ ✅ PostgreSQL 自身有 WAL + 事务保证
│
└─ 通用建议
    ├─ ✅ 所有持久化目录加入 .gitignore
    ├─ ✅ 定期备份（每天/每周）
    ├─ ✅ 监控磁盘空间
    └─ ✅ 生产环境考虑托管服务（Chroma Cloud / Milvus Cloud）
```

---

### 补充三：Prompt 模板优化（防止幻觉的基础手段）

#### 一、为什么基础 Prompt 模板很重要？

很多开发者在 RAG 中忽略了一个最基本但最重要的环节：**告诉 LLM"如果不知道就承认不知道"**。

```
❌ 错误的 Prompt:
"基于以下资料回答问题: [资料内容]
问题: 用户的问题"

→ LLM 会"尽力编造"答案，即使资料完全不相关
→ 结果: 流利地胡说八道（流畅但错误）

✅ 正确的 Prompt:
"基于以下资料回答问题: [资料内容]
问题: 用户的问题
如果资料不足以回答，请说"根据现有资料无法回答此问题"。
不要编造答案。"

→ LLM 会诚实回答"不知道"
→ 结果: 不回答 < 错误回答（诚实 > 虚假）
```

#### 二、三大基础 Prompt 模板

```python
# =======================================================
# 模板一：基础防幻觉模板（最常用，推荐作为默认）
# =======================================================
from langchain_core.prompts import ChatPromptTemplate

RAG_PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", """你是一个专业的技术助手。你的任务是**严格基于提供的参考资料**回答用户的问题。

回答规则（必须遵守）：
1. **只使用参考资料中的信息回答**
2. **如果参考资料不足以回答用户的问题，请明确说："根据现有资料，我无法回答这个问题。"
3. **不要编造、推测或使用你自己的知识回答**
4. 引用答案中的内容时，标注来源 [ref_id]
5. 保持简洁，直接回答问题，不需要复述参考资料
6. 使用与用户相同的语言回答"""),

    ("human", """参考资料:
{context}

---
用户问题:
{question}

请基于以上资料回答。"""),
])
```

```python
# =======================================================
# 模板二：增强引用模板（适合需要精确溯源的场景）
# =======================================================
REFERENCE_RAG_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", """你是一个技术文档助手。请严格按照以下格式回答:

回答格式:
## 回答
[直接回答问题]

## 引用来源
[ref_id] [来源文档] [相关片段]

规则:
- 每个事实必须引用对应的参考资料 [ref_id]
- 如果某个事实无法从参考资料中找到依据，在回答中标注 [无法验证]
- 如果所有关键信息都无法从参考资料中找到，回答: "当前资料不足以支持对该问题的完整回答。"
- 不要添加任何参考资料中没有的内容"""),

    ("human", """参考资料:
{context}

问题: {question}"""),
])
```

```python
# =======================================================
# 模板三：分级回答模板（区分"确定"、"推测"、"未知"）
# =======================================================
CLASSIFIED_RAG_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", """你是一个技术文档助手。请按照以下分级方式回答:

回答分级规则:
- [明确]: 资料中有完全匹配的信息 → 直接回答
- [部分]: 资料中有部分相关信息 → 回答 + 说明哪些信息缺失
- [不确定]: 资料不够 → "根据现有资料，我只能确认以下信息..."
- [无法回答]: 资料完全不相关 → "根据现有资料，我无法回答这个问题。"

每个回答必须包含:
1. 回答内容
2. 置信度 (明确/部分/不确定/无法回答)
3. 引用来源 [ref_id]

规则:
- 绝不编造资料中没有的信息
- 不确定时诚实说明"""),

    ("human", """参考资料:
{context}

问题: {question}"""),
])
```

#### 三、Prompt 优化的关键原则

```
Prompt 优化原则
│
├─ 原则 1: 明确禁止幻觉
│   ├─ "只使用参考资料"
│   ├─ "如果不知道就说不知道"
│   └─ "不要编造"
│
├─ 原则 2: 限定回答范围
│   ├─ "直接回答"（不要复述资料）
│   ├─ "简洁"（不要啰嗦）
│   └─ "结构化"（需要时要求 JSON/表格格式）
│
├─ 原则 3: 要求引用
│   ├─ "每个事实标注来源 [ref_id]"
│   ├─ "无法验证的事实标注 [无法验证]"
│   └─ 让 LLM 自己判断引用的充分性
│
├─ 原则 4: 语言一致
│   ├─ "使用与问题相同的语言回答"
│   ├─ 英文问题 → 英文回答
│   └─ 中文问题 → 中文回答
│
└─ 原则 5: 分级回答
    ├─ "明确/部分/不确定/无法回答" 四级
    └─ 让用户知道答案的可靠程度
```

---

## 第四部分：完整管线代码

以下是一个**从零到可运行**的完整 RAG 管线——包含你前面学过的所有核心节点：文档加载 → 解析清洗 → 分块 → 向量化 → 存储 → 检索 → Prompt 构建 → 生成。

---

### 方案 A：LangChain 端到端实现

```python
# ============================================================
# 完整 RAG Pipeline（LangChain 实现）
# ============================================================
from pathlib import Path
from typing import List, Dict
import re

# --- 依赖安装 ---
# pip install langchain langchain-openai langchain-community langchain-chroma \
#           langchain-text-splitters tiktoken python-dotenv

from dotenv import load_dotenv
load_dotenv()  # 从 .env 文件加载 OPENAI_API_KEY

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import (
    PyPDFLoader,
    DirectoryLoader,
    TextLoader,
)

# ============================================================
# 第 1 步：文档加载
# ============================================================
def load_documents(doc_dir: str) -> List[Document]:
    """加载目录下的所有文档"""
    loader = DirectoryLoader(
        doc_dir,
        glob="**/*.{pdf,md,txt}",
        show_progress=True,
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    docs = loader.load()
    print(f"✅ 加载完成: {len(docs)} 个文档")
    return docs


# ============================================================
# 第 2 步：解析与清洗
# ============================================================
class DocumentCleaner:
    """文档清洗器：去除噪声、保留语义结构"""
    
    NOISE_PATTERNS = [
        r"^\s*[A-Z][a-zA-Z\s]+\s*v\d+\.?\d*\s*·\s*[机密保密文档]?\s*$",
        r"^\s*page\s*\d+\s*(?:of|/|共)\s*\d+\s*$",
        r"^\s*第\s*\d+\s*页\s*(?:共|of)\s*\d+\s*页?\s*$",
        r"^\s*\[上一页\]\s*\[下一页\]\s*$",
        r"^\s*Confidential\s*$",
        r"^\s*机密\s*$",
        r"^\s*Copyright\s*\d+\s*.*$",
        r"^\s*──*\s*$",
    ]
    
    def __init__(self):
        self.patterns = [
            re.compile(p, re.IGNORECASE | re.MULTILINE) for p in self.NOISE_PATTERNS
        ]
    
    def clean(self, text: str) -> str:
        lines = text.split("\n")
        cleaned = []
        empty_count = 0
        
        for line in lines:
            stripped = line.strip()
            
            # 跳过噪声行
            if any(p.match(stripped) for p in self.patterns):
                continue
            
            # 控制空行数量
            if not stripped:
                empty_count += 1
                if empty_count <= 2:
                    cleaned.append("")
                continue
            empty_count = 0
            
            # 清理控制字符
            cleaned_line = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", stripped)
            if cleaned_line:
                cleaned.append(cleaned_line)
        
        result = "\n\n".join(cleaned).strip()
        return re.sub(r"\n{4,}", "\n\n\n", result)


def clean_documents(docs: List[Document]) -> List[Document]:
    """清洗所有文档"""
    cleaner = DocumentCleaner()
    cleaned = []
    for doc in docs:
        original_len = len(doc.page_content)
        doc.page_content = cleaner.clean(doc.page_content)
        cleaned_len = len(doc.page_content)
        removed_pct = round((1 - cleaned_len / original_len) * 100, 1)
        print(f"   文档: {doc.metadata.get('source', '?')[:30]:30s} | "
              f"{original_len} → {cleaned_len} (去噪 {removed_pct}%)")
        cleaned.append(doc)
    return cleaned


# ============================================================
# 第 3 步：文本分块
# ============================================================
import tiktoken

def tiktoken_len(text: str) -> int:
    encoder = tiktoken.get_encoding("cl100k_base")
    return len(encoder.encode(text))


def chunk_documents(docs: List[Document]) -> List[Document]:
    """按语义分块"""
    # 中文分块策略
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,        # 512 tokens ≈ 2000 中文
        chunk_overlap=64,      # 64 tokens 重叠
        length_function=tiktoken_len,
        separators=[
            "\n\n\n",           # 章节
            "\n\n",             # 段落
            "\n",               # 行
            "。", "！", "？", "；",  # 中文标点
            " ",               # 空格
            "",                 # 字符
        ],
        chunk_size_limit=1024,
        min_chunk_size=64,
    )
    
    chunks = splitter.split_documents(docs)
    print(f"✅ 分块完成: {len(docs)} 个文档 → {len(chunks)} 个 chunk")
    
    # 统计 chunk 分布
    token_sizes = [tiktoken_len(c.page_content) for c in chunks]
    print(f"   Token 分布: min={min(token_sizes)}, max={max(token_sizes)}, "
          f"avg={sum(token_sizes)/len(token_sizes):.1f}")
    
    return chunks


# ============================================================
# 第 4 步：向量化 & 存储
# ============================================================
def build_vector_store(chunks: List[Document], 
                       persist_dir: str = "./rag_vector_db",
                       collection_name: str = "knowledge_base") -> Chroma:
    """构建向量数据库"""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    # 加载或创建向量库
    if Path(persist_dir).exists():
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=persist_dir,
        )
        print(f"✅ 加载已有向量库: {vectorstore._collection.count()} 条")
        return vectorstore
    
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory=persist_dir,
    )
    vectorstore.persist()
    print(f"✅ 新建向量库: {vectorstore._collection.count()} 条向量")
    return vectorstore


# ============================================================
# 第 5 步：检索
# ============================================================
def retrieve(vectorstore: Chroma, query: str, k: int = 5,
             filter_kwargs: Dict = None) -> List[Document]:
    """向量检索 + 可选元数据过滤"""
    if filter_kwargs:
        results = vectorstore.similarity_search(query, k=k, filter=filter_kwargs)
    else:
        results = vectorstore.similarity_search(query, k=k)
    
    print(f"✅ 检索到 {len(results)} 个相关文档:")
    for i, doc in enumerate(results):
        score = doc.metadata.get("relevance_score", "?")
        print(f"   [{i+1}] {doc.page_content[:80]}...")
        print(f"       来源: {doc.metadata.get('source', '?')} | "
              f"page: {doc.metadata.get('page', '?')}")
    return results


# ============================================================
# 第 6 步：Prompt 构建
# ============================================================
RAG_PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", """你是一个专业的技术助手。请**严格基于参考资料**回答问题。

回答规则：
1. 只使用参考资料中的信息
2. 如果资料不足以回答，说："根据现有资料，我无法回答这个问题。"
3. 不要编造或使用自己的知识
4. 引用答案中的内容时标注来源 [ref_id]
5. 保持简洁，直接回答
6. 使用与问题相同的语言

参考资料来源说明：[ref1] [ref2] ... 按顺序对应"""),
    ("human", """## 参考资料
{context}

---
## 问题
{question}

请基于以上资料回答。"""),
])


def build_context(retrieved_docs: List[Document]) -> str:
    """将检索结果格式化为上下文"""
    context_parts = []
    for i, doc in enumerate(retrieved_docs):
        source = doc.metadata.get("source", "未知来源")
        page = doc.metadata.get("page", "")
        content_preview = doc.page_content[:300]
        context_parts.append(
            f"[ref{i+1}] 来源: {source}" + 
            (f" (第{page}页)" if page else "") + 
            f"\n内容: {content_preview}"
        )
    return "\n\n".join(context_parts)


# ============================================================
# 第 7 步：LLM 生成
# ============================================================
def generate(response: str) -> str:
    return response


# ============================================================
# 完整管线：一键运行
# ============================================================
def rag_pipeline(query: str, 
                 doc_dir: str = "./docs",
                 persist_dir: str = "./rag_vector_db",
                 k: int = 5,
                 filter_kwargs: Dict = None) -> Dict:
    """
    完整的 RAG 管线：加载 → 清洗 → 分块 → 存储 → 检索 → Prompt → 生成
    
    Args:
        query: 用户问题
        doc_dir: 文档目录
        persist_dir: 向量库持久化目录
        k: 检索数量
        filter_kwargs: 元数据过滤条件
    
    Returns:
        {"answer": str, "context": str, "sources": List[Document]}
    """
    print("=" * 60)
    print(f"🔍 用户问题: {query}")
    print("=" * 60)
    
    # 第 1-2 步：加载 + 清洗
    raw_docs = load_documents(doc_dir)
    clean_docs = clean_documents(raw_docs)
    
    # 第 3 步：分块
    chunks = chunk_documents(clean_docs)
    
    # 第 4 步：构建向量库（首次需要分块和向量化）
    vectorstore = build_vector_store(chunks, persist_dir)
    
    # 第 5 步：检索
    retrieved = retrieve(vectorstore, query, k, filter_kwargs)
    
    # 第 6 步：构建 Prompt
    context = build_context(retrieved)
    
    # 第 7 步：生成
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    chain = RAG_PROMPT_TEMPLATE | llm | StrOutputParser()
    response = chain.invoke({
        "context": context,
        "question": query,
    })
    
    # 组装结果
    result = {
        "query": query,
        "answer": response,
        "sources": retrieved,
        "context_length": len(context),
    }
    
    print("\n" + "=" * 60)
    print("📝 回答:")
    print("-" * 60)
    print(response)
    print("=" * 60)
    
    return result


# ============================================================
# 运行示例
# ============================================================
if __name__ == "__main__":
    # 首次运行：加载文档并构建向量库
    result = rag_pipeline(
        query="API 网关超时怎么配置？",
        doc_dir="./docs",
    )
    
    # 再次运行：向量库已持久化，只需检索
    result2 = rag_pipeline(
        query="2024 年关于内存优化的文档",
        doc_dir="./docs",
        filter_kwargs={"year": {"$gte": 2024}},  # 元数据过滤
    )
```

---

### 方案 B：LlamaIndex 端到端实现（更轻量）

```python
# ============================================================
# 完整 RAG Pipeline（LlamaIndex 实现）
# ============================================================
# pip install llama-index-llms-openai llama-index-embeddings-openai \
#           llama-index-readers-file llama-index-vector-stores-chroma

from llama_index.core import (
    Settings,
    VectorStoreIndex,
    SimpleDirectoryReader,
)
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

# 初始化设置
Settings.llm = OpenAI(model="gpt-4o")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# ============================================================
# 第 1-4 步：文档加载 → 解析 → 分块 → 存储（一条链）
# ============================================================
# 加载文档
reader = SimpleDirectoryReader(
    "./docs/",
    required_exts=[".pdf", ".md", ".txt"],
    recursive=True,
)
docs = reader.load_data()

# 创建 Chroma 向量库
col = chromadb.PersistentClient(path="./rag_chroma_db").get_or_create_collection("kb")
vector_store = ChromaVectorStore(chroma_collection=col)

# 构建索引（自动处理分块、向量化、存储）
index = VectorStoreIndex.from_documents(
    docs,
    vector_store=vector_store,
)

# ============================================================
# 第 5-7 步：查询（检索 → Prompt → 生成）
# ============================================================
query_engine = index.as_query_engine(
    similarity_top_k=5,  # 检索 TopK
)

# 查询
response = query_engine.query("API 网关超时怎么配置？")
print(response)

# 带过滤的查询
docs_with_filter = [d for d in docs if d.metadata.get("year") >= 2024]
filtered_index = VectorStoreIndex.from_documents(docs_with_filter, vector_store=vector_store)
filtered_engine = filtered_index.as_query_engine(similarity_top_k=5)
filtered_response = filtered_engine.query("内存优化文档")
print(filtered_response)
```

---

### 方案 C：最小化实现（10 行核心逻辑）

> 如果你只想快速验证 RAG 效果，下面是最简版本：

```python
# pip install langchain langchain-openai langchain-chroma tiktoken
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
import tiktoken

# 核心配置
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# 分块
text = open("docs/manual.txt").read()
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64,
                                           length_function=lambda t: len(tiktoken.get_encoding("cl100k_base").encode(t)))
chunks = splitter.split_text(text)

# 向量存储
vectorstore = Chroma.from_texts(chunks, embeddings, collection_name="quick")

# 检索 + 生成
docs = vectorstore.similarity_search("超时配置", k=3)
context = "\n".join(docs)

response = llm.invoke(
    f"基于以下资料回答问题：\n{context}\n\n问题：超时配置"
)
print(response.content)
```

---

### 生产环境增强

以上管线是基础骨架，生产环境还需要：

| 增强项 | 说明 | 推荐方案 |
|--|--|--|
| **增量更新** | 新文档自动追加，不重建整个库 | LangChain `add_texts` / LlamaIndex `insert` |
| **缓存层** | 重复查询直接返回缓存结果 | Redis + query 哈希 |
| **评估系统** | 定期运行 RAGAS 评估 | RAGAS (Recall@K, Faithfulness, Context Precision) |
| **监控** | 记录延迟、成本、错误率 | Prometheus + Grafana |
| **权限** | RBAC 控制文档访问范围 | 元数据过滤 + RBAC |
| **重排序** | 检索后对结果精细排序 | Cohere Rerank / BGE-Reranker |

---

## 附录：技术选型速查表

| 节点 | 推荐方案 | 轻量方案 | 生产方案 |
|------|----------|----------|------|
| 文档加载 | DirectoryLoader | PyPDFLoader | SimpleDirectoryReader + LlamaParse |
| 解析清洗 | 正则 + BeautifulSoup | 基础正则 | LlamaParse 内置清洗 |
| 文本分块 | RecursiveCharacterTextSplitter + tiktoken | Fixed-Size | SemanticChunker |
| 向量化 | OpenAI text-embedding-3-small | BAAI/bge-base | Cohere multilingual-v3 |
| 向量库 | Chroma (开发) | FAISS (速度) | Milvus / pgvector (生产) |
| 检索 | similarity_search | MMR | Hybrid + RRF + Cross-Encoder |
| Prompt | ChatPromptTemplate | f-string | 结构化输出 (Pydantic) |
| LLM | gpt-4o | gpt-4o-mini | gpt-4o + 本地 fallback |
| 引用 | CitationFormatter | 手动 | 自动标注 |

---


---

### 附加：RAG 系统性能维度

#### 响应耗时构成公式

技术人员在跑通代码后，最常问的问题是 **"为什么这么慢？"**。理解延迟构成是优化的前提：

```
总延迟 = 文档解析耗时 (离线) + 向量检索耗时 (在线) + LLM 延迟 (在线)

其中：
┌─────  离线阶段（不影响用户）  ─────┐
│  文档解析耗时: 10ms - 数秒          │  ← 每次文档更新时发生
│  向量化耗时: 100ms - 数秒/篇         │  ← 每次文档更新时发生
│  → 可通过批量处理、异步化优化         │
└───────────────────────────────────┘
┌─────  在线阶段（直接影响用户体验）  ─────┐
│  向量检索耗时: 5 - 50 ms             │  ← 通常 < 50ms，不是瓶颈！
│  LLM 首字出字时间 (TTFT): 200 - 2000ms │  ← 主要瓶颈之一
│  流式生成总时间: 500 - 10000ms        │  ← 取决于回答长度
│  → 总延迟通常 1-15 秒，LLM 推理占 80%+  │
└───────────────────────────────────────┘
```

**各阶段的优化方向**：

| 阶段 | 典型耗时 | 优化手段 | 效果 |
|--|--|--|--|
| 文档解析 (离线) | 10ms ~ 数秒 | 异步化 + 增量更新 | 消除用户等待 |
| 向量化 (离线) | 100ms ~ 数秒/篇 | 批量 + 缓存 + 增量 | 消除用户等待 |
| 向量检索 (在线) | **5-50ms** | 索引调优 (HNSW) | 已有足够快 |
| **LLM TTFT** | 200-2000ms | 换更快模型 / 并发预加载 | **高收益** |
| **LLM 生成** | 500-10000ms | 缩短 Prompt / 并行流 | **高收益** |

**核心结论**：RAG 系统性能的瓶颈**通常不在检索，而在 LLM 的推理速度上**。
优化优先级：**缩短 Prompt 长度 > 选择更快 LLM > 优化索引**。


> **核心原则**：基础 RAG 的每个节点都是链式依赖——前一个节点的质量决定后一个节点的上限。优先优化 **分块** 和 **检索**，它们对最终回答质量的影响最大。
