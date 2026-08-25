# 05 ROS 2 安全架构（SROS2）

> **位置**：`08-ros / 03_高级话题 / 05_ROS2安全架构(SROS2).md`
> **难度**：⭐（高 —— 入门门槛高，面向进阶读者）
> **前置知识**：ROS 2 节点/话题基础、X.509 证书与公钥基础设施（PKI）基本概念、[01_ROS2架构分层详解](./01_ROS2架构分层详解.md)。
> **交叉引用**：[模块一 · 基础概念](../01_基础概念/README.md)、[06_RMW实现对比](./06_RMW实现对比(FastDDS_vs_CycloneDDS).md)。

---

## 1. 概述

ROS 1 在安全上几乎是"裸奔"：任何人只要能连上 ROS Master 就能发现并读写任意话题。ROS 2 的答案是 **SROS2**：基于 OMG **DDS-Security** 规范，为节点通信提供**身份认证、加密、访问控制**三件套。

本文讲清：威胁模型是什么、三件套在 SROS2 里如何开启、运行时如何实现"信任域隔离"、以及它与 ROS 1 的本质区别与典型部署。

---

## 2. 核心概念

### 2.1 威胁模型

- **不信任话题**：攻击者向控制话题（如 `/cmd_vel`）发布恶意指令。
- **恶意节点**：订阅隐私话题（如摄像头流、地图、定位），窃取数据。
- **中间人（MITM）**：拦截、篡改、重放节点间通信。

### 2.2 DDS-Security 三件套

| 插件 | 作用 | 底层手段 |
|---|---|---|
| **Authentication（身份认证）** | 证明"我是谁"，拒绝陌生节点 | X.509 证书 + 挑战-应答握手 |
| **Access Control（访问控制）** | 规定"我能读写哪些话题" | 签名的 permissions XML |
| **Cryptographic（加密）** | 保证机密性与完整性 | AES-GCM 加密 + 消息认证码（MAC） |

### 2.3 安全飞地（Enclave）与密钥库（Keystore）

- **Enclave**：一个节点的安全上下文，用路径标识（如 `/my_robot/nav_stack`），对应 keystore 里的一个子目录。
- **Keystore**：由 `create_keystore` 生成的目录树，内含**身份 CA、权限 CA** 与每个 enclave 的身份证书、权限文件。
- 多个节点可共享一个 enclave（共享同一套证书与权限）。

### 2.4 信任域（Trust Domain）

由"谁签发的 CA"界定：**只有身份证书由同一身份 CA 签发、权限由同一权限 CA 签发的节点**，才可能完成安全握手并通信。不同 CA = 不同信任域 = 无法互通。

---

## 3. 技术原理（架构 / 源码级）

### 3.1 SROS2 是"配置层"，安全引擎来自 DDS-Security 插件

SROS2 本身**不实现密码学**，它做两件事：

1. 生成并管理安全材料（CA、证书、权限文件）。
2. 通过环境变量/启动参数，把 enclave 路径传给 rmw，rmw 再转成 DDS 的 `PropertyPolicyQos`（安全属性），由 DDS-Security 插件（如 Fast DDS 的 security 插件）在握手时执行。

数据流（Fast DDS 视角）：

```
节点启动 → 读 enclave 目录（identity cert + permissions）
  → rmw_create_node 带上 security options
    → Fast DDS 创建带 Security 的 DomainParticipant
      → 发现阶段执行 Authentication 握手（证书验证 + 挑战应答）
        → 建立安全会话，协商密钥
          → 之后每条消息走 Cryptographic 插件（加密 + MAC）
            → 每次 take/publish 前检查 Access Control（permissions）
```

### 3.2 三件套的分工（源码级）

- **Authentication**：基于 DDS 内置认证，用 enclave 的私钥对随机挑战签名，对方用 CA 公钥验证证书链 → 建立身份。
- **Access Control**：`permissions.xml`（由权限 CA 签名）声明该 enclave 允许 publish/subscribe 的 topic 与 partition；运行时在 `DataWriter`/`DataReader` 创建与收发时校验。
- **Cryptographic**：协商出的会话密钥用 **AES-GCM** 加密载荷并生成 MAC，保证机密性 + 完整性 + 抗重放（带序列号）。

### 3.3 信任域隔离的运行时表现

- 节点 A（CA1 签发）与节点 B（CA2 签发）即使 domain id 相同、话题相同，也因证书链无法互相验证而**无法完成安全握手** → 发现阶段被拒 → 完全不可见、不可通。
- 这提供了比"改 domain id"更强的隔离：domain id 是公开可改的，CA 是密码学绑定的。

### 3.4 与 ROS 1 的对比

| 维度 | ROS 1 | ROS 2 + SROS2 |
|---|---|---|
| 身份认证 | 无（Master 不验证） | X.509 证书 |
| 数据加密 | 无 | AES-GCM |
| 访问控制 | 无（全靠自觉/网络隔离） | 签名的 permissions |
| 防 MITM | 无 | 证书 + MAC |

### 3.5 开销定性分析（⚠️ 数字待验证）

- **认证握手**：一次性成本（握手 + 密钥协商），发生在发现阶段。
- **每条消息加密**：AES-GCM 加解密是固定 CPU 开销，随消息大小线性增长；MAC 计算 + 附加认证标签增加每样本处理时间与少量带宽。
- 结论：安全是"花 CPU 换机密性"，高频大字段链路上开启加密的代价显著，需权衡（见 5 节"绝对不适用"）。

---

## 4. 实践指南

> ⚠️ sros2 命令行在不同 ROS 2 版本间有变化（`create_key` 在较新版本可能改名 `create_enclave`，并新增 `generate_policy`/`generate_artifacts`）。以下以 Humble 常用命令为主，**实际以 `ros2 security --help` 输出为准**。

### 4.1 安装

```bash
sudo apt install ros-<distro>-sros2 ros-<distro>-ros2cli
# 例如 sudo apt install ros-humble-sros2
```

### 4.2 生成密钥库与 enclave

```bash
# 1) 创建密钥库（内部自动生成身份 CA + 权限 CA）
ros2 security create_keystore demo_keystore

# 2) 为每个 enclave 生成身份证书/密钥（旧版命令）
ros2 security create_key demo_keystore /talker_listener/talker
ros2 security create_key demo_keystore /talker_listener/listener

# 3) 编写权限策略并生成权限文件（旧版命令）
#     policy.xml 见下方；生成签名的 permissions
ros2 security create_permission demo_keystore /talker_listener/talker policy_talker.xml
ros2 security create_permission demo_keystore /talker_listener/listener policy_listener.xml
```

### 4.3 权限策略文件（policy.xml 示例）

```xml
<policy version="0.2.0">
  <enclaves>
    <enclave path="/talker_listener/talker">
      <profiles>
        <profile ns="/" node="talker">
          <topics publish="ALLOW">chatter</topics>
          <topics subscribe="ALLOW">chatter</topics>
        </profile>
      </profiles>
    </enclave>
  </enclaves>
</policy>
```

### 4.4 运行带安全的节点

```bash
# 方式一：环境变量指定密钥库与 enclave
export ROS_SECURITY_KEYSTORE=demo_keystore
export ROS_SECURITY_ENABLE=true
export ROS_SECURITY_STRATEGY=Enforce      # Enforce 强制；Permissive 只告警
ros2 run demo_nodes_cpp talker --ros-args --enclave /talker_listener/talker

# 方式二：单次覆盖 enclave
export ROS_SECURITY_ENCLAVE_OVERRIDE=/talker_listener/talker
```

### 4.5 验证

```bash
# 用错误 enclave/无安全启动对方节点，观察发现失败
ros2 security list_enclaves demo_keystore   # 列出 enclave（较新版本）
ros2 node list                              # 跨信任域的节点应互不可见
```

---

## 5. 方案对比

| 方案 | 身份认证 | 加密 | 访问控制 | 成本 | 适用 |
|---|---|---|---|---|---|
| 无安全（默认） | ❌ | ❌ | ❌ | 0 | 内网封闭、非敏感 |
| SROS2 单 CA | ✅ | ✅ | ✅ | 中 | 单信任域内的机器人群 |
| SROS2 多 CA 分区 | ✅ 且分区隔离 | ✅ | ✅ | 中 | 多租户/多团队隔离 |
| 网关桥接（gateway/bridge） | ✅（跨域安全转发） | 视配置 | ✅ | 高 | 跨信任域受控数据交换 |

> **绝对不适用场景**：在**高频（kHz 级）、大字段（如图像/点云）且实时预算紧张**的链路上全局开启大字段加密——每条消息的 AES-GCM 加解密与 MAC 计算会显著抬升 CPU 与端到端延迟（具体幅度待验证），破坏实时性；应把加密限定在真正需要保密的控制/遥测链路上，或改走更细粒度的访问控制。

---

## 6. 工具链

- `ros2 security ...`（sros2 CLI）：create_keystore / create_key / create_permission / generate_policy / generate_artifacts / list_enclaves。
- `openssl x509 -in cert.pem -text -noout`：检查证书内容。
- `ros2 node list` / `ros2 topic list`：验证信任域隔离效果。
- Fast DDS security 插件日志：排查握手失败（需打开 DDS 日志）。
- `sros2` 仓库：<https://github.com/ros2/sros2>

---

## 7. 参考资料

- ROS 2 安全设计（enclaves）：<https://design.ros2.org/articles/ros2_security_enclaves.html>
- ROS 2 安全上下文设计（源码文档）：<https://github.com/ros2/design/blob/2729121fd69e1cca815557021641caf157d6d89d/articles/ros2_security_contexts.md>
- 官方安全教程（Jazzy）：<https://docs.ros.org/en/jazzy/Tutorials/Advanced/Security/Introducing-ros2-security.html>
- 密钥库说明：<https://docs.ros.org/en/ros2_documentation/rolling/Tutorials/Advanced/Security/The-Keystore.html>
- 部署指南：<https://github.com/ros2/ros2_documentation/blob/jazzy/source/Tutorials/Advanced/Security/Deployment-Guidelines.rst>
- sros2 仓库：<https://github.com/ros2/sros2>
- DDS-Security 规范（OMG）：<https://www.omg.org/spec/DDS-SECURITY/>（⚠️ 具体页面来源待验证，以 OMG 官网为准）

---

## 8. 学习路径

1. 先跑通 4.2~4.4 的 talker/listener 安全通信。
2. 用错误 enclave 启动一个节点，观察发现失败，理解信任域隔离。
3. 用 `openssl` 检查 keystore 里的证书链，理解"身份 CA 签身份、权限 CA 签权限"。
4. 尝试多 CA 分区（两个 keystore），验证互不可通，再引入网关桥接。
5. 结合 [06_RMW实现对比](./06_RMW实现对比(FastDDS_vs_CycloneDDS).md) 理解不同 RMW 对 DDS-Security 的支持差异。

---

## 9. 核心面试三问

1. **SROS2 的"身份认证、访问控制、加密"三件事，分别由 DDS-Security 的哪个插件负责？底层各用什么密码学手段？**
   → Authentication 用 X.509 证书做身份认证（挑战-应答 + 证书链验证）；Access Control 用权限 CA 签名的 permissions.xml 声明可读写话题；Cryptographic 用协商出的会话密钥做 AES-GCM 加密 + 消息认证码。

2. **两个节点 domain id 相同、话题相同，但身份证书由不同 CA 签发，它们能通信吗？为什么？**
   → 不能。安全握手阶段证书链无法互相验证，发现阶段即被拒绝，二者属于不同信任域。domain id 只是公开配置，CA 是密码学绑定的隔离边界。

3. **SROS2 的密码学计算发生在哪一层？为什么说它对高频大字段链路不友好？**
   → 发生在 DDS-Security 插件（如 Fast DDS security 插件），由 rmw 通过安全属性激活；每条消息都要走 AES-GCM 加解密 + MAC，CPU 开销随消息大小线性增长（具体数字待验证），高频大字段下会显著抬升延迟与 CPU，破坏实时预算。
