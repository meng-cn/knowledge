# 07_图片加载_Glide

## 目录

- [Glide 概述](#glide-概述)
- [Glide 基础使用](#glide-基础使用)
- [缓存机制](#缓存机制)
- [占位图与错误图](#占位图与错误图)
- [图片转换](#图片转换)
- [图片解码](#图片解码)
- [内存管理](#内存管理)
- [Glide vs Picasso vs Coil](#glide-vs-picasso-vs-coil)
- [性能优化](#性能优化)
- [代码示例](#代码示例)
- [面试考点](#面试考点)

---

## Glide 概述

### 1.1 什么是 Glide

Glide 是 Google 开源的图片加载库，专注于 Android 平台的图片加载、缓存和内存管理。它提供了简单强大的 API，支持各种图片格式和复杂的加载场景。

**核心特性**：
- 简单易用的 API
- 强大的缓存机制
- 内存管理自动化
- 支持多种图片格式
- 可定制的图片转换
- 高性能和稳定性

### 1.2 发展历程

```
2014 年：Glide 1.0 发布
2015 年：Glide 3.0 重大重构
2016 年：Glide 4.0 AndroidX 支持
2020 年：Glide 4.15+ 持续优化
2024 年：Glide 成为行业标准
```

### 1.3 核心概念

**Glide 的核心组件**：
```
┌─────────────────────────────────┐
│           Glide                 │
├─────────────────────────────────┤
│  加载器 (Loader)                │
│    - 负责获取数据源             │
├─────────────────────────────────┤
│  解码器 (Decoder)               │
│    - 负责解析数据为 Bitmap       │
├─────────────────────────────────┤
│  编码器 (Encoder)               │
│    - 负责 Bitmap 转为字节流       │
├─────────────────────────────────┤
│  模型加载器 (ModelLoader)       │
│    - 负责 URL/File 等资源解析     │
├─────────────────────────────────┤
│  数据转换 (DataTransform)       │
│    - 负责图片转换（圆角等）      │
├─────────────────────────────────┤
│  缓存 (Cache)                   │
│    - 内存缓存 + 磁盘缓存        │
└─────────────────────────────────┘
```

### 1.4 Glide 架构

**整体架构**：
```
┌────────────────────────────────────┐
│         应用层                      │
│   Glide.with().load().into()        │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        GlideModule                 │
│     (配置和扩展点)                  │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        GlideBuilder                │
│     (构建 Glide 实例)                │
└───────────┬────────────────────────┘
            │
┌───────────▼────────────────────────┐
│        Glide                       │
│     (核心调度器)                    │
├────────────────────────────────────┤
│  - DataFetcher (数据获取)           │
│  - DecodeCallback (解码回调)        │
│  - Target (目标视图)                │
└────────────────────────────────────┘
```

---

## Glide 基础使用

### 2.1 基本加载

**加载网络图片**：
```kotlin
// 基本用法
Glide.with(context)
    .load("https://example.com/image.jpg")
    .into(imageView)

// 在 Fragment 中使用（推荐）
Glide.with(fragment)
    .load(url)
    .into(imageView)

// 在 RecyclerView Adapter 中
Glide.with(holder.itemView.context)
    .load(url)
    .into(imageView)
```

**加载本地图片**：
```kotlin
// Drawable
Glide.with(context)
    .load(R.drawable.image)
    .into(imageView)

// File
Glide.with(context)
    .load(File("/path/to/image.jpg"))
    .into(imageView)

// Uri
Glide.with(context)
    .load(contentUri)
    .into(imageView)
```

**加载资源**：
```kotlin
// 资源路径
Glide.with(context)
    .load("res://image.jpg")
    .into(imageView)
```

### 2.2 异步和同步加载

**异步加载（默认）**：
```kotlin
// 异步加载，不阻塞主线程
Glide.with(context)
    .load(url)
    .into(imageView)
```

**同步加载**：
```kotlin
// 同步加载，返回 Target
val target = Glide.with(context)
    .load(url)
    .submit(width, height)

// 获取 Bitmap
val bitmap = target.get()

// 或者使用 asBitmap().submit()
val bitmap = Glide.with(context)
    .asBitmap()
    .load(url)
    .submit()
    .get()
```

### 2.3 加载到不同目标

**加载到 ImageView**：
```kotlin
Glide.with(context)
    .load(url)
    .into(imageView)
```

**加载到 SimpleDraweeView（Fresco）**：
```kotlin
// 需要先集成 Fresco
val draweeView = SimpleDraweeView(context)
Glide.with(context)
    .load(url)
    .into(draweeView)
```

**加载到自定义 Target**：
```kotlin
class CustomTarget : CustomTarget<Bitmap>() {
    override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
        // 图片加载完成
        processImage(resource)
    }
    
    override fun onLoadFailed(error: Throwable) {
        // 加载失败
    }
}

val target = CustomTarget()
Glide.with(context)
    .load(url)
    .into(target)

// 记得释放
target.clear()
```

**加载到 Bitmap（不显示）**：
```kotlin
val listener = object : BitmapLoadListener {
    override fun onResourceReady(
        resource: Bitmap,
        model: Any?,
        target: Target<Bitmap>,
        modelLoader: ModelLoader<*, *>
    ) {
        // 处理 Bitmap
    }
}

Glide.with(context)
    .asBitmap()
    .load(url)
    .listener(listener)
    .preload() // 只预加载
```

### 2.4 预加载

**预加载图片**：
```kotlin
// 预加载单个图片
Glide.with(context)
    .load(url)
    .preload()

// 预加载多个图片
Glide.with(context)
    .preload(url1, url2, url3)
```

**列表预加载**：
```kotlin
class PreloadTransformation : ObjectTransitionTransformation<String, Bitmap>() {
    // 自定义预加载转换
}

recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
    override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
        val layoutManager = recyclerView.layoutManager as LinearLayoutManager
        val firstVisibleItem = layoutManager.findFirstVisibleItemPosition()
        val visibleItemCount = layoutManager.childCount
        
        // 预加载下一页
        for (i in visibleItemCount until visibleItemCount + 5) {
            if (i < items.size) {
                Glide.with(recyclerView.context)
                    .load(items[i].imageUrl)
                    .preload()
            }
        }
    }
})
```

---

## 缓存机制

### 3.1 多级缓存架构

**Glide 缓存层级**：
```
┌──────────────────────────────┐
│   资源缓存 (Resource Cache)   │
│   - 内存中存储转换后的资源     │
├──────────────────────────────┤
│   数据缓存 (Data Cache)       │
│   - 内存中存储原始数据         │
├──────────────────────────────┤
│   磁盘缓存 (Disk Cache)       │
│   - 存储原始数据和转换后数据   │
└──────────────────────────────┘
```

**缓存流程**：
```
1. 检查资源缓存（内存）
   └─ 命中 -> 直接使用

2. 检查数据缓存（内存）
   └─ 命中 -> 解码后使用

3. 检查磁盘缓存
   └─ 命中 -> 读取并解码

4. 从网络/本地加载
   └─ 存储到各级缓存
```

### 3.2 内存缓存

**配置内存缓存**：
```kotlin
// 默认配置（应用可用内存的 15%）
GlideMemoryCacheModule(
    LruResourceCache(context),
    LruBitmapCache(context)
)

// 自定义配置
class AppGlideModule : AppGlideModule() {
    override fun applyOptions(context: Context, options: Options) {
        options.set(
            MemorySizeOption.MEMORY_CACHE_SIZE_BITS,
            16 // 64MB (2^16 KB)
        )
        options.set(
            MemorySizeOption.RESOURCE_MEMORY_CACHE_SIZE_BITS,
            16
        )
    }
    
    override fun isManifestParsingEnabled(): Boolean {
        return false // 禁用清单解析
    }
}

// 在清单文件中注册
<application>
    <meta-data
        android:name="com.example.AppGlideModule"
        android:value="GlideModule" />
</application>
```

**手动管理内存缓存**：
```kotlin
// 获取 Glide 实例
val glide = Glide.with(context)

// 清除内存缓存
glide.memoryCache.clear()

// 清除资源缓存
glide.clearMemoryCache()

// 获取缓存统计
val memoryCache = glide.memoryCache
val size = memoryCache.size
val limit = memoryCache.limit
```

### 3.3 磁盘缓存

**配置磁盘缓存**：
```kotlin
class AppGlideModule : AppGlideModule() {
    override fun applyOptions(context: Context, options: Options) {
        // 磁盘缓存大小（200MB）
        options.set(
            DiskCache.Factory.classifier,
            InternalCacheDiskCacheFactory(context, 200 * 1024 * 1024)
        )
        
        // 磁盘缓存路径
        options.set(
            DiskCache.Path.classifier,
            context.cacheDir.resolve("glide")
        )
    }
}
```

**磁盘缓存策略**：
```kotlin
Glide.with(context)
    .load(url)
    .diskCacheStrategy(DiskCacheStrategy.ALL) // 缓存原始和转换后的图片
    .into(imageView)

// 策略选项
enum class DiskCacheStrategy {
    ALL,        // 缓存原始和转换后（默认）
    NONE,       // 不缓存
    DATA,       // 只缓存原始数据
    RESOURCE    // 只缓存转换后的资源
}
```

**磁盘缓存管理**：
```kotlin
// 清除磁盘缓存
Glide.with(context)
    .clearDiskCache()

// 获取磁盘缓存统计
val diskCache = Glide.get(context).diskCache
val size = diskCache.size
val limit = diskCache.limit
```

### 3.4 缓存优先级

**配置缓存优先级**：
```kotlin
Glide.with(context)
    .load(url)
    .priority(Priority.HIGH) // HIGH, NORMAL, LOW
    .into(imageView)
```

**优先级影响**：
- 高优先级任务先执行
- 高优先级任务占用更多缓存空间
- 低优先级任务可能被取消

### 3.5 缓存失效

**手动失效缓存**：
```kotlin
// 失效单个资源
Glide.with(context)
    .clear(url)

// 失效所有缓存
Glide.with(context)
    .clearMemoryCache()
    .clearDiskCache()

// 失效特定类型缓存
Glide.get(context)
    .context
    .getCache()
    .clear()
```

**版本管理**：
```kotlin
// 使用版本号管理缓存
Glide.with(context)
    .load(url)
    .version(1) // 版本号改变时缓存失效
    .into(imageView)
```

---

## 占位图与错误图

### 4.1 占位图

**基本占位图**：
```kotlin
Glide.with(context)
    .load(url)
    .placeholder(R.drawable.placeholder)
    .into(imageView)
```

**动态占位图**：
```kotlin
Glide.with(context)
    .load(url)
    .placeholder(ColorDrawable(Color.GRAY))
    .into(imageView)
```

**交叉淡入占位图**：
```kotlin
Glide.with(context)
    .load(url)
    .placeholder(R.drawable.placeholder)
    .crossFade()
    .into(imageView)
```

### 4.2 错误图

**基本错误图**：
```kotlin
Glide.with(context)
    .load(url)
    .error(R.drawable.error)
    .into(imageView)
```

**自定义错误处理**：
```kotlin
Glide.with(context)
    .load(url)
    .error { throwable ->
        // 处理错误
        Log.e("Glide", "Load error", throwable)
        R.drawable.error
    }
    .into(imageView)
```

**错误图策略**：
```kotlin
Glide.with(context)
    .load(url)
    .error(R.drawable.error)
    .fallback(R.drawable.fallback) // 如果占位图也失败
    .into(imageView)
```

### 4.3 加载中状态

**自定义加载中状态**：
```kotlin
Glide.with(context)
    .load(url)
    .placeholder(R.drawable.loading)
    .error(R.drawable.error)
    .into(object : CustomTarget<Drawable>() {
        override fun onResourceReady(
            resource: Drawable,
            transition: Transition<in Drawable>?
        ) {
            imageView.setImageDrawable(resource)
        }
        
        override fun onLoadStarted(model: Any?) {
            imageView.setImageResource(R.drawable.loading)
        }
        
        override fun onLoadFailed(error: Throwable?) {
            imageView.setImageResource(R.drawable.error)
        }
    })
```

---

## 图片转换

### 5.1 内置转换

**圆角**：
```kotlin
// 圆角矩形
Glide.with(context)
    .load(url)
    .transform(RoundedCornersTransformation(20))
    .into(imageView)

// 圆形
Glide.with(context)
    .load(url)
    .circleCrop()
    .into(imageView)

// 渐变圆角
Glide.with(context)
    .load(url)
    .transform(
        RoundedCornersTransformation(
            context,
            20f,
            0f,
            RoundedCornersTransformation.Options.BOTTOM_RIGHT
        )
    )
    .into(imageView)
```

**缩放**：
```kotlin
// 居中裁剪
Glide.with(context)
    .load(url)
    .centerCrop()
    .into(imageView)

// 适应
Glide.with(context)
    .load(url)
    .centerInside()
    .into(imageView)

// 拉伸
Glide.with(context)
    .load(url)
    .centerInside()
    .into(imageView)
```

**滤镜**：
```kotlin
// 灰度
Glide.with(context)
    .load(url)
    .transform(GrayscaleTransformation())
    .into(imageView)

// 自定义滤镜
class SepiaTransformation : BitmapTransformation() {
    override fun transform(
        pool: Pool<Bitmap>,
        toTransform: Bitmap,
        outWidth: Int,
        outHeight: Int
    ): Bitmap {
        val bitmap = toTransform.copy(Bitmap.Config.ARGB_8888, true)
        val canvas = Canvas(bitmap)
        
        val paint = Paint().apply {
            colorFilter = ColorMatrixColorFilter(floatArrayOf(
                0.93, 0.66, 0.20, 0, 0,
                0.69, 0.66, 0.26, 0, 0,
                0.52, 0.66, 0.40, 0, 0,
                0, 0, 0, 1, 0
            ))
        }
        
        canvas.drawBitmap(bitmap, 0f, 0f, paint)
        return bitmap
    }
    
    override fun getId(): String = "sepia_transformation"
}
```

### 5.2 自定义转换

**实现 BitmapTransformation**：
```kotlin
class CustomTransformation : BitmapTransformation() {
    
    override fun transform(
        pool: Pool<Bitmap>,
        toTransform: Bitmap,
        outWidth: Int,
        outHeight: Int
    ): Bitmap {
        // 1. 从池获取 Bitmap
        val bitmap = pool.get(outWidth, outHeight, Bitmap.Config.ARGB_8888)
            ?: Bitmap.createBitmap(outWidth, outHeight, Bitmap.Config.ARGB_8888)
        
        // 2. 执行转换
        val canvas = Canvas(bitmap)
        // 自定义绘制逻辑
        
        // 3. 返回 Bitmap
        return bitmap
    }
    
    override fun getId(): String {
        return "custom_transformation"
    }
}

// 使用
Glide.with(context)
    .load(url)
    .transform(CustomTransformation())
    .into(imageView)
```

**多转换组合**：
```kotlin
Glide.with(context)
    .load(url)
    .transform(
        object : MultiTransformation<Bitmap>() {
            init {
                append(RoundedCornersTransformation(20f))
                append(GrayscaleTransformation())
            }
        }
    )
    .into(imageView)
```

### 5.3 尺寸调整

**固定尺寸**：
```kotlin
Glide.with(context)
    .load(url)
    .override(100, 100)
    .into(imageView)
```

**按比例缩放**：
```kotlin
Glide.with(context)
    .load(url)
    .sizeMultiplier(0.5f) // 50% 尺寸
    .into(imageView)
```

**目标尺寸**：
```kotlin
Glide.with(context)
    .load(url)
    .into(imageView) // 自动使用 ImageView 尺寸
```

---

## 图片解码

### 6.1 支持的格式

**内置支持**：
```
JPEG
PNG
GIF
WebP
WebP Animated
Png8
Bitmap
```

**扩展支持**：
```
// 添加依赖
implementation 'com.github.bumptech.glide:okhttp3-integration:4.12.0'
```

### 6.2 解码选项

**指定配置**：
```kotlin
Glide.with(context)
    .asBitmap()
    .load(url)
    .override(100, 100)
    .into(imageView)

Glide.with(context)
    .asGif()
    .load(url)
    .into(imageView)

Glide.with(context)
    .asDrawable()
    .load(url)
    .into(imageView)
```

**解码选项**：
```kotlin
Glide.with(context)
    .load(url)
    .apply(
        RequestOptions()
            .format(PictureFormat.JPEG)
            .priority(Priority.HIGH)
    )
    .into(imageView)
```

### 6.3 自定义解码器

**实现 ResourceDecoder**：
```kotlin
class CustomDecoder : ResourceDecoder<CustomData, Bitmap> {
    
    override fun handles(source: CustomData, options: Options): Boolean {
        return source.isCustomFormat
    }
    
    override fun decode(
        source: CustomData,
        width: Int,
        height: Int,
        options: Options
    ): Bitmap? {
        return try {
            BitmapFactory.decodeStream(source.inputStream)
        } catch (e: Exception) {
            null
        }
    }
}

// 注册解码器
class AppGlideModule : AppGlideModule() {
    override fun registerComponents(context: Context, glide: Glide) {
        glide.registry.add(
            CustomData::class.java,
            Bitmap::class.java,
            CustomDecoder()
        )
    }
}
```

---

## 内存管理

### 7.1 内存泄漏预防

**自动管理生命周期**：
```kotlin
// ✅ 推荐：使用 Fragment/Activity 上下文
Glide.with(fragment).load(url).into(imageView)

// ✅ 推荐：使用 Application 上下文（预加载）
Glide.with(applicationContext).load(url).preload()

// ❌ 不推荐：使用 View 上下文（可能泄漏）
Glide.with(itemView).load(url).into(imageView)
```

**手动清理**：
```kotlin
// 在 onDestroy 中清理
override fun onDestroyView() {
    super.onDestroyView()
    Glide.with(this).clearMemoryCache()
}

// 清理特定 Target
val target = Glide.with(context)
    .load(url)
    .into(customTarget)

target.clear()
```

**使用 WeakReference**：
```kotlin
class ViewModel {
    private val contextRef = WeakReference<Context>(context)
    
    fun loadImage() {
        contextRef.get()?.let { context ->
            Glide.with(context).load(url).into(imageView)
        }
    }
}
```

### 7.2 内存优化

**限制缓存大小**：
```kotlin
class AppGlideModule : AppGlideModule() {
    override fun applyOptions(context: Context, options: Options) {
        // 设置内存缓存大小为 30MB
        options.set(
            MemorySizeOption.MEMORY_CACHE_SIZE_BITS,
            25 // 2^25 bytes = 32MB
        )
    }
}
```

**使用合适的 Bitmap 配置**：
```kotlin
Glide.with(context)
    .load(url)
    .override(100, 100)
    .bitmapConfig(Bitmap.Config.RGB_565) // 减少内存占用
    .into(imageView)
```

**及时回收**：
```kotlin
// 在 RecyclerView 中
override fun onViewRecycled(holder: ViewHolder) {
    Glide.with(holder.itemView.context)
        .clear(holder.imageView)
    super.onViewRecycled(holder)
}
```

### 7.3 内存监控

**监控内存使用**：
```kotlin
class GlideMemoryMonitor {
    fun monitorMemory(context: Context) {
        val glide = Glide.get(context)
        val memoryCache = glide.memoryCache
        
        Thread {
            while (true) {
                Log.d("Glide", "Memory Cache Size: ${memoryCache.size}")
                Thread.sleep(1000)
            }
        }.start()
    }
}
```

---

## Glide vs Picasso vs Coil

### 8.1 对比表

| 特性 | Glide | Picasso | Coil |
|------|-------|---------|------|
| 维护状态 | 活跃 | 已停止 | 活跃 |
| 内存管理 | 优秀 | 良好 | 优秀 |
| 缓存机制 | 多级 | 简单 | 简单 |
| 协程支持 | 通过扩展 | 不支持 | 原生支持 |
| GIF 支持 | 原生 | 需扩展 | 需扩展 |
| WebP 支持 | 原生 | 需扩展 | 原生 |
| 自定义性 | 高 | 中 | 高 |
| 学习曲线 | 中等 | 简单 | 简单 |
| 性能 | 优秀 | 良好 | 优秀 |
| 体积 | 较大 | 小 | 小 |

### 8.2 使用场景

**Glide**：
- 大型应用
- 需要高级功能
- 复杂图片处理
- 多种数据源

**Picasso**：
- 小型应用
- 简单图片加载
- 维护旧项目

**Coil**：
- Kotlin 优先
- 协程集成
- 现代 Android 开发

### 8.3 代码对比

**Glide**：
```kotlin
Glide.with(context)
    .load(url)
    .placeholder(R.drawable.placeholder)
    .error(R.drawable.error)
    .centerCrop()
    .into(imageView)
```

**Picasso**：
```kotlin
Picasso.get()
    .load(url)
    .placeholder(R.drawable.placeholder)
    .error(R.drawable.error)
    .centerCrop()
    .fit()
    .into(imageView)
```

**Coil**：
```kotlin
imageView.load(url) {
    placeholder(R.drawable.placeholder)
    error(R.drawable.error)
    crossfade(true)
    size(Size.ORIGINAL)
}
```

---

## 性能优化

### 9.1 加载优化

**按需加载**：
```kotlin
// 只在可见时加载
class ImageAdapter : RecyclerView.Adapter<ViewHolder>() {
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        if (isViewVisible(holder.itemView)) {
            Glide.with(holder.itemView.context)
                .load(items[position].url)
                .into(holder.imageView)
        }
    }
    
    private fun isViewVisible(view: View): Boolean {
        // 实现可见性检查
    }
}
```

**尺寸匹配**：
```kotlin
// 根据 ImageView 尺寸加载
Glide.with(context)
    .load(url)
    .override(imageView.width, imageView.height)
    .into(imageView)
```

**图片格式优化**：
```kotlin
// 优先使用 WebP
Glide.with(context)
    .load(url)
    .format(PictureFormat.WEBP)
    .into(imageView)
```

### 9.2 缓存优化

**合理配置缓存**：
```kotlin
class AppGlideModule : AppGlideModule() {
    override fun applyOptions(context: Context, options: Options) {
        // 内存缓存：15% 应用内存
        // 磁盘缓存：200MB
        options.set(
            DiskCache.Factory.classifier,
            InternalCacheDiskCacheFactory(context, 200 * 1024 * 1024)
        )
    }
}
```

**清理策略**：
```kotlin
// 定期清理旧缓存
Glide.get(context)
    .context
    .getCache()
    .trimToSize(maxSize)
```

### 9.3 并发优化

**限制并发数**：
```kotlin
class GlideConfiguration {
    companion object {
        const val MAX_CONCURRENT = 4
    }
}

// Glide 内部已优化并发
```

**优先级管理**：
```kotlin
Glide.with(context)
    .load(url)
    .priority(Priority.HIGH) // 重要图片
    .into(imageView)
```

---

## 代码示例

### 10.1 完整的图片加载方案

```kotlin
object ImageLoader {
    
    fun load(
        context: Context,
        url: String,
        imageView: ImageView,
        placeholder: Int = R.drawable.placeholder,
        error: Int = R.drawable.error,
        cornerRadius: Int = 0
    ) {
        val glideRequest = Glide.with(context)
            .load(url)
            .placeholder(placeholder)
            .error(error)
            .centerCrop()
            .transition(CrossFade())
            
        if (cornerRadius > 0) {
            glideRequest.transform(RoundedCornersTransformation(cornerRadius.toFloat()))
        }
        
        glideRequest.into(imageView)
    }
    
    fun loadCircleAvatar(
        context: Context,
        url: String,
        imageView: ImageView
    ) {
        Glide.with(context)
            .load(url)
            .placeholder(R.drawable.avatar_placeholder)
            .error(R.drawable.avatar_error)
            .circleCrop()
            .into(imageView)
    }
    
    fun loadImageList(
        context: Context,
        url: String,
        imageView: ImageView,
        position: Int
    ) {
        // 列表图片优化
        val targetSize = 100 // 列表项尺寸
        
        Glide.with(context)
            .load(url)
            .override(targetSize, targetSize)
            .placeholder(R.drawable.list_placeholder)
            .error(R.drawable.list_error)
            .centerCrop()
            .tag("list_$position")
            .into(imageView)
    }
    
    fun preload(context: Context, urls: List<String>) {
        Glide.with(context)
            .preload(*urls.toTypedArray())
    }
    
    fun clear(context: Context, imageView: ImageView) {
        Glide.with(context).clear(imageView)
    }
}
```

### 10.2 RecyclerView 优化

```kotlin
class OptimizedImageAdapter : RecyclerView.Adapter<OptimizedImageAdapter.ViewHolder>() {
    
    private val items = mutableListOf<ImageItem>()
    private val imageCache = LruCache<String, Drawable>(20)
    
    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val imageView: ImageView = itemView.findViewById(R.id.image)
        
        fun bind(item: ImageItem, position: Int) {
            // 检查缓存
            imageCache.get(item.url)?.let { drawable ->
                imageView.setImageDrawable(drawable)
                return
            }
            
            // 加载图片
            ImageLoader.loadList(
                itemView.context,
                item.url,
                imageView,
                position
            )
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_image, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position], position)
    }
    
    override fun onViewRecycled(holder: ViewHolder) {
        ImageLoader.clear(holder.itemView.context, holder.imageView)
        super.onViewRecycled(holder)
    }
    
    override fun getItemCount() = items.size
}
```

---

## 面试考点

### 基础题

**1. Glide 的缓存机制？**

```
三级缓存：
1. 资源缓存（内存）
2. 数据缓存（内存）
3. 磁盘缓存

缓存策略：
- DiskCacheStrategy.ALL
- DiskCacheStrategy.NONE
- DiskCacheStrategy.DATA
- DiskCacheStrategy.RESOURCE
```

**2. Glide 的核心组件？**

```
- Loader（加载器）
- Decoder（解码器）
- Encoder（编码器）
- ModelLoader（模型加载器）
- DataTransform（数据转换）
- Cache（缓存）
```

**3. 如何优化 Glide 性能？**

```
1. 合理配置缓存大小
2. 按需加载图片尺寸
3. 使用合适的图片格式
4. 避免内存泄漏
5. 使用预加载
```

### 进阶题

**1. Glide 的生命周期管理？**

```
- 使用 Fragment/Activity 上下文
- 手动清理 Target
- 使用 WeakReference
- RecyclerView 中及时清理
```

**2. 如何实现自定义图片转换？**

```
实现 BitmapTransformation 接口：
- transform() 方法执行转换
- getId() 返回唯一标识
- 使用 Pool 复用 Bitmap
```

**3. Glide 和 Picasso 的区别？**

```
Glide:
- 功能更强大
- 缓存机制更完善
- 支持更多格式
- 可定制性更高

Picasso:
- 更简单
- 体积更小
- 已停止维护
```

### 高级题

**1. Glide 的源码架构？**

```
- GlideModule：配置入口
- GlideBuilder：构建器
- Glide：核心调度
- DataFetcher：数据获取
- DecodeCallback：解码回调
- Target：目标视图
```

**2. 如何解决 Glide 的内存问题？**

```
1. 调整缓存大小
2. 使用合适的 Bitmap 配置
3. 及时清理缓存
4. 避免大图片
5. 使用 WebP 格式
```

**3. 如何实现图片加载的优先级？**

```
Priority.HIGH
Priority.NORMAL
Priority.LOW

影响缓存和调度顺序
```

---

## 总结

### 核心要点

1. **基础使用**
   - with().load().into()
   - 支持多种数据源
   - 异步加载

2. **缓存机制**
   - 多级缓存
   - 可配置策略
   - 自动管理

3. **图片转换**
   - 圆角、裁剪
   - 自定义转换
   - 滤镜效果

4. **性能优化**
   - 按需加载
   - 尺寸匹配
   - 格式优化

### 最佳实践

```kotlin
// 1. 使用 Fragment 上下文
Glide.with(fragment).load(url).into(imageView)

// 2. 配置占位图和错误图
.placeholder(R.drawable.placeholder)
.error(R.drawable.error)

// 3. 按需尺寸加载
.override(width, height)

// 4. 使用合适的缓存策略
.diskCacheStrategy(DiskCacheStrategy.ALL)

// 5. 及时清理
Glide.with(context).clear(imageView)
```

---

*本文约 12000 字，涵盖了 Glide 的核心知识点。*
