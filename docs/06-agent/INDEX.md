# AI Agent 知识图谱 🗺️

> 🎯 目标：面试准备 + 系统进阶学习，从 LLM 对话到自主智能体的技术跃迁
> 📅 版本：v1.0 | 📅 创建：2026-05-12
> 📊 状态：初版生成

---

## 🗺️ 知识地图总览

```
┌───────────────────────────────────────────────────────────────┐
│                    AI Agent 知识体系                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  一、大脑层（LLM 与决策）                                     │
│  ┌────┬───┬───┬───┐                                         │
│  │ 模型│推理│路由│微调│                                         │
│  └────┴───┴───┴───┘                                         │
│                                                               │
│  二、记忆层（存储与检索）                                       │
│  ┌────┬───┬───┬───┐                                         │
│  │短期│长期│MAGMA│遗忘│                                         │
│  └────┴───┴───┴───┘                                         │
│                                                               │
│  三、工具层（调用与编排）                                       │
│  ┌────┬───┬───┬───┐                                         │
│  │FC  │MCP │API │Browser│                                    │
│  └────┴───┴───┴───┘                                         │
│                                                               │
│  四、规划层（拆解与执行）                                       │
│  ┌────┬───┬───┬───┐                                         │
│  │ReAct│Reflexion│ToT│Agent-X│                               │
│  └────┴──────┴───┴───┘                                         │
│                                                               │
│  五、多代理协作                                                  │
│  ┌────┬───┬───┬───┐                                         │
│  │Swarm│Crew│AutoGen│MetaGPT│                                │
│  └────┴───┴───┴───┘                                         │
│                                                               │
│  六、框架与平台                                                  │
│  ┌────┬───┬───┬───┐                                         │
│  │Lang│LLM│OASDK│DSPy │                                    │
│  └────┴───┴───┴───┘                                         │
│                                                               │
│  七、评估与安全                                                  │
│  ┌────┬───┬───┐                                           │
│  │评测│安全│HITL │                                           │
│  └────┴───┴───┘                                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📖 知识模块目录

### 模块一：AI Agent 基础概念 ⭐⭐⭐
**Agent 是什么 — 核心定义、四模块架构、与 LLM 的本质区别**
```
01_基础概念/
├── 01_Agent 定义与核心架构.md       # 大脑/记忆/规划/行动
├── 02_LLM 与 Agent 的关系.md        # 从对话到行动
├── 03_Function Calling 详解.md      # 结构化输出与工具调用
├── 04_MCP 协议详解.md               # 工具连接标准
├── 05_核心技术选型指南.md             # 模型/框架/工具链
└── README.md
```

### 模块二：核心框架与生态 ⭐⭐⭐
**Agent 开发框架全览 — LangChain/LangGraph、LlamaIndex、OpenAI Agents SDK**
```
02_核心框架/
├── 01_LangChain 全解析.md           # 链/代理/记忆/工具
├── 02_LangGraph 有向图编排.md       # 状态机/循环/分支
├── 03_LlamaIndex 检索优先.md         # 索引/查询/知识库
├── 04_OpenAI Agents SDK.md         # 官方 SDK / 多Agent
├── 05_DSPy 程序化提示.md            # 声明式 Agent
├── 06_Pydantic AI.md                # Python 原生
├── 07_其他框架速览.md                # CrewAI / AutoGen / Phidata
└── README.md
```

### 模块三：高级模式与模式 ⭐⭐
**ReAct / Reflexion / ToT / 多Agent / 自进化 — Agent 的高级能力**
```
03_高级模式/
├── 01_ReAct 模式.md                 # Reasoning + Acting
├── 02_Reflexion 反思机制.md          # 自我评估与改进
├── 03_树思考 ToT GoT.md             # 树状/图状推理
├── 04_多Agent协作架构.md             # Swarm/CrewAI/AutoGen
├── 05_Memory 记忆架构.md            # 短期/长期/MAGMA
├── 06_Agent 编排模式.md              # LLM决策 / 代码编排
├── 07_HITL 人在回路.md              # 人工干预
└── README.md
```

### 模块四：工程实践与落地 ⭐⭐
**生产级 Agent — 部署、监控、成本优化、安全对齐、评测**
```
04_工程实践/
├── 01_Agent 工程化架构.md            # 生产级设计模式
├── 02_成本优化策略.md                # Token 管理 / 模型路由
├── 03_Agent 评测基准.md             # AgentBench / 自建评测
├── 04_安全对齐与护栏.md              # 内容安全 / 越狱防御
├── 05_监控与可观测性.md              # 日志 / 指标 / 追踪
├── 06_部署架构.md                    # Serverless / Edge / Docker
└── README.md
```

### 模块五：前沿趋势 ⭐
**LLM-as-Agent / 自进化 / 端到端 / Agent 操作系统**
```
05_前沿趋势/
├── 01_LLM_as_Agent.md              # 模型即 Agent，无需框架
├── 02_端到端 Agent 训练.md           # 强化学习 / RLHF / GRPO
├── 03_Agent 操作系统.md              # 未来操作系统形态
├── 04_自进化 Agent.md               # 自动改进 / 自我修正
├── 05_多模态 Agent.md               # 视觉 / 音频 / 视频
├── 06_垂直行业应用.md                # 金融/医疗/教育/代码
└── README.md
```

---

## 🎓 学习路径建议

### 初级（0-2 年 / 入门阶段）
1. **模块一**：基础概念 ⭐⭐⭐ — 理解 Agent 是什么、核心架构、Function Calling
2. **模块二**：核心框架 ⭐⭐⭐ — 学 LangChain + OpenAI Agents SDK
3. **模块三**：ReAct 模式 ⭐⭐ — 最经典的 Agent 工作流

### 中级（2-5 年 / 进阶阶段）
1. **模块三**：多Agent协作 ⭐⭐ — 理解 Swarm/CrewAI
2. **模块三**：Reflexion + ToT ⭐⭐ — 高级推理模式
3. **模块四**：工程实践 ⭐⭐ — 生产部署必备
4. **模块二**：LangGraph 编排 ⭐⭐ — 复杂工作流

### 高级（5 年+ / 专家阶段）
1. **全模块深度钻研** — 原理级理解，源码贡献
2. **模块五**：前沿方向 ⭐ — LLM-as-Agent / 端到端训练 / 自进化
3. **评测与安全** — 制定 Agent 安全标准

---

## 📝 模块关系说明

### 为什么这样划分？

1. **基础概念是根基** — 不理解 Function Calling 就无法理解现代 Agent
2. **框架独立为一层** — LangChain/LlamaIndex/OASDK 是不同范式，不应混在一起
3. **高级模式独立** — ReAct/Reflexion/ToT 是通用模式，不依赖特定框架
4. **工程实践独立** — 生产部署有独特挑战（成本/安全/监控），需要专门章节
5. **前沿趋势压轴** — LLM-as-Agent 正在颠覆框架范式，属于最新变化

---

## 📝 内容来源

### 官方文档
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [LangChain 官方文档](https://python.langchain.com/)
- [LlamaIndex 官方文档](https://docs.llamaindex.ai/)
- [MCP 官方规范](https://modelcontextprotocol.io/)
- [DSPy 官方文档](https://dspy.ai/)

### 经典论文
- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
- [The Landscape of Emerging AI Agent Architectures](https://arxiv.org/abs/2404.11584)
- [A Survey on LLM-Based Agents](https://arxiv.org/abs/2406.05804)
- [Agentic AI Survey (Springer)](https://link.springer.com/article/10.1007/s10462-025-11422-4)
- [Awesome-Agent-Harness-Survey (HF)](https://huggingface.co/datasets/GloriaaaM/LLM-Agent-Harness-Survey)

### 开源项目
- [LangChain](https://github.com/langchain-ai/langchain)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [LlamaIndex](https://github.com/run-llama/llama_index)
- [CrewAI](https://github.com/crewAIInc/crewAI)
- [AutoGen](https://github.com/microsoft/autogen)
- [DSPy](https://github.com/stanfordnlp/dspy)

### 社区资源
- [甲子光年：2025 AI Agent 行业研究报告](https://pdf.dfcfw.com/pdf/H3_AP202503131644339445_1.pdf)
- [若飞架构师：2025 AI Agent 技术栈全景图](https://mp.weixin.qq.com/s/YH5LPpcHnd1UcMjo9x_7Og)
- [阿里云：四大主流技术](https://developer.aliyun.com/article/1717115)

---

**📅 最后更新**：2026-05-12
