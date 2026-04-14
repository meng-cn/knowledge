# 04_自定义 View 详解

## 一、自定义 View 概述

### 1.1 为什么需要自定义 View

在 Android 开发中，系统提供的 View 无法满足所有需求。自定义 View 的场景包括：

| 场景 | 说明 | 示例 |
|-----|----|------|
| 特殊样式 | 系统 View 样式不符合要求 | 自定义进度条、按钮 |
| 特殊功能 | 需要额外功能 | 可拖拽的 View、手势密码 |
| 复杂图表 | 系统没有现成的图表组件 | 折线图、柱状图、饼图 |
| 动画效果 | 需要特殊动画 | 涟漪效果、加载动画 |

### 1.2 自定义 View 的分类

```
1. 样式自定义：改变现有 View 的外观
2. 功能自定义：添加新功能或改变行为
3. 完全自定义：从头创建新的 View
```

### 1.3 自定义方式选择

```
方式一：组合现有 View
  适用：简单组合，无需复杂绘制
  
方式二：继承现有 View 并扩展
  适用：在现有功能上增加新功能
  
方式三：完全自定义 View
  适用：全新的视觉效果和功能
```

---

## 二、View 测量流程（onMeasure）

### 2.1 测量原理

View 的测量过程是通过 `onMeasure` 方法完成的，测量结果通过 `setMeasuredDimension` 设置。

```
MeasureSpec 结构：
├── mode（测量模式）
└── size（期望大小）

测量模式：
├── EXACTLY：精确模式（match_parent 或具体数值）
├── AT_MOST：最多模式（wrap_content）
└── UNSPECIFIED：未指定模式（无约束）
```

### 2.2 MeasureSpec 详解

```java
public class MeasureSpec {
    public static final int UNSPECIFIED = 0;
    public static final int EXACTLY = 1;
    public static final int AT_MOST = 2;
    
    private int specSize;
    private int specMode;
    
    // 构造 MeasureSpec
    public static int makeMeasureSpec(int size, int mode) {
        return (mode & MODE_MASK) | (size & SIZE_MASK);
    }
    
    // 获取模式
    public static int getMode(int measureSpec) {
        return measureSpec & MODE_MASK;
    }
    
    // 获取大小
    public static int getSize(int measureSpec) {
        return measureSpec & ~MODE_MASK;
    }
}
```

### 2.3 onMeasure 完整流程

```java
public class CustomView extends View {
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 1. 解析宽度 MeasureSpec
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);
        
        // 2. 解析高度 MeasureSpec
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        int heightSize = MeasureSpec.getSize(heightMeasureSpec);
        
        // 3. 根据模式计算自己的宽高
        int width;
        int height;
        
        switch (widthMode) {
            case MeasureSpec.EXACTLY:
                // 精确模式：直接使用父容器给的大小
                width = widthSize;
                break;
            case MeasureSpec.AT_MOST:
                // 最多模式：根据内容计算，但不能超过 widthSize
                width = Math.min(getDesiredWidth(), widthSize);
                break;
            case MeasureSpec.UNSPECIFIED:
                // 未指定模式：使用自己想要的宽度
                width = getDesiredWidth();
                break;
            default:
                width = widthSize;
        }
        
        switch (heightMode) {
            case MeasureSpec.EXACTLY:
                height = heightSize;
                break;
            case MeasureSpec.AT_MOST:
                height = Math.min(getDesiredHeight(), heightSize);
                break;
            case MeasureSpec.UNSPECIFIED:
                height = getDesiredHeight();
                break;
            default:
                height = heightSize;
        }
        
        // 4. 设置测量结果
        setMeasuredDimension(width, height);
    }
    
    private int getDesiredWidth() {
        // 根据内容计算理想宽度
        return CONTENT_WIDTH + padding + margin;
    }
    
    private int getDesiredHeight() {
        // 根据内容计算理想高度
        return CONTENT_HEIGHT + padding + margin;
    }
}
```

### 2.4 实际案例：自定义文本视图

```java
public class CustomTextView extends View {
    
    private String mText;
    private Paint mPaint;
    private float mTextWidth;
    private float mTextHeight;
    
    public CustomTextView(Context context) {
        super(context);
        init(context);
    }
    
    public CustomTextView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }
    
    private void init(Context context) {
        mPaint = new Paint();
        mPaint.setAntiAlias(true);
        mPaint.setTextSize(50);
        mPaint.setColor(Color.BLACK);
    }
    
    public void setText(String text) {
        mText = text;
        // 重新测量
        requestLayout();
        // 重新绘制
        invalidate();
    }
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 计算文本的宽高
        mTextWidth = mPaint.measureText(mText);
        Paint.FontMetrics fm = mPaint.getFontMetrics();
        mTextHeight = fm.descent - fm.ascent;
        
        // 添加 padding
        int width = (int) (mTextWidth + getPaddingLeft() + getPaddingRight());
        int height = (int) (mTextHeight + getPaddingTop() + getPaddingBottom());
        
        // 处理 MeasureSpec
        width = resolveSize(width, widthMeasureSpec);
        height = resolveSize(height, heightMeasureSpec);
        
        setMeasuredDimension(width, height);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // 绘制文本
        float x = getPaddingLeft();
        float y = getPaddingTop() - mPaint.getFontMetrics().ascent;
        canvas.drawText(mText, x, y, mPaint);
    }
}
```

### 2.5 自定义子 View 的测量

```java
public class CustomViewGroup extends ViewGroup {
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 1. 测量自己的 padding
        int paddingLeft = getPaddingLeft();
        int paddingRight = getPaddingRight();
        int paddingTop = getPaddingTop();
        int paddingBottom = getPaddingBottom();
        
        // 2. 测量所有子 View
        int childCount = getChildCount();
        int maxWidth = 0;
        int totalHeight = 0;
        
        for (int i = 0; i < childCount; i++) {
            View child = getChildAt(i);
            measureChild(child, widthMeasureSpec, heightMeasureSpec);
            
            // 获取子 View 的测量结果
            LayoutParams lp = (LayoutParams) child.getLayoutParams();
            int childWidth = child.getMeasuredWidth();
            int childHeight = child.getMeasuredHeight();
            
            // 累加计算
            maxWidth = Math.max(maxWidth, childWidth);
            totalHeight += childHeight + lp.topMargin + lp.bottomMargin;
        }
        
        // 3. 计算自己的大小
        int width = maxWidth + paddingLeft + paddingRight;
        int height = totalHeight + paddingTop + paddingBottom;
        
        // 4. 处理 MeasureSpec
        width = resolveSize(width, widthMeasureSpec);
        height = resolveSize(height, heightMeasureSpec);
        
        setMeasuredDimension(width, height);
    }
}
```

---

## 三、View 布局流程（onLayout）

### 3.1 布局原理

`onLayout` 方法用于确定子 View 的位置。ViewGroup 需要重写此方法来布局子 View。

```java
public class CustomViewGroup extends ViewGroup {
    
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        // changed: 是否第一次布局或大小发生变化
        // l, t, r, b: 父容器的左右上下坐标
        
        int childCount = getChildCount();
        int currentTop = getPaddingTop();
        
        for (int i = 0; i < childCount; i++) {
            View child = getChildAt(i);
            
            if (child.getVisibility() == GONE) {
                continue;
            }
            
            LayoutParams lp = (LayoutParams) child.getLayoutParams();
            int childWidth = child.getMeasuredWidth();
            int childHeight = child.getMeasuredHeight();
            
            // 计算子 View 的位置
            int left = getPaddingLeft();
            int top = currentTop + lp.topMargin;
            int right = left + childWidth;
            int bottom = top + childHeight;
            
            // 布局子 View
            child.layout(left, top, right, bottom);
            
            // 更新下一个子 View 的位置
            currentTop = bottom + lp.bottomMargin;
        }
    }
}
```

### 3.2 不同布局的 onLayout 实现

#### 3.2.1 垂直线性布局

```java
public class VerticalLayout extends ViewGroup {
    
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int childCount = getChildCount();
        int currentY = getPaddingTop();
        
        for (int i = 0; i < childCount; i++) {
            View child = getChildAt(i);
            if (child.getVisibility() == GONE) continue;
            
            LayoutParams lp = (LayoutParams) child.getLayoutParams();
            int w = child.getMeasuredWidth();
            int h = child.getMeasuredHeight();
            
            int y = currentY + lp.topMargin;
            int x = getPaddingLeft();
            
            child.layout(x, y, x + w, y + h);
            
            currentY = y + h + lp.bottomMargin;
        }
    }
}
```

#### 3.2.2 水平线性布局

```java
public class HorizontalLayout extends ViewGroup {
    
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int childCount = getChildCount();
        int currentX = getPaddingLeft();
        
        for (int i = 0; i < childCount; i++) {
            View child = getChildAt(i);
            if (child.getVisibility() == GONE) continue;
            
            LayoutParams lp = (LayoutParams) child.getLayoutParams();
            int w = child.getMeasuredWidth();
            int h = child.getMeasuredHeight();
            
            int x = currentX + lp.leftMargin;
            int y = getPaddingTop();
            
            child.layout(x, y, x + w, y + h);
            
            currentX = x + w + lp.rightMargin;
        }
    }
}
```

#### 3.2.3 居中对齐布局

```java
public class CenterLayout extends ViewGroup {
    
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int childCount = getChildCount();
        
        for (int i = 0; i < childCount; i++) {
            View child = getChildAt(i);
            if (child.getVisibility() == GONE) continue;
            
            int w = child.getMeasuredWidth();
            int h = child.getMeasuredHeight();
            
            // 居中位置
            int x = (getWidth() - w) / 2;
            int y = (getHeight() - h) / 2;
            
            child.layout(x, y, x + w, y + h);
        }
    }
}
```

---

## 四、View 绘制流程（onDraw）

### 4.1 绘制原理

`onDraw` 方法用于实际的绘制操作。通过 `Canvas`（画布）和 `Paint`（画笔）来完成绘制。

```
绘制流程：
onDraw → Canvas (画布) → Paint (画笔) → Bitmap/Shape/Text
```

### 4.2 Canvas 常用方法

```java
public class DrawingView extends View {
    
    private Paint mPaint;
    
    public DrawingView(Context context) {
        super(context);
        mPaint = new Paint();
        mPaint.setAntiAlias(true);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        // 1. 绘制线条
        canvas.drawLine(x1, y1, x2, y2, mPaint);
        
        // 2. 绘制矩形
        canvas.drawRect(left, top, right, bottom, mPaint);
        
        // 3. 绘制圆形
        canvas.drawCircle(cx, cy, radius, mPaint);
        
        // 4. 绘制椭圆
        canvas.drawOval(rect, mPaint);
        
        // 5. 绘制图片
        canvas.drawBitmap(bitmap, src, dst, mPaint);
        
        // 6. 绘制文本
        canvas.drawText(text, x, y, mPaint);
        
        // 7. 绘制路径
        canvas.drawPath(path, mPaint);
        
        // 8. 绘制九宫格图片
        canvas.drawNinePatch(bitmap, rect, mPaint);
    }
}
```

### 4.3 Paint 常用配置

```java
public class PaintConfig {
    
    public void configurePaint(Paint paint) {
        // 1. 抗锯齿
        paint.setAntiAlias(true);
        
        // 2. 设置颜色
        paint.setColor(Color.RED);
        
        // 3. 设置透明度
        paint.setAlpha(128); // 0-255
        
        // 4. 设置样式（填充/描边）
        paint.setStyle(Paint.Style.FILL);    // 填充
        paint.setStyle(Paint.Style.STROKE);  // 描边
        paint.setStyle(Paint.Style.FILL_AND_STROKE); // 两者
        
        // 5. 设置线条宽度
        paint.setStrokeWidth(10);
        
        // 6. 设置线条帽（圆角/平角/方形）
        paint.setStrokeCap(Paint.Cap.ROUND);   // 圆角
        paint.setStrokeCap(Paint.Cap.BUTT);    // 平角
        paint.setStrokeCap(Paint.Cap.SQUARE);  // 方形
        
        // 7. 设置线条连接处
        paint.setStrokeJoin(Paint.Join.ROUND); // 圆角
        paint.setStrokeJoin(Paint.Join.MITER); // 斜角
        paint.setStrokeJoin(Paint.Join.BEVEL); // 斜角
        
        // 8. 设置文本大小
        paint.setTextSize(50);
        
        // 9. 设置文本对齐方式
        paint.setTextAlign(Paint.Align.LEFT);    // 左对齐
        paint.setTextAlign(Paint.Align.CENTER);  // 居中
        paint.setTextAlign(Paint.Align.RIGHT);   // 右对齐
        
        // 10. 设置阴影
        paint.setShadowLayer(radius, dx, dy, color);
        
        // 11. 设置渐变色
        Shader shader = new LinearGradient(x1, y1, x2, y2, 
                                          color1, color2, 
                                          Shader.TileMode.CLAMP);
        paint.setShader(shader);
        
        // 12. 设置虚线
        PathEffect dashEffect = new DashPathEffect(new float[]{10, 10}, 0);
        paint.setPathEffect(dashEffect);
    }
}
```

### 4.4 渐变色绘制

```java
public class GradientView extends View {
    
    private Paint mPaint;
    private Shader mLinearShader;
    private Shader mRadialShader;
    
    public GradientView(Context context) {
        super(context);
        init(context);
    }
    
    private void init(Context context) {
        mPaint = new Paint();
        mPaint.setAntiAlias(true);
        
        // 线性渐变
        mLinearShader = new LinearGradient(
            0, 0, 1000, 1000,
            Color.RED, Color.BLUE,
            Shader.TileMode.REPEAT
        );
        
        // 径向渐变
        mRadialShader = new RadialGradient(
            500, 500, 500,
            Color.RED, Color.BLUE,
            Shader.TileMode.CLAMP
        );
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        // 设置线性渐变
        mPaint.setShader(mLinearShader);
        canvas.drawRect(0, 0, 500, 500, mPaint);
        
        // 设置径向渐变
        mPaint.setShader(mRadialShader);
        canvas.drawRect(500, 0, 1000, 500, mPaint);
        
        // 清除渐变色（避免影响后续绘制）
        mPaint.setShader(null);
    }
}
```

### 4.5 Path 路径绘制

```java
public class PathView extends View {
    
    private Paint mPaint;
    private Path mPath;
    
    public PathView(Context context) {
        super(context);
        init(context);
    }
    
    private void init(Context context) {
        mPaint = new Paint();
        mPaint.setAntiAlias(true);
        mPaint.setStyle(Paint.Style.STROKE);
        mPaint.setStrokeWidth(5);
        mPaint.setColor(Color.BLUE);
        
        mPath = new Path();
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        // 创建路径
        mPath.reset();
        
        // 移动起点
        mPath.moveTo(100, 100);
        
        // 绘制直线
        mPath.lineTo(200, 200);
        mPath.lineTo(300, 100);
        
        // 绘制贝塞尔曲线
        mPath.cubicTo(400, 0, 500, 200, 600, 100);
        
        // 绘制圆弧
        mPath.arcTo(500, 50, 700, 150, 0, 180);
        
        // 闭合路径
        mPath.close();
        
        // 绘制路径
        canvas.drawPath(mPath, mPaint);
    }
}
```

### 4.6 Matrix 矩阵变换

```java
public class MatrixView extends View {
    
    private Paint mPaint;
    private Matrix mMatrix;
    private Bitmap mBitmap;
    
    public MatrixView(Context context) {
        super(context);
        init(context);
    }
    
    private void init(Context context) {
        mPaint = new Paint();
        mPaint.setAntiAlias(true);
        mMatrix = new Matrix();
        mBitmap = BitmapFactory.decodeResource(context.getResources(), R.drawable.image);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        // 1. 平移
        mMatrix.setTranslate(100, 100);
        canvas.drawBitmap(mBitmap, mMatrix, mPaint);
        
        // 2. 缩放
        mMatrix.setScale(2.0f, 2.0f, 0, 0);
        canvas.drawBitmap(mBitmap, mMatrix, mPaint);
        
        // 3. 旋转
        mMatrix.setRotate(45, mBitmap.getWidth() / 2, mBitmap.getHeight() / 2);
        canvas.drawBitmap(mBitmap, mMatrix, mPaint);
        
        // 4. 错切
        mMatrix.setSkew(1.0f, 0);
        canvas.drawBitmap(mBitmap, mMatrix, mPaint);
        
        // 5. 组合变换
        mMatrix.setTranslate(100, 100);
        mMatrix.postRotate(45);
        mMatrix.postScale(1.5f, 1.5f);
        canvas.drawBitmap(mBitmap, mMatrix, mPaint);
    }
}
```

### 4.7 保存图片为 Bitmap

```java
public class BitmapSaveView extends View {
    
    private Paint mPaint;
    
    public BitmapSaveView(Context context) {
        super(context);
        mPaint = new Paint();
        mPaint.setAntiAlias(true);
    }
    
    public Bitmap getBitmap() {
        // 1. 创建 Bitmap
        int width = getWidth();
        int height = getHeight();
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        
        // 2. 创建 Canvas
        Canvas canvas = new Canvas(bitmap);
        
        // 3. 绘制到 Canvas
        draw(canvas);
        
        return bitmap;
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // 绘制内容
        canvas.drawRect(0, 0, getWidth(), getHeight(), mPaint);
    }
}
```

---

## 五、自定义属性

### 5.1 定义自定义属性

在 `res/values/attrs.xml` 中定义：

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 1. 声明一个 attr 集合 -->
    <declare-styleable name="CustomView">
        
        <!-- 2. 定义各种类型的属性 -->
        
        <!-- String 类型 -->
        <attr name="customText" format="string"/>
        
        <!-- Color 类型 -->
        <attr name="customColor" format="color"/>
        
        <!-- Integer 类型 -->
        <attr name="customNumber" format="integer"/>
        
        <!-- Dimension 类型 -->
        <attr name="customSize" format="dimension"/>
        
        <!-- Boolean 类型 -->
        <attr name="customVisible" format="boolean"/>
        
        <!-- Enum 枚举类型 -->
        <attr name="customMode">
            <enum name="mode1" value="0"/>
            <enum name="mode2" value="1"/>
            <enum name="mode3" value="2"/>
        </attr>
        
        <!-- Flag 标志类型 -->
        <attr name="customFlags">
            <flag name="flag1" value="0x1"/>
            <flag name="flag2" value="0x2"/>
            <flag name="flag3" value="0x4"/>
        </attr>
        
        <!-- Reference 类型 -->
        <attr name="customSrc" format="reference"/>
        
        <!-- Fraction 类型 -->
        <attr name="customFraction" format="fraction"/>
        
        <!-- 组合类型 -->
        <attr name="customAny" format="color|integer|string"/>
        
        <!-- 可引用可 theme -->
        <attr name="customDrawable" format="reference|color"/>
        
    </declare-styleable>
</resources>
```

### 5.2 获取自定义属性

```java
public class CustomView extends View {
    
    // 属性字段
    private String mCustomText;
    private int mCustomColor;
    private int mCustomNumber;
    private int mCustomSize;
    private boolean mCustomVisible;
    private int mCustomMode;
    private int mCustomFlags;
    
    public CustomView(Context context) {
        super(context);
        init(null);
    }
    
    public CustomView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs);
    }
    
    public CustomView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(attrs);
    }
    
    public CustomView(Context context, AttributeSet attrs, 
                     int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(attrs);
    }
    
    private void init(AttributeSet attrs) {
        if (attrs == null) {
            return;
        }
        
        // 获取 TypedArray
        TypedArray typedArray = context.obtainStyledAttributes(
            attrs, 
            R.styleable.CustomView
        );
        
        try {
            // 1. 获取 String
            mCustomText = typedArray.getString(R.styleable.CustomView_customText);
            
            // 2. 获取 Color
            mCustomColor = typedArray.getColor(
                R.styleable.CustomView_customColor, 
                Color.BLACK  // 默认值
            );
            
            // 3. 获取 Integer
            mCustomNumber = typedArray.getInt(
                R.styleable.CustomView_customNumber, 
                0  // 默认值
            );
            
            // 4. 获取 Dimension
            mCustomSize = typedArray.getDimensionPixelSize(
                R.styleable.CustomView_customSize, 
                dp2px(50)  // 默认值
            );
            
            // 5. 获取 Boolean
            mCustomVisible = typedArray.getBoolean(
                R.styleable.CustomView_customVisible, 
                true  // 默认值
            );
            
            // 6. 获取 Enum
            mCustomMode = typedArray.getInt(
                R.styleable.CustomView_customMode, 
                R.styleable.CustomView_mode1  // 默认值
            );
            
            // 7. 获取 Flag
            mCustomFlags = typedArray.getInt(
                R.styleable.CustomView_customFlags, 
                R.styleable.CustomView_flag1  // 默认值
            );
            
            // 8. 获取 Drawable
            Drawable drawable = typedArray.getDrawable(
                R.styleable.CustomView_customDrawable
            );
            
            // 9. 获取 Fraction
            int fraction = typedArray.getFraction(
                R.styleable.CustomView_customFraction, 
                1, 1, 1  // 默认值
            );
            
        } finally {
            // 重要：释放 TypedArray
            typedArray.recycle();
        }
    }
    
    // 判断 Flag
    public boolean hasFlag1() {
        return (mCustomFlags & R.styleable.CustomView_flag1) != 0;
    }
}
```

### 5.3 实际案例：自定义进度条

```xml
<!-- res/values/attrs.xml -->
<resources>
    <declare-styleable name="CustomProgressBar">
        <attr name="maxValue" format="integer"/>
        <attr name="progressColor" format="color"/>
        <attr name="backgroundColor" format="color"/>
        <attr name="progressHeight" format="dimension"/>
        <attr name="cornerRadius" format="dimension"/>
        <attr name="showText" format="boolean"/>
        <attr name="textColor" format="color"/>
        <attr name="textSize" format="dimension"/>
    </declare-styleable>
</resources>
```

```java
public class CustomProgressBar extends View {
    
    private int mMaxValue = 100;
    private int mProgress = 0;
    private int mProgressColor = Color.BLUE;
    private int mBackgroundColor = Color.GRAY;
    private int mProgressHeight = 20;
    private int mCornerRadius = 10;
    private boolean mShowText = false;
    private int mTextColor = Color.WHITE;
    private int mTextSize = 14;
    
    private Paint mBackgroundPaint;
    private Paint mProgressPaint;
    private Paint mTextPaint;
    
    public CustomProgressBar(Context context) {
        super(context);
        init(null);
    }
    
    public CustomProgressBar(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs);
    }
    
    private void init(AttributeSet attrs) {
        if (attrs != null) {
            TypedArray ta = context.obtainStyledAttributes(
                attrs, R.styleable.CustomProgressBar
            );
            
            mMaxValue = ta.getInteger(R.styleable.CustomProgressBar_maxValue, 100);
            mProgressColor = ta.getColor(R.styleable.CustomProgressBar_progressColor, Color.BLUE);
            mBackgroundColor = ta.getColor(R.styleable.CustomProgressBar_backgroundColor, Color.GRAY);
            mProgressHeight = ta.getDimensionPixelSize(R.styleable.CustomProgressBar_progressHeight, dp2px(20));
            mCornerRadius = ta.getDimensionPixelSize(R.styleable.CustomProgressBar_cornerRadius, dp2px(10));
            mShowText = ta.getBoolean(R.styleable.CustomProgressBar_showText, false);
            mTextColor = ta.getColor(R.styleable.CustomProgressBar_textColor, Color.WHITE);
            mTextSize = ta.getDimensionPixelSize(R.styleable.CustomProgressBar_textSize, sp2px(14));
            
            ta.recycle();
        }
        
        // 初始化画笔
        mBackgroundPaint = new Paint();
        mBackgroundPaint.setColor(mBackgroundColor);
        mBackgroundPaint.setAntiAlias(true);
        mBackgroundPaint.setStyle(Paint.Style.FILL);
        
        mProgressPaint = new Paint();
        mProgressPaint.setColor(mProgressColor);
        mProgressPaint.setAntiAlias(true);
        mProgressPaint.setStyle(Paint.Style.FILL);
        
        mTextPaint = new Paint();
        mTextPaint.setColor(mTextColor);
        mTextPaint.setTextSize(mTextSize);
        mTextPaint.setAntiAlias(true);
        mTextPaint.setTextAlign(Paint.Align.CENTER);
    }
    
    public void setProgress(int progress) {
        if (progress < 0 || progress > mMaxValue) {
            throw new IllegalArgumentException("Progress must be between 0 and " + mMaxValue);
        }
        mProgress = progress;
        invalidate();
    }
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int height = mProgressHeight + getPaddingTop() + getPaddingBottom();
        setMeasuredDimension(width, height);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        int width = getWidth();
        int height = getHeight();
        
        // 1. 绘制背景
        RectF bgRect = new RectF(getPaddingLeft(), getPaddingTop(), 
                                 width - getPaddingRight(), height - getPaddingBottom());
        canvas.drawRoundRect(bgRect, mCornerRadius, mCornerRadius, mBackgroundPaint);
        
        // 2. 绘制进度
        int progressWidth = (int) (bgRect.width() * mProgress / mMaxValue);
        RectF progressRect = new RectF(getPaddingLeft(), getPaddingTop(),
                                       getPaddingLeft() + progressWidth, height - getPaddingBottom());
        canvas.drawRoundRect(progressRect, mCornerRadius, mCornerRadius, mProgressPaint);
        
        // 3. 绘制文本
        if (mShowText) {
            String text = mProgress + "/" + mMaxValue;
            float textWidth = mTextPaint.measureText(text);
            float textHeight = mTextPaint.getFontMetrics().descent - mTextPaint.getFontMetrics().ascent;
            
            float x = width / 2f;
            float y = height / 2f + textHeight / 4f;
            
            canvas.drawText(text, x, y, mTextPaint);
        }
    }
}
```

### 5.4 使用自定义 View

```xml
<!-- 在布局中使用 -->
<com.example.CustomProgressBar
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="16dp"
    app:maxValue="100"
    app:progress="75"
    app:progressColor="#2196F3"
    app:backgroundColor="#E0E0E0"
    app:progressHeight="20dp"
    app:cornerRadius="10dp"
    app:showText="true"
    app:textColor="#FFFFFF"
    app:textSize="14sp"/>
```

---

## 六、完整自定义 View 案例

### 6.1 圆形进度条

```java
public class CircularProgressBar extends View {
    
    private int mMaxValue = 100;
    private int mProgress = 0;
    private int mProgressColor = Color.BLUE;
    private int mBackgroundColor = Color.GRAY;
    private float mStrokeWidth = 10;
    
    private Paint mBackgroundPaint;
    private Paint mProgressPaint;
    private RectF mRectF;
    
    public CircularProgressBar(Context context) {
        super(context);
        init(null);
    }
    
    public CircularProgressBar(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs);
    }
    
    private void init(AttributeSet attrs) {
        if (attrs != null) {
            TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.CircularProgressBar);
            mMaxValue = ta.getInteger(R.styleable.CircularProgressBar_maxValue, 100);
            mProgressColor = ta.getColor(R.styleable.CircularProgressBar_progressColor, Color.BLUE);
            mBackgroundColor = ta.getColor(R.styleable.CircularProgressBar_backgroundColor, Color.GRAY);
            mStrokeWidth = ta.getDimensionPixelSize(R.styleable.CircularProgressBar_strokeWidth, dp2px(10));
            ta.recycle();
        }
        
        mBackgroundPaint = new Paint();
        mBackgroundPaint.setColor(mBackgroundColor);
        mBackgroundPaint.setAntiAlias(true);
        mBackgroundPaint.setStyle(Paint.Style.STROKE);
        mBackgroundPaint.setStrokeWidth(mStrokeWidth);
        mBackgroundPaint.setStrokeCap(Paint.Cap.ROUND);
        
        mProgressPaint = new Paint();
        mProgressPaint.setColor(mProgressColor);
        mProgressPaint.setAntiAlias(true);
        mProgressPaint.setStyle(Paint.Style.STROKE);
        mProgressPaint.setStrokeWidth(mStrokeWidth);
        mProgressPaint.setStrokeCap(Paint.Cap.ROUND);
    }
    
    public void setProgress(int progress) {
        mProgress = Math.max(0, Math.min(progress, mMaxValue));
        invalidate();
    }
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 强制正方形
        int size = Math.min(
            MeasureSpec.getSize(widthMeasureSpec),
            MeasureSpec.getSize(heightMeasureSpec)
        );
        setMeasuredDimension(size, size);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        int width = getWidth();
        int height = getHeight();
        int radius = Math.min(width, height) / 2;
        float strokeWidth = mStrokeWidth / 2;
        
        // 计算内切圆
        mRectF = new RectF(strokeWidth, strokeWidth, 
                          width - strokeWidth, height - strokeWidth);
        
        // 绘制背景圆
        canvas.drawArc(mRectF, 0, 360, false, mBackgroundPaint);
        
        // 绘制进度圆
        float sweepAngle = 360f * mProgress / mMaxValue;
        canvas.drawArc(mRectF, -90, sweepAngle, false, mProgressPaint);
    }
}
```

### 6.2 波浪加载动画

```java
public class WaveLoadingView extends View {
    
    private Paint mWavePaint;
    private Path mWavePath;
    private float mWaveOffset;
    private int mWaveColor = Color.BLUE;
    private int mWaveHeight = 50;
    
    public WaveLoadingView(Context context) {
        super(context);
        init(context);
    }
    
    private void init(Context context) {
        mWavePaint = new Paint();
        mWavePaint.setColor(mWaveColor);
        mWavePaint.setAntiAlias(true);
        mWavePaint.setStyle(Paint.Style.FILL);
        
        mWavePath = new Path();
        
        // 启动动画
        startWaveAnimation();
    }
    
    private void startWaveAnimation() {
        ValueAnimator animator = ValueAnimator.ofFloat(0, getWidth());
        animator.setDuration(1000);
        animator.setRepeatCount(ValueAnimator.INFINITE);
        animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                mWaveOffset = (float) animation.getAnimatedValue();
                invalidate();
            }
        });
        animator.start();
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        int width = getWidth();
        int height = getHeight();
        
        // 清除路径
        mWavePath.reset();
        
        // 绘制波浪
        mWavePath.moveTo(0, height);
        
        for (int x = 0; x <= width; x++) {
            float y = height / 2f + (float) Math.sin((x + mWaveOffset) * Math.PI / 100f) * mWaveHeight / 2f;
            mWavePath.lineTo(x, y);
        }
        
        mWavePath.lineTo(width, height);
        mWavePath.lineTo(0, height);
        mWavePath.close();
        
        canvas.drawPath(mWavePath, mWavePaint);
    }
}
```

---

## 七、性能优化

### 7.1 避免频繁 invalidate

```java
// ❌ 避免在循环中调用 invalidate
for (int i = 0; i < count; i++) {
    updateData(i);
    invalidate();  // 每次都触发重绘
}

// ✅ 批量更新后调用一次
for (int i = 0; i < count; i++) {
    updateData(i);
}
invalidate();  // 只重绘一次
```

### 7.2 使用 computeScroll

```java
// 使用 posted Runnable 代替 timer
post(new Runnable() {
    @Override
    public void run() {
        // 更新绘制
        invalidate();
        
        // 继续下一帧
        if (shouldContinue) {
            post(this);
        }
    }
});
```

### 7.3 缓存绘制结果

```java
public class CachingView extends View {
    
    private Bitmap mCachedBitmap;
    
    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        
        // 大小改变时重建缓存
        mCachedBitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(mCachedBitmap);
        draw(canvas);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        if (mCachedBitmap != null) {
            // 直接绘制缓存的 Bitmap
            canvas.drawBitmap(mCachedBitmap, 0, 0, null);
        } else {
            // 首次绘制，生成缓存
            // ...
        }
    }
}
```

### 7.4 使用硬件加速

```java
// 启用硬件加速
setLayerType(LAYER_TYPE_HARDWARE, null);

// 动画完成后释放
@Override
protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    setLayerType(LAYER_TYPE_NONE, null);
}
```

---

## 八、面试考点总结

### 8.1 基础知识点

#### Q1: View 的绘制流程是什么？

**A:**
```
1. onMeasure - 测量大小
2. onLayout - 布局位置
3. onDraw - 绘制内容
```

#### Q2: MeasureSpec 的三种模式是什么？

**A:**
- **EXACTLY:** 精确模式，match_parent 或具体数值
- **AT_MOST:** 最多模式，wrap_content
- **UNSPECIFIED:** 未指定模式，无约束

#### Q3: 如何自定义属性？

**A:**
1. 在 attrs.xml 中定义属性
2. 使用 TypedArray 获取属性
3. 记得调用 recycle() 释放资源

### 8.2 进阶知识点

#### Q4: onMeasure 中如何正确处理 MeasureSpec？

**A:**
```java
int widthMode = MeasureSpec.getMode(widthMeasureSpec);
int widthSize = MeasureSpec.getSize(widthMeasureSpec);

int width;
switch (widthMode) {
    case MeasureSpec.EXACTLY:
        width = widthSize;
        break;
    case MeasureSpec.AT_MOST:
        width = Math.min(desiredWidth, widthSize);
        break;
    default:
        width = desiredWidth;
}
setMeasuredDimension(width, height);
```

#### Q5: Canvas 和 Paint 的关系？

**A:** Canvas 是画布，Paint 是画笔。Canvas 负责坐标系统，Paint 负责绘制样式。

#### Q6: 如何避免内存泄漏？

**A:**
1. TypedArray 记得 recycle()
2. Bitmap 记得 recycle()
3. Handler/Runnable 使用弱引用
4. 动画记得 cancel()

### 8.3 实战题目

#### Q7: 实现一个可以拖拽的圆形

```java
public class DraggableCircleView extends View {
    private float mCenterX, mCenterY;
    private float mRadius;
    private Paint mPaint;
    
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                // 检查是否在圆内
                float dx = event.getX() - mCenterX;
                float dy = event.getY() - mCenterY;
                if (Math.sqrt(dx * dx + dy * dy) <= mRadius) {
                    return true;
                }
                break;
            case MotionEvent.ACTION_MOVE:
                mCenterX = event.getX();
                mCenterY = event.getY();
                invalidate();
                break;
        }
        return true;
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        canvas.drawCircle(mCenterX, mCenterY, mRadius, mPaint);
    }
}
```

#### Q8: 实现一个饼图

```java
public class PieChartView extends View {
    private List<PieData> mDatas;
    private int mColor[];
    private Paint mPaint;
    
    public void setData(List<PieData> datas) {
        mDatas = datas;
        invalidate();
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        float total = mDatas.stream().mapToDouble(d -> d.value).sum();
        float startAngle = 0;
        
        for (int i = 0; i < mDatas.size(); i++) {
            float sweepAngle = 360f * mDatas.get(i).value / total;
            mPaint.setColor(mColor[i % mColor.length]);
            canvas.drawArc(rect, startAngle, sweepAngle, true, mPaint);
            startAngle += sweepAngle;
        }
    }
}
```

### 8.4 常见面试题

| 问题 | 考察点 | 难度 |
|-----|-------|-----|
| onMeasure 流程 | 测量原理 | ⭐⭐⭐ |
| Canvas 绘制 | 绘制基础 | ⭐⭐ |
| 自定义属性 | 属性定义 | ⭐⭐ |
| Path 路径绘制 | 复杂图形 | ⭐⭐⭐ |
| 矩阵变换 | 高级绘制 | ⭐⭐⭐⭐ |
| 性能优化 | 实战经验 | ⭐⭐⭐⭐ |

---

## 九、总结

### 9.1 自定义 View 步骤

1. 继承 View 或 ViewGroup
2. 重写 onMeasure 处理测量
3. 重写 onLayout 布局子 View（ViewGroup）
4. 重写 onDraw 进行绘制
5. 定义自定义属性
6. 提供外部接口

### 9.2 最佳实践

- 使用 Paint 时注意 setAntiAlias
- 合理使用 invalidate 和 postInvalidate
- 注意 MeasureSpec 的处理
- 自定义属性记得 recycle
- 复杂绘制考虑使用缓存

### 9.3 学习资源

- [官方文档](https://developer.android.com/guide/topics/ui/views)
- [Canvas 详解](https://developer.android.com/reference/android/graphics/Canvas)
- [Paint 详解](https://developer.android.com/reference/android/graphics/Paint)

---

*本文档持续更新，欢迎补充和完善。*