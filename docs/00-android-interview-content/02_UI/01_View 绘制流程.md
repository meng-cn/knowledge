# View 绘制流程深度解析 🎨

> Android UI 渲染核心机制，面试高频考点

---

## 一、绘制流程总览

```
┌─────────────────────────────────────────────────────────┐
│                    View 绘制三阶段                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Measure (测量)  →  确定 View 的宽高                    │
│         ↓                                                 │
│  2. Layout (布局)   →  确定 View 的位置                    │
│         ↓                                                 │
│  3. Draw (绘制)     →  将 View 绘制到屏幕                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 核心方法调用链

```
ViewRootImpl.performTraversals()
    ├── performMeasure()  →  measure()  →  onMeasure()
    ├── performLayout()   →  layout()   →  onLayout()
    └── performDraw()     →  draw()     →  onDraw()
```

---

## 二、Measure 测量阶段

### 2.1 MeasureSpec 详解

```kotlin
// MeasureSpec 包含模式和大小
class MeasureSpec {
    companion object {
        const val UNSPECIFIED = 0  // 无限制，ScrollView 中使用
        const val EXACTLY = 1      // 精确值，match_parent 或具体数值
        const val AT_MOST = 2      // 最大值，wrap_content
    }
    
    static fun makeMeasureSpec(size: Int, mode: Int): Int
    static fun getMode(measureSpec: Int): Int
    static fun getSize(measureSpec: Int): Int
}
```

### 2.2 测量流程代码

```kotlin
// View 的测量
class MyView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // 1. 解析 MeasureSpec
        val widthMode = MeasureSpec.getMode(widthMeasureSpec)
        val widthSize = MeasureSpec.getSize(widthMeasureSpec)
        val heightMode = MeasureSpec.getMode(heightMeasureSpec)
        val heightSize = MeasureSpec.getSize(heightMeasureSpec)
        
        var width = 0
        var height = 0
        
        // 2. 根据模式计算宽度
        when (widthMode) {
            MeasureSpec.EXACTLY -> {
                // match_parent 或固定值
                width = widthSize
            }
            MeasureSpec.AT_MOST -> {
                // wrap_content，需要自己计算
                width = desiredWidth.coerceAtMost(widthSize)
            }
            MeasureSpec.UNSPECIFIED -> {
                // 无限制
                width = desiredWidth
            }
        }
        
        // 3. 根据模式计算高度
        when (heightMode) {
            MeasureSpec.EXACTLY -> {
                height = heightSize
            }
            MeasureSpec.AT_MOST -> {
                height = desiredHeight.coerceAtMost(heightSize)
            }
            MeasureSpec.UNSPECIFIED -> {
                height = desiredHeight
            }
        }
        
        // 4. 设置测量结果（必须调用）
        setMeasuredDimension(width, height)
    }
    
    private val desiredWidth: Int
        get() = (200 * resources.displayMetrics.density).toInt()
    
    private val desiredHeight: Int
        get() = (100 * resources.displayMetrics.density).toInt()
}
```

### 2.3 ViewGroup 测量子 View

```kotlin
// ViewGroup 测量子 View
class MyLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : ViewGroup(context, attrs) {
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        
        // 测量所有子 View
        measureChildren(widthMeasureSpec, heightMeasureSpec)
        
        // 或者单独测量某个子 View
        val child = getChildAt(0)
        measureChildWithMargins(child, widthMeasureSpec, 0, heightMeasureSpec, 0)
        
        // 设置自己的尺寸
        setMeasuredDimension(measuredWidth, measuredHeight)
    }
    
    override fun generateLayoutParams(attrs: AttributeSet?): LayoutParams {
        return MarginLayoutParams(context, attrs)
    }
}
```

---

## 三、Layout 布局阶段

### 3.1 布局流程

```kotlin
// View 的 layout 方法（final，不能重写）
public void layout(int l, int t, int r, int b) {
    // 1. 记录旧位置
    int oldL = mLeft;
    int oldT = mTop;
    int oldB = mBottom;
    int oldR = mRight;
    
    // 2. 设置新位置
    setFrame(l, t, r, b);
    
    // 3. 调用 onLayout（View 为空实现，ViewGroup 必须实现）
    onLayout(changed, l, t, r, b);
}

// ViewGroup 需要实现 onLayout
abstract class ViewGroup {
    protected abstract fun onLayout(
        changed: Boolean,
        l: Int, t: Int, r: Int, b: Int
    )
}
```

### 3.2 自定义 Layout 示例

```kotlin
// 简单的 FlowLayout 实现
class FlowLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : ViewGroup(context, attrs) {
    
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        val childCount = childCount
        var lineWidth = 0
        var lineHeight = 0
        var currentX = paddingLeft
        var currentY = paddingTop
        
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (child.visibility == GONE) continue
            
            val childWidth = child.measuredWidth
            val childHeight = child.measuredHeight
            
            // 判断是否需要换行
            if (currentX + childWidth + paddingRight > width) {
                // 换行
                currentX = paddingLeft
                currentY += lineHeight
                lineWidth = 0
                lineHeight = 0
            }
            
            // 设置子 View 位置
            child.layout(currentX, currentY, currentX + childWidth, currentY + childHeight)
            
            // 更新状态
            currentX += childWidth
            lineWidth = maxOf(lineWidth, childWidth)
            lineHeight = maxOf(lineHeight, childHeight)
        }
    }
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        
        var maxWidth = 0
        var totalHeight = 0
        var currentLineWidth = 0
        var currentLineHeight = 0
        
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (child.visibility == GONE) continue
            
            measureChild(child, widthMeasureSpec, heightMeasureSpec)
            
            val childWidth = child.measuredWidth
            val childHeight = child.measuredHeight
            
            if (currentLineWidth + childWidth > measuredWidth - paddingLeft - paddingRight) {
                // 换行
                maxWidth = maxOf(maxWidth, currentLineWidth)
                totalHeight += currentLineHeight
                currentLineWidth = 0
                currentLineHeight = 0
            }
            
            currentLineWidth += childWidth
            currentLineHeight = maxOf(currentLineHeight, childHeight)
        }
        
        // 最后一行
        maxWidth = maxOf(maxWidth, currentLineWidth)
        totalHeight += currentLineHeight
        
        setMeasuredDimension(
            maxWidth + paddingLeft + paddingRight,
            totalHeight + paddingTop + paddingBottom
        )
    }
}
```

---

## 四、Draw 绘制阶段

### 4.1 draw() 方法完整流程

```kotlin
// View.draw() 完整流程（6 步）
fun draw(canvas: Canvas) {
    // 1. 绘制背景
    drawBackground(canvas)
    
    // 2. 绘制内容（onDraw）
    if (!verticalEdgesOnly) {
        onDraw(canvas)
    }
    
    // 3. 绘制子 View（仅 ViewGroup）
    dispatchDraw(canvas)
    
    // 4. 绘制装饰（如滚动条）
    onDrawForeground(canvas)
    
    // 5. 绘制边缘效果（OverScroll）
    drawDefaultEdgeEffect(canvas)
    
    // 6. 保存恢复状态
}
```

### 4.2 自定义 View 绘制示例

```kotlin
// 自定义圆形进度条
class CircleProgressView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {
    
    // 画笔
    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.GRAY
        style = Paint.Style.STROKE
        strokeWidth = 10f
    }
    
    private val progressPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLUE
        style = Paint.Style.STROKE
        strokeWidth = 10f
        strokeCap = Paint.Cap.ROUND
    }
    
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        textSize = 40f
        textAlign = Paint.Align.CENTER
    }
    
    // 进度
    private var progress: Int = 0
    private val rectF = RectF()
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        // 确保是正方形
        val size = minOf(measuredWidth, measuredHeight)
        setMeasuredDimension(size, size)
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        val centerX = width / 2f
        val centerY = height / 2f
        val radius = (minOf(width, height) / 2f) - bgPaint.strokeWidth
        
        // 1. 绘制背景圆
        rectF.set(
            centerX - radius,
            centerY - radius,
            centerX + radius,
            centerY + radius
        )
        canvas.drawArc(rectF, 0f, 360f, false, bgPaint)
        
        // 2. 绘制进度圆弧
        val sweepAngle = (progress / 100f) * 360f
        canvas.drawArc(rectF, -90f, sweepAngle, false, progressPaint)
        
        // 3. 绘制文字
        val text = "$progress%"
        val textY = centerY - (textPaint.descent() + textPaint.ascent()) / 2
        canvas.drawText(text, centerX, textY, textPaint)
    }
    
    // 设置进度
    fun setProgress(progress: Int) {
        this.progress = progress.coerceIn(0, 100)
        invalidate()  // 触发重绘
    }
}
```

### 4.3 自定义 ViewGroup 绘制子 View

```kotlin
// 自定义 ViewGroup 的 draw 流程
class CustomLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : ViewGroup(context, attrs) {
    
    override fun dispatchDraw(canvas: Canvas) {
        // 1. 绘制子 View 前的准备工作
        canvas.save()
        
        // 2. 调用父类绘制子 View
        super.dispatchDraw(canvas)
        
        // 3. 绘制子 View 后的内容（如分隔线）
        drawDividers(canvas)
        
        canvas.restore()
    }
    
    private fun drawDividers(canvas: Canvas) {
        val dividerPaint = Paint().apply {
            color = Color.GRAY
            strokeWidth = 2f
        }
        
        for (i in 0 until childCount - 1) {
            val child = getChildAt(i)
            canvas.drawLine(
                child.right.toFloat(),
                child.top.toFloat(),
                child.right.toFloat(),
                child.bottom.toFloat(),
                dividerPaint
            )
        }
    }
}
```

---

## 五、invalidate 与 requestLayout

### 5.1 区别对比

| 方法 | 触发阶段 | 使用场景 | 性能消耗 |
|------|---------|---------|---------|
| **invalidate()** | Draw | 内容变化（颜色、文字） | 低 |
| **requestLayout()** | Measure + Layout | 尺寸/位置变化 | 高 |

### 5.2 正确使用示例

```kotlin
class MyView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    
    private var textColor: Int = Color.BLACK
    private var textSize: Float = 16f
    private var viewWidth: Int = 100
    private var viewHeight: Int = 100
    
    // 只改变内容，调用 invalidate()
    fun setTextColor(color: Int) {
        textColor = color
        invalidate()  // 只触发 onDraw
    }
    
    // 改变文字大小，可能需要重新测量
    fun setTextSize(size: Float) {
        textSize = size
        requestLayout()  // 触发 onMeasure + onLayout + onDraw
        invalidate()
    }
    
    // 改变 View 尺寸
    fun setViewSize(width: Int, height: Int) {
        viewWidth = width
        viewHeight = height
        layoutParams = layoutParams.apply {
            this.width = width
            this.height = height
        }
        requestLayout()
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val paint = Paint().apply {
            color = textColor
            textSize = this@MyView.textSize
        }
        canvas.drawText("Hello", 0f, 50f, paint)
    }
}
```

---

## 六、性能优化

### 6.1 过度绘制优化

```kotlin
// ❌ 问题：多层背景叠加
class BadView : View() {
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)  // 父类可能绘制背景
        drawBackground(canvas)  // 又绘制一次背景
        drawContent(canvas)
    }
}

// ✅ 优化：移除不必要的背景
class GoodView : View() {
    init {
        // 如果不需要背景，设置为 null
        setBackground(null)
    }
    
    override fun onDraw(canvas: Canvas) {
        // 直接绘制内容
        drawContent(canvas)
    }
}
```

### 6.2 减少 onDraw 中的对象创建

```kotlin
// ❌ 错误：每次 onDraw 都创建对象
class BadView : View() {
    override fun onDraw(canvas: Canvas) {
        val paint = Paint()  // 每次都创建
        val rect = Rect()    // 每次都创建
        // ...
    }
}

// ✅ 正确：复用对象
class GoodView : View() {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val rect = Rect()
    private val path = Path()
    
    override fun onDraw(canvas: Canvas) {
        // 直接使用已创建的对象
        canvas.drawRect(rect, paint)
    }
}
```

### 6.3 ViewStub 延迟加载

```xml
<!-- 布局文件 -->
<ViewStub
    android:id="@+id/stub_loading"
    android:layout="@layout/layout_loading"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```

```kotlin
// 代码中使用
val viewStub = findViewById<ViewStub>(R.id.stub_loading)
viewStub.setOnInflateListener { stub, inflated ->
    // 初始化 inflated View
}
val loadingView = viewStub.inflate()  // 按需加载
```

---

## 七、面试核心考点

### 7.1 基础问题

**Q1: View 绘制流程的三个阶段？**

**A:**
1. **Measure**: 从根 View 开始，递归测量所有子 View 的宽高
2. **Layout**: 确定每个 View 在父容器中的位置
3. **Draw**: 绘制 View 的内容、子 View、装饰等

**Q2: MeasureSpec 的三种模式？**

**A:**
- **UNSPECIFIED**: 无限制，ScrollView 中的子 View
- **EXACTLY**: 精确值，match_parent 或具体数值
- **AT_MOST**: 最大值，wrap_content

**Q3: invalidate() 和 requestLayout() 的区别？**

**A:**
- `invalidate()`: 只触发 `onDraw()`，用于内容变化
- `requestLayout()`: 触发 `onMeasure()` → `onLayout()` → `onDraw()`，用于尺寸/位置变化

### 7.2 进阶问题

**Q4: 如何自定义 View？**

**A:**
```kotlin
class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    
    // 1. 初始化画笔等
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    
    // 2. 解析自定义属性
    init {
        context.obtainStyledAttributes(attrs, R.styleable.CustomView).apply {
            // 读取属性
        }.recycle()
    }
    
    // 3. 重写 onMeasure（处理 wrap_content）
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // 解析 MeasureSpec
        // 计算实际尺寸
        setMeasuredDimension(width, height)
    }
    
    // 4. 重写 onDraw（绘制内容）
    override fun onDraw(canvas: Canvas) {
        // 绘制逻辑
    }
    
    // 5. 提供设置方法
    fun setData(data: Data) {
        // 更新数据
        invalidate()
    }
}
```

**Q5: ViewGroup 的绘制流程？**

**A:**
1. `measureChildren()`: 测量所有子 View
2. `onLayout()`: 确定子 View 位置（抽象方法，必须实现）
3. `dispatchDraw()`: 绘制子 View
4. `draw()`: 绘制自己和装饰

**Q6: View 的事件分发与绘制流程的关系？**

**A:**
- 事件分发在绘制之前完成
- `dispatchTouchEvent()` → `onInterceptTouchEvent()` → `onTouchEvent()`
- 只有可见且可点击的 View 才会接收事件

### 7.3 性能优化问题

**Q7: 如何优化 View 绘制性能？**

**A:**
1. **减少过度绘制**: 移除不必要的背景
2. **减少对象创建**: 在 `onDraw` 外创建 Paint、Rect 等
3. **使用 ViewStub**: 延迟加载不常用的 View
4. **合并绘制操作**: 减少 `invalidate()` 调用
5. **使用硬件加速**: `setLayerType(LAYER_TYPE_HARDWARE, null)`
6. **优化布局层级**: 使用 `ConstraintLayout`、`<merge>` 标签

**Q8: 如何检测过度绘制？**

**A:**
- 开发者选项 → 调试 GPU 过度绘制
- 颜色含义：
  - 无色：无过度绘制
  - 蓝色：1 次过度绘制
  - 绿色：2 次
  - 粉色：3 次
  - 红色：4 次及以上

---

## 八、实战代码模板

### 8.1 自定义 View 完整模板

```kotlin
class CustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {
    
    // 画笔
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        style = Paint.Style.FILL
    }
    
    // 自定义属性
    private var customColor: Int = Color.BLACK
    private var customSize: Float = 100f
    
    init {
        // 解析自定义属性
        context.obtainStyledAttributes(attrs, R.styleable.CustomView, defStyleAttr, 0).apply {
            customColor = getColor(R.styleable.CustomView_customColor, Color.BLACK)
            customSize = getDimension(R.styleable.CustomView_customSize, 100f)
            recycle()
        }
    }
    
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val widthMode = MeasureSpec.getMode(widthMeasureSpec)
        val widthSize = MeasureSpec.getSize(widthMeasureSpec)
        val heightMode = MeasureSpec.getMode(heightMeasureSpec)
        val heightSize = MeasureSpec.getSize(heightMeasureSpec)
        
        var width = when (widthMode) {
            MeasureSpec.EXACTLY -> widthSize
            MeasureSpec.AT_MOST -> (customSize + paddingLeft + paddingRight).toInt().coerceAtMost(widthSize)
            else -> customSize.toInt()
        }
        
        var height = when (heightMode) {
            MeasureSpec.EXACTLY -> heightSize
            MeasureSpec.AT_MOST -> (customSize + paddingTop + paddingBottom).toInt().coerceAtMost(heightSize)
            else -> customSize.toInt()
        }
        
        setMeasuredDimension(width, height)
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        paint.color = customColor
        canvas.drawCircle(width / 2f, height / 2f, customSize / 2, paint)
    }
    
    // 提供设置方法
    fun setCustomColor(color: Int) {
        customColor = color
        invalidate()
    }
    
    fun setCustomSize(size: Float) {
        customSize = size
        requestLayout()
    }
}
```

### 8.2 attrs.xml 定义

```xml
<!-- res/values/attrs.xml -->
<resources>
    <declare-styleable name="CustomView">
        <attr name="customColor" format="color" />
        <attr name="customSize" format="dimension" />
    </declare-styleable>
</resources>
```

### 8.3 布局使用

```xml
<!-- layout.xml -->
<com.example.CustomView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    app:customColor="@color/blue"
    app:customSize="100dp" />
```

---

## 九、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| View 绘制三阶段 | ⭐⭐ | Measure→Layout→Draw |
| MeasureSpec 模式 | ⭐⭐⭐ | UNSPECIFIED/EXACTLY/AT_MOST |
| invalidate vs requestLayout | ⭐⭐ | onDraw vs onMeasure+onLayout |
| 自定义 View 步骤 | ⭐⭐⭐ | onMeasure+onDraw+自定义属性 |
| ViewGroup 绘制流程 | ⭐⭐⭐ | dispatchDraw+onLayout |
| 过度绘制优化 | ⭐⭐⭐⭐ | 减少背景、复用对象 |
| ViewStub 使用 | ⭐⭐ | 延迟加载 |
| 硬件加速 | ⭐⭐⭐ | setLayerType |

---

**📚 参考资料**
- [Android Developers - Custom Views](https://developer.android.com/guide/topics/ui/custom-components)
- [View 源码分析](https://juejin.cn/post/xxxx)
- [Android 性能优化](https://github.com/xxx)

**🔗 下一篇**: [事件分发机制](03_事件分发机制.md)
