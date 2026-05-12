# Agent 的经济性分析

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 6 节
> **难度**：⭐⭐ | **前置知识**：Agent 基础

---

## 1. 概述

**构建大规模 Agent 系统的经济性**是当前工业界的重大挑战。根据 Zylos Research 的报告，2025 年上半年企业 LLM 支出达到 84 亿美元，近 40% 的企业每年在语言模型上的花费超过 25 万美元。[来源: Zylos Research - AI Agent Cost Optimization](https://zylos.ai/research/2026-04-12-ai-agent-cost-optimization-token-budget-model-routing)

Agent 单次用户请求可能触发 planning、tool selection、execution 等多步 LLM 调用，成本远超简单 chatbot。[来源: AI Agent Knowledge Base - Agent Cost Optimization](https://agentwiki.org/agent_cost_optimization)

---

## 2. 成本结构分析

### 2.1 典型 Agent 系统成本分布

```
典型 Agent 系统成本构成:
┌──────────────────────────────┐
│        Agent 系统成本构成      │
│                              │
│  LLM API 调用:    ████████░░ 70% |
│  工具调用/基础设施: ███░░░░░░░ 20% |
│  存储/监控/其他:   ██░░░░░░░░ 10% |
│                              │
│  其中每轮成本 = tokens × 单价  │
└──────────────────────────────┘
```

### 2.2 各模型每百万 Token 成本（2025-2026 参考）

| 模型 | 输入 | 输出 | 适用场景 | 每轮成本（2K in + 1K out） |
|--|-|--|-|--|- |
| **GPT-4o-mini** | $0.15 | $0.60 | 简单任务 | ~$0.0003 |
| **GPT-4o** | $2.50 | $10.00 | 通用任务 | ~$0.005 |
| **Claude 3.5 Haiku** | $0.25 | $1.25 | 简单任务 | ~$0.0005 |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | 中等任务 | ~$0.003 |
| **Claude 3.5 Opus** | $15.00 | $75.00 | 复杂推理 | ~$0.015 |
| **DeepSeek-R1** | $0.50 | $2.00 | 开源替代 | ~$0.0006 |
| **本地 Llama 3.1** | $0.00 | $0.00 | 自部署 | 仅 GPU 成本 |

---

## 3. 成本优化策略

### 3.1 模型分层策略（Model Routing）

```
按任务复杂度分层:
┌──────────────────────────┐
│     模型分层架构          │
│                          │
│ L1（简单）→ GPT-4o-mini │  60-70% 的任务
│ L2（中等）→ Claude Sonnet│  20-30% 的任务
│ L3（复杂）→ GPT-4.5     │  5-10% 的任务
│ L4（推理）→ Claude Opus  │  <5% 的任务
│                          │
│ 成本降低: 70-80%        │
└──────────────────────────┘
```

OptyxStack 指出："最安全的低成本方案不是处处使用最小模型，而是在该特定场景下仍然能保证结果正确性的最小模型。"[来源: OptyxStack - Model Routing for Cost Control](https://optyxstack.com/cost-optimization/model-routing-for-cost-control-when-to-use-small-large-or-fallback-models)

### 3.2 缓存策略

根据 AgentWiki，缓存是 Agent 成本优化中 ROI 最高的手段，可消除 20-45% 的 API 调用。[来源: AgentWiki - Caching Strategies for Agents](https://agentwiki.org/caching_strategies_for_agents)

| 策略 | 说明 | 节省 |
|--|-|--|- |
| **结果缓存** | 相同输入直接返回 | 100% |
| **语义缓存** | 相似输入使用缓存 | 30-50% |
| **Token 压缩** | 摘要历史减少输入 | 50-80% |

### 3.3 小模型 vs 垂直模型 vs 通用大模型

| 策略 | 成本/1M tokens | 能力保留 | 适用场景 |
|--|-|--|- |
| **通用大模型** | $2.50-20 | 100% | 通用任务 |
| **垂直小模型** | $0.00-0.20 | 85-95% | 特定领域 |
| **知识蒸馏** | $0.00-0.05 | 80-90% | 大规模部署 |
| **混合模型** | $0.30-1.00 | 90-95% | 分层架构 |

### 3.4 Few-shot 提示优化

Few-shot learning 可在保持同等效果的同时减少 20-40% 的 token 消耗。[来源: AI Cost Optimization (AIToolsBusiness)](https://aitoolsbusiness.com/ai-cost-optimization/)

### 3.5 Prompt 缓存

企业环境中，prompt caching（复用系统 prompt 的 KV cache）可大幅降低重复请求成本。[来源: Inductivee - LLM Cost Optimization](https://inductivee.com/blog/enterprise-llm-cost-optimization)

---

## 4. ROI 优化目标

| 目标 | 策略 | 预期节省 |
|--|-|--|- |
| **降低单次成本** | 模型分层 + 缓存 | 70-80% |
| **提高任务完成率** | 垂直模型 + 提示优化 | 10-20% |
| **减少人力投入** | 自动化评测 + 监控 | 50-70% |
| **提高频率** | 批量处理 + 异步 | 30-50% |

### 典型场景成本估算

| 场景 | 月调用量 | 每轮成本 | 月成本 |
|--|-|--|- |
| **个人 Agent** | 10K/月 × 1K tokens | $0.0005 | ~$5 |
| **小团队** | 100K/月 × 2K tokens | $0.003 | ~$300 |
| **中型企业** | 1M/月 × 3K tokens | $0.005 | ~$5,000 |
| **大型企业** | 10M/月 × 5K tokens | $0.008 | ~$40,000 |
| **优化后（企业）** | 10M/月 × 5K tokens | $0.001 | ~$5,000 |
| **优化后（垂直模型）** | 10M/月 × 5K tokens | $0.0001 | ~$500 |

---

## 5. 最佳实践 Checklist

- [ ] **模型分层** — 按任务复杂度选择不同模型
- [ ] **缓存优先** — 相同输入不重复调用
- [ ] **垂直模型** — 特定领域用垂直微调模型
- [ ] **提示优化** — 精简提示词，用 Few-shot
- [ ] **异步批量** — 合并相同任务
- [ ] **成本监控** — 实时追踪每轮成本
- [ ] **定期审计** — 每月分析成本构成

---

## 6. 参考资料

- [AI Agent Cost Optimization: Strategies for Keeping Production Costs Under Control](https://callsphere.ai/blog/ai-agent-cost-optimization-strategies-production.md)
- [AI Agent Cost Optimization: Token Budgets, Model Routing, and Production FinOps (Zylos)](https://zylos.ai/research/2026-04-12-ai-agent-cost-optimization-token-budget-model-routing)
- [Model Routing for Cost Control (OptyxStack)](https://optyxstack.com/cost-optimization/model-routing-for-cost-control-when-to-use-small-large-or-fallback-models)
- [AI Agent Model Routing and Dynamic Model Selection (Zylos)](https://zylos.ai/research/2026-03-02-ai-agent-model-routing)
- [Reducing AI Agent Inference Costs (Harness Engineering)](https://harnessengineering.academy/blog/reducing-ai-agent-inference-costs-caching-strategies-model-routing-and-token-optimization-techniques/)
- [Agent Cost Optimization (AgentWiki)](https://agentwiki.org/agent_cost_optimization)
- [Caching Strategies for Agents (AgentWiki)](https://agentwiki.org/caching_strategies_for_agents)
- [AI Cost Optimization: Caching, Batching, Smaller Models](https://aitoolsbusiness.com/ai-cost-optimization/)
- [The pricing implications of model routing and fallback logic](https://www.agenticaipricing.com/the-pricing-implications-of-model-routing-and-fallback-logic/)
