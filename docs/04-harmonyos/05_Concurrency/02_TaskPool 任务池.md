# TaskPool 任务池

> TaskPool 是系统管理的任务池，适合短时任务，是推荐方案。

---

## 1. TaskPool 概述

### 1.1 核心特性

| 特性 | 说明 |
|---|-|
| **系统管理** | 线程池大小自动管理 |
| **短时任务** | 适合耗时 < 500ms 的任务 |
| **推荐方案** | 系统推荐使用的并发方案 |
| **自动调度** | 自动分配线程资源 |
| **轻量级** | 创建/销毁开销小 |

---

## 2. 基本用法

### 2.1 简单使用

```typescript
import { TaskPool } from '@kit.ArkTS'

// 执行短时任务
TaskPool.execute(() => {
    // 耗时操作
    let sum = 0
    for (let i = 0; i < 1000000; i++) {
        sum += i
    }
    console.log('计算结果:', sum)
}).then(() => {
    console.log('任务完成')
}).catch((err) => {
    console.error('任务失败:', err.message)
})
```

### 2.2 带参数和返回值

```typescript
import { TaskPool } from '@kit.ArkTS'

// 执行带参数的任务
TaskPool.execute((a: number, b: number): number => {
    return a + b
}, [10, 20]).then((result: number) => {
    console.log('结果:', result)  // 30
}).catch((err) => {
    console.error('错误:', err.message)
})
```

---

## 3. TaskPool 配置

### 3.1 线程池参数

```typescript
import { TaskPool } from '@kit.ArkTS'

// 获取当前配置
let minCapacity = TaskPool.getMinCapacity()    // 最小线程数
let maxCapacity = TaskPool.getMaxCapacity()    // 最大线程数
let currentCapacity = TaskPool.getCurrentCapacity()

// 设置线程池参数
TaskPool.setMinCapacity(2)  // 最小线程数
TaskPool.setMaxCapacity(8)  // 最大线程数

// 设置任务执行超时（毫秒）
TaskPool.setTaskTimeout(5000)

// 获取任务状态
let pendingCount = TaskPool.getPendingCount()  // 等待中的任务数
```

### 3.2 线程优先级

```typescript
import { TaskPool, TaskPriority } from '@kit.ArkTS'

// 设置任务优先级
TaskPool.execute(() => {
    // 高优先级任务
}, TaskPriority.NORMAL)  // 或 HIGH / LOW
```

---

## 4. TaskPool 最佳实践

### 4.1 使用场景

```
适合使用 TaskPool：
├─ 数据计算（加密、压缩、图像处理）
├─ 文件读写（少量数据）
├─ JSON 解析（大量数据）
├─ 网络请求结果处理
└─ 图片处理（缩放、裁剪）

不适合使用 TaskPool：
├─ 长时后台任务 → 用 Worker
├─ 定时任务 → 用定时器
└─ UI 更新 → 在 UI 线程
```

### 4.2 避免内存泄漏

```typescript
@Component
struct MyComponent {
    private disposed: boolean = false

    async loadData() {
        // 检查组件是否已销毁
        if (this.disposed) return
        
        try {
            let result = await TaskPool.execute(() => {
                return heavyComputation()
            })
            
            // 处理结果
            if (!this.disposed) {
                this.data = result
            }
        } catch (err) {
            console.error('任务失败:', err)
        }
    }

    aboutToDisappear() {
        this.disposed = true  // 组件销毁时标记
    }
}
```

---

## 5. 错误处理

### 5.1 Promise 错误处理

```typescript
TaskPool.execute(() => {
    if (condition) {
        throw new Error('计算错误')
    }
    return result
}).then((data) => {
    console.log('结果:', data)
}).catch((err) => {
    console.error('TaskPool 错误:', err.message)
})
```

### 5.2 超时处理

```typescript
// 设置超时
TaskPool.setTaskTimeout(3000).then(() => {
    console.log('任务超时设置成功')
}).catch((err) => {
    console.error('超时设置失败:', err.message)
})
```

---

## 6. 性能调优

### 6.1 线程池容量调整

```
线程池容量过小的问题：
├─ 任务排队等待
├─ 响应变慢
└─ 用户体验差

线程池容量过大的问题：
├─ 线程切换开销
├─ 内存占用高
└─ CPU 竞争

推荐配置：
├─ 手机：最小 2，最大 4-6
├─ 平板：最小 4，最大 8
└─ 折叠屏：最小 4，最大 8
```

### 6.2 任务粒度

```
任务太大：
├─ 阻塞整个线程池
├─ 影响其他任务
└─ 建议拆分小任务

任务太小：
├─ 创建/销毁开销大
└─ 建议合并

推荐：50-500ms 单个任务
```

---

## 7. 面试高频考点

### Q1: TaskPool 适合什么场景？

**回答**：适合短时任务（< 500ms），如计算、文件处理、图片处理、JSON 解析等。系统自动管理线程池。

### Q2: TaskPool 的线程池容量如何调整？

**回答**：通过 `setMinCapacity/setMaxCapacity` 调整。手机推荐最小 2 最大 4-6，平板/折叠屏推荐最小 4 最大 8。

---

> 🐱 **小猫提示**：TaskPool 记住 **"系统管理、短时任务推荐、自动调度、setMinCapacity/setMaxCapacity 调整"**。
