import{_ as i,o as a,c as n,ae as l}from"./chunks/framework.Czhw_PXq.js";const g=JSON.parse('{"title":"01 - Runtime 深度","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/10_System_Principles/01_Runtime_Deep.md","filePath":"01-ios/10_System_Principles/01_Runtime_Deep.md"}'),p={name:"01-ios/10_System_Principles/01_Runtime_Deep.md"};function h(t,s,k,e,r,d){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="_01-runtime-深度" tabindex="-1">01 - Runtime 深度 <a class="header-anchor" href="#_01-runtime-深度" aria-label="Permalink to &quot;01 - Runtime 深度&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-objc-runtime-架构">ObjC Runtime 架构</a></li><li><a href="#2-消息发送机制">消息发送机制</a></li><li><a href="#3-动态绑定与转发">动态绑定与转发</a></li><li><a href="#4-method-swizzling-全栈">Method Swizzling 全栈</a></li><li><a href="#5-分类category与扩展extension原理">分类（Category）与扩展（Extension）原理</a></li><li><a href="#6-关联对象associated-objects">关联对象（Associated Objects）</a></li><li><a href="#7-protocol-witness-table">Protocol Witness Table</a></li><li><a href="#8-swift-runtime">Swift Runtime</a></li><li><a href="#9-面试题汇总">面试题汇总</a></li></ol><hr><h2 id="_1-objc-runtime-架构" tabindex="-1">1. ObjC Runtime 架构 <a class="header-anchor" href="#_1-objc-runtime-架构" aria-label="Permalink to &quot;1. ObjC Runtime 架构&quot;">​</a></h2><h3 id="_1-1-runtime-系统概览" tabindex="-1">1.1 Runtime 系统概览 <a class="header-anchor" href="#_1-1-runtime-系统概览" aria-label="Permalink to &quot;1.1 Runtime 系统概览&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ObjC Runtime 系统架构（源码级）：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. ObjC Runtime 核心（libobjc.A.dylib）                    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│  │  objc/runtime.h  — 公共 API                            │     │</span></span>
<span class="line"><span>│  │  objc/message.h    — 消息发送                           │     │</span></span>
<span class="line"><span>│  │  objc/objc.h      — 基础类型定义                        │     │</span></span>
<span class="line"><span>│  │  objc/encoding.h  — 类型编码                            │     │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  2. Runtime 核心组件                                           │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│  │  Class Table        — 类缓存表                        │     │</span></span>
<span class="line"><span>│  │  Method Lists       — 方法列表（Method List）           │     │</span></span>
<span class="line"><span>│  │  Protocol Table     — 协议表（Witness Table）          │     │</span></span>
<span class="line"><span>│  │  Ivar List         — 实例变量列表                      │     │</span></span>
<span class="line"><span>│  │  Selector Table    — 选择器表                          │     │</span></span>
<span class="line"><span>│  │  Protocol Cache    — 协议缓存                         │     │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  3. 数据结构                                                 │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│  │  objc_object    — 对象基类（isa 指针）                 │     │</span></span>
<span class="line"><span>│  │  objc_class     — 类描述（meta-class 元类）           │     │</span></span>
<span class="line"><span>│  │  Method        — 方法结构体                           │     │</span></span>
<span class="line"><span>│  │  Ivar          — 实例变量结构体                        │     │</span></span>
<span class="line"><span>│  │  Protocol      — 协议描述                             │     │</span></span>
<span class="line"><span>│  │  SEL           — 选择器（字符串标识符）               │     │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  4. 内存管理                                                 │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│  │  retain/release    — 引用计数操作                     │     │</span></span>
<span class="line"><span>│  │  weak 处理         — __weak 变量自动置 nil            │     │</span></span>
<span class="line"><span>│  │  weak 通知         — Weak Reference Table             │     │</span></span>
<span class="line"><span>│  │  associative refs  — 关联对象链表                     │     │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Runtime 调用流程：                                          │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│  │  1. obj.method()  — 源代码                         │     │</span></span>
<span class="line"><span>│  │  2. objc_msgSend(obj, @selector(method))  — 编译     │     │</span></span>
<span class="line"><span>│  │  3. class_getInstanceMethod(class, sel)  — 查找      │     │</span></span>
<span class="line"><span>│  │  4. IMP imp = method_getImplementation(method)       │     │</span></span>
<span class="line"><span>│  │  5. imp(obj, sel, ...)  — 执行                       │     │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>运行时结构体内存布局：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  objc_object（所有对象的基类）                         │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  isa 指针（8 字节，指向 Class 对象）             │   │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  Class 内存布局：                                     │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  isa          — 指向 meta-class（元类）         │   │</span></span>
<span class="line"><span>│  │  superclass  — 指向父类                         │   │</span></span>
<span class="line"><span>│  │  cache        — 方法缓存（IMP 缓存）           │   │</span></span>
<span class="line"><span>│  │  data (rw)  — 类数据（包含 ivar/方法/协议等）   │   │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                       │</span></span>
<span class="line"><span>│  元类（Meta-class）内存布局：                           │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  isa          — 指向 metaclass（meta-class 的类）│   │</span></span>
<span class="line"><span>│  │  superclass  — 指向父类的 meta-class           │   │</span></span>
<span class="line"><span>│  │  cache        — 类方法缓存                       │   │</span></span>
<span class="line"><span>│  │  data (rw)  — 类数据（存储类方法）              │   │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-class-的初始化过程-源码级" tabindex="-1">1.2 Class 的初始化过程（源码级） <a class="header-anchor" href="#_1-2-class-的初始化过程-源码级" aria-label="Permalink to &quot;1.2 Class 的初始化过程（源码级）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ObjC 类加载流程（dyld 阶段）：</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. dyld 加载 Mach-O 文件                                    │</span></span>
<span class="line"><span>│     └─→ 加载所有依赖的 framework                              │</span></span>
<span class="line"><span>│     └─→ 解析所有符号（symbols）                               │</span></span>
<span class="line"><span>│     └─→ 调用所有 +load 方法（类/分类）                        │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  2. _objc_init 初始化（进程启动时）                            │</span></span>
<span class="line"><span>│     └─→ 初始化类缓存表（class hash table）                    │</span></span>
<span class="line"><span>│     └─→ 初始化方法缓存（method caches）                       │</span></span>
<span class="line"><span>│     └─→ 初始化 protocol 表                                   │</span></span>
<span class="line"><span>│     └─→ 初始化 weak 引用表                                    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  3. 类加载（class-dump 阶段）                                 │</span></span>
<span class="line"><span>│     └─→ 读取 MH_OBJECT 段的 __objc_classlist 段              │</span></span>
<span class="line"><span>│     └─→ 为每个类创建 Class 结构体                             │</span></span>
<span class="line"><span>│     └─→ 解析 Class 的 Ivar List                             │</span></span>
<span class="line"><span>│     └─→ 解析 Class 的 Method List                            │</span></span>
<span class="line"><span>│     └─→ 解析 Class 的 Protocol List                           │</span></span>
<span class="line"><span>│     └─→ 创建 metaclass                                      │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  4. 类注册                                                   │</span></span>
<span class="line"><span>│     └─→ 注册到 class hash table                              │</span></span>
<span class="line"><span>│     └─→ 设置 super class 链                                  │</span></span>
<span class="line"><span>│     └─→ 初始化 class hierarchy                               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  5. 类初始化（+initialize 方法）                              │</span></span>
<span class="line"><span>│     └─→ 线程安全的懒加载初始化                                │</span></span>
<span class="line"><span>│     └─→ 每个类只初始化一次                                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Class 加载时序：</span></span>
<span class="line"><span>ObjC Class 加载流程：</span></span>
<span class="line"><span>┌────────┐   ┌──────────────────┐   ┌───────────────────┐   ┌─────────────┐</span></span>
<span class="line"><span>│ dyld    │──▶│ _objc_init       │──▶│ class-dump       │──▶│ +initialize  │</span></span>
<span class="line"><span>│ 加载     │   │ 初始化            │   │ 类注册            │   │ 懒初始化      │</span></span>
<span class="line"><span>└────────┘   └──────────────────┘   └───────────────────┘   └─────────────┘</span></span>
<span class="line"><span>     │              │                   │                    │</span></span>
<span class="line"><span>     ▼              ▼                   ▼                    ▼</span></span>
<span class="line"><span>  Mach-O        类缓存表            Class 结构体         线程安全</span></span>
<span class="line"><span>  解析            hash               创建               +initialize</span></span></code></pre></div><hr><h2 id="_2-消息发送机制" tabindex="-1">2. 消息发送机制 <a class="header-anchor" href="#_2-消息发送机制" aria-label="Permalink to &quot;2. 消息发送机制&quot;">​</a></h2><h3 id="_2-1-消息发送全链路" tabindex="-1">2.1 消息发送全链路 <a class="header-anchor" href="#_2-1-消息发送全链路" aria-label="Permalink to &quot;2.1 消息发送全链路&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">消息发送流程（源码级）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">[obj doSomething];  // 源代码</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">↓</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">objc_msgSend(obj, @selector(doSomething));  // 编译后</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">↓</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">查找 IMP（方法实现）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 第 1 步：查找 Class 的 method cache（缓存查找）         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  IMP imp = class_getMethodImplementation(cls, SEL);    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  - 在 cache 中查找 SEL                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  - 命中 → 直接返回 IMP                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  - 未命中 → 进入第 2 步                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  cache 结构：                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────┐        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  _cache:                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├── bucket[0]: SEL → IMP               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├── bucket[1]: SEL → IMP               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├── ...                               │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └── mask: hash mask                    │        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────┘        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  第 2 步：在 Method List 中查找（线性搜索）            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌───────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  class_getInstanceMethod(cls, SEL):       │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 遍历 class 的 method list                │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 如果找到 → 返回 Method                  │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 如果没找到 → 进入 super class             │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 直到找到或到达 NSObject                    │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  第 3 步：动态解析（resolver 阶段）                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────┐          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  class_getInstanceMethod(cls, SEL):   │          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 调用 +resolveInstanceMethod:         │          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 如果方法被动态添加 → 重新查找          │          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 如果没添加 → 进入第 4 步              │          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────┘          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  第 4 步：消息转发（Forwarding）                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌───────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4a. -forwardingTargetForSelector:             │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     → 将消息转发给其他对象处理                   │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     → 如果返回非 nil → 结束                     │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4b. -methodSignatureForSelector:              │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     → 生成方法签名                              │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     → 如果返回 nil → +doesNotRecognizeSelector │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                               │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  4c. -forwardInvocation:                       │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     → 最终的消息转发                            │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │     → 可自定义处理逻辑                          │   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └───────────────────────────────────────────────┘   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  第 5 步：执行 IMP                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────┐          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  IMP imp = class_getMethodImplementation │          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  imp(obj, @selector(method), args...)  │          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────┘          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">性能分析：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  查找路径            │  平均耗时       │  命中率     │  适用场景        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├───────────────────────┼─────────────────┼─────────────┼──────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ cache 查找          │  O(1)          │  99%+     │  常用方法        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ method list 查找    │  O(n)          │  1-5%     │  不常用方法      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ resolver 阶段        │  O(m)          │  &lt;1%      │  动态添加方法    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ forwarding 阶段     │  O(p)          │  &lt;1%      │  消息转发        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────┴───────────────┴──────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_2-2-objc-msgsend-汇编级分析" tabindex="-1">2.2 objc_msgSend 汇编级分析 <a class="header-anchor" href="#_2-2-objc-msgsend-汇编级分析" aria-label="Permalink to &quot;2.2 objc_msgSend 汇编级分析&quot;">​</a></h3><div class="language-asm vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">asm</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">objc_msgSend 汇编流程（64-bit，ARM64）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // r0 = receiver (self/对象)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // x1 = SEL (方法选择器)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // x2...x7 = 参数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // x0 = 返回值</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取 receiver 的 isa 指针</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ldr   x16, [x0]          // x16 = isa</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 从 isa 中获取 class 指针（提取 class 部分）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    and   x16, x16, #0xfffffffffffffc00  // 清除 isa 的低位标志位</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 从 class 的 cache 中查找 SEL</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ldp   x17, x16, [x16, #CACHE]   // x17 = 缓存指针, x16 = 方法 IMP</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    b     __objc_msgForward     // 如果 cache miss，跳转到转发流程</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 计算缓存 bucket 索引</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    and   x17, x1, x17.mask   // x1 = SEL, mask 用于哈希</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 检查 bucket 是否命中</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    cmp   x17.key, x1          // key 是否等于 SEL</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 6. 如果命中，执行 IMP</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    b.eq  __objc_msgForward     // 未命中，转发</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    mov   x16, IMP             // x16 = IMP</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    br    x16                   // br = branch register，跳转到 IMP</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 7. 缓存 miss，执行 class_getMethodImplementation</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    bl    _class_getMethodAndForwardImp</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 8. 执行 IMP</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // IMP 签名：void (*)(id, SEL, ...)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // x0 = receiver</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // x1 = SEL</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // x2-x7 = 参数</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 缓存结构（64-bit）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // bucket[0]: key (SEL) | imp (IMP)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // bucket[1]: key (SEL) | imp (IMP)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // mask: 哈希掩码</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">// IMP 函数签名：</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">// typedef id (*IMP)(id self, SEL _cmd, ...)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">// 等价 C 代码：</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">id objc_msgSend(id receiver, SEL selector, ...) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    // </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 获取 class</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Class cls = object_getClass(receiver)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    // </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 查找 IMP</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IMP imp = class_getMethodImplementation(cls, selector)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    // </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 缓存优化（实际在汇编层）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    // </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 执行 IMP</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    return imp(receiver, selector, ...)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_3-动态绑定与转发" tabindex="-1">3. 动态绑定与转发 <a class="header-anchor" href="#_3-动态绑定与转发" aria-label="Permalink to &quot;3. 动态绑定与转发&quot;">​</a></h2><h3 id="_3-1-动态方法解析" tabindex="-1">3.1 动态方法解析 <a class="header-anchor" href="#_3-1-动态方法解析" aria-label="Permalink to &quot;3.1 动态方法解析&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">动态方法解析（+resolveInstanceMethod:）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">原理：在消息发送的第 3 阶段（resolver），Runtime 会调用</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">+resolveInstanceMethod: 方法，允许开发者动态添加方法。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">适用场景：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 动态创建方法（根据 runtime 参数）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 热修复（动态注入新方法）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 代理模式优化（动态转发代理消息）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• AOP（面向切面编程）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">代码示例：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BOOL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)resolveInstanceMethod:(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)sel {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    NSString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> NSStringFromSelector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(sel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ([selName </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">hasPrefix:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;dynamicMethod_&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 动态创建方法实现</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        IMP</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> imp </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> imp_implementationWithBlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">^</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">id</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;动态方法被调用！&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @&quot;动态返回值&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 添加方法到类</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        class_addMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], sel, imp, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@@:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> YES</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">super</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> resolveInstanceMethod:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sel];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">方法签名：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">@ = id (self)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">@ = SEL (_cmd)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">: = 参数（每个参数一个冒号）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">示例：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (void)foo: (int)x bar: (NSString *)y  →  &quot;@v@:i@:&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (NSString *)foo                      →  &quot;@@&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (void)foo                            →  &quot;@v@:&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (void)foo: (int)x                    →  &quot;@v@:i&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 热修复示例（动态替换方法）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)hotFix {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    Class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cls </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> originalSel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> @selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">originalMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swizzledSel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> @selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">hotFixedMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 获取原始方法</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Method originalMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, originalSel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 获取新方法的 IMP</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Method newMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, swizzledSel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 交换方法实现</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    method_exchangeImplementations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod, newMethod);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-2-消息转发全链路" tabindex="-1">3.2 消息转发全链路 <a class="header-anchor" href="#_3-2-消息转发全链路" aria-label="Permalink to &quot;3.2 消息转发全链路&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">消息转发（Message Forwarding）的三个阶段：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Stage 1: dynamicMethodResolution                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  +resolveInstanceMethod: (实例方法)                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  +resolveClassMethod:    (类方法)                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  作用：动态添加方法                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  返回 YES → Runtime 重新查找方法                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  返回 NO  → 进入 Stage 2                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ────────────────────────────────────────────────      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Stage 2: forwardingTargetForSelector              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  -forwardingTargetForSelector:                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  作用：将消息转发给其他对象处理                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  返回非 nil → 目标对象处理消息                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  返回 nil  → 进入 Stage 3                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  常见用法：                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 转发给代理对象                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 转发给其他对象（消息转送）                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • KVO 实现                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ────────────────────────────────────────────────      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Stage 3: forwardInvocation                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1. -methodSignatureForSelector: 生成签名              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     → 返回 nil → doesNotRecognizeSelector            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     → 返回签名 → 创建 NSInvocation 对象              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  2. -forwardInvocation: 处理消息                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     → 可自定义处理逻辑                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     → 可转发给多个对象                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     → 可实现 AOP、装饰器模式等                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  NSInvocation 结构：                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  methodSignature  — 方法签名                   │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  target            — 目标对象                   │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  selector         — 方法选择器                  │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  arguments        — 参数数组                    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  returnValue      — 返回值                     │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  适用场景：                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 协议方法可选实现（不实现也不会崩溃）                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 消息路由/转发                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • AOP（面向切面编程）                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 动态代理                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 跨对象方法调用                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 完整转发示例：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">@implementation MyForwarder</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Stage 1: 动态解析</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">+ (BOOL)resolveInstanceMethod:(SEL)sel {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 可以动态添加方法</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    return NO; // 不处理，进入 Stage 2</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Stage 2: 转发给其他对象</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (id)forwardingTargetForSelector:(SEL)aSelector {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    NSString *selName = NSStringFromSelector(aSelector);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 转发给代理对象</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    if ([selName hasPrefix:@&quot;proxy_&quot;]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        return self.delegate;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 转发给 helper</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    if ([selName hasPrefix:@&quot;helper_&quot;]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        return [MyHelper sharedHelper];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    return nil; // 不处理，进入 Stage 3</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Stage 3: 最终转发</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 生成签名</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    NSString *selName = NSStringFromSelector(aSelector);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    if ([selName hasPrefix:@&quot;optional_&quot;]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 可选方法 - 生成一个无操作签名</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        return [NSMethodSignature signatureWithObjCTypes:&quot;v@:&quot;];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 转发给目标</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    if ([aSelector respondsToSelector:@selector(helperMethod:)]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        return [self.helper methodSignatureForSelector:aSelector];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    return [super methodSignatureForSelector:aSelector];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">- (void)forwardInvocation:(NSInvocation *)anInvocation {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    SEL sel = anInvocation.selector;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    if ([self.helper respondsToSelector:sel]) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        [anInvocation invokeWithTarget:self.helper];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">@end</span></span></code></pre></div><hr><h2 id="_4-method-swizzling-全栈" tabindex="-1">4. Method Swizzling 全栈 <a class="header-anchor" href="#_4-method-swizzling-全栈" aria-label="Permalink to &quot;4. Method Swizzling 全栈&quot;">​</a></h2><h3 id="_4-1-method-swizzling-原理" tabindex="-1">4.1 Method Swizzling 原理 <a class="header-anchor" href="#_4-1-method-swizzling-原理" aria-label="Permalink to &quot;4.1 Method Swizzling 原理&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Method Swizzling 原理：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">通过交换两个方法的 IMP（实现），改变方法调用行为。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">IMP 是函数指针：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">typedef id (*IMP)(id self, SEL _cmd, ...);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  原始状态：                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Method List                                         │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ &quot;viewWillAppear:&quot;  → IMP_A                      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ &quot;customMethod&quot;     → IMP_B                      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  调用 &quot;viewWillAppear:&quot; → 执行 IMP_A                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Swizzling 后：                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Method List                                         │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├─ &quot;viewWillAppear:&quot;  → IMP_B  ⬅️ IMP 已交换      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └─ &quot;customMethod&quot;     → IMP_A  ⬅️ IMP 已交换      │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  调用 &quot;viewWillAppear:&quot; → 执行 IMP_B                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  调用 &quot;customMethod&quot; → 执行 IMP_A                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  关键点：                                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • IMP 是函数指针，交换后调用行为永久改变                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 通过 swizzling 后的方法名调用原方法（IMP 已交换）     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 线程安全：必须在 +load 中执行                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 全局性：所有该类的实例都会受影响                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Method Swizzling 标准实现：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyViewController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@implementation</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyViewController</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">+ (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    static</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> dispatch_once_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> onceToken;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    dispatch_once</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">onceToken, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">^</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        Class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cls </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> originalSel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> @selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">viewWillAppear:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swizzledSel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> @selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">my_viewWillAppear:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Method originalMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, originalSel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Method swizzledMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, swizzledSel);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 先尝试添加 swizzled 方法（如果原方法不存在）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        BOOL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> didAdd </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_addMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            originalSel,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            method_getImplementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(swizzledMethod),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            method_getTypeEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(swizzledMethod));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (didAdd) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 原方法不存在，把 swizzled 实现绑定到 original selector</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            class_replaceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                swizzledSel,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                method_getImplementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">                method_getTypeEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 两个方法都存在，交换 IMP</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            method_exchangeImplementations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod, swizzledMethod);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">my_viewWillAppear:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BOOL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)animated {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Custom viewWillAppear called!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 调用原方法（IMP 已交换，所以调用 my_viewWillAppear 实际执行的是原方法）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> my_viewWillAppear:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">animated];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">⚠️ 常见陷阱：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">1. +load vs +initialize</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • +load 在类加载时调用（线程安全，保证只执行一次）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • +initialize 在第一次发送消息时调用（可能多次调用，不安全）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • ✅ 始终使用 +load</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">2. 方法不存在的情况</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • class_addMethod 先尝试添加，避免崩溃</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 检查 class_getInstanceMethod 返回值</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">3. 线程安全</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • dispatch_once 保证线程安全</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 多个类 swizzling 需要各自 dispatch_once</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">4. 无限递归</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • swizzled 方法内部调用 self 的 swizzled 方法（IMP 已交换，实际执行的是原方法）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 不要调用 original selector 的名称（会造成无限循环）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">5. 子类的影响</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • Swizzling 影响所有子类</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 子类可能需要重新 swizzle</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_4-2-安全的-method-swizzling-封装" tabindex="-1">4.2 安全的 Method Swizzling 封装 <a class="header-anchor" href="#_4-2-安全的-method-swizzling-封装" aria-label="Permalink to &quot;4.2 安全的 Method Swizzling 封装&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 安全的 Swizzling 封装类</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Swizzler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NSObject</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">+ (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">swizzleClass:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)cls</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         originalSEL:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)originalSEL</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        swizzledSEL:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)swizzledSEL;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@implementation</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Swizzler</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> swizzleMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> cls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> original</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> swizzled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Method originalMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, original);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Method swizzledMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, swizzled);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">originalMethod </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">swizzledMethod) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    IMP</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> originalIMP </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> method_getImplementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    IMP</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swizzledIMP </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> method_getImplementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(swizzledMethod);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">originalTypes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> method_getTypeEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">swizzledTypes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> method_getTypeEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(swizzledMethod);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    BOOL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> didAdd </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_addMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        original, swizzledIMP, swizzledTypes);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (didAdd) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        class_replaceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, swizzled, originalIMP, originalTypes);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        method_exchangeImplementations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(originalMethod, swizzledMethod);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">+ (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">swizzleClass:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)cls</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">         originalSEL:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)originalSEL</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        swizzledSEL:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)swizzledSEL {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    static</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> dispatch_once_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> onceToken;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    dispatch_once</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">onceToken, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">^</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> swizzleMethod:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cls </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">originalSEL:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">originalSEL </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">swizzledSEL:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">swizzledSEL];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// [Swizzler swizzleClass:[MyViewController class]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//                  originalSel:@selector(viewWillAppear:)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//                 swizzledSel:@selector(my_viewWillAppear:)];</span></span></code></pre></div><hr><h2 id="_5-分类-category-与扩展-extension-原理" tabindex="-1">5. 分类（Category）与扩展（Extension）原理 <a class="header-anchor" href="#_5-分类-category-与扩展-extension-原理" aria-label="Permalink to &quot;5. 分类（Category）与扩展（Extension）原理&quot;">​</a></h2><h3 id="_5-1-category-底层原理" tabindex="-1">5.1 Category 底层原理 <a class="header-anchor" href="#_5-1-category-底层原理" aria-label="Permalink to &quot;5.1 Category 底层原理&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Category 的内存布局与加载：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Category 数据结构（源码）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  struct category_t {                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      const char *name;        // 类名                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      struct class_t *cls;         // 原类                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      struct method_list_t *instanceMethods;  // 实例方法   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      struct method_list_t *classMethods;     // 类方法     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      struct protocol_list_t *protocols;      // 协议       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│      struct property_list_t *instanceProperties; // 属性   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  };                                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  category_t 存储位置：                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • __DATA/__objc_catlist section (Mach-O)              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 由 dyld 加载时解析                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 由 _objc_init 在 Runtime 初始化阶段注册              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Category 加载流程（Runtime 初始化）：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  1. dyld 加载 category_t 数组                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ↓                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  2. _read_images() 遍历所有 categories                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ↓                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  3. 为每个 category 加载方法：                             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • loadCategoryMethods()                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 将 category 的方法添加到类的 method list           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 按加载顺序插入到 method list 的头部                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ↓                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  4. 加载 protocol：                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • loadCategoryProtocols()                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 添加到类的 protocols 列表                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ↓                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  5. 加载属性：                                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • loadCategoryProperties()                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 添加到类的 ivar list                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ↓                                                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  6. 方法查找优先级：                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • Category 方法 &gt; 原类方法 &gt; 父类方法                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│     • 同 Category 中：最后加载的 Category 优先             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Category 与 原类方法的查找优先级：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Category 中的方法      ⬆ 最高优先级                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Category 中的方法      ⬆                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ...                                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  原类的 @implementation 中的方法                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ...                                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  父类的方法            ⬇ 最低优先级                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">⚠️ Category 方法覆盖原类方法的机制：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• Category 的方法通过 runtime 动态插入到 method list</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 插入位置：method list 的头部</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 消息发送时先遍历 method list，所以 Category 方法优先</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">• 如果两个 Category 都有同名方法 → 后加载的优先</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_5-2-category-的局限性" tabindex="-1">5.2 Category 的局限性 <a class="header-anchor" href="#_5-2-category-的局限性" aria-label="Permalink to &quot;5.2 Category 的局限性&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Category 的局限性：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 支持                                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├───────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 添加方法（实例方法 / 类方法）               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 添加协议                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 添加属性（需要关联对象）                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 不支持                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 添加实例变量（Ivar）                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 存储数据（只能通过关联对象）                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 修改原类的方法实现（通过 swizzle）          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ 解决方案：                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 添加数据 → 使用 Associated Objects        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 修改实现 → 使用 Method Swizzling         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│ • 添加 Ivar → 使用 Runtime 动态绑定        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">关联对象（Associated Objects）实现原理：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  objc_setAssociatedObject(obj, key, value, policy)   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  内部实现：                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────┐       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  AssociatedObjectMap                     │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ├── objc_object → [                    │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │   key → AssociatedObject {           │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │     value → ...                      │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │     policy → ...                     │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │   },                                │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │   key → ...                          │       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └────────────────────────────────────────┘       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │                                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  policy:                                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • OBJC_ASSOCIATION_ASSIGN          — 弱引用       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • OBJC_ASSOCIATION_RETAIN_NONATOMIC — 强引用    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • OBJC_ASSOCIATION_COPY          — 复制          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • OBJC_ASSOCIATION_RETAIN        — 强引用        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • OBJC_ASSOCIATION_COPY_NONATOMIC — 复制         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Category 添加属性的标准方式（关联对象）：</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@implementation</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UIView</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (MyExtension)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> kBackgroundColorKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setMyBackgroundColor:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(UIColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)color {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    objc_setAssociatedObject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kBackgroundColorKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, color, OBJC_ASSOCIATION_RETAIN_NONATOMIC);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- (UIColor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">myBackgroundColor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> objc_getAssociatedObject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kBackgroundColorKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 动态添加 Ivar 的高级技巧：</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> _dynamicIvarKey;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@implementation</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyView</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">+ (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    static</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> dispatch_once_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> onceToken;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    dispatch_once</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">onceToken, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">^</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Ivar ivar </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ivar_addIvar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;_myValue&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">sizeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSInteger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 通过 KVC 访问</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSInteger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">myValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> valueForKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;_myValue&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">- (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setMyValue:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSInteger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)value {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> setValue:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@(value) </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;_myValue&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@end</span></span></code></pre></div><hr><h2 id="_6-protocol-witness-table" tabindex="-1">6. Protocol Witness Table <a class="header-anchor" href="#_6-protocol-witness-table" aria-label="Permalink to &quot;6. Protocol Witness Table&quot;">​</a></h2><h3 id="_6-1-原理详解" tabindex="-1">6.1 原理详解 <a class="header-anchor" href="#_6-1-原理详解" aria-label="Permalink to &quot;6.1 原理详解&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Protocol Witness Table（协议见证表）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Swift 协议与 ObjC 协议的根本区别：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                  协议实现方式                            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ObjC Protocol：                                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 运行时查找（method signature match）            │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 通过 @protocol + @interface 声明                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 通过 respondsToSelector: 检查                      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 动态分发（selector）                              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 性能：运行时查找，有开销                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Swift Protocol（非 @objc）：                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 编译期绑定（Witness Table）                       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 通过 conforming types 声明                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 通过 protocol witness table 静态查找               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 静态分发（零开销）                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 性能：编译期确定，零开销                           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Witness Table 结构：                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌──────────────────────────────────────────┐      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Protocol Witness Table                    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ┌───────────────────────────────────┐    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  Type: MyClass                     │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  → implements Protocol1:           │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │    ├─ method1 → MyClass.method1    │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │    ├─ method2 → MyClass.method2    │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │    └─ associatedType → MyClass.Item│    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  → implements Protocol2:           │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │    ├─ methodA → MyClass.methodA    │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │    └─ methodB → MyClass.methodB    │    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └───────────────────────────────────┘    │      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └──────────────────────────────────────────┘      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  内存布局：                                         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • Witness Table 存储在可执行文件的 __swift_protos 段  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • 每个 conforming type 有一个 Witness Table       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • Runtime 通过 Protocol 和 Witness Table 查找       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│    实现方法                                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└───────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_6-2-protocol-的动态分发" tabindex="-1">6.2 Protocol 的动态分发 <a class="header-anchor" href="#_6-2-protocol-的动态分发" aria-label="Permalink to &quot;6.2 Protocol 的动态分发&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Protocol 动态分发（Swift）：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">当使用 @objc protocol 时，Swift 会为协议生成 Objective-C 兼容的接口，</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">通过 selector 动态查找方法。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  @objc protocol vs Swift protocol               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  @objc protocol:                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 运行时分发（selector 查找）             │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 需要继承 NSObjectProtocol             │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 方法参数必须是桥接兼容类型              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 通过 method signature match           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 生成 Objective-C 兼容接口              │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                 │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Swift protocol（非 @objc）:                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 编译期分发（Witness Table）           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 不需要继承 NSObjectProtocol           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 可以使用泛型、关联类型                 │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 通过 Witness Table 查找               │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  • 零开销静态分发                         │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Protocol Witness Table 查找过程：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">1. 编译期：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 类型 conforming 协议 → 生成 Witness Table</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • Witness Table 存储在 __swift_protos 段</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 每个方法映射到具体实现</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">2. 运行时：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 通过 Protocol 和 Witness Table 查找方法</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 查找时间：O(1)（哈希表查找）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • 零开销（编译期确定）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">3. 泛型约束：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • protocol&lt;Protocol&gt; 约束 → 编译期检查</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   • @objc 协议约束 → 运行时检查</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><hr><h2 id="_7-swift-runtime" tabindex="-1">7. Swift Runtime <a class="header-anchor" href="#_7-swift-runtime" aria-label="Permalink to &quot;7. Swift Runtime&quot;">​</a></h2><h3 id="_7-1-swift-类型系统" tabindex="-1">7.1 Swift 类型系统 <a class="header-anchor" href="#_7-1-swift-类型系统" aria-label="Permalink to &quot;7.1 Swift 类型系统&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Swift 类型系统 vs Objective-C 类型系统：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                    类型系统对比                               │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ObjC                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">├──────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  类型安全                          │  ✅ (可选)             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ✅ (强)              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  泛型                              │  ✅ (强，编译期)       │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ❌                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  协议                              │  ✅ (Witness Table)    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ✅ (protocol 对象)    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  值类型 vs 引用类型                 │  ✅ (struct/class)     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ❌ (只有类)           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  内存管理                          │  ✅ (ARC)             │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ✅ (ARC/MRC)         │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  元类型（Metatype）                │  ✅ (Type/Metatype)    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ❌ (只有 Class)      │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  函数类型                           │  ✅ (函数是对象)        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                    │  ✅ (block)           │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└──────────────────────────────────────────────────────────┘</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Swift Metatype：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Swift 元类型（Metatype）                          │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  类型信息（Type Metadata）存储在：                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • _swift_reflection_tables                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • __swift_types 段（Mach-O）                   │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  元类型结构：                                     │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  ┌─────────────────────────────────────────┐    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  Swift Metatype                           │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  ┌────────────────────────────────────┐ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  TypeDescriptor                     │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • Name（名称）                      │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • Size（内存大小）                   │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • Alignment（内存对齐）              │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • Flags（标志位）                    │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • ProtocolConformance（协议一致性）  │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • MemberDescriptor（成员列表）       │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  │  • SuperclassDescriptor（父类描述）    │ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  │  └────────────────────────────────────┘ │    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  └─────────────────────────────────────────┘    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│                                                  │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  Metatype 用法：                                │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • MyClass.self → 类对象                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • MyClass.Type → 元类型                        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • NSStringFromClass(myClass) → 类名字符串        │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • class_getName(cls) → 类名字符串              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • object_getClass(obj) → 动态类型              │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">│  • type(of: obj) → 运行时类型                    │</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><h3 id="_7-2-runtime-调试与调试技巧" tabindex="-1">7.2 Runtime 调试与调试技巧 <a class="header-anchor" href="#_7-2-runtime-调试与调试技巧" aria-label="Permalink to &quot;7.2 Runtime 调试与调试技巧&quot;">​</a></h3><div class="language-objc vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objc</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Runtime 调试工具：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 遍历类的所有方法</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> printClassMethods</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> cls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> methodCount;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Method </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">methods </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_copyMethodList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">methodCount);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> methodCount; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Method method </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> methods</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i];</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        SEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> method_getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(method);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">types </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> method_getTypeEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(method);</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Method: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sel_getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(sel), types);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    free</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(methods);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 遍历类的所有实例变量</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> printClassIvars</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> cls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ivarCount;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Ivar </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ivars </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_copyIvarList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ivarCount);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ivarCount; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Ivar ivar </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> ivars</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i];</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ivar_getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ivar);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        const</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ivar_getTypeEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ivar);</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Ivar: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">)&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, name, type);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    free</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ivars);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 遍历类的协议</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> printClassProtocols</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> cls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> protocolCount;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Protocol </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">protocols </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class_copyProtocolList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">protocolCount);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> protocolCount; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Protocol </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">protocol </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> protocols</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i];</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Protocol: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">protocol_getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(protocol));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    free</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(protocols);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 检查对象是否能响应某个 selector</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BOOL</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> canRespondToSelector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">id</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> obj</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SEL</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> sel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [obj </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">respondsToSelector:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sel];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. 获取类的实例大小</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> printClassSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Class</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> cls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Instance size: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%zu</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bytes&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">class_getInstanceSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls));</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Aligned size: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%zu</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bytes&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">class_getAlignedInstanceSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls));</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    NSLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;Ivar layout: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%@</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">class_getIvarLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cls) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Yes&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> :</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;No&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_8-面试题汇总" tabindex="-1">8. 面试题汇总 <a class="header-anchor" href="#_8-面试题汇总" aria-label="Permalink to &quot;8. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: Runtime 的消息发送过程？</strong></p><p><strong>答</strong>：</p><ol><li>从 receiver 的 isa 指针获取 class</li><li>在 class 的 cache 中查找 SEL（O(1) 哈希查找）</li><li>未命中 → 在 method list 中遍历查找</li><li>未找到 → 调用 +resolveInstanceMethod:（动态解析）</li><li>未处理 → 调用 -forwardingTargetForSelector:（转发）</li><li>未处理 → 生成 methodSignature → forwardInvocation（最终转发）</li><li>未处理 → +doesNotRecognizeSelector（崩溃）</li><li>找到 IMP → 执行</li></ol><p><strong>Q2: Method Swizzling 线程安全吗？</strong></p><p><strong>答</strong>：</p><ul><li>Swizzling 本身不是线程安全的</li><li>必须在 +load 中执行（系统保证线程安全）</li><li>或者使用 dispatch_once 确保只执行一次</li><li>多线程同时 swizzle 同一类可能导致混乱</li><li>✅ 最佳实践：+load + dispatch_once</li></ul><p><strong>Q3: Category 与 Extension 的区别？</strong></p><p><strong>答</strong>：</p><ul><li><strong>Category</strong>：运行时加载，方法可以覆盖原类方法，不能添加 ivar，可以添加属性（通过关联对象）</li><li><strong>Extension（匿名 Category）</strong>：编译时加载，方法添加到原类 method list 的末尾，可以添加 ivar</li><li><strong>查找优先级</strong>：Extension &gt; Category &gt; 原类方法 &gt; 父类方法</li></ul><p><strong>Q4: Protocol Witness Table 的工作原理？</strong></p><p><strong>答</strong>：</p><ul><li>编译期：类型 conforming 协议时生成 Witness Table</li><li>存储在 __swift_protos 段</li><li>运行时通过 Witness Table 查找方法实现（O(1) 哈希查找）</li><li>零开销静态分发</li><li>与 ObjC 协议（运行时查找）不同</li></ul><p><strong>Q5: Associated Objects 的实现原理？</strong></p><p><strong>答</strong>：</p><ul><li>Runtime 维护一个全局的 AssociatedObjectMap</li><li>key 是 object 和 ivar key 的组合</li><li>policy 控制引用计数行为（retain/copy/assign）</li><li>通过 objc_setAssociatedObject/objc_getAssociatedObject 访问</li></ul><p><strong>Q6: 为什么 Category 不能添加实例变量？</strong></p><p><strong>答</strong>：</p><ul><li>Category 的内存布局中不包含 ivar 字段</li><li>Category 的方法通过 runtime 动态插入</li><li>如果要添加数据存储，使用 Associated Objects（关联对象）</li></ul><hr><h2 id="_9-参考资源" tabindex="-1">9. 参考资源 <a class="header-anchor" href="#_9-参考资源" aria-label="Permalink to &quot;9. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/objectivec/objective-c_runtime" target="_blank" rel="noreferrer">Apple: Objective-C Runtime Reference</a></li><li><a href="https://developer.apple.com/documentation/objectivec/nsobject" target="_blank" rel="noreferrer">Apple: Class Reference</a></li><li><a href="https://developer.apple.com/documentation/objectivec/class/1418767-method" target="_blank" rel="noreferrer">Apple: Method Swizzling</a></li><li><a href="https://developer.apple.com/documentation/objectivec/objc_associatedobject" target="_blank" rel="noreferrer">Apple: Associated Objects</a></li><li><a href="https://www.hackingwithswift.com/read/33/7/runtime" target="_blank" rel="noreferrer">Hacking with Swift: Runtime</a></li><li><a href="https://nshipster.com/nsobject" target="_blank" rel="noreferrer">NSHipster: NSObject</a></li><li><a href="https://nshipster.com/protocol" target="_blank" rel="noreferrer">NSHipster: Protocol</a></li><li><a href="https://www.objc.io/issues/6-ios7/runtime/" target="_blank" rel="noreferrer">objc.io: Runtime</a></li><li><a href="https://developer.apple.com/videos/play/wwdc2020/10137" target="_blank" rel="noreferrer">WWDC 2020: Meet the Objective-C Runtime</a></li></ul>`,69)])])}const y=i(p,[["render",h]]);export{g as __pageData,y as default};
