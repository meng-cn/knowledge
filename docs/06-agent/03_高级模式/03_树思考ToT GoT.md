# 树思考 ToT/GoT

> **在知识图谱中的位置**：模块三 · 03_高级模式 · 第 3 节
> **难度**：⭐⭐ | **前置知识**：ReAct 模式

---

## 1. 概述

**ToT（Tree of Thought）**将 LLM 的推理从线性扩展为树状结构。每个节点是一个「思考」，LLM 评估每个分支的质量，选择最有希望的分支继续。

**GoT（Graph of Thought）**进一步将树扩展为图，允许思考之间交叉引用。

### ToT vs CoT vs ReAct

```
CoT:    A → B → C → D  （线性推理）
ToT:    A → [B C D] → E → F  （树状分支）
GoT:    A ↔ B ↔ C ↔ D  （图状交叉）
ReAct:  推理 → 行动 → 观察 → 推理  （交替）
```

---

## 2. 参考资料

- [ReAct、Plan-and-Execute、Reflection、Multi-Agent 工程范式](https://gitcode.csdn.net/69c1ee540a2f6a37c599e1e8.html)
