# 03 - iOS 前沿技术全栈

## 目录

1. [Swift 6 与并发](#1-swift-6-与并发)
2. [Swift Concurrency 深度](#2-swift-concurrency-深度)
3. [Swift Macros 宏](#3-swift-macros-宏)
4. [Swift 6 线程安全](#4-swift-6-线程安全)
5. [MLKit / CoreML](#5-mlkit-coreml)
6. [WidgetKit 小组件](#6-widgetkit-小组件)
7. [Spotlight / Shortcuts](#7-spotlight-shortcuts)
8. [ARKit 增强现实](#8-arkit-增强现实)
9. [前沿技术 Android 对比](#9-前沿技术-android-对比)
10. [面试考点汇总](#10-面试考点汇总)

---

## 1. Swift 6 与并发

### 1.1 Swift 6 核心变化

```
Swift 6 主要变化：

┌──────────────────────────────────────────────────────────┐
│ 变化项              │ Swift 5.9        │ Swift 6              │
├────────────────┬───┼──────────────────────────────┤
│ 数据race检测    │ 实验性            │ 默认启用              │
│ Sendable        │ 可选              │ 强制                  │
│ isolated        │ 基础支持          │ 完整实现              │
│ 线程安全        │ 手动管理          │ 编译器检查            │
│ actor           │ 可用              │ 完整实现              │
└────────────────┴──┴────────────────────────────────┘
```

### 1.2 Sendable 协议

```swift
// Sendable 标记类型是线程安全的
struct SafeData: Sendable {
    let value: Int
}

// 类需要显式声明线程安全
class MyClass: @unchecked Sendable {
    private let lock = NSLock()
    var data: Int = 0
    
    func update(_ value: Int) {
        lock.lock()
        defer { lock.unlock() }
        data = value
    }
}

// 编译器检查
func test() {
    let safe = SafeData(value: 42)  // ✅ 编译通过
    let unsafe = MyClass()  // ⚠️ @unchecked Sendable，需谨慎
}
```

---

## 2. Swift Concurrency 深度

### 2.1 async/await

```swift
// 基础用法
func fetchData() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let error = error {
                continuation.resume(throwing: error)
            } else {
                continuation.resume(returning: data!)
            }
        }.resume()
    }
}

// 并发执行
let (data1, data2, data3) = await (
    Task { try await fetchData(from: url1) },
    Task { try await fetchData(from: url2) },
    Task { try await fetchData(from: url3) }
).value

// async let
async let task1 = fetchData(from: url1)
async let task2 = fetchData(from: url2)
let result1 = await task1
let result2 = await task2
```

### 2.2 Actor 隔离

```swift
// Actor - 线程安全的共享状态
actor Database {
    private var data: [String: Any] = [:]
    
    func query(_ key: String) -> Any? {
        return data[key]  // ✅ 编译器自动保证线程安全
    }
    
    func update(_ key: String, value: Any) async {
        data[key] = value  // ✅ 原子操作
    }
}

// 使用 Actor
let db = Database()
await db.update("user", value: "John")
let user = await db.query("user")

// 隔离域
actor MyActor {
    // 默认 isolated(self)
    private var count = 0
    
    func increment() {
        count += 1  // 默认隔离
    }
    
    nonisolated func getCount() -> Int {
        // nonisolated 不能直接访问 self
        return 0
    }
}
```

### 2.3 TaskGroup 与任务层级

```swift
// 任务组
func processItems(_ items: [Item]) async throws -> [Result] {
    try await withThrowingTaskGroup(of: Result.self) { group in
        for item in items {
            group.addTask {
                try await process(item)
            }
        }
        
        var results: [Result] = []
        for try await result in group {
            results.append(result)
        }
        return results
    }
}

// 任务层级
func parentTask() async {
    let child = Task {
        // 父任务取消时子任务自动取消
        try await longRunningOperation()
    }
    
    try await child.value
}

// TaskGroup vs TaskHandle
// TaskGroup: 适合不确定数量的并发任务
// TaskHandle: 适合已知数量的并发任务
```

---

## 3. Swift Macros 宏

### 3.1 宏类型

```
Swift Macros 分类：

┌──────────────────┐  ┌──────────────┐
│ 表达式宏 (Expr)   │  │ 声明宏 (Decl) │
│ @attached(member) │  │ @attached(     │
│ @attached(member) │  │   member)     │
├──────────────────┤  ├───────────────┤
│  添加方法/属性    │  │  添加类/协议   │
└──────────────────┘  └───────────────┘

┌──────────────────┐  ┌──────────────────┐
│ 泛化宏 (Full)     │  │ 函数式宏 (Func)  │
│ 完全展开           │  │  函数展开         │
└──────────────────┘  └──────────────────┘
```

### 3.2 宏实现

```swift
// 表达式宏 - 打印调试
@freestanding(declaration)
public macro printDebug(_ value: Any, file: String = #file, line: Int = #line) = #externalMacro(module: "Macros", type: "PrintDebugMacro")

// 声明宏 - 自动 Equatable
@attached(member, names: named(Hashable))
@attached(extension, protocols: Equatable)
public macro MyModel() = #externalMacro(module: "Macros", type: "ModelMacro")

// 使用宏
@printDebug(someValue)  // 展开为 print("someValue: \(someValue)")
@MyModel()
struct User {
    let id: Int
    let name: String
}
// 展开后自动生成 Hashable 实现
```

---

## 4. Swift 6 线程安全

### 4.1 数据竞争检测

```
Swift 6 数据竞争检测：

┌──────────────────────────────────────────────────────────┐
│  编译时检测                     │   运行时检查               │
│  • Sendable 推断              │  • Thread Sanitizer (TSan) │
│  • 隔离域强制                  │  • Swift Concurrency 检查  │
│  • 跨隔离访问显式化            │                           │
│  • 不可变数据隐式 Sendable     │                           │
└─────────────────────────────────────────────────────────┘

// 隐式 Sendable（不可变类型）
struct ImmutableData {  // 自动 Sendable
    let value: Int
}

// 显式 Sendable（需要验证）
class MutableData: Sendable {  // 需手动验证线程安全
    var value: Int
}
```

---

## 5. MLKit / CoreML

### 5.1 CoreML 模型使用

```swift
import CoreML
import Vision

// 加载模型
let config = MLModelConfiguration()
config.computeUnits = .all  // .cpuAndGPU / .cpuOnly

let model = try? Resnet50(configuration: config)

// 推理
func predict(image: UIImage) -> String {
    guard let pixelBuffer = image.toPixelBuffer() else { return "" }
    
    let request = MLModelRequest(model: model!)
    guard let prediction = try? request.prediction(image: pixelBuffer) else { return "" }
    
    return prediction.label
}

// Vision 框架 - 图像处理
let request = VNClassifyImageRequest { request in
    guard let results = request.results as? [VNClassificationObservation] else { return }
    for classification in results.prefix(3) {
        print("\(classification.identifier): \(confidence)")
    }
}
request.model = try? VNCoreMLModel(for: model!.model)

let handler = VNImageRequestHandler(ciImage: CIImage(image: image)!)
try? handler.perform([request])
```

### 5.2 MLKit 端侧 ML

```swift
import MLKitVision
import MLKitTextRecognition

// 文本识别
func recognizeText(image: UIImage) async throws -> String {
    let pixelBuffer = image.toPixelBuffer()
    let visionImage = VisionImage(pixelBuffer: pixelBuffer!)
    visionImage.orientation = image.imageOrientation
    
    let textRecognizer = TextRecognition.textRecognizer()
    let result = try await textRecognizer.results(in: visionImage)
    
    return result.text
}

// 人脸检测
let detector = FaceDetector.faceDetector(options: options)
let faces = try detector.results(in: image)

// 图像标签
let labeler = ImageLabeler.imageLabeler(options: options)
let labels = try await labeler.results(in: image)
```

---

## 6. WidgetKit 小组件

### 6.1 Widget 架构

```
WidgetKit 架构：

┌──────────────────────────────────────────────────────────┐
│              WidgetKit                              │
├───────────────────────────────────────────────────────┤
│ TimelineProvider  →  TimelineEntry  →  Timeline       │
│ (数据提供者)       │ (条目)         │ (时间线)          │
├───────────────────────────────────────────────────────┤
│ TimelineEntry:       │   包含 data + date               │
│   • date: 更新时间    │                                   │
│   • content: 显示内容 │                                   │
├───────────────────────────────────────────────────────┤
│ TimelinePolicy:      │   .after(date)                   │
│   • after: 指定时间刷新                               │
│   • atEnd: 末尾刷新                                 │
│   • never: 不刷新                                   │
└────────────────────────────────────────────────────────┘
```

### 6.2 Widget 示例

```swift
struct WeatherWidget: Widget {
    let kind: String = "WeatherWidget"
    
    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WeatherProvider()) { entry in
            WeatherEntryView(entry: entry)
        }
        .configurationDisplayName("天气")
        .description("显示当前天气")
    }
}

struct WeatherProvider: TimelineProvider {
    func placeholder(in context: Context) -> WeatherEntry {
        WeatherEntry(date: Date(), temperature: 22)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (WeatherEntry) -> Void) {
        let entry = WeatherEntry(date: Date(), temperature: 25)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<WeatherEntry>) -> Void) {
        let entry = WeatherEntry(date: Date(), temperature: 25)
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
        completion(timeline)
    }
}

struct WeatherEntry: TimelineEntry {
    let date: Date
    let temperature: Int
}

struct WeatherEntryView: View {
    var entry: WeatherEntry
    
    var body: some View {
        VStack {
            Text("🌤")
            Text("\(entry.temperature)°C")
            Text(entry.date, style: .time)
        }
        .padding()
    }
}
```

---

## 7. Spotlight / Shortcuts

### 7.1 Shortcuts（捷径）

```swift
import SwiftData

// 与 Shortcuts 集成
// Info.plist 中添加 NSUserActivityTypes
// 支持从 Shortcuts App 触发
// 支持 Widget 触发

// 用户活动
let activity = NSUserActivity(activityType: "com.app.openFeature")
activity.title = "打开功能"
activity.userInfo = ["feature": "settings"]
activity.isEligibleForSearch = true
activity.isEligibleForPrediction = true
self.becomeFirstResponder()
```

---

## 8. ARKit 增强现实

### 8.1 ARKit 架构

```
ARKit 框架：

┌────────────────────────────────────────────────┐
│              ARKit                              │
├────────────────────────────────────────────────┤
│ ARSession → ARFrame → ARHitTestResult           │
│ (会话管理)  (帧数据)   (命中检测)               │
├────────────────────────────────────────────────┤
│ ARWorldTracking → ARFaceTracking → ARBodyTracking│
│ (世界追踪)     (面部追踪)    (身体追踪)         │
├────────────────────────────────────────────────┤
│ ARAnchor (锚点) / ARReferenceImage (参考图像)  │
│ ARPlaneAnchor (平面检测) / ARRaycastManager     │
└─────────────────────────────────────────────────┘
```

### 8.2 ARKit 基础

```swift
import ARKit
import ARKit

class ARViewController: ARSCNViewDelegate {
    
    let session = ARSession()
    
    func setupAR() {
        let config = ARWorldTrackingConfiguration()
        config.worldAlignment = .gravityAndHeading
        config.environmentTexturing = .automatic
        
        session.run(config)
        
        // 平面检测
        config.planeDetection = [.horizontal, .vertical]
        session.run(config)
        
        // 光照估计
        config.lightEstimation = .automatic
    }
    
    // MARK: - ARSCNViewDelegate
    
    func renderer(_ renderer: SCNSceneRenderer,
                  didAdd node: SCNNode,
                  for anchor: ARAnchor) {
        if let planeAnchor = anchor as? ARPlaneAnchor {
            // 添加平面可视化
            let plane = SCNPlane(width: planeAnchor.extent.x,
                               height: planeAnchor.extent.z)
            let planeNode = SCNNode(geometry: plane)
            planeNode.position = SCNVector3Make(0, 0, -planeAnchor.extent.z / 2)
            planeNode.opacity = 0.3
            node.addNode(planeNode)
        }
    }
    
    // 点击放置
    func handleTap(_ gesture: UITapGestureRecognizer) {
        let location = gesture.location(in: self)
        let hits = self.hitTest(location, types: [.existingPlaneUsingExtent])
        
        if let hit = hits.first {
            let anchor = ARAnchor(transform: hit.worldTransform)
            session.add(anchor: anchor)
        }
    }
}
```

---

## 9. 前沿技术 Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 宏 | Swift Macros | Kotlin Symbol Processor (KSP) |
| 并发模型 | async/await + Actor | Kotlin Coroutines + Flow |
| ML | CoreML / MLKit | ML Kit / TensorFlow Lite |
| Widget | WidgetKit | App Widget / Widget |
| AR | ARKit | ARCore |
| 语音助手 | Siri / Shortcuts | Google Assistant |
| 线程安全 | Sendable + TSan | volatile + synchronized |

---

## 10. 面试考点汇总

### 高频面试题

1. **Swift 6 的 Sendable 是什么？**
   - 标记线程安全类型的协议
   - 不可变类型自动 Sendable
   - 类需要手动声明，编译器严格检查

2. **Actor 的作用？**
   - 保证共享状态线程安全
   - 隔离域隔离状态访问
   - 跨隔离访问需要 await

3. **Swift Macros 类型？**
   - 表达式宏（替换表达式）
   - 声明宏（生成声明）
   - 泛化宏（完整代码生成）

4. **CoreML 推理流程？**
   - 加载模型 → 准备输入数据 → MLModelRequest → 获取预测结果
   - Vision 框架用于图像分类/检测

5. **WidgetKit 数据刷新机制？**
   - TimelineProvider 提供数据
   - Timeline 指定刷新策略
   - .after/.atEnd/.never 三种策略

### 面试回答模板

> "Swift 6 核心是 Sendable 强制线程安全，Actor 隔离共享状态。宏系统支持编译时代码生成。CoreML 用于端侧 ML 推理，ARKit 处理增强现实。WidgetKit 通过 TimelineProvider 管理小组件数据更新。"

---

*本文档对标 Android `32_Extensions_Frontier` 的深度*
