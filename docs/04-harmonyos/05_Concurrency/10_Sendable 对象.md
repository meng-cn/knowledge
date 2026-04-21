# Sendable 对象

> Sendable 是线程间高效传递对象的机制，通过引用而非序列化。

---

## 1. Sendable 概述

### 1.1 概念

Sendable 是 ArkTS 中用于**线程间传递**的特殊对象类型，实现了 `ISendable` 接口，可以在 Actor 模型的线程间通过引用高效传递，避免序列化开销。

### 1.2 Sendable vs 序列化

```
传统序列化方式：
├─ 对象 → 字节流 → 传输 → 字节流 → 对象
├─ 序列化开销大
└─ 不能传递复杂对象

Sendable 方式：
├─ 对象 → 引���传递（无需序列化）
├─ 高效
└─ 有限制
```

---

## 2. Sendable 规则

### 2.1 规则

| 规则 | 说明 |
|---|-|
| **readonly** | 所有字段必须是 readonly |
| **基本类型** | 只包含基本类型和 Sendable 字段 |
| **无闭包** | 不能包含函数引用 |
| **ISendable** | 实现 ISendable 接口 |

---

## 3. 实现 Sendable

### 3.1 基本实现

```typescript
// 实现 Sendable 接口的类
class Message implements ISendable {
    // Sendable 标记
    __isSendable__: true = true

    // 所有字段 readonly
    readonly id: string
    readonly content: string
    readonly timestamp: number
    readonly sender: string

    constructor(content: string, sender: string) {
        this.id = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
        this.content = content
        this.timestamp = Date.now()
        this.sender = sender
    }
}

// 线程间传递（高效！）
TaskPool.execute(() => {
    let msg = new Message('Hello', 'admin')
    console.log(msg.content)  // 通过引用传递
}).then(() => {
    console.log('任务完成')
})
```

### 3.2 嵌套 Sendable

```typescript
@Sendable
class Address {
    readonly city: string
    readonly street: string
}

@Sendable
class User {
    readonly name: string
    readonly address: Address  // 嵌套 Sendable
}

// 传递嵌套对象
let user = new User('小明', new Address('北京', '长安街'))
```

---

## 4. 面试高频考点

### Q1: Sendable 对象的作用？

**回答**：在 Actor 模型的线程间传递对象时，实现 Sendable 接口可避免序列化，通过引用高效传递。要求字段 readonly、只包含基本类型和 Sendable 字段。

### Q2: Sendable 的限制？

**回答**：字段必须 readonly，只能包含基本类型和 Sendable 字段，不能包含闭包/函数引用。

---

> 🐱 **小猫提示**：Sendable 记住 **"线程间高效传递、readonly、引用而非序列化"**。
