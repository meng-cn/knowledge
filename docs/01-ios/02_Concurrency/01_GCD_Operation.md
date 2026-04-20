# 01 - GCD 与 Operation 全栈深度

## 目录

1. [GCD 全栈深度分析](#1-gcd-全栈深度分析)
2. [Operation 全栈深度分析](#2-operation-全栈深度分析)
3. [GCD vs Operation 对比分析](#3-gcd-vs-operation-对比分析)
4. [并发性能分析与优化](#4-并发性能分析与优化)
5. [面试题汇总](#5-面试题汇总)

---

## 1. GCD 全栈深度分析

### 1.1 GCD 核心架构

```
Grand Central Dispatch 系统架构：
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  GCD 核心组件：                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  队列（Queue）                                               │  │
│  │  ┌─────────────────────────────────────────────┐             │  │
│  │  │  串行队列（Serial Queue）                     │  │
│  │  │  • 一次只执行一个任务                          │  │
│  │  │  • 任务按提交顺序执行                            │  │
│  │  │  • 创建：dispatch_queue_create("name", DISPATCH_QUEUE_SERIAL) │  │
│  │  │                                              │  │
│  │  │  并发队列（Concurrent Queue）                 │  │
│  │  │  • 可以同时执行多个任务                          │  │
│  │  │  • 任务执行顺序不确定                            │  │
│  │  │  • 系统提供 4 个优先级全局队列                  │  │
│  │  │                                              │  │
│  │  │  主队列（Main Queue）                         │  │
│  │  │  • 与主线程关联的串行队列                        │  │
│  │  │  • 用于 UI 更新                                 │  │
│  │  │  • 访问：dispatch_get_main_queue()              │  │
│  │  └─────────────────────────────────────────────┘             │  │
│  │                                                              │  │
│  │  任务（Task / Block）                                        │  │
│  │  ┌─────────────────────────────────────────────┐             │  │
│  │  │  • 同步执行（sync）— 当前线程等待任务完成      │  │
│  │  │  • 异步执行（async）— 不等待，立即返回        │  │
│  │  │  • 延迟执行（asyncAfter）— 指定延迟后执行      │  │
│  │  │  • 一次性执行（once）— 只执行一次              │  │
│  │  │  • 栅栏（barrier）— 等待前后任务完成          │  │
│  │  └─────────────────────────────────────────────┘             │  │
│  │                                                              │  │
│  │  Dispatch Source（事件源）                                   │  │
│  │  ┌─────────────────────────────────────────────┐             │  │
│  │  │  • 文件描述符事件                             │  │
│  │  │  • 端口事件                                  │  │
│  │  │  • 信号量事件                                │  │
│  │  │  • 定时器事件                                │  │
│  │  │  • 系统状态变化                              │  │
│  │  │  • Mach 端口                                │  │
│  │  └─────────────────────────────────────────────┘             │  │
│  │                                                              │  │
│  │  Dispatch Group（任务组）                                    │  │
│  │  ┌─────────────────────────────────────────────┐             │  │
│  │  │  • 等待多个任务完成                            │  │
│  │  │  • 通知任务完成                              │  │
│  │  │  • 配合 notify 使用                            │  │
│  │  └─────────────────────────────────────────────┘             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
*/
```

### 1.2 GCD 核心 API 深度

```swift
/*
GCD 核心 API：
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  // 1. 全局队列（4 个优先级）                                        │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  let q = DispatchQueue.global(qos: .userInteractive)  // 最高      │
│  │  let q = DispatchQueue.global(qos: .userInitiated)    // 高        │
│  │  let q = DispatchQueue.global(qos: .default)          // 默认       │
│  │  let q = DispatchQueue.global(qos: .utility)          // 低         │
│  │  let q = DispatchQueue.global(qos: .background)       // 最低        │
│  │                                                          │       │
│  │  QoS（Quality of Service）优先级：                           │       │
│  │  • .userInteractive  — UI 交互（最高）                     │       │
│  │  • .userInitiated    — 用户发起                            │       │
│  │  • .default          — 系统默认                            │       │
│  │  • .utility          — 耗时任务                            │       │
│  │  • .background       — 后台任务（最低）                    │       │
│  │  • .unspecified      — 未指定（退化为 default）            │       │
│  └────────────────────────────────────────────────────────┘       │
│                                                                      │
│  // 2. 自定义队列                                                    │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  let serialQueue = DispatchQueue(label: "com.app.serial")  │
│  │  let concurrentQueue = DispatchQueue(label: "com.app.concurrent", attributes: .concurrent)  │
│  │                                                          │
│  │  队列属性：                                               │       │
│  │  • DISPATCH_QUEUE_SERIAL — 串行队列（默认）              │       │
│  │  • DISPATCH_QUEUE_CONCURRENT — 并发队列                 │       │
│  └────────────────────────────────────────────────────────┘       │
│                                                                      │
│  // 3. 任务执行                                                      │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  // 同步执行 — 阻塞当前线程                                  │
│  │  dispatch_sync(queue) {                                     │
│  │      print("Sync task")                                    │
│  │  }                                                          │
│  │                                                          │
│  │  // 异步执行 — 不阻塞当前线程                                │
│  │  dispatch_async(queue) {                                    │
│  │      print("Async task")                                   │
│  │  }                                                          │
│  │                                                          │
│  │  // 异步延迟执行                                             │
│  │  dispatch_after(deadline: .now() + 2.0, queue: .main) {  │
│  │      print("Delayed task")                                 │
│  │  }                                                          │
│  │                                                          │
│  │  // 一次性执行 — 线程安全                                   │
│  │  dispatch_once(&token) {                                   │
│  │      // 只执行一次                                          │
│  │  }                                                          │
│  │                                                          │
│  │  // 栅栏任务 — 等待前后任务完成                              │
│  │  queue.async { print("Before barrier") }                   │
│  │  queue.async(flags: .barrier) {                            │
│  │      print("Barrier task")  // 独占执行                   │
│  │  }                                                          │
│  │  queue.async { print("After barrier") }                    │
│  │                                                          │
│  │  ⚠️ 注意：                                                  │
│  │  • sync 到当前队列 = 死锁！                                │
│  │  • 主队列 sync 到主队列 = 死锁！                           │
│  └────────────────────────────────────────────────────────┘       │
│                                                                      │
│  // 4. Dispatch Group（任务组）                                      │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  let group = DispatchGroup()                               │
│  │                                                          │
│  │  group.enter()                                           │
│  │  queue.async {                                           │
│  │      // 任务 1                                               │
│  │      group.leave()                                         │
│  │  }                                                          │
│  │                                                          │
│  │  group.enter()                                           │
│  │  queue.async {                                           │
│  │      // 任务 2                                               │
│  │      group.leave()                                         │
│  │  }                                                          │
│  │                                                          │
│  │  group.notify(queue: .main) {                             │
│  │      print("所有任务完成")                                    │
│  │  }                                                          │
│  │                                                          │
│  │  // 等待超时                                                │
│  │  let timeout = group.wait(timeout: .now() + 5.0)         │
│  │  if timeout == .success { print("超时") }                  │
│  └────────────────────────────────────────────────────────┘       │
│                                                                      │
│  // 5. Dispatch Source（事件源）                                     │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  // 定时器源                                                    │
│  │  let source = DispatchSource.timer(                      │
│  │      label: "timer",                                    │
│  │      schedule: .every(interval: 1.0),                    │
│  │      leeway: .milliseconds(10)                           │
│  │  )                                                        │
│  │  source.setEventHandler {                                │
│  │      print("Timer fired")                                 │
│  │  }                                                          │
│  │  source.resume()                                          │
│  │                                                          │
│  │  // 其他 Source 类型：                                     │
│  │  • DispatchSource.timer    — 定时器                        │
│  │  • DispatchSource.read     — 读取事件                      │
│  │  • DispatchSource.write    — 写入事件                      │
│  │  • DispatchSource.mach     — Mach 端口                    │
│  │  • DispatchSource.signal   — 信号                          │
│  │  • DispatchSource.process  — 进程事件                      │
│  └────────────────────────────────────────────────────────┘       │
│                                                                      │
│  // 6. Signal（信号量）                                              │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  let semaphore = DispatchSemaphore(value: 1)               │
│  │                                                          │
│  │  // 等待（减少计数，0 时阻塞）                               │
│  │  semaphore.wait()                                        │
│  │                                                          │
│  │  // 执行临界区                                              │
│  │  // ...                                                  │
│  │                                                          │
│  │  // 释放（增加计数）                                        │
│  │  semaphore.signal()                                      │
│  │                                                          │
│  │  应用场景：                                                │
│  │  • 限制并发数量（如最多 5 个网络请求）                     │
│  │  • 同步线程间通信                                          │
│  │  • 资源池管理                                              │
│  │                                                          │
│  │  ⚠️ 注意：                                                  │
│  │  • 等待次数必须等于释放次数                                │
│  │  • 不平衡会导致永久阻塞                                    │
│  └────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

GCD 调度机制：
┌───────────────────────────────────────────────────────────────────┐
│  GCD 调度流程：                                                     │
│  ┌────────────────────────────────────────────────────┐             │
│  │  1. 任务提交到队列                                    │    │
│  │  2. 队列将任务放入 dispatch_queue                     │
│  │  3. 系统调度器决定在哪个线程执行                      │
│  │  4. 线程池从全局线程池分配线程                        │
│  │  5. 任务执行完成，线程返回线程池                      │
│  │                                                       │
│  │  线程池管理：                                          │
│  │  • 线程池大小根据 QoS 自动调整                        │
│  │  • 高 QoS → 更多线程                                │
│  │  • 低 QoS → 更少线程                                │
│  │  • 线程数量上限：约 64 个（因设备而异）              │
│  │                                                       │
│  │  队列调度优先级：                                     │
│  │  1. 主队列 → 主线程（最高）                         │
│  │  2. 高 QoS 队列 → 高优先级线程                      │
│  │  3. 默认队列 → 默认线程                             │
│  │  4. 低 QoS 队列 → 低优先级线程                      │
│  │  5. 低优先级队列 → 最低优先级线程                    │
│  └────────────────────────────────────────────────────┘             │
└───────────────────────────────────────────────────────────────────┘
*/
```

---

## 2. Operation 全栈深度分析

### 2.1 Operation 核心架构

```
Operation 系统架构：
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Operation 核心组件：                                                  │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Operation 基类                                               │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  • 核心属性                                                   │    │    │
│  │  │    • isReady: 是否就绪（可执行）                              │    │    │
│  │  │    • isExecuting: 是否正在执行                                │    │    │
│  │  │    • isFinished: 是否完成                                    │    │    │
│  │  │    • isCancelled: 是否已取消                                  │    │    │
│  │  │    • queuePriority: 队列优先级                              │    │    │
│  │  │    • dependsOn: 依赖的 Operation                            │    │    │
│  │  │    • cancel(): 取消任务                                     │    │    │
│  │  │    • start(): 开始执行                                      │    │    │
│  │  │    • main(): 默认执行方法                                    │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  │  Operation 子类                                                     │    │
│  │  ┌──────────────────────────────────────────────────────────────┐    │    │
│  │  │  BlockOperation                                                  │    │    │
│  │  │  • 使用 Block 作为任务                                        │    │    │
│  │  │  • 支持添加多个 Block（自动串行执行）                         │    │    │
│  │  │  • 创建：BlockOperation(block: { })                            │    │    │
│  │  │                                                                   │    │    │
│  │  │  ClosureOperation (第三方)                                       │    │    │
│  │  │  • 更简洁的 Closure 封装                                      │    │    │
│  │  │  • 支持 async/await                                            │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  │  OperationQueue                                                        │    │
│  │  ┌──────────────────────────────────────────────────────────────┐    │    │
│  │  │  • maxConcurrentOperationCount: 最大并发数                    │    │    │
│  │  │    • 1 = 串行（一次一个）                                     │    │    │
│  │  │    • 默认 = 系统推荐值（通常 4-8）                             │    │    │
│  │  │    • 0 或 -1 = 无限制                                         │    │    │
│  │  │                                                                   │    │    │
│  │  │  • operations: 当前队列中的 Operation                        │    │    │
│  │  │  • operationCount: 队列中的 Operation 数量                    │    │    │
│  │  │  • isSuspended: 是否暂停                                      │    │    │
│  │  │  • queuePriority: 队列优先级                                  │    │    │
│  │  │  • cancelAllOperations(): 取消所有任务                         │    │    │
│  │  │  • waitUntilAllOperationsAreFinished(): 等待所有任务完成       │    │    │
│  │  │  • addOperation(operations:): 批量添加                        │    │    │
│  │  │  • addOperations(operations, wait:): 批量添加（可选等待）      │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────┘    │    │
│                                                                      │    │
│  Operation 生命周期：                                                   │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │                                                              │      │
│  │  New → Ready → Executing → Finished                          │      │
│  │       → Cancelled                                            │      │
│  │                                                              │      │
│  │  • New: Operation 创建                                    │      │
│  │  • Ready: 满足依赖条件，队列可以执行                         │      │
│  │  • Executing: 正在执行（start() 被调用）                     │      │
│  │  • Cancelled: 被取消（isCancelled = true）                   │      │
│  │  • Finished: 执行完成（isFinished = true）                   │      │
│  │                                                              │      │
│  │  状态转换：                                                    │      │
│  │  • isReady: 依赖的 Operation 完成 → true                     │      │
│  │  • isExecuting: start() 调用 → true, didStart() 调用       │      │
│  │  • isFinished: 任务完成 → true, finish() 调用              │      │
│  │  • isCancelled: cancel() 调用 → true                        │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
*/
```

### 2.2 Operation 深度 API

```swift
/*
Operation 核心 API：
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  // 1. 创建 Operation                                                    │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  // BlockOperation（最常用）                                  │      │
│  │  let op = BlockOperation {                                  │
│  │      print("Block task")                                    │
│  │  }                                                          │
│  │                                                              │
│  │  // 添加多个 Block（串行执行）                               │      │
│  │  op.addExecutionBlock { print("Block 2") }                 │
│  │  op.addExecutionBlock { print("Block 3") }                 │
│  │                                                              │
│  │  // 自定义 Operation（推荐用于复杂任务）                     │      │
│  │  class MyOperation: Operation {                             │
│  │      private var _isExecuting = false {                     │
│  │          willSet { willChangeValue(forKey: "isExecuting") } │
│  │          didSet { didChangeValue(forKey: "isExecuting") }   │
│  │      }                                                      │
│  │      var isExecuting: Bool { _isExecuting }                │
│  │                                                              │
│  │      private var _isFinished = false {                      │
│  │          willSet { willChangeValue(forKey: "isFinished") }  │
│  │          didSet { didChangeValue(forKey: "isFinished") }    │
│  │      }                                                      │
│  │      var isFinished: Bool { _isFinished }                  │
│  │                                                              │
│  │      override var isReady: Bool { super.isReady }          │
│  │      override var isConcurrent: Bool { true }              │
│  │                                                              │
│  │      override func start() {                                │
│  │          guard !isCancelled else { return }                 │
│  │          _isExecuting = true                                │
│  │          main()                                             │
│  │      }                                                      │
│  │                                                              │
│  │      func main() {                                          │
│  │          // 执行任务                                          │
│  │          _isExecuting = false                               │
│  │          _isFinished = true                                 │
│  │      }                                                      │
│  │  }                                                          │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  // 2. 任务依赖                                                        │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  // Operation 依赖（有向无环图）                               │      │
│  │  let op1 = BlockOperation { print("Task 1") }               │
│  │  let op2 = BlockOperation { print("Task 2") }               │
│  │  let op3 = BlockOperation { print("Task 3") }               │
│  │                                                              │
│  │  op2.addDependency(op1)  // op2 依赖 op1                     │
│  │  op3.addDependency(op1)  // op3 依赖 op1                     │
│  │  op3.addDependency(op2)  // op3 依赖 op2（op1 → op2 → op3）  │
│  │                                                              │
│  │  // ⚠️ 注意：                                                │
│  │  • 依赖必须在同一队列中                                     │    │
│  │  • 不能形成循环依赖（会永久阻塞）                            │    │
│  │  • 依赖检查在队列中同步                                      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  // 3. 优先级                                                      │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  // Operation 优先级（影响调度顺序）                          │      │
│  │  op.queuePriority = .aboveNormal                              │
│  │  op.qualityOfService = .userInitiated                       │
│  │                                                              │
│  │  优先级常量：                                                 │      │
│  │  • .veryLow    — 最低                                       │
│  │  • .low      — 低                                          │
│  │  • .normal   — 默认（0）                                    │
│  │  • .aboveNormal — 高                                       │
│  │  • .belowNormal — 高于默认                                   │
│  │  • .high     — 最高（8）                                    │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  // 4. 取消 Operation                                                │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  // 优雅取消                                                    │
│  │  op.cancel()                                                  │
│  │                                                              │
│  │  // 检查取消状态                                                │
│  │  if op.isCancelled { return }                                │
│  │                                                              │
│  │  // 优雅取消策略：                                            │      │
│  │  • 检查 isCancelled                                          │      │
│  │  • 设置标志位中断长时间循环                                    │      │
│  │  • 不立即终止（可能泄漏资源）                                 │      │
│  │  • 使用 DispatchWorkItem.cancel() 取消异步任务              │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  // 5. 最大并发数                                                    │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  queue.maxConcurrentOperationCount = 4  // 最多 4 个并发      │
│  │  queue.maxConcurrentOperationCount = 1  // 串行              │
│  │  queue.maxConcurrentOperationCount = 0  // 系统推荐值         │
│  │                                                              │
│  │  // 性能影响：                                               │      │
│  │  • 最大并发数影响内存占用                                    │      │
│  │  • 最大并发数影响 CPU 利用率                                 │      │
│  │  • 过大并发数会导致资源竞争                                  │      │
│  │  • 建议：根据任务类型设置不同队列                            │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  // 6. 完成处理                                                      │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  // 传统方式：KVO 观察                                      │      │
│  │  op.addObserver(forKeyPath: "isFinished", options: .new) {   │
│  │      print("完成")                                              │
│  │  }                                                          │
│  │                                                              │
│  │  // 现代方式：completionBlock                               │      │
│  │  op.completionBlock = {                                      │
│  │      print("完成")                                            │
│  │  }                                                          │
│  │                                                              │
│  │  // ⚠️ 注意：                                                  │
│  │  • completionBlock 在 Operation 完成的线程执行                 │
│  │  • 如果需要主线程执行，需要 dispatch                          │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  // 7. 错误处理                                                      │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  // Operation 本身不支持错误抛出                              │      │
│  │  // 解决方案：                                                │      │
│  │  // 1. 使用 Result/错误类型                                    │      │
│  │  // 2. 使用 completionBlock 传递错误                           │      │
│  │  // 3. 使用 Operation 子类封装错误处理                          │      │
│  │                                                              │
│  │  class ErrorHandlingOperation: Operation {                   │      │
│  │      enum TaskError: Error {                                │      │
│  │          case network, parsing, timeout                     │      │
│  │      }                                                      │
│  │      var error: TaskError?                                  │
│  │      var result: String?                                    │
│  │                                                              │
│  │      override func main() {                                │      │
│  │          guard !isCancelled else { return }                 │      │
│  │          do {                                               │      │
│  │              // 执行任务                                       │      │
│  │              try execute()                                   │      │
│  │              result = "success"                              │      │
│  │          } catch {                                          │      │
│  │              error = .network                                │      │
│  │          }                                                  │
│  │      }                                                      │
│  │  }                                                          │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 3. GCD vs Operation 对比分析

### 3.1 全面对比表

```
GCD vs Operation 对比：
┌────────────────────────────────────────────────────────────────┐
│  特性            │  GCD                       │  Operation              │
├────────────────────────────────────────────────────────────────┤
│  抽象层级        │  C API（底层）             │  Objective-C 对象（高层）  │
│  任务创建        │  闭包（block）               │  Operation 子类            │
│  依赖管理        │  ❌ 不支持                   │  ✅ 支持（有向无环图）    │
│  取消机制        │  ❌ 无原生支持               │  ✅ isCancelled            │
│  优先级          │  QoS（自动）                │  queuePriority + QoS       │
│  最大并发        │  系统决定                    │  maxConcurrentOperationCount │
│  生命周期        │  无状态                      │  New→Ready→Executing→Finished │
│  KVO            │  ❌                         │  ✅ isFinished / isExecuting │
│  错误处理        │  返回值 / 闭包              │  Result / completionBlock  │
│  线程安全        │  dispatch_sync / semaphore   │  Operation 内部              │
│  调试            │  Instruments / Xcode          │  Instruments / Xcode       │
│  自定义          │  有限                        │  完全自定义（子类）          │
│  网络集成        │  DispatchQueue.global         │  URLSession + Operation    │
│  内存管理        │  自动（闭包自动释放）         │  ARC                       │
│  适用场景        │  简单并发任务                │  复杂任务调度                │
└────────────────────────────────────────────────────────────────┘

选择指南：
┌──────────────────────────────────────────────────────────┐
│  场景                  │  推荐选择         │  原因               │
├──────────────────────────────────────────────────────────┤
│  简单异步任务           │  GCD              │  轻量、快速            │
│  依赖关系                │  Operation        │  原生支持依赖           │
│  取消控制               │  Operation        │  优雅取消              │
│  优先级管理             │  两者皆可         │  按需选择              │
│  网络请求队列           │  Operation        │  依赖 + 取消           │
│  大量简单并发           │  GCD              │  性能更佳             │
│  自定义任务生命周期     │  Operation        │  生命周期管理           │
│  数据转换管道           │  两者皆可         │  按复杂度选择          │
└──────────────────────────────────────────────────────────┘
*/
```

---

## 4. 并发性能分析与优化

### 4.1 性能分析

```
并发性能分析：
┌────────────────────────────────────────────────────────────────┐
│  优化策略            │  效果            │  适用场景           │
├──────────────────────┼──────────────────┼──────────────────┤
│  选择合适队列          │  避免不必要创建   │  所有场景          │
│  最小化队列数量        │  减少内存开销     │  大量并发           │
│  使用 Operation 依赖   │  避免死锁         │  依赖任务           │
│  限制最大并发          │  控制内存/CPU     │  大数据量           │
│  使用 GCD Source       │  系统级事件处理   │  文件/端口/信号     │
│  Dispatch Work Item    │  可取消异步任务   │  长时间任务         │
│  Concurrent 队列      │  最大化并行       │  独立任务           │
│  Barrier               │  线程安全写       │  共享数据            │
│  队列分组              │  简化等待         │  多任务聚合         │
│  QoS 匹配            │  优先级匹配       │  UI/后台混合        │
└──────────────────────┴──────────────────┴──────────────────┘
*/
```

---

## 5. 面试题汇总

### 高频面试题

**Q1: GCD 的队列类型和优先级？**

**答**：
- 队列类型：串行队列、并发队列、主队列
- 优先级（QoS）：userInteractive / userInitiated / default / utility / background
- 主队列是串行队列，与主线程关联
- 全局队列有 4 个优先级

**Q2: Operation 的生命周期？**

**答**：
- New → Ready → Executing → Finished
- Cancelled 是可选中间状态
- 通过 KVO 观察状态变化
- isReady 表示依赖满足且可执行

**Q3: GCD 死锁产生的原因？**

**答**：
- sync 到当前队列
- 主队列 sync 到主队列
- 解决：使用 async 或不同的队列

**Q4: GCD vs Operation 的区别？**

**答**：
- GCD 是 C API，Operation 是 Objective-C 对象
- GCD 不支持依赖，Operation 支持
- Operation 有优雅取消，GCD 没有
- Operation 支持优先级和 KVO
- GCD 性能更优，Operation 更灵活

**Q5: Operation 的最大并发数如何设置？**

**答**：
- maxConcurrentOperationCount
- 1 = 串行，>1 = 并发，0/-1 = 系统默认
- 根据任务类型设置不同队列

**Q6: GCD 的 Dispatch Source 有哪些类型？**

**答**：
- timer、read、write、mach、signal、process
- 用于系统事件驱动编程
- 底层基于 Mach port

---

## 6. 参考资源

- [Apple: Grand Central Dispatch](https://developer.apple.com/documentation/dispatch)
- [Apple: Operation Class Reference](https://developer.apple.com/documentation/foundation/operation)
- [Apple: OperationQueue Class Reference](https://developer.apple.com/documentation/foundation/operationqueue)
- [NSHipster: Dispatch](https://nshipster.com/dispatch)
- [WWDC 2017: What's New in Concurrent Programming](https://developer.apple.com/videos/play/wwdc2017/705/)
- [WWDC 2022: Build a concurrent data pipeline with Swift](https://developer.apple.com/videos/play/wwdc2022/110260/)
