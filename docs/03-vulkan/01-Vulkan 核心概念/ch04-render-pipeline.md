# 第四章 · 渲染管线 (Render Pipeline)

## 4.1 Render Pass 概述 🔥

### 4.1.1 什么是 Render Pass

```
Render Pass = 定义"如何渲染"的结构

类比：菜谱（定义食材、步骤、出锅方式）

一个 Render Pass 包含：
1. Attachments（附件）: 图像/缓冲的定义
2. Subpasses（子通道）: 渲染步骤
3. Dependencies（依赖）: 子通道间的依赖关系
```

### 4.1.2 Render Pass 的结构

```
Render Pass
├── Attachments (附件定义)
│   ├── Attachment 0: Color (B8G8R8A8)
│   ├── Attachment 1: Depth (D32_SFLOAT)
│   └── Attachment 2: Stencil (S8_UINT)
│
├── Subpasses (子通道)
│   ├── Subpass 0 (主渲染)
│   │   ├── Input Attachments: []
│   │   ├── Color Attachments: [Attachment 0]
│   │   ├── Resolve Attachments: []
│   │   ├── Depth Attachment: [Attachment 1]
│   │   └── Stencil Attachment: []
│   └── ...
│
└── Dependencies (依赖)
    ├── Dependency 0: External → Subpass 0
    ├── Dependency 1: Subpass 0 → External
    └── ...
```

## 4.2 创建 Render Pass

### 4.2.1 完整的 Render Pass 创建

```python
import vkbottle

# --- 1. 定义 Attachments ---
# Attachment = 一个图像的元数据
color_attachment = vkbottle.AttachmentDescription(
    format=swapchain_image_views[0].format,  # 交换链图像格式
    samples=vkbottle.SampleCountFlagBits._1,  # 单采样
    loadOp=vkbottle.AttachmentLoadOp.CLEAR,   # 加载操作：清除
    storeOp=vkbottle.AttachmentStoreOp.STORE, # 存储操作：存储
    stencilLoadOp=vkbottle.AttachmentLoadOp.DONT_CARE,
    stencilStoreOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
    finalLayout=vkbottle.ImageLayout.PRESENT_SRC_KHR,  # 最终布局
)

depth_attachment = vkbottle.AttachmentDescription(
    format=VK_FORMAT_D32_SFLOAT,  # 深度格式
    samples=vkbottle.SampleCountFlagBits._1,
    loadOp=vkbottle.AttachmentLoadOp.CLEAR,
    storeOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    stencilLoadOp=vkbottle.AttachmentLoadOp.DONT_CARE,
    stencilStoreOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
    finalLayout=vkbottle.ImageLayout.DEPTH_STENCIL_READ_ONLY,
)

# --- 2. 定义 Subpasses ---
color_reference = vkbottle.AttachmentReference(
    attachment=0,  # Attachment 索引
    layout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
)

depth_reference = vkbottle.AttachmentReference(
    attachment=1,  # Attachment 索引
    layout=vkbottle.ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
)

subpass = vkbottle.SubpassDescription(
    pipelineBindPoint=vkbottle.PipelineBindPoint.GRAPHICS,
    colorAttachments=[color_reference],
    depthStencilAttachment=depth_reference,
)

# --- 3. 定义 Dependencies ---
# 确保颜色附件在渲染前就绪
dependency = vkbottle.SubpassDependency(
    srcSubpass=vkbottle.SUBPASS_EXTERNAL,  # 外部依赖
    dstSubpass=0,  # 当前子通道
    srcStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE |
                 vkbottle.AccessFlag.COLOR_ATTACHMENT_READ,
    dstStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE |
                 vkbottle.AccessFlag.COLOR_ATTACHMENT_READ,
    srcAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE |
                 vkbottle.AccessFlag.COLOR_ATTACHMENT_READ,
    dstAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE |
                 vkbottle.AccessFlag.COLOR_ATTACHMENT_READ,
    srcQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
    dstQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
)

# --- 4. 创建 Render Pass ---
render_pass_create_info = vkbottle.RenderPassCreateInfo(
    attachments=[color_attachment, depth_attachment],
    subpasses=[subpass],
    dependencies=[dependency],
)

render_pass = device.create_render_pass(render_pass_create_info)
print(f"Render Pass 已创建!")
```

### 4.2.2 Attachment 详解

| 属性 | 说明 |
| `format` | 像素格式 |
| `samples` | 采样数（MSAA） |
| `loadOp` | 渲染前操作（CLEAR/LOAD/DONT_CARE） |
| `storeOp` | 渲染后操作（STORE/DONT_CARE/RESERVE） |
| `stencilLoadOp` | 模板加载操作 |
| `stencilStoreOp` | 模板存储操作 |
| `initialLayout` | 初始布局 |
| `finalLayout` | 最终布局 |

### 4.2.3 Load/Store 操作选择

| 操作 | 说明 | 何时用 |
| **CLEAR** | 清除为固定值 | 每帧都需要 |
| **LOAD** | 保留之前的内容 | 需要上一帧的结果 |
| **DONT_CARE** | 不关心（驱动可优化） | 不需要之前的内容 |

### 4.2.4 Layout 转换

```
Vulkan 中的图像有不同的"布局"（Layout），
不同布局有不同的性能特性：

UNDEFINED → 初始状态（什么都可以）
COLOR_ATTACHMENT_OPTIMAL → 颜色附件（写优化）
DEPTH_STENCIL_ATTACHMENT_OPTIMAL → 深度/模板附件
PRESENT_SRC_KHR → 呈现（用于 swapchain）
TRANSFER_SRC_OPTIMAL → 读取（如 copy）
TRANSFER_DST_OPTIMAL → 写入（如 copy）

布局转换由 Vulkan 自动处理（在 Render Pass 边界）
你只需要在 Attachments 中指定 initial/finalLayout
```

## 4.3 Graphics Pipeline 创建 🔥

### 4.3.1 Pipeline 整体结构

```
Graphics Pipeline = 所有渲染状态的编译结果
类比：编译好的程序

Pipeline 状态分为 7 个阶段：
1. Vertex Input（顶点输入）
2. Vertex Shader（顶点着色器）
3. Input Assembly（顶点组装）
4. Rasterization（光栅化）
5. Multisample（多重采样）
6. Color Blend（颜色混合）
7. Depth/Stencil Test（深度/模板测试）
8. Dynamic State（动态状态）
```

### 4.3.2 完整 Pipeline 创建

```python
import vkbottle
import vkbottle.ext.glsl as glsl

# --- 1. 加载 Shader Modules ---
def load_shader_module(device, path, stage):
    with open(path, 'rb') as f:
        source = f.read()
    shader_create_info = vkbottle.ShaderModuleCreateInfo(pCode=source)
    return device.create_shader_module(shader_create_info), stage

vs_module, vs_stage = load_shader_module(device, 'vertex.spv', 
                                           vkbottle.ShaderStageFlag.VERTEX)
fs_module, fs_stage = load_shader_module(device, 'fragment.spv',
                                           vkbottle.ShaderStageFlag.FRAGMENT)

# --- 2. 定义 Shader Stages ---
shader_stage_info = [
    vkbottle.PipelineShaderStageCreateInfo(
        stage=vs_stage,
        module=vs_module,
        pName=b'main',  # 入口函数名
    ),
    vkbottle.PipelineShaderStageCreateInfo(
        stage=fs_stage,
        module=fs_module,
        pName=b'main',
    ),
]

# --- 3. 定义 Vertex Input ---
vertex_input_info = vkbottle.VertexInputStateCreateInfo(
    vertexBindingDescriptions=[  # 绑定描述
        vkbottle.VertexInputBindingDescription(
            binding=0,  # 绑定槽位
            stride=3 * 4,  # 步长（每个顶点 3x4 bytes = 12 bytes）
            inputRate=vkbottle.VertexInputRate.VERTEX,  # 每顶点
        ),
    ],
    vertexAttributeDescriptions=[  # 属性描述
        vkbottle.VertexInputAttributeDescription(
            location=0,  # Shader 中的 location
            binding=0,  # 绑定槽位
            format=vkbottle.Format.R32G32B32_SFLOAT,  # 格式（float32×3）
            offset=0,  # 偏移
        ),
        # 如果有颜色属性：
        # vkbottle.VertexInputAttributeDescription(
        #     location=1,
        #     binding=0,
        #     format=vkbottle.Format.R32G32B32A32_SFLOAT,
        #     offset=12,
        # ),
    ],
)

# --- 4. 定义 Input Assembly ---
input_assembly_info = vkbottle.InputAssemblyStateCreateInfo(
    topology=vkbottle.PrimitiveTopology.TRIANGLE_LIST,  # 图元类型
    primitiveRestartEnable=vkbottle.Bool(0),
)

# --- 5. 定义 Viewport + Scissor ---
viewport = vkbottle.Viewport(
    x=0.0,
    y=0.0,
    width=800.0,
    height=600.0,
    minDepth=0.0,
    maxDepth=1.0,
)

scissor = vkbottle.Rect2D(
    offset=(0, 0),
    extent=(800, 600),
)

viewport_state_info = vkbottle.ViewportStateCreateInfo(
    viewports=[viewport],
    scissors=[scissor],
)

# --- 6. 定义 Rasterization ---
rasterization_info = vkbottle.RasterizationStateCreateInfo(
    depthClampEnable=vkbottle.Bool(0),
    rasterizerDiscardEnable=vkbottle.Bool(0),
    polygonMode=vkbottle.PolygonMode.FILL,  # 填充模式
    cullMode=vkbottle.CullModeFlag.FRONT,   # 剔除模式
    frontFace=vkbottle.Face.FRONT_CCW,       # 正面（逆时针）
    depthBiasEnable=vkbottle.Bool(0),
    lineWidth=1.0,
)

# --- 7. 定义 Multisample ---
multisample_info = vkbottle.MultisampleStateCreateInfo(
    rasterizationSamples=vkbottle.SampleCountFlagBits._1,  # 单采样
    sampleShadingEnable=vkbottle.Bool(0),
    alphaToCoverageEnable=vkbottle.Bool(0),
)

# --- 8. 定义 Color Blend ---
blend_attachment = vkbottle.PipelineColorBlendAttachmentState(
    blendEnable=vkbottle.Bool(1),  # 混合启用（透明度）
    srcColorBlendFactor=vkbottle.BlendFactor.SRC_ALPHA,
    dstColorBlendFactor=vkbottle.BlendFactor.ONE_MINUS_SRC_ALPHA,
    colorBlendOp=vkbottle.BlendOp.ADD,
    srcAlphaBlendFactor=vkbottle.BlendFactor.ONE,
    dstAlphaBlendFactor=vkbottle.BlendFactor.ZERO,
    alphaBlendOp=vkbottle.BlendOp.ADD,
    colorWriteMask=vkbottle.ColorComponentFlag.R_BIT |
                    vkbottle.ColorComponentFlag.G_BIT |
                    vkbottle.ColorComponentFlag.B_BIT |
                    vkbottle.ColorComponentFlag.A_BIT,
)

color_blend_info = vkbottle.ColorBlendStateCreateInfo(
    logicOpEnable=vkbottle.Bool(0),
    logicOp=vkbottle.LogicOp.COPY,
    attachments=[blend_attachment],
    blendConstants=[0.0, 0.0, 0.0, 0.0],
)

# --- 9. 定义 Depth/Stencil Test ---
depth_stencil_info = vkbottle.DepthStencilStateCreateInfo(
    depthTestEnable=vkbottle.Bool(1),  # 深度测试启用
    depthWriteEnable=vkbottle.Bool(1),  # 深度写入启用
    depthCompareOp=vkbottle.CompareOp.LESS_OR_EQUAL,  # 深度比较（小于等于通过）
    depthBoundsTestEnable=vkbottle.Bool(0),
    stencilTestEnable=vkbottle.Bool(0),
    front=vkbottle.StencilOpState(),  # 默认
    back=vkbottle.StencilOpState(),
    minDepthBounds=0.0,
    maxDepthBounds=1.0,
)

# --- 10. 创建 Pipeline Layout ---
pipeline_layout = device.create_pipeline_layout(
    setLayouts=[descriptor_set_layout],  # 描述符集
    pushConstantRanges=[],  # 推送常量（可选）
)

# --- 11. 创建 Pipeline ---
graphics_pipeline_info = vkbottle.GraphicsPipelineCreateInfo(
    stageCreateInfos=shader_stage_info,
    vertexInputState=vertex_input_info,
    inputAssemblyState=input_assembly_info,
    viewportState=viewport_state_info,
    rasterizationState=rasterization_info,
    multisampleState=multisample_info,
    colorBlendState=color_blend_info,
    depthStencilState=depth_stencil_info,
    layout=pipeline_layout,
    renderPass=render_pass,
    subpass=0,
)

graphics_pipeline = device.create_graphics_pipelines(None, [graphics_pipeline_info])[0]
print(f"Pipeline 已创建! 状态数: {len(graphics_pipeline)}")

# --- 12. 清理 Shader Modules ---
vs_module.destroy()
fs_module.destroy()
```

## 4.4 图元拓扑类型

| 拓扑类型 | 说明 | 适用场景 |
| **TRIANGLE_LIST** | 三角形列表（最常用 ✅） | 3D 模型 |
| **LINE_LIST** | 线段列表 | 网格线 |
| **LINE_STRIP** | 线段链 | 轮廓线 |
| **POINT_LIST** | 点列表 | 粒子系统 |
| **PATCH_LIST** | 补丁列表（Tessellation） | 曲面 |

## 4.5 深度比较模式

| 模式 | 说明 |
| `NEVER` | 永不通过 |
| `LESS` | 小于通过 |
| `EQUAL` | 等于通过 |
| `LESS_OR_EQUAL` | **小于等于通过（推荐 ✅）** |
| `GREATER` | 大于通过 |
| `NOT_EQUAL` | 不等于通过 |
| `GREATER_OR_EQUAL` | 大于等于通过 |
| `ALWAYS` | 总是通过 |

## 4.6 Pipeline 状态速查

| 状态 | 关键参数 |
| Vertex Input | binding, stride, attribute |
| Input Assembly | topology（TRIANGLE_LIST） |
| Viewport | x,y,width,height |
| Scissor | offset, extent |
| Rasterization | polygonMode, cullMode, frontFace |
| Multisample | samples, alphaToCoverage |
| Color Blend | blendEnable, src/dstFactor |
| Depth/Stencil | depthTestEnable, depthCompareOp |
| Pipeline Layout | descriptorSetLayouts |

---