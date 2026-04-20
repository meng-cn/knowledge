# 第一章 · Vulkan 架构与核心概念

## 1.1 Vulkan 是什么

**Vulkan**（Khronos Group 于 2016 年发布）是一个**低级、跨平台的图形 API**，专为高性能 3D 图形和计算设计。

### 核心设计哲学

| 原则 | 说明 |
| **显式控制** | 一切由开发者管理，Driver 几乎不干预 |
| **低开销** | 减少 CPU 驱动层开销，CPU/GPU 并行 |
| **多线程优化** | 原生支持多线程命令提交 |
| **精确同步** | 开发者完全控制资源访问时序 |
| **硬件抽象层** | 面向现代 GPU 架构直接映射 |

### 为什么选择 Vulkan？

```
OpenGL:                    Vulkan:
───────────               ───────────

Driver 帮你做决定          你决定一切
"画一个三角形"             "请给我 1000 字节，一个命令缓冲..."

CPU 开销大（~50-100%）    CPU 开销小（~10-20%）
GPU 利用率低（~40%）      GPU 利用率高（~90%）

容易上手                   难上手

适合中小项目                适合高性能项目
```

## 1.2 Vulkan 架构总览 🔥

### 1.2.1 分层架构

```
┌─────────────────────────────────────────────────┐
│               Your Application                   │
│           (你的游戏/渲染器)                       │
│   ┌───────────────────────────────────────────┐  │
│   │           Vulkan API (C/C++)              │  │
│   │  vkCreateInstance → vkQueueSubmit → ...  │  │
│   └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│           Vulkan Driver (Vendor)                │
│   ┌───────────────────────────────────────────┐  │
│   │           Driver Layer                      │  │
│   │  OpenGL ES → Vulkan (通过翻译层)           │  │
│   │  Metal → Vulkan (通过 MoltenVK)            │  │
│   │  Native Vulkan → Hardware                 │  │
│   └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              GPU / Hardware                      │
│   ┌─────────────┐  ┌─────────────┐              │
│   │ Compute Unit │  │Graphics Unit│              │
│   │  (Shader)    │  │  (Shader)   │              │
│   └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────┘
```

### 1.2.2 核心对象模型

```
Instance (实例)
    │
    ├── Physical Device (物理设备)
    │   ├── GPU (GPU 0)
    │   ├── GPU (GPU 1)
    │   └── ...
    │
    └── Device (逻辑设备)
        ├── Queue Family (队列族)
        │   ├── Queue 0 (Graphics)
        │   ├── Queue 1 (Compute)
        │   └── Queue 2 (Transfer)
        │
        ├── Memory (内存管理)
        │   ├── Memory Type 0
        │   ├── Memory Type 1
        │   └── ...
        │
        ├── Resources (资源)
        │   ├── Buffers
        │   ├── Images
        │   ├── Samplers
        │   └── Pools
        │
        ├── Pipelines (管线)
        │   ├── Graphics Pipeline
        │   ├── Compute Pipeline
        │   └── Ray Tracing Pipeline
        │
        ├── Descriptor Sets (描述符)
        │   ├── Uniform Buffers
        │   ├── Storage Buffers
        │   └── Texture Views
        │
        └── Render Passes (渲染通道)
            └── Framebuffers
```

## 1.3 核心概念详解 🔥

### 1.3.1 Instance（实例）

```
概念：一个 Vulkan 实例代表你与 Vulkan 驱动的"连接"
类比：数据库连接

创建流程:
1. 创建 Application Info（应用名称、版本）
2. 创建 Instance (指定需要的扩展)
3. 枚举物理设备 (Physical Devices)

关键 API:
- vkCreateInstance()
- vkEnumeratePhysicalDevices()
- vkDestroyInstance()
```

### 1.3.2 Physical Device（物理设备）

```
概念：实际的 GPU 硬件
类比：计算机中的显卡

每个 GPU 是一个 Physical Device，需要：
- 查询其能力（支持的 Vulkan 版本、特性）
- 查询其队列族（Queue Families）
- 查询其内存类型（Memory Types）

关键 API:
- vkGetPhysicalDeviceProperties()
- vkGetPhysicalDeviceFeatures()
- vkGetPhysicalDeviceQueueFamilyProperties()
```

### 1.3.3 Logical Device（逻辑设备）

```
概念：从 Physical Device 创建的"虚拟连接"
类比：SQLAlchemy Session（从数据库连接创建的会话）

创建时指定:
- Queue 要求（Graphics/Compute/Transfer）
- 扩展（Extensions）
- 设备特性（Features）

关键 API:
- vkCreateDevice()
- vkGetDeviceQueue()
- vkDestroyDevice()
```

### 1.3.4 Queue（队列）

```
概念：GPU 执行命令的队列
类比：打印机队列（但 GPU 可以有多个队列）

Queue Family 类型:
- VK_QUEUE_GRAPHICS_BIT     — 图形渲染
- VK_QUEUE_COMPUTE_BIT       — 计算任务
- VK_QUEUE_TRANSFER_BIT      — 数据传输
- VK_QUEUE_SPARSE_BINDING_BIT — 稀疏绑定
- VK_QUEUE_PROTECTED_BIT     — 保护队列

一个物理设备可以有多个 Queue Family
每个 Queue Family 可以有多个 Queue

关键 API:
- vkGetDeviceQueue()
- vkQueueSubmit() — 提交命令缓冲
- vkQueueWaitIdle() — 等待队列空闲
```

### 1.3.5 Command Buffer（命令缓冲）

```
概念：记录渲染命令的"回放"
类比：视频带的"录制"功能

流程:
1. 创建 Command Pool（命令池）
2. 从 Pool 分配 Command Buffer
3. 开始记录命令（vkCmdBeginRenderPass → vkCmdDraw → vkCmdEndRenderPass）
4. 停止记录
5. 提交到 Queue 执行
6. 重置并复用

关键 API:
- vkAllocateCommandBuffers()
- vkBeginCommandBuffer()
- vkCmdBindPipeline()
- vkCmdDraw()
- vkEndCommandBuffer()
- vkQueueSubmit()
```

### 1.3.6 Memory（内存）

```
概念：Vulkan 显式管理 GPU 内存
类比：C/C++ 的 malloc/free（但更复杂）

Vulkan 内存管理三层模型:

Physical Memory → Memory Type → Device Memory

Physical Memory Types (驱动定义):
  VK_MEMORY_TYPE_DEVICE_LOCAL_BIT    — GPU 本地显存（最快）
  VK_MEMORY_TYPE_HOST_VISIBLE_BIT    — 主机可访问
  VK_MEMORY_TYPE_HOST_COHERENT_BIT   — 自动同步
  VK_MEMORY_TYPE_HOST_NON_COHERENT_BIT — 需要手动同步

Memory Allocation:
  1. 查询 Physical Device 支持的 Memory Types
  2. 选择合适类型（考虑性能和可用性）
  3. 分配 Device Memory
  4. 绑定到 Buffer/Image

关键 API:
- vkGetPhysicalDeviceMemoryProperties()
- vkAllocateMemory()
- vkBindBufferMemory() / vkBindImageMemory()
- vkFreeMemory()
```

## 1.4 渲染管线（Render Pipeline）🔥

### 1.4.1 整体流程

```
Application
    │
    ├── 1. Instance (实例)
    │       └── 创建 Vulkan 连接
    │
    ├── 2. Physical Device (物理设备)
    │       └── 查询 GPU 能力
    │
    ├── 3. Logical Device (逻辑设备)
    │       └── 创建虚拟连接
    │
    ├── 4. Surface (表面)
    │       └── 窗口系统绑定
    │
    ├── 5. Swap Chain (交换链)
    │       └── 帧缓冲管理
    │
    ├── 6. Command Buffer (命令缓冲)
    │       └── 记录渲染命令
    │
    ├── 7. Render Pass (渲染通道)
    │       └── 定义渲染结构
    │
    ├── 8. Pipeline (管线)
    │       └── 渲染状态
    │
    ├── 9. Resources (资源)
    │       ├── Buffers (顶点、Uniform)
    │       ├── Images (纹理)
    │       └── Samplers (采样)
    │
    ├── 10. Render (渲染)
    │        └── vkQueueSubmit → GPU 执行
    │
    └── 11. Present (呈现)
             └── 图像显示到屏幕
```

### 1.4.2 Render Pass 详解

```
Render Pass 定义"如何渲染"：

1. 渲染通道 (Render Pass)
   ├── 附件 (Attachments)
   │   ├── Color Attachment (颜色附件)
   │   ├── Depth Attachment (深度附件)
   │   └── Stencil Attachment (模板附件)
   │
   └── 子通道 (Subpasses)
       ├── Subpass 0 (主渲染)
       │   ├── 输入附件 (Input Attachments)
       │   ├── 颜色附件 (Color Attachments)
       │   ├── 深度附件 (Depth Attachment)
       │   └── 输出附件 (Output Attachments)
       └── ...

2. Framebuffer (帧缓冲)
   └── 绑定具体资源到 Attachments

3. Pipeline (管线)
   └── 绑定到 Render Pass
```

### 1.4.3 Pipeline 状态

```
Graphics Pipeline 由多个阶段组成:

Input Assembly (顶点组装)
    │
    ├── Vertex Input (顶点输入)
    │   ├── Vertex Buffer (顶点缓冲)
    │   └── Vertex Attribute Description
    │
    ├── Vertex Shader (顶点着色器)
    │   └── GLSL Shader Module
    │
    ├── Tessellation (可选)
    ├── Geometry Shader (可选)
    │
    ├── Rasterization (光栅化)
    │   ├── Front Face (正面)
    │   ├── Polygon Mode (多边形模式)
    │   ├── Cull Mode (剔除模式)
    │   └── Depth Bias (深度偏置)
    │
    ├── Multisample (多重采样)
    │
    ├── Fragment Shader (片元着色器)
    │   └── GLSL Shader Module
    │
    ├── Color Blend (颜色混合)
    │   ├── Blend Enable (混合启用)
    │   ├── Blend Factor (混合因子)
    │   └── Color Mask (颜色掩码)
    │
    ├── Depth Test (深度测试)
    │   ├── Depth Compare (比较方式)
    │   └── Depth Write (深度写入)
    │
    └── Stencil Test (模板测试)
        ├── Compare Op (比较操作)
        └── Stencil Op (模板操作)
```

## 1.5 核心对象关系图

```
    Instance
       │
       ├── Physical Device
       │   ├── GPU Info
       │   ├── Memory Types
       │   └── Queue Families
       │
       ├── Logical Device
       │   ├── Queue
       │   │   ├── Command Pool
       │   │   │   ├── Command Buffer
       │   │   │   └── ...
       │   │   └── Command Buffer
       │   │
       │   ├── Memory
       │   │   └── Device Memory
       │   │       ├── Buffer
       │   │       └── Image
       │   │
       │   ├── Pipeline
       │   │   ├── Shader Module
       │   │   └── Shader Stage
       │   │
       │   ├── Render Pass
       │   │   └── Framebuffer
       │   │       └── Image View
       │   │
       │   ├── Descriptor Set Layout
       │   │   ├── Uniform Buffer
       │   │   ├── Storage Buffer
       │   │   └── Sampler
       │   │
       │   └── Swap Chain
       │       ├── Image (xN)
       │       ├── Image View (xN)
       │       └── Allocator
       │
       └── Surface
           └── Window/System
```

## 1.6 关键术语速查

| 术语 | 说明 | 类比 |
| **Instance** | Vulkan 实例，与驱动的连接 | HTTP 客户端 |
| **Physical Device** | 实际的 GPU 硬件 | 物理显卡 |
| **Logical Device** | 从 Physical Device 创建的虚拟连接 | 数据库连接 |
| **Queue** | GPU 执行命令的队列 | 打印机队列 |
| **Command Buffer** | 记录命令的缓冲 | 录制视频 |
| **Render Pass** | 定义渲染结构 | 烹饪步骤 |
| **Pipeline** | 渲染状态 | 烹饪配方 |
| **Buffer** | 线性内存（顶点、Uniform） | 数组 |
| **Image** | 纹理资源 | 图像文件 |
| **Sampler** | 纹理采样配置 | 放大镜设置 |
| **Frame Buffer** | 帧缓冲（附件绑定） | 画布 |
| **Swap Chain** | 帧缓冲管理 | 电影胶片 |
| **Fence** | 驱动完成信号（CPU/GPU 同步） | 锁 |
| **Semaphore** | GPU/GPU 同步 | 信号灯 |
| **Memory** | GPU 显存管理 | malloc |
| **Descriptor Set** | 描述符绑定（UBO、SRV） | 变量绑定 |

## 1.7 Vulkan vs OpenGL 核心差异

```
OpenGL (Fixed Function):         Vulkan (Explicit):
─────────────────────            ────────────────────

glVertexPointer()              →  手动绑定 Buffer

glEnable(GL_DEPTH_TEST)        →  创建 Pipeline 时指定

glUniformMatrix4fv(...)        →  创建 Uniform Buffer + Descriptor

glDrawArrays(GL_TRIANGLES, ...)→  vkCmdDraw(..., commandBuffer)

glTexImage2D(...)              →  vkCreateImage + vkAllocateMemory + vkBind...

glUseProgram(program)          →  创建 Pipeline + vkCmdBindPipeline(...)

glGetError()                   →  vkGetResult() / vkGetResultCallback()

自动内存管理                    →  手动内存管理

状态机（隐式状态）              →  显式状态
```

## 1.8 渲染循环（Render Loop）

```python
# 典型的 Vulkan 渲染循环
while not should_terminate:
    # 1. 获取下一帧
    image_index = swap_chain.acquire_next_image()
    
    # 2. 等待之前的命令完成
    wait_for_fence(fences[image_index])
    
    # 3. 重置命令缓冲
    reset_command_buffer(command_buffers[image_index])
    
    # 4. 开始记录命令
    vkCmdBeginRenderPass(command_buffer)
        vkCmdBindPipeline(command_buffer, pipeline)
        vkCmdBindDescriptorSets(command_buffer, descriptor_sets)
        vkCmdBindVertexBuffers(command_buffer, vertex_buffers)
        vkCmdDraw(command_buffer, vertex_count, instance_count)
    vkCmdEndRenderPass(command_buffer)
    
    # 5. 提交命令
    submit_command_buffer(command_buffer)
    
    # 6. 呈现图像
    swap_chain.present_image(image_index)
```

## 1.9 核心 API 分类速查

| 类别 | 函数 |
| **初始化** | `vkCreateInstance()`, `vkCreateDevice()` |
| **枚举** | `vkEnumeratePhysicalDevices()`, `vkEnumerateInstanceExtensionProperties()` |
| **资源** | `vkCreateBuffer()`, `vkCreateImage()`, `vkCreateSampler()` |
| **内存** | `vkAllocateMemory()`, `vkBindBufferMemory()` |
| **命令** | `vkAllocateCommandBuffers()`, `vkCmdDraw()`, `vkQueueSubmit()` |
| **同步** | `vkCreateFence()`, `vkCreateSemaphore()`, `vkWaitForFences()` |
| **渲染** | `vkCreateRenderPass()`, `vkCreateFramebuffer()` |
| **管线** | `vkCreateGraphicsPipelines()` |
| **呈现** | `vkAcquireNextImageKHR()`, `vkQueuePresentKHR()` |
| **交换链** | `vkCreateSwapchainKHR()`, `vkDestroySwapchainKHR()` |

---