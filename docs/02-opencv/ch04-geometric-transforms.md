# 第四章 · 几何变换

## 4.1 图像缩放（Resize）

```python
import cv2

img = cv2.imread('photo.jpg')

# 固定尺寸
small = cv2.resize(img, (320, 240))

# 固定倍数
half = cv2.resize(img, None, fx=0.5, fy=0.5)
double = cv2.resize(img, None, fx=2.0, fy=2.0)

# 插值方法
nearest  = cv2.resize(img, (w, h), interpolation=cv2.INTER_NEAREST)
linear   = cv2.resize(img, (w, h), interpolation=cv2.INTER_LINEAR)    # 默认
cubic    = cv2.resize(img, (w, h), interpolation=cv2.INTER_CUBIC)
area     = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)       # 缩小推荐
lanczos4 = cv2.resize(img, (w, h), interpolation=cv2.INTER_LANCZOS4)
```

### 插值方法选择指南

```
缩小图像 → INTER_AREA（最佳质量）
放大图像 → INTER_CUBIC / INTER_LANCZOS4
快速预览 → INTER_NEAREST
平衡之选 → INTER_LINEAR
```

## 4.2 仿射变换（Affine Transform）

仿射变换 = 平移 + 缩放 + 旋转 + 倾斜的**线性变换**，保持平行线仍平行。

```python
# ---- 平移 ----
M_translate = np.float32([[1, 0, tx],
                           [0, 1, ty]])
dst = cv2.warpAffine(img, M_translate, (cols, rows))

# ---- 旋转（围绕中心点）----
center = (img.shape[1] / 2, img.shape[0] / 2)  # (cx, cy) = (cols/2, rows/2)
angle = 45  # 角度
scale = 1.0
M_rotate = cv2.getRotationMatrix2D(center, angle, scale)
dst = cv2.warpAffine(img, M_rotate, (img.shape[1], img.shape[0]))

# ---- 仿射变换（3 点映射）----
# 原图 3 点 → 目标 3 点
pts_src = np.float32([[0, 0], [img.shape[1], 0], [0, img.shape[0]]])
pts_dst = np.float32([[50, 50], [img.shape[1]-50, 50], [50, img.shape[0]-50]])
M_affine = cv2.getAffineTransform(pts_src, pts_dst)
dst = cv2.warpAffine(img, M_affine, (img.shape[1], img.shape[0]))

# ---- 仿射变换 + 透视变换对比 ----
# warpAffine → 仿射变换（2D 线性）
# warpPerspective → 透视变换（2D 投影，4 点映射）
```

### 旋转公式

```
旋转中心: (cx, cy)
旋转角度: θ（逆时针为正）
缩放: s

M = [ s·cosθ   -s·sinθ   cx(1-s·cosθ) + s·cy·sinθ ]
    [ s·sinθ    s·cosθ   cy(1-s·cosθ) - s·cx·sinθ ]
```

## 4.3 透视变换（Perspective Transform）

透视变换允许**不平行的线变成平行或不平行**（投影变换），需要 4 点映射。

```python
# 透视变换（4 点映射）
pts_src = np.float32([
    [0, 0],
    [img.shape[1], 0],
    [0, img.shape[0]],
    [img.shape[1], img.shape[0]]
])
pts_dst = np.float32([
    [50, 50],
    [img.shape[1] - 50, 30],
    [30, img.shape[0] - 50],
    [img.shape[1] - 30, img.shape[0] - 30]
])
M_perspective = cv2.getPerspectiveTransform(pts_src, pts_dst)
dst = cv2.warpPerspective(img, M_perspective, (img.shape[1], img.shape[0]))
```

### 透视变换经典应用：文档校正

```python
def deskew_document(img):
    """透视校正 — 从倾斜拍摄的文档中提取矩形区域"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(gray, 50, 150)

    # 找到轮廓并排序（取最大的四边形）
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    doc_contour = max(contours, key=cv2.contourArea)

    # 近似为四边形
    peri = cv2.arcLength(doc_contour, True)
    approx = cv2.approxPolyDP(doc_contour, 0.02 * peri, True)

    if len(approx) == 4:
        pts = approx.reshape(4, 2)
        pts_src = np.float32(pts)

        # 目标矩形尺寸
        w = max(np.linalg.norm(pts[0] - pts[1]), np.linalg.norm(pts[2] - pts[3]))
        h = max(np.linalg.norm(pts[0] - pts[3]), np.linalg.norm(pts[1] - pts[2]))
        pts_dst = np.float32([[0, 0], [w, 0], [w, h], [0, h]])

        M = cv2.getPerspectiveTransform(pts_src, pts_dst)
        result = cv2.warpPerspective(img, M, (int(w), int(h)))
        return result
    return img
```

## 4.4 仿射矩阵变换组合

```python
# 获取变换矩阵后可以直接修改
M = cv2.getRotationMatrix2D(center, 45, 1.0)
print(M)
# [[ 0.70711,  0.70711,  54.648],
#  [-0.70711,  0.70711,  54.648]]

# 修改平移参数
M[0, 2] += 20   # x 方向 +20
M[1, 2] += 20   # y 方向 +20

# 组合多个变换（矩阵乘法）
M1 = cv2.getRotationMatrix2D((320, 240), 30, 1.0)
M2 = np.float32([[1, 0, 50], [0, 1, 30]])  # 平移
M_combined = np.float32([[1, 0, 50], [0, 1, 30]]) @ M1  # 先旋转后平移
```

## 4.5 重映射（Remap）

重映射是最通用的像素重新定位方式 —— 对每个目标像素，告诉它从源图的哪个位置取值。

```python
# 生成映射表
h, w = img.shape[:2]
map_x = np.zeros((h, w), dtype=np.float32)
map_y = np.zeros((h, w), dtype=np.float32)

# 示例：水平翻转
for y in range(h):
    for x in range(w):
        map_x[y, x] = w - 1 - x   # x 取反
        map_y[y, x] = y            # y 不变

# 应用映射
dst = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REPLICATE)
```

### 常用映射场景

```python
# ---- 鱼眼校正 ----
camera_matrix, dist_coeffs = cv2.calibrateCamera(...)  # 标定得到
map1, map2 = cv2.initUndistortRectifyMap(camera_matrix, dist_coeffs,
                                           None, None, img.shape[:2], cv2.CV_32FC1)
undistorted = cv2.remap(img, map1, map2, cv2.INTER_LINEAR)

# ---- 极坐标变换 ----
def polar_transform(img):
    """直角坐标 → 极坐标"""
    h, w = img.shape[:2]
    center = (w/2, h/2)
    map_x = np.zeros((h, w), dtype=np.float32)
    map_y = np.zeros((h, w), dtype=np.float32)
    for y in range(h):
        for x in range(w):
            dx = x - center[0]
            dy = y - center[1]
            r = np.sqrt(dx*dx + dy*dy)
            theta = np.arctan2(dy, dx)
            map_x[y, x] = (theta + np.pi) / (2*np.pi) * w
            map_y[y, x] = r / np.max([r]) * h
    return cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR)
```

## 4.6 几何变换速查表

| 变换 | 函数 | 矩阵 | 插值 |
|------|------|------|------|
| 缩放 | `cv2.resize()` | — | INTER_AREA/NEAREST/... |
| 平移 | `cv2.warpAffine()` | `[[1,0,tx],[0,1,ty]]` | 默认 |
| 旋转 | `cv2.getRotationMatrix2D()` + warpAffine | 3×2 | 默认 |
| 仿射 | `cv2.getAffineTransform()` + warpAffine | 3×2 (2→3 点) | 默认 |
| 透视 | `cv2.getPerspectiveTransform()` + warpPerspective | 3×3 (4→4 点) | 默认 |
| 去畸变 | `cv2.undistort()` 或 initUndistortRectifyMap + remap | — | 默认 |
| 通用映射 | `cv2.remap()` | map_x + map_y | INTER_LINEAR |

## 4.7 坐标系统与变换顺序

```
像素坐标系：原点(0,0)在左上角
x → 右 (列/width)
y → 下 (行/height)

变换顺序很重要！矩阵不交换：

M1 @ M2 ≠ M2 @ M1

示例：先旋转再平移 vs 先平移再旋转
M_rotate = cv2.getRotationMatrix2D((320,240), 45, 1.0)
M_translate = np.float32([[1,0,50],[0,1,30]])

# 先旋转后平移
M = M_translate @ M_rotate

# 先平移后旋转
M = M_rotate @ M_translate

# 结果不同！
```

## 4.8 实战技巧

### 保持图像完整（旋转后不裁剪）

```python
def rotate_with_border(img, angle):
    """旋转图像，自动扩展画布以容纳全部内容"""
    h, w = img.shape[:2]
    center = (w/2, h/2)

    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    # 计算新边界
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int(h * sin + w * cos)
    new_h = int(h * cos + w * sin)

    # 调整旋转矩阵的平移
    M[0, 2] += (new_w - w) / 2
    M[1, 2] += (new_h - h) / 2

    dst = cv2.warpAffine(img, M, (new_w, new_h),
                          borderMode=cv2.BORDER_CONSTANT,
                          borderValue=(0, 0, 0))
    return dst
```

### 等比例缩放 + 居中填充

```python
def scale_and_pad(img, target_size, color=(0, 0, 0)):
    """等比例缩放 + 居中填充至目标尺寸"""
    target_w, target_h = target_size
    h, w = img.shape[:2]

    # 计算缩放比例
    scale = min(target_w / w, target_h / h)
    new_w = int(w * scale)
    new_h = int(h * scale)

    # 等比例缩放
    scaled = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # 创建空白画布
    canvas = np.full((target_h, target_w, 3), color, dtype=np.uint8)

    # 居中放置
    y_off = (target_h - new_h) // 2
    x_off = (target_w - new_w) // 2
    canvas[y_off:y_off+new_h, x_off:x_off+new_w] = scaled

    return canvas
```

---

> Part I 全部完成 ✅
> 下一章：[Part II · 图像处理](#)（第 5-9 章）→
