# 01 - iOS 测试与 CI/CD 全栈

## 目录

1. [测试体系概览](#1-测试体系概览)
2. [XCTest 框架详解](#2-xctest-框架详解)
3. [单元测试与集成测试](#3-单元测试与集成测试)
4. [UI 测试](#4-ui-测试)
5. [测试覆盖率与度量](#5-测试覆盖率与度量)
6. [Xcode 内建测试](#6-xcode-内建测试)
7. [CI/CD 流程](#7-cicd-流程)
8. [Xamarin & 其他测试框架](#8-xamarin-与其他测试框架)
9. [测试策略与最佳实践](#9-测试策略与最佳实践)
10. [测试与 Kotlin/Android 对比](#10-测试与-kotlinandroid-对比)
11. [面试考点汇总](#11-面试考点汇总)

---

## 1. 测试体系概览

### 1.1 iOS 测试金字塔

```
iOS 测试金字塔：

              /¯¯¯\
             /前沿\       UI Testing (XCUITest)
            /______\      ~10% of tests
            |      |
           /¯¯¯¯¯¯¯\
          / 集成测试 \    Integration Testing
         / (XCTest + \    ~20% of tests
        /  mock/     \
       /______________\
       |              |
      /¯¯¯\ /¯¯¯\ /¯¯¯\ /¯¯¯\ /¯¯¯\ /¯¯¯\
     /单元/ /单元/ /单元/ /单元/ /单元/ /单元/  Unit Testing (XCTest)
    /____\/____\/____\/____\/____\/____\     ~70% of tests

测试原则：
• 底层单元测试最多（快速、稳定、隔离性好）
• 中层集成测试验证组件交互
• 顶层 UI 测试最少（慢、脆弱、只测关键路径）
```

### 1.2 测试类型分类

| 测试类型 | 工具 | 粒度 | 速度 | 稳定性 | 作用 |
|---|---|---|---|---|---|
| 单元测试 | XCTest | 类/方法 | ⚡ 快 | ⭐⭐⭐⭐⭐ | 验证逻辑正确性 |
| 集成测试 | XCTest + Mock | 模块 | ⚡⚡ 中 | ⭐⭐⭐⭐ | 验证组件交互 |
| UI 测试 | XCUITest | 界面 | 🐌 慢 | ⭐⭐ | 验证用户流程 |
| 性能测试 | Instruments | 运行时 | 🐌 慢 | ⭐⭐⭐ | 验证性能指标 |
| 静态分析 | SwiftLint | 代码 | ⚡⚡ 中 | ⭐⭐⭐⭐⭐ | 代码规范检查 |

---

## 2. XCTest 框架详解

### 2.1 XCTest 架构

```
XCTest 框架架构：

┌─────────────────────────────────────────────────────┐
│                  XCTest Framework                    │
├──────────────┬──────────────┬──────────────────────┤
│  XCTest      │  XCTestCase  │  XCAssertion         │
│  (基础类)    │  (测试用例)    │  (断言)              │
├──────────────┼──────────────┼──────────────────────┤
│  XCTestCase  │  XCTestRun   │  XCTestSuite         │
│  runLoop     │  testMetrics │  testBundle          │
├──────────────┼──────────────┼──────────────────────┤
│  断言方法    │  生命周期    │  测试组织             │
│  • XCTAssertTrue/          │  • 类级别:           │
│    XCTAssertFalse         │    + ( XCTestCase    │
│  • XCTAssertNil/          │     classSetup)       │
│    XCTAssertNotNil        │    + ( XCTestCase    │
│  • XCTAssertEqual/        │     setUp)            │
│    XCTAssertNotEqual      │    测试方法            │
│  • XCTAssertGreaterThan/  │    - (void)           │
│    XCTAssertLessThan      │     testSomething    │
│  • XCTAssertThrows/       │    + (void)           │
│    XCTAssertDoesNotThrow  │     tearDown         │
│  • expectation/           │    + (void)           │
│    waitForExpectations    │     classTearDown    │
└──────────────┴──────────────┴──────────────────────┘
```

### 2.2 XCTest 生命周期

```
测试用例生命周期（每个测试方法独立）：

classExampleTestCase: XCTestCase {

    // 1. 类级别 - 整个测试类运行一次
    class func setUp() {
        // 初始化共享资源
    }

    override func setUp() {
        // 2. 每个测试方法前运行
        super.setUp()
        // 创建被测对象实例
        // 准备测试数据
    }

    func testExample() {
        // 3. 测试方法 - 断言验证
        let result = testSubject.calculate(5)
        XCTAssertEqual(result, 10)
    }

    func testExampleWithTimeout() {
        // 异步测试
        let expectation = expectation(description: "异步操作")
        
        doAsyncOperation {
            expectation.fulfill()
        }
        
        waitForExpectations(timeout: 5.0)
    }

    override func tearDown() {
        // 4. 每个测试方法后运行
        // 清理资源
        super.tearDown()
    }

    class func tearDown() {
        // 5. 类级别清理
    }
}
```

### 2.3 断言方法汇总

| 断言 | 说明 | 使用场景 |
|---|---|---|
| `XCTAssertTrue(_)` | 值为 true | 布尔条件验证 |
| `XCTAssertFalse(_)` | 值为 false | 否定条件验证 |
| `XCTAssertEqual(_,_)` | 相等 | 数值/对象相等 |
| `XCTAssertNotEqual(_,_)` | 不等 | 排除值 |
| `XCTAssertNil(_)` | 为 nil | 空值验证 |
| `XCTAssertNotNil(_)` | 不为 nil | 非空验证 |
| `XCTAssertGreaterThan(_,_)` | 大于 | 数值比较 |
| `XCTAssertLessThan(_,_)` | 小于 | 数值比较 |
| `XCTAssertEqual(_,_ ,accuracy:)` | 浮点相等(容差) | 浮点数比较 |
| `XCTAssertThrows(_)` | 抛出异常 | 异常验证 |
| `XCTAssertNoThrow(_)` | 不抛异常 | 安全验证 |
| `XCTAssertEqual(within:, _ ,_)` | 近似相等 | 浮点数容差比较 |

---

## 3. 单元测试与集成测试

### 3.1 单元测试编写规范

```swift
// ✅ 好的单元测试
import XCTest
@testable import MyModule

final class UserServiceTests: XCTestCase {
    
    private var sut: UserService!  // system under test
    
    override func setUp() {
        super.setUp()
        sut = UserService(networkClient: MockNetworkClient())
    }
    
    func testFetchUser_ReturnsValidUser() {
        // Given - 准备测试数据
        let expectedUser = User(id: 1, name: "John")
        let mockClient = MockNetworkClient()
        mockClient.stubbedResponse = expectedUser
        
        // When - 执行被测方法
        let result = try? sut.fetchUser(id: 1)
        
        // Then - 验证结果
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.id, 1)
        XCTAssertEqual(result?.name, "John")
    }
    
    func testFetchUser_FailsWithInvalidId() {
        let mockClient = MockNetworkClient()
        mockClient.stubbedError = NetworkError.notFound
        
        XCTAssertThrowsError(try sut.fetchUser(id: -1)) { error in
            XCTAssertEqual(error as? NetworkError, .notFound)
        }
    }
}
```

### 3.2 Mock 框架使用

```swift
// Mock 对象示例
class MockNetworkClient: NetworkClientProtocol {
    
    var stubbedResponse: User?
    var stubbedError: Error?
    var callCount = 0
    
    func fetchUser(id: Int) async throws -> User {
        callCount += 1
        if let error = stubbedError {
            throw error
        }
        guard let user = stubbedResponse else {
            throw URLError(.badServerResponse)
        }
        return user
    }
}

// Stub - 固定返回值
// Mock - 可配置行为 + 验证调用
// Spy - 记录调用信息
```

### 3.3 集成测试模式

```swift
// 集成测试 - 验证多个组件协作
func testUserFlow_Integration() async throws {
    // 使用真实网络但 Mock 数据库
    let userRepo = UserRepository(db: MockDatabase())
    let networkClient = RealNetworkClient()
    
    let service = UserService(
        repository: userRepo,
        networkClient: networkClient
    )
    
    // 验证端到端流程
    let user = try await service.fetchAndCacheUser(id: 1)
    XCTAssertNotNil(user)
    
    // 验证缓存
    let cached = try await userRepo.getUser(id: 1)
    XCTAssertEqual(cached?.id, user.id)
}
```

---

## 4. UI 测试

### 4.1 XCUITest 架构

```
XCUITest 测试架构：

┌──────────────────────────────────────┐
│           XCUITest Framework          │
├──────────────┬───────────────────────┤
│  XCUIApplication │  XCUIElement       │
│  (应用实例)     │  (UI 元素)          │
├──────────────┼───────────────────────┤
│  XCUIElementQuery │ XCUIApplication   │
│  (元素查询)      │  (应用实例)         │
├──────────────┼───────────────────────┤
│  XCUIDevice │ XCUIAttachment         │
│  (设备操作)  │  (截图/视频录制)       │
└──────────────┴───────────────────────┘
```

### 4.2 XCUITest 示例

```swift
import XCTest

final class LoginFlowTests: XCTestCase {
    
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false  // 一个失败就停止
        app = XCUIApplication()
        app.launchArguments = ["--testing"]
        app.launch()
    }
    
    func testLoginWithValidCredentials() {
        // 等待主界面出现
        let usernameField = app.textFields["username"]
        usernameField.tap()
        usernameField.typeText("test@example.com")
        
        let passwordField = app.secureTextFields["password"]
        passwordField.tap()
        passwordField.typeText("password123")
        
        app.buttons["Login"].tap()
        
        // 验证登录成功
        XCTAssertTrue(app.staticTexts["Dashboard"].waitForExistence(timeout: 5))
    }
    
    func testLoginWithInvalidCredentials() {
        app.textFields["username"].typeText("wrong@email.com")
        app.secureTextFields["password"].typeText("wrongpass")
        app.buttons["Login"].tap()
        
        XCTAssertTrue(app.staticTexts["Invalid credentials"].exists)
    }
    
    func testBiometricLogin() {
        // 使用 Touch ID / Face ID
        app.buttons["FaceIDLogin"].tap()
        app.triggersFaceID(success: true)
        
        XCTAssertTrue(app.staticTexts["Dashboard"].exists)
    }
}
```

### 4.3 XCUITest 最佳实践

| 原则 | 说明 | 示例 |
|---|---|---|
| 使用 accessibilityIdentifier | 稳定的元素标识 | `element.accessibilityIdentifier = "login_button"` |
| 等待元素存在 | 不要硬编码 delay | `waitForExistence(timeout: 5)` |
| 最小化 UI 测试 | 只测关键用户流程 | 登录/注册/支付流程 |
| 快速启动 | 用 launchArguments 跳过引导 | `["--testing", "--skipOnboarding"]` |
| 截图调试 | 失败时自动截图 | `add(XCUIAttachment(image:))` |

---

## 5. 测试覆盖率与度量

### 5.1 覆盖率类型

```
测试覆盖率度量：

┌───────────────┬──────────────────────────────────┐
│  覆盖率类型    │  说明                            │
├───────────────┼──────────────────────────────────┤
│  行覆盖率      │  执行的代码行 / 总行数            │
│  分支覆盖率     │  执行的分支 / 总分支数            │
│  函数覆盖率     │  调用的函数 / 总函数数            │
│  条件覆盖率     │  执行的条件子表达式 / 总数         │
│  路径覆盖率     │  执行的路径 / 所有可能路径        │
└───────────────┴──────────────────────────────────┘

目标覆盖率：
• 核心业务逻辑：80%+ 分支覆盖率
• 工具类/辅助方法：60%+ 行覆盖率
• UI 层：关键路径覆盖率 100%
```

### 5.2 覆盖率工具

| 工具 | 类型 | 特点 |
|---|---|---|
| Xcode 内建覆盖率 | 行覆盖率 | 最简单，集成在 Xcode 中 |
| OCoverage | 行覆盖率 | 基于 llvm-cov |
| SwiftLint | 静态分析 | 代码风格 + 复杂度检查 |
| SonarQube | 多类型 | 持续集成平台 |

---

## 6. Xcode 内建测试

### 6.1 测试计划与 Scheme

```
Xcode 测试 Scheme 配置：

Xcode → Product → Scheme → Edit Scheme → Test

配置项：
├── Info
│   ├── Target to launch: [你的 App]
│   ├── Build configuration: Debug
│   └── Collect performance data: ✅
│
├── Options
│   ├── Enable Address Sanitizer: ✅ (内存检测)
│   ├── Enable Thread Sanitizer: ✅ (线程检测)
│   ├── Detect misused APIs: ✅
│   └── GPU Frame Capture: Metal
│
├── Diagnostics
│   ├── Memory Graph Debugger
│   ├── Zombies
│   └── Thread Safety Analysis
│
└── Test Plan
    ├── Test target
    ├── Test bundle
    └── Code coverage
```

### 6.2 Test Plan 配置

```swift
// 测试计划可以在多个 target 间共享
// Test Plans 支持条件覆盖：
// - Scheme 级别的覆盖
// - Target 级别的覆盖
// - 设备类型覆盖（iPhone vs iPad）
// - iOS 版本覆盖
```

---

## 7. CI/CD 流程

### 7.1 iOS CI/CD 架构

```
iOS CI/CD Pipeline:

┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  代码提交 │───→│  Lint    │───→│  Build   │───→│  Test   │
│  (Git)   │    │  (Swiftlint)│  │ (Xcodebuild)│  │(XCTest) │
└─────────┘    └──────────┘    └──────────┘    └────┬────┘
                                                     │
                    ┌────────────────────────────────┤
                    │                                │
              ┌─────▼─────┐                  ┌──────▼──────┐
              │ Unit Test  │                  │ UI Test     │
              │ (fast)     │                  │ (slow)      │
              └─────┬─────┘                  └──────┬──────┘
                    │                                │
              ┌─────▼─────┐                  ┌──────▼──────┐
              │Coverage   │                  │ Screenshot  │
              │Check      │                  │ Compare     │
              └─────┬─────┘                  └──────┬──────┘
                    │                                │
              ┌─────▼────────────────────────────────▼──────┐
              │              Build & Package                  │
              │        (Xcodebuild / xcodebuild)             │
              │        Archive → .ipa / .app                 │
              └───────────────────┬─────────────────────────┘
                                  │
              ┌───────────────────┼─────────────────────────┐
              │                   │                         │
      ┌───────▼───────┐  ┌───────▼───────┐    ┌──────────▼──────────┐
      │  TestFlight   │  │  App Store    │    │  Enterprise Deploy   │
      │  (内部测试)   │  │  (正式发布)   │    │  (企业内部分发)     │
      └───────────────┘  └───────────────┘    └─────────────────────┘
```

### 7.2 常用 CI 平台对比

| 平台 | 优势 | 劣势 | 适用场景 |
|---|---|---|---|
| **GitHub Actions** | 免费额度多、YAML 简单 | macOS runner 有限 | 开源/小团队 |
| **Bitrise** | Xcode 友好、UI 配置 | 免费版有限制 | 移动优先团队 |
| **Fastlane** | 灵活、生态丰富 | 需自行搭建 | 大型企业 |
| **Xcode Cloud** | Apple 原生集成 | 平台锁定 | Apple 生态 |
| **CircleCI** | 可定制性强 | 配置复杂 | 已有 CircleCI 团队 |

### 7.3 Fastlane 核心工具

```
Fastlane 工具链：

┌──────────────────────────────────────────────┐
│              Fastlane 工具生态                │
├──────────────┬───────────────────────────────┤
│  match       │  证书 & 描述文件管理          │
│  sigh        │  生成描述文件                   │
│  gym         │  构建 .ipa / .app             │
│  scan        │  运行测试                      │
│  scremote    │  截图自动化                    │
│  lane        │  编排构建流程                   │
│  Deliver     │  提交到 App Store              │
│  Pilot       │  提交到 TestFlight             │
│  Cert        │  管理证书                      │
│  Sigh        │  管理 Provisioning Profiles    │
└──────────────┴───────────────────────────────┘

// Fastfile 示例
default_platform(:ios)

platform :ios do
  desc "Run tests"
  lane :test do
    scan(
      scheme: "MyApp",
      devices: ["iPhone 15"],
      code_coverage: true
    )
  end
  
  desc "Build and ship to TestFlight"
  lane :beta do
    match(type: "app_store")
    gym(scheme: "MyApp", export_method: "app-store")
    pilot(distribution_rule: "Beta Testers")
  end
  
  desc "Submit to App Store"
  lane :release do
    match(type: "app_store")
    gym(scheme: "MyApp", export_method: "app-store")
    deliver(force: true)
  end
end
```

---

## 8. 其他测试框架

### 8.1 Nimble 断言库

```swift
// Nimble 提供更自然的断言语法
import Nimble
import Quick

class UserServiceSpec: QuickSpec {
    override func spec() {
        var service: UserService!
        
        beforeEach {
            service = UserService()
        }
        
        it("should fetch user") {
            let user = try! service.fetchUser(id: 1)
            expect(user).to(not(beNil()))
            expect(user.name).to(equal("John"))
        }
        
        it("should throw error") {
            expect { try service.fetchUser(id: -1) }.to(throwError())
        }
    }
}
```

### 8.2 OCMock 与 OHHTTPStubs

| 框架 | 用途 | 状态 |
|---|---|---|
| OCMock | Mock 对象 | ⚠️ 老旧，建议用 Swift 原生 |
| OHHTTPStubs | Mock 网络 | 活跃 |
| Nimble+Quick | BDD 测试 | 活跃 |
| Swift Testing | Apple 官方新一代 | ✅ 推荐 |

### 8.3 Swift Testing（新一代）

```swift
// Swift 5.9+ 引入的新一代测试框架
import Testing

struct UserServiceTests {
    @Test func fetchUser_returnsValidUser() {
        let sut = UserService(networkClient: MockNetworkClient())
        let result = try! await sut.fetchUser(id: 1)
        #expect(result.id == 1)
        #expect(result.name == "John")
    }
    
    @Test func fetchUser_throws_onNotFound() async throws {
        let sut = UserService(networkClient: ErrorNetworkClient())
        #expect(throws: NetworkError.notFound) {
            try await sut.fetchUser(id: -1)
        }
    }
    
    @Test(.timeout(5)) func fetchUser_timeout() async throws {
        let sut = UserService(networkClient: SlowNetworkClient())
        _ = try await sut.fetchUser(id: 1)
    }
}
```

---

## 9. 测试策略与最佳实践

### 9.1 测试策略矩阵

| 层级 | 覆盖率目标 | 执行频率 | 工具 |
|---|---|---|---|
| 单元测试 | ≥80% | 每次提交 | XCTest/Swift Testing |
| 集成测试 | ≥60% | 每次提交 | XCTest + Mock |
| UI 测试 | 关键路径 100% | 每日 | XCUITest |
| 性能测试 | 基准达标 | 每周 | Instruments |
| 安全测试 | 0 漏洞 | 定期 | OWASP ZAP |

### 9.2 测试编写最佳实践（AAA 模式）

```
AAA 模式：Arrange-Act-Assert

✅ GOOD - 每个测试一个场景，命名清晰
func testLoginWithValidCredentials_ShowsDashboard() {
    // Arrange
    let user = User(id: 1, name: "John")
    
    // Act
    let result = subject.login(with: user)
    
    // Assert
    XCTAssertTrue(result.isSuccess)
    XCTAssertEqual(app.currentView, "Dashboard")
}

❌ BAD - 多个场景混合，断言过多
func testLogin() {
    // 这个测试干了太多事情
}
```

---

## 10. 测试与 Kotlin/Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 测试框架 | XCTest / Swift Testing | JUnit 5 / Kotlin Test |
| Mock 框架 | MockitochKit / 自实现 | Mockito-Kotlin / MockK |
| UI 测试 | XCUITest | Espresso |
| 断言 | XCTAssert* | assertEquals / assertThat |
| BDD | Quick+Nimble | Kotest |
| 覆盖率 | Xcode Coverage / OCoverage | JaCoCo / Kotlin 内建 |
| CI | Fastlane + CI 平台 | Gradle + CI 平台 |
| 测试注解 | @Test | @Test |
| 异步测试 | expectation + waitForExpectations | TestDispatcher / runTest |
| 依赖注入测试 | 构造器注入 | Hilt 测试组件 |

---

## 11. 面试考点汇总

### 高频面试题

1. **iOS 测试金字塔是什么？为什么这样设计？**
   - 三层结构：单元→集成→UI
   - 数量比例：70%-20%-10%
   - 原因：底层测试快且稳定，高层测试慢且脆弱

2. **XCTest 和 Swift Testing 的区别？**
   - XCTest 是 OC 时代遗留的 API
   - Swift Testing 是原生 Swift API，支持 async/await、@Test 注解
   - 推荐新项目使用 Swift Testing

3. **如何测试异步代码？**
   - XCTest：expectation + fulfill + waitForExpectations
   - Swift Testing：async 测试方法
   - Mock 依赖返回特定值

4. **UI 测试的优缺点？**
   - 优点：自动化回归测试、截图验证
   - 缺点：慢、脆弱、维护成本高
   - 策略：只测关键用户流程

5. **Fastlane 的核心组件？如何搭建 CI/CD？**
   - gym（构建）、scan（测试）、pilot（分发）、deliver（提交）
   - CI 平台选择：GitHub Actions / Bitrise / Xcode Cloud
   - 证书管理：match

### 面试回答模板

> "iOS 测试我采用金字塔策略。核心业务逻辑全部写单元测试（XCTest/Swift Testing），使用 Mock 隔离外部依赖。集成测试验证模块交互。UI 测试（XCUITest）只覆盖登录、注册、支付等关键路径。CI/CD 使用 Fastlane 自动化构建测试和分发，测试覆盖率目标 80% 以上。"

---

*本文档对标 Android `17_Testing/` 的深度，覆盖测试框架、CI/CD、覆盖率、最佳实践*
