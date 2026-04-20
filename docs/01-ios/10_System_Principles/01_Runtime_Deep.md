# 01 - Runtime 深度

## 目录

1. [ObjC Runtime 架构](#1-objc-runtime-架构)
2. [消息发送机制](#2-消息发送机制)
3. [动态绑定与转发](#3-动态绑定与转发)
4. [Method Swizzling 全栈](#4-method-swizzling-全栈)
5. [分类（Category）与扩展（Extension）原理](#5-分类category与扩展extension原理)
6. [关联对象（Associated Objects）](#6-关联对象associated-objects)
7. [Protocol Witness Table](#7-protocol-witness-table)
8. [Swift Runtime](#8-swift-runtime)
9. [面试题汇总](#9-面试题汇总)

---

## 1. ObjC Runtime 架构

### 1.1 Runtime 系统概览

```
ObjC Runtime 系统架构（源码级）：
┌──────────────────────────────────────────────────────────────────────┐
│                                                              │
│  1. ObjC Runtime 核心（libobjc.A.dylib）                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  objc/runtime.h  — 公共 API                            │     │
│  │  objc/message.h    — 消息发送                           │     │
│  │  objc/objc.h      — 基础类型定义                        │     │
│  │  objc/encoding.h  — 类型编码                            │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  2. Runtime 核心组件                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Class Table        — 类缓存表                        │     │
│  │  Method Lists       — 方法列表（Method List）           │     │
│  │  Protocol Table     — 协议表（Witness Table）          │     │
│  │  Ivar List         — 实例变量列表                      │     │
│  │  Selector Table    — 选择器表                          │     │
│  │  Protocol Cache    — 协议缓存                         │     │
│  └──────────────────────────────────────────────────┘     │
│                                                              │
│  3. 数据结构                                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  objc_object    — 对象基类（isa 指针）                 │     │
│  │  objc_class     — 类描述（meta-class 元类）           │     │
│  │  Method        — 方法结构体                           │     │
│  │  Ivar          — 实例变量结构体                        │     │
│  │  Protocol      — 协议描述                             │     │
│  │  SEL           — 选择器（字符串标识符）               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  4. 内存管理                                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  retain/release    — 引用计数操作                     │     │
│  │  weak 处理         — __weak 变量自动置 nil            │     │
│  │  weak 通知         — Weak Reference Table             │     │
│  │  associative refs  — 关联对象链表                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Runtime 调用流程：                                          │
│  ┌───────────────────────────────────────────────────┐     │
│  │  1. obj.method()  — 源代码                         │     │
│  │  2. objc_msgSend(obj, @selector(method))  — 编译     │     │
│  │  3. class_getInstanceMethod(class, sel)  — 查找      │     │
│  │  4. IMP imp = method_getImplementation(method)       │     │
│  │  5. imp(obj, sel, ...)  — 执行                       │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘

运行时结构体内存布局：
┌──────────────────────────────────────────────────────┐
│  objc_object（所有对象的基类）                         │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  isa 指针（8 字节，指向 Class 对象）             │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  Class 内存布局：                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  isa          — 指向 meta-class（元类）         │   │
│  │  superclass  — 指向父类                         │   │
│  │  cache        — 方法缓存（IMP 缓存）           │   │
│  │  data (rw)  — 类数据（包含 ivar/方法/协议等）   │   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  元类（Meta-class）内存布局：                           │
│  ┌──────────────────────────────────────────────┐   │
│  │  isa          — 指向 metaclass（meta-class 的类）│   │
│  │  superclass  — 指向父类的 meta-class           │   │
│  │  cache        — 类方法缓存                       │   │
│  │  data (rw)  — 类数据（存储类方法）              │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

### 1.2 Class 的初始化过程（源码级）

```
ObjC 类加载流程（dyld 阶段）：
┌───────────────────────────────────────────────────────────┐
│  1. dyld 加载 Mach-O 文件                                    │
│     └─→ 加载所有依赖的 framework                              │
│     └─→ 解析所有符号（symbols）                               │
│     └─→ 调用所有 +load 方法（类/分类）                        │
│                                                              │
│  2. _objc_init 初始化（进程启动时）                            │
│     └─→ 初始化类缓存表（class hash table）                    │
│     └─→ 初始化方法缓存（method caches）                       │
│     └─→ 初始化 protocol 表                                   │
│     └─→ 初始化 weak 引用表                                    │
│                                                              │
│  3. 类加载（class-dump 阶段）                                 │
│     └─→ 读取 MH_OBJECT 段的 __objc_classlist 段              │
│     └─→ 为每个类创建 Class 结构体                             │
│     └─→ 解析 Class 的 Ivar List                             │
│     └─→ 解析 Class 的 Method List                            │
│     └─→ 解析 Class 的 Protocol List                           │
│     └─→ 创建 metaclass                                      │
│                                                              │
│  4. 类注册                                                   │
│     └─→ 注册到 class hash table                              │
│     └─→ 设置 super class 链                                  │
│     └─→ 初始化 class hierarchy                               │
│                                                              │
│  5. 类初始化（+initialize 方法）                              │
│     └─→ 线程安全的懒加载初始化                                │
│     └─→ 每个类只初始化一次                                    │
└─────────────────────────────────────────────────────────┘

Class 加载时序：
ObjC Class 加载流程：
┌────────┐   ┌──────────────────┐   ┌───────────────────┐   ┌─────────────┐
│ dyld    │──▶│ _objc_init       │──▶│ class-dump       │──▶│ +initialize  │
│ 加载     │   │ 初始化            │   │ 类注册            │   │ 懒初始化      │
└────────┘   └──────────────────┘   └───────────────────┘   └─────────────┘
     │              │                   │                    │
     ▼              ▼                   ▼                    ▼
  Mach-O        类缓存表            Class 结构体         线程安全
  解析            hash               创建               +initialize
```

---

## 2. 消息发送机制

### 2.1 消息发送全链路

```objc
/*
消息发送流程（源码级）：

[obj doSomething];  // 源代码
↓
objc_msgSend(obj, @selector(doSomething));  // 编译后
↓
查找 IMP（方法实现）：

┌───────────────────────────────────────────────────────┐
│ 第 1 步：查找 Class 的 method cache（缓存查找）         │
│                                                        │
│  IMP imp = class_getMethodImplementation(cls, SEL);    │
│  - 在 cache 中查找 SEL                               │
│  - 命中 → 直接返回 IMP                               │
│  - 未命中 → 进入第 2 步                              │
│                                                        │
│  cache 结构：                                          │
│  ┌─────────────────────────────────────────┐        │
│  │  _cache:                               │        │
│  │  ├── bucket[0]: SEL → IMP               │        │
│  │  ├── bucket[1]: SEL → IMP               │        │
│  │  ├── ...                               │        │
│  │  └── mask: hash mask                    │        │
│  └──────────────────────────────────────────┘        │
│                                                        │
│  第 2 步：在 Method List 中查找（线性搜索）            │
│  ┌───────────────────────────────────────────┐       │
│  │  class_getInstanceMethod(cls, SEL):       │       │
│  │  • 遍历 class 的 method list                │       │
│  │  • 如果找到 → 返回 Method                  │       │
│  │  • 如果没找到 → 进入 super class             │       │
│  │  • 直到找到或到达 NSObject                    │       │
│  └──────────────────────────────────────────┘       │
│                                                        │
│  第 3 步：动态解析（resolver 阶段）                    │
│  ┌────────────────────────────────────────┐          │
│  │  class_getInstanceMethod(cls, SEL):   │          │
│  │  • 调用 +resolveInstanceMethod:         │          │
│  │  • 如果方法被动态添加 → 重新查找          │          │
│  │  • 如果没添加 → 进入第 4 步              │          │
│  └──────────────────────────────────────┘          │
│                                                        │
│  第 4 步：消息转发（Forwarding）                       │
│  ┌───────────────────────────────────────────────┐   │
│  │  4a. -forwardingTargetForSelector:             │   │
│  │     → 将消息转发给其他对象处理                   │   │
│  │     → 如果返回非 nil → 结束                     │   │
│  │                                               │   │
│  │  4b. -methodSignatureForSelector:              │   │
│  │     → 生成方法签名                              │   │
│  │     → 如果返回 nil → +doesNotRecognizeSelector │   │
│  │                                               │   │
│  │  4c. -forwardInvocation:                       │   │
│  │     → 最终的消息转发                            │   │
│  │     → 可自定义处理逻辑                          │   │
│  └───────────────────────────────────────────────┘   │
│                                                        │
│  第 5 步：执行 IMP                                    │
│  ┌────────────────────────────────────────┐          │
│  │  IMP imp = class_getMethodImplementation │          │
│  │  imp(obj, @selector(method), args...)  │          │
│  └──────────────────────────────────────┘          │
└──────────────────────────────────────────────────────┘

性能分析：
┌─────────────────────────────────────────────────────────────────────┐
│  查找路径            │  平均耗时       │  命中率     │  适用场景        │
├───────────────────────┼─────────────────┼─────────────┼──────────────────┤
│ cache 查找          │  O(1)          │  99%+     │  常用方法        │
│ method list 查找    │  O(n)          │  1-5%     │  不常用方法      │
│ resolver 阶段        │  O(m)          │  <1%      │  动态添加方法    │
│ forwarding 阶段     │  O(p)          │  <1%      │  消息转发        │
└─────────────────────────────────────────┴───────────────┴──────────────┘
*/
```

### 2.2 objc_msgSend 汇编级分析

```asm
/*
objc_msgSend 汇编流程（64-bit，ARM64）：

    // r0 = receiver (self/对象)
    // x1 = SEL (方法选择器)
    // x2...x7 = 参数
    // x0 = 返回值

    // 1. 获取 receiver 的 isa 指针
    ldr   x16, [x0]          // x16 = isa

    // 2. 从 isa 中获取 class 指针（提取 class 部分）
    and   x16, x16, #0xfffffffffffffc00  // 清除 isa 的低位标志位

    // 3. 从 class 的 cache 中查找 SEL
    ldp   x17, x16, [x16, #CACHE]   // x17 = 缓存指针, x16 = 方法 IMP
    b     __objc_msgForward     // 如果 cache miss，跳转到转发流程

    // 4. 计算缓存 bucket 索引
    and   x17, x1, x17.mask   // x1 = SEL, mask 用于哈希

    // 5. 检查 bucket 是否命中
    cmp   x17.key, x1          // key 是否等于 SEL

    // 6. 如果命中，执行 IMP
    b.eq  __objc_msgForward     // 未命中，转发
    mov   x16, IMP             // x16 = IMP
    br    x16                   // br = branch register，跳转到 IMP

    // 7. 缓存 miss，执行 class_getMethodImplementation
    bl    _class_getMethodAndForwardImp

    // 8. 执行 IMP
    // IMP 签名：void (*)(id, SEL, ...)
    // x0 = receiver
    // x1 = SEL
    // x2-x7 = 参数

    // 缓存结构（64-bit）：
    // bucket[0]: key (SEL) | imp (IMP)
    // bucket[1]: key (SEL) | imp (IMP)
    // ...
    // mask: 哈希掩码
*/

// IMP 函数签名：
// typedef id (*IMP)(id self, SEL _cmd, ...);

// 等价 C 代码：
id objc_msgSend(id receiver, SEL selector, ...) {
    // 1. 获取 class
    Class cls = object_getClass(receiver);
    
    // 2. 查找 IMP
    IMP imp = class_getMethodImplementation(cls, selector);
    
    // 3. 缓存优化（实际在汇编层）
    // 4. 执行 IMP
    return imp(receiver, selector, ...);
}
```

---

## 3. 动态绑定与转发

### 3.1 动态方法解析

```objc
/*
动态方法解析（+resolveInstanceMethod:）：

原理：在消息发送的第 3 阶段（resolver），Runtime 会调用
+resolveInstanceMethod: 方法，允许开发者动态添加方法。

适用场景：
• 动态创建方法（根据 runtime 参数）
• 热修复（动态注入新方法）
• 代理模式优化（动态转发代理消息）
• AOP（面向切面编程）

代码示例：
*/

+ (BOOL)resolveInstanceMethod:(SEL)sel {
    NSString *selName = NSStringFromSelector(sel);
    
    if ([selName hasPrefix:@"dynamicMethod_"]) {
        // 动态创建方法实现
        IMP imp = imp_implementationWithBlock(^(id self) {
            NSLog(@"动态方法被调用！");
            return @"动态返回值";
        });
        
        // 添加方法到类
        class_addMethod([self class], sel, imp, "@@:");
        return YES;
    }
    
    return [super resolveInstanceMethod:sel];
}

/*
方法签名：
@ = id (self)
@ = SEL (_cmd)
: = 参数（每个参数一个冒号）

示例：
- (void)foo: (int)x bar: (NSString *)y  →  "@v@:i@:"
- (NSString *)foo                      →  "@@"
- (void)foo                            →  "@v@:"
- (void)foo: (int)x                    →  "@v@:i"
*/

// 热修复示例（动态替换方法）
+ (void)hotFix {
    Class cls = [self class];
    
    SEL originalSel = @selector(originalMethod);
    SEL swizzledSel = @selector(hotFixedMethod);
    
    // 1. 获取原始方法
    Method originalMethod = class_getInstanceMethod(cls, originalSel);
    
    // 2. 获取新方法的 IMP
    Method newMethod = class_getInstanceMethod(cls, swizzledSel);
    
    // 3. 交换方法实现
    method_exchangeImplementations(originalMethod, newMethod);
}
```

### 3.2 消息转发全链路

```objc
/*
消息转发（Message Forwarding）的三个阶段：

┌───────────────────────────────────────────────────────────┐
│  Stage 1: dynamicMethodResolution                    │
│                                                      │
│  +resolveInstanceMethod: (实例方法)                    │
│  +resolveClassMethod:    (类方法)                      │
│                                                      │
│  作用：动态添加方法                                     │
│  返回 YES → Runtime 重新查找方法                        │
│  返回 NO  → 进入 Stage 2                             │
│                                                      │
│  ────────────────────────────────────────────────      │
│                                                      │
│  Stage 2: forwardingTargetForSelector              │
│                                                      │
│  -forwardingTargetForSelector:                      │
│                                                      │
│  作用：将消息转发给其他对象处理                          │
│  返回非 nil → 目标对象处理消息                           │
│  返回 nil  → 进入 Stage 3                             │
│                                                      │
│  常见用法：                                            │
│  • 转发给代理对象                                      │
│  • 转发给其他对象（消息转送）                          │
│  • KVO 实现                                            │
│  ────────────────────────────────────────────────      │
│                                                      │
│  Stage 3: forwardInvocation                         │
│                                                      │
│  1. -methodSignatureForSelector: 生成签名              │
│     → 返回 nil → doesNotRecognizeSelector            │
│     → 返回签名 → 创建 NSInvocation 对象              │
│                                                      │
│  2. -forwardInvocation: 处理消息                      │
│     → 可自定义处理逻辑                                  │
│     → 可转发给多个对象                                  │
│     → 可实现 AOP、装饰器模式等                          │
│                                                      │
│  NSInvocation 结构：                                  │
│  ┌────────────────────────────────────────────┐      │
│  │  methodSignature  — 方法签名                   │      │
│  │  target            — 目标对象                   │      │
│  │  selector         — 方法选择器                  │      │
│  │  arguments        — 参数数组                    │      │
│  │  returnValue      — 返回值                     │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
│  适用场景：                                          │
│  • 协议方法可选实现（不实现也不会崩溃）                │
│  • 消息路由/转发                                      │
│  • AOP（面向切面编程）                                │
│  • 动态代理                                           │
│  • 跨对象方法调用                                    │
│                                                      │
└─────────────────────────────────────────────────────┘

// 完整转发示例：
@implementation MyForwarder

// Stage 1: 动态解析
+ (BOOL)resolveInstanceMethod:(SEL)sel {
    // 可以动态添加方法
    return NO; // 不处理，进入 Stage 2
}

// Stage 2: 转发给其他对象
- (id)forwardingTargetForSelector:(SEL)aSelector {
    NSString *selName = NSStringFromSelector(aSelector);
    
    // 转发给代理对象
    if ([selName hasPrefix:@"proxy_"]) {
        return self.delegate;
    }
    
    // 转发给 helper
    if ([selName hasPrefix:@"helper_"]) {
        return [MyHelper sharedHelper];
    }
    
    return nil; // 不处理，进入 Stage 3
}

// Stage 3: 最终转发
- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector {
    // 生成签名
    NSString *selName = NSStringFromSelector(aSelector);
    
    if ([selName hasPrefix:@"optional_"]) {
        // 可选方法 - 生成一个无操作签名
        return [NSMethodSignature signatureWithObjCTypes:"v@:"];
    }
    
    // 转发给目标
    if ([aSelector respondsToSelector:@selector(helperMethod:)]) {
        return [self.helper methodSignatureForSelector:aSelector];
    }
    
    return [super methodSignatureForSelector:aSelector];
}

- (void)forwardInvocation:(NSInvocation *)anInvocation {
    SEL sel = anInvocation.selector;
    
    if ([self.helper respondsToSelector:sel]) {
        [anInvocation invokeWithTarget:self.helper];
    }
}

@end
```

---

## 4. Method Swizzling 全栈

### 4.1 Method Swizzling 原理

```objc
/*
Method Swizzling 原理：

通过交换两个方法的 IMP（实现），改变方法调用行为。

IMP 是函数指针：
typedef id (*IMP)(id self, SEL _cmd, ...);

┌─────────────────────────────────────────────────────────────┐
│  原始状态：                                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Method List                                         │    │
│  │  ├─ "viewWillAppear:"  → IMP_A                      │    │
│  │  └─ "customMethod"     → IMP_B                      │    │
│  └────────────────────────────────────────────────┘    │
│  调用 "viewWillAppear:" → 执行 IMP_A                    │
│                                                        │
│  Swizzling 后：                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Method List                                         │    │
│  │  ├─ "viewWillAppear:"  → IMP_B  ⬅️ IMP 已交换      │    │
│  │  └─ "customMethod"     → IMP_A  ⬅️ IMP 已交换      │    │
│  └────────────────────────────────────────────────┘    │
│  调用 "viewWillAppear:" → 执行 IMP_B                     │
│  调用 "customMethod" → 执行 IMP_A                        │
│                                                        │
│  关键点：                                                │
│  • IMP 是函数指针，交换后调用行为永久改变                  │
│  • 通过 swizzling 后的方法名调用原方法（IMP 已交换）     │
│  • 线程安全：必须在 +load 中执行                         │
│  • 全局性：所有该类的实例都会受影响                       │
└───────────────────────────────────────────────────────┘
*/

// Method Swizzling 标准实现：

@interface MyViewController ()
@end

@implementation MyViewController

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class cls = [self class];
        
        SEL originalSel = @selector(viewWillAppear:);
        SEL swizzledSel = @selector(my_viewWillAppear:);
        
        Method originalMethod = class_getInstanceMethod(cls, originalSel);
        Method swizzledMethod = class_getInstanceMethod(cls, swizzledSel);
        
        // 先尝试添加 swizzled 方法（如果原方法不存在）
        BOOL didAdd = class_addMethod(cls,
            originalSel,
            method_getImplementation(swizzledMethod),
            method_getTypeEncoding(swizzledMethod));
        
        if (didAdd) {
            // 原方法不存在，把 swizzled 实现绑定到 original selector
            class_replaceMethod(cls,
                swizzledSel,
                method_getImplementation(originalMethod),
                method_getTypeEncoding(originalMethod));
        } else {
            // 两个方法都存在，交换 IMP
            method_exchangeImplementations(originalMethod, swizzledMethod);
        }
    });
}

- (void)my_viewWillAppear:(BOOL)animated {
    NSLog(@"Custom viewWillAppear called!");
    
    // 调用原方法（IMP 已交换，所以调用 my_viewWillAppear 实际执行的是原方法）
    [self my_viewWillAppear:animated];
}

@end

/*
⚠️ 常见陷阱：

1. +load vs +initialize
   • +load 在类加载时调用（线程安全，保证只执行一次）
   • +initialize 在第一次发送消息时调用（可能多次调用，不安全）
   • ✅ 始终使用 +load

2. 方法不存在的情况
   • class_addMethod 先尝试添加，避免崩溃
   • 检查 class_getInstanceMethod 返回值

3. 线程安全
   • dispatch_once 保证线程安全
   • 多个类 swizzling 需要各自 dispatch_once

4. 无限递归
   • swizzled 方法内部调用 self 的 swizzled 方法（IMP 已交换，实际执行的是原方法）
   • 不要调用 original selector 的名称（会造成无限循环）

5. 子类的影响
   • Swizzling 影响所有子类
   • 子类可能需要重新 swizzle
*/
```

### 4.2 安全的 Method Swizzling 封装

```objc
// 安全的 Swizzling 封装类
@interface Swizzler : NSObject
+ (void)swizzleClass:(Class)cls
         originalSEL:(SEL)originalSEL
        swizzledSEL:(SEL)swizzledSEL;
@end

@implementation Swizzler

static void swizzleMethod(Class cls, SEL original, SEL swizzled) {
    Method originalMethod = class_getInstanceMethod(cls, original);
    Method swizzledMethod = class_getInstanceMethod(cls, swizzled);
    
    if (!originalMethod || !swizzledMethod) return;
    
    IMP originalIMP = method_getImplementation(originalMethod);
    IMP swizzledIMP = method_getImplementation(swizzledMethod);
    
    const char *originalTypes = method_getTypeEncoding(originalMethod);
    const char *swizzledTypes = method_getTypeEncoding(swizzledMethod);
    
    BOOL didAdd = class_addMethod(cls,
        original, swizzledIMP, swizzledTypes);
    
    if (didAdd) {
        class_replaceMethod(cls, swizzled, originalIMP, originalTypes);
    } else {
        method_exchangeImplementations(originalMethod, swizzledMethod);
    }
}

+ (void)swizzleClass:(Class)cls
         originalSEL:(SEL)originalSEL
        swizzledSEL:(SEL)swizzledSEL {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        [self swizzleMethod:cls originalSEL:originalSEL swizzledSEL:swizzledSEL];
    });
}

@end

// 使用：
// [Swizzler swizzleClass:[MyViewController class]
//                  originalSel:@selector(viewWillAppear:)
//                 swizzledSel:@selector(my_viewWillAppear:)];
```

---

## 5. 分类（Category）与扩展（Extension）原理

### 5.1 Category 底层原理

```objc
/*
Category 的内存布局与加载：

Category 数据结构（源码）：
┌─────────────────────────────────────────────────────────┐
│  struct category_t {                                    │
│      const char *name;        // 类名                     │
│      struct class_t *cls;         // 原类                 │
│      struct method_list_t *instanceMethods;  // 实例方法   │
│      struct method_list_t *classMethods;     // 类方法     │
│      struct protocol_list_t *protocols;      // 协议       │
│      struct property_list_t *instanceProperties; // 属性   │
│  };                                                      │
│                                                         │
│  category_t 存储位置：                                    │
│  • __DATA/__objc_catlist section (Mach-O)              │
│  • 由 dyld 加载时解析                                   │
│  • 由 _objc_init 在 Runtime 初始化阶段注册              │
└────────────────────────────────────────────────────────┘

Category 加载流程（Runtime 初始化）：
┌─────────────────────────────────────────────────────────┐
│  1. dyld 加载 category_t 数组                             │
│  ↓                                                       │
│  2. _read_images() 遍历所有 categories                    │
│  ↓                                                       │
│  3. 为每个 category 加载方法：                             │
│     • loadCategoryMethods()                              │
│     • 将 category 的方法添加到类的 method list           │
│     • 按加载顺序插入到 method list 的头部                  │
│  ↓                                                       │
│  4. 加载 protocol：                                      │
│     • loadCategoryProtocols()                            │
│     • 添加到类的 protocols 列表                          │
│  ↓                                                       │
│  5. 加载属性：                                            │
│     • loadCategoryProperties()                           │
│     • 添加到类的 ivar list                              │
│  ↓                                                       │
│  6. 方法查找优先级：                                      │
│     • Category 方法 > 原类方法 > 父类方法                  │
│     • 同 Category 中：最后加载的 Category 优先             │
└──────────────────────────────────────────────────────────┘

Category 与 原类方法的查找优先级：
┌──────────────────────────────────────────────────────┐
│  Category 中的方法      ⬆ 最高优先级                    │
│  Category 中的方法      ⬆                              │
│  ...                                                   │
│  原类的 @implementation 中的方法                     │
│  ...                                                   │
│  父类的方法            ⬇ 最低优先级                     │
└───────────────────────────────────────────────────────┘

⚠️ Category 方法覆盖原类方法的机制：
• Category 的方法通过 runtime 动态插入到 method list
• 插入位置：method list 的头部
• 消息发送时先遍历 method list，所以 Category 方法优先
• 如果两个 Category 都有同名方法 → 后加载的优先
*/
```

### 5.2 Category 的局限性

```objc
/*
Category 的局限性：
┌─────────────────────────────────────────────┐
│ 支持                                      │
├───────────────────────────────────────────┤
│ • 添加方法（实例方法 / 类方法）               │
│ • 添加协议                                 │
│ • 添加属性（需要关联对象）                   │
│                                           │
│ 不支持                                    │
│ • 添加实例变量（Ivar）                       │
│ • 存储数据（只能通过关联对象）                │
│ • 修改原类的方法实现（通过 swizzle）          │
│                                           │
│ 解决方案：                                  │
│ • 添加数据 → 使用 Associated Objects        │
│ • 修改实现 → 使用 Method Swizzling         │
│ • 添加 Ivar → 使用 Runtime 动态绑定        │
└────────────────────────────────────────┘

关联对象（Associated Objects）实现原理：
┌───────────────────────────────────────────────────────┐
│  objc_setAssociatedObject(obj, key, value, policy)   │
│                                                   │
│  内部实现：                                         │
│  ┌────────────────────────────────────────┐       │
│  │  AssociatedObjectMap                     │       │
│  │  ├── objc_object → [                    │       │
│  │  │   key → AssociatedObject {           │       │
│  │  │     value → ...                      │       │
│  │  │     policy → ...                     │       │
│  │  │   },                                │       │
│  │  │   key → ...                          │       │
│  │  └────────────────────────────────────────┘       │
│  │                                                   │
│  │  policy:                                        │
│  │  • OBJC_ASSOCIATION_ASSIGN          — 弱引用       │
│  │  • OBJC_ASSOCIATION_RETAIN_NONATOMIC — 强引用    │
│  │  • OBJC_ASSOCIATION_COPY          — 复制          │
│  │  • OBJC_ASSOCIATION_RETAIN        — 强引用        │
│  │  • OBJC_ASSOCIATION_COPY_NONATOMIC — 复制         │
│  └──────────────────────────────────────────────────┘
*/

// Category 添加属性的标准方式（关联对象）：
@implementation UIView (MyExtension)

static char kBackgroundColorKey;

- (void)setMyBackgroundColor:(UIColor *)color {
    objc_setAssociatedObject(self, &kBackgroundColorKey, color, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (UIColor *)myBackgroundColor {
    return objc_getAssociatedObject(self, &kBackgroundColorKey);
}

@end

// 动态添加 Ivar 的高级技巧：
static char _dynamicIvarKey;

@implementation MyView

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Ivar ivar = ivar_addIvar([self class], "_myValue", sizeof(NSInteger), nil, "@");
        // 通过 KVC 访问
    });
}

- (NSInteger)myValue {
    return [self valueForKey:@"_myValue"] ?: @0;
}

- (void)setMyValue:(NSInteger)value {
    [self setValue:@(value) forKey:@"_myValue"];
}

@end
```

---

## 6. Protocol Witness Table

### 6.1 原理详解

```objc
/*
Protocol Witness Table（协议见证表）：

Swift 协议与 ObjC 协议的根本区别：

┌───────────────────────────────────────────────────────┐
│                  协议实现方式                            │
├──────────────────────────────────────────────────┐   │
│                                                    │
│  ObjC Protocol：                                   │
│  • 运行时查找（method signature match）            │
│  • 通过 @protocol + @interface 声明                  │
│  • 通过 respondsToSelector: 检查                      │
│  • 动态分发（selector）                              │
│  • 性能：运行时查找，有开销                           │
│                                                    │
│  Swift Protocol（非 @objc）：                        │
│  • 编译期绑定（Witness Table）                       │
│  • 通过 conforming types 声明                        │
│  • 通过 protocol witness table 静态查找               │
│  • 静态分发（零开销）                                │
│  • 性能：编译期确定，零开销                           │
│                                                    │
│  Witness Table 结构：                                │
│  ┌──────────────────────────────────────────┐      │
│  │  Protocol Witness Table                    │      │
│  │  ┌───────────────────────────────────┐    │      │
│  │  │  Type: MyClass                     │    │      │
│  │  │  → implements Protocol1:           │    │      │
│  │  │    ├─ method1 → MyClass.method1    │    │      │
│  │  │    ├─ method2 → MyClass.method2    │    │      │
│  │  │    └─ associatedType → MyClass.Item│    │      │
│  │  │  → implements Protocol2:           │    │      │
│  │  │    ├─ methodA → MyClass.methodA    │    │      │
│  │  │    └─ methodB → MyClass.methodB    │    │      │
│  │  └───────────────────────────────────┘    │      │
│  └──────────────────────────────────────────┘      │
│                                                    │
│  内存布局：                                         │
│  • Witness Table 存储在可执行文件的 __swift_protos 段  │
│  • 每个 conforming type 有一个 Witness Table       │
│  • Runtime 通过 Protocol 和 Witness Table 查找       │
│    实现方法                                          │
└───────────────────────────────────────────────┘
*/
```

### 6.2 Protocol 的动态分发

```objc
/*
Protocol 动态分发（Swift）：

当使用 @objc protocol 时，Swift 会为协议生成 Objective-C 兼容的接口，
通过 selector 动态查找方法。

┌─────────────────────────────────────────────────┐
│  @objc protocol vs Swift protocol               │
│                                                 │
│  @objc protocol:                                │
│  ┌────────────────────────────────────────┐    │
│  │  • 运行时分发（selector 查找）             │    │
│  │  • 需要继承 NSObjectProtocol             │    │
│  │  • 方法参数必须是桥接兼容类型              │    │
│  │  • 通过 method signature match           │    │
│  │  • 生成 Objective-C 兼容接口              │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  Swift protocol（非 @objc）:                     │
│  ┌────────────────────────────────────────┐    │
│  │  • 编译期分发（Witness Table）           │    │
│  │  • 不需要继承 NSObjectProtocol           │    │
│  │  • 可以使用泛型、关联类型                 │    │
│  │  • 通过 Witness Table 查找               │    │
│  │  • 零开销静态分发                         │    │
│  └────────────────────────────────────────┘    │
└────────────────────────────────────────────┘

Protocol Witness Table 查找过程：
1. 编译期：
   • 类型 conforming 协议 → 生成 Witness Table
   • Witness Table 存储在 __swift_protos 段
   • 每个方法映射到具体实现

2. 运行时：
   • 通过 Protocol 和 Witness Table 查找方法
   • 查找时间：O(1)（哈希表查找）
   • 零开销（编译期确定）

3. 泛型约束：
   • protocol<Protocol> 约束 → 编译期检查
   • @objc 协议约束 → 运行时检查
*/
```

---

## 7. Swift Runtime

### 7.1 Swift 类型系统

```objc
/*
Swift 类型系统 vs Objective-C 类型系统：

┌─────────────────────────────────────────────────────────────┐
│                    类型系统对比                               │
├──────────────────────────────────────────────────────────┤
│                                    │  ObjC                │
├──────────────────────────────────────────────────────────┤
│  类型安全                          │  ✅ (可选)             │
│                                    │  ✅ (强)              │
│  泛型                              │  ✅ (强，编译期)       │
│                                    │  ❌                   │
│  协议                              │  ✅ (Witness Table)    │
│                                    │  ✅ (protocol 对象)    │
│  值类型 vs 引用类型                 │  ✅ (struct/class)     │
│                                    │  ❌ (只有类)           │
│  内存管理                          │  ✅ (ARC)             │
│                                    │  ✅ (ARC/MRC)         │
│  元类型（Metatype）                │  ✅ (Type/Metatype)    │
│                                    │  ❌ (只有 Class)      │
│  函数类型                           │  ✅ (函数是对象)        │
│                                    │  ✅ (block)           │
└──────────────────────────────────────────────────────────┘

Swift Metatype：
┌─────────────────────────────────────────────────┐
│  Swift 元类型（Metatype）                          │
│                                                  │
│  类型信息（Type Metadata）存储在：                │
│  • _swift_reflection_tables                     │
│  • __swift_types 段（Mach-O）                   │
│                                                  │
│  元类型结构：                                     │
│  ┌─────────────────────────────────────────┐    │
│  │  Swift Metatype                           │    │
│  │  ┌────────────────────────────────────┐ │    │
│  │  │  TypeDescriptor                     │ │    │
│  │  │  • Name（名称）                      │ │    │
│  │  │  • Size（内存大小）                   │ │    │
│  │  │  • Alignment（内存对齐）              │ │    │
│  │  │  • Flags（标志位）                    │ │    │
│  │  │  • ProtocolConformance（协议一致性）  │ │    │
│  │  │  • MemberDescriptor（成员列表）       │ │    │
│  │  │  • SuperclassDescriptor（父类描述）    │ │    │
│  │  └────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Metatype 用法：                                │
│  • MyClass.self → 类对象                        │
│  • MyClass.Type → 元类型                        │
│  • NSStringFromClass(myClass) → 类名字符串        │
│  • class_getName(cls) → 类名字符串              │
│  • object_getClass(obj) → 动态类型              │
│  • type(of: obj) → 运行时类型                    │
└─────────────────────────────────────────────────┘
*/
```

### 7.2 Runtime 调试与调试技巧

```objc
// Runtime 调试工具：

// 1. 遍历类的所有方法
void printClassMethods(Class cls) {
    unsigned int methodCount;
    Method *methods = class_copyMethodList(cls, &methodCount);
    
    for (unsigned int i = 0; i < methodCount; i++) {
        Method method = methods[i];
        SEL sel = method_getName(method);
        const char *types = method_getTypeEncoding(method);
        NSLog(@"Method: %s (%s)", sel_getName(sel), types);
    }
    
    free(methods);
}

// 2. 遍历类的所有实例变量
void printClassIvars(Class cls) {
    unsigned int ivarCount;
    Ivar *ivars = class_copyIvarList(cls, &ivarCount);
    
    for (unsigned int i = 0; i < ivarCount; i++) {
        Ivar ivar = ivars[i];
        const char *name = ivar_getName(ivar);
        const char *type = ivar_getTypeEncoding(ivar);
        NSLog(@"Ivar: %s (%s)", name, type);
    }
    
    free(ivars);
}

// 3. 遍历类的协议
void printClassProtocols(Class cls) {
    unsigned int protocolCount;
    Protocol **protocols = class_copyProtocolList(cls, &protocolCount);
    
    for (unsigned int i = 0; i < protocolCount; i++) {
        Protocol *protocol = protocols[i];
        NSLog(@"Protocol: %s", protocol_getName(protocol));
    }
    
    free(protocols);
}

// 4. 检查对象是否能响应某个 selector
BOOL canRespondToSelector(id obj, SEL sel) {
    return [obj respondsToSelector:sel];
}

// 5. 获取类的实例大小
void printClassSize(Class cls) {
    NSLog(@"Instance size: %zu bytes", class_getInstanceSize(cls));
    NSLog(@"Aligned size: %zu bytes", class_getAlignedInstanceSize(cls));
    NSLog(@"Ivar layout: %@", class_getIvarLayout(cls) ? "Yes" : "No");
}
```

---

## 8. 面试题汇总

### 高频面试题

**Q1: Runtime 的消息发送过程？**

**答**：
1. 从 receiver 的 isa 指针获取 class
2. 在 class 的 cache 中查找 SEL（O(1) 哈希查找）
3. 未命中 → 在 method list 中遍历查找
4. 未找到 → 调用 +resolveInstanceMethod:（动态解析）
5. 未处理 → 调用 -forwardingTargetForSelector:（转发）
6. 未处理 → 生成 methodSignature → forwardInvocation（最终转发）
7. 未处理 → +doesNotRecognizeSelector（崩溃）
8. 找到 IMP → 执行

**Q2: Method Swizzling 线程安全吗？**

**答**：
- Swizzling 本身不是线程安全的
- 必须在 +load 中执行（系统保证线程安全）
- 或者使用 dispatch_once 确保只执行一次
- 多线程同时 swizzle 同一类可能导致混乱
- ✅ 最佳实践：+load + dispatch_once

**Q3: Category 与 Extension 的区别？**

**答**：
- **Category**：运行时加载，方法可以覆盖原类方法，不能添加 ivar，可以添加属性（通过关联对象）
- **Extension（匿名 Category）**：编译时加载，方法添加到原类 method list 的末尾，可以添加 ivar
- **查找优先级**：Extension > Category > 原类方法 > 父类方法

**Q4: Protocol Witness Table 的工作原理？**

**答**：
- 编译期：类型 conforming 协议时生成 Witness Table
- 存储在 __swift_protos 段
- 运行时通过 Witness Table 查找方法实现（O(1) 哈希查找）
- 零开销静态分发
- 与 ObjC 协议（运行时查找）不同

**Q5: Associated Objects 的实现原理？**

**答**：
- Runtime 维护一个全局的 AssociatedObjectMap
- key 是 object 和 ivar key 的组合
- policy 控制引用计数行为（retain/copy/assign）
- 通过 objc_setAssociatedObject/objc_getAssociatedObject 访问

**Q6: 为什么 Category 不能添加实例变量？**

**答**：
- Category 的内存布局中不包含 ivar 字段
- Category 的方法通过 runtime 动态插入
- 如果要添加数据存储，使用 Associated Objects（关联对象）

---

## 9. 参考资源

- [Apple: Objective-C Runtime Reference](https://developer.apple.com/documentation/objectivec/objective-c_runtime)
- [Apple: Class Reference](https://developer.apple.com/documentation/objectivec/nsobject)
- [Apple: Method Swizzling](https://developer.apple.com/documentation/objectivec/class/1418767-method)
- [Apple: Associated Objects](https://developer.apple.com/documentation/objectivec/objc_associatedobject)
- [Hacking with Swift: Runtime](https://www.hackingwithswift.com/read/33/7/runtime)
- [NSHipster: NSObject](https://nshipster.com/nsobject)
- [NSHipster: Protocol](https://nshipster.com/protocol)
- [objc.io: Runtime](https://www.objc.io/issues/6-ios7/runtime/)
- [WWDC 2020: Meet the Objective-C Runtime](https://developer.apple.com/videos/play/wwdc2020/10137)
