# 第十章 · 顶点与索引绘制

## 10.1 顶点缓冲（Vertex Buffer）

### 10.1.1 顶点格式定义

```python
import vkbottle

# --- 顶点数据结构 ---
# Vulkan 中顶点数据必须是连续内存块
# 需要定义每行的布局（Stride）

class Vertex:
    def __init__(self, pos, color):
        self.pos = pos      # vec3 (float * 3 = 12 bytes)
        self.color = color  # vec3 (float * 3 = 12 bytes)
    
    @property
    def stride(self):
        return 24  # 12 + 12

# --- 顶点数据 ---
vertices = numpy.array([
    # pos                color
    (-0.5, -0.5, 0.0), (1.0, 0.0, 0.0),  # 左下
    ( 0.5, -0.5, 0.0), (0.0, 1.0, 0.0),  # 右下
    ( 0.0,  0.5, 0.0), (0.0, 0.0, 1.0),  # 顶部
], dtype=numpy.float32)

# 展平为 1D 数组
vertex_data = vertices.ravel()
```

### 10.1.2 顶点属性描述

```python
# --- 在 Pipeline 中定义顶点属性 ---
vertex_input_info = vkbottle.VertexInputStateCreateInfo(
    vertexBindingDescriptions=[  # 绑定描述
        vkbottle.VertexInputBindingDescription(
            binding=0,             # 绑定槽位
            stride=24,            # 每行步长（字节）
            inputRate=vkbottle.VertexInputRate.VERTEX,  # 每顶点
        ),
    ],
    vertexAttributeDescriptions=[  # 属性描述
        # 位置属性 (location=0)
        vkbottle.VertexInputAttributeDescription(
            location=0,          # Shader 中的 location
            binding=0,           # 绑定槽位
            format=vkbottle.Format.R32G32B32_SFLOAT,
            offset=0,            # 偏移（pos 从 0 开始）
        ),
        # 颜色属性 (location=1)
        vkbottle.VertexInputAttributeDescription(
            location=1,
            binding=0,
            format=vkbottle.Format.R32G32B32_SFLOAT,
            offset=12,           # 偏移（color 从 12 字节开始）
        ),
    ],
)
```

### 10.1.3 Shader 中对应定义

```glsl
// 顶点着色器
layout(location = 0) in vec3 aPos;    // 位置 (R32G32B32_SFLOAT)
layout(location = 1) in vec3 aColor;  // 颜色 (R32G32B32_SFLOAT)
```

## 10.2 索引缓冲（Index Buffer）

### 10.2.1 索引缓冲创建

```python
# --- 索引数据 ---
indices = numpy.array([
    0, 1, 2,  # 三角形
], dtype=numpy.uint32)

# --- 创建索引缓冲 ---
index_buffer_create_info = vkbottle.BufferCreateInfo(
    size=indices.nbytes,
    usage=vkbottle.BufferUsageFlag.INDEX_BUFFER | vkbottle.BufferUsageFlag.TRANSFER_DST,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
)
index_buffer = device.create_buffer(index_buffer_create_info)

# --- 分配内存 ---
index_mem_reqs = index_buffer.get_memory_requirements()
index_mem_alloc = vkbottle.MemoryAllocateInfo(
    allocationSize=index_mem_reqs.size,
    memoryTypeIndex=find_memory_type_index(
        device.get_memory_properties(),
        index_mem_reqs.memoryTypeBits,
        vkbottle.MemoryPropertyFlag.HOST_VISIBLE | vkbottle.MemoryPropertyFlag.HOIST_COHERENT,
    ),
)
index_buffer_memory = device.allocate_memory(index_mem_alloc)
device.bind_buffer_memory(index_buffer, index_buffer_memory, 0)

# --- 上传数据 ---
mapped_ptr = device.map_memory(index_buffer_memory, 0, indices.nbytes)
mapped_ptr.data = indices.data
device.unmap_memory(index_buffer_memory)
```

### 10.2.2 索引类型

| 类型 | Vulkan 对应 | 说明 |
| 16-bit (`uint16_t`) | `VK_FORMAT_R32_UINT` | 最多 65535 个顶点 |
| 32-bit (`uint32_t`) | `VK_FORMAT_R32_UINT` | **推荐 ✅** |

```glsl
// Shader 中不需要索引，索引在 Pipeline 中配置
// Pipeline 中: command_buffer.bind_index_buffer(index_buffer, 0, vkbottle.IndexType.UINT32)
```

## 10.3 绘制调用 🔥

### 10.3.1 vkCmdDraw（顶点绘制）

```python
# --- 绘制（使用顶点缓冲）---
command_buffer.draw(
    vertexCount=3,      # 顶点数
    instanceCount=1,    # 实例数
    firstVertex=0,      # 从哪个顶点开始
    firstInstance=0,    # 从哪个实例开始
)
```

### 10.3.2 vkCmdDrawIndexed（索引绘制）

```python
# --- 绘制（使用索引缓冲）---
command_buffer.bind_index_buffer(
    buffer=index_buffer,
    offset=0,
    indexType=vkbottle.IndexType.UINT32,
)

command_buffer.draw_indexed(
    indexCount=3,       # 索引数
    instanceCount=1,    # 实例数
    firstIndex=0,       # 从哪个索引开始
    vertexOffset=0,     # 顶点偏移（索引 + offset = 实际顶点）
    firstInstance=0,    # 从哪个实例开始
)
```

### 10.3.3 vkCmdDrawIndirect（间接绘制）

```python
# 从缓冲区读取绘制参数（GPU 生成）
# 用于实例化渲染、GPU 驱动的渲染

draw_cmd = vkbottle.DrawCmd(
    vertexCount=3,
    instanceCount=1,
    firstVertex=0,
    firstInstance=0,
)

indirect_buffer = device.create_buffer(
    vkbottle.BufferCreateInfo(
        size=numpy.dtype(vkbottle.DrawCmd).itemsize,
        usage=vkbottle.BufferUsageFlag.INDIRECT_BUFFER,
    ),
)

command_buffer.draw_indirect(
    buffer=indirect_buffer,
    offset=0,
    drawCount=1,
    stride=numpy.dtype(vkbottle.DrawCmd).itemsize,
)
```

## 10.4 图元拓扑类型

| 拓扑 | 说明 | 顶点数 |
| `TRIANGLE_LIST` | 三角形列表 | 3N |
| `LINE_LIST` | 线段列表 | 2N |
| `LINE_STRIP` | 线段链 | N+1 |
| `POINT_LIST` | 点列表 | N |
| `PATCH_LIST` | 补丁列表（Tessellation） | N |
| `TRIANGLE_STRIP` | 三角形带 | N+2 |
| `TRIANGLE_FAN` | 三角形扇 | N+2 |

## 10.5 绘制命令速查

| 命令 | 用途 |
| `vkCmdDraw()` | 直接顶点绘制 |
| `vkCmdDrawIndexed()` | 索引绘制 |
| `vkCmdDrawIndirect()` | 间接绘制 |
| `vkCmdDrawIndexedIndirect()` | 间接索引绘制 |
| `vkCmdDrawIndirectCountKHR()` | 条件绘制（计数） |
| `vkCmdBeginTransformFeedbackEXT()` | 几何着色器反馈 |
| `vkCmdEndTransformFeedbackEXT()` | 几何着色器反馈结束 |

## 10.6 顶点属性格式

| Vulkan 格式 | Shader 对应 |
|--|--|
| `R32_SFLOAT` | `float` |
| `R32G32_SFLOAT` | `vec2` |
| `R32G32B32_SFLOAT` | `vec3` |
| `R32G32B32A32_SFLOAT` | `vec4` |
| `R32G32B32A32_SNORM` | `vec4`（归一化） |
| `R8G8B8A8_UNORM` | `vec4`（0-255） |
| `R8G8B8A8_SNORM` | `vec4`（-1 到 1） |
| `R32_UINT` | `uint` |
| `R32G32_UINT` | `uvec2` |
| `R32G32B32_UINT` | `uvec3` |

---

| 7. 描述符 | ✅ |
| 8. 深度与模板 | ✅ |
| 9. 采样器与纹理 | ✅ |
| 10. 顶点与索引绘制 | ✅ |
| 11-15 | 🔲 |
| 16-25 | 🔲 |
| 26-35 | 🔲 |
| 36-40 | 🔲 |
| A-D 附录 | 🔲 |