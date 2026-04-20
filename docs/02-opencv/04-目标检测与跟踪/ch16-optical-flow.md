# 第十六章 · 光流与运动分析

## 16.1 光流（Optical Flow）

光流 = 视频中相邻帧之间像素的**运动场**。Lukas-Kanade 和 Farneback 是最常用的两种方法。

### 16.1.1 Lucas-Kanade 光流

适用于**稀疏光流** — 跟踪特征点的运动。

```python
import cv2
import numpy as np

# 准备两帧
prev_gray = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
next_gray = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)

# 用 goodFeaturesToTrack 找初始特征点
prev_pts = cv2.goodFeaturesToTrack(
    prev_gray, maxCorners=100, qualityLevel=0.01, minDistance=20, blockSize=3
)

# ---- calcOpticalFlowPyrLK ----
# prevImg: 前一帧
# nextImg: 后一帧
# prevPts: 输入特征点 (N, 1, 2)
# nextPts: 输出特征点 (N, 1, 2)
# status: 1=找到, 0=丢失
# err: 跟踪误差
next_pts, status, err = cv2.calcOpticalFlowPyrLK(
    prev_gray, next_gray,
    prev_pts, None,
    winSize=(31, 31),       # 搜索窗口大小
    maxLevel=3,             # 金字塔层数
    criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_MAX_ITER, 40, 0.001)
)

# 筛选有效跟踪点
good_new = next_pts[status == 1]
good_old = prev_pts[status == 1]

# 可视化运动向量
img2 = next_gray.copy()
for i, (new, old) in enumerate(zip(good_new, good_old)):
    a, b = new.ravel()
    c, d = old.ravel()
    cv2.line(img2, (int(a), int(b)), (int(c), int(d)), (0, 255, 0), 2)
    cv2.circle(img2, (int(a), int(b)), 3, (0, 255, 0), -1)
```

### 16.1.2 Farneback 稠密光流

计算**每个像素**的光流。

```python
# ---- calcOpticalFlowFarneback ----
# prev: 前一帧灰度
# next: 后一帧灰度
# pyr_scale: 金字塔比例 (0.5=每层减半)
# levels: 金字塔层数
# winsize: 窗口大小
# iterations: 每层迭代次数
# poly_n: 多项式展开大小 (5-7 推荐)
# poly_sigma: 标准差
# flags: 0=默认, OPTFLOW_USE_INITIAL_FLOW=使用初始估计, OPTFLOW_LK_GET_MIN_EIGENVALS=最小特征值

prev_gray = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
next_gray = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)

flow = cv2.calcOpticalFlowFarneback(
    prev_gray, next_gray,
    None,
    pyr_scale=0.5,
    levels=3,
    winsize=15,
    iterations=3,
    poly_n=5,
    poly_sigma=1.2,
    flags=0
)
# flow shape: (h, w, 2) — flow[y, x] = (u, v) = (dx, dy)
```

### 16.1.3 光流可视化

```python
def visualize_flow(flow):
    """可视化光流场"""
    h, w = flow.shape[:2]
    u = flow[:,:,0]
    v = flow[:,:,1]
    magnitude = np.sqrt(u**2 + v**2)
    magnitude = magnitude / magnitude.max() * 255  # 归一化

    angle = np.arctan2(v, u) * 180 / np.pi
    # HSV → BGR 映射
    hue = np.abs(60 * (angle + 90) / 180) % 180  # 角度 → 色相
    value = magnitude.astype(np.uint8)

    hsv = np.zeros((h, w, 3), dtype=np.uint8)
    hsv[:,:,0] = hue.astype(np.uint8)
    hsv[:,:,1] = 255
    hsv[:,:,2] = value
    bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    return bgr

flow_img = visualize_flow(flow)
cv2.imshow('Optical Flow', flow_img)
cv2.waitKey(0)
```

### 16.1.4 光流方法对比

| 方法 | 类型 | 速度 | 精度 | 适用场景 |
|------|--|--|--|--|
| **LK** | 稀疏 | ⚡⚡⚡ | ★★★★ | 特征点跟踪 |
| **Farneback** | 稠密 | ⚡⚡ | ★★★★ | 整体运动场 |
| **Dense** | 稠密 | ⚡ | ★★ | 复杂运动 |
| **DIS** | 稠密 | ⚡⚡ | ★★ | 大位移 |

## 16.2 运动分析（背景减除 + 运动检测）

### 16.2.1 帧差法

```python
# 简单帧差 — 相邻帧差分
gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
diff = cv2.absdiff(gray1, gray2)
_, motion = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)

# 形态学清理
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
motion = cv2.morphologyEx(motion, cv2.MORPH_OPEN, kernel)
motion = cv2.morphologyEx(motion, cv2.MORPH_CLOSE, kernel)
```

### 16.2.2 混合高斯背景建模（MOG2）

```python
# ---- MOG2 背景减除 ----
fgmg = cv2.createBackgroundSubtractorMOG2(
    history=500,        # 缓冲区历史帧数
    varThreshold=16,    # 方差阈值（检测灵敏度）
    detectShadows=True  # 检测阴影
)

# 逐帧处理
while True:
    fg_mask = fgmg.apply(frame)
    # fg_mask: 前景掩码（255=前景, 0=背景, 128=阴影）

    # 清理掩码
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)

    if fgmg.detectShadows():
        # 将阴影区域标记为 128，可用以下方法移除
        fg_mask[fg_mask == 128] = 0

    # 检测运动对象
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        if cv2.contourArea(cnt) > 1000:  # 最小面积过滤
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
```

### 16.2.3 KNN 背景建模

```python
# ---- KNN 背景减除（更鲁棒）----
fgbg = cv2.createBackgroundSubtractorKNN(
    history=500,
    dist2Threshold=400.0,  # 距离阈值
    detectShadows=True
)

fg_mask = fgbg.apply(frame)
```

### 16.2.4 运动检测完整管线

```python
def motion_detect_pipeline(frame, fgbg, min_area=1000):
    """运动检测完整管线"""
    fg_mask = fgbg.apply(frame)

    # 清理
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel, iterations=2)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    # 连通域分析
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(fg_mask, 8)

    objects = []
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            x, y, w, h, area = stats[i]
            objects.append({'bbox': (x, y, w, h), 'area': area, 'center': centroids[i]})

    return fg_mask, objects
```

## 16.3 光流与运动分析速查表

| 方法 | 函数 | 输出 | 适用 |
|------|--|--|--|
| LK 稀疏光流 | `calcOpticalFlowPyrLK()` | 特征点位移 | 跟踪特定物体 |
| Farneback 稠密 | `calcOpticalFlowFarneback()` | (h,w,2) 光流场 | 整体运动分析 |
| 帧差 | `cv2.absdiff()` | 差分图 | 简单运动检测 |
| MOG2 | `createBackgroundSubtractorMOG2()` | 前景掩码 | 背景/前景分离 |
| KNN | `createBackgroundSubtractorKNN()` | 前景掩码 | 阴影检测 |

---
