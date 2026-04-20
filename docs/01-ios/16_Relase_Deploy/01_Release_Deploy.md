# 01 - iOS 发布与部署全栈

## 目录

1. [发布流程概览](#1-发布流程概览)
2. [签名与证书](#2-签名与证书)
3. [描述文件 (Provisioning Profile)](#3-描述文件-provisioning-profile)
4. [构建配置](#4-构建配置)
5. [App Store 发布](#5-app-store-发布)
6. [TestFlight 分发](#6-testflight-分发)
7. [企业内部分发](#7-企业内部分发)
8. [发布流程对比](#8-发布流程对比)
9. [Fastlane 自动化](#9-fastlane-自动化)
10. [发布检查清单](#10-发布检查清单)
11. [面试考点汇总](#11-面试考点汇总)

---

## 1. 发布流程概览

### 1.1 iOS 分发方式对比

| 分发方式 | 适用场景 | 审核 | 证书类型 | 安装方式 |
|---|---|---|---|---|
| **App Store** | 公开应用 | ✅ 需要 | App Store | App Store 下载 |
| **TestFlight** | 内部/外部测试 | ✅ 需要 | Ad Hoc/Distribution | TestFlight App |
| **Ad Hoc** | 小范围测试 | ❌ 不需要 | Ad Hoc | 描述文件安装 |
| **Enterprise** | 企业内部 | ❌ 不需要 | Enterprise | 企业签名 |
| **App Link** | 直接安装 | ❌ 不需要 | Developer | HTTPS + manifest |

### 1.2 发布流程

```
iOS 发布流程：

┌─────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────┐
│ 代码完成 │───→│ 签名   │───→│ 构建   │───→│ 提交   │───→│ 分发/上架  │
│          │    │ 证书   │    │ Archive│    │ App Store│    │ TestFlight │
└─────────┘    └───────┘    └───────┘    └───────┘    └───────────┘

关键步骤：
1. 确保证书和描述文件有效
2. 配置正确的 Build Configuration (Release)
3. 设置正确的 Bundle Version 和 Build Number
4. 创建 Archive
5. 验证和提交
```

---

## 2. 签名与证书

### 2.1 证书类型

```
iOS 证书体系：

┌──────────────────────────────────────────────────────┐
│                 Apple 证书类型                          │
├────────────────────┼────────────────────┬─────────────┤
│  证书类型          │  用途               │  有效期     │
├────────────────────┼────────────────┬──┼──────────────┤
│  Apple Development │ 开发调试        │  1年      │
│  Apple Distribution│ App Store 发布  │  1年      │
│  Ad Hoc Distribution│ 内部测试(最多100台)| 1年      │
│  In-House (Enterprise)│ 企业内部分发  │  3年      │
│  Developer ID       │ Mac App Store   │  1年      │
│  Web Distribution   │ Web 推送证书    │  1年      │
└───────────────────┴───────────────┴──┴─────────────┘
```

### 2.2 证书管理

```
证书管理方式：

┌──────────────┬────────────────────┬──────────────────────┐
│ 管理方式      │  优势               │  劣势                 │
├──────────────┼────────────────┬──┼─────────────────────┤
│ 手动管理      │ 简单直接         │ 容易过期、难同步      │
│ Xcode Autom. │ 自动化           │ 配置复杂              │
│ Fastlane+m.  │ 全自动化         │ 需学习成本            │
│ Xcode Cloud  │ Apple 原生       │ 平台锁定              │
│ Cert + sigh  │ Fastlane 工具链  │ 独立工具              │
└──────────────┴────────────────────┴──┴─────────────────────┘
```

---

## 3. 描述文件 (Provisioning Profile)

### 3.1 描述文件组成

```
Provisioning Profile 结构：

┌──────────────────────────────────────────┐
│          Provisioning Profile             │
├───────────────────┬──────────────────┬──┤
│  Team ID          │  App ID          │  │
│  Certificate IDs  │  Device IDs      │  │
│  Entitlements     │  Expiration Date │  │
│  Profile UUID     │  Name            │  │
└───────────────────┴─────────────────┴──┘

Profile 类型：
• Development Profile: 开发调试，绑定开发证书 + 设备
• Distribution Profile: App Store 发布，绑定分发证书
• Ad Hoc Profile: 内部测试，最多 100 台设备
• In-House Profile: 企业分发，绑定企业证书
```

### 3.2 App ID 与 Entitlements

```
App ID 配置：
├── Bundle ID (反向域名格式)
├── Capabilities:
│   ├── App Groups
│   ├── Associated Domains
│   ├── Game Center
│   ├── Hotspot Helper
│   ├── Identity Service
│   ├── In-App Purchase
│   ├── MapKit
│   ├── Push Notifications
│   ├── Safari SSO
│   └── Wireless Accessory Configuration
└── Entitlements (权限声明)
```

---

## 4. 构建配置

### 4.1 Xcode Build Configuration

```
Xcode 构建配置：

┌───────────┬───────────────┬───────────────────┐
│ 配置项     │  Debug        │  Release          │
├───────────┼───────────────┼───────────────────┤
│ 优化级别   │ No Optimization│ Optimize Size    │
│ DEBUG      │ YES           │ NO                │
│ NSAssert   │ Enabled       │ Disabled          │
│ 符号表     │ 完整          │ 剥离              │
│ 死代码剥离  │ 否           │ 是 (Dead Code Stripping) │
│ 归档文件   │ .dSYM 生成    │ .dSYM 生成       │
│ IPD        │ 禁用          │ 启用 (Instrumentation Profiling) │
└───────────┴───────────────┴───────────────────┘
```

### 4.2 Archive 流程

```
Archive 创建流程：

Product → Archive → Distribute App

分发选项：
├── App Store Connect (上传到 App Store)
├── App Store Distribution (提交到 App Store)
├── Ad Hoc (导出 .ipa + 描述文件)
├── Enterprise (企业签名分发)
├── Development (开发调试)
└── Custom (自定义签名配置)
```

---

## 5. App Store 发布

### 5.1 App Store Connect 流程

```
App Store Connect 流程：

┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ 创建 App     │───→│ 填写元数据    │───→│ 上传构建版本  │
│ (App Store)  │    │ (名称/描述等) │    │ (Xcode/Fastlane) │
└─────────────┘    └─────────────┘    └────────┬────┘
                                                │
┌─────────────┐    ┌──────────────┐    ┌────────┐
│ 管理版本     │←───│ 审核结果     │←───│ Apple审核│
│ (发布/下架)  │    │ (通过/拒绝)  │    │ (1-14天) │
└─────────────┘    └─────────────┘    └─────────┘
```

### 5.2 提交元数据

| 字段 | 说明 | 要求 |
|---|---|---|
| App 名称 | 最多 30 字符 | 唯一性 |
| 副标题 | 最多 30 字符 | 可选 |
| 描述 | 应用描述 | 至少 75 字符 |
| 关键词 | 搜索关键词 | 最多 100 字符 |
| 分类 | 主要/次要分类 | 必须 |
| 年龄分级 | 内容分级 | 必须 |
| 定价 | 免费版/付费 | 必须 |
| 版权 | © 年份+公司 | 可选 |
| 支持 URL | 技术支持页面 | 必须 |
| 营销 URL | 营销落地页 | 可选 |

### 5.3 App Review 指南要点

| 类别 | 常见拒绝原因 |
|---|---|
| GC_1.1 | 功能不完整/崩溃 |
| GC_2.1 | 元数据不准确 |
| GC_5.1.1 | 内购类型错误 |
| GC_5.2.1 | 链接到外部付款 |
| GC_5.3.1 | 缺失隐私政策 |
| GC_5.4.1 | 广告 SDK 违规 |
| GC_7.1.1 | 未提供测试账号 |

---

## 6. TestFlight 分发

### 6.1 TestFlight 类型

| 类型 | 人数限制 | 审核 | 适用场景 |
|---|---|---|---|
| 内部测试 | 最多 100 人 | ❌ | 团队成员 |
| 外部测试 | 最多 10,000 人 | ✅ | 外部用户 |

### 6.2 TestFlight 流程

```
TestFlight 分发流程：

Developer Portal → 创建测试组
    ↓
Xcode → 上传构建版本
    ↓
App Store Connect → 选择构建版本 → 提交审核
    ↓
审核通过 → 邀请测试者
    ↓
测试者安装 TestFlight App → 测试应用
    ↓
收集反馈 → 修复问题 → 重新构建 → 重复
```

---

## 7. 企业内部分发

### 7.1 企业签名流程

```
企业签名发布流程：

┌─────────────┐    ┌────────┐    ┌────────┐
│ 企业证书     │───→│ 构建 .ipa│───→│ 上传到  │
│ (In-House)  │    │  Archive│    │ HTTPS  │
└─────────────┘    └───┬───┘    └────┬───┘
                       │              │
              ┌────────┴───┐    ┌──────┴──────┐
              │ manifest.plist │  │ 用户点击链接  │
              │ (安装配置)   │    │ 安装到设备   │
              └─────────────┘    └─────────────┘

manifest.plist 格式：
{
    "items": [{
        "assets": [{
            "kind": "software-package",
            "url": "https://example.com/app.ipa"
        }],
        "metadata": {
            "bundle-identifier": "com.example.app",
            "version": "1.0",
            "title": "My Enterprise App"
        }
    }]
}

用户安装链接：
<a href="itms-services://?action=download-manifest&url=https://example.com/manifest.plist">
    安装应用
</a>
```

---

## 8. 发布流程对比

| 维度 | App Store | TestFlight | Ad Hoc | Enterprise |
|---|---|---|---|---|
| 审核时间 | 1-14 天 | 1-14 天 | 即时 | 即时 |
| 设备限制 | 无 | 10,000 人 | 100 台 | 无限制 |
| 成本 | 免费（开发者 $99/年） | 免费 | 免费 | $299/年 |
| 更新频率 | 每 7 天 1 次构建 | 每 7 天 1 次 | 每 7 天 1 次 | 每 7 天 1 次 |
| 安装方式 | App Store | TestFlight App | 描述文件 | manifest 链接 |
| 自动更新 | ✅ | ✅ | ✅ | ✅ |
| 适用阶段 | 正式发布 | UAT/测试 | 内部测试 | 企业部署 |

---

## 9. Fastlane 自动化

### 9.1 Fastlane 发布脚本

```ruby
# Fastfile - 发布流程自动化

platform :ios do
  desc "Deploy a new version to the App Store"
  lane :release do
    # 1. 证书管理
    match(type: "app_store", readonly: false)
    
    # 2. 构建
    gym(
      scheme: "MyApp",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "com.example.app" => "MyApp App Store"
        }
      }
    )
    
    # 3. 提交到 App Store
    deliver(
      force: true,
      skip_screenshots: false,
      skip_metadata: false,
      submit_for_review: true
    )
  end
  
  desc "Submit to TestFlight"
  lane :beta do
    match(type: "adhoc")
    gym(scheme: "MyApp", export_method: "adhoc")
    pilot(
      distribution: "internal",
      beta_app_description: "Beta build for testing"
    )
  end
  
  desc "Enterprise deployment"
  lane :enterprise do
    match(type: "in_house")
    gym(scheme: "MyApp", export_method: "enterprise")
    
    # 生成 manifest.plist
    sigh(
      app_identifier: "com.example.app",
      provisioning_name: "MyApp Enterprise"
    )
  end
end
```

---

## 10. 发布检查清单

### 10.1 发布前检查

```
发布前检查清单：

□ 版本号更新 (CFBundleShortVersionString)
□ 构建号递增 (CFBundleVersion)
□ Bundle ID 正确
□ 签名配置正确 (Certificate + Provisioning Profile)
□ 图标和启动图更新
□ 隐私政策 URL 设置
□ App Icon 所有尺寸
□ 截图更新 (所有设备尺寸)
□ 内购项目创建并审核通过
□ App Store 元数据填写
□ 测试账号准备 (如需要)
□ 构建配置为 Release
□ 死代码剥离开启
□ 符号表 .dSYM 保留
□ CI/CD Pipeline 通过
□ Beta 测试无严重 Bug
□ 证书/Profile 未过期
□ 目标设备兼容测试通过
```

---

## 11. 面试考点汇总

### 高频面试题

1. **iOS 应用的签名流程是什么？**
   - 开发者签名 → 打包签名 → 验证签名
   - 证书 + 描述文件 + App ID 三者匹配
   - 签名确保代码完整性

2. **App Store 审核被拒怎么办？**
   - 分析拒绝原因，对照 App Review Guidelines
   - 修复问题后重新提交，附注说明
   - 常见原因：功能不完整、元数据错误、内购违规

3. **TestFlight 和 Ad Hoc 的区别？**
   - TestFlight：最多 10,000 人，需要审核，通过 App 安装
   - Ad Hoc：最多 100 台设备，不需要审核，通过描述文件安装

4. **企业签名的风险？**
   - 证书可能被 Apple 撤销
   - 应用被分发到非目标用户
   - 安全风险：代码可被反编译和篡改

5. **Bundle ID 和 Bundle Version 的作用？**
   - Bundle ID：应用唯一标识，与 App ID 匹配
   - Bundle Version：内部版本号，每次构建必须递增
   - CFBundleShortVersionString：对外版本号

### 面试回答模板

> "iOS 发布我使用 Fastlane 自动化。证书管理用 match，构建用 gym，提交到 App Store 用 deliver。TestFlight 用 pilot 分发。每次发布前检查清单确保版本号、签名、配置正确。审核被拒时对照 Guidelines 逐条修复。"

---

*本文档对标 Android `16_Release_Deploy/` 的深度*
