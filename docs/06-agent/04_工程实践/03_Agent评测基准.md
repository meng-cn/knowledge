# Agent 评测基准

> **在知识图谱中的位置**：模块四 · 04_工程实践 · 第 3 节
> **难度**：⭐⭐ | **前置知识**：Agent 基础

---

## 1. 概述

Agent 评测是生产部署的必经之路。不同于传统 LLM 评测（静态基准），Agent 评测需要评估**动态交互能力**。

---

## 2. 评测维度

### 2.1 Agent 评测的 5 个维度

| 维度 | 说明 | 测试方法 |
|------|------|------|
| **任务完成度** | 是否完成目标 | 手动/自动评估 |
| **工具调用准确率** | 工具选择是否正确 | 与期望工具对比 |
| **推理质量** | 推理过程是否合理 | LLM-as-judge |
| **效率** | Token 消耗/迭代次数 | 计数器 |
| **安全性** | 是否触发安全护栏 | 红队测试 |

### 2.2 AgentBench 评测框架

AgentBench 是权威的 Agent 评测基准：

| 子集 | 测试内容 |
|------|------|
| **eval** | 多轮任务完成度 |
| **tools** | 工具调用准确性 |
| **simulator** | Agent 模拟环境 |
| **browser** | 浏览器操作能力 |

---

## 3. 评测实现

### 3.1 自动化评测脚本

```python
import json

def evaluate_agent(agent, test_cases):
    results = []
    for tc in test_cases:
        result = agent.run(tc["input"])
        
        eval = {
            "input": tc["input"],
            "expected": tc["expected_output"],
            "actual": result,
            "task_complete": check_task_completion(tc["expected_output"], result),
            "tools_used": extract_tools(result),
            "tokens_used": count_tokens(result),
            "iterations": count_iterations(result),
            "correct_tool": verify_tools(tc["expected_tools"], result),
        }
        results.append(eval)
    
    return {
        "completion_rate": sum(1 for r in results if r["task_complete"]) / len(results),
        "tool_accuracy": sum(1 for r in results if r["correct_tool"]) / len(results),
        "avg_tokens": sum(r["tokens_used"] for r in results) / len(results),
    }

def check_task_completion(expected, actual):
    # 自动/手动判断任务是否完成
    return expected.lower() in actual.lower()
```

### 3.2 LLM-as-Judge

```python
def llm_as_judge(question, agent_output, llm="gpt-4o"):
    """用 LLM 评估 Agent 输出质量"""
    prompt = f"""
    评估以下 Agent 回答的质量（1-5分）:
    问题: {question}
    Agent 回答: {agent_output}
    
    评分标准:
    5 - 完全正确，信息丰富
    4 - 基本正确，缺少细节
    3 - 部分正确，有错误
    2 - 大部分错误
    1 - 完全错误
    """
    response = client.chat.completions.create(model=llm, messages=[{"role": "user", "content": prompt}])
    return int(response.choices[0].message.content.strip())
```

---

## 4. 参考资料

- [AgentBench 评测框架](https://github.com/THUDM/AgentBench)
- [Awesome-Agent-Eval](https://github.com/awesome-agent-eval)
