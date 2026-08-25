# 04 工作空间与 Colcon 构建

> **在知识图谱中的位置**：模块一 · 基础概念 · 04
> **难度**：⭐⭐⭐ | **前置知识**：[安装与环境配置](./03_安装与环境配置.md)、CMake 基础（不要求精通）

## 1. 概述

**ROS 2 的源码组织与构建围绕"工作区（workspace）"展开：`src/` 放包源码，`colcon build` 把它们编译进 `install/`，`package.xml` 声明元数据与依赖，`CMakeLists.txt` 通过 `ament_*` 宏驱动构建。** 掌握 colcon 的隔离构建原理与 ament 构建系统，是从"跑 demo"走向"管理真实多包工程"的分水岭。

## 2. 核心概念

### 2.1 工作区布局

```
my_ws/
├── src/                 # 源码包（一个包一个目录）
│   ├── my_pkg/
│   │   ├── package.xml
│   │   ├── CMakeLists.txt
│   │   ├── include/my_pkg/...
│   │   └── src/...
│   └── my_msgs/
├── build/               # colcon 生成的中间产物
├── install/             # 安装产物（source install/setup.bash 后可用）
└── log/                 # 构建日志
```

关键点：**改代码只改 `src/`；`build/`、`install/`、`log/` 都是生成物，可随时删除重来。**

### 2.2 包的构成：`package.xml` 关键字段

`package.xml` 是包的**身份与依赖清单**（不参与编译，供 rosdep/发布/索引使用）：

| 字段 | 含义 |
|---|---|
| `<name>` `<version>` | 包名、版本（版本需单调递增才能发布） |
| `<description>` `<maintainer>` `<license>` | 描述、维护者邮箱、许可证 |
| `<buildtool_depend>ament_cmake</buildtool_depend>` | 构建工具依赖 |
| `<depend>rclcpp</depend>` | 同时声明 build/export/exec 三类依赖（最常用简写） |
| `<build_depend>` `<build_export_depend>` `<exec_depend>` | 分别声明"编译时/导出时/运行时"依赖 |
| `<test_depend>` | 仅测试需要的依赖 |

### 2.3 `CMakeLists.txt` 中的 ament 关键宏

| 宏/选项 | 作用 |
|---|---|
| `if(BUILD_TESTING)` ... `ament_lint_auto` | 测试开关，CI 常开 |
| `ament_cmake_auto` | 自动推导（包名/头文件/库导出），大幅简化 CMake |
| `ament_target_dependencies(my_node rclcpp std_msgs)` | 一次链接多个包的目标（替代手写 find_package+include+link） |
| `rosidl_generate_interfaces(${PROJECT_NAME} "msg/Foo.msg" "srv/Bar.srv")` | 从 `.msg/.srv/.action` 生成接口（见 05） |
| `ament_package()` | 收尾，注册包到 ament 索引 |

## 3. 技术原理

### 3.1 colcon build 的隔离构建

colcon（https://github.com/colcon）对每个包**独立建目录、独立构建、按拓扑序排列**：

1. 解析 `src/` 下所有包的 `package.xml`，用依赖关系做**拓扑排序**（被依赖的先编译）。
2. 每个包在自己的 `build/<pkg>/` 里跑各自的构建后端（ament_cmake→CMake、ament_python→setuptools）。
3. 产物安装到 `install/<pkg>/`，再**合并**成一个统一的 install 前缀（underlay 语义）。
4. 生成 `install/setup.bash`，供后续 source。

**隔离构建的价值**：不像 `catkin_make` 把全部包塞进一个 CMake 工程（互相污染、无法单独控制参数），colcon 可以按包定制参数、并行编译、失败时只重编受影响子集。

### 3.2 `--symlink-install` 的原理与代价

- **普通 install**：把编译产物**复制**到 `install/`，改了源码必须重编。
- **`--symlink-install`**：install 里的可执行/资源用**符号链接**指向 `src/`（或 build），Python 脚本/资源改完即可用，**不用重编**。
- **代价**：C++ 仍需重编（编译产物在 build/）；符号链接在 Windows 上受限（需管理员/开发者模式），跨文件系统可能失效。

### 3.3 常用参数

```bash
colcon build
  --symlink-install              # Python 改完即生效
  --packages-select my_pkg       # 只编指定包（含依赖需再加 --packages-up-to）
  --packages-up-to my_pkg        # 编 my_pkg 及其所有上游依赖
  --cmake-args -DCMAKE_BUILD_TYPE=Release   # 传 CMake 参数（Debug/RelWithDebInfo/Release）
  --event-handlers console_cohesion+   # 好看的控制台进度
```

### 3.4 `rosdep install` 逐参数解释

```bash
rosdep install -y --from-paths src --ignore-src -r
```

| 参数 | 含义 |
|---|---|
| `-y` | 所有交互确认自动 yes |
| `--from-paths src` | 扫描 `src/` 下所有包的 package.xml |
| `--ignore-src` | **不把"本工作区里已存在的包"当外部依赖去 apt 装**（关键！否则会把 src 里的包名丢给 rosdep 报错） |
| `-r` | 某个包解析失败不中止，继续处理其他包（`--rosdistro` 同义扩展） |

## 4. 实践指南

### 4.1 从零建包并构建

```bash
mkdir -p ~/my_ws/src && cd ~/my_ws
ros2 pkg create --build-type ament_cmake my_cpp_pkg   # C++ 包
ros2 pkg create --build-type ament_python my_py_pkg    # Python 包

rosdep install -y --from-paths src --ignore-src -r     # 装依赖
colcon build --symlink-install                         # 构建
source install/setup.bash                              # 激活 overlay
ros2 run my_cpp_pkg <node>
```

### 4.2 两种 Python 包写法对比

| 维度 | `ament_python`（推荐） | 传统 `setuptools` + `setup.py` |
|---|---|---|
| 入口 | `setup.py` + `package.xml`（buildtool: ament_python） | `setup.py`（buildtool: ament_cmake 或 ament_python） |
| 依赖声明 | package.xml 里 `<depend>` + setup.py `install_requires` | 主要靠 setup.py |
| ros2 pkg create 默认 | ✅ `--build-type ament_python` | 老写法 |
| 资源/launch 安装 | 用 `data_files` + 显式 `glob`（ros2 约定目录） | 同样需显式配置 |
| 坑 | 忘在 `setup.py` 写 `entry_points` 时 `ros2 run` 找不到可执行 | 与 ament 索引集成不完整 |

> 推荐统一用 `ament_python`：它与 colcon/rosdep/发布流程集成最顺；传统 `setuptools` 写法在 colcon 下也可用，但需手动对齐 ament 资源索引。

### 4.3 常见构建错误排查

| 错误 | 根因 | 排查/解法 |
|---|---|---|
| `command not found: colcon` | 没 source ROS 2 | `source /opt/ros/<distro>/setup.bash` |
| 编译期 `No package 'xxx' found` | 依赖未装 / 忘了 `rosdep install` | 补跑 `rosdep install --ignore-src` |
| 运行期找不到自定义消息库 | 没 source 本工作区 install 的 setup | `source install/setup.bash` |
| 改了 Python 不生效 | 没开 `--symlink-install` | 重编或改用 symlink-install |
| `rosdep` 把 src 里自己的包当依赖报错 | 漏了 `--ignore-src` | 加上 `--ignore-src` |
| 引用了**工作区外**的 setup.bash | 误把 overlay 当 underlay 或反之 | 明确 source 顺序：先系统 ROS 2，再自己 install |

### 4.4 注意事项

- 多工作区叠加时，**source 顺序即优先级**：`source /opt/ros/jazzy/setup.bash`（underlay）→ `source ~/my_ws/install/setup.bash`（overlay），overlay 覆盖同名包。
- 改了 `package.xml` 依赖后，记得重跑 `rosdep install`，否则链接阶段才报缺库。
- CI 里开启 `BUILD_TESTING` 并跑 `colcon test` + `colcon test-result`，把测试纳入构建门禁。

## 5. 方案对比

| 方案 | 优势 | 劣势 | 适用场景 |
|---|---|---|---|
| colcon + ament_cmake | 官方标准、隔离、并行 | 学习曲线 | 所有 ROS 2 工程 |
| colcon + ament_cmake_auto | CMake 极简 | 复杂定制时不如手写清晰 | 中小型 C++ 包 |
| catkin（ROS 1） | 熟悉 | 单工程耦合、不隔离 | 仅 ROS 1 老项目 |
| 纯 CMake 裸写 | 自由 | 脱离 ROS 2 依赖/索引体系 | 与 ROS 2 无关的库 |

> **在什么场景下绝对不能使用**：**绝不能把 `install/` 目录手工搬来搬去当作"发布"**，或把不同工作区的 `install/setup.bash` 在**同一 shell** 里乱序 source 后长期运行——会得到不一致的 `AMENT_PREFIX_PATH` 与动态库路径，产生"编译过但运行 ABI 不匹配/加载错误库"的幽灵问题。发布必须走 distro/rosdep 体系或 `colcon` 的 deb 打包流程。

## 6. 工具链

| 工具 | 用途 | 链接 |
|---|---|---|
| colcon | 工作区构建 | https://colcon.readthedocs.io/ |
| ros2 pkg create | 生成包骨架 | https://docs.ros.org/en/jazzy/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html |
| rosdep | 依赖安装 | https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Rosdep.html |
| ament_cmake | 构建系统 | https://github.com/ament/ament_cmake |
| vcstool | 多仓库管理 | https://github.com/dirk-thomas/vcstool |

## 7. 参考资料

- Colcon 官方文档：https://colcon.readthedocs.io/ ✅已验证
- Colcon 教程（ROS 2）：https://docs.ros.org/en/jazzy/Tutorials/Beginner-Client-Libraries/Colcon-Tutorial.html ✅已验证
- 创建首个 ROS 2 包：https://docs.ros.org/en/jazzy/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html ✅已验证
- rosdep 文档：https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Rosdep.html ✅已验证
- ament_cmake 仓库：https://github.com/ament/ament_cmake ✅已验证
- ament_python 说明：https://docs.ros.org/en/jazzy/How-To-Guides/Ament-CMake-Python-Documentation.html ✅已验证

## 8. 学习路径

- **Level 1**：用 `ros2 pkg create` 建一个 ament_python 包并 `ros2 run`。
- **Level 2**：读懂 package.xml 各字段，会写 `<depend>` 并跑 rosdep。
- **Level 3**：用 ament_cmake_auto 写 C++ 包，理解 `--symlink-install` 与 overlay。
- **Level 4**：多包 + 自定义消息 + 测试，掌握 `--packages-select`/`--packages-up-to`。
- **Level 5**：搭建 CI（colcon test + lint），沉淀团队构建与发布规范。

## 9. 核心面试三问

**Q1：`rosdep install --from-paths src --ignore-src -r` 每个参数什么作用？漏掉 `--ignore-src` 会发生什么？**

参考要点：`--from-paths src` 扫描 src 下包的 package.xml；`--ignore-src` 告诉 rosdep 本工作区已有的包不要当成外部系统依赖；`-y` 自动确认；`-r` 单个失败继续。漏掉 `--ignore-src` 时，rosdep 会把 src 里自己定义的包名当成要安装的第三方包，在 rosdep 规则里查不到而报错。

**Q2：`--symlink-install` 为什么改 Python 能即时生效、改 C++ 却不行？**

参考要点：symlink-install 让 install 里的可执行/资源以符号链接指向源码，Python 是解释执行、脚本本体被链接，所以改完即生效；C++ 的可执行是 build/ 里的**编译产物**，改 .cpp 必须重新编译链接，符号链接只省了"复制到 install"这一步。

**Q3：先后 source 两个工作区，运行时报"ABI 不匹配 / 加载了错误的库"，最可能的根因是什么？**

参考要点：多工作区形成 underlay/overlay 链，`AMENT_PREFIX_PATH` 与 `LD_LIBRARY_PATH` 按 source 顺序叠加；若顺序错乱，运行时通过动态链接加载了 overlay 里不同版本/不同 ABI 的 `.so`，而代码却按另一套头文件编译。解法：固定 source 顺序、用 `printenv AMENT_PREFIX_PATH` 核查、必要时隔离环境（容器/conda）。
