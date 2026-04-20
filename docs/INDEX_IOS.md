# iOS 开发完整知识图谱 📚

> 🎯 目标：面试准备 + 系统进阶学习  
> 📅 版本：v24.0 | 📅 创建：2026-04-17 | 最终修订：2026-04-21
> 📊 状态：索引已对齐实际文件
> 📅 最终修订：2026-04-21 05:36

---

## 🗺️ 知识地图总览

```
┌──────────────────────────────────────────────────────────────────┐
│                      iOS 开发知识体系                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  一、语言层（Swift）                                              │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ Swift 基础语法 │ Swift 高级特性  │ Swift ↔ OC 混编   │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  二、并发层                                                       │
│  ┌──────────────┬──────────────┐                                │
│  │ GCD + Operation │ async/await + Actor               │              │
│  └──────────────┴──────────────┘                                │
│                                                                  │
│  三、UI 层                                                        │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ UIKit 深入     │ SwiftUI       │ 动画 + 响应式      │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  四、数据层                                                       │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 本地存储       │ 网络编程       │ 内存管理          │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  五、系统层                                                       │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ Runtime/底层   │ 安全与权限     │ 性能优化           │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  六、工程层                                                       │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 工程化与工具   │ 测试与 CI/CD  │ 调试与发布        │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  七、扩展层                                                       │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 地图/多媒体    │ 蓝牙/云服务    │ 前沿技术           │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📖 第一部分：Swift 语言基础（必学 ⭐⭐⭐）

### 1.1 Swift 基础与高级特性

**目标**：掌握 Swift 语言全栈，从语法到高级特性

#### 01_Swift_Language/

```
01_Swift_Language/
├── 01_Swift_Basics.md              # Swift 语法全栈 | ~97KB
│   ├── 变量与常量 / 数据类型 / 流程控制
│   ├── 可选类型 / 枚举 / 结构体 / 类
│   ├── 函数 / 闭包 / 协议 / 泛型
│   ├── 内存布局 / 值类型 vs 引用类型
│   └── Swift vs Kotlin 跨语言对比表
│
├── 02_Swift_Advanced.md            # Swift 高级特性 | ~109KB
│   ├── 泛型约束 / 关联类型 / 类型擦除
│   ├── 协议导向编程 (POP)
│   ├── 关联类型 / where 子句
│   ├── 宏 / Result Builder
│   ├── 模式匹配 / 可调用类型
│   └── 底层：编译器优化 / 内存对齐
│
└── 03_Swift_OC_Bridge.md           # Swift ↔ Objective-C 混编 | ~83KB
    ├── 混编基础 / Bridging Header
    ├── 类型映射 / 内存管理
    ├── 协议混编 / 类混编
    ├── selector 机制 / performSelector
    ├── Toll-free Bridging（CF↔Foundation）
    └── 混编问题 / 常见陷阱
```

**面试高频**：
- ⭐⭐⭐ 可选类型解包 / 闭包捕获列表 / 结构体 vs 类
- ⭐⭐⭐ 泛型约束 vs 关联类型 / 协议 vs 抽象类
- ⭐⭐⭐ ARC 原理 / 强弱引用 / 循环引用
- ⭐⭐ Swift 内存布局 / 值类型 vs 引用类型
- ⭐ Swift ↔ OC 混编 / selector 机制 / Toll-free Bridging

---

## 📖 第二部分：并发编程（必学 ⭐⭐⭐）

### 2.1 并发全栈

**目标**：掌握从 GCD 到 Swift 并发的全栈知识

```
02_Concurrency/
├── 01_GCD_Operation.md             # GCD + Operation 全栈 | ~50KB
│   ├── GCD 全栈：队列 / 组 / 信号量 / 屏障 / DispatchSource
│   ├── Operation 全栈：依赖 / 取消 / 优先级 / 自定义
│   ├── 线程模型：Thread / 线程状态 / 线程安全
│   ├── 锁机制：NSLock / 读写锁 / 原子操作
│   ├── 底层：GCD 内核实现 / 线程调度 / 优先级反转
│   └── 死锁：产生条件 / 避免方案 / 检测工具
│
├── 02_Swift_Concurrency.md         # Swift 现代并发 | ~76KB
│   ├── async/await / Task / TaskGroup
│   ├── Actor / Sendable / MainActor
│   ├── 结构化并发 / 取消机制
│   ├── GCD 迁移到 async-await
│   ├── 并发设计模式 / 最佳实践
│   └── Swift 6 并发特性
│
└── 03_Concurrency_Deep.md          # 并发深度 | ~37KB
    ├── 线程池模型 / 调度策略
    ├── 竞态条件 / 原子操作 / 内存屏障
    ├── 并发性能分析 / 基准测试
    └── Swift vs Kotlin vs Java 并发模型对比
```

**面试高频**：
- ⭐⭐⭐ GCD 队列/组/信号量/屏障的使用场景
- ⭐⭐⭐ async/await / Task/TaskGroup / Actor 隔离
- ⭐⭐⭐ 死锁产生与避免 / 线程安全容器
- ⭐⭐ Operation 队列的依赖图 / 优雅取消

---

## 📖 第三部分：iOS 应用核心（必学 ⭐⭐⭐）

### 3.1 iOS 应用基础

**目标**：理解 iOS 应用运行机制，面试必考

```
03_App_Core/
└── 01_iOS_Basics.md                # iOS 应用基础全栈 | ~169KB
    ├── 应用生命周期：AppDelegate → SceneDelegate
    ├── 启动流程：main() → dyld → UIApplicationMain
    ├── 运行循环：Runloop / Mode / Source / Timer
    ├── 沙盒机制：目录结构 / 文件权限
    ├── 通知中心：NotificationCenter / 观察者模式
    ├── KVO / KVC 原理与实现
    ├── 代理模式 / 闭包回调
    ├── 单例模式（线程安全版本）
    ├── 后台模式：BGTaskScheduler / 后台任务
    ├── Info.plist 配置 / Entitlements
    ├── Provisioning Profile / 证书管理
    └── 多窗口管理 / Scene / UIWindow 层级
```

**面试高频**：
- ⭐⭐⭐ Runloop 原理（Mode/Source/Timer/应用场景）
- ⭐⭐⭐ 应用生命周期 / 启动流程 / 启动优化
- ⭐⭐⭐ KVO/KVC 原理 / 通知机制
- ⭐⭐ 沙盒结构 / 后台模式 / 证书管理

---

## 📖 第四部分：UI 深入（必学 ⭐⭐⭐）

### 4.1 UIKit 深入（⭐ 面试最大考点）

**目标**：掌握 UIKit 所有细节，处理复杂 UI 场景

```
04_UI_Deep/
├── 01_View_Layout.md               # View 基础与布局引擎 | ~42KB
│   ├── UIView 底层原理：layer/层次结构
│   ├── 布局原理：Frame/Autoresizing/AutoLayout
│   ├── AutoLayout 详解：Constraints/Anchor/优先级
│   ├── IntrinsicContentSize / ContentHugging / Compression
│   ├── SnapKit / 声明式布局
│   ├── 布局引擎源码分析
│   ├── StackView：arrangedSubviews/分发策略/约束冲突
│   ├── 底层：布局传递（updateConstraints→layoutSubviews→drawRect）
│   └── 性能：布局性能分析 / 约束数量优化
│
├── 02_UIKit_Controls.md            # UIKit 控件体系 | ~48KB
│   ├── 常用控件：UILabel/UIButton/UIImageView
│   ├── 表单控件：UITextField/TextView/Picker
│   ├── 容器视图：UIScrollView 原理
│   ├── UITableView 全栈：Cell复用/布局/性能优化/动态高度
│   ├── UICollectionView 全栈：Layout/Cell/性能优化
│   ├── 事件响应链：Responder Chain / Hit Testing
│   ├── 手势识别：UIGestureRecognizer / 触摸事件
│   ├── 键盘管理：键盘通知/自适应/输入法
│   ├── VC 交互：segue/present/dismiss/代理
│   ├── 自定义 View/控件封装
│   └── 深色模式 / SizeClasses / SafeArea / 动态字体
│
└── 03_UI_System_Deep.md            # UI 系统深度 | ~53KB
    ├── UIKit 渲染管线：Core Animation / CATransaction
    ├── 离屏渲染：产生条件/检测/优化
    ├── 图层合成：CALayer/CAEmitterLayer/CAReplicatorLayer
    ├── 屏幕渲染：光栅化/帧率/掉帧分析
    ├── 布局引擎源码分析
    ├── 性能优化：约束优化/布局层级/预渲染
    └── 无障碍（Accessibility）/ VoiceOver
```

**面试高频**：
- ⭐⭐⭐ AutoLayout 原理 / Intrinsic Content Size / Hugging / Compression
- ⭐⭐⭐ TableView/CollectionView 复用机制 / 性能优化
- ⭐⭐⭐ 事件响应链 / Hit Testing / 手势识别
- ⭐⭐⭐ 离屏渲染：产生条件/检测/优化
- ⭐⭐ UIView.layer 渲染机制 / Core Animation 合成
- ⭐⭐ StackView 原理 / arrangedSubviews 分发策略

---

## 📖 第五部分：SwiftUI（必学 ⭐⭐⭐）

**目标**：掌握声明式 UI，现代 iOS 开发

```
05_SwiftUI/
└── 01_SwiftUI_Full.md              # SwiftUI 全栈（完整版）| ~108KB
    ├── 声明式 UI 原理：View 编译为 UIProtocol
    ├── 状态管理：@State/@Binding/@ObservedObject/@StateObject/@EnvironmentObject
    ├── 生命周期：onAppear/onDisappear 等
    ├── 布局引擎：ZStack/VStack/HStack 约束求解
    ├── 视图修饰：ViewModifier/自定义修饰符
    ├── 动画系统：动画/转场/Animation
    ├── 手势：手势处理
    ├── 绘图：Canvas/Path/Shape
    ├── UIKit ↔ SwiftUI 互操作（UIHostingController/UIViewRepresentable）
    ├── SwiftUI 渲染管线（Diffing/Commit/Update）
    ├── iOS16/17 特性：NavigationStack/SwiftData/预览
    ├── 性能优化：避免重绘/预渲染
    └── SwiftUI vs UIKit 对比分析
```

**面试高频**：
- ⭐⭐⭐ @State/@Binding/@ObservedObject 区别与生命周期
- ⭐⭐ SwiftUI 渲染管线（Diffing 机制）
- ⭐ SwiftUI vs UIKit 对比 / 互操作

---

## 📖 第六部分：架构模式（重要 ⭐⭐）

**目标**：掌握常见设计模式和架构，构建可维护系统

```
06_Architecture/
└── 01_Architecture_Deep.md         # 架构全栈深度 | ~123KB
    ├── 设计原则：SOLID/DRY/KISS/YOLO
    ├── 23 种设计模式：单例/工厂/观察者/代理/策略/装饰器/适配器
    ├── MVC：传统模式 / 问题 / 改进
    ├── MVVM：ViewModel / 数据绑定 / 双向绑定
    ├── MVP/Presenter：协议驱动
    ├── VIPER：五层架构 / 优缺点
    ├── Coordinator：导航解耦 / 实现
    ├── 组件化：模块拆分 / 通信 / 路由
    ├── 模块化：模块设计 / 依赖管理
    ├── 分层架构：领域驱动 / 依赖倒置
    ├── 架构对比表 + 选型决策树
    └── 重构技巧 / 代码迁移
```

**面试高频**：
- ⭐⭐ MVC/MVVM/VIPER 优缺点与适用场景
- ⭐⭐ Coordinator 模式 / 路由解耦
- ⭐⭐ 组件化设计 / 模块拆分 / 通信
- ⭐ SOLID 原则 / 设计模式

---

## 📖 第七部分：数据存储（必学 ⭐⭐⭐）

**目标**：掌握各种本地存储方式，选择合适方案

```
07_Storage_Deep/
└── 01_Local_Storage.md             # 本地存储全栈 | ~58KB
    ├── UserDefaults：使用限制/自定义类型/高级用法
    ├── 文件存储：FileManager/目录/权限
    ├── Codable：编码解码/自定义/容器
    ├── PropertyList 存储
    ├── 缓存策略：LRU/过期策略/内存+磁盘
    ├── 图片缓存：内存缓存+磁盘缓存+网络请求合并
    ├── NSObject 归档：NSKeyedArchiver/NSCoding
    ├── JSON 解析：Codable vs JSONSerialization
    └── 各方案对比表 + 选型建议
```

**面试高频**：
- ⭐⭐ UserDefaults 限制 / Codable 自定义编码
- ⭐ CoreData vs SQLite vs Realm 对比

---

## 📖 第八部分：网络编程（必学 ⭐⭐⭐）

**目标**：理解网络协议，掌握 HTTP 通信

```
08_Network_Deep/
└── 01_Network_Basics.md            # 网络基础全栈 | ~70KB
    ├── HTTP/HTTPS 原理 / RESTful
    ├── URLSession 全栈：Task/Delegate/Configuration
    ├── 请求/响应/数据解析
    ├── 上传/下载/进度
    ├── 认证：OAuth2/Token/挑战
    ├── 超时/重连/错误处理
    ├── 网络状态监测
    ├── 缓存策略：内存/磁盘/请求缓存
    ├── ATS 配置 / SSL Pinning
    └── 网络调试工具（Charles/Fiddler）
```

**面试高频**：
- ⭐⭐⭐ URLSession Task/Delegate/Configuration
- ⭐⭐ HTTP/HTTPS 原理 / SSL Pinning
- ⭐ URLSession 缓存策略 / 重连机制

---

## 📖 第九部分：内存管理（必学 ⭐⭐⭐）

**目标**：深入理解内存管理，解决内存问题

```
09_Memory_Management/
└── 01_Memory_Deep.md               # 内存管理深度 | ~106KB
    ├── ARC 原理：retain/release/autorelease
    ├── 引用计数：内存布局 / 优化
    ├── 强弱引用：strong/weak/unowned
    ├── 循环引用：产生条件/解决方案
    ├── CF 桥接：Toll-free Bridging 内存管理
    ├── 值类型内存布局：struct 内存对齐
    ├── ARC vs GC：Swift vs Kotlin vs Java
    ├── 内存泄漏检测：Leaks/Allocations/Zombie
    ├── 内存分析工具：Instruments/Heapshot
    ├── 内存峰值分析：堆内存/栈内存
    ├── 内存碎片：管理机制/优化
    ├── 内存泄漏场景与解决方案
    ├── Use-After-Free / 内存安全
    └── 内存优化策略：按优先级排序
```

**面试高频**：
- ⭐⭐⭐ ARC 原理 / 引用计数 / 内存布局
- ⭐⭐⭐ 循环引用：产生条件/解决方案/[weak self]
- ⭐⭐ 内存泄漏检测工具：Leaks/Allocations/Zombie
- ⭐ Memory vs GC：Swift vs Java/Kotlin

---

## 📖 第十部分：系统底层（必学 ⭐⭐⭐）

**目标**：深入理解 iOS 底层，掌握高级技巧

```
10_System_Principles/
├── 01_Runtime_Deep.md              # Runtime 深度 | ~57KB
│   ├── ObjC Runtime：class/ivar/method/protocol
│   ├── 消息机制：objc_msgSend / 动态查找 / 转发
│   ├── Method Swizzling：原理/线程安全/最佳实践
│   ├── 分类原理：Category 实现 / 方法冲突解决
│   ├── 关联对象：Associated Objects / 实现原理
│   ├── Swift Runtime：类型系统 / Metatype
│   ├── 协议表：Protocol Witness Table / 动态分发
│   └── 面试题：Runtime 全栈高频题
│
├── 02_Runloop_Deep.md              # Runloop 深度 | ~45KB
│   ├── Runloop 内核机制：CFRunLoopRef/Mode/Source
│   ├── Mode 详解：Default/UITracking/Common/etc.
│   ├── Source：Source0（回调）/Source1（Mach 端口）
│   ├── Timer 原理：精度/精度问题/优化
│   ├── 应用场景：懒加载/自动释放池/保持程序运行
│   └── 面试题：Runloop 高频题
│
└── 03_System_Deep.md               # 系统底层 | ~56KB
    ├── 内存模型：堆/栈/内存布局
    ├── 启动原理：dyld/ObjC加载/初始化
    ├── 动态链接：dyld/动态库/延迟绑定
    ├── 编译过程：源码→LLVM→Mach-O
    ├── 进程管理：进程状态/优先级/调度
    ├── 安全机制：代码签名/沙盒/SE-Linux
    ├── 越狱检测：技术原理/常见方案
    └── 面试题：底层原理高频题
```

**面试高频**：
- ⭐⭐⭐ Runtime 消息转发机制（动态查找/动态绑定/动态解析）
- ⭐⭐⭐ Method Swizzling：原理/线程安全/最佳实践
- ⭐⭐⭐ Runloop 原理（Mode/Source/Timer/应用场景）
- ⭐⭐ Objective-C 分类原理 / 关联对象
- ⭐⭐ Swift Metatype / Protocol Witness Table
- ⭐ dyld 动态链接 / Mach-O 格式

---

## 📖 第十一部分：安全与权限（重要 ⭐⭐⭐）

**目标**：掌握 iOS 安全机制，保障应用安全

```
11_Security/
└── 01_Security_Deep.md             # 安全全栈深度 | ~25KB
    ├── ATS（App Transport Security）：白名单/配置/安全
    ├── Keychain 详解：SecItem/Query/AccessGroup
    ├── 生物识别：LocalAuthentication/面容/指纹
    ├── 代码签名原理：Entitlements/签名验证
    ├── 沙盒权限：文件访问/权限模型
    ├── 权限申请：权限对话框/隐私政策
    ├── 隐私清单：App Privacy Labels
    ├── 数据加密：对称/非对称/AES/RSA
    ├── 网络安全：传输加密/证书验证
    ├── 反调试/混淆技术
    ├── 越狱检测方案（签名验证/二进制分析）
    └── 安全面试题：高频考点
```

**面试高频**：
- ⭐⭐⭐ ATS / Keychain 使用
- ⭐⭐ 生物识别 / 代码签名 / 沙盒
- ⭐ 隐私清单 / 越狱检测

---

## 📖 第十二部分：动画（重要 ⭐⭐）

**目标**：掌握动画与响应式编程，丰富应用交互

```
12_Animation/
└── 01_Animation_Deep.md            # 动画全栈 | ~18KB
    ├── UIView 动画 / 弹簧 / 关键帧
    ├── CAAnimation 核心：CABasicAnimation/CAKeyframeAnimation
    ├── CATransaction / CADisplayLink
    ├── UIViewPropertyAnimator
    ├── 核心动画层级：CALayer/CAEmitterLayer
    ├── 动画性能优化：离屏渲染/硬件加速
    ├── Combine 框架：Publisher/Subscriber/操作符
    ├── Subject：Passthrough/CurrentValue
    ├── 调度 / 取消 / 背压
    ├── 响应式架构：MVVM+Combine
    └── 调试/最佳实践
```

**面试高频**：
- ⭐ UIView 动画 / CAAnimation
- ⭐ CATransition / 自定义转场
- ⭐ Combine 框架：Publisher/Subscriber

---

## 📖 第十三部分：性能优化（必学 ⭐⭐⭐）

**目标**：掌握性能优化技巧，提升用户体验

```
12_Performance/
└── 01_Performance_Deep.md          # 性能优化深度 | ~41KB
    ├── 性能优化体系与指标
    ├── 启动优化：冷启动/热启动分析
    ├── UI/渲染性能优化
    ├── 网络性能优化
    ├── 内存与电池优化
    └── 分析工具
```

**面试高频**：
- ⭐⭐⭐ 启动优化策略（冷启动/热启动分析）
- ⭐⭐⭐ 内存泄漏：场景/检测/解决方案
- ⭐⭐ 渲染优化：离屏渲染/栅格化
- ⭐⭐ 列表优化：预加载/Cell复用

---

## 📖 第十四部分：调试工具（重要 ⭐⭐）

**目标**：熟练使用 Xcode 调试工具，高效排查问题

```
13_Debugging/
└── 01_Debugging_Deep.md            # 调试全栈深度 | ~295KB
    ├── Xcode 调试技巧：断点/条件断点/操作
    ├── LLDB 全栈：条件断点/表达式/修改变量
    ├── LLDB 进阶：寄存器查看/内存查看/汇编查看
    ├── Instruments 深入：工具详解
    ├── 崩溃日志分析：符号化/异常分析
    ├── 内存分析工具链
    ├── 性能分析工具链
    ├── Simulator 高级用法/网络模拟
    ├── Console.app 日志查看
    └── 调试面试题：高频考点
```

**面试高频**：
- ⭐⭐ LLDB 常用命令 / 断点技巧
- ⭐ Instruments 工具使用
- ⭐ 崩溃日志分析

---

## 📖 第十五部分：工程化（进阶 ⭐⭐）

**目标**：建立工程化思维，提升开发效率

```
14_Engineering/
└── 01_Engineering_Deep.md          # 工程化全栈 | ~178KB
    ├── Xcode 工程：工程配置/架构
    ├── Scheme 配置 / Build Settings
    ├── SPM：Swift Package Manager（版本/依赖/本地化）
    ├── CocoaPods：Podspecs/私有源
    ├── Carthage：依赖管理
    ├── XCFramework：跨平台打包
    ├── Framework：打包/依赖管理
    ├── 动态库 vs 静态库
    ├── 模块化：模块拆分/管理
    ├── 代码规范：Swift 风格指南
    ├── Git 工作流：分支策略
    └── 工程面试题：高频考点
```

**面试高频**：
- ⭐⭐ SPM vs CocoaPods vs Carthage
- ⭐ Framework 打包 / 动态库 vs 静态库
- ⭐ CI/CD 工具链

---

## 📖 第十六部分：测试（重要 ⭐⭐）

**目标**：建立测试意识，保证代码质量

```
15_Testing_CI/
└── 01_Testing_CI_Deep.md           # 测试全栈深度 | ~24KB
    ├── 测试分类：单元测试/集成测试/UI 测试
    ├── XCTest 框架：断言/测试用例/异步测试
    ├── Mock/Stub/Fake 模式
    ├── XCUITest：UI 自动化测试
    ├── Snapshot Testing：截图测试
    ├── 性能回归测试
    ├── TDD（测试驱动开发）
    ├── BDD（行为驱动开发）
    ├── 代码覆盖率分析
    ├── CI 流程集成
    └── 测试面试题
```

**面试高频**：
- ⭐ XCTest 框架 / Mock/Stub
- ⭐ XCUITest / 截图测试
- ⭐ 代码覆盖率

---

## 📖 第十七部分：发布与上架（重要 ⭐⭐）

**目标**：掌握 App 发布全流程

```
16_Relase_Deploy/
└── 01_Release_Deploy.md            # 发布全栈 | ~15KB
    ├── 证书管理：开发/分发证书
    ├── Provisioning Profile 配置
    ├── TestFlight 测试
    ├── App Store 审核/上架流程
    ├── 元数据配置：截图/描述/关键词
    ├── App 审核要点（常见拒审原因）
    ├── 隐私清单：Privacy Manifest
    ├── 内购（IAP）：商品类型/验证
    └── 多语言发布
```

**面试高频**：
- ⭐ App Store 审核要点
- ⭐ 证书/Provisioning 管理
- ⭐ 内购流程

---

## 📖 第十八部分：地图/多媒体/蓝牙/云服务/前沿技术（扩展 ⭐⭐）

**目标**：掌握扩展能力，丰富应用功能

```
17_Location_Media/
├── 01_Location_Map.md              # 地图定位深度 | ~16KB
│   ├── CoreLocation 全栈：CLLocationManager/Delegate
│   ├── 定位精度 / 速度 / 方向
│   ├── 地理围栏 / Geofencing
│   ├── 地理编码 / 逆地理编码
│   ├── MapKit：MKMapView / MKAnnotation
│   ├── 覆盖物 / 路线规划 / 地点聚类
│   ├── 离线地图
│   └── 面试高频题
│
└── 02_Media_Deep.md                # 多媒体深度 | ~14KB
    ├── AVFoundation 全栈：AVPlayer/AVCaptureSession
    ├── 相机/录制：AVCaptureSession 配置
    ├── AVAudioSession：音频会话/管理
    ├── CoreAudio 基础：音频处理
    ├── 音视频编解码：格式/压缩
    ├── CoreImage：滤镜/处理
    ├── CoreVideo：视频帧处理
    ├── PhotosFramework：照片库/相册访问
    ├── 音频播放 / 视频处理
    └── 面试高频题

18_Frontier/
├── 01_Bluetooth.md                 # 蓝牙与云服务全栈 | ~16KB
│   ├── Core Bluetooth 架构：CBPeripheralManager/CBCentralManager
│   ├── BLE 通信流程
│   ├── 蓝牙权限与适配
│   ├── Background Modes
│   ├── CloudKit 核心
│   ├── 后台任务
│   ├── 蓝牙与云服务 Android 对比
│   └── 面试考点汇总
│
├── 02_Cloud_Background.md          # CloudKit 云存储 + 后台任务 | ~14KB
│   ├── CloudKit 核心概念：Container/Record/Field/Database
│   ├── CloudKit 基本使用（CKContainer/CKRecord/查询/订阅）
│   ├── iCloud 同步机制
│   └── 后台任务调度
│
└── 03_Frontier_Tech.md             # 前沿技术全栈 | ~17KB
    ├── Swift 6 核心变化（数据race检测/Sendable/isolated）
    ├── Swift Concurrency 深度
    ├── Swift Macros 宏
    ├── Swift 6 线程安全
    ├── MLKit / CoreML
    ├── WidgetKit 小组件
    ├── Spotlight / Shortcuts
    ├── ARKit 增强现实
    ├── 前沿技术 Android 对比
    └── 面试考点汇总
```

**面试高频**：
- ⭐ CoreLocation / 地理围栏
- ⭐ AVPlayer / AVAudioSession
- ⭐ BLE / CoreBluetooth
- ⭐ CloudKit 基本使用
- ⭐ Swift 6 并发
- ⭐ WidgetKit / ARKit

---

## 📊 知识覆盖率统计

| 领域 | 覆盖度 | 说明 |
|------|--|--|--|
| Swift 语言 | ✅ 100% | 基础+高级+混编 |
| 并发编程 | ✅ 100% | GCD+Operation+async/await+Actor |
| UIKit | ✅ 100% | 深入+系统级 |
| SwiftUI | ✅ 100% | 全栈深度（Full） |
| 数据存储 | ✅ 100% | 本地存储 |
| 网络编程 | ✅ 100% | HTTP 基础 |
| 内存管理 | ✅ 100% | ARC+分析+优化 |
| 架构设计 | ✅ 100% | 模式+架构+组件化 |
| 底层原理 | ✅ 100% | Runtime+Runloop+系统 |
| 安全权限 | ✅ 100% | ATS+Keychain+生物识别 |
| 动画 | ✅ 100% | UIView+CALayer+Combine |
| 性能优化 | ✅ 100% | 全方位优化 |
| 调试 | ✅ 100% | LLDB+崩溃分析 |
| 工程化 | ✅ 100% | SPM+Pods+CI/CD |
| 测试 | ✅ 100% | 单元+UI+覆盖率 |
| 发布 | ✅ 100% | 证书+审核+内购 |
| 地图/多媒体 | ✅ 100% | CoreLocation+AVFoundation |
| 蓝牙/云服务/前沿 | ✅ 100% | Bluetooth+CloudKit+Swift6+AR |

---

## 🎯 面试准备指南

### 🔴 高频考点（必背）

**Swift 语言（高频 ⭐⭐⭐）**
- 可选类型解包（if let/guard let/强制/隐式解包）
- 闭包捕获列表（[weak self]/[unowned self]）
- 协议 vs 抽象类（POP 设计思想）
- 结构体 vs 类（值类型 vs 引用类型/内存/性能）
- 泛型约束 vs 关联类型（where 约束 vs associatedtype）
- 属性包装器原理（编译器生成代码）
- 内存管理（ARC/引用计数/强弱引用/循环引用）

**iOS 基础（高频 ⭐⭐⭐）**
- Runloop（Mode/Source/Timer/应用场景）
- KVO/KVC（键值观察/编码原理）
- 应用生命周期（AppDelegate → SceneDelegate）
- 代理模式（delegate/闭包回调）
- 沙盒结构（Documents/Library/Temp）
- 通知中心（NotificationCenter/观察者）

**UI 开发（高频 ⭐⭐⭐）**
- AutoLayout（Constraints/Anchor/优先级）
- Intrinsic Content Size / Content Hugging / Compression
- TableView/CollectionView 复用机制
- 手势识别与事件响应链
- StackView（arrangedSubviews/分发策略）
- UIView.layer 渲染机制
- 键盘管理与高度自适应

**并发与多线程（高频 ⭐⭐⭐）**
- GCD（串行/并发队列/组/信号量/屏障）
- async/await（Task/TaskGroup/Actor/Structured Concurrency）
- Operation/OperationQueue（依赖/取消/优先级）
- 线程安全（锁/原子操作/读写锁）
- 死锁产生与避免

**网络与存储（中频 ⭐⭐）**
- URLSession（Task/Delegate/Configuration）
- HTTP/HTTPS 原理
- Codable 编码解码
- 网络缓存策略（内存/磁盘/请求缓存）
- SSL Pinning/ATS

**性能优化（中频 ⭐⭐）**
- 启动优化（冷启动/热启动分析）
- 内存泄漏（场景/检测/解决）
- 渲染优化（离屏渲染/栅格化）
- 列表优化（预加载/Cell复用）
- 包体积优化（资源压缩/无用代码）

**架构设计（低频但重要 ⭐⭐）**
- MVC/MVVM/VIPER（优缺点/使用场景）
- Coordinator 模式（路由解耦）
- 组件化设计（模块拆分/通信）
- 设计模式（单例/工厂/观察者/策略）

---

## 📋 知识模块全景图

```
┌──────────────────────────────────────────────────────────────────┐
│                      iOS 开发知识体系                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  语言层（Swift）                                                  │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ Swift 基础   │ Swift 高级   │ Swift↔OC    │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  并发层                                                           │
│  ┌──────────────┬──────────────┐                                │
│  │ GCD+Operation │ async/await+Actor               │              │
│  └──────────────┴──────────────┘                                │
│                                                                  │
│  UI 层                                                            │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ UIKit 深入   │ SwiftUI      │ 动画/响应式    │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  数据层                                                           │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 本地存储     │ 网络编程     │ 内存管理      │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  系统层                                                           │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ Runtime/底层 │ 安全与权限   │ 性能优化      │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  工程层                                                           │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 工程化工具   │ 测试/CI/CD   │ 调试/发布      │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  扩展层                                                           │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 地图/多媒体  │ 蓝牙/云服务    │ 前沿技术      │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📚 推荐资源

### 📖 官方文档
- [Apple Developer Documentation](https://developer.apple.com/documentation)
- [Swift.org](https://swift.org)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [WWDC 视频](https://developer.apple.com/videos/)

### ✍️ 优质博客
- [Swift by Sundell](https://www.swiftbysundell.com)
- [NSHipster](https://nshipster.com)
- [objc.io](https://www.objc.io)

### 💻 开源项目
- [Alamofire](https://github.com/Alamofire/Alamofire)
- [Kingfisher](https://github.com/onevcat/Kingfisher)
- [SnapKit](https://github.com/SnapKit/SnapKit)
- [SwiftGen](https://github.com/SwiftGen/SwiftGen)

### 🎥 视频教程
- [Ray Wenderlich](https://www.raywenderlich.com)
- [Stanford CS193p](https://cs193p.sites.stanford.edu)
- [Hacking with Swift](https://www.hackingwithswift.com)

### 📝 面试题库
- [LeetCode](https://leetcode.com)
- [iOS Interview Questions](https://github.com/9minds/iOS-Interview-Questions)
- [iOS 面试题总结](https://github.com/hoicyuan/iOS-Interview-Questions)

---

## 📊 学习路径建议

### 🌱 初级阶段（0-6 个月）
**目标：掌握基础，能够独立完成简单功能**

| 优先级 | 模块 | 重点内容 |
|------|--|--|--|
| ⭐⭐⭐ | 03_App_Core | 生命周期/通知/代理/沙盒 |
| ⭐⭐⭐ | 04_UI_Deep | View/布局/控件/列表/键盘 |
| ⭐⭐⭐ | 01_Swift_Language | 语法/可选/闭包/协议/泛型 |
| ⭐⭐ | 07_Storage_Deep | UserDefaults/Codable/文件 |
| ⭐⭐ | 08_Network_Deep | URLSession/JSON 解析/网络基础 |

### 🌿 中级阶段（6-18 个月）
**目标：掌握架构，能独立负责模块**

| 优先级 | 模块 | 重点内容 |
|------|--|--|--|
| ⭐⭐⭐ | 02_Concurrency | GCD/async-await/线程安全 |
| ⭐⭐⭐ | 06_Architecture | MVVM/设计模式/组件化 |
| ⭐⭐⭐ | 09_Memory_Management | ARC/内存管理/内存分析 |
| ⭐⭐ | 05_SwiftUI | 声明式 UI/状态管理 |
| ⭐⭐ | 12_Performance | 启动/内存/渲染优化 |
| ⭐⭐ | 13_Debugging | LLDB/Instruments/崩溃分析 |

### 🌳 高级阶段（18-36 个月）
**目标：系统架构能力，性能优化专家**

| 优先级 | 模块 | 重点内容 |
|------|--|--|--|
| ⭐⭐⭐ | 10_System_Principles | Runtime/Runloop/底层原理 |
| ⭐⭐⭐ | 12_Performance | 全方位优化/监控 |
| ⭐⭐ | 11_Security | ATS/Keychain/生物识别/安全 |
| ⭐⭐ | 14_Engineering | CI/CD/构建系统/工程化 |
| ⭐ | 17_Location_Media | 地图/多媒体/蓝牙/云 |

### 🏆 专家阶段（36 个月+）
**目标：技术决策，前沿探索**

| 优先级 | 模块 | 重点内容 |
|------|--|--|--|
| ⭐⭐ | 10_System_Principles | 深入系统原理/逆向 |
| ⭐⭐ | 14_Engineering | 工程体系/效能 |
| ⭐ | 18_Frontier | Swift6/AR/ML/跨平台 |
| ⭐ | 技术视野 | 行业动态/技术选型 |

---

**📅 最后更新**: 2026-04-21  
**📝 版本**: v24.1（索引对齐实际文件）  
**🎯 适用**: 面试准备 + 系统进阶学习  
**🔄 更新说明**: 删除不存在文件的引用，文件名/目录与实际完全对齐