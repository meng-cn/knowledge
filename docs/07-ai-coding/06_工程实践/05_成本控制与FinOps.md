# 成本控制与 FinOps

> **在知识图谱中的位置**：模块六 · 06_工程实践 · 第 5 节
> **难度**：⭐⭐

---

## 1. AI 编程成本来源

| 成本项 | 说明 | 占比 |
|--|-|--|
| API 调用费 | Cursor/Claude Code 等工具费用 | 50-70% |
| 模型推理费 | 按 Token 计费的 LLM API | 20-30% |
| 基础设施费 | IDE、服务器等 | 10-15% |

---

## 2. 成本优化策略

### 策略一：模型分层

```
简单任务 → GPT-4o-mini / Claude Haiku ($0.15-0.50/1M tokens)
中等任务 → Claude Sonnet / GPT-4o ($3-15/1M tokens)
复杂任务 → Claude Opus / GPT-4.5 ($15-60/1M tokens)
```

### 策略二：缓存

- 使用工具的缓存功能
- 重复请求避免重新调用
- 减少 Token 消耗

### 策略三：减少迭代

- 写好 PRD，减少反复修改
- 用 Spec 驱动，减少 Vibe 式迭代

### 策略四：本地模型

- 对敏感数据使用本地小模型
- 减少对 API 的依赖

---

## 3. 成本监控

- 定期查看 API 使用量
- 设置月度预算告警
- 分析每任务的 Token 消耗
- 识别高成本任务模式

---

## 4. 参考资料

- [AI Agent Cost Optimization: Strategies for Keeping Production Costs Under Control](https://callsphere.ai/blog/ai-agent-cost-optimization-strategies-production.md)
- [AI Agent Cost Optimization: Token Budgets, Model Routing, and Production FinOps (Zylos)](https://zylos.ai/research/2026-04-12-ai-agent-cost-optimization-token-budget-model-routing)
