# DSPy 程序化提示

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 5 节
> **难度**：⭐⭐ | **前置知识**：Prompt Engineering

---

## 1. 概述

**DSPy（Delivering State-of-the-Prompt at scale）**是斯坦福大学的提示工程框架，核心理念：**不手写 Prompt，而是用代码声明式定义 Agent 行为，让框架自动优化**。

---

## 2. 核心组件

| 组件 | 功能 |
|--|- |
| **Signature** | 声明输入/输出格式 |
| **Module** | 可组合的 Agent 模块 |
| **Predictor** | 基础预测层 |
| **Optimizer** | 自动优化 Prompt/参数 |

---

## 3. 参考资料

- [DSPy 官方文档](https://dspy.ai/)
- [DSPy GitHub](https://github.com/stanfordnlp/dspy)
- [Choosing an agent framework (Speakeasy)](https://speakeasyapi.dev/blog/ai-agent-framework-comparison)
