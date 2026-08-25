# AI-Optimized PRD

> **在知识图谱中的位置**：模块一 · 01_基础概念 · 第 3 节
> **难度**：⭐⭐⭐

---

## 1. 概述

**AI-Optimized PRD** 是专为 AI Agent（Cursor、Claude Code 等）阅读优化的需求文档格式。在 2026 年，PRD 不仅要给人看，还要给 AI Agent 执行。

---

## 2. AI-Optimized PRD 核心要素

### 2.1 文档结构

```markdown
# 项目名称
## 概述
一句话描述这个功能/项目是什么。

## 技术栈
- 前端：...
- 后端：...
- 数据库：...

## 核心功能
1. 功能 A
2. 功能 B
3. 功能 C

## API 设计
- GET /api/users
- POST /api/users

## 数据库 Schema
```sql
CREATE TABLE users ...
```

## 文件结构
```
src/
├── components/
├── api/
└── ...
```

## 开发顺序
1. 先实现 API
2. 再实现前端组件
3. 最后联调

## 验收标准
- [ ] 功能 A 完成
- [ ] 功能 B 完成
- [ ] 测试覆盖率 > 80%
```

### 2.2 关键原则

| 原则 | 说明 |
|--|-|
| **结构化** | 用清晰的分节和列表 |
| **具体** | 避免模糊描述，给具体技术选型 |
| **有序** | 明确开发顺序 |
| **可验证** | 每条需求有可验证的标准 |
| **面向 Agent** | 写给 AI 读，不是给人读 |

---

## 3. 参考资料

- [AI-Optimized PRD: a requirements document for AI agents (thehuman2ai.com)](https://thehuman2ai.com/product/guides/prd/ai-optimized)
- [Behavior-driven prompting: PRD to BDD to living spec (ralphloopsarecool.com)](https://ralphloopsarecool.com/blog/behavior-driven-prompting/)
- [Claude Code Best Practices: 5 Agentic Engineering Techniques (claudefa.st)](https://claudefa.st/blog/guide/development/agentic-engineering-best-practices)
