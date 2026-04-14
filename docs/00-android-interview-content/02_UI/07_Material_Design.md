# 07_Material Design 详解

## 一、Material Design 概述

### 1.1 什么是 Material Design

Material Design 是 Google 于 2014 年发布的设计语言，旨在为所有平台提供一致的设计体验。

**核心特点：**

- **纸质隐喻:** 界面元素像纸张一样有层次感
- **动效:** 流畅的动画反馈
- **色彩:** 大胆的色彩搭配
- **排版:** 清晰的层次结构
- **间距:** 8dp 网格系统

### 1.2 Material Design 版本

| 版本 | 发布时间 | 特点 |
|-|---|----|
| Material Design 1 | 2014 | 基础规范 |
| Material Design 2 | 2019 | 引入颜色系统、更大圆角 |
| Material Design 3 | 2021 | 动态取色、暗色模式、自适应 |

### 1.3 核心概念

```
Material (材料)
  ↓
Elevation ( elevation)
  ↓
Motion (动效)
  ↓
Color & Typography (色彩与排版)
```

---

## 二、Material Components

### 2.1 添加依赖

```gradle
// build.gradle
dependencies {
    // Material Components 库
    implementation 'com.google.android.material:material:1.9.0'
    
    // Material 3 (推荐)
    implementation 'com.google.android.material:material:1.11.0'
    
    // Material 3 主题
    def material3_version = "1.2.0"
    implementation "androidx.compose.material3:material3:$material3_version"
}
```

### 2.2 常用组件

#### 2.2.1 Button 按钮

```xml
<!-- 常规按钮 -->
<com.google.android.material.button.MaterialButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Primary Button"
    app:cornerRadius="8dp"/>

<!-- 文本按钮 -->
<com.google.android.material.button.MaterialButton
    style="@style/Widget.MaterialComponents.Button.TextButton"
    android:text="Text Button"/>

<!-- Outlined 按钮 -->
<com.google.android.material.button.MaterialButton
    style="@style/Widget.MaterialComponents.Button.OutlinedButton"
    android:text="Outlined Button"/>

<!-- 带图标按钮 -->
<com.google.android.material.button.MaterialButton
    android:text="Icon Button"
    app:icon="@drawable/ic_save"
    app:iconGravity="textStart"/>
```

#### 2.2.2 TextInputLayout 输入框

```xml
<com.google.android.material.textfield.TextInputLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Email"
    app:boxBackgroundColor="@color/white"
    app:endIconMode="clear_text"
    app:startIconDrawable="@drawable/ic_email">

    <com.google.android.material.textfield.TextInputEditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="textEmailAddress"/>

</com.google.android.material.textfield.TextInputLayout>
```

#### 2.2.3 CardView 卡片

```xml
<com.google.android.material.card.MaterialCardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:cardCornerRadius="16dp"
    app:cardElevation="4dp"
    app:strokeWidth="1dp"
    app:strokeColor="@color/gray">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <ImageView
            android:layout_width="match_parent"
            android:layout_height="200dp"
            android:scaleType="centerCrop"
            android:src="@drawable/image"/>

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Title"
            android:textSize="18sp"
            android:textStyle="bold"/>

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Description text here..."
            android:textSize="14sp"/>

    </LinearLayout>

</com.google.android.material.card.MaterialCardView>
```

#### 2.2.4 FloatingActionButton 悬浮按钮

```xml
<!-- 基础 FAB -->
<com.google.android.material.floatingactionbutton.FloatingActionButton
    android:id="@+id/fab"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_gravity="bottom|end"
    android:layout_margin="16dp"
    android:src="@drawable/ic_add"
    app:backgroundTint="@color/colorPrimary"
    app:tint="@color/white"/>

<!-- Mini FAB -->
<com.google.android.material.floatingactionbutton.FloatingActionButton
    style="@style/Widget.MaterialComponents.FloatingActionButton"
    app:fabSize="mini"
    android:src="@drawable/ic_add"/>

<!-- Extended FAB -->
<com.google.android.material.extendedbutton.ExtendedFloatingActionButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Save"
    app:icon="@drawable/ic_save"/>
```

#### 2.2.5 Snackbar 提示框

```java
// 代码创建 Snackbar
Snackbar.make(anchorView, "Message text", Snackbar.LENGTH_SHORT)
    .setAction("ACTION", new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            // Action 处理
        }
    })
    .setBackgroundTint(Color.RED)
    .setActionTextColor(Color.WHITE)
    .show();

// 自定义视图
Snackbar snackbar = Snackbar.make(anchorView, R.layout.custom_snackbar);
snackbar.show();
```

#### 2.2.6 BottomNavigationView 底部导航

```xml
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottomNav"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_gravity="bottom"
    app:menu="@menu/bottom_nav_menu"
    app:labelVisibilityMode="labeled"/>
```

```xml
<!-- res/menu/bottom_nav_menu.xml -->
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/navigation_home"
        android:icon="@drawable/ic_home"
        android:title="Home"/>
    <item
        android:id="@+id/navigation_dashboard"
        android:icon="@drawable/ic_dashboard"
        android:title="Dashboard"/>
    <item
        android:id="@+id/navigation_notifications"
        android:icon="@drawable/ic_notifications"
        android:title="Notifications"/>
</menu>
```

#### 2.2.7 AppBarLayout + CollapsingToolbarLayout

```xml
<com.google.android.material.appbar.AppBarLayout
    android:layout_width="match_parent"
    android:layout_height="200dp">

    <com.google.android.material.appbar.CollapsingToolbarLayout
        android:id="@+id/collapsingToolbar"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_scrollFlags="scroll|exitUntilCollapsed"
        app:contentScrim="@color/colorPrimary"
        app:title="Title"
        app:titleCollapseMode="scale">

        <ImageView
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:src="@drawable/header_image"
            app:layout_collapseMode="parallax"/>

        <com.google.android.material.appbar.MaterialToolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:layout_collapseMode="pin"/>

    </com.google.android.material.appbar.CollapsingToolbarLayout>

</com.google.android.material.appbar.AppBarLayout>

<androidx.core.widget.NestedScrollView
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:layout_behavior="@string/appbar_scrolling_view_behavior">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Content here..."/>

</androidx.core.widget.NestedScrollView>
```

#### 2.2.8 Chip 标签

```xml
<com.google.android.material.chip.ChipGroup
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:singleSelection="true"
    app:selectionRequired="true">

    <com.google.android.material.chip.Chip
        android:text="Option 1"
        app:chipIcon="@drawable/ic_check"/>

    <com.google.android.material.chip.Chip
        android:text="Option 2"/>

    <com.google.android.material.chip.Chip
        android:text="Option 3"
        app:closeIconVisible="true"
        app:showCloseButton="true"/>

</com.google.android.material.chip.ChipGroup>
```

#### 2.2.9 Dialog 对话框

```java
// MaterialAlertDialogBuilder
new MaterialAlertDialogBuilder(context)
    .setTitle("Title")
    .setMessage("Message text...")
    .setPositiveButton("OK", (dialog, which) -> {
        // OK 处理
    })
    .setNegativeButton("Cancel", (dialog, which) -> {
        // Cancel 处理
    })
    .setNeutralButton("Neutral", null)
    .setIcon(R.drawable.ic_info)
    .show();

// 自定义 Dialog
AlertDialog dialog = new MaterialAlertDialogBuilder(context)
    .setView(R.layout.custom_dialog)
    .show();
```

#### 2.2.10 ProgressBar 进度条

```xml
<!-- 圆形进度条 -->
<com.google.android.material.progressindicator.CircularProgressIndicator
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:indeterminate="true"
    app:indicatorSize="48dp"
    app:trackThickness="4dp"/>

<!-- 线性进度条 -->
<com.google.android.material.progressindicator.LinearProgressIndicator
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:indeterminate="true"
    app:trackThickness="4dp"/>

<!-- 确定进度 -->
<com.google.android.material.progressindicator.CircularProgressIndicator
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:indeterminate="false"
    app:indicatorSize="48dp"
    app:progress="75"/>
```

#### 2.2.11 Switch 开关

```xml
<com.google.android.material.materialswitch.MaterialSwitch
    android:id="@+id/switch_compat"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Enable Feature"/>
```

#### 2.2.12 NavigationView 侧滑菜单

```xml
<com.google.android.material.navigation.NavigationView
    android:id="@+id/nav_view"
    android:layout_width="wrap_content"
    android:layout_height="match_parent"
    android:layout_gravity="start"
    app:headerLayout="@layout/nav_header"
    app:menu="@menu/nav_menu"/>
```

---

## 三、设计规范

### 3.1 色彩系统

#### 3.1.1 基础颜色定义

```xml
<!-- res/values/colors.xml -->
<resources>
    <!-- Primary 颜色 -->
    <color name="primary">#1976D2</color>
    <color name="primary_dark">#1565C0</color>
    <color name="primary_light">#42A5F5</color>
    
    <!-- Secondary 颜色 -->
    <color name="secondary">#00897B</color>
    <color name="secondary_dark">#00796B</color>
    
    <!-- 背景色 -->
    <color name="background">#FFFFFF</color>
    <color name="surface">#FAFAFA</color>
    
    <!-- 错误色 -->
    <color name="error">#B00020</color>
    
    <!-- 中性色 -->
    <color name="on_primary">#FFFFFF</color>
    <color name="on_secondary">#FFFFFF</color>
    <color name="on_background">#000000</color>
    <color name="on_surface">#000000</color>
</resources>
```

#### 3.1.2 Material 3 动态取色

```xml
<!-- Android 12+ 动态取色 -->
<resources>
    <color name="md_theme_primary">#6750A4</color>
    <color name="md_theme_onPrimary">#FFFFFF</color>
    <color name="md_theme_primaryContainer">#EADDFF</color>
    <color name="md_theme_onPrimaryContainer">#21005D</color>
    
    <color name="md_theme_secondary">#625B71</color>
    <color name="md_theme_onSecondary">#FFFFFF</color>
    <color name="md_theme_secondaryContainer">#E8DEF8</color>
    <color name="md_theme_onSecondaryContainer">#1D192B</color>
    
    <color name="md_theme_tertiary">#7D5260</color>
    <color name="md_theme_onTertiary">#FFFFFF</color>
    <color name="md_theme_tertiaryContainer">#FFD8E4</color>
    <color name="md_theme_onTertiaryContainer">#31111D</color>
</resources>
```

### 3.2 排版系统

```xml
<!-- res/values/themes.xml -->
<style name="Theme.App" parent="Theme.MaterialComponents.DayNight">
    
    <!-- Typography -->
    <item name="textAppearanceHeadline1">
        <style parent="TextAppearance.MaterialComponents.Headline1"/>
    </item>
    <item name="textAppearanceHeadline2">
        <style parent="TextAppearance.MaterialComponents.Headline2"/>
    </item>
    <item name="textAppearanceBody1">
        <style parent="TextAppearance.MaterialComponents.Body1"/>
    </item>
    <item name="textAppearanceBody2">
        <style parent="TextAppearance.MaterialComponents.Body2"/>
    </item>
    <item name="textAppearanceButton">
        <style parent="TextAppearance.MaterialComponents.Button"/>
    </item>
    
</style>
```

### 3.3 间距系统（8dp 网格）

```
基础单位：8dp
常用间距：
8dp   - 小间距
16dp  - 标准间距
24dp  - 中间距
32dp  - 大间距
48dp  - 大间距（按钮高度）
```

```xml
<!-- res/values/dimens.xml -->
<resources>
    <dimen name="spacing_tiny">4dp</dimen>
    <dimen name="spacing_small">8dp</dimen>
    <dimen name="spacing_medium">16dp</dimen>
    <dimen name="spacing_large">24dp</dimen>
    <dimen name="spacing_xlarge">32dp</dimen>
    
    <!-- 组件尺寸 -->
    <dimen name="button_height">48dp</dimen>
    <dimen name="fab_size">56dp</dimen>
    <dimen name="app_bar_height">56dp</dimen>
</resources>
```

### 3.4 Elevation 阴影层级

```
Material Design 阴影层级：
0dp   - 无阴影
1dp   - 最底层
2dp   - 卡片
3dp   - 导航栏
4dp   - 对话框
6dp   - 悬浮按钮
8dp+  - 顶层弹窗
```

```xml
<com.google.android.material.card.MaterialCardView
    app:cardElevation="4dp"
    app:cardCornerRadius="8dp">
    <!-- 内容 -->
</com.google.android.material.card.MaterialCardView>
```

---

## 四、主题系统

### 4.1 基本主题设置

```xml
<!-- res/values/themes.xml (亮色) -->
<resources>
    <style name="Theme.App" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- Primary color -->
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="colorAccent">@color/secondary</item>
        
        <!-- Status bar -->
        <item name="android:statusBarColor">@color/primary_dark</item>
        
        <!-- Navigation bar -->
        <item name="android:navigationBarColor">@color/primary_dark</item>
        
        <!-- 窗口背景 -->
        <item name="android:windowBackground">@color/surface</item>
        
        <!-- 组件样式 -->
        <item name="buttonStyle">@style/Widget.App.Button</item>
        <item name="textFieldStyle">@style/Widget.App.TextInputLayout</item>
    </style>
</resources>
```

### 4.2 暗色主题

```xml
<!-- res/values-night/themes.xml (暗色) -->
<resources>
    <style name="Theme.App" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- Primary color -->
        <item name="colorPrimary">@color/primary_light</item>
        <item name="colorPrimaryDark">@color/primary</item>
        <item name="colorAccent">@color/secondary</item>
        
        <!-- Status bar -->
        <item name="android:statusBarColor">@color/black</item>
        
        <!-- Navigation bar -->
        <item name="android:navigationBarColor">@color/black</item>
        
        <!-- 窗口背景 -->
        <item name="android:windowBackground">@color/background_dark</item>
    </style>
</resources>
```

### 4.3 Material 3 主题

```xml
<!-- res/values/themes.xml -->
<resources>
    <style name="Theme.App" parent="Theme.Material3.DayNight.NoActionBar">
        <!-- Primary colors -->
        <item name="colorPrimary">@color/md_theme_primary</item>
        <item name="colorOnPrimary">@color/md_theme_onPrimary</item>
        <item name="colorPrimaryContainer">@color/md_theme_primaryContainer</item>
        <item name="colorOnPrimaryContainer">@color/md_theme_onPrimaryContainer</item>
        
        <!-- Secondary colors -->
        <item name="colorSecondary">@color/md_theme_secondary</item>
        <item name="colorOnSecondary">@color/md_theme_onSecondary</item>
        <item name="colorSecondaryContainer">@color/md_theme_secondaryContainer</item>
        <item name="colorOnSecondaryContainer">@color/md_theme_onSecondaryContainer</item>
        
        <!-- Tertiary colors -->
        <item name="colorTertiary">@color/md_theme_tertiary</item>
        <item name="colorOnTertiary">@color/md_theme_onTertiary</item>
        <item name="colorTertiaryContainer">@color/md_theme_tertiaryContainer</item>
        <item name="colorOnTertiaryContainer">@color/md_theme_onTertiaryContainer</item>
        
        <!-- Error colors -->
        <item name="colorError">@color/md_theme_error</item>
        <item name="colorOnError">@color/md_theme_onError</item>
        
        <!-- Background -->
        <item name="android:colorBackground">@color/md_theme_background</item>
        <item name="colorOnBackground">@color/md_theme_onBackground</item>
        <item name="colorSurface">@color/md_theme_surface</item>
        <item name="colorOnSurface">@color/md_theme_onSurface</item>
    </style>
</resources>
```

### 4.4 动态取色（Android 12+）

```java
// 获取系统壁纸颜色
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    WallpaperColors colors = wallpaperManager.getWallpaperColors(
        WallpaperManager.FLAG_SYSTEM
    );
    
    int primaryColor = colors.getDominantColor();
    int secondaryColor = colors.getSecondaryColor();
    
    // 应用到主题
    updateThemeColors(primaryColor, secondaryColor);
}

// Material 3 自动处理动态取色
private void updateThemeColors(int primary, int secondary) {
    // 创建新的颜色方案
    // 应用到 UI 组件
}
```

---

## 五、Motion Layout 动效

### 5.1 BasicMotionLayout

```xml
<!-- res/layout/motion_layout.xml -->
<androidx.constraintlayout.motion.widget.MotionLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:layoutDescription="@xml/motion_scene">

    <View
        android:id="@+id/view1"
        android:layout_width="100dp"
        android:layout_height="100dp"
        android:background="@color/primary"/>

    <View
        android:id="@+id/view2"
        android:layout_width="100dp"
        android:layout_height="100dp"
        android:background="@color/secondary"/>

</androidx.constraintlayout.motion.widget.MotionLayout>
```

```xml
<!-- res/xml/motion_scene.xml -->
<MotionScene xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:motion="http://schemas.android.com/apk/res-auto">

    <Transition
        motion:constraintSetStart="@+id/start"
        motion:constraintSetEnd="@+id/end"
        motion:duration="1000">

        <OnSwipe
            motion:dragDirection="dragRight"
            motion:touchAnchorId="@id/view1"/>

    </Transition>

    <ConstraintSet android:id="@+id/start">
        <Constraint
            android:id="@+id/view1"
            android:layout_width="100dp"
            android:layout_height="100dp"
            motion:layout_constraintStart_toStartOf="parent"
            motion:layout_constraintTop_toTopOf="parent"/>
    </ConstraintSet>

    <ConstraintSet android:id="@+id/end">
        <Constraint
            android:id="@+id/view1"
            android:layout_width="100dp"
            android:layout_height="100dp"
            motion:layout_constraintEnd_toEndOf="parent"
            motion:layout_constraintTop_toTopOf="parent"/>
    </ConstraintSet>

</MotionScene>
```

```java
// 代码控制动画
MotionLayout motionLayout = findViewById(R.id.motionLayout);
MotionTransition transition = motionLayout.getTransition(
    R.id.start, 
    R.id.end
);

// 启动动画
transition.start();

// 进度监听
motionLayout.addTransitionListener(new TransitionListener() {
    @Override
    public void onTransitionChange(MotionLayout motionLayout,
                                   MotionTransition transition,
                                   float progress) {
        // 动画进行中
    }

    @Override
    public void onTransitionCompleted(MotionLayout motionLayout,
                                     int currentLayoutId) {
        // 动画完成
    }
});
```

---

## 六、面试考点总结

### 6.1 基础知识点

#### Q1: Material Design 的核心概念是什么？

**A:**
1. **Material (材料):** 界面元素像纸张一样有质感
2. **Elevation (阴影):** 通过阴影表现层级关系
3. **Motion (动效):** 流畅的动画反馈
4. **Color & Typography:** 清晰的色彩和排版系统

#### Q2: Material Components 包含哪些常用组件？

**A:**
- MaterialButton
- TextInputLayout
- MaterialCardView
- FloatingActionButton
- Snackbar
- BottomNavigationView
- AppBarLayout
- Chip
- Dialog
- 等等...

#### Q3: 如何实现暗色主题？

**A:**
1. 创建 `values-night/` 目录
2. 定义暗色主题样式
3. 使用 `Theme.MaterialComponents.DayNight`

### 6.2 进阶知识点

#### Q4: Material Design 3 的新特性有哪些？

**A:**
1. **动态取色:** 从系统壁纸提取颜色
2. **自适应组件:** 根据屏幕尺寸调整布局
3. **更大的圆角**
4. **新的颜色系统**

#### Q5: 如何实现动态取色？

**A:**
1. 使用 `WallpaperManager.getWallpaperColors()`
2. 提取主色和辅色
3. 应用到主题颜色

#### Q6: MotionLayout 的优势是什么？

**A:**
1. XML 定义动画，无需代码
2. 支持多种动画效果
3. 性能优化好
4. 易于维护

### 6.3 实战题目

#### Q7: 实现一个 Material 风格的登录页面

```xml
<!-- 使用 Material Components 构建登录页面 -->
<LinearLayout
    android:orientation="vertical"
    android:padding="24dp">

    <com.google.android.material.textfield.TextInputLayout
        android:hint="Email"/>
    
    <com.google.android.material.textfield.TextInputLayout
        android:hint="Password"/>
    
    <com.google.android.material.button.MaterialButton
        android:text="Login"/>

</LinearLayout>
```

#### Q8: 实现一个底部导航的 Tab 切换效果

```java
bottomNavigationView.setItemIconTintList(ColorStateList.valueOf(
    ContextCompat.getColor(context, R.color.primary)
));

bottomNavigationView.setOnItemSelectedListener(item -> {
    switch (item.getItemId()) {
        case R.id.navigation_home:
            // 切换到 Home Fragment
            break;
        case R.id.navigation_dashboard:
            // 切换到 Dashboard Fragment
            break;
    }
    return true;
});
```

### 6.4 常见面试题

| 问题 | 考察点 | 难度 |
|-----|-------|-----|
| Material Design 理念 | 设计基础 | ⭐⭐ |
| 常用组件使用 | 实战经验 | ⭐⭐ |
| 主题切换 | 主题系统 | ⭐⭐⭐ |
| 动态取色 | 高级特性 | ⭐⭐⭐ |
| MotionLayout | 动效设计 | ⭐⭐⭐⭐ |

---

## 七、总结

### 7.1 学习路径

1. 掌握 Material Design 基本概念
2. 熟悉常用 Material Components
3. 理解主题系统设计
4. 学习 Motion Layout 动效
5. 了解 Material 3 新特性

### 7.2 最佳实践

- 使用 Material Components 代替原生组件
- 遵循 8dp 间距系统
- 合理使用阴影层级
- 支持暗色模式
- 考虑动态取色（Android 12+）

### 7.3 学习资源

- [Material Design 官方](https://m3.material.io/)
- [Material Components for Android](https://github.com/material-components/material-components-android)
- [Android Developers](https://developer.android.com/design)

---

*本文档持续更新，欢迎补充和完善。*