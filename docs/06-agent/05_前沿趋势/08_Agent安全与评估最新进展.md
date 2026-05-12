# Agent 安全与评估最新进展

> **在知识图谱中的位置**：模块五 · 05_前沿趋势 · 第 8 节
> **难度**：⭐⭐⭐ | **前置知识**：Agent 安全基础

---

## 1. OWASP Agentic AI Top 10（已验证来源）

**来源**：[OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/) [来源: OWASP 报告 v1.1 Dec 2025](https://genai.owasp.org/download/45674/)

### 十大风险

| # | 风险 | 描述 | 严重度 |
|--|-|--|- |
| A01 | 工具滥用 | Agent 调用未授权工具 | 🔴 |
| A02 | 提示注入 | 恶意输入诱导 Agent | 🔴 |
| A03 | 越狱攻击 | 绕过安全限制 | 🔴 |
| A04 | 数据泄露 | 暴露敏感数据 | 🟠 |
| A05 | 幻觉执行 | 基于错误信息执行 | 🟠 |
| A06 | 权限逃逸 | 超出设计权限 | 🟠 |
| A07 | 无限循环/资源耗尽 | Agent 陷入死循环 | 🟡 |
| A08 | 供应链攻击 | 通过工具注入恶意代码 | 🟠 |
| A09 | 审计缺失 | Agent 行为不可追溯 | 🟡 |
| A10 | 伦理与偏见 | 歧视性决策 | 🟡 |

---

## 2. AgentHarm（已验证来源 - ICLR 2025）

**来源**：[AgentHarm (ICLR 2025)](https://proceedings.iclr.cc/paper_files/paper/2025/file/c493d23af93118975cdbc32cbe7323f5-Paper-Conference.pdf)

AgentHarm 是衡量 LLM Agent 有害性的基准，由 UC Berkeley、Columbia 等机构提出，发表于 ICLR 2025。

---

## 3. OpenAgentSafety（已验证来源 - ICLR 2026）

**来源**：[OpenAgentSafety (ICLR 2026)](https://openreview.net/pdf?id=xggSxCFQbA)

由 Carnegie Mellon University、Meta AI、Carnegie Mellon 等机构联合提出。OpenAgentSafety 是一个全面评估真实世界 AI Agent 安全性的框架。

---

## 4. AgentThreatBench

**来源**：[AgentThreatBench (GitHub)](https://github.com/UKGovernmentBEIS/inspect_evals/issues/1031)

UK Government BEIS 的 AgentThreatBench，基于 OWASP Top 10 for Agentic Applications 实现。

---

## 5. OWASP 报告下载

- [State of Agentic AI Security and Governance (OWASP, July 2025)](https://genai.owasp.org/download/50592/)
- [Agentic AI Threats and Mitigations (OWASP v1.1, Dec 2025)](https://genai.owasp.org/download/45674/)

---

## 6. 参考资料

- [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
- [OWASP Agentic AI 报告 v1.1 (Dec 2025)](https://genai.owasp.org/download/45674/)
- [State of Agentic AI Security and Governance (OWASP, July 2025)](https://genai.owasp.org/download/50592/)
- [AgentHarm (ICLR 2025)](https://proceedings.iclr.cc/paper_files/paper/2025/file/c493d23af93118975cdbc32cbe7323f5-Paper-Conference.pdf)
- [OpenAgentSafety (ICLR 2026)](https://openreview.net/pdf?id=xggSxCFQbA)
- [AgentThreatBench (GitHub)](https://github.com/UKGovernmentBEIS/inspect_evals/issues/1031)
- [Part 4: Security Evaluation of Agentic AI Systems (Hugging Face)](https://huggingface.co/blog/royswastik/evaluating-agentic-ai-part-4-security)
