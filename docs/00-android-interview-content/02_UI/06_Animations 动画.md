# 06_Animations 动画详解

## 一、Android 动画体系

### 1.1 动画分类

Android 提供了多种动画实现方式：

| 动画类型 | 说明 | 适用场景 |
|---------|----|--------|
| View Animation（补间动画） | 改变视图属性，但不改变实际位置 | 简单视觉效果 |
| Property Animation（属性动画） | 真正改变对象属性 | 复杂的动画效果 |
| Transition（转场动画） | 场景之间的过渡 | 页面跳转动画 |
| Lottie | 矢量动画 | 复杂的插画动画 |

### 1.2 动画发展历史

```
Android 1.0-2.x: 只有 View Animation
Android 3.0: 引入 Property Animation
Android 5.0: 引入 Transition Framework
现在：推荐使用 Property Animation + Transition
```

---

## 二、View Animation（补间动画）

### 2.1 四种补间动画

View Animation 提供四种基础动画类型：

| 类型 | 说明 | 属性 |
|-----|----|-----|
| Translate | 平移 | x, y, xDelta, yDelta |
| Rotate | 旋转 | fromDegrees, toDegrees, pivotX, pivotY |
| Scale | 缩放 | fromX, toX, fromY, toY, pivotX, pivotY |
| Alpha | 透明度 | fromAlpha, toAlpha (0-1) |

### 2.2 XML 定义动画

#### 2.2.1 平移动画

```xml
<!-- res/anim/translate_anim.xml -->
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:fillAfter="true"
    android:interpolator="@android:anim/accelerate_interpolator">

    <translate
        android:fromXDelta="0%"
        android:toXDelta="100%"
        android:fromYDelta="0%"
        android:toYDelta="0%"
        android:duration="1000"
        android:repeatCount="0"
        android:repeatMode="restart"/>

</set>
```

#### 2.2.2 旋转动画

```xml
<!-- res/anim/rotate_anim.xml -->
<rotate
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromDegrees="0"
    android:toDegrees="360"
    android:pivotX="50%"
    android:pivotY="50%"
    android:duration="2000"
    android:repeatCount="infinite"
    android:interpolator="@android:anim/linear_interpolator"/>
```

#### 2.2.3 缩放动画

```xml
<!-- res/anim/scale_anim.xml -->
<scale
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromXScale="1.0"
    android:toXScale="1.5"
    android:fromYScale="1.0"
    android:toYScale="1.5"
    android:pivotX="50%"
    android:pivotY="50%"
    android:duration="500"
    android:repeatCount="1"
    android:repeatMode="reverse"/>
```

#### 2.2.4 透明度动画

```xml
<!-- res/alpha/alpha_anim.xml -->
<alpha
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromAlpha="1.0"
    android:toAlpha="0.0"
    android:duration="1000"
    android:interpolator="@android:anim/anticipate_interpolator"/>
```

### 2.3 组合动画

```xml
<!-- res/anim/combined_anim.xml -->
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:ordering="together">  <!-- together: 同时执行，sequence: 顺序执行 -->

    <translate
        android:fromXDelta="0%"
        android:toXDelta="100%"
        android:duration="1000"/>

    <alpha
        android:fromAlpha="1.0"
        android:toAlpha="0.0"
        android:duration="1000"/>

    <rotate
        android:fromDegrees="0"
        android:toDegrees="360"
        android:pivotX="50%"
        android:pivotY="50%"
        android:duration="1000"/>

</set>
```

### 2.4 代码使用

```java
// 加载动画
Animation animation = AnimationUtils.loadAnimation(context, R.anim.translate_anim);

// 启动动画
view.startAnimation(animation);

// 监听动画状态
animation.setAnimationListener(new Animation.AnimationListener() {
    @Override
    public void onAnimationStart(Animation animation) {
        // 动画开始
    }

    @Override
    public void onAnimationEnd(Animation animation) {
        // 动画结束
    }

    @Override
    public void onAnimationRepeat(Animation animation) {
        // 动画重复
    }
});
```

### 2.5 插值器（Interpolator）

```java
// 系统内置插值器
AccelerateInterpolator     // 加速
DecelerateInterpolator     // 减速
AccelerateDecelerateInterpolator  // 先加速后减速
LinearInterpolator         // 线性
BounceInterpolator         // 弹跳
OvershootInterpolator      // 超出
AnticipateInterpolator     // 回弹
AnticipateOvershootInterpolator  // 回弹 + 超出

// 使用
animation.setInterpolator(new OvershootInterpolator());
```

### 2.6 补间动画的局限

```
1. 不改变 View 的实际位置，只改变视觉效果
2. 点击事件仍然在原始位置
3. 对于复杂动画支持不足
```

---

## 三、Property Animation（属性动画）

### 3.1 概述

属性动画是 Android 3.0 引入的新一代动画框架，真正改变对象的属性值。

```
Property Animation 核心类:
├── ValueAnimator - 值动画器（基础类）
├── ObjectAnimator - 对象属性动画器
├── AnimatorSet - 动画组合
└── TypeEvaluator - 类型评估器
```

### 3.2 ValueAnimator 基本使用

```java
// 创建值动画器
ValueAnimator animator = ValueAnimator.ofInt(0, 100);

// 设置动画时长
animator.setDuration(1000);

// 设置更新监听
animator.addUpdateListener(new AnimatorUpdateListener() {
    @Override
    public void onAnimationUpdate(ValueAnimator animation) {
        int value = (int) animation.getAnimatedValue();
        textView.setText(String.valueOf(value));
    }
});

// 启动动画
animator.start();
```

### 3.3 ValueAnimator 高级用法

#### 3.3.1 多段动画

```java
// 定义关键帧
IntValueAnimator.AnimatorListener listener = new AnimatorListener() {
    @Override
    public void onAnimationEnd(Animator animation) {
        // 动画结束
    }
};

ValueAnimator animator = ValueAnimator.ofInt(0, 50, 100);
animator.setDuration(2000);
animator.addUpdateListener(animation -> {
    int value = (int) animation.getAnimatedValue();
    textView.setText(String.valueOf(value));
});
animator.start();
```

#### 3.3.2 自定义类型动画

```java
// 定义颜色动画
ValueAnimator colorAnimator = ValueAnimator.ofObject(
    new ArgbEvaluator(),
    Color.RED,
    Color.BLUE
);

colorAnimator.setDuration(1000);
colorAnimator.addUpdateListener(animation -> {
    Integer color = (Integer) animation.getAnimatedValue();
    view.setBackgroundColor(color);
});
colorAnimator.start();
```

#### 3.3.3 自定义评估器

```java
// 自定义 Point 评估器
public class PointEvaluator implements TypeEvaluator<Point> {
    @Override
    public Point evaluate(float fraction, Point startValue, Point endValue) {
        float x = startValue.x + (endValue.x - startValue.x) * fraction;
        float y = startValue.y + (endValue.y - startValue.y) * fraction;
        return new Point(x, y);
    }
}

// 使用
ValueAnimator animator = ValueAnimator.ofObject(
    new PointEvaluator(),
    new Point(0, 0),
    new Point(100, 100)
);

animator.addUpdateListener(animation -> {
    Point point = (Point) animation.getAnimatedValue();
    // 使用 point
});
```

### 3.4 ObjectAnimator 使用

ObjectAnimator 是 ValueAnimator 的子类，可以直接操作对象的属性。

```java
// 基本使用
ObjectAnimator animator = ObjectAnimator.ofFloat(
    view, 
    "alpha", 
    0f, 
    1f
);
animator.setDuration(1000);
animator.start();
```

#### 3.4.1 常用属性

```java
// 透明度
ObjectAnimator.ofFloat(view, "alpha", 0f, 1f);

// 透明度
ObjectAnimator.ofFloat(view, "rotation", 0f, 360f);

// 旋转（X 轴）
ObjectAnimator.ofFloat(view, "rotationX", 0f, 180f);

// 缩放（X 轴）
ObjectAnimator.ofFloat(view, "scaleX", 1f, 2f);

// 平移（X 轴）
ObjectAnimator.ofInt(view, "translationX", 0, 100);

// 背景颜色
ObjectAnimator.ofInt(view, "backgroundColor", Color.RED, Color.BLUE);
```

#### 3.4.2 自定义属性

```java
// 自定义 View 需要支持属性动画
public class AnimatedView extends View {
    
    private float mCustomProperty = 0f;
    
    public float getCustomProperty() {
        return mCustomProperty;
    }
    
    public void setCustomProperty(float value) {
        mCustomProperty = value;
        invalidate(); // 重绘
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // 使用 mCustomProperty 绘制
    }
}

// 使用
ObjectAnimator animator = ObjectAnimator.ofFloat(
    animatedView, 
    "customProperty", 
    0f, 
    100f
);
animator.start();
```

#### 3.4.3 多属性动画

```java
// 同时动画多个属性
ObjectAnimator animator1 = ObjectAnimator.ofFloat(view, "scaleX", 1f, 2f);
ObjectAnimator animator2 = ObjectAnimator.ofFloat(view, "scaleY", 1f, 2f);

// 组合动画
AnimatorSet set = new AnimatorSet();
set.playTogether(animator1, animator2);
set.setDuration(1000);
set.start();
```

### 3.5 AnimatorSet 动画组合

```java
AnimatorSet set = new AnimatorSet();

Animator animator1 = ObjectAnimator.ofFloat(view1, "alpha", 0f, 1f);
Animator animator2 = ObjectAnimator.ofFloat(view2, "translationX", 0, 100);
Animator animator3 = ObjectAnimator.ofFloat(view3, "rotation", 0, 360);

// 顺序执行
set.play(animator1).after(animator2).after(animator3);

// 同时执行
set.playTogether(animator1, animator2, animator3);

// 一个动画结束后，另两个同时执行
set.play(animator1).with(animator2).after(animator3);

set.setDuration(2000);
set.start();
```

### 3.6 动画监听

```java
animator.addListener(new AnimatorListenerAdapter() {
    @Override
    public void onAnimationStart(Animator animation) {
        // 动画开始
    }
    
    @Override
    public void onAnimationEnd(Animator animation) {
        // 动画结束
    }
    
    @Override
    public void onAnimationCancel(Animator animation) {
        // 动画取消
    }
    
    @Override
    public void onAnimationRepeat(Animator animation) {
        // 动画重复
    }
});
```

### 3.7 动画控制器

```java
// 设置重复次数
animator.setRepeatCount(3);
animator.setRepeatCount(ValueAnimator.INFINITE); // 无限重复

// 设置重复模式
animator.setRepeatMode(ValueAnimator.RESTART);  // 重新开始
animator.setRepeatMode(ValueAnimator.REVERSE);  // 反向

// 设置动画时长
animator.setDuration(1000);

// 设置开始延迟
animator.setStartDelay(500);

// 设置插值器
animator.setInterpolator(new OvershootInterpolator());

// 暂停和恢复
animator.pause();
animator.resume();

// 取消动画
animator.cancel();

// 反向动画
animator.reverse();
```

---

## 四、转场动画（Transition）

### 4.1 Transition 框架介绍

Transition 框架是 Android 5.0 引入的场景动画框架，用于实现场景之间的平滑过渡。

```
Transition 核心类:
├── TransitionManager - 动画管理器
├── ChangeBounds - 边界变化动画
├── ChangeImageTransform - 图片变换动画
├── ChangeTransform - 变换动画
├── Fade - 淡入淡出动画
├── AutoTransition - 自动转场动画
└── TransitionListener - 动画监听
```

### 4.2 基本使用

```java
// 准备动画
TransitionManager.beginDelayedTransition(container);

// 改变场景（例如添加/删除 View）
constraintLayout.addView(newView);

// 或者改变属性
view.setVisibility(View.VISIBLE);
```

### 4.3 自定义 View 的转场

```java
// 定义可动画的属性
public class AnimatedView extends View {
    
    private static final String[] TRANSITION_PROPERTIES = {
        "myCustomProperty"
    };
    
    public static String[] getTransitionProperties() {
        return TRANSITION_PROPERTIES;
    }
    
    private float mMyCustomProperty;
    
    public float getMyCustomProperty() {
        return mMyCustomProperty;
    }
    
    public void setMyCustomProperty(float value) {
        mMyCustomProperty = value;
        invalidate();
    }
}
```

### 4.4 Activity 转场动画

```java
// Android 12+ 使用 ActivityTransitions
// Android 12- 使用传统方法

// 方法 1：使用 Theme 设置
// res/values/themes.xml
<style name="AppTheme" parent="Theme.AppCompat">
    <item name="android:windowActivityTransitions">true</item>
    <item name="android:windowEnterAnimation">@anim/slide_in</item>
    <item name="android:windowExitAnimation">@anim/slide_out</item>
</style>

// 方法 2：代码设置
overridePendingTransition(R.anim.slide_in, R.anim.slide_out);
```

### 4.5 SharedElement 转场

```xml
<!-- 页面 1 -->
<View
    android:id="@+id/sharedView"
    android:layout_width="100dp"
    android:layout_height="100dp"
    app:transitionName="sharedElement"/>

<!-- 页面 2 -->
<View
    android:id="@+id/sharedView"
    android:layout_width="200dp"
    android:layout_height="200dp"
    app:transitionName="sharedElement"/>
```

```java
// 启动转场
ActivityOptions options = ActivityOptions.makeSceneTransitionAnimation(
    this,
    sharedView, "sharedElement"
);
startActivity(intent, options.toBundle());
```

---

## 五、Lottie 动画

### 5.1 概述

Lottie 是一个支持 Android、iOS、Web 的矢量动画库，可以播放 After Effects 导出的 JSON 动画。

### 5.2 基本使用

```xml
<!-- 添加依赖 -->
// build.gradle
implementation 'com.airbnb.android:lottie:6.1.0'

<!-- 布局中使用 -->
<com.airbnb.lottie.LottieAnimationView
    android:id="@+id/lottieView"
    android:layout_width="200dp"
    android:layout_height="200dp"
    app:lottie_rawRes="@raw/loading"
    app:lottie_autoPlay="true"
    app:lottie_loop="true"/>
```

### 5.3 代码使用

```java
LottieAnimationView lottieView = findViewById(R.id.lottieView);

// 设置动画
lottieView.setAnimation(R.raw.loading);
lottieView.setAnimation("path/to/animation.json");

// 控制播放
lottieView.playAnimation();
lottieView.pauseAnimation();
lottieView.cancelAnimation();
lottieView.resumeAnimation();

// 设置循环
lottieView.setLoop(true);

// 设置进度
lottieView.setProgress(0.5f); // 50%

// 监听动画
lottieView.addAnimatorListener(new Animator.AnimatorListener() {
    @Override
    public void onAnimationEnd(Animator animation) {
        // 动画结束
    }
    // 其他方法...
});
```

### 5.4 自定义 Lottie 属性

```java
// 修改动画颜色
lottieView.setColorFilter(Color.RED, PorterDuff.Mode.SRC_IN);

// 修改动画大小
lottieView.setImageDrawable(new IconDrawable(context, R.drawable.icon));

// 修改动画速度
lottieView.setSpeed(2.0f); // 2 倍速
```

---

## 六、性能优化

### 6.1 动画性能问题

```
1. 过度绘制
2. 主线程阻塞
3. 内存泄漏
4. 频繁的 invalidate
```

### 6.2 优化技巧

#### 6.2.1 使用硬件加速

```java
// 启用硬件加速
view.setLayerType(View.LAYER_TYPE_HARDWARE, null);

// 动画完成后释放
animator.addListener(new AnimatorListenerAdapter() {
    @Override
    public void onAnimationEnd(Animator animation) {
        view.setLayerType(View.LAYER_TYPE_NONE, null);
    }
});
```

#### 6.2.2 避免过度动画

```java
// 检查 View 是否在屏幕上
if (ViewCompat.isAttachedToWindow(view)) {
    animator.start();
}
```

#### 6.2.3 缓存动画

```java
// 复用 Animator 对象
private Animator mAnimator;

private void initAnimator() {
    mAnimator = ObjectAnimator.ofFloat(view, "alpha", 0f, 1f);
    mAnimator.setDuration(1000);
}

private void startAnimation() {
    mAnimator.start();
}
```

#### 6.2.4 使用 Choreographer

```java
// 使用 Choreographer 优化动画帧率
Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
    @Override
    public void doFrame(long frameTimeNanos) {
        // 每一帧的更新逻辑
        update();
        
        // 继续下一帧
        Choreographer.getInstance().postFrameCallback(this);
    }
});
```

---

## 七、面试考点总结

### 7.1 基础知识点

#### Q1: View Animation 和 Property Animation 的区别？

**A:**
- **View Animation:** 只改变视觉效果，不改变实际属性
- **Property Animation:** 真正改变对象的属性值

#### Q2: ValueAnimator 和 ObjectAnimator 的区别？

**A:**
- **ValueAnimator:** 只生成动画值，需要手动应用到对象
- **ObjectAnimator:** 直接操作对象的属性

#### Q3: 如何实现自定义属性动画？

**A:**
1. 自定义 View，添加 get/set 方法
2. 在 set 方法中调用 invalidate()
3. 使用 ObjectAnimator 操作属性

### 7.2 进阶知识点

#### Q4: Transition 框架的原理是什么？

**A:** Transition 框架通过捕获场景的开始和结束状态，计算差异，然后自动生成过渡动画。

#### Q5: 如何优化动画性能？

**A:**
1. 使用硬件加速
2. 避免过度动画
3. 复用 Animator 对象
4. 使用 Choreographer 控制帧率
5. 动画完成后释放资源

#### Q6: Lottie 的优势是什么？

**A:**
1. 矢量动画，无损缩放
2. 文件小，加载快
3. 跨平台支持
4. 可修改颜色和大小

### 7.3 实战题目

#### Q7: 实现一个加载动画

```java
// 使用 ViewPropertyAnimator
ViewPropertyAnimator.animate(view)
    .scaleX(1.5f)
    .scaleY(1.5f)
    .alpha(0.5f)
    .setDuration(500)
    .setInterpolator(new OvershootInterpolator())
    .start();
```

#### Q8: 实现一个卡片翻转效果

```java
// 使用旋转动画
ObjectAnimator flipAnimator = ObjectAnimator.ofFloat(
    cardView,
    "rotationY",
    0f,
    180f
);
flipAnimator.setDuration(500);
flipAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
flipAnimator.start();
```

### 7.4 常见面试题

| 问题 | 考察点 | 难度 |
|-----|-------|-----|
| 动画类型对比 | 基础知识 | ⭐⭐ |
| Property Animation 原理 | 动画机制 | ⭐⭐⭐ |
| Transition 使用 | 转场动画 | ⭐⭐⭐ |
| Lottie 应用 | 动画库 | ⭐⭐ |
| 性能优化 | 实战经验 | ⭐⭐⭐⭐ |

---

## 八、总结

### 8.1 动画选择指南

| 场景 | 推荐动画 |
|-----|---------|
| 简单视觉效果 | View Animation |
| 复杂动画效果 | Property Animation |
| 页面转场 | Transition |
| 插画动画 | Lottie |
| 自定义 View 动画 | Property Animation |

### 8.2 最佳实践

- 优先使用 Property Animation
- 合理使用硬件加速
- 动画完成后释放资源
- 避免在主线程进行复杂计算
- 使用 Choreographer 控制帧率

### 8.3 学习资源

- [官方文档](https://developer.android.com/guide/topics/graphics/prop-animation)
- [Transition 详解](https://developer.android.com/training/transition)
- [Lottie 官网](https://airbnb.io/lottie/)

---

*本文档持续更新，欢迎补充和完善。*