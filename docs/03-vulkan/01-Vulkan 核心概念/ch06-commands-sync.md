# 第六章 · 命令缓冲与同步

## 6.1 Command Pool & Command Buffer 🔥

### 6.1.1 核心概念

```
Command Pool:
  ────────────
  命令缓冲的"工厂"，管理命令缓冲的内存分配
  
  vkCreateCommandPool()  → 创建 Pool
  vkAllocateCommandBuffers() → 从 Pool 分配 Buffer
  vkFreeCommandBuffers() → 释放回 Pool
  vkResetCommandPool() → 重置（释放命令）

Command Buffer:
  ────────────
  记录渲染命令的"磁带"
  
  vkBeginCommandBuffer() → 开始记录
  vkCmdXXX() → 记录命令（vkCmdDraw, vkCmdBindPipeline, ...）
  vkEndCommandBuffer() → 结束记录
  vkQueueSubmit() → 提交到 GPU 执行
  
Command Buffer 类型:
  PRIMARY → 可提交到 Queue 执行
  SECONDARY → 需由 Primary Buffer 调用（间接绘制）
```

### 6.1.2 创建 Command Pool

```python
import vkbottle

# --- 创建 Command Pool ---
cmd_pool_create_info = vkbottle.CommandPoolCreateInfo(
    queueFamilyIndex=graphics_queue_family,  # 队列族
    flags=vkbottle.CommandPoolCreateFlag.RESET_COMMAND_BUFFER,
)
command_pool = device.create_command_pool(cmd_pool_create_info)
```

### 6.1.3 分配 Command Buffer

```python
# --- 分配 Command Buffer ---
cmd_buffer_alloc_info = vkbottle.CommandBufferAllocateInfo(
    commandPool=command_pool,
    level=vkbottle.CommandBufferLevel.PRIMARY,
    commandBufferCount=swapchain_image_count,  # 每帧一个
)
command_buffers = device.allocate_command_buffers(cmd_buffer_alloc_info)
```

## 6.2 命令缓冲记录

### 6.2.1 完整记录流程

```python
def record_command_buffer(device, command_pool, command_buffer, render_pass, 
                          graphics_pipeline, framebuffer, swapchain_image_view):
    """记录一帧的命令"""
    
    # 1. 开始记录
    cmd_begin_info = vkbottle.CommandBufferBeginInfo(
        flags=vkbottle.CommandBufferUsageFlag.ONE_TIME_SUBMIT,
    )
    command_buffer.begin(cmd_begin_info)
    
    # 2. 开始 Render Pass
    render_pass_begin_info = vkbottle.RenderPassBeginInfo(
        renderPass=render_pass,
        framebuffer=framebuffer,
        renderArea=vkbottle.Rect2D(
            offset=(0, 0),
            extent=swapchain_image_extent,
        ),
        clearValues=[  # 清除值
            vkbottle.ClearValue(
                color=vkbottle.ClearColorValue([0.1, 0.1, 0.2, 1.0])  # 背景色
            ),
            vkbottle.ClearValue(
                depth=1.0,  # 深度值
            ),
        ],
    )
    command_buffer.begin_render_pass(render_pass_begin_info)
    
    # 3. 绑定 Pipeline
    command_buffer.bind_pipeline_graphics(graphics_pipeline)
    
    # 4. 绑定 Descriptor Sets
    command_buffer.bind_descriptor_sets(
        vkbottle.PipelineBindPoint.GRAPHICS,
        pipeline_layout,
        descriptor_set,
    )
    
    # 5. 绑定顶点缓冲
    command_buffer.bind_vertex_buffers(
        firstBinding=0,
        vertexBuffers=[vertex_buffer],
        offsets=[0],
    )
    
    # 6. 绘制
    command_buffer.draw(
        vertexCount=vertex_count,
        instanceCount=instance_count,
        firstVertex=0,
        firstInstance=0,
    )
    
    # 7. 结束 Render Pass
    command_buffer.end_render_pass()
    
    # 8. 结束记录
    command_buffer.end()
```

### 6.2.2 常用命令速查

| 命令 | 作用 |
| `vkCmdBeginRenderPass()` | 开始渲染 |
| `vkCmdEndRenderPass()` | 结束渲染 |
| `vkCmdBindPipeline()` | 绑定管线 |
| `vkCmdBindDescriptorSets()` | 绑定描述符集 |
| `vkCmdBindVertexBuffers()` | 绑定顶点缓冲 |
| `vkCmdBindIndexBuffer()` | 绑定索引缓冲 |
| `vkCmdDraw()` | 顶点绘制 |
| `vkCmdDrawIndexed()` | 索引绘制 |
| `vkCmdDrawIndirect()` | 间接绘制 |
| `vkCmdSetViewport()` | 设置视口 |
| `vkCmdSetScissor()` | 设置裁剪 |
| `vkCmdClearDepthStencil()` | 清深度/模板 |
| `vkCmdClearAttachments()` | 清附件 |

## 6.3 同步机制 🔥

### 6.3.1 Fence vs Semaphore

```
Fence:                      Semaphore:
─────                      ───────
CPU ↔ GPU 同步             GPU ↔ GPU 同步

CPU 等待 GPU 完成           GPU 队列间同步

vkCreateFence()             vkCreateSemaphore()
vkWaitForFences()           vkQueueWaitIdle()
vkResetFences()             vkQueueSubmit() 中的 signalSemaphores
vkResetFences()

用途: 帧同步                 用途: 跨 Queue 同步
```

### 6.3.2 Fence 使用

```python
# --- 创建 Fence ---
fence_create_info = vkbottle.FenceCreateInfo(
    flags=vkbottle.FenceCreateFlag(0),  # 默认
)
fences = [device.create_fence(fence_create_info) for _ in range(swapchain_image_count)]

# --- 等待 Fence ---
device.wait_for_fences([fences[image_index]], True, vkbottle.INFINITY64)

# --- 等待完成（检查 GPU 是否完成当前帧）---
result = device.get_fence_status(fences[image_index])
if result != vkbottle.Result.SUCCESS:
    device.wait_for_fences([fences[image_index]], True, 1000000)

# --- 重置 Fence ---
device.reset_fences([fences[image_index]])
```

### 6.3.3 Semaphore 使用

```python
# --- 创建 Semaphore ---
semaphore_create_info = vkbottle.SemaphoreCreateInfo()
image_available_semaphore = device.create_semaphore(semaphore_create_info)
render_complete_semaphore = device.create_semaphore(semaphore_create_info)

# --- 在 vkQueueSubmit 中传递 Semaphore ---
submit_info = vkbottle.SubmitInfo(
    waitSemaphores=[image_available_semaphore],  # 等待的 Semaphore
    waitDstStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
    commandBuffers=[command_buffer],
    signalSemaphores=[render_complete_semaphore],  # 触发的 Semaphore
)

# --- 在 Present 中等待 ---
present_info = vkbottle.PresentInfoKHR(
    waitSemaphores=[render_complete_semaphore],
    swapchains=[swapchain],
    imageIndices=[image_index],
)

device.get_queue().presentKHR(present_info)
```

## 6.4 图像同步（Swap Chain）

### 6.4.1 完整同步流程

```python
# --- 渲染一帧的完整同步流程 ---

# 1. 获取下一个图像
result, image_index = swapchain.acquire_next_image(
    timeout=1000000000,  # 1s
    semaphore=image_available_semaphore,  # 同步
    fence=fences[image_index],  # 或用 Fence
)

if result == vkbottle.Result.SUBOPTIMAL_KHR or result == vkbottle.Result.COMPACTED_KHR:
    # Swap Chain 可能已失效，需要重建
    rebuild_swapchain()

# 2. 等待 Fence 确保 GPU 已处理完上一帧
device.wait_for_fences([fences[image_index]], True, vkbottle.INFINITY64)

# 3. 重置 Fence 用于下一帧
device.reset_fences([fences[image_index]])

# 4. 重置 Command Buffer
command_buffers[image_index].begin(vkbottle.CommandBufferBeginInfo(
    flags=vkbottle.CommandBufferUsageFlag.ONE_TIME_SUBMIT,
))

# 5. 记录命令...（如前面章节所示）

# 6. 结束命令
command_buffers[image_index].end()

# 7. 提交到 Queue
submit_info = vkbottle.SubmitInfo(
    waitSemaphores=[image_available_semaphore],
    waitDstStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
    commandBuffers=[command_buffers[image_index]],
    signalSemaphores=[render_complete_semaphore],
)

device.get_queue().submit(submit_info)

# 8. 呈现
present_info = vkbottle.PresentInfoKHR(
    waitSemaphores=[render_complete_semaphore],
    swapchains=[swapchain],
    imageIndices=[image_index],
)

device.get_queue().presentKHR(present_info)
```

## 6.5 Barrier（屏障）

### 6.5.1 Pipeline Barrier

```python
# Pipeline Barrier 控制访问顺序

# 1. 资源状态转换
cmd_buffer.pipeline_barrier(
    srcStageMask=vkbottle.AccessFlag.NONE,
    dstStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
    dependencyFlags=vkbottle.SubpassDependencyFlag.NONE,
    memoryBarriers=[],
    bufferMemoryBarriers=[],
    imageMemoryBarriers=[
        vkbottle.ImageMemoryBarrier(
            srcAccessMask=vkbottle.AccessFlag.NONE,
            dstAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
            oldLayout=vkbottle.ImageLayout.UNDEFINED,
            newLayout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            srcQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
            dstQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
            image=image,
            subresourceRange=vkbottle.ImageSubresourceRange(
                aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                baseMipLevel=0,
                levelCount=1,
                baseArrayLayer=0,
                layerCount=1,
            ),
        ),
    ],
)

# 2. Memory Barrier
cmd_buffer.memory_barrier(
    srcAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
    dstAccessMask=vkbottle.AccessFlag.SHADER_READ,
    memoryBarriers=[
        vkbottle.MemoryBarrier(
            srcAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
            dstAccessMask=vkbottle.AccessFlag.SHADER_READ,
        ),
    ],
)

# 3. Buffer Memory Barrier
cmd_buffer.buffer_memory_barrier(
    srcAccessMask=vkbottle.AccessFlag.NONE,
    dstAccessMask=vkbottle.AccessFlag.SHADER_READ,
    bufferMemoryBarriers=[
        vkbottle.BufferMemoryBarrier(
            srcAccessMask=vkbottle.AccessFlag.NONE,
            dstAccessMask=vkbottle.AccessFlag.SHADER_READ,
            buffer=buffer,
            offset=0,
            size=vkbottle.INFINITY64,
        ),
    ],
)
```

### 6.5.2 常用访问类型

| 类型 | 说明 |
| `NONE` | 无访问（用于初始状态） |
| `COLOR_ATTACHMENT_WRITE` | 颜色附件写入 |
| `COLOR_ATTACHMENT_READ` | 颜色附件读取 |
| `DEPTH_STENCIL_ATTACHMENT_WRITE` | 深度/模板写入 |
| `DEPTH_STENCIL_ATTACHMENT_READ` | 深度/模板读取 |
| `SHADER_READ` | Shader 读取（SRV/UBO） |
| `SHADER_WRITE` | Shader 写入（SSV） |
| `TRANSFER_SRC` | 传输源（读取） |
| `TRANSFER_DST` | 传输目标（写入） |
| `VERTEX_ATTRIBUTE_READ` | 顶点属性读取 |
| `INDIRECT_COMMAND_READ` | 间接命令读取 |
| `INDEX_READ` | 索引读取 |
| `CONSTANT_READ` | 常量读取 |
| `UNIFORM_READ` | Uniform 读取 |
| `FRAMEBUFFER_ATTACHMENT_COLOR_READ` | 帧缓冲颜色读取 |
| `FRAMEBUFFER_ATTACHMENT_DEPTH_STENCIL_READ` | 帧缓冲深度/模板读取 |

## 6.6 内存屏障 vs 资源屏障

```
Memory Barrier:          Resource Barrier:
────────────────         ────────────────
全局屏障                  资源特定屏障

影响整个资源              影响特定资源（Buffer/Image）

适用于：                 适用于：
- 全局内存一致性           - Image 布局转换
                         - Buffer 布局转换
                         - 资源间依赖
```

## 6.7 同步机制速查

| 同步对象 | 作用 | 创建函数 |
| **Fence** | CPU 等待 GPU | `vkCreateFence()` |
| **Semaphore** | GPU 队列同步 | `vkCreateSemaphore()` |
| **Event** | GPU 条件等待 | `vkCreateEvent()` |
| **Barrier** | 资源状态转换 | `vkCmdPipelineBarrier()` |
| **WaitIdle** | 等待所有 GPU 操作完成 | `vkWaitIdle()` |

## 6.8 常见同步模式

### 6.8.1 三缓冲帧同步

```
Frame N:
  获取图像 A → 绘制 A → 呈现 A
  Frame N+1:
  获取图像 B → 绘制 B → 呈现 B
  Frame N+2:
  获取图像 C → 绘制 C → 呈现 C

每个帧使用独立的 Fence，确保 CPU 不超前 GPU
```

### 6.8.2 交叉依赖

```python
# 多个 Queue 间的同步
# Queue 0 (Graphics)  →  Queue 1 (Compute)

# Graphics 提交:
submit_graphics = vkbottle.SubmitInfo(
    waitSemaphores=[],
    waitDstStageMask=...,
    commandBuffers=[graphics_cmd_buffer],
    signalSemaphores=[compute_ready_semaphore],  # 通知 Compute 队列
)
queue_graphics.submit(submit_graphics)

# Compute 提交:
submit_compute = vkbottle.SubmitInfo(
    waitSemaphores=[compute_ready_semaphore],  # 等待 Graphics 完成
    waitDstStageMask=...,
    commandBuffers=[compute_cmd_buffer],
    signalSemaphores=[],
)
queue_compute.submit(submit_compute)
```

---

| 1. 架构与核心概念 | ch01 | ✅ |
| 2. 初始化与生命周期 | ch02 | ✅ |
| 3. 交换链 (Swap Chain) | ch03 | ✅ |
| 4. 渲染管线 (Render Pipeline) | ch04 | ✅ |
| 5. 资源管理 (Buffers & Images) | ch05 | ✅ |
| 6. 命令缓冲与同步 | ch06 | ✅ |

Part I 全部完成 ✅

| Part | 进度 |
| I · Vulkan 核心概念 (6 章) | ✅ 完成 |
| II · 中级 Vulkan (9 章) | 🔲 |
| III · 高级 Vulkan (10 章) | 🔲 |
| IV · Vulkan 实战 (6 章) | 🔲 |
| V · 附录 (4 章) | 🔲 |

| 累计 | 6/35 章 |

| 继续写 Part II（中级 Vulkan，第 7–15 章）？|