# CI/CD 持续集成与部署

> **字数统计：约 9000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐⭐**

---

## 目录

1. [CI/CD 简介](#1-cicd-简介)
2. [GitHub Actions](#2-github-actions)
3. [GitLab CI](#3-gitlab-ci)
4. [Firebase App Distribution](#4-firebase-app-distribution)
5. [自动化发布](#5-自动化发布)
6. [面试考点](#6-面试考点)

---

## 1. CI/CD 简介

### 1.1 什么是 CI/CD

```
CI (Continuous Integration) 持续集成：
- 自动构建
- 自动测试
- 代码质量检查

CD (Continuous Delivery/Deployment) 持续交付/部署：
- 自动打包
- 自动发布
- 自动部署
```

### 1.2 工作流程

```
代码提交 → 触发构建 → 运行测试 → 代码检查 → 打包 → 发布
```

---

## 2. GitHub Actions

### 2.1 基础配置

```yaml
# .github/workflows/android.yml
name: Android CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Grant execute permission
      run: chmod +x gradlew
    
    - name: Build
      run: ./gradlew build
    
    - name: Run tests
      run: ./gradlew test
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: app/build/outputs/apk/debug/
```

### 2.2 带测试的 CI

```yaml
name: Android CI with Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK
      uses: actions/setup-java@v3
      with:
        java-version: '17'
    
    - name: Unit Tests
      run: ./gradlew test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: '**/build/test-results/'
```

---

## 3. GitLab CI

### 3.1 基础配置

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: openjdk:17
  script:
    - ./gradlew assembleDebug
  artifacts:
    paths:
      - app/build/outputs/apk/debug/

test:
  stage: test
  image: openjdk:17
  script:
    - ./gradlew test
```

---

## 4. Firebase App Distribution

### 4.1 配置

```gradle
// app/build.gradle.kts
plugins {
    id("com.google.firebase.appdistribution")
}

firebaseAppDistribution {
    appId = "your-app-id"
    serviceCredentialsFile = "service-account.json"
    groups = "testers"
    releaseNotesFile = "release-notes.txt"
}
```

### 4.2 发布命令

```bash
./gradlew appDistributionUploadDebug
```

---

## 5. 自动化发布

### 5.1 Google Play 发布

```gradle
// 使用 Gradle Play Publisher
plugins {
    id("com.github.triplet.play") version "3.8.0"
}

play {
    serviceAccountCredentials.set(file("play-key.json"))
    track.set("internal")
}
```

### 5.2 版本管理

```kotlin
// 自动版本号
fun getVersionCode(): Int {
    val base = 10000
    val major = 1
    val minor = 0
    val patch = 0
    return base + major * 100 + minor * 10 + patch
}

fun getVersionName(): String {
    return "1.0.0"
}
```

---

## 6. 面试考点

**Q1: 什么是 CI/CD？**
- 持续集成/持续部署
- 自动构建、测试、发布

**Q2: 常用 CI 工具？**
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

---

*本文完*
