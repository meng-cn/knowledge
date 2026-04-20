# 第九章 · 采样器与纹理过滤

## 9.1 Sampler 概述 🔥

```
Sampler = 纹理采样配置
类比：放大镜的设置

采样器控制:
┌────────────────────────────────────┐
│ 1. 坐标处理                         │
│    • 超出边界如何处理？(Wrap Mode)  │
│    • 重复 / 镜像 / clamp / mirror │
│                                     │
│ 2. 缩放（当纹理比显示区域大/小时）  │
│    • 最小（缩小）: NEAREST / LINEAR │
│    • 最大（放大）: NEAREST / LINEAR │
│                                     │
│ 3. Mipmap                            │
│    • 是否使用 Mipmap？              │
│    • 哪种 Mipmap 模式？             │
│                                     │
│ 4. 各向异性过滤                     │
│    • 过滤级别 (1.0 - 最大)          │
│                                     │
│ 5. 比较函数                          │
│    • 深度比较（Shadow Maps）        │
│                                     │
│ 6. 颜色格式                         │
│    • 归一化 vs 未归一化             │
│    • 边界颜色                        │
└─────────────────────────────────────┘
```

## 9.2 创建 Sampler

### 9.2.1 基本 Sampler

```python
import vkbottle

# --- 创建 Sampler ---
sampler_create_info = vkbottle.SamplerCreateInfo(
    magFilter=vkbottle.Filter.LINEAR,  # 放大过滤
    minFilter=vkbottle.Filter.LINEAR,  # 缩小过滤
    mipmapMode=vkbottle.SamplerMipmapMode.LINEAR,  # Mipmap 过滤
    addressModeU=vkbottle.SamplerAddressMode.REPEAT,  # U 方向寻址
    addressModeV=vkbottle.SamplerAddressMode.REPEAT,  # V 方向寻址
    addressModeW=vkbottle.SamplerAddressMode.REPEAT,  # W 方向寻址
    mipLodBias=0.0,  # Mipmap LOD 偏置
    anisotropyEnable=vkbottle.Bool(1),  # 启用各向异性
    maxAnisotropy=16.0,  # 最大各向异性级别
    compareEnable=vkbottle.Bool(0),  # 比较模式（用于阴影）
    compareOp=vkbottle.CompareOp.LESS_OR_EQUAL,
    minLod=0.0,  # 最小 LOD
    maxLod=vkbottle.INFINITYF,  # 最大 LOD
    borderColor=vkbottle.BorderColor.FLOAT_OPAQUE_WHITE,  # 边界颜色
    unnormalizedCoordinates=vkbottle.Bool(0),  # 归一化坐标
)

sampler = device.create_sampler(sampler_create_info)
```

### 9.2.2 寻址模式（Address Mode）

| 模式 | 说明 | 适用场景 |
| **REPEAT** | 重复纹理 | 地面/背景 ✅ |
| **MIRRORED_REPEAT** | 镜像重复 | 无缝重复 |
| **CLAMP_TO_EDGE** | 夹到边缘 | UI/菜单 ✅ |
| **CLAMP_TO_BORDER** | 夹到边界色 | HUD |
| **MIRRORED_CLAMP_TO_EDGE** | 镜像到边缘 | 特殊效果 |

### 9.2.3 过滤模式（Filter）

| 模式 | 说明 |
| **NEAREST** | 最近邻（像素化） |
| **LINEAR** | 双线性（平滑） |

### 9.2.4 Mipmap LOD 模式

| 模式 | 说明 |
| `NEAREST` | 最近 LOD 层级 |
| `LINEAR` | 线性插值 LOD |
| `NEAREST_MIP_LINEAR` | 最近 + 线性 |
| `LINEAR_MIP_NEAREST` | 线性 + 最近 |

## 9.3 Mipmap LOD

### 9.3.1 LOD 计算

```
LOD（Level of Detail）:

LOD 0: 原始纹理 (256x256)
LOD 1: 128x128
LOD 2: 64x64
LOD 3: 32x32
LOD 4: 16x16
LOD 5: 8x8
LOD 6: 4x4
LOD 7: 2x2
LOD 8: 1x1

LOD 范围: [0, numMipLevels - 1]

minLod: 最小使用的 LOD
maxLod: 最大使用的 LOD
mipLodBias: LOD 偏置（正值=使用更小的纹理）

应用:
  mipLodBias = log2(distance / 256.0)  # 距离越远 LOD 越大
```

### 9.3.2 LOD 采样

```python
# 控制 LOD 范围的 Sampler
sampler_lod_create_info = vkbottle.SamplerCreateInfo(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.LINEAR,
    mipLodBias=2.0,  # 偏置 +2，优先使用更小的 Mipmap
    minLod=0.0,
    maxLod=4.0,  # 最大使用 LOD 4（不会用更小的纹理）
)
sampler_lod = device.create_sampler(sampler_lod_create_info)
```

## 9.4 各向异性过滤

### 9.4.1 原理

```
各向异性过滤解决的是"远处纹理倾斜"的问题:

正常采样:
  ┌───┬───┐
  │ A │ B │  ← 均匀采样
  ├───┼───┤
  │ C │ D │
  └───┴───┘

倾斜采样（远处地面）:
  ┌─────┬──────┐
  │ A   │ B    │  ← 拉伸的不均匀采样
  ├───┬───┼───┬──┤
  │ C │   │ D │
  └───┴───┴───┴──┘

各向异性过滤 = 从多个角度采样 + 加权平均
结果: 倾斜纹理依然清晰 ✅
```

### 9.4.2 设置各向异性

```python
sampler_aniso = vkbottle.SamplerCreateInfo(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.LINEAR,
    anisotropyEnable=vkbottle.Bool(1),
    maxAnisotropy=16.0,  # 最大各向异性级别
)
# 1.0 = 无各向异性
# 2.0 - 4.0 = 低质量（移动设备推荐）
# 8.0 - 16.0 = 高质量（桌面端推荐）
```

## 9.5 纹理格式

### 9.5.1 常见纹理格式

| 格式 | 每像素 | 说明 |
| `R8_UNORM` | 1 byte | 单通道 8 位 |
| `RG8_UNORM` | 2 bytes | 双通道 8 位 |
| `RGBA8_UNORM` | 4 bytes | 标准 8 位 RGBA |
| `RGBA8_SRGB` | 4 bytes | sRGB 空间 ✅ |
| `BGR8A8_UNORM` | 4 bytes | 非标准（某些 GPU） |
| `B8G8R8A8_UNORM` | 4 bytes | Vulkan 标准 |
| `D32_SFLOAT` | 4 bytes | 深度 32 位 |
| `D24_UNORM_S8_UINT` | 4 bytes | 深度+模板 |
| `R16_SFLOAT` | 2 bytes | HDR 单通道 |
| `RGBA32_SFLOAT` | 16 bytes | HDR RGBA |
| `RGBA16_SFLOAT` | 8 bytes | HDR RGBA 半精度 |
| `BC1_RGB_SRGB_BLOCK` | 8 bytes | DXT1（压缩） |
| `BC3_RGBA_UNORM_BLOCK` | 16 bytes | DXT5（压缩） |
| `BC7_SRGB_BLOCK` | 8 bytes | BC7（高质量压缩） |
| `ETC2_R8G8B8A8_BLOCK` | 16 bytes | ETC2（移动设备） |
| `ASTC_4x4` | 16 bytes | ASTC（移动设备） |

### 9.5.2 压缩纹理格式

| 压缩格式 | 压缩比 | 质量 | 平台 |
| **BC1/BC7** | 4:1 | 高 | PC (DXT) |
| **ETC2** | 4:1 | 中 | Android |
| **ASTC** | 可变 | 高 | Android/iOS |
| **PVRTC** | 4:1 | 中 | iOS |
| **FXT1** | 4:1 | 低 | Android |

### 9.5.3 查询支持的格式

```python
# 查询设备支持的纹理格式
props = device.get_physical_device().get_properties()
format_props = device.get_physical_device().get_format_properties(vkbottle.Format.R8G8B8A8_UNORM)

print(f"支持的线性采样: {format_props.linearTilingFeatures}")
print(f"支持的优化采样: {format_props.optimalTilingFeatures}")
print(f"支持的 Buffer 使用: {format_props.bufferFeatures}")

# 获取所有支持的格式
formats = device.get_physical_device().get_format_properties()
```

## 9.6 创建 Sampler 速查

| 参数 | 常用值 | 说明 |
| `magFilter` | `LINEAR` | 放大过滤 |
| `minFilter` | `LINEAR` | 缩小过滤 |
| `mipmapMode` | `LINEAR` | Mipmap 过滤 |
| `addressModeU/V/W` | `REPEAT`/`CLAMP_TO_EDGE` | 寻址 |
| `mipLodBias` | `0.0` | LOD 偏置 |
| `anisotropyEnable` | `1` | 启用各向异性 |
| `maxAnisotropy` | `16.0` | 最大级别 |
| `compareEnable` | `0` | 比较模式（阴影） |
| `minLod/maxLod` | `0.0/∞` | LOD 范围 |
| `borderColor` | `FLOAT_OPAQUE_WHITE` | 边界颜色 |

---

## 9.7 纹理采样（GLSL）

```glsl
// Sampler 在 Shader 中的使用
layout(binding = 1) uniform sampler2D texSampler;
layout(binding = 2) uniform sampler2D tex;

// 采样
vec4 color = texture(texSampler, texCoord);

// 带 LOD 采样
vec4 colorLOD = textureLod(texSampler, texCoord, lod);

// 带偏置采样
vec4 colorBias = texture(texSampler, texCoord, bias);

// Mipmap 自动
vec4 colorMip = texture(texSampler, texCoord);  // 自动选 LOD
```

## 9.8 常用 Sampler 预设

```python
# --- 默认 Sampler（点采样 + 无 mipmap + 边缘夹紧）---
sampler_default = device.create_sampler(
    magFilter=vkbottle.Filter.NEAREST,
    minFilter=vkbottle.Filter.NEAREST,
    mipmapMode=vkbottle.SamplerMipmapMode.NEAREST,
    addressModeU=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
    addressModeV=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
    addressModeW=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
)

# --- 线性 Sampler（双线性 + mipmap + 重复）---
sampler_linear = device.create_sampler(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.LINEAR,
    addressModeU=vkbottle.SamplerAddressMode.REPEAT,
    addressModeV=vkbottle.SamplerAddressMode.REPEAT,
    addressModeW=vkbottle.SamplerAddressMode.REPEAT,
    anisotropyEnable=vkbottle.Bool(1),
    maxAnisotropy=16.0,
)

# --- 阴影 Sampler（比较模式）---
sampler_shadow = device.create_sampler(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.NEAREST,
    compareEnable=vkbottle.Bool(1),
    compareOp=vkbottle.CompareOp.LESS_OR_EQUAL,
    addressModeU=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
    addressModeV=vkbottle.SamplerAddressMode.CLAMP_TO_EDGE,
)

# --- 无 Mipmap Sampler ---
sampler_no_mip = device.create_sampler(
    magFilter=vkbottle.Filter.LINEAR,
    minFilter=vkbottle.Filter.LINEAR,
    mipmapMode=vkbottle.SamplerMipmapMode.NEAREST,
    minLod=0.0,
    maxLod=0.0,  # 强制使用 LOD 0
)
```

---

| 1-6. 基础架构到同步 | ✅ (6 章) |
| **Part II · 中级 Vulkan** | 🔲 |
| 7-9. 描述符/深度/采样 | 🔲 |
| 10-15 | 🔲 |
| 16-25 | 🔲 |
| 26-35 | 🔲 |
| 36-40 | 🔲 |
| A-D 附录 | 🔲 |