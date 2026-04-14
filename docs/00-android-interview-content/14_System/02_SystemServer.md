# 02_SystemServer

> **核心摘要**：SystemServer 是 Android 系统的"心脏"，负责启动和管理所有核心系统服务（AMS、PMS、WMS 等）。理解 SystemServer 是理解 Android 系统架构的关键。

---

## 一、SystemServer 概述

### 1.1 什么是 SystemServer

SystemServer 是 Android 系统中一个特殊的进程，由 Zygote 进程 fork 创建，负责启动和管理所有核心系统服务。

**核心特点**：
- 进程名：`system_server`
- PID：通常是 Zygote PID + 1（约 649）
- UID/GID：system/system（1000/1000）
- 生命周期：与系统共存，崩溃会导致系统重启
- 职责：启动 AMS、PMS、WMS 等 50+ 系统服务

### 1.2 SystemServer 的架构位置

```
┌─────────────────────────────────────────────────────────────┐
│                      Linux Kernel                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Init 进程                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Zygote 进程                              │
└─────────────────────────────────────────────────────────────┘
                          │ fork()
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SystemServer 进程                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Main Thread (Binder 线程池)                         │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Looper.loop() - 消息循环                    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  │  系统服务列表：                                      │    │
│  │  ├─ ActivityManagerService (AMS)                    │    │
│  │  ├─ PackageManagerService (PMS)                     │    │
│  │  ├─ WindowManagerService (WMS)                      │    │
│  │  ├─ PowerManagerService                             │    │
│  │  ├─ InputManagerService                             │    │
│  │  ├─ NotificationManagerService                      │    │
│  │  ├─ ... (约 50+ 服务)                               │    │
│  │                                                      │    │
│  │  Binder 线程池：                                     │    │
│  │  ├─ Binder Thread #1                                │    │
│  │  ├─ Binder Thread #2                                │    │
│  │  ├─ ...                                             │    │
│  │  └─ Binder Thread #15                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ App 进程 1 │    │ App 进程 2 │    │ App 进程 3 │
    └──────────┘    └──────────┘    └──────────┘
```

### 1.3 SystemServer 与 Zygote 的关系

| 特性 | Zygote | SystemServer |
|------|--------|--------------|
| 创建方式 | Init fork | Zygote fork |
| 主要职责 | 孵化 App 进程 | 管理系统服务 |
| Socket 监听 | 是（/dev/socket/zygote） | 否 |
| Binder 服务 | 否 | 是（注册到 ServiceManager） |
| 崩溃后果 | 所有 App 进程退出 | 系统重启（Watchdog） |
| 线程模型 | 单线程循环 | 主线程 + Binder 线程池 |

---

## 二、SystemServer 启动流程

### 2.1 启动流程总览

```
┌─────────────────────────────────────────────────────────────┐
│              SystemServer 启动流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Zygote.forkSystemServer()                               │
│     └─> fork() 创建 system_server 进程                      │
│                                                             │
│  2. ZygoteInit.handleSystemServerProcess()                  │
│     ├─> 设置 ThreadGroup                                    │
│     └─> 加载 SystemServer 类                                │
│                                                             │
│  3. SystemServer.run()                                      │
│     ├─> Looper.prepareMainLooper()                          │
│     ├─> createSystemContext()                               │
│     ├─> startBootstrapServices()                            │
│     ├─> startCoreServices()                                 │
│     ├─> startOtherServices()                                │
│     └─> Looper.loop()                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Zygote 侧的 fork 流程

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

private static Runnable forkSystemServer(String abiList, String socketName,
        ZygoteServer zygoteServer) {
    
    // 1. 准备 capabilities（Linux 能力）
    long[] capabilities = posixCapabilitiesAsBits(
        OsConstants.CAP_KILL,              // 杀死进程
        OsConstants.CAP_NET_ADMIN,         // 网络管理
        OsConstants.CAP_NET_BIND_SERVICE,  // 绑定端口
        OsConstants.CAP_NET_RAW,           // 原始网络
        OsConstants.CAP_SETGID,            // 设置 GID
        OsConstants.CAP_SETUID,            // 设置 UID
        OsConstants.CAP_SYS_BOOT,          // 系统启动
        OsConstants.CAP_SYS_TIME,          // 系统时间
        // ... 更多权限
    );
    
    // 2. 调用 native fork
    pid = Zygote.forkSystemServer(
        uid,           // UID = 1000 (system)
        gid,           // GID = 1000 (system)
        gids,          // 附加 GID 列表
        debugFlags,    // 调试标志
        rlimits,       // 资源限制
        capabilities,  // Linux 能力
        null, null     // 保留参数
    );
    
    if (pid == 0) {
        // 3. 子进程（SystemServer）
        if (hasSecondZygote(abiList)) {
            waitForSecondaryZygote(socketName);
        }
        zygoteServer.closeServerSocket();  // 关闭 Socket
        return handleSystemServerProcess();
    }
    
    // 4. 父进程（Zygote）返回 null
    return null;
}
```

```cpp
// frameworks/base/core/jni/com_android_internal_os_Zygote.cpp

static jint com_android_internal_os_Zygote_nativeForkSystemServer(
    JNIEnv* env, jclass clazz, jint uid, jint gid, jintArray gids,
    jint debug_flags, jobjectArray rlimits, jlong capabilities,
    jlong capabilities2, jstring managed_profile_dir)
{
    pid_t pid;
    
    // 1. fork 系统调用
    pid = fork();
    
    if (pid == 0) {
        // 2. 子进程：设置特殊权限
        SpecializeCommon(env, uid, gid, gids, debug_flags, rlimits,
            0, NULL, NULL, true, NULL, NULL);
        
        // 3. 设置 capabilities
        setCapabilities(capabilities, capabilities2);
        
        return 0;
    } else {
        // 4. 父进程：返回子进程 PID
        return pid;
    }
}
```

### 2.3 SystemServer 进程入口

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

private static Runnable handleSystemServerProcess() {
    // 1. 创建 SystemServer 线程组
    ThreadGroup group = new ThreadGroup("SystemServer");
    Thread.currentThread().setGroup(group);
    
    // 2. 设置优先级
    Thread.currentThread().setPriority(Thread.NORM_PRIORITY);
    
    // 3. 设置 SELinux 上下文
    Os.setenv("ANDROID_RUNTIME_ROOT", "/system", true);
    
    // 4. 加载 SystemServer 类
    Class<?> cl = Class.forName("com.android.server.SystemServer");
    
    // 5. 创建实例并返回
    return (Runnable) cl.newInstance();
}
```

### 2.4 SystemServer.run() 核心流程

```java
// frameworks/base/services/java/com/android/server/SystemServer.java

@Override
public void run() {
    try {
        // ==================== 第一阶段：初始化 ====================
        
        // 1. 创建主线程 Looper
        Looper.prepareMainLooper();
        
        // 2. 加载 JNI 库
        System.loadLibrary("android_servers");
        
        // 3. 初始化 Trace
        Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "InitZygote");
        // ...
        
        // 4. 创建系统上下文
        createSystemContext();
        
        // 5. 初始化 Binder 线程池
        ServiceManager.addService(Context.ACTIVITY_SERVICE, mActivityManagerService);
        
        // ==================== 第二阶段：启动服务 ====================
        
        // 6. 启动引导服务（关键服务）
        startBootstrapServices();
        
        // 7. 启动核心服务
        startCoreServices();
        
        // 8. 启动其他服务
        startOtherServices();
        
        // ==================== 第三阶段：进入循环 ====================
        
        // 9. 进入消息循环
        Looper.loop();
        
    } catch (Throwable t) {
        // 10. 异常处理：系统重启
        Slog.e("System", "Failure starting system services", t);
    }
}
```

---

## 三、系统服务管理

### 3.1 服务启动的三个阶段

SystemServer 将服务启动分为三个阶段，确保服务间的依赖关系正确处理。

#### 3.1.1 startBootstrapServices() - 引导服务

**特点**：最核心的服务，其他服务依赖它们

```java
private void startBootstrapServices() {
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartInstaller");
    // 1. InstallerService - APK 安装服务
    mInstaller = mSystemServiceManager.startService(Installer.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartActivityManager");
    // 2. ActivityManagerService - 核心中的核心
    mActivityManagerService = mSystemServiceManager.startService(
        ActivityManagerService.Lifecycle.class).getService();
    mActivityManagerService.initContext(mSystemContext, mInjector);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartPowerManager");
    // 3. PowerManagerService - 电源管理
    mPowerManagerService = mSystemServiceManager.startService(PowerManagerService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartRecovery");
    // 4. RecoveryService - 恢复模式
    mSystemServiceManager.startService(RecoveryService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartLights");
    // 5. LightsService - 指示灯
    mSystemServiceManager.startService(LightsService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartDisplayManager");
    // 6. DisplayManagerService - 显示管理
    mDisplayManagerService = mSystemServiceManager.startService(DisplayManagerService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "WaitForPackageManager");
    // 7. PackageManagerService - 包管理（需要等待）
    mPackageManagerService = mSystemServiceManager.startService(PackageManagerService.Lifecycle.class);
    mPackageManagerService.waitReady();
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartUserManager");
    // 8. UserManagerService - 用户管理
    mSystemServiceManager.startService(UserManagerService.Lifecycle.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // ... 更多引导服务
}
```

#### 3.1.2 startCoreServices() - 核心服务

**特点**：系统运行必需的服务

```java
private void startCoreServices() {
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartBattery");
    // 1. BatteryService - 电池管理
    mSystemServiceManager.startService(BatteryService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartUsage");
    // 2. UsageStatsService - 使用统计
    mSystemServiceManager.startService(UsageStatsService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartWebView");
    // 3. WebViewUpdateService - WebView 更新
    mSystemServiceManager.startService(WebViewUpdateService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartCache");
    // 4. CacheManagerService - 缓存管理
    mSystemServiceManager.startService(CacheManagerService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
}
```

#### 3.1.3 startOtherServices() - 其他服务

**特点**：功能扩展服务，数量最多

```java
private void startOtherServices() {
    // 1. WindowManagerService - 窗口管理
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartWindowManager");
    mSystemServiceManager.startService(WindowManagerService.Lifecycle.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // 2. InputManagerService - 输入管理
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartInputManager");
    mSystemServiceManager.startService(InputManagerService.Lifecycle.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // 3. AudioService - 音频服务
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartAudio");
    mSystemServiceManager.startService(AudioService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // 4. BluetoothService - 蓝牙服务
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartBluetooth");
    mSystemServiceManager.startService(BluetoothService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // 5. WifiService - WiFi 服务
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartWifi");
    mSystemServiceManager.startService(WifiService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // 6. LocationManagerService - 定位服务
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartLocation");
    mSystemServiceManager.startService(LocationManagerService.Lifecycle.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // 7. NotificationManagerService - 通知服务
    Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartNotification");
    mSystemServiceManager.startService(NotificationManagerService.class);
    Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
    
    // ... 约 40+ 其他服务
}
```

### 3.2 服务启动顺序依赖图

```
┌─────────────────────────────────────────────────────────────┐
│                    服务启动依赖关系                          │
└─────────────────────────────────────────────────────────────┘

第一阶段：Bootstrap Services
┌──────────────┐
│ Installer    │ ← 最优先，其他服务依赖它安装/优化 APK
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     AMS      │ ← 核心服务，管理所有应用
└──────┬───────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Power   │  │ Recovery │  │  Lights  │
└──────────┘  └──────────┘  └──────────┘
       │
       ▼
┌──────────────┐
│   Display    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     PMS      │ ← 等待 PMS 准备好再继续
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   UserManager│
└──────────────┘

第二阶段：Core Services
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Battery  │  │  Usage   │  │ WebView  │  │  Cache   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

第三阶段：Other Services
┌──────────────┐
│     WMS      │ ← 依赖 AMS、Display
└──────┬───────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Input   │  │  Audio   │  │ Bluetooth│
└──────────┘  └──────────┘  └──────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Wifi   │  │ Location │  │Notification│
└──────────┘  └──────────┘  └──────────┘
```

### 3.3 SystemServiceManager

SystemServiceManager 是 SystemServer 内部的服务管理器，负责服务的创建、启动和生命周期管理。

```java
// frameworks/base/services/core/java/com/android/server/SystemServiceManager.java

public class SystemServiceManager {
    private final ArrayList<SystemService> mServices = new ArrayList<>();
    
    // 启动服务
    public <T extends SystemService> T startService(Class<T> serviceClass) {
        try {
            // 1. 反射创建服务实例
            final T service = mInjector.newInstance(serviceClass);
            
            // 2. 添加到列表
            mServices.add(service);
            
            // 3. 启动服务
            service.start(mContext);
            
            return service;
        } catch (Throwable ex) {
            throw new RuntimeException("Failed to start service " + serviceClass, ex);
        }
    }
    
    // 启动 Lifecycle 类服务
    public <T> T startService(Class<? extends SystemService> serviceClass,
            Function<SystemService, T> getService) {
        final SystemService service = startService(serviceClass);
        return getService.apply(service);
    }
}
```

**SystemService 基类**：

```java
// frameworks/base/services/core/java/com/android/server/SystemService.java

public abstract class SystemService {
    private final Context mSystemContext;
    
    public SystemService(Context context) {
        mSystemContext = context;
    }
    
    // 服务启动入口
    public abstract void onStart();
    
    // 可选：启动阶段回调
    public void onBootPhase(int phase) {}
    
    // 获取上下文
    protected Context getContext() {
        return mSystemContext;
    }
}
```

**启动阶段常量**：

```java
// SystemService.java 中的启动阶段

// Phase 100: 基础服务已启动
public static final int PHASE_WAIT_DEFAULT_APPS = 100;

// Phase 200: 核心服务已启动
public static final int PHASE_LOCK_SETTINGS_READY = 200;

// Phase 300: 系统服务基本就绪
public static final int PHASE_SYSTEM_SERVICES_READY = 300;

// Phase 400: 用户解锁
public static final int PHASE_USER_STARTED = 400;

// Phase 500: 启动完成
public static final int PHASE_BOOT_COMPLETED = 500;
```

---

## 四、服务注册和发现

### 4.1 ServiceManager 机制

Android 使用 ServiceManager 实现服务的注册和发现，类似于 DNS 服务。

**架构**：

```
┌─────────────────────────────────────────────────────────────┐
│                     ServiceManager                          │
│  (Native 进程，PID = 0 之前的特殊进程)                       │
│                                                             │
│  服务注册表：                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  "activity"        → IBinder (AMS)                  │    │
│  │  "package"         → IBinder (PMS)                  │    │
│  │  "window"          → IBinder (WMS)                  │    │
│  │  "power"           → IBinder (PowerManagerService)  │    │
│  │  "notification"    → IBinder (NotificationManager)  │    │
│  │  ...                                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ addService() / getService()
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌──────────┐        ┌──────────┐        ┌──────────┐
│   AMS    │        │   PMS    │        │   WMS    │
│ (注册)   │        │ (注册)   │        │ (注册)   │
└──────────┘        └──────────┘        └──────────┘
```

### 4.2 服务注册流程

**SystemServer 侧注册**：

```java
// frameworks/base/services/core/java/com/android/server/SystemServer.java

// 方式 1: 直接注册到 ServiceManager
ServiceManager.addService(Context.ACTIVITY_SERVICE, mActivityManagerService);
ServiceManager.addService(Context.PACKAGE_SERVICE, mPackageManagerService);
ServiceManager.addService(Context.WINDOW_SERVICE, mWindowManagerService);

// 方式 2: 通过 SystemServiceManager 注册（内部会调用 addService）
mSystemServiceManager.startService(ActivityManagerService.Lifecycle.class);
```

**ServiceManager.addService() 源码**：

```java
// frameworks/base/core/java/android/os/ServiceManager.java

public static void addService(String name, IBinder service) {
    addService(name, service, false, SERVICE_MANAGER_PREFERRED_DNS_POLICY);
}

public static void addService(String name, IBinder service, boolean allowIsolated,
        int dumpsysFlags) {
    try {
        // 调用 native 方法注册到 ServiceManager
        getIServiceManager().addService(name, service, allowIsolated, dumpsysFlags);
    } catch (RemoteException e) {
        Log.e(TAG, "Failed to add service " + name, e);
    }
}

private static IServiceManager getIServiceManager() {
    if (sServiceManager == null) {
        // 获取 ServiceManager 的 Binder 引用
        sServiceManager = ServiceManagerNative.asInterface(
            Binder.allowBlocking(BinderInternal.getContextObject()));
    }
    return sServiceManager;
}
```

**Native 层注册**：

```cpp
// frameworks/native/libs/binder/IServiceManager.cpp

class ServiceManager : public IServiceManager {
public:
    virtual status_t addService(const String16& name, const sp<IBinder>& service,
            bool allowIsolated, int32_t dumpsysFlags) {
        // 通过 Binder 调用 native ServiceManager
        Parcel data, reply;
        data.writeInterfaceToken(IServiceManager::getInterfaceDescriptor());
        data.writeString16(name);
        data.writeStrongBinder(service);
        data.writeInt32(allowIsolated ? 1 : 0);
        data.writeInt32(dumpsysFlags);
        
        status_t err = remote()->transact(ADD_SERVICE_TRANSACTION, data, &reply);
        return err;
    }
};
```

**Native ServiceManager 实现**：

```cpp
// frameworks/native/cmds/servicemanager/service_manager.c

int main(int argc, char** argv) {
    // 1. 初始化 Binder
    binder_init();
    
    // 2. 成为 ServiceManager（特殊权限）
    binder_become_context_manager(bs);
    
    // 3. 进入循环，处理请求
    while (1) {
        int nfds = poll(bfds, count, -1);
        
        // 处理 addService/getService 请求
        if (fd == bs->fd) {
            svclist_handle_incoming(bs);
        }
    }
}

// 处理 addService 请求
static int svclist_add(struct svcinfo_list *svclist, const char *name,
                       uint32_t len, void *ptr) {
    // 检查服务名是否已存在
    struct svcinfo *si = find_svc(svclist, name, len);
    if (si != NULL) {
        return -1;  // 服务已存在
    }
    
    // 创建新服务条目
    si = malloc(sizeof(*si) + len);
    memcpy(si->name, name, len);
    si->ptr = ptr;
    
    // 添加到链表
    si->next = svclist->head;
    svclist->head = si;
    
    return 0;
}
```

### 4.3 服务获取流程

**应用侧获取服务**：

```java
// frameworks/base/core/java/android/app/ActivityManager.java

public static ActivityManager getService() {
    return ActivityManagerSingleton.sSingleton;
}

private static class ActivityManagerSingleton extends Singleton<IActivityManager> {
    @Override
    protected IActivityManager create() {
        // 1. 从 ServiceManager 获取 IBinder
        final IBinder b = ServiceManager.getService(Context.ACTIVITY_SERVICE);
        
        // 2. 转换为 IActivityManager 接口
        final IActivityManager am = IActivityManager.Stub.asInterface(b);
        return am;
    }
}
```

**ServiceManager.getService() 源码**：

```java
// frameworks/base/core/java/android/os/ServiceManager.java

public static IBinder getService(String name) {
    try {
        // 1. 检查缓存
        IBinder service = sCache.get(name);
        if (service != null) {
            return service;
        } else {
            // 2. 从 ServiceManager 获取
            return getIServiceManager().getService(name);
        }
    } catch (RemoteException e) {
        Log.e(TAG, "Failed to get service " + name, e);
        return null;
    }
}
```

**服务获取流程图**：

```
┌─────────────────────────────────────────────────────────────┐
│                  应用获取服务流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ActivityManager.getService()                            │
│     └─> ActivityManagerSingleton.create()                   │
│                                                             │
│  2. ServiceManager.getService("activity")                   │
│     ├─> 检查 sCache 缓存                                    │
│     └─> 缓存未命中，调用 getIServiceManager().getService()  │
│                                                             │
│  3. Binder 跨进程调用                                       │
│     └─> 通过 /dev/binder 发送到 ServiceManager 进程         │
│                                                             │
│  4. ServiceManager 查找服务                                 │
│     └─> 在 svcinfo_list 中查找 "activity"                   │
│                                                             │
│  5. 返回 IBinder 引用                                       │
│     └─> 应用缓存到 sCache，后续直接使用                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 服务缓存机制

ServiceManager 在客户端维护了服务缓存，避免重复的 Binder 调用。

```java
// frameworks/base/core/java/android/os/ServiceManager.java

// 服务缓存
private static final HashMap<String, IBinder> sCache = new HashMap<>();

public static IBinder getService(String name) {
    synchronized (sCache) {
        // 检查缓存
        IBinder service = sCache.get(name);
        if (service != null) {
            return service;
        }
    }
    
    // 缓存未命中，获取服务
    try {
        IBinder service = getIServiceManager().getService(name);
        
        // 添加到缓存
        synchronized (sCache) {
            sCache.put(name, service);
        }
        
        return service;
    } catch (RemoteException e) {
        return null;
    }
}
```

---

## 五、SystemServer 线程模型

### 5.1 线程架构

```
┌─────────────────────────────────────────────────────────────┐
│                   SystemServer 进程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Main Thread (system_server)                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Looper.loop()                                      │    │
│  │  ├─> Handler 消息处理                               │    │
│  │  ├─> 系统服务回调                                   │    │
│  │  └─> Broadcast 处理                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Binder Thread Pool (15 个线程)                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Binder Thread #1  (system_server)                  │    │
│  │  Binder Thread #2  (system_server)                  │    │
│  │  ...                                                │    │
│  │  Binder Thread #15 (system_server)                  │    │
│  │                                                      │    │
│  │  处理来自 App 进程的 Binder 调用：                     │    │
│  │  ├─> startActivity()                                │    │
│  │  ├─> startService()                                 │    │
│  │  ├─> broadcastIntent()                              │    │
│  │  └─> ...                                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  其他工作线程                                               │
│  ├─> InputReader (输入读取)                                 │
│  ├─> InputDispatcher (输入分发)                             │
│  ├─> Animation (动画)                                       │
│  └─> ...                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Binder 线程池配置

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

// SystemServer 的 Binder 线程池大小
private static final int MAX_BINDER_THREADS = 15;

// frameworks/base/services/core/java/com/android/server/SystemServer.java

private void startBootstrapServices() {
    // ...
    
    // 设置 Binder 线程池大小
    ThreadPool.setMinThreadPoolSize(MAX_BINDER_THREADS);
    ThreadPool.setMaxThreadPoolSize(MAX_BINDER_THREADS);
}
```

**Binder 线程池工作原理**：

```cpp
// frameworks/native/libs/binder/ProcessState.cpp

sp<ProcessState> ProcessState::self() {
    if (gProcess != nullptr) {
        return gProcess;
    }
    
    // 1. 打开 /dev/binder
    gProcess = new ProcessState("/dev/binder");
    return gProcess;
}

ProcessState::ProcessState(const char *driver) {
    // 2. 打开 Binder 驱动
    mDriverFD = open(driver, O_RDWR | O_CLOEXEC);
    
    // 3. 设置线程池大小
    mMaxThreads = DEFAULT_MAX_BINDER_THREADS;  // 15
}

void ProcessState::startThreadPool() {
    // 4. 启动线程池
    if (!mThreadPoolStarted) {
        mThreadPoolStarted = true;
        spawnPooledThread(true);
    }
}

void ProcessState::spawnPooledThread(bool isMain) {
    // 5. 创建线程
    char name[16];
    snprintf(name, sizeof(name), "Binder:%d", mThreadCount++);
    
    sp<Thread> t = new PoolThread(isMain);
    t->run(name);
}
```

### 5.3 主线程 Looper

```java
// frameworks/base/services/core/java/com/android/server/SystemServer.java

@Override
public void run() {
    // 1. 创建主线程 Looper
    Looper.prepareMainLooper();
    
    // 2. 启动服务...
    startBootstrapServices();
    startCoreServices();
    startOtherServices();
    
    // 3. 进入消息循环
    Looper.loop();
}
```

**主线程处理的消息类型**：

| 消息类型 | 来源 | 处理内容 |
|---------|------|---------|
| Handler Message | 系统服务内部 | 服务间通信 |
| Broadcast | AMS | 系统广播 |
| Input Event | InputManager | 触摸/按键事件 |
| Animation | Choreographer | 帧渲染回调 |
| Binder Transaction | Binder 驱动 | 跨进程调用 |

---

## 六、Watchdog 机制

### 6.1 什么是 Watchdog

Watchdog 是 SystemServer 的"看门狗"，监控系统健康状态。如果 SystemServer 无响应超过 60 秒，Watchdog 会杀死 SystemServer，触发系统重启。

### 6.2 Watchdog 工作原理

```java
// frameworks/base/core/java/com/android/server/Watchdog.java

public class Watchdog extends Thread {
    // 超时时间：60 秒
    private static final long DEFAULT_TIMEOUT = 60 * 1000;
    
    // 监控的检查点
    private final ArrayList<Monitor> mMonitorChecker = new ArrayList<>();
    
    public void init() {
        // 添加监控对象
        addMonitor(ActivityManagerService.getInstance());
        addMonitor(PowerManagerService.getInstance());
        addMonitor(WindowManagerService.getInstance());
        addMonitor(DisplayManagerService.getInstance());
        // ... 更多监控对象
        
        // 启动 Watchdog 线程
        start();
    }
    
    @Override
    public void run() {
        while (true) {
            // 1. 等待超时时间
            try {
                Thread.sleep(DEFAULT_TIMEOUT);
            } catch (InterruptedException e) {}
            
            // 2. 检查所有监控对象
            boolean timedOut = checkProcess();
            
            if (timedOut) {
                // 3. 系统无响应，触发重启
                Slog.wtf(TAG, "Watchdog killing system_server");
                Process.killProcess(Process.myPid());
            }
        }
    }
    
    private boolean checkProcess() {
        // 获取主线程 Looper 消息
        final Message msg = ActivityManagerService.getInstance()
            .getHandler().obtainMessage();
        
        // 同步发送消息
        ActivityManagerService.getInstance().getHandler().sendMessageAtFrontOfQueue(msg);
        
        // 等待消息处理
        synchronized (msg) {
            try {
                // 等待 30 秒（超时的一半）
                msg.wait(DEFAULT_TIMEOUT / 2);
            } catch (InterruptedException e) {}
        }
        
        // 如果消息未被处理，说明主线程卡住
        return msg.obj == null;
    }
}
```

### 6.3 Monitor 接口

```java
// frameworks/base/core/java/com/android/server/Watchdog.java

public interface Monitor {
    // 监控对象实现此方法，检查自身健康状态
    void monitor();
}
```

**AMS 的 Monitor 实现**：

```java
// frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java

@Override
public void monitor() {
    synchronized (this) {
        // 检查是否有死锁
        // 检查是否有长时间未完成的操作
        // ...
    }
    
    // 检查 Activity 栈
    synchronized (mActivities) {
        // ...
    }
    
    // 检查进程列表
    synchronized (mPidsSelfLocked) {
        // ...
    }
}
```

### 6.4 ANR 与 Watchdog 的关系

| 特性 | ANR | Watchdog |
|------|-----|----------|
| 监控对象 | App 进程 | SystemServer |
| 超时时间 | 5 秒（输入）/ 10 秒（广播） | 60 秒 |
| 触发条件 | 主线程阻塞 | 主线程阻塞 |
| 处理方式 | 弹出 ANR 对话框 | 杀死 SystemServer |
| 后果 | App 无响应 | 系统重启 |

---

## 七、面试考点

### 7.1 基础问题

#### Q1: 什么是 SystemServer 进程？

**参考答案**：
SystemServer 是 Android 系统中一个特殊的进程，由 Zygote 进程 fork 创建。它负责启动和管理所有核心系统服务（AMS、PMS、WMS 等约 50+ 服务）。SystemServer 的 UID/GID 为 1000（system），拥有较高的系统权限。如果 SystemServer 崩溃，Watchdog 会触发系统重启。

#### Q2: SystemServer 的启动流程是什么？

**参考答案**：
1. Zygote 调用 `forkSystemServer()` fork 新进程
2. 子进程设置 ThreadGroup 和优先级
3. 加载 `SystemServer` 类并创建实例
4. 调用 `SystemServer.run()`：
   - `Looper.prepareMainLooper()` 创建主线程 Looper
   - `createSystemContext()` 创建系统上下文
   - `startBootstrapServices()` 启动引导服务
   - `startCoreServices()` 启动核心服务
   - `startOtherServices()` 启动其他服务
   - `Looper.loop()` 进入消息循环

#### Q3: SystemServer 启动的服务分为哪几个阶段？

**参考答案**：
1. **Bootstrap Services**：最核心的服务，包括 Installer、AMS、PowerManager、DisplayManager、PMS、UserManager 等
2. **Core Services**：系统运行必需的服务，包括 BatteryService、UsageStatsService、WebViewUpdateService 等
3. **Other Services**：功能扩展服务，包括 WMS、InputManager、AudioService、BluetoothService、WifiService 等

### 7.2 进阶问题

#### Q4: SystemServer 如何注册系统服务？

**参考答案**：
SystemServer 通过两种方式注册服务：
1. **直接注册**：调用 `ServiceManager.addService(name, service)` 将服务注册到 ServiceManager
2. **通过 SystemServiceManager**：调用 `mSystemServiceManager.startService(ServiceClass.class)`，内部会调用 addService

注册后，服务会添加到 ServiceManager 的服务注册表中。其他进程可以通过 `ServiceManager.getService(name)` 获取服务的 IBinder 引用，然后通过 AIDL 接口调用服务。

#### Q5: SystemServer 的线程模型是怎样的？

**参考答案**：
SystemServer 包含以下线程：
1. **主线程**：运行 `Looper.loop()`，处理 Handler 消息、系统广播、输入事件等
2. **Binder 线程池**：默认 15 个线程，处理来自 App 进程的 Binder 调用（如 startActivity、startService 等）
3. **其他工作线程**：如 InputReader、InputDispatcher、Animation 等

主线程负责协调各服务，Binder 线程池负责处理跨进程调用。如果主线程阻塞超过 60 秒，Watchdog 会触发系统重启。

#### Q6: Watchdog 是如何工作的？

**参考答案**：
Watchdog 是一个独立的监控线程，工作原理如下：
1. 每隔 60 秒检查一次系统健康状态
2. 向 SystemServer 主线程的 Handler 发送同步消息
3. 等待消息处理完成（超时 30 秒）
4. 如果消息未被处理，说明主线程阻塞
5. 调用所有 Monitor 对象的 `monitor()` 方法，检查各服务状态
6. 如果确认系统无响应，调用 `Process.killProcess()` 杀死 SystemServer
7. Init 进程检测到 SystemServer 退出，触发系统重启

### 7.3 深度问题

#### Q7: SystemServer 崩溃会发生什么？

**参考答案**：
SystemServer 崩溃会触发系统重启，流程如下：
1. SystemServer 进程退出（PID 被释放）
2. Init 进程检测到 system_server 服务退出
3. Init 根据 rc 配置，重启关键服务
4. 由于 SystemServer 包含所有核心服务，实际上会触发系统重启
5. 如果是 Watchdog 触发的，会生成 tombstone 文件（/data/tombstones/）
6. 系统记录崩溃日志到 logcat 和 kernel log

**预防措施**：
- 系统服务实现 Monitor 接口，定期检查健康状态
- 避免在主线程执行耗时操作
- 使用异步处理和网络超时机制
- 添加 Watchdog 超时豁免（Watchdog.getInstance().pause()/resume()）

#### Q8: 为什么 SystemServer 要分三个阶段启动服务？

**参考答案**：
分阶段启动是为了处理服务间的依赖关系：

1. **Bootstrap Services**：
   - 这些服务是其他服务的基础
   - 例如：AMS 管理所有进程，PMS 管理所有 APK
   - 必须先启动，其他服务才能正常工作

2. **Core Services**：
   - 系统运行必需的服务
   - 依赖 Bootstrap Services，但被 Other Services 依赖
   - 例如：BatteryService 需要 PMS 提供权限信息

3. **Other Services**：
   - 功能扩展服务，可以并行启动
   - 依赖前两个阶段的服务
   - 例如：WMS 需要 AMS 和 DisplayManager

这种设计确保服务按正确的顺序启动，避免循环依赖和空指针异常。

#### Q9: SystemServer 的 Binder 线程池大小是如何确定的？

**参考答案**：
Binder 线程池大小由以下因素决定：

1. **默认值**：15 个线程（`DEFAULT_MAX_BINDER_THREADS`）
2. **计算公式**：`max(2, min(15, cpu_count * 2))`
3. **可配置**：通过 `ro.binder.max_threads` 系统属性覆盖

**为什么是 15 个**？
- 太少：并发请求会排队，增加延迟
- 太多：线程切换开销大，占用内存
- 15 个是经验值，平衡并发和开销

**动态调整**：
```java
// 运行时调整线程池大小
ThreadPool.setMinThreadPoolSize(20);
ThreadPool.setMaxThreadPoolSize(30);
```

---

## 八、参考资料

1. [Android 源码 - SystemServer.java](https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/SystemServer.java)
2. [Android 源码 - SystemServiceManager.java](https://android.googlesource.com/platform/frameworks/base/+/master/services/core/java/com/android/server/SystemServiceManager.java)
3. [Android 源码 - Watchdog.java](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/com/android/server/Watchdog.java)
4. [Android 源码 - ServiceManager.java](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/os/ServiceManager.java)
5. [Android 系统服务架构详解](https://developer.android.com/guide/components/services)

---

**本文约 13,000 字，涵盖 SystemServer 进程的核心知识点。建议结合源码深入理解，并在实际项目中观察 SystemServer 的行为**。
