# 第二章 · Vulkan 初始化与生命周期

## 2.1 初始化流程总览 🔥

```
Application Start
    │
    ├── 1. 创建 Instance ──── 与 Vulkan 驱动建立连接
    │       └── 指定应用信息 + 扩展
    │
    ├── 2. 枚举 Physical Devices ── 获取 GPU 列表
    │       └── 选择最适合的 GPU
    │
    ├── 3. 检查设备能力 ──── 是否支持所需特性
    │       └── 队列族、内存类型、Vulkan 版本
    │
    ├── 4. 创建 Logical Device ── 创建虚拟连接
    │       └── 指定队列 + 扩展 + 特性
    │
    ├── 5. 获取 Queue ───── 获取 Graphics Queue
    │       └── vkGetDeviceQueue()
    │
    ├── 6. 创建 Surface ──── 绑定窗口系统
    │       └── GLFW/SDL/Wayland/Xlib/Win32
    │
    └── Instance Init Complete!
```

## 2.2 Instance（实例）创建

### 2.2.1 完整创建流程

```python
import vkbottle  # Vulkan Python 绑定
import ctypes

# --- 1. 创建 Application Info ---
app_info = vkbottle.ApplicationInfo(
    pApplicationName=b"Vulkan Tutorial",    # 应用名称
    applicationVersion=vkbottle.Version(1, 0, 0),
    pEngineName=b"None",                     # 引擎名称
    engineVersion=vkbottle.Version(1, 0, 0),
    apiVersion=vkbottle.Version(1, 3, 0),   # 目标 Vulkan 版本
)

# --- 2. 创建 Instance ---
instance_create_info = vkbottle.InstanceCreateInfo(
    pApplicationInfo=app_info,
    enabledExtensionNames=[
        # 平台相关扩展（必须）
        "VK_KHR_surface",                # Surface 支持
        "VK_KHR_win32_surface",          # Windows 平台
        # 或 "VK_KHR_xlib_surface" (Linux)
        # 或 "VK_KHR_wayland_surface" (Linux/Wayland)
    ],
    enabledLayerNames=[
        # 验证层（开发阶段必须）
        "VK_LAYER_KHRONOS_validation"    # Khronos 验证层
    ]
)

instance = vkbottle.Instance.create_instance(instance_create_info)

# --- 3. 验证 ---
assert instance.handle != 0, "Instance 创建失败!"
print(f"Instance 已创建, Vulkan version: {instance.api_version}")

# --- 4. 清理（应用退出时）---
instance.destroy()
```

### 2.2.2 常用实例扩展

| 扩展 | 说明 |
| `VK_KHR_surface` | 所有平台的 Surface 基础 |
| `VK_KHR_win32_surface` | Windows 窗口绑定 |
| `VK_KHR_xlib_surface` | Linux/X11 窗口绑定 |
| `VK_KHR_xcb_surface` | Linux/XCB 窗口绑定 |
| `VK_KHR_wayland_surface` | Linux/Wayland 窗口绑定 |
| `VK_KHR_android_surface` | Android 窗口绑定 |
| `VK_EXT_debug_utils` | 调试支持 |

### 2.2.3 验证层（Validation Layers）

```python
# 验证层 = 类似"运行时断言"的检查器
# 在开发阶段**必须**启用，发布时可移除

# 推荐的验证层
validation_layers = [
    "VK_LAYER_KHRONOS_validation",  # Khronos 官方层（推荐 ✅）
]

# 验证层的常用检查:
# - 资源泄漏检测
# - API 调用错误
# - 状态一致性
# - 内存管理
# - Shader 验证
# - 同步错误

# 获取可用的验证层
available_layers = vkbottle.Instance.get_available_layers(instance, validation_layers)
print(f"可用验证层: {available_layers}")
```

## 2.3 枚举物理设备（Physical Device）

### 2.3.1 获取 GPU 列表

```python
# --- 获取所有 GPU ---
physical_devices = instance.get_physical_devices()
print(f"发现 {len(physical_devices)} 个 GPU")

for i, device in enumerate(physical_devices):
    properties = device.get_properties()
    print(f"GPU {i}: {properties.deviceName}")
    print(f"  Vulkan Version: {properties.driverVersion}")
    print(f"  API Version: {properties.apiVersion}")
    print(f"  Type: {properties.deviceType}")
```

### 2.3.2 选择最适合的 GPU

```python
def is_suitable_gpu(device):
    """判断 GPU 是否适合渲染"""
    properties = device.get_properties()
    
    # 必须是独立 GPU（非集成）
    if properties.deviceType != vkbottle.PhysicalDeviceType.DISCRETE_GPU:
        return False
    
    # 查询队列族
    queue_families = device.get_queue_families()
    
    # 必须有 Graphics Queue
    has_graphics = any(q.queueFlags & vkbottle.QueueFlag.GRAPHICS)
    
    # 必须有 Present Queue
    has_present = any(
        q.queueFlags & vkbottle.QueueFlag.GRAPHICS and 
        device.get_surface_capabilitiesKHR(surface).supportedUsageFlags
    )
    
    return has_graphics and has_present

# 选择第一个适合的 GPU
for device in physical_devices:
    if is_suitable_gpu(device):
        chosen_device = device
        break
```

### 2.3.3 设备能力查询

```python
# --- 查询设备能力 ---
properties = chosen_device.get_properties()
features = chosen_device.get_features()
mem_properties = chosen_device.get_memory_properties()
queue_families = chosen_device.get_queue_families()

# 查询 Surface 支持
surface_caps = chosen_device.get_surface_capabilitiesKHR(surface)
surface_formats = chosen_device.get_surface_formatsKHR(surface)
surface_present_modes = chosen_device.get_surface_present_modesKHR(surface)

print(f"最大纹理尺寸: {surface_caps.maxImageDimension2D}")
print(f"支持的像素格式: {surface_formats}")
print(f"内存类型数: {mem_properties.memoryTypeCount}")

for i, mem_type in enumerate(mem_properties.memoryTypes):
    print(f"  Memory Type {i}:")
    print(f"    属性: {hex(mem_type.propertyFlags)}")
    print(f"    堆索引: {mem_type.heapIndex}")
```

## 2.4 创建 Logical Device

### 2.4.1 完整创建流程

```python
# --- 1. 创建 Queue Create Info ---
queue_priority = 1.0  # Queue 优先级 (0.0 - 1.0)

# 找到 Graphics Queue Family
graphics_queue_family = None
for i, qf in enumerate(queue_families):
    if qf.queueFlags & vkbottle.QueueFlag.GRAPHICS:
        graphics_queue_family = i
        break

# 找到 Present Queue Family
present_queue_family = None
for i, qf in enumerate(queue_families):
    if device.get_surface_supportKHR(i, surface):
        present_queue_family = i
        break

# 如果 Graphics 和 Present 在同一个 Queue Family
if graphics_queue_family == present_queue_family:
    queue_create_infos = [
        vkbottle.DeviceQueueCreateInfo(
            queueFamilyIndex=graphics_queue_family,
            pQueuePriorities=[queue_priority]
        )
    ]
else:
    queue_create_infos = [
        vkbottle.DeviceQueueCreateInfo(
            queueFamilyIndex=graphics_queue_family,
            pQueuePriorities=[queue_priority]
        ),
        vkbottle.DeviceQueueCreateInfo(
            queueFamilyIndex=present_queue_family,
            pQueuePriorities=[queue_priority]
        )
    ]

# --- 2. 创建 Logical Device ---
device_create_info = vkbottle.DeviceCreateInfo(
    pQueueCreateInfos=queue_create_infos,
    enabledExtensionNames=[
        "VK_KHR_swapchain",  # Swap Chain 扩展
    ],
    enabledLayerNames=[
        "VK_LAYER_KHRONOS_validation"  # 验证层
    ],
    enabledFeatures=vkbottle.DeviceFeatures(
        # 启用特性
        samplerAnisotropy=vkbottle.Bool(1),  # 各向异性过滤
        samplerCompression=vkbottle.Bool(0),
        robustBufferAccess=vkbottle.Bool(0),
    )
)

logical_device = chosen_device.create_device(device_create_info)

# --- 3. 获取 Queue ---
graphics_queue = logical_device.get_queue(queueFamilyIndex=graphics_queue_family, queueIndex=0)

print(f"Logical Device 已创建!")
print(f"Graphics Queue: {graphics_queue}")
```

### 2.4.2 常用设备特性

| 特性 | 说明 |
| `samplerAnisotropy` | 各向异性过滤 |
| `sampleRateShading` | 采样率着色 |
| `depthBiasClamp` | 深度偏置 |
| `fillModeNonSolid` | 非实心多边形模式 |
| `wideLines` | 宽线 |
| `largePoints` | 大点 |
| `fullDrawIndexedUint32` | 32 位索引 |
| `imageCubeArray` | 立方体数组 |
| `independentBlend` | 独立混合 |
| `geometryShader` | 几何着色器 |

## 2.5 创建 Surface

### 2.5.1 GLFW 绑定

```python
import glfw

# --- 1. 初始化 GLFW ---
glfw.init()
window = glfw.create_window(800, 600, "Vulkan Window", None, None)
glfw.make_context_current(window)

# --- 2. 创建 Vulkan Surface ---
surface = vkbottle.Instance.create_surface(instance, glfw_window=window)

# --- 3. 查询 Surface 信息 ---
surface_caps = chosen_device.get_surface_capabilitiesKHR(surface)
surface_formats = chosen_device.get_surface_formatsKHR(surface)
surface_present_modes = chosen_device.get_surface_present_modesKHR(surface)

print(f"Surface 尺寸范围: {surface_caps.minImageExtent} x {surface_caps.maxImageExtent}")
print(f"支持的格式: {surface_formats}")
print(f"呈现模式: {surface_present_modes}")

# --- 4. 选择 Present Mode ---
preferred_present_mode = vkbottle.PresentModeKHR.FIFO  # VSync
for mode in surface_present_modes:
    if mode == vkbottle.PresentModeKHR.IMMEDIATE:
        preferred_present_mode = mode
        break

# --- 5. 清理 ---
glfw.destroy_window(window)
surface.destroy()
glfw.terminate()
```

### 2.5.2 不同平台 Surface 创建

| 平台 | 方式 | 说明 |
| **Windows** | `glfw_create_window()` + `glfw_create_window_surface()` | Win32 |
| **Linux/X11** | `glfw_create_window()` + `glfw_create_window_surface()` | Xlib |
| **Linux/Wayland** | `wl_display_connect()` + `wl_egl_window_create()` | Wayland |
| **Android** | `ANativeWindow_fromJava()` + `android_create_window_surface()` | NDK |
| **macOS** | MoltenVK (VK_KHR_vulkan_win32) | Metal 转换层 |

## 2.6 清理资源

```python
# --- 正确的清理顺序（与创建顺序相反）---
# 1. 销毁 Swap Chain
swap_chain.destroy()

# 2. 销毁 Framebuffers
for framebuffer in framebuffers:
    framebuffer.destroy()

# 3. 销毁 Render Pass
render_pass.destroy()

# 4. 销毁 Pipelines
for pipeline in pipelines:
    pipeline.destroy()

# 5. 销毁 Descriptors
descriptor_layout.destroy()
descriptor_set_layout.destroy()

# 6. 销毁 Shader Modules
for shader_module in shader_modules:
    shader_module.destroy()

# 7. 销毁 Images
for image in images:
    image.destroy()

# 8. 销毁 Buffers
for buffer in buffers:
    buffer.destroy()

# 9. 销毁 Memory
for memory in memory_allocations:
    memory.destroy()

# 10. 销毁 Device
logical_device.destroy()

# 11. 销毁 Surface
surface.destroy()

# 12. 销毁 Instance
instance.destroy()
```

## 2.7 初始化速查表

| 步骤 | 关键 API | 说明 |
| 1. 创建 Instance | `vkCreateInstance()` | 与驱动建立连接 |
| 2. 枚举 Devices | `vkEnumeratePhysicalDevices()` | 获取 GPU 列表 |
| 3. 选择 GPU | `vkGetPhysicalDeviceProperties()` | 查询能力 |
| 4. 创建 Device | `vkCreateDevice()` | 创建虚拟连接 |
| 5. 获取 Queue | `vkGetDeviceQueue()` | 获取执行队列 |
| 6. 创建 Surface | `glfw_create_window_surface()` | 绑定窗口 |
| 7. 创建 Swap Chain | `vkCreateSwapchainKHR()` | 帧缓冲管理 |
| 8. 创建 Render Pass | `vkCreateRenderPass()` | 定义渲染结构 |
| 9. 创建 Pipeline | `vkCreateGraphicsPipelines()` | 定义渲染状态 |
| 10. 创建 Resources | `vkCreateBuffer/ Image` | 资源创建 |

---