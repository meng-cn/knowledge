# 第一章 · 简介与安装

## 1.1 什么是 OpenCV

OpenCV（**Open Source Computer Vision Library**）是一个跨平台的计算机视觉与机器学习开源库，最初由 Intel 于 1999 年发起，后由 [Willow Garage](https://www.willowgarage.com/) 和 [Itseex](https://www.itseex.com/) 持续发展，现由 [OpenCV.org](https://opencv.org) 社区维护。

### 核心设计哲学

| 原则 | 说明 |
|------|------|
| **模块化** | 功能按模块拆分，按需编译/链接 |
| **高性能** | 底层 C/C++ + SIMD/GPU 加速 |
| **易用性** | Python / Java / JS 等语言绑定，API 统一 |
| **可扩展** | 插件式架构，支持自定义处理节点 |

### 主要组件

```
OpenCV
├── opencv_core      — 核心数据结构（Mat、Vec、Point 等）
├── opencv_imgproc   — 图像处理（滤波、形态学、色彩空间等）
├── opencv_imgcodecs — 图像 I/O（读/写/编解码）
├── opencv_video     — 视频处理
├── opencv_features2d — 特征检测与描述
├── opencv_objdetect  — 目标检测（级联分类器、HOG 等）
├── opencv_calib3d   — 相机标定、立体视觉、PnP
├── opencv_dnn       — 深度学习推理
├── opencv_ml        — 传统机器学习（SVM、KNN、RF 等）
├── opencv_flann     — 快速最近邻搜索
├── opencv_photo     — 图像修复、风格迁移
├── opencv_stitching  — 图像拼接
└── opencv_cuda*     — GPU 加速模块
```

## 1.2 架构概览

```
┌─────────────────────────────────────────┐
│           Application Layer              │
│  Python  │  C++  │  Java  │  JavaScript │
├─────────────────────────────────────────┤
│            High-Level API               │
│  cv2.xxxx()  /  cv::xxx()               │
├─────────────────────────────────────────┤
│              Core Layer                  │
│  Mat (n-dim array) │  ROI │  Memory Pool │
├─────────────────────────────────────────┤
│           Backend Engines                │
│  CPU (SSE/AVX/NEON)  │  GPU (CUDA/OpenCL)│
└─────────────────────────────────────────┘
```

**关键概念 — `Mat`**：OpenCV 的图像/矩阵核心类型，支持自动内存管理、引用计数、零拷贝操作。

## 1.3 版本说明

| 版本线 | 状态 | 说明 |
|--------|------|------|
| **3.x** | 维护模式 | 仍有大量存量项目在用 |
| **4.x** | **活跃开发** | 当前主流版本线（2026 年 ~4.10+） |
| contrib | 附加模块 | 含 SIFT/SURF、face、xfeatures2d 等 |

### 3.x → 4.x 主要变化

- 专利算法（SIFT/SURF）移入 `opencv-contrib-python`，基础包改用免费 SURF 替代 `xfeatures2d`
- DNN 模块功能大幅增强（支持 YOLO、SSD、MobileNet、ONNX Runtime 等）
- `cv2.goodFeaturesToTrack` 参数风格统一
- API 命名规范化：`cv2.cv` 已废弃，所有符号通过 `cv2.` 直接访问

## 1.4 安装

### 1.4.1 Python

```bash
# ---- 基础版（不含专利算法） ----
pip install opencv-python

# ---- 含 contrib 模块（含 SIFT、SURF 等） ----
pip install opencv-contrib-python

# ---- 完整版（含全部可选依赖） ----
pip install opencv-python-headless   # 服务器/无 GUI 环境
pip install opencv-contrib-python-headless
```

```python
# 验证安装
import cv2
print(cv2.__version__)
# 输出示例: 4.10.0
```

### 1.4.2 C++ 源码编译

```bash
# 1. 克隆源码
git clone --branch 4.10.0 https://github.com/opencv/opencv.git
git clone --branch 4.10.0 https://github.com/opencv/opencv_contrib.git

# 2. 配置（示例：开启 CUDA + Python 绑定）
cd opencv
mkdir build && cd build
cmake .. \
  -DOPENCV_EXTRA_MODULES_PATH=../../opencv_contrib/modules \
  -DCMAKE_BUILD_TYPE=Release \
  -DWITH_CUDA=ON \
  -DWITH_python=ON \
  -DPYTHON3_EXECUTABLE=$(which python3) \
  -DPYTHON3_INCLUDE_DIR=$(python3 -c "from sysconfig import get_paths; print(get_paths()['include'])") \
  -DPYTHON3_PACKAGES_PATH=$(python3 -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())")

# 3. 编译
make -j$(nproc)

# 4. 安装
sudo make install
```

### 1.4.3 其他平台

```bash
# ---- Conda ----
conda install -c conda-forge opencv

# ---- macOS (brew) ----
brew install opencv

# ---- Ubuntu/Debian (apt) ----
sudo apt update && sudo apt install python3-opencv

# ---- Windows (NuGet) ----
dotnet add package OpenCvSharp4
```

## 1.5 第一个程序

### Python

```python
import cv2
import numpy as np

# 1. 创建一张空白图像
img = np.zeros((480, 640, 3), dtype=np.uint8)  # 640x480 三通道

# 2. 画一条线
cv2.line(img, (0, 0), (639, 479), (0, 255, 0), 2)

# 3. 显示
cv2.imshow('Hello OpenCV', img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### C++

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>

int main() {
    cv::Mat img(480, 640, CV_8UC3, cv::Scalar(0, 0, 0));
    cv::line(img, cv::Point(0, 0), cv::Point(639, 479),
             cv::Scalar(0, 255, 0), 2);
    cv::imshow("Hello OpenCV", img);
    cv::waitKey(0);
    return 0;
}
```

编译：
```bash
g++ -o hello `pkg-config --cflags --libs opencv4` hello.cpp
./hello
```

## 1.6 OpenCV vs 其他视觉库

| 对比维度 | OpenCV | Pillow | scikit-image | Detectron2 |
|----------|--------|--------|--------------|------------|
| 定位 | **全能视觉库** | 轻量图像处理 | 学术科研 | 深度学习检测 |
| 速度 | ⚡ 快（C++ 底层） | 慢（纯 Python） | 中等 | 取决于后端 |
| 功能覆盖 | ★★★★★ | ★★☆ | ★★★ | ★★☆ |
| 学习曲线 | 中等 | 低 | 中等 | 高 |
| 适合场景 | **工业/产品/入门** | 简单编辑 | 论文实验 | SOTA 模型 |

**推荐**：入门和工程落地首选 OpenCV；轻量场景用 Pillow；学术研究结合 Detectron2/MMDetection 等。

## 1.7 官方资源

| 资源 | 链接 |
|------|------|
| 官方站点 | <https://opencv.org> |
| 文档 | <https://docs.opencv.org> |
| GitHub | <https://github.com/opencv/opencv> |
| 社区 | <https://github.com/opencv/opencv/discussions> |
| API 速查 | <https://docs.opencv.org/4.x/index.html> |

---