# 02 - Swift Concurrency 全栈深度

## 目录

1. [async/await 核心机制](#1-asyncawait-核心机制)
2. [Task 与 TaskGroup 深度分析](#2-task-与-taskgroup-深度分析)
3. [Actor 深度分析](#3-actor-深度分析)
4. [Sendable 深度分析](#4-sendable-深度分析)
5. [结构化并发](#5-结构化并发)
6. [并发调试与测试](#6-并发调试与测试)
7. [GCD 迁移到 async-await](#7-gcd-迁移到-async-await)
8. [面试题汇总](#8-面试题汇总)

---

## 1. async/await 核心机制

### 1.1 async/await 原理

```
async/await 的核心机制：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  async/await 本质：                                                │
│  • async/await 不是线程，是异步编程的语法糖                         │
│  • 编译器将 async 函数转换为状态机（State Machine）                 │
│  • 函数在 await 点挂起，等待结果后恢复                              │
│  • 不创建新线程，只是异步调度                                         │
│                                                                      │
│  async 函数与普通函数的区别：                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  特性            │  普通函数           │  async 函数             │
│  ├─────────────────┼────────────────────┼────────────────────┤   │
│  │  执行方式        │  同步阻塞            │  异步非阻塞             │
│  │  返回值          │  T                  │  Task<T>               │
│  │  挂起            │  不能                │  可以                   │
│  │  线程            │  当前线程            │  可切换线程              │
│  │  开销            │  零                  │  状态机切换              │
│  └─────────────────┴────────────────────┴────────────────────┘   │
│                                                                      │
│  async/await 的工作流程：                                            │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  func fetchData() async -> Data {                              │
│  │      // 1. 异步函数开始执行                                    │
│  │      // 2. 遇到 await → 挂起当前协程                           │
│  │      let data = try await networkRequest()                      │
│  │      // 3. 网络请求完成 → 恢复协程                              │
│  │      // 4. 继续执行                                           │
│  │      return parse(data)                                       │
│  │  }                                                              │
│  │                                                                  │
│  │  async/await 调度流程：                                          │
│  │  ┌──────────────┐   ┌───────┐   ┌──────────┐   ┌───────┐       │
│  │  │ 执行 async   │──▶│ await │──▶│ 网络请求  │──▶│ 恢复   │       │
│  │  │ 函数         │   │ 挂起  │   │ (后台)   │   │ 继续  │       │
│  │  └─────────────┘   └───────┘   └──────────┘   └───────┘       │
│  │                                                                  │
│  │  协程（Coroutine）：                                             │
│  │  • 轻量级线程（约 4KB 栈空间）                                  │
│  │  • 可手动挂起和恢复                                             │
│  │  • 协程池：系统维护的协程调度器                                 │
│  │  • Swift 并发使用 Continuation（延续）管理协程                  │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  async/await 的性能分析：                                            │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  • 协程创建：约 4KB 栈空间（比线程 ~1MB 小得多）               │
│  │  • 协程挂起：O(1) 状态保存                                      │
│  │  • 协程恢复：O(1) 状态恢复                                      │
│  │  • async/await 比 GCD 更轻量                                   │
│  │  • 大量并发任务时，async/await 比 GCD 更节省内存                │
│  │  • 线程切换开销：async/await 在同一个线程池内                   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

### 1.2 async/await 核心 API

```swift
/*
async/await 核心 API：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  // 1. 基本 async/await                                              │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  // async 函数定义                                               │
│  │  func fetchData() async throws -> Data {                       │
│  │      // 异步返回 Data                                            │
│  │  }                                                              │
│  │                                                                  │
│  │  // await 调用                                                  │
│  │  let data = try await fetchData()                               │
│  │                                                                  │
│  │  // 并发调用（并行执行）                                         │
│  │  let (data1, data2) = try await withTaskGroup(of: Data.self) {  │
│  │      group.addTask { try await fetchData(id: 1) }              │
│  │      group.addTask { try await fetchData(id: 2) }              │
│  │      return (group.next()!, group.next()!)                     │
│  │  }                                                              │
│  │                                                                  │
│  │  // 超时                                                        │
│  │  let result = try await withTimeout(seconds: 5.0) {            │
│  │      try await fetchData()                                      │
│  │  }                                                              │
│  │                                                                  │
│  │  // 错误处理                                                    │
│  │  do {                                                          │
│  │      let data = try await fetchData()                           │
│  │  } catch {                                                     │
│  │      print("错误: \(error)")                                    │
│  │  }                                                              │
│  │                                                                  │
│  │  // Task.detached（独立任务）                                    │
│  │  Task.detached {                                               │
│  │      // 不在当前任务层级结构中                                   │
│  │  }                                                              │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
│  // 2. withCheckedContinuation / withUnsafeContinuation             │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  // 桥接同步 API 到 async                                  │
│  │  func fetchData() async throws -> Data {                       │
│  │      return try await withCheckedContinuation { continuation in  │
│  │          networkRequest { data, error in                        │
│  │              if let error = error {                            │
│  │                  continuation.resume(throwing: error)            │
│  │              } else {                                           │
│  │                  continuation.resume(returning: data!)            │
│  │              }                                                  │
│  │          }                                                      │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // ⚠️ 注意：                                                    │
│  │  • 必须调用 resume 一次                                         │
│  │  • 必须在任务上下文中调用                                        │
│  │  • 线程安全：resume 可在任何线程调用                          │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
│  // 3. async let（并行异步变量）                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  // async let 创建并行任务                                       │
│  │  async let data1 = fetchData(id: 1)                             │
│  │  async let data2 = fetchData(id: 2)                             │
│  │                                                                  │
│  │  // 等待完成                                                      │
│  │  let result = try await (await data1, await data2)              │
│  │                                                                  │
│  │  // async let 的取消                                            │
│  │  Task {                                                         │
│  │      async let result = heavyWork()                             │
│  │      await result  // 等待完成                                   │
│  │  }.cancel()  // 取消任务                                          │
│  │                                                                  │
│  │  ⚠️ 注意：                                                    │
│  │  • async let 是结构化并发的基础                                │
│  │  • 所有 async let 必须在当前 Task 中完成                        │
│  │  • async let 的父 Task 取消 → 子任务也取消                      │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
│  // 4. Task（任务创建）                                             │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  // 创建任务                                                    │
│  │  Task {                                                         │
│  │      // 在独立线程中执行                                        │
│  │      await doWork()                                              │
│  │  }                                                              │
│  │                                                                  │
│  │  // 任务层级关系                                                │
│  │  Task {                                                         │
│  │      // 父 Task                                                 │
│  │      async let child1 = heavyWork1()                           │
│  │      async let child2 = heavyWork2()                           │
│  │      // 父 Task 取消 → child1/child2 也取消                    │
│  │  }                                                              │
│  │                                                                  │
│  │  // 任务优先级                                                │
│  │  Task(priority: .userInitiated) {                              │
│  │      await doWork()                                              │
│  │  }                                                              │
│  │                                                                  │
│  │  // 任务分离（Detached Task）                                    │
│  │  Task.detached(priority: .userInitiated) {                     │
│  │      await doWork()                                              │
│  │  }                                                              │
│  │                                                                  │
│  │  // Task 的取消                                               │
│  │  let task = Task {                                               │
│  │      await longWork()                                            │
│  │  }                                                              │
│  │  task.cancel()  // 取消任务                                     │
│  │  await task.value  // 等待结果（取消后抛出 CancellationError）  │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
│  // 5. async sequence（异步序列）                                   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  // 异步迭代                                                    │
│  │  for await item in asyncSequence {                              │
│  │      print(item)                                                 │
│  │  }                                                              │
│  │                                                                  │
│  │  // AsyncThrowingSequence                                     │
│  │  for try await item in throwingSequence {                       │
│  │      print(item)                                                 │
│  │  }                                                              │
│  │                                                                  │
│  │  // AsyncStream（异步流）                                        │
│  │  let stream = AsyncStream<Int> { continuation in                │
│  │      // 持续产出值                                               │
│  │      for i in 0..<100 {                                         │
│  │          continuation.yield(i)                                   │
│  │      }                                                          │
│  │      continuation.finish()                                       │
│  │  }                                                              │
│  │                                                                  │
│  │  // AsyncStream 的使用                                          │
│  │  for await value in stream {                                    │
│  │      print(value)                                                │
│  │  }                                                              │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 2. Task 与 TaskGroup 深度分析

### 2.1 TaskGroup 深度

```
TaskGroup 详解：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  withTaskGroup（通用任务组）                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  // 创建任务组                                                  │
│  │  let results = try await withTaskGroup(of: Data.self) { group in  │
│  │      // 添加任务                                                │
│  │      for id in ids {                                            │
│  │          group.addTask {                                        │
│  │              try await fetchData(id: id)                          │
│  │          }                                                      │
│  │      }                                                          │
│  │                                                                  │
│  │      // 获取结果                                                │
│  │      var results: [Data] = []                                  │
│  │      for await result in group {                                │
│  │          results.append(result)                                  │
│  │      }                                                          │
│  │      return results                                             │
│  │  }                                                              │
│  │                                                                  │
│  │  // withThrowingTaskGroup（可抛出）                            │
│  │  let results = try await withThrowingTaskGroup(of: Data.self) {  │
│  │      for id in ids {                                            │
│  │          group.addTask {                                        │
│  │              try fetchData(id: id)                                │
│  │          }                                                      │
│  │      }                                                          │
│  │      var results: [Data] = []                                  │
│  │      for try await result in group {                            │
│  │          results.append(result)                                  │
│  │      }                                                          │
│  │      return results                                             │
│  │  }                                                              │
│  │                                                                  │
│  │  // withThrowingTaskGroup（可抛出）                            │
│  │  let results = try await withThrowingTaskGroup(of: Data.self) {  │
│  │      for id in ids {                                            │
│  │          group.addTask {                                        │
│  │              try fetchData(id: id)                                │
│  │          }                                                      │
│  │      }                                                          │
│  │      var results: [Data] = []                                  │
│  │      for try await result in group {                            │
│  │          results.append(result)                                  │
│  │      }                                                          │
│  │      return results                                             │
│  │  }                                                              │
│  │                                                                  │
│  │  // withThrowingTaskGroup（可抛出）                            │
│  │  let results = try await withThrowingTaskGroup(of: Data.self) {  │
│  │      for id in ids {                                            │
│  │          group.addTask {                                        │
│  │              try fetchData(id: id)                                │
│  │          }                                                      │
│  │      }                                                          │
│  │      var results: [Data] = []                                  │
│  │      for try await result in group {                            │
│  │          results.append(result)                                  │
│  │      }                                                          │
│  │      return results                                             │
│  │  }                                                              │
│  │                                                                  │
│  │  ⚠️ 注意事项：                                                    │
│  │  • 所有 addTask 必须在函数返回前完成                           │
│  │  • group 退出时自动 cancel 所有未完成任务                      │
│  │  • 返回时所有子任务必须完成                                     │
│  │  • 可以用 group.cancelAll() 手动取消所有任务                   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                      │
│  任务组类型对比：                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  类型                  │ 错误处理   │ 并发控制   │ 适用场景    │   │
│  ├───────────────────────────┼───────────┼───────────┼────────────┤   │
│  │  withTaskGroup       │ 手动      │ 手动      │ 简单并行  │   │
│  │  withThrowingTaskGroup │ 自动      │ 手动      │ 可抛出并行 │   │
│  │  withTaskGroup(of:)  │ 手动      │ 类型安全  │ 强类型并行 │   │
│  │  UncheckedTaskGroup  │ 无        │ 无        │ 特殊场景   │   │
│  └───────────────────────────┴───────────┴───────────┴────────────┘   │
│                                                                      │
│  TaskGroup 的性能分析：                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 任务创建：O(1)（协程栈 4KB）                                │
│  │  • 任务添加：O(1)                                               │
│  │  • 任务执行：系统调度（自动负载均衡）                            │
│  │  • 结果获取：O(n)（遍历结果）                                   │
│  │  • 内存：每个任务 4KB + 协程上下文                            │
│  │  • 与 GCD 对比：async/await 更轻量                           │
│  └───────────────────────────┴───────────┴───────────┴────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 3. Actor 深度分析

### 3.1 Actor 原理

```
Actor 深度分析：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Actor 核心概念：                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Actor 是 Swift 6 并发模型的核心                              │
│  │  • Actor 是一种引用类型（类似 class）                          │
│  │  • Actor 内部状态自动线程安全                                  │
│  │  • Actor 的方法调用是异步的                                   │
│  │  • Actor 隔离了可变状态                                        │
│  │  • Actor 不能有继承（单一隔离保障）                              │
│  │  • Actor 的方法只能在 actor 内部调用                          │
│  │  • 跨 actor 调用必须是 async                                   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Actor 的基本用法：                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // 定义 Actor                                                  │
│  │  actor Cache {                                                  │
│  │      private var store = [String: Any]()                       │
│  │      private let lock = NSLock()                              │
│  │                                                                  │
│  │      func get(key: String) -> Any? {                          │
│  │          // 自动串行执行，无需手动加锁                          │
│  │          return store[key]                                     │
│  │      }                                                          │
│  │                                                                  │
│  │      func set(key: String, value: Any) {                      │
│  │          store[key] = value                                     │
│  │      }                                                          │
│  │                                                                  │
│  │      func remove(key: String) -> Any? {                       │
│  │          return store.removeValue(forKey: key)                  │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // 使用 Actor                                                  │
│  │  let cache = Cache()                                            │
│  │  await cache.set(key: "user", value: userData)                 │
│  │  let value = await cache.get(key: "user")                      │
│  │                                                                  │
│  │  // Actor 的串行执行保证：                                      │
│  │  // • 同一 Actor 的方法调用不会并发执行                         │
│  │  // • 外部调用必须是 async                                       │
│  │  // • 内部调用可以同步（同一线程）                              │
│  │                                                                  │
│  │  // Actor 继承 Actor（不是 class）                              │
│  │  actor BaseCache: AnyObject {                                   │
│  │      func clear() { /* 清空缓存 */ }                            │
│  │  }                                                              │
│  │                                                                  │
│  │  actor LRUCache: BaseCache {                                   │
│  │      // 可以继承 BaseCache 的 actor 方法                        │
│  │      override func clear() { /* LRU 清空 */ }                  │
│  │  }                                                              │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Actor 隔离与全局 Actor：                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // 全局 Actor（@MainActor）                                  │
│  │  @MainActor                                                   │
│  │  func updateUI() {                                            │
│  │      // 永远在主线程执行                                       │
│  │  }                                                              │
│  │                                                                  │
│  │  // Actor 隔离                                             │
│  │  actor Cache {                                                 │
│  │      func get(key: String) -> Any? {                         │
│  │          // 只能在 actor 内部或 async 调用                      │
│  │          return store[key]                                     │
│  │      }                                                          │
│  │      func set(key: String, value: Any) {                      │
│  │          store[key] = value                                     │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // @unchecked Sendable                                       │
│  │  struct UnsafeCache: @unchecked Sendable {                     │
│  │      private var store = [String: Any]()                       │
│  │      // 手动保证线程安全                                       │
│  │      private let lock = NSLock()                              │
│  │      func get(key: String) -> Any? {                          │
│  │          lock.lock()                                            │
│  │          defer { lock.unlock() }                               │
│  │          return store[key]                                     │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // Actor 的同步方法（内部调用）                               │
│  │  actor Cache {                                                 │
│  │      func synchronizedOperation() {                           │
│  │          // 在 actor 内部调用，不需要 async                     │
│  │          let value = get(key: "test")                          │
│  │          set(key: "test", value: "new")                        │
│  │      }                                                          │
│  │  }                                                              │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Actor 的性能分析：                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • Actor 调用开销：O(1)（协程调度）                            │
│  │  • Actor 隔离：编译期生成异步包装器                           │
│  │  • 串行保证：同一 Actor 的方法串行执行                        │
│  │  • 性能：比手动加锁更高效（零锁开销）                          │
│  │  • 内存：每个 Actor ~4KB                                      │
│  │  • 死锁：不可能（编译器保证）                                  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Actor vs 锁的对比：                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  特性              │  Actor               │  手动锁            │   │
│  ├───────────────────────┼───────────────────┼──────────────────┤   │
│  │  线程安全          │ ✅ 自动              │  ❌ 手动            │   │
│  │  死锁风险          │ ✅ 编译器保证        │  ❌ 可能死锁        │   │
│  │  性能              │ ✅ 高（协程调度）     │  ⚠️ 低（锁竞争）     │   │
│  │  可维护性          │ ✅ 高（结构化并发）   │  ❌ 低（手动管理）   │   │
│  │  调试              │ ✅ 编译期检查         │  ❌ 运行时问题       │   │
│  └───────────────────────┴───────────────────┴──────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 4. Sendable 深度分析

### 4.1 Sendable 原理

```
Sendable 深度分析（Swift 6 核心）：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Sendable 的核心：                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Sendable 是一个标记协议（零方法）                       │
│  │  • 标记该类型可以在线程间安全传递                           │
│  │  • Swift 6 编译期检查数据隔离                             │
│  │  • 不是运行时的检查，是编译期的静态验证                      │
│  │  • 所有可变状态必须通过 Actor 或不可变类型处理               │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Sendable 的默认实现：                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  // 自动实现 Sendable（值类型）                                  │
│  │  struct Point: Sendable {  // 自动遵循                        │
│  │      let x: Int                                                │
│  │      let y: Int                                                │
│  │  }                                                              │
│  │                                                                  │
│  │  // 自动实现 Sendable（不可变引用类型）                          │
│  │  final class Config: Sendable {  // 自动遵循                   │
│  │      let value: String                                           │
│  │  }                                                              │
│  │                                                                  │
│  │  // 需要手动实现（复杂类型）                                    │
│  │  class Cache: Sendable {                                        │
│  │      // ⚠️ 需要手动保证线程安全                               │
│  │      // @unchecked Sendable 绕过编译检查                        │
│  │  }                                                              │
│  │                                                                  │
│  │  // Sendable 的约束                                            │
│  │  • 值类型：默认 Sendable（所有属性 Sendable）                   │
│  │  • 引用类型：需要显式实现或 @unchecked Sendable              │
│  │  • 类属性必须是不可变或 Sendable                              │
│  │  • 闭包不能捕获可变非 Sendable 值                           │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Sendable 的检查规则：                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  // 正确：                                                     │
│  │  struct SafeData: Sendable {  // ✅ 自动符合                   │
│  │      let value: String                                         │
│  │  }                                                              │
│  │                                                                  │
│  │  // 错误：                                                     │
│  │  class UnsafeCache {                                           │
│  │      var store = [String: Any]()  // ❌ 可变非 Sendable        │
│  │  }                                                              │
│  │                                                                  │
│  │  // 解决方案：                                                 │
│  │  final class SafeCache: Sendable {                             │
│  │      private let store: [String: Any]                           │
│  │      init(store: [String: Any]) {  // 不可变                   │
│  │          self.store = store                                      │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // @unchecked Sendable（手动保证）                           │
│  │  class ManualCache: @unchecked Sendable {                      │
│  │      private var store = [String: Any]()                       │
│  │      private let lock = NSLock()                              │
│  │      func get(key: String) -> Any? {                          │
│  │          lock.lock()                                            │
│  │          defer { lock.unlock() }                               │
│  │          return store[key]                                     │
│  │      }                                                          │
│  │  }                                                              │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Sendable 性能分析：                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • 编译期检查：零运行时开销                                     │
│  │  • @unchecked Sendable：零开销（绕过检查）                     │
│  │  • Sendable 协议：零开销（标记协议）                            │
│  │  • 编译器优化：可安全删除数据                                   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 5. 结构化并发

```
结构化并发（Structured Concurrency）：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  核心概念：                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • 任务有明确的生命周期                                        │
│  │  • 子任务的生命周期依赖于父任务                                  │
│  │  • 父任务等待子任务完成                                        │
│  │  • 父任务取消 → 子任务也取消                                   │
│  │  • 父任务无法返回直到子任务完成                                 │
│  │  • 防止泄漏和孤儿任务                                          │
│  │                                                                  │
│  │  结构化并发的三个原则：                                         │
│  │  1. 每个任务都有明确的父任务                                    │
│  │  2. 子任务在父任务作用域内创建                                   │
│  │  3. 父任务在返回前等待子任务完成                                │
│  │                                                                  │
│  │  结构化并发的生命周期：                                          │
│  │  ┌──────────────────────┐                                      │
│  │  │ 父 Task               │                                      │
│  │  │  ┌────────────────┐  │                                      │
│  │  │  │ 子 Task 1       │  │                                      │
│  │  │  │  ┌───────────┐  │  │                                      │
│  │  │  │  │ 子 Task 1a│  │  │                                      │
│  │  │  │  └───────────┘  │  │                                      │
│  │  │  └─────────────────┘  │                                      │
│  │  │  ┌────────────────┐  │                                      │
│  │  │  │ 子 Task 2       │  │                                      │
│  │  │  └─────────────────┘  │                                      │
│  │  └─────────────────────┘                                      │
│  │                                                                  │
│  │  父任务取消 → 子任务 1a → 子任务 1 → 子任务 2 全部取消          │
│  │  父任务等待所有子任务完成 → 返回                                  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  结构化并发的 API：                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  // withTaskGroup: 并行执行多个任务                            │
│  │  let results = try await withTaskGroup(of: Data.self) { group in  │
│  │      for id in ids {                                            │
│  │          group.addTask {                                        │
│  │              try await fetchData(id: id)                          │
│  │          }                                                      │
│  │      }                                                          │
│  │      var results: [Data] = []                                  │
│  │      for await result in group {                                │
│  │          results.append(result)                                  │
│  │      }                                                          │
│  │      return results                                             │
│  │  }                                                              │
│  │                                                                  │
│  │  // 与 async let 对比：                                        │
│  │  async let a = fetchData(id: 1)                                 │
│  │  async let b = fetchData(id: 2)                                 │
│  │  let results = try await (await a, await b)                    │
│  │                                                                  │
│  │  // withTaskGroup vs async let 对比：                          │
│  │  ┌───────┬───────────────────────┬───────────────────────┐      │
│  │  │ 特性   │  withTaskGroup        │  async let              │      │
│  │  ├───────┼───────────────────────┼───────────────────────┤      │
│  │  │ 动态数量 │ ✅ 支持               │  ❌ 编译期确定           │      │
│  │  │ 性能    │ ✅ 高                 │  ✅ 高                  │      │
│  │  │ 灵活性   │ ✅ 高                 │  ⚠️ 有限                │      │
│  │  │ 可读性   │ ⚠️ 中等               │  ✅ 高                  │      │
│  │  │ 取消    │ ✅ 父任务取消 → 子任务  │  ✅ 父任务取消 → 子任务   │      │
│  │  └───────┴───────────────────────┴───────────────────────┘      │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  结构化并发 vs 非结构化并发：                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  特性          │  结构化（withTaskGroup/async let）  │  非结构化（Task）     │   │
│  │  ├─────────────┼───────────────────────────────┼────────────────────┤   │
│  │  生命周期      │ 自动管理                        │ 手动管理            │   │
│  │  取消传播      │ ✅ 自动                          │  ❌ 手动            │   │
│  │  错误传播      │ ✅ 自动                          │  ⚠️ 手动            │   │
│  │  内存安全      │ ✅ 编译期检查                    │  ⚠️ 运行时          │   │
│  │  适用场景      │ 确定数量的任务                    │ 动态/后台任务       │   │
│  │  性能          │ ✅ 高                            │  ✅ 高              │   │
│  └─────────────┴───────────────────────────────┴────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 6. 并发调试与测试

```
并发调试与测试：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  并发调试工具：                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. Thread Sanitizer（TSan）                              │   │
│  │     • 检测数据竞争（Data Race）                            │   │
│  │     • Xcode → Product → Profile → Thread Sanitizer          │   │
│  │     • 运行时检查，不添加代码                                │   │
│  │                                                                  │   │
│  │  2. Xcode Concurrency Mode                                │   │
│  │     • 启用并发模式检查                                     │   │
│  │     • Build Settings → Swift Concurrency                    │   │
│  │                                                                  │   │
│  │  3. OSLog 并发日志                                          │   │
│  │     • os_log 记录并发事件                                   │   │
│  │     • ActivityTracing 分析                                  │   │
│  │                                                                  │   │
│  │  4. Instruments                                            │   │
│  │     • Thread Debugger                                       │   │
│  │     • Time Profiler                                           │   │
│  │     • Allocation Tracker                                     │   │
│  │                                                                  │   │
│  │  ⚠️ 常见并发问题：                                          │   │
│  │  • Data Race：多线程同时读写同一个变量                        │   │
│  │  • Deadlock：任务互相等待                                    │   │
│  │  • Task Leaks：任务未正确取消                                │   │
│  │  • Task Cancellation：取消未正确传播                        │   │
│  │  • Task Priority：优先级未正确设置                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  并发测试策略：                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  // XCTest + async/await                                    │
│  │  func testAsyncFunction() async {                            │
│  │      let result = try await fetchData()                       │
│  │      XCTAssertNotNil(result)                                   │
│  │      XCTAssertTrue(result.count > 0)                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // 并发测试                                                 │
│  │  func testConcurrentAccess() async {                          │
│  │      let group = DispatchGroup()                               │
│  │      for _ in 0..<100 {                                       │
│  │          group.enter()                                          │
│  │          Task {                                                │
│  │              await cache.set(key: "test", value: "value")       │
│  │              group.leave()                                       │
│  │          }                                                      │
│  │      }                                                          │
│  │      group.wait()                                              │
│  │      let value = await cache.get(key: "test")                 │
│  │      XCTAssertEqual(value, "value")                            │
│  │  }                                                              │
│  │                                                                  │
│  │  // Task 取消测试                                             │
│  │  func testCancellation() async {                              │
│  │      let task = Task {                                         │
│  │          try await Task.sleep(nanoseconds: 1_000_000_000)       │
│  │      }                                                          │
│  │      task.cancel()                                               │
│  │      do {                                                      │
│  │          try await task.value                                   │
│  │      } catch is CancellationError {                            │
│  │          XCTAssertTrue(true)  // ✅ 取消成功                   │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  ⚠️ 测试注意事项：                                          │   │
│  │  • 测试 async 函数需要 async 标记                              │   │
│  │  • XCTest 自动支持 async 测试                                   │   │
│  │  • 并发测试需要多次运行才能检测到数据竞争                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  性能分析：                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • async/await 性能：O(1) 协程切换                         │   │
│  │  • Actor 隔离性能：O(1) 协程调度                            │   │
│  │  • Task 创建性能：约 4KB/任务                               │   │
│  │  • 与 GCD 对比：async/await 更简洁、更安全                   │   │
│  │  • Swift 6 Sendable：编译期检查，零运行时开销               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Swift 6 与 Swift 5 并发对比：                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  特性              │  Swift 5 Concurrency      │  Swift 6       │   │
│  │  ├─────────────┼───────────────────────────┼───────────────┤   │
│  │  Sendable        │ 可选                    │ 强制检查        │   │
│  │  Data Isolation  │ 无                      │ 严格隔离        │   │
│  │  Actor           │ 可用但宽松               │ 严格隔离        │   │
│  │  编译期检查      │ 宽松                    │ 严格            │   │
│  │  兼容性           │ Swift 5.5+              │ Swift 6+        │   │
│  │  推荐           │ 逐步迁移到 Swift 6       │ 使用 Swift 6   │   │
│  └─────────────┴───────────────────────────┴───────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 7. GCD 迁移到 async-await

```
GCD 迁移到 async/await：
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  迁移策略：                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  // GCD 异步任务                                                │
│  │  DispatchQueue.global().async {                                │
│  │      let data = networkRequest()                               │
│  │      DispatchQueue.main.async {                                │
│  │          updateUI(data)                                         │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // → async/await                                              │
│  │  Task {                                                         │
│  │      let data = await networkRequest()                          │
│  │      Task { @MainActor in                                       │
│  │          updateUI(data)                                          │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // GCD 串行队列                                                 │
│  │  let queue = DispatchQueue(label: "com.app.serial")             │
│  │  queue.async { firstTask() }                                    │
│  │  queue.async { secondTask() }                                  │
│  │                                                                  │
│  │  // → async/await（actor）                                      │
│  │  actor SerialQueue {                                            │
│  │      private var pending = [() -> Void]()                       │
│  │      func execute(_ work: @escaping () -> Void) {              │
│  │          pending.append(work)                                    │
│  │          processNext()                                            │
│  │      }                                                          │
│  │      func processNext() {                                       │
│  │          guard let work = pending.first else { return }          │
│  │          pending.removeFirst()                                   │
│  │          work()                                                  │
│  │          processNext()                                            │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // GCD 信号量                                                  │
│  │  let semaphore = DispatchSemaphore(value: 0)                    │
│  │  queue.async {                                                   │
│  │      doWork()                                                    │
│  │      semaphore.signal()                                           │
│  │  }                                                              │
│  │  semaphore.wait()                                               │
│  │                                                                  │
│  │  // → async/await（withCheckedContinuation）                    │
│  │  let result = try await withCheckedContinuation { continuation in  │
│  │      queue.async {                                               │
│  │          doWork()                                                │
│  │          continuation.resume()                                   │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // GCD 栅栏（barrier）                                          │
│  │  queue.async(flags: .barrier) { writeData() }                   │
│  │                                                                  │
│  │  // → async/await（actor 天然串行）                              │
│  │  actor DataStore {                                              │
│  │      func write(_ data: Data) {                                │
│  │          // 自动串行，天然屏障                                      │
│  │      }                                                          │
│  │  }                                                              │
│  │                                                                  │
│  │  // GCD 任务组                                                  │
│  │  let group = DispatchGroup()                                    │
│  │  for id in ids {                                                │
│  │      group.enter()                                              │
│  │      queue.async {                                              │
│  │          fetchData(id: id)                                       │
│  │          group.leave()                                           │
│  │      }                                                          │
│  │  }                                                              │
│  │  group.notify(queue: .main) {                                   │
│  │      completeAll()                                              │
│  │  }                                                              │
│  │                                                                  │
│  │  // → async/await（withTaskGroup）                               │
│  │  await withTaskGroup(of: Data.self) { group in                │
│  │      for id in ids {                                            │
│  │          group.addTask {                                        │
│  │              try await fetchData(id: id)                          │
│  │          }                                                      │
│  │      }                                                          │
│  │  }                                                              │
│  │  completeAll()                                                  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  迁移收益：                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • 代码更简洁：消除嵌套回调（Callback Hell）                   │   │
│  │  • 更安全：编译期检查（Sendable + Data Isolation）             │   │
│  │  • 更清晰：结构化并发保证任务生命周期                          │   │
│  │  • 更易调试：Task 取消自动传播                               │   │
│  │  • 性能：async/await 与 GCD 相当（协程 vs 线程池）            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 8. 面试题汇总

### 高频面试题

**Q1: async/await 的核心原理？**

**答**：
- async/await 是异步编程的语法糖
- 编译器将 async 函数转换为状态机
- 在 await 点挂起，等待后恢复
- 使用协程（Coroutine），轻量级（约 4KB 栈空间）
- 不创建新线程，只是异步调度

**Q2: TaskGroup 的工作原理？**

**答**：
- 创建多个并行任务
- 任务组自动管理任务生命周期
- 所有子任务完成后 group 退出
- 父任务取消 → 子任务也取消
- 支持并发、类型安全

**Q3: Actor 的核心机制？**

**答**：
- Actor 是引用类型，内部状态自动线程安全
- Actor 的方法调用是异步的
- 同一 Actor 的方法串行执行（天然屏障）
- 跨 Actor 调用必须是 async
- 不能继承（保证隔离性）

**Q4: Sendable 的作用？**

**答**：
- 标记类型可以在线程间安全传递
- Swift 6 编译期检查数据隔离
- 值类型默认 Sendable
- 引用类型需要手动实现
- 编译期检查，零运行时开销

**Q5: 结构化并发 vs 非结构化并发？**

**答**：
- 结构化：任务生命周期明确，自动传播取消
- 非结构化：手动管理，Task { }
- 推荐优先使用结构化并发
- 非结构化适用于后台/独立任务

**Q6: GCD 迁移到 async/await 的收益？**

**答**：
- 代码更简洁（消除回调地狱）
- 更安全（编译期检查）
- 更清晰（结构化并发）
- 更易调试（任务取消自动传播）
- 性能相当

---

## 9. 参考资源

- [Apple: Swift Concurrency](https://developer.apple.com/documentation/swift/concurrency)
- [Apple: Swift 6 Migration Guide](https://www.swift.org/documentation/)
- [Apple: Structured Concurrency](https://www.swift.org/blog/swift-concurrency/)
- [WWDC 2021: Meet Swift Concurrency](https://developer.apple.com/videos/play/wwdc2021/10216/)
- [WWDC 2022: Build concurrent data pipelines](https://developer.apple.com/videos/play/wwdc2022/110260/)
- [WWDC 2023: Swift concurrency deep dive](https://developer.apple.com/videos/play/wwdc2023/722/)
- [WWDC 2024: Swift concurrency best practices](https://developer.apple.com/videos/play/wwdc2024/10268/)
- [Swift by Sundell: Swift Concurrency](https://www.swiftbysundell.com/articles/swift-concurrency/)
