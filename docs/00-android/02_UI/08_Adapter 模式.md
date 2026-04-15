# 08_Adapter 模式

## 目录

1. [Adapter 设计模式概述](#1-adapter-设计模式概述)
2. [Adapter 的历史演变](#2-adapter-的历史演变)
3. [RecyclerView.Adapter 详解](#3-recyclerviewadapter-详解)
4. [ViewHolder 模式深入解析](#4-viewholder-模式深入解析)
5. [数据更新通知机制](#5-数据更新通知机制)
6. [DiffUtil 高效更新](#6-diffutil-高效更新)
7. [高级 Adapter 技术](#7-高级-adapter-技术)
8. [性能优化最佳实践](#8-性能优化最佳实践)
9. [面试考点汇总](#9-面试考点汇总)

---

## 1. Adapter 设计模式概述

### 1.1 什么是 Adapter 模式？

**Adapter（适配器）模式**是 23 种经典设计模式之一，属于结构型模式。它的核心作用是**将两个不兼容的接口转换为兼容的接口**，使得原本因接口不匹配而不能在一起工作的类可以协同工作。

在 Android 开发中，Adapter 模式的应用非常广泛，特别是在**数据与视图分离**的场景中：

- **数据层**：提供原始数据（List、Array、Database 等）
- **视图层**：负责展示数据的 UI 组件（ListView、RecyclerView、GridView 等）
- **Adapter 层**：作为桥梁，将数据转换为视图可以理解的格式

### 1.2 Adapter 模式的核心角色

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  数据源     │───▶│   Adapter    │───▶│  视图组件   │
│ (Data Source)│   │  (适配器)    │   │ (View)      │
└─────────────┘    └──────────────┘    └─────────────┘
     ↓                  ↓                     ↓
  原始数据          数据转换与绑定          UI 展示
  (List<T>)        (inflate + bind)        (View/ViewHolder)
```

**核心角色分解：**

| 角色 | 说明 | Android 中的对应 |
|------|------|----------------|
| **Target（目标）** | 客户端期望的接口 | AdapterView（ListView、RecyclerView） |
| **Adaptee（被适配者）** | 现有的、不兼容的接口 | 数据源（List、Array 等） |
| **Adapter（适配器）** | 转换层，实现目标接口并调用被适配者 | BaseAdapter、RecyclerView.Adapter |

### 1.3 Android 中 Adapter 的价值

Adapter 模式在 Android 中解决了以下几个核心问题：

#### 1.3.1 解耦数据与视图

```kotlin
// ❌ 没有 Adapter 的情况：数据与视图耦合
class MyActivity : Activity() {
    private val dataList = mutableListOf<String>()
    
    fun renderData() {
        // 直接在 Activity 中操作 View，耦合严重
        for (data in dataList) {
            val textView = TextView(this)
            textView.text = data
            listView.addView(textView)
        }
    }
}

// ✅ 使用 Adapter：数据与视图分离
class MyActivity : Activity() {
    private val adapter = MyAdapter(dataList)
    
    fun renderData() {
        recyclerView.adapter = adapter // 只需设置 adapter
    }
}

class MyAdapter(data: List<String>) : RecyclerView.Adapter<MyAdapter.ViewHolder>() {
    // 数据变化只需 notify，不需要关心 View 的实现
}
```

#### 1.3.2 复用 View，提升性能

Adapter 模式天然支持 View 复用机制，通过 ViewHolder 模式避免频繁的 `inflate` 操作。

#### 1.3.3 统一的数据更新接口

提供标准的 `notifyDataSetChanged()`、`notifyItemChanged()` 等方法，统一数据更新的处理逻辑。

---

## 2. Adapter 的历史演变

### 2.1 早期 Adapter 体系

Android 早期的 Adapter 体系围绕 **BaseAdapter** 构建，适用于 ListView、GridView 等组件：

```kotlin
// BaseAdapter 的抽象方法
abstract class BaseAdapter {
    abstract fun getCount(): Int
    abstract fun getItem(position: Int): Any
    abstract fun getItemId(position: Int): Long
    abstract fun getView(position: Int, convertView: View?, parent: ViewGroup?): View
    
    // 可选方法
    fun areAllItemsEnabled(): Boolean = true
    fun hasStableIds(): Boolean = false
    fun isEnabled(position: Int): Boolean = true
}
```

**经典实现示例：**

```kotlin
class SimpleAdapter(
    context: Context,
    data: List<Map<String, Any>>,
    resource: Int,
    from: Array<String>,
    to: IntArray
) : BaseAdapter
    
class ArrayAdapter<T>(
    context: Context,
    resource: Int,
    objects: List<T>
) : Adapter<T>

class CursorAdapter(
    context: Context,
    cursor: Cursor,
    flags: Int
) : Adapter
```

### 2.2 RecyclerView.Adapter 的诞生

随着需求的复杂化，BaseAdapter 体系的局限性逐渐暴露：

**局限性：**

1. **性能瓶颈**：ListView 的 View 复用机制不够灵活
2. **功能单一**：不支持多种视图类型的高效管理
3. **扩展性差**：难以实现复杂的布局（如瀑布流、网格）
4. **动画支持弱**：插入、删除、移动的动画效果有限

**RecyclerView 的优势：**

```kotlin
// RecyclerView.Adapter 相比 BaseAdapter 的改进
abstract class RecyclerView.Adapter<T : RecyclerView.ViewHolder> {
    
    // 1. 强制使用 ViewHolder 模式
    abstract fun onCreateViewHolder(parent: ViewGroup, viewType: Int): T
    abstract fun onBindViewHolder(holder: T, position: Int)
    abstract fun getItemCount(): Int
    
    // 2. 支持多种视图类型
    open fun getItemViewType(position: Int): Int = 0
    
    // 3. 更细粒度的更新通知
    fun notifyItemChanged(position: Int)
    fun notifyItemInserted(position: Int)
    fun notifyItemRemoved(position: Int)
    fun notifyItemRangeChanged(positionStart: Int, itemCount: Int)
    
    // 4. 支持 LayoutManager 分离
    // 5. 支持 ItemDecoration
    // 6. 支持 ItemAnimator
}
```

### 2.3 Adapter 体系的演变历程

```
BaseAdapter (2008)
    ├── ArrayAdapter
    ├── SimpleAdapter
    ├── CursorAdapter
    └── ...
    
        ↓ (性能、功能需求推动)
        
RecyclerView.Adapter (2014, Android 5.0)
    ├── 强制 ViewHolder 模式
    ├── 支持多种 ViewType
    ├── 细粒度更新通知
    ├── LayoutManager 分离
    ├── ItemDecoration 支持
    └── ItemAnimator 支持
        
        ↓ (现代需求推动)
        
ListAdapter (2018, AndroidX Recyclerview 1.1)
    ├── 内置 DiffUtil
    ├── ListObservable 支持
    └── 异步数据计算
    
DiffUtil (2015)
    └── 高效计算数据集差异
```

---

## 3. RecyclerView.Adapter 详解

### 3.1 RecyclerView 的核心组件

RecyclerView 采用 **MVP 模式**，将职责分离：

```
┌─────────────────────────────────────────────────────┐
│                    RecyclerView                    │
│  ┌──────────────────────────────────────────────┐  │
│  │                 Context                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  LayoutManager│  │    Adapter   │  │   Item   │ │
│  │  (布局管理器) │  │  (数据适配器)│  │ Decoration││
│  └──────────────┘  └──────────────┘  └──────────┘ │
│         ↓                ↓                ↓         │
│  决定 View 如何布局    提供 View          装饰 Item  │
│  LinearLayoutManager │  数据绑定         └──────────┘ │
│  GridLayoutManager   │                          │   │
│  StaggeredGridLayoutManager │                 │   │
│  └──────────────┘  ┌──────────────┐  ┌──────────┐ │
│                    │ ItemAnimator │  │  Cache   │ │
│                    │ (动画处理器) │  │  (缓存)  │ │
│                    └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
```

### 3.2 Adapter 的核心方法详解

#### 3.2.1 基础方法

```kotlin
class MyAdapter : RecyclerView.Adapter<MyAdapter.ViewHolder>() {
    
    /**
     * 创建 ViewHolder
     * @param parent 父容器 (RecyclerView)
     * @param viewType 视图类型（支持多种 Item 类型）
     * @return ViewHolder 实例
     */
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        // inflate 布局文件
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_layout, parent, false)
        return ViewHolder(view)
    }
    
    /**
     * 绑定数据到 ViewHolder
     * @param holder 视图持有者
     * @param position 当前 Item 的位置（注意：可能是旧 position）
     */
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        // 数据绑定逻辑
        val item = dataList[position]
        holder.bind(item)
    }
    
    /**
     * 返回数据项总数
     */
    override fun getItemCount(): Int = dataList.size
}
```

#### 3.2.2 多种视图类型支持

```kotlin
class MultiTypeAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        const val TYPE_TEXT = 1
        const val TYPE_IMAGE = 2
        const val TYPE_VIDEO = 3
    }
    
    data class Item(
        val type: Int,
        val data: Any
    )
    
    private val items = mutableListOf<Item>()
    
    override fun getItemViewType(position: Int): Int {
        return items[position].type
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_TEXT -> TextViewHolder.inflate(parent)
            TYPE_IMAGE -> ImageViewHolder.inflate(parent)
            TYPE_VIDEO -> VideoViewHolder.inflate(parent)
            else -> throw IllegalArgumentException("Unknown viewType: $viewType")
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = items[position]
        when (val viewType = item.type) {
            TYPE_TEXT -> (holder as TextViewHolder).bind(item.data as TextData)
            TYPE_IMAGE -> (holder as ImageViewHolder).bind(item.data as ImageData)
            TYPE_VIDEO -> (holder as VideoViewHolder).bind(item.data as VideoData)
        }
    }
    
    override fun getItemCount(): Int = items.size
}
```

#### 3.2.3 完整的 Adapter 实现模板

```kotlin
/**
 * 通用 Adapter 模板
 * @param T 数据类型
 * @param VH ViewHolder 类型
 */
class BaseAdapter<T, VH : RecyclerView.ViewHolder>(
    private val onItemClick: ((T, Int) -> Unit)? = null,
    private val onItemLongClick: ((T, Int) -> Unit)? = null
) : RecyclerView.Adapter<VH>() {
    
    protected val dataList = mutableListOf<T>()
    
    // 必须重写的方法
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        throw NotImplementedError("Must implement onCreateViewHolder")
    }
    
    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = dataList[position]
        onBindItem(holder, item, position)
        setupClickListeners(holder, item, position)
    }
    
    override fun getItemCount(): Int = dataList.size
    
    // 扩展方法
    protected abstract fun onBindItem(holder: VH, item: T, position: Int)
    
    // 点击事件处理
    private fun setupClickListeners(holder: VH, item: T, position: Int) {
        holder.itemView.setOnClickListener {
            onItemClick?.invoke(item, position)
        }
        holder.itemView.setOnLongClickListener {
            onItemLongClick?.invoke(item, position) ?: false
        }
    }
    
    // 数据操作方法
    fun submitList(newList: List<T>) {
        dataList.clear()
        dataList.addAll(newList)
        notifyDataSetChanged()
    }
    
    fun addAll(newItems: List<T>) {
        val start = dataList.size
        dataList.addAll(newItems)
        notifyItemRangeInserted(start, newItems.size)
    }
    
    fun add(item: T) {
        dataList.add(item)
        notifyItemInserted(dataList.size - 1)
    }
    
    fun removeAt(position: Int) {
        dataList.removeAt(position)
        notifyItemRemoved(position)
    }
    
    fun updateItem(position: Int, newItem: T) {
        dataList[position] = newItem
        notifyItemChanged(position)
    }
    
    // 获取数据
    fun getItem(position: Int): T = dataList[position]
    fun getList(): List<T> = dataList.toList()
}
```

### 3.3 Adapter 的高级特性

#### 3.3.1 hasStableIds 与 getItemId

```kotlin
class StableIdAdapter : RecyclerView.Adapter<MyAdapter.ViewHolder>() {
    
    data class Item(
        val id: Long,      // 唯一标识
        val name: String
    )
    
    private val items = mutableListOf<Item>()
    
    override fun hasStableIds(): Boolean = true
    
    override fun getItemId(position: Int): Long {
        return items[position].id  // 返回唯一 ID
    }
    
    override fun onCreateViewHolder(...) { ... }
    override fun onBindViewHolder(...) { ... }
    override fun getItemCount(): Int = items.size
}
```

**hasStableIds() 的作用：**

1. **动画优化**：支持更流畅的插入、删除、移动动画
2. **状态恢复**：系统可以正确恢复滚动位置
3. **DiffUtil 要求**：使用 DiffUtil 时必须有稳定 ID

#### 3.3.2 setHasStableIds(true) 的坑

```kotlin
// ❌ 错误示例：ID 不唯一
override fun getItemId(position: Int): Long {
    return position.toLong()  // 数据删除后 ID 会重复
}

// ✅ 正确示例：使用业务 ID
override fun getItemId(position: Int): Long {
    return items[position].uniqueId  // 业务层面的唯一标识
}
```

---

## 4. ViewHolder 模式深入解析

### 4.1 ViewHolder 模式的作用

**问题场景：** 不使用 ViewHolder 时

```kotlin
// ❌ 每次滚动都重新 findViewById
override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
    val view = View.inflate(context, R.layout.item_layout, null)
    
    val textView = view.findViewById<TextView>(R.id.text_view)  // 每次都查找
    val imageView = view.findViewById<ImageView>(R.id.image_view)  // 每次都查找
    
    textView.text = dataList[position]
    // 性能问题：频繁的 findViewById
}
```

**ViewHolder 解决方案：**

```kotlin
// ✅ 将 View 引用缓存到 ViewHolder 中
class ViewHolder(itemView: View) {
    val textView: TextView = itemView.findViewById(R.id.text_view)  // 只查找一次
    val imageView: ImageView = itemView.findViewById(R.id.image_view)
    
    fun bind(data: String) {
        textView.text = data
    }
}

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
    val view = LayoutInflater.from(parent.context)
        .inflate(R.layout.item_layout, parent, false)
    return ViewHolder(view)  // 创建时查找一次
}

override fun onBindViewHolder(holder: ViewHolder, position: Int) {
    holder.bind(dataList[position])  // 直接使用缓存的引用
}
```

### 4.2 ViewHolder 的演变

#### 4.2.1 早期手动实现

```kotlin
// 方式 1：内部类
class ViewHolder {
    var textView: TextView? = null
    var imageView: ImageView? = null
    var button: Button? = null
}

// 方式 2：View 的 tag 存储
val view = LayoutInflater.from(context).inflate(R.layout.item, parent, false)
val viewHolder = object {
    val textView = view.findViewById<TextView>(R.id.text)
    val imageView = view.findViewById<ImageView>(R.id.image)
}
view.tag = viewHolder
```

#### 4.2.2 RecyclerView 内置 ViewHolder

```kotlin
// RecyclerView 提供了抽象的 ViewHolder 基类
abstract class ViewHolder(view: View) {
    val itemView: View = view
    var layoutPosition: Int = NO_POSITION
    var absoluteAdapterPosition: Int = NO_POSITION
    var payloads: MutableList<Any>? = null
    
    fun getItemViewType(): Int
    fun setIsRecyclable(isRecyclable: Boolean)
    // ... 其他方法
}

// 子类只需传入 View 即可
class MyViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val textView: TextView = view.findViewById(R.id.text)
}
```

#### 4.2.3 Kotlin 属性委托优化

```kotlin
// 使用 by view 简化 findViewById
class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val textView: TextView by view { itemView.findViewById(R.id.text) }
    val imageView: ImageView by view { itemView.findViewById(R.id.image) }
    val button: Button by view { itemView.findViewById(R.id.button) }
}

// 扩展函数实现
inline fun <reified T : View> view(init: (View) -> T): Lazy<T> = 
    lazy(LazyThreadSafetyMode.NONE) { init(itemView) }
```

### 4.3 ViewHolder 的最佳实践

#### 4.3.1 绑定数据的最佳实践

```kotlin
class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val textView: TextView = itemView.findViewById(R.id.text)
    val imageView: ImageView = itemView.findViewById(R.id.image)
    
    // ❌ 不好的做法：直接在 ViewHolder 中处理复杂逻辑
    fun bind(data: Data) {
        textView.text = data.name
        if (data.isActive) {
            textView.visibility = View.VISIBLE
        } else {
            textView.visibility = View.GONE
        }
        Glide.with(itemView.context).load(data.imageUrl).into(imageView)
        // 逻辑混乱，不利于维护
    }
    
    // ✅ 好的做法：使用 DiffUtil 提供的 payload
    fun bind(payloads: List<Any>) {
        if (payloads.isEmpty()) {
            bindFull(data)
        } else {
            bindPartial(payloads)
        }
    }
    
    private fun bindFull(data: Data) {
        textView.text = data.name
        imageView.setImageResource(data.iconRes)
    }
    
    private fun bindPartial(payloads: List<Any>) {
        // 只更新变化的字段
        if (payloads.contains("name")) {
            textView.text = data.name
        }
        if (payloads.contains("icon")) {
            imageView.setImageResource(data.iconRes)
        }
    }
}
```

#### 4.3.2 处理复杂布局的 ViewHolder

```kotlin
/**
 * 复杂的 Item 布局 ViewHolder
 * 支持多种状态显示
 */
class ComplexViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    
    // 基础 View
    private val title: TextView = itemView.findViewById(R.id.title)
    private val subtitle: TextView = itemView.findViewById(R.id.subtitle)
    private val icon: ImageView = itemView.findViewById(R.id.icon)
    private val checkbox: CheckBox = itemView.findViewById(R.id.checkbox)
    private val progress: ProgressBar = itemView.findViewById(R.id.progress)
    
    // 状态 View
    private val loadingView: View = itemView.findViewById(R.id.loading)
    private val errorView: TextView = itemView.findViewById(R.id.error)
    private val emptyView: View = itemView.findViewById(R.id.empty)
    private val contentView: View = itemView.findViewById(R.id.content)
    
    // 数据模型
    private var data: ItemData? = null
    
    /**
     * 绑定数据
     */
    fun bind(data: ItemData) {
        this.data = data
        
        // 根据状态显示不同 View
        when (data.state) {
            State.LOADING -> showLoading()
            State.ERROR -> showError(data.errorMessage)
            State.EMPTY -> showEmpty()
            State.SUCCESS -> showContent(data)
        }
    }
    
    private fun showLoading() {
        loadingView.visibility = View.VISIBLE
        contentView.visibility = View.GONE
        errorView.visibility = View.GONE
        emptyView.visibility = View.GONE
    }
    
    private fun showError(message: String) {
        loadingView.visibility = View.GONE
        contentView.visibility = View.GONE
        errorView.visibility = View.VISIBLE
        errorView.text = message
        emptyView.visibility = View.GONE
    }
    
    private fun showEmpty() {
        loadingView.visibility = View.GONE
        contentView.visibility = View.GONE
        errorView.visibility = View.GONE
        emptyView.visibility = View.VISIBLE
    }
    
    private fun showContent(data: ItemData) {
        loadingView.visibility = View.GONE
        contentView.visibility = View.VISIBLE
        errorView.visibility = View.GONE
        emptyView.visibility = View.GONE
        
        title.text = data.title
        subtitle.text = data.subtitle
        icon.setImageResource(data.iconResId)
        checkbox.isChecked = data.isSelected
        
        if (data.isProgressive) {
            progress.visibility = View.VISIBLE
        } else {
            progress.visibility = View.GONE
        }
    }
    
    /**
     * 获取当前数据
     */
    fun getData(): ItemData? = data
}
```

### 4.4 ViewHolder 的复用机制

```kotlin
// ViewHolder 复用流程图
/*
1. 用户滚动 RecyclerView
       ↓
2. 判断 View 是否滑出屏幕
       ↓
3. 滑出的 ViewHolder 放入回收池 (RecyclerView.Recycler)
       ├─ mScrap (临时缓存)
       └─ mCacheViews (二级缓存)
       ↓
4. 需要新 View 时，优先从回收池获取
       ↓
5. 回收池没有则调用 onCreateViewHolder() 创建新 View
       ↓
6. 调用 onBindViewHolder() 绑定新数据
*/
```

**回收池配置：**

```kotlin
recyclerView.apply {
    // 二级缓存大小（默认 2）
    setRecycledViewPool(RecycledViewPool().apply {
        setMaxRecycledViews(TYPE_1, 10)  // 类型 1 最多缓存 10 个
        setMaxRecycledViews(TYPE_2, 20)  // 类型 2 最多缓存 20 个
    })
    
    // 共享回收池（多个 RecyclerView 共享）
    val pool = RecycledViewPool()
    recyclerView1.setRecycledViewPool(pool)
    recyclerView2.setRecycledViewPool(pool)
}
```

---

## 5. 数据更新通知机制

### 5.1 通知方法对比

| 方法 | 用途 | 性能 | 动画支持 |
|------|------|------|----------|
| `notifyDataSetChanged()` | 通知整个数据集变化 | 低 | 无 |
| `notifyItemChanged(int)` | 通知单个 Item 变化 | 高 | ✅ |
| `notifyItemInserted(int)` | 通知插入 | 高 | ✅ |
| `notifyItemRemoved(int)` | 通知删除 | 高 | ✅ |
| `notifyItemMoved(from, to)` | 通知移动 | 高 | ✅ |
| `notifyItemRangeChanged(...)` | 通知范围变化 | 高 | 部分 |
| `notifyItemRangeInserted(...)` | 通知范围插入 | 高 | 部分 |
| `notifyItemRangeRemoved(...)` | 通知范围删除 | 高 | 部分 |

### 5.2 notifyDataSetChanged 的问题

```kotlin
// ❌ 使用 notifyDataSetChanged() 的问题
fun refreshData(newList: List<Data>) {
    dataList.clear()
    dataList.addAll(newList)
    notifyDataSetChanged()  // 所有 View 都会重新绑定
}

// 问题：
// 1. 所有 Item 都会重新绑定，浪费性能
// 2. 不支持动画效果
// 3. 滚动位置可能丢失
// 4. 用户感知差
```

### 5.3 细粒度通知的优势

```kotlin
// ✅ 使用细粒度通知
class SmartAdapter : RecyclerView.Adapter<ViewHolder>() {
    
    private val dataList = mutableListOf<Data>()
    
    // 单个 Item 更新
    fun updateItem(position: Int, newData: Data) {
        dataList[position] = newData
        notifyItemChanged(position)  // 只更新这一个 Item
    }
    
    // 插入单个 Item
    fun addItem(data: Data, position: Int = dataList.size) {
        dataList.add(position, data)
        notifyItemInserted(position)  // 触发插入动画
    }
    
    // 删除单个 Item
    fun removeItem(position: Int) {
        dataList.removeAt(position)
        notifyItemRemoved(position)  // 触发删除动画
    }
    
    // 移动 Item
    fun moveItem(from: Int, to: Int) {
        val item = dataList.removeAt(from)
        dataList.add(to, item)
        notifyItemMoved(from, to)  // 触发移动动画
    }
    
    // 批量更新
    fun updateItems(positions: List<Int>) {
        // 更新多个 Item
        positions.forEach { pos ->
            // 更新逻辑
        }
        // 使用 range 方法性能更好
        if (positions.isNotEmpty()) {
            val start = positions.min()
            val end = positions.max()
            notifyItemRangeChanged(start, end - start + 1)
        }
    }
}
```

### 5.4 带 Payload 的更新

```kotlin
/**
 * 使用 Payload 进行增量更新
 */
class PayloadAdapter : RecyclerView.Adapter<ViewHolder>() {
    
    data class Item(
        val id: String,
        val title: String,
        val subtitle: String,
        val isSelected: Boolean
    )
    
    private val items = mutableListOf<Item>()
    
    // 更新选中状态（只更新 checkbox，不重新绑定整个 View）
    fun toggleSelection(position: Int) {
        val item = items[position]
        items[position] = item.copy(isSelected = !item.isSelected)
        
        val payload = listOf("isSelected")  // 只通知选中状态变化
        notifyItemChanged(position, payload)  // 使用 payload
    }
    
    // 更新标题（只更新 TextView，不影响其他 View）
    fun updateTitle(position: Int, newTitle: String) {
        val item = items[position]
        items[position] = item.copy(title = newTitle)
        
        val payload = listOf("title")
        notifyItemChanged(position, payload)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        onBindViewHolder(holder, position, listOf<Any>())
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int, payloads: List<Any>) {
        val item = items[position]
        
        if (payloads.isEmpty()) {
            // 全量绑定
            holder.bind(item)
        } else {
            // 增量绑定
            if (payloads.contains("title")) {
                holder.bindTitle(item.title)
            }
            if (payloads.contains("isSelected")) {
                holder.bindSelection(item.isSelected)
            }
            if (payloads.contains("subtitle")) {
                holder.bindSubtitle(item.subtitle)
            }
        }
    }
}
```

### 5.5 异步数据加载的通知

```kotlin
/**
 * 处理异步数据加载时的通知
 */
class AsyncAdapter : RecyclerView.Adapter<ViewHolder>() {
    
    private val dataList = mutableListOf<Data>()
    private val loadingStates = mutableMapOf<Int, Boolean>()
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val isLoading = loadingStates[position] ?: false
        holder.bind(dataList[position], isLoading)
    }
    
    // 模拟异步加载
    fun loadMore() {
        // 显示加载状态
        showLoading(true)
        
        // 异步获取数据
        viewModel.getData { newData ->
            val start = dataList.size
            dataList.addAll(newData)
            
            // 插入新数据
            notifyItemRangeInserted(start, newData.size)
            
            // 隐藏加载状态
            showLoading(false)
        }
    }
    
    // 刷新数据
    fun refresh() {
        // 显示刷新状态
        showRefreshing(true)
        
        viewModel.refreshData { newData ->
            val oldSize = dataList.size
            dataList.clear()
            dataList.addAll(newData)
            
            // 使用范围更新而不是 notifyDataSetChanged
            notifyItemRangeChanged(0, dataList.size)
            
            showRefreshing(false)
        }
    }
}
```

---

## 6. DiffUtil 高效更新

### 6.1 DiffUtil 简介

**DiffUtil** 是 AndroidX 提供的一个工具类，用于**计算两个数据集之间的差异**。它基于著名的 ** Myers 算法**，能够在 O(ED) 的时间复杂度内计算出两个列表的最小编辑脚本（插入、删除、移动）。

**核心优势：**

1. ✅ **精确更新**：只更新真正变化的 Item
2. ✅ **动画支持**：支持插入、删除、移动的动画效果
3. ✅ **性能优化**：避免不必要的 View 重建
4. ✅ **滚动保持**：自动保持滚动位置

### 6.2 基础使用

```kotlin
/**
 * DiffUtil 基础使用示例
 */
class DiffAdapter : RecyclerView.Adapter<ViewHolder>() {
    
    data class Item(
        val id: Long,
        val name: String,
        val description: String
    )
    
    private var dataList = emptyList<Item>()
    
    /**
     * 提交新数据
     */
    fun submitList(newList: List<Item>) {
        val diffResult = DiffUtil.calculateDiff(object : DiffUtil.Callback() {
            
            override fun getOldListSize(): Int = dataList.size
            
            override fun getNewListSize(): Int = newList.size
            
            /**
             * 判断两个 Item 是否是同一个
             * 注意：这里只比较 ID，不比较内容
             */
            override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
                return dataList[oldItemPosition].id == newList[newItemPosition].id
            }
            
            /**
             * 判断两个 Item 的内容是否相同
             */
            override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
                val oldItem = dataList[oldItemPosition]
                val newItem = newList[newItemPosition]
                return oldItem.name == newItem.name && 
                       oldItem.description == newItem.description
            }
        })
        
        // 更新数据
        dataList = newList
        
        // 应用差异结果
        diffResult.dispatchUpdatesTo(this)
    }
    
    // ViewHolder 和绑定逻辑...
}
```

### 6.3 DiffCallback 详解

```kotlin
/**
 * DiffUtil.Callback 的完整实现
 */
class MyDiffCallback(
    private val oldList: List<Item>,
    private val newList: List<Item>
) : DiffUtil.Callback() {
    
    override fun getOldListSize(): Int = oldList.size
    override fun getNewListSize(): Int = newList.size
    
    /**
     * 核心方法 1：判断两个 Item 是否是同一个对象
     * 
     * 比较规则：
     * - 通常比较唯一 ID
     * - 不应该比较内容（性能问题）
     * - 返回 true 表示它们是同一个 Item（即使内容变了）
     * - 返回 false 表示它们是不同的 Item
     */
    override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        return oldList[oldItemPosition].id == newList[newItemPosition].id
    }
    
    /**
     * 核心方法 2：判断两个 Item 的内容是否完全相同
     * 
     * 比较规则：
     * - 比较所有需要显示的字段
     * - 可以做一些优化（比如图片 URL 不比较，由图片库自己处理）
     * - 返回 true 表示内容没变，不需要更新 View
     * - 返回 false 表示内容变了，需要重新绑定
     */
    override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        val oldItem = oldList[oldItemPosition]
        val newItem = newList[newItemPosition]
        
        return oldItem.name == newItem.name &&
               oldItem.description == newItem.description &&
               oldItem.price == newItem.price
    }
    
    /**
     * 可选方法：获取变化的 payload
     * 
     * 用于增量更新，只更新变化的字段
     */
    override fun getChangePayload(oldItemPosition: Int, newItemPosition: Int): Any? {
        val oldItem = oldList[oldItemPosition]
        val newItem = newList[newItemPosition]
        
        val changes = mutableListOf<String>()
        
        if (oldItem.name != newItem.name) changes.add("name")
        if (oldItem.description != newItem.description) changes.add("description")
        if (oldItem.price != newItem.price) changes.add("price")
        
        return if (changes.isEmpty()) null else changes.toTypedArray()
    }
}
```

### 6.4 DiffUtil 的高级用法

#### 6.4.1 支持移动检测

```kotlin
/**
 * 启用移动检测
 */
fun calculateDiffWithMoveDetection(oldList: List<Item>, newList: List<Item>): DiffUtil.DiffResult {
    val callback = MyDiffCallback(oldList, newList)
    
    return DiffUtil.calculateDiff(callback, true)  // true 表示启用移动检测
}
```

#### 6.4.2 后台线程计算

```kotlin
/**
 * 在后台线程计算差异（大数据集推荐）
 */
fun calculateDiffInBackground(
    oldList: List<Item>,
    newList: List<Item>,
    adapter: RecyclerView.Adapter<*>
) {
    val callback = MyDiffCallback(oldList, newList)
    
    // 使用 DiffUtil 的后台计算
    val executor = DiffUtil.DiffCallback.getDiffExecutor()
    executor.execute {
        val result = DiffUtil.calculateDiff(callback)
        
        // 回到主线程应用更新
        Handler(Looper.getMainLooper()).post {
            result.dispatchUpdatesTo(adapter)
        }
    }
}
```

#### 6.4.3 自定义比较器

```kotlin
/**
 * 使用自定义比较器
 */
class CustomDiffCallback(
    oldList: List<Item>,
    newList: List<Item>,
    private val comparator: Comparator<Item>
) : DiffUtil.Callback() {
    
    override fun getOldListSize(): Int = oldList.size
    override fun getNewListSize(): Int = newList.size
    
    override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        return oldList[oldItemPosition].id == newList[newItemPosition].id
    }
    
    override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        val oldItem = oldList[oldItemPosition]
        val newItem = newList[newItemPosition]
        
        // 使用自定义比较器
        return comparator.compare(oldItem, newItem) == 0
    }
}

// 使用
val comparator = Comparator<Item> { old, new ->
    when {
        old.name != new.name -> 1
        old.price != new.price -> 1
        else -> 0
    }
}

val result = DiffUtil.calculateDiff(CustomDiffCallback(oldList, newList, comparator))
```

### 6.5 ListAdapter 简化使用

```kotlin
/**
 * ListAdapter 封装了 DiffUtil，使用更简单
 */
class SimpleListAdapter : ListAdapter<Item, ViewHolder>(DIFF_CALLBACK) {
    
    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Item>() {
            
            override fun areItemsTheSame(oldItem: Item, newItem: Item): Boolean {
                return oldItem.id == newItem.id
            }
            
            override fun areContentsTheSame(oldItem: Item, newItem: Item): Boolean {
                return oldItem == newItem  // 使用 data class 的 equals
            }
            
            override fun getChangePayload(oldItem: Item, newItem: Item): Any? {
                // 返回变化的字段
                return if (oldItem.name != newItem.name) "name"
                else if (oldItem.price != newItem.price) "price"
                else null
            }
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        // ...
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        // ...
    }
}

// 使用
val adapter = SimpleListAdapter()
recyclerView.adapter = adapter

// 提交数据（自动计算差异并更新）
adapter.submitList(newDataList)

// 在后台计算
adapter.submitList(newDataList) {
    // 更新完成后的回调
}
```

### 6.6 ListUpdateCallback 批量更新

```kotlin
/**
 * 使用 ListUpdateCallback 进行更细粒度的更新
 */
class DiffResultCallback : DiffUtil.ListUpdateCallback {
    
    private val adapter: RecyclerView.Adapter<*>
    
    override fun onInserted(position: Int, count: Int) {
        adapter.notifyItemRangeInserted(position, count)
    }
    
    override fun onRemoved(position: Int, count: Int) {
        adapter.notifyItemRangeRemoved(position, count)
    }
    
    override fun onMoved(fromPosition: Int, toPosition: Int) {
        adapter.notifyItemMoved(fromPosition, toPosition)
    }
    
    override fun onChanged(
        position: Int,
        rowCount: Int,
        payload: List<Any>?
    ) {
        adapter.notifyItemRangeChanged(position, rowCount, payload)
    }
}

// 使用
val result = DiffUtil.calculateDiff(callback)
result.dispatchUpdatesTo(DiffResultCallback(adapter))
```

### 6.7 DiffUtil 性能优化

```kotlin
/**
 * DiffUtil 性能优化技巧
 */
class OptimizedDiffAdapter : RecyclerView.Adapter<ViewHolder>() {
    
    data class Item(
        val id: Long,
        val name: String,
        val description: String,
        val imageUrl: String,  // 大量数据时图片 URL 比较开销大
        val timestamp: Long
    )
    
    private var dataList = emptyList<Item>()
    
    fun submitList(newList: List<Item>) {
        val callback = object : DiffUtil.Callback() {
            
            override fun getOldListSize(): Int = dataList.size
            override fun getNewListSize(): Int = newList.size
            
            override fun areItemsTheSame(oldPos: Int, newPos: Int): Boolean {
                // 只比较 ID，快速
                return dataList[oldPos].id == newList[newPos].id
            }
            
            override fun areContentsTheSame(oldPos: Int, newPos: Int): Boolean {
                val oldItem = dataList[oldPos]
                val newItem = newList[newPos]
                
                // 优化：不比较图片 URL，由图片库自己处理
                // 优化：不比较时间戳，只比较显示内容
                return oldItem.name == newItem.name &&
                       oldItem.description == newItem.description
            }
            
            override fun getChangePayload(oldPos: Int, newPos: Int): Any? {
                val oldItem = dataList[oldPos]
                val newItem = newList[newPos]
                
                // 返回具体变化的字段，用于增量更新
                return when {
                    oldItem.name != newItem.name -> "name"
                    oldItem.description != newItem.description -> "description"
                    else -> null
                }
            }
        }
        
        // 大数据集：使用后台线程计算
        if (newList.size > 100) {
            calculateDiffAsync(callback) { result ->
                dataList = newList
                result.dispatchUpdatesTo(this@OptimizedDiffAdapter)
            }
        } else {
            val result = DiffUtil.calculateDiff(callback)
            dataList = newList
            result.dispatchUpdatesTo(this@OptimizedDiffAdapter)
        }
    }
    
    private fun calculateDiffAsync(callback: DiffUtil.Callback, callbackResult: (DiffUtil.DiffResult) -> Unit) {
        val executor = DiffUtil.getDiffExecutor()
        executor.execute {
            val result = DiffUtil.calculateDiff(callback)
            Handler(Looper.getMainLooper()).post {
                callbackResult(result)
            }
        }
    }
}
```

### 6.8 DiffUtil 常见问题

#### 6.8.1 问题：动画闪烁

```kotlin
// ❌ 问题：直接替换整个列表
fun refreshData(newList: List<Item>) {
    dataList = newList
    notifyDataSetChanged()  // 所有 Item 都会闪烁
}

// ✅ 解决：使用 DiffUtil
fun refreshData(newList: List<Item>) {
    val oldList = dataList
    dataList = newList
    
    val result = DiffUtil.calculateDiff(MyDiffCallback(oldList, newList))
    result.dispatchUpdatesTo(this)  // 平滑动画
}
```

#### 6.8.2 问题：滚动位置丢失

```kotlin
// ❌ 问题：使用 notifyDataSetChanged 后滚动位置重置
notifyDataSetChanged()  // 可能导致滚动到顶部

// ✅ 解决：使用 DiffUtil 保持滚动位置
val result = DiffUtil.calculateDiff(callback)
result.dispatchUpdatesTo(this)  // 自动保持滚动位置
```

#### 6.8.3 问题：ID 不唯一导致的错误

```kotlin
// ❌ 问题：使用 position 作为 ID
override fun areItemsTheSame(oldPos: Int, newPos: Int): Boolean {
    return oldPos == newPos  // 错误！数据变化后 position 会变
}

// ✅ 解决：使用业务 ID
override fun areItemsTheSame(oldPos: Int, newPos: Int): Boolean {
    return dataList[oldPos].uniqueId == newList[newPos].uniqueId
}
```

---

## 7. 高级 Adapter 技术

### 7.1 分类型 Adapter（TypeDelegation）

```kotlin
/**
 * 类型委托模式：优雅地处理多种 Item 类型
 */
class MultiTypeAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    sealed class Item {
        data class TextItem(val text: String) : Item()
        data class ImageItem(val url: String) : Item()
        data class VideoItem(val url: String) : Item()
        object HeaderItem : Item()
        object FooterItem : Item()
    }
    
    private val items = mutableListOf<Item>()
    
    // 类型映射
    private val typeMapper = mapOf(
        Item::class.java to -1,
        Item.TextItem::class.java to TYPE_TEXT,
        Item.ImageItem::class.java to TYPE_IMAGE,
        Item.VideoItem::class.java to TYPE_VIDEO,
        Item.HeaderItem::class.java to TYPE_HEADER,
        Item.FooterItem::class.java to TYPE_FOOTER
    )
    
    override fun getItemViewType(position: Int): Int {
        return when (val item = items[position]) {
            is Item.TextItem -> TYPE_TEXT
            is Item.ImageItem -> TYPE_IMAGE
            is Item.VideoItem -> TYPE_VIDEO
            is Item.HeaderItem -> TYPE_HEADER
            is Item.FooterItem -> TYPE_FOOTER
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_TEXT -> TextViewHolder.inflate(parent)
            TYPE_IMAGE -> ImageViewHolder.inflate(parent)
            TYPE_VIDEO -> VideoViewHolder.inflate(parent)
            TYPE_HEADER -> HeaderViewHolder.inflate(parent)
            TYPE_FOOTER -> FooterViewHolder.inflate(parent)
            else -> throw IllegalArgumentException("Unknown viewType: $viewType")
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = items[position]
        when (val holder = holder) {
            is TextViewHolder -> (item as Item.TextItem).let { holder.bind(it.text) }
            is ImageViewHolder -> (item as Item.ImageItem).let { holder.bind(it.url) }
            is VideoViewHolder -> (item as Item.VideoItem).let { holder.bind(it.url) }
            is HeaderViewHolder -> holder.bind()
            is FooterViewHolder -> holder.bind()
        }
    }
    
    override fun getItemCount(): Int = items.size
}
```

### 7.2 使用库简化多类型处理

```kotlin
/**
 * 使用 com.h6ah4i.android.widget.advrecyclerview 库
 * 或者使用 Android 官方的 MultiTypeDelegate
 */
class MultiTypeAdapterWithDelegate : MultiTypeAdapter<Item>() {
    
    init {
        // 注册不同类型的处理
        registerDelegate(TextItemDelegate())
        registerDelegate(ImageItemDelegate())
        registerDelegate(VideoItemDelegate())
    }
}

class TextItemDelegate : MultiTypeDelegateHelper<Item>().item {
    override fun getItemViewType(): Int = TYPE_TEXT
    
    override fun onCreateViewHolder(parent: ViewGroup): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_text, parent, false)
        return TextViewHolder(view)
    }
    
    override fun onBindViewHolder(item: Item, viewHolder: ViewHolder, payloads: List<Any>) {
        if (item is Item.TextItem) {
            (viewHolder as TextViewHolder).bind(item.text)
        }
    }
}
```

### 7.3 可拖拽排序 Adapter

```kotlin
/**
 * 支持拖拽排序的 Adapter
 */
class DragSortAdapter : RecyclerView.Adapter<ViewHolder>(), 
                        ItemTouchHelper.SimpleCallback {
    
    private val dataList = mutableListOf<Data>()
    private val itemTouchHelper = ItemTouchHelper(this)
    
    init {
        // 设置 ItemTouchHelper
        // recyclerView.itemTouchHelper = itemTouchHelper
    }
    
    override fun isLongPressDragEnabled(): Boolean = true
    override fun isItemViewTypeSelectable(viewType: Int): Boolean = true
    
    override fun getMovementFlags(
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder
    ): Int {
        val dragFlags = ItemTouchHelper.UP or ItemTouchHelper.DOWN or 
                        ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT
        val swipeFlags = ItemTouchHelper.START or ItemTouchHelper.END
        
        return makeMovementFlags(dragFlags, swipeFlags)
    }
    
    override fun onMove(
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder,
        target: RecyclerView.ViewHolder
    ): Boolean {
        // 处理移动
        val fromPosition = viewHolder.adapterPosition
        val toPosition = target.adapterPosition
        
        val item = dataList.removeAt(fromPosition)
        dataList.add(toPosition, item)
        
        notifyItemMoved(fromPosition, toPosition)
        return true
    }
    
    override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
        // 处理滑动删除
        val position = viewHolder.adapterPosition
        dataList.removeAt(position)
        notifyItemRemoved(position)
    }
    
    // 其他 Adapter 方法...
}
```

### 7.4 嵌套 RecyclerView

```kotlin
/**
 * 嵌套 RecyclerView 的 Adapter
 */
class ParentAdapter : RecyclerView.Adapter<ParentViewHolder>() {
    
    data class ParentItem(
        val title: String,
        val children: List<ChildItem>
    )
    
    data class ChildItem(val name: String)
    
    private val parentList = mutableListOf<ParentItem>()
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ParentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_parent, parent, false)
        return ParentViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ParentViewHolder, position: Int) {
        val item = parentList[position]
        
        holder.title.text = item.title
        
        // 设置子 RecyclerView
        val childAdapter = ChildAdapter(item.children)
        holder.childRecyclerView.apply {
            layoutManager = LinearLayoutManager(holder.itemView.context)
            adapter = childAdapter
        }
    }
    
    override fun getItemCount(): Int = parentList.size
}

class ParentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val title: TextView = itemView.findViewById(R.id.title)
    val childRecyclerView: RecyclerView = itemView.findViewById(R.id.child_recycler)
}
```

### 7.5 头部和底部 View

```kotlin
/**
 * 支持 Header 和 Footer 的 Adapter
 */
class HeaderFooterAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        const val TYPE_HEADER = 0
        const val TYPE_ITEM = 1
        const val TYPE_FOOTER = 2
    }
    
    private var headerView: View? = null
    private var footerView: View? = null
    private val items = mutableListOf<Item>()
    
    fun setHeaderView(view: View) {
        headerView = view
        notifyDataSetChanged()
    }
    
    fun setFooterView(view: View) {
        footerView = view
        notifyDataSetChanged()
    }
    
    override fun getItemViewType(position: Int): Int {
        if (headerView != null && position == 0) return TYPE_HEADER
        if (footerView != null && position == itemCount - 1) return TYPE_FOOTER
        return TYPE_ITEM
    }
    
    override fun getItemCount(): Int {
        var count = items.size
        if (headerView != null) count++
        if (footerView != null) count++
        return count
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_HEADER -> HeaderViewHolder(headerView!!)
            TYPE_FOOTER -> FooterViewHolder(footerView!!)
            else -> ItemViewHolder(inflateItemView(parent))
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        if (headerView != null && position == 0) return
        if (footerView != null && position == itemCount - 1) return
        
        val itemPosition = getRealItemPosition(position)
        if (holder is ItemViewHolder) {
            holder.bind(items[itemPosition])
        }
    }
    
    private fun getRealItemPosition(position: Int): Int {
        var realPosition = position
        if (headerView != null) realPosition--
        return realPosition
    }
    
    private fun inflateItemView(parent: ViewGroup): View {
        return LayoutInflater.from(parent.context)
            .inflate(R.layout.item_layout, parent, false)
    }
}
```

### 7.6 空数据和加载状态处理

```kotlin
/**
 * 统一处理 Empty、Loading、Error 状态
 */
class StateAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    sealed class State {
        object Loading : State()
        object Empty : State()
        data class Error(val message: String) : State()
        data class Success(val data: List<Item>) : State()
    }
    
    private var state: State = State.Loading
    
    fun setState(newState: State) {
        this.state = newState
        notifyDataSetChanged()
    }
    
    override fun getItemViewType(position: Int): Int {
        return when (state) {
            is State.Loading -> TYPE_LOADING
            is State.Empty -> TYPE_EMPTY
            is State.Error -> TYPE_ERROR
            is State.Success -> when (position) {
                0 -> TYPE_HEADER
                else -> TYPE_ITEM
            }
        }
    }
    
    override fun getItemCount(): Int {
        return when (state) {
            is State.Loading -> 1
            is State.Empty -> 1
            is State.Error -> 1
            is State.Success -> (state as State.Success).data.size + 1
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_LOADING -> LoadingViewHolder(inflate(parent, R.layout.item_loading))
            TYPE_EMPTY -> EmptyViewHolder(inflate(parent, R.layout.item_empty))
            TYPE_ERROR -> ErrorViewHolder(inflate(parent, R.layout.item_error))
            TYPE_HEADER -> HeaderViewHolder(inflate(parent, R.layout.item_header))
            else -> ItemViewHolder(inflate(parent, R.layout.item_content))
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (state) {
            is State.Error -> {
                if (holder is ErrorViewHolder) {
                    holder.bind((state as State.Error).message)
                }
            }
            is State.Success -> {
                if (position == 0 && holder is HeaderViewHolder) {
                    holder.bind()
                } else {
                    val item = (state as State.Success).data[position - 1]
                    if (holder is ItemViewHolder) {
                        holder.bind(item)
                    }
                }
            }
            else -> {}
        }
    }
}
```

---

## 8. 性能优化最佳实践

### 8.1 布局优化

```kotlin
// ✅ 使用 ConstraintLayout 减少视图层级
<androidx.constraintlayout.widget.ConstraintLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content">
    
    <ImageView
        android:id="@+id/image"
        android:layout_width="60dp"
        android:layout_height="60dp"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />
    
    <TextView
        android:id="@+id/title"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        app:layout_constraintStart_toEndOf="@id/image"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintTop_toTopOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>

// ❌ 避免嵌套过多的 LinearLayout
<LinearLayout>
    <LinearLayout>
        <LinearLayout>
            <TextView />
        </LinearLayout>
    </LinearLayout>
</LinearLayout>
```

### 8.2 图片加载优化

```kotlin
class ImageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val imageView: ImageView = itemView.findViewById(R.id.image)
    private var currentImageUrl: String? = null
    
    fun bind(item: Item) {
        // ✅ 取消之前的加载任务
        Glide.with(itemView.context)
            .load(item.imageUrl)
            .placeholder(R.drawable.placeholder)
            .error(R.drawable.error)
            .centerCrop()
            .into(imageView)
        
        currentImageUrl = item.imageUrl
    }
    
    // ✅ 在 onViewRecycled 中取消加载
    override fun onViewRecycled() {
        super.onViewRecycled()
        Glide.with(itemView.context).clear(imageView)
    }
}
```

### 8.3 避免在 onBindViewHolder 中创建对象

```kotlin
// ❌ 避免：每次绑定都创建新对象
override fun onBindViewHolder(holder: ViewHolder, position: Int) {
    val layoutParams = TextView.LayoutParams(...)  // 每次都创建
    holder.text.text = dataList[position]
}

// ✅ 推荐：复用对象
class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val layoutParams = TextView.LayoutParams(...)  // 只创建一次
    
    fun bind(data: String) {
        // 复用 layoutParams
    }
}
```

### 8.4 使用 setHasStableIds

```kotlin
// ✅ 提高滚动性能
override fun hasStableIds(): Boolean = true

override fun getItemId(position: Int): Long {
    return dataList[position].id  // 返回稳定的 ID
}
```

### 8.5 预测量和缓存

```kotlin
// ✅ 对于固定高度的 Item，可以设置 prefersFixedSize
recyclerView.apply {
    layoutManager = object : LinearLayoutManager(context) {
        override fun prefersRecyclerScrap() = true
    }
}
```

### 8.6 分批加载

```kotlin
// ✅ 大数据集分批加载
fun submitLargeList(data: List<Item>) {
    val batchSize = 100
    var startIndex = 0
    
    val handler = Handler(Looper.getMainLooper())
    val runnable = object : Runnable {
        override fun run() {
            if (startIndex < data.size) {
                val endIndex = minOf(startIndex + batchSize, data.size)
                val batch = data.subList(startIndex, endIndex)
                
                val start = dataList.size
                dataList.addAll(batch)
                notifyItemRangeInserted(start, batch.size)
                
                startIndex = endIndex
                handler.postDelayed(this, 16)  // 每帧加载一批
            }
        }
    }
    
    handler.post(runnable)
}
```

---

## 9. 面试考点汇总

### 9.1 基础概念题

#### Q1: 什么是 Adapter 模式？它在 Android 中有什么作用？

**考点：**
- 设计模式理解
- 解耦思想

**参考答案：**

Adapter 模式是一种结构型设计模式，用于将两个不兼容的接口转换为兼容的接口。在 Android 中：

1. **核心作用**：桥接数据源和视图组件，实现数据与 UI 的解耦
2. **数据转换**：将 List、Array 等数据结构转换为 View
3. **复用机制**：通过 ViewHolder 实现 View 复用，提升性能
4. **统一接口**：提供标准的更新通知方法

#### Q2: RecyclerView 相比 ListView 有什么优势？

**考点：**
- 组件对比
- 性能优化理解

**参考答案：**

| 对比项 | ListView | RecyclerView |
|--------|----------|--------------|
| 布局管理 | 内置 | 分离（LayoutManager） |
| 视图复用 | 基础 | 优化（两级缓存） |
| 动画支持 | 弱 | 强（ItemAnimator） |
| 装饰支持 | 无 | 支持（ItemDecoration） |
| 扩展性 | 差 | 好 |
| 多类型支持 | 一般 | 优秀 |

核心优势：
1. **职责分离**：LayoutManager、Adapter、Decoration 各司其职
2. **性能优化**：更智能的 View 复用机制
3. **灵活性**：轻松实现瀑布流、网格等复杂布局
4. **动画支持**：内置插入、删除、移动动画

### 9.2 ViewHolder 相关

#### Q3: ViewHolder 模式的作用是什么？

**考点：**
- 性能优化
- View 查找机制

**参考答案：**

ViewHolder 模式的核心作用是**缓存 View 引用，避免频繁的 findViewById 调用**：

1. **性能提升**：findViewById 是耗操作，ViewHolder 将其从 O(n*m) 降为 O(n)
2. **代码整洁**：将 View 引用封装，绑定逻辑更清晰
3. **支持状态**：可以在 ViewHolder 中缓存 Item 的状态

#### Q4: RecyclerView 的 View 复用机制是怎样的？

**考点：**
- RecyclerView 源码理解
- 缓存机制

**参考答案：**

RecyclerView 使用两级缓存机制：

```
一级缓存（onScreen）: 当前屏幕上显示的 ViewHolder
     ↓
二级缓存（mCachedScrap）: 刚刚滑出屏幕的 ViewHolder（最多 5 个）
     ↓
回收池（RecycledViewPool）: 
  ├─ mScrap: 临时缓存（正在交互动画的 ViewHolder）
  └─ mCacheViews: 按类型分类的回收池（默认每类 2 个）
     ↓
创建新 View（onCreateViewHolder）
```

复用流程：
1. 滚动时，滑出的 ViewHolder 放入回收池
2. 需要新 View 时，优先从回收池获取
3. 回收池没有则 inflate 新布局

### 9.3 数据更新相关

#### Q5: notifyDataSetChanged() 和 notifyItemChanged() 有什么区别？

**考点：**
- 更新机制
- 性能差异

**参考答案：**

| 特性 | notifyDataSetChanged() | notifyItemChanged() |
|------|----------------------|---------------------|
| 更新范围 | 整个数据集 | 单个 Item |
| 性能 | 低（全部重建） | 高（只更新变化） |
| 动画 | 不支持 | 支持 |
| 滚动位置 | 可能丢失 | 保持 |
| 适用场景 | 数据完全变化 | 局部更新 |

**最佳实践：**
- 优先使用细粒度通知方法
- 配合 DiffUtil 实现智能更新

#### Q6: 如何使用 DiffUtil 优化列表更新？

**考点：**
- DiffUtil 使用
- 算法理解

**参考答案：**

DiffUtil 基于 Myers 算法，计算两个数据集的最小编辑脚本：

```kotlin
val callback = object : DiffUtil.Callback() {
    override fun getOldListSize() = oldList.size
    override fun getNewListSize() = newList.size
    
    override fun areItemsTheSame(oldPos: Int, newPos: Int): Boolean {
        return oldList[oldPos].id == newList[newPos].id
    }
    
    override fun areContentsTheSame(oldPos: Int, newPos: Int): Boolean {
        return oldList[oldPos] == newList[newPos]
    }
}

val result = DiffUtil.calculateDiff(callback)
result.dispatchUpdatesTo(adapter)
```

**关键点：**
1. `areItemsTheSame`: 比较 ID（相同 ID 表示同一项）
2. `areContentsTheSame`: 比较内容（内容不同则需要更新 UI）
3. `getChangePayload`: 返回变化的字段（用于增量更新）

### 9.4 高级问题

#### Q7: 如何实现一个支持多种 Item 类型的 Adapter？

**考点：**
- 多类型处理
- 设计模式

**参考答案：**

```kotlin
class MultiTypeAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        const val TYPE_TEXT = 1
        const val TYPE_IMAGE = 2
    }
    
    data class Item(val type: Int, val data: Any)
    
    override fun getItemViewType(position: Int): Int {
        return items[position].type
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_TEXT -> TextViewHolder.inflate(parent)
            TYPE_IMAGE -> ImageViewHolder.inflate(parent)
            else -> throw IllegalArgumentException()
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = items[position]
        when (val viewType = item.type) {
            TYPE_TEXT -> (holder as TextViewHolder).bind(item.data as TextData)
            TYPE_IMAGE -> (holder as ImageViewHolder).bind(item.data as ImageData)
        }
    }
}
```

#### Q8: RecyclerView 的 Item 出现抖动或闪烁怎么解决？

**考点：**
- 问题排查
- 性能优化

**参考答案：**

**可能原因和解决方案：**

1. **没有使用稳定 ID**
   ```kotlin
   override fun hasStableIds(): Boolean = true
   override fun getItemId(position: Int): Long = dataList[position].id
   ```

2. **使用了 notifyDataSetChanged()**
   ```kotlin
   // 改用 DiffUtil
   val result = DiffUtil.calculateDiff(callback)
   result.dispatchUpdatesTo(this)
   ```

3. **ViewHolder 中 View 初始化不当**
   ```kotlin
   // 在 bind 方法中设置默认值
   fun bind(item: Data) {
       textView.text = item.name ?: ""
       imageView.visibility = if (item.hasImage) View.VISIBLE else View.GONE
   }
   ```

4. **图片加载未取消**
   ```kotlin
   override fun onViewRecycled() {
       super.onViewRecycled()
       Glide.with(itemView.context).clear(imageView)
   }
   ```

### 9.5 手撕代码题

#### Q9: 实现一个支持上拉加载的 Adapter

```kotlin
class LoadMoreAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        const val TYPE_ITEM = 1
        const val TYPE_LOADING = 2
    }
    
    private val items = mutableListOf<Item>()
    private var isLoadingMore = false
    private var isLoadMoreFinished = false
    
    fun submitList(newItems: List<Item>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }
    
    fun addMore(newItems: List<Item>) {
        isLoadingMore = false
        val start = items.size
        items.addAll(newItems)
        notifyItemRangeInserted(start, newItems.size)
        
        if (newItems.isEmpty()) {
            isLoadMoreFinished = true
        }
    }
    
    fun showLoadingMore() {
        isLoadingMore = true
        if (!isLoadMoreFinished && items.isNotEmpty()) {
            notifyItemInserted(items.size)
        }
    }
    
    override fun getItemViewType(position: Int): Int {
        if (isLoadingMore && position == items.size) {
            return TYPE_LOADING
        }
        return TYPE_ITEM
    }
    
    override fun getItemCount(): Int {
        var count = items.size
        if (isLoadingMore && !isLoadMoreFinished) count++
        return count
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_LOADING -> LoadingViewHolder.inflate(parent)
            else -> ItemViewHolder.inflate(parent)
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val viewType = getItemViewType(position)) {
            TYPE_LOADING -> {
                if (holder is LoadingViewHolder) holder.bind()
            }
            TYPE_ITEM -> {
                val item = items[position]
                if (holder is ItemViewHolder) holder.bind(item)
            }
        }
    }
}
```

#### Q10: 实现一个支持下拉刷新的 Adapter

```kotlin
class RefreshAdapter : RecyclerView.Adapter<ViewHolder>() {
    
    private val items = mutableListOf<Item>()
    private var isRefreshing = false
    
    fun startRefresh() {
        isRefreshing = true
        notifyDataSetChanged()
    }
    
    fun finishRefresh(newItems: List<Item>) {
        isRefreshing = false
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }
    
    override fun getItemCount(): Int {
        return if (isRefreshing) 1 else items.size
    }
    
    override fun getItemViewType(position: Int): Int {
        return if (isRefreshing && position == 0) TYPE_REFRESH else TYPE_ITEM
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_REFRESH -> RefreshViewHolder.inflate(parent)
            else -> ItemViewHolder.inflate(parent)
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        if (isRefreshing && position == 0) {
            if (holder is RefreshViewHolder) holder.bind()
        } else {
            val item = if (isRefreshing) position - 1 else position
            if (holder is ItemViewHolder && item < items.size) {
                holder.bind(items[item])
            }
        }
    }
}
```

---

## 总结

### 核心知识点回顾

1. **Adapter 设计模式**
   - 桥接数据与视图
   - 实现解耦和复用

2. **RecyclerView.Adapter**
   - 强制 ViewHolder 模式
   - 支持多种 ViewType
   - 细粒度更新通知

3. **ViewHolder 模式**
   - 缓存 View 引用
   - 提升性能
   - 封装绑定逻辑

4. **数据更新机制**
   - 避免 notifyDataSetChanged()
   - 使用细粒度通知
   - 配合 Payload 增量更新

5. **DiffUtil**
   - 高效计算差异
   - 支持动画
   - 保持滚动位置

### 最佳实践清单

- ✅ 使用 ListAdapter 简化 DiffUtil 使用
- ✅ 实现 hasStableIds() 提升性能
- ✅ 使用 ConstraintLayout 减少层级
- ✅ 在 onViewRecycled 中清理资源
- ✅ 分批加载大数据集
- ✅ 使用 ItemDecoration 优化分隔线
- ✅ 共享 RecycledViewPool

### 面试准备建议

1. **理解原理**：掌握 Adapter 模式的核心思想
2. **熟悉源码**：了解 RecyclerView 的工作机制
3. **实践经验**：有处理复杂列表的经验
4. **性能优化**：知道常见问题的解决方案
5. **代码能力**：能手写常用 Adapter 类型

---

**参考链接：**
- [Android 官方 RecyclerView 文档](https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView)
- [DiffUtil 源码分析](https://android.googlesource.com/platform/frameworks/support/+/master/recyclerview/src/androidx/recyclerview/widget/DiffUtil.java)
- [RecyclerView 性能优化](https://developer.android.com/topic/performance/improving-scroll-performance)
