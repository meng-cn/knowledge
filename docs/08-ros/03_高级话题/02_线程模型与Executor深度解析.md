# 02 线程模型与 Executor 深度解析

> **位置**：`08-ros / 03_高级话题 / 02_线程模型与Executor深度解析.md`
> **难度**：⭐（高 —— 入门门槛高，面向进阶读者）
> **前置知识**：C++ 多线程基础（`std::thread`/`std::mutex`）、ROS 2 回调与 spin 的基本用法、[01_ROS2架构分层详解](./01_ROS2架构分层详解.md)。
> **交叉引用**：[模块一 · 基础概念](../01_基础概念/README.md)、[03_实时性与任务调度](./03_实时性与任务调度.md)。

---

## 1. 概述

执行器（Executor）是 ROS 2 里"把 DDS 数据变成你的回调函数"的调度中枢。绝大多数性能问题、死锁、实时性问题，最终都落在**回调在哪个线程、以什么顺序、能否并发**上。本文从源码级讲清楚三件事：

1. Callback Group 的 `MutuallyExclusive` 与 `Reentrant` 到底是怎么实现的（不是玄学，是一个原子标志）。
2. `SingleThreadedExecutor` 与 `MultiThreadedExecutor` 的事件派发循环与线程池创建时机。
3. 常见的死锁模式与排查手段，以及 rclpy 里 GIL 对并发的真实约束。

---

## 2. 核心概念

### 2.1 Callback Group

回调组（`rclcpp::CallbackGroup`）把一个节点内的若干回调（订阅/定时器/服务/客户端）归成一组，并规定组内回调的并发策略：

- `MutuallyExclusive`（互斥，默认）：**同一组内的回调同一时刻最多一个在执行**。
- `Reentrant`（可重入）：组内回调**可以并发**执行（前提是 executor 有多个线程）。

### 2.2 Executor 类型

- `SingleThreadedExecutor`：单线程顺序派发。
- `MultiThreadedExecutor`：多线程，构造时指定线程数。
- `StaticSingleThreadedExecutor`：编译期确定实体集合，省去运行时扫描（实时优化）。
- 实验性 `EventsExecutor`：基于事件（而非轮询 waitset）的实时执行器。

### 2.3 就绪实体（Executable）

executor 内部把"有活可干"的实体抽象为 Executable（订阅可 take、定时器到期、服务请求待处理、guard condition 被触发、客户端收到响应），派发循环就是不断"找就绪的 Executable → 执行它"。

### 2.4 派发循环三阶段

`wait → take → invoke`：先阻塞等待（`rcl_wait`），就绪后取出数据（`rcl_take`/`rcl_service_take_request`），最后调用用户回调（invoke）。

---

## 3. 技术原理（架构 / 源码级）

### 3.1 CallbackGroup 的精确实现（关键：一个原子标志）

`rclcpp/callback_group.hpp` 中，`CallbackGroup` 的关键成员：

```cpp
class CallbackGroup {
  CallbackGroupType type_;          // MutuallyExclusive / Reentrant
  std::atomic_bool can_be_taken_from_;   // 组是否可被"取走"一个回调
  std::mutex mutex_;                // 仅保护实体登记列表，不负责回调串行化
  std::vector<rclcpp::SubscriptionBase::WeakPtr> subscription_ptrs_;
  // ... timers / services / clients / waitables
};
```

**串行化机制**（这是面试高频点，务必记准）：

- 当 executor 的 `get_next_executable()` 要从某组取一个回调时，对 `MutuallyExclusive` 组执行 `can_be_taken_from_.exchange(false)`：
  - 若之前是 `true` → 置为 `false`，**允许取出**该回调。
  - 若之前是 `false`（说明组内已有一个回调在执行）→ **跳过这个组**，不取。
- 回调执行完毕后，executor 在 `execute_subscription()` / `execute_timer()` 等结束时执行 `can_be_taken_from_.store(true)`，释放"占用"。
- 对 `Reentrant` 组，**从不操作这个标志**，因此多个线程可以同时取走该组的多个回调。

> 结论：互斥串行化**不是**靠 `std::mutex`（那个 mutex 只保护实体列表的增删），而是靠 `can_be_taken_from_` 这个原子 bool 做的一个轻量级"令牌"。这是 O(1) 的无锁互斥，比真锁开销小，且天然跨线程可见。

### 3.2 SingleThreadedExecutor 的事件派发循环

`SingleThreadedExecutor::spin()` 内部就是 `Executor::spin()` 的循环，每轮：

```
while (rclcpp::ok(context) && spinning) {
  Executable any_exec;
  if (get_next_executable(any_exec, timeout)) {   // 内含 rcl_wait 阻塞
    execute_any_executable(any_exec);             // take + invoke 用户回调
  }
}
```

- `get_next_executable()` → `wait_for_work(timeout)` 调 `rcl_wait()` 阻塞等待任意实体就绪；返回后按固定优先级（timer > subscription > service > client > waitable）挑选**一个** Executable。
- 因为是单线程，**一个回调执行期间，其它回调只能排队**，这直接导致下文的同步客户端死锁。

### 3.3 MultiThreadedExecutor 的线程模型（纠正一个常见误解）

`MultiThreadedExecutor`（`rclcpp/executors/multi_threaded_executor.cpp`）：

- 构造函数只保存 `number_of_threads_`，**不创建线程**。
- 线程在 **`spin()` 首次调用时创建**：`spin()` 里若 `number_of_threads_ > 1`，就 `std::thread` 起 `number_of_threads_ - 1` 个后台线程，每个线程跑同一个 `run(thread_id)`，**调用线程自己也跑 `run()`**，最后 `join` 回收。

> ⚠️ 常见误解：MT executor 并非"一个线程专职 wait，另有一个 worker 线程池执行回调"。真实模型是 **N 个对称线程**，每个线程都跑 `wait_for_work → get_next_executable → execute_any_executable` 的同一循环。多个线程共享 waitset/就绪队列，靠 `get_next_executable` 里对 callback group 的 `can_be_taken_from_` 原子操作**抢**就绪回调——所以互斥组天然安全，无需额外加锁。

**锁粒度**：`wait_for_work` 期间线程在 `rcl_wait` 上阻塞（不占 CPU）；拿到就绪集合后，多个线程竞争同一组时用原子操作仲裁，临界区极短。

### 3.4 常见死锁模式与排查

**模式 A：单线程里同步调用服务（最经典）**

```cpp
// 一个 MutuallyExclusive 组 + SingleThreadedExecutor
auto client = node->create_client<AddTwoInts>("add");
void timer_cb() {
  auto fut = client->async_send_request(req);   // 注意：这是异步版本
  // 若这里用 client->send_request(req)（同步阻塞），且响应回调也在同一执行器，
  // 单线程会卡死在等待响应，响应回调永远没机会执行 → 死锁
}
```

**模式 B：跨组互等 / 持锁调 service**

```cpp
std::mutex m;
// 回调1（组A）持有 m 后，同步等待一个由组B回调才能完成的 service 响应；
// 回调2（组B）在响应处理里又要拿 m → 循环等待
```

**排查手段：**

1. `rclcpp::shutdown()` 会触发 guard condition，可尝试让卡死循环退出。
2. 用 `gdb` 或 `ros2 run --prefix 'gdb --args'` 抓 backtrace（`thread apply all bt`），看每个线程卡在哪个 `rcl_wait`/`send_request`。
3. 用 `rclcpp::Executor::spin_some` 或把 service 回调放到独立的 Reentrant/独立 executor 打断依赖。
4. 经验法则：**回调里永远用 `async_send_request` + future/then，或把同步调用放到独立执行器线程**。

### 3.5 rclpy 的 GIL 约束

rclpy 是 CPython 绑定，Python 回调的执行必须持有 **GIL**：

- `rcl_wait` 等待阶段，rclpy 通过 pybind11 的 `gil_scoped_release` **释放 GIL**，所以等待本身是并发的、不阻塞其它 Python 线程。
- 但一旦就绪、进入用户回调（Python 代码），会重新获取 GIL → **同一时刻只有一个 Python 回调在执行字节码**。

> 结论：即便给 rclpy 用 `MultiThreadedExecutor`，Python 层回调实质仍是**串行**的（GIL 序列化）。要真并行，要么用 C++ 回调，要么把重活丢给 `concurrent.futures`/进程池，要么用多进程。

### 3.6 线程数选择经验

- CPU 密集回调：线程数 ≈ CPU 核数（超了只会增加上下文切换）。
- IO/阻塞密集（等 service、等 IO）：可略多于核数，让阻塞线程不占执行名额。
- 实时路径：**专用单线程 executor + 隔离核**（见 [03_实时性与任务调度](./03_实时性与任务调度.md)），别和普通节点共用 MT executor。

---

## 4. 实践指南

### 4.1 声明回调组与执行器

```cpp
auto node = std::make_shared<rclcpp::Node>("demo");

// 互斥组（默认行为也如此）：组内回调串行
auto exclusive_cg = node->create_callback_group(
  rclcpp::CallbackGroupType::MutuallyExclusive);

// 可重入组：允许多线程并发执行组内回调
auto reentrant_cg = node->create_callback_group(
  rclcpp::CallbackGroupType::Reentrant);

auto sub1 = node->create_subscription<std_msgs::msg::String>(
  "topic", 10, cb1, rclcpp::SubscriptionOptions());
sub1->get_subscription_options().callback_group = exclusive_cg;

// 多线程执行器
rclcpp::executors::MultiThreadedExecutor exec(rclcpp::ExecutorOptions(), 4);
exec.add_node(node);
exec.spin();
```

### 4.2 演示"互斥 vs 可重入"的并发差异

```cpp
// Reentrant 组内，两个定时器回调会并发（4 线程执行器下可见交错输出）
auto cg = node->create_callback_group(rclcpp::CallbackGroupType::Reentrant);
auto timer1 = node->create_wall_timer(10ms, [&]{ busy_work("A"); }, cg);
auto timer2 = node->create_wall_timer(10ms, [&]{ busy_work("B"); }, cg);
```

### 4.3 避免单线程死锁的写法

```cpp
// ✅ 异步 + 回调，不阻塞执行器
client->async_send_request(req, [this](rclcpp::Client<AddTwoInts>::SharedFuture f) {
  auto resp = f.get();   // 已完成，不会阻塞
});
```

### 4.4 手动控制线程数（bash/环境）

```bash
# 用 composition 或直接代码里指定；无全局环境变量，
# 线程数由 MultiThreadedExecutor 构造参数决定
```

---

## 5. 方案对比

| 维度 | SingleThreadedExecutor | MultiThreadedExecutor | StaticSingleThreadedExecutor |
|---|---|---|---|
| 线程数 | 1 | N（spin 时创建） | 1 |
| 回调并发 | 无 | 有（受 callback group 约束） | 无 |
| 运行时开销 | 低 | 中（线程+竞争） | 最低（编译期确定实体） |
| 死锁风险 | 高（同步调用即死） | 较低 | 同单线程 |
| 适用 | 简单节点、低并发 | 多回调、需并行 | 固定拓扑的实时节点 |

| 回调组 | 组内并发 | 实现 | 适用 |
|---|---|---|---|
| MutuallyExclusive | 否 | `can_be_taken_from_` 原子令牌 | 共享状态的多个回调 |
| Reentrant | 是 | 不设令牌 | 无共享状态、需并发 |

> **绝对不适用场景**：把**状态强耦合、互相读写的多个回调**放进 `Reentrant` 组再丢给 MT executor——看似提速，实则引入数据竞争和偶发崩溃；此时正确做法是互斥组，或加锁，或用 [04_组件化](./04_组件化与进程内通信.md) 拆开数据流。

---

## 6. 工具链

- `ros2 run --prefix 'gdb --args' <pkg> <node>`：抓 backtrace 排查死锁。
- `htop` / `ps -eLf`：看进程线程数，确认 executor 线程是否如预期。
- `ros2 doctor`、`rqt_graph`：辅助确认拓扑。
- `perf record` / `perf top`：定位回调 CPU 热点。
- 源码：`rclcpp/executors/multi_threaded_executor.{hpp,cpp}`、`rclcpp/callback_group.hpp`、`rclcpp/executor.cpp`。

---

## 7. 参考资料

- rclcpp CallbackGroup 源码：<https://github.com/ros2/rclcpp/blob/rolling/rclcpp/include/rclcpp/callback_group.hpp>
- MultiThreadedExecutor 头文件源码页：<https://docs.ros.org/en/rolling/p/rclcpp/generated/program_listing_file_include_rclcpp_executors_multi_threaded_executor.hpp.html>
- MultiThreadedExecutor 类参考：<https://docs.ros2.org/galactic/api/rclcpp/classrclcpp_1_1executors_1_1MultiThreadedExecutor.html>
- Executor 基类参考：<https://docs.ros.org/en/humble/p/rclcpp/generated/classrclcpp_1_1Executor.html>
- 实验性 EventsExecutor：<https://docs.ros.org/en/iron/p/rclcpp/generated/classrclcpp_1_1experimental_1_1executors_1_1EventsExecutor.html>
- 官方回调组教程（Jazzy）：<https://docs.ros.org/en/jazzy/>（How-To-Guides → Using Callback Groups）
- 设计文档实时提案（waitset/executor 背景）：<https://design.ros2.org/articles/realtime_proposal.html>

---

## 8. 学习路径

1. 复现 4.2：用 Reentrant 组 + 4 线程执行器观察两个定时器回调交错输出。
2. 把组改回 MutuallyExclusive，确认串行。
3. 写一个单线程下同步 service 调用的死锁，再用异步写法修复。
4. 阅读 `callback_group.hpp` 的 `can_be_taken_from_`，与本文 3.1 对照。
5. 进阶：读 [03_实时性与任务调度](./03_实时性与任务调度.md)，理解为何实时路径要专用单线程执行器。

---

## 9. 核心面试三问

1. **MultiThreadedExecutor 下，同一个 `MutuallyExclusive` 回调组内的两个回调可能并发执行吗？为什么？**
   → 不可能。executor 取回调前会对该组执行 `can_be_taken_from_.exchange(false)`：已有一个回调在执行时标志为 `false`，其它线程会跳过该组；回调结束后才 `store(true)`。串行化靠这个原子标志，而非 `std::mutex`。

2. **`MultiThreadedExecutor` 的线程是在构造时创建，还是首次 `spin()` 时创建？底层每个线程在干什么？**
   → 在 `spin()` 首次调用时创建（构造只存 `number_of_threads_`）。线程数是 N 个**对称**线程（不是"一 wait 线程 + worker 池"），每个线程都跑 `wait_for_work → get_next_executable → execute_any_executable`，共享 waitset 并竞争取就绪回调。

3. **为什么 rclpy 用 `MultiThreadedExecutor` 也不能让 Python 回调真正并行？GIL 在哪个阶段被释放？**
   → Python 回调执行需持有 GIL，因此同一时刻只有一个 Python 回调跑字节码，实质串行。rclpy 只在 `rcl_wait` 阻塞等待阶段通过 `gil_scoped_release` 释放 GIL，所以"等待"并发、"执行"串行。
