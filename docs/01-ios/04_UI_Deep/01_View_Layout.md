# 01 - View 基础与布局引擎

## 目录

1. [UIView 底层原理](#1-uiview-底层原理)
2. [图层系统（Core Animation）](#2-图层系统core-animation)
3. [视图层次与渲染管线](#3-视图层次与渲染管线)
4. [布局引擎详解](#4-布局引擎详解)
5. [AutoLayout 机制](#5-autolayout-机制)
6. [约束优先级详解](#6-约束优先级详解)
7. [StackView 原理](#7-stackview-原理)
8. [SnapticK 声明式布局](#8-snapkit-声明式布局)
9. [布局性能分析](#9-布局性能分析)
10. [面试考点汇总](#10-面试考点汇总)

---

## 1. UIView 底层原理

### 1.1 UIView 的内存布局

```
UIView 对象内存布局（64-bit）：
┌─────────────────────────────────────────────────────┐
│ NSObject isa 指针（指向 UIView 的 Class 对象）       │
├─────────────────────────────────────────────────────┤
│ UIView 私有关联对象（weak reference list 等）         │
├─────────────────────────────────────────────────────┤
│ CALayer *layer（强引用，UIView 的 layer 代理）       │
│ view.layer == layer 为 true（关联对象代理模式）       │
├─────────────────────────────────────────────────────┤
│ CGRect _frame（布局框架，等价于 layer.frame 但不直接 │
│ 关联，UIView 通过 setNeedsLayout 触发布局更新）       │
├─────────────────────────────────────────────────────┤
│ CGRect _bounds（局部坐标系）                         │
├─────────────────────────────────────────────────────┤
│ CGPoint _center（中心点）                            │
├─────────────────────────────────────────────────────┤
│ CGFloat _transform（仿射变换矩阵）                   │
├─────────────────────────────────────────────────────┤
│ CGFloat _alpha, _opacity, _transform、_contentScale │
├─────────────────────────────────────────────────────┤
│ NSString *_restorationIdentifier                    │
├─────────────────────────────────────────────────────┤
│ UIView 私有 ivars（系统内部管理，不暴露）            │
└─────────────────────────────────────────────────────┘

关键结论：
- UIView 只是 CALayer 的代理层，本身不存储像素数据
- UIView 的渲染完全委托给 layer（CALayer）
- UIView.frame 与 layer.frame 通过关联属性同步
```

### 1.2 UIView vs CALayer 的本质区别

```
┌──────────────┬──────────────────┬─────────────────────┐
│    维度       │     UIView       │    CALayer          │
├──────────────┼──────────────────┼─────────────────────┤
│ 继承关系     │ UIResponder      │ NSObject            │
│ 核心职责     │ 事件响应+渲染代理 │ 像素渲染            │
│ 像素存储     │ ❌ 不存储         │ ✅  backingStore    │
│ 事件处理     │ ✅                │ ❌                  │
│ 层级管理     │ ✅ 通过 superview │ ✅ 通过 superlayer  │
│ 动画支持     │ ✅ 隐式动画代理   │ ✅ 隐式动画          │
│ 创建方式     │ [[UIView alloc]  │ [[CALayer alloc]    │
│              │ initWithFrame:]  │                     │
├──────────────┼──────────────────┼─────────────────────┤
│ 性能         │ 有 responder 链开销 │ 纯渲染，更轻量     │
│ 适用场景     │ UI 组件           │ 自定义渲染/粒子      │
└──────────────┴──────────────────┴─────────────────────┘
```

### 1.3 UIView 的生命周期方法

```swift
// UIView 生命周期完整流程
class MyView: UIView {
    
    // 1. 初始化（代码创建时调用）
    override init(frame: CGRect) {
        super.init(frame: frame)
        print("1. init(frame:) - 内存分配完成")
        // ✅ 适合：设置基础属性、初始化数据
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        print("1. init(coder:) - XIB/Storyboard 加载")
    }
    
    // 2. 布局前 - 第一次
    override func awakeFromNib() {
        super.awakeFromNib()
        print("2. awakeFromNib - XIB/Storyboard 加载后")
        // ✅ 适合：XIB 组件的初始化（只在 XIB 时调用）
    }
    
    // 3. 布局前 - 尺寸已确定
    override func prepareForReuse() {
        super.prepareForReuse()
        print("3. prepareForReuse - Cell 复用准备")
        // ✅ 适合：TableViewCell/CollectionViewCell 的复用清理
    }
    
    // 4. 添加超视图后
    override func didAddSubview(_ subview: UIView) {
        super.didAddSubview(subview)
        print("4. didAddSubview - 子视图已添加")
    }
    
    // 5. 布局前 - 可修改 frame
    override func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        print("5. willMove - 即将移动")
    }
    
    // 6. 布局前 - 可修改 frame
    override func layoutSubviews() {
        super.layoutSubviews()
        print("6. layoutSubviews - 布局完成（可重写）")
        // ✅ 适合：调整子视图的 frame
        // 注意：可能被多次调用，需做 diff
    }
    
    // 7. 首次布局完成
    override func draw(_ rect: CGRect) {
        super.draw(rect)
        print("7. draw - 绘制（CoreGraphics）")
        // ⚠️ 不推荐重写，使用 CoreGraphics 绘制开销大
        // 现代方案：CAShapeLayer + UIBezierPath
    }
    
    // 8. 布局完成
    override func layoutIfNeeded() {
        super.layoutIfNeeded()
        print("8. layoutIfNeeded - 布局完成（触发）")
    }
    
    // 9. 设置动画约束
    override func updateConstraints() {
        super.updateConstraints()
        print("9. updateConstraints - 约束更新")
        // ✅ 适合：修改约束，但不常用
    }
}
```

---

## 2. 图层系统（Core Animation）

### 2.1 CALayer 架构

```
Core Animation 图层树：
┌────────────────────────────────────────────────────┐
│                    CALayer (根图层)                 │
│                  （window的layer）                  │
├────────────────────────────────────────────────────┤
│           superlayer（父图层）                      │
│           一个图层有且只有一个 superlayer            │
├────────────────────────────────────────────────────┤
│           sublayers（子图层数组）                    │
│           可嵌套任意层，形成图层树                   │
├────────────────────────────────────────────────────┤
│           渲染相关属性：                           │
│           • backgroundColor                      │
│           • borderWidth / borderColor            │
│           • cornerRadius / masksToBounds          │
│           • shadow* / shadowPath                │
│           • contents（CGImage）                  │
│           • contentsScale（@2x/@3x 适配）         │
├────────────────────────────────────────────────────┤
│           变换相关属性：                           │
│           • transform（CATransform3D）           │
│           • sublayerTransform                      │
│           • anchorPoint / position / bounds       │
└────────────────────────────────────────────────────┘

CALayer 渲染流程：
┌───────────┐    ┌─────────────┐    ┌───────────────┐    ┌──────────────┐
│ CALayer   │───▶│ CATransaction│──▶│ 提交到CADisplay │──▶│ CADisplayLink │
│ (创建/更新)│   │ (事务管理)   │    │ (60fps/120fps) │    │ (帧同步)     │
└───────────┘    └─────────────┘    └───────────────┘    └──────────────┘
     │                  │                    │                   │
     ▼                  ▼                    ▼                   ▼
  属性设置          批处理/事务           渲染指令            vsync 信号
```

### 2.2 隐式动画机制

```swift
// Core Animation 的默认隐式动画
@objc class MyLayer: CALayer {
    override init() {
        super.init()
        
        // 触发隐式动画的关键：
        // 修改可动画的属性 → 自动添加默认 CATransition
        
        // 可动画的属性：
        // ✅ bounds / position / frame（frame 会触发 bounds+position）
        // ✅ opacity / alpha
        // ✅ backgroundColor / borderColor
        // ✅ cornerRadius
        // ✅ shadow*
        // ✅ transform
        // ✅ contents
        
        // 不可动画的属性：
        // ❌ sublayers（需要手动添加/移除动画）
        // ❌ masksToBounds
        // ❌ borderWidth
        // ❌ 需要设置 actionForKey 禁用
        
        print("默认动画时长：\(self.action(forKey: "bounds")?.duration ?? "N/A")")
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // 重写 action(forKey:) 控制动画行为
    override func action(forKey event: String) -> CAAction? {
        switch event {
        case "backgroundColor":
            // 自定义淡入动画
            let anim = CABasicAnimation(keyPath: "backgroundColor")
            anim.duration = 0.3
            anim.fromValue = UIColor.white.cgColor
            anim.toValue = UIColor.red.cgColor
            return anim
        case "bounds":
            // 禁用 bounds 动画
            return nil
        default:
            // 使用默认行为
            return super.action(forKey: event)
        }
    }
}

// 动画类型对比：
// CABasicAnimation：单一属性变化（位置/大小/颜色）
// CAKeyframeAnimation：关键帧路径动画
// CATransition：过渡动画（fade/slide/rotate/ripple 等）
// CAAnimationGroup：多动画组合
```

### 2.3 图层类型速查

```swift
// 常用 CALayer 子类：
//
// CAScrollLayer    — 滚动支持
// CATiledLayer     — 平铺渲染（大图片/地图）
// CALayer          — 基础层（自定义渲染）
// CAGradientLayer  — 渐变背景（性能比 UIImageView 好）
// CAShapeLayer     — 矢量形状（贝塞尔路径）
// CAGlassLayer     — iOS 15+ 毛玻璃效果
// CAEmitterLayer   — 粒子系统
// CAReplicatorLayer — 复制图层（涟漪效果/频谱）
// CAEAGLLayer      — OpenGL ES 渲染
// CVOpenGLESTexture — 视频帧渲染
//
// 使用建议：
// - 渐变：用 CAGradientLayer（GPU 渲染，比 CG 快 10x+）
// - 描边/圆角：用 CAShapeLayer（避免离屏渲染）
// - 动画：用 Core Animation（GPU 合成，不阻塞主线程）
// - 自定义图形：用 UIGraphicsImageRenderer（离屏渲染）
```

---

## 3. 视图层次与渲染管线

### 3.1 渲染管线全链路

```
iOS 渲染管线（完整流程）：
┌──────────────────────────────────────────────────────────────┐
│ 第 1 阶段：布局（Layout Phase）                              │
│                                                              │
│  1. setNeedsLayout() 标记需要布局                            │
│  2. 等待下一个 runloop 的 update 事件                         │
│  3. 调用 layoutIfNeeded() / layoutSubviews()                  │
│  4. 递归调用 subviews.layoutSubviews()                        │
│  5. 计算每个 view 的 frame/bounds（AutoLayout 求解）           │
│  6. 将 frame 同步到 layer.frame                               │
│                                                              │
│  触发方式：                                                   │
│  • setNeedsLayout() — 标记，延迟到下一次 runloop               │
│  • layoutIfNeeded() — 强制立即执行                            │
│  • UIView.animate() — 隐式触发                               │
│                                                              │
│  耗时：通常 16ms 以内（60fps），超时会掉帧                     │
├──────────────────────────────────────────────────────────────┤
│  第 2 阶段：绘制（Draw Phase）                               │
│                                                              │
│  1. drawHierarchy(in:) / draw(_:)                           │
│  2. 递归调用 subviews 的 draw                                 │
│  3. 每个 view 的 layer 的 draw                                │
│  4. CGImage 绘制到 backingStore（位图）                       │
│                                                              │
│  触发方式：                                                   │
│  • 需要 content 为 nil（自动绘制）                            │
│  • 手动重写 draw(_:) 方法（不推荐）                           │
│  • UIGraphicsBeginImageContext()                            │
│                                                              │
│  ⚠️ 注意：draw 阶段在主线程执行，非常耗时！                    │
│  ✅ 替代方案：使用 CAShapeLayer / 预渲染图片                  │
├──────────────────────────────────────────────────────────────┤
│  第 3 阶段：提交（Commit Phase）                             │
│                                                              │
│  1. 将所有 layer 合成指令提交到 CADisplayLink                  │
│  2. CATransaction.commit() — 批量提交                        │
│  3. 等待 VSync 信号（60fps/120fps）                          │
│  4. GPU 执行合成指令（离屏渲染/混合/裁切）                     │
│  5. 输出到屏幕                                                │
│                                                              │
│  💡 关键点：                                                  │
│  • 合成阶段在 GPU 执行，不阻塞主线程                          │
│  • 离屏渲染会在 CPU 创建临时缓冲区，性能下降 5-10x             │
└──────────────────────────────────────────────────────────────┘

完整时序图：
Frame 1 (0ms)     Frame 2 (16.67ms)   Frame 3 (33.33ms)
┌────────┐        ┌────────┐           ┌────────┐
│布局      │──▶    │布局      │──▶       │布局      │
│绘制      │──▶    │绘制      │──▶       │绘制      │
│提交      │──▶    │提交      │──▶       │提交      │
└────────┘        └────────┘           └────────┘
                     ▲                      ▲
                  VSync（GPU 合成）       VSync（GPU 合成）
```

### 3.2 离屏渲染（Off-Screen Rendering）深度分析

```swift
// ⚠️ 离屏渲染 = 性能杀手
// 原理：GPU 无法在当前渲染帧处理，需要创建新的缓冲区

// 触发离屏渲染的情况：
// 1. layer.masksToBounds = true / clipsToBounds = true
// 2. layer.cornerRadius > 0（且未使用 CAShapeLayer）
// 3. layer.shadow* 属性（阴影）
// 4. layer.shouldRasterize = true
// 5. CGPath 复杂路径（CAShapeLayer）
// 6. 模糊效果 / 混合模式

// 检测离屏渲染：
// 1. Instruments → Core Animation → Color Off-screen Rendered
// 2. 红色 = 离屏渲染，绿色 = 正常

// 优化方案对比表：
```

| 问题 | 原因 | 传统方案 | 现代方案 | 性能提升 |
|------|------|--|--|--|
| 圆角 | `masksToBounds=true` | 用 CAShapeLayer 替代 | 使用 `layer.mask` + UIBezierPath | 5-10x |
| 阴影 | shadowPath 未设置 | 预渲染 shadowImage | 设置 `shadowPath` 为 CGPath | 3-5x |
| 圆角+阴影 | 两者同时触发 | 分别优化 | 用 CAShapeLayer + shadowPath | 5-8x |
| 裁剪圆角 | clipsToBounds | 使用 `layer.mask` | 使用 `UIGraphicsImageRenderer` 预渲染 | 3-5x |

```swift
// ✅ 最佳实践：圆角优化
extension UIView {
    // 方法 1：使用 CAShapeLayer（推荐 ✅✅）
    func setCornerRadius(_ radius: CGFloat) {
        layer.cornerRadius = radius
        layer.mask = CAShapeLayer()
        let maskPath = UIBezierPath(roundedRect: bounds, cornerRadius: radius)
        (layer.mask as? CAShapeLayer)?.path = maskPath.path
    }
    
    // 方法 2：使用 UIBezierPath（适合动态圆角）
    func setCornerRadiusWithMask(_ radius: CGFloat) {
        let path = UIBezierPath(roundedRect: bounds, cornerRadius: radius)
        let maskLayer = CAShapeLayer()
        maskLayer.path = path.cgPath
        layer.mask = maskLayer
    }
    
    // 方法 3：预渲染为图片（适合固定圆角 + 复杂背景）
    func preRenderAsImage() -> UIImage {
        let renderer = UIGraphicsImageRenderer(bounds: bounds)
        return renderer.image { ctx in
            drawHierarchy(in: bounds, afterScreenUpdates: true)
        }
    }
}

// ✅ 最佳实践：阴影优化
extension UIView {
    func setShadow(offset: CGSize, color: UIColor, opacity: Float, radius: CGFloat) {
        layer.shadowOffset = offset
        layer.shadowColor = color.cgColor
        layer.shadowOpacity = opacity
        layer.shadowRadius = radius
        // ⚠️ 关键：设置 shadowPath，避免离屏渲染！
        let path = UIBezierPath(rect: bounds.insetBy(dx: 0, dy: 0))
        layer.shadowPath = path.cgPath
    }
}
```

---

## 4. 布局引擎详解

### 4.1 布局系统架构

```
┌───────────────────────────────────────────────────────────────┐
│                    iOS 布局引擎架构                             │
├───────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│   UIView      │   │ NSLayoutConstraint │   │ NSLayoutConstraint │   │
│   (框架)      │──▶│   约束求解器    │──▶│   AutoLayout引擎  │   │
│   _frame      │   │ (Engine)       │   │ (布局传递)        │   │
│   _bounds     │   │                │   │                    │   │
│   _center     │   │ 输入:           │   │ 输出:              │   │
│               │   │ • NSLayoutConstraint 对象      │   │ • 最终 frame 值         │   │
│               │   │ • NSLayoutConstraint 优先级      │   │ • 布局完成通知        │   │
│               │   │ • NSLayoutConstraint 状态      │   │                    │   │
└───────────────┘   └──────────────────────────────┘   └────────────────────┘
         │                      │                            │
         ▼                      ▼                            ▼
   视图层级           约束求解器              布局传递（自上而下→自下而上）
   UIView            NSLayoutConstraint  Engine            layoutSubviews
                      Engine              Engine
```

### 4.2 AutoLayout 核心组件

```swift
// NSLayoutConstraint 是 AutoLayout 的核心类
// 它定义了两个视图之间的线性关系：

// NSLayoutConstraint 的构成要素：
/*
    NSLayoutConstraint(
        item: viewA,           // 被约束的视图
        attribute: .top,       // 约束属性（top/left/width等）
        relatedBy: .equal,     // 关系（>= <= ==）
        toItem: viewB,         // 目标视图（nil = 超级视图/参考系）
        attribute: .topMargin, // 目标属性
        multiplier: 1.0,       // 乘数系数
        constant: 20.0         // 偏移常量
    )
    
    // 简化理解：viewA.top = viewB.top * multiplier + constant
    // 例：viewA.top = viewB.top * 1.0 + 20.0 → viewA 顶部在 viewB 顶部下方 20pt
*/

// NSLayoutConstraint 的状态机：
//   NSLayoutPriorityHigh  = 1000（必需）
//   NSLayoutPriorityWindowSizeStayable = 999（系统窗口大小保持）
//   NSLayoutPriorityFittingSizeLayout = 50（压缩优先级）
//   NSLayoutPriorityDefaultLow = 251（默认低优先级）
//   NSLayoutPriorityRequired = 1000（必须满足）
//   NSLayoutPriorityDefaultHigh = 750（默认高优先级）

// NSLayoutConstraint 的求解过程：
// 1. 收集所有约束 → NSLayoutConstraint 对象数组
// 2. 构建约束图（Constraint Graph）：
//    每个约束是有向边，视图是节点
// 3. 求解线性方程组（使用高斯消元法等）
// 4. 处理优先级（优先级低的约束在冲突时让步）
// 5. 输出每个视图的最终 frame
// 6. 通过 setNeedsLayout → layoutSubviews 应用到 UIView
```

### 4.3 布局传递流程

```
AutoLayout 布局传递（双遍算法）：

第一遍：自上而下（Forward Pass）— 确定约束
┌───────────────────────────────────┐
│  UIWindow                            │
│  ┌───────────────────────────────┐ │
│  │  ViewController.view              │ │
│  │  ┌────────────────────────────┐ │ │
│  │  │  NavigationBar              │ │ │
│  │  │  ┌────────────────────────┐ │ │ │
│  │  │  │  Content View             │ │ │ │
│  │  │  │  ┌───────────────────┐ │ │ │ │
│  │  │  │  │  TableView          │ │ │ │ │
│  │  │  │  │  ┌───────────────┐ │ │ │ │ │
│  │  │  │  │  │  Cell[0]        │ │ │ │ │
│  │  │  │  │  │  Cell[1]        │ │ │ │ │
│  │  │  │  │  └─────────────────┘ │ │ │ │
│  │  │  │  └──────────────────────┘ │ │ │
│  │  └──────────────────────────────┘ │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

第二遍：自下而上（Backward Pass）— 确定尺寸
┌───────────────────────────────────┐
│  Cell[0]（返回 intrinsicContentSize）  │
│  Cell[1]（返回 intrinsicContentSize）  │
│  TableView（根据 cells 累加高度）       │
│  Content View（根据 TableView 布局）   │
│  ViewController.view                  │
│  Window（根据 view 布局）             │
└────────────────────────────────────────┘

最终结果：每个视图都有了确定的 frame
```

---

## 5. AutoLayout 机制

### 5.1 创建约束的 4 种方式

```swift
// 方式 1：NSLayoutConstraint（代码创建）
// 精确控制，但代码冗长
let constraint = NSLayoutConstraint(
    item: viewA,
    attribute: .top,
    relatedBy: .equal,
    toItem: viewB,
    attribute: .top,
    multiplier: 1.0,
    constant: 20.0
)
view.addConstraint(constraint)

// 方式 2：NSLayoutConstraint.activate()（批量激活）
let constraints = [
    viewA.topAnchor.constraint(equalTo: viewB.topAnchor, constant: 20),
    viewA.leadingAnchor.constraint(equalTo: viewB.leadingAnchor, constant: 10),
    viewA.trailingAnchor.constraint(equalTo: viewB.trailingAnchor, constant: -10),
    viewA.heightAnchor.constraint(equalTo: viewB.heightAnchor, multiplier: 0.5)
]
NSLayoutConstraint.activate(constraints)

// 方式 3：VFL（Visual Format Language）
// 简洁但可读性差，已不推荐
let views = ["viewA": viewA, "viewB": viewB]
let constraints = NSLayoutConstraint.constraints(
    withVisualFormat: "V:|-[viewA]-[viewB]-|",
    options: [],
    metrics: nil,
    views: views
)

// 方式 4：NSLayoutAnchor（现代推荐 ✅）
// 类型安全，链式调用，自动推断约束关系
viewA.topAnchor.constraint(equalTo: viewB.topAnchor, constant: 20).isActive = true
viewA.leadingAnchor.constraint(equalTo: viewB.leadingAnchor, constant: 10).isActive = true
viewA.trailingAnchor.constraint(equalTo: viewB.trailingAnchor, constant: -10).isActive = true
viewA.heightAnchor.constraint(equalTo: viewB.heightAnchor, multiplier: 0.5).isActive = true

// 方式 5：UIStackView（声明式）
let stack = UIStackView(arrangedSubviews: [viewA, viewB])
stack.axis = .vertical
stack.spacing = 10
stack.distribution = .fillEqually
```

### 5.2 约束优先级系统

```swift
// 约束优先级详解（按重要性排序）

/*
┌─────────────────────────────────────────────┐
│                    优先级层级                    │
├──────────────────────────────────────────────┤
│  1000 (Required)         — 必须满足             │
│     • 内容压缩/内容伸展优先级                   │
│     • 系统默认约束                             │
├──────────────────────────────────────────────┤
│   750 (High)              — 默认高优先级         │
│     • UIView 默认约束                           │
│     • NSLayoutConstraint.defaultHigh           │
├──────────────────────────────────────────────┤
│   500 (Medium)            — 中间优先级           │
│     • 手动设置的中等优先级                       │
├──────────────────────────────────────────────┤
│   251 (Low)               — 默认低优先级         │
│     • NSLayoutConstraint.defaultLow            │
│     • 内容压缩优先级                           │
├──────────────────────────────────────────────┤
│    1 (Lowest)             — 最低优先级           │
│     • 自定义最低优先级                          │
└──────────────────────────────────────────────┘

约束冲突时的处理规则：
1. 高优先级约束优先满足
2. 相同优先级：先添加的约束优先
3. 相同优先级+同时添加：系统随机选择一个约束作为"winner"
4. 冲突必须解决：否则触发断言崩溃（fatal error）
*/

// 优先级应用场景：

// 场景 1：可变间距（低优先级间距约束）
leadingConstraint.priority = .defaultLow  // 允许压缩
// 这样当空间不足时，间距会先被压缩而不是裁剪内容

// 场景 2：等高（低优先级高度约束）
heightConstraint.priority = .defaultLow  // 允许压缩
// 当内容高度可变时，高度约束不强制等高等

// 场景 3：优先填充（高优先级拉伸约束）
widthConstraint.priority = .defaultHigh  // 优先拉伸
// 优先满足宽度，再处理高度
```

---

## 6. StackView 原理

### 6.1 UIStackView 内部机制

```swift
/*
UIStackView 的工作原理：

┌───────────────────────────────────────────┐
│               UIStackView                   │
│                                           │
│  arrangedSubviews = [                    │
│    view0（intrinsic width: 100）          │
│    view1（intrinsic width: 150）          │
│    view2（intrinsic width: 200）          │
│  ]                                        │
│                                           │
│  axis = .horizontal → 水平排列             │
│  spacing = 10（子视图之间的间距）            │
│  distribution = .fill → 填满剩余空间         │
│  alignment = .fill → 对齐方式               │
│  layoutMargins = UIEdgeInsets                │
│  axisLayoutMargins（垂直方向间距）           │
│                                           │
│  计算过程：                                  │
│  1. 收集所有 arrangedSubviews 的尺寸         │
│  2. 根据 axis 计算主轴/交叉轴尺寸            │
│  3. 根据 distribution 分配剩余空间           │
│  4. 根据 spacing 设置子视图间距               │
│  5. 生成 NSLayoutConstraint 并添加            │
│  6. 触发布局传递（layoutSubviews）           │
└───────────────────────────────────────────┘

distribution 模式对比：
┌───────┬──────────────────┬───────────────────────────┐
│ 模式   │  描述             │  适用场景                   │
├───────┼──────────────────┼───────────────────────────┤
│ fill   │ 填满剩余空间       │ 等分布局（最常见）           │
│ equalSpacing │ 等间距      │ 子视图尺寸固定               │
│ fillProportionally │ 按尺寸比例│ 内容不等宽度的列表           │
│ equalCentering │ 等中心间距  │ 中间留白场景                 │
└───────┴──────────────────┴───────────────────────────┘
*/

// StackView 的高级用法：
extension UIStackView {
    
    // 动态添加子视图（自动创建约束）
    func addArrangedSubview(_ view: UIView) {
        super.addArrangedSubview(view)
        // 自动创建约束：
        // view.leadingAnchor == self.layoutMarginsGuide.leadingAnchor
        // view.trailingAnchor == self.layoutMarginsGuide.trailingAnchor
        // view.topAnchor == self.arrangedSubviews.last?.bottomAnchor + spacing
    }
    
    // 移除子视图（自动移除约束）
    func removeArrangedSubview(_ view: UIView) {
        super.removeArrangedSubview(view)
        // 注意：不会 removeFromSuperview，只是移除约束
        view.removeFromSuperview()  // 需要手动调用
    }
    
    // 插入子视图到指定位置
    func insertArrangedSubview(_ view: UIView, at stackIndex: Int) {
        super.insertArrangedSubview(view, at: stackIndex)
    }
}
```

### 6.2 StackView 常见坑

```swift
// ❌ 坑 1：StackView 内的子视图约束优先级问题
// StackView 内部会自动管理子视图的约束
// 不要在 StackView 子视图上设置 leading/trailing 约束
// StackView 会覆盖你设置的约束！

// 正确做法：只在子视图上设置 width/height 约束
button.widthAnchor.constraint(equalToConstant: 100).isActive = true  // ✅
button.leadingAnchor.constraint(equalTo: view.leadingAnchor).isActive = true  // ❌ StackView 会管理

// ❌ 坑 2：contentCompressionResistancePriority 冲突
// StackView 中子视图的压缩优先级会冲突
// 解决：设置合理的 compression resistance 优先级
label.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

// ❌ 坑 3：StackView 不处理 intrinsicContentSize 的动态变化
// 当子视图内容变化导致尺寸变化时，StackView 不会自动更新
// 解决：调用 setNeedsLayout() + layoutIfNeeded()
```

---

## 7. SnapKit 声明式布局

```swift
// SnapKit 是 AutoLayout 的 DSL 封装，简化约束编写
// 原理：在内部转换为 NSLayoutConstraint

import SnapKit

class MyViewController: UIViewController {
    
    let title = UILabel()
    let button = UIButton()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(title)
        view.addSubview(button)
        
        // 声明式约束（可读性极高）
        title.snp.makeConstraints { make in
            make.top.equalTo(view.safeAreaLayoutGuide).offset(20)
            make.left.equalTo(view.snp.left).offset(16)
            make.right.equalTo(view.snp.right).offset(-16)
        }
        
        button.snp.makeConstraints { make in
            make.top.equalTo(title.snp.bottom).offset(16)
            make.centerX.equalTo(view.snp.centerX)
            make.width.equalTo(120)
            make.height.equalTo(44)
        }
    }
}

// SnapKit 优势：
// • 类型安全（编译期检查约束属性类型）
// • 链式调用（代码更紧凑）
// • 自动处理约束激活/失效
// • 支持更新约束（updateConstraints）
// • 支持约束失效（removeConstraints）
// • 支持约束调试（printLogOnFail）
```

---

## 8. 布局性能分析

### 8.1 常见布局性能瓶颈

```
布局性能问题排查清单：

┌───────┬──────────────────────┬───────────────┬──────────┐
│ 问题   │ 产生原因              │ 检测方式       │ 解决方案  │
├───────┼──────────────────────┼───────────────┼──────────┤
│ 约束过多│ 一个视图上约束>10      │ 调试器/日志   │ 合并约束  │
│ 约束冲突│ 多约束冲突无法求解      │ 崩溃日志      │ 修复优先级│
│ 频繁布局│ 循环触发 setNeedsLayout│ Instruments   │ 避免重复  │
│ 离屏渲染│ cornerRadius/shadow    │ CA Color Offscreen │ CAShapeLayer│
│ 复杂约束│ 嵌套约束/循环约束      │ 调试器警告      │ 简化约束  │
│ 动态约束│ 运行时频繁修改约束      │ 性能分析      │ 预定义约束│
│ 惯性布局│ large contents size 缓存未命中│ 调试器     │ 设置intrinsicSize│
└───────┴──────────────────────┴───────────────┴──────────┘
```

### 8.2 布局性能优化策略

```swift
// 优化策略（按优先级排序）：

// 1. 减少约束数量（最有效的优化）
// 每个视图的约束数量控制在 5-8 个以内
// 合并多个约束为一个（如用 multiplier 代替多个 constant）

// 2. 避免嵌套 StackView
// 嵌套 StackView 会创建大量隐式约束
// 替代方案：使用 AutoLayout 直接约束

// 3. 使用 prefersStatusBarUpdateAnimation
// 避免在布局过程中触发状态栏更新

// 4. 预渲染静态内容
// 静态背景/图标等预渲染为图片（避免每帧重新绘制）

// 5. 减少 draw(_:) 调用
// 使用 CoreGraphics 绘制的视图放在后台渲染

// 6. 使用 UIView.performWithoutAnimation
// 在代码中修改布局时避免触发动画
UIView.performWithoutAnimation {
    view.frame = newFrame
}

// 7. 约束复用（TableView/CollectionView）
// 复用单元格时，约束不需要重新创建
// NSLayoutConstraint 对象可复用

// 8. 使用 AutoResizing（Autoresizing）
// 简单场景用 autoresizingMask 比 AutoLayout 快 5-10x
// 适合：简单的相对位置调整
```

---

## 9. 面试题汇总

### 高频面试题

**Q1: UIView 和 CALayer 的本质区别是什么？为什么 UIView 需要 layer？**

**答**：
- UIView 继承自 UIResponder，负责事件响应和渲染代理
- CALayer 是实际存储像素数据的层，负责渲染
- UIView 通过 `layer` 代理与 CALayer 关联（关联对象模式）
- UIView 的渲染完全委托给 layer，自身不存储任何像素数据
- UIView 的优势：可以响应事件、管理层级关系、处理手势

**Q2: 离屏渲染的产生原因和优化方案？**

**答**：
- **产生原因**：GPU 无法在当前渲染帧处理，需要创建新的缓冲区
- **触发条件**：masksToBounds/clipsToBounds、cornerRadius（非 CAShapeLayer）、shadow、复杂混合模式、模糊效果
- **检测**：Instruments → Core Animation → Color Off-screen Rendered（红色 = 离屏）
- **优化**：
  - 圆角：用 CAShapeLayer + mask 替代
  - 阴影：设置 shadowPath 避免离屏
  - 预渲染：静态内容用 UIGraphicsImageRenderer
  - 避免同时使用圆角 + 阴影 + 裁剪

**Q3: AutoLayout 的求解过程？**

**答**：
1. 收集所有 NSLayoutConstraint 对象
2. 构建约束图（视图为节点，约束为边）
3. 求解线性方程组（高斯消元法）
4. 处理优先级（高优先级优先满足，低优先级让步）
5. 输出每个视图的最终 frame
6. 通过 layoutSubviews 应用到 UIView
7. 双遍算法：自上而下确定约束 → 自下而上确定尺寸

**Q4: StackView 的工作原理？有哪些坑？**

**答**：
- 内部通过自动创建 NSLayoutConstraint 实现
- 遍历 arrangedSubviews 计算尺寸并分配
- **坑**：子视图上设置 leading/trailing 会被覆盖、压缩优先级冲突、动态内容不自动更新

**Q5: 如何优化列表的布局性能？**

**答**：
- 减少约束数量（5-8 个以内）
- 预计算 intrinsicContentSize
- 使用 Content Size Category 缓存
- 避免在布局回调中修改约束
- 复用约束对象而非每次创建新约束
- 复杂单元格使用 draw 替代 AutoLayout

---

## 10. 参考资源

- [Apple: UIView Class Reference](https://developer.apple.com/documentation/uikit/uiview)
- [Apple: CALayer Class Reference](https://developer.apple.com/documentation/quartzcore/calayer)
- [Apple: NSLayoutConstraint Class Reference](https://developer.apple.com/documentation/uikit/nslayoutconstraint)
- [NSHipster: UIView](https://nshipster.com/uiview)
- [NSHipster: NSLayoutConstraint](https://nshipster.com/nslayoutconstraint)
- [WWDC 2018: Auto Layout Essentials](https://developer.apple.com/videos/play/wwdc2018/218)
- [WWDC 2019: Advanced Auto Layout Techniques](https://developer.apple.com/videos/play/wwdc2019/226)
- [Core Animation Programming Guide](https://developer.apple.com/documentation/quartzcore/core_animation)
