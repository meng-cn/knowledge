# 03_AMS_PMS_WMS

> **核心摘要**：AMS、PMS、WMS 是 Android 系统最核心的三大服务，分别负责应用生命周期管理、包管理和窗口管理。理解这三大服务是理解 Android 系统架构的关键。

---

## 一、三大服务概述

### 1.1 服务架构位置

```
┌─────────────────────────────────────────────────────────────┐
│                      SystemServer 进程                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           ActivityManagerService (AMS)              │    │
│  │  - 应用进程管理                                      │    │
│  │  - Activity/Service/Broadcast 管理                   │    │
│  │  - 任务栈管理                                        │    │
│  │  - 进程优先级管理                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          PackageManagerService (PMS)                │    │
│  │  - APK 解析和安装                                    │    │
│  │  - 组件信息收集                                      │    │
│  │  - 权限管理                                          │    │
│  │  - 签名验证                                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           WindowManagerService (WMS)                │    │
│  │  - 窗口管理                                          │    │
│  │  - 表面管理                                          │    │
│  │  - 输入事件分发                                      │    │
│  │  - 动画管理                                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              其他系统服务                            │    │
│  │  PowerManagerService, InputManagerService...        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ App 进程 1 │    │ App 进程 2 │    │ App 进程 3 │
    └──────────┘    └──────────┘    └──────────┘
```

### 1.2 三大服务的关系

```
┌─────────────────────────────────────────────────────────────┐
│                    三大服务协作关系                          │
└─────────────────────────────────────────────────────────────┘

启动 App 流程：

  ┌─────────┐      ┌─────────┐      ┌─────────┐
  │   PMS   │ ────>│   AMS   │ ────>│   WMS   │
  └─────────┘      └─────────┘      └─────────┘
       │                │                │
       │                │                │
       ▼                ▼                ▼
  解析 APK          创建进程          创建窗口
  获取组件信息       启动 Activity      显示界面
  检查权限          管理生命周期       处理输入

详细流程：

1. PMS 阶段：
   - 解析 AndroidManifest.xml
   - 收集 Activity/Service/BroadcastReceiver 信息
   - 检查权限声明
   - 验证签名

2. AMS 阶段：
   - 接收 startActivity 请求
   - 检查目标 Activity 是否存在（查询 PMS）
   - 决定是否需要创建新进程
   - 创建/复用进程
   - 调度 Activity 生命周期

3. WMS 阶段：
   - 接收 addWindow 请求
   - 创建 Surface
   - 管理窗口层级
   - 分发输入事件
```

### 1.3 服务对比表

| 特性 | AMS | PMS | WMS |
|------|-----|-----|-----|
| 全称 | ActivityManagerService | PackageManagerService | WindowManagerService |
| 核心职责 | 应用生命周期管理 | 包管理 | 窗口管理 |
| 主要接口 | IActivityManager | IPackageManager | IWindowManager |
| 服务对象 | Activity/Service/Process | APK/Component/Permission | Window/Surface/Input |
| 启动阶段 | Bootstrap | Bootstrap | Other |
| 依赖服务 | PMS | 无 | AMS、DisplayManager |
| Binder 调用频率 | 极高 | 中等 | 高 |

---

## 二、ActivityManagerService (AMS)

### 2.1 AMS 职责概述

AMS 是 Android 系统最核心的服务，负责管理所有应用进程和组件的生命周期。

**核心职责**：
1. **进程管理**：创建、销毁、回收应用进程
2. **Activity 管理**：管理 Activity 栈和生命周期
3. **Service 管理**：管理 Service 的启动和绑定
4. **Broadcast 管理**：管理和分发系统广播
5. **ContentProvider 管理**：管理 ContentProvider 的发布和访问
6. **任务栈管理**：管理 Task 和返回栈
7. **优先级管理**：管理进程优先级和 OOM 调整
8. **权限检查**：检查组件访问权限

### 2.2 AMS 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    ActivityManagerService                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ActivityStackSupervisor                │    │
│  │  - 管理所有 Activity 栈                              │    │
│  │  - 调度 Activity 启动和生命周期                      │    │
│  │  - 处理 Task 栈操作                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                    │                             │
│           ▼                    ▼                             │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │  ActivityStack  │  │  ActivityStack  │                    │
│  │  (Home Stack)   │  │  (App Stack)    │                    │
│  │  ┌───────────┐  │  │  ┌───────────┐  │                    │
│  │  │ Activity  │  │  │  │ Activity  │  │                    │
│  │  │ Record    │  │  │  │ Record    │  │                    │
│  │  └───────────┘  │  │  └───────────┘  │                    │
│  └─────────────────┘  └─────────────────┘                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                ProcessRecord 管理                    │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │  Process  │  │  Process  │  │  Process  │        │    │
│  │  │  Record   │  │  Record   │  │  Record   │        │    │
│  │  │ (App 1)   │  │ (App 2)   │  │ (System)  │        │    │
│  │  └───────────┘  └───────────┘  └───────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ServiceRecord 管理                      │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │  Service  │  │  Service  │  │  Service  │        │    │
│  │  │  Record   │  │  Record   │  │  Record   │        │    │
│  │  └───────────┘  └───────────┘  └───────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Broadcast 队列和分发                       │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │  Parallel │  │  Ordered  │  │  Sticky   │        │    │
│  │  │  Queue    │  │  Queue    │  │  Queue    │        │    │
│  │  └───────────┘  └───────────┘  └───────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Activity 启动流程源码分析

#### 2.3.1 应用侧发起启动

```java
// frameworks/base/core/java/android/app/Activity.java

@Override
public void startActivity(Intent intent) {
    this.startActivity(intent, null);
}

@Override
public void startActivity(Intent intent, @Nullable Bundle options) {
    if (options != null) {
        startActivityForResult(intent, -1, options);
    } else {
        startActivityForResult(intent, -1);
    }
}

@Override
public void startActivityForResult(Intent intent, int requestCode,
        @Nullable Bundle options) {
    // 1. 获取 Instrumentation
    Instrumentation.ActivityResult ar = 
        mInstrumentation.execStartActivity(
            this, mMainThread.getApplicationThread(), mToken,
            this, intent, requestCode, options);
    
    // 2. 处理结果
    if (ar != null) {
        mMainThread.sendActivityResult(mToken, mEmbeddedID,
            requestCode, RESULT_CANCELED, null);
    }
}
```

#### 2.3.2 Instrumentation 层

```java
// frameworks/base/core/java/android/app/Instrumentation.java

public ActivityResult execStartActivity(Context who, IBinder contextThread,
        IBinder token, Activity target, Intent intent, int requestCode,
        Bundle options) {
    
    // 1. 准备 Intent
    if (mActivityMonitors != null) {
        // 监控逻辑
    }
    
    try {
        intent.migrateExtraStreamToClipData();
        intent.prepareToLeaveProcess(who);
        
        // 2. 通过 Binder 调用 AMS
        int result = ActivityManager.getService().startActivity(
            new Intent(intent),
            intent.resolveTypeIfNeeded(who.getContentResolver()),
            token,
            target != null ? target.mEmbeddedID : null,
            requestCode,
            0, null, options);
        
        // 3. 检查启动结果
        checkStartActivityResult(result, intent);
    } catch (RemoteException e) {
        throw new RuntimeException("Failure from system", e);
    }
    
    return null;
}
```

#### 2.3.3 AMS 侧处理

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java

@Override
public final int startActivity(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho,
        int requestCode, int startFlags, ProfilerInfo profilerInfo, Bundle options) {
    
    // 1. 调用内部方法
    return startActivityAsUser(caller, callingPackage, intent, resolvedType,
        resultTo, resultWho, requestCode, startFlags, profilerInfo, options,
        UserHandle.getCallingUserId());
}

@Override
int startActivityAsUser(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho,
        int requestCode, int startFlags, ProfilerInfo profilerInfo, Bundle options,
        int userId) {
    
    // 2. 验证调用者身份
    enforceNotIsolatedCaller("startActivity");
    
    // 3. 获取调用者进程记录
    ProcessRecord callerApp = getRecordForAppLOSP(caller);
    
    // 4. 委托给 ActivityStackSupervisor
    return mActivityStackSupervisor.startActivityMayWait(caller, -1, callingPackage,
        intent, resolvedType, null, null, resultTo, resultWho, requestCode,
        startFlags, profilerInfo, null, null, options, false, userId,
        null, "startActivityAsUser");
}
```

#### 2.3.4 ActivityStackSupervisor 处理

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityStackSupervisor.java

int startActivityMayWait(IApplicationThread caller, int callingUid,
        String callingPackage, Intent intent, String resolvedType,
        IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
        IBinder resultTo, String resultWho, int requestCode, int startFlags,
        ProfilerInfo profilerInfo, WaitResult outResult, Bundle options,
        boolean componentOnly, int userId, IActivityContainer iContainer,
        TaskRecord inTask, String reason) {
    
    // 1. 验证 Intent
    intent = verifyActivityIntent(intent);
    
    // 2. 收集组件信息
    ActivityInfo aInfo = resolveActivity(intent, userId);
    
    // 3. 创建 ActivityRecord
    ActivityRecord r = new ActivityRecord(mService, callerApp, callingUid,
        callingPackage, intent, resolvedType, aInfo, mService.getGlobalConfiguration(),
        resultTo, resultWho, requestCode, componentOnly, this, container, options);
    
    // 4. 启动 Activity
    return startActivityUnchecked(r, sourceRecord, voiceSession, voiceInteractor,
        startFlags, true, options, inTask);
}
```

#### 2.3.5 完整启动流程图

```
┌─────────────────────────────────────────────────────────────┐
│                  Activity 启动完整流程                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Activity.startActivity(intent)                          │
│     └─> Instrumentation.execStartActivity()                 │
│                                                             │
│  2. Binder 跨进程调用                                       │
│     └─> ActivityManager.getService().startActivity()        │
│                                                             │
│  3. AMS.startActivityAsUser()                               │
│     ├─> 验证调用者身份                                      │
│     ├─> 获取调用者进程记录                                  │
│     └─> 委托给 ActivityStackSupervisor                      │
│                                                             │
│  4. ActivityStackSupervisor.startActivityMayWait()          │
│     ├─> 解析 ActivityInfo（查询 PMS）                       │
│     ├─> 创建 ActivityRecord                                 │
│     └─> startActivityUnchecked()                            │
│                                                             │
│  5. ActivityStack.startActivityUnchecked()                  │
│     ├─> 计算启动标志                                        │
│     ├─> 决定启动模式（standard/singleTop/singleTask/...）   │
│     ├─> 决定目标 Task 栈                                    │
│     └─> startActivityLocked()                               │
│                                                             │
│  6. ActivityStackSupervisor.realStartActivityLocked()       │
│     ├─> 检查进程是否存在                                    │
│     ├─> 进程不存在：创建新进程                              │
│     └─> 进程存在：发送 H 消息调度启动                       │
│                                                             │
│  7. 应用进程侧处理                                          │
│     ├─> ActivityThread.scheduleLaunchActivity()             │
│     ├─> H 消息处理                                          │
│     ├─> Activity.performCreate()                            │
│     ├─> Activity.onCreate()                                 │
│     ├─> Activity.onStart()                                  │
│     └─> Activity.onResume()                                 │
│                                                             │
│  8. WMS 侧处理                                              │
│     ├─> ViewRootImpl.setView()                              │
│     ├─> WMS.addWindow()                                     │
│     └─> SurfaceFlinger 合成显示                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 进程管理

#### 2.4.1 ProcessRecord

```java
// frameworks/base/services/core/java/com/android/server/am/ProcessRecord.java

final class ProcessRecord {
    // 进程信息
    final ActivityInfo info;          // 应用信息
    final String processName;         // 进程名
    final int uid;                    // UID
    final int pid;                    // PID
    
    // 组件列表
    final ArraySet<ActivityRecord> activities = new ArraySet<>();
    final ArraySet<ServiceRecord> services = new ArraySet<>();
    final ArraySet<BroadcastRecord> receivers = new ArraySet<>();
    final ArraySet<ContentProviderRecord> providers = new ArraySet<>();
    
    // 进程状态
    int setAdj;                       // 当前 OOM 调整值
    int curAdj;                       // 缓存的 OOM 调整值
    boolean killed;                   // 是否被杀死
    boolean killedByAm;               // 是否被 AMS 杀死
    
    // 内存信息
    long lastPss;                     // 上次 PSS 值
    long lastSwapPss;                 // 上次 Swap PSS 值
    
    // 时间信息
    long lastActivityTime;            // 上次活动时间
    long lastStateChangeTime;         // 上次状态改变时间
}
```

#### 2.4.2 进程创建流程

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java

final ProcessRecord startProcessLocked(String processName,
        ApplicationInfo info, boolean knownToBeDead, int intentFlags,
        boolean hostingRecord, boolean allowWhileBooting, boolean isolated,
        int isolatedUid, boolean keepIfLarge, String abiOverride,
        String entryPoint, String[] entryPointArgs, Runnable crashHandler) {
    
    // 1. 检查进程是否已存在
    ProcessRecord app = getProcessRecordLocked(processName, info.uid, keepIfLarge);
    
    if (app != null && app.pid > 0) {
        // 进程已存在
        if (!knownToBeDead) {
            return app;
        }
    }
    
    // 2. 创建 ProcessRecord
    if (app == null) {
        app = newProcessRecordLocked(info, processName, isolated, isolatedUid);
    }
    
    // 3. 启动进程
    startProcessLocked(app, hostingRecord, abiOverride, entryPoint, entryPointArgs);
    
    return app.mPendingStart ? null : app;
}

private final void startProcessLocked(ProcessRecord app, String hostingRecord,
        String abiOverride, String entryPoint, String[] entryPointArgs) {
    
    // 1. 准备启动参数
    int[] mounts = mProcessCpuTracker.getMounts();
    
    // 2. 调用 Process.start()
    Process.ProcessStartResult startResult = Process.start(entryPoint,
        app.processName, uid, uid, gids, debugFlags, mountExternal,
        app.info.targetSdkVersion, app.seInfo, requiredAbi, instructionSet,
        app.info.dataDir, invokeWith, app.info.packageName, zygotePolicyFlags,
        isTopApp, app.mDisabledCompatChanges, pkgDataInfoMap,
        whitelistedDataInfoMap, bindMountAppsData, bindMountAppStorageDirs,
        new String[] {"PROC_START_SEQUENCE=" + startSeq});
    
    // 3. 记录进程信息
    app.setPid(startResult.pid);
    app.mPendingStart = false;
    app.mKnownToBeDead = false;
    
    // 4. 添加到进程列表
    mProcessNames.put(app.processName, app.uid, app);
    mPidSelfLocked.put(startResult.pid, app);
}
```

```java
// libcore/ojvm/src/main/java/java/lang/Process.java

public static ProcessStartResult start(final String processClass,
        final String niceName, int uid, int gid, int[] gids, int debugFlags,
        int mountExternal, int targetSdkVersion, String seInfo, String abi,
        String instructionSet, String appDataDir, String invokeWith,
        String packageName, long zygotePolicyFlags, boolean isTopApp,
        long disabledCompatChanges, Map<String, Pair<String, Long>> pkgDataInfoMap,
        Map<String, Pair<String, Long>> whitelistedDataInfoMap,
        boolean bindMountAppsData, boolean bindMountAppStorageDirs,
        String[] zygoteArgs) {
    
    // 1. 通过 ZygoteProcess 连接 Zygote
    return zygoteProcess.start(processClass, niceName, uid, gid, gids,
        debugFlags, mountExternal, targetSdkVersion, seInfo, abi, instructionSet,
        appDataDir, invokeWith, packageName, zygotePolicyFlags, isTopApp,
        disabledCompatChanges, pkgDataInfoMap, whitelistedDataInfoMap,
        bindMountAppsData, bindMountAppStorageDirs, zygoteArgs);
}
```

### 2.5 进程优先级和 OOM 调整

#### 2.5.1 进程优先级层级

```
┌─────────────────────────────────────────────────────────────┐
│                    进程优先级层级                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Foreground (0)                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - 用户正在交互的 Activity                           │    │
│  │  - 前台 Service（startForeground()）                 │    │
│  │  - 执行中的 BroadcastReceiver                        │    │
│  │  OOM Adjust: 0                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Visible (1)                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - 可见但不在前台的 Activity（对话框后的 Activity）   │    │
│  │  - 被前台 Activity 绑定的 Service                     │    │
│  │  OOM Adjust: 1                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Perceptible (2)                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - 用户可感知的进程（如播放音乐的后台进程）           │    │
│  │  OOM Adjust: 2                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Foreground Service (3)                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - 前台 Service 但不在活跃状态                        │    │
│  │  OOM Adjust: 3                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Background (4-12)                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - 后台 Activity（用户不可见）                        │    │
│  │  - 后台 Service                                      │    │
│  │  OOM Adjust: 4-12（根据 LRU 顺序）                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Empty (15)                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - 没有任何组件的进程                                │    │
│  │  OOM Adjust: 15                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.5.2 OOM 调整计算

```java
// frameworks/base/services/core/java/com/android/server/am/ProcessList.java

// OOM 调整值常量
public static final int UNKNOWN_ADJ = 16;     // 未知
public static final int CACHED_APP_MAX_ADJ = 15;  // 缓存进程最大值
public static final int CACHED_APP_MIN_ADJ = 9;   // 缓存进程最小值
public static final int SERVICE_B_ADJ = 8;    // 绑定服务 B 类
public static final int PREVIOUS_APP_ADJ = 7; // 上一个应用
public static final int HOME_APP_ADJ = 6;     // Home 应用
public static final int SERVICE_ADJ = 5;      // 服务进程
public static final int HEAVY_WEIGHT_ADJ = 4; // 重量级应用
public static final int BACKUP_APP_ADJ = 3;   // 备份应用
public static final int PERCEPTIBLE_APP_ADJ = 2; // 可感知应用
public static final int VISIBLE_APP_ADJ = 1;  // 可见应用
public static final int FOREGROUND_APP_ADJ = 0; // 前台应用
```

**计算流程**：

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java

final void updateOomAdjLocked(ProcessRecord proc) {
    // 1. 确定进程类型
    int adj = computeOomAdjLocked(proc, ProcessList.UNKNOWN_ADJ, true);
    
    // 2. 应用调整
    proc.setAdj(adj);
    
    // 3. 通知内核
    if (proc.pid != 0 && proc.pid != MY_PID) {
        Process.setOomAdj(proc.pid, proc.adj);
    }
}

private final int computeOomAdjLocked(ProcessRecord proc, int cachedAdj,
        boolean doingAll) {
    
    // 1. 检查是否有前台 Activity
    if (proc.hasForegroundActivity()) {
        return ProcessList.FOREGROUND_APP_ADJ;
    }
    
    // 2. 检查是否可见
    if (proc.hasVisibleActivity()) {
        return ProcessList.VISIBLE_APP_ADJ;
    }
    
    // 3. 检查是否有前台 Service
    if (proc.hasForegroundService()) {
        return ProcessList.PERCEPTIBLE_APP_ADJ;
    }
    
    // 4. 检查是否是备份应用
    if (proc == mBackupTarget) {
        return ProcessList.BACKUP_APP_ADJ;
    }
    
    // 5. 检查 LRU 顺序
    int lruIndex = mLruProcessList.indexOf(proc);
    if (lruIndex >= 0) {
        return ProcessList.CACHED_APP_MIN_ADJ + 
            (lruIndex * (ProcessList.CACHED_APP_MAX_ADJ - ProcessList.CACHED_APP_MIN_ADJ) 
             / mLruProcessList.size());
    }
    
    // 6. 默认：空进程
    return ProcessList.UNKNOWN_ADJ;
}
```

---

## 三、PackageManagerService (PMS)

### 3.1 PMS 职责概述

PMS 负责管理系统中所有已安装的 APK 包，包括解析、安装、卸载、查询等操作。

**核心职责**：
1. **APK 解析**：解析 AndroidManifest.xml，收集组件信息
2. **安装管理**：处理 APK 安装请求，包括系统安装和用户安装
3. **卸载管理**：处理 APK 卸载请求
4. **组件查询**：提供 Activity、Service、BroadcastReceiver、ContentProvider 查询
5. **权限管理**：管理应用权限的授予和撤销
6. **签名验证**：验证 APK 签名的一致性
7. **DEX 优化**：管理 DEX 文件的优化（dex2oat）
8. **共享库管理**：管理系统共享库

### 3.2 PMS 架构

```
┌─────────────────────────────────────────────────────────────┐
│                   PackageManagerService                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PackageParser                          │    │
│  │  - 解析 AndroidManifest.xml                         │    │
│  │  - 收集组件信息（Activity/Service/...）              │    │
│  │  - 解析权限和特性                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PackageSetting 管理                     │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │  Package  │  │  Package  │  │  Package  │        │    │
│  │  │  Setting  │  │  Setting  │  │  Setting  │        │    │
│  │  │ (App 1)   │  │ (App 2)   │  │ (System)  │        │    │
│  │  └───────────┘  └───────────┘  └───────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Installer 通信                          │    │
│  │  - 通过 Socket 与 installd 守护进程通信               │    │
│  │  - 执行 APK 复制、权限设置、DEX 优化等操作            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              权限管理                                │    │
│  │  - BasePermission 管理                              │    │
│  │  - GrantedPermissions 管理                          │    │
│  │  - PermissionTrees 管理                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              应用信息缓存                            │    │
│  │  - mPackages: PackageName → PackageSetting          │    │
│  │  - mSettings: 持久化设置                            │    │
│  │  - mActivities: Activity 查询表                      │    │
│  │  - mServices: Service 查询表                         │    │
│  │  - mReceivers: BroadcastReceiver 查询表              │    │
│  │  - mProviders: ContentProvider 查询表                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 APK 解析流程

#### 3.3.1 PackageParser 解析

```java
// frameworks/base/core/java/android/content/pm/PackageParser.java

public Package parsePackage(File packageFile, int parseFlags)
        throws PackageParserException {
    
    // 1. 验证 APK 文件
    if (!packageFile.isFile()) {
        throw new PackageParserException(INSTALL_PARSE_FAILED_NOT_APK,
            "Package file " + packageFile + " is not a file");
    }
    
    // 2. 打开 APK（ZIP 格式）
    try (ZipFile zipFile = new ZipFile(packageFile)) {
        // 3. 读取 AndroidManifest.xml
        XmlResourceParser parser = openXmlResourceParser(zipFile, "AndroidManifest.xml");
        
        // 4. 解析 Manifest
        Package pkg = parsePackage(parser, parseFlags);
        
        return pkg;
    }
}

private Package parsePackage(XmlResourceParser parser, int flags)
        throws XmlPullParserException, IOException {
    
    // 1. 创建 Package 对象
    Package pkg = new Package();
    
    // 2. 解析根节点
    int type;
    while ((type = parser.next()) != XmlPullParser.END_DOCUMENT) {
        if (type == XmlPullParser.START_TAG) {
            String tagName = parser.getName();
            
            if (tagName.equals("manifest")) {
                // 解析 manifest 属性
                parseManifest(pkg, parser, flags);
            } else if (tagName.equals("application")) {
                // 解析 application 节点
                parseApplication(pkg, parser, flags);
            } else if (tagName.equals("activity")) {
                // 解析 activity 节点
                parseActivity(pkg, parser, flags);
            } else if (tagName.equals("service")) {
                // 解析 service 节点
                parseService(pkg, parser, flags);
            }
            // ... 其他组件
        }
    }
    
    return pkg;
}
```

#### 3.3.2 组件信息收集

```java
// frameworks/base/core/java/android/content/pm/PackageParser.java

private Activity parseActivity(Package owner, Resources res,
        XmlResourceParser parser, int flags, String[] outError) {
    
    // 1. 创建 Activity 对象
    Activity a = new Activity();
    
    // 2. 解析属性
    TypedArray sa = res.obtainAttributes(attrs, R.styleable.AndroidManifestActivity);
    
    a.info.name = sa.getString(R.styleable.AndroidManifestActivity_name);
    a.info.label = sa.getText(R.styleable.AndroidManifestActivity_label);
    a.info.icon = sa.getResourceId(R.styleable.AndroidManifestActivity_icon, 0);
    a.info.enabled = sa.getBoolean(R.styleable.AndroidManifestActivity_enabled, true);
    a.info.exported = sa.getBoolean(R.styleable.AndroidManifestActivity_exported, false);
    a.info.launchMode = sa.getInteger(R.styleable.AndroidManifestActivity_launchMode, 0);
    
    // 3. 解析 intent-filter
    parseIntent(res, parser, true, flags, a.intents, outError);
    
    // 4. 解析 meta-data
    parseBundleExtras(res, parser, a.metaData, outError);
    
    return a;
}
```

### 3.4 APK 安装流程

#### 3.4.1 安装方式

```
┌─────────────────────────────────────────────────────────────┐
│                      APK 安装方式                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 系统预装                                                │
│     └─> /system/app, /system/priv-app                       │
│     └─> 系统启动时 PMS 扫描安装                              │
│                                                             │
│  2. 用户安装（PackageInstaller）                            │
│     └─> 用户通过界面安装                                    │
│     └─> PackageInstallerService 处理                        │
│                                                             │
│  3. ADB 安装                                                │
│     └─> adb install xxx.apk                                 │
│     └─> PackageManagerService.installPackage()              │
│                                                             │
│  4. 静默安装（系统权限）                                    │
│     └─> PackageManager.installPackage()                     │
│     └─> 需要 INSTALL_PACKAGES 权限                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.4.2 安装流程源码

```java
// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java

@Override
public void installPackage(Uri packageURI, IPackageInstallObserver2 observer,
        int installFlags, String installerPackageName,
        VerificationParams verificationParams, String managedProfileName) {
    
    // 1. 创建安装参数
    InstallParams params = new InstallParams(packageURI, observer, installFlags,
        installerPackageName, verificationParams, null, managedProfileName);
    
    // 2. 检查权限
    final int callingUid = Binder.getCallingUid();
    enforceCrossUserPermission(callingUid, android.Manifest.permission.INSTALL_PACKAGES,
        true, true, "installPackage");
    
    // 3. 将安装请求加入队列
    mQueue.addInstall(params);
}
```

```java
// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java

// 安装队列处理
class PackageHandler extends Handler {
    @Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case INIT_COPY: {
                // 1. 初始化复制
                handleInitCopy();
            } break;
            
            case MCS_BOUND: {
                // 2. 绑定 MediaContainerService
                handleMcsBound(msg);
            } break;
            
            case SEND_MSG: {
                // 3. 发送安装消息
                handleSendMsg(msg);
            } break;
        }
    }
}

private void handleInitCopy() {
    // 1. 获取下一个安装请求
    InstallParams params = mQueue.getInstall();
    
    if (params != null) {
        // 2. 验证 APK
        if (verifyPackage(params)) {
            // 3. 开始复制
            startCopy(params);
        }
    }
}

private void startCopy(InstallParams params) {
    try {
        // 1. 验证参数
        if (validateInstall(params)) {
            // 2. 创建临时目录
            File tempDir = createTempDir();
            
            // 3. 复制 APK 到临时目录
            copyPackage(params.packageURI, tempDir);
            
            // 4. 安装 APK
            installPackageLI(params, tempDir);
        }
    } finally {
        // 5. 清理临时文件
        cleanupTempDir();
    }
}

private void installPackageLI(InstallParams params, File tempDir) {
    // 1. 解析 APK
    PackageParser.Package pkg = parsePackage(tempDir);
    
    // 2. 检查签名
    if (!verifySignatures(pkg)) {
        return;
    }
    
    // 3. 检查权限
    if (!grantPermissions(pkg)) {
        return;
    }
    
    // 4. 设置应用目录
    File appDir = createAppDir(pkg.packageName);
    
    // 5. 复制 APK 到应用目录
    copyPackage(tempDir, appDir);
    
    // 6. 优化 DEX
    performDexOpt(pkg);
    
    // 7. 更新 PackageSetting
    updatePackageSetting(pkg);
    
    // 8. 发送安装完成广播
    sendPackageInstalledBroadcast(pkg);
}
```

#### 3.4.3 安装流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    APK 安装完整流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 用户触发安装                                            │
│     └─> PackageInstaller.install()                          │
│                                                             │
│  2. PackageManagerService.installPackage()                  │
│     └─> 创建 InstallParams，加入队列                        │
│                                                             │
│  3. PackageHandler.handleMessage()                          │
│     ├─> INIT_COPY: 初始化复制                               │
│     ├─> MCS_BOUND: 绑定 MediaContainerService               │
│     └─> SEND_MSG: 发送安装消息                              │
│                                                             │
│  4. 验证 APK                                                │
│     ├─> 检查 APK 完整性                                     │
│     ├─> 检查签名                                            │
│     └─> 检查最低 SDK 版本                                    │
│                                                             │
│  5. 复制 APK                                                │
│     ├─> 复制到 /data/app/<package>/                         │
│     ├─> 设置文件权限（chmod）                               │
│     └─> 设置 SELinux 上下文                                  │
│                                                             │
│  6. 解析 AndroidManifest.xml                                │
│     ├─> PackageParser.parsePackage()                        │
│     ├─> 收集组件信息                                        │
│     └─> 解析权限和特性                                      │
│                                                             │
│  7. 签名验证                                                │
│     ├─> 检查新 APK 签名                                     │
│     ├─> 如果是更新，检查与旧版本签名一致                    │
│     └─> 验证证书链                                          │
│                                                             │
│  8. 权限授予                                                │
│     ├─> 解析权限声明                                        │
│     ├─> 自动授予 normal 权限                                │
│     └─> dangerous 权限等待用户确认                           │
│                                                             │
│  9. DEX 优化                                                │
│     ├─> 调用 dex2oat                                        │
│     ├─> 生成 OAT 文件                                       │
│     └─> 存储在 /data/dalvik-cache/                          │
│                                                             │
│  10. 更新 PackageSetting                                    │
│      ├─> 添加到 mPackages 映射                              │
│      ├─> 更新 components.xml                                │
│      └─> 更新 settings.xml                                  │
│                                                             │
│  11. 发送广播                                               │
│      ├─> ACTION_PACKAGE_ADDED                               │
│      ├─> ACTION_PACKAGE_REPLACED（如果是更新）              │
│      └─> 通知 Launcher 更新图标                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 签名验证

```java
// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java

private boolean verifySignatures(PackageParser.Package pkg) {
    // 1. 检查是否是系统应用
    if (isSystemApp(pkg)) {
        // 系统应用使用预置签名
        return verifySystemSignatures(pkg);
    }
    
    // 2. 检查是否是更新
    PackageSetting ps = mSettings.getPackageLPr(pkg.packageName);
    if (ps != null) {
        // 更新：检查签名一致性
        return verifyUpdateSignatures(ps, pkg);
    }
    
    // 3. 新安装：验证签名证书
    return verifyNewPackageSignatures(pkg);
}

private boolean verifyUpdateSignatures(PackageSetting ps, PackageParser.Package pkg) {
    // 1. 获取旧签名
    SigningDetails oldSignatures = ps.signingDetails;
    
    // 2. 获取新签名
    SigningDetails newSignatures = pkg.signingDetails;
    
    // 3. 检查签名是否一致
    if (!oldSignatures.checkCapability(newSignatures,
            SigningDetails.CAPABILITY_NEVER_ROLLBACK)) {
        Slog.w(TAG, "Signature mismatch for " + pkg.packageName);
        return false;
    }
    
    return true;
}
```

---

## 四、WindowManagerService (WMS)

### 4.1 WMS 职责概述

WMS 负责管理系统中所有窗口，包括窗口的创建、销毁、层级管理、输入事件分发等。

**核心职责**：
1. **窗口管理**：创建、销毁、更新窗口
2. **Surface 管理**：与 SurfaceFlinger 协作管理 Surface
3. **窗口层级**：管理窗口的 Z-order 和层级关系
4. **输入事件分发**：将输入事件分发到正确的窗口
5. **动画管理**：管理窗口动画和过渡动画
6. **壁纸管理**：管理壁纸窗口
7. **状态栏管理**：管理状态栏和导航栏
8. **屏幕管理**：管理屏幕旋转、休眠等

### 4.2 WMS 架构

```
┌─────────────────────────────────────────────────────────────┐
│                   WindowManagerService                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Window 管理                             │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │  Window   │  │  Window   │  │  Window   │        │    │
│  │  │  State    │  │  State    │  │  State    │        │    │
│  │  │ (App 1)   │  │ (App 2)   │  │ (StatusBar)│       │    │
│  │  └───────────┘  └───────────┘  └───────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AppWindowToken 管理                     │    │
│  │  - 每个应用一个 AppWindowToken                       │    │
│  │  - 管理应用的所有窗口                                │    │
│  │  - 处理应用级别的动画                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Input 管理                              │    │
│  │  - InputManager 协作                                 │    │
│  │  - 输入事件分发                                      │    │
│  │  - 触摸事件处理                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Surface 管理                            │    │
│  │  - 创建 Surface                                      │    │
│  │  - 与 SurfaceFlinger 通信                            │    │
│  │  - 管理 Surface 层级                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              动画管理                                │    │
│  │  - WindowAnimation                                   │    │
│  │  - AppTransition                                     │    │
│  │  - 自定义动画                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 窗口层级

```
┌─────────────────────────────────────────────────────────────┐
│                      窗口层级（Z-Order）                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  最高层                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_SECURE_OVERLAY (24)                           │    │
│  │  - 安全覆盖层（截屏时隐藏）                          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_ACCESSIBILITY_OVERLAY (23)                    │    │
│  │  - 无障碍覆盖层                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_INPUT_METHOD (22)                             │    │
│  │  - 输入法窗口                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_VOICE_INTERACTION (21)                        │    │
│  │  - 语音交互窗口                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_STATUS_BAR (20)                               │    │
│  │  - 状态栏                                            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_SYSTEM_ALERT (19)                             │    │
│  │  - 系统警告（需要 SYSTEM_ALERT_WINDOW 权限）          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_APPLICATION_PANEL (3)                         │    │
│  │  - 应用面板（PopupMenu 等）                          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_APPLICATION (2)                               │    │
│  │  - 应用窗口（Activity）                              │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TYPE_APPLICATION_STARTING (1)                      │    │
│  │  - 启动窗口（StartingWindow）                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  最低层                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 窗口创建流程

#### 4.4.1 应用侧请求

```java
// frameworks/base/core/java/android/view/ViewRootImpl.java

public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
    synchronized (this) {
        if (mView == null) {
            mView = view;
            
            // 1. 请求创建窗口
            requestLayout();
            
            // 2. 通过 Binder 调用 WMS
            try {
                res = mWindowSession.addToDisplay(mWindow, mSeq, mWindowAttributes,
                    getHostDisplayClass(), mDisplay.getDisplayId(),
                    mPendingDisplayCutout, mTempInsets, mInputChannel);
            } catch (RemoteException e) {
                // ...
            }
        }
    }
}
```

#### 4.4.2 WMS 侧处理

```java
// frameworks/base/services/core/java/com/android/server/wm/WindowManagerService.java

@Override
public int addToDisplay(IWindow window, int seq, WindowManager.LayoutParams attrs,
        int displayId, Rect outContentInsets, InputChannel outInputChannel) {
    
    return mDisplayContent.addToDisplay(window, seq, attrs, displayId,
        outContentInsets, outInputChannel);
}
```

```java
// frameworks/base/services/core/java/com/android/server/wm/DisplayContent.java

int addToDisplay(IWindow window, int seq, WindowManager.LayoutParams attrs,
        int displayId, Rect outContentInsets, InputChannel outInputChannel) {
    
    // 1. 创建 WindowState
    WindowState win = new WindowState(this, window, seq, attrs);
    
    // 2. 添加窗口
    addWindow(win);
    
    // 3. 创建 Surface
    win.createSurface();
    
    // 4. 设置输入通道
    if (outInputChannel != null) {
        InputChannel.copy(outInputChannel, win.mInputChannel);
    }
    
    return win.mClientSequenceNumber;
}
```

#### 4.4.3 窗口创建流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    窗口创建完整流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Activity.onCreate()                                     │
│     └─> 创建 DecorView                                      │
│                                                             │
│  2. Activity.onResume()                                     │
│     └─> WindowManager.addView(DecorView, LayoutParams)      │
│                                                             │
│  3. ViewRootImpl.setView()                                  │
│     ├─> 创建 ViewRootImpl                                   │
│     ├─> 请求布局（requestLayout）                           │
│     └─> 调用 WindowSession.addToDisplay()                   │
│                                                             │
│  4. Binder 跨进程调用                                       │
│     └─> WindowManagerService.addToDisplay()                 │
│                                                             │
│  5. WMS 创建 WindowState                                    │
│     ├─> 创建 WindowState 对象                               │
│     ├─> 添加到窗口列表                                      │
│     └─> 计算窗口位置                                        │
│                                                             │
│  6. 创建 Surface                                            │
│     ├─> 调用 SurfaceControl.createSurface()                 │
│     ├─> SurfaceFlinger 创建 Surface                         │
│     └─> 返回 Surface 对象                                   │
│                                                             │
│  7. 应用侧绘制                                              │
│     ├─> ViewRootImpl.performTraversals()                    │
│     ├─> DecorView.draw()                                    │
│     └─> Canvas 绘制到 Surface                               │
│                                                             │
│  8. SurfaceFlinger 合成                                     │
│     ├─> 收集所有 Surface                                    │
│     ├─> 按 Z-order 合成                                     │
│     └─> 输出到 Framebuffer                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 输入事件分发

```
┌─────────────────────────────────────────────────────────────┐
│                    输入事件分发流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. InputReader（独立线程）                                 │
│     └─> 从 /dev/input/event* 读取原始事件                   │
│                                                             │
│  2. InputReader 处理                                        │
│     ├─> 解析原始事件                                        │
│     ├─> 转换为 MotionEvent                                  │
│     └─> 放入 InputDispatcher 队列                           │
│                                                             │
│  3. InputDispatcher（独立线程）                             │
│     ├─> 从队列取出事件                                      │
│     ├─> 查询 WMS 获取目标窗口                               │
│     └─> 分发到目标窗口                                      │
│                                                             │
│  4. WMS 查询目标窗口                                        │
│     ├─> 根据坐标查找最顶层窗口                              │
│     ├─> 检查窗口是否可接收输入                              │
│     └─> 返回 WindowState                                  │
│                                                             │
│  5. 应用侧处理                                              │
│     ├─> InputChannel 接收事件                               │
│     ├─> ViewRootImpl.dispatchPointerEvent()                 │
│     ├─> DecorView.dispatchTouchEvent()                      │
│     ├─> Activity.dispatchTouchEvent()                       │
│     ├─> ViewGroup.dispatchTouchEvent()                      │
│     └─> View.onTouchEvent()                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、服务间通信

### 5.1 AMS 与 PMS 通信

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java

// AMS 获取 PMS 引用
private PackageManagerService mPackageManagerService;

// 查询 Activity 信息
ActivityInfo resolveActivity(Intent intent, int userId) {
    try {
        return ActivityManager.getService().resolveIntent(intent,
            intent.resolveTypeIfNeeded(mContext.getContentResolver()),
            0, userId);
    } catch (RemoteException e) {
        return null;
    }
}

// 检查权限
int checkPermission(String permission, int pid, int uid) {
    return mPackageManagerService.checkPermission(permission, pid, uid);
}
```

### 5.2 AMS 与 WMS 通信

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java

// AMS 获取 WMS 引用
private WindowManagerService mWindowManagerService;

// 添加 AppWindowToken
void addAppToken(AppWindowToken token) {
    mWindowManagerService.addAppToken(token);
}

// 移除 AppWindowToken
void removeAppToken(AppWindowToken token) {
    mWindowManagerService.removeAppToken(token);
}

// 设置窗口可见性
void setAppVisibility(AppWindowToken token, boolean visible) {
    mWindowManagerService.setAppVisibility(token, visible);
}
```

### 5.3 PMS 与 WMS 通信

```java
// frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java

// PMS 获取 WMS 引用（通过 ServiceManager）
private IWindowManager mWindowManager = WindowManagerGlobal.getWindowManagerService();

// 更新应用图标
void updateAppIcon(String packageName) {
    try {
        mWindowManager.updateAppIcon(packageName);
    } catch (RemoteException e) {
        // ...
    }
}
```

---

## 六、面试考点

### 6.1 基础问题

#### Q1: AMS 的主要职责是什么？

**参考答案**：
AMS（ActivityManagerService）是 Android 系统最核心的服务，主要职责包括：
1. 管理所有应用进程的生命周期（创建、销毁、回收）
2. 管理 Activity 的生命周期和任务栈
3. 管理 Service 的启动和绑定
4. 管理和分发系统广播
5. 管理 ContentProvider 的发布和访问
6. 管理进程优先级和 OOM 调整

#### Q2: PMS 是如何解析 APK 的？

**参考答案**：
PMS 使用 PackageParser 解析 APK：
1. 打开 APK 文件（ZIP 格式）
2. 读取 AndroidManifest.xml
3. 解析 manifest 根节点，获取包名、版本等信息
4. 解析 application 节点，获取应用级配置
5. 解析各组件节点（activity、service、receiver、provider）
6. 解析权限和特性声明
7. 将解析结果存储到 Package 对象中

#### Q3: WMS 的窗口层级是如何划分的？

**参考答案**：
WMS 将窗口分为多个层级（TYPE_*）：
- TYPE_APPLICATION_STARTING (1)：启动窗口
- TYPE_APPLICATION (2)：应用窗口
- TYPE_APPLICATION_PANEL (3)：应用面板
- TYPE_STATUS_BAR (20)：状态栏
- TYPE_SYSTEM_ALERT (19)：系统警告
- TYPE_INPUT_METHOD (22)：输入法窗口
- TYPE_ACCESSIBILITY_OVERLAY (23)：无障碍覆盖层
- TYPE_SECURE_OVERLAY (24)：安全覆盖层

### 6.2 进阶问题

#### Q4: Activity 启动的完整流程是什么？

**参考答案**：
1. Activity.startActivity() → Instrumentation.execStartActivity()
2. 通过 Binder 调用 AMS.startActivity()
3. AMS 验证调用者，获取进程记录
4. ActivityStackSupervisor 解析 ActivityInfo（查询 PMS）
5. 创建 ActivityRecord，决定启动模式
6. 检查进程是否存在，不存在则创建新进程
7. 应用进程侧：ActivityThread.scheduleLaunchActivity()
8. H 消息处理，调用 Activity.performCreate()
9. Activity.onCreate() → onStart() → onResume()
10. WMS 创建窗口，SurfaceFlinger 合成显示

#### Q5: APK 安装的完整流程是什么？

**参考答案**：
1. PackageManagerService.installPackage() 接收安装请求
2. 验证 APK 完整性和签名
3. 复制 APK 到 /data/app/<package>/
4. PackageParser 解析 AndroidManifest.xml
5. 检查签名一致性（更新时对比旧版本）
6. 授予权限（normal 自动授予，dangerous 等待用户确认）
7. dex2oat 优化 DEX 文件
8. 更新 PackageSetting，添加到 mPackages
9. 发送 ACTION_PACKAGE_ADDED 广播
10. 通知 Launcher 更新图标

#### Q6: 窗口是如何创建的？

**参考答案**：
1. Activity 创建 DecorView
2. WindowManager.addView() 请求添加窗口
3. ViewRootImpl.setView() 调用 WindowSession.addToDisplay()
4. Binder 调用 WMS.addToDisplay()
5. WMS 创建 WindowState 对象
6. 创建 Surface（SurfaceFlinger 分配）
7. 应用侧绘制（Canvas 绘制到 Surface）
8. SurfaceFlinger 合成所有 Surface 输出到 Framebuffer

### 6.3 深度问题

#### Q7: AMS 如何管理进程优先级？

**参考答案**：
AMS 通过 OOM Adjust 机制管理进程优先级：
1. 根据进程状态计算 OOM 调整值（0-15）
2. 优先级：Foreground(0) > Visible(1) > Perceptible(2) > Background(4-12) > Empty(15)
3. 定期调用 updateOomAdjLocked() 更新所有进程
4. 通过 Process.setOomAdj(pid, adj) 通知内核
5. 内存不足时，LMK（Low Memory Killer）根据 OOM Adjust 杀死进程

**计算逻辑**：
- 有前台 Activity：FOREGROUND_APP_ADJ (0)
- 可见但非前台：VISIBLE_APP_ADJ (1)
- 有前台 Service：PERCEPTIBLE_APP_ADJ (2)
- 后台进程：根据 LRU 顺序计算 (4-12)
- 空进程：CACHED_APP_MAX_ADJ (15)

#### Q8: PMS 的签名验证机制是怎样的？

**参考答案**：
PMS 的签名验证流程：
1. **新安装**：验证 APK 的签名证书，提取公钥
2. **更新安装**：对比新旧 APK 的签名
   - 签名必须一致（或满足升级策略）
   - 检查证书链和有效期
3. **系统应用**：使用预置签名验证
4. **共享 UID**：相同 UID 的应用必须签名一致

**签名策略**：
- SigningDetails.CAPABILITY_NEVER_ROLLBACK：禁止回滚
- SigningDetails.CAPABILITY_CAN_ROLLBACK：允许回滚
- v2/v3 签名方案支持更细粒度的权限控制

#### Q9: WMS 如何分发输入事件？

**参考答案**：
输入事件分发流程：
1. InputReader 从 /dev/input/event* 读取原始事件
2. InputReader 解析为 MotionEvent
3. 放入 InputDispatcher 队列
4. InputDispatcher 查询 WMS 获取目标窗口
5. WMS 根据坐标和 Z-order 查找最顶层可接收输入的窗口
6. InputDispatcher 通过 InputChannel 发送事件到应用进程
7. ViewRootImpl 接收事件，调用 dispatchPointerEvent()
8. 事件沿 View 树传递：DecorView → Activity → ViewGroup → View

**ANR 机制**：
- 输入事件 5 秒内未处理完成，触发 ANR
- InputDispatcher 监控应用响应时间
- 超时后杀死应用或弹出 ANR 对话框

---

## 七、参考资料

1. [Android 源码 - ActivityManagerService.java](https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/am/ActivityManagerService.java)
2. [Android 源码 - PackageManagerService.java](https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/pm/PackageManagerService.java)
3. [Android 源码 - WindowManagerService.java](https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/wm/WindowManagerService.java)
4. [Android 组件生命周期](https://developer.android.com/guide/components/activities/activity-lifecycle)
5. [Android 权限模型](https://developer.android.com/guide/topics/permissions/overview)

---

**本文约 14,000 字，涵盖 AMS、PMS、WMS 三大核心服务的核心知识点。建议结合源码深入理解，并在实际项目中观察三大服务的行为**。
