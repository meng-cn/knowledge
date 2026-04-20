# 第二十三章 · 天空盒 (Skybox)

## 23.1 天空盒概述

```
Skybox = 6 面立方体贴图，用于渲染远景

立方体贴图 (Cubemap):
┌──────┐  ┌──────┐  ┌──────┐
│ TOP   │  │ FRONT │  │ BACK  │
├──────┤  ├──────┤  ├──────┤
│ LEFT  ├──│ CENTER ──┤ RIGHT │
├──────┤  ├──────┤  ├──────┤
│ BOTTOM│  │ BACK  │  │ FRONT │
└──────┘  └──────┘  └──────┘

用途:
- 远景背景
- 环境映射 (Reflection)
- 天空渲染
```

## 23.2 创建立方体贴图

### 23.2.1 Image 创建

```python
# --- 创建 Cubemap Image ---
cubemap_image = device.create_image(
    vkbottle.ImageCreateInfo(
        imageType=vkbottle.ImageType._3D,  # 或 _2D with arrayLayers=6
        format=vkbottle.Format.R8G8B8A8_SRGB,
        extent=vkbottleExtent(512, 512, 6),  # 6 faces
        mipLevels=1,
        arrayLayers=6,
        samples=vkbottle.SampleCountFlagBits._1,
        tiling=vkbottle.ImageTiling.OPTIMAL,
        usage=vkbottle.ImageUsageFlag.SAMPLED,
        initialLayout=vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL,
    ),
)

# --- 分配内存 ---
mem_reqs = cubemap_image.get_memory_requirements()
cubemap_memory = device.allocate_memory(
    vkbottle.MemoryAllocateInfo(
        allocationSize=mem_reqs.size,
        memoryTypeIndex=find_memory_type_index(
            device.get_memory_properties(),
            mem_reqs.memoryTypeBits,
            vkbottle.MemoryPropertyFlag.DEVICE_LOCAL,
        ),
    ),
)
device.bind_image_memory(cubemap_image, cubemap_memory, 0)
```

### 23.2.2 纹理上传（6 面）

```python
# 加载 6 面纹理（+X, -X, +Y, -Y, +Z, -Z）
faces = [
    "right.jpg", "left.jpg",
    "top.jpg", "bottom.jpg",
    "front.jpg", "back.jpg",
]

for i, face in enumerate(faces):
    # 上传每一面
    staging_buffer = device.create_buffer(
        vkbottle.BufferCreateInfo(
            size=face_data[i].nbytes,
            usage=vkbottle.BufferUsageFlag.TRANSFER_SRC,
        ),
    )
    
    # ... 上传到 staging buffer ...
    
    # 拷贝到 cubemap image
    cmd_buffer.begin(vkbottle.CommandBufferBeginInfo(
        flags=vkbottle.CommandBufferUsageFlag.ONE_TIME_SUBMIT,
    ))
    
    # 布局转换
    cmd_buffer.pipeline_barrier(...)
    
    # 拷贝 Buffer → Image
    cmd_buffer.copy_buffer_to_image(
        srcBuffer=staging_buffer,
        dstImage=cubemap_image,
        dstImageLayout=vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL,
        regions=[
            vkbottle.BufferImageCopyRegion(
                bufferOffset=0,
                imageSubresource=vkbottle.ImageSubresourceLayers(
                    aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                    mipLevel=0,
                    baseArrayLayer=i,  # 第 i 面
                    layerCount=1,
                ),
                imageOffset=(0, 0, 0),
                imageExtent=(512, 512, 1),
            ),
        ],
    )
    
    cmd_buffer.end()
    queue.submit(cmd_buffer)
    queue.wait_idle()
```

## 23.3 创建 Sampler

```python
# Cubemap Sampler（需要 CLAMP_TO_EDGE）
cubemap_sampler = device.create_sampler(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.LINEAR,
    addressModeU=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
    addressModeV=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
    addressModeW=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,  # Cubemap 需要
    minLod=0.0,
    maxLod=cubemap_mip_levels,
    borderColor=vkbottle.BorderColor.FLOAT_OPAQUE_BLACK,
)
```

## 23.4 Shader 中使用 Cubemap

```glsl
// 在 Shader 中使用立方体贴图
layout(binding = 3) uniform samplerCube cubemap;

// 采样：使用 3D 方向向量
vec3 direction = normalize(reflectionVector);  // 从相机到场景点
vec3 color = texture(cubemap, direction).rgb;

// 常用用法:
// 1. 天空渲染: color = texture(cubemap, cameraToSkyDirection).rgb;
// 2. 环境映射: color = texture(cubemap, reflectedDir).rgb;
// 3. 环境光: color = texture(cubemap, normal).rgb;
```

## 23.5 天空盒渲染管线

```
渲染天空盒:
1. 关闭深度测试（或设为 ALWAYS）
2. 绑定 Skybox Pipeline
3. 绘制 6 面的四边形（立方体的 12 个三角形）
4. 确保天空盒始终在背景层

// 通常使用 GL_DEPTH_TEST = ALWAYS
// 确保天空盒永远可见
```

```python
# 渲染天空盒
command_buffer.begin_render_pass(render_pass_info)

# 设置深度测试为 ALWAYS
command_buffer.bind_pipeline_graphics(skybox_pipeline)

# 绑定描述符
command_buffer.bind_descriptor_sets(
    vkbottle.PipelineBindPoint.GRAPHICS,
    skybox_pipeline_layout,
    [skybox_descriptor_set],
)

# 绘制立方体的 12 个三角形
command_buffer.bind_vertex_buffers(0, [skybox_vertex_buffer], [0])
command_buffer.draw(indexCount=36,  # 6 faces × 2 triangles × 3 vertices
                    firstIndex=0,
                    vertexOffset=0,
                    instanceCount=1)

command_buffer.end_render_pass()
```

---
