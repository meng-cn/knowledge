# 第三十章 · 计算着色器 (Compute Shader)

## 30.1 计算着色器概述

```
计算着色器 (Compute Shader) = GPU 上的通用计算

GPU 计算 vs CPU 计算:
─────────────────────────────

GPU (Compute Shader):
┌──────────────────────┐
│ 1000+ 并行线程         │
│ 适合: 并行计算、大规模数据 │
│ 带宽: 300-1000 GB/s  │
│ 延迟: 高 (ms 级)       │
└───────────────────┘

CPU:
┌──────────────────────┐
│ 4-64 个核心            │
│ 适合: 复杂逻辑、顺序计算 │
│ 带宽: 50-100 GB/s    │
│ 延迟: 低 (ns 级)       │
└───────────────────┘
```

## 30.2 计算着色器基础

### 30.2.1 基本结构

```glsl
#version 450

// 工作组大小（必须在编译时确定）
layout(local_size_x = 256, local_size_y = 1, local_size_z = 1) in;

// 输入数据
layout(set = 0, binding = 0) buffer InputBuffer {
    float data[];
} input;

// 输出数据
layout(set = 0, binding = 1) buffer OutputBuffer {
    float result[];
} output;

void main() {
    // 全局工作索引
    uint idx = gl_GlobalInvocationID.x;
    
    // 工作组索引
    uint gid = gl_GroupID.x;
    
    // 工作组内局部索引
    uint lid = gl_LocalInvocationID.x;
    
    // 工作组成员总数
    uint localSize = gl_WorkGroupSize.x;
    
    // 工作组总数
    uint numGroups = gl_NumWorkGroups.x;
    
    // 计算
    result[idx] = compute(data[idx]);
}
```

### 30.2.2 内置变量

| 变量 | 类型 | 说明 |
|--|--|
| `gl_GlobalInvocationID` | `uvec3` | 全局线程 ID |
| `gl_LocalInvocationID` | `uvec3` | 工作组内线程 ID |
| `gl_WorkGroupID` | `uvec3` | 工作组 ID |
| `gl_LocalInvocationIndex` | `uint` | 工作组内线性索引 |
| `gl_WorkGroupSize` | `uvec3` | 工作组大小 |
| `gl_NumWorkGroups` | `uvec3` | 工作组总数 |
| `gl_NumWorkGroupsEXT` | `uvec3` | 工作组总数（扩展） |
| `gl_SampleID` | `uint` | 采样 ID（MSAA） |

## 30.3 常用 Compute Shader 模式

### 30.3.1 点乘

```glsl
#version 450

layout(local_size_x = 256, local_size_y = 1, local_size_z = 1) in;

layout(set = 0, binding = 0) readonly buffer A {
    float a[];
} buf_a;

layout(set = 0, binding = 1) readonly buffer B {
    float b[];
} buf_b;

layout(set = 0, binding = 2) writeonly buffer Result {
    float result[];
} buf_result;

void main() {
    uint idx = gl_GlobalInvocationID.x;
    result[idx] = a[idx] * b[idx];
}
```

### 30.3.2 矩阵乘法

```glsl
#version 450

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

layout(set = 0, binding = 0) readonly buffer MatA {
    mat4 matrix[];
} mat_a;

layout(set = 0, binding = 1) readonly buffer MatB {
    mat4 matrix[];
} mat_b;

layout(set = 0, binding = 2) writeonly buffer Result {
    mat4 matrix[];
} result;

void main() {
    uint x = gl_GlobalInvocationID.x;
    uint y = gl_GlobalInvocationID.y;
    
    // 计算矩阵乘法
    result.matrix[x + y * 4] = mat_a.matrix[x] * mat_b.matrix[y];
}
```

### 30.3.3 并行归约

```glsl
#version 450

layout(local_size_x = 256, local_size_y = 1, local_size_z = 1) in;

shared float shared_data[256];

layout(set = 0, binding = 0) readonly buffer Input {
    float data[];
} input;

layout(set = 0, binding = 1) writeonly buffer Output {
    float result[];
} output;

void main() {
    uint idx = gl_GlobalInvocationID.x;
    shared_data[lid] = input.data[idx];
    
    // 归约
    for (uint stride = 128; stride > 0; stride >>= 1) {
        barrier();
        if (lid < stride) {
            shared_data[lid] += shared_data[lid + stride];
        }
        barrier();
    }
    
    // 每个工作组写一个结果
    if (lid == 0) {
        output.result[gid] = shared_data[0];
    }
}
```

### 30.3.4 粒子系统

```glsl
#version 450

layout(local_size_x = 256, local_size_y = 1, local_size_z = 1) in;

struct Particle {
    vec3 position;
    vec3 velocity;
    float life;
};

layout(set = 0, binding = 0) buffer ParticlesIn {
    Particle particles[];
} particles_in;

layout(set = 0, binding = 1) buffer ParticlesOut {
    Particle particles[];
} particles_out;

uniform float dt;
uniform vec3 gravity;

void main() {
    uint idx = gl_GlobalInvocationID.x;
    
    Particle p = particles_in.particles[idx];
    
    // 更新物理
    p.velocity += gravity * dt;
    p.position += p.velocity * dt;
    p.life -= dt;
    
    particles_out.particles[idx] = p;
}
```

## 30.4 工作组大小优化

### 30.4.1 最佳工作组大小

```python
# 查询设备支持的工作组大小
props = device.get_physical_device().get_properties()
max_work_group = props.maxComputeWorkGroupSize
max_work_group_invocations = props.maxComputeWorkGroupInvocations
max_work_group_size = props.maxComputeWorkGroupSize

print(f"Max work group: ({max_work_group})")
print(f"Max invocations: {max_work_group_invocations}")

# 推荐的工作组大小:
# local_size_x = 256/512 (向量/矩阵计算)
# local_size_x = 16, local_size_y = 16 (2D 计算)
# local_size_x = 64, local_size_y = 16 (纹理处理)
```

### 30.4.2 工作组大小选择

| 工作负载 | 推荐工作组大小 |
| 向量计算 | `local_size_x = 256` |
| 矩阵计算 | `local_size_x = 16, local_size_y = 16` |
| 纹理处理 | `local_size_x = 16, local_size_y = 16` |
| 粒子系统 | `local_size_x = 256` |
| 图像滤波 | `local_size_x = 16, local_size_y = 16` |
| 通用计算 | `local_size_x = 64-256` |

## 30.5 内存屏障

### 30.5.1 工作组内屏障

```glsl
// 工作组内屏障
barrier();  // 等待同组所有线程
memoryBarrierShared();  // 确保共享内存可见
```

### 30.5.2 全局内存屏障

```glsl
// 确保全局内存写入完成
memoryBarrier();  // 所有共享内存
memoryBarrierBuffer();  // 确保 Buffer 写入完成
memoryBarrierImage();  // 确保 Image 写入完成
```

## 30.6 计算着色器 vs 图形着色器

| 特性 | Compute | Graphics |
| **用途** | 通用计算 | 渲染 |
| **工作组** | 可自定义 | 固定 |
| **输入** | Buffer/Image | Vertex/Fragment |
| **输出** | Buffer/Image | Framebuffer |
| **同步** | barrier/memoryBarrier | PipelineBarrier |
| **并行度** | 1000+ 线程 | 数千+ 线程 |
| **延迟** | 高 | 低 |
| **精度** | 可高 | 受显示限制 |

## 30.7 计算着色器速查

| 概念 | 说明 |
| `local_size_x/y/z` | 工作组大小 |
| `gl_GlobalInvocationID` | 全局线程 ID |
| `gl_LocalInvocationID` | 工作组内线程 ID |
| `gl_WorkGroupID` | 工作组 ID |
| `barrier()` | 工作组内同步 |
| `memoryBarrier()` | 全局内存屏障 |
| `shared` | 工作组内共享内存 |
| `dispatch(x,y,z)` | 执行计算着色器 |
| `groupMemoryBarrier()` | 工作组间同步 |
| `sharedBarrier()` | 工作组内屏障 |

---

| 26-29 | ✅ |
| **30. 计算着色器** | ✅ |
| **Part IV · 全部完成** | ✅ |