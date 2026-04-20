# 第八章 · 图像阈值与分割

## 8.1 阈值处理

### 8.1.1 全局阈值

```python
# 基础阈值
ret, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
# ret: 返回的实际阈值（可能不同于传入值）
# thresh: 二值化结果

# ---- 阈值类型 ----
# THRESH_BINARY:       像素 > thresh → 255, 否则 → 0
#   灰度值:  [200, 80, 150]  thresh=127
#   结果:     [255,   0,   0]

# THRESH_BINARY_INV:   像素 > thresh → 0, 否则 → 255（取反）

# THRESH_TRUNC:        像素 > thresh → thresh, 否则 → 原值
#   灰度值:  [200, 80, 150]  thresh=127
#   结果:     [127,  80, 127]

# THRESH_TOZERO:       像素 > thresh → 原值, 否则 → 0

# THRESH_TOZERO_INV:   像素 > thresh → 0, 否则 → 原值
```

### 8.1.2 自适应阈值

```python
# 根据邻域像素均值/高斯加权计算动态阈值 — 适合光照不均匀
thresh_adaptive = cv2.adaptiveThreshold(
    gray,           # 输入灰度图
    255,            # 最大值
    cv2.ADAPTIVE_THRESH_MEAN_C,  # 邻域均值
    cv2.THRESH_BINARY,     # 输出类型
    11,                   # 邻域大小（必须奇数）
    2                     # 常数 C：阈值 = mean - C
)

# ---- 自适应方法 ----
# ADAPTIVE_THRESH_MEAN_C   — 邻域均值减 C
# ADAPTIVE_THRESH_GAUSSIAN_C — 邻域高斯加权均值减 C（更自然）

# ---- 适用场景 ----
# 全局阈值 → 光照均匀的场景
# 自适应阈值 → 光照不均匀（扫描件、阴影、渐变背景）
```

### 8.1.3 Otsu 阈值

```python
# Otsu — 自动寻找最佳全局阈值（使类间方差最大）
ret, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
print(f"Otsu threshold: {ret}")
# 适用于双峰直方图（前景+背景分明）

# ---- 带掩码的 Otsu ----
mask = cv2.GaussianBlur(gray, (9,9), 0) > 50
ret, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU, mask=mask)
```

## 8.2 高级阈值

```python
# ---- 多级阈值（分段）----
ret1, t1 = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY)
ret2, t2 = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

# 组合
multi = np.zeros_like(gray)
multi[gray < 50] = 0
multi[(gray >= 50) & (gray < 150)] = 85
multi[gray >= 150] = 170

# ---- 自定义阈值函数 ----
# 利用 LUT 实现任意分段
table = np.zeros(256, dtype=np.uint8)
table[0:50] = 0
table[50:150] = 85
table[150:] = 170
multi_lut = cv2.LUT(gray, table)
```

## 8.3 Canny 边缘检测

```python
# ---- 标准 Canny ----
edges = cv2.Canny(gray, threshold1=50, threshold2=150, apertureSize=3, L2gradient=True)

# ---- 参数详解 ----
# threshold1 (低阈值): 低于此值的边缘被丢弃
# threshold2 (高阈值): 高于此值的边缘被保留
# 中间值的边缘: 只有与高阈值边缘相连才保留（滞后阈值）
# apertureSize: Sobel 算子核大小 (3/5/7，默认 3)
# L2gradient: True 使用 L2 范数（更精确），False 用 L1
```

### Canny 参数选择建议

| 图像类型 | threshold1 | threshold2 | 比例 |
|------|--|--|--|
| 清晰照片 | 50 | 150 | 1:3 |
| 模糊/噪声图 | 100 | 200 | 1:2 |
| 精细边缘 | 30 | 80 | 1:2-1:3 |
| 粗边缘 | 150 | 300 | 1:2 |

## 8.4 图像分割

### 8.4.1 GrabCut 分割

```python
# GrabCut — 交互式图像分割
# 需要一个矩形框（包含前景+部分背景）
mask = np.zeros(img.shape[:2], np.uint8)
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)

rect = (x, y, w, h)  # 前景矩形区域

# 第一次运行（需要矩形）
cv2.grabCut(img, mask, rect, bgdModel, fgdModel, iterCount=50)

# 第二次运行（可选，用之前结果作为 mask 初始化）
# mask 值: 0=可能背景, 1=可能前景, 2=肯定背景, 3=肯定前景
mask2 = np.where((mask==2)|(mask==0), 0, 1).astype('uint8')
img_result = img * mask2[:, :, np.newaxis]
```

### 8.4.2 分水岭分割（Watershed）

```python
# 完整的分水岭分割流程
def watershed_segmentation(img, num_markers=5):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)

    # 1. 阈值获取前景
    ret, thresh = cv2.threshold(blurred, 0, 255,
                                 cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 2. 距离变换找确定前景
    dist = cv2.distanceTransform(thresh, cv2.DIST_L2, 5)
    norm_dist = cv2.normalize(dist, 0, 1.0, cv2.NORM_MINMAX)
    _, sure_fg = cv2.threshold(norm_dist, 0.5, 1, cv2.THRESH_BINARY)
    sure_fg = (sure_fg * 255).astype(np.uint8)

    # 3. 确定背景（膨胀 sure_fg）
    kernel = np.ones((3,3), np.uint8)
    sure_bg = cv2.dilate(sure_fg, kernel, iterations=3)

    # 4. 未知区域
    unknown = cv2.subtract(sure_bg, sure_fg)

    # 5. 标记
    ret, markers = cv2.connectedComponents(sure_fg)
    markers = markers + 1
    markers[unknown == 255] = 0

    # 6. 分水岭
    markers = cv2.watershed(img, markers)

    # 结果
    result = img.copy()
    result[markers == -1] = [255, 0, 0]  # 边界标红
    return result, markers
```

### 8.4.3 颜色阈值分割

```python
# 基于颜色范围的分割
def color_segmentation(img, lower, upper, color_space='BGR'):
    """基于 HSV 或 BGR 颜色范围分割"""
    if color_space == 'BGR':
        lower = np.array(lower, dtype=np.uint8)
        upper = np.array(upper, dtype=np.uint8)
    else:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lower = np.array(lower, dtype=np.uint8)
        upper = np.array(upper, dtype=np.uint8)

    mask = cv2.inRange(img if color_space == 'BGR' else hsv, lower, upper)

    # 清理
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    return mask
```

## 8.5 阈值方法速查表

| 方法 | 函数 | 适用场景 |
|------|------|------|
| 全局阈值 | `cv2.threshold(gray, T, maxval, type)` | 光照均匀 |
| 自适应阈值 | `cv2.adaptiveThreshold()` | 光照不均（扫描件） |
| Otsu | `THRESH_BINARY + THRESH_OTSU` | 双峰直方图 |
| Canny 边缘 | `cv2.Canny()` | 边缘检测 |
| GrabCut | `cv2.grabCut()` | 交互式前景提取 |
| 分水岭 | `cv2.watershed()` | 粘连对象分割 |
| 颜色范围 | `cv2.inRange()` | 颜色分割 |

---

> 下一章：[第九章 · 卷积与频域处理](ch09-convolution-frequency.md) →
