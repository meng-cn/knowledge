# Compose Multiplatform

> **字数统计：约 7000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐**

---

## 目录

1. [CMP 简介](#1-cmp-简介)
2. [平台支持](#2-平台支持)
3. [项目配置](#3-项目配置)
4. [共享 UI](#4-共享-ui)
5. [平台特定代码](#5-平台特定代码)
6. [面试考点](#6-面试考点)

---

## 1. CMP 简介

### 1.1 什么是 Compose Multiplatform

```
Compose Multiplatform (CMP):
- 使用 Compose 构建跨平台 UI
- 支持 Android、iOS、Web、Desktop
- 共享业务逻辑和 UI 组件
```

### 1.2 与 Jetpack Compose 的区别

```
Jetpack Compose: 仅 Android
CMP: 跨平台共享

共同点：
- 使用相同的 Composable API
- 相同的状态管理
- 相同的布局系统

差异：
- 平台特定的主题
- 平台特定的组件
- 构建配置不同
```

---

## 2. 平台支持

### 2.1 支持的平台

```
- Android (完整支持)
- iOS (完整支持)
- Web (实验性)
- Desktop (Windows, macOS, Linux)
```

### 2.2 项目结构

```
project/
├── shared/                 # 共享模块
│   ├── src/
│   │   ├── commonMain/     # 共享代码
│   │   ├── androidMain/    # Android 特定
│   │   ├── iosMain/        # iOS 特定
│   │   └── jvmMain/        # Desktop 特定
│   └── build.gradle.kts
├── androidApp/             # Android 应用
├── iosApp/                 # iOS 应用
└── desktopApp/             # Desktop 应用
```

---

## 3. 项目配置

### 3.1 共享模块配置

```kotlin
// shared/build.gradle.kts
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.multiplatform")
}

kotlin {
    androidTarget()
    iosX64()
    iosArm64()
    
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.compose.ui:ui:1.4.0")
                implementation("org.jetbrains.compose.material3:material3:1.4.0")
            }
        }
        
        val androidMain by getting {
            dependencies {
                implementation("androidx.compose.material3:material3:1.5.0")
            }
        }
    }
}
```

### 3.2 Android 应用配置

```kotlin
// androidApp/build.gradle.kts
plugins {
    id("com.android.application")
}

dependencies {
    implementation(project(":shared"))
}
```

---

## 4. 共享 UI

### 4.1 共享组件

```kotlin
// shared/src/commonMain/compose/resources

@Composable
fun SharedButton(text: String, onClick: () -> Unit) {
    Button(onClick = onClick) {
        Text(text)
    }
}

@Composable
fun SharedCard(title: String, content: String) {
    Card {
        Column {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(content)
        }
    }
}
```

### 4.2 共享状态

```kotlin
// shared/src/commonMain

class SharedViewModel {
    private val _count = MutableStateFlow(0)
    val count = _count.asStateFlow()
    
    fun increment() {
        _count.value++
    }
}

@Composable
fun SharedCounter(viewModel: SharedViewModel) {
    val count by viewModel.count.collectAsState()
    
    Column {
        Text("Count: $count")
        SharedButton("+") { viewModel.increment() }
    }
}
```

---

## 5. 平台特定代码

### 5.1 平台 API

```kotlin
// shared/src/commonMain
expect fun getPlatformName(): String

// shared/src/androidMain
actual fun getPlatformName(): String = "Android"

// shared/src/iosMain
actual fun getPlatformName(): String = "iOS"

// shared/src/jvmMain
actual fun getPlatformName(): String = "Desktop"
```

### 5.2 平台特定组件

```kotlin
// 使用 expect/actual

// commonMain
expect fun createPlatformButton(): ButtonComposable

// androidMain
actual fun createPlatformButton(): ButtonComposable = Material3Button

// iosMain
actual fun createPlatformButton(): ButtonComposable = iOSButton
```

---

## 6. 面试考点

**Q1: CMP 的优势？**
- 代码共享
- 统一的 UI
- 减少维护成本

**Q2: 平台差异如何处理？**
- expect/actual
- 平台特定源集
- 条件编译

---

*本文完*
