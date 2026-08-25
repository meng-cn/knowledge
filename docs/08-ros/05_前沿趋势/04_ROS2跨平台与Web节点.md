# 04 · ROS 2 跨平台与 Web 节点

> **位置**：08-ROS / 05_前沿趋势
> **难度**：⭐（平台可用度评估与传输选型）
> **前置知识**：[模块二：DDS/RMW 与 QoS](../02_核心模块/)、[模块一：节点与客户端库](../01_基础概念/)
> **最后更新**：2026-08-25

---

## 1. 概述

ROS 2 的一个长期卖点是"跨平台"：官方明确支持 Linux（Ubuntu 为主）、Windows、macOS 三大桌面系统（以 Tier 分级，见 REP 2000），同时社区把触角伸向 **Web 浏览器（JS/WASM）** 与 **边缘/移动设备（Jetson 等）**。本篇文章回答四个实际问题：

1. Windows/macOS 现在能不能"上生产"？
2. 浏览器里怎么跑 ROS 2 节点（rclnodejs / WASM）？
3. 边缘设备（Jetson）怎么部署？
4. 多机跨广域网（WAN）怎么选 DDS/传输？

---

## 2. 核心概念

### 2.1 平台 Tier 分级（REP 2000）

ROS 2 用 **REP 2000（ROS 2 Releases and Target Platforms）** 声明各发行版的目标平台与支持等级（Tier 1/2/3）。**Tier 1** 是官方 CI 持续验证、可视为生产主力的平台（Ubuntu 为主，Windows/macOS 通常为 Tier 1 或 Tier 2，随版本浮动）。评估"能不能上生产"，本质是查对应发行版在 REP 2000 里的 Tier 等级。

### 2.2 RMW 抽象层：跨平台与跨 DDS 的关键

ROS 2 通过 **RMW（ROS Middleware Interface）** 抽象底层 DDS 实现（Fast DDS、Cyclone DDS 等），同一套节点代码换 RMW 即可切换中间件——这也是"跨平台"与"跨 WAN 传输选型"的落点（见 [模块二](../02_核心模块/)）。

### 2.3 非 C++/Python 客户端库

ROS 2 的客户端库不止 rclcpp/rclpy：**rclnodejs**（Node.js）、**rclrs**（Rust）、**rcljava** 等社区客户端，让 ROS 2 节点能跑在 Web 后端、边缘网关等非传统环境。

### 2.4 Zenoh：为 WAN/云-边设计的中间件

Zenoh 是 Eclipse 基金会下的发布/订阅协议，强调**低开销、任意传输、可路由（router/peer 模式）**，天然适合跨 WAN、云-边协同。ROS 2 通过 `rmw_zenoh` 与 `zenoh_bridge_dds` 与之集成。

---

## 3. 技术原理 / 现状分析

### 3.1 Windows / macOS 生产可用度（已核实）

- **官方安装文档存在**：docs.ros.org 提供 Windows 二进制安装文档（如 `docs.ros.org/en/<distro>/Installation/Windows-Install-Binary.html`，当前及历史发行版均有对应页面）。
- **历史背景**：ROS 社区早在 2011 年就发布过 "ROS on Windows" 公告（ros.org/news/2011/03/ros-on-windows.html）；微软也曾推动 "ROS on Windows" 项目。
- **macOS**：官方提供源码安装文档，但历来以 **Tier 2** 为主，第三方依赖与 DDS 支持不如 Ubuntu 完整。

> ⚠️ 待验证：专用的 `windows.ros.org` 站点当前是否仍由微软维护为"官方 ROS on Windows"门户，本文未找到其现行权威页面；**请以 docs.ros.org 的 Windows 安装文档 + REP 2000 的 Tier 表为准**。
>
> **结论**：Windows 可做开发与部分生产（尤其配合原生 Windows 工具链），但**多机实时/车规/大规模集群生产仍以 Ubuntu Tier 1 为主**；macOS 更适合开发验证，不建议作为机器人机载生产平台。

### 3.2 Web 端：rclnodejs 与 WebAssembly（已核实）

- **rclnodejs**（github.com/RobotWebTools，npm 包 `rclnodejs` 可查）：Node.js 的 ROS 2 客户端库，让 ROS 2 节点跑在 Node 运行时，常用于 Web 网关、可视化后端、边缘服务。
- **ROS 2 WASM 方向**：存在真实项目 **ros2wasm**（github.com/ros2wasm）与对应的 **rmw_wasm**，目标是把 ROS 2 节点编译到 WebAssembly，在浏览器/Wasmer 运行时里执行。这仍属**实验性/研究性**，尚未进入主流生产。

> 判断：浏览器内"原生 ROS 2 节点"目前不现实（WASM 缺系统网络/DDS 栈），更稳健的 Web 集成是 **rclnodejs 网关 + WebSocket/HTTP 暴露**，浏览器通过前端 SDK 与网关交互，而非直接加入 DDS 网络。

### 3.3 移动 / 边缘：Jetson（已核实）

NVIDIA 的 **Isaac ROS**（NVIDIA-ISAAC-ROS.github.io 官方文档）是面向 Jetson（AGX Orin、Orin NX 等）的 ROS 2 加速框架，把 CUDA/VPI 加速的感知、SLAM、规划包以 ROS 2 节点形式提供。社区文档（如 Seeed Studio Wiki）有大量"Jetson AGX Orin + ROS 2"部署实践。这是"边缘部署 ROS 2"最成熟的路径。

### 3.4 多机广域网（WAN）：DDS 传输选择与延迟（已核实）

- 原生 DDS 面向**局域网低延迟**设计，跨 WAN 常遇到组播不可达、NAT 穿透、发现协议失效等问题；
- 已有学术论文对比 ROS 2 在 **边到边/边到云** 通信下的中间件表现：《Comparison of Middlewares in Edge-to-Edge and Edge-to-Cloud Communication for Distributed ROS 2 Systems》（Springer，期刊文章编号 s10846-024-02187-z）；
- 工程上的主流选择是引入 **Zenoh**：`rmw_zenoh`（github.com/ros2/rmw_zenoh，官方仓库）让 ROS 2 直接以 Zenoh 作为 RMW，`zenoh_bridge_dds`（index.ros.org/r/zenoh_bridge_dds）桥接 DDS 与 Zenoh，借助 Zenoh 的 **router/peer 模式**实现 NAT 穿透与广域路由。

---

## 4. 实践指南（当前可落地路径）

### 4.1 Windows 落地

1. 查 REP 2000 确认目标发行版（如 Jazzy/Kilted）在 Windows 的 Tier；
2. 按 docs.ros.org 二进制安装文档安装，优先搭配本机原生 VS 工具链做 rclcpp 开发；
3. 多机或实时性敏感场景仍建议 Ubuntu Tier 1。

### 4.2 Web 集成

```text
浏览器前端  ──WebSocket/HTTP──►  Node.js 网关（rclnodejs）  ──►  ROS 2 DDS 网络
```

- 网关用 rclnodejs 起一个 ROS 2 节点，订阅/发布话题、调用服务，再通过 WebSocket 暴露给前端；
- 避免让浏览器直接进 DDS 网络（兼容性、安全、防火墙问题）。

> 示例架构，需按实际框架调整。

### 4.3 边缘（Jetson）

- 刷 JetPack + 安装 Isaac ROS 官方发行版，把感知/导航节点 GPU 加速后部署在 Orin 上，与云端/地面站通过 Zenoh 或轻量桥接通信。

### 4.4 跨 WAN 选型

1. 局域网、低延迟、多节点高频数据 → 默认 DDS（Cyclone DDS / Fast DDS）；
2. 跨 NAT/公网、云-边协同、带宽受限 → `rmw_zenoh` 或 `zenoh_bridge_dds`，用 Zenoh router 中转；
3. 只传少量遥测/指令 → 不必上 DDS，直接用轻量 MQTT/WebSocket 网关更简单。

---

## 5. 方案对比

| 传输/接入方式 | 延迟 | 跨 NAT/WAN | 成熟度 | 适用场景 |
|---------------|------|-----------|--------|----------|
| 默认 DDS（局域网） | 低 | 差（组播/NAT 问题） | 高 | 机载多节点、局域网集群 |
| rmw_zenoh | 中低 | 好（router/peer 模式） | 中高（官方仓库） | 云-边、跨 WAN |
| zenoh_bridge_dds | 中 | 好 | 中高 | DDS 域与 Zenoh 域桥接 |
| rclnodejs 网关 + WebSocket | 中 | 好（走 HTTP/WS） | 高 | 浏览器/移动端接入 |
| ros2wasm / rmw_wasm | 中 | 受限 | 低（实验性） | 研究、沙箱环境 |

**绝对不适用场景**：指望用**浏览器内 WASM 节点**直接参与**高频、低延迟、强实时的多机 DDS 数据总线**（如机载实时点云/控制回路）。WASM 缺系统网络栈与确定性保证，这条路在当前阶段只适合演示与隔离沙箱。

---

## 6. 工具链

| 工具/项目 | 作用 | 来源 |
|-----------|------|------|
| REP 2000 | 平台 Tier 与发行版对照 | docs.ros.org（rep-2000） |
| rclnodejs | Node.js ROS 2 客户端 | github.com/RobotWebTools / npm |
| ros2wasm / rmw_wasm | ROS 2 → WebAssembly | github.com/ros2wasm |
| rmw_zenoh | Zenoh 作为 RMW | github.com/ros2/rmw_zenoh |
| zenoh_bridge_dds | DDS↔Zenoh 桥接 | index.ros.org/r/zenoh_bridge_dds |
| Isaac ROS | Jetson 上的 ROS 2 加速栈 | NVIDIA-ISAAC-ROS.github.io |

---

## 7. 参考资料（均经核实）

- REP 2000（ROS 2 Releases and Target Platforms）：<https://docs.ros.org/en/independent/api/rep/html/rep-2000.html>
- ROS 2 Windows 二进制安装文档：<https://docs.ros.org/en/lyrical/Installation/Windows-Install-Binary.html>（历史版本同路径改发行版名）
- ROS on Windows（2011 公告）：<https://ros.org/news/2011/03/ros-on-windows.html>
- rclnodejs（npm）：<https://www.npmjs.com/package/rclnodejs>
- ros2wasm：<https://github.com/ros2wasm>；rmw_wasm：<https://index.rosdabbler.com/r/rmw_wasm/>
- rmw_zenoh：<https://github.com/ros2/rmw_zenoh>
- zenoh_bridge_dds：<https://index.ros.org/r/zenoh_bridge_dds/>
- Isaac ROS 官方文档：<https://nvidia-isaac-ros.github.io/>
- 边到边/边到云中间件对比论文：<https://www.utupub.fi/handle/10024/185597>

> ⚠️ 待验证：`windows.ros.org` 当前官方性与维护状态；ROS 2 在 macOS 的具体 Tier 请以 REP 2000 最新版为准。

---

## 8. 学习路径

1. **查 Tier**：先学会读 REP 2000 与发行版发布页（结合 [模块五 05 · 产业生态与路线](05_ROS2产业生态与未来路线.md)）；
2. **多平台跑通**：在 Ubuntu/Windows 各装一个发行版，跑同一个 talker/listener；
3. **Web 网关**：用 rclnodejs 写一个话题→WebSocket 网关，前端订阅可视化；
4. **跨 WAN 实验**：起一个 Zenoh router，用 rmw_zenoh 打通两台跨 NAT 的机器；
5. **回看 DDS**：理解为什么默认 DDS 跨 WAN 会"水土不服"，巩固 [模块二 DDS/RMW](../02_核心模块/) 知识。

---

## 9. 核心面试三问

**Q1：Windows 能作为 ROS 2 的生产部署平台吗？你怎么判断？**
答：能，但要分场景。判断依据是 REP 2000 的 Tier 表与具体发行版的支持等级：开发、单机、与 Windows 工具链集成的场景可用；但多机实时集群、车规/工业强确定性场景，生态与 CI 仍以 Ubuntu Tier 1 为主，我会优先 Ubuntu。macOS 更适合开发验证，不作为机载生产平台。

**Q2：浏览器里能不能直接跑 ROS 2 节点？正确做法是什么？**
答：直接跑很困难且不推荐——浏览器/WASM 缺少系统网络栈与完整 DDS 支持（ros2wasm/rmw_wasm 仍实验性）。正确做法是**网关模式**：用 rclnodejs 在 Node.js 侧起一个真正的 ROS 2 节点，通过 WebSocket/HTTP 暴露给浏览器前端，前端不进入 DDS 网络。

**Q3：多机跨 WAN 时，为什么默认 DDS 常常不行？你会怎么选传输？**
答：默认 DDS 面向局域网低延迟设计，跨 WAN 会遇到组播不可达、NAT 穿透、发现协议失效等问题。我会：高频低延迟局域网数据继续用 DDS；跨公网/云-边协同改用 `rmw_zenoh` 或 `zenoh_bridge_dds`，借助 Zenoh 的 router/peer 模式做 NAT 穿透与广域路由；只传少量遥测/指令则直接用更轻的 MQTT/WebSocket 网关。
