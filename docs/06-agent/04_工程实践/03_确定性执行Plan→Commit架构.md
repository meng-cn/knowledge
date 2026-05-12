# 确定性执行 Plan→Commit 架构

> **在知识图谱中的位置**：模块四 · 04_工程实践 · 第 3 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 工程化

---

## 1. 核心问题

传统 Agent 的风险：
- 不可预测的输出
- 无法审计的操作
- 不可逆的副作用
- 权限越界

### Plan→Commit 架构

```
Plan→Commit:
用户输入 → LLM(Plan) → 生成操作清单 → 系统(Commit) → 执行 → 结果
                    ↓
            安全护栏 + 幂等保证 + 审计日志
```

**核心理念**：让 LLM 负责 Plan（提出方案），让系统负责 Commit（确定性执行），将模型的不确定性"关进笼子"。[来源: 技术栈 - Receding Horizon Planning and Plan Commitment](https://notes.muthu.co/2026/03/receding-horizon-planning-and-plan-commitment-in-agent-reasoning-loops/)

---

## 2. Planner + Executor Pattern

将 Agent 的规划层和执行层分离，是构建可靠 Agent 的核心架构模式。[来源: Utilia - Planner + Executor Pattern](https://blogs.utilia.dev/planner-executor-pattern-architecting-reliable-agents)

---

## 3. 参考资料

- [Receding Horizon Planning and Plan Commitment in Agent Reasoning Loops](https://notes.muthu.co/2026/03/receding-horizon-planning-and-plan-commitment-in-agent-reasoning-loops/)
- [Planner + Executor Pattern — Architecting Reliable Agents](https://blogs.utilia.dev/planner-executor-pattern-architecting-reliable-agents)
- [Production AI Agent Architecture: Patterns That Actually Ship](https://renezander.com/guides/production-ai-agent-architecture/)
- [Designing Agentic Systems That Don't Collapse in Production](https://koder.ai/blog/designing-agentic-systems-that-dont-collapse-production)
