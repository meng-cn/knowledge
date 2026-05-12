# 树思考 ToT/GoT

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 3 节
> **难度**：⭐⭐ | **前置知识**：ReAct 模式

---

## 1. 概述

**ToT（Tree of Thought，树思考）**由 Yao et al. (2023) 提出，将 LLM 的推理从线性扩展为树状结构。每个节点是一个「思考」，LLM 评估每个分支的质量，选择最有希望的分支继续。

**GoT（Graph of Thought，图思考）**进一步将树扩展为图，允许思考之间交叉引用。

---

## 2. 核心概念

### 2.1 ToT vs CoT vs ReAct

```
CoT:    A → B → C → D  （线性推理）
ToT:    A → [B C D] → E → F  （树状分支）
GoT:    A ↔ B ↔ C ↔ D  （图状交叉）
ReAct:  推理 → 行动 → 观察 → 推理  （交替）
```

### 2.2 ToT 三个核心操作

| 操作 | 说明 | 示例 |
|------|------|------|
| **Generator** | 生成候选思考 | "问题有 3 种解法" |
| **Evaluator** | 评估每个思考的质量 | "方案 A 概率 0.8" |
| **State** | 维护搜索状态 | "当前最佳方案 A" |

---

## 3. 技术原理

### 3.1 ToT 搜索策略

```
根节点
├── 分支 A (评分 0.8) → 分支 A1, A2, A3
│   ├── A1 (0.9) ← 最优
│   ├── A2 (0.6)
│   └── A3 (0.7)
├── 分支 B (评分 0.5)
└── 分支 C (评分 0.6)
```

**搜索算法**：广度优先 / 深度优先 / Monte Carlo Tree Search

### 3.2 ToT 实现

```python
from to_text import TreeOfThought

tot = TreeOfThought(
    llm=ChatOpenAI(model="gpt-4o"),
    branching_factor=3,  # 每层 3 个分支
    depth=5,             # 最大深度
    evaluator=evaluate,  # 评估函数
)

result = tot.solve("复杂的数学问题")
print(result.best_path)  # 最优路径
```

---

## 4. 实践指南

### 4.1 ToT 适用场景
- 复杂决策（需要多路径探索）
- 创意写作（多版本对比）
- 数学证明（多方法尝试）

### 4.2 常见陷阱

| 陷阱 | 解法 |
|------|------|
| 分支爆炸 | 限制 branching_factor |
| 评估不准 | 用多个评估器 |
| 成本过高 | 用剪枝策略 |

---

## 5. 参考资料

- [ToT 论文](https://arxiv.org/abs/2305.10601)
- [GoT 论文](https://arxiv.org/abs/2305.09096)
