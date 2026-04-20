# 第二十七章 · 事件与标记 (Events & Markers)

## 27.1 Event（事件）

### 27.1.1 Event 概述

```
Event = GPU 间的条件信号

类似 Semaphore，但更细粒度：
- Semaphore: GPU ↔ GPU 同步（用于 Queue 间）
- Event:     GPU 内精确条件同步（用于 Command Buffer 间）
```

### 27.1.2 创建和使用 Event

```python
import vkbottle

# --- 创建 Event ---
event_create_info = vkbottle.EventCreateInfo()
event = device.create_event(event_create_info)

# --- 设置 Event (GPU 触发) ---
cmd_buffer = device.allocate_command_buffers(vkbottle.CommandBufferAllocateInfo(
    commandPool=cmd_pool,
    level=vkbottle.CommandBufferLevel.PRIMARY,
    commandBufferCount=1,
))[0]
cmd_buffer.begin(vkbottle.CommandBufferBeginInfo())
cmd_buffer.set_event(event, vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE)
cmd_buffer.end()
queue.submit(cmd_buffer)

# --- 等待 Event (GPU 等待) ---
cmd_buffer2 = device.allocate_command_buffers(vkbottle.CommandBufferAllocateInfo(
    commandPool=cmd_pool,
    level=vkbottle.CommandBufferLevel.PRIMARY,
    commandBufferCount=1,
))[0]
cmd_buffer2.begin(vkbottle.CommandBufferBeginInfo())
cmd_buffer2.wait_events([event],
                         vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,  # 等待的阶段
                         vkbottle.AccessFlag.NONE,                   # 完成的阶段
                         [])  # memory barriers
cmd_buffer2.end()
queue.submit(cmd_buffer2)

# --- 重置 Event ---
device.reset_events([event])

# --- 销毁 Event ---
event.destroy()
```

## 27.2 Debug Marker（调试标记）

### 27.2.1 调试标记

```python
import vkbottle

# 创建标记扩展（VK_EXT_debug_marker）
debug_marker = device.create_debug_marker_ext()

# 使用标记
debug_marker.cmd_debug_marker_ext(
    commandBuffer=cmd_buffer,
    length=len(b"Render Pass Begin"),
    pMarker=b"Render Pass Begin",
    color=(1.0, 0.0, 0.0, 1.0),  # RGB + Alpha
)

# 标记组
debug_marker.begin_debug_marker_ext(
    cmd_buffer,
    len(b"Lighting Pass"),
    b"Lighting Pass",
    (0.0, 1.0, 0.0, 1.0),
)

# 嵌套标记
debug_marker.cmd_debug_marker_ext(
    cmd_buffer,
    len(b"Point Lights"),
    b"Point Lights",
    (1.0, 1.0, 0.0, 1.0),
)

debug_marker.end_debug_marker_ext(cmd_buffer)
```

### 27.2.2 常用调试标记

| 函数 | 用途 |
| `cmd_debug_marker()` | 简单标记 |
| `begin_debug_marker()` | 开始组（可嵌套） |
| `end_debug_marker()` | 结束组 |
| `push_debug_group()` | 推送组（可嵌套） |
| `pop_debug_group()` | 弹出组 |
| `set_debug_object_tag()` | 标记对象 |

### 27.2.3 标记着色（推荐配色）

| 颜色 | 用途 |
| 红色 | 渲染 Pass 开始/结束 |
| 绿色 | 资源分配 |
| 蓝色 | 命令缓冲记录 |
| 黄色 | 绘制调用 |
| 紫色 | 纹理加载 |
| 白色 | 常规标记 |

## 27.3 GPU 文档（GPU 标记）

```python
# 在 Vulkan 中使用 GPU 文档进行性能分析
# 需要 VK_EXT_debug_utils 扩展

# 创建 debug utils
debug_utils = instance.create_debug_utils(
    vkbottle.DebugUtilsCreateInfoEXT(
        pfnUserCallback=on_debug_message,
        pUserData=None,
    )
)

# 设置对象名称
device.set_debug_utils_object_name(
    vkbottle.DebugUtilsObjectNameInfoEXT(
        objectType=vkbottle.DebugReportObjectType.QUEUE,
        objectHandle=queue,
        pObjectName=b"My Graphics Queue",
    )
)

# 设置缓冲区名称
device.set_debug_utils_object_name(
    vkbottle.DebugUtilsObjectNameInfoEXT(
        objectType=vkbottle.DebugReportObjectType.BUFFER,
        objectHandle=vertex_buffer,
        pObjectName=b"Triangle Vertex Buffer",
    )
)
```

## 27.4 事件与标记速查

| 概念 | 函数 | 说明 |
| **Event** | `create_event()` | GPU 条件信号 |
| **Set Event** | `cmd_set_event()` | 触发事件 |
| **Wait Events** | `cmd_wait_events()` | 等待事件 |
| **Debug Marker** | `cmd_debug_marker()` | 调试标记 |
| **Debug Group** | `begin/end_debug_marker()` | 分组标记 |
| **Object Name** | `set_debug_utils_object_name()` | 对象命名 |

---

| **27. 事件与标记** | ✅ |
| 28-30 | 🔲 |