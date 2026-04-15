# 05_AsyncTask 废弃替代

## 目录

1. [AsyncTask 概述](#1-asynctask-概述)
2. [AsyncTask 废弃原因](#2-asynctask-废弃原因)
3. [ExecutorService 替代方案](#3-executorservice-替代方案)
4. [协程替代方案](#4-协程替代方案)
5. [LiveData + ViewModel](#5-livedata---viewmodel)
6. [RxJava 替代方案](#6-rxjava-替代方案)
7. [对比分析](#7-对比分析)
8. [迁移指南](#8-迁移指南)
9. [面试高频考点](#9-面试高频考点)

---

## 1. AsyncTask 概述

### 1.1 AsyncTask 是什么

AsyncTask 是 Android 2.0（API 级别 8）引入的异步任务类，用于在后台线程执行耗时操作，并在主线程更新 UI。

**特点：**
- 无需手动管理线程
- 提供了简单的生命周期回调
- 直接在主线程更新 UI

### 1.2 AsyncTask 基本用法

```java
// 泛型：Params（参数）、Progress（进度）、Result（结果）
class DownloadTask extends AsyncTask<String, Integer, String> {
    
    @Override
    protected void onPreExecute() {
        // 任务开始前执行，在主线程
        progressBar.setVisibility(View.VISIBLE);
    }
    
    @Override
    protected String doInBackground(String... urls) {
        // 后台线程执行耗时操作
        for (int i = 0; i < 100; i++) {
            publishProgress(i); // 发布进度
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {}
        }
        return "下载完成";
    }
    
    @Override
    protected void onProgressUpdate(Integer... progress) {
        // 进度更新，在主线程
        progressBar.setProgress(progress[0]);
    }
    
    @Override
    protected void onPostExecute(String result) {
        // 任务完成后执行，在主线程
        progressBar.setVisibility(View.GONE);
        textView.setText(result);
    }
}

// 使用
new DownloadTask().execute("http://example.com/file");
```

### 1.3 AsyncTask 生命周期

```
┌─────────────────┐
│ onPreExecute()  │  ← 主线程
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│doInBackground() │  ← 工作线程
└────────┬────────┘
         │
         ├───▶ publishProgress()
         │       └──▶ onProgressUpdate()  ← 主线程
         │
         ▼
┌─────────────────┐
│onPostExecute()  │  ← 主线程
└─────────────────┘
```

### 1.4 核心源码解析

```java
public abstract class AsyncTask<Params, Progress, Result> {
    
    // 内部静态类 SerialExecutor（顺序执行）
    private static class SerialExecutor implements Executor {
        final ArrayDeque<Runnable> mTasks = new ArrayDeque<>();
        Runnable mActive;
        
        public void execute(final Runnable r) {
            synchronized (mTasks) {
                mTasks.offer(() -> {
                    try {
                        r.run();
                    } finally {
                        executeNext();
                    }
                });
                if (mActive == null) {
                    executeNext();
                }
            }
        }
        
        private void executeNext() {
            synchronized (mTasks) {
                if (mTasks.isEmpty()) {
                    return;
                }
                mActive = mTasks.poll();
            }
            THREAD_POOLExecutor.execute(mActive);
        }
    }
    
    // 线程池
    private static Executor SERIAL_EXECUTOR = new SerialExecutor();
    private static final int CORE_POOL_SIZE = 5;
    private static final int MAXIMUM_POOL_SIZE = 20;
    private static final int KEEP_ALIVE = 1;
    
    private static final ThreadPoolExecutor THREAD_POOL_EXECUTOR =
        new ThreadPoolExecutor(
            CORE_POOL_SIZE, MAXIMUM_POOL_SIZE, KEEP_ALIVE,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<Runnable>(10000),
            new ThreadFactory() {
                @Override
                public Thread newThread(Runnable r) {
                    return new Thread(r, "AsyncTask");
                }
            },
            new RejectedExecutionHandler() {
                @Override
                public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
                    throw new RejectedExecutionException(r);
                }
            }
        );
}
```

---

## 2. AsyncTask 废弃原因

### 2.1 官方声明

**Android 11（API 30）起标记为@Deprecated**

```java
@Deprecated
public abstract class AsyncTask<Params, Progress, Result>
```

**废弃原因官方说明：**
> AsyncTask 存在设计缺陷，不建议在新代码中使用。推荐使用 Kotlin 协程或 Executor 配合 Handler。

### 2.2 核心问题

#### 问题一：内存泄漏

```java
// ❌ 问题：持有 Activity 强引用，导致内存泄漏
class LeakyTask extends AsyncTask<Void, Void, Void> {
    private Activity activity;
    
    public LeakyTask(Activity activity) {
        this.activity = activity;
    }
    
    @Override
    protected Void doInBackground(Void... params) {
        // 耗时操作
        return null;
    }
    
    @Override
    protected void onPostExecute(Void result) {
        // Activity 可能已经销毁
        activity.someMethod();
    }
}

// 使用场景
new LeakyTask(this).execute();
// 旋转屏幕后，Activity 销毁，但 AsyncTask 仍在引用
```

#### 问题二：生命周期不匹配

```java
// ❌ 问题：任务在 Activity 销毁后仍继续执行
class LongTask extends AsyncTask<Void, Void, String> {
    
    @Override
    protected String doInBackground(Void... params) {
        try {
            Thread.sleep(10000); // 10 秒
        } catch (InterruptedException e) {}
        return "完成";
    }
    
    @Override
    protected void onPostExecute(String result) {
        // Activity 可能已经销毁
        updateUI(); // Crash!
    }
}
```

#### 问题三：顺序执行问题（Android 3.0+）

```java
// Android 3.0 之前：单线程顺序执行
// Android 3.0-：线程池并行执行（默认 5 个线程）
// Android 11：使用线程池但存在限制

// 问题：任务执行顺序不确定
for (int i = 0; i < 10; i++) {
    new AsyncTask<Void, Void, Void>() {
        @Override
        protected Void doInBackground(Void... params) {
            // 可能乱序执行
            return null;
        }
    }.execute();
}
```

#### 问题四：无法取消和重试

```java
// ❌ 问题：取消任务不彻底
AsyncTask task = new AsyncTask<Void, Void, Void>() {
    @Override
    protected Void doInBackground(Void... params) {
        for (int i = 0; i < 100; i++) {
            if (isCancelled()) {
                return null;
            }
            // 任务
        }
        return null;
    }
}.execute();

// 取消任务
task.cancel(true); // 只能标记取消，不能强制停止
```

#### 问题五：阻塞主线程

```java
// ❌ 问题：在 doInBackground 中访问 UI
class BadTask extends AsyncTask<Void, Void, Void> {
    @Override
    protected Void doInBackground(Void... params) {
        textView.setText("正在执行"); // ❌ 不能在后台线程访问 UI
        return null;
    }
}
```

#### 问题六：代码可读性差

```java
// ❌ 嵌套回调，难以维护
new AsyncTask<Void, Integer, String>() {
    @Override
    protected String doInBackground(Void... params) {
        // 复杂逻辑...
        return result;
    }
    
    @Override
    protected void onProgressUpdate(Integer... values) {
        // 进度更新...
    }
    
    @Override
    protected void onPostExecute(String result) {
        // 后处理...
    }
}.execute();
```

### 2.3 问题总结

| 问题 | 描述 | 影响 |
|------|------|------|
| 内存泄漏 | 持有 Activity 强引用 | 应用崩溃 |
| 生命周期不匹配 | 任务完成后 UI 已销毁 | 异常崩溃 |
| 并发控制 | 线程池大小受限 | 任务排队 |
| 无法优雅取消 | 只能标记不能强制 | 资源浪费 |
| 代码可读性 | 回调嵌套 | 维护困难 |
| 阻塞限制 | 后台不能访问 UI | 开发受限 |

---

## 3. ExecutorService 替代方案

### 3.1 基础用法

```java
// 创建线程池
private ExecutorService executor = new ThreadPoolExecutor(
    4,
    8,
    60L,
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    new ThreadFactory() {
        private final AtomicInteger count = new AtomicInteger();
        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "Executor-" + count.getAndIncrement());
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 提交任务
executor.execute(() -> {
    // 后台任务
    doHeavyWork();
    
    // 切换回主线程
    handler.post(() -> {
        updateUI();
    });
});
```

### 3.2 配合 Handler 使用

```java
class AsyncTaskReplaced {
    private final ExecutorService executor;
    private final Handler mainHandler;
    
    public AsyncTaskReplaced(ExecutorService executor, Handler mainHandler) {
        this.executor = executor;
        this.mainHandler = mainHandler;
    }
    
    public void execute(Runnable task, Runnable onComplete) {
        executor.execute(() -> {
            try {
                task.run();
                mainHandler.post(() -> {
                    if (onComplete != null) {
                        onComplete.run();
                    }
                });
            } catch (Exception e) {
                mainHandler.post(() -> {
                    handleError(e);
                });
            }
        });
    }
    
    private void handleError(Exception e) {
        Log.e("Error", "任务异常", e);
    }
}

// 使用
new AsyncTaskReplaced(executor, handler).execute(
    () -> {
        // 后台任务
        doWork();
    },
    () -> {
        // 完成回调
        updateUI();
    }
);
```

### 3.3 带进度的任务

```java
class ProgressTask {
    private ExecutorService executor;
    private Handler handler;
    
    public void execute(Runnable task, Consumer<Integer> onProgress, Consumer<String> onComplete) {
        executor.execute(() -> {
            try {
                for (int i = 0; i <= 100; i++) {
                    // 更新进度
                    final int progress = i;
                    handler.post(() -> onProgress.accept(progress));
                    
                    // 模拟工作
                    Thread.sleep(100);
                }
                
                // 完成
                handler.post(() -> onComplete.accept("完成"));
            } catch (Exception e) {
                handler.post(() -> handleError(e));
            }
        });
    }
}
```

### 3.4 可取消的任务

```java
class CancellableTask {
    private ExecutorService executor;
    private volatile boolean cancelled = false;
    
    public void execute(Runnable task) {
        executor.execute(() -> {
            try {
                task.run();
                while (!cancelled && /* 任务条件 */) {
                    // 检查取消状态
                    if (cancelled) {
                        break;
                    }
                }
            } catch (Exception e) {
                if (!cancelled) {
                    handleError(e);
                }
            }
        });
    }
    
    public void cancel() {
        cancelled = true;
    }
}
```

### 3.5 Future 获取返回值

```java
class FutureTask {
    private ExecutorService executor;
    private Handler handler;
    
    public <T> void execute(Callable<T> task, Consumer<T> onComplete) {
        Future<T> future = executor.submit(task);
        
        // 获取结果（非阻塞）
        new Thread(() -> {
            try {
                T result = future.get();
                handler.post(() -> onComplete.accept(result));
            } catch (Exception e) {
                handler.post(() -> handleError(e));
            }
        }).start();
    }
}

// 使用
execute(() -> {
    // 耗时操作
    return "结果";
}, result -> {
    // 处理结果
    textView.setText(result);
});
```

---

## 4. 协程替代方案

### 4.1 Kotlin 协程基础

```kotlin
// 添加依赖
// implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.1"

// 基础使用
lifecycleScope.launch {
    val result = withContext(Dispatchers.IO) {
        // 后台任务
        doHeavyWork()
    }
    // 自动切换回主线程
    textView.text = result
}
```

### 4.2 完整替代 AsyncTask

```kotlin
// 旧代码：AsyncTask
// new DownloadTask(this).execute(url);

// 新代码：协程
class DownloadViewModel : ViewModel() {
    private val repository = DownloadRepository()
    
    fun download(url: String) {
        viewModelScope.launch {
            try {
                // 显示进度条
                showLoading(true)
                
                // 后台下载
                val result = withContext(Dispatchers.IO) {
                    repository.download(url) { progress ->
                        // 更新进度
                        _progress.emit(progress)
                    }
                }
                
                // 更新 UI
                _result.emit(result)
            } catch (e: Exception) {
                _error.emit(e)
            } finally {
                showLoading(false)
            }
        }
    }
    
    private val _progress = MutableStateFlow(0)
    val progress: StateFlow<Int> = _progress.asStateFlow()
    
    private val _result = MutableStateFlow<DownloadResult?>(null)
    val result: StateFlow<DownloadResult?> = _result.asStateFlow()
}
```

### 4.3 进度更新

```kotlin
// 带进度更新
suspend fun downloadWithProgress(url: String): Result {
    return withContext(Dispatchers.IO) {
        val total = getRemoteSize(url)
        var downloaded = 0L
        
        val inputStream = URL(url).openStream()
        val outputStream = FileOutputStream(file)
        
        val buffer = ByteArray(8192)
        var count: Int
        
        while (inputStream.read(buffer).also { count = it } != -1) {
            outputStream.write(buffer, 0, count)
            downloaded += count
            
            // 发送进度
            coroutineScope.launch(Dispatchers.Main) {
                _progress.value = (downloaded * 100 / total).toInt()
            }
        }
        
        Result.Success(file)
    }
}

// 使用
lifecycleScope.launch {
    launch {
        downloadWithProgress(url)
    }.invokeOnCompletion {
        // 清理
    }
}
```

### 4.4 多任务并发

```kotlin
// 并发执行多个任务
suspend fun downloadAll(urls: List<String>): List<Result> {
    return withContext(Dispatchers.IO) {
        urls.map { url ->
            async {
                download(url)
            }
        }.awaitAll()
    }
}

// 限流并发
suspend fun downloadAllLimited(urls: List<String>, limit: Int = 3): List<Result> {
    return withContext(Dispatchers.IO) {
        coroutineScope {
            val semaphore = Semaphore(limit)
            urls.map { url ->
                async {
                    semaphore.acquire()
                    try {
                        download(url)
                    } finally {
                        semaphore.release()
                    }
                }
            }.awaitAll()
        }
    }
}
```

### 4.5 任务取消

```kotlin
// 可取消的任务
private val job = lifecycleScope.launch {
    try {
        repeat(100) { index ->
            delay(100)
            checkActive() // 检查是否应该继续
            _progress.value = index
        }
    } catch (e: CancellationException) {
        // 任务被取消
    }
}

// 手动取消
fun cancel() {
    job.cancel()
}

// 在 ViewModel 中自动取消
class MyViewModel : ViewModel() {
    private val _job = viewModelScope.launch {
        // 任务
    }
    
    // ViewModel 销毁时自动取消
}
```

### 4.6 异常处理

```kotlin
// try-catch 处理
lifecycleScope.launch {
    try {
        val result = withContext(Dispatchers.IO) {
            doWork()
        }
        _result.value = Result.Success(result)
    } catch (e: NetworkException) {
        _result.value = Result.Failure("网络错误")
    } catch (e: Exception) {
        _result.value = Result.Failure("未知错误")
    }
}

// 使用 SupervisorJob
lifecycleScope.launch(SupervisorJob()) {
    // 子任务失败不影响其他任务
    launch { task1() }
    launch { task2() }
    launch { task3() }
}
```

---

## 5. LiveData + ViewModel

### 5.1 基本架构

```
┌─────────────────────────────────────────────────────┐
│                    Activity/Fragment                │
│  观察 LiveData                                      │
│  (onActive/onInactive)                              │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ 生命周期感知
                        │
┌─────────────────────────────────────────────────────┐
│                    ViewModel                        │
│  持有 LiveData                                      │
│  协程/后台任务                                      │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ 更新数据
                        │
┌─────────────────────────────────────────────────────┐
│                   Repository                        │
│  数据源（网络/数据库）                              │
│  协程 + 线程池                                       │
└─────────────────────────────────────────────────────┘
```

### 5.2 完整示例

```kotlin
// ViewModel
class MyViewModel : ViewModel() {
    private val repository = MyRepository()
    
    // LiveData 状态
    private val _loading = MutableLiveData<Boolean>(false)
    val loading: LiveData<Boolean> = _loading
    
    private val _data = MutableLiveData<List<Item>>()
    val data: LiveData<List<Item>> = _data
    
    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error
    
    // 加载数据
    fun loadData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = withContext(Dispatchers.IO) {
                    repository.getData()
                }
                _data.value = result
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
}

// Repository
class MyRepository {
    suspend fun getData(): List<Item> {
        return withContext(Dispatchers.IO) {
            // 网络请求
            api.getItems()
        }
    }
}

// Activity/Fragment
class MyActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        viewModel.data.observe(this) { data ->
            adapter.submitList(data)
        }
        
        viewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
        }
        
        viewModel.loading.observe(this) { loading ->
            progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        
        viewModel.loadData()
    }
}
```

### 5.3 StateFlow 替代 LiveData

```kotlin
// StateFlow 更现代的解决方案
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UiState.Initial)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val data = withContext(Dispatchers.IO) {
                    repository.getData()
                }
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

// UI 状态密封类
sealed class UiState<out T> {
    object Initial : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

// Compose 中观察
@Composable
fun MyScreen(viewModel: MyViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    when (val state = uiState) {
        is UiState.Loading -> LoadingSpinner()
        is UiState.Success -> Content(state.data)
        is UiState.Error -> ErrorView(state.message)
        else -> {}
    }
}
```

---

## 6. RxJava 替代方案

### 6.1 基础用法

```java
// 添加依赖
// implementation "io.reactivex.rxjava2:rxandroid:2.1.1"

// 基本使用
Observable.fromCallable(() -> {
    // 后台任务
    doHeavyWork();
    return result;
})
.observeOn(AndroidSchedulers.mainThread())
.subscribeOn(Schedulers.io())
.subscribe(
    result -> {
        // 成功回调
        textView.setText(result);
    },
    error -> {
        // 错误回调
        Log.e("Error", error.getMessage());
    }
);
```

### 6.2 完整替代 AsyncTask

```java
// 旧代码
// new DownloadTask().execute(url);

// RxJava 替代
Observable.fromCallable(() -> download(url))
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .doOnSubscribe(() -> {
        // onPreExecute
        progressBar.setVisibility(View.VISIBLE);
    })
    .map(result -> {
        // 数据处理
        return process(result);
    })
    .doOnNext(result -> {
        // 处理结果
        updateUI(result);
    })
    .doFinally(() -> {
        // 完成
        progressBar.setVisibility(View.GONE);
    })
    .subscribe(
        result -> {
            // 成功
        },
        throwable -> {
            // 失败
        },
        () -> {
            // 完成
        }
    );
```

### 6.3 进度更新

```java
// 使用 Flowable 支持进度
Flowable.create emitter -> {
    for (int i = 0; i <= 100; i++) {
        emitter.onNext(i); // 发送进度
        doWork(i);
    }
    emitter.onComplete();
}, BackpressureStrategy.LATEST)
.subscribeOn(Schedulers.io())
.observeOn(AndroidSchedulers.mainThread())
.subscribe(progress -> {
    progressBar.setProgress(progress);
});
```

### 6.4 链式操作

```java
// 多个操作链式调用
Observable.fromCallable(() -> {
    // 网络请求
    return api.getData();
})
.flatMap(data -> {
    // 根据数据执行后续操作
    return api.process(data);
})
.retry(3) // 重试 3 次
.throttleFirst(1, TimeUnit.SECONDS) // 节流
.distinctUntilChanged() // 去重
.observeOn(AndroidSchedulers.mainThread())
.subscribe();
```

### 6.5 取消订阅

```java
// 持有 Disposable
private Disposable disposable;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    disposable = Observable.fromCallable(() -> doWork())
        .subscribeOn(Schedulers.io())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(result -> {
            // 处理结果
        });
}

@Override
protected void onDestroy() {
    super.onDestroy();
    if (disposable != null && !disposable.isDisposed()) {
        disposable.dispose(); // 取消
    }
}
```

---

## 7. 对比分析

### 7.1 方案对比

| 特性 | AsyncTask | ExecutorService | Kotlin 协程 | RxJava |
|------|----------|-----------------|-----------|--------|
| 生命周期感知 | ❌ | ❌ | ✅ | ❌ |
| 异常处理 | 一般 | 一般 | ✅ | ✅ |
| 取消任务 | 部分 | ✅ | ✅ | ✅ |
| 链式调用 | ❌ | ❌ | ✅ | ✅✅ |
| 学习成本 | 低 | 中 | 中 | 高 |
| 性能 | 一般 | 高 | 高 | 高 |
| Android 集成 | ✅ | 一般 | ✅✅ | 一般 |
| 内存泄漏风险 | 高 | 低 | 低 | 中 |

### 7.2 推荐方案

**新项目：**
1. Kotlin 协程（首选）
2. StateFlow/LiveData

**维护旧项目：**
1. ExecutorService + Handler
2. 逐步迁移到协程

**复杂异步场景：**
1. RxJava（复杂数据流）
2. Kotlin Flow（响应式）

### 7.3 性能对比

```
┌─────────────────────────────────────────────┐
│           性能对比 (1000 个任务)              │
├─────────────────────────────────────────────┤
│ AsyncTask       : 基准                     │
│ ExecutorService : 1.2x 比 AsyncTask 快      │
│ 协程            : 1.5x 比 AsyncTask 快      │
│ RxJava          : 1.3x 比 AsyncTask 快      │
└─────────────────────────────────────────────┘
```

---

## 8. 迁移指南

### 8.1 AsyncTask → 协程

```kotlin
// Before: AsyncTask
class DownloadTask : AsyncTask<String, Int, String>() {
    override fun onPreExecute() {
        showLoading()
    }
    
    override fun doInBackground(vararg urls: String): String {
        for (i in 0..100) {
            publishProgress(i)
            Thread.sleep(100)
        }
        return download(urls[0])
    }
    
    override fun onProgressUpdate(vararg values: Int) {
        progressBar.progress = values[0]
    }
    
    override fun onPostExecute(result: String) {
        hideLoading()
        textView.text = result
    }
}

// After: 协程
class DownloadViewModel : ViewModel() {
    private val _progress = MutableStateFlow(0)
    val progress: StateFlow<Int> = _progress.asStateFlow()
    
    private val _result = MutableStateFlow<String?>(null)
    val result: StateFlow<String?> = _result.asStateFlow()
    
    fun download(url: String) {
        viewModelScope.launch {
            _progress.value = 0
            try {
                withContext(Dispatchers.IO) {
                    for (i in 0..100) {
                        // 更新进度
                        _progress.value = i
                        delay(100)
                    }
                    download(url)
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
}
```

### 8.2 AsyncTask → LiveData

```kotlin
// 在 ViewModel 中使用 LiveData
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<Data>()
    val data: LiveData<Data> = _data
    
    fun loadData() {
        viewModelScope.launch {
            _data.value = repository.getData()
        }
    }
}

// 在 Activity/Fragment 中观察
class MyFragment : Fragment() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel.data.observe(viewLifecycleOwner) { data ->
            // 更新 UI
            adapter.submitList(data.items)
        }
        
        viewModel.loadData()
    }
}
```

### 8.3 迁移检查清单

- [ ] 识别所有 AsyncTask 使用位置
- [ ] 确定迁移优先级（高频使用优先）
- [ ] 添加协程依赖
- [ ] 创建 ViewModel 持有状态
- [ ] 将后台任务迁移到协程
- [ ] 使用 StateFlow/LiveData 暴露状态
- [ ] 测试生命周期场景
- [ ] 清理旧代码

---

## 9. 面试高频考点

### 考点一：AsyncTask 废弃原因

**Q: AsyncTask 为什么被废弃？**

A:
1. 内存泄漏（持有 Activity 强引用）
2. 生命周期不匹配
3. 并发控制有限
4. 无法优雅取消
5. 阻塞主线程问题
6. 代码可读性差

### 考点二：协程优势

**Q: 为什么推荐用协程替代 AsyncTask？**

A:
1. 更好的异常处理
2. 生命周期感知
3. 可取消
4. 链式调用
5. 性能更好
6. 代码更简洁

### 考点三：协程上下文

**Q: Dispatchers 有哪些？**

A:
- Dispatchers.Main：主线程
- Dispatchers.IO：IO 密集型任务
- Dispatchers.Default：CPU 密集型任务
- Dispatchers.Unconfined：不受约束

### 考点四：协程取消

**Q: 协程如何取消？**

A:
- 调用 job.cancel()
- 抛出 CancellationException
- 检查 isActive
- 使用 SupervisorJob

### 考点五：LiveData vs StateFlow

**Q: LiveData 和 StateFlow 的区别？**

A:
- LiveData 生命周期感知，StateFlow 不感知
- StateFlow 有初始值，LiveData 无
- StateFlow 可热订阅，LiveData 冷订阅
- StateFlow 更现代，LiveData 更成熟

### 考点六：线程切换

**Q: 协程中如何切换线程？**

A:
- withContext(Dispatchers.IO)
- launch(Dispatchers.Main)
- async(Dispatchers.Default)

### 考点七：异常处理

**Q: 协程中如何处理异常？**

A:
- try-catch
- SupervisorJob
- CoroutineExceptionHandler

### 考点八：生命周期

**Q: 如何避免协程内存泄漏？**

A:
- 使用 lifecycleScope
- 使用 viewModelScope
- 使用 lifecycleScope.launch

### 考点九：RxJava 链式操作

**Q: RxJava 的优势？**

A:
- 强大的链式操作
- 复杂的异步处理
- 数据流处理

### 考点十：迁移策略

**Q: 如何从 AsyncTask 迁移到协程？**

A:
1. 添加协程依赖
2. 创建 ViewModel
3. 使用 StateFlow/LiveData
4. 迁移后台任务
5. 测试验证

---

## 最佳实践总结

### 1. 新项目优先使用协程

```kotlin
viewModelScope.launch {
    val result = withContext(Dispatchers.IO) {
        repository.getData()
    }
    _result.value = result
}
```

### 2. 使用 StateFlow 管理状态

```kotlin
private val _uiState = MutableStateFlow(UiState.Initial)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()
```

### 3. 在 ViewModel 中使用协程

```kotlin
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            // 任务
        }
    }
}
```

### 4. 正确处理异常

```kotlin
try {
    withContext(Dispatchers.IO) {
        doWork()
    }
} catch (e: Exception) {
    handleError(e)
}
```

### 5. 优雅取消

```kotlin
lifecycleScope.launch {
    try {
        // 任务
    } catch (e: CancellationException) {
        // 清理
    }
}
```

---

**总结：** AsyncTask 已被废弃，推荐使用 Kotlin 协程配合 LiveData/StateFlow。协程提供更好的异常处理、生命周期感知和代码可读性。在维护旧项目时，可使用 ExecutorService 作为过渡方案。
