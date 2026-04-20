# 第十六章 · 渲染目标与后处理

## 16.1 渲染目标概述

```
渲染目标 (Render Target) = 将渲染结果输出到纹理而非屏幕

传统流程:
  Scene → RenderPass → SwapChain Image → Screen

渲染目标流程:
  Scene → RenderPass → Texture → PostProcess → SwapChain

用途:
- 后处理（模糊、Bloom、色调映射）
- 阴影贴图
- 屏幕空间效果（SSAO、SSR、SSS）
- 图像特效（色差、噪点、电影感）
- 多 Pass 渲染
```

## 16.2 创建渲染目标纹理

```python
import vkbottle

def create_render_target(device, width, height, format=vkbottle.Format.B8G8R8A8_SRGB):
    """创建渲染目标纹理"""
    
    # --- 颜色纹理 ---
    color_image = device.create_image(
        vkbottle.ImageCreateInfo(
            imageType=vkbottle.ImageType._2D,
            format=format,
            extent=vkbottleExtent(width, height, 1),
            mipLevels=1,
            arrayLayers=1,
            samples=vkbottle.SampleCountFlagBits._1,
            tiling=vkbottle.ImageTiling.OPTIMAL,
            usage=vkbottle.ImageUsageFlag.COLOR_ATTACHMENT | 
                  vkbottle.ImageUsageFlag.SAMPLED |
                  vkbottle.ImageUsageFlag.TRANSFER_SRC,
            initialLayout=vkbottle.ImageLayout.UNDEFINED,
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
        viewType=vkbottle.ImageViewType._2D,
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

## 16.3 Ping-Pong 技术

```
Ping-Pong (乒乓缓冲):

Frame 1: Scene → FrameA
Frame 2: FrameA → FrameB
Frame 3: FrameB → FrameA
...

用于：模糊（多Pass）、景深、抗锯齿
```

### 16.3.1 Ping-Pong 实现

```python
# --- 创建两个渲染目标 ---
rt_a = create_render_target(device, 800, 600)
rt_b = create_render_target(device, 800, 600)

# --- 帧间切换 ---
def render_ping_pong(device, render_pass, framebuffers, pipeline, 
                     command_buffer, scene_image_view, 
                     use_a=False):
    """Ping-Pong 渲染"""
    
    if use_a:
        attachments = [rt_a.image_view, depth_view]
        next_view = rt_b.image_view
    else:
        attachments = [rt_b.image_view, depth_view]
        next_view = rt_a.image_view
    
    # 创建 Framebuffer
    fb = device.create_framebuffer(
        vkbottle.FramebufferCreateInfo(
            renderPass=render_pass,
            attachments=attachments,
            width=800,
            height=600,
            layers=1,
        ),
    )
    
    # 开始 Render Pass
    command_buffer.begin_render_pass(
        vkbottle.RenderPassBeginInfo(
            renderPass=render_pass,
            framebuffer=fb,
            renderArea=vkbottle.Rect2D(offset=(0, 0), extent=(800, 600)),
            clearValues=[
                vkbottle.ClearValue(color=vkbottle.ClearColorValue([0.0, 0.0, 0.0, 1.0])),
                vkbottle.ClearValue(depth=1.0),
            ],
        ),
    )
    
    # 绑定 Pipeline
    command_buffer.bind_pipeline_graphics(pipeline)
    command_buffer.bind_descriptor_sets(
        vkbottle.PipelineBindPoint.GRAPHICS,
        pipeline_layout,
        descriptor_set,
    )
    
    # 绑定顶点缓冲
    command_buffer.bind_vertex_buffers(0, [vertex_buffer], [0])
    
    # 绘制
    command_buffer.draw(vertexCount=3, instanceCount=1, 
                       firstVertex=0, firstInstance=0)
    
    command_buffer.end_render_pass()
    
    # 将结果拷贝到交换链
    copy_command_buffer.begin(...)
    copy_command_buffer.copy_image(
        srcImage=next_view.image,
        srcLayout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        dstImage=swapchain_images[image_index],
        dstLayout=vkbottle.ImageLayout.TRANSFER_DST_OPTIMAL,
        regions=[...],
    )
    copy_command_buffer.end()
    
    return not use_a  # 切换下次使用哪个
```

## 16.4 后处理管线

### 16.4.1 高斯模糊

```glsl
// fragment shader - 高斯模糊
#version 450

layout(binding = 2) uniform sampler2D tex;
uniform vec2 uDirection;  // (1, 0) 或 (0, 1)
uniform vec2 uTexelSize;
uniform float uSigma;

out vec4 fragColor;

void main() {
    vec2 direction = normalize(uDirection);
    vec4 result = vec4(0.0);
    float weights[5];
    
    // 高斯权重
    weights[0] = 1.0 / (2.5 * sqrt(2.0 * 3.14159)) * exp(-0.5);
    weights[1] = 1.0 / (2.5 * sqrt(2.0 * 3.14159)) * exp(-2.0);
    weights[2] = 1.0 / (2.5 * sqrt(2.0 * 3.14159)) * exp(-4.5);
    weights[3] = 1.0 / (2.5 * sqrt(2.0 * 3.14159)) * exp(-8.0);
    weights[4] = 1.0 / (2.5 * sqrt(2.0 * 3.14159)) * exp(-12.5);
    
    // 5x5 高斯模糊
    for (int i = -2; i <= 2; i++) {
        vec2 offset = direction * uTexelSize * float(i);
        result += texture(tex, uv + offset) * weights[abs(i)];
    }
    
    fragColor = result;
}
```

### 16.4.2 Bloom 效果

```glsl
// Bloom: 提取亮部 → 模糊 → 叠加
void bloom_pass(RenderTarget input, RenderTarget blur, RenderTarget output) {
    // Pass 1: 提取亮部
    extract_luminance(input, bright_texture);
    
    // Pass 2: 高斯模糊（水平）
    gaussian_blur_h(bright_texture, blur_h);
    
    // Pass 3: 高斯模糊（垂直）
    gaussian_blur_v(blur_h, blur_v);
    
    // Pass 4: 叠加
    composite(scene, blur_v, output);
}
```

## 16.5 常用后处理效果

| 效果 | 类型 | 说明 |
| - | - | - | 
| **高斯模糊** | 模糊 | 通用模糊 |
| **Bloom** | 发光 | 提取亮部 + 模糊 + 叠加 |
| **色调映射** | 映射 | HDR → LDR |
| **色差** | 色散 | RGB 通道分离 |
| **暗角** | 遮罩 | 边缘暗化 |
| **对比度/饱和度** | 调整 | 色彩调整 |
| **SSAO** | 环境光遮蔽 | 屏幕空间 |
| **SSR** | 屏幕空间反射 | 屏幕空间 |
| **FXAA** | 抗锯齿 | 快速抗锯齿 |
| **CRT** | 特效 | 复古风格 |

## 16.6 渲染目标创建速查

| 步骤 | 函数 |
| - | - |
| 创建 Image | `device.create_image()` |
| 分配内存 | `device.allocate_memory()` |
| 绑定 | `device.bind_image_memory()` |
| 创建 View | `device.create_image_view()` |
| Layout 转换 | `vkCmdPipelineBarrier()` |
| Framebuffer | `device.create_framebuffer()` |

---