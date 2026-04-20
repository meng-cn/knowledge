# 第二十四章 · 光照计算 (Lighting)

## 24.1 光照模型概述

```
常见光照模型:
  Ambient（环境光）     → 基础照明
  Diffuse（漫反射）    → 表面漫射光
  Specular（镜面反射） → 高光
  Emission（自发光）   → 发光体
  Fresnel（菲涅尔）    → 角度相关的反射率
  PBR（物理渲染）      → 现代光照模型
```

## 24.2 Phong 光照模型

```glsl
// Phong 光照
vec3 ambient = ambientStrength * lightColor;
vec3 norm = normalize(vNormal);
vec3 lightDir = normalize(lightPos - vPos);
float diff = max(dot(norm, lightDir), 0.0);
vec3 diffuse = diff * lightColor;
vec3 viewDir = normalize(viewPos - vPos);
vec3 halfDir = normalize(lightDir + viewDir);
float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
vec3 specular = spec * lightColor;
fragColor = vec4((ambient + diffuse + specular) * albedo, 1.0);
```

## 24.3 PBR (物理渲染)

```glsl
// PBR: Cook-Torrance BRDF
// albedo: 基础颜色 (0-1)
// roughness: 粗糙度 (0=镜面, 1=粗糙)
// metalness: 金属度 (0=非金属, 1=金属)

// 菲涅尔-Schlick 近似
float fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// GGX 法线分布
float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    return a2 / (3.14159 * pow(NdotH2 * (a2 - 1.0) + 1.0, 2));
}

// Smith-Schlick 几何函数
float geometrySchlick(float NdotV, float roughness) {
    float r = roughness + 1.0;
    return NdotV / (NdotV * (1.0 - r*r/8.0) + r*r/8.0);
}
```

## 24.4 光照类型速查

| 光源 | 属性 | Shader 参数 |
| **定向光** | 方向 | `uniform vec3 direction` (无衰减) |
| **点光源** | 位置 | `uniform vec3 position` + 衰减 |
| **聚光灯** | 位置+方向+角度 | `uniform vec3 position, direction` |

---

| 16-22 | ✅ |
| **23-24** | ✅ |