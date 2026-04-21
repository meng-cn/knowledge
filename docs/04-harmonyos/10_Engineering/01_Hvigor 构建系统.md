# 10_Engineering/01 - Hvigor 构建系统

## 1. Hvigor 概述

Hvigor 是 HarmonyOS NEXT 专用的**开源构建工具**，基于 [Gradle](https://gradle.org/) 设计思路但完全重写，采用 TypeScript 编写，与 DevEco Studio 深度集成。它是 ArkTS/ArkUI 应用构建的核心基础设施。

### 1.1 Hvigor 与 Gradle 的对比

| 维度 | Hvigor | Gradle (Android) |
|------|--------|-----------------|
| 语言 | TypeScript | Kotlin/Groovy |
| 配置格式 | `hvigorfile.ts`（TypeScript 脚本） | `build.gradle.kts` |
| 插件体系 | OpenHarmony Plugin | Gradle Plugin |
| 增量构建 | 基于 ArkTS/ArkUI 源码变更检测 | 基于文件哈希 |
| 跨平台支持 | 原生支持多设备（手机/折叠/平板/车机） | 通过插件扩展 |
| 类型安全 | ✅ TypeScript 强类型 | ⚠️ Kotlin DSL 部分支持 |
| 与 DevEco 集成 | 原生无缝集成 | 需要 Android Studio 插件 |
| 并行构建 | 支持多模块并行 | 支持 |

### 1.2 为什么选择 Hvigor

- **ArkTS/ArkUI 原生支持**：无需额外配置即可编译 ArkTS 代码和编译 ArkUI 声明式语法
- **TypeScript 构建脚本**：与项目技术栈一致，开发者可用 IDE 自动补全
- **增量编译优化**：针对 ArkUI 组件渲染树的变更检测更精确
- **零配置起步**：DevEco Studio 脚手架自动生成正确配置

## 2. 构建工具链架构

```
┌─────────────────────────────────────────────┐
│              DevEco Studio                   │
├─────────────────────────────────────────────┤
│  hvigorw (wrapper) → hvigor (core)          │
├─────────────────────────────────────────────┤
│  hvigor-node (Node.js 运行时)               │
├──────────────────┬──────────────────────────┤
│  ArkTS Compiler   │  ArkUI Compiler          │
│  (arkc)           │  (arkui-builder)         │
├──────────────────┴──────────────────────────┤
│  hvigor-plugin (插件体系)                    │
├─────────────────────────────────────────────┤
│  hvigor-config (配置解析)                    │
└─────────────────────────────────────────────┘
```

### 2.1 核心组件

| 组件 | 说明 |
|------|------|
| `hvigorw` | 构建脚本包装器（类似 `gradlew`），确保版本一致 |
| `hvigor-core` | 构建引擎核心，解析配置、管理任务依赖 |
| `hvigor-node` | Node.js 运行时，支持异步 I/O 和 TypeScript 执行 |
| `arkc` | ArkTS 编译器（Ark TypeScript Compiler） |
| `arkui-builder` | ArkUI 编译器，将声明式语法编译为底层渲染树节点 |
| `hvigor-plugin` | 插件机制，扩展构建能力 |

## 3. hvigorfile.ts 构建脚本

### 3.1 项目根目录 hvigorfile.ts

```typescript
import { appTasks } from '@ohos/hvigor-ohos-plugin';
import { AppEntry, HspEntry, HarEntry } from '@ohos/hvigor-ohos-plugin';

export default {
  system: appTasks,
  plugins: [
    AppEntry,    // APP 模块插件
    HspEntry,    // HSP 模块插件
    HarEntry,    // HAR 模块插件
  ],
}
```

### 3.2 模块级 hvigorfile.ts

```typescript
import { ohosApp, ohosHar, ohosHsp } from '@ohos/hvigor-ohos-plugin';

export default {
  system: ohosApp,  // 模块类型：ohosApp / ohosHar / ohosHsp
  plugins: [
    ohosApp()       // 自动配置 ohosApp 构建流程
  ],
}
```

### 3.3 自定义 Hvigor 任务

```typescript
import { ohosApp, OhosAppContext } from '@ohos/hvigor-ohos-plugin';

export default {
  system: ohosApp,
  plugins: [ohosApp()],
}

// 自定义任务：在构建后生成文档
export function onPrepare(context: OhosAppContext) {
  console.log('构建准备阶段：清理缓存');
  context.hvigor.getTask('clean')?.dependsOn('preClean');
}

export function onComplete(context: OhosAppContext) {
  console.log('构建完成！产物位置：', context.outputs.bundle);
}
```

### 3.4 自定义 Hvigor 任务（高级用法）

```typescript
import { ohosApp, OhosAppContext, TaskContext } from '@ohos/hvigor-ohos-plugin';
import { createTask } from '@ohos/hvigor';

// 定义自定义任务
const minifyArkTS = createTask('minifyArkTS', async (ctx: TaskContext) => {
  const { logger } = ctx;
  logger.info('开始 ArkTS 代码压缩...');

  // 读取 ArkTS 源文件
  const sourceDir = ctx.context.getBuildPath('ArkTSSource');
  const outputDir = ctx.context.getBuildPath('ArkTSOutput');

  // 执行压缩（调用 arkc 的压缩模式）
  await ctx.hvigor.execute('arkc', ['--minify', '--sourcemap',
    '--inputDir', sourceDir, '--outputDir', outputDir]);

  logger.info('ArkTS 压缩完成');
});

export function onPrepare(context: OhosAppContext) {
  // 将自定义任务插入到构建流程中
  context.hvigor.getTask('compileArkTS')?.dependsOn(minifyArkTS);
}
```

## 4. 构建流程详解

### 4.1 完整构建生命周期

```
Clean → PreBuild → Resolve → Compile → Package → Sign → Bundle
 │       │         │          │         │        │       │
 清理    资源预    依赖解析   ArkTS/   HAR/HSP  签名   生成
 旧产物   处理      依赖树    ArkUI    HAP 打包  APK    .app
                              编译              Bundle
```

### 4.2 各阶段详细说明

| 阶段 | 说明 | 关键产物 |
|------|------|---------|
| **clean** | 清理上一轮构建产物 | 无 |
| **preBuild** | 资源预编译（res 目录处理） | `resources.bin` |
| **resolve** | 解析 module.json5、依赖、配置 | 依赖拓扑 |
| **compileArkTS** | 编译 ArkTS 源码 | `.bc`（字节码） |
| **compileArkUI** | 编译 ArkUI 组件 | 渲染节点树 |
| **compileJS** | 编译 JS 桥接层 | `.js` 桥接代码 |
| **packageHar** | 打包 HAR 模块 | `.har` |
| **packageHsp** | 打包 HSP 模块 | `.hsp` |
| **sign** | 代码签名（需要签名证书） | 签名信息 |
| **bundle** | 生成 .app 包 | `.app` |

### 4.3 构建命令

```bash
# 全量构建
hvigorw assembleApp --mode=DEBUG

# Debug 模式构建
hvigorw assembleDebug

# Release 模式构建
hvigorw assembleRelease

# 仅编译，不打包
hvigorw compileApp

# 清理构建产物
hvigorw clean

# 查看构建依赖图
hvigorw dependencies

# 指定设备构建
hvigorw assembleDebug --device=emulator-1
```

## 5. Hvigor 插件开发

### 5.1 插件开发示例

```typescript
// my-custom-plugin.ts
import { HvigorPlugin, HvigorContext, TaskContext, OhosAppContext } from '@ohos/hvigor-ohos-plugin';

interface PluginConfig {
  /** 是否启用代码压缩 */
  minify: boolean;
  /** 是否生成源码映射 */
  sourceMap: boolean;
}

export class CustomMinifyPlugin implements HvigorPlugin {
  name = 'custom-minify';

  apply(context: HvigorContext, config: PluginConfig): void {
    const { logger } = context;

    // 在 ArkTS 编译后插入压缩任务
    const minifyTask = context.hvigor.createTask('customMinify', async (taskCtx: TaskContext) => {
      logger.info('自定义压缩插件执行中...');

      // 读取编译产物
      const artifactPath = taskCtx.context.getBuildPath('ArkTSOutput');

      // 执行压缩逻辑
      if (config.minify) {
        await this.minify(artifactPath);
      }

      // 生成 source map
      if (config.sourceMap) {
        await this.generateSourceMap(artifactPath);
      }

      logger.info('自定义压缩插件执行完成');
    });

    // 插入到编译任务之后
    const compileTask = context.hvigor.getTask('compileArkTS');
    compileTask?.dependsOn(minifyTask);
  }

  private async minify(dir: string): Promise<void> {
    // 实际压缩实现
  }

  private async generateSourceMap(dir: string): Promise<void> {
    // 实际 source map 生成
  }
}

// 导出插件实例
export default {
  name: 'custom-minify',
  apply: (ctx: HvigorContext) => {
    return new CustomMinifyPlugin().apply(ctx, { minify: true, sourceMap: false });
  },
};
```

### 5.2 在项目中安装自定义插件

```typescript
// hvigorfile.ts
import { ohosApp } from '@ohos/hvigor-ohos-plugin';
import customMinify from './plugins/custom-minify';

export default {
  system: ohosApp,
  plugins: [
    ohosApp(),
    customMinify,
  ],
}
```

## 6. 构建性能优化

### 6.1 优化策略

| 策略 | 效果 | 说明 |
|------|------|------|
| 增量编译 | 3-5x | 只编译变更的 ArkTS 文件 |
| 并行构建 | 2-3x | 多模块同时编译 |
| 缓存复用 | 10-50x | 重用上次构建的不变产物 |
| 依赖降级 | 渐进 | 避免重复下载相同依赖 |

### 6.2 hvigorconfig.json 配置

```json
{
  "hvigor": {
    "incremental": true,
    "parallel": true,
    "cache": {
      "enabled": true,
      "maxSize": "2GB",
      "ttl": "7d"
    },
    "daemon": true,
    "daemonMaxIdleTime": 3600,
    "logging": {
      "level": "info",
      "console": true,
      "file": true
    }
  }
}
```

## 7. 面试高频考点

### Q1: Hvigor 和 Gradle 的核心区别是什么？

> **回答要点**：
> - Hvigor 基于 TypeScript，Gradle 基于 Kotlin/Groovy
> - Hvigor 为 ArkTS/ArkUI 深度优化，Gradle 通用构建
> - Hvigor 的增量编译针对 ArkUI 渲染树做精确检测
> - Hvigor 与 DevEco Studio 原生集成，Gradle 需要插件

### Q2: 如何实现自定义构建任务？

> **回答要点**：
> - 通过 `onPrepare` / `onComplete` 钩子
> - 使用 `createTask` 创建自定义任务
> - 用 `dependsOn` 插入到构建流程链
> - 插件需实现 `HvigorPlugin` 接口

### Q3: Hvigor 的增量编译原理？

> **回答要点**：
> - ArkTS 层：文件 hash 对比，增量重新编译
> - ArkUI 层：组件树变更检测（diff 算法）
> - 资源层：资源文件 hash 对比
> - 产物缓存：不变产物复用，减少重复工作

### Q4: 如何优化构建速度？

> **回答要点**：
> - 启用缓存（`hvigorconfig.json`）
> - 开启并行构建（`parallel: true`）
> - 减少模块依赖（避免循环依赖）
> - 使用 HSP 代替 HAR 减少重复编译
> - 排除不必要的资源扫描

## 8. Android 对比

| 概念 | Android (Gradle) | HarmonyOS (Hvigor) |
|------|-----------------|-------------------|
| 构建配置 | `build.gradle.kts` | `hvigorfile.ts` + `build-profile.json5` |
| 构建脚本语言 | Kotlin DSL | TypeScript |
| 构建包装器 | `gradlew` | `hvigorw` |
| 插件命名空间 | `id 'com.android.application'` | `ohosApp()` |
| 产物格式 | `.apk` / `.aab` | `.app` |
| 增量编译 | Build Cache | 文件 hash + ArkUI diff |
