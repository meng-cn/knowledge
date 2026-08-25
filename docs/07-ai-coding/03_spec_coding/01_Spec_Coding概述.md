# Spec-Driven Development (Spec Coding) 概述

> **在知识图谱中的位置**：模块三 · 03_spec_coding · 第 1 节
> **难度**：⭐⭐⭐

---

## 1. 概念

**Spec-Driven Development (SDD)** 是一种先编写详细规格文档（PRD），再由 AI 按规格生成代码的开发方式。它是 Vibe Coding 的对照范式。

### SDD vs Vibe Coding 核心对比

```
Vibe Coding:    对话 → AI 生成代码 → 迭代调整
Spec Coding:    PRD (详细规格) → AI 按规格生成代码 → 验证

Vibe: 灵活但不可控
Spec: 规范但高效
```

---

## 2. Spec-Driven Development 的核心模式

### 模式一：PRD-First

1. 编写详细的 PRD（包含技术栈、API、Schema、文件结构）
2. 将 PRD 作为提示输入给 AI Agent
3. AI Agent 按 PRD 生成代码
4. 人工审查 + 修改

### 模式二：BDD + Spec

1. 将需求转化为 Behavior-Driven Development (BDD) 格式
2. 用 BDD 的 Given/When/Then 作为 Prompt
3. AI 生成测试和实现代码

### 模式三：Living Spec

1. PRD 不是静态文档，而是持续更新的"活文档"
2. 随着开发进展，PRD 更新
3. AI Agent 根据最新 PRD 重新生成代码

---

## 3. Spec-Driven Development 的优势

| 优势 | 说明 |
|--|-|
| **可预测性** | 代码完全按规格生成 |
| **可测试性** | 规格即测试标准 |
| **可追溯性** | 需求到代码的映射清晰 |
| **团队协作** | PRD 作为对齐工具 |
| **生产就绪** | 代码经过规格验证 |

---

## 4. Spec-Driven Development 的适用场景

| 场景 | 适合度 |
|--|-|
| 生产代码 | ⭐⭐⭐⭐⭐ |
| 团队协作 | ⭐⭐⭐⭐⭐ |
| 复杂系统架构 | ⭐⭐⭐⭐⭐ |
| 长期维护项目 | ⭐⭐⭐⭐⭐ |
| 安全敏感系统 | ⭐⭐⭐⭐⭐ |
| 快速原型 | ⭐⭐⭐ |
| 个人项目 | ⭐⭐⭐ |

---

## 5. 参考资料

- [Vibe Coding vs Spec-Driven Development (Augment Code)](https://www.augmentcode.com/guides/vibe-coding-vs-spec-driven-development)
- [Spec-Driven Development vs. Vibe Coding (zencoder.ai)](https://zencoder.ai/blog/spec-driven-development-vs-vibe-coding)
- [Specification-Driven Development (pockit.tools)](https://pockit.tools/blog/specification-driven-development-ai-coding-agents-complete-guide/)
- [Master AI in Software Engineering: Vibe vs. Spec Coding (bradjolicoeur.com)](https://www.bradjolicoeur.com/article/ai-software-engineering-vibe-spec-prompting)
- [Spec-Driven Development: Stop Vibe Coding, Ship Real Code (appxlab.io)](https://blog.appxlab.io/2026/03/27/spec-driven-development-ai-coding/)
- [Spec-Driven Development with AI Coding Agents (javacodegeeks.com)](https://www.javacodegeeks.com/2026/03/spec-driven-developmentwith-ai-coding-agents-the-workflow-replacingprompt-and-pray.html)
