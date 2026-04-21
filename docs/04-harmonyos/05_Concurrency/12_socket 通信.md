# Socket 通信

> 鸿蒙支持 TCP/UDP Socket 通信，用于本地通信、设备直连等场景。

---

## 1. Socket 类型

| 类型 | 说明 | 适用场景 |
|---|-|-|
| **TCP Socket** | 可靠连接、面向字节流 | 长连接、数据同步 |
| **UDP Socket** | 无连接、面向数据报 | 实时传输、广播 |
| **Local Socket** | 本地进程通信 | 同设备进程间通信 |

---

## 2. TCP Socket

### 2.1 客户端

```typescript
import { socket } from '@kit.NetworkKit'

class TcpClient {
    private client: socket.Socket | null = null

    // 连接服务器
    connect(host: string, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = socket.createSocket(socket.SocketType.TCP)
            
            this.client.on('connect', () => {
                console.log('TCP 连接成功')
                resolve()
            })
            
            this.client.on('receive', (data: ArrayBuffer) => {
                console.log('收到数据:', new TextDecoder().decode(data))
            })
            
            this.client.on('error', (err: Error) => {
                console.error('连接错误:', err.message)
                reject(err)
            })
            
            this.client.connect({
                host: host,
                port: port,
                timeout: 5000
            })
        })
    }

    // 发送数据
    send(data: string): void {
        if (this.client) {
            let buffer = new TextEncoder().encode(data)
            this.client.send(buffer)
        }
    }

    // 断开连接
    disconnect(): void {
        if (this.client) {
            this.client.close()
            this.client = null
        }
    }
}
```

### 2.2 服务器端

```typescript
import { socket } from '@kit.NetworkKit'

class TcpServer {
    private server: socket.Socket | null = null
    private connections: Array<socket.Socket> = []

    // 启动服务器
    start(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = socket.createSocket(socket.SocketType.TCP)
            
            this.server.on('connection', (client: socket.Socket) => {
                console.log('新连接:', client)
                this.connections.push(client)
                
                client.on('receive', (data: ArrayBuffer) => {
                    console.log('收到数据:', data)
                })
            })
            
            this.server.on('error', (err: Error) => {
                console.error('服务器错误:', err.message)
                reject(err)
            })
            
            this.server.listen({
                port: port,
                address: '0.0.0.0'
            })
            
            resolve()
        })
    }

    // 广播消息
    broadcast(data: string): void {
        let buffer = new TextEncoder().encode(data)
        for (let client of this.connections) {
            try {
                client.send(buffer)
            } catch (err) {
                this.connections.splice(this.connections.indexOf(client), 1)
            }
        }
    }
}
```

---

## 3. UDP Socket

### 3.1 UDP 客户端

```typescript
import { socket } from '@kit.NetworkKit'

class UdpClient {
    private socket: socket.Socket | null = null

    // 创建 UDP Socket
    connect(): void {
        this.socket = socket.createSocket(socket.SocketType.UDP)
        
        this.socket.on('receive', (data: ArrayBuffer, address: socket.SocketAddress) => {
            console.log('收到 UDP 包:', new TextDecoder().decode(data))
            console.log('来自:', address.host, address.port)
        })
        
        this.socket.bind(0)  // 随机端口
    }

    // 发送 UDP 包
    send(data: string, host: string, port: number): void {
        if (this.socket) {
            let buffer = new TextEncoder().encode(data)
            this.socket.send({
                data: buffer,
                address: { host: host, port: port }
            })
        }
    }

    // 组播
    joinMulticast(multicastAddr: string, interfaceAddr: string): void {
        if (this.socket) {
            this.socket.joinMulticast({
                multicastAddr: multicastAddr,
                interfaceAddr: interfaceAddr
            })
        }
    }
}
```

---

## 4. Local Socket（本地通信）

### 4.1 本地通信

```typescript
import { socket } from '@kit.NetworkKit'

// 服务端
let server = socket.createSocket(socket.SocketType.LOCAL)
server.listen({
    path: '/data/local/tmp/mysocket'
})

// 客户端
let client = socket.createSocket(socket.SocketType.LOCAL)
client.connect({
    path: '/data/local/tmp/mysocket'
})
```

---

## 5. 面试高频考点

### Q1: TCP 和 UDP 的区别？

**回答**：TCP 可靠连接、面向字节流、有连接；UDP 无连接、面向数据报、无保证。TCP 用于数据同步/长连接，UDP 用于实时传输。

### Q2: Local Socket 的用途？

**回答**：同设备进程间通信，通过本地文件路径通信，适合同设备进程间数据交换。

---

> 🐱 **小猫提示**：Socket 记住 **"TCP 可靠、UDP 快速、Local 本地通信、TCP 面向连接 UDP 无连接"**。
