# 04_WebSocket

## 目录

- [WebSocket 概述](#websocket-概述)
- [WebSocket 与 HTTP 对比](#websocket-与-http-对比)
- [WebSocket 协议详解](#websocket-协议详解)
- [连接建立（握手）](#连接建立握手)
- [消息发送与接收](#消息发送与接收)
- [心跳机制](#心跳机制)
- [重连策略](#重连策略)
- [OkHttp WebSocket 支持](#okhttp-websocket-支持)
- [使用场景](#使用场景)
- [代码示例](#代码示例)
- [面试考点](#面试考点)

---

## WebSocket 概述

WebSocket 是建立在 TCP 上的实时双向通信协议，为服务器和客户端之间提供了全双工通信通道。自 2011 年标准化以来，已成为实时应用的标配。

### 1.1 什么是 WebSocket

WebSocket 协议定义在 RFC 6455，是一个独立于 TCP 的应用层协议。它允许服务器主动向客户端推送数据，无需客户端轮询。

**核心特性**：
- 全双工通信：服务器和客户端可以同时发送消息
- 低延迟：消息即时到达
- 轻量级：头部开销小
- 持久连接：建立后长期保持
- 基于 TCP：可靠的传输

### 1.2 发展历史

```
2008 年：WebSocket 概念提出
2011 年：HTML5 规范包含 WebSocket
2014 年：Chrome 30+ 完整支持
2015 年：RFC 6455 正式发布
2020 年：WebTransport 提出（基于 QUIC）
```

### 1.3 WebSocket vs 其他方案

| 方案 | 方向 | 延迟 | 带宽 | 适用场景 |
|------|------|------|------|----------|
| 长轮询 | 单向 | 高 | 浪费 | 简单通知 |
| 短轮询 | 单向 | 很高 | 浪费 | 不适用 |
| Server-Sent Events | 单向 | 中 | 节省 | 新闻推送 |
| WebSocket | 双向 | 低 | 高效 | 实时应用 |

---

## WebSocket 与 HTTP 对比

### 2.1 通信方式对比

**HTTP 通信**：
```
客户端 ──── 请求 ────> 服务器
客户端 <──── 响应 ───── 服务器
客户端 ──── 请求 ────> 服务器
客户端 <──── 响应 ───── 服务器
```
- 请求 - 响应模式
- 客户端必须发起请求
- 服务器无法主动推送

**WebSocket 通信**：
```
握手：
客户端 ──── 升级请求 ────> 服务器
客户端 <──── 握手响应 ──── 服务器

通信：
客户端 <───> 服务器（双向任意时刻）
```
- 全双工通信
- 建立连接后可以随时发送
- 服务器可以主动推送

### 2.2 协议对比

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 连接方式 | 短连接 | 长连接 |
| 通信方向 | 单向（请求 - 响应） | 双向 |
| 头部开销 | 每次请求都有完整头部 | 握手后头部很小 |
| 数据格式 | 文本/二进制 | 文本/二进制 |
| 适用场景 | 资源获取 | 实时通信 |
| 协议版本 | HTTP/1.1, HTTP/2, HTTP/3 | WebSocket (RFC 6455) |
| 端口 | 80/443 | 80/443（通过升级） |

### 2.3 性能对比

**HTTP 轮询（1 秒间隔）**：
```
每秒：
- TCP 头部：40 字节
- HTTP 头部：200-500 字节
- 数据：0-100 字节
总开销：240-640 字节/秒
```

**WebSocket**：
```
连接建立后：
- 文本帧头部：2-10 字节
- 二进制帧头部：2-14 字节
- 数据：任意大小
总开销：2-14 字节 + 数据大小
```

**结论**：
- WebSocket 在频繁通信时更节省带宽
- WebSocket 延迟更低
- HTTP 更简单，适合简单场景

---

## WebSocket 协议详解

### 3.1 帧结构

WebSocket 数据以帧为单位传输：

```
┌─────────────────────────────────────────┐
│ FIN |      RES      |      Opcode       │  字节 0
├─────────────────────────────────────────┤
│ RSV3 |    MASK     |     Payload        │  字节 1
├─────────────────────────────────────────┤
│         Payload Length (0-8 bytes)      │
├─────────────────────────────────────────┤
│         Masking Key (0 or 4 bytes)      │
├─────────────────────────────────────────┤
│              Payload Data               │
└─────────────────────────────────────────┘
```

**字段说明**：
```kotlin
// FIN (1 bit)
// 1 = 最后一帧，0 = 中间帧（分片消息）
FIN = 1

// RSV1-3 (3 bits)
// 保留位，通常设为 0，可用于扩展协议
RSV1 = RSV2 = RSV3 = 0

// Opcode (4 bits)
enum class Opcode {
    CONTINUATION(0x0),  // 连续帧
    TEXT(0x1),          // 文本帧
    BINARY(0x2),        // 二进制帧
    CLOSE(0x8),         // 关闭连接
    PING(0x9),          // 心跳请求
    PONG(0xA);          // 心跳响应
}

// MASK (1 bit)
// 客户端发送时 = 1，服务器发送时 = 0
// 客户端必须掩码，服务器不需要

// Payload Length (7 bits 或 7+16 bits 或 7+63 bits)
// 0-125: 直接表示
// 126: 后跟 2 字节表示真实长度
// 127: 后跟 8 字节表示真实长度
```

### 3.2 操作码（Opcode）

**CONTINUATION (0x0)**
- 分片消息的后续帧
- 用于传输大数据

**TEXT (0x1)**
- 文本消息（UTF-8 编码）
- 最常见类型

**BINARY (0x2)**
- 二进制消息
- 传输图片、音频等

**CLOSE (0x8)**
- 关闭连接
- 可携带关闭代码和原因

**PING (0x9)**
- 心跳请求
- 用于检测连接状态

**PONG (0xA)**
- 心跳响应
- 响应 PING 消息

### 3.3 数据掩码

**目的**：防止攻击，确保客户端发送的数据经过掩码处理

```kotlin
// 客户端发送数据时
fun maskPayload(data: ByteArray, key: ByteArray): ByteArray {
    val masked = ByteArray(data.size)
    for (i in 0 until data.size) {
        masked[i] = (data[i].toInt() xor key[i % 4].toInt()).toByte()
    }
    return masked
}

// 服务器接收后需要解掩码
fun unmaskPayload(data: ByteArray, key: ByteArray): ByteArray {
    // 掩码和解掩码使用相同算法
    return maskPayload(data, key)
}
```

### 3.4 分片消息

WebSocket 支持将大数据分成多个帧传输：

```
消息： "Hello, WebSocket!"

帧 1: FIN=0, Opcode=TEXT, Payload="Hello"
帧 2: FIN=0, Opcode=CONTINUATION, Payload=", "
帧 3: FIN=1, Opcode=CONTINUATION, Payload="WebSocket!"
```

接收端需要重组分片消息：

```kotlin
class FragmentAssembler {
    private var accumulated = StringBuilder()
    private var isFragmented = false
    
    fun addFragment(frame: Frame): String? {
        if (frame.opcode == Opcode.TEXT) {
            isFragmented = !frame.fin
            accumulated.append(frame.payload)
        } else if (frame.opcode == Opcode.CONTINUATION) {
            accumulated.append(frame.payload)
        }
        
        if (frame.fin) {
            val result = accumulated.toString()
            accumulated.clear()
            isFragmented = false
            return result
        }
        
        return null // 消息不完整
    }
}
```

---

## 连接建立（握手）

### 4.1 握手流程

**完整的握手过程**：

```
┌──────────────────────────────────────────────────────┐
│                    HTTP 升级握手                      │
└──────────────────────────────────────────────────────┘

客户端                                  服务器
  │                                      │
  │  1. HTTP GET 请求 + Upgrade 头        │
  ├──────────────────────────────────────>│
  │                                      │
  │  2. 验证请求                          │
  │                                      │
  │  3. 返回 101 Switching Protocols      │
  │<─────────────────────────────────────┤
  │                                      │
  │  4. WebSocket 通信开始               │
  │<────────────────> 双向通信          │
```

### 4.2 握手请求（客户端）

```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
```

**请求头说明**：
- `Upgrade: websocket` - 要求升级到 WebSocket 协议
- `Connection: Upgrade` - 确认协议升级
- `Sec-WebSocket-Key` - 随机生成的 Base64 密钥（24 字节）
- `Sec-WebSocket-Version` - WebSocket 协议版本（13）
- `Origin` - 请求来源
- `Sec-WebSocket-Protocol` - 子协议列表

### 4.3 握手响应（服务器）

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

**响应头说明**：
- `101 Switching Protocols` - 协议升级成功
- `Sec-WebSocket-Accept` - 服务器生成的接受密钥

### 4.4 密钥验证

**服务器如何生成 Sec-WebSocket-Accept**：

```kotlin
fun generateAcceptKey(clientKey: String): String {
    // 服务器魔法字符串
    val magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    
    // 拼接客户端密钥和魔法字符串
    val concatenated = "${clientKey}${magicString}"
    
    // SHA-1 哈希
    val md = MessageDigest.getInstance("SHA-1")
    val digest = md.digest(concatenated.toByteArray(Charsets.UTF_8))
    
    // Base64 编码
    return Base64.encodeToString(digest, Base64.NO_WRAP)
}

// 示例
val clientKey = "dGhlIHNhbXBsZSBub25jZQ=="
val acceptKey = generateAcceptKey(clientKey)
// 结果："s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
```

**客户端验证**：
```kotlin
fun validateServerResponse(clientKey: String, serverAcceptKey: String): Boolean {
    val expectedKey = generateAcceptKey(clientKey)
    return expectedKey == serverAcceptKey
}
```

### 4.5 握手失败处理

**常见失败原因**：
```
400 Bad Request - 请求格式错误
401 Unauthorized - 需要认证
403 Forbidden - 不允许的升级
404 Not Found - 路径不存在
426 Up-Grade Required - 不支持的版本
503 Service Unavailable - 服务器过载
```

**Android 处理**：
```kotlin
val listener = object : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: Response) {
        // 握手成功
    }
    
    override fun onFailure(
        webSocket: WebSocket,
        t: Throwable,
        response: Response?
    ) {
        // 握手失败
        val code = response?.code ?: 0
        when (code) {
            401 -> {
                // 需要重新获取 Token
                refreshTokenAndReconnect()
            }
            403 -> {
                // 权限不足
                showError("权限不足")
            }
            503 -> {
                // 服务器维护
                showMaintenanceMessage()
            }
            else -> {
                // 其他错误
                showError("连接失败")
            }
        }
    }
}
```

---

## 消息发送与接收

### 5.1 发送文本消息

```kotlin
// OkHttp 发送文本消息
val webSocket = okhttpWebSocket
webSocket.send("Hello, Server!")
```

**分片发送**：
```kotlin
fun sendLargeMessage(webSocket: WebSocket, message: String, chunkSize: Int = 4096) {
    val sender = webSocket.runWriter {
        // 使用 runWriter 可以处理大消息
        // OkHttp 会自动分片
        writer.use {
            it.writeUtf8(message)
        }
    }
    
    sender.awaitClose() // 等待发送完成
}
```

### 5.2 发送二进制消息

```kotlin
// 发送图片
fun sendImage(webSocket: WebSocket, imageFile: File) {
    val data = imageFile.readBytes()
    val frame = Frame.Builder()
        .type(Frame.Type.BINARY)
        .payload(data)
        .build()
    
    webSocket.send(data)
}

// 使用 OkHttp 的 send
webSocket.send(data)
```

### 5.3 接收消息

```kotlin
val listener = object : WebSocketListener() {
    override fun onMessage(webSocket: WebSocket, text: String) {
        // 接收文本消息
        Log.d("WebSocket", "Received text: $text")
        handleMessage(text)
    }
    
    override fun onMessage(webSocket: WebSocket, bytes: ByteArray) {
        // 接收二进制消息
        Log.d("WebSocket", "Received bytes: ${bytes.size}")
        handleBinaryMessage(bytes)
    }
    
    override fun onClose(
        webSocket: WebSocket,
        code: Int,
        reason: String
    ) {
        // 连接关闭
        Log.d("WebSocket", "Connection closed: $code - $reason")
    }
}
```

### 5.4 消息序列化

**使用 JSON**：
```kotlin
// 定义消息协议
data class WebSocketMessage(
    val type: String,      // 消息类型
    val id: String,        // 消息 ID
    val data: Any?,        // 消息数据
    val timestamp: Long    // 时间戳
)

// 发送
fun sendMessage(webSocket: WebSocket, message: WebSocketMessage) {
    val json = gson.toJson(message)
    webSocket.send(json)
}

// 接收
override fun onMessage(webSocket: WebSocket, text: String) {
    val message = gson.fromJson(text, WebSocketMessage::class.java)
    when (message.type) {
        "chat" -> handleChatMessage(message)
        "system" -> handleSystemMessage(message)
        "notification" -> handleNotification(message)
    }
}
```

**使用 Protobuf**（更高效的二进制协议）：
```proto
// WebSocketMessage.proto
message WebSocketMessage {
    Message Type = 1;
    string message_id = 2;
    oneof data {
        ChatMessage chat = 3;
        SystemMessage system = 4;
        Notification notification = 5;
    }
    int64 timestamp = 6;
}

message ChatMessage {
    string user_id = 1;
    string username = 2;
    string content = 3;
}

// Android 中使用
val builder = WebSocketMessage.newBuilder()
    .setType(WebSocketMessage.Type.CHAT)
    .setMessageId(UUID.randomUUID().toString())
    .setChat(
        ChatMessage.newBuilder()
            .setUserId("123")
            .setUsername("张三")
            .setContent("你好")
            .build()
    )
    .setTimestamp(System.currentTimeMillis())

val message = builder.build()
val data = message.toByteArray()
webSocket.send(data)
```

### 5.5 消息确认机制

**实现可靠传输**：
```kotlin
class ReliableWebSocketManager {
    private val pendingMessages = mutableMapOf<String, PendingMessage>()
    private val messageTimeout = 5000L
    
    data class PendingMessage(
        val id: String,
        val payload: String,
        val timestamp: Long,
        val retryCount: Int = 0
    )
    
    fun sendWithAck(webSocket: WebSocket, id: String, payload: String) {
        pendingMessages[id] = PendingMessage(id, payload, System.currentTimeMillis())
        webSocket.send(payload)
    }
    
    fun onAckReceived(id: String) {
        pendingMessages.remove(id)
    }
    
    private fun checkTimeouts() {
        val now = System.currentTimeMillis()
        val timedOut = pendingMessages.entries.filter {
            now - it.value.timestamp > messageTimeout
        }
        
        for (entry in timedOut) {
            if (entry.value.retryCount < 3) {
                // 重试
                webSocket.send(entry.value.payload)
                pendingMessages[entry.key] = entry.value.copy(
                    timestamp = now,
                    retryCount = entry.value.retryCount + 1
                )
            } else {
                // 放弃
                pendingMessages.remove(entry.key)
                onMessageFailed(entry.value)
            }
        }
    }
}
```

---

## 心跳机制

### 6.1 心跳的作用

1. **检测连接状态**：确认服务器/客户端是否存活
2. **保持连接活跃**：防止中间设备（防火墙、NAT）关闭空闲连接
3. **检测网络质量**：通过响应时间判断网络状况

### 6.2 WebSocket 内置心跳（PING/PONG）

**Ping 帧**：
```
Opcode: 0x9 (PING)
Payload: 应用数据（可选，最多 125 字节）
```

**Pong 帧**：
```
Opcode: 0xA (PONG)
Payload: 必须与 PING 帧的 Payload 相同
```

**工作流程**：
```
客户端发送 PING ───────────> 服务器
服务器自动回复 PONG <─────────── 客户端
（或服务器发送 PING，客户端自动回复）
```

### 6.3 手动实现心跳

**使用 OkHttp 的心跳**：
```kotlin
val webSocket = OkHttpClient()
    .newWebSocket(
        Request.Builder()
            .url(wsUrl)
            .build(),
        object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                // 启动心跳
                startHeartbeat(webSocket)
            }
        }
    )

// OkHttp 默认每 15 秒发送一次 PING
// 可通过 pingIntervalMillis 配置
val client = OkHttpClient.Builder()
    .pingIntervalMillis(30_000) // 30 秒
    .build()
```

**手动实现应用层心跳**：
```kotlin
class HeartbeatManager(
    private val webSocket: WebSocket,
    private val heartbeatInterval: Long = 30_000,
    private val heartbeatTimeout: Long = 10_000
) {
    private var heartbeatJob: Job? = null
    private var lastPongTime = System.currentTimeMillis()
    private var isRunning = false
    
    data class HeartbeatConfig(
        val pingMessage: String = """{"type":"ping","timestamp":${System.currentTimeMillis()}}""",
        val pongExpected: Boolean = true
    )
    
    fun start() {
        if (isRunning) return
        isRunning = true
        
        heartbeatJob = CoroutineScope(Dispatchers.IO).launch {
            while (isActive) {
                delay(heartbeatInterval)
                
                if (!webSocket.isOpen) {
                    break
                }
                
                // 发送心跳
                val pingTime = System.currentTimeMillis()
                webSocket.send(generatePingMessage())
                
                // 等待 PONG（超时检查）
                withTimeout(heartbeatTimeout) {
                    while (System.currentTimeMillis() - lastPongTime > heartbeatTimeout) {
                        delay(100)
                    }
                }
            }
        }
    }
    
    private fun generatePingMessage(): String {
        return """{"type":"ping","timestamp":${System.currentTimeMillis()}}"""
    }
    
    fun onPongReceived() {
        lastPongTime = System.currentTimeMillis()
    }
    
    fun isConnectionAlive(): Boolean {
        return System.currentTimeMillis() - lastPongTime < heartbeatTimeout * 2
    }
    
    fun stop() {
        isRunning = false
        heartbeatJob?.cancel()
    }
}

// 监听 PONG 消息
val listener = object : WebSocketListener() {
    override fun onMessage(webSocket: WebSocket, text: String) {
        val message = gson.fromJson(text, JsonObject::class.java)
        if (message.get("type")?.asString == "pong") {
            heartbeatManager.onPongReceived()
        }
    }
}
```

### 6.4 心跳失败处理

```kotlin
class RobustWebSocket(
    private val webSocket: WebSocket,
    private val heartbeatManager: HeartbeatManager
) {
    private var reconnectCount = 0
    private val maxReconnectCount = 5
    private val reconnectDelay = 5000L
    
    private val listener = object : WebSocketListener() {
        override fun onClosed(
            webSocket: WebSocket,
            code: Int,
            reason: String
        ) {
            Log.d("WebSocket", "Connection closed: $code - $reason")
            
            if (reconnectCount < maxReconnectCount) {
                reconnectCount++
                scheduleReconnect()
            } else {
                notifyConnectionLost()
            }
        }
        
        override fun onFailure(
            webSocket: WebSocket,
            t: Throwable,
            response: Response?
        ) {
            Log.e("WebSocket", "Connection failed", t)
            handleConnectionFailure()
        }
    }
    
    private fun scheduleReconnect() {
        Handler(Looper.getMainLooper()).postDelayed({
            reconnect()
        }, reconnectDelay * reconnectCount) // 指数退避
    }
    
    private fun reconnect() {
        Log.d("WebSocket", "Reconnecting... ($reconnectCount/$maxReconnectCount)")
        connect()
    }
    
    private fun handleConnectionFailure() {
        if (!heartbeatManager.isConnectionAlive()) {
            // 心跳超时，尝试重连
            scheduleReconnect()
        }
    }
    
    private fun notifyConnectionLost() {
        // 通知应用层连接已丢失
        EventBus.getDefault().post(ConnectionLostEvent())
    }
}
```

---

## 重连策略

### 7.1 重连触发条件

1. **连接意外断开**：网络波动、服务器重启
2. **心跳超时**：长时间无响应
3. **握手失败**：服务器返回错误码
4. **协议错误**：收到无效帧

### 7.2 指数退避重连

```kotlin
class ExponentialBackoffReconnector {
    private var attempt = 0
    private val minDelay = 1000L      // 1 秒
    private val maxDelay = 60000L     // 60 秒
    private val maxAttempts = 10
    private val multiplier = 2        // 每次翻倍
    
    fun getNextDelay(): Long {
        return (minDelay * Math.pow(multiplier.toDouble(), attempt.toDouble()))
            .toLong()
            .coerceAtMost(maxDelay)
    }
    
    fun shouldRetry(): Boolean {
        return attempt < maxAttempts
    }
    
    fun onAttempt() {
        attempt++
    }
    
    fun onSuccessful() {
        attempt = 0
    }
}

// 使用
class WebSocketManager {
    private val reconnector = ExponentialBackoffReconnector()
    private var reconnectJob: Job? = null
    
    fun connect() {
        val url = "wss://api.example.com/ws"
        
        val listener = object : WebSocketListener() {
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                if (reconnector.shouldRetry()) {
                    reconnector.onAttempt()
                    scheduleReconnect()
                }
            }
            
            override fun onOpen(webSocket: WebSocket, response: Response) {
                reconnector.onSuccessful()
                Log.d("WebSocket", "Connected!")
            }
        }
        
        client.newWebSocket(Request.Builder().url(url).build(), listener)
    }
    
    private fun scheduleReconnect() {
        val delay = reconnector.getNextDelay()
        Log.d("WebSocket", "Reconnecting in ${delay}ms...")
        
        reconnectJob?.cancel()
        reconnectJob = CoroutineScope(Dispatchers.IO).launch {
            delay(delay)
            connect()
        }
    }
}
```

### 7.3 带认证的重连

```kotlin
class AuthenticatedWebSocket {
    private var token: String = ""
    private var needsTokenRefresh = false
    
    fun connect() {
        val url = buildWsUrl()
        
        val listener = object : WebSocketListener() {
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                // 401 = 认证过期
                if (code == 401) {
                    needsTokenRefresh = true
                }
                
                scheduleReconnect()
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                // 401 = 认证过期
                if (response?.code == 401) {
                    needsTokenRefresh = true
                }
                
                scheduleReconnect()
            }
        }
        
        connectWithUrl(url, listener)
    }
    
    private fun buildWsUrl(): String {
        val token = getValidToken()
        return "wss://api.example.com/ws?token=$token"
    }
    
    private fun getValidToken(): String {
        val currentToken = loadToken()
        return if (isTokenValid(currentToken)) {
            currentToken
        } else {
            val newToken = refreshToken()
            saveToken(newToken)
            newToken
        }
    }
    
    private fun scheduleReconnect() {
        val delay = if (needsTokenRefresh) {
            refreshAndReconnect()
            false
        } else {
            true
        }
        
        if (delay) {
            Handler().postDelayed({ connect() }, 3000)
        }
    }
    
    private fun refreshAndReconnect() {
        // 异步刷新 Token 后重连
        viewModelScope.launch {
            val newToken = refreshToken()
            saveToken(newToken)
            needsTokenRefresh = false
            connect()
        }
    }
}
```

### 7.4 重连状态管理

```kotlin
sealed class WebSocketState {
    object Disconnected : WebSocketState()
    object Connecting : WebSocketState()
    data class Connected(val ping: Long) : WebSocketState()
    object Reconnecting : WebSocketState()
    data class Error(val message: String) : WebSocketState()
}

class WebSocketStateManager {
    private val _state = MutableStateFlow<WebSocketState>(WebSocketState.Disconnected)
    val state: StateFlow<WebSocketState> = _state
    
    fun setDisconnected() {
        _state.value = WebSocketState.Disconnected
    }
    
    fun setConnecting() {
        _state.value = WebSocketState.Connecting
    }
    
    fun setConnected(ping: Long = 0) {
        _state.value = WebSocketState.Connected(ping)
    }
    
    fun setReconnecting() {
        _state.value = WebSocketState.Reconnecting
    }
    
    fun setError(message: String) {
        _state.value = WebSocketState.Error(message)
    }
}

// UI 显示
class WebSocketStatusView @Inject constructor(
    private val stateManager: WebSocketStateManager
) : ViewModel() {
    
    val statusText = stateManager.state.map { state ->
        when (state) {
            is WebSocketState.Disconnected -> "未连接"
            is WebSocketState.Connecting -> "连接中..."
            is WebSocketState.Connected -> "已连接 (延迟：${state.ping}ms)"
            is WebSocketState.Reconnecting -> "重连中..."
            is WebSocketState.Error -> "错误：${state.message}"
        }
    }
    
    val onlineIndicatorColor = stateManager.state.map { state ->
        when (state) {
            is WebSocketState.Connected -> Color.GREEN
            is WebSocketState.Connecting, is WebSocketState.Reconnecting -> Color.YELLOW
            else -> Color.RED
        }
    }
}
```

---

## OkHttp WebSocket 支持

### 8.1 创建 WebSocket

**基本用法**：
```kotlin
val client = OkHttpClient()
val request = Request.Builder()
    .url("wss://api.example.com/chat")
    .header("Authorization", "Bearer $token")
    .build()

val listener = object : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: Response) {
        Log.d("WebSocket", "Connected")
    }
    
    override fun onMessage(webSocket: WebSocket, text: String) {
        Log.d("WebSocket", "Message: $text")
    }
    
    override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
        webSocket.close(1000, null)
    }
    
    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        Log.e("WebSocket", "Failed", t)
    }
}

val webSocket = client.newWebSocket(request, listener)
```

### 8.2 配置 OkHttpClient

```kotlin
val client = OkHttpClient.Builder()
    // 连接超时
    .connectTimeout(10, TimeUnit.SECONDS)
    
    // Ping 间隔（默认 15 秒）
    .pingIntervalMillis(30_000)
    
    // 响应超时
    .readTimeout(30, TimeUnit.SECONDS)
    
    // 写入超时
    .writeTimeout(30, TimeUnit.SECONDS)
    
    // 代理设置
    .proxy(Proxy.Type.HTTP, InetSocketAddress("proxy.example.com", 8080))
    
    // SSL 配置
    .sslSocketFactory(sslSocketFactory, trustManager)
    
    // 拦截器
    .addInterceptor(loggingInterceptor)
    
    .build()

val webSocket = client.newWebSocket(request, listener)
```

### 8.3 发送消息

**文本消息**：
```kotlin
webSocket.send("Hello, Server!")
```

**二进制消息**：
```kotlin
val data = "Hello".toByteArray()
webSocket.send(data)
```

**带确认的发送**：
```kotlin
suspend fun sendWithAck(webSocket: WebSocket, message: String): Boolean {
    return try {
        webSocket.send(message)
        // 等待服务器确认
        withTimeout(5000) {
            ackReceived.await()
        }
        true
    } catch (e: TimeoutCancellationException) {
        false
    }
}
```

### 8.4 关闭连接

```kotlin
// 正常关闭
webSocket.close(1000, "Normal closure")

// 关闭码说明
enum class CloseCode(val value: Int) {
    NORMAL_CLOSURE(1000),
    GOING_AWAY(1001),
    PROTOCOL_ERROR(1002),
    UNSUPPORTED_DATA(1003),
    ABNORMAL_CLOSURE(1006),
    INVALID_PAYLOAD(1007),
    POLICY_VIOLATION(1008),
    MESSAGE_TOO_BIG(1009),
    EXTENSION_REQUIRED(1010),
    INTERNAL_ERROR(1011),
    SERVICE_RESTART(1012),
    TRY_AGAIN_LATER(1013),
    BAD_GATEWAY(1014),
    TLS_HANDSHAKE_FAILURE(1015);
}

// 使用关闭码
webSocket.close(CloseCode.NORMAL_CLOSURE.value, "Client shutting down")
```

### 8.5 管理 WebSocket 生命周期

```kotlin
class WebSocketManager(
    private val client: OkHttpClient,
    private val url: String
) {
    private var webSocket: WebSocket? = null
    private val _connected = MutableStateFlow(false)
    val connected: StateFlow<Boolean> = _connected
    
    private val listener = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            Log.d("WebSocket", "Connected")
            _connected.value = true
        }
        
        override fun onMessage(webSocket: WebSocket, text: String) {
            Log.d("WebSocket", "Message: $text")
        }
        
        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            Log.d("WebSocket", "Closing: $code - $reason")
            webSocket.close(1000, null)
            onClosed(webSocket, code, reason)
        }
        
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            Log.d("WebSocket", "Closed: $code - $reason")
            _connected.value = false
            webSocket = null
        }
        
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            Log.e("WebSocket", "Failed", t)
            _connected.value = false
            webSocket = null
        }
    }
    
    fun connect() {
        if (webSocket != null && webSocket!!.isOpen) {
            return // 已连接
        }
        
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, listener)
    }
    
    fun disconnect() {
        webSocket?.close(1000, "User disconnected")
        webSocket = null
    }
    
    fun send(message: String) {
        webSocket?.send(message)
    }
    
    fun isConnected(): Boolean {
        return webSocket?.isOpen == true
    }
    
    fun cleanup() {
        disconnect()
        client.dispatcher.executorService.shutdown()
    }
}

// 在 Fragment/Activity 中使用
class ChatFragment : Fragment() {
    private val webSocketManager = WebSocketManager(client, wsUrl)
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 监听连接状态
        viewLifecycleOwner.lifecycleScope.launch {
            webSocketManager.connected.collect { connected ->
                updateUIState(connected)
            }
        }
        
        // 连接
        webSocketManager.connect()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        webSocketManager.disconnect()
    }
    
    private fun updateUIState(connected: Boolean) {
        if (connected) {
            // 显示已连接状态
        } else {
            // 显示未连接状态
        }
    }
}
```

### 8.6 处理大量消息

**使用协程处理消息**：
```kotlin
class MessageHandlingWebSocket {
    private val messageProcessor = CoroutineScope(Dispatchers.Default)
    
    private val listener = object : WebSocketListener() {
        override fun onMessage(webSocket: WebSocket, text: String) {
            // 在主线程接收，异步处理
            messageProcessor.launch {
                processMessage(text)
            }
        }
        
        override fun onMessage(webSocket: WebSocket, bytes: ByteArray) {
            messageProcessor.launch {
                processBinaryMessage(bytes)
            }
        }
    }
    
    private suspend fun processMessage(message: String) {
        // 耗时处理
        val data = parseMessage(message)
        saveToDatabase(data)
        notifyUI(data)
    }
}
```

---

## 使用场景

### 9.1 实时聊天

```kotlin
class ChatWebSocket {
    fun sendMessage(userId: String, content: String) {
        val message = ChatMessage(
            type = "message",
            userId = userId,
            content = content,
            timestamp = System.currentTimeMillis()
        )
        
        webSocket.send(gson.toJson(message))
    }
    
    override fun onMessage(webSocket: WebSocket, text: String) {
        val message = gson.fromJson(text, ChatMessage::class.java)
        
        when (message.type) {
            "message" -> displayMessage(message)
            "typing" -> showTypingIndicator(message.userId)
            "online" -> updateOnlineUsers(message.users)
            "read" -> markAsRead(message.messageId)
        }
    }
}
```

### 9.2 实时通知

```kotlin
class NotificationWebSocket {
    private val notificationQueue = LinkedList<Notification>()
    
    override fun onMessage(webSocket: WebSocket, text: String) {
        val notification = gson.fromJson(text, Notification::class.java)
        
        synchronized(notificationQueue) {
            notificationQueue.add(notification)
        }
        
        // 显示通知
        showNotification(notification)
    }
    
    private fun showNotification(notification: Notification) {
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(notification.title)
            .setContentText(notification.body)
            .setSmallIcon(R.drawable.ic_notification)
            .setAutoCancel(true)
        
        notificationManager.notify(notification.id, builder.build())
    }
}
```

### 9.3 游戏状态同步

```kotlin
class GameWebSocket {
    // 发送玩家位置
    fun updatePosition(x: Float, y: Float) {
        val update = PositionUpdate(
            playerId = currentPlayerId,
            x = x,
            y = y,
            timestamp = System.currentTimeMillis()
        )
        
        webSocket.send(gson.toJson(update))
    }
    
    // 接收其他玩家位置
    override fun onMessage(webSocket: WebSocket, text: String) {
        val update = gson.fromJson(text, PositionUpdate::class.java)
        
        // 插值平滑移动
        interpolatePlayerMovement(update)
    }
    
    private fun interpolatePlayerMovement(update: PositionUpdate) {
        // 使用插值算法平滑显示玩家移动
        val player = gameView.getPlayer(update.playerId)
        player?.smoothMoveTo(update.x, update.y)
    }
}
```

### 9.4 实时数据监控

```kotlin
class MonitoringWebSocket {
    override fun onMessage(webSocket: WebSocket, text: String) {
        val metrics = gson.fromJson(text, Metrics::class.java)
        
        // 更新图表
        updateChart(metrics)
        
        // 检查告警
        checkAlerts(metrics)
    }
    
    private fun updateChart(metrics: Metrics) {
        runOnUiThread {
            chart.data.add(DataPoint(metrics.timestamp, metrics.value))
            chart.notifyDataSetChanged()
        }
    }
    
    private fun checkAlerts(metrics: Metrics) {
        if (metrics.value > threshold) {
            triggerAlert(metrics)
        }
    }
}
```

### 9.5 协同编辑

```kotlin
class CollaborativeEditorWebSocket {
    // 发送编辑操作
    fun sendOperation(operation: Operation) {
        val message = CollaborativeMessage(
            type = "operation",
            operation = operation,
            timestamp = System.currentTimeMillis()
        )
        
        webSocket.send(gson.toJson(message))
    }
    
    // 接收其他用户的操作
    override fun onMessage(webSocket: WebSocket, text: String) {
        val message = gson.fromJson(text, CollaborativeMessage::class.java)
        
        if (message.type == "operation") {
            // 应用操作到文档
            applyOperation(message.operation)
        }
    }
    
    private fun applyOperation(operation: Operation) {
        // 使用 OT (Operational Transformation) 或 CRDT
        document.transform(operation)
    }
}
```

---

## 代码示例

### 10.1 完整的聊天应用示例

```kotlin
class ChatApplication @Inject constructor(
    private val websocketManager: WebSocketManager,
    private val messageRepository: MessageRepository
) : ViewModel() {
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages
    
    private val _onlineUsers = MutableStateFlow<List<User>>(emptyList())
    val onlineUsers: StateFlow<List<User>> = _onlineUsers
    
    private val _isTyping = MutableStateFlow<String?>(null)
    val isTyping: StateFlow<String?> = _isTyping
    
    fun connect(userId: String, roomId: String) {
        val url = "wss://api.example.com/chat/$roomId?user=$userId"
        websocketManager.connect(url)
        
        websocketManager.setOnMessageListener { message ->
            handleMessage(message)
        }
    }
    
    private fun handleMessage(message: String) {
        val chatMessage = gson.fromJson(message, ChatMessage::class.java)
        
        when (chatMessage.type) {
            "text" -> {
                val msg = Message(
                    id = chatMessage.id,
                    senderId = chatMessage.senderId,
                    content = chatMessage.content,
                    timestamp = chatMessage.timestamp
                )
                
                messageRepository.save(msg)
                _messages.value = _messages.value + msg
            }
            
            "typing" -> {
                _isTyping.value = chatMessage.senderName
            }
            
            "stop_typing" -> {
                _isTyping.value = null
            }
            
            "users" -> {
                _onlineUsers.value = gson.fromJson(chatMessage.data, List::class.java)
            }
        }
    }
    
    fun sendTextMessage(content: String) {
        val message = ChatMessage(
            type = "text",
            content = content,
            timestamp = System.currentTimeMillis()
        )
        
        websocketManager.send(gson.toJson(message))
    }
    
    fun sendTypingIndicator(isTyping: Boolean) {
        val message = ChatMessage(
            type = if (isTyping) "typing" else "stop_typing",
            timestamp = System.currentTimeMillis()
        )
        
        websocketManager.send(gson.toJson(message))
    }
    
    fun disconnect() {
        websocketManager.disconnect()
    }
}

// UI 层
class ChatFragment : Fragment() {
    private lateinit var viewModel: ChatApplication
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this)[ChatApplication::class.java]
        
        // 显示消息列表
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.messages.collect { messages ->
                adapter.submitList(messages)
            }
        }
        
        // 显示输入中状态
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.isTyping.collect { typing ->
                typingIndicator.visibility = if (typing != null) View.VISIBLE else View.GONE
                typingIndicator.text = "${typing} is typing..."
            }
        }
        
        // 连接 WebSocket
        viewModel.connect(userId, roomId)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        viewModel.disconnect()
    }
}
```

### 10.2 断线重连示例

```kotlin
class RobustChatWebSocket(
    private val url: String,
    private val reconnectDelay: Long = 3000
) {
    private val client = OkHttpClient.Builder()
        .pingIntervalMillis(30_000)
        .build()
    
    private var webSocket: WebSocket? = null
    private var reconnectJob: Job? = null
    private var reconnectCount = 0
    private val maxReconnectCount = 10
    
    private val _connected = MutableStateFlow(false)
    val connected: StateFlow<Boolean> = _connected
    
    private val listener = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            Log.d("WebSocket", "Connected")
            reconnectCount = 0
            _connected.value = true
        }
        
        override fun onMessage(webSocket: WebSocket, text: String) {
            // 处理消息
        }
        
        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            webSocket.close(1000, null)
            onClosed(webSocket, code, reason)
        }
        
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            Log.d("WebSocket", "Closed: $code")
            _connected.value = false
            webSocket = null
            
            if (reconnectCount < maxReconnectCount) {
                scheduleReconnect()
            }
        }
        
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            Log.e("WebSocket", "Failed", t)
            _connected.value = false
            webSocket = null
            
            if (reconnectCount < maxReconnectCount) {
                scheduleReconnect()
            }
        }
    }
    
    fun connect() {
        if (webSocket != null && webSocket!!.isOpen) {
            return
        }
        
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, listener)
    }
    
    private fun scheduleReconnect() {
        reconnectCount++
        val delay = minOf(reconnectDelay * reconnectCount, 30000L)
        
        Log.d("WebSocket", "Reconnecting in ${delay}ms ($reconnectCount/$maxReconnectCount)")
        
        reconnectJob?.cancel()
        reconnectJob = CoroutineScope(Dispatchers.IO).launch {
            delay(delay)
            connect()
        }
    }
    
    fun disconnect() {
        reconnectJob?.cancel()
        webSocket?.close(1000, "User disconnected")
        webSocket = null
        _connected.value = false
    }
    
    fun send(message: String) {
        webSocket?.send(message)
    }
}
```

---

## 面试考点

### 基础题

**1. WebSocket 和 HTTP 的区别？**

```
HTTP:
- 请求 - 响应模式
- 客户端必须主动发起
- 短连接
- 头部开销大

WebSocket:
- 全双工通信
- 双方可随时发送
- 长连接
- 头部开销小
- 适合实时通信
```

**2. WebSocket 握手过程？**

```
1. 客户端发送 HTTP GET 请求 + Upgrade 头
2. 服务器验证请求
3. 服务器返回 101 Switching Protocols
4. 协议升级为 WebSocket
5. 开始双向通信
```

**3. WebSocket 帧结构？**

```
FIN | RSV | Opcode | MASK | Payload Length | [Masking Key] | Payload
```

**4. 常见的 WebSocket 操作码？**

```
0x0 - CONTINUATION（连续帧）
0x1 - TEXT（文本）
0x2 - BINARY（二进制）
0x8 - CLOSE（关闭）
0x9 - PING（心跳请求）
0xA - PONG（心跳响应）
```

### 进阶题

**1. 如何实现 WebSocket 心跳？**

```
方式 1: 使用 PING/PONG 帧（OkHttp 内置）
方式 2: 应用层心跳（自定义消息）
方式 3: 结合使用
```

**2. WebSocket 重连策略？**

```
1. 指数退避：1s, 2s, 4s, 8s...
2. 最大重试次数限制
3. 认证过期时刷新 Token
4. 状态管理（连接中、已连接、重连中）
```

**3. 如何处理大量消息？**

```
1. 使用协程异步处理
2. 消息队列缓冲
3. 批处理
4. 流式处理
```

**4. WebSocket 的安全问题？**

```
1. 使用 WSS（WebSocket over SSL）
2. 认证机制（Token）
3. 消息加密
4. 防止 XSS 攻击
5. 限流和鉴权
```

### 高级题

**1. WebSocket 的负载均衡？**

```
1. 使用 Sticky Session
2. 消息广播（Redis Pub/Sub）
3. 路由到特定服务器
4. 连接状态共享
```

**2. 如何实现消息可靠性？**

```
1. 消息 ID + 确认机制
2. 消息重试
3. 消息持久化
4. 断线重传
```

**3. WebSocket 性能优化？**

```
1. 消息压缩（PerMessage-deflate）
2. 使用 Protobuf 等二进制协议
3. 连接池
4. 合理的 Ping 间隔
5. 消息批处理
```

**4. 分片消息的实现？**

```
大数据分成多个帧：
帧 1: FIN=0, Opcode=TEXT
帧 2: FIN=0, Opcode=CONTINUATION
帧 3: FIN=1, Opcode=CONTINUATION

接收端需要重组分片
```

---

## 总结

### 核心要点

1. **WebSocket 协议**
   - 全双工通信
   - 基于 HTTP 升级
   - 帧结构清晰

2. **连接管理**
   - 握手流程
   - 心跳检测
   - 重连策略

3. **消息处理**
   - 文本/二进制消息
   - 消息序列化
   - 可靠性保证

4. **OkHttp 支持**
   - 简单易用
   - 内置心跳
   - 协程友好

### 最佳实践

```kotlin
// 1. 使用 WSS 加密连接
val url = "wss://api.example.com/chat"

// 2. 配置合理的超时和心跳
val client = OkHttpClient.Builder()
    .pingIntervalMillis(30_000)
    .connectTimeout(10, TimeUnit.SECONDS)
    .build()

// 3. 实现重连机制
class ReconnectingWebSocket {
    // 指数退避重连
}

// 4. 管理生命周期
class WebSocketManager {
    fun connect() {}
    fun disconnect() {}
    fun send(message: String) {}
}

// 5. 异步处理消息
override fun onMessage(text: String) {
    launch { processMessage(text) }
}
```

---

*本文约 12000 字，涵盖了 WebSocket 的核心知识点。*
