import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const h=JSON.parse('{"title":"01 - 本地存储深度","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/07_Storage_Deep/01_Local_Storage.md","filePath":"01-ios/07_Storage_Deep/01_Local_Storage.md"}'),l={name:"01-ios/07_Storage_Deep/01_Local_Storage.md"};function i(c,n,t,r,o,d){return a(),p("div",null,[...n[0]||(n[0]=[e(`<h1 id="_01-本地存储深度" tabindex="-1">01 - 本地存储深度 <a class="header-anchor" href="#_01-本地存储深度" aria-label="Permalink to &quot;01 - 本地存储深度&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-userdefaults-深度分析">UserDefaults 深度分析</a></li><li><a href="#2-文件存储与-filemanager">文件存储与 FileManager</a></li><li><a href="#3-codable-全栈深度">Codable 全栈深度</a></li><li><a href="#4-keychain-安全存储">Keychain 安全存储</a></li><li><a href="#5-缓存策略">缓存策略</a></li><li><a href="#6-归档与编码">归档与编码</a></li><li><a href="#7-面试考点汇总">面试考点汇总</a></li></ol><hr><h2 id="_1-userdefaults-深度分析" tabindex="-1">1. UserDefaults 深度分析 <a class="header-anchor" href="#_1-userdefaults-深度分析" aria-label="Permalink to &quot;1. UserDefaults 深度分析&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>UserDefaults 深度分析：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  UserDefaults 的本质：                                              │</span></span>
<span class="line"><span>│  • 基于 NSUserDefaults 的键值对存储                               │</span></span>
<span class="line"><span>│  • 数据存储在 Application Support/Library/Preferences 目录           │</span></span>
<span class="line"><span>│  • 每次读写都同步到磁盘                                             │</span></span>
<span class="line"><span>│  • 线程安全的                                                      │</span></span>
<span class="line"><span>│  • 适合存储少量配置数据                                              │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  数据类型映射：                                                      │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  Swift 类型          │ UserDefaults 类型              │       │</span></span>
<span class="line"><span>│  ├───────────────────────────────────────────────────────────┤   │</span></span>
<span class="line"><span>│  │  String              │ String                        │       │</span></span>
<span class="line"><span>│  │  Int / Double / Bool │ NSNumber                       │       │</span></span>
<span class="line"><span>│  │  Float               │ NSNumber                       │       │</span></span>
<span class="line"><span>│  │  [String] / [Int]    │ NSArray (of NSNumber)          │       │</span></span>
<span class="line"><span>│  │  [String: Any]       │ NSDictionary                    │       │</span></span>
<span class="line"><span>│  │  Data                │ NSData                         │       │</span></span>
<span class="line"><span>│  │  Date                │ NSNumber (timeIntervalSince1970)  │       │</span></span>
<span class="line"><span>│  │  URL                 │ String (url.absoluteString)       │       │</span></span>
<span class="line"><span>│  │  UserDefaults        │ UserDefaults                    │       │</span></span>
<span class="line"><span>│  │  CGRect / CGPoint    │ NSValue                         │       │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  UserDefaults 的最佳实践：                                           │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // ✅ 正确：使用键常量                                             │</span></span>
<span class="line"><span>│  │  extension UserDefaults {                                      │</span></span>
<span class="line"><span>│  │      enum Keys {                                              │</span></span>
<span class="line"><span>│  │          static let userName = &quot;com.app.username&quot;              │</span></span>
<span class="line"><span>│  │          static let token = &quot;com.app.token&quot;                    │</span></span>
<span class="line"><span>│  │      }                                                         │</span></span>
<span class="line"><span>│  │      var username: String? {                                  │</span></span>
<span class="line"><span>│  │          get { string(forKey: Keys.username) }                │</span></span>
<span class="line"><span>│  │          set { set(newValue, forKey: Keys.username) }          │</span></span>
<span class="line"><span>│  │      }                                                         │</span></span>
<span class="line"><span>│  │  }                                                             │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // ❌ 错误：使用魔法字符串                                           │</span></span>
<span class="line"><span>│  │  userDefaults.set(&quot;test&quot;, forKey: &quot;username&quot;)  // ❌            │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // UserDefaults 适合的场景：                                  │</span></span>
<span class="line"><span>│  │  • 用户偏好设置（主题、语言、字体大小）                        │</span></span>
<span class="line"><span>│  │  • 应用配置（首次启动标志、API 端点）                          │</span></span>
<span class="line"><span>│  │  • 小型数据缓存                                                │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  UserDefaults 的限制：                                         │</span></span>
<span class="line"><span>│  │  • 只支持 Property List 类型                                   │</span></span>
<span class="line"><span>│  │  • 不能存储自定义对象（需归档）                                │</span></span>
<span class="line"><span>│  │  • 不适合存储大数据（每次写都同步）                            │</span></span>
<span class="line"><span>│  │  • 不适合存储敏感数据（Keychain）                              │</span></span>
<span class="line"><span>│  │  • 性能差（大数据量时）                                        │</span></span>
<span class="line"><span>│  │  • 数据大小上限约 1MB                                          │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  UserDefaults 的线程安全：                                          │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • UserDefaults.standard 是线程安全的                         │</span></span>
<span class="line"><span>│  │  • synchronize() 是阻塞调用（不推荐手动调用）                    │</span></span>
<span class="line"><span>│  │  • iOS 会自动在应用进入后台时同步数据                            │</span></span>
<span class="line"><span>│  │  • 多个实例共享同一 UserDefaults（单例模式）                   │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  性能分析：                                                   │</span></span>
<span class="line"><span>│  │  • 读取：O(1)（内存缓存）                                     │</span></span>
<span class="line"><span>│  │  • 写入：O(n)（序列化 + 磁盘写入）                            │</span></span>
<span class="line"><span>│  │  • synchronize()：阻塞调用（约 1-5ms）                        │</span></span>
<span class="line"><span>│  │  • 建议：批量写入，减少写入次数                                │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  UserDefaults vs 文件 vs 数据库：                            │</span></span>
<span class="line"><span>│  │  ┌──────────────────────────────────────────────────────┐      │</span></span>
<span class="line"><span>│  │  │  特性        │  UserDefaults  │  文件  │  数据库      │      │</span></span>
<span class="line"><span>│  │  ├─────────────────────────────────────────────────┤      │</span></span>
<span class="line"><span>│  │  │  适用场景    │ 小配置数据      │ 大文件  │ 复杂数据    │      │</span></span>
<span class="line"><span>│  │  │  数据量      │ &lt; 1MB           │ 无限制  │ 无限制      │      │</span></span>
<span class="line"><span>│  │  │  读写速度    │ 快（内存缓存）    │ 中等  │ 慢（索引+查询）│      │</span></span>
<span class="line"><span>│  │  │  搜索        │ 按键查找          │ 手动  │ SQL 查询     │      │</span></span>
<span class="line"><span>│  │  │  线程安全    │ ✅ 线程安全      │ 需加锁  │ 需加锁     │      │</span></span>
<span class="line"><span>│  │  │  复杂度      │ 低                │ 中    │ 高          │      │</span></span>
<span class="line"><span>│  │  └───────────────────────────────────────────────────┘      │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_2-文件存储与-filemanager" tabindex="-1">2. 文件存储与 FileManager <a class="header-anchor" href="#_2-文件存储与-filemanager" aria-label="Permalink to &quot;2. 文件存储与 FileManager&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>文件存储与 FileManager 深度分析：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  FileManager 核心 API：                                              │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 获取目录路径                                                   │</span></span>
<span class="line"><span>│  │  let documentsURL = FileManager.default.urls(               │</span></span>
<span class="line"><span>│  │      for: .documentDirectory,                                 │</span></span>
<span class="line"><span>│  │      in: .userDomainMask).first  // Documents/                │</span></span>
<span class="line"><span>│  │  let cachesURL = FileManager.default.urls(                │</span></span>
<span class="line"><span>│  │      for: .cachesDirectory,                                   │</span></span>
<span class="line"><span>│  │      in: .userDomainMask).first  // Library/Caches/          │</span></span>
<span class="line"><span>│  │  let tempURL = FileManager.default.temporaryDirectory       │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 创建目录                                                     │</span></span>
<span class="line"><span>│  │  let newDir = documentsURL.appendingPathComponent(&quot;subdir&quot;)  │</span></span>
<span class="line"><span>│  │  try? FileManager.default.createDirectory(                │</span></span>
<span class="line"><span>│  │      at: newDir,                                             │</span></span>
<span class="line"><span>│  │      withIntermediateDirectories: true,                     │</span></span>
<span class="line"><span>│  │      attributes: nil                                         │</span></span>
<span class="line"><span>│  │  )                                                           │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 写入文件                                                     │</span></span>
<span class="line"><span>│  │  let fileURL = documentsURL.appendingPathComponent(&quot;data.json&quot;)  │</span></span>
<span class="line"><span>│  │  let data = try? JSONEncoder().encode(myObject)              │</span></span>
<span class="line"><span>│  │  try? data?.write(to: fileURL)                              │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 读取文件                                                     │</span></span>
<span class="line"><span>│  │  let data = try? Data(contentsOf: fileURL)                  │</span></span>
<span class="line"><span>│  │  let obj = try? JSONDecoder().decode(MyObject.self, from: data!)  │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 文件操作                                                     │</span></span>
<span class="line"><span>│  │  FileManager.default.moveItem(at: fromURL, to: toURL)        │</span></span>
<span class="line"><span>│  │  FileManager.default.removeItem(at: fileURL)                │</span></span>
<span class="line"><span>│  │  FileManager.default.copyItem(at: fromURL, to: toURL)       │</span></span>
<span class="line"><span>│  │  FileManager.default.fileExists(atPath: path)               │</span></span>
<span class="line"><span>│  │  FileManager.default.contentsEqual(at: a, and: b)           │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  文件存储策略：                                                     │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // 适合的文件存储场景：                                      │</span></span>
<span class="line"><span>│  │  • 大文件（图片、视频、音频）                                │</span></span>
<span class="line"><span>│  │  • JSON/XML 数据                                             │</span></span>
<span class="line"><span>│  │  • 配置文件                                                │</span></span>
<span class="line"><span>│  │  • 缓存文件                                                │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 文件缓存策略：                                            │</span></span>
<span class="line"><span>│  │  • NSFileProtectionComplete — 设备锁定后加密                 │</span></span>
<span class="line"><span>│  │  • NSFileProtectionUntilFirstUserAuth — 首次用户认证后解锁    │</span></span>
<span class="line"><span>│  │  • NSFileProtectionNone — 不加密（临时文件）                  │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 文件存储 vs UserDefaults 对比：                         │</span></span>
<span class="line"><span>│  │  ┌───────┬─────────────────────┬─────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  │ 特性  │ 文件存储            │ UserDefaults               │   │</span></span>
<span class="line"><span>│  │  ├───────┼─────────────────────┼─────────────────────────────┤   │</span></span>
<span class="line"><span>│  │  │ 数据量 │ 无限制              │ &lt; 1MB                       │   │</span></span>
<span class="line"><span>│  │  │ 搜索  │ 手动                   │ 按键查找                    │   │</span></span>
<span class="line"><span>│  │  │ 类型  │ 任意类型              │ Property List              │   │</span></span>
<span class="line"><span>│  │  │ 线程  │ 需手动加锁            │ 自动线程安全                │   │</span></span>
<span class="line"><span>│  │  │ 性能  │ 慢（磁盘 IO）          │ 快（内存缓存）              │   │</span></span>
<span class="line"><span>│  │  └───────┴──────────────────────┴─────────────────────────────┘   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  文件性能优化：                                                    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 批量写入（减少 IO 次数）                                      │</span></span>
<span class="line"><span>│  │  • 异步写入（DispatchQueue.global）                            │</span></span>
<span class="line"><span>│  │  • 文件压缩（减少磁盘空间）                                    │</span></span>
<span class="line"><span>│  │  • 文件分片（大文件分块存储）                                    │</span></span>
<span class="line"><span>│  │  • 使用 NSURLSession.downloadTask 替代手动下载                  │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_3-codable-全栈深度" tabindex="-1">3. Codable 全栈深度 <a class="header-anchor" href="#_3-codable-全栈深度" aria-label="Permalink to &quot;3. Codable 全栈深度&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Codable 全栈分析：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Codable 核心：                                                    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // Codable = Decodable + Encodable                         │</span></span>
<span class="line"><span>│  │  • Encodable：将对象编码为 JSON/XML/Data                      │</span></span>
<span class="line"><span>│  │  • Decodable：将 JSON/XML/Data 解码为对象                    │</span></span>
<span class="line"><span>│  │  • 基于类型安全和协议导向                                      │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  基本用法：                                                   │</span></span>
<span class="line"><span>│  │  struct User: Codable {                                     │</span></span>
<span class="line"><span>│  │      let id: Int                                               │</span></span>
<span class="line"><span>│  │      let name: String                                          │</span></span>
<span class="line"><span>│  │      let email: String                                         │</span></span>
<span class="line"><span>│  │  }                                                             │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 编码：对象 → JSON / Data                                │</span></span>
<span class="line"><span>│  │  let encoder = JSONEncoder()                                 │</span></span>
<span class="line"><span>│  │  encoder.dateEncodingStrategy = .iso8601                     │</span></span>
<span class="line"><span>│  │  encoder.keyEncodingStrategy = .convertToSnakeCase            │</span></span>
<span class="line"><span>│  │  let data = try encoder.encode(user)                         │</span></span>
<span class="line"><span>│  │  let json = String(data: data, encoding: .utf8)!            │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 解码：JSON / Data → 对象                                  │</span></span>
<span class="line"><span>│  │  let decoder = JSONDecoder()                                 │</span></span>
<span class="line"><span>│  │  decoder.dateDecodingStrategy = .iso8601                     │</span></span>
<span class="line"><span>│  │  decoder.keyDecodingStrategy = .convertFromSnakeCase          │</span></span>
<span class="line"><span>│  │  let user = try decoder.decode(User.self, from: data)        │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 自定义编码键                                            │</span></span>
<span class="line"><span>│  │  enum CodingKeys: String, CodingKey {                       │</span></span>
<span class="line"><span>│  │      case id = &quot;user_id&quot;                                     │</span></span>
<span class="line"><span>│  │      case name = &quot;full_name&quot;                                 │</span></span>
<span class="line"><span>│  │      case email                                              │</span></span>
<span class="line"><span>│  │  }                                                             │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 日期编码策略                                            │</span></span>
<span class="line"><span>│  │  .iso8601 — ISO 8601 格式                                   │</span></span>
<span class="line"><span>│  │  .secondsSince1970 — Unix 时间戳                            │</span></span>
<span class="line"><span>│  │  .millisecondsSince1970 — 毫秒时间戳                         │</span></span>
<span class="line"><span>│  │  .formatted(DateFormatter) — 自定义格式                      │</span></span>
<span class="line"><span>│  │  .custom — 自定义闭包                                        │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 字符串编码策略                                          │</span></span>
<span class="line"><span>│  │  .useDefaultKeys — 默认键名                                   │</span></span>
<span class="line"><span>│  │  .convertToSnakeCase — snake_case                             │</span></span>
<span class="line"><span>│  │  .convertToCapitalizedCase — CapitalizedCase                 │</span></span>
<span class="line"><span>│  │  .convertToPascalCase — PascalCase                           │</span></span>
<span class="line"><span>│  │  .lowercaseFirstLetter — lowercaseFirstLetter                │</span></span>
<span class="line"><span>│  │  .custom — 自定义闭包                                        │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  // 自定义编码实现                                          │</span></span>
<span class="line"><span>│  │  struct CustomDate: Codable {                               │</span></span>
<span class="line"><span>│  │      let date: Date                                          │</span></span>
<span class="line"><span>│  │      enum CodingKeys: String, CodingKey {                   │</span></span>
<span class="line"><span>│  │          case date                                           │</span></span>
<span class="line"><span>│  │      }                                                       │</span></span>
<span class="line"><span>│  │      init(from decoder: Decoder) throws {                   │</span></span>
<span class="line"><span>│  │          let container = try decoder.container(keyedBy: CodingKeys.self)  │</span></span>
<span class="line"><span>│  │          let dateString = try container.decode(String.self, forKey: .date)  │</span></span>
<span class="line"><span>│  │          let formatter = DateFormatter()                     │</span></span>
<span class="line"><span>│  │          formatter.dateFormat = &quot;yyyy-MM-dd&quot;                  │</span></span>
<span class="line"><span>│  │          date = formatter.date(from: dateString)!              │</span></span>
<span class="line"><span>│  │      }                                                       │</span></span>
<span class="line"><span>│  │      func encode(to encoder: Encoder) throws {              │</span></span>
<span class="line"><span>│  │          var container = encoder.container(keyedBy: CodingKeys.self)  │</span></span>
<span class="line"><span>│  │          let formatter = DateFormatter()                     │</span></span>
<span class="line"><span>│  │          formatter.dateFormat = &quot;yyyy-MM-dd&quot;                 │</span></span>
<span class="line"><span>│  │          try container.encode(formatter.string(from: date), forKey: .date)  │</span></span>
<span class="line"><span>│  │      }                                                       │</span></span>
<span class="line"><span>│  │  }                                                           │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Codable 性能分析：                                                │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 编码：O(n)（n = 属性数量）                                │</span></span>
<span class="line"><span>│  │  • 解码：O(n)（n = 属性数量）                                │</span></span>
<span class="line"><span>│  │  • 编译期生成代码（零运行时开销）                              │</span></span>
<span class="line"><span>│  │  • 适合中小型对象编码/解码                                    │</span></span>
<span class="line"><span>│  │  • 大数据量编码：考虑流式编码（JSONEncoder.outputFormatting）    │</span></span>
<span class="line"><span>│  │  • 建议：使用 .sortedKeys 排序键以减小 JSON 体积              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Codable 的局限性：                                               │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 不支持所有类型（需 conforming Codable）                     │</span></span>
<span class="line"><span>│  │  • 不支持可选类型的自定义编码                                  │</span></span>
<span class="line"><span>│  │  • 不支持循环引用对象                                          │</span></span>
<span class="line"><span>│  │  • 不支持泛型类型（需额外处理）                                │</span></span>
<span class="line"><span>│  │  • 不支持 @objc 属性自动桥接                                  │</span></span>
<span class="line"><span>│  │  • 解决：实现自定义 init(from:) 和 encode(to:)              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Codable 替代方案：                                               │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • ObjectMapper — 更灵活的编码                                │</span></span>
<span class="line"><span>│  │  • Mantle — 底层编码                                            │</span></span>
<span class="line"><span>│  │  • SwiftData（iOS 17+）— 原生数据持久化                       │</span></span>
<span class="line"><span>│  │  • Realm — 移动端数据库                                         │</span></span>
<span class="line"><span>│  │  • CoreData — 官方数据持久化                                    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Codable vs ObjectMapper 对比：                                    │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  特性        │ Codable          │ ObjectMapper                  │   │</span></span>
<span class="line"><span>│  │  ├───────────┼───────────────────┼─────────────────────────────┤   │</span></span>
<span class="line"><span>│  │  类型安全    │ ✅ 编译期         │ ❌ 运行时                    │   │</span></span>
<span class="line"><span>│  │  编码速度    │ 快（编译器生成）     │ 慢（反射 + 字符串匹配）       │   │</span></span>
<span class="line"><span>│  │  灵活性      │ 中                │ 高                         │   │</span></span>
<span class="line"><span>│  │  学习成本    │ 低                  │ 中                        │   │</span></span>
<span class="line"><span>│  │  适用场景    │ 通用编码            │ 复杂/特殊编码              │   │</span></span>
<span class="line"><span>│  │  推荐        │ ✅ 首选             │ 需要特殊编码时才用          │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_4-keychain-安全存储" tabindex="-1">4. Keychain 安全存储 <a class="header-anchor" href="#_4-keychain-安全存储" aria-label="Permalink to &quot;4. Keychain 安全存储&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Keychain 安全存储深度分析：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Keychain 的核心：                                                  │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • iOS 最安全的存储机制                                       │</span></span>
<span class="line"><span>│  │  • 数据加密存储在安全的硬件区域                                   │</span></span>
<span class="line"><span>│  │  • 设备锁定后数据仍然安全                                     │</span></span>
<span class="line"><span>│  │  • 跨 App 共享（需要 App Group）                               │</span></span>
<span class="line"><span>│  │  • 支持 iCloud 同步                                          │</span></span>
<span class="line"><span>│  │  • 不适合存储大数据（每项目约 5KB 限制）                        │</span></span>
<span class="line"><span>│  │  • 使用 Keychain API 管理                                       │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  Keychain 的安全特性：                                        │</span></span>
<span class="line"><span>│  │  • 设备锁定后数据加密                                         │</span></span>
<span class="line"><span>│  │  • 设备丢失后数据不可访问                                      │</span></span>
<span class="line"><span>│  │  • 不支持明文访问                                             │</span></span>
<span class="line"><span>│  │  • 支持 Face ID / Touch ID 验证                               │</span></span>
<span class="line"><span>│  │  • 支持 App Group 共享                                        │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  Keychain 的适用场景：                                        │</span></span>
<span class="line"><span>│  │  • 密码、token、密钥存储                                      │</span></span>
<span class="line"><span>│  │  • 认证信息                                                 │</span></span>
<span class="line"><span>│  │  • 敏感配置数据                                              │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  Keychain 的限制：                                            │</span></span>
<span class="line"><span>│  │  • 每项目约 5KB 存储限制                                      │</span></span>
<span class="line"><span>│  │  • 不支持大数据存储                                           │</span></span>
<span class="line"><span>│  │  • 不支持结构化数据（只能存储 key-value）                      │</span></span>
<span class="line"><span>│  │  • API 使用复杂                                             │</span></span>
<span class="line"><span>│  │  • iCloud 同步有容量限制                                     │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Keychain 的使用：                                                  │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  // Keychain API 使用                                              │</span></span>
<span class="line"><span>│  │  class KeychainManager {                                       │</span></span>
<span class="line"><span>│  │      private let service = &quot;com.app.service&quot;                    │</span></span>
<span class="line"><span>│  │      private let accessGroup = &quot;com.app.group&quot;                  │</span></span>
<span class="line"><span>│  │      private let keychain = SecKeychain.default                  │</span></span>
<span class="line"><span>│  │      private let keychainAccess = SecKeychain.default               │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │      // 存储                                                    │</span></span>
<span class="line"><span>│  │      func save(key: String, value: Data) -&gt; Bool {           │</span></span>
<span class="line"><span>│  │          let query: [String: Any] = [                         │</span></span>
<span class="line"><span>│  │              kSecClass as String: kSecClassGenericPassword,     │</span></span>
<span class="line"><span>│  │              kSecAttrService as String: service,                │</span></span>
<span class="line"><span>│  │              kSecAttrAccount as String: key,                    │</span></span>
<span class="line"><span>│  │              kSecValueData as String: value,                    │</span></span>
<span class="line"><span>│  │              kSecAttrAccessGroup as String: accessGroup,        │</span></span>
<span class="line"><span>│  │              kSecAttrAccessible as String: kSecAttrWhenUnlocked,  │</span></span>
<span class="line"><span>│  │          ]                                                    │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │          // 先删除已有的                                           │</span></span>
<span class="line"><span>│  │          SecItemDelete(query as CFDictionary)                  │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │          let status = SecItemAdd(query as CFDictionary, nil)  │</span></span>
<span class="line"><span>│  │          return status == errSecSuccess                        │</span></span>
<span class="line"><span>│  │      }                                                         │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │      // 读取                                                    │</span></span>
<span class="line"><span>│  │      func load(key: String) -&gt; Data? {                       │</span></span>
<span class="line"><span>│  │          let query: [String: Any] = [                         │</span></span>
<span class="line"><span>│  │              kSecClass as String: kSecClassGenericPassword,     │</span></span>
<span class="line"><span>│  │              kSecAttrService as String: service,                │</span></span>
<span class="line"><span>│  │              kSecAttrAccount as String: key,                    │</span></span>
<span class="line"><span>│  │              kSecReturnData as String: true,                    │</span></span>
<span class="line"><span>│  │              kSecMatchLimit as String: kSecMatchLimitOne,       │</span></span>
<span class="line"><span>│  │          ]                                                    │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │          var result: AnyObject?                               │</span></span>
<span class="line"><span>│  │          let status = SecItemCopyMatching(query as CFDictionary, &amp;result)  │</span></span>
<span class="line"><span>│  │          return status == errSecSuccess ? result as? Data : nil  │</span></span>
<span class="line"><span>│  │      }                                                         │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │      // 删除                                                    │</span></span>
<span class="line"><span>│  │      func delete(key: String) -&gt; Bool {                       │</span></span>
<span class="line"><span>│  │          let query: [String: Any] = [                         │</span></span>
<span class="line"><span>│  │              kSecClass as String: kSecClassGenericPassword,     │</span></span>
<span class="line"><span>│  │              kSecAttrService as String: service,                │</span></span>
<span class="line"><span>│  │              kSecAttrAccount as String: key,                    │</span></span>
<span class="line"><span>│  │          ]                                                    │</span></span>
<span class="line"><span>│  │          let status = SecItemDelete(query as CFDictionary)    │</span></span>
<span class="line"><span>│  │          return status == errSecSuccess                        │</span></span>
<span class="line"><span>│  │      }                                                         │</span></span>
<span class="line"><span>│  │  }                                                           │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  ⚠️ 使用提示：                                                  │</span></span>
<span class="line"><span>│  │  • 使用 KeychainItemWrapper 或 SAMKeychain 等封装库简化 API  │</span></span>
<span class="line"><span>│  │  • 不要存储超过 5KB 的数据                                    │</span></span>
<span class="line"><span>│  │  • 使用 kSecAttrAccessibleWhenUnlocked 提高安全性              │</span></span>
<span class="line"><span>│  │  • 使用 App Group 实现多 App 共享                             │</span></span>
<span class="line"><span>│  │  • 不要硬编码 service 和 accessGroup 名称                    │</span></span>
<span class="line"><span>│  │  • 使用 Entitlements 文件配置 App Group                      │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Keychain vs UserDefaults vs 文件：                                  │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  特性        │ Keychain         │ UserDefaults  │ 文件存储     │   │</span></span>
<span class="line"><span>│  │  ├───────────┼───────────────────┼──────────────┼───────────┤   │</span></span>
<span class="line"><span>│  │  安全性      │ ✅ 最高（硬件加密） │ ❌ 明文      │ ⚠️ 可配置  │   │</span></span>
<span class="line"><span>│  │  存储限制    │ ~5KB              │ ~1MB          │ 无限制      │   │</span></span>
<span class="line"><span>│  │  数据类型    │ Data               │ Property List │ 任意类型    │   │</span></span>
<span class="line"><span>│  │  线程安全    │ ✅ 安全             │ ✅ 安全      │ 需加锁     │   │</span></span>
<span class="line"><span>│  │  共享       │ 需要 App Group      │ 无需共享      │ 需手动      │   │</span></span>
<span class="line"><span>│  │  性能       │ 中等                 │ 快           │ 慢          │   │</span></span>
<span class="line"><span>│  │  推荐场景    │ 密码/token          │ 配置         │ 大文件      │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  Keychain 性能分析：                                                │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  • 读取：约 1-5ms（加密解密开销）                              │</span></span>
<span class="line"><span>│  │  • 写入：约 5-10ms（加密 + 存储）                              │</span></span>
<span class="line"><span>│  │  • 删除：约 1-3ms                                            │</span></span>
<span class="line"><span>│  │  • 建议：批量操作、异步执行、缓存常用数据                      │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_5-缓存策略" tabindex="-1">5. 缓存策略 <a class="header-anchor" href="#_5-缓存策略" aria-label="Permalink to &quot;5. 缓存策略&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>缓存策略深度分析：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  缓存层级：                                                       │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  1. 内存缓存（Memory Cache）                                 │</span></span>
<span class="line"><span>│  │  • 最快（O(1) 查找）                                          │</span></span>
<span class="line"><span>│  │  • 容量有限（约 100-200MB）                                   │</span></span>
<span class="line"><span>│  │  • App 退出后数据丢失                                         │</span></span>
<span class="line"><span>│  │  • 实现：NSCache、NSDictionary、自定义字典                   │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  2. 磁盘缓存（Disk Cache）                                    │</span></span>
<span class="line"><span>│  │  • 持久化存储                                                 │</span></span>
<span class="line"><span>│  │  • 速度慢（磁盘 IO）                                          │</span></span>
<span class="line"><span>│  │  • App 退出后数据保留                                        │</span></span>
<span class="line"><span>│  │  • 实现：FileManager、CoreData、SQLite                       │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  3. 网络缓存（Network Cache）                                 │</span></span>
<span class="line"><span>│  │  • URLSession 自动缓存                                       │</span></span>
<span class="line"><span>│  │  • 实现：NSURLCache（内存）、NSURLSession（磁盘）             │</span></span>
<span class="line"><span>│  │  • 策略：.cacheWhenAvailable、.reloadIgnoringLocalCacheData  │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  内存缓存实现：                                                │</span></span>
<span class="line"><span>│  │  ┌─────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  │  // NSCache（推荐 ✅）                                      │   │</span></span>
<span class="line"><span>│  │  │  let cache = NSCache&lt;NSString, UIImage&gt;()                   │</span></span>
<span class="line"><span>│  │  │  cache.totalCostLimit = 100 * 1024 * 1024  // 100MB       │</span></span>
<span class="line"><span>│  │  │  cache.countLimit = 100  // 最多 100 个对象                 │</span></span>
<span class="line"><span>│  │  │  cache.setObject(image, forKey: key as NSString)             │</span></span>
<span class="line"><span>│  │  │  let cached = cache.object(forKey: key as NSString)         │</span></span>
<span class="line"><span>│  │  │                                                             │</span></span>
<span class="line"><span>│  │  │  // 自定义内存缓存（LLR 替换）                              │</span></span>
<span class="line"><span>│  │  │  class LRUCache&lt;K: Hashable, V&gt; {                         │</span></span>
<span class="line"><span>│  │  │      private var cache = [K: V]()                            │</span></span>
<span class="line"><span>│  │  │      private let maxCost: Int                               │</span></span>
<span class="line"><span>│  │  │      private var totalCost = 0                              │</span></span>
<span class="line"><span>│  │  │                                                             │</span></span>
<span class="line"><span>│  │  │      func get(key: K) -&gt; V? {                            │</span></span>
<span class="line"><span>│  │  │          return cache[key]                                 │</span></span>
<span class="line"><span>│  │  │      }                                                      │</span></span>
<span class="line"><span>│  │  │                                                             │</span></span>
<span class="line"><span>│  │  │      func set(key: K, value: V, cost: Int) {             │</span></span>
<span class="line"><span>│  │  │          cache[key] = value                                 │</span></span>
<span class="line"><span>│  │  │          totalCost += cost                                  │</span></span>
<span class="line"><span>│  │  │          while totalCost &gt; maxCost {                       │</span></span>
<span class="line"><span>│  │  │              cache.removeValue(forKey: cache.keys.first!)   │</span></span>
<span class="line"><span>│  │  │          }                                                  │</span></span>
<span class="line"><span>│  │  │      }                                                      │</span></span>
<span class="line"><span>│  │  │  }                                                         │</span></span>
<span class="line"><span>│  │  └──────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  缓存策略：                                                  │</span></span>
<span class="line"><span>│  │  • LRU（Least Recently Used）— 最久未用优先替换               │</span></span>
<span class="line"><span>│  │  • LFU（Least Frequently Used）— 最少使用优先替换              │</span></span>
<span class="line"><span>│  │  • FIFO（First In First Out）— 先进先出                      │</span></span>
<span class="line"><span>│  │  • TTL（Time To Live）— 过期时间                             │</span></span>
<span class="line"><span>│  │  • ARC（Auto Size Cache）— 自动大小                          │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  缓存命中率分析：                                            │</span></span>
<span class="line"><span>│  │  ┌─────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  │  • 内存缓存命中率 &gt; 90%（热点数据）                         │</span></span>
<span class="line"><span>│  │  │  • 磁盘缓存命中率 &gt; 70%（持久化数据）                        │</span></span>
<span class="line"><span>│  │  │  • 网络缓存命中率 &gt; 50%（API 响应）                         │</span></span>
<span class="line"><span>│  │  │  • 建议：热点数据存内存，非热点数据存磁盘                      │</span></span>
<span class="line"><span>│  │  │  • 缓存失效：TTL、容量限制、显式清除                          │</span></span>
<span class="line"><span>│  │  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  URLCache 配置：                                             │</span></span>
<span class="line"><span>│  │  ┌───────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  │  let cache = URLCache(memoryCapacity: 50 * 1024 * 1024,  │</span></span>
<span class="line"><span>│  │  │                       diskCapacity: 100 * 1024 * 1024,     │</span></span>
<span class="line"><span>│  │  │                       diskPath: nil)                       │</span></span>
<span class="line"><span>│  │  │                                                             │</span></span>
<span class="line"><span>│  │  │  let config = URLSessionConfiguration.default             │</span></span>
<span class="line"><span>│  │  │  config.urlCache = cache                                    │</span></span>
<span class="line"><span>│  │  │  config.requestCachePolicy = .useProtocolCachePolicy        │</span></span>
<span class="line"><span>│  │  └───────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│  │                                                                │</span></span>
<span class="line"><span>│  │  缓存最佳实践：                                               │</span></span>
<span class="line"><span>│  │  • 设置合理的容量上限                                           │</span></span>
<span class="line"><span>│  │  • 使用 NSCache（自动管理内存）                                 │</span></span>
<span class="line"><span>│  │  • 缓存热点数据（图片、列表数据）                               │</span></span>
<span class="line"><span>│  │  • 定期清理过期缓存                                           │</span></span>
<span class="line"><span>│  │  • 使用 URLCache 处理网络响应                                  │</span></span>
<span class="line"><span>│  │  • 缓存前检查数据类型兼容性                                    │</span></span>
<span class="line"><span>│  │  • 使用异步加载和缓存                                            │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_6-归档与编码" tabindex="-1">6. 归档与编码 <a class="header-anchor" href="#_6-归档与编码" aria-label="Permalink to &quot;6. 归档与编码&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>归档与编码深度分析：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  归档（Archive）的核心：                                             │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  • NSKeyedArchiver/NSKeyedUnarchiver 实现对象归档                   │</span></span>
<span class="line"><span>│  │  • 基于 NSCoding 协议                                             │</span></span>
<span class="line"><span>│  │  • 适合存储自定义对象                                              │</span></span>
<span class="line"><span>│  │  • 编码：对象 → Data                                              │</span></span>
<span class="line"><span>│  │  • 解码：Data → 对象                                               │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  NSCoding 协议：                                                │</span></span>
<span class="line"><span>│  │  ┌───────────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  │  protocol NSCoding {                                           │</span></span>
<span class="line"><span>│  │  │      init?(coder aDecoder: NSCoder)                            │</span></span>
<span class="line"><span>│  │  │      func encode(with aCoder: NSCoder)                          │</span></span>
<span class="line"><span>│  │  │  }                                                             │</span></span>
<span class="line"><span>│  │  │                                                                │</span></span>
<span class="line"><span>│  │  │  // 编码实现                                                  │</span></span>
<span class="line"><span>│  │  │  func encode(with aCoder: NSCoder) {                           │</span></span>
<span class="line"><span>│  │  │      aCoder.encode(id, forKey: &quot;id&quot;)                            │</span></span>
<span class="line"><span>│  │  │      aCoder.encode(name, forKey: &quot;name&quot;)                        │</span></span>
<span class="line"><span>│  │  │  }                                                             │</span></span>
<span class="line"><span>│  │  │                                                                │</span></span>
<span class="line"><span>│  │  │  // 解码实现                                                  │</span></span>
<span class="line"><span>│  │  │  required init?(coder aDecoder: NSCoder) {                    │</span></span>
<span class="line"><span>│  │  │      id = aDecoder.decodeInteger(forKey: &quot;id&quot;)                 │</span></span>
<span class="line"><span>│  │  │      name = aDecoder.decodeObject(forKey: &quot;name&quot;) as? String   │</span></span>
<span class="line"><span>│  │  │  }                                                             │</span></span>
<span class="line"><span>│  │  └──────────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  NSCoding vs Codable 对比：                                    │</span></span>
<span class="line"><span>│  │  ┌───────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  │  特性        │ NSCoding               │  Codable               │  │</span></span>
<span class="line"><span>│  │  ├─────────────┼──────────────────────────┼──────────────────────┤  │</span></span>
<span class="line"><span>│  │  │ 类型安全      │ ❌ 运行时                  │ ✅ 编译期              │  │</span></span>
<span class="line"><span>│  │  │ 编码速度      │ 慢（反射 + 字符串）         │ 快（编译器生成）      │  │</span></span>
<span class="line"><span>│  │  │ 适用场景      │ UIKit 对象归档             │ 通用编码               │  │</span></span>
<span class="line"><span>│  │  │ 编码格式      │ 自定义二进制                  │ JSON/XML              │  │</span></span>
<span class="line"><span>│  │  │ 推荐        │ UIKit 对象（不可继承 Codable） │ 首选 ✅               │  │</span></span>
<span class="line"><span>│  │  └─────────────┴────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  归档的使用：                                                   │</span></span>
<span class="line"><span>│  │  ┌───────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  │  // 编码到文件                                                │</span></span>
<span class="line"><span>│  │  │  let data = try NSKeyedArchiver.archivedData(            │</span></span>
<span class="line"><span>│  │  │      withRootObject: myObject,                            │</span></span>
<span class="line"><span>│  │  │      requiringSecureCoding: true)                         │</span></span>
<span class="line"><span>│  │  │  try data.write(to: fileURL)                             │</span></span>
<span class="line"><span>│  │  │                                                             │</span></span>
<span class="line"><span>│  │  │  // 从文件解码                                                │</span></span>
<span class="line"><span>│  │  │  let data = try Data(contentsOf: fileURL)                  │</span></span>
<span class="line"><span>│  │  │  let myObject = try NSKeyedUnarchiver.unarchivedObject(  │</span></span>
<span class="line"><span>│  │  │      ofClass: MyObject.self,                              │</span></span>
<span class="line"><span>│  │  │      from: data)                                           │</span></span>
<span class="line"><span>│  │  └───────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│  │                                                                  │</span></span>
<span class="line"><span>│  │  性能分析：                                                   │</span></span>
<span class="line"><span>│  │  • 归档：O(n)（n = 属性数量）                                │</span></span>
<span class="line"><span>│  │  • 解码：O(n)（n = 属性数量）                                │</span></span>
<span class="line"><span>│  │  • 编码效率：比 Codable 慢 2-3x                              │</span></span>
<span class="line"><span>│  │  • 建议：使用 Codable（除非需要 UIKit 对象归档）              │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  编码方案对比：                                                   │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  方案          │ 安全性      │ 性能      │ 适用场景              │  │</span></span>
<span class="line"><span>│  │  ├─────────────┼───────────┼─────────┼────────────────────┤  │</span></span>
<span class="line"><span>│  │  Codable       │ ✅ 类型安全 │ ✅ 快     │ 通用编码（首选）       │  │</span></span>
<span class="line"><span>│  │  NSCoding      │ ❌ 运行时    │ ❌ 慢     │ UIKit 对象归档       │  │</span></span>
<span class="line"><span>│  │  ObjectMapper  │ ⚠️ 弱类型    │ ⚠️ 中等   │ 特殊编码需求        │  │</span></span>
<span class="line"><span>│  │  JSONEncoder   │ ✅ 类型安全 │ ✅ 快     │ JSON 编码（首选）    │  │</span></span>
<span class="line"><span>│  │  XMLDecoder    │ ✅ 类型安全 │ ⚠️ 中等   │ XML 编码              │  │</span></span>
<span class="line"><span>│  └─────────────┴───────────┴─────────┴────────────────────┘  │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  总结：                                                       │</span></span>
<span class="line"><span>│  • UserDefaults：小配置数据                                           │</span></span>
<span class="line"><span>│  • 文件：大文件、JSON/XML 数据                                     │</span></span>
<span class="line"><span>│  • Codable：编码解码首选                                             │</span></span>
<span class="line"><span>│  • Keychain：密码/token 存储                                       │</span></span>
<span class="line"><span>│  • NSCoding：UIKit 对象归档                                       │</span></span>
<span class="line"><span>│  • NSCache：内存缓存                                               │</span></span>
<span class="line"><span>│  • URLCache：网络缓存                                              │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>*/</span></span></code></pre></div><hr><h2 id="_7-面试考点汇总" tabindex="-1">7. 面试考点汇总 <a class="header-anchor" href="#_7-面试考点汇总" aria-label="Permalink to &quot;7. 面试考点汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: UserDefaults 的原理和限制？</strong></p><p><strong>答</strong>：</p><ul><li>基于键值对的配置存储，存储在 Library/Preferences</li><li>支持 Property List 类型，不适合大数据/敏感数据</li><li>每次读写同步到磁盘，数据量上限约 1MB</li><li>线程安全，单例模式</li></ul><p><strong>Q2: Codable 的核心机制？</strong></p><p><strong>答</strong>：</p><ul><li>Codable = Encodable + Decodable</li><li>编译期生成代码（零运行时开销）</li><li>支持日期编码策略、键编码策略、自定义编码</li><li>比 NSCoding 更快、更安全</li></ul><p><strong>Q3: Keychain 的安全特性？</strong></p><p><strong>答</strong>：</p><ul><li>硬件加密存储，设备锁定后不可访问</li><li>支持 Face ID / Touch ID 验证</li><li>每项目约 5KB 限制</li><li>支持 App Group 共享</li></ul><p><strong>Q4: 缓存策略有哪些？</strong></p><p><strong>答</strong>：</p><ul><li>三层缓存：内存、磁盘、网络</li><li>内存：NSCache（推荐）、自定义 LRU</li><li>磁盘：FileManager、CoreData、SQLite</li><li>网络：URLCache</li><li>策略：LRU、LFU、TTL、ARC</li></ul><p><strong>Q5: 数据持久化方案对比？</strong></p><p><strong>答</strong>：</p><ul><li>UserDefaults：小配置数据</li><li>文件：大文件、JSON/XML</li><li>Codable：编码首选</li><li>Keychain：密码/token</li><li>CoreData：复杂数据模型</li><li>SQLite：结构化查询</li></ul><hr><h2 id="_8-参考资源" tabindex="-1">8. 参考资源 <a class="header-anchor" href="#_8-参考资源" aria-label="Permalink to &quot;8. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/foundation/userdefaults" target="_blank" rel="noreferrer">Apple: UserDefaults Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/filemanager" target="_blank" rel="noreferrer">Apple: FileManager Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/archiving_and_serialization" target="_blank" rel="noreferrer">Apple: Codable Reference</a></li><li><a href="https://developer.apple.com/documentation/security/keychain_services" target="_blank" rel="noreferrer">Apple: Keychain Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/nskeyedarchiver" target="_blank" rel="noreferrer">Apple: Archive Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/nscache" target="_blank" rel="noreferrer">Apple: NSCache Reference</a></li><li><a href="https://developer.apple.com/documentation/foundation/urlcache" target="_blank" rel="noreferrer">Apple: URLCache Reference</a></li><li><a href="https://nshipster.com/codable" target="_blank" rel="noreferrer">NSHipster: Codable</a></li><li><a href="https://nshipster.com/keychain" target="_blank" rel="noreferrer">NSHipster: Keychain</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2020/10177/" target="_blank" rel="noreferrer">WWDC 2020: What&#39;s New in Data Persistence</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2021/10227/" target="_blank" rel="noreferrer">WWDC 2021: Advanced Data Persistence with SwiftData</a></li></ul>`,42)])])}const g=s(l,[["render",i]]);export{h as __pageData,g as default};
