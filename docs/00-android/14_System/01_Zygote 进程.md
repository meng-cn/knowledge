# 01_Zygote 进程

> **核心摘要**：Zygote 是 Android 系统的"受精卵"进程，所有应用进程的父进程。理解 Zygote 是理解 Android 进程模型、启动流程和内存优化的关键。

---

## 一、Zygote 进程概述

### 1.1 什么是 Zygote

Zygote 一词源自生物学，意为"受精卵"。在 Android 系统中，Zygote 进程是所有应用程序进程的"母体"。

**核心特点**：
- 第一个由 Init 进程启动的 Java 进程
- 所有 App 进程的父进程（通过 fork 创建）
- 预加载常用类和资源，实现内存共享
- 监听 Socket 请求，响应 fork 新进程

### 1.2 Zygote 的架构位置

```
┌─────────────────────────────────────────────────────────┐
│                    Linux Kernel                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Init 进程                           │
│                   (PID = 1)                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Zygote 进程                           │
│                   (PID = 648)                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  预加载类：String, ArrayList, HashMap...        │    │
│  │  预加载资源：系统主题、样式、图片...            │    │
│  │  Socket 监听：/dev/socket/zygote                │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
          │                    │                    │
       fork()               fork()               fork()
          ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ App 进程 1 │        │ App 进程 2 │        │SystemServer│
    │ (PID 1001)│        │ (PID 1002)│        │ (PID 649) │
    └──────────┘        └──────────┘        └──────────┘
```

---

## 二、Zygote 启动流程

### 2.1 启动流程总览

```
Bootloader → Kernel → Init → Zygote → SystemServer
```

### 2.2 Init.rc 中的 Zygote 配置

Zygote 由 Init 进程根据 `/system/etc/init/hwservicemanager.rc` 或 `/system/etc/init/zygote.rc` 启动。

**zygote.rc 核心配置**：

```rc
# /system/etc/init/zygote.rc

service zygote /system/bin/app_process -Xzygote /system/bin --zygote --start-system-server
    class main
    priority -20
    user root
    group root readproc reserved_disk
    socket zygote stream 660 root system
    socket zygote_secondary stream 660 root system
    socket zygote/critcal stream 660 root system
    onrestart
        write /proc/sys/kernel/sysrq_trigger c
```

**关键参数解析**：

| 参数 | 说明 |
|------|------|
| `service zygote` | 服务名称 |
| `/system/bin/app_process` | 可执行文件路径 |
| `-Xzygote` | JVM 参数，启用 Zygote 模式 |
| `--zygote` | 标识以 Zygote 模式运行 |
| `--start-system-server` | 启动 SystemServer |
| `socket zygote` | 创建 Unix Domain Socket |

### 2.3 app_process 启动流程

`app_process` 是 Zygote 的入口可执行文件，位于 `frameworks/base/cmds/app_process/`。

**核心源码**（`app_main.cpp`）：

```cpp
// frameworks/base/cmds/app_process/app_main.cpp

int main(int argc, char* const argv[])
{
    AppRuntime runtime(argv[0], computeArgBlockSize(argc, argv));
    
    // 解析命令行参数
    while (i < argc) {
        const char* arg = argv[i++];
        if (strcmp(arg, "--zygote") == 0) {
            zygote = true;
            niceName = ZYGOTE_NICE_NAME;
        } else if (strcmp(arg, "--start-system-server") == 0) {
            startSystemServer = true;
        }
        // ... 其他参数解析
    }
    
    if (zygote) {
        // 启动 Zygote
        runtime.start("com.android.internal.os.ZygoteInit", args, zygote);
    } else {
        // 启动普通应用
        runtime.start("com.android.internal.os.RuntimeInit", args, zygote);
    }
}
```

### 2.4 AndroidRuntime.start() 流程

```java
// frameworks/base/core/jni/AndroidRuntime.cpp

void AndroidRuntime::start(const char* className, const Vector<String8>& options, bool zygote)
{
    // 1. 创建 JavaVM
    JavaVM* jvm;
    JNIEnv* env;
    if (startVm(&mJavaVM, &env, zygote) != 0) return;
    
    // 2. 注册 JNI 方法
    if (startReg(env) < 0) return;
    
    // 3. 获取 main 方法
    jclass stringClass = env->FindClass("java/lang/String");
    jclass startClass = env->FindClass(className);
    jmethodID startMeth = env->GetStaticMethodID(startClass, "main", 
        "([Ljava/lang/String;)V");
    
    // 4. 调用 Java 入口
    env->CallStaticVoidMethod(startClass, startMeth, strArray);
}
```

### 2.5 ZygoteInit.main() 核心流程

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

public static void main(String[] argv) {
    // 1. 创建 ServerSocket，监听 fork 请求
    ZygoteServer zygoteServer = new ZygoteServer();
    
    // 2. 预加载类和资源
    preload(bootTimingsTraceLog);
    
    // 3. 启动 SystemServer（如果指定）
    if (startSystemServer) {
        Runnable r = forkSystemServer(abiList, zygoteSocketName, zygoteServer);
        if (r != null) r.run();
    }
    
    // 4. 进入循环，等待 AMS 请求 fork 新进程
    zygoteServer.runSelectLoop();
}
```

**详细流程图**：

```
┌─────────────────────────────────────────────────────────────┐
│                    ZygoteInit.main()                        │
├─────────────────────────────────────────────────────────────┤
│  1. ZygoteServer zygoteServer = new ZygoteServer()          │
│     └─> 创建 ServerSocket: /dev/socket/zygote               │
│                                                             │
│  2. preload()                                               │
│     ├─> preloadClasses()    - 加载 5000+ 常用类             │
│     ├─> preloadResources()  - 加载系统资源                  │
│     ├─> preloadAppProcess() - 初始化 EGL/OpenGL             │
│     ├─> preloadGraphicsDriver()                             │
│     └─> preloadSharedLibraries()                            │
│                                                             │
│  3. forkSystemServer()                                      │
│     └─> 创建 SystemServer 进程 (PID = ZygotePID + 1)        │
│                                                             │
│  4. runSelectLoop()                                         │
│     └─> while(true) 循环等待 AMS 的 fork 请求               │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、Zygote 的作用

### 3.1 进程孵化（Fork 机制）

Zygote 的核心作用是通过 `fork()` 系统调用创建新进程。

**为什么使用 fork**？

1. **写时复制**（Copy-On-Write）：子进程共享父进程的内存页，只有在写入时才复制
2. **快速启动**：无需重新加载 JVM 和预加载类
3. **内存共享**：预加载的类和资源在多个进程间共享

**Fork 流程源码**：

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteConnection.java

void processCommand(ZygoteConnection peer, Runnable[] commands) {
    // 1. 解析 fork 参数
    Arguments args = new Arguments();
    args.parse(arguments);
    
    // 2. 调用 native fork
    pid = Zygote.forkAndSpecialize(
        args.uid, args.gid, args.gids, args.debugFlags,
        rlimits, args.mountExternal, args.seInfo, args.niceName,
        fdsToClose, fdsToIgnore, args.instructionSet, args.appDataDir
    );
    
    if (pid == 0) {
        // 子进程（新 App 进程）
        handleChildProc();
    } else {
        // 父进程（Zygote）
        handleParentProc(pid);
    }
}
```

```cpp
// frameworks/base/core/jni/com_android_internal_os_Zygote.cpp

static jint com_android_internal_os_Zygote_nativeForkAndSpecialize(
    JNIEnv* env, jclass clazz, jint uid, jint gid, jintArray gids,
    jint debug_flags, jobjectArray rlimits, jint mount_external,
    jstring se_info, jstring nice_name, jintArray fds_to_close,
    jintArray fds_to_ignore, jstring instruction_set, jstring app_data_dir)
{
    // 1. fork 系统调用
    pid_t pid = fork();
    
    if (pid == 0) {
        // 子进程
        SpecializeCommon(env, uid, gid, gids, debug_flags, rlimits,
            mount_external, se_info, nice_name, false, instruction_set, app_data_dir);
        return 0;
    } else {
        // 父进程
        return pid;
    }
}
```

### 3.2 内存共享机制

**COW**（Copy-On-Write）：

```
┌─────────────────────────────────────────────────────────────┐
│                      Zygote 进程                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  物理内存页：[Class A][Class B][Resource C]         │    │
│  │  页表映射：虚拟地址 → 物理地址 (只读)                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
        fork()               fork()               fork()
           ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  App 进程 1   │    │  App 进程 2   │    │  App 进程 3   │
│ 页表：共享  │    │ 页表：共享  │    │ 页表：共享  │
│ [Class A]───┼────┼─[Class A]───┼────┼─[Class A]    │
│ [Class B]───┼────┼─[Class B]───┼────┼─[Class B]    │
│ [写 Class D] │    │ [写 Class E] │    │ [只读]       │
│   ↓ 复制     │    │   ↓ 复制     │    │              │
│ [Class D*]   │    │ [Class E*]   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘

* = 私有副本，不共享
```

**内存共享效果**：

| 场景 | 无 Zygote | 有 Zygote | 节省 |
|------|-----------|-----------|------|
| 10 个 App 进程 | 10 × 50MB = 500MB | 50MB + 10 × 10MB = 150MB | 70% |
| 50 个 App 进程 | 50 × 50MB = 2500MB | 50MB + 50 × 10MB = 550MB | 78% |

### 3.3 预加载机制

#### 3.3.1 预加载类

**预加载配置文件**：`/system/etc/preloaded-classes`

```
# 预加载约 5000 个常用类
android.app.Activity
android.app.Application
android.content.Context
android.view.View
android.widget.TextView
android.widget.ImageView
java.lang.String
java.util.ArrayList
java.util.HashMap
java.util.concurrent.ThreadPoolExecutor
...
```

**预加载源码**：

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

private static void preloadClasses() {
    InputStream is = new FileInputStream(PRELOADED_CLASSES);
    BufferedReader br = new BufferedReader(new InputStreamReader(is));
    
    String line;
    while ((line = br.readLine()) != null) {
        line = line.trim();
        if (line.startsWith("#") || line.equals("")) continue;
        
        try {
            // 加载类到方法区
            Class.forName(line, true, null);
        } catch (ClassNotFoundException e) {
            // 忽略不存在的类
        }
    }
}
```

#### 3.3.2 预加载资源

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

private static void preloadResources() {
    // 1. 获取 Resources 对象
    Resources res = Resources.getSystem();
    
    // 2. 预加载主题
    for (int i = 0; i < 2; i++) {
        int theme = (i == 0) ? 
            com.android.internal.R.style.Theme : 
            com.android.internal.R.style.Theme_Holo;
        res.newTheme().applyStyle(theme, true);
    }
    
    // 3. 预加载 ArrayMap 缓存
    ArrayMap<String, String> map = new ArrayMap<>();
    map.put("key", "value");
    
    // 4. 预加载 Drawable
    res.getDrawable(com.android.internal.R.drawable.alert_dialog_frame);
    res.getDrawable(com.android.internal.R.drawable.edit_text);
}
```

---

## 四、SystemServer 启动

### 4.1 forkSystemServer 流程

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

private static Runnable forkSystemServer(String abiList, String socketName,
        ZygoteServer zygoteServer) {
    // 1. 准备 fork 参数
    long[] capabilities = posixCapabilitiesAsBits(
        OsConstants.CAP_KILL,
        OsConstants.CAP_NET_ADMIN,
        OsConstants.CAP_NET_BIND_SERVICE,
        // ... 更多权限
    );
    
    // 2. fork SystemServer 进程
    pid = Zygote.forkSystemServer(
        uid, gid, gids, debugFlags, rlimits,
        capabilities, null, null);
    
    if (pid == 0) {
        // 3. 子进程：SystemServer
        if (hasSecondZygote(abiList)) {
            waitForSecondaryZygote(socketName);
        }
        zygoteServer.closeServerSocket();
        return handleSystemServerProcess();
    }
    
    return null;
}
```

### 4.2 SystemServer 进程入口

```java
// frameworks/base/core/java/com/android/internal/os/ZygoteInit.java

private static Runnable handleSystemServerProcess() {
    // 1. 设置 ThreadGroup
    Thread.setGroup(new ThreadGroup("SystemServer"));
    Thread.currentThread().setPriority(Thread.NORM_PRIORITY);
    
    // 2. 加载 SystemServer 类
    Class<?> cl = Class.forName("com.android.server.SystemServer");
    
    // 3. 创建并返回 SystemServer 实例
    return (Runnable) cl.newInstance();
}
```

```java
// frameworks/base/services/java/com/android/server/SystemServer.java

public final class SystemServer implements Runnable {
    @Override
    public void run() {
        // 1. 初始化主线程 Looper
        Looper.prepareMainLooper();
        
        // 2. 加载 Android 库
        System.loadLibrary("android_servers");
        
        // 3. 初始化系统上下文
        createSystemContext();
        
        // 4. 启动系统服务
        startBootstrapServices();
        startCoreServices();
        startOtherServices();
        
        // 5. 进入消息循环
        Looper.loop();
    }
}
```

### 4.3 SystemServer 启动的服务

**启动顺序**：

```
┌─────────────────────────────────────────────────────────────┐
│              startBootstrapServices()                       │
├─────────────────────────────────────────────────────────────┤
│  1. InstallerService     - APK 安装服务                     │
│  2. ActivityManagerService - AMS，核心服务                  │
│  3. PowerManagerService  - 电源管理                         │
│  4. RecoveryService      - 恢复模式                         │
│  5. LightsService        - 指示灯管理                       │
│  6. DisplayManagerService - 显示管理                        │
│  7. PackageManagerService - PMS，包管理                     │
│  8. UserManagerService   - 用户管理                         │
│  9. CryptoService        - 加密服务                         │
│ 10. NetworkManagementService - 网络管理                     │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               startCoreServices()                           │
├─────────────────────────────────────────────────────────────┤
│  1. BatteryService       - 电池管理                         │
│  2. UsageStatsService    - 使用统计                         │
│  3. WebViewUpdateService - WebView 更新                     │
│  4. CacheManagerService  - 缓存管理                         │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              startOtherServices()                           │
├─────────────────────────────────────────────────────────────┤
│  1. WindowManagerService - WMS，窗口管理                    │
│  2. InputManagerService  - 输入管理                         │
│  3. AudioService         - 音频服务                         │
│  4. BluetoothService     - 蓝牙服务                         │
│  5. WifiService          - WiFi 服务                        │
│  6. LocationManagerService - 定位服务                       │
│  7. NotificationManagerService - 通知服务                   │
│  ... (约 50+ 系统服务)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、面试考点

### 5.1 基础问题

#### Q1: 什么是 Zygote 进程？

**参考答案**：
Zygote 是 Android 系统的第一个 Java 进程，由 Init 进程启动。它是所有 App 进程的父进程，通过 fork 机制创建新进程。Zygote 预加载了常用类和资源，利用 COW 机制实现内存共享，显著提高应用启动速度并降低内存占用。

#### Q2: Zygote 的启动流程是什么？

**参考答案**：
1. Init 进程解析 `zygote.rc` 配置文件
2. 执行 `/system/bin/app_process` 可执行文件
3. `app_process` 创建 `AppRuntime`，调用 `start()` 启动 JVM
4. JVM 加载 `ZygoteInit` 类并调用 `main()` 方法
5. `ZygoteInit` 创建 ServerSocket，预加载类和资源
6. 如果指定 `--start-system-server`，fork SystemServer 进程
7. 进入 `runSelectLoop()` 循环，等待 AMS 的 fork 请求

#### Q3: Zygote 如何创建新进程？

**参考答案**：
Zygote 通过 Unix Domain Socket 接收 AMS 的 fork 请求，调用 `Zygote.forkAndSpecialize()` native 方法。该方法执行 Linux `fork()` 系统调用，创建子进程。子进程继承父进程的内存空间（COW 机制），然后执行 `exec()` 加载目标应用。

### 5.2 进阶问题

#### Q4: Zygote 的内存共享原理是什么？

**参考答案**：
Zygote 利用 Linux 的 Copy-On-Write（COW）机制实现内存共享：
1. Zygote 预加载的类和资源存储在只读内存页
2. fork 时，子进程共享父进程的页表映射
3. 当子进程需要修改某内存页时，触发页错误
4. 内核复制该页给子进程，父进程保持原样
5. 未修改的内存页在所有进程中共享

这种机制使得多个进程可以共享相同的代码和资源，大幅降低内存占用。

#### Q5: 为什么 Zygote 要预加载类？预加载哪些类？

**参考答案**：
预加载的目的：
1. **加速应用启动**：常用类已加载到方法区，无需重复加载
2. **内存共享**：预加载的类在所有进程中共享
3. **减少碎片**：集中分配内存，减少碎片化

预加载的类包括：
- 核心类：String、ArrayList、HashMap 等
- UI 类：View、TextView、ImageView 等
- 框架类：Activity、Context、Intent 等
- 并发类：ThreadPoolExecutor、Handler 等

配置文件位于 `/system/etc/preloaded-classes`，约 5000 个类。

#### Q6: SystemServer 是如何启动的？

**参考答案**：
1. ZygoteInit.main() 解析 `--start-system-server` 参数
2. 调用 `forkSystemServer()`，通过 `Zygote.forkSystemServer()` fork 新进程
3. 子进程（SystemServer）关闭 ServerSocket，避免 fork 新进程
4. 设置 ThreadGroup 和优先级
5. 加载 `com.android.server.SystemServer` 类
6. 调用 SystemServer.run()，启动 Looper
7. 依次调用 `startBootstrapServices()`、`startCoreServices()`、`startOtherServices()`
8. 进入 `Looper.loop()` 消息循环

### 5.3 深度问题

#### Q7: Zygote 的 Socket 通信机制是怎样的？

**参考答案**：
Zygote 使用 Unix Domain Socket 与 AMS 通信：

```java
// ZygoteServer.java
public class ZygoteServer {
    private LocalServerSocket mServerSocket;
    
    public ZygoteServer() {
        // 创建 ServerSocket
        mServerSocket = new LocalServerSocket("zygote");
    }
    
    public void runSelectLoop() {
        while (true) {
            // 等待连接
            LocalSocket peer = mServerSocket.accept();
            
            // 创建 ZygoteConnection 处理请求
            ZygoteConnection conn = new ZygoteConnection(peer);
            conn.processCommand(this, commands);
        }
    }
}
```

AMS 通过 `LocalSocket` 连接到 `/dev/socket/zygote`，发送 fork 参数（UID、GID、进程名等）。Zygote 解析参数后 fork 新进程，并通过 Socket 返回子进程 PID。

#### Q8: 多 Zygote 架构（64 位/32 位）是如何工作的？

**参考答案**：
Android 5.0+ 支持多 Zygote 架构：

```
┌─────────────────────────────────────────────────────────────┐
│                      Init 进程                              │
└─────────────────────────────────────────────────────────────┘
           │                              │
    start zygote                   start zygote_secondary
           ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│   Zygote64       │          │   Zygote32       │
│   (64 位进程)     │          │   (32 位进程)     │
│   Socket: zygote │          │   Socket: zygote_secondary │
└──────────────────┘          └──────────────────┘
```

**工作原理**：
1. Init 启动两个 Zygote：`zygote`（64 位）和 `zygote_secondary`（32 位）
2. 64 位 Zygote 优先 fork 64 位应用
3. 32 位 Zygote 负责 fork 32 位应用
4. AMS 根据应用 ABI 选择合适的 Zygote

**配置**：
```rc
service zygote /system/bin/app_process64 -Xzygote /system/bin --zygote --start-system-server
service zygote_secondary /system/bin/app_process32 -Xzygote /system/bin --zygote
```

#### Q9: Zygote 的 COW 机制有什么局限性？

**参考答案**：
COW 机制的局限性：

1. **写操作导致内存复制**：
   - 如果应用修改了预加载类的静态字段，会触发 COW 复制
   - 失去内存共享优势

2. **类验证开销**：
   - 预加载的类在 Zygote 中已验证
   - 但某些类可能需要在子进程中重新验证

3. **资源冲突**：
   - 某些资源（如文件描述符）不能共享
   - fork 后需要关闭或重新打开

4. **64 位兼容性问题**：
   - 32 位和 64 位进程不能共享内存
   - 需要独立的 Zygote 进程

**优化方案**：
- 使用 `dalvik.vm.dex2oat-flags` 优化预加载
- 避免修改预加载类的静态字段
- 使用 `PR_SET_VMA` 标记匿名内存，避免共享

---

## 六、参考资料

1. [Android 源码 - ZygoteInit.java](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/com/android/internal/os/ZygoteInit.java)
2. [Android 源码 - app_main.cpp](https://android.googlesource.com/platform/frameworks/base/+/master/cmds/app_process/app_main.cpp)
3. [Android 进程模型详解](https://developer.android.com/guide/components/processes-and-threads)
4. [Linux fork() 系统调用](https://man7.org/linux/man-pages/man2/fork.2.html)
5. [Copy-On-Write 机制详解](https://en.wikipedia.org/wiki/Copy-on-write)

---

**本文约 12,000 字，涵盖 Zygote 进程的核心知识点。建议结合源码深入理解，并在实际项目中观察 Zygote 的行为**。
