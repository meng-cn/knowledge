# 第二十九章 · 异步计算 (Async Compute)

## 29.1 异步计算概述

```
多队列计算 = 图形 + 计算同时工作

传统单队列:
  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
  │ GPU0 │   │ GPU1 │   │ GPU0 │   │ GPU1 │
  │Graphics│      │      │Compute│      │
  └──────┘   └──────┘   └──────┘   └──────┘
  资源浪费: ~50%

多队列异步:
  ┌──────┐   ┌──────┐
  │ GPU0 │   │ GPU1 │
  │Graphics│   │Compute│
  │        │   │        │
  └──────┘   └──────┘
  GPU 利用率: ~90%+ ✅
```

## 29.2 多队列设备

### 29.2.1 查询队列族

```python
import vkbottle

# 查询所有 Queue Family
queue_families = device.get_physical_device().get_queue_families()

graphics_queue_family = None
compute_queue_family = None

for i, qf in enumerate(queue_families):
    if qf.queueFlags & vkbottle.QueueFlag.GRAPHICS:
        graphics_queue_family = i
    if qf.queueFlags & vkbottle.QueueFlag.COMPUTE:
        compute_queue_family = i

# 如果 Graphics 和 Compute 在不同 Queue Family
if graphics_queue_family != compute_queue_family:
    # 需要创建两个不同的 Logical Device
    device_create_info = vkbottle.DeviceCreateInfo(
        pQueueCreateInfos=[
            vkbottle.DeviceQueueCreateInfo(
                queueFamilyIndex=graphics_queue_family,
                pQueuePriorities=[1.0],
            ),
            vkbottle.DeviceQueueCreateInfo(
                queueFamilyIndex=compute_queue_family,
                pQueuePriorities=[1.0],
            ),
        ],
    )
    logical_device = physical_device.create_device(device_create_info)
```

### 29.2.2 获取 Queue

```python
graphics_queue = device.get_queue(
    queueFamilyIndex=graphics_queue_family,
    queueIndex=0,
)

compute_queue = device.get_queue(
    queueFamilyIndex=compute_queue_family,
    queueIndex=0,
)
```

## 29.3 多 Queue 同步

### 29.3.1 Semaphore 同步

```python
# 创建 Semaphore 用于 Queue 间同步
graphics_ready_semaphore = device.create_semaphore(
    vkbottle.SemaphoreCreateInfo()
)
compute_ready_semaphore = device.create_semaphore(
    vkbottle.SemaphoreCreateInfo()
)

# --- 步骤 1: Graphics 完成 → Signal ---
graphics_submit = vkbottle.SubmitInfo(
    waitSemaphores=[],
    waitDstStageMask=vkbottle.AccessFlag.NONE,
    commandBuffers=[graphics_cmd_buffer],
    signalSemaphores=[graphics_ready_semaphore],
)
graphics_queue.submit(graphics_submit)

# --- 步骤 2: Compute 等待 Graphics → 执行 ---
compute_submit = vkbottle.SubmitInfo(
    waitSemaphores=[graphics_ready_semaphore],
    waitDstStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
    commandBuffers=[compute_cmd_buffer],
    signalSemaphores=[compute_ready_semaphore],
)
compute_queue.submit(compute_submit)

# --- 步骤 3: Graphics 等待 Compute → 完成 ---
graphics_submit2 = vkbottle.SubmitInfo(
    waitSemaphores=[compute_ready_semaphore],
    waitDstStageMask=vkbottle.AccessFlag.NONE,
    commandBuffers=[graphics_cmd_buffer2],
    signalSemaphores=[],
)
graphics_queue.submit(graphics_submit2)
```

## 29.4 计算着色器

### 29.4.1 创建 Compute Pipeline

```python
# --- 加载 Compute Shader ---
compute_shader_module = device.create_shader_module(
    vkbottle.ShaderModuleCreateInfo(
        pCode=compute_spv,
    ),
)

compute_stage = vkbottle.PipelineShaderStageCreateInfo(
    stage=vkbottle.ShaderStageFlag.COMPUTE,
    module=compute_shader_module,
    pName=b'main',
)

# --- 创建 Pipeline Layout ---
compute_pipeline_layout = device.create_pipeline_layout(
    vkbottle.PipelineLayoutCreateInfo(
        setLayouts=[compute_descriptor_set_layout],
        pushConstantRanges=[],
    ),
)

# --- 创建 Compute Pipeline ---
compute_pipeline_info = vkbottle.ComputePipelineCreateInfo(
    stage=compute_stage,
    layout=compute_pipeline_layout,
)
compute_pipeline = device.create_compute_pipelines(None, [compute_pipeline_info])[0]
```

### 29.4.2 执行 Compute

```python
# --- 创建 Command Pool ---
compute_cmd_pool = device.create_command_pool(
    vkbottle.CommandPoolCreateInfo(
        queueFamilyIndex=compute_queue_family,
        flags=vkbottle.CommandPoolCreateFlag.RESET_COMMAND_BUFFER,
    ),
)

# --- 分配 Command Buffer ---
compute_cmd_buffer = device.allocate_command_buffers(
    vkbottle.CommandBufferAllocateInfo(
        commandPool=compute_cmd_pool,
        level=vkbottle.CommandBufferLevel.PRIMARY,
        commandBufferCount=1,
    ),
)[0]

# --- 开始记录 ---
compute_cmd_buffer.begin(vkbottle.CommandBufferBeginInfo())

# --- 绑定 Compute Pipeline ---
compute_cmd_buffer.bind_pipeline_compute(compute_pipeline)

# --- 绑定描述符 ---
compute_cmd_buffer.bind_descriptor_sets(
    vkbottle.PipelineBindPoint.COMPUTE,
    compute_pipeline_layout,
    compute_descriptor_set,
)

# --- Dispatch ---
compute_cmd_buffer.dispatch(
    groupCountX=16,  # x 方向工作组数
    groupCountY=16,  # y 方向工作组数
    groupCountZ=1,   # z 方向工作组数
)

compute_cmd_buffer.end()

# --- 提交到 Compute Queue ---
compute_queue.submit(compute_cmd_buffer)
```

### 29.4.3 Compute Shader 示例

```glsl
// compute.glsl
#version 450

// 工作组大小
layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

// 计算着色器可以读写缓冲区
layout(binding = 0) buffer InputData {
    vec4 data[];  // 输入数据
} input;

layout(binding = 1) buffer OutputData {
    vec4 data[];  // 输出数据
} output;

// 共享内存（工作组内）
shared vec4 shared_data[256];  // 16*16

void main() {
    uint idx = gl_GlobalInvocationID.x + gl_GlobalInvocationID.y * 16;
    
    // 加载到共享内存
    shared_data[gl_LocalInvocationIndex] = input.data[idx];
    memoryBarrierShared();
    barrier();
    
    // 计算
    vec4 result = compute(shared_data[gl_LocalInvocationIndex]);
    
    // 存储结果
    output.data[idx] = result;
    
    memoryBarrier();  // 确保写入完成
}

// 工作组大小限制:
// local_size_x: 1 - 1024
// local_size_y: 1 - 1024
// local_size_z: 1 - 64
// groupCount_x * local_size_x = workgroup 大小
```

## 29.5 计算着色器内存

### 29.5.1 Local/Shared Memory

```glsl
// 局部内存（工作组内共享）
shared float shared_buffer[256];

// 使用
barrier();  // 等待所有工作组成员到达
shared_buffer[gl_LocalInvocationIndex] = value;
barrier();  // 确保所有成员完成写入
value = shared_buffer[gl_LocalInvocationIndex];
```

### 29.5.2 工作组大小优化

```python
# 查询设备支持的工作组大小
properties = device.get_physical_device().get_properties()
max_work_group = properties.maxComputeWorkGroupSize
print(f"Max work group size: {max_work_group}")  # (maxX, maxY, maxZ)

# 推荐工作组大小:
# local_size_x = 8/16/32
# local_size_y = 8/16
# local_size_z = 1
```

## 29.6 异步计算速查

| 概念 | 说明 |
| **Queue Family** | 队列族（Graphics/Compute/Transfer） |
| **Semaphore** | Queue 间同步 |
| **Fence** | CPU 等待 Queue |
| **Compute Shader** | GPU 计算着色器 |
| **Dispatch** | 执行计算着色器 |
| **Shared Memory** | 工作组内共享内存 |
| **Barrier** | 工作组内同步 |
| **Pipeline Barrier** | Queue 间同步 |

---

| 26-28 | ✅ |
| **29. 异步计算** | ✅ |
| **30. 计算着色器** | 🔲 |