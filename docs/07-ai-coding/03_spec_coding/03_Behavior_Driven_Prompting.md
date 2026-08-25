# Behavior-Driven Prompting (PRD → BDD → Living Spec)

> **在知识图谱中的位置**：模块三 · 03_spec_coding · 第 3 节
> **难度**：⭐⭐⭐

---

## 1. 概述

**Behavior-Driven Prompting** 是将需求转化为 BDD 格式（Given/When/Then），驱动 AI Agent 行为的方法。大多数 AI 编程工作流从 PRD 开始，但直接给 AI 的 PRD 往往不够具体。

---

## 2. PRD → BDD 转换流程

### 第一步：写 PRD

```markdown
## 用户登录功能
- 用户输入邮箱和密码
- 系统验证凭据
- 登录成功返回 JWT
- 登录失败返回错误信息
```

### 第二步：转化为 BDD

```markdown
# 用户登录

Scenario: 成功登录
  Given 一个已注册用户 "user@example.com" (密码: "password123")
  When 用户发送 POST /api/auth/login
       Body: { "email": "user@example.com", "password": "password123" }
  Then 响应状态码为 200
  And 响应体包含 "token" 字段
  And token 是一个有效的 JWT

Scenario: 错误密码登录
  Given 一个已注册用户 "user@example.com" (密码: "password123")
  When 用户发送 POST /api/auth/login
       Body: { "email": "user@example.com", "password": "wrong" }
  Then 响应状态码为 401
  And 响应体包含 "message": "Invalid credentials"
```

### 第三步：Living Spec

Living Spec 是持续更新的规格文档，随着开发进展自动更新：

```markdown
# 用户认证 Living Spec

## ✅ 已完成
- 邮箱/密码登录
- JWT Token 生成
- OAuth (Google/GitHub)

## 🔄 进行中
- 密码重置

## 📋 待开发
- 双因素认证
- 密码策略
```

---

## 3. 为什么需要 BDD

| 问题 | BDD 如何解决 |
|--|-|
| AI 生成的代码可能不满足需求 | 每个 Scenario 是可验证的测试 |
| 需求模糊 | BDD 强制具体化 |
| 测试与实现脱节 | BDD 既是需求也是测试 |

---

## 4. 参考资料

- [Behavior-driven prompting: PRD to BDD to living spec (ralphloopsarecool.com)](https://ralphloopsarecool.com/blog/behavior-driven-prompting/)
- [Specification-Driven Development (pockit.tools)](https://pockit.tools/blog/specification-driven-development-ai-coding-agents-complete-guide/)
