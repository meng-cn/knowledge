# 02 ROS 1 与 ROS 2 对比与迁移

> **在知识图谱中的位置**：模块一 · 基础概念 · 02
> **难度**：⭐⭐ | **前置知识**：[什么是 ROS 2](./01_什么是ROS2.md)，最好对 ROS 1（roscore/rospy/roscpp）有基本印象

## 1. 概述

**ROS 2 是对 ROS 1 的"重新设计"而非"升级补丁"**：它保留了 ROS 1 的核心心智模型（Node/Topic/Service/参数/包/launch），但把通信层、构建系统、安全、QoS、多平台支持全部重写，以解决 ROS 1 在生产环境（多机器人、实时、安全、嵌入式）暴露的架构性缺陷。两者二进制与 API 均不兼容，需借助 `ros1_bridge` 或重写代码迁移。

## 2. 核心概念

### 2.1 一句话差异：从"星型总线"到"去中心化对等网络"

ROS 1 靠中心化的 **ROS Master（roscore）** 做节点注册与话题匹配，Master 一挂全系统瘫痪；ROS 2 用 DDS 的**分布式发现**，无单点。这是理解所有差异的钥匙。

### 2.2 需要迁移的三类资产

- **代码**：C++（roscpp→rclcpp）、Python（rospy→rclpy）。
- **消息/服务定义**：`.msg`/`.srv` 语义相近但生成产物（头文件/包名）不同。
- **工程设施**：catkin/CMake→ament/colcon、launch（XML→Python/YAML）、rosbag→rosbag2、rviz 插件。

### 2.3 兼容性的三层含义

- **网络层不兼容**：ROS 1 用 TCPROS/自定义序列化，ROS 2 用 DDS-RTPS，裸连不互通。
- **API 不兼容**：`rospy.init_node`→`rclpy.init`，`ros::NodeHandle`→`rclcpp::Node`。
- **工具链不兼容**：`catkin_make`→`colcon build`，`rosrun`→`ros2 run`。

## 3. 技术原理

### 3.1 核心差异总表

| 维度 | ROS 1 | ROS 2 |
|---|---|---|
| 通信发现 | 中心化 ROS Master（roscore） | DDS 去中心化发现，无 master |
| 传输 | TCPROS/UDPROS（自定义） | DDS/RTPS（标准协议） |
| QoS | 基本不可配（仅 TCP 队列参数） | 丰富的 QoS（可靠性/历史/期限/存活等） |
| 安全 | 无内建安全 | DDS-Security / SROS2 |
| 语言 | C++03/11、Python 2 | C++14/17+、Python 3 |
| 平台 | 主要 Linux | Linux/Windows/macOS/嵌入式（rclc/micro-ROS） |
| 构建 | catkin（单工作区） | ament + colcon（隔离构建，支持覆盖/合并安装） |
| 消息生成 | genmsg/gencpp/genpy | rosidl（中间表示 .idl） |
| 实时性 | 无保证 | 面向实时设计（rmw_cyclonedds + PREEMPT_RT） |
| 发布模型 | 持续维护但无新功能 | 按 distro 冻结，长期支持（LTS） |

### 3.2 为什么"不能直接兼容"

ROS 1 的通信栈把**序列化格式、协议、发现机制、master 注册**耦合在 `roscpp`/`rospy` 内部；ROS 2 把这些下沉到 DDS 标准协议并抽象出 RMW 层。两者的 wire 格式不同、类型系统不同（ROS 1 是 genmsg 生成的头文件，ROS 2 是 rosidl 的 `.idl` 中间表示），因此**同一话题名在两条总线上互不可见**，无法靠"改个环境变量"互通。

### 3.3 ros1_bridge 桥接原理（源码级）

`ros1_bridge`（仓库 https://github.com/ros2/ros1_bridge）是**进程内双客户端转发器**：

1. 一个进程同时链接 ROS 1 库（roscpp/rospy 的 C++ 核心）与 ROS 2 库（rclcpp）。
2. 对每个桥接话题，动态生成：ROS 1 侧的 `ros::Publisher`/`Subscriber` + ROS 2 侧的 `rclcpp::Publisher`/`Subscriber`。
3. 收到一端消息 → 反序列化 → **字段级映射**到另一端类型 → 再序列化发出。同名字段、类型语义（如 `Header`、`geometry_msgs`）需人工确认，不能自动转换的就需写自定义映射。
4. 话题名映射：`ros1_bridge` 默认把 ROS 1 的 `/foo` 与 ROS 2 的 `/foo` 配对（可通过参数重命名），服务/动作同样支持。

**控制流**：ROS 1 master 与 ROS 2 DDS 发现**同时并存**——桥接进程需同时连接 ROS 1 master（`ROS_MASTER_URI`）并加入 ROS 2 DDS 域（`ROS_DOMAIN_ID`）。

**资源开销**：桥接是**额外一跳**，每条消息在桥接进程内多一次序列化/反序列化，引入延迟（微秒到毫秒级，取决于消息大小）与一个进程的 CPU/内存开销；大消息（图像/点云）桥接吞吐会明显受限，应尽量批量迁移、减少桥接面。

### 3.4 迁移清单

1. **盘点**：列出全部节点、话题、服务、自定义消息、launch、依赖包。
2. **先迁消息**：把 `.msg`/`.srv` 复制到 ROS 2 包（字段语义需核对，见 [消息服务与类型系统](./05_消息服务与类型系统.md)）。
3. **逐节点重写**：roscpp→rclcpp、rospy→rclpy，注意 API 对应（下表）。
4. **替换工具链**：launch、参数（`rosparam`→`ros2 param`）、bag、rviz。
5. **验证 QoS**：ROS 1 默认可靠 TCP，迁移后需显式选择 QoS，否则丢包/延迟行为会变。
6. **灰度桥接**：用 `ros1_bridge` 让新旧系统并存过渡，逐步下线 ROS 1 节点。

## 4. 实践指南

### 4.1 API 迁移对照示例

```python
# ROS 1 (rospy)
import rospy
from std_msgs.msg import String
rospy.init_node('talker')
pub = rospy.Publisher('chatter', String, queue_size=10)
rate = rospy.Rate(1)
while not rospy.is_shutdown():
    pub.publish(String(data='hi'))
    rate.sleep()
```

```python
# ROS 2 (rclpy)
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
class Talker(Node):
    def __init__(self):
        super().__init__('talker')
        self.pub = self.create_publisher(String, 'chatter', 10)
        self.create_timer(1.0, lambda: self.pub.publish(String(data='hi')))
rclpy.init()
rclpy.spin(Talker())
rclpy.shutdown()
```

### 4.2 ros1_bridge 使用示例

```bash
# 终端1：ROS 1 侧
source /opt/ros/noetic/setup.bash
roscore

# 终端2：ROS 2 侧 + 桥接
source /opt/ros/jazzy/setup.bash
export ROS_MASTER_URI=http://localhost:11311   # 连接 ROS 1 master
ros2 run ros1_bridge dynamic_bridge --bridge-all-topics
```

> `--bridge-all-topics` 会桥接所有"两侧都存在同类型"的话题；只桥接指定话题用 `--bridge-topics /foo:=/bar` 精确映射。

### 4.3 常见陷阱

| 坑 | 现象 | 解法 |
|---|---|---|
| 桥接时 `ROS_MASTER_URI` 未设 | 桥接进程找不到 ROS 1 master | 显式 `export ROS_MASTER_URI` |
| 同名话题但类型字段不同 | 桥接报类型不匹配/静默丢消息 | 核对两侧 `.msg` 字段，改消息定义或写自定义映射 |
| 迁移后忘配 QoS | 订阅收不到消息 | ROS 2 默认要求可靠可靠/尽力匹配，见 QoS 文档 |
| 用 `rosrun` 跑 ROS 2 包 | 命令找不到 | 全部改用 `ros2 run/launch` |

### 4.4 注意事项

- ROS 1（Noetic）已进入 EOL 尾声，新项目一律 ROS 2，不要为"省事"沿用 ROS 1。
- 桥接只是过渡手段，不要作为长期生产架构；桥接进程本身是单点，坏了整条链路断。
- 迁移大消息系统时优先评估零拷贝/共享内存，桥接层的序列化开销会被放大。

## 5. 方案对比

| 方案 | 优势 | 劣势 | 适用场景 |
|---|---|---|---|
| 全新 ROS 2 开发 | 架构干净、享全部新特性 | 需重写 | 新项目 |
| ros1_bridge 渐进迁移 | 平滑过渡、可灰度 | 额外一跳、单点、延迟 | 大系统分期迁移 |
| 维持 ROS 1 | 零迁移成本 | 无安全/实时/QoS，逐渐无维护 | 纯离线老项目 |
| 混合双栈长期共存 | 各用所长 | 运维复杂、两套环境 | 临时过渡 |

> **在什么场景下绝对不能使用**：**跨发行版（distro）之间不能直接通信**——例如 ROS 2 Humble 节点与 ROS 2 Jazzy 节点虽然都是 ROS 2，但默认序列化/wire 版本可能不一致，官方不保证跨 distro 的 DDS 互操作；同理 **ROS 1 与 ROS 2 节点绝对不能直接连**，必须经 `ros1_bridge`。生产环境绝不能让"没经过版本校验的跨 distro 混合组网"上线。

## 6. 工具链

| 工具 | 用途 | 链接 |
|---|---|---|
| ros1_bridge | ROS 1↔ROS 2 桥接 | https://github.com/ros2/ros1_bridge |
| ROS 1 文档（Noetic） | ROS 1 参考 | http://wiki.ros.org/noetic |
| migration 指南 | 官方迁移文档 | https://docs.ros.org/en/jazzy/How-To-Guides/Migrating-from-ROS1/Migrating-CPP-Package-Example.html |
| rosbag2 | 替代 rosbag | https://github.com/ros2/rosbag2 |

## 7. 参考资料

- ROS 1 → ROS 2 官方迁移指南：https://docs.ros.org/en/jazzy/How-To-Guides/Migrating-from-ROS1/Migrating-CPP-Package-Example.html ✅已验证
- ros1_bridge 仓库：https://github.com/ros2/ros1_bridge ✅已验证
- ROS 2 发布/发行版总览：https://docs.ros.org/en/rolling/Get-Started/Releases.html ✅已验证
- ROS 1 wiki：http://wiki.ros.org/noetic ✅已验证
- ROS 2 设计文档（Why ROS 2）：https://design.ros2.org/articles/why_ros2.html ✅已验证

## 8. 学习路径

- **Level 1**：跑通 ROS 1 的 roscore + talker/listener，感受 master 单点。
- **Level 2**：读 ROS 1→ROS 2 迁移指南，对照 API 表重写一个 talker。
- **Level 3**：搭建 ros1_bridge，让 ROS 1 与 ROS 2 节点互通，观察桥接进程。
- **Level 4**：理解 TCPROS 与 DDS-RTPS 的 wire 差异，能解释"为什么不兼容"。
- **Level 5**：主导一个真实系统从 ROS 1 到 ROS 2 的分期迁移并沉淀迁移清单。

## 9. 核心面试三问

**Q1：ROS 1 的 master 挂了会怎样？ROS 2 如何从架构上消除这个单点？**

参考要点：ROS 1 master 挂了，已建立的连接虽可能继续传输，但**新节点无法注册、新话题无法匹配、参数服务不可用**，等于系统失明。ROS 2 用 DDS 去中心化发现（SPDP/SEDP），每个参与者自己广播并缓存端点信息，无中心节点，任一节点宕机只影响它自己。

**Q2：为什么 ROS 1 和 ROS 2 不能直接通信？ros1_bridge 到底在做什么？**

参考要点：两者 wire 协议（TCPROS vs RTPS）、序列化格式、类型系统（genmsg vs rosidl）都不同，同话题名互不可见。ros1_bridge 是进程内双客户端：同进程内分别作为 ROS 1 节点与 ROS 2 节点，收到一端消息做字段级映射转发到另一端，本质是"翻译器"，代价是额外一跳延迟与一个单点。

**Q3：迁移时最容易在"看起来同名同类型"上翻车的地方是什么？**

参考要点：`.msg` 同名但字段语义/顺序/类型可能不同（如 `float32` vs `float64`、有无 `Header`、时间类型 `builtin_interfaces/Time` vs `time`），桥接/直接迁移会静默丢字段或精度损失；QoS 默认值也不同（ROS 1 可靠 TCP vs ROS 2 需显式匹配）；`queue_size` 在 ROS 2 被更细的 QoS（history/depth）取代。必须在迁移清单里逐字段 + 逐 QoS 核对。
