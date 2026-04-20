# 02 - Runloop 深度

## 目录

1. [RunLoop 内核架构](#1-runloop-内核架构)
2. [Mode 详解](#2-mode-详解)
3. [Source 原理](#3-source-原理)
4. [Timer 原理与精度问题](#4-timer-原理与精度问题)
5. [RunLoop 应用场景](#5-runloop-应用场景)
6. [RunLoop 源码级分析](#6-runloop-源码级分析)
7. [面试题汇总](#7-面试题汇总)

---

## 1. RunLoop 内核架构

### 1.1 Core Foundation RunLoop 对象

```
RunLoop 核心对象（Core Foundation 层级）：
┌──────────────────────────────────────────────────────────┐
│                                                              │
│  1. CFRunLoopRef (RunLoop)                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • modeList：模式列表（Modes）                       │  │
│  │  • currentMode：当前运行的模式                         │  │
│  │  • modes：模式数组                                  │  │
│  │  • observers：观察者列表                              │  │
│  │  • timers：定时器列表                                │  │
│  │  • sources：源列表（Source0/Source1）                │  │
│  │  • port：端口（用于线程间通信）                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  2. CFRunLoopModeRef (模式)                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • name：模式名称（NSDefaultRunLoopMode 等）           │  │
│  │  • sources0：Source0（非系统事件）                      │  │
│  │  • sources1：Source1（系统事件/端口）                   │  │
│  │  • timers：定时器列表                                  │  │
│  │  • observers：观察者列表                               │  │
│  │  • port：端口                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  3. CFRunLoopSourceRef (源)                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Source0（非系统事件）                                 │  │
│  │  ├─ 回调函数（callback）                              │  │
│  │  ├─ 上下文（context）                                 │  │
│  │  └─ 用于应用层事件（performSelector 等）               │  │
│  │                                                          │  │
│  │  Source1（系统事件/端口）                              │  │
│  │  ├─ mach_port（端口）                                 │  │
│  │  ├─ handler（回调函数）                               │  │
│  │  └─ 用于系统间通信（Mach port）                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  4. CFRunLoopTimerRef (定时器)                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • interval：间隔时间                                  │  │
│  │  • tolerance：容差（允许的时间偏差）                     │  │
│  │  • handler：回调函数                                   │  │
│  │  • flags：标志（repeating/oneshot）                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  5. CFRunLoopObserverRef (观察者)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • activities：活动类型                                │  │
│  │  • order：优先级                                      │  │
│  │  • callout：回调函数                                   │  │
│  │  • context：上下文                                      │  │
│  │                                                      │  │
│  │  activities（按执行顺序）：                            │  │
│  │  1. Entry（进入）                                    │  │
│  │  2. BeforeTimers（定时器前）                          │  │
│  │  3. BeforeSources（源前）                            │  │
│  │  4. BeforeWait（等待前）                              │  │
│  │  5. AfterWait（等待后）                              │  │
│  │  6. Exit（退出）                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└───────────────────────────────────────────────────────────┘
*/
```

### 1.2 线程与 RunLoop 的关系

```
线程与 RunLoop 映射关系：
┌──────────────────────────────────────────────────┐
│                                                              │
│  每个线程（包括主线程）都有一个 RunLoop                      │
│  • 主线程的 RunLoop 由 UIKit 自动创建                        │
│  • 子线程的 RunLoop 需要手动创建                            │
│  • 一个线程只有一个 RunLoop 对象                             │
│  • RunLoop 通过线程局部存储（TLS）保存                       │
│                                                              │
│  访问 RunLoop 的方法：                                       │
│  • [NSRunLoop currentRunLoop]    — 获取当前线程的 RunLoop    │
│  • [NSRunLoop mainRunLoop]      — 获取主线程的 RunLoop      │
│  • CFRunLoopGetCurrent()         — CF 版本                   │
│  • CFRunLoopGetMain()            — 主线程 CF 版本           │
│                                                              │
│  线程 RunLoop 生命周期：                                    │
│  • 主线程：自动创建，运行至程序退出                            │
│  • 子线程：手动创建，RunLoop 运行完即销毁                      │
│  • 当子线程没有事件处理时，RunLoop 会自动退出                  │
│                                                              │
│  主线程 RunLoop 保持运行机制：                               │
│  ┌───────────────────────────────────────────────────────┐
│  │  main()                                                    │
│  │  ↓                                                        │
│  │  UIApplicationMain()                                       │
│  │  ↓                                                        │
│  │  [UIApplication sharedApplication] 自动创建主线程 RunLoop   │
│  │  ↓                                                        │
│  │  [[NSRunLoop currentRunLoop] run] — 永远运行                │
│  │  ↓                                                        │
│  │  (等待事件 → 处理事件 → 等待事件 ...)                        │
│  └───────────────────────────────────────────────────────┘
│                                                              │
└────────────────────────────────────────────────────┘

⚠️ 关键理解：
• RunLoop 不是线程的替身，线程才是 RunLoop 的宿主
• RunLoop 只是线程的一个管理器，负责调度事件和定时器
• 主线程的 RunLoop 由 UIKit 自动管理
• 子线程的 RunLoop 需要手动创建并启动
```

### 1.3 RunLoop 模式

```
RunLoop 的标准模式（Core Foundation 定义）：
┌──────────────────────────────────────────────────────────┐
│                                                              │
│  NSDefaultRunLoopMode（kCFRunLoopDefaultMode）              │
│  • 默认模式：普通事件处理                                   │
│  • 包括：UI 事件、定时器、performSelector                   │
│  • 当 UI 滚动时，RunLoop 会切换到 UITrackingRunLoopMode      │
│                                                              │
│  UITrackingRunLoopMode                                           │
│  • UI 滚动模式：保证 UI 流畅                                │
│  • 在 UI 滚动期间，其他模式的任务暂停                        │
│  • UI 事件优先级最高                                         │
│                                                              │
│  NSRunLoopCommonModes（kCFRunLoopCommonModes）              │
│  • 伪模式：不是真正的模式                                    │
│  • 将多个模式归为一组                                        │
│  • 添加到 common modes 的源/定时器在所有 common 模式中运行    │
│                                                              │
│  UIDefaultRunLoopMode = NSDefaultRunLoopMode                  │
│  • UIKit 内部使用                                           │
│                                                              │
│  NSURLSessionConfigurationNSURLSessionTaskOperationMode    │
│  • URLSession 异步回调模式                                  │
│                                                              │
│  GSEventReceiveRunLoopMode                                  │
│  • 底层事件模式                                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

模式切换时机：
┌────────────────────────────────────────────────────────────┐
│                                                              │
│  正常状态：NSDefaultRunLoopMode                              │
│       │                                                    │
│       │ UI 开始滚动                                        │
│       ▼                                                    │
│  UITrackingRunLoopMode                                     │
│       │                                                    │
│       │ UI 滚动结束                                        │
│       ▼                                                    │
│  NSDefaultRunLoopMode（回到默认模式）                       │
│                                                              │
│  ⚠️ 注意：                                                   │
│  • 模式切换是自动的，开发者无需手动管理                      │
│  • 但可以通过 CFRunLoopAddCommonTimer 将定时器添加到 common modes │
│                                                              │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Mode 详解

### 2.1 RunLoop 运行循环机制

```
RunLoop 运行循环（核心机制）：
┌──────────────────────────────────────────────────────────┐
│                                                              │
│  核心循环：                                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  while (!done) {                                  │  │
│  │    1. 通知 Observers：即将进入循环                    │  │
│  │    2. 处理 pending 的 Source0（非系统事件）           │  │
│  │    3. 处理 pending 的 Source1（系统事件/端口）        │  │
│  │    4. 如果没有 Source0/Source1 事件：                │  │
│  │       a. 通知 Observers：即将等待                     │  │
│  │       b. 进入等待，直到有事件或定时器触发              │  │
│  │       c. 通知 Observers：等待唤醒                    │  │
│  │       d. 唤醒后重新处理事件                           │  │
│  │    5. 处理 Timer 事件（如果在等待时间内）              │  │
│  │    6. 通知 Observers：即将退出循环                    │  │
│  │  }                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                              │
│  事件处理优先级（从高到低）：                                 │
│  1. Source1（系统事件/端口）— 高优先级                      │
│  2. Source0（非系统事件）— 中优先级                          │
│  3. Timer — 低优先级                                        │
│                                                              │
│  ⚠️ Timer 精度：                                            │
│  • Timer 在指定的 timeInterval 后触发                       │
│  • 但实际触发时间受 Mode 影响                               │
│  • 如果在 UITrackingRunLoopMode 模式下，Timer 不会触发       │
│  • 解决方案：将 Timer 添加到 NSRunLoopCommonModes            │
│                                                              │
└───────────────────────────────────────────────────────────┘
*/
```

### 2.2 Source 详解

```
Source 系统：
┌───────────────────────────────────────────────────────────┐
│                                                              │
│  Source0（非系统事件）                                       │
│  ┌───────────────────────────────────────────────────┐   │
│  │  • 回调机制                                          │   │
│  │  • 用于应用层事件（performSelector、自定义事件）       │   │
│  │  • 手动触发（通过 CFRunLoopSourceSignal）              │   │
│  │  • 不直接绑定端口                                     │   │
│  │                                                  │   │
│  │  触发流程：                                          │   │
│  │  1. 调用 CFRunLoopSourceSignal(source)              │   │
│  │  2. 通知 RunLoop 有事件待处理                          │   │
│  │  3. RunLoop 在下一循环调用 Source0 的 handler        │   │
│  └───────────────────────────────────────────────┘   │
│                                                              │
│  Source1（系统事件/端口）                                    │
│  ┌───────────────────────────────────────────────────┐   │
│  │  • mach_port 机制                                   │   │
│  │  • 用于系统间通信（Mach port）                       │   │
│  │  • 系统自动触发                                      │   │
│  │  • 基于 GCD 的 dispatch 也通过 Source1 实现           │   │
│  │                                                  │   │
│  │  触发流程：                                          │   │
│  │  1. 系统发送消息到 mach_port                        │   │
│  │  2. Source1 收到事件                                │   │
│  │  3. 调用 Source1 的 handler                         │   │
│  │  4. dispatch_async 的 block 通过 Source1 触发         │   │
│  └───────────────────────────────────────────────┘   │
│                                                              │
│  dispatch_async 与 RunLoop 的关系：                        │
│  ┌───────────────────────────────────────────────┐    │
│  │  当 dispatch_async 发送到主线程时：                    │
│  │  1. 创建 GCD Source（Source1）                      │    │
│  │  2. 通过 mach_port 通知 RunLoop                       │
│  │  3. RunLoop 在下一个循环处理 Source                   │
│  │  4. handler 执行 dispatch queue 的 block             │
│  │                                                  │    │
│  │  ⚠️ 如果在主线程的 runLoop 中 dispatch_async：       │
│  │     当前 RunLoop 循环不会执行该 block                    │
│  │     要等到下一个循环才执行                                │
│  │     解决方案：CFRunLoopWakeUp() 或 dispatch_sync  │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
*/
```

### 2.3 Timer 精度与容差

```
Timer 精度问题（经典面试题）：
┌──────────────────────────────────────────────────────┐
│                                                              │
│  Timer 触发时间偏差原因：                                   │
│  ┌───────────────────────────────────────────────────┐    │
│  │  1. Mode 切换                                       │    │
│  │     • 在 UITrackingRunLoopMode 模式下 Timer 不触发    │
│  │     • UI 滚动时 Timer 延迟触发                        │
│  │     • 解决方案：添加到 common modes                  │
│  │                                                   │    │
│  │  2. 任务执行耗时                                     │
│  │     • Timer 回调任务耗时 > timeInterval             │
│  │     • Timer 不会重叠执行，等前一个完成后再触发         │
│  │     • 解决方案：使用 CADisplayLink 替代              │
│  │                                                   │    │
│  │  3. RunLoop 唤醒延迟                                 │
│  │     • 等待事件时 RunLoop 进入休眠                     │
│  │     • 从休眠到唤醒有延迟                              │
│  │     • 解决方案：使用 NSTimer.tolerance（iOS 10+）    │
│  │                                                   │    │
│  │  4. 线程阻塞                                         │
│  │     • 主线程被阻塞时 Timer 不会触发                   │
│  │     • 解决方案：不要在主线程执行耗时任务              │
│  └─────────────────────────────────────────────────┘    │
│                                                              │
│  NSTimer.tolerance（iOS 10+）：                           │
│  ┌───────────────────────────────────────────────────┐    │
│  │  • tolerance 指定允许的时间偏差                      │
│  │  • 系统利用 tolerance 优化电源消耗                   │
│  │  • 如果 tolerance = 1.0s，系统可以将 Timer 触发      │
│  │    时间提前/延后最多 1 秒                            │
│  │  • 适用于：不要求精确时间的 Timer                     │
│  │  • 示例：NSTimer scheduledTimerWithTimeInterval:     │
│  │      tolerance: executingHandler:                    │
│  └──────────────────────────────────────────────┘    │
│                                                              │
│  Timer 创建方式对比：                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  创建方式                          │  说明                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  scheduledTimer:                   │  添加到默认 RunLoop   │  │
│  │  scheduledTimerWithTimeInterval:   │  同上，自定义间隔    │  │
│  │  timerWithTimeInterval:            │  不自动添加           │  │
│  │  CADisplayLink                     │  与屏幕刷新同步       │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
*/
```

---

## 3. RunLoop 应用场景

### 3.1 典型应用场景

```objc
/*
RunLoop 的典型应用场景：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  场景 1：NSTimer 在 UI 滚动时不暂停                           │
│  ─────────────────────────────────────────────                │
│                                                              │
│  问题：NSTimer 在 UI 滚动时被暂停                             │
│  原因：滚动时 RunLoop 切换到 UITrackingRunLoopMode            │
│  解决：将 Timer 添加到 common modes                           │
│                                                              │
│  // 方案 1：添加到 common modes                              │
│  [timer runLoop: [NSRunLoop currentRunLoop]                 │
│              forMode: NSRunLoopCommonModes];                  │
│                                                              │
│  // 方案 2：使用 CADisplayLink（与屏幕刷新同步）              │
│  CADisplayLink *link = [CADisplayLink                       │
│      displayLinkWithTarget:self                               │
│      selector:@selector(update:)];                          │
│  [link addToRunLoop:[NSRunLoop currentRunLoop]                │
│      forMode: NSRunLoopCommonModes];                          │
│                                                              │
│  ─────────────────────────────────────────────                │
│  场景 2：异步操作在主线程回调                                 │
│  ─────────────────────────────────────────────                │
│                                                              │
│  dispatch_async(dispatch_get_main_queue(), ^{                │
│      // 不会在当前 RunLoop 循环执行                          │
│      // 要等到下一个循环才执行                                │
│      [self doSomething];                                    │
│  });                                                         │
│                                                              │
│  解决方案：                                                  │
│  // 方案 1：直接调用（不在 RunLoop 中）                       │
│  [self doSomething];                                        │
│                                                              │
│  // 方案 2：唤醒 RunLoop                                      │
│  CFRunLoopWakeUp(CFRunLoopGetCurrent());                      │
│                                                              │
│  // 方案 3：dispatch_sync（同步调用）                        │
│  dispatch_sync(dispatch_get_main_queue(), ^{                 │
│      [self doSomething];                                    │
│  });                                                         │
│                                                              │
│  ─────────────────────────────────────────────                │
│  场景 3：子线程维持 RunLoop 运行                              │
│  ─────────────────────────────────────────────                │
│                                                              │
│  // 创建子线程 + RunLoop                                     │
│  NSThread *thread = [[NSThread alloc]                       │
│      initWithTarget:self                                      │
│      selector:@selector(runLoopThread)                        │
│      object:nil];                                             │
│  [thread start];                                              │
│                                                              │
│  - (void)runLoopThread {                                      │
│      [[NSRunLoop currentRunLoop] addTimer:timer               │
│      forMode:NSDefaultRunLoopMode];                          │
│      [[NSRunLoop currentRunLoop] run];                        │
│  }                                                            │
│                                                              │
│  ─────────────────────────────────────────────                │
│  场景 4：GCD 的 main queue 与 RunLoop 的关系                  │
│  ─────────────────────────────────────────────                │
│                                                              │
│  • GCD 的 main queue 基于主线程的 RunLoop                      │
│  • dispatch_async(main) 的 block 通过 RunLoop 触发            │
│  • 如果主线程的 RunLoop 没有运行，block 不会执行                │
│  • 如果主线程的 RunLoop 正在等待（休眠），block 不会立即执行    │
│                                                              │
│  ─────────────────────────────────────────────                │
│  场景 5：网络请求回调在主线程执行                              │
│  ─────────────────────────────────────────────                │
│                                                              │
│  • NSURLSession 的 delegate 回调默认在主线程的 RunLoop 中执行  │
│  • 这是因为 URLSession 将回调添加到主线程的 RunLoop             │
│  • 可以通过 configuration.queue 指定回调队列                  │
│                                                              │
│  ─────────────────────────────────────────────                │
│  场景 6：performSelector 的实现原理                            │
│  ─────────────────────────────────────────────                │
│                                                              │
│  • performSelector:withObject:afterDelay:                     │
│    本质上是通过 NSTimer + RunLoop 实现                       │
│  • Timer 被添加到 RunLoop 中，在指定时间触发                   │
│  • 触发时调用目标对象的方法                                   │
│  • 如果 RunLoop 处于 UITrackingRunLoopMode，延迟会不准确        │
│                                                              │
└─────────────────────────────────────────────────────────┘
*/
```

---

## 4. RunLoop 源码级分析

### 4.1 CFRunLoop 源码关键结构

```objc
/*
CFRunLoop 核心源码结构（简化版）：
┌─────────────────────────────────────────────────────┐
│                                                      │
│  struct __CFRunLoop {                                │
│      CFRuntimeBase _base;                            │
│      pthread_t _pthread;                             │
│      uint32_t _modeListCount;                        │
│      CFMutableSetRef _modes;                         │  /* 模式集合           │
│      void *_dispatchQueue;                           │  /* GCD 队列          │
│      dispatch_source_t _dispatchSource;              │  /* Dispatch Source   │
│      CFStringRef _name;                              │  /* RunLoop 名称      │
│      int _spinCount;                                 │  /* 自旋计数           │
│  };                                                  │
│                                                      │
│  struct __CFRunLoopMode {                             │
│      CFRuntimeBase _base;                             │
│      CFStringRef _name;                              │  /* 模式名称           │
│      bool _stopped;                                  │
│      CFMutableSetRef _sources0;                      │  /* Source0 集合      │
│      CFMutableSetRef _sources1;                      │  /* Source1 集合      │
│      CFMutableArrayRef _observers;                   │  /* 观察者             │
│      CFMutableArrayRef _timers;                      │  /* Timer 集合         │
│      dispatch_source_t _dispatchSource;              │
│  };                                                  │
│                                                      │
│  struct __CFRunLoopObserver {                         │
│      CFRuntimeBase _base;                             │
│      uint32_t _bits;                                 │  /* 活动类型           │
│      CFMutableArrayRef _calloutArray;                │  /* callout 数组       │
│  };                                                  │
│                                                      │
│  struct __CFRunLoopSource {                           │
│      CFRuntimeBase _base;                             │
│      uint32_t _bits;                                 │
│      CFMutableSetRef _runLoops;                      │  /* 所属 RunLoop      │
│      void *_context;                                 │  /* 上下文             │
│      uint32_t _order;                                │  /* 优先级             │
│  };                                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
*/
```

### 4.2 CFRunLoopRun 源码核心流程

```objc
/*
CFRunLoopRun 核心循环（源码级）：
┌──────────────────────────────────────────────────────┐
│                                                      │
│  int CFRunLoopRun(void) {                            │
│      int __CFRunLoopRun(CFRunLoopRef rl,            │
│          CFRunLoopModeRef rlm,                       │
│          CFTimeInterval seconds,                     │
│          Boolean stopAfterHandle) {                   │
│                                                          │
│      // 1. 通知 Observer：进入循环                       │
│      __CFRunLoopDoObservers(rl, rlm, kCFRunLoopEntry); │
│                                                          │
│      // 2. 执行 Dispatch Source                          │
│      dispatch_resume(rlm->_dispatchSource);           │
│                                                          │
│      // 3. 处理 pending 的 Source0                        │
│      boolean sources0Handled = false;                   │
│      do {                                              │
│          sources0Handled = __CFRunLoopDoSources0(...);  │
│      } while (sources0Handled);                        │
│                                                          │
│      // 4. 处理 pending 的 Source1                        │
│      boolean sourceHandled = false;                     │
│      if (!stopAfterHandle) {                           │
│          __CFRunLoopDoSources1(...);                    │
│      }                                                  │
│                                                          │
│      // 5. 处理 Timers                                  │
│      __CFRunLoopDoTimers(rl, rlm, mach_absolute_time());│
│                                                          │
│      // 6. 如果有 Dispatch Source，处理它                │
│      __CFRunLoopDoDispatch(...);                        │
│                                                          │
│      // 7. 进入等待（如果没有更多事件）                   │
│      if (!stopAfterHandle) {                           │
│          __CFRunLoopDoObservers(rl, rlm,               │
│              kCFRunLoopBeforeWaiting);                  │
│          __CFRunLoopWait(...);  // 等待事件              │
│          __CFRunLoopDoObservers(rl, rlm,               │
│              kCFRunLoopAfterWaiting);                   │
│      }                                                  │
│                                                          │
│      // 8. 通知 Observer：退出循环                       │
│      __CFRunLoopDoObservers(rl, rlm,                    │
│          kCFRunLoopExit);                              │
│                                                          │
│      return result;                                     │
│  }                                                      │
│                                                      │
│  ⚠️ 关键理解：                                        │
│  • RunLoop 是一个 while 循环，持续等待和处理事件         │
│  • 事件处理完成后进入等待（休眠）                        │
│  • 有事件或定时器触发时唤醒                              │
│  • 主线程的 RunLoop 永远不会退出                       │
│                                                      │
└──────────────────────────────────────────────────────┘
*/
```

---

## 5. RunLoop 应用场景深度分析

### 5.1 性能优化中的应用

```objc
/*
RunLoop 在性能优化中的应用：
┌───────────────────────────────────────────────────────┐
│                                                      │
│  1. 延迟加载：                                       │
│  • 在 runLoop 的 BeforeWait 阶段进行数据加载            │
│  • 利用等待时间做后台处理                               │
│  • 在 AfterWait 阶段更新 UI                             │
│                                                      │
│  2. 批量更新：                                       │
│  • 在 BeforeTimers 阶段合并多个更新                    │
│  • 减少重复的 layout/relayout                          │
│                                                      │
│  3. 避免频繁更新：                                   │
│  • 不要在 BeforeSources 阶段做耗时操作                 │
│  • 使用 CADisplayLink 替代 Timer（与屏幕刷新同步）     │
│                                                      │
│  4. 主线程保活：                                    │
│  • 子线程使用 RunLoop 保持活跃                        │
│  • 添加 Timer/Source 到 RunLoop                      │
│  • 调用 [[NSRunLoop currentRunLoop] run]              │
│                                                      │
│  5. 网络请求回调：                                   │
│  • URLSession 默认在主线程的 RunLoop 中回调            │
│  • 可以通过 configuration.queue 指定其他队列            │
│                                                      │
└───────────────────────────────────────────────────────┘

RunLoop 的常见坑：
┌───────────────────────────────────────────────────────┐
│  坑 1：Timer 在 UI 滚动时被暂停                       │
│  解：添加到 common modes                              │
│                                                      │
│  坑 2：dispatch_async(main) 不立即执行                │
│  解：直接调用或 CFRunLoopWakeUp                       │
│                                                      │
│  坑 3：performSelector:afterDelay: 不准                │
│  解：使用 CADisplayLink 或 NSTimer                    │
│                                                      │
│  坑 4：子线程 RunLoop 自动退出                         │
│  解：添加 Timer/Source 或调用 run                     │
│                                                      │
│  坑 5：RunLoop 阻塞导致事件不处理                      │
│  解：不要在 RunLoop 中做耗时操作                       │
│                                                      │
└───────────────────────────────────────────────────────┘
*/
```

---

## 6. 面试题汇总

### 高频面试题

**Q1: RunLoop 的核心作用是什么？**

**答**：
- RunLoop 是事件处理和管理线程运行的核心机制
- 保持线程活跃（主线程通过 RunLoop 保持运行）
- 调度事件和定时器（Source0/Source1/Timer）
- 协调事件分发（UI 事件、网络回调、定时器）

**Q2: RunLoop 的 Mode 有哪些？**

**答**：
- NSDefaultRunLoopMode：默认模式（普通事件处理）
- UITrackingRunLoopMode：UI 滚动模式（保证流畅）
- NSRunLoopCommonModes：伪模式（归组）
- UIDefaultRunLoopMode、NSURLSession 模式等

**Q3: RunLoop 的 Source 和 Timer 的关系？**

**答**：
- Source0：非系统事件，需要手动触发
- Source1：系统事件/端口，通过 mach_port 触发
- Timer 是 Source 的一种封装，底层也是 mach port
- Timer 在指定的 timeInterval 后触发，实际受 Mode 影响
- 在 UITrackingRunLoopMode 下 Timer 不会触发
- 解决方案：添加到 common modes 或使用 CADisplayLink

**Q4: dispatch_async(main) 为什么不立即执行？**

**答**：
- dispatch_async 通过 RunLoop 的 Source1 触发
- RunLoop 当前循环已经处理完 Source1，要等到下一个循环
- 解决方案：直接调用、CFRunLoopWakeUp、或 dispatch_sync

**Q5: RunLoop 的 Observer 有哪些活动类型？**

**答**：
1. Entry：进入循环
2. BeforeTimers：定时器前
3. BeforeSources：源前
4. BeforeWait：等待前
5. AfterWait：等待后
6. Exit：退出循环

**Q6: 如何实现一个子线程的长期运行？**

**答**：
- 创建子线程
- 在子线程中创建 RunLoop
- 添加 Timer/Source 到 RunLoop
- 调用 [[NSRunLoop currentRunLoop] run]
- 或者使用 dispatch queue + RunLoop 配合

---

## 7. 参考资源

- [Apple: RunLoop Programming Guide](https://developer.apple.com/documentation/foundation/cfrunloop)
- [Apple: CFRunLoopRef Reference](https://developer.apple.com/documentation/corefoundation/cfrunloop)
- [Core Foundation: RunLoop Source Code](https://opensource.apple.com/tarballs/CF/)
- [NSHipster: RunLoop](https://nshipster.com/runloop)
- [objc.io: RunLoop](https://www.objc.io/issues/13-concurrency/runloop/)
- [WWDC 2018: Modern RunLoop Techniques](https://developer.apple.com/videos/play/wwdc2018/224)
- [WWDC 2020: What's New in Concurrency](https://developer.apple.com/videos/play/wwdc2020/10149)
