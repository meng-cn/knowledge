# 01 - 本地存储深度

## 目录

1. [UserDefaults 深度分析](#1-userdefaults-深度分析)
2. [文件存储与 FileManager](#2-文件存储与-filemanager)
3. [Codable 全栈深度](#3-codable-全栈深度)
4. [Keychain 安全存储](#4-keychain-安全存储)
5. [缓存策略](#5-缓存策略)
6. [归档与编码](#6-归档与编码)
7. [面试考点汇总](#7-面试考点汇总)

---

## 1. UserDefaults 深度分析

```
UserDefaults 深度分析：
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  UserDefaults 的本质：                                              │
│  • 基于 NSUserDefaults 的键值对存储                               │
│  • 数据存储在 Application Support/Library/Preferences 目录           │
│  • 每次读写都同步到磁盘                                             │
│  • 线程安全的                                                      │
│  • 适合存储少量配置数据                                              │
│                                                                    │
│  数据类型映射：                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Swift 类型          │ UserDefaults 类型              │       │
│  ├───────────────────────────────────────────────────────────┤   │
│  │  String              │ String                        │       │
│  │  Int / Double / Bool │ NSNumber                       │       │
│  │  Float               │ NSNumber                       │       │
│  │  [String] / [Int]    │ NSArray (of NSNumber)          │       │
│  │  [String: Any]       │ NSDictionary                    │       │
│  │  Data                │ NSData                         │       │
│  │  Date                │ NSNumber (timeIntervalSince1970)  │       │
│  │  URL                 │ String (url.absoluteString)       │       │
│  │  UserDefaults        │ UserDefaults                    │       │
│  │  CGRect / CGPoint    │ NSValue                         │       │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  UserDefaults 的最佳实践：                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // ✅ 正确：使用键常量                                             │
│  │  extension UserDefaults {                                      │
│  │      enum Keys {                                              │
│  │          static let userName = "com.app.username"              │
│  │          static let token = "com.app.token"                    │
│  │      }                                                         │
│  │      var username: String? {                                  │
│  │          get { string(forKey: Keys.username) }                │
│  │          set { set(newValue, forKey: Keys.username) }          │
│  │      }                                                         │
│  │  }                                                             │
│  │                                                                │
│  │  // ❌ 错误：使用魔法字符串                                           │
│  │  userDefaults.set("test", forKey: "username")  // ❌            │
│  │                                                                │
│  │  // UserDefaults 适合的场景：                                  │
│  │  • 用户偏好设置（主题、语言、字体大小）                        │
│  │  • 应用配置（首次启动标志、API 端点）                          │
│  │  • 小型数据缓存                                                │
│  │                                                                │
│  │  UserDefaults 的限制：                                         │
│  │  • 只支持 Property List 类型                                   │
│  │  • 不能存储自定义对象（需归档）                                │
│  │  • 不适合存储大数据（每次写都同步）                            │
│  │  • 不适合存储敏感数据（Keychain）                              │
│  │  • 性能差（大数据量时）                                        │
│  │  • 数据大小上限约 1MB                                          │
│  └────────────────────────────────────────────────────────┘   │
│                                                                    │
│  UserDefaults 的线程安全：                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • UserDefaults.standard 是线程安全的                         │
│  │  • synchronize() 是阻塞调用（不推荐手动调用）                    │
│  │  • iOS 会自动在应用进入后台时同步数据                            │
│  │  • 多个实例共享同一 UserDefaults（单例模式）                   │
│  │                                                                │
│  │  性能分析：                                                   │
│  │  • 读取：O(1)（内存缓存）                                     │
│  │  • 写入：O(n)（序列化 + 磁盘写入）                            │
│  │  • synchronize()：阻塞调用（约 1-5ms）                        │
│  │  • 建议：批量写入，减少写入次数                                │
│  │                                                                │
│  │  UserDefaults vs 文件 vs 数据库：                            │
│  │  ┌──────────────────────────────────────────────────────┐      │
│  │  │  特性        │  UserDefaults  │  文件  │  数据库      │      │
│  │  ├─────────────────────────────────────────────────┤      │
│  │  │  适用场景    │ 小配置数据      │ 大文件  │ 复杂数据    │      │
│  │  │  数据量      │ < 1MB           │ 无限制  │ 无限制      │      │
│  │  │  读写速度    │ 快（内存缓存）    │ 中等  │ 慢（索引+查询）│      │
│  │  │  搜索        │ 按键查找          │ 手动  │ SQL 查询     │      │
│  │  │  线程安全    │ ✅ 线程安全      │ 需加锁  │ 需加锁     │      │
│  │  │  复杂度      │ 低                │ 中    │ 高          │      │
│  │  └───────────────────────────────────────────────────┘      │
│  └────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 2. 文件存储与 FileManager

```
文件存储与 FileManager 深度分析：
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  FileManager 核心 API：                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // 获取目录路径                                                   │
│  │  let documentsURL = FileManager.default.urls(               │
│  │      for: .documentDirectory,                                 │
│  │      in: .userDomainMask).first  // Documents/                │
│  │  let cachesURL = FileManager.default.urls(                │
│  │      for: .cachesDirectory,                                   │
│  │      in: .userDomainMask).first  // Library/Caches/          │
│  │  let tempURL = FileManager.default.temporaryDirectory       │
│  │                                                                │
│  │  // 创建目录                                                     │
│  │  let newDir = documentsURL.appendingPathComponent("subdir")  │
│  │  try? FileManager.default.createDirectory(                │
│  │      at: newDir,                                             │
│  │      withIntermediateDirectories: true,                     │
│  │      attributes: nil                                         │
│  │  )                                                           │
│  │                                                                │
│  │  // 写入文件                                                     │
│  │  let fileURL = documentsURL.appendingPathComponent("data.json")  │
│  │  let data = try? JSONEncoder().encode(myObject)              │
│  │  try? data?.write(to: fileURL)                              │
│  │                                                                │
│  │  // 读取文件                                                     │
│  │  let data = try? Data(contentsOf: fileURL)                  │
│  │  let obj = try? JSONDecoder().decode(MyObject.self, from: data!)  │
│  │                                                                │
│  │  // 文件操作                                                     │
│  │  FileManager.default.moveItem(at: fromURL, to: toURL)        │
│  │  FileManager.default.removeItem(at: fileURL)                │
│  │  FileManager.default.copyItem(at: fromURL, to: toURL)       │
│  │  FileManager.default.fileExists(atPath: path)               │
│  │  FileManager.default.contentsEqual(at: a, and: b)           │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  文件存储策略：                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // 适合的文件存储场景：                                      │
│  │  • 大文件（图片、视频、音频）                                │
│  │  • JSON/XML 数据                                             │
│  │  • 配置文件                                                │
│  │  • 缓存文件                                                │
│  │                                                                │
│  │  // 文件缓存策略：                                            │
│  │  • NSFileProtectionComplete — 设备锁定后加密                 │
│  │  • NSFileProtectionUntilFirstUserAuth — 首次用户认证后解锁    │
│  │  • NSFileProtectionNone — 不加密（临时文件）                  │
│  │                                                                │
│  │  // 文件存储 vs UserDefaults 对比：                         │
│  │  ┌───────┬─────────────────────┬─────────────────────────────┐   │
│  │  │ 特性  │ 文件存储            │ UserDefaults               │   │
│  │  ├───────┼─────────────────────┼─────────────────────────────┤   │
│  │  │ 数据量 │ 无限制              │ < 1MB                       │   │
│  │  │ 搜索  │ 手动                   │ 按键查找                    │   │
│  │  │ 类型  │ 任意类型              │ Property List              │   │
│  │  │ 线程  │ 需手动加锁            │ 自动线程安全                │   │
│  │  │ 性能  │ 慢（磁盘 IO）          │ 快（内存缓存）              │   │
│  │  └───────┴──────────────────────┴─────────────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  文件性能优化：                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 批量写入（减少 IO 次数）                                      │
│  │  • 异步写入（DispatchQueue.global）                            │
│  │  • 文件压缩（减少磁盘空间）                                    │
│  │  • 文件分片（大文件分块存储）                                    │
│  │  • 使用 NSURLSession.downloadTask 替代手动下载                  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 3. Codable 全栈深度

```
Codable 全栈分析：
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Codable 核心：                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // Codable = Decodable + Encodable                         │
│  │  • Encodable：将对象编码为 JSON/XML/Data                      │
│  │  • Decodable：将 JSON/XML/Data 解码为对象                    │
│  │  • 基于类型安全和协议导向                                      │
│  │                                                                │
│  │  基本用法：                                                   │
│  │  struct User: Codable {                                     │
│  │      let id: Int                                               │
│  │      let name: String                                          │
│  │      let email: String                                         │
│  │  }                                                             │
│  │                                                                │
│  │  // 编码：对象 → JSON / Data                                │
│  │  let encoder = JSONEncoder()                                 │
│  │  encoder.dateEncodingStrategy = .iso8601                     │
│  │  encoder.keyEncodingStrategy = .convertToSnakeCase            │
│  │  let data = try encoder.encode(user)                         │
│  │  let json = String(data: data, encoding: .utf8)!            │
│  │                                                                │
│  │  // 解码：JSON / Data → 对象                                  │
│  │  let decoder = JSONDecoder()                                 │
│  │  decoder.dateDecodingStrategy = .iso8601                     │
│  │  decoder.keyDecodingStrategy = .convertFromSnakeCase          │
│  │  let user = try decoder.decode(User.self, from: data)        │
│  │                                                                │
│  │  // 自定义编码键                                            │
│  │  enum CodingKeys: String, CodingKey {                       │
│  │      case id = "user_id"                                     │
│  │      case name = "full_name"                                 │
│  │      case email                                              │
│  │  }                                                             │
│  │                                                                │
│  │  // 日期编码策略                                            │
│  │  .iso8601 — ISO 8601 格式                                   │
│  │  .secondsSince1970 — Unix 时间戳                            │
│  │  .millisecondsSince1970 — 毫秒时间戳                         │
│  │  .formatted(DateFormatter) — 自定义格式                      │
│  │  .custom — 自定义闭包                                        │
│  │                                                                │
│  │  // 字符串编码策略                                          │
│  │  .useDefaultKeys — 默认键名                                   │
│  │  .convertToSnakeCase — snake_case                             │
│  │  .convertToCapitalizedCase — CapitalizedCase                 │
│  │  .convertToPascalCase — PascalCase                           │
│  │  .lowercaseFirstLetter — lowercaseFirstLetter                │
│  │  .custom — 自定义闭包                                        │
│  │                                                                │
│  │  // 自定义编码实现                                          │
│  │  struct CustomDate: Codable {                               │
│  │      let date: Date                                          │
│  │      enum CodingKeys: String, CodingKey {                   │
│  │          case date                                           │
│  │      }                                                       │
│  │      init(from decoder: Decoder) throws {                   │
│  │          let container = try decoder.container(keyedBy: CodingKeys.self)  │
│  │          let dateString = try container.decode(String.self, forKey: .date)  │
│  │          let formatter = DateFormatter()                     │
│  │          formatter.dateFormat = "yyyy-MM-dd"                  │
│  │          date = formatter.date(from: dateString)!              │
│  │      }                                                       │
│  │      func encode(to encoder: Encoder) throws {              │
│  │          var container = encoder.container(keyedBy: CodingKeys.self)  │
│  │          let formatter = DateFormatter()                     │
│  │          formatter.dateFormat = "yyyy-MM-dd"                 │
│  │          try container.encode(formatter.string(from: date), forKey: .date)  │
│  │      }                                                       │
│  │  }                                                           │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Codable 性能分析：                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 编码：O(n)（n = 属性数量）                                │
│  │  • 解码：O(n)（n = 属性数量）                                │
│  │  • 编译期生成代码（零运行时开销）                              │
│  │  • 适合中小型对象编码/解码                                    │
│  │  • 大数据量编码：考虑流式编码（JSONEncoder.outputFormatting）    │
│  │  • 建议：使用 .sortedKeys 排序键以减小 JSON 体积              │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Codable 的局限性：                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 不支持所有类型（需 conforming Codable）                     │
│  │  • 不支持可选类型的自定义编码                                  │
│  │  • 不支持循环引用对象                                          │
│  │  • 不支持泛型类型（需额外处理）                                │
│  │  • 不支持 @objc 属性自动桥接                                  │
│  │  • 解决：实现自定义 init(from:) 和 encode(to:)              │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Codable 替代方案：                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • ObjectMapper — 更灵活的编码                                │
│  │  • Mantle — 底层编码                                            │
│  │  • SwiftData（iOS 17+）— 原生数据持久化                       │
│  │  • Realm — 移动端数据库                                         │
│  │  • CoreData — 官方数据持久化                                    │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Codable vs ObjectMapper 对比：                                    │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  特性        │ Codable          │ ObjectMapper                  │   │
│  │  ├───────────┼───────────────────┼─────────────────────────────┤   │
│  │  类型安全    │ ✅ 编译期         │ ❌ 运行时                    │   │
│  │  编码速度    │ 快（编译器生成）     │ 慢（反射 + 字符串匹配）       │   │
│  │  灵活性      │ 中                │ 高                         │   │
│  │  学习成本    │ 低                  │ 中                        │   │
│  │  适用场景    │ 通用编码            │ 复杂/特殊编码              │   │
│  │  推荐        │ ✅ 首选             │ 需要特殊编码时才用          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 4. Keychain 安全存储

```
Keychain 安全存储深度分析：
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Keychain 的核心：                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • iOS 最安全的存储机制                                       │
│  │  • 数据加密存储在安全的硬件区域                                   │
│  │  • 设备锁定后数据仍然安全                                     │
│  │  • 跨 App 共享（需要 App Group）                               │
│  │  • 支持 iCloud 同步                                          │
│  │  • 不适合存储大数据（每项目约 5KB 限制）                        │
│  │  • 使用 Keychain API 管理                                       │
│  │                                                                │
│  │  Keychain 的安全特性：                                        │
│  │  • 设备锁定后数据加密                                         │
│  │  • 设备丢失后数据不可访问                                      │
│  │  • 不支持明文访问                                             │
│  │  • 支持 Face ID / Touch ID 验证                               │
│  │  • 支持 App Group 共享                                        │
│  │                                                                │
│  │  Keychain 的适用场景：                                        │
│  │  • 密码、token、密钥存储                                      │
│  │  • 认证信息                                                 │
│  │  • 敏感配置数据                                              │
│  │                                                                │
│  │  Keychain 的限制：                                            │
│  │  • 每项目约 5KB 存储限制                                      │
│  │  • 不支持大数据存储                                           │
│  │  • 不支持结构化数据（只能存储 key-value）                      │
│  │  • API 使用复杂                                             │
│  │  • iCloud 同步有容量限制                                     │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Keychain 的使用：                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  // Keychain API 使用                                              │
│  │  class KeychainManager {                                       │
│  │      private let service = "com.app.service"                    │
│  │      private let accessGroup = "com.app.group"                  │
│  │      private let keychain = SecKeychain.default                  │
│  │      private let keychainAccess = SecKeychain.default               │
│  │                                                                │
│  │      // 存储                                                    │
│  │      func save(key: String, value: Data) -> Bool {           │
│  │          let query: [String: Any] = [                         │
│  │              kSecClass as String: kSecClassGenericPassword,     │
│  │              kSecAttrService as String: service,                │
│  │              kSecAttrAccount as String: key,                    │
│  │              kSecValueData as String: value,                    │
│  │              kSecAttrAccessGroup as String: accessGroup,        │
│  │              kSecAttrAccessible as String: kSecAttrWhenUnlocked,  │
│  │          ]                                                    │
│  │                                                                │
│  │          // 先删除已有的                                           │
│  │          SecItemDelete(query as CFDictionary)                  │
│  │                                                                │
│  │          let status = SecItemAdd(query as CFDictionary, nil)  │
│  │          return status == errSecSuccess                        │
│  │      }                                                         │
│  │                                                                │
│  │      // 读取                                                    │
│  │      func load(key: String) -> Data? {                       │
│  │          let query: [String: Any] = [                         │
│  │              kSecClass as String: kSecClassGenericPassword,     │
│  │              kSecAttrService as String: service,                │
│  │              kSecAttrAccount as String: key,                    │
│  │              kSecReturnData as String: true,                    │
│  │              kSecMatchLimit as String: kSecMatchLimitOne,       │
│  │          ]                                                    │
│  │                                                                │
│  │          var result: AnyObject?                               │
│  │          let status = SecItemCopyMatching(query as CFDictionary, &result)  │
│  │          return status == errSecSuccess ? result as? Data : nil  │
│  │      }                                                         │
│  │                                                                │
│  │      // 删除                                                    │
│  │      func delete(key: String) -> Bool {                       │
│  │          let query: [String: Any] = [                         │
│  │              kSecClass as String: kSecClassGenericPassword,     │
│  │              kSecAttrService as String: service,                │
│  │              kSecAttrAccount as String: key,                    │
│  │          ]                                                    │
│  │          let status = SecItemDelete(query as CFDictionary)    │
│  │          return status == errSecSuccess                        │
│  │      }                                                         │
│  │  }                                                           │
│  │                                                                │
│  │  ⚠️ 使用提示：                                                  │
│  │  • 使用 KeychainItemWrapper 或 SAMKeychain 等封装库简化 API  │
│  │  • 不要存储超过 5KB 的数据                                    │
│  │  • 使用 kSecAttrAccessibleWhenUnlocked 提高安全性              │
│  │  • 使用 App Group 实现多 App 共享                             │
│  │  • 不要硬编码 service 和 accessGroup 名称                    │
│  │  • 使用 Entitlements 文件配置 App Group                      │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Keychain vs UserDefaults vs 文件：                                  │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  特性        │ Keychain         │ UserDefaults  │ 文件存储     │   │
│  │  ├───────────┼───────────────────┼──────────────┼───────────┤   │
│  │  安全性      │ ✅ 最高（硬件加密） │ ❌ 明文      │ ⚠️ 可配置  │   │
│  │  存储限制    │ ~5KB              │ ~1MB          │ 无限制      │   │
│  │  数据类型    │ Data               │ Property List │ 任意类型    │   │
│  │  线程安全    │ ✅ 安全             │ ✅ 安全      │ 需加锁     │   │
│  │  共享       │ 需要 App Group      │ 无需共享      │ 需手动      │   │
│  │  性能       │ 中等                 │ 快           │ 慢          │   │
│  │  推荐场景    │ 密码/token          │ 配置         │ 大文件      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Keychain 性能分析：                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 读取：约 1-5ms（加密解密开销）                              │
│  │  • 写入：约 5-10ms（加密 + 存储）                              │
│  │  • 删除：约 1-3ms                                            │
│  │  • 建议：批量操作、异步执行、缓存常用数据                      │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 5. 缓存策略

```
缓存策略深度分析：
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  缓存层级：                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  1. 内存缓存（Memory Cache）                                 │
│  │  • 最快（O(1) 查找）                                          │
│  │  • 容量有限（约 100-200MB）                                   │
│  │  • App 退出后数据丢失                                         │
│  │  • 实现：NSCache、NSDictionary、自定义字典                   │
│  │                                                                │
│  │  2. 磁盘缓存（Disk Cache）                                    │
│  │  • 持久化存储                                                 │
│  │  • 速度慢（磁盘 IO）                                          │
│  │  • App 退出后数据保留                                        │
│  │  • 实现：FileManager、CoreData、SQLite                       │
│  │                                                                │
│  │  3. 网络缓存（Network Cache）                                 │
│  │  • URLSession 自动缓存                                       │
│  │  • 实现：NSURLCache（内存）、NSURLSession（磁盘）             │
│  │  • 策略：.cacheWhenAvailable、.reloadIgnoringLocalCacheData  │
│  │                                                                │
│  │  内存缓存实现：                                                │
│  │  ┌─────────────────────────────────────────────────────────┐   │
│  │  │  // NSCache（推荐 ✅）                                      │   │
│  │  │  let cache = NSCache<NSString, UIImage>()                   │
│  │  │  cache.totalCostLimit = 100 * 1024 * 1024  // 100MB       │
│  │  │  cache.countLimit = 100  // 最多 100 个对象                 │
│  │  │  cache.setObject(image, forKey: key as NSString)             │
│  │  │  let cached = cache.object(forKey: key as NSString)         │
│  │  │                                                             │
│  │  │  // 自定义内存缓存（LLR 替换）                              │
│  │  │  class LRUCache<K: Hashable, V> {                         │
│  │  │      private var cache = [K: V]()                            │
│  │  │      private let maxCost: Int                               │
│  │  │      private var totalCost = 0                              │
│  │  │                                                             │
│  │  │      func get(key: K) -> V? {                            │
│  │  │          return cache[key]                                 │
│  │  │      }                                                      │
│  │  │                                                             │
│  │  │      func set(key: K, value: V, cost: Int) {             │
│  │  │          cache[key] = value                                 │
│  │  │          totalCost += cost                                  │
│  │  │          while totalCost > maxCost {                       │
│  │  │              cache.removeValue(forKey: cache.keys.first!)   │
│  │  │          }                                                  │
│  │  │      }                                                      │
│  │  │  }                                                         │
│  │  └──────────────────────────────────────────────────────────┘   │
│  │                                                                │
│  │  缓存策略：                                                  │
│  │  • LRU（Least Recently Used）— 最久未用优先替换               │
│  │  • LFU（Least Frequently Used）— 最少使用优先替换              │
│  │  • FIFO（First In First Out）— 先进先出                      │
│  │  • TTL（Time To Live）— 过期时间                             │
│  │  • ARC（Auto Size Cache）— 自动大小                          │
│  │                                                                │
│  │  缓存命中率分析：                                            │
│  │  ┌─────────────────────────────────────────────────────────────┐   │
│  │  │  • 内存缓存命中率 > 90%（热点数据）                         │
│  │  │  • 磁盘缓存命中率 > 70%（持久化数据）                        │
│  │  │  • 网络缓存命中率 > 50%（API 响应）                         │
│  │  │  • 建议：热点数据存内存，非热点数据存磁盘                      │
│  │  │  • 缓存失效：TTL、容量限制、显式清除                          │
│  │  └─────────────────────────────────────────────────────────────┘   │
│  │                                                                │
│  │  URLCache 配置：                                             │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  let cache = URLCache(memoryCapacity: 50 * 1024 * 1024,  │
│  │  │                       diskCapacity: 100 * 1024 * 1024,     │
│  │  │                       diskPath: nil)                       │
│  │  │                                                             │
│  │  │  let config = URLSessionConfiguration.default             │
│  │  │  config.urlCache = cache                                    │
│  │  │  config.requestCachePolicy = .useProtocolCachePolicy        │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                                │
│  │  缓存最佳实践：                                               │
│  │  • 设置合理的容量上限                                           │
│  │  • 使用 NSCache（自动管理内存）                                 │
│  │  • 缓存热点数据（图片、列表数据）                               │
│  │  • 定期清理过期缓存                                           │
│  │  • 使用 URLCache 处理网络响应                                  │
│  │  • 缓存前检查数据类型兼容性                                    │
│  │  • 使用异步加载和缓存                                            │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 6. 归档与编码

```
归档与编码深度分析：
┌─────────────────────────────────────────────────────────────────────────────┐
│  归档（Archive）的核心：                                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  • NSKeyedArchiver/NSKeyedUnarchiver 实现对象归档                   │
│  │  • 基于 NSCoding 协议                                             │
│  │  • 适合存储自定义对象                                              │
│  │  • 编码：对象 → Data                                              │
│  │  • 解码：Data → 对象                                               │
│  │                                                                  │
│  │  NSCoding 协议：                                                │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  │  protocol NSCoding {                                           │
│  │  │      init?(coder aDecoder: NSCoder)                            │
│  │  │      func encode(with aCoder: NSCoder)                          │
│  │  │  }                                                             │
│  │  │                                                                │
│  │  │  // 编码实现                                                  │
│  │  │  func encode(with aCoder: NSCoder) {                           │
│  │  │      aCoder.encode(id, forKey: "id")                            │
│  │  │      aCoder.encode(name, forKey: "name")                        │
│  │  │  }                                                             │
│  │  │                                                                │
│  │  │  // 解码实现                                                  │
│  │  │  required init?(coder aDecoder: NSCoder) {                    │
│  │  │      id = aDecoder.decodeInteger(forKey: "id")                 │
│  │  │      name = aDecoder.decodeObject(forKey: "name") as? String   │
│  │  │  }                                                             │
│  │  └──────────────────────────────────────────────────────────────────┘  │
│  │                                                                  │
│  │  NSCoding vs Codable 对比：                                    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │
│  │  │  特性        │ NSCoding               │  Codable               │  │
│  │  ├─────────────┼──────────────────────────┼──────────────────────┤  │
│  │  │ 类型安全      │ ❌ 运行时                  │ ✅ 编译期              │  │
│  │  │ 编码速度      │ 慢（反射 + 字符串）         │ 快（编译器生成）      │  │
│  │  │ 适用场景      │ UIKit 对象归档             │ 通用编码               │  │
│  │  │ 编码格式      │ 自定义二进制                  │ JSON/XML              │  │
│  │  │ 推荐        │ UIKit 对象（不可继承 Codable） │ 首选 ✅               │  │
│  │  └─────────────┴────────────────────────────────────────────┘  │
│  │                                                                  │
│  │  归档的使用：                                                   │
│  │  ┌───────────────────────────────────────────────────────────┐  │
│  │  │  // 编码到文件                                                │
│  │  │  let data = try NSKeyedArchiver.archivedData(            │
│  │  │      withRootObject: myObject,                            │
│  │  │      requiringSecureCoding: true)                         │
│  │  │  try data.write(to: fileURL)                             │
│  │  │                                                             │
│  │  │  // 从文件解码                                                │
│  │  │  let data = try Data(contentsOf: fileURL)                  │
│  │  │  let myObject = try NSKeyedUnarchiver.unarchivedObject(  │
│  │  │      ofClass: MyObject.self,                              │
│  │  │      from: data)                                           │
│  │  └───────────────────────────────────────────────────────┘  │
│  │                                                                  │
│  │  性能分析：                                                   │
│  │  • 归档：O(n)（n = 属性数量）                                │
│  │  • 解码：O(n)（n = 属性数量）                                │
│  │  • 编码效率：比 Codable 慢 2-3x                              │
│  │  • 建议：使用 Codable（除非需要 UIKit 对象归档）              │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  编码方案对比：                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  方案          │ 安全性      │ 性能      │ 适用场景              │  │
│  │  ├─────────────┼───────────┼─────────┼────────────────────┤  │
│  │  Codable       │ ✅ 类型安全 │ ✅ 快     │ 通用编码（首选）       │  │
│  │  NSCoding      │ ❌ 运行时    │ ❌ 慢     │ UIKit 对象归档       │  │
│  │  ObjectMapper  │ ⚠️ 弱类型    │ ⚠️ 中等   │ 特殊编码需求        │  │
│  │  JSONEncoder   │ ✅ 类型安全 │ ✅ 快     │ JSON 编码（首选）    │  │
│  │  XMLDecoder    │ ✅ 类型安全 │ ⚠️ 中等   │ XML 编码              │  │
│  └─────────────┴───────────┴─────────┴────────────────────┘  │
│                                                                    │
│  总结：                                                       │
│  • UserDefaults：小配置数据                                           │
│  • 文件：大文件、JSON/XML 数据                                     │
│  • Codable：编码解码首选                                             │
│  • Keychain：密码/token 存储                                       │
│  • NSCoding：UIKit 对象归档                                       │
│  • NSCache：内存缓存                                               │
│  • URLCache：网络缓存                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────────────┘
*/
```

---

## 7. 面试考点汇总

### 高频面试题

**Q1: UserDefaults 的原理和限制？**

**答**：
- 基于键值对的配置存储，存储在 Library/Preferences
- 支持 Property List 类型，不适合大数据/敏感数据
- 每次读写同步到磁盘，数据量上限约 1MB
- 线程安全，单例模式

**Q2: Codable 的核心机制？**

**答**：
- Codable = Encodable + Decodable
- 编译期生成代码（零运行时开销）
- 支持日期编码策略、键编码策略、自定义编码
- 比 NSCoding 更快、更安全

**Q3: Keychain 的安全特性？**

**答**：
- 硬件加密存储，设备锁定后不可访问
- 支持 Face ID / Touch ID 验证
- 每项目约 5KB 限制
- 支持 App Group 共享

**Q4: 缓存策略有哪些？**

**答**：
- 三层缓存：内存、磁盘、网络
- 内存：NSCache（推荐）、自定义 LRU
- 磁盘：FileManager、CoreData、SQLite
- 网络：URLCache
- 策略：LRU、LFU、TTL、ARC

**Q5: 数据持久化方案对比？**

**答**：
- UserDefaults：小配置数据
- 文件：大文件、JSON/XML
- Codable：编码首选
- Keychain：密码/token
- CoreData：复杂数据模型
- SQLite：结构化查询

---

## 8. 参考资源

- [Apple: UserDefaults Reference](https://developer.apple.com/documentation/foundation/userdefaults)
- [Apple: FileManager Reference](https://developer.apple.com/documentation/foundation/filemanager)
- [Apple: Codable Reference](https://developer.apple.com/documentation/foundation/archiving_and_serialization)
- [Apple: Keychain Reference](https://developer.apple.com/documentation/security/keychain_services)
- [Apple: Archive Reference](https://developer.apple.com/documentation/foundation/nskeyedarchiver)
- [Apple: NSCache Reference](https://developer.apple.com/documentation/foundation/nscache)
- [Apple: URLCache Reference](https://developer.apple.com/documentation/foundation/urlcache)
- [NSHipster: Codable](https://nshipster.com/codable)
- [NSHipster: Keychain](https://nshipster.com/keychain)
- [WWDC 2020: What's New in Data Persistence](https://developer.apple.com/videos/play/wwdc2020/10177/)
- [WWDC 2021: Advanced Data Persistence with SwiftData](https://developer.apple.com/videos/play/wwdc2021/10227/)
