# 第二十三章 · HOG / 行人检测

## 23.1 HOG 特征详解

### 23.1.1 HOG 特征计算流程

```
原图像
  ↓ 灰度化
灰度图像
  ↓ 伽马校正（归一化光照）
校正后图像
  ↓ Sobel 梯度计算（X, Y 方向）
梯度幅值 + 梯度方向
  ↓ 分组为 cell（通常 8×8 像素）
每个 cell 的梯度方向直方图（9 bin）
  ↓ 分组为 block（通常 2×2 cells = 16×16 像素）
block 内直方图归一化（L2-Hys）
  ↓ 滑动 block
HOG 特征向量
```

### 23.1.2 HOGDescriptor 完整参数

```python
hog = cv2.HOGDescriptor(
    winSize=(64, 128),      # 检测窗口大小（宽×高，单位：像素）
    blockSize=(16, 16),     # block 大小（通常 = 2×cellSize）
    blockStride=(8, 8),     # block 滑动步长（通常 = cellSize）
    cellSize=(8, 8),        # cell 大小
    nbins=9,                # 方向 bin 数（0-180 度分 9 份）
    winStride=(4, 4),       # 检测窗口滑动步长
    padding=(0, 0),         # 边缘填充
    histogramNormMethod=cv2.HOGDescriptor_L2Hys,  # L2-Hys 归一化
    gammaCorrection=True,     # 伽马校正
    SignedGrads=False         # True = S-HOG（带符号梯度）
)

# 计算特征向量
hog_features = hog.compute(gray)
# hog_features: (N,) 的向量，长度 = (winSize-cellSize)/blockStride + 1 的每个 block 的特征数
```

### 23.1.3 HOG 特征长度计算

```python
# 特征向量长度 = ((winSize - blockSize) / blockStride + 1)² × (blockSize/cellSize)² × nbins

# 默认行人检测参数:
# winSize=(64,128), blockSize=(16,16), blockStride=(8,8), cellSize=(8,8), nbins=9
# blocks_per_dim_x = (64-16)/8 + 1 = 7
# blocks_per_dim_y = (128-16)/8 + 1 = 15
# blocks_per_cell = (16/8)² = 4
# hog_len = 7 × 15 × 4 × 9 = 3780

hog_len = ((64-16)//8 + 1) * ((128-16)//8 + 1) * (16//8)**2 * 9
print(f"HOG 特征长度: {hog_len}")  # 3780
```

## 23.2 行人检测完整示例

### 23.2.1 默认 HOG 行人检测器

```python
import cv2

# 加载默认行人检测器
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultDalar())  # Dalal & Trujillo 预训练 SVM 系数

# 检测
boxes, weights = hog.detectMultiScale(
    gray,
    hitThreshold=0,         # 检测阈值（默认 0）
    winStride=(4, 4),       # 必须与训练时一致
    padding=(8, 8),         # 必须与训练时一致
    scale=1.05              # 图像金字塔缩放
)

# 结果过滤
if len(boxes) > 0:
    # NMS
    boxes = np.array([[x, y, w, h] for x, y, w, h in boxes])
    weights = np.array(weights)
    indices = cv2.dnn.NMSBoxes(boxes.tolist(), weights.tolist(), 0.5, 0.3)
    for i in indices.flatten():
        x, y, w, h = boxes[i]
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
```

### 23.2.2 自定义 HOG + SVM 行人检测

```python
# ---- 1. 收集训练数据 ----
# 正样本：行人图像（需要统一尺寸，如 64×128）
# 负样本：非行人图像
# 计算每个图像的 HOG 特征

def extract_hog_features(img, hog_detector=None):
    if hog_detector is None:
        hog_detector = cv2.HOGDescriptor((64, 128), (16, 16), (8, 8), (8, 8), 9)
    return hog_detector.compute(img)

# 正样本特征
pos_features = []
for img_pos in positive_images:
    feat = extract_hog_features(img_pos)
    pos_features.append(feat)
pos_features = np.array(pos_features)

# 负样本特征
neg_features = []
for img_neg in negative_images:
    feat = extract_hog_features(img_neg)
    neg_features.append(feat)
neg_features = np.array(neg_features)

# ---- 2. 合并训练数据 ----
train_data = np.vstack([pos_features, neg_features])
labels = np.array([1] * len(pos_features) + [-1] * len(neg_features))

# ---- 3. 训练 SVM ----
svm = cv2.ml.SVM_create()
svm.setType(cv2.ml.SVM_C_SVC)
svm.setKernel(cv2.ml.SVM_LINEAR)
svm.setC(0.01)
svm.setTermCriteria((cv2.TERM_CRITERIA_MAX_ITER, 1000, 1e-6))
svm.train(train_data, cv2.ROW_SAMPLE, labels.astype(np.float32))

# ---- 4. 提取 SVM 系数 ----
sv = svm.getSupportVectors()
rho, _ = svm.getDecisionFunction(0)
hog.setSVMDetector(np.append(-sv, -rho).astype(np.float32))
```

## 23.3 HOG 可视化

```python
def visualize_hog(img):
    """可视化 HOG 特征（梯度方向直方图）"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 计算梯度
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)

    mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)

    # cell size
    cell_size = 8
    h, w = gray.shape

    # 创建直方图可视化
    cell_hist = np.zeros((h // cell_size, w // cell_size, 9), dtype=np.float32)

    for cy in range(h // cell_size):
        for cx in range(w // cell_size):
            cell_mag = mag[cy*cell_size:(cy+1)*cell_size, cx*cell_size:(cx+1)*cell_size]
            cell_ang = ang[cy*cell_size:(cy+1)*cell_size, cx*cell_size:(cx+1)*cell_size]

            # 统计方向直方图
            for angle in range(9):
                mask = (cell_ang >= angle * 20) & (cell_ang < (angle + 1) * 20)
                cell_hist[cy, cx, angle] = cell_mag[mask].sum()

    # 可视化每个 cell 的直方图
    vis = np.zeros((h, w, 3), dtype=np.uint8)
    for cy in range(h // cell_size):
        for cx in range(w // cell_size):
            total = cell_hist[cy, cx].sum() + 1e-6
            mag_bar = 0
            for angle in range(9):
                bar_mag = int(cell_hist[cy, cx, angle] / total * 30)
                x = cx * cell_size + cell_size // 2
                y = cy * cell_size + cell_size // 2 - bar_mag
                cv2.line(vis, (x, y), (x, y + bar_mag), (0, 255, 0), 1)

    return vis

hog_vis = visualize_hog(img)
cv2.imshow('HOG Visualization', hog_vis)
cv2.waitKey(0)
```

## 23.4 HOG 行人检测优缺点

| 优点 | 缺点 |
|------|--|
| 不依赖颜色 | 对姿态变化敏感 |
| 计算量适中 | 需要大量训练数据 |
| 精度较好 | 对裁剪/缩放敏感 |
| 可解释性强 | 实时需 GPU 加速 |

## 23.5 行人检测对比

| 方法 | 精度 | 速度 | 实时 |
|------|--|--|--|
| **HOG+SVM** | ★★★★ | ⚡⚡ | 是 |
| **YOLO** | ★★ | ⚡⚡⚡ | 是 |
| **Faster R-CNN** | ★★ | ⚡ | 否 |
| **RetinaNet** | ★★ | ⚡⚡⚡ | 是 |

---

**Part VI · 机器学习**（第 21–23 章）全部完成 ✅

累计进度：

```
Part I  ✅ 基础篇 (4章)
Part II ✅ 图像处理 (5章)
Part III ✅ 特征与匹配 (4章)
Part IV ✅ 目标检测与跟踪 (4章)
Part V  ✅ 相机与三维 (3章)
Part VI ✅ 机器学习 (3章)
Part VII  🔲 高级与实战 (5章)
Part VIII 🔲 附录 (4章)
───────────────────────
已完成 23/32 章
```

继续 Part VII（高级与实战，第 24–28 章）？
