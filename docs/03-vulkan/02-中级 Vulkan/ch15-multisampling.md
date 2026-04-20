# 第十五章 · 多重采样 (MSAA)

## 15.1 MSAA 概述

```
MSAA (Multi-Sampling Anti-Aliasing):
────────────────────────────────────

单采样 (No AA):
┌───┬───┬───┬───┐
│ ■ │ ■ │ ■ │ ■ │  ← 锯齿边缘
├───┼───┼───┼───┤
│ ■ │ ■ │ ■ │ ■ │
└───┴───┴───┴───┘

4x MSAA:
┌───┬───┬───┬───┐
│ 2 │ 2 │ 2 │ 2 │  ← 每个像素 4 个子采样点
│ 2 │ 2 │ 2 │ 2 │
├───┼───┼───┼───┤
│ 2 │ 2 │ 2 │ 2 │
│ 2 │ 2 │ 2 │ 2 │
└───┴───┴───┴───┘
         2 = 子采样点

原理:
- 对每个像素的多边形边缘进行多次采样
- 取子采样点的平均值作为最终颜色
- 性能开销: 4x MSAA ≈ 1.5x 渲染时间
```

## 15.2 创建多重采样 Image

```python
import vkbottle

# --- 创建多重采样颜色/深度 Image ---
msaa_samples = vkbottle.SampleCountFlagBits._4  # 4x MSAA

# 颜色附件（多重采样）
msaa_color_image = device.create_image(
    vkbottle.ImageCreateInfo(
        imageType=vkbottle.ImageType._2D,
        format=swapchain_image_views[0].format,
        extent=vkbottleExtent(swapchain_image_extent.width, swapchain_image_extent.height, 1),
        mipLevels=1,
        arrayLayers=1,
        samples=msaa_samples,  # 多重采样
        tiling=vkbottle.ImageTiling.OPTIMAL,
        usage=vkbottle.ImageUsageFlag.COLOR_ATTACHMENT | vkbottle.ImageUsageFlag.TRANSFER_SRC,
        initialLayout=vkbottle.ImageLayout.UNDEFINED,
    ),
)

# 深度附件（多重采样）
msaa_depth_image = device.create_image(
    vkbottle.ImageCreateInfo(
        imageType=vkbottle.ImageType._2D,
        format=vkbottle.Format.D32_SFLOAT,
        extent=vkbottleExtent(swapchain_image_extent.width, swapchain_image_extent.height, 1),
        mipLevels=1,
        arrayLayers=1,
        samples=msaa_samples,
        tiling=vkbottle.ImageTiling.OPTIMAL,
        usage=vkbottle.ImageUsageFlag.DEPTH_STENCIL_ATTACHMENT,
        initialLayout=vkbottle.ImageLayout.UNDEFINED,
    ),
)
```

## 15.3 Render Pass 修改

### 15.3.1 Attachment 定义

```python
# --- 颜色附件 (多重采样) ---
color_attachment = vkbottle.AttachmentDescription(
    format=swapchain_image_views[0].format,
    samples=msaa_samples,  # 关键：多重采样
    loadOp=vkbottle.AttachmentLoadOp.CLEAR,
    storeOp=vkbottle.AttachmentStoreOp.DONT_CARE,  # 不存储（Resolve 后存储到单采样）
    stencilLoadOp=vkbottle.AttachmentLoadOp.DONT_CARE,
    stencilStoreOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
    finalLayout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
)

# --- Resolve 附件 (单采样，用于呈现) ---
resolve_attachment = vkbottle.AttachmentDescription(
    format=swapchain_image_views[0].format,
    samples=vkbottle.SampleCountFlagBits._1,  # 单采样
    loadOp=vkbottle.AttachmentLoadOp.DONT_CARE,
    storeOp=vkbottle.AttachmentStoreOp.STORE,  # 存储到 swapchain
    stencilLoadOp=vkbottle.AttachmentLoadOp.DONT_CARE,
    stencilStoreOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
    finalLayout=vkbottle.ImageLayout.PRESENT_SRC_KHR,
)

# --- 深度附件 (多重采样) ---
depth_attachment = vkbottle.AttachmentDescription(
    format=vkbottle.Format.D32_SFLOAT,
    samples=msaa_samples,
    loadOp=vkbottle.AttachmentLoadOp.CLEAR,
    storeOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    stencilLoadOp=vkbottle.AttachmentLoadOp.DONT_CARE,
    stencilStoreOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
    finalLayout=vkbottle.ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL,
)
```

### 15.3.2 Subpass 定义

```python
# --- Subpass 添加 Resolve Attachment ---
subpass = vkbottle.SubpassDescription(
    pipelineBindPoint=vkbottle.PipelineBindPoint.GRAPHICS,
    colorAttachments=[
        vkbottle.AttachmentReference(
            attachment=0,  # Color (multisampled)
            layout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        ),
    ],
    resolveAttachments=[  # Resolve 附件
        vkbottle.AttachmentReference(
            attachment=1,  # Resolve (single sampled)
            layout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        ),
    ],
    depthStencilAttachment=vkbottle.AttachmentReference(
        attachment=2,  # Depth
        layout=vkbottle.ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
    ),
)
```

## 15.4 Framebuffer 修改

```python
# --- Framebuffer 使用 Resolve Image 作为输出 ---
attachments = [
    msaa_color_image_view,  # 多重采样颜色
    resolve_image_view,      # Resolve 附件（单采样）
    msaa_depth_image_view,  # 多重采样深度
]
framebuffer = device.create_framebuffer(
    vkbottle.FramebufferCreateInfo(
        renderPass=render_pass,
        attachments=attachments,
        width=swapchain_image_extent.width,
        height=swapchain_image_extent.height,
        layers=1,
    ),
)
```

## 15.5 Pipeline 修改

```python
# --- Pipeline 中启用 MSAA ---
multisample_info = vkbottle.MultisampleStateCreateInfo(
    rasterizationSamples=msaa_samples,  # 关键：指定采样数
    sampleShadingEnable=vkbottle.Bool(0),
    minSampleShading=1.0,
    alphaToCoverageEnable=vkbottle.Bool(0),
    alphaToOneEnable=vkbottle.Bool(0),
)
```

## 15.6 可用采样数查询

```python
# 查询 GPU 支持的最大采样数
props = device.get_physical_device().get_properties()
sample_counts = props.sampleRates
# 常见支持: _1, _2, _4, _8, _16, _32, _64

# 检查图像格式是否支持多重采样
image_props = device.get_physical_device().get_image_format_properties(
    format=vkbottle.Format.B8G8R8A8_SRGB,
    imageType=vkbottle.ImageType._2D,
    tiling=vkbottle.ImageTiling.OPTIMAL,
    usage=vkbottle.ImageUsageFlag.COLOR_ATTACHMENT,
    flags=vkbottle.ImageCreateFlag(0),
)
# 检查 sampleCounts 是否包含 _4
```

## 15.7 MSAA 配置速查

| 参数 | 值 | 说明 |
| - | - | - | 
| 采样数 | `_1` / `_2` / `_4` / `_8` | 1x/2x/4x/8x |
| 性能开销 | 4x ≈ 1.5x | 8x ≈ 2x |
| 推荐 | `_4` | 平衡点 ✅ |
| 移动端 | `_1` / `_2` | 性能优先 |
| 桌面端 | `_4` / `_8` | 质量优先 |

## 15.8 MSAA 注意事项

```
1. 多重采样 Image 必须使用 OPTIMAL tiling
2. 多重采样 Image 不能直接用于纹理采样
3. 需要 Resolve 到单采样 Image 才能呈现
4. Depth Buffer 也需要多重采样（深度测试在子采样级进行）
5. Sample count 必须在整个 Render Pass 中一致
6. Image 创建时必须指定 samples > 1
7. Resolve 操作在 Render Pass 结束时自动执行
```

---