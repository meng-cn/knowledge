# 第十四章 · 帧缓冲 (Framebuffer)

## 14.1 Framebuffer 概述

```
Framebuffer = 将 Attachments 绑定到具体资源

类比：画布（将 Render Pass 的"抽象定义"绑定到具体图像）

Framebuffer 结构:
┌──────────────────────────────┐
│ Color Attachment → Image View │
│ Depth Attachment → Image View │
│ Stencil Attachment → Image View│
└──────────────────────────────┘
```

## 14.2 创建 Framebuffer

### 14.2.1 标准 Framebuffer

```python
import vkbottle

# --- 定义 Framebuffer 附件 ---
attachments = [
    swapchain_image_views[image_index],  # 颜色附件
    depth_image_view,                     # 深度附件
]

# --- 创建 Framebuffer ---
framebuffer_create_info = vkbottle.FramebufferCreateInfo(
    renderPass=render_pass,
    attachments=attachments,
    width=swapchain_image_extent.width,
    height=swapchain_image_extent.height,
    layers=1,
)
framebuffer = device.create_framebuffer(framebuffer_create_info)
```

### 14.2.2 多帧缓冲（Frame N 管理）

```python
# 为每一帧创建独立的 Framebuffer
framebuffers = []
for i in range(swapchain_image_count):
    attachments = [
        swapchain_image_views[i],  # 交换链图像
        depth_image_view,           # 深度附件
    ]
    fb = device.create_framebuffer(
        vkbottle.FramebufferCreateInfo(
            renderPass=render_pass,
            attachments=attachments,
            width=swapchain_image_extent.width,
            height=swapchain_image_extent.height,
            layers=1,
        ),
    )
    framebuffers.append(fb)
```

### 14.2.3 清理

```python
for fb in framebuffers:
    fb.destroy()
```

## 14.3 渲染目标（Render to Texture）

```python
# 渲染到纹理 Framebuffer
def create_render_target_texture(device, width, height, format=vkbottle.Format.B8G8R8A8_SRGB):
    # 创建纹理
    color_image = device.create_image(
        vkbottle.ImageCreateInfo(
            imageType=vkbottle.ImageType._2D,
            format=format,
            extent=(width, height, 1),
            mipLevels=1,
            arrayLayers=1,
            samples=vkbottle.SampleCountFlagBits._1,
            tiling=vkbottle.ImageTiling.OPTIMAL,
            usage=vkbottle.ImageUsageFlag.COLOR_ATTACHMENT | 
                  vkbottle.ImageUsageFlag.SAMPLED,
        ),
    )
    
    # 分配内存
    mem_reqs = color_image.get_memory_requirements()
    mem = device.allocate_memory(
        vkbottle.MemoryAllocateInfo(
            allocationSize=mem_reqs.size,
            memoryTypeIndex=find_memory_type_index(
                device.get_memory_properties(),
                mem_reqs.memoryTypeBits,
                vkbottle.MemoryPropertyFlag.DEVICE_LOCAL,
            ),
        ),
    )
    device.bind_image_memory(color_image, mem, 0)
    
    # 创建 Image View
    color_image_view = device.create_image_view(
        image=color_image,
        format=format,
        subresourceRange=vkbottle.ImageSubresourceRange(
            aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
            baseMipLevel=0,
            levelCount=1,
            baseArrayLayer=0,
            layerCount=1,
        ),
    )
    
    return color_image, color_image_view, mem
```

## 14.4 Framebuffer 速查

| 操作 | 函数 |
| 创建 | `device.create_framebuffer()` |
| 附件 | `attachments=[Image View, ...]` |
| 尺寸 | `width, height, layers` |
| Render Pass | `renderPass` 绑定 |
| 销毁 | `framebuffer.destroy()` |

---

| 7-13 | ✅ |
| 14. 帧缓冲 | ✅ |
| 15. 多重采样 | 🔲 |
| 16-25 | 🔲 |
| 26-35 | 🔲 |
| 36-40 | 🔲 |
| A-D 附录 | 🔲 |