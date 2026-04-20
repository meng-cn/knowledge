# 第五章 · 图像滤波

## 5.1 概述

滤波 = 对图像中的每个像素及其邻域做运算，核心目的是**去噪**或**提取特征**。

```
原始图像 → 滤波 → 处理结果

高频 → 边缘、噪声、细节
低频 → 平滑区域、背景
```

## 5.2 线性滤波

线性滤波 = 卷积核（kernel）与图像做加权求和。

```python
import cv2
import numpy as np

img = cv2.imread('photo.jpg')

# ---- 均值滤波 ----
# 用邻域像素平均值替换中心像素
blurred = cv2.blur(img, (5, 5))       # 方框滤波
blurred = cv2.blur(img, (5, 5), borderType=cv2.BORDER_REFLECT)

# 方框滤波（Box Filter）— 允许 scale 参数
blurred_box = cv2.boxFilter(img, -1, (5, 5), normalize=True)
# normalize=False 时计算的是总和（可能溢出）

# ---- 高斯滤波 ----
# 高斯加权平均 — 中心权重高，边缘权重低
gaussian = cv2.GaussianBlur(img, (5, 5), sigmaX=1.0, sigmaY=1.0)

# sigmaX=0 时自动计算: sigma = 0.3*((ksize-1)*0.5) + 0.8
# ksize 必须为奇数
gaussian = cv2.GaussianBlur(img, (0, 0), sigmaX=2.0, sigmaY=0.0)

# 分离式（更快）
gaussian_separate = cv2.GaussianBlur(img, (1, 5), sigmaX=1.0)  # 水平1×5
gaussian_separate = cv2.GaussianBlur(img, (5, 1), sigmaX=1.0)  # 垂直5×1
```

### 核大小与 sigma 的关系

```
核大小 ksize 与 sigma 的约定：

sigma > 0 且 ksize = 0:
  ksize = 2 * round(3.5 * sigma + 0.5) - 1  # 确保奇数

ksize > 0 且 sigma = 0:
  sigma = 0.3 * ((ksize-1) * 0.5 - 1) + 0.8

同时指定 ksize 和 sigma:
  两个参数都生效，ksize 决定核大小，sigma 决定权重分布
```

## 5.3 非线性滤波

### 5.3.1 中值滤波

```python
# 用邻域像素的中值替换中心像素
# 对椒盐噪声效果极佳 ✅
median = cv2.medianBlur(img, 5)       # 核大小必须为奇数
```

| 噪声类型 | 推荐滤波 | 原因 |
|------|----------|--|--|
| 高斯噪声 | GaussianBlur / 双边滤波 | 保留边缘 |
| 椒盐噪声 | medianBlur（中值滤波） | 去脉冲噪声 ✅ |
| 随机噪声 | bilateral（双边滤波） | 去噪+保边 |

### 5.3.2 双边滤波

```python
# 同时考虑空间距离和灰度相似性
bilateral = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)

# 参数说明
# d     : 像素邻域直径（>0 则自动从 sigmaSpace 计算）
# sigmaColor: 色彩空间的标准差
# sigmaSpace: 坐标空间的标准差
```

**双边滤波原理**：
```
权重 = 空间高斯权重 × 色彩高斯权重

W(i,j) = exp(-(i²+j²)/(2σs²)) × exp(ΔI²/(2σc²))

σc 越大 → 色彩宽容度越高 → 保留更多色彩变化
σs 越大 → 邻域越大 → 更平滑
```

### 5.3.3 引导滤波（Guided Filter）

```python
# OpenCV 没有内置引导滤波，需使用 contrib 或 opencv-contrib-python
# 或使用第三方实现（如 skimage 或手动实现）
# 引导滤波 = 低通滤波 + 细节保留 ≈ 双边滤波的改进版

# OpenCV 4.5+ contrib 模块中的引导滤波
# pip install opencv-contrib-python
```

### 5.3.4 快速双边滤波

```python
# OpenCV 提供了加速版双边滤波
fast_bilateral = cv2.xphoto.fastBilateralSolver(img, img)
# 用于色彩传输和图像修复
```

## 5.4 锐化滤波

### 5.4.1 拉普拉斯锐化

```python
# 拉普拉斯核 — 检测二阶导数
kernel = np.array([[0,  1, 0],
                   [1, -4, 1],
                   [0,  1, 0]], dtype=np.float32)
laplacian = cv2.filter2D(img, -1, kernel)
sharpened = cv2.addWeighted(img, 1.5, laplacian, -0.5, 0)

# 另一种常见拉普拉斯核
kernel2 = np.array([[1, 1, 1],
                    [1, -8, 1],
                    [1, 1, 1]], dtype=np.float32)
laplacian2 = cv2.filter2D(img, -1, kernel2)
```

### 5.4.2 非锐化掩模（Unsharp Masking）

```python
def unsharp_mask(img, kernel_size=(5, 5), sigma=1.0, amount=1.5):
    """非锐化掩模 — 经典锐化方法"""
    # 1. 模糊原图
    blur = cv2.GaussianBlur(img, kernel_size, sigma)
    # 2. 从原图中减去模糊图（得到高频/细节）
    detail = cv2.subtract(img, blur)
    # 3. 将细节加回原图
    sharpened = cv2.addWeighted(img, 1 + amount, detail, -amount, 0)
    return sharpened

result = unsharp_mask(img, kernel_size=(5,5), sigma=1.0, amount=1.5)
```

### 5.4.3 OpenCV 内置锐化

```python
# OpenCV 4.x 提供的锐化接口（contrib）
# pip install opencv-contrib-python
from cv2.xphoto import createSimpleWB  # 白平衡示例，锐化在别的模块

# 或手动实现更灵活
```

## 5.5 自定义卷积

```python
# 任何自定义核都可以用 filter2D 实现
# kernel 必须是 float32/float64（因为可能产生负值）
# ddepth=-1 表示输出与输入相同类型（会自动饱和）

# 3×3 平均核
kernel_3x3 = np.ones((3,3), np.float32) / 9
result = cv2.filter2D(img, -1, kernel_3x3)

# 5×5 高斯核（手动构建）
def make_gaussian_kernel(size, sigma):
    kernel = np.fromfunction(
        lambda x, y: (1/(2*np.pi*sigma**2)) *
                      np.exp(-( (x-size//2)**2 + (y-size//2)**2 ) / (2*sigma**2)),
        (size, size)
    )
    return kernel / kernel.sum()  # 归一化

kernel = make_gaussian_kernel(5, 1.0)
result = cv2.filter2D(img, -1, kernel)

# 边缘检测核
sobel_x = np.array([[-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1]], dtype=np.float32)
result_x = cv2.filter2D(img, cv2.CV_32F, sobel_x)

# 转换为可显示格式
result_display = cv2.convertScaleAbs(result_x)  # 取绝对值 + 转 uint8
```

## 5.6 滤波方法对比速查表

| 方法 | 函数 | 适合 | 不适合 | 保边 | 速度 |
|------|------|--|--|--|--|
| 均值/方框 | `cv2.blur/boxFilter` | 快速平滑 | 细节保留 | ❌ | ⚡⚡⚡ |
| 高斯 | `cv2.GaussianBlur` | 高斯噪声 | 脉冲噪声 | ❌ | ⚡⚡ |
| 中值 | `cv2.medianBlur` | 椒盐噪声 | 高斯噪声 | ✅ | ⚡⚡ |
| 双边 | `cv2.bilateralFilter` | 去噪+保边 | 大核/大σ | ✅✅ | ⚡ |
| 引导滤波 | contrib | 保边滤波 | — | ✅✅✅ | ⚡⚡ |
| 联合双边 | `cv2.jBF` | 深度图平滑 | 需要参考图 | ✅✅ | ⚡ |
| 形态学 | — | 结构元素 | 灰度/二值 | ✅ | ⚡⚡⚡ |

## 5.7 实战：噪声去除管线

```python
def denoise_pipeline(img, method='combined'):
    """推荐的图像去噪管线"""
    if method == 'gaussian':
        # 轻量级：高斯 + 双边混合
        blur = cv2.GaussianBlur(img, (5,5), 1.0)
        result = cv2.bilateralFilter(blur, 9, 75, 75)
        return result

    elif method == 'median':
        # 针对椒盐噪声
        median = cv2.medianBlur(img, 3)
        bilateral = cv2.bilateralFilter(median, 9, 50, 50)
        return bilateral

    elif method == 'combined':
        # 组合去噪（推荐）
        # 第1步：去小噪声
        fastNlMeans = cv2.fastNlMeansDenoisingColored(
            img, None, h=10, hForColorComponents=10,
            templateWindowSize=7, searchWindowSize=21
        )
        # 第2步：保边平滑
        result = cv2.bilateralFilter(fastNlMeans, 9, 75, 75)
        return result

    elif method == 'nl_means':
        # 非局部均值去噪（质量最高，速度最慢）
        # 单通道
        denoised = cv2.fastNlMeansDenoising(
            img[:,:,0].astype(np.float32), None, h=10,
            templateWindowSize=7, searchWindowSize=21
        )
        # 彩色
        denoised = cv2.fastNlMeansDenoisingColored(
            img, None, h=10, hForColorComponents=10,
            templateWindowSize=7, searchWindowSize=21
        )
        return denoised
```

---
