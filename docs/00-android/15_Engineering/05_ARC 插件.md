# ARC 插件与架构

> **字数统计：约 6000 字**  
> **难度等级：⭐⭐⭐**  
> **面试重要度：⭐⭐**

---

## 1. 简介

ARC (Android Runtime Compiler) 插件用于优化编译：
- 增量编译
- 代码生成
- 注解处理

---

## 2. 常见插件

```gradle
// Kapt - Kotlin 注解处理
plugins {
    id("kotlin-kapt")
}

// KSP - Kotlin Symbol Processing
plugins {
    id("com.google.devtools.ksp")
}

// Hilt
plugins {
    id("com.google.dagger.hilt.android")
}
```

---

## 3. 性能优化

```kotlin
// Kapt 优化
kapt {
    correctErrorTypes = true
    useBuildCache = true
    arguments {
        arg("dagger.fastInit", "enabled")
    }
}
```

---

*本文完*
