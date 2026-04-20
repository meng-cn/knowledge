# OpenCV 学习/使用参考文档

> **定位**：面向开发者的 OpenCV 实战速查手册，覆盖从环境搭建到高级应用的全流程。
>
> **版本目标**：OpenCV 4.x（Python / C++）
>
> **最后更新**：2026-04-20

---

## 目录

### Part I · 基础篇

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 1 | [简介与安装](./02-opencv/ch01-introduction.md) | OpenCV 概述、架构、安装配置 | ✅ |
| 2 | [核心数据结构](./02-opencv/ch02-core-structures.md) | Mat、ROI、通道、内存管理 | ✅ |
| 3 | [像素级图像操作](./02-opencv/ch03-pixel-operations.md) | 读写、算术、逻辑、查表 | ✅ |
| 4 | [几何变换](./02-opencv/ch04-geometric-transforms.md) | 平移/缩放/旋转/仿射/透视 | ✅ |

### Part II · 图像处理

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 5 | [图像滤波](./02-opencv/ch05-filtering.md) | 平滑、锐化、中值/双边/引导滤波 | ✅ |
| 6 | [形态学操作](./02-opencv/ch06-morphology.md) | 膨胀/腐蚀/开闭/顶帽/黑帽 | ✅ |
| 7 | [直方图与图像增强](./02-opencv/ch07-histograms.md) | 直方图计算、均衡化、CLAHE、色彩空间转换 | ✅ |
| 8 | [图像阈值与分割](./02-opencv/ch08-thresholding.md) | 全局/自适应阈值、Otsu、分水岭、GrabCut | ✅ |
| 9 | [卷积与频域处理](./02-opencv/ch09-convolution-frequency.md) | 2D 卷积、FFT/DFT、频域滤波 | ✅ |

### Part III · 特征与匹配

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 10 | [边缘与角点检测](./02-opencv/ch10-edge-corner-detection.md) | Canny、Sobel、Laplacian、Harris、GoodFeatures | ✅ |
| 11 | [特征检测与描述](./02-opencv/ch11-feature-detection.md) | ORB、SIFT、SURF、AKAZE、BRISK | ✅ |
| 12 | [特征匹配与 RANSAC](./02-opencv/ch12-feature-matching.md) | BFMatcher/FlannMatcher、暴力匹配、单应性矩阵 | ✅ |
| 13 | [模板匹配](./02-opencv/ch13-template-matching.md) | matchTemplate、多目标匹配 | ✅ |

### Part IV · 目标检测与跟踪

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 14 | [Haar 级联与 HOG+SVM](./02-opencv/ch14-haar-hog.md) | CascadeClassifier、HOGDescriptor | ✅ |
| 15 | [DNN 目标检测](./02-opencv/ch15-dnn-detection.md) | YOLO/SSD/MobileNet 推理、ONNX 加载 | ✅ |
| 16 | [光流与运动分析](./02-opencv/ch16-optical-flow.md) | Lucas-Kanade、Farneback、背景减除 | ✅ |
| 17 | [目标跟踪](./02-opencv/ch17-object-tracking.md) | CSRT/MOSSE/KCF/MedianFlow 跟踪器 | ✅ |

### Part V · 相机与三维

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 18 | [相机标定与校正](./02-opencv/ch18-camera-calibration.md) | 棋盘标定、畸变校正、鱼眼模型 | ✅ |
| 19 | [立体视觉与深度估计](./02-opencv/ch19-stereo-vision.md) | 立体匹配、BM/SGBM、视差图、3D 重建 | ✅ |
| 20 | [PnP 与位姿估计](./02-opencv/ch20-pnp-pose-estimation.md) | solvePnP、solvePNPRefine、DRPTam | ✅ |

### Part VI · 机器学习

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 21 | [KNN / SVM / 决策树](./02-opencv/ch21-knn-svm-dt.md) | 传统 ML 分类与回归 | ✅ |
| 22 | [K-Means / 图像量化](./02-opencv/ch22-kmeans-quantization.md) | K-Means 聚类、颜色量化、码本 | ✅ |
| 23 | [HOG / 行人检测](./02-opencv/ch23-hog-pedestrian.md) | HOG 特征、Dalal-Trujillo 行人检测 | ✅ |

### Part VII · 高级与实战

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| 24 | [DNN 模块深入](./02-opencv/ch24-dnn-deep.md) | 图像分类、语义分割、人脸识别、姿态估计 | ✅ |
| 25 | [视频处理](./02-opencv/ch25-video-processing.md) | 视频读写、编解码、帧差/背景建模 | ✅ |
| 26 | [GUI 与交互](./02-opencv/ch26-gui-interaction.md) | imshow、鼠标/键盘事件、TrackBar、窗口 | ✅ |
| 27 | [CUDA 加速](./02-opencv/ch27-cuda-acceleration.md) | gpu 模块、CUDA 编译、性能调优 | ✅ |
| 28 | [实战案例集](./02-opencv/ch28-cases.md) | 车牌识别、文档扫描、AR 叠加、OCR 等 | ✅ |

### Part VIII · 附录

| # | 章节 | 内容概要 | 状态 |
|---|------|---------|------|
| A | [常用 API 速查表](./02-opencv/appendix-api-reference.md) | Python API 分类索引 | 🔲 |
| B | [坐标系与变换公式](./02-opencv/appendix-coordinates-formulas.md) | 像素/相机/世界坐标、内外参 | 🔲 |
| C | [常见问题 FAQ](./02-opencv/appendix-faq.md) | 安装报错、版本兼容、性能优化 | 🔲 |
| D | [资源与延伸阅读](./02-opencv/appendix-resources.md) | 官方文档、书籍、课程、论文 | 🔲 |

---

## 快速导航

- 🎯 **入门路线**：第 1→2→3→5→8 章 → 第 15 章（实战检测）
- 🔍 **特征匹配**：第 11→12 章
- 📷 **相机标定**：第 18→19 章
- 🚗 **自动驾驶参考**：第 8→15→16 章

## 约定

- 代码示例优先 Python（`cv2`），关键部分附 C++ 对照
- API 调用统一写全称，不省略模块名（如 `cv2.GaussianBlur` 而非 `GaussianBlur`）
- 参数以 Python 签名为主，必要时标注 C++ 差异

---

> 文档持续更新中。如有勘误或建议，欢迎提交。
