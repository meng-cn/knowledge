# 第十二章 · 特征匹配与 RANSAC

## 12.1 匹配器（Matcher）

### 12.1.1 BFMatcher（暴力匹配器）

```python
import cv2

# ORB 特征（binary descriptor）
orb = cv2.ORB_create()
kp1, des1 = orb.detectAndCompute(gray1, None)
kp2, des2 = orb.detectAndCompute(gray2, None)

# ---- BFMatcher 两种距离度量 ----
# 二进制描述符（ORB/BRIEF/BRISK）→ Hamming 距离
bf_hamming = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

# 浮点描述符（SIFT/SURF）→ L2 距离
bf_l2 = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)

# ---- crossCheck ----
# False: 标准 KNN 匹配（des1[i] 匹配 des2 中最近的所有）
# True: 双向确认匹配（des1[i]→des2[j] 且 des2[j]→des1[i]）

matches = bf_hamming.match(des1, des2)  # 最近邻匹配
print(f"Matches: {len(matches)}")
```

### 12.1.2 FlannBasedMatcher（FLANN 匹配器）

FLANN = Fast Library for Approximate Nearest Neighbors — 近似最近邻

```python
# 适用于描述符维度 > 100 的场景（SIFT 128D）
flann_index_kdtree = 1
flann_index_lsh  = 6

index_params = dict(algorithm=flann_index_lsh,
                    table_number=6,  # 12
                    key_size=12,     # 24
                    multi_probe_level=1)  # 2

search_params = dict(checks=50)  # 或 {trees: 5}

flann = cv2.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(des1, des2, k=2)  # KNN 匹配（返回 K 个最近邻）
```

## 12.2 Lowe's Ratio Test（SIFT 经典过滤）

用 FLANN KNN 匹配 + Lowe's ratio test 过滤误匹配。

```python
def filter_matches_by_ratio(matches, ratio_threshold=0.75):
    """Lowe's ratio test: 只保留第一个最近邻与第二个差距大的匹配"""
    good = []
    for m, n in matches:
        if m.distance < ratio_threshold * n.distance:
            good.append(m)
    return good

# 使用
flann = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
matches = flann.knnMatch(des1, des2, k=2)
good_matches = filter_matches_by_ratio(matches, 0.75)
print(f"After ratio test: {len(good_matches)} matches")
```

## 12.3 匹配结果可视化

```python
# ---- 单匹配（best match）----
img_matches = cv2.drawMatches(img1, kp1, img2, kp2, matches, None,
                              flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv2.imshow('Matches', img_matches)
cv2.waitKey(0)

# ---- KNN 匹配（显示 K=2）----
img_knn = cv2.drawMatchesKnn(img1, kp1, img2, kp2, matches, None,
                              flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv2.imshow('KNN Matches', img_knn)
cv2.waitKey(0)

# ---- 过滤后的 good matches 可视化 ----
img_good = cv2.drawMatches(img1, kp1, img2, kp2, good_matches, None,
                           matchColor=(0, 255, 0),  # 绿色=正确
                           singlePointColor=None,
                           flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
```

## 12.4 匹配质量评估

```python
def evaluate_matches(matches, img1, img2, kp1, kp2, threshold=5.0):
    """评估匹配质量"""
    # 1. 描述符距离分布
    distances = [m.distance for m in matches]
    avg_dist = np.mean(distances)
    std_dist = np.std(distances)

    # 2. 匹配几何一致性检查
    geometrically_consistent = 0
    for m in matches:
        pt1 = kp1[m.queryIdx].pt
        pt2 = kp2[m.trainIdx].pt
        # 检查局部一致性（邻域匹配方向一致）
        geometrically_consistent += 1

    # 3. 返回指标
    return {
        'num_matches': len(matches),
        'avg_distance': avg_dist,
        'std_distance': std_dist,
        'avg_ratio': np.mean([d for d in distances if d < 50]) / 50.0  # 近匹配的比例
    }
```

## 12.5 RANSAC（随机一致性采样）

RANSAC = RANdom SAmple Consensus — 从误匹配中估计正确的变换模型。

### 12.5.1 基础 RANSAC（单应性矩阵）

```python
# 从 matches 中提取匹配点对
if len(matches) >= 4:
    pts1 = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    pts2 = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    # 估计单应性矩阵 + RANSAC 过滤
    H, mask = cv2.findHomography(pts1, pts2, cv2.RANSAC, 5.0)
    # H: 3×3 单应性矩阵
    # mask: 内点掩码（1=内点, 0=外点）

    inlier_count = np.count_nonzero(mask)
    inlier_ratio = inlier_count / len(good_matches)
    print(f"Inliers: {inlier_count}/{len(good_matches)} ({inlier_ratio:.1%})")

    # 过滤出内点匹配
    good_matches = [m for i, m in enumerate(good_matches) if mask[i]]
```

### 12.5.2 单应性矩阵（Homography）

```python
# ---- 单应性矩阵的应用 ----

# 1. 透视校正（图像校正）
src_pts = np.float32([
    [0, 0], [w, 0], [0, h], [w, h]
]).reshape(-1, 1, 2)
dst_pts = ...  # 透视后的四个点

H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
warped = cv2.warpPerspective(img, H, (new_w, new_h))

# 2. 图像拼接的基础
# 3. 增强现实 — 将虚拟物体映射到真实平面

# 4. 将单应性矩阵应用到任意点
def warp_point(H, pt):
    """将点通过单应性矩阵变换"""
    x, y = pt
    p = np.array([x, y, 1])
    q = H @ p
    return (q[0]/q[2], q[1]/q[2])
```

### 12.5.3 基础矩阵与对极几何（Stereo）

```python
# 对两个相机拍摄的图像，估计基础矩阵 F
# F 满足: p2^T * F * p1 = 0（对极约束）
F, mask = cv2.findFundamentalMat(pts1, pts2, cv2.RANSAC, 3.0, 0.99)

# 极线（epipolar lines）
lines1 = cv2.computeCorrespondEpilines(pts1.reshape(-1, 1, 2), 2, F)
lines2 = cv2.computeCorrespondEpilines(pts2.reshape(-1, 1, 2), 1, F)

# 恢复本质矩阵 E（含内参）
E = K2.T @ F @ K1  # K = 相机内参矩阵

# 从 E 分解得到旋转 R 和平移 t
num, R, t, mask = cv2.decomposeEssentialMat(E)
# 4 种解，用三角测量选正确的那个
```

### 12.5.4 仿射变换矩阵（最小 3 点）

```python
# 仿射变换估计（RANSAC 过滤）
pts1 = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
pts2 = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

# 最小仿射变换需要 3 点
src_pts = pts1[:3]
dst_pts = pts2[:3]
M_affine, mask = cv2.estimateAffinePartial2D(src_pts, dst_pts, ransacReprojThreshold=3.0)
# M_affine: 2×3 仿射矩阵
# mask: 内点掩码
```

## 12.6 匹配方法对比与选择

| 方法 | 适用描述符 | 速度 | 精度 | 推荐场景 |
|------|--|--|--|--|
| BFMatcher (NORM_HAMMING) | ORB/BRISK | ⚡⚡ | ★★★★ | 实时匹配 |
| BFMatcher (NORM_L2) | SIFT/SURF | ⚡ | ★★★★★ | 精确匹配 |
| FlannBasedMatcher | SIFT/SURF | ⚡⚡⚡ | ★★★★ | 大库检索 |
| BFMatcher crossCheck | 所有 binary | ⚡⚡ | ★★★★ | 精确双向匹配 |
| BFMatcher k=2 + ratio | SIFT | ⚡⚡ | ★★★★★ | 高质量匹配 |

### 匹配流程推荐

```
小型图像匹配（<1000 特征点）:
  BFMatcher (NORM_HAMMING for ORB / NORM_L2 for SIFT) + Lowe's ratio

大规模图像检索（>10000 特征点）:
  FlannBasedMatcher + Lowe's ratio + RANSAC

实时视频流匹配:
  ORB + BFMatcher (NORM_HAMMING) crossCheck

精确匹配（离线）:
  SIFT + FlannBasedMatcher (k=2) + Lowe's ratio + RANSAC
```

## 12.7 实用技巧

### 12.7.1 限制匹配数量

```python
# 太多特征点 → 匹配慢且可能更多误匹配
# 控制特征点数量
orb = cv2.ORB_create(nfeatures=500)

# 或用 goodFeaturesToTrack 限制
```

### 12.7.2 多尺度匹配（Pyramid）

```python
def pyramid_match(img1, img2, orb, levels=3):
    """多尺度特征匹配 — 处理尺度差异大的图像"""
    good_matches = []

    for level in range(levels):
        scale = 2 ** level
        s1 = cv2.resize(img1, None, fx=1/scale, fy=1/scale, interpolation=cv2.INTER_AREA)
        s2 = cv2.resize(img2, None, fx=1/scale, fy=1/scale, interpolation=cv2.INTER_AREA)

        kp1, des1 = orb.detectAndCompute(s1, None)
        kp2, des2 = orb.detectAndCompute(s2, None)

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        matches = bf.match(des1, des2)
        matches = sorted(matches, key=lambda x: x.distance)
        good_matches.extend(matches[:min(10, len(matches))])

    return good_matches
```

---

> 下一章：[第十三章 · 模板匹配](ch13-template-matching.md) →
