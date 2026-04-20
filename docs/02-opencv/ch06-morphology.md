# 第六章 · 形态学操作

## 6.1 概述

形态学操作基于**结构元素**（Structuring Element, SE）与图像的集合论运算，主要处理**二值图像**或**灰度图像**。

### 核心概念

```
结构元素（SE / Kernel）:
  一个小的二值图像，定义操作的范围和形状

腐蚀 (Erode):     — 消除小物体、断开连接
膨胀 (Dilate):    + 填充小空洞、连接断线
开运算 (Open):    — □ 先腐蚀后膨胀
闭运算 (Close):   □ — 先膨胀后腐蚀
```

## 6.2 腐蚀与膨胀

### 6.2.1 腐蚀（Erosion）

```python
# 结构元素 — 常见形状
kernel_rect = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))       # 矩形
kernel_cross = cv2.getStructuringElement(cv2.MORPH_CROSS, (5, 5))     # 十字形
kernel_ellipse = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))  # 椭圆形

# 腐蚀 — 结构元素覆盖区域全部为前景（白）才保留
eroded = cv2.erode(img, kernel, iterations=1)

# 多轮腐蚀
eroded_3x = cv2.erode(img, kernel, iterations=3)

# 等价于连续3次腐蚀
for _ in range(3):
    eroded = cv2.erode(eroded, kernel)
```

**腐蚀的数学直觉**：结构元素在图像上滑动，只有当结构元素**完全包含**在前景点内时，中心点才保留。结果：**前景缩小**。

### 6.2.2 膨胀（Dilation）

```python
# 膨胀 — 结构元素覆盖区域只要有前景就保留
dilated = cv2.dilate(img, kernel, iterations=1)
dilated_3x = cv2.dilate(img, kernel, iterations=3)
```

**膨胀的数学直觉**：结构元素在图像上滑动，只要结构元素与前景**有交集**，中心点就设为前景。结果：**前景扩张**。

### 6.2.3 腐蚀 vs 膨胀对比

```
二值图像（白=前景，黑=背景）

腐蚀:                          膨胀:
  ████    →    ███            ████    →    █████
  ██      →    ██             ██      →    ██████
  ██      →    ██
  ████    →    ███

效果：缩小、断开连接         效果：扩张、连接断线
去除小噪点                   填充小空洞
```

## 6.3 开运算与闭运算

### 6.3.1 开运算（Opening）= 腐蚀 + 膨胀

```python
# 先腐蚀（去小物体）再膨胀（恢复大小）
opened = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)

# 作用：
# 1. 消除小的亮区域/白点噪声
# 2. 断开狭窄连接
# 3. 平滑物体轮廓
```

### 6.3.2 闭运算（Closing）= 膨胀 + 腐蚀

```python
# 先膨胀（填空洞）再腐蚀（恢复大小）
closed = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)

# 作用：
# 1. 填充小的暗区域/黑点噪声
# 2. 连接狭窄间隙
# 3. 平滑物体轮廓
```

### 6.3.3 开闭选择指南

| 目标 | 操作 |
|------|------|
| 去掉图像上白噪点（小亮点） | **开运算** |
| 去掉图像上黑噪点（小暗点） | **闭运算** |
| 连接断裂的文字笔画 | **闭运算** |
| 分离粘连的细胞 | **开运算** |
| 先清理亮噪点，再填洞 | 开运算 → 闭运算 |
| 先填小洞，再清理暗噪点 | 闭运算 → 开运算 |

### 6.3.4 灰度形态学

```python
# 灰度图像的形态学操作（直接对像素值做 min/max）
# 灰度腐蚀 = 局部最小值滤波
gray_eroded = cv2.morphologyEx(gray_img, cv2.MORPH_ERODE, kernel)

# 灰度膨胀 = 局部最大值滤波
gray_dilated = cv2.morphologyEx(gray_img, cv2.MORPH_DILATE, kernel)

# 灰度开/闭
gray_opened = cv2.morphologyEx(gray_img, cv2.MORPH_OPEN, kernel)
gray_closed = cv2.morphologyEx(gray_img, cv2.MORPH_CLOSE, kernel)

# 顶帽 / 黑帽
top_hat = cv2.morphologyEx(gray_img, cv2.MORPH_TOPHAT, kernel)      # 原图 - 开运算
black_hat = cv2.morphologyEx(gray_img, cv2.MORPH_BLACKHAT, kernel)   # 闭运算 - 原图
```

### 6.3.5 顶帽（Top-Hat）与黑帽（Black-Hat）

```python
# 顶帽 = 原图 - 开运算
# 提取比周围环境亮的细小结构（亮线条、白点）
tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)

# 黑帽 = 闭运算 - 原图
# 提取比周围环境暗的细小结构（暗线条、黑点）
blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)

# 用途：
# tophat: 提取文字背景中的高亮部分、亮缺陷
# blackhat: 提取暗纹理、暗缺陷
```

## 6.4 形态学梯度

```python
# 形态学梯度 = 膨胀 - 腐蚀（提取物体轮廓）
gradient = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, kernel)

# 效果：提取物体边缘轮廓（比 Sobel/Canny 更粗、更平滑的边缘）
```

## 6.5 结构元素创建

```python
# ---- 常见形状 ----
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))        # 矩形 5×5
kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (5, 5))       # 十字 5×5
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))     # 椭圆 5×5

# ---- 自定义 ----
kernel = np.ones((5, 5), np.uint8) * 255  # 全白矩形核
kernel = np.zeros((3, 3), np.uint8)
kernel[1, :] = 255  # 十字
kernel[:, 1] = 255

# ---- 核大小选择 ----
# 小噪声 (1-3px):    kernel=(3,3), iter=1
# 中等噪声 (3-5px):  kernel=(5,5), iter=2-3
# 大结构 (5-10px):   kernel=(11,11), iter=3-5
```

## 6.6 连通域分析（Connected Components）

### 6.6.1 标记连通域

```python
# 二值图像中每个前景像素分配一个标签编号
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
    binary_img,   # 二值图像（8UC1）
    connectivity=8,      # 8 连通（默认）或 4 连通
    ltype=cv2.CV_32S     # 标签类型
)

# stats: num_labels × 5 矩阵
#   [x, y, w, h, area]  — 每个连通域的边界框和面积
# centroids: num_labels × 2 矩阵
#   [cx, cy]            — 每个连通域的质心

# labels: 与原图同尺寸的矩阵，每个像素值为连通域编号
# num_labels: 连通域总数（含背景=0）

# 过滤小连通域
min_area = 100
filtered = np.zeros_like(binary_img)
for i in range(1, num_labels):
    if stats[i, cv2.CC_STAT_AREA] >= min_area:
        filtered[labels == i] = 255
```

### 6.6.2 连通域应用示例

```python
def count_objects(binary_img, min_area=100):
    """统计二值图像中满足面积阈值的对象数量"""
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        binary_img, connectivity=8, ltype=cv2.CV_32S
    )

    objects = []
    for i in range(1, num_labels):  # 跳过背景(0)
        area = stats[i, cv2.CC_STAT_AREA]
        if area >= min_area:
            x, y, w, h = stats[i, :4]
            cx, cy = centroids[i]
            objects.append({'id': i, 'area': area, 'bbox': (x,y,w,h), 'center': (cx,cy)})

    return objects, num_labels - 1  # 减去背景
```

## 6.7 分水岭算法（Watershed）

用于图像分割 — 将图像视为地形，水从标记点（markers）开始汇流。

```python
# 1. 预处理：去噪 + 灰度 + 距离变换
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (5, 5), 0)

# 2. 阈值确定前景
ret, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)

# 3. 去噪：开运算
kernel = np.ones((3,3), np.uint8)
eroded = cv2.erode(thresh, kernel, iterations=2)
dilated = cv2.dilate(eroded, kernel, iterations=2)

# 4. 距离变换 + 阈值确定sure foreground
dist = cv2.distanceTransform(thresh, cv2.DIST_L2, 5)
ret, sure_fg = cv2.threshold(dist, dist.max()*0.6, 255, 0)

# 5. 确定sure background（膨胀 sure_fg 得到）
sure_bg = cv2.dilate(eroded, kernel, iterations=3)

# 6. 确定未知区域（前景和背景之间的边界）
unknown = cv2.subtract(sure_bg, sure_fg)

# 7. 创建 markers（连通域编号）
ret, markers = cv2.connectedComponents(sure_fg)
markers = markers + 1  # 背景=0，确保 >0
markers[unknown == 255] = 0  # 未知区域标记为 0

# 8. 分水岭
markers = cv2.watershed(img, markers)

# 结果：每个区域被标记为正整数，边界为 -1
# 可视化
img_result = img.copy()
img_result[markers == -1] = [255, 0, 0]  # 边界标红
```

## 6.8 形态学操作速查表

| 操作 | 函数 | 用途 |
|------|------|------|
| 腐蚀 | `cv2.erode(img, kernel, iter)` | 缩小前景、去亮噪点 |
| 膨胀 | `cv2.dilate(img, kernel, iter)` | 扩张前景、去暗噪点 |
| 开运算 | `morphologyEx(MORPH_OPEN)` | 去白噪点、断开连接 |
| 闭运算 | `morphologyEx(MORPH_CLOSE)` | 去黑噪点、填洞 |
| 梯度 | `morphologyEx(MORPH_GRADIENT)` | 提取轮廓 |
| 顶帽 | `morphologyEx(MORPH_TOPHAT)` | 提取亮结构 |
| 黑帽 | `morphologyEx(MORPH_BLACKHAT)` | 提取暗结构 |
| 距离变换 | `cv2.distanceTransform()` | 到最近背景点的距离 |
| 连通域 | `cv2.connectedComponentsWithStats()` | 标记并统计连通对象 |
| 分水岭 | `cv2.watershed()` | 分割粘连对象 |

## 6.9 实战：车牌字符分割

```python
def segment_characters(binary_img):
    """形态学操作分割车牌字符"""
    # 垂直方向开运算 — 去掉水平线条（保留字符垂直结构）
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 8))
    opened_v = cv2.morphologyEx(binary_img, cv2.MORPH_OPEN, v_kernel)

    # 水平方向开运算 — 去掉垂直线条
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (8, 1))
    opened_h = cv2.morphologyEx(binary_img, cv2.MORPH_OPEN, h_kernel)

    # 连通域分析
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(opened_v, 8)

    chars = []
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if 20 < area < 5000:  # 过滤太小/太大
            x, y, w, h = stats[i][:4]
            chars.append((x, y, w, h))

    # 按 x 排序
    chars.sort(key=lambda c: c[0])
    return chars
```

---

> 下一章：[第七章 · 直方图与图像增强](ch07-histograms.md) →
