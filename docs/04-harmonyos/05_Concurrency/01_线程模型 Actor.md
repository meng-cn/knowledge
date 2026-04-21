# 线程模型 Actor

> 鸿蒙的线程模型基于 Actor 模型，线程间内存隔离，通过消息传递通信。

---

## 1. Actor 模型核心概念

### 1.1 与传统线程模型的区别

```
传统线程模型（Android/Java）：
├─ 线程间共享内存
├─ 需要通过 synchronized/lock 同步
├─ 容易出现竞态条件
└─ 需要处理死锁

鸿蒙 Actor 模型：
├─ 线程间内存隔离（不共享内存）
├─ 通过消息传递通信（序列化）
├─ 无锁设计
└─ 避免竞态条件和死锁
```

### 1.2 Actor 模型的四个核心原则

| 原则 | 说明 |
|---|-|
| **内存隔离** | 每个线程有独立的内存空间 |
| **消息传递** | 线程间通过序列化消息通信 |
| **顺序处理** | 消息按顺序处理，不并发 |
| **单线程处理** | 每个 Actor 由单线程处理 |

---

## 2. 鸿蒙线程分类

### 2.1 线程类型

| 线程类型 | 说明 | 使用场景 |
|---|-|-|
| **UI 线程** | 主线程，处理 UI 渲染 | 更新 UI、响应事件 |
| **子线程** | 工作线程，耗时操作 | 网络请求、I/O、计算 |
| **Worker 线程** | 专用线程池 | 长时后台任务 |
| **TaskPool 线程** | 系统管理的任务池 | 短时任务 |

### 2.2 线程模型对比

```
Android 线程模型                    HarmonyOS Actor 模型
┌────────────────────┐            ┌────────────────────┐
│   主线程 (UI)      │            │   UI 线程          │
│                    │            │                    │
│  子线程 (Worker)   │            │  Worker 线程       │
│    ↕ 共享内存       │            │    消息传递         │
│                    │            │                    │
│  子线程 (Worker)   │            │  TaskPool 线程     │
│                    │            │                    │
└────────────────────┘            └────────────────────┘

核心区别：
├─ Android：共享内存 + 同步
└─ 鸿蒙：内存隔离 + 消息传递
```

---

## 3. 鸿蒙线程模型实现

### 3.1 线程创建方式

```typescript
// 方式1：TaskPool（推荐，短时任务）
TaskPool.execute(() => {
    // 耗时操作
    let result = heavyComputation()
    console.log('结果:', result)
})

// 方式2：Worker（长时任务）
import { worker } from '@kit.ArkWorker'

let workerTask: worker.TaskPool | undefined = undefined

function startWorker() {
    workerTask = worker.createTaskPool((data: WorkerData) => {
        // 任务处理
        return processData(data)
    })
    
    workerTask.execute('taskId', { key: 'value' })
}

// 方式3：原生线程（不推荐，开销大）
import { thread } from '@kit.BasicServicesKit'

let threadHandle = thread.createThread({
    name: 'myThread',
    run: () => {
        // 线程运行逻辑
    }
})
```

### 3.2 线程间通信

```typescript
// Actor 模型：消息传递
class MessageBus {
    private messages: Array<Message> = []
    private handlers: Map<string, (msg: Message) => void> = new Map()

    // 发送消息
    send(msg: Message): void {
        this.messages.push(msg)
        // 异步处理
        setTimeout(() => {
            this.processMessage(msg)
        }, 0)
    }

    // 注册处理器
    on(event: string, handler: (msg: Message) => void): void {
        this.handlers.set(event, handler)
    }

    // 处理消息
    private processMessage(msg: Message): void {
        let handler = this.handlers.get(msg.type)
        if (handler) {
            handler(msg)
        }
    }
}

class Message {
    type: string
    data: any
    timestamp: number

    constructor(type: string, data: any) {
        this.type = type
        this.data = data
        this.timestamp = Date.now()
    }
}
```

---

## 4. 线程模型最佳实践

### 4.1 线程选择决策树

```
需要执行任务？
├─ 耗时 > 500ms？
│   ├─ 是 → Worker（长时任务）
│   └─ 否 → TaskPool（短时任务）
├─ 需要常驻后台？
│   └─ 是 → Worker + 后台模式
└─ 一次性任务？
    └─ 是 → TaskPool
```

### 4.2 UI 线程限制

```
❌ 绝对不能在 UI 线程做：
├─ 网络请求（耗时）
├─ 文件 I/O
├─ 数据库查询（大量数据）
├─ 复杂计算
└─ JSON 解析（大量数据）

✅ 应该用 TaskPool/Worker：
├─ TaskPool.execute(() => { ... })
└─ Worker.createTaskPool()
```

### 4.3 线程安全

```typescript
// Actor 模型天然线程安全（内存隔离）
// 但 @State 需要在 UI 线程修改

@Component
struct MyComponent {
    @State count: number = 0

    // ❌ 错误：子线程修改 @State
    wrongMethod() {
        TaskPool.execute(() => {
            this.count = 100  // ❌ 编译/运行时错误
        })
    }

    // ✅ 正确：子线程处理完，UI 线程更新状态
    correctMethod() {
        TaskPool.execute(() => {
            let result = heavyComputation()
            // 在主线程更新 UI 状态
            context.getMainContext().syncDispatch(() => {
                this.count = result
            })
        })
    }
}
```

---

## 5. 线程池管理

### 5.1 TaskPool 配置

```typescript
// 配置 TaskPool
TaskPool.setMinCapacity(2)  // 最小线程数
TaskPool.setMaxCapacity(4) // 最大线程数

// 获取池信息
let minCapacity = TaskPool.getMinCapacity()
let maxCapacity = TaskPool.getMaxCapacity()
let currentCapacity = TaskPool.getCurrentCapacity()
```

### 5.2 Worker 生命周期

```typescript
// 创建 Worker
let workerTask = worker.createTaskPool((data: WorkerData) => {
    return processData(data)
})

// 执行任务
workerTask.execute('taskId', inputData).then((result) => {
    console.log('任务结果:', result)
})

// 终止 Worker
workerTask.destroy().then(() => {
    console.log('Worker 已终止')
})
```

---

## 6. 面试高频考点

### Q1: 鸿蒙的线程模型是什么？

**回答**：Actor 模型。线程间内存隔离，不共享内存，通过序列化消息传递通信。避免竞态条件和死锁，天然线程安全。

### Q2: TaskPool 和 Worker 的区别？

**回答**：TaskPool 系统管理，适合短时任务；Worker 手动管理，适合长时任务。

### Q3: 线程间如何通信？

**回答**：通过消息传递（序列化），内存隔离设计。子线程处理完结果后，通过 UI 线程 API 更新 @State 触发 UI 刷新。

---

> 🐱 **小猫提示**：Actor 模型记住 **"内存隔离、消息传递、无锁、天然安全"**。TaskPool vs Worker 是高频对比题。
