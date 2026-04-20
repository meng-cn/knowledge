# 第十七章 · 实例化渲染 (Instancing)

## 17.1 实例化概述

```
实例化 (Instancing) = 用一次 DrawCall 绘制多个相同物体

传统方式 (N 次 DrawCall):
  for each object:
      bind_vertex_buffer()
      bind_uniform_matrix()
      vkCmdDraw()  ← N 次!

实例化 (1 次 DrawCall):
  bind_vertex_buffer()
  bind_instance_data()
  vkCmdDrawInstanced(n)  ← 1 次!

性能提升: 100x+（减少 CPU-GPU 同步开销）
```

## 17.2 实例化数据结构

```python
# --- 顶点数据 ---
vertices = numpy.array([
    (-0.5, -0.5, 0.0, 1.0, 0.0, 0.0),  # 左下
    ( 0.5, -0.5, 0.0, 0.0, 1.0, 0.0),  # 右下
    ( 0.0,  0.5, 0.0, 0.0, 0.0, 1.0),  # 顶部
], dtype=numpy.float32)

# --- 实例数据 ---
# 每个实例的属性（变换矩阵、颜色等）
class InstanceData:
    def __init__(self, model_matrix, color):
        self.model = numpy.array(model_matrix, dtype=numpy.float32).ravel()  # 16 floats
        self.color = numpy.array(color, dtype=numpy.float32)                   # 3 floats
    
    @property
    def stride(self):
        return 16 * 4 + 3 * 4  # 76 bytes

num_instances = 100
instance_data = numpy.array([
    InstanceData(
        model_matrix=compute_transform(i, num_instances),
        color=(random(), random(), random())
    ) for i in range(num_instances)
])
```

## 17.3 顶点属性描述

```python
# --- 顶点绑定描述（关键：inputRate = INSTANCE）---
vertex_input_info = vkbottle.VertexInputStateCreateInfo(
    vertexBindingDescriptions=[
        # 绑定 0: 顶点属性（每顶点）
        vkbottle.VertexInputBindingDescription(
            binding=0,
            stride=numpy.dtype(numpy.float32).itemsize * 6,  # 6 floats
            inputRate=vkbottle.VertexInputRate.VERTEX,
        ),
        # 绑定 1: 实例属性（每实例）
        vkbottle.VertexInputBindingDescription(
            binding=1,
            stride=76,  # 16*4 + 3*4 = 76 bytes
            inputRate=vkbottle.VertexInputRate.INSTANCE,  # ← 关键！
        ),
    ],
    vertexAttributeDescriptions=[
        # 位置属性 (每顶点)
        vkbottle.VertexInputAttributeDescription(
            location=0,
            binding=0,
            format=vkbottle.Format.R32G32B32_SFLOAT,
            offset=0,
        ),
        # 颜色属性 (每顶点)
        vkbottle.VertexInputAttributeDescription(
            location=1,
            binding=0,
            format=vkbottle.Format.R32G32B32_SFLOAT,
            offset=12,
        ),
        # 实例变换 (每实例)
        vkbottle.VertexInputAttributeDescription(
            location=2,
            binding=1,
            format=vkbottle.Format.R32G32G32B32_SFLOAT,  # 前4个浮点 = 16 bytes
            offset=0,
        ),
    ],
)
```

## 17.4 Shader 中读取实例数据

```glsl
#version 450

// 顶点着色器
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aColor;
layout(location = 2) in vec4 aInstanceModel;  // 实例数据（每行 4 floats）
layout(location = 6) in vec4 aInstanceModel;  // 第二行
layout(location = 10) in vec4 aInstanceModel; // 第三行
layout(location = 14) in vec4 aInstanceModel; // 第四行

uniform mat4 uView;
uniform mat4 uProj;

out vec3 vColor;
out vec3 vWorldPos;

void main() {
    // 构建模型矩阵（从顶点属性恢复 mat4）
    mat4 model = mat4(
        aInstanceModel0,
        aInstanceModel1,
        aInstanceModel2,
        aInstanceModel3
    );
    
    // 实例变换
    vec4 worldPos = model * vec4(aPos, 1.0);
    gl_Position = uProj * uView * worldPos;
    vColor = aColor;
    vWorldPos = worldPos.xyz;
}
```

## 17.5 实例化绘制

```python
# --- 绑定实例缓冲 ---
command_buffer.bind_vertex_buffers(
    firstBinding=0,
    vertexBuffers=[vertex_buffer],
    offsets=[0],
)
command_buffer.bind_vertex_buffers(
    firstBinding=1,
    vertexBuffers=[instance_buffer],
    offsets=[0],
)

# --- 实例化绘制 ---
command_buffer.draw(
    vertexCount=3,      # 每个实例的顶点数
    instanceCount=num_instances,  # 实例数 ← 关键参数
    firstVertex=0,
    firstInstance=0,    # 从第几个实例开始
)

# --- 或使用 DrawInstanced ---
command_buffer.draw_instanced(
    vertexCount=3,
    instanceCount=num_instances,
    firstVertex=0,
    firstInstance=0,
)
```

## 17.6 使用 Uniform Buffer 传递实例变换

```glsl
// Shader 中使用 UBO 传递实例变换
layout(binding = 0) uniform UniformBufferObject {
    mat4 view;
    mat4 proj;
    // 实例变换可以放在第二个 UBO 或 Push Constants 中
} ubo;

// 如果需要每个实例不同的变换：
layout(binding = 1) uniform InstanceUBO {
    mat4 model;  // 如果是单个 Uniform 用于所有实例
} instance_ubo;
```

## 17.7 实例化性能对比

| 方式 | DrawCalls | CPU 时间 | GPU 利用率 |
| - | - | - | - |
| 逐个绘制 (N=1000) | 1000 | ~15 ms | ~40% |
| **实例化 (N=1000)** | **1** | **~0.5 ms** | **~90%** ✅ |

## 17.8 实例化速查

| 概念 | 要点 |
| - | - |
| inputRate | VERSE = 每顶点, INSTANCE = 每实例 |
| draw() | instanceCount > 1 即实例化 |
| vertexOffset | 顶点索引偏移 |
| firstInstance | 从哪个实例开始 |
| 实例数据 | 通常放在独立 Buffer 或 UBO |
| Shader | 通过 `in` 属性读取实例数据 |

---
