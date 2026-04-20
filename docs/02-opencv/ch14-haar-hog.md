# 第十四章 · Haar 级联与 HOG+SVM

## 14.1 Haar 级联分类器

### 14.1.1 原理简述

Haar 级联 = 级联的弱分类器（Haar-like 特征），每个阶段过滤掉大部分非目标区域，只有少数区域通过。

```
图像金字塔 → 滑动窗口 → Haar 特征 → 级联分类器 → 检测结果
                                              ↑
                                    每个节点都是树分类器
```

### 14.1.2 使用预训练分类器

```python
import cv2

# ---- 加载预训练分类器 ----
# OpenCV 内置分类器（opencv/extra/data/haarcascades/）
cascade = cv2.CascadeClassifier()
cascade.load('haarcascade_frontalface_default.xml')
# 或者用 OpenCV 自带路径
cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# 常用预训练分类器
# haarcascade_frontalface_default.xml   — 人脸（正面）
# haarcascade_frontalface_alt2.xml      — 人脸（正面，替代版）
# haarcascade_eye.xml                    — 眼睛
# haarcascade_upperbody.xml              — 上半身
# haarcascade_fullbody.xml               — 全身

# ---- 检测 ----
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = cv2.equalizeHist(gray)  # 直方图均衡化提高检测率

faces = cascade.detectMultiScale(
    gray,
    scaleFactor=1.1,      # 图像金字塔缩放因子（越小越慢但更精确）
    minNeighbors=5,       # 每个候选框至少保留的邻居数（越大越严格）
    minSize=(30, 30),     # 最小检测窗口
    flags=cv2.CASCADE_SCALE_IMAGE
)

# faces = [(x, y, w, h), ...]
for (x, y, w, h) in faces:
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
```

### 14.1.3 detectMultiScale 参数详解

| 参数 | 说明 | 推荐值 |
|------|--|--|
| `scaleFactor` | 金字塔步长（>1.0） | 1.01–1.3（越小越精确但越慢） |
| `minNeighbors` | 最少保留邻居数 | 3–6（越大假阳性越少） |
| `minSize` | 最小检测窗口 | 视目标大小 |
| `maxSize` | 最大检测窗口 | 不限制 → 0 或 None |
| `flags` | 检测标志 | CASCADE_SCALE_IMAGE（默认） |

### 14.1.4 人脸检测完整示例

```python
def detect_faces(img):
    """人脸检测"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = cascade.detectMultiScale(
        gray, scaleFactor=1.05, minNeighbors=5,
        minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE
    )

    # NMS 合并重叠框
    if len(faces) > 0:
        boxes = faces.astype(float)
        scores = [0.0] * len(boxes)
        keep = non_max_suppression_fast(boxes, scores, overlapThresh=0.3)
        faces = faces[keep]

    return faces
```

## 14.2 HOG（Histogram of Oriented Gradients）

### 14.2.1 原理

HOG = 梯度方向直方图 — 将图像划分为 cell，统计每个 cell 的梯度方向分布，拼接成特征向量。Dalal & Trujillo (2005) 提出。

### 14.2.2 HOGDescriptor 使用

```python
hog = cv2.HOGDescriptor(
    winSize=(64, 128),      # 检测窗口大小
    blockSize=(16, 16),     # block 大小
    blockStride=(8, 8),     # block 步长
    cellSize=(8, 8),        # cell 大小
    nbins=9,                # 方向 bin 数
    winStride=(4, 4),       # 窗口步长
    histogramNormMethod=cv2.HOGDescriptor_L2Hys,  # L2-Hys 归一化
    gammaCorrection=True,     # 伽马校正
    SignedGrads=False         # True=使用带符号梯度（S-HOG）
)

# 检测
objects, weights = hog.detectMultiScale(
    gray,
    hitThreshold=0,         # 检测阈值
    winStride=(4, 4),
    padding=(8, 8),
    scale=1.05
)
# objects = [(x, y, w, h), ...]
# weights: 每个检测的响应值
```

### 14.2.3 默认 HOG 参数（行人检测）

```python
# OpenCV 内置的 HOG 默认参数（针对行人检测优化）
# winSize=(64, 128), blockSize=(16, 16), cellSize=(8, 8), nbins=9
# 适合检测 128×64 的目标（典型行人尺度）

# 如果想检测其他尺寸的目标，需要重新调整 winSize/cellSize
# 一般规则: winSize / cellSize 应为整数（通常 8 的倍数）
```

## 14.3 SVM 分类器

### 14.3.1 训练自定义 SVM 分类器

```python
# 训练 SVM 用于自定义目标检测
import cv2
import numpy as np

# 假设有训练数据和标签
# trainData: np.array (N, D) 浮点特征
# labels: np.array (N, 1) 类别标签 (±1)
trainData = np.loadtxt('features.txt')  # (N, 3780) — 64×128 HOG 特征
labels = np.loadtxt('labels.txt')       # (N, 1) ±1

svm = cv2.SVM_create()
svm.setType(cv2.SVM_C_SVC)
svm.setC(0.01)
svm.setKernel(cv2.SVM_LINEAR)  # 线性核（HOG 特征通常用线性）
svm.setTermCriteria((cv2.TERM_CRITERIA_MAX_ITER, 100, 1e-6))
svm.train(trainData, cv2.ROW_SAMPLE, labels)

# 保存模型
svm.save('my_svm.xml')

# 加载模型
svm2 = cv2.SVM_create()
svm2.load('my_svm.xml')
```

### 14.3.2 SVM 参数速查

| 参数 | 说明 | 推荐 |
|------|--|--|
| `type` | SVM 类型 (C_SVC, NU_SVC, EPS_SVR, NU_SVR, ONE_CLASS) | C_SVC |
| `kernel` | 核函数 (LINEAR, POLY, RBF, SIGMOID) | LINEAR（HOG）/ RBF（其他） |
| `C` | 惩罚参数 | 0.001–100 |
| `degree` | 多项式核阶数 | 3 |
| `gamma` | RBF/SIGMOID 核参数 | 1/n_features |
| `coef0` | SIGMOID 核偏置 | 0 |
| `termCriteria` | 训练终止条件 | max_iter=100, eps=1e-6 |

## 14.4 Haar 级联与 HOG 对比

| 特性 | Haar 级联 | HOG+SVM |
|------|--|--|
| 训练难度 | 已有预训练模型 | 需自己训练 |
| 检测速度 | ⚡ 快 | ⚡⚡ 中等 |
| 精度 | 一般 | 较高 |
| 适用场景 | 人脸/人体（已有模型） | 自定义目标检测 |
| 灵活性 | 低（依赖预训练） | 高（可自定义） |
| 鲁棒性 | 低（姿态/尺度敏感） | 中等 |

## 14.5 实用技巧

### 14.5.1 多尺度 Haar 检测优化

```python
# 1. 先检测大窗口，只在检测到的区域缩小检测
# 2. 金字塔降采样 + 逐级检测
def hierarchical_face_detection(img):
    """分层检测 — 先大窗口快速定位，再精细检测"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    # 先降采样检测大脸
    small = cv2.pyrDown(img)
    small_gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    small_gray = cv2.equalizeHist(small_gray)

    faces_coarse = cascade.detectMultiScale(small_gray, scaleFactor=1.3, minNeighbors=2, minSize=(20,20))

    if len(faces_coarse) > 0:
        # 在检测区域做精细检测
        for (x, y, w, h) in faces_coarse:
            roi = gray[y*2:y*2+h*2, x*2:x*2+w*2]
            faces_fine = cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=5, minSize=(10,10))
            for (fx, fy, fw, fh) in faces_fine:
                cv2.rectangle(img, (x*2+fx, y*2+fy), (x*2+fx+fw, y*2+fy+fh), (0, 255, 0), 2)
```

---

> 下一章：[第十五章 · DNN 目标检测](ch15-dnn-detection.md) →
