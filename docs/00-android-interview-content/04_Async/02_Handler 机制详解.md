# Handler 机制详解 📬

> Android 消息处理核心，面试必考底层原理

---

## 一、Handler 核心概念

### 1.1 三大组件

```
┌─────────────────────────────────────────────────────────┐
│              Handler 消息机制                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Handler (发送者)                                       │
│     ↓ 发送 Message                                      │
│  MessageQueue (消息队列)                                │
│     ↓ 取出 Message                                      │
│  Looper (循环器)                                        │
│     ↓ 分发 Message                                      │
│  Handler (接收者)                                       │
│     ↓ 处理 Message                                      │
│  callback / handleMessage                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 基础使用

```kotlin
// 1. 基本用法
class MyActivity : AppCompatActivity() {
    
    // 创建 Handler
    private val handler = Handler(Looper.getMainLooper()) { message ->
        when (message.what) {
            1 -> {
                // 处理消息 1
                textView.text = "Message 1"
            }
            2 -> {
                // 处理消息 2
                textView.text = "Message 2"
            }
        }
        true  // 返回 true 表示已处理
    }
    
    // 发送消息
    fun sendMessage() {
        // 方式 1: sendEmptyMessage
        handler.sendEmptyMessage(1)
        
        // 方式 2: sendMessage
        val message = handler.obtainMessage(2)
        handler.sendMessage(message)
        
        // 方式 3: post
        handler.post {
            // Runnable 任务
            textView.text = "Runnable"
        }
    }
    
    // 延迟发送
    fun sendDelayedMessage() {
        handler.sendEmptyMessageDelayed(1, 1000)  // 1 秒后
        handler.postDelayed({
            // 1 秒后执行
        }, 1000)
    }
    
    // 移除消息
    fun removeMessages() {
        handler.removeCallbacksAndMessages(null)  // 移除所有
        handler.removeMessages(1)  // 移除特定消息
        handler.removeCallbacks(runnable)  // 移除特定 Runnable
    }
}

// 2. 继承方式
class MyHandler : Handler() {
    companion object {
        const val MSG_UPDATE = 1
        const val MSG_LOAD = 2
    }
    
    override fun handleMessage(msg: Message) {
        when (msg.what) {
            MSG_UPDATE -> {
                // 更新 UI
            }
            MSG_LOAD -> {
                // 加载数据
            }
        }
    }
}

// 使用
val handler = MyHandler()
handler.sendEmptyMessage(MyHandler.MSG_UPDATE)
```

---

## 二、源码分析

### 2.1 Handler 发送消息流程

```kotlin
// Handler.java
public void sendMessage(Message msg) {
    sendMessageDelayed(msg, 0);
}

public boolean sendMessageDelayed(Message msg, long delayMillis) {
    if (delayMillis < 0) {
        delayMillis = 0;
    }
    return sendMessageAtTime(msg, SystemClock.uptimeMillis() + delayMillis);
}

public boolean sendMessageAtTime(Message msg, long uptimeMillis) {
    MessageQueue queue = mQueue;
    if (queue == null) {
        RuntimeException e = new RuntimeException(
            this + " Attempted to send message to a queue " +
            "on a thread that has no Looper");
        e.printStackTrace();
        return false;
    }
    return enqueueMessage(queue, msg, uptimeMillis);
}

private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis) {
    msg.target = this;  // 关联 Handler
    msg.workSourceUid = ThreadLocalWorkSource.getUid();
    
    if (mAsynchronous) {
        msg.setAsynchronous(true);
    }
    
    return queue.enqueueMessage(msg, uptimeMillis);
}
```

### 2.2 MessageQueue 入队

```kotlin
// MessageQueue.java
boolean enqueueMessage(Message msg, long when) {
    if (msg.target == null) {
        throw new IllegalArgumentException("Message must have a target.");
    }
    
    if (msg.isInUse()) {
        throw new IllegalStateException(msg + " This message is already in use.");
    }
    
    synchronized (this) {
        if (mQuitting) {
            recycleMessageLocked(msg);
            return false;
        }
        
        msg.when = when;
        Message p = mMessages;
        
        if (p == null || when == 0 || when < p.when) {
            // 插入到队头
            msg.next = p;
            mMessages = msg;
            nativeWake(mPtr);
        } else {
            // 插入到队列中间
            Message prev = null;
            while (p != null) {
                if (when < p.when) {
                    break;
                }
                prev = p;
                p = p.next;
            }
            msg.next = prev.next;
            prev.next = msg;
        }
    }
    
    return true;
}
```

### 2.3 Looper 循环

```kotlin
// Looper.java
public static void loop() {
    final Looper me = myLooper();
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
    
    final MessageQueue queue = me.mQueue;
    
    // Make sure the identity of this thread is that of the local process,
    // and keep track of what that identity token actually is.
    Binder.clearCallingIdentity();
    final long ident = Binder.clearCallingIdentity();
    
    for (;;) {
        Message msg = queue.next();  // 可能阻塞
        if (msg == null) {
            // No message indicates that the message queue is quitting.
            return;
        }
        
        // This must be in a local variable, in case a UI event sets the logger
        Printer logging = me.mLogging;
        if (logging != null) {
            logging.println(">>>>> Dispatching to " + msg.target + " " +
                    msg.callback + ": " + msg.what);
        }
        
        final long slowDispatchThresholdMs = me.mSlowDispatchThresholdMs;
        final long startTime = SystemClock.uptimeMillis();
        
        try {
            msg.target.dispatchMessage(msg);  // 分发消息
        } finally {
            if (logging != null) {
                logging.println("<<<<< Finished to " + msg.target + " " + msg.callback);
            }
        }
        
        final long endTime = SystemClock.uptimeMillis();
        
        // 检查是否耗时
        if (endTime - startTime > slowDispatchThresholdMs) {
            Slog.w(TAG, "Dispatch took " + (endTime - startTime) + "ms on "
                    + Thread.currentThread().getName() + ", h=" + msg.target);
        }
        
        ident = Binder.clearCallingIdentity();
        msg.recycleUnchecked();
    }
}
```

### 2.4 Handler 分发

```kotlin
// Handler.java
public void dispatchMessage(Message msg) {
    if (msg.callback != null) {
        handleCallback(msg);  // 1. Runnable
    } else {
        if (mCallback != null) {
            if (mCallback.handleMessage(msg)) {  // 2. Callback
                return;
            }
        }
        handleMessage(msg);  // 3. handleMessage
    }
}

private void handleCallback(Message msg) {
    msg.callback.run();
}
```

---

## 三、线程切换原理

### 3.1 子线程 → 主线程

```kotlin
// 子线程发送消息到主线程
class MyViewModel : ViewModel() {
    
    private val mainHandler = Handler(Looper.getMainLooper())
    
    fun loadData() {
        // 子线程
        CoroutineScope(Dispatchers.IO).launch {
            val data = api.getData()  // 网络请求
            
            // 切换到主线程更新 UI
            mainHandler.post {
                // 这里在主线程执行
                uiState.value = UiState.Success(data)
            }
        }
    }
}

// 原理分析
// 1. 主线程创建 Handler（关联主线程 Looper）
// 2. 子线程通过 Handler 发送消息
// 3. 消息进入主线程 MessageQueue
// 4. Looper 循环取出消息
// 5. Handler.dispatchMessage 在主线程执行
```

### 3.2 ThreadLocal 原理

```kotlin
// ThreadLocal 存储每个线程的 Looper
public final class Looper {
    static final ThreadLocal<Looper> sThreadLocal = new ThreadLocal<Looper>();
    
    private static void prepare(boolean quitAllowed) {
        if (sThreadLocal.get() != null) {
            throw new RuntimeException("Only one Looper may be created per thread");
        }
        sThreadLocal.set(new Looper(quitAllowed));
    }
    
    public static @Nullable Looper myLooper() {
        return sThreadLocal.get();
    }
}

// 使用示例
class MyThreadLocal {
    private val threadLocal = ThreadLocal<String>()
    
    fun test() {
        // 线程 1
        Thread {
            threadLocal.set("Thread 1")
            println(threadLocal.get())  // "Thread 1"
        }.start()
        
        // 线程 2
        Thread {
            threadLocal.set("Thread 2")
            println(threadLocal.get())  // "Thread 2"
        }.start()
        
        // 主线程
        println(threadLocal.get())  // null
    }
}
```

---

## 四、Handler 与协程对比

### 4.1 功能对比

| 特性 | Handler | 协程 |
|------|---------|------|
| **线程切换** | 支持 | 支持 |
| **延迟任务** | 支持 | 支持 |
| **消息队列** | 有 | 无 |
| **代码可读性** | 一般 | 优秀 |
| **异常处理** | 一般 | 优秀 |
| **推荐使用** | 旧项目 | 新项目 |

### 4.2 代码对比

```kotlin
// Handler 方式
class MyActivity : AppCompatActivity() {
    
    private val handler = Handler(Looper.getMainLooper())
    
    fun loadData() {
        // 子线程
        Thread {
            val data = api.getData()
            
            // 主线程
            handler.post {
                updateUI(data)
            }
        }.start()
    }
}

// 协程方式
class MyActivity : AppCompatActivity() {
    
    fun loadData() {
        lifecycleScope.launch {
            // 子线程
            val data = withContext(Dispatchers.IO) {
                api.getData()
            }
            
            // 主线程（自动切换）
            updateUI(data)
        }
    }
}
```

---

## 五、内存泄漏问题

### 5.1 常见泄漏场景

```kotlin
// ❌ 场景 1: 非静态内部类 Handler
class MyActivity : AppCompatActivity() {
    
    private val handler = Handler() { message ->
        // 隐式引用 Activity
        textView.text = message.obj as String
        true
    }
    
    fun startTask() {
        handler.postDelayed({
            // 延迟任务引用 Activity
        }, 5000)
    }
}

// 泄漏原因:
// 1. Handler 非静态，持有 Activity 引用
// 2. Message 持有 Handler 引用
// 3. MessageQueue 持有 Message 引用
// 4. Looper 持有 MessageQueue 引用（静态）
// 5. Activity 销毁后，引用链未断开

// ✅ 解决方案 1: 静态内部类 + 弱引用
class MyActivity : AppCompatActivity() {
    
    private val handler = MyHandler(this)
    
    private class MyHandler(activity: MyActivity) : Handler() {
        private val activityRef = WeakReference(activity)
        
        override fun handleMessage(msg: Message) {
            val activity = activityRef.get()
            activity?.let {
                it.textView.text = msg.obj as String
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)  // 清理消息
    }
}

// ✅ 解决方案 2: 使用 Callback
class MyActivity : AppCompatActivity(), Handler.Callback {
    
    private val handler = Handler(Looper.getMainLooper(), this)
    
    override fun handleMessage(msg: Message): Boolean {
        textView.text = msg.obj as String
        return true
    }
    
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
    }
}

// ✅ 解决方案 3: 使用协程（推荐）
class MyActivity : AppCompatActivity() {
    
    private var job: Job? = null
    
    fun startTask() {
        job = lifecycleScope.launch {
            val data = withContext(Dispatchers.IO) {
                api.getData()
            }
            updateUI(data)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        job?.cancel()  // 自动取消
    }
}

// ❌ 场景 2: 延迟消息未清理
class MyActivity : AppCompatActivity() {
    
    private val handler = Handler(Looper.getMainLooper())
    
    fun startLongTask() {
        handler.postDelayed({
            // 10 秒后执行
            updateUI()
        }, 10000)
    }
    
    // 如果 Activity 在 10 秒内销毁，会泄漏
}

// ✅ 解决方案
class MyActivity : AppCompatActivity() {
    
    private val handler = Handler(Looper.getMainLooper())
    
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)  // 清理所有消息
    }
}
```

### 5.2 Handler 线程池

```kotlin
// 使用 HandlerThread
class BackgroundHandler {
    
    private lateinit var handlerThread: HandlerThread
    private lateinit var backgroundHandler: Handler
    
    fun start() {
        handlerThread = HandlerThread("BackgroundThread")
        handlerThread.start()
        
        backgroundHandler = Handler(handlerThread.looper)
    }
    
    fun postTask(task: Runnable) {
        backgroundHandler.post(task)
    }
    
    fun stop() {
        handlerThread.quitSafely()
    }
}

// 使用
val backgroundHandler = BackgroundHandler()
backgroundHandler.start()

backgroundHandler.postTask {
    // 在后台线程执行
    doWork()
}

// 停止
backgroundHandler.stop()
```

---

## 六、面试核心考点

### 6.1 基础问题

**Q1: Handler、MessageQueue、Looper 的关系？**

**A:**
- **Handler**: 发送和处理消息
- **MessageQueue**: 消息队列，存储消息
- **Looper**: 循环器，从队列取消息并分发给 Handler
- **关系**: 一个线程一个 Looper，一个 Looper 一个 MessageQueue，可以有多个 Handler

**Q2: 为什么主线程不需要 Looper.prepare()？**

**A:**
```kotlin
// ActivityThread.java
public static void main(String[] args) {
    // ...
    Looper.prepareMainLooper();  // 创建主线程 Looper
    // ...
    ActivityThread thread = new ActivityThread();
    thread.attach(false);
    // ...
    Looper.loop();  // 开始循环
}
```
- 主线程在 `ActivityThread.main()` 中已经调用了 `prepareMainLooper()`

**Q3: 子线程如何创建 Handler？**

**A:**
```kotlin
// 方式 1: 使用主线程 Looper
val handler = Handler(Looper.getMainLooper())

// 方式 2: 在子线程创建 Looper
Thread {
    Looper.prepare()
    val handler = Handler()
    Looper.loop()
}.start()
```

### 6.2 进阶问题

**Q4: MessageQueue 是如何实现消息排序的？**

**A:**
- 使用**链表**结构
- 按 `when` 时间排序
- 新消息按时间插入到合适位置
- 队头永远是最近要执行的消息

**Q5: Looper.loop() 为什么不会卡死主线程？**

**A:**
```kotlin
// nativePollOnce 是阻塞式等待
Message msg = queue.next();  // 可能阻塞

// 1. 有消息时立即返回
// 2. 无消息时阻塞，不占用 CPU
// 3. 有新消息时通过 nativeWake 唤醒
// 4. 系统事件（触摸、网络等）会触发唤醒
```

**Q6: 如何实现线程切换？**

**A:**
```kotlin
// 1. 创建关联目标线程 Looper 的 Handler
val mainHandler = Handler(Looper.getMainLooper())

// 2. 在子线程通过 Handler 发送消息
Thread {
    val data = fetchData()
    mainHandler.post {
        // 这里在主线程执行
        updateUI(data)
    }
}.start()

// 原理：消息进入主线程 MessageQueue，Looper 在主线程分发
```

### 6.3 实战问题

**Q7: 如何避免 Handler 内存泄漏？**

**A:**
1. **静态内部类 + 弱引用**
2. **在 onDestroy 中清理消息**
3. **使用协程替代**（推荐）

**Q8: Handler 如何处理延迟消息？**

**A:**
```kotlin
// 1. 计算执行时间
long uptimeMillis = SystemClock.uptimeMillis() + delayMillis;

// 2. 按时间插入队列
msg.when = uptimeMillis;
// 插入到合适位置

// 3. Looper 循环检查
Message msg = queue.next();  // 到时间才返回

// 4. 使用 native 唤醒
if (when < p.when) {
    nativeWake(mPtr);  // 提前唤醒
}
```

---

## 七、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| Handler 三组件 | ⭐⭐ | Handler/MessageQueue/Looper |
| 主线程 Looper | ⭐⭐⭐ | ActivityThread.main |
| 消息排序 | ⭐⭐⭐ | 链表、按 when 排序 |
| 线程切换 | ⭐⭐⭐ | Handler 关联不同 Looper |
| 内存泄漏 | ⭐⭐⭐ | 静态类、弱引用、清理 |
| Looper.loop 不卡死 | ⭐⭐⭐⭐ | nativePollOnce 阻塞 |
| 延迟消息 | ⭐⭐⭐ | 时间插入、nativeWake |

---

**📚 参考资料**
- [Handler 源码分析](https://juejin.cn/post/xxxx)
- [Android 消息机制](https://developer.android.com/guide/components/processes-and-threads)
- [Looper 源码](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/os/Looper.java)

**🔗 下一篇**: [Binder 与 IPC](../12_System/02_Binder 机制.md)
