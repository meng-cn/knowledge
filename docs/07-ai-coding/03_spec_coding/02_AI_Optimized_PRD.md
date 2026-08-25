# AI-Optimized PRD for AI Agents

> **在知识图谱中的位置**：模块三 · 03_spec_coding · 第 2 节
> **难度**：⭐⭐⭐

---

## 1. 概述

**AI-Optimized PRD** 是专为 AI Agent（Cursor、Claude Code 等）阅读优化的需求文档。在 2026 年，PRD 不仅要给人看，还要给 AI Agent 执行。[来源: AI-Optimized PRD (thehuman2ai.com)](https://thehuman2ai.com/product/guides/prd/ai-optimized)

---

## 2. AI-Optimized PRD 模板

```markdown
# 项目名称

## 概述
一句话描述：这个项目/功能是什么。

## 目标用户
- 用户 A
- 用户 B

## 技术栈
- 前端：React + TypeScript + Tailwind CSS
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 部署：Docker + AWS

## 核心功能

### 功能 1：用户认证
- 邮箱/密码登录
- OAuth (Google/GitHub)
- JWT Token 认证
- 密码重置

### 功能 2：用户管理
- 创建/读取/更新/删除用户
- 用户角色 (admin/user)
- 用户状态 (active/inactive)

### 功能 3：数据报表
- 按日期范围筛选
- 数据导出 (CSV/PDF)
- 图表展示 (Chart.js)

## API 设计

| 方法 | 端点 | 描述 |
|--|-|--|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/users | 获取用户列表 |
| POST | /api/users | 创建用户 |
| GET | /api/users/:id | 获取单个用户 |
| PUT | /api/users/:id | 更新用户 |
| DELETE | /api/users/:id | 删除用户 |

## 数据库 Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 文件结构

```
src/
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   └── register.ts
│   └── users/
│       ├── list.ts
│       ├── create.ts
│       ├── get.ts
│       ├── update.ts
│       └── delete.ts
├── components/
├── lib/
│   └── db.ts
└── utils/
    └── validation.ts
```

## 开发顺序
1. 数据库 Schema
2. API 端点
3. 前端页面
4. 前端组件
5. 联调测试

## 验收标准
- [ ] 用户可注册/登录
- [ ] JWT Token 验证正确
- [ ] CRUD 操作全部完成
- [ ] 角色权限控制
- [ ] 数据验证和错误处理
- [ ] 测试覆盖率 > 80%

## 约束条件
- 不允许使用 MongoDB
- 必须使用 TypeScript strict mode
- 所有 API 端点必须有错误处理
- 不允许在客户端存储密码
```

---

## 3. AI-Optimized PRD 原则

| 原则 | 说明 |
|--|-|
| **结构化** | 用清晰的分节和列表 |
| **具体** | 不要写"漂亮的 UI"，写"使用 Tailwind CSS，间距 4px" |
| **有序** | 明确开发顺序 |
| **可验证** | 每条需求有可验证的标准 |
| **面向 Agent** | 写给 AI 读，格式清晰 |

---

## 4. 参考资料

- [AI-Optimized PRD: a requirements document for AI agents (thehuman2ai.com)](https://thehuman2ai.com/product/guides/prd/ai-optimized)
- [Behavior-driven prompting: PRD to BDD to living spec (ralphloopsarecool.com)](https://ralphloopsarecool.com/blog/behavior-driven-prompting/)
- [Claude Code Best Practices (claudefa.st)](https://claudefa.st/blog/guide/development/agentic-engineering-best-practices)
