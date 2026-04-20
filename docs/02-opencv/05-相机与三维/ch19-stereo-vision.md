# 第十九章 · 立体视觉与深度估计

## 19.1 双目视觉基础

### 19.1.1 三角测距原理

```
     相机1(O1)          相机2(O2)
        \                  /
         \ d1           d2/
          \              /
           ◇------------◇  场景点 P
           |<------ b ---->|
                基线

深度 Z = (f × b) / disparity
```

- **f**: 焦距（像素）
- **b**: 基线长度（两相机间距）
- **d**: 视差（左图 x1 - 右图 x2）

### 19.1.2 双目系统要求

| 要求 | 说明 |
|------|--|
| 标定 | 两个相机分别标定 + 双目标定 |
| 极线校正 | 两图像共面（行对齐） |
| 匹配 | 同名点在极线上寻找对应 |

## 19.2 双目标定与极线校正

```python
import cv2
import numpy as np

# ---- 1. 分别标定两个相机 ----
ret_L, K_L, D_L, rvecs_L, tvecs_L = cv2.calibrateCamera(...)
ret_R, K_R, D_R, rvecs_R, tvecs_R = cv2.calibrateCamera(...)

# ---- 2. 双目标定 ----
# stereo_calib_data: (obj_points, img_points_L, img_points_R)
# 每对图像中，两相机看到的角点索引相同

stereo_flags = (cv2.CALIB_FIX_INTRINSIC |  # 固定内参
                cv2.CALIB_USE_INTRINSIC_GUESS)

ret, K1, D1, K2, D2, R, T, E, F = cv2.stereoCalibrate(
    obj_points_list, img_points_L, img_points_R,
    K_L, D_L, K_R, D_R,
    image_size, flags=stereo_flags
)

# 返回值:
# R: 旋转矩阵（相机2相对相机1的旋转）
# T: 平移向量（基线）
# E: 本质矩阵
# F: 基础矩阵

# ---- 3. 极线校正 ----
# 计算校正映射表
R1, R2, P1, P2, Q, roi1, roi2 = cv2.stereoRectify(
    K1, D1, K2, D2, image_size, R, T, flags=cv2.CALIB_ZERO_DISPARITY
)

# P1, P2: 校正后的投影矩阵（3×4）
# Q: 重投影矩阵（深度→3D）
# roi1, roi2: 有效区域

# ---- 4. 初始化校正映射 ----
map1x, map1y = cv2.initUndistortRectifyMap(K1, D1, R1, P1, image_size, cv2.CV_32FC1)
map2x, map2y = cv2.initUndistortRectifyMap(K2, D2, R2, P2, image_size, cv2.CV_32FC1)

# 应用校正
left_rect = cv2.remap(left_img, map1x, map1y, cv2.INTER_LINEAR)
right_rect = cv2.remap(right_img, map2x, map2y, cv2.INTER_LINEAR)
```

### 19.2.1 极线校正可视化

```python
def visualize_epipolar_lines(left_img, right_img, map1x, map1y, map2x, map2y):
    """可视化极线对齐效果"""
    # 左图随机采样点
    n_points = 100
    h, w = left_img.shape[:2]
    ys = np.random.randint(0, h, n_points)
    xs = np.random.randint(0, w, n_points)

    # 应用校正映射到采样点
    rect_left_x = map1x[ys, xs].astype(int)
    rect_left_y = map1y[ys, xs].astype(int)

    # 绘制极线（水平线）
    img_vis = left_img.copy()
    for x, y in zip(rect_left_x, rect_left_y):
        cv2.line(img_vis, (x, y), (w-1, y), (0, 255, 0), 1)

    cv2.imshow('Epipolar Lines', img_vis)
    # 校正后，同名点应在同一行上
```

## 19.3 立体匹配（Stereo Matching）

### 19.3.1 SGBM（Semi-Global Block Matching）

```python
# ---- SGBM 立体匹配 ----
stereo = cv2.StereoSGBM_create(
    minDisparity=0,         # 最小视差
    numDisparities=16 * 16, # 视差范围（必须是 16 的倍数）
    blockSize=5,            # 块大小
    P1=8 * 3 * 5 * 5,      # 平滑项系数1
    P2=32 * 3 * 5 * 5,     # 平滑项系数2（P2 > P1）
    disp12MaxDiff=1,        # 左右一致性检查最大差值
    preFilterCap=63,        # 预处理截断值
    uniquenessRatio=10,     # 唯一性阈值
    speckleWindowSize=100,  # 视差变化窗口
    speckleRange=32         # 视差变化范围
)

disparity = stereo.compute(left_rect, right_rect)
# disparity: CV_16S 格式 — 值 = 真实视差 × 16
disparity_f = disparity.astype(np.float32) / 16.0

# 可视化
disparity_norm = cv2.normalize(disparity_f, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8UC1)
disparity_color = cv2.applyColorMap(disparity_norm.astype(np.uint8), cv2.COLORMAP_JET)
```

### 19.3.2 BM（Block Matching）

```python
# ---- BM 立体匹配（快速但精度较低）----
stereo_bm = cv2.StereoBM_create(
    numDisparities=16 * 16,
    blockSize=15
)
disparity_bm = stereo_bm.compute(left_rect, right_rect)
```

### 19.3.3 SGBM vs BM 对比

| 特性 | SGBM | BM |
|------|--|---|
| 精度 | ★★★★ | ★★★★ |
| 速度 | ⚡⚡ | ⚡⚡⚡ |
| 内存 | 高 | 低 |
| 深度质量 | 高（全局优化） | 中 |
| 推荐 | 离线/高精度 | 实时/嵌入式 |

## 19.4 视差图 → 深度图

### 19.4.1 使用 Q 矩阵重投影

```python
# Q 矩阵在 stereoRectify 中计算
# Q = | 1  0  0 -cx |
#     | 0  1  0 -cy |
#     | 0  0  0  f  |
#     | 0  0 -1/T  0 |

# 视差图 → 3D 点云
# 方法1: convertMaps + reprojectImageTo3D
xyz = cv2.reprojectImageTo3D(disparity, Q, handleMissingValues=True)
# xyz[y, x] = (X, Y, Z) — 相对于左相机坐标系

# 方法2: 手动计算
f = P1[0, 0]  # 焦距
T = -T[0]     # 基线（取绝对值）
disparity_valid = np.where(disparity_f > 0, disparity_f, 1)  # 避免除零
depth = (f * T) / disparity_valid
```

### 19.4.2 3D 点云可视化

```python
# 将深度图转为 3D 点云
def disparity_to_pointcloud(disparity, Q):
    """视差图 → 3D 点云"""
    xyz = cv2.reprojectImageTo3D(disparity, Q)
    h, w = disparity.shape[:2]

    points = []
    colors = []
    for y in range(h):
        for x in range(w):
            d = disparity[y, x]
            if d > 0:  # 有效深度
                points.append([xyz[y, x, 0], xyz[y, x, 1], xyz[y, x, 2]])
                # colors.append(img_gray[y, x])  # 可附加颜色
    return np.array(points)

pointcloud = disparity_to_pointcloud(disparity_f, Q)
print(f"点云数量: {len(pointcloud)}")
# 输出: (N, 3) 的数组
```

## 19.5 立体深度估计管线总结

```
左图像 + 右图像（已标定、已校正）
    ↓
立体匹配 (SGBM/BM) → 视差图
    ↓
Q 矩阵 → 深度/3D坐标
    ↓
3D 点云 / 深度图
```

## 19.6 双目视觉速查表

| 步骤 | 函数 | 输出 |
|------|--|--|
| 分别标定 | `calibrateCamera` | K, D |
| 双目标定 | `stereoCalibrate` | R, T, E, F |
| 极线校正 | `stereoRectify` | R1, R2, P1, P2, Q |
| 初始化映射 | `initUndistortRectifyMap` | map1x, map1y |
| 极线校正 | `remap` | rectified images |
| 立体匹配 | `StereoSGBM_compute` | 视差图 |
| 视差→3D | `reprojectImageTo3D` | XYZ 点云 |

---
