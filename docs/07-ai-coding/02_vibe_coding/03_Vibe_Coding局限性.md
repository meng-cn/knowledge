# Vibe Coding 局限性

> **在知识图谱中的位置**：模块二 · 02_vibe_coding · 第 3 节
> **难度**：⭐⭐

---

## 1. 核心局限

### 局限一：代码质量不可控

- AI 生成的代码可能有隐蔽 Bug
- 缺乏系统性架构设计
- 代码风格不一致

### 局限二：缺乏可追溯性

- 没有文档记录为什么这样设计
- 后续维护者难以理解
- 无法追溯需求到代码的映射

### 局限三：难以扩展

- 随着项目增长，对话上下文爆炸
- AI 难以理解完整代码库
- 新功能与旧代码冲突

### 局限四：安全风险

- AI 可能生成不安全的代码
- 没有安全审计
- 依赖的第三方库可能有漏洞

### 局限五：不适合生产

- 代码可能无法通过生产质量审查
- 缺乏错误处理
- 缺乏性能优化

---

## 2. 何时不适合 Vibe Coding

| 场景 | 原因 |
|--|-|
| 生产代码 | 代码质量和安全不可控 |
| 团队协作 | 缺乏明确规格 |
| 复杂业务逻辑 | AI 难以理解业务上下文 |
| 长期维护项目 | 缺乏可追溯性 |
| 安全敏感系统 | 无法保证安全 |
| 合规要求行业 | 需要文档审计 |

---

## 3. Vibe Coding 的进化：从 Vibe 到 Spec

Tom Kennes 记录了从 Vibe Coding 转向 Spec-Driven Development 的经验：Vibe Coding 在特征 #5 时遇到了瓶颈（20,000 行 Swift 代码，61 次发布），最终转向了 Spec-Driven Development。[来源: Tom Kennes](https://tomkennes.com/blog/ai-assisted-coding-2/)

---

## 4. 参考资料

- [Vibe Coding Is the Future. Just Don't Trust It. (Business Insider)](https://www.businessinsider.com/vibe-coding-limits-use-cases-software-companies-airtable-redis-2025-7)
- [From Vibe Coding to Spec-Driven Development (tomkennes.com)](https://tomkennes.com/blog/ai-assisted-coding-2/)
- [Specification-Driven Development (pockit.tools)](https://pockit.tools/blog/specification-driven-development-ai-coding-agents-complete-guide/)
