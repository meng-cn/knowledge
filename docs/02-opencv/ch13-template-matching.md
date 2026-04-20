# 第十三章 · 模板匹配

## 13.1 基本模板匹配

### 13.1.1 核心函数

```python
import cv2
import numpy as np

img = cv2.imread('scene.jpg')
template = cv2.imread('object.jpg')

h_t, w_t = template.shape[:2]

# ---- matchTemplate ----
# matchTemplate(image, template, method, result=None, mask=None)
# result 尺寸 = (image_cols - template_cols + 1, image_rows - template_rows + 1)
result = cv2.matchTemplate(img, template, cv2.TM_CCORR_NORMED)

# ---- 匹配方法 ----
# TM_SQDIFF       — 平方差匹配（越小越好）
# TM_SQDIFF_NORMED — 归一化平方差（越小越好，推荐 ✅）
# TM_CCORR        — 相关匹配（越大越好）
# TM_CCORR_NORMED — 归一化相关匹配（越大越好，推荐 ✅）
# TM_CCOEFF       — 相关系数匹配（越大越好）
# TM_CCOEFF_NORMED — 归一化相关系数匹配（越大越好，推荐 ✅）

# 归一化方法 ✅ 推荐：不受光照变化影响
# TM_CCORR_NORMED 和 TM_CCOEFF_NORMED 的结果范围 [0, 1]（或 [-1, 1]）
```

### 13.1.2 提取匹配位置

```python
result = cv2.matchTemplate(img, template, cv2.TM_CCORR_NORMED)
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

# 根据方法选择最佳位置
if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
    best_loc = min_loc  # 最小值 = 最佳匹配
else:
    best_loc = max_loc  # 最大值 = 最佳匹配

# 提取矩形区域
top_left = best_loc
bottom_right = (top_left[0] + w_t, top_left[1] + h_t)
cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 2)
```

### 13.1.3 多目标匹配

```python
result = cv2.matchTemplate(img, template, cv2.TM_CCORR_NORMED)

# 设定阈值
threshold = 0.8
loc = np.where(result >= threshold)
pts = list(zip(*loc[::-1]))  # (x, y) 对

# 非极大值抑制 — 合并重叠匹配
def non_max_suppression(boxes, iou_threshold=0.3):
    """简单非极大值抑制"""
    if len(boxes) == 0:
        return []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = x1 + w_t
    y2 = y1 + h_t

    areas = (x2 - x1) * (y2 - y1)
    order = np.argsort(-areas)  # 面积从大到小

    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)

        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)
        inter = w * h
        iou = inter / (areas[i] + areas[order[1:]] - inter)

        inds = np.where(iou <= iou_threshold)[0]
        order = order[inds + 1]

    return [boxes[i] for i in keep]

if len(pts) > 0:
    pts = np.array(pts)
    keep = non_max_suppression(pts, iou_threshold=0.3)
    # 画框
    for pt in keep:
        cv2.rectangle(img, (pt[0], pt[1]), (pt[0] + w_t, pt[1] + h_t), (0, 255, 0), 2)
```

## 13.2 模板匹配局限性与解决

### 13.2.1 局限性

| 局限 | 说明 |
|------|--|
| **旋转** | 模板需预先生成多个角度的版本 |
| **尺度变化** | 模板需预先生成多尺度版本 |
| **光照变化** | TM_SQDIFF 敏感；TM_CCORR_NORMED 较鲁棒 |
| **遮挡** | 模板匹配对部分遮挡不鲁棒 |
| **速度** | 大图像+大模板 → 慢 |

### 13.2.2 旋转不变模板匹配

```python
def rotated_template_match(img, template, angles=np.arange(0, 360, 5)):
    """旋转模板匹配"""
    best_score = 0
    best_result = None
    best_angle = 0

    for angle in angles:
        # 旋转模板
        center = (template.shape[1]//2, template.shape[0]//2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(template, M, template.shape[::-1],
                                   borderMode=cv2.BORDER_REPLICATE)

        # 匹配
        res = cv2.matchTemplate(img, rotated, cv2.TM_CCORR_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(res)

        if max_val > best_score:
            best_score = max_val
            best_result = res
            best_angle = angle

    return best_angle, best_score, best_result
```

### 13.2.3 尺度不变模板匹配（多尺度金字塔）

```python
def scale_invariant_match(img, template, scales=np.arange(0.5, 2.0, 0.1)):
    """多尺度模板匹配"""
    best_score = 0
    best_result = None
    best_scale = 1.0

    for scale in scales:
        w_new = int(template.shape[1] * scale)
        h_new = int(template.shape[0] * scale)
        if w_new < 1 or h_new < 1:
            continue
        scaled = cv2.resize(template, (w_new, h_new), interpolation=cv2.INTER_AREA)

        # 快速匹配：用缩放后模板
        res = cv2.matchTemplate(img, scaled, cv2.TM_CCORR_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(res)

        if max_val > best_score:
            best_score = max_val
            best_result = res
            best_scale = scale

    return best_scale, best_score, best_result
```

## 13.3 性能优化

### 13.3.1 缩小搜索范围

```python
# 先用粗匹配找到大致位置，再精细搜索
# 1. 对 img 和 template 都做金字塔降采样
# 2. 在低分辨率下找到候选区域
# 3. 在高分辨率对应区域做精确匹配

# 或先用颜色直方图快速筛选候选 ROI
```

### 13.3.2 用 Integral Image 加速

```python
# matchTemplate 内部已使用 integral image 加速
# 对于大模板，可手动降采样：
small_img = cv2.pyrDown(img)
small_tmpl = cv2.pyrDown(template)
res = cv2.matchTemplate(small_img, small_tmpl, cv2.TM_CCORR_NORMED)
_, _, _, loc = cv2.minMaxLoc(res)
# 映射回原图
final_loc = (loc[0] * 2, loc[1] * 2)
```

### 13.3.3 使用 GPU 加速（OpenCV + CUDA）

```python
# 需要 OpenCV 的 CUDA 编译版本
from cv2.cuda import matchTemplate
gpu_img = cv2.cuda_GpuMat()
gpu_tmpl = cv2.cuda_GpuMat()
gpu_img.upload(img)
gpu_tmpl.upload(template)
res_gpu = matchTemplate(gpu_img, gpu_tmpl, cv2.TM_CCORR_NORMED)
res = res_gpu.download()
```

## 13.4 模板匹配速查表

| 需求 | 方法 |
|------|--|
| 固定位置、无旋转 | `matchTemplate(TM_CCORR_NORMED)` |
| 多目标 | `minMaxLoc` + NMS 过滤 |
| 光照变化 | `TM_CCORR_NORMED` 或 `TM_CCOEFF_NORMED` |
| 旋转 | 多角旋转模板 + 逐个匹配 |
| 尺度变化 | 多尺度金字塔 |
| 快速 | 缩小搜索区域 / GPU |
| 鲁棒遮挡/形变 | 不用模板匹配 → 用特征匹配 (SIFT/ORB) |

## 13.5 模板匹配 vs 特征匹配

| 对比 | 模板匹配 | 特征匹配（SIFT/ORB） |
|------|------|--|
| 精度 | 固定模板下极高 | 取决于特征点数量 |
| 鲁棒性 | 差（旋转/尺度/遮挡） | 强（内置不变性） |
| 速度 | 快（小模板） | 中等（取决于特征点数） |
| 适用 | 已知目标、固定姿态 | 目标姿态未知、场景复杂 |
| 推荐 | **固定位置检测** | **姿态/尺度变化** |

---

> **Part III · 特征与匹配**（第 10–13 章）全部完成 ✅

