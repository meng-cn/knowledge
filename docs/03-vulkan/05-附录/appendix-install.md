# 附录 C · Vulkan SDK 安装

## C.1 从 Khronos 官网下载

```bash
# 1. 访问 https://vulkan.lunarg.com/
# 2. 下载对应平台的 SDK
# 3. 解压安装

# Linux (Ubuntu/Debian):
wget https://github.com/KhronosGroup/Vulkan-Headers/releases/download/v1.3.268/vulkan-sdk-1.3.268.0-x86_64.tar.gz
tar -xzf vulkan-sdk-1.3.268.0-x86_64.tar.gz

# 设置环境变量
export VULKAN_SDK=/path/to/vulkan/sdk
export PATH=$VULKAN_SDK/bin:$PATH
export LD_LIBRARY_PATH=$VULKAN_SDK/lib:$LD_LIBRARY_PATH

# Windows:
# 1. 下载 vulkansdk-windows-x86_64-xxx.exe
# 2. 运行安装
# 3. 安装路径: C:\VulkanSDK\x.x.x.x\

# macOS:
wget https://github.com/KhronosGroup/Vulkan-Headers/releases/download/v1.3.268/vulkan-sdk-1.3.268.0-x86_64.tar.gz
tar -xzf vulkan-sdk-1.3.268.0-x86_64.tar.gz

# 验证安装:
vulkaninfo --summary
```

## C.2 Vulkan SDK 包含的内容

```
Vulkan SDK/
├── bin/              # 工具 (glslc, glslcValidator, etc.)
├── lib/              # 库文件
├── include/          # 头文件
├── shaders/          # 示例着色器
├── extras/           # 额外文件
│   ├── validate/     # 验证层
│   └── layers/       # 验证层
└── docs/             # 文档
```

## C.3 验证层安装

```bash
# 验证层是开发阶段必须的
# Linux: 通常随 SDK 安装
sudo apt install vulkan-validationlayers

# Windows: 验证层随 SDK 自动安装
# macOS: 使用 MoltenVK 验证层

# 验证层列表:
# VK_LAYER_KHRONOS_validation - Khronos 官方验证层
# VK_LAYER_LUNARG_api_dump - API 调用转储
# VK_LAYER_LUNARG_image - 图像验证
# VK_LAYER_LUNARG_monitor - 性能监控
# VK_LAYER_LUNARG_overlay - 覆盖层
# VK_LAYER_LUNARG_standard_validation - 标准验证
```

## C.4 glslc (GLSL 编译器)

```bash
# glslc 将 GLSL 编译为 SPIR-V
glslc vertex.glsl -o vertex.spv
glslc fragment.glsl -o fragment.spv

# 可选参数
glslc -O vertex.glsl -o vertex.spv  # 优化
glslc -g vertex.glsl -o vertex.spv  # 调试信息
glslc -Wa vertex.glsl -o vertex.spv -f  # 输出汇编

# 验证 SPIR-V
spirv-val vertex.spv  # SPIRV-Validator
```

## C.5 glslangValidator (替代 glslc)

```bash
# 如果系统没有 glslc，可以用 glslangValidator
glslangValidator -V vertex.glsl -o vertex.spv
```

## C.6 Vulkan 头文件 (CMake)

```cmake
# CMake 集成
find_package(Vulkan REQUIRED)
target_link_libraries(my_app PRIVATE Vulkan::Vulkan)
```

## C.7 Vulkan 头文件 (CMake FetchContent)

```cmake
# FetchContent 方式
include(FetchContent)
FetchContent_Declare(
    Vulkan-Headers
    GIT_REPOSITORY https://github.com/KhronosGroup/Vulkan-Headers.git
    GIT_TAG v1.3.268
)
FetchContent_MakeAvailable(Vulkan-Headers)
```

## C.8 Android Vulkan SDK

```bash
# Android NDK 自带 Vulkan
# 在 CMakeLists.txt 中添加:
find_library(vulkan-lib vulkan)
target_link_libraries(my_app PRIVATE ${vulkan-lib})

# 或使用 NDK Vulkan API
#include <vulkan/vulkan.h>
#include <android/native_window.h>

# 创建 Surface:
ANativeWindow* window = ANativeWindow_fromWindow(env, window_obj);
vulkan_window = vkCreateAndroidSurfaceKHR(instance, &surfaceCreateInfo, nullptr, &surface);
```

## C.9 MoltenVK (macOS/iOS)

```bash
# MoltenVK: macOS 上的 Vulkan 实现（Metal 后端）
brew install molten-vk

# 或从 GitHub 下载:
# https://github.com/KhronosGroup/MoltenVK

# 设置环境变量:
export VK_ICD_FILENAMES=/path/to/MoltenVK/vulkan/icd.d/MoltenVK_icd.json
```

## C.10 Vulkan 验证层速查

| 验证层 | 功能 |
| - | - |
| `VK_LAYER_KHRONOS_validation` | 通用验证（推荐）✅ |
| `VK_LAYER_LUNARG_api_dump` | API 转储 |
| `VK_LAYER_LUNARG_image` | 图像验证 |
| `VK_LAYER_LUNARG_monitor` | 性能监控 |
| `VK_LAYER_LUNARG_overlay` | 覆盖层（FPS 等）|
| `VK_LAYER_LUNARG_standard_validation` | 标准验证 |

## C.11 Vulkan SDK 安装速查

| 平台 | 安装方式 |
| - | - |
| **Windows** | vulkansdk-windows.exe |
| **Linux** | vulkan-sdk-x86_64.tar.gz |
| **macOS** | brew install molten-vk |
| **iOS** | MoltenVK |
| **Android** | NDK 自带 Vulkan |

---
