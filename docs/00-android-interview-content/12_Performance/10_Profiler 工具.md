# Android Profiler 工具

## 目录

1. [引言](#引言)
2. [Android Profiler 使用](#android-profiler 使用)
3. [CPU 分析](#cpu 分析)
4. [内存分析](#内存分析)
5. [网络分析](#网络分析)
6. [能源分析](#能源分析)
7. [Perfetto 追踪](#perfetto 追踪)
8. [Systrace 使用](#systrace 使用)
9. [Custom View 性能追踪](#custom-view 性能追踪)
10. [面试考点](#面试考点)
11. [工具使用指南](#工具使用指南)
12. [总结](#总结)

---

## 引言

性能分析工具是开发者优化应用的利器。Android 提供了丰富的性能分析工具，包括 Android Profiler、Perfetto、Systrace 等。掌握这些工具可以帮助开发者快速定位性能问题并进行优化。本文将详细介绍这些工具的使用方法和最佳实践。

### 性能分析工具概览

| 工具 | 用途 | 适用场景 |
|-----|-----|---------|
| Android Profiler | 综合性能分析 | 日常开发调试 |
| Perfetto | 系统级追踪 | 复杂性能问题 |
| Systrace | CPU 和渲染分析 | 掉帧卡顿分析 |
| Network Profiler | 网络请求分析 | 网络性能优化 |
| Energy Profiler | 电量消耗分析 | 电量优化 |

---

## Android Profiler 使用

### 启动 Profiler

```kotlin
// 1. Android Studio 中启动
// Run → Profile APK / Profile App

// 2. 连接设备后自动显示
// View → Tool Windows → App Profiler

// 3. 通过代码启动
class ProfilerStarter {
    fun startProfiler() {
        // 使用 Debug.startMethodTracing()
        Debug.startMethodTracing("/sdcard/trace")
        
        // 使用 Debug.stopMethodTracing()
        Debug.stopMethodTracing()
    }
}
```

### Profiler 界面介绍

```
┌────────────────────────────────────────┐
│       Android Profiler 界面             │
├────────────────────────────────────────┤
│  CPU   →  CPU 采样和分析                │
│  Memory → 内存使用和泄漏检测            │
│  Network → 网络请求监控                │
│  Energy → 电量消耗分析                 │
│  Database → SQLite 数据库监控          │
└────────────────────────────────────────┘
```

### Profiler 配置

```kotlin
// Profiler 配置示例
class ProfilerConfig {
    // 1. 设置采样间隔
    fun setSamplingInterval(interval: Long) {
        // 默认 10ms
    }
    
    // 2. 过滤线程
    fun filterThreads(threads: List<String>) {
        // 只监控指定线程
    }
    
    // 3. 设置追踪类别
    fun setCategories(categories: List<String>) {
        // 选择追踪类别
    }
}
```

---

## CPU 分析

### CPU 采样分析

```kotlin
// 开始 CPU 采样
class CPUProfiler {
    // 1. 火焰图分析
    fun analyzeFlameGraph() {
        // 查看方法调用堆栈
        // 识别耗时方法
    }
    
    // 2. CPU 使用率
    fun analyzeCPUUsage() {
        // 查看各线程 CPU 使用率
        // 识别 CPU 密集型操作
    }
    
    // 3. 方法追踪
    fun analyzeMethodTracing() {
        // 追踪特定方法执行时间
    }
}
```

### CPU 性能分析

```kotlin
// CPU 性能分析示例
class CPUAnalysis {
    // 使用 StrictMode 检测 CPU 问题
    fun detectCPUProblems() {
        StrictMode.setThreadPolicy(
            StrictMode.ThreadPolicy.Builder()
                .detectDiskReads()
                .detectDiskWrites()
                .detectNetwork()
                .penaltyLog()
                .build()
        )
    }
    
    // 使用 Trace 标记方法
    fun traceMethod() {
        Trace.beginSection("expensiveOperation")
        try {
            expensiveComputation()
        } finally {
            Trace.endSection()
        }
    }
    
    private fun expensiveComputation() {
        // 耗时操作
    }
}
```

### CPU 热点分析

```kotlin
class CPUHotspotAnalyzer {
    // 1. 使用 Android Profiler
    fun analyzeHotspots() {
        // 点击 CPU 标签页
        // 点击 Record 开始采样
        // 分析火焰图
    }
    
    // 2. 自定义性能标记
    fun addPerformanceMarker(name: String) {
        Trace.beginSection(name)
        // 执行代码
        Trace.endSection()
    }
    
    // 3. 分析结果
    fun analyzeResults() {
        // 查看自耗时 (Self Time)
        // 查看总耗时 (Total Time)
        // 识别优化点
    }
}
```

---

## 内存分析

### 内存分析基础

```kotlin
class MemoryProfiler {
    // 1. 查看内存使用情况
    fun analyzeMemoryUsage() {
        // Heap 大小
        // Alloc 速率
        // GC 频率
    }
    
    // 2. 触发垃圾回收
    fun triggerGC() {
        // 点击 GC 按钮
        // 查看内存变化
    }
    
    // 3. 查看对象分布
    fun analyzeObjectDistribution() {
        // 查看各类型对象数量
        // 识别内存占用大户
    }
}
```

### 内存泄漏检测

```kotlin
// 内存泄漏检测示例
class MemoryLeakDetector {
    // 1. 使用 Dump Heap
    fun dumpHeap() {
        // 点击 Dump Java Heap
        // 分析 hprof 文件
    }
    
    // 2. 查找泄漏对象
    fun findLeakedObjects() {
        // 搜索泄漏对象
        // 查看引用链
        // 定位泄漏源
    }
    
    // 3. 使用 LeakCanary
    fun useLeakCanary() {
        // 添加依赖
        // 自动检测泄漏
    }
}

// LeakCanary 集成
dependencies {
    debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'
}
```

### 内存优化技巧

```kotlin
class MemoryOptimization {
    // 1. 使用 WeakReference
    fun useWeakReference() {
        val weakRef = WeakReference<View>(view)
        // 避免内存泄漏
    }
    
    // 2. 使用 SoftReference
    fun useSoftReference() {
        val softRef = SoftReference<Bitmap>(bitmap)
        // 内存不足时自动回收
    }
    
    // 3. 及时释放资源
    fun releaseResources() {
        // 关闭 Cursor
        // 释放 Bitmap
        // 注销监听器
    }
    
    // 4. 使用对象池
    fun useObjectPool() {
        // 复用对象
        // 减少分配
    }
}
```

---

## 网络分析

### 网络请求监控

```kotlin
class NetworkProfiler {
    // 1. 查看网络请求
    fun analyzeNetworkRequests() {
        // 查看 URL
        // 查看请求大小
        // 查看响应时间
    }
    
    // 2. 分析网络性能
    fun analyzeNetworkPerformance() {
        // TTFB (Time To First Byte)
        // 下载速度
        // 请求成功率
    }
    
    // 3. 网络异常检测
    fun detectNetworkIssues() {
        // 慢请求检测
        // 失败请求检测
        // 重复请求检测
    }
}
```

### 网络优化分析

```kotlin
class NetworkOptimizationAnalyzer {
    // 1. 请求合并
    fun analyzeRequestMerging() {
        // 识别可合并的请求
        // 分析请求模式
    }
    
    // 2. 缓存分析
    fun analyzeCaching() {
        // 查看缓存命中率
        // 分析缓存策略
    }
    
    // 3. 压缩分析
    fun analyzeCompression() {
        // 查看压缩比
        // 分析 Gzip/Protobuf
    }
}
```

### 网络性能指标

```kotlin
data class NetworkMetrics(
    val url: String,
    val method: String,
    val duration: Long,
    val responseSize: Long,
    val requestSize: Long,
    val statusCode: Int,
    val cached: Boolean
)

class NetworkMetricsCollector {
    private val metrics = mutableListOf<NetworkMetrics>()
    
    fun record(metrics: NetworkMetrics) {
        this.metrics.add(metrics)
    }
    
    fun analyze() {
        // 平均响应时间
        val avgDuration = metrics.map { it.duration }.average()
        
        // 慢请求
        val slowRequests = metrics.filter { it.duration > 1000 }
        
        // 失败请求
        val failedRequests = metrics.filter { it.statusCode >= 400 }
    }
}
```

---

## 能源分析

### 能源消耗分析

```kotlin
class EnergyProfiler {
    // 1. 查看组件消耗
    fun analyzeComponentUsage() {
        // CPU
        // Network
        // GPS
        // Screen
    }
    
    // 2. 分析唤醒源
    fun analyzeWakeSources() {
        // 查看唤醒锁
        // 分析广播接收器
        // 分析 JobScheduler
    }
    
    // 3. 识别耗电操作
    fun identifyBatteryDrains() {
        // 频繁网络请求
        // 后台定位
        // 长时间持有唤醒锁
    }
}
```

### 能源优化建议

```kotlin
class EnergyOptimizationSuggestions {
    // 1. 减少后台活动
    fun reduceBackgroundActivity() {
        // 使用 JobScheduler
        // 使用 WorkManager
        // 避免后台服务
    }
    
    // 2. 优化网络使用
    fun optimizeNetworkUsage() {
        // 批量请求
        // 使用连接池
        // 减少重试
    }
    
    // 3. 优化定位
    fun optimizeLocation() {
        // 降低频率
        // 使用低精度
        // 使用 Fused Location
    }
}
```

### 能源监控

```kotlin
class EnergyMonitor {
    // 1. 电池状态监听
    fun monitorBatteryState() {
        // 电量变化
        // 充电状态
        // 温度
    }
    
    // 2. 网络状态监听
    fun monitorNetworkState() {
        // 网络连接变化
        // 网络类型
    }
    
    // 3. 定位状态监听
    fun monitorLocationState() {
        // 定位启用状态
        // 定位频率
    }
}
```

---

## Perfetto 追踪

### Perfetto 基础

```bash
# 1. 使用 ADB 捕获 trace
perfetto --config android.config --duration=30

# 2. 查看 trace
# 打开 https://ui.perfetto.dev
# 加载 trace 文件
```

### Perfetto 配置

```kotlin
// Perfetto 追踪配置
class PerfettoConfig {
    // 1. 设置追踪类别
    val categories = listOf(
        "android.view.Choreographer",
        "gpu",
        "sched",
        "memory"
    )
    
    // 2. 设置采样率
    val samplingInterval = 1000 // 微秒
    
    // 3. 设置追踪时长
    val duration = 30 // 秒
}
```

### Perfetto 分析技巧

```kotlin
class PerfettoAnalyzer {
    // 1. 渲染分析
    fun analyzeRendering() {
        // 查看 Choreographer 帧
        // 分析绘制时间
        // 检查 GPU 活动
    }
    
    // 2. 调度分析
    fun analyzeScheduling() {
        // 查看线程调度
        // 分析 CPU 使用
        // 检测阻塞
    }
    
    // 3. 内存分析
    fun analyzeMemory() {
        // 查看对象分配
        // 分析 GC 活动
        // 检测内存泄漏
    }
}
```

---

## Systrace 使用

### Systrace 基础

```bash
# 1. 安装 systrace
pip install systrace

# 2. 捕获 trace
python -m systrace.systrace \
    --time 10 \
    --output trace.html \
    -m androidview androidinput

# 3. 查看 trace
python -m http.server 8000
# 打开 http://localhost:8000/trace.html
```

### Systrace 分析项

```kotlin
class SystraceAnalyzer {
    // 1. 渲染管道
    fun analyzeRenderPipeline() {
        // UI Thread
        // Render Thread
        // Choreographer
        // SurfaceFlinger
    }
    
    // 2. 布局分析
    fun analyzeLayout() {
        // Measure
        // Layout
        // Draw
    }
    
    // 3. 输入处理
    fun analyzeInput() {
        // Touch 事件
        // 处理延迟
    }
}
```

### Systrace 优化

```kotlin
// 使用 Systrace 标记
class SystraceMarker {
    fun traceSection(name: String, block: () -> Unit) {
        android.util.Trace.beginSection(name)
        try {
            block()
        } finally {
            android.util.Trace.endSection()
        }
    }
    
    fun traceViewMeasure(view: View) {
        traceSection("Measure_${view.javaClass.simpleName}") {
            // 测量逻辑
        }
    }
}
```

---

## Custom View 性能追踪

### View 性能追踪

```kotlin
class CustomViewPerformanceTracer {
    // 1. Measure 追踪
    fun traceMeasure(view: View) {
        Trace.beginSection("Measure_${view.javaClass.simpleName}")
        try {
            // Measure 逻辑
        } finally {
            Trace.endSection()
        }
    }
    
    // 2. Layout 追踪
    fun traceLayout(view: View) {
        Trace.beginSection("Layout_${view.javaClass.simpleName}")
        try {
            // Layout 逻辑
        } finally {
            Trace.endSection()
        }
    }
    
    // 3. Draw 追踪
    fun traceDraw(view: View) {
        Trace.beginSection("Draw_${view.javaClass.simpleName}")
        try {
            // Draw 逻辑
        } finally {
            Trace.endSection()
        }
    }
}
```

### 性能指标收集

```kotlin
class ViewPerformanceMetrics {
    private val measureTimes = mutableListOf<Long>()
    private val layoutTimes = mutableListOf<Long>()
    private val drawTimes = mutableListOf<Long>()
    
    fun recordMeasureTime(time: Long) {
        measureTimes.add(time)
    }
    
    fun recordLayoutTime(time: Long) {
        layoutTimes.add(time)
    }
    
    fun recordDrawTime(time: Long) {
        drawTimes.add(time)
    }
    
    fun analyze() {
        // 平均 Measure 时间
        val avgMeasure = measureTimes.average()
        
        // 平均 Layout 时间
        val avgLayout = layoutTimes.average()
        
        // 平均 Draw 时间
        val avgDraw = drawTimes.average()
        
        // 告警
        if (avgDraw > 5) {
            Log.w("Performance", "Draw time too long: $avgDraw ms")
        }
    }
}
```

---

## 面试考点

### 基础考点

#### 1. Android Profiler 使用

**问题**: 如何使用 Android Profiler 分析内存泄漏？

**回答**:
- 打开 App Profiler
- 点击 Memory 标签
- 触发 GC
- Dump Heap 分析
- 查看引用链

#### 2. CPU 分析

**问题**: 如何识别 CPU 瓶颈？

**回答**:
- 使用火焰图
- 查看 Self Time
- 分析热点方法
- 使用 Trace 标记

#### 3. 内存分析

**问题**: 如何检测内存泄漏？

**回答**:
- 使用 Dump Heap
- 查看对象引用
- 使用 LeakCanary
- 分析 hprof 文件

### 进阶考点

#### 1. Perfetto 使用

**问题**: Perfetto 相比 Systrace 的优势？

**回答**:
- 更低的开销
- 更全面的追踪
- 更好的可视化
- 支持更多类别

#### 2. Systrace 分析

**问题**: 如何使用 Systrace 分析掉帧？

**回答**:
- 查看 Choreographer
- 分析 Draw 时间
- 检查 GPU 活动
- 识别阻塞操作

#### 3. 性能追踪

**问题**: 如何追踪 Custom View 性能？

**回答**:
- 使用 Trace 标记
- 记录时间戳
- 分析性能指标
- 使用 Profiler

### 高级考点

#### 1. 综合分析

**问题**: 如何综合使用各种工具？

**回答**:
- Profiler 日常分析
- Perfetto 深度分析
- Systrace 渲染分析
- 结合使用

#### 2. 性能监控

**问题**: 如何实现持续性能监控？

**回答**:
- 集成性能埋点
- 使用 APM 工具
- 定期分析
- 设置告警

---

## 工具使用指南

### Android Profiler 使用步骤

```
1. 连接设备或启动模拟器
2. Run → Profile APK
3. 等待连接成功
4. 选择要分析的模块
5. 开始记录
6. 执行操作
7. 停止记录
8. 分析结果
```

### Perfetto 使用步骤

```
1. 安装 Perfetto
2. 配置追踪类别
3. 开始追踪
4. 执行操作
5. 导出 trace 文件
6. 在 ui.perfetto.dev 打开
7. 分析结果
```

### Systrace 使用步骤

```
1. 安装 systrace 工具
2. 设置追踪类别
3. 运行命令捕获 trace
4. 打开生成的 HTML
5. 分析火焰图
```

### 常用命令

```bash
# Android Profiler
# 通过 Android Studio 图形界面使用

# Perfetto
perfetto --config android.config --duration=30
perfetto-query --trace-file=trace.pb --output=trace.json

# Systrace
python -m systrace.systrace --time 10 --output trace.html
```

---

## 总结

性能分析工具是优化 Android 应用的必备工具。通过 Android Profiler、Perfetto、Systrace 等工具，可以全面了解应用的性能状况，快速定位问题并进行优化。

### 关键要点

1. **Android Profiler**：日常性能分析
2. **CPU 分析**：识别热点方法
3. **内存分析**：检测内存泄漏
4. **网络分析**：优化网络请求
5. **能源分析**：降低电量消耗
6. **Perfetto**：系统级追踪
7. **Systrace**：渲染分析
8. **Custom View 追踪**：自定义性能监控

### 性能分析流程

```
1. 发现问题 → 使用 Profiler 检测
2. 定位问题 → 使用 Perfetto/Systrace 深入分析
3. 验证优化 → 对比优化前后的数据
4. 持续监控 → 集成性能埋点
```

### 工具选择建议

| 场景 | 推荐工具 |
|-----|---------|
| 日常开发 | Android Profiler |
| 内存泄漏 | Profiler + LeakCanary |
| 掉帧分析 | Systrace + Perfetto |
| 网络优化 | Network Profiler |
| 电量优化 | Energy Profiler |
| 深度分析 | Perfetto |

通过合理使用这些工具，可以显著提升应用性能，改善用户体验。
