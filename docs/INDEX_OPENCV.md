# OpenCV 学习/使用参考文档

> **定位**：面向开发者的 OpenCV 实战速查手册，覆盖从环境搭建到高级应用的全流程。
>
> **版本目标**：OpenCV 4.x（Python / C++）
>
> **最后更新**：2026-04-20

---

## 📁 目录结构

```
01-基础篇/                      
├── ch01-introduction.md         # 第一章  简介与安装
├── ch02-core-structures.md      # 第二章  核心数据结构
├── ch03-pixel-operations.md     # 第三章  像素级图像操作
└── ch04-geometric-transforms.md # 第四章  几何变换
02-图像处理/           
├── ch05-filtering.md            # 第五章  图像滤波
├── ch06-morphology.md           # 第六章  形态学操作
├── ch07-histograms.md           # 第七章  直方图与图像增强
├── ch08-thresholding.md         # 第八章  图像阈值与分割
└── ch09-convolution-frequency.md # 第九章  卷积与频域处理
03-特征与匹配/            
├── ch10-edge-corner-detection.md # 第十章 边缘与角点检测
├── ch11-feature-detection.md    # 第十一章 特征检测与描述
├── ch12-feature-matching.md     # 第十二章 特征匹配与 RANSAC
└── ch13-template-matching.md    # 第十三章 模板匹配
04-目标检测与跟踪/      
├── ch14-haar-hog.md             # 第十四章 Haar 级联与 HOG+SVM
├── ch15-dnn-detection.md        # 第十五章 DNN 目标检测
├── ch16-optical-flow.md         # 第十六章 光流与运动分析
└── ch17-object-tracking.md      # 第十七章 目标跟踪
05-相机与三维/         
├── ch18-camera-calibration.md   # 第十八章 相机标定与校正
├── ch19-stereo-vision.md        # 第十九章 立体视觉与深度估计
└── ch20-pnp-pose-estimation.md  # 第二十章 PnP 与位姿估计
06-机器学习/           
├── ch21-knn-svm-dt.md           # 第二十一章 KNN / SVM / 决策树
├── ch22-kmeans-quantization.md  # 第二十二章 K-Means / 图像量化
└── ch23-hog-pedestrian.md       # 第二十三章 HOG / 行人检测
07-高级与实战/              
├── ch24-dnn-deep.md             # 第二十四章 DNN 模块深入
├── ch25-video-processing.md     # 第二十五章 视频处理
├── ch26-gui-interaction.md      # 第二十六章 GUI 与交互
├── ch27-cuda-acceleration.md    # 第二十七章 CUDA 加速
└── ch28-cases.md                # 第二十八章 实战案例集
08-附录/                   
├── appendix-api-reference.md    # API 速查表
├── appendix-coordinates-formulas.md # 坐标系与变换公式
├── appendix-faq.md              # 常见问题 FAQ
└── appendix-resources.md        # 资源与延伸阅读
```

---

## 📑 章节导航

### Part I · 基础篇

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 1 | [简介与安装](./02-opencv/01-基础篇/ch01-introduction.md) | OpenCV 概述、架构、安装配置 | ✅ |
| 2 | [核心数据结构](./02-opencv/01-基础篇/ch02-core-structures.md) | Mat、ROI、通道、内存管理 | ✅ |
| 3 | [像素级图像操作](./02-opencv/01-基础篇/ch03-pixel-operations.md) | 读写、算术、逻辑、查表 | ✅ |
| 4 | [几何变换](./02-opencv/01-基础篇/ch04-geometric-transforms.md) | 平移/缩放/旋转/仿射/透视 | ✅ |

### Part II · 图像处理

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 5 | [图像滤波](./02-opencv/02-图像处理/ch05-filtering.md) | 平滑、锐化、中值/双边/引导滤波 | ✅ |
| 6 | [形态学操作](./02-opencv/02-图像处理/ch06-morphology.md) | 膨胀/腐蚀/开闭/顶帽/黑帽 | ✅ |
| 7 | [直方图与图像增强](./02-opencv/02-图像处理/ch07-histograms.md) | 直方图计算、均衡化、CLAHE、色彩空间转换 | ✅ |
| 8 | [图像阈值与分割](./02-opencv/02-图像处理/ch08-thresholding.md) | 全局/自适应阈值、Otsu、分水岭、GrabCut | ✅ |
| 9 | [卷积与频域处理](./02-opencv/02-图像处理/ch09-convolution-frequency.md) | 2D 卷积、FFT/DFT、频域滤波 | ✅ |

### Part III · 特征与匹配

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 10 | [边缘与角点检测](./02-opencv/03-特征与匹配/ch10-edge-corner-detection.md) | Canny、Sobel、Laplacian、Harris、GoodFeatures | ✅ |
| 11 | [特征检测与描述](./02-opencv/03-特征与匹配/ch11-feature-detection.md) | ORB、SIFT、SURF、AKAZE、BRISK | ✅ |
| 12 | [特征匹配与 RANSAC](./02-opencv/03-特征与匹配/ch12-feature-matching.md) | BFMatcher/FlannMatcher、暴力匹配、单应性矩阵 | ✅ |
| 13 | [模板匹配](./02-opencv/03-特征与匹配/ch13-template-matching.md) | matchTemplate、多目标匹配 | ✅ |

### Part IV · 目标检测与跟踪

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 14 | [Haar 级联与 HOG+SVM](./02-opencv/04-目标检测与跟踪/ch14-haar-hog.md) | CascadeClassifier、HOGDescriptor | ✅ |
| 15 | [DNN 目标检测](./02-opencv/04-目标检测与跟踪/ch15-dnn-detection.md) | YOLO/SSD/MobileNet 推理、ONNX 加载 | ✅ |
| 16 | [光流与运动分析](./02-opencv/04-目标检测与跟踪/ch16-optical-flow.md) | Lucas-Kanade、Farneback、背景减除 | ✅ |
| 17 | [目标跟踪](./02-opencv/04-目标检测与跟踪/ch17-object-tracking.md) | CSRT/MOSSE/KCF/MedianFlow 跟踪器 | ✅ |

### Part V · 相机与三维

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 18 | [相机标定与校正](./02-opencv/05-相机与三维/ch18-camera-calibration.md) | 棋盘标定、畸变校正、鱼眼模型 | ✅ |
| 19 | [立体视觉与深度估计](./02-opencv/05-相机与三维/ch19-stereo-vision.md) | 立体匹配、BM/SGBM、视差图、3D 重建 | ✅ |
| 20 | [PnP 与位姿估计](./02-opencv/05-相机与三维/ch20-pnp-pose-estimation.md) | solvePnP、solvePNPRefine、DRPTam | ✅ |

### Part VI · 机器学习

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 21 | [KNN / SVM / 决策树](./02-opencv/06-机器学习/ch21-knn-svm-dt.md) | 传统 ML 分类与回归 | ✅ |
| 22 | [K-Means / 图像量化](./02-opencv/06-机器学习/ch22-kmeans-quantization.md) | K-Means 聚类、颜色量化、码本 | ✅ |
| 23 | [HOG / 行人检测](./02-opencv/06-机器学习/ch23-hog-pedestrian.md) | HOG 特征、Dalal-Trujillo 行人检测 | ✅ |

### Part VII · 高级与实战

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| 24 | [DNN 模块深入](./02-opencv/07-高级与实战/ch24-dnn-deep.md) | 图像分类、语义分割、人脸识别、姿态估计 | ✅ |
| 25 | [视频处理](./02-opencv/07-高级与实战/ch25-video-processing.md) | 视频读写、编解码、帧差/背景建模 | ✅ |
| 26 | [GUI 与交互](./02-opencv/07-高级与实战/ch26-gui-interaction.md) | imshow、鼠标/键盘事件、TrackBar、窗口 | ✅ |
| 27 | [CUDA 加速](./02-opencv/07-高级与实战/ch27-cuda-acceleration.md) | gpu 模块、CUDA 编译、性能调优 | ✅ |
| 28 | [实战案例集](./02-opencv/07-高级与实战/ch28-cases.md) | 车牌识别、文档扫描、AR 叠加、OCR 等 | ✅ |

### Part VIII · 附录

| # | 章节 | 内容概要 | 状态 |
|---|---|-----|---|
| A | [常用 API 速查表](./02-opencv/08-附录/appendix-api-reference.md) | Python API 分类索引 | 🔲 |
| B | [坐标系与变换公式](./02-opencv/08-附录/appendix-coordinates-formulas.md) | 像素/相机/世界坐标、内外参 | 🔲 |
| C | [常见问题 FAQ](./02-opencv/08-附录/appendix-faq.md) | 安装报错、版本兼容、性能优化 | 🔲 |
| D | [资源与延伸阅读](./02-opencv/08-附录/appendix-resources.md) | 官方文档、书籍、课程、论文 | 🔲 |

---

## 🗺️ 学习路线

```
基础 (Part I)      图像处理 (Part II)     特征与匹配 (Part III)    目标检测 (Part IV)
─────────     ───────────────     ─────────────────    ───────────────
数据结构 → 像素操作 → 几何变换 → 滤波 → 形态学 → 阈值 → 直方图
    │                       │                      │                 │
    ▼                       ▼                      ▼                 ▼
理解 OpenCV              核心图像处理           特征点提取          目标检测
基础框架                 流水线                  与匹配              与跟踪
```

**推荐学习顺序：**

1. **Part I** — 先掌握 OpenCV 基础框架（数据结构 → 像素操作 → 几何变换）
2. **Part II** — 核心图像处理流水线（滤波 → 形态学 → 阈值 → 直方图 → 频域）
3. **Part III** — 特征点提取与匹配（边缘/角点 → 特征检测 → 匹配 → 模板匹配）
4. **Part IV** — 目标检测与跟踪（Haar/HOG → DNN → 光流 → 目标跟踪）
5. **Part V** — 相机与三维（标定 → 立体视觉 → PnP 位姿）
6. **Part VI** — 机器学习（KNN/SVM → K-Means → HOG 行人检测）
7. **Part VII** — 高级与实战（DNN 深入 → 视频 → GUI → CUDA → 案例）

---

## 🚀 快速导航

- 🎯 **入门路线**：第 1→2→3→5→8 章 → 第 15 章（实战检测）
- 🔍 **特征匹配**：第 11→12 章
- 📷 **相机标定**：第 18→19 章
- 🚗 **自动驾驶参考**：第 8→15→16 章

## 📝 约定

- 代码示例优先 Python（`cv2`），关键部分附 C++ 对照
- API 调用统一写全称，不省略模块名（如 `cv2.GaussianBlur` 而非 `GaussianBlur`）
- 参数以 Python 签名为主，必要时标注 C++ 差异

---

> 文档持续更新中。如有勘误或建议，欢迎提交。
