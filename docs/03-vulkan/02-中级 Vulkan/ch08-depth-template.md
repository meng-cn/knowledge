# 第八章 · 深度测试与模板测试

## 8.1 深度测试概述 🔥

```
深度缓冲（Depth Buffer / Z-Buffer）:
────────────────────────────────

屏幕:                          深度缓冲:
┌─────────┐                   ┌──────────────┐
│         │    对应    ─────▶   │ 0.0   0.1   │
│         │                       0.2   0.3   │
│         │                       ...   ...   │
└─────────┘                   └──────────────┘

每个像素除了颜色值外，还有一个深度值
绘制时比较深度值决定像素是否可见

默认:
  - 深度测试启用
  - 深度写入启用
  - 比较操作: LESS_OR_EQUAL（近处遮挡远处）
```

## 8.2 深度缓冲创建

### 8.2.1 深度附件

```python
import vkbottle

# --- 创建深度 Image ---
depth_image_create_info = vkbottle.ImageCreateInfo(
    imageType=vkbottle.ImageType._2D,
    format=vkbottle.Format.D32_SFLOAT,  # 或 D24_UNORM_S8_UINT
    extent=vkbottleExtent(swapchain_image_extent.width, swapchain_image_extent.height, 1),
    mipLevels=1,
    arrayLayers=1,
    samples=vkbottle.SampleCountFlagBits._1,  # MSAA 时设为 _4 等
    tiling=vkbottle.ImageTiling.OPTIMAL,
    usage=vkbottle.ImageUsageFlag.DEPTH_STENCIL_ATTACHMENT,
    sharingMode=vkbottle.SharingMode.EXCLUSIVE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
)
depth_image = device.create_image(depth_image_create_info)

# --- 分配内存 ---
depth_mem_reqs = depth_image.get_memory_requirements()
depth_mem_alloc = vkbottle.MemoryAllocateInfo(
    allocationSize=depth_mem_reqs.size,
    memoryTypeIndex=find_memory_type_index(
        device.get_memory_properties(),
        depth_mem_reqs.memoryTypeBits,
        vkbottle.MemoryPropertyFlag.DEVICE_LOCAL,
    ),
)
depth_image_memory = device.allocate_memory(depth_mem_alloc)
device.bind_image_memory(depth_image, depth_image_memory, 0)

# --- 创建 Image View ---
depth_image_view = device.create_image_view(
    image=depth_image,
    format=vkbottle.Format.D32_SFLOAT,
    viewType=vkbottle.ImageViewType._2D,
    subresourceRange=vkbottle.ImageSubresourceRange(
        aspectMask=vkbottle.ImageAspectFlag.DEPTH_BIT,
        baseMipLevel=0,
        levelCount=1,
        baseArrayLayer=0,
        layerCount=1,
    ),
)
```

### 8.2.2 深度格式选择

| 格式 | 深度 | 模板 | 大小 | 说明 |
| `D32_SFLOAT` | 32 | 0 | 4 bytes | 高精度（无模板） |
| `D24_UNORM_S8_UINT` | 24 | 8 | 4 bytes | 均衡 ✅ |
| `D16_UNORM` | 16 | 0 | 2 bytes | 低精度 |
| `X8_D24_UNORM` | 24 | 8 | 4 bytes | 带模板 |
| `D32_SFLOAT_S8_UINT` | 32 | 8 | 4 bytes | 最高精度 |

## 8.3 深度测试配置

### 8.3.1 Pipeline 中的深度测试

```python
# 在 Pipeline 创建时设置深度测试参数
depth_stencil_info = vkbottle.DepthStencilStateCreateInfo(
    depthTestEnable=vkbottle.Bool(1),        # 启用深度测试
    depthWriteEnable=vkbottle.Bool(1),        # 启用深度写入
    depthCompareOp=vkbottle.CompareOp.LESS,   # 比较操作
    depthBoundsTestEnable=vkbottle.Bool(0),   # 深度范围测试
    minDepthBounds=0.0,                        # 最小深度
    maxDepthBounds=1.0,                        # 最大深度
    stencilTestEnable=vkbottle.Bool(0),        # 模板测试
    front=vkbottle.StencilOpState(),
    back=vkbottle.StencilOpState(),
)
```

### 8.3.2 深度比较操作

| 操作 | 说明 | 适用场景 |
| `NEVER` | 永远不通过 | 调试 |
| `LESS` | 近处遮挡远处 | 默认 ✅ |
| `EQUAL` | 相等通过 | 特殊效果 |
| `LESS_OR_EQUAL` | 近处或相等通过 | 标准深度测试 |
| `GREATER` | 远处遮挡近处 | 反常规 |
| `NOT_EQUAL` | 不相等通过 | 特殊效果 |
| `GREATER_OR_EQUAL` | 远处或相等通过 | 反常规 |
| `ALWAYS` | 永远通过 | 调试 |

## 8.4 模板测试

### 8.4.1 模板缓冲创建

```python
# --- 创建模板缓冲 ---
# 通常与深度缓冲合并（D24_S8 格式）
# 或使用独立的模板附件

stencil_attachment = vkbottle.AttachmentDescription(
    format=vkbottle.Format.S8_UINT,  # 8-bit 模板
    samples=vkbottle.SampleCountFlagBits._1,
    loadOp=vkbottle.AttachmentLoadOp.CLEAR,
    storeOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    stencilLoadOp=vkbottle.AttachmentLoadOp.CLEAR,
    stencilStoreOp=vkbottle.AttachmentStoreOp.DONT_CARE,
    initialLayout=vkbottle.ImageLayout.UNDEFINED,
    finalLayout=vkbottle.ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
)
```

### 8.4.2 模板测试配置

```python
# --- Pipeline 中启用模板测试 ---
stencil_state = vkbottle.StencilOpState(
    failOp=vkbottle.StencilOp.KEEP,        # 模板测试失败
    depthFailOp=vkbottle.StencilOp.KEEP,   # 深度测试失败
    passOp=vkbottle.StencilOp.REPLACE,     # 模板测试通过
    compareOp=vkbottle.CompareOp.ALWAYS,    # 比较操作
    compareMask=0xFF,                        # 比较掩码
    writeMask=0xFF,                          # 写入掩码
    reference=0,                             # 参考值
)

depth_stencil_info = vkbottle.DepthStencilStateCreateInfo(
    depthTestEnable=vkbottle.Bool(1),
    depthWriteEnable=vkbottle.Bool(1),
    depthCompareOp=vkbottle.CompareOp.LESS_OR_EQUAL,
    depthBoundsTestEnable=vkbottle.Bool(0),
    minDepthBounds=0.0,
    maxDepthBounds=1.0,
    stencilTestEnable=vkbottle.Bool(1),      # 启用模板测试
    front=stencil_state,
    back=stencil_state,
)
```

### 8.4.3 模板操作

| 操作 | 说明 |
| `KEEP` | 保持模板值不变 |
| `ZERO` | 设为 0 |
| `REPLACE` | 设为参考值（Reference） |
| `INCREMENT` | +1（溢出后保留最大值） |
| `INCREMENT_AND_WRAP` | +1（溢出后回到最小值） |
| `DECREMENT` | -1（下溢后保留最小值） |
| `DECREMENT_AND_WRAP` | -1（下溢后回到最大值） |
| `INVERT` | 按位取反 |

### 8.4.4 模板比较操作

| 操作 | 说明 |
| `NEVER` | 永远不通过 |
| `ALWAYS` | 永远通过 |
| `LESS` | 参考值 < 模板值 |
| `EQUAL` | 参考值 = 模板值 |
| `LESS_OR_EQUAL` | 参考值 ≤ 模板值 |
| `GREATER` | 参考值 > 模板值 |
| `NOT_EQUAL` | 参考值 ≠ 模板值 |
| `GREATER_OR_EQUAL` | 参考值 ≥ 模板值 |

## 8.5 深度偏移（Depth Bias）

```python
# --- 配置深度偏置 ---
rasterization_info = vkbottle.RasterizationStateCreateInfo(
    depthClampEnable=vkbottle.Bool(0),
    rasterizerDiscardEnable=vkbottle.Bool(0),
    polygonMode=vkbottle.PolygonMode.FILL,
    cullMode=vkbottle.CullModeFlag.BACK,
    frontFace=vkbottle.Face.FRONT_CCW,
    depthBiasEnable=vkbottle.Bool(1),    # 启用深度偏置
    depthBiasConstantFactor=0.0,           # 常量偏移
    depthBiasClamp=0.0,                    # 常量偏移限制
    depthBiasSlopeFactor=0.0,              # 斜率偏移
    lineWidth=1.0,
)

# --- 用途: 解决阴影 acne（阴影自遮挡）---
# 将深度值略微增加，防止表面自身被误遮挡
```

## 8.6 渲染顺序

```
渲染顺序对深度测试的影响:

正确（按深度排序）:
  1. 远处物体 → 写入深度
  2. 近处物体 → 深度测试通过
  3. 正确遮挡 ✅

错误（不按深度排序）:
  1. 近处物体 → 写入深度
  2. 远处物体 → 深度测试失败 ❌
  3. 丢失深度信息

透明物体:
  - 关闭深度写入（depthWriteEnable=0）
  - 仍进行深度测试
  - 必须从后往前排序 ✅
```

## 8.7 深度/模板速查

| 概念 | 配置位置 |
| 深度测试 | `depthStencilState.depthTestEnable` |
| 深度写入 | `depthStencilState.depthWriteEnable` |
| 深度比较 | `depthStencilState.depthCompareOp` |
| 深度偏移 | `rasterizationState.depthBiasEnable` |
| 模板启用 | `depthStencilState.stencilTestEnable` |
| 模板操作 | `front/back.failOp/passOp/depthFailOp` |
| 模板比较 | `front/back.compareOp` |
| 深度附件 | `AttachmentDescription(format=D24_S8...)` |
| 深度 Image | `Image(format=D32_SFLOAT...)` |

---

| 7. 描述符 | ✅ |
| 8. 深度与模板 | ✅ |
| 9. 采样器与纹理 | 🔲 |
| 10-15 | 🔲 |
| 16-25 | 🔲 |
| 26-30 | 🔲 |
| 31-40 | 🔲 |
| A-D 附录 | 🔲 |