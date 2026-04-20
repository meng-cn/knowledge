import{_ as a,o as n,c as i,ae as p}from"./chunks/framework.Czhw_PXq.js";const o=JSON.parse('{"title":"01 - iOS 工程化深度全栈","description":"","frontmatter":{},"headers":[],"relativePath":"01-ios/14_Engineering/01_Engineering_Deep.md","filePath":"01-ios/14_Engineering/01_Engineering_Deep.md"}'),l={name:"01-ios/14_Engineering/01_Engineering_Deep.md"};function e(t,s,h,k,r,c){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="_01-ios-工程化深度全栈" tabindex="-1">01 - iOS 工程化深度全栈 <a class="header-anchor" href="#_01-ios-工程化深度全栈" aria-label="Permalink to &quot;01 - iOS 工程化深度全栈&quot;">​</a></h1><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ol><li><a href="#1-xcode-开发环境">Xcode 开发环境</a></li><li><a href="#2-构建系统深度分析">构建系统深度分析</a></li><li><a href="#3-spm-swift-package-manager">SPM Swift Package Manager</a></li><li><a href="#4-cocoapods-深度解析">CocoaPods 深度解析</a></li><li><a href="#5-carthage-详解">Carthage 详解</a></li><li><a href="#6-xcframework-完整分析">XCFramework 完整分析</a></li><li><a href="#7-framework-与动态库深度分析">Framework 与动态库深度分析</a></li><li><a href="#8-模块化架构设计">模块化架构设计</a></li><li><a href="#9-代码规范与静态分析">代码规范与静态分析</a></li><li><a href="#10-git-工作流">Git 工作流</a></li><li><a href="#11-cicd-全流程">CI/CD 全流程</a></li><li><a href="#12-自动发布与交付">自动发布与交付</a></li><li><a href="#13-版本管理策略">版本管理策略</a></li><li><a href="#14-docd-文档系统">DocC 文档系统</a></li><li><a href="#15-资源模块打包">资源模块打包</a></li><li><a href="#16-构建优化深度策略">构建优化深度策略</a></li><li><a href="#17-swift-vs-gradle-跨语言对比">Swift vs Gradle 跨语言对比</a></li><li><a href="#18-面试考点汇总">面试考点汇总</a></li><li><a href="#19-xcode-高级特性">Xcode 高级特性</a></li><li><a href="#20-xcbuild-system-深度原理">XCBuild System 深度原理</a></li><li><a href="#21-工程化最佳实践总结">工程化最佳实践总结</a></li></ol><hr><h2 id="_1-xcode-开发环境" tabindex="-1">1. Xcode 开发环境 <a class="header-anchor" href="#_1-xcode-开发环境" aria-label="Permalink to &quot;1. Xcode 开发环境&quot;">​</a></h2><h3 id="_1-1-xcode-整体架构" tabindex="-1">1.1 Xcode 整体架构 <a class="header-anchor" href="#_1-1-xcode-整体架构" aria-label="Permalink to &quot;1.1 Xcode 整体架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode 组件架构全景图：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────  ──────────────────────────────────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                                                                            │</span></span>
<span class="line"><span>│  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐                            │</span></span>
<span class="line"><span>│  │    Xcode IDE         │   │  命令行工具链         │   │  模拟器/调试器        │                            │</span></span>
<span class="line"><span>│  │  (图形界面)           │   │  (Command Line Tools) │   │  (Device Support)    │                            │</span></span>
<span class="line"><span>│  ├──────────────────────┤   ├──────────────────────┤   ├──────────────────────┤                            │</span></span>
<span class="line"><span>│  │  • Xcode.app         │   │  • xcodebuild        │   │  • CoreSimulator     │                            │</span></span>
<span class="line"><span>│  │  • 工程管理          │   │  • xcrun             │   │  • Simulator         │                            │</span></span>
<span class="line"><span>│  │  • 代码编辑器        │   │  • swift             │   │  • 设备管理          │                            │</span></span>
<span class="line"><span>│  │  • 界面构建器(IB)    │   │  • clang             │   │  • Instruments       │                            │</span></span>
<span class="line"><span>│  │  • 导航/搜索         │   │  • ld64              │   │  • LLDB              │                            │</span></span>
<span class="line"><span>│  │  • 集成 Git          │   │  • dsymutil          │   │  • 动态分析          │                            │</span></span>
<span class="line"><span>│  │  • 测试探索          │   │  • swiftc            │   │  • Metal Shader      │                            │</span></span>
<span class="line"><span>│  │  • Performance       │   │  • swift package     │   │    Graph Capture     │                            │</span></span>
<span class="line"><span>│  │  • Source Control    │   │  • swiftlint         │   │  • CPU/Memory/       │                            │</span></span>
<span class="line"><span>│  │  • Swift Packages    │   │  • swiftformat       │   │    Network Profiler  │                            │</span></span>
<span class="line"><span>│  │  • Plugin 系统       │   │  • fastlane (3rd)    │   │    GPU/Metal         │                            │</span></span>
<span class="line"><span>│  └──────────────────────┘   └──────────────────────┘   └──────────────────────┘                            │</span></span>
<span class="line"><span>│                                                                                                            │</span></span>
<span class="line"><span>└────  ──────────────────────────────────────────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-2-xcode-工程文件体系" tabindex="-1">1.2 Xcode 工程文件体系 <a class="header-anchor" href="#_1-2-xcode-工程文件体系" aria-label="Permalink to &quot;1.2 Xcode 工程文件体系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode 工程文件体系完整结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MyProject/</span></span>
<span class="line"><span>├── MyProject.xcodeproj/                  ← Xcode 项目文件</span></span>
<span class="line"><span>│   ├── project.pbxproj                   ← PBX 格式核心配置（JSON-like）</span></span>
<span class="line"><span>│   └── project.xcworkspace/              ← 工作区容器</span></span>
<span class="line"><span>│       └── contents.xcworkspacedata      ← Workspace 引用</span></span>
<span class="line"><span>├── MyProject.xcworkspace/                ← 工作区（CocoaPods 生成）</span></span>
<span class="line"><span>│   ├── contents.xcworkspacedata          ← 引用所有子项目</span></span>
<span class="line"><span>│   ├── xcshareddata/</span></span>
<span class="line"><span>│   │   └── IDEWorkspaceChecks.plist      ← Workspace 检查标记</span></span>
<span class="line"><span>│   └── Pods/                             ← CocoaPods 依赖</span></span>
<span class="line"><span>│       ├── Pods.xcodeproj/</span></span>
<span class="line"><span>│       ├── Target Support Files/</span></span>
<span class="line"><span>│       └── Manifest.lock</span></span>
<span class="line"><span>├── MyProject/                            ← 主目标源码目录</span></span>
<span class="line"><span>│   ├── AppDelegate.swift</span></span>
<span class="line"><span>│   ├── SceneDelegate.swift</span></span>
<span class="line"><span>│   ├── Info.plist                        ← 应用配置</span></span>
<span class="line"><span>│   ├── Main.storyboard                   ← 界面</span></span>
<span class="line"><span>│   ├── ViewControllers/</span></span>
<span class="line"><span>│   │   ├── LoginViewController.swift</span></span>
<span class="line"><span>│   │   └── HomeViewController.swift</span></span>
<span class="line"><span>│   ├── Models/</span></span>
<span class="line"><span>│   ├── Views/</span></span>
<span class="line"><span>│   └── Assets.xcassets/                  ← 资源目录</span></span>
<span class="line"><span>├── MyProjectTests/                       ← 单元测试</span></span>
<span class="line"><span>├── MyProjectUITests/                     ← UI 测试</span></span>
<span class="line"><span>├── MyFramework/                          ← 子 Framework Target</span></span>
<span class="line"><span>├── .swiftlint.yml                        ← 代码规范</span></span>
<span class="line"><span>├── Podfile / Package.resolved            ← 依赖管理</span></span>
<span class="line"><span>└── exportOptions.plist                   ← 导出配置</span></span></code></pre></div><h3 id="_1-3-project-pbxproj-核心结构" tabindex="-1">1.3 project.pbxproj 核心结构 <a class="header-anchor" href="#_1-3-project-pbxproj-核心结构" aria-label="Permalink to &quot;1.3 project.pbxproj 核心结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>project.pbxproj 核心配置结构（PBX 格式）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* PBX 文件格式说明 */</span></span>
<span class="line"><span>┌─  ───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  // !$*UTF8*$!                        ← 文件编码标记</span></span>
<span class="line"><span>│  {                                    ← 根字典对象</span></span>
<span class="line"><span>│    archiveVersion = 1;                ← 归档版本（始终为 1）</span></span>
<span class="line"><span>│    classes = { };                     ← 类定义（保留）</span></span>
<span class="line"><span>│    objectVersion = 56;                ← 对应 Xcode 14/15</span></span>
<span class="line"><span>│    objects = {                        ← 所有对象集合</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│      /* ── 文件引用 ── */</span></span>
<span class="line"><span>│      /* PBXBuildFile */               ← 构建文件引用</span></span>
<span class="line"><span>│      /* PBXFileReference */            ← 文件路径引用</span></span>
<span class="line"><span>│      /* PBXGroup */                   ← 分组结构</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│      /* ── 构建规则 ── */</span></span>
<span class="line"><span>│      /* PBXBuildRule */               ← 自定义构建规则</span></span>
<span class="line"><span>│      /* PBXShellScriptBuildPhase */    ← 脚本构建阶段</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│      /* ── Target 相关 ── */</span></span>
<span class="line"><span>│      /* PBXNativeTarget */             ← 主目标定义</span></span>
<span class="line"><span>│      /* PBXAggregateTarget */          ← 聚合目标</span></span>
<span class="line"><span>│      /* PBXTargetDependency */         ← 目标依赖</span></span>
<span class="line"><span>│      /* PBXContainerItemProxy */       ← 容器代理（跨项目依赖）</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│      /* ── 配置 ── */</span></span>
<span class="line"><span>│      /* XCBuildConfiguration */        ← 构建配置</span></span>
<span class="line"><span>│      /* XCConfigurationList */         ← 配置列表</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│      /* ── 文件组 ── */</span></span>
<span class="line"><span>│      /* PBXFileSystemSynchronizedGroup */ ← 文件系统同步组</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│    };                                   ← objects 结束</span></span>
<span class="line"><span>│    rootObject = &quot;XXXXXXXXXX&quot;;           ← 根对象引用</span></span>
<span class="line"><span>│  }                                      ← 根字典结束</span></span>
<span class="line"><span>└─  ───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>project.pbxproj 对象关系图：</span></span>
<span class="line"><span>┌─────────────┐     指向      ┌──────────────────┐     包含      ┌──────────────┐</span></span>
<span class="line"><span>│ PBXNative   │───────────→ │ XCBuildConfigList  │───────────→ │ XCBuildConfig  │</span></span>
<span class="line"><span>│  Target      │             │ (配置列表)          │             │  (Debug/Release) │</span></span>
<span class="line"><span>│              │             │      │             │             │              │</span></span>
<span class="line"><span>│              │             │      ├── Debug    │             │  SWIFT_VERSION │</span></span>
<span class="line"><span>│              │◄─────────── │      │             │             │  OTHER_LDFLAGS │</span></span>
<span class="line"><span>│  PBXTarget   │   反向引用   │      └── Release  │             │  PRODUCT_NAME  │</span></span>
<span class="line"><span>│  Dependency  │             └──────────────────┘             └──────────────┘</span></span>
<span class="line"><span>│              │                        │</span></span>
<span class="line"><span>│              │            ┌────────────▼─────────┐</span></span>
<span class="line"><span>│              │            │   PBXBuildFile       │</span></span>
<span class="line"><span>│              │            │   (源文件引用)        │</span></span>
<span class="line"><span>│              │            └──────────────────────┘</span></span>
<span class="line"><span>└─────────────┘</span></span></code></pre></div><h3 id="_1-4-scheme-配置详解" tabindex="-1">1.4 Scheme 配置详解 <a class="header-anchor" href="#_1-4-scheme-配置详解" aria-label="Permalink to &quot;1.4 Scheme 配置详解&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode Scheme 配置完整结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Product → Scheme → Edit Scheme → 全部选项</span></span>
<span class="line"><span></span></span>
<span class="line"><span>├── ▶ Run 配置</span></span>
<span class="line"><span>│   ├── Executable: [选择可执行文件]</span></span>
<span class="line"><span>│   ├── Launch: Always / Once / Never</span></span>
<span class="line"><span>│   ├── Debugging:</span></span>
<span class="line"><span>│   │   ├── Debug Symbol Format: DWARF with dSYM</span></span>
<span class="line"><span>│   │   ├── Enable Address Sanitizer      ← 内存错误检测</span></span>
<span class="line"><span>│   │   ├── Enable Thread Sanitizer       ← 线程安全检测</span></span>
<span class="line"><span>│   │   ├── Enable Thread Safety Analysis</span></span>
<span class="line"><span>│   │   ├── GPU Frame Capture: Auto / Metal / Auto on next launch</span></span>
<span class="line"><span>│   │   ├── Metal Shader Validation: Auto</span></span>
<span class="line"><span>│   │   ├── Metal Shader Validation Level: Default</span></span>
<span class="line"><span>│   │   └── Capture GPU Trace: Auto</span></span>
<span class="line"><span>│   ├── Options:</span></span>
<span class="line"><span>│   │   ├── Override Working Directory:</span></span>
<span class="line"><span>│   │   ├── Custom Environment Variables:</span></span>
<span class="line"><span>│   │   ├── Launch Timeout:</span></span>
<span class="line"><span>│   │   └── Language &amp; Region:</span></span>
<span class="line"><span>│   └── Profile:</span></span>
<span class="line"><span>│       └── Launch Idle: 0.0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>├── □ Test 配置</span></span>
<span class="line"><span>│   ├── Collect Performance Data:</span></span>
<span class="line"><span>│   ├── Language &amp; Locale:</span></span>
<span class="line"><span>│   ├── Gather Coverage Data:</span></span>
<span class="line"><span>│   ├── Test On:</span></span>
<span class="line"><span>│   └── Language &amp; Region:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>├── ● Profile 配置</span></span>
<span class="line"><span>│   ├── Instruments: [选择 Instruments]</span></span>
<span class="line"><span>│   ├── Launch Idle:</span></span>
<span class="line"><span>│   └── Use Custom Device:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>├── △ Analyze 配置</span></span>
<span class="line"><span>│   └── Analyze While Building:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>└── ◆ Archive 配置</span></span>
<span class="line"><span>    ├── Distribution: App Store / Ad Hoc / Development / Enterprise</span></span>
<span class="line"><span>    ├── Show Log: All / Build Only / Archive Only</span></span>
<span class="line"><span>    └── Code Signing: 签名配置</span></span></code></pre></div><h3 id="_1-5-xcode-构建流程内部机制" tabindex="-1">1.5 Xcode 构建流程内部机制 <a class="header-anchor" href="#_1-5-xcode-构建流程内部机制" aria-label="Permalink to &quot;1.5 Xcode 构建流程内部机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode 构建流程完整链路：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  用户点击 Build (⌘B)                                              │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 1: Pre-actions (Xcode 脚本)                                  │</span></span>
<span class="line"><span>│  • 清理 DerivedData                                                    │</span></span>
<span class="line"><span>│  • 更新版本信息                                                        │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 2: Compile Sources (编译源文件)                                │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │  Swift 文件:                                                   │ │</span></span>
<span class="line"><span>│  │  swiftc → AST → SIL → LLVM IR → BitCode (可选)               │ │</span></span>
<span class="line"><span>│  │                                                              │ │</span></span>
<span class="line"><span>│  │  Objective-C 文件:                                             │ │</span></span>
<span class="line"><span>│  │  clang → AST → LLVM IR → BitCode                             │ │</span></span>
<span class="line"><span>│  │                                                              │ │</span></span>
<span class="line"><span>│  │  Objective-C 转 Swift:                                         │ │</span></span>
<span class="line"><span>│  │  -fobjc-arc (ARC 管理)                                        │ │</span></span>
<span class="line"><span>│  │  -fobjc-weak (弱引用)                                          │ │</span></span>
<span class="line"><span>│  │  -fmodules (模块导入)                                          │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 3: Compile Resources (编译资源)                                │</span></span>
<span class="line"><span>│  • Asset Catalog → .car (Compiled Asset)                         │</span></span>
<span class="line"><span>│  • Storyboard/XIB → .nib (Nucleus Interface Builder)             │</span></span>
<span class="line"><span>│  • Localization → .strings → .stringsdata                        │</span></span>
<span class="line"><span>│  • Core Data → .xcdatamodeld → .momd                             │</span></span>
<span class="line"><span>│  • Plist → .plist                                                │</span></span>
<span class="line"><span>│  • Fonts → .ttf/.otf                                             │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 4: Link Binaries (链接二进制)                                  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │  链接顺序:                                                     │ │</span></span>
<span class="line"><span>│  │  1. Swift 标准库 (libswiftCore.dylib, libswiftFoundation.dylib)│ │</span></span>
<span class="line"><span>│  │  2. Foundation / UIKit / 其他系统框架                          │ │</span></span>
<span class="line"><span>│  │  3. 自定义 Framework (静态/动态)                              │ │</span></span>
<span class="line"><span>│  │  4. Pods (CocoaPods) / SPM 包                                │ │</span></span>
<span class="line"><span>│  │  5. System libraries (-l, -framework)                        │ │</span></span>
<span class="line"><span>│  │                                                              │ │</span></span>
<span class="line"><span>│  │  ld64 (Apple 链接器) 关键参数:                                │ │</span></span>
<span class="line"><span>│  │  -o (输出文件)  -L (搜索路径)  -F (Framework 搜索)           │ │</span></span>
<span class="line"><span>│  │  -lstdc++  -ObjC  -all_load  -force_load                     │ │</span></span>
<span class="line"><span>│  │  -dead_strip (死代码剥离)  -rpath (运行时路径)                │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 5: Embed Binaries (嵌入二进制)                                 │</span></span>
<span class="line"><span>│  • 动态 Framework → \${CONTENTS_FRAMEWORKS_DIR}/.framework       │</span></span>
<span class="line"><span>│  • Swift 运行时 → \${CONTENTS}/usr/lib/swift/                    │</span></span>
<span class="line"><span>│  • Bitcode (已弃用)                                               │</span></span>
<span class="line"><span>│  • dSYM → \${CONTENTS}/dSYMs/                                    │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 6: Code Sign (代码签名)                                        │</span></span>
<span class="line"><span>│  • Code Signing Identity: iPhone Developer / Distribution       │</span></span>
<span class="line"><span>│  • Provisioning Profile: 描述文件                                │</span></span>
<span class="line"><span>│  • 签名验证: 二进制 → 资源 → 整个 App                            │</span></span>
<span class="line"><span>│  • Entitlements: 权限配置                                         │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Phase 7: Post-actions (后处理)                                       │</span></span>
<span class="line"><span>│  • 生成 .dSYM 符号文件                                             │</span></span>
<span class="line"><span>│  • 生成覆盖率报告                                                  │</span></span>
<span class="line"><span>│  • 上传符号文件到 Crashlytics 等                                  │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                              │</span></span>
<span class="line"><span>                              ▼</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 产物: MyApp.app (IPA 内容)                                          │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │  MyApp.app/                                                  │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/MyApp          ← 可执行文件            │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/Frameworks/    ← 嵌入 Framework       │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/Info.plist       ← 应用配置            │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/Assets.car       ← 编译资源            │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/embedded.mobileprovision ← 描述文件    │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/dSYMs/           ← 符号文件            │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/usr/lib/swift/   ← Swift 运行时        │ │</span></span>
<span class="line"><span>│  │  ├── Payload/MyApp.app/PkgInfo          ← PkgInfo 文件        │ │</span></span>
<span class="line"><span>│  │  └── Payload/MyApp.app/PlugIns/         ← 扩展 (Widget等)     │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_1-6-deriveddata-体系" tabindex="-1">1.6 DerivedData 体系 <a class="header-anchor" href="#_1-6-deriveddata-体系" aria-label="Permalink to &quot;1.6 DerivedData 体系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DerivedData 文件体系（构建缓存）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>~/Library/Developer/Xcode/DerivedData/</span></span>
<span class="line"><span>├── &lt;ProjectHash&gt;-&lt;RandomString&gt;/    ← 每个项目一个目录</span></span>
<span class="line"><span>│   ├── Build/</span></span>
<span class="line"><span>│   │   ├── Intermediates.noindex/   ← 中间产物（增量构建）</span></span>
<span class="line"><span>│   │   │   ├── MyProject.build/     ← 每个 Target 一个目录</span></span>
<span class="line"><span>│   │   │   │   ├── Debug-iphonesimulator/</span></span>
<span class="line"><span>│   │   │   │   │   ├── MyProject.build/</span></span>
<span class="line"><span>│   │   │   │   │   │   ├── Objects-normal/arm64/</span></span>
<span class="line"><span>│   │   │   │   │   │   │   ├── AppDelegate.o</span></span>
<span class="line"><span>│   │   │   │   │   │   │   ├── ViewController.o</span></span>
<span class="line"><span>│   │   │   │   │   │   │   └── ...</span></span>
<span class="line"><span>│   │   │   │   │   ├── MyProject.normal/</span></span>
<span class="line"><span>│   │   │   │   │   │   └── ...</span></span>
<span class="line"><span>│   │   │   │   ├── Release-iphonesimulator/</span></span>
<span class="line"><span>│   │   │   │   └── ...</span></span>
<span class="line"><span>│   │   │   └── Pods.build/          ← CocoaPods 中间产物</span></span>
<span class="line"><span>│   │   └── Products.noindex/        ← 最终产物</span></span>
<span class="line"><span>│   │       ├── Debug-iphonesimulator/</span></span>
<span class="line"><span>│   │       │   ├── MyApp.app/</span></span>
<span class="line"><span>│   │       │   ├── MyFramework.framework/</span></span>
<span class="line"><span>│   │       │   ├── MyApp.app.dSYM/</span></span>
<span class="line"><span>│   │       │   └── MyFramework.dSYM/</span></span>
<span class="line"><span>│   │       └── Release-iphonesimulator/</span></span>
<span class="line"><span>│   ├── Index/</span></span>
<span class="line"><span>│   │   ├── data.idx/           ← 代码索引（全文搜索）</span></span>
<span class="line"><span>│   │   └── ...</span></span>
<span class="line"><span>│   ├── Logs/</span></span>
<span class="line"><span>│   │   ├── Build/</span></span>
<span class="line"><span>│   │   ├── Test/</span></span>
<span class="line"><span>│   │   └── Archive/</span></span>
<span class="line"><span>│   └── ModuleCache.noindex/    ← 模块缓存</span></span>
<span class="line"><span>│       └── 2TX/</span></span>
<span class="line"><span>│           ├── Foundation.pcm</span></span>
<span class="line"><span>│           ├── UIKit.pcm</span></span>
<span class="line"><span>│           └── ...</span></span></code></pre></div><hr><h2 id="_2-构建系统深度分析" tabindex="-1">2. 构建系统深度分析 <a class="header-anchor" href="#_2-构建系统深度分析" aria-label="Permalink to &quot;2. 构建系统深度分析&quot;">​</a></h2><h3 id="_2-1-xcodebuild-命令体系" tabindex="-1">2.1 xcodebuild 命令体系 <a class="header-anchor" href="#_2-1-xcodebuild-命令体系" aria-label="Permalink to &quot;2.1 xcodebuild 命令体系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>xcodebuild 命令层级结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>xcodebuild</span></span>
<span class="line"><span>├── -project &lt;.xcodeproj&gt;              ← 指定项目（必须，或使用 .xcworkspace）</span></span>
<span class="line"><span>├── -workspace &lt;.xcworkspace&gt;           ← 指定工作区（含 CocoaPods）</span></span>
<span class="line"><span>├── -scheme &lt;SchemeName&gt;               ← 指定 Scheme</span></span>
<span class="line"><span>├── -configuration &lt;Debug|Release&gt;      ← 构建配置</span></span>
<span class="line"><span>├── -sdk &lt;iphonesimulator|iphoneos&gt;     ← 指定 SDK</span></span>
<span class="line"><span>├── -destination &lt;destination&gt;           ← 目标设备</span></span>
<span class="line"><span>├── -derivedDataPath &lt;path&gt;             ← DerivedData 路径</span></span>
<span class="line"><span>├── -showBuildSettings                 ← 显示构建设置</span></span>
<span class="line"><span>├── -list                              ← 列出所有 Targets/Schemes</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── clean                              ← 清理构建产物</span></span>
<span class="line"><span>├── build                              ← 普通构建</span></span>
<span class="line"><span>├── test                               ← 构建并运行测试</span></span>
<span class="line"><span>├── archive                            ← 构建 Archive</span></span>
<span class="line"><span>├── analyze                            ← 静态分析</span></span>
<span class="line"><span>├── docbuild                           ← 构建 DocC</span></span>
<span class="line"><span>└── package                            ← 打包（XCFramework）</span></span></code></pre></div><h3 id="_2-2-xcodebuild-深度用法" tabindex="-1">2.2 xcodebuild 深度用法 <a class="header-anchor" href="#_2-2-xcodebuild-深度用法" aria-label="Permalink to &quot;2.2 xcodebuild 深度用法&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 1. 基本构建 =====</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 构建特定 target 和 scheme</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -project</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp.xcodeproj</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -configuration</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Debug</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -destination</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;platform=iOS Simulator,name=iPhone 15,OS=17.0&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 使用 workspace（CocoaPods 项目）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -workspace</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp.xcworkspace</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -configuration</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Debug</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 2. 模拟器 vs 真机构建 =====</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 模拟器</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -sdk</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> iphonesimulator</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -destination</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;platform=iOS Simulator,name=iPhone 15,OS=17.0&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 真机</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -sdk</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> iphoneos</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -destination</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;generic/platform=iOS&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 3. Archive 构建 =====</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> archive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -workspace</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp.xcworkspace</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -configuration</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Release</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -archivePath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyApp.xcarchive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -skipInstallation</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  CODE_SIGNING_ALLOWED=NO</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 4. 导出 IPA =====</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 使用 exportOptionsPlist</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -exportArchive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -archivePath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyApp.xcarchive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -exportPath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyApp.ipa</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -exportOptionsPlist</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> exportOptions.plist</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># exportOptions.plist 配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xml version</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> encoding</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;UTF-8&quot;?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;!</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">DOCTYPE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> plist</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> PUBLIC</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;-//Apple//DTD PLIST 1.0//EN&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  &quot;http://www.apple.com/DTDs/PropertyList-1.0.dtd&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plist version</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1.0&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dict</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/key&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">app-store</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/string&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;!</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">--</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> app-store</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ad-hoc</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> enterprise</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> development</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> developer-id</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">uploadBitcode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/key&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">false/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">uploadSymbols</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/key&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">true/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">compileBitcode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/key&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">false/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">embedOnDemandAssetsIndex</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/key&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">false/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/dict</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/plist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 5. 并行构建 =====</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -parallelizeTargets</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -jobs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sysctl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> hw.ncpu</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h3 id="_2-3-build-settings-关键配置深度解析" tabindex="-1">2.3 Build Settings 关键配置深度解析 <a class="header-anchor" href="#_2-3-build-settings-关键配置深度解析" aria-label="Permalink to &quot;2.3 Build Settings 关键配置深度解析&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Build Settings 核心配置完整列表：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────────┬───────────────────┬─────────────────────┐</span></span>
<span class="line"><span>│ 配置项                                │ 说明               │ 推荐值               │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Swift Language Version               │ Swift 版本          │ 5.9+                 │</span></span>
<span class="line"><span>│ (SWIFT_VERSION)                      │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Product Bundle Identifier            │ Bundle ID          │ com.company.app      │</span></span>
<span class="line"><span>│ (PRODUCT_BUNDLE_IDENTIFIER)          │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Product Name                         │ 产品名称           │ MyApp                │</span></span>
<span class="line"><span>│ (PRODUCT_NAME)                       │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ iOS Deployment Target               │ 最低部署版本        │ iOS 15+              │</span></span>
<span class="line"><span>│ (IPHONEOS_DEPLOYMENT_TARGET)         │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Architectures                        │ 支持架构           │ arm64                │</span></span>
<span class="line"><span>│ (ARCHS)                             │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Build Active Architecture Only       │ 仅构建激活架构      │ YES(Debug)/NO(Release)│</span></span>
<span class="line"><span>│ (ONLY_ACTIVE_ARCH)                   │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Clang Compile Optimization Level     │ 编译器优化等级      │ -Onone(-O0) / -O     │</span></span>
<span class="line"><span>│ (CLANG_OPTIMIZATION_LEVEL)           │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Swift Optimization Level             │ Swift 优化等级      │ -Onone / -O          │</span></span>
<span class="line"><span>│ (SWIFT_OPTIMIZATION_LEVEL)           │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Debug Information Format             │ 符号表格式          │ DWARF(Debug)         │</span></span>
<span class="line"><span>│ (DEBUG_INFORMATION_FORMAT)           │                    │ DWARF with dSYM      │</span></span>
<span class="line"><span>│                                      │                    │ (Release)            │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Dead Code Stripping                  │ 死代码剥离          │ NO(Debug)            │</span></span>
<span class="line"><span>│ (STRIP_DEAD_CODE)                    │                    │ YES(Release)         │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Strip Linked Product                │ 剥离链接产物        │ NO(Debug)            │</span></span>
<span class="line"><span>│ (STRIP_INSTALLED_PRODUCT)            │                    │ YES(Release)         │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Dead Code Stripping (Release)        │ 死代码剥离          │ YES(Release)         │</span></span>
<span class="line"><span>│ (DEAD_CODE_STRIPPING)                │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Enable Bitcode                       │ Bitcode (已弃用)    │ NO                   │</span></span>
<span class="line"><span>│ (ENABLE_BITCODE)                     │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Clang Dangling Delete Warnings       │ 悬空释放警告        │ YES                  │</span></span>
<span class="line"><span>│ (CLANG_WARN_DANGLING_BIND)           │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Documentation Comments Warnings      │ 文档注释警告        │ YES                  │</span></span>
<span class="line"><span>│ (CLANG_WARN_DOCUMENTATION_COMMENTS)  │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Enable Testability                   │ 测试可用性          │ YES(Debug)           │</span></span>
<span class="line"><span>│ (ENABLE_TESTABILITY)                 │                    │ NO(Release)          │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Other Linker Flags                   │ 链接器额外参数      │ -ObjC                │</span></span>
<span class="line"><span>│ (OTHER_LDFLAGS)                      │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Framework Search Paths              │ Framework 搜索路径   │ $(inherited)         │</span></span>
<span class="line"><span>│ (FRAMEWORK_SEARCH_PATHS)             │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Header Search Paths                 │ 头文件搜索路径      │ $(inherited)         │</span></span>
<span class="line"><span>│ (HEADER_SEARCH_PATHS)                │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Library Search Paths                │ 库文件搜索路径      │ $(inherited)         │</span></span>
<span class="line"><span>│ (LIBRARY_SEARCH_PATHS)               │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Embed In Code Signing Identity       │ 代码签名身份        │ 自动配置              │</span></span>
<span class="line"><span>│ (CODE_SIGN_IDENTITY)                 │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Code Signing Entitlements            │ 权限配置           │ MyApp.entitlements    │</span></span>
<span class="line"><span>│ (CODE_SIGN_ENTITLEMENTS)             │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Code Signing Style                   │ 签名方式           │ Automatic            │</span></span>
<span class="line"><span>│ (CODE_SIGN_STYLE)                    │                    │ (Manual for CI)      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Provisioning Profile                 │ 描述文件           │ 自动配置              │</span></span>
<span class="line"><span>│ (PROVISIONING_PROFILE)               │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Info PLIST File                      │ Info.plist 文件    │ $(PROJECT_DIR)/...   │</span></span>
<span class="line"><span>│ (INFOPLIST_FILE)                     │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ LTO (Link Time Optimization)         │ 链接时优化          │ Default              │</span></span>
<span class="line"><span>│ (LTO)                               │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Enable Module (Whole Module)         │ 模块优化           │ YES                  │</span></span>
<span class="line"><span>│ (SWIFT_WHOLE_MODULE_OPTIMIZATION)    │                    │ (Release)            │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Emit Swift Documentation Comments    │ DocC 文档          │ YES                  │</span></span>
<span class="line"><span>│ (SWIFT_EMIT_DOCCOMMENT)              │                    │                      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ Skip Installing                      │ 跳过安装           │ NO                   │</span></span>
<span class="line"><span>│ (SKIP_INSTALL)                       │                    │ (Framework: YES)     │</span></span>
<span class="line"><span>└───────────────────────────────────────┴────────────────────┴──────────────────────┘</span></span></code></pre></div><h3 id="_2-4-build-phases-详解" tabindex="-1">2.4 Build Phases 详解 <a class="header-anchor" href="#_2-4-build-phases-详解" aria-label="Permalink to &quot;2.4 Build Phases 详解&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Build Phases 执行顺序与机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Build Phases 执行顺序：                                             │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  1. ☑ Compile Sources                                             │</span></span>
<span class="line"><span>│     • 编译所有源文件（.swift/.m/.mm）                              │</span></span>
<span class="line"><span>│     • 依赖关系解析                                                    │</span></span>
<span class="line"><span>│     • Swift Modules 导入                                             │</span></span>
<span class="line"><span>│     • Objective-C Bridging Header 处理                              │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  2. ☑ Compile Resources                                            │</span></span>
<span class="line"><span>│     • 编译 .xcassets → .car                                       │</span></span>
<span class="line"><span>│     • 编译 .storyboard → .nib                                     │</span></span>
<span class="line"><span>│     • 编译 .strings → .stringsdata                                 │</span></span>
<span class="line"><span>│     • 处理 .xcdatamodeld                                           │</span></span>
<span class="line"><span>│     • 编译 .car (Color, IconSet)                                 │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  3. ☑ Link Binaries with Libraries                               │</span></span>
<span class="line"><span>│     • 链接系统框架（UIKit, Foundation）                             │</span></span>
<span class="line"><span>│     • 链接静态库（.a）                                              │</span></span>
<span class="line"><span>│     • 链接 CocoaPods 静态库                                        │</span></span>
<span class="line"><span>│     • -ObjC -all_load 处理                                          │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  4. ☐ Copy Bundle Resources                                       │</span></span>
<span class="line"><span>│     • 复制资源到 .app 目录                                         │</span></span>
<span class="line"><span>│     • 字体、plist、xib、storyboard                                │</span></span>
<span class="line"><span>│     • CocoaPods 资源文件                                            │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  5. ☐ Embed Frameworks                                            │</span></span>
<span class="line"><span>│     • 嵌入动态 Framework 到 App                                   │</span></span>
<span class="line"><span>│     • 设置 @rpath                                                 │</span></span>
<span class="line"><span>│     • 复制 Framework 到 Contents/Frameworks/                      │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  6. ☐ Run Script                                                  │</span></span>
<span class="line"><span>│     • 自定义脚本（代码生成、资源处理）                              │</span></span>
<span class="line"><span>│     • 注意：脚本在链接后执行                                         │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  7. ☑ Thin Binary (Strip)                                        │</span></span>
<span class="line"><span>│     • Strip 调试符号（Release）                                    │</span></span>
<span class="line"><span>│     • 生成 dSYM                                                   │</span></span>
<span class="line"><span>│     • 剥离未使用的代码                                              │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  8. ☐ Check Pods Deploy Target                                   │</span></span>
<span class="line"><span>│     • CocoaPods 检查部署版本                                        │</span></span>
<span class="line"><span>│     • 检查架构兼容性                                                │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  9. ☐ Copy Files                                                  │</span></span>
<span class="line"><span>│     • 复制产物到指定目录                                             │</span></span>
<span class="line"><span>│     • 常用于导出 .app/.framework                                   │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  10. ☐ Generate DocC                                               │</span></span>
<span class="line"><span>│      • Xcode 14+ DocC 文档生成                                    │</span></span>
<span class="line"><span>│      • 在编译时提取文档注释                                          │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  11. ☐ Validate Framework                                           │</span></span>
<span class="line"><span>│      • 验证 Framework 架构支持                                      │</span></span>
<span class="line"><span>│      • 检查架构列表                                                │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  12. ☐ Embed &amp; Sign Frameworks                                    │</span></span>
<span class="line"><span>│      • 嵌入并签名 Framework                                        │</span></span>
<span class="line"><span>│      • 处理签名身份                                                │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_2-5-build-configurations-体系" tabindex="-1">2.5 Build Configurations 体系 <a class="header-anchor" href="#_2-5-build-configurations-体系" aria-label="Permalink to &quot;2.5 Build Configurations 体系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Build Configuration 完整配置体系：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  配置类型对比：                                                    │</span></span>
<span class="line"><span>│                                                                │</span></span>
<span class="line"><span>│  ┌───────────┬───────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ Debug     │ Release                                     │ │</span></span>
<span class="line"><span>│  ├───────────┼───────────────────────────────────────────────┤ │</span></span>
<span class="line"><span>│  │ 优化等级   │ -Onone（无优化）  -O（快速优化）              │ │</span></span>
<span class="line"><span>│  │ 调试信息   │ DWARF            DWARF with dSYM             │ │</span></span>
<span class="line"><span>│  │ 测试可用性  │ YES              NO                          │ │</span></span>
<span class="line"><span>│  │ 死代码剥离  │ NO             YES                          │ │</span></span>
<span class="line"><span>│  │ Swift 模块优化 │ NO          YES（Whole Module）           │ │</span></span>
<span class="line"><span>│  │ Bitcode    │ 不启用           启用（已弃用）                  │ │</span></span>
<span class="line"><span>│  │ Strip      │ NO             YES                          │ │</span></span>
<span class="line"><span>│  │ 性能        │ 开发调试         生产环境                      │ │</span></span>
<span class="line"><span>│  └───────────┴───────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>│                                                                │</span></span>
<span class="line"><span>│  自定义配置示例：                                                │</span></span>
<span class="line"><span>│  - InternalDebug：用于内部测试，启用更多日志                     │</span></span>
<span class="line"><span>│  - InternalRelease：用于内部正式构建                            │</span></span>
<span class="line"><span>│  - AdHocDebug：用于 AdHoc 分发调试                            │</span></span>
<span class="line"><span>│  - ProductionRelease：生产环境 Release                         │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><hr><h2 id="_3-spm-swift-package-manager" tabindex="-1">3. SPM Swift Package Manager <a class="header-anchor" href="#_3-spm-swift-package-manager" aria-label="Permalink to &quot;3. SPM Swift Package Manager&quot;">​</a></h2><h3 id="_3-1-spm-架构原理" tabindex="-1">3.1 SPM 架构原理 <a class="header-anchor" href="#_3-1-spm-架构原理" aria-label="Permalink to &quot;3.1 SPM 架构原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SPM 架构全景：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Swift Package Manager 架构：                                     │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  客户端（开发者）                                          │   │</span></span>
<span class="line"><span>│  │  • Package.swift（声明依赖）                              │   │</span></span>
<span class="line"><span>│  │  • Swift Package（被依赖方）                              │   │</span></span>
<span class="line"><span>│  │  • Xcode 集成（文件添加/移除）                            │   │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                              │                                    │</span></span>
<span class="line"><span>│                              ▼                                    │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  包管理核心（swift package 命令）                          │   │</span></span>
<span class="line"><span>│  │  • Package.resolved（解析后的锁定文件）                   │   │</span></span>
<span class="line"><span>│  │  • .build/（构建缓存和产物）                              │   │</span></span>
<span class="line"><span>│  │  • .swiftpm/xcode/package.xcworkspace（Xcode 集成）     │   │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                              │                                    │</span></span>
<span class="line"><span>│                              ▼                                    │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  包源仓库                                                   │   │</span></span>
<span class="line"><span>│  │  • GitHub（主要源）                                       │   │</span></span>
<span class="line"><span>│  │  • GitLab/BitBucket                                      │   │</span></span>
<span class="line"><span>│  │  • 本地路径                                                │   │</span></span>
<span class="line"><span>│  │  • 私有服务器                                              │   │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_3-2-package-swift-完整语法" tabindex="-1">3.2 Package.swift 完整语法 <a class="header-anchor" href="#_3-2-package-swift-完整语法" aria-label="Permalink to &quot;3.2 Package.swift 完整语法&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// swift-tools-version: 5.9</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PackageDescription</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> package</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ── 包基本信息 ──</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    platforms</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">iOS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(.v15),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 或 macOS(.v13), watchOS(.v9), tvOS(.v17)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 不指定 platforms 则无平台限制</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ── 产品（对外提供的库） ──</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    products</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 动态库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">library</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .dynamic,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// .dynamic | .static (默认)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            targets</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 静态库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">library</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFrameworkStatic&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .static,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            targets</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 工具包（可执行文件）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">executableTarget</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyCLI&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ── 依赖 ──</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 远程依赖（语义化版本）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://github.com/Alamofire/Alamofire.git&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;5.8.0&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // &gt;=5.8.0 &lt;6.0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 精确版本</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://github.com/nicklockwood/SwiftFormat.git&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            exact</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;0.50.3&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 分支</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://github.com/Alamofire/Alamofire.git&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            branch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;main&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 范围</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://github.com/Alamofire/Alamofire.git&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 从 5.0.0 到 5.99.99</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">upToNextMajor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;5.0.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 从 5.0.0 到 6.0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">upToNextMinor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;5.0.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 本地包</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;../LocalPackage&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ── 目标 ──</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    targets</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 普通目标</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 依赖产品</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">product</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Alamofire&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">package</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Alamofire&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 目标依赖</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                &quot;LocalDependency&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Sources&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 排除文件</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            exclude</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;README.md&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 源文件</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            sources</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Core&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Network&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 资源</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            resources</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">process</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Resources&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 处理资源</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">copy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Config&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 复制资源</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">process</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;PrivacyInfo.xcprivacy&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 隐私清单</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 构建规则</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            swiftSettings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">enableExperimentalFeature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;StrictConcurrency&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">define</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;DEBUG&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">configuration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: .debug)),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 测试目标</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">testTarget</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFrameworkTests&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyFramework&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            resources</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">copy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;TestResources&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h3 id="_3-3-spm-依赖解析机制" tabindex="-1">3.3 SPM 依赖解析机制 <a class="header-anchor" href="#_3-3-spm-依赖解析机制" aria-label="Permalink to &quot;3.3 SPM 依赖解析机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SPM 依赖解析流程（Swift 5.3+ SwiftPM 5.4）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  Step 1: 读取 Package.swift                                       │</span></span>
<span class="line"><span>│  • 解析所有 .package() 声明                                         │</span></span>
<span class="line"><span>│  • 获取 Git 仓库 URL                                               │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  Step 2: Git clone/fetch                                          │</span></span>
<span class="line"><span>│  • 拉取所有依赖仓库（并行）                                          │</span></span>
<span class="line"><span>│  • 解析每个依赖的 Package.swift                                   │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  Step 3: 语义化版本解析                                             │</span></span>
<span class="line"><span>│  • from: &quot;5.8.0&quot; → [5.8.0, 6.0.0)  → 选 5.9.1                 │</span></span>
<span class="line"><span>│  • upToNextMajor: &quot;5.0.0&quot; → [5.0.0, 6.0.0) → 选 5.9.1          │</span></span>
<span class="line"><span>│  • upToNextMinor: &quot;5.0.0&quot; → [5.0.0, 5.1.0) → 选 5.0.4          │</span></span>
<span class="line"><span>│  • exact: &quot;5.8.0&quot; → 锁定 5.8.0                                   │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  Step 4: 生成 Package.resolved                                    │</span></span>
<span class="line"><span>│  • 记录每个依赖的 commit SHA                                       │</span></span>
<span class="line"><span>│  • 用于重现相同的依赖版本                                            │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  Step 5: Xcode 集成                                               │</span></span>
<span class="line"><span>│  • 生成 .swiftpm/xcode/package.xcworkspace                       │</span></span>
<span class="line"><span>│  • 将包添加为 Xcode Workspace 的一部分                            │</span></span>
<span class="line"><span>│  • 生成 .xcodeproj（可选）                                        │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Package.resolved 文件结构：</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  &quot;object&quot;: {</span></span>
<span class="line"><span>    &quot;pins&quot;: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        &quot;identity&quot;: &quot;alamofire&quot;,</span></span>
<span class="line"><span>        &quot;location&quot;: &quot;https://github.com/Alamofire/Alamofire.git&quot;,</span></span>
<span class="line"><span>        &quot;state&quot;: {</span></span>
<span class="line"><span>          &quot;version&quot;: &quot;5.8.1&quot;,</span></span>
<span class="line"><span>          &quot;revision&quot;: &quot;abc123def456...&quot;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &quot;packageRef&quot;: {</span></span>
<span class="line"><span>          &quot;kind&quot;: &quot;remote&quot;,</span></span>
<span class="line"><span>          &quot;location&quot;: &quot;https://github.com/Alamofire/Alamofire.git&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    ]</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-4-spm-与-xcode-集成" tabindex="-1">3.4 SPM 与 Xcode 集成 <a class="header-anchor" href="#_3-4-spm-与-xcode-集成" aria-label="Permalink to &quot;3.4 SPM 与 Xcode 集成&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode 集成 SPM 的两种方式：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>方式 1：Xcode 图形界面</span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  1. File → Add Packages...                                         │</span></span>
<span class="line"><span>│  2. 输入仓库 URL                                                   │</span></span>
<span class="line"><span>│  3. 选择版本规则（Up to Next Major / Exact / Branch）              │</span></span>
<span class="line"><span>│  4. 选择 Target 和依赖                                             │</span></span>
<span class="line"><span>│  5. Xcode 自动添加并构建                                             │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>方式 2：命令行</span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  在 Package.swift 所在目录：                                       │</span></span>
<span class="line"><span>│  $ swift package init --name MyCLI --type executable                 │</span></span>
<span class="line"><span>│  $ swift package init --name MyFramework --type library              │</span></span>
<span class="line"><span>│  $ swift package update                                              │</span></span>
<span class="line"><span>│  $ swift package resolve                                               │</span></span>
<span class="line"><span>│  $ swift build                                                         │</span></span>
<span class="line"><span>│  $ swift test                                                           │</span></span>
<span class="line"><span>│  $ swift package generate-xcodeproj                                    │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_3-5-spm-二进制依赖" tabindex="-1">3.5 SPM 二进制依赖 <a class="header-anchor" href="#_3-5-spm-二进制依赖" aria-label="Permalink to &quot;3.5 SPM 二进制依赖&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SPM 二进制包分发方式：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  方式 1：GitHub Releases（.xcframework）                            │</span></span>
<span class="line"><span>│  • 上传 .xcframework 到 GitHub Release                            │</span></span>
<span class="line"><span>│  • Package.swift 声明：                                           │</span></span>
<span class="line"><span>│    .package(                                                    │</span></span>
<span class="line"><span>│      url: &quot;https://github.com/org/MyFramework.git&quot;,              │</span></span>
<span class="line"><span>│      from: &quot;1.0.0&quot;                                              │</span></span>
<span class="line"><span>│    )                                                              │</span></span>
<span class="line"><span>│  • Xcode 自动下载并集成                                           │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  方式 2：本地 URL（.xcframework）                                  │</span></span>
<span class="line"><span>│  • 直接引用本地 .xcframework                                      │</span></span>
<span class="line"><span>│  • .package(url: &quot;file:///path/to/MyFramework.xcframework&quot;,      │</span></span>
<span class="line"><span>│    from: &quot;1.0.0&quot;)                                                │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  方式 3：远程 URL（.zip 内含 Framework）                           │</span></span>
<span class="line"><span>│  • .package(url: &quot;https://cdn.example.com/framework.zip&quot;,       │</span></span>
<span class="line"><span>│    from: &quot;1.0.0&quot;)                                                │</span></span>
<span class="line"><span>│  • 适用于私有 CDN                                                 │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_3-6-spm-vs-cocoapods-vs-carthage-深度对比" tabindex="-1">3.6 SPM vs CocoaPods vs Carthage 深度对比 <a class="header-anchor" href="#_3-6-spm-vs-cocoapods-vs-carthage-深度对比" aria-label="Permalink to &quot;3.6 SPM vs CocoaPods vs Carthage 深度对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>依赖管理工具完整对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────┬───────────────────┬─────────────────────┬────────────────────┐</span></span>
<span class="line"><span>│ 特性                            │ SPM               │ CocoaPods           │ Carthage           │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 开发语言                        │ Swift 原生        │ Ruby 生态          │ Swift 原生         │</span></span>
<span class="line"><span>│ 官方支持                        │ ✅ Apple 官方    │ ❌ 第三方（CocoaPods│ ❌ 第三方          │</span></span>
<span class="line"><span>│                                │                   │ Foundation）         │                    │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 集成方式                        │ Xcode 原生集成    │ 生成 .xcworkspace    │ 手动拖入 Framework │</span></span>
<span class="line"><span>│                                │                    │                     │                    │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 依赖解析                        │ 自动（语义化版本）  │ CocoaPods 依赖图     │ Git 子模块         │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 产物格式                        │ 编译时构建（静态   │ .framework/.a       │ .framework（仅    │</span></span>
<span class="line"><span>│                                │ 或动态）           │ 混合                │ 动态）             │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 二进制包支持                    │ ✅ .xcframework   │ ✅ .xcframework     │ ✅ .framework     │</span></span>
<span class="line"><span>│                                │                    │                     │                    │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 静态库支持                      │ ✅               │ ✅                  │ ❌（仅动态）       │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 资源文件支持                    │ ✅ .process/.copy │ ✅ (via podspec)    │ ✅               │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 头文件公开                      │ ✅（通过 public   │ ✅（via podspec     │ ✅               │</span></span>
<span class="line"><span>│                                │ header files）    │ public_headers）    │                    │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 生态规模                        │ 🟡 快速增长中     │ 🔴 最大（~20万+）  │ 🟡 中等            │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 学习曲线                        │ ⭐（简单）        │ ⭐⭐（中等）        │ ⭐⭐（中等）       │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ CI/CD 集成                      │ Xcode 原生        │ CocoaPods CI 脚本    │ Carthage CI 脚本   │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 跨平台                        │ ✅ (iOS/macOS/   │ ❌ (iOS/macOS only) │ ✅               │</span></span>
<span class="line"><span>│                                │ watchOS/tvOS)    │                     │                    │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 模块间依赖（非外部）             │ ✅ 本地包          │ ✅ (via path)       │ ❌                │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 不修改项目文件                  │ ❌（集成到项目）   │ ✅（只修改 Workspace）│ ✅               │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ Swift 编译器优化               │ ✅（Whole Module）│ ⚠️ 有限支持          │ ⚠️ 有限支持       │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 包管理命令                      │ swift package      │ pod install/update  │ carthage bootstrap │</span></span>
<span class="line"><span>│                                │ update             │                     │ update/build       │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 锁定文件                        │ Package.resolved  │ Podfile.lock        │ Cartfile.resolved  │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 多配置支持                      │ .swift + .when()  │ post_install        │ 无                  │</span></span>
<span class="line"><span>├────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 推荐场景                        │ 新项目、Swift 优先  │ 大型项目、混合语言    │ 只想依赖、不想管理  │</span></span>
<span class="line"><span>└─────────────────────────────────┴─────────────────────┴─────────────────────┴────────────────────┘</span></span></code></pre></div><hr><h2 id="_4-cocoapods-深度解析" tabindex="-1">4. CocoaPods 深度解析 <a class="header-anchor" href="#_4-cocoapods-深度解析" aria-label="Permalink to &quot;4. CocoaPods 深度解析&quot;">​</a></h2><h3 id="_4-1-cocoapods-架构原理" tabindex="-1">4.1 CocoaPods 架构原理 <a class="header-anchor" href="#_4-1-cocoapods-架构原理" aria-label="Permalink to &quot;4.1 CocoaPods 架构原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CocoaPods 架构完整体系：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  CocoaPods 核心组件：                                                  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  ┌───────────────────┐  ┌──────────────┐  ┌─────────────────────┐  │</span></span>
<span class="line"><span>│  │  CocoaPods (CLI)  │  │  Spec Repo   │  │  Pod (依赖包)       │  │</span></span>
<span class="line"><span>│  │  (命令行工具)      │  │  (源仓库)     │  │  (.podspec)         │  │</span></span>
<span class="line"><span>│  ├───────────────────┤  ├──────────────┤  ├─────────────────────┤  │</span></span>
<span class="line"><span>│  │  • pod install    │  │  • trunk.cocoapods │ │  • 源代码          │  │</span></span>
<span class="line"><span>│  │  • pod update     │  │    .org        │  │  • 头文件          │  │</span></span>
<span class="line"><span>│  │  • pod search     │  │  • GitHub/   │  │  • 资源文件         │  │</span></span>
<span class="line"><span>│  │  • pod lib create │  │    私有源     │  │  • 依赖声明         │  │</span></span>
<span class="line"><span>│  │  • pod repo       │  │              │  │  • 构建配置         │  │</span></span>
<span class="line"><span>│  └───────────────────┘  └──────────────┘  └─────────────────────┘  │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_4-2-podfile-完整语法" tabindex="-1">4.2 Podfile 完整语法 <a class="header-anchor" href="#_4-2-podfile-完整语法" aria-label="Permalink to &quot;4.2 Podfile 完整语法&quot;">​</a></h3><div class="language-ruby vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ruby</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 基础配置 =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">platform </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:ios</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;15.0&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    # 最低部署版本</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">use_frameworks! </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:linkage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:static</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 所有依赖用静态链接</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># use_frameworks! :linkage =&gt; :dynamic    # 所有依赖用动态链接</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># podfile 不指定 use_frameworks! 时默认 .a（静态）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 仓库配置 =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">source </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://github.com/CocoaPods/Specs.git&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 官方源</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">source </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://github.com/xxx/private-specs.git&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 私有源（先加，优先级高）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 主 Target =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">target </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;MyApp&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 网络层</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Alamofire&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;~&gt; 5.8&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # 语义化版本：&gt;=5.8.0 &lt;6.0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Kingfisher&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;~&gt; 7.0&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SnapKit&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;~&gt; 5.0&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 网络层（精确版本）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SDWebImage&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;= 5.15.8&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 网络层（范围版本）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SwiftyJSON&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&gt; 5.0&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 本地 pod</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;LocalModule&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;../LocalModule&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Git pod</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;MyFramework&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:git</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://github.com/xxx/MyFramework.git&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:branch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;develop&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 子 Target（测试）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  target </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;MyAppTests&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    inherit! </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:search_paths</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                 # 只继承搜索路径</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Quick&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Nimble&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  target </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;MyAppUITests&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    inherit! </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:complete</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                     # 完全继承</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;XCUITestHelpers&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 多 Target 配置 =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">target </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;CoreLib&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Alamofire&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">target </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Network&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Kingfisher&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  pod </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;CoreLib&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;../CoreLib&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== Post-install 处理 =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">post_install </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">do</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> |installer|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  installer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pods_project</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">targets</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">each</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> |target|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    target.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build_configurations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">each</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> |config|</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 统一 Swift 版本</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      config.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build_settings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SWIFT_VERSION&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;5.9&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 禁用 Bitcode</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      config.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build_settings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ENABLE_BITCODE&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;NO&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 处理架构兼容性问题</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> target.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;SomeProblematicPod&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        config.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build_settings</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;IPHONEOS_DEPLOYMENT_TARGET&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;12.0&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      end</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    end</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 依赖预下载/预编译（提升构建速度）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pre_install </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">do</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> |installer|</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 在依赖安装前执行（可用于修改依赖源码）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span></code></pre></div><h3 id="_4-3-podspec-文件详解" tabindex="-1">4.3 Podspec 文件详解 <a class="header-anchor" href="#_4-3-podspec-文件详解" aria-label="Permalink to &quot;4.3 Podspec 文件详解&quot;">​</a></h3><div class="language-ruby vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ruby</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># MyFramework.podspec 完整结构</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Pod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">::</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Spec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> |s|</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 基本信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">             =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;MyFramework&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">version</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">          =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;1.2.0&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">summary</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">          =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;A powerful framework for iOS development&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &lt;&lt;-DESC</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    MyFramework is a comprehensive iOS framework</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    providing networking, caching, and UI utilities.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  DESC</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">homepage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">         =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;https://github.com/xxx/MyFramework&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">license</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">          =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;MIT&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:file</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;LICENSE&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">author</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">           =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Developer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dev@example.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">           =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:git</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://github.com/xxx/MyFramework.git&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:tag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">version</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">to_s</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 平台</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ios</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">deployment_target</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;15.0&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">osx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">deployment_target</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;13.0&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 语言</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">swift_version</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;5.9&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 源文件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">source_files</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;MyFramework/Sources/**/*&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 公开头文件（Objective-C）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # s.public_header_files = &#39;MyFramework/Headers/*.h&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 资源</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resource_bundles</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;MyFramework&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;MyFramework/Resources/**/*&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 依赖</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependency</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Alamofire&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;~&gt; 5.8&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 静态库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">static_framework</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 构建配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod_target_xcconfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;SWIFT_VERSION&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;5.9&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;EXCLUDED_ARCHS[sdk=iphonesimulator*]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;i386&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 用户头文件搜索路径</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  s.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">user_target_xcconfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;FRAMEWORK_SEARCH_PATHS&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&quot;\${PODS_ROOT}/MyFramework&quot;&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span></code></pre></div><h3 id="_4-4-cocoapods-核心命令" tabindex="-1">4.4 CocoaPods 核心命令 <a class="header-anchor" href="#_4-4-cocoapods-核心命令" aria-label="Permalink to &quot;4.4 CocoaPods 核心命令&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 仓库管理</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> repo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ur</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">l</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # 添加仓库</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> repo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> remove</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              # 删除仓库</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> repo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                     # 更新仓库索引</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> repo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                       # 列出仓库</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> trunk</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                      # 推送私有 spec 到 trunk</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> trunk</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> register</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">emai</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">l</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # 注册 trunk 账号</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 依赖管理</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                         # 安装依赖（按 Podfile.lock）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --repo-update</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # 先更新仓库再安装（推荐 CI 使用）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                          # 更新依赖到最新版本</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">pod_nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              # 只更新指定 pod</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --no-repo-update</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 不更新仓库</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 搜索</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> search</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keywor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # 搜索 pod（需先 pod repo update）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> search</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --json</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keywor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # JSON 格式输出</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 项目生成</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> lib</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">               # 创建 pod 模板</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> spec</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> lint</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">podspe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">c</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             # 验证 podspec</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 清理</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deintegrate</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                     # 移除 CocoaPods</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cache</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clean</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">pod_nam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --all</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 清理缓存</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cache</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                      # 列出缓存</span></span></code></pre></div><h3 id="_4-5-cocoapods-vs-spm-选型决策树" tabindex="-1">4.5 CocoaPods vs SPM 选型决策树 <a class="header-anchor" href="#_4-5-cocoapods-vs-spm-选型决策树" aria-label="Permalink to &quot;4.5 CocoaPods vs SPM 选型决策树&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>依赖管理工具选型决策树：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>你的项目是否使用 Swift 为主？</span></span>
<span class="line"><span>├── 是 → SPM 优先（官方支持、Xcode 原生集成、构建更快）</span></span>
<span class="line"><span>│         ├── 需要静态/动态库混用？ → SPM 5.6+ 支持 type: .static/.dynamic</span></span>
<span class="line"><span>│         ├── 需要 Objective-C 混合？ → SPM 也能桥接</span></span>
<span class="line"><span>│         └── 依赖库只有 CocoaPods？ → 混用（SPM 作为 CocoaPods 依赖）</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>└── 否（或需要 ObjC 生态） → CocoaPods</span></span>
<span class="line"><span>    ├── 需要大量 ObjC 库？ → CocoaPods</span></span>
<span class="line"><span>    ├── 需要私有 spec 仓库？ → CocoaPods</span></span>
<span class="line"><span>    └── 团队熟悉 Ruby 生态？ → CocoaPods</span></span></code></pre></div><hr><h2 id="_5-carthage-详解" tabindex="-1">5. Carthage 详解 <a class="header-anchor" href="#_5-carthage-详解" aria-label="Permalink to &quot;5. Carthage 详解&quot;">​</a></h2><h3 id="_5-1-carthage-架构原理" tabindex="-1">5.1 Carthage 架构原理 <a class="header-anchor" href="#_5-1-carthage-架构原理" aria-label="Permalink to &quot;5.1 Carthage 架构原理&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Carthage 工作流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  Carthage 流程：                                                   │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│  1. 读取 Cartfile / Cartfile.resolved                              │</span></span>
<span class="line"><span>│     │                                                              │</span></span>
<span class="line"><span>│     ▼                                                              │</span></span>
<span class="line"><span>│  2. 执行 git clone/fetch 到 Carthage/Checkouts/                    │</span></span>
<span class="line"><span>│     │                                                              │</span></span>
<span class="line"><span>│     ▼                                                              │</span></span>
<span class="line"><span>│  3. 对每个依赖执行 xcodebuild archive                              │</span></span>
<span class="line"><span>│     │                                                              │</span></span>
<span class="line"><span>│     ▼                                                              │</span></span>
<span class="line"><span>│  4. 生成 Carthage/Build/ 目录下的 .framework 文件                   │</span></span>
<span class="line"><span>│     │                                                              │</span></span>
<span class="line"><span>│     ▼                                                              │</span></span>
<span class="line"><span>│  5. 手动将 .framework 拖入 Xcode 项目                              │</span></span>
<span class="line"><span>│     │                                                              │</span></span>
<span class="line"><span>│     ▼                                                              │</span></span>
<span class="line"><span>│  6. 添加 &quot;Run Script Phase&quot;（Copy Frameworks）                      │</span></span>
<span class="line"><span>│     │                                                              │</span></span>
<span class="line"><span>│     ▼                                                              │</span></span>
<span class="line"><span>│  7. 添加 &quot;Embed Binary&quot; 构建阶段                                    │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_5-2-cartfile-语法" tabindex="-1">5.2 Cartfile 语法 <a class="header-anchor" href="#_5-2-cartfile-语法" aria-label="Permalink to &quot;5.2 Cartfile 语法&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># Cartfile - 依赖声明文件</span></span>
<span class="line"><span>github &quot;Alamofire/Alamofire&quot; ~&gt; 5.8    # 语义化版本</span></span>
<span class="line"><span>github &quot;SnapKit/SnapKit&quot; == 5.0.0      # 精确版本</span></span>
<span class="line"><span>github &quot;ReactorKit/ReactorKit&quot; &lt; 4.0   # 小于指定版本</span></span>
<span class="line"><span>github &quot;ReactorKit/ReactorKit&quot; &gt; 3.0   # 大于指定版本</span></span>
<span class="line"><span>github &quot;ReactorKit/ReactorKit&quot; &gt;= 3.0  # 大于等于</span></span>
<span class="line"><span>github &quot;ReactorKit/ReactorKit&quot; &lt;= 3.0  # 小于等于</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Cartfile.private - 私有依赖（提交 .gitignore）</span></span>
<span class="line"><span>git &quot;https://github.com/xxx/private-pod.git&quot; &quot;main&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Carthage/Bootstrap vs Carthage/Update 区别：</span></span>
<span class="line"><span># bootstrap: 只安装非依赖的顶层依赖</span></span>
<span class="line"><span># update: 安装所有依赖（包括依赖的依赖）</span></span></code></pre></div><h3 id="_5-3-carthage-与-cocoapods-spm-对比" tabindex="-1">5.3 Carthage 与 CocoaPods/SPM 对比 <a class="header-anchor" href="#_5-3-carthage-与-cocoapods-spm-对比" aria-label="Permalink to &quot;5.3 Carthage 与 CocoaPods/SPM 对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Carthage 与其他工具的对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────┬───────────────────┬─────────────────────┬────────────────────┐</span></span>
<span class="line"><span>│ 特性                   │ SPM              │ CocoaPods           │ Carthage           │</span></span>
<span class="line"><span>├───────────────────────┼───────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 不修改 Xcode 项目     │ ❌               │ ✅                  │ ✅                 │</span></span>
<span class="line"><span>│ 构建产物类型           │ 编译时构建        │ .framework/.a       │ .framework (仅动态)│</span></span>
<span class="line"><span>│ 静态库支持             │ ✅               │ ✅                  │ ❌                 │</span></span>
<span class="line"><span>│ 侵入性                 │ 中等             │ 高                  │ 低                 │</span></span>
<span class="line"><span>│ 依赖管理自动化         │ 高（Xcode 集成）  │ 高（xcworkspace）   │ 低（手动拖入）     │</span></span>
<span class="line"><span>│ 适合场景               │ 新项目/Swift 优先 │ 大型/混合语言        │ 只需依赖、轻量集成  │</span></span>
<span class="line"><span>└────────────────────────┴───────────────────┴─────────────────────┴────────────────────┘</span></span></code></pre></div><hr><h2 id="_6-xcframework-完整分析" tabindex="-1">6. XCFramework 完整分析 <a class="header-anchor" href="#_6-xcframework-完整分析" aria-label="Permalink to &quot;6. XCFramework 完整分析&quot;">​</a></h2><h3 id="_6-1-xcframework-架构" tabindex="-1">6.1 XCFramework 架构 <a class="header-anchor" href="#_6-1-xcframework-架构" aria-label="Permalink to &quot;6.1 XCFramework 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>XCFramework 结构（与传统 .framework 对比）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>传统 .framework：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  MyFramework.framework/                              │</span></span>
<span class="line"><span>│  ├── MyFramework              ← 单一架构二进制文件    │</span></span>
<span class="line"><span>│  ├── Headers/               ← 公开头文件              │</span></span>
<span class="line"><span>│  ├── Modules/               ← module.modulemap       │</span></span>
<span class="line"><span>│  └── Resources/             ← 资源文件               │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ⚠️ 只能包含一个架构的 slice                          │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>XCFramework：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  MyFramework.xcframework/                            │</span></span>
<span class="line"><span>│  ├── Info.plist          ← 架构清单                    │</span></span>
<span class="line"><span>│  ├── iOS/                                               │</span></span>
<span class="line"><span>│  │   ├── MyFramework.framework/                        │</span></span>
<span class="line"><span>│  │   │   ├── MyFramework   ← arm64 slice             │</span></span>
<span class="line"><span>│  │   │   ├── Headers/                                   │</span></span>
<span class="line"><span>│  │   │   ├── Modules/                                   │</span></span>
<span class="line"><span>│  │   │   └── Resources/                                 │</span></span>
<span class="line"><span>│  │   └── MyFramework-iOS-Simulator.framework/          │</span></span>
<span class="line"><span>│  │       ├── MyFramework   ← x86_64/arm64 slice       │</span></span>
<span class="line"><span>│  │       ├── Headers/                                   │</span></span>
<span class="line"><span>│  │       └── Modules/                                   │</span></span>
<span class="line"><span>│  ├── iOSMac/                                            │</span></span>
<span class="line"><span>│  │   └── MyFramework.framework/                        │</span></span>
<span class="line"><span>│  │       ├── MyFramework   ← arm64 (mac)              │</span></span>
<span class="line"><span>│  │       └── Headers/                                   │</span></span>
<span class="line"><span>│  └── VideoToolbox.framework/                            │</span></span>
<span class="line"><span>│      ├── Info.plist                                     │</span></span>
<span class="line"><span>│      └── ...                                            │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ✅ 支持多架构（arm64, x86_64, arm64-simulator）       │</span></span>
<span class="line"><span>│  ✅ 支持静态库内嵌（.a）                               │</span></span>
<span class="line"><span>│  ✅ Apple 推荐的二进制分发格式                          │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_6-2-xcframework-创建与分发" tabindex="-1">6.2 XCFramework 创建与分发 <a class="header-anchor" href="#_6-2-xcframework-创建与分发" aria-label="Permalink to &quot;6.2 XCFramework 创建与分发&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 创建 XCFramework =====</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Step 1: 为真机构建 Archive</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> archive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyFramework</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -sdk</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> iphoneos</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -archivePath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyFramework-iOS.xcarchive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  SKIP_INSTALL=NO</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  BUILD_LIBRARY_FOR_DISTRIBUTION=YES</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Step 2: 为模拟器构建 Archive</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> archive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyFramework</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -sdk</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> iphonesimulator</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -archivePath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyFramework-Simulator.xcarchive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  SKIP_INSTALL=NO</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  BUILD_LIBRARY_FOR_DISTRIBUTION=YES</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Step 3: 合并为 XCFramework</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -create-xcframework</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -framework</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyFramework-iOS.xcarchive/Products/Library/Frameworks/MyFramework.framework</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -framework</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyFramework-Simulator.xcarchive/Products/Library/Frameworks/MyFramework.framework</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -output</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyFramework.xcframework</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 验证 XCFramework =====</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -find</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyFramework</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -xcframework</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build/MyFramework.xcframework</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ===== 分发方式 =====</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1. 通过 GitHub Releases（.xcframework 作为 Release Asset）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2. 通过私有 CDN（.xcframework.zip 下载）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 3. 通过 SPM（自动处理）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 4. 手动分发</span></span></code></pre></div><h3 id="_6-3-xcframework-vs-framework-深度对比" tabindex="-1">6.3 XCFramework vs Framework 深度对比 <a class="header-anchor" href="#_6-3-xcframework-vs-framework-深度对比" aria-label="Permalink to &quot;6.3 XCFramework vs Framework 深度对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>XCFramework 与 Framework 完整对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────┬────────────────────┬───────────────────┐</span></span>
<span class="line"><span>│ 特性                               │ Framework           │ XCFramework        │</span></span>
<span class="line"><span>├──────────────────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 多架构支持                        │ ❌ 单一架构         │ ✅ 多架构（fat）   │</span></span>
<span class="line"><span>│ .a 静态库内嵌                     │ ❌                  │ ✅                 │</span></span>
<span class="line"><span>│ 通用二进制（arm64 + x86_64）      │ 需要手动合并         │ 自动支持           │</span></span>
<span class="line"><span>│ Xcode 11+ 推荐                    │ ❌                  │ ✅                 │</span></span>
<span class="line"><span>│ 文件名                            │ .framework          │ .xcframework       │</span></span>
<span class="line"><span>│ Info.plist 架构清单               │ ❌                  │ ✅                 │</span></span>
<span class="line"><span>│ 适用于分发                        │ 不推荐              │ ✅ 推荐            │</span></span>
<span class="line"><span>│ 支持模拟器 + 真机                 │ 需要分别管理         │ 统一管理           │</span></span>
<span class="line"><span>│ XCFramework 内嵌 XCFramework      │ N/A                 │ ✅                 │</span></span>
<span class="line"><span>│ 包体积                            │ 较小（单架构）       │ 较大（多架构）      │</span></span>
<span class="line"><span>└───────────────────────────────────┴─────────────────────┴────────────────────┘</span></span></code></pre></div><hr><h2 id="_7-framework-与动态库深度分析" tabindex="-1">7. Framework 与动态库深度分析 <a class="header-anchor" href="#_7-framework-与动态库深度分析" aria-label="Permalink to &quot;7. Framework 与动态库深度分析&quot;">​</a></h2><h3 id="_7-1-静态库-vs-动态库完整对比" tabindex="-1">7.1 静态库 vs 动态库完整对比 <a class="header-anchor" href="#_7-1-静态库-vs-动态库完整对比" aria-label="Permalink to &quot;7.1 静态库 vs 动态库完整对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>静态库与动态库深度对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────┬────────────────────────┬───────────────┐</span></span>
<span class="line"><span>│ 特性                               │ 静态库（.a）          │ 动态库（.dylib│</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 链接时机                           │ 编译时（Link Time）    │ 运行时（Run   │</span></span>
<span class="line"><span>│                                  │                       │  Time）       │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 代码拷贝                           │ 每个 App 一份副本      │ 共享加载       │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ App 包体积                         │ 较大                  │ 较小           │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 首次启动速度                       │ 快（无需额外加载）      │ 稍慢（dlopen） │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 更新方式                           │ 重新发布 App           │ 动态加载/替换  │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 符号冲突                           │ 编译期解决              │ 运行时可能冲突  │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 热更新支持                         │ ❌                    │ ✅（有限）     │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ Swift 兼容性                       │ ✅                    │ ✅             │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 内存占用                           │ 每个 App 独立          │ 共享（多个 App │</span></span>
<span class="line"><span>│                                  │                       │  共享同一份）   │</span></span>
<span class="line"><span>├──────────────────────────────────┼───────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 适用场景                           │ 大多数情况              │ 插件系统       │</span></span>
<span class="line"><span>└───────────────────────────────────┴───────────────────────┴──────────────┘</span></span></code></pre></div><h3 id="_7-2-framework-内部结构" tabindex="-1">7.2 Framework 内部结构 <a class="header-anchor" href="#_7-2-framework-内部结构" aria-label="Permalink to &quot;7.2 Framework 内部结构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Framework 内部结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MyFramework.framework/</span></span>
<span class="line"><span>├── MyFramework              ← 动态库二进制（ELF 格式）</span></span>
<span class="line"><span>│                             ← 包含：__TEXT（代码）、__DATA（数据）</span></span>
<span class="line"><span>│                             ← 包含 Swift 模块信息</span></span>
<span class="line"><span>├── Headers/                 ← 公开头文件（Objective-C）</span></span>
<span class="line"><span>│   ├── MyFramework.h</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── Modules/                 ← Swift Module</span></span>
<span class="line"><span>│   └── module.modulemap     ← 模块描述文件</span></span>
<span class="line"><span>└── Resources/               ← 资源文件</span></span>
<span class="line"><span>    ├── config.json</span></span>
<span class="line"><span>    └── ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>module.modulemap 内容：</span></span>
<span class="line"><span>framework module MyFramework {</span></span>
<span class="line"><span>  umbrella header &quot;MyFramework.h&quot;</span></span>
<span class="line"><span>  export *</span></span>
<span class="line"><span>  module * { export * }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_7-3-动态库加载机制" tabindex="-1">7.3 动态库加载机制 <a class="header-anchor" href="#_7-3-动态库加载机制" aria-label="Permalink to &quot;7.3 动态库加载机制&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 动态库加载流程（dlopen/dlsym）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  1. 加载器（dyld）解析路径                                          │</span></span>
<span class="line"><span>│     • @executable_path → App 的 Contents/Frameworks/               │</span></span>
<span class="line"><span>│     • @loader_path → Framework 的目录                               │</span></span>
<span class="line"><span>│     • @rpath → 运行时搜索路径（构建时设置）                          │</span></span>
<span class="line"><span>│     • 系统路径 → /usr/lib/, /System/Library/                      │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  2. 加载依赖链                                                      │</span></span>
<span class="line"><span>│     • 递归加载所有依赖的动态库                                      │</span></span>
<span class="line"><span>│     • 使用引用计数（dlopen/dlsysref/dlclose）                       │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  3. 符号解析                                                        │</span></span>
<span class="line"><span>│     • 解析所有未定义符号                                             │</span></span>
<span class="line"><span>│     • 冲突符号以首次加载为准                                        │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  4. 初始化                                                          │</span></span>
<span class="line"><span>│     • 调用全局构造器                                                │</span></span>
<span class="line"><span>│     • Swift 模块初始化                                              │</span></span>
<span class="line"><span>│     • @objc 类注册                                                  │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>rpath 搜索路径链：</span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  构建时设置：                                                   │</span></span>
<span class="line"><span>│  • @executable_path/Frameworks  → App 的 Frameworks 目录      │</span></span>
<span class="line"><span>│  • @loader_path                 → 当前 Framework 的目录        │</span></span>
<span class="line"><span>│  • 硬编码路径（不推荐）                                         │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  运行时 dyld 搜索顺序：                                        │</span></span>
<span class="line"><span>│  1. 硬编码路径（LC_ID_DYLIB 中的 path）                        │</span></span>
<span class="line"><span>│  2. @rpath 路径                                                │</span></span>
<span class="line"><span>│  3. @loader_path 路径                                          │</span></span>
<span class="line"><span>│  4. 环境变量 DYLD_FALLBACK_LIBRARY_PATH                      │</span></span>
<span class="line"><span>│  5. /usr/lib/                                                  │</span></span>
<span class="line"><span>│  6. /System/Library/                                           │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><hr><h2 id="_8-模块化架构设计" tabindex="-1">8. 模块化架构设计 <a class="header-anchor" href="#_8-模块化架构设计" aria-label="Permalink to &quot;8. 模块化架构设计&quot;">​</a></h2><h3 id="_8-1-模块化分层架构" tabindex="-1">8.1 模块化分层架构 <a class="header-anchor" href="#_8-1-模块化分层架构" aria-label="Permalink to &quot;8.1 模块化分层架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 模块化分层架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│ Layer 5: Presentation Layer (UI)                                  │</span></span>
<span class="line"><span>│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │</span></span>
<span class="line"><span>│ │ Home │ │Login │ │User │ │Profile│ │Chat │ ...                  │</span></span>
<span class="line"><span>│ │ VC   │ │ VC   │ │ VC  │ │ VC   │ │ VC  │                       │</span></span>
<span class="line"><span>│ └──┬───┘ └──┬───┘ └──┬──┘ └──┬───┘ └──┬──┘                      │</span></span>
<span class="line"><span>├───┴──────────┴────────┴──────┴────────┴───────────────────────────┤</span></span>
<span class="line"><span>│ Layer 4: Domain Layer (业务逻辑)                                   │</span></span>
<span class="line"><span>│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                              │</span></span>
<span class="line"><span>│ │User │ │Chat │ │Auth │ │Feed  │ ...                             │</span></span>
<span class="line"><span>│ │UseCase│ │UseCase│ │UseCase│ │UseCase│                            │</span></span>
<span class="line"><span>│ └──┬───┘ └──┬───┘ └──┬──┘ └──┬───┘                              │</span></span>
<span class="line"><span>├───┴──────────┴────────┴──────┴───────────────────────────────────┤</span></span>
<span class="line"><span>│ Layer 3: Data Layer (数据层)                                       │</span></span>
<span class="line"><span>│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                              │</span></span>
<span class="line"><span>│ │Repo │ │Cache │ │Network│ │Local │ ...                           │</span></span>
<span class="line"><span>│ │(接口)│ │       │ │(实现)│ │DB   │                               │</span></span>
<span class="line"><span>│ └──────┘ └──────┘ └──────┘ └──────┘                              │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│ Layer 2: Infrastructure Layer (基础设施)                            │</span></span>
<span class="line"><span>│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                              │</span></span>
<span class="line"><span>│ │Config│ │Utils│ │Crypto│ │Logger│ ...                            │</span></span>
<span class="line"><span>│ └──────┘ └──────┘ └──────┘ └──────┘                              │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│ Layer 1: Core (核心无依赖层)                                        │</span></span>
<span class="line"><span>│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                              │</span></span>
<span class="line"><span>│ │Models│ │Enums│ │Protocols│ │Types │ ...                          │</span></span>
<span class="line"><span>│ └──────┘ └──────┘ └──────┘ └──────┘                              │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_8-2-依赖关系规则" tabindex="-1">8.2 依赖关系规则 <a class="header-anchor" href="#_8-2-依赖关系规则" aria-label="Permalink to &quot;8.2 依赖关系规则&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>模块化依赖规则（Clean Architecture 原则）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>依赖方向（只能单向）：</span></span>
<span class="line"><span>UI ──→ Domain ──→ Data ──→ Infrastructure</span></span>
<span class="line"><span>                    ↑</span></span>
<span class="line"><span>              Core（所有模块可依赖 Core）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>规则：</span></span>
<span class="line"><span>1. 核心层无外部依赖（Core → Core only）</span></span>
<span class="line"><span>2. 数据层依赖核心层（Data → Core）</span></span>
<span class="line"><span>3. 领域层依赖核心层和协议（Domain → Core + Data.Interface）</span></span>
<span class="line"><span>4. UI 层依赖领域层和协议（UI → Domain + Domain.Interface）</span></span>
<span class="line"><span>5. 禁止循环依赖</span></span>
<span class="line"><span>6. 模块间通过 Protocol 交互（依赖倒置原则）</span></span></code></pre></div><h3 id="_8-3-多-target-模块化实战" tabindex="-1">8.3 多 Target 模块化实战 <a class="header-anchor" href="#_8-3-多-target-模块化实战" aria-label="Permalink to &quot;8.3 多 Target 模块化实战&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>多 Target 架构实战示例：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MyProject.xcodeproj</span></span>
<span class="line"><span>├── MyApp (主应用)</span></span>
<span class="line"><span>│   ├── Target Type: Application</span></span>
<span class="line"><span>│   ├── Dependencies: Core, Network, UI, FeatureHome</span></span>
<span class="line"><span>│   ├── Bundle ID: com.company.myapp</span></span>
<span class="line"><span>│   └── Product: MyApp.app</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── Core (核心层)</span></span>
<span class="line"><span>│   ├── Target Type: Framework</span></span>
<span class="line"><span>│   ├── Dependencies: (无)</span></span>
<span class="line"><span>│   ├── Bundle ID: com.company.myapp.core</span></span>
<span class="line"><span>│   └── Product: Core.framework</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── Network (网络层)</span></span>
<span class="line"><span>│   ├── Target Type: Framework</span></span>
<span class="line"><span>│   ├── Dependencies: Core</span></span>
<span class="line"><span>│   ├── Bundle ID: com.company.myapp.network</span></span>
<span class="line"><span>│   └── Product: Network.framework</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── UI (UI 组件)</span></span>
<span class="line"><span>│   ├── Target Type: Framework</span></span>
<span class="line"><span>│   ├── Dependencies: Core</span></span>
<span class="line"><span>│   ├── Bundle ID: com.company.myapp.ui</span></span>
<span class="line"><span>│   └── Product: UI.framework</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── FeatureHome (主页功能)</span></span>
<span class="line"><span>│   ├── Target Type: Framework</span></span>
<span class="line"><span>│   ├── Dependencies: Core, Network, UI</span></span>
<span class="line"><span>│   ├── Bundle ID: com.company.myapp.feature.home</span></span>
<span class="line"><span>│   └── Product: FeatureHome.framework</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── FeatureChat (聊天功能)</span></span>
<span class="line"><span>│   ├── Target Type: Framework</span></span>
<span class="line"><span>│   ├── Dependencies: Core, Network, UI</span></span>
<span class="line"><span>│   ├── Bundle ID: com.company.myapp.feature.chat</span></span>
<span class="line"><span>│   └── Product: FeatureChat.framework</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>└── MyAppTests (测试)</span></span>
<span class="line"><span>    ├── Target Type: Test Bundle</span></span>
<span class="line"><span>    ├── Dependencies: Core, Network, UI</span></span>
<span class="line"><span>    └── Product: MyAppTests.xctest</span></span></code></pre></div><hr><h2 id="_9-代码规范与静态分析" tabindex="-1">9. 代码规范与静态分析 <a class="header-anchor" href="#_9-代码规范与静态分析" aria-label="Permalink to &quot;9. 代码规范与静态分析&quot;">​</a></h2><h3 id="_9-1-swiftlint-深度配置" tabindex="-1">9.1 SwiftLint 深度配置 <a class="header-anchor" href="#_9-1-swiftlint-深度配置" aria-label="Permalink to &quot;9.1 SwiftLint 深度配置&quot;">​</a></h3><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># .swiftlint.yml - 完整配置</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 排除目录</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">excluded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Pods</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Carthage</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">build</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;**/*.generated.swift&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">vendor</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 默认禁用的规则</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">disabled_rules</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">trailing_whitespace</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nesting</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">todo</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 启用的优化规则（opt-in）</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">opt_in_rules</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">empty_count</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">closure_spacing</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">forbidden_import</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">missing_docs</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">override_in_extension</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">private_action</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">private_outlet</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">redundant_nil_coalescing</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">vertical_parameter_alignment_on_assignment</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 复杂度和长度限制</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">line_length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  warning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">120</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">file_length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  warning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">500</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">type_body_length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  warning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">function_body_length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  warning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">type_name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  min_length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  warning</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">identifier_name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  min_length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  excluded</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">id</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">x</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">y</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">i</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">j</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  allowed_symbols</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;_&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 命名规范</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">force_cast</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">warning</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">force_try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">warning</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">optional_data_boolean_conversion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">error</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 禁止使用</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">forbidden_import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import Foundation</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import UIKit</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">reporter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;xcode&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Xcode 兼容格式</span></span></code></pre></div><h3 id="_9-2-静态分析工具栈" tabindex="-1">9.2 静态分析工具栈 <a class="header-anchor" href="#_9-2-静态分析工具栈" aria-label="Permalink to &quot;9.2 静态分析工具栈&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 静态分析工具完整栈：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────┬───────────────────┬─────────────────────┬────────────────────┐</span></span>
<span class="line"><span>│ 工具                  │ 功能               │ 集成方式              │ 适用场景            │</span></span>
<span class="line"><span>├──────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ SwiftLint            │ 代码风格/规范检查  │ CLI / Xcode Build    │ 日常开发            │</span></span>
<span class="line"><span>│                      │                    │ Phase                │                    │</span></span>
<span class="line"><span>├──────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ SonarQube            │ 代码质量/复杂度分析│ CI 集成              │ 大型项目            │</span></span>
<span class="line"><span>├──────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ Xcode Analyzer       │ 静态分析（Find     │ Analyze (⌥⌘B)      │ 构建前检查          │</span></span>
<span class="line"><span>│                      │  Bugs）           │                     │                    │</span></span>
<span class="line"><span>├──────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ Clang-Tidy           │ Objective-C/     │ CLI                  │ ObjC 代码分析      │</span></span>
<span class="line"><span>│                      │ C++ 分析           │                     │                    │</span></span>
<span class="line"><span>├──────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ Klocwork             │ 高级静态分析       │ CI 集成              │ 企业级              │</span></span>
<span class="line"><span>├──────────────────────┼────────────────────┼─────────────────────┼────────────────────┤</span></span>
<span class="line"><span>│ SwiftFormat          │ 代码自动格式化     │ CLI / Xcode          │ 代码格式化          │</span></span>
<span class="line"><span>└───────────────────────┴────────────────────┴─────────────────────┴────────────────────┘</span></span></code></pre></div><hr><h2 id="_10-git-工作流" tabindex="-1">10. Git 工作流 <a class="header-anchor" href="#_10-git-工作流" aria-label="Permalink to &quot;10. Git 工作流&quot;">​</a></h2><h3 id="_10-1-git-分支策略" tabindex="-1">10.1 Git 分支策略 <a class="header-anchor" href="#_10-1-git-分支策略" aria-label="Permalink to &quot;10.1 Git 分支策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Git Flow 分支管理完整流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>           develop</span></span>
<span class="line"><span>          /        \\</span></span>
<span class="line"><span>         /          \\</span></span>
<span class="line"><span>        /            \\</span></span>
<span class="line"><span>main ──/──────────────\\─────────── hotfix/*</span></span>
<span class="line"><span>     /                  \\</span></span>
<span class="line"><span>    /                    \\</span></span>
<span class="line"><span>feature/*            release/*</span></span>
<span class="line"><span></span></span>
<span class="line"><span>分支类型说明：</span></span>
<span class="line"><span>• main/master:    生产环境代码（受保护）</span></span>
<span class="line"><span>• develop:        开发主分支（集成所有功能）</span></span>
<span class="line"><span>• feature/*:      功能开发（从 develop 创建）</span></span>
<span class="line"><span>• release/*:      发布准备（从 develop 创建）</span></span>
<span class="line"><span>• hotfix/*:       紧急修复（从 main 创建）</span></span></code></pre></div><h3 id="_10-2-git-命令实战" tabindex="-1">10.2 Git 命令实战 <a class="header-anchor" href="#_10-2-git-命令实战" aria-label="Permalink to &quot;10.2 Git 命令实战&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 新功能开发</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> develop</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> origin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> develop</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -b</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> feature/add-payment</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> develop</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ... 开发 ...</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> .</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;feat: add payment module&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> origin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> feature/add-payment</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 创建 Pull Request</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># → GitHub/GitLab 创建 PR</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># → Code Review</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># → 合并到 develop</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 发布</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> develop</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pull</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> origin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> develop</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -b</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release/v1.2.0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> develop</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ... 版本号更新 ...</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;chore: bump version to 1.2.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> origin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release/v1.2.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># → PR → 合并到 main</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> merge</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> release/v1.2.0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;merge release/v1.2.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tag</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> v1.2.0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Release v1.2.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> origin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --tags</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 紧急修复</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> checkout</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -b</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> hotfix/crash-fix</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ... 修复 ...</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;fix: crash on login&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> origin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> hotfix/crash-fix</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># → PR → 合并到 main 和 develop</span></span></code></pre></div><hr><h2 id="_11-ci-cd-全流程" tabindex="-1">11. CI/CD 全流程 <a class="header-anchor" href="#_11-ci-cd-全流程" aria-label="Permalink to &quot;11. CI/CD 全流程&quot;">​</a></h2><h3 id="_11-1-ci-cd-pipeline-架构" tabindex="-1">11.1 CI/CD Pipeline 架构 <a class="header-anchor" href="#_11-1-ci-cd-pipeline-架构" aria-label="Permalink to &quot;11.1 CI/CD Pipeline 架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS CI/CD Pipeline 完整架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐</span></span>
<span class="line"><span>│ 代码   │───→│ Lint  │───→│ Build │───→│ Test  │───→│ Archive│───→│ Deploy│</span></span>
<span class="line"><span>│ 提交   │    │      │    │      │    │      │    │      │    │       │</span></span>
<span class="line"><span>└───────┘    └──────┘    └──────┘    └──────┘    └──────┘    └───────┘</span></span>
<span class="line"><span>                              │              │             │</span></span>
<span class="line"><span>                       ┌─────▼─────┐  ┌────▼────┐  ┌───▼───────┐</span></span>
<span class="line"><span>                       │ TestFlight │  │ App Store│  │ Enterprise│</span></span>
<span class="line"><span>                       │ (内部测试) │  │ (正式)  │  │ (企业)    │</span></span>
<span class="line"><span>                       └────┬──────┘  └────┬─────┘  └────┬──────┘</span></span>
<span class="line"><span>                            │               │              │</span></span>
<span class="line"><span>                     ┌──────▼─────┐  ┌──────▼─────┐  ┌────▼─────┐</span></span>
<span class="line"><span>                     │ Testers   │  │ Users     │  │ Employees│</span></span>
<span class="line"><span>                     └───────────┘  └────────────┘  └──────────┘</span></span></code></pre></div><h3 id="_11-2-github-actions-实战" tabindex="-1">11.2 GitHub Actions 实战 <a class="header-anchor" href="#_11-2-github-actions-实战" aria-label="Permalink to &quot;11.2 GitHub Actions 实战&quot;">​</a></h3><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">iOS CI/CD Pipeline</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    branches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">develop</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  pull_request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    branches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  workflow_dispatch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 手动触发</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">env</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  SCHEME</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">MyApp</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  DESTINATION</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;platform=iOS Simulator,name=iPhone 15,OS=17.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  CODE_SIGNING_ALLOWED</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;NO&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">jobs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  lint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    runs-on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">macos-14</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    steps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">uses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">actions/checkout@v4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Install SwiftLint</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">brew install swiftlint</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Run SwiftLint</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">swiftlint lint --strict --reporter xcode</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Run SwiftFormat</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">swiftformat --lint .</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  build-and-test</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    needs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">lint</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    runs-on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">macos-14</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    strategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      matrix</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        destination</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;platform=iOS Simulator,name=iPhone 15,OS=17.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;platform=iOS Simulator,name=iPhone 15 Pro Max,OS=17.0&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    steps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">uses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">actions/checkout@v4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Select Xcode 15.2</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">sudo xcode-select -switch /Applications/Xcode_15.2.app</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Install Dependencies</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          if [ -f Podfile ]; then</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            pod install --repo-update</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          fi</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          swift package resolve</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Run Tests</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          xcodebuild test \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -scheme \${{ env.SCHEME }} \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -destination &#39;\${{ matrix.destination }}&#39; \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -configuration Debug \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -only-testing:\${{ env.SCHEME }}Tests \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            CODE_SIGNING_ALLOWED=\${{ env.CODE_SIGNING_ALLOWED }} \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            CODE_SIGNING_REQUIRED=NO \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            | xcbeautify</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Upload Test Results</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">always()</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        uses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">actions/upload-artifact@v4</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        with</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">test-results-matrix-\${{ matrix.destination }}</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            ~/Library/Developer/Xcode/DerivedData/**/TestPro</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            ~/Library/Developer/Xcode/DerivedData/**/TestReport.xml</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  archive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    needs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">build-and-test</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    runs-on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">macos-14</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">github.ref == &#39;refs/heads/develop&#39;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    steps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">uses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">actions/checkout@v4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Install Dependencies</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">pod install --repo-update</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Archive</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          xcodebuild archive \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -scheme \${{ env.SCHEME }} \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -configuration Release \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            -archivePath build/\${{ env.SCHEME }}.xcarchive \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            SKIP_INSTALL=NO \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            | xcbeautify</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Upload Archive</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        uses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">actions/upload-artifact@v4</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        with</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">xcarchive</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">build/\${{ env.SCHEME }}.xcarchive</span></span></code></pre></div><h3 id="_11-3-fastlane-自动化实战" tabindex="-1">11.3 Fastlane 自动化实战 <a class="header-anchor" href="#_11-3-fastlane-自动化实战" aria-label="Permalink to &quot;11.3 Fastlane 自动化实战&quot;">​</a></h3><div class="language-ruby vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ruby</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Fastfile - 完整 CI/CD 配置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">default_platform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:ios</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">platform </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:ios</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  desc </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Run full CI pipeline&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lane </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:ci</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 1. Lint</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    swiftlint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      mode:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> :lint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      strict:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 2. Test</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    scan</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      devices:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;iPhone 15&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      code_coverage:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_build:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      html_output:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      output_files:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;test-results.html&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 3. Build</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gym</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      export_method:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;development&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      export_options:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        provisioningProfiles:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.company.myapp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> =&gt; </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MyAppProvisioning&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  desc </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Deploy to TestFlight&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lane </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:beta</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    scan</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">devices:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;iPhone 15&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      type:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;app_store&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      readonly:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      app_identifier:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;com.company.myapp&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gym</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      export_method:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;app-store&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    pilot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      distribution:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;internal&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_waiting_for_build_processing:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  desc </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Deploy to App Store&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lane </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:release</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    increment_version_number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">bump_type:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;patch&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    update_info_plist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      path:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp/Info.plist&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      version_number:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> get_version_number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    match</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">type:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;app_store&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">readonly:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    gym</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      scheme:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MyApp&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      export_method:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;app-store&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_archive:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    deliver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      force:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_metadata:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      skip_screenshots:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      submit_for_review:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      automatic_release:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  end</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">end</span></span></code></pre></div><hr><h2 id="_12-自动发布与交付" tabindex="-1">12. 自动发布与交付 <a class="header-anchor" href="#_12-自动发布与交付" aria-label="Permalink to &quot;12. 自动发布与交付&quot;">​</a></h2><h3 id="_12-1-发布流程" tabindex="-1">12.1 发布流程 <a class="header-anchor" href="#_12-1-发布流程" aria-label="Permalink to &quot;12.1 发布流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>完整发布流程（Fastlane Action 详解）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 发布 Action 完整列表：                                          │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│ ┌──────────┬─────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│ │ Action   │ 用途                                              │ │</span></span>
<span class="line"><span>│ ├──────────┼─────────────────────────────────────────────────┤ │</span></span>
<span class="line"><span>│ │ scan     │ 运行 XCTest（测试）                              │ │</span></span>
<span class="line"><span>│ │ gym      │ 构建归档（Archive → .ipa/.app）                  │ │</span></span>
<span class="line"><span>│ │ match    │ 证书和描述文件管理                                │ │</span></span>
<span class="line"><span>│ │ pilot    │ 上传到 TestFlight                                │ │</span></span>
<span class="line"><span>│ │ deliver  │ App Store 提交（metadata/screenshots/版本信息）   │ │</span></span>
<span class="line"><span>│ │ sigh     │ 创建/更新描述文件                                │ │</span></span>
<span class="line"><span>│ │ cert     │ 创建/更新代码签名证书                            │ │</span></span>
<span class="line"><span>│ │ frame_  │ 生成代码覆盖率报告                                 │ │</span></span>
<span class="line"><span>│ │ snapshot │ UI 自动化截图                                     │ │</span></span>
<span class="line"><span>│ │ screengrab│ 多渠道截图                                        │ │</span></span>
<span class="line"><span>│ │ upload_  │ 上传分析数据（如 Firebase Crashlytics）            │ │</span></span>
<span class="line"><span>│ │ notarize │ Apple Notarization（公证）                        │ │</span></span>
<span class="line"><span>│ │ xcrun    │ 调用 xcrun 相关工具                              │ │</span></span>
<span class="line"><span>│ └──────────┴─────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><h3 id="_12-2-证书与描述文件" tabindex="-1">12.2 证书与描述文件 <a class="header-anchor" href="#_12-2-证书与描述文件" aria-label="Permalink to &quot;12.2 证书与描述文件&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 签名体系完整结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│ Apple Developer Center                                             │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ Apple ID → Apple Developer Program ($99/年)              │ │</span></span>
<span class="line"><span>│  │ ┌───────────────────────────────────────────────────────┐ │ │</span></span>
<span class="line"><span>│  │ │ 证书 (Certificates)                                     │ │ │</span></span>
<span class="line"><span>│  │ │ • Apple Development                                   │ │ │</span></span>
<span class="line"><span>│  │ │ • Apple Distribution                                  │ │ │</span></span>
<span class="line"><span>│  │ │ • Ad Hoc                                              │ │ │</span></span>
<span class="line"><span>│  │ │ • App Store                                           │ │ │</span></span>
<span class="line"><span>│  │ └───────────────────────────────────────────────────────┘ │ │</span></span>
<span class="line"><span>│  │ ┌───────────────────────────────────────────────────────┐ │ │</span></span>
<span class="line"><span>│  │ │ 标识符 (Identifiers)                                    │ │ │</span></span>
<span class="line"><span>│  │ │ • App ID (com.company.app)                            │ │ │</span></span>
<span class="line"><span>│  │ │ • Service Name (Push Notifications)                   │ │ │</span></span>
<span class="line"><span>│  │ │ • App Group                                             │ │ │</span></span>
<span class="line"><span>│  │ └───────────────────────────────────────────────────────┘ │ │</span></span>
<span class="line"><span>│  │ ┌───────────────────────────────────────────────────────┐ │ │</span></span>
<span class="line"><span>│  │ │ 描述文件 (Profiles)                                      │ │ │</span></span>
<span class="line"><span>│  │ │ • Development                                          │ │ │</span></span>
<span class="line"><span>│  │ │ • Ad Hoc                                               │ │ │</span></span>
<span class="line"><span>│  │ │ • App Store                                            │ │ │</span></span>
<span class="line"><span>│  │ │ • Enterprise                                            │ │ │</span></span>
<span class="line"><span>│  │ └───────────────────────────────────────────────────────┘ │ │</span></span>
<span class="line"><span>│  │ ┌───────────────────────────────────────────────────────┐ │ │</span></span>
<span class="line"><span>│  │ │ 设备 (Devices)                                          │ │ │</span></span>
<span class="line"><span>│  │ │ • 最多 100 台设备 (Development/Ad Hoc)               │ │ │</span></span>
<span class="line"><span>│  │ └───────────────────────────────────────────────────────┘ │ │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘ │</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span></code></pre></div><hr><h2 id="_13-版本管理策略" tabindex="-1">13. 版本管理策略 <a class="header-anchor" href="#_13-版本管理策略" aria-label="Permalink to &quot;13. 版本管理策略&quot;">​</a></h2><h3 id="_13-1-语义化版本-semver" tabindex="-1">13.1 语义化版本 (SemVer) <a class="header-anchor" href="#_13-1-语义化版本-semver" aria-label="Permalink to &quot;13.1 语义化版本 (SemVer)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>版本号格式：MAJOR.MINOR.PATCH</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1.2.3</span></span>
<span class="line"><span>├── MAJOR (主版本号): 不兼容的 API 变更</span></span>
<span class="line"><span>├── MINOR (次版本号): 向后兼容的功能新增</span></span>
<span class="line"><span>└── PATCH (修订号): 向后兼容的问题修复</span></span>
<span class="line"><span></span></span>
<span class="line"><span>版本升级规则：</span></span>
<span class="line"><span>• 修复 Bug → PATCH 增加 (1.2.3 → 1.2.4)</span></span>
<span class="line"><span>• 新增功能 → MINOR 增加 (1.2.0 → 1.3.0)</span></span>
<span class="line"><span>• 破坏性变更 → MAJOR 增加 (1.0.0 → 2.0.0)</span></span></code></pre></div><h3 id="_13-2-版本号管理位置" tabindex="-1">13.2 版本号管理位置 <a class="header-anchor" href="#_13-2-版本号管理位置" aria-label="Permalink to &quot;13.2 版本号管理位置&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 项目版本号管理位置：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────┬───────────────────────────────┐</span></span>
<span class="line"><span>│ 位置                              │ 说明                         │</span></span>
<span class="line"><span>├──────────────────────────────────┼──────────────────────────────┤</span></span>
<span class="line"><span>│ Info.plist → CFBundleShortVersion│ 对外版本号（SemVer）         │</span></span>
<span class="line"><span>│ Info.plist → CFBundleVersion     │ 内部构建号（每次递增）        │</span></span>
<span class="line"><span>│ Package.swift → version          │ SPM 包版本号                 │</span></span>
<span class="line"><span>│ Podspec → version                │ CocoaPods 版本号             │</span></span>
<span class="line"><span>│ GitHub Releases                  │ 发布版本号                   │</span></span>
<span class="line"><span>└───────────────────────────────────┴──────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_14-docc-文档系统" tabindex="-1">14. DocC 文档系统 <a class="header-anchor" href="#_14-docc-文档系统" aria-label="Permalink to &quot;14. DocC 文档系统&quot;">​</a></h2><h3 id="_14-1-docc-注释规范" tabindex="-1">14.1 DocC 注释规范 <a class="header-anchor" href="#_14-1-docc-注释规范" aria-label="Permalink to &quot;14.1 DocC 注释规范&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// 用户数据模型</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">///</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// 包含用户的基本信息和操作</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">///</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// - Note: 使用 \`Codable\` 协议进行序列化</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// - Author: Developer</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// - Version: 1.0</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> struct</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> User</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Codable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Identifiable </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 用户唯一标识</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id: UUID</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 用户名（不可为空）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> name: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 邮箱地址</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> email: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 创建时间</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> createdAt: Date</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 初始化用户</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// - Parameters:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ///   - id: 用户 ID</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ///   - name: 用户名（不可为空）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    ///   - email: 邮箱地址</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// - Throws: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// - Note: name 不可为空</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: UUID, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> name</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.email </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> email</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.createdAt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// 网络请求结果</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">///</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// 封装网络请求的成功和失败情况</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> enum</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NetworkResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 成功</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> success</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(T)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /// 失败（包含错误信息）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> failure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(NetworkError)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/// 网络错误类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> enum</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NetworkError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LocalizedError </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> timeout</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unauthorized</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> notFound</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> serverError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(statusCode: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> decodingError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> errorDescription: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        switch</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .timeout</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;请求超时&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .unauthorized</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;未授权&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .notFound</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;资源不存在&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">serverError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> code)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;服务器错误: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\\(code)</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> .decodingError</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;数据解析错误&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_14-2-docc-生成与管理" tabindex="-1">14.2 DocC 生成与管理 <a class="header-anchor" href="#_14-2-docc-生成与管理" aria-label="Permalink to &quot;14.2 DocC 生成与管理&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 生成本地文档</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">xcodebuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docbuild</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -scheme</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -destination</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;platform=iOS Simulator,name=iPhone 15&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 通过 DocC 命令（Xcode 14.2+）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">swift</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> package</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> generate-documentation</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 本地预览</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docc</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> preview</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyFramework.docc</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --output</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ./docs</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Xcode 内建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Product → Build Documentation</span></span></code></pre></div><hr><h2 id="_15-资源模块打包" tabindex="-1">15. 资源模块打包 <a class="header-anchor" href="#_15-资源模块打包" aria-label="Permalink to &quot;15. 资源模块打包&quot;">​</a></h2><h3 id="_15-1-bundle-管理" tabindex="-1">15.1 Bundle 管理 <a class="header-anchor" href="#_15-1-bundle-管理" aria-label="Permalink to &quot;15.1 Bundle 管理&quot;">​</a></h3><div class="language-swift vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">swift</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 获取资源 Bundle 的完整方式</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 1: mainBundle（主 App 资源）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bundle </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Bundle.main</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> image </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> UIImage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">named</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;logo&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: bundle, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">compatibleWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 2: 模块 Bundle（Framework 内资源）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> moduleBundle </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Bundle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: MyClass.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> moduleBundle.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">forResource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;data&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">ofType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;json&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 3: 指定路径 Bundle</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bundle </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Bundle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/path/to/Resources.bundle&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Swift 5.9+: SPM 自动管理</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> bundle </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Bundle.module  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 推荐用于 SPM 包内资源</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Bundle ID 缓存优化</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sharedBundle </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Bundle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ResourceHelper.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h3 id="_15-2-资源打包优化策略" tabindex="-1">15.2 资源打包优化策略 <a class="header-anchor" href="#_15-2-资源打包优化策略" aria-label="Permalink to &quot;15.2 资源打包优化策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>资源优化策略完整对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────┬─────────────────────────────────┐</span></span>
<span class="line"><span>│ 优化手段                           │ 说明                           │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ Asset Catalog (.xcassets)          │ 使用 Xcode 原生资源管理         │</span></span>
<span class="line"><span>│                                  │ 按需生成对应分辨率的图片          │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ 按需加载                           │ 懒加载大资源文件                │</span></span>
<span class="line"><span>│                                  │ 延迟初始化资源                   │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ Bundle ID 缓存                    │ 资源 ID 缓存避免重复查找         │</span></span>
<span class="line"><span>│                                  │ 减少 Bundle 查找开销            │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ 压缩资源                           │ 使用压缩图片/字体               │</span></span>
<span class="line"><span>│                                  │ PNG → HEIF/AVIF               │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ 动态资源包                         │ iOS 14+ 支持动态资源包          │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ 字体子集化                         │ 只打包使用的字符集              │</span></span>
<span class="line"><span>│                                  │ 减少字体文件体积                │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ Lottie 动画                        │ JSON 格式动画（小体积）         │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────────────┤</span></span>
<span class="line"><span>│ 远程资源                           │ 图片/数据从 CDN 加载            │</span></span>
<span class="line"><span>│                                  │ 减少 App 包体积               │</span></span>
<span class="line"><span>└───────────────────────────────────┴────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_16-构建优化深度策略" tabindex="-1">16. 构建优化深度策略 <a class="header-anchor" href="#_16-构建优化深度策略" aria-label="Permalink to &quot;16. 构建优化深度策略&quot;">​</a></h2><h3 id="_16-1-构建加速策略" tabindex="-1">16.1 构建加速策略 <a class="header-anchor" href="#_16-1-构建加速策略" aria-label="Permalink to &quot;16.1 构建加速策略&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>构建优化策略完整对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────┬─────────────────────────┬───────────────┐</span></span>
<span class="line"><span>│ 优化手段                           │ 效果                     │ 方法           │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ Bazel + rules_apple              │ ⭐⭐⭐⭐⭐ (极致优化)  │ Bazel iOS    │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ SPM 预编译/二进制                  │ ⭐⭐⭐⭐                 │ SPM 依赖预编译 │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 并行构建                           │ ⭐⭐⭐⭐                 │ -j + parallel  │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 增量构建                           │ ⭐⭐⭐⭐                 │ 仅重编译变更文件 │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ Whole Module Optimization         │ ⭐⭐⭐                  │ SWIFT_WHOLE   │</span></span>
<span class="line"><span>│                                  │ (Release 减少符号数量)   │ _MODULE_OPTIM  │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 死代码剥离                         │ ⭐⭐⭐                  │ DEAD_CODE_    │</span></span>
<span class="line"><span>│                                  │ (减少最终产物)           │ STRIPPING      │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ LTO (链接时优化)                  │ ⭐⭐⭐                  │ LTO = Default │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ 精简 Pod/依赖                    │ ⭐⭐⭐                  │ 只引入必要 Pod │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ Xcode Cloud 构建缓存             │ ⭐⭐⭐                  │ Xcode Cloud   │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ Thin Binary (Strip)              │ ⭐⭐                     │ 剥离调试符号   │</span></span>
<span class="line"><span>├──────────────────────────────────┼────────────────────────┼──────────────┤</span></span>
<span class="line"><span>│ Clang Modules Optimization       │ ⭐⭐                     │ CLANG_ENABLE_ │</span></span>
<span class="line"><span>│                                  │ (减少模块编译时间)       │ _MODULES = YES │</span></span>
<span class="line"><span>└───────────────────────────────────┴────────────────────────┴──────────────┘</span></span></code></pre></div><hr><h2 id="_17-swift-vs-gradle-跨语言对比" tabindex="-1">17. Swift vs Gradle 跨语言对比 <a class="header-anchor" href="#_17-swift-vs-gradle-跨语言对比" aria-label="Permalink to &quot;17. Swift vs Gradle 跨语言对比&quot;">​</a></h2><h3 id="_17-1-核心概念对比" tabindex="-1">17.1 核心概念对比 <a class="header-anchor" href="#_17-1-核心概念对比" aria-label="Permalink to &quot;17.1 核心概念对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS/Swift vs Android/Kotlin 核心概念对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────────────┬────────────────────────┬──────────────────────┐</span></span>
<span class="line"><span>│ 概念                          │ iOS/Swift              │ Android/Gradle        │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 构建工具                      │ xcodebuild             │ Gradle + AGP          │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 依赖管理                      │ SPM / CocoaPods        │ Gradle Dependencies   │</span></span>
<span class="line"><span>│                               │ Carthage               │ Maven / JitPack      │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 构建配置                      │ Build Settings (.pbx)  │ build.gradle (Kotlin │</span></span>
<span class="line"><span>│                               │                        │  DSL)                │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 多模块管理                    │ Xcode Workspace        │ subprojects /        │</span></span>
<span class="line"><span>│                               │ + Target               │ settings.gradle      │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 资源管理                      │ Asset Catalog + Bundle │ res/ folder + R      │</span></span>
<span class="line"><span>│                               │                        │ class (自动代码生成)   │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 变体 (Variant)                │ Scheme + Configuration │ BuildTypes + Flavors │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 签名/安全                     │ Provisioning Profile   │ Keystore (JKS/KSP)   │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 产物                          │ .xcarchive / .ipa      │ .apk / .aab          │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ CI/CD                         │ Fastlane               │ Gradle + CI plugins  │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 插件系统                      │ Xcode Plugins / SPM    │ Gradle Plugins        │</span></span>
<span class="line"><span>│                               │ Plugins                │                      │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 代码生成                      │ SourceGen              │ KSP (Kotlin Symbol   │</span></span>
<span class="line"><span>│                               │                        │ Processing)           │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 代码质量                      │ SwiftLint              │ detekt / ktlint     │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 模块化                         │ Framework / XCFramwork │ AAR / JAR            │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 协议通信                      │ Protocol Extension      │ Interface + Abstract  │</span></span>
<span class="line"><span>│                               │                        │ Class                │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 依赖注入                      │ 手动 / SwiftDI         │ Hilt / Koin          │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 配置管理                      │ plist / UserDefaults  │ AndroidManifest.xml  │</span></span>
<span class="line"><span>│                               │                        │ + build.gradle config │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ App 签名证书                  │ .p12 + .mobileprovision│ .jks/.ksp (keystore) │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 版本发布平台                  │ App Store Connect      │ Google Play Console  │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 推送通知                      │ APNs (Apple)           │ FCM (Google)         │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 包管理格式                    │ Package.swift          │ build.gradle.kts     │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 构建缓存                      │ DerivedData            │ Gradle Cache         │</span></span>
<span class="line"><span>├───────────────────────────────┼───────────────────────┼──────────────────────┤</span></span>
<span class="line"><span>│ 代码签名                      │ codesign               │ apksigner / jarsigner│</span></span>
<span class="line"><span>└────────────────────────────────┴───────────────────────┴──────────────────────┘</span></span></code></pre></div><h3 id="_17-2-构建系统核心机制对比" tabindex="-1">17.2 构建系统核心机制对比 <a class="header-anchor" href="#_17-2-构建系统核心机制对比" aria-label="Permalink to &quot;17.2 构建系统核心机制对比&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>xcodebuild vs Gradle 核心机制对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────────────────┬───────────────────────────────┐</span></span>
<span class="line"><span>│ 方面                              │ 对比分析                      │</span></span>
<span class="line"><span>├───────────────────────────────────┼───────────────────────────────┤</span></span>
<span class="line"><span>│ 构建配置方式                      │</span></span>
<span class="line"><span>│ iOS: PBX proj + Build Settings    │ 图形界面 + 配置文件            │</span></span>
<span class="line"><span>│ Android: build.gradle.kts         │ DSL 代码配置                  │</span></span>
<span class="line"><span>├───────────────────────────────────┼───────────────────────────────┤</span></span>
<span class="line"><span>│ 依赖管理                          │</span></span>
<span class="line"><span>│ iOS: 外部工具 (SPM/CocoaPods)     │ 内建 (Gradle 内建依赖解析)     │</span></span>
<span class="line"><span>├───────────────────────────────────┼───────────────────────────────┤</span></span>
<span class="line"><span>│ 构建产物                          │</span></span>
<span class="line"><span>│ iOS: .app → .ipa                  │ .apk / .aab                  │</span></span>
<span class="line"><span>│ Android: 内建多渠道/多变体         │ iOS 需手动配置 Schemes        │</span></span>
<span class="line"><span>├───────────────────────────────────┼───────────────────────────────┤</span></span>
<span class="line"><span>│ 资源处理                          │</span></span>
<span class="line"><span>│ iOS: Asset Catalog (编译时)        │ Res folder + R class (编译时)  │</span></span>
<span class="line"><span>├───────────────────────────────────┼───────────────────────────────┤</span></span>
<span class="line"><span>│ 代码签名                          │</span></span>
<span class="line"><span>│ iOS: Provisioning Profile + 证书   │ Keystore + 签名密钥           │</span></span>
<span class="line"><span>├───────────────────────────────────┼───────────────────────────────┤</span></span>
<span class="line"><span>│ 跨平台扩展                        │</span></span>
<span class="line"><span>│ iOS: SwiftUI + iOS SDK             │ Kotlin Multiplatform (KMP)    │</span></span>
<span class="line"><span>│ Android: Android SDK               │                             │</span></span>
<span class="line"><span>└────────────────────────────────────┴───────────────────────────────┘</span></span></code></pre></div><hr><h2 id="_18-面试考点汇总" tabindex="-1">18. 面试考点汇总 <a class="header-anchor" href="#_18-面试考点汇总" aria-label="Permalink to &quot;18. 面试考点汇总&quot;">​</a></h2><h3 id="_18-1-高频面试题与标准答案" tabindex="-1">18.1 高频面试题与标准答案 <a class="header-anchor" href="#_18-1-高频面试题与标准答案" aria-label="Permalink to &quot;18.1 高频面试题与标准答案&quot;">​</a></h3><p><strong>Q1: SPM、CocoaPods、Carthage 有什么区别？如何选择？</strong></p><p><strong>答</strong>：</p><ul><li><strong>SPM</strong>：Apple 官方依赖管理工具，Swift 原生，与 Xcode 深度集成，支持静态/动态库，构建速度最快，推荐新项目使用</li><li><strong>CocoaPods</strong>：Ruby 生态，最大生态（20万+ pod），支持静态/动态混合，生成 .xcworkspace，适合大型混合语言项目</li><li><strong>Carthage</strong>：非侵入式，只构建 .framework 不修改项目，手动拖入 Xcode，适合只想依赖不想被管理的团队</li></ul><p><strong>选型建议</strong>：新项目优先 SPM，需要大量 ObjC 库选 CocoaPods，轻量集成选 Carthage。</p><hr><p><strong>Q2: XCFramework 和传统 .framework 的区别？</strong></p><p><strong>答</strong>：</p><ul><li>XCFramework 支持多架构（arm64 + x86_64 + arm64-simulator），传统 Framework 仅支持单一架构</li><li>XCFramework 支持静态库内嵌（.a），传统不支持</li><li>XCFramework 有 Info.plist 声明架构列表，便于工具解析</li><li>Apple 自 Xcode 11+ 起推荐使用 XCFramework 分发二进制</li><li>传统 Framework 需要手动合并不同架构的 slice</li></ul><hr><p><strong>Q3: Swift 动态库的限制有哪些？</strong></p><p><strong>答</strong>：</p><ul><li>iOS 8+ 支持动态 Framework</li><li>Swift 库必须是动态的（Swift 运行时动态加载）</li><li>App 内嵌动态库最大 200MB（Apple 限制）</li><li>动态库通过 dlopen/dlsym 加载</li><li>@rpath 和 @executable_path 需要正确管理</li><li>App Store 审核对动态库有严格审查</li></ul><hr><p><strong>Q4: 模块化的好处和实现方式？</strong></p><p><strong>答</strong>：</p><ul><li><strong>好处</strong>：解耦、代码复用、并行开发、独立测试、产品多样化</li><li><strong>实现</strong>： <ul><li>Swift Packages（SPM）— 推荐</li><li>Xcode Target + Framework — 灵活</li><li>CocoaPods 多 Target — 混合生态</li><li>通过 Protocol 定义模块间接口（依赖倒置原则）</li><li>Clean Architecture 分层设计</li></ul></li></ul><hr><p><strong>Q5: CI/CD 如何搭建？完整流程是什么？</strong></p><p><strong>答</strong>：</p><ul><li>工具选择：Fastlane + GitHub Actions / Bitrise / Xcode Cloud</li><li>完整流程：Lint → Build → Test → Archive → Code Sign → Deploy</li><li>Fastlane 核心 Action：scan（测试）、gym（构建）、match（证书）、pilot（TestFlight）、deliver（App Store）</li><li>GitHub Actions 集成：macos-latest runner + xcodebuild</li><li>证书管理：match 同步到 Git 仓库</li></ul><hr><p><strong>Q6: xcodebuild 和 xcrun 的区别？</strong></p><p><strong>答</strong>：</p><ul><li><strong>xcodebuild</strong>：完整的构建系统，可以 clean/build/test/archive/export</li><li><strong>xcrun</strong>：调用 Xcode 命令行工具的包装器（如 swiftc、clang、codesign）</li><li>xcodebuild 是构建工具，xcrun 是工具调用器</li></ul><hr><p><strong>Q7: Build Settings 中 SWIFT_OPTIMIZATION_LEVEL 的 -Onone 和 -O 的区别？</strong></p><p><strong>答</strong>：</p><ul><li><code>-Onone</code>（Debug）：无优化，调试友好，变量可查</li><li><code>-O</code>（Release）：快速优化，保留调试符号</li><li><code>-Owholemodule</code>（Release）：跨模块优化，性能最优，构建慢</li></ul><hr><p><strong>Q8: iOS 静态库 vs 动态库如何选择？</strong></p><p><strong>答</strong>：</p><ul><li><strong>静态库</strong>：大多数场景（代码复用、无运行时开销、App Store 合规）</li><li><strong>动态库</strong>：插件系统、代码更新、Swift 库（自动动态）、C 扩展</li><li>Swift 库必须是动态的（Swift 运行时动态加载）</li><li>App 内嵌动态库最大 200MB</li></ul><hr><p><strong>Q9: Git Flow 与 GitHub Flow 的区别？</strong></p><p><strong>答</strong>：</p><ul><li><strong>Git Flow</strong>：main + develop + feature + release + hotfix 五分支模型，适合版本发布</li><li><strong>GitHub Flow</strong>：main + feature 二分支模型，持续部署，适合云端/SaaS 应用</li><li>iOS 项目通常用 Git Flow（App Store 发布节奏固定）</li></ul><hr><p><strong>Q10: DocC 与 Jazzy/Kanna 文档生成的区别？</strong></p><p><strong>答</strong>：</p><ul><li><strong>DocC</strong>：Apple 官方，Xcode 13+ 内建，支持 Swift 原生文档，可本地预览</li><li><strong>Jazzy</strong>：基于 Ruby，生成 HTML，支持 Objective-C/Swift，需要 CocoaDocs</li><li>推荐 DocC（Apple 主推，原生支持）</li></ul><h3 id="_18-2-面试回答模板" tabindex="-1">18.2 面试回答模板 <a class="header-anchor" href="#_18-2-面试回答模板" aria-label="Permalink to &quot;18.2 面试回答模板&quot;">​</a></h3><blockquote><p>&quot;iOS 工程化我使用 SPM 管理依赖，Fastlane 自动化构建测试发布，SwiftLint 保证代码规范，Git Flow 管理版本。模块化通过 SPM Packages 实现，模块间通过 Protocol 交互。构建优化包括 SPM 预编译、死代码剥离、增量构建。CI/CD 使用 GitHub Actions + Fastlane，证书通过 match 管理，发布到 TestFlight 和 App Store。&quot;</p></blockquote><hr><p>C:\\Users\\admin.openclaw\\workspace\\ios-interview-content-restructured\\14_Engineering\\01_Engineering_Deep.md</p><h3 id="_19-xcode-高级特性" tabindex="-1">19. Xcode 高级特性 <a class="header-anchor" href="#_19-xcode-高级特性" aria-label="Permalink to &quot;19. Xcode 高级特性&quot;">​</a></h3><h4 id="_19-1-xcode-cloud" tabindex="-1">19.1 Xcode Cloud <a class="header-anchor" href="#_19-1-xcode-cloud" aria-label="Permalink to &quot;19.1 Xcode Cloud&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode Cloud 架构全景：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Xcode Cloud                              │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────┐│</span></span>
<span class="line"><span>│  │  CI/CD 管道配置 (Xcode Cloud YAML)                       ││</span></span>
<span class="line"><span>│  │  ├─ Build Pipelines (触发器: commit/PR/time)            ││</span></span>
<span class="line"><span>│  │  ├─ Run Pipelines (手动触发)                            ││</span></span>
<span class="line"><span>│  │  └─ Test Plans (测试计划)                               ││</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────┘│</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────┐│</span></span>
<span class="line"><span>│  │  Build 配置                                              ││</span></span>
<span class="line"><span>│  │  • Xcode 版本: 15.x / 14.x                             ││</span></span>
<span class="line"><span>│  │  • 构建触发: Push / PR / Schedule / 手动               ││</span></span>
<span class="line"><span>│  │  • 输出: .ipa / .xctestrun / .xcresult                  ││</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────┘│</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────┐│</span></span>
<span class="line"><span>│  │  Artifact 管理                                           ││</span></span>
<span class="line"><span>│  │  • Build Artifacts: .xcarchive                          ││</span></span>
<span class="line"><span>│  │  • Test Artifacts: .xcresult                            ││</span></span>
<span class="line"><span>│  │  • Logs: 构建日志/测试日志                              ││</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────┘│</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────┐│</span></span>
<span class="line"><span>│  │  分发渠道                                                ││</span></span>
<span class="line"><span>│  │  • TestFlight                                          ││</span></span>
<span class="line"><span>│  │  • Enterprise                                          ││</span></span>
<span class="line"><span>│  │  • App Store                                           ││</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────┘│</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Xcode Cloud YAML 配置示例:</span></span>
<span class="line"><span>build:</span></span>
<span class="line"><span>  scheme: MyApp</span></span>
<span class="line"><span>  build_configuration: Release</span></span>
<span class="line"><span>  xcode_version: automatic</span></span>
<span class="line"><span>  destination: generic/any-iOS-device</span></span>
<span class="line"><span>  test_plan: MyAppCI</span></span>
<span class="line"><span>  workspace: MyApp.xcworkspace</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  artifacts:</span></span>
<span class="line"><span>    - artifacts/**</span></span>
<span class="line"><span>  upload_log_files: true</span></span>
<span class="line"><span></span></span>
<span class="line"><span>test_with_xcode:</span></span>
<span class="line"><span>  schemes:</span></span>
<span class="line"><span>    - test: MyAppTests</span></span>
<span class="line"><span>      xcode_version: automatic</span></span>
<span class="line"><span></span></span>
<span class="line"><span>post_action:</span></span>
<span class="line"><span>  - script: |</span></span>
<span class="line"><span>      echo &quot;Build completed!&quot;</span></span>
<span class="line"><span>      if [[ \${xcode_cloud_status} == &quot;success&quot; ]]; then</span></span>
<span class="line"><span>        fastlane beta</span></span>
<span class="line"><span>      fi</span></span>
<span class="line"><span>&#39;&#39;&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#### 19.2 Xcode Previews 原理</span></span></code></pre></div><p>Xcode Previews 架构：</p><p>┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │ Xcode Previews 工作流程： │ │ Step 1: Swift 编译器预处理 │ • @main 和 PreviewProvider 识别 │ • 生成 Preview 目标二进制 │ │ Step 2: Preview Server 启动 │ • Xcode 启动 preview-server 进程 │ • 与 Main App 共享同一个 XIB/Storyboard │ │ Step 3: 实时编译与预览 │ • 修改代码 → 增量编译 → 热重载 UI │ • @EnvironmentObject / @State 状态同步 │ • Preview 的 @Previewable 属性包装器 │ │ Step 4: 多设备预览 │ • 同时显示多个设备尺寸 │ • 深色模式/浅色模式切换 │ • 多语言预览 │ │ PreviewModifier 常用方式： │ • .previewDevice(&quot;iPhone 15&quot;) │ • .previewInterfaceOrientation(.landscape) │ • .previewDisplayNames(&quot;Light&quot;, &quot;Dark&quot;) │ • .environment(.colorScheme, .dark) │ • .environment(.locale, Locale(identifier: &quot;zh_CN&quot;)) └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</p><p>@main 声明:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 声明 Preview 入口点</span></span>
<span class="line"><span>@main</span></span>
<span class="line"><span>struct MyApp_Previews: PreviewProvider {</span></span>
<span class="line"><span>    static var previews: some View {</span></span>
<span class="line"><span>        Group {</span></span>
<span class="line"><span>            ContentView()</span></span>
<span class="line"><span>                .previewDevice(&quot;iPhone 15&quot;)</span></span>
<span class="line"><span>                .previewDisplayName(&quot;Light Mode&quot;)</span></span>
<span class="line"><span>            ContentView()</span></span>
<span class="line"><span>                .previewDevice(&quot;iPhone 15&quot;)</span></span>
<span class="line"><span>                .environment(\\.colorScheme, .dark)</span></span>
<span class="line"><span>                .previewDisplayName(&quot;Dark Mode&quot;)</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 @Previewable 在 Swift 5.9+ 中</span></span>
<span class="line"><span>struct MyView_Previews: PreviewProvider {</span></span>
<span class="line"><span>    @Previewable static var text = &quot;Hello&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    static var previews: some View {</span></span>
<span class="line"><span>        MyView(text: .\\$text)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h4 id="_19-3-xcode-插件系统-xcode-15" tabindex="-1">19.3 Xcode 插件系统 (Xcode 15+) <a class="header-anchor" href="#_19-3-xcode-插件系统-xcode-15" aria-label="Permalink to &quot;19.3 Xcode 插件系统 (Xcode 15+)&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Xcode 15+ 插件架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│ Xcode 插件类型：</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>│  ┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  │  1. Source Editor (编辑器扩展)</span></span>
<span class="line"><span>│  │     • 上下文菜单项</span></span>
<span class="line"><span>│  │     • 工具栏按钮</span></span>
<span class="line"><span>│  │     • 标记（Marker）</span></span>
<span class="line"><span>│  │     • 文档处理器（生成代码）</span></span>
<span class="line"><span>│  │     示例：SwiftLint Xcode 集成</span></span>
<span class="line"><span>│  └─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  ┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  │  2. General (通用扩展)</span></span>
<span class="line"><span>│  │     • 窗口/工具栏添加</span></span>
<span class="line"><span>│  │     • 通知处理</span></span>
<span class="line"><span>│  │     • 状态更新</span></span>
<span class="line"><span>│  └─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  ┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  │  3. Product (产品扩展)</span></span>
<span class="line"><span>│  │     • 生成代码（模板）</span></span>
<span class="line"><span>│  │     • 生成文件</span></span>
<span class="line"><span>│  └─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  ┌─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>│  │  4. Build System (构建系统扩展)</span></span>
<span class="line"><span>│  │     • 编译前/后操作</span></span>
<span class="line"><span>│  │     • 自定义编译规则</span></span>
<span class="line"><span>│  │     • 构建日志处理</span></span>
<span class="line"><span>│  └─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span>└─  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Xcode 插件与 SPM 包集成：</span></span></code></pre></div><p>// Package.swift 中的 SPM 插件 .package( url: &quot;<a href="https://github.com/onekiloparsec/swiftlint-xcode" target="_blank" rel="noreferrer">https://github.com/onekiloparsec/swiftlint-xcode</a>&quot;, from: &quot;0.5.0&quot; )</p><p>.target( name: &quot;MyPlugin&quot;, plugins: [ .plugin(name: &quot;SwiftLintXcode&quot;, package: &quot;SwiftLintXcode&quot;) ] )</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 20. XCBuild System 深度原理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#### 20.1 XCBuild 架构</span></span></code></pre></div><p>XCBuild System 架构（Xcode 12+ 默认）：</p><p>┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │ XCBuild (Xcode 12+ 默认构建系统) vs传统 Xcodebuild: │ │ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │ │ XCBuild 架构分层： │ │ │ │ ┌───────────────────────────────────────────────────────────┐│ │ │ │ Layer 4: 用户界面 ││ │ │ │ • Xcode IDE ││ │ │ │ • xcodebuild CLI ││ │ │ │ • Fastlane/gym ││ │ │ └───────────────────────────────────────────────────────────┘│ │ │ │ │ │ ┌───────────────────────────────────────────────────────────┐│ │ │ │ Layer 3: 调度层 (Scheduling) ││ │ │ │ • 任务依赖解析 ││ │ │ │ • 优先级调度 ││ │ │ │ • 增量构建判断 ││ │ │ │ • 远程构建缓存（Xcode Cloud） ││ │ │ └───────────────────────────────────────────────────────────┘│ │ │ │ │ │ ┌───────────────────────────────────────────────────────────┐│ │ │ │ Layer 2: 执行层 (Execution) ││ │ │ │ • 并发任务执行 ││ │ │ │ • 进程管理 ││ │ │ │ • 输出重定向 ││ │ │ │ • 错误处理 ││ │ │ └───────────────────────────────────────────────────────────┘│ │ │ │ │ │ ┌───────────────────────────────────────────────────────────┐│ │ │ │ Layer 1: 构建系统核心 (Core) ││ │ │ │ • Build Graph 构建图 ││ │ │ │ • Action 操作类型 ││ │ │ │ • Target/Phase 管理 ││ │ │ └───────────────────────────────────────────────────────────┘│ │ │ │ │ 缓存机制： ││ │ │ • Action Cache: 构建操作缓存 ││ │ │ • Artifact Cache: 产物缓存 ││ │ │ • Module Cache: 模块编译缓存 ││ │ │ • Precompiled Headers: 预编译头 ││ │ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</p><p>XCBuild vs Ninja vs Make： ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │ 对比分析： │ │ │ │ ┌────────────────┬────────────────────┬─────────────────────┐ │ │ │ 特性 │ XCBuild │ Ninja/Make │ │ │ ├────────────────┼───────────────────┼─────────────────────┤ │ │ │ 构建图 │ 构建时动态生成 │ 预先定义 (BUILD.ninja│ │ │ │ 依赖解析 │ 基于 Target/Phase │ 基于文件依赖 │ │ │ 并行 │ 支持，基于硬件 │ 高度可调，需手动配置 │ │ │ 缓存 │ 支持 (Action Cache) │ 需外部工具 │ │ │ Xcode 集成 │ ✅ 原生 │ ❌ 需额外配置 │ │ │ 适用场景 │ iOS/macOS 构建 │ 大型多平台项目 │ │ └────────────────┴────────────────────┴──────────────────────┘ │ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘</p><h4 id="_20-2-build-action-详解" tabindex="-1">20.2 Build Action 详解 <a class="header-anchor" href="#_20-2-build-action-详解" aria-label="Permalink to &quot;20.2 Build Action 详解&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>XCBuild 的 Action 类型完整列表：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────┬──────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Action 类型           │ 说明                                     │</span></span>
<span class="line"><span>├───────────────────────┼──────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Build                 │ 构建目标产物                                │</span></span>
<span class="line"><span>│ Test                  │ 构建并运行测试                              │</span></span>
<span class="line"><span>│ Archive               │ 构建 Archive                              │</span></span>
<span class="line"><span>│ Analyze               │ 静态分析（Clang/LLVM）                      │</span></span>
<span class="line"><span>│ Package               │ 打包（如 XCFramework）                      │</span></span>
<span class="line"><span>│ IndexBuild            │ 构建索引（用于代码索引）                      │</span></span>
<span class="line"><span>│ GenerateDocC          │ 生成 DocC 文档                            │</span></span>
<span class="line"><span>│ GenerateDebugSymbols  │ 生成调试符号                               │</span></span>
<span class="line"><span>│ Strip                 │ 剥离二进制（Strip）                          │</span></span>
<span class="line"><span>│ Thin                  │ 瘦身（Thin Binary）                         │</span></span>
<span class="line"><span>└───────────────────────┴──────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_21-工程化最佳实践总结" tabindex="-1">21. 工程化最佳实践总结 <a class="header-anchor" href="#_21-工程化最佳实践总结" aria-label="Permalink to &quot;21. 工程化最佳实践总结&quot;">​</a></h3><h4 id="_21-1-ios-工程化-checklist" tabindex="-1">21.1 iOS 工程化 Checklist <a class="header-anchor" href="#_21-1-ios-工程化-checklist" aria-label="Permalink to &quot;21.1 iOS 工程化 Checklist&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>iOS 工程化完整 Checklist：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ ✅ 依赖管理                                                     │</span></span>
<span class="line"><span>│  └─ 使用 SPM 管理依赖（或 CocoaPods）                            │</span></span>
<span class="line"><span>│  └─ 使用 Package.resolved / Podfile.lock                       │</span></span>
<span class="line"><span>│  └─ 定期检查依赖更新                                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 代码规范                                                     │</span></span>
<span class="line"><span>│  └─ SwiftLint 配置                                             │</span></span>
<span class="line"><span>│  └─ SwiftFormat 自动格式化                                     │</span></span>
<span class="line"><span>│  └─ 代码审查流程                                                │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 模块化                                                       │</span></span>
<span class="line"><span>│  └─ Clean Architecture 分层                                     │</span></span>
<span class="line"><span>│  └─ SPM Packages / Xcode Targets 多模块                        │</span></span>
<span class="line"><span>│  └─ Protocol 定义模块间接口                                      │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 构建优化                                                     │</span></span>
<span class="line"><span>│  └─ Whole Module Optimization (Release)                        │</span></span>
<span class="line"><span>│  └─ Dead Code Stripping (Release)                              │</span></span>
<span class="line"><span>│  └─ 增量构建                                                    │</span></span>
<span class="line"><span>│  └─ 精简依赖                                                    │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ CI/CD                                                       │</span></span>
<span class="line"><span>│  └─ GitHub Actions / Bitrise / Xcode Cloud                    │</span></span>
<span class="line"><span>│  └─ SwiftLint → Build → Test → Archive → Deploy               │</span></span>
<span class="line"><span>│  └─ Fastlane 自动化                                            │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 证书管理                                                     │</span></span>
<span class="line"><span>│  └─ match 统一管理                                             │</span></span>
<span class="line"><span>│  └─ 证书自动轮换                                                  │</span></span>
<span class="line"><span>│  └─ CI 环境手动签名                                              │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 文档                                                        │</span></span>
<span class="line"><span>│  └─ DocC 文档                                                  │</span></span>
<span class="line"><span>│  └─ 代码注释                                                     │</span></span>
<span class="line"><span>│  └─ README 文档                                                │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 测试                                                        │</span></span>
<span class="line"><span>│  └─ 单元测试覆盖率 ≥ 80%                                         │</span></span>
<span class="line"><span>│  └─ UI 测试                                                     │</span></span>
<span class="line"><span>│  └─ 集成测试                                                     │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 发布                                                        │</span></span>
<span class="line"><span>│  └─ SemVer 版本管理                                              │</span></span>
<span class="line"><span>│  └─ TestFlight 预发布                                            │</span></span>
<span class="line"><span>│  └─ App Store Connect                                          │</span></span>
<span class="line"><span>│  └─ 发布说明                                                     │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ✅ 资源管理                                                     │</span></span>
<span class="line"><span>│  └─ Asset Catalog 管理                                           │</span></span>
<span class="line"><span>│  └─ 按需加载                                                     │</span></span>
<span class="line"><span>│  └─ Bundle 管理                                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h4 id="_21-2-团队工程化协作规范" tabindex="-1">21.2 团队工程化协作规范 <a class="header-anchor" href="#_21-2-团队工程化协作规范" aria-label="Permalink to &quot;21.2 团队工程化协作规范&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>团队工程化协作规范：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 1. 分支策略                                                      │</span></span>
<span class="line"><span>│  └─ 主分支: main (生产) / develop (开发)                        │</span></span>
<span class="line"><span>│  └─ 功能分支: feature/&lt;描述&gt;                                    │</span></span>
<span class="line"><span>│  └─ 修复分支: hotfix/&lt;描述&gt;                                     │</span></span>
<span class="line"><span>│  └─ PR 审查: 至少 1 人审查                                       │</span></span>
<span class="line"><span>│  └─ 合并策略: Squash merge (保持日志简洁)                         │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│ 2. Commit 规范 (Conventional Commits)                            │</span></span>
<span class="line"><span>│  └─ feat: 新功能                                                   │</span></span>
<span class="line"><span>│  └─ fix: Bug 修复                                                 │</span></span>
<span class="line"><span>│  └─ docs: 文档                                                     │</span></span>
<span class="line"><span>│  └─ style: 代码格式                                                  │</span></span>
<span class="line"><span>│  └─ refactor: 重构                                                    │</span></span>
<span class="line"><span>│  └─ test: 测试                                                     │</span></span>
<span class="line"><span>│  └─ chore: 构建/CI 相关                                               │</span></span>
<span class="line"><span>│  └─ perf: 性能优化                                                   │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│ 3. Code Review 规范                                               │</span></span>
<span class="line"><span>│  └─ 代码风格 (SwiftLint 自动检查)                                  │</span></span>
<span class="line"><span>│  └─ 架构设计 (模块化/解耦)                                          │</span></span>
<span class="line"><span>│  └─ 安全性 (敏感信息/权限)                                           │</span></span>
<span class="line"><span>│  └─ 性能 (内存/并发)                                                  │</span></span>
<span class="line"><span>│  └─ 测试覆盖 (新增代码必须配测试)                                      │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│ 4. 版本管理规范                                                    │</span></span>
<span class="line"><span>│  └─ SemVer: MAJOR.MINOR.PATCH                                    │</span></span>
<span class="line"><span>│  └─ 每次发布必须打 tag                                            │</span></span>
<span class="line"><span>│  └─ Release Notes 必须更新                                        │</span></span>
<span class="line"><span>│  └─ 版本号与 Bundle Version 一致                                  │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│ 5. 发布流程                                                     │</span></span>
<span class="line"><span>│  └─ feature → develop → main                                    │</span></span>
<span class="line"><span>│  └─ 测试 → TestFlight → App Store                                │</span></span>
<span class="line"><span>│  └─ 灰度发布 (先 10% 用户)                                       │</span></span>
<span class="line"><span>│  └─ 回滚预案                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h4 id="_21-3-常见工程化问题与解决方案" tabindex="-1">21.3 常见工程化问题与解决方案 <a class="header-anchor" href="#_21-3-常见工程化问题与解决方案" aria-label="Permalink to &quot;21.3 常见工程化问题与解决方案&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>常见问题与解决方案对照表：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────┬──────────────────────────────┬──────────────────────────┐</span></span>
<span class="line"><span>│ 问题                      │ 原因分析                      │ 解决方案                 │</span></span>
<span class="line"><span>├───────────────────────────┼──────────────────────────────┼──────────────────────────┤</span></span>
<span class="line"><span>│ 构建慢                    │ 依赖过多 / 未增量构建          │ SPM 预编译 + 精简依赖    │</span></span>
<span class="line"><span>│ 符号冲突                  │ 多个库引入同一框架              │ 静态链接 + 符号过滤       │</span></span>
<span class="line"><span>│ App 包体积大             │ 资源未优化 / 未剥离调试符号    │ Asset Catalog + Strip    │</span></span>
<span class="line"><span>│ 内存泄漏                  │ 循环引用 / 未释放资源          │ TSAN + Instruments       │</span></span>
<span class="line"><span>│ 证书过期                  │ 手动管理证书                   │ match 自动化管理         │</span></span>
<span class="line"><span>│ CI/CD 不稳定             │ 网络 / 依赖 / 配置不一致       │ Podfile.lock + CI 脚本   │</span></span>
<span class="line"><span>│ Framework 体积大         │ 静态库包含未用代码            │ Dead Code Stripping      │</span></span>
<span class="line"><span>│ SPM 依赖解析慢          │ 网络 / 包数量多              │ 二进制包 + 镜像源         │</span></span>
<span class="line"><span>│ CocoaPods 冲突          │ 依赖版本冲突 / Spec 版本差异   │ Podfile.lock + 精确版本   │</span></span>
<span class="line"><span>│ Xcode Cloud 构建失败    │ 签名 / 证书 / 环境配置问题    │ match + CI 脚本验证      │</span></span>
<span class="line"><span>│ Bundle 资源找不到        │ Bundle 路径配置错误            │ Bundle(for: Self)        │</span></span>
<span class="line"><span>│ 动态库 200MB 限制       │ 内嵌动态库超限                 │ 转为静态库 / 远程加载      │</span></span>
<span class="line"><span>│ 循环依赖                  │ Target 间循环引用              │ 协议抽象 / SPM 包隔离     │</span></span>
<span class="line"><span>│ Xcode 崩溃              │ DerivedData 损坏 / 插件冲突    │ 清理 DerivedData          │</span></span>
<span class="line"><span>│ 模拟器 vs 真机不一致     │ 模拟器仅 x86_64 / arm64     │ Always use XCFramework   │</span></span>
<span class="line"><span>└───────────────────────────┴──────────────────────────────┴──────────────────────────┘</span></span></code></pre></div><hr><p><em>本文档对标 Android <code>20_Engineering</code> + <code>14_Engineering</code> 的深度，覆盖 iOS 工程化全栈知识</em><br><em>包含 Xcode 高级特性、XCBuild 系统原理、工程化最佳实践总结</em><br><em>面向 iOS 工程师面试准备和系统化工程学习</em></p><hr><h2 id="附录-快速查阅表" tabindex="-1">附录：快速查阅表 <a class="header-anchor" href="#附录-快速查阅表" aria-label="Permalink to &quot;附录：快速查阅表&quot;">​</a></h2><h3 id="a-常用-cli-命令速查" tabindex="-1">A. 常用 CLI 命令速查 <a class="header-anchor" href="#a-常用-cli-命令速查" aria-label="Permalink to &quot;A. 常用 CLI 命令速查&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># SPM</span></span>
<span class="line"><span>swift package init --name &lt;name&gt; --type library</span></span>
<span class="line"><span>swift package update</span></span>
<span class="line"><span>swift package resolve</span></span>
<span class="line"><span>swift build</span></span>
<span class="line"><span>swift test</span></span>
<span class="line"><span>swift package generate-xcodeproj</span></span>
<span class="line"><span></span></span>
<span class="line"><span># CocoaPods</span></span>
<span class="line"><span>pod install</span></span>
<span class="line"><span>pod install --repo-update</span></span>
<span class="line"><span>pod update</span></span>
<span class="line"><span>pod lib create</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Carthage</span></span>
<span class="line"><span>carthage bootstrap</span></span>
<span class="line"><span>carthage update</span></span>
<span class="line"><span>carthage build</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Xcode Build</span></span>
<span class="line"><span>xcodebuild build</span></span>
<span class="line"><span>xcodebuild test</span></span>
<span class="line"><span>xcodebuild archive</span></span>
<span class="line"><span>xcodebuild -create-xcframework</span></span>
<span class="line"><span>xcodebuild -exportArchive</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 工具</span></span>
<span class="line"><span>swiftlint lint --strict</span></span>
<span class="line"><span>swiftformat --lint .</span></span></code></pre></div><h3 id="b-关键概念速查" tabindex="-1">B. 关键概念速查 <a class="header-anchor" href="#b-关键概念速查" aria-label="Permalink to &quot;B. 关键概念速查&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ SPM              │ Swift Package Manager (Apple 官方)         │</span></span>
<span class="line"><span>│ CocoaPods        │ Ruby 生态依赖管理（最大生态）              │</span></span>
<span class="line"><span>│ Carthage         │ 非侵入式依赖管理（手动集成）               │</span></span>
<span class="line"><span>│ XCFramework      │ 多架构二进制分发格式（Apple 推荐）         │</span></span>
<span class="line"><span>│ Framework        │ 模块化代码分发单元                       │</span></span>
<span class="line"><span>│ Bundle           │ 资源加载单元                             │</span></span>
<span class="line"><span>│ DerivedData      │ 构建缓存目录                             │</span></span>
<span class="line"><span>│ Scheme           │ 构建/测试/运行配置                        │</span></span>
<span class="line"><span>│ Target           │ Xcode 构建目标                            │</span></span>
<span class="line"><span>│ Pod              │ CocoaPods 依赖包                          │</span></span>
<span class="line"><span>│ Podspec          │ Pod 描述文件                            │</span></span>
<span class="line"><span>│ .pbxproj         │ Xcode 项目配置文件                        │</span></span>
<span class="line"><span>│ Provisioning     │ iOS 代码签名描述文件                      │</span></span>
<span class="line"><span>│ dSYM             │ 调试符号文件（崩溃分析必备）              │</span></span>
<span class="line"><span>│ xcresult         │ Xcode 测试结果文件                       │</span></span>
<span class="line"><span>│ xcarchive        │ Xcode 归档产物（发布必备）                │</span></span>
<span class="line"><span>│ DocC             │ Apple 文档系统                          │</span></span>
<span class="line"><span>│ Fastlane         │ iOS 自动化流程工具集                       │</span></span>
<span class="line"><span>│ xcodebuild       │ Xcode 命令行构建工具                      │</span></span>
<span class="line"><span>│ xcrun            │ Xcode 命令行工具包装器                   │</span></span>
<span class="line"><span>│ dyld             │ iOS 动态链接器                          │</span></span>
<span class="line"><span>│ @rpath           │ 运行时搜索路径                           │</span></span>
<span class="line"><span>│ Whole Module Opt │ Swift 跨模块优化                          │</span></span>
<span class="line"><span>│ Dead Code Strip  │ 死代码剥离                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="c-推荐资源" tabindex="-1">C. 推荐资源 <a class="header-anchor" href="#c-推荐资源" aria-label="Permalink to &quot;C. 推荐资源&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>官方资源:</span></span>
<span class="line"><span>• [Apple: Xcode Documentation](https://developer.apple.com/xcode/)</span></span>
<span class="line"><span>• [Apple: Swift Package Manager](https://www.swift.org/package-manager/)</span></span>
<span class="line"><span>• [Apple: xcbuild](https://developer.apple.com/documentation/foundation/build-systems)</span></span>
<span class="line"><span>• [Apple: DocC](https://www.swift.org/docc/)</span></span>
<span class="line"><span>• [Apple: Fastlane](https://fastlane.tools/)</span></span>
<span class="line"><span>• [GitHub: CocoaPods](https://cocoapods.org/)</span></span>
<span class="line"><span>• [GitHub: Carthage](https://github.com/Carthage/Carthage)</span></span>
<span class="line"><span>• [GitHub: SwiftLint](https://github.com/realm/SwiftLint)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>技术博客:</span></span>
<span class="line"><span>• [Swift by Sundell](https://www.swiftbysundell.com/)</span></span>
<span class="line"><span>• [NSEngage](https://nshipster.com/)</span></span>
<span class="line"><span>• [Apple Developer Forums](https://developer.apple.com/forums/)</span></span>
<span class="line"><span>• [WWDC Sessions (YouTube)](https://developer.apple.com/videos/)</span></span></code></pre></div>`,222)])])}const g=a(l,[["render",e]]);export{o as __pageData,g as default};
