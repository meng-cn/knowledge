# 01 - iOS 安全全栈

## 目录

1. [iOS 安全架构](#1-ios-安全架构)
2. [Keychain 安全存储](#2-keychain-安全存储)
3. [生物识别认证](#3-生物识别认证)
4. [App Transport Security (ATS)](#4-app-transport-security-ats)
5. [数据加密](#5-数据加密)
6. [代码保护](#6-代码保护)
7. [权限管理](#7-权限管理)
8. [安全最佳实践](#8-安全最佳实践)
9. [安全与 Android 对比](#9-安全与-android-对比)
10. [面试考点汇总](#10-面试考点汇总)

---

## 1. iOS 安全架构

### 1.1 iOS 安全层级

```
iOS 安全体系分层：

┌─────────────────────────────────────────────────────────┐
│  应用层安全                                          │
│  (Keychain / 生物识别 / App 签名)                     │
├─────────────────────────────────────────────────────────┤
│  数据层安全                                          │
│  (File System Encryption / 数据保护 API)              │
├─────────────────────────────────────────────────────────┤
│  网络层安全                                          │
│  (ATS / TLS / SSL Pinning / 证书校验)                 │
├─────────────────────────────────────────────────────────┤
│  系统层安全                                          │
│  (App Sandbox / Code Signing / Gatekeeper / SIP)      │
├─────────────────────────────────────────────────────────┤
│  硬件层安全                                          │
│  (Secure Enclave / TEE / 硬件级加密)                  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 关键安全组件

| 组件 | 功能 | 安全等级 |
|---|---|---|
| Secure Enclave | 硬件级加密密钥/生物识别 | ⭐⭐⭐⭐⭐ |
| Keychain | 安全密钥存储 | ⭐⭐⭐⭐⭐ |
| Code Signing | 代码完整性验证 | ⭐⭐⭐⭐ |
| App Sandbox | 应用隔离 | ⭐⭐⭐⭐ |
| Data Protection | 文件系统加密 | ⭐⭐⭐⭐ |
| App Transport Security | 网络传输安全 | ⭐⭐⭐ |

---

## 2. Keychain 安全存储

### 2.1 Keychain 架构

```
Keychain 存储原理：

┌──────────────────────────────────────────────────────┐
│                    Keychain                            │
├──────────────────────────────────────────────────────┤
│  Secure Enclave (硬件加密)                             │
│  ↓                                                    │
│  Keychain Services (API)                               │
│  ↓                                                    │
│  Keychain Item (数据项)                                │
│  - kSecClassGenericPassword                          │
│  - kSecClassInternetPassword                         │
│  - kSecClassCertificate                              │
│  - kSecClassKey                                      │
└──────────────────────────────────────────────────────┘

Keychain 特点：
• 数据存储在加密数据库中，受设备唯一密钥保护
• 即使文件系统被破解，数据也无法读取
• 支持 App Group 共享 Keychain 数据
• 可设置访问权限（认证要求/过期时间/设备类型）
```

### 2.2 Keychain 读写

```swift
import Security

class KeychainService {
    
    private let service: String
    
    init(service: String) {
        self.service = service
    }
    
    // MARK: - 保存数据
    
    func save(_ data: Data, forKey key: String) -> Bool {
        // 先尝试删除已有数据
        delete(forKey: key)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
            kSecUseDataProtectionKeychain as String: true
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    // MARK: - 读取数据
    
    func load(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }
        return data
    }
    
    // MARK: - 删除数据
    
    func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

// 访问权限选项
// kSecAttrAccessibleWhenUnlocked     - 解锁时可用
// kSecAttrAccessibleAfterFirstUnlock - 首次解锁后可用
// kSecAttrAccessibleAlways           - 始终可用（不安全）
// kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly - 需面容/指纹
// kSecAttrAccessibleWhenUnlockedThisDeviceOnly - 解锁时仅限本机
```

### 2.3 Keychain Access Groups（共享）

```swift
// App Group Keychain 共享
// 1. 在 Apple Developer Portal 创建相同 App ID Prefix 的 Bundle ID
// 2. 在 Xcode 中开启相同 App Group
// 3. Keychain Access Groups 添加 Group ID

func sharedKeychain(key: String) -> String? {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecAttrAccessGroup as String: "ABCD1234.com.example.group",
        kSecReturnData as String: true,
        kSecMatchLimit as String: kSecMatchLimitOne
    ]
    
    var result: AnyObject?
    SecItemCopyMatching(query as CFDictionary, &result)
    return (result as? Data)?.utf8String
}
```

---

## 3. 生物识别认证

### 3.1 LocalAuthentication 框架

```
生物识别认证流程：

┌───────┐     ┌──────────────┐     ┌───────────┐
│ 检查可用性 │──→│ 展示认证 UI   │──→│ 认证成功  │
│ (canEvaluate)│     │ (LAContext)  │     │ 返回 token │
└───────┘     └──────────────┘     └───────────┘

支持类型：
• LAContext.deviceOwnerType == .unknown    → 未设置
• LAContext.deviceOwnerType == .faceID     → 面容 ID
• LAContext.deviceOwnerType == .touchID    → 指纹 ID
• LAContext.deviceOwnerType == .notAvailable → 不支持
```

### 3.2 生物识别实现

```swift
import LocalAuthentication

class BiometricAuthenticator {
    
    enum AuthenticationResult {
        case success(token: String)
        case failed(Error)
        case unavailable
    }
    
    static func authenticate(
        reason: String = "需要身份验证",
        completion: @escaping (AuthenticationResult) -> Void
    ) {
        let context = LAContext()
        var error: NSError?
        
        // 检查是否支持
        guard context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        ) else {
            completion(.unavailable)
            return
        }
        
        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        ) { success, evaluationError in
            DispatchQueue.main.async {
                if success {
                    // 生成访问 token
                    let token = Self.generateToken()
                    completion(.success(token: token))
                } else {
                    completion(.failed(evaluationError ?? NSError()))
                }
            }
        }
    }
    
    static func generateToken() -> String {
        // 认证成功后可安全访问敏感数据
        return UUID().uuidString
    }
}

// 使用
BiometricAuthenticator.authenticate(reason: "验证身份以访问数据") { result in
    switch result {
    case .success(let token):
        // 使用 token 访问 Keychain 数据
    case .failed(let error):
        print("认证失败: \(error.localizedDescription)")
    case .unavailable:
        // 显示其他登录方式
    }
}
```

### 3.3 Face ID / Touch ID 配置

```
Info.plist 配置：
├── NSFaceIDUsageDescription
│   "需要使用面容 ID 验证您的身份"
├── NSTouchIDUsageDescription
│   "需要使用指纹 ID 验证您的身份"
└── LSSupportsSheetAppearance
    → true (macOS)
```

---

## 4. App Transport Security (ATS)

### 4.1 ATS 默认安全策略

```
ATS 默认要求：
• 必须使用 TLS 1.2 或更高版本
• 证书必须使用 SHA-256 哈希
• 公钥：RSA ≥ 2048 位，ECC ≥ 256 位
• 协议：TLS 1.2+，不支持 SSL
• 不支持自签名证书
• 不支持 HTTP 明文传输
```

### 4.2 ATS 配置

```xml
<!-- Info.plist 中配置 ATS -->
<key>NSAppTransportSecurity</key>
<dict>
    <!-- 全局允许 HTTP（不推荐） -->
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    
    <!-- 为特定域名设置例外 -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>example.com</key>
        <dict>
            <!-- 允许 HTTP -->
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <!-- 包含子域名 -->
            <key>NSIncludesSubdomains</key>
            <true/>
            <!-- 最小 TLS 版本 -->
            <key>NSTemporaryExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
            <!-- 允许弱加密套件 -->
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### 4.3 SSL Pinning

```swift
// SSL Pinning - 证书绑定
class SSLPinningSession: NSObject, URLSessionDelegate {
    
    private let session: URLSession
    
    init() {
        let delegate = self
        self.session = URLSession(configuration: .default,
                                  delegate: delegate,
                                  delegateQueue: nil)
    }
    
    func urlSession(_ session: URLSession,
                    didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition,
                                                   URLCredential?) -> Void) {
        guard let serverTrust = challenge.protectionSpace.serverTrust,
              let cert = SecTrustCopyCertificateChain(serverTrust)?.first
        else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        
        // 绑定预期证书
        if isPinnedCertificate(cert) {
            let credential = URLCredential(trust: serverTrust)
            completionHandler(.useCredential, credential)
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
    
    private func isPinnedCertificate(_ cert: SecCertificate) -> Bool {
        // 加载本地绑定的证书
        guard let pinPath = Bundle.main.path(
            forResource: "server", ofType: "der"),
            let pinData = FileManager.default.contents(atPath: pinPath),
            let pinCert = SecCertificateCreateWithData(nil, pinData as CFData)
        else { return false }
        
        // 比较证书
        let serverData = SecCertificateCopyData(cert) as Data
        let pinData = SecCertificateCopyData(pinCert) as Data
        return serverData.isEqual(pinData)
    }
}
```

---

## 5. 数据加密

### 5.1 数据保护 API

```
文件数据保护级别：

┌─────────────────────────────────────────────┐
│  数据保护级别                                │
├─────────────────────────────────────────────┤
│ NSFileProtectionComplete                     │
│   设备锁定后不可访问                         │
│   (默认，推荐用于敏感数据)                    │
├─────────────────────────────────────────────┤
│ NSFileProtectionCompleteUnlessOpen           │
│   文件打开时可访问，锁定后下次打开不可访问     │
├─────────────────────────────────────────────┤
│ NSFileProtectionCompleteUntilFirstUserAuth   │
│   首次用户认证后可访问                         │
├─────────────────────────────────────────────┤
│ NSFileProtectionNone                         │
│   无保护（不推荐用于敏感数据）                │
└─────────────────────────────────────────────┘

应用层：
NSFileProtectionComplete → 文件级保护
UISceneConfiguration → 场景级保护
```

### 5.2 CryptoKit 加密

```swift
import CryptoKit

// AES-GCM 对称加密
func encrypt(plaintext: String, key: SymmetricKey) -> (ciphertext: Data, sealedBox: SealedBox)? {
    guard let data = plaintext.data(using: .utf8) else { return nil }
    
    let sealedBox = try? SymmetricKey(size: .bits256)
        .sealed(to: data)
    return (sealedBox.combined, sealedBox)
}

func decrypt(sealedBox: SealedBox, key: SymmetricKey) -> String? {
    guard let decrypted = try? sealedBox.open(using: key) else { return nil }
    return String(data: decrypted, encoding: .utf8)
}

// 生成密钥并存储到 Keychain
let key = SymmetricKey(size: .bits256)
let keyData = key.withUnsafeBytes { Data($0) }
// 将 keyData 存入 Keychain

// SHA-256 哈希
let message = "hello world"
let hash = SHA256.hash(data: message.utf8)
let hexHash = hash.compactMap { String(format: "%02x", $0) }.joined()

// HMAC
let hmac = HMAC<SHA256>.authenticationCode(
    for: message.utf8,
    using: key
)
```

### 5.3 密码哈希

```swift
// 密码存储不应使用可逆加密，应使用哈希
func hashPassword(_ password: String) -> String {
    // 推荐使用 Argon2 或 bcrypt
    // iOS 可使用 CommonCrypto
    // 生产环境推荐第三方库
    return "使用 Argon2/bcrypt 哈希密码"
}
```

---

## 6. 代码保护

### 6.1 代码签名与验证

```
代码签名流程：

┌────────┐    ┌────────┐    ┌────────┐    ┌──────┐
│ 开发者  │──→│ 签名证书 │──→│ App 打包 │──→│ Gate │
│ 证书    │    │ 签名     │    │ .app    │    │ keeper │
└────────┘    └────────┘    └───────┘    └──────┘

Gatekeeper 验证：
1. 检查代码签名签名
2. 验证签名者身份（Apple 认证）
3. 检查 App Store 公证（Notarization）
4. 验证 App Sandbox 配置
```

### 6.2 Jitter / Obfuscation

```
代码混淆策略：

┌───────────┬───────────────────────────┐
│ 混淆类型    │ 方法                       │
├───────────┼───────────────────────────┤
│ 类名混淆   │ 使用外部工具（如 Obfuscator-LLVM）│
│ 字符串混淆 │ Runtime 解密字符串             │
│ 控制流混淆 │ 插入无意义分支                   │
│ 函数调用   │ 符号化/非符号化                  │
│ 调试检测   │ 反调试代码                     │
└───────────┴───────────────────────────┘
```

### 6.3 防调试检测

```swift
// 调试检测
func isDebuggerAttached() -> Bool {
    var info = kinfo_ctl()
    var size = MemoryLayout<kinfo_proc>.size
    let name = "sys.procinfo"
    var nameBytes = name.utf8 + [0]
    let result = sysctl(&nameBytes, 2, &info, &size, nil, 0)
    guard result == 0 else { return false }
    
    let pids = UnsafeMutablePointer<kinfo_proc>.allocate(capacity: 1)
    pids.pointee = info
    let pid = pids.pointee.kp_proc.p_flag & P_TRACED
    pids.deallocate()
    return pid != 0
}

// 反调试
func antiDebug() {
    if isDebuggerAttached() {
        // 终止 app 或上报
        exit(1)
    }
}
```

---

## 7. 权限管理

### 7.1 iOS 权限类型

```
iOS 权限分类：

┌──────────────────────────────────────────┐
│              权限类型                        │
├──────────────────────────────────────────┤
│ 隐私权限（Info.plist 声明）                  │
│ • Camera         - 相机                    │
│ • Photos         - 照片库                   │
│ • Location       - 定位                     │
│ • Microphone     - 麦克风                    │
│ • Bluetooth      - 蓝牙                    │
│ • Notification   - 通知                    │
│ • Calendar       - 日历                    │
│ • Contacts       - 通讯录                   │
│ • Health         - 健康                    │
│ • HomeKit        - HomeKit                  │
├──────────────────────────────────────────┤
│ 框架权限（运行时请求）                        │
│ • AVAudioSession.requestPermission()     │
│ • PHPhotoLibrary.requestAuthorization() │
│ • CLLocationManager.requestWhenInUseAuthorization() │
│ • CNContactStore.requestAccess(for:)     │
└─────────────────────────────────────────┘
```

### 7.2 权限请求

```swift
// 相机权限
func requestCameraPermission() {
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized:
        startCamera()
    case .notDetermined:
        AVCaptureDevice.requestAccess(for: .video) { granted in
            if granted { startCamera() }
        }
    case .denied, .restricted:
        showSettingsAlert()
    @unknown default:
        break
    }
}

// 照片权限（iOS 14+ 分級別）
func requestPhotoPermission() {
    PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
        switch status {
        case .limited, .authorized:
            // 有权限
        case .denied, .restricted:
            // 无权限
        default:
            break
        }
    }
}

// 健康数据
func requestHealthPermission() {
    let healthKitTypes: Set<HKType> = [
        HKObjectType.workoutType(),
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
    ]
    
    HKHealthStore().requestSharePermission(for: healthKitTypes) { granted, error in
        // 结果处理
    }
}
```

---

## 8. 安全最佳实践

### 8.1 安全检查清单

```
iOS 安全检查清单：

□ App 签名正确（非开发模式）
□ ATS 配置正确（不随意关闭）
□ 敏感数据存 Keychain（不存 UserDefaults）
□ Keychain 数据设置正确访问权限
□ 密码使用哈希（非明文/可逆加密）
□ SSL Pinning 用于关键 API
□ 敏感数据不在内存中残留（使用 SecureString）
□ 生物识别需要 Face ID/Touch ID
□ 不硬编码密钥/证书
□ 不保存用户密码
□ Info.plist 权限声明完整
□ 日志中不输出敏感信息
□ HTTPS 验证证书
□ 不存储敏感数据到 UserDefaults
□ 使用 UISecureTextField 输入密码
□ 禁用自动补全（autocorrection = false）
□ 剪贴板清除（粘贴后清除敏感数据）
□ App Group 中 Keychain 共享安全
□ 定期更新依赖库安全补丁
```

### 8.2 安全编码规则

| 规则 | 说明 | 示例 |
|---|---|---|
| 不硬编码密钥 | 密钥放 Keychain 或服务器 | ❌ `"let apiKey = "xxx""` |
| 不存密码到本地 | 使用 Keychain | ❌ `UserDefaults.standard.set(pwd, forKey: "pwd")` |
| 使用 HTTPS | 传输加密 | ATS 强制 HTTPS |
| 验证服务器 | SSL Pinning | 证书绑定 |
| 最小权限 | 只请求需要的权限 | 按需请求 |
| 输入验证 | 防止注入攻击 | URL/SQL/命令验证 |
| 日志脱敏 | 不记录敏感信息 | 替换 Token/密码 |
| 内存清理 | 使用后清除 | `memset` 敏感内存 |

---

## 9. 安全与 Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 密钥存储 | Keychain | Keystore |
| 生物识别 | LocalAuthentication | BiometricPrompt |
| 应用沙盒 | App Sandbox | App Sandbox (UID/GID) |
| 代码签名 | 强制签名 | 签名（APK/AAB） |
| 传输安全 | ATS | Network Security Config |
| 加密 | CryptoKit | AndroidKeystore + Jetpack Security |
| 权限 | Info.plist 声明 + 运行时 | AndroidManifest + runtime |
| 系统级安全 | Secure Enclave | Trusted Execution Environment (TEE) |
| 反调试 | sysctl / ptrace | ptrace / /proc/self |
| 代码混淆 | Obfuscator-LLVM | ProGuard/R8 |

---

## 10. 面试考点汇总

### 高频面试题

1. **Keychain 的安全性如何保证？**
   - 存储在系统加密数据库中，受设备唯一密钥保护
   - 数据加密存储在 Secure Enclave
   - 即使文件系统被破解，数据也无法读取
   - 支持设置访问权限（认证要求/过期时间）

2. **生物识别的实现流程？**
   - LocalAuthentication 框架
   - 检查设备是否支持
   - 展示认证界面
   - 成功后可安全访问 Keychain 数据

3. **ATS 的作用和安全配置？**
   - 强制 HTTPS 传输
   - TLS 1.2+ 要求
   - 通过 Info.plist 配置例外
   - 不推荐关闭 ATS

4. **SSL Pinning 的原理？**
   - 绑定服务器证书公钥
   - 在 URLSessionDelegate 中验证
   - 防止中间人攻击
   - 证书不匹配时断开连接

5. **iOS 数据加密有哪些方式？**
   - CryptoKit（AES-GCM, SHA-256, HMAC）
   - 数据保护 API（文件级）
   - Keychain（密钥/凭证）
   - CommonCrypto（C API）

6. **安全最佳实践？**
   - 敏感数据存 Keychain
   - 密码用哈希
   - ATS 强制 HTTPS
   - 按需请求权限
   - 代码混淆/反调试

### 面试回答模板

> "iOS 安全核心是 Keychain 存储敏感数据，Secure Enclave 硬件加密。生物识别用 LocalAuthentication，ATS 强制网络加密。数据用 CryptoKit 加密，密码用哈希。安全最佳实践：不硬编码密钥、不存密码到 UserDefaults、最小权限原则、定期更新依赖。"

---

*本文档对标 Android `25_Security` 的深度*
