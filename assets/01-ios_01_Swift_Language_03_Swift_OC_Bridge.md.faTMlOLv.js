import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const d=JSON.parse('{"title":"03 - Swift ↔ Objective-C 混编深度指南","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/01_Swift_Language/03_Swift_OC_Bridge.md","filePath":"01-ios/01_Swift_Language/03_Swift_OC_Bridge.md"}'),l={name:"01-ios/01_Swift_Language/03_Swift_OC_Bridge.md"};function e(t,s,h,k,r,c){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="_03-swift-↔-objective-c-混编深度指南" tabindex="-1">03 - Swift ↔ Objective-C 混编深度指南 <a class="header-anchor" href="#_03-swift-↔-objective-c-混编深度指南" aria-label="Permalink to &quot;03 - Swift ↔ Objective-C 混编深度指南&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-混编基础与架构">混编基础与架构</a></li><li><a href="#2-混编编译原理">混编编译原理</a></li><li><a href="#3-桥接文件完整机制">桥接文件完整机制</a></li><li><a href="#4-类型映射完整分析">类型映射完整分析</a></li><li><a href="#5-toll-free-bridging-深度解析">Toll-Free Bridging 深度解析</a></li><li><a href="#6-selector-机制完整分析">selector 机制完整分析</a></li><li><a href="#7-objc-与-objcmembers-完整解析">@objc 与 @objcMembers 完整解析</a></li><li><a href="#8-混编协议深度分析">混编协议深度分析</a></li><li><a href="#9-混编类深度分析">混编类深度分析</a></li><li><a href="#10-混编内存管理">混编内存管理</a></li><li><a href="#11-混编常见问题与解决方案">混编常见问题与解决方案</a></li><li><a href="#12-混编性能分析">混编性能分析</a></li><li>[Swift ↔ Objective-C 完整对比表](#13-swift- Objective-c-完整对比表)</li><li><a href="#14-面试题汇总">面试题汇总</a></li></ol><hr><h2 id="_1-混编基础与架构" tabindex="-1">1. 混编基础与架构 <a class="header-anchor" href="#_1-混编基础与架构" aria-label="Permalink to &quot;1. 混编基础与架构&quot;">​</a></h2><h3 id="_1-1-swift-与-objective-c-混编完整架构" tabindex="-1">1.1 Swift 与 Objective-C 混编完整架构 <a class="header-anchor" href="#_1-1-swift-与-objective-c-混编完整架构" aria-label="Permalink to &quot;1.1 Swift 与 Objective-C 混编完整架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 混编架构总览：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Swift 项目（Swift 为主）                                    │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────┐           │</span></span>
<span class="line"><span>│  │  Swift Code (.swift)                           │           │</span></span>
<span class="line"><span>│  │  ↓                                             │           │</span></span>
<span class="line"><span>│  │  Swift Compiler → *-Swift.h (自动桥接头)       │           │</span></span>
<span class="line"><span>│  │  ↓                                             │           │</span></span>
<span class="line"><span>│  │  Bridging Header (.h)                          │           │</span></span>
<span class="line"><span>│  │  ↓                                             │           │</span></span>
<span class="line"><span>│  │  Objective-C Code (.m/.h)                      │           │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────┘           │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Objective-C 项目（OC 为主）                                 │</span></span>
<span class="line"><span>│  ┌───────────────────────────────────────────────┐           │</span></span>
<span class="line"><span>│  │  Objective-C Code (.m/.h)                      │           │</span></span>
<span class="line"><span>│  │  ↓                                             │           │</span></span>
<span class="line"><span>│  │  Swift Compiler → Product-Swift.h (自动)       │           │</span></span>
<span class="line"><span>│  │  ↓                                             │           │</span></span>
<span class="line"><span>│  │  Swift Code (.swift)                            │           │</span></span>
<span class="line"><span>│  └───────────────────────────────────────────────┘           │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  混编方向：                                                  │</span></span>
<span class="line"><span>│  • Swift → Objective-C：@objc 标记的类/方法/协议可被 OC 访问  │</span></span>
<span class="line"><span>│  • Objective-C → Swift：通过桥接头/自动生成的头文件           │</span></span>
<span class="line"><span>│  • Toll-Free Bridging：Foundation 类型自动桥接              │</span></span>
<span class="line"><span>│  • 桥接头自动生成/管理（Xcode 自动处理）                     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-swift-与-objective-c-混编方式" tabindex="-1">1.2 Swift 与 Objective-C 混编方式 <a class="header-anchor" href="#_1-2-swift-与-objective-c-混编方式" aria-label="Permalink to &quot;1.2 Swift 与 Objective-C 混编方式&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>混编方式完整分类：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 混编方式                │ 说明                                │ 复杂度 │</span></span>
<span class="line"><span>├────────────────────────┼───────────────────────────────────┼───────┤</span></span>
<span class="line"><span>│ Bridging Header        │ OC 头文件注入 Swift 编译环境      │ ⭐     │</span></span>
<span class="line"><span>│ *-Swift.h 自动桥接     │ Xcode 自动生成 Swift 到 OC 的桥接  │ ⭐     │</span></span>
<span class="line"><span>│ Toll-Free Bridging     │ NSString/NSData 等自动桥接        │ ⭐     │</span></span>
<span class="line"><span>│ selector 桥接          │ @selector 调用 Swift 方法          │ ⭐⭐   │</span></span>
<span class="line"><span>│ Protocol 混编          │ OC 协议与 Swift 协议互操作         │ ⭐⭐   │</span></span>
<span class="line"><span>│ Class 混编             │ OC 类与 Swift 类互操作            │ ⭐⭐⭐ │</span></span>
<span class="line"><span>│ KVO 混编               │ Swift 对象 KVO                    │ ⭐⭐⭐ │</span></span>
<span class="line"><span>│ Runtime 混编           │ objc_msgSend 调用 Swift           │ ⭐⭐⭐ │</span></span>
<span class="line"><span>│ GCD Bridge             │ DispatchQueue bridge               │ ⭐⭐   │</span></span>
<span class="line"><span>│ CF/NS 桥接             │ CoreFoundation ↔ Foundation       │ ⭐     │</span></span>
<span class="line"><span>└────────────────────────┴───────────────────────────────────┴───────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>混编要求：</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ • Swift 类需要继承 NSObject（才能被 OC 访问）               │</span></span>
<span class="line"><span>│ • Swift 方法需要 @objc 标记（默认仅继承 NSObject 的 public 方法）│</span></span>
<span class="line"><span>│ • OC 头文件需要在 Bridging Header 中导入                    │</span></span>
<span class="line"><span>│ • Swift target 需要开启 Defines Module = YES               │</span></span>
<span class="line"><span>│ • OC 类需要 @objc 或 @objcMembers 标记                     │</span></span>
<span class="line"><span>│ • Swift 枚举需要 @objc 才能用于 OC（enum 必须 @objc 才能被 OC 访问） │</span></span>
<span class="line"><span>│ • Swift 协议需要 @objc 才能被 OC 遵循                      │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_2-混编编译原理" tabindex="-1">2. 混编编译原理 <a class="header-anchor" href="#_2-混编编译原理" aria-label="Permalink to &quot;2. 混编编译原理&quot;">​</a></h2><h3 id="_2-1-编译流程完整分析" tabindex="-1">2.1 编译流程完整分析 <a class="header-anchor" href="#_2-1-编译流程完整分析" aria-label="Permalink to &quot;2.1 编译流程完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 混编编译流程完整分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Swift → Objective-C 桥接流程：                                │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 1. Swift 编译器编译 .swift 文件                              │</span></span>
<span class="line"><span>│ 2. 生成 Swift Module Info（模块信息）                         │</span></span>
<span class="line"><span>│ 3. 生成 *-Swift.h（桥接头文件）                              │</span></span>
<span class="line"><span>│    • 包含所有 @objc 标记的类型/方法/属性                      │</span></span>
<span class="line"><span>│    • 不包含 private 成员                                     │</span></span>
<span class="line"><span>│    • 不包含未标记 @objc 的 public 成员                       │</span></span>
<span class="line"><span>│ 4. OC 代码 #import &quot;Project-Swift.h&quot; 访问 Swift 类型          │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 编译细节：                                                   │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ *-Swift.h 生成规则：                                     │ │</span></span>
<span class="line"><span>│ │ • 包含 @objc 标注的类型（class, protocol, enum, extension）│ │</span></span>
<span class="line"><span>│ │ • 包含继承自 NSObject 的 public 类（自动 @objc）          │ │</span></span>
<span class="line"><span>│ │ • 包含 @objc 标注的 struct（部分支持）                    │ │</span></span>
<span class="line"><span>│ │ • 包含 @objc 标注的函数和全局变量                         │ │</span></span>
<span class="line"><span>│ │ • 不包含：                                             │ │</span></span>
<span class="line"><span>│ │   • 未标记 @objc 的 public 成员                          │ │</span></span>
<span class="line"><span>│ │   • private 成员                                       │ │</span></span>
<span class="line"><span>│ │   • 泛型类型（需要手动声明具体类型）                      │ │</span></span>
<span class="line"><span>│ │   • 内部类型                                           │ │</span></span>
<span class="line"><span>│ │ • @objcMembers 自动标记所有后续成员为 @objc               │ │</span></span>
<span class="line"><span>│ │ • @objc 需要继承 NSObject（类）或遵循 @objc 协议          │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Objective-C → Swift 桥接流程：                              │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 1. Swift Compiler 编译所有 .swift 文件                       │</span></span>
<span class="line"><span>│ 2. 生成 Swift Module（.swiftmodule）                         │</span></span>
<span class="line"><span>│ 3. 生成 Product-Swift.h（自动桥接头）                        │</span></span>
<span class="line"><span>│    • 自动包含所有 @objc 成员                                  │</span></span>
<span class="line"><span>│    • 位于 DerivedData 目录下                                  │</span></span>
<span class="line"><span>│ 4. OC 代码自动可访问 Swift 类型                               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 编译配置要求：                                               │</span></span>
<span class="line"><span>│ ┌──────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ • SWIFT_OBJC_BRIDGING_HEADER → Bridging Header 路径     │ │</span></span>
<span class="line"><span>│ │ • SWIFT_OBJC_INTERFACE_HEADER_NAME → *-Swift.h 名称     │ │</span></span>
<span class="line"><span>│ │ • DEFINES_MODULE → YES（必须）                           │ │</span></span>
<span class="line"><span>│ │ • SWIFT_COMPILATION_MODE →人头（Incremental 或人头）     │ │</span></span>
<span class="line"><span>│ │ • OTHER_SWIFT_FLAGS → -Xcc -fmodule-name=...             │ │</span></span>
<span class="line"><span>│ │ • SKIP_INSTALL → NO（确保生成模块）                        │ │</span></span>
<span class="line"><span>│ └─────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-桥接头文件完整分析" tabindex="-1">2.2 桥接头文件完整分析 <a class="header-anchor" href="#_2-2-桥接头文件完整分析" aria-label="Permalink to &quot;2.2 桥接头文件完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Bridging Header 完整机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Bridging Header 核心机制：                                    │</span></span>
<span class="line"><span>│ • 一个 Xcode target 只能有一个 Bridging Header                │</span></span>
<span class="line"><span>│ • 文件扩展名为 .h，名称自定义（通常 &lt;Target&gt;-Bridging-Header.h）│</span></span>
<span class="line"><span>│ • 自动包含在 Swift 编译环境中                                  │</span></span>
<span class="line"><span>│ • 不需要在 Swift 代码中手动导入                                │</span></span>
<span class="line"><span>│ • 包含的 OC 类型自动可访问                                     │</span></span>
<span class="line"><span>│ • 可以包含 OC 头文件、C 头文件                                │</span></span>
<span class="line"><span>│ • 不能包含 .m/.swift 文件                                     │</span></span>
<span class="line"><span>│ • 不能包含 Swift 代码                                        │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 桥接头的完整内容示例：                                        │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  // Project-Bridging-Header.h                              │ │</span></span>
<span class="line"><span>│  #import &quot;OCHeader1.h&quot;                                      │ │</span></span>
<span class="line"><span>│  #import &quot;OCHeader2.h&quot;                                      │ │</span></span>
<span class="line"><span>│  #import &lt;UIKit/UIKit.h&gt;                                    │ │</span></span>
<span class="line"><span>│  #import &quot;ThirdPartyHeader.h&quot;                               │ │</span></span>
<span class="line"><span>│  // C 头文件                                                │ │</span></span>
<span class="line"><span>│  #import &quot;c_utility.h&quot;                                      │ │</span></span>
<span class="line"><span>│  // 前置声明                                                │ │</span></span>
<span class="line"><span>│  @class MyClass;                                             │ │</span></span>
<span class="line"><span>│  // 类型别名                                                │ │</span></span>
<span class="line"><span>│  typedef NS_ENUM(NSInteger, CustomEnum) { ... };            │ │</span></span>
<span class="line"><span>│ └───────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Bridging Header 的生成与管理：                               │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │  • 手动创建：Xcode 会自动提示创建                         │ │</span></span>
<span class="line"><span>│ │  • Build Settings → Objective-C Bridging Header          │ │</span></span>
<span class="line"><span>│ │  • Xcode 12+ 使用 Swift Package Manager 时无需桥接头     │ │</span></span>
<span class="line"><span>│ │  • 注意：桥接头只能用于 Swift 项目，不能用于纯 OC 项目     │ │</span></span>
<span class="line"><span>│ │  • 桥接头不能用于 Swift Package                            │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_3-类型映射完整分析" tabindex="-1">3. 类型映射完整分析 <a class="header-anchor" href="#_3-类型映射完整分析" aria-label="Permalink to &quot;3. 类型映射完整分析&quot;">​</a></h2><h3 id="_3-1-完整类型映射表" tabindex="-1">3.1 完整类型映射表 <a class="header-anchor" href="#_3-1-完整类型映射表" aria-label="Permalink to &quot;3.1 完整类型映射表&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 类型映射完整分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Swift 类型          │ Objective-C 类型          │ 桥接方式   │</span></span>
<span class="line"><span>├─────────────────────┼─────────────────────────┼───────────┤</span></span>
<span class="line"><span>│ Bool               │ BOOL                     │ 自动桥接   │</span></span>
<span class="line"><span>│ Int                │ NSInteger / NSInteger    │ 自动桥接   │</span></span>
<span class="line"><span>│ UInt               │ NSUInteger               │ 自动桥接   │</span></span>
<span class="line"><span>│ Int8               │ int8_t                   │ 自动桥接   │</span></span>
<span class="line"><span>│ Int16              │ int16_t                  │ 自动桥接   │</span></span>
<span class="line"><span>│ Int32              │ int32_t                  │ 自动桥接   │</span></span>
<span class="line"><span>│ Int64              │ int64_t                  │ 自动桥接   │</span></span>
<span class="line"><span>│ Float              │ CGFloat / float          │ 自动桥接   │</span></span>
<span class="line"><span>│ Double             │ CGFloat / double         │ 自动桥接   │</span></span>
<span class="line"><span>│ String             │ NSString                 │ Toll-Free │</span></span>
<span class="line"><span>│ String?            │ NSString? / Optional     │ 可选桥接   │</span></span>
<span class="line"><span>│ Character          │（无直接映射）            │ -         │</span></span>
<span class="line"><span>│ Array&lt;T&gt;           │ NSArray&lt;T&gt;               │ Toll-Free │</span></span>
<span class="line"><span>│ Array&lt;T&gt;?          │ NSArray&lt;T&gt;?              │ Toll-Free │</span></span>
<span class="line"><span>│ Dictionary&lt;K,V&gt;    │ NSDictionary&lt;K,V&gt;      │ Toll-Free │</span></span>
<span class="line"><span>│ Dictionary&lt;K,V&gt;?   │ NSDictionary&lt;K,V&gt;?     │ Toll-Free │</span></span>
<span class="line"><span>│ Set&lt;T&gt;             │ NSSet&lt;T&gt;                 │ Toll-Free │</span></span>
<span class="line"><span>│ Set&lt;T&gt;?            │ NSSet&lt;T&gt;?                │ Toll-Free │</span></span>
<span class="line"><span>│ Tuple              │（无直接映射）            │ -         │</span></span>
<span class="line"><span>│ class (NSObject)   │ NSObject 子类            │ 自动桥接   │</span></span>
<span class="line"><span>│ class (非 NSObject)│（需 @objc 桥接）        │ @objc     │</span></span>
<span class="line"><span>│ struct             │（需 @objc 桥接）        │ @objc     │</span></span>
<span class="line"><span>│ enum               │ NS_ENUM / NS_OPTIONS     │ @objc     │</span></span>
<span class="line"><span>│ protocol           │ @protocol                │ @objc     │</span></span>
<span class="line"><span>│ closure            │ SEL / Block              │ 桥接       │</span></span>
<span class="line"><span>│ (T1, T2) -&gt; U      │（需手动包装）           │ -         │</span></span>
<span class="line"><span>│ Optional&lt;T&gt;        │ T? / id                  │ 可选桥接   │</span></span>
<span class="line"><span>│ Any                │ id                       │ 桥接       │</span></span>
<span class="line"><span>│ AnyObject          │ id                       │ 桥接       │</span></span>
<span class="line"><span>│ Void               │ void                     │ 自动桥接   │</span></span>
<span class="line"><span>│ Never              │（无映射）                │ -         │</span></span>
<span class="line"><span>│ data               │ NSData                   │ Toll-Free │</span></span>
<span class="line"><span>│ Date               │ NSDate                   │ Toll-Free │</span></span>
<span class="line"><span>│ URL                │ NSURL                    │ Toll-Free │</span></span>
<span class="line"><span>│ Data               │ NSData                   │ Toll-Free │</span></span>
<span class="line"><span>│ UUID               │ NSUUID                   │ Toll-Free │</span></span>
<span class="line"><span>│ NSRange            │ NSRange                  │ 自动桥接   │</span></span>
<span class="line"><span>│ CGPoint            │ CGPoint                  │ Toll-Free │</span></span>
<span class="line"><span>│ CGSize             │ CGSize                   │ Toll-Free │</span></span>
<span class="line"><span>│ CGRect             │ CGRect                   │ Toll-Free │</span></span>
<span class="line"><span>│ CGFloat            │ CGFloat                  │ Toll-Free │</span></span>
<span class="line"><span>│ NSKeyValue         │ NSKeyValueCoding         │ Toll-Free │</span></span>
<span class="line"><span>│ NSRange            │ NSRange                  │ 自动桥接   │</span></span>
<span class="line"><span>│ NSError            │ NSError                  │ Toll-Free │</span></span>
<span class="line"><span>│ NSIndexPath        │ NSIndexPath              │ Toll-Free │</span></span>
<span class="line"><span>│ NSRange            │ NSRange                  │ Toll-Free │</span></span>
<span class="line"><span>│ NSNotification     │ NSNotification           │ Toll-Free │</span></span>
<span class="line"><span>│ Selector           │ Selector / SEL           │ 桥接       │</span></span>
<span class="line"><span>│ Timer              │ NSTimer                  │ Toll-Free │</span></span>
<span class="line"><span>│ UserDefaults       │ NSUserDefaults           │ Toll-Free │</span></span>
<span class="line"><span>│ FileManager        │ NSFileManager            │ Toll-Free │</span></span>
<span class="line"><span>│ URLSession         │ NSURLSession             │ Toll-Free │</span></span>
<span class="line"><span>└────────────────────┴─────────────────────────┴────────────┘</span></span></code></pre></div><h3 id="_3-2-桥接类型详细分析" tabindex="-1">3.2 桥接类型详细分析 <a class="header-anchor" href="#_3-2-桥接类型详细分析" aria-label="Permalink to &quot;3.2 桥接类型详细分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>桥接类型分类完整分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Toll-Free Bridging（免费桥接）：                                │</span></span>
<span class="line"><span>│ • CoreFoundation ↔ Foundation 类型自动桥接                    │</span></span>
<span class="line"><span>│ • 零开销转换（共享底层数据结构）                                │</span></span>
<span class="line"><span>│ • CFTypeRef ↔ id（桥接为任意类型）                           │</span></span>
<span class="line"><span>│ • CFTypeRef ↔ void *（桥接为任意指针）                       │</span></span>
<span class="line"><span>│ • 桥接对（成对类型）：                                       │</span></span>
<span class="line"><span>│   • CFArray ↔ NSArray                                          │</span></span>
<span class="line"><span>│   • CFDictionary ↔ NSDictionary                               │</span></span>
<span class="line"><span>│   • CFString ↔ NSString                                       │</span></span>
<span class="line"><span>│   • CFData ↔ NSData                                           │</span></span>
<span class="line"><span>│   • CFDate ↔ NSDate                                           │</span></span>
<span class="line"><span>│   • CFURL ↔ NSURL                                             │</span></span>
<span class="line"><span>│   • CFUUID ↔ NSUUID                                           │</span></span>
<span class="line"><span>│   • CFNumber ↔ NSNumber                                       │</span></span>
<span class="line"><span>│   • CFRuntimeObject ↔ NSObject（运行时对象）                   │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Toll-Free 桥接的底层原理：                                    │</span></span>
<span class="line"><span>│ • CFType 和 NS 类型共享相同的 isa 指针                        │</span></span>
<span class="line"><span>│ • CF 类型的内存布局与 NS 类型完全兼容                           │</span></span>
<span class="line"><span>│ • CFStringRef 可以直接传给 NSString* 参数                      │</span></span>
<span class="line"><span>│ • 不需要调用桥接函数（零开销）                                  │</span></span>
<span class="line"><span>│ • 桥接是类型双写（同一块内存有两个视角）                        │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 可选桥接（Optional Bridging）：                               │</span></span>
<span class="line"><span>│ • Swift Optional ↔ Objective-C nil                            │</span></span>
<span class="line"><span>│ • String? ↔ NSString?（可选桥接）                           │</span></span>
<span class="line"><span>│ • Array? ↔ NSArray?（可选桥接）                            │</span></span>
<span class="line"><span>│ • Dictionary? ↔ NSDictionary?（可选桥接）                    │</span></span>
<span class="line"><span>│ • 桥接为 nil 时转换为 nil（Objective-C 中的 null）            │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc 桥接（ObjC 桥接）：                                     │</span></span>
<span class="line"><span>│ • Swift struct/class/enum/protocol 需要 @objc 标记            │</span></span>
<span class="line"><span>│ • @objc 类型桥接为 Objective-C 类型                           │</span></span>
<span class="line"><span>│ • @objc enum 需要指定 rawValue 类型                           │</span></span>
<span class="line"><span>│ • @objc protocol 需要所有方法都是可选/必须                     │</span></span>
<span class="line"><span>│ • @objc 类型的内存布局与 Objective-C 兼容                     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 非桥接类型：                                                  │</span></span>
<span class="line"><span>│ • Swift tuple ↔ Objective-C（无直接映射）                    │</span></span>
<span class="line"><span>│ • Swift protocol（非 @objc）↔ Objective-C（无直接映射）      │</span></span>
<span class="line"><span>│ • Swift enum（非 @objc）↔ Objective-C（无直接映射）          │</span></span>
<span class="line"><span>│ • Swift Result ↔ Objective-C（无直接映射）                  │</span></span>
<span class="line"><span>│ • Swift Never ↔ Objective-C（无直接映射）                    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-3-类型映射完整代码示例" tabindex="-1">3.3 类型映射完整代码示例 <a class="header-anchor" href="#_3-3-类型映射完整代码示例" aria-label="Permalink to &quot;3.3 类型映射完整代码示例&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// === 类型映射示例 ===</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. String ↔ NSString</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Foundation</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftString: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Hello&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsString: NSString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSString  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ocString: NSString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Hello&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftString2: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ocString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> String</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. Array ↔ NSArray</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftArray: [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;a&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;c&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsArray: NSArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSArray  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ocArray: NSArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;a&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;c&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftArray2: [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ocArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. Dictionary ↔ NSDictionary</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftDict: [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;a&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;b&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsDict: NSDictionary </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftDict </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSDictionary  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ocDict: NSDictionary </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;a&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;b&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSDictionary</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftDict2: [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ocDict </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. Data ↔ NSData</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftData: Data </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Hello&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">using</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">utf8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsData: NSData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSData  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftData2: Data </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Data</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. URL ↔ NSURL</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftURL: URL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsURL: NSURL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftURL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSURL  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftURL2: URL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsURL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> URL</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. Date ↔ NSDate</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftDate: Date </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsDate: NSDate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftDate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSDate  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftDate2: Date </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsDate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Date</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 7. UUID ↔ NSUUID</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftUUID: UUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UUID</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsUUID: NSUUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftUUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSUUID  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftUUID2: UUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsUUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UUID</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 8. Optional 桥接</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> optString: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;test&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsOptString: NSString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> optString  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// String? → NSString?</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nilString: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsNilString: NSString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nilString  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// nil → nil</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 9. 桥接类型转换</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> anyValue: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Any</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Hello&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsAny: NSObject </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> anyValue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSObject  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Any → NSObject</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 10. 桥接类型安全</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maybeString: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> optString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 可选桥接</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> safeString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maybeString {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> safeString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSString  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// String → NSString</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 11. CF 类型桥接</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFStringCreateWithBytes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;test&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CChar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">strlen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;test&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">utf8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFString</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> String</span></span></code></pre></div><hr><h2 id="_4-toll-free-bridging-深度解析" tabindex="-1">4. Toll-Free Bridging 深度解析 <a class="header-anchor" href="#_4-toll-free-bridging-深度解析" aria-label="Permalink to &quot;4. Toll-Free Bridging 深度解析&quot;">​</a></h2><h3 id="_4-1-toll-free-bridging-完整深度分析" tabindex="-1">4.1 Toll-Free Bridging 完整深度分析 <a class="header-anchor" href="#_4-1-toll-free-bridging-完整深度分析" aria-label="Permalink to &quot;4.1 Toll-Free Bridging 完整深度分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Toll-Free Bridging 完整深度分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Toll-Free Bridging 的核心原理：                              │</span></span>
<span class="line"><span>│ • 桥接对（CF/NS 类型对）共享完全相同的内存布局                 │</span></span>
<span class="line"><span>│ • 桥接是类型双写（同一块内存有两个不同的类型视图）              │</span></span>
<span class="line"><span>│ • 零开销转换（不需要复制数据）                                │</span></span>
<span class="line"><span>│ • 桥接对可以互相传递（不改变内存布局）                        │</span></span>
<span class="line"><span>│ • 桥接对由 Apple 维护（CoreFoundation ↔ Foundation）         │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Toll-Free 桥接的完整列表：                                    │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ 桥接对                        │ 说明                        │</span></span>
<span class="line"><span>│ ├───────────────────────────────────────────────────────────┤ │</span></span>
<span class="line"><span>│ CFBoolean ↔ NSBoolean         │ 布尔类型                    │</span></span>
<span class="line"><span>│ CFArray ↔ NSArray             │ 数组                        │</span></span>
<span class="line"><span>│ CFBridgingRetain → id         │ CF → id 转换                │</span></span>
<span class="line"><span>│ CFBridgingRelease → CFTypeRef  │ id → CF 转换              │</span></span>
<span class="line"><span>│ CFData ↔ NSData               │ 数据                        │</span></span>
<span class="line"><span>│ CFDate ↔ NSDate               │ 日期                        │</span></span>
<span class="line"><span>│ CFDelayedLoggingContext ↔（无）│ 无桥接                     │</span></span>
<span class="line"><span>│ CFDictionary ↔ NSDictionary   │ 字典                        │</span></span>
<span class="line"><span>│ CFLocale ↔ NSLocale           │ 区域                        │</span></span>
<span class="line"><span>│ CFNumber ↔ NSNumber           │ 数字                        │</span></span>
<span class="line"><span>│ CFPreferences ↔ NSUserDefaults│ 偏好设置                    │</span></span>
<span class="line"><span>│ CFPropertyList ↔ NSArray/NSDictionary │ 属性列表            │</span></span>
<span class="line"><span>│ CFReadStream ↔ NSInputStream  │ 输入流                      │</span></span>
<span class="line"><span>│ CFWriteStream ↔ NSOutputStream│ 输出流                      │</span></span>
<span class="line"><span>│ CFRunLoop ↔ NSRunLoop         │ 运行循环                    │</span></span>
<span class="line"><span>│ CFSocket ↔ NSSocket           │ Socket                      │</span></span>
<span class="line"><span>│ CFStream ↔ NSStream           │ 流                          │</span></span>
<span class="line"><span>│ CFTimeZone ↔ NSTimeZone       │ 时区                        │</span></span>
<span class="line"><span>│ CFTimeZoneNames ↔（无）       │ 无桥接                     │</span></span>
<span class="line"><span>│ CFUUID ↔ NSUUID               │ UUID                        │</span></span>
<span class="line"><span>│ CFNotificationCenter ↔ NSNotificationCenter │ 通知中心      │</span></span>
<span class="line"><span>│ CFRetain → CFTypeRef          │ 桥接引用计数                 │</span></span>
<span class="line"><span>│ CFRelease → CFTypeRef         │ 桥接释放                     │</span></span>
<span class="line"><span>│ CFBridgingRetain → id         │ CF → id（retain）          │</span></span>
<span class="line"><span>│ CFBridgingRelease → CFTypeRef │ id → CF（release）          │</span></span>
<span class="line"><span>│ CFMakeCollectable → id        │ CF → id（collectable）     │</span></span>
<span class="line"><span>│ BFRetainCollectable → CFTypeRef│ id → CF（collectable）    │</span></span>
<span class="line"><span>│ CFError ↔ NSError             │ 错误                        │</span></span>
<span class="line"><span>│ CFMachPort ↔ NSMachPort       │ Mach Port                   │</span></span>
<span class="line"><span>│ CFMessagePort ↔ NSMessagePort  │ Message Port               │</span></span>
<span class="line"><span>│ CFSocketContext ↔（无）       │ 无桥接                     │</span></span>
<span class="line"><span>│ CFRunLoopSource ↔ NSRunLoop    │ 运行循环源                  │</span></span>
<span class="line"><span>│ CFRunLoopTimer ↔ NSTimer       │ 运行循环定时器              │</span></span>
<span class="line"><span>│ CFRUNLOOP_OBSERVER_CALLBACK   │ 无桥接                     │</span></span>
<span class="line"><span>│ CFBridgingRetain → CFTypeRef  │ id → CF（手动 retain）    │</span></span>
<span class="line"><span>│ CFBridgingRelease → id        │ CF → id（手动 release）   │</span></span>
<span class="line"><span>│ └───────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Toll-Free 桥接的底层实现：                                    │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ CFType 的内存布局：                                        │ │</span></span>
<span class="line"><span>│ │  • isa 指针（指向元类）                                    │ │</span></span>
<span class="line"><span>│ │  • 数据区（具体类型的数据）                                │ │</span></span>
<span class="line"><span>│ │ CFString 与 NSString 内存布局：                            │ │</span></span>
<span class="line"><span>│ │  • 完全相同（共享同一个 isa）                              │ │</span></span>
<span class="line"><span>│ │  • 同一块内存有两个类型视图                                 │ │</span></span>
<span class="line"><span>│ │  • 桥接是类型双写（同一内存，两种类型）                    │ │</span></span>
<span class="line"><span>│ │  • CFStringRef → NSString*：直接类型转换                  │ │</span></span>
<span class="line"><span>│ │  • NSString* → CFStringRef：直接类型转换                   │ │</span></span>
<span class="line"><span>│ │  • 不需要调用任何桥接函数（零开销）                       │ │</span></span>
<span class="line"><span>│ │                                                          │ │</span></span>
<span class="line"><span>│ │ 桥接规则：                                               │ │</span></span>
<span class="line"><span>│ │  • CFType ↔ id：CFMakeCollectable/CFAutorelease            │ │</span></span>
<span class="line"><span>│ │  • CFTypeRef ↔ void *：CFAutorelease                     │ │</span></span>
<span class="line"><span>│ │  • id → CFTypeRef：CFBridgingRelease                     │ │</span></span>
<span class="line"><span>│ │  • CFType → id：CFBridgingRetain                          │ │</span></span>
<span class="line"><span>│ │  • 桥结对：直接类型转换（CFStringRef → NSString*）         │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-toll-free-bridging-完整示例" tabindex="-1">4.2 Toll-Free Bridging 完整示例 <a class="header-anchor" href="#_4-2-toll-free-bridging-完整示例" aria-label="Permalink to &quot;4.2 Toll-Free Bridging 完整示例&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// === Toll-Free Bridging 完整示例 ===</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. CFString ↔ NSString（零开销）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfString: CFString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Hello World&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFString</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsString: NSString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSString  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftString: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsString </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> String</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. CFData ↔ NSData</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfData: CFData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;test&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFData</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsData: NSData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSData  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> swiftData: Data </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsData </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Data</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. CFArray ↔ NSArray</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfArray: CFArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFArray</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsArray: NSArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfArray </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSArray  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. CFDictionary ↔ NSDictionary</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfDict: CFDictionary </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;a&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;b&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFDictionary</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsDict: NSDictionary </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfDict </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSDictionary  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. CFURL ↔ NSURL</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfURL: CFURL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFURL</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsURL: NSURL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfURL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSURL  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. CFDate ↔ NSDate</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfDate: CFDate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFDate</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsDate: NSDate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfDate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSDate  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 7. CFUUID ↔ NSUUID</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfUUID: CFUUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UUID</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFUUID</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsUUID: NSUUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfUUID </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSUUID  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 零开销</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 8. CFBridgingRetain / CFBridgingRelease</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ref: CFType</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CFBridgingRetain 将 id 转换为 CFTypeRef（retain 计数 +1）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ref </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFBridgingRetain</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(someObject) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFTypeRef</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// CFBridgingRelease 将 CFTypeRef 转换为 id（release 计数 -1）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> obj </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFBridgingRelease</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ref)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 9. CFRetain / CFRelease</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ret: CFString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;test&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFTypeRef</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CFRetain</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ret)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 手动 retain</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CFRelease</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ret)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 手动 release</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 10. CFMakeCollectable / CFAutorelease</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> uncollected </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFMakeCollectable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CFBridgingRelease</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cfString))</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 11. CFError ↔ NSError</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsError: NSError</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfError: CFError </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> NSError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">domain</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;test&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">code</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">userInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CFError</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nsError </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfError </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSError  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 12. CFRunLoop ↔ NSRunLoop</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfRunLoop </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFRunLoopGetMain</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsRunLoop </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfRunLoop </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSRunLoop  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 13. CFLocale ↔ NSLocale</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfLocale </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFLocaleCopyCurrent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsLocale </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfLocale </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSLocale</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 14. CFTimeZone ↔ NSTimeZone</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfTimeZone </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFCopyTimeZone</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CFTimeZoneCopySystem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsTimeZone </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfTimeZone </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSTimeZone</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 15. CFNotificationCenter ↔ NSNotificationCenter</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfCenter </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFNotificationCenterGetDarwinNotifyCenter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsCenter </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfCenter </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSNotificationCenter  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 16. CFReadStream ↔ NSInputStream</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfStream </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> CFReadStreamCreateWithBytes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;test&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CChar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsStream </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfStream </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NSInputStream  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Toll-Free</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 17. CFPropertyList ↔ NSArray/NSDictionary</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfProperty: CFPropertyList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;name&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;test&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;age&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 25</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nsProperty: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Any</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cfProperty </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Any</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // Toll-Free</span></span></code></pre></div><hr><h2 id="_5-selector-机制完整分析" tabindex="-1">5. selector 机制完整分析 <a class="header-anchor" href="#_5-selector-机制完整分析" aria-label="Permalink to &quot;5. selector 机制完整分析&quot;">​</a></h2><h3 id="_5-1-selector-完整深度分析" tabindex="-1">5.1 selector 完整深度分析 <a class="header-anchor" href="#_5-1-selector-完整深度分析" aria-label="Permalink to &quot;5.1 selector 完整深度分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>selector 机制完整深度分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  selector 是 Objective-C 运行时的核心概念：                   │</span></span>
<span class="line"><span>│ • SEL 是方法选择的字符串标识符                                │</span></span>
<span class="line"><span>│ • @selector 创建方法选择器                                    │</span></span>
<span class="line"><span>│ • selector 在运行时解析为方法指针                            │</span></span>
<span class="line"><span>│ • selector 可以用于消息转发、KVO、通知等场景                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ selector 的核心机制：                                       │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │  // selector 创建                                              │ │</span></span>
<span class="line"><span>│ │  let selector = #selector(MyClass.doSomething)              │ │</span></span>
<span class="line"><span>│ │  let selector2 = #selector(MyClass.doSomething(_:))         │ │</span></span>
<span class="line"><span>│ │  let selector3 = #selector(MyVC.buttonTapped(sender:))      │ │</span></span>
<span class="line"><span>│ │                                                            │ │</span></span>
<span class="line"><span>│ │  // 方法签名匹配                                                │ │</span></span>
<span class="line"><span>│ │  func doSomething() { ... }                               │ │</span></span>
<span class="line"><span>│ │  func doSomething(_ value: Int) { ... }                   │ │</span></span>
<span class="line"><span>│ │  func doSomething(with name: String) { ... }              │ │</span></span>
<span class="line"><span>│ │  func doSomething(name: String) { ... }                   │ │</span></span>
<span class="line"><span>│ │                                                            │ │</span></span>
<span class="line"><span>│ │  // selector 匹配规则                                           │ │</span></span>
<span class="line"><span>│ │  • selector 的名称必须与 OC 方法签名完全匹配                  │ │</span></span>
<span class="line"><span>│ │  • Swift 方法名到 OC 方法名的映射                             │ │</span></span>
<span class="line"><span>│ │  • Swift 中参数名在 selector 中需要显式指定                   │ │</span></span>
<span class="line"><span>│ │  • @objc 标记的方法才能使用 selector                         │ │</span></span>
<span class="line"><span>│ │  • 方法必须在运行时可用（@objc 或继承 NSObject）              │ │</span></span>
<span class="line"><span>│ │                                                            │ │</span></span>
<span class="line"><span>│ │  // selector 的内存布局                                           │ │</span></span>
<span class="line"><span>│ │  ┌────────────────────────────────┐                       │ │</span></span>
<span class="line"><span>│ │  │ SEL (Selector)                    │                       │ │</span></span>
<span class="line"><span>│ │  │ ┌─────────────────────────────┐  │                       │ │</span></span>
<span class="line"><span>│ │  │ │ 字符串指针（方法名）            │  │                       │ │</span></span>
<span class="line"><span>│ │  │ │ (如 &quot;doSomething:&quot;)            │  │                       │ │</span></span>
<span class="line"><span>│ │  │ └─────────────────────────────┘  │                       │ │</span></span>
<span class="line"><span>│ │  │ Total: 8 bytes (指针)              │                       │ │</span></span>
<span class="line"><span>│ │  └──────────────────────────────────┘                       │ │</span></span>
<span class="line"><span>│ │                                                            │ │</span></span>
<span class="line"><span>│ │  // selector 的缓存机制                                         │ │</span></span>
<span class="line"><span>│ │  • selector 创建是 O(1) 操作（从字符串哈希表查找）              │ │</span></span>
<span class="line"><span>│ │  • 编译器缓存常用 selector                                     │ │</span></span>
<span class="line"><span>│ │  • 运行时缓存 selector 的字符串                              │ │</span></span>
<span class="line"><span>│ │  • selector 可以安全比较（== 运算符）                         │ │</span></span>
<span class="line"><span>│ │  • selector 可以哈希存储（在字典/集合中）                     │ │</span></span>
<span class="line"><span>│ └─────────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ selector 的完整使用场景：                                       │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │  • 通知中心 addObserver:selector:name:object:             │ │</span></span>
<span class="line"><span>│ │  • KVO observeValue(forKeyPath:of:change:context:)      │ │</span></span>
<span class="line"><span>│ │  • 按钮 addTarget:action:forControlEvents:                │ │</span></span>
<span class="line"><span>│ │  • 菜单 menuItem:menu:highlighted:                        │ │</span></span>
<span class="line"><span>│ │  • 响应链 canPerformAction:withSender:                    │ │</span></span>
<span class="line"><span>│ │  • Runtime 动态方法调用                                   │ │</span></span>
<span class="line"><span>│ │  • 代理方法调用                                             │ │</span></span>
<span class="line"><span>│ │  • 定时器 NSTimer scheduledTimerWithTarget:selector:...   │ │</span></span>
<span class="line"><span>│ └─────────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-selector-完整代码示例" tabindex="-1">5.2 selector 完整代码示例 <a class="header-anchor" href="#_5-2-selector-完整代码示例" aria-label="Permalink to &quot;5.2 selector 完整代码示例&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// === selector 完整示例 ===</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 创建 selector</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> #selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MyClass.doSomething)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> #selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MyClass.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doSomething</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(_:))</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector3 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> #selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MyVC.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">buttonTapped</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sender:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector4 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> #selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(NSString.uppercased) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Selector</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. selector 比较</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector2 {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // selector 比较的是方法名，不是方法本身</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. selector 转字符串</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selectorName </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> sel_getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(selector1)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// C 函数</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. selector 作为参数传递</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> performAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selector: Selector, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> target: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Any</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> target.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">responds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: selector) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        (target </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> AnyObject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">perform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(selector)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. selector 与 KVO</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addObserver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forKeyPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">options</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .new) { [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">weak</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] (keyPath, object, change, context) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    self</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">handleKeyValueChange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(keyPath, object, change)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. selector 与通知</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">NotificationCenter.default.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addObserver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">handleNotification</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(_:)),</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .MyNotification,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@objc</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handleNotification</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> notification: Notification) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(notification)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 7. selector 与按钮</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">button.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addTarget</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">buttonTapped</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(_:)), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .touchUpInside)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@objc</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> buttonTapped</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sender: UIButton) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Button tapped&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 8. selector 与定时器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Timer.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">scheduledTimer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    timeInterval</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(timerFired),</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    userInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    repeats</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@objc</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> timerFired</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    print</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Timer fired&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 9. selector 与 Runtime</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> method </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> class_getInstanceMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MyClass.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MyClass.doSomething)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> imp </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> method_getImplementation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(method)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // imp 是方法实现的函数指针</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 10. selector 与响应链</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> canPerformAction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#selector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">copy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(_:)), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">withSender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 可以执行 copy 操作</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><hr><h2 id="_6-objc-与-objcmembers-完整解析" tabindex="-1">6. @objc 与 @objcMembers 完整解析 <a class="header-anchor" href="#_6-objc-与-objcmembers-完整解析" aria-label="Permalink to &quot;6. @objc 与 @objcMembers 完整解析&quot;">​</a></h2><h3 id="_6-1-objc-完整深度分析" tabindex="-1">6.1 @objc 完整深度分析 <a class="header-anchor" href="#_6-1-objc-完整深度分析" aria-label="Permalink to &quot;6.1 @objc 完整深度分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@objc 标记完整深度分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc 的作用：                                               │</span></span>
<span class="line"><span>│ • 将 Swift 类型/成员暴露给 Objective-C 运行时                 │</span></span>
<span class="line"><span>│ • 使 Swift 方法可被 @selector 调用                            │</span></span>
<span class="line"><span>│ • 使 Swift 类型可被 OC 代码访问                               │</span></span>
<span class="line"><span>│ • 影响编译器生成的符号名                                      │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc 的完整使用要求：                                        │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ • 类必须继承 NSObject 或遵循 @objc 协议                   │ │</span></span>
<span class="line"><span>│ │ • 方法必须是 public 或 @objc 标记                         │ │</span></span>
<span class="line"><span>│ │ • 属性必须是 @objc 标记（用于 OC 访问）                    │ │</span></span>
<span class="line"><span>│ │ • 枚举必须有 @objc 和 rawValue 类型                        │ │</span></span>
<span class="line"><span>│ │ • 协议必须是 @objc 标记（遵循 @objc 协议）               │ │</span></span>
<span class="line"><span>│ │ • 关联类型不能是泛型类型                                 │ │</span></span>
<span class="line"><span>│ │ • 方法不能是泛型方法                                     │ │</span></span>
<span class="line"><span>│ │ • 类型必须在 Swift 模块中定义                             │ │</span></span>
<span class="line"><span>│ │ • 类型名不能在 Objective-C 中冲突                          │ │</span></span>
<span class="line"><span>│ └───────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objcMembers 的作用：                                        │</span></span>
<span class="line"><span>│ • 自动将后续所有成员标记为 @objc                              │</span></span>
<span class="line"><span>│ • 简化代码（不需要每个成员都加 @objc）                        │</span></span>
<span class="line"><span>│ • 只对 @objcMembers 之后的成员生效                            │</span></span>
<span class="line"><span>│ • 不影响 @objcMembers 之前的成员                              │</span></span>
<span class="line"><span>│ • 不能与 @nonobjc 混合使用                                    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objcMembers 的完整示例：                                    │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │  @objcMembers                                             │ │</span></span>
<span class="line"><span>│ │  class MyClass: NSObject {                                │ │</span></span>
<span class="line"><span>│ │      var name: String = &quot;&quot;                               │ │</span></span>
<span class="line"><span>│ │      var age: Int = 0                                    │ │</span></span>
<span class="line"><span>│ │      func doSomething() { ... }                          │ │</span></span>
<span class="line"><span>│ │      @objc func doSomethingElse() { ... }               │ │</span></span>
<span class="line"><span>│ │      @nonobjc func privateMethod() { ... }              │ │</span></span>
<span class="line"><span>│ │  }                                                       │ │</span></span>
<span class="line"><span>│ │                                                           │ │</span></span>
<span class="line"><span>│ │  // 注意：@objcMembers 不影响：                           │ │</span></span>
<span class="line"><span>│ │  • 继承的类（superclass）                                │ │</span></span>
<span class="line"><span>│ │  • 外部类型（extension）                                 │ │</span></span>
<span class="line"><span>│ │  • @objcMembers 之前的成员                               │ │</span></span>
<span class="line"><span>│ │  • private 成员                                          │ │</span></span>
<span class="line"><span>│ │  • init 初始化器（需要手动 @objc）                        │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc 的符号名规则：                                        │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ Swift 方法名 → Objective-C 方法名映射规则：              │ │</span></span>
<span class="line"><span>│ │ • func doSomething() → doSomething                      │ │</span></span>
<span class="line"><span>│ │ • func doSomething(_ x: Int) → doSomething:             │ │</span></span>
<span class="line"><span>│ │ • func doSomething(x: Int) → doSomethingX:              │ │</span></span>
<span class="line"><span>│ │ • func doSomething(y: Int, z: Int) → doSomethingY:z:    │ │</span></span>
<span class="line"><span>│ │ • func doSomething(with name: String) → doSomethingWithName: │</span></span>
<span class="line"><span>│ │ • @objc(customName) → customName                         │ │</span></span>
<span class="line"><span>│ │ • 命名冲突时 Xcode 自动添加下划线后缀                     │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc 的内存布局：                                           │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ • @objc 标记的类：                                          │ │</span></span>
<span class="line"><span>│ │   • 在运行时中注册                                          │ │</span></span>
<span class="line"><span>│ │   • 方法选择器可被动态查找                                  │ │</span></span>
<span class="line"><span>│ │   • 属性可被 KVC/KVO 访问                                  │ │</span></span>
<span class="line"><span>│ │ • @objc 标记的方法：                                        │ │</span></span>
<span class="line"><span>│ │   • 生成 Objective-C 符号名                                │ │</span></span>
<span class="line"><span>│ │   • 方法选择器可用                                           │ │</span></span>
<span class="line"><span>│ │ • @objc 标记的属性：                                        │ │</span></span>
<span class="line"><span>│ │   • 生成 getter/setter                                     │ │</span></span>
<span class="line"><span>│ │   • KVC/KVO 访问                                           │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_7-混编协议深度分析" tabindex="-1">7. 混编协议深度分析 <a class="header-anchor" href="#_7-混编协议深度分析" aria-label="Permalink to &quot;7. 混编协议深度分析&quot;">​</a></h2><h3 id="_7-1-协议混编完整分析" tabindex="-1">7.1 协议混编完整分析 <a class="header-anchor" href="#_7-1-协议混编完整分析" aria-label="Permalink to &quot;7.1 协议混编完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 协议混编完整深度分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 协议混编的方式：                                              │</span></span>
<span class="line"><span>│ • @objc protocol — 可被 OC 遵循                              │</span></span>
<span class="line"><span>│ • 非 @objc protocol — 只能 Swift 使用                         │</span></span>
<span class="line"><span>│ • 混合协议（部分 @objc，部分非）                             │</span></span>
<span class="line"><span>│ • 协议扩展（Swift 特有）                                     │</span></span>
<span class="line"><span>│ • 协议关联类型（Swift 特有）                                 │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc Protocol 的限制：                                      │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ • 不能有关联类型（associatedtype）                         │ │</span></span>
<span class="line"><span>│ │ • 不能有默认实现（protocol extension 默认实现）           │ │</span></span>
<span class="line"><span>│ │ • 所有方法必须是可选/必须（无默认参数）                   │ │</span></span>
<span class="line"><span>│ │ • 不能有属性默认值                                        │ │</span></span>
<span class="line"><span>│ │ • 不能有泛型参数                                          │ │</span></span>
<span class="line"><span>│ │ • 不能遵循非 @objc 协议                                   │ │</span></span>
<span class="line"><span>│ │ • 不能继承非 @objc 协议                                   │ │</span></span>
<span class="line"><span>│ │ • 必须有 @objc 标记                                       │ │</span></span>
<span class="line"><span>│ │ • 方法签名必须与 OC 兼容                                   │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ @objc Protocol 的完整使用：                                  │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │  @objc protocol MyProtocol {                              │ │</span></span>
<span class="line"><span>│ │      var name: String { get set }                        │ │</span></span>
<span class="line"><span>│ │      func doSomething(_ value: Int)                      │ │</span></span>
<span class="line"><span>│ │      func doSomethingElse() -&gt; String                    │ │</span></span>
<span class="line"><span>│ │      @objc optional func optionalMethod()                │ │</span></span>
<span class="line"><span>│ │  }                                                       │ │</span></span>
<span class="line"><span>│ │                                                           │ │</span></span>
<span class="line"><span>│ │  // OC 遵循                                                │ │</span></span>
<span class="line"><span>│ │  @interface MyOCClass () &lt;MyProtocol&gt;                    │ │</span></span>
<span class="line"><span>│ │  @end                                                     │ │</span></span>
<span class="line"><span>│ │                                                           │ │</span></span>
<span class="line"><span>│ │  @implementation MyOCClass                               │ │</span></span>
<span class="line"><span>│ │  - (NSString *)name { return @&quot;test&quot;; }                 │ │</span></span>
<span class="line"><span>│ │  - (void)doSomething:(NSInteger)value { ... }           │ │</span></span>
<span class="line"><span>│ │  - (NSString *)doSomethingElse { return @&quot;result&quot;; }    │ │</span></span>
<span class="line"><span>│ │  - (void)optionalMethod { ... }                         │ │</span></span>
<span class="line"><span>│ │  @end                                                     │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 协议混编的性能分析：                                         │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ • @objc 协议：Witness Table（非 @objc）vs 虚表（@objc）  │ │</span></span>
<span class="line"><span>│ │ • @objc 协议：Objective-C 运行时查找（有开销）            │ │</span></span>
<span class="line"><span>│ │ • Witness Table：零运行时开销（静态分发）                 │ │</span></span>
<span class="line"><span>│ │ • @objc 协议桥接：有额外开销（符号名查找）                │ │</span></span>
<span class="line"><span>│ │ • 协议扩展方法：非 @objc 协议可使用，@objc 不能使用       │ │</span></span>
<span class="line"><span>│ └──────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_8-混编类深度分析" tabindex="-1">8. 混编类深度分析 <a class="header-anchor" href="#_8-混编类深度分析" aria-label="Permalink to &quot;8. 混编类深度分析&quot;">​</a></h2><h3 id="_8-1-类混编完整分析" tabindex="-1">8.1 类混编完整分析 <a class="header-anchor" href="#_8-1-类混编完整分析" aria-label="Permalink to &quot;8.1 类混编完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 类混编完整深度分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Swift 类 ↔ Objective-C 类混编机制：                          │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 混编类的要求：                                              │</span></span>
<span class="line"><span>│ • Swift 类必须继承 NSObject（才能被 OC 访问）                 │</span></span>
<span class="line"><span>│ • Swift 类的方法必须 @objc 标记（或继承 NSObject 的 public 方法）│</span></span>
<span class="line"><span>│ • Swift 类的属性必须 @objc 标记（用于 OC 访问）              │</span></span>
<span class="line"><span>│ • Swift 类的初始化器必须 @objc 标记                          │</span></span>
<span class="line"><span>│ • OC 类可以继承 Swift 类（Swift 类需继承 NSObject）          │</span></span>
<span class="line"><span>│ • OC 类可以遵循 Swift 协议（协议需 @objc）                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Swift 类继承 NSObject 的完整示例：                           │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  @objcMembers                                              │ │</span></span>
<span class="line"><span>│  class MySwiftClass: NSObject {                            │ │</span></span>
<span class="line"><span>│      var name: String = &quot;&quot;                                │ │</span></span>
<span class="line"><span>│      var age: Int = 0                                     │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│      override init() {                                     │ │</span></span>
<span class="line"><span>│          super.init()                                       │ │</span></span>
<span class="line"><span>│      }                                                     │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│      func doSomething(_ value: Int) {                     │ │</span></span>
<span class="line"><span>│          print(&quot;doSomething: \\(value)&quot;)                    │ │</span></span>
<span class="line"><span>│      }                                                     │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│      func getSummary() -&gt; String {                        │ │</span></span>
<span class="line"><span>│          return &quot;\\(name) is \\(age) years old&quot;              │ │</span></span>
<span class="line"><span>│      }                                                     │ │</span></span>
<span class="line"><span>│  }                                                         │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│  // OC 访问 Swift 类                                       │ │</span></span>
<span class="line"><span>│  MySwiftClass *swiftClass = [[MySwiftClass alloc] init];  │ │</span></span>
<span class="line"><span>│  swiftClass.name = @&quot;John&quot;;                                │ │</span></span>
<span class="line"><span>│  swiftClass.age = 25;                                      │ │</span></span>
<span class="line"><span>│  [swiftClass doSomething:42];                              │ │</span></span>
<span class="line"><span>│  NSLog(@&quot;%@&quot;, [swiftClass getSummary]);                    │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ Swift 类 ↔ OC 类混编的性能分析：                            │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ 操作           │ 性能     │ 说明                         │ │</span></span>
<span class="line"><span>│ ├───────────────────────────────────────────────────────┤ │</span></span>
<span class="line"><span>│ │ 类创建          │ O(1)     │ 直接 alloc/init            │ │</span></span>
<span class="line"><span>│ │ 类型转换        │ O(n)     │ runtime 查找               │ │</span></span>
<span class="line"><span>│ │ KVC/KVO         │ O(n)     │ 属性查找 + 动态分发        │ │</span></span>
<span class="line"><span>│ │ selector 调用   │ O(1)     │ 方法查找（缓存）           │ │</span></span>
<span class="line"><span>│ │ Witness Table  │ O(1)     │ Witness Table（非 @objc）  │ │</span></span>
<span class="line"><span>│ │ 协议遵循        │ O(n)     │ 协议一致性检查              │ │</span></span>
<span class="line"><span>│ │ Toll-Free      │ O(0)     │ 类型双写                   │ │</span></span>
<span class="line"><span>│ └────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_9-混编内存管理" tabindex="-1">9. 混编内存管理 <a class="header-anchor" href="#_9-混编内存管理" aria-label="Permalink to &quot;9. 混编内存管理&quot;">​</a></h2><h3 id="_9-1-混编内存管理完整分析" tabindex="-1">9.1 混编内存管理完整分析 <a class="header-anchor" href="#_9-1-混编内存管理完整分析" aria-label="Permalink to &quot;9.1 混编内存管理完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 混编内存管理完整分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 混编内存管理的核心机制：                                      │</span></span>
<span class="line"><span>│ • Swift ARC 管理 Swift 类型                                   │</span></span>
<span class="line"><span>│ • Objective-C ARC 管理 Objective-C 类型                       │</span></span>
<span class="line"><span>│ • 混编类型使用 Objective-C ARC                                │</span></span>
<span class="line"><span>│ • 桥接类型的内存管理遵循桥接规则                              │</span></span>
<span class="line"><span>│ • Toll-Free 类型共享内存（不需要额外管理）                   │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 混编内存管理的规则：                                          │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ • Swift class 继承 NSObject：使用 Objective-C ARC          │ │</span></span>
<span class="line"><span>│ │ • Swift struct/enum：使用 Swift ARC（值类型，自动管理）   │ │</span></span>
<span class="line"><span>│ │ • @objc enum：使用 Swift ARC（原始值是 Swift 类型）       │ │</span></span>
<span class="line"><span>│ │ • Toll-Free 类型：零开销共享（不需要额外内存管理）          │ │</span></span>
<span class="line"><span>│ │ • CFTypeRef ↔ id：使用桥接规则                           │ │</span></span>
<span class="line"><span>│ │ • 混编类型不能循环引用（需要 weak）                       │ │</span></span>
<span class="line"><span>│ │ • @objc 属性需要明确的内存语义                            │ │</span></span>
<span class="line"><span>│ └───────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 混编内存管理的完整示例：                                      │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  // Swift class 继承 NSObject（使用 Objective-C ARC）       │ │</span></span>
<span class="line"><span>│  @objcMembers                                               │ │</span></span>
<span class="line"><span>│  class MyClass: NSObject {                                  │ │</span></span>
<span class="line"><span>│      var name: String = &quot;&quot;                                 │ │</span></span>
<span class="line"><span>│      var delegate: MyDelegate? = nil                       │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│      deinit {                                               │ │</span></span>
<span class="line"><span>│          print(&quot;MyClass deinit&quot;)                           │ │</span></span>
<span class="line"><span>│      }                                                     │ │</span></span>
<span class="line"><span>│  }                                                         │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│  // OC 类遵循 Swift 协议                                     │ │</span></span>
<span class="line"><span>│  @interface MyOCClass () &lt;MyDelegate&gt;                      │ │</span></span>
<span class="line"><span>│  @end                                                     │ │</span></span>
<span class="line"><span>│  @implementation MyOCClass                                 │ │</span></span>
<span class="line"><span>│  - (void)doSomething { ... }                              │ │</span></span>
<span class="line"><span>│  @end                                                     │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│  // 循环引用处理                                             │ │</span></span>
<span class="line"><span>│  class Parent: NSObject {                                  │ │</span></span>
<span class="line"><span>│      weak var child: Child? = nil                          │ │</span></span>
<span class="line"><span>│      var strongRef: Child? = nil                           │ │</span></span>
<span class="line"><span>│  }                                                         │ │</span></span>
<span class="line"><span>│                                                             │ │</span></span>
<span class="line"><span>│  // Toll-Free 类型共享内存                                   │ │</span></span>
<span class="line"><span>│  let swiftString = &quot;test&quot;                                  │ │</span></span>
<span class="line"><span>│  let nsString = swiftString as NSString  // 零开销          │ │</span></span>
<span class="line"><span>│  let cfString = nsString as CFString  // 零开销             │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_10-混编常见问题与解决方案" tabindex="-1">10. 混编常见问题与解决方案 <a class="header-anchor" href="#_10-混编常见问题与解决方案" aria-label="Permalink to &quot;10. 混编常见问题与解决方案&quot;">​</a></h2><h3 id="_10-1-混编常见问题完整分析" tabindex="-1">10.1 混编常见问题完整分析 <a class="header-anchor" href="#_10-1-混编常见问题完整分析" aria-label="Permalink to &quot;10.1 混编常见问题完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 混编常见问题完整分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 问题                    │ 原因                              │ 解决方案                    │</span></span>
<span class="line"><span>├────────────────────────┼───────────────────────────────────┼───────────────────────┤</span></span>
<span class="line"><span>│ @objc 标记缺失         │ Swift 类型未暴露给 OC               │ 添加 @objc 或 @objcMembers │</span></span>
<span class="line"><span>│ 桥接失败                │ 类型不兼容                         │ 使用桥接转换（as）           │</span></span>
<span class="line"><span>│ 方法找不到              │ 方法签名不匹配                     │ 检查 @objc 标记和签名         │</span></span>
<span class="line"><span>│ 协议混编失败            │ 协议中有泛型/关联类型                │ 使用 @objc 协议              │</span></span>
<span class="line"><span>│ Toll-Free 桥接失败      │ 类型不是桥结对                      │ 使用桥接转换（as CFString）  │</span></span>
<span class="line"><span>│ 混编性能问题            │ 大量桥接调用                        │ 减少桥接，使用纯 Swift        │</span></span>
<span class="line"><span>│ 初始化器混编失败        │ init 未标记 @objc                   │ 添加 @objc 到 init           │</span></span>
<span class="line"><span>│ 枚举混编失败            │ 枚举未指定 rawValue 类型            │ 指定 Int rawValue            │</span></span>
<span class="line"><span>│ Selector 调用失败       │ 方法未暴露给 OC                     │ 添加 @objc 标记              │</span></span>
<span class="line"><span>│ KVO 混编失败            │ 属性未标记 @objc                    │ 添加 @objc 到属性             │</span></span>
<span class="line"><span>│ 类名冲突                │ Swift 类名与 OC 类名冲突             │ 使用 @objc 重命名            │</span></span>
<span class="line"><span>│ 泛型混编失败            │ OC 不支持泛型                       │ 使用具体类型替代泛型           │</span></span>
<span class="line"><span>│ 闭包混编失败            │ OC 不支持闭包                       │ 使用 Block/SEL 替代          │</span></span>
<span class="line"><span>│ 字符串混编              │ 字符串桥接问题                      │ 使用 as NSString/CFString    │</span></span>
<span class="line"><span>│ 数组混编                │ 数组桥接问题                        │ 使用 NSArray/CFArray         │</span></span>
<span class="line"><span>│ 字典混编                │ 字典桥接问题                        │ 使用 NSDictionary/CFDict     │</span></span>
<span class="line"><span>│ 可选值混编              │ Optional 桥接问题                   │ 使用 nil 检查                │</span></span>
<span class="line"><span>│ 内存泄漏                │ 循环引用                            │ 使用 weak/unowned            │</span></span>
<span class="line"><span>│ 线程安全                │ 混编类型线程安全                     │ 使用 DispatchQueue            │</span></span>
<span class="line"><span>│ 性能开销                │ 桥接开销                            │ 减少桥接，优化桥接次数        │</span></span>
<span class="line"><span>│ 符号冲突                │ 符号名冲突                          │ 使用 @objc 重命名            │</span></span>
<span class="line"><span>│ ABI 兼容性              │ Swift ABI 不稳定                    │ 使用 @objc 保证兼容性         │</span></span>
<span class="line"><span>│ 桥接头生成失败          │ Build Settings 配置问题             │ 检查 DEFINES_MODULE = YES    │</span></span>
<span class="line"><span>│ Swift 枚举被桥接失败    │ 未指定 Int rawValue                 │ 指定 Int rawValue            │</span></span>
<span class="line"><span>│ 桥接后类型丢失            │ 桥接类型不是桥结对                  │ 使用桥接函数                 │</span></span>
<span class="line"><span>│ 混编方法不执行          │ 方法未正确暴露                      │ 检查 @objc 标记              │</span></span>
<span class="line"><span>│ KVC/KVO 混编失败        │ 属性名不一致                        │ 确保属性名与 KVC/KVO 一致    │</span></span>
<span class="line"><span>│ Runtime 混编失败        │ 方法名不匹配                        │ 检查 selector 和 SEL         │</span></span>
<span class="line"><span>│ 桥接类型内存管理        │ Toll-Free 共享内存                  │ 遵循内存管理规则             │</span></span>
<span class="line"><span>│ 混编协议方法不实现       │ 协议方法缺失                        │ 实现所有协议方法              │</span></span>
<span class="line"><span>└────────────────────────┴───────────────────────────────────┴───────────────────────┘</span></span></code></pre></div><hr><h2 id="_11-混编性能分析" tabindex="-1">11. 混编性能分析 <a class="header-anchor" href="#_11-混编性能分析" aria-label="Permalink to &quot;11. 混编性能分析&quot;">​</a></h2><h3 id="_11-1-混编性能完整分析" tabindex="-1">11.1 混编性能完整分析 <a class="header-anchor" href="#_11-1-混编性能完整分析" aria-label="Permalink to &quot;11.1 混编性能完整分析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift ↔ Objective-C 混编性能完整分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 混编性能影响：                                                      │</span></span>
<span class="line"><span>│ • 桥接开销：Toll-Free 桥接零开销，其他桥接有开销               │</span></span>
<span class="line"><span>│ • 类型转换开销：as/bridge 转换有成本                             │</span></span>
<span class="line"><span>│ • 运行时查找：Objective-C 运行时查找有开销                       │</span></span>
<span class="line"><span>│ • KVC/KVO：动态属性访问有开销                                   │</span></span>
<span class="line"><span>│ • selector 查找：方法选择器查找有开销                           │</span></span>
<span class="line"><span>│ • 桥接类型内存管理：Toll-Free 共享，其他需要额外管理              │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 性能对比分析：                                                  │</span></span>
<span class="line"><span>│ ┌───────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ 操作           │ Swift 原生  │ 混编（OC）   │ 影响    │</span></span>
<span class="line"><span>│ ├───────────────────────────────────────────────────────────┤ │</span></span>
<span class="line"><span>│ │ 类型创建        │ O(1)       │ O(1)         │ 无变化   │</span></span>
<span class="line"><span>│ │ 类型转换        │ O(0)       │ O(n)         │ 有开销   │</span></span>
<span class="line"><span>│ │ 方法调用        │ Witness   │ SEL 查找      │ 有开销   │</span></span>
<span class="line"><span>│ │ 属性访问        │ O(1)       │ KVC          │ 有开销   │</span></span>
<span class="line"><span>│ │ 协议调用        │ Witness   │ SEL 查找      │ 有开销   │</span></span>
<span class="line"><span>│ │ KVO 监听        │ N/A        │ KVO          │ 有开销   │</span></span>
<span class="line"><span>│ │ Toll-Free      │ O(0)       │ O(0)         │ 无开销   │</span></span>
<span class="line"><span>│ │ 内存管理        │ ARC        │ ARC + 桥接    │ 有开销   │</span></span>
<span class="line"><span>│ │ 运行时查找      │ 编译期     │ 运行时         │ 有开销   │</span></span>
<span class="line"><span>│ │ Selector 创建   │ N/A        │ O(1)         │ 无开销   │</span></span>
<span class="line"><span>│ │ KVC 获取        │ O(1)       │ O(n)         │ 有开销   │</span></span>
<span class="line"><span>│ │ 桥接转换        │ O(0)       │ O(0)         │ 零开销   │</span></span>
<span class="line"><span>│ └───────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 混编性能优化建议：                                            │</span></span>
<span class="line"><span>│ • 减少桥接调用（缓存桥接结果）                                │</span></span>
<span class="line"><span>│ • 使用 Toll-Free 桥接（零开销）                              │</span></span>
<span class="line"><span>│ • 减少 KVC/KVO 使用（直接方法调用更快）                       │</span></span>
<span class="line"><span>│ • 减少 selector 查找（缓存方法指针）                         │</span></span>
<span class="line"><span>│ • 减少 Runtime 调用（使用 Swift 原生替代）                   │</span></span>
<span class="line"><span>│ • 使用 @objcMembers 减少 @objc 标记次数                      │</span></span>
<span class="line"><span>│ • 优先使用 Swift 原生 API                                    │</span></span>
<span class="line"><span>│ • 避免在热路径中使用桥接                                      │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_12-swift-↔-objective-c-完整对比表" tabindex="-1">12. Swift ↔ Objective-C 完整对比表 <a class="header-anchor" href="#_12-swift-↔-objective-c-完整对比表" aria-label="Permalink to &quot;12. Swift ↔ Objective-C 完整对比表&quot;">​</a></h2><h3 id="_12-1-swift-vs-objective-c-核心对比" tabindex="-1">12.1 Swift vs Objective-C 核心对比 <a class="header-anchor" href="#_12-1-swift-vs-objective-c-核心对比" aria-label="Permalink to &quot;12.1 Swift vs Objective-C 核心对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Swift vs Objective-C 完整对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 特性            │ Swift                       │ Objective-C                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 类型系统        │ 静态类型，编译期检查          │ 动态类型，运行时检查             │</span></span>
<span class="line"><span>│ 空安全          │ Optional 系统（编译期）        │ nil（运行时）                  │</span></span>
<span class="line"><span>│ 内存管理        │ ARC（编译期插入）             │ ARC（编译期插入）              │</span></span>
<span class="line"><span>│ 泛型            │ 完整支持（编译期特化）         │ 不支持（只有 @class 向前声明）  │</span></span>
<span class="line"><span>│ 协议            │ 完整（关联类型、扩展、泛型）   │ @protocol（有限支持）           │</span></span>
<span class="line"><span>│ 协议多态        │ Witness Table（编译期）        │ 运行时查找                      │</span></span>
<span class="line"><span>│ 多继承          │ 不支持（单继承）               │ 不支持（单继承）                │</span></span>
<span class="line"><span>│ 函数            │ 一等公民（一等类型）            │ 对象（SEL）                    │</span></span>
<span class="line"><span>│ 闭包            │ 完整支持（捕获变量）           │ Block（有限支持）              │</span></span>
<span class="line"><span>│ 模式匹配        │ 完整支持（switch/if-let）      │ 有限（switch）                  │</span></span>
<span class="line"><span>│ 扩展            │ 完整支持                      │ category（有限支持）            │</span></span>
<span class="line"><span>│ 模块系统        │ Module（.swiftmodule）         │ Header（.h）                  │</span></span>
<span class="line"><span>│ 跨语言          │ Swift ↔ OC（自动桥接）         │ OC ↔ Swift（自动桥接）         │</span></span>
<span class="line"><span>│ 跨平台          │ iOS/macOS/watchOS/tvOS        │ iOS/macOS                      │</span></span>
<span class="line"><span>│ 性能            │ 编译期优化（零开销）            │ 运行时开销                     │</span></span>
<span class="line"><span>│ 安全性          │ 编译期检查 + 运行时检查         │ 运行时检查                      │</span></span>
<span class="line"><span>│ 调试            │ Xcode 调试 + LLDB              │ Xcode 调试 + LLDB              │</span></span>
<span class="line"><span>│ 构建速度        │ 增量编译（快）                 │ 编译快（C 语言）               │</span></span>
<span class="line"><span>│ 代码量          │ 较少（声明式）                  │ 较多（命令式）                  │</span></span>
<span class="line"><span>│ 学习曲线        │ 较低（现代语法）                │ 较高（历史包袱）                │</span></span>
<span class="line"><span>│ 生态            │ 快速成长中                     │ 成熟庞大                        │</span></span>
<span class="line"><span>│ 宏系统          │ Swift 5.9+                    │ 预处理器                      │</span></span>
<span class="line"><span>│ 并发            │ async/await + Actor           │ GCD + OperationQueue           │</span></span>
<span class="line"><span>│ 元编程          │ 宏（编译期代码生成）            │ 预处理器（编译期文本替换）      │</span></span>
<span class="line"><span>│ 可选值          │ Optional&lt;T&gt;（编译期安全）       │ nil（运行时不安全）             │</span></span>
<span class="line"><span>│ 字符串          │ 原生 String（Unicode 感知）     │ NSString（UTF-16 编码）        │</span></span>
<span class="line"><span>│ 数组            │ 原生 Array（值类型）            │ NSArray（引用类型）             │</span></span>
<span class="line"><span>│ 字典            │ 原生 Dictionary（值类型）       │ NSDictionary（引用类型）       │</span></span>
<span class="line"><span>│ 集合            │ 原生 Set（值类型）              │ NSSet（引用类型）               │</span></span>
<span class="line"><span>│ 错误处理        │ throw/throws/try-catch        │ NSError 返回                   │</span></span>
<span class="line"><span>│ 枚举            │ 完整（关联值、原始值、递归）     │ enum（原始值）                 │</span></span>
<span class="line"><span>│ 元组            │ 完整                          │ 无                             │</span></span>
<span class="line"><span>│ 函数重载        │ 完整                          │ 有限                           │</span></span>
<span class="line"><span>│ 默认参数        │ 完整                          │ 无                             │</span></span>
<span class="line"><span>│ 尾随闭包        │ 完整                          │ 无                             │</span></span>
<span class="line"><span>│ 下标            │ 完整                          │ 有限                           │</span></span>
<span class="line"><span>│ 计算属性        │ 完整                          │ 属性（getter/setter）          │</span></span>
<span class="line"><span>│ 存储属性        │ 完整                          │ 实例变量 + 属性               │</span></span>
<span class="line"><span>│ 委托            │ 协议 + weak                   │ delegate 属性 + protocol       │</span></span>
<span class="line"><span>│ KVO             │ 使用 @objc 属性                │ 原生支持                        │</span></span>
<span class="line"><span>│ Notification    │ NotificationCenter             │ NSNotification               │</span></span>
<span class="line"><span>│ GCD             │ DispatchQueue                 │ dispatch_queue_t             │</span></span>
<span class="line"><span>│ Runtime         │ swift/runtime               │ objc/runtime                  │</span></span>
<span class="line"><span>│ Runtime 查找    │ Witness Table（编译期）        │ 运行时查找                      │</span></span>
<span class="line"><span>│ Runtime 检查    │ 编译期 + 运行时               │ 纯运行时                        │</span></span>
<span class="line"><span>│ Runtime 修改    │ 有限                          │ 完整                           │</span></span>
<span class="line"><span>│ Runtime 遍历    │ Mirror                       │ class_copyIvarList            │</span></span>
<span class="line"><span>│ Runtime 内存    │ ARC + 桥接                   │ ARC + 桥接                    │</span></span>
<span class="line"><span>│ Runtime 性能    │ 编译期优化                    │ 运行时开销                      │</span></span>
<span class="line"><span>│ Runtime 调试    │ LLDB + Swift Debug           │ LLDB + Objective-C Debug      │</span></span>
<span class="line"><span>└─────────────────┴───────────────────────────┴──────────────────────────┘</span></span></code></pre></div><hr><h2 id="_13-面试题汇总" tabindex="-1">13. 面试题汇总 <a class="header-anchor" href="#_13-面试题汇总" aria-label="Permalink to &quot;13. 面试题汇总&quot;">​</a></h2><h3 id="高频面试题" tabindex="-1">高频面试题 <a class="header-anchor" href="#高频面试题" aria-label="Permalink to &quot;高频面试题&quot;">​</a></h3><p><strong>Q1: Swift 与 Objective-C 混编的核心机制？</strong></p><p><strong>答</strong>：</p><ul><li>Swift → OC：自动生成 *-Swift.h 桥接头</li><li>OC → Swift：Bridging Header 注入</li><li>Toll-Free Bridging：CoreFoundation ↔ Foundation 自动桥接</li><li>selector：@objc 标记的方法可被 @selector 调用</li><li>桥接类型：String↔NSString, Array↔NSArray, Dictionary↔NSDictionary</li><li>Swift 类需要继承 NSObject 才能被 OC 访问</li><li>OC 类需要桥接头才能被 Swift 访问</li></ul><p><strong>Q2: Toll-Free Bridging 的原理？有哪些桥接对？</strong></p><p><strong>答</strong>：</p><ul><li>核心原理：共享内存布局（同一块内存有两个类型视图）</li><li>零开销转换（不需要复制数据）</li><li>桥接对：CFString↔NSString, CFData↔NSData, CFArray↔NSArray, CFDictionary↔NSDictionary, CFURL↔NSURL, CFDate↔NSDate, CFUUID↔NSUUID, CFNumber↔NSNumber</li><li>CFBridgingRetain/CFAvoidingRelease 用于 CFType ↔ id 转换</li></ul><p><strong>Q3: selector 机制的工作原理？</strong></p><p><strong>答</strong>：</p><ul><li>SEL 是方法名的字符串标识符</li><li>@selector 创建方法选择器</li><li>selector 在运行时解析为方法指针</li><li>selector 可以用于消息转发、KVO、通知等场景</li><li>selector 的符号名规则：方法名映射到 OC 方法名</li><li>@objc 标记的方法才能使用 selector</li><li>selector 比较的是方法名，不是方法本身</li></ul><p><strong>Q4: @objc 与 @objcMembers 的区别？</strong></p><p><strong>答</strong>：</p><ul><li>@objc：将 Swift 类型/成员暴露给 Objective-C</li><li>@objcMembers：自动将后续所有成员标记为 @objc</li><li>@objc 要求类继承 NSObject</li><li>@objc enum 需要 Int rawValue</li><li>@objc protocol 不能有泛型/关联类型</li><li>@objcMembers 不影响继承的类或外部类型</li></ul><p><strong>Q5: 混编内存管理的规则？</strong></p><p><strong>答</strong>：</p><ul><li>Swift class 继承 NSObject：使用 Objective-C ARC</li><li>Toll-Free 类型：共享内存（不需要额外管理）</li><li>CFTypeRef ↔ id：使用桥接规则</li><li>混编类型不能循环引用（需要 weak）</li><li>混编协议方法不实现：KVO/KVC 访问失败</li><li>闭包捕获：使用 [weak self] 避免循环引用</li></ul><p><strong>Q6: 混编类型映射的完整分类？</strong></p><p><strong>答</strong>：</p><ul><li>Toll-Free：CF/NS 类型对自动桥接（零开销）</li><li>可选桥接：Swift Optional ↔ Objective-C nil</li><li>@objc 桥接：Swift struct/class/enum/protocol 需要 @objc</li><li>非桥接：tuple、非 @objc protocol、Result 等无直接映射</li><li>Swift Array ↔ NSArray（Toll-Free）</li><li>Swift Dictionary ↔ NSDictionary（Toll-Free）</li><li>Swift String ↔ NSString（Toll-Free）</li></ul><p><strong>Q7: 混编性能优化策略？</strong></p><p><strong>答</strong>：</p><ul><li>减少桥接调用（缓存桥接结果）</li><li>使用 Toll-Free 桥接（零开销）</li><li>减少 KVC/KVO 使用</li><li>减少 selector 查找（缓存方法指针）</li><li>减少 Runtime 调用</li><li>使用 @objcMembers 减少 @objc 标记次数</li><li>优先使用 Swift 原生 API</li><li>避免在热路径中使用桥接</li></ul><p><strong>Q8: Swift 与 Objective-C 的核心差异？</strong></p><p><strong>答</strong>：</p><ul><li>类型系统：静态 vs 动态</li><li>空安全：Optional 编译期 vs nil 运行时</li><li>泛型：完整支持 vs 不支持</li><li>协议：完整（关联类型、扩展、泛型）vs @protocol（有限）</li><li>多态：Witness Table（编译期）vs 运行时查找</li><li>函数：一等公民 vs 对象（SEL）</li><li>闭包：完整 vs Block（有限）</li><li>内存管理：ARC 编译期 vs ARC 运行时</li><li>元编程：宏（编译期代码生成）vs 预处理器（文本替换）</li></ul><p><strong>Q9: 混编中常见的桥接错误？如何处理？</strong></p><p><strong>答</strong>：</p><ul><li>桥接失败：类型不兼容 → 使用桥接转换（as）</li><li>方法找不到：方法签名不匹配 → 检查 @objc 标记和签名</li><li>协议混编失败：协议中有泛型/关联类型 → 使用 @objc 协议</li><li>Toll-Free 桥接失败：类型不是桥结对 → 使用桥接函数（as CFString）</li><li>字符串混编：使用 as NSString/CFString</li><li>数组混编：使用 NSArray/CFArray</li><li>字典混编：使用 NSDictionary/CFDictionary</li><li>可选值混编：使用 nil 检查</li></ul><p><strong>Q10: Swift 6 对混编的影响？</strong></p><p><strong>答</strong>：</p><ul><li>Sendable 协议影响桥接对象的线程安全</li><li>数据race 检测影响混编代码的线程安全</li><li>Actor 隔离影响混编代码的并发安全</li><li>编译器对 @objc 的检查更严格</li><li>桥接类型需要符合 Sendable</li></ul><hr><h2 id="_14-参考资源" tabindex="-1">14. 参考资源 <a class="header-anchor" href="#_14-参考资源" aria-label="Permalink to &quot;14. 参考资源&quot;">​</a></h2><ul><li><a href="https://developer.apple.com/documentation/swift/objective-c_and_c_swift_interoperability" target="_blank" rel="noreferrer">Apple: Swift and Objective-C Interoperability</a></li><li><a href="https://developer.apple.com/documentation/foundation/toll-free_bridging" target="_blank" rel="noreferrer">Apple: Toll-Free Bridging</a></li><li><a href="https://developer.apple.com/documentation/swift/objcmembers" target="_blank" rel="noreferrer">Apple: @objc and @objcMembers</a></li><li><a href="https://developer.apple.com/documentation/swift/imported_c_and_objective-c_apis/importing_objc_headers_into_swift" target="_blank" rel="noreferrer">Apple: Bridging Header</a></li><li><a href="https://developer.apple.com/documentation/objectivec/1418952-selector" target="_blank" rel="noreferrer">Apple: selector Mechanism</a></li><li><a href="https://swift.org/blog/abi-stability/" target="_blank" rel="noreferrer">Apple: Swift ABI Stability</a></li><li><a href="https://github.com/apple/swift/blob/main/docs/ABI/Stability.rst" target="_blank" rel="noreferrer">Apple: Swift Runtime</a></li><li><a href="https://github.com/apple/swift/blob/main/docs/MemorySafetyInSwift.md" target="_blank" rel="noreferrer">Apple: Swift Memory Management</a></li></ul>`,99)])])}const o=a(l,[["render",e]]);export{d as __pageData,o as default};
