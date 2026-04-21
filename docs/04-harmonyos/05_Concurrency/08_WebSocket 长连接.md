# WebSocket 长连接

> 鸿蒙通过 @kit.NetworkKit/webSocket 实现 WebSocket 长连接。

---

## 1. WebSocket 基本用法

### 1.1 创建连接

```typescript
import { webSocket } from '@kit.NetworkKit'

let socket: webSocket.WebSocket | null = null

// 创建 WebSocket 连接
socket = webSocket.createWebSocket({
    url: 'wss://websocket.example.com',
    protocols: ['protocol1', 'protocol2'],
    headers: {
        'Authorization': 'Bearer xxx'
    }
})

// 连接成功
socket.on('open', () => {
    console.log('WebSocket 连接成功')
    this.sendMessage('{"action":"login","token":"xxx"}')
})

// 收到消息
socket.on('message', (data: string | ArrayBuffer) => {
    console.log('收到消息:', data)
    let message = JSON.parse(data as string)
    this.handleMessage(message)
})

// 连接关闭
socket.on('close', (code: number, reason: string) => {
    console.log(`连接关闭: ${code} - ${reason}`)
    // 自动重连
    this.reconnect()
})

// 连接错误
socket.on('error', (err: Error) => {
    console.error('WebSocket 错误:', err.message)
})
```

---

## 2. 消息收发

### 2.1 发送消息

```typescript
// 发送文本消息
function sendMessage(text: string): void {
    if (socket && socket.readyState === webSocket.CONNECTING) {
        socket.send(text)
    }
}

// 发送二进制消息
function sendBinary(data: ArrayBuffer): void {
    if (socket && socket.readyState === webSocket.CONNECTING) {
        socket.sendBinary(data)
    }
}
```

### 2.2 消息格式

```typescript
interface WSMessage {
    type: 'message' | 'ping' | 'pong' | 'heartbeat' | 'error'
    data: any
    timestamp: number
    id?: string
}

// 心跳消息
function sendHeartbeat(): void {
    let heartbeat: WSMessage = {
        type: 'heartbeat',
        data: { ping: Date.now() },
        timestamp: Date.now()
    }
    sendMessage(JSON.stringify(heartbeat))
}
```

---

## 3. 自动重连

### 3.1 重连策略

```typescript
class WebSocketManager {
    private url: string = 'wss://websocket.example.com'
    private socket: webSocket.WebSocket | null = null
    private maxRetries: number = 10
    private retryDelay: number = 1000
    private retries: number = 0

    connect(): void {
        this.socket = webSocket.createWebSocket({ url: this.url })
        
        this.socket.on('open', () => {
            console.log('连接成功')
            this.retries = 0  // 重置重连计数
        })
        
        this.socket.on('message', (data) => {
            this.handleMessage(JSON.parse(data as string))
        })
        
        this.socket.on('close', () => {
            this.handleDisconnect()
        })
        
        this.socket.on('error', (err) => {
            console.error('连接错误:', err.message)
        })
    }

    private handleMessage(data: any): void {
        switch (data.type) {
            case 'heartbeat':
                // 回复心跳
                this.sendHeartbeat()
                break
            case 'message':
                // 业务消息处理
                this.processMessage(data)
                break
        }
    }

    private handleDisconnect(): void {
        if (this.retries < this.maxRetries) {
            let delay = this.retryDelay * Math.pow(2, this.retries)  // 指数退避
            setTimeout(() => {
                this.retries++
                this.connect()
            }, delay)
        }
    }

    private sendHeartbeat(): void {
        if (this.socket) {
            this.socket.send(JSON.stringify({ type: 'heartbeat' }))
        }
    }
}
```

---

## 4. 面试高频考点

### Q1: WebSocket 的使用流程？

**回答**：createWebSocket → on('open') → 发送/接收消息 → on('close') → 重连。

### Q2: 心跳机制的作用？

**回答**：检测连接存活，防止连接长时间无活动被网关断开。客户端定时发 ping，服务端回复 pong。

### Q3: WebSocket 和 HTTP 的区别？

**回答**：HTTP 短连接（请求-响应）；WebSocket 长连接（全双工），适合实时通信（聊天、推送、游戏）。

---

> 🐱 **小猫提示**：WebSocket 记住 **"createWebSocket、open/close/message/error 事件、心跳保活、指数退避重连"**。
