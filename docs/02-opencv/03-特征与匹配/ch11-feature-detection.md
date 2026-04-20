# 第十一章 · 特征检测与描述

## 11.1 特征检测概述

```
特征检测 = 找到图像中"有辨识度"的点
特征描述 = 为每个特征点生成一个"特征向量"（描述符）

特征点 ≠ 角点！特征点可以是：
  • 角点
  • 斑点（blob）
  • 边缘上的特殊点
  • 纹理区域中心
```

### 特征检测器 vs 描述符

| 组件 | 作用 | 输出 |
|------|--|--|
| 检测器 (Detector) | 定位特征点 | `keypoints` — 位置、尺度、方向 |
| 描述符 (Descriptor) | 描述局部特征 | `descriptors` — 特征向量 |
| 匹配器 (Matcher) | 比较两个描述符 | `DMatch` — 匹配点对 |

## 11.2 ORB（Oriented FAST + Brief）

**推荐首选** — 免费、快速、旋转不变、部分尺度不变

```python
import cv2

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# ---- ORB 检测 ----
orb = cv2.ORB_create(
    nfeatures=500,      # 最大特征点数
    scaleFactor=1.2,    # 尺度金字塔步长
    nlevels=8,          # 金字塔层数
    edgeThreshold=31,   # 边缘阈值
    firstLevel=0,       # 第一层（通常 0）
    WTA_K=2,            # WTA 输出维度
    scoreType=cv2.ORB_HARRIS_SCORE  # 评分方式
)

keypoints, descriptors = orb.detectAndCompute(gray, None)
# keypoints: [cv2.KeyPoint] — (x, y, size, angle, response, octave, class_id)
# descriptors: np.array (M, 32) — BRIEF 描述符（32 字节 = 256 bit）
print(f"ORB: {len(keypoints)} keypoints, descriptors shape: {descriptors.shape}")

# ---- 可视化特征点 ----
img_kp = cv2.drawKeypoints(
    img, keypoints, None,
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
)
# 每个点显示为圆（半径=尺度），方向线表示方向
```

### ORB 特征点结构

```
KeyPoint:
  x        — x 坐标
  y        — y 坐标
  size     — 特征点尺度
  angle    — 方向（度，-1=无方向）
  response — 响应强度（越大越"像"特征点）
  octave   — 所在的金字塔层
  class_id — 类别 ID（-1=未分配）
```

## 11.3 FAST 角点检测

FAST = Features from Accelerated Segment Test — **极快**的角点检测器

```python
# FAST 检测器
fast = cv2.FastFeatureDetector_create(
    threshold=10,       # 阈值（越大越少角点）
    nonmaxSuppression=True,  # 非极大值抑制
    type=cv2.FastFeatureDetector_TYPE_9_16  # 核类型
)

keypoints = fast.detect(gray)  # 只检测，不计算描述符
img_fast = cv2.drawKeypoints(img, keypoints, None,
                               color=(255, 0, 0),
                               flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
```

## 11.4 SIFT（Scale-Invariant Feature Transform）

**经典** — 尺度/旋转不变，质量高，但在某些地区有专利限制

> 在 OpenCV 4.4+ 中，SIFT 已移至 `opencv-contrib-python`（MIT 许可）。

```python
# pip install opencv-contrib-python

# ---- SIFT 检测 ----
sift = cv2.SIFT_create(
    nfeatures=0,         # 0=不限制
    nOctaveLayers=3,     # 每层金字塔层数
    contrastThreshold=0.04,  # 对比度阈值（越小越敏感）
    edgeThreshold=10,    # 边缘阈值（过滤边缘响应）
    sigma=1.6            # 第一层高斯模糊 sigma
)

keypoints, descriptors = sift.detectAndCompute(gray, None)
print(f"SIFT: {len(keypoints)} keypoints, descriptors shape: {descriptors.shape}")
# descriptors: (M, 128) — 128 维描述符
```

### SIFT vs ORB 对比

| 特性 | SIFT | ORB |
|------|--|-----|
| 尺度不变 | ✅ | ✅（通过金字塔） |
| 旋转不变 | ✅ | ✅ |
| 描述符维度 | 128 float | 32 byte (BRIEF) |
| 速度 | 慢 | ⚡ 快（快 10x+） |
| 内存占用 | 大 | 小 |
| 专利 | 原受限，现已 MIT | 完全免费 |
| 精度 | ★★★★★ | ★★★★☆ |

## 11.5 AKAZE（Accelerated-KAZE）

**非线性尺度空间** — 比 SIFT 快，保持同等精度

```python
akaze = cv2.AKAZE_create(
    descriptorType=cv2.AKAZE_MLB,  # AKAZE_MLB（默认）/ AKAZE_MI / AKAZE_UMLDB
    threshold=0.001,    # 扩散系数阈值
    nOctaves=4,         # 金字塔层数
    nOctaveLayers=4,    # 每层子层数
    diffuseFunction=cv2.AKAZE_DIFF_PM_G1  # 扩散函数
)

keypoints, descriptors = akaze.detectAndCompute(gray, None)
print(f"AKAZE: {len(keypoints)} keypoints, descriptors shape: {descriptors.shape}")
# descriptors: (M, 614) — AKAZE 描述符 614 维
```

### AKAZE 描述符类型

| 类型 | 维度 | 说明 |
|------|--|--|
| `AKAZE_MLB` | 614 | 默认，多尺度线性双树小波 |
| `AKAZE_MI` | 614 | 互信息版本 |
| `AKAZE_UMLDB` | 128 | 短描述符，快速匹配 |

## 11.6 BRISK（Binarized Robust Invariant Scalable Keypoints）

```python
brisk = cv2.BRISK_create(
    thresh=30,
    octaves=3,
    patternScale=1.0
)

keypoints, descriptors = brisk.detectAndCompute(gray, None)
# descriptors: (M, 512) — 512 bit 二进制描述符
```

## 11.7 特征检测器对比表

| 检测器 | 速度 | 精度 | 尺度不变 | 旋转不变 | 描述符 | 专利 |
|--------|--|--|--|--|--|--|
| **ORB** | ⚡⚡⚡ | ★★★★☆ | ✅ | ✅ | BRIEF (32B) | ✅ 免费 |
| **SIFT** | ⚡ | ★★★★★ | ✅ | ✅ | SIFT (128F) | ✅ MIT |
| **AKAZE** | ⚡⚡ | ★★★★★ | ✅ | ✅ | AKAZE (614) | ✅ 免费 |
| **BRISK** | ⚡⚡ | ★★★★ | ✅ | ✅ | BRISK (64B) | ✅ 免费 |
| **MSER** | ⚡⚡ | ★★★☆ | ✅ | ❌ | 区域 | ✅ 免费 |
| **Fast** | ⚡⚡⚡ | ★★★☆ | ❌ | ❌ | — | ✅ 免费 |

### 选择建议

| 场景 | 推荐 |
|------|--|
| 实时/移动端 | **ORB** ✅ |
| 最大精度 | **SIFT** ✅ |
| 非线性场景（纹理复杂） | **AKAZE** ✅ |
| 文字/文档 | **AKAZE** 或 **SIFT** |
| 快速原型 | **ORB** ✅ |

## 11.8 描述符可视化

```python
# 用随机颜色显示特征点（方便调试）
img_kp = cv2.drawKeypoints(img, keypoints, None,
                             flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

# 用不同颜色区分不同 octave
color_map = [(255, 0, 0), (0, 255, 0), (0, 0, 255),
             (255, 255, 0), (255, 0, 255), (0, 255, 255)]
img_color = img.copy()
for i, kp in enumerate(keypoints):
    color = color_map[kp.octave % len(color_map)]
    cv2.circle(img_color, (int(kp.pt[0]), int(kp.pt[1])),
               max(int(kp.size/2), 1), color, 1)

cv2.imshow('Keypoints by Octave', img_color)
cv2.waitKey(0)
```

---
