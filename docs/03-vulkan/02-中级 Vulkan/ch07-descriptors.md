# 第七章 · 描述符 (Descriptor Sets)

## 7.1 描述符概述 🔥

```
Descriptor = Shader 可以访问的资源句柄

描述符分为三大类:
┌──────────────────────────────────────┐
│  Uniform Buffer (UBO)              │ ← 只读 Uniform 数据
│  Storage Buffer (SSB)               │ ← 可读写（Compute）
│  Sampler + Image (SRV)             │ ← 纹理/采样
└──────────────────────────────────────┘

Descriptor Set = 一组描述符的集合
Descriptor Set Layout = 描述符布局定义（Shader 的输入签名）

类比:
  Descriptor Set Layout  = C 结构体定义
  Descriptor Set         = 结构体实例（绑定具体资源）
  Shader 读取           = 函数读取参数
```

## 7.2 Descriptor Set Layout

### 7.2.1 创建 Layout

```python
import vkbottle

# --- 定义 Layout ---
descriptor_layout_bindings = [
    # 绑定 0: Uniform Buffer
    vkbottle.DescriptorSetLayoutBinding(
        binding=0,
        descriptorType=vkbottle.DescriptorType.UNIFORM_BUFFER,
        descriptorCount=1,
        stageFlags=vkbottle.ShaderStageFlag.VERTEX | vkbottle.ShaderStageFlag.FRAGMENT,
    ),
    # 绑定 1: 采样器
    vkbottle.DescriptorSetLayoutBinding(
        binding=1,
        descriptorType=vkbottle.DescriptorType.SAMPLER,
        descriptorCount=1,
        stageFlags=vkbottle.ShaderStageFlag.FRAGMENT,
    ),
    # 绑定 2: 采样图像
    vkbottle.DescriptorSetLayoutBinding(
        binding=2,
        descriptorType=vkbottle.DescriptorType.SAMPLED_IMAGE,
        descriptorCount=1,
        stageFlags=vkbottle.ShaderStageFlag.FRAGMENT,
    ),
    # 绑定 3: Storage Buffer（Compute Shader）
    vkbottle.DescriptorSetLayoutBinding(
        binding=3,
        descriptorType=vkbottle.DescriptorType.STORAGE_BUFFER,
        descriptorCount=1,
        stageFlags=vkbottle.ShaderStageFlag.COMPUTE,
    ),
]

descriptor_layout_create_info = vkbottle.DescriptorSetLayoutCreateInfo(
    bindings=descriptor_layout_bindings,
)
descriptor_set_layout = device.create_descriptor_set_layout(descriptor_layout_create_info)
```

### 7.2.2 常用 Descriptor 类型

| 类型 | 用途 | Shader 中对应 |
| - | - | - |
| `UNIFORM_BUFFER` | Uniform 数据 | `uniform` |
| `SAMPLED_IMAGE` | 采样纹理 | `texture2D` |
| `SAMPLER` | 采样器 | `sampler2D` |
| `STORAGE_BUFFER` | 可写缓冲 | `buffer` |
| `STORAGE_IMAGE` | 可写纹理 | `image2D` |
| `INPUT_ATTACHMENT` | 输入附件 | `subpassInput` |
| `COMBINED_IMAGE_SAMPLER` | 纹理+采样 | `sampler2D` |
| `INLINE_UNIFORM_BLOCK` | 行内 Uniform | 内联 Uniform |

### 7.2.3 Shader 中的对应声明

```glsl
// 对应 Descriptor Set Layout
// Binding 0: Uniform Buffer
layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
} ubo;

// Binding 1: Sampler
layout(binding = 1) uniform sampler2D texSampler;

// Binding 2: Sampled Image
layout(binding = 2) uniform sampler2D tex;

// Binding 3: Storage Buffer
layout(binding = 3) uniform computeBuffer {
    vec4 data[];
} ssbo;
```

## 7.3 Descriptor Pool

### 7.3.1 创建 Pool

```python
# --- Descriptor Pool ---
# Pool 是描述符的"内存池"
# 一次分配多个描述符（批量管理）

descriptor_pool_sizes = [
    vkbottle.DescriptorPoolSize(
        type=vkbottle.DescriptorType.UNIFORM_BUFFER,
        descriptorCount=1,  # 1 个 UBO
    ),
    vkbottle.DescriptorPoolSize(
        type=vkbottle.DescriptorType.SAMPLER,
        descriptorCount=1,  # 1 个 Sampler
    ),
    vkbottle.DescriptorPoolSize(
        type=vkbottle.DescriptorType.SAMPLED_IMAGE,
        descriptorCount=1,  # 1 个 Sampled Image
    ),
]

descriptor_pool_create_info = vkbottle.DescriptorPoolCreateInfo(
    maxSets=1,  # 最大可分配的 Descriptor Set 数
    poolSizes=descriptor_pool_sizes,
)
descriptor_pool = device.create_descriptor_pool(descriptor_pool_create_info)
```

### 7.3.2 Descriptor Pool 类型

| 类型 | 说明 |
| - | - |
| **FIXED_ALLOCATE** | 固定分配（默认，一次性分配后不能修改） |
| **FREE_DESCRIPTOR_SET_LAYOUT** | 可以分配不同类型的 Set（需要 Vulkan 1.1+） |

## 7.4 Descriptor Set 分配与绑定

### 7.4.1 分配与绑定

```python
# --- 分配 Descriptor Set ---
descriptor_set_allocate_info = vkbottle.DescriptorSetAllocateInfo(
    descriptorPool=descriptor_pool,
    descriptorSetLayouts=[descriptor_set_layout],
)
descriptor_sets = device.allocate_descriptor_sets(descriptor_set_allocate_info)
descriptor_set = descriptor_sets[0]

# --- 更新描述符 ---
# 方法1: Descriptor Write（推荐）
descriptor_writes = [
    # Binding 0: UBO
    vkbottle.DescriptorWrite(
        dstSet=descriptor_set,
        dstBinding=0,
        descriptorCount=1,
        descriptorType=vkbottle.DescriptorType.UNIFORM_BUFFER,
        pBufferInfo=[
            vkbottle.DescriptorBufferInfo(
                buffer=uniform_buffer,
                offset=0,
                range=128,  # 128 bytes
            ),
        ],
    ),
    # Binding 1: Sampler
    vkbottle.DescriptorWrite(
        dstSet=descriptor_set,
        dstBinding=1,
        descriptorCount=1,
        descriptorType=vkbottle.DescriptorType.SAMPLER,
        pSamplerInfo=[sampler],
    ),
    # Binding 2: Image
    vkbottle.DescriptorWrite(
        dstSet=descriptor_set,
        dstBinding=2,
        descriptorCount=1,
        descriptorType=vkbottle.DescriptorType.SAMPLED_IMAGE,
        pImageViewInfo=[
            vkbottle.DescriptorImageInfo(
                imageLayout=vkbottle.ImageLayout.SHADER_READ_ONLY_OPTIMAL,
                imageView=texture_image_view,
                sampler=sampler,
            ),
        ],
    ),
    # Binding 3: Storage Buffer
    vkbottle.DescriptorWrite(
        dstSet=descriptor_set,
        dstBinding=3,
        descriptorCount=1,
        descriptorType=vkbottle.DescriptorType.STORAGE_BUFFER,
        pBufferInfo=[
            vkbottle.DescriptorBufferInfo(
                buffer=compute_buffer,
                offset=0,
                range=vkbottle.INFINITY64,
            ),
        ],
    ),
]

device.update_descriptor_sets(descriptor_writes, [])

# --- 在 Render Loop 中绑定 ---
command_buffer.bind_descriptor_sets(
    pipelineBindPoint=vkbottle.PipelineBindPoint.GRAPHICS,
    layout=pipeline_layout,
    firstSet=0,
    descriptorSets=[descriptor_set],
)
```

### 7.4.2 绑定顺序

```
Pipeline Layout:
├── Set 0: [UBO, Sampler, Image, SSBO]  ← 固定绑定
└── Set 1: [Dynamic Descriptor Set]      ← 动态绑定（可选）

绑定命令:
  vkCmdBindDescriptorSets(
      pipelineBindPoint,
      layout,
      firstSet,       ← 从第几个 Set 开始
      descriptorSets, ← Set 数组
      dynamicOffsets  ← 动态偏移（如果有 Dynamic Layout）
  )
```

## 7.5 Uniform Buffer 详解

### 7.5.1 UBO 创建与使用

```python
# --- 创建 Uniform Buffer ---
ubo_size = 128  # 必须 >= sizeof(UniformBufferObject)

uniform_buffer_create_info = vkbottle.BufferCreateInfo(
    size=ubo_size,
    usage=vkbottle.BufferUsageFlag.UNIFORM_BUFFER,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
)
uniform_buffer = device.create_buffer(uniform_buffer_create_info)

# --- 分配内存 ---
mem_reqs = uniform_buffer.get_memory_requirements()
mem_alloc = vkbottle.MemoryAllocateInfo(
    allocationSize=mem_reqs.size,
    memoryTypeIndex=find_memory_type_index(
        device.get_memory_properties(),
        mem_reqs.memoryTypeBits,
        vkbottle.MemoryPropertyFlag.HOST_VISIBLE | vkbottle.MemoryPropertyFlag.HOIST_COHERENT
    ),
)
uniform_buffer_memory = device.allocate_memory(mem_alloc)
device.bind_buffer_memory(uniform_buffer, uniform_buffer_memory, 0)

# --- 更新 UBO 数据（每帧）---
# 映射内存并写入
uniform_data = numpy.array([
    model_matrix.ravel(),      # mat4
    view_matrix.ravel(),       # mat4
    proj_matrix.ravel(),       # mat4
], dtype=numpy.float32)

mapped_ptr = device.map_memory(uniform_buffer_memory, 0, ubo_size)
mapped_ptr.data = uniform_data.data
device.unmap_memory(uniform_buffer_memory)

# --- 在 Descriptor Write 中绑定 ---
# descriptor_writes[0].pBufferInfo = DescriptorBufferInfo(
#     buffer=uniform_buffer,
#     offset=0,
#     range=ubo_size
# )
```

## 7.6 Push Constants（推送常量）

```python
# 适用于少量、频繁变化的常量（不需要 UBO）

# --- 1. 在 Pipeline Layout 中定义 ---
push_constant_ranges = [
    vkbottle.PushConstantRange(
        stageFlags=vkbottle.ShaderStageFlag.VERTEX | vkbottle.ShaderStageFlag.FRAGMENT,
        offset=0,
        size=64,  # 最多 128 bytes
    ),
]

pipeline_layout_create_info = vkbottle.PipelineLayoutCreateInfo(
    setLayouts=[descriptor_set_layout],
    pushConstantRanges=push_constant_ranges,
)
pipeline_layout = device.create_pipeline_layout(pipeline_layout_create_info)

# --- 2. Shader 中读取 ---
layout(push_constant) uniform PushConstants {
    vec3 lightDir;
    float lightIntensity;
} push;

# --- 3. 绘制时推送 ---
command_buffer.push_constants(
    pipelineLayout=pipeline_layout,
    stageFlags=vkbottle.ShaderStageFlag.VERTEX | vkbottle.ShaderStageFlag.FRAGMENT,
    offset=0,
    size=64,
    data=push_constants_data,
)
```

## 7.7 描述符相关速查

| 对象 | 作用 | 创建/分配 |
| - | - | - | 
| **Descriptor Type** | 描述符类型 | `UNIFORM_BUFFER`, `SAMPLED_IMAGE`, ... |
| **Descriptor Layout** | 描述符布局（签名） | `create_descriptor_set_layout()` |
| **Descriptor Pool** | 描述符池 | `create_descriptor_pool()` |
| **Descriptor Set** | 描述符实例 | `allocate_descriptor_sets()` |
| **Descriptor Write** | 更新描述符 | `update_descriptor_sets()` |
| **Push Constant** | 推送常量 | Pipeline Layout 定义 |
| **Pipeline Layout** | 管线布局（包含 Layouts） | `create_pipeline_layout()` |

---