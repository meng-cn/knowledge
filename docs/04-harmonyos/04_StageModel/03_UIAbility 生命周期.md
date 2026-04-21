# UIAbility 生命周期

> 详细解析 UIAbility 的完整生命周期及触发时机，是鸿蒙面试的高频考点。

---

## 1. UIAbility 完整生命周期

```
UIAbility 生命周期事件流：

1. onCreate(want)          → 创建（系统调用，初始化）
2. onWindowStageCreate     → 窗口创建（加载页面）
3. onForeground()          → 进入前台（激活）
4. onBackground()          → 进入后台（暂停）
5. onForeground()          → 重新进入前台
6. onWindowStageDestroy()  → 窗口销毁
7. onDestroy()             → 销毁（清理）
```

---

## 2. 各阶段详细解析

### 2.1 onCreate(want) — 创建

```typescript
onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    console.log('UIAbility onCreate')
    
    // 1. 初始化全局变量
    this.initResources()
    
    // 2. 读取 want 中的参数
    if (want.parameters) {
        this.userId = want.parameters['userId'] as string
        this.fromPage = want.parameters['fromPage'] as string
    }
    
    // 3. 初始化第三方 SDK
    // this.initSDK()
    
    // 注意：这里不适合做耗时操作
}
```

**触发时机**：
- 首次创建 UIAbility 实例
- 冷启动时
- 系统回收后恢复

---

### 2.2 onWindowStageCreate — 窗口阶段创建

```typescript
onWindowStageCreate(windowStage: window.WindowStage): void {
    console.log('UIAbility onWindowStageCreate')
    
    // 1. 加载主页面
    windowStage.loadContent('pages/Index', (err) => {
        if (err.code) {
            console.error('loadContent failed:', err.message)
            return
        }
        console.log('loadContent success')
    })
    
    // 2. 配置窗口属性
    let window = windowStage.getMainWindow()
    window.setWindowLayoutFullScreen(true)  // 全屏
}
```

**触发时机**：
- UIAbility 创建后首次窗口创建
- 窗口重新创建（如屏幕旋转）
- 多窗口模式下新窗口创建

---

### 2.3 onForeground — 进入前台

```typescript
onForeground(): void {
    console.log('UIAbility onForeground')
    
    // 应用进入前台时的逻辑：
    // 1. 刷新 UI 数据
    this.refreshData()
    
    // 2. 恢复任务（如音乐、视频）
    this.resumeTask()
    
    // 3. 重新申请权限
    this.requestPermissions()
}
```

**触发时机**：
- 应用从后台回到前台
- 从其他应用切回
- 分屏模式激活

---

### 2.4 onBackground — 进入后台

```typescript
onBackground(): void {
    console.log('UIAbility onBackground')
    
    // 应用进入后台时的逻辑：
    // 1. 保存当前状态
    this.saveState()
    
    // 2. 暂停后台任务
    this.pauseTask()
    
    // 3. 释放不必要资源
    this.releaseResources()
}
```

**触发时机**：
- 用户按下 Home 键
- 切换到其他应用
- 屏幕锁屏

---

### 2.5 onWindowStageDestroy — 窗口阶段销毁

```typescript
onWindowStageDestroy(): void {
    console.log('UIAbility onWindowStageDestroy')
    
    // 清理窗口相关资源
    // 1. 取消监听
    this.windowStage = null
}
```

**触发时机**：
- 窗口被销毁（如折叠屏展开/收起）
- 应用退出

---

### 2.6 onDestroy — 销毁

```typescript
onDestroy(): void {
    console.log('UIAbility onDestroy')
    
    // 清理所有资源
    // 1. 取消订阅
    this.unsubscribe()
    
    // 2. 关闭连接
    this.closeConnection()
    
    // 3. 清理缓存
    this.clearCache()
}
```

**触发时机**：
- 应用完全退出
- 系统回收 UIAbility
- 调用 terminateSelf()

---

## 3. 生命周期触发示例

### 3.1 应用启动

```
用户点击应用图标
    → onCreate()
    → onWindowStageCreate()
    → onForeground()
    ↓
用户看到首页
```

### 3.2 应用切换到后台

```
用户按 Home 键
    → onBackground()
    ↓
应用后台运行（可能被系统回收）
```

### 3.3 应用回到前台

```
用户再次打开应用
    → onForeground()
    ↓
用户看到应用
```

### 3.4 应用退出

```
用户长按关闭 / Home 键滑掉
    → onWindowStageDestroy()
    → onDestroy()
    ↓
应用进程可能还在（系统管理）
```

---

## 4. 生命周期管理最佳实践

### 4.1 内存泄漏防护

```typescript
@Component
struct MyPage {
    private timerId: number = -1

    aboutToAppear() {
        this.timerId = setInterval(() => {
            // 执行定时任务
        }, 1000)
    }

    aboutToDisappear() {
        // 清理定时器，防止内存泄漏
        if (this.timerId >= 0) {
            clearInterval(this.timerId)
        }
    }
}
```

### 4.2 状态保存与恢复

```typescript
@Entry
@Component
struct Index {
    @State currentPage: number = 0
    @State scrollOffset: number = 0
    @State searchText: string = ''

    // 保存状态
    onSaveState(prefs: PersistentStorage): void {
        prefs.set('currentPage', this.currentPage)
        prefs.set('scrollOffset', this.scrollOffset)
        prefs.set('searchText', this.searchText)
    }

    // 恢复状态
    onRestoreState(prefs: PersistentStorage): void {
        this.currentPage = prefs.get<number>('currentPage') ?? 0
        this.scrollOffset = prefs.get<number>('scrollOffset') ?? 0
        this.searchText = prefs.get<string>('searchText') ?? ''
    }

    build() {
        // ...
    }
}
```

### 4.3 后台任务保活

```typescript
// 在 onBackground 中申请后台模式
onBackground(): void {
    let backgroundTask = context.startBackgroundTask()
    if (backgroundTask) {
        // 执行后台任务
        backgroundTask.end()
    }
}
```

---

## 5. 生命周期对比：Android vs HarmonyOS

| Android Activity | HarmonyOS UIAbility | 说明 |
|---|-|-|
| onCreate | onCreate + onWindowStageCreate | 创建 + 窗口创建 |
| onStart | - | 无直接对应 |
| onResume | onForeground | 进入前台 |
| onPause | onBackground | 进入后台 |
| onStop | onBackground | 进入后台 |
| onDestroy | onDestroy | 销毁 |
| onRestart | - | 无直接对应 |

---

## 6. 面试高频考点

### Q1: UIAbility 的生命周期方法？

**回答**：onCreate（创建）→ onWindowStageCreate（窗口创建）→ onForeground（前台）→ onBackground（后台）→ onWindowStageDestroy（窗口销毁）→ onDestroy（销毁）。

### Q2: onForeground 和 onBackground 的作用？

**回答**：onForeground 是应用回到前台时触发，用于刷新数据、恢复任务；onBackground 是应用进入后台时触发，用于保存状态、暂停任务。

### Q3: 如何在 UIAbility 间传递数据？

**回答**：通过 Want 对象的 parameters 属性传递参数。

---

> 🐱 **小猫提示**：UIAbility 生命周期记住 **"创建→窗口→前台→后台→销毁"**。onForeground/onBackground 是区分前台/后台状态的关键。
