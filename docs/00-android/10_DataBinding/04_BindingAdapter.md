# 自定义 BindingAdapter

## 一、BindingAdapter 概述

### 1.1 什么是 BindingAdapter

BindingAdapter 是 DataBinding 框架提供的扩展机制，允许开发者自定义 XML 属性绑定。通过 BindingAdapter，我们可以将布局文件中任意属性与数据模型绑定，实现更加灵活和强大的 UI 绑定功能。

**没有 BindingAdapter 的局限：**

```xml
<!-- 只能绑定原生支持的属性 -->
<ImageView
    android:src="@{user.avatar}" />  <!-- ❌ 不支持，需要 Glide/Picasso -->
<TextView
    android:textSize="@{16}" />     <!-- ❌ 不支持直接绑定数值 -->
```

**使用 BindingAdapter 扩展：**

```java
@BindingAdapter("app:imageUrl")
public static void setImageUrl(ImageView view, String url) {
    Glide.with(view.getContext()).load(url).into(view);
}
```

```xml
<!-- 可以绑定自定义属性 -->
<ImageView
    app:imageUrl="@{user.avatarUrl}" />  <!-- ✅ 支持图片加载 -->
<TextView
    app:textSizeSp="@{16}" />            <!-- ✅ 支持尺寸绑定 -->
```

### 1.2 BindingAdapter 的优势

1. **扩展性**：扩展 DataBinding 支持的属性
2. **封装性**：封装复杂的绑定逻辑
3. **复用性**：一次定义，多处使用
4. **可维护性**：集中管理绑定逻辑
5. **类型安全**：编译时检查参数类型

### 1.3 适用场景

- 图片加载（Glide、Picasso、Fresco）
- 列表适配器绑定（RecyclerView）
- 自定义 View 属性绑定
- 格式转换（日期、金额、电话）
- 复杂逻辑封装（HTML 解析、富文本）

---

## 二、@BindingAdapter 注解详解

### 2.1 基本语法

```java
// 基本语法
@BindingAdapter("属性名")
public static void 方法名 (View 类型 view, 参数类型 value) {
    // 绑定逻辑
}
```

### 2.2 注解参数

#### 单个属性绑定

```java
// 绑定单个属性
@BindingAdapter("app:customText")
public static void setCustomText(TextView view, String text) {
    view.setText(text);
}
```

**XML 使用：**

```xml
<TextView
    app:customText="@{user.name}" />
```

#### 多个属性绑定

```java
// 绑定多个属性
@BindingAdapter({
    "app:text",
    "app:textColor",
    "app:textSize"
})
public static void setTextProperties(
        TextView view,
        String text,
        Integer textColor,
        Float textSize) {
    
    if (text != null) {
        view.setText(text);
    }
    if (textColor != null) {
        view.setTextColor(textColor);
    }
    if (textSize != null) {
        view.setTextSize(textSize);
    }
}
```

**XML 使用：**

```xml
<TextView
    app:text="@{user.name}"
    app:textColor="@{colors.primary}"
    app:textSizeSp="@{16}" />
```

### 2.3 方法签名要求

#### 必须是 static 方法

```java
// ✅ 正确
@BindingAdapter("app:custom")
public static void setCustom(View view, String value) { }

// ❌ 错误：非 static
@BindingAdapter("app:custom")
public void setCustom(View view, String value) { }
```

#### 第一个参数必须是 View

```java
// ✅ 正确：第一个参数是 View
@BindingAdapter("app:custom")
public static void setCustom(TextView view, String value) { }

// ❌ 错误：第一个参数不是 View
@BindingAdapter("app:custom")
public static void setCustom(String value, TextView view) { }
```

#### 返回类型必须是 void

```java
// ✅ 正确
@BindingAdapter("app:custom")
public static void setCustom(TextView view, String value) { }

// ❌ 错误
@BindingAdapter("app:custom")
public static TextView setCustom(TextView view, String value) {
    return view;
}
```

### 2.4 属性命名规则

```java
// 属性名可以包含冒号（命名空间）
@BindingAdapter("app:myAttr")
public static void setMyAttr(View view, String value) { }

// 也可以不包含（会自动添加）
@BindingAdapter("myAttr")
public static void setMyAttr(View view, String value) { }
```

**XML 中使用（都需要添加命名空间）：**

```xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">
    
    <!-- 两种写法都可以 -->
    <View app:myAttr="@{value}" />
    
</LinearLayout>
```

---

## 三、自定义属性绑定

### 3.1 文本格式化

#### 日期格式化

```java
public class DateBindingAdapters {
    
    @BindingAdapter("app:dateFormat")
    public static void setDateFormat(TextView view, Long timestamp) {
        if (timestamp == null) {
            view.setText("");
            return;
        }
        
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
        view.setText(sdf.format(new Date(timestamp)));
    }
    
    @BindingAdapter("app:dateRelative")
    public static void setDateRelative(TextView view, Long timestamp) {
        if (timestamp == null) {
            view.setText("");
            return;
        }
        
        long now = System.currentTimeMillis();
        long diff = now - timestamp;
        
        if (diff < 60000) {
            view.setText("刚刚");
        } else if (diff < 3600000) {
            view.setText(diff / 60000 + " 分钟前");
        } else if (diff < 86400000) {
            view.setText(diff / 3600000 + " 小时前");
        } else {
            view.setText(diff / 86400000 + " 天前");
        }
    }
}
```

**XML 使用：**

```xml
<TextView
    android:id="@+id/tv_date"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    app:dateFormat="@{post.createdAt}" />

<TextView
    android:id="@+id/tv_time_ago"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    app:dateRelative="@{post.createdAt}" />
```

#### 金额格式化

```java
public class MoneyBindingAdapters {
    
    @BindingAdapter("app:moneyFormat")
    public static void setMoneyFormat(TextView view, Double amount) {
        if (amount == null) {
            view.setText("");
            return;
        }
        
        DecimalFormat df = new DecimalFormat("¥#,###.00");
        view.setText(df.format(amount));
    }
    
    @BindingAdapter("app:moneyColor")
    public static void setMoneyColor(TextView view, Double amount) {
        if (amount == null) {
            return;
        }
        
        if (amount > 0) {
            view.setTextColor(ContextCompat.getColor(view.getContext(), R.color.green));
        } else if (amount < 0) {
            view.setTextColor(ContextCompat.getColor(view.getContext(), R.color.red));
        }
    }
}
```

### 3.2 可见性控制

```java
public class VisibilityBindingAdapters {
    
    // 绑定布尔值控制可见性
    @BindingAdapter("android:visible")
    public static void setVisible(View view, Boolean visible) {
        view.setVisibility(visible ? View.VISIBLE : View.GONE);
    }
    
    // 绑定空值控制可见性
    @BindingAdapter("app:visibleIfNotNull")
    public static void setVisibleIfNotNull(View view, Object object) {
        view.setVisibility(object != null ? View.VISIBLE : View.GONE);
    }
    
    // 绑定字符串非空控制可见性
    @BindingAdapter("app:visibleIfNotEmpty")
    public static void setVisibleIfNotEmpty(View view, String text) {
        view.setVisibility(!TextUtils.isEmpty(text) ? View.VISIBLE : View.GONE);
    }
    
    // 绑定列表非空控制可见性
    @BindingAdapter("app:visibleIfListNotEmpty")
    public static void setVisibleIfListNotEmpty(View view, List<?> list) {
        view.setVisibility((list != null && !list.isEmpty()) ? View.VISIBLE : View.GONE);
    }
}
```

**XML 使用：**

```xml
<!-- 布尔控制 -->
<TextView
    android:visible="@{showDescription}" />

<!-- 空值控制 -->
<TextView
    app:visibleIfNotNull="@{user.bio}" />

<!-- 字符串非空控制 -->
<TextView
    app:visibleIfNotEmpty="@{user.bio}" />

<!-- 列表非空控制 -->
<RecyclerView
    app:visibleIfListNotEmpty="@{items}" />
```

### 3.3 使能状态控制

```java
public class EnabledBindingAdapters {
    
    @BindingAdapter("app:enabledIfNotEmpty")
    public static void setEnabledIfNotEmpty(View view, String text) {
        view.setEnabled(!TextUtils.isEmpty(text));
    }
    
    @BindingAdapter("app:enabledIfNotZero")
    public static void setEnabledIfNotZero(View view, Integer value) {
        view.setEnabled(value != null && value > 0);
    }
}
```

### 3.4 多属性组合绑定

```java
public class TextViewBindingAdapters {
    
    @BindingAdapter({
        "app:text",
        "app:textColor",
        "app:textSizeSp",
        "app:textBold",
        "app:hint",
        "app:hintColor"
    })
    public static void setTextViewProperties(
            TextView view,
            String text,
            Integer textColor,
            Float textSizeSp,
            Boolean textBold,
            String hint,
            Integer hintColor) {
        
        // 设置文本
        if (text != null) {
            view.setText(text);
        }
        
        // 设置颜色
        if (textColor != null) {
            view.setTextColor(textColor);
        }
        
        // 设置大小
        if (textSizeSp != null) {
            view.setTextSize(COMPLEX_UNIT_SP, textSizeSp);
        }
        
        // 设置粗细
        if (textBold != null) {
            view.setTypeface(view.getTypeface(), textBold ? Typeface.BOLD : Typeface.NORMAL);
        }
        
        // 设置提示
        if (hint != null) {
            view.setHint(hint);
        }
        
        // 设置提示颜色
        if (hintColor != null) {
            view.setHintTextColor(hintColor);
        }
    }
}
```

**XML 使用：**

```xml
<TextView
    app:text="@{user.name}"
    app:textColor="@{colors.primary}"
    app:textSizeSp="@{16}"
    app:textBold="@{user.isVip}"
    app:hint="@{`请输入`}"
    app:hintColor="@{colors.hint}" />
```

---

## 四、图片绑定

### 4.1 Glide 图片加载

```java
public class ImageBindingAdapters {
    
    // 基本图片加载
    @BindingAdapter("app:imageUrl")
    public static void setImageUrl(ImageView view, String url) {
        if (url == null || url.isEmpty()) {
            view.setImageResource(R.drawable.ic_default);
            return;
        }
        
        Glide.with(view.getContext())
            .load(url)
            .placeholder(R.drawable.ic_loading)
            .error(R.drawable.ic_error)
            .centerCrop()
            .into(view);
    }
    
    // 圆角图片加载
    @BindingAdapter("app:circleImageUrl")
    public static void setCircleImageUrl(ImageView view, String url) {
        if (url == null || url.isEmpty()) {
            view.setImageResource(R.drawable.ic_default);
            return;
        }
        
        Glide.with(view.getContext())
            .load(url)
            .circleCrop()
            .placeholder(R.drawable.ic_loading)
            .error(R.drawable.ic_error)
            .into(view);
    }
    
    // 圆角带边框
    @BindingAdapter({
        "app:roundedImageUrl",
        "app:borderWidth",
        "app:borderColor"
    })
    public static void setRoundedImageUrl(
            ImageView view,
            String url,
            Integer borderWidth,
            Integer borderColor) {
        
        if (url == null || url.isEmpty()) {
            view.setImageResource(R.drawable.ic_default);
            return;
        }
        
        RequestOptions options = RoundedCornersTransformer.getRoundedOptions(
                16f, // 圆角半径
                borderWidth != null ? borderWidth : 0,
                borderColor != null ? borderColor : Color.TRANSPARENT
        );
        
        Glide.with(view.getContext())
            .load(url)
            .apply(options)
            .placeholder(R.drawable.ic_loading)
            .error(R.drawable.ic_error)
            .into(view);
    }
}
```

**XML 使用：**

```xml
<!-- 基本图片 -->
<ImageView
    app:imageUrl="@{user.avatar}" />

<!-- 圆形图片 -->
<ImageView
    android:layout_width="80dp"
    android:layout_height="80dp"
    app:circleImageUrl="@{user.avatar}" />

<!-- 圆角带边框 -->
<ImageView
    android:layout_width="120dp"
    android:layout_height="120dp"
    app:roundedImageUrl="@{post.coverImage}"
    app:borderWidth="@{2}"
    app:borderColor="@{colors.primary}" />
```

### 4.2 Picasso 图片加载

```java
public class PicassoBindingAdapters {
    
    @BindingAdapter("app:picassoUrl")
    public static void setPicassoUrl(ImageView view, String url) {
        if (url == null || url.isEmpty()) {
            view.setImageResource(R.drawable.ic_default);
            return;
        }
        
        Picasso.with(view.getContext())
            .load(url)
            .placeholder(R.drawable.ic_loading)
            .error(R.drawable.ic_error)
            .centerCrop()
            .into(view);
    }
    
    @BindingAdapter("app:picassoCircleUrl")
    public static void setPicassoCircleUrl(ImageView view, String url) {
        if (url == null || url.isEmpty()) {
            view.setImageResource(R.drawable.ic_default);
            return;
        }
        
        Picasso.with(view.getContext())
            .load(url)
            .transform(new CircleTransform())
            .placeholder(R.drawable.ic_loading)
            .error(R.drawable.ic_error)
            .into(view);
    }
}
```

### 4.3 多图片（轮播）绑定

```java
public class MultiImageBindingAdapters {
    
    @BindingAdapter({
        "app:imageList",
        "app:autoplay",
        "app:interval"
    })
    public static void setImageList(
            ViewPager viewPager,
            List<String> imageUrls,
            Boolean autoplay,
            Integer interval) {
        
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        
        ImagePagerAdapter adapter = new ImagePagerAdapter(viewPager.getContext(), imageUrls);
        viewPager.setAdapter(adapter);
        
        if (autoplay != null && autoplay) {
            viewPager.setPageTransformer(true, new ZoomOutPageTransformer());
            viewPager.setScrollListener(new AutoScrollListener(
                    viewPager, 
                    interval != null ? interval : 3000
            ));
        }
    }
}
```

### 4.4 Coil (Kotlin) 图片加载

```kotlin
object CoilBindingAdapters {
    
    @BindingAdapter("app:coilUrl")
    @JvmStatic
    fun setCoilUrl(imageView: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            imageView.setImageResource(R.drawable.ic_default)
            return
        }
        
        ImageViewExtension(imageView).load(url) {
            placeholder(R.drawable.ic_loading)
            error(R.drawable.ic_error)
            crossfade(true)
        }
    }
    
    @BindingAdapter("app:coilCircleUrl")
    @JvmStatic
    fun setCoilCircleUrl(imageView: ImageView, url: String?) {
        if (url.isNullOrEmpty()) {
            imageView.setImageResource(R.drawable.ic_default)
            return
        }
        
        ImageViewExtension(imageView).load(url) {
            placeholder(R.drawable.ic_loading)
            error(R.drawable.ic_error)
            crossfade(true)
            transformation(CircleCropTransformation())
        }
    }
}
```

---

## 五、列表绑定

### 5.1 RecyclerView 基础绑定

```java
public class RecyclerViewBindingAdapters {
    
    @BindingAdapter({
        "app:items",
        "app:layoutResId"
    })
    public static void setItems(
            RecyclerView recyclerView,
            List<Object> items,
            Integer layoutResId) {
        
        if (items == null) {
            items = new ArrayList<>();
        }
        
        MyAdapter adapter = new MyAdapter(
                recyclerView.getContext(), 
                items, 
                layoutResId != null ? layoutResId : R.layout.item_default
        );
        
        recyclerView.setLayoutManager(new LinearLayoutManager(recyclerView.getContext()));
        recyclerView.setAdapter(adapter);
    }
}
```

**XML 使用：**

```xml
<androidx.recyclerview.widget.RecyclerView
    android:id="@+id/recycler_view"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:items="@{user.posts}"
    app:layoutResId="@{R.layout.item_post}" />
```

### 5.2 带点击事件的 RecyclerView 绑定

```java
public class RecyclerViewBindingAdapters {
    
    // 使用接口传递点击事件
    @BindingAdapter({
        "app:items",
        "app:itemClick"
    })
    public static void setItemsWithClick(
            RecyclerView recyclerView,
            List<Object> items,
            ItemClickListener clickListener) {
        
        if (items == null) {
            items = new ArrayList<>();
        }
        
        MyAdapter adapter = new MyAdapter(
                recyclerView.getContext(), 
                items,
                clickListener
        );
        
        recyclerView.setLayoutManager(new LinearLayoutManager(recyclerView.getContext()));
        recyclerView.setAdapter(adapter);
    }
}

// 接口定义
public interface ItemClickListener {
    void onItemClick(Object item, int position);
    
    void onItemLongClick(Object item, int position);
}

// 实现类（DataBinding 自动包装）
public class ItemClickWrapper implements ItemClickListener {
    private final BindingAdapter clickBinding;
    
    public ItemClickWrapper(BindingAdapter clickBinding) {
        this.clickBinding = clickBinding;
    }
    
    @Override
    public void onItemClick(Object item, int position) {
        clickBinding.invoke(item, position);
    }
    
    @Override
    public void onItemLongClick(Object item, int position) {
        // 实现长按
    }
}
```

**XML 使用：**

```xml
<androidx.recyclerview.widget.RecyclerView
    app:items="@{user.posts}"
    app:itemClick="@{viewModel::onPostClick}" />
```

### 5.3 多类型 Item 的 RecyclerView 绑定

```java
public class MultiTypeRecyclerViewBindingAdapter {
    
    @BindingAdapter({
        "app:multiItems",
        "app:typeProviders"
    })
    public static void setMultiItems(
            RecyclerView recyclerView,
            List<Object> items,
            List<ViewTypeProvider> typeProviders) {
        
        if (items == null) {
            items = new ArrayList<>();
        }
        
        MultiTypeAdapter adapter = new MultiTypeAdapter(items);
        
        // 注册不同类型
        for (ViewTypeProvider provider : typeProviders) {
            adapter.registerTypeProvider(provider);
        }
        
        recyclerView.setLayoutManager(new LinearLayoutManager(recyclerView.getContext()));
        recyclerView.setAdapter(adapter);
    }
}
```

### 5.4 带刷新加载的 RecyclerView 绑定

```java
public class RefreshRecyclerViewBindingAdapters {
    
    @BindingAdapter({
        "app:items",
        "app:onRefresh",
        "app:onLoadMore"
    })
    public static void setItemsWithRefresh(
            SmartRefreshLayout refreshLayout,
            RecyclerView recyclerView,
            List<Object> items,
            RefreshListener refreshListener,
            LoadMoreListener loadMoreListener) {
        
        // 设置 Adapter
        MyAdapter adapter = new MyAdapter(recyclerView.getContext(), items);
        recyclerView.setLayoutManager(new LinearLayoutManager(recyclerView.getContext()));
        recyclerView.setAdapter(adapter);
        
        // 设置刷新监听
        if (refreshListener != null) {
            refreshLayout.setOnRefreshListener(refreshListener);
        }
        
        // 设置加载更多
        if (loadMoreListener != null) {
            refreshLayout.setOnLoadMoreListener(loadMoreListener);
        }
    }
}
```

---

## 六、线程安全

### 6.1 主线程要求

BindingAdapter 必须在主线程执行，因为涉及到 View 操作：

```java
// ✅ 正确：直接操作 View（在主线程）
@BindingAdapter("app:imageUrl")
public static void setImageUrl(ImageView view, String url) {
    Glide.with(view.getContext()).load(url).into(view);
}

// ❌ 错误：在子线程操作 View
@BindingAdapter("app:dangerous")
public static void setDangerous(View view, String value) {
    new Thread(() -> {
        view.setText(value);  // ❌ 子线程操作 View，会崩溃
    }).start();
}
```

### 6.2 异步任务处理

```java
// ✅ 正确：异步加载，回调在主线程
@BindingAdapter("app:asyncData")
public static void setAsyncData(TextView view, String dataId) {
    // 异步加载
    loadDataAsync(dataId, new Callback<String>() {
        @Override
        public void onSuccess(String result) {
            // Glide/Picasso 的回调已经在主线程
            view.setText(result);
        }
        
        @Override
        public void onError(Error error) {
            view.setText("加载失败");
        }
    });
}
```

### 6.3 协程支持 (Kotlin)

```kotlin
object CoroutineBindingAdapters {
    
    @BindingAdapter("app:coroutineLoad")
    @JvmStatic
    fun loadCoroutine(textView: TextView, dataId: String?) {
        if (dataId.isNullOrEmpty()) {
            return
        }
        
        // 使用协程（在 ViewModel 中调用）
        // viewModel.loadData(dataId)
        //     .observe(viewLifecycleOwner) { result ->
        //         textView.text = result
        //     }
    }
}
```

### 6.4 LiveData 观察

```java
// ✅ 正确：在 ViewModel 中观察 LiveData
public class MyViewModel extends ViewModel {
    public LiveData<String> loadData(String id) {
        return new AsyncTask.LiveDataBuilder<String>()
            .executeOnBackground(() -> loadFromNetwork(id))
            .build();
    }
}

// XML 中直接绑定
<TextView
    app:text="@{viewModel.data}" />
```

### 6.5 避免内存泄漏

```java
// ❌ 错误：持有 View 强引用
public class BadBindingAdapter {
    private static List<View> cachedViews = new ArrayList<>();
    
    @BindingAdapter("app:bad")
    public static void setBad(View view, String value) {
        cachedViews.add(view);  // 内存泄漏
        // ...
    }
}

// ✅ 正确：不持有 View 引用
@BindingAdapter("app:good")
public static void setGood(View view, String value) {
    // 操作后立即释放
    view.setText(value);
    // 不使用静态变量持有 view
}
```

---

## 七、高级用法

### 7.1 可观察属性的 BindingAdapter

```java
// 支持 ObservableField 的 BindingAdapter
@BindingAdapter("app:observableText")
public static void setObservableText(TextView view, ObservableField<String> observable) {
    if (observable == null) {
        return;
    }
    
    // 设置初始值
    view.setText(observable.get());
    
    // 监听变化
    observable.addOnPropertyChangedListener(new Brakes.OnPropertyChangedListener() {
        @Override
        public void onPropertyChanged(Object who, int propertyId) {
            view.setText(observable.get());
        }
    });
}
```

### 7.2 自定义 Animator 绑定

```java
public class AnimatorBindingAdapters {
    
    @BindingAdapter({
        "app:alpha",
        "app:translationX",
        "app:translationY",
        "app:scaleX",
        "app:scaleY"
    })
    public static void setAnimations(
            View view,
            Float alpha,
            Float translationX,
            Float translationY,
            Float scaleX,
            Float scaleY) {
        
        if (alpha != null) {
            view.animate().alpha(alpha).setDuration(300).start();
        }
        if (translationX != null) {
            view.animate().translationX(translationX).setDuration(300).start();
        }
        if (translationY != null) {
            view.animate().translationY(translationY).setDuration(300).start();
        }
        if (scaleX != null) {
            view.animate().scaleX(scaleX).setDuration(300).start();
        }
        if (scaleY != null) {
            view.animate().scaleY(scaleY).setDuration(300).start();
        }
    }
}
```

### 7.3 ViewStub 绑定

```java
public class ViewStubBindingAdapters {
    
    @BindingAdapter("app:viewStubLayout")
    public static void inflateViewStub(ViewStub viewStub, Integer layoutId) {
        if (layoutId != null) {
            viewStub.setLayoutResource(layoutId);
            viewStub.inflate();
        }
    }
}
```

### 7.4 ConstraintLayout 约束绑定

```java
public class ConstraintBindingAdapters {
    
    @BindingAdapter("app:constraintTopTo")
    public static void setConstraintTopTo(
            ConstraintLayout.LayoutParams params,
            Integer targetId) {
        if (targetId != null) {
            params.topToTop = targetId;
        }
    }
}
```

---

## 八、常见问题与解决方案

### 8.1 属性不生效

**问题：**自定义属性在 XML 中不生效

**原因：**
1. 忘记添加命名空间
2. 属性名不匹配
3. BindingAdapter 未被扫描到

**解决：**
```xml
<!-- ✅ 正确：添加命名空间 -->
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">
    
    <TextView app:customText="@{user.name}" />
    
</LinearLayout>
```

### 8.2 空指针异常

**问题：**BindingAdapter 中访问 null 值

**解决：**
```java
@BindingAdapter("app:safe")
public static void setSafe(View view, String value) {
    // ✅ 检查 null
    if (value == null) {
        return;
    }
    view.setText(value);
}
```

### 8.3 重复绑定

**问题：**相同属性被多次绑定

**解决：**
```java
// ✅ 合并多个属性到一个方法
@BindingAdapter({"app:text", "app:textColor"})
public static void setTextProps(TextView view, String text, Integer color) {
    // 统一处理
}
```

### 8.4 性能问题

**问题：**BindingAdapter 中执行耗时操作

**解决：**
```java
// ❌ 错误：主线程耗时操作
@BindingAdapter("app:slow")
public static void setSlow(View view, String value) {
    Thread.sleep(1000);  // 阻塞主线程
}

// ✅ 正确：异步处理
@BindingAdapter("app:async")
public static void setAsync(View view, String value) {
    executor.execute(() -> {
        // 后台处理
        runOnUiThread(() -> {
            view.setText(result);
        });
    });
}
```

---

## 九、面试考点

### 9.1 基础概念

**Q1: 什么是 BindingAdapter？有什么作用？**

**A:**
- BindingAdapter 是 DataBinding 的扩展机制
- 允许自定义 XML 属性绑定
- 封装复杂的绑定逻辑
- 扩展原生不支持的属性

**Q2: @BindingAdapter 注解的语法要求？**

**A:**
1. 必须是 static 方法
2. 第一个参数必须是 View
3. 返回类型必须是 void
4. 可以绑定单个或多个属性

**Q3: BindingAdapter 中如何绑定多个属性？**

**A:**
```java
@BindingAdapter({"attr1", "attr2", "attr3"})
public static void setAttrs(View view, Type1 v1, Type2 v2, Type3 v3) {
    // 分别处理，检查 null
}
```

### 9.2 进阶问题

**Q4: BindingAdapter 如何实现图片加载？**

**A:**
```java
@BindingAdapter("app:imageUrl")
public static void setImageUrl(ImageView view, String url) {
    Glide.with(view.getContext()).load(url).into(view);
}
```

**Q5: BindingAdapter 如何保证线程安全？**

**A:**
- 必须在主线程执行
- 异步操作需回调到主线程
- 避免持有 View 强引用

**Q6: 如何处理 BindingAdapter 中的 null 值？**

**A:**
```java
if (value == null) {
    return; // 或设置默认值
}
```

### 9.3 场景题

**Q7: 如何实现 RecyclerView 的 BindingAdapter？**

**A:**
```java
@BindingAdapter({"app:items", "app:itemClick"})
public static void setItems(RecyclerView rv, List items, ClickListener listener) {
    Adapter adapter = new Adapter(items, listener);
    rv.setAdapter(adapter);
}
```

**Q8: 如何实现格式化显示的 BindingAdapter？**

**A:**
```java
@BindingAdapter("app:moneyFormat")
public static void setMoney(TextView view, Double amount) {
    view.setText(String.format("¥%.2f", amount));
}
```

---

## 十、最佳实践

### 10.1 代码组织

```java
// 按功能分类
public class ImageBindingAdapters { }
public class TextBindingAdapters { }
public class RecyclerViewBindingAdapters { }
public class VisibilityBindingAdapters { }
```

### 10.2 命名规范

```java
// 属性名使用小驼峰
@BindingAdapter("app:imageUrl")
public static void setImageUrl(...) { }

// 类名使用大驼峰 + 后缀
public class ImageBindingAdapters { }
```

### 10.3 空值处理

```java
// 统一空值处理策略
private static void safeSetText(TextView view, String text) {
    view.setText(text != null ? text : "");
}
```

### 10.4 性能优化

```java
// 避免重复加载
private static Map<View, String> cachedUrls = new WeakHashMap<>();

@BindingAdapter("app:imageUrl")
public static void setImageUrl(ImageView view, String url) {
    if (cachedUrls.get(view) == url) {
        return; // 已加载，跳过
    }
    // 加载逻辑
}
```

---

## 十一、总结

### 11.1 核心要点

1. **@BindingAdapter 注解**：定义自定义绑定
2. **方法签名**：static、void、View 第一参数
3. **多属性绑定**：使用数组语法
4. **线程安全**：必须在主线程
5. **空值处理**：始终检查 null

### 11.2 常见场景

- 图片加载（Glide/Picasso/Coil）
- RecyclerView 列表绑定
- 文本格式化（日期、金额）
- 可见性控制
- 动画效果

### 11.3 学习建议

1. 掌握基础语法
2. 学习常见库的集成
3. 注意线程安全
4. 关注性能优化

---

*本文档最后更新：2024 年*

> 熟练掌握 BindingAdapter，让你的 DataBinding 如虎添翼！