# Vulkan 学习/使用参考文档

> 🐱 面向开发者的 Vulkan 实战速查手册
> **Vulkan 1.3+** | **Python (vkbottle)** + C++
> 最后更新:2026-04-20
> 总计:**30 章正文 + 4 附录 = 34 文件**

---

## 📁 目录结构

```
01-Vulkan 核心概念/              ← Part I · 6 章
├── ch01-architecture.md         第一章  架构与核心概念
├── ch02-initialization.md       第二章  初始化与生命周期
├── ch03-swap-chain.md           第三章  交换链
├── ch04-render-pipeline.md      第四章  渲染管线
├── ch05-resources.md            第五章  资源管理 (Buffers & Images)
└── ch06-commands-sync.md        第六章  命令缓冲与同步
02-中级 Vulkan/                  ← Part II · 9 章
├── ch07-descriptors.md          第七章  描述符
├── ch08-depth-template.md       第八章  深度测试与模板测试
├── ch09-samplers-textures.md    第九章  采样器与纹理过滤
├── ch10-draw-calls.md           第十章  顶点与索引绘制
├── ch11-vertex-shader.md        第十一章 顶点着色器 (GLSL)
├── ch12-fragment-shader.md      第十二章 片元着色器 (GLSL)
├── ch13-pipeline-state.md       第十三章 管线状态管理
├── ch14-framebuffer.md          第十四章 帧缓冲
└── ch15-multisampling.md        第十五章 多重采样 (MSAA)
03-高级 Vulkan/                  ← Part III · 9 章
├── ch16-render-targets.md       第十六章 渲染目标与后处理
├── ch17-instancing.md           第十七章 实例化渲染
├── ch19-dynamic-state.md        第十八章 动态状态
├── ch20-render-splitting.md     第十九章 渲染分割
├── ch21-shadow-mapping.md       第二十章 阴影映射
├── ch22-lighting.md             第二十二章 光照模型 (Phong / PBR)
├── ch23-skybox.md               第二十三章 天空盒
├── ch24-lighting.md             第二十四章 光照计算 (Phong)
└── ch25-image-formats.md        第二十五章 图像格式与子资源
04-Vulkan 实战/                  ← Part IV · 5 章
├── ch26-memory-advanced.md      第二十六章 内存管理进阶
├── ch27-events-markers.md       第二十七章 事件与标记
├── ch28-render-graph.md         第二十八章 渲染图
├── ch29-async-compute.md        第二十九章 异步计算
└── ch30-compute-shader.md       第三十章 计算着色器
05-附录/                         ← Part V · 4 章
├── appendix-api.md              API 速查表
├── appendix-enums.md            枚举值对照
├── appendix-install.md           Vulkan SDK 安装
└── appendix-resources.md         资源与延伸阅读
```

---

## 📑 章节导航

### Part I · Vulkan 核心概念

| # | 章节 | 说明 |
|--|--|--|
| 1 | [ch01-architecture.md](./01-Vulkan 核心概念/ch01-architecture.md) | 架构与核心概念 |
| 2 | [ch02-initialization.md](./01-Vulkan 核心概念/ch02-initialization.md) | 初始化与生命周期 |
| 3 | [ch03-swap-chain.md](./01-Vulkan 核心概念/ch03-swap-chain.md) | 交换链 |
| 4 | [ch04-render-pipeline.md](./01-Vulkan 核心概念/ch04-render-pipeline.md) | 渲染管线 |
| 5 | [ch05-resources.md](./01-Vulkan 核心概念/ch05-resources.md) | 资源管理 (Buffers & Images) |
| 6 | [ch06-commands-sync.md](./01-Vulkan 核心概念/ch06-commands-sync.md) | 命令缓冲与同步 |

### Part II · 中级 Vulkan

| # | 章节 | 说明 |
|--|--|--|
| 1 | [ch07-descriptors.md](./02-中级 Vulkan/ch07-descriptors.md) | 描述符 |
| 2 | [ch08-depth-template.md](./02-中级 Vulkan/ch08-depth-template.md) | 深度测试与模板测试 |
| 3 | [ch09-samplers-textures.md](./02-中级 Vulkan/ch09-samplers-textures.md) | 采样器与纹理过滤 |
| 4 | [ch10-draw-calls.md](./02-中级 Vulkan/ch10-draw-calls.md) | 顶点与索引绘制 |
| 5 | [ch11-vertex-shader.md](./02-中级 Vulkan/ch11-vertex-shader.md) | 顶点着色器 (GLSL) |
| 6 | [ch12-fragment-shader.md](./02-中级 Vulkan/ch12-fragment-shader.md) | 片元着色器 (GLSL) |
| 7 | [ch13-pipeline-state.md](./02-中级 Vulkan/ch13-pipeline-state.md) | 管线状态管理 |
| 8 | [ch14-framebuffer.md](./02-中级 Vulkan/ch14-framebuffer.md) | 帧缓冲 |
| 9 | [ch15-multisampling.md](./02-中级 Vulkan/ch15-multisampling.md) | 多重采样 (MSAA) |

### Part III · 高级 Vulkan

| # | 章节 | 说明 |
|--|--|--|
| 1 | [ch16-render-targets.md](./03-高级 Vulkan/ch16-render-targets.md) | 渲染目标与后处理 |
| 2 | [ch17-instancing.md](./03-高级 Vulkan/ch17-instancing.md) | 实例化渲染 |
| 3 | [ch19-dynamic-state.md](./03-高级 Vulkan/ch19-dynamic-state.md) | 动态状态 |
| 4 | [ch20-render-splitting.md](./03-高级 Vulkan/ch20-render-splitting.md) | 渲染分割 |
| 5 | [ch21-shadow-mapping.md](./03-高级 Vulkan/ch21-shadow-mapping.md) | 阴影映射 |
| 6 | [ch22-lighting.md](./03-高级 Vulkan/ch22-lighting.md) | 光照模型 (Phong / PBR) |
| 7 | [ch23-skybox.md](./03-高级 Vulkan/ch23-skybox.md) | 天空盒 |
| 8 | [ch24-lighting.md](./03-高级 Vulkan/ch24-lighting.md) | 光照计算 (Phong) |
| 9 | [ch25-image-formats.md](./03-高级 Vulkan/ch25-image-formats.md) | 图像格式与子资源 |

### Part IV · Vulkan 实战

| # | 章节 | 说明 |
|--|--|--|
| 1 | [ch26-memory-advanced.md](./04-Vulkan 实战/ch26-memory-advanced.md) | 内存管理进阶 |
| 2 | [ch27-events-markers.md](./04-Vulkan 实战/ch27-events-markers.md) | 事件与标记 |
| 3 | [ch28-render-graph.md](./04-Vulkan 实战/ch28-render-graph.md) | 渲染图 |
| 4 | [ch29-async-compute.md](./04-Vulkan 实战/ch29-async-compute.md) | 异步计算 |
| 5 | [ch30-compute-shader.md](./04-Vulkan 实战/ch30-compute-shader.md) | 计算着色器 |

> 💡 注：ch24 为第二章光照计算补充，详见 [ch24-lighting.md](./03-高级 Vulkan/ch24-lighting.md)。

### Part V · 附录

| # | 文件 | 说明 |
|--|--|--|
| 1 | [appendix-api.md](./05-附录/appendix-api.md) | API 速查表 |
| 2 | [appendix-enums.md](./05-附录/appendix-enums.md) | 枚举值对照 |
| 3 | [appendix-install.md](./05-附录/appendix-install.md) | Vulkan SDK 安装 |
| 4 | [appendix-resources.md](./05-附录/appendix-resources.md) | 资源与延伸阅读 |

---

## 🗺️ 学习路线

```
入门 (Part I)          中级 (Part II)           高级 (Part III)          实战 (Part IV)
───────────────   ────────────────   ────────────────   ────────────────
架构 → 初始化 → 交换链 → 渲染管线 → 资源管理 → 命令同步
    │                        │                        │              │
    ▼                        ▼                        ▼              ▼
理解 Vulkan 核心         描述符/纹理/着色器         阴影/光照/天空    内存/异步/计算
基础概念                 管线搭建                   盒               等高级主题
```

**推荐学习顺序:**

1. **Part I** - 先掌握 Vulkan 核心概念(初始化→交换链→渲染管线→资源管理→同步)
2. **Part II** - 搭建完整的渲染管线(描述符→着色器→管线状态→帧缓冲→绘制)
3. **Part III** - 进阶图形技术(MSAA→实例化→动态状态→渲染分割→阴影→光照→天空盒→图像格式)
4. **Part IV** - 实战技术(内存管理→渲染图→异步计算→计算着色器)

---

## 📖 章节亮点

| 章节 | 亮点 |
|--|--|
| ch01 | Vulkan 架构总览、驱动层模型、Core Profile |
| ch02 | Instance 创建全流程、物理设备枚举、验证层配置 |
| ch03 | 交换链创建、图像布局转换、Present 机制 |
| ch04 | Render Pass/Attachment/Subpass 完整创建 |
| ch05 | Buffer vs Image、内存分配策略(DEVICE_LOCAL / HOST_VISIBLE) |
| ch06 | 命令缓冲记录、事件同步、Semaphore/Fence |
| ch07 | Descriptor Set Layout 与写入、更新布局 |
| ch08 | 深度缓冲创建、比较函数、模板测试 |
| ch09 | 采样器类型、Mipmap、各向异性过滤 |
| ch10 | 顶点缓冲/索引缓冲、顶点属性绑定 |
| ch11 | GLSL 顶点着色器结构、Uniform / SSBO |
| ch12 | GLSL 片元着色器、Phong 光照模型 |
| ch13 | Pipeline Layout、Push Constants、管线创建 |
| ch14 | Framebuffer 创建与附件绑定 |
| ch15 | MSAA 多重采样、Resolve Attachment |
| ch16 | 渲染目标纹理、后处理流程、Render Pass 链 |
| ch17 | 实例化渲染(Instanced DrawCall) |
| ch19 (十八) | [03-高级 Vulkan/ch19-dynamic-state.md](./03-高级 Vulkan/ch19-dynamic-state.md) | 动态状态(Viewport/Scissor/LineWidth...) |
| ch20 (十九) | [03-高级 Vulkan/ch20-render-splitting.md](./03-高级 Vulkan/ch20-render-splitting.md) | 前向渲染 / 延迟渲染 / Clustered 渲染对比 |
| ch21 (二十) | [03-高级 Vulkan/ch21-shadow-mapping.md](./03-高级 Vulkan/ch21-shadow-mapping.md) | Shadow Camera 设置、Shadow Map 生成与采样 |
| ch22 (二十二) | [03-高级 Vulkan/ch22-lighting.md](./03-高级 Vulkan/ch22-lighting.md) | Phong / PBR 光照模型、多光源处理 |
| ch23 | [03-高级 Vulkan/ch23-skybox.md](./03-高级 Vulkan/ch23-skybox.md) | 立方体贴图创建、Skybox 渲染 |
| ch25 | [03-高级 Vulkan/ch25-image-formats.md](./03-高级 Vulkan/ch25-image-formats.md) | 图像格式速查表(颜色/深度/压缩格式) |
| ch26 | 内存堆/类型查询、内存分配策略详解 |
| ch27 | GPU 事件同步、调试标记 |
| ch28 | Render Graph 架构、资源生命周期管理 |
| ch29 | 多队列设备、图形/计算队列异步执行 |
| ch30 | Compute Shader 基础、SSBO 交互、Dispatch |

---

## 🔧 技术栈

| 技术 | 说明 |
|--|--|
| **Vulkan** | Khronos Group 低级 GPU API (1.3+) |
| **vkbottle** | Vulkan Python 绑定库 |
| **GLSL** | Shader 着色语言 |
| **NumPy** | 顶点/索引数据数组 |
| **GLFW/SDL** | 窗口管理(示例) |

---

## 📝 文档约定

- 🔥 = 重点章节(建议精读)
- 代码示例主要使用 **Python (vkbottle)**,部分涉及 C++
- 章节编号按**内容顺序**排列,文件名可能跳过部分编号
- 每个章节包含:概念图 + 代码示例 + 最佳实践

---

## 🔗 相关资源

详见 [附录 D](./appendix-resources.md):

- **官方规范**: <https://www.khronos.org/vulkan/>
- **Vulkan Samples**: <https://github.com/KhronosGroup/Vulkan-Samples>
- **入门教程**: <https://vulkan-tutorial.com>
- **Vulkan Registry**: <https://github.com/KhronosGroup/Vulkan-Docs>

---

> ⚠️ 本文档为学习参考笔记,部分实现细节可能因 Vulkan 版本或驱动差异而异。
