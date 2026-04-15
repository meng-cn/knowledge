# Android Studio 调试技巧

> **字数统计：约 7000 字**  
> **难度等级：⭐⭐⭐**  
> **面试重要度：⭐⭐⭐**

---

## 目录

1. [调试器基础](#1-调试器基础)
2. [断点技巧](#2-断点技巧)
3. [变量查看](#3-变量查看)
4. [高级调试](#4-高级调试)
5. [性能分析](#5-性能分析)
6. [面试考点](#6-面试考点)

---

## 1. 调试器基础

### 1.1 启动调试

```
启动方式：
1. Debug 按钮（绿色虫子图标）
2. Run → Debug 'app'
3. Shift + F9
4. 命令行：adb shell am set-debug-app
```

### 1.2 调试窗口

```
调试窗口组成：
- Debugger - 线程和栈帧
- Variables - 变量值
- Console - 输出日志
- Watches - 监控表达式
- Breakpoints - 断点列表
```

---

## 2. 断点技巧

### 2.1 基础断点

```kotlin
// 点击行号左侧添加断点
fun loadData() {
    // 断点
    val data = repository.getData()
    updateUI(data)
}
```

### 2.2 条件断点

```kotlin
// 右键断点 → 设置条件
fun processItems(items: List<Item>) {
    for (item in items) {
        // 条件断点：item.id == 5
        process(item)
    }
}

// 条件示例：
// item.id == 5
// count > 10
// name.startsWith("A")
```

### 2.3 异常断点

```
添加异常断点：
1. View → Breakpoints
2. 点击 + → Java Exception Breakpoint
3. 输入异常类名：NullPointerException

常用异常：
- NullPointerException
- IllegalArgumentException
- IndexOutOfBoundsException
- ClassCastException
```

### 2.4 方法断点

```kotlin
// 在方法签名处设置断点
fun loadData() {  // 方法断点
    // 进入方法时暂停
}

// 右键断点 → 选择 Method Entry/Exit
```

### 2.5 日志断点

```kotlin
// 右键断点 → 移除勾选"Suspend"
// 在"Log"中输入日志消息
// 格式：Data loaded: ${data.size}

// 不暂停程序，只记录日志
fun loadData() {
    val data = repository.getData()  // 日志断点
    updateUI(data)
}
```

---

## 3. 变量查看

### 3.1 查看变量

```
查看方式：
1. Variables 窗口
2. 鼠标悬停
3. Evaluate Expression (Alt+F8)
4. Watches 窗口
```

### 3.2 表达式求值

```kotlin
// Alt+F8 打开 Evaluate Expression

// 计算表达式
data.size
user.name.toUpperCase()

// 调用方法
repository.getUser(1)
data.filter { it.id > 0 }

// 修改变量值
count = 10
user.name = "New Name"
```

### 3.3 监控表达式

```
添加 Watch：
1. 右键变量 → Add to Watches
2. Watches 窗口点击 +

常用监控：
- data.size
- user?.name
- count > 10
- list.isEmpty()
```

### 3.4 对象查看

```kotlin
// 查看对象详情
val user = User(1, "admin")

// 查看字段
user.id
user.name

// 查看集合
list[0]
map["key"]

// 查看流
stream.toList()
```

---

## 4. 高级调试

### 4.1 多线程调试

```kotlin
// 查看所有线程
// Debugger 窗口显示所有线程

// 切换线程
// 点击不同线程查看其栈帧

// 线程特定断点
// 右键断点 → Condition → Thread
```

### 4.2 协程调试

```kotlin
// 启用协程调试
// Settings → Build → Debugger → Koroutines

// 查看协程栈
// Debugger 窗口显示协程信息

// 协程断点
suspend fun loadData() {
    // 断点
    val data = withContext(Dispatchers.IO) {
        repository.getData()
    }
}
```

### 4.3 热修复

```
使用 Apply Changes：
1. 修改代码
2. 点击 Apply Changes 按钮
3. 选择模式：
   - Run App - 完全重启
   - Apply Changes and Restart Activity
   - Apply Changes and Restart
   - Apply Code Changes - 仅代码
```

### 4.4 条件日志

```kotlin
// 使用 Timber 条件日志
class DebugLogging {
    
    fun debug() {
        if (BuildConfig.DEBUG) {
            Timber.d("Debug message")
        }
    }
    
    fun tree() {
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
    }
}
```

---

## 5. 性能分析

### 5.1 Android Profiler

```
打开方式：
View → Tool Windows → Profiler

分析内容：
- CPU - 处理器使用
- Memory - 内存使用
- Energy - 电量消耗
- Network - 网络流量
```

### 5.2 内存分析

```
Memory Profiler：
1. 查看内存使用
2. 捕获堆转储
3. 分析内存泄漏
4. 查看对象分配

步骤：
1. 点击 Record
2. 执行操作
3. 停止记录
4. 分析结果
```

### 5.3 CPU 分析

```
CPU Profiler：
1. 查看 CPU 使用率
2. 捕获方法追踪
3. 分析性能瓶颈

追踪类型：
- Sampled - 采样，低开销
- Traced - 追踪，详细
```

### 5.4 网络分析

```
Network Profiler：
1. 查看网络请求
2. 分析请求大小
3. 查看响应时间
4. 检查请求内容
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: 如何设置断点？**

```
答案要点：
- 点击行号左侧
- 右键设置条件
- 可以设置日志断点
```

**Q2: 什么是条件断点？**

```
答案要点：
- 满足条件时才暂停
- 减少不必要的暂停
- 提高调试效率
```

### 6.2 实战问题

**Q3: 如何调试协程？**

```kotlin
// 启用协程调试
// Settings → Debugger → Koroutines

// 查看协程栈
// Debugger 窗口显示协程信息

suspend fun debug() {
    // 可以正常设置断点
    val result = withContext(Dispatchers.IO) {
        fetchData()
    }
}
```

**Q4: 如何分析内存泄漏？**

```
答案要点：
1. 打开 Memory Profiler
2. 捕获堆转储
3. 分析对象引用
4. 查找泄漏路径
5. 使用 LeakCanary 辅助
```

---

## 参考资料

- [Android Studio Debugger](https://developer.android.com/studio/debug)
- [Android Profiler](https://developer.android.com/studio/profile)

---

*本文完，感谢阅读！*
