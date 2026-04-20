# 第二十二章 · 光照计算 (Lighting)

## 22.1 光照模型概述

```
常见光照模型:
────────────────
1. Ambient（环境光）      → 基础照明
2. Diffuse（漫反射）      → 表面漫射光
3. Specular（镜面反射）   → 高光
4. Emission（自发光）     → 发光体
5. Fresnel（菲涅尔）      → 角度相关的反射率
6. PBR（物理渲染）        → 现代光照模型
```

## 22.2 Phong 光照模型

```glsl
#version 450

in vec3 vPos;       // 世界空间位置
in vec3 vNormal;    // 世界空间法线
in vec3 vColor;     // 物体颜色

uniform vec3 lightPos;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform vec3 viewPos;

out vec4 fragColor;

void main() {
    // 环境光
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor;
    
    // 漫反射
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightIntensity * lightColor;
    
    // 镜面反射 (Blinn-Phong)
    vec3 viewDir = normalize(viewPos - vPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(norm, halfDir), 0.0), 32.0);  // shininess=32
    vec3 specular = spec * lightIntensity * lightColor;
    
    // 组合
    vec3 result = ambient + diffuse + specular;
    fragColor = vec4(result, 1.0);
}
```

## 22.3 点光源 (Point Light)

```glsl
// 点光源衰减
uniform vec3 pointLightPos;
uniform float pointLightConstant;  // 常数衰减
uniform float pointLightLinear;    // 线性衰减
uniform float pointLightQuadratic; // 二次衰减

vec3 getPointLight(int index) {
    vec3 lightDir = normalize(pointLightPos[index] - vPos);
    
    // 衰减
    float distance = length(pointLightPos[index] - vPos);
    float attenuation = 1.0 / (pointLightConstant + 
                               pointLightLinear * distance + 
                               pointLightQuadratic * distance * distance);
    
    return attenuation * lightColor[index];
}
```

## 22.4 PBR (Physically Based Rendering)

```glsl
#version 450

// PBR 基础: 微表面模型
// 反射 = f(入射光, 表面微观结构, 观察角度)

uniform vec3 albedo;        // 反照率（基础颜色）
uniform float roughness;    // 粗糙度 (0=镜面, 1=粗糙)
uniform float metalness;    // 金属度 (0=非金属, 1=金属)

// 菲涅尔-Schlick 近似
float fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// 法线分布函数 (GGX)
float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159 * denom * denom;
    
    return a2 / denom;
}

// 几何函数 (Smith-Schlick-GGX)
float geometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

// 几何函数 (Smith-Schlick)
float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    return geometrySchlickGGX(NdotV, roughness) * 
           geometrySchlickGGX(NdotL, roughness);
}

// Cook-Torrance BRDF
vec3 cookTorrance(vec3 N, vec3 V, vec3 L, vec3 H, 
                  vec3 F0, float roughness) {
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);
    float F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 kS = F;
    vec3 kD = (1.0 - kS) * (1.0 - metalness);
    
    float numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    
    return (kD * albedo / 3.14159 + numerator / denominator) * kS;
}
```

## 22.5 环境光照 (Environment Lighting)

```glsl
// 环境光照（来自天空盒/环境贴图）
uniform samplerCube environmentMap;

vec3 getEnvironmentLighting(vec3 N) {
    // 简单环境光
    vec3 Hemi = mix(
        texture(environmentMap, vec3(0.0, 1.0, 0.0)).rgb,  // 天
        texture(environmentMap, vec3(0.0, -1.0, 0.0)).rgb,  // 地
        max(dot(N, vec3(0.0, 1.0, 0.0)), 0.0)
    );
    
    return Hemi * ambientStrength;
}

// 更高级：IBL (Image-Based Lighting)
// 需要：环境贴图 + 预计算 BRDF LUT + 预过滤环境贴图
```

## 22.6 光源类型速查

| 光源 | 属性 | Shader 参数 | 衰减公式 |
| - | - | - | - |
| **定向光** | 方向 | `uniform vec3 direction` | 无衰减 ✅ |
| **点光源** | 位置 | `uniform vec3 position` | 1/(a+b·d+c·d²) |
| **聚光灯** | 位置+方向+角度 | `uniform vec3 position, direction` | 圆锥角 + 衰减 |

### 22.6.1 聚光灯 (Spot Light)

```glsl
uniform vec3 spotLightPos;
uniform vec3 spotLightDir;
uniform float spotInnerAngle;  // 内角度
uniform float spotOuterAngle;  // 外角度

vec3 getSpotLight() {
    vec3 lightDir = normalize(spotLightPos - vPos);
    float theta = dot(lightDir, normalize(-spotLightDir));
    float epsilon = spotInnerAngle - spotOuterAngle;
    float intensity = clamp((theta - spotOuterAngle) / epsilon, 0.0, 1.0);
    
    // 衰减
    float distance = length(spotLightPos - vPos);
    float attenuation = intensity / (1.0 + 0.01 * distance + 0.001 * distance * distance);
    
    return intensity * lightColor * attenuation;
}
```

---
