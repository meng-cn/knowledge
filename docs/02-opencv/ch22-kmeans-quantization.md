# 第二十二章 · K-Means / 图像量化

## 22.1 K-Means 聚类

### 22.1.1 基础用法

```python
import cv2
import numpy as np

# ---- 准备数据 ----
data = np.float32(img.reshape(-1, 3))  # (N, 3) 像素值展平
K = 5  # 聚类数

# ---- K-Means 聚类 ----
# criteria: (type, max_iter, epsilon)
# type: cv2.KMEANS_PP_CENTERS / cv2.KMEANS_RANDOM_CENTERS / cv2.KMEANS_CPP
# max_iter: 最大迭代次数
# epsilon: 收敛精度
ret, labels, centers = cv2.kmeans(
    data,              # 输入数据 (N, D) float32
    K,                 # 聚类数
    None,              # 初始标签（None=自动初始化）
    (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0),
    5,                 # 尝试次数
    cv2.KMEANS_PP_CENTERS  # 初始化方法
)
# ret: 紧凑度（inertia）— 越小越好
# labels: (N,) 每个数据点的聚类标签
# centers: (K, D) 聚类中心

# ---- 应用聚类结果 ----
# 将每个像素替换为其中心颜色
quantized = centers[labels.flatten()].reshape(img.shape).astype(np.uint8)
```

### 22.1.2 K-Means 参数详解

| 参数 | 说明 |
|------|--|
| `data` | (N, D) float32 |
| `K` | 聚类数 |
| `criteria` | 终止条件 |
| `attempts` | 多次随机初始化，取最佳 |
| `flags` | `KMEANS_PP_CENTERS`（推荐 ✅）/ `KMEANS_RANDOM_CENTERS` / `KMEANS_PREDEFINED_CENTERS` |

### 22.1.3 K-Means 用于图像颜色量化

```python
def kmeans_quantize(img, K=8):
    """K-Means 颜色量化 — 减少图像颜色数"""
    pixels = img.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.1)
    ret, labels, centers = cv2.kmeans(pixels, K, None, criteria, 10, cv2.KMEANS_PP_CENTERS)

    # 还原图像
    centers = centers.astype(np.uint8)
    quantized = centers[labels.flatten()].reshape(img.shape)
    return quantized

# 使用
quantized_img = kmeans_quantize(img, K=8)
```

## 22.2 图像量化（Image Quantization）

### 22.2.1 均匀量化

```python
def uniform_quantize(img, levels=8):
    """均匀量化 — 将每个通道值映射到 levels 个级别"""
    step = 256 / levels
    quantized = np.round(img / step).astype(np.uint8) * step
    return np.clip(quantized, 0, 255)

# 使用
quantized = uniform_quantize(img, levels=16)
```

### 22.2.2 最大最小量化

```python
def max_min_quantize(img, levels=8):
    """最大最小量化 — 按像素值范围均匀分段"""
    pixels = img.reshape(-1, img.shape[2])
    result = np.zeros_like(img)

    for c in range(img.shape[2]):
        channel = pixels[:, c]
        step = (channel.max() - channel.min()) / levels
        result[:, :, c] = (np.round((channel - channel.min()) / step) * step + channel.min()).reshape(img.shape[:2])

    return result
```

## 22.3 聚类评估

```python
def evaluate_clustering(labels, centers):
    """评估聚类质量"""
    unique_labels = np.unique(labels)
    silhouettes = []

    for l in unique_labels:
        mask = labels == l
        cluster_points = centers[mask]
        if len(cluster_points) < 2:
            continue

        # 类内距离
        dists_in = np.linalg.norm(cluster_points - centers[l], axis=1)
        avg_in = np.mean(dists_in)

        silhouettes.append(avg_in)

    return np.mean(silhouettes)
```

---
