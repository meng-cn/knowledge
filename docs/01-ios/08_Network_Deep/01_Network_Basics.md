# 01 - 网络基础

## 目录

1. [HTTP/HTTPS 原理](#1-httphttps-原理)
2. [URLSession 全栈](#2-urlsession-全栈)
3. [请求与响应处理](#3-请求与响应处理)
4. [上传下载与进度](#4-上传下载与进度)
5. [认证与安全](#5-认证与安全)
6. [超时重试与错误处理](#6-超时重试与错误处理)
7. [网络状态监测与缓存](#7-网络状态监测与缓存)
8. [ATS 与 SSL Pinning](#8-ats-与-ssl-pinning)
9. [面试考点汇总](#9-面试考点汇总)

---

## 1. HTTP/HTTPS 原理

```
HTTP/HTTPS 原理深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  HTTP 协议深度：                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  // HTTP 版本对比                                             │
│  │  ┌───────────┬───────┬──────────────┬───────┬───────┐      │   │
│  │  │ 特性      │ HTTP/1.1│ HTTP/2      │ HTTP/3  │ HTTPS │   │
│  │  ├───────────┼──────────┼──────────────┼──────────┼────────┤      │   │
│  │  │ 连接      │ TCP 长连接 │ 多路复用     │ QUIC    │ TCP+TLS │   │
│  │  │ 头部      │ 明文     │ 头部压缩      │ 头部压缩  │ 加密  │   │
│  │  │ 流      │ 串行    │ 多流并行      │ 多流并行  │ 加密  │   │
│  │  │ 优先级    │ 无      │ 流优先级      │ 流优先级  │ 加密  │   │
│  │  │ 服务器推送  │ 无      │ 支持         │ 支持     │ 加密  │   │
│  │  │ 安全性    │ 无      │ 无           │ 无       │ ✅   │   │
│  │  │ 延迟      │ 高     │ 中           │ 低       │ 中   │   │
│  │  └───────────┴──────────┴──────────────┴──────────┴────────┘      │   │
│  │                                                               │   │
│  │  HTTP 请求结构：                                                │
│  │  ┌────────────────────────────────────────────────────────────┐   │
│  │  │  请求行：METHOD URL HTTP/version                           │
│  │  │  请求头：Key: Value                                          │
│  │  │  请求体：Body                                               │
│  │  │                                                              │
│  │  │  常用方法：                                                  │
│  │  │  • GET — 获取资源                                            │
│  │  │  • POST — 提交资源                                           │
│  │  │  • PUT — 更新资源                                            │
│  │  │  • DELETE — 删除资源                                          │
│  │  │  • PATCH — 部分更新资源                                      │
│  │  │  • OPTIONS — 获取 CORS 信息                                │
│  │  │  • HEAD — 获取头部信息                                        │
│  │  └────────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  HTTP 响应结构：                                                │
│  │  ┌────────────────────────────────────────────────────────────┐   │
│  │  │  状态行：HTTP/version Status-Code Status-Text              │
│  │  │  响应头：Key: Value                                          │
│  │  │  响应体：Body                                               │
│  │  │                                                              │
│  │  │  状态码分类：                                              │
│  │  │  • 1xx — 信息性                                           │
│  │  │  • 2xx — 成功（200 OK, 201 Created, 204 No Content）     │
│  │  │  • 3xx — 重定向（301 Moved, 304 Not Modified）            │
│  │  │  • 4xx — 客户端错误（400 Bad Request, 401 Unauthorized）  │
│  │  │  • 5xx — 服务器错误（500 Internal, 502 Bad Gateway）      │
│  │  └────────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  HTTPS 原理：                                                 │
│  │  ┌────────────────────────────────────────────────────────────┐   │
│  │  │  // HTTPS 握手流程（TLS）                                     │
│  │  │  1. Client Hello — 客户端发送支持的加密套件                    │
│  │  │  2. Server Hello — 服务端选择加密套件                        │
│  │  │  3. Certificate — 服务端发送证书                              │
│  │  │  4. Certificate Verify — 服务端签名验证                      │
│  │  │  5. Client Key Exchange — 客户端生成预主密钥                │
│  │  │  6. Finished — 双方确认握手完成                             │
│  │  │  7. 数据传输 — 使用对称加密                                  │
│  │  │                                                              │
│  │  │  核心原理：                                               │
│  │  │  • 非对称加密（RSA/ECC）用于握手                            │
│  │  │  • 对称加密（AES）用于数据传输                              │
│  │  │  • 证书用于身份验证（CA 机构颁发）                        │
│  │  │  • 哈希算法用于完整性验证（SHA-256）                      │
│  │  │  • 签名防止中间人攻击                                      │
│  │  │                                                              │
│  │  │  常见攻击方式：                                           │
│  │  │  • 中间人攻击（MITM）— SSL Pinning 防御                   │
│  │  │  • 重放攻击 — Nonce/时间戳防御                           │
│  │  │  • DNS 劫持 — HTTPS + HSTS 防御                         │
│  │  │  • 证书伪造 — CA 验证 + 证书锁定                          │
│  │  └────────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  HTTP/2 多路复用原理：                                       │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  // HTTP/2 帧结构                                           │
│  │  │  ┌────────────────────────────────────────────────────┐   │
│  │  │  │  LENGTH (24 bits)                                  │   │
│  │  │  │  TYPE (8 bits) — HEADERS/PAYLOAD/DATA/RST_STREAM  │   │
│  │  │  │  RESERVED (1 bit)                                 │   │
│  │  │  │  FLAGS (8 bits)                                   │   │
│  │  │  │  STREAM ID (31 bits)                              │   │
│  │  │  └────────────────────────────────────────────────────┘   │
│  │  │                                                              │
│  │  │  // 与 HTTP/1.1 对比                                          │
│  │  │  • HTTP/1.1：串行请求，队头阻塞                              │
│  │  │  • HTTP/2：多路复用，无队头阻塞                              │
│  │  │  • HTTP/2：头部压缩（HPACK）                              │
│  │  │  • HTTP/2：服务器推送（Server Push）                      │
│  │  │  • HTTP/2：流优先级控制                                    │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  HTTP/3（QUIC）原理：                                        │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  • 基于 UDP（而非 TCP）                                   │
│  │  │  • 内置 TLS 1.3                                          │
│  │  │  • 多路复用（无队头阻塞）                                 │
│  │  │  • 连接迁移（IP 变化无缝切换）                           │
│  │  │  • 0-RTT 握手（快速连接）                               │
│  │  │  • 头部压缩（QPACK）                                   │
│  │  │  • iOS 15+ 支持 HTTP/3                                │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  HTTP 协议总结：                                              │
│  │  • HTTP/1.1：基础协议，串行请求                             │
│  │  • HTTP/2：多路复用，头部压缩，服务器推送                   │
│  │  • HTTP/3：基于 UDP，QUIC 协议，快速连接                   │
│  │  • HTTPS：TLS 加密，证书验证，安全传输                      │
│  │  • SSL Pinning：防止中间人攻击                              │
│  │  • HSTS：强制 HTTPS 连接                                  │
│  └────────────────────────────────────────────────────────────┘   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  HTTP/HTTPS 面试高频题：                                           │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  • GET vs POST 区别                                         │
│  │  • HTTP vs HTTPS 区别                                         │
│  │  • HTTP/2 多路复用原理                                       │
│  │  • HTTPS 握手流程                                          │
│  │  • SSL Pinning 原理                                       │
│  │  • HTTP/3 QUIC 协议原理                                    │
│  │  • HSTS 原理                                              │
│  │  • CORS 跨域问题                                           │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 2. URLSession 全栈

```
URLSession 全栈深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│  URLSession 核心：                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // URLSession 类型                                        │
│  │  • URLSession.shared — 共享实例                           │
│  │  • URLSession(configuration:) — 自定义配置               │
│  │  • URLSession(configuration: delegate: delegateQueue:) — 代理模式  │
│  │  • URLSession(configuration: delegateQueue: identifier:) — 命名实例  │
│  │  • URLSession.background — 后台传输                      │
│  │  • URLSession.ephemeral — 临时实例（不缓存）              │
│  │                                                               │   │
│  │  // URLSession 配置                                             │
│  │  let config = URLSessionConfiguration.default              │
│  │  config.timeoutIntervalForRequest = 30                      │
│  │  config.timeoutIntervalForResource = 60                     │
│  │  config.httpAdditionalHeaders = ["Content-Type": "application/json"]  │
│  │  config.urlCache = URLCache(memoryCapacity: 50*1024*1024,   │
│  │          diskCapacity: 100*1024*1024, diskPath: nil)        │
│  │  config.waitsForConnectivity = true                       │
│  │  config.httpMaximumConnectionsPerHost = 6                   │
│  │  config.requestCachePolicy = .useProtocolCachePolicy         │
│  │                                                               │   │
│  │  // URLSession Task 类型                                    │
│  │  • dataTask — 数据任务                                    │
│  │  • downloadTask — 下载任务                                  │
│  │  • uploadTask — 上传任务                                    │
│  │  • dataTaskWithRequest — 请求任务                            │
│  │  • downloadTaskWithRequest — 请求下载任务                    │
│  │  • uploadTaskWithRequest — 请求上传任务                      │
│  │  • task(for: UUID) — 根据 UUID 获取任务                    │
│  │                                                               │   │
│  │  // URLSession Task 方法                                     │
│  │  let task = URLSession.shared.dataTask(with: url) {         │
│  │      data, response, error in                              │
│  │      if let error = error {                                │
│  │          print("Error: \(error)")                           │
│  │          return                                             │
│  │      }                                                       │
│  │      if let data = data {                                  │
│  │          // 处理数据                                          │
│  │      }                                                       │
│  │  }                                                          │
│  │  task.resume()  // 启动任务                                  │
│  │                                                               │   │
│  │  // URLSession 代理方法                                     │
│  │  func urlSession(_ session: URLSession,                    │
│  │      dataTask: URLSessionDataTask,                        │
│  │      didReceive response: URLResponse,                     │
│  │      completionHandler: @escaping (URLSession.)            │
│  │      -> Void) {                                             │
│  │      completionHandler(.allow)                              │
│  │  }                                                         │
│  │                                                               │   │
│  │  // URLSession 错误处理                                       │
│  │  if let error = error as? URLError {                        │
│  │      switch error.code {                                   │
│  │      case .notConnectedToInternet:                          │
│  │          print("无网络连接")                                 │
│  │      case .networkConnectionLost:                           │
│  │          print("网络连接丢失")                               │
│  │      case .timedOut:                                       │
│  │          print("请求超时")                                   │
│  │      case .secureConnectionFailed:                          │
│  │          print("SSL 错误")                                   │
│  │      default:                                               │
│  │          print("其他错误: \(error)")                        │
│  │      }                                                      │
│  │  }                                                         │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  URLSession 配置类型对比：                                    │
│  │  ┌───────────┬──────────────┬───────────┬──────────────┐   │   │
│  │  │ 配置类型   │ 缓存         │ cookie   │ 代理         │   │   │
│  │  ├───────────┼──────────────┼───────────┼──────────────┤   │   │
│  │  │ .default  │ 持久化        │ 持久化     │ 用户默认     │   │   │
│  │  │ .ephemeral│ 无缓存        │ 无 cookie  │ 无代理       │   │   │
│  │  │ .background│ 持久化       │ 无 cookie  │ 后台传输     │   │   │
│  │  │ .custom   │ 自定义        │ 自定义     │ 自定义       │   │   │
│  │  └───────────┴──────────────┴───────────┴──────────────┘   │   │
│  │                                                               │   │
│  │  URLSession 最佳实践：                                       │
│  │  • 使用 shared 实例（单例）                                  │
│  │  • 自定义配置（timeout、cache、headers）                  │
│  │  • 使用代理方法处理响应                                       │
│  │  • 使用后台传输（大文件）                                   │
│  │  • 使用 ephemeral 实例（不缓存）                           │
│  │  • 错误处理（URLError）                                  │
│  │  • 超时设置（30s 请求、60s 资源）                         │
│  │  • 连接复用（HTTP/2 多路复用）                              │
│  │  • 缓存策略（按需缓存）                                  │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 3. 请求与响应处理

```
请求与响应处理深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│  请求处理：                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // URLRequest 构建                                         │
│  │  var request = URLRequest(url: url)                        │
│  │  request.httpMethod = "POST"                               │
│  │  request.httpBody = try? JSONEncoder().encode(body)        │
│  │  request.setValue("application/json", forHTTPHeaderField: "Content-Type")  │
│  │  request.setValue("Bearer token", forHTTPHeaderField: "Authorization")  │
│  │  request.setValue("gzip", forHTTPHeaderField: "Accept-Encoding")  │
│  │  request.timeoutInterval = 30                              │
│  │                                                               │   │
│  │  // 响应处理                                                │
│  │  if let httpResponse = response as? HTTPURLResponse {      │
│  │      print("Status: \(httpResponse.statusCode)")           │
│  │      print("Headers: \(httpResponse.allHeaderFields)")     │
│  │  }                                                         │
│  │                                                               │   │
│  │  // JSON 解析                                              │
│  │  do {                                                      │
│  │      let json = try JSONSerialization.jsonObject(         │
│  │          with: data, options: []) as? [String: Any]        │
│  │      // 处理 JSON                                           │
│  │  } catch {                                                │
│  │      print("JSON 解析错误: \(error)")                       │
│  │  }                                                         │
│  │                                                               │   │
│  │  // Codable 解析                                            │
│  │  do {                                                      │
│  │      let user = try JSONDecoder().decode(User.self, from: data)  │
│  │      // 处理 user                                          │
│  │  } catch {                                                │
│  │      print("Codable 解析错误: \(error)")                    │
│  │  }                                                         │
│  │                                                               │   │
│  │  ⚠️ 编码问题：                                                │
│  │  • 响应编码（Content-Encoding）：gzip/deflate/brotli      │
│  │  • 响应类型（Content-Type）：application/json             │
│  │  • 响应字符集（Content-Charset）：UTF-8/GBK               │
│  │  • 响应长度（Content-Length）：传输长度                     │
│  │  • 响应缓存（Cache-Control）：no-cache/no-store           │
│  │  • 响应权限（Access-Control）：CORS 策略                  │
│  │  • 响应安全（Strict-Transport-Security）：HSTS             │
│  │  • 响应内容类型（Content-Disposition）：inline/attachment  │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  请求处理总结：                                               │
│  │  • 构建 URLRequest（method、headers、body）               │
│  │  • 设置 timeoutInterval（30s 请求）                        │
│  │  • 设置 Authorization 头（Bearer token）                   │
│  │  • 设置 Content-Type（application/json）                  │
│  │  • 设置 Accept-Encoding（gzip/brotli）                    │
│  │  • 处理响应（HTTPURLResponse）                           │
│  │  • 解析数据（JSONSerialization / Codable）                 │
│  │  • 错误处理（URLError）                                    │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 4. 上传下载与进度

```
上传下载与进度深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│  下载：                                                           │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // 数据下载                                                │
│  │  URLSession.shared.dataTask(with: url) { data, _, _ in    │
│  │      // 处理下载数据                                        │
│  │  }.resume()                                                 │
│  │                                                               │   │
│  │  // 文件下载                                                │
│  │  URLSession.shared.downloadTask(with: url) { url, _, _ in │
│  │      // 下载完成，保存文件                                    │
│  │      try? FileManager.default.moveItem(                    │
│  │          at: url!,                                           │
│  │          to: documentsURL.appendingPathComponent("file.txt"))  │
│  │  }.resume()                                                 │
│  │                                                               │   │
│  │  // 后台下载                                                │
│  │  let config = URLSessionConfiguration.background(         │
│  │      withIdentifier: "com.app.background")                 │
│  │  let session = URLSession(configuration: config)            │
│  │  session.downloadTask(with: url).resume()                  │
│  │                                                               │   │
│  │  // 进度监听                                                │
│  │  URLSession.shared.dataTask(with: url) { data, _, _ in    │
│  │      // 处理数据                                            │
│  │  } progress: { downloaded, total in                         │
│  │      let progress = Double(downloaded) / Double(total) * 100  │
│  │      print("下载进度: \(progress)%")                       │
│  │  }.resume()                                                 │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  上传：                                                       │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  // 数据上传                                                │
│  │  │  let data = "body".data(using: .utf8)                    │
│  │  │  URLSession.shared.uploadTask(with: request) {           │
│  │  │      data, response, error in                            │
│  │  │      // 处理上传结果                                      │
│  │  │  }.resume()                                               │
│  │  │                                                             │
│  │  │  // 文件上传                                              │
│  │  │  let fileURL = documentsURL.appendingPathComponent("file.jpg")  │
│  │  │  URLSession.shared.uploadTask(with: request,           │
│  │  │      fromFile: fileURL) { data, response, error in       │
│  │  │      // 处理上传结果                                      │
│  │  │  }.resume()                                               │
│  │  │                                                             │
│  │  │  // 多部分上传                                              │
│  │  │  let boundary = UUID().uuidString                        │
│  │  │  request.setValue("multipart/form-data; boundary=\(boundary)",  │
│  │  │      forHTTPHeaderField: "Content-Type")                 │
│  │  │  let body = NSMutableData()                              │
│  │  │  body.append("--\(boundary)\r\n".data(using: .utf8)!)    │
│  │  │  body.append("Content-Disposition: form-data; name=\"file\"; filename=\"file.jpg\"\r\n")  │
│  │  │  body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)  │
│  │  │  body.append(fileData)                                    │
│  │  │  body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)  │
│  │  │  URLSession.shared.uploadTask(with: request, from: body) {  │
│  │  │      // 处理上传结果                                    │
│  │  │  }.resume()                                               │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  上传下载对比：                                              │
│  │  ┌───────┬───────────────┬───────────────┬───────────────┐   │
│  │  │ 特性   │ 下载           │ 上传           │ 进度           │   │
│  │  ├───────┼───────────────┼───────────────┼───────────────┤   │
│  │  │ URL   │ 从服务器获取    │ 发送到服务器    │ 无              │   │
│  │  │ 方法   │ GET/POST      │ POST/Multipart │ 无              │   │
│  │  │ 代理   │ downloadTask  │ uploadTask     │ dataTask        │   │
│  │  │ 进度   │ downloadTask.progress  │ uploadTask.progress  │ 手动计算       │   │
│  │  │ 后台  │ backgroundDownload  │ backgroundUpload  │ 无              │   │
│  │  └───────┴───────────────┴───────────────┴───────────────┘   │
│  │                                                               │   │
│  │  上传下载总结：                                               │
│  │  • 数据下载：dataTask                                         │
│  │  • 文件下载：downloadTask                                      │
│  │  • 数据上传：uploadTask                                        │
│  │  • 文件上传：uploadTask（multipart/form-data）              │
│  │  • 后台传输：background session                                │
│  │  • 进度监听：downloadTask/ uploadTask.progress              │
│  │  • 错误处理：URLError                                        │
│  │  • 超时设置：timeoutInterval                                  │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  上传下载总结：                                                   │
│  • 数据下载：dataTask                                              │
│  • 文件下载：downloadTask                                          │
│  • 数据上传：uploadTask                                             │
│  • 文件上传：uploadTask（multipart/form-data）                   │
│  • 后台传输：background session                                    │
│  • 进度监听：downloadTask/ uploadTask.progress                  │
│  • 错误处理：URLError                                            │
│  • 超时设置：timeoutInterval                                     │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 5. 认证与安全

```
认证与安全深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│  OAuth2 认证：                                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // OAuth2 流程                                           │
│  │  1. 客户端请求授权                                          │
│  │  2. 用户授权                                               │
│  │  3. 客户端获取授权码                                       │
│  │  4. 客户端使用授权码换取 Token                               │
│  │  5. 客户端使用 Token 访问资源                               │
│  │                                                               │   │
│  │  // Token 使用                                              │
│  │  request.setValue("Bearer \(token)",                       │
│  │      forHTTPHeaderField: "Authorization")                  │
│  │                                                               │   │
│  │  认证方案对比：                                             │
│  │  ┌───────┬───────────────┬───────────────┬───────────────┐   │
│  │  │ 方案  │ JWT           │ OAuth2        │ API Key       │   │
│  │  ├───────┼───────────────┼───────────────┼───────────────┤   │
│  │  │ 类型  │ 无状态 Token  │ 授权码流程     │ 简单密钥       │   │
│  │  │ 安全  │ 高            │ 高            │ 低            │   │
│  │  │ 适用  │ 分布式系统     │ 第三方授权     │ 内部 API     │   │
│  │  │ 过期  │ 可配置         │ 自动刷新      │ 手动          │   │
│  │  └───────┴───────────────┴───────────────┴───────────────┘   │
│  │                                                               │   │
│  │  SSL Pinning 原理：                                          │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  // SSL Pinning 实现                                          │
│  │  │  func urlSession(_ session: URLSession,                   │
│  │  │      didReceive challenge: URLAuthenticationChallenge,    │
│  │  │      completionHandler: @escaping (URLSession.             │
│  │  │      AuthChallengeDisposition, URLCredential?) -> Void) {  │
│  │  │      if challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust {  │
│  │  │          let serverTrust = challenge.protectionSpace.serverTrust!  │
│  │  │          let credential = URLCredential(trust: serverTrust)  │
│  │  │          completionHandler(.useCredential, credential)     │
│  │  │      } else {                                            │
│  │  │          completionHandler(.cancelAuthenticationChallenge, nil)  │
│  │  │      }                                                      │
│  │  │  }                                                        │
│  │  │                                                            │
│  │  │  // 证书验证                                             │
│  │  │  SecTrustEvaluate(serverTrust, &trustResult)              │
│  │  │  SecTrustGetCertificateCount(serverTrust)                 │
│  │  │  SecTrustGetCertificateAtIndex(serverTrust, 0)            │
│  │  │                                                            │
│  │  │  // SSL Pinning 方案                                        │
│  │  │  • 公钥锁定（PublicKey Pinning）                          │
│  │  │  • 证书锁定（Certificate Pinning）                      │
│  │  │  • 指纹锁定（Fingerprint Pinning）                      │
│  │  │  • 混合锁定（Hybrid Pinning）                          │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  认证与安全总结：                                             │
│  │  • OAuth2 认证流程（授权码、Token 刷新）                      │
│  │  • JWT Token（无状态认证）                                    │
│  │  • API Key（简单密钥认证）                                    │
│  │  • SSL Pinning（防止中间人攻击）                              │
│  │  • 证书验证（SecTrustEvaluate）                              │
│  │  • 公钥锁定（PublicKey Pinning）                              │
│  │  • 证书锁定（Certificate Pinning）                          │
│  │  • 指纹锁定（Fingerprint Pinning）                          │
│  │  • 混合锁定（Hybrid Pinning）                               │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  认证与安全总结：                                                 │
│  • OAuth2 认证流程（授权码、Token 刷新）                           │
│  • JWT Token（无状态认证）                                        │
│  • API Key（简单密钥认证）                                        │
│  • SSL Pinning（防止中间人攻击）                                    │
│  • 证书验证（SecTrustEvaluate）                                  │
│  • 公钥锁定（PublicKey Pinning）                                  │
│  • 证书锁定（Certificate Pinning）                              │
│  • 指纹锁定（Fingerprint Pinning）                              │
│  • 混合锁定（Hybrid Pinning）                                   │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 6. 超时重试与错误处理

```
超时重试与错误处理深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│  超时处理：                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // 超时处理                                                │
│  │  request.timeoutInterval = 30                              │
│  │  URLSession.shared.dataTask(with: url) { data, response, error in  │
│  │      if let error = error as? URLError {                 │
│  │          switch error.code {                             │
│  │          case .timedOut:                                   │
│  │              // 超时处理                                      │
│  │          case .notConnectedToInternet:                      │
│  │              // 无网络连接                                    │
│  │          case .networkConnectionLost:                      │
│  │              // 网络断开                                    │
│  │          default:                                         │
│  │              // 其他错误                                     │
│  │          }                                                 │
│  │      }                                                     │
│  │  }.resume()                                                │
│  │                                                               │   │
│  │  重试策略：                                                 │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  // 指数退避                                                │
│  │  │  func retry(with url: URL, maxRetries: Int = 3) {         │
│  │  │      for attempt in 0..<maxRetries {                      │
│  │  │          let delay = pow(2, Double(attempt)) * 1.0        │
│  │  │          DispatchQueue.global().asyncAfter(deadline: .now() + delay) {  │
│  │  │              // 执行请求                                    │
│  │  │              URLSession.shared.dataTask(with: url) { data, _, error in  │
│  │  │                  if error == nil { return }                │
│  │  │              }.resume()                                    │
│  │  │          }                                                 │
│  │  │      }                                                     │
│  │  │  }                                                        │
│  │  │                                                            │
│  │  │  // 重试策略对比                                            │
│  │  │  • 固定间隔：1s, 1s, 1s, 1s                            │
│  │  │  • 指数退避：1s, 2s, 4s, 8s, 16s                      │
│  │  │  • 随机退避：1-3s, 2-6s, 4-12s, 8-24s                 │
│  │  │  • 熔断器：连续失败 N 次后暂停 M 秒                        │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  重试策略总结：                                               │
│  │  • 固定间隔重试：简单但可能加剧网络压力                          │
│  │  • 指数退避：推荐方案，逐步增加重试间隔                         │
│  │  • 随机退避：避免雪崩效应                                     │
│  │  • 熔断器：连续失败后暂停，避免无效重试                        │
│  │  • 重试次数限制：最多 3-5 次                                  │
│  │  • 超时设置：30s 请求，60s 资源                               │
│  │  • URLError 处理：网络状态分类处理                            │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  超时重试总结：                                                   │
│  • 固定间隔：简单但加剧网络压力                                    │
│  • 指数退避：推荐方案                                          │
│  • 随机退避：避免雪崩效应                                       │
│  • 熔断器：连续失败后暂停                                        │
│  • 重试次数：3-5 次                                             │
│  • 超时：30s 请求，60s 资源                                    │
│  • URLError：网络状态分类处理                                     │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 7. 网络状态监测与缓存

```
网络状态监测与缓存深度分析：
┌───────────────────────────────────────────────────────────────────────┐
│  网络状态监测：                                                 │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // 网络状态监测                                             │
│  │  import Network                                             │
│  │  let monitor = NWPathMonitor()                              │
│  │  monitor.pathUpdateHandler = { path in                      │
│  │      if path.status == .satisfied {                        │
│  │          print("网络可用")                                  │
│  │      } else {                                              │
│  │          print("网络不可用")                                │
│  │      }                                                     │
│  │      if path.usesInterfaceType(.wifi) {                    │
│  │          print("Wi-Fi 网络")                                │
│  │      } else if path.usesInterfaceType(.cellular) {         │
│  │          print("蜂窝网络")                                  │
│  │      } else if path.usesInterfaceType(.wiredEthernet) {    │
│  │          print("有线网络")                                  │
│  │      }                                                     │
│  │  }                                                          │
│  │  monitor.start(queue: .global())                            │
│  │                                                               │   │
│  │  网络状态类型：                                              │
│  │  • .satisfied — 网络可用                                    │
│  │  • .unsatisfied — 网络不可用                                │
│  │  • .requiresConnection — 需要连接                           │
│  │  • .requiresLowLatency — 需要低延迟                        │
│  │                                                               │   │
│  │  网络类型：                                                │
│  │  • .wifi — Wi-Fi 网络                                    │
│  │  • .cellular — 蜂窝网络                                    │
│  │  • .wiredEthernet — 有线网络                              │
│  │  • .loopback — 回环地址                                    │
│  │  • .other — 其他网络类型                                   │
│  │                                                               │   │
│  │  缓存策略：                                                 │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  // URLCache（网络缓存）                                  │
│  │  │  let cache = URLCache(memoryCapacity: 50*1024*1024,      │
│  │  │      diskCapacity: 100*1024*1024, diskPath: nil)         │
│  │  │                                                            │
│  │  │  // 缓存策略                                              │
│  │  │  • .useProtocolCachePolicy — 按协议缓存策略              │
│  │  │  • .reloadIgnoringLocalCacheData — 忽略缓存              │
│  │  │  • .returnCacheDataElseLoad — 先缓存后加载                │
│  │  │  • .returnCacheDataDontLoad — 仅从缓存加载               │
│  │  │  • .reloadRevalidatingCacheData — 验证缓存               │
│  │  │                                                            │
│  │  │  // 自定义缓存                                            │
│  │  │  class NetworkCache {                                    │
│  │  │      private var cache = [URL: Data]()                    │
│  │  │      private let maxSize = 100 * 1024 * 1024             │
│  │  │      private var currentSize = 0                          │
│  │  │                                                            │
│  │  │      func get(url: URL) -> Data? {                      │
│  │  │          return cache[url]                               │
│  │  │      }                                                  │
│  │  │                                                            │
│  │  │      func set(url: URL, data: Data) {                   │
│  │  │          if currentSize + data.count > maxSize {         │
│  │  │              // 清理缓存                                    │
│  │  │              cache.removeValue(forKey: cache.keys.first!)  │
│  │  │          }                                                │
│  │  │          cache[url] = data                                │
│  │  │          currentSize += data.count                         │
│  │  │      }                                                    │
│  │  │  }                                                        │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  网络状态监测与缓存总结：                                     │
│  │  • NWPathMonitor（网络状态监测）                              │
│  │  • NWPath（网络路径）                                        │
│  │  • URLCache（网络缓存）                                      │
│  │  • 缓存策略（useProtocolCachePolicy 等）                   │
│  │  • 自定义缓存（LRU 替换、大小限制）                         │
│  │  • 网络类型检测（WiFi/Cellular/Wired）                     │
│  │  • 网络状态分类（satisfied/unsatisfied/requiresConnection）  │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  网络状态监测与缓存总结：                                         │
│  • NWPathMonitor（网络状态监测）                                  │
│  • NWPath（网络路径）                                            │
│  • URLCache（网络缓存）                                          │
│  • 缓存策略（useProtocolCachePolicy 等）                       │
│  • 自定义缓存（LRU 替换、大小限制）                            │
│  • 网络类型检测（WiFi/Cellular/Wired）                         │
│  • 网络状态分类（satisfied/unsatisfied/requiresConnection）       │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 8. ATS 与 SSL Pinning

```
ATS 与 SSL Pinning 深度分析：
┌────────────────────────────────────────────────────────────────────────┐
│  ATS（App Transport Security）：                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  // ATS 配置                                                │
│  │  Info.plist:                                                │
│  │  <key>NSAppTransportSecurity</key>                         │
│  │  <dict>                                                     │
│  │      <key>NSAllowsArbitraryLoads</key>                     │
│  │      <true/>                                                │
│  │      <key>NSExceptionDomains</key>                         │
│  │      <dict>                                                 │
│  │          <key>example.com</key>                             │
│  │          <dict>                                             │
│  │              <key>NSExceptionAllowsInsecureHTTPLoads</key>  │
│  │              <true/>                                        │
│  │              <key>NSThirdPartyExceptionAllowsInsecureHTTPLoads</key>  │
│  │              <true/>                                        │
│  │          </dict>                                             │
│  │      </dict>                                                 │
│  │  </dict>                                                    │
│  │                                                               │   │
│  │  ATS 要求：                                                │
│  │  • TLS 1.2 或更高版本                                    │
│  │  • 证书由受信任的 CA 颁发                                  │
│  │  • 密钥交换算法：ECDHE 或 DH（≥ 2048 位）                │
│  │  • 签名算法：SHA-256 或更高                                │
│  │  • 禁止 HTTP 协议（必须 HTTPS）                           │
│  │  • 禁止弱加密套件                                          │
│  │                                                               │   │
│  │  ATS 例外配置：                                             │
│  │  • NSAllowsArbitraryLoads — 允许所有 HTTP 连接              │
│  │  • NSExceptionDomains — 特定域名例外                      │
│  │  • NSThirdPartyExceptionAllowsInsecureHTTPLoads — 第三方例外  │
│  │  • NSIncludesSubdomains — 包含子域名                      │
│  │  • NSEncryptionRequired — 必须加密                        │
│  │  • NSPinnningExceptionDomains — SSL Pinning 例外          │
│  │                                                               │   │
│  │  ATS 安全性：                                              │
│  │  • 默认开启 ATS（iOS 9+）                                 │
│  │  • 禁止 HTTP 明文传输                                      │
│  │  • 强制 TLS 1.2+                                           │
│  │  • 证书必须受信任                                           │
│  │  • 禁止弱加密套件                                          │
│  │  • 建议：不关闭 ATS，配置例外域名                          │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  SSL Pinning：                                              │
│  │  ┌───────────────────────────────────────────────────────────┐   │
│  │  │  // SSL Pinning 实现                                        │
│  │  │  func urlSession(_ session: URLSession,                   │
│  │  │      didReceive challenge: URLAuthenticationChallenge,    │
│  │  │      completionHandler: @escaping (URLSession.             │
│  │  │      AuthChallengeDisposition, URLCredential?) -> Void) {  │
│  │  │      if challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust {  │
│  │  │          let serverTrust = challenge.protectionSpace.serverTrust!  │
│  │  │          let credential = URLCredential(trust: serverTrust)  │
│  │  │          completionHandler(.useCredential, credential)     │
│  │  │      } else {                                            │
│  │  │          completionHandler(.cancelAuthenticationChallenge, nil)  │
│  │  │      }                                                      │
│  │  │  }                                                        │
│  │  │                                                            │
│  │  │  // 证书验证                                             │
│  │  │  SecTrustEvaluate(serverTrust, &trustResult)              │
│  │  │  SecTrustGetCertificateCount(serverTrust)                 │
│  │  │  SecTrustGetCertificateAtIndex(serverTrust, 0)            │
│  │  │                                                            │
│  │  │  // SSL Pinning 方案                                        │
│  │  │  • 公钥锁定（PublicKey Pinning）                          │
│  │  │  • 证书锁定（Certificate Pinning）                      │
│  │  │  • 指纹锁定（Fingerprint Pinning）                      │
│  │  │  • 混合锁定（Hybrid Pinning）                          │
│  │  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  │  ATS 与 SSL Pinning 总结：                                  │
│  │  • ATS 默认开启（iOS 9+），强制 HTTPS                      │
│  │  • ATS 配置例外域名（不关闭 ATS）                              │
│  │  • SSL Pinning 防止中间人攻击                              │
│  │  • 公钥锁定（PublicKey Pinning）                              │
│  │  • 证书锁定（Certificate Pinning）                          │
│  │  • 指纹锁定（Fingerprint Pinning）                          │
│  │  • 混合锁定（Hybrid Pinning）                               │
│  │  • 证书验证（SecTrustEvaluate）                              │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ATS 与 SSL Pinning 总结：                                        │
│  • ATS 默认开启（iOS 9+），强制 HTTPS                           │
│  • ATS 配置例外域名（不关闭 ATS）                                  │
│  • SSL Pinning 防止中间人攻击                                    │
│  • 公钥锁定（PublicKey Pinning）                                  │
│  • 证书锁定（Certificate Pinning）                              │
│  • 指纹锁定（Fingerprint Pinning）                              │
│  • 混合锁定（Hybrid Pinning）                                   │
│  • 证书验证（SecTrustEvaluate）                                  │
│                                                                    │
└───────────────────────────────────────────────────────────────────────┘
*/
```

---

## 9. 面试考点汇总

### 高频面试题

**Q1: HTTP/HTTPS 的区别？**

**答**：
- HTTP：明文传输，无加密
- HTTPS：TLS 加密，证书验证，安全传输
- HTTPS 握手：Client Hello → Server Hello → Certificate → 握手完成

**Q2: URLSession 的使用？**

**答**：
- dataTask：数据下载
- downloadTask：文件下载
- uploadTask：数据/文件上传
- background session：后台传输
- 配置：timeout、cache、headers、connection limit

**Q3: SSL Pinning 原理？**

**答**：
- 防止中间人攻击
- 公钥锁定/证书锁定/指纹锁定
- SecTrustEvaluate 证书验证
- URLCredential(trust:) 创建凭据

**Q4: ATS 是什么？**

**答**：
- App Transport Security（iOS 9+ 默认开启）
- 强制 HTTPS 连接
- 例外域名配置（不关闭 ATS）
- TLS 1.2+ 要求

**Q5: 网络超时重试策略？**

**答**：
- 指数退避：1s, 2s, 4s, 8s
- 固定间隔：1s, 1s, 1s
- 随机退避：1-3s, 2-6s
- 熔断器：连续失败 N 次后暂停

**Q6: 网络缓存策略？**

**答**：
- URLCache：内存+磁盘缓存
- 缓存策略：useProtocolCachePolicy、reloadIgnoringLocalCacheData
- 自定义缓存：LRU 替换、大小限制

**Q7: NWPathMonitor 用途？**

**答**：
- 网络状态监测
- 网络类型检测（WiFi/Cellular/Wired）
- 网络路径监控（satisfied/unsatisfied）

---

## 10. 参考资源

- [Apple: URLSession Reference](https://developer.apple.com/documentation/foundation/urlsession)
- [Apple: URL Loading System](https://developer.apple.com/documentation/foundation/url_loading_system)
- [Apple: Network Framework](https://developer.apple.com/documentation/network)
- [Apple: ATS](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_entitlements/app_transport_security)
- [Apple: SSL/TLS](https://developer.apple.com/documentation/security/certificate_key_and_trust_services)
- [Apple: OAuth2](https://developer.apple.com/documentation/authencation)
- [Apple: HTTP/2](https://httpwg.org/specs/rfc7540.html)
- [Apple: HTTP/3](https://httpwg.org/specs/rfc9114.html)
- [NSHipster: URLSession](https://nshipster.com/urlsession)
- [NSHipster: NWPathMonitor](https://nshipster.com/nwpathmonitor)
- [WWDC 2020: Network Framework](https://developer.apple.com/videos/play/wwdc2020/10203/)
- [WWDC 2021: Advanced Networking](https://developer.apple.com/videos/play/wwdc2021/10227/)
- [WWDC 2022: Networking with URLSession](https://developer.apple.com/videos/play/wwdc2022/10030/)
- [WWDC 2023: Networking in iOS](https://developer.apple.com/videos/play/wwdc2023/10124/)
