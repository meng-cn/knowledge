# 第十八章 · 动态状态 (Dynamic State)

## 18.1 动态状态概述

```
动态状态 = 渲染时动态改变的参数（无需重建 Pipeline）

传统 Pipeline:
  所有状态在 Pipeline 创建时固化
  改变 → 重建 Pipeline（成本高！）

动态状态:
  Pipeline 创建时声明"这些状态是动态的"
  渲染时直接设置（零成本！）
```

## 18.2 支持的动态状态

| 动态状态 | Pipeline 中的默认值 | 动态设置方式 |
| `VIEWPORT` | `Viewport` | `vkCmdSetViewport()` |
| `SCISSOR` | `Rect2D` | `vkCmdSetScissor()` |
| `LINE_WIDTH` | `float` | `vkCmdSetLineWidth()` |
| `DEPTH_BIAS` | `DepthBiasState` | `vkCmdSetDepthBias()` |
| `BLEND_CONSTANTS` | `float[4]` | `vkCmdSetBlendConstants()` |
| `DEPTH_BOUNDS` | `float` | `vkCmdSetDepthBounds()` |
| `STENCIL_COMPARE_MASK` | `uint32` | `vkCmdSetStencilCompareMask()` |
| `STENCIL_WRITE_MASK` | `uint32` | `vkCmdSetStencilWriteMask()` |
| `STENCIL_REFERENCE` | `uint32` | `vkCmdSetStencilReference()` |
| `DYNAMIC_SAMPLE_LOCATIONS` | `SampleLocation` | `vkCmdSetSampleLocations()` |

## 18.3 启用动态状态

### 18.3.1 Pipeline 创建时声明

```python
import vkbottle

# 在 Pipeline 创建时声明哪些状态是动态的
pipeline_create_info = vkbottle.GraphicsPipelineCreateInfo(
    # ... 其他状态 ...
    pDynamicStates=[
        vkbottle.DynamicState.VIEWPORT,
        vkbottle.DynamicState.SCISSOR,
        vkbottle.DynamicState.LINE_WIDTH,
        vkbottle.DynamicState.DEPTH_BIAS,
        vkbottle.DynamicState.BLEND_CONSTANTS,
    ],
)
graphics_pipeline = device.create_graphics_pipelines(None, [pipeline_create_info])[0]
```

### 18.3.2 渲染时设置

```python
# 在渲染循环中动态设置
command_buffer.set_viewport(
    firstViewport=0,
    viewports=[
        vkbottle.Viewport(
            x=0.0,
            y=0.0,
            width=viewport_width,   # 动态宽度
            height=viewport_height,  # 动态高度
            minDepth=0.0,
            maxDepth=1.0,
        ),
    ],
)

command_buffer.set_scissor(
    firstScissor=0,
    scissors=[
        vkbottle.Rect2D(
            offset=(x_offset, y_offset),  # 动态偏移
            extent=(width, height),
        ),
    ],
)

command_buffer.set_line_width(2.0)  # 动态线宽
command_buffer.set_depth_bias(1.0, 0.0, 0.0)  # 动态深度偏置
command_buffer.set_blend_constants([0.5, 0.5, 0.5, 1.0])  # 动态混合
command_buffer.set_depth_bounds(0.0, 1.0)  # 动态深度范围
```

## 18.4 动态状态 vs 静态状态

| 特性 | 动态状态 | 静态状态 |
| 性能 | ⚡ 快（运行时设置） | 中等（Pipeline 固化） |
| 灵活性 | 高（每帧可改） | 低（需重建 Pipeline） |
| Pipeline 创建成本 | 中等 | 中等 |
| 渲染开销 | 零 | 零 |
| 适用场景 | 视口/裁剪区变化 | 固定状态 |
| 推荐 | 视口、裁剪、线宽 | 拓扑、光栅、混合等 |

## 18.5 动态状态速查

| 动态状态 | 用途 |
| VIEWPORT | 视口尺寸/位置 |
| SCISSOR | 裁剪区域 |
| LINE_WIDTH | 线宽 |
| DEPTH_BIAS | 深度偏置 |
| BLEND_CONSTANTS | 混合常数 |
| DEPTH_BOUNDS | 深度范围 |
| STENCIL_COMPARE_MASK | 模板比较掩码 |
| STENCIL_WRITE_MASK | 模板写入掩码 |
| STENCIL_REFERENCE | 模板参考值 |
| DYNAMIC_SAMPLE_LOCATIONS | 采样位置（MSAA） |

---

| 16-17 | ✅ |
| **18. 动态状态** | ✅ |
| 19-25 | 🔲 |