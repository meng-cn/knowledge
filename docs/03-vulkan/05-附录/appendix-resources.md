# 附录 D · 资源与延伸阅读

## D.1 官方资源

| 资源 | 链接 |
| Vulkan 规范 | https://www.khronos.org/vulkan/ |
| Vulkan Registry | https://github.com/KhronosGroup/Vulkan-Docs |
| Vulkan SPIR-V | https://github.com/KhronosGroup/SPIRV-Registry |
| Vulkan GitHub | https://github.com/KhronosGroup |
| Vulkan Samples | https://github.com/KhronosGroup/Vulkan-Samples |
| Vulkan-Samples (C++) | https://github.com/KhronosGroup/Vulkan-Samples |
| Vulkan-Tutorials (Python) | https://vulkan-tutorial.com |

## D.2 教程

| 名称 | 语言 | 级别 | 说明 |
| **vulkan-tutorial.com** | C++ | 入门 | 最佳入门教程 ✅ |
| **vulkan-tutorial.com (Python)** | Python | 入门 | Vulkan.py 绑定 |
| **learnvulkan.com** | C++ | 入门 | 交互式教程 |
| **saschawillems.de** | C++ | 中级 | 渲染示例 |
| **antontarasenkov.com** | C++ | 中级 | 图形渲染 |
| **github.com/overdev** | C++ | 入门 | Vulkan 教程合集 |
| **github.com/zeux/cloth** | C++ | 高级 | 物理模拟 |

## D.3 书籍

| 书名 | 作者 | 评价 |
| **Vulkan Programming Guide** | Graham Sellers | 权威参考 ✅ |
| **Vulkan Guide** | Werner A. | 入门友好 |
| **Real-Time Rendering 4th** | Tomas Akenine-Moller | 实时渲染圣经 |
| **GPU Gems** | NVIDIA | GPU 编程 |
| **Physically Based Rendering** | Matt Pharr | 渲染理论 |
| **Vulkan Shading Cookbook** | Jonathan Blow | 着色器 |
| **Learning Vulkan** | John E. Stone | 入门推荐 ✅ |
| **Vulkan Insights** | John E. Stone | 中级 |

## D.4 示例项目

| 项目 | 说明 |
| **Vulkan-Samples** | Khronos 官方示例 ✅ |
| **Vulkan-Hpp** | C++ 头文件包装器 |
| **Vulkan-Python** | Python 绑定 (Vulkan.py) |
| **Vulkan-Cplusplus** | C++ 包装 |
| **SaschaWillems/Vulkan** | 渲染示例合集 ✅ |
| **Volk** | 动态加载 Vulkan API |
| **VMA** | Vulkan Memory Allocator ✅ |
| **GLM** | 图形数学库 |
| **stb_image.h** | 图像加载 |
| **stb_truetype.h** | 字体渲染 |
| **glfw** | 窗口管理 |
| **SDL2** | 多媒体/窗口管理 |
| **glslc** | GLSL 编译器 |
| **spirv-cross** | SPIR-V 反编译 |
| **RenderDoc** | GPU 调试 ✅ |
| **Vulkan Profiler** | 性能分析 |
| **Vulkan Inspector** | 性能分析 |

## D.5 工具链

| 工具 | 用途 |
| **glslc** | GLSL → SPIR-V |
| **spirv-val** | SPIR-V 验证 |
| **spirv-cross** | SPIR-V → 其他着色器 |
| **spirv-opt** | SPIR-V 优化 |
| **RenderDoc** | GPU 调试 ✅ |
| **Vulkan Profiler** | GPU 性能分析 |
| **Vulkan Inspector** | GPU 检查器 |
| **SPIRV-Tools** | SPIR-V 工具集 |
| **glslangValidator** | GLSL 编译器 |
| **Vulkan SDK** | 完整 Vulkan 开发包 |
| **VMA (Vulkan Memory Allocator)** | Vulkan 内存管理 ✅ |
| **Volko (Dynamic Loading)** | Vulkan API 动态加载 |

## D.6 社区

| 社区 | 说明 |
| **Khronos Vulkan WG** | Vulkan 工作组 |
| **Reddit r/vulkan** | Vulkan 社区 |
| **Vulkan 论坛** | Vulkan 官方论坛 |
| **Vulkan Discord** | Vulkan Discord |
| **Stack Overflow** | 问题解答 |
| **GitHub Vulkan** | Vulkan 源码 |
| **Vulkan-Architecture** | Vulkan 架构讨论 |

## D.7 推荐学习路径

```
阶段 1: 入门 (1-3 月)
  → Vulkan-Tutorial.com 前 5 章
  → 理解 Vulkan 架构
  → 渲染第一个三角形
  → 理解 Render Pass + Pipeline

阶段 2: 中级 (3-6 月)
  → Vulkan-Samples (C++)
  → 纹理加载 + 着色器
  → 资源管理
  → 多个物体渲染

阶段 3: 高级 (6-12 月)
  → SaschaWillems/Vulkan
  → 光照 + 阴影
  → 后处理 + 多 Pass
  → 实例化渲染
  → 异步计算

阶段 4: 专家 (12+ 月)
  → Vulkan-Samples 源码
  → 光线追踪
  → 自定义渲染器
  → 性能优化
  → 内存管理
```

## D.8 资源速查

| 类型 | 推荐 |
| **最佳入门教程** | vulkan-tutorial.com ✅ |
| **最佳示例** | Vulkan-Samples ✅ |
| **最佳书籍** | Vulkan Programming Guide ✅ |
| **最佳调试** | RenderDoc ✅ |
| **最佳内存管理** | VMA ✅ |
| **最佳数学库** | GLM ✅ |
| **最佳图形渲染** | Real-Time Rendering 4th ✅ |
| **最佳物理渲染** | Physically Based Rendering ✅ |
| **最佳着色器** | SaschaWillems/Vulkan ✅ |
| **最佳性能分析** | Vulkan Profiler ✅ |

---

## 附录总览

| 附录 | 内容 |
| **A. API 速查** | 10 个类别的 Vulkan 函数速查 |
| **B. 枚举对照** | 10+ 个枚举类别的对照表 |
| **C. SDK 安装** | Windows/Linux/macOS/Android/MoltenVK |
| **D. 资源延伸** | 教程/书籍/示例/工具/社区/学习路径 |

---

> 附录全部完成 ✅
> Vulkan 文档总计 44 章全部完成！