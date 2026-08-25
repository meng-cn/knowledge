# 06 RMW 实现对比（Fast DDS vs Cyclone DDS）

> **位置**：`08-ros / 03_高级话题 / 06_RMW实现对比(FastDDS_vs_CycloneDDS).md`
> **难度**：⭐（高 —— 入门门槛高，面向进阶读者）
> **前置知识**：[01_ROS2架构分层详解](./01_ROS2架构分层详解.md)（rmw 抽象层）、DDS 基本概念。
> **交叉引用**：[模块二 · 核心模块](../02_核心模块/README.md)、[04_组件化与进程内通信](./04_组件化与进程内通信.md)、[05_ROS2安全架构(SROS2)](./05_ROS2安全架构(SROS2).md)。

---

## 1. 概述

ROS 2 最"实用"的设计之一，是同一套上层代码可以在不同 DDS 中间件上运行，只需切换一个环境变量。当前生态里最主流的两家是：

- **Fast DDS**（eProsima 公司维护，`rmw_fastrtps_cpp`）——多数发行版的**默认 RMW**。
- **Cyclone DDS**（Eclipse Cyclone DDS 项目维护，`rmw_cyclonedds_cpp`）——以轻量、低延迟著称的强有力竞争者。

本文讲清：rmw 抽象层如何屏蔽差异、两家的真实差异（实现/特性/平台/性能）、TSC 报告怎么看、以及如何切换与选型。

---

## 2. 核心概念

### 2.1 rmw 抽象层如何"屏蔽差异"

上层（rcl/rclcpp）只依赖 `rmw_*` C 接口与 `rmw_qos_profile_t` 等结构体；"怎么实现发现、怎么传输、怎么映射 QoS"完全由具体 RMW 决定。因此：

- **接口相同**：`rmw_publish`、`rmw_take`、`rmw_wait`、`rmw_create_node` 等函数签名一致。
- **调优参数不同**：性能相关的配置（共享内存、缓冲区、发现方式）不在 rmw 接口里，而在**各自的配置机制**中（Fast DDS 的 XML Profile，Cyclone DDS 的 XML 配置）。

### 2.2 RMW_IMPLEMENTATION

运行时选择加载哪个 RMW 的环境变量，取值如：

- `rmw_fastrtps_cpp`（Fast DDS，静态类型）
- `rmw_fastrtps_dynamic_cpp`（Fast DDS，动态类型）
- `rmw_cyclonedds_cpp`（Cyclone DDS）
- `rmw_connextdds`（RTI Connext，商业）

### 2.3 QoS 映射的差异

同一 ROS QoS（Reliability / Durability / History / Deadline / Liveliness）在两家的 DDS QoS 映射大致对应，但**边界语义**（如 deadline 触发、liveliness lease 默认值、transient-local 与 volatile 的细节）存在差异，这是"换 RMW 后行为略有不同"的常见来源。

---

## 3. 技术原理（架构 / 源码级）

### 3.1 两家的实现定位与线程模型

**Fast DDS（eProsima）**

- 前身 Fast RTPS，是 ROS 2 从最初就绑定的默认实现，与 rmw_fastrtps 深度协同开发。
- 线程模型：每个 participant 有事件线程、异步写线程等；发现默认走标准 SPDP/SEDP（也支持 Discovery Server 集中发现）。
- 特色：**共享内存传输（SHM/DataSharing）**、Discovery Server、DDS-Security 插件成熟、XTypes/动态类型。

**Cyclone DDS（Eclipse）**

- 源自 ADLINK，2020 年捐给 Eclipse 基金会，成为 **Eclipse Cyclone DDS** 项目。
- 设计目标轻量、低延迟、低内存；自带共享内存（SHM）支持。
- 线程模型与内存策略和 Fast DDS 不同（如不同的接收/历史缓存管理），因此同一负载下 CPU/内存表现会有差异。

> ⚠️ 具体线程数、内存占用等**实现细节数字待验证**，建议以各自官方文档与 TSC 报告实测为准。

### 3.2 特性对比表

| 特性 | Fast DDS | Cyclone DDS |
|---|---|---|
| 维护组织 | eProsima（公司） | Eclipse Cyclone DDS 项目（Eclipse 基金会，社区驱动） |
| 共享内存传输 | ✅ DataSharing / SHM | ✅ 自有 SHM |
| DDS-Security（SROS2） | ✅ 成熟 | ✅ 支持 |
| XTypes / 动态类型 | ✅ | ✅ |
| Discovery Server（集中发现） | ✅ | 有限/视版本（待验证） |
| 跨平台 | Windows/Linux/macOS | Windows/Linux（Windows 支持更晚、部分特性有差异，待验证） |
| 默认 RMW | 多数发行版默认 | 部分发行版/厂商选用 |

### 3.3 TSC RMW 报告要点

OSRF 的技术指导委员会（TSC）每版本发布 **RMW 评测报告**（TSC-RMW-Reports），从**延迟、吞吐、CPU/内存占用、功能支持矩阵**等维度对比各 RMW 实现，是社区公认的选型参考。

> ⚠️ 红线声明：**具体延迟/吞吐数字请以报告原文为准**，本文不转述具体数值以免失真。报告仓库与页面见第 7 节。eProsima 针对 Humble 报告发布了官方回应（`eProsima-response.html`），对部分测试方法、条件与结论提出说明——阅读时应**对照报告与回应双方**，避免单方面引用。

### 3.4 性能特征定性结论（⚠️ 无数字，仅方向性）

- 两家在"低延迟、高吞吐"上互有胜负，**结论高度依赖消息大小、QoS、负载模型、硬件**，不存在普适的"谁更快"。
- eProsima 发布过自家视角的对比页（见参考资料），属**厂商自评，存在立场偏差**，不宜作为唯一依据。
- 社区结论多倾向：小消息低延迟与低内存场景 Cyclone DDS 表现强；功能丰富度、生态与默认集成 Fast DDS 占优——但**这仍是方向性经验，需实测验证**。

---

## 4. 实践指南

### 4.1 切换 RMW

```bash
# 查看当前 RMW
printenv RMW_IMPLEMENTATION   # 未设置时多数发行版默认 rmw_fastrtps_cpp

# 切换到 Cyclone DDS
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
ros2 run demo_nodes_cpp talker

# 切回 Fast DDS
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp

# 确认已安装对应实现
ros2 pkg list | grep rmw
# sudo apt install ros-<distro>-rmw-cyclonedds-cpp
```

### 4.2 Fast DDS 配置（XML Profile）

```xml
<!-- fastdds_profile.xml -->
<dds>
  <profiles xmlns="http://www.eprosima.com/XMLSchemas/fastRTPS_Profiles">
    <participant profile_name="my_participant">
      <rtps>
        <builtin>
          <!-- 用 Discovery Server 时在此配置 -->
        </builtin>
      </rtps>
    </participant>
  </profiles>
</dds>
```

```bash
export FASTRTPS_DEFAULT_PROFILES_FILE=fastdds_profile.xml   # 旧名
export FASTDDS_DEFAULT_PROFILES_FILE=fastdds_profile.xml    # 新名
```

### 4.3 Cyclone DDS 配置（XML）

```xml
<!-- cyclonedds.xml -->
<CycloneDDS xmlns="https://cdds.io/config">
  <Domain id="any">
    <SharedMemory><Enable>true</Enable></SharedMemory>
    <Internal><Watermarks><WhcHigh>100 kB</WhcHigh></Watermarks></Internal>
  </Domain>
</CycloneDDS>
```

```bash
export CYCLONEDDS_URI=file://$PWD/cyclonedds.xml
```

### 4.4 实测对比

```bash
# 用同一 demo，切换 RMW 分别测延迟/吞吐，控制变量
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
ros2 run demo_nodes_cpp talker & ros2 topic hz /chatter

export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
ros2 run demo_nodes_cpp talker & ros2 topic hz /chatter
```

> 建议用 `ros2 performance_test`（Apex.AI）或 `ddsperf` 做更严谨的延迟/吞吐对比，`ros2 topic hz` 只能粗略看频率。

---

## 5. 方案对比

| 维度 | Fast DDS | Cyclone DDS |
|---|---|---|
| 维护方 | eProsima（商业公司） | Eclipse 基金会（社区） |
| 生态/默认集成 | 深（ROS 2 默认） | 广（多发行版可选） |
| 功能丰富度 | 高（Discovery Server、SHM、动态类型） | 高（轻量、SHM、XTypes） |
| 调优点 | XML Profile | XML 配置（CYCLONEDDS_URI） |
| 选型倾向 | 需要生态/商业支持、默认稳定 | 追求低延迟/低内存、嵌入式 |

> **绝对不适用场景**：**仅凭"某个博客说 X 快"就切换生产环境 RMW 而不做本机实测**——RMW 性能高度依赖消息大小/QoS/硬件，别人的结论不可直接迁移；且切换会连带改变 QoS 边界语义、发现行为与安全插件配置，盲切是事故来源。

---

## 6. 工具链

- `ros2 doctor --report`：查看当前 RMW 与相关配置。
- `printenv RMW_IMPLEMENTATION` / `ldd`：确认加载的库。
- `ros2 performance_test` / `ddsperf`：延迟/吞吐基准。
- `fastdds` CLI：Fast DDS 发现与诊断（命令随版本，待验证）。
- `ros2 topic hz/bw`：粗略观测。
- TSC 报告：<https://github.com/osrf/TSC-RMW-Reports>

---

## 7. 参考资料

- TSC RMW 报告仓库：<https://github.com/osrf/TSC-RMW-Reports>
- eProsima 对 Humble 报告的回应：<https://osrf.github.io/TSC-RMW-Reports/humble/eProsima-response.html>
- eProsima 共享内存传输：<https://www.eprosima.com/middleware/add-ons/shared-memory>
- eProsima 自评对比（厂商视角，注意立场）：<https://www.eprosima.com/developer-resources/performance/fast-dds-vs-cyclone-dds-performance>
- 官方"使用多个 RMW 实现"指南：<https://docs.ros.org/en/rolling/How-To-Guides/Working-with-multiple-RMW-implementations.html>
- Fast DDS 文档：<https://fast-dds.docs.eprosima.com/>
- Eclipse Cyclone DDS：<https://cyclonedds.io/>（✅ 已验证，Eclipse Cyclone DDS 官方文档站）
- rmw_cyclonedds 源码：<https://github.com/ros2/rmw_cyclonedds>；rmw_fastrtps 源码：<https://github.com/ros2/rmw_fastrtps>

---

## 8. 学习路径

1. 安装两家 RMW，用 `RMW_IMPLEMENTATION` 切换，跑通同一个 demo。
2. 用 `ros2 doctor` 与 `ldd` 确认切换真实生效。
3. 用 `ros2 performance_test` 在**你的硬件**上测不同消息大小/QoS 下的延迟吞吐，形成自己的结论。
4. 分别配置 Fast DDS XML Profile 与 Cyclone DDS XML，观察共享内存对延迟的影响。
5. 读 TSC 报告与 eProsima 回应，学习如何批判性地看待基准测试。

---

## 9. 核心面试三问

1. **rmw 抽象层为什么能让上层代码"无感知"切换 Fast DDS 和 Cyclone DDS？切换时真正需要改的是什么？**
   → 因为 rcl/rclcpp 只依赖 `rmw_*` C 接口与 `rmw_qos_profile_t`，实现细节被 rmw 封装。切换只需改 `RMW_IMPLEMENTATION` 环境变量加载不同 `.so`；但**调优参数不在 rmw 接口里**，需各自用 XML Profile（Fast DDS）/ XML 配置（Cyclone DDS）重新设置。

2. **Fast DDS 和 Cyclone DDS 分别由谁维护？它们的共享内存传输在机制上为什么都叫"低延迟路径"？**
   → Fast DDS 由 eProsima 维护，Cyclone DDS 由 Eclipse Cyclone DDS 项目（Eclipse 基金会）维护。二者都用共享内存段在同主机进程间传递数据，避免 UDP 回环与内核 socket 拷贝，从而降低传输延迟。

3. **为什么"Fast DDS 比 Cyclone DDS 快"这类说法不可直接采信？TSC 报告该怎么读？**
   → 因为性能高度依赖消息大小、QoS、负载模型与硬件，不存在普适结论；厂商自评页存在立场偏差。TSC 报告是社区公认参考，但 eProsima 有官方回应，应**对照报告与回应双方**、并在自己的硬件上实测后下结论。
