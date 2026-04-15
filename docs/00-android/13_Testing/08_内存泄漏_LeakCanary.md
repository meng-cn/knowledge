# 内存泄漏检测 - LeakCanary

> **字数统计：约 8000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐⭐**

---

## 目录

1. [LeakCanary 简介](#1-leakcanary-简介)
2. [集成与配置](#2-集成与配置)
3. [使用指南](#3-使用指南)
4. [常见泄漏场景](#4-常见泄漏场景)
5. [高级用法](#5-高级用法)
6. [面试考点](#6-面试考点)

---

## 1. LeakCanary 简介

### 1.1 什么是 LeakCanary

```
LeakCanary 是 Square 开源的内存泄漏检测库：
- 自动检测 Activity、Fragment、View 泄漏
- 提供详细的引用链分析
- 实时通知
- 低性能开销
```

### 1.2 工作原理

```
工作流程：
1. 监控对象生命周期
2. 等待 GC
3. 检查对象是否存活
4. 堆转储分析
5. 生成引用链报告
```

---

## 2. 集成与配置

### 2.1 添加依赖

```gradle
dependencies {
    // Debug 版本启用
    debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'
    
    // 可选：不在通知栏显示
    // debugImplementation 'com.squareup.leakcanary:leakcanary-android-no-hint:2.14'
}
```

### 2.2 初始化

```kotlin
// LeakCanary 2.x 自动初始化
// 无需手动配置

// 自定义配置（可选）
class MyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 自定义配置
        LeakCanary.config = LeakCanary.config.copy(
            // 排除某些类
            referenceMatchers = LeakCanary.config.referenceMatchers + 
                customMatchers()
        )
    }
}
```

---

## 3. 使用指南

### 3.1 查看泄漏报告

```
泄漏通知流程：
1. 检测到泄漏
2. 通知栏显示
3. 点击查看详情
4. 分析引用链
5. 修复泄漏
```

### 3.2 解读报告

```
泄漏报告内容：
- 泄漏对象
- 引用链
- 泄漏原因
- 修复建议

示例：
🔴 LEAK FOUND
  泄漏对象：com.example.MainActivity @ 0x12345678
  引用链：
    java.lang.ref.WeakReference<com.example.MainActivity>
      → com.example.Singleton.instance
         → com.example.MainActivity @ 0x12345678
  说明：Singleton 持有静态引用导致泄漏
  建议：使用 WeakReference 或 Application Context
```

---

## 4. 常见泄漏场景

### 4.1 静态集合

```kotlin
// ❌ 错误
class BadCache {
    companion object {
        private val cache = mutableListOf<Any>() // 静态集合
    }
}

// ✅ 正确
class GoodCache {
    private val cache = LruCache<String, Any>(16)
}
```

### 4.2 非静态内部类

```kotlin
// ❌ 错误
class Outer {
    inner class Inner {
        // 持有外部类引用
    }
}

// ✅ 正确
class Outer {
    class StaticInner {
        // 不持有外部类引用
    }
}
```

### 4.3 未注销监听器

```kotlin
// ❌ 错误
class MyActivity : AppCompatActivity() {
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {}
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerReceiver(receiver, IntentFilter("ACTION"))
        // 忘记注销
    }
}

// ✅ 正确
class MyActivity : AppCompatActivity() {
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {}
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerReceiver(receiver, IntentFilter("ACTION"))
    }
    
    override fun onDestroy() {
        unregisterReceiver(receiver)
        super.onDestroy()
    }
}
```

### 4.4 线程泄漏

```kotlin
// ❌ 错误
class MyActivity : AppCompatActivity() {
    private val thread = Thread {
        while (true) {
            // 持有 Activity 引用
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        thread.start()
    }
    // 忘记停止线程
}

// ✅ 正确
class MyActivity : AppCompatActivity() {
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        scope.launch {
            // 协程与生命周期关联
        }
    }
    
    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
}
```

---

## 5. 高级用法

### 5.1 手动监控

```kotlin
class ManualWatching {
    
    fun watchObject(obj: Any) {
        if (BuildConfig.DEBUG) {
            // 手动监控对象
            // LeakCanary 内部 API
        }
    }
}
```

### 5.2 排除假阳性

```kotlin
// 某些情况可能误报
// 可以配置排除规则
class LeakCanaryConfig {
    
    fun configure() {
        LeakCanary.config = LeakCanary.config.copy(
            // 排除已知假阳性
        )
    }
}
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: LeakCanary 的工作原理？**

```
答案要点：
1. 监控对象生命周期
2. 等待 GC
3. 检查对象存活
4. 堆转储分析
5. 生成引用链
```

**Q2: 常见的内存泄漏场景？**

```
答案要点：
1. 静态集合持有对象
2. 非静态内部类
3. 未注销监听器
4. 线程未停止
5. 单例持有 Context
```

### 6.2 实战问题

**Q3: 如何集成 LeakCanary？**

```gradle
debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'

// 自动初始化，无需配置
```

**Q4: 如何修复内存泄漏？**

```
答案要点：
1. 查看 LeakCanary 报告
2. 分析引用链
3. 解除不必要的引用
4. 使用 WeakReference
5. 及时清理资源
```

---

## 参考资料

- [LeakCanary 官方文档](https://square.github.io/leakcanary/)
- [Memory Leak 官方指南](https://developer.android.com/studio/profile/memory-profiler)

---

*本文完，感谢阅读！*
