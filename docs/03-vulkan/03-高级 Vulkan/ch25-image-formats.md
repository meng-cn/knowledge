# 第二十五章 · 图像格式与子资源

## 25.1 图像格式

### 25.1.1 颜色格式

| 格式 | 位深 | 说明 |
| `R8_UNORM` | 8 | 单通道 8 位 |
| `RG8_UNORM` | 16 | 双通道 8 位 |
| `RGBA8_UNORM` | 32 | 标准 8 位 RGBA |
| `RGBA8_SRGB` | 32 | sRGB 空间 ✅ |
| `B8G8R8A8_UNORM` | 32 | Vulkan 标准 |
| `RGBA32_SFLOAT` | 128 | HDR RGBA |
| `RGBA16_SFLOAT` | 64 | HDR RGBA 半精度 |
| `BC1_RGB_SRGB_BLOCK` | 8 | DXT1 压缩 |
| `BC3_RGBA_UNORM_BLOCK` | 16 | DXT5 压缩 |
| `BC7_SRGB_BLOCK` | 8 | BC7 高质量压缩 |
| `ETC2_R8G8B8A8_BLOCK` | 16 | ETC2（移动） |
| `ASTC_4x4` | 16 | ASTC（移动/桌面） |

### 25.1.2 深度格式

| 格式 | 深度 | 模板 |
| `D32_SFLOAT` | 32 bit | 无 |
| `D24_UNORM_S8_UINT` | 24 bit | 8 bit ✅ |
| `X8_D24_UNORM` | 24 bit | 8 bit |
| `D32_SFLOAT_S8_UINT` | 32 bit | 8 bit |

### 25.1.3 查询支持格式

```python
# 查询设备支持的格式
for format in [
    vkbottle.Format.B8G8R8A8_SRGB,
    vkbottle.Format.R8G8B8A8_SRGB,
    vkbottle.Format.R32G32B32_SFLOAT,
]:
    props = device.get_physical_device().get_format_properties(format)
    print(f"{format}:")
    print(f"  linear: {props.linearTilingFeatures}")
    print(f"  optimal: {props.optimalTilingFeatures}")
    print(f"  buffer: {props.bufferFeatures}")
```

## 25.2 图像子资源

### 25.2.1 ImageSubresourceRange

```python
# 指定图像的哪一部分
subresource_range = vkbottle.ImageSubresourceRange(
    aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,  # 颜色/深度/模板
    baseMipLevel=0,                                   # 起始 Mipmap
    levelCount=4,                                     # Mipmap 数量
    baseArrayLayer=0,                                 # 起始层
    layerCount=1,                                     # 层数
)
```

### 25.2.2 访问方式

```python
# 查询资源访问属性
image_props = device.get_physical_device().get_format_properties(format)

# 检查是否支持特定用途
supports_transfer_src = (image_props.optimalTilingFeatures & 
                         vkbottle.ImageFeatureFlag.TRANSFER_SRC)
supports_shader_read = (image_props.optimalTilingFeatures & 
                        vkbottle.ImageFeatureFlag.SAMPLED_IMAGE)
supports_render_target = (image_props.optimalTilingFeatures & 
                          vkbottle.ImageFeatureFlag.COLOR_ATTACHMENT)
```

## 25.3 图像布局转换

```python
# 常用布局转换
def transition_layout(cmd_buffer, image, old_layout, new_layout):
    barrier = vkbottle.ImageMemoryBarrier(
        srcAccessMask=vkbottle.AccessFlag.NONE,
        dstAccessMask=vkbottle.AccessFlag.NONE,
        oldLayout=old_layout,
        newLayout=new_layout,
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
    )
    cmd_buffer.pipeline_barrier(
        srcStageMask=vkbottle.AccessFlag.NONE,
        dstStageMask=vkbottle.AccessFlag.NONE,
        dependencyFlags=vkbottle.SubpassDependencyFlag.NONE,
        memoryBarriers=[],
        bufferMemoryBarriers=[],
        imageMemoryBarriers=[barrier],
    )

# 常用布局
# UNDEFINED → TRANSFER_DST_OPTIMAL → SHADER_READ_ONLY_OPTIMAL
# COLOR_ATTACHMENT_OPTIMAL → PRESENT_SRC_KHR
```

## 25.4 格式速查

| 用途 | 推荐格式 |
| **纹理显示** | `B8G8R8A8_SRGB` |
| **HDR 纹理** | `RGBA32_SFLOAT` |
| **深度缓冲** | `D24_UNORM_S8_UINT` |
| **压缩纹理** | `BC7_SRGB_BLOCK`（桌面）/ `ASTC`（移动） |
| **G-Buffer** | `RGBA16_SFLOAT` |
| **阴影贴图** | `D32_SFLOAT` |

---

| 16-24 | ✅ |
| **25. 图像格式与子资源** | ✅ |
| **Part III · 全部完成** | ✅ **25/44 章** |