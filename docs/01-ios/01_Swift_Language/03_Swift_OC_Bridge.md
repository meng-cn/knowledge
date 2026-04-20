# 03 - Swift ↔ Objective-C 混编深度指南

## 目录

1. [混编基础与架构](#1-混编基础与架构)
2. [混编编译原理](#2-混编编译原理)
3. [桥接文件完整机制](#3-桥接文件完整机制)
4. [类型映射完整分析](#4-类型映射完整分析)
5. [Toll-Free Bridging 深度解析](#5-toll-free-bridging-深度解析)
6. [selector 机制完整分析](#6-selector-机制完整分析)
7. [@objc 与 @objcMembers 完整解析](#7-objc-与-objcmembers-完整解析)
8. [混编协议深度分析](#8-混编协议深度分析)
9. [混编类深度分析](#9-混编类深度分析)
10. [混编内存管理](#10-混编内存管理)
11. [混编常见问题与解决方案](#11-混编常见问题与解决方案)
12. [混编性能分析](#12-混编性能分析)
13. [Swift ↔ Objective-C 完整对比表](#13-swift- Objective-c-完整对比表)
14. [面试题汇总](#14-面试题汇总)

---

## 1. 混编基础与架构

### 1.1 Swift 与 Objective-C 混编完整架构

```
Swift ↔ Objective-C 混编架构总览：

┌─────────────────────────────────────────────────────────────────┐
│                                                              │
│  Swift 项目（Swift 为主）                                    │
│  ┌───────────────────────────────────────────────┐           │
│  │  Swift Code (.swift)                           │           │
│  │  ↓                                             │           │
│  │  Swift Compiler → *-Swift.h (自动桥接头)       │           │
│  │  ↓                                             │           │
│  │  Bridging Header (.h)                          │           │
│  │  ↓                                             │           │
│  │  Objective-C Code (.m/.h)                      │           │
│  └───────────────────────────────────────────────┘           │
│                                                              │
│  Objective-C 项目（OC 为主）                                 │
│  ┌───────────────────────────────────────────────┐           │
│  │  Objective-C Code (.m/.h)                      │           │
│  │  ↓                                             │           │
│  │  Swift Compiler → Product-Swift.h (自动)       │           │
│  │  ↓                                             │           │
│  │  Swift Code (.swift)                            │           │
│  └───────────────────────────────────────────────┘           │
│                                                              │
│  混编方向：                                                  │
│  • Swift → Objective-C：@objc 标记的类/方法/协议可被 OC 访问  │
│  • Objective-C → Swift：通过桥接头/自动生成的头文件           │
│  • Toll-Free Bridging：Foundation 类型自动桥接              │
│  • 桥接头自动生成/管理（Xcode 自动处理）                     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### 1.2 Swift 与 Objective-C 混编方式

```
混编方式完整分类：

┌─────────────────────────────────────────────────────────────────┐
│ 混编方式                │ 说明                                │ 复杂度 │
├────────────────────────┼───────────────────────────────────┼───────┤
│ Bridging Header        │ OC 头文件注入 Swift 编译环境      │ ⭐     │
│ *-Swift.h 自动桥接     │ Xcode 自动生成 Swift 到 OC 的桥接  │ ⭐     │
│ Toll-Free Bridging     │ NSString/NSData 等自动桥接        │ ⭐     │
│ selector 桥接          │ @selector 调用 Swift 方法          │ ⭐⭐   │
│ Protocol 混编          │ OC 协议与 Swift 协议互操作         │ ⭐⭐   │
│ Class 混编             │ OC 类与 Swift 类互操作            │ ⭐⭐⭐ │
│ KVO 混编               │ Swift 对象 KVO                    │ ⭐⭐⭐ │
│ Runtime 混编           │ objc_msgSend 调用 Swift           │ ⭐⭐⭐ │
│ GCD Bridge             │ DispatchQueue bridge               │ ⭐⭐   │
│ CF/NS 桥接             │ CoreFoundation ↔ Foundation       │ ⭐     │
└────────────────────────┴───────────────────────────────────┴───────┘

混编要求：
┌───────────────────────────────────────────────────────────┐
│ • Swift 类需要继承 NSObject（才能被 OC 访问）               │
│ • Swift 方法需要 @objc 标记（默认仅继承 NSObject 的 public 方法）│
│ • OC 头文件需要在 Bridging Header 中导入                    │
│ • Swift target 需要开启 Defines Module = YES               │
│ • OC 类需要 @objc 或 @objcMembers 标记                     │
│ • Swift 枚举需要 @objc 才能用于 OC（enum 必须 @objc 才能被 OC 访问） │
│ • Swift 协议需要 @objc 才能被 OC 遵循                      │
└───────────────────────────────────────────────────────────┘
```

---

## 2. 混编编译原理

### 2.1 编译流程完整分析

```
Swift ↔ Objective-C 混编编译流程完整分析：

┌─────────────────────────────────────────────────────────────────┐
│ Swift → Objective-C 桥接流程：                                │
│                                                              │
│ 1. Swift 编译器编译 .swift 文件                              │
│ 2. 生成 Swift Module Info（模块信息）                         │
│ 3. 生成 *-Swift.h（桥接头文件）                              │
│    • 包含所有 @objc 标记的类型/方法/属性                      │
│    • 不包含 private 成员                                     │
│    • 不包含未标记 @objc 的 public 成员                       │
│ 4. OC 代码 #import "Project-Swift.h" 访问 Swift 类型          │
│                                                              │
│ 编译细节：                                                   │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ *-Swift.h 生成规则：                                     │ │
│ │ • 包含 @objc 标注的类型（class, protocol, enum, extension）│ │
│ │ • 包含继承自 NSObject 的 public 类（自动 @objc）          │ │
│ │ • 包含 @objc 标注的 struct（部分支持）                    │ │
│ │ • 包含 @objc 标注的函数和全局变量                         │ │
│ │ • 不包含：                                             │ │
│ │   • 未标记 @objc 的 public 成员                          │ │
│ │   • private 成员                                       │ │
│ │   • 泛型类型（需要手动声明具体类型）                      │ │
│ │   • 内部类型                                           │ │
│ │ • @objcMembers 自动标记所有后续成员为 @objc               │ │
│ │ • @objc 需要继承 NSObject（类）或遵循 @objc 协议          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Objective-C → Swift 桥接流程：                              │
│                                                              │
│ 1. Swift Compiler 编译所有 .swift 文件                       │
│ 2. 生成 Swift Module（.swiftmodule）                         │
│ 3. 生成 Product-Swift.h（自动桥接头）                        │
│    • 自动包含所有 @objc 成员                                  │
│    • 位于 DerivedData 目录下                                  │
│ 4. OC 代码自动可访问 Swift 类型                               │
│                                                              │
│ 编译配置要求：                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ • SWIFT_OBJC_BRIDGING_HEADER → Bridging Header 路径     │ │
│ │ • SWIFT_OBJC_INTERFACE_HEADER_NAME → *-Swift.h 名称     │ │
│ │ • DEFINES_MODULE → YES（必须）                           │ │
│ │ • SWIFT_COMPILATION_MODE →人头（Incremental 或人头）     │ │
│ │ • OTHER_SWIFT_FLAGS → -Xcc -fmodule-name=...             │ │
│ │ • SKIP_INSTALL → NO（确保生成模块）                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 2.2 桥接头文件完整分析

```
Bridging Header 完整机制：

┌─────────────────────────────────────────────────────────────────┐
│ Bridging Header 核心机制：                                    │
│ • 一个 Xcode target 只能有一个 Bridging Header                │
│ • 文件扩展名为 .h，名称自定义（通常 <Target>-Bridging-Header.h）│
│ • 自动包含在 Swift 编译环境中                                  │
│ • 不需要在 Swift 代码中手动导入                                │
│ • 包含的 OC 类型自动可访问                                     │
│ • 可以包含 OC 头文件、C 头文件                                │
│ • 不能包含 .m/.swift 文件                                     │
│ • 不能包含 Swift 代码                                        │
│                                                              │
│ 桥接头的完整内容示例：                                        │
│ ┌───────────────────────────────────────────────────────────┐ │
│  // Project-Bridging-Header.h                              │ │
│  #import "OCHeader1.h"                                      │ │
│  #import "OCHeader2.h"                                      │ │
│  #import <UIKit/UIKit.h>                                    │ │
│  #import "ThirdPartyHeader.h"                               │ │
│  // C 头文件                                                │ │
│  #import "c_utility.h"                                      │ │
│  // 前置声明                                                │ │
│  @class MyClass;                                             │ │
│  // 类型别名                                                │ │
│  typedef NS_ENUM(NSInteger, CustomEnum) { ... };            │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ Bridging Header 的生成与管理：                               │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  • 手动创建：Xcode 会自动提示创建                         │ │
│ │  • Build Settings → Objective-C Bridging Header          │ │
│ │  • Xcode 12+ 使用 Swift Package Manager 时无需桥接头     │ │
│ │  • 注意：桥接头只能用于 Swift 项目，不能用于纯 OC 项目     │ │
│ │  • 桥接头不能用于 Swift Package                            │ │
│ └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 3. 类型映射完整分析

### 3.1 完整类型映射表

```
Swift ↔ Objective-C 类型映射完整分析：

┌─────────────────────────────────────────────────────────────────┐
│ Swift 类型          │ Objective-C 类型          │ 桥接方式   │
├─────────────────────┼─────────────────────────┼───────────┤
│ Bool               │ BOOL                     │ 自动桥接   │
│ Int                │ NSInteger / NSInteger    │ 自动桥接   │
│ UInt               │ NSUInteger               │ 自动桥接   │
│ Int8               │ int8_t                   │ 自动桥接   │
│ Int16              │ int16_t                  │ 自动桥接   │
│ Int32              │ int32_t                  │ 自动桥接   │
│ Int64              │ int64_t                  │ 自动桥接   │
│ Float              │ CGFloat / float          │ 自动桥接   │
│ Double             │ CGFloat / double         │ 自动桥接   │
│ String             │ NSString                 │ Toll-Free │
│ String?            │ NSString? / Optional     │ 可选桥接   │
│ Character          │（无直接映射）            │ -         │
│ Array<T>           │ NSArray<T>               │ Toll-Free │
│ Array<T>?          │ NSArray<T>?              │ Toll-Free │
│ Dictionary<K,V>    │ NSDictionary<K,V>      │ Toll-Free │
│ Dictionary<K,V>?   │ NSDictionary<K,V>?     │ Toll-Free │
│ Set<T>             │ NSSet<T>                 │ Toll-Free │
│ Set<T>?            │ NSSet<T>?                │ Toll-Free │
│ Tuple              │（无直接映射）            │ -         │
│ class (NSObject)   │ NSObject 子类            │ 自动桥接   │
│ class (非 NSObject)│（需 @objc 桥接）        │ @objc     │
│ struct             │（需 @objc 桥接）        │ @objc     │
│ enum               │ NS_ENUM / NS_OPTIONS     │ @objc     │
│ protocol           │ @protocol                │ @objc     │
│ closure            │ SEL / Block              │ 桥接       │
│ (T1, T2) -> U      │（需手动包装）           │ -         │
│ Optional<T>        │ T? / id                  │ 可选桥接   │
│ Any                │ id                       │ 桥接       │
│ AnyObject          │ id                       │ 桥接       │
│ Void               │ void                     │ 自动桥接   │
│ Never              │（无映射）                │ -         │
│ data               │ NSData                   │ Toll-Free │
│ Date               │ NSDate                   │ Toll-Free │
│ URL                │ NSURL                    │ Toll-Free │
│ Data               │ NSData                   │ Toll-Free │
│ UUID               │ NSUUID                   │ Toll-Free │
│ NSRange            │ NSRange                  │ 自动桥接   │
│ CGPoint            │ CGPoint                  │ Toll-Free │
│ CGSize             │ CGSize                   │ Toll-Free │
│ CGRect             │ CGRect                   │ Toll-Free │
│ CGFloat            │ CGFloat                  │ Toll-Free │
│ NSKeyValue         │ NSKeyValueCoding         │ Toll-Free │
│ NSRange            │ NSRange                  │ 自动桥接   │
│ NSError            │ NSError                  │ Toll-Free │
│ NSIndexPath        │ NSIndexPath              │ Toll-Free │
│ NSRange            │ NSRange                  │ Toll-Free │
│ NSNotification     │ NSNotification           │ Toll-Free │
│ Selector           │ Selector / SEL           │ 桥接       │
│ Timer              │ NSTimer                  │ Toll-Free │
│ UserDefaults       │ NSUserDefaults           │ Toll-Free │
│ FileManager        │ NSFileManager            │ Toll-Free │
│ URLSession         │ NSURLSession             │ Toll-Free │
└────────────────────┴─────────────────────────┴────────────┘
```

### 3.2 桥接类型详细分析

```
桥接类型分类完整分析：

┌─────────────────────────────────────────────────────────────────┐
│ Toll-Free Bridging（免费桥接）：                                │
│ • CoreFoundation ↔ Foundation 类型自动桥接                    │
│ • 零开销转换（共享底层数据结构）                                │
│ • CFTypeRef ↔ id（桥接为任意类型）                           │
│ • CFTypeRef ↔ void *（桥接为任意指针）                       │
│ • 桥接对（成对类型）：                                       │
│   • CFArray ↔ NSArray                                          │
│   • CFDictionary ↔ NSDictionary                               │
│   • CFString ↔ NSString                                       │
│   • CFData ↔ NSData                                           │
│   • CFDate ↔ NSDate                                           │
│   • CFURL ↔ NSURL                                             │
│   • CFUUID ↔ NSUUID                                           │
│   • CFNumber ↔ NSNumber                                       │
│   • CFRuntimeObject ↔ NSObject（运行时对象）                   │
│                                                              │
│ Toll-Free 桥接的底层原理：                                    │
│ • CFType 和 NS 类型共享相同的 isa 指针                        │
│ • CF 类型的内存布局与 NS 类型完全兼容                           │
│ • CFStringRef 可以直接传给 NSString* 参数                      │
│ • 不需要调用桥接函数（零开销）                                  │
│ • 桥接是类型双写（同一块内存有两个视角）                        │
│                                                              │
│ 可选桥接（Optional Bridging）：                               │
│ • Swift Optional ↔ Objective-C nil                            │
│ • String? ↔ NSString?（可选桥接）                           │
│ • Array? ↔ NSArray?（可选桥接）                            │
│ • Dictionary? ↔ NSDictionary?（可选桥接）                    │
│ • 桥接为 nil 时转换为 nil（Objective-C 中的 null）            │
│                                                              │
│ @objc 桥接（ObjC 桥接）：                                     │
│ • Swift struct/class/enum/protocol 需要 @objc 标记            │
│ • @objc 类型桥接为 Objective-C 类型                           │
│ • @objc enum 需要指定 rawValue 类型                           │
│ • @objc protocol 需要所有方法都是可选/必须                     │
│ • @objc 类型的内存布局与 Objective-C 兼容                     │
│                                                              │
│ 非桥接类型：                                                  │
│ • Swift tuple ↔ Objective-C（无直接映射）                    │
│ • Swift protocol（非 @objc）↔ Objective-C（无直接映射）      │
│ • Swift enum（非 @objc）↔ Objective-C（无直接映射）          │
│ • Swift Result ↔ Objective-C（无直接映射）                  │
│ • Swift Never ↔ Objective-C（无直接映射）                    │
└────────────────────────────────────────────────────────────┘
```

### 3.3 类型映射完整代码示例

```swift
// === 类型映射示例 ===

// 1. String ↔ NSString
import Foundation

let swiftString: String = "Hello"
let nsString: NSString = swiftString as NSString  // Toll-Free
let ocString: NSString = "Hello"
let swiftString2: String = ocString as String

// 2. Array ↔ NSArray
let swiftArray: [String] = ["a", "b", "c"]
let nsArray: NSArray = swiftArray as NSArray  // Toll-Free
let ocArray: NSArray = ["a", "b", "c"]
let swiftArray2: [String] = (ocArray as! [String])

// 3. Dictionary ↔ NSDictionary
let swiftDict: [String: Int] = ["a": 1, "b": 2]
let nsDict: NSDictionary = swiftDict as NSDictionary  // Toll-Free
let ocDict: NSDictionary = ["a": 1, "b": 2] as NSDictionary
let swiftDict2: [String: Int] = (ocDict as! [String: Int])

// 4. Data ↔ NSData
let swiftData: Data = "Hello".data(using: .utf8)!
let nsData: NSData = swiftData as NSData  // Toll-Free
let swiftData2: Data = nsData as Data

// 5. URL ↔ NSURL
let swiftURL: URL = URL(string: "https://example.com")!
let nsURL: NSURL = swiftURL as NSURL  // Toll-Free
let swiftURL2: URL = nsURL as URL

// 6. Date ↔ NSDate
let swiftDate: Date = Date()
let nsDate: NSDate = swiftDate as NSDate  // Toll-Free
let swiftDate2: Date = nsDate as Date

// 7. UUID ↔ NSUUID
let swiftUUID: UUID = UUID()
let nsUUID: NSUUID = swiftUUID as NSUUID  // Toll-Free
let swiftUUID2: UUID = nsUUID as UUID

// 8. Optional 桥接
let optString: String? = "test"
let nsOptString: NSString? = optString  // String? → NSString?

let nilString: String? = nil
let nsNilString: NSString? = nilString  // nil → nil

// 9. 桥接类型转换
let anyValue: Any = "Hello"
let nsAny: NSObject = anyValue as! NSObject  // Any → NSObject

// 10. 桥接类型安全
let maybeString: String? = optString as String?  // 可选桥接
if let safeString = maybeString {
    let nsString = safeString as NSString  // String → NSString
}

// 11. CF 类型桥接
let cfString = CFStringCreateWithBytes(nil, "test" as! [CChar], strlen("test"), .utf8, false)
let nsString = cfString as! CFString
let swiftString = nsString as String
```

---

## 4. Toll-Free Bridging 深度解析

### 4.1 Toll-Free Bridging 完整深度分析

```
Toll-Free Bridging 完整深度分析：

┌─────────────────────────────────────────────────────────────────┐
│                                                              │
│  Toll-Free Bridging 的核心原理：                              │
│ • 桥接对（CF/NS 类型对）共享完全相同的内存布局                 │
│ • 桥接是类型双写（同一块内存有两个不同的类型视图）              │
│ • 零开销转换（不需要复制数据）                                │
│ • 桥接对可以互相传递（不改变内存布局）                        │
│ • 桥接对由 Apple 维护（CoreFoundation ↔ Foundation）         │
│                                                              │
│ Toll-Free 桥接的完整列表：                                    │
│ ┌───────────────────────────────────────────────────────────┐ │
│ 桥接对                        │ 说明                        │
│ ├───────────────────────────────────────────────────────────┤ │
│ CFBoolean ↔ NSBoolean         │ 布尔类型                    │
│ CFArray ↔ NSArray             │ 数组                        │
│ CFBridgingRetain → id         │ CF → id 转换                │
│ CFBridgingRelease → CFTypeRef  │ id → CF 转换              │
│ CFData ↔ NSData               │ 数据                        │
│ CFDate ↔ NSDate               │ 日期                        │
│ CFDelayedLoggingContext ↔（无）│ 无桥接                     │
│ CFDictionary ↔ NSDictionary   │ 字典                        │
│ CFLocale ↔ NSLocale           │ 区域                        │
│ CFNumber ↔ NSNumber           │ 数字                        │
│ CFPreferences ↔ NSUserDefaults│ 偏好设置                    │
│ CFPropertyList ↔ NSArray/NSDictionary │ 属性列表            │
│ CFReadStream ↔ NSInputStream  │ 输入流                      │
│ CFWriteStream ↔ NSOutputStream│ 输出流                      │
│ CFRunLoop ↔ NSRunLoop         │ 运行循环                    │
│ CFSocket ↔ NSSocket           │ Socket                      │
│ CFStream ↔ NSStream           │ 流                          │
│ CFTimeZone ↔ NSTimeZone       │ 时区                        │
│ CFTimeZoneNames ↔（无）       │ 无桥接                     │
│ CFUUID ↔ NSUUID               │ UUID                        │
│ CFNotificationCenter ↔ NSNotificationCenter │ 通知中心      │
│ CFRetain → CFTypeRef          │ 桥接引用计数                 │
│ CFRelease → CFTypeRef         │ 桥接释放                     │
│ CFBridgingRetain → id         │ CF → id（retain）          │
│ CFBridgingRelease → CFTypeRef │ id → CF（release）          │
│ CFMakeCollectable → id        │ CF → id（collectable）     │
│ BFRetainCollectable → CFTypeRef│ id → CF（collectable）    │
│ CFError ↔ NSError             │ 错误                        │
│ CFMachPort ↔ NSMachPort       │ Mach Port                   │
│ CFMessagePort ↔ NSMessagePort  │ Message Port               │
│ CFSocketContext ↔（无）       │ 无桥接                     │
│ CFRunLoopSource ↔ NSRunLoop    │ 运行循环源                  │
│ CFRunLoopTimer ↔ NSTimer       │ 运行循环定时器              │
│ CFRUNLOOP_OBSERVER_CALLBACK   │ 无桥接                     │
│ CFBridgingRetain → CFTypeRef  │ id → CF（手动 retain）    │
│ CFBridgingRelease → id        │ CF → id（手动 release）   │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ Toll-Free 桥接的底层实现：                                    │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ CFType 的内存布局：                                        │ │
│ │  • isa 指针（指向元类）                                    │ │
│ │  • 数据区（具体类型的数据）                                │ │
│ │ CFString 与 NSString 内存布局：                            │ │
│ │  • 完全相同（共享同一个 isa）                              │ │
│ │  • 同一块内存有两个类型视图                                 │ │
│ │  • 桥接是类型双写（同一内存，两种类型）                    │ │
│ │  • CFStringRef → NSString*：直接类型转换                  │ │
│ │  • NSString* → CFStringRef：直接类型转换                   │ │
│ │  • 不需要调用任何桥接函数（零开销）                       │ │
│ │                                                          │ │
│ │ 桥接规则：                                               │ │
│ │  • CFType ↔ id：CFMakeCollectable/CFAutorelease            │ │
│ │  • CFTypeRef ↔ void *：CFAutorelease                     │ │
│ │  • id → CFTypeRef：CFBridgingRelease                     │ │
│ │  • CFType → id：CFBridgingRetain                          │ │
│ │  • 桥结对：直接类型转换（CFStringRef → NSString*）         │ │
│ └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Toll-Free Bridging 完整示例

```swift
// === Toll-Free Bridging 完整示例 ===

// 1. CFString ↔ NSString（零开销）
let cfString: CFString = "Hello World" as CFString
let nsString: NSString = cfString as NSString  // 零开销
let swiftString: String = nsString as String

// 2. CFData ↔ NSData
let cfData: CFData = "test" as CFData
let nsData: NSData = cfData as NSData  // 零开销
let swiftData: Data = nsData as Data

// 3. CFArray ↔ NSArray
let cfArray: CFArray = [1, 2, 3] as CFArray
let nsArray: NSArray = cfArray as NSArray  // 零开销

// 4. CFDictionary ↔ NSDictionary
let cfDict: CFDictionary = ["a": 1, "b": 2] as CFDictionary
let nsDict: NSDictionary = cfDict as NSDictionary  // 零开销

// 5. CFURL ↔ NSURL
let cfURL: CFURL = URL(string: "https://example.com")! as CFURL
let nsURL: NSURL = cfURL as NSURL  // 零开销

// 6. CFDate ↔ NSDate
let cfDate: CFDate = Date() as CFDate
let nsDate: NSDate = cfDate as NSDate  // 零开销

// 7. CFUUID ↔ NSUUID
let cfUUID: CFUUID = UUID() as CFUUID
let nsUUID: NSUUID = cfUUID as NSUUID  // 零开销

// 8. CFBridgingRetain / CFBridgingRelease
var ref: CFType?
// CFBridgingRetain 将 id 转换为 CFTypeRef（retain 计数 +1）
ref = CFBridgingRetain(someObject) as CFTypeRef
// CFBridgingRelease 将 CFTypeRef 转换为 id（release 计数 -1）
let obj = CFBridgingRelease(ref)

// 9. CFRetain / CFRelease
var ret: CFString? = "test" as CFTypeRef
CFRetain(ret)  // 手动 retain
CFRelease(ret)  // 手动 release

// 10. CFMakeCollectable / CFAutorelease
let uncollected = CFMakeCollectable(CFBridgingRelease(cfString))

// 11. CFError ↔ NSError
var nsError: NSError?
let cfError: CFError = NSError(domain: "test", code: 1, userInfo: nil) as CFError
nsError = cfError as NSError  // Toll-Free

// 12. CFRunLoop ↔ NSRunLoop
let cfRunLoop = CFRunLoopGetMain()
let nsRunLoop = cfRunLoop as NSRunLoop  // Toll-Free

// 13. CFLocale ↔ NSLocale
let cfLocale = CFLocaleCopyCurrent()
let nsLocale = cfLocale as! NSLocale

// 14. CFTimeZone ↔ NSTimeZone
let cfTimeZone = CFCopyTimeZone(CFTimeZoneCopySystem())
let nsTimeZone = cfTimeZone as! NSTimeZone

// 15. CFNotificationCenter ↔ NSNotificationCenter
let cfCenter = CFNotificationCenterGetDarwinNotifyCenter()
let nsCenter = cfCenter as NSNotificationCenter  // Toll-Free

// 16. CFReadStream ↔ NSInputStream
let cfStream = CFReadStreamCreateWithBytes(nil, "test" as! [CChar], 4, .none)
let nsStream = cfStream as! NSInputStream  // Toll-Free

// 17. CFPropertyList ↔ NSArray/NSDictionary
let cfProperty: CFPropertyList = ["name": "test", "age": 25]
let nsProperty: Any = cfProperty as Any  // Toll-Free
```

---

## 5. selector 机制完整分析

### 5.1 selector 完整深度分析

```
selector 机制完整深度分析：

┌─────────────────────────────────────────────────────────────────┐
│                                                              │
│  selector 是 Objective-C 运行时的核心概念：                   │
│ • SEL 是方法选择的字符串标识符                                │
│ • @selector 创建方法选择器                                    │
│ • selector 在运行时解析为方法指针                            │
│ • selector 可以用于消息转发、KVO、通知等场景                  │
│                                                              │
│ selector 的核心机制：                                       │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  // selector 创建                                              │ │
│ │  let selector = #selector(MyClass.doSomething)              │ │
│ │  let selector2 = #selector(MyClass.doSomething(_:))         │ │
│ │  let selector3 = #selector(MyVC.buttonTapped(sender:))      │ │
│ │                                                            │ │
│ │  // 方法签名匹配                                                │ │
│ │  func doSomething() { ... }                               │ │
│ │  func doSomething(_ value: Int) { ... }                   │ │
│ │  func doSomething(with name: String) { ... }              │ │
│ │  func doSomething(name: String) { ... }                   │ │
│ │                                                            │ │
│ │  // selector 匹配规则                                           │ │
│ │  • selector 的名称必须与 OC 方法签名完全匹配                  │ │
│ │  • Swift 方法名到 OC 方法名的映射                             │ │
│ │  • Swift 中参数名在 selector 中需要显式指定                   │ │
│ │  • @objc 标记的方法才能使用 selector                         │ │
│ │  • 方法必须在运行时可用（@objc 或继承 NSObject）              │ │
│ │                                                            │ │
│ │  // selector 的内存布局                                           │ │
│ │  ┌────────────────────────────────┐                       │ │
│ │  │ SEL (Selector)                    │                       │ │
│ │  │ ┌─────────────────────────────┐  │                       │ │
│ │  │ │ 字符串指针（方法名）            │  │                       │ │
│ │  │ │ (如 "doSomething:")            │  │                       │ │
│ │  │ └─────────────────────────────┘  │                       │ │
│ │  │ Total: 8 bytes (指针)              │                       │ │
│ │  └──────────────────────────────────┘                       │ │
│ │                                                            │ │
│ │  // selector 的缓存机制                                         │ │
│ │  • selector 创建是 O(1) 操作（从字符串哈希表查找）              │ │
│ │  • 编译器缓存常用 selector                                     │ │
│ │  • 运行时缓存 selector 的字符串                              │ │
│ │  • selector 可以安全比较（== 运算符）                         │ │
│ │  • selector 可以哈希存储（在字典/集合中）                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                              │
│ selector 的完整使用场景：                                       │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  • 通知中心 addObserver:selector:name:object:             │ │
│ │  • KVO observeValue(forKeyPath:of:change:context:)      │ │
│ │  • 按钮 addTarget:action:forControlEvents:                │ │
│ │  • 菜单 menuItem:menu:highlighted:                        │ │
│ │  • 响应链 canPerformAction:withSender:                    │ │
│ │  • Runtime 动态方法调用                                   │ │
│ │  • 代理方法调用                                             │ │
│ │  • 定时器 NSTimer scheduledTimerWithTarget:selector:...   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 5.2 selector 完整代码示例

```swift
// === selector 完整示例 ===

// 1. 创建 selector
let selector1 = #selector(MyClass.doSomething)
let selector2 = #selector(MyClass.doSomething(_:))
let selector3 = #selector(MyVC.buttonTapped(sender:))
let selector4 = #selector(NSString.uppercased) as Selector

// 2. selector 比较
if selector1 == selector2 {
    // selector 比较的是方法名，不是方法本身
}

// 3. selector 转字符串
let selectorName = sel_getName(selector1)  // C 函数

// 4. selector 作为参数传递
func performAction(_ selector: Selector, on target: Any) {
    if target.responds(to: selector) {
        (target as AnyObject).perform(selector)
    }
}

// 5. selector 与 KVO
self.addObserver(forKeyPath: "name", options: .new) { [weak self] (keyPath, object, change, context) in
    self?.handleKeyValueChange(keyPath, object, change)
}

// 6. selector 与通知
NotificationCenter.default.addObserver(
    self,
    selector: #selector(handleNotification(_:)),
    name: .MyNotification,
    object: nil
)

@objc func handleNotification(_ notification: Notification) {
    print(notification)
}

// 7. selector 与按钮
button.addTarget(self, action: #selector(buttonTapped(_:)), for: .touchUpInside)

@objc func buttonTapped(_ sender: UIButton) {
    print("Button tapped")
}

// 8. selector 与定时器
Timer.scheduledTimer(
    timeInterval: 1.0,
    target: self,
    selector: #selector(timerFired),
    userInfo: nil,
    repeats: true
)

@objc func timerFired() {
    print("Timer fired")
}

// 9. selector 与 Runtime
if let method = class_getInstanceMethod(MyClass.self, #selector(MyClass.doSomething)) {
    let imp = method_getImplementation(method)
    // imp 是方法实现的函数指针
}

// 10. selector 与响应链
if canPerformAction(#selector(copy(_:)), withSender: self) {
    // 可以执行 copy 操作
}
```

---

## 6. @objc 与 @objcMembers 完整解析

### 6.1 @objc 完整深度分析

```
@objc 标记完整深度分析：

┌─────────────────────────────────────────────────────────────────┐
│                                                              │
│ @objc 的作用：                                               │
│ • 将 Swift 类型/成员暴露给 Objective-C 运行时                 │
│ • 使 Swift 方法可被 @selector 调用                            │
│ • 使 Swift 类型可被 OC 代码访问                               │
│ • 影响编译器生成的符号名                                      │
│                                                              │
│ @objc 的完整使用要求：                                        │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ • 类必须继承 NSObject 或遵循 @objc 协议                   │ │
│ │ • 方法必须是 public 或 @objc 标记                         │ │
│ │ • 属性必须是 @objc 标记（用于 OC 访问）                    │ │
│ │ • 枚举必须有 @objc 和 rawValue 类型                        │ │
│ │ • 协议必须是 @objc 标记（遵循 @objc 协议）               │ │
│ │ • 关联类型不能是泛型类型                                 │ │
│ │ • 方法不能是泛型方法                                     │ │
│ │ • 类型必须在 Swift 模块中定义                             │ │
│ │ • 类型名不能在 Objective-C 中冲突                          │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ @objcMembers 的作用：                                        │
│ • 自动将后续所有成员标记为 @objc                              │
│ • 简化代码（不需要每个成员都加 @objc）                        │
│ • 只对 @objcMembers 之后的成员生效                            │
│ • 不影响 @objcMembers 之前的成员                              │
│ • 不能与 @nonobjc 混合使用                                    │
│                                                              │
│ @objcMembers 的完整示例：                                    │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  @objcMembers                                             │ │
│ │  class MyClass: NSObject {                                │ │
│ │      var name: String = ""                               │ │
│ │      var age: Int = 0                                    │ │
│ │      func doSomething() { ... }                          │ │
│ │      @objc func doSomethingElse() { ... }               │ │
│ │      @nonobjc func privateMethod() { ... }              │ │
│ │  }                                                       │ │
│ │                                                           │ │
│ │  // 注意：@objcMembers 不影响：                           │ │
│ │  • 继承的类（superclass）                                │ │
│ │  • 外部类型（extension）                                 │ │
│ │  • @objcMembers 之前的成员                               │ │
│ │  • private 成员                                          │ │
│ │  • init 初始化器（需要手动 @objc）                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ @objc 的符号名规则：                                        │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Swift 方法名 → Objective-C 方法名映射规则：              │ │
│ │ • func doSomething() → doSomething                      │ │
│ │ • func doSomething(_ x: Int) → doSomething:             │ │
│ │ • func doSomething(x: Int) → doSomethingX:              │ │
│ │ • func doSomething(y: Int, z: Int) → doSomethingY:z:    │ │
│ │ • func doSomething(with name: String) → doSomethingWithName: │
│ │ • @objc(customName) → customName                         │ │
│ │ • 命名冲突时 Xcode 自动添加下划线后缀                     │ │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ @objc 的内存布局：                                           │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ • @objc 标记的类：                                          │ │
│ │   • 在运行时中注册                                          │ │
│ │   • 方法选择器可被动态查找                                  │ │
│ │   • 属性可被 KVC/KVO 访问                                  │ │
│ │ • @objc 标记的方法：                                        │ │
│ │   • 生成 Objective-C 符号名                                │ │
│ │   • 方法选择器可用                                           │ │
│ │ • @objc 标记的属性：                                        │ │
│ │   • 生成 getter/setter                                     │ │
│ │   • KVC/KVO 访问                                           │ │
│ └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 7. 混编协议深度分析

### 7.1 协议混编完整分析

```
Swift ↔ Objective-C 协议混编完整深度分析：

┌─────────────────────────────────────────────────────────────────┐
│ 协议混编的方式：                                              │
│ • @objc protocol — 可被 OC 遵循                              │
│ • 非 @objc protocol — 只能 Swift 使用                         │
│ • 混合协议（部分 @objc，部分非）                             │
│ • 协议扩展（Swift 特有）                                     │
│ • 协议关联类型（Swift 特有）                                 │
│                                                              │
│ @objc Protocol 的限制：                                      │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ • 不能有关联类型（associatedtype）                         │ │
│ │ • 不能有默认实现（protocol extension 默认实现）           │ │
│ │ • 所有方法必须是可选/必须（无默认参数）                   │ │
│ │ • 不能有属性默认值                                        │ │
│ │ • 不能有泛型参数                                          │ │
│ │ • 不能遵循非 @objc 协议                                   │ │
│ │ • 不能继承非 @objc 协议                                   │ │
│ │ • 必须有 @objc 标记                                       │ │
│ │ • 方法签名必须与 OC 兼容                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ @objc Protocol 的完整使用：                                  │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  @objc protocol MyProtocol {                              │ │
│ │      var name: String { get set }                        │ │
│ │      func doSomething(_ value: Int)                      │ │
│ │      func doSomethingElse() -> String                    │ │
│ │      @objc optional func optionalMethod()                │ │
│ │  }                                                       │ │
│ │                                                           │ │
│ │  // OC 遵循                                                │ │
│ │  @interface MyOCClass () <MyProtocol>                    │ │
│ │  @end                                                     │ │
│ │                                                           │ │
│ │  @implementation MyOCClass                               │ │
│ │  - (NSString *)name { return @"test"; }                 │ │
│ │  - (void)doSomething:(NSInteger)value { ... }           │ │
│ │  - (NSString *)doSomethingElse { return @"result"; }    │ │
│ │  - (void)optionalMethod { ... }                         │ │
│ │  @end                                                     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ 协议混编的性能分析：                                         │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ • @objc 协议：Witness Table（非 @objc）vs 虚表（@objc）  │ │
│ │ • @objc 协议：Objective-C 运行时查找（有开销）            │ │
│ │ • Witness Table：零运行时开销（静态分发）                 │ │
│ │ • @objc 协议桥接：有额外开销（符号名查找）                │ │
│ │ • 协议扩展方法：非 @objc 协议可使用，@objc 不能使用       │ │
│ └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 8. 混编类深度分析

### 8.1 类混编完整分析

```
Swift ↔ Objective-C 类混编完整深度分析：

┌─────────────────────────────────────────────────────────────────┐
│ Swift 类 ↔ Objective-C 类混编机制：                          │
│                                                              │
│ 混编类的要求：                                              │
│ • Swift 类必须继承 NSObject（才能被 OC 访问）                 │
│ • Swift 类的方法必须 @objc 标记（或继承 NSObject 的 public 方法）│
│ • Swift 类的属性必须 @objc 标记（用于 OC 访问）              │
│ • Swift 类的初始化器必须 @objc 标记                          │
│ • OC 类可以继承 Swift 类（Swift 类需继承 NSObject）          │
│ • OC 类可以遵循 Swift 协议（协议需 @objc）                  │
│                                                              │
│ Swift 类继承 NSObject 的完整示例：                           │
│ ┌───────────────────────────────────────────────────────────┐ │
│  @objcMembers                                              │ │
│  class MySwiftClass: NSObject {                            │ │
│      var name: String = ""                                │ │
│      var age: Int = 0                                     │ │
│                                                             │ │
│      override init() {                                     │ │
│          super.init()                                       │ │
│      }                                                     │ │
│                                                             │ │
│      func doSomething(_ value: Int) {                     │ │
│          print("doSomething: \(value)")                    │ │
│      }                                                     │ │
│                                                             │ │
│      func getSummary() -> String {                        │ │
│          return "\(name) is \(age) years old"              │ │
│      }                                                     │ │
│  }                                                         │ │
│                                                             │ │
│  // OC 访问 Swift 类                                       │ │
│  MySwiftClass *swiftClass = [[MySwiftClass alloc] init];  │ │
│  swiftClass.name = @"John";                                │ │
│  swiftClass.age = 25;                                      │ │
│  [swiftClass doSomething:42];                              │ │
│  NSLog(@"%@", [swiftClass getSummary]);                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Swift 类 ↔ OC 类混编的性能分析：                            │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ 操作           │ 性能     │ 说明                         │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ 类创建          │ O(1)     │ 直接 alloc/init            │ │
│ │ 类型转换        │ O(n)     │ runtime 查找               │ │
│ │ KVC/KVO         │ O(n)     │ 属性查找 + 动态分发        │ │
│ │ selector 调用   │ O(1)     │ 方法查找（缓存）           │ │
│ │ Witness Table  │ O(1)     │ Witness Table（非 @objc）  │ │
│ │ 协议遵循        │ O(n)     │ 协议一致性检查              │ │
│ │ Toll-Free      │ O(0)     │ 类型双写                   │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 9. 混编内存管理

### 9.1 混编内存管理完整分析

```
Swift ↔ Objective-C 混编内存管理完整分析：

┌─────────────────────────────────────────────────────────────────┐
│                                                              │
│ 混编内存管理的核心机制：                                      │
│ • Swift ARC 管理 Swift 类型                                   │
│ • Objective-C ARC 管理 Objective-C 类型                       │
│ • 混编类型使用 Objective-C ARC                                │
│ • 桥接类型的内存管理遵循桥接规则                              │
│ • Toll-Free 类型共享内存（不需要额外管理）                   │
│                                                              │
│ 混编内存管理的规则：                                          │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ • Swift class 继承 NSObject：使用 Objective-C ARC          │ │
│ │ • Swift struct/enum：使用 Swift ARC（值类型，自动管理）   │ │
│ │ • @objc enum：使用 Swift ARC（原始值是 Swift 类型）       │ │
│ │ • Toll-Free 类型：零开销共享（不需要额外内存管理）          │ │
│ │ • CFTypeRef ↔ id：使用桥接规则                           │ │
│ │ • 混编类型不能循环引用（需要 weak）                       │ │
│ │ • @objc 属性需要明确的内存语义                            │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ 混编内存管理的完整示例：                                      │
│ ┌───────────────────────────────────────────────────────────┐ │
│  // Swift class 继承 NSObject（使用 Objective-C ARC）       │ │
│  @objcMembers                                               │ │
│  class MyClass: NSObject {                                  │ │
│      var name: String = ""                                 │ │
│      var delegate: MyDelegate? = nil                       │ │
│                                                             │ │
│      deinit {                                               │ │
│          print("MyClass deinit")                           │ │
│      }                                                     │ │
│  }                                                         │ │
│                                                             │ │
│  // OC 类遵循 Swift 协议                                     │ │
│  @interface MyOCClass () <MyDelegate>                      │ │
│  @end                                                     │ │
│  @implementation MyOCClass                                 │ │
│  - (void)doSomething { ... }                              │ │
│  @end                                                     │ │
│                                                             │ │
│  // 循环引用处理                                             │ │
│  class Parent: NSObject {                                  │ │
│      weak var child: Child? = nil                          │ │
│      var strongRef: Child? = nil                           │ │
│  }                                                         │ │
│                                                             │ │
│  // Toll-Free 类型共享内存                                   │ │
│  let swiftString = "test"                                  │ │
│  let nsString = swiftString as NSString  // 零开销          │ │
│  let cfString = nsString as CFString  // 零开销             │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 10. 混编常见问题与解决方案

### 10.1 混编常见问题完整分析

```
Swift ↔ Objective-C 混编常见问题完整分析：

┌─────────────────────────────────────────────────────────────────┐
│ 问题                    │ 原因                              │ 解决方案                    │
├────────────────────────┼───────────────────────────────────┼───────────────────────┤
│ @objc 标记缺失         │ Swift 类型未暴露给 OC               │ 添加 @objc 或 @objcMembers │
│ 桥接失败                │ 类型不兼容                         │ 使用桥接转换（as）           │
│ 方法找不到              │ 方法签名不匹配                     │ 检查 @objc 标记和签名         │
│ 协议混编失败            │ 协议中有泛型/关联类型                │ 使用 @objc 协议              │
│ Toll-Free 桥接失败      │ 类型不是桥结对                      │ 使用桥接转换（as CFString）  │
│ 混编性能问题            │ 大量桥接调用                        │ 减少桥接，使用纯 Swift        │
│ 初始化器混编失败        │ init 未标记 @objc                   │ 添加 @objc 到 init           │
│ 枚举混编失败            │ 枚举未指定 rawValue 类型            │ 指定 Int rawValue            │
│ Selector 调用失败       │ 方法未暴露给 OC                     │ 添加 @objc 标记              │
│ KVO 混编失败            │ 属性未标记 @objc                    │ 添加 @objc 到属性             │
│ 类名冲突                │ Swift 类名与 OC 类名冲突             │ 使用 @objc 重命名            │
│ 泛型混编失败            │ OC 不支持泛型                       │ 使用具体类型替代泛型           │
│ 闭包混编失败            │ OC 不支持闭包                       │ 使用 Block/SEL 替代          │
│ 字符串混编              │ 字符串桥接问题                      │ 使用 as NSString/CFString    │
│ 数组混编                │ 数组桥接问题                        │ 使用 NSArray/CFArray         │
│ 字典混编                │ 字典桥接问题                        │ 使用 NSDictionary/CFDict     │
│ 可选值混编              │ Optional 桥接问题                   │ 使用 nil 检查                │
│ 内存泄漏                │ 循环引用                            │ 使用 weak/unowned            │
│ 线程安全                │ 混编类型线程安全                     │ 使用 DispatchQueue            │
│ 性能开销                │ 桥接开销                            │ 减少桥接，优化桥接次数        │
│ 符号冲突                │ 符号名冲突                          │ 使用 @objc 重命名            │
│ ABI 兼容性              │ Swift ABI 不稳定                    │ 使用 @objc 保证兼容性         │
│ 桥接头生成失败          │ Build Settings 配置问题             │ 检查 DEFINES_MODULE = YES    │
│ Swift 枚举被桥接失败    │ 未指定 Int rawValue                 │ 指定 Int rawValue            │
│ 桥接后类型丢失            │ 桥接类型不是桥结对                  │ 使用桥接函数                 │
│ 混编方法不执行          │ 方法未正确暴露                      │ 检查 @objc 标记              │
│ KVC/KVO 混编失败        │ 属性名不一致                        │ 确保属性名与 KVC/KVO 一致    │
│ Runtime 混编失败        │ 方法名不匹配                        │ 检查 selector 和 SEL         │
│ 桥接类型内存管理        │ Toll-Free 共享内存                  │ 遵循内存管理规则             │
│ 混编协议方法不实现       │ 协议方法缺失                        │ 实现所有协议方法              │
└────────────────────────┴───────────────────────────────────┴───────────────────────┘
```

---

## 11. 混编性能分析

### 11.1 混编性能完整分析

```
Swift ↔ Objective-C 混编性能完整分析：

┌─────────────────────────────────────────────────────────────────┐
│ 混编性能影响：                                                      │
│ • 桥接开销：Toll-Free 桥接零开销，其他桥接有开销               │
│ • 类型转换开销：as/bridge 转换有成本                             │
│ • 运行时查找：Objective-C 运行时查找有开销                       │
│ • KVC/KVO：动态属性访问有开销                                   │
│ • selector 查找：方法选择器查找有开销                           │
│ • 桥接类型内存管理：Toll-Free 共享，其他需要额外管理              │
│                                                              │
│ 性能对比分析：                                                  │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ 操作           │ Swift 原生  │ 混编（OC）   │ 影响    │
│ ├───────────────────────────────────────────────────────────┤ │
│ │ 类型创建        │ O(1)       │ O(1)         │ 无变化   │
│ │ 类型转换        │ O(0)       │ O(n)         │ 有开销   │
│ │ 方法调用        │ Witness   │ SEL 查找      │ 有开销   │
│ │ 属性访问        │ O(1)       │ KVC          │ 有开销   │
│ │ 协议调用        │ Witness   │ SEL 查找      │ 有开销   │
│ │ KVO 监听        │ N/A        │ KVO          │ 有开销   │
│ │ Toll-Free      │ O(0)       │ O(0)         │ 无开销   │
│ │ 内存管理        │ ARC        │ ARC + 桥接    │ 有开销   │
│ │ 运行时查找      │ 编译期     │ 运行时         │ 有开销   │
│ │ Selector 创建   │ N/A        │ O(1)         │ 无开销   │
│ │ KVC 获取        │ O(1)       │ O(n)         │ 有开销   │
│ │ 桥接转换        │ O(0)       │ O(0)         │ 零开销   │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ 混编性能优化建议：                                            │
│ • 减少桥接调用（缓存桥接结果）                                │
│ • 使用 Toll-Free 桥接（零开销）                              │
│ • 减少 KVC/KVO 使用（直接方法调用更快）                       │
│ • 减少 selector 查找（缓存方法指针）                         │
│ • 减少 Runtime 调用（使用 Swift 原生替代）                   │
│ • 使用 @objcMembers 减少 @objc 标记次数                      │
│ • 优先使用 Swift 原生 API                                    │
│ • 避免在热路径中使用桥接                                      │
└────────────────────────────────────────────────────────────┘
```

---

## 12. Swift ↔ Objective-C 完整对比表

### 12.1 Swift vs Objective-C 核心对比

```
Swift vs Objective-C 完整对比：

┌─────────────────────────────────────────────────────────────────────┐
│ 特性            │ Swift                       │ Objective-C                    │
├─────────────────────────────────────────────────────────────────────┤
│ 类型系统        │ 静态类型，编译期检查          │ 动态类型，运行时检查             │
│ 空安全          │ Optional 系统（编译期）        │ nil（运行时）                  │
│ 内存管理        │ ARC（编译期插入）             │ ARC（编译期插入）              │
│ 泛型            │ 完整支持（编译期特化）         │ 不支持（只有 @class 向前声明）  │
│ 协议            │ 完整（关联类型、扩展、泛型）   │ @protocol（有限支持）           │
│ 协议多态        │ Witness Table（编译期）        │ 运行时查找                      │
│ 多继承          │ 不支持（单继承）               │ 不支持（单继承）                │
│ 函数            │ 一等公民（一等类型）            │ 对象（SEL）                    │
│ 闭包            │ 完整支持（捕获变量）           │ Block（有限支持）              │
│ 模式匹配        │ 完整支持（switch/if-let）      │ 有限（switch）                  │
│ 扩展            │ 完整支持                      │ category（有限支持）            │
│ 模块系统        │ Module（.swiftmodule）         │ Header（.h）                  │
│ 跨语言          │ Swift ↔ OC（自动桥接）         │ OC ↔ Swift（自动桥接）         │
│ 跨平台          │ iOS/macOS/watchOS/tvOS        │ iOS/macOS                      │
│ 性能            │ 编译期优化（零开销）            │ 运行时开销                     │
│ 安全性          │ 编译期检查 + 运行时检查         │ 运行时检查                      │
│ 调试            │ Xcode 调试 + LLDB              │ Xcode 调试 + LLDB              │
│ 构建速度        │ 增量编译（快）                 │ 编译快（C 语言）               │
│ 代码量          │ 较少（声明式）                  │ 较多（命令式）                  │
│ 学习曲线        │ 较低（现代语法）                │ 较高（历史包袱）                │
│ 生态            │ 快速成长中                     │ 成熟庞大                        │
│ 宏系统          │ Swift 5.9+                    │ 预处理器                      │
│ 并发            │ async/await + Actor           │ GCD + OperationQueue           │
│ 元编程          │ 宏（编译期代码生成）            │ 预处理器（编译期文本替换）      │
│ 可选值          │ Optional<T>（编译期安全）       │ nil（运行时不安全）             │
│ 字符串          │ 原生 String（Unicode 感知）     │ NSString（UTF-16 编码）        │
│ 数组            │ 原生 Array（值类型）            │ NSArray（引用类型）             │
│ 字典            │ 原生 Dictionary（值类型）       │ NSDictionary（引用类型）       │
│ 集合            │ 原生 Set（值类型）              │ NSSet（引用类型）               │
│ 错误处理        │ throw/throws/try-catch        │ NSError 返回                   │
│ 枚举            │ 完整（关联值、原始值、递归）     │ enum（原始值）                 │
│ 元组            │ 完整                          │ 无                             │
│ 函数重载        │ 完整                          │ 有限                           │
│ 默认参数        │ 完整                          │ 无                             │
│ 尾随闭包        │ 完整                          │ 无                             │
│ 下标            │ 完整                          │ 有限                           │
│ 计算属性        │ 完整                          │ 属性（getter/setter）          │
│ 存储属性        │ 完整                          │ 实例变量 + 属性               │
│ 委托            │ 协议 + weak                   │ delegate 属性 + protocol       │
│ KVO             │ 使用 @objc 属性                │ 原生支持                        │
│ Notification    │ NotificationCenter             │ NSNotification               │
│ GCD             │ DispatchQueue                 │ dispatch_queue_t             │
│ Runtime         │ swift/runtime               │ objc/runtime                  │
│ Runtime 查找    │ Witness Table（编译期）        │ 运行时查找                      │
│ Runtime 检查    │ 编译期 + 运行时               │ 纯运行时                        │
│ Runtime 修改    │ 有限                          │ 完整                           │
│ Runtime 遍历    │ Mirror                       │ class_copyIvarList            │
│ Runtime 内存    │ ARC + 桥接                   │ ARC + 桥接                    │
│ Runtime 性能    │ 编译期优化                    │ 运行时开销                      │
│ Runtime 调试    │ LLDB + Swift Debug           │ LLDB + Objective-C Debug      │
└─────────────────┴───────────────────────────┴──────────────────────────┘
```

---

## 13. 面试题汇总

### 高频面试题

**Q1: Swift 与 Objective-C 混编的核心机制？**

**答**：
- Swift → OC：自动生成 *-Swift.h 桥接头
- OC → Swift：Bridging Header 注入
- Toll-Free Bridging：CoreFoundation ↔ Foundation 自动桥接
- selector：@objc 标记的方法可被 @selector 调用
- 桥接类型：String↔NSString, Array↔NSArray, Dictionary↔NSDictionary
- Swift 类需要继承 NSObject 才能被 OC 访问
- OC 类需要桥接头才能被 Swift 访问

**Q2: Toll-Free Bridging 的原理？有哪些桥接对？**

**答**：
- 核心原理：共享内存布局（同一块内存有两个类型视图）
- 零开销转换（不需要复制数据）
- 桥接对：CFString↔NSString, CFData↔NSData, CFArray↔NSArray, CFDictionary↔NSDictionary, CFURL↔NSURL, CFDate↔NSDate, CFUUID↔NSUUID, CFNumber↔NSNumber
- CFBridgingRetain/CFAvoidingRelease 用于 CFType ↔ id 转换

**Q3: selector 机制的工作原理？**

**答**：
- SEL 是方法名的字符串标识符
- @selector 创建方法选择器
- selector 在运行时解析为方法指针
- selector 可以用于消息转发、KVO、通知等场景
- selector 的符号名规则：方法名映射到 OC 方法名
- @objc 标记的方法才能使用 selector
- selector 比较的是方法名，不是方法本身

**Q4: @objc 与 @objcMembers 的区别？**

**答**：
- @objc：将 Swift 类型/成员暴露给 Objective-C
- @objcMembers：自动将后续所有成员标记为 @objc
- @objc 要求类继承 NSObject
- @objc enum 需要 Int rawValue
- @objc protocol 不能有泛型/关联类型
- @objcMembers 不影响继承的类或外部类型

**Q5: 混编内存管理的规则？**

**答**：
- Swift class 继承 NSObject：使用 Objective-C ARC
- Toll-Free 类型：共享内存（不需要额外管理）
- CFTypeRef ↔ id：使用桥接规则
- 混编类型不能循环引用（需要 weak）
- 混编协议方法不实现：KVO/KVC 访问失败
- 闭包捕获：使用 [weak self] 避免循环引用

**Q6: 混编类型映射的完整分类？**

**答**：
- Toll-Free：CF/NS 类型对自动桥接（零开销）
- 可选桥接：Swift Optional ↔ Objective-C nil
- @objc 桥接：Swift struct/class/enum/protocol 需要 @objc
- 非桥接：tuple、非 @objc protocol、Result 等无直接映射
- Swift Array ↔ NSArray（Toll-Free）
- Swift Dictionary ↔ NSDictionary（Toll-Free）
- Swift String ↔ NSString（Toll-Free）

**Q7: 混编性能优化策略？**

**答**：
- 减少桥接调用（缓存桥接结果）
- 使用 Toll-Free 桥接（零开销）
- 减少 KVC/KVO 使用
- 减少 selector 查找（缓存方法指针）
- 减少 Runtime 调用
- 使用 @objcMembers 减少 @objc 标记次数
- 优先使用 Swift 原生 API
- 避免在热路径中使用桥接

**Q8: Swift 与 Objective-C 的核心差异？**

**答**：
- 类型系统：静态 vs 动态
- 空安全：Optional 编译期 vs nil 运行时
- 泛型：完整支持 vs 不支持
- 协议：完整（关联类型、扩展、泛型）vs @protocol（有限）
- 多态：Witness Table（编译期）vs 运行时查找
- 函数：一等公民 vs 对象（SEL）
- 闭包：完整 vs Block（有限）
- 内存管理：ARC 编译期 vs ARC 运行时
- 元编程：宏（编译期代码生成）vs 预处理器（文本替换）

**Q9: 混编中常见的桥接错误？如何处理？**

**答**：
- 桥接失败：类型不兼容 → 使用桥接转换（as）
- 方法找不到：方法签名不匹配 → 检查 @objc 标记和签名
- 协议混编失败：协议中有泛型/关联类型 → 使用 @objc 协议
- Toll-Free 桥接失败：类型不是桥结对 → 使用桥接函数（as CFString）
- 字符串混编：使用 as NSString/CFString
- 数组混编：使用 NSArray/CFArray
- 字典混编：使用 NSDictionary/CFDictionary
- 可选值混编：使用 nil 检查

**Q10: Swift 6 对混编的影响？**

**答**：
- Sendable 协议影响桥接对象的线程安全
- 数据race 检测影响混编代码的线程安全
- Actor 隔离影响混编代码的并发安全
- 编译器对 @objc 的检查更严格
- 桥接类型需要符合 Sendable

---

## 14. 参考资源

- [Apple: Swift and Objective-C Interoperability](https://developer.apple.com/documentation/swift/objective-c_and_c_swift_interoperability)
- [Apple: Toll-Free Bridging](https://developer.apple.com/documentation/foundation/toll-free_bridging)
- [Apple: @objc and @objcMembers](https://developer.apple.com/documentation/swift/objcmembers)
- [Apple: Bridging Header](https://developer.apple.com/documentation/swift/imported_c_and_objective-c_apis/importing_objc_headers_into_swift)
- [Apple: selector Mechanism](https://developer.apple.com/documentation/objectivec/1418952-selector)
- [Apple: Swift ABI Stability](https://swift.org/blog/abi-stability/)
- [Apple: Swift Runtime](https://github.com/apple/swift/blob/main/docs/ABI/Stability.rst)
- [Apple: Swift Memory Management](https://github.com/apple/swift/blob/main/docs/MemorySafetyInSwift.md)
