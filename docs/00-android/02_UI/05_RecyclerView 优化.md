# 05_RecyclerView 优化详解

## 一、RecyclerView 基础

### 1.1 为什么使用 RecyclerView

在 Android 5.0 之前，ListView 是列表展示的标准组件。但是 ListView 存在以下问题：

| 问题 | 说明 |
|-----|----|
| 不支持布局嵌套 | 无法直接嵌套 ScrollView |
| 性能问题 | 复用机制不完善 |
| 扩展性差 | 无法自定义布局管理器 |
| 动画支持弱 | 没有内置动画支持 |

RecyclerView 是 Android 5.0 引入的新一代列表组件，解决了上述问题：

- **灵活性强：** 可通过 LayoutManager 自定义布局
- **性能优化：** 完善的 ViewHolder 复用机制
- **动画支持：** 内置 ItemAnimator 支持各种动画
- **缓存机制：** 多级缓存，高效复用

### 1.2 核心组件

```
RecyclerView 四大核心组件:
├── RecyclerView        - 容器
├── LayoutManager       - 布局管理器
├── Adapter             - 适配器
└── ViewHolder          - 视图持有者
```

### 1.3 基本使用

```xml
<!-- 布局文件 -->
<androidx.recyclerview.widget.RecyclerView
    android:id="@+id/recyclerView"
    android:layout_width="match_parent"
    android:layout_height="match_parent"/>
```

```java
// 初始化
RecyclerView recyclerView = findViewById(R.id.recyclerView);

// 设置布局管理器
LayoutManager layoutManager = new LinearLayoutManager(context);
recyclerView.setLayoutManager(layoutManager);

// 设置适配器
RecyclerView.Adapter adapter = new MyAdapter(dataList);
recyclerView.setAdapter(adapter);
```

---

## 二、ViewHolder 复用机制

### 2.1 ViewHolder 模式

ViewHolder 模式的核心思想是缓存 Item 的视图引用，避免重复调用 findViewById。

```java
// 传统 ListView 的 ViewHolder 模式
public class MyAdapter extends BaseAdapter {
    
    static class ViewHolder {
        TextView title;
        ImageView image;
    }
    
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;
        
        if (convertView == null) {
            convertView = LayoutInflater.from(context)
                    .inflate(R.layout.item_layout, parent, false);
            holder = new ViewHolder();
            holder.title = convertView.findViewById(R.id.title);
            holder.image = convertView.findViewById(R.id.image);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }
        
        // 设置数据
        holder.title.setText(list.get(position).getTitle());
        holder.image.setImageResource(list.get(position).getImage());
        
        return convertView;
    }
}
```

### 2.2 RecyclerView 的 ViewHolder

```java
public class MyAdapter extends RecyclerView.Adapter<MyAdapter.ViewHolder> {
    
    private List<Item> dataList;
    
    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView title;
        ImageView image;
        
        public ViewHolder(View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.title);
            image = itemView.findViewById(R.id.image);
        }
        
        public void bind(Item item) {
            title.setText(item.getTitle());
            image.setImageResource(item.getImage());
        }
    }
    
    public MyAdapter(List<Item> dataList) {
        this.dataList = dataList;
    }
    
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_layout, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        holder.bind(dataList.get(position));
    }
    
    @Override
    public int getItemCount() {
        return dataList.size();
    }
}
```

### 2.3 复用流程解析

```
1. 创建 ViewHolder 阶段
   └─→ onCreateViewHolder() - 创建新的 ViewHolder

2. 绑定数据阶段
   └─→ onBindViewHolder() - 复用 ViewHolder，绑定新数据

3. 视图回收阶段
   └─→ 滑出屏幕的 ViewHolder 放入缓存池
```

### 2.4 复用池原理

```java
// RecyclerView 内部持有三个缓存池
class RecyclerView {
    // 一级缓存：正在屏幕上的 ViewHolder
    final AttachedAdapter mAttachedAdapter;
    
    // 二级缓存：刚滑出屏幕的 ViewHolder
    final Scrapper mScrap;
    
    // 三级缓存：回收站 ViewHolder
    final ViewCache mRecycler;
}
```

**缓存层级：**

```
Level 1 Cache (onScreen)      - 屏幕上的 ViewHolder，不可复用
Level 2 Cache (Scrap)         - 刚滑出的 ViewHolder，可复用
Level 3 Cache (RecycledViewPool) - 回收站，全局共享
```

---

## 三、预取机制

### 3.1 预取（Prefetch）原理

预取是指在当前可见区域之外提前创建和绑定 ViewHolder，当用户滚动时可以直接显示，提升流畅度。

```java
// RecyclerView 预取配置
recyclerView.setItemViewCacheSize(20);  // 设置缓存数量
recyclerView.setRecycledViewPool(pool); // 设置回收池
```

### 3.2 预取数量设置

```java
// 根据屏幕大小动态设置预取数量
int screenHeight = getResources().getDisplayMetrics().heightPixels;
int itemHeight = 100; // 假设每个 Item 高度
int visibleItems = screenHeight / itemHeight;
int prefetchCount = visibleItems * 2; // 预取 2 倍数量

recyclerView.setItemViewCacheSize(prefetchCount);
```

### 3.3 StaggeredGridLayoutManager 预取

```java
public class PrefetchStaggeredGridLayoutManager 
        extends StaggeredGridLayoutManager {
    
    public PrefetchStaggeredGridLayoutManager(
            int spanCount, 
            int orientation,
            int reverseLayout) {
        super(spanCount, orientation, reverseLayout);
    }
    
    @Override
    public void onAttachedToWindow(RecyclerView recyclerView) {
        super.onAttachedToWindow(recyclerView);
        recyclerView.setItemViewCacheSize(20);
    }
}
```

### 3.4 预取优化策略

```java
// 策略 1：根据内容类型设置不同的缓存大小
recycledViewPool.setMaxRecycledViews(TYPE_IMAGE, 30);
recycledViewPool.setMaxRecycledViews(TYPE_TEXT, 10);

// 策略 2：使用 RecyclerView.RecycledViewPool 共享缓存
RecyclerView.RecycledViewPool pool = new RecyclerView.RecycledViewPool();
recyclerView1.setRecycledViewPool(pool);
recyclerView2.setRecycledViewPool(pool);
```

---

## 四、DiffUtil 高效更新

### 4.1 问题背景

传统的 notifyDataSetChanged() 会刷新整个列表，效率低下。

```java
// ❌ 低效：刷新整个列表
dataList.clear();
dataList.addAll(newData);
adapter.notifyDataSetChanged();

// ✅ 高效：只更新变化的部分
DiffUtil.DiffResult result = DiffUtil.calculateDiff(new MyDiffCallback(oldList, newList));
result.dispatchUpdatesTo(adapter);
```

### 4.2 DiffUtil 原理

DiffUtil 使用最长公共子序列算法（LCS）来找出数据集的变化。

```
算法复杂度：O(n²)
优化后：使用 ItemCallback 减少比较次数
```

### 4.3 实现 DiffCallback

```java
public class MyDiffCallback extends DiffUtil.Callback {
    
    private final List<Item> mOldList;
    private final List<Item> mNewList;
    
    public MyDiffCallback(List<Item> oldList, List<Item> newList) {
        mOldList = oldList;
        mNewList = newList;
    }
    
    @Override
    public int getOldListSize() {
        return mOldList.size();
    }
    
    @Override
    public int getNewListSize() {
        return mNewList.size();
    }
    
    @Override
    public boolean areItemsTheSame(int oldItemPosition, int newItemPosition) {
        // 判断是否是同一个 Item（根据唯一 ID）
        Item oldItem = mOldList.get(oldItemPosition);
        Item newItem = mNewList.get(newItemPosition);
        return oldItem.getId() == newItem.getId();
    }
    
    @Override
    public boolean areContentsTheSame(int oldItemPosition, int newItemPosition) {
        // 判断内容是否相同
        Item oldItem = mOldList.get(oldItemPosition);
        Item newItem = mNewList.get(newItemPosition);
        return oldItem.getTitle().equals(newItem.getTitle())
            && oldItem.getContent().equals(newItem.getContent());
    }
    
    // 可选：获取变化的 Item 内容
    @Override
    public DiffUtil.PayloadHolder getPayloadForOldItem(
            int oldItemPosition, 
            int newItemPosition) {
        Item item = mOldList.get(oldItemPosition);
        return new DiffUtil.PayloadHolder(item);
    }
}
```

### 4.4 使用 DiffUtil

```java
public class MyAdapter extends RecyclerView.Adapter<MyAdapter.ViewHolder> {
    
    private List<Item> dataList;
    
    public void updateData(List<Item> newData) {
        MyDiffCallback callback = new MyDiffCallback(dataList, newData);
        DiffUtil.DiffResult result = DiffUtil.calculateDiff(callback);
        
        dataList = newData;
        result.dispatchUpdatesTo(this);
    }
    
    // 其他方法...
}
```

### 4.5 异步计算

```java
// 异步计算，避免阻塞主线程
DiffUtil.DiffResult result = DiffUtil.calculateDiff(
    new MyDiffCallback(oldList, newList), 
    true  // asyncDiffThread = true
);

// 等待计算完成
result.dispatchUpdatesTo(adapter);
```

### 4.6 部分更新（Payload）

```java
// 使用 Payload 实现部分更新
public class MyAdapter extends RecyclerView.Adapter<MyAdapter.ViewHolder> {
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position, 
                                  List<Object> payloads) {
        if (payloads.isEmpty()) {
            // 完全更新
            holder.bind(dataList.get(position));
        } else {
            // 部分更新
            Object payload = payloads.get(0);
            if (payload == "title") {
                holder.title.setText(dataList.get(position).getTitle());
            } else if (payload == "image") {
                holder.image.setImageResource(dataList.get(position).getImage());
            }
        }
    }
}
```

---

## 五、缓存机制详解

### 5.1 四级缓存体系

```
RecyclerView 缓存体系:
├── Level 1: 屏幕上的 ViewHolder (Attached)
├── Level 2: 刚滑出的 ViewHolder (Scrap)
├── Level 3: 回收站 ViewHolder (Cached)
└── Level 4: 全局回收池 (RecycledViewPool)
```

### 5.2 缓存配置

```java
// 设置一级缓存数量
recyclerView.setItemViewCacheSize(20);

// 设置回收池
RecycledViewPool pool = new RecycledViewPool();
pool.setMaxRecycledViews(VIEW_TYPE_1, 20);
pool.setMaxRecycledViews(VIEW_TYPE_2, 20);
recyclerView.setRecycledViewPool(pool);
```

### 5.3 缓存命中流程

```
1. 查找 Level 1 缓存（屏幕上的 ViewHolder）
2. 查找 Level 2 缓存（Scrap）
3. 查找 Level 3 缓存（Cached）
4. 查找 Level 4 缓存（RecycledViewPool）
5. 创建新的 ViewHolder
```

### 5.4 自定义缓存策略

```java
public class CustomLayoutManager extends LinearLayoutManager {
    
    @Override
    public void recycleChildren(RecyclerView.Recycler recycler, 
                               RecyclerView.State state) {
        // 自定义回收策略
        super.recycleChildren(recycler, state);
    }
    
    @Override
    public ViewHolder recycleViewHolderForFailedLookup(
            RecyclerView.Recycler recycler,
            ViewHolder failed, 
            int type) {
        // 自定义复用策略
        return super.recycleViewHolderForFailedLookup(recycler, failed, type);
    }
}
```

---

## 六、性能优化技巧

### 6.1 静态属性复用

```java
// 设置静态属性，复用 ViewHolder 中的属性
ViewHolder title = itemView.findViewById(R.id.title);
title.setStaticDrawingCacheEnabled(true);
```

### 6.2 图片加载优化

```java
// 使用 Glide 的 RecyclerView 支持
Glide.with(context)
    .load(imageUrl)
    .override(itemWidth, itemHeight)  // 设置固定大小
    .centerCrop()
    .into(holder.image);

// 使用盘缓存
.diskCache(DiskCache.Lru(256 * 1024 * 1024))
```

### 6.3 避免在 onBindViewHolder 中创建对象

```java
// ❌ 避免在 onBindViewHolder 中创建新对象
@Override
public void onBindViewHolder(ViewHolder holder, int position) {
    // 每次都创建新的 Runnable
    holder.itemView.setOnClickListener(v -> {
        new Handler().post(new Runnable() {
            @Override
            public void run() {
                // 处理点击
            }
        });
    });
}

// ✅ 使用静态内部类或成员变量
private static final ClickListener CLICK_LISTENER = new ClickListener();

private static class ClickListener implements View.OnClickListener {
    @Override
    public void onClick(View v) {
        int position = (int) v.getTag();
        // 处理点击
    }
}

@Override
public void onBindViewHolder(ViewHolder holder, int position) {
    holder.itemView.setTag(position);
    holder.itemView.setOnClickListener(CLICK_LISTENER);
}
```

### 6.4 使用 setHasStableIds

```java
// 启用稳定 ID，帮助 RecyclerView 正确复用 ViewHolder
@Override
public boolean hasStableIds() {
    return true;
}

@Override
public long getItemId(int position) {
    return dataList.get(position).getId();
}
```

### 6.5 预加载图片

```java
// 预加载图片到内存
public void preloadImages(Context context, int startPosition, int endPosition) {
    for (int i = startPosition; i < endPosition; i++) {
        Item item = dataList.get(i);
        Glide.with(context)
            .load(item.getImageUrl())
            .preload();
    }
}
```

### 6.6 使用 ItemDecoration 优化

```java
// 使用 ItemDecoration 添加分割线，避免在 Item 布局中添加 View
public class DividerItemDecoration extends RecyclerView.ItemDecoration {
    
    private Paint mPaint;
    private int mHeight;
    
    public DividerItemDecoration(Context context, int orientation) {
        mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        mPaint.setColor(Color.GRAY);
        mPaint.setStyle(Paint.Style.STROKE);
        mHeight = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, 
            1, 
            context.getResources().getDisplayMetrics()
        );
    }
    
    @Override
    public void onDrawOver(Canvas c, RecyclerView parent, 
                          RecyclerView.State state) {
        int childCount = parent.getChildCount();
        for (int i = 0; i < childCount; i++) {
            View child = parent.getChildAt(i);
            RecyclerView.LayoutParams params = 
                (RecyclerView.LayoutParams) child.getLayoutParams();
            
            c.drawLine(
                child.getLeft(), 
                child.getBottom(), 
                child.getRight(), 
                child.getBottom(), 
                mPaint
            );
        }
    }
}

// 使用
recyclerView.addItemDecoration(new DividerItemDecoration(context,.VERTICAL));
```

### 6.7 避免过度测量

```java
// 设置固定高度，避免重复测量
holder.itemView.setMeasuredHeightAndWidth(itemWidth, itemHeight);
```

### 6.8 使用 DiffUtil 的异步计算

```java
// 在后台线程计算差异
DiffUtil.DiffResult result = DiffUtil.calculateDiff(
    callback, 
    true  // asyncDiffThread = true
);

// 在主线程应用差异
runOnUiThread(() -> {
    result.dispatchUpdatesTo(adapter);
});
```

---

## 七、动画支持

### 7.1 内置动画

```java
// 添加删除动画
DefaultItemAnimator animator = new DefaultItemAnimator();
animator.setAnimateRecycled(false);  // 禁用回收动画
recyclerView.setItemAnimator(animator);
```

### 7.2 自定义动画

```java
public class CustomItemAnimator extends DefaultItemAnimator {
    
    @Override
    public boolean animateAdd(Holder holder) {
        // 自定义添加动画
        holder.itemView.setAlpha(0f);
        holder.itemView.setScaleX(0.5f);
        holder.itemView.setScaleY(0.5f);
        
        ViewPropertyAnimator.animate(holder.itemView)
            .alpha(1f)
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(300)
            .start();
        
        return true;
    }
    
    @Override
    public boolean animateRemove(Holder holder) {
        // 自定义删除动画
        ViewPropertyAnimator.animate(holder.itemView)
            .alpha(0f)
            .scaleX(0f)
            .scaleY(0f)
            .setDuration(300)
            .withEndAction(() -> endAnimation(holder))
            .start();
        
        return true;
    }
    
    private void endAnimation(Holder holder) {
        holder.itemView.setAlpha(1f);
        holder.itemView.setScaleX(1f);
        holder.itemView.setScaleY(1f);
        dispatchFinishedWhenDone(holder);
    }
}
```

### 7.3 拖拽排序动画

```java
public class DragAndDropItemTouchCallback 
        extends ItemTouchHelper.SimpleCallback {
    
    public DragAndDropItemTouchCallback() {
        super(ITEM_TOUCHHelper drag up or down, 0);
    }
    
    @Override
    public boolean onMove(RecyclerView recyclerView, 
                         ViewHolder viewHolder, 
                         ViewHolder target) {
        int fromPosition = viewHolder.getAdapterPosition();
        int toPosition = target.getAdapterPosition();
        
        // 移动数据
        Item item = dataList.remove(fromPosition);
        dataList.add(toPosition, item);
        
        // 通知 Adapter
        adapter.notifyItemMoved(fromPosition, toPosition);
        
        return true;
    }
    
    @Override
    public void onSwiped(ViewHolder viewHolder, int direction) {
        // 滑动删除
        int position = viewHolder.getAdapterPosition();
        dataList.remove(position);
        adapter.notifyItemRemoved(position);
    }
}

// 使用
ItemTouchHelper touchHelper = new ItemTouchHelper(callback);
touchHelper.attachToRecyclerView(recyclerView);
```

---

## 八、多种 Item 类型

### 8.1 基本使用

```java
public class MultiTypeAdapter 
        extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    
    public static final int TYPE_HEADER = 0;
    public static final int TYPE_CONTENT = 1;
    public static final int TYPE_FOOTER = 2;
    
    private List<Object> dataList;
    
    @Override
    public int getItemViewType(int position) {
        if (position == 0) {
            return TYPE_HEADER;
        }
        if (position == dataList.size() - 1) {
            return TYPE_FOOTER;
        }
        return TYPE_CONTENT;
    }
    
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, 
                                                     int viewType) {
        View view;
        switch (viewType) {
            case TYPE_HEADER:
                view = LayoutInflater.from(parent.getContext())
                        .inflate(R.layout.item_header, parent, false);
                return new HeaderViewHolder(view);
            case TYPE_FOOTER:
                view = LayoutInflater.from(parent.getContext())
                        .inflate(R.layout.item_footer, parent, false);
                return new FooterViewHolder(view);
            default:
                view = LayoutInflater.from(parent.getContext())
                        .inflate(R.layout.item_content, parent, false);
                return new ContentViewHolder(view);
        }
    }
    
    @Override
    public void onBindViewHolder(RecyclerView.ViewHolder holder, 
                                 int position) {
        int viewType = getItemViewType(position);
        switch (viewType) {
            case TYPE_HEADER:
                // 绑定 Header 数据
                break;
            case TYPE_CONTENT:
                // 绑定 Content 数据
                ((ContentViewHolder) holder).bind(dataList.get(position));
                break;
            case TYPE_FOOTER:
                // 绑定 Footer 数据
                break;
        }
    }
    
    // ViewHolder 类定义...
}
```

### 8.2 使用 Bravoe 库简化

```java
// 使用 BaseQuickAdapter 简化多种类型处理
public class MyAdapter extends BaseQuickAdapter<Item, BaseViewHolder> {
    
    public MyAdapter(@LayoutRes int layoutResId, List<Item> data) {
        super(layoutResId, data);
    }
    
    @Override
    protected void convert(BaseViewHolder helper, Item item) {
        helper.setText(R.id.title, item.getTitle());
        helper.setImageResource(R.id.image, item.getImage());
    }
}
```

---

## 九、面试考点总结

### 9.1 基础知识点

#### Q1: RecyclerView 的核心组件有哪些？

**A:**
1. **RecyclerView:** 容器组件
2. **LayoutManager:** 布局管理器（LinearLayoutManager、GridLayoutManager、StaggeredGridLayoutManager）
3. **Adapter:** 数据适配器
4. **ViewHolder:** 视图持有者

#### Q2: ViewHolder 的作用是什么？

**A:** ViewHolder 模式缓存了 Item 的视图引用，避免了重复调用 findViewById，提高了性能。

#### Q3: RecyclerView 的缓存机制是怎样的？

**A:**
- **一级缓存:** 屏幕上的 ViewHolder
- **二级缓存:** 刚滑出的 ViewHolder（Scrap）
- **三级缓存:** 回收站（RecycledViewPool）

### 9.2 进阶知识点

#### Q4: 如何优化 RecyclerView 的性能？

**A:**
1. 使用 ViewHolder 模式
2. 设置合适的 itemViewCacheSize
3. 使用 DiffUtil 增量更新
4. 启用 hasStableIds
5. 优化图片加载
6. 避免在 onBindViewHolder 中创建对象
7. 使用静态内部类

#### Q5: DiffUtil 的原理是什么？

**A:** DiffUtil 使用最长公共子序列算法找出两个列表的差异，只更新变化的部分，而不是刷新整个列表。

#### Q6: 如何解决 RecyclerView 滚动卡顿？

**A:**
1. 减少 Item 的布局层级
2. 使用图片预加载
3. 启用硬件加速
4. 优化数据查询
5. 使用异步 DiffUtil

### 9.3 实战题目

#### Q7: 实现一个下拉刷新的 RecyclerView

```java
// 使用 SwipeRefreshLayout
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    android:id="@+id/swipeRefresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recyclerView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>

</androidx.swiperefreshload.widget.SwipeRefreshLayout>

// 代码
swipeRefresh.setOnRefreshListener(() -> {
    // 刷新数据
    refreshData();
    swipeRefresh.setRefreshing(false);
});
```

#### Q8: 实现一个分组列表

```java
public class GroupedAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    
    private List<Group> groups;
    
    @Override
    public int getItemViewType(int position) {
        int pos = 0;
        for (Group group : groups) {
            if (position >= pos && position < pos + group.items.size()) {
                if (position == pos) {
                    return TYPE_HEADER;
                }
                return TYPE_ITEM;
            }
            pos += group.items.size();
        }
        return TYPE_ITEM;
    }
    
    // 其他方法...
}
```

### 9.4 常见面试题

| 问题 | 考察点 | 难度 |
|-----|-------|-----|
| ViewHolder 复用机制 | 缓存原理 | ⭐⭐ |
| DiffUtil 原理 | 算法理解 | ⭐⭐⭐ |
| 缓存机制 | 性能优化 | ⭐⭐⭐ |
| 多种 Item 类型 | 实战应用 | ⭐⭐ |
| 动画实现 | 动画原理 | ⭐⭐⭐ |
| 滚动优化 | 性能调优 | ⭐⭐⭐⭐ |

---

## 十、总结

### 10.1 优化清单

- [ ] 使用 ViewHolder 模式
- [ ] 设置合适的缓存大小
- [ ] 使用 DiffUtil 增量更新
- [ ] 启用 hasStableIds
- [ ] 优化图片加载
- [ ] 避免过度测量
- [ ] 使用 ItemDecoration 代替分割线 View
- [ ] 预加载数据
- [ ] 使用异步 DiffUtil
- [ ] 合理使用动画

### 10.2 最佳实践

1. **布局优化:** 减少 Item 布局层级
2. **数据优化:** 使用 DiffUtil 增量更新
3. **图片优化:** 使用合适的图片加载库
4. **缓存优化:** 合理设置缓存大小
5. **动画优化:** 禁用不必要的动画

### 10.3 学习资源

- [官方文档](https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView)
- [RecyclerView 优化](https://developer.android.com/topic/performance/graphics/recyclerview)
- [DiffUtil 详解](https://developer.android.com/reference/androidx/recyclerview/widget/DiffUtil)

---

*本文档持续更新，欢迎补充和完善。*