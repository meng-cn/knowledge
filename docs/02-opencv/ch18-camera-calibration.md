# 第十八章 · 相机标定与校正

## 18.1 相机模型

### 18.1.1 相机内参矩阵（Camera Matrix）

```
K = | fx   0  cx |
    |  0  fy  cy |
    |  0   0   1 |

fx, fy: 焦距（像素单位）
cx, cy: 光心（主点，通常在图像中心附近）
```

### 18.1.2 畸变系数（Distortion Coefficients）

```
径向畸变 (k1, k2, k3, k4, k5, k6): 桶形/枕形畸变
切向畸变 (p1, p2): 镜头安装不平行造成
```

### 18.1.3 坐标转换流程

```
世界坐标 (Xw, Yw, Zw)
    ↓ 旋转变换 R + 平移变换 t
相机坐标 (Xc, Yc, Zc)
    ↓ 投影 (x = fx*Xc/Zc, y = fy*Yc/Zc)
理想像素坐标 (x, y)
    ↓ 畸变校正
实际像素坐标 (x畸, y畸)
    ↓ 内参矩阵 K
图像像素坐标 (u, v)
```

## 18.2 棋盘标定（Checkerboard Calibration）

### 18.2.1 标定原理

用已知几何尺寸的棋盘格，在多个视角下拍摄，通过角点检测反推相机参数。

### 18.2.2 标定流程

```python
import cv2
import numpy as np

# ---- 准备标定对象 ----
# 定义棋盘格的物理尺寸（每个方格的真实尺寸）
square_size = 0.025  # 每个方格 2.5cm
board_size = (9, 6)  # 内角点数（9×6 = 54 个内角）

# 世界坐标系中的角点（Z=0 平面）
obj_points = np.zeros((board_size[0] * board_size[1], 3), np.float32)
obj_points[:, :2] = np.indices(board_size).T * square_size

# 收集多组标定数据
obj_points_list = []  # 世界坐标系中的角点（同一棋盘在不同视角下位置不变）
img_points_list = []  # 图像坐标系中的角点

n_images = 20  # 至少 10-20 张
for i in range(n_images):
    img = cv2.imread(f'calib_{i:03d}.jpg')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 检测内角点（棋盘格角点）
    found, corners = cv2.findChessboardCorners(
        gray, board_size,
        cv2.CALIB_CB_ADAPTIVE_THRESH +
        cv2.CALIB_CB_NORMALIZE_IMAGE +
        cv2.CALIB_CB_FAST_CHECK
    )

    if found:
        # 亚像素精化
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.1)
        corners_subpix = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        obj_points_list.append(obj_points)
        img_points_list.append(corners_subpix)

# ---- 执行标定 ----
# 返回: 内参矩阵、畸变系数、旋转向量、平移向量、重投影误差
ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
    obj_points_list, img_points_list, gray.shape[::-1],
    None, None  # 可传入初始内参和畸变系数
)

print(f"重投影误差: {ret:.4f}")
print(f"内参矩阵:\n{camera_matrix}")
print(f"畸变系数: {dist_coeffs.ravel()}")

# ---- 保存结果 ----
np.savez('calibration.npz',
         camera_matrix=camera_matrix,
         dist_coeffs=dist_coeffs,
         rvecs=rvecs,
         tvecs=tvecs)
```

### 18.2.3 标定标志位详解

| 标志 | 说明 |
|------|--|
| `CALIB_USE_INTRINSIC_GUESS` | 使用提供的内参初值 |
| `CALIB_FIX_FOCAL_LENGTH` | 固定 fx=fy |
| `CALIB_FIX_PRINCIPAL_POINT` | 固定主点位置 |
| `CALIB_FIX_ASPECT_RATIO` | 固定 fx/fy 比率 |
| `CALIB_ZERO_TANGENT_DIST` | 切向畸变=0 |
| `CALIB_FIX_K1-K6` | 固定对应畸变系数 |
| `CALIB_RATIONAL_MODEL` | 使用全模型 k1-k6 + p1-p2 |

## 18.3 畸变校正

### 18.3.1 简单校正

```python
# 使用标定的参数对图像去畸变
undistorted = cv2.undistort(img, camera_matrix, dist_coeffs)

# 或手动校正
img_undistorted = cv2.undistort(img, K, D)
```

### 18.3.2 高质量校正 + ROI

```python
# 获取最佳新内参矩阵（可以裁剪掉畸变边缘）
new_K, roi = cv2.getOptimalNewCameraMatrix(
    camera_matrix, dist_coeffs, img.shape[:2], 1.0, img.shape[:2]
)
# new_K: 新的内参矩阵
# roi: (x, y, w, h) — 有效区域（可裁剪的部分）

# 初始化重映射表
map1, map2 = cv2.initUndistortRectifyMap(
    camera_matrix, dist_coeffs, None, new_K,
    img.shape[:2], cv2.CV_32FC1
)

# 应用映射
undistorted = cv2.remap(img, map1, map2, cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_CONSTANT,
                         borderValue=(0, 0, 0))

# 裁剪无效区域
x, y, w, h = roi
undistorted_cropped = undistorted[y:y+h, x:x+w]
```

## 18.4 鱼眼相机标定

```python
# ---- 鱼眼相机标定 ----
# 鱼眼模型 = 径向畸变 + 透视投影模型
# OpenCV 的鱼眼标定使用 fisheye 模块

image_points_list = []  # 图像角点
object_points_list = []  # 世界角点

# 检测圆点（圆点比棋盘格更稳定）
found, centers = cv2.findCirclesGrid(img, (7, 7))
if found:
    image_points_list.append(centers)
    object_points_list.append(obj_points)

# 鱼眼相机标定
ret, K, D, rvecs, tvecs = cv2.fisheye.calibrate(
    object_points_list, image_points_list, img.shape[:2],
    K, D, rvecs, tvecs,
    cv2.fisheye.CALIB_RECOMPUTE_EXTRINSIC +
    cv2.fisheye.CALIB_CHECK_FISHEYE_MODEL +
    cv2.fisheye.CALIB_FIX_SKEW
)

# 去畸变
undistorted = cv2.fisheye.undistortImage(img, K, D, K2=K)
```

## 18.5 自标定（Self-Calibration）

```python
# ---- 自标定（不需要标定板）----
# 使用 Homography 和 Focal Length 约束
# 适用于没有标定板的情况
# 需多个视角且相机只旋转不平移

# 基础矩阵 → 本质矩阵 → 相机矩阵分解
# 具体实现较复杂，建议用标定板
```

## 18.6 标定质量评估

```python
# ---- 重投影误差评估 ----
total_error = 0
total_points = 0

for i in range(len(img_points_list)):
    # 重投影
    img_points_reprojected, _ = cv2.projectPoints(
        obj_points_list[i], rvecs[i], tvecs[i],
        camera_matrix, dist_coeffs
    )
    # 计算误差
    error = cv2.norm(img_points_list[i], img_points_reprojected, cv2.NORM_L2) / len(img_points_list[i])
    total_error += error * len(img_points_list[i])
    total_points += len(img_points_list[i])

avg_error = total_error / total_points
print(f"平均重投影误差: {avg_error:.4f} pixels")

# 精度评估:
# < 0.5px: 优秀
# 0.5-1.0px: 良好
# 1.0-2.0px: 可接受
# > 2.0px: 需要重新标定
```

## 18.7 相机标定速查

| 步骤 | 函数 | 说明 |
|------|--|--|
| 角点检测 | `findChessboardCorners` | 检测棋盘格角点 |
| 亚像素精化 | `cornerSubPix` | 亚像素精度 |
| 标定 | `calibrateCamera` | 标定内参+畸变 |
| 鱼眼标定 | `fisheye.calibrate` | 鱼眼相机 |
| 去畸变 | `undistort` / `fisheye.undistortImage` | 校正 |
| 最优内参 | `getOptimalNewCameraMatrix` | 获取新内参 |
| 重映射初始化 | `initUndistortRectifyMap` | 初始化映射表 |
| 校正 | `remap` | 应用校正 |

---
