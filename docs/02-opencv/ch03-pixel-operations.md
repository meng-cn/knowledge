# 第三章 · 像素级图像操作

## 3.1 图像算术运算

### 3.1.1 基本算术

OpenCV 的算术运算使用 `cv2.add()`, `cv2.subtract()`, `cv2.multiply()`, `cv2.divide()`。这些函数处理**饱和**（溢出取最大值）而非 Python numpy 的**取模**。

```python
import cv2
import numpy as np

img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)

# 加（饱和加法: 250+100=255 而非 194）
result = cv2.add(img, 50)

# 减（饱和减法: 20-30=0 而非 226）
result = cv2.subtract(img, 30)

# 乘（缩放亮度）
result = cv2.multiply(img, 1.5)        # 亮度×1.5

# 除
result = cv2.divide(img, 2)            # 亮度÷2

# 对应 numpy 运算（取模，非饱和）
result_np = (img + 50) % 256

# 两个图像相加
img2 = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
result = cv2.add(img, img2)
```

### 3.1.2 图像混合（加权平均）

```python
# dst = α·img1 + β·img2 + γ
result = cv2.addWeighted(img1, 0.6, img2, 0.4, 0)

# 等价于：
# result = cv2.convertScaleAbs(img1, alpha=0.6) + \
#          cv2.convertScaleAbs(img2, alpha=0.4)
```

### 3.1.3 对比度与亮度调节

```python
def adjust_brightness_contrast(img, alpha=1.0, beta=0):
    """
    调节对比度(alpha)和亮度(beta)
    alpha > 1: 对比度增加; alpha < 1: 对比度降低
    beta > 0:  亮度增加; beta < 0: 亮度降低
    """
    dst = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    return dst

# 使用
img = cv2.imread('photo.jpg')
brighter = cv2.convertScaleAbs(img, alpha=1.2, beta=30)   # 更亮 + 对比度
darker = cv2.convertScaleAbs(img, alpha=0.8, beta=-20)    # 更暗 + 降低对比度
```

### 3.1.4 对数/伽马变换

```python
import cv2, numpy as np

# 伽马校正: dst = 255 * (src/255) ^ (1/gamma)
def gamma_correction(img, gamma=1.0):
    inv_gamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv_gamma) * 255
                      for i in np.arange(0, 256)]).astype("uint8")
    return cv2.LUT(img, table)

# gamma < 1 → 图像变亮
# gamma > 1 → 图像变暗
# gamma = 1 → 不变

# 对数变换（扩展暗部细节）
def log_transform(img):
    img_float = img.astype(np.float64) + 1  # +1 避免 log(0)
    log_img = np.log(img_float)
    log_img = log_img / log_img.max() * 255
    return log_img.astype(np.uint8)
```

## 3.2 逻辑运算

```python
img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)

# AND, OR, XOR, NOT
result_and = cv2.bitwise_and(img1, img2)   # 两图对应位 AND
result_or  = cv2.bitwise_or(img1, img2)    # OR
result_xor = cv2.bitwise_xor(img1, img2)   # XOR
result_not = cv2.bitwise_not(img)          # 逐位取反

# 与 mask 结合 — 提取 ROI
mask = np.zeros(img.shape[:2], dtype=np.uint8)
mask[30:70, 30:70] = 255  # 中间 40×40 为白色
result = cv2.bitwise_and(img, img, mask=mask)
# 只有 mask=255 的区域被保留
```

### 逻辑运算 + mask 的经典用法

```python
# 背景替换：将前景对象复制到新背景
foreground_mask = get_foreground_mask(img)  # 假设已有二值 mask
background = cv2.imread('new_bg.jpg')

# 裁剪背景匹配尺寸
bg_roi = background[0:img.shape[0], 0:img.shape[1]]

# 前景（mask=255 部分）
fg = cv2.bitwise_and(img, img, mask=foreground_mask)

# 背景（mask=0 部分）
bg_part = cv2.bitwise_and(bg_roi, bg_roi, mask=cv2.bitwise_not(foreground_mask))

# 合成
composite = cv2.add(fg, bg_part)
```

## 3.3 通道操作

### 3.3.1 通道分离与合并

```python
b, g, r = cv2.split(img)           # 分离
img2 = cv2.merge([b, g, r])        # 合并（顺序重要！）
img2 = cv2.merge([r, g, b])        # RGB 格式

# 单通道替换
new_b = cv2.imread('blue_channel.jpg', 0)
img[:,:,0] = new_b                  # 替换 B 通道
```

### 3.3.2 单通道可视化

```python
# 分别显示三个通道（用灰度图表示每个通道的强度）
b, g, r = cv2.split(img)

channels = {'B': b, 'G': g, 'R': r}
for name, ch in channels.items():
    cv2.imshow(f'Channel {name}', ch)
# 通道值高 → 该位置此颜色强
```

## 3.4 查表（LUT — Look-Up Table）

LUT 是像素级映射的高效方式 — 一个预先计算好的 256 值数组。

### 3.4.1 基础用法

```python
# 创建一个 256 的映射表
table = np.arange(0, 256, dtype=np.uint8)
# 自定义映射: 线性拉伸
table = np.clip(table * 1.5, 0, 255).astype(np.uint8)

# 应用到图像（对所有通道同时）
result = cv2.LUT(img, table)

# 常用于：伽马校正、对比度拉伸、色调映射
```

### 3.4.2 LUT vs 条件运算性能

```python
# LUT — 极快（C 层循环）
table = np.arange(0, 256, dtype=np.uint8)
table[table > 128] = 255
table[table <= 128] = 0
result = cv2.LUT(img, table)

# 等价的条件运算（Python 层）
result = np.where(img > 128, 255, 0).astype(np.uint8)

# LUT 通常比 numpy 条件运算快 2-5x
```

## 3.5 裁剪、填充与缩放

### 3.5.1 裁剪（切片）

```python
# 直接 numpy 切片
cropped = img[y1:y2, x1:x2]  # 共享内存，零拷贝

# 确保不越界
h, w = img.shape[:2]
y1, y2 = max(0, y1), min(h, y2)
x1, x2 = max(0, x1), min(w, x2)
cropped = img[y1:y2, x1:x2]
```

### 3.5.2 填充（Border）

```python
# 常见边界类型
padded = cv2.copyMakeBorder(
    img,
    top=10, bottom=10, left=10, right=10,
    borderType=cv2.BORDER_CONSTANT,     # 常量填充
    value=[0, 0, 0]                       # 填充值（BGR）
)

# 常见的 borderType
# cv2.BORDER_CONSTANT    — 常量填充（最常用）
# cv2.BORDER_REFLECT     — 镜像填充   abc|abcd|cba
# cv2.BORDER_REFLECT_101 — 镜像填充（不含边界） abcd|dcba
# cv2.BORDER_REPLICATE   — 边缘复制     aaaa|abcd|dddd
# cv2.BORDER_WRAP        — 环绕填充     cdef|abcd|efgh
# cv2.BORDER_TRANSPARENT — 反镜像        fgfe|abcd|efed
```

### 3.5.3 缩放

```python
# 固定倍数缩放
small = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
large = cv2.resize(img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

# 固定尺寸缩放
target = cv2.resize(img, (320, 240), interpolation=cv2.INTER_LINEAR)

# 插值方法速查
# cv2.INTER_NEAREST   — 最近邻（最快，质量最低）
# cv2.INTER_LINEAR    — 双线性（默认，平衡）
# cv2.INTER_CUBIC     — 双三次（质量高，慢）
# cv2.INTER_AREA      — 区域（缩小推荐 ✅）
# cv2.INTER_LANCZOS4  — Lanczos（质量最高，最慢）
```

## 3.6 通道数转换

```python
# 单通道 → 三通道（复制）
gray = cv2.imread('photo.jpg', 0)   # 灰度
three_channel = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

# 三通道 → 单通道
img = cv2.imread('photo.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 四通道 → 三通道（去掉 Alpha）
rgba = cv2.imread('photo.png', cv2.IMREAD_UNCHANGED)
rgb = cv2.cvtColor(rgba, cv2.COLOR_BGRA2BGR)

# 三通道 → 四通道（加 Alpha）
bgr = cv2.imread('photo.jpg')
bgra = cv2.cvtColor(bgr, cv2.COLOR_BGR2BGRA)
```

## 3.7 常用像素级操作速查表

| 操作 | 函数/方式 | 一句话说明 |
|------|----------|-----------|
| 饱和度加减 | `cv2.add(src, val)` / `cv2.subtract()` | 饱和运算，不溢出 |
| 亮度对比度 | `cv2.convertScaleAbs(src, alpha, beta)` | alpha=对比度, beta=亮度 |
| 伽马校正 | `cv2.LUT(img, gamma_table)` | 全局色调映射 |
| 两图混合 | `cv2.addWeighted(img1, α, img2, β, γ)` | α+β 通常=1 |
| 位运算 | `cv2.bitwise_and/or/xor/not()` | 与 mask 配合做选择 |
| 查表 | `cv2.LUT(img, table)` | 256 值映射，超快 |
| 通道分离 | `cv2.split(img)` → (b,g,r) | 各通道独立处理 |
| 通道合并 | `cv2.merge([b,g,r])` | 顺序决定颜色 |
| 填充 | `cv2.copyMakeBorder()` | 常量/镜像/复制 |
| 缩放 | `cv2.resize(src, (w,h), interp)` | INTER_AREA 缩小优选 |

## 3.8 性能提示

```python
# ❌ 逐像素循环（极慢）
for i in range(h):
    for j in range(w):
        img[i, j] = ...

# ✅ 向量化（快 100x+）
img[:] = ...

# ✅ opencv C 底层（最快）
cv2.LUT(img, table)
cv2.convertScaleAbs(img, alpha, beta)
cv2.add(img, val)
```

**黄金法则**：
1. 向量化 > numpy 循环
2. OpenCV C 函数 > numpy 函数（通常）
3. 大数组用 `float32` 而非 `float64`
4. 避免在循环中重复创建临时对象

---

> 下一章：[第四章 · 几何变换](ch04-geometric-transforms.md) →
