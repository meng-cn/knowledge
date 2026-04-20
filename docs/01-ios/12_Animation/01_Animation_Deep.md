# 01 - iOS 动画全栈

## 目录

1. [动画体系概览](#1-动画体系概览)
2. [Core Animation 架构](#2-core-animation-架构)
3. [UIView 动画](#3-uikit-动画)
4. [CAAnimation 核心](#4-caanimation-核心)
5. [CATransaction](#5-catransaction)
6. [CADisplayLink](#6-cadisplaylink)
7. [UIViewPropertyAnimator](#7-uikitproperty-animator)
8. [核心动画层级](#8-核心动画层级)
9. [动画性能优化](#9-动画性能优化)
10. [动画与 Android 对比](#10-动画与-android-对比)
11. [面试考点汇总](#11-面试考点汇总)

---

## 1. 动画体系概览

### 1.1 iOS 动画层级

```
iOS 动画体系：

┌────────────────────────────────────────────┐
│           UIView Animation                  │  ← 高级 API
│  (最易用, 最常用)                          │
├───────────────────────────────────────────┤
│         CAAnimation Subclasses              │  ← 中层 API
│  (CAKeyframeAnimation/CABasicAnimation)    │
├───────────────────────────────────────────┤
│           CATransaction                     │  ← 事务管理
│  (动画事务/提交机制)                        │
├───────────────────────────────────────────┤
│      CADisplayLink / CAAction               │  ← 底层
│  (屏幕刷新回调/图层动画)                    │
├───────────────────────────────────────────┤
│      Core Graphics / Metal                  │  ← 最底层
│  (自定义渲染)                               │
└───────────────────────────────────────────┘
```

### 1.2 动画 API 选型指南

| 场景 | 推荐 API | 复杂度 |
|---|---|---|
| 简单属性变化 | UIView.animate | ⭐ |
| 弹性/阻尼效果 | UIViewPropertyAnimator | ⭐⭐ |
| 关键帧动画 | CAKeyframeAnimation | ⭐⭐ |
| 自定义路径 | CAKeyframeAnimation + UIBezierPath | ⭐⭐⭐ |
| 物理模拟 | UIDynamicAnimator | ⭐⭐⭐ |
| 逐帧控制 | CADisplayLink + 手动更新 | ⭐⭐⭐⭐ |
| 3D/高性能 | Metal + CAEAGLLayer | ⭐⭐⭐⭐⭐ |

---

## 2. Core Animation 架构

### 2.1 渲染管线

```
Core Animation 渲染管线：

┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  CPU 线程    │    │  Display     │    │  GPU 线程     │
│  (Main Thread)│    │  Server       │    │  (Display    │
├──────────────┤    ├──────────────┤    │  Thread)     │
│              │    │              │    │              │
│ 1. 创建动画   │───→│ 2. 生成    │───→│ 3. 合成      │
│    CAAction   │    │    Render   │    │    CAContext │
│              │    │    Context    │    │              │
│ 4. 提交       │    │ 5. 提交到    │    │ 6. 刷新      │
│    CATransaction│  │    CGLayer   │    │    CADisplay │
│              │    │              │    │    Link       │
└──────────────┘    └──────────────┘    └──────────────┘

渲染线程：
• Main Thread: CA 图层树修改、动画创建
• CA Server Thread: 图层合成、变换计算
• GPU Thread: 像素渲染、屏幕刷新
```

### 2.2 CALayer 层级结构

```
CALayer 树结构：

rootLayer (UIView.layer)
├── layer1 (子视图层)
│   ├── layer1.1
│   └── layer1.2
├── layer2
│   ├── layer2.1
│   └── layer2.2
│       └── layer2.2.1
└── layer3

图层属性：
├── 变换: transform (CATransform3D)
├── 内容: contents (CGImage)
├── 背景: backgroundColor (CGColor)
├── 阴影: shadowColor/shadowOpacity/shadowPath
├── 圆角: cornerRadius
├── 边框: borderColor/borderWidth
├── 蒙版: masksToBounds/mask
├── 裁剪: cornerCurve
├── 渲染: drawsAsynchronously
└── 内容缩放: contentsScale (Retina 适配)
```

---

## 3. UIKit 动画

### 3.1 UIView.animate

```swift
// 基础动画
UIView.animate(withDuration: 0.3) {
    self.view.alpha = 0.5
    self.view.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
} completion: { finished in
    print("动画完成")
}

// 带延迟/选项
UIView.animate(withDuration: 0.5,
               delay: 0.2,
               options: [.curveEaseInOut, .allowUserInteraction],
               animations: {
    self.view.frame.origin.x += 100
}, completion: nil)

// 关键选项
// .curveEaseInOut: 缓入缓出
// .curveEaseOut: 缓出
// .curveEaseIn: 缓入
// .curveLinear: 线性
// .allowUserInteraction: 动画期间允许交互
// .beginFromCurrentState: 从当前状态开始
// .autoreverse: 动画后自动回退
```

### 3.2 Spring 弹性动画

```swift
UIView.animate(withDuration: 0.4,
               delay: 0,
               usingSpringWithDamping: 0.6,  // 0-1，值越小弹跳越大
               initialSpringVelocity: 1.0,   // 初始速度
               options: .curveEaseOut,
               animations: {
    self.view.transform = .identity
}, completion: nil)
```

### 3.3 动画组

```swift
UIView.animate(withDuration: 0.3,
               animations: {
    self.view.alpha = 0
    self.view.transform = CGAffineTransform(scaleX: 0.5, y: 0.5)
}, completion: { _ in
    UIView.animate(withDuration: 0.3, animations: {
        self.view.alpha = 1
        self.view.transform = .identity
    })
})
```

---

## 4. CAAnimation 核心

### 4.1 CAAnimation 体系

```
CAAnimation 体系：

CAAnimation (基类)
├── CABasicAnimation       // 基础动画 (单属性)
├── CAKeyframeAnimation    // 关键帧动画 (多值)
├── CAGroupAnimation       // 动画组 (组合)
└── CATransition           // 转场动画
```

### 4.2 CABasicAnimation

```swift
let animation = CABasicAnimation(keyPath: "position")
animation.fromValue = NSValue(cgPoint: CGPoint(x: 0, y: 0))
animation.toValue = NSValue(cgPoint: CGPoint(x: 100, y: 100))
animation.duration = 0.5
animation.fillMode = .forwards
animation.isRemovedOnCompletion = false
animation.delegate = self

layer.add(animation, forKey: "move")

// 常用 keyPath:
// "position" - 位置
// "bounds.size" - 大小
// "opacity" - 透明度
// "transform.rotation.z" - 旋转
// "cornerRadius" - 圆角
// "shadowOpacity" - 阴影
// "contents.rect" - 内容缩放
```

### 4.3 CAKeyframeAnimation

```swift
let keyframeAnim = CAKeyframeAnimation(keyPath: "position")

// 路径动画
let path = UIBezierPath()
path.move(to: CGPoint(x: 0, y: 0))
path.addQuadCurve(to: CGPoint(x: 300, y: 200),
                  controlPoint: CGPoint(x: 150, y: -50))
keyframeAnim.path = path.cgPath
keyframeAnim.duration = 2.0
keyframeAnim.calculationMode = .cubic  // 平滑插值
keyframeAnim.rotationMode = .rotateAuto  // 沿路径方向旋转

layer.add(keyframeAnim, forKey: "followPath")

// 常用 calculationMode:
// .linear: 线性插值
// .cubic: 平滑插值
// .discrete: 离散跳变
// .cubicPaced: 均匀速度平滑
```

### 4.4 CAAnimationDelegate

```swift
class AnimationDelegate: NSObject, CAAnimationDelegate {
    func animationDidStart(_ anim: CAAnimation) {
        print("动画开始")
    }
    
    func animationDidStop(_ anim: CAAnimation, finished flag: Bool) {
        if flag {
            print("动画完成")
            layer.position = CGPoint(x: 100, y: 100) // 固定最终位置
        }
    }
}
```

---

## 5. CATransaction

### 5.1 事务机制

```
CATransaction 机制：

┌─────────────────────────────────────────────┐
│              CATransaction                   │
├───────────┬───────────────┬────────────────┤
│  begin()  │   commit()    │   flush()      │
│  开启事务  │   提交事务     │   立即刷新     │
├───────────┼───────────────┼────────────────┤
│  setValue:│  批量提交所有  │  不等 runloop  │
│  forKey:  │  动画变更      │   就刷新       │
│ (动画属性) │              │                │
└───────────┴───────────────┴────────────────┘

// 自动事务（大多数动画场景）
UIView.animate { ... }  // 内部自动创建/提交事务

// 手动事务（需要精细控制）
CATransaction.begin()
CATransaction.setAnimationDuration(0.5)
CATransaction.setAnimationTimingFunction(CAMediaTimingFunction(name: .easeOut))
layer.opacity = 0
layer.position = CGPoint(x: 100, y: 100)
CATransaction.commit()
```

### 5.2 隐式动画

```
隐式动画（Implicit Animation）：

当修改 CALayer 的可动画属性时，自动创建 CABasicAnimation

可自动动画的属性：
├── bounds
├── position
├── opacity
├── backgroundColor
├── cornerRadius
├── transform
├── shadowColor/shadowOpacity/shadowRadius
└── contentsRect

关闭隐式动画：
CATransaction.disableActions()
layer.opacity = 0  // 立即生效，无动画

或单独关闭：
layer.actions = ["opacity": NSNull()]
```

---

## 6. CADisplayLink

```swift
// 逐帧精确控制
class FrameAnimator {
    private var displayLink: CADisplayLink?
    private var startTime: CFTimeInterval = 0
    
    func startAnimating() {
        displayLink = CADisplayLink(target: self, selector: #selector(updateFrame))
        displayLink?.add(to: .main, forMode: .common)
    }
    
    @objc func updateFrame(displayLink: CADisplayLink) {
        let elapsed = displayLink.timestamp - startTime
        // 根据时间计算动画状态
        let progress = CGFloat(elapsed / 2.0)  // 2秒动画
        self.view.alpha = 1.0 - progress
        self.view.transform = CGAffineTransform(scaleX: 1-progress, y: 1-progress)
    }
    
    func stopAnimating() {
        displayLink?.invalidate()
        displayLink = nil
    }
}

CADisplayLink 特点：
• 与屏幕刷新率同步（60/120Hz）
• 在主线程运行
• 提供精确的时间戳
• 适合逐帧动画/物理模拟
• 不消耗 CPU（无刷新时休眠）
```

---

## 7. UIViewPropertyAnimator

### 7.1 交互式动画

```swift
// UIViewPropertyAnimator 是 iOS 10+ 推荐的动画 API
let animator = UIViewPropertyAnimator(duration: 1.0,
                                      curve: .easeInOut,
                                      animations: {
    self.view.alpha = 0
    self.view.transform = CGAffineTransform(scaleX: 0.5, y: 0.5)
})

animator.addAnimations({
    self.view.transform = .identity
}, delayFactor: 0.2)

// 交互式控制
animator.startAnimation()

// 可中途修改
animator.pauseAnimation()  // 暂停
animator.continueAnimation(withTimingParameters: nil,
                           intersectionDuration: 0.5)  // 继续
animator.stopAnimation(false)  // 停止（保持当前位置）

// 弹簧动画
let springParams = UISpringTimingParameters(mass: 1,
                                             stiffness: 1000,
                                             damping: 300,
                                             initialVelocity: CMVector3D())
let springAnimator = UIViewPropertyAnimator(duration: 0,
                                            timingParameters: springParams,
                                            animations: { ... })
```

---

## 8. 核心动画层级

### 8.1 CATransition

```swift
// 页面转场效果
let transition = CATransition()
transition.duration = 0.3
transition.type = .push  // .reveal/.fade/.moveIn/.cube/.suckEffect/.oglFlip
transition.subtype = .fromRight
transition.delegate = self
view.layer.add(transition, forKey: kCATransition)
```

### 8.2 UIDynamicAnimator（物理模拟）

```swift
class PhysicsAnimator {
    private let dynamicAnimator = UIDynamicAnimator()
    private let gravity = UIGravityBehavior()
    private let collision = UICollisionBehavior()
    private let snap = UISnapBehavior()
    
    func addGravity() {
        dynamicAnimator.addBehavior(gravity)
    }
    
    func addCollision(with views: [UIView]) {
        collision.addBoundary(withIdentifier: "floor" as NSCopying,
                             from: CGPoint(x: 0, y: screenBounds.height),
                             to: CGPoint(x: screenBounds.width, y: screenBounds.height))
        for view in views {
            collision.addItem(view)
        }
        dynamicAnimator.addBehavior(collision)
    }
    
    func snapTo(view: UIView, point: CGPoint) {
        snap = UISnapBehavior(item: view, snapPoint: point)
        snap.damping = 0.5
        dynamicAnimator.addBehavior(snap)
    }
}
```

---

## 9. 动画性能优化

### 9.1 可动画属性分类

```
CALayer 属性性能分类：

┌──────────────────┬──────────────────┬─────────────────┐
│ 图层（快速）      │ 内容（中等）      │ 其他（慢速）     │
├──────────────────┼──────────────────┼─────────────────┤
│ backgroundColor  │ transform        │ shadowPath      │
│ cornerRadius     │ opacity          │ mask            │
│ bounds           │ contentStretch   │ contentsGravity │
│ hidden           │                  │                 │
│ contentsGravity  │                  │                 │
│ masksToBounds    │                  │                 │
└──────────────────┴──────────────────┴─────────────────┘

优化原则：
• 优先使用图层属性动画（无需重绘内容）
• transform 是 GPU 加速的
• shadowPath 缓存阴影，避免实时计算
```

### 9.2 常见优化手段

| 优化手段 | 说明 | 效果 |
|---|---|---|
| 使用 transform | GPU 加速 | ⭐⭐⭐ |
| 预计算 shadowPath | 避免实时计算 | ⭐⭐⭐ |
| 合并图层 | 减少绘制次数 | ⭐⭐ |
| rasterizationScale = 0 | 关闭栅格化 | ⭐⭐ |
| 减少隐式动画 | 用显式动画控制 | ⭐⭐ |
| CADisplayLink | 逐帧精确控制 | ⭐⭐ |
| 避免离屏渲染 | 少用 masksToBounds | ⭐⭐⭐ |

---

## 10. 动画与 Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 基本动画 | UIView.animate | ObjectAnimator |
| 关键帧 | CAKeyframeAnimation | ValueAnimator/PropertyAnimator |
| 弹簧动画 | UIViewPropertyAnimator | SpringAnimation (MotionLayout) |
| 属性动画 | CALayer + CAAnimation | PropertyAnimation |
| 转场 | CATransition | ActivityOptions |
| 物理模拟 | UIDynamicAnimator | Physics2D |
| 逐帧 | CADisplayLink | Choreographer |
| 动画监听 | CAAnimationDelegate | AnimatorListener/AnimatorUpdateListener |
| 自定义动画 | Core Graphics/Metal | Canvas/OpenGL/Vulkan |

---

## 11. 面试考点汇总

### 高频面试题

1. **Core Animation 的渲染线程和主线程的关系？**
   - 主线程修改图层 → CA 服务线程合成 → GPU 渲染
   - 动画创建在 CPU，合成在 GPU
   - runloop 中 commit 动画

2. **隐式动画和显式动画的区别？**
   - 隐式：修改 CALayer 属性自动触发动画
   - 显式：手动创建 CAAnimation
   - 关闭隐式：CATransaction.disableActions()

3. **如何优化动画性能？**
   - 使用 transform（GPU 加速）
   - 预计算 shadowPath
   - 合并图层减少绘制
   - 避免离屏渲染

4. **CADisplayLink 的用途？**
   - 逐帧精确控制动画
   - 与屏幕刷新率同步
   - 适合物理模拟和自定义渲染

5. **UIView.animate 和 UIViewPropertyAnimator 的区别？**
   - UIView.animate：一次性、不可暂停
   - UIViewPropertyAnimator：可暂停/恢复/交互、iOS 10+ 推荐

### 面试回答模板

> "iOS 动画分四层：UIView 动画（最常用）、CAAnimation 中层 API、CATransaction 事务管理、CADisplayLink 逐帧控制。渲染管线是 CPU 创建动画 → CA Server 合成 → GPU 渲染。性能优化关键是 transform 用 GPU、shadowPath 缓存、减少离屏渲染。"

---

*本文档对标 Android `12_Animation/` 的深度*
