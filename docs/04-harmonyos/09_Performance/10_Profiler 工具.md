# Profiler 工具

> DevEco Studio Profiler 全链路性能分析：CPU、内存、网络、渲染、电量。

---

## 1. Profiler 概述

### 1.1 Profiler 面板

```
DevEco Studio Profiler
├─ CPU Profile（CPU 分析）
├─ Memory Profile（内存分析）
├─ Network Profile（网络分析）
├─ Battery / Power（电量分析）
├─ FPS / Render（渲染分析）
└─ Startup Analysis（启动分析）
```

### 1.2 使用方式

```
1. 打开 DevEco Studio → Profiler 面板
2. 选择目标设备/模拟器
3. 点击 Record 开始采集
4. 执行应用操作（模拟场景）
5. 点击 Stop 停止采集
6. 分析数据，定位问题
```

---

## 2. CPU Profile

### 2.1 CPU 分析

```
CPU Profile 信息：
├─ CPU 使用率趋势图
├─ 方法调用火焰图（火焰图）
├─ 方法耗时排行
└─ 线程调度信息
```

### 2.2 火焰图分析

```
火焰图（Flame Graph）：
├─ 横轴：调用占比
├─ 纵轴：调用栈深度
├─ 最宽 = 耗时最多
└─ 最上层 = 入口方法

使用场景：
├─ 定位耗时方法
├─ 发现递归/循环瓶颈
└─ 分析 CPU 热点
```

### 2.3 CPU 优化建议

```
CPU 优化：
├─ 减少主线程工作
├─ 避免循环中的对象创建
├─ 使用缓存减少重复计算
├─ 异步化耗时任务
└─ 使用 TaskPool 分配任务
```

---

## 3. Memory Profile

### 3.1 内存分析

```
Memory Profile 信息：
├─ 内存趋势图（总内存/堆内存/原生内存）
├─ Heap Snapshot（堆快照）
├─ 对象分配排行
├─ 内存泄漏检测
└─ GC 日志
```

### 3.2 Heap Snapshot 使用

```
Heap Snapshot 使用流程：
1. 执行特定操作（如打开页面）
2. 拍摄 Heap Snapshot
3. 再次执行操作
4. 再拍摄 Heap Snapshot
5. 对比两次快照，查看新增对象
6. 定位泄漏对象
```

### 3.3 内存泄漏检测

```typescript
// 常见泄漏点 & Profiler 确认
class BadClass {
    private static instance: BadClass
    private largeData: any = new ArrayBuffer(10 * 1024 * 1024)

    // 泄漏原因：
    // 1. static 持有实例
    // 2. 大对象未释放
    // 3. 事件监听未移除
}

// Profiler 确认：
// - Heap Snapshot 中 largeData 持续增长
// - GC 无法回收
// - 内存趋势持续上升
```

---

## 4. Network Profile

### 4.1 网络分析

```
Network Profile 信息：
├─ 所有 HTTP/WebSocket 请求
├─ 请求耗时（连接/TTFB/响应）
├─ 请求/响应大小
├─ 请求频率统计
└─ 网络类型（WiFi/4G/5G）
```

### 4.2 网络优化建议

```
Network Profile 优化建议：
├─ 请求过多 → 合并/批量
├─ TTFB 过长 → CDN/缓存
├─ 响应过大 → gzip 压缩
├─ 请求失败 → 重试/降级
└─ 重复请求 → 去重/缓存
```

---

## 5. Battery / Power

### 5.1 电量分析

```
Power Profile 信息：
├─ 电量消耗趋势
├─ 各模块耗电排行
├─ CPU/网络/屏幕耗电占比
└─ 功耗分析（待机/使用中）
```

### 5.2 省电建议

```
Power Profile 优化建议：
├─ 网络模块耗电高 → 批量请求/缓存
├─ GPS 模块耗电高 → 降低定位频率
├─ CPU 模块耗电高 → 减少计算/异步化
├─ 屏幕模块耗电高 → 降低亮度/缩短超时
└─ 后台模块耗电高 → 减少后台任务
```

---

## 6. FPS / Render

### 6.1 渲染分析

```
Render Profile 信息：
├─ FPS 趋势图
├─ 每帧耗时（Layout/DRAW/GPU）
├─ 掉帧标记
└─ 渲染阻塞检测
```

---

## 7. Startup Analysis

### 7.1 启动分析

```
Startup Analysis 信息：
├─ 启动时间线
├─ 各阶段耗时（进程创建→首屏）
├─ 热启动/冷启动对比
└─ 启动阻塞检测
```

---

## 8. 面试高频考点

### Q1: Profiler 工具有哪些？

**回答**：DevEco Studio Profiler 包含 CPU、内存、网络、电池、FPS、启动分析。每个面板有特定用途。

### Q2: 如何用 Profiler 找内存泄漏？

**回答**：执行操作前后各拍一次 Heap Snapshot，对比两次快照查看新增对象，定位未释放的对象。

---

> 🐱 **小猫提示**：Profiler 记住 **"CPU/内存/网络/电池/FPS/启动 六大面板、Heap Snapshot 对比较、火焰图找 CPU 热点"**。
