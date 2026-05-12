# 端到端 Agent 训练

> **在知识图谱中的位置**：模块五 · 05_前沿趋势 · 第 2 节
> **难度**：⭐⭐⭐ | **前置知识**：RLHF/RL

---

## 1. 概述

**端到端 Agent 训练**是指直接训练 LLM 成为 Agent，而非通过 Prompt Engineering。代表技术：RLHF → DPO → GRPO → 端到端 Agent 训练。

---

## 2. 技术演进

| 技术 | 时间 | 核心 |
|--|-|--|
| RLHF | 2022 | 人类偏好训练 |
| DPO | 2023 | 直接偏好优化 |
| GRPO | 2024 | Group Relative Policy Optimization |
| AgentPRM | 2025 | Agent Process Reward Models |
| AgentFly | 2025 | Fine-tuning LLM Agents without Fine-tuning LLMs |

### Process Reward Models for LLM Agents (AgentPRM)
AgentPRM 是一种可扩展的 Agent 过程奖励模型。[来源: AgentPRM (arXiv:2502.10325)](https://arxiv.org/html/2502.10325)

### AgentFly: Fine-tuning LLM Agents without Fine-tuning LLMs
华为 Noah's Ark Lab 与 UCL 提出 AgentFly，在不微调 LLM 的前提下 fine-tuning Agent。[来源: AgentFly (arXiv:2508.16153)](https://arxiv.org/html/2508.16153v1)

---

## 3. 参考资料

- [Process Reward Models for LLM Agents (AgentPRM)](https://arxiv.org/html/2502.10325)
- [AgentFly: Fine-tuning LLM Agents without Fine-tuning LLMs](https://arxiv.org/html/2508.16153v1)
- [2025 Agent 综述 | 55页长文系统梳理](https://cj.sina.com.cn/articles/view/7857201856/1d45362c001902swcu)
