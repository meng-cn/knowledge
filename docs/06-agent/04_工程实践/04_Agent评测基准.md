# Agent 评测基准

> **在知识图谱中的位置**：模块四 · 04_工程实践 · 第 4 节
> **难度**：⭐⭐ | **前置知识**：Agent 基础

---

## 1. 主流评测基准

### AgentHarm (ICLR 2025)

AgentHarm 是衡量 LLM Agent 有害性的基准，发表于 ICLR 2025。[来源: AgentHarm (ICLR 2025)](https://proceedings.iclr.cc/paper_files/paper/2025/file/c493d23af93118975cdbc32cbe7323f5-Paper-Conference.pdf)

### OpenAgentSafety (ICLR 2026)

OpenAgentSafety 是全面评估真实世界 AI Agent 安全的框架，发表于 ICLR 2026，由 Carnegie Mellon 等机构提出。[来源: OpenAgentSafety (ICLR 2026)](https://openreview.net/pdf?id=xggSxCFQbA)

### AgentThreatBench

UK Government BEIS 的 AgentThreatBench，基于 OWASP Top 10 for Agentic Applications 实现。[来源: AgentThreatBench (GitHub)](https://github.com/UKGovernmentBEIS/inspect_evals/issues/1031)

### AgentBench

通用 Agent 评测基准，测试多轮任务完成度。[来源: AgentBench](https://github.com/THUDM/AgentBench)

---

## 2. OWASP Agentic AI Top 10（已验证来源）

OWASP 发布了针对 Agentic Applications 的 Top 10 安全风险标准。[来源: OWASP GenAI](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)

**十大风险**：
1. 工具滥用（Tool Abuse）
2. 提示注入（Prompt Injection）
3. 越狱攻击（Jailbreak）
4. 数据泄露（Data Exfiltration）
5. 幻觉执行（Hallucinated Actions）
6. 权限逃逸（Privilege Escalation）
7. 无限循环/资源耗尽
8. 供应链攻击
9. 审计缺失
10. 伦理与偏见

[来源: OWASP Agentic AI 报告 (v1.1, Dec 2025)](https://genai.owasp.org/download/45674/)

---

## 3. 参考资料

- [AgentHarm (ICLR 2025)](https://proceedings.iclr.cc/paper_files/paper/2025/file/c493d23af93118975cdbc32cbe7323f5-Paper-Conference.pdf)
- [OpenAgentSafety (ICLR 2026)](https://openreview.net/pdf?id=xggSxCFQbA)
- [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
- [OWASP Agentic AI 报告](https://genai.owasp.org/download/45674/)
- [AgentThreatBench (GitHub)](https://github.com/UKGovernmentBEIS/inspect_evals/issues/1031)
- [AgentBench](https://github.com/THUDM/AgentBench)
- [Part 4: Security Evaluation of Agentic AI Systems (Hugging Face)](https://huggingface.co/blog/royswastik/evaluating-agentic-ai-part-4-security)
