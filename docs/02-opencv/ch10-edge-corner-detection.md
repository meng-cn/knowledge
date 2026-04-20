# 第十章 · 边缘与角点检测

## 10.1 Sobel 算子

### 10.1.1 基本原理

Sobel 算子检测一阶导数（梯度），对边缘的方向敏感。

```python
import cv2
import numpy as np

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# X 方向（检测垂直边缘）
sobel_x = cv2.Sobel(gray, cv2.CV_32F, dx=1, dy=0, ksize=3)
sobel_x_abs = cv2.convertScaleAbs(sobel_x)

# Y 方向（检测水平边缘）
sobel_y = cv2.Sobel(gray, cv2.CV_32F, dx=0, dy=1, ksize=3)
sobel_y_abs = cv2.convertScaleAbs(sobel_y)

# 综合
edges = cv2.addWeighted(sobel_x_abs, 0.5, sobel_y_abs, 0.5, 0)
```

### 10.1.2 Scharr 算子（Sobel 的改进版）

```python
# Scharr 是优化的 3×3 算子，精度高于 Sobel
scharr_x = cv2.Scharr(gray, cv2.CV_32F, 1, 0)
scharr_y = cv2.Scharr(gray, cv2.CV_32F, 0, 1)
edges = cv2.addWeighted(cv2.convertScaleAbs(scharr_x), 0.5,
                         cv2.convertScaleAbs(scharr_y), 0.5, 0)
```

### 10.1.3 Sobel/Scharr 对比

| 特性 | Sobel | Scharr |
|------|-------|--------|
| 核大小 | 3/5/7 | 固定 3×3 |
| 精度 | 良好 | 更高（最优旋转对称性） |
| 速度 | 快 | 略慢（但 3×3 差异极小） |
| 推荐 | ksize≥5 时 | 3×3 精确边缘 ✅ |

## 10.2 Laplacian 算子

检测二阶导数 — 对**快速变化**敏感（比 Sobel 对噪声更敏感）。

```python
# 拉普拉斯算子
laplacian = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
laplacian_abs = cv2.convertScaleAbs(laplacian)

# ksize: 3, 5, 7 — 越大对噪声越鲁棒，但细节丢失

# 通常先高斯平滑再用 Laplacian
blurred = cv2.GaussianBlur(gray, (3, 3), 0)
laplacian = cv2.Laplacian(blurred, cv2.CV_32F)
laplacian_abs = cv2.convertScaleAbs(laplacian)

# Laplacian 的边缘：零交叉点 = 边缘位置
```

## 10.3 Canny 边缘检测（完整解析）

### 10.3.1 Canny 算法流程

```
1. 高斯模糊 → 去噪声
2. 计算梯度幅值和方向（Sobel）
3. 非极大值抑制 → 细化边缘（单像素宽）
4. 双阈值 + 滞后 → 检测强/弱边缘
5. 弱边缘关联 → 只有与强边缘相连的弱边缘才保留
```

### 10.3.2 使用 Canny

```python
# 基础用法
edges = cv2.Canny(gray, threshold1=50, threshold2=150, apertureSize=3, L2gradient=True)

# ---- 参数详解 ----
# threshold1 (低阈值): 低于此值的边缘点被丢弃
# threshold2 (高阈值): 高于此值的边缘点被保留
# 双阈值之间的点: 仅当与高阈值点相连时才保留

# apertureSize: Sobel 算子核大小 (3, 5, 7)
# L2gradient: True = L2 范数计算梯度幅值（更精确）
```

### 10.3.3 Canny 参数选择指南

| 图像类型 | t1 | t2 | 比例 | 说明 |
|------|--|--|--|--|
| 清晰照片 | 30 | 100 | 1:3 | 默认 |
| 模糊/噪声图 | 80 | 160 | 1:2 | 提高阈值抗噪 |
| 精细边缘 | 20 | 60 | 1:3 | 检测弱边缘 |
| 粗边缘 | 150 | 250 | 1:2 | 减少假边缘 |
| 自动 Otsu | `None` | `None` | — | 先用高斯+Otsu自动确定 |

### 10.3.4 Canny 进阶：多尺度边缘检测

```python
def multi_scale_canny(img, scales=[1.0, 0.5, 0.25]):
    """多尺度 Canny 边缘检测"""
    edges_list = []
    for scale in scales:
        h, w = img.shape[:2]
        small = cv2.resize(img, (int(w*scale), int(h*scale)))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (3,3), 0.5)
        edges = cv2.Canny(blur, 30, 100)
        edges_list.append(edges)
    return edges_list
```

## 10.4 Harris 角点检测

### 10.4.1 基本原理

角点 = 两个方向上梯度变化都大的点。Harris 通过**局部自相关矩阵**的行列式和迹来判断。

```python
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = np.float32(gray)

# Harris 角点检测
# dstQuality: 响应值归一化分母
# k: Harris 检测器参数 (0.04-0.06 常用)
dst = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)

# 膨胀角点响应图使角点更明显
dst = cv2.dilate(dst, None)

# 阈值 — 响应值超过最大值的 1% 为角点
ret, thresh = cv2.threshold(dst, 0.01*dst.max(), 255, cv2.THRESH_BINARY)

# 可视化
img_corners = img.copy()
img_corners[thresh > 0] = [0, 255, 0]  # 角点标绿
cv2.imshow('Harris Corners', img_corners)
cv2.waitKey(0)
```

## 10.5 Shi-Tomasi 角点检测（推荐 ✅）

### 10.5.1 原理

Shi-Tomasi = Harris 的改进版 — 用**两个特征值中较小的那个**（而非差值）作为角点度量，更鲁棒。

```python
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# goodFeaturesToTrack — 检测 N 个最佳角点
# maxCorners: 最大角点数（0=不限制）
# qualityLevel: 最小特征值阈值（角点质量，0-1）
# minDistance: 角点间最小欧氏距离
# blockSize: 梯度矩估计区域大小
# useHarrisDetector: 是否用 Harris 而非 Shi-Tomasi
# k: Harris 参数（仅 useHarrisDetector=True 时有效）

corners = cv2.goodFeaturesToTrack(
    gray,
    maxCorners=100,
    qualityLevel=0.01,
    minDistance=10,
    blockSize=3,
    useHarrisDetector=False,  # Shi-Tomasi（默认）
    k=0.04
)

# corners 是 (N, 1, 2) 的数组
if corners is not None:
    corners = np.int0(corners)
    for i in corners:
        x, y = i.ravel()
        cv2.circle(img, (x, y), 3, (0, 255, 0), -1)

cv2.imshow('Shi-Tomasi Corners', img)
cv2.waitKey(0)
```

### 10.5.2 参数调节建议

```python
# maxCorners=0: 所有满足 qualityLevel 的角点
# qualityLevel=0.01: 较严格（角点质量好）
# qualityLevel=0.001: 较宽松（检测到更多角点，可能含伪角点）
# minDistance=5-15: 角点间距，避免聚集
# blockSize=3: 默认，3×3 邻域
```

## 10.6 亚像素角点精化（CornerSubPix）

```python
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 先用 Shi-Tomasi 获取粗角点
corners = cv2.goodFeaturesToTrack(
    gray, maxCorners=100, qualityLevel=0.01, minDistance=10, blockSize=3
)

if corners is not None:
    corners = np.float32(corners)

    # 亚像素精化（迭代收敛）
    # criteria: (type, max_iter, epsilon)
    #   type: cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_MAX_ITER
    #   max_iter: 最大迭代次数
    #   epsilon: 收敛精度
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.001)
    corners_subpix = cv2.cornerSubPix(gray, corners, winSize=(5, 5), zeroZone=(-1, -1),
                                       criteria=criteria)

    # 结果精度从像素级提升到亚像素级（0.01px）
```

## 10.7 边缘/角点检测速查表

| 方法 | 函数 | 检测什么 | 适用场景 |
|------|--|--|------|
| Sobel | `cv2.Sobel()` | 一阶导数（梯度） | 基础边缘检测 |
| Scharr | `cv2.Scharr()` | 一阶导数（更精确） | 3×3 精确梯度 ✅ |
| Laplacian | `cv2.Laplacian()` | 二阶导数 | 快速检测、加速边缘 |
| Canny | `cv2.Canny()` | 多阶段边缘检测 | **通用边缘检测** ✅ |
| Harris | `cv2.cornerHarris()` | 角点（自相关矩阵） | 经典角点检测 |
| Shi-Tomasi | `cv2.goodFeaturesToTrack()` | 角点（最小特征值） | **推荐角点检测** ✅ |
| SubPix | `cv2.cornerSubPix()` | 亚像素角点精化 | 相机标定、特征跟踪 |

---

> 下一章：[第十一章 · 特征检测与描述](ch11-feature-detection.md) →
