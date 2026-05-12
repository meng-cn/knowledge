# DSPy 程序化提示

> **在知识图谱中的位置**：模块二 · 02_核心框架 · 第 5 节
> **难度**：⭐⭐ | **前置知识**：Prompt Engineering

---

## 1. 概述

**DSPy（Delivering State-of-the-Prompt at scale）**是斯坦福大学的提示工程框架，核心理念：**不手写 Prompt，而是用代码声明式定义 Agent 行为，让框架自动优化**。

传统 Prompt Engineering：手写 Prompt → 手动调优 → 效果不确定  
DSPy：声明行为 → 自动优化 → 效果可复现

---

## 2. 核心概念

### 2.1 DSPy 的核心组件

| 组件 | 功能 |
|------|------|
| **Signature** | 声明输入/输出格式 |
| **Module** | 可组合的 Agent 模块 |
| **Predictor** | 基础预测层 |
| **Optimizer** | 自动优化 Prompt/参数 |

### 2.2 声明式编程范式

```
传统: 手写 Prompt → 调参 → 试错
DSPy: 声明签名 → 编译器优化 → 确定结果
```

---

## 3. 技术原理

### 3.1 核心示例

```python
import dspy

# 1. 声明输入/输出签名
class QA(dspy.Signature):
    """给一个问题和一段上下文，生成答案"""
    context: str = dspy.InputField()
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()

# 2. 创建模块（声明式，不写 Prompt）
predict = dspy.Predict(QA)

# 3. 使用（自动优化 Prompt）
result = predict(
    context="AI Agent 是自主决策的...",
    question="什么是 AI Agent?"
)
print(result.answer)

# 4. 优化（自动调 Prompt）
from dspy.teleprompt import BootstrapFewShot

teleprompter = BootstrapFewShot(metric=accuracy_metric)
optimized_predict = teleprompter.compile(predict, trainset=train_data)
```

### 3.2 DSPy 与 Agent 的结合

```python
# 声明 Agent 的行为（不写 Prompt）
class AgentWorkflow(dspy.Signature):
    """分析用户请求并返回行动"""
    user_input: str = dspy.InputField()
    analysis: str = dspy.OutputField()
    action: str = dspy.OutputField()
    parameters: dict = dspy.OutputField()

agent = dspy.Predict(AgentWorkflow)

# Agent 自动优化内部 Prompt
response = agent(user_input="北京天气并订餐厅")
print(response.analysis)    # "用户需要天气查询和订餐"
print(response.action)      # "multi_tool_call"
print(response.parameters)  # {"tools": [...]}
```

---

## 4. 实践指南

### 4.1 最佳实践

1. **签名要精确** — DSPy 靠签名生成优化
2. **用 BootstrapFewShot** — 最实用的优化器
3. **评估要量化** — metric 决定优化方向
4. **迭代优化** — 多次 compile 效果更好

### 4.2 常见陷阱

| 陷阱 | 解法 |
|------|------|
| 签名太模糊 | 加更多描述 |
| 训练数据不足 | 至少 20-50 条 |
| metric 不合理 | 选准确指标 |
| 过度优化 | 加 validation set |

---

## 5. 参考资料

- [DSPy 官方文档](https://dspy.ai/)
- [DSPy GitHub](https://github.com/stanfordnlp/dspy)
- [DSPy 论文](https://arxiv.org/abs/2310.03714)

---

## 6. 学习路径

1. **Level 1** — 理解签名式声明
2. **Level 2** — 用 BootstrapFewShot 优化
3. **Level 3** — 实现 Agent 签名
4. **Level 4** — DSPy + Agent 框架组合
5. **Level 5** — 理解优化算法原理
