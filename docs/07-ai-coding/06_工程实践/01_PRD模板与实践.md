# PRD 模板与实践

> **在知识图谱中的位置**：模块六 · 06_工程实践 · 第 1 节
> **难度**：⭐⭐⭐

---

## 1. AI-Optimized PRD 模板

详见：[AI-Optimized PRD for AI Agents](../03_spec_coding/02_AI_Optimized_PRD.md)

---

## 2. PRD 实战建议

### 2.1 PRD 撰写原则

| 原则 | 做法 |
|--|-|
| **具体化** | 不要写"漂亮的 UI"，写"使用 Tailwind CSS，间距 4px" |
| **结构化** | 清晰分节，用列表和表格 |
| **有序** | 明确开发顺序 |
| **可验证** | 每条需求有可验证标准 |
| **面向 Agent** | 写给 AI 读 |

### 2.2 PRD + AI Agent 工作流

```
Step 1: 手写 PRD（AI-Optimized 格式）
Step 2: 将 PRD 粘贴给 AI Agent
Step 3: AI Agent 按 PRD 生成代码
Step 4: 人工审查 + 测试
Step 5: 迭代修改 PRD 或代码
```

---

## 3. 参考资料

- [AI-Optimized PRD: a requirements document for AI agents (thehuman2ai.com)](https://thehuman2ai.com/product/guides/prd/ai-optimized)
- [Behavior-driven prompting: PRD to BDD to living spec (ralphloopsarecool.com)](https://ralphloopsarecool.com/blog/behavior-driven-prompting/)
- [Claude Code Best Practices: 5 Agentic Engineering Techniques (claudefa.st)](https://claudefa.st/blog/guide/development/agentic-engineering-best-practices)
- [How to build reliable AI workflows (GitHub Blog)](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/)
