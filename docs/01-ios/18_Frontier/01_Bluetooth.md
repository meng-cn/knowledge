# 01 - iOS 蓝牙与云服务全栈

## 目录

1. [Core Bluetooth 架构](#1-core-bluetooth-架构)
2. [BLE 通信流程](#2-ble-通信流程)
3. [蓝牙权限与适配](#3-蓝牙权限与适配)
4. [Background Modes](#4-background-modes)
5. [CloudKit 核心](#5-cloudkit-核心)
6. [后台任务](#6-后台任务)
7. [蓝牙与云服务 Android 对比](#7-蓝牙与云服务-android-对比)
8. [面试考点汇总](#8-面试考点汇总)

---

## 1. Core Bluetooth 架构

### 1.1 CBPeripheralManager 和 CBCentralManager

```
Core Bluetooth 角色：

┌──────────────┐    ←─ 中央设备 (Central) ──→ 外设
│  CBCentral    │     (扫描、连接、请求服务)
│  Manager      │
└──────────────┘
          ⇅ BLE 通信 (GATT 协议)
┌──────────────┐    ←─ 外设设备 (Peripheral) ──→ 中央
│  CBPeripheral │     (广播、接收连接)
│  Manager      │
└──────────────┘

GATT 层级结构：
┌─────────────────────────┐
│       Service (服务)       │  ← 功能组
│   ┌───────────────┐      │
│   │  Characteristic │    │  ← 数据单元
│   │  (UUID + 值)     │    │
│   │  Properties:    │    │
│   │  - Read         │    │
│   │  - Write        │    │
│   │  - Notify       │    │
│   └───────────────┘      │
│   ┌───────────────┐      │
│   │  Characteristic │    │
│   └───────────────┘      │
└──────────────────────────┘
```

### 1.2 Central 设备（扫描连接）

```swift
class BluetoothManager: NSObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    
    private var centralManager: CBCentralManager!
    private var connectedPeripheral: CBPeripheral?
    
    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: .main)
    }
    
    // MARK: - CBCentralManagerDelegate
    
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            centralManager.scanForPeripherals(
                withServices: [UUID(uuidString: "your-service-uuid")!],
                options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
            )
        case .poweredOff, .unsupported, .unauthorized:
            print("蓝牙不可用")
        default:
            break
        }
    }
    
    func centralManager(_ central: CBCentralManager,
                        didDiscover peripheral: CBPeripheral,
                        advertisementData: [String: Any],
                        rssi RSSI: NSNumber) {
        // 发现外设，可连接
        connectedPeripheral = peripheral
        peripheral.delegate = self
        central.connect(peripheral, options: nil)
    }
    
    func centralManager(_ central: CBCentralManager,
                        didConnect peripheral: CBPeripheral) {
        // 发现服务
        peripheral.discoverServices([UUID(uuidString: "your-service-uuid")!])
    }
    
    // MARK: - CBPeripheralDelegate
    
    func peripheral(_ peripheral: CBPeripheral,
                    didDiscoverServices error: Error?) {
        guard let services = peripheral.services else { return }
        for service in services {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral,
                    didDiscoverCharacteristicsFor service: CBService,
                    error: Error?) {
        guard let characteristics = service.characteristics else { return }
        for char in characteristics {
            if char.properties.contains(.notify) {
                peripheral.setNotifyValue(true, for: char)
            }
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral,
                    didUpdateValueFor characteristic: CBCharacteristic,
                    error: Error?) {
        guard let data = characteristic.value else { return }
        // 处理接收到的数据
        print("收到数据: \(data)")
    }
    
    // 发送数据
    func sendData(_ data: Data) {
        guard let peripheral = connectedPeripheral else { return }
        // 找到可写的 characteristic
        peripheral.writeValue(data, for: characteristic, type: .withResponse)
    }
}
```

### 1.3 Peripheral 设备（广播数据）

```swift
class PeripheralManager: NSObject, CBPeripheralManagerDelegate {
    
    private var peripheralManager: CBPeripheralManager!
    
    override init() {
        super.init()
        peripheralManager = CBPeripheralManager(delegate: self, queue: .main)
    }
    
    // MARK: - 广播服务
    func advertise() {
        let serviceUUIDs = [CBUUID(string: "your-service-uuid")]
        let advertisement: [String: Any] = [
            CBAdvertisementDataServiceUUIDsKey: serviceUUIDs,
            CBAdvertisementDataLocalNameKey: "MyDevice"
        ]
        peripheralManager.startAdvertising(advertisement)
    }
    
    // MARK: - CBPeripheralManagerDelegate
    
    func peripheralDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            // 添加服务
            let characteristic = CBMutableCharacteristic(
                type: CBUUID(string: "your-char-uuid"),
                properties: .read | .write | .notify,
                value: nil,
                permissions: .readable | .writeable
            )
            let service = CBMutableService(type: CBUUID(string: "your-service-uuid"), primary: true)
            service?.characteristics = [characteristic]
            peripheralManager.add(service!)
            peripheralManager.startAdvertising([
                CBAdvertisementDataLocalNameKey: "MyDevice"
            ])
        }
    }
    
    func peripheral(_ peripheral: CBPeripheralManager,
                    didReceiveWriteRequests request: [CBATTRequest]) {
        for req in request {
            // 处理写入请求
            req.value = req.value
            peripheral.respond(to: req, with: .success)
        }
    }
}
```

---

## 2. BLE 通信流程

```
BLE 通信流程：

Central 设备:                              Peripheral 设备:
  ┌──────────┐                             ┌──────────┐
  │ 扫描外设  │───→ CBAdvertisementData ───→│ 广播数据  │
  │          │                              │          │
  │ 连接外设  │───→ L2CAP 连接 ────────────→│ 接收连接  │
  │          │                              │          │
  │ 发现服务  │───→ GATT Discover ────────→│ 注册服务  │
  │          │                              │          │
  │ 读写特征  │───→ GATT Read/Write ─────→│ 读写特征  │
  │          │                              │          │
  │ 订阅通知  │───→ GATT Notify ──────────→│ 推送通知  │
  └──────────┘                             └──────────┘

GATT 协议栈：
┌─────────────┐
│  Application │  BLE 应用层
│  Profile     │  (GATT Profile)
├─────────────┤
│  GATT        │  通用属性配置文件
├─────────────┤
│  ATT         │  属性传输协议
├─────────────┤
│  L2CAP       │  逻辑链路控制
├─────────────┤
│  HCI         │  主机控制接口
├─────────────┤
│  BLE Radio   │  蓝牙无线电
└─────────────┘
```

---

## 3. 蓝牙权限与适配

### 3.1 Info.plist 配置

```xml
<!-- iOS 13+ -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>需要使用蓝牙连接设备</string>

<!-- iOS 12 及以下 -->
<key>NSBluetoothPeripheralUsageDescription</key>
<string>需要使用蓝牙连接设备</string>

<!-- Core Bluetooth 无需额外权限声明 -->
```

### 3.2 蓝牙权限状态

| 状态 | 说明 |
|---|---|
| .poweredOn | 可用 |
| .poweredOff | 用户关闭 |
| .resetting | 蓝牙重置中 |
| .unauthorized | 应用无权限 |
| .unsupported | 设备不支持 |
| .restricted | 系统限制（家长控制） |

### 3.3 最大传输单元

```
BLE MTU（最大传输单元）：

• 默认 MTU: 23 bytes (20 bytes payload + 3 bytes header)
• 协商 MTU: 通过 exchangeMTU 请求增大
• 典型协商结果: 150-512 bytes（取决于硬件）

// 请求增大 MTU
peripheral.maximumWriteValueLength(for: .withResponse)
// 有响应写入的最大长度

peripheral.maximumWriteValueLength(for: .withoutResponse)
// 无响应写入的最大长度
```

---

## 4. Background Modes

### 4.1 后台蓝牙模式

```
Core Bluetooth 后台模式：

┌───────────────────────────────────────────┐
│ Info.plist → Background Modes → Bluetooth    │
│ LE accessories                                 │
├─────────────────────────────────────────────┤
│ • App 在后台时仍可扫描/连接外设               │
│ • 系统会重启你的 app 处理事件                  │
│ • 需实现 CBCentralManagerDelegate 的          │
│   centralManager:restorePeripherals          │
│   恢复外设列表                                │
└─────────────────────────────────────────────┘

恢复外设：
func centralManager(_ central: CBCentralManager,
                    restoreConnectedPeripherals profiles: [CBPeripheral]) {
    for peripheral in profiles {
        // 恢复连接状态
    }
}
```

---

## 5. CloudKit 核心

### 5.1 CloudKit 架构

```
CloudKit 架构：

┌───────────────────────────────────────────┐
│              CloudKit                       │
├────────────────────────────────────────┬──┤
│  Public Database   │  Private DB      │  │
│  (共享数据)        │  (用户私有)        │  │
├───────────────────┼────────────────┬──┤
│  CKRecord          │  CKRecord      │  │
│  CKQuery           │  CKQuery       │  │
│  CKSubscription    │  CKSubscription │  │
├───────────────────┼────────────────┬──┤
│  CKContainer       │  CKDatabase    │  │
│  (容器)            │  (数据库)       │  │
├───────────────────┼────────────────┬──┤
│  CKRecordZone      │  CKRecordZone  │  │
│  (记录区)          │               │  │
└───────────────────┴────────────────┴──┘
```

### 5.2 CloudKit 基本操作

```swift
import CloudKit

let container = CKContainer(identifier: "iCloud.com.your.app")
let publicDB = container.publicCloudDatabase
let privateDB = container.privateCloudDatabase

// 保存记录
let record = CKRecord(recordType: "User", recordID: CKRecord.ID())
record["name"] = "John"
record["age"] = 25

publicDB.save(record) { record, error in
    if let error = error {
        print("保存失败: \(error)")
    } else {
        print("保存成功")
    }
}

// 查询记录
let predicate = NSPredicate(format: "name == %@", "John")
let query = CKQuery(recordType: "User", predicate: predicate)
publicDB.perform(query, inZoneWith: nil) { results, error in
    for record in results ?? [] {
        if let name = record["name"] as? String {
            print("用户名: \(name)")
        }
    }
}

// 订阅记录
let subscription = CKRecordSubscription(recordType: "User")
subscription.events = .recordCreated
publicDB.save(subscription) { _, _ in }
```

---

## 6. 后台任务

### 6.1 BGTaskScheduler

```swift
import BackgroundTasks

// 注册后台任务
BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.app.backgroundSync",
                                using: .main) { task in
    handleBackgroundSync(task: task as! BGAppRefreshTask)
}

func handleBackgroundSync(task: BGAppRefreshTask) {
    task.expirationHandler = {
        task.setTaskCompleted(success: false)
    }
    
    // 执行后台任务（最多 30 秒）
    performNetworkRequest { success in
        task.setTaskCompleted(success: success)
    }
}

// 调度任务
let request = BGAppRefreshTaskRequest(identifier: "com.app.backgroundSync")
request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)  // 15 分钟后
BGTaskScheduler.shared.submit(request)
```

### 6.2 后台任务类型

| 类型 | 用途 | 最大时长 |
|---|---|---|
| BGAppRefreshTask | App 刷新 | 30s |
| BGMaintenanceTask | 系统维护 | 10s |
| BGProcessingTask | 长时间任务 | 10min |
| UIBackgroundTask | 前台延迟 | 3min |

---

## 7. 蓝牙与云服务 Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 蓝牙 | Core Bluetooth (BLE) | BLE API (BluetoothGatt) |
| 角色 | Central/Peripheral | Device/Server/Client |
| GATT | CBService/CBCharacteristic | BluetoothGattService/Characteristic |
| 云服务 | CloudKit | Firebase / 自建后端 |
| 后台通信 | Background Modes + BLE | Foreground Service + BLE |
| 数据同步 | CKSubscription + CloudKit | Firebase Realtime DB |

---

## 8. 面试考点汇总

### 高频面试题

1. **BLE 通信的核心概念？**
   - Central/Peripheral 角色
   - Service → Characteristic 层级
   - Read/Write/Notify 三种操作

2. **iOS 蓝牙后台支持？**
   - 需要配置 Background Modes
   - 系统自动恢复连接
   - CBCentralManagerDelegate 的 restorePeripherals 回调

3. **CloudKit 的数据库类型？**
   - Public Database：所有用户共享
   - Private Database：用户私有
   - 记录通过 CKRecord 管理

4. **Background Tasks 有哪些类型？**
   - BGAppRefreshTask：App 刷新（30s）
   - BGProcessingTask：长时间任务（10min）
   - BGMaintenanceTask：系统维护（10s）

### 面试回答模板

> "iOS 蓝牙用 Core Bluetooth 框架，Central 扫描连接 Peripheral，通过 Service/Characteristic 读写数据。支持后台模式，系统自动恢复连接。云服务用 CloudKit，分 Public 和 Private Database。后台任务用 BGTaskScheduler 调度。"

---

*本文档对标 Android `30_Bluetooth` + `31_Cloud_Background` 的深度*
