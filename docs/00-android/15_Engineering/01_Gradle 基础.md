# Gradle 基础

> **字数统计：约 9000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐⭐**

---

## 目录

1. [Gradle 简介](#1-gradle-简介)
2. [构建脚本基础](#2-构建脚本基础)
3. [依赖管理](#3-依赖管理)
4. [构建变体](#4-构建变体)
5. [自定义任务](#5-自定义任务)
6. [性能优化](#6-性能优化)
7. [面试考点](#7-面试考点)

---

## 1. Gradle 简介

### 1.1 什么是 Gradle

```
Gradle 是一个基于 JVM 的构建工具：
- 使用 Groovy 或 Kotlin DSL
- 增量构建（只构建变化的部分）
- 依赖管理
- 多项目构建
- 插件系统
```

### 1.2 Gradle 架构

```
Gradle 核心组件：
- Gradle Wrapper (gradlew/gradlew.bat)
- build.gradle (构建脚本)
- settings.gradle (项目配置)
- gradle.properties (属性配置)
- local.properties (本地配置)
```

### 1.3 项目结构

```
MyProject/
├── app/                      # 应用模块
│   ├── build.gradle          # 模块级构建脚本
│   ├── src/
│   │   ├── main/             # 主代码
│   │   ├── test/             # 单元测试
│   │   └── androidTest/      # 仪器测试
│   └── ...
├── build.gradle              # 项目级构建脚本
├── settings.gradle           # 项目设置
├── gradle.properties         # Gradle 属性
└── gradle/
    └── wrapper/
        └── gradle-wrapper.properties
```

---

## 2. 构建脚本基础

### 2.1 项目级 build.gradle

```gradle
// 项目根目录 build.gradle
buildscript {
    ext.kotlin_version = '1.9.0'
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        classpath 'com.google.dagger:hilt-android-gradle-plugin:2.48'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

### 2.2 模块级 build.gradle

```gradle
// app/build.gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
}

android {
    namespace 'com.example.app'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.example.app"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
            debuggable true
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = '17'
    }
    
    buildFeatures {
        viewBinding true
        compose true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.0'
    }
}

dependencies {
    // 依赖管理
}
```

### 2.3 settings.gradle

```gradle
// settings.gradle
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}

rootProject.name = "MyProject"
include ':app'
include ':feature:login'
include ':feature:home'
include ':core:network'
include ':core:database'
```

### 2.4 gradle.properties

```properties
# gradle.properties

# Gradle 配置
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.daemon=true
org.gradle.configureondemand=true

# Android 配置
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true

# Kotlin 配置
kotlin.code.style=official
kotlin.incremental=true

# 构建配置
android.defaults.buildfeatures.buildconfig=true
android.nonFinalResIds=false
```

---

## 3. 依赖管理

### 3.1 依赖配置

```gradle
dependencies {
    // 编译时依赖（打包到 APK）
    implementation 'androidx.core:core-ktx:1.12.0'
    
    // 仅编译时依赖（不打包到 APK）
    compileOnly 'javax.annotation:jsr250-api:1.0'
    
    // 运行时依赖（不编译）
    runtimeOnly 'androidx.profileinstaller:profileinstaller:1.3.1'
    
    // 测试依赖
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    
    // Kapt（注解处理）
    kapt 'com.google.dagger:hilt-compiler:2.48'
    
    // 本地模块依赖
    implementation project(':core:network')
    implementation project(':core:database')
}
```

### 3.2 依赖版本管理

```gradle
// 方式 1：使用 ext
buildscript {
    ext {
        lifecycle_version = '2.6.2'
        room_version = '2.6.0'
        retrofit_version = '2.9.0'
    }
}

dependencies {
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:$lifecycle_version"
    implementation "androidx.room:room-runtime:$room_version"
    implementation "com.squareup.retrofit2:retrofit:$retrofit_version"
}

// 方式 2：使用 Version Catalog (推荐)
// libs.versions.toml
[versions]
lifecycle = "2.6.2"
room = "2.6.0"
retrofit = "2.9.0"

[libraries]
lifecycle-runtime = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }

// build.gradle
dependencies {
    implementation libs.lifecycle.runtime
    implementation libs.room.runtime
    implementation libs.retrofit
}

// 方式 3：使用 BOM
dependencies {
    implementation platform('androidx.compose:compose-bom:2023.10.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.material3:material3'
}
```

### 3.3 依赖冲突解决

```gradle
// 查看依赖树
// ./gradlew app:dependencies

// 查看特定依赖
// ./gradlew app:dependencies --configuration releaseRuntimeClasspath

// 排除传递依赖
dependencies {
    implementation('com.example:library:1.0.0') {
        exclude group: 'com.google.guava', module: 'guava'
    }
}

// 强制使用特定版本
configurations.all {
    resolutionStrategy {
        force 'com.google.guava:guava:32.0.0-jre'
        eachDependency { details ->
            if (details.requested.group == 'org.jetbrains.kotlin') {
                details.useVersion '1.9.0'
            }
        }
    }
}
```

---

## 4. 构建变体

### 4.1 Build Types

```gradle
android {
    buildTypes {
        debug {
            applicationIdSuffix ".debug"
            debuggable true
            minifyEnabled false
        }
        
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        
        staging {
            initWith debug
            applicationIdSuffix ".staging"
            buildConfigField "String", "BASE_URL", '"https://staging.api.com"'
        }
    }
}
```

### 4.2 Product Flavors

```gradle
android {
    flavorDimensions "version", "environment"
    
    productFlavors {
        // 版本维度
        free {
            dimension "version"
            applicationIdSuffix ".free"
            versionNameSuffix "-free"
        }
        
        paid {
            dimension "version"
            applicationIdSuffix ".paid"
            versionNameSuffix "-paid"
        }
        
        // 环境维度
        dev {
            dimension "environment"
            buildConfigField "String", "BASE_URL", '"https://dev.api.com"'
        }
        
        staging {
            dimension "environment"
            buildConfigField "String", "BASE_URL", '"https://staging.api.com"'
        }
        
        production {
            dimension "environment"
            buildConfigField "String", "BASE_URL", '"https://api.com"'
        }
    }
}

// 生成的变体组合：
// freeDev, freeStaging, freeProduction
// paidDev, paidStaging, paidProduction
```

### 4.3 Source Sets

```gradle
android {
    sourceSets {
        main {
            java.srcDirs 'src/main/java'
            res.srcDirs 'src/main/res'
        }
        
        free {
            java.srcDirs 'src/free/java'
            res.srcDirs 'src/free/res'
        }
        
        paid {
            java.srcDirs 'src/paid/java'
            res.srcDirs 'src/paid/res'
        }
        
        debug {
            java.srcDirs 'src/debug/java'
            res.srcDirs 'src/debug/res'
        }
        
        release {
            java.srcDirs 'src/release/java'
            res.srcDirs 'src/release/res'
        }
    }
}
```

### 4.4 签名配置

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../keystore/release.keystore')
            storePassword System.getenv('STORE_PASSWORD') ?: ''
            keyAlias 'release-key'
            keyPassword System.getenv('KEY_PASSWORD') ?: ''
        }
        
        debug {
            storeFile file('../keystore/debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }
}
```

---

## 5. 自定义任务

### 5.1 基础任务

```gradle
// 简单任务
tasks.register('hello') {
    doLast {
        println 'Hello, Gradle!'
    }
}

// 带参数的任务
tasks.register('greet') {
    def name = project.hasProperty('name') ? project.name : 'World'
    doLast {
        println "Hello, $name!"
    }
}

// 使用：./gradlew greet -Pname=Android
```

### 5.2 任务依赖

```gradle
tasks.register('taskA') {
    doLast {
        println 'Task A'
    }
}

tasks.register('taskB') {
    doLast {
        println 'Task B'
    }
}

tasks.register('taskC') {
    dependsOn taskA, taskB
    doLast {
        println 'Task C (after A and B)'
    }
}

// 或者
taskC.dependsOn taskA, taskB
```

### 5.3 自定义插件

```gradle
// buildSrc/src/main/kotlin/VersionPlugin.kt
class VersionPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.extensions.create("versionConfig", VersionConfig::class.java)
        
        project.afterEvaluate {
            val config = project.versionConfig as VersionConfig
            println "Version: ${config.major}.${config.minor}.${config.patch}"
        }
    }
}

class VersionConfig {
    var major: String = "1"
    var minor: String = "0"
    var patch: String = "0"
}

// 使用插件
// build.gradle
plugins {
    id 'version-plugin'
}

versionConfig {
    major = "2"
    minor = "0"
    patch = "0"
}
```

### 5.4 APK 输出配置

```gradle
android {
    applicationVariants.all { variant ->
        variant.outputs.all { output ->
            def versionName = variant.versionName
            def buildType = variant.buildType.name
            def flavor = variant.productFlavors[0].name
            
            outputFileName = "app-${flavor}-${buildType}-v${versionName}.apk"
        }
    }
}

// 输出示例：
// app-free-release-v1.0.0.apk
// app-paid-debug-v1.0.0.apk
```

---

## 6. 性能优化

### 6.1 启用构建缓存

```properties
# gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
```

### 6.2 分析构建性能

```bash
# 生成构建报告
./gradlew build --scan

# 分析任务执行时间
./gradlew build --profile

# 查看任务执行时间
./gradlew tasks --all --timing

# 查看依赖树
./gradlew app:dependencies

# 清理构建缓存
./gradlew cleanBuildCache
```

### 6.3 优化依赖

```gradle
// 1. 避免重复依赖
// 使用 dependencyAnalysis 插件检测

// 2. 使用 implementation 代替 api
dependencies {
    // ❌ 不推荐：暴露给下游模块
    api 'androidx.core:core-ktx:1.12.0'
    
    // ✅ 推荐：仅内部使用
    implementation 'androidx.core:core-ktx:1.12.0'
}

// 3. 延迟注解处理
kapt {
    correctErrorTypes = true
    useBuildCache = true
    arguments {
        arg('dagger.fastInit', 'enabled')
    }
}
```

### 6.4 模块化优化

```gradle
// settings.gradle
enableFeaturePreview('TYPESAFE_PROJECT_ACCESSORS')

// 使用项目访问器
dependencies {
    // 推荐：类型安全
    implementation(projects.core.network)
    implementation(projects.core.database)
    implementation(projects.feature.login)
    
    // 不推荐：字符串
    implementation project(':core:network')
}
```

### 6.5 配置缓存

```properties
# gradle.properties
org.gradle.configuration-cache=true
org.gradle.configuration-cache.problems=warn
```

```bash
# 使用配置缓存
./gradlew build --configuration-cache

# 查看缓存信息
./gradlew build --configuration-cache --info
```

---

## 7. 面试考点

### 7.1 基础概念

**Q1: Gradle 的构建生命周期？**

```
答案要点：
1. Initialization - 初始化阶段
   - 创建 Project 对象
   - 确定哪些项目参与构建

2. Configuration - 配置阶段
   - 执行 build.gradle
   - 创建任务图

3. Execution - 执行阶段
   - 执行任务
   - 按依赖顺序
```

**Q2: implementation 和 api 的区别？**

```
答案要点：
- implementation: 依赖不暴露给下游模块
- api: 依赖暴露给下游模块（传递依赖）
- 建议：优先使用 implementation，减少编译时间
```

### 7.2 实战问题

**Q3: 如何解决依赖冲突？**

```gradle
// 1. 查看依赖树
./gradlew app:dependencies

// 2. 排除冲突依赖
implementation('com.example:lib:1.0') {
    exclude group: 'com.google.guava'
}

// 3. 强制版本
configurations.all {
    resolutionStrategy {
        force 'com.google.guava:guava:32.0.0'
    }
}
```

**Q4: 如何优化构建速度？**

```
答案要点：
1. 启用构建缓存 (org.gradle.caching=true)
2. 启用并行构建 (org.gradle.parallel=true)
3. 启用配置缓存
4. 增加 JVM 内存 (-Xmx2048m)
5. 使用模块化
6. 避免不必要的任务
7. 使用 Gradle Daemon
```

### 7.3 高级问题

**Q5: 什么是 Build Variant？**

```
答案要点：
- Build Type + Product Flavor 的组合
- Build Type: debug/release/staging
- Product Flavor: free/paid, dev/prod
- 每个变体有独立的配置和代码
```

**Q6: 如何自定义 Gradle 插件？**

```kotlin
// 1. 创建插件类
class MyPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        // 插件逻辑
    }
}

// 2. 注册插件
// resources/META-INF/gradle-plugins/my-plugin.properties
implementation-class=com.example.MyPlugin

// 3. 使用插件
plugins {
    id 'my-plugin'
}
```

---

## 参考资料

- [Gradle 官方文档](https://docs.gradle.org/)
- [Android Gradle Plugin](https://developer.android.com/studio/build)
- [Gradle 性能优化](https://docs.gradle.org/current/userguide/performance.html)

---

*本文完，感谢阅读！*
