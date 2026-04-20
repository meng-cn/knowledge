# 05 - SwiftUI 全栈（完整版）

> 💡 本模块覆盖 SwiftUI 核心概念：架构原理、视图系统、状态管理、数据流、布局、生命周期、与 UIKit 集成、性能优化、SwiftData、动画、手势、绘图、与 Android Compose 跨平台对比、面试高频考点。目标读者：中高级 iOS 开发者 / 跨端迁移工程师。

## 目录

1. [SwiftUI 架构概览与渲染管线](#1-swiftui-架构概览与渲染管线)
2. [视图系统深入解析](#2-视图系统深入解析)
3. [布局系统全栈](#3-布局系统全栈)
4. [状态管理全栈](#4-状态管理全栈)
5. [数据流与 MVVM 架构](#5-数据流与-mvvm-架构)
6. [生命周期与事件系统](#6-生命周期与事件系统)
7. [动画与转场系统](#7-动画与转场系统)
8. [手势系统](#8-手势系统)
9. [绘图系统（Canvas / Shape / Path）](#9-绘图系统canvas--shape--path)
10. [SwiftData 数据持久化](#10-swiftdata-数据持久化)
11. [SwiftUI 与 UIKit 互操作](#11-swiftui-与-uikit-互操作)
12. [性能优化全栈](#12-性能优化全栈)
13. [iOS 16+ 与 iOS 17+ 新特性](#13-ios-16-与-ios-17-新特性)
14. [SwiftUI 与 Android Compose 跨语言对比](#14-swiftui-与-android-compose-跨语言对比)
15. [SwiftUI 与 UIKit 跨平台对比](#15-swiftui-与-uikit-跨平台对比)
16. [面试考点汇总](#16-面试考点汇总)

---

## 1. SwiftUI 架构概览与渲染管线

### 1.1 SwiftUI 框架整体架构

```
SwiftUI 框架架构总览：
┌──────────────────────────────────────────────────────────────┐
│                        SwiftUI                               │
├──────────────────────────────────────────────────────────────┤
│  视图层 (View Protocol)                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Text / Image / VStack / HStack / ZStack              │ │
│  │  List / NavigationStack / TabView / Form              │ │
│  │  ScrollView / LazyVStack / LazyHStack                 │ │
│  │  Canvas / Shape / Path                                │ │
│  └─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  状态层 (State Management)                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  @State / @Binding / @ObservableObject                │ │
│  │  @Environment / @AppStorage / @Published              │ │
│  │  @FocusState / @Namespace / @GestureState             │ │
│  │  @EnvironmentObject / @SceneStorage                   │ │
│  │  @Observable (iOS 17+)                                │ │
│  └─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  渲染层 (Render Pipeline)                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  SwiftUI Render Engine → Metal (GPU)                    │ │
│  │  声明式视图 → Diff 计算 → 增量更新 → GPU 渲染           │ │
│  └─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  事件层 (Event Handling)                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  .onTapGesture / .onChange / .task                      │ │
│  │  .onAppear / .onDisappear / .simultaneousGesture      │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
*/
```

### 1.2 SwiftUI vs UIKit 核心差异深度对比

| 维度 | SwiftUI | UIKit | 分析 |
|------|---------|-------|------|
| 编程范式 | 声明式 | 命令式 | 声明式让 UI = f(State)，代码更简洁 |
| 布局系统 | VStack/HStack 容器 | Auto Layout 约束 | 容器比约束更直观 |
| 状态管理 | @State/@Binding/@Published | delegate/NSNotif/KVO | SwiftUI 内建，零样板代码 |
| 数据绑定 | 自动（声明式） | 手动（代码/IBOutlets） | SwiftUI 自动同步 |
| 视图更新 | Diff + 增量渲染 | 手动 setNeedsDisplay | SwiftUI 更智能 |
| 预览 | Canvas 实时预览 | Storyboard/Preview | SwiftUI Preview 所见即所得 |
| 跨平台 | iOS/macOS/watchOS/tvOS | iOS/iPadOS | SwiftUI 覆盖 4 平台 |
| 学习曲线 | 低（声明式语法） | 高（众多 API） | 声明式更易上手 |
| 自定义渲染 | Canvas/Shape | Core Graphics/UIKit | Canvas 更声明式 |
| 动画 | .animation()/withAnimation | UIView.animate/CA | SwiftUI 更简洁 |
| 手势 | .gesture()/TapGesture | UIGestureRecognizer | 概念类似 |
| 网络集成 | URLSession + async/await | URLSession + completionHandler | Swift Concurrency 更简洁 |
| 性能 | Metal GPU + Diff 开销 | Core Animation | 各有优劣 |
| 生态成熟度 | 持续演进（2019+） | 成熟（2008+） | UIKit 生态更丰富 |
| 社区资源 | 快速增长 | 海量 | UIKit 资源更多 |

### 1.3 SwiftUI 渲染管线深度分析

```
SwiftUI 渲染管线：

┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ 1.State   │    │ 2.Body    │    │ 3.Diff    │    │ 4.Incre-  │    │ 5.Metal   │
│  变化触发  │───→│  重新计算  │───→│  计算     │───→│  mental   │───→│  GPU 渲染 │
│  (Published│    │  (值类型  │    │ (新旧视图 │    │  更新     │    │ (Layer树  │
│  /@State) │    │  拷贝)    │    │  对比)    │    │ (差分    │    │  绘制)    │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘

渲染关键机制详解：
• 状态变化触发 → @State/@Published 变化时，SwiftUI 发送 objectWillChange
• body 重新计算 → 视图 struct 的 body 属性被重新调用（值类型拷贝）
• Diff 计算 → SwiftUI 框架内部对比新旧视图树，标记变化的节点
• 增量更新 → 只重新渲染变化的 Layer 节点，不是整棵树重绘
• Metal GPU → 最终由 Metal 引擎绘制到屏幕

性能关键：
• body 是只读属性，不能包含副作用
• 每次 body 计算都会拷贝视图 struct（值类型）
• 框架自动做 Diff，但复杂的 body 会增加 Diff 开销
• 使用 @StateObject 而非 @ObservedObject 避免不必要的重新计算
*/
```

### 1.4 视图更新流程时序图

```
视图更新时序：

┌─────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────┐     ┌───────────┐
│ 用户操作 │     │ State     │     │ body         │     │ Diff      │     │ 渲染      │
│ (按钮)   │───→ │ 变化      │───→ │ 重新计算      │───→ │ 计算       │───→ │ Layer 更新│
│         │     │ @State /  │     │ 值拷贝       │     │ 新旧对比   │     │ 增量      │
│         │     │ @Published│     │ 新视图树      │     │ 标记变化   │     │ 渲染      │
│         │     │ 改变      │     │              │     │ 节点       │     │          │
│         │     └───────────┘     └──────────────┘     └───────────┘     └───────────┘
│         │                         │                │              │
└─────────┘                         └──────────────┴───────────────┘
*/
```

---

## 2. 视图系统深入解析

### 2.1 SwiftUI 视图的本质

```
SwiftUI 视图的核心原理：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1. 视图 = 遵循 View 协议的结构体                             │
│  2. 每个 View struct 是值类型（struct），不可变              │
│  3. 必须实现 var body: some View 计算属性                     │
│  4. body 描述"视图应该长什么样"，不是"如何构建"               │
│  5. 每次状态变化 → body 重新计算 → Diff → 增量渲染           │
│                                                              │
│  值类型语义的优势：                                            │
│  • 线程安全：无共享状态                                       │
│  • 可预测：每次刷新都是全新实例                               │
│  • 不可变性保证 UI 一致性                                    │
│                                                              │
│  some View 的本质：                                           │
│  • 透明返回值（Opaque Return Type）                           │
│  • 编译器在编译期确定具体类型                                 │
│  • 对外隐藏实现细节                                           │
│  • 零运行时开销                                               │
│  • AnyView 是类型擦除（Type Erasure），有运行时开销          │
│                                                              │
│  some View vs AnyView 对比：                                 │
│  ┌───────────┬───────────────────┬──────────────────┐       │
│  │ 特性      │ some View         │ AnyView          │       │
│  ├───────────┼───────────────────┼──────────────────┤       │
│  │ 类型确定  │ 编译期            │ 运行时           │       │
│  │ 性能开销  │ 零开销            │ 动态分配 + 类型擦除│       │
│  │ 适用场景  │ 已知返回类型      │ 动态返回类型       │       │
│  │ 类型安全  │ ✅ 编译期         │ ⚠️ 运行时         │       │
│  └───────────┴───────────────────┴──────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

### 2.2 基础视图体系

```
SwiftUI 视图树（View Hierarchy）：

┌──────────────────────────────────────────────────────────────┐
│  ContentView (根视图)                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  VStack (容器)                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Image (系统图标)                                 │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Text ("Hello, SwiftUI!")                         │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Button ("点击")                                  │ │ │
│  │  │  └─ Label("点击", systemImage: "...")            │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

视图组合原则：
• 每个视图是独立的 struct
• 通过嵌套组合成复杂 UI
• VStack/HStack/ZStack 是三大基础容器
• 修饰符（Modifier）改变视图外观或行为
• 修饰符从左到右（或从下到上）链式调用
*/
```

### 2.3 常用控件详解

```swift
// 文本
Text("标题")
    .font(.system(size: 32, weight: .bold, design: .rounded))
    .lineSpacing(4)
    .lineLimit(2)  // 最多两行
    .truncationMode(.tail)  // 超出截断

// 富文本
Text("这是 ").append(
    Text("富文本").foregroundColor(.blue).bold()
)

// 图片
Image(systemName: "star.fill")  // SF Symbols
Image("imageName")               // 资源文件
Image(decorative: "photo.jpg")  // 装饰性图片（无障碍）
Image(uiImage: myImage)         // UIImage 桥接

// 按钮
Button("点击") { print("点击") }  // 简化语法
Button(action: { }, label: { })  // 完整语法
Button(role: .destructive) { }   // 危险按钮（红色）

// TextField
TextField("请输入", text: $text)
    .textFieldStyle(.roundedBorder)
    .textInputAutocapitalization(.never)
    .keyboardType(.emailAddress)

// SecureField
SecureField("密码", text: $password)
    .textContentType(.password)

// Picker
Picker("选项", selection: $selection) {
    Text("选项1").tag(0)
    Text("选项2").tag(1)
}
.pickerStyle(.wheel)  // .inline / .menu / .segmented

// Toggle
Toggle("开关", isOn: $isEnabled)
    .toggleStyle(.switch)  // .automatic / .toggleStyle

// Slider
Slider(value: $value, in: 0...100, step: 1)
    .sliderStyle(.continuous)

// ProgressView
ProgressView()
ProgressView(value: 0.7)  // 进度条
ProgressView("加载中...", value: 50, total: 100)
*/
```

### 2.4 容器视图对比

| 容器 | 布局方向 | 典型用途 | 关键参数 | 性能考虑 |
|------|---------|---------|---------|---------|
| `VStack` | 垂直排列 | 表单、卡片内容 | spacing, alignment | 一次性创建所有子视图 |
| `HStack` | 水平排列 | 工具栏、图标+文字 | spacing, alignment | 一次性创建所有子视图 |
| `ZStack` | 层叠（Z轴） | 图片覆盖文字 | alignment | 所有子视图同时创建 |
| `TabView` | 标签页切换 | 多页面 App | 无 | 每个 Tab 延迟加载 |
| `NavigationStack` | 导航栈 | 页面层级跳转 | 无 | 导航栈管理 |
| `ScrollView` | 可滚动 | 长列表 | 无 | 一次性创建 |
| `LazyVStack` | 垂直懒加载 | 大数据列表 | spacing | 按需创建，性能优 |
| `LazyHStack` | 水平懒加载 | 横向列表 | spacing | 按需创建，性能优 |
| `Form` | 表单 | 设置页面 | 无 | 自动分组 |
| `GeometryReader` | 自适应 | 响应式布局 | 无 | 获取可用空间 |

---

## 3. 布局系统全栈

### 3.1 SwiftUI 布局原理

```
SwiftUI 布局系统核心原理：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  两阶段布局协议：                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  阶段 1：自顶向下（Top-Down）                         │ │
│  │  • 父容器下发 constraints（min, ideal, max）           │ │
│  │  • 子视图收到 constraint 范围                           │ │
│  │  • 子视图返回 ideal size（偏好大小）                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  阶段 2：自底向上（Bottom-Up）                        │ │
│  │  • 父容器根据子视图返回的理想大小分配实际空间           │ │
│  │  • 子视图在分配的 bounds 中渲染                         │ │
│  │  • 如果有约束冲突，框架自动调整                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  SwiftUI 布局 = IntrinsicContentSize + Geometry              │
│  而非 Auto Layout 的 constraint 系统                         │
│                                                              │
│  布局数据流：                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │父容器    │───→│子视图    │───→│子视图    │───→│父容器    │  │
│  │下发      │    │返回      │    │渲染      │    │最终      │  │
│  │constraints│   │ideal    │    │在bounds  │    │分配      │  │
│  │          │    │size     │    │内        │    │实际      │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

### 3.2 Frame 修饰器深度解析

```
.frame 修饰器规则：
┌──────────────┬────────────────────┬─────────┐
│ 修饰器       │ 作用               │ 行为    │
├──────────────┼────────────────────┼─────────┤
│ .frame(width:height:)   │ 精确尺寸       │ 必须恰好│
│                       │                  │ 这个大小│
├──────────────┼────────────────────┼─────────┤
│ .frame(minWidth:minHeight:)│ 最小尺寸     │ 至少   │
│                       │                  │ 这么大  │
├──────────────┼────────────────────┼─────────┤
│ .frame(maxWidth:maxHeight:)│ 最大尺寸     │ 最多   │
│                       │                  │ 这么大  │
├──────────────┼────────────────────┼─────────┤
│ .frame(minWidth:maxWidth:) │ 尺寸范围     │ 在范围 │
│                       │                  │ 内自适应│
├──────────────┼────────────────────┼─────────┤
│ .frame(maxWidth:.infinity) │ 填满父容器宽度 │ 自适应 │
└──────────────┴────────────────────┴─────────┘

关键理解：
• frame 修饰器改变的是"布局区域"，不是"渲染区域"
• 加在 Text 上：限制文字的布局区域
• 加在 VStack 上：限制整个容器的可用空间
• maxWidth:.infinity 填满可用空间，不是父容器
*/
```

### 3.3 布局优先级

```
布局优先级（layoutPriority）：
┌────┬───────────┬──────────────────────┬──────────────┐
│    │ 优先级    │ 效果                   │ 适用场景     │
├────┼───────────┼──────────────────────┼──────────────┤
│    │ > 0       │ 高优先级的视图先获得空间 │ 标题/固定内容 │
│    │ = 0       │ 平等分配（默认）        │ 一般子视图    │
│    │ < 0       │ 低优先级的视图更容易被压缩 │ 次要内容    │
└────┴───────────┴──────────────────────┴──────────────┘
*/
```

### 3.4 SwiftUI vs UIKit Auto Layout 对比

| 特性 | SwiftUI 布局 | UIKit Auto Layout |
|------|-------------|-------------------|
| 布局语言 | SwiftUI DSL（声明式） | NSLayoutConstraint（命令式） |
| 约束类型 | frame + 容器 | 等式/不等式约束 |
| 约束冲突 | 自动处理，warning | 需手动解决，可能 crash |
| 优先级 | layoutPriority() | UILayoutPriority |
| 激活/停用 | 自动 | 手动 activate/deactivate |
| Content Hugging/Compression | 无（frame 控制） | 需手动设置 |
| 响应式 | 自动响应设备变化 | 需手动 overrideLayout |
| 自定义布局 | Layout 协议（iOS 16+） | 子类化 UIView + layoutSubviews |
| 学习曲线 | 低 | 高 |
| 性能 | 两阶段协议，优化良好 | 解析约束树，有一定开销 |

### 3.5 常见布局问题与解决方案

```swift
// 问题1：文本被截断 → 设置 maxWidth
Text("很长的文本")
    .frame(maxWidth: .infinity)  // ✅

// 问题2：ZStack 子视图不占满 → 设置最大尺寸
ZStack {
    Rectangle().fill(Color.blue)
        .frame(maxWidth: .infinity, maxHeight: .infinity)  // ✅
    Text("居中")
}

// 问题3：HStack 文字换行 → 使用多行 Text
Text("很长很长的文本")
    .lineLimit(nil)  // 允许无限行

// 问题4：LazyVStack 内容超出屏幕 → 用 ScrollView 包裹
ScrollView {
    LazyVStack { ... }
}

// 问题5：背景色只覆盖文字 → 调整修饰符顺序
Text("测试")
    .padding()           // 先 padding
    .background(Color.yellow)  // 后背景

// 问题6：Image 被裁剪 → 设置 aspectRatio
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .clipped()
*/
```

---

## 4. 状态管理全栈

### 4.1 状态管理的核心原则

```
SwiftUI 状态管理核心原则：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  UI = f(State)                                               │
│                                                              │
│  数据驱动 UI：                                               │
│  • 状态变化 → body 重新计算 → Diff → 渲染更新               │
│  • 单向数据流：状态自顶向下流动                               │
│  • 视图不可变：每次刷新创建新视图实例（值类型）               │
│                                                              │
│  状态管理层级：                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  层级 1：本地状态  → @State                            │ │
│  │  层级 2：父子通信  → @Binding                          │ │
│  │  层级 3：ViewModel → @StateObject / @ObservedObject   │ │
│  │  层级 4：全局共享  → @EnvironmentObject                │ │
│  │  层级 5：持久化    → @AppStorage / @SceneStorage       │ │
│  │  层级 6：系统环境  → @Environment                      │ │
│  │  层级 7：现代写法  → @Observable (iOS 17+)             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

### 4.2 @State - 视图本地状态

```
@State 深度分析：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  @State 的本质：                                             │
│  • 数据存储在视图的存储体（backing store）中                 │
│  • 不是存储在视图 struct 本身                               │
│  • 只有拥有该视图的容器才能访问                              │
│  • 适合简单类型（Int, Bool, String, CGSize 等）            │
│                                                              │
│  @State 的生命周期：                                         │
│  • 视图初始化时创建                                         │
│  • 视图刷新时保留（不在 struct 拷贝中）                     │
│  • 视图消失时销毁                                           │
│  • 不可继承/不可传递                                        │
│                                                              │
│  内存布局：                                                  │
│  ┌────┬──────────┬──────────────────────────────────┐       │
│  │    │  类型    │  内存位置                        │       │
│  ├────┼──────────┼──────────────────────────────────┤       │
│  │ Int │  Int    │ 视图存储体（非 struct 本身）    │       │
│  │ Bool│  Bool   │ 视图存储体                       │       │
│  │Str  │  String │ 视图存储体                       │       │
│  │Arr  │  [String]│ 视图存储体                      │       │
│  └────┴──────────┴──────────────────────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

struct StateDemo: View {
    @State private var count = 0
    @State private var isEnabled = false
    @State private var text = "初始文本"
    
    var body: some View {
        VStack(spacing: 20) {
            Text("计数: \(count)").font(.largeTitle)
            Text("开关: \(isEnabled ? "开" : "关")")
            TextField("编辑", text: $text).textFieldStyle(.roundedBorder)
            Button("计数 +1") { count += 1 }
            Toggle("启用", isOn: $isEnabled)
        }
    }
}
*/
```

### 4.3 @Binding - 双向绑定

```
@Binding 深度分析：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  @Binding 的本质：                                           │
│  • 在视图之间创建可变的引用通道                              │
│  • 父视图状态 ↔ 子视图双向同步                              │
│  • 值类型通过 $ 传递（将 @State 转换为 Binding）            │
│                                                              │
│  数据流：                                                    │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ 父视图        │ ←──→ │ 子视图        │                   │
│  │ @State        │      │ @Binding      │                   │
│  │ 拥有所有权    │      │ 借用引用      │                   │
│  └──────────────┘      └──────────────┘                    │
│                                                              │
│  $ 运算符的作用：                                            │
│  • @State 的值 → Binding<T>（取引用）                      │
│  • Binding<T> → T（解引用）                                │
│  • 双向传递：父改→子改，子改→父改                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

struct ParentView: View {
    @State private var inputValue = ""
    @State private var sliderValue: Double = 0.5
    
    var body: some View {
        VStack {
            TextFieldView(text: $inputValue)  // $ 传递 Binding
            SliderView(value: $sliderValue)  // $ 传递 Binding
            Text("父视图值: \(inputValue) / \(sliderValue)")
        }
    }
}

struct TextFieldView: View {
    @Binding var text: String  // 接收 Binding
    
    var body: some View {
        TextField("输入", text: $text)
            .textFieldStyle(.roundedBorder)
    }
}
*/
```

### 4.4 @StateObject vs @ObservedObject vs @Bindable

```
@StateObject / @ObservedObject / @Bindable 深度对比：
┌───────────┬───────────────┬───────────────┬────────────────┐
│ 特性      │ @StateObject  │ @ObservedObject │ @Bindable      │
│ 适用版本  │ iOS 13-16     │ iOS 13-16       │ iOS 17+        │
│ 所有权    │ ✅ 创建并持有  │ ❌ 只消费       │ ✅ 消费         │
│ 生命周期  │ 与视图绑定     │ 随对象存在      │ 与视图绑定     │
│ 重复创建  │ ❌ 只一次      │ ⚠️ 每次刷新     │ ❌ 智能检测    │
│ 类型安全  │ ✅            │ ✅             │ ✅             │
│ 刷新触发  │ ✅ 自动        │ ✅ 自动         │ ✅ 自动        │
│ 适用场景  │ ViewModel 创建│ ViewModel 传递 │ ViewModel 消费 │
│ 内部实现  │ WeakObjectPtr │ WeakObjectPtr  │ 编译期追踪     │
└───────────┴───────────────┴───────────────┴────────────────┘

选择指南：
• ViewModel 由当前视图创建 → @StateObject
• ViewModel 由外部传入 → @ObservedObject（iOS 16-）/ @Bindable（iOS 17+）
• 简单本地状态 → @State
• 全局共享 → @EnvironmentObject

@StateObject 陷阱：
• 父视图刷新不会重建 @StateObject（只在视图初始化时创建一次）
• 但如果父视图被完全销毁重建，@StateObject 也会销毁
*/

class CounterViewModel: ObservableObject {
    @Published var count = 0
    @Published var title = "计数器"
    
    func increment() { count += 1 }
}

// ✅ ViewModel 所有者（创建）
struct OwnerView: View {
    @StateObject private var viewModel = CounterViewModel()
    
    var body: some View {
        VStack {
            Text("计数: \(viewModel.count)")
            Button("加一") { viewModel.increment() }
        }
    }
}

// ✅ ViewModel 消费者（iOS 17+ 推荐）
struct ConsumerView: View {
    @Bindable var viewModel: CounterViewModel  // iOS 17+
    
    var body: some View {
        Text("计数: \(viewModel.count)")
    }
}

// ✅ ViewModel 消费者（iOS 13-16）
struct ConsumerViewLegacy: View {
    @ObservedObject var viewModel: CounterViewModel
    
    var body: some View {
        Text("计数: \(viewModel.count)")
    }
}
*/
```

### 4.5 @Published 深度解析

```
@Published 底层机制：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  @Published 是属性包装器，其本质：                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. 自动发送 objectWillChange.send()                   │  │
│  │    在值改变前发送通知                                 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 2. 提供 .publisher 访问（Combine 风格）              │  │
│  │    $propertyName 返回 Published<T> 的 publisher       │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 3. 值改变 → objectWillChange → SwiftUI 刷新           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 4. 只在值整体替换时触发，不跟踪内部修改               │  │
│  │    items.append(x) ❌ 不会触发                      │  │
│  │    items = updatedItems ✅ 会触发                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  通知机制时序：                                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐              │
│  │ @Published │→│ objectWill │→│ SwiftUI  │              │
│  │ 值改变    │  │ Change 发送 │  │ 刷新 UI  │              │
│  │ setter触发│  │           │  │ body重算 │              │
│  └──────────┘  └────────────┘  └──────────┘               │
│                                                              │
│  @Published 的常见陷阱：                                     │
│  • 直接修改集合元素不会触发通知                             │
│  • @Published var items: [Item] = []                       │
│  • items[0].name = "新值" ❌ 不触发                        │
│  • 解决方案：整体替换 / 让 Item 本身 ObservableObject      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

// 正确模式
class SafeModel: ObservableObject {
    @Published var items: [String] = []
    
    func addItem(_ item: String) {
        items.append(item)  // ✅ items 的 setter 被调用
    }
    
    func addItemsBulk(_ newItems: [String]) {
        var updated = items
        updated.append(contentsOf: newItems)
        items = updated  // ✅ 只触发一次 objectWillChange
    }
}
*/
```

### 4.6 @Observable 协议（iOS 17+）

```
@Observable (iOS 17+) - 现代数据模型写法：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  @Observable 取代 ObservableObject + @Published              │
│  • 无需 Combine 框架依赖                                    │
│  • 编译时自动生成追踪代码                                   │
│  • 更简洁的语法                                             │
│  • 后台线程修改自动 dispatch 到主线程                       │
│                                                              │
│  ObservableObject vs @Observable 对比：                      │
│  ┌──────────────┬────────────────────┬──────────────────┐   │
│  │ 特性         │ ObservableObject    │ @Observable      │   │
│  ├──────────────┼────────────────────┼──────────────────┤   │
│  │ 依赖         │ Combine 框架        │ 无外部依赖        │   │
│  │ 通知机制     │ objectWillChange    │ 编译时追踪        │   │
│  │ 编译开销     │ 低                 │ 较高（宏生成）     │   │
│  │ publisher    │ ✅ $属性名          │ ❌ 不支持          │   │
│  │ SwiftUI 兼容  │ ✅                 │ ✅ 自动适配        │   │
│  │ 可测性       │ 需 mock Combine    │ 直接赋值          │   │
│  │ Xcode 要求   │ Xcode 11+          │ Xcode 15+         │   │
│  └──────────────┴────────────────────┴──────────────────┘   │
│                                                              │
│  @Observable 的限制：                                         │
│  • 部分属性不受追踪（静态属性、computed 属性）             │
│  • 不支持初始化器中的 @Observable 属性                      │
│  • 不能与 ObservableObject 混用                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

@Observable
class TaskList {
    var tasks: [TaskItem] = []
    var filter: TaskStatus = .all
    
    var filteredTasks: [TaskItem] {
        switch filter {
        case .all: return tasks
        case .active: return tasks.filter { !$0.done }
        case .completed: return tasks.filter { $0.done }
        }
    }
    
    func addTask(_ title: String) {
        let newTask = TaskItem(id: UUID(), title: title, done: false)
        tasks.append(newTask)
    }
    
    func toggleTask(_ task: TaskItem) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].done.toggle()
        }
    }
}

@Observable
class TaskItem {
    var id: UUID
    var title: String
    var done: Bool
}
*/
```

### 4.7 环境对象与自定义环境值

```
@EnvironmentObject 深度分析：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  EnvironmentObject 的本质：                                  │
│  • 通过 SwiftUI 的环境系统（Environment）跨层级共享状态      │
│  • 任意深层级子视图无需参数传递即可访问                      │
│  • 环境是一个字典式的值类型，通过 .environment(key, value) 传播│
│                                                              │
│  数据流：                                                    │
│  ┌─────────┐    ┌────────────┐    ┌────────────┐           │
│  │ App 层   │───→│ .envObj   │───→│ 子视图     │           │
│  │ 注入     │    │ (environmentObject) │     │           │
│  │ 环境对象 │    │ 传播      │    │ 消费      │           │
│  └─────────┘    └────────────┘    └────────────┘           │
│                                                              │
│  EnvironmentObject 的缺点：                                  │
│  • ❌ 编译期不检查类型，运行时崩溃                           │
│  • ❌ 数据流不透明，无法追踪来源                             │
│  • ❌ 测试困难，需手动注入                                   │
│  • ❌ 命名空间污染，可能造成意外依赖                         │
│                                                              │
│  替代方案：依赖注入                                          │
│  • 通过参数显式传递 ViewModel（更类型安全）                  │
│  • iOS 17+ 用 @Observable + 依赖注入                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

class ThemeManager: ObservableObject {
    @Published var currentTheme: AppTheme = .light
    @Published var fontSize: CGFloat = 17.0
    func toggleTheme() {
        currentTheme = currentTheme == .light ? .dark : .light
    }
}

enum AppTheme { case light, dark }

// App 层注入
@main
struct MyApp: App {
    @StateObject private var themeManager = ThemeManager()
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(themeManager)
        }
    }
}

// 子视图消费
struct DeepNestedView: View {
    @EnvironmentObject var themeManager: ThemeManager
    var body: some View {
        Text("主题: \(themeManager.currentTheme)")
    }
}
*/
```

### 4.8 状态管理选择决策树

```
状态管理选择指南：

┌─ 简单本地状态？（单个视图内，简单类型）─┐
│  → @State                            │
└─────┴───────────────────────────────┘
         │ 否
┌─ 父子视图共享可变状态？───────────────┐
│  → @Binding                          │
└─────┴───────────────────────────────┘
         │ 否
┌─ ViewModel 由当前视图创建？───────┐
│  → @StateObject (iOS 13-16)      │
│  → @StateObject / @Observable     │
└─────┴────────────────────────────┘
         │ 否
┌─ ViewModel 由外部传入？──────────┐
│  → @ObservedObject (iOS 13-16)   │
│  → @Bindable (iOS 17+)             │
└─────┴────────────────────────────┘
         │ 否
┌─ 全局应用状态？─────────────────┐
│  → @EnvironmentObject              │
│  → @Observable + 依赖注入（现代）   │
└─────┴────────────────────────────┘
         │ 否
┌─ 用户偏好设置？─────────────────┐
│  → @AppStorage                     │
└─────┴────────────────────────────┘
         │ 否
┌─ 系统配置？───────────────────────┐
│  → @Environment (colorScheme等)  │
└─────┴────────────────────────────┘
*/
```

---

## 5. 数据流与 MVVM 架构

### 5.1 SwiftUI 数据流方向

```
SwiftUI 数据流模型：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  数据流方向：                                                │
│  ┌─ 数据自上而下 ────────────────────────────┐             │
│  │  父视图 @State → 子视图 @Binding          │             │
│  │  ViewModel @Published → View @Observed    │             │
│  │  App @environmentObject → 子视图消费       │             │
│  └────────────────────────┴───────────────┘             │
│                                                              │
│  事件流方向：                                                │
│  ┌─ 事件自下而上 ────────────────────────────┐             │
│  │  子视图 → 闭包回调 → 父视图处理           │             │
│  │  子视图 → .onChange → 父视图处理          │             │
│  │  子视图 → @Published 通知 → 全局更新      │             │
│  └────────────────────────┴───────────────┘             │
│                                                              │
│  MVVM 架构在 SwiftUI 中：                                    │
│  ┌───────────┐    ┌───────────────┐    ┌─────────────┐    │
│  │  View     │ ←→ │ ViewModel     │ ←→ │ Model/API   │    │
│  │  (UI 渲染)│    │  (业务逻辑)   │    │  (数据/网络)│    │
│  │  @State   │    │  ObservableObject│  │  struct/class│   │
│  │  @Binding │    │  @Published    │    │  Codable     │    │
│  │  .task    │    │  async/await   │    │              │    │
│  └───────────┘    └───────────────┘    └─────────────┘    │
│                                                              │
│  原则：                                                      │
│  • View 只负责渲染和事件捕获                               │
│  • ViewModel 负责业务逻辑和数据转换                        │
│  • Model 负责数据结构                                      │
│  • 不直接在 View 中做网络请求                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

### 5.2 MVVM 完整示例

```swift
// Model
struct Order: Identifiable, Codable {
    let id: Int
    let title: String
    let status: OrderStatus
    let createdAt: Date
}

enum OrderStatus: String, CaseIterable, Codable {
    case pending, shipping, completed, cancelled
}

// ViewModel
class OrderViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedFilter: OrderStatus? = nil
    
    var filteredOrders: [Order] {
        guard let filter = selectedFilter else { return orders }
        return orders.filter { $0.status == filter }
    }
    
    func loadOrders() {
        isLoading = true
        Task {
            do {
                let result = try await fetchOrders()
                orders = result
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
    
    func deleteOrder(_ order: Order) {
        orders.removeAll { $0.id == order.id }
    }
    
    private func fetchOrders() async throws -> [Order] {
        return [
            Order(id: 1, title: "订单A", status: .pending, createdAt: .now),
            Order(id: 2, title: "订单B", status: .completed, createdAt: .now),
        ]
    }
}

// View
struct OrderListView: View {
    @StateObject private var viewModel = OrderViewModel()
    
    var body: some View {
        List(viewModel.filteredOrders) { order in
            OrderRow(order: order)
                .swipeActions { Button("删除", role: .destructive) { viewModel.deleteOrder(order) } }
        }
        .navigationTitle("订单列表")
        .task { viewModel.loadOrders() }
    }
}
*/
```

---

## 6. 生命周期与事件系统

### 6.1 视图生命周期

```
SwiftUI 视图生命周期时序：

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1. init()           → 创建视图实例（值类型拷贝）            │
│     ↓                                                        │
│  2. body 计算        → 生成视图树结构                        │
│     ↓                                                        │
│  3. onAppear         → 视图显示在屏幕上                       │
│     ↓                                                        │
│  4. 状态变化         → body 重新计算 → Diff → 增量渲染       │
│     ↓                                                        │
│  5. task             → 视图出现时启动异步任务                 │
│     ↓                                                        │
│  6. onChange         → 特定值变化触发                         │
│     ↓                                                        │
│  7. onDisappear      → 视图从屏幕移除                         │
│     ↓                                                        │
│  8. 视图销毁         → 实例释放（值类型，无 ARC）            │
│                                                              │
│  关键理解：                                                  │
│  • SwiftUI 视图是值类型，每次刷新创建新实例                   │
│  • init() 在每次 body 重新计算时调用                        │
│  • body 计算是"描述"而非"构建"，不应该有副作用               │
│  • .onAppear 对应 viewDidLoad，.onDisappear 对应 viewDidUnload│
│  • .task 是 .onAppear + async/await 的封装                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

### 6.2 task 修饰符深度解析

```
.task 修饰符分析：
┌──────────────────────────────────────────────────────────────┐
│  .task  = .onAppear + async/await 的封装                     │
│                                                              │
│  行为：                                                      │
│  • 视图出现时启动 Task                                       │
│  • 视图消失时自动取消 Task（防止内存泄漏）                   │
│  • 依赖值变化时自动重新触发                                  │
│                                                              │
│  用法：                                                      │
│  • .task { await loadData() }                               │
│  • .task(id: someID) { await loadData(id: someID) }        │
│  • .task(priority: .userInitiated) { ... }                 │
│                                                              │
│  task vs onAppear：                                          │
│  ┌───────────┬───────────────┬──────────────────┐          │
│  │ 特性      │ .task         │ .onAppear        │          │
│  ├───────────┼───────────────┼──────────────────┤          │
│  │ 异步支持  │ ✅ 原生 async  │ ❌ 需手动 Task   │          │
│  │ 自动取消  │ ✅ 视图消失自动│ ❌ 需手动管理     │          │
│  │ 依赖刷新  │ ✅ id 变化自动  │ ❌ 不会重触发    │          │
│  │ 推荐程度  │ ⭐⭐⭐ 推荐   │ ⭐⭐ 旧式写法    │          │
│  └───────────┴───────────────┴──────────────────┘          │
└──────────────────────────────────────────────────────────────┘
*/

struct AsyncView: View {
    @State private var data: String? = nil
    @State private var error: String? = nil
    
    var body: some View {
        Group {
            if let data = data {
                Text(data)
            } else if let error = error {
                Text(error).foregroundStyle(.red)
                    .task { await loadData() }
            } else {
                ProgressView()
            }
        }
        .task { await loadData() }
    }
    
    private func loadData() async {
        do {
            data = try await api.fetchData()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
*/
```

### 6.3 环境值详解

```
@Environment 环境值体系：
┌──────────────────────────────────────────────────────────────┐
│  系统内置环境值：                                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  \.colorScheme      → ColorScheme (light/dark)       │ │
│  │  \.locale           → Locale                           │ │
│  │  \.layoutDirection  → LayoutDirection                  │ │
│  │  \.dismiss          → DismissAction                   │ │
│  │  \.managedObjectContext → NSManagedObjectContext      │ │
│  │  \.presentationMode   → PresentationMode               │ │
│  │  \.scenePhase       → ScenePhase                       │ │
│  │  \.accessibilityEnabled → Bool                         │ │
│  │  \.horizontalSizeClass  → UserInterfaceSizeClass       │ │
│  │  \.verticalSizeClass    → UserInterfaceSizeClass       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  自定义环境值模式：                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ struct MyKey: EnvironmentKey {                       │  │
│  │     static let defaultValue: MyType = .default       │  │
│  │ }                                                     │  │
│  │ extension EnvironmentValues {                        │  │
│  │     var myKey: MyType {                              │  │
│  │         get { self[MyKey.self] }                     │  │
│  │         set { self[MyKey.self] = newValue }          │  │
│  │     }                                                 │  │
│  │ }                                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

---

## 7. 动画与转场系统

### 7.1 动画系统深度分析

```
SwiftUI 动画系统：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  动画类型：                                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  .easeInOut        — 慢进慢出（最常用）               │ │
│  │  .linear           — 匀速                              │ │
│  │  .spring(response:dampingFraction:) — 弹簧动画        │ │
│  │  .interactiveSpring() — 交互式弹簧（推荐）            │ │
│  │  .curve(.easeOut)  — 自定义曲线                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  动画修饰符链：                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  withAnimation(.spring()) { isRed.toggle() }          │  │
│  │  withAnimation(.easeInOut(duration: 0.5)) { ... }    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  动画视图修饰符：                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  .animation(.spring(), value: count)                 │  │
│  │  .animation(nil) — 禁用动画                          │  │
│  │  .animation(.default, value: condition)              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  animation(value:) 机制：                                    │
│  • value 变化时自动触发动画                                 │
│  • 同一 value 只触发一次（去重）                            │
│  • 推荐用 .animation(.default, value:) 而非 withAnimation  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

// 弹簧动画
struct SpringDemo: View {
    @State private var scale: CGFloat = 1.0
    @State private var rotation: Angle = .degrees(0)
    
    var body: some View {
        Circle()
            .fill(Color.red)
            .frame(width: 100, height: 100)
            .scaleEffect(scale)
            .rotationEffect(rotation)
            .animation(.interactiveSpring(), value: scale)
            .animation(.interactiveSpring(), value: rotation)
            .onTapGesture {
                withAnimation(.interactiveSpring()) {
                    scale = scale == 1.0 ? 1.5 : 1.0
                    rotation = rotation == .degrees(0) ? .degrees(360) : .degrees(0)
                }
            }
    }
}
*/
```

### 7.2 转场（Transition）

```
转场动画：
┌──────────────────────────────────────────────────────────────┐
│  内置转场：                                                  │
│  • .move(edge)           — 从指定边移入/移出                │
│  • .slide                — 滑动转场                         │
│  • .scale                — 缩放转场                         │
│  • .opacity              — 透明度转场                       │
│  • .offset               — 偏移转场                         │
│  • .combined             — 组合转场（如 .slide + .opacity） │
│                                                              │
│  使用方式：                                                  │
│  .transition(.slide.combined(with: .opacity))               │
│  .transition(.move(edge: .trailing))                        │
│                                                              │
│  条件视图转场：                                              │
│  if showView {                                              │
│      Text("显示").transition(.slide)                        │
│  }                                                          │
│  .animation(.easeInOut, value: showView)                    │
└──────────────────────────────────────────────────────────────┘
*/
```

---

## 8. 手势系统

### 8.1 手势系统深度解析

```
SwiftUI 手势体系：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  手势类型：                                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  TapGesture          — 轻敲                           │ │
│  │  LongPressGesture    — 长按                           │ │
│  │  DragGesture         — 拖拽                           │ │
│  │  MagnificationGesture — 捏合缩放                      │ │
│  │  RotationGesture     — 旋转                           │ │
│  │  MagnitudeGesture    — 幅度（如滑动检测）            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  手势组合：                                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  .simultaneousGesture   — 同时触发                    │ │
│  │  .sequencedGesture       — 顺序触发                   │ │
│  │  .conditionalGesture     — 条件触发                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  手势状态管理：                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  • 手势拖拽期间有效                                │  │
│  │  • 手势结束后自动重置                              │  │
│  │  • 适合临时状态（如拖拽距离）                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

struct GestureDemo: View {
    @State private var position = CGPoint(x: 100, y: 100)
    @State private var scale: CGFloat = 1.0
    @GestureState private var dragOffset = CGSize.zero
    
    var body: some View {
        Circle()
            .fill(Color.red)
            .frame(width: 100, height: 100)
            .position(
                x: position.x + dragOffset.width,
                y: position.y + dragOffset.height
            )
            .scaleEffect(scale)
            .gesture(
                DragGesture()
                    .updating($dragOffset) { value, state, _ in
                        state = value.translation
                    }
                    .onEnded { value in
                        withAnimation(.interactiveSpring()) {
                            position = CGPoint(
                                x: position.x + dragOffset.width,
                                y: position.y + dragOffset.height
                            )
                        }
                    }
            )
            .gesture(
                MagnificationGesture()
                    .updating($scale) { value, state, _ in state = value }
            )
    }
}
*/
```

---

## 9. 绘图系统（Canvas / Shape / Path）

### 9.1 绘图系统深度解析

```
SwiftUI 绘图体系：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  绘图三件套：                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Canvas              — 基于 GraphicsContext 的绘图    │ │
│  │  Shape               — 自定义 Shape 路径              │ │
│  │  Path                — 路径构造工具                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Canvas 原理：                                               │
│  • 提供 GraphicsContext 用于绘图                            │
│  • 支持 vector graphics（矢量）                             │
│  • 适合自定义图表、仪表盘、地图                             │
│                                                              │
│  Shape 原理：                                                │
│  • 遵循 Shape 协议，实现 path(in:) 方法                      │
│  • 用于自定义形状（如波浪线、星形）                         │
│  • 可通过 .fill() / .stroke() 渲染                          │
│                                                              │
│  Path 原理：                                                 │
│  • 路径构建工具：move(to:), addLine(to:), addCurve(to:)   │
│  • 支持贝塞尔曲线、圆弧、多边形                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

// Canvas
struct CanvasDemo: View {
    var body: some View {
        Canvas { context, size in
            let rect = CGRect(x: 0, y: 0, width: size.width, height: size.height)
            context.fill(rect, with: .color(.blue))
            context.stroke(rect, with: .color(.red), lineWidth: 2)
        }
        .frame(height: 200)
    }
}

// Shape
struct WaveShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.midY))
        path.addQuadCurve(
            to: CGPoint(x: rect.maxX, y: rect.midY),
            control: CGPoint(x: rect.midX, y: rect.minY)
        )
        return path
    }
}

struct CustomShapeView: View {
    var body: some View {
        WaveShape()
            .fill(.blue.opacity(0.3))
            .stroke(.blue, lineWidth: 2)
            .frame(height: 200)
    }
}
*/
```

---

## 10. SwiftData 数据持久化

### 10.1 SwiftData vs CoreData 深度对比

```
SwiftData vs CoreData 对比：
┌──────────────────────────────────────────────────────────────┐
│  SwiftData 核心概念：                                        │
│  • 基于 Swift 5.9+ 的宏（@Model）                           │
│  • 类型安全、零样板代码                                     │
│  • 与 SwiftUI 深度集成                                       │
│  • 支持 SQLite 后端                                         │
│                                                              │
│  CoreData 核心概念：                                         │
│  • 基于 NSManagedObject 的框架                              │
│  • 需要 XCDatamodeld 设计数据模型                           │
│  • 大量样板代码                                             │
│  • 成熟但复杂                                               │
│                                                              │
│  SwiftData vs CoreData 对比：                                │
│  ┌─────────┬───────────────────────┬─────────────────┐       │
│  │ 特性    │ SwiftData             │ CoreData        │       │
│  ├─────────┼───────────────────────┼─────────────────┤       │
│  │ 数据模型│ @Model 宏             │ .xcdatamodeld   │       │
│  │ 类型安全│ ✅ 编译期             │ ⚠️ 运行时        │       │
│  │ 代码量  │ 极少                  │ 多              │       │
│  │ SwiftUI 集成│ 自动              │ 需手动           │       │
│  │ 迁移难度│ 低                    │ 高              │       │
│  │ 成熟度  │ 新兴（2023+）        │ 成熟            │       │
│  │ 性能    │ 良好                  │ 优秀（优化久）  │       │
│  │ 复杂度  │ 低                    │ 高              │       │
│  └─────────┴───────────────────────┴─────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

@Model
class Item {
    var name: String
    var timestamp: Date
    
    init(name: String, timestamp: Date = .now) {
        self.name = name
        self.timestamp = timestamp
    }
}

struct SwiftDataView: View {
    @Environment(\.modelContext) private var modelContext
    
    var body: some View {
        List {
            ForEach(modelContext.fetch(FetchDescriptor<Item>()) ?? [], id: \.self) { item in
                Text(item.name)
            }
        }
        .task {
            let newItem = Item(name: "New Item")
            modelContext.insert(newItem)
        }
    }
}
*/
```

---

## 11. SwiftUI 与 UIKit 互操作

### 11.1 UIViewRepresentable 深度分析

```
UIViewRepresentable / UIViewControllerRepresentable：
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  桥接的本质：                                                │
│  • SwiftUI 无法直接渲染 UIKit 视图                           │
│  • 通过 Representable 协议桥接                               │
│  • 生命周期：make → update → 销毁                           │
│                                                              │
│  UIViewRepresentable 生命周期：                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ makeUIView(context):                                   │  │
│  │  • 创建/初始化 UIKit 视图                              │  │
│  │  • 只调用一次                                          │  │
│  │  • 返回要嵌入 SwiftUI 的 UIView 实例                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│ │ updateUIView(_:context):                                │  │
│  │  • 更新 UIKit 视图                                     │  │
│  │  • 每次 SwiftUI 状态变化时调用                           │  │
│  │  • 可接收 SwiftUI 状态参数                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Coordinator 模式：                                          │
│  • 通过 Coordinator 处理 UIKit 的代理/委托事件              │
│  • 将 UIKit 回调桥接到 SwiftUI 状态                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/

struct MapView: UIViewRepresentable {
    func makeUIView(context: Context) -> MKMapView { MKMapView() }
    func updateUIView(_ uiView: MKMapView, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator() }
    
    class Coordinator: NSObject, MKMapViewDelegate {
        func mapView(_ mapView: MKMapView, didUpdate userLocation: MKUserLocation) {}
    }
}

struct HostingView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        TableViewController()
    }
    func updateUIViewController(_ vc: UIViewController, context: Context) {}
}

// 反向桥接：SwiftUI 嵌入 UIKit
let hostingController = UIHostingController(rootView: ContentView())
self.present(hostingController, animated: true)
*/
```

### 11.2 互操作策略选择

| 场景 | 推荐方案 | 说明 |
|------|---------|------|
| SwiftUI 中使用 UIKit 控件 | UIViewRepresentable | MapView, WebView 等 |
| SwiftUI 中使用 UIKit 控制器 | UIViewControllerRepresentable | TableViewController 等 |
| UIKit 中嵌入 SwiftUI | UIHostingController | 反向桥接 |
| 纯 SwiftUI App | 不需要桥接 | 原生 SwiftUI |
| 渐进迁移 | UIViewRepresentable + UIHostingController | 逐步替换 |

---

## 12. 性能优化全栈

### 12.1 性能问题诊断

```
SwiftUI 常见性能问题及解决方案：
┌─────────────────────┬─────────────────────────┬──────────────────────┐
│  问题               │  原因                   │  解决方案            │
├─────────────────────┼─────────────────────────┼──────────────────────┤
│ 频繁重绘           │ @State 变化触发全部重绘  │ 用 @StateObject/     │
│                    │                        │ @ObservedObject 分离 │
│ 列表滚动卡顿       │ 一次性创建所有子视图     │ LazyVStack/LazyHStack│
│                    │                        │ 延迟加载             │
│ 修饰符链过长       │ 修饰符计算开销大         │ 提取自定义 View      │
│                    │                        │ 封装成 Modifier      │
│ Image 加载阻塞     │ 同步加载网络图片         │ AsyncImage           │
│                    │                        │ 缓存                 │
│ body 计算过重      │ body 中有耗时计算        │ 提取到 ViewModel     │
│                    │                        │ 用缓存 (@State)      │
│ 动画卡顿           │ 复杂动画               │ 简化动画/预计算      │
│                    │                        │ 用 .interactiveSpring│
│ 视图树过深         │ 嵌套过多视图           │ 提取自定义 View      │
│                    │                        │ 扁平化树结构         │
│ AnyView 类型擦除   │ 动态类型分配             │ 用 some View 替代    │
│                    │                        │ 零开销               │
└─────────────────────┴─────────────────────────┴──────────────────────┘
*/
```

### 12.2 性能优化技巧清单

| 优化手段 | 说明 | 效果 |
|---|---|-----|
| LazyVStack/HStack | 延迟加载列表项 | ⭐⭐⭐ |
| @StateObject vs @ObservedObject | 正确的对象管理 | ⭐⭐⭐ |
| 提取自定义视图 | 减少不必要的重绘区域 | ⭐⭐⭐ |
| AsyncImage 预加载图片 | 网络图片缓存 | ⭐⭐ |
| 合并修饰符 | 减少修饰符链 | ⭐⭐ |
| 使用 frame 预计算布局 | 减少布局计算 | ⭐⭐ |
| clipShape 替代 clip | 性能更好 | ⭐⭐ |
| .id 控制刷新 | 选择性重建视图 | ⭐⭐ |
| 分离视图结构 | 减少 Diff 范围 | ⭐⭐⭐ |
| .animation(nil) 禁用 | 关键视图禁用动画 | ⭐⭐ |
| body 计算提取 | 耗时逻辑移到 ViewModel | ⭐⭐⭐ |

---

## 13. iOS 16+ 与 iOS 17+ 新特性

### 13.1 iOS 16+ 关键特性

```
iOS 16+ SwiftUI 新特性：
┌──────────────────────────────────────────────────────────────┐
│  NavigationStack / NavigationLink(value:)                    │
│  • 替代 NavigationView（废弃）                              │
│  • 支持 value-based 导航                                    │
│  • 支持编程式导航（.navigationDestination）                │
│                                                              │
│  NavigationSplitView                                         │
│  • 替代 SplitViewController                                  │
│  • 三栏/两栏/一栏自适应                                    │
│                                                              │
│  @FocusState                                                 │
│  • 精确键盘焦点管理                                        │
│  • TextField.focused($focus)                                │
│                                                              │
│  @ScaledMetric                                               │
│  • 自动适配 Dynamic Type                                     │
│  • 比 font(.body) 更精确控制                                │
│                                                              │
│  @SceneStorage                                               │
│  • 场景级存储（TabView 间共享）                              │
│  • 独立于 App 生命周期                                      │
│                                                              │
│  SwipeActions                                                │
│  • .swipeActions { Button(...) }                             │
│  • 支持按钮组、删除、操作                                   │
│                                                              │
│  .refreshable                                                │
│  • 下拉刷新原生支持                                          │
│  • .refreshable { await refresh() }                          │
│                                                              │
│  Layout 协议（iOS 16）                                       │
│  • 自定义布局系统                                             │
│  • 替代 UIViewRepresentable + 子类化                        │
│                                                              │
│  @ViewBuilder @resultBuilder                                │
│  • 视图构建器                                                │
│  • 支持条件分支视图                                          │
└──────────────────────────────────────────────────────────────┘
*/

// iOS 16+ NavigationStack
struct IOS16Demo: View {
    @State private var selectedDetail: DetailType? = nil
    
    var body: some View {
        NavigationStack {
            List(DetailType.allCases) { type in
                NavigationLink(type.title, value: type)
            }
            .navigationDestination(for: DetailType.self) { type in
                DetailView(type: type)
            }
            .navigationTitle("iOS 16+ 导航")
        }
    }
}

// iOS 16+ SwipeActions
struct SwipeDemo: View {
    var body: some View {
        List(0..<10) { i in
            Text("Item \(i)")
                .swipeActions { Button("删除", role: .destructive) {} }
        }
    }
}
*/
```

### 13.2 iOS 17+ 关键特性

```
iOS 17+ SwiftUI 新特性：
┌──────────────────────────────────────────────────────────────┐
│  @Observable 宏                                              │
│  • 取代 ObservableObject + @Published                      │
│  • 编译时自动生成追踪代码                                   │
│  • 无需 Combine 依赖                                       │
│                                                              │
│  @Bindable                                                   │
│  • 消费 @Observable 对象                                     │
│  • 类型安全的绑定                                             │
│  • 自动防刷新问题                                             │
│                                                              │
│  .task(id:)                                                  │
│  • 依赖值变化时自动重触发 Task                               │
│  • 视图消失时自动取消                                       │
│                                                              │
│  .scrollTargetLayout()                                       │
│  • 滚动位置捕获                                              │
│  • 精确滚动到位置                                            │
│                                                              │
│  .tint()                                                     │
│  • 统一 tint 颜色                                            │
│  • 替代 .accentColor()                                      │
│                                                              │
│  @MainActor 自动适配                                         │
│  • @Observable 后台线程修改自动 dispatch 到主线程              │
│                                                              │
│  ChatKit（iOS 18）                                           │
│  • 原生聊天界面组件                                           │
│                                                              │
│  PersonNameSupport                                           │
│  • Text("\(person.name)") 支持人名样式                      │
│                                                              │
│  WidgetKit 改进                                              │
│  • 更多 Widget 类型                                          │
│                                                              │
│  StageManager（iPad）                                        │
│  • 窗口管理                                                  │
│                                                              │
│  Continuity Camera                                           │
│  • Mac 作为 iPhone 摄像头                                    │
└──────────────────────────────────────────────────────────────┘
*/
```

---

## 14. SwiftUI 与 Android Compose 跨语言对比

### 14.1 核心概念跨平台对比

| SwiftUI 概念 | Android Compose | 差异分析 | 迁移要点 |
|------|--|-------|--|
| `struct View: View` | `@Composable fun` | struct 值类型 vs 函数编译为状态机 | Compose 编译器生成状态机 |
| `var body: some View` | `@Composable` 函数体 | 计算属性 vs 函数返回 | Compose 函数式，SwiftUI 属性式 |
| `@State` | `mutableStateOf` | 视图本地状态 | 两者都是 CompositionLocal 内状态 |
| `@Binding` | 传递 mutableStateOf ref | 双向绑定 vs 可变状态引用 | Compose 用 ref 传递，更灵活 |
| `@ObservableObject` | ViewModel + MutableState | Combine 依赖 vs 无依赖 | Compose 无需 Combine |
| `@Observable` (iOS 17) | @ViewModel (Jetpack) | 宏 vs 注解 | 两者都是编译期代码生成 |
| `@EnvironmentObject` | CompositionLocal | 字典式查找 vs CompositionLocal 链 | CompositionLocal 更类型安全 |
| `@Environment` | CompositionLocal / LocalContext | 系统环境 vs 自定义 CompositionLocal | 类似机制 |
| `VStack/HStack` | Column/Row | 容器布局 vs 组合器 | Compose 有 Box (ZStack) |
| `LazyVStack` | LazyColumn | 懒加载列表 | 完全对应 |
| `NavigationStack` | NavHost + NavController | 原生栈 vs Router API | Compose 更灵活但更复杂 |
| `List` | LazyColumn + items | 原生列表 vs 组合器 | SwiftUI List 更像 UITableView |
| `.modifier` | Modifier. | 链式修饰符 vs 链式 Modifier | 类似 API 设计 |
| `Canvas` | Canvas / drawWithContent | 矢量绘图 | Compose 基于 Skia |
| `Animation` | animate*AsState | Spring/曲线 vs 插值器 | 概念相似 |
| `Gesture` | pointerInput / detectTapGestures | 手势 API | Compose 更底层 |
| `@AppStorage` | DataStore / SharedPreferences | 宏 vs API | Compose 需手动封装 |
| `SwiftData` | Room | 宏 ORM vs SQL 映射 | Room 更成熟 |
| `.task` | LaunchedEffect | async/await vs suspend | Kotlin 协程 vs Swift Concurrency |
| `.onAppear` | onAttach / remember | 生命周期事件 | Compose 无直接对应 |
| `.onTapGesture` | Modifier.clickable | 手势 vs 修饰符 | 类似 |
| 预览 | Canvas Preview | @Preview | 两者都支持实时预览 |
| 跨平台 | iOS/macOS/watchOS/tvOS | Multiplatform (Alpha) | SwiftUI 更成熟 |

### 14.2 SwiftUI vs Compose 架构对比

```
SwiftUI vs Compose 架构对比：

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SwiftUI:                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UI = f(State)                                        │  │
│  │  • 声明式视图 = struct + body 属性                    │  │
│  │  • 状态 = @State / @Observable / @Published           │  │
│  │  • 数据流 = 自上而下（绑定）+ 自下而上（回调）        │  │
│  │  • 渲染 = Diff + Metal GPU                            │  │
│  │  • 生命周期 = init → body → onAppear → onDisappear    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Compose:                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UI = f(State)                                        │  │
│  │  • 声明式视图 = @Composable 函数                      │  │
│  │  • 状态 = mutableStateOf / ViewModel                  │  │
│  │  • 数据流 = 自上而下（参数）+ 自下而上（lambda）      │  │
│  │  • 渲染 = Skia GPU（Android）/ Vulkan（Multiplatform）│  │
│  │  • 生命周期 = Compose Runtime 管理（recomposition）   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  核心差异：                                                  │
│  • SwiftUI 基于 struct 值类型，Compose 基于函数 Recomposition│
│  • SwiftUI 渲染到 Metal，Compose 渲染到 Skia/Vulkan         │
│  • SwiftUI 用 @Observable 宏，Compose 用 mutableStateOf     │
│  • SwiftUI 预览用 Canvas，Compose 预览用 @Preview 注解      │
│  • SwiftUI 更声明式，Compose 更接近函数式                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
*/
```

### 14.3 SwiftUI vs Compose 代码对比

```swift
// SwiftUI
struct CounterView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("计数: \(count)").font(.largeTitle)
            Button("加一") { count += 1 }
        }
        .animation(.interactiveSpring(), value: count)
        .task { print("任务启动") }
    }
}

// Compose (Kotlin)
@Composable
fun CounterView() {
    var count by remember { mutableStateOf(0) }
    
    Column {
        Text("计数: $count", fontSize = 48.sp)
        Button(onClick = { count++ }) { Text("加一") }
    }
    .animateContentSize()
}
*/
```

---

## 15. SwiftUI 与 UIKit 跨平台对比

### 15.1 SwiftUI vs UIKit 完整对比

| 维度 | SwiftUI | UIKit | 分析 |
|------|---------|-------|------|
| 编程范式 | 声明式 | 命令式 | 声明式让 UI = f(State)，更简洁 |
| 布局系统 | VStack/HStack/ZStack | Auto Layout | 容器布局比约束更直观 |
| 状态管理 | @State/@Binding/@Published | delegate/NSNotif/KVO | SwiftUI 内建，零样板代码 |
| 数据绑定 | 自动（声明式） | 手动（代码/IBOutlets） | SwiftUI 自动同步 |
| 视图更新 | Diff + 增量渲染 | 手动 setNeedsDisplay | SwiftUI 更智能 |
| 预览 | Canvas 实时预览 | Storyboard/Preview | SwiftUI Preview 更快 |
| 跨平台 | iOS/macOS/watchOS/tvOS | iOS/iPadOS | SwiftUI 覆盖 4 平台 |
| 学习曲线 | 低 | 高 | 声明式语法更易学 |
| 自定义渲染 | Canvas/Shape | Core Graphics/UIKit | Canvas 更声明式 |
| 动画 | .animation()/withAnimation | UIView.animate/CA | SwiftUI 更简洁 |
| 手势 | .gesture()/TapGesture | UIGestureRecognizer | 概念类似 |
| 网络集成 | URLSession + async/await | URLSession + completionHandler | Swift Concurrency 更简洁 |
| 性能 | Metal GPU + Diff 开销 | Core Animation | 各有优劣 |
| 成熟度 | 快速演进（2019+） | 十年积累（2008+） | UIKit 生态更丰富 |
| 社区资源 | 快速增长 | 海量 | UIKit 资源更多 |
| 迁移成本 | 新项目首选 SwiftUI | 旧项目维护 UIKit | 渐进迁移策略 |

### 15.2 何时选择 SwiftUI vs UIKit

```
选择指南：

┌─ 新项目，面向 iOS 16+？────────────┐
│  → SwiftUI（首选）                  │
│  → UIKit + UIViewRepresentable      │
└───────────────────────────────────┘

┌─ 旧项目维护？──────────────────┐
│  → UIKit（继续维护）            │
│  → 逐步迁移部分界面到 SwiftUI    │
└─────────────────────────────────┘

┌─ 需要自定义绘图？──────────┐
│  → Canvas（SwiftUI）        │
│  → Core Graphics（UIKit）   │
└───────────────────────────┘

┌─ 需要 UIKit 特有组件？─┐
│  → UIViewRepresentable  │
│  → 直接 UIKit（无替代）  │
└────────────────────────┘

┌─ 需要跨平台（macOS等）？─┐
│  → SwiftUI（原生支持）    │
│  → UIKit 需单独适配       │
└─────────────────────────┘
*/
```

---

## 16. 面试考点汇总

### 16.1 SwiftUI 架构与原理

**Q1: SwiftUI 和 UIKit 的核心区别是什么？**

**答**：
- SwiftUI 是声明式框架（UI = f(State)），UIKit 是命令式框架
- SwiftUI 状态变化自动触发 Diff + 增量渲染；UIKit 需手动更新
- SwiftUI 内置状态管理（@State/@Binding/@ObservableObject）；UIKit 需手动 delegate/NSNotif/KVO
- SwiftUI 支持四平台（iOS/macOS/watchOS/tvOS）；UIKit 仅 iOS
- SwiftUI 学习曲线更低，UIKit 生态更成熟

**Q2: SwiftUI 的渲染机制是什么？**

**答**：
- 声明式视图 → 状态变化 → body 重新计算 → Diff 计算 → 增量更新 → Metal GPU 渲染
- 视图是值类型，每次刷新创建新实例（但框架智能 Diff，只更新变化部分）
- `some View` 是透明返回值（编译期确定），`AnyView` 是类型擦除（运行时开销）

**Q3: `some View` 和 `AnyView` 的区别？**

**答**：
- `some View` 是透明返回值（Opaque Return Type），编译期确定具体类型，零运行时开销
- `AnyView` 是类型擦除（Type Erasure），运行时消除类型信息，有动态分配开销
- 优先使用 `some View`，仅在需要动态返回不同类型时才用 `AnyView`

### 16.2 状态管理

**Q4: @State/@Binding/@ObservedObject/@EnvironmentObject 区别？**

**答**：
- `@State`：视图本地状态，值类型，存储在视图存储体中
- `@Binding`：父子视图双向绑定，借用引用
- `@StateObject`：创建并持有 ViewModel，与视图生命周期绑定
- `@ObservedObject`：消费外部 ViewModel，无所有权
- `@EnvironmentObject`：全局共享状态，通过环境系统传播
- iOS 17+ 推荐 `@Observable` 取代 `ObservableObject + @Published`

**Q5: @Published 是如何触发 UI 刷新的？**

**答**：
- `@Published` 是属性包装器，值改变前自动发送 `objectWillChange.send()`
- SwiftUI 订阅 `objectWillChange`，收到后重新计算 `body`
- 只跟踪值替换，不跟踪集合内部修改（items.append 不触发）

**Q6: @StateObject 和 @ObservedObject 什么时候会重复创建对象？**

**答**：
- `@ObservedObject` 在父视图刷新时会重新赋值（但对象本身不重建）
- `@StateObject` 只在其所属视图初始化时创建一次
- 如果父视图频繁刷新，用 `@ObservedObject` 可能导致初始化代码多次执行

### 16.3 布局系统

**Q7: SwiftUI 布局与 Auto Layout 的核心区别？**

**答**：
- Auto Layout 基于约束（等式/不等式），需手动设置优先级解决冲突
- SwiftUI 布局基于两阶段协议：父容器下发 constraints → 子视图返回 ideal size
- SwiftUI 更直观、更声明式，Auto Layout 更灵活但更复杂

**Q8: Spacer() 的工作原理？**

**答**：
- Spacer 返回弹性视图，自动填充可用空间
- 多个 Spacer 按 layoutPriority 分配空间
- 不占用 fixed size，自适应剩余空间

### 16.4 性能优化

**Q9: SwiftUI 性能优化策略？**

**答**：
1. LazyVStack/LazyHStack 延迟加载
2. @StateObject 而非 @ObservedObject（避免重复刷新）
3. 提取自定义视图，减少不必要的重绘区域
4. AsyncImage 预加载网络图片
5. body 计算提取到 ViewModel
6. 使用 frame 预计算布局大小
7. clipShape 替代 clip
8. .animation(nil) 禁用关键视图动画
9. 扁平化视图树结构
10. 用 some View 替代 AnyView

### 16.5 与 UIKit 互操作

**Q10: SwiftUI 与 UIKit 如何集成？**

**答**：
- `UIViewRepresentable`：SwiftUI 中嵌入 UIKit 视图（如 MKMapView）
- `UIViewControllerRepresentable`：SwiftUI 中嵌入 UIKit 控制器
- `UIHostingController`：UIKit 中嵌入 SwiftUI 视图
- Coordinator 模式处理 UIKit 代理回调

### 16.6 环境对象

**Q11: EnvironmentObject 的实现原理？**

**答**：
- SwiftUI 环境是字典式的值类型，通过 `.environment(key, value)` 向上层传播
- 子视图通过 `.environmentObject(T)` 从环境字典中提取对应类型
- 运行时通过类型擦除和恢复实现
- 编译期只检查类型，不检查是否存在（运行时崩溃风险）

### 16.7 SwiftData

**Q12: SwiftData 和 CoreData 的区别？**

**答**：
- SwiftData 基于 Swift 5.9+ @Model 宏，类型安全、零样板代码
- CoreData 基于 NSManagedObject，需 XCDatamodeld 设计数据模型
- SwiftData 与 SwiftUI 深度集成，CoreData 需手动适配
- SwiftData 更简洁但较新，CoreData 更成熟但复杂

### 16.8 iOS 16+ / 17+

**Q13: iOS 16+ NavigationStack 的优势？**

**答**：
- 替代废弃的 NavigationView
- 支持 value-based 导航
- 支持编程式导航（.navigationDestination）
- 支持导航栈操作（.toolbar、.navigationTitle）
- 与 SwiftUI 数据流深度集成

**Q14: iOS 17+ @Observable 的优势？**

**答**：
- 取代 ObservableObject + @Published
- 无需 Combine 框架依赖
- 编译时自动生成追踪代码
- 后台线程修改自动 dispatch 到主线程
- 更简洁的语法，更好的可测性

### 16.9 SwiftUI vs Compose 跨平台

**Q15: SwiftUI 和 Compose 的核心差异？**

**答**：
- SwiftUI 基于 struct 值类型 + body 属性，Compose 基于 @Composable 函数
- SwiftUI 渲染到 Metal，Compose 渲染到 Skia/Vulkan
- SwiftUI 用 @Observable 宏，Compose 用 mutableStateOf
- SwiftUI 更声明式，Compose 更接近函数式
- SwiftUI 生态更成熟（四平台），Compose 跨平台更活跃

**Q16: 如何将 SwiftUI 概念对应到 Compose？**

**答**：
- View → @Composable
- @State → mutableStateOf
- @Binding → 传递可变状态引用
- LazyVStack → LazyColumn
- NavigationStack → NavHost
- .task → LaunchedEffect
- .modifier → Modifier
- Canvas → Canvas (Compose)

---

### 📝 面试回答模板（一键总结）

> "SwiftUI 是 Apple 在 2019 年推出的声明式 UI 框架。核心是 `UI = f(State)`，通过 `@State`/`@Binding`/`@ObservableObject` 管理状态，状态变化自动触发 Diff + 增量渲染到 Metal GPU。布局用 VStack/HStack/ZStack 容器，而非 Auto Layout 约束。与 UIKit 通过 UIViewRepresentable/UIHostingController 桥接。性能优化关键是 LazyVStack、状态分离、提取自定义视图。iOS 17+ 用 `@Observable` 宏取代 ObservableObject。与 Android Compose 类似，都是声明式框架，但 SwiftUI 基于 struct 值类型，Compose 基于函数 Recomposition。"

---

*本文档覆盖 SwiftUI 全栈知识体系，对标 Android Compose 的深度，面向中高级 iOS 开发者面试与系统学习。*
