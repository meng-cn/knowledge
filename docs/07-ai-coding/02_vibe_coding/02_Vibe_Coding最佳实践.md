# Vibe Coding 最佳实践

> **在知识图谱中的位置**：模块二 · 02_vibe_coding · 第 2 节
> **难度**：⭐⭐⭐

---

## 1. 写好 Vibe Coding Prompt 的原则

### 原则一：具体优于模糊

```
❌ "Build me a dashboard"
✅ "Build a React dashboard with a sidebar navigation, 
    a header with user avatar, a main content area with 
    three cards showing Total Users, Revenue, and Active Sessions,
    using Tailwind CSS"
```

### 原则二：提供技术栈约束

```
"Build a todo app using:
- React + TypeScript
- Tailwind CSS
- LocalStorage for persistence
- Dark mode support
```

### 原则三：分步迭代

```
Step 1: "Create a basic todo list component with add/delete"
Step 2: "Add edit functionality with a modal dialog"
Step 3: "Add filtering by status (all/active/completed)"
Step 4: "Add a progress bar showing completion percentage"
```

### 原则四：指定编码风格

```
"Use functional components with hooks
Follow Airbnb JavaScript Style Guide
Add JSDoc comments to all functions"
```

---

## 2. Vibe Coding 工作流

```
┌───────────────────────────────┐
│    Vibe Coding 工作流          │
│                                │
│  1. 描述整体架构               │
│  2. 让 AI 生成骨架代码         │
│  3. 逐功能迭代描述             │
│  4. AI 生成/修改代码           │
│  5. 审查 + 手动调整            │
│  6. 重复 3-5                   │
└───────────────────────────┘
```

---

## 3. 适合 Vibe Coding 的工具

| 工具 | 类型 | 特点 |
|--|-|--|
| **Cursor** | AI IDE | Composer 模式最适合 Vibe Coding |
| **Claude Code** | CLI Agent | 对话式编程 |
| **ChatGPT** | 网页 | 快速原型 |
| **Claude Desktop** | 桌面应用 | Claude 原生体验 |

---

## 4. 最佳实践 Checklist

- [ ] 描述具体（技术栈、框架、样式）
- [ ] 分步迭代（不要一次描述整个项目）
- [ ] 提供上下文（给 AI 相关文件内容）
- [ ] 审查所有 AI 生成的代码
- [ ] 手动调整关键逻辑
- [ ] 写测试确保功能正确
- [ ] 控制迭代次数（避免无限修改）

---

## 5. 参考资料

- [Vibe Coding vs Spec-Driven Development (Augment Code)](https://www.augmentcode.com/guides/vibe-coding-vs-spec-driven-development)
- [Vibe vs Spec Coding: Why Structure Matters (geraldtui.com)](https://geraldtui.com/posts/spec-coding-workflow/)
- [Vibe Coding vs Spec Coding vs Harness Engineer (bswen.com)](https://docs.bswen.com/blog/2026-03-25-vibe-spec-harness-comparison/)
