# 第十二章 · 片元着色器 (GLSL)

## 12.1 片元着色器基础

```glsl
#version 450

// 输入（来自顶点着色器）
in vec3 vColor;
in vec2 vTexCoord;

// 输出
out vec4 fragColor;

// 采样器
layout(binding = 2) uniform sampler2D texSampler;

void main() {
    fragColor = texture(texSampler, vTexCoord) * vec4(vColor, 1.0);
}
```

## 12.2 常见光照模型

### 12.2.1 Phong 光照

```glsl
#version 450

in vec3 vPos;        // 世界空间位置
in vec3 vNormal;     // 世界空间法线
in vec2 vTexCoord;

layout(binding = 1) uniform UniformBufferObject {
    vec3 lightPos;
    float lightIntensity;
    vec3 lightColor;
} ubo;

out vec4 fragColor;

void main() {
    // 漫反射
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(ubo.lightPos - vPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * ubo.lightColor * ubo.lightIntensity;
    
    // 镜面反射 (Blinn-Phong)
    vec3 viewDir = normalize(-vPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(norm, halfDir), 0.0), 32.0);
    vec3 specular = spec * ubo.lightColor * ubo.lightIntensity;
    
    // 环境光
    vec3 ambient = vec3(0.1) * vec3(1.0);
    
    fragColor = vec4(ambient + diffuse + specular, 1.0);
}
```

### 12.2.2 PBR 基础

```glsl
#version 450

in vec3 vPos;
in vec3 vNormal;
in vec2 vTexCoord;

layout(binding = 1) uniform UniformBufferObject {
    vec3 albedo;
    float roughness;
    float metalness;
} ubr;

out vec4 fragColor;

void main() {
    vec3 albedo = ubr.albedo;
    float roughness = ubr.roughness;
    float metalness = ubr.metalness;
    
    // 简化 PBR
    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(-vPos);
    
    // 菲涅尔
    float fresnel = pow(1.0 - max(dot(viewDir, norm), 0.0), 3.0);
    
    // 漫反射 + 镜面反射混合
    vec3 diffuse = albedo * (1.0 - metalness) * (1.0 - fresnel);
    vec3 specular = vec3(mix(0.04, albedo, metalness)) * fresnel;
    
    vec3 result = (diffuse + specular) * 0.8 + vec3(0.1); // 环境光
    fragColor = vec4(result, 1.0);
}
```

## 12.3 纹理采样

```glsl
# 常用采样函数
vec4 tex = texture(sampler, uv);           // 线性采样
vec4 texLOD = textureLod(sampler, uv, lod);  // 指定 LOD
vec4 texGrad = textureGrad(sampler, uv, dPdx, dPdy); // 手动 LOD
float depthTex = texture(texSampler, uv).r;  // 深度纹理
```

## 12.4 输出合并

| 操作 | 函数 |
| `mix(a, b, t)` | 线性插值 |
| `smoothstep(edge0, edge1, x)` | 平滑边界 |
| `clamp(x, min, max)` | 范围限制 |
| `length(v)` | 向量长度 |
| `normalize(v)` | 归一化 |

## 12.5 Shader 编译

```python
# GLSL → SPIR-V 编译（使用 glslc 或 glslangValidator）
# glslc vertex.glsl -o vertex.spv
# glslc fragment.glsl -o fragment.spv

# 在代码中加载
def load_shader(device, path):
    with open(path, 'rb') as f:
        spv = f.read()
    return device.create_shader_module(
        vkbottle.ShaderModuleCreateInfo(pCode=spv)
    )
```

---

| 7-11 | ✅ |
| **12. 片元着色器** | ✅ |
| 13-15 | 🔲 |
| 16-25 | 🔲 |
| 26-35 | 🔲 |
| 36-40 | 🔲 |
| A-D 附录 | 🔲 |