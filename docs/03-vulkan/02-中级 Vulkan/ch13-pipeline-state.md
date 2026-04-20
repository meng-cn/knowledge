# 第十三章 · 管线状态管理

## 13.1 Pipeline Layout

```
Pipeline Layout = Pipeline 的"签名"
- 描述符集布局 (Descriptor Set Layouts)
- 推送常量范围 (Push Constants)

Pipeline Layout 定义了 Shader 可以访问的所有资源
类比：C 函数签名
```

### 13.1.1 创建 Pipeline Layout

```python
import vkbottle

pipeline_layout_create_info = vkbottle.PipelineLayoutCreateInfo(
    setLayouts=[
        descriptor_set_layout,  # 描述符集布局
    ],
    pushConstantRanges=[
        vkbottle.PushConstantRange(
            stageFlags=vkbottle.ShaderStageFlag.VERTEX | vkbottle.ShaderStageFlag.FRAGMENT,
            offset=0,
            size=32,  # 32 bytes push constants
        ),
    ],
)
pipeline_layout = device.create_pipeline_layout(pipeline_layout_create_info)
```

## 13.2 绑定顺序

```
正确的绑定顺序（必须与 Pipeline Layout 顺序一致）:

1. vkCmdBindPipeline()                    → 绑定 Pipeline
2. vkCmdBindDescriptorSets()               → 绑定描述符集
   setLayouts: [Layout0, Layout1]
   descriptorSets: [Set0, Set1]
3. vkCmdBindVertexBuffers()                → 绑定顶点缓冲
4. vkCmdBindIndexBuffer()                  → 绑定索引缓冲
5. vkCmdDraw() / vkCmdDrawIndexed()       → 绘制
```

### 13.2.1 描述符集绑定

```python
# 绑定多个描述符集（如果有多个 Layout）
command_buffer.bind_descriptor_sets(
    pipelineBindPoint=vkbottle.PipelineBindPoint.GRAPHICS,
    layout=pipeline_layout,
    firstSet=0,                    # 从哪个 set 开始
    descriptorSets=[               # Set 数组
        descriptor_set_0,          # Set 0
        descriptor_set_1,          # Set 1
    ],
    dynamicOffsets=[],             # 动态偏移（如果有 Dynamic Layout）
)
```

## 13.3 动态状态

```
动态状态 = 可以在渲染时动态改变的参数（不需要重建 Pipeline）

动态状态类型:
┌──────────────────────────────────────────────────┐
│ • Viewport                    │ • 视口尺寸       │
│ • Scissor                     │ • 裁剪区域       │
│ • LineWidth                   │ • 线条宽度       │
│ • DepthBias                   │ • 深度偏置       │
│ • BlendConstants              │ • 混合常数       │
│ • CompareMask                 │ • 模板比较掩码   │
│ • WriteMask                   │ • 模板写入掩码   │
│ • Reference                   │ • 模板参考值     │
│ • DepthBoundsTestEnable       │ • 深度范围测试   │
└───────────────────────────────────────────────────┘

启用动态状态:
  pipeline.create_info.dynamicState = [
      vkbottle.DynamicState.VIEWPORT,
      vkbottle.DynamicState.SCISSOR,
      vkbottle.DynamicState.LINE_WIDTH,
  ]
```

### 13.3.1 动态状态设置

```python
# 在渲染循环中动态改变
command_buffer.set_viewport(
    firstViewport=0,
    viewports=[
        vkbottle.Viewport(
            x=0.0,
            y=0.0,
            width=800.0,
            height=600.0,
            minDepth=0.0,
            maxDepth=1.0,
        ),
    ],
)

command_buffer.set_scissor(
    firstScissor=0,
    scissors=[
        vkbottle.Rect2D(
            offset=(0, 0),
            extent=(800, 600),
        ),
    ],
)
```

## 13.4 管线创建流程

```
1. 加载 Shader Modules
   → vkCreateShaderModule(vs_code, fs_code)
   
2. 创建 Shader Stage Info
   → PipelineShaderStageCreateInfo(vs_stage, fs_stage)
   
3. 定义 Vertex Input
   → VertexInputStateCreateInfo
   
4. 定义 Input Assembly
   → InputAssemblyStateCreateInfo(TOPology=TRIANGLE_LIST)
   
5. 定义 Viewport + Scissor
   → ViewportStateCreateInfo
   
6. 定义 Rasterization
   → RasterizationStateCreateInfo
   
7. 定义 Multisample
   → MultisampleStateCreateInfo
   
8. 定义 Color Blend
   → ColorBlendStateCreateInfo
   
9. 定义 Depth/Stencil
   → DepthStencilStateCreateInfo
   
10. 创建 Pipeline Layout
    → PipelineLayoutCreateInfo
    
11. 创建 Pipeline
    → createGraphicsPipelines()
```

## 13.5 Pipeline Cache（管线缓存）

```python
# Pipeline 创建成本高，可缓存重复创建
# 保存 Pipeline 的二进制表示

# 创建 Pipeline Cache
pipeline_cache = device.create_pipeline_cache(
    vkbottle.PipelineCacheCreateInfo()
)

# 使用 Cache 创建 Pipeline
pipeline = device.create_graphics_pipelines(
    pipelineCache=pipeline_cache,  # 传入 Cache
    createInfos=[pipeline_create_info],
)

# 导出 Cache
cache_data = pipeline_cache.get_data()[0]
with open('pipeline_cache.bin', 'wb') as f:
    f.write(cache_data)

# 下次启动时导入 Cache
with open('pipeline_cache.bin', 'rb') as f:
    cache_data = f.read()
pipeline_cache_import = vkbottle.PipelineCacheCreateInfo(
    initialData=cache_data,
    initialDataSize=len(cache_data),
)
```

---
