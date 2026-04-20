# 第二章 · 核心数据结构

## 2.1 Mat — 矩阵/图像的核心类型

### 2.1.1 类型

OpenCV 的 `Mat` 是一个通用矩阵类，可以表示任意维度的数值数组。图像是 `Mat` 的特例 —— 二维数组，每个元素是像素值。

#### 数据类型编码

```
CV_<位数><数据类型><通道数>
```

| 编码 | 含义 | 示例 |
|------|------|------|
| `CV_8U` | 8 位无符号 | `0–255` |
| `CV_8S` | 8 位有符号 | `-128–127` |
| `CV_16U` | 16 位无符号 | `0–65535` |
| `CV_16S` | 16 位有符号 | |
| `CV_32S` | 32 位有符号 | `int` |
| `CV_32F` | 32 位浮点 | `float` |
| `CV_64F` | 64 位浮点 | `double` |

#### 常用图像类型速查

| 类型 | 通道 | Python 创建 | 用途 |
|------|------|-----------|------|
| `CV_8UC1` | 1 (灰度) | `np.uint8` | 灰度图 |
| `CV_8UC3` | 3 (BGR) | `np.uint8` | 彩色图 |
| `CV_8UC4` | 4 (BGRA) | `np.uint8` | 含 Alpha 通道 |
| `CV_32FC1` | 1 (float) | `np.float32` | 浮点图/特征图 |
| `CV_32FC3` | 3 (float) | `np.float32` | 光流/深度图 |
| `CV_64FC1` | 1 (double) | `np.float64` | 高精度计算 |

```python
import cv2
import numpy as np

# 彩色图 480×640，BGR 三通道
img = np.zeros((480, 640, 3), dtype=np.uint8)
print(img.shape)      # (480, 640, 3)
print(img.dtype)      # uint8
print(img.size)       # 921600 总元素数
print(img.ndim)       # 3

# 灰度图
gray = np.zeros((480, 640), dtype=np.uint8)
print(gray.shape)     # (480, 640)

# float32 矩阵
feat = np.zeros((480, 640), dtype=np.float32)
```

#### C++ 对应

```cpp
cv::Mat img(480, 640, CV_8UC3);        // 480×640 BGR
cv::Mat gray(480, 640, CV_8UC1);        // 480×640 灰度
cv::Mat feat(480, 640, CV_32FC1);        // float 矩阵
```

### 2.1.2 Mat 的内存管理

| 特性 | 说明 |
|------|------|
| **引用计数** | `Mat` 拷贝头不拷贝数据（浅拷贝），共享同一块内存 |
| **autoRelease** | 引用计数归零时自动释放 |
| **深拷贝** | `clone()` / `copyTo()` |
| **零拷贝** | `ROI`、`row/col` 切片不分配新内存 |

```python
# 浅拷贝（共享内存）
a = img          # a 和 img 指向同一内存
a[0, 0] = 255
print(img[0, 0]) # 255 — img 也被改变了

# 深拷贝（独立内存）
b = img.copy()   # 或 img.copy() / img.clone()
b[0, 0] = 128
print(img[0, 0]) # 255 — img 不受影响

# 引用计数
print(img.refcount)  # Python 中不直接暴露，C++ 中: img.refcount()
```

```cpp
// C++
cv::Mat a = img;             // 浅拷贝，共享内存
a.at<cv::Vec3b>(0, 0) = cv::Vec3b(255, 255, 255);

cv::Mat b = img.clone();     // 深拷贝
b.at<cv::Vec3b>(0, 0) = cv::Vec3b(0, 0, 0);
```

### 2.1.3 创建 Mat 的常用方式

```python
# ---- numpy 创建 ----
np.zeros((h, w, c), dtype)     # 全零
np.ones((h, w, c), dtype)      # 全一
np.full((h, w, c), val, dtype)  # 指定值
np.random.randint(0, 256, (h,w,c), np.uint8)  # 随机
np.eye(h, dtype)                # 单位阵
np.linspace(start, stop, num)   # 等差数列

# ---- OpenCV 创建 ----
cv2.empty((h, w, c), dtype)     # 未初始化（快但不安全）
cv2.convertMaps(map1, map2, dsttype)  # 转换映射
cv2.getRectSubPix(img, roi_size, center)  # 获取矩形子图
```

## 2.2 图像与矩阵的对应

```
图像尺寸：宽=cols=640，高=rows=480

   0      639  ← cols (x, 横向)
   +-------------+
 0 |             |
   |             |   ↑
   |             |   rows (y, 纵向)
 479|             |
   +-------------+
```

- **shape** = `(rows, cols, channels)` = `(高, 宽, 通道)` — ⚠️ 注意 numpy 顺序是先高后宽
- **data type** 决定每个元素的取值范围和占用字节数
- **step/stride** = 每行实际占用的字节数（可能 > cols×elemSize，用于内存对齐）

```python
img = np.zeros((480, 640, 3), dtype=np.uint8)
print(img.shape)    # (480, 640, 3)
print(img.dtype)    # uint8
print(img.itemsize) # 1 字节/元素
print(img.nbytes)   # 480*640*3 = 921600
```

## 2.3 访问像素

### 2.3.1 NumPy 方式（Python）

```python
# 单像素访问 (行=高, 列=宽)
pixel = img[row, col]       # BGR 向量
pixel_b = img[row, col, 0]  # 单通道
img[row, col] = [255, 128, 0]  # 设置像素

# 批量访问 — 整行
row_data = img[row, :]

# 批量访问 — 多行（切片，零拷贝）
roi = img[100:200, 50:150]   # 取子区域

# ROI — Region of Interest
roi = img[100:200, 50:150]   # 共享内存
roi[0, 0] = 255
print(img[100, 50])           # 255 — ROI 修改影响原图

# 通道分离/合并
b, g, r = cv2.split(img)    # 或 img[:,:,0], img[:,:,1], img[:,:,2]
img = cv2.merge([b, g, r])

# 或者更简洁
bgr = cv2.split(img)        # 返回 tuple
img = cv2.merge(bgr)

# 通道重排（BGR → RGB）
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
```

```cpp
// C++ — at<> 模板
cv::Vec3b pixel = img.at<cv::Vec3b>(row, col);  // 访问
img.at<cv::Vec3b>(row, col) = cv::Vec3b(0,0,255); // 设置

// 单通道
uchar val = gray.at<uchar>(row, col);
gray.at<uchar>(row, col) = 255;

// 批量 — ptr (快速)
for (int r = 0; r < img.rows; r++) {
    cv::Vec3b* row_ptr = img.ptr<cv::Vec3b>(r);
    for (int c = 0; c < img.cols; c++) {
        // row_ptr[c] 访问
    }
}
```

### 2.3.2 逐像素遍历的性能比较

```python
import cv2, numpy as np
import time

img = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)

# 方法1: 逐个像素（极慢，不推荐）
t0 = time.time()
for i in range(img.shape[0]):
    for j in range(img.shape[1]):
        img[i, j, 0] += 10
print(f"逐像素: {time.time()-t0:.3f}s")  # ~几秒

# 方法2: 向量化（推荐 ✅）
t0 = time.time()
img[:, :, 0] += 10
print(f"向量化: {time.time()-t0:.3f}s")  # ~毫秒

# 方法3: np.where（条件处理）
t0 = time.time()
img = np.where(img > 128, 255, 0).astype(np.uint8)
print(f"np.where: {time.time()-t0:.3f}s")

# 方法4: cv2.filter2D（卷积运算）
kernel = np.ones((3,3), np.float32) / 9
t0 = time.time()
blurred = cv2.filter2D(img, -1, kernel)
print(f"filter2D: {time.time()-t0:.3f}s")
```

**黄金法则**：能用向量化就不用循环，能用 opencv C++ 底层就不用 numpy 循环。

## 2.4 通道与色彩空间

### 2.4.1 常见色彩空间

| 空间 | 通道 | 用途 | 转换 |
|------|------|------|------|
| **BGR** | 3 | OpenCV 默认彩色格式 | `cvtColor(src, BGR2RGB)` |
| **RGB** | 3 | matplotlib / PIL 默认 | `cvtColor(src, BGR2RGB)` |
| **GRAY** | 1 | 灰度图、简化处理 | `cvtColor(src, BGR2GRAY)` |
| **HSV** | 3 | 颜色分割、色度分析 | `cvtColor(src, BGR2HSV)` |
| **HLS** | 3 | 亮度/饱和度控制 | `cvtColor(src, BGR2HLS)` |
| **Lab** | 3 |  perceptually uniform | `cvtColor(src, BGR2Lab)` |
| **YCrCb** | 3 | 肤色检测 | `cvtColor(src, BGR2YCrCb)` |
| **XYZ** | 3 | 色彩科学 | `cvtColor(src, BGR2XYZ)` |
| **YUV** | 3 | 视频编码 | `cvtColor(src, BGR2YUV)` |

### 2.4.2 色彩空间转换

```python
# BGR → 灰度
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# BGR → HSV（色度空间，适合颜色分割）
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# H: 0-180 (OpenCV 将 0-360 缩半), S: 0-255, V: 0-255

# HSV → BGR（还原）
img2 = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

# 常见转换组合
cv2.COLOR_BGR2RGB     # BGR → RGB
cv2.COLOR_BGR2GRAY    # BGR → 灰度
cv2.COLOR_BGR2HSV     # BGR → HSV
cv2.COLOR_BGR2Lab     # BGR → Lab
cv2.COLOR_GRAY2BGR    # 灰度 → BGR（复制通道）
cv2.COLOR_RGB2BGR     # RGB → BGR
```

```python
# HSV 颜色分割示例
lower_blue = np.array([100, 50, 50])
upper_blue = np.array([130, 255, 255])
mask = cv2.inRange(hsv, lower_blue, upper_blue)
result = cv2.bitwise_and(img, img, mask=mask)
```

## 2.5 ROI — 感兴趣区域

ROI 是图像处理中最重要的概念之一，允许你只操作图像的某一部分。

### 2.5.1 NumPy 切片创建 ROI

```python
img = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)

# 矩形 ROI
face_roi = img[100:300, 200:400]    # 共享内存

# 多边形 ROI（用 mask）
mask = np.zeros(img.shape[:2], dtype=np.uint8)
pts = np.array([[200,100],[400,100],[400,300],[200,300]], np.int32)
cv2.fillPoly(mask, [pts], 255)
result = cv2.bitwise_and(img, img, mask=mask)

# ROI 赋值（修改会影响原图）
face_roi[:] = [255, 0, 0]  # 将 ROI 区域设为蓝色
```

### 2.5.2 setROI / getROI（C++）

```cpp
cv::Mat img(480, 640, CV_8UC3);
cv::Rect roi(200, 100, 200, 200);  // x, y, width, height
cv::Mat face_roi(img, roi);         // 共享内存
face_roi.setTo(cv::Scalar(255, 0, 0));
```

## 2.6 图像 I/O

### 2.6.1 读取与保存

```python
import cv2

# ---- 读取 ----
img = cv2.imread('photo.jpg', cv2.IMREAD_COLOR)      # BGR, 丢弃 Alpha
img = cv2.imread('photo.png', cv2.IMREAD_UNCHANGED)  # 原样读取（含 Alpha）
img = cv2.imread('photo.jpg', cv2.IMREAD_GRAYSCALE)  # 灰度
img = cv2.imread('photo.jpg', -1)                     # 等价于 IMREAD_UNCHANGED

# 检查是否成功
assert img is not None, "图片加载失败"

# ---- 保存 ----
cv2.imwrite('output.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 95])
cv2.imwrite('output.png', img, [cv2.IMWRITE_PNG_COMPRESSION, 3])
cv2.imwrite('output.bmp', img)
```

| 参数 | 含义 |
|------|------|
| `IMWRITE_JPEG_QUALITY` | JPEG 质量 1–100（默认 95） |
| `IMWRITE_PNG_COMPRESSION` | PNG 压缩 0–9（默认 3，慢但小） |
| `IMWRITE_WEBP_QUALITY` | WebP 质量 1–100 |

### 2.6.2 支持的格式

```
JPEG/JPG/JPE/JPEG   — 有损压缩
PNG                 — 无损，支持 Alpha
BMP                 — 无损，文件大
TIFF/TIF            — 高动态范围，多页
WEBP                — Google 格式，体积小
OpenEXR             — HDR 图像
HDR                 — 高动态范围
PXM/PGM/PPM         — 文本/二进制灰度/彩色
```

### 2.6.3 从字节/内存读取（无文件）

```python
import numpy as np
import cv2

# 从 bytes/bytearray 读取
img = cv2.imdecode(np.frombuffer(byte_array, np.uint8), cv2.IMREAD_COLOR)

# 从内存指针读取（C++）
cv::Mat img = cv::imdecode(cv::InputArray(buffer), cv::IMREAD_COLOR);
```

## 2.7 常见错误与陷阱

| 问题 | 原因 | 解决 |
|------|------|------|
| `img is None` | 文件路径错误或损坏 | 检查路径、文件格式 |
| ROI 修改影响原图 | 浅拷贝共享内存 | 用 `.copy()` 深拷贝 |
| BGR/RGB 颜色不对 | 用 matplotlib 显示 BGR | `plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))` |
| `assert failure` | 输入通道数不匹配 | 确认 `cvtColor` 前后通道一致 |
| 图像全黑 | 浮点图像保存为 uint8 | 用 `cv2.normalize()` 或 `cv2.convertScaleAbs()` |
| `at<>` 访问越界 | 行列颠倒（row=高, col=宽） | 注意 `img[y, x]` 而非 `img[x, y]` |

---