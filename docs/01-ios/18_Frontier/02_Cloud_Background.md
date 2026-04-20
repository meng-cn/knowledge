
--- 源文件: 01-12_云服务综合.md ---
# 01 - CloudKit 云存储

## CloudKit 核心概念

```
CloudKit = Apple 云服务
- 数据容器（Container）
- 记录（Record）
- 字段（Field）
- 数据库（Private/Public/Zones）
- 订阅（Subscription）
```

### 基本使用

```swift
import CloudKit

let container = CKContainer(identifier: "iCloud.com.myapp")
let publicDatabase = container.publicCloudDatabase
let privateDatabase = container.privateCloudDatabase

// 创建记录
let record = CKRecord(recordType: "User")
record["name"] = "Alice"
record["age"] = 25

// 保存
publicDatabase.save(record) { record, error in
    if let error = error { print("保存失败: \(error)") }
    else { print("保存成功") }
}

// 查询
let predicate = NSPredicate(format: "name CONTAINS[c] %@", "Alice")
let query = CKQuery(recordType: "User", predicate: predicate)
publicDatabase.perform(query, inZoneWith: nil) { results, error in
    if let results = results {
        for record in results { print(record["name"] as? String) }
    }
}
```

---

# 02 - iCloud 同步

## iCloud 文件/数据同步

### 文件同步

```swift
// NSFileCoordinator
let coordinator = NSFileCoordinator(filePresenter: self)
coordinator.coordinate(writingItemAt: url, options: .forUpdating, error: nil) { newURL in
    // 写入文件
}

// NSMetadataQuery
let query = NSMetadataQuery()
query.searchScopes = [NSMetadataQueryiCloudDriveScope]
query.predicate = NSPredicate(format: "%K LIKE '*txt'", NSMetadataItemFSNameKey)
query.start()

// iCloud 键值存储
let iCloudDefaults = UserDefaults(suiteName: "iCloud.com.myapp")
iCloudDefaults?.set("value", forKey: "key")

// CloudKit 订阅
let subscription = CKRecordZone.Subscription(recordType: "User", zoneID: zone.zoneID)
subscription.notificationInfo = CKSubscription.NotificationInfo()
zone.add(subscription: subscription)
```

---

# 03 - 后台任务

## BGTaskScheduler

### 基本使用

```swift
import BackgroundTasks

// 注册任务
BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.myapp.refresh",
                                using: .main) { task in
    self.handleAppRefresh(task as! BGAppRefreshTask)
}

func scheduleRefreshTask() {
    let request = BGAppRefreshTaskRequest(identifier: "com.myapp.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    BGTaskScheduler.shared.submit(request)
}

func handleAppRefresh(_ task: BGAppRefreshTask) {
    task.expirationHandler = { /* 任务即将超时 */ }
    fetchData { success in
        task.setTaskCompleted(success: success)
    }
}
```

---

# 04 - BGAppRefreshTask

## 后台刷新

```
系统条件：
- 设备充电
- 连接 Wi-Fi
- 用户活跃
- 电量充足

调度策略：
BGAppRefreshTaskRequest.earliestBeginDate
BGProcessingTaskRequest.earliestBeginDate

限制：
- 每天约几次
- 根据使用情况动态调整
- 无法保证执行时间
```

---

# 05 - BGProcessingTask

## 后台处理任务

```swift
// 处理长耗时任务
BGProcessingTaskRequest(identifier: "com.myapp.processing")
request.requiresNetworkConnectivity = true
request.requiresExternalPower = false
request.earliestBeginDate = Date(timeIntervalSinceNow: 1 * 3600)
```

---

# 06 - BGAppRefresh

## 后台应用刷新

```
设置：
Settings → General → Background App Refresh

Info.plist:
UIBackgroundModes → fetch

代码：
UIApplication.shared.beginBackgroundTask {
    // 执行后台任务
    UIApplication.shared.endBackgroundTask(taskId)
}
```

---

# 07 - BackgroundModes

## 后台模式配置

```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>processing</string>
    <string>audio</string>
    <string>location</string>
    <string>voip</string>
    <string>external-accessory</string>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
</array>
```

---

# 08 - AppIntent

## iOS 16+ App Intents

```swift
import AppIntents

struct SearchIntent: AppIntent {
    static let title = LocalizedString("搜索", bundle: .module)
    
    @Parameter(title: "Name")
    var name: String
    
    func perform() async throws -> some IntentResult {
        let results = await search(query: name)
        return .result(results: results)
    }
}

// 快捷指令
struct PlayMusicIntent: AppIntent {
    func perform() async throws -> some View & IntentResult {
        await musicPlayer.play(song: songName)
        return .result()
    }
}
```

---

# 09 - WidgetKit 进阶

## 小组件

```swift
import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), value: 0)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        completion(SimpleEntry(date: Date(), value: 42))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        let entries = [SimpleEntry(date: Date(), value: Int.random(in: 0..<100))]
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let value: Int
}

struct MyWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MyWidget", provider: Provider()) { entry in
            Text("Value: \(entry.value)")
                .font(.largeTitle)
                .padding()
        }
        .configurationDisplayName("My Widget")
        .description("Widget description")
    }
}
```

---

# 10 - AppClip

## App Clip 轻应用

```
App Clip：
- 快速启动（<10 秒）
- 小体积（<10MB）
- 无需安装
- 触发方式：二维码/ NFC/ URL/ 地图
- 分享 App Clip

Info.plist:
NSAppClip: { NSAppClipExpirationNotificationDaysBefore: 30 }
NSAppClip: { NSAppClipTriggeringURIs: ["myapp://clip"] }
```

---

# 11 - Intents

## Siri / 快捷指令

```swift
// 自定义 Intent
struct GreetIntent: Intent {
    @Parameter(title: "Name")
    var name: String
    
    var result: GreetIntentResult {
        GreetIntentResult(message: "Hello, \(name)!")
    }
}

// Siri 支持
// 在 App Intents 中声明
```

---

# 12 - 动态配置

## Remote Config

```swift
import FirebaseRemoteConfig

let remoteConfig = RemoteConfig.remoteConfig()
let settings = RemoteConfigSettings()
settings.minimumFetchInterval = 0  // 开发时
remoteConfig.configSettings = settings

remoteConfig.fetchAndActivate { status, error in
    if let error = error { print("获取失败: \(error)") }
    else {
        let value = remoteConfig["feature_flag"].stringValue
        print("Feature: \(value)")
    }
}
```

---

> 📌 **31_Cloud_Background 01-12 完成** ✅


--- 源文件: 01-13_云服务综合.md ---
# 01 - CloudKit 云存储

## CloudKit 核心概念

```
CloudKit = Apple 云服务
- 数据容器（Container）
- 记录（Record）
- 字段（Field）
- 数据库（Private/Public/Zones）
- 订阅（Subscription）
```

### 基本使用

```swift
import CloudKit

let container = CKContainer(identifier: "iCloud.com.myapp")
let publicDatabase = container.publicCloudDatabase
let privateDatabase = container.privateCloudDatabase

// 创建记录
let record = CKRecord(recordType: "User")
record["name"] = "Alice"
record["age"] = 25

// 保存
publicDatabase.save(record) { record, error in
    if let error = error { print("保存失败: \(error)") }
    else { print("保存成功") }
}

// 查询
let predicate = NSPredicate(format: "name CONTAINS[c] %@", "Alice")
let query = CKQuery(recordType: "User", predicate: predicate)
publicDatabase.perform(query, inZoneWith: nil) { results, error in
    if let results = results {
        for record in results { print(record["name"] as? String) }
    }
}
```

---

# 02 - iCloud 同步

## iCloud 文件/数据同步

```swift
// NSFileCoordinator
let coordinator = NSFileCoordinator(filePresenter: self)
coordinator.coordinate(writingItemAt: url, options: .forUpdating, error: nil) { newURL in /* 写入文件 */ }

// NSMetadataQuery
let query = NSMetadataQuery()
query.searchScopes = [NSMetadataQueryiCloudDriveScope]
query.predicate = NSPredicate(format: "%K LIKE '*txt'", NSMetadataItemFSNameKey)
query.start()

// iCloud 键值存储
let iCloudDefaults = UserDefaults(suiteName: "iCloud.com.myapp")
iCloudDefaults?.set("value", forKey: "key")
```

---

# 03 - 后台任务

## BGTaskScheduler

```swift
import BackgroundTasks

BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.myapp.refresh", using: .main) { task in
    self.handleAppRefresh(task as! BGAppRefreshTask)
}

func scheduleRefreshTask() {
    let request = BGAppRefreshTaskRequest(identifier: "com.myapp.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    BGTaskScheduler.shared.submit(request)
}

func handleAppRefresh(_ task: BGAppRefreshTask) {
    task.expirationHandler = { /* 任务即将超时 */ }
    fetchData { success in task.setTaskCompleted(success: success) }
}
```

---

# 04 - BGAppRefreshTask

## 后台刷新

```
系统条件：设备充电/连接Wi-Fi/用户活跃/电量充足
调度策略：earliestBeginDate
限制：每天约几次，动态调整，无法保证执行时间
```

---

# 05 - BGProcessingTask

## 后台处理任务

```swift
BGProcessingTaskRequest(identifier: "com.myapp.processing")
request.requiresNetworkConnectivity = true
request.requiresExternalPower = false
request.earliestBeginDate = Date(timeIntervalSinceNow: 1 * 3600)
```

---

# 06 - BGAppRefresh

## 后台应用刷新

```
Settings → General → Background App Refresh
UIBackgroundModes → fetch
UIApplication.shared.beginBackgroundTask { /* 执行后台任务 */ }
```

---

# 07 - BackgroundModes

## 后台模式配置

```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string><string>processing</string><string>audio</string>
    <string>location</string><string>voip</string><string>external-accessory</string>
    <string>bluetooth-central</string><string>bluetooth-peripheral</string>
</array>
```

---

# 08 - AppIntent

## iOS 16+ App Intents

```swift
import AppIntents

struct SearchIntent: AppIntent {
    static let title = LocalizedString("搜索", bundle: .module)
    @Parameter(title: "关键词") var query: String
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let results = await search(query: query)
        return .result(dialog: "搜索结果: \(results)")
    }
}

struct PlayMusicIntent: AppIntent {
    func perform() async throws -> some IntentResult {
        await musicPlayer.play(song: songName)
        return .result()
    }
}
```

---

# 09 - WidgetKit 进阶

## 小组件

```swift
import WidgetKit, SwiftUI

struct WidgetEntry: TimelineEntry { let date: Date; let value: Int }
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry { WidgetEntry(date: Date(), value: 0) }
    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) { completion(WidgetEntry(date: Date(), value: 42)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let entries = [WidgetEntry(date: Date(), value: Int.random(in: 0..<100))]
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct MyWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MyWidget", provider: Provider()) { entry in
            Text("Value: \(entry.value)").font(.largeTitle).padding()
        }.configurationDisplayName("My Widget").description("Widget description")
    }
}
```

---

# 10 - AppClip

## App Clip 轻应用

```
App Clip：快速启动（<10秒）/ 小体积（<10MB）/ 无需安装 / 触发方式：二维码/NFC/URL/地图
NSAppClip: { NSAppClipTriggeringURIs: ["myapp://clip"] }
```

---

# 11 - Intents

## Siri / 快捷指令

```swift
struct GreetIntent: Intent {
    @Parameter(title: "Name") var name: String
    var result: GreetIntentResult { GreetIntentResult(message: "Hello, \(name)!") }
}
```

---

# 12 - 动态配置

## Remote Config

```swift
import FirebaseRemoteConfig
let remoteConfig = RemoteConfig.remoteConfig()
remoteConfig.configSettings = RemoteConfigSettings(); remoteConfig.configSettings.minimumFetchInterval = 0
remoteConfig.fetchAndActivate { status, error in
    let value = remoteConfig["feature_flag"].stringValue
    print("Feature: \(value)")
}
```

---

# 13 - 云服务面试题

## 云服务高频面试题

### Q1: CloudKit 原理？
答：Apple 云存储，容器/记录/字段模型，支持私有/公共数据库。

### Q2: 后台任务限制？
答：每天约几次，根据使用情况动态调整，无法保证执行时间。

### Q3: WidgetKit 原理？
答：Timeline 提供数据，Widget 渲染，系统定期刷新。

### Q4: App Clip 限制？
答：<10MB，快速启动，通过二维码/NFC/URL 触发。

### Q5: iCloud 同步？
答：NSFileCoordinator + CloudKit，自动同步文件和数据。
