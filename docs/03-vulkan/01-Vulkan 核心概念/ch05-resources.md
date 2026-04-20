# 第五章 · 资源管理 (Buffers & Images)

## 5.1 Buffer 与 Image 概述 🔥

```
Buffer vs Image:
────────────────

Buffer:
  线性内存（1D 数组）
  ┌─────────────────────────────────────┐
  │ V0 │ V1 │ V2 │ V3 │ ... │ VN-1    │
  └─────────────────────────────────────┘
  用途: 顶点数据、Uniform 变量、索引

Image:
  二维/三维纹理（有维度信息）
  ┌───┬───┬───┬───┬───┐
  │ P0│ P1│ P2│ P3│ P4│
  ├───┼───┼───┼───┼───┤
  │ P5│ P6│ P7│ P8│ P9│
  ├───┼───┼───┼───┼───┤
  │ P10│P11│P12│P13│P14│
  └───┴───┴───┴───┴───┘
  用途: 纹理、帧缓冲、RTT、Compute 存储
```

## 5.2 Buffer 管理

### 5.2.1 Buffer 创建

```python
import vkbottle

# --- 1. 创建 Buffer ---
buffer_create_info = vkbottle.BufferCreateInfo(
    size=vertex_data.nbytes,  # Buffer 大小（字节）
    usage=vkbottle.BufferUsageFlag.VERTEX_BUFFER |    # 用途
          vkbottle.BufferUsageFlag.INDEX_BUFFER,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
)

buffer = device.create_buffer(buffer_create_info)
print(f"Buffer 已创建, 大小: {vertex_data.nbytes} bytes")
```

### 5.2.2 Buffer 内存分配 🔥

```python
# --- 2. 查询内存类型 ---
mem_properties = device.get_memory_properties()

# 找到适合内存类型的索引
def find_memory_type_index(mem_prop, type_bits, properties):
    for i in range(mem_prop.memory_type_count):
        if (type_bits & (1 << i)) and (mem_prop.memory_types[i].propertyFlags & properties) == properties:
            return i
    raise RuntimeError("Failed to find suitable memory type!")

# --- 3. 分配内存 ---
mem_alloc = vkbottle.MemoryAllocateInfo(
    allocationSize=vertex_data.nbytes,
    memoryTypeIndex=find_memory_type_index(
        mem_prop,
        vkbottle.MemoryTypeFlag.HOST_VISIBLE,  # 主机可访问
        vkbottle.MemoryPropertyFlag.HOST_VISIBLE | vkbottle.MemoryPropertyFlag.HOIST_COHERENT
    ),
)

buffer_memory = device.allocate_memory(mem_alloc)

# --- 4. 绑定内存 ---
device.bind_buffer_memory(buffer, buffer_memory, 0)

# --- 5. 上传数据 ---
if buffer_memory.memory_type_index & vkbottle.MemoryPropertyFlag.HOST_VISIBLE:
    mapped_ptr = device.map_memory(buffer_memory, 0, buffer_data.nbytes)
    mapped_ptr.data = buffer_data.data  # 直接复制
    device.unmap_memory(buffer_memory)

# --- 6. 清理 ---
device.free_memory(buffer_memory)
device.destroy_buffer(buffer)
```

### 5.2.3 Buffer 用途标志

| 用途 | 说明 |
| - | - |
| `VERTEX_BUFFER` | 顶点数据 |
| `INDEX_BUFFER` | 索引数据 |
| `UNIFORM_BUFFER` | 统一变量（Shader 输入） |
| `STORAGE_BUFFER` | 存储缓冲区（Compute Shader） |
| `INDEX_BUFFER` | 索引缓冲 |
| `TRANSFER_SRC` | 传输源 |
| `TRANSFER_DST` | 传输目标 |
| `INDIRECT_BUFFER` | 间接绘制参数 |

### 5.2.4 常用 Buffer 类型

```python
# Uniform Buffer 用途示例
uniform_buffer_info = vkbottle.BufferCreateInfo(
    size=128,  # 128 bytes（必须为 256 的倍数）
    usage=vkbottle.BufferUsageFlag.UNIFORM_BUFFER,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
)

uniform_buffer = device.create_buffer(uniform_buffer_info)

# Vertex Buffer 用途示例
vertex_buffer_info = vkbottle.BufferCreateInfo(
    size=vertex_data.nbytes,
    usage=vkbottle.BufferUsageFlag.VERTEX_BUFFER | vkbottle.BufferUsageFlag.TRANSFER_DST,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
)

vertex_buffer = device.create_buffer(vertex_buffer_info)
```

## 5.3 Image 管理 🔥

### 5.3.1 Image 创建

```python
import vkbottle

# --- 1. 创建 Image ---
image_create_info = vkbottle.ImageCreateInfo(
    imageType=vkbottle.ImageType._2D,
    format=vkbottle.Format.R8G8B8A8_SRGB,  # 格式
    extent=vkbottleExtent(256, 256, 1),  # 尺寸（宽, 高, 深度）
    mipLevels=8,  # Mipmap 层级数
    arrayLayers=1,  # 层数
    samples=vkbottle.SampleCountFlagBits._1,
    tiling=vkbottle.ImageTiling.OPTIMAL,  # OPTIMAL 或 LINEAR
    usage=vkbottle.ImageUsageFlag.SAMPLED | vkbottle.ImageUsageFlag.TRANSFER_DST,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
)

texture_image = device.create_image(image_create_info)
print(f"Image 已创建, 尺寸: {texture_image.extent}")
```

### 5.3.2 Image 内存分配

```python
# --- 2. 查询 Image 所需内存 ---
mem_requirements = texture_image.get_memory_requirements()

# 找到适合内存类型
mem_prop = device.get_memory_properties()
memory_type = find_memory_type_index(
    mem_prop,
    mem_requirements.memoryTypeBits,
    vkbottle.MemoryPropertyFlag.DEVICE_LOCAL  # GPU 本地内存
)

# --- 3. 分配内存 ---
mem_alloc = vkbottle.MemoryAllocateInfo(
    allocationSize=mem_requirements.size,
    memoryTypeIndex=memory_type,
)

image_memory = device.allocate_memory(mem_alloc)

# --- 4. 绑定内存 ---
device.bind_image_memory(texture_image, image_memory, 0)
```

### 5.3.3 Image Layout

```python
# --- 5. 设置 Layout ---
def transition_image_layout(image, old_layout, new_layout, queue_family_index=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED):
    # 创建命令缓冲区
    cmd_pool = vkbottle.CommandPoolCreateInfo(
        queueFamilyIndex=queue_family_index,
        flags=vkbottle.CommandPoolCreateFlag.RESET_COMMAND_BUFFER,
    )
    cmd_pool = device.create_command_pool(cmd_pool)
    
    cmd_buffer = device.allocate_command_buffers(
        vkbottle.CommandBufferAllocateInfo(
            commandPool=cmd_pool,
            level=vkbottle.CommandBufferLevel.PRIMARY,
            commandBufferCount=1,
        )
    )
    
    # 开始记录命令
    cmd_buffer.begin(vkbottle.CommandBufferBeginInfo(flags=vkbottle.CommandBufferUsageFlag.ONE_TIME_SUBMIT))
    
    # 添加布局转换屏障
    cmd_buffer.pipeline_barrier(
        srcStageMask=vkbottle.AccessFlag.NONE,
        dstStageMask=vkbottle.AccessFlag.NONE,
        dependencyFlags=vkbottle.SubpassDependencyFlag.NONE,
        memoryBarriers=[],
        bufferMemoryBarriers=[],
        imageMemoryBarriers=[
            vkbottle.ImageMemoryBarrier(
                srcAccessMask=vkbottle.AccessFlag.NONE,
                dstAccessMask=vkbottle.AccessFlag.NONE,
                oldLayout=old_layout,
                newLayout=new_layout,
                srcQueueFamilyIndex=queue_family_index,
                dstQueueFamilyIndex=queue_family_index,
                image=image,
                subresourceRange=vkbottle.ImageSubresourceRange(
                    aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                    baseMipLevel=0,
                    levelCount=texture_image.mipLevels,
                    baseArrayLayer=0,
                    layerCount=texture_image.arrayLayers,
                ),
            ),
        ],
    )
    
    cmd_buffer.end()
    
    # 提交命令
    device.get_queue().submit(
        cmd_buffer,
        waitSemaphores=[],
        signalSemaphores=[],
    )
    
    device.get_queue().wait_idle()
    
    cmd_buffer.destroy()
    cmd_pool.destroy()

# 常用 Layout 转换
transition_image_layout(texture_image, vkbottle.ImageLayout.UNDEFINED, vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL)
transition_image_layout(texture_image, vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL, vkbottle.ImageLayout.SHADER_READ_ONLY_OPTIMAL)
```

### 5.3.4 Image View

```python
# --- 6. 创建 Image View ---
image_view_create_info = vkbottle.ImageViewCreateInfo(
    image=texture_image,
    viewType=vkbottle.ImageViewType._2D,
    format=vkbottle.Format.R8G8B8A8_SRGB,
    componentMapping=vkbottle.ComponentMapping(
        vkbottle.ComponentSwizzle.IDENTITY,
        vkbottle.ComponentSwizzle.IDENTITY,
        vkbottle.ComponentSwizzle.IDENTITY,
        vkbottle.ComponentSwizzle.IDENTITY,
    ),
    subresourceRange=vkbottle.ImageSubresourceRange(
        aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
        baseMipLevel=0,
        levelCount=texture_image.mipLevels,
        baseArrayLayer=0,
        layerCount=texture_image.arrayLayers,
    ),
)

texture_image_view = device.create_image_view(image_view_create_info)
print(f"Image View 已创建!")
```

## 5.4 纹理上传（Staging Buffer）🔥

```python
def upload_texture(device, staging_buffer, texture_image, texture_width, texture_height, texture_data):
    """使用 Staging Buffer 上传纹理"""
    
    # 1. 创建 Staging Buffer（主机可访问）
    staging_buffer_create_info = vkbottle.BufferCreateInfo(
        size=texture_data.nbytes,
        usage=vkbottle.BufferUsageFlag.TRANSFER_SRC,
        sharingMode=vkbottle.SharingMode.EXCLUSIVE,
    )
    staging_buffer = device.create_buffer(staging_buffer_create_info)
    
    # 2. 上传数据到 Staging Buffer
    staging_memory = device.allocate_memory(vkbottle.MemoryAllocateInfo(
        allocationSize=texture_data.nbytes,
        memoryTypeIndex=find_memory_type_index(
            device.get_memory_properties(),
            device.get_buffer_memory_requirements(staging_buffer).memoryTypeBits,
            vkbottle.MemoryPropertyFlag.HOST_VISIBLE | vkbottle.MemoryPropertyFlag.HOIST_COHERENT
        ),
    ))
    device.bind_buffer_memory(staging_buffer, staging_memory, 0)
    
    # 映射并写入数据
    mapped_ptr = device.map_memory(staging_memory, 0, texture_data.nbytes)
    mapped_ptr.data = texture_data.data
    device.unmap_memory(staging_memory)
    
    # 3. 创建 Command Pool
    cmd_pool = device.create_command_pool(vkbottle.CommandPoolCreateInfo(
        queueFamilyIndex=device.get_physical_device().get_queue_families()[0].queueFamilyIndex,
        flags=vkbottle.CommandPoolCreateFlag.RESET_COMMAND_BUFFER,
    ))
    
    cmd_buffer = device.allocate_command_buffers(vkbottle.CommandBufferAllocateInfo(
        commandPool=cmd_pool,
        level=vkbottle.CommandBufferLevel.PRIMARY,
        commandBufferCount=1,
    ))
    
    # 4. 开始记录
    cmd_buffer.begin(vkbottle.CommandBufferBeginInfo(flags=vkbottle.CommandBufferUsageFlag.ONE_TIME_SUBMIT))
    
    # 5. 布局转换
    cmd_buffer.pipeline_barrier(
        srcStageMask=vkbottle.AccessFlag.NONE,
        dstStageMask=vkbottle.AccessFlag.NONE,
        dependencyFlags=vkbottle.SubpassDependencyFlag.NONE,
        memoryBarriers=[],
        bufferMemoryBarriers=[],
        imageMemoryBarriers=[
            vkbottle.ImageMemoryBarrier(
                srcAccessMask=vkbottle.AccessFlag.NONE,
                dstAccessMask=vkbottle.AccessFlag.NONE,
                oldLayout=vkbottle.ImageLayout.UNDEFINED,
                newLayout=vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL,
                srcQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
                dstQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
                image=texture_image,
                subresourceRange=vkbottle.ImageSubresourceRange(
                    aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                    baseMipLevel=0,
                    levelCount=texture_image.mipLevels,
                    baseArrayLayer=0,
                    layerCount=texture_image.arrayLayers,
                ),
            ),
        ],
    )
    
    # 6. Copy Buffer → Image
    cmd_buffer.copy_buffer_to_image(
        srcBuffer=staging_buffer,
        dstImage=texture_image,
        dstImageLayout=vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL,
        region=vkbottle.BufferImageCopyRegion(
            bufferOffset=0,
            bufferRowLength=0,
            bufferImageHeight=0,
            imageSubresource=vkbottle.ImageSubresourceLayers(
                aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                mipLevel=0,
                baseArrayLayer=0,
                layerCount=1,
            ),
            imageOffset=(0, 0, 0),
            imageExtent=(texture_width, texture_height, 1),
        ),
    )
    
    # 7. 布局转换到 Shader Read Only
    cmd_buffer.pipeline_barrier(
        srcStageMask=vkbottle.AccessFlag.NONE,
        dstStageMask=vkbottle.AccessFlag.NONE,
        dependencyFlags=vkbottle.SubpassDependencyFlag.NONE,
        memoryBarriers=[],
        bufferMemoryBarriers=[],
        imageMemoryBarriers=[
            vkbottle.ImageMemoryBarrier(
                srcAccessMask=vkbottle.AccessFlag.NONE,
                dstAccessMask=vkbottle.AccessFlag.NONE,
                oldLayout=vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL,
                newLayout=vkbottle.ImageLayout.SHADER_READ_ONLY_OPTIMAL,
                srcQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
                dstQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
                image=texture_image,
                subresourceRange=vkbottle.ImageSubresourceRange(
                    aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                    baseMipLevel=0,
                    levelCount=texture_image.mipLevels,
                    baseArrayLayer=0,
                    layerCount=texture_image.arrayLayers,
                ),
            ),
        ],
    )
    
    cmd_buffer.end()
    
    # 8. 提交
    device.get_queue().submit(cmd_buffer)
    device.get_queue().wait_idle()
    
    # 9. 清理
    cmd_buffer.destroy()
    cmd_pool.destroy()
    device.destroy_buffer(staging_buffer)
    device.free_memory(staging_memory)
```

## 5.5 Buffer vs Image 对比

| 特性 | Buffer | Image |
| - | - | - |
| **维度** | 1D 数组 | 2D/3D 纹理 |
| **内存分配** | 手动（你指定） | 自动（driver 处理） |
| **用途** | 顶点、Uniform、计算 | 纹理、帧缓冲 |
| **布局** | 无 | 必需（不同用途不同布局） |
| **View** | 不需要 | 必需（ImageView） |
| **性能** | 线性访问 | 纹理优化（缓存友好） |
| **压缩** | 不支持 | 支持（BC/DXT/ASTC） |

## 5.6 资源创建速查表

| 资源 | 创建函数 | 关键参数 |
| - | - | - |
| **Buffer** | `device.create_buffer()` | size, usage |
| **Buffer Memory** | `device.allocate_memory()` | allocationSize, memoryTypeIndex |
| **Bind Buffer** | `device.bind_buffer_memory()` | buffer, memory, offset |
| **Image** | `device.create_image()` | type, format, extent, mipLevels |
| **Image Memory** | `device.allocate_memory()` | mem_requirements.size, memoryTypeIndex |
| **Bind Image** | `device.bind_image_memory()` | image, memory, offset |
| **Image View** | `device.create_image_view()` | image, format, subresourceRange |
| **Sampler** | `device.create_sampler()` | mag/min/mipmap, wrapMode, anisotropy |

## 5.7 Mipmap 生成

```python
def generate_mipmaps(device, texture_image, texture_width, texture_height):
    """生成 Mipmap 链"""
    
    # 1. 检查 Image 是否支持 Transfer SRC 和 Color Transfer DST
    image_props = texture_image.get_properties()
    if not (image_props.properties & vkbottle.ImageFeatureFlag.TRANSFER_SRC):
        raise RuntimeError("Texture image does not support TRANSFER_SRC")
    if not (image_props.properties & vkbottle.ImageFeatureFlag.TRANSFER_DST):
        raise RuntimeError("Texture image does not support TRANSFER_DST")
    
    # 2. 转换 Image 到 TRANSFER_DST_OPTIMAL
    transition_layout = vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL
    cmd_buffer = device.allocate_command_buffers(vkbottle.CommandBufferAllocateInfo(
        commandPool=device.create_command_pool(vkbottle.CommandPoolCreateInfo(
            queueFamilyIndex=0,
            flags=vkbottle.CommandPoolCreateFlag.RESET_COMMAND_BUFFER,
        )),
        level=vkbottle.CommandBufferLevel.PRIMARY,
        commandBufferCount=1,
    ))
    cmd_buffer.begin(vkbottle.CommandBufferBeginInfo(flags=vkbottle.CommandBufferUsageFlag.ONE_TIME_SUBMIT))
    
    # 3. 生成每个 Mipmap 层级
    current_width = texture_width
    current_height = texture_height
    
    for level in range(1, texture_image.mipLevels):
        # 从上一层级复制到当前层级
        cmd_buffer.blit_image(
            srcImage=texture_image,
            srcLevel=level - 1,
            dstImage=texture_image,
            dstLevel=level,
            regions=[
                vkbottle.ImageBlit(
                    srcSubresource=vkbottle.ImageSubresourceLayers(
                        aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                        mipLevel=level - 1,
                        baseArrayLayer=0,
                        layerCount=1,
                    ),
                    srcOffsets=(0, 0),  # 源图像角落（0,0）
                    srcOffsets=(current_width, current_height),  # 源图像角落（width, height）
                    dstSubresource=vkbottle.ImageSubresourceLayers(
                        aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                        mipLevel=level,
                        baseArrayLayer=0,
                        layerCount=1,
                    ),
                    dstOffsets=(current_width // 2, current_height // 2),  # 缩小一半
                ),
            ],
            filter=vkbottle.Filter.LINEAR,  # 双线性采样
        )
        
        current_width //= 2
        current_height //= 2
    
    # 4. 转换到 Shader Read Only
    transition_image_layout(texture_image, vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL, vkbottle.ImageLayout.SHADER_READ_ONLY_OPTIMAL)
    
    cmd_buffer.end()
    device.get_queue().submit(cmd_buffer)
    device.get_queue().wait_idle()
    
    cmd_buffer.destroy()
```

---