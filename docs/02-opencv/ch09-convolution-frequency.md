# 第九章 · 卷积与频域处理

## 9.1 卷积（Convolution）基础

### 9.1.1 概念

卷积 = 用核（kernel）在图像上滑动，计算局部加权求和。

```
核 (3×3):           图像:
[ 0 -1  0 ]       [10 20 30]
[-1  5 -1 ]   ⊛    [40 50 60]
[ 0 -1  0 ]       [70 80 90]

中心像素 50 的新值 = Σ(像素 × 核对应权重) / 核元素之和（如已归一化）
                    = (50×5) + (20×-1) + (40×-1) + (60×-1) + (80×-1)
                    + (0×0) + (0×0) + (30×0) + (90×0)
                    = 250 - 20 - 40 - 60 - 80 = 50
```

### 9.1.2 用 OpenCV 实现卷积

```python
import cv2
import numpy as np

# ---- 自定义核卷积 ----
# filter2D: 最基础的卷积函数
# ddepth: 输出深度（-1=与输入相同，会自动饱和）

# 简单平均核（5×5）
kernel_5x5 = np.ones((5, 5), dtype=np.float32) / 25
blurred = cv2.filter2D(img, -1, kernel_5x5)

# Sobel X 方向
sobel_x = np.array([[-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1]], dtype=np.float32)
edges_x = cv2.filter2D(img, cv2.CV_32F, sobel_x)
edges_x_abs = cv2.convertScaleAbs(edges_x)  # 取绝对值转 uint8

# Sobel Y 方向
sobel_y = np.array([[-1, -2, -1],
                     [ 0,  0,  0],
                     [ 1,  2,  1]], dtype=np.float32)
edges_y = cv2.filter2D(img, cv2.CV_32F, sobel_y)
edges_y_abs = cv2.convertScaleAbs(edges_y)

# Sobel 综合（x 和 y 方向）
edges = cv2.addWeighted(edges_x_abs, 0.5, edges_y_abs, 0.5, 0)
# 或
edges = cv2.add(cv2.magnitude(...))  # 幅值
```

### 9.1.3 OpenCV 内置 Sobel

```python
# OpenCV 内置 Sobel（比手动核更高效）
sobel_x = cv2.Sobel(gray, cv2.CV_32F, dx=1, dy=0, ksize=3)
sobel_y = cv2.Sobel(gray, cv2.CV_32F, dx=0, dy=1, ksize=3)

# ksize: 3, 5, 7 或 cv2.CV_SCHARR（Scharr 算子，更精确的 3×3 Sobel 变体）
scharr_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=cv2.CV_SCHARR)

# 取绝对值
sobel_x_abs = cv2.convertScaleAbs(sobel_x)
sobel_y_abs = cv2.convertScaleAbs(sobel_y)

# 合成
edges = cv2.addWeighted(sobel_x_abs, 0.5, sobel_y_abs, 0.5, 0)
edges = cv2.magnitude(sobel_x, sobel_y)  # 幅值（float32）
edges = cv2.convertScaleAbs(edges)       # → uint8
```

### 9.1.4 Scharr 算子

```python
# Scharr = 优化的 3×3 边缘检测，精度高于 Sobel
scharr_x = cv2.Scharr(gray, cv2.CV_32F, 1, 0)
scharr_y = cv2.Scharr(gray, cv2.CV_32F, 0, 1)
edges = cv2.addWeighted(cv2.convertScaleAbs(scharr_x), 0.5,
                         cv2.convertScaleAbs(scharr_y), 0.5, 0)
```

## 9.2 频域处理（FFT）

### 9.2.1 傅里叶变换

```python
# ---- 傅里叶变换（2D FFT）----
# 将图像从空域转换到频域
# 低频 = 图像整体结构（背景）
# 高频 = 细节（边缘、纹理、噪声）

# 转为 float32 并归一化到 [0,1]
f_img = img.astype(np.float32) / 255.0

# FFT（快速傅里叶变换）
f_transform = np.fft.fft2(f_img)
# f_transform 是复数矩阵

# 频谱幅度（频谱图）
magnitude_spectrum = np.abs(f_transform)

# 将频谱中心化（低频在中心）
f_shifted = np.fft.fftshift(f_transform)
magnitude_shifted = np.abs(f_shifted)

# 显示频谱（对数缩放以便观察）
magnitude_log = np.log(magnitude_shifted + 1)
magnitude_log = (magnitude_log - magnitude_log.min()) / (magnitude_log.max() - magnitude_log.min()) * 255
magnitude_log = magnitude_log.astype(np.uint8)

# 逆变换（重建图像）
f_ishift = np.fft.ifftshift(f_shifted)
img_back = np.fft.ifft2(f_ishift)
img_reconstructed = np.abs(img_back)
```

### 9.2.2 频域滤波

```python
def freq_domain_filter(img, filter_type='lowpass', cutoff=30):
    """
    频域滤波
    filter_type: 'lowpass', 'highpass', 'bandpass'
    cutoff: 截止频率
    """
    f = img.astype(np.float32) / 255.0
    f_transform = np.fft.fft2(f)
    f_shifted = np.fft.fftshift(f_transform)

    h, w = img.shape[:2]
    center = (w // 2, h // 2)

    # 创建滤波器
    Y, X = np.ogrid[:h, :w]
    dist = np.sqrt((X - center[0])**2 + (Y - center[1])**2)

    if filter_type == 'lowpass':
        # 低通滤波 — 保留低频（去噪/平滑）
        # 巴特沃斯低通滤波器
        order = 2
        H = 1 / (1 + (dist / cutoff)**(2 * order))
    elif filter_type == 'highpass':
        # 高通滤波 — 保留高频（锐化/边缘）
        H = 1 - (1 / (1 + (dist / cutoff)**(2 * 2)))
    elif filter_type == 'bandpass':
        # 带通滤波
        H = ((dist >= cutoff * 0.5) & (dist <= cutoff * 2)).astype(np.float32)

    # 应用滤波
    f_filtered = f_shifted * H
    f_ishift = np.fft.ifftshift(f_filtered)
    img_back = np.fft.ifft2(f_ishift)

    return np.abs(img_back)

# 应用
img_lowpass = freq_domain_filter(gray, 'lowpass', cutoff=30)    # 平滑
img_highpass = freq_domain_filter(gray, 'highpass', cutoff=30)  # 锐化
```

### 9.2.3 OpenCV FFT（推荐）

```python
# OpenCV 提供了更高效的 FFT 实现
dft = cv2.dft(np.float32(img), flags=cv2.DFT_COMPLEX_OUTPUT)
# dft 是复数矩阵 (N, M, 2) — 每像素有 [real, imag]

# 幅度谱
magnitude = cv2.magnitude(dft[:,:,0], dft[:,:,1])

# 中心化
magnitude_shifted = np.fft.fftshift(magnitude)

# 对数缩放显示
magnitude_log = np.log(magnitude_shifted + 1)
magnitude_log = (magnitude_log - magnitude_log.min()) / (magnitude_log.max() - magnitude_log.min()) * 255
magnitude_log = magnitude_log.astype(np.uint8)

# 逆变换
img_back = cv2.idft(dft)
img_back = cv2.magnitude(img_back[:,:,0], img_back[:,:,1])
img_back = img_back / img_back.max() * 255
img_back = img_back.astype(np.uint8)
```

## 9.3 核的数学性质速查

| 核 | 核矩阵 | 用途 |
|------|------|--|
| 均值 | `1/k² × ones(k,k)` | 平滑 |
| 高斯 | 高斯分布矩阵 | 平滑保边 |
| Sobel X | `[[-1,0,1],[-2,0,2],[-1,0,1]]` | 水平边缘 |
| Sobel Y | `[[-1,-2,-1],[0,0,0],[1,2,1]]` | 垂直边缘 |
| Laplacian | `[[0,1,0],[1,-4,1],[0,1,0]]` | 二阶导数 |
| Sharpen | `[[0,-1,0],[-1,5,-1],[0,-1,0]]` | 锐化 |
| Emboss | `[[-2,-1,0],[-1,1,1],[0,1,2]]` | 浮雕效果 |

## 9.4 卷积性质

```
1. 交换律: f * g = g * f
2. 结合律: (f * g) * h = f * (g * h)
3. 分配律: f * (g + h) = f*g + f*h
4. 卷积定理: FFT(f * g) = FFT(f) × FFT(g)  （频域相乘 = 空域卷积）
5. 可分离性: 2D 卷积可以分解为两个 1D 卷积（Sobel 等核可分离，效率提升 O(n)→O(1)）
```

## 9.5 频域 vs 空域

| 维度 | 优点 | 缺点 |
|------|--|--|
| **空域** | 直观、快速（小核） | 大核效率低 |
| **频域** | 大核高效、全局信息 | 计算量大、复杂 |
| **推荐** | 核 ≤ 15×15 → 空域；核 > 15×15 → 频域 | |

### 为什么小核用空域更快？

```
空域: O(n² · k²)  k 为核大小
频域: O(n² · log(n))  + FFT/IFFT 开销

k=3 时: 空域 ≈ 9n²,  频域 ≈ 20n² → 空域更快
k=25 时: 空域 ≈ 625n², 频域 ≈ 20n² → 频域更快
```

---

> **Part II · 图像处理**（第 5–9 章）全部完成 ✅**
>
> 当前进度：Part I ✅ (4章) + Part II ✅ (5章) = **9/32 章**

> 下一章：[Part III · 特征与匹配](#)（第 10–13 章）→
