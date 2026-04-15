# Groovy vs Kotlin DSL

> **字数统计：约 8000 字**  
> **难度等级：⭐⭐⭐**  
> **面试重要度：⭐⭐⭐**

---

## 目录

1. [DSL 简介](#1-dsl-简介)
2. [Groovy DSL](#2-groovy-dsl)
3. [Kotlin DSL](#3-kotlin-dsl)
4. [对比与迁移](#4-对比与迁移)
5. [最佳实践](#5-最佳实践)
6. [面试考点](#6-面试考点)

---

## 1. DSL 简介

### 1.1 什么是 DSL

```
DSL (Domain Specific Language) 领域特定语言：
- 专为特定领域设计的语言
- Gradle 使用 DSL 描述构建配置
- 两种选择：Groovy DSL 和 Kotlin DSL
```

### 1.2 文件扩展名

```
Groovy DSL:
- build.gradle
- settings.gradle

Kotlin DSL:
- build.gradle.kts
- settings.gradle.kts
```

### 1.3 历史背景

```
时间线：
- 2012: Gradle 开始支持 Android
- 2018: Gradle 4.0 引入 Kotlin DSL 实验性支持
- 2020: Gradle 6.0 Kotlin DSL 稳定
- 2023: Google 推荐 Kotlin DSL
```

---

## 2. Groovy DSL

### 2.1 基础语法

```gradle
// build.gradle (Groovy)

// 插件
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

// Android 配置
android {
    namespace 'com.example.app'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.example.app"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

// 依赖
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    
    testImplementation 'junit:junit:4.13.2'
}
```

### 2.2 动态特性

```gradle
// 字符串插值
def version = "1.0.0"
println "Version: ${version}"

// 闭包
tasks.register('hello') {
    doLast {
        println 'Hello'
    }
}

// 动态方法调用
def configName = 'release'
android.buildTypes."${configName}".minifyEnabled = true

// 元编程
def configs = ['debug', 'release']
configs.each { config ->
    android.buildTypes."${config}".debuggable = (config == 'debug')
}
```

### 2.3 脚本插件

```gradle
// apply from: 'config.gradle'

// config.gradle
ext {
    androidVersion = 34
    minSdkVersion = 21
    targetSdkVersion = 34
    
    versions = [
        coreKtx: '1.12.0',
        appcompat: '1.6.1',
        material: '1.10.0'
    ]
}

// 使用
// build.gradle
apply from: 'config.gradle'

android {
    compileSdk rootProject.ext.androidVersion
    
    defaultConfig {
        minSdk rootProject.ext.minSdkVersion
        targetSdk rootProject.ext.targetSdkVersion
    }
}

dependencies {
    def versions = rootProject.ext.versions
    implementation "androidx.core:core-ktx:${versions.coreKtx}"
}
```

---

## 3. Kotlin DSL

### 3.1 基础语法

```kotlin
// build.gradle.kts

// 插件
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Android 配置
android {
    namespace = "com.example.app"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

// 依赖
dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    
    testImplementation("junit:junit:4.13.2")
}
```

### 3.2 类型安全

```kotlin
// build.gradle.kts

// 版本常量
val lifecycleVersion = "2.6.2"
val roomVersion = "2.6.0"
val retrofitVersion = "2.9.0"

// 依赖 - 类型安全
dependencies {
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:$lifecycleVersion")
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("com.squareup.retrofit2:retrofit:$retrofitVersion")
}

// 使用 Version Catalog (推荐)
dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.squareup.retrofit2)
}
```

### 3.3 自定义函数

```kotlin
// build.gradle.kts

// 定义函数
fun Project.androidVersion() = 34

fun DependencyHandlerScope.implementationOnly(dependency: String) {
    add("implementation", dependency)
}

// 使用
android {
    compileSdk = androidVersion()
}

dependencies {
    implementationOnly("com.example:library:1.0.0")
}
```

### 3.4 脚本插件 (Kotlin)

```kotlin
// buildSrc/src/main/kotlin/Versions.kt
object Versions {
    const val coreKtx = "1.12.0"
    const val appcompat = "1.6.1"
    const val material = "1.10.0"
}

// build.gradle.kts
dependencies {
    implementation("androidx.core:core-ktx:${Versions.coreKtx}")
    implementation("androidx.appcompat:appcompat:${Versions.appcompat}")
    implementation("com.google.android.material:material:${Versions.material}")
}

// 或使用 Version Catalog
// libs.versions.toml
[versions]
core-ktx = "1.12.0"
appcompat = "1.6.1"

[libraries]
core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "core-ktx" }
appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
```

---

## 4. 对比与迁移

### 4.1 语法对比

| 特性 | Groovy DSL | Kotlin DSL |
|------|-----------|-----------|
| 文件扩展名 | `.gradle` | `.gradle.kts` |
| 属性赋值 | `property = value` | `property = value` |
| 方法调用 | `method 'arg'` | `method("arg")` |
| 闭包 | `{ }` | `{ }` |
| 字符串插值 | `"${var}"` | `"${var}"` |
| 类型安全 | ❌ 动态 | ✅ 静态 |
| IDE 支持 | 一般 | 优秀 |
| 编译速度 | 快 | 稍慢 |
| 学习曲线 | 低 (Groovy) | 中 (Kotlin) |

### 4.2 常见转换

```gradle
// Groovy → Kotlin

// 1. 插件
// Groovy:
plugins {
    id 'com.android.application'
}

// Kotlin:
plugins {
    id("com.android.application")
}

// 2. 属性
// Groovy:
android {
    namespace 'com.example.app'
    compileSdk 34
}

// Kotlin:
android {
    namespace = "com.example.app"
    compileSdk = 34
}

// 3. 布尔值
// Groovy:
buildTypes {
    release {
        minifyEnabled true
    }
}

// Kotlin:
buildTypes {
    release {
        isMinifyEnabled = true
    }
}

// 4. 依赖
// Groovy:
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
}

// Kotlin:
dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
}

// 5. 方法调用
// Groovy:
proguardFiles getDefaultProguardFile('file.txt'), 'proguard-rules.pro'

// Kotlin:
proguardFiles(
    getDefaultProguardFile("proguard-android-optimize.txt"),
    "proguard-rules.pro"
)
```

### 4.3 迁移步骤

```bash
# 1. 备份现有配置
cp build.gradle build.gradle.backup

# 2. 重命名文件
mv build.gradle build.gradle.kts
mv settings.gradle settings.gradle.kts

# 3. 转换语法
# - 插件：id 'xxx' → id("xxx")
# - 属性：name 'value' → name = "value"
# - 依赖：'group:artifact:version' → ("group:artifact:version")

# 4. 同步项目
# File → Sync Project with Gradle Files

# 5. 修复错误
# 根据 IDE 提示修复类型错误
```

### 4.4 迁移示例

```gradle
// 迁移前 (Groovy)
// build.gradle
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'

android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.example.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
}

// 迁移后 (Kotlin)
// build.gradle.kts
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
}
```

---

## 5. 最佳实践

### 5.1 选择建议

```
选择 Kotlin DSL 当：
- 新项目
- 团队熟悉 Kotlin
- 需要更好的 IDE 支持
- 重视类型安全

选择 Groovy DSL 当：
- 旧项目迁移成本高
- 团队熟悉 Groovy
- 需要动态特性
- 构建速度敏感
```

### 5.2 版本管理

```kotlin
// 方式 1: Version Catalog (推荐)
// libs.versions.toml
[versions]
android-gradle = "8.1.0"
kotlin = "1.9.0"
core-ktx = "1.12.0"

[plugins]
android-application = { id = "com.android.application", version.ref = "android-gradle" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }

[libraries]
core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "core-ktx" }

// build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

dependencies {
    implementation(libs.core.ktx)
}

// 方式 2: buildSrc
// buildSrc/src/main/kotlin/Versions.kt
object Versions {
    const val coreKtx = "1.12.0"
}

// 方式 3: 版本对象
// build.gradle.kts
object Dependencies {
    object AndroidX {
        const val coreKtx = "androidx.core:core-ktx:1.12.0"
    }
}

dependencies {
    implementation(Dependencies.AndroidX.coreKtx)
}
```

### 5.3 共享配置

```kotlin
// buildSrc/src/main/kotlin/AndroidModuleConfig.kt
fun Project.configureAndroidModule() {
    android {
        compileSdk = 34
        
        defaultConfig {
            minSdk = 21
            targetSdk = 34
        }
        
        compileOptions {
            sourceCompatibility = JavaVersion.VERSION_17
            targetCompatibility = JavaVersion.VERSION_17
        }
    }
}

// 模块 build.gradle.kts
plugins {
    id("com.android.library")
}

configureAndroidModule()
```

### 5.4 性能优化

```kotlin
// gradle.properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true

// build.gradle.kts
// 避免在配置阶段执行耗时操作
tasks.register("expensiveTask") {
    doLast {
        // 耗时操作放在 doLast 中
    }
}
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: Groovy DSL 和 Kotlin DSL 的区别？**

```
答案要点：
- Groovy: 动态类型，简洁，编译快
- Kotlin: 静态类型，IDE 支持好，类型安全
- Google 推荐：Kotlin DSL (2023+)
- 迁移趋势：Groovy → Kotlin
```

**Q2: 为什么推荐 Kotlin DSL？**

```
答案要点：
1. 类型安全 - 编译时检查
2. IDE 支持 - 自动补全、导航
3. 重构友好 - 重命名、查找引用
4. Kotlin 生态 - 团队技能复用
5. 未来趋势 - Google 官方推荐
```

### 6.2 实战问题

**Q3: 如何管理依赖版本？**

```kotlin
// 推荐：Version Catalog
// libs.versions.toml
[versions]
core-ktx = "1.12.0"

[libraries]
core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "core-ktx" }

// build.gradle.kts
dependencies {
    implementation(libs.core.ktx)
}
```

**Q4: 如何从 Groovy 迁移到 Kotlin DSL？**

```
答案要点：
1. 重命名文件 (.gradle → .gradle.kts)
2. 转换语法 (id 'xxx' → id("xxx"))
3. 属性赋值 (name 'value' → name = "value")
4. 依赖格式 ('group:art:ver' → ("group:art:ver"))
5. 同步并修复错误
```

### 6.3 高级问题

**Q5: 什么是 buildSrc？**

```
答案要点：
- 共享构建逻辑的模块
- 自动编译并添加到 classpath
- 用于定义版本、插件、配置
- 替代方案：Version Catalog,  Convention Plugins
```

**Q6: 如何优化 Kotlin DSL 编译速度？**

```
答案要点：
1. 启用配置缓存
2. 使用 build cache
3. 避免 buildSrc 过大
4. 使用 Version Catalog
5. 减少脚本复杂度
```

---

## 参考资料

- [Gradle Kotlin DSL 文档](https://docs.gradle.org/current/userguide/kotlin_dsl.html)
- [Android Gradle Plugin](https://developer.android.com/studio/build)
- [Version Catalog](https://docs.gradle.org/current/userguide/platforms.html)

---

*本文完，感谢阅读！*
