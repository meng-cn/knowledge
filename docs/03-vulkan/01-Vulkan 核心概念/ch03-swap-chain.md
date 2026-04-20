# 第三章 · 交换链 (Swap Chain)

## 3.1 Swap Chain 概述 🔥

### 3.1.1 什么是 Swap Chain

```
Swap Chain = 图像缓冲池 + 帧呈现系统

┌───────┐
│  Image 1 │ ← Front Buffer（显示中）
├─────────┤
│  Image 2 │ ← Back Buffer（渲染中）
├─────────┤
│  Image 3 │ ← Back Buffer（排队中）
└───────┘

传统双缓冲:
  Back Buffer 渲染 → SwapBuffers → 变为 Front Buffer
  旧 Front Buffer 变成 Back Buffer

Swap Chain 的好处:
  - 可以管理多个缓冲（3-4 个）
  - 控制呈现模式（VSync/无锁/VSync 动态）
  - 控制图像格式、尺寸
  - 异步获取/呈现
```

### 3.1.2 呈现模式（Present Mode）

| 模式 | 说明 | 延迟 | 撕裂 |
| **FIFO** | 垂直同步（最常用） | 最低 | ❌ |
| **FIFO_RELAXED** | 无锁 VSync | 低 | ❌（下一帧） |
| **IMMEDIATE** | 无锁（直接呈现） | 最低 | ✅ 可能 |
| **MAILBOX** | 替换缓冲（VSync 快） | 低 | ❌ |

**推荐**：FIFO（VSync）用于游戏，IMMEDIATE 用于高性能需求

## 3.2 创建 Swap Chain 🔥

### 3.2.1 完整流程

```python
import vkbottle

# --- 1. 查询 Surface 信息 ---
surface_caps = device.get_surface_capabilitiesKHR(surface)
surface_formats = device.get_surface_formatsKHR(surface)
surface_present_modes = device.get_surface_present_modesKHR(surface)

# --- 2. 选择呈现模式 ---
preferred_present_mode = vkbottle.PresentModeKHR.FIFO  # 默认 VSync
for mode in surface_present_modes:
    if mode == vkbottle.PresentModeKHR.IMMEDIATE:
        preferred_present_mode = mode
        break

# --- 3. 选择图像格式 ---
# 选择第一个合适的格式（通常是 VK_FORMAT_B8G8R8A8_SRGB）
surface_format = surface_formats[0]
for fmt in surface_formats:
    if fmt.format == vkbottle.Format.B8G8R8A8_SRGB:
        surface_format = fmt
        break

# --- 4. 选择图像数量 ---
min_image_count = surface_caps.minImageCount + 1
if surface_caps.maxImageCount > 0:
    min_image_count = min(min_image_count, surface_caps.maxImageCount)

# --- 5. 设置其他参数 ---
desired_image_extent = surface_caps.currentModeExtent
# 如果 surface_caps.currentExtent 是 (-1, -1)，说明窗口大小可变
if surface_caps.currentExtent.width == 256:
    desired_image_extent = (800, 600)  # 手动指定

desired_image_extent = (
    max(surface_caps.minImageExtent.width, min(surface_caps.maxImageExtent.width, desired_image_extent.width)),
    max(surface_caps.minImageExtent.height, min(surface_caps.maxImageExtent.height, desired_image_extent.height))
)

# --- 6. 创建 Swap Chain ---
swapchain_create_info = vkbottle.SwapchainCreateInfoKHR(
    surface=surface,
    minImageCount=min_image_count,
    imageFormat=surface_format.format,
    imageColorSpace=vkbottle.ColorSpaceKHR.SRGB_NONLINEAR,
    imageExtent=desired_image_extent,
    imageArrayLayers=1,
    imageUsage=vkbottle.ImageUsageFlag.COLOR_ATTACHMENT,
    imageSharingMode=vkbottle.SharingMode.EXCLUSIVE,
    preTransform=surface_caps.currentTransform,
    compositeAlpha=vkbottle.CompositeAlphaKHR.OPREQUE,
    presentMode=preferred_present_mode,
    clipped=vkbottle.Bool(1),
    oldSwapchain=swapchain,  # 如果重建，传入旧的 swapchain
)

swapchain = device.create_swapchain_khr(swapchain_create_info)

# --- 7. 获取 Swap Chain Images ---
swapchain_images = swapchain.get_images()

# --- 8. 创建 Image Views ---
swapchain_image_views = []
for image in swapchain_images:
    image_view = device.create_image_view(
        image=image,
        format=surface_format.format,
        componentMapping=vkbottle.ComponentMapping(
            vkbottle.ComponentSwizzle.IDENTITY,
            vkbottle.ComponentSwizzle.IDENTITY,
            vkbottle.ComponentSwizzle.IDENTITY,
            vkbottle.ComponentSwizzle.IDENTITY,
        ),
        subresourceRange=vkbottle.ImageSubresourceRange(
            aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
            baseMipLevel=0,
            levelCount=1,
            baseArrayLayer=0,
            layerCount=1,
        ),
        viewType=vkbottle.ImageViewType._2D,
    )
    swapchain_image_views.append(image_view)

print(f"Swap Chain 已创建! 图像数: {len(swapchain_images)}, 尺寸: {swapchain_image_extent}")
```

### 3.2.2 关键参数说明

| 参数 | 说明 | 推荐值 |
| `minImageCount` | 最小图像数（2=双缓冲，3=三缓冲） | 3（防止画面撕裂） |
| `imageFormat` | 像素格式 | `B8G8R8A8_SRGB` |
| `imageColorSpace` | 色彩空间 | `SRGB_NONLINEAR`（sRGB） |
| `imageExtent` | 交换链尺寸 | `surface_caps.currentModeExtent` |
| `imageUsage` | 用途 | `COLOR_ATTACHMENT` |
| `imageSharingMode` | 共享模式 | `EXCLUSIVE`（单线程） |
| `preTransform` | 预变换 | `surface_caps.currentTransform` |
| `presentMode` | 呈现模式 | `FIFO`（默认）或 `IMMEDIATE` |
| `clipped` | 裁剪 | `True`（离屏像素不计算） |

## 3.3 呈现图像 🔥

### 3.3.1 获取下一个图像

```python
# --- 获取下一个可呈现的图像 ---
image_index, surface_dirty = swapchain.acquire_next_image(
    timeout=1000000000,  # 1 秒超时（纳秒）
    semaphore=None,       # 或传入 Semaphore 同步
    fence=None,           # 或传入 Fence 同步
)

if image_index == vkbottle.INFINITY64:
    # 超时，检查是否需重建 swapchain
    print("Swap Chain 图像获取超时")
```

### 3.3.2 呈现图像

```python
# --- 将图像呈现到屏幕 ---
present_info = vkbottle.PresentInfoKHR(
    waitSemaphores=[semaphore],  # 等待渲染完成
    swapchains=[swapchain],
    imageIndices=[image_index],
)

device.get_queue().presentKHR(present_info)
```

## 3.4 Swap Chain 重建 🔥

### 3.4.1 何时需要重建

```
窗口大小变化 → Swap Chain 失效 → 必须重建
```

```python
# --- 重建 Swap Chain ---
def rebuild_swapchain(device, surface, current_swapchain):
    # 1. 查询更新后的 surface 能力
    surface_caps = device.get_surface_capabilitiesKHR(surface)
    surface_formats = device.get_surface_formatsKHR(surface)
    surface_present_modes = device.get_surface_present_modesKHR(surface)

    # 2. 创建新的 Swap Chain
    new_swapchain = device.create_swapchain_khr(...)

    # 3. 销毁旧的 Swap Chain
    current_swapchain.destroy()

    return new_swapchain

# 窗口大小变化回调中:
glfw_set_framebuffer_size_callback(window, on_window_resize)

def on_window_resize(window, width, height):
    global swapchain, swapchain_images, swapchain_image_views
    swapchain = rebuild_swapchain(device, surface, swapchain)
    swapchain_images = swapchain.get_images()
    # 重建 framebuffers...
```

## 3.5 Swap Chain 速查

| 操作 | 函数 |
| 获取图像数 | `swapchain.get_image_count()` |
| 获取图像 | `swapchain.get_images()` |
| 获取图像 View | `device.create_image_view()` |
| 获取下一帧 | `swapchain.acquire_next_image()` |
| 呈现图像 | `queue.presentKHR()` |
| 获取呈现模式 | `device.get_surface_present_modesKHR()` |
| 获取格式 | `device.get_surface_formatsKHR()` |
| 重建 | `create_swapchain_khr() + destroy()` |

---