# 10_Engineering/03 - HAR / HSP / HAP 包

## 1. 三种包类型概述

HarmonyOS 中有三种模块化包类型，它们解决了不同粒度的代码共享需求。

| 特性 | HAR (Static Shared) | HSP (Dynamic Shared) | HAP (App Package) |
|------|---------------------|---------------------|-------------------|
| **全称** | Harmony Ability Package（静态共享） | Harmony Shared Package（动态共享） | Harmony Application Package |
| **共享方式** | 编译时静态链接 | 运行时动态加载 | 独立安装包 |
| **代码复用** | 每个使用 HAR 的模块都有一份副本 | 多模块共享同一份代码 | N/A（自身包含） |
| **包大小** | 可能增大（重复代码） | 更小（共享） | 标准 |
| **更新方式** | 需重新编译所有依赖模块 | 可单独更新 HSP 模块 | 需重新发布应用 |
| **内存占用** | 较高（多份副本） | 较低（共享实例） | 标准 |
| **适用场景** | 工具类、常量、模型 | 大型共享库、UI 框架 | 主应用 |
| **文件扩展名** | `.har` | `.hsp` | `.hap` |
| **是否可独立运行** | ❌ | ❌ | ✅ |

## 2. HAR - 静态共享包

### 2.1 使用场景

- 工具函数库（Format、Utils）
- 数据模型（Model/DTO）
- 通用常量定义
- 小型组件库
- 对编译速度要求不高的场景

### 2.2 创建 HAR

```typescript
// common/hvigorfile.ts
import { ohosHar } from '@ohos/hvigor-ohos-plugin';

export default {
  system: ohosHar,
  plugins: [ohosHar()],
}
```

```json5
// common/build-profile.json5
{
  "apiType": "stageMode",
  "compileSdkVersion": "12",
  "compatibleSdkVersion": "11",
  "module": {
    "name": "common",
    "type": "har",
    "deviceTypes": ["phone", "tablet"],
  }
}
```

```json5
// oh-package.json5
{
  "dependencies": {
    "common": {
      "path": "./common"
    }
  }
}
```

### 2.3 HAR 的限制

| 限制 | 说明 |
|------|------|
| 代码重复 | 多个 HAP/HAR 引用同一 HAR 时，代码会被编译到各自产物中 |
| 无法运行时更新 | HAR 在编译时链接，无法单独更新 |
| 包膨胀 | 大型 HAR 被多个模块使用时会导致包体积膨胀 |
| 内存冗余 | 每个 HAP 都有自己的一份 HAR 代码实例 |

## 3. HSP - 动态共享包

### 3.1 两种 HSP 模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **动态共享 (dynamicShare)** | 多个 HAP 共享同一份 HSP 代码 | 大型共享库、UI 框架 |
| **动态加载 (dynamicLoad)** | 按需下载 HSP，下载后加载 | 大型功能模块、可插拔能力 |

### 3.2 动态共享 HSP (dynamicShare)

```json5
// hspmodule/build-profile.json5
{
  "module": {
    "name": "hspmodule",
    "type": "shared",
    "dynamicShareFlag": "dynamicShare",
    "deviceTypes": ["phone", "tablet"],
  }
}
```

```typescript
// HSP 中的共享代码
// hspmodule/src/main/ets/utils/SharedUtils.ets
export class SharedUtils {
  static formatPrice(price: number): string {
    return `¥${price.toFixed(2)}`;
  }

  static generateId(): string {
    return `ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 3.3 动态加载 HSP (dynamicLoad)

```json5
// hspmodule/build-profile.json5
{
  "module": {
    "name": "hspmodule",
    "type": "shared",
    "dynamicShareFlag": "dynamicLoad",
    "deviceTypes": ["phone", "tablet"],
  }
}
```

```typescript
// 在 HAP 中动态加载 HSP
import { hspManager } from '@kit.AbilityKit';

// 下载并加载 HSP
async function loadDynamicHSP(): Promise<void> {
  try {
    // 下载 HSP 包
    const downloadTask = hspManager.downloadHsp({
      bundleName: 'com.example.myapp',
      hspName: 'hspmodule',
      installParam: {
        installMode: 'PENDING_INSTALL',
        installLocation: '/data/app/com.example.myapp/',
      }
    });

    // 等待下载完成
    await downloadTask.promise;
    console.info('HSP 下载完成');

    // 加载 HSP
    const loadedHsp = await hspManager.loadHsp({
      bundleName: 'com.example.myapp',
      hspName: 'hspmodule',
    });

    // 使用 HSP 中的能力
    console.info('HSP 加载成功:', loadedHsp);
  } catch (error) {
    console.error('HSP 加载失败:', error);
  }
}
```

### 3.4 HSP vs HAR 选型决策树

```
需要共享代码？
├── 代码量 < 500 行？
│   ├── 是 → HAR（简单、快速）
│   └── 否 → 需要动态共享吗？
│       ├── 是（需要代码共享/减少体积）→ HSP (dynamicShare)
│       └── 否（需要按需加载）→ HSP (dynamicLoad)
└── 是否需要运行时更新？
    ├── 是 → HSP
    └── 否 → HAR
```

## 4. HAP - 应用包

### 4.1 HAP 的构成

```
hap/
├── META-INF/
│   ├── MANIFEST.MF         # 包清单
│   ├── CERT.SF             # 签名文件
│   └── CERT.RSA            # 签名公钥
├── resources/
│   └── base/
├── module.json5            # 模块配置
├── compile/
│   └── ark/                # ArkTS 编译产物
├── libs/                   # 依赖库
├── config.json5            # 应用配置
└── AppScope/
    └── app.json5           # 应用级配置
```

### 4.2 HAP 的类型

| 类型 | 说明 |
|------|------|
| **Entry HAP** | 主 HAP，包含启动能力，可独立安装运行 |
| **Feature HAP** | 功能模块 HAP，按需安装 |
| **Dynamic HAP** | 动态 HAP，可动态安装/卸载 |

```json5
// app.json5
{
  "app": {
    "bundleName": "com.example.myapp",
    "vendor": "example",
    "versionCode": 1000000,
    "versionName": "1.0.0",
    "icon": "$media:app_icon",
    "label": "$string:app_name",
    "distributedNotification": {
      "enable": true
    }
  }
}
```

## 5. 包选型实战指南

### 5.1 实际项目中的包组织

```
MyApp/
├── entry/                    # Entry HAP（主应用）
├── common/                   # HAR（工具、模型）
├── network/                  # HAR（网络层，独立编译）
├── ui/                       # HSP (dynamicShare)（共享 UI 组件）
├── payment/                  # HSP (dynamicLoad)（支付模块，按需加载）
└── analytics/                # HSP (dynamicLoad)（数据分析，可选加载）
```

### 5.2 选型决策表

| 场景 | 推荐 | 原因 |
|------|------|------|
| 工具函数/常量 | HAR | 简单直接，无运行时开销 |
| 数据模型/DTO | HAR | 编译期类型检查 |
| 网络层封装 | HAR | 独立编译，便于测试 |
| UI 组件库 | HSP (dynamicShare) | 多页面共享，减少冗余 |
| 大型第三方 SDK | HSP (dynamicShare) | 减少包体积 |
| 支付模块 | HSP (dynamicLoad) | 按需加载，降低主包体积 |
| 广告 SDK | HSP (dynamicLoad) | 可选能力 |
| 主入口 | HAP | 独立运行 |

## 6. 面试高频考点

### Q1: HAR 和 HSP 的核心区别？

> **回答要点**：
> - HAR 是编译时静态链接，HSP 是运行时动态加载
> - HAR 每个依赖模块都有代码副本，HSP 多模块共享一份
> - HAR 需要重新编译才能更新，HSP 可单独更新
> - HSP 分 dynamicShare 和 dynamicLoad 两种模式
> - HSP 能减少包体积和内存占用

### Q2: HSP 的 dynamicShare 和 dynamicLoad 有什么区别？

> **回答要点**：
> - `dynamicShare`：多个 HAP 同时运行时共享同一份 HSP 代码
> - `dynamicLoad`：按需下载和加载 HSP，支持运行时安装/卸载
> - dynamicShare 适合 UI 框架等频繁使用的共享代码
> - dynamicLoad 适合支付/广告等可选功能模块

### Q3: 什么时候应该用 HAR 而不是 HSP？

> **回答要点**：
> - 代码量少（< 500 行）
> - 不需要运行时更新
> - 编译依赖简单
> - 对包体积不敏感
> - 需要编译时类型检查

### Q4: HAP 的三种类型有什么区别？

> **回答要点**：
> - Entry HAP：主应用包，含入口能力，独立安装
> - Feature HAP：功能模块，按需求安装
> - Dynamic HAP：可动态安装/卸载的能力包

## 7. Android 对比

| 概念 | Android | HarmonyOS |
|------|---------|-----------|
| 静态库 | `.aar` | HAR |
| 动态库 | `.so` (NDK) / AAPT 动态下发 | HSP |
| APK | 应用包 | HAP |
| 动态分发 | Play Feature Delivery | dynamicLoad HSP |
| 多模块 | Gradle 多 module | Hvigor 多 module |
