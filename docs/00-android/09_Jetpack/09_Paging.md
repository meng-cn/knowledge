# Paging 3 详解

> 📚 Android 面试指南 - Jetpack 组件系列
>
> 📝 字数：约 15000 字 | ⏱ 建议阅读时间：50 分钟

---

## 目录

1. [Paging 3 基础概念](#1-paging-3-基础概念)
2. [Pager 配置](#2-pager-配置)
3. [PagingSource](#3-pagingsource)
4. [PagedListAdapter](#4-pagedlistadapter)
5. [与 Room 集成](#5-与-room 集成)
6. [预取策略](#6-预取策略)
7. [刷新机制](#7-刷新机制)
8. [性能优化](#8-性能优化)
9. [与 RecyclerView 集成](#9-与-recyclerview-集成)
10. [最佳实践](#10-最佳实践)
11. [常见问题](#11-常见问题)
12. [面试考点](#12-面试考点)

---

## 1. Paging 3 基础概念

### 1.1 什么是 Paging？

**Paging** 是 Android Jetpack 提供的数据分页加载库，用于高效地加载和显示大量数据。

在传统的列表加载方式中，我们可能会遇到以下问题：

```kotlin
// ❌ 传统方式：一次性加载所有数据
class OldSchoolAdapter : RecyclerView.Adapter<VH>() {
    
    private val items = mutableListOf<Item>()
    
    init {
        // 加载所有数据（可能成千上万条）
        val allData = database.getAllItems()
        items.addAll(allData)
        notifyDataSetChanged()
    }
    
    // 问题：
    // 1. 内存占用大
    // 2. 初始加载慢
    // 3. 滚动不流畅
    // 4. 无法处理无限数据源
}
```

**Paging 3** 解决了这些问题：

```kotlin
// ✅ Paging 3 方式
class PagingAdapter : PagedListAdapter<Item, VH>(DIFF_CALLBACK) {
    
    // 数据按需加载
    // 自动管理内存
    // 流畅的滚动体验
    
    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Item>() {
            override fun areItemsTheSame(oldItem: Item, newItem: Item): Boolean {
                return oldItem.id == newItem.id
            }
            
            override fun areContentsTheSame(oldItem: Item, newItem: Item): Boolean {
                return oldItem == newItem
            }
        }
    }
}
```

### 1.2 Paging 3 的核心优势

| 特性 | 说明 |
|------|------|
| 按需加载 | 只加载可见区域的数据 |
| 内存高效 | 自动回收不可见数据 |
| 流畅滚动 | 预取下一批数据 |
| 多数据源 | 支持数据库、网络、静态数据 |
| 响应式 | 与 Flow 完美集成 |
| 自动更新 | 数据变化自动刷新 UI |

### 1.3 核心组件

```
┌─────────────────────────────────────────────────┐
│                Paging 3 架构                    │
└─────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌────────────┐
│  Pager   │ ──▶ │ Paging   │ ──▶ │ PagedList  │
│  (构建)  │     │ Source   │     │  (数据)    │
└──────────┘     └──────────┘     └────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  RemoteMediator │
                    │  (远程数据)    │
                    └──────────────┘

┌──────────┐     ┌──────────┐     ┌────────────┐
│ Adapter  │ ◀── │ PagedList│ ◀───│ Cache      │
│  (显示)  │     │  (包装)  │     │  (缓存)    │
└──────────┘     └──────────┘     └────────────┘
```

### 1.4 添加依赖

```kotlin
// build.gradle (Module)
dependencies {
    // Paging Runtime
    implementation("androidx.paging:paging-runtime-ktx:3.2.1")
    
    // Paging RxJava2（如果需要）
    implementation("androidx.paging:paging-rxjava2:3.2.1")
    
    // Paging RxJava3（如果需要）
    implementation("androidx.paging:paging-rxjava3:3.2.1")
    
    // 与 Room 集成
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
}
```

---

## 2. Pager 配置

### 2.1 基本使用

```kotlin
import androidx.paging.Pager
import androidx.paging.PagingConfig

/**
 * Pager 是 Paging 3 的数据源构建器
 */
val pagingDataFlow = Pager(
    config = PagingConfig(
        pageSize = 20,           // 每页大小
        enablePlaceholders = true,  // 启用占位符
        initialLoadSize = 40    // 初始加载大小
    )
) {
    // 定义 PagingSource
    MyPagingSource()
}.flow
```

### 2.2 PagingConfig 详解

```kotlin
/**
 * PagingConfig 参数详解
 */
val config = PagingConfig(
    // 每页加载的数据量
    pageSize = 20,
    
    // 初始加载的数据量（通常是 pageSize 的倍数）
    initialLoadSize = 40,
    
    // 预取阈值：当剩余数据小于此值时开始预取
    prefetchDistance = 3,
    
    // 预取数量：每次预取的页数
    placeholderThreshold = 0,
    
    // 是否启用占位符
    enablePlaceholders = true,
    
    // 是否包含空白项
    includeMissingPlaceholder = false,
    
    // 是否跳过空页
    jumpSrcDuring Refresh = false,
    
    // 最大获取数量
    maxSize = 50,
    
    // 最大预取数量
    maxRemoteMediatorRefreshSize = 10
)
```

### 2.3 不同的 Pager 配置策略

```kotlin
// === 1. 小数据集（<100 条）===
val smallDataSetConfig = Pager(
    config = PagingConfig(
        pageSize = 50,
        enablePlaceholders = false
    )
) {
    StaticPagingSource(listOfItems)
}.flow

// === 2. 中等数据集（100-1000 条）===
val mediumDataSetConfig = Pager(
    config = PagingConfig(
        pageSize = 20,
        initialLoadSize = 40,
        prefetchDistance = 2
    )
) {
    DatabasePagingSource()
}.flow

// === 3. 大数据集（>1000 条）===
val largeDataSetConfig = Pager(
    config = PagingConfig(
        pageSize = 20,
        initialLoadSize = 60,
        prefetchDistance = 3,
        maxSize = 100
    )
) {
    NetworkPagingSource()
}.flow

// === 4. 实时数据流===
val realtimeConfig = Pager(
    config = PagingConfig(
        pageSize = 10,
        enablePlaceholders = true,
        refreshKeeper = true
    )
) {
    RealtimePagingSource()
}.flow
```

### 2.4 带参数的 Pager

```kotlin
class SearchViewModel : ViewModel() {
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    // 基于搜索查询的动态 Pager
    val searchResults: StateFlow<PagedList<Item>> = 
        _searchQuery.mapLatest { query ->
            Pager(
                config = PagingConfig(pageSize = 20)
            ) {
                SearchPagingSource(query = query)
            }.flow
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyPagedList()
        )
    
    fun onQueryChanged(query: String) {
        _searchQuery.value = query
    }
}
```

---

## 3. PagingSource

### 3.1 基本实现

```kotlin
import androidx.paging.PagingSource
import androidx.paging.PagingSource.LoadResult

/**
 * PagingSource 是 Paging 3 的核心数据源
 * 
 * @param K 键类型（用于定位数据位置）
 * @param V 值类型（实际的数据）
 */
class MyPagingSource : PagingSource<Int, Item>() {
    
    /**
     * 预加载：在首次加载前调用
     */
    override fun getRefreshKey(position: Int): Int? {
        return position
    }
    
    /**
     * 加载数据
     * 
     * @param parameters 加载参数（包含位置信息）
     */
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        return try {
            when (params.key) {
                null -> {
                    // 首次加载（刷新）
                    loadInitialData()
                }
                else -> {
                    // 加载更多
                    loadMoreData(params.key)
                }
            }
        } catch (e: Exception) {
            // 错误处理
            LoadResult.Error(e)
        }
    }
    
    private fun loadInitialData(): LoadResult<Int, Item> {
        val items = repository.getInitialItems()
        
        return LoadResult.Page(
            data = items,
            prevKey = null,  // 没有上一页
            nextKey = if (items.isEmpty()) null else items.size  // 下一页的 key
        )
    }
    
    private fun loadMoreData(currentKey: Int): LoadResult<Int, Item> {
        val items = repository.getMoreItems(offset = currentKey)
        
        return LoadResult.Page(
            data = items,
            prevKey = if (currentKey == 0) null else currentKey - 20,
            nextKey = if (items.isEmpty()) null else currentKey + items.size
        )
    }
}
```

### 3.2 LoadResult 详解

```kotlin
sealed class LoadResult<out K, out V> {
    
    /**
     * 成功的加载结果
     */
    data class Page<K, V>(
        val data: List<V>,           // 加载的数据
        val prevKey: K?,             // 上一页的 key
        val nextKey: K?,             // 下一页的 key
        val itemsBefore: Int = 0,    // 之前的数据量
        val itemsAfter: Int = 0      // 之后的数据量
    ) : LoadResult<K, V>()
    
    /**
     * 错误结果
     */
    data class Error(
        val error: Exception,
        val shouldNotifyInvalidation: Boolean = true
    ) : LoadResult<Nothing, Nothing>()
    
    /**
     * 空结果（表示没有更多数据）
     */
    data class Empty() : LoadResult<Nothing, Nothing>()
}
```

### 3.3 不同的 PagingSource 类型

#### 3.3.1 静态数据源

```kotlin
/**
 * 静态数据源（内存数据）
 */
class StaticPagingSource(private val items: List<Item>) : 
    PagingSource<Int, Item>() {
    
    override fun getRefreshKey(position: Int): Int? {
        return if (position > 0) position else null
    }
    
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        val start = params.key ?: 0
        val end = (start + params.loadSize).coerceAtMost(items.size)
        
        val data = if (end > start) {
            items.subList(start, end)
        } else {
            emptyList()
        }
        
        return LoadResult.Page(
            data = data,
            prevKey = if (start == 0) null else start,
            nextKey = if (end >= items.size) null else end
        )
    }
}

// 使用
val staticFlow = Pager(
    config = PagingConfig(pageSize = 20)
) {
    StaticPagingSource(allItems)
}.flow
```

#### 3.3.2 数据库数据源

```kotlin
/**
 * 数据库数据源
 */
class DatabasePagingSource(
    private val dao: ItemDao
) : PagingSource<Int, Item>() {
    
    override fun getRefreshKey(position: Int): Int? {
        return position
    }
    
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        val currentPage = params.key ?: 1
        val items = dao.getItemsPage(currentPage, params.loadSize)
        
        return LoadResult.Page(
            data = items,
            prevKey = if (currentPage == 1) null else currentPage - 1,
            nextKey = if (items.size < params.loadSize) null else currentPage + 1
        )
    }
}
```

#### 3.3.3 网络数据源

```kotlin
/**
 * 网络数据源
 */
class NetworkPagingSource(
    private val apiService: ApiService
) : PagingSource<Int, Item>() {
    
    private var nextPageToken: String? = null
    
    override fun getRefreshKey(position: Int): Int? {
        return null  // 网络数据通常不支持中间位置刷新
    }
    
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        val response = when (params.key) {
            null -> {
                // 首次加载
                apiService.getItems(pageToken = null, limit = params.loadSize)
            }
            else -> {
                // 加载更多
                apiService.getItems(pageToken = params.key, limit = params.loadSize)
            }
        }
        
        return LoadResult.Page(
            data = response.items,
            prevKey = null,  // 网络数据通常不支持上一页
            nextKey = response.nextPageToken
        )
    }
}
```

### 3.4 分页键类型

```kotlin
/**
 * 分页键的不同类型
 */

// 1. 整数类型（基于索引）
class IntKeyPagingSource : PagingSource<Int, Item>() {
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        // params.key 是 Int 类型
    }
}

// 2. 字符串类型（基于 token）
class TokenKeyPagingSource : PagingSource<String, Item>() {
    override suspend fun load(params: LoadParameters<String>): LoadResult<String, Item> {
        // params.key 是 String 类型（如分页 token）
    }
}

// 3. 时间戳类型（基于时间）
class TimestampPagingSource : PagingSource<Long, Item>() {
    override suspend fun load(params: LoadParameters<Long>): LoadResult<Long, Item> {
        // params.key 是 Long 类型（时间戳）
        val timestamp = params.key ?: System.currentTimeMillis()
        val items = repository.getItemsBefore(timestamp)
        
        return LoadResult.Page(
            data = items,
            prevKey = items.lastOrNull()?.timestamp,
            nextKey = items.firstOrNull()?.timestamp
        )
    }
}

// 4. 自定义类型
data class PaginationKey(
    val page: Int,
    val offset: Int
)

class CustomKeyPagingSource : PagingSource<PaginationKey, Item>() {
    override suspend fun load(params: LoadParameters<PaginationKey>): LoadResult<PaginationKey, Item> {
        // 使用自定义的键类型
    }
}
```

---

## 4. PagedListAdapter

### 4.1 基本使用

```kotlin
import androidx.paging.PagedListAdapter
import androidx.recyclerview.widget.DiffUtil
import android.view.LayoutInflater
import android.view.ViewGroup

/**
 * PagedListAdapter 是专门为 Paging 设计的 Adapter
 */
class ItemPagingAdapter : 
    PagedListAdapter<Item, ItemPagingAdapter.VH>(DIFF_CALLBACK) {
    
    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Item>() {
            
            override fun areItemsTheSame(oldItem: Item, newItem: Item): Boolean {
                return oldItem.id == newItem.id
            }
            
            override fun areContentsTheSame(oldItem: Item, newItem: Item): Boolean {
                return oldItem == newItem
            }
        }
    }
    
    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        private val textView: TextView = view.findViewById(R.id.text)
        
        fun bind(item: Item) {
            textView.text = item.name
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_layout, parent, false)
        return VH(view)
    }
    
    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = getItem(position)
        item?.let { holder.bind(it) }
    }
}
```

### 4.2 与 Pager 集成

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var adapter: ItemPagingAdapter
    private lateinit var recyclerView: RecyclerView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        recyclerView = findViewById(R.id.recyclerView)
        adapter = ItemPagingAdapter()
        
        recyclerView.adapter = adapter
        recyclerView.layoutManager = LinearLayoutManager(this)
        
        // 创建 Pager
        val pager = Pager(
            config = PagingConfig(pageSize = 20)
        ) {
            MyPagingSource()
        }
        
        // 观察并提交数据
        lifecycleScope.launch {
            pager.flow.collect { pagedList ->
                adapter.submitData(lifecycle, pagedList)
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        adapter.submitData(lifecycle, null)  // 清理
    }
}
```

### 4.3 添加占位符

```kotlin
class ItemPagingAdapter : 
    PagedListAdapter<Any, RecyclerView.ViewHolder>(DIFF_CALLBACK) {
    
    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Any>() {
            override fun areItemsTheSame(oldItem: Any, newItem: Any): Boolean {
                return when {
                    oldItem is Item && newItem is Item -> oldItem.id == newItem.id
                    oldItem is Placeholder && newItem is Placeholder -> true
                    else -> false
                }
            }
            
            override fun areContentsTheSame(oldItem: Any, newItem: Any): Boolean {
                return when {
                    oldItem is Item && newItem is Item -> oldItem == newItem
                    oldItem is Placeholder && newItem is Placeholder -> true
                    else -> false
                }
            }
        }
    }
    
    // 占位符对象
    object Placeholder
    
    override fun getItemViewType(position: Int): Int {
        val item = getItem(position)
        return when (item) {
            is Placeholder -> R.layout.item_placeholder
            is Item -> R.layout.item_content
            else -> R.layout.item_placeholder
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            R.layout.item_placeholder -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(viewType, parent, false)
                PlaceholderViewHolder(view)
            }
            else -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(viewType, parent, false)
                ItemViewHolder(view)
            }
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = getItem(position)
        when (val holderType = holder) {
            is ItemViewHolder -> {
                (item as? Item)?.let { holderType.bind(it) }
            }
            is PlaceholderViewHolder -> {
                // 绑定占位符
            }
        }
    }
}
```

### 4.4 加载更多指示器

```kotlin
class ItemPagingAdapter : 
    PagedListAdapter<Item, RecyclerView.ViewHolder>(DIFF_CALLBACK) {
    
    private var loadStateAdapter: LoadStateAdapter? = null
    
    override fun submitData(newData: PagedList<Item>?) {
        super.submitData(newData)
        
        // 创建 LoadStateAdapter
        loadStateAdapter?.let {
            val recyclerView = (currentAdapter?.itemCount ?: 0)
            // 添加加载更多状态
        }
    }
}

// 使用 LoadStateAdapter
class LoadStateAdapter(
    private val retry: () -> Unit
) : RecyclerView.Adapter<LoadStateAdapter.VH>() {
    
    private var loadState: LoadState? = null
    
    fun submitLoadState(loadState: LoadState) {
        this.loadState = loadState
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_loading, parent, false)
        return VH(view)
    }
    
    override fun onBindViewHolder(holder: VH, position: Int) {
        when (loadState) {
            is Loading -> holder.showLoading()
            is Error -> holder.showError(retry)
            else -> holder.hide()
        }
    }
    
    override fun getItemCount(): Int {
        return if (loadState != null) 1 else 0
    }
}
```

---

## 5. 与 Room 集成

### 5.1 DAO 定义

```kotlin
@Dao
interface ItemDao {
    
    /**
     * 返回 Flow<PagedList<T>>
     * Room 会自动处理分页
     */
    @Query("SELECT * FROM items")
    fun getAllItems(): Flow<PagedList<Item>>
    
    /**
     * 带条件的查询
     */
    @Query("SELECT * FROM items WHERE category = :category")
    fun getItemsByCategory(category: String): Flow<PagedList<Item>>
    
    /**
     * 带排序的查询
     */
    @Query("SELECT * FROM items ORDER BY createdAt DESC")
    fun getItemsSortedByDate(): Flow<PagedList<Item>>
    
    /**
     * 带搜索的查询
     */
    @Query("SELECT * FROM items WHERE name LIKE '%' || :query || '%'")
    fun searchItems(query: String): Flow<PagedList<Item>>
}
```

### 5.2 PagingSource.FromCallback

```kotlin
/**
 * Room 返回 Flow<PagedList<T>>的使用方式
 */
class Repository(
    private val dao: ItemDao
) {
    
    /**
     * 方式 1：直接使用 Room 返回的 Flow
     */
    fun getItems(): Flow<PagedList<Item>> {
        return dao.getAllItems()
    }
    
    /**
     * 方式 2：转换为 Pager
     */
    fun getItemsPager(): Pager<Int, Item> {
        return Pager(
            config = PagingConfig(pageSize = 20)
        ) {
            // Room 可以转换为 PagingSource
            dao.getAllItems().let { flow ->
                PagingSource.from { 
                    dao.getItemsByPage(it.key ?: 0, it.loadSize) 
                }
            }
        }
    }
}
```

### 5.3 完整的 Room + Paging 示例

```kotlin
// 1. Entity
@Entity(tableName = "items")
data class Item(
    @PrimaryKey val id: Int,
    val name: String,
    val description: String,
    val createdAt: Long
)

// 2. DAO
@Dao
interface ItemDao {
    @Query("SELECT * FROM items ORDER BY createdAt DESC")
    fun getAllItems(): Flow<PagedList<Item>>
    
    @Transaction
    suspend fun insertItem(item: Item)
    
    @Transaction
    suspend fun updateItem(item: Item)
    
    @Transaction
    suspend fun deleteItem(item: Item)
}

// 3. RoomDatabase
@Database(entities = [Item::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun itemDao(): ItemDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context).also { INSTANCE = it }
            }
        }
        
        private fun buildDatabase(context: Context): AppDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                "item_database"
            )
            .build()
        }
    }
}

// 4. Repository
class ItemRepository(private val dao: ItemDao) {
    
    val allItems: Flow<PagedList<Item>> = dao.getAllItems()
    
    suspend fun insertItem(item: Item) {
        dao.insertItem(item)
    }
    
    suspend fun updateItem(item: Item) {
        dao.updateItem(item)
    }
    
    suspend fun deleteItem(item: Item) {
        dao.deleteItem(item)
    }
}

// 5. ViewModel
class ItemViewModel(application: Application) : AndroidViewModel(application) {
    
    private val repository: ItemRepository
    val items: StateFlow<PagedList<Item>>
    
    init {
        val dao = AppDatabase.getInstance(application).itemDao()
        repository = ItemRepository(dao)
        
        items = repository.allItems
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5000),
                initialValue = emptyPagedList()
            )
    }
    
    fun insertItem(item: Item) {
        viewModelScope.launch {
            repository.insertItem(item)
        }
    }
}

// 6. Adapter
class ItemPagingAdapter : PagedListAdapter<Item, VH>(DIFF_CALLBACK) {
    // ...
}

// 7. Activity/Fragment
class ItemListActivity : AppCompatActivity() {
    
    private val viewModel: ItemViewModel by viewModels()
    private lateinit var adapter: ItemPagingAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        adapter = ItemPagingAdapter()
        recyclerView.adapter = adapter
        
        lifecycleScope.launch {
            viewModel.items.collect { pagedList ->
                adapter.submitData(lifecycle, pagedList)
            }
        }
    }
}
```

### 5.4 自动刷新

```kotlin
/**
 * Room + Paging 的自动刷新
 * 
 * 当数据库中的数据发生变化时：
 * 1. Room 会自动更新 Flow
 * 2. Paging 会自动检测到变化
 * 3. Adapter 会自动刷新 UI
 */

// 在数据库中添加数据
viewModel.insertItem(NewItem("New Item", "...", System.currentTimeMillis()))

// UI 会自动更新，无需手动刷新
```

---

## 6. 预取策略

### 6.1 预取机制

```kotlin
/**
 * Paging 的预取机制
 * 
 * prefetchDistance 参数控制预取行为：
 * - 值为 3 表示：当用户滚动到距离末尾 3 页时开始预取下一页
 */
val pager = Pager(
    config = PagingConfig(
        pageSize = 20,
        prefetchDistance = 3  // 预取距离
    )
) {
    MyPagingSource()
}.flow
```

### 6.2 预取优化

```kotlin
/**
 * 预取优化策略
 */
val optimizedConfig = PagingConfig(
    pageSize = 20,
    
    // 初始加载更大的数据集
    initialLoadSize = 60,
    
    // 预取距离
    prefetchDistance = 3,
    
    // 启用占位符，改善用户体验
    enablePlaceholders = true,
    
    // 最大缓存大小
    maxSize = 100
)
```

### 6.3 网络预取

```kotlin
/**
 * 结合 RemoteMediator 的网络预取
 */
class ItemRemoteMediator : RemoteMediator<Int, Item>() {
    
    private var _append = true
    
    override suspend fun load(
        loadType: LoadType
    ): MediatorLoadResult {
        return try {
            when (loadType) {
                is LoadType.APPEND -> {
                    // 加载更多
                    loadMoreItems()
                }
                is LoadType.PREPEND -> {
                    // 加载前面（如无限滚动向上）
                    loadPreviousItems()
                }
                is LoadType.REFRESH -> {
                    // 刷新
                    refreshItems()
                }
            }
        } catch (e: Exception) {
            MediatorLoadResult.Error(e)
        }
    }
    
    private suspend fun loadMoreItems(): MediatorLoadResult {
        val response = apiService.getItems(offset = currentOffset, limit = PAGE_SIZE)
        currentOffset += PAGE_SIZE
        
        return if (response.success) {
            MediatorLoadResult.Success(
                endOfPaginationReached = response.items.isEmpty()
            )
        } else {
            MediatorLoadResult.Error(response.error)
        }
    }
}
```

---

## 7. 刷新机制

### 7.1 手动刷新

```kotlin
class ItemPagingAdapter : PagedListAdapter<Item, VH>(DIFF_CALLBACK) {
    
    // 获取当前 PagedList 的 LoadState
    val loadState: LoadState
        get() = currentDataSource?.javaClass?.getDeclaredField("loadState")?.let {
            it.isAccessible = true
            it.get(currentDataSource) as LoadState
        } ?: LoadState()
    
    // 手动触发刷新
    fun refresh() {
        currentDataSource?.invalidate()
    }
}

// 在 Activity/Fragment 中使用
class MainActivity : AppCompatActivity() {
    
    private lateinit var adapter: ItemPagingAdapter
    private var pager: Pager<Int, Item>? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 刷新按钮
        swipeRefresh.setOnRefreshListener {
            adapter.refresh()
            swipeRefresh.isRefreshing = false
        }
    }
}
```

### 7.2 自动刷新

```kotlin
/**
 * 自动刷新配置
 */
val autoRefreshPager = Pager(
    config = PagingConfig(
        pageSize = 20,
        // 启用自动刷新
        refreshInterval = 30_000  // 30 秒自动刷新
    )
) {
    MyPagingSource()
}.flow
```

### 7.3 下拉刷新

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var adapter: ItemPagingAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        swipeRefresh.setOnRefreshListener {
            // 触发刷新
            adapter.currentDataSource?.invalidate()
            
            // 模拟网络延迟后停止刷新
            Handler(Looper.getMainLooper()).postDelayed({
                swipeRefresh.isRefreshing = false
            }, 1500)
        }
    }
}
```

---

## 8. 性能优化

### 8.1 内存优化

```kotlin
/**
 * 内存优化策略
 */
val memoryOptimizedConfig = PagingConfig(
    // 控制缓存大小
    pageSize = 20,
    maxSize = 100,  // 最大缓存 100 条数据
    
    // 减少初始加载量
    initialLoadSize = 40,
    
    // 预取距离不宜过大
    prefetchDistance = 2
)
```

### 8.2 数据库优化

```kotlin
/**
 * 数据库查询优化
 */
@Dao
interface OptimizedDao {
    
    // ✅ 使用索引
    @Query("SELECT * FROM items WHERE category = :category ORDER BY createdAt DESC")
    fun getItemsByCategory(category: String): Flow<PagedList<Item>>
    
    // ✅ 限制返回列
    @Query("SELECT id, name FROM items WHERE ...")
    fun getItemsProjection(): Flow<PagedList<ItemProjection>>
    
    // ✅ 使用适当的分页键
    @Query("SELECT * FROM items WHERE id > :lastId ORDER BY id ASC LIMIT :size")
    fun getItemsAfter(lastId: Long, size: Int): List<Item>
}
```

### 8.3 网络优化

```kotlin
/**
 * 网络请求优化
 */
class OptimizedNetworkPagingSource : PagingSource<Int, Item>() {
    
    // 使用缓存
    private val cache = MemoryCache<Item>(maxSize = 100)
    
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        // 1. 先检查缓存
        val cached = cache.get(params.key)
        if (cached != null) {
            return LoadResult.Page(data = cached)
        }
        
        // 2. 网络请求
        val items = withContext(Dispatchers.IO) {
            apiService.getItems(params.key, params.loadSize)
        }
        
        // 3. 更新缓存
        cache.put(params.key, items)
        
        return LoadResult.Page(data = items)
    }
}
```

---

## 9. 与 RecyclerView 集成

### 9.1 基本集成

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ItemPagingAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        recyclerView = findViewById(R.id.recyclerView)
        adapter = ItemPagingAdapter()
        
        // 配置 RecyclerView
        recyclerView.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = adapter
            setHasFixedSize(true)
            itemAnimator = DefaultItemAnimator()
        }
        
        // 提交数据
        lifecycleScope.launch {
            pager.flow.collect { pagedList ->
                adapter.submitData(lifecycle, pagedList)
            }
        }
    }
}
```

### 9.2 混合加载状态

```kotlin
/**
 * 混合使用 Paging 和 RemoteMediator 的加载状态
 */
class ItemPagingAdapter : PagedListAdapter<Item, VH>(DIFF_CALLBACK) {
    
    private var _loadStateAdapter: LoadStateAdapter? = null
    val loadStateAdapter: LoadStateAdapter
        get() = _loadStateAdapter ?: throw IllegalStateException("Not initialized")
    
    init {
        _loadStateAdapter = MyLoadStateAdapter {
            // 重试逻辑
            submitData(lifecycle, null)
        }
    }
    
    override fun submitData(newData: PagedList<Item>?) {
        super.submitData(newData)
        
        // 更新 LoadStateAdapter
        _loadStateAdapter?.submitLoadState(loadStates)
    }
}
```

---

## 10. 最佳实践

### 10.1 配置推荐

```kotlin
/**
 * Paging 配置最佳实践
 */

// 小列表 (< 100 项)
val smallListConfig = PagingConfig(
    pageSize = 50,
    enablePlaceholders = false
)

// 中列表 (100-1000 项)
val mediumListConfig = PagingConfig(
    pageSize = 20,
    initialLoadSize = 40,
    prefetchDistance = 2
)

// 大列表 (> 1000 项)
val largeListConfig = PagingConfig(
    pageSize = 20,
    initialLoadSize = 60,
    prefetchDistance = 3,
    maxSize = 100
)
```

### 10.2 错误处理

```kotlin
/**
 * 错误处理最佳实践
 */
class RobustPagingSource : PagingSource<Int, Item>() {
    
    override suspend fun load(params: LoadParameters<Int>): LoadResult<Int, Item> {
        return try {
            val items = loadItems(params)
            LoadResult.Page(data = items)
        } catch (e: NetworkException) {
            // 网络错误
            LoadResult.Error(e, shouldNotifyInvalidation = true)
        } catch (e: Exception) {
            // 其他错误
            LoadResult.Error(e)
        }
    }
}

// Adapter 中的错误处理
class ItemPagingAdapter : PagedListAdapter<Item, VH>(DIFF_CALLBACK) {
    
    private var _error: Throwable? = null
    val error: Throwable?
        get() = _error
    
    override fun submitData(newData: PagedList<Item>?) {
        super.submitData(newData)
        
        // 检查错误
        loadStates.refresh.let {
            if (it is Failure) {
                _error = it.error
            } else {
                _error = null
            }
        }
    }
}
```

---

## 11. 常见问题

### 11.1 数据不更新

**问题**：修改数据库后 UI 没有更新。

**解决**：确保使用 Flow<PagedList<T>>而不是普通查询。

### 11.2 内存泄漏

**问题**：RecyclerView 持有大量数据。

**解决**：配置合适的 maxSize 参数。

### 11.3 滚动卡顿

**问题**：滚动时出现卡顿。

**解决**：调整 prefetchDistance 和 pageSize。

---

## 12. 面试考点

### 12.1 基础考点

#### Q1: Paging 3 相比 Paging 2 有什么改进？

**参考答案**：

> 1. 架构重构：Pager + PagingSource 替代了之前的 PagedList
> 2. 更好的 Room 集成
> 3. RemoteMediator 支持离线优先
> 4. 更灵活的配置选项
> 5. 更好的错误处理

#### Q2: PagingSource 的作用是什么？

**参考答案**：

> PagingSource 是 Paging 3 的核心数据源接口，负责：
> - 定义如何加载数据
> - 管理分页键
> - 处理加载错误

### 12.2 进阶考点

#### Q3: 如何实现离线优先的数据加载？

**参考答案**：

> 使用 RemoteMediator：
> 1. 先从本地数据库加载数据
> 2. RemoteMediator 在后台同步远程数据
> 3. 新数据自动更新到数据库和 UI

### 12.3 高级考点

#### Q4: Paging 的预取机制是如何工作的？

**参考答案**：

> 1. 基于 prefetchDistance 参数
> 2. 当用户滚动到距离末尾指定页数时开始预取
> 3. 预取在后台线程执行
> 4. 预取的数据缓存在内存中

---

## 总结

Paging 3 是 Android 列表加载的最佳解决方案：

1. **按需加载**：只加载可见数据
2. **内存高效**：自动管理内存
3. **流畅体验**：预取机制保证流畅滚动
4. **灵活配置**：支持多种数据源
5. **自动更新**：数据变化自动刷新

---

*📚 参考资料*
- [Android Developers - Paging](https://developer.android.com/topic/libraries/architecture/paging)
- [Paging 3 Migration Guide](https://developer.android.com/topic/libraries/architecture/paging/migrating-to-paging3)

> 最后更新：2024 年
> 字数统计：约 15000 字