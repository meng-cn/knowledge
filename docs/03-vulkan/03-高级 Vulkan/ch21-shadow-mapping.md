# 第二十章 · 阴影映射 (Shadow Mapping)

## 20.1 阴影映射概述

```
Shadow Mapping = 从光源视角渲染深度 → 比较阴影

核心概念:
┌───────────────┐      ┌──────────────────┐
│ 光源相机视图    │      │  Shadow Map       │
│ (Shadow Camera) │  →  │  深度纹理 (Z)      │
└─────────────┘      └───────────────────┘

渲染流程:
  1. 从光源视角渲染场景深度 → Shadow Map
  2. 从相机视角渲染场景，同时比较 Shadow Map
  3. 像素在 Shadow Map 中更近 → 阴影中（变暗）
  4. 像素在 Shadow Map 中更远 → 光照中（亮）
```

## 20.2 Shadow Camera 设置

```python
def setup_shadow_camera(scene_light, view_matrix, projection_matrix):
    """设置阴影相机（通常使用正交相机）"""
    
    # 1. 计算包围盒（场景所有可见物体）
    bounds = compute_bounding_box(scene)
    
    # 2. 计算光源到包围盒的距离
    light_to_bounds = bounds.center - scene_light.position
    
    # 3. 计算阴影相机矩阵
    shadow_view = calculate_look_at(scene_light.position, 
                                    light_to_bounds)
    
    # 4. 正交投影
    shadow_proj = calculate_orthographic_projection(bounds, 
                                                     light_to_bounds)
    
    # 5. 阴影纹理（通常 1024×1024 或 2048×2048）
    shadow_map = create_render_target(device, 1024, 1024, 
                                       vkbottle.Format.D32_SFLOAT)
    
    return shadow_view, shadow_proj, shadow_map
```

## 20.3 Shadow Pass

```python
def render_shadow_pass(device, command_buffer, shadow_camera, shadow_map, scene):
    """Pass 1: 从光源视角渲染深度到 Shadow Map"""
    
    # 1. 开始 Render Pass（只有深度附件）
    render_pass_begin_info = vkbottle.RenderPassBeginInfo(
        renderPass=shadow_render_pass,
        framebuffer=shadow_framebuffer,
        renderArea=vkbottle.Rect2D(offset=(0, 0), extent=(1024, 1024)),
        clearValues=[
            vkbottle.ClearValue(depth=1.0),
        ],
    )
    command_buffer.begin_render_pass(render_pass_begin_info)
    
    # 2. 绑定 Shadow Pipeline
    command_buffer.bind_pipeline_graphics(shadow_pipeline)
    
    # 3. 更新 UBO（阴影相机矩阵）
    update_ubo_with_shadow_camera(shadow_view, shadow_proj)
    
    # 4. 绑定描述符集
    command_buffer.bind_descriptor_sets(
        vkbottle.PipelineBindPoint.GRAPHICS,
        pipeline_layout,
        [descriptor_set],
    )
    
    # 5. 绘制所有物体
    for obj in scene.objects:
        command_buffer.bind_vertex_buffers(0, [obj.vertex_buffer], [0])
        command_buffer.draw(
            vertexCount=obj.vertex_count,
            instanceCount=1,
            firstVertex=0,
            firstInstance=0,
        )
    
    command_buffer.end_render_pass()
```

## 20.4 Shader 中的 Shadow Mapping

```glsl
// Vertex Shader - Shadow pass
#version 450

layout(binding = 0) uniform UniformBufferObject {
    mat4 shadowViewProj;  // 光源视角+投影矩阵
} ubo;

layout(location = 0) in vec3 aPos;

void main() {
    // 将顶点转换到光源裁剪空间
    gl_Position = ubo.shadowViewProj * vec4(aPos, 1.0);
    gl_Position.z = gl_Position.z * 0.5 + 0.5;  // [0, 1] 范围
}

// Fragment Shader - Shadow pass
#version 450
out float fragDepth;
void main() {
    fragDepth = gl_Position.z;  // 输出深度到 Shadow Map
}

// --- 光照 Pass Shader ---
#version 450

// 从光源视角的深度纹理
layout(binding = 2) uniform sampler2DShadow shadowMap;

uniform mat4 shadowViewProj;
uniform vec3 lightPos;

in vec3 vWorldPos;  // 世界空间位置

// 将世界空间位置转换到光源裁剪空间
vec4 shadowPos = shadowViewProj * vec4(vWorldPos, 1.0);
shadowPos.xyz /= shadowPos.w;  // 透视除法
shadowPos.xyz = shadowPos.xyz * 0.5 + 0.5;  // 归一化到 [0, 1]

// 采样 Shadow Map
float shadow = texture(shadowMap, shadowPos.xyz);

// 判断是否在阴影中
float lighting = (shadowPos.z <= shadow ? 1.0 : 0.3);  // 阴影中 30% 亮度
```

## 20.5 PCF (Percentage-Closer Filtering)

```glsl
// 阴影边缘锯齿问题 → PCF 解决

// 传统 Shadow Mapping:
float shadow = shadow > depth ? 1.0 : 0.0;  // 硬阴影

// PCF (4x):
float shadow = 0.0;
for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
        shadow += (shadowMap[i, j] > depth ? 1.0 : 0.0);
    }
}
shadow /= 4.0;  // 平滑阴影 ✅
```

### PCF 实现（Vulkan 内建支持）

```python
# 在 Sampler 中设置比较函数
sampler_shadow = device.create_sampler(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.NEAREST,
    compareEnable=vkbottle.Bool(1),  # 启用比较模式
    compareOp=vkbottle.CompareOp.LESS_OR_EQUAL,
    addressModeU=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
    addressModeV=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
)
```

## 20.6 阴影偏移 (Shadow Bias)

```
问题: 阴影自遮挡（Shadow Acne）

解决方法: 深度偏置

# Shader 中:
float shadow = texture(shadowMap, shadowPos.xyz + bias);
// 或 Pipeline 中设置深度偏置:
command_buffer.set_depth_bias(1.0, 0.0, 0.0);  // 常量偏置
command_buffer.set_depth_bias_slope(0.0, 0.0);   # 斜率偏置
```

## 20.7 阴影映射优化

| 优化方法 | 说明 |
| - | - |
| **PCF** | 平滑阴影边缘 |
| **Shadow Bias** | 解决自遮挡 |
| **Cascade Shadow Maps** | 多个阴影贴图（近处详细、远处粗略）|
| **Directional Light** | 正交相机（定向光）|
| **Point Light** | 立方体贴图 |
| **Shadow Map 大小** | 近处用 2048，远处用 1024 |
| **Frustum Culling** | 只渲染对光源可见的物体 |

---
