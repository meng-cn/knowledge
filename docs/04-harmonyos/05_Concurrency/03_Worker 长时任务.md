# Worker 长时任务

> Worker 用于手动管理的长时后台任务，适合常驻、耗时的场景。

---

## 1. Worker 概述

### 1.1 核心特性

| 特性 | 说明 |
|---|-|
| **手动管理** | 需要手动创建/销毁 |
| **长时任务** | 适合耗时 > 500ms 的长时任务 |
| **独立进程** | 运行在独立进程中 |
| **数量限制** | 同时最多 5 个 Worker |
| **适用场景** | 持续计算、数据处理、后台下载 |

### 1.2 Worker vs TaskPool

| 维度 | TaskPool | Worker |
|---|-|-|
| **管理方式** | 系统自动管理 | 手动管理 |
| **适用时长** | 短时（< 500ms） | 长时（> 500ms） |
| **进程** | 同进程 | 独立进程 |
| **数量限制** | 无限制 | 最多 5 个 |
| **推荐度** | 系统推荐 | 长时推荐 |

---

## 2. 基本用法

### 2.1 创建和启动 Worker

```typescript
import { worker } from '@kit.ArkWorker'

// Worker 入口函数（在独立进程中运行）
function workerMain(data: WorkerData): string {
    // 处理数据
    let result = processData(data)
    return result
}

// 创建 Worker 任务池
let workerTask: worker.TaskPool = worker.createTaskPool(workerMain)

// 执行任务
workerTask.execute('taskId', { key: 'value' }).then((result) => {
    console.log('Worker 结果:', result)
}).catch((err) => {
    console.error('Worker 错误:', err.message)
})
```

### 2.2 多任务并发

```typescript
// 创建多个 Worker
let worker1 = worker.createTaskPool(workerMain)
let worker2 = worker.createTaskPool(workerMain)

// 并发执行
Promise.all([
    worker1.execute('task1', { id: 1 }),
    worker2.execute('task2', { id: 2 })
]).then((results) => {
    console.log('所有任务完成:', results)
}).catch((err) => {
    console.error('任务失败:', err.message)
})
```

---

## 3. Worker 生命周期管理

### 3.1 完整生命周期

```
创建 Worker → 执行任务 → 持续运行 → 销毁 Worker
    ↓              ↓           ↓              ↓
createTaskPool  execute    持续运行       destroy
```

### 3.2 代码实现

```typescript
class WorkerManager {
    private workerPool: worker.TaskPool | null = null
    private isRunning: boolean = false

    // 创建 Worker
    create(): void {
        if (this.workerPool) return
        
        this.workerPool = worker.createTaskPool((data: WorkerData) => {
            // Worker 主循环
            while (this.isRunning) {
                // 处理队列中的任务
                let task = this.getTask()
                if (task) {
                    this.processTask(task)
                } else {
                    // 无任务时休眠
                    this.sleep(100)
                }
            }
            return 'completed'
        })
        
        this.isRunning = true
    }

    // 执行任务
    execute(data: WorkerData): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.workerPool) {
                reject(new Error('Worker 未创建'))
                return
            }
            
            this.workerPool.execute('taskId', data)
                .then(resolve)
                .catch(reject)
        })
    }

    // 销毁 Worker
    destroy(): void {
        this.isRunning = false
        
        if (this.workerPool) {
            this.workerPool.destroy().then(() => {
                this.workerPool = null
                console.log('Worker 已销毁')
            })
        }
    }
}
```

---

## 4. Worker 与 UI 线程通信

### 4.1 数据传递

```typescript
// Worker 侧
function workerMain(data: WorkerData): WorkerData {
    // 处理数据
    let result = process(data)
    
    // 返回结果（自动序列化）
    return {
        success: true,
        data: result
    }
}

// UI 线程侧
workerTask.execute('taskId', inputData)
    .then((result: WorkerData) => {
        if (result.success) {
            this.data = result.data
        }
    })
```

### 4.2 大对象传递

```typescript
// Worker 支持 Sendable 对象的高效传递
class Message implements Sendable {
    constructor(
        readonly id: string,
        readonly content: string,
        readonly timestamp: number
    ) {}
}

// 通过引用传递（无需序列化）
workerTask.execute('taskId', new Message('123', 'Hello', Date.now()))
```

---

## 5. Worker 使用限制

### 5.1 数量限制

```
同时最多 5 个 Worker
├─ 每个 Worker 独立进程
├─ 内存开销大
└─ 需要合理控制数量
```

### 5.2 适用场景

```
适合 Worker：
├─ 持续运行的后台任务
├─ 大量数据计算
├─ 音视频处理
└─ 定时轮询

不适合 Worker：
├─ 短时任务 → 用 TaskPool
├─ 一次性任务 → 用 TaskPool
└─ UI 更新 → 用 UI 线程
```

---

## 6. 面试高频考点

### Q1: Worker 适合什么场景？

**回答**：适合长时任务（> 500ms），如持续计算、数据处理、后台下载等。最多同时 5 个，需要手动管理生命周期。

### Q2: Worker 和 TaskPool 的区别？

**回答**：TaskPool 系统管理（短时<500ms），Worker 手动管理（长时>500ms）。Worker 运行在独立进程，最多 5 个。

---

> 🐱 **小猫提示**：Worker 记住 **"长时任务、手动管理、最多5个、独立进程"**。适合 TaskPool 不适合的场景。
