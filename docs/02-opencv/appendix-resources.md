# 附录 D · 资源与延伸阅读

## D.1 官方资源

| 资源 | 链接 |
|------|--|
| 官方站点 | https://opencv.org |
| 官方文档 | https://docs.opencv.org |
| GitHub 源码 | https://github.com/opencv/opencv |
| 贡献模块 | https://github.com/opencv/opencv_contrib |
| 讨论区 | https://github.com/opencv/opencv/discussions |
| API 速查 | https://docs.opencv.org/4.x/ |
| 教程 (tutorials.opencv.org) | https://tutorials.opencv.org |
| OpenCV Blog | https://blog.opencv.org |

## D.2 经典书籍

| 书名 | 作者 | 评价 |
|------|--|--|
| **OpenCV 3 Blueprints** | Miguel Ángel González | 项目驱动，推荐 ✅ |
| **Learning OpenCV 3** | Bradski & Kaehler | 权威参考 |
| **OpenCV 4 Computer Vision** | John R. Davis | 实战导向 |
| **OpenCV with Python by Example** | Peter O'Ches | 入门友好 |
| **Programming Computer Vision with Python** | Julian Eisemann | 学术 |
| **Mastering OpenCV** | William E. Wagoner | 高级 |

## D.3 在线课程

| 课程 | 平台 | 说明 |
|------|--|--|
| Computer Vision Nanodegree | Udacity | 系统学习 ✅ |
| OpenCV for Visual Tracking | Udemy | 目标跟踪 |
| OpenCV Masterclass | Udemy | 实战案例 |
| Image Processing | Coursera (Michigan) | 理论 |
| OpenCV Python Tutorial | freeCodeCamp (YouTube) | 免费视频 |
| OpenCV 中文教程 | opencvpython.com | 中文 ✅ |

## D.4 论文

| 论文 | 年份 | 贡献 |
|------|--|--|
| **SIFT** (Lowe) | 2004 | 尺度不变特征 |
| **ORB** (Rublee) | 2011 | 快速免费特征 |
| **HOG** (Dalal & Trujillo) | 2005 | 行人检测 |
| **Canny** (Canny) | 1986 | 边缘检测 |
| **SURF** (Bay et al.) | 2006 | 加速特征 |
| **AKAZE** (Malisiewicz & Malis) | 2013 | 非线性尺度 |
| **Papers on OpenCV features** | — | 按模块阅读原始论文 |

## D.5 社区与工具

| 资源 | 说明 |
|------|--|
| Stack Overflow [opencv] | 问答社区 |
| OpenCV Discord | 实时交流 |
| dlday.net | 中文深度学习社区 |
| AIUI | AI UI 开发 |
| OpenCV on GitHub Issues | 问题追踪 |
| opencv_extra | 测试图像/视频 |
| OpenCV on Hugging Face | 预训练模型 |
| OpenCV Tutorials Website | 官方教程 |

## D.6 相关库

| 库 | 与 OpenCV 关系 |
|------|--|
| NumPy | 底层数组支持 |
| scikit-image | 互补（科研） |
| scikit-learn | ML 补充 |
| Pillow | 简单图像处理 |
| Tesseract | OCR 补充 |
| DeepFace | 人脸识别高层 API |
| detectron2 | SOTA 目标检测 |
| YOLO (ultralytics) | 目标检测 |
| albumentations | 数据增强 |
| Pillow-SIM | 图像比较 |
| matplotlib | 可视化 |
| TensorRT | GPU 加速推理 |
| ONNX Runtime | 模型推理 |
| OpenVINO | Intel 优化推理 |
| DNN | OpenCV 内置深度学习模块 |
| DALI | NVIDIA GPU 数据管道 |
| RAPIDS | NVIDIA GPU 数据处理 |
| cuDNN | GPU 深度学习加速 |

## D.7 推荐学习路径

```
初学者 (0-3 月):
  1. OpenCV Python 入门
  2. 图像基础操作 (读写、色彩、滤波)
  3. 简单实战 (人脸检测、车牌识别)

进阶者 (3-6 月):
  1. 相机标定 + 立体视觉
  2. 特征匹配 + 透视变换
  3. DNN 目标检测

高级 (6-12 月):
  1. CUDA 加速
  2. 自定义模型 + ONNX
  3. 性能优化
  4. 工业部署
```

## D.8 推荐实战项目

| 难度 | 项目 | 涉及知识点 |
|------|--|--|
| ⭐ | 人脸识别门禁 | HaarCascade / DNN |
| ⭐ | 文档扫描 | Canny + 透视变换 |
| ⭐ | 车牌识别 | 颜色分割 + OCR |
| ⭐⭐ | 手势控制 | HSV 分割 + 关键点 |
| ⭐⭐ | 视频运动检测 | 背景建模 |
| ⭐⭐ | AR 叠加 | 相机标定 + PnP |
| ⭐⭐ | 实时跟踪器 | CSRT/KCF |
| ⭐⭐⭐ | 多目标跟踪 | YOLO + ByteTrack |
| ⭐⭐⭐ | 全景拼接 | SIFT + Homography |
| ⭐⭐⭐ | 自动驾驶辅助 | DNN + 车道线检测 |
