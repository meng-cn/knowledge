# 第七章 · 直方图与图像增强

## 7.1 直方图（Histogram）

### 7.1.1 灰度直方图

```python
import cv2
import numpy as np

img = cv2.imread('photo.jpg')

# ---- 计算直方图 ----
# calcHist(images, channels, mask, histSize, ranges)
hist = cv2.calcHist([img], [0], None, [256], [0, 256])
# images: 输入图像列表（数组形式）
# channels: 选择哪个通道 [0]=B, [1]=G, [2]=R
# mask: 掩码（None=全图）
# histSize: 直方图 bin 数
# ranges: 每个 bin 的范围

# ---- 彩色直方图 ----
hist_b = cv2.calcHist([img], [0], None, [256], [0, 256])
hist_g = cv2.calcHist([img], [1], None, [256], [0, 256])
hist_r = cv2.calcHist([img], [2], None, [256], [0, 256])

# ---- 多通道联合直方图（减少维度：2 通道）----
# 取 B 和 G 通道，每个 32 bin
hist_bg = cv2.calcHist([img], [0, 1], None, [32, 32], [0, 256, 0, 256])

# ---- 归一化直方图（总和=1）----
hist_norm = hist / hist.sum()

# ---- 累积直方图 ----
hist_cumsum = np.cumsum(hist)
```

### 7.1.2 直方图均衡化

```python
# ---- 全局均衡化 ----
equalized = cv2.equalizeHist(gray)  # 输入必须为 8UC1 灰度图

# ---- 限制对比度自适应均衡化（CLAHE）— 推荐 ✅ ----
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
enhanced = clahe.apply(gray)

# clipLimit: 对比度放大限制（默认 40）
# tileGridSize: 分块大小（默认 8×8）
# 分块越小 → 局部对比度越强，但可能产生区块感

# ---- 彩色图像的 CLAHE ----
# 需要转换到 Lab 色彩空间，只处理 L 通道
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
l = clahe.apply(l)
img_enhanced = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
```

### 7.1.3 直方图对比（MatchHist）

```python
# 直方图匹配 — 让图像 A 的直方图逼近图像 B
# 常用于图像归一化、白平衡
def match_histogram(src, ref):
    """将 src 的直方图匹配到 ref 的直方图"""
    # 转换为 HSV，处理 V（亮度）通道
    hsv_src = cv2.cvtColor(src, cv2.COLOR_BGR2HSV)
    hsv_ref = cv2.cvtColor(ref, cv2.COLOR_BGR2HSV)

    h, s, v_src = cv2.split(hsv_src)
    _, _, v_ref = cv2.split(hsv_ref)

    # 对 V 通道做直方图匹配
    matched_v = cv2.equalizeHist(v_src)  # 简化版
    # 更精确的实现需使用概率密度函数映射

    hsv_out = cv2.merge([h, s, matched_v])
    return cv2.cvtColor(hsv_out, cv2.COLOR_HSV2BGR)
```

## 7.2 色彩空间转换汇总

```python
# 常见转换常量
cv2.COLOR_BGR2GRAY      # BGR → 灰度
cv2.COLOR_BGR2RGB       # BGR → RGB
cv2.COLOR_BGR2HSV       # BGR → HSV
cv2.COLOR_BGR2HLS       # BGR → HLS
cv2.COLOR_BGR2Lab       # BGR → CIE Lab
cv2.COLOR_BGR2YCrCb     # BBR → YCrCb
cv2.COLOR_BGR2XYZ       # BGR → XYZ
cv2.COLOR_BGR2YUV       # BGR → YUV
cv2.COLOR_BGR2luv       # BGR → Luv
cv2.COLOR_GRAY2BGR      # 灰度 → BGR

# ---- 常见色彩空间范围 ----
# HSV:  H: 0-180 (OpenCV 压缩),  S: 0-255,  V: 0-255
# HLS:  H: 0-180,            L: 0-255,        S: 0-255
# Lab:  L: 0-100,   a: -128~127,  b: -128~127（存储时 L×257 + a+128...）
# YCrCb: Y: 0-255, Cr: 0-255, Cb: 0-255
# XYZ:  X: 0-95,   Y: 0-108,   Z: 0-108（标准化后）
```

## 7.3 肤色检测

```python
def skin_detection(img):
    """肤色检测 — 常用 YCrCb 和 HSV 两个空间"""
    # ---- YCrCb 方法 ----
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    lower_skin = np.array([0, 133, 77], dtype=np.uint8)
    upper_skin = np.array([255, 173, 127], dtype=np.uint8)
    mask1 = cv2.inRange(ycrcb, lower_skin, upper_skin)

    # ---- HSV 方法 ----
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_skin = np.array([0, 48, 0], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    mask2 = cv2.inRange(hsv, lower_skin, upper_skin)

    # 合并
    mask = cv2.bitwise_or(mask1, mask2)

    # 形态学清理
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    return mask
```

## 7.4 图像增强方法汇总

### 7.4.1 亮度/对比度增强

```python
# 方法1: Gamma 校正
gamma_table = np.array([((i / 255.0) ** (1.0/1.4)) * 255
                         for i in np.arange(0, 256)]).astype("uint8")
img_gamma = cv2.LUT(img, gamma_table)

# 方法2: 直方图均衡化
img_eq = cv2.equalizeHist(gray)

# 方法3: CLAHE（推荐）
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(16, 16))
img_clahe = clahe.apply(gray)

# 方法4: 自适应阈值增强
img_adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                      cv2.THRESH_BINARY, 11, 2)
```

### 7.4.2 图像平滑去雾

```python
def dark_channel_prior(img):
    """暗通道先验 — 简化去雾"""
    # 计算暗通道（每个像素取 BGR 三通道的最小值）
    gray_min = cv2.min(img[:,:,0], cv2.min(img[:,:,1], img[:,:,2]))
    # 对暗通道做最小值滤波
    dark_channel = cv2.erode(gray_min, np.ones((15,15), np.uint8))

    # 透射率估计
    t = 1.0 - 0.95 * dark_channel / 255.0

    # 大气光估计
    A = img[0, 0].astype(np.float32)  # 简化

    # 去雾
    img_float = img.astype(np.float32)
    dehazed = (img_float - A) / np.maximum(t, 0.001) + A
    return np.clip(dehazed, 0, 255).astype(np.uint8)
```

## 7.5 直方图相关速查表

| 方法 | 函数 | 特点 |
|------|------|------|
| 直方图计算 | `cv2.calcHist()` | N 维直方图 |
| 全局均衡化 | `cv2.equalizeHist()` | 简单但可能过度 |
| CLAHE | `cv2.createCLAHE()` | 局部增强，推荐 ✅ |
| 直方图匹配 | 手动实现 PDF 映射 | 让两图直方图一致 |
| 掩码 | `mask` 参数 | 只对 ROI 计算 |
| 归一化 | `hist / hist.sum()` | 总和=1，用于比较 |

## 7.6 直方图比较

```python
def compare_histograms(hist1, hist2, method='correlation'):
    """比较两个直方图的相似度"""
    if method == 'correlation':
        return cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)  # 1=完全相同
    elif method == 'chi_square':
        return cv2.compareHist(hist1, hist2, cv2.HISTCMP_CHISQR)   # 0=完全相同
    elif method == 'bhattacharyya':
        return cv2.compareHist(hist1, hist2, cv2.HISTCMP_BHATTACHARYYA)  # 0=完全相同
    elif method == 'intersection':
        return cv2.compareHist(hist1, hist2, cv2.HISTCMP_INTERSECT)  # 越大越相似

# 相关系数 1 表示完全匹配；卡方/巴氏距离 0 表示完全匹配
```

---