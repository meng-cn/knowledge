# Vibe Coding 概述

> **在知识图谱中的位置**：模块二 · 02_vibe_coding · 第 1 节
> **难度**：⭐⭐⭐

---

## 1. 起源

**Vibe Coding** 一词由 **Andrej Karpathy**（OpenAI 联合创始人、Tesla AI 前总监）于 **2025 年 2 月 2 日**在 X 上发帖命名。[来源: Karpathy 命名 (vibe.lab)](https://vibecodelab.app/blog/what-is-vibecoding/)

Karpathy 的帖子将一种新兴编程模式正式命名，迅速成为 2025 年 AI 编程领域最热门的话题。[来源: Vibe Coding 起源 (Orbit.build)](https://www.orbit.build/blog/what-is-vibe-coding)

---

## 2. 概念

**Vibe Coding** 是一种通过自然语言对话与 AI 交互的开发方式：开发者描述项目或任务，LLM 自动生成源码。[来源: Vibe coding (Wikipedia)](https://en.wikipedia.org/wiki/Vibe_coding)

> Vibe Coding: "Make this button bigger. Actually, move it left. No wait, make it a dropdown. Can you add a modal?"
>
> 开发者：通过不断调整描述，让 AI 逐步逼近目标界面。

### 核心特征

| 特征 | 说明 |
|--|-|
| **对话式** | 通过自然语言对话驱动开发 |
| **迭代式** | 不断调整描述，AI 逐步生成 |
| **低门槛** | 不需要深厚编程知识 |
| **快速原型** | 从想法到可运行代码极快 |
| **创意自由** | 开发者专注于设计意图而非代码语法 |

---

## 3. 适用场景

### ✅ 最适合的场景

| 场景 | 理由 |
|--|-|
| 快速原型 / POC | 极速验证想法 |
| MVP 开发 | 从 0 到 1 快速搭建 |
| 创意探索 / 设计迭代 | 通过对话探索 UI/UX |
| 个人项目 / Side Project | 无需团队协作 |
| 非关键业务脚本 | Bug 风险可控 |

### ⚠️ 不太适合的场景

| 场景 | 原因 |
|--|-|
| 生产代码 | 代码质量不可控 |
| 团队协作 | 缺乏明确的规格文档 |
| 复杂系统架构 | 缺乏系统性规划 |
| 长期维护项目 | 代码结构难以理解 |
| 安全敏感系统 | 代码安全审计困难 |

---

## 4. Vibe Coding 的局限

2025 年 7 月，Business Insider 报道指出："Vibe coding is all the rage. But it has limits, forcing companies to impose parameters for its use." Vibe Coding 在企业级应用中遇到瓶颈，许多公司开始对其使用施加限制。[来源: Business Insider](https://www.businessinsider.com/vibe-coding-limits-use-cases-software-companies-airtable-redis-2025-7)

Andrew Ng 也指出 Vibe Coding 是一个"不恰当的术语"（"Unfortunate Term"），他认为 coding with AI 是"深度智力活动"，不应被简化为"凭感觉编程"。[来源: Andrew Ng (Business Insider)](https://www.businessinsider.com/andrew-ng-vibe-coding-unfortunate-term-exhausting-job-2025-6?op=1)

---

## 5. Vibe Coding 的学术定义

| 来源 | 定义 |
|--|-|
| **Vibe coding: programming through conversation with AI (arXiv:2506.23253)** | "Vibe coding 是一种通过与人工智能对话进行编程的方法。Advait Sarkar (Cambridge/UCL) 和 Ian Drosos (Microsoft Research) 提出。" [来源](https://arxiv.org/html/2506.23253v2) |
| **Vibe Coding: Toward an AI-Native Paradigm (arXiv:2510.17842)** | "Recent advances in LLMs have enabled developers to generate software by conversing with AI systems rather than writing code." [来源](https://arxiv.org/pdf/2510.17842) |

---

## 6. Vibe Coding vs Vibe Coding 实践示例

```
开发者: "Build me a SaaS dashboard with auth, a database, and a chart"
AI: [生成一个完整的 React 应用]
开发者: "Make the chart blue and add a date picker"
AI: [修改代码]
开发者: "Add a user management page"
AI: [添加页面]
... (通过对话迭代)
```

---

## 7. 参考资料

- [Vibe coding (Wikipedia)](https://en.wikipedia.org/wiki/Vibe_coding)
- [Vibe coding: programming through conversation with AI (arXiv:2506.23253)](https://arxiv.org/html/2506.23253v2)
- [Vibe Coding: Toward an AI-Native Paradigm (arXiv:2510.17842)](https://arxiv.org/pdf/2510.17842)
- [Karpathy 命名 Vibe Coding (vibe.lab)](https://vibecodelab.app/blog/what-is-vibecoding/)
- [Vibe Coding Origin (Orbit.build)](https://www.orbit.build/blog/what-is-vibe-coding)
- [Andrew Ng: Vibe Coding Is an 'Unfortunate' Term (Business Insider)](https://www.businessinsider.com/andrew-ng-vibe-coding-unfortunate-term-exhausting-job-2025-6?op=1)
- [IBM: What is Vibe Coding?](https://www.ibm.com/think/topics/vibe-coding)
- [Vibe Coding Is the Future. Just Don't Trust It. (Business Insider)](https://www.businessinsider.com/vibe-coding-limits-use-cases-software-companies-airtable-redis-2025-7)
- [What is Vibe Coding and what does it mean for "Real" Coders? (Code Institute)](https://codeinstitute.net/global/blog/what-is-vibe-coding-and-what-does-it-mean-for-real-coders/)
- [Catch the Vibe of Vibe Coding (ACM)](https://cacm.acm.org/news/catching-the-vibe-of-vibe-coding/)
- [From Vibe Coding to Spec-Driven Development (tomkennes.com)](https://tomkennes.com/blog/ai-assisted-coding-2/)
