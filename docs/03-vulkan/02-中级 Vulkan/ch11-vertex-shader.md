# 第十一章 · 顶点着色器 (GLSL)

## 11.1 GLSL 基础

```glsl
#version 450

// 入口点
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aColor;

// Uniform 缓冲区
layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
} ubo;

// 输出到片元着色器
out vec3 vColor;

void main() {
    gl_Position = ubo.proj * ubo.view * ubo.model * vec4(aPos, 1.0);
    vColor = aColor;
}
```

## 11.2 顶点着色器管线

```
输入 (Input) → 处理 → 输出 (Output)
    ↓              ↓          ↓
aPos, aColor   mat4 计算   vColor, gl_Position
```

## 11.3 Uniform 缓冲区对象（UBO）

```glsl
// Shader 中的 UBO 定义
layout(binding = 0) uniform UniformBufferObject {
    mat4 model;      // 4x4 = 64 bytes
    mat4 view;       // 4x4 = 64 bytes
    mat4 proj;       // 4x4 = 64 bytes
} ubo;

// 注意: mat4 必须按 256-byte 对齐
// struct padding 很重要!

// 正确的对齐写法:
struct UniformBufferObject {
    mat4 model;      // offset 0, size 64 (实际占 256)
    mat4 view;       // offset 256
    mat4 proj;       // offset 512
    // padding: 192 bytes
};                   // total: 768 bytes (必须是 256 的倍数)
```

### 11.3.1 对齐规则

| 类型 | 对齐 | 大小 |
| `float` / `int` | 4 | 4 bytes |
| `vec2` | 8 | 8 bytes |
| `vec3` | 16 | 16 bytes |
| `vec4` | 16 | 16 bytes |
| `mat2` | 16 | 32 bytes (column-major) |
| `mat3` | 16 | 64 bytes |
| `mat4` | 256 | 256 bytes (column-major) |

## 11.4 顶点属性 (Layout)

```glsl
// 输入属性
layout(location = 0) in vec3 aPos;     // 位置 (3 floats)
layout(location = 1) in vec3 aColor;   // 颜色 (3 floats)
layout(location = 2) in vec2 aTexCoord; // UV 坐标 (2 floats)

// 输出到片元
out vec3 vColor;
out vec2 vTexCoord;
out vec4 vPosition;
```

## 11.5 矩阵计算

```glsl
// 列主序矩阵乘法: gl_Position = proj × view × model × position
gl_Position = proj * view * model * vec4(aPos, 1.0);

// 如果只需要旋转+平移（无缩放）
mat4 transform = mat4(aMat3, 0.0) + vec4(aTranslation, 0.0);
gl_Position = proj * view * transform * vec4(aPos, 1.0);
```

## 11.6 内置变量

| 变量 | 说明 |
| `gl_Position` | 裁剪空间位置（输出） |
| `gl_PointSize` | 点大小（gl.POINT_LIST） |
| `gl_ClipDistance` | 自定义裁剪 |
| `gl_PrimitiveID` | 图元 ID（内置输入） |
| `gl_InstanceID` | 实例 ID（内置输入） |
| `gl_VertexID` | 顶点 ID（内置输入） |

---

| 7-10 | ✅ |
| **11. 顶点着色器** | ✅ |
| 12-15 | 🔲 |
| 16-25 | 🔲 |
| 26-35 | 🔲 |
| 36-40 | 🔲 |
| A-D 附录 | 🔲 |